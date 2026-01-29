"""
Production-ready Signal Emitters
Helper functions to emit signals with proper data validation and error handling
"""

import logging
import re
import time
import uuid
from typing import Any, Dict, List, Optional, Tuple, Union

from django.core.exceptions import ValidationError
from django.db import transaction

from .core import (
    AccountStatusSignal,
    ClientAccountSignal,
    PPPoECredentialsSignal,
    SignalCacheManager,
    SignalType,
    account_status_changed,
    authentication_failed,
    client_account_created,
    emit_signal_with_retry,
    pppoe_credentials_generated,
    pppoe_credentials_updated,
    send_notification,
)

logger = logging.getLogger(__name__)

# ==================== CORE EMITTER FUNCTIONS ====================

def emit_pppoe_credentials(
    user_id: str,
    username: str,
    pppoe_username: str,
    password: str,
    phone_number: str,
    client_name: str = "",
    connection_type: str = "pppoe",
    validate: bool = True,
    source: str = "authentication.emitters"
) -> Dict[str, Any]:
    """
    Emit signal when PPPoE credentials are generated
    Returns result dict with success status and signal_id
    """
    result = {
        'success': False,
        'signal_id': None,
        'error': None,
        'timestamp': time.time(),
        'type': 'pppoe_credentials_generated'
    }
    
    try:
        # Prepare signal data
        signal_data = PPPoECredentialsSignal(
            user_id=user_id,
            username=username,
            pppoe_username=pppoe_username,
            password=password,
            phone_number=phone_number,
            client_name=client_name,
            connection_type=connection_type
        )
        
        # Import validators here to avoid circular imports
        from .validators import validate_signal_data
        
        # Validate if requested
        if validate:
            is_valid, error_message = validate_signal_data(
                SignalType.PPPOE_CREDENTIALS_GENERATED,
                signal_data.to_dict()
            )
            if not is_valid:
                result['error'] = f"Validation failed: {error_message}"
                logger.error(f"PPPoE credentials validation failed: {error_message}")
                return result
        
        # Emit signal with retry mechanism
        emit_result = emit_signal_with_retry(
            signal=pppoe_credentials_generated,
            signal_type=SignalType.PPPOE_CREDENTIALS_GENERATED,
            data=signal_data.to_dict(),
            sender=source,
            max_retries=3
        )
        
        # Update result
        result['success'] = emit_result['success']
        result['signal_id'] = emit_result['signal_id']
        result['error'] = emit_result['error']
        result['attempts'] = emit_result['attempts']
        
        if result['success']:
            logger.info(
                f"✅ PPPoE credentials signal emitted successfully: "
                f"user={username}, "
                f"pppoe_username={pppoe_username}, "
                f"signal_id={result['signal_id']}"
            )
        else:
            logger.error(
                f"❌ Failed to emit PPPoE credentials signal: "
                f"user={username}, "
                f"error={result['error']}"
            )
        
    except Exception as e:
        result['error'] = str(e)
        logger.error(
            f"❌ Exception emitting PPPoE credentials signal for {username}: {e}",
            exc_info=True
        )
    
    return result

def emit_client_account_creation(
    user_id: str,
    username: str,
    phone_number: str,
    connection_type: str,
    client_name: str = "",
    created_by_admin: bool = True,
    validate: bool = True,
    source: str = "authentication.emitters"
) -> Dict[str, Any]:
    """
    Emit signal when client account is created
    Returns result dict with success status and signal_id
    """
    result = {
        'success': False,
        'signal_id': None,
        'error': None,
        'timestamp': time.time(),
        'type': 'client_account_created'
    }
    
    try:
        # Prepare signal data
        signal_data = ClientAccountSignal(
            user_id=user_id,
            username=username,
            phone_number=phone_number,
            connection_type=connection_type,
            client_name=client_name,
            created_by_admin=created_by_admin
        )
        
        # Import validators here to avoid circular imports
        from .validators import validate_signal_data
        
        # Validate if requested
        if validate:
            is_valid, error_message = validate_signal_data(
                SignalType.CLIENT_ACCOUNT_CREATED,
                signal_data.to_dict()
            )
            if not is_valid:
                result['error'] = f"Validation failed: {error_message}"
                logger.error(f"Client account validation failed: {error_message}")
                return result
        
        # Emit signal with retry mechanism
        emit_result = emit_signal_with_retry(
            signal=client_account_created,
            signal_type=SignalType.CLIENT_ACCOUNT_CREATED,
            data=signal_data.to_dict(),
            sender=source,
            max_retries=3
        )
        
        # Update result
        result['success'] = emit_result['success']
        result['signal_id'] = emit_result['signal_id']
        result['error'] = emit_result['error']
        result['attempts'] = emit_result['attempts']
        
        if result['success']:
            logger.info(
                f"✅ Client account creation signal emitted successfully: "
                f"user={username}, "
                f"connection_type={connection_type}, "
                f"signal_id={result['signal_id']}"
            )
        else:
            logger.error(
                f"❌ Failed to emit client account creation signal: "
                f"user={username}, "
                f"error={result['error']}"
            )
        
    except Exception as e:
        result['error'] = str(e)
        logger.error(
            f"❌ Exception emitting client account signal for {username}: {e}",
            exc_info=True
        )
    
    return result

def emit_account_status_change(
    user_id: str,
    username: str,
    is_active: bool,
    reason: str,
    changed_by_admin: bool = False,
    admin_email: Optional[str] = None,
    validate: bool = True,
    source: str = "authentication.emitters"
) -> Dict[str, Any]:
    """
    Emit signal when account status changes
    Returns result dict with success status and signal_id
    """
    result = {
        'success': False,
        'signal_id': None,
        'error': None,
        'timestamp': time.time(),
        'type': 'account_status_changed'
    }
    
    try:
        # Prepare signal data
        signal_data = AccountStatusSignal(
            user_id=user_id,
            username=username,
            is_active=is_active,
            reason=reason,
            changed_by_admin=changed_by_admin,
            admin_email=admin_email
        )
        
        # Import validators here to avoid circular imports
        from .validators import validate_signal_data
        
        # Validate if requested
        if validate:
            is_valid, error_message = validate_signal_data(
                SignalType.ACCOUNT_STATUS_CHANGED,
                signal_data.to_dict()
            )
            if not is_valid:
                result['error'] = f"Validation failed: {error_message}"
                logger.error(f"Account status validation failed: {error_message}")
                return result
        
        # Emit signal with retry mechanism
        emit_result = emit_signal_with_retry(
            signal=account_status_changed,
            signal_type=SignalType.ACCOUNT_STATUS_CHANGED,
            data=signal_data.to_dict(),
            sender=source,
            max_retries=3
        )
        
        # Update result
        result['success'] = emit_result['success']
        result['signal_id'] = emit_result['signal_id']
        result['error'] = emit_result['error']
        result['attempts'] = emit_result['attempts']
        
        status_text = "activated" if is_active else "deactivated"
        if result['success']:
            logger.info(
                f"✅ Account status change signal emitted successfully: "
                f"user={username}, "
                f"status={status_text}, "
                f"reason={reason}, "
                f"signal_id={result['signal_id']}"
            )
        else:
            logger.error(
                f"❌ Failed to emit account status change signal: "
                f"user={username}, "
                f"error={result['error']}"
            )
        
    except Exception as e:
        result['error'] = str(e)
        logger.error(
            f"❌ Exception emitting account status signal for {username}: {e}",
            exc_info=True
        )
    
    return result

def emit_pppoe_credentials_update(
    user_id: str,
    username: str,
    username_updated: bool = False,
    password_updated: bool = False,
    updated_by_client: bool = True,
    validate: bool = True,
    source: str = "authentication.emitters"
) -> Dict[str, Any]:
    """
    Emit signal when PPPoE credentials are updated
    Returns result dict with success status
    """
    result = {
        'success': False,
        'error': None,
        'timestamp': time.time(),
        'type': 'pppoe_credentials_updated'
    }
    
    try:
        # Prepare signal data
        signal_data = {
            'user_id': user_id,
            'username': username,
            'username_updated': username_updated,
            'password_updated': password_updated,
            'updated_by_client': updated_by_client,
            'timestamp': time.time()
        }
        
        # Import validators here to avoid circular imports
        from .validators import validate_signal_data
        
        # Validate if requested
        if validate:
            is_valid, error_message = validate_signal_data(
                SignalType.PPPOE_CREDENTIALS_UPDATED,
                signal_data
            )
            if not is_valid:
                result['error'] = f"Validation failed: {error_message}"
                logger.error(f"PPPoE credentials update validation failed: {error_message}")
                return result
        
        # Emit signal
        try:
            pppoe_credentials_updated.send(
                sender=source,
                **signal_data
            )
            
            result['success'] = True
            logger.info(
                f"✅ PPPoE credentials update signal emitted successfully: "
                f"user={username}, "
                f"username_updated={username_updated}, "
                f"password_updated={password_updated}"
            )
            
        except Exception as e:
            result['error'] = str(e)
            logger.error(
                f"❌ Failed to emit PPPoE credentials update signal: "
                f"user={username}, "
                f"error={result['error']}"
            )
        
    except Exception as e:
        result['error'] = str(e)
        logger.error(
            f"❌ Exception emitting PPPoE credentials update signal for {username}: {e}",
            exc_info=True
        )
    
    return result

def emit_authentication_failure(
    username: str,
    ip_address: str,
    failure_type: str,
    failure_reason: Optional[str] = None,
    attempt_count: int = 1,
    validate: bool = True,
    source: str = "authentication.emitters"
) -> Dict[str, Any]:
    """
    Emit signal for failed authentication attempts
    Returns result dict with success status
    """
    result = {
        'success': False,
        'error': None,
        'timestamp': time.time(),
        'type': 'authentication_failed'
    }
    
    try:
        # Prepare signal data
        signal_data = {
            'username': username,
            'ip_address': ip_address,
            'failure_type': failure_type,
            'failure_reason': failure_reason,
            'attempt_count': attempt_count,
            'timestamp': time.time()
        }
        
        # Import validators here to avoid circular imports
        from .validators import validate_signal_data
        
        # Validate if requested
        if validate:
            is_valid, error_message = validate_signal_data(
                SignalType.AUTHENTICATION_FAILED,
                signal_data
            )
            if not is_valid:
                result['error'] = f"Validation failed: {error_message}"
                logger.error(f"Authentication failure validation failed: {error_message}")
                return result
        
        # Emit signal
        try:
            authentication_failed.send(
                sender=source,
                **signal_data
            )
            
            result['success'] = True
            logger.warning(
                f"⚠️ Authentication failure signal emitted: "
                f"username={username}, "
                f"type={failure_type}, "
                f"ip={ip_address}, "
                f"reason={failure_reason}"
            )
            
        except Exception as e:
            result['error'] = str(e)
            logger.error(
                f"❌ Failed to emit authentication failure signal: "
                f"username={username}, "
                f"error={result['error']}"
            )
        
    except Exception as e:
        result['error'] = str(e)
        logger.error(
            f"❌ Exception emitting authentication failure signal for {username}: {e}",
            exc_info=True
        )
    
    return result

def emit_custom_notification(
    user_id: str,
    notification_type: str,
    data: Dict[str, Any],
    priority: str = "normal",
    validate: bool = True,
    source: str = "authentication.emitters"
) -> Dict[str, Any]:
    """
    Emit custom notification signal
    Returns result dict with success status and signal_id
    """
    result = {
        'success': False,
        'signal_id': None,
        'error': None,
        'timestamp': time.time(),
        'type': 'send_notification'
    }
    
    try:
        # Prepare signal data
        signal_data = {
            'user_id': user_id,
            'notification_type': notification_type,
            'data': data,
            'priority': priority,
            'timestamp': time.time()
        }
        
        # Import validators here to avoid circular imports
        from .validators import validate_signal_data
        
        # Validate if requested
        if validate:
            is_valid, error_message = validate_signal_data(
                SignalType.SEND_NOTIFICATION,
                signal_data
            )
            if not is_valid:
                result['error'] = f"Validation failed: {error_message}"
                logger.error(f"Custom notification validation failed: {error_message}")
                return result
        
        # Emit signal with retry mechanism
        emit_result = emit_signal_with_retry(
            signal=send_notification,
            signal_type=SignalType.SEND_NOTIFICATION,
            data=signal_data,
            sender=source,
            max_retries=2  # Lower retries for notifications
        )
        
        # Update result
        result['success'] = emit_result['success']
        result['signal_id'] = emit_result['signal_id']
        result['error'] = emit_result['error']
        result['attempts'] = emit_result['attempts']
        
        if result['success']:
            logger.info(
                f"✅ Custom notification signal emitted successfully: "
                f"user_id={user_id}, "
                f"type={notification_type}, "
                f"priority={priority}, "
                f"signal_id={result['signal_id']}"
            )
        else:
            logger.error(
                f"❌ Failed to emit custom notification signal: "
                f"user_id={user_id}, "
                f"error={result['error']}"
            )
        
    except Exception as e:
        result['error'] = str(e)
        logger.error(
            f"❌ Exception emitting custom notification signal for user {user_id}: {e}",
            exc_info=True
        )
    
    return result

# ==================== BATCH EMITTERS ====================

def emit_batch_account_creations(
    users_data: List[Dict[str, Any]],
    validate_each: bool = True,
    transaction_safe: bool = True,
    source: str = "authentication.emitters.batch"
) -> Dict[str, Any]:
    """
    Emit signals for batch account creation
    Returns summary of results
    """
    result = {
        'total': len(users_data),
        'successful': 0,
        'failed': 0,
        'signal_ids': [],
        'errors': [],
        'start_time': time.time(),
        'type': 'batch_account_creation'
    }
    
    def _process_batch():
        for idx, user_data in enumerate(users_data):
            try:
                # Extract required fields
                user_id = user_data.get('user_id')
                username = user_data.get('username')
                phone_number = user_data.get('phone_number')
                connection_type = user_data.get('connection_type')
                
                if not all([user_id, username, phone_number, connection_type]):
                    result['failed'] += 1
                    result['errors'].append({
                        'index': idx,
                        'error': 'Missing required fields',
                        'data': user_data
                    })
                    continue
                
                # Emit signal for this user
                emit_result = emit_client_account_creation(
                    user_id=user_id,
                    username=username,
                    phone_number=phone_number,
                    connection_type=connection_type,
                    client_name=user_data.get('client_name', ''),
                    created_by_admin=user_data.get('created_by_admin', True),
                    validate=validate_each,
                    source=source
                )
                
                if emit_result['success']:
                    result['successful'] += 1
                    if emit_result['signal_id']:
                        result['signal_ids'].append(emit_result['signal_id'])
                else:
                    result['failed'] += 1
                    result['errors'].append({
                        'index': idx,
                        'username': username,
                        'error': emit_result['error']
                    })
                    
            except Exception as e:
                result['failed'] += 1
                result['errors'].append({
                    'index': idx,
                    'error': str(e),
                    'data': user_data
                })
                logger.error(f"Error processing batch user {idx}: {e}")
    
    try:
        if transaction_safe:
            # Process in transaction if needed
            with transaction.atomic():
                _process_batch()
        else:
            _process_batch()
        
        result['end_time'] = time.time()
        result['duration'] = result['end_time'] - result['start_time']
        
        logger.info(
            f"✅ Batch account creation completed: "
            f"total={result['total']}, "
            f"successful={result['successful']}, "
            f"failed={result['failed']}, "
            f"duration={result['duration']:.2f}s"
        )
        
    except Exception as e:
        result['error'] = str(e)
        logger.error(f"❌ Batch account creation failed: {e}", exc_info=True)
    
    return result

def emit_bulk_pppoe_credentials(
    credentials_list: List[Dict[str, Any]],
    validate_each: bool = True,
    transaction_safe: bool = True,
    source: str = "authentication.emitters.bulk"
) -> Dict[str, Any]:
    """
    Emit signals for bulk PPPoE credential generation
    Returns summary of results
    """
    result = {
        'total': len(credentials_list),
        'successful': 0,
        'failed': 0,
        'signal_ids': [],
        'errors': [],
        'start_time': time.time(),
        'type': 'bulk_pppoe_credentials'
    }
    
    def _process_bulk():
        for idx, cred_data in enumerate(credentials_list):
            try:
                # Extract required fields
                user_id = cred_data.get('user_id')
                username = cred_data.get('username')
                pppoe_username = cred_data.get('pppoe_username')
                password = cred_data.get('password')
                phone_number = cred_data.get('phone_number')
                
                if not all([user_id, username, pppoe_username, password, phone_number]):
                    result['failed'] += 1
                    result['errors'].append({
                        'index': idx,
                        'error': 'Missing required fields',
                        'data': {k: v for k, v in cred_data.items() if k != 'password'}
                    })
                    continue
                
                # Emit signal for this credential
                emit_result = emit_pppoe_credentials(
                    user_id=user_id,
                    username=username,
                    pppoe_username=pppoe_username,
                    password=password,
                    phone_number=phone_number,
                    client_name=cred_data.get('client_name', ''),
                    connection_type=cred_data.get('connection_type', 'pppoe'),
                    validate=validate_each,
                    source=source
                )
                
                if emit_result['success']:
                    result['successful'] += 1
                    if emit_result['signal_id']:
                        result['signal_ids'].append(emit_result['signal_id'])
                else:
                    result['failed'] += 1
                    result['errors'].append({
                        'index': idx,
                        'username': username,
                        'error': emit_result['error']
                    })
                    
            except Exception as e:
                result['failed'] += 1
                result['errors'].append({
                    'index': idx,
                    'error': str(e),
                    'data': cred_data
                })
                logger.error(f"Error processing bulk credential {idx}: {e}")
    
    try:
        if transaction_safe:
            # Process in transaction if needed
            with transaction.atomic():
                _process_bulk()
        else:
            _process_bulk()
        
        result['end_time'] = time.time()
        result['duration'] = result['end_time'] - result['start_time']
        
        logger.info(
            f"✅ Bulk PPPoE credentials generation completed: "
            f"total={result['total']}, "
            f"successful={result['successful']}, "
            f"failed={result['failed']}, "
            f"duration={result['duration']:.2f}s"
        )
        
    except Exception as e:
        result['error'] = str(e)
        logger.error(f"❌ Bulk PPPoE credentials generation failed: {e}", exc_info=True)
    
    return result

# ==================== VALIDATION HELPERS ====================

def validate_pppoe_username(value: str) -> Tuple[bool, str]:
    """
    Validate PPPoE username format
    """
    if not value:
        return False, "PPPoE username is required"
    
    if len(value) < 3:
        return False, "PPPoE username must be at least 3 characters"
    
    if len(value) > 32:
        return False, "PPPoE username must be 32 characters or less"
    
    if not re.match(r'^[a-zA-Z0-9_.-]+$', value):
        return False, "PPPoE username can only contain letters, numbers, dots, dashes, and underscores"
    
    # Check for common reserved names
    reserved_names = ['admin', 'root', 'system', 'test', 'guest']
    if value.lower() in reserved_names:
        return False, f"PPPoE username '{value}' is reserved"
    
    return True, "Valid PPPoE username"

def validate_password_strength(value: str) -> Tuple[bool, str]:
    """
    Validate password strength
    """
    if not value:
        return False, "Password is required"
    
    if len(value) < 8:
        return False, "Password must be at least 8 characters"
    
    if len(value) > 64:
        return False, "Password must be 64 characters or less"
    
    # Check for uppercase
    if not any(c.isupper() for c in value):
        return False, "Password must contain at least one uppercase letter"
    
    # Check for lowercase
    if not any(c.islower() for c in value):
        return False, "Password must contain at least one lowercase letter"
    
    # Check for digit
    if not any(c.isdigit() for c in value):
        return False, "Password must contain at least one digit"
    
    # Check for special character
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', value):
        return False, "Password must contain at least one special character"
    
    # Check for common weak passwords
    weak_passwords = ['password', '12345678', 'qwerty123', 'admin123']
    if value.lower() in weak_passwords:
        return False, "Password is too common, please choose a stronger one"
    
    return True, "Strong password"

def validate_username(value: str) -> Tuple[bool, str]:
    """
    Validate username format
    """
    if not value:
        return False, "Username is required"
    
    if len(value) < 3:
        return False, "Username must be at least 3 characters"
    
    if len(value) > 50:
        return False, "Username must be 50 characters or less"
    
    if not re.match(r'^[a-zA-Z0-9_.-]+$', value):
        return False, "Username can only contain letters, numbers, dots, dashes, and underscores"
    
    # Check for reserved names
    reserved_names = ['admin', 'root', 'system', 'null', 'undefined']
    if value.lower() in reserved_names:
        return False, f"Username '{value}' is reserved"
    
    return True, "Valid username"

# ==================== SIGNAL MONITORING ====================

def get_emission_stats(timeframe_hours: int = 24) -> Dict[str, Any]:
    """
    Get statistics about signal emissions
    """
    stats = {
        'timeframe_hours': timeframe_hours,
        'signals_emitted': 0,
        'success_rate': 0,
        'by_type': {},
        'errors': [],
        'timestamp': time.time()
    }
    
    try:
        cutoff_time = time.time() - (timeframe_hours * 3600)
        
        # Get all signal types
        from .core import SignalType
        for signal_type in SignalType:
            signal_list_key = f"{SignalCacheManager.CACHE_PREFIX}list:{signal_type.value}"
            signal_ids = SignalCacheManager._get_signal_ids(signal_list_key)
            
            recent_signals = 0
            successful = 0
            
            for signal_id in signal_ids:
                signal_data = SignalCacheManager.get_signal(signal_id)
                if signal_data:
                    created_at = signal_data['metadata'].get('created_at', 0)
                    
                    if created_at > cutoff_time:
                        recent_signals += 1
                        stats['signals_emitted'] += 1
                        
                        status = signal_data['metadata'].get('status')
                        if status == 'delivered':  # Use string, not enum
                            successful += 1
            
            stats['by_type'][signal_type.value] = {
                'count': recent_signals,
                'successful': successful,
                'failed': recent_signals - successful
            }
        
        # Calculate success rate
        if stats['signals_emitted'] > 0:
            total_successful = sum(t['successful'] for t in stats['by_type'].values())
            stats['success_rate'] = (total_successful / stats['signals_emitted']) * 100
        
        # Get recent errors
        stats['errors'] = SignalCacheManager.get_recent_errors(timeframe_hours)
        
    except Exception as e:
        stats['error'] = str(e)
        logger.error(f"Error getting emission stats: {e}")
    
    return stats

# ==================== EXPORT ALL FUNCTIONS ====================

__all__ = [
    'emit_pppoe_credentials',
    'emit_client_account_creation',
    'emit_account_status_change',
    'emit_pppoe_credentials_update',
    'emit_authentication_failure',
    'emit_custom_notification',
    'emit_batch_account_creations',
    'emit_bulk_pppoe_credentials',
    'get_emission_stats',
    'validate_pppoe_username',
    'validate_password_strength',
    'validate_username'
]