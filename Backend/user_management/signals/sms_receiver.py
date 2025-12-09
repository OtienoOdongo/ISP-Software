"""
Signal receivers for SMS Automation
Listens to User Management events
"""
import logging
from django.dispatch import receiver
from django.db.models.signals import post_save

from user_management.models.client_model import ClientProfile
from user_management.services.sms_services import SMSService

logger = logging.getLogger(__name__)


@receiver(post_save, sender=ClientProfile)
def send_welcome_sms_on_client_creation(sender, instance, created, **kwargs):
    """Send welcome SMS when client profile is created"""
    if created and hasattr(instance, 'phone_number') and instance.phone_number:
        try:
            sms_service = SMSService()
            
            # Determine message based on connection type
            if instance.is_pppoe_client:
                message = (
                    f"Welcome {instance.username}! Your PPPoE account has been created. "
                    f"Check your SMS for credentials."
                )
            else:
                message = (
                    f"Welcome {instance.username}! Your hotspot account has been created. "
                    f"Thank you for choosing us."
                )
            
            sms = sms_service.create_sms_message(
                phone_number=instance.phone_number,
                message=message,
                recipient_name=instance.username,
                source='welcome',
                reference_id=f"welcome_{instance.id}",
                client=instance
            )
            sms_service.send_sms(sms)
            
            logger.info(f"Welcome SMS sent to {instance.phone_number}")
            
        except Exception as e:
            logger.error(f"Failed to send welcome SMS: {str(e)}")