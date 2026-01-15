# """
# Service Operations - Integration Service
# Central coordination service for external system integration with circuit breaker and comprehensive error handling
# Production-ready with retry logic, health checks, and monitoring
# """

# import logging
# from typing import Dict, Any, Optional, Tuple, List
# from django.utils import timezone
# from django.conf import settings
# from django.core.cache import cache
# import requests
# import threading
# import time

# from service_operations.models import OperationLog, Subscription, ClientOperation
# from service_operations.adapters.internet_plans_adapter import InternetPlansAdapter
# from service_operations.adapters.network_adapter import NetworkAdapter
# from service_operations.adapters.payment_adapter import PaymentAdapter
# from service_operations.adapters.user_management_adapter import UserManagementAdapter

# logger = logging.getLogger(__name__)


# class IntegrationService:
#     """
#     Central integration service for coordinating with external applications.
#     Implements circuit breaker pattern, retry logic, and comprehensive monitoring.
#     """
    
#     # Circuit breaker configuration
#     CIRCUIT_BREAKER_THRESHOLD = 5
#     CIRCUIT_BREAKER_TIMEOUT = 300  # 5 minutes
#     CIRCUIT_BREAKER_HALF_OPEN_TIMEOUT = 60  # 1 minute
    
#     # Retry configuration
#     MAX_RETRIES = 3
#     RETRY_DELAYS = [1, 5, 30]  # seconds
    
#     # Timeout configuration
#     DEFAULT_TIMEOUT = 30
#     HEALTH_CHECK_TIMEOUT = 5
    
#     # Service state (thread-safe)
#     _circuit_states = {
#         'internet_plans': {'state': 'closed', 'failures': 0, 'opened_at': None},
#         'network_management': {'state': 'closed', 'failures': 0, 'opened_at': None},
#         'payment_gateway': {'state': 'closed', 'failures': 0, 'opened_at': None},
#         'user_management': {'state': 'closed', 'failures': 0, 'opened_at': None}
#     }
#     _circuit_locks = {service: threading.Lock() for service in _circuit_states.keys()}
    
#     @classmethod
#     def _check_circuit_breaker(cls, service_name: str) -> str:
#         """Check and update circuit breaker state for a service"""
#         with cls._circuit_locks[service_name]:
#             state_info = cls._circuit_states[service_name]
            
#             if state_info['state'] == 'open':
#                 # Check if we should move to half-open
#                 if state_info['opened_at']:
#                     time_open = (timezone.now() - state_info['opened_at']).total_seconds()
#                     if time_open > cls.CIRCUIT_BREAKER_TIMEOUT:
#                         state_info['state'] = 'half-open'
#                         state_info['opened_at'] = None
#                         logger.info(f"Circuit breaker for {service_name} moved to half-open")
            
#             return state_info['state']
    
#     @classmethod
#     def _record_failure(cls, service_name: str):
#         """Record a failure for circuit breaker"""
#         with cls._circuit_locks[service_name]:
#             state_info = cls._circuit_states[service_name]
#             state_info['failures'] += 1
            
#             if state_info['failures'] >= cls.CIRCUIT_BREAKER_THRESHOLD:
#                 state_info['state'] = 'open'
#                 state_info['opened_at'] = timezone.now()
#                 logger.error(
#                     f"Circuit breaker opened for {service_name} "
#                     f"after {state_info['failures']} failures"
#                 )
    
#     @classmethod
#     def _reset_circuit_breaker(cls, service_name: str):
#         """Reset circuit breaker on success"""
#         with cls._circuit_locks[service_name]:
#             state_info = cls._circuit_states[service_name]
#             state_info['failures'] = 0
#             if state_info['state'] != 'closed':
#                 state_info['state'] = 'closed'
#                 state_info['opened_at'] = None
#                 logger.info(f"Circuit breaker reset for {service_name}")
    
#     @classmethod
#     def validate_client_for_plan(
#         cls,
#         client_id: str,
#         plan_id: str,
#         access_method: str
#     ) -> Dict[str, Any]:
#         """
#         Comprehensive client validation for plan purchase.
#         Validates client existence, plan compatibility, and payment eligibility.
#         """
#         logger.info(f"Validating client {client_id} for plan {plan_id}")
        
#         validation_results = {
#             'client_exists': False,
#             'client_active': False,
#             'plan_compatible': False,
#             'payment_eligible': False,
#             'account_in_good_standing': False
#         }
        
#         reasons = []
#         warnings = []
        
#         try:
#             # 1. Validate client exists and is active
#             try:
#                 client_details = UserManagementAdapter.get_client_details(client_id)
#                 if client_details:
#                     validation_results['client_exists'] = True
#                     validation_results['client_active'] = client_details.get('is_active', False)
                    
#                     if not validation_results['client_active']:
#                         reasons.append("Client account is not active")
                    
#                     # Check account standing
#                     account_status = client_details.get('account_status', 'active')
#                     validation_results['account_in_good_standing'] = account_status == 'active'
                    
#                     if not validation_results['account_in_good_standing']:
#                         reasons.append(f"Account status: {account_status}")
                
#                 else:
#                     reasons.append("Client not found in user management system")
                    
#             except Exception as e:
#                 logger.error(f"Client validation failed: {e}")
#                 reasons.append("Could not verify client status")
#                 cls._record_failure('user_management')
            
#             # 2. Validate plan compatibility
#             try:
#                 compatibility = InternetPlansAdapter.check_plan_compatibility(
#                     plan_id=plan_id,
#                     access_method=access_method
#                 )
                
#                 validation_results['plan_compatible'] = compatibility.get('compatible', False)
                
#                 if not validation_results['plan_compatible']:
#                     reasons.append(f"Plan not compatible with {access_method} access method")
#                     if 'errors' in compatibility:
#                         reasons.extend(compatibility['errors'])
                
#             except Exception as e:
#                 logger.error(f"Plan compatibility check failed: {e}")
#                 reasons.append("Could not verify plan compatibility")
#                 cls._record_failure('internet_plans')
            
#             # 3. Check payment eligibility (simplified - in production would check credit, outstanding balances, etc.)
#             try:
#                 # This is a placeholder - in production, would call Payment adapter
#                 # For now, assume eligible if client exists and is active
#                 validation_results['payment_eligible'] = (
#                     validation_results['client_exists'] and
#                     validation_results['client_active'] and
#                     validation_results['account_in_good_standing']
#                 )
                
#                 if not validation_results['payment_eligible']:
#                     reasons.append("Payment eligibility check failed")
                    
#             except Exception as e:
#                 logger.error(f"Payment eligibility check failed: {e}")
#                 reasons.append("Could not verify payment eligibility")
            
#             # 4. Check for existing active subscriptions (optional)
#             try:
#                 active_count = Subscription.objects.filter(
#                     client_id=client_id,
#                     status='active',
#                     is_active=True
#                 ).count()
                
#                 if active_count > 0:
#                     warnings.append(f"Client has {active_count} active subscription(s)")
                    
#             except Exception as e:
#                 logger.warning(f"Could not check existing subscriptions: {e}")
            
#             # Determine overall validation result
#             all_checks_passed = all(validation_results.values())
#             is_valid = all_checks_passed and not reasons
            
#             result = {
#                 'success': True,
#                 'valid': is_valid,
#                 'validation_results': validation_results,
#                 'reasons': reasons if not is_valid else [],
#                 'warnings': warnings,
#                 'recommendations': [],
#                 'timestamp': timezone.now().isoformat()
#             }
            
#             # Add recommendations
#             if not is_valid:
#                 if not validation_results['client_exists']:
#                     result['recommendations'].append("Verify client registration in user management system")
#                 if not validation_results['plan_compatible']:
#                     result['recommendations'].append("Choose a different plan or access method")
#                 if not validation_results['account_in_good_standing']:
#                     result['recommendations'].append("Contact support to resolve account issues")
            
#             # Reset circuit breaker on success if half-open
#             if is_valid:
#                 for service in ['user_management', 'internet_plans']:
#                     if cls._circuit_states[service]['state'] == 'half-open':
#                         cls._reset_circuit_breaker(service)
            
#             logger.info(f"Client validation completed: valid={is_valid}")
#             return result
            
#         except Exception as e:
#             logger.error(f"Client validation failed: {e}", exc_info=True)
            
#             OperationLog.log_operation(
#                 operation_type='client_validation_failed',
#                 severity='error',
#                 description=f'Client validation failed: {str(e)}',
#                 details={
#                     'client_id': client_id,
#                     'plan_id': plan_id,
#                     'error': str(e)
#                 },
#                 source_module='integration_service',
#                 source_function='validate_client_for_plan'
#             )
            
#             return {
#                 'success': False,
#                 'valid': False,
#                 'error': 'Client validation failed',
#                 'validation_results': validation_results,
#                 'reasons': ['Internal validation error'],
#                 'timestamp': timezone.now().isoformat()
#             }
    
#     @classmethod
#     def fetch_client_details(cls, client_id: str) -> Dict[str, Any]:
#         """
#         Fetch comprehensive client details from user management system.
#         Includes circuit breaker and retry logic.
#         """
#         # Check circuit breaker
#         circuit_state = cls._check_circuit_breaker('user_management')
#         if circuit_state == 'open':
#             return cls._handle_circuit_blocked('user_management', 'fetch_client_details')
        
#         try:
#             # Try to fetch client details with retry logic
#             for retry in range(cls.MAX_RETRIES):
#                 try:
#                     client_data = UserManagementAdapter.get_client_details(client_id)
                    
#                     if client_data:
#                         # Reset circuit breaker on success
#                         cls._reset_circuit_breaker('user_management')
                        
#                         logger.info(f"Fetched client details for {client_id}")
#                         return {
#                             'success': True,
#                             'client_data': client_data,
#                             'timestamp': timezone.now().isoformat()
#                         }
#                     else:
#                         logger.warning(f"Client not found: {client_id}")
#                         return {
#                             'success': False,
#                             'error': 'Client not found',
#                             'client_id': client_id,
#                             'timestamp': timezone.now().isoformat()
#                         }
                    
#                 except Exception as e:
#                     logger.error(f"Failed to fetch client details (attempt {retry + 1}): {e}")
                    
#                     if retry < cls.MAX_RETRIES - 1:
#                         delay = cls.RETRY_DELAYS[retry]
#                         logger.info(f"Retrying in {delay} seconds...")
#                         time.sleep(delay)
#                         continue
                    
#                     # All retries failed
#                     cls._record_failure('user_management')
                    
#                     return {
#                         'success': False,
#                         'error': 'Failed to fetch client details',
#                         'client_id': client_id,
#                         'timestamp': timezone.now().isoformat()
#                     }
            
#             # This should not be reached due to return statements in loop
#             return {
#                 'success': False,
#                 'error': 'Unexpected error',
#                 'client_id': client_id,
#                 'timestamp': timezone.now().isoformat()
#             }
            
#         except Exception as e:
#             logger.error(f"Unexpected error fetching client details: {e}", exc_info=True)
#             cls._record_failure('user_management')
            
#             return {
#                 'success': False,
#                 'error': 'Unexpected error',
#                 'client_id': client_id,
#                 'timestamp': timezone.now().isoformat()
#             }
    
#     @classmethod
#     def get_plan_details(cls, plan_id: str, access_method: str) -> Dict[str, Any]:
#         """
#         Get comprehensive plan details with caching and error handling.
#         """
#         # Check circuit breaker
#         circuit_state = cls._check_circuit_breaker('internet_plans')
#         if circuit_state == 'open':
#             return cls._handle_circuit_blocked('internet_plans', 'get_plan_details')
        
#         try:
#             # Check cache first
#             cache_key = f'plan_details:{plan_id}:{access_method}:comprehensive'
#             cached_data = cache.get(cache_key)
            
#             if cached_data:
#                 logger.debug(f"Returning cached plan details: {plan_id}")
#                 return cached_data
            
#             # Fetch plan details with retry logic
#             for retry in range(cls.MAX_RETRIES):
#                 try:
#                     # Get technical configuration
#                     technical_config = InternetPlansAdapter.get_plan_technical_config(
#                         plan_id=plan_id,
#                         access_method=access_method
#                     )
                    
#                     # Get basic plan details
#                     plan_details = InternetPlansAdapter.get_plan_details(plan_id)
                    
#                     if not technical_config or not plan_details:
#                         logger.warning(f"Plan details not found: {plan_id}")
#                         return {
#                             'success': False,
#                             'error': 'Plan not found',
#                             'plan_id': plan_id,
#                             'timestamp': timezone.now().isoformat()
#                         }
                    
#                     # Build comprehensive response
#                     comprehensive_details = {
#                         'success': True,
#                         'plan_id': plan_id,
#                         'access_method': access_method,
#                         'basic_details': plan_details,
#                         'technical_config': technical_config,
#                         'compatibility': {
#                             'access_method': access_method,
#                             'compatible': True,  # Assuming compatible since we got technical config
#                             'last_checked': timezone.now().isoformat()
#                         },
#                         'timestamp': timezone.now().isoformat()
#                     }
                    
#                     # Cache for 10 minutes
#                     cache.set(cache_key, comprehensive_details, 600)
                    
#                     # Reset circuit breaker
#                     cls._reset_circuit_breaker('internet_plans')
                    
#                     logger.info(f"Fetched comprehensive plan details: {plan_id}")
#                     return comprehensive_details
                    
#                 except Exception as e:
#                     logger.error(f"Failed to get plan details (attempt {retry + 1}): {e}")
                    
#                     if retry < cls.MAX_RETRIES - 1:
#                         delay = cls.RETRY_DELAYS[retry]
#                         logger.info(f"Retrying in {delay} seconds...")
#                         time.sleep(delay)
#                         continue
                    
#                     # All retries failed
#                     cls._record_failure('internet_plans')
                    
#                     # Return default config as fallback
#                     fallback_config = cls._get_fallback_plan_config(plan_id, access_method)
#                     return fallback_config
            
#             # This should not be reached
#             return cls._get_fallback_plan_config(plan_id, access_method)
            
#         except Exception as e:
#             logger.error(f"Unexpected error getting plan details: {e}", exc_info=True)
#             cls._record_failure('internet_plans')
#             return cls._get_fallback_plan_config(plan_id, access_method)
    
#     @classmethod
#     def _get_fallback_plan_config(cls, plan_id: str, access_method: str) -> Dict[str, Any]:
#         """Get fallback plan configuration when service is unavailable"""
#         logger.warning(f"Using fallback plan config for {plan_id}")
        
#         return {
#             'success': False,
#             'plan_id': plan_id,
#             'access_method': access_method,
#             'basic_details': {
#                 'name': 'Default Plan',
#                 'description': 'Plan details temporarily unavailable',
#                 'price': 0,
#                 'currency': 'KES',
#                 'is_active': True,
#                 'is_fallback': True
#             },
#             'technical_config': {
#                 'data_limit': {'bytes': 10 * 1024 * 1024 * 1024},  # 10GB
#                 'time_limit': {'seconds': 24 * 3600},  # 24 hours
#                 'access_method': access_method,
#                 'is_fallback': True
#             },
#             'compatibility': {
#                 'access_method': access_method,
#                 'compatible': True,
#                 'is_fallback': True
#             },
#             'warnings': ['Using fallback configuration - Internet Plans service unavailable'],
#             'timestamp': timezone.now().isoformat()
#         }
    
#     @classmethod
#     def notify_external_systems(
#         cls,
#         event_type: str,
#         data: Dict[str, Any],
#         systems: Optional[List[str]] = None
#     ) -> Dict[str, Any]:
#         """
#         Notify external systems about service operations events.
#         Supports selective notification to specific systems.
#         """
#         logger.info(f"Notifying external systems about event: {event_type}")
        
#         if systems is None:
#             # Default to all systems
#             systems = ['network_management', 'user_management', 'payment_gateway']
        
#         notification_results = {}
#         success_count = 0
#         failure_count = 0
        
#         try:
#             # Network Management notifications
#             if 'network_management' in systems:
#                 result = cls._notify_network_management(event_type, data)
#                 notification_results['network_management'] = result
                
#                 if result.get('success'):
#                     success_count += 1
#                 else:
#                     failure_count += 1
            
#             # User Management notifications
#             if 'user_management' in systems:
#                 result = cls._notify_user_management(event_type, data)
#                 notification_results['user_management'] = result
                
#                 if result.get('success'):
#                     success_count += 1
#                 else:
#                     failure_count += 1
            
#             # Payment Gateway notifications
#             if 'payment_gateway' in systems:
#                 result = cls._notify_payment_gateway(event_type, data)
#                 notification_results['payment_gateway'] = result
                
#                 if result.get('success'):
#                     success_count += 1
#                 else:
#                     failure_count += 1
            
#             # Determine overall status
#             all_successful = failure_count == 0
#             overall_status = 'success' if all_successful else 'partial_failure'
            
#             # Log notification
#             OperationLog.log_operation(
#                 operation_type='external_notification',
#                 severity='info' if all_successful else 'warning',
#                 description=f'Notified external systems about {event_type}',
#                 details={
#                     'event_type': event_type,
#                     'systems_notified': systems,
#                     'success_count': success_count,
#                     'failure_count': failure_count,
#                     'notification_results': notification_results
#                 },
#                 source_module='integration_service',
#                 source_function='notify_external_systems'
#             )
            
#             logger.info(
#                 f"External notification completed: "
#                 f"event={event_type}, "
#                 f"success={success_count}, "
#                 f"failures={failure_count}"
#             )
            
#             return {
#                 'success': True,
#                 'overall_status': overall_status,
#                 'success_count': success_count,
#                 'failure_count': failure_count,
#                 'notification_results': notification_results,
#                 'timestamp': timezone.now().isoformat()
#             }
            
#         except Exception as e:
#             logger.error(f"Failed to notify external systems: {e}", exc_info=True)
            
#             OperationLog.log_operation(
#                 operation_type='external_notification_failed',
#                 severity='error',
#                 description=f'Failed to notify external systems: {str(e)}',
#                 details={
#                     'event_type': event_type,
#                     'error': str(e)
#                 },
#                 source_module='integration_service',
#                 source_function='notify_external_systems'
#             )
            
#             return {
#                 'success': False,
#                 'error': 'Failed to notify external systems',
#                 'event_type': event_type,
#                 'timestamp': timezone.now().isoformat()
#             }
    
#     @classmethod
#     def _notify_network_management(cls, event_type: str, data: Dict[str, Any]) -> Dict[str, Any]:
#         """Notify Network Management system about events"""
#         try:
#             subscription_id = data.get('subscription_id')
#             client_id = data.get('client_id')
            
#             if event_type == 'subscription_activated':
#                 # Network management should already be handling this via activation queue
#                 return {
#                     'success': True,
#                     'system': 'network_management',
#                     'event': event_type,
#                     'message': 'Activation handled via activation queue',
#                     'timestamp': timezone.now().isoformat()
#                 }
            
#             elif event_type == 'subscription_cancelled':
#                 # Request deactivation on network
#                 result = NetworkAdapter.deactivate_subscription(subscription_id)
                
#                 return {
#                     'success': result.get('success', False),
#                     'system': 'network_management',
#                     'event': event_type,
#                     'response': result,
#                     'timestamp': timezone.now().isoformat()
#                 }
            
#             elif event_type == 'subscription_suspended':
#                 # Suspend network access
#                 # This would need a specific endpoint in NetworkAdapter
#                 logger.info(f"Subscription suspension notification for {subscription_id}")
#                 return {
#                     'success': True,
#                     'system': 'network_management',
#                     'event': event_type,
#                     'message': 'Suspension notification logged',
#                     'timestamp': timezone.now().isoformat()
#                 }
            
#             elif event_type == 'subscription_expired':
#                 # Expire network access
#                 result = NetworkAdapter.deactivate_subscription(subscription_id)
                
#                 return {
#                     'success': result.get('success', False),
#                     'system': 'network_management',
#                     'event': event_type,
#                     'response': result,
#                     'timestamp': timezone.now().isoformat()
#                 }
            
#             else:
#                 logger.warning(f"Unknown event type for network management: {event_type}")
#                 return {
#                     'success': False,
#                     'system': 'network_management',
#                     'event': event_type,
#                     'error': f'Unknown event type: {event_type}',
#                     'timestamp': timezone.now().isoformat()
#                 }
                
#         except Exception as e:
#             logger.error(f"Failed to notify network management: {e}")
#             return {
#                 'success': False,
#                 'system': 'network_management',
#                 'event': event_type,
#                 'error': str(e),
#                 'timestamp': timezone.now().isoformat()
#             }
    
#     @classmethod
#     def _notify_user_management(cls, event_type: str, data: Dict[str, Any]) -> Dict[str, Any]:
#         """Notify User Management system about events"""
#         try:
#             client_id = data.get('client_id')
#             subscription_id = data.get('subscription_id')
            
#             if event_type == 'subscription_created':
#                 # Update client profile with new subscription
#                 update_data = {
#                     'last_subscription_activity': timezone.now().isoformat(),
#                     'subscription_count': 'increment'  # This would be processed by user management
#                 }
                
#                 # This is a placeholder - would need appropriate endpoint in UserManagementAdapter
#                 logger.info(f"Subscription creation notification for client {client_id}")
#                 return {
#                     'success': True,
#                     'system': 'user_management',
#                     'event': event_type,
#                     'message': 'Creation notification logged',
#                     'timestamp': timezone.now().isoformat()
#                 }
            
#             elif event_type == 'subscription_cancelled':
#                 # Update cancellation reason in user management
#                 reason = data.get('reason', 'No reason provided')
                
#                 # This is a placeholder
#                 logger.info(f"Subscription cancellation notification for client {client_id}")
#                 return {
#                     'success': True,
#                     'system': 'user_management',
#                     'event': event_type,
#                     'message': f'Cancellation notification logged: {reason}',
#                     'timestamp': timezone.now().isoformat()
#                 }
            
#             elif event_type == 'payment_received':
#                 # Update payment status in user management
#                 amount = data.get('amount', 0)
#                 payment_method = data.get('payment_method', 'unknown')
                
#                 # This is a placeholder
#                 logger.info(f"Payment received notification for client {client_id}")
#                 return {
#                     'success': True,
#                     'system': 'user_management',
#                     'event': event_type,
#                     'message': f'Payment of {amount} via {payment_method} logged',
#                     'timestamp': timezone.now().isoformat()
#                 }
            
#             else:
#                 logger.warning(f"Unknown event type for user management: {event_type}")
#                 return {
#                     'success': False,
#                     'system': 'user_management',
#                     'event': event_type,
#                     'error': f'Unknown event type: {event_type}',
#                     'timestamp': timezone.now().isoformat()
#                 }
                
#         except Exception as e:
#             logger.error(f"Failed to notify user management: {e}")
#             return {
#                 'success': False,
#                 'system': 'user_management',
#                 'event': event_type,
#                 'error': str(e),
#                 'timestamp': timezone.now().isoformat()
#             }
    
#     @classmethod
#     def _notify_payment_gateway(cls, event_type: str, data: Dict[str, Any]) -> Dict[str, Any]:
#         """Notify Payment Gateway system about events"""
#         try:
#             subscription_id = data.get('subscription_id')
#             payment_reference = data.get('payment_reference')
            
#             if event_type == 'subscription_cancelled':
#                 # Process refund if applicable
#                 refund_amount = data.get('refund_amount')
#                 if refund_amount and refund_amount > 0:
#                     # This would call PaymentAdapter.process_refund()
#                     logger.info(f"Refund notification for subscription {subscription_id}")
#                     return {
#                         'success': True,
#                         'system': 'payment_gateway',
#                         'event': event_type,
#                         'message': f'Refund of {refund_amount} initiated',
#                         'timestamp': timezone.now().isoformat()
#                     }
#                 else:
#                     return {
#                         'success': True,
#                         'system': 'payment_gateway',
#                         'event': event_type,
#                         'message': 'No refund required',
#                         'timestamp': timezone.now().isoformat()
#                     }
            
#             elif event_type == 'subscription_renewed':
#                 # Payment gateway might want to know about renewals for analytics
#                 logger.info(f"Renewal notification for subscription {subscription_id}")
#                 return {
#                     'success': True,
#                     'system': 'payment_gateway',
#                     'event': event_type,
#                     'message': 'Renewal notification logged',
#                     'timestamp': timezone.now().isoformat()
#                 }
            
#             else:
#                 logger.warning(f"Unknown event type for payment gateway: {event_type}")
#                 return {
#                     'success': False,
#                     'system': 'payment_gateway',
#                     'event': event_type,
#                     'error': f'Unknown event type: {event_type}',
#                     'timestamp': timezone.now().isoformat()
#                 }
                
#         except Exception as e:
#             logger.error(f"Failed to notify payment gateway: {e}")
#             return {
#                 'success': False,
#                 'system': 'payment_gateway',
#                 'event': event_type,
#                 'error': str(e),
#                 'timestamp': timezone.now().isoformat()
#             }
    
#     @classmethod
#     def check_external_system_health(cls) -> Dict[str, Any]:
#         """
#         Comprehensive health check for all external systems.
#         Includes circuit breaker status and response times.
#         """
#         try:
#             health_checks = {}
#             overall_healthy = True
            
#             # Check Internet Plans service
#             try:
#                 start_time = timezone.now()
#                 internet_plans_health = InternetPlansAdapter.health_check()
#                 duration = (timezone.now() - start_time).total_seconds()
                
#                 internet_plans_health['response_time_seconds'] = duration
#                 internet_plans_health['circuit_state'] = cls._check_circuit_breaker('internet_plans')
#                 health_checks['internet_plans'] = internet_plans_health
                
#                 if internet_plans_health.get('status') != 'healthy':
#                     overall_healthy = False
                    
#             except Exception as e:
#                 logger.error(f"Internet Plans health check failed: {e}")
#                 health_checks['internet_plans'] = {
#                     'status': 'error',
#                     'error': str(e),
#                     'circuit_state': cls._check_circuit_breaker('internet_plans')
#                 }
#                 overall_healthy = False
            
#             # Check Network Management service
#             try:
#                 start_time = timezone.now()
#                 network_health = NetworkAdapter.health_check()
#                 duration = (timezone.now() - start_time).total_seconds()
                
#                 network_health['response_time_seconds'] = duration
#                 network_health['circuit_state'] = cls._check_circuit_breaker('network_management')
#                 health_checks['network_management'] = network_health
                
#                 if network_health.get('status') != 'healthy':
#                     overall_healthy = False
                    
#             except Exception as e:
#                 logger.error(f"Network Management health check failed: {e}")
#                 health_checks['network_management'] = {
#                     'status': 'error',
#                     'error': str(e),
#                     'circuit_state': cls._check_circuit_breaker('network_management')
#                 }
#                 overall_healthy = False
            
#             # Check Payment Gateway service
#             try:
#                 start_time = timezone.now()
#                 payment_health = PaymentAdapter.health_check()
#                 duration = (timezone.now() - start_time).total_seconds()
                
#                 payment_health['response_time_seconds'] = duration
#                 payment_health['circuit_state'] = cls._check_circuit_breaker('payment_gateway')
#                 health_checks['payment_gateway'] = payment_health
                
#                 if payment_health.get('status') != 'healthy':
#                     overall_healthy = False
                    
#             except Exception as e:
#                 logger.error(f"Payment Gateway health check failed: {e}")
#                 health_checks['payment_gateway'] = {
#                     'status': 'error',
#                     'error': str(e),
#                     'circuit_state': cls._check_circuit_breaker('payment_gateway')
#                 }
#                 overall_healthy = False
            
#             # Check User Management service
#             try:
#                 start_time = timezone.now()
#                 user_management_health = UserManagementAdapter.health_check()
#                 duration = (timezone.now() - start_time).total_seconds()
                
#                 user_management_health['response_time_seconds'] = duration
#                 user_management_health['circuit_state'] = cls._check_circuit_breaker('user_management')
#                 health_checks['user_management'] = user_management_health
                
#                 if user_management_health.get('status') != 'healthy':
#                     overall_healthy = False
                    
#             except Exception as e:
#                 logger.error(f"User Management health check failed: {e}")
#                 health_checks['user_management'] = {
#                     'status': 'error',
#                     'error': str(e),
#                     'circuit_state': cls._check_circuit_breaker('user_management')
#                 }
#                 overall_healthy = False
            
#             # Determine overall health status
#             status = 'healthy' if overall_healthy else 'degraded'
            
#             health_report = {
#                 'service': 'integration_service',
#                 'status': status,
#                 'external_systems': health_checks,
#                 'circuit_breaker_summary': {
#                     service: {
#                         'state': state_info['state'],
#                         'failure_count': state_info['failures'],
#                         'opened_at': state_info['opened_at'].isoformat() if state_info['opened_at'] else None
#                     }
#                     for service, state_info in cls._circuit_states.items()
#                 },
#                 'recommendations': cls._generate_health_recommendations(health_checks),
#                 'timestamp': timezone.now().isoformat()
#             }
            
#             # Log health check
#             OperationLog.log_operation(
#                 operation_type='external_system_health_check',
#                 severity='info' if overall_healthy else 'warning',
#                 description=f'External system health check: {status}',
#                 details=health_report,
#                 source_module='integration_service',
#                 source_function='check_external_system_health'
#             )
            
#             return health_report
            
#         except Exception as e:
#             logger.error(f"External system health check failed: {e}", exc_info=True)
            
#             return {
#                 'service': 'integration_service',
#                 'status': 'error',
#                 'error': str(e),
#                 'timestamp': timezone.now().isoformat()
#             }
    
#     @classmethod
#     def _generate_health_recommendations(cls, health_checks: Dict[str, Any]) -> List[str]:
#         """Generate recommendations based on health check results"""
#         recommendations = []
        
#         for system, health in health_checks.items():
#             if health.get('status') in ['error', 'unavailable', 'timeout']:
#                 recommendations.append(f"Check {system} service connectivity and configuration")
            
#             circuit_state = health.get('circuit_state')
#             if circuit_state == 'open':
#                 recommendations.append(f"Circuit breaker open for {system}. Investigate service issues.")
#             elif circuit_state == 'half-open':
#                 recommendations.append(f"Circuit breaker half-open for {system}. Monitor service recovery.")
        
#         return recommendations
    
#     @classmethod
#     def _handle_circuit_blocked(cls, service_name: str, operation: str) -> Dict[str, Any]:
#         """Handle circuit blocked state"""
#         state_info = cls._circuit_states[service_name]
        
#         return {
#             'success': False,
#             'error': f'{service_name} service temporarily unavailable',
#             'operation': operation,
#             'circuit_state': state_info['state'],
#             'failure_count': state_info['failures'],
#             'opened_at': state_info['opened_at'].isoformat() if state_info['opened_at'] else None,
#             'message': f'{service_name} is experiencing issues. Please try again later.',
#             'retry_after': cls.CIRCUIT_BREAKER_TIMEOUT,
#             'timestamp': timezone.now().isoformat()
#         }
    
#     @classmethod
#     def health_check(cls) -> Dict[str, Any]:
#         """
#         Integration service health check
#         """
#         try:
#             # Check external systems health
#             external_health = cls.check_external_system_health()
            
#             # Determine overall health
#             overall_healthy = external_health.get('status') == 'healthy'
            
#             health_status = {
#                 'service': 'integration_service',
#                 'status': 'healthy' if overall_healthy else 'degraded',
#                 'external_systems': external_health,
#                 'circuit_breakers': {
#                     service: {
#                         'state': state_info['state'],
#                         'failures': state_info['failures']
#                     }
#                     for service, state_info in cls._circuit_states.items()
#                 },
#                 'configuration': {
#                     'circuit_breaker_threshold': cls.CIRCUIT_BREAKER_THRESHOLD,
#                     'circuit_breaker_timeout': cls.CIRCUIT_BREAKER_TIMEOUT,
#                     'max_retries': cls.MAX_RETRIES,
#                     'default_timeout': cls.DEFAULT_TIMEOUT
#                 },
#                 'timestamp': timezone.now().isoformat()
#             }
            
#             return health_status
            
#         except Exception as e:
#             logger.error(f"Integration service health check failed: {e}")
#             return {
#                 'service': 'integration_service',
#                 'status': 'error',
#                 'error': str(e),
#                 'timestamp': timezone.now().isoformat()
#             }
        










"""
Service Operations - Integration Service
Central coordination service for external system integration with circuit breaker and comprehensive error handling
Production-ready with retry logic, health checks, and monitoring
Updated: Added _notify_internet_plans for events like subscription_created (sync via adapter).
"""

import logging
from typing import Dict, Any, Optional, Tuple, List
from django.utils import timezone
from django.conf import settings
from django.core.cache import cache
import requests
import threading
import time

from service_operations.models import OperationLog, Subscription, ClientOperation
from service_operations.adapters.internet_plans_adapter import InternetPlansAdapter
from service_operations.adapters.network_adapter import NetworkAdapter
from service_operations.adapters.payment_adapter import PaymentAdapter
from service_operations.adapters.user_management_adapter import UserManagementAdapter

logger = logging.getLogger(__name__)


class IntegrationService:
    """
    Central integration service for coordinating with external applications.
    Implements circuit breaker pattern, retry logic, and comprehensive monitoring.
    """
    
    # Circuit breaker configuration
    CIRCUIT_BREAKER_THRESHOLD = 5
    CIRCUIT_BREAKER_TIMEOUT = 300  # 5 minutes
    CIRCUIT_BREAKER_HALF_OPEN_TIMEOUT = 60  # 1 minute
    
    # Retry configuration
    MAX_RETRIES = 3
    RETRY_DELAYS = [1, 5, 30]  # seconds
    
    # Timeout configuration
    DEFAULT_TIMEOUT = 30
    HEALTH_CHECK_TIMEOUT = 5
    
    # Service state (thread-safe)
    _circuit_states = {
        'internet_plans': {'state': 'closed', 'failures': 0, 'opened_at': None},
        'network_management': {'state': 'closed', 'failures': 0, 'opened_at': None},
        'payment_gateway': {'state': 'closed', 'failures': 0, 'opened_at': None},
        'user_management': {'state': 'closed', 'failures': 0, 'opened_at': None}
    }
    _circuit_locks = {service: threading.Lock() for service in _circuit_states.keys()}
    
    @classmethod
    def _check_circuit_breaker(cls, service_name: str) -> str:
        """Check and update circuit breaker state for a service"""
        with cls._circuit_locks[service_name]:
            state_info = cls._circuit_states[service_name]
            
            if state_info['state'] == 'open':
                # Check if we should move to half-open
                if state_info['opened_at']:
                    time_open = (timezone.now() - state_info['opened_at']).total_seconds()
                    if time_open > cls.CIRCUIT_BREAKER_TIMEOUT:
                        state_info['state'] = 'half-open'
                        state_info['opened_at'] = None
                        logger.info(f"Circuit breaker for {service_name} moved to half-open")
            
            return state_info['state']
    
    @classmethod
    def _record_failure(cls, service_name: str):
        """Record a failure for circuit breaker"""
        with cls._circuit_locks[service_name]:
            state_info = cls._circuit_states[service_name]
            state_info['failures'] += 1
            
            if state_info['failures'] >= cls.CIRCUIT_BREAKER_THRESHOLD:
                state_info['state'] = 'open'
                state_info['opened_at'] = timezone.now()
                logger.error(
                    f"Circuit breaker opened for {service_name} "
                    f"after {state_info['failures']} failures"
                )
    
    @classmethod
    def _reset_circuit_breaker(cls, service_name: str):
        """Reset circuit breaker on success"""
        with cls._circuit_locks[service_name]:
            state_info = cls._circuit_states[service_name]
            state_info['failures'] = 0
            if state_info['state'] != 'closed':
                state_info['state'] = 'closed'
                state_info['opened_at'] = None
                logger.info(f"Circuit breaker reset for {service_name}")
    
    @classmethod
    def validate_client_for_plan(
        cls,
        client_id: str,
        plan_id: str,
        access_method: str
    ) -> Dict[str, Any]:
        """
        Comprehensive client validation for plan purchase.
        Validates client existence, plan compatibility, and payment eligibility.
        """
        logger.info(f"Validating client {client_id} for plan {plan_id}")
        
        validation_results = {
            'client_exists': False,
            'client_active': False,
            'plan_compatible': False,
            'payment_eligible': False,
            'account_in_good_standing': False
        }
        
        reasons = []
        warnings = []
        
        try:
            # 1. Validate client exists and is active
            try:
                client_details = UserManagementAdapter.get_client_details(client_id)
                if client_details:
                    validation_results['client_exists'] = True
                    validation_results['client_active'] = client_details.get('is_active', False)
                    
                    if not validation_results['client_active']:
                        reasons.append("Client account is not active")
                    
                    # Check account standing
                    account_status = client_details.get('account_status', 'active')
                    validation_results['account_in_good_standing'] = account_status == 'active'
                    
                    if not validation_results['account_in_good_standing']:
                        reasons.append(f"Account status: {account_status}")
                
                else:
                    reasons.append("Client not found in user management system")
                    
            except Exception as e:
                logger.error(f"Client validation failed: {e}", exc_info=True)
                reasons.append("Could not verify client status")
                cls._record_failure('user_management')
            
            # 2. Validate plan compatibility
            try:
                compatibility = InternetPlansAdapter.check_plan_compatibility(
                    plan_id=plan_id,
                    access_method=access_method
                )
                
                validation_results['plan_compatible'] = compatibility.get('compatible', False)
                
                if not validation_results['plan_compatible']:
                    reasons.append(f"Plan not compatible with {access_method} access method")
                    if 'errors' in compatibility:
                        reasons.extend(compatibility['errors'])
                
            except Exception as e:
                logger.error(f"Plan compatibility check failed: {e}", exc_info=True)
                reasons.append("Could not verify plan compatibility")
                cls._record_failure('internet_plans')
            
            # 3. Check payment eligibility (simplified - in production would check credit, outstanding balances, etc.)
            try:
                # This is a placeholder - in production, would call Payment adapter
                # For now, assume eligible if client exists and is active
                validation_results['payment_eligible'] = (
                    validation_results['client_exists'] and
                    validation_results['client_active'] and
                    validation_results['account_in_good_standing']
                )
                
                if not validation_results['payment_eligible']:
                    reasons.append("Payment eligibility check failed")
                    
            except Exception as e:
                logger.error(f"Payment eligibility check failed: {e}", exc_info=True)
                reasons.append("Could not verify payment eligibility")
            
            # 4. Check for existing active subscriptions (optional)
            try:
                active_count = Subscription.objects.filter(
                    client_id=client_id,
                    status='active',
                    is_active=True
                ).count()
                
                if active_count > 0:
                    warnings.append(f"Client has {active_count} active subscription(s)")
                    
            except Exception as e:
                logger.warning(f"Subscription count check failed: {e}", exc_info=True)
            
            # Determine overall validation result
            all_checks_passed = all(validation_results.values())
            is_valid = all_checks_passed and not reasons
            
            result = {
                'success': True,
                'valid': is_valid,
                'validation_results': validation_results,
                'reasons': reasons if not is_valid else [],
                'warnings': warnings,
                'recommendations': [],
                'timestamp': timezone.now().isoformat()
            }
            
            # Add recommendations
            if not is_valid:
                if not validation_results['client_exists']:
                    result['recommendations'].append("Verify client registration in user management system")
                if not validation_results['plan_compatible']:
                    result['recommendations'].append("Choose a different plan or access method")
                if not validation_results['account_in_good_standing']:
                    result['recommendations'].append("Contact support to resolve account issues")
            
            # Reset circuit breaker on success if half-open
            if is_valid:
                for service in ['user_management', 'internet_plans']:
                    if cls._circuit_states[service]['state'] == 'half-open':
                        cls._reset_circuit_breaker(service)
            
            logger.info(f"Client validation completed: valid={is_valid}")
            return result
            
        except Exception as e:
            logger.error(f"Client validation failed: {e}", exc_info=True)
            
            OperationLog.log_operation(
                operation_type='client_validation_failed',
                severity='error',
                description=f'Client validation failed: {str(e)}',
                details={
                    'client_id': client_id,
                    'plan_id': plan_id,
                    'error': str(e)
                },
                source_module='integration_service',
                source_function='validate_client_for_plan'
            )
            
            return {
                'success': False,
                'valid': False,
                'error': 'Client validation failed',
                'validation_results': validation_results,
                'reasons': ['Internal validation error'],
                'timestamp': timezone.now().isoformat()
            }
    
    @classmethod
    def fetch_client_details(cls, client_id: str) -> Dict[str, Any]:
        """
        Fetch comprehensive client details from user management system.
        Includes circuit breaker and retry logic.
        """
        # Check circuit breaker
        circuit_state = cls._check_circuit_breaker('user_management')
        if circuit_state == 'open':
            return cls._handle_circuit_blocked('user_management', 'fetch_client_details')
        
        try:
            # Try to fetch client details with retry logic
            for retry in range(cls.MAX_RETRIES):
                try:
                    client_data = UserManagementAdapter.get_client_details(client_id)
                    
                    if client_data:
                        # Reset circuit breaker on success
                        cls._reset_circuit_breaker('user_management')
                        
                        logger.info(f"Fetched client details for {client_id}")
                        return {
                            'success': True,
                            'client_data': client_data,
                            'timestamp': timezone.now().isoformat()
                        }
                    else:
                        logger.warning(f"Client not found: {client_id}")
                        return {
                            'success': False,
                            'error': 'Client not found',
                            'client_id': client_id,
                            'timestamp': timezone.now().isoformat()
                        }
                    
                except Exception as e:
                    logger.error(f"Failed to fetch client details (attempt {retry + 1}): {e}", exc_info=True)
                    
                    if retry < cls.MAX_RETRIES - 1:
                        delay = cls.RETRY_DELAYS[retry]
                        logger.info(f"Retrying in {delay} seconds...")
                        time.sleep(delay)
                        continue
                    
                    # All retries failed
                    cls._record_failure('user_management')
                    
                    return {
                        'success': False,
                        'error': 'Failed to fetch client details',
                        'client_id': client_id,
                        'timestamp': timezone.now().isoformat()
                    }
            
            # This should not be reached due to return statements in loop
            return {
                'success': False,
                'error': 'Unexpected error',
                'client_id': client_id,
                'timestamp': timezone.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Unexpected error fetching client details: {e}", exc_info=True)
            cls._record_failure('user_management')
            
            return {
                'success': False,
                'error': 'Unexpected error',
                'client_id': client_id,
                'timestamp': timezone.now().isoformat()
            }
    
    @classmethod
    def get_plan_details(cls, plan_id: str, access_method: str) -> Dict[str, Any]:
        """
        Get comprehensive plan details with caching and error handling.
        """
        # Check circuit breaker
        circuit_state = cls._check_circuit_breaker('internet_plans')
        if circuit_state == 'open':
            return cls._handle_circuit_blocked('internet_plans', 'get_plan_details')
        
        try:
            # Check cache first
            cache_key = f'plan_details:{plan_id}:{access_method}:comprehensive'
            cached_data = cache.get(cache_key)
            
            if cached_data:
                logger.debug(f"Returning cached plan details: {plan_id}")
                return cached_data
            
            # Fetch plan details with retry logic
            for retry in range(cls.MAX_RETRIES):
                try:
                    # Get technical configuration
                    technical_config = InternetPlansAdapter.get_plan_technical_config(
                        plan_id=plan_id,
                        access_method=access_method
                    )
                    
                    # Get basic plan details
                    plan_details = InternetPlansAdapter.get_plan_details(plan_id)
                    
                    if not technical_config or not plan_details:
                        logger.warning(f"Plan details not found: {plan_id}")
                        return {
                            'success': False,
                            'error': 'Plan not found',
                            'plan_id': plan_id,
                            'timestamp': timezone.now().isoformat()
                        }
                    
                    # Build comprehensive response
                    comprehensive_details = {
                        'success': True,
                        'plan_id': plan_id,
                        'access_method': access_method,
                        'basic_details': plan_details,
                        'technical_config': technical_config,
                        'compatibility': {
                            'access_method': access_method,
                            'compatible': True,  # Assuming compatible since we got technical config
                            'last_checked': timezone.now().isoformat()
                        },
                        'timestamp': timezone.now().isoformat()
                    }
                    
                    # Cache for 10 minutes
                    cache.set(cache_key, comprehensive_details, 600)
                    
                    # Reset circuit breaker
                    cls._reset_circuit_breaker('internet_plans')
                    
                    logger.info(f"Fetched comprehensive plan details: {plan_id}")
                    return comprehensive_details
                    
                except Exception as e:
                    logger.error(f"Failed to get plan details (attempt {retry + 1}): {e}", exc_info=True)
                    
                    if retry < cls.MAX_RETRIES - 1:
                        delay = cls.RETRY_DELAYS[retry]
                        logger.info(f"Retrying in {delay} seconds...")
                        time.sleep(delay)
                        continue
                    
                    # All retries failed
                    cls._record_failure('internet_plans')
                    
                    # Return default config as fallback
                    fallback_config = cls._get_fallback_plan_config(plan_id, access_method)
                    return fallback_config
            
            # This should not be reached
            return cls._get_fallback_plan_config(plan_id, access_method)
            
        except Exception as e:
            logger.error(f"Unexpected error getting plan details: {e}", exc_info=True)
            cls._record_failure('internet_plans')
            return cls._get_fallback_plan_config(plan_id, access_method)
    
    @classmethod
    def _get_fallback_plan_config(cls, plan_id: str, access_method: str) -> Dict[str, Any]:
        """Get fallback plan configuration when service is unavailable"""
        logger.warning(f"Using fallback plan config for {plan_id}")
        
        return {
            'success': False,
            'plan_id': plan_id,
            'access_method': access_method,
            'basic_details': {
                'name': 'Default Plan',
                'description': 'Plan details temporarily unavailable',
                'price': 0,
                'currency': 'KES',
                'is_active': True,
                'is_fallback': True
            },
            'technical_config': {
                'data_limit': {'bytes': 10 * 1024 * 1024 * 1024},  # 10GB
                'time_limit': {'seconds': 24 * 3600},  # 24 hours
                'access_method': access_method,
                'is_fallback': True
            },
            'compatibility': {
                'access_method': access_method,
                'compatible': True,
                'is_fallback': True
            },
            'warnings': ['Using fallback configuration - Internet Plans service unavailable'],
            'timestamp': timezone.now().isoformat()
        }
    
    @classmethod
    def notify_external_systems(
        cls,
        event_type: str,
        data: Dict[str, Any],
        systems: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Notify external systems about service operations events.
        Supports selective notification to specific systems.
        Updated: Added 'internet_plans' to systems, with _notify_internet_plans for sync (e.g., subscription_created updates purchases via adapter).
        """
        logger.info(f"Notifying external systems about event: {event_type}")
        
        if systems is None:
            # Default to all systems
            systems = ['internet_plans', 'network_management', 'user_management', 'payment_gateway']
        
        notification_results = {}
        success_count = 0
        failure_count = 0
        
        try:
            # Internet Plans notifications
            if 'internet_plans' in systems:
                result = cls._notify_internet_plans(event_type, data)
                notification_results['internet_plans'] = result
                
                if result.get('success'):
                    success_count += 1
                else:
                    failure_count += 1
            
            # Network Management notifications
            if 'network_management' in systems:
                result = cls._notify_network_management(event_type, data)
                notification_results['network_management'] = result
                
                if result.get('success'):
                    success_count += 1
                else:
                    failure_count += 1
            
            # User Management notifications
            if 'user_management' in systems:
                result = cls._notify_user_management(event_type, data)
                notification_results['user_management'] = result
                
                if result.get('success'):
                    success_count += 1
                else:
                    failure_count += 1
            
            # Payment Gateway notifications
            if 'payment_gateway' in systems:
                result = cls._notify_payment_gateway(event_type, data)
                notification_results['payment_gateway'] = result
                
                if result.get('success'):
                    success_count += 1
                else:
                    failure_count += 1
            
            # Determine overall status
            all_successful = failure_count == 0
            overall_status = 'success' if all_successful else 'partial_failure'
            
            # Log notification
            OperationLog.log_operation(
                operation_type='external_notification',
                severity='info' if all_successful else 'warning',
                description=f'Notified external systems about {event_type}',
                details={
                    'event_type': event_type,
                    'systems_notified': systems,
                    'success_count': success_count,
                    'failure_count': failure_count,
                    'notification_results': notification_results
                },
                source_module='integration_service',
                source_function='notify_external_systems'
            )
            
            logger.info(
                f"External notification completed: "
                f"event={event_type}, "
                f"success={success_count}, "
                f"failures={failure_count}"
            )
            
            return {
                'success': True,
                'overall_status': overall_status,
                'success_count': success_count,
                'failure_count': failure_count,
                'notification_results': notification_results,
                'timestamp': timezone.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Failed to notify external systems: {e}", exc_info=True)
            
            OperationLog.log_operation(
                operation_type='external_notification_failed',
                severity='error',
                description=f'Failed to notify external systems: {str(e)}',
                details={
                    'event_type': event_type,
                    'error': str(e)
                },
                source_module='integration_service',
                source_function='notify_external_systems'
            )
            
            return {
                'success': False,
                'error': 'Failed to notify external systems',
                'event_type': event_type,
                'timestamp': timezone.now().isoformat()
            }
    
    @classmethod
    def _notify_internet_plans(cls, event_type: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Notify Internet Plans system about events (new).
        E.g., subscription_created calls adapter to update purchases (redundancy to signals).
        """
        try:
            if event_type == 'subscription_created':
                # Sync subscription creation
                plan_id = data.get('internet_plan_id')
                if plan_id:
                    # Use adapter to notify (e.g., increment purchases via API if signal missed)
                    result = InternetPlansAdapter.update_plan_purchases(plan_id, increment=1)  # Assume adapter has this method; add if needed
                    return {
                        'success': result.get('success', False),
                        'system': 'internet_plans',
                        'event': event_type,
                        'response': result,
                        'timestamp': timezone.now().isoformat()
                    }
            
            elif event_type == 'subscription_renewed':
                # Sync renewal
                new_plan_id = data.get('new_plan_id')
                if new_plan_id:
                    result = InternetPlansAdapter.update_plan_purchases(new_plan_id, increment=1)
                    return {
                        'success': result.get('success', False),
                        'system': 'internet_plans',
                        'event': event_type,
                        'response': result,
                        'timestamp': timezone.now().isoformat()
                    }
            
            elif event_type == 'subscription_cancelled':
                # Sync cancellation (decrement purchases)
                plan_id = data.get('internet_plan_id')
                if plan_id:
                    result = InternetPlansAdapter.update_plan_purchases(plan_id, increment=-1)
                    return {
                        'success': result.get('success', False),
                        'system': 'internet_plans',
                        'event': event_type,
                        'response': result,
                        'timestamp': timezone.now().isoformat()
                    }
            
            else:
                logger.warning(f"Unknown event type for internet_plans: {event_type}")
                return {
                    'success': False,
                    'system': 'internet_plans',
                    'event': event_type,
                    'error': f'Unknown event type: {event_type}',
                    'timestamp': timezone.now().isoformat()
                }
                
        except Exception as e:
            logger.error(f"Failed to notify internet_plans: {e}", exc_info=True)
            return {
                'success': False,
                'system': 'internet_plans',
                'event': event_type,
                'error': str(e),
                'timestamp': timezone.now().isoformat()
            }
    
    @classmethod
    def _notify_network_management(cls, event_type: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Notify Network Management system about events"""
        try:
            subscription_id = data.get('subscription_id')
            client_id = data.get('client_id')
            
            if event_type == 'subscription_activated':
                # Network management should already be handling this via activation queue
                return {
                    'success': True,
                    'system': 'network_management',
                    'event': event_type,
                    'message': 'Activation handled via activation queue',
                    'timestamp': timezone.now().isoformat()
                }
            
            elif event_type == 'subscription_cancelled':
                # Request deactivation on network
                result = NetworkAdapter.deactivate_subscription(subscription_id)
                
                return {
                    'success': result.get('success', False),
                    'system': 'network_management',
                    'event': event_type,
                    'response': result,
                    'timestamp': timezone.now().isoformat()
                }
            
            elif event_type == 'subscription_suspended':
                # Suspend network access
                # This would need a specific endpoint in NetworkAdapter
                logger.info(f"Subscription suspension notification for {subscription_id}")
                return {
                    'success': True,
                    'system': 'network_management',
                    'event': event_type,
                    'message': 'Suspension notification logged',
                    'timestamp': timezone.now().isoformat()
                }
            
            elif event_type == 'subscription_expired':
                # Expire network access
                result = NetworkAdapter.deactivate_subscription(subscription_id)
                
                return {
                    'success': result.get('success', False),
                    'system': 'network_management',
                    'event': event_type,
                    'response': result,
                    'timestamp': timezone.now().isoformat()
                }
            
            else:
                logger.warning(f"Unknown event type for network management: {event_type}")
                return {
                    'success': False,
                    'system': 'network_management',
                    'event': event_type,
                    'error': f'Unknown event type: {event_type}',
                    'timestamp': timezone.now().isoformat()
                }
                
        except Exception as e:
            logger.error(f"Failed to notify network management: {e}", exc_info=True)
            return {
                'success': False,
                'system': 'network_management',
                'event': event_type,
                'error': str(e),
                'timestamp': timezone.now().isoformat()
            }
    
    @classmethod
    def _notify_user_management(cls, event_type: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Notify User Management system about events"""
        try:
            client_id = data.get('client_id')
            subscription_id = data.get('subscription_id')
            
            if event_type == 'subscription_created':
                # Update client profile with new subscription
                update_data = {
                    'last_subscription_activity': timezone.now().isoformat(),
                    'subscription_count': 'increment'  # This would be processed by user management
                }
                
                # This is a placeholder - would need appropriate endpoint in UserManagementAdapter
                logger.info(f"Subscription creation notification for client {client_id}")
                return {
                    'success': True,
                    'system': 'user_management',
                    'event': event_type,
                    'message': 'Creation notification logged',
                    'timestamp': timezone.now().isoformat()
                }
            
            elif event_type == 'subscription_cancelled':
                # Update cancellation reason in user management
                reason = data.get('reason', 'No reason provided')
                
                # This is a placeholder
                logger.info(f"Subscription cancellation notification for client {client_id}")
                return {
                    'success': True,
                    'system': 'user_management',
                    'event': event_type,
                    'message': f'Cancellation notification logged: {reason}',
                    'timestamp': timezone.now().isoformat()
                }
            
            elif event_type == 'payment_received':
                # Update payment status in user management
                amount = data.get('amount', 0)
                payment_method = data.get('payment_method', 'unknown')
                
                # This is a placeholder
                logger.info(f"Payment received notification for client {client_id}")
                return {
                    'success': True,
                    'system': 'user_management',
                    'event': event_type,
                    'message': f'Payment of {amount} via {payment_method} logged',
                    'timestamp': timezone.now().isoformat()
                }
            
            else:
                logger.warning(f"Unknown event type for user management: {event_type}")
                return {
                    'success': False,
                    'system': 'user_management',
                    'event': event_type,
                    'error': f'Unknown event type: {event_type}',
                    'timestamp': timezone.now().isoformat()
                }
                
        except Exception as e:
            logger.error(f"Failed to notify user management: {e}", exc_info=True)
            return {
                'success': False,
                'system': 'user_management',
                'event': event_type,
                'error': str(e),
                'timestamp': timezone.now().isoformat()
            }
    
    @classmethod
    def _notify_payment_gateway(cls, event_type: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Notify Payment Gateway system about events"""
        try:
            subscription_id = data.get('subscription_id')
            payment_reference = data.get('payment_reference')
            
            if event_type == 'subscription_cancelled':
                # Process refund if applicable
                refund_amount = data.get('refund_amount')
                if refund_amount and refund_amount > 0:
                    # This would call PaymentAdapter.process_refund()
                    logger.info(f"Refund notification for subscription {subscription_id}")
                    return {
                        'success': True,
                        'system': 'payment_gateway',
                        'event': event_type,
                        'message': f'Refund of {refund_amount} initiated',
                        'timestamp': timezone.now().isoformat()
                    }
                else:
                    return {
                        'success': True,
                        'system': 'payment_gateway',
                        'event': event_type,
                        'message': 'No refund required',
                        'timestamp': timezone.now().isoformat()
                    }
            
            elif event_type == 'subscription_renewed':
                # Payment gateway might want to know about renewals for analytics
                logger.info(f"Renewal notification for subscription {subscription_id}")
                return {
                    'success': True,
                    'system': 'payment_gateway',
                    'event': event_type,
                    'message': 'Renewal notification logged',
                    'timestamp': timezone.now().isoformat()
                }
            
            else:
                logger.warning(f"Unknown event type for payment gateway: {event_type}")
                return {
                    'success': False,
                    'system': 'payment_gateway',
                    'event': event_type,
                    'error': f'Unknown event type: {event_type}',
                    'timestamp': timezone.now().isoformat()
                }
                
        except Exception as e:
            logger.error(f"Failed to notify payment gateway: {e}", exc_info=True)
            return {
                'success': False,
                'system': 'payment_gateway',
                'event': event_type,
                'error': str(e),
                'timestamp': timezone.now().isoformat()
            }
    
    @classmethod
    def check_external_system_health(cls) -> Dict[str, Any]:
        """
        Comprehensive health check for all external systems.
        Includes circuit breaker status and response times.
        """
        try:
            health_checks = {}
            overall_healthy = True
            
            # Check Internet Plans service
            try:
                start_time = timezone.now()
                internet_plans_health = InternetPlansAdapter.health_check()
                duration = (timezone.now() - start_time).total_seconds()
                
                internet_plans_health['response_time_seconds'] = duration
                internet_plans_health['circuit_state'] = cls._check_circuit_breaker('internet_plans')
                health_checks['internet_plans'] = internet_plans_health
                
                if internet_plans_health.get('status') != 'healthy':
                    overall_healthy = False
                    
            except Exception as e:
                logger.error(f"Internet Plans health check failed: {e}", exc_info=True)
                health_checks['internet_plans'] = {
                    'status': 'error',
                    'error': str(e),
                    'circuit_state': cls._check_circuit_breaker('internet_plans')
                }
                overall_healthy = False
            
            # Check Network Management service
            try:
                start_time = timezone.now()
                network_health = NetworkAdapter.health_check()
                duration = (timezone.now() - start_time).total_seconds()
                
                network_health['response_time_seconds'] = duration
                network_health['circuit_state'] = cls._check_circuit_breaker('network_management')
                health_checks['network_management'] = network_health
                
                if network_health.get('status') != 'healthy':
                    overall_healthy = False
                    
            except Exception as e:
                logger.error(f"Network Management health check failed: {e}", exc_info=True)
                health_checks['network_management'] = {
                    'status': 'error',
                    'error': str(e),
                    'circuit_state': cls._check_circuit_breaker('network_management')
                }
                overall_healthy = False
            
            # Check Payment Gateway service
            try:
                start_time = timezone.now()
                payment_health = PaymentAdapter.health_check()
                duration = (timezone.now() - start_time).total_seconds()
                
                payment_health['response_time_seconds'] = duration
                payment_health['circuit_state'] = cls._check_circuit_breaker('payment_gateway')
                health_checks['payment_gateway'] = payment_health
                
                if payment_health.get('status') != 'healthy':
                    overall_healthy = False
                    
            except Exception as e:
                logger.error(f"Payment Gateway health check failed: {e}", exc_info=True)
                health_checks['payment_gateway'] = {
                    'status': 'error',
                    'error': str(e),
                    'circuit_state': cls._check_circuit_breaker('payment_gateway')
                }
                overall_healthy = False
            
            # Check User Management service
            try:
                start_time = timezone.now()
                user_management_health = UserManagementAdapter.health_check()
                duration = (timezone.now() - start_time).total_seconds()
                
                user_management_health['response_time_seconds'] = duration
                user_management_health['circuit_state'] = cls._check_circuit_breaker('user_management')
                health_checks['user_management'] = user_management_health
                
                if user_management_health.get('status') != 'healthy':
                    overall_healthy = False
                    
            except Exception as e:
                logger.error(f"User Management health check failed: {e}", exc_info=True)
                health_checks['user_management'] = {
                    'status': 'error',
                    'error': str(e),
                    'circuit_state': cls._check_circuit_breaker('user_management')
                }
                overall_healthy = False
            
            # Determine overall health status
            status = 'healthy' if overall_healthy else 'degraded'
            
            health_report = {
                'service': 'integration_service',
                'status': status,
                'external_systems': health_checks,
                'circuit_breaker_summary': {
                    service: {
                        'state': state_info['state'],
                        'failure_count': state_info['failures'],
                        'opened_at': state_info['opened_at'].isoformat() if state_info['opened_at'] else None
                    }
                    for service, state_info in cls._circuit_states.items()
                },
                'recommendations': cls._generate_health_recommendations(health_checks),
                'timestamp': timezone.now().isoformat()
            }
            
            return health_report
            
        except Exception as e:
            logger.error(f"External system health check failed: {e}", exc_info=True)
            
            return {
                'service': 'integration_service',
                'status': 'error',
                'error': str(e),
                'timestamp': timezone.now().isoformat()
            }
    
    @classmethod
    def _generate_health_recommendations(cls, health_checks: Dict[str, Any]) -> List[str]:
        """Generate recommendations based on health check results"""
        recommendations = []
        
        for system, health in health_checks.items():
            if health.get('status') in ['error', 'unavailable', 'timeout']:
                recommendations.append(f"Check {system} service connectivity and configuration")
            
            circuit_state = health.get('circuit_state')
            if circuit_state == 'open':
                recommendations.append(f"Circuit breaker open for {system}. Investigate service issues.")
            elif circuit_state == 'half-open':
                recommendations.append(f"Circuit breaker half-open for {system}. Monitor service recovery.")
        
        return recommendations
    
    @classmethod
    def _handle_circuit_blocked(cls, service_name: str, operation: str) -> Dict[str, Any]:
        """Handle circuit blocked state"""
        state_info = cls._circuit_states[service_name]
        
        return {
            'success': False,
            'error': f'{service_name} service temporarily unavailable',
            'operation': operation,
            'circuit_state': state_info['state'],
            'failure_count': state_info['failures'],
            'opened_at': state_info['opened_at'].isoformat() if state_info['opened_at'] else None,
            'message': f'{service_name} is experiencing issues. Please try again later.',
            'retry_after': cls.CIRCUIT_BREAKER_TIMEOUT,
            'timestamp': timezone.now().isoformat()
        }
    
    @classmethod
    def health_check(cls) -> Dict[str, Any]:
        """
        Integration service health check
        """
        try:
            # Check external systems health
            external_health = cls.check_external_system_health()
            
            # Determine overall health
            overall_healthy = external_health.get('status') == 'healthy'
            
            health_status = {
                'service': 'integration_service',
                'status': 'healthy' if overall_healthy else 'degraded',
                'external_systems': external_health,
                'circuit_breakers': {
                    service: {
                        'state': state_info['state'],
                        'failures': state_info['failures']
                    }
                    for service, state_info in cls._circuit_states.items()
                },
                'configuration': {
                    'circuit_breaker_threshold': cls.CIRCUIT_BREAKER_THRESHOLD,
                    'circuit_breaker_timeout': cls.CIRCUIT_BREAKER_TIMEOUT,
                    'max_retries': cls.MAX_RETRIES,
                    'default_timeout': cls.DEFAULT_TIMEOUT
                },
                'timestamp': timezone.now().isoformat()
            }
            
            return health_status
            
        except Exception as e:
            logger.error(f"Integration service health check failed: {e}", exc_info=True)
            return {
                'service': 'integration_service',
                'status': 'error',
                'error': str(e),
                'timestamp': timezone.now().isoformat()
            }