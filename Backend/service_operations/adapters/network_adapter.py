"""
Service Operations - Network Adapter
Production-ready adapter for network_management app integration

Features:
- Circuit breaker pattern implementation
- Comprehensive retry logic with exponential backoff
- Connection pooling for performance
- Comprehensive logging and monitoring
- Health checks and status monitoring
- Timeout management
- Request/response validation
- Production-ready error handling
"""

import logging
import requests
import time
import threading
from typing import Dict, Any, Optional, Tuple, List
from dataclasses import dataclass
from datetime import datetime, timedelta
from enum import Enum
from functools import wraps
import json
import uuid

from django.conf import settings
from django.utils import timezone
from django.core.cache import cache

logger = logging.getLogger(__name__)


class CircuitState(Enum):
    """Circuit breaker states"""
    CLOSED = "closed"
    OPEN = "open"
    HALF_OPEN = "half_open"


class RequestMethod(Enum):
    """HTTP request methods"""
    GET = "GET"
    POST = "POST"
    PUT = "PUT"
    DELETE = "DELETE"
    PATCH = "PATCH"


@dataclass
class CircuitBreakerConfig:
    """Circuit breaker configuration"""
    failure_threshold: int = 5
    reset_timeout: int = 60  # seconds
    half_open_timeout: int = 30  # seconds
    success_threshold: int = 3  # successful calls needed to close circuit


@dataclass
class RetryConfig:
    """Retry configuration"""
    max_retries: int = 3
    backoff_factor: float = 2.0
    initial_delay: float = 1.0  # seconds
    max_delay: float = 30.0  # seconds
    retry_status_codes: List[int] = None
    
    def __post_init__(self):
        if self.retry_status_codes is None:
            self.retry_status_codes = [408, 429, 500, 502, 503, 504]


@dataclass
class TimeoutConfig:
    """Timeout configuration"""
    connection_timeout: float = 5.0  # seconds
    read_timeout: float = 30.0  # seconds
    total_timeout: float = 60.0  # seconds


class CircuitBreaker:
    """Circuit breaker implementation"""
    
    def __init__(self, name: str, config: CircuitBreakerConfig = None):
        self.name = name
        self.config = config or CircuitBreakerConfig()
        self.state = CircuitState.CLOSED
        self.failure_count = 0
        self.success_count = 0
        self.last_failure_time = None
        self.last_success_time = None
        self.lock = threading.Lock()
    
    def can_execute(self) -> bool:
        """Check if circuit breaker allows execution"""
        with self.lock:
            self._update_state()
            
            if self.state == CircuitState.OPEN:
                # Check if reset timeout has passed
                if self.last_failure_time:
                    time_since_failure = (timezone.now() - self.last_failure_time).total_seconds()
                    if time_since_failure > self.config.reset_timeout:
                        self.state = CircuitState.HALF_OPEN
                        logger.info(f"Circuit {self.name} moved to HALF_OPEN")
                    else:
                        return False
                
            elif self.state == CircuitState.HALF_OPEN:
                # Allow limited execution
                return True
                
            return True
    
    def on_success(self):
        """Record successful execution"""
        with self.lock:
            self.success_count += 1
            self.last_success_time = timezone.now()
            
            if self.state == CircuitState.HALF_OPEN:
                if self.success_count >= self.config.success_threshold:
                    self._reset()
                    logger.info(f"Circuit {self.name} reset to CLOSED after {self.success_count} successes")
            elif self.state == CircuitState.CLOSED:
                # Reset failure count on success streak
                if self.success_count >= 10:  # Reset after 10 consecutive successes
                    self.failure_count = 0
    
    def on_failure(self):
        """Record failed execution"""
        with self.lock:
            self.failure_count += 1
            self.last_failure_time = timezone.now()
            
            if self.failure_count >= self.config.failure_threshold:
                self.state = CircuitState.OPEN
                logger.error(
                    f"Circuit {self.name} OPENED after {self.failure_count} failures. "
                    f"Will reset in {self.config.reset_timeout}s"
                )
    
    def _update_state(self):
        """Update circuit state based on timers"""
        if self.state == CircuitState.HALF_OPEN:
            if self.last_success_time:
                time_since_success = (timezone.now() - self.last_success_time).total_seconds()
                if time_since_success > self.config.half_open_timeout:
                    self.state = CircuitState.OPEN
                    logger.warning(f"Circuit {self.name} timed out in HALF_OPEN state")
    
    def _reset(self):
        """Reset circuit breaker"""
        self.state = CircuitState.CLOSED
        self.failure_count = 0
        self.success_count = 0
        self.last_failure_time = None
    
    def get_status(self) -> Dict[str, Any]:
        """Get current circuit breaker status"""
        with self.lock:
            return {
                'name': self.name,
                'state': self.state.value,
                'failure_count': self.failure_count,
                'success_count': self.success_count,
                'last_failure': self.last_failure_time.isoformat() if self.last_failure_time else None,
                'last_success': self.last_success_time.isoformat() if self.last_success_time else None,
                'config': {
                    'failure_threshold': self.config.failure_threshold,
                    'reset_timeout': self.config.reset_timeout,
                    'success_threshold': self.config.success_threshold
                }
            }


class NetworkAdapter:
    """
    Production-ready adapter for network_management app integration.
    Implements circuit breaker, retry logic, and comprehensive error handling.
    """
    
    # Class-level configurations
    _circuit_breaker = CircuitBreaker("network_management", CircuitBreakerConfig())
    _retry_config = RetryConfig()
    _timeout_config = TimeoutConfig()
    
    # HTTP client with connection pooling
    _session = None
    
    @classmethod
    def _get_session(cls):
        """Get or create HTTP session with connection pooling"""
        if cls._session is None:
            cls._session = requests.Session()
            # Configure session for better performance
            adapter = requests.adapters.HTTPAdapter(
                pool_connections=100,
                pool_maxsize=100,
                max_retries=0  # We handle retries ourselves
            )
            cls._session.mount('http://', adapter)
            cls._session.mount('https://', adapter)
        return cls._session
    
    @classmethod
    def _make_request(
        cls,
        method: RequestMethod,
        endpoint: str,
        data: Optional[Dict] = None,
        params: Optional[Dict] = None,
        headers: Optional[Dict] = None,
        timeout: Optional[float] = None
    ) -> Tuple[bool, Optional[Dict], Optional[str], int]:
        """
        Make HTTP request with retry logic and circuit breaker
        
        Returns: (success, response_data, error_message, status_code)
        """
        # Check circuit breaker
        if not cls._circuit_breaker.can_execute():
            return False, None, f"Circuit breaker {cls._circuit_breaker.state.value}", 0
        
        # Prepare request
        session = cls._get_session()
        url = cls._build_url(endpoint)
        request_headers = cls._build_headers(headers)
        timeout_val = timeout or cls._timeout_config.read_timeout
        
        # Retry logic
        for attempt in range(cls._retry_config.max_retries + 1):
            try:
                # Calculate backoff delay
                if attempt > 0:
                    delay = min(
                        cls._retry_config.initial_delay * (cls._retry_config.backoff_factor ** (attempt - 1)),
                        cls._retry_config.max_delay
                    )
                    logger.info(f"Retry attempt {attempt}/{cls._retry_config.max_retries} after {delay:.1f}s")
                    time.sleep(delay)
                
                # Make request
                start_time = time.time()
                response = session.request(
                    method=method.value,
                    url=url,
                    json=data,
                    params=params,
                    headers=request_headers,
                    timeout=timeout_val,
                    verify=True  # Always verify SSL in production
                )
                elapsed_time = time.time() - start_time
                
                # Log request
                cls._log_request(method.value, url, response.status_code, elapsed_time)
                
                # Handle response
                if response.status_code == 200:
                    # Success
                    cls._circuit_breaker.on_success()
                    
                    try:
                        response_data = response.json()
                        return True, response_data, None, response.status_code
                    except json.JSONDecodeError:
                        logger.warning(f"Invalid JSON response from {url}")
                        return True, {'raw_response': response.text}, None, response.status_code
                
                elif response.status_code in cls._retry_config.retry_status_codes:
                    # Retry on server errors
                    logger.warning(f"Retryable error {response.status_code} from {url}: {response.text}")
                    if attempt == cls._retry_config.max_retries:
                        cls._circuit_breaker.on_failure()
                        return False, None, f"HTTP {response.status_code}: {response.text}", response.status_code
                    continue
                
                else:
                    # Non-retryable client error
                    cls._circuit_breaker.on_failure()
                    logger.error(f"Client error {response.status_code} from {url}: {response.text}")
                    return False, None, f"HTTP {response.status_code}: {response.text}", response.status_code
            
            except requests.exceptions.Timeout:
                logger.error(f"Request timeout to {url} (attempt {attempt + 1})")
                if attempt == cls._retry_config.max_retries:
                    cls._circuit_breaker.on_failure()
                    return False, None, "Request timeout", 0
            
            except requests.exceptions.ConnectionError:
                logger.error(f"Connection error to {url} (attempt {attempt + 1})")
                if attempt == cls._retry_config.max_retries:
                    cls._circuit_breaker.on_failure()
                    return False, None, "Connection error", 0
            
            except requests.exceptions.RequestException as e:
                logger.error(f"Request exception to {url}: {e}")
                if attempt == cls._retry_config.max_retries:
                    cls._circuit_breaker.on_failure()
                    return False, None, str(e), 0
        
        # Should not reach here
        return False, None, "Max retries exceeded", 0
    
    @staticmethod
    def _build_url(endpoint: str) -> str:
        """Build complete URL from endpoint"""
        base_url = getattr(
            settings, 
            'NETWORK_MANAGEMENT_BASE_URL', 
            'http://localhost:8000'
        ).rstrip('/')
        endpoint = endpoint.lstrip('/')
        return f"{base_url}/{endpoint}"
    
    @staticmethod
    def _build_headers(custom_headers: Optional[Dict] = None) -> Dict:
        """Build request headers"""
        headers = {
            'Content-Type': 'application/json',
            'User-Agent': 'ServiceOperations/1.0',
            'X-Request-ID': f"req-{int(time.time() * 1000)}",
            'X-Service': 'service_operations',
            'X-Timestamp': timezone.now().isoformat()
        }
        
        # Add authorization if configured
        api_token = getattr(settings, 'INTERNAL_API_TOKEN', None)
        if api_token:
            headers['Authorization'] = f'Bearer {api_token}'
        
        # Add custom headers
        if custom_headers:
            headers.update(custom_headers)
        
        return headers
    
    @staticmethod
    def _log_request(method: str, url: str, status_code: int, elapsed_time: float):
        """Log request details"""
        log_level = logging.INFO if status_code < 400 else logging.WARNING
        logger.log(
            log_level,
            f"NetworkManagement {method} {url} -> {status_code} ({elapsed_time:.3f}s)"
        )
    
    @staticmethod
    def _validate_activation_data(data: Dict[str, Any]) -> Tuple[bool, Optional[str]]:
        """Validate activation data"""
        required_fields = ['subscription_id', 'client_id', 'plan_id']
        
        for field in required_fields:
            if not data.get(field):
                return False, f"Missing required field: {field}"
        
        access_method = data.get('access_method')
        if access_method == 'hotspot' and not data.get('hotspot_mac_address'):
            return False, "Missing hotspot_mac_address for hotspot activation"
        elif access_method == 'pppoe' and not data.get('pppoe_username'):
            return False, "Missing pppoe_username for PPPoE activation"
        
        return True, None
    
    @classmethod
    def activate_subscription(cls, activation_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Activate subscription on network management system.
        
        Args:
            activation_data: Dictionary containing activation details
            
        Returns:
            Dictionary with activation result
        """
        logger.info(f"Activating subscription: {activation_data.get('subscription_id')}")
        
        # Validate data
        is_valid, error = cls._validate_activation_data(activation_data)
        if not is_valid:
            return {
                'success': False,
                'error': f"Invalid activation data: {error}",
                'timestamp': timezone.now().isoformat()
            }
        
        # Cache key for idempotency
        cache_key = f"activation_request:{activation_data.get('subscription_id')}"
        cached_response = cache.get(cache_key)
        
        if cached_response:
            logger.info(f"Returning cached activation response for {activation_data.get('subscription_id')}")
            return cached_response
        
        try:
            # Make activation request
            success, response_data, error, status_code = cls._make_request(
                method=RequestMethod.POST,
                endpoint="/api/network_management/routers/activate-user/",
                data=activation_data,
                timeout=cls._timeout_config.total_timeout
            )
            
            result = {
                'success': success,
                'timestamp': timezone.now().isoformat(),
                'subscription_id': activation_data.get('subscription_id'),
                'client_id': activation_data.get('client_id'),
                'plan_id': activation_data.get('plan_id'),
                'access_method': activation_data.get('access_method'),
                'status_code': status_code
            }
            
            if success:
                # Store activation_id from response
                activation_id = response_data.get('activation_id') or str(uuid.uuid4())
                result.update({
                    'activation_id': activation_id,
                    'message': response_data.get('message', 'Activation request accepted'),
                    'details': response_data,
                    'status': 'processing'
                })
                
                # Cache successful response for 5 minutes (idempotency)
                cache.set(cache_key, result, 300)
                
            else:
                result.update({
                    'error': error,
                    'status': 'failed',
                    'message': 'Activation request failed'
                })
                
                # Cache error response for 30 seconds (prevent rapid retries)
                cache.set(cache_key, result, 30)
            
            # Log activation attempt
            cls._log_activation(activation_data.get('subscription_id'), success, error)
            
            return result
            
        except Exception as e:
            logger.error(f"Unexpected error during activation: {e}", exc_info=True)
            return {
                'success': False,
                'error': f"Unexpected error: {str(e)}",
                'timestamp': timezone.now().isoformat(),
                'subscription_id': activation_data.get('subscription_id'),
                'status': 'error'
            }
    
    @classmethod
    def check_activation_status(cls, activation_id: str, subscription_id: str = None) -> Dict[str, Any]:
        """
        Check activation status.
        
        Args:
            activation_id: Activation tracking ID
            subscription_id: Optional subscription ID for additional validation
            
        Returns:
            Dictionary with activation status
        """
        logger.debug(f"Checking activation status: {activation_id}")
        
        try:
            success, response_data, error, status_code = cls._make_request(
                method=RequestMethod.GET,
                endpoint=f"/api/network_management/activations/{activation_id}/",
                timeout=cls._timeout_config.read_timeout
            )
            
            result = {
                'success': success,
                'activation_id': activation_id,
                'subscription_id': subscription_id,
                'timestamp': timezone.now().isoformat(),
                'status_code': status_code
            }
            
            if success:
                result.update({
                    'status': response_data.get('status', 'unknown'),
                    'details': response_data.get('details', {}),
                    'last_updated': response_data.get('last_updated'),
                    'message': response_data.get('message', 'Status retrieved')
                })
            else:
                result.update({
                    'error': error,
                    'status': 'status_check_failed',
                    'message': 'Failed to check activation status'
                })
            
            return result
            
        except Exception as e:
            logger.error(f"Error checking activation status: {e}")
            return {
                'success': False,
                'activation_id': activation_id,
                'error': str(e),
                'status': 'error',
                'timestamp': timezone.now().isoformat()
            }
    
    @classmethod
    def deactivate_subscription(cls, subscription_id: str, reason: str = "Cancelled") -> Dict[str, Any]:
        """
        Deactivate subscription on network.
        
        Args:
            subscription_id: Subscription ID to deactivate
            reason: Reason for deactivation
            
        Returns:
            Dictionary with deactivation result
        """
        logger.info(f"Deactivating subscription: {subscription_id}, reason: {reason}")
        
        try:
            # First find the activation details from cache or database
            # This would typically query your database
            activation_data = {
                'subscription_id': subscription_id,
                'reason': reason
            }
            
            success, response_data, error, status_code = cls._make_request(
                method=RequestMethod.POST,
                endpoint="/api/network_management/subscriptions/deactivate/",
                data=activation_data,
                timeout=cls._timeout_config.read_timeout
            )
            
            result = {
                'success': success,
                'subscription_id': subscription_id,
                'reason': reason,
                'timestamp': timezone.now().isoformat(),
                'status_code': status_code
            }
            
            if success:
                result.update({
                    'message': response_data.get('message', 'Deactivation successful'),
                    'details': response_data,
                    'deactivated_at': response_data.get('deactivated_at')
                })
                
                # Clear any cached activation data
                cache.delete(f"activation_request:{subscription_id}")
            else:
                result.update({
                    'error': error,
                    'message': 'Deactivation failed',
                    'status': 'deactivation_failed'
                })
            
            logger.info(f"Deactivation {'successful' if success else 'failed'} for {subscription_id}")
            return result
            
        except Exception as e:
            logger.error(f"Error deactivating subscription: {e}", exc_info=True)
            return {
                'success': False,
                'subscription_id': subscription_id,
                'error': str(e),
                'timestamp': timezone.now().isoformat()
            }
    
    @classmethod
    def update_usage(cls, subscription_id: str, usage_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Update subscription usage on network.
        
        Args:
            subscription_id: Subscription ID
            usage_data: Usage data dictionary
            
        Returns:
            Dictionary with update result
        """
        logger.debug(f"Updating usage for subscription: {subscription_id}")
        
        try:
            data = {
                'subscription_id': subscription_id,
                'usage_data': usage_data,
                'timestamp': timezone.now().isoformat()
            }
            
            success, response_data, error, status_code = cls._make_request(
                method=RequestMethod.POST,
                endpoint="/api/network_management/subscriptions/usage/",
                data=data,
                timeout=cls._timeout_config.read_timeout
            )
            
            result = {
                'success': success,
                'subscription_id': subscription_id,
                'timestamp': timezone.now().isoformat(),
                'status_code': status_code
            }
            
            if success:
                result.update({
                    'message': 'Usage updated successfully',
                    'details': response_data
                })
            else:
                result.update({
                    'error': error,
                    'message': 'Usage update failed'
                })
            
            return result
            
        except Exception as e:
            logger.error(f"Error updating usage: {e}")
            return {
                'success': False,
                'subscription_id': subscription_id,
                'error': str(e),
                'timestamp': timezone.now().isoformat()
            }
    
    @classmethod
    def health_check(cls) -> Dict[str, Any]:
        """
        Comprehensive health check for network management service.
        
        Returns:
            Dictionary with health status
        """
        logger.debug("Performing network management health check")
        
        try:
            start_time = time.time()
            success, response_data, error, status_code = cls._make_request(
                method=RequestMethod.GET,
                endpoint="/api/health/",
                timeout=cls._timeout_config.connection_timeout
            )
            elapsed_time = time.time() - start_time
            
            # Build health response
            health_data = {
                'service': 'network_management',
                'timestamp': timezone.now().isoformat(),
                'response_time_ms': round(elapsed_time * 1000, 2),
                'circuit_breaker': cls._circuit_breaker.get_status()
            }
            
            if success:
                health_data.update({
                    'status': response_data.get('status', 'unknown'),
                    'details': response_data,
                    'healthy': response_data.get('status') == 'healthy',
                    'message': response_data.get('message', 'Service responding')
                })
            else:
                health_data.update({
                    'status': 'unavailable',
                    'healthy': False,
                    'error': error,
                    'message': 'Service health check failed'
                })
            
            # Log health status
            if health_data['healthy']:
                logger.info(f"Network management health check passed: {elapsed_time:.3f}s")
            else:
                logger.warning(f"Network management health check failed: {error}")
            
            return health_data
            
        except Exception as e:
            logger.error(f"Health check failed: {e}")
            return {
                'service': 'network_management',
                'status': 'error',
                'healthy': False,
                'error': str(e),
                'timestamp': timezone.now().isoformat()
            }
    
    @classmethod
    def get_service_status(cls) -> Dict[str, Any]:
        """
        Get comprehensive service status including circuit breaker state.
        
        Returns:
            Dictionary with complete service status
        """
        # Perform health check
        health = cls.health_check()
        
        # Get performance metrics
        metrics = cls._get_performance_metrics()
        
        status = {
            'service': 'network_adapter',
            'timestamp': timezone.now().isoformat(),
            'health': health,
            'circuit_breaker': cls._circuit_breaker.get_status(),
            'performance': metrics,
            'configuration': {
                'base_url': getattr(settings, 'NETWORK_MANAGEMENT_BASE_URL', 'Not configured'),
                'timeouts': {
                    'connection': cls._timeout_config.connection_timeout,
                    'read': cls._timeout_config.read_timeout,
                    'total': cls._timeout_config.total_timeout
                },
                'retry': {
                    'max_retries': cls._retry_config.max_retries,
                    'backoff_factor': cls._retry_config.backoff_factor,
                    'max_delay': cls._retry_config.max_delay
                }
            }
        }
        
        # Determine overall status
        if health.get('healthy') and cls._circuit_breaker.state == CircuitState.CLOSED:
            status['overall_status'] = 'healthy'
        elif cls._circuit_breaker.state == CircuitState.OPEN:
            status['overall_status'] = 'unavailable'
        else:
            status['overall_status'] = 'degraded'
        
        return status
    
    @classmethod
    def _log_activation(cls, subscription_id: str, success: bool, error: str = None):
        """Log activation attempt"""
        log_data = {
            'subscription_id': subscription_id,
            'success': success,
            'error': error,
            'timestamp': timezone.now().isoformat(),
            'circuit_state': cls._circuit_breaker.state.value
        }
        
        if success:
            logger.info(f"Activation logged: {log_data}")
        else:
            logger.error(f"Activation failed: {log_data}")
    
    @classmethod
    def _get_performance_metrics(cls) -> Dict[str, Any]:
        """Get performance metrics (simplified - in production would use monitoring system)"""
        # This would typically connect to your metrics system (Prometheus, StatsD, etc.)
        return {
            'requests_total': 'Not implemented',  # Would be actual metric
            'error_rate': 'Not implemented',
            'average_response_time': 'Not implemented',
            'circuit_breaker_transitions': 'Not implemented'
        }
    
    @classmethod
    def reset_circuit_breaker(cls):
        """Manually reset circuit breaker (for admin operations)"""
        cls._circuit_breaker._reset()
        logger.warning("Circuit breaker manually reset")
    
    @classmethod
    def close_session(cls):
        """Close HTTP session (call during shutdown)"""
        if cls._session:
            cls._session.close()
            cls._session = None
            logger.info("Network adapter session closed")


# Utility function for backward compatibility
def network_adapter():
    """Factory function for backward compatibility"""
    return NetworkAdapter