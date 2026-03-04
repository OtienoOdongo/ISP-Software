

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