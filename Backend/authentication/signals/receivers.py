# """
# Built-in Signal Receivers
# Receivers for model signals within the Authentication app
# """

# from django.dispatch import receiver
# from django.db.models.signals import post_save, pre_save, pre_delete
# import logging
# from typing import Dict, Any
# from .emitters import (
#     emit_pppoe_credentials_generated,
#     emit_client_account_created,
#     emit_account_status_changed,
# )

# logger = logging.getLogger(__name__)

# # Import UserAccount model locally to avoid circular imports
# def get_useraccount_model():
#     """Lazy import of UserAccount model"""
#     from django.apps import apps
#     return apps.get_model('authentication', 'UserAccount')

# # ==================== MODEL SIGNAL RECEIVERS ====================

# @receiver(post_save)
# def handle_user_account_save(sender, instance, created, **kwargs):
#     """
#     Handle UserAccount save events and emit appropriate signals
#     """
#     UserAccount = get_useraccount_model()
    
#     # Only process UserAccount instances
#     if sender != UserAccount:
#         return
    
#     logger.debug(f"UserAccount save signal: {instance.username}, created={created}")
    
#     # Track changes for update signals
#     update_fields = kwargs.get('update_fields', set())
    
#     # Handle new client creation
#     if created and instance.user_type == 'client':
#         logger.info(f"New client created via model save: {instance.username}")
        
#         # Emit client account created signal
#         emit_client_account_created(
#             user_id=str(instance.id),
#             username=instance.username,
#             phone_number=instance.phone_number,
#             connection_type=instance.connection_type,
#             client_name=instance.name or "",
#             created_by_admin=False  # Created via model, not admin UI
#         )
    
#     # Handle PPPoE credential generation
#     if (instance.connection_type == 'pppoe' and 
#         instance.pppoe_username and 
#         instance.pppoe_password):
        
#         # Check if this is a new credential generation
#         if (created or 
#             'pppoe_username' in update_fields or 
#             'pppoe_password' in update_fields):
            
#             logger.info(f"PPPoE credentials generated via model save: {instance.username}")
            
#             # Get decrypted password for signal
#             try:
#                 decrypted_password = instance.get_pppoe_password_decrypted()
#                 if decrypted_password:
#                     # Emit credentials generated signal
#                     emit_pppoe_credentials_generated(
#                         user_id=str(instance.id),
#                         username=instance.username,
#                         pppoe_username=instance.pppoe_username,
#                         password=decrypted_password,
#                         phone_number=instance.phone_number,
#                         client_name=instance.name or "",
#                         connection_type='pppoe'
#                     )
#             except Exception as e:
#                 logger.error(f"Failed to emit PPPoE credentials signal: {e}")
    
#     # Handle account activation/deactivation
#     if 'is_active' in update_fields:
#         reason = "Account activated via system" if instance.is_active else "Account deactivated via system"
#         changed_by_admin = kwargs.get('changed_by_admin', False)
        
#         logger.info(f"Account status changed via model save: {instance.username} - {reason}")
        
#         emit_account_status_changed(
#             user_id=str(instance.id),
#             username=instance.username,
#             is_active=instance.is_active,
#             reason=reason,
#             changed_by_admin=changed_by_admin
#         )

# @receiver(pre_save, sender='authentication.UserAccount')
# def track_user_account_changes(sender, instance, **kwargs):
#     """
#     Track changes to UserAccount for audit purposes
#     """
#     if instance.pk:
#         try:
#             # Get original instance
#             original = sender.objects.get(pk=instance.pk)
            
#             # Track changes
#             changes = {}
#             for field in ['is_active', 'pppoe_active', 'connection_type']:
#                 original_value = getattr(original, field, None)
#                 new_value = getattr(instance, field, None)
#                 if original_value != new_value:
#                     changes[field] = {'from': original_value, 'to': new_value}
            
#             if changes:
#                 logger.debug(f"UserAccount changes tracked: {instance.username} - {changes}")
#                 # Store changes in instance for post_save to use
#                 instance._tracked_changes = changes
                
#         except sender.DoesNotExist:
#             # New instance, no original to compare
#             pass

# @receiver(pre_delete, sender='authentication.UserAccount')
# def handle_user_account_deletion(sender, instance, **kwargs):
#     """
#     Handle UserAccount deletion
#     Emit signal for cleanup in other apps
#     """
#     logger.info(f"UserAccount deletion: {instance.username}")
    
#     # Emit account deactivation signal before deletion
#     emit_account_status_changed(
#         user_id=str(instance.id),
#         username=instance.username,
#         is_active=False,
#         reason="Account deleted from system",
#         changed_by_admin=True  # Assuming deletion is admin action
#     )

# # ==================== CUSTOM SIGNAL RECEIVERS ====================

# # These receivers listen to our own custom signals for internal processing
# # Example: Log all PPPoE credential signals for audit

# @receiver(pppoe_credentials_generated)
# def log_pppoe_credentials_signal(sender, **kwargs):
#     """
#     Log all PPPoE credential generation signals for audit trail
#     """
#     cache_key = kwargs.get('cache_key')
#     username = kwargs.get('username')
#     phone = kwargs.get('phone_number')
    
#     logger.info(
#         f"PPPoE credentials signal received: "
#         f"sender={sender}, user={username}, phone={phone}, "
#         f"cache_key={cache_key}"
#     )

# @receiver(client_account_created)
# def log_client_creation_signal(sender, **kwargs):
#     """
#     Log all client creation signals
#     """
#     username = kwargs.get('username')
#     connection_type = kwargs.get('connection_type')
    
#     logger.info(
#         f"Client creation signal received: "
#         f"sender={sender}, user={username}, type={connection_type}"
#     )

# # ==================== SIGNAL REGISTRATION ====================

# def register_model_receivers():
#     """
#     Explicitly register model signal receivers
#     """
#     # Receivers are already registered via @receiver decorators
#     # This function is for clarity and explicit registration if needed
#     logger.info("Authentication model signal receivers registered")
#     return True








"""
Built-in Signal Receivers
Receivers for model signals within the Authentication app
"""

from django.dispatch import receiver
from django.db.models.signals import post_save, pre_save, pre_delete
import logging
from typing import Dict, Any

# Import signals from core module
from .core import (
    pppoe_credentials_generated,
    client_account_created,
    pppoe_credentials_updated,
    account_status_changed,
    authentication_failed,
    send_notification,
)

# Import emitters from emitters module
from .emitters import (
    emit_pppoe_credentials_generated,
    emit_client_account_created,
    emit_account_status_changed,
)

logger = logging.getLogger(__name__)

# Import UserAccount model locally to avoid circular imports
def get_useraccount_model():
    """Lazy import of UserAccount model"""
    from django.apps import apps
    return apps.get_model('authentication', 'UserAccount')

# ==================== MODEL SIGNAL RECEIVERS ====================

@receiver(post_save)
def handle_user_account_save(sender, instance, created, **kwargs):
    """
    Handle UserAccount save events and emit appropriate signals
    """
    UserAccount = get_useraccount_model()
    
    # Only process UserAccount instances
    if sender != UserAccount:
        return
    
    logger.debug(f"UserAccount save signal: {instance.username}, created={created}")
    
    # Track changes for update signals
    update_fields = kwargs.get('update_fields', set())
    
    # Handle new client creation
    if created and instance.user_type == 'client':
        logger.info(f"New client created via model save: {instance.username}")
        
        # Emit client account created signal
        emit_client_account_created(
            user_id=str(instance.id),
            username=instance.username,
            phone_number=instance.phone_number,
            connection_type=instance.connection_type,
            client_name=instance.name or "",
            created_by_admin=False  # Created via model, not admin UI
        )
    
    # Handle PPPoE credential generation
    if (instance.connection_type == 'pppoe' and 
        instance.pppoe_username and 
        instance.pppoe_password):
        
        # Check if this is a new credential generation
        if (created or 
            'pppoe_username' in update_fields or 
            'pppoe_password' in update_fields):
            
            logger.info(f"PPPoE credentials generated via model save: {instance.username}")
            
            # Get decrypted password for signal
            try:
                decrypted_password = instance.get_pppoe_password_decrypted()
                if decrypted_password:
                    # Emit credentials generated signal
                    emit_pppoe_credentials_generated(
                        user_id=str(instance.id),
                        username=instance.username,
                        pppoe_username=instance.pppoe_username,
                        password=decrypted_password,
                        phone_number=instance.phone_number,
                        client_name=instance.name or "",
                        connection_type='pppoe'
                    )
            except Exception as e:
                logger.error(f"Failed to emit PPPoE credentials signal: {e}")
    
    # Handle account activation/deactivation
    if 'is_active' in update_fields:
        reason = "Account activated via system" if instance.is_active else "Account deactivated via system"
        changed_by_admin = kwargs.get('changed_by_admin', False)
        
        logger.info(f"Account status changed via model save: {instance.username} - {reason}")
        
        emit_account_status_changed(
            user_id=str(instance.id),
            username=instance.username,
            is_active=instance.is_active,
            reason=reason,
            changed_by_admin=changed_by_admin
        )

@receiver(pre_save, sender='authentication.UserAccount')
def track_user_account_changes(sender, instance, **kwargs):
    """
    Track changes to UserAccount for audit purposes
    """
    if instance.pk:
        try:
            # Get original instance
            original = sender.objects.get(pk=instance.pk)
            
            # Track changes
            changes = {}
            for field in ['is_active', 'pppoe_active', 'connection_type']:
                original_value = getattr(original, field, None)
                new_value = getattr(instance, field, None)
                if original_value != new_value:
                    changes[field] = {'from': original_value, 'to': new_value}
            
            if changes:
                logger.debug(f"UserAccount changes tracked: {instance.username} - {changes}")
                # Store changes in instance for post_save to use
                instance._tracked_changes = changes
                
        except sender.DoesNotExist:
            # New instance, no original to compare
            pass

@receiver(pre_delete, sender='authentication.UserAccount')
def handle_user_account_deletion(sender, instance, **kwargs):
    """
    Handle UserAccount deletion
    Emit signal for cleanup in other apps
    """
    logger.info(f"UserAccount deletion: {instance.username}")
    
    # Emit account deactivation signal before deletion
    emit_account_status_changed(
        user_id=str(instance.id),
        username=instance.username,
        is_active=False,
        reason="Account deleted from system",
        changed_by_admin=True  # Assuming deletion is admin action
    )

# ==================== CUSTOM SIGNAL RECEIVERS ====================

# These receivers listen to our own custom signals for internal processing
# Example: Log all PPPoE credential signals for audit

@receiver(pppoe_credentials_generated)
def log_pppoe_credentials_signal(sender, **kwargs):
    """
    Log all PPPoE credential generation signals for audit trail
    """
    cache_key = kwargs.get('cache_key')
    username = kwargs.get('username')
    phone = kwargs.get('phone_number')
    
    logger.info(
        f"PPPoE credentials signal received: "
        f"sender={sender}, user={username}, phone={phone}, "
        f"cache_key={cache_key}"
    )

@receiver(client_account_created)
def log_client_creation_signal(sender, **kwargs):
    """
    Log all client creation signals
    """
    username = kwargs.get('username')
    connection_type = kwargs.get('connection_type')
    
    logger.info(
        f"Client creation signal received: "
        f"sender={sender}, user={username}, type={connection_type}"
    )

# ==================== SIGNAL REGISTRATION ====================

def register_model_receivers():
    """
    Explicitly register model signal receivers
    """
    # Receivers are already registered via @receiver decorators
    # This function is for clarity and explicit registration if needed
    logger.info("Authentication model signal receivers registered")
    return True