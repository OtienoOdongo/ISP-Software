from django.db.models.signals import post_save, pre_delete
from django.dispatch import receiver
from internet_plans.models.create_plan_models import InternetPlan, Subscription
from network_management.utils.websocket_utils import WebSocketManager
import logging

logger = logging.getLogger(__name__)

@receiver(post_save, sender=InternetPlan)
def internet_plan_created(sender, instance, created, **kwargs):
    try:
        if created:
            WebSocketManager.send_system_notification(
                title="New Internet Plan Created",
                message=f"Plan '{instance.name}' has been created",
                level="info",
                data={'plan_id': instance.id, 'plan_name': instance.name}
            )
        else:
            WebSocketManager.send_system_notification(
                title="Internet Plan Updated",
                message=f"Plan '{instance.name}' has been updated",
                level="info",
                data={'plan_id': instance.id, 'plan_name': instance.name}
            )
    except Exception as e:
        logger.error(f"Failed to send plan notification: {e}")

@receiver(post_save, sender=Subscription)
def subscription_activated(sender, instance, created, **kwargs):
    try:
        if created and instance.status == 'active':
            WebSocketManager.send_system_notification(
                title="New Subscription Activated",
                message=f"New {instance.access_method} subscription for {instance.client.user.username if instance.client else 'Unknown'}",
                level="success",
                data={
                    'subscription_id': instance.id,
                    'client_id': instance.client.id if instance.client else None,
                    'plan_name': instance.internet_plan.name if instance.internet_plan else 'Unknown',
                    'access_method': instance.access_method
                }
            )
    except Exception as e:
        logger.error(f"Failed to send subscription notification: {e}")

@receiver(post_save, sender=Subscription)
def subscription_activation_status(sender, instance, **kwargs):
    try:
        if instance.activation_successful and instance.activation_attempts > 0:
            WebSocketManager.send_system_notification(
                title="Subscription Activation Successful",
                message=f"Subscription for {instance.client.user.username if instance.client else 'Unknown'} activated successfully on {instance.router.name if instance.router else 'Unknown'}",
                level="success",
                data={
                    'subscription_id': instance.id,
                    'router_id': instance.router.id if instance.router else None,
                    'access_method': instance.access_method
                }
            )
    except Exception as e:
        logger.error(f"Failed to send activation status notification: {e}")