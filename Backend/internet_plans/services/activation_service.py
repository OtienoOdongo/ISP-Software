import logging
import requests
from django.conf import settings
from django.utils import timezone
from internet_plans.models.create_plan_models import Subscription

logger = logging.getLogger(__name__)

class ActivationService:
    """Service to handle subscription activation via NetworkManagement API"""
    
    @staticmethod
    def request_subscription_activation(subscription):
        """
        Request activation of subscription via NetworkManagement API
        """
        try:
            activation_data = {
                'subscription_id': subscription.id,
                'client_id': subscription.client.id,
                'plan_id': subscription.internet_plan.id,
                'access_method': subscription.access_method,
                'mac_address': subscription.mac_address,
                'router_id': subscription.router.id if subscription.router else None,
                'plan_config': subscription.internet_plan.access_methods.get(subscription.access_method, {}),
                'duration_seconds': subscription.remaining_time,
                'data_limit_bytes': subscription.remaining_data
            }
            
            # Call NetworkManagement activation API
            response = requests.post(
                f"{settings.NETWORK_MANAGEMENT_BASE_URL}/api/network_management/subscriptions/activate/",
                json=activation_data,
                headers={'Content-Type': 'application/json'},
                timeout=30
            )
            
            if response.status_code == 202:  # Accepted for processing
                result = response.json()
                subscription.activation_requested = True
                subscription.activation_requested_at = timezone.now()
                subscription.save()
                
                return {
                    'success': True,
                    'activation_id': result.get('activation_id'),
                    'message': 'Activation request submitted successfully'
                }
            else:
                logger.error(f"Activation request failed: {response.status_code} - {response.text}")
                return {
                    'success': False,
                    'error': f'Activation service unavailable: {response.status_code}'
                }
                
        except requests.exceptions.RequestException as e:
            logger.error(f"Activation service connection error: {e}")
            return {
                'success': False,
                'error': 'Activation service connection failed'
            }
        except Exception as e:
            logger.error(f"Activation request error: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    @staticmethod
    def check_activation_status(subscription):
        """
        Check activation status via NetworkManagement API
        """
        try:
            response = requests.get(
                f"{settings.NETWORK_MANAGEMENT_BASE_URL}/api/network_management/subscriptions/{subscription.id}/status/",
                timeout=10
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                return {'status': 'unknown', 'error': 'Failed to fetch status'}
                
        except requests.exceptions.RequestException as e:
            logger.error(f"Activation status check failed: {e}")
            return {'status': 'unknown', 'error': str(e)}