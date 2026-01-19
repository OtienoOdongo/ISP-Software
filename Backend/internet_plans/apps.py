






# """
# Internet Plans - Django App Configuration
# FIXED: Added signal registration in ready() method
# """

# from django.apps import AppConfig
# import logging

# logger = logging.getLogger(__name__)


# class InternetPlansConfig(AppConfig):
#     """
#     Django App Configuration for Internet Plans
#     """
    
#     default_auto_field = 'django.db.models.BigAutoField'
#     name = 'internet_plans'
#     verbose_name = 'Internet Plans'
    
#     def ready(self):
#         """
#         App initialization - called when Django starts
#         """
#         try:
#             # Import here to avoid circular imports
#             from internet_plans.signals.plan_signals import setup_signal_receivers
            
#             # Setup signal receivers
#             setup_signal_receivers()
            
#             # Warm up caches if needed
#             self.warmup_caches()
            
#             logger.info("Internet Plans app initialized successfully")
            
#         except Exception as e:
#             logger.error(f"Failed to initialize Internet Plans app: {e}")
    
#     def warmup_caches(self):
#         """
#         Warm up application caches on startup
#         """
#         try:
#             from internet_plans.services.plan_service import PlanService
            
#             # Warm up plan caches
#             PlanService.warmup_caches()
            
#             logger.info("Internet Plans caches warmed up")
            
#         except Exception as e:
#             logger.warning(f"Could not warm up caches: {e}")








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
            
            logger.info("Internet Plans signal receivers set up successfully")
            
        except Exception as e:
            logger.error(f"Failed to setup signal receivers: {e}")
            # Don't fail completely, just log the error
    
    def warmup_caches(self):
        """
        Warm up application caches on startup
        Only called when explicitly needed, not during app initialization
        """
        try:
            from internet_plans.services.plan_service import PlanService
            
            # Check if tables exist before warming up caches
            try:
                # Try a simple query to check if table exists
                from internet_plans.models.time_variant_config import TimeVariantConfig
                # Just check if we can access the model
                # This will fail if table doesn't exist
                if TimeVariantConfig.objects.exists():
                    pass  # Table exists, we can proceed
            except Exception as table_error:
                logger.warning(f"Database tables not ready for cache warming: {table_error}")
                return
            
            # Warm up plan caches
            PlanService.warmup_caches()
            
            logger.info("Internet Plans caches warmed up")
            
        except Exception as e:
            logger.warning(f"Could not warm up caches: {e}")
            # Non-critical error, just log it

    def warmup_caches_safe(self):
        """
        Safe version of warmup_caches that catches all exceptions
        """
        try:
            self.warmup_caches()
        except Exception as e:
            logger.debug(f"Cache warming skipped (non-critical): {e}")