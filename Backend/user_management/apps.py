# # from django.apps import AppConfig


# # class UserManagementConfig(AppConfig):
# #     default_auto_field = 'django.db.models.BigAutoField'
# #     name = 'user_management'




# """
# App configuration for User Management app
# Combines Client Management and SMS Automation
# """
# from django.apps import AppConfig
# import logging

# logger = logging.getLogger(__name__)


# class UserManagementConfig(AppConfig):
#     default_auto_field = 'django.db.models.BigAutoField'
#     name = 'user_management'
#     verbose_name = 'User Management'
    
#     def ready(self):
#         """
#         Initialize app when ready
#         This method is called when Django starts
#         """
#         # Initialize instance variables
#         self.SMS_MODELS_AVAILABLE = False
        
#         try:
#             logger.info("Initializing User Management app...")
            
#             # Import models to ensure they're registered
#             # This ensures all models are available when Django starts
#             from user_management.models.client_model import (
#                 ClientProfile, 
#                 ClientAnalyticsSnapshot,
#                 CommissionTransaction, 
#                 ClientInteraction
#             )
            
#             # Import SMS Automation models if they exist in the same app
#             try:
#                 # Check if SMS models exist in user_management.models
#                 from Backend.sms_automation.models.sms_automation_model import (
#                     SMSGatewayConfig,
#                     SMSTemplate,
#                     SMSMessage,
#                     SMSDeliveryLog,
#                     SMSAutomationRule
#                 )
#                 self.SMS_MODELS_AVAILABLE = True
#                 logger.info("SMS Automation models loaded successfully")
#             except ImportError:
#                 logger.warning("SMS Automation models not found")
            
#             # Import and register signal receivers
#             try:
#                 # Import client signal receivers
#                 from user_management.signals.client_receiever import (
#                     register_signal_receivers as register_client_signals
#                 )
                
#                 # Register client signal receivers
#                 if register_client_signals():
#                     logger.info("Client signal receivers registered")
#                 else:
#                     logger.warning("Client signal receivers could not be registered")
                    
#             except ImportError as e:
#                 logger.warning(f"Could not import client signal receivers: {str(e)}")
            
#             try:
#                 # Import SMS signal receivers
#                 from user_management.signals.sms_receiver import (
#                     register_signal_receivers as register_sms_signals
#                 )
                
#                 # Register SMS signal receivers
#                 if register_sms_signals():
#                     logger.info("SMS signal receivers registered")
#                 else:
#                     logger.warning("SMS signal receivers could not be registered")
                    
#             except ImportError as e:
#                 logger.warning(f"Could not import SMS signal receivers: {str(e)}")
            
#             # Initialize SMS Service if available
#             if self.SMS_MODELS_AVAILABLE:
#                 try:
#                     from user_management.services.sms_services import SMSService
#                     sms_service = SMSService()
#                     logger.info(f"SMS Service initialized with {len(sms_service.gateways)} gateways")
#                 except ImportError:
#                     logger.warning("SMS Service not available")
#                 except Exception as e:
#                     logger.warning(f"Could not initialize SMS Service: {str(e)}")
            
#             # Connect signals for automatic SMS on client creation
#             try:
#                 from django.db.models.signals import post_save
#                 from user_management.models.client_model import ClientProfile
                
#                 def send_welcome_sms_on_client_creation(sender, instance, created, **kwargs):
#                     """Send welcome SMS when client profile is created"""
#                     if created and hasattr(instance, 'phone_number') and instance.phone_number:
#                         try:
#                             # Only send if SMS service is available
#                             if self.SMS_MODELS_AVAILABLE:
#                                 from user_management.services.sms_services import SMSService
#                                 sms_service = SMSService()
                                
#                                 # Determine message based on connection type
#                                 if instance.is_pppoe_client:
#                                     message = (
#                                         f"Welcome {instance.username}! Your PPPoE account has been created. "
#                                         f"Check your SMS for credentials."
#                                     )
#                                 else:
#                                     message = (
#                                         f"Welcome {instance.username}! Your hotspot account has been created. "
#                                         f"Thank you for choosing us."
#                                     )
                                
#                                 sms = sms_service.create_sms_message(
#                                     phone_number=instance.phone_number,
#                                     message=message,
#                                     recipient_name=instance.username,
#                                     source='welcome',
#                                     reference_id=f"welcome_{instance.id}",
#                                     client=instance
#                                 )
#                                 sms_service.send_sms(sms)
                                
#                                 logger.info(f"Welcome SMS sent to {instance.phone_number}")
                                
#                         except Exception as e:
#                             logger.error(f"Failed to send welcome SMS: {str(e)}")
                
#                 # Connect the signal
#                 post_save.connect(
#                     send_welcome_sms_on_client_creation,
#                     sender=ClientProfile,
#                     dispatch_uid='user_management_welcome_sms'
#                 )
#                 logger.info("Welcome SMS signal connected to ClientProfile")
                
#             except Exception as e:
#                 logger.warning(f"Could not connect welcome SMS signal: {str(e)}")
            
#             logger.info(f"User Management app initialized successfully")
            
#         except Exception as e:
#             logger.error(f"Error initializing User Management app: {str(e)}", exc_info=True)
    
#     def get_app_info(self):
#         """
#         Get comprehensive app information
#         """
#         return {
#             'name': self.verbose_name,
#             'version': '2.0.0',
#             'modules': [
#                 {
#                     'name': 'Client Management',
#                     'description': 'Comprehensive client profiles, analytics, and business logic',
#                     'models': [
#                         'ClientProfile',
#                         'ClientAnalyticsSnapshot', 
#                         'CommissionTransaction',
#                         'ClientInteraction'
#                     ]
#                 },
#                 {
#                     'name': 'SMS Automation',
#                     'description': 'Complete SMS sending, automation, and tracking system',
#                     'models': [
#                         'SMSGatewayConfig',
#                         'SMSTemplate',
#                         'SMSMessage',
#                         'SMSDeliveryLog',
#                         'SMSAutomationRule'
#                     ] if self.SMS_MODELS_AVAILABLE else ['Not Available']
#                 }
#             ],
#             'features': [
#                 'Client onboarding and management',
#                 'Advanced analytics and insights',
#                 'Churn risk prediction',
#                 'Revenue segmentation',
#                 'Commission and referral tracking',
#                 'SMS gateway integration',
#                 'Template-based messaging',
#                 'Bulk SMS operations',
#                 'Automated SMS rules',
#                 'Delivery tracking and analytics'
#             ]
#         }
    
#     @classmethod
#     def check_dependencies(cls):
#         """
#         Check if required dependencies are available
#         """
#         dependencies = {
#             'authentication_app': {
#                 'required': True,
#                 'status': 'unknown',
#                 'message': 'Provides UserAccount model for client profiles'
#             },
#             'celery': {
#                 'required': False,
#                 'status': 'unknown',
#                 'message': 'Required for async task processing'
#             },
#             'africas_talking': {
#                 'required': False,
#                 'status': 'unknown',
#                 'message': 'Required for Africa\'s Talking SMS gateway'
#             },
#             'twilio': {
#                 'required': False,
#                 'status': 'unknown',
#                 'message': 'Required for Twilio SMS gateway'
#             }
#         }
        
#         # Check authentication app
#         try:
#             from authentication.models import UserAccount
#             dependencies['authentication_app']['status'] = 'available'
#         except ImportError:
#             dependencies['authentication_app']['status'] = 'missing'
#             dependencies['authentication_app']['message'] = 'Authentication app not found - client profiles will not work'
        
#         # Check Celery
#         try:
#             import celery
#             dependencies['celery']['status'] = 'available'
#         except ImportError:
#             dependencies['celery']['status'] = 'missing'
#             dependencies['celery']['message'] = 'Celery not installed - async tasks will run synchronously'
        
#         # Check SMS gateway dependencies
#         try:
#             import africastalking
#             dependencies['africas_talking']['status'] = 'available'
#         except ImportError:
#             dependencies['africas_talking']['status'] = 'missing'
#             dependencies['africas_talking']['message'] = 'Africa\'s Talking SDK not installed'
        
#         try:
#             import twilio
#             dependencies['twilio']['status'] = 'available'
#         except ImportError:
#             dependencies['twilio']['status'] = 'missing'
#             dependencies['twilio']['message'] = 'Twilio SDK not installed'
        
#         return dependencies









"""
App configuration for User Management app
Combines Client Management and SMS Automation
"""
from django.apps import AppConfig
import logging
import threading

logger = logging.getLogger(__name__)


class UserManagementConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'user_management'
    verbose_name = 'User Management'
    
    def ready(self):
        """
        Initialize app when ready
        This method is called when Django starts
        """
        # Initialize instance variables
        self.SMS_MODELS_AVAILABLE = False
        
        try:
            logger.info("Initializing User Management app...")
            
            # Setup signal receivers (no database access in setup)
            self._setup_signal_receivers()
            
            # Setup welcome SMS signal (delayed connection)
            self._setup_welcome_sms_signal()
            
            # Try to initialize SMS services in background (non-blocking)
            self._initialize_sms_services_async()
            
            logger.info(f"User Management app initialized successfully")
            
        except Exception as e:
            logger.error(f"Error initializing User Management app: {str(e)}", exc_info=True)
    
    def _setup_signal_receivers(self):
        """Setup signal receivers without database access"""
        try:
            # Import client signal receivers
            from user_management.signals.client_receiever import (
                register_signal_receivers as register_client_signals
            )
            
            # Register client signal receivers
            if register_client_signals():
                logger.info("Client signal receivers registered")
            else:
                logger.warning("Client signal receivers could not be registered")
                
        except ImportError as e:
            logger.warning(f"Could not import client signal receivers: {str(e)}")
        
        try:
            # Import SMS signal receivers
            from user_management.signals.sms_receiver import (
                register_signal_receivers as register_sms_signals
            )
            
            # Register SMS signal receivers
            if register_sms_signals():
                logger.info("SMS signal receivers registered")
            else:
                logger.warning("SMS signal receivers could not be registered")
                
        except ImportError as e:
            logger.warning(f"Could not import SMS signal receivers: {str(e)}")
    
    def _setup_welcome_sms_signal(self):
        """Setup welcome SMS signal with delayed model import"""
        try:
            from django.db.models.signals import post_save
            
            def send_welcome_sms_on_client_creation(sender, instance, created, **kwargs):
                """Send welcome SMS when client profile is created"""
                if created and hasattr(instance, 'phone_number') and instance.phone_number:
                    try:
                        # Check SMS availability dynamically
                        self._check_sms_availability()
                        
                        if self.SMS_MODELS_AVAILABLE:
                            from user_management.services.sms_services import SMSService
                            sms_service = SMSService()
                            
                            # Determine message based on connection type
                            if hasattr(instance, 'is_pppoe_client') and instance.is_pppoe_client:
                                message = (
                                    f"Welcome {instance.username}! Your PPPoE account has been created. "
                                    f"Check your SMS for credentials."
                                )
                            else:
                                message = (
                                    f"Welcome {instance.username}! Your hotspot account has been created. "
                                    f"Thank you for choosing us."
                                )
                            
                            sms = sms_service.create_sms_message(
                                phone_number=instance.phone_number,
                                message=message,
                                recipient_name=instance.username,
                                source='welcome',
                                reference_id=f"welcome_{instance.id}",
                                client=instance
                            )
                            sms_service.send_sms(sms)
                            
                            logger.info(f"Welcome SMS sent to {instance.phone_number}")
                            
                    except Exception as e:
                        logger.error(f"Failed to send welcome SMS: {str(e)}")
            
            # Import ClientProfile lazily and connect signal
            # This avoids database access during app initialization
            def connect_signal():
                try:
                    from user_management.models.client_model import ClientProfile
                    post_save.connect(
                        send_welcome_sms_on_client_creation,
                        sender=ClientProfile,
                        dispatch_uid='user_management_welcome_sms'
                    )
                    logger.info("Welcome SMS signal connected to ClientProfile")
                except Exception as e:
                    logger.debug(f"Could not connect welcome SMS signal yet: {str(e)}")
            
            # Try to connect immediately, but don't fail if models aren't ready
            connect_signal()
            
        except Exception as e:
            logger.warning(f"Could not setup welcome SMS signal: {str(e)}")
    
    def _check_sms_availability(self):
        """Check if SMS models are available (lazy check)"""
        try:
            if not self.SMS_MODELS_AVAILABLE:
                from Backend.sms_automation.models.sms_automation_model import (
                    SMSGatewayConfig,
                    SMSTemplate,
                    SMSMessage,
                    SMSDeliveryLog,
                    SMSAutomationRule
                )
                self.SMS_MODELS_AVAILABLE = True
        except ImportError:
            self.SMS_MODELS_AVAILABLE = False
        except Exception:
            self.SMS_MODELS_AVAILABLE = False
    
    def _initialize_sms_services_async(self):
        """Initialize SMS services asynchronously to avoid blocking app startup"""
        def init_sms_services():
            try:
                self._check_sms_availability()
                
                if self.SMS_MODELS_AVAILABLE:
                    from user_management.services.sms_services import SMSService
                    sms_service = SMSService()
                    logger.info(f"SMS Service initialized with {len(sms_service.gateways)} gateways")
                else:
                    logger.info("SMS Service not available - skipping initialization")
                    
            except ImportError:
                logger.debug("SMS Service module not found")
            except Exception as e:
                logger.debug(f"Could not initialize SMS Service: {str(e)}")
        
        # Start in background thread to avoid blocking
        thread = threading.Thread(target=init_sms_services, daemon=True)
        thread.start()
    
    def get_app_info(self):
        """
        Get comprehensive app information
        """
        return {
            'name': self.verbose_name,
            'version': '2.0.0',
            'modules': [
                {
                    'name': 'Client Management',
                    'description': 'Comprehensive client profiles, analytics, and business logic',
                    'models': [
                        'ClientProfile',
                        'ClientAnalyticsSnapshot', 
                        'CommissionTransaction',
                        'ClientInteraction'
                    ]
                },
                {
                    'name': 'SMS Automation',
                    'description': 'Complete SMS sending, automation, and tracking system',
                    'models': [
                        'SMSGatewayConfig',
                        'SMSTemplate',
                        'SMSMessage',
                        'SMSDeliveryLog',
                        'SMSAutomationRule'
                    ] if self.SMS_MODELS_AVAILABLE else ['Not Available']
                }
            ],
            'features': [
                'Client onboarding and management',
                'Advanced analytics and insights',
                'Churn risk prediction',
                'Revenue segmentation',
                'Commission and referral tracking',
                'SMS gateway integration',
                'Template-based messaging',
                'Bulk SMS operations',
                'Automated SMS rules',
                'Delivery tracking and analytics'
            ]
        }
    
    @classmethod
    def check_dependencies(cls):
        """
        Check if required dependencies are available
        """
        dependencies = {
            'authentication_app': {
                'required': True,
                'status': 'unknown',
                'message': 'Provides UserAccount model for client profiles'
            },
            'celery': {
                'required': False,
                'status': 'unknown',
                'message': 'Required for async task processing'
            },
            'africas_talking': {
                'required': False,
                'status': 'unknown',
                'message': 'Required for Africa\'s Talking SMS gateway'
            },
            'twilio': {
                'required': False,
                'status': 'unknown',
                'message': 'Required for Twilio SMS gateway'
            }
        }
        
        # Check authentication app
        try:
            from authentication.models import UserAccount
            dependencies['authentication_app']['status'] = 'available'
        except ImportError:
            dependencies['authentication_app']['status'] = 'missing'
            dependencies['authentication_app']['message'] = 'Authentication app not found - client profiles will not work'
        
        # Check Celery
        try:
            import celery
            dependencies['celery']['status'] = 'available'
        except ImportError:
            dependencies['celery']['status'] = 'missing'
            dependencies['celery']['message'] = 'Celery not installed - async tasks will run synchronously'
        
        # Check SMS gateway dependencies
        try:
            import africastalking
            dependencies['africas_talking']['status'] = 'available'
        except ImportError:
            dependencies['africas_talking']['status'] = 'missing'
            dependencies['africas_talking']['message'] = 'Africa\'s Talking SDK not installed'
        
        try:
            import twilio
            dependencies['twilio']['status'] = 'available'
        except ImportError:
            dependencies['twilio']['status'] = 'missing'
            dependencies['twilio']['message'] = 'Twilio SDK not installed'
        
        return dependencies