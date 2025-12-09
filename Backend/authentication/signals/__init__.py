"""
Authentication Signals Package
Exports all signal-related functionality
"""

from .core import (
    # Signal definitions
    pppoe_credentials_generated,
    client_account_created,
    pppoe_credentials_updated,
    account_status_changed,
    authentication_failed,
    send_notification,
    
    # Core utilities
    SignalCacheManager,
    get_signal_history,
    resend_failed_signals,
    test_signal_connection,
    register_signals,
)

from .emitters import (
    # Emitter functions
    emit_pppoe_credentials_generated,
    emit_client_account_created,
    emit_pppoe_credentials_updated,
    emit_account_status_changed,
    emit_authentication_failed,
    emit_custom_notification,
)

from .validators import (
    # Validation functions
    validate_signal_data,
)

from .test_utils import (
    # Testing utilities
    mock_signal_receiver,
    capture_signals,
    SignalTestSuite,
    generate_test_pppoe_credentials_signal,
    generate_test_client_creation_signal,
)

# Auto-import receivers when signals module is imported
# This ensures receivers are connected when Django loads
try:
    from . import receivers
    receivers_loaded = True
except ImportError as e:
    import logging
    logger = logging.getLogger(__name__)
    logger.warning(f"Could not load signal receivers: {e}")
    receivers_loaded = False

__all__ = [
    # Signals
    'pppoe_credentials_generated',
    'client_account_created',
    'pppoe_credentials_updated',
    'account_status_changed',
    'authentication_failed',
    'send_notification',
    
    # Emitters
    'emit_pppoe_credentials_generated',
    'emit_client_account_created',
    'emit_pppoe_credentials_updated',
    'emit_account_status_changed',
    'emit_authentication_failed',
    'emit_custom_notification',
    
    # Utilities
    'SignalCacheManager',
    'get_signal_history',
    'resend_failed_signals',
    'test_signal_connection',
    'register_signals',
    'validate_signal_data',
    
    # Testing
    'mock_signal_receiver',
    'capture_signals',
    'SignalTestSuite',
    'generate_test_pppoe_credentials_signal',
    'generate_test_client_creation_signal',
]