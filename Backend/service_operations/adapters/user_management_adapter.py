"""
Service Operations - User Management Adapter
Production-ready adapter for User Management/Authentication app integration
Handles client validation, details fetching, and authentication
"""

import logging
import requests
from typing import Dict, Optional, Any, List
from django.conf import settings
from decimal import Decimal
from django.utils import timezone, time
from django.core.cache import cache
import hashlib
import hmac
import json

logger = logging.getLogger(__name__)


class UserManagementAdapter:
    """
    Production-ready adapter for User Management/Authentication app.
    Includes circuit breaker, retry logic, caching, and comprehensive error handling.
    """
    
    # Configuration
    BASE_URL = getattr(settings, 'USER_MANAGEMENT_BASE_URL', 'http://localhost:8000')
    API_TIMEOUT = 30
    CACHE_TIMEOUT = 300  # 5 minutes
    MAX_RETRIES = 3
    RETRY_DELAYS = [1, 5, 30]  # seconds
    
    # Circuit breaker state
    _failure_count = 0
    _circuit_open = False
    _circuit_opened_at = None
    _CIRCUIT_THRESHOLD = 5
    _CIRCUIT_TIMEOUT = 300  # 5 minutes
    
    @classmethod
    def get_client_details(cls, client_id: str) -> Optional[Dict[str, Any]]:
        """
        Get comprehensive client details from User Management app.
        
        Args:
            client_id: Client ID
        
        Returns:
            Client details or None if not found/error
        """
        # Check circuit breaker
        if cls._circuit_open:
            time_open = (timezone.now() - cls._circuit_opened_at).total_seconds()
            if time_open < cls._CIRCUIT_TIMEOUT:
                logger.warning(f"Circuit breaker open for {time_open:.0f}s, client details fetch blocked")
                return None
            else:
                cls._reset_circuit()
        
        # Cache key
        cache_key = f"client_details:{client_id}"
        cached_details = cache.get(cache_key)
        
        if cached_details:
            logger.debug(f"Returning cached client details for {client_id}")
            return cached_details
        
        try:
            # Generate request signature for security
            timestamp = str(int(timezone.now().timestamp()))
            signature = cls._generate_signature(client_id, timestamp)
            
            headers = {
                'Content-Type': 'application/json',
                'X-Client-ID': client_id,
                'X-Timestamp': timestamp,
                'X-Signature': signature,
                'X-Service': 'service_operations',
                'Authorization': f'Bearer {cls._get_api_token()}'
            }
            
            # Make API call with retry logic
            response = None
            for retry in range(cls.MAX_RETRIES):
                try:
                    response = requests.get(
                        f"{cls.BASE_URL}/api/user_management/clients/{client_id}/details/",
                        headers=headers,
                        timeout=cls.API_TIMEOUT,
                        verify=True  # Enable SSL verification in production
                    )
                    
                    if response.status_code == 200:
                        client_data = response.json()
                        
                        # Validate required fields
                        if 'id' not in client_data or 'is_active' not in client_data:
                            logger.error(f"Invalid client data received for {client_id}")
                            return None
                        
                        # Cache the result
                        cache.set(cache_key, client_data, cls.CACHE_TIMEOUT)
                        
                        # Reset circuit breaker
                        cls._reset_circuit()
                        
                        logger.info(f"Retrieved client details for {client_id}")
                        return client_data
                    
                    elif response.status_code == 404:
                        logger.warning(f"Client not found: {client_id}")
                        return None
                    
                    elif response.status_code == 403:
                        logger.error(f"Access forbidden for client {client_id}")
                        return None
                    
                    else:
                        logger.warning(
                            f"Failed to get client details for {client_id}: "
                            f"HTTP {response.status_code}"
                        )
                        
                        if retry < cls.MAX_RETRIES - 1:
                            delay = cls.RETRY_DELAYS[retry]
                            logger.info(f"Retrying in {delay} seconds...")
                            time.sleep(delay)
                            continue
                
                except requests.exceptions.Timeout:
                    logger.error(f"Timeout getting client details for {client_id}")
                    if retry < cls.MAX_RETRIES - 1:
                        delay = cls.RETRY_DELAYS[retry]
                        logger.info(f"Retrying after timeout in {delay} seconds...")
                        time.sleep(delay)
                        continue
                
                except requests.exceptions.ConnectionError:
                    logger.error(f"Connection error getting client details for {client_id}")
                    cls._record_failure()
                    return None
                
                except Exception as e:
                    logger.error(f"Error getting client details for {client_id}: {e}")
                    if retry < cls.MAX_RETRIES - 1:
                        delay = cls.RETRY_DELAYS[retry]
                        logger.info(f"Retrying after error in {delay} seconds...")
                        time.sleep(delay)
                        continue
            
            # If all retries failed
            cls._record_failure()
            return None
            
        except Exception as e:
            logger.error(f"Unexpected error getting client details for {client_id}: {e}", exc_info=True)
            cls._record_failure()
            return None
    
    @classmethod
    def validate_client_exists(cls, client_id: str) -> bool:
        """
        Validate that a client exists and is active.
        
        Args:
            client_id: Client ID to validate
        
        Returns:
            True if client exists and is active, False otherwise
        """
        try:
            details = cls.get_client_details(client_id)
            return bool(details and details.get('is_active', False))
            
        except Exception as e:
            logger.error(f"Error validating client {client_id}: {e}")
            return False
    
    @classmethod
    def get_client_account_balance(cls, client_id: str) -> Optional[Decimal]:
        """
        Get client account balance.
        
        Args:
            client_id: Client ID
        
        Returns:
            Account balance or None if error
        """
        try:
            details = cls.get_client_details(client_id)
            if not details:
                return None
            
            balance = details.get('account_balance')
            if balance is None:
                return None
            
            try:
                return Decimal(str(balance))
            except:
                return None
                
        except Exception as e:
            logger.error(f"Error getting account balance for client {client_id}: {e}")
            return None
    
    @classmethod
    def verify_client_credentials(cls, client_id: str, password_hash: str) -> bool:
        """
        Verify client credentials.
        Note: In production, this should use proper authentication tokens.
        
        Args:
            client_id: Client ID
            password_hash: Hashed password
        
        Returns:
            True if credentials are valid, False otherwise
        """
        try:
            # This is a simplified example
            # In production, use proper OAuth2/JWT authentication
            
            headers = {
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {cls._get_api_token()}'
            }
            
            data = {
                'client_id': client_id,
                'password_hash': password_hash
            }
            
            response = requests.post(
                f"{cls.BASE_URL}/api/user_management/auth/verify/",
                json=data,
                headers=headers,
                timeout=cls.API_TIMEOUT
            )
            
            return response.status_code == 200
            
        except Exception as e:
            logger.error(f"Error verifying client credentials for {client_id}: {e}")
            return False
    
    @classmethod
    def update_client_profile(cls, client_id: str, updates: Dict[str, Any]) -> bool:
        """
        Update client profile.
        
        Args:
            client_id: Client ID
            updates: Profile updates
        
        Returns:
            True if successful, False otherwise
        """
        try:
            headers = {
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {cls._get_api_token()}',
                'X-Service': 'service_operations'
            }
            
            response = requests.patch(
                f"{cls.BASE_URL}/api/user_management/clients/{client_id}/profile/",
                json=updates,
                headers=headers,
                timeout=cls.API_TIMEOUT
            )
            
            success = response.status_code == 200
            
            if success:
                # Clear cache
                cache.delete(f"client_details:{client_id}")
                logger.info(f"Updated client profile for {client_id}")
            else:
                logger.warning(f"Failed to update client profile for {client_id}: HTTP {response.status_code}")
            
            return success
            
        except Exception as e:
            logger.error(f"Error updating client profile for {client_id}: {e}")
            return False
    
    @classmethod
    def get_client_subscription_history(cls, client_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Get client's subscription history.
        
        Args:
            client_id: Client ID
            limit: Maximum number of records
        
        Returns:
            List of subscription history records
        """
        try:
            cache_key = f"client_sub_history:{client_id}:{limit}"
            cached = cache.get(cache_key)
            
            if cached:
                return cached
            
            headers = {
                'Authorization': f'Bearer {cls._get_api_token()}',
                'X-Service': 'service_operations'
            }
            
            response = requests.get(
                f"{cls.BASE_URL}/api/user_management/clients/{client_id}/subscription-history/?limit={limit}",
                headers=headers,
                timeout=cls.API_TIMEOUT
            )
            
            if response.status_code == 200:
                history = response.json().get('history', [])
                cache.set(cache_key, history, 600)  # 10 minutes
                return history
            else:
                logger.warning(f"Failed to get subscription history for {client_id}: HTTP {response.status_code}")
                return []
                
        except Exception as e:
            logger.error(f"Error getting subscription history for {client_id}: {e}")
            return []
    
    @classmethod
    def notify_client(cls, client_id: str, notification_type: str, data: Dict[str, Any]) -> bool:
        """
        Send notification to client.
        
        Args:
            client_id: Client ID
            notification_type: Type of notification
            data: Notification data
        
        Returns:
            True if successful, False otherwise
        """
        try:
            notification_data = {
                'client_id': client_id,
                'type': notification_type,
                'data': data,
                'timestamp': timezone.now().isoformat()
            }
            
            headers = {
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {cls._get_api_token()}',
                'X-Service': 'service_operations'
            }
            
            response = requests.post(
                f"{cls.BASE_URL}/api/user_management/notifications/send/",
                json=notification_data,
                headers=headers,
                timeout=cls.API_TIMEOUT
            )
            
            success = response.status_code in [200, 202]
            
            if success:
                logger.info(f"Sent {notification_type} notification to client {client_id}")
            else:
                logger.warning(f"Failed to send notification to client {client_id}: HTTP {response.status_code}")
            
            return success
            
        except Exception as e:
            logger.error(f"Error sending notification to client {client_id}: {e}")
            return False
    
    @classmethod
    def health_check(cls) -> Dict[str, Any]:
        """
        Check User Management service health.
        
        Returns:
            Health status
        """
        try:
            response = requests.get(
                f"{cls.BASE_URL}/api/user_management/health/",
                timeout=5
            )
            
            if response.status_code == 200:
                data = response.json()
                return {
                    'status': 'healthy' if data.get('status') == 'healthy' else 'degraded',
                    'service': 'user_management',
                    'response': data,
                    'circuit_breaker': {
                        'state': 'open' if cls._circuit_open else 'closed',
                        'failure_count': cls._failure_count
                    }
                }
            else:
                return {
                    'status': 'unavailable',
                    'service': 'user_management',
                    'status_code': response.status_code,
                    'circuit_breaker': {
                        'state': 'open' if cls._circuit_open else 'closed',
                        'failure_count': cls._failure_count
                    }
                }
                
        except requests.exceptions.Timeout:
            return {
                'status': 'timeout',
                'service': 'user_management',
                'message': 'Service timeout',
                'circuit_breaker': {
                    'state': 'open' if cls._circuit_open else 'closed',
                    'failure_count': cls._failure_count
                }
            }
        except requests.exceptions.ConnectionError:
            return {
                'status': 'unavailable',
                'service': 'user_management',
                'message': 'Service connection failed',
                'circuit_breaker': {
                    'state': 'open' if cls._circuit_open else 'closed',
                    'failure_count': cls._failure_count
                }
            }
        except Exception as e:
            return {
                'status': 'error',
                'service': 'user_management',
                'message': str(e),
                'circuit_breaker': {
                    'state': 'open' if cls._circuit_open else 'closed',
                    'failure_count': cls._failure_count
                }
            }
    
    # Helper methods
    @classmethod
    def _generate_signature(cls, client_id: str, timestamp: str) -> str:
        """Generate request signature for security."""
        secret = getattr(settings, 'INTERNAL_API_SECRET', 'default-secret-change-in-production')
        message = f"{client_id}:{timestamp}"
        signature = hmac.new(
            secret.encode('utf-8'),
            message.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        return signature
    
    @classmethod
    def _get_api_token(cls) -> str:
        """Get API token from settings."""
        return getattr(settings, 'INTERNAL_API_TOKEN', '')
    
    @classmethod
    def _record_failure(cls):
        """Record failure for circuit breaker."""
        cls._failure_count += 1
        
        if cls._failure_count >= cls._CIRCUIT_THRESHOLD:
            cls._circuit_open = True
            cls._circuit_opened_at = timezone.now()
            logger.error(f"Circuit breaker opened for User Management after {cls._failure_count} failures")
    
    @classmethod
    def _reset_circuit(cls):
        """Reset circuit breaker."""
        cls._failure_count = 0
        cls._circuit_open = False
        cls._circuit_opened_at = None
        logger.info("Circuit breaker reset for User Management")


    # In user_management_adapter.py add:
    @staticmethod
    def check_client_eligibility(client_id: str, plan_id: str) -> Dict[str, Any]:
        """Check if client is eligible for a plan."""
    # Implementation based on User Management app endpoints
    pass

    # In network_adapter.py add:
    @staticmethod
    def cancel_activation(subscription_id: str) -> Dict[str, Any]:
        """Cancel an activation on network."""
    # Implementation based on Network Management app endpoints
    pass