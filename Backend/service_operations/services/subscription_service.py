

# """
# Service Operations - Subscription Service
# Production-ready subscription lifecycle management with circuit breaker, retry logic, and comprehensive error handling
# """

# import logging
# from typing import Dict, List, Optional, Tuple, Any
# from django.core.cache import cache
# from django.db import transaction
# from django.db.models import Q, Count, Sum, Avg, F, ExpressionWrapper, DurationField
# from django.utils import timezone
# from decimal import Decimal
# import json
# from django.conf import settings
# from collections import defaultdict
# import threading
# import time

# from service_operations.models import Subscription, UsageTracking, ClientOperation, ActivationQueue, OperationLog
# from service_operations.services.activation_service import ActivationService
# from service_operations.services.queue_service import QueueService
# from service_operations.adapters.internet_plans_adapter import InternetPlansAdapter
# from service_operations.adapters.network_adapter import NetworkAdapter
# from service_operations.adapters.payment_adapter import PaymentAdapter
# from service_operations.utils.validators import validate_mac_address, validate_duration_hours
# from service_operations.utils.calculators import calculate_usage_percentage, format_bytes_human_readable

# logger = logging.getLogger(__name__)


# class SubscriptionService:
#     """
#     Production-ready subscription management service
#     Core business logic for subscription lifecycle with comprehensive monitoring
#     """
    
#     # Circuit breaker configuration
#     CIRCUIT_BREAKER_THRESHOLD = 3
#     CIRCUIT_BREAKER_TIMEOUT = 300
#     MAX_CONCURRENT_OPERATIONS = 10
    
#     # Class-level state
#     _circuit_state = 'closed'  # closed, open, half-open
#     _failure_count = 0
#     _circuit_opened_at = None
#     _active_operations = 0
#     _circuit_lock = threading.Lock()
#     _operation_lock = threading.Lock()
    
#     @classmethod
#     def _check_circuit_breaker(cls) -> str:
#         """Check circuit breaker state with thread safety"""
#         with cls._circuit_lock:
#             if cls._circuit_state == 'open':
#                 if cls._circuit_opened_at:
#                     time_open = (timezone.now() - cls._circuit_opened_at).total_seconds()
#                     if time_open > cls.CIRCUIT_BREAKER_TIMEOUT:
#                         cls._circuit_state = 'half-open'
#                         cls._circuit_opened_at = None
#                         logger.info("Subscription service circuit moved to half-open")
            
#             return cls._circuit_state
    
#     @classmethod
#     def _record_failure(cls):
#         """Record failure for circuit breaker"""
#         with cls._circuit_lock:
#             cls._failure_count += 1
            
#             if cls._failure_count >= cls.CIRCUIT_BREAKER_THRESHOLD:
#                 cls._circuit_state = 'open'
#                 cls._circuit_opened_at = timezone.now()
#                 logger.error(f"Subscription service circuit opened after {cls._failure_count} failures")
    
#     @classmethod
#     def _reset_circuit_breaker(cls):
#         """Reset circuit breaker on success"""
#         with cls._circuit_lock:
#             cls._failure_count = 0
#             if cls._circuit_state != 'closed':
#                 cls._circuit_state = 'closed'
#                 cls._circuit_opened_at = None
#                 logger.info("Subscription service circuit reset to closed")
    
#     @classmethod
#     def _can_start_operation(cls) -> bool:
#         """Check concurrent operation limit"""
#         with cls._operation_lock:
#             if cls._active_operations < cls.MAX_CONCURRENT_OPERATIONS:
#                 cls._active_operations += 1
#                 return True
#             return False
    
#     @classmethod
#     def _release_operation_slot(cls):
#         """Release operation slot"""
#         with cls._operation_lock:
#             if cls._active_operations > 0:
#                 cls._active_operations -= 1
    
#     @classmethod
#     def create_subscription(
#         cls,
#         client_id: str,
#         internet_plan_id: str,
#         client_type: str,
#         access_method: str = 'hotspot',
#         duration_hours: int = 24,
#         router_id: Optional[int] = None,
#         hotspot_mac_address: Optional[str] = None,
#         pppoe_username: Optional[str] = None,
#         pppoe_password: Optional[str] = None,
#         scheduled_activation: Optional[timezone.datetime] = None,
#         auto_renew: bool = False,
#         metadata: Optional[Dict] = None,
#         created_by: str = 'system'
#     ) -> Dict[str, Any]:
#         """
#         Create a new subscription with comprehensive validation and error handling
#         """
#         # Check circuit breaker
#         circuit_status = cls._check_circuit_breaker()
#         if circuit_status != 'closed':
#             return cls._handle_circuit_blocked('create_subscription', circuit_status)
        
#         # Check concurrent operations
#         if not cls._can_start_operation():
#             return {
#                 'success': False,
#                 'error': 'Maximum concurrent operations reached',
#                 'suggestion': 'Try again in a few moments',
#                 'timestamp': timezone.now().isoformat()
#             }
        
#         try:
#             # Validate inputs
#             validation_result = cls._validate_subscription_creation_data(
#                 client_id=client_id,
#                 internet_plan_id=internet_plan_id,
#                 client_type=client_type,
#                 access_method=access_method,
#                 duration_hours=duration_hours,
#                 hotspot_mac_address=hotspot_mac_address,
#                 pppoe_username=pppoe_username,
#                 pppoe_password=pppoe_password
#             )
            
#             if not validation_result['valid']:
#                 return {
#                     'success': False,
#                     'error': 'Validation failed',
#                     'details': validation_result['errors'],
#                     'timestamp': timezone.now().isoformat()
#                 }
            
#             with transaction.atomic():
#                 # Get plan technical configuration
#                 plan_config = cls._get_plan_configuration(internet_plan_id, access_method)
                
#                 if not plan_config.get('available', True):
#                     return {
#                         'success': False,
#                         'error': 'Selected plan is not available',
#                         'plan_id': internet_plan_id,
#                         'timestamp': timezone.now().isoformat()
#                     }
                
#                 # Calculate dates
#                 start_date = timezone.now()
#                 end_date = start_date + timezone.timedelta(hours=duration_hours)
                
#                 # Prepare subscription data
#                 subscription_data = {
#                     'client_id': client_id,
#                     'internet_plan_id': internet_plan_id,
#                     'client_type': client_type,
#                     'access_method': access_method,
#                     'router_id': router_id,
#                     'hotspot_mac_address': hotspot_mac_address,
#                     'pppoe_username': pppoe_username,
#                     'pppoe_password': pppoe_password,
#                     'start_date': start_date,
#                     'end_date': end_date,
#                     'scheduled_activation': scheduled_activation,
#                     'status': 'draft',
#                     'data_limit_bytes': plan_config.get('data_limit_bytes', 10 * 1024 * 1024 * 1024),  # 10GB default
#                     'time_limit_seconds': plan_config.get('time_limit_seconds', 24 * 3600),  # 24 hours default
#                     'used_data_bytes': 0,
#                     'used_time_seconds': 0,
#                     'auto_renew': auto_renew,
#                     'metadata': {
#                         'created_by': created_by,
#                         'plan_name': plan_config.get('name', 'Unknown'),
#                         'duration_hours': duration_hours,
#                         'technical_config': plan_config.get('technical_config', {}),
#                         **(metadata or {})
#                     }
#                 }
                
#                 # Create subscription
#                 subscription = Subscription.objects.create(**subscription_data)
                
#                 # Create client operation record
#                 ClientOperation.objects.create(
#                     client_id=client_id,
#                     client_type=client_type,
#                     subscription=subscription,
#                     operation_type='subscription_creation',
#                     title=f'Subscription Created - {plan_config.get("name", "Unknown Plan")}',
#                     description=f'New subscription created for {client_type} client',
#                     source_platform='system',
#                     priority=2,
#                     metadata={
#                         'plan_id': internet_plan_id,
#                         'duration_hours': duration_hours,
#                         'auto_renew': auto_renew,
#                         'created_by': created_by
#                     }
#                 )
                
#                 # Log operation
#                 OperationLog.log_operation(
#                     operation_type='subscription_created',
#                     severity='info',
#                     subscription=subscription,
#                     description=f'Subscription created successfully',
#                     details={
#                         'client_id': client_id,
#                         'plan_id': internet_plan_id,
#                         'client_type': client_type,
#                         'access_method': access_method,
#                         'duration_hours': duration_hours
#                     },
#                     source_module='subscription_service',
#                     source_function='create_subscription',
#                     duration_ms=0
#                 )
                
#                 # Clear cache
#                 cache.delete_pattern(f'subscriptions:client:{client_id}:*')
#                 cache.delete_pattern('subscription_stats:*')
                
#                 # Reset circuit breaker
#                 cls._reset_circuit_breaker()
                
#                 logger.info(f"Subscription created: {subscription.id} for client {client_id}")
                
#                 return {
#                     'success': True,
#                     'subscription_id': str(subscription.id),
#                     'subscription': {
#                         'id': str(subscription.id),
#                         'status': subscription.status,
#                         'start_date': subscription.start_date.isoformat(),
#                         'end_date': subscription.end_date.isoformat(),
#                         'client_type': subscription.client_type,
#                         'access_method': subscription.access_method,
#                         'data_limit_bytes': subscription.data_limit_bytes,
#                         'time_limit_seconds': subscription.time_limit_seconds
#                     },
#                     'message': 'Subscription created successfully',
#                     'timestamp': timezone.now().isoformat()
#                 }
                
#         except Exception as e:
#             logger.error(f"Failed to create subscription: {e}", exc_info=True)
#             cls._record_failure()
            
#             OperationLog.log_operation(
#                 operation_type='subscription_creation_failed',
#                 severity='error',
#                 description=f'Subscription creation failed: {str(e)}',
#                 details={
#                     'client_id': client_id,
#                     'plan_id': internet_plan_id,
#                     'client_type': client_type,
#                     'error': str(e)
#                 },
#                 source_module='subscription_service',
#                 source_function='create_subscription'
#             )
            
#             return {
#                 'success': False,
#                 'error': 'Failed to create subscription',
#                 'details': str(e) if settings.DEBUG else 'Internal server error',
#                 'timestamp': timezone.now().isoformat()
#             }
        
#         finally:
#             cls._release_operation_slot()
    
#     @classmethod
#     def _validate_subscription_creation_data(
#         cls,
#         client_id: str,
#         internet_plan_id: str,
#         client_type: str,
#         access_method: str,
#         duration_hours: int,
#         hotspot_mac_address: Optional[str] = None,
#         pppoe_username: Optional[str] = None,
#         pppoe_password: Optional[str] = None
#     ) -> Dict[str, Any]:
#         """Validate subscription creation data"""
#         errors = {}
        
#         # Validate client type
#         valid_client_types = ['hotspot_client', 'pppoe_client']
#         if client_type not in valid_client_types:
#             errors['client_type'] = f'Invalid client type. Must be one of: {", ".join(valid_client_types)}'
        
#         # Validate access method
#         if access_method not in ['hotspot', 'pppoe']:
#             errors['access_method'] = 'Invalid access method. Must be "hotspot" or "pppoe"'
        
#         # Validate client type and access method consistency
#         if client_type == 'hotspot_client' and access_method != 'hotspot':
#             errors['access_method'] = 'Hotspot clients must use hotspot access method'
#         elif client_type == 'pppoe_client' and access_method != 'pppoe':
#             errors['access_method'] = 'PPPoE clients must use PPPoE access method'
        
#         # Validate MAC address for hotspot
#         if client_type == 'hotspot_client':
#             if not hotspot_mac_address:
#                 errors['hotspot_mac_address'] = 'MAC address required for hotspot clients'
#             elif not validate_mac_address(hotspot_mac_address):
#                 errors['hotspot_mac_address'] = 'Invalid MAC address format'
        
#         # Validate PPPoE credentials
#         if client_type == 'pppoe_client':
#             if not pppoe_username:
#                 errors['pppoe_username'] = 'PPPoE username required'
#             if not pppoe_password:
#                 errors['pppoe_password'] = 'PPPoE password required'
#             elif len(pppoe_password) < 8:
#                 errors['pppoe_password'] = 'PPPoE password must be at least 8 characters'
        
#         # Validate duration
#         if not validate_duration_hours(duration_hours):
#             errors['duration_hours'] = 'Duration must be between 1 and 744 hours (31 days)'
        
#         return {
#             'valid': len(errors) == 0,
#             'errors': errors
#         }
    
#     @classmethod
#     def _get_plan_configuration(cls, plan_id: str, access_method: str) -> Dict[str, Any]:
#         """Get plan configuration from internet plans adapter"""
#         try:
#             config = InternetPlansAdapter.get_plan_technical_config(plan_id, access_method)
            
#             if not config:
#                 logger.warning(f"No configuration found for plan {plan_id}, using defaults")
#                 return cls._get_default_plan_config(access_method)
            
#             return {
#                 'available': True,
#                 'name': config.get('name', 'Unknown Plan'),
#                 'data_limit_bytes': config.get('data_limit', {}).get('bytes', 10 * 1024 * 1024 * 1024),
#                 'time_limit_seconds': config.get('time_limit', {}).get('seconds', 24 * 3600),
#                 'technical_config': config
#             }
            
#         except Exception as e:
#             logger.error(f"Failed to get plan configuration: {e}")
#             return cls._get_default_plan_config(access_method)
    
#     @classmethod
#     def _get_default_plan_config(cls, access_method: str) -> Dict[str, Any]:
#         """Get default plan configuration when adapter fails"""
#         return {
#             'available': True,
#             'name': 'Default Plan',
#             'data_limit_bytes': 10 * 1024 * 1024 * 1024,  # 10GB
#             'time_limit_seconds': 24 * 3600,  # 24 hours
#             'technical_config': {
#                 'access_method': access_method,
#                 'created_at': timezone.now().isoformat(),
#                 'is_default': True
#             }
#         }
    
#     @classmethod
#     def activate_subscription(
#         cls,
#         subscription_id: str,
#         payment_reference: str,
#         payment_method: str,
#         activate_immediately: bool = True,
#         priority: int = 4
#     ) -> Dict[str, Any]:
#         """
#         Activate subscription after payment confirmation
#         """
#         # Check circuit breaker
#         circuit_status = cls._check_circuit_breaker()
#         if circuit_status != 'closed':
#             return cls._handle_circuit_blocked('activate_subscription', circuit_status)
        
#         try:
#             with transaction.atomic():
#                 # Get subscription with lock
#                 subscription = Subscription.objects.select_for_update().get(
#                     id=subscription_id,
#                     is_active=True
#                 )
                
#                 # Validate subscription can be activated
#                 if not subscription.can_be_activated:
#                     return {
#                         'success': False,
#                         'error': 'Subscription cannot be activated',
#                         'reason': f'Current status: {subscription.status}',
#                         'subscription_id': subscription_id,
#                         'timestamp': timezone.now().isoformat()
#                     }
                
#                 # Verify payment via payment adapter
#                 payment_result = PaymentAdapter.verify_payment(payment_reference)
                
#                 if not payment_result.get('success'):
#                     return {
#                         'success': False,
#                         'error': 'Payment verification failed',
#                         'payment_error': payment_result.get('error'),
#                         'subscription_id': subscription_id,
#                         'timestamp': timezone.now().isoformat()
#                     }
                
#                 # Update subscription with payment info
#                 subscription.payment_reference = payment_reference
#                 subscription.payment_method = payment_method
#                 subscription.payment_confirmed_at = timezone.now()
#                 subscription.status = 'pending_activation'
#                 subscription.save(update_fields=[
#                     'payment_reference', 'payment_method',
#                     'payment_confirmed_at', 'status', 'updated_at'
#                 ])
                
#                 # Create client operation
#                 ClientOperation.objects.create(
#                     client_id=subscription.client_id,
#                     client_type=subscription.client_type,
#                     subscription=subscription,
#                     operation_type='payment_verification',
#                     title=f'Payment Verified - {payment_reference}',
#                     description=f'Payment verified via {payment_method}',
#                     source_platform='system',
#                     priority=3,
#                     status='completed',
#                     result_data={
#                         'payment_reference': payment_reference,
#                         'payment_method': payment_method,
#                         'verified_at': timezone.now().isoformat()
#                     }
#                 )
                
#                 # Request activation
#                 if activate_immediately:
#                     activation_result = ActivationService.request_subscription_activation(subscription)
                    
#                     if activation_result.get('success'):
#                         # Create activation queue item
#                         ActivationQueue.objects.create(
#                             subscription=subscription,
#                             activation_type='initial',
#                             priority=priority,
#                             metadata={
#                                 'payment_reference': payment_reference,
#                                 'payment_method': payment_method,
#                                 'activated_by_service': 'subscription_service'
#                             }
#                         )
                        
#                         OperationLog.log_operation(
#                             operation_type='subscription_activation_requested',
#                             severity='info',
#                             subscription=subscription,
#                             description=f'Activation requested for subscription',
#                             details={
#                                 'payment_reference': payment_reference,
#                                 'priority': priority,
#                                 'queue_created': True
#                             },
#                             source_module='subscription_service',
#                             source_function='activate_subscription'
#                         )
#                     else:
#                         logger.error(f"Activation request failed: {activation_result.get('error')}")
                
#                 # Clear cache
#                 cache.delete(f'subscription:{subscription_id}:detail')
#                 cache.delete_pattern(f'subscriptions:client:{subscription.client_id}:*')
                
#                 # Reset circuit breaker
#                 cls._reset_circuit_breaker()
                
#                 logger.info(f"Subscription activated: {subscription_id} with payment {payment_reference}")
                
#                 return {
#                     'success': True,
#                     'subscription_id': subscription_id,
#                     'status': subscription.status,
#                     'activation_requested': activate_immediately,
#                     'payment_verified': True,
#                     'message': 'Subscription activated successfully',
#                     'timestamp': timezone.now().isoformat()
#                 }
                
#         except Subscription.DoesNotExist:
#             logger.error(f"Subscription not found: {subscription_id}")
#             return {
#                 'success': False,
#                 'error': 'Subscription not found',
#                 'subscription_id': subscription_id,
#                 'timestamp': timezone.now().isoformat()
#             }
            
#         except Exception as e:
#             logger.error(f"Failed to activate subscription {subscription_id}: {e}", exc_info=True)
#             cls._record_failure()
            
#             OperationLog.log_operation(
#                 operation_type='subscription_activation_failed',
#                 severity='error',
#                 subscription_id=subscription_id,
#                 description=f'Subscription activation failed: {str(e)}',
#                 details={
#                     'subscription_id': subscription_id,
#                     'payment_reference': payment_reference,
#                     'error': str(e)
#                 },
#                 source_module='subscription_service',
#                 source_function='activate_subscription'
#             )
            
#             return {
#                 'success': False,
#                 'error': 'Failed to activate subscription',
#                 'subscription_id': subscription_id,
#                 'timestamp': timezone.now().isoformat()
#             }
    
#     @classmethod
#     def update_usage(
#         cls,
#         subscription_id: str,
#         data_used_bytes: int,
#         time_used_seconds: int,
#         session_id: Optional[str] = None,
#         device_id: Optional[str] = None,
#         network_metrics: Optional[Dict] = None
#     ) -> Dict[str, Any]:
#         """
#         Update subscription usage atomically with comprehensive validation
#         """
#         try:
#             with transaction.atomic():
#                 # Get subscription with lock
#                 subscription = Subscription.objects.select_for_update().get(
#                     id=subscription_id,
#                     is_active=True
#                 )
                
#                 # Validate usage data
#                 if data_used_bytes < 0 or time_used_seconds < 0:
#                     return {
#                         'success': False,
#                         'error': 'Usage values cannot be negative',
#                         'subscription_id': subscription_id,
#                         'timestamp': timezone.now().isoformat()
#                     }
                
#                 if data_used_bytes > 10 * 1024 * 1024 * 1024:  # 10GB per update
#                     return {
#                         'success': False,
#                         'error': 'Data usage too high for single update',
#                         'subscription_id': subscription_id,
#                         'timestamp': timezone.now().isoformat()
#                     }
                
#                 if time_used_seconds > 24 * 3600:  # 24 hours per update
#                     return {
#                         'success': False,
#                         'error': 'Time usage too high for single update',
#                         'subscription_id': subscription_id,
#                         'timestamp': timezone.now().isoformat()
#                     }
                
#                 # Update usage
#                 previous_data = subscription.used_data_bytes
#                 previous_time = subscription.used_time_seconds
                
#                 subscription.used_data_bytes += data_used_bytes
#                 subscription.used_time_seconds += time_used_seconds
#                 subscription.last_usage_update = timezone.now()
                
#                 # Update remaining limits
#                 if subscription.data_limit_bytes > 0:
#                     subscription.remaining_data_bytes = max(
#                         0,
#                         subscription.data_limit_bytes - subscription.used_data_bytes
#                     )
                
#                 if subscription.time_limit_seconds > 0:
#                     subscription.remaining_time_seconds = max(
#                         0,
#                         subscription.time_limit_seconds - subscription.used_time_seconds
#                     )
                
#                 # Check if limits exceeded
#                 if (subscription.remaining_data_bytes == 0 and subscription.data_limit_bytes > 0) or \
#                    (subscription.remaining_time_seconds == 0 and subscription.time_limit_seconds > 0):
#                     subscription.status = 'suspended'
#                     limit_exceeded = True
#                 else:
#                     limit_exceeded = False
                
#                 subscription.save()
                
#                 # Create usage tracking record
#                 usage_record = UsageTracking.objects.create(
#                     subscription=subscription,
#                     data_used_bytes=data_used_bytes,
#                     time_used_seconds=time_used_seconds,
#                     session_start=timezone.now() - timezone.timedelta(seconds=time_used_seconds),
#                     session_end=timezone.now(),
#                     metadata={
#                         'session_id': session_id,
#                         'device_id': device_id,
#                         'network_metrics': network_metrics or {},
#                         'previous_data': previous_data,
#                         'previous_time': previous_time
#                     }
#                 )
                
#                 # Log operation
#                 OperationLog.log_operation(
#                     operation_type='usage_updated',
#                     severity='info',
#                     subscription=subscription,
#                     description=f'Usage updated: {format_bytes_human_readable(data_used_bytes)} data, {time_used_seconds}s time',
#                     details={
#                         'data_used_bytes': data_used_bytes,
#                         'time_used_seconds': time_used_seconds,
#                         'remaining_data_bytes': subscription.remaining_data_bytes,
#                         'remaining_time_seconds': subscription.remaining_time_seconds,
#                         'limit_exceeded': limit_exceeded,
#                         'usage_record_id': str(usage_record.id)
#                     },
#                     source_module='subscription_service',
#                     source_function='update_usage',
#                     duration_ms=0
#                 )
                
#                 # Clear cache
#                 cache.delete(f'subscription:{subscription_id}:detail')
                
#                 logger.info(f"Usage updated for subscription {subscription_id}: +{data_used_bytes} bytes, +{time_used_seconds}s")
                
#                 return {
#                     'success': True,
#                     'subscription_id': subscription_id,
#                     'usage_record_id': str(usage_record.id),
#                     'usage': {
#                         'data_used_bytes': subscription.used_data_bytes,
#                         'time_used_seconds': subscription.used_time_seconds,
#                         'remaining_data_bytes': subscription.remaining_data_bytes,
#                         'remaining_time_seconds': subscription.remaining_time_seconds,
#                         'limit_exceeded': limit_exceeded
#                     },
#                     'status': subscription.status,
#                     'timestamp': timezone.now().isoformat()
#                 }
                
#         except Subscription.DoesNotExist:
#             logger.error(f"Subscription not found for usage update: {subscription_id}")
#             return {
#                 'success': False,
#                 'error': 'Subscription not found',
#                 'subscription_id': subscription_id,
#                 'timestamp': timezone.now().isoformat()
#             }
            
#         except Exception as e:
#             logger.error(f"Failed to update usage for subscription {subscription_id}: {e}", exc_info=True)
            
#             OperationLog.log_operation(
#                 operation_type='usage_update_failed',
#                 severity='error',
#                 subscription_id=subscription_id,
#                 description=f'Usage update failed: {str(e)}',
#                 details={
#                     'subscription_id': subscription_id,
#                     'data_used_bytes': data_used_bytes,
#                     'time_used_seconds': time_used_seconds,
#                     'error': str(e)
#                 },
#                 source_module='subscription_service',
#                 source_function='update_usage'
#             )
            
#             return {
#                 'success': False,
#                 'error': 'Failed to update usage',
#                 'subscription_id': subscription_id,
#                 'timestamp': timezone.now().isoformat()
#             }
    
#     @classmethod
#     def renew_subscription(
#         cls,
#         subscription_id: str,
#         new_plan_id: Optional[str] = None,
#         duration_hours: Optional[int] = None,
#         auto_renew: Optional[bool] = None,
#         renewal_strategy: str = 'immediate'
#     ) -> Dict[str, Any]:
#         """
#         Renew subscription with comprehensive error handling
#         """
#         try:
#             with transaction.atomic():
#                 # Get current subscription
#                 current_subscription = Subscription.objects.select_for_update().get(
#                     id=subscription_id,
#                     is_active=True
#                 )
                
#                 # Validate subscription can be renewed
#                 if current_subscription.status not in ['active', 'expired', 'suspended']:
#                     return {
#                         'success': False,
#                         'error': 'Subscription cannot be renewed',
#                         'reason': f'Invalid status: {current_subscription.status}',
#                         'subscription_id': subscription_id,
#                         'timestamp': timezone.now().isoformat()
#                     }
                
#                 # Determine new plan ID
#                 if not new_plan_id:
#                     new_plan_id = current_subscription.internet_plan_id
                
#                 # Get plan configuration
#                 plan_config = cls._get_plan_configuration(
#                     new_plan_id,
#                     current_subscription.access_method
#                 )
                
#                 if not plan_config.get('available', True):
#                     return {
#                         'success': False,
#                         'error': 'Selected plan is not available',
#                         'plan_id': new_plan_id,
#                         'subscription_id': subscription_id,
#                         'timestamp': timezone.now().isoformat()
#                     }
                
#                 # Determine duration
#                 if not duration_hours:
#                     duration_hours = 24  # Default 24 hours
                
#                 # Calculate start date based on renewal strategy
#                 if renewal_strategy == 'immediate' or current_subscription.is_expired:
#                     start_date = timezone.now()
#                 else:
#                     start_date = current_subscription.end_date or timezone.now()
                
#                 end_date = start_date + timezone.timedelta(hours=duration_hours)
                
#                 # Determine auto_renew
#                 if auto_renew is None:
#                     auto_renew = current_subscription.auto_renew
                
#                 # Create new subscription
#                 new_subscription = Subscription.objects.create(
#                     client_id=current_subscription.client_id,
#                     internet_plan_id=new_plan_id,
#                     client_type=current_subscription.client_type,
#                     access_method=current_subscription.access_method,
#                     router_id=current_subscription.router_id,
#                     hotspot_mac_address=current_subscription.hotspot_mac_address,
#                     pppoe_username=current_subscription.pppoe_username,
#                     pppoe_password=current_subscription.pppoe_password,
#                     start_date=start_date,
#                     end_date=end_date,
#                     status='draft',
#                     data_limit_bytes=plan_config.get('data_limit_bytes', 0),
#                     time_limit_seconds=plan_config.get('time_limit_seconds', 0),
#                     auto_renew=auto_renew,
#                     parent_subscription=current_subscription,
#                     metadata={
#                         'renewal_of': str(current_subscription.id),
#                         'renewal_strategy': renewal_strategy,
#                         'duration_hours': duration_hours,
#                         'plan_name': plan_config.get('name', 'Unknown'),
#                         'previous_status': current_subscription.status
#                     }
#                 )
                
#                 # Update current subscription
#                 if current_subscription.status == 'active':
#                     current_subscription.status = 'expired'
#                     current_subscription.save(update_fields=['status', 'updated_at'])
                
#                 # Create client operation
#                 ClientOperation.objects.create(
#                     client_id=current_subscription.client_id,
#                     client_type=current_subscription.client_type,
#                     subscription=new_subscription,
#                     operation_type='plan_renewal',
#                     title=f'Subscription Renewed - {plan_config.get("name", "Unknown Plan")}',
#                     description=f'Subscription renewed from {current_subscription.id}',
#                     source_platform='system',
#                     priority=2,
#                     metadata={
#                         'previous_subscription_id': str(current_subscription.id),
#                         'new_plan_id': new_plan_id,
#                         'duration_hours': duration_hours,
#                         'auto_renew': auto_renew,
#                         'renewal_strategy': renewal_strategy
#                     }
#                 )
                
#                 # Log operation
#                 OperationLog.log_operation(
#                     operation_type='subscription_renewed',
#                     severity='info',
#                     subscription=new_subscription,
#                     description=f'Subscription renewed successfully',
#                     details={
#                         'previous_subscription_id': str(current_subscription.id),
#                         'new_subscription_id': str(new_subscription.id),
#                         'plan_id': new_plan_id,
#                         'duration_hours': duration_hours,
#                         'renewal_strategy': renewal_strategy
#                     },
#                     source_module='subscription_service',
#                     source_function='renew_subscription'
#                 )
                
#                 # Clear cache
#                 cache.delete_pattern(f'subscriptions:client:{current_subscription.client_id}:*')
#                 cache.delete_pattern('subscription_stats:*')
                
#                 logger.info(f"Subscription renewed: {current_subscription.id} -> {new_subscription.id}")
                
#                 return {
#                     'success': True,
#                     'previous_subscription_id': str(current_subscription.id),
#                     'new_subscription_id': str(new_subscription.id),
#                     'new_subscription': {
#                         'id': str(new_subscription.id),
#                         'status': new_subscription.status,
#                         'start_date': new_subscription.start_date.isoformat(),
#                         'end_date': new_subscription.end_date.isoformat(),
#                         'plan_id': new_plan_id,
#                         'duration_hours': duration_hours
#                     },
#                     'message': 'Subscription renewed successfully',
#                     'timestamp': timezone.now().isoformat()
#                 }
                
#         except Subscription.DoesNotExist:
#             logger.error(f"Subscription not found for renewal: {subscription_id}")
#             return {
#                 'success': False,
#                 'error': 'Subscription not found',
#                 'subscription_id': subscription_id,
#                 'timestamp': timezone.now().isoformat()
#             }
            
#         except Exception as e:
#             logger.error(f"Failed to renew subscription {subscription_id}: {e}", exc_info=True)
            
#             OperationLog.log_operation(
#                 operation_type='subscription_renewal_failed',
#                 severity='error',
#                 subscription_id=subscription_id,
#                 description=f'Subscription renewal failed: {str(e)}',
#                 details={
#                     'subscription_id': subscription_id,
#                     'new_plan_id': new_plan_id,
#                     'error': str(e)
#                 },
#                 source_module='subscription_service',
#                 source_function='renew_subscription'
#             )
            
#             return {
#                 'success': False,
#                 'error': 'Failed to renew subscription',
#                 'subscription_id': subscription_id,
#                 'timestamp': timezone.now().isoformat()
#             }
    
#     @classmethod
#     def cancel_subscription(
#         cls,
#         subscription_id: str,
#         reason: str = "Cancelled by user",
#         cancelled_by: str = "system"
#     ) -> Dict[str, Any]:
#         """
#         Cancel subscription with comprehensive cleanup
#         """
#         try:
#             with transaction.atomic():
#                 subscription = Subscription.objects.select_for_update().get(id=subscription_id)
                
#                 # Update subscription
#                 previous_status = subscription.status
#                 subscription.status = 'cancelled'
#                 subscription.is_active = False
#                 subscription.save()
                
#                 # Cancel any pending activations
#                 try:
#                     ActivationService.cancel_activation(subscription_id, reason)
#                 except Exception as e:
#                     logger.warning(f"Failed to cancel activation for subscription {subscription_id}: {e}")
                
#                 # Create client operation
#                 ClientOperation.objects.create(
#                     client_id=subscription.client_id,
#                     client_type=subscription.client_type,
#                     subscription=subscription,
#                     operation_type='subscription_cancellation',
#                     title=f'Subscription Cancelled',
#                     description=f'Subscription cancelled: {reason}',
#                     source_platform='system',
#                     priority=3,
#                     status='completed',
#                     result_data={
#                         'previous_status': previous_status,
#                         'cancelled_by': cancelled_by,
#                         'reason': reason
#                     }
#                 )
                
#                 # Log operation
#                 OperationLog.log_operation(
#                     operation_type='subscription_cancelled',
#                     severity='info',
#                     subscription=subscription,
#                     description=f'Subscription cancelled successfully',
#                     details={
#                         'previous_status': previous_status,
#                         'cancelled_by': cancelled_by,
#                         'reason': reason
#                     },
#                     source_module='subscription_service',
#                     source_function='cancel_subscription'
#                 )
                
#                 # Clear cache
#                 cache.delete(f'subscription:{subscription_id}:detail')
#                 cache.delete_pattern(f'subscriptions:client:{subscription.client_id}:*')
#                 cache.delete_pattern('subscription_stats:*')
                
#                 logger.info(f"Subscription cancelled: {subscription_id} - {reason}")
                
#                 return {
#                     'success': True,
#                     'subscription_id': subscription_id,
#                     'previous_status': previous_status,
#                     'cancelled_by': cancelled_by,
#                     'message': 'Subscription cancelled successfully',
#                     'timestamp': timezone.now().isoformat()
#                 }
                
#         except Subscription.DoesNotExist:
#             logger.error(f"Subscription not found for cancellation: {subscription_id}")
#             return {
#                 'success': False,
#                 'error': 'Subscription not found',
#                 'subscription_id': subscription_id,
#                 'timestamp': timezone.now().isoformat()
#             }
            
#         except Exception as e:
#             logger.error(f"Failed to cancel subscription {subscription_id}: {e}", exc_info=True)
            
#             OperationLog.log_operation(
#                 operation_type='subscription_cancellation_failed',
#                 severity='error',
#                 subscription_id=subscription_id,
#                 description=f'Subscription cancellation failed: {str(e)}',
#                 details={
#                     'subscription_id': subscription_id,
#                     'reason': reason,
#                     'error': str(e)
#                 },
#                 source_module='subscription_service',
#                 source_function='cancel_subscription'
#             )
            
#             return {
#                 'success': False,
#                 'error': 'Failed to cancel subscription',
#                 'subscription_id': subscription_id,
#                 'timestamp': timezone.now().isoformat()
#             }
    
#     @classmethod
#     def get_subscription_details(cls, subscription_id: str) -> Dict[str, Any]:
#         """
#         Get comprehensive subscription details with caching
#         """
#         try:
#             # Check cache
#             cache_key = f'subscription:{subscription_id}:details'
#             cached_data = cache.get(cache_key)
            
#             if cached_data:
#                 logger.debug(f"Returning cached subscription details: {subscription_id}")
#                 return cached_data
            
#             # Get subscription with related data
#             subscription = Subscription.objects.select_related('parent_subscription').get(
#                 id=subscription_id,
#                 is_active=True
#             )
            
#             # Get plan details
#             plan_config = cls._get_plan_configuration(
#                 str(subscription.internet_plan_id),
#                 subscription.access_method
#             )
            
#             # Get usage records
#             usage_records = UsageTracking.objects.filter(
#                 subscription=subscription
#             ).order_by('-session_start')[:10]
            
#             # Get activation history
#             activation_history = ActivationQueue.objects.filter(
#                 subscription=subscription
#             ).order_by('-created_at')[:5]
            
#             # Get client operations
#             client_operations = ClientOperation.objects.filter(
#                 subscription=subscription
#             ).order_by('-created_at')[:5]
            
#             # Build comprehensive details
#             details = {
#                 'subscription': {
#                     'id': str(subscription.id),
#                     'client_id': str(subscription.client_id),
#                     'internet_plan_id': str(subscription.internet_plan_id),
#                     'client_type': subscription.client_type,
#                     'access_method': subscription.access_method,
#                     'status': subscription.status,
#                     'status_display': subscription.get_status_display(),
#                     'router_id': subscription.router_id,
#                     'hotspot_mac_address': subscription.hotspot_mac_address,
#                     'pppoe_username': subscription.pppoe_username,
#                     'start_date': subscription.start_date.isoformat() if subscription.start_date else None,
#                     'end_date': subscription.end_date.isoformat() if subscription.end_date else None,
#                     'scheduled_activation': subscription.scheduled_activation.isoformat() if subscription.scheduled_activation else None,
#                     'used_data_bytes': subscription.used_data_bytes,
#                     'used_time_seconds': subscription.used_time_seconds,
#                     'data_limit_bytes': subscription.data_limit_bytes,
#                     'time_limit_seconds': subscription.time_limit_seconds,
#                     'remaining_data_bytes': subscription.remaining_data_bytes,
#                     'remaining_time_seconds': subscription.remaining_time_seconds,
#                     'activation_attempts': subscription.activation_attempts,
#                     'activation_successful': subscription.activation_successful,
#                     'activation_error': subscription.activation_error,
#                     'activation_completed_at': subscription.activation_completed_at.isoformat() if subscription.activation_completed_at else None,
#                     'auto_renew': subscription.auto_renew,
#                     'payment_reference': subscription.payment_reference,
#                     'payment_method': subscription.payment_method,
#                     'payment_confirmed_at': subscription.payment_confirmed_at.isoformat() if subscription.payment_confirmed_at else None,
#                     'is_expired': subscription.is_expired,
#                     'can_be_activated': subscription.can_be_activated,
#                     'usage_percentage': subscription.usage_percentage,
#                     'parent_subscription_id': str(subscription.parent_subscription.id) if subscription.parent_subscription else None,
#                     'metadata': subscription.metadata,
#                     'created_at': subscription.created_at.isoformat(),
#                     'updated_at': subscription.updated_at.isoformat(),
#                     'last_usage_update': subscription.last_usage_update.isoformat() if subscription.last_usage_update else None
#                 },
#                 'plan_details': plan_config,
#                 'usage_summary': {
#                     'total_records': usage_records.count(),
#                     'recent_usage': [
#                         {
#                             'id': str(record.id),
#                             'data_used_bytes': record.data_used_bytes,
#                             'time_used_seconds': record.session_duration_seconds,
#                             'session_start': record.session_start.isoformat(),
#                             'session_end': record.session_end.isoformat(),
#                             'peak_data_rate': record.peak_data_rate,
#                             'avg_data_rate': record.avg_data_rate
#                         }
#                         for record in usage_records
#                     ]
#                 },
#                 'activation_history': {
#                     'total_attempts': activation_history.count(),
#                     'successful': activation_history.filter(status='completed').count(),
#                     'failed': activation_history.filter(status='failed').count(),
#                     'pending': activation_history.filter(status__in=['pending', 'processing', 'retrying']).count(),
#                     'recent': [
#                         {
#                             'id': str(act.id),
#                             'activation_type': act.activation_type,
#                             'status': act.status,
#                             'priority': act.priority,
#                             'error_message': act.error_message,
#                             'created_at': act.created_at.isoformat()
#                         }
#                         for act in activation_history
#                     ]
#                 },
#                 'client_operations': [
#                     {
#                         'id': str(op.id),
#                         'operation_type': op.operation_type,
#                         'status': op.status,
#                         'title': op.title,
#                         'created_at': op.created_at.isoformat()
#                     }
#                     for op in client_operations
#                 ],
#                 'health': {
#                     'can_be_activated': subscription.can_be_activated,
#                     'is_expired': subscription.is_expired,
#                     'remaining_data_percentage': calculate_usage_percentage(
#                         subscription.used_data_bytes,
#                         subscription.data_limit_bytes
#                     ) if subscription.data_limit_bytes > 0 else 0,
#                     'remaining_time_percentage': calculate_usage_percentage(
#                         subscription.used_time_seconds,
#                         subscription.time_limit_seconds
#                     ) if subscription.time_limit_seconds > 0 else 0
#                 },
#                 'timestamp': timezone.now().isoformat()
#             }
            
#             # Cache for 2 minutes
#             cache.set(cache_key, details, 120)
            
#             return details
            
#         except Subscription.DoesNotExist:
#             logger.error(f"Subscription not found for details: {subscription_id}")
#             return {
#                 'success': False,
#                 'error': 'Subscription not found',
#                 'subscription_id': subscription_id,
#                 'timestamp': timezone.now().isoformat()
#             }
            
#         except Exception as e:
#             logger.error(f"Failed to get subscription details {subscription_id}: {e}", exc_info=True)
#             return {
#                 'success': False,
#                 'error': 'Failed to get subscription details',
#                 'subscription_id': subscription_id,
#                 'timestamp': timezone.now().isoformat()
#             }
    
#     @classmethod
#     def get_subscriptions_for_client(
#         cls,
#         client_id: str,
#         status_filter: Optional[str] = None,
#         client_type_filter: Optional[str] = None,
#         active_only: bool = False,
#         limit: int = 50,
#         offset: int = 0
#     ) -> Dict[str, Any]:
#         """
#         Get subscriptions for a client with filtering and pagination
#         """
#         try:
#             # Check cache
#             cache_key = f'subscriptions:client:{client_id}:{status_filter}:{client_type_filter}:{active_only}:{limit}:{offset}'
#             cached_data = cache.get(cache_key)
            
#             if cached_data:
#                 logger.debug(f"Returning cached client subscriptions: {client_id}")
#                 return cached_data
            
#             # Build queryset
#             queryset = Subscription.objects.filter(
#                 client_id=client_id,
#                 is_active=True
#             )
            
#             # Apply filters
#             if status_filter:
#                 queryset = queryset.filter(status=status_filter)
            
#             if client_type_filter:
#                 queryset = queryset.filter(client_type=client_type_filter)
            
#             if active_only:
#                 queryset = queryset.filter(status='active')
            
#             # Get total count
#             total_count = queryset.count()
            
#             # Apply pagination
#             subscriptions = queryset.order_by('-created_at')[offset:offset + limit]
            
#             # Build response
#             result = {
#                 'success': True,
#                 'client_id': client_id,
#                 'subscriptions': [
#                     {
#                         'id': str(sub.id),
#                         'internet_plan_id': str(sub.internet_plan_id),
#                         'client_type': sub.client_type,
#                         'access_method': sub.access_method,
#                         'status': sub.status,
#                         'status_display': sub.get_status_display(),
#                         'start_date': sub.start_date.isoformat() if sub.start_date else None,
#                         'end_date': sub.end_date.isoformat() if sub.end_date else None,
#                         'used_data_bytes': sub.used_data_bytes,
#                         'data_limit_bytes': sub.data_limit_bytes,
#                         'used_time_seconds': sub.used_time_seconds,
#                         'time_limit_seconds': sub.time_limit_seconds,
#                         'remaining_data_bytes': sub.remaining_data_bytes,
#                         'remaining_time_seconds': sub.remaining_time_seconds,
#                         'is_expired': sub.is_expired,
#                         'can_be_activated': sub.can_be_activated,
#                         'usage_percentage': sub.usage_percentage,
#                         'payment_method': sub.payment_method,
#                         'auto_renew': sub.auto_renew,
#                         'created_at': sub.created_at.isoformat()
#                     }
#                     for sub in subscriptions
#                 ],
#                 'pagination': {
#                     'total': total_count,
#                     'limit': limit,
#                     'offset': offset,
#                     'has_more': (offset + limit) < total_count
#                 },
#                 'filters': {
#                     'status_filter': status_filter,
#                     'client_type_filter': client_type_filter,
#                     'active_only': active_only
#                 },
#                 'timestamp': timezone.now().isoformat()
#             }
            
#             # Cache for 1 minute
#             cache.set(cache_key, result, 60)
            
#             return result
            
#         except Exception as e:
#             logger.error(f"Failed to get subscriptions for client {client_id}: {e}", exc_info=True)
#             return {
#                 'success': False,
#                 'error': 'Failed to get subscriptions',
#                 'client_id': client_id,
#                 'timestamp': timezone.now().isoformat()
#             }
    
#     @classmethod
#     def process_expired_subscriptions(cls) -> Dict[str, Any]:
#         """
#         Process expired subscriptions (cron job)
#         """
#         try:
#             expired_subs = Subscription.objects.filter(
#                 status='active',
#                 is_active=True,
#                 end_date__lt=timezone.now()
#             )
            
#             processed_count = 0
#             failed_count = 0
            
#             for subscription in expired_subs:
#                 try:
#                     with transaction.atomic():
#                         subscription.status = 'expired'
#                         subscription.save(update_fields=['status', 'updated_at'])
                        
#                         # Create client operation
#                         ClientOperation.objects.create(
#                             client_id=subscription.client_id,
#                             client_type=subscription.client_type,
#                             subscription=subscription,
#                             operation_type='subscription_expired',
#                             title='Subscription Expired',
#                             description='Subscription expired automatically',
#                             source_platform='system',
#                             priority=1,
#                             metadata={
#                                 'expired_at': timezone.now().isoformat()
#                             }
#                         )
                        
#                         processed_count += 1
#                         logger.info(f"Subscription expired: {subscription.id}")
                        
#                 except Exception as e:
#                     logger.error(f"Failed to process expired subscription {subscription.id}: {e}")
#                     failed_count += 1
            
#             # Log batch operation
#             OperationLog.log_operation(
#                 operation_type='batch_subscription_expiry',
#                 severity='info',
#                 description=f'Processed {processed_count} expired subscriptions',
#                 details={
#                     'processed_count': processed_count,
#                     'failed_count': failed_count,
#                     'total_processed': processed_count + failed_count
#                 },
#                 source_module='subscription_service',
#                 source_function='process_expired_subscriptions'
#             )
            
#             return {
#                 'success': True,
#                 'processed_count': processed_count,
#                 'failed_count': failed_count,
#                 'total_processed': processed_count + failed_count,
#                 'message': f'Processed {processed_count} expired subscriptions',
#                 'timestamp': timezone.now().isoformat()
#             }
            
#         except Exception as e:
#             logger.error(f"Failed to process expired subscriptions: {e}", exc_info=True)
            
#             OperationLog.log_operation(
#                 operation_type='batch_subscription_expiry_failed',
#                 severity='error',
#                 description=f'Failed to process expired subscriptions: {str(e)}',
#                 details={'error': str(e)},
#                 source_module='subscription_service',
#                 source_function='process_expired_subscriptions'
#             )
            
#             return {
#                 'success': False,
#                 'error': 'Failed to process expired subscriptions',
#                 'timestamp': timezone.now().isoformat()
#             }
    
#     @classmethod
#     def auto_renew_subscriptions(cls) -> Dict[str, Any]:
#         """
#         Auto-renew subscriptions (cron job)
#         """
#         try:
#             # Find subscriptions nearing expiry with auto_renew enabled
#             renew_threshold = timezone.now() + timezone.timedelta(hours=24)
            
#             subscriptions_to_renew = Subscription.objects.filter(
#                 status='active',
#                 is_active=True,
#                 auto_renew=True,
#                 end_date__lte=renew_threshold,
#                 end_date__gt=timezone.now()
#             )
            
#             renewed_count = 0
#             failed_count = 0
            
#             for subscription in subscriptions_to_renew:
#                 try:
#                     result = cls.renew_subscription(
#                         subscription_id=str(subscription.id),
#                         renewal_strategy='after_expiry'
#                     )
                    
#                     if result.get('success'):
#                         renewed_count += 1
#                         logger.info(f"Auto-renewed subscription: {subscription.id}")
#                     else:
#                         failed_count += 1
#                         logger.error(f"Failed to auto-renew subscription {subscription.id}: {result.get('error')}")
                        
#                 except Exception as e:
#                     logger.error(f"Error auto-renewing subscription {subscription.id}: {e}")
#                     failed_count += 1
            
#             # Log batch operation
#             OperationLog.log_operation(
#                 operation_type='batch_auto_renew',
#                 severity='info',
#                 description=f'Auto-renewed {renewed_count} subscriptions',
#                 details={
#                     'renewed_count': renewed_count,
#                     'failed_count': failed_count,
#                     'total_processed': renewed_count + failed_count
#                 },
#                 source_module='subscription_service',
#                 source_function='auto_renew_subscriptions'
#             )
            
#             return {
#                 'success': True,
#                 'renewed_count': renewed_count,
#                 'failed_count': failed_count,
#                 'total_processed': renewed_count + failed_count,
#                 'message': f'Auto-renewed {renewed_count} subscriptions',
#                 'timestamp': timezone.now().isoformat()
#             }
            
#         except Exception as e:
#             logger.error(f"Failed to auto-renew subscriptions: {e}", exc_info=True)
            
#             OperationLog.log_operation(
#                 operation_type='batch_auto_renew_failed',
#                 severity='error',
#                 description=f'Failed to auto-renew subscriptions: {str(e)}',
#                 details={'error': str(e)},
#                 source_module='subscription_service',
#                 source_function='auto_renew_subscriptions'
#             )
            
#             return {
#                 'success': False,
#                 'error': 'Failed to auto-renew subscriptions',
#                 'timestamp': timezone.now().isoformat()
#             }
    
#     @classmethod
#     def get_statistics(cls, period_days: int = 30) -> Dict[str, Any]:
#         """
#         Get subscription statistics for dashboard
#         """
#         try:
#             # Check cache
#             cache_key = f'subscription_stats:{period_days}'
#             cached_stats = cache.get(cache_key)
            
#             if cached_stats:
#                 return cached_stats
            
#             now = timezone.now()
#             period_start = now - timezone.timedelta(days=period_days)
            
#             # Get overall statistics
#             overall_stats = Subscription.objects.filter(
#                 created_at__gte=period_start
#             ).aggregate(
#                 total=Count('id'),
#                 active=Count('id', filter=Q(status='active', is_active=True)),
#                 pending=Count('id', filter=Q(status='pending_activation', is_active=True)),
#                 expired=Count('id', filter=Q(status='expired', is_active=True)),
#                 cancelled=Count('id', filter=Q(status='cancelled')),
#                 suspended=Count('id', filter=Q(status='suspended', is_active=True)),
#                 draft=Count('id', filter=Q(status='draft', is_active=True))
#             )
            
#             # Get client type distribution
#             client_type_dist = Subscription.objects.filter(
#                 created_at__gte=period_start
#             ).values('client_type').annotate(
#                 count=Count('id')
#             )
            
#             # Get access method distribution
#             access_method_dist = Subscription.objects.filter(
#                 created_at__gte=period_start
#             ).values('access_method').annotate(
#                 count=Count('id')
#             )
            
#             # Get daily creation trend
#             daily_creations = Subscription.objects.filter(
#                 created_at__gte=period_start
#             ).extra({
#                 'date': "DATE(created_at)"
#             }).values('date').annotate(
#                 count=Count('id')
#             ).order_by('date')
            
#             # Get renewal statistics
#             renewal_stats = Subscription.objects.filter(
#                 parent_subscription__isnull=False,
#                 created_at__gte=period_start
#             ).aggregate(
#                 total_renewals=Count('id'),
#                 successful_renewals=Count('id', filter=Q(status='active', is_active=True))
#             )
            
#             # Build statistics
#             stats = {
#                 'success': True,
#                 'period_days': period_days,
#                 'period_start': period_start.isoformat(),
#                 'period_end': now.isoformat(),
#                 'overall': {
#                     'total': overall_stats['total'] or 0,
#                     'active': overall_stats['active'] or 0,
#                     'pending_activation': overall_stats['pending'] or 0,
#                     'expired': overall_stats['expired'] or 0,
#                     'cancelled': overall_stats['cancelled'] or 0,
#                     'suspended': overall_stats['suspended'] or 0,
#                     'draft': overall_stats['draft'] or 0
#                 },
#                 'client_type_distribution': [
#                     {'client_type': item['client_type'], 'count': item['count']}
#                     for item in client_type_dist
#                 ],
#                 'access_method_distribution': [
#                     {'access_method': item['access_method'], 'count': item['count']}
#                     for item in access_method_dist
#                 ],
#                 'renewals': {
#                     'total': renewal_stats['total_renewals'] or 0,
#                     'successful': renewal_stats['successful_renewals'] or 0,
#                     'success_rate': (
#                         (renewal_stats['successful_renewals'] or 0) / (renewal_stats['total_renewals'] or 1) * 100
#                     ) if renewal_stats['total_renewals'] else 0
#                 },
#                 'daily_trend': [
#                     {'date': item['date'], 'count': item['count']}
#                     for item in daily_creations
#                 ],
#                 'performance': {
#                     'active_rate': (
#                         (overall_stats['active'] or 0) / (overall_stats['total'] or 1) * 100
#                     ) if overall_stats['total'] else 0,
#                     'expiry_rate': (
#                         (overall_stats['expired'] or 0) / (overall_stats['total'] or 1) * 100
#                     ) if overall_stats['total'] else 0
#                 },
#                 'service_health': {
#                     'circuit_breaker_state': cls._circuit_state,
#                     'active_operations': cls._active_operations,
#                     'max_concurrent_operations': cls.MAX_CONCURRENT_OPERATIONS
#                 },
#                 'timestamp': now.isoformat()
#             }
            
#             # Cache for 5 minutes
#             cache.set(cache_key, stats, 300)
            
#             return stats
            
#         except Exception as e:
#             logger.error(f"Failed to get subscription statistics: {e}", exc_info=True)
#             return {
#                 'success': False,
#                 'error': 'Failed to get statistics',
#                 'timestamp': timezone.now().isoformat()
#             }
    
#     @classmethod
#     def health_check(cls) -> Dict[str, Any]:
#         """
#         Comprehensive health check for subscription service
#         """
#         try:
#             # Check database connection
#             try:
#                 Subscription.objects.first()
#                 db_healthy = True
#             except Exception as e:
#                 logger.error(f"Database health check failed: {e}")
#                 db_healthy = False
            
#             # Check circuit breaker
#             circuit_state = cls._check_circuit_breaker()
            
#             # Check active operations
#             active_operations = cls._active_operations
            
#             # Determine overall health
#             is_healthy = db_healthy and circuit_state == 'closed'
            
#             health_status = {
#                 'service': 'subscription_service',
#                 'status': 'healthy' if is_healthy else 'unhealthy',
#                 'database': {
#                     'healthy': db_healthy,
#                     'connection': 'established' if db_healthy else 'failed'
#                 },
#                 'circuit_breaker': {
#                     'state': circuit_state,
#                     'failure_count': cls._failure_count,
#                     'threshold': cls.CIRCUIT_BREAKER_THRESHOLD,
#                     'opened_at': cls._circuit_opened_at.isoformat() if cls._circuit_opened_at else None
#                 },
#                 'concurrency': {
#                     'active_operations': active_operations,
#                     'max_concurrent': cls.MAX_CONCURRENT_OPERATIONS,
#                     'healthy': active_operations <= cls.MAX_CONCURRENT_OPERATIONS
#                 },
#                 'external_services': {
#                     'internet_plans_adapter': InternetPlansAdapter.health_check(),
#                     'payment_adapter': PaymentAdapter.health_check(),
#                     'network_adapter': NetworkAdapter.health_check()
#                 },
#                 'recommendations': [],
#                 'timestamp': timezone.now().isoformat()
#             }
            
#             # Generate recommendations
#             if not db_healthy:
#                 health_status['recommendations'].append('Check database connection and credentials')
            
#             if circuit_state == 'open':
#                 health_status['recommendations'].append('Circuit breaker is open. Check external service dependencies')
            
#             if active_operations >= cls.MAX_CONCURRENT_OPERATIONS:
#                 health_status['recommendations'].append('Consider increasing MAX_CONCURRENT_OPERATIONS')
            
#             return health_status
            
#         except Exception as e:
#             logger.error(f"Subscription service health check failed: {e}")
#             return {
#                 'service': 'subscription_service',
#                 'status': 'unhealthy',
#                 'error': str(e),
#                 'timestamp': timezone.now().isoformat()
#             }
    
#     @classmethod
#     def _handle_circuit_blocked(cls, operation: str, circuit_state: str) -> Dict[str, Any]:
#         """Handle circuit blocked state"""
#         return {
#             'success': False,
#             'error': 'Service temporarily unavailable',
#             'operation': operation,
#             'circuit_state': circuit_state,
#             'message': 'Subscription service is experiencing high load. Please try again later.',
#             'retry_after': cls.CIRCUIT_BREAKER_TIMEOUT,
#             'timestamp': timezone.now().isoformat()
#         }








"""
Service Operations - Subscription Service
Production-ready subscription lifecycle management with circuit breaker, retry logic, and comprehensive error handling
Updated: Added explicit signal sends in create/renew/activate/cancel (e.g., subscription_created.send()).
"""

import logging
from typing import Dict, List, Optional, Tuple, Any
from django.core.cache import cache
from django.db import transaction
from django.db.models import Q, Count, Sum, Avg, F, ExpressionWrapper, DurationField
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal
import json
from django.conf import settings
from collections import defaultdict
import threading
import time

from service_operations.models import Subscription, UsageTracking, ClientOperation, ActivationQueue, OperationLog
from service_operations.services.activation_service import ActivationService
from service_operations.services.queue_service import QueueService
from service_operations.adapters.internet_plans_adapter import InternetPlansAdapter
from service_operations.adapters.network_adapter import NetworkAdapter
from service_operations.adapters.payment_adapter import PaymentAdapter
from service_operations.utils.validators import validate_mac_address, validate_duration_hours
from service_operations.utils.calculators import calculate_usage_percentage, format_bytes_human_readable
from service_operations.signals.operation_signals import subscription_created, subscription_activated, subscription_renewed, subscription_cancelled, subscription_expired

logger = logging.getLogger(__name__)


class SubscriptionService:
    """
    Production-ready subscription management service
    Core business logic for subscription lifecycle with comprehensive monitoring
    """
    
    # Circuit breaker configuration
    CIRCUIT_BREAKER_THRESHOLD = 3
    CIRCUIT_BREAKER_TIMEOUT = 300
    MAX_CONCURRENT_OPERATIONS = 10
    
    # Class-level state
    _circuit_state = 'closed'  # closed, open, half-open
    _failure_count = 0
    _circuit_opened_at = None
    _active_operations = 0
    _circuit_lock = threading.Lock()
    _operation_lock = threading.Lock()
    
    @classmethod
    def _check_circuit_breaker(cls) -> str:
        """Check circuit breaker state with thread safety"""
        with cls._circuit_lock:
            if cls._circuit_state == 'open':
                if cls._circuit_opened_at:
                    time_open = (timezone.now() - cls._circuit_opened_at).total_seconds()
                    if time_open > cls.CIRCUIT_BREAKER_TIMEOUT:
                        cls._circuit_state = 'half-open'
                        cls._circuit_opened_at = None
                        logger.info("Subscription service circuit moved to half-open")
            
            return cls._circuit_state
    
    @classmethod
    def _record_failure(cls):
        """Record failure for circuit breaker"""
        with cls._circuit_lock:
            cls._failure_count += 1
            
            if cls._failure_count >= cls.CIRCUIT_BREAKER_THRESHOLD:
                cls._circuit_state = 'open'
                cls._circuit_opened_at = timezone.now()
                logger.error(f"Subscription service circuit opened after {cls._failure_count} failures")
    
    @classmethod
    def _reset_circuit_breaker(cls):
        """Reset circuit breaker on success"""
        with cls._circuit_lock:
            cls._failure_count = 0
            if cls._circuit_state != 'closed':
                cls._circuit_state = 'closed'
                cls._circuit_opened_at = None
                logger.info("Subscription service circuit reset to closed")
    
    @classmethod
    def _can_start_operation(cls) -> bool:
        """Check concurrent operation limit"""
        with cls._operation_lock:
            if cls._active_operations < cls.MAX_CONCURRENT_OPERATIONS:
                cls._active_operations += 1
                return True
            return False
    
    @classmethod
    def _release_operation_slot(cls):
        """Release operation slot"""
        with cls._operation_lock:
            if cls._active_operations > 0:
                cls._active_operations -= 1
    
    @classmethod
    def create_subscription(
        cls,
        client_id: str,
        internet_plan_id: str,
        client_type: str,
        access_method: str = 'hotspot',
        duration_hours: int = 24,
        router_id: Optional[int] = None,
        hotspot_mac_address: Optional[str] = None,
        pppoe_username: Optional[str] = None,
        pppoe_password: Optional[str] = None,
        scheduled_activation: Optional[timezone.datetime] = None,
        auto_renew: bool = False,
        metadata: Optional[Dict] = None,
        created_by: str = 'system'
    ) -> Dict[str, Any]:
        """
        Create a new subscription with comprehensive validation and error handling
        Updated: Added explicit subscription_created.send() on creation.
        """
        # Check circuit breaker
        circuit_status = cls._check_circuit_breaker()
        if circuit_status != 'closed':
            return cls._handle_circuit_blocked('create_subscription', circuit_status)
        
        # Check concurrent operations
        if not cls._can_start_operation():
            return {
                'success': False,
                'error': 'Maximum concurrent operations reached',
                'suggestion': 'Try again in a few moments',
                'timestamp': timezone.now().isoformat()
            }
        
        try:
            with transaction.atomic():
                # Validate inputs
                validation_result = cls._validate_subscription_creation_data(
                    client_id=client_id,
                    internet_plan_id=internet_plan_id,
                    client_type=client_type,
                    access_method=access_method,
                    duration_hours=duration_hours,
                    hotspot_mac_address=hotspot_mac_address,
                    pppoe_username=pppoe_username,
                    pppoe_password=pppoe_password
                )
                
                if not validation_result['valid']:
                    return {
                        'success': False,
                        'error': 'Validation failed',
                        'details': validation_result['errors'],
                        'timestamp': timezone.now().isoformat()
                    }
            
                # Get plan technical configuration
                plan_config = cls._get_plan_configuration(internet_plan_id, access_method)
                
                if not plan_config.get('available', True):
                    return {
                        'success': False,
                        'error': 'Selected plan is not available',
                        'plan_id': internet_plan_id,
                        'timestamp': timezone.now().isoformat()
                    }
                
                # Calculate dates
                start_date = timezone.now()
                end_date = start_date + timezone.timedelta(hours=duration_hours)
                
                # Prepare subscription data
                subscription_data = {
                    'client_id': client_id,
                    'internet_plan_id': internet_plan_id,
                    'client_type': client_type,
                    'access_method': access_method,
                    'router_id': router_id,
                    'hotspot_mac_address': hotspot_mac_address,
                    'pppoe_username': pppoe_username,
                    'pppoe_password': pppoe_password,
                    'start_date': start_date,
                    'end_date': end_date,
                    'scheduled_activation': scheduled_activation,
                    'status': 'draft',
                    'data_limit_bytes': plan_config.get('data_limit_bytes', 10 * 1024 * 1024 * 1024),  # 10GB default
                    'time_limit_seconds': plan_config.get('time_limit_seconds', 24 * 3600),  # 24 hours default
                    'used_data_bytes': 0,
                    'used_time_seconds': 0,
                    'auto_renew': auto_renew,
                    'metadata': {
                        'created_by': created_by,
                        'plan_name': plan_config.get('name', 'Unknown'),
                        'duration_hours': duration_hours,
                        'technical_config': plan_config.get('technical_config', {}),
                        **(metadata or {})
                    }
                }
                
                # Create subscription
                subscription = Subscription.objects.create(**subscription_data)
                
                # Create client operation record
                ClientOperation.objects.create(
                    client_id=client_id,
                    client_type=client_type,
                    subscription=subscription,
                    operation_type='subscription_creation',
                    title=f'Subscription Created - {plan_config.get("name", "Unknown Plan")}',
                    description=f'New subscription created for {client_type} client',
                    source_platform='system',
                    priority=2,
                    metadata={
                        'plan_id': internet_plan_id,
                        'duration_hours': duration_hours,
                        'auto_renew': auto_renew,
                        'created_by': created_by
                    }
                )
                
                # Emit signal
                subscription_created.send(
                    sender=Subscription,
                    subscription_id=str(subscription.id),
                    client_id=str(subscription.client_id),
                    internet_plan_id=str(subscription.internet_plan_id),
                    client_type=subscription.client_type,
                    status=subscription.status,
                    timestamp=subscription.created_at
                )
                
                # Log operation
                OperationLog.log_operation(
                    operation_type='subscription_created',
                    severity='info',
                    subscription=subscription,
                    description=f'Subscription created successfully',
                    details={
                        'client_id': client_id,
                        'plan_id': internet_plan_id,
                        'client_type': client_type,
                        'access_method': access_method,
                        'duration_hours': duration_hours
                    },
                    source_module='subscription_service',
                    source_function='create_subscription',
                    duration_ms=0
                )
                
                # Clear cache
                cache.delete_pattern(f'subscriptions:client:{client_id}:*')
                cache.delete_pattern('subscription_stats:*')
                
                # Reset circuit breaker
                cls._reset_circuit_breaker()
                
                logger.info(f"Subscription created: {subscription.id} for client {client_id}")
                
                return {
                    'success': True,
                    'subscription_id': str(subscription.id),
                    'subscription': {
                        'id': str(subscription.id),
                        'status': subscription.status,
                        'start_date': subscription.start_date.isoformat(),
                        'end_date': subscription.end_date.isoformat(),
                        'client_type': subscription.client_type,
                        'access_method': subscription.access_method,
                        'data_limit_bytes': subscription.data_limit_bytes,
                        'time_limit_seconds': subscription.time_limit_seconds
                    },
                    'message': 'Subscription created successfully',
                    'timestamp': timezone.now().isoformat()
                }
                
        except Exception as e:
            logger.error(f"Failed to create subscription: {e}", exc_info=True)
            cls._record_failure()
            
            OperationLog.log_operation(
                operation_type='subscription_creation_failed',
                severity='error',
                description=f'Subscription creation failed: {str(e)}',
                details={
                    'client_id': client_id,
                    'plan_id': internet_plan_id,
                    'error': str(e)
                },
                source_module='subscription_service',
                source_function='create_subscription'
            )
            
            return {
                'success': False,
                'error': 'Failed to create subscription',
                'details': str(e) if settings.DEBUG else 'Internal server error',
                'timestamp': timezone.now().isoformat()
            }
        
        finally:
            cls._release_operation_slot()
    
    @classmethod
    def _validate_subscription_creation_data(
        cls,
        client_id: str,
        internet_plan_id: str,
        client_type: str,
        access_method: str,
        duration_hours: int,
        hotspot_mac_address: Optional[str] = None,
        pppoe_username: Optional[str] = None,
        pppoe_password: Optional[str] = None
    ) -> Dict[str, Any]:
        """Validate subscription creation data"""
        errors = {}
        
        # Validate client type
        valid_client_types = ['hotspot_client', 'pppoe_client']
        if client_type not in valid_client_types:
            errors['client_type'] = f'Invalid client type. Must be one of: {", ".join(valid_client_types)}'
        
        # Validate access method
        if access_method not in ['hotspot', 'pppoe']:
            errors['access_method'] = 'Invalid access method. Must be "hotspot" or "pppoe"'
        
        # Validate client type and access method consistency
        if client_type == 'hotspot_client' and access_method != 'hotspot':
            errors['access_method'] = 'Hotspot clients must use hotspot access method'
        elif client_type == 'pppoe_client' and access_method != 'pppoe':
            errors['access_method'] = 'PPPoE clients must use PPPoE access method'
        
        # Validate MAC address for hotspot
        if client_type == 'hotspot_client':
            if not hotspot_mac_address:
                errors['hotspot_mac_address'] = 'MAC address required for hotspot clients'
            elif not validate_mac_address(hotspot_mac_address):
                errors['hotspot_mac_address'] = 'Invalid MAC address format'
        
        # Validate PPPoE credentials
        if client_type == 'pppoe_client':
            if not pppoe_username:
                errors['pppoe_username'] = 'PPPoE username required'
            if not pppoe_password:
                errors['pppoe_password'] = 'PPPoE password required'
            elif len(pppoe_password) < 8:
                errors['pppoe_password'] = 'PPPoE password must be at least 8 characters'
        
        # Validate duration
        if not validate_duration_hours(duration_hours):
            errors['duration_hours'] = 'Duration must be between 1 and 744 hours (31 days)'
        
        return {
            'valid': len(errors) == 0,
            'errors': errors
        }
    
    @classmethod
    def _get_plan_configuration(cls, plan_id: str, access_method: str) -> Dict[str, Any]:
        """Get plan configuration from internet plans adapter"""
        try:
            config = InternetPlansAdapter.get_plan_technical_config(plan_id, access_method)
            
            if not config:
                logger.warning(f"No configuration found for plan {plan_id}, using defaults")
                return cls._get_default_plan_config(access_method)
            
            return {
                'available': True,
                'name': config.get('name', 'Unknown Plan'),
                'data_limit_bytes': config.get('data_limit', {}).get('bytes', 10 * 1024 * 1024 * 1024),
                'time_limit_seconds': config.get('time_limit', {}).get('seconds', 24 * 3600),
                'technical_config': config
            }
            
        except Exception as e:
            logger.error(f"Failed to get plan configuration: {e}", exc_info=True)
            return cls._get_default_plan_config(access_method)
    
    @classmethod
    def _get_default_plan_config(cls, access_method: str) -> Dict[str, Any]:
        """Get default plan configuration when adapter fails"""
        return {
            'available': True,
            'name': 'Default Plan',
            'data_limit_bytes': 10 * 1024 * 1024 * 1024,  # 10GB
            'time_limit_seconds': 24 * 3600,  # 24 hours
            'technical_config': {
                'access_method': access_method,
                'created_at': timezone.now().isoformat(),
                'is_default': True
            }
        }
    
    @classmethod
    def activate_subscription(
        cls,
        subscription_id: str,
        payment_reference: str,
        payment_method: str,
        activate_immediately: bool = True,
        priority: int = 4
    ) -> Dict[str, Any]:
        """
        Activate subscription after payment confirmation
        Updated: Added explicit subscription_activated.send() on success.
        """
        # Check circuit breaker
        circuit_status = cls._check_circuit_breaker()
        if circuit_status != 'closed':
            return cls._handle_circuit_blocked('activate_subscription', circuit_status)
        
        try:
            with transaction.atomic():
                # Get subscription with lock
                subscription = Subscription.objects.select_for_update().get(
                    id=subscription_id,
                    is_active=True
                )
                
                # Validate subscription can be activated
                if not subscription.can_be_activated:
                    return {
                        'success': False,
                        'error': 'Subscription cannot be activated',
                        'reason': f'Current status: {subscription.status}',
                        'subscription_id': subscription_id,
                        'timestamp': timezone.now().isoformat()
                    }
                
                # Verify payment via payment adapter
                payment_result = PaymentAdapter.verify_payment(payment_reference)
                
                if not payment_result.get('success'):
                    return {
                        'success': False,
                        'error': 'Payment verification failed',
                        'payment_error': payment_result.get('error'),
                        'subscription_id': subscription_id,
                        'timestamp': timezone.now().isoformat()
                    }
                
                # Update subscription with payment info
                subscription.payment_reference = payment_reference
                subscription.payment_method = payment_method
                subscription.payment_confirmed_at = timezone.now()
                subscription.status = 'pending_activation'
                subscription.save(update_fields=[
                    'payment_reference', 'payment_method',
                    'payment_confirmed_at', 'status', 'updated_at'
                ])
                
                # Create client operation
                ClientOperation.objects.create(
                    client_id=subscription.client_id,
                    client_type=subscription.client_type,
                    subscription=subscription,
                    operation_type='payment_verification',
                    title=f'Payment Verified - {payment_reference}',
                    description=f'Payment verified via {payment_method}',
                    source_platform='system',
                    priority=3,
                    metadata={
                        'payment_reference': payment_reference,
                        'payment_method': payment_method,
                        'verified_at': timezone.now().isoformat()
                    }
                )
                
                # Request activation
                if activate_immediately:
                    activation_result = ActivationService.request_subscription_activation(subscription)
                    
                    if activation_result.get('success'):
                        # Create activation queue item
                        ActivationQueue.objects.create(
                            subscription=subscription,
                            activation_type='initial',
                            priority=priority,
                            metadata={
                                'payment_reference': payment_reference,
                                'payment_method': payment_method,
                                'activated_by_service': 'subscription_service'
                            }
                        )
                        
                        # Emit signal
                        subscription_activated.send(
                            sender=Subscription,
                            subscription_id=str(subscription.id),
                            client_id=str(subscription.client_id),
                            internet_plan_id=str(subscription.internet_plan_id),
                            client_type=subscription.client_type,
                            router_id=subscription.router_id,
                            timestamp=timezone.now()
                        )
                        
                        OperationLog.log_operation(
                            operation_type='subscription_activation_requested',
                            severity='info',
                            subscription=subscription,
                            description=f'Activation requested for subscription',
                            details={
                                'payment_reference': payment_reference,
                                'priority': priority,
                                'queue_created': True
                            },
                            source_module='subscription_service',
                            source_function='activate_subscription'
                        )
                    else:
                        logger.error(f"Activation request failed: {activation_result.get('error')}")
                
                # Clear cache
                cache.delete(f'subscription:{subscription_id}:detail')
                cache.delete_pattern(f'subscriptions:client:{subscription.client_id}:*')
                
                # Reset circuit breaker
                cls._reset_circuit_breaker()
                
                logger.info(f"Subscription activated: {subscription_id} with payment {payment_reference}")
                
                return {
                    'success': True,
                    'subscription_id': subscription_id,
                    'status': subscription.status,
                    'activation_requested': activate_immediately,
                    'payment_verified': True,
                    'message': 'Subscription activated successfully',
                    'timestamp': timezone.now().isoformat()
                }
                
        except Subscription.DoesNotExist:
            logger.error(f"Subscription not found: {subscription_id}")
            return {
                'success': False,
                'error': 'Subscription not found',
                'subscription_id': subscription_id,
                'timestamp': timezone.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Failed to activate subscription {subscription_id}: {e}", exc_info=True)
            cls._record_failure()
            
            OperationLog.log_operation(
                operation_type='subscription_activation_failed',
                severity='error',
                subscription_id=subscription_id,
                description=f'Subscription activation failed: {str(e)}',
                details={
                    'subscription_id': subscription_id,
                    'payment_reference': payment_reference,
                    'error': str(e)
                },
                source_module='subscription_service',
                source_function='activate_subscription'
            )
            
            return {
                'success': False,
                'error': 'Failed to activate subscription',
                'subscription_id': subscription_id,
                'timestamp': timezone.now().isoformat()
            }
    
    @classmethod
    def renew_subscription(
        cls,
        subscription_id: str,
        new_plan_id: Optional[str] = None,
        duration_hours: Optional[int] = None,
        auto_renew: Optional[bool] = None,
        renewal_strategy: str = 'immediate'
    ) -> Dict[str, Any]:
        """
        Renew subscription with comprehensive error handling
        Updated: Added explicit subscription_renewed.send().
        """
        # Check circuit breaker
        circuit_status = cls._check_circuit_breaker()
        if circuit_status != 'closed':
            return cls._handle_circuit_blocked('renew_subscription', circuit_status)
        
        try:
            with transaction.atomic():
                # Get current subscription
                current_subscription = Subscription.objects.select_for_update().get(
                    id=subscription_id,
                    is_active=True
                )
                
                # Validate subscription can be renewed
                if current_subscription.status not in ['active', 'expired', 'suspended']:
                    return {
                        'success': False,
                        'error': 'Subscription cannot be renewed',
                        'reason': f'Invalid status: {current_subscription.status}',
                        'subscription_id': subscription_id,
                        'timestamp': timezone.now().isoformat()
                    }
                
                # Determine new plan ID
                if not new_plan_id:
                    new_plan_id = current_subscription.internet_plan_id
                
                # Get plan configuration
                plan_config = cls._get_plan_configuration(
                    new_plan_id,
                    current_subscription.access_method
                )
                
                if not plan_config.get('available', True):
                    return {
                        'success': False,
                        'error': 'Selected plan is not available',
                        'plan_id': new_plan_id,
                        'subscription_id': subscription_id,
                        'timestamp': timezone.now().isoformat()
                    }
                
                # Determine duration
                if not duration_hours:
                    duration_hours = 24  # Default 24 hours
                
                # Calculate start date based on renewal strategy
                if renewal_strategy == 'immediate' or current_subscription.is_expired:
                    start_date = timezone.now()
                else:
                    start_date = current_subscription.end_date or timezone.now()
                
                end_date = start_date + timezone.timedelta(hours=duration_hours)
                
                # Determine auto_renew
                if auto_renew is None:
                    auto_renew = current_subscription.auto_renew
                
                # Create new subscription
                new_subscription = Subscription.objects.create(
                    client_id=current_subscription.client_id,
                    internet_plan_id=new_plan_id,
                    client_type=current_subscription.client_type,
                    access_method=current_subscription.access_method,
                    router_id=current_subscription.router_id,
                    hotspot_mac_address=current_subscription.hotspot_mac_address,
                    pppoe_username=current_subscription.pppoe_username,
                    pppoe_password=current_subscription.pppoe_password,
                    start_date=start_date,
                    end_date=end_date,
                    status='draft',
                    data_limit_bytes=plan_config.get('data_limit_bytes', 0),
                    time_limit_seconds=plan_config.get('time_limit_seconds', 0),
                    auto_renew=auto_renew,
                    parent_subscription=current_subscription,
                    metadata={
                        'renewal_of': str(current_subscription.id),
                        'renewal_strategy': renewal_strategy,
                        'duration_hours': duration_hours,
                        'plan_name': plan_config.get('name', 'Unknown'),
                        'previous_status': current_subscription.status
                    }
                )
                
                # Update current subscription
                if current_subscription.status == 'active':
                    current_subscription.status = 'expired'
                    current_subscription.save(update_fields=['status', 'updated_at'])
                
                # Emit signal
                subscription_renewed.send(
                    sender=Subscription,
                    subscription_id=str(new_subscription.id),
                    client_id=str(new_subscription.client_id),
                    internet_plan_id=str(new_subscription.internet_plan_id),
                    renewed_at=timezone.now(),
                    new_end_date=new_subscription.end_date
                )
                
                # Create client operation
                ClientOperation.objects.create(
                    client_id=current_subscription.client_id,
                    client_type=current_subscription.client_type,
                    subscription=new_subscription,
                    operation_type='plan_renewal',
                    title=f'Subscription Renewed - {plan_config.get("name", "Unknown Plan")}',
                    description=f'Subscription renewed from {current_subscription.id}',
                    source_platform='system',
                    priority=2,
                    metadata={
                        'previous_subscription_id': str(current_subscription.id),
                        'new_plan_id': new_plan_id,
                        'duration_hours': duration_hours,
                        'auto_renew': auto_renew,
                        'renewal_strategy': renewal_strategy
                    }
                )
                
                # Log operation
                OperationLog.log_operation(
                    operation_type='subscription_renewed',
                    severity='info',
                    subscription=new_subscription,
                    description=f'Subscription renewed successfully',
                    details={
                        'previous_subscription_id': str(current_subscription.id),
                        'new_subscription_id': str(new_subscription.id),
                        'plan_id': new_plan_id,
                        'duration_hours': duration_hours,
                        'renewal_strategy': renewal_strategy
                    },
                    source_module='subscription_service',
                    source_function='renew_subscription'
                )
                
                # Clear cache
                cache.delete_pattern(f'subscriptions:client:{current_subscription.client_id}:*')
                cache.delete_pattern('subscription_stats:*')
                
                logger.info(f"Subscription renewed: {current_subscription.id} -> {new_subscription.id}")
                
                return {
                    'success': True,
                    'previous_subscription_id': str(current_subscription.id),
                    'new_subscription_id': str(new_subscription.id),
                    'new_subscription': {
                        'id': str(new_subscription.id),
                        'status': new_subscription.status,
                        'start_date': new_subscription.start_date.isoformat(),
                        'end_date': new_subscription.end_date.isoformat(),
                        'plan_id': new_plan_id,
                        'duration_hours': duration_hours
                    },
                    'message': 'Subscription renewed successfully',
                    'timestamp': timezone.now().isoformat()
                }
                
        except Subscription.DoesNotExist:
            logger.error(f"Subscription not found for renewal: {subscription_id}")
            return {
                'success': False,
                'error': 'Subscription not found',
                'subscription_id': subscription_id,
                'timestamp': timezone.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Failed to renew subscription {subscription_id}: {e}", exc_info=True)
            
            OperationLog.log_operation(
                operation_type='subscription_renewal_failed',
                severity='error',
                subscription_id=subscription_id,
                description=f'Subscription renewal failed: {str(e)}',
                details={
                    'subscription_id': subscription_id,
                    'new_plan_id': new_plan_id,
                    'error': str(e)
                },
                source_module='subscription_service',
                source_function='renew_subscription'
            )
            
            return {
                'success': False,
                'error': 'Failed to renew subscription',
                'subscription_id': subscription_id,
                'timestamp': timezone.now().isoformat()
            }
    
    @classmethod
    def update_usage(
        cls,
        subscription_id: str,
        data_used_bytes: int,
        time_used_seconds: int,
        session_id: Optional[str] = None,
        device_id: Optional[str] = None,
        network_metrics: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """
        Update subscription usage atomically with comprehensive validation
        """
        # Check circuit breaker
        circuit_status = cls._check_circuit_breaker()
        if circuit_status != 'closed':
            return cls._handle_circuit_blocked('update_usage', circuit_status)
        
        try:
            with transaction.atomic():
                # Get subscription with lock
                subscription = Subscription.objects.select_for_update().get(
                    id=subscription_id,
                    is_active=True
                )
                
                # Validate usage data
                if data_used_bytes < 0 or time_used_seconds < 0:
                    return {
                        'success': False,
                        'error': 'Usage values cannot be negative',
                        'subscription_id': subscription_id,
                        'timestamp': timezone.now().isoformat()
                    }
                
                if data_used_bytes > 10 * 1024 * 1024 * 1024:  # 10GB per update
                    return {
                        'success': False,
                        'error': 'Data usage too high for single update',
                        'subscription_id': subscription_id,
                        'timestamp': timezone.now().isoformat()
                    }
                
                if time_used_seconds > 24 * 3600:  # 24 hours per update
                    return {
                        'success': False,
                        'error': 'Time usage too high for single update',
                        'subscription_id': subscription_id,
                        'timestamp': timezone.now().isoformat()
                    }
                
                # Update usage
                previous_data = subscription.used_data_bytes
                previous_time = subscription.used_time_seconds
                
                subscription.used_data_bytes += data_used_bytes
                subscription.used_time_seconds += time_used_seconds
                subscription.last_usage_update = timezone.now()
                
                # Update remaining limits
                if subscription.data_limit_bytes > 0:
                    subscription.remaining_data_bytes = max(
                        0,
                        subscription.data_limit_bytes - subscription.used_data_bytes
                    )
                
                if subscription.time_limit_seconds > 0:
                    subscription.remaining_time_seconds = max(
                        0,
                        subscription.time_limit_seconds - subscription.used_time_seconds
                    )
                
                # Check if limits exceeded
                limit_exceeded = False
                if (subscription.remaining_data_bytes == 0 and subscription.data_limit_bytes > 0) or \
                   (subscription.remaining_time_seconds == 0 and subscription.time_limit_seconds > 0):
                    subscription.status = 'suspended'
                    limit_exceeded = True
                
                subscription.save()
                
                # Create usage tracking record
                usage_record = UsageTracking.objects.create(
                    subscription=subscription,
                    data_used_bytes=data_used_bytes,
                    time_used_seconds=time_used_seconds,
                    session_start=timezone.now() - timezone.timedelta(seconds=time_used_seconds),
                    session_end=timezone.now(),
                    metadata={
                        'session_id': session_id,
                        'device_id': device_id,
                        'network_metrics': network_metrics or {},
                        'previous_data': previous_data,
                        'previous_time': previous_time
                    }
                )
                
                # Log operation
                OperationLog.log_operation(
                    operation_type='usage_updated',
                    severity='info',
                    subscription=subscription,
                    description=f'Usage updated: {format_bytes_human_readable(data_used_bytes)} data, {time_used_seconds}s time',
                    details={
                        'data_used_bytes': data_used_bytes,
                        'time_used_seconds': time_used_seconds,
                        'remaining_data_bytes': subscription.remaining_data_bytes,
                        'remaining_time_seconds': subscription.remaining_time_seconds,
                        'limit_exceeded': limit_exceeded,
                        'usage_record_id': str(usage_record.id)
                    },
                    source_module='subscription_service',
                    source_function='update_usage',
                    duration_ms=0
                )
                
                # Clear cache
                cache.delete(f'subscription:{subscription_id}:detail')
                
                logger.info(f"Usage updated for subscription {subscription_id}: +{data_used_bytes} bytes, +{time_used_seconds}s")
                
                return {
                    'success': True,
                    'subscription_id': subscription_id,
                    'usage_record_id': str(usage_record.id),
                    'usage': {
                        'data_used_bytes': subscription.used_data_bytes,
                        'time_used_seconds': subscription.used_time_seconds,
                        'remaining_data_bytes': subscription.remaining_data_bytes,
                        'remaining_time_seconds': subscription.remaining_time_seconds,
                        'limit_exceeded': limit_exceeded
                    },
                    'status': subscription.status,
                    'timestamp': timezone.now().isoformat()
                }
                
        except Subscription.DoesNotExist:
            logger.error(f"Subscription not found for usage update: {subscription_id}")
            return {
                'success': False,
                'error': 'Subscription not found',
                'subscription_id': subscription_id,
                'timestamp': timezone.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Failed to update usage for subscription {subscription_id}: {e}", exc_info=True)
            
            OperationLog.log_operation(
                operation_type='usage_update_failed',
                severity='error',
                subscription_id=subscription_id,
                description=f'Usage update failed: {str(e)}',
                details={
                    'subscription_id': subscription_id,
                    'data_used_bytes': data_used_bytes,
                    'time_used_seconds': time_used_seconds,
                    'error': str(e)
                },
                source_module='subscription_service',
                source_function='update_usage'
            )
            
            return {
                'success': False,
                'error': 'Failed to update usage',
                'subscription_id': subscription_id,
                'timestamp': timezone.now().isoformat()
            }
    
    @classmethod
    def cancel_subscription(
        cls,
        subscription_id: str,
        reason: str = "Cancelled by user",
        cancelled_by: str = "system"
    ) -> Dict[str, Any]:
        """
        Cancel subscription with comprehensive cleanup
        Updated: Added explicit subscription_cancelled.send().
        """
        # Check circuit breaker
        circuit_status = cls._check_circuit_breaker()
        if circuit_status != 'closed':
            return cls._handle_circuit_blocked('cancel_subscription', circuit_status)
        
        try:
            with transaction.atomic():
                subscription = Subscription.objects.select_for_update().get(id=subscription_id)
                
                # Update subscription
                previous_status = subscription.status
                subscription.status = 'cancelled'
                subscription.is_active = False
                subscription.save()
                
                # Cancel any pending activations
                try:
                    ActivationService.cancel_activation(subscription_id, reason)
                except Exception as e:
                    logger.warning(f"Failed to cancel activation for subscription {subscription_id}: {e}", exc_info=True)
                
                # Emit signal
                subscription_cancelled.send(
                    sender=Subscription,
                    subscription_id=str(subscription.id),
                    client_id=str(subscription.client_id),
                    internet_plan_id=str(subscription.internet_plan_id),
                    cancelled_at=timezone.now(),
                    reason=reason
                )
                
                # Create client operation
                ClientOperation.objects.create(
                    client_id=subscription.client_id,
                    client_type=subscription.client_type,
                    subscription=subscription,
                    operation_type='subscription_cancellation',
                    title=f'Subscription Cancelled',
                    description=f'Subscription cancelled: {reason}',
                    source_platform='system',
                    priority=3,
                    status='completed',
                    result_data={
                        'previous_status': previous_status,
                        'cancelled_by': cancelled_by,
                        'reason': reason
                    }
                )
                
                # Log operation
                OperationLog.log_operation(
                    operation_type='subscription_cancelled',
                    severity='info',
                    subscription=subscription,
                    description=f'Subscription cancelled successfully',
                    details={
                        'previous_status': previous_status,
                        'cancelled_by': cancelled_by,
                        'reason': reason
                    },
                    source_module='subscription_service',
                    source_function='cancel_subscription'
                )
                
                # Clear cache
                cache.delete(f'subscription:{subscription_id}:detail')
                cache.delete_pattern(f'subscriptions:client:{subscription.client_id}:*')
                cache.delete_pattern('subscription_stats:*')
                
                logger.info(f"Subscription cancelled: {subscription_id} - {reason}")
                
                return {
                    'success': True,
                    'subscription_id': subscription_id,
                    'previous_status': previous_status,
                    'cancelled_by': cancelled_by,
                    'message': 'Subscription cancelled successfully',
                    'timestamp': timezone.now().isoformat()
                }
                
        except Subscription.DoesNotExist:
            logger.error(f"Subscription not found for cancellation: {subscription_id}")
            return {
                'success': False,
                'error': 'Subscription not found',
                'subscription_id': subscription_id,
                'timestamp': timezone.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Failed to cancel subscription {subscription_id}: {e}", exc_info=True)
            
            OperationLog.log_operation(
                operation_type='subscription_cancellation_failed',
                severity='error',
                subscription_id=subscription_id,
                description=f'Subscription cancellation failed: {str(e)}',
                details={
                    'subscription_id': subscription_id,
                    'reason': reason,
                    'error': str(e)
                },
                source_module='subscription_service',
                source_function='cancel_subscription'
            )
            
            return {
                'success': False,
                'error': 'Failed to cancel subscription',
                'subscription_id': subscription_id,
                'timestamp': timezone.now().isoformat()
            }
    
    @classmethod
    def get_subscription_details(cls, subscription_id: str) -> Dict[str, Any]:
        """
        Get comprehensive subscription details with caching
        """
        # Check circuit breaker
        circuit_status = cls._check_circuit_breaker()
        if circuit_status != 'closed':
            return cls._handle_circuit_blocked('get_subscription_details', circuit_status)
        
        try:
            # Check cache
            cache_key = f'subscription:{subscription_id}:details'
            cached_data = cache.get(cache_key)
            
            if cached_data:
                logger.debug(f"Returning cached subscription details: {subscription_id}")
                return cached_data
            
            # Get subscription with related data
            subscription = Subscription.objects.select_related('parent_subscription').get(
                id=subscription_id,
                is_active=True
            )
            
            # Get plan details
            plan_config = cls._get_plan_configuration(
                str(subscription.internet_plan_id),
                subscription.access_method
            )
            
            # Get usage records
            usage_records = UsageTracking.objects.filter(
                subscription=subscription
            ).order_by('-session_start')[:10]
            
            # Get activation history
            activation_history = ActivationQueue.objects.filter(
                subscription=subscription
            ).order_by('-created_at')[:5]
            
            # Get client operations
            client_operations = ClientOperation.objects.filter(
                subscription=subscription
            ).order_by('-created_at')[:5]
            
            # Build comprehensive details
            details = {
                'success': True,
                'subscription': {
                    'id': str(subscription.id),
                    'client_id': str(subscription.client_id),
                    'internet_plan_id': str(subscription.internet_plan_id),
                    'client_type': subscription.client_type,
                    'access_method': subscription.access_method,
                    'status': subscription.status,
                    'status_display': subscription.get_status_display(),
                    'router_id': subscription.router_id,
                    'hotspot_mac_address': subscription.hotspot_mac_address,
                    'pppoe_username': subscription.pppoe_username,
                    'start_date': subscription.start_date.isoformat() if subscription.start_date else None,
                    'end_date': subscription.end_date.isoformat() if subscription.end_date else None,
                    'scheduled_activation': subscription.scheduled_activation.isoformat() if subscription.scheduled_activation else None,
                    'used_data_bytes': subscription.used_data_bytes,
                    'used_time_seconds': subscription.used_time_seconds,
                    'data_limit_bytes': subscription.data_limit_bytes,
                    'time_limit_seconds': subscription.time_limit_seconds,
                    'remaining_data_bytes': subscription.remaining_data_bytes,
                    'remaining_time_seconds': subscription.remaining_time_seconds,
                    'activation_attempts': subscription.activation_attempts,
                    'activation_successful': subscription.activation_successful,
                    'activation_error': subscription.activation_error,
                    'activation_completed_at': subscription.activation_completed_at.isoformat() if subscription.activation_completed_at else None,
                    'auto_renew': subscription.auto_renew,
                    'payment_reference': subscription.payment_reference,
                    'payment_method': subscription.payment_method,
                    'payment_confirmed_at': subscription.payment_confirmed_at.isoformat() if subscription.payment_confirmed_at else None,
                    'is_expired': subscription.is_expired,
                    'can_be_activated': subscription.can_be_activated,
                    'usage_percentage': subscription.usage_percentage,
                    'parent_subscription_id': str(subscription.parent_subscription.id) if subscription.parent_subscription else None,
                    'metadata': subscription.metadata,
                    'created_at': subscription.created_at.isoformat(),
                    'updated_at': subscription.updated_at.isoformat(),
                    'last_usage_update': subscription.last_usage_update.isoformat() if subscription.last_usage_update else None
                },
                'plan_details': plan_config,
                'usage_summary': {
                    'total_records': usage_records.count(),
                    'recent_usage': [
                        {
                            'id': str(record.id),
                            'data_used_bytes': record.data_used_bytes,
                            'time_used_seconds': record.session_duration_seconds,
                            'session_start': record.session_start.isoformat(),
                            'session_end': record.session_end.isoformat(),
                            'peak_data_rate': record.peak_data_rate,
                            'avg_data_rate': record.avg_data_rate
                        }
                        for record in usage_records
                    ]
                },
                'activation_history': {
                    'total_attempts': activation_history.count(),
                    'successful': activation_history.filter(status='completed').count(),
                    'failed': activation_history.filter(status='failed').count(),
                    'pending': activation_history.filter(status__in=['pending', 'processing', 'retrying']).count(),
                    'recent': [
                        {
                            'id': str(act.id),
                            'activation_type': act.activation_type,
                            'status': act.status,
                            'priority': act.priority,
                            'error_message': act.error_message,
                            'created_at': act.created_at.isoformat()
                        }
                        for act in activation_history
                    ]
                },
                'client_operations': [
                    {
                        'id': str(op.id),
                        'operation_type': op.operation_type,
                        'status': op.status,
                        'title': op.title,
                        'created_at': op.created_at.isoformat()
                    }
                    for op in client_operations
                ],
                'health': {
                    'can_be_activated': subscription.can_be_activated,
                    'is_expired': subscription.is_expired,
                    'remaining_data_percentage': calculate_usage_percentage(
                        subscription.used_data_bytes,
                        subscription.data_limit_bytes
                    ) if subscription.data_limit_bytes > 0 else 0,
                    'remaining_time_percentage': calculate_usage_percentage(
                        subscription.used_time_seconds,
                        subscription.time_limit_seconds
                    ) if subscription.time_limit_seconds > 0 else 0
                },
                'timestamp': timezone.now().isoformat()
            }
            
            # Cache for 2 minutes
            cache.set(cache_key, details, 120)
            
            # Reset circuit breaker
            cls._reset_circuit_breaker()
            
            return details
            
        except Subscription.DoesNotExist:
            logger.error(f"Subscription not found for details: {subscription_id}")
            return {
                'success': False,
                'error': 'Subscription not found',
                'subscription_id': subscription_id,
                'timestamp': timezone.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Failed to get subscription details {subscription_id}: {e}", exc_info=True)
            cls._record_failure()
            
            return {
                'success': False,
                'error': 'Failed to get subscription details',
                'subscription_id': subscription_id,
                'timestamp': timezone.now().isoformat()
            }
    
    @classmethod
    def get_subscriptions_for_client(
        cls,
        client_id: str,
        status_filter: Optional[str] = None,
        client_type_filter: Optional[str] = None,
        active_only: bool = False,
        limit: int = 50,
        offset: int = 0
    ) -> Dict[str, Any]:
        """
        Get subscriptions for a client with filtering and pagination
        """
        # Check circuit breaker
        circuit_status = cls._check_circuit_breaker()
        if circuit_status != 'closed':
            return cls._handle_circuit_blocked('get_subscriptions_for_client', circuit_status)
        
        try:
            # Check cache
            cache_key = f'subscriptions:client:{client_id}:{status_filter}:{client_type_filter}:{active_only}:{limit}:{offset}'
            cached_data = cache.get(cache_key)
            
            if cached_data:
                logger.debug(f"Returning cached client subscriptions: {client_id}")
                return cached_data
            
            # Build queryset
            queryset = Subscription.objects.filter(
                client_id=client_id,
                is_active=True
            )
            
            # Apply filters
            if status_filter:
                queryset = queryset.filter(status=status_filter)
            
            if client_type_filter:
                queryset = queryset.filter(client_type=client_type_filter)
            
            if active_only:
                queryset = queryset.filter(status='active')
            
            # Get total count
            total_count = queryset.count()
            
            # Apply pagination
            subscriptions = queryset.order_by('-created_at')[offset:offset + limit]
            
            # Build response
            result = {
                'success': True,
                'client_id': client_id,
                'subscriptions': [
                    {
                        'id': str(sub.id),
                        'internet_plan_id': str(sub.internet_plan_id),
                        'client_type': sub.client_type,
                        'access_method': sub.access_method,
                        'status': sub.status,
                        'status_display': sub.get_status_display(),
                        'start_date': sub.start_date.isoformat() if sub.start_date else None,
                        'end_date': sub.end_date.isoformat() if sub.end_date else None,
                        'used_data_bytes': sub.used_data_bytes,
                        'data_limit_bytes': sub.data_limit_bytes,
                        'used_time_seconds': sub.used_time_seconds,
                        'time_limit_seconds': sub.time_limit_seconds,
                        'remaining_data_bytes': sub.remaining_data_bytes,
                        'remaining_time_seconds': sub.remaining_time_seconds,
                        'is_expired': sub.is_expired,
                        'can_be_activated': sub.can_be_activated,
                        'usage_percentage': sub.usage_percentage,
                        'payment_method': sub.payment_method,
                        'auto_renew': sub.auto_renew,
                        'created_at': sub.created_at.isoformat()
                    }
                    for sub in subscriptions
                ],
                'pagination': {
                    'total': total_count,
                    'limit': limit,
                    'offset': offset,
                    'has_more': (offset + limit) < total_count
                },
                'filters': {
                    'status_filter': status_filter,
                    'client_type_filter': client_type_filter,
                    'active_only': active_only
                },
                'timestamp': timezone.now().isoformat()
            }
            
            # Cache for 1 minute
            cache.set(cache_key, result, 60)
            
            # Reset circuit breaker
            cls._reset_circuit_breaker()
            
            return result
            
        except Exception as e:
            logger.error(f"Failed to get subscriptions for client {client_id}: {e}", exc_info=True)
            cls._record_failure()
            
            return {
                'success': False,
                'error': 'Failed to get subscriptions',
                'client_id': client_id,
                'timestamp': timezone.now().isoformat()
            }
    
    @classmethod
    def process_expired_subscriptions(cls) -> Dict[str, Any]:
        """
        Process expired subscriptions (cron job)
        Updated: Added explicit subscription_expired.send() for each expired.
        """
        # Check circuit breaker
        circuit_status = cls._check_circuit_breaker()
        if circuit_status != 'closed':
            return cls._handle_circuit_blocked('process_expired_subscriptions', circuit_status)
        
        try:
            expired_subs = Subscription.objects.filter(
                status='active',
                is_active=True,
                end_date__lt=timezone.now()
            )
            
            processed_count = 0
            failed_count = 0
            
            for subscription in expired_subs:
                try:
                    with transaction.atomic():
                        subscription.status = 'expired'
                        subscription.save(update_fields=['status', 'updated_at'])
                        
                        # Emit signal
                        subscription_expired.send(
                            sender=Subscription,
                            subscription_id=str(subscription.id),
                            client_id=str(subscription.client_id),
                            internet_plan_id=str(subscription.internet_plan_id),
                            expired_at=timezone.now()
                        )
                        
                        # Create client operation
                        ClientOperation.objects.create(
                            client_id=subscription.client_id,
                            client_type=subscription.client_type,
                            subscription=subscription,
                            operation_type='subscription_expired',
                            title='Subscription Expired',
                            description='Subscription expired automatically',
                            source_platform='system',
                            priority=1,
                            metadata={
                                'expired_at': timezone.now().isoformat()
                            }
                        )
                        
                        processed_count += 1
                        logger.info(f"Subscription expired: {subscription.id}")
                        
                except Exception as e:
                    logger.error(f"Failed to process expired subscription {subscription.id}: {e}", exc_info=True)
                    failed_count += 1
            
            # Log batch operation
            OperationLog.log_operation(
                operation_type='batch_subscription_expiry',
                severity='info',
                description=f'Processed {processed_count} expired subscriptions',
                details={
                    'processed_count': processed_count,
                    'failed_count': failed_count,
                    'total_processed': processed_count + failed_count
                },
                source_module='subscription_service',
                source_function='process_expired_subscriptions'
            )
            
            # Clear stats cache
            cache.delete_pattern('subscription_stats:*')
            
            return {
                'success': True,
                'processed_count': processed_count,
                'failed_count': failed_count,
                'total_processed': processed_count + failed_count,
                'message': f'Processed {processed_count} expired subscriptions',
                'timestamp': timezone.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Failed to process expired subscriptions: {e}", exc_info=True)
            
            OperationLog.log_operation(
                operation_type='batch_subscription_expiry_failed',
                severity='error',
                description=f'Failed to process expired subscriptions: {str(e)}',
                details={'error': str(e)},
                source_module='subscription_service',
                source_function='process_expired_subscriptions'
            )
            
            return {
                'success': False,
                'error': 'Failed to process expired subscriptions',
                'timestamp': timezone.now().isoformat()
            }
    
    @classmethod
    def auto_renew_subscriptions(cls) -> Dict[str, Any]:
        """
        Auto-renew subscriptions (cron job)
        """
        # Check circuit breaker
        circuit_status = cls._check_circuit_breaker()
        if circuit_status != 'closed':
            return cls._handle_circuit_blocked('auto_renew_subscriptions', circuit_status)
        
        try:
            # Find subscriptions nearing expiry with auto_renew enabled
            renew_threshold = timezone.now() + timedelta(hours=24)
            
            subscriptions_to_renew = Subscription.objects.filter(
                status='active',
                is_active=True,
                auto_renew=True,
                end_date__lte=renew_threshold,
                end_date__gt=timezone.now()
            )
            
            renewed_count = 0
            failed_count = 0
            
            for subscription in subscriptions_to_renew:
                try:
                    result = cls.renew_subscription(
                        subscription_id=str(subscription.id),
                        renewal_strategy='after_expiry'
                    )
                    
                    if result.get('success'):
                        renewed_count += 1
                        logger.info(f"Auto-renewed subscription: {subscription.id}")
                    else:
                        failed_count += 1
                        logger.error(f"Failed to auto-renew subscription {subscription.id}: {result.get('error')}")
                        
                except Exception as e:
                    logger.error(f"Error auto-renewing subscription {subscription.id}: {e}", exc_info=True)
                    failed_count += 1
            
            # Log batch operation
            OperationLog.log_operation(
                operation_type='batch_auto_renew',
                severity='info',
                description=f'Auto-renewed {renewed_count} subscriptions',
                details={
                    'renewed_count': renewed_count,
                    'failed_count': failed_count,
                    'total_processed': renewed_count + failed_count
                },
                source_module='subscription_service',
                source_function='auto_renew_subscriptions'
            )
            
            # Clear stats cache
            cache.delete_pattern('subscription_stats:*')
            
            return {
                'success': True,
                'renewed_count': renewed_count,
                'failed_count': failed_count,
                'total_processed': renewed_count + failed_count,
                'message': f'Auto-renewed {renewed_count} subscriptions',
                'timestamp': timezone.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Failed to auto-renew subscriptions: {e}", exc_info=True)
            
            OperationLog.log_operation(
                operation_type='batch_auto_renew_failed',
                severity='error',
                description=f'Failed to auto-renew subscriptions: {str(e)}',
                details={'error': str(e)},
                source_module='subscription_service',
                source_function='auto_renew_subscriptions'
            )
            
            return {
                'success': False,
                'error': 'Failed to auto-renew subscriptions',
                'timestamp': timezone.now().isoformat()
            }
    
    @classmethod
    def get_statistics(cls, period_days: int = 30) -> Dict[str, Any]:
        """
        Get subscription statistics for dashboard
        """
        # Check circuit breaker
        circuit_status = cls._check_circuit_breaker()
        if circuit_status != 'closed':
            return cls._handle_circuit_blocked('get_statistics', circuit_status)
        
        try:
            # Check cache
            cache_key = f'subscription_stats:{period_days}'
            cached_stats = cache.get(cache_key)
            
            if cached_stats:
                return cached_stats
            
            now = timezone.now()
            period_start = now - timedelta(days=period_days)
            
            # Get overall statistics
            overall_stats = Subscription.objects.filter(
                created_at__gte=period_start
            ).aggregate(
                total=Count('id'),
                active=Count('id', filter=Q(status='active', is_active=True)),
                pending=Count('id', filter=Q(status='pending_activation', is_active=True)),
                expired=Count('id', filter=Q(status='expired', is_active=True)),
                cancelled=Count('id', filter=Q(status='cancelled')),
                suspended=Count('id', filter=Q(status='suspended', is_active=True)),
                draft=Count('id', filter=Q(status='draft', is_active=True))
            )
            
            # Get client type distribution
            client_type_dist = Subscription.objects.filter(
                created_at__gte=period_start
            ).values('client_type').annotate(
                count=Count('id')
            )
            
            # Get access method distribution
            access_method_dist = Subscription.objects.filter(
                created_at__gte=period_start
            ).values('access_method').annotate(
                count=Count('id')
            )
            
            # Get daily creation trend
            daily_creations = Subscription.objects.filter(
                created_at__gte=period_start
            ).extra({
                'date': "DATE(created_at)"
            }).values('date').annotate(
                count=Count('id')
            ).order_by('date')
            
            # Get renewal statistics
            renewal_stats = Subscription.objects.filter(
                parent_subscription__isnull=False,
                created_at__gte=period_start
            ).aggregate(
                total_renewals=Count('id'),
                successful_renewals=Count('id', filter=Q(status='active', is_active=True))
            )
            
            # Build statistics
            stats = {
                'success': True,
                'period_days': period_days,
                'period_start': period_start.isoformat(),
                'period_end': now.isoformat(),
                'overall': {
                    'total': overall_stats['total'] or 0,
                    'active': overall_stats['active'] or 0,
                    'pending_activation': overall_stats['pending'] or 0,
                    'expired': overall_stats['expired'] or 0,
                    'cancelled': overall_stats['cancelled'] or 0,
                    'suspended': overall_stats['suspended'] or 0,
                    'draft': overall_stats['draft'] or 0
                },
                'client_type_distribution': [
                    {'client_type': item['client_type'], 'count': item['count']}
                    for item in client_type_dist
                ],
                'access_method_distribution': [
                    {'access_method': item['access_method'], 'count': item['count']}
                    for item in access_method_dist
                ],
                'renewals': {
                    'total': renewal_stats['total_renewals'] or 0,
                    'successful': renewal_stats['successful_renewals'] or 0,
                    'success_rate': (
                        (renewal_stats['successful_renewals'] or 0) / (renewal_stats['total_renewals'] or 1) * 100
                    ) if renewal_stats['total_renewals'] else 0
                },
                'daily_trend': [
                    {'date': item['date'], 'count': item['count']}
                    for item in daily_creations
                ],
                'performance': {
                    'active_rate': (
                        (overall_stats['active'] or 0) / (overall_stats['total'] or 1) * 100
                    ) if overall_stats['total'] else 0,
                    'expiry_rate': (
                        (overall_stats['expired'] or 0) / (overall_stats['total'] or 1) * 100
                    ) if overall_stats['total'] else 0
                },
                'service_health': {
                    'circuit_breaker_state': cls._circuit_state,
                    'active_operations': cls._active_operations,
                    'max_concurrent_operations': cls.MAX_CONCURRENT_OPERATIONS
                },
                'timestamp': now.isoformat()
            }
            
            # Cache for 5 minutes
            cache.set(cache_key, stats, 300)
            
            # Reset circuit breaker
            cls._reset_circuit_breaker()
            
            return stats
            
        except Exception as e:
            logger.error(f"Failed to get subscription statistics: {e}", exc_info=True)
            cls._record_failure()
            
            return {
                'success': False,
                'error': 'Failed to get statistics',
                'timestamp': timezone.now().isoformat()
            }
    
    @classmethod
    def health_check(cls) -> Dict[str, Any]:
        """
        Comprehensive health check for subscription service
        """
        # Check circuit breaker
        circuit_status = cls._check_circuit_breaker()
        if circuit_status != 'closed':
            return cls._handle_circuit_blocked('health_check', circuit_status)
        
        try:
            # Check database connection
            try:
                Subscription.objects.exists()  # Simple query to check DB
                db_healthy = True
            except Exception as e:
                logger.error(f"Database health check failed: {e}", exc_info=True)
                db_healthy = False
            
            # Check external adapters
            external_health = {
                'internet_plans': InternetPlansAdapter.health_check(),
                'network_adapter': NetworkAdapter.health_check(),
                'payment_adapter': PaymentAdapter.health_check()
            }
            
            # Determine overall health
            is_healthy = (
                db_healthy and
                all(h.get('status') == 'healthy' for h in external_health.values())
            )
            
            health_status = {
                'service': 'subscription_service',
                'status': 'healthy' if is_healthy else 'unhealthy',
                'database': {
                    'healthy': db_healthy,
                    'connection': 'established' if db_healthy else 'failed'
                },
                'circuit_breaker': {
                    'state': circuit_status,
                    'failure_count': cls._failure_count,
                    'threshold': cls.CIRCUIT_BREAKER_THRESHOLD,
                    'opened_at': cls._circuit_opened_at.isoformat() if cls._circuit_opened_at else None
                },
                'concurrency': {
                    'active_operations': cls._active_operations,
                    'max_concurrent': cls.MAX_CONCURRENT_OPERATIONS,
                    'healthy': cls._active_operations <= cls.MAX_CONCURRENT_OPERATIONS
                },
                'external_services': external_health,
                'recommendations': [],
                'timestamp': timezone.now().isoformat()
            }
            
            # Generate recommendations
            if not db_healthy:
                health_status['recommendations'].append('Check database connection and credentials')
            
            if circuit_status == 'open':
                health_status['recommendations'].append('Circuit breaker is open. Check external service dependencies')
            
            if cls._active_operations >= cls.MAX_CONCURRENT_OPERATIONS:
                health_status['recommendations'].append('Consider increasing MAX_CONCURRENT_OPERATIONS')
            
            for service, health in external_health.items():
                if health.get('status') != 'healthy':
                    health_status['recommendations'].append(f'Check {service} service connectivity')
            
            return health_status
            
        except Exception as e:
            logger.error(f"Subscription service health check failed: {e}", exc_info=True)
            cls._record_failure()
            
            return {
                'service': 'subscription_service',
                'status': 'unhealthy',
                'error': str(e),
                'timestamp': timezone.now().isoformat()
            }
    
    @classmethod
    def _handle_circuit_blocked(cls, operation: str, circuit_state: str) -> Dict[str, Any]:
        """Handle circuit blocked state"""
        return {
            'success': False,
            'error': 'Service temporarily unavailable',
            'operation': operation,
            'circuit_state': circuit_state,
            'message': 'Subscription service is experiencing high load. Please try again later.',
            'retry_after': cls.CIRCUIT_BREAKER_TIMEOUT,
            'timestamp': timezone.now().isoformat()
        }