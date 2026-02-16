






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
            
#             logger.info("Internet Plans signal receivers set up successfully")
            
#         except Exception as e:
#             logger.error(f"Failed to setup signal receivers: {e}")
#             # Don't fail completely, just log the error
    
#     def warmup_caches(self):
#         """
#         Warm up application caches on startup
#         Only called when explicitly needed, not during app initialization
#         """
#         try:
#             from internet_plans.services.plan_service import PlanService
            
#             # Check if tables exist before warming up caches
#             try:
#                 # Try a simple query to check if table exists
#                 from internet_plans.models.time_variant_config import TimeVariantConfig
#                 # Just check if we can access the model
#                 # This will fail if table doesn't exist
#                 if TimeVariantConfig.objects.exists():
#                     pass  # Table exists, we can proceed
#             except Exception as table_error:
#                 logger.warning(f"Database tables not ready for cache warming: {table_error}")
#                 return
            
#             # Warm up plan caches
#             PlanService.warmup_caches()
            
#             logger.info("Internet Plans caches warmed up")
            
#         except Exception as e:
#             logger.warning(f"Could not warm up caches: {e}")
#             # Non-critical error, just log it

#     def warmup_caches_safe(self):
#         """
#         Safe version of warmup_caches that catches all exceptions
#         """
#         try:
#             self.warmup_caches()
#         except Exception as e:
#             logger.debug(f"Cache warming skipped (non-critical): {e}")







# """
# Internet Plans - Django App Configuration
# UPDATED: Fixed signal import issue and added proper initialization
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
#             # Skip initialization during database migrations
#             import sys
#             if 'makemigrations' in sys.argv or 'migrate' in sys.argv:
#                 logger.debug("Skipping Internet Plans initialization during migrations")
#                 return
            
#             # Import here to avoid circular imports
#             from internet_plans.signals.plan_signals import setup_plan_signals
            
#             # Setup Django signal receivers (post_save, etc.)
#             setup_plan_signals()
            
#             logger.info("Internet Plans signal receivers set up successfully")
            
#             # Warm up caches in background
#             self.warmup_caches_safe()
            
#         except ImportError as e:
#             # This happens during initial migrations when tables don't exist yet
#             logger.debug(f"Models not ready during app initialization: {e}")
#         except Exception as e:
#             logger.error(f"Failed to initialize Internet Plans app: {e}", exc_info=True)
#             # Don't fail completely, just log the error
    
#     def warmup_caches(self):
#         """
#         Warm up application caches on startup
#         """
#         try:
#             from internet_plans.services.plan_service import PlanService
            
#             # Check if tables exist before warming up caches
#             try:
#                 # Try to import models to check if tables exist
#                 from internet_plans.models.plan_models import InternetPlan
                
#                 # Quick check if we can query (tables exist)
#                 # Use exists() to avoid loading all data
#                 InternetPlan.objects.exists()
                    
#             except Exception as table_error:
#                 logger.debug(f"Database tables not ready for cache warming: {table_error}")
#                 return
            
#             # Warm up plan caches
#             PlanService.warmup_caches()
            
#             logger.info("Internet Plans caches warmed up successfully")
            
#         except Exception as e:
#             logger.warning(f"Could not warm up caches: {e}")
#             # Non-critical error, just log it

#     def warmup_caches_safe(self):
#         """
#         Safe version of warmup_caches that catches all exceptions
#         Use this when you want to ensure the app doesn't crash on cache warming
#         """
#         try:
#             self.warmup_caches()
#         except Exception as e:
#             logger.debug(f"Cache warming skipped (non-critical): {e}")







"""
Internet Plans - Django App Configuration
Fixed version with proper initialization
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
        # Skip initialization during database migrations, tests, and other commands
        if self.should_skip_initialization():
            logger.debug("Skipping Internet Plans initialization")
            return
        
        try:
            # Import signal setup inside try block to avoid circular imports
            from internet_plans.signals.plan_signals import setup_plan_signals
            
            # Setup Django signal receivers (post_save, etc.)
            setup_plan_signals()
            
            logger.info("Internet Plans signal receivers set up successfully")
            
            # Warm up caches in background - use safe version
            self.warmup_caches_safe()
            
        except ImportError as e:
            # This can happen during initial setup when modules aren't ready yet
            logger.debug(f"Modules not ready during app initialization: {e}")
        except Exception as e:
            logger.error(f"Failed to initialize Internet Plans app: {e}", exc_info=True)
            # Don't crash the app on initialization errors
    
    def should_skip_initialization(self):
        """
        Determine if we should skip app initialization
        Returns True for migrations, tests, and other management commands
        """
        import sys
        
        # Commands that don't need signal setup
        skip_commands = [
            'makemigrations',
            'migrate',
            'sqlmigrate',
            'showmigrations',
            'test',
            'collectstatic',
            'createsuperuser',
            'flush',
            'shell',
        ]
        
        # Check if any command in skip_commands is in sys.argv
        for cmd in sys.argv:
            if cmd in skip_commands:
                return True
        
        return False
    
    def warmup_caches(self):
        """
        Warm up application caches on startup
        Only called when app is fully initialized
        """
        try:
            from django.apps import apps
            
            # Check if model is in app registry (models are ready)
            try:
                apps.get_model('internet_plans', 'InternetPlan')
            except LookupError:
                logger.debug("InternetPlan model not in app registry yet")
                return
            
            # Now it's safe to import
            from internet_plans.services.plan_service import PlanService
            from internet_plans.models.plan_models import InternetPlan
            
            # Optional: Check if we have data before warming caches
            # This prevents unnecessary cache warming on fresh installs
            try:
                if InternetPlan.objects.count() == 0:
                    logger.debug("No plans in database, skipping cache warmup")
                    return
            except Exception as db_error:
                # Table might not exist yet
                logger.debug(f"Database not ready for cache warming: {db_error}")
                return
            
            # Warm up plan caches
            PlanService.warmup_caches()
            
            logger.info("Internet Plans caches warmed up successfully")
            
        except Exception as e:
            logger.debug(f"Cache warming skipped: {e}")
            # Non-critical error, just log it
    
    def warmup_caches_safe(self):
        """
        Safe version of warmup_caches that catches all exceptions
        Use this when you want to ensure the app doesn't crash on cache warming
        """
        try:
            self.warmup_caches()
        except Exception as e:
            logger.debug(f"Cache warming failed (non-critical): {e}")