# """
# Internet Plans - Signal Definitions
# Signals for inter-app communication
# """

# from django.dispatch import Signal
# import logging

# logger = logging.getLogger(__name__)

# # Signal emitted when plan is purchased
# # Data: {
# #   'subscription_id': str,
# #   'client_id': str,
# #   'plan_id': str,
# #   'plan_name': str,
# #   'access_method': str,
# #   'amount': float,
# #   'status': str,
# #   'payment_data': dict
# # }
# plan_purchased = Signal()

# # Signal emitted when subscription is activated
# # Data: {
# #   'subscription_id': str,
# #   'client_id': str,
# #   'plan_id': str,
# #   'router_id': int,
# #   'access_method': str,
# #   'activation_id': str
# # }
# subscription_activated = Signal()

# # Signal emitted when subscription expires
# # Data: {
# #   'subscription_id': str,
# #   'client_id': str,
# #   'plan_id': str,
# #   'expired_at': datetime
# # }
# subscription_expired = Signal()

# # Signal emitted when subscription is renewed
# # Data: {
# #   'subscription_id': str,
# #   'client_id': str,
# #   'plan_id': str,
# #   'renewed_at': datetime,
# #   'new_end_date': datetime
# # }
# subscription_renewed = Signal()

# # Signal emitted when plan usage is updated
# # Data: {
# #   'subscription_id': str,
# #   'client_id': str,
# #   'data_used': int,
# #   'time_used': int,
# #   'remaining_data': int,
# #   'remaining_time': int
# # }
# plan_usage_updated = Signal()


# # Signal receivers for Authentication app signals
# def setup_auth_signal_receivers():
#     """
#     Set up receivers for Authentication app signals
#     """
#     try:
#         from authentication.signals import (
#             client_account_created,
#             pppoe_credentials_generated,
#         )
        
#         from django.dispatch import receiver
        
#         @receiver(client_account_created)
#         def handle_new_client_created(sender, **kwargs):
#             """
#             Handle new client creation from Authentication app
#             """
#             try:
#                 from internet_plans.services.integration_service import IntegrationService
                
#                 client_data = kwargs
#                 user_id = client_data.get('user_id')
#                 phone_number = client_data.get('phone_number')
#                 connection_type = client_data.get('connection_type')
                
#                 logger.info(f"New client created in Authentication app: {user_id}")
                
#                 # You could auto-assign a free trial plan here
#                 # Or send a welcome offer
                
#             except Exception as e:
#                 logger.error(f"Failed to handle new client signal: {e}")
        
#         @receiver(pppoe_credentials_generated)
#         def handle_pppoe_credentials_generated(sender, **kwargs):
#             """
#             Handle PPPoE credentials generation
#             """
#             try:
#                 credentials_data = kwargs
#                 user_id = credentials_data.get('user_id')
#                 pppoe_username = credentials_data.get('pppoe_username')
                
#                 logger.info(f"PPPoE credentials generated for user: {user_id}")
                
#                 # You could update related subscriptions or send notifications
                
#             except Exception as e:
#                 logger.error(f"Failed to handle PPPoE credentials signal: {e}")
        
#         logger.info("Authentication signal receivers set up successfully")
        
#     except ImportError as e:
#         logger.warning(f"Could not set up Authentication signal receivers: {e}")


# # Initialize signal receivers when module is loaded
# setup_auth_signal_receivers()









"""
Internet Plans - Signal Definitions
Signals for plan lifecycle events
Maintains original signal logic with improvements
Production-ready with proper error handling
"""

from django.dispatch import Signal
import logging
from internet_plans.models.plan_models import InternetPlan

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
    """
    try:
        # Import here to avoid circular imports
        from django.db.models.signals import post_save, pre_save, post_delete
        from django.dispatch import receiver
        
        from internet_plans.models.plan_models import InternetPlan, PlanTemplate
        
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
                logger.error(f"Error handling plan save signal: {e}")
        
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
                logger.error(f"Error handling template save signal: {e}")
        
        # Connect to external app signals
        try:
            # Connect to UserManagement signals if available
            from user_management.signals.client_signals import client_subscribed
            
            @receiver(client_subscribed)
            def handle_client_subscription(sender, **kwargs):
                """
                Handle client subscription from UserManagement
                NEW: Integration with UserManagement
                """
                try:
                    subscription_data = kwargs
                    plan_id = subscription_data.get('plan_id')
                    
                    if plan_id:
                        plan_purchased.send(
                            sender=sender,
                            plan_id=plan_id,
                            subscription_id=subscription_data.get('subscription_id'),
                            client_id=subscription_data.get('client_id'),
                            quantity=subscription_data.get('quantity', 1),
                            total_amount=subscription_data.get('total_amount', 0),
                            timestamp=subscription_data.get('timestamp')
                        )
                        logger.info(f"Plan purchased signal sent for plan: {plan_id}")
                
                except Exception as e:
                    logger.error(f"Error handling client subscription signal: {e}")
        
        except ImportError:
            logger.warning("UserManagement signals not available - subscription integration disabled")
        
        # Connect to NetworkManagement signals if available
        try:
            from network_management.signals.network_signals import subscription_activated
            
            @receiver(subscription_activated)
            def handle_network_activation(sender, **kwargs):
                """
                Handle subscription activation from NetworkManagement
                NEW: Integration with NetworkManagement
                """
                try:
                    activation_data = kwargs
                    plan_id = activation_data.get('plan_id')
                    
                    if plan_id:
                        # Update plan purchase count
                        from internet_plans.services.plan_service import PlanService
                        PlanService.update_plan_purchases(plan_id)
                        
                        logger.info(f"Plan purchase count updated for plan: {plan_id}")
                
                except Exception as e:
                    logger.error(f"Error handling network activation signal: {e}")
        
        except ImportError:
            logger.warning("NetworkManagement signals not available - activation integration disabled")
        
        # Connect to Payment app signals if available
        try:
            from payment.signals.payment_signals import payment_completed
            
            @receiver(payment_completed)
            def handle_payment_completion(sender, **kwargs):
                """
                Handle payment completion from Payment app
                NEW: Integration with Payment app
                """
                try:
                    payment_data = kwargs
                    plan_id = payment_data.get('metadata', {}).get('plan_id')
                    
                    if plan_id:
                        plan_purchased.send(
                            sender=sender,
                            plan_id=plan_id,
                            subscription_id=payment_data.get('subscription_id'),
                            client_id=payment_data.get('client_id'),
                            quantity=1,
                            total_amount=payment_data.get('amount'),
                            timestamp=payment_data.get('completed_at')
                        )
                        logger.info(f"Payment completed for plan: {plan_id}")
                
                except Exception as e:
                    logger.error(f"Error handling payment completion signal: {e}")
        
        except ImportError:
            logger.warning("Payment app signals not available - payment integration disabled")
        
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
        logger.error(f"Failed to emit plan purchased signal: {e}")


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
        logger.error(f"Failed to emit plan price changed signal: {e}")


# Import timezone at module level
from django.utils import timezone