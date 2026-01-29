"""
Core Signal Definitions and Utilities
Defines all signals used for inter-app communication with proper async support
"""

import json
import logging
import time
import uuid
from dataclasses import asdict, dataclass
from datetime import datetime, timedelta
from enum import Enum
from typing import Any, Callable, Dict, List, Optional

from django.core.cache import cache
from django.dispatch import Signal

logger = logging.getLogger(__name__)

# ==================== ENUMS & DATA CLASSES ====================

class SignalType(Enum):
    """Types of signals available in the system"""
    PPPOE_CREDENTIALS_GENERATED = "pppoe_credentials_generated"
    CLIENT_ACCOUNT_CREATED = "client_account_created"
    PPPOE_CREDENTIALS_UPDATED = "pppoe_credentials_updated"
    ACCOUNT_STATUS_CHANGED = "account_status_changed"
    AUTHENTICATION_FAILED = "authentication_failed"
    SEND_NOTIFICATION = "send_notification"

class SignalStatus(Enum):
    """Status of signal delivery"""
    PENDING = "pending"
    DELIVERED = "delivered"
    FAILED = "failed"
    RETRYING = "retrying"

@dataclass
class SignalMetadata:
    """Metadata for signal tracking"""
    signal_id: str
    signal_type: str  # Store as string, not SignalType enum
    created_at: float
    source: str = "authentication"
    attempt_count: int = 0
    last_attempt: Optional[float] = None
    status: str = "pending"  # Store as string, not SignalStatus enum
    error_message: Optional[str] = None
    delivered_at: Optional[float] = None
    
    def __init__(self, signal_id: str, signal_type: SignalType, created_at: float, **kwargs):
        self.signal_id = signal_id
        self.signal_type = signal_type.value if isinstance(signal_type, SignalType) else str(signal_type)
        self.created_at = created_at
        self.source = kwargs.get('source', 'authentication')
        self.attempt_count = kwargs.get('attempt_count', 0)
        self.last_attempt = kwargs.get('last_attempt')
        self.status = kwargs.get('status', SignalStatus.PENDING.value)
        self.error_message = kwargs.get('error_message')
        self.delivered_at = kwargs.get('delivered_at')
    
    def to_dict(self):
        """Convert to dictionary with proper serialization"""
        return {
            'signal_id': self.signal_id,
            'signal_type': self.signal_type,
            'created_at': self.created_at,
            'source': self.source,
            'attempt_count': self.attempt_count,
            'last_attempt': self.last_attempt,
            'status': self.status,
            'error_message': self.error_message,
            'delivered_at': self.delivered_at
        }

@dataclass
class PPPoECredentialsSignal:
    """Data structure for PPPoE credentials generated signal"""
    user_id: str
    username: str
    pppoe_username: str
    password: str
    phone_number: str
    client_name: str
    connection_type: str = "pppoe"
    timestamp: float = None
    
    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = time.time()
    
    def to_dict(self):
        return asdict(self)

@dataclass
class ClientAccountSignal:
    """Data structure for client account creation signal"""
    user_id: str
    username: str
    phone_number: str
    connection_type: str
    client_name: str = ""
    created_by_admin: bool = True
    timestamp: float = None
    
    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = time.time()
    
    def to_dict(self):
        return asdict(self)

@dataclass
class AccountStatusSignal:
    """Data structure for account status change signal"""
    user_id: str
    username: str
    is_active: bool
    reason: str
    changed_by_admin: bool = False
    admin_email: Optional[str] = None
    timestamp: float = None
    
    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = time.time()
    
    def to_dict(self):
        return asdict(self)

# ==================== SIGNAL DEFINITIONS ====================

# Signal emitted when PPPoE credentials are generated
pppoe_credentials_generated = Signal()

# Signal emitted when any client account is created
client_account_created = Signal()

# Signal emitted when PPPoE client updates their credentials
pppoe_credentials_updated = Signal()

# Signal emitted when account status changes (active/inactive)
account_status_changed = Signal()

# Signal emitted for failed authentication attempts
authentication_failed = Signal()

# Generic signal for sending custom notifications
send_notification = Signal()

# ==================== JSON SERIALIZABLE CACHE MANAGER ====================

class JSONSerializableEncoder(json.JSONEncoder):
    """Custom JSON encoder that handles special types"""
    
    def default(self, obj):
        if isinstance(obj, Enum):
            return obj.value
        if hasattr(obj, 'to_dict'):
            return obj.to_dict()
        if hasattr(obj, '__dict__'):
            return obj.__dict__
        if isinstance(obj, datetime):
            return obj.isoformat()
        if isinstance(obj, timedelta):
            return str(obj)
        return super().default(obj)

class SignalCacheManager:
    """
    Production-ready signal cache manager with Redis support
    Handles signal persistence, retries, and monitoring
    """
    
    CACHE_PREFIX = "signal:auth:"
    MAX_RETRIES = 3
    RETRY_DELAY = 300  # 5 minutes in seconds
    TTL_HOURS = 48  # Keep signals for 48 hours
    
    @classmethod
    def _generate_signal_id(cls) -> str:
        """Generate unique signal ID"""
        return f"sig_{uuid.uuid4().hex[:16]}_{int(time.time())}"
    
    @classmethod
    def _get_cache_key(cls, signal_id: str) -> str:
        """Get cache key for signal"""
        return f"{cls.CACHE_PREFIX}{signal_id}"
    
    @classmethod
    def _get_signal_ids(cls, signal_list_key: str) -> List[str]:
        """Get signal IDs from list key"""
        try:
            signal_ids = cache.lrange(signal_list_key, 0, -1)
            return [sid.decode() if isinstance(sid, bytes) else sid for sid in signal_ids]
        except Exception as e:
            logger.warning(f"Error getting signal IDs from list: {e}")
            return []
    
    @classmethod
    def _serialize_payload(cls, payload: Dict[str, Any]) -> str:
        """Serialize payload to JSON with custom encoder"""
        try:
            return json.dumps(payload, cls=JSONSerializableEncoder)
        except Exception as e:
            # Fallback: convert all objects to dicts
            def convert_to_serializable(obj):
                if isinstance(obj, dict):
                    return {k: convert_to_serializable(v) for k, v in obj.items()}
                elif isinstance(obj, list):
                    return [convert_to_serializable(item) for item in obj]
                elif isinstance(obj, Enum):
                    return obj.value
                elif hasattr(obj, 'to_dict'):
                    return obj.to_dict()
                elif hasattr(obj, '__dict__'):
                    return obj.__dict__
                else:
                    return obj
            
            try:
                serializable_payload = convert_to_serializable(payload)
                return json.dumps(serializable_payload)
            except Exception as inner_e:
                logger.error(f"Failed to serialize payload even with fallback: {inner_e}")
                return json.dumps({"error": "Failed to serialize payload", "original_data": str(payload)})
    
    @classmethod
    def store_signal(
        cls,
        signal_type: SignalType,
        signal_data: Dict[str, Any],
        source: str = "authentication"
    ) -> str:
        """
        Store signal data in cache for reliable delivery
        Returns signal_id for tracking
        """
        signal_id = cls._generate_signal_id()
        cache_key = cls._get_cache_key(signal_id)
        
        # Create metadata with string values
        metadata = {
            'signal_id': signal_id,
            'signal_type': signal_type.value,
            'created_at': time.time(),
            'source': source,
            'attempt_count': 0,
            'last_attempt': None,
            'status': SignalStatus.PENDING.value,
            'error_message': None,
            'delivered_at': None
        }
        
        payload = {
            'metadata': metadata,
            'data': signal_data,
            'type': signal_type.value
        }
        
        # Store with TTL
        try:
            serialized_payload = cls._serialize_payload(payload)
            cache.set(cache_key, serialized_payload, cls.TTL_HOURS * 3600)
            
            # Also store in list for tracking
            signal_list_key = f"{cls.CACHE_PREFIX}list:{signal_type.value}"
            cache.lpush(signal_list_key, signal_id)
            cache.expire(signal_list_key, cls.TTL_HOURS * 3600)
            
            logger.info(
                f"Stored signal: {signal_type.value} "
                f"id: {signal_id}, "
                f"user: {signal_data.get('username', 'unknown')}"
            )
            
            return signal_id
            
        except Exception as e:
            logger.error(f"Failed to store signal in cache: {e}", exc_info=True)
            raise
    
    @classmethod
    def get_signal(cls, signal_id: str) -> Optional[Dict]:
        """Retrieve signal data from cache"""
        cache_key = cls._get_cache_key(signal_id)
        try:
            data = cache.get(cache_key)
            if data:
                if isinstance(data, bytes):
                    data = data.decode('utf-8')
                return json.loads(data)
        except Exception as e:
            logger.error(f"Failed to get signal {signal_id}: {e}", exc_info=True)
        return None
    
    @classmethod
    def update_signal_status(
        cls,
        signal_id: str,
        status: SignalStatus,
        error_message: Optional[str] = None
    ) -> bool:
        """Update signal delivery status"""
        cache_key = cls._get_cache_key(signal_id)
        try:
            signal_data = cls.get_signal(signal_id)
            if not signal_data:
                return False
            
            signal_data['metadata']['status'] = status.value
            signal_data['metadata']['last_attempt'] = time.time()
            
            if status == SignalStatus.DELIVERED:
                signal_data['metadata']['delivered_at'] = time.time()
                if 'delivery_duration' not in signal_data['metadata']:
                    signal_data['metadata']['delivery_duration'] = (
                        time.time() - signal_data['metadata']['created_at']
                    )
            elif status == SignalStatus.RETRYING:
                signal_data['metadata']['attempt_count'] += 1
                if error_message:
                    signal_data['metadata']['error_message'] = error_message
            elif status == SignalStatus.FAILED:
                if error_message:
                    signal_data['metadata']['error_message'] = error_message
            
            # Serialize and store
            serialized_data = cls._serialize_payload(signal_data)
            cache.set(cache_key, serialized_data, cls.TTL_HOURS * 3600)
            
            logger.debug(f"Updated signal {signal_id} status to {status.value}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to update signal status {signal_id}: {e}", exc_info=True)
            return False
    
    @classmethod
    def mark_as_delivered(cls, signal_id: str) -> bool:
        """Mark signal as successfully delivered"""
        return cls.update_signal_status(signal_id, SignalStatus.DELIVERED)
    
    @classmethod
    def mark_for_retry(cls, signal_id: str, error_message: str) -> bool:
        """Mark signal for retry with error message"""
        signal_data = cls.get_signal(signal_id)
        if not signal_data:
            return False
        
        attempt_count = signal_data['metadata'].get('attempt_count', 0)
        if attempt_count >= cls.MAX_RETRIES:
            return cls.update_signal_status(signal_id, SignalStatus.FAILED, error_message)
        
        return cls.update_signal_status(signal_id, SignalStatus.RETRYING, error_message)
    
    @classmethod
    def get_pending_signals(cls, signal_type: Optional[SignalType] = None) -> List[Dict]:
        """Get all pending or retrying signals"""
        pending = []
        
        # Get all signal types if not specified
        signal_types = [signal_type] if signal_type else list(SignalType)
        
        for st in signal_types:
            signal_list_key = f"{cls.CACHE_PREFIX}list:{st.value}"
            
            try:
                # Get all signal IDs for this type
                signal_ids = cls._get_signal_ids(signal_list_key)
                for signal_id in signal_ids:
                    signal_data = cls.get_signal(signal_id)
                    if signal_data:
                        status = signal_data['metadata'].get('status')
                        if status in [SignalStatus.PENDING.value, SignalStatus.RETRYING.value]:
                            pending.append(signal_data)
            except Exception as e:
                logger.error(f"Error getting pending signals for {st.value}: {e}", exc_info=True)
        
        # Sort by creation time (oldest first)
        pending.sort(key=lambda x: x['metadata']['created_at'])
        return pending
    
    @classmethod
    def get_signal_stats(cls) -> Dict[str, Any]:
        """Get comprehensive signal statistics"""
        stats = {
            'total_by_type': {},
            'by_status': {},
            'today': 0,
            'failed_recently': 0,
            'oldest_pending': None,
            'newest_signal': None
        }
        
        try:
            cutoff_time = time.time() - 86400  # 24 hours
            
            for signal_type in SignalType:
                signal_list_key = f"{cls.CACHE_PREFIX}list:{signal_type.value}"
                signal_ids = cls._get_signal_ids(signal_list_key)
                stats['total_by_type'][signal_type.value] = len(signal_ids)
                
                # Analyze each signal
                for signal_id in signal_ids:
                    signal_data = cls.get_signal(signal_id)
                    if signal_data:
                        metadata = signal_data['metadata']
                        
                        # Count by status
                        status = metadata.get('status', 'unknown')
                        stats['by_status'][status] = stats['by_status'].get(status, 0) + 1
                        
                        # Count today's signals
                        created_time = metadata.get('created_at', 0)
                        if time.time() - created_time < 86400:  # 24 hours
                            stats['today'] += 1
                        
                        # Track failed signals from last hour
                        if status == SignalStatus.FAILED.value and time.time() - created_time < 3600:
                            stats['failed_recently'] += 1
                        
                        # Track oldest pending
                        if status in [SignalStatus.PENDING.value, SignalStatus.RETRYING.value]:
                            if not stats['oldest_pending'] or created_time < stats['oldest_pending']:
                                stats['oldest_pending'] = created_time
                        
                        # Track newest signal
                        if not stats['newest_signal'] or created_time > stats['newest_signal']:
                            stats['newest_signal'] = created_time
            
            # Convert timestamps to readable format
            if stats['oldest_pending']:
                stats['oldest_pending_human'] = datetime.fromtimestamp(
                    stats['oldest_pending']
                ).isoformat()
            if stats['newest_signal']:
                stats['newest_signal_human'] = datetime.fromtimestamp(
                    stats['newest_signal']
                ).isoformat()
                
        except Exception as e:
            logger.error(f"Error getting signal stats: {e}", exc_info=True)
        
        return stats
    
    @classmethod
    def get_recent_errors(cls, timeframe_hours: int = 24) -> List[Dict]:
        """Get recent signal errors"""
        errors = []
        cutoff_time = time.time() - (timeframe_hours * 3600)
        
        try:
            for signal_type in SignalType:
                signal_list_key = f"{cls.CACHE_PREFIX}list:{signal_type.value}"
                signal_ids = cls._get_signal_ids(signal_list_key)
                
                for signal_id in signal_ids:
                    signal_data = cls.get_signal(signal_id)
                    if signal_data:
                        metadata = signal_data['metadata']
                        created_at = metadata.get('created_at', 0)
                        
                        if (created_at > cutoff_time and 
                            metadata.get('status') == SignalStatus.FAILED.value and
                            metadata.get('error_message')):
                            errors.append({
                                'signal_id': signal_id,
                                'type': signal_type.value,
                                'error': metadata.get('error_message'),
                                'timestamp': created_at,
                                'user': signal_data['data'].get('username', 'unknown')
                            })
        
        except Exception as e:
            logger.error(f"Error getting recent errors: {e}", exc_info=True)
        
        # Sort by timestamp (newest first)
        errors.sort(key=lambda x: x['timestamp'], reverse=True)
        return errors[:50]  # Return top 50 errors
    
    @classmethod
    def cleanup_old_signals(cls, older_than_days: int = 7) -> int:
        """Clean up signals older than specified days"""
        cutoff_time = time.time() - (older_than_days * 86400)
        deleted_count = 0
        
        try:
            for signal_type in SignalType:
                signal_list_key = f"{cls.CACHE_PREFIX}list:{signal_type.value}"
                signal_ids = cls._get_signal_ids(signal_list_key)
                
                for signal_id in signal_ids:
                    signal_data = cls.get_signal(signal_id)
                    
                    if signal_data:
                        created_at = signal_data['metadata'].get('created_at', 0)
                        if created_at < cutoff_time:
                            # Delete signal data
                            cache_key = cls._get_cache_key(signal_id)
                            cache.delete(cache_key)
                            
                            # Remove from list
                            cache.lrem(signal_list_key, 0, signal_id)
                            deleted_count += 1
            
            logger.info(f"Cleaned up {deleted_count} signals older than {older_than_days} days")
            
        except Exception as e:
            logger.error(f"Error cleaning up old signals: {e}", exc_info=True)
        
        return deleted_count

# ==================== SIGNAL UTILITIES ====================

def emit_signal_with_retry(
    signal: Signal,
    signal_type: SignalType,
    data: Dict[str, Any],
    sender: str = "authentication",
    max_retries: int = 3
) -> Dict[str, Any]:
    """
    Emit signal with automatic retry logic
    """
    result = {
        'success': False,
        'signal_id': None,
        'error': None,
        'attempts': 0
    }
    
    try:
        # Ensure data is JSON serializable
        def make_json_serializable(obj):
            if isinstance(obj, Enum):
                return obj.value
            if hasattr(obj, 'to_dict'):
                return obj.to_dict()
            if isinstance(obj, (datetime, timedelta)):
                return str(obj)
            return obj
        
        # Convert any non-serializable objects in data
        serializable_data = {}
        for key, value in data.items():
            if isinstance(value, dict):
                serializable_data[key] = {k: make_json_serializable(v) for k, v in value.items()}
            elif isinstance(value, (list, tuple)):
                serializable_data[key] = [make_json_serializable(item) for item in value]
            else:
                serializable_data[key] = make_json_serializable(value)
        
        # Store signal first
        signal_id = SignalCacheManager.store_signal(signal_type, serializable_data, sender)
        result['signal_id'] = signal_id
        
        # Prepare signal kwargs
        signal_kwargs = {
            'signal_id': signal_id,
            'signal_type': signal_type.value,  # Use value, not enum
            'sender': sender,
            'timestamp': time.time(),
            **serializable_data
        }
        
        # Attempt to send with retries
        for attempt in range(max_retries):
            result['attempts'] = attempt + 1
            
            try:
                signal.send(sender=sender, **signal_kwargs)
                SignalCacheManager.mark_as_delivered(signal_id)
                result['success'] = True
                logger.info(f"Signal {signal_type.value} delivered successfully on attempt {attempt + 1}")
                break
                
            except Exception as e:
                error_msg = f"Attempt {attempt + 1} failed: {str(e)}"
                logger.warning(f"Signal delivery failed: {error_msg}")
                
                if attempt < max_retries - 1:
                    # Mark for retry
                    SignalCacheManager.mark_for_retry(signal_id, error_msg)
                    # Wait before retry (exponential backoff)
                    time.sleep(2 ** attempt)
                else:
                    # Final failure
                    SignalCacheManager.update_signal_status(
                        signal_id,
                        SignalStatus.FAILED,
                        f"All {max_retries} attempts failed. Last error: {str(e)}"
                    )
                    result['error'] = str(e)
        
    except Exception as e:
        logger.error(f"Failed to emit signal {signal_type.value}: {e}", exc_info=True)
        result['error'] = str(e)
    
    return result

def get_signal_history(
    user_id: Optional[str] = None,
    signal_type: Optional[SignalType] = None,
    limit: int = 100,
    offset: int = 0
) -> List[Dict[str, Any]]:
    """
    Get signal history with filtering
    """
    history = []
    
    try:
        # Determine which signal types to check
        signal_types = [signal_type] if signal_type else list(SignalType)
        
        for st in signal_types:
            signal_list_key = f"{SignalCacheManager.CACHE_PREFIX}list:{st.value}"
            
            # Get signal IDs with proper slicing
            try:
                signal_ids_raw = cache.lrange(signal_list_key, offset, offset + limit - 1)
                signal_ids = [sid.decode() if isinstance(sid, bytes) else sid for sid in signal_ids_raw]
                
                for signal_id in signal_ids:
                    signal_data = SignalCacheManager.get_signal(signal_id)
                    
                    if signal_data:
                        # Filter by user_id if provided
                        if user_id and signal_data['data'].get('user_id') != user_id:
                            continue
                        
                        history.append({
                            'id': signal_id,
                            'type': signal_data.get('type', st.value),
                            'metadata': signal_data['metadata'],
                            'data': signal_data['data']
                        })
            except Exception as e:
                logger.error(f"Error getting signal IDs for {st.value}: {e}", exc_info=True)
        
        # Sort by creation time (newest first)
        history.sort(key=lambda x: x['metadata']['created_at'], reverse=True)
        
    except Exception as e:
        logger.error(f"Error getting signal history: {e}", exc_info=True)
    
    return history[:limit]

def health_check_signals() -> Dict[str, Any]:
    """
    Perform health check on signal system
    """
    health = {
        'status': 'healthy',
        'timestamp': time.time(),
        'checks': {},
        'stats': {}
    }
    
    try:
        # Check Redis connectivity
        test_key = f"{SignalCacheManager.CACHE_PREFIX}health_check"
        cache.set(test_key, 'test', 10)
        cache_value = cache.get(test_key)
        
        health['checks']['redis'] = {
            'connected': cache_value == b'test' or cache_value == 'test',
            'response_time': 'N/A'  # Would need timing measurement
        }
        
        # Get signal stats
        stats = SignalCacheManager.get_signal_stats()
        health['stats'] = stats
        
        # Check for excessive pending signals
        pending_signals = SignalCacheManager.get_pending_signals()
        if len(pending_signals) > 100:
            health['checks']['pending_signals'] = {
                'status': 'warning',
                'message': f'High number of pending signals: {len(pending_signals)}'
            }
        else:
            health['checks']['pending_signals'] = {
                'status': 'ok',
                'count': len(pending_signals)
            }
        
        # Check for failed signals
        if stats.get('failed_recently', 0) > 10:
            health['checks']['failed_signals'] = {
                'status': 'critical',
                'message': f'High number of recent failed signals: {stats["failed_recently"]}'
            }
            health['status'] = 'degraded'
        
    except Exception as e:
        health['status'] = 'unhealthy'
        health['checks']['redis'] = {
            'connected': False,
            'error': str(e)
        }
    
    return health

def resend_failed_signals(signal_type: Optional[SignalType] = None) -> Dict[str, Any]:
    """
    Resend failed or pending signals
    """
    result = {
        'resent': 0,
        'still_failed': 0,
        'errors': [],
        'start_time': time.time()
    }
    
    try:
        # Get pending signals
        pending_signals = SignalCacheManager.get_pending_signals(signal_type)
        
        for signal_data in pending_signals:
            signal_id = signal_data['metadata']['signal_id']
            signal_type_str = signal_data['type']
            original_data = signal_data['data']
            
            try:
                # Prepare signal based on type
                if signal_type_str == SignalType.PPPOE_CREDENTIALS_GENERATED.value:
                    signal_obj = pppoe_credentials_generated
                    
                elif signal_type_str == SignalType.CLIENT_ACCOUNT_CREATED.value:
                    signal_obj = client_account_created
                    
                elif signal_type_str == SignalType.ACCOUNT_STATUS_CHANGED.value:
                    signal_obj = account_status_changed
                    
                else:
                    # Skip other types
                    continue
                
                # Prepare signal kwargs
                signal_kwargs = {
                    'signal_id': signal_id,
                    'signal_type': signal_type_str,
                    'sender': 'authentication.resend',
                    'timestamp': time.time(),
                    **original_data
                }
                
                # Resend signal
                signal_obj.send(sender='authentication.resend', **signal_kwargs)
                SignalCacheManager.mark_as_delivered(signal_id)
                result['resent'] += 1
                logger.info(f"Resent signal {signal_id} successfully")
                
            except Exception as e:
                result['still_failed'] += 1
                result['errors'].append({
                    'signal_id': signal_id,
                    'error': str(e)
                })
                logger.error(f"Error resending signal {signal_id}: {e}", exc_info=True)
        
        result['end_time'] = time.time()
        result['duration'] = result['end_time'] - result['start_time']
        
        logger.info(
            f"✅ Resend operation completed: "
            f"resent={result['resent']}, "
            f"still_failed={result['still_failed']}, "
            f"duration={result['duration']:.2f}s"
        )
        
    except Exception as e:
        result['error'] = str(e)
        logger.error(f"❌ Resend operation failed: {e}", exc_info=True)
    
    return result

def test_signal_connection() -> List[Dict[str, Any]]:
    """
    Test if signals are properly connected
    """
    test_signals = [
        {
            'type': SignalType.PPPOE_CREDENTIALS_GENERATED,
            'data': {
                'user_id': str(uuid.uuid4()),
                'username': 'test_user_001',
                'pppoe_username': 'test_pppoe_001',
                'password': 'TestPass123!@#',
                'phone_number': '+254711111111',
                'client_name': 'Test Client 001',
                'connection_type': 'pppoe'
            }
        },
        {
            'type': SignalType.CLIENT_ACCOUNT_CREATED,
            'data': {
                'user_id': str(uuid.uuid4()),
                'username': 'test_user_002',
                'phone_number': '+254722222222',
                'connection_type': 'hotspot',
                'client_name': 'Test Client 002',
                'created_by_admin': True
            }
        },
        {
            'type': SignalType.ACCOUNT_STATUS_CHANGED,
            'data': {
                'user_id': str(uuid.uuid4()),
                'username': 'test_user_003',
                'is_active': False,
                'reason': 'Test deactivation',
                'changed_by_admin': True
            }
        }
    ]
    
    results = []
    for test in test_signals:
        try:
            result = emit_signal_with_retry(
                signal=globals()[test['type'].value],
                signal_type=test['type'],
                data=test['data'],
                sender='authentication.test'
            )
            
            results.append({
                'signal': test['type'].value,
                'status': 'connected' if result['success'] else 'failed',
                'signal_id': result['signal_id'],
                'error': result['error'],
                'timestamp': time.time()
            })
            
        except Exception as e:
            results.append({
                'signal': test['type'].value,
                'status': 'error',
                'error': str(e),
                'timestamp': time.time()
            })
    
    return results

# ==================== SIGNAL REGISTRATION ====================

def register_signal_handlers():
    """
    Register signal handlers from receivers module
    """
    try:
        from .receivers import register_model_receivers
        
        # Register model receivers
        register_model_receivers()
        
        logger.info("✅ Authentication signal handlers registered successfully")
        return True
        
    except Exception as e:
        logger.error(f"❌ Failed to register signal handlers: {e}", exc_info=True)
        return False

# ==================== EXPORT ALL FUNCTIONS ====================

__all__ = [
    # Enums and Data Classes
    'SignalType',
    'SignalStatus',
    'SignalMetadata',
    'PPPoECredentialsSignal',
    'ClientAccountSignal',
    'AccountStatusSignal',
    
    # Signal Definitions
    'pppoe_credentials_generated',
    'client_account_created',
    'pppoe_credentials_updated',
    'account_status_changed',
    'authentication_failed',
    'send_notification',
    
    # Cache Manager
    'SignalCacheManager',
    
    # Utility Functions
    'emit_signal_with_retry',
    'get_signal_history',
    'health_check_signals',
    'resend_failed_signals',
    'test_signal_connection',
    
    # Registration
    'register_signal_handlers'
]