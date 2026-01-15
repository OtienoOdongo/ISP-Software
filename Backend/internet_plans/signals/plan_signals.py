




# """
# Internet Plans - Signal Definitions
# Signals for plan lifecycle events
# Maintains original signal logic with improvements
# Production-ready with proper error handling
# """

# from django.utils import timezone
# from django.dispatch import Signal
# import logging
# from internet_plans.models.plan_models import InternetPlan

# logger = logging.getLogger(__name__)


# # Signal emitted when a new plan is created
# # Data: {
# #   'plan_id': str,
# #   'plan_name': str,
# #   'plan_type': str,
# #   'price': Decimal,
# #   'category': str,
# #   'access_methods': list,
# #   'created_by': str,
# #   'timestamp': datetime
# # }
# plan_created = Signal()

# # Signal emitted when a plan is updated
# # Data: {
# #   'plan_id': str,
# #   'plan_name': str,
# #   'changes': dict,
# #   'updated_by': str,
# #   'timestamp': datetime
# # }
# plan_updated = Signal()

# # Signal emitted when a plan is deactivated
# # Data: {
# #   'plan_id': str,
# #   'plan_name': str,
# #   'deactivated_by': str,
# #   'reason': str,
# #   'timestamp': datetime
# # }
# plan_deactivated = Signal()

# # Signal emitted when a plan is purchased
# # Data: {
# #   'plan_id': str,
# #   'subscription_id': str,
# #   'client_id': str,
# #   'quantity': int,
# #   'total_amount': Decimal,
# #   'timestamp': datetime
# # }
# plan_purchased = Signal()

# # Signal emitted when plan price changes
# # Data: {
# #   'plan_id': str,
# #   'old_price': Decimal,
# #   'new_price': Decimal,
# #   'changed_by': str,
# #   'reason': str,
# #   'timestamp': datetime
# # }
# plan_price_changed = Signal()

# # Signal emitted when a template is created
# # Data: {
# #   'template_id': str,
# #   'template_name': str,
# #   'category': str,
# #   'base_price': Decimal,
# #   'created_by': str,
# #   'timestamp': datetime
# # }
# template_created = Signal()

# # Signal emitted when a template is updated
# # Data: {
# #   'template_id': str,
# #   'template_name': str,
# #   'changes': dict,
# #   'updated_by': str,
# #   'timestamp': datetime
# # }
# template_updated = Signal()


# def setup_signal_receivers():
#     """
#     Set up signal receivers for Internet Plans app
#     This function is called from apps.py ready() method
#     """
#     try:
#         # Import here to avoid circular imports
#         from django.db.models.signals import post_save, pre_save, post_delete
#         from django.dispatch import receiver
        
#         from internet_plans.models.plan_models import InternetPlan, PlanTemplate
        
#         @receiver(post_save, sender=InternetPlan)
#         def handle_plan_save(sender, instance, created, **kwargs):
#             """
#             Handle plan save signal
#             ORIGINAL LOGIC MAINTAINED with improvements
#             """
#             try:
#                 if created:
#                     # Plan created
#                     plan_created.send(
#                         sender=sender,
#                         plan_id=str(instance.id),
#                         plan_name=instance.name,
#                         plan_type=instance.plan_type,
#                         price=instance.price,
#                         category=instance.category,
#                         access_methods=instance.get_enabled_access_methods(),
#                         created_by=instance.created_by.username if instance.created_by else 'system',
#                         timestamp=instance.created_at
#                     )
#                     logger.info(f"Plan created signal sent: {instance.name}")
                
#                 else:
#                     # Check for price changes
#                     if instance.tracker.has_changed('price'):
#                         old_price = instance.tracker.previous('price')
#                         plan_price_changed.send(
#                             sender=sender,
#                             plan_id=str(instance.id),
#                             old_price=old_price,
#                             new_price=instance.price,
#                             changed_by='system',  # Can be enhanced with request context
#                             reason='Price updated',
#                             timestamp=instance.updated_at
#                         )
#                         logger.info(f"Plan price changed: {instance.name} - {old_price} to {instance.price}")
                    
#                     # Plan updated
#                     changes = instance.tracker.changed()
#                     if changes:
#                         plan_updated.send(
#                             sender=sender,
#                             plan_id=str(instance.id),
#                             plan_name=instance.name,
#                             changes=changes,
#                             updated_by='system',
#                             timestamp=instance.updated_at
#                         )
            
#             except Exception as e:
#                 logger.error(f"Error handling plan save signal: {e}")
        
#         @receiver(pre_save, sender=InternetPlan)
#         def track_plan_changes(sender, instance, **kwargs):
#             """
#             Track plan changes before save
#             NEW: For change detection
#             """
#             if instance.pk:
#                 try:
#                     old_instance = InternetPlan.objects.get(pk=instance.pk)
#                     instance.tracker = type('Tracker', (), {
#                         'has_changed': lambda field: getattr(old_instance, field) != getattr(instance, field),
#                         'previous': lambda field: getattr(old_instance, field),
#                         'changed': lambda: {
#                             field: getattr(old_instance, field)
#                             for field in instance._meta.fields
#                             if hasattr(old_instance, field) and 
#                                getattr(old_instance, field) != getattr(instance, field)
#                         }
#                     })()
#                 except InternetPlan.DoesNotExist:
#                     instance.tracker = type('Tracker', (), {
#                         'has_changed': lambda field: False,
#                         'previous': lambda field: None,
#                         'changed': lambda: {}
#                     })()
#             else:
#                 instance.tracker = type('Tracker', (), {
#                     'has_changed': lambda field: False,
#                     'previous': lambda field: None,
#                     'changed': lambda: {}
#                 })()
        
#         @receiver(post_save, sender=PlanTemplate)
#         def handle_template_save(sender, instance, created, **kwargs):
#             """
#             Handle template save signal
#             """
#             try:
#                 if created:
#                     template_created.send(
#                         sender=sender,
#                         template_id=str(instance.id),
#                         template_name=instance.name,
#                         category=instance.category,
#                         base_price=instance.base_price,
#                         created_by=instance.created_by.username if instance.created_by else 'system',
#                         timestamp=instance.created_at
#                     )
#                     logger.info(f"Template created signal sent: {instance.name}")
                
#                 else:
#                     # Template updated
#                     template_updated.send(
#                         sender=sender,
#                         template_id=str(instance.id),
#                         template_name=instance.name,
#                         updated_by='system',
#                         timestamp=instance.updated_at
#                     )
            
#             except Exception as e:
#                 logger.error(f"Error handling template save signal: {e}")
        
#         # Connect to external app signals
#         try:
#             # Connect to UserManagement signals if available
#             from user_management.signals.client_signals import client_subscribed
            
#             @receiver(client_subscribed)
#             def handle_client_subscription(sender, **kwargs):
#                 """
#                 Handle client subscription from UserManagement
#                 NEW: Integration with UserManagement
#                 """
#                 try:
#                     subscription_data = kwargs
#                     plan_id = subscription_data.get('plan_id')
                    
#                     if plan_id:
#                         plan_purchased.send(
#                             sender=sender,
#                             plan_id=plan_id,
#                             subscription_id=subscription_data.get('subscription_id'),
#                             client_id=subscription_data.get('client_id'),
#                             quantity=subscription_data.get('quantity', 1),
#                             total_amount=subscription_data.get('total_amount', 0),
#                             timestamp=subscription_data.get('timestamp')
#                         )
#                         logger.info(f"Plan purchased signal sent for plan: {plan_id}")
                
#                 except Exception as e:
#                     logger.error(f"Error handling client subscription signal: {e}")
        
#         except ImportError:
#             logger.warning("UserManagement signals not available - subscription integration disabled")
        
#         # Connect to NetworkManagement signals if available
#         try:
#             from network_management.signals.network_signals import subscription_activated
            
#             @receiver(subscription_activated)
#             def handle_network_activation(sender, **kwargs):
#                 """
#                 Handle subscription activation from NetworkManagement
#                 NEW: Integration with NetworkManagement
#                 """
#                 try:
#                     activation_data = kwargs
#                     plan_id = activation_data.get('plan_id')
                    
#                     if plan_id:
#                         # Update plan purchase count
#                         from internet_plans.services.plan_service import PlanService
#                         PlanService.update_plan_purchases(plan_id)
                        
#                         logger.info(f"Plan purchase count updated for plan: {plan_id}")
                
#                 except Exception as e:
#                     logger.error(f"Error handling network activation signal: {e}")
        
#         except ImportError:
#             logger.warning("NetworkManagement signals not available - activation integration disabled")
        
#         # Connect to Payment app signals if available
#         try:
#             from payment.signals.payment_signals import payment_completed
            
#             @receiver(payment_completed)
#             def handle_payment_completion(sender, **kwargs):
#                 """
#                 Handle payment completion from Payment app
#                 NEW: Integration with Payment app
#                 """
#                 try:
#                     payment_data = kwargs
#                     plan_id = payment_data.get('metadata', {}).get('plan_id')
                    
#                     if plan_id:
#                         plan_purchased.send(
#                             sender=sender,
#                             plan_id=plan_id,
#                             subscription_id=payment_data.get('subscription_id'),
#                             client_id=payment_data.get('client_id'),
#                             quantity=1,
#                             total_amount=payment_data.get('amount'),
#                             timestamp=payment_data.get('completed_at')
#                         )
#                         logger.info(f"Payment completed for plan: {plan_id}")
                
#                 except Exception as e:
#                     logger.error(f"Error handling payment completion signal: {e}")
        
#         except ImportError:
#             logger.warning("Payment app signals not available - payment integration disabled")
        
#         logger.info("Internet Plans signal receivers set up successfully")
        
#     except Exception as e:
#         logger.error(f"Failed to setup signal receivers: {e}", exc_info=True)


# def emit_plan_purchased_signal(plan_id, subscription_id, client_id, quantity=1, total_amount=0):
#     """
#     Helper function to emit plan purchased signal
#     Can be called from anywhere in the codebase
#     """
#     try:
#         plan_purchased.send(
#             sender=InternetPlan,
#             plan_id=plan_id,
#             subscription_id=subscription_id,
#             client_id=client_id,
#             quantity=quantity,
#             total_amount=total_amount,
#             timestamp=timezone.now()
#         )
#         logger.info(f"Plan purchased signal emitted: {plan_id}")
#     except Exception as e:
#         logger.error(f"Failed to emit plan purchased signal: {e}")


# def emit_plan_price_changed_signal(plan_id, old_price, new_price, changed_by='system', reason=''):
#     """
#     Helper function to emit plan price changed signal
#     """
#     try:
#         plan_price_changed.send(
#             sender=InternetPlan,
#             plan_id=plan_id,
#             old_price=old_price,
#             new_price=new_price,
#             changed_by=changed_by,
#             reason=reason,
#             timestamp=timezone.now()
#         )
#         logger.info(f"Plan price changed signal emitted: {plan_id}")
#     except Exception as e:
#         logger.error(f"Failed to emit plan price changed signal: {e}")


# # Import timezone at module level
# from django.utils import timezone





"""
Internet Plans - Signal Definitions
Signals for plan lifecycle events
Maintains original signal logic with improvements
Production-ready with proper error handling
Updated: Added receivers for service_operations signals (e.g., subscription_activated increments purchases); bidirectional integration.
"""

from django.utils import timezone
from django.dispatch import Signal
import logging
from django.db.models.signals import post_save, pre_save, post_delete
from django.dispatch import receiver
from django.db import transaction
from django.core.cache import cache

from internet_plans.models.plan_models import InternetPlan, PlanTemplate

logger = logging.getLogger(__name__)


# Signal emitted when a new plan is created
# Data: {
#   'plan_id': str,
#   'plan_name': str,
#   'plan_type': str,
#   'price': Decimal,
#   'category': str,
#   'access_methods': list,
#   'created_by': str,
#   'timestamp': datetime
# }
plan_created = Signal()

# Signal emitted when a plan is updated
# Data: {
#   'plan_id': str,
#   'plan_name': str,
#   'changes': dict,
#   'updated_by': str,
#   'timestamp': datetime
# }
plan_updated = Signal()

# Signal emitted when a plan is deactivated
# Data: {
#   'plan_id': str,
#   'plan_name': str,
#   'deactivated_by': str,
#   'reason': str,
#   'timestamp': datetime
# }
plan_deactivated = Signal()

# Signal emitted when a plan is purchased
# Data: {
#   'plan_id': str,
#   'subscription_id': str,
#   'client_id': str,
#   'quantity': int,
#   'total_amount': Decimal,
#   'timestamp': datetime
# }
plan_purchased = Signal()

# Signal emitted when plan price changes
# Data: {
#   'plan_id': str,
#   'old_price': Decimal,
#   'new_price': Decimal,
#   'changed_by': str,
#   'reason': str,
#   'timestamp': datetime
# }
plan_price_changed = Signal()

# Signal emitted when a template is created
# Data: {
#   'template_id': str,
#   'template_name': str,
#   'category': str,
#   'base_price': Decimal,
#   'created_by': str,
#   'timestamp': datetime
# }
template_created = Signal()

# Signal emitted when a template is updated
# Data: {
#   'template_id': str,
#   'template_name': str,
#   'changes': dict,
#   'updated_by': str,
#   'timestamp': datetime
# }
template_updated = Signal()


def setup_signal_receivers():
    """
    Set up signal receivers for Internet Plans app
    This function is called from apps.py ready() method
    Updated: Added receivers for service_operations signals; bidirectional.
    """
    try:
        # Import here to avoid circular imports
        
        @receiver(post_save, sender=InternetPlan)
        def handle_plan_save(sender, instance, created, **kwargs):
            """
            Handle plan save signal
            ORIGINAL LOGIC MAINTAINED with improvements
            """
            try:
                if created:
                    # Plan created
                    plan_created.send(
                        sender=sender,
                        plan_id=str(instance.id),
                        plan_name=instance.name,
                        plan_type=instance.plan_type,
                        price=instance.price,
                        category=instance.category,
                        access_methods=instance.get_enabled_access_methods(),
                        created_by=instance.created_by.username if instance.created_by else 'system',
                        timestamp=instance.created_at
                    )
                    logger.info(f"Plan created signal sent: {instance.name}")
                
                else:
                    # Check for price changes
                    if instance.tracker.has_changed('price'):
                        old_price = instance.tracker.previous('price')
                        plan_price_changed.send(
                            sender=sender,
                            plan_id=str(instance.id),
                            old_price=old_price,
                            new_price=instance.price,
                            changed_by='system',  # Can be enhanced with request context
                            reason='Price updated',
                            timestamp=instance.updated_at
                        )
                        logger.info(f"Plan price changed: {instance.name} - {old_price} to {instance.price}")
                    
                    # Plan updated
                    changes = instance.tracker.changed()
                    if changes:
                        plan_updated.send(
                            sender=sender,
                            plan_id=str(instance.id),
                            plan_name=instance.name,
                            changes=changes,
                            updated_by='system',
                            timestamp=instance.updated_at
                        )
            
            except Exception as e:
                logger.error(f"Error handling plan save signal: {e}", exc_info=True)
        
        @receiver(pre_save, sender=InternetPlan)
        def track_plan_changes(sender, instance, **kwargs):
            """
            Track plan changes before save
            NEW: For change detection
            """
            if instance.pk:
                try:
                    old_instance = InternetPlan.objects.get(pk=instance.pk)
                    instance.tracker = type('Tracker', (), {
                        'has_changed': lambda field: getattr(old_instance, field) != getattr(instance, field),
                        'previous': lambda field: getattr(old_instance, field),
                        'changed': lambda: {
                            field: getattr(old_instance, field)
                            for field in instance._meta.fields
                            if hasattr(old_instance, field) and 
                               getattr(old_instance, field) != getattr(instance, field)
                        }
                    })()
                except InternetPlan.DoesNotExist:
                    instance.tracker = type('Tracker', (), {
                        'has_changed': lambda field: False,
                        'previous': lambda field: None,
                        'changed': lambda: {}
                    })()
            else:
                instance.tracker = type('Tracker', (), {
                    'has_changed': lambda field: False,
                    'previous': lambda field: None,
                    'changed': lambda: {}
                })()
        
        @receiver(post_save, sender=PlanTemplate)
        def handle_template_save(sender, instance, created, **kwargs):
            """
            Handle template save signal
            """
            try:
                if created:
                    template_created.send(
                        sender=sender,
                        template_id=str(instance.id),
                        template_name=instance.name,
                        category=instance.category,
                        base_price=instance.base_price,
                        created_by=instance.created_by.username if instance.created_by else 'system',
                        timestamp=instance.created_at
                    )
                    logger.info(f"Template created signal sent: {instance.name}")
                
                else:
                    # Template updated
                    template_updated.send(
                        sender=sender,
                        template_id=str(instance.id),
                        template_name=instance.name,
                        updated_by='system',
                        timestamp=instance.updated_at
                    )
            
            except Exception as e:
                logger.error(f"Error handling template save signal: {e}", exc_info=True)
        
        # Connect to service_operations signals for bidirectional integration
        try:
            from service_operations.signals.operation_signals import subscription_activated, subscription_renewed, subscription_cancelled
            
            @receiver(subscription_activated)
            def handle_subscription_activation(sender, **kwargs):
                """
                Handle subscription activation from service_operations
                Increments plan purchases on activation.
                Updated: Atomic update, cache invalidation, error handling.
                """
                try:
                    data = kwargs
                    plan_id = data.get('internet_plan_id') or data.get('plan_id')
                    if plan_id:
                        with transaction.atomic():
                            plan = InternetPlan.objects.select_for_update().get(id=plan_id)
                            plan.purchases = F('purchases') + 1
                            plan.save(update_fields=['purchases', 'updated_at'])
                        
                        # Invalidate stats cache
                        cache.delete("plan_statistics")
                        cache.delete_pattern("plans_filtered:*")
                        cache.delete_pattern("plan_search:*")
                        
                        # Emit plan_purchased signal for further processing
                        plan_purchased.send(
                            sender=InternetPlan,
                            plan_id=plan_id,
                            subscription_id=data.get('subscription_id'),
                            client_id=data.get('client_id'),
                            quantity=1,
                            total_amount=plan.price,  # Assume full price; adjust if needed
                            timestamp=timezone.now()
                        )
                        
                        logger.info(f"Plan purchases incremented on activation: {plan_id}")
                
                except InternetPlan.DoesNotExist:
                    logger.error(f"Plan not found for activation: {plan_id}")
                except Exception as e:
                    logger.error(f"Error handling subscription activation signal: {e}", exc_info=True)
            
            @receiver(subscription_renewed)
            def handle_subscription_renewal(sender, **kwargs):
                """
                Handle subscription renewal from service_operations
                Increments purchases if plan changed.
                Updated: Atomic, cache invalidation, error handling.
                """
                try:
                    data = kwargs
                    new_plan_id = data.get('new_plan_id') or data.get('internet_plan_id')
                    if new_plan_id:
                        with transaction.atomic():
                            plan = InternetPlan.objects.select_for_update().get(id=new_plan_id)
                            plan.purchases = F('purchases') + 1
                            plan.save(update_fields=['purchases', 'updated_at'])
                        
                        # Invalidate stats cache
                        cache.delete("plan_statistics")
                        cache.delete_pattern("plans_filtered:*")
                        cache.delete_pattern("plan_search:*")
                        
                        # Emit plan_purchased signal
                        plan_purchased.send(
                            sender=InternetPlan,
                            plan_id=new_plan_id,
                            subscription_id=data.get('new_subscription_id'),
                            client_id=data.get('client_id'),
                            quantity=1,
                            total_amount=plan.price,
                            timestamp=timezone.now()
                        )
                        
                        logger.info(f"Plan purchases incremented on renewal: {new_plan_id}")
                
                except InternetPlan.DoesNotExist:
                    logger.error(f"Plan not found for renewal: {new_plan_id}")
                except Exception as e:
                    logger.error(f"Error handling subscription renewal signal: {e}", exc_info=True)
            
            @receiver(subscription_cancelled)
            def handle_subscription_cancellation(sender, **kwargs):
                """
                Handle subscription cancellation from service_operations
                Decrements purchases if applicable (e.g., for stats adjustment).
                Updated: Atomic, cache invalidation, error handling.
                """
                try:
                    data = kwargs
                    plan_id = data.get('internet_plan_id') or data.get('plan_id')
                    if plan_id:
                        with transaction.atomic():
                            plan = InternetPlan.objects.select_for_update().get(id=plan_id)
                            plan.purchases = F('purchases') - 1 if plan.purchases > 0 else 0
                            plan.save(update_fields=['purchases', 'updated_at'])
                        
                        # Invalidate stats cache
                        cache.delete("plan_statistics")
                        cache.delete_pattern("plans_filtered:*")
                        cache.delete_pattern("plan_search:*")
                        
                        logger.info(f"Plan purchases decremented on cancellation: {plan_id}")
                
                except InternetPlan.DoesNotExist:
                    logger.error(f"Plan not found for cancellation: {plan_id}")
                except Exception as e:
                    logger.error(f"Error handling subscription cancellation signal: {e}", exc_info=True)
        
        except ImportError as e:
            logger.warning(f"service_operations signals not available - bidirectional integration disabled: {e}")
        
        logger.info("Internet Plans signal receivers set up successfully")
        
    except Exception as e:
        logger.error(f"Failed to setup signal receivers: {e}", exc_info=True)


def emit_plan_purchased_signal(plan_id, subscription_id, client_id, quantity=1, total_amount=0):
    """
    Helper function to emit plan purchased signal
    Can be called from anywhere in the codebase
    """
    try:
        plan_purchased.send(
            sender=InternetPlan,
            plan_id=plan_id,
            subscription_id=subscription_id,
            client_id=client_id,
            quantity=quantity,
            total_amount=total_amount,
            timestamp=timezone.now()
        )
        logger.info(f"Plan purchased signal emitted: {plan_id}")
    except Exception as e:
        logger.error(f"Failed to emit plan purchased signal: {e}", exc_info=True)


def emit_plan_price_changed_signal(plan_id, old_price, new_price, changed_by='system', reason=''):
    """
    Helper function to emit plan price changed signal
    """
    try:
        plan_price_changed.send(
            sender=InternetPlan,
            plan_id=plan_id,
            old_price=old_price,
            new_price=new_price,
            changed_by=changed_by,
            reason=reason,
            timestamp=timezone.now()
        )
        logger.info(f"Plan price changed signal emitted: {plan_id}")
    except Exception as e:
        logger.error(f"Failed to emit plan price changed signal: {e}", exc_info=True)


# Import timezone at module level
from django.utils import timezone