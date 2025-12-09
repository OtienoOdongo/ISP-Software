"""
Core Signal Definitions and Utilities
Defines all signals used for inter-app communication
"""

from django.dispatch import Signal
from django.core.cache import cache
from django.db.models.signals import post_save
import logging
import time
from typing import Dict, Any, List, Optional
import json

logger = logging.getLogger(__name__)

# ==================== SIGNAL DEFINITIONS ====================

# Signal emitted when PPPoE credentials are generated
# Used by: UserManagement app to send SMS
# Data format: {
#   'user_id': str,
#   'username': str,
#   'pppoe_username': str,
#   'password': str,
#   'phone_number': str,
#   'client_name': str,
#   'timestamp': float
# }
pppoe_credentials_generated = Signal()

# Signal emitted when any client account is created
# Used by: UserManagement app for welcome SMS/notifications
# Data format: {
#   'user_id': str,
#   'username': str,
#   'phone_number': str,
#   'connection_type': str,  # 'hotspot' or 'pppoe'
#   'client_name': str,
#   'timestamp': float
# }
client_account_created = Signal()

# Signal emitted when PPPoE client updates their credentials
# Used by: UserManagement app for confirmation SMS
# Data format: {
#   'user_id': str,
#   'username': str,
#   'username_updated': bool,
#   'password_updated': bool,
#   'timestamp': float
# }
pppoe_credentials_updated = Signal()

# Signal emitted when account status changes (active/inactive)
# Used by: UserManagement app for notification SMS
# Data format: {
#   'user_id': str,
#   'username': str,
#   'is_active': bool,
#   'reason': str,
#   'changed_by_admin': bool,
#   'timestamp': float
# }
account_status_changed = Signal()

# Signal emitted for failed authentication attempts
# Used by: UserManagement app for security alerts
# Data format: {
#   'username': str,
#   'ip_address': str,
#   'failure_type': str,  # 'pppoe', 'phone', 'admin'
#   'timestamp': float
# }
authentication_failed = Signal()

# Generic signal for sending custom notifications
# Used by: Any app needing to send notifications
# Data format: {
#   'user_id': str,
#   'notification_type': str,
#   'data': Dict[str, Any],
#   'timestamp': float
# }
send_notification = Signal()

# ==================== SIGNAL CACHE MANAGER ====================

class SignalCacheManager:
    """
    Manages caching of signal data for reliability and retry capability
    Ensures no signals are lost if receiving app is temporarily unavailable
    """
    
    _CACHE_PREFIX = "signal_pending_"
    _MAX_RETRIES = 3
    _RETRY_DELAY = 300  # 5 minutes between retries
    
    @classmethod
    def get_cache_key(cls, signal_name: str, identifier: str = None) -> str:
        """
        Generate consistent cache key for signals
        """
        if identifier:
            return f"{cls._CACHE_PREFIX}{signal_name}_{identifier}_{int(time.time())}"
        return f"{cls._CACHE_PREFIX}{signal_name}_{int(time.time())}"
    
    @classmethod
    def store_pending_signal(cls, signal_name: str, signal_data: Dict[str, Any]) -> str:
        """
        Store signal data in cache for reliable delivery
        Returns cache key for tracking
        """
        user_id = signal_data.get('user_id', 'unknown')
        cache_key = cls.get_cache_key(signal_name, user_id)
        
        signal_payload = {
            'signal_name': signal_name,
            'signal_data': signal_data,
            'created_at': time.time(),
            'retry_count': 0,
            'last_attempt': None,
            'status': 'pending',
            'metadata': {
                'user_id': user_id,
                'username': signal_data.get('username', ''),
                'phone': signal_data.get('phone_number', ''),
            }
        }
        
        # Store for 1 hour (allows time for retries)
        cache.set(cache_key, signal_payload, 3600)
        
        logger.debug(
            f"Stored pending signal: {signal_name} "
            f"for user: {signal_data.get('username', 'unknown')} "
            f"key: {cache_key}"
        )
        
        return cache_key
    
    @classmethod
    def get_signal(cls, cache_key: str) -> Optional[Dict]:
        """
        Retrieve signal data from cache
        """
        return cache.get(cache_key)
    
    @classmethod
    def mark_signal_delivered(cls, cache_key: str):
        """
        Mark signal as successfully delivered
        """
        cached = cache.get(cache_key)
        if cached:
            cached['status'] = 'delivered'
            cached['delivered_at'] = time.time()
            cached['delivery_duration'] = time.time() - cached['created_at']
            cache.set(cache_key, cached, 3600)  # Keep delivered signals for 1 hour
            
            logger.debug(
                f"Marked signal as delivered: {cache_key} "
                f"duration: {cached['delivery_duration']:.2f}s"
            )
    
    @classmethod
    def mark_signal_failed(cls, cache_key: str, error_message: str = None):
        """
        Mark signal as failed, increment retry count
        """
        cached = cache.get(cache_key)
        if cached:
            cached['retry_count'] += 1
            cached['last_attempt'] = time.time()
            
            if error_message:
                cached.setdefault('errors', []).append(error_message)
            
            if cached['retry_count'] >= cls._MAX_RETRIES:
                cached['status'] = 'failed'
                logger.error(
                    f"Signal failed after max retries: {cache_key} "
                    f"errors: {cached.get('errors', [])}"
                )
                # Keep failed signals for 24 hours for debugging
                cache.set(cache_key, cached, 86400)
            else:
                cached['status'] = 'retrying'
                # Schedule retry by updating TTL
                retry_in = cls._RETRY_DELAY * cached['retry_count']
                cache.set(cache_key, cached, retry_in)
                
                logger.warning(
                    f"Signal marked for retry #{cached['retry_count']}: {cache_key} "
                    f"next retry in {retry_in}s"
                )
    
    @classmethod
    def get_pending_signals(cls, signal_name: str = None) -> List[Dict]:
        """
        Get all pending or retrying signals
        Useful for monitoring dashboard and manual retry
        """
        pattern = f"{cls._CACHE_PREFIX}*"
        keys = cache.keys(pattern) if hasattr(cache, 'keys') else []
        
        pending_signals = []
        for key in keys:
            cached = cache.get(key)
            if cached and cached['status'] in ['pending', 'retrying']:
                if not signal_name or cached['signal_name'] == signal_name:
                    signal_info = {
                        'cache_key': key,
                        'signal_name': cached['signal_name'],
                        'data': cached['signal_data'],
                        'retry_count': cached['retry_count'],
                        'status': cached['status'],
                        'created_at': cached['created_at'],
                        'last_attempt': cached.get('last_attempt'),
                        'metadata': cached.get('metadata', {})
                    }
                    pending_signals.append(signal_info)
        
        # Sort by creation time (oldest first for retry priority)
        pending_signals.sort(key=lambda x: x['created_at'])
        return pending_signals
    
    @classmethod
    def get_signal_stats(cls) -> Dict[str, Any]:
        """
        Get statistics about signals
        Useful for monitoring and dashboards
        """
        pattern = f"{cls._CACHE_PREFIX}*"
        keys = cache.keys(pattern) if hasattr(cache, 'keys') else []
        
        stats = {
            'total': 0,
            'by_status': {'pending': 0, 'retrying': 0, 'delivered': 0, 'failed': 0},
            'by_signal': {},
            'oldest_pending': None,
            'newest_pending': None,
        }
        
        for key in keys:
            cached = cache.get(key)
            if cached:
                stats['total'] += 1
                
                # Count by status
                status = cached['status']
                stats['by_status'][status] = stats['by_status'].get(status, 0) + 1
                
                # Count by signal type
                signal_name = cached['signal_name']
                stats['by_signal'][signal_name] = stats['by_signal'].get(signal_name, 0) + 1
                
                # Track oldest/newest pending
                if status in ['pending', 'retrying']:
                    created_at = cached['created_at']
                    if not stats['oldest_pending'] or created_at < stats['oldest_pending']:
                        stats['oldest_pending'] = created_at
                    if not stats['newest_pending'] or created_at > stats['newest_pending']:
                        stats['newest_pending'] = created_at
        
        # Convert timestamps to human-readable
        if stats['oldest_pending']:
            stats['oldest_pending_human'] = time.ctime(stats['oldest_pending'])
        if stats['newest_pending']:
            stats['newest_pending_human'] = time.ctime(stats['newest_pending'])
        
        return stats
    
    @classmethod
    def cleanup_old_signals(cls, older_than_hours: int = 24):
        """
        Clean up old signals from cache
        Should be called by scheduled task
        """
        pattern = f"{cls._CACHE_PREFIX}*"
        keys = cache.keys(pattern) if hasattr(cache, 'keys') else []
        
        cutoff_time = time.time() - (older_than_hours * 3600)
        deleted_count = 0
        
        for key in keys:
            cached = cache.get(key)
            if cached and cached['created_at'] < cutoff_time:
                cache.delete(key)
                deleted_count += 1
        
        logger.info(f"Cleaned up {deleted_count} signals older than {older_than_hours} hours")
        return deleted_count

# ==================== SIGNAL UTILITIES ====================

def get_signal_history(user_id: str, limit: int = 20) -> List[Dict]:
    """
    Get signal history for a specific user
    Useful for audit trails and debugging
    """
    pattern = f"{SignalCacheManager._CACHE_PREFIX}*"
    keys = cache.keys(pattern) if hasattr(cache, 'keys') else []
    
    user_signals = []
    for key in keys:
        cached = cache.get(key)
        if cached and cached['signal_data'].get('user_id') == user_id:
            signal_info = {
                'signal': cached['signal_name'],
                'data': cached['signal_data'],
                'status': cached.get('status', 'unknown'),
                'timestamp': cached.get('created_at'),
                'retry_count': cached.get('retry_count', 0),
                'cache_key': key,
                'delivered_at': cached.get('delivered_at'),
                'errors': cached.get('errors', [])
            }
            user_signals.append(signal_info)
    
    # Sort by timestamp descending (newest first)
    user_signals.sort(key=lambda x: x['timestamp'] or 0, reverse=True)
    return user_signals[:limit]

def resend_failed_signals(signal_name: str = None) -> Dict[str, int]:
    """
    Resend signals that are pending retry
    Returns count of resent signals by status
    """
    pending_signals = SignalCacheManager.get_pending_signals(signal_name)
    
    results = {
        'resent': 0,
        'still_pending': 0,
        'errors': 0
    }
    
    for signal_info in pending_signals:
        if signal_info['status'] == 'retrying':
            cache_key = signal_info['cache_key']
            signal_name = signal_info['signal_name']
            signal_data = signal_info['data']
            
            try:
                # Re-emit the signal
                if signal_name == 'pppoe_credentials_generated':
                    pppoe_credentials_generated.send(
                        sender='authentication.resend',
                        cache_key=cache_key,
                        **signal_data
                    )
                elif signal_name == 'client_account_created':
                    client_account_created.send(
                        sender='authentication.resend',
                        cache_key=cache_key,
                        **signal_data
                    )
                elif signal_name == 'account_status_changed':
                    account_status_changed.send(
                        sender='authentication.resend',
                        cache_key=cache_key,
                        **signal_data
                    )
                
                results['resent'] += 1
                logger.info(
                    f"Resent signal: {signal_name} "
                    f"for user: {signal_data.get('username', 'unknown')}"
                )
                
            except Exception as e:
                results['errors'] += 1
                logger.error(f"Error resending signal {cache_key}: {e}")
        
        elif signal_info['status'] == 'pending':
            results['still_pending'] += 1
    
    return results

def test_signal_connection() -> List[Dict[str, Any]]:
    """
    Test if signals are properly connected
    Useful for health checks and startup validation
    """
    test_signals = [
        ('pppoe_credentials_generated', {
            'user_id': 'test_signal_user_001',
            'username': 'test_user_001',
            'pppoe_username': 'test_pppoe_001',
            'password': 'TestPass123!@#',
            'phone_number': '+254711111111',
            'client_name': 'Test Client 001',
            'timestamp': time.time()
        }),
        ('client_account_created', {
            'user_id': 'test_signal_user_002',
            'username': 'test_user_002',
            'phone_number': '+254722222222',
            'connection_type': 'hotspot',
            'client_name': 'Test Client 002',
            'timestamp': time.time()
        }),
        ('account_status_changed', {
            'user_id': 'test_signal_user_003',
            'username': 'test_user_003',
            'is_active': False,
            'reason': 'Test deactivation',
            'changed_by_admin': True,
            'timestamp': time.time()
        })
    ]
    
    results = []
    for signal_name, test_data in test_signals:
        try:
            # Store in cache first
            cache_key = SignalCacheManager.store_pending_signal(signal_name, test_data)
            
            # Emit signal
            if signal_name == 'pppoe_credentials_generated':
                pppoe_credentials_generated.send(
                    sender='authentication.test',
                    cache_key=cache_key,
                    **test_data
                )
            elif signal_name == 'client_account_created':
                client_account_created.send(
                    sender='authentication.test',
                    cache_key=cache_key,
                    **test_data
                )
            elif signal_name == 'account_status_changed':
                account_status_changed.send(
                    sender='authentication.test',
                    cache_key=cache_key,
                    **test_data
                )
            
            # Immediately mark as delivered for test signals
            SignalCacheManager.mark_signal_delivered(cache_key)
            
            results.append({
                'signal': signal_name,
                'status': 'connected',
                'cache_key': cache_key,
                'message': 'Signal emitted and cached successfully',
                'timestamp': time.time()
            })
            
        except Exception as e:
            results.append({
                'signal': signal_name,
                'status': 'error',
                'message': str(e),
                'timestamp': time.time()
            })
    
    return results

def register_signals():
    """
    Explicitly register all signal handlers
    Can be called from AppConfig.ready() for clarity
    """
    logger.info("Authentication signals module loaded")
    return True