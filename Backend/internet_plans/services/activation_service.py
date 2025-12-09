# import logging
# import requests
# from django.conf import settings
# from django.utils import timezone
# from internet_plans.models.create_plan_models import Subscription

# logger = logging.getLogger(__name__)

# class ActivationService:
#     """Service to handle subscription activation via NetworkManagement API"""
    
#     @staticmethod
#     def request_subscription_activation(subscription):
#         """
#         Request activation of subscription via NetworkManagement API
#         """
#         try:
#             activation_data = {
#                 'subscription_id': subscription.id,
#                 'client_id': subscription.client.id,
#                 'plan_id': subscription.internet_plan.id,
#                 'access_method': subscription.access_method,
#                 'mac_address': subscription.mac_address,
#                 'router_id': subscription.router.id if subscription.router else None,
#                 'plan_config': subscription.internet_plan.access_methods.get(subscription.access_method, {}),
#                 'duration_seconds': subscription.remaining_time,
#                 'data_limit_bytes': subscription.remaining_data
#             }
            
#             # Call NetworkManagement activation API
#             response = requests.post(
#                 f"{settings.NETWORK_MANAGEMENT_BASE_URL}/api/network_management/subscriptions/activate/",
#                 json=activation_data,
#                 headers={'Content-Type': 'application/json'},
#                 timeout=30
#             )
            
#             if response.status_code == 202:  # Accepted for processing
#                 result = response.json()
#                 subscription.activation_requested = True
#                 subscription.activation_requested_at = timezone.now()
#                 subscription.save()
                
#                 return {
#                     'success': True,
#                     'activation_id': result.get('activation_id'),
#                     'message': 'Activation request submitted successfully'
#                 }
#             else:
#                 logger.error(f"Activation request failed: {response.status_code} - {response.text}")
#                 return {
#                     'success': False,
#                     'error': f'Activation service unavailable: {response.status_code}'
#                 }
                
#         except requests.exceptions.RequestException as e:
#             logger.error(f"Activation service connection error: {e}")
#             return {
#                 'success': False,
#                 'error': 'Activation service connection failed'
#             }
#         except Exception as e:
#             logger.error(f"Activation request error: {e}")
#             return {
#                 'success': False,
#                 'error': str(e)
#             }
    
#     @staticmethod
#     def check_activation_status(subscription):
#         """
#         Check activation status via NetworkManagement API
#         """
#         try:
#             response = requests.get(
#                 f"{settings.NETWORK_MANAGEMENT_BASE_URL}/api/network_management/subscriptions/{subscription.id}/status/",
#                 timeout=10
#             )
            
#             if response.status_code == 200:
#                 return response.json()
#             else:
#                 return {'status': 'unknown', 'error': 'Failed to fetch status'}
                
#         except requests.exceptions.RequestException as e:
#             logger.error(f"Activation status check failed: {e}")
#             return {'status': 'unknown', 'error': str(e)}












"""
Internet Plans - Activation Service
Handles subscription activation via NetworkManagement API
"""

import logging
import requests
from django.conf import settings
from django.utils import timezone
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)


class ActivationService:
    """Service to handle subscription activation"""
    
    @staticmethod
    def request_subscription_activation(subscription) -> Dict[str, Any]:
        """
        Request activation of subscription via NetworkManagement API
        """
        try:
            # Prepare activation data
            activation_data = {
                'subscription_id': str(subscription.id),
                'client_id': str(subscription.client.id),
                'plan_id': str(subscription.internet_plan.id) if subscription.internet_plan else None,
                'access_method': subscription.access_method,
                'mac_address': subscription.mac_address,
                'router_id': subscription.router.id if subscription.router else None,
                'plan_config': subscription.internet_plan.access_methods.get(subscription.access_method, {}) if subscription.internet_plan else {},
                'duration_seconds': subscription.remaining_time,
                'data_limit_bytes': subscription.remaining_data,
                'client_info': {
                    'username': subscription.client.username,
                    'phone_number': getattr(subscription.client, 'phone_number', ''),
                    'connection_type': getattr(subscription.client, 'connection_type', 'hotspot'),
                }
            }
            
            # Call NetworkManagement activation API
            network_management_url = getattr(settings, 'NETWORK_MANAGEMENT_BASE_URL', 'http://localhost:8000')
            
            response = requests.post(
                f"{network_management_url}/api/network_management/subscriptions/activate/",
                json=activation_data,
                headers={
                    'Content-Type': 'application/json',
                    'Authorization': f'Bearer {settings.INTERNAL_API_TOKEN}' if hasattr(settings, 'INTERNAL_API_TOKEN') else ''
                },
                timeout=30
            )
            
            if response.status_code == 202:  # Accepted for processing
                result = response.json()
                
                # Update subscription
                subscription.activation_requested = True
                subscription.activation_requested_at = timezone.now()
                subscription.save()
                
                logger.info(
                    f"Activation request submitted: {subscription.id} "
                    f"activation_id: {result.get('activation_id')}"
                )
                
                return {
                    'success': True,
                    'activation_id': result.get('activation_id'),
                    'message': 'Activation request submitted successfully'
                }
            else:
                error_msg = f"{response.status_code} - {response.text}"
                logger.error(f"Activation request failed: {error_msg}")
                
                # Update subscription with error
                subscription.activation_requested = True
                subscription.activation_error = f'Activation service error: {response.status_code}'
                subscription.save()
                
                return {
                    'success': False,
                    'error': f'Activation service unavailable: {response.status_code}'
                }
                
        except requests.exceptions.Timeout:
            logger.error(f"Activation service timeout for subscription {subscription.id}")
            
            subscription.activation_requested = True
            subscription.activation_error = 'Activation service timeout'
            subscription.save()
            
            return {
                'success': False,
                'error': 'Activation service timeout'
            }
            
        except requests.exceptions.ConnectionError:
            logger.error(f"Activation service connection error for subscription {subscription.id}")
            
            subscription.activation_requested = True
            subscription.activation_error = 'Activation service connection failed'
            subscription.save()
            
            return {
                'success': False,
                'error': 'Activation service connection failed'
            }
            
        except Exception as e:
            logger.error(f"Activation request error for subscription {subscription.id}: {e}")
            
            subscription.activation_requested = True
            subscription.activation_error = str(e)
            subscription.save()
            
            return {
                'success': False,
                'error': str(e)
            }
    
    @staticmethod
    def check_activation_status(subscription) -> Dict[str, Any]:
        """
        Check activation status via NetworkManagement API
        """
        try:
            network_management_url = getattr(settings, 'NETWORK_MANAGEMENT_BASE_URL', 'http://localhost:8000')
            
            response = requests.get(
                f"{network_management_url}/api/network_management/subscriptions/{subscription.id}/status/",
                headers={
                    'Authorization': f'Bearer {settings.INTERNAL_API_TOKEN}' if hasattr(settings, 'INTERNAL_API_TOKEN') else ''
                },
                timeout=10
            )
            
            if response.status_code == 200:
                result = response.json()
                
                # Update subscription if activation successful
                if result.get('status') == 'active' and result.get('success'):
                    subscription.activation_successful = True
                    subscription.save(update_fields=['activation_successful', 'updated_at'])
                
                return result
            else:
                return {
                    'success': False,
                    'status': 'unknown',
                    'error': f'Failed to fetch status: {response.status_code}'
                }
                
        except requests.exceptions.RequestException as e:
            logger.error(f"Activation status check failed for {subscription.id}: {e}")
            return {
                'success': False,
                'status': 'unknown',
                'error': str(e)
            }
        except Exception as e:
            logger.error(f"Activation status check error for {subscription.id}: {e}")
            return {
                'success': False,
                'status': 'unknown',
                'error': str(e)
            }