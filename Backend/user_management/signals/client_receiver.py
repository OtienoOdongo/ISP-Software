"""
Signal Receivers for Inter-App Communication
Listens to Authentication app signals
"""
import logging
from django.dispatch import receiver
from django.db import transaction
from django.utils import timezone

from authentication.signals import (
    pppoe_credentials_generated,
    client_account_created,
    account_status_changed
)

from user_management.models.client_model import ClientProfile, ClientInteraction
from user_management.services.client_services import ClientOnboardingService, AnalyticsService
from user_management.services.sms_services import SMSService

logger = logging.getLogger(__name__)


@receiver(pppoe_credentials_generated)
def handle_pppoe_credentials_generated(sender, **kwargs):
    """
    Handle PPPoE credentials generated signal from Authentication app
    Business Logic: Send SMS and create business profile
    """
    try:
        cache_key = kwargs.get('cache_key')
        user_id = kwargs.get('user_id')
        username = kwargs.get('username')
        pppoe_username = kwargs.get('pppoe_username')
        password = kwargs.get('password')
        phone_number = kwargs.get('phone_number')
        client_name = kwargs.get('client_name')
        
        logger.info(f"Processing PPPoE credentials signal: {username}")
        
        # Get user from Authentication app
        from authentication.models import UserAccount
        try:
            user = UserAccount.objects.get(id=user_id)
        except UserAccount.DoesNotExist:
            logger.error(f"User not found for PPPoE credentials: {user_id}")
            return
        
        # Create business profile if not exists
        if not hasattr(user, 'business_profile'):
            client_profile = ClientOnboardingService.onboard_pppoe_client(
                user,
                {
                    'client_type': 'residential',
                    'source': 'pppoe_creation'
                }
            )
        else:
            client_profile = user.business_profile
        
        # Send SMS with credentials
        sms_data = SMSService.send_pppoe_credentials(
            phone_number=phone_number,
            username=pppoe_username,
            password=password,
            client_name=client_name
        )
        
        # Log interaction
        ClientInteraction.objects.create(
            client=client_profile,
            interaction_type='sms_sent',
            action='PPPoE Credentials Sent',
            description='PPPoE credentials sent via SMS',
            outcome='success',
            started_at=timezone.now(),
            metadata={
                'sms_data': sms_data,
                'cache_key': cache_key
            }
        )
        
        logger.info(f"PPPoE credentials processed for {username}")
        
    except Exception as e:
        logger.error(f"Error handling PPPoE credentials signal: {e}")


@receiver(client_account_created)
def handle_client_account_created(sender, **kwargs):
    """
    Handle client account created signal from Authentication app
    Business Logic: Send welcome message and initialize business profile
    """
    try:
        user_id = kwargs.get('user_id')
        username = kwargs.get('username')
        phone_number = kwargs.get('phone_number')
        connection_type = kwargs.get('connection_type')
        client_name = kwargs.get('client_name')
        
        logger.info(f"Processing client account created: {username} ({connection_type})")
        
        # Get user from Authentication app
        from authentication.models import UserAccount
        try:
            user = UserAccount.objects.get(id=user_id)
        except UserAccount.DoesNotExist:
            logger.error(f"User not found: {user_id}")
            return
        
        # Create business profile based on connection type
        if connection_type == 'pppoe':
            client_profile = ClientOnboardingService.onboard_pppoe_client(
                user,
                {
                    'client_type': 'residential',
                    'source': 'account_creation'
                }
            )
        else:  # hotspot
            client_profile = ClientOnboardingService.onboard_hotspot_client(user)
        
        # Send welcome message
        sms_data = SMSService.send_welcome_message(
            phone_number=phone_number,
            client_name=client_name or username,
            connection_type=connection_type
        )
        
        # Log interaction
        ClientInteraction.objects.create(
            client=client_profile,
            interaction_type='sms_sent',
            action='Welcome Message Sent',
            description='Welcome message sent to new client',
            outcome='success',
            started_at=timezone.now(),
            metadata={'sms_data': sms_data}
        )
        
        logger.info(f"Client account processed: {username}")
        
    except Exception as e:
        logger.error(f"Error handling client account created signal: {e}")


@receiver(account_status_changed)
def handle_account_status_changed(sender, **kwargs):
    """
    Handle account status changed signal from Authentication app
    Business Logic: Update business profile and send notifications
    """
    try:
        user_id = kwargs.get('user_id')
        username = kwargs.get('username')
        is_active = kwargs.get('is_active')
        reason = kwargs.get('reason')
        
        logger.info(f"Processing account status changed: {username} -> {is_active}")
        
        # Get user from Authentication app
        from authentication.models import UserAccount
        try:
            user = UserAccount.objects.get(id=user_id)
        except UserAccount.DoesNotExist:
            logger.error(f"User not found: {user_id}")
            return
        
        # Update business profile if exists
        if hasattr(user, 'business_profile'):
            client_profile = user.business_profile
            client_profile.status = 'active' if is_active else 'inactive'
            client_profile.save()
            
            # Update metrics
            AnalyticsService.update_client_metrics(client_profile)
            
            # Log interaction
            ClientInteraction.objects.create(
                client=client_profile,
                interaction_type='profile_update',
                action='Account Status Changed',
                description=f"Account {('activated' if is_active else 'deactivated')}: {reason}",
                outcome='success',
                started_at=timezone.now()
            )
        
        logger.info(f"Account status processed: {username}")
        
    except Exception as e:
        logger.error(f"Error handling account status changed signal: {e}")