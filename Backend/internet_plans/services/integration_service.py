"""
Internet Plans - Integration Service
Production-ready service for integrating with other apps (service_operations, network_management, etc.)
Provides comprehensive error handling, caching, circuit breaker pattern, and fallback mechanisms
"""

import logging
import time
import threading
from typing import Dict, List, Optional, Any, Union, Tuple
from datetime import datetime, timedelta
from decimal import Decimal
from functools import wraps

from django.core.cache import cache
from django.db import transaction, models
from django.utils import timezone
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured

logger = logging.getLogger(__name__)


# ==================== CIRCUIT BREAKER IMPLEMENTATION ====================

class CircuitBreaker:
    """
    Circuit breaker pattern implementation to prevent cascading failures
    when external services are unavailable
    """
    
    # Class-level state (thread-safe)
    _states = {}  # service_name -> state
    _failures = {}  # service_name -> failure count
    _last_failure_time = {}  # service_name -> timestamp
    _locks = {}  # service_name -> threading.Lock
    
    # Configuration
    FAILURE_THRESHOLD = 5  # Number of failures before opening circuit
    RESET_TIMEOUT = 300  # Seconds before trying to close circuit (5 minutes)
    HALF_OPEN_TIMEOUT = 60  # Seconds in half-open state
    
    @classmethod
    def _get_lock(cls, service_name: str) -> threading.Lock:
        """Get or create lock for service"""
        if service_name not in cls._locks:
            cls._locks[service_name] = threading.Lock()
        return cls._locks[service_name]
    
    @classmethod
    def get_state(cls, service_name: str) -> str:
        """Get current circuit state for a service"""
        with cls._get_lock(service_name):
            if service_name not in cls._states:
                cls._states[service_name] = 'closed'
                cls._failures[service_name] = 0
            
            # Check if we should move from open to half-open
            if cls._states[service_name] == 'open':
                last_failure = cls._last_failure_time.get(service_name)
                if last_failure:
                    time_open = (timezone.now() - last_failure).total_seconds()
                    if time_open > cls.RESET_TIMEOUT:
                        cls._states[service_name] = 'half-open'
                        logger.info(f"Circuit breaker for {service_name} moved to half-open state")
            
            return cls._states[service_name]
    
    @classmethod
    def record_success(cls, service_name: str):
        """Record a successful call to reset circuit"""
        with cls._get_lock(service_name):
            cls._failures[service_name] = 0
            if cls._states.get(service_name) != 'closed':
                cls._states[service_name] = 'closed'
                logger.info(f"Circuit breaker for {service_name} reset to closed state")
    
    @classmethod
    def record_failure(cls, service_name: str):
        """Record a failure and potentially open the circuit"""
        with cls._get_lock(service_name):
            cls._failures[service_name] = cls._failures.get(service_name, 0) + 1
            cls._last_failure_time[service_name] = timezone.now()
            
            if cls._failures[service_name] >= cls.FAILURE_THRESHOLD:
                if cls._states.get(service_name) != 'open':
                    cls._states[service_name] = 'open'
                    logger.error(
                        f"Circuit breaker for {service_name} OPENED after "
                        f"{cls._failures[service_name]} failures"
                    )
    
    @classmethod
    def can_execute(cls, service_name: str) -> bool:
        """Check if a call to the service can be executed"""
        state = cls.get_state(service_name)
        
        if state == 'closed':
            return True
        elif state == 'half-open':
            # Allow one request to test the waters
            return True
        else:  # open
            return False
    
    @classmethod
    def get_status(cls, service_name: str) -> Dict[str, Any]:
        """Get circuit breaker status for a service"""
        return {
            'service': service_name,
            'state': cls.get_state(service_name),
            'failures': cls._failures.get(service_name, 0),
            'threshold': cls.FAILURE_THRESHOLD,
            'last_failure': cls._last_failure_time.get(service_name),
            'reset_timeout': cls.RESET_TIMEOUT,
        }


# ==================== RETRY DECORATOR ====================

def retry_on_failure(max_retries: int = 3, delay: float = 1.0, backoff: float = 2.0):
    """
    Decorator for retrying functions on failure with exponential backoff
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            current_delay = delay
            last_exception = None
            
            for attempt in range(max_retries):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    last_exception = e
                    logger.warning(
                        f"Attempt {attempt + 1}/{max_retries} failed for {func.__name__}: {e}"
                    )
                    
                    if attempt < max_retries - 1:
                        time.sleep(current_delay)
                        current_delay *= backoff
            
            raise last_exception
        
        return wrapper
    
    return decorator


# ==================== INTEGRATION SERVICE ====================

class PlanIntegrationService:
    """
    Production-ready integration service for internet_plans app
    Handles all cross-app communication with proper error handling,
    caching, circuit breakers, and fallbacks
    """
    
    # Cache configuration
    CACHE_TIMEOUT = 300  # 5 minutes
    NEGATIVE_CACHE_TIMEOUT = 60  # 1 minute for negative results
    
    # Service names for circuit breaker
    SERVICE_OPERATIONS = 'service_operations'
    NETWORK_MANAGEMENT = 'network_management'
    PAYMENT_SERVICE = 'payment_service'
    
    def __init__(self):
        self._check_apps_installed()
    
    def _check_apps_installed(self):
        """Check which external apps are installed"""
        self.service_ops_available = self._is_app_installed('service_operations')
        self.network_mgmt_available = self._is_app_installed('network_management')
        self.payment_available = self._is_app_installed('payments')
        
        logger.info(
            f"Integration service initialized. "
            f"Service Ops: {self.service_ops_available}, "
            f"Network Mgmt: {self.network_mgmt_available}, "
            f"Payment: {self.payment_available}"
        )
    
    def _is_app_installed(self, app_name: str) -> bool:
        """Check if a Django app is installed"""
        from django.apps import apps
        return apps.is_installed(app_name)
    
    # ==================== SERVICE OPERATIONS INTEGRATION ====================
    
    def get_plan_subscriptions(self, plan_id: str) -> Dict[str, Any]:
        """
        Get all subscriptions for a plan from service_operations
        Returns comprehensive subscription data with caching
        """
        if not self.service_ops_available:
            logger.debug("Service operations not available")
            return self._get_empty_subscription_stats()
        
        # Check circuit breaker
        if not CircuitBreaker.can_execute(self.SERVICE_OPERATIONS):
            logger.warning(f"Circuit breaker open for {self.SERVICE_OPERATIONS}")
            return self._get_empty_subscription_stats(warning="Service temporarily unavailable")
        
        # Check cache
        cache_key = f"plan_subscriptions:{plan_id}"
        cached_data = cache.get(cache_key)
        if cached_data is not None:
            return cached_data
        
        try:
            # Try to import and get subscriptions
            from service_operations.models.subscription_models import Subscription
            
            subscriptions = Subscription.objects.filter(internet_plan_id=plan_id)
            
            # Calculate statistics
            total = subscriptions.count()
            active = subscriptions.filter(status='active', is_active=True).count()
            pending = subscriptions.filter(status='pending_activation').count()
            expired = subscriptions.filter(status='expired').count()
            cancelled = subscriptions.filter(status='cancelled').count()
            suspended = subscriptions.filter(status='suspended').count()
            
            # Calculate usage
            active_subs = subscriptions.filter(status='active', is_active=True)
            total_data_bytes = sum(sub.used_data_bytes for sub in active_subs) if active_subs.exists() else 0
            total_time_seconds = sum(sub.used_time_seconds for sub in active_subs) if active_subs.exists() else 0
            
            # Get recent subscriptions
            recent = subscriptions.order_by('-created_at')[:10].values(
                'id', 'client_id', 'status', 'created_at', 'start_date', 'end_date'
            )
            
            result = {
                'available': True,
                'counts': {
                    'total': total,
                    'active': active,
                    'pending': pending,
                    'expired': expired,
                    'cancelled': cancelled,
                    'suspended': suspended,
                },
                'usage': {
                    'total_data_bytes': total_data_bytes,
                    'total_data_gb': round(total_data_bytes / (1024**3), 2),
                    'total_time_seconds': total_time_seconds,
                    'total_time_hours': round(total_time_seconds / 3600, 2),
                },
                'recent': list(recent),
                'timestamp': timezone.now().isoformat(),
            }
            
            # Record success for circuit breaker
            CircuitBreaker.record_success(self.SERVICE_OPERATIONS)
            
            # Cache the result
            cache.set(cache_key, result, self.CACHE_TIMEOUT)
            
            return result
            
        except ImportError:
            logger.warning("service_operations.models.Subscription not available")
            self.service_ops_available = False
            return self._get_empty_subscription_stats(error="Service operations not fully installed")
            
        except Exception as e:
            logger.error(f"Error getting plan subscriptions: {e}", exc_info=True)
            
            # Record failure for circuit breaker
            CircuitBreaker.record_failure(self.SERVICE_OPERATIONS)
            
            # Cache negative result briefly to avoid hammering
            error_result = self._get_empty_subscription_stats(error=str(e))
            cache.set(cache_key, error_result, self.NEGATIVE_CACHE_TIMEOUT)
            
            return error_result
    
    def get_plan_subscription_count(self, plan_id: str) -> int:
        """Get total number of subscriptions for a plan"""
        data = self.get_plan_subscriptions(plan_id)
        return data.get('counts', {}).get('total', 0)
    
    def get_plan_active_subscription_count(self, plan_id: str) -> int:
        """Get number of active subscriptions for a plan"""
        data = self.get_plan_subscriptions(plan_id)
        return data.get('counts', {}).get('active', 0)
    
    def get_plan_usage_stats(self, plan_id: str) -> Dict[str, Any]:
        """Get usage statistics for a plan"""
        data = self.get_plan_subscriptions(plan_id)
        return data.get('usage', {})
    
    def get_plan_subscription_details(self, plan_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """
        Get detailed subscription information for a plan
        """
        if not self.service_ops_available:
            return []
        
        cache_key = f"plan_subscription_details:{plan_id}:{limit}"
        cached_data = cache.get(cache_key)
        if cached_data is not None:
            return cached_data
        
        try:
            from service_operations.models import Subscription
            
            subscriptions = Subscription.objects.filter(
                internet_plan_id=plan_id
            ).select_related('client').order_by('-created_at')[:limit]
            
            details = []
            for sub in subscriptions:
                details.append({
                    'id': str(sub.id),
                    'client_id': str(sub.client_id),
                    'client_name': getattr(sub, 'client_name', None),
                    'status': sub.status,
                    'start_date': sub.start_date.isoformat() if sub.start_date else None,
                    'end_date': sub.end_date.isoformat() if sub.end_date else None,
                    'data_used_bytes': sub.used_data_bytes,
                    'time_used_seconds': sub.used_time_seconds,
                    'auto_renew': sub.auto_renew,
                    'payment_method': sub.payment_method,
                    'created_at': sub.created_at.isoformat(),
                })
            
            cache.set(cache_key, details, self.CACHE_TIMEOUT)
            return details
            
        except Exception as e:
            logger.error(f"Error getting subscription details: {e}")
            return []
    
    def get_plan_revenue(self, plan_id: str) -> Dict[str, Any]:
        """
        Calculate revenue from a plan
        """
        data = self.get_plan_subscriptions(plan_id)
        
        try:
            from internet_plans.models.plan_models import InternetPlan
            plan = InternetPlan.objects.get(id=plan_id)
            
            active_count = data.get('counts', {}).get('active', 0)
            total_count = data.get('counts', {}).get('total', 0)
            price = float(plan.price)
            
            return {
                'monthly_recurring': round(active_count * price, 2),
                'annual_recurring': round(active_count * price * 12, 2),
                'lifetime_value': round(total_count * price, 2),
                'currency': 'KES',
                'active_subscriptions': active_count,
                'total_subscriptions': total_count,
                'price_per_unit': price,
            }
        except Exception as e:
            logger.error(f"Error calculating revenue: {e}")
            return {
                'monthly_recurring': 0,
                'annual_recurring': 0,
                'lifetime_value': 0,
                'currency': 'KES',
                'error': str(e),
            }
    
    def check_plan_in_use(self, plan_id: str) -> Dict[str, Any]:
        """
        Check if a plan is currently in use by any active subscriptions
        Useful before deletion
        """
        data = self.get_plan_subscriptions(plan_id)
        active = data.get('counts', {}).get('active', 0)
        
        return {
            'in_use': active > 0,
            'active_subscriptions': active,
            'total_subscriptions': data.get('counts', {}).get('total', 0),
            'can_delete': active == 0,
            'message': f"Plan has {active} active subscription(s)" if active > 0 else "Plan is safe to delete",
        }
    
    # ==================== NETWORK MANAGEMENT INTEGRATION ====================
    
    def get_router_compatibility(self, plan_id: str, router_id: Optional[int] = None) -> Dict[str, Any]:
        """
        Check router compatibility for a plan
        """
        if not self.network_mgmt_available:
            return {
                'available': False,
                'compatible': True,  # Assume compatible if network mgmt not available
                'message': 'Network management not available, assuming compatibility',
            }
        
        cache_key = f"router_compatibility:{plan_id}:{router_id or 'all'}"
        cached_data = cache.get(cache_key)
        if cached_data is not None:
            return cached_data
        
        try:
            from internet_plans.models.plan_models import InternetPlan
            
            plan = InternetPlan.objects.get(id=plan_id)
            
            if router_id:
                compatible = plan.can_be_used_on_router(router_id)
                result = {
                    'available': True,
                    'compatible': compatible,
                    'router_id': router_id,
                    'router_specific': plan.router_specific,
                    'message': 'Compatible' if compatible else 'Not compatible with this router',
                }
            else:
                # Get all routers and compatibility
                from network_management.models.router_management_model import Router
                routers = Router.objects.filter(is_active=True)
                
                compatibility = []
                for router in routers:
                    compatible = plan.can_be_used_on_router(router.id)
                    compatibility.append({
                        'router_id': router.id,
                        'router_name': router.name,
                        'compatible': compatible,
                    })
                
                result = {
                    'available': True,
                    'compatible_count': sum(1 for r in compatibility if r['compatible']),
                    'total_routers': len(compatibility),
                    'compatibility': compatibility,
                }
            
            cache.set(cache_key, result, self.CACHE_TIMEOUT)
            return result
            
        except Exception as e:
            logger.error(f"Error checking router compatibility: {e}")
            return {
                'available': False,
                'compatible': True,  # Assume compatible on error
                'error': str(e),
            }
    
    # ==================== BATCH OPERATIONS ====================
    
    def get_multiple_plan_stats(self, plan_ids: List[str]) -> Dict[str, Any]:
        """
        Get statistics for multiple plans in batch
        Optimized to minimize database queries
        """
        if not plan_ids:
            return {}
        
        result = {}
        
        try:
            from service_operations.models.subscription_models import Subscription
            
            # Single query to get all subscription counts
            subscription_counts = Subscription.objects.filter(
                internet_plan_id__in=plan_ids
            ).values('internet_plan_id').annotate(
                total=models.Count('id'),
                active=models.Count('id', filter=models.Q(status='active', is_active=True)),
                pending=models.Count('id', filter=models.Q(status='pending_activation')),
            )
            
            # Convert to dict for easy lookup
            count_dict = {
                str(item['internet_plan_id']): {
                    'total': item['total'],
                    'active': item['active'],
                    'pending': item['pending'],
                }
                for item in subscription_counts
            }
            
            # Build result
            for plan_id in plan_ids:
                counts = count_dict.get(str(plan_id), {'total': 0, 'active': 0, 'pending': 0})
                result[str(plan_id)] = {
                    'subscription_counts': counts,
                    'in_use': counts['active'] > 0,
                }
            
        except Exception as e:
            logger.error(f"Error getting multiple plan stats: {e}")
            # Return empty stats for each plan
            for plan_id in plan_ids:
                result[str(plan_id)] = {
                    'subscription_counts': {'total': 0, 'active': 0, 'pending': 0},
                    'in_use': False,
                    'error': str(e),
                }
        
        return result
    
    # ==================== HEALTH CHECK ====================
    
    def health_check(self) -> Dict[str, Any]:
        """
        Comprehensive health check for all integrated services
        """
        health = {
            'service': 'plan_integration_service',
            'timestamp': timezone.now().isoformat(),
            'integrations': {
                'service_operations': {
                    'available': self.service_ops_available,
                    'circuit_breaker': CircuitBreaker.get_status(self.SERVICE_OPERATIONS),
                },
                'network_management': {
                    'available': self.network_mgmt_available,
                    'circuit_breaker': CircuitBreaker.get_status(self.NETWORK_MANAGEMENT),
                },
                'payment_service': {
                    'available': self.payment_available,
                    'circuit_breaker': CircuitBreaker.get_status(self.PAYMENT_SERVICE),
                },
            },
            'cache_status': self._check_cache_health(),
        }
        
        # Try to ping each service if available
        if self.service_ops_available:
            try:
                from service_operations.models import Subscription
                Subscription.objects.exists()  # Simple query to test connection
                health['integrations']['service_operations']['connection'] = 'healthy'
            except Exception as e:
                health['integrations']['service_operations']['connection'] = 'failed'
                health['integrations']['service_operations']['error'] = str(e)
        
        if self.network_mgmt_available:
            try:
                from network_management.models.router_management_model import Router
                Router.objects.exists()
                health['integrations']['network_management']['connection'] = 'healthy'
            except Exception as e:
                health['integrations']['network_management']['connection'] = 'failed'
                health['integrations']['network_management']['error'] = str(e)
        
        # Determine overall status
        all_healthy = all(
            integration.get('connection') == 'healthy' or not integration['available']
            for integration in health['integrations'].values()
        )
        
        health['status'] = 'healthy' if all_healthy else 'degraded'
        
        return health
    
    def _check_cache_health(self) -> Dict[str, Any]:
        """Check cache connectivity"""
        try:
            test_key = f"health_check_{timezone.now().timestamp()}"
            test_value = {'test': 'value'}
            cache.set(test_key, test_value, 10)
            retrieved = cache.get(test_key)
            cache.delete(test_key)
            
            return {
                'healthy': retrieved == test_value,
                'message': 'Cache is working' if retrieved == test_value else 'Cache test failed',
            }
        except Exception as e:
            return {
                'healthy': False,
                'error': str(e),
            }
    
    # ==================== HELPER METHODS ====================
    
    def _get_empty_subscription_stats(self, error: str = None, warning: str = None) -> Dict[str, Any]:
        """Return empty subscription statistics"""
        result = {
            'available': False,
            'counts': {
                'total': 0,
                'active': 0,
                'pending': 0,
                'expired': 0,
                'cancelled': 0,
                'suspended': 0,
            },
            'usage': {
                'total_data_bytes': 0,
                'total_data_gb': 0,
                'total_time_seconds': 0,
                'total_time_hours': 0,
            },
            'recent': [],
            'timestamp': timezone.now().isoformat(),
        }
        
        if error:
            result['error'] = error
        if warning:
            result['warning'] = warning
        
        return result
    
    def clear_plan_cache(self, plan_id: str = None):
        """Clear cache for a specific plan or all plans"""
        if plan_id:
            cache.delete(f"plan_subscriptions:{plan_id}")
            cache.delete(f"plan_subscription_details:{plan_id}:*")
            cache.delete(f"router_compatibility:{plan_id}:*")
            logger.info(f"Cleared cache for plan {plan_id}")
        else:
            # Clear all plan-related cache
            cache.delete_pattern("plan_subscriptions:*")
            cache.delete_pattern("plan_subscription_details:*")
            cache.delete_pattern("router_compatibility:*")
            logger.info("Cleared all plan cache")


# ==================== SINGLETON INSTANCE ====================

_integration_service_instance = None


def get_integration_service() -> PlanIntegrationService:
    """Get or create the integration service singleton"""
    global _integration_service_instance
    if _integration_service_instance is None:
        _integration_service_instance = PlanIntegrationService()
    return _integration_service_instance


# Convenience functions
integration_service = get_integration_service()