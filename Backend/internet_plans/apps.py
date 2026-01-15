







# """
# Internet Plans App Configuration
# Production-ready with comprehensive initialization
# """
# from django.apps import AppConfig
# import logging

# logger = logging.getLogger(__name__)


# class InternetPlansConfig(AppConfig):
#     """Internet Plans App Configuration"""
    
#     default_auto_field = 'django.db.models.BigAutoField'
#     name = 'internet_plans'
#     verbose_name = 'Internet Plans'
    
#     def ready(self):
#         """
#         Initialize app when ready
#         This method is called when Django starts
#         """
#         try:
#             logger.info("Initializing Internet Plans app...")
            
#             # Import models to ensure they're registered
#             from internet_plans.models.plan_models import PlanTemplate, InternetPlan
#             from internet_plans.models.pricing_models import PriceMatrix, DiscountRule
            
#             # Setup signal receivers
#             self._setup_signals()
            
#             # Initialize services
#             self._initialize_services()
            
#             logger.info("Internet Plans app initialized successfully")
            
#         except Exception as e:
#             logger.error(f"Error initializing Internet Plans app: {e}", exc_info=True)
    
#     def _setup_signals(self):
#         """Setup signal receivers"""
#         try:
#             from internet_plans.signals.plan_signals import setup_signal_receivers
#             setup_signal_receivers()
#             logger.info("Signal receivers set up successfully")
#         except Exception as e:
#             logger.warning(f"Could not setup signal receivers: {e}")
    
#     def _initialize_services(self):
#         """Initialize service layer"""
#         try:
#             from internet_plans.services.plan_service import PlanService
#             from internet_plans.services.pricing_service import PricingService
            
#             # Warm up caches
#             PlanService.warmup_caches()
            
#             logger.info("Services initialized successfully")
#         except Exception as e:
#             logger.warning(f"Could not initialize services: {e}")
    
#     def get_app_info(self):
#         """Get comprehensive app information"""
#         return {
#             'name': self.verbose_name,
#             'version': '1.0.0',
#             'modules': {
#                 'plan_management': {
#                     'description': 'Plan templates and internet plans management',
#                     'models': ['PlanTemplate', 'InternetPlan']
#                 },
#                 'pricing_management': {
#                     'description': 'Advanced pricing and discount management',
#                     'models': ['PriceMatrix', 'DiscountRule']
#                 }
#             },
#             'features': [
#                 'Plan template system',
#                 'Flexible plan configurations',
#                 'Advanced pricing models',
#                 'JSON-based configuration',
#                 'Caching for performance',
#                 'Signal-based architecture'
#             ]
#         }






"""
Internet Plans - Django App Configuration
FIXED: Added signal registration in ready() method
"""

from django.apps import AppConfig
import logging

logger = logging.getLogger(__name__)


class InternetPlansConfig(AppConfig):
    """
    Django App Configuration for Internet Plans
    """
    
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'internet_plans'
    verbose_name = 'Internet Plans'
    
    def ready(self):
        """
        App initialization - called when Django starts
        """
        try:
            # Import here to avoid circular imports
            from internet_plans.signals.plan_signals import setup_signal_receivers
            
            # Setup signal receivers
            setup_signal_receivers()
            
            # Warm up caches if needed
            self.warmup_caches()
            
            logger.info("Internet Plans app initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize Internet Plans app: {e}")
    
    def warmup_caches(self):
        """
        Warm up application caches on startup
        """
        try:
            from internet_plans.services.plan_service import PlanService
            
            # Warm up plan caches
            PlanService.warmup_caches()
            
            logger.info("Internet Plans caches warmed up")
            
        except Exception as e:
            logger.warning(f"Could not warm up caches: {e}")