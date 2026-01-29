"""
Service Operations - User Management Adapter
Production-ready adapter for User Management & Authentication app integration
Enhanced with circuit breaker patterns, signal emissions, and robust error handling
Fully integrated with Service Operations architecture
"""
import logging
import requests
import uuid as uuid_module
import hashlib
import hmac
import json
import re
import threading
import time
from typing import Dict, Optional, Any, List, Tuple
from datetime import datetime, timedelta

from django.conf import settings
from django.utils import timezone
from django.core.cache import cache
from django.db import transaction
from django.db.models import Q, Count

from service_operations.models import Subscription, ClientOperation, OperationLog, ActivationQueue
from service_operations.services.subscription_service import SubscriptionService
from service_operations.services.activation_service import ActivationService
from service_operations.signals.operation_signals import subscription_created, subscription_activated, subscription_renewed
from service_operations.utils.validators import validate_mac_address, validate_duration_hours
from service_operations.utils.calculators import format_bytes_human_readable

logger = logging.getLogger(__name__)


class CircuitBreaker:
    """Enhanced circuit breaker pattern with thread safety"""
    
    def __init__(self, name: str, failure_threshold: int = 5, reset_timeout: int = 300):
        self.name = name
        self.failure_threshold = failure_threshold
        self.reset_timeout = reset_timeout
        self.failure_count = 0
        self.is_open = False
        self.last_failure_time = None
        self.last_reset_time = timezone.now()
        self._lock = threading.Lock()
        self.half_open_attempts = 0
        self.half_open_max_attempts = 3
    
    def can_execute(self) -> bool:
        """Check if circuit is closed or should be reset with thread safety"""
        with self._lock:
            if not self.is_open:
                return True
            
            # Check if reset timeout has passed
            if self.last_failure_time:
                time_open = (timezone.now() - self.last_failure_time).total_seconds()
                if time_open >= self.reset_timeout:
                    # Move to half-open state
                    self.is_open = False
                    self.half_open_attempts = 0
                    logger.info(f"Circuit breaker {self.name} moved to half-open state")
                    return True
            
            return False
    
    def record_failure(self):
        """Record a failure and open circuit if threshold reached"""
        with self._lock:
            self.failure_count += 1
            self.last_failure_time = timezone.now()
            
            if self.half_open_attempts > 0:
                # Failed in half-open state, reopen circuit
                self.is_open = True
                self.half_open_attempts = 0
                logger.error(f"Circuit breaker {self.name} reopened after half-open failure")
            elif self.failure_count >= self.failure_threshold:
                self.is_open = True
                logger.error(f"Circuit breaker {self.name} opened after {self.failure_count} failures")
    
    def record_success(self):
        """Record a success and reset failure count"""
        with self._lock:
            if self.is_open:
                logger.debug(f"Circuit breaker {self.name} success while open")
                return
            
            self.failure_count = 0
            self.last_failure_time = None
            self.is_open = False
            self.half_open_attempts = 0
            self.last_reset_time = timezone.now()
            logger.debug(f"Circuit breaker {self.name} record success")
    
    def reset(self):
        """Manually reset the circuit breaker"""
        with self._lock:
            self.failure_count = 0
            self.is_open = False
            self.half_open_attempts = 0
            self.last_failure_time = None
            self.last_reset_time = timezone.now()
            logger.info(f"Circuit breaker {self.name} manually reset")
    
    def get_state(self) -> Dict[str, Any]:
        """Get circuit breaker state for monitoring"""
        return {
            'name': self.name,
            'is_open': self.is_open,
            'failure_count': self.failure_count,
            'failure_threshold': self.failure_threshold,
            'last_failure_time': self.last_failure_time.isoformat() if self.last_failure_time else None,
            'last_reset_time': self.last_reset_time.isoformat(),
            'half_open_attempts': self.half_open_attempts
        }


class UserManagementAdapter:
    """
    Enhanced User Management adapter with Service Operations integration patterns
    """
    
    # Configuration from settings
    BASE_URL = getattr(settings, 'USER_MANAGEMENT_BASE_URL', 'http://localhost:8000')
    API_PREFIX = '/api/user-management/'
    API_TIMEOUT = getattr(settings, 'USER_MANAGEMENT_API_TIMEOUT', 30)
    CACHE_TIMEOUT = getattr(settings, 'USER_MANAGEMENT_CACHE_TIMEOUT', 300)
    MAX_RETRIES = 3
    RETRY_DELAYS = [1, 5, 30]  # Exponential backoff
    
    # Circuit breaker instances
    _circuit_breakers = {
        'user_management': CircuitBreaker('user_management'),
        'client_details': CircuitBreaker('client_details'),
        'sms': CircuitBreaker('sms'),
    }
    
    # Rate limiting state
    _rate_limits = {}
    _rate_limit_lock = threading.Lock()
    
    # Class-level activation concurrency limit
    MAX_CONCURRENT_REQUESTS = 10
    _active_requests = 0
    _request_lock = threading.Lock()
    
    @classmethod
    def _check_circuit_breaker(cls, service: str = 'user_management') -> Tuple[bool, Optional[str]]:
        """Check circuit breaker state with thread safety"""
        circuit_breaker = cls._circuit_breakers.get(service, cls._circuit_breakers['user_management'])
        
        if not circuit_breaker.can_execute():
            return False, f"Circuit breaker {service} is open"
        
        return True, None
    
    @classmethod
    def _check_concurrent_limit(cls) -> bool:
        """Check concurrent request limit"""
        with cls._request_lock:
            if cls._active_requests < cls.MAX_CONCURRENT_REQUESTS:
                cls._active_requests += 1
                return True
            return False
    
    @classmethod
    def _release_request_slot(cls):
        """Release request slot"""
        with cls._request_lock:
            if cls._active_requests > 0:
                cls._active_requests -= 1
    
    @classmethod
    def _get_auth_headers(cls, service: str = 'user_management') -> Dict[str, str]:
        """Generate authentication headers for different services"""
        api_token = cls._get_api_token()
        
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {api_token}',
            'X-Service': 'service_operations',
            'X-Request-ID': cls._generate_request_id(),
            'X-Timestamp': str(int(timezone.now().timestamp())),
            'X-Caller': 'service_operations',
            'X-Version': '1.0',
        }
        
        # Add signature for sensitive operations
        if hasattr(settings, 'INTERNAL_API_SECRET'):
            signature = cls._generate_signature('service_operations', headers['X-Timestamp'])
            headers['X-Signature'] = signature
        
        # Service-specific headers
        if service == 'sms':
            headers['X-Priority'] = 'normal'
        
        return headers
    
    @classmethod
    def _make_request_with_retry(cls, method: str, url: str, service: str = 'user_management', **kwargs) -> Optional[requests.Response]:
        """
        Make HTTP request with circuit breaker, retry logic, and exponential backoff
        """
        # Check circuit breaker
        circuit_ok, circuit_error = cls._check_circuit_breaker(service)
        if not circuit_ok:
            logger.warning(f"Circuit blocked: {circuit_error} for {url}")
            return None
        
        # Check concurrent limit
        if not cls._check_concurrent_limit():
            logger.warning(f"Concurrent limit reached for {service}, request blocked: {url}")
            return None
        
        # Check rate limit
        rate_key = f"rate:{service}:{method}:{url}"
        if not cls._check_rate_limit(rate_key):
            logger.warning(f"Rate limit exceeded for {rate_key}")
            cls._release_request_slot()
            return None
        
        circuit_breaker = cls._circuit_breakers.get(service, cls._circuit_breakers['user_management'])
        
        for attempt in range(cls.MAX_RETRIES):
            try:
                # Add default headers if not provided
                if 'headers' not in kwargs:
                    kwargs['headers'] = cls._get_auth_headers(service)
                
                # Add timeout if not provided
                if 'timeout' not in kwargs:
                    kwargs['timeout'] = cls.API_TIMEOUT
                
                # Add request ID to metadata
                request_id = kwargs['headers'].get('X-Request-ID', cls._generate_request_id())
                
                # Make request
                start_time = timezone.now()
                logger.debug(f"Request attempt {attempt + 1}/{cls.MAX_RETRIES}: {method} {url}")
                
                response = requests.request(method, url, **kwargs)
                duration = (timezone.now() - start_time).total_seconds()
                
                # Log request
                logger.debug(f"Request {method} {url} - Status: {response.status_code} - Duration: {duration:.2f}s")
                
                if response.status_code < 500:  # Only 5xx errors affect circuit breaker
                    circuit_breaker.record_success()
                    cls._update_rate_limit(rate_key, success=True)
                    cls._release_request_slot()
                    
                    # Log operation
                    OperationLog.log_operation(
                        operation_type='external_api_call',
                        severity='info',
                        description=f"API call to {service} succeeded",
                        details={
                            'url': url,
                            'method': method,
                            'status_code': response.status_code,
                            'duration_seconds': duration,
                            'attempt': attempt + 1,
                            'request_id': request_id
                        },
                        source_module='user_management_adapter',
                        source_function='_make_request_with_retry'
                    )
                    
                    return response
                else:
                    # 5xx error - record failure
                    if attempt == cls.MAX_RETRIES - 1:  # Last attempt failed
                        circuit_breaker.record_failure()
                        cls._update_rate_limit(rate_key, success=False)
                        
                        OperationLog.log_operation(
                            operation_type='external_api_call_failed',
                            severity='error',
                            description=f"API call to {service} failed after {cls.MAX_RETRIES} attempts",
                            details={
                                'url': url,
                                'method': method,
                                'status_code': response.status_code,
                                'duration_seconds': duration,
                                'response_body': response.text[:500]
                            },
                            source_module='user_management_adapter',
                            source_function='_make_request_with_retry'
                        )
                    
                    # Exponential backoff before retry
                    if attempt < cls.MAX_RETRIES - 1:
                        delay = cls.RETRY_DELAYS[attempt]
                        logger.info(f"Retrying request in {delay}s (attempt {attempt + 1}/{cls.MAX_RETRIES})")
                        time.sleep(delay)
                        
            except requests.exceptions.Timeout:
                logger.error(f"Request timeout on attempt {attempt + 1}: {url}")
                if attempt == cls.MAX_RETRIES - 1:
                    circuit_breaker.record_failure()
                    cls._update_rate_limit(rate_key, success=False)
                    
            except requests.exceptions.ConnectionError:
                logger.error(f"Connection error on attempt {attempt + 1}: {url}")
                if attempt == cls.MAX_RETRIES - 1:
                    circuit_breaker.record_failure()
                    cls._update_rate_limit(rate_key, success=False)
                    
            except Exception as e:
                logger.error(f"Request failed on attempt {attempt + 1} for {url}: {str(e)}")
                if attempt == cls.MAX_RETRIES - 1:
                    circuit_breaker.record_failure()
                    cls._update_rate_limit(rate_key, success=False)
        
        cls._release_request_slot()
        return None
    
    @classmethod
    def get_client_details(cls, client_identifier: str, include_sensitive: bool = False) -> Optional[Dict[str, Any]]:
        """
        Get comprehensive client details from User Management app with caching
        """
        cache_key = f"client_details:{client_identifier}:{include_sensitive}"
        
        # Return cached if available
        cached_details = cache.get(cache_key)
        if cached_details:
            logger.debug(f"Returning cached client details for {client_identifier}")
            return cached_details
        
        # Check circuit breaker
        circuit_ok, circuit_error = cls._check_circuit_breaker('client_details')
        if not circuit_ok:
            logger.warning(f"Circuit blocked for client details: {circuit_error}")
            return None
        
        try:
            # Try to get client by ID first
            try:
                # Check if it's a UUID
                uuid_obj = uuid_module.UUID(client_identifier)
                endpoint = f"{cls.BASE_URL}{cls.API_PREFIX}clients/{client_identifier}/"
                response = cls._make_request_with_retry('GET', endpoint, service='client_details')
                
                if response and response.status_code == 200:
                    client_data = response.json()
                    
                    # Enrich with Service Operations data
                    enriched_data = cls._enrich_client_data(client_data)
                    
                    # Cache the result
                    cache.set(cache_key, enriched_data, cls.CACHE_TIMEOUT)
                    
                    logger.info(f"Retrieved client details for {client_identifier}")
                    return enriched_data
                    
            except ValueError:
                # Not a UUID, search by phone
                endpoint = f"{cls.BASE_URL}{cls.API_PREFIX}clients/search_by_phone/?phone={client_identifier}"
                response = cls._make_request_with_retry('GET', endpoint, service='client_details')
                
                if response and response.status_code == 200:
                    result = response.json()
                    
                    if result.get('success') and result.get('exists'):
                        # Get business profile or user data
                        if result.get('business_profile'):
                            client_data = result['business_profile']
                        else:
                            # Get full client details using the user ID
                            user_id = result['user']['id']
                            endpoint = f"{cls.BASE_URL}{cls.API_PREFIX}clients/{user_id}/"
                            client_response = cls._make_request_with_retry('GET', endpoint, service='client_details')
                            
                            if client_response and client_response.status_code == 200:
                                client_data = client_response.json()
                            else:
                                # Cache not found for 1 minute
                                cache.set(cache_key, None, 60)
                                return None
                        
                        # Enrich with Service Operations data
                        enriched_data = cls._enrich_client_data(client_data)
                        
                        # Cache the result
                        cache.set(cache_key, enriched_data, cls.CACHE_TIMEOUT)
                        
                        logger.info(f"Retrieved client details for {client_identifier}")
                        return enriched_data
            
            # Client not found
            logger.warning(f"Client not found: {client_identifier}")
            cache.set(cache_key, None, 60)  # 1 minute cache for not found
            return None
                
        except Exception as e:
            logger.error(f"Error getting client details for {client_identifier}: {e}")
            
            OperationLog.log_operation(
                operation_type='client_details_error',
                severity='error',
                description=f"Failed to get client details for {client_identifier}",
                details={'client_identifier': client_identifier, 'error': str(e)},
                source_module='user_management_adapter',
                source_function='get_client_details'
            )
            
            return None
    
    @classmethod
    def _enrich_client_data(cls, client_data: Dict[str, Any]) -> Dict[str, Any]:
        """Enrich client data with additional Service Operations information"""
        try:
            client_id = client_data.get('id') or client_data.get('client_id')
            if not client_id:
                return client_data
            
            # Add subscription information
            subscription_data = cls._get_client_subscription_data(client_id)
            if subscription_data:
                client_data['subscription_status'] = subscription_data
            
            # Add analytics
            analytics_data = cls._get_client_analytics_data(client_id)
            if analytics_data:
                client_data['analytics'] = analytics_data
            
            # Add derived fields
            client_data['is_eligible_for_service'] = cls._check_eligibility(client_data)
            client_data['last_activity'] = cls._get_last_activity(client_data)
            
            # Add Service Operations specific data
            client_data['service_operations'] = {
                'has_active_subscription': subscription_data.get('has_active_subscription', False) if subscription_data else False,
                'subscription_count': Subscription.objects.filter(client_id=client_id, is_active=True).count(),
                'total_data_used': sum(sub.used_data_bytes for sub in Subscription.objects.filter(client_id=client_id, is_active=True)),
                'total_data_used_display': format_bytes_human_readable(
                    sum(sub.used_data_bytes for sub in Subscription.objects.filter(client_id=client_id, is_active=True))
                )
            }
            
            return client_data
            
        except Exception as e:
            logger.error(f"Error enriching client data: {e}")
            return client_data
    
    @classmethod
    def _get_client_subscription_data(cls, client_id: str) -> Optional[Dict[str, Any]]:
        """Get client's subscription status using SubscriptionService"""
        cache_key = f"client_subscription_data:{client_id}"
        cached = cache.get(cache_key)
        
        if cached:
            return cached
        
        try:
            # Get subscription details using SubscriptionService
            subscription_result = SubscriptionService.get_subscriptions_for_client(
                client_id=client_id,
                active_only=True
            )
            
            if subscription_result.get('success'):
                subscriptions = subscription_result.get('subscriptions', [])
                
                subscription_status = {
                    'has_active_subscription': len(subscriptions) > 0,
                    'active_subscriptions': subscriptions,
                    'subscription_count': len(subscriptions),
                    'data_used': sum(sub.get('used_data_bytes', 0) for sub in subscriptions),
                    'data_limit': sum(sub.get('data_limit_bytes', 0) for sub in subscriptions)
                }
                
                # Calculate percentage used
                if subscription_status['data_limit'] > 0:
                    subscription_status['percentage_used'] = (
                        subscription_status['data_used'] / subscription_status['data_limit'] * 100
                    )
                else:
                    subscription_status['percentage_used'] = 0
                
                cache.set(cache_key, subscription_status, 300)  # 5 minutes
                return subscription_status
            
            return None
            
        except Exception as e:
            logger.error(f"Error getting subscription data for {client_id}: {e}")
            return None
    
    @classmethod
    def create_subscription_for_client(
        cls,
        client_id: str,
        plan_id: str,
        client_type: str,
        duration_hours: int = 24,
        access_method: str = 'hotspot',
        hotspot_mac_address: Optional[str] = None,
        router_id: Optional[int] = None,
        auto_renew: bool = False,
        created_by: str = 'user_management_adapter'
    ) -> Dict[str, Any]:
        """
        Create a new subscription for a client using SubscriptionService
        """
        try:
          
            from service_operations.services.client_service import ClientService
            # Validate inputs
            if not validate_duration_hours(duration_hours):
                return {
                    'success': False,
                    'error': f'Invalid duration: {duration_hours} hours. Must be between 1 and 744 hours'
                }
            
            if client_type == 'hotspot_client' and hotspot_mac_address:
                if not validate_mac_address(hotspot_mac_address):
                    return {
                        'success': False,
                        'error': 'Invalid MAC address format'
                    }
            
            # Create subscription using SubscriptionService
            subscription_result = SubscriptionService.create_subscription(
                client_id=client_id,
                internet_plan_id=plan_id,
                client_type=client_type,
                access_method=access_method,
                duration_hours=duration_hours,
                router_id=router_id,
                hotspot_mac_address=hotspot_mac_address,
                auto_renew=auto_renew,
                metadata={
                    'created_by': created_by,
                    'source': 'user_management_adapter',
                    'client_type': client_type
                },
                created_by=created_by
            )
            
            if subscription_result.get('success'):
                subscription_id = subscription_result['subscription_id']
                
                # Create client operation record
                ClientService.create_client_operation_record(
                    client_id=client_id,
                    operation_type='subscription_creation',
                    title=f'Subscription Created - {plan_id}',
                    description=f'New subscription created via User Management adapter',
                    client_type=client_type,
                    subscription_id=subscription_id,
                    priority=2,
                    source_platform='system',
                    sla_hours=24,
                    metadata={
                        'plan_id': plan_id,
                        'duration_hours': duration_hours,
                        'auto_renew': auto_renew,
                        'created_by': created_by
                    }
                )
                
                # Emit signal
                subscription_created.send(
                    sender=UserManagementAdapter,
                    subscription_id=subscription_id,
                    client_id=client_id,
                    internet_plan_id=plan_id,
                    client_type=client_type,
                    status='draft',
                    timestamp=timezone.now()
                )
                
                logger.info(f"Subscription created for client {client_id}: {subscription_id}")
                
                return {
                    'success': True,
                    'subscription_id': subscription_id,
                    'subscription': subscription_result.get('subscription'),
                    'message': 'Subscription created successfully'
                }
            else:
                return {
                    'success': False,
                    'error': subscription_result.get('error', 'Unknown error'),
                    'details': subscription_result.get('details')
                }
            
        except Exception as e:
            logger.error(f"Error creating subscription for client {client_id}: {e}", exc_info=True)
            
            OperationLog.log_operation(
                operation_type='subscription_creation_error',
                severity='error',
                description=f"Failed to create subscription for client {client_id}",
                details={
                    'client_id': client_id,
                    'plan_id': plan_id,
                    'client_type': client_type,
                    'error': str(e)
                },
                source_module='user_management_adapter',
                source_function='create_subscription_for_client'
            )
            
            return {
                'success': False,
                'error': f'Failed to create subscription: {str(e)}'
            }
    
    @classmethod
    def activate_client_subscription(
        cls,
        subscription_id: str,
        payment_reference: str,
        payment_method: str = 'api_payment',
        activate_immediately: bool = True,
        priority: int = 4
    ) -> Dict[str, Any]:
        """
        Activate a client's subscription using SubscriptionService
        """
        try:

            from service_operations.services.client_service import ClientService
            # Get subscription
            try:
                subscription = Subscription.objects.get(id=subscription_id, is_active=True)
            except Subscription.DoesNotExist:
                return {
                    'success': False,
                    'error': f'Subscription {subscription_id} not found'
                }
            
            # Activate using SubscriptionService
            activation_result = SubscriptionService.activate_subscription(
                subscription_id=subscription_id,
                payment_reference=payment_reference,
                payment_method=payment_method,
                activate_immediately=activate_immediately,
                priority=priority
            )
            
            if activation_result.get('success'):
                # Create client operation
                ClientService.create_client_operation_record(
                    client_id=str(subscription.client_id),
                    operation_type='subscription_activation',
                    title=f'Subscription Activated - {payment_reference}',
                    description=f'Subscription activated via User Management adapter',
                    client_type=subscription.client_type,
                    subscription_id=subscription_id,
                    priority=3,
                    source_platform='system',
                    sla_hours=1,
                    metadata={
                        'payment_reference': payment_reference,
                        'payment_method': payment_method,
                        'priority': priority
                    }
                )
                
                # Emit signal if activated
                if activate_immediately:
                    subscription_activated.send(
                        sender=UserManagementAdapter,
                        subscription_id=subscription_id,
                        client_id=str(subscription.client_id),
                        internet_plan_id=str(subscription.internet_plan_id),
                        client_type=subscription.client_type,
                        router_id=subscription.router_id,
                        timestamp=timezone.now()
                    )
                
                logger.info(f"Subscription activated: {subscription_id}")
                
                return {
                    'success': True,
                    'subscription_id': subscription_id,
                    'status': activation_result.get('status'),
                    'activation_requested': activate_immediately,
                    'payment_verified': True,
                    'message': 'Subscription activated successfully'
                }
            else:
                return {
                    'success': False,
                    'error': activation_result.get('error', 'Unknown error')
                }
            
        except Exception as e:
            logger.error(f"Error activating subscription {subscription_id}: {e}", exc_info=True)
            
            OperationLog.log_operation(
                operation_type='subscription_activation_error',
                severity='error',
                subscription_id=subscription_id,
                description=f"Failed to activate subscription",
                details={
                    'subscription_id': subscription_id,
                    'payment_reference': payment_reference,
                    'error': str(e)
                },
                source_module='user_management_adapter',
                source_function='activate_client_subscription'
            )
            
            return {
                'success': False,
                'error': f'Failed to activate subscription: {str(e)}'
            }
    
    @classmethod
    def process_service_activation(cls, client_identifier: str, service_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process service activation for Service Operations with comprehensive validation
        """
        try:
            
            from service_operations.services.client_service import ClientService
            # Validate service data
            if not service_data.get('plan_id'):
                return {
                    'success': False,
                    'message': 'Plan ID is required',
                    'client_identifier': client_identifier
                }
            
            # Get or validate client
            client_details = None
            is_new_client = False
            
            if cls._looks_like_phone(client_identifier):
                # Check if client exists by phone
                client_details = cls.get_client_details(client_identifier)
                
                if not client_details:
                    # Try to create client via User Management API
                    phone_response = cls._create_client_via_api(client_identifier, service_data)
                    if phone_response.get('success'):
                        client_details = phone_response.get('client')
                        is_new_client = True
                    else:
                        return {
                            'success': False,
                            'message': f'Failed to create client: {phone_response.get("error")}',
                            'client_identifier': client_identifier
                        }
            else:
                # Assume it's a client ID or username
                client_details = cls.get_client_details(client_identifier)
            
            if not client_details:
                return {
                    'success': False,
                    'message': 'Client not found',
                    'client_identifier': client_identifier
                }
            
            client_id = client_details.get('id') or client_details.get('client_id')
            
            # Determine client type and access method
            client_type = service_data.get('client_type', 'hotspot_client')
            access_method = 'hotspot' if client_type == 'hotspot_client' else 'pppoe'
            
            # Check service availability
            availability = ClientService.check_service_availability(
                client_id=client_id,
                client_type=client_type,
                plan_id=service_data.get('plan_id'),
                hotspot_mac_address=service_data.get('hotspot_mac_address'),
                router_id=service_data.get('router_id')
            )
            
            if not availability.get('available'):
                return {
                    'success': False,
                    'message': 'Service not available for client',
                    'client': {'id': client_id},
                    'availability': availability,
                    'required_actions': availability.get('reasons', [])
                }
            
            # Create subscription
            subscription_result = cls.create_subscription_for_client(
                client_id=client_id,
                plan_id=service_data['plan_id'],
                client_type=client_type,
                duration_hours=service_data.get('duration_hours', 24),
                access_method=access_method,
                hotspot_mac_address=service_data.get('hotspot_mac_address'),
                router_id=service_data.get('router_id'),
                auto_renew=service_data.get('auto_renew', False),
                created_by='service_activation_process'
            )
            
            if not subscription_result.get('success'):
                return {
                    'success': False,
                    'message': f'Failed to create subscription: {subscription_result.get("error")}',
                    'client': {'id': client_id}
                }
            
            subscription_id = subscription_result['subscription_id']
            
            # Send welcome notification if new client
            if is_new_client:
                cls.send_client_notification(
                    client_id,
                    'welcome',
                    {
                        'service_type': service_data.get('service_type', 'internet service'),
                        'plan_name': service_data.get('plan_name', ''),
                        'activation_date': timezone.now().isoformat()
                    }
                )
            
            # Create comprehensive activation response
            activation_response = {
                'success': True,
                'message': 'Activation request processed successfully',
                'client': {
                    'id': client_id,
                    'is_new_client': is_new_client,
                    'username': client_details.get('username'),
                    'phone_number': client_details.get('phone_number')
                },
                'subscription': {
                    'id': subscription_id,
                    'status': 'draft',
                    'plan_id': service_data['plan_id'],
                    'client_type': client_type,
                    'access_method': access_method
                },
                'activation_data': {
                    'client_id': client_id,
                    'subscription_id': subscription_id,
                    'plan_id': service_data['plan_id'],
                    'plan_name': service_data.get('plan_name'),
                    'activation_timestamp': timezone.now().isoformat(),
                    'status': 'pending_payment'
                },
                'next_steps': ['process_payment', 'activate_subscription']
            }
            
            logger.info(f"Service activation processed for client {client_id}, subscription {subscription_id}")
            
            return activation_response
            
        except Exception as e:
            logger.error(f"Error processing activation request: {e}", exc_info=True)
            
            OperationLog.log_operation(
                operation_type='service_activation_error',
                severity='error',
                description=f"Failed to process service activation for {client_identifier}",
                details={
                    'client_identifier': client_identifier,
                    'service_data': service_data,
                    'error': str(e)
                },
                source_module='user_management_adapter',
                source_function='process_service_activation'
            )
            
            return {
                'success': False,
                'message': f'Activation processing failed: {str(e)}',
                'client_identifier': client_identifier
            }
    
    @classmethod
    def _create_client_via_api(cls, phone_number: str, service_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create client via User Management API"""
        try:
            normalized_phone = cls._normalize_phone(phone_number)
            if not normalized_phone:
                return {
                    'success': False,
                    'error': 'Invalid phone number format'
                }
            
            # Prepare client data
            client_type = service_data.get('client_type', 'hotspot_client')
            access_method = 'hotspot' if client_type == 'hotspot_client' else 'pppoe'
            
            client_data = {
                'phone_number': normalized_phone,
                'name': service_data.get('name', ''),
                'client_type': client_type,
                'access_method': access_method,
                'location': service_data.get('location', ''),
                'send_welcome_sms': True
            }
            
            # Make API call
            endpoint = f"{cls.BASE_URL}{cls.API_PREFIX}clients/create/"
            response = cls._make_request_with_retry('POST', endpoint, service='user_management', json=client_data)
            
            if response and response.status_code == 201:
                result = response.json()
                
                if result.get('success'):
                    client_info = result.get('client', {})
                    
                    return {
                        'success': True,
                        'client': {
                            'id': client_info.get('id'),
                            'username': client_info.get('username'),
                            'phone_number': normalized_phone,
                            'client_type': client_type,
                            'access_method': access_method,
                            'created_at': timezone.now().isoformat()
                        }
                    }
                else:
                    return {
                        'success': False,
                        'error': result.get('error', 'Unknown error')
                    }
            
            return {
                'success': False,
                'error': 'Failed to create client via API'
            }
            
        except Exception as e:
            logger.error(f"Error creating client via API: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    @classmethod
    def check_client_eligibility(cls, client_identifier: str, service_type: str = None, plan_data: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Check if client is eligible for a service/plan with comprehensive validation
        """
        cache_key = f"client_eligibility:{client_identifier}:{service_type}"
        if plan_data:
            cache_key += f":{hash(str(plan_data))}"
        
        cached = cache.get(cache_key)
        if cached:
            return cached
        
        try:
            # Get client details
            client_details = cls.get_client_details(client_identifier)
            if not client_details:
                return {
                    'eligible': False,
                    'reason': 'Client not found',
                    'client_identifier': client_identifier,
                    'service_type': service_type,
                    'checks': [],
                    'client_details': None
                }
            
            # Initialize result
            result = {
                'eligible': True,
                'client_id': client_details.get('id') or client_details.get('client_id'),
                'client_name': client_details.get('username'),
                'service_type': service_type,
                'checks': [],
                'restrictions': [],
                'required_actions': [],
                'client_details': client_details,
                'timestamp': timezone.now().isoformat()
            }
            
            # Check 1: Is client active?
            is_active = client_details.get('is_active', False)
            if not is_active:
                result['eligible'] = False
                result['checks'].append({
                    'check': 'client_active',
                    'passed': False,
                    'reason': 'Client account is not active'
                })
            
            # Check 2: Account status
            account_status = client_details.get('status', 'active')
            if account_status == 'suspended':
                result['eligible'] = False
                result['checks'].append({
                    'check': 'account_status',
                    'passed': False,
                    'reason': 'Account is suspended'
                })
            elif account_status == 'inactive':
                result['checks'].append({
                    'check': 'account_status',
                    'passed': False,
                    'reason': 'Account is inactive'
                })
                result['required_actions'].append('activate_account')
            
            # Check 3: Service type compatibility
            if service_type:
                client_connection = client_details.get('connection_type', 'hotspot')
                
                if service_type == 'pppoe' and client_connection != 'pppoe':
                    result['checks'].append({
                        'check': 'service_type_compatibility',
                        'passed': False,
                        'reason': f'Client is {client_connection}, not pppoe'
                    })
                    result['required_actions'].append('convert_to_pppoe')
            
            # Check 4: Risk status
            if client_details.get('is_at_risk', False):
                result['checks'].append({
                    'check': 'risk_status',
                    'passed': False,
                    'reason': 'Client is at high risk of churn'
                })
                result['restrictions'].append('Client requires retention attention')
            
            # Check 5: Payment history (if available)
            days_since_last_payment = client_details.get('days_since_last_payment', 0)
            if days_since_last_payment > 30:
                result['eligible'] = False
                result['checks'].append({
                    'check': 'payment_history',
                    'passed': False,
                    'reason': f'No payment for {days_since_last_payment} days'
                })
                result['required_actions'].append('clear_outstanding_payment')
            elif days_since_last_payment > 14:
                result['checks'].append({
                    'check': 'payment_history',
                    'passed': True,
                    'reason': f'Last payment {days_since_last_payment} days ago'
                })
                result['required_actions'].append('payment_reminder')
            
            # Check 6: Plan compatibility (if plan data provided)
            if plan_data:
                plan_compatibility = cls._check_plan_compatibility(client_details, plan_data)
                if not plan_compatibility.get('compatible', True):
                    result['eligible'] = False
                    result['checks'].append({
                        'check': 'plan_compatibility',
                        'passed': False,
                        'reason': plan_compatibility.get('reason', 'Plan not compatible')
                    })
                    result['restrictions'].extend(plan_compatibility.get('restrictions', []))
            
            # Add successful checks
            successful_checks = ['client_found', 'basic_validation', 'service_operations_integration']
            for check_name in successful_checks:
                result['checks'].append({
                    'check': check_name,
                    'passed': True,
                    'reason': 'Check passed successfully'
                })
            
            # Cache result (5 minutes)
            cache.set(cache_key, result, 300)
            
            return result
            
        except Exception as e:
            logger.error(f"Error checking eligibility for client {client_identifier}: {e}")
            
            return {
                'eligible': False,
                'reason': f'Error checking eligibility: {str(e)}',
                'client_identifier': client_identifier,
                'service_type': service_type,
                'checks': [],
                'timestamp': timezone.now().isoformat()
            }
    
    @classmethod
    def health_check(cls) -> Dict[str, Any]:
        """
        Comprehensive health check of User Management service with Service Operations integration
        """
        health_data = {
            'status': 'unknown',
            'timestamp': timezone.now().isoformat(),
            'service': 'user_management_adapter',
            'endpoints': {},
            'circuit_breakers': {},
            'cache_status': 'unknown',
            'rate_limits': cls._get_rate_limit_status(),
            'concurrent_requests': {
                'active': cls._active_requests,
                'max': cls.MAX_CONCURRENT_REQUESTS,
                'percentage': (cls._active_requests / cls.MAX_CONCURRENT_REQUESTS * 100) if cls.MAX_CONCURRENT_REQUESTS > 0 else 0
            },
            'external_dependencies': {}
        }
        
        try:
            # Check cache
            try:
                test_key = 'health_check_test'
                test_value = 'test_value'
                cache.set(test_key, test_value, 10)
                retrieved = cache.get(test_key)
                health_data['cache_status'] = 'healthy' if retrieved == test_value else 'degraded'
            except Exception as e:
                health_data['cache_status'] = 'unavailable'
                health_data['cache_error'] = str(e)
            
            # Check User Management service endpoints
            endpoints_to_check = [
                ('clients_list', f"{cls.BASE_URL}{cls.API_PREFIX}clients/?limit=1"),
                ('dashboard', f"{cls.BASE_URL}{cls.API_PREFIX}dashboard/"),
                ('quick_stats', f"{cls.BASE_URL}{cls.API_PREFIX}clients/quick_stats/"),
                ('health', f"{cls.BASE_URL}{cls.API_PREFIX}health/"),
            ]
            
            for endpoint_name, endpoint_url in endpoints_to_check:
                endpoint_status = cls._check_endpoint_health(endpoint_name, endpoint_url)
                health_data['endpoints'][endpoint_name] = endpoint_status
            
            # Check external dependencies
            health_data['external_dependencies']['subscription_service'] = SubscriptionService.health_check()
            health_data['external_dependencies']['activation_service'] = ActivationService.health_check()
            
            # Determine overall status
            healthy_endpoints = sum(
                1 for endpoint in health_data['endpoints'].values() 
                if endpoint.get('status') == 'healthy'
            )
            total_endpoints = len(health_data['endpoints'])
            
            # Check external dependencies health
            external_healthy = all(
                dep.get('status') in ['healthy', 'degraded']
                for dep in health_data['external_dependencies'].values()
            )
            
            if total_endpoints == 0:
                health_data['status'] = 'unknown'
            elif healthy_endpoints == total_endpoints and external_healthy:
                health_data['status'] = 'healthy'
            elif healthy_endpoints >= total_endpoints / 2 and external_healthy:
                health_data['status'] = 'degraded'
            else:
                health_data['status'] = 'unavailable'
            
            # Add circuit breaker status
            for name, cb in cls._circuit_breakers.items():
                health_data['circuit_breakers'][name] = cb.get_state()
            
            # Add recommendations
            health_data['recommendations'] = cls._generate_health_recommendations(health_data)
            
            logger.info(f"Health check completed: {health_data['status']}")
            return health_data
            
        except Exception as e:
            logger.error(f"Health check failed: {e}", exc_info=True)
            health_data['status'] = 'error'
            health_data['error'] = str(e)
            return health_data
    
    @classmethod
    def _check_endpoint_health(cls, endpoint_name: str, endpoint_url: str) -> Dict[str, Any]:
        """Check health of a specific endpoint with comprehensive metrics"""
        try:
            start_time = timezone.now()
            response = cls._make_request_with_retry('GET', endpoint_url, service='user_management')
            duration = (timezone.now() - start_time).total_seconds()
            
            if response and response.status_code == 200:
                return {
                    'status': 'healthy',
                    'response_time': duration,
                    'status_code': response.status_code,
                    'content_type': response.headers.get('Content-Type', 'unknown'),
                    'size_bytes': len(response.content) if response.content else 0
                }
            elif response:
                return {
                    'status': 'degraded',
                    'status_code': response.status_code,
                    'response_time': duration,
                    'error': response.text[:200] if response.text else 'No error message'
                }
            else:
                return {
                    'status': 'unavailable',
                    'message': 'No response from endpoint',
                    'response_time': duration
                }
                
        except Exception as e:
            return {
                'status': 'error',
                'message': str(e),
                'response_time': 0
            }
    
    @classmethod
    def _generate_health_recommendations(cls, health_data: Dict[str, Any]) -> List[str]:
        """Generate health recommendations based on health data"""
        recommendations = []
        
        # Circuit breaker recommendations
        for name, cb_state in health_data['circuit_breakers'].items():
            if cb_state.get('is_open'):
                recommendations.append(f"Circuit breaker {name} is open. Check {name} service connectivity.")
        
        # Endpoint recommendations
        for name, endpoint in health_data['endpoints'].items():
            if endpoint.get('status') not in ['healthy', 'degraded']:
                recommendations.append(f"Endpoint {name} is {endpoint.get('status')}. Check service availability.")
        
        # Cache recommendations
        if health_data['cache_status'] != 'healthy':
            recommendations.append(f"Cache is {health_data['cache_status']}. Check cache service.")
        
        # Concurrent request recommendations
        concurrent_pct = health_data['concurrent_requests']['percentage']
        if concurrent_pct > 80:
            recommendations.append(f"High concurrent request usage ({concurrent_pct:.1f}%). Consider increasing MAX_CONCURRENT_REQUESTS.")
        
        return recommendations
    
    # ==================== HELPER METHODS ====================
    
    @staticmethod
    def _generate_request_id() -> str:
        """Generate unique request ID"""
        return f"req-{uuid_module.uuid4()}"
    
    @staticmethod
    def _generate_signature(service: str, timestamp: str) -> str:
        """Generate request signature for security"""
        secret = getattr(settings, 'INTERNAL_API_SECRET', 'default-secret-change-in-production')
        message = f"{service}:{timestamp}"
        signature = hmac.new(
            secret.encode('utf-8'),
            message.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        return signature
    
    @staticmethod
    def _get_api_token() -> str:
        """Get API token from settings"""
        return getattr(settings, 'INTERNAL_API_TOKEN', 'service_operations_token')
    
    @staticmethod
    def _normalize_phone(phone: str) -> Optional[str]:
        """Normalize phone number to +254 format"""
        if not phone:
            return None
        
        # Remove non-digits and plus
        clean = re.sub(r'[^\d+]', '', str(phone))
        
        # Convert to +254 format
        if clean.startswith('0') and len(clean) == 10:
            return f"+254{clean[1:]}"
        elif len(clean) == 9:
            return f"+254{clean}"
        elif clean.startswith('254') and len(clean) == 12:
            return f"+{clean}"
        elif clean.startswith('+254') and len(clean) == 13:
            return clean
        
        return None
    
    @staticmethod
    def _looks_like_phone(text: str) -> bool:
        """Check if text looks like a phone number"""
        if not text:
            return False
        
        clean = re.sub(r'[^\d+]', '', str(text))
        
        # Check for Kenyan phone patterns
        patterns = [
            r'^\+254[17]\d{8}$',  # +2547XXXXXXXX or +2541XXXXXXXX
            r'^254[17]\d{8}$',    # 2547XXXXXXXX or 2541XXXXXXXX
            r'^0[17]\d{8}$',      # 07XXXXXXXX or 01XXXXXXXX
            r'^[17]\d{8}$',       # 7XXXXXXXX or 1XXXXXXXX
        ]
        
        return any(re.match(pattern, clean) for pattern in patterns)
    
    @classmethod
    def _check_rate_limit(cls, key: str) -> bool:
        """Check if rate limit is exceeded"""
        with cls._rate_limit_lock:
            current_time = timezone.now()
            minute_key = f"rate_limit:{key}:{current_time.strftime('%Y%m%d%H%M')}"
            
            # Get current count
            current_count = cache.get(minute_key, 0)
            
            # Define limits per service
            limits = {
                'user_management': 100,    # 100 requests per minute
                'client_details': 50,      # 50 requests per minute
                'sms': 60,                 # 60 requests per minute
            }
            
            # Determine limit based on key
            limit = 50  # Default
            for service, service_limit in limits.items():
                if service in key:
                    limit = service_limit
                    break
            
            return current_count < limit
    
    @classmethod
    def _update_rate_limit(cls, key: str, success: bool):
        """Update rate limit counter"""
        with cls._rate_limit_lock:
            current_time = timezone.now()
            minute_key = f"rate_limit:{key}:{current_time.strftime('%Y%m%d%H%M')}"
            
            # Increment counter with 1 minute expiry
            try:
                cache.incr(minute_key)
            except ValueError:
                cache.set(minute_key, 1, 61)  # 61 seconds to cover full minute
    
    @classmethod
    def _get_rate_limit_status(cls) -> Dict[str, Any]:
        """Get rate limit status"""
        current_time = timezone.now()
        minute = current_time.strftime('%Y%m%d%H%M')
        
        status = {}
        for service in ['user_management', 'client_details', 'sms']:
            key = f"rate_limit:{service}:{minute}"
            count = cache.get(key, 0)
            status[service] = {
                'current_count': count,
                'limit': {
                    'user_management': 100,
                    'client_details': 50,
                    'sms': 60,
                }.get(service, 50),
                'percentage': min(100, (count / 50) * 100) if count > 0 else 0
            }
        
        return status
    
    @staticmethod
    def _check_eligibility(client_data: Dict[str, Any]) -> bool:
        """Check if client is eligible for service"""
        # Check account status
        if client_data.get('status') not in ['active', 'trial']:
            return False
        
        # Check if client is suspended
        if client_data.get('status') == 'suspended':
            return False
        
        # Check if client is at high risk
        if client_data.get('is_at_risk', False) and client_data.get('churn_risk_score', 0) >= 7:
            return False
        
        # Check payment history
        days_since_last_payment = client_data.get('days_since_last_payment', 0)
        if days_since_last_payment > 45:
            return False
        
        return True
    
    @staticmethod
    def _get_last_activity(client_data: Dict[str, Any]) -> Dict[str, Any]:
        """Get client's last activity information"""
        last_login = client_data.get('last_login_date')
        last_payment = client_data.get('last_payment_date')
        last_usage = client_data.get('last_usage_date')
        
        return {
            'last_login': last_login.isoformat() if last_login else None,
            'last_payment': last_payment.isoformat() if last_payment else None,
            'last_usage': last_usage.isoformat() if last_usage else None,
            'is_active': bool(last_login and (timezone.now() - last_login).days < 7),
            'days_since_last_activity': cls._calculate_days_since_activity(last_login, last_payment, last_usage)
        }
    
    @staticmethod
    def _calculate_days_since_activity(*dates) -> int:
        """Calculate days since last activity"""
        valid_dates = [d for d in dates if d]
        if not valid_dates:
            return 999  # Large number for no activity
        
        latest_date = max(valid_dates)
        return (timezone.now() - latest_date).days
    
    @classmethod
    def _get_client_analytics_data(cls, client_id: str) -> Optional[Dict[str, Any]]:
        """Get client analytics data"""
        cache_key = f"client_analytics:{client_id}"
        cached = cache.get(cache_key)
        
        if cached:
            return cached
        
        try:
            # Get analytics data from Service Operations
            subscription_result = SubscriptionService.get_subscriptions_for_client(client_id)
            
            if subscription_result.get('success'):
                subscriptions = subscription_result.get('subscriptions', [])
                
                analytics = {
                    'total_subscriptions': len(subscriptions),
                    'active_subscriptions': len([s for s in subscriptions if s.get('status') == 'active']),
                    'total_data_used': sum(s.get('used_data_bytes', 0) for s in subscriptions),
                    'average_duration': sum(
                        (datetime.fromisoformat(s.get('end_date', '')) - datetime.fromisoformat(s.get('start_date', ''))).total_seconds()
                        for s in subscriptions if s.get('end_date') and s.get('start_date')
                    ) / len(subscriptions) if subscriptions else 0,
                    'renewal_rate': len([s for s in subscriptions if s.get('parent_subscription_id')]) / len(subscriptions) if subscriptions else 0
                }
                
                cache.set(cache_key, analytics, 300)  # 5 minutes
                return analytics
            
            return None
            
        except Exception as e:
            logger.error(f"Error getting client analytics for {client_id}: {e}")
            return None
    
    @staticmethod
    def _check_plan_compatibility(client_data: Dict[str, Any], plan_data: Dict[str, Any]) -> Dict[str, Any]:
        """Check plan compatibility with client"""
        result = {
            'compatible': True,
            'reason': '',
            'restrictions': []
        }
        
        # Basic compatibility checks
        client_type = client_data.get('client_type', 'hotspot_client')
        plan_type = plan_data.get('type', 'general')
        
        # Check client type restrictions
        if plan_data.get('client_type_restrictions'):
            allowed_types = plan_data['client_type_restrictions']
            if client_type not in allowed_types:
                result['compatible'] = False
                result['reason'] = f'Plan only available for {", ".join(allowed_types)} clients'
                result['restrictions'].append('client_type_restriction')
        
        # Check payment history requirements
        min_payment_history = plan_data.get('min_payment_history_days', 0)
        days_since_last_payment = client_data.get('days_since_last_payment', 999)
        
        if min_payment_history > 0 and days_since_last_payment > min_payment_history:
            result['compatible'] = False
            result['reason'] = f'Requires payment within last {min_payment_history} days'
            result['restrictions'].append('payment_history_requirement')
        
        return result
    
    # ==================== EXISTING METHODS WITH MINIMAL CHANGES ====================
    
    @classmethod
    def send_client_notification(cls, client_id: str, notification_type: str, data: Dict[str, Any]) -> bool:
        """Send notification to client (existing implementation)"""
        try:
            # Get client details
            client_details = cls.get_client_details(client_id)
            if not client_details:
                logger.error(f"Cannot notify client {client_id}: client not found")
                return False
            
            # Prepare notification data
            notification_data = {
                'message': data.get('message', ''),
                'channel': data.get('channel', 'sms'),
                'priority': data.get('priority', 'normal'),
                'metadata': {
                    'notification_type': notification_type,
                    'client_id': client_id,
                    **data.get('metadata', {})
                }
            }
            
            # Call User Management send_message endpoint
            endpoint = f"{cls.BASE_URL}{cls.API_PREFIX}clients/{client_id}/send_message/"
            response = cls._make_request_with_retry('POST', endpoint, service='sms', json=notification_data)
            
            success = response and response.status_code == 200
            
            if success:
                logger.info(f"Sent {notification_type} notification to client {client_id}")
            else:
                logger.warning(f"Failed to send notification to client {client_id}")
            
            return success
            
        except Exception as e:
            logger.error(f"Error sending notification to client {client_id}: {e}")
            return False
    
    @classmethod
    def get_client_subscription_status(cls, client_id: str) -> Optional[Dict[str, Any]]:
        """Get client's subscription status (enhanced with SubscriptionService)"""
        cache_key = f"client_subscription:{client_id}"
        cached = cache.get(cache_key)
        
        if cached:
            return cached
        
        try:
            # Use SubscriptionService for comprehensive subscription data
            subscription_result = SubscriptionService.get_subscriptions_for_client(client_id)
            
            if subscription_result.get('success'):
                subscriptions = subscription_result.get('subscriptions', [])
                
                subscription_status = {
                    'has_active_subscription': any(s.get('status') == 'active' for s in subscriptions),
                    'active_subscriptions': [s for s in subscriptions if s.get('status') == 'active'],
                    'subscription_count': len(subscriptions),
                    'data_used': sum(s.get('used_data_bytes', 0) for s in subscriptions),
                    'data_limit': sum(s.get('data_limit_bytes', 0) for s in subscriptions),
                    'percentage_used': 0
                }
                
                if subscription_status['data_limit'] > 0:
                    subscription_status['percentage_used'] = (
                        subscription_status['data_used'] / subscription_status['data_limit'] * 100
                    )
                
                cache.set(cache_key, subscription_status, 300)  # 5 minutes
                return subscription_status
            
            return None
            
        except Exception as e:
            logger.error(f"Error getting subscription status for {client_id}: {e}")
            return None