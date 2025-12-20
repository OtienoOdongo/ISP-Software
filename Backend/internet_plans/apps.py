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






# """
# Internet Plans - App Configuration
# """

# from django.apps import AppConfig


# class InternetPlansConfig(AppConfig):
#     """Internet Plans App Configuration"""
    
#     default_auto_field = 'django.db.models.BigAutoField'
#     name = 'internet_plans'
#     verbose_name = 'Internet Plans'
    
#     def ready(self):
#         """App is ready - initialize signals and services"""
#         try:
#             # Import signals to set up receivers
#             from .signals import plan_signals
#             plan_signals.setup_auth_signal_receivers()
            
#             # Initialize services
#             from internet_plans.services.integration_service import IntegrationService
#             from internet_plans.services.activation_service import ActivationService
            
#             # Log app initialization
#             import logging
#             logger = logging.getLogger(__name__)
#             logger.info("Internet Plans app initialized successfully")
            
#         except Exception as e:
#             import logging
#             logger = logging.getLogger(__name__)
#             logger.error(f"Failed to initialize Internet Plans app: {e}")












"""
Internet Plans App Configuration
Production-ready with comprehensive initialization
"""
from django.apps import AppConfig
import logging

logger = logging.getLogger(__name__)


class InternetPlansConfig(AppConfig):
    """Internet Plans App Configuration"""
    
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'internet_plans'
    verbose_name = 'Internet Plans'
    
    def ready(self):
        """
        Initialize app when ready
        This method is called when Django starts
        """
        try:
            logger.info("Initializing Internet Plans app...")
            
            # Import models to ensure they're registered
            from internet_plans.models.plan_models import PlanTemplate, InternetPlan
            from internet_plans.models.pricing_models import PriceMatrix, DiscountRule
            
            # Setup signal receivers
            self._setup_signals()
            
            # Initialize services
            self._initialize_services()
            
            logger.info("Internet Plans app initialized successfully")
            
        except Exception as e:
            logger.error(f"Error initializing Internet Plans app: {e}", exc_info=True)
    
    def _setup_signals(self):
        """Setup signal receivers"""
        try:
            from internet_plans.signals.plan_signals import setup_signal_receivers
            setup_signal_receivers()
            logger.info("Signal receivers set up successfully")
        except Exception as e:
            logger.warning(f"Could not setup signal receivers: {e}")
    
    def _initialize_services(self):
        """Initialize service layer"""
        try:
            from internet_plans.services.plan_service import PlanService
            from internet_plans.services.pricing_service import PricingService
            
            # Warm up caches
            PlanService.warmup_caches()
            
            logger.info("Services initialized successfully")
        except Exception as e:
            logger.warning(f"Could not initialize services: {e}")
    
    def get_app_info(self):
        """Get comprehensive app information"""
        return {
            'name': self.verbose_name,
            'version': '1.0.0',
            'modules': {
                'plan_management': {
                    'description': 'Plan templates and internet plans management',
                    'models': ['PlanTemplate', 'InternetPlan']
                },
                'pricing_management': {
                    'description': 'Advanced pricing and discount management',
                    'models': ['PriceMatrix', 'DiscountRule']
                }
            },
            'features': [
                'Plan template system',
                'Flexible plan configurations',
                'Advanced pricing models',
                'JSON-based configuration',
                'Caching for performance',
                'Signal-based architecture'
            ]
        }