"""
Authentication Signals Module
Initializes and exports all signal-related functionality
"""

# Core signal definitions and utilities
from .core import (
    # Enums and Data Classes
    SignalType,
    SignalStatus,
    SignalMetadata,
    PPPoECredentialsSignal,
    ClientAccountSignal,
    AccountStatusSignal,
    
    # Signal Definitions
    pppoe_credentials_generated,
    client_account_created,
    pppoe_credentials_updated,
    account_status_changed,
    authentication_failed,
    send_notification,
    
    # Cache Manager
    SignalCacheManager,
    
    # Utility Functions
    emit_signal_with_retry,
    get_signal_history,
    health_check_signals,
    resend_failed_signals,
    test_signal_connection,
)

# Signal emitters
from .emitters import (
    emit_pppoe_credentials,
    emit_client_account_creation,
    emit_account_status_change,
    emit_pppoe_credentials_update,
    emit_authentication_failure,
    emit_custom_notification,
    emit_batch_account_creations,
    emit_bulk_pppoe_credentials,
    get_emission_stats
)

# Validators
from .validators import (
    validate_signal_data,
    validate_batch_signal_data,
    sanitize_signal_data,
    get_validation_summary,
    ValidationLevel
)

# Export everything for easy import
__all__ = [
    # Core
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
    
    # Emitters
    'emit_pppoe_credentials',
    'emit_client_account_creation',
    'emit_account_status_change',
    'emit_pppoe_credentials_update',
    'emit_authentication_failure',
    'emit_custom_notification',
    'emit_batch_account_creations',
    'emit_bulk_pppoe_credentials',
    'get_emission_stats',
    
    # Validators
    'validate_signal_data',
    'validate_batch_signal_data',
    'sanitize_signal_data',
    'get_validation_summary',
    'ValidationLevel'
]