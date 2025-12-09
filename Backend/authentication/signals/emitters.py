"""
Signal Emitter Functions
Helper functions to emit signals with proper data validation
"""

import logging
import time
from typing import Dict, Any, Optional, List
from .core import (
    pppoe_credentials_generated,
    client_account_created,
    pppoe_credentials_updated,
    account_status_changed,
    authentication_failed,
    send_notification,
    SignalCacheManager,
)
from .validators import validate_signal_data

logger = logging.getLogger(__name__)

# ==================== SIGNAL EMITTER FUNCTIONS ====================

def emit_pppoe_credentials_generated(
    user_id: str,
    username: str,
    pppoe_username: str,
    password: str,
    phone_number: str,
    client_name: str = "",
    connection_type: str = "pppoe"
) -> Optional[str]:
    """
    Emit signal when PPPoE credentials are generated
    Returns cache key for tracking
    """
    signal_data = {
        'user_id': user_id,
        'username': username,
        'pppoe_username': pppoe_username,
        'password': password,
        'phone_number': phone_number,
        'client_name': client_name,
        'connection_type': connection_type,
        'timestamp': time.time(),
        'signal_type': 'pppoe_credentials_generated'
    }
    
    # Validate data
    if not validate_signal_data('pppoe_credentials_generated', signal_data):
        logger.error(f"Invalid data for PPPoE credentials signal: {signal_data}")
        return None
    
    # Store in cache for reliability
    cache_key = SignalCacheManager.store_pending_signal(
        'pppoe_credentials_generated',
        signal_data
    )
    
    # Emit signal
    try:
        pppoe_credentials_generated.send(
            sender='authentication.emitters',
            cache_key=cache_key,
            **signal_data
        )
        
        logger.info(
            f"Emitted PPPoE credentials signal: "
            f"user={username}, phone={phone_number}, "
            f"cache_key={cache_key}"
        )
        
        return cache_key
        
    except Exception as e:
        logger.error(f"Failed to emit PPPoE credentials signal: {e}")
        SignalCacheManager.mark_signal_failed(cache_key, str(e))
        return None

def emit_client_account_created(
    user_id: str,
    username: str,
    phone_number: str,
    connection_type: str,
    client_name: str = "",
    created_by_admin: bool = True
) -> Optional[str]:
    """
    Emit signal when client account is created
    Returns cache key for tracking
    """
    signal_data = {
        'user_id': user_id,
        'username': username,
        'phone_number': phone_number,
        'connection_type': connection_type,
        'client_name': client_name,
        'created_by_admin': created_by_admin,
        'timestamp': time.time(),
        'signal_type': 'client_account_created'
    }
    
    if not validate_signal_data('client_account_created', signal_data):
        logger.error(f"Invalid data for client account signal: {signal_data}")
        return None
    
    cache_key = SignalCacheManager.store_pending_signal(
        'client_account_created',
        signal_data
    )
    
    try:
        client_account_created.send(
            sender='authentication.emitters',
            cache_key=cache_key,
            **signal_data
        )
        
        logger.info(
            f"Emitted client account created signal: "
            f"user={username}, type={connection_type}, "
            f"cache_key={cache_key}"
        )
        
        return cache_key
        
    except Exception as e:
        logger.error(f"Failed to emit client account signal: {e}")
        SignalCacheManager.mark_signal_failed(cache_key, str(e))
        return None

def emit_pppoe_credentials_updated(
    user_id: str,
    username: str,
    username_updated: bool = False,
    password_updated: bool = False,
    updated_by_client: bool = True
) -> bool:
    """
    Emit signal when PPPoE client updates their credentials
    Returns success status
    """
    signal_data = {
        'user_id': user_id,
        'username': username,
        'username_updated': username_updated,
        'password_updated': password_updated,
        'updated_by_client': updated_by_client,
        'timestamp': time.time(),
        'signal_type': 'pppoe_credentials_updated'
    }
    
    if not validate_signal_data('pppoe_credentials_updated', signal_data):
        logger.error(f"Invalid data for credentials update signal: {signal_data}")
        return False
    
    try:
        pppoe_credentials_updated.send(
            sender='authentication.emitters',
            **signal_data
        )
        
        logger.info(
            f"Emitted PPPoE credentials updated signal: "
            f"user={username}, username_updated={username_updated}, "
            f"password_updated={password_updated}"
        )
        
        return True
        
    except Exception as e:
        logger.error(f"Failed to emit credentials update signal: {e}")
        return False

def emit_account_status_changed(
    user_id: str,
    username: str,
    is_active: bool,
    reason: str,
    changed_by_admin: bool = False,
    admin_email: str = None
) -> bool:
    """
    Emit signal when account status changes
    Returns success status
    """
    signal_data = {
        'user_id': user_id,
        'username': username,
        'is_active': is_active,
        'reason': reason,
        'changed_by_admin': changed_by_admin,
        'admin_email': admin_email,
        'timestamp': time.time(),
        'signal_type': 'account_status_changed'
    }
    
    if not validate_signal_data('account_status_changed', signal_data):
        logger.error(f"Invalid data for account status signal: {signal_data}")
        return False
    
    try:
        account_status_changed.send(
            sender='authentication.emitters',
            **signal_data
        )
        
        status_text = "activated" if is_active else "deactivated"
        logger.info(
            f"Emitted account status changed signal: "
            f"user={username}, status={status_text}, "
            f"reason={reason}"
        )
        
        return True
        
    except Exception as e:
        logger.error(f"Failed to emit account status signal: {e}")
        return False

def emit_authentication_failed(
    username: str,
    ip_address: str,
    failure_type: str,
    failure_reason: str = None,
    attempt_count: int = 1
) -> bool:
    """
    Emit signal for failed authentication attempts
    Returns success status
    """
    signal_data = {
        'username': username,
        'ip_address': ip_address,
        'failure_type': failure_type,
        'failure_reason': failure_reason,
        'attempt_count': attempt_count,
        'timestamp': time.time(),
        'signal_type': 'authentication_failed'
    }
    
    if not validate_signal_data('authentication_failed', signal_data):
        logger.error(f"Invalid data for auth failure signal: {signal_data}")
        return False
    
    try:
        authentication_failed.send(
            sender='authentication.emitters',
            **signal_data
        )
        
        logger.warning(
            f"Emitted authentication failed signal: "
            f"username={username}, type={failure_type}, "
            f"ip={ip_address}, reason={failure_reason}"
        )
        
        return True
        
    except Exception as e:
        logger.error(f"Failed to emit auth failure signal: {e}")
        return False

def emit_custom_notification(
    user_id: str,
    notification_type: str,
    data: Dict[str, Any],
    priority: str = "normal"  # 'low', 'normal', 'high', 'critical'
) -> Optional[str]:
    """
    Emit generic notification signal
    Returns cache key for tracking
    """
    signal_data = {
        'user_id': user_id,
        'notification_type': notification_type,
        'data': data,
        'priority': priority,
        'timestamp': time.time(),
        'signal_type': 'send_notification'
    }
    
    if not validate_signal_data('send_notification', signal_data):
        logger.error(f"Invalid data for custom notification: {signal_data}")
        return None
    
    cache_key = SignalCacheManager.store_pending_signal(
        'send_notification',
        signal_data
    )
    
    try:
        send_notification.send(
            sender='authentication.emitters',
            cache_key=cache_key,
            **signal_data
        )
        
        logger.info(
            f"Emitted custom notification signal: "
            f"user={user_id}, type={notification_type}, "
            f"priority={priority}, cache_key={cache_key}"
        )
        
        return cache_key
        
    except Exception as e:
        logger.error(f"Failed to emit custom notification: {e}")
        SignalCacheManager.mark_signal_failed(cache_key, str(e))
        return None

# ==================== BATCH EMITTERS ====================

def emit_batch_account_creation(users_data: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Emit signals for batch account creation
    Returns summary of results
    """
    results = {
        'total': len(users_data),
        'successful': 0,
        'failed': 0,
        'cache_keys': [],
        'errors': []
    }
    
    for user_data in users_data:
        try:
            cache_key = emit_client_account_created(**user_data)
            if cache_key:
                results['successful'] += 1
                results['cache_keys'].append(cache_key)
            else:
                results['failed'] += 1
                results['errors'].append(f"Failed to emit signal for {user_data.get('username')}")
        except Exception as e:
            results['failed'] += 1
            results['errors'].append(str(e))
    
    logger.info(
        f"Batch account creation signals emitted: "
        f"successful={results['successful']}, failed={results['failed']}"
    )
    
    return results