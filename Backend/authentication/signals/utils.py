"""
Signal Registration Utilities
"""

import logging
from django.apps import apps

logger = logging.getLogger(__name__)

def connect_model_signals():
    """
    Connect model signals after models are loaded
    """
    try:
        # Try to get the UserAccount model
        UserAccount = apps.get_model('authentication', 'UserAccount')
        
        # Import the model signal handlers
        from .receivers import (
            handle_pppoe_credentials_signal,
            handle_client_account_signal,
            handle_account_status_signal
        )
        
        # Import the signals
        from .core import (
            pppoe_credentials_generated,
            client_account_created,
            account_status_changed
        )
        
        # Connect the signals
        pppoe_credentials_generated.connect(handle_pppoe_credentials_signal)
        client_account_created.connect(handle_client_account_signal)
        account_status_changed.connect(handle_account_status_signal)
        
        logger.info("✅ Model signals connected successfully")
        return True
        
    except LookupError:
        logger.warning("⚠️ UserAccount model not found. Signals will be connected when models are loaded.")
        return False
    except Exception as e:
        logger.error(f"❌ Error connecting model signals: {e}")
        return False