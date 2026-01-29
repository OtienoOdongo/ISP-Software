# """
# Production-ready Signal Receivers
# Handles model signals with proper error handling and logging
# """

# import logging
# import time
# from typing import Dict, Optional, Set

# from django.db import transaction
# from django.db.models.signals import post_save, pre_delete, pre_save
# from django.dispatch import receiver

# from .core import (
#     AccountStatusSignal,
#     ClientAccountSignal,
#     PPPoECredentialsSignal,
#     SignalCacheManager,
#     SignalType,
#     account_status_changed,
#     client_account_created,
#     emit_signal_with_retry,
#     pppoe_credentials_generated,
#     send_notification,
# )

# logger = logging.getLogger(__name__)

# # ==================== MODEL SIGNAL RECEIVERS ====================

# @receiver(post_save)
# def handle_user_account_save(sender, instance, created, **kwargs):
#     """
#     Handle UserAccount save events with proper error handling and transaction safety
#     """
#     # Lazy import to avoid circular imports
#     try:
#         from django.apps import apps
#         UserAccount = apps.get_model('authentication', 'UserAccount')
#     except Exception as e:
#         logger.error(f"Failed to import UserAccount model: {e}")
#         return
    
#     # Only process UserAccount instances
#     if sender != UserAccount:
#         return
    
#     logger.debug(
#         f"UserAccount save signal received: "
#         f"id={instance.id}, "
#         f"username={instance.username}, "
#         f"created={created}"
#     )
    
#     update_fields = kwargs.get('update_fields', set())
    
#     try:
#         # Handle different scenarios based on what changed
#         if created:
#             _handle_new_account(instance)
#         elif update_fields:
#             _handle_account_updates(instance, update_fields)
        
#     except Exception as e:
#         logger.error(
#             f"Error handling UserAccount save signal for {instance.username}: {e}",
#             exc_info=True
#         )

# def _handle_new_account(instance) -> None:
#     """Handle creation of new user account"""
#     try:
#         if instance.user_type == 'client':
#             # Prepare signal data
#             signal_data = ClientAccountSignal(
#                 user_id=str(instance.id),
#                 username=instance.username or '',
#                 phone_number=instance.phone_number or '',
#                 connection_type=instance.connection_type,
#                 client_name=instance.name or '',
#                 created_by_admin=instance.source == 'admin_dashboard'
#             )
            
#             # Emit signal with retry
#             result = emit_signal_with_retry(
#                 signal=client_account_created,
#                 signal_type=SignalType.CLIENT_ACCOUNT_CREATED,
#                 data=signal_data.to_dict(),
#                 sender='authentication.models'
#             )
            
#             if result['success']:
#                 logger.info(
#                     f"Client account creation signal emitted: "
#                     f"username={instance.username}, "
#                     f"signal_id={result['signal_id']}"
#                 )
#             else:
#                 logger.error(
#                     f"Failed to emit client account creation signal: "
#                     f"username={instance.username}, "
#                     f"error={result['error']}"
#                 )
        
#         # For PPPoE clients, also check if credentials were generated
#         if (instance.connection_type == 'pppoe' and 
#             getattr(instance, 'pppoe_username', None) and 
#             getattr(instance, 'pppoe_password', None)):
            
#             _handle_pppoe_credentials(instance)
            
#     except Exception as e:
#         logger.error(f"Error handling new account for {instance.username}: {e}", exc_info=True)

# def _handle_account_updates(instance, update_fields: Set[str]) -> None:
#     """Handle updates to existing user account"""
#     try:
#         # Check for PPPoE credential generation/update
#         if (instance.connection_type == 'pppoe' and 
#             getattr(instance, 'pppoe_username', None) and 
#             getattr(instance, 'pppoe_password', None)):
            
#             if ('pppoe_username' in update_fields or 
#                 'pppoe_password' in update_fields):
                
#                 _handle_pppoe_credentials(instance)
        
#         # Check for account status changes
#         if 'is_active' in update_fields:
#             _handle_account_status_change(instance)
            
#         # Check for PPPoE activation status
#         if 'pppoe_active' in update_fields:
#             _handle_pppoe_status_change(instance)
            
#     except Exception as e:
#         logger.error(f"Error handling account updates for {instance.username}: {e}", exc_info=True)

# def _handle_pppoe_credentials(instance) -> None:
#     """Handle PPPoE credential generation or update"""
#     try:
#         # Get decrypted password - you need to implement this method
#         # or adjust to your actual password field
#         decrypted_password = getattr(instance, 'pppoe_password', '')
        
#         # If you have a method to decrypt, use it
#         if hasattr(instance, 'get_pppoe_password_decrypted'):
#             decrypted_password = instance.get_pppoe_password_decrypted()
        
#         if not decrypted_password:
#             logger.warning(f"Cannot emit PPPoE credentials signal - password not available")
#             return
        
#         # Prepare signal data
#         signal_data = PPPoECredentialsSignal(
#             user_id=str(instance.id),
#             username=instance.username or '',
#             pppoe_username=instance.pppoe_username or '',
#             password=decrypted_password,
#             phone_number=instance.phone_number or '',
#             client_name=instance.name or '',
#             connection_type='pppoe'
#         )
        
#         # Emit signal with retry
#         result = emit_signal_with_retry(
#             signal=pppoe_credentials_generated,
#             signal_type=SignalType.PPPOE_CREDENTIALS_GENERATED,
#             data=signal_data.to_dict(),
#             sender='authentication.models'
#         )
        
#         if result['success']:
#             logger.info(
#                 f"PPPoE credentials signal emitted: "
#                 f"username={instance.username}, "
#                 f"pppoe_username={instance.pppoe_username}, "
#                 f"signal_id={result['signal_id']}"
#             )
#         else:
#             logger.error(
#                 f"Failed to emit PPPoE credentials signal: "
#                 f"username={instance.username}, "
#                 f"error={result['error']}"
#             )
            
#     except Exception as e:
#         logger.error(f"Error handling PPPoE credentials for {instance.username}: {e}", exc_info=True)

# def _handle_account_status_change(instance) -> None:
#     """Handle account activation/deactivation"""
#     try:
#         reason = "Account activated via system" if instance.is_active else "Account deactivated via system"
        
#         # Determine if changed by admin
#         changed_by_admin = False
#         admin_email = None
        
#         # In a real system, you'd track who made the change
#         # For now, we'll check the source or use a default
#         if getattr(instance, 'source', '') == 'admin_dashboard':
#             changed_by_admin = True
#             # admin_email would come from request context
        
#         # Prepare signal data
#         signal_data = AccountStatusSignal(
#             user_id=str(instance.id),
#             username=instance.username or '',
#             is_active=instance.is_active,
#             reason=reason,
#             changed_by_admin=changed_by_admin,
#             admin_email=admin_email
#         )
        
#         # Emit signal with retry
#         result = emit_signal_with_retry(
#             signal=account_status_changed,
#             signal_type=SignalType.ACCOUNT_STATUS_CHANGED,
#             data=signal_data.to_dict(),
#             sender='authentication.models'
#         )
        
#         if result['success']:
#             logger.info(
#                 f"Account status change signal emitted: "
#                 f"username={instance.username}, "
#                 f"status={'active' if instance.is_active else 'inactive'}, "
#                 f"signal_id={result['signal_id']}"
#             )
#         else:
#             logger.error(
#                 f"Failed to emit account status change signal: "
#                 f"username={instance.username}, "
#                 f"error={result['error']}"
#             )
            
#     except Exception as e:
#         logger.error(f"Error handling account status change for {instance.username}: {e}", exc_info=True)

# def _handle_pppoe_status_change(instance) -> None:
#     """Handle PPPoE activation status changes"""
#     try:
#         pppoe_active = getattr(instance, 'pppoe_active', False)
#         reason = f"PPPoE {'activated' if pppoe_active else 'deactivated'}"
        
#         # Prepare signal data
#         signal_data = {
#             'user_id': str(instance.id),
#             'username': instance.username or '',
#             'pppoe_username': getattr(instance, 'pppoe_username', ''),
#             'is_active': pppoe_active,
#             'reason': reason,
#             'timestamp': time.time()
#         }
        
#         # Emit notification signal
#         result = emit_signal_with_retry(
#             signal=send_notification,
#             signal_type=SignalType.SEND_NOTIFICATION,
#             data=signal_data,
#             sender='authentication.models'
#         )
        
#         if result['success']:
#             logger.info(
#                 f"PPPoE status change signal emitted: "
#                 f"username={instance.username}, "
#                 f"pppoe_active={pppoe_active}"
#             )
#         else:
#             logger.error(
#                 f"Failed to emit PPPoE status change signal: "
#                 f"username={instance.username}, "
#                 f"error={result['error']}"
#             )
            
#     except Exception as e:
#         logger.error(f"Error handling PPPoE status change for {instance.username}: {e}", exc_info=True)

# # ==================== CUSTOM SIGNAL RECEIVERS ====================

# @receiver(pppoe_credentials_generated)
# def handle_pppoe_credentials_signal(sender, **kwargs):
#     """
#     Handle PPPoE credentials signal - log for audit and forward to other apps
#     """
#     try:
#         signal_id = kwargs.get('signal_id')
#         username = kwargs.get('username')
#         pppoe_username = kwargs.get('pppoe_username')
#         phone = kwargs.get('phone_number')
        
#         # Log for audit trail
#         logger.info(
#             f"PPPoE credentials signal received: "
#             f"signal_id={signal_id}, "
#             f"sender={sender}, "
#             f"user={username}, "
#             f"pppoe_username={pppoe_username}, "
#             f"phone={phone}"
#         )
        
#         # In a real system, you might forward this to other services
#         # For example, to a message queue or external API
        
#         # Update signal status
#         if signal_id:
#             SignalCacheManager.mark_as_delivered(signal_id)
        
#     except Exception as e:
#         logger.error(f"Error handling PPPoE credentials signal: {e}", exc_info=True)

# @receiver(client_account_created)
# def handle_client_account_signal(sender, **kwargs):
#     """
#     Handle client account creation signal
#     """
#     try:
#         signal_id = kwargs.get('signal_id')
#         username = kwargs.get('username')
#         connection_type = kwargs.get('connection_type')
        
#         logger.info(
#             f"Client account signal received: "
#             f"signal_id={signal_id}, "
#             f"sender={sender}, "
#             f"user={username}, "
#             f"type={connection_type}"
#         )
        
#         # Update signal status
#         if signal_id:
#             SignalCacheManager.mark_as_delivered(signal_id)
        
#     except Exception as e:
#         logger.error(f"Error handling client account signal: {e}", exc_info=True)

# @receiver(account_status_changed)
# def handle_account_status_signal(sender, **kwargs):
#     """
#     Handle account status change signal
#     """
#     try:
#         signal_id = kwargs.get('signal_id')
#         username = kwargs.get('username')
#         is_active = kwargs.get('is_active')
#         reason = kwargs.get('reason')
        
#         logger.info(
#             f"Account status signal received: "
#             f"signal_id={signal_id}, "
#             f"sender={sender}, "
#             f"user={username}, "
#             f"status={'active' if is_active else 'inactive'}, "
#             f"reason={reason}"
#         )
        
#         # Update signal status
#         if signal_id:
#             SignalCacheManager.mark_as_delivered(signal_id)
        
#     except Exception as e:
#         logger.error(f"Error handling account status signal: {e}", exc_info=True)

# # ==================== UTILITY RECEIVERS ====================

# @receiver(pre_save, sender='authentication.UserAccount')
# def track_changes_before_save(sender, instance, **kwargs):
#     """
#     Track changes before saving for audit purposes
#     """
#     if not instance.pk:
#         return  # New instance
    
#     try:
#         # Get original instance
#         original = sender.objects.get(pk=instance.pk)
        
#         # Track important field changes
#         changes = {}
        
#         fields_to_track = [
#             'is_active', 'pppoe_active', 'connection_type',
#             'pppoe_username', 'name', 'phone_number'
#         ]
        
#         for field in fields_to_track:
#             original_value = getattr(original, field, None)
#             new_value = getattr(instance, field, None)
            
#             if original_value != new_value:
#                 changes[field] = {
#                     'from': original_value,
#                     'to': new_value,
#                     'changed_at': time.time()
#                 }
        
#         # Store changes for post_save handler
#         if changes:
#             instance._tracked_changes = changes
#             logger.debug(f"Tracked changes for {instance.username}: {list(changes.keys())}")
            
#     except sender.DoesNotExist:
#         pass  # New instance
#     except Exception as e:
#         logger.error(f"Error tracking changes for {instance.username}: {e}")

# @receiver(pre_delete, sender='authentication.UserAccount')
# def handle_account_deletion(sender, instance, **kwargs):
#     """
#     Handle account deletion - emit deactivation signal
#     """
#     try:
#         # Emit account deactivation signal before deletion
#         signal_data = AccountStatusSignal(
#             user_id=str(instance.id),
#             username=instance.username or '',
#             is_active=False,
#             reason="Account permanently deleted from system",
#             changed_by_admin=True
#         )
        
#         # Use direct emission without waiting for response
#         emit_signal_with_retry(
#             signal=account_status_changed,
#             signal_type=SignalType.ACCOUNT_STATUS_CHANGED,
#             data=signal_data.to_dict(),
#             sender='authentication.models'
#         )
        
#         logger.warning(
#             f"Account deletion signal emitted: "
#             f"username={instance.username}, "
#             f"user_id={instance.id}"
#         )
        
#     except Exception as e:
#         logger.error(f"Error handling account deletion for {instance.username}: {e}", exc_info=True)

# # ==================== SIGNAL REGISTRATION ====================

# def register_model_receivers():
#     """
#     Explicitly register all model signal receivers
#     This should be called from AppConfig.ready()
#     """
#     try:
#         # Import UserAccount model
#         from django.apps import apps
        
#         try:
#             UserAccount = apps.get_model('authentication', 'UserAccount')
            
#             # Connect pre_save and pre_delete
#             pre_save.connect(track_changes_before_save, sender=UserAccount)
#             pre_delete.connect(handle_account_deletion, sender=UserAccount)
            
#             # post_save is already connected via @receiver decorator
            
#             logger.info("✅ Authentication model signal receivers registered successfully")
#             return True
            
#         except LookupError:
#             logger.warning("UserAccount model not found. Skipping model receiver registration.")
#             return False
        
#     except Exception as e:
#         logger.error(f"❌ Failed to register model receivers: {e}")
#         return False


"""
Authentication Signal Receivers
Handles signals with proper error handling
"""

import logging
from django.dispatch import receiver
from .core import (
    SignalCacheManager,
    pppoe_credentials_generated,
    client_account_created,
    account_status_changed,
)

logger = logging.getLogger(__name__)

# ==================== CUSTOM SIGNAL RECEIVERS ====================

@receiver(pppoe_credentials_generated)
def handle_pppoe_credentials_signal(sender, **kwargs):
    """
    Handle PPPoE credentials signal
    """
    try:
        signal_id = kwargs.get('signal_id')
        username = kwargs.get('username')
        pppoe_username = kwargs.get('pppoe_username')
        
        logger.info(
            f"PPPoE credentials signal received: "
            f"user={username}, "
            f"pppoe_username={pppoe_username}"
        )
        
        if signal_id:
            SignalCacheManager.mark_as_delivered(signal_id)
        
    except Exception as e:
        logger.error(f"Error handling PPPoE credentials signal: {e}", exc_info=True)

@receiver(client_account_created)
def handle_client_account_signal(sender, **kwargs):
    """
    Handle client account creation signal
    """
    try:
        signal_id = kwargs.get('signal_id')
        username = kwargs.get('username')
        connection_type = kwargs.get('connection_type')
        
        logger.info(
            f"Client account signal received: "
            f"user={username}, "
            f"type={connection_type}"
        )
        
        if signal_id:
            SignalCacheManager.mark_as_delivered(signal_id)
        
    except Exception as e:
        logger.error(f"Error handling client account signal: {e}", exc_info=True)

@receiver(account_status_changed)
def handle_account_status_signal(sender, **kwargs):
    """
    Handle account status change signal
    """
    try:
        signal_id = kwargs.get('signal_id')
        username = kwargs.get('username')
        is_active = kwargs.get('is_active')
        
        logger.info(
            f"Account status signal received: "
            f"user={username}, "
            f"status={'active' if is_active else 'inactive'}"
        )
        
        if signal_id:
            SignalCacheManager.mark_as_delivered(signal_id)
        
    except Exception as e:
        logger.error(f"Error handling account status signal: {e}", exc_info=True)