# from django.apps import AppConfig


# class AuthenticationConfig(AppConfig):
#     default_auto_field = 'django.db.models.BigAutoField'
#     name = 'authentication'







# """
# Authentication App Configuration
# Registers signals when app is ready
# """

# from django.apps import AppConfig
# import logging

# logger = logging.getLogger(__name__)

# class AuthenticationConfig(AppConfig):
#     default_auto_field = 'django.db.models.BigAutoField'
#     name = 'authentication'
    
#     def ready(self):
#         """
#         Called when Django starts
#         Register all signal handlers
#         """
#         # Import signals module to register receivers
#         try:
#             from .signals import register_signals
#             from .signals.receivers import register_model_receivers
            
#             register_signals()
#             register_model_receivers()
            
#             logger.info("Authentication app ready - signals registered")
            
#             # Test signal connectivity (optional - for debugging)
#             if logger.isEnabledFor(logging.DEBUG):
#                 from .signals.core import test_signal_connection
#                 test_results = test_signal_connection()
#                 logger.debug(f"Signal connectivity test: {test_results}")
                
#         except Exception as e:
#             logger.error(f"Failed to initialize authentication signals: {e}")
#             raise





"""
Authentication App Configuration
"""

from django.apps import AppConfig
import logging

logger = logging.getLogger(__name__)

class AuthenticationConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'authentication'
    
    def ready(self):
        """
        Initialize signals when Django starts
        """
        # Don't run if already initialized
        if hasattr(self, '_initialized') and self._initialized:
            return
        
        try:
            # Import and initialize signals
            from .signals.utils import connect_model_signals
            
            # Connect model signals (models should be loaded now)
            connected = connect_model_signals()
            
            if connected:
                logger.info("✅ Authentication signals initialized successfully")
            else:
                # Try again after a short delay
                import threading
                import time
                
                def delayed_connection():
                    time.sleep(1)  # Wait 1 second
                    retry_connected = connect_model_signals()
                    if retry_connected:
                        logger.info("✅ Authentication signals connected on retry")
                    else:
                        logger.warning("⚠️ Authentication signals could not be connected")
                
                # Start delayed connection in background
                thread = threading.Thread(target=delayed_connection, daemon=True)
                thread.start()
            
            # Mark as initialized
            self._initialized = True
            
        except ImportError as e:
            logger.error(f"❌ Could not import signal utilities: {e}")
        except Exception as e:
            logger.error(f"❌ Error initializing authentication app: {e}")