# from django.apps import AppConfig


# class SmsAutomationConfig(AppConfig):
#     default_auto_field = 'django.db.models.BigAutoField'
#     name = 'sms_automation'








"""
SMS Automation App Configuration
"""
from django.apps import AppConfig
import logging

logger = logging.getLogger(__name__)


class SmsAutomationConfig(AppConfig):
    """SMS Automation App Configuration"""
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'sms_automation'
    verbose_name = 'SMS Automation'
    
    def ready(self):
        """Initialize app when ready"""
        # Import signals
        try:
            import sms_automation.signals  # noqa
            logger.info("SMS Automation signals loaded")
        except Exception as e:
            logger.error(f"Failed to load SMS Automation signals: {str(e)}")
        
        # Schedule periodic tasks if Celery is available
        self._schedule_periodic_tasks()
        
        # Initialize services
        self._initialize_services()
    
    def _schedule_periodic_tasks(self):
        """Schedule periodic tasks for SMS automation"""
        try:
            # Check if Celery is available
            from django.conf import settings
            if hasattr(settings, 'CELERY_BROKER_URL'):
                from celery import Celery
                from celery.schedules import crontab
                
                app = Celery('sms_automation')
                
                # Schedule periodic tasks
                app.conf.beat_schedule.update({
                    'process-sms-queue': {
                        'task': 'sms_automation.tasks.process_sms_queue',
                        'schedule': crontab(minute='*/5'),  # Every 5 minutes
                        'args': (100,)  # Process 100 messages per batch
                    },
                    'process-scheduled-messages': {
                        'task': 'sms_automation.tasks.process_scheduled_messages',
                        'schedule': crontab(minute='*/1'),  # Every minute
                        'args': (50,)  # Process 50 messages
                    },
                    'process-retry-messages': {
                        'task': 'sms_automation.tasks.process_retry_messages',
                        'schedule': crontab(minute='*/10'),  # Every 10 minutes
                        'args': (50,)  # Process 50 messages
                    },
                    'update-analytics': {
                        'task': 'sms_automation.tasks.update_daily_analytics',
                        'schedule': crontab(hour=0, minute=5),  # Daily at 00:05
                    },
                    'check-gateway-health': {
                        'task': 'sms_automation.tasks.check_gateway_health',
                        'schedule': crontab(minute='*/30'),  # Every 30 minutes
                    },
                    'cleanup-old-messages': {
                        'task': 'sms_automation.tasks.cleanup_old_messages',
                        'schedule': crontab(hour=2, minute=0),  # Daily at 02:00
                    }
                })
                
                logger.info("SMS Automation periodic tasks scheduled")
                
        except ImportError:
            logger.warning("Celery not available, periodic tasks not scheduled")
        except Exception as e:
            logger.error(f"Failed to schedule periodic tasks: {str(e)}")
    
    def _initialize_services(self):
        """Initialize SMS services"""
        try:
            from sms_automation.services.sms_service import SMSService
            service = SMSService()
            logger.info(f"SMS Service initialized with {len(service.gateways)} gateways")
        except Exception as e:
            logger.error(f"Failed to initialize SMS services: {str(e)}")