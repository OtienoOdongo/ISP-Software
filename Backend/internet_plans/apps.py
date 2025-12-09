# # from django.apps import AppConfig


# # class InternetPlansConfig(AppConfig):
# #     default_auto_field = 'django.db.models.BigAutoField'
# #     name = 'internet_plans'



# from django.apps import AppConfig

# class InternetPlansConfig(AppConfig):
#     default_auto_field = 'django.db.models.BigAutoField'
#     name = 'internet_plans'
    
#     def ready(self):
#         import internet_plans.signals






"""
Internet Plans - App Configuration
"""

from django.apps import AppConfig


class InternetPlansConfig(AppConfig):
    """Internet Plans App Configuration"""
    
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'internet_plans'
    verbose_name = 'Internet Plans'
    
    def ready(self):
        """App is ready - initialize signals and services"""
        try:
            # Import signals to set up receivers
            from .signals import plan_signals
            plan_signals.setup_auth_signal_receivers()
            
            # Initialize services
            from internet_plans.services.integration_service import IntegrationService
            from internet_plans.services.activation_service import ActivationService
            
            # Log app initialization
            import logging
            logger = logging.getLogger(__name__)
            logger.info("Internet Plans app initialized successfully")
            
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Failed to initialize Internet Plans app: {e}")