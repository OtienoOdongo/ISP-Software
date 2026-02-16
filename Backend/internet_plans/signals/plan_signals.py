



# """
# Internet Plans - Signal Definitions
# Signals for plan lifecycle events
# Maintains original signal logic with improvements
# Production-ready with proper error handling
# Updated: Added receivers for service_operations signals (e.g., subscription_activated increments purchases); bidirectional integration.
# """

# from django.utils import timezone
# from django.dispatch import Signal
# import logging
# from django.db.models.signals import post_save, pre_save, post_delete
# from django.dispatch import receiver
# from django.db import transaction
# from django.core.cache import cache

# from internet_plans.models.plan_models import InternetPlan, PlanTemplate

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
#     Updated: Added receivers for service_operations signals; bidirectional.
#     """
#     try:
#         # Import here to avoid circular imports
        
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
#                 logger.error(f"Error handling plan save signal: {e}", exc_info=True)
        
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
#                 logger.error(f"Error handling template save signal: {e}", exc_info=True)
        
#         # Connect to service_operations signals for bidirectional integration
#         try:
#             from service_operations.signals.operation_signals import subscription_activated, subscription_renewed, subscription_cancelled
            
#             @receiver(subscription_activated)
#             def handle_subscription_activation(sender, **kwargs):
#                 """
#                 Handle subscription activation from service_operations
#                 Increments plan purchases on activation.
#                 Updated: Atomic update, cache invalidation, error handling.
#                 """
#                 try:
#                     data = kwargs
#                     plan_id = data.get('internet_plan_id') or data.get('plan_id')
#                     if plan_id:
#                         with transaction.atomic():
#                             plan = InternetPlan.objects.select_for_update().get(id=plan_id)
#                             plan.purchases = F('purchases') + 1
#                             plan.save(update_fields=['purchases', 'updated_at'])
                        
#                         # Invalidate stats cache
#                         cache.delete("plan_statistics")
#                         cache.delete_pattern("plans_filtered:*")
#                         cache.delete_pattern("plan_search:*")
                        
#                         # Emit plan_purchased signal for further processing
#                         plan_purchased.send(
#                             sender=InternetPlan,
#                             plan_id=plan_id,
#                             subscription_id=data.get('subscription_id'),
#                             client_id=data.get('client_id'),
#                             quantity=1,
#                             total_amount=plan.price,  # Assume full price; adjust if needed
#                             timestamp=timezone.now()
#                         )
                        
#                         logger.info(f"Plan purchases incremented on activation: {plan_id}")
                
#                 except InternetPlan.DoesNotExist:
#                     logger.error(f"Plan not found for activation: {plan_id}")
#                 except Exception as e:
#                     logger.error(f"Error handling subscription activation signal: {e}", exc_info=True)
            
#             @receiver(subscription_renewed)
#             def handle_subscription_renewal(sender, **kwargs):
#                 """
#                 Handle subscription renewal from service_operations
#                 Increments purchases if plan changed.
#                 Updated: Atomic, cache invalidation, error handling.
#                 """
#                 try:
#                     data = kwargs
#                     new_plan_id = data.get('new_plan_id') or data.get('internet_plan_id')
#                     if new_plan_id:
#                         with transaction.atomic():
#                             plan = InternetPlan.objects.select_for_update().get(id=new_plan_id)
#                             plan.purchases = F('purchases') + 1
#                             plan.save(update_fields=['purchases', 'updated_at'])
                        
#                         # Invalidate stats cache
#                         cache.delete("plan_statistics")
#                         cache.delete_pattern("plans_filtered:*")
#                         cache.delete_pattern("plan_search:*")
                        
#                         # Emit plan_purchased signal
#                         plan_purchased.send(
#                             sender=InternetPlan,
#                             plan_id=new_plan_id,
#                             subscription_id=data.get('new_subscription_id'),
#                             client_id=data.get('client_id'),
#                             quantity=1,
#                             total_amount=plan.price,
#                             timestamp=timezone.now()
#                         )
                        
#                         logger.info(f"Plan purchases incremented on renewal: {new_plan_id}")
                
#                 except InternetPlan.DoesNotExist:
#                     logger.error(f"Plan not found for renewal: {new_plan_id}")
#                 except Exception as e:
#                     logger.error(f"Error handling subscription renewal signal: {e}", exc_info=True)
            
#             @receiver(subscription_cancelled)
#             def handle_subscription_cancellation(sender, **kwargs):
#                 """
#                 Handle subscription cancellation from service_operations
#                 Decrements purchases if applicable (e.g., for stats adjustment).
#                 Updated: Atomic, cache invalidation, error handling.
#                 """
#                 try:
#                     data = kwargs
#                     plan_id = data.get('internet_plan_id') or data.get('plan_id')
#                     if plan_id:
#                         with transaction.atomic():
#                             plan = InternetPlan.objects.select_for_update().get(id=plan_id)
#                             plan.purchases = F('purchases') - 1 if plan.purchases > 0 else 0
#                             plan.save(update_fields=['purchases', 'updated_at'])
                        
#                         # Invalidate stats cache
#                         cache.delete("plan_statistics")
#                         cache.delete_pattern("plans_filtered:*")
#                         cache.delete_pattern("plan_search:*")
                        
#                         logger.info(f"Plan purchases decremented on cancellation: {plan_id}")
                
#                 except InternetPlan.DoesNotExist:
#                     logger.error(f"Plan not found for cancellation: {plan_id}")
#                 except Exception as e:
#                     logger.error(f"Error handling subscription cancellation signal: {e}", exc_info=True)
        
#         except ImportError as e:
#             logger.warning(f"service_operations signals not available - bidirectional integration disabled: {e}")
        
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
#         logger.error(f"Failed to emit plan purchased signal: {e}", exc_info=True)


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
#         logger.error(f"Failed to emit plan price changed signal: {e}", exc_info=True)


# # Import timezone at module level
# from django.utils import timezone







"""
Internet Plans - Signal Definitions and Handlers
Production-ready signal system with proper error handling
UPDATED: Fixed signal imports and added proper receiver setup
"""

from django.dispatch import Signal
from django.db.models.signals import post_save, pre_save, post_delete
from django.dispatch import receiver
from django.db import transaction
from django.core.cache import cache
from django.db.models import F
import logging

logger = logging.getLogger(__name__)

# Import timezone at the top
from django.utils import timezone

# ==================== SIGNAL DEFINITIONS ====================

# Plan lifecycle signals
plan_created = Signal()  # Emitted when a plan is created
plan_updated = Signal()  # Emitted when a plan is updated
plan_deactivated = Signal()  # Emitted when a plan is deactivated
plan_purchased = Signal()  # Emitted when a plan is purchased
plan_price_changed = Signal()  # Emitted when plan price changes

# Template lifecycle signals
template_created = Signal()  # Emitted when a template is created
template_updated = Signal()  # Emitted when a template is updated

# Time variant signals
time_variant_created = Signal()  # Emitted when time variant is created
time_variant_updated = Signal()  # Emitted when time variant is updated
time_variant_deleted = Signal()  # Emitted when time variant is deleted

# ==================== SIGNAL HANDLERS ====================

def setup_plan_signals():
    """
    Set up all signal receivers for plan models
    Call this function in your AppConfig.ready() method
    """
    from internet_plans.models.plan_models import InternetPlan, PlanTemplate, TimeVariantConfig
    
    # Connect plan signals
    @receiver(post_save, sender=InternetPlan)
    def handle_plan_save(sender, instance, created, **kwargs):
        """
        Handle plan save events
        """
        try:
            if created:
                # Emit plan_created signal
                plan_created.send(
                    sender=sender,
                    plan=instance,
                    plan_id=str(instance.id),
                    plan_name=instance.name,
                    created_by=getattr(instance.created_by, 'username', 'system'),
                    timestamp=instance.created_at
                )
                logger.info(f"Plan created: {instance.name} (ID: {instance.id})")
            else:
                # Check for specific field changes
                if hasattr(instance, '_changed_fields'):
                    changed_fields = instance._changed_fields
                    if 'price' in changed_fields:
                        old_price = instance._old_price
                        plan_price_changed.send(
                            sender=sender,
                            plan=instance,
                            old_price=old_price,
                            new_price=instance.price,
                            changed_by='system'
                        )
                        logger.info(f"Plan price changed: {instance.name} - {old_price} to {instance.price}")
                    
                    # Emit plan_updated signal
                    if changed_fields:
                        plan_updated.send(
                            sender=sender,
                            plan=instance,
                            changed_fields=changed_fields,
                            updated_by='system',
                            timestamp=instance.updated_at
                        )
        
        except Exception as e:
            logger.error(f"Error handling plan save signal: {e}", exc_info=True)
    
    @receiver(pre_save, sender=InternetPlan)
    def track_plan_changes(sender, instance, **kwargs):
        """
        Track plan changes before save
        """
        if instance.pk:
            try:
                # Get the existing instance
                from internet_plans.models.plan_models import InternetPlan as PlanModel
                old_instance = PlanModel.objects.get(pk=instance.pk)
                
                # Track changed fields
                changed_fields = []
                for field in instance._meta.fields:
                    field_name = field.name
                    old_value = getattr(old_instance, field_name, None)
                    new_value = getattr(instance, field_name, None)
                    
                    if old_value != new_value:
                        changed_fields.append(field_name)
                        # Store old price if price changed
                        if field_name == 'price':
                            instance._old_price = old_value
                
                instance._changed_fields = changed_fields
                
            except InternetPlan.DoesNotExist:
                instance._changed_fields = []
        else:
            instance._changed_fields = []
    
    @receiver(post_save, sender=PlanTemplate)
    def handle_template_save(sender, instance, created, **kwargs):
        """
        Handle template save events
        """
        try:
            if created:
                template_created.send(
                    sender=sender,
                    template=instance,
                    template_id=str(instance.id),
                    template_name=instance.name,
                    created_by=getattr(instance.created_by, 'username', 'system'),
                    timestamp=instance.created_at
                )
                logger.info(f"Template created: {instance.name} (ID: {instance.id})")
            else:
                template_updated.send(
                    sender=sender,
                    template=instance,
                    template_id=str(instance.id),
                    template_name=instance.name,
                    updated_by='system',
                    timestamp=instance.updated_at
                )
        
        except Exception as e:
            logger.error(f"Error handling template save signal: {e}", exc_info=True)
    
    @receiver(post_save, sender=TimeVariantConfig)
    def handle_time_variant_save(sender, instance, created, **kwargs):
        """
        Handle time variant save events
        """
        try:
            if created:
                time_variant_created.send(
                    sender=sender,
                    time_variant=instance,
                    time_variant_id=str(instance.id),
                    timestamp=instance.created_at
                )
                logger.info(f"Time variant created: {instance.id}")
            else:
                time_variant_updated.send(
                    sender=sender,
                    time_variant=instance,
                    time_variant_id=str(instance.id),
                    timestamp=instance.updated_at
                )
        
        except Exception as e:
            logger.error(f"Error handling time variant save signal: {e}", exc_info=True)
    
    @receiver(post_delete, sender=TimeVariantConfig)
    def handle_time_variant_delete(sender, instance, **kwargs):
        """
        Handle time variant delete events
        """
        try:
            time_variant_deleted.send(
                sender=sender,
                time_variant_id=str(instance.id),
                timestamp=timezone.now()
            )
            logger.info(f"Time variant deleted: {instance.id}")
        
        except Exception as e:
            logger.error(f"Error handling time variant delete signal: {e}", exc_info=True)
    
    # Connect to external signals if available
    try:
        from service_operations.signals import subscription_activated, subscription_renewed, subscription_cancelled
        
        @receiver(subscription_activated)
        def handle_subscription_activation(sender, **kwargs):
            """
            Handle subscription activation from service_operations
            Increments plan purchases counter
            """
            try:
                data = kwargs
                plan_id = data.get('plan_id') or data.get('internet_plan_id')
                
                if plan_id:
                    with transaction.atomic():
                        plan = InternetPlan.objects.select_for_update().get(id=plan_id)
                        plan.purchases = F('purchases') + 1
                        plan.save(update_fields=['purchases', 'updated_at'])
                    
                    # Clear cache
                    cache.delete_pattern("plan_statistics:*")
                    cache.delete_pattern("available_plans:*")
                    
                    # Emit plan purchased signal
                    plan_purchased.send(
                        sender=InternetPlan,
                        plan_id=plan_id,
                        subscription_id=data.get('subscription_id'),
                        client_id=data.get('client_id'),
                        quantity=1,
                        total_amount=plan.price,
                        timestamp=timezone.now()
                    )
                    
                    logger.info(f"Plan purchases incremented: {plan_id} (now: {plan.purchases})")
            
            except InternetPlan.DoesNotExist:
                logger.error(f"Plan not found for subscription activation: {plan_id}")
            except Exception as e:
                logger.error(f"Error handling subscription activation: {e}", exc_info=True)
        
        @receiver(subscription_renewed)
        def handle_subscription_renewal(sender, **kwargs):
            """
            Handle subscription renewal from service_operations
            """
            try:
                data = kwargs
                plan_id = data.get('plan_id') or data.get('internet_plan_id')
                
                if plan_id:
                    with transaction.atomic():
                        plan = InternetPlan.objects.select_for_update().get(id=plan_id)
                        plan.purchases = F('purchases') + 1
                        plan.save(update_fields=['purchases', 'updated_at'])
                    
                    # Clear cache
                    cache.delete_pattern("plan_statistics:*")
                    
                    # Emit plan purchased signal
                    plan_purchased.send(
                        sender=InternetPlan,
                        plan_id=plan_id,
                        subscription_id=data.get('subscription_id'),
                        client_id=data.get('client_id'),
                        quantity=1,
                        total_amount=plan.price,
                        timestamp=timezone.now()
                    )
                    
                    logger.info(f"Plan purchases incremented on renewal: {plan_id}")
            
            except InternetPlan.DoesNotExist:
                logger.error(f"Plan not found for subscription renewal: {plan_id}")
            except Exception as e:
                logger.error(f"Error handling subscription renewal: {e}", exc_info=True)
    
    except ImportError:
        logger.warning("Service operations signals not available - subscription integration disabled")
    
    logger.info("Plan signals setup complete")

# ==================== SIGNAL HELPER FUNCTIONS ====================

def emit_plan_purchased_signal(plan_id, subscription_id, client_id, quantity=1, total_amount=0):
    """
    Helper function to emit plan purchased signal
    """
    from internet_plans.models.plan_models import InternetPlan
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
        logger.error(f"Failed to emit plan purchased signal: {e}")

def emit_plan_price_changed_signal(plan_id, old_price, new_price, changed_by='system', reason=''):
    """
    Helper function to emit plan price changed signal
    """
    from internet_plans.models.plan_models import InternetPlan
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
        logger.error(f"Failed to emit plan price changed signal: {e}")

def emit_plan_deactivated_signal(plan_id, deactivated_by='system', reason=''):
    """
    Helper function to emit plan deactivated signal
    """
    from internet_plans.models.plan_models import InternetPlan
    try:
        plan_deactivated.send(
            sender=InternetPlan,
            plan_id=plan_id,
            deactivated_by=deactivated_by,
            reason=reason,
            timestamp=timezone.now()
        )
        logger.info(f"Plan deactivated signal emitted: {plan_id}")
    except Exception as e:
        logger.error(f"Failed to emit plan deactivated signal: {e}")

# ==================== SIGNAL RECEIVER FUNCTIONS (For other apps) ====================

def connect_plan_signal_receivers():
    """
    Connect signal receivers that listen to plan signals
    This should be called by other apps that want to react to plan events
    """
    
    @receiver(plan_created)
    def on_plan_created(sender, **kwargs):
        """Handle plan creation event"""
        try:
            plan = kwargs.get('plan')
            logger.info(f"Plan created event received: {plan.name if plan else 'Unknown'}")
            
            # Example: Update analytics, send notifications, etc.
            # Add your custom logic here
            
        except Exception as e:
            logger.error(f"Error handling plan_created signal: {e}", exc_info=True)
    
    @receiver(plan_updated)
    def on_plan_updated(sender, **kwargs):
        """Handle plan update event"""
        try:
            plan = kwargs.get('plan')
            changed_fields = kwargs.get('changed_fields', [])
            
            if changed_fields:
                logger.info(f"Plan updated event received: {plan.name if plan else 'Unknown'} - Changed: {changed_fields}")
            
            # Example: Clear specific caches based on changed fields
            if 'price' in changed_fields:
                cache.delete_pattern("plan_pricing:*")
            
        except Exception as e:
            logger.error(f"Error handling plan_updated signal: {e}", exc_info=True)
    
    @receiver(plan_purchased)
    def on_plan_purchased(sender, **kwargs):
        """Handle plan purchase event"""
        try:
            plan_id = kwargs.get('plan_id')
            subscription_id = kwargs.get('subscription_id')
            
            logger.info(f"Plan purchased event received: Plan={plan_id}, Subscription={subscription_id}")
            
            # Example: Update revenue analytics, send purchase notification, etc.
            
        except Exception as e:
            logger.error(f"Error handling plan_purchased signal: {e}", exc_info=True)
    
    logger.info("Plan signal receivers connected successfully")