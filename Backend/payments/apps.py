# from django.apps import AppConfig


# class PaymentsConfig(AppConfig):
#     default_auto_field = 'django.db.models.BigAutoField'
#     name = 'payments'



from django.apps import AppConfig

class PaymentsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'payments'
    
    def ready(self):
        # Import and connect signals when the app is ready
        try:
            import payments.signals.payment_signals
            # Transaction log signals are imported in the models file
            import payments.models.transaction_log_model
        except ImportError as e:
            # Log the error but don't crash the app
            import logging
            logger = logging.getLogger(__name__)
            logger.warning(f"Could not import signals: {e}")