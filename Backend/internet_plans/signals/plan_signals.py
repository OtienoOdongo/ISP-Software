"""
Internet Plans - Signal Definitions
Signals for inter-app communication
"""

from django.dispatch import Signal
import logging

logger = logging.getLogger(__name__)

# Signal emitted when plan is purchased
# Data: {
#   'subscription_id': str,
#   'client_id': str,
#   'plan_id': str,
#   'plan_name': str,
#   'access_method': str,
#   'amount': float,
#   'status': str,
#   'payment_data': dict
# }
plan_purchased = Signal()

# Signal emitted when subscription is activated
# Data: {
#   'subscription_id': str,
#   'client_id': str,
#   'plan_id': str,
#   'router_id': int,
#   'access_method': str,
#   'activation_id': str
# }
subscription_activated = Signal()

# Signal emitted when subscription expires
# Data: {
#   'subscription_id': str,
#   'client_id': str,
#   'plan_id': str,
#   'expired_at': datetime
# }
subscription_expired = Signal()

# Signal emitted when subscription is renewed
# Data: {
#   'subscription_id': str,
#   'client_id': str,
#   'plan_id': str,
#   'renewed_at': datetime,
#   'new_end_date': datetime
# }
subscription_renewed = Signal()

# Signal emitted when plan usage is updated
# Data: {
#   'subscription_id': str,
#   'client_id': str,
#   'data_used': int,
#   'time_used': int,
#   'remaining_data': int,
#   'remaining_time': int
# }
plan_usage_updated = Signal()


# Signal receivers for Authentication app signals
def setup_auth_signal_receivers():
    """
    Set up receivers for Authentication app signals
    """
    try:
        from authentication.signals import (
            client_account_created,
            pppoe_credentials_generated,
        )
        
        from django.dispatch import receiver
        
        @receiver(client_account_created)
        def handle_new_client_created(sender, **kwargs):
            """
            Handle new client creation from Authentication app
            """
            try:
                from internet_plans.services.integration_service import IntegrationService
                
                client_data = kwargs
                user_id = client_data.get('user_id')
                phone_number = client_data.get('phone_number')
                connection_type = client_data.get('connection_type')
                
                logger.info(f"New client created in Authentication app: {user_id}")
                
                # You could auto-assign a free trial plan here
                # Or send a welcome offer
                
            except Exception as e:
                logger.error(f"Failed to handle new client signal: {e}")
        
        @receiver(pppoe_credentials_generated)
        def handle_pppoe_credentials_generated(sender, **kwargs):
            """
            Handle PPPoE credentials generation
            """
            try:
                credentials_data = kwargs
                user_id = credentials_data.get('user_id')
                pppoe_username = credentials_data.get('pppoe_username')
                
                logger.info(f"PPPoE credentials generated for user: {user_id}")
                
                # You could update related subscriptions or send notifications
                
            except Exception as e:
                logger.error(f"Failed to handle PPPoE credentials signal: {e}")
        
        logger.info("Authentication signal receivers set up successfully")
        
    except ImportError as e:
        logger.warning(f"Could not set up Authentication signal receivers: {e}")


# Initialize signal receivers when module is loaded
setup_auth_signal_receivers()