




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




# """
# Service Operations App Configuration
# """

# from django.apps import AppConfig
# import logging
# from django.db import OperationalError, ProgrammingError

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
            
#             # Setup signal receivers (no database access)
#             self._setup_signals()
            
#             # Initialize queue service ONLY if tables exist
#             self._initialize_services_safe()
            
#             logger.info("Service Operations app initialized successfully")
            
#         except Exception as e:
#             logger.error(f"Error initializing Service Operations app: {e}", exc_info=True)
    
#     def _setup_signals(self):
#         """Setup signal receivers (no database access)"""
#         try:
#             from service_operations.signals.operation_signals import setup_signal_receivers
#             setup_signal_receivers()
#             logger.info("Signal receivers set up successfully")
#         except Exception as e:
#             logger.warning(f"Could not setup signal receivers: {e}")
    
#     def _initialize_services_safe(self):
#         """Initialize services safely, checking for table existence"""
#         try:
#             from service_operations.services.queue_service import QueueService
            
#             # Check if ActivationQueue table exists
#             try:
#                 from service_operations.models.activation_queue_models import ActivationQueue
#                 # Test if we can query the table
#                 # Use raw SQL to avoid model validation issues
#                 from django.db import connection
#                 with connection.cursor() as cursor:
#                     cursor.execute("SELECT 1 FROM service_operations_activationqueue LIMIT 1")
#                     # If we get here, table exists
#                     QueueService.initialize()
#                     logger.info("Queue service initialized successfully")
                    
#             except (OperationalError, ProgrammingError) as table_error:
#                 if "doesn't exist" in str(table_error):
#                     logger.warning("ActivationQueue table doesn't exist yet. Queue service will start after migrations.")
#                 else:
#                     logger.warning(f"Database error checking table: {table_error}")
                    
#             except Exception as e:
#                 logger.warning(f"Could not initialize queue service: {e}")
                
#         except ImportError as e:
#             logger.warning(f"Could not import queue service: {e}")
    
#     def start_queue_service_after_migrate(self):
#         """
#         Call this method after migrations to start the queue service
#         """
#         try:
#             from service_operations.services.queue_service import QueueService
#             QueueService.initialize()
#             logger.info("Queue service started after migrations")
#         except Exception as e:
#             logger.error(f"Failed to start queue service after migrations: {e}")









"""
Service Operations App Configuration with Production Optimizations
"""

from django.apps import AppConfig
import logging
import os
from django.db import OperationalError, ProgrammingError

logger = logging.getLogger(__name__)


class ServiceOperationsConfig(AppConfig):
    """Service Operations App Configuration with Production Optimizations"""
    
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'service_operations'
    verbose_name = 'Service Operations'
    
    def ready(self):
        """Initialize app when ready with production optimizations"""
        try:
            logger.info("Initializing Service Operations app...")
            
            # Check if we're in a management command (like migrate)
            # Don't start queue service during migrations
            if self._is_management_command():
                logger.info("Management command detected, skipping queue initialization")
                self._setup_signals_minimal()
                return
            
            # Setup signal receivers
            self._setup_signals()
            
            # Initialize queue service with production optimizations
            self._initialize_services_production()
            
            logger.info("Service Operations app initialized successfully with production optimizations")
            
        except Exception as e:
            logger.error(f"Error initializing Service Operations app: {e}", exc_info=True)
    
    def _is_management_command(self) -> bool:
        """Check if we're running a management command."""
        import sys
        return len(sys.argv) > 1 and sys.argv[1] in [
            'migrate', 'makemigrations', 'collectstatic', 'test',
            'createsuperuser', 'shell', 'check', 'runserver'
        ]
    
    def _setup_signals_minimal(self):
        """Setup minimal signal receivers for management commands."""
        try:
            from service_operations.signals.operation_signals import setup_signal_receivers
            setup_signal_receivers()
            logger.info("Minimal signal receivers set up for management command")
        except Exception as e:
            logger.warning(f"Could not setup minimal signal receivers: {e}")
    
    def _setup_signals(self):
        """Setup signal receivers."""
        try:
            from service_operations.signals.operation_signals import setup_signal_receivers
            setup_signal_receivers()
            logger.info("Signal receivers set up successfully")
        except Exception as e:
            logger.warning(f"Could not setup signal receivers: {e}")
    
    def _initialize_services_production(self):
        """Initialize services with production optimizations."""
        try:
            # Check system load before starting
            self._check_system_load()
            
            # Initialize queue service with table existence check
            self._initialize_queue_service_safe()
            
        except Exception as e:
            logger.error(f"Error in production service initialization: {e}", exc_info=True)
    
    def _check_system_load(self):
        """Check system load and warn if high."""
        try:
            import psutil
            cpu_percent = psutil.cpu_percent(interval=0.5)
            memory_percent = psutil.virtual_memory().percent
            
            if cpu_percent > 80 or memory_percent > 85:
                logger.warning(f"High system load detected at startup: CPU={cpu_percent}%, Memory={memory_percent}%")
                
                # If CPU is extremely high, delay queue startup
                if cpu_percent > 90:
                    logger.warning("CPU extremely high, queue service startup delayed by 30 seconds")
                    import time
                    time.sleep(30)
                    
        except Exception as e:
            logger.warning(f"Could not check system load: {e}")
    
    def _initialize_queue_service_safe(self):
        """Initialize queue service safely with table checks."""
        try:
            from service_operations.services.queue_service import QueueService
            
            # Check if ActivationQueue table exists
            try:
                from service_operations.models.activation_queue_models import ActivationQueue
                from django.db import connection
                
                # Use raw SQL to avoid Django model validation issues
                with connection.cursor() as cursor:
                    cursor.execute("""
                        SELECT EXISTS (
                            SELECT 1 FROM information_schema.tables 
                            WHERE table_name = 'service_operations_activationqueue'
                        )
                    """)
                    table_exists = cursor.fetchone()[0]
                    
                    if table_exists:
                        # Table exists, initialize queue service
                        QueueService.initialize()
                        logger.info("Production queue service initialized successfully")
                    else:
                        logger.warning("ActivationQueue table doesn't exist yet. Queue service will start after migrations.")
                        
            except (OperationalError, ProgrammingError) as table_error:
                if "doesn't exist" in str(table_error) or "relation" in str(table_error):
                    logger.warning("Database table not ready. Queue service will start after migrations.")
                else:
                    logger.warning(f"Database error checking table: {table_error}")
                    
            except Exception as e:
                logger.warning(f"Could not initialize queue service: {e}")
                
        except ImportError as e:
            logger.warning(f"Could not import queue service: {e}")
    
    def start_queue_service_after_migrate(self):
        """
        Call this method after migrations to start the queue service.
        Useful for post-migration scripts.
        """
        try:
            from service_operations.services.queue_service import QueueService
            
            # Check system load before starting
            self._check_system_load()
            
            # Initialize queue service
            QueueService.initialize()
            logger.info("Queue service started successfully after migrations")
            
        except Exception as e:
            logger.error(f"Failed to start queue service after migrations: {e}", exc_info=True)
    
    def get_queue_service_status(self):
        """
        Get the current status of the queue service.
        """
        try:
            from service_operations.services.queue_service import QueueService
            
            # This assumes QueueService has a get_status() method
            # You might need to add this to your QueueService class
            status = QueueService.get_queue_status()
            return status
            
        except Exception as e:
            logger.error(f"Failed to get queue service status: {e}")
            return {"status": "error", "error": str(e)}