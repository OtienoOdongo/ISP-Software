# from django.apps import AppConfig


# class AuthenticationConfig(AppConfig):
#     default_auto_field = 'django.db.models.BigAutoField'
#     name = 'authentication'







"""
Authentication App Configuration
Registers signals when app is ready
"""

from django.apps import AppConfig
import logging

logger = logging.getLogger(__name__)

class AuthenticationConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'authentication'
    
    def ready(self):
        """
        Called when Django starts
        Register all signal handlers
        """
        # Import signals module to register receivers
        try:
            from .signals import register_signals
            from .signals.receivers import register_model_receivers
            
            register_signals()
            register_model_receivers()
            
            logger.info("Authentication app ready - signals registered")
            
            # Test signal connectivity (optional - for debugging)
            if logger.isEnabledFor(logging.DEBUG):
                from .signals.core import test_signal_connection
                test_results = test_signal_connection()
                logger.debug(f"Signal connectivity test: {test_results}")
                
        except Exception as e:
            logger.error(f"Failed to initialize authentication signals: {e}")
            raise