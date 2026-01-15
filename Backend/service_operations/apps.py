# from django.apps import AppConfig


# class ServiceOperationsConfig(AppConfig):
#     default_auto_field = 'django.db.models.BigAutoField'
#     name = 'service_operations'








# """
# Service Operations App Configuration
# Production-ready with comprehensive initialization
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
#         """
#         Initialize app when ready
#         This method is called when Django starts
#         """
#         try:
#             logger.info("Initializing Service Operations app...")
            
#             # Import models to ensure they're registered
#             from service_operations.models.subscription_models import Subscription
#             from service_operations.models.operation_models import ActivationQueue, OperationLog
#             from service_operations.models.client_models import ClientOperation
            
#             # Setup signal receivers
#             self._setup_signals()
            
#             # Initialize services
#             self._initialize_services()
            
#             # Setup periodic tasks
#             self._setup_periodic_tasks()
            
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
    
#     def _initialize_services(self):
#         """Initialize service layer"""
#         try:
#             from service_operations.services.activation_service import ActivationService
#             from service_operations.services.subscription_service import SubscriptionService
#             from service_operations.services.queue_service import QueueService
            
#             # Initialize queue processing
#             QueueService.initialize()
            
#             # Health check
#             ActivationService.health_check()
            
#             logger.info("Services initialized successfully")
#         except Exception as e:
#             logger.warning(f"Could not initialize services: {e}")
    
#     def _setup_periodic_tasks(self):
#         """Setup periodic background tasks"""
#         try:
#             # This would typically be done with Celery
#             # For now, we just log the intent
#             logger.info("Periodic tasks would be set up here with Celery")
            
#             # Example tasks:
#             # 1. Process activation queue
#             # 2. Check for expired subscriptions
#             # 3. Clean up old operation logs
#             # 4. Sync usage with network management
            
#         except Exception as e:
#             logger.warning(f"Could not setup periodic tasks: {e}")
    
#     def get_app_info(self):
#         """Get comprehensive app information"""
#         return {
#             'name': self.verbose_name,
#             'version': '1.0.0',
#             'modules': {
#                 'subscription_management': {
#                     'description': 'Subscription lifecycle and usage tracking',
#                     'models': ['Subscription', 'UsageTracking']
#                 },
#                 'operation_management': {
#                     'description': 'Activation queue and operation execution',
#                     'models': ['ActivationQueue', 'OperationLog']
#                 },
#                 'client_operations': {
#                     'description': 'Client-facing operations and integration',
#                     'models': ['ClientOperation']
#                 }
#             },
#             'features': [
#                 'Subscription lifecycle management',
#                 'Network activation integration',
#                 'Usage tracking and reporting',
#                 'Client operation workflows',
#                 'Queue-based operation processing',
#                 'Circuit breaker patterns',
#                 'Health monitoring',
#                 'External system integration'
#             ],
#             'dependencies': {
#                 'required': ['internet_plans'],
#                 'recommended': ['authentication', 'network_management', 'payment'],
#                 'optional': ['user_management', 'sms_automation']
#             }
#         }







"""
Service Operations App Configuration
"""

from django.apps import AppConfig
import logging

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
            
            # Import models to ensure they're registered
            from service_operations.models.subscription_models import Subscription
            from service_operations.models.activation_queue_models import ActivationQueue, OperationLog
            from service_operations.models.client_operation_models import ClientOperation
            
            # Initialize queue service
            from service_operations.services.queue_service import QueueService
            QueueService.initialize()
            
            # Setup signal receivers
            self._setup_signals()
            
            logger.info("Service Operations app initialized successfully")
            
        except Exception as e:
            logger.error(f"Error initializing Service Operations app: {e}", exc_info=True)
    
    def _setup_signals(self):
        """Setup signal receivers"""
        try:
            from service_operations.signals.operation_signals import setup_signal_receivers
            setup_signal_receivers()
            logger.info("Signal receivers set up successfully")
        except Exception as e:
            logger.warning(f"Could not setup signal receivers: {e}")