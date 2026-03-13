# """
# Signal Receivers for Inter-App Communication
# Listens to Authentication app signals
# """
# import logging
# from django.dispatch import receiver
# from django.db import transaction
# from django.utils import timezone

# from authentication.signals.core import (
#     pppoe_credentials_generated,
#     client_account_created,
#     account_status_changed
# )

# from user_management.models.client_model import ClientProfile, ClientInteraction
# from user_management.services.client_services import ClientOnboardingService, AnalyticsService
# from sms_automation.services.sms_service import SMSService

# logger = logging.getLogger(__name__)


# @receiver(pppoe_credentials_generated)
# def handle_pppoe_credentials_generated(sender, **kwargs):
#     """
#     Handle PPPoE credentials generated signal from Authentication app
#     Business Logic: Send SMS and create business profile
#     """
#     try:
#         cache_key = kwargs.get('cache_key')
#         user_id = kwargs.get('user_id')
#         username = kwargs.get('username')
#         pppoe_username = kwargs.get('pppoe_username')
#         password = kwargs.get('password')
#         phone_number = kwargs.get('phone_number')
#         client_name = kwargs.get('client_name')
        
#         logger.info(f"Processing PPPoE credentials signal: {username}")
        
#         # Get user from Authentication app
#         from authentication.models import UserAccount
#         try:
#             user = UserAccount.objects.get(id=user_id)
#         except UserAccount.DoesNotExist:
#             logger.error(f"User not found for PPPoE credentials: {user_id}")
#             return
        
#         # Create business profile if not exists
#         if not hasattr(user, 'business_profile'):
#             client_profile = ClientOnboardingService.onboard_pppoe_client(
#                 user,
#                 {
#                     'client_type': 'residential',
#                     'source': 'pppoe_creation'
#                 }
#             )
#         else:
#             client_profile = user.business_profile
        
#         # Send SMS with credentials
#         sms_data = SMSService.send_pppoe_credentials(
#             phone_number=phone_number,
#             username=pppoe_username,
#             password=password,
#             client_name=client_name
#         )
        
#         # Log interaction
#         ClientInteraction.objects.create(
#             client=client_profile,
#             interaction_type='sms_sent',
#             action='PPPoE Credentials Sent',
#             description='PPPoE credentials sent via SMS',
#             outcome='success',
#             started_at=timezone.now(),
#             metadata={
#                 'sms_data': sms_data,
#                 'cache_key': cache_key
#             }
#         )
        
#         logger.info(f"PPPoE credentials processed for {username}")
        
#     except Exception as e:
#         logger.error(f"Error handling PPPoE credentials signal: {e}")


# @receiver(client_account_created)
# def handle_client_account_created(sender, **kwargs):
#     """
#     Handle client account created signal from Authentication app
#     Business Logic: Send welcome message and initialize business profile
#     """
#     try:
#         user_id = kwargs.get('user_id')
#         username = kwargs.get('username')
#         phone_number = kwargs.get('phone_number')
#         connection_type = kwargs.get('connection_type')
#         client_name = kwargs.get('client_name')
        
#         logger.info(f"Processing client account created: {username} ({connection_type})")
        
#         # Get user from Authentication app
#         from authentication.models import UserAccount
#         try:
#             user = UserAccount.objects.get(id=user_id)
#         except UserAccount.DoesNotExist:
#             logger.error(f"User not found: {user_id}")
#             return
        
#         # Create business profile based on connection type
#         if connection_type == 'pppoe':
#             client_profile = ClientOnboardingService.onboard_pppoe_client(
#                 user,
#                 {
#                     'client_type': 'residential',
#                     'source': 'account_creation'
#                 }
#             )
#         else:  # hotspot
#             client_profile = ClientOnboardingService.onboard_hotspot_client(user)
        
#         # Send welcome message
#         sms_data = SMSService.send_welcome_message(
#             phone_number=phone_number,
#             client_name=client_name or username,
#             connection_type=connection_type
#         )
        
#         # Log interaction
#         ClientInteraction.objects.create(
#             client=client_profile,
#             interaction_type='sms_sent',
#             action='Welcome Message Sent',
#             description='Welcome message sent to new client',
#             outcome='success',
#             started_at=timezone.now(),
#             metadata={'sms_data': sms_data}
#         )
        
#         logger.info(f"Client account processed: {username}")
        
#     except Exception as e:
#         logger.error(f"Error handling client account created signal: {e}")


# @receiver(account_status_changed)
# def handle_account_status_changed(sender, **kwargs):
#     """
#     Handle account status changed signal from Authentication app
#     Business Logic: Update business profile and send notifications
#     """
#     try:
#         user_id = kwargs.get('user_id')
#         username = kwargs.get('username')
#         is_active = kwargs.get('is_active')
#         reason = kwargs.get('reason')
        
#         logger.info(f"Processing account status changed: {username} -> {is_active}")
        
#         # Get user from Authentication app
#         from authentication.models import UserAccount
#         try:
#             user = UserAccount.objects.get(id=user_id)
#         except UserAccount.DoesNotExist:
#             logger.error(f"User not found: {user_id}")
#             return
        
#         # Update business profile if exists
#         if hasattr(user, 'business_profile'):
#             client_profile = user.business_profile
#             client_profile.status = 'active' if is_active else 'inactive'
#             client_profile.save()
            
#             # Update metrics
#             AnalyticsService.update_client_metrics(client_profile)
            
#             # Log interaction
#             ClientInteraction.objects.create(
#                 client=client_profile,
#                 interaction_type='profile_update',
#                 action='Account Status Changed',
#                 description=f"Account {('activated' if is_active else 'deactivated')}: {reason}",
#                 outcome='success',
#                 started_at=timezone.now()
#             )
        
#         logger.info(f"Account status processed: {username}")
        
#     except Exception as e:
#         logger.error(f"Error handling account status changed signal: {e}")









"""
Signal Receivers for Inter-App Communication
Listens to Authentication app signals
FIXED: Proper signal imports and error handling
"""
import logging
from django.dispatch import receiver
from django.db import transaction
from django.utils import timezone
from django.conf import settings

# Import Authentication signals - these must be available
try:
    from authentication.signals.core import (
        pppoe_credentials_generated,
        client_account_created,
        account_status_changed
    )
    AUTH_SIGNALS_AVAILABLE = True
except ImportError as e:
    AUTH_SIGNALS_AVAILABLE = False
    # Create dummy signals for graceful degradation
    from django.dispatch import Signal
    pppoe_credentials_generated = Signal()
    client_account_created = Signal()
    account_status_changed = Signal()
    
    logger = logging.getLogger(__name__)
    logger.warning(f"Authentication signals not available: {e}. Some functionality will be limited.")

from user_management.models.client_model import ClientProfile, ClientInteraction
from user_management.services.client_services import ClientOnboardingService, AnalyticsService

logger = logging.getLogger(__name__)

# Try to import SMS service but don't fail if not available
try:
    from sms_automation.services.sms_service import SMSService
    SMS_AVAILABLE = True
except ImportError:
    SMS_AVAILABLE = False
    logger.warning("SMS Automation app not available. SMS sending disabled.")


@receiver(pppoe_credentials_generated, weak=False)
def handle_pppoe_credentials_generated(sender, **kwargs):
    """
    Handle PPPoE credentials generated signal from Authentication app
    Business Logic: Send SMS and create business profile
    """
    try:
        cache_key = kwargs.get('signal_id') or kwargs.get('cache_key')
        user_id = kwargs.get('user_id')
        username = kwargs.get('username')
        pppoe_username = kwargs.get('pppoe_username')
        password = kwargs.get('password')
        phone_number = kwargs.get('phone_number')
        client_name = kwargs.get('client_name')
        
        if not user_id:
            logger.error("PPPoE credentials signal missing user_id")
            return
            
        logger.info(f"Processing PPPoE credentials signal: {username}")
        
        # Get user from Authentication app
        from authentication.models import UserAccount
        try:
            user = UserAccount.objects.get(id=user_id)
        except UserAccount.DoesNotExist:
            logger.error(f"User not found for PPPoE credentials: {user_id}")
            return
        
        # Create business profile if not exists
        with transaction.atomic():
            if not hasattr(user, 'business_profile'):
                client_profile = ClientOnboardingService.onboard_pppoe_client(
                    user,
                    {
                        'client_type': 'residential',
                        'source': 'pppoe_creation'
                    }
                )
                logger.info(f"Created business profile for PPPoE client: {username}")
            else:
                client_profile = user.business_profile
            
            # Send SMS with credentials if available
            sms_data = None
            if SMS_AVAILABLE and phone_number:
                try:
                    sms_service = SMSService()
                    sms_data = sms_service.send_pppoe_credentials(
                        phone_number=phone_number,
                        username=pppoe_username,
                        password=password,
                        client_name=client_name or username
                    )
                except Exception as e:
                    logger.error(f"Failed to send PPPoE credentials SMS: {e}")
            
            # Log interaction
            ClientInteraction.objects.create(
                client=client_profile,
                interaction_type='sms_sent',
                action='PPPoE Credentials Generated',
                description='PPPoE credentials generated and processed',
                outcome='success',
                started_at=timezone.now(),
                completed_at=timezone.now(),
                metadata={
                    'sms_sent': sms_data is not None,
                    'sms_data': sms_data,
                    'cache_key': cache_key,
                    'pppoe_username': pppoe_username
                }
            )
        
        logger.info(f"PPPoE credentials processed for {username}")
        
    except Exception as e:
        logger.error(f"Error handling PPPoE credentials signal: {e}", exc_info=True)


@receiver(client_account_created, weak=False)
def handle_client_account_created(sender, **kwargs):
    """
    Handle client account created signal from Authentication app
    Business Logic: Send welcome message and initialize business profile
    THIS IS THE KEY RECEIVER FOR HOTSPOT CLIENTS
    """
    try:
        user_id = kwargs.get('user_id')
        username = kwargs.get('username')
        phone_number = kwargs.get('phone_number')
        connection_type = kwargs.get('connection_type')
        client_name = kwargs.get('client_name')
        
        if not user_id:
            logger.error("Client account created signal missing user_id")
            return
            
        logger.info(f"Processing client account created: {username} ({connection_type})")
        
        # Get user from Authentication app
        from authentication.models import UserAccount
        try:
            user = UserAccount.objects.get(id=user_id)
        except UserAccount.DoesNotExist:
            logger.error(f"User not found: {user_id}")
            return
        
        # Check if business profile already exists (avoid duplicates)
        if hasattr(user, 'business_profile'):
            logger.info(f"Business profile already exists for {username}, skipping creation")
            return
        
        # Create business profile based on connection type
        with transaction.atomic():
            if connection_type == 'pppoe':
                client_profile = ClientOnboardingService.onboard_pppoe_client(
                    user,
                    {
                        'client_type': 'residential',
                        'source': 'account_creation'
                    }
                )
                logger.info(f"Created PPPoE business profile for {username}")
            else:  # hotspot
                client_profile = ClientOnboardingService.onboard_hotspot_client(user)
                logger.info(f"Created hotspot business profile for {username}")
            
            # Send welcome message if SMS available
            if SMS_AVAILABLE and phone_number:
                try:
                    sms_service = SMSService()
                    
                    if connection_type == 'pppoe':
                        sms_data = sms_service.send_welcome_message(
                            phone_number=phone_number,
                            client_name=client_name or username,
                            connection_type=connection_type
                        )
                    else:
                        # For hotspot, send simple welcome
                        from sms_automation.models import SMSMessage
                        sms = SMSMessage.objects.create(
                            phone_number=phone_number,
                            message=f"Welcome {client_name or username}! Your hotspot account has been created.",
                            recipient_name=client_name or username,
                            source='welcome',
                            reference_id=f"welcome_{user_id}",
                            client=client_profile
                        )
                        sms_service.send_sms(sms)
                        sms_data = {'message_id': str(sms.id)}
                    
                    # Log SMS interaction
                    ClientInteraction.objects.create(
                        client=client_profile,
                        interaction_type='sms_sent',
                        action='Welcome Message Sent',
                        description='Welcome message sent to new client',
                        outcome='success',
                        started_at=timezone.now(),
                        completed_at=timezone.now(),
                        metadata={'sms_data': sms_data}
                    )
                    
                except Exception as e:
                    logger.error(f"Failed to send welcome SMS: {e}")
            
            # Always log account creation interaction
            ClientInteraction.objects.create(
                client=client_profile,
                interaction_type='profile_update',
                action='Account Created',
                description=f'{connection_type.title()} account created via signal',
                outcome='success',
                started_at=timezone.now(),
                completed_at=timezone.now()
            )
        
        logger.info(f"Client account processed: {username} - Business profile ID: {client_profile.id}")
        
    except Exception as e:
        logger.error(f"Error handling client account created signal: {e}", exc_info=True)


@receiver(account_status_changed, weak=False)
def handle_account_status_changed(sender, **kwargs):
    """
    Handle account status changed signal from Authentication app
    Business Logic: Update business profile and send notifications
    """
    try:
        user_id = kwargs.get('user_id')
        username = kwargs.get('username')
        is_active = kwargs.get('is_active')
        reason = kwargs.get('reason', 'No reason provided')
        
        if not user_id:
            logger.error("Account status changed signal missing user_id")
            return
            
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
            with transaction.atomic():
                client_profile = user.business_profile
                old_status = client_profile.status
                client_profile.status = 'active' if is_active else 'inactive'
                client_profile.save()
                
                # Update metrics
                try:
                    AnalyticsService.update_client_metrics(client_profile)
                except Exception as e:
                    logger.error(f"Failed to update metrics: {e}")
                
                # Log interaction
                ClientInteraction.objects.create(
                    client=client_profile,
                    interaction_type='profile_update',
                    action='Account Status Changed',
                    description=f"Account {('activated' if is_active else 'deactivated')}: {reason}",
                    outcome='success',
                    started_at=timezone.now(),
                    completed_at=timezone.now(),
                    metadata={
                        'old_status': old_status,
                        'new_status': 'active' if is_active else 'inactive',
                        'reason': reason
                    }
                )
                
                logger.info(f"Updated business profile status for {username}")
        else:
            logger.warning(f"No business profile found for {username}")
        
        logger.info(f"Account status processed: {username}")
        
    except Exception as e:
        logger.error(f"Error handling account status changed signal: {e}", exc_info=True)


def register_signal_receivers():
    """
    Function to explicitly register signal receivers
    Called from apps.py ready() method
    """
    # This function exists to ensure the module is imported
    # The @receiver decorators already register the functions
    logger.info("Client signal receivers registered successfully")
    return True