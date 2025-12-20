# """
# Service Operations - Signal Definitions and Handlers
# Production-ready signal handling for operation lifecycle events
# Comprehensive signal receivers with error handling and logging
# References only - NO user or payment signal handling directly
# """

# from django.dispatch import Signal
# from django.db.models.signals import post_save, pre_save, post_delete
# from django.dispatch import receiver
# import logging
# from django.utils import timezone
# from django.db import transaction

# logger = logging.getLogger(__name__)


# # ==================== SIGNAL DEFINITIONS ====================

# # Signal emitted when a new subscription is created
# # Data: {
# #   'subscription_id': str,
# #   'client_id': str,
# #   'internet_plan_id': str,
# #   'access_method': str,
# #   'status': str,
# #   'timestamp': datetime
# # }
# subscription_created = Signal()

# # Signal emitted when a subscription is activated
# # Data: {
# #   'subscription_id': str,
# #   'client_id': str,
# #   'internet_plan_id': str,
# #   'router_id': Optional[int],
# #   'access_method': str,
# #   'activation_id': str,
# #   'timestamp': datetime
# # }
# subscription_activated = Signal()

# # Signal emitted when a subscription expires
# # Data: {
# #   'subscription_id': str,
# #   'client_id': str,
# #   'internet_plan_id': str,
# #   'expired_at': datetime
# # }
# subscription_expired = Signal()

# # Signal emitted when a subscription is renewed
# # Data: {
# #   'subscription_id': str,
# #   'client_id': str,
# #   'internet_plan_id': str,
# #   'renewed_at': datetime,
# #   'new_end_date': datetime
# # }
# subscription_renewed = Signal()

# # Signal emitted when a subscription is cancelled
# # Data: {
# #   'subscription_id': str,
# #   'client_id': str,
# #   'internet_plan_id': str,
# #   'cancelled_at': datetime,
# #   'reason': str
# # }
# subscription_cancelled = Signal()

# # Signal emitted when subscription usage is updated
# # Data: {
# #   'subscription_id': str,
# #   'client_id': str,
# #   'data_used': int,
# #   'time_used': int,
# #   'remaining_data': int,
# #   'remaining_time': int,
# #   'timestamp': datetime
# # }
# usage_updated = Signal()

# # Signal emitted when activation is requested
# # Data: {
# #   'activation_id': str,
# #   'subscription_id': str,
# #   'router_id': Optional[int],
# #   'requested_at': datetime
# # }
# activation_requested = Signal()

# # Signal emitted when activation is completed
# # Data: {
# #   'activation_id': str,
# #   'subscription_id': str,
# #   'success': bool,
# #   'completed_at': datetime,
# #   'error_message': Optional[str]
# # }
# activation_completed = Signal()

# # Signal emitted when activation fails
# # Data: {
# #   'activation_id': str,
# #   'subscription_id': str,
# #   'error_message': str,
# #   'error_details': Dict,
# #   'failed_at': datetime,
# #   'retry_count': int
# # }
# activation_failed = Signal()

# # Signal emitted when a client operation is created
# # Data: {
# #   'operation_id': str,
# #   'client_id': str,
# #   'operation_type': str,
# #   'status': str,
# #   'timestamp': datetime
# # }
# client_operation_created = Signal()

# # Signal emitted when a client operation is completed
# # Data: {
# #   'operation_id': str,
# #   'client_id': str,
# #   'operation_type': str,
# #   'outcome': str,
# #   'timestamp': datetime
# # }
# client_operation_completed = Signal()


# # ==================== SIGNAL RECEIVERS ====================

# @receiver(post_save, sender='service_operations.Subscription')
# def handle_subscription_save(sender, instance, created, **kwargs):
#     """
#     Handle subscription save signal with comprehensive tracking.
#     References only - NO user creation.
#     """
#     try:
#         from Backend.service_operations.models.activation_queue_models import OperationLog
        
#         if created:
#             # Subscription created
#             subscription_created.send(
#                 sender=sender,
#                 subscription_id=str(instance.id),
#                 client_id=str(instance.client_id),
#                 internet_plan_id=str(instance.internet_plan_id),
#                 access_method=instance.access_method,
#                 status=instance.status,
#                 timestamp=instance.created_at
#             )
            
#             # Log the creation
#             OperationLog.log_operation(
#                 operation_type='subscription_creation',
#                 severity='info',
#                 subscription=instance,
#                 description=f"Subscription created for client {instance.client_id}",
#                 details={
#                     'plan_id': str(instance.internet_plan_id),
#                     'access_method': instance.access_method,
#                     'status': instance.status
#                 },
#                 source_module='signals',
#                 source_function='handle_subscription_save'
#             )
            
#             logger.info(f"Subscription created signal sent: {instance.id}")
        
#         # Check for status changes
#         if not created and hasattr(instance, '_previous_status'):
#             old_status = instance._previous_status
#             new_status = instance.status
            
#             if old_status != new_status:
#                 # Log status change
#                 OperationLog.log_operation(
#                     operation_type='status_change',
#                     severity='info',
#                     subscription=instance,
#                     description=f"Subscription status changed from {old_status} to {new_status}",
#                     details={
#                         'old_status': old_status,
#                         'new_status': new_status,
#                         'client_id': str(instance.client_id)
#                     },
#                     source_module='signals',
#                     source_function='handle_subscription_save'
#                 )
                
#                 # Emit specific status change signals
#                 if old_status != 'active' and new_status == 'active':
#                     subscription_activated.send(
#                         sender=sender,
#                         subscription_id=str(instance.id),
#                         client_id=str(instance.client_id),
#                         internet_plan_id=str(instance.internet_plan_id),
#                         router_id=instance.router_id,
#                         access_method=instance.access_method,
#                         activation_id=f"act-{instance.id}",
#                         timestamp=timezone.now()
#                     )
#                     logger.info(f"Subscription activated signal sent: {instance.id}")
                
#                 elif new_status == 'expired':
#                     subscription_expired.send(
#                         sender=sender,
#                         subscription_id=str(instance.id),
#                         client_id=str(instance.client_id),
#                         internet_plan_id=str(instance.internet_plan_id),
#                         expired_at=timezone.now()
#                     )
#                     logger.info(f"Subscription expired signal sent: {instance.id}")
                
#                 elif new_status == 'cancelled':
#                     subscription_cancelled.send(
#                         sender=sender,
#                         subscription_id=str(instance.id),
#                         client_id=str(instance.client_id),
#                         internet_plan_id=str(instance.internet_plan_id),
#                         cancelled_at=timezone.now(),
#                         reason=instance.metadata.get('cancellation_reason', 'No reason provided')
#                     )
#                     logger.info(f"Subscription cancelled signal sent: {instance.id}")
                
#                 elif new_status == 'renewed':
#                     subscription_renewed.send(
#                         sender=sender,
#                         subscription_id=str(instance.id),
#                         client_id=str(instance.client_id),
#                         internet_plan_id=str(instance.internet_plan_id),
#                         renewed_at=timezone.now(),
#                         new_end_date=instance.end_date
#                     )
#                     logger.info(f"Subscription renewed signal sent: {instance.id}")
    
#     except Exception as e:
#         logger.error(f"Error handling subscription save signal: {e}", exc_info=True)


# @receiver(pre_save, sender='service_operations.Subscription')
# def track_subscription_changes(sender, instance, **kwargs):
#     """
#     Track subscription changes before save for status change detection.
#     """
#     try:
#         if instance.pk:
#             from service_operations.models.subscription_models import Subscription
#             try:
#                 old_instance = Subscription.objects.get(pk=instance.pk)
#                 instance._previous_status = old_instance.status
#                 instance._previous_end_date = old_instance.end_date
#             except Subscription.DoesNotExist:
#                 instance._previous_status = None
#                 instance._previous_end_date = None
#         else:
#             instance._previous_status = None
#             instance._previous_end_date = None
            
#     except Exception as e:
#         logger.error(f"Error tracking subscription changes: {e}")
#         instance._previous_status = None
#         instance._previous_end_date = None


# @receiver(post_save, sender='service_operations.ActivationQueue')
# def handle_activation_queue_save(sender, instance, created, **kwargs):
#     """
#     Handle activation queue save signal.
#     """
#     try:
#         from Backend.service_operations.models.activation_queue_models import OperationLog
        
#         if created:
#             # Activation requested
#             activation_requested.send(
#                 sender=sender,
#                 activation_id=str(instance.id),
#                 subscription_id=str(instance.subscription.id),
#                 router_id=instance.subscription.router_id,
#                 requested_at=instance.created_at
#             )
            
#             # Log activation request
#             OperationLog.log_operation(
#                 operation_type='activation_requested',
#                 severity='info',
#                 subscription=instance.subscription,
#                 description=f"Activation requested for subscription {instance.subscription.id}",
#                 details={
#                     'queue_item_id': str(instance.id),
#                     'activation_type': instance.activation_type,
#                     'priority': instance.priority
#                 },
#                 source_module='signals',
#                 source_function='handle_activation_queue_save'
#             )
            
#             logger.info(f"Activation requested signal sent: {instance.id}")
        
#         # Check for status changes
#         if not created and hasattr(instance, '_previous_status'):
#             old_status = instance._previous_status
#             new_status = instance.status
            
#             if old_status != new_status:
#                 # Log status change
#                 OperationLog.log_operation(
#                     operation_type='activation_status_change',
#                     severity='info',
#                     subscription=instance.subscription,
#                     description=f"Activation status changed from {old_status} to {new_status}",
#                     details={
#                         'queue_item_id': str(instance.id),
#                         'old_status': old_status,
#                         'new_status': new_status,
#                         'retry_count': instance.retry_count
#                     },
#                     source_module='signals',
#                     source_function='handle_activation_queue_save'
#                 )
                
#                 if new_status == 'completed':
#                     activation_completed.send(
#                         sender=sender,
#                         activation_id=str(instance.id),
#                         subscription_id=str(instance.subscription.id),
#                         success=True,
#                         completed_at=instance.completed_at or timezone.now(),
#                         error_message=None
#                     )
#                     logger.info(f"Activation completed signal sent: {instance.id}")
                
#                 elif new_status == 'failed':
#                     activation_failed.send(
#                         sender=sender,
#                         activation_id=str(instance.id),
#                         subscription_id=str(instance.subscription.id),
#                         error_message=instance.error_message or 'Unknown error',
#                         error_details=instance.error_details or {},
#                         failed_at=timezone.now(),
#                         retry_count=instance.retry_count
#                     )
#                     logger.info(f"Activation failed signal sent: {instance.id}")
    
#     except Exception as e:
#         logger.error(f"Error handling activation queue save signal: {e}", exc_info=True)


# @receiver(pre_save, sender='service_operations.ActivationQueue')
# def track_activation_queue_changes(sender, instance, **kwargs):
#     """
#     Track activation queue changes before save.
#     """
#     try:
#         if instance.pk:
#             from Backend.service_operations.models.activation_queue_models import ActivationQueue
#             try:
#                 old_instance = ActivationQueue.objects.get(pk=instance.pk)
#                 instance._previous_status = old_instance.status
#             except ActivationQueue.DoesNotExist:
#                 instance._previous_status = None
#         else:
#             instance._previous_status = None
            
#     except Exception as e:
#         logger.error(f"Error tracking activation queue changes: {e}")
#         instance._previous_status = None


# @receiver(post_save, sender='service_operations.ClientOperation')
# def handle_client_operation_save(sender, instance, created, **kwargs):
#     """
#     Handle client operation save signal.
#     """
#     try:
#         from Backend.service_operations.models.activation_queue_models import OperationLog
        
#         if created:
#             # Client operation created
#             client_operation_created.send(
#                 sender=sender,
#                 operation_id=str(instance.id),
#                 client_id=str(instance.client_id),
#                 operation_type=instance.operation_type,
#                 status=instance.status,
#                 timestamp=instance.created_at
#             )
            
#             logger.info(f"Client operation created signal sent: {instance.id}")
        
#         # Check for status changes
#         if not created and hasattr(instance, '_previous_status'):
#             old_status = instance._previous_status
#             new_status = instance.status
            
#             if old_status != new_status and new_status == 'completed':
#                 client_operation_completed.send(
#                     sender=sender,
#                     operation_id=str(instance.id),
#                     client_id=str(instance.client_id),
#                     operation_type=instance.operation_type,
#                     outcome=instance.outcome or 'completed',
#                     timestamp=timezone.now()
#                 )
                
#                 # Log completion
#                 OperationLog.log_operation(
#                     operation_type='client_operation_completed',
#                     severity='info',
#                     subscription=instance.subscription,
#                     description=f"Client operation completed: {instance.title}",
#                     details={
#                         'operation_id': str(instance.id),
#                         'operation_type': instance.operation_type,
#                         'outcome': instance.outcome,
#                         'duration_seconds': (
#                             (timezone.now() - instance.requested_at).total_seconds() 
#                             if instance.requested_at else None
#                         )
#                     },
#                     source_module='signals',
#                     source_function='handle_client_operation_save'
#                 )
                
#                 logger.info(f"Client operation completed signal sent: {instance.id}")
    
#     except Exception as e:
#         logger.error(f"Error handling client operation save signal: {e}", exc_info=True)


# @receiver(pre_save, sender='service_operations.ClientOperation')
# def track_client_operation_changes(sender, instance, **kwargs):
#     """
#     Track client operation changes before save.
#     """
#     try:
#         if instance.pk:
#             from service_operations.models.client_operation_models import ClientOperation
#             try:
#                 old_instance = ClientOperation.objects.get(pk=instance.pk)
#                 instance._previous_status = old_instance.status
#                 instance._previous_outcome = old_instance.outcome
#             except ClientOperation.DoesNotExist:
#                 instance._previous_status = None
#                 instance._previous_outcome = None
#         else:
#             instance._previous_status = None
#             instance._previous_outcome = None
            
#     except Exception as e:
#         logger.error(f"Error tracking client operation changes: {e}")
#         instance._previous_status = None
#         instance._previous_outcome = None


# # ==================== EXTERNAL SIGNAL HANDLERS ====================

# def setup_external_signal_handlers():
#     """
#     Set up handlers for signals from external apps.
#     This function should be called during app initialization.
#     """
#     try:
#         # Connect to Payment app signals
#         try:
#             from payment.signals import payment_completed, payment_failed
            
#             @receiver(payment_completed)
#             def handle_payment_completed(sender, **kwargs):
#                 """
#                 Handle payment completion from Payment app.
#                 """
#                 try:
#                     payment_data = kwargs
#                     subscription_id = payment_data.get('metadata', {}).get('subscription_id')
                    
#                     if subscription_id:
#                         logger.info(f"Payment completed for subscription: {subscription_id}")
                        
#                         # Import here to avoid circular imports
#                         from service_operations.services.subscription_service import SubscriptionService
                        
#                         with transaction.atomic():
#                             # Activate subscription
#                             success = SubscriptionService.activate_subscription(
#                                 subscription_id=subscription_id,
#                                 transaction_reference=payment_data.get('reference')
#                             )
                            
#                             if success:
#                                 logger.info(f"Subscription {subscription_id} activated after payment")
#                             else:
#                                 logger.error(f"Failed to activate subscription {subscription_id} after payment")
                
#                 except Exception as e:
#                     logger.error(f"Error handling payment completion signal: {e}", exc_info=True)
            
#             @receiver(payment_failed)
#             def handle_payment_failed(sender, **kwargs):
#                 """
#                 Handle payment failure from Payment app.
#                 """
#                 try:
#                     payment_data = kwargs
#                     subscription_id = payment_data.get('metadata', {}).get('subscription_id')
                    
#                     if subscription_id:
#                         logger.warning(f"Payment failed for subscription: {subscription_id}")
                        
#                         # Update subscription status
#                         from service_operations.models.subscription_models import Subscription
#                         try:
#                             subscription = Subscription.objects.get(id=subscription_id)
#                             subscription.status = 'payment_failed'
#                             subscription.activation_error = f'Payment failed: {payment_data.get("error_message", "Unknown error")}'
#                             subscription.payment_failed_at = timezone.now()
#                             subscription.save()
                            
#                             logger.info(f"Subscription {subscription_id} marked as payment failed")
#                         except Subscription.DoesNotExist:
#                             logger.error(f"Subscription {subscription_id} not found for payment failure")
                
#                 except Exception as e:
#                     logger.error(f"Error handling payment failed signal: {e}", exc_info=True)
            
#             logger.info("Connected to Payment app signals")
            
#         except ImportError as e:
#             logger.warning(f"Payment app signals not available: {e}")
        
#         # Connect to Network Management signals
#         try:
#             from network_management.signals import bandwidth_usage_updated, device_status_changed
            
#             @receiver(bandwidth_usage_updated)
#             def handle_bandwidth_usage_updated(sender, **kwargs):
#                 """
#                 Handle bandwidth usage update from Network Management.
#                 """
#                 try:
#                     usage_data = kwargs
#                     subscription_id = usage_data.get('subscription_id')
#                     data_used = usage_data.get('data_used_bytes', 0)
#                     time_used = usage_data.get('time_used_seconds', 0)
                    
#                     if subscription_id and (data_used > 0 or time_used > 0):
#                         # Update subscription usage
#                         from service_operations.services.subscription_service import SubscriptionService
                        
#                         result = SubscriptionService.update_usage(
#                             subscription_id=subscription_id,
#                             data_used_bytes=data_used,
#                             time_used_seconds=time_used
#                         )
                        
#                         if result.get('success'):
#                             # Emit usage updated signal
#                             usage_updated.send(
#                                 sender=sender,
#                                 subscription_id=subscription_id,
#                                 client_id=usage_data.get('client_id'),
#                                 data_used=data_used,
#                                 time_used=time_used,
#                                 remaining_data=result.get('remaining_data_bytes', 0),
#                                 remaining_time=result.get('remaining_time_seconds', 0),
#                                 timestamp=timezone.now()
#                             )
#                             logger.debug(f"Usage updated for subscription {subscription_id}")
#                         else:
#                             logger.error(f"Failed to update usage for subscription {subscription_id}: {result.get('error')}")
                
#                 except Exception as e:
#                     logger.error(f"Error handling bandwidth usage updated signal: {e}", exc_info=True)
            
#             @receiver(device_status_changed)
#             def handle_device_status_changed(sender, **kwargs):
#                 """
#                 Handle device status change from Network Management.
#                 """
#                 try:
#                     device_data = kwargs
#                     router_id = device_data.get('router_id')
#                     status = device_data.get('status')
                    
#                     if router_id and status == 'offline':
#                         logger.warning(f"Router {router_id} is offline")
                        
#                         # Update subscriptions using this router
#                         from service_operations.models.subscription_models import Subscription
#                         from Backend.service_operations.models.activation_queue_models import OperationLog
                        
#                         affected_subs = Subscription.objects.filter(
#                             router_id=router_id,
#                             status='active',
#                             is_active=True
#                         )
                        
#                         for subscription in affected_subs:
#                             subscription.status = 'suspended'
#                             subscription.metadata['suspension_reason'] = 'router_offline'
#                             subscription.metadata['router_status'] = status
#                             subscription.save()
                            
#                             # Log the suspension
#                             OperationLog.log_operation(
#                                 operation_type='subscription_suspended',
#                                 severity='warning',
#                                 subscription=subscription,
#                                 description=f"Subscription suspended due to router {router_id} offline",
#                                 details={
#                                     'router_id': router_id,
#                                     'router_status': status,
#                                     'reason': 'Router is offline'
#                                 },
#                                 source_module='signals',
#                                 source_function='handle_device_status_changed'
#                             )
                            
#                             logger.info(f"Subscription {subscription.id} suspended due to router {router_id} offline")
                
#                 except Exception as e:
#                     logger.error(f"Error handling device status changed signal: {e}", exc_info=True)
            
#             logger.info("Connected to Network Management signals")
            
#         except ImportError as e:
#             logger.warning(f"Network Management signals not available: {e}")
        
#         logger.info("External signal handlers set up successfully")
        
#     except Exception as e:
#         logger.error(f"Failed to setup external signal handlers: {e}", exc_info=True)


# def setup_signal_receivers():
#     """
#     Main function to set up all signal receivers.
#     This function is called from apps.py ready() method.
#     """
#     try:
#         # Import models to ensure signals are connected
#         from service_operations.models.subscription_models import Subscription
#         from Backend.service_operations.models.activation_queue_models import ActivationQueue
#         from service_operations.models.client_operation_models import ClientOperation
        
#         # Set up external signal handlers
#         setup_external_signal_handlers()
        
#         logger.info("Service Operations signal receivers set up successfully")
        
#     except Exception as e:
#         logger.error(f"Failed to setup signal receivers: {e}", exc_info=True)










"""
Service Operations - Signal Definitions and Handlers
Production-ready signal handling for operation lifecycle events
Comprehensive signal receivers with error handling and logging
References only - NO user or payment signal handling directly
"""

from django.dispatch import Signal
from django.db.models.signals import post_save, pre_save, post_delete
from django.dispatch import receiver
import logging
from django.utils import timezone
from django.db import transaction

from service_operations.models import Subscription, ActivationQueue, ClientOperation, OperationLog

logger = logging.getLogger(__name__)


# ==================== SIGNAL DEFINITIONS ====================

# Signal emitted when a new subscription is created
subscription_created = Signal()

# Signal emitted when a subscription is activated
subscription_activated = Signal()

# Signal emitted when a subscription expires
subscription_expired = Signal()

# Signal emitted when a subscription is renewed
subscription_renewed = Signal()

# Signal emitted when a subscription is cancelled
subscription_cancelled = Signal()

# Signal emitted when subscription usage is updated
usage_updated = Signal()

# Signal emitted when activation is requested
activation_requested = Signal()

# Signal emitted when activation is completed
activation_completed = Signal()

# Signal emitted when activation fails
activation_failed = Signal()

# Signal emitted when a client operation is created
client_operation_created = Signal()

# Signal emitted when a client operation is completed
client_operation_completed = Signal()


# ==================== SIGNAL RECEIVERS ====================

@receiver(post_save, sender=Subscription)
def handle_subscription_save(sender, instance, created, **kwargs):
    """
    Handle subscription save signal with comprehensive tracking.
    References only - NO user creation.
    """
    try:
        if created:
            # Subscription created
            subscription_created.send(
                sender=sender,
                subscription_id=str(instance.id),
                client_id=str(instance.client_id),
                internet_plan_id=str(instance.internet_plan_id),
                client_type=instance.client_type,
                status=instance.status,
                timestamp=instance.created_at
            )
            
            # Log the creation
            OperationLog.log_operation(
                operation_type='subscription_created',
                severity='info',
                subscription=instance,
                description=f"Subscription created for client {instance.client_id}",
                details={
                    'plan_id': str(instance.internet_plan_id),
                    'client_type': instance.client_type,
                    'status': instance.status
                },
                source_module='signals',
                source_function='handle_subscription_save'
            )
            
            logger.info(f"Subscription created signal sent: {instance.id}")
        
        # Check for status changes
        if not created and hasattr(instance, '_previous_status'):
            old_status = instance._previous_status
            new_status = instance.status
            
            if old_status != new_status:
                # Log status change
                OperationLog.log_operation(
                    operation_type='subscription_status_changed',
                    severity='info',
                    subscription=instance,
                    description=f"Subscription status changed from {old_status} to {new_status}",
                    details={
                        'old_status': old_status,
                        'new_status': new_status,
                        'client_id': str(instance.client_id)
                    },
                    source_module='signals',
                    source_function='handle_subscription_save'
                )
                
                # Emit specific status change signals
                if old_status != 'active' and new_status == 'active':
                    subscription_activated.send(
                        sender=sender,
                        subscription_id=str(instance.id),
                        client_id=str(instance.client_id),
                        internet_plan_id=str(instance.internet_plan_id),
                        client_type=instance.client_type,
                        router_id=instance.router_id,
                        timestamp=timezone.now()
                    )
                    logger.info(f"Subscription activated signal sent: {instance.id}")
                
                elif new_status == 'expired':
                    subscription_expired.send(
                        sender=sender,
                        subscription_id=str(instance.id),
                        client_id=str(instance.client_id),
                        internet_plan_id=str(instance.internet_plan_id),
                        expired_at=timezone.now()
                    )
                    logger.info(f"Subscription expired signal sent: {instance.id}")
                
                elif new_status == 'cancelled':
                    subscription_cancelled.send(
                        sender=sender,
                        subscription_id=str(instance.id),
                        client_id=str(instance.client_id),
                        internet_plan_id=str(instance.internet_plan_id),
                        cancelled_at=timezone.now(),
                        reason=instance.metadata.get('cancellation_reason', 'No reason provided')
                    )
                    logger.info(f"Subscription cancelled signal sent: {instance.id}")
                
                elif new_status == 'renewed':
                    subscription_renewed.send(
                        sender=sender,
                        subscription_id=str(instance.id),
                        client_id=str(instance.client_id),
                        internet_plan_id=str(instance.internet_plan_id),
                        renewed_at=timezone.now(),
                        new_end_date=instance.end_date
                    )
                    logger.info(f"Subscription renewed signal sent: {instance.id}")
    
    except Exception as e:
        logger.error(f"Error handling subscription save signal: {e}", exc_info=True)


@receiver(pre_save, sender=Subscription)
def track_subscription_changes(sender, instance, **kwargs):
    """
    Track subscription changes before save for status change detection.
    """
    try:
        if instance.pk:
            try:
                old_instance = Subscription.objects.get(pk=instance.pk)
                instance._previous_status = old_instance.status
                instance._previous_end_date = old_instance.end_date
            except Subscription.DoesNotExist:
                instance._previous_status = None
                instance._previous_end_date = None
        else:
            instance._previous_status = None
            instance._previous_end_date = None
            
    except Exception as e:
        logger.error(f"Error tracking subscription changes: {e}")
        instance._previous_status = None
        instance._previous_end_date = None


@receiver(post_save, sender=ActivationQueue)
def handle_activation_queue_save(sender, instance, created, **kwargs):
    """
    Handle activation queue save signal.
    """
    try:
        if created:
            # Activation requested
            activation_requested.send(
                sender=sender,
                activation_id=str(instance.id),
                subscription_id=str(instance.subscription.id),
                router_id=instance.subscription.router_id,
                requested_at=instance.created_at
            )
            
            # Log activation request
            OperationLog.log_operation(
                operation_type='activation_requested',
                severity='info',
                subscription=instance.subscription,
                description=f"Activation requested for subscription {instance.subscription.id}",
                details={
                    'queue_item_id': str(instance.id),
                    'activation_type': instance.activation_type,
                    'priority': instance.priority
                },
                source_module='signals',
                source_function='handle_activation_queue_save'
            )
            
            logger.info(f"Activation requested signal sent: {instance.id}")
        
        # Check for status changes
        if not created and hasattr(instance, '_previous_status'):
            old_status = instance._previous_status
            new_status = instance.status
            
            if old_status != new_status:
                # Log status change
                OperationLog.log_operation(
                    operation_type='activation_status_changed',
                    severity='info',
                    subscription=instance.subscription,
                    description=f"Activation status changed from {old_status} to {new_status}",
                    details={
                        'queue_item_id': str(instance.id),
                        'old_status': old_status,
                        'new_status': new_status,
                        'retry_count': instance.retry_count
                    },
                    source_module='signals',
                    source_function='handle_activation_queue_save'
                )
                
                if new_status == 'completed':
                    activation_completed.send(
                        sender=sender,
                        activation_id=str(instance.id),
                        subscription_id=str(instance.subscription.id),
                        success=True,
                        completed_at=instance.completed_at or timezone.now(),
                        error_message=None
                    )
                    logger.info(f"Activation completed signal sent: {instance.id}")
                
                elif new_status == 'failed':
                    activation_failed.send(
                        sender=sender,
                        activation_id=str(instance.id),
                        subscription_id=str(instance.subscription.id),
                        error_message=instance.error_message or 'Unknown error',
                        error_details=instance.error_details or {},
                        failed_at=timezone.now(),
                        retry_count=instance.retry_count
                    )
                    logger.info(f"Activation failed signal sent: {instance.id}")
    
    except Exception as e:
        logger.error(f"Error handling activation queue save signal: {e}", exc_info=True)


@receiver(pre_save, sender=ActivationQueue)
def track_activation_queue_changes(sender, instance, **kwargs):
    """
    Track activation queue changes before save.
    """
    try:
        if instance.pk:
            try:
                old_instance = ActivationQueue.objects.get(pk=instance.pk)
                instance._previous_status = old_instance.status
            except ActivationQueue.DoesNotExist:
                instance._previous_status = None
        else:
            instance._previous_status = None
            
    except Exception as e:
        logger.error(f"Error tracking activation queue changes: {e}")
        instance._previous_status = None


@receiver(post_save, sender=ClientOperation)
def handle_client_operation_save(sender, instance, created, **kwargs):
    """
    Handle client operation save signal.
    """
    try:
        if created:
            # Client operation created
            client_operation_created.send(
                sender=sender,
                operation_id=str(instance.id),
                client_id=str(instance.client_id),
                operation_type=instance.operation_type,
                status=instance.status,
                timestamp=instance.created_at
            )
            
            logger.info(f"Client operation created signal sent: {instance.id}")
        
        # Check for status changes
        if not created and hasattr(instance, '_previous_status'):
            old_status = instance._previous_status
            new_status = instance.status
            
            if old_status != new_status and new_status == 'completed':
                client_operation_completed.send(
                    sender=sender,
                    operation_id=str(instance.id),
                    client_id=str(instance.client_id),
                    operation_type=instance.operation_type,
                    outcome=instance.result_data.get('outcome', 'completed'),
                    timestamp=timezone.now()
                )
                
                # Log completion
                OperationLog.log_operation(
                    operation_type='client_operation_completed',
                    severity='info',
                    subscription=instance.subscription,
                    description=f"Client operation completed: {instance.title}",
                    details={
                        'operation_id': str(instance.id),
                        'operation_type': instance.operation_type,
                        'outcome': instance.result_data.get('outcome'),
                        'duration_seconds': (
                            (timezone.now() - instance.requested_at).total_seconds() 
                            if instance.requested_at else None
                        )
                    },
                    source_module='signals',
                    source_function='handle_client_operation_save'
                )
                
                logger.info(f"Client operation completed signal sent: {instance.id}")
    
    except Exception as e:
        logger.error(f"Error handling client operation save signal: {e}", exc_info=True)


@receiver(pre_save, sender=ClientOperation)
def track_client_operation_changes(sender, instance, **kwargs):
    """
    Track client operation changes before save.
    """
    try:
        if instance.pk:
            try:
                old_instance = ClientOperation.objects.get(pk=instance.pk)
                instance._previous_status = old_instance.status
                instance._previous_result_data = old_instance.result_data
            except ClientOperation.DoesNotExist:
                instance._previous_status = None
                instance._previous_result_data = None
        else:
            instance._previous_status = None
            instance._previous_result_data = None
            
    except Exception as e:
        logger.error(f"Error tracking client operation changes: {e}")
        instance._previous_status = None
        instance._previous_result_data = None


# ==================== EXTERNAL SIGNAL HANDLERS ====================

def setup_external_signal_handlers():
    """
    Set up handlers for signals from external apps.
    This function should be called during app initialization.
    """
    try:
        # Connect to Payment app signals
        try:
            from payments.signals import payment_completed, payment_failed
            
            @receiver(payment_completed)
            def handle_payment_completed(sender, **kwargs):
                """
                Handle payment completion from Payment app.
                ONLY NOTIFY - business logic is in services
                """
                try:
                    payment_data = kwargs
                    subscription_id = payment_data.get('subscription_id')
                    
                    if subscription_id:
                        logger.info(f"Payment completed for subscription: {subscription_id}")
                        
                        # Just log the event - business logic is handled by subscription service
                        OperationLog.log_operation(
                            operation_type='payment_completed',
                            severity='info',
                            subscription_id=subscription_id,
                            description=f"Payment completed via {payment_data.get('payment_method', 'unknown')}",
                            details={
                                'transaction_reference': payment_data.get('reference'),
                                'amount': payment_data.get('amount'),
                                'currency': payment_data.get('currency')
                            },
                            source_module='signals',
                            source_function='handle_payment_completed'
                        )
                
                except Exception as e:
                    logger.error(f"Error handling payment completion signal: {e}", exc_info=True)
            
            @receiver(payment_failed)
            def handle_payment_failed(sender, **kwargs):
                """
                Handle payment failure from Payment app.
                ONLY NOTIFY - business logic is in services
                """
                try:
                    payment_data = kwargs
                    subscription_id = payment_data.get('subscription_id')
                    
                    if subscription_id:
                        logger.warning(f"Payment failed for subscription: {subscription_id}")
                        
                        # Just log the event
                        OperationLog.log_operation(
                            operation_type='payment_failed',
                            severity='warning',
                            subscription_id=subscription_id,
                            description=f"Payment failed via {payment_data.get('payment_method', 'unknown')}",
                            details={
                                'error': payment_data.get('error_message', 'Unknown error'),
                                'transaction_reference': payment_data.get('reference')
                            },
                            source_module='signals',
                            source_function='handle_payment_failed'
                        )
                
                except Exception as e:
                    logger.error(f"Error handling payment failed signal: {e}", exc_info=True)
            
            logger.info("Connected to Payment app signals")
            
        except ImportError as e:
            logger.warning(f"Payment app signals not available: {e}")
        
        # Connect to Network Management signals
        try:
            from network_management.signals import bandwidth_usage_updated, device_status_changed
            
            @receiver(bandwidth_usage_updated)
            def handle_bandwidth_usage_updated(sender, **kwargs):
                """
                Handle bandwidth usage update from Network Management.
                ONLY NOTIFY - business logic is in services
                """
                try:
                    usage_data = kwargs
                    subscription_id = usage_data.get('subscription_id')
                    data_used = usage_data.get('data_used_bytes', 0)
                    time_used = usage_data.get('time_used_seconds', 0)
                    
                    if subscription_id and (data_used > 0 or time_used > 0):
                        # Log the usage update event
                        OperationLog.log_operation(
                            operation_type='usage_updated',
                            severity='info',
                            subscription_id=subscription_id,
                            description=f"Usage updated: {data_used} bytes, {time_used} seconds",
                            details={
                                'data_used_bytes': data_used,
                                'time_used_seconds': time_used,
                                'client_id': usage_data.get('client_id')
                            },
                            source_module='signals',
                            source_function='handle_bandwidth_usage_updated'
                        )
                        
                        # Emit usage updated signal (for other services to listen)
                        usage_updated.send(
                            sender=sender,
                            subscription_id=subscription_id,
                            client_id=usage_data.get('client_id'),
                            data_used=data_used,
                            time_used=time_used,
                            timestamp=timezone.now()
                        )
                        logger.debug(f"Usage updated signal sent for subscription {subscription_id}")
                
                except Exception as e:
                    logger.error(f"Error handling bandwidth usage updated signal: {e}", exc_info=True)
            
            @receiver(device_status_changed)
            def handle_device_status_changed(sender, **kwargs):
                """
                Handle device status change from Network Management.
                ONLY NOTIFY - business logic is in services
                """
                try:
                    device_data = kwargs
                    router_id = device_data.get('router_id')
                    status = device_data.get('status')
                    
                    if router_id and status == 'offline':
                        logger.warning(f"Router {router_id} is offline")
                        
                        # Log the router status change
                        OperationLog.log_operation(
                            operation_type='router_status_changed',
                            severity='warning',
                            description=f"Router {router_id} status changed to {status}",
                            details={
                                'router_id': router_id,
                                'status': status,
                                'timestamp': timezone.now().isoformat()
                            },
                            source_module='signals',
                            source_function='handle_device_status_changed'
                        )
                
                except Exception as e:
                    logger.error(f"Error handling device status changed signal: {e}", exc_info=True)
            
            logger.info("Connected to Network Management signals")
            
        except ImportError as e:
            logger.warning(f"Network Management signals not available: {e}")
        
        logger.info("External signal handlers set up successfully")
        
    except Exception as e:
        logger.error(f"Failed to setup external signal handlers: {e}", exc_info=True)


def setup_signal_receivers():
    """
    Main function to set up all signal receivers.
    This function is called from apps.py ready() method.
    """
    try:
        # Import models to ensure signals are connected
        from service_operations.models import Subscription, ActivationQueue, ClientOperation
        
        # Set up external signal handlers
        setup_external_signal_handlers()
        
        logger.info("Service Operations signal receivers set up successfully")
        
    except Exception as e:
        logger.error(f"Failed to setup signal receivers: {e}", exc_info=True)