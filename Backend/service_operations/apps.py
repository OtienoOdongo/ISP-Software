




# """
# Service Operations App Configuration
# """

# from django.apps import AppConfig
# import logging

# logger = logging.getLogger(__name__)


# class ServiceOperationsConfig(AppConfig):
#     """Service Operations App Configuration"""
    
#     default_auto_field = 'django.db.models.BigAutoField'
#     name = 'service_operations'
#     verbose_name = 'Service Operations'
    
#     def ready(self):
#         """Initialize app when ready"""
#         try:
#             logger.info("Initializing Service Operations app...")
            
#             # Import models to ensure they're registered
#             from service_operations.models.subscription_models import Subscription
#             from service_operations.models.activation_queue_models import ActivationQueue
#             from service_operations.models.activation_queue_models import ActivationQueue
#             from service_operations.models.operation_log_models import OperationLog  
#             from service_operations.models.client_operation_models import ClientOperation
            
#             # Initialize queue service
#             from service_operations.services.queue_service import QueueService
#             QueueService.initialize()
            
#             # Setup signal receivers
#             self._setup_signals()
            
#             logger.info("Service Operations app initialized successfully")
            
#         except Exception as e:
#             logger.error(f"Error initializing Service Operations app: {e}", exc_info=True)
    
#     def _setup_signals(self):
#         """Setup signal receivers"""
#         try:
#             from service_operations.signals.operation_signals import setup_signal_receivers
#             setup_signal_receivers()
#             logger.info("Signal receivers set up successfully")
#         except Exception as e:
#             logger.warning(f"Could not setup signal receivers: {e}")




"""
Service Operations App Configuration
"""

from django.apps import AppConfig
import logging
from django.db import OperationalError, ProgrammingError

logger = logging.getLogger(__name__)


class ServiceOperationsConfig(AppConfig):
    """Service Operations App Configuration"""
    
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'service_operations'
    verbose_name = 'Service Operations'
    
    def ready(self):
        """Initialize app when ready"""
        try:
            logger.info("Initializing Service Operations app...")
            
            # Setup signal receivers (no database access)
            self._setup_signals()
            
            # Initialize queue service ONLY if tables exist
            self._initialize_services_safe()
            
            logger.info("Service Operations app initialized successfully")
            
        except Exception as e:
            logger.error(f"Error initializing Service Operations app: {e}", exc_info=True)
    
    def _setup_signals(self):
        """Setup signal receivers (no database access)"""
        try:
            from service_operations.signals.operation_signals import setup_signal_receivers
            setup_signal_receivers()
            logger.info("Signal receivers set up successfully")
        except Exception as e:
            logger.warning(f"Could not setup signal receivers: {e}")
    
    def _initialize_services_safe(self):
        """Initialize services safely, checking for table existence"""
        try:
            from service_operations.services.queue_service import QueueService
            
            # Check if ActivationQueue table exists
            try:
                from service_operations.models.activation_queue_models import ActivationQueue
                # Test if we can query the table
                # Use raw SQL to avoid model validation issues
                from django.db import connection
                with connection.cursor() as cursor:
                    cursor.execute("SELECT 1 FROM service_operations_activationqueue LIMIT 1")
                    # If we get here, table exists
                    QueueService.initialize()
                    logger.info("Queue service initialized successfully")
                    
            except (OperationalError, ProgrammingError) as table_error:
                if "doesn't exist" in str(table_error):
                    logger.warning("ActivationQueue table doesn't exist yet. Queue service will start after migrations.")
                else:
                    logger.warning(f"Database error checking table: {table_error}")
                    
            except Exception as e:
                logger.warning(f"Could not initialize queue service: {e}")
                
        except ImportError as e:
            logger.warning(f"Could not import queue service: {e}")
    
    def start_queue_service_after_migrate(self):
        """
        Call this method after migrations to start the queue service
        """
        try:
            from service_operations.services.queue_service import QueueService
            QueueService.initialize()
            logger.info("Queue service started after migrations")
        except Exception as e:
            logger.error(f"Failed to start queue service after migrations: {e}")