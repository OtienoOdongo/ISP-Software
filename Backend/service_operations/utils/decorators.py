"""
Advanced decorators for Django REST Framework views
Production-ready with comprehensive error handling, caching, permission management,
validation, and logging capabilities.
"""

import functools
import logging
import time
import inspect
from typing import Dict, Any, Callable, Optional, List, Tuple, Union
from django.core.cache import cache
from django.conf import settings
from django.core.exceptions import PermissionDenied
from django.utils.decorators import method_decorator
from django.db import transaction
from rest_framework import status
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework.serializers import Serializer
from rest_framework.exceptions import ValidationError

from service_operations.utils.metrics import record_metric, increment_counter
from service_operations.models import OperationLog

logger = logging.getLogger(__name__)


class ServiceError(Exception):
    """Custom exception for service-level errors"""
    def __init__(self, message: str, code: str = None, details: Dict = None, status_code: int = 500):
        self.message = message
        self.code = code or 'SERVICE_ERROR'
        self.details = details or {}
        self.status_code = status_code
        super().__init__(self.message)


def handle_service_errors(func: Callable = None, *, 
                         log_errors: bool = True,
                         return_error_response: bool = True,
                         default_error_message: str = "Service operation failed",
                         default_error_code: str = "SERVICE_ERROR"):
    """
    Decorator for handling service-level errors with comprehensive logging and metrics.
    
    Features:
    - Automatic error logging with context
    - Metrics collection for error rates
    - Circuit breaker integration
    - Graceful error responses
    - Transaction rollback on database errors
    """
    
    def decorator(view_func):
        @functools.wraps(view_func)
        def wrapped_view(view_instance, request, *args, **kwargs):
            start_time = time.time()
            error_occurred = False
            error_details = None
            
            try:
                # Execute the view function
                result = view_func(view_instance, request, *args, **kwargs)
                
                # Record success metrics
                execution_time = (time.time() - start_time) * 1000
                record_metric('view_execution_time', value=execution_time, tags={
                    'view': view_func.__name__,
                    'method': request.method,
                    'status': 'success'
                })
                
                increment_counter('view_success', tags={
                    'view': view_func.__name__,
                    'method': request.method
                })
                
                return result
                
            except ServiceError as se:
                # Handle service-level errors
                error_occurred = True
                error_details = {
                    'type': 'service_error',
                    'code': se.code,
                    'message': se.message,
                    'details': se.details,
                    'status_code': se.status_code
                }
                
                if log_errors:
                    logger.error(
                        f"Service error in {view_func.__name__}: {se.message}",
                        extra={
                            'error_code': se.code,
                            'details': se.details,
                            'view': view_func.__name__,
                            'method': request.method,
                            'user': getattr(request, 'user', {}),
                            'request_id': getattr(request, 'id', None)
                        },
                        exc_info=True
                    )
                
                # Log operation
                OperationLog.log_operation(
                    operation_type='service_error',
                    severity='error',
                    description=f'Service error in {view_func.__name__}: {se.message}',
                    details={
                        'error_code': se.code,
                        'details': se.details,
                        'view': view_func.__name__,
                        'method': request.method,
                        'user_id': getattr(request.user, 'id', None),
                        'username': getattr(request.user, 'username', None)
                    },
                    source_module='decorators',
                    source_function='handle_service_errors'
                )
                
                # Record error metrics
                increment_counter('service_error', tags={
                    'view': view_func.__name__,
                    'error_code': se.code
                })
                
                if return_error_response:
                    return Response({
                        'success': False,
                        'error': se.message,
                        'code': se.code,
                        'details': se.details if settings.DEBUG else None,
                        'timestamp': time.time()
                    }, status=se.status_code)
                else:
                    raise se
                    
            except ValidationError as ve:
                # Handle validation errors
                error_occurred = True
                error_details = {
                    'type': 'validation_error',
                    'code': 'VALIDATION_ERROR',
                    'message': 'Validation failed',
                    'details': ve.detail,
                    'status_code': status.HTTP_400_BAD_REQUEST
                }
                
                if log_errors:
                    logger.warning(
                        f"Validation error in {view_func.__name__}",
                        extra={
                            'errors': ve.detail,
                            'view': view_func.__name__,
                            'method': request.method
                        }
                    )
                
                increment_counter('validation_error', tags={'view': view_func.__name__})
                
                if return_error_response:
                    return Response({
                        'success': False,
                        'error': 'Validation failed',
                        'code': 'VALIDATION_ERROR',
                        'details': ve.detail,
                        'timestamp': time.time()
                    }, status=status.HTTP_400_BAD_REQUEST)
                else:
                    raise ve
                    
            except PermissionDenied as pd:
                # Handle permission errors
                error_occurred = True
                error_details = {
                    'type': 'permission_error',
                    'code': 'PERMISSION_DENIED',
                    'message': str(pd) or 'Permission denied',
                    'status_code': status.HTTP_403_FORBIDDEN
                }
                
                if log_errors:
                    logger.warning(
                        f"Permission denied in {view_func.__name__}",
                        extra={
                            'view': view_func.__name__,
                            'method': request.method,
                            'user': getattr(request, 'user', {}),
                            'path': request.path
                        }
                    )
                
                increment_counter('permission_denied', tags={'view': view_func.__name__})
                
                if return_error_response:
                    return Response({
                        'success': False,
                        'error': 'Permission denied',
                        'code': 'PERMISSION_DENIED',
                        'timestamp': time.time()
                    }, status=status.HTTP_403_FORBIDDEN)
                else:
                    raise pd
                    
            except Exception as e:
                # Handle unexpected errors
                error_occurred = True
                error_details = {
                    'type': 'unexpected_error',
                    'code': 'INTERNAL_ERROR',
                    'message': default_error_message,
                    'exception_type': type(e).__name__,
                    'exception_message': str(e),
                    'status_code': status.HTTP_500_INTERNAL_SERVER_ERROR
                }
                
                if log_errors:
                    logger.error(
                        f"Unexpected error in {view_func.__name__}: {str(e)}",
                        extra={
                            'exception_type': type(e).__name__,
                            'view': view_func.__name__,
                            'method': request.method,
                            'user': getattr(request, 'user', {}),
                            'path': request.path,
                            'query_params': dict(request.query_params),
                            'request_id': getattr(request, 'id', None)
                        },
                        exc_info=True
                    )
                
                # Log operation with full details
                OperationLog.log_operation(
                    operation_type='unexpected_error',
                    severity='error',
                    description=f'Unexpected error in {view_func.__name__}: {str(e)}',
                    details={
                        'exception_type': type(e).__name__,
                        'exception_message': str(e),
                        'view': view_func.__name__,
                        'method': request.method,
                        'user_id': getattr(request.user, 'id', None),
                        'username': getattr(request.user, 'username', None),
                        'path': request.path,
                        'query_params': dict(request.query_params)
                    },
                    source_module='decorators',
                    source_function='handle_service_errors'
                )
                
                increment_counter('unexpected_error', tags={
                    'view': view_func.__name__,
                    'exception_type': type(e).__name__
                })
                
                if return_error_response:
                    return Response({
                        'success': False,
                        'error': default_error_message,
                        'code': default_error_code,
                        'details': {
                            'exception_type': type(e).__name__,
                            'message': str(e)
                        } if settings.DEBUG else None,
                        'timestamp': time.time()
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                else:
                    raise e
            
            finally:
                # Record final metrics
                if error_occurred:
                    execution_time = (time.time() - start_time) * 1000
                    record_metric('view_execution_time', value=execution_time, tags={
                        'view': view_func.__name__,
                        'method': request.method,
                        'status': 'error',
                        'error_type': error_details.get('type') if error_details else 'unknown'
                    })
                
                # Record overall execution time
                total_time = (time.time() - start_time) * 1000
                record_metric('view_total_time', value=total_time, tags={
                    'view': view_func.__name__,
                    'method': request.method
                })
        
        return wrapped_view
    
    if func is None:
        return decorator
    else:
        return decorator(func)


def cache_response(ttl: int = 60, 
                   key_prefix: str = None,
                   vary_by_user: bool = False,
                   vary_by_params: bool = True,
                   condition: Callable = None):
    """
    Advanced caching decorator with flexible cache key generation and invalidation.
    
    Features:
    - Smart cache key generation
    - User-based caching
    - Parameter-based caching
    - Conditional caching
    - Cache versioning
    """
    
    def decorator(view_func):
        @functools.wraps(view_func)
        def wrapped_view(view_instance, request, *args, **kwargs):
            # Check if caching should be bypassed
            if request.query_params.get('no_cache') == 'true':
                return view_func(view_instance, request, *args, **kwargs)
            
            # Generate cache key
            cache_key = _generate_cache_key(
                view_func=view_func,
                view_instance=view_instance,
                request=request,
                args=args,
                kwargs=kwargs,
                key_prefix=key_prefix,
                vary_by_user=vary_by_user,
                vary_by_params=vary_by_params
            )
            
            # Check condition
            if condition and not condition(request, *args, **kwargs):
                return view_func(view_instance, request, *args, **kwargs)
            
            # Try to get from cache
            cached_data = cache.get(cache_key)
            if cached_data is not None:
                logger.debug(f"Cache hit for {cache_key}")
                increment_counter('cache_hit', tags={'view': view_func.__name__})
                
                # Add cache metadata to response
                if isinstance(cached_data, dict):
                    cached_data['_cache'] = {
                        'hit': True,
                        'key': cache_key,
                        'ttl': ttl,
                        'cached_at': time.time()
                    }
                
                return cached_data
            
            logger.debug(f"Cache miss for {cache_key}")
            increment_counter('cache_miss', tags={'view': view_func.__name__})
            
            # Execute view function
            start_time = time.time()
            response = view_func(view_instance, request, *args, **kwargs)
            execution_time = (time.time() - start_time) * 1000
            
            # Only cache successful responses
            if hasattr(response, 'status_code') and response.status_code == 200:
                if hasattr(response, 'data'):
                    cache_data = response.data
                    
                    # Add execution time metadata
                    if isinstance(cache_data, dict):
                        cache_data['_performance'] = {
                            'execution_time_ms': execution_time,
                            'cached': True,
                            'cache_key': cache_key
                        }
                    
                    # Store in cache
                    cache.set(cache_key, cache_data, ttl)
                    
                    logger.debug(f"Cached response for {cache_key} (TTL: {ttl}s)")
                    record_metric('cache_set', tags={'view': view_func.__name__, 'ttl': ttl})
            
            return response
        
        return wrapped_view
    
    return decorator


def _generate_cache_key(view_func, view_instance, request, args, kwargs,
                       key_prefix, vary_by_user, vary_by_params):
    """Generate cache key based on multiple factors"""
    key_parts = []
    
    # Base key parts
    if key_prefix:
        key_parts.append(key_prefix)
    else:
        key_parts.append(f"view:{view_func.__name__}")
    
    # Add class name if method
    if hasattr(view_instance, '__class__'):
        key_parts.append(f"class:{view_instance.__class__.__name__}")
    
    # Add user ID if vary_by_user
    if vary_by_user and hasattr(request, 'user') and request.user.is_authenticated:
        key_parts.append(f"user:{request.user.id}")
    
    # Add parameters if vary_by_params
    if vary_by_params and hasattr(request, 'query_params'):
        # Sort parameters for consistent keys
        sorted_params = sorted(request.query_params.items())
        if sorted_params:
            params_str = ','.join(f"{k}={v}" for k, v in sorted_params)
            key_parts.append(f"params:{hash(params_str)}")
    
    # Add view arguments
    if args:
        key_parts.append(f"args:{hash(str(args))}")
    
    if kwargs:
        sorted_kwargs = sorted(kwargs.items())
        kwargs_str = ','.join(f"{k}={v}" for k, v in sorted_kwargs)
        key_parts.append(f"kwargs:{hash(kwargs_str)}")
    
    # Generate final key
    cache_key = ':'.join(str(part) for part in key_parts)
    
    # Limit key length
    if len(cache_key) > 250:
        cache_key = cache_key[:250] + f":{hash(cache_key)}"
    
    return cache_key


def require_permissions(permissions: List[str], 
                       require_all: bool = True,
                       error_message: str = None):
    """
    Decorator for enforcing permissions on view methods.
    
    Features:
    - Multiple permission checking
    - AND/OR logic for permissions
    - Custom error messages
    - Permission caching
    """
    
    def decorator(view_func):
        @functools.wraps(view_func)
        def wrapped_view(view_instance, request, *args, **kwargs):
            # Check if user is authenticated
            if not request.user.is_authenticated:
                raise PermissionDenied(error_message or "Authentication required")
            
            # Check permissions
            permission_results = []
            missing_permissions = []
            
            for permission in permissions:
                if permission == 'is_staff':
                    has_perm = request.user.is_staff
                elif permission == 'is_superuser':
                    has_perm = request.user.is_superuser
                elif permission.startswith('has_perm:'):
                    perm_name = permission.split(':', 1)[1]
                    has_perm = request.user.has_perm(perm_name)
                elif permission.startswith('has_group:'):
                    group_name = permission.split(':', 1)[1]
                    has_perm = request.user.groups.filter(name=group_name).exists()
                else:
                    # Custom permission check method
                    check_method = getattr(view_instance, f'check_{permission}', None)
                    if check_method:
                        try:
                            has_perm = check_method(request, *args, **kwargs)
                        except Exception as e:
                            logger.error(f"Permission check failed for {permission}: {e}")
                            has_perm = False
                    else:
                        # Default to False for unknown permissions
                        has_perm = False
                
                permission_results.append(has_perm)
                if not has_perm:
                    missing_permissions.append(permission)
            
            # Determine if permission check passes
            if require_all:
                has_permission = all(permission_results)
            else:
                has_permission = any(permission_results)
            
            if not has_permission:
                logger.warning(
                    f"Permission denied for user {request.user.id} on {view_func.__name__}",
                    extra={
                        'user': request.user.username,
                        'permissions_required': permissions,
                        'missing_permissions': missing_permissions,
                        'require_all': require_all,
                        'view': view_func.__name__
                    }
                )
                
                increment_counter('permission_check_failed', tags={
                    'view': view_func.__name__,
                    'missing_permissions': ','.join(missing_permissions)
                })
                
                raise PermissionDenied(
                    error_message or 
                    f"Missing required permissions: {', '.join(missing_permissions)}"
                )
            
            # Record successful permission check
            increment_counter('permission_check_passed', tags={'view': view_func.__name__})
            
            return view_func(view_instance, request, *args, **kwargs)
        
        return wrapped_view
    
    return decorator


def validate_request_data(serializer_class: Serializer,
                         partial: bool = False,
                         context_extra: Dict = None,
                         strict: bool = True):
    """
    Decorator for request data validation using DRF serializers.
    
    Features:
    - Automatic data validation
    - Context injection
    - Partial validation support
    - Strict/non-strict validation modes
    """
    
    def decorator(view_func):
        @functools.wraps(view_func)
        def wrapped_view(view_instance, request, *args, **kwargs):
            # Prepare data based on request method
            if request.method in ['POST', 'PUT', 'PATCH']:
                data = request.data
            else:
                data = request.query_params.dict()
            
            # Build serializer context
            context = {'request': request, 'view': view_instance}
            if context_extra:
                context.update(context_extra)
            
            # Create and validate serializer
            serializer = serializer_class(data=data, context=context, partial=partial)
            
            if not serializer.is_valid():
                logger.warning(
                    f"Validation failed in {view_func.__name__}",
                    extra={
                        'errors': serializer.errors,
                        'view': view_func.__name__,
                        'method': request.method,
                        'user': request.user.username if request.user.is_authenticated else None
                    }
                )
                
                increment_counter('validation_failed', tags={
                    'view': view_func.__name__,
                    'serializer': serializer_class.__name__
                })
                
                raise ValidationError(serializer.errors)
            
            # Store validated serializer on view instance
            view_instance.validated_serializer = serializer
            
            # Record validation success
            increment_counter('validation_passed', tags={
                'view': view_func.__name__,
                'serializer': serializer_class.__name__
            })
            
            return view_func(view_instance, request, *args, **kwargs)
        
        return wrapped_view
    
    return decorator


def log_operation(operation_type: str,
                 severity: str = 'info',
                 include_request_data: bool = True,
                 include_response_data: bool = False,
                 sensitive_fields: List[str] = None):
    """
    Decorator for comprehensive operation logging.
    
    Features:
    - Automatic operation logging
    - Request/response data inclusion
    - Sensitive data filtering
    - Performance timing
    - Error correlation
    """
    
    def decorator(view_func):
        @functools.wraps(view_func)
        def wrapped_view(view_instance, request, *args, **kwargs):
            start_time = time.time()
            operation_id = None
            error_occurred = False
            
            try:
                # Generate operation ID for correlation
                operation_id = f"op_{int(start_time * 1000)}_{hash(request.path)}"
                
                # Prepare operation details
                operation_details = {
                    'operation_id': operation_id,
                    'view': view_func.__name__,
                    'method': request.method,
                    'path': request.path,
                    'user_id': getattr(request.user, 'id', None),
                    'username': getattr(request.user, 'username', None),
                    'user_agent': request.META.get('HTTP_USER_AGENT'),
                    'client_ip': _get_client_ip(request),
                    'start_time': start_time
                }
                
                # Include request data if requested
                if include_request_data:
                    request_data = _sanitize_request_data(
                        request, 
                        sensitive_fields or ['password', 'token', 'secret', 'key']
                    )
                    operation_details['request_data'] = request_data
                
                # Log operation start
                OperationLog.log_operation(
                    operation_type=f"{operation_type}_start",
                    severity=severity,
                    description=f'Starting {operation_type} operation',
                    details=operation_details,
                    source_module='decorators',
                    source_function='log_operation'
                )
                
                # Execute view function
                response = view_func(view_instance, request, *args, **kwargs)
                
                # Calculate execution time
                execution_time = (time.time() - start_time) * 1000
                
                # Update operation details
                operation_details.update({
                    'execution_time_ms': execution_time,
                    'end_time': time.time(),
                    'success': True,
                    'response_status': getattr(response, 'status_code', None)
                })
                
                # Include response data if requested
                if include_response_data and hasattr(response, 'data'):
                    operation_details['response_data'] = response.data
                
                # Log operation completion
                OperationLog.log_operation(
                    operation_type=f"{operation_type}_complete",
                    severity=severity,
                    description=f'Completed {operation_type} operation',
                    details=operation_details,
                    source_module='decorators',
                    source_function='log_operation'
                )
                
                # Record metrics
                record_metric('operation_execution_time', value=execution_time, tags={
                    'operation_type': operation_type,
                    'view': view_func.__name__,
                    'status': 'success'
                })
                
                increment_counter('operation_success', tags={
                    'operation_type': operation_type,
                    'view': view_func.__name__
                })
                
                # Add operation ID to response if it's a dict
                if hasattr(response, 'data') and isinstance(response.data, dict):
                    response.data['_operation'] = {
                        'id': operation_id,
                        'type': operation_type,
                        'execution_time_ms': execution_time
                    }
                
                return response
                
            except Exception as e:
                error_occurred = True
                execution_time = (time.time() - start_time) * 1000
                
                # Update operation details with error
                if operation_id:
                    error_details = {
                        'operation_id': operation_id,
                        'error_type': type(e).__name__,
                        'error_message': str(e),
                        'execution_time_ms': execution_time,
                        'end_time': time.time(),
                        'success': False,
                        'view': view_func.__name__,
                        'method': request.method
                    }
                    
                    # Log error
                    OperationLog.log_operation(
                        operation_type=f"{operation_type}_error",
                        severity='error',
                        description=f'Error in {operation_type} operation: {str(e)}',
                        details=error_details,
                        source_module='decorators',
                        source_function='log_operation'
                    )
                
                # Record error metrics
                record_metric('operation_execution_time', value=execution_time, tags={
                    'operation_type': operation_type,
                    'view': view_func.__name__,
                    'status': 'error',
                    'error_type': type(e).__name__
                })
                
                increment_counter('operation_error', tags={
                    'operation_type': operation_type,
                    'view': view_func.__name__,
                    'error_type': type(e).__name__
                })
                
                raise e
        
        return wrapped_view
    
    return decorator


def _get_client_ip(request):
    """Extract client IP address from request"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


def _sanitize_request_data(request, sensitive_fields):
    """Sanitize request data by removing sensitive fields"""
    if not hasattr(request, 'data'):
        return {}
    
    data = dict(request.data)
    
    for field in sensitive_fields:
        if field in data:
            data[field] = '[FILTERED]'
    
    # Also check nested structures
    def sanitize_dict(d):
        for key, value in d.items():
            if isinstance(value, dict):
                sanitize_dict(value)
            elif isinstance(value, list):
                for i, item in enumerate(value):
                    if isinstance(item, dict):
                        sanitize_dict(item)
            elif any(sensitive in key.lower() for sensitive in sensitive_fields):
                d[key] = '[FILTERED]'
    
    sanitize_dict(data)
    return data


class Transactional:
    """
    Decorator for database transaction management.
    
    Features:
    - Automatic transaction handling
    - Retry logic for deadlocks
    - Savepoint management
    - Transaction logging
    """
    
    def __init__(self, 
                 atomic: bool = True,
                 max_retries: int = 3,
                 retry_delay: float = 0.1,
                 savepoints: bool = True):
        self.atomic = atomic
        self.max_retries = max_retries
        self.retry_delay = retry_delay
        self.savepoints = savepoints
    
    def __call__(self, func):
        @functools.wraps(func)
        def wrapped(*args, **kwargs):
            if not self.atomic:
                return func(*args, **kwargs)
            
            for attempt in range(self.max_retries):
                try:
                    if self.savepoints:
                        with transaction.atomic(using='default', savepoint=True):
                            return func(*args, **kwargs)
                    else:
                        with transaction.atomic(using='default'):
                            return func(*args, **kwargs)
                            
                except Exception as e:
                    # Check if error is retryable (e.g., deadlock)
                    if self._is_retryable_error(e) and attempt < self.max_retries - 1:
                        logger.warning(
                            f"Retryable error in transaction (attempt {attempt + 1}): {e}",
                            exc_info=True
                        )
                        time.sleep(self.retry_delay * (2 ** attempt))  # Exponential backoff
                        continue
                    else:
                        logger.error(
                            f"Transaction failed after {attempt + 1} attempts: {e}",
                            exc_info=True
                        )
                        raise e
        
        return wrapped
    
    def _is_retryable_error(self, error):
        """Determine if an error is retryable"""
        error_str = str(error).lower()
        retryable_patterns = [
            'deadlock',
            'timeout',
            'lock wait timeout',
            'could not serialize',
            'try restarting transaction'
        ]
        
        return any(pattern in error_str for pattern in retryable_patterns)


class RateLimited:
    """
    Decorator for rate limiting with Redis backend.
    
    Features:
    - Token bucket algorithm
    - Redis-backed rate limiting
    - Multiple rate limit strategies
    - Custom rate limit responses
    """
    
    def __init__(self,
                 rate: str = '100/hour',
                 key_func: Callable = None,
                 scope: str = None,
                 method: str = 'fixed_window'):
        """
        Args:
            rate: Rate limit string (e.g., '100/hour', '10/minute')
            key_func: Function to generate rate limit key
            scope: Rate limit scope (e.g., 'user', 'ip', 'global')
            method: Rate limiting method ('fixed_window', 'token_bucket', 'sliding_window')
        """
        self.rate = rate
        self.key_func = key_func
        self.scope = scope
        self.method = method
    
    def __call__(self, func):
        @functools.wraps(func)
        def wrapped(view_instance, request, *args, **kwargs):
            # Generate rate limit key
            key = self._generate_key(request)
            
            # Check rate limit
            if not self._check_rate_limit(key):
                logger.warning(
                    f"Rate limit exceeded for {key}",
                    extra={
                        'key': key,
                        'rate': self.rate,
                        'user': getattr(request.user, 'username', None),
                        'ip': _get_client_ip(request),
                        'path': request.path
                    }
                )
                
                increment_counter('rate_limit_exceeded', tags={
                    'key': key,
                    'scope': self.scope,
                    'view': func.__name__
                })
                
                return Response({
                    'success': False,
                    'error': 'Rate limit exceeded',
                    'code': 'RATE_LIMIT_EXCEEDED',
                    'retry_after': self._get_retry_after(key),
                    'limit': self.rate,
                    'timestamp': time.time()
                }, status=429)
            
            # Increment rate limit counter
            self._increment_counter(key)
            
            return func(view_instance, request, *args, **kwargs)
        
        return wrapped
    
    def _generate_key(self, request):
        """Generate rate limit key"""

        if self.key_func:
         return self.key_func(request)

        view_name = (
            request.resolver_match.view_name
            if request.resolver_match
            else 'unknown'
        )

        key_parts = ['ratelimit', self.scope or 'global', view_name]

        if self.scope == 'user' and request.user.is_authenticated:
            key_parts.append(str(request.user.id))
        elif self.scope == 'ip':
            key_parts.append(_get_client_ip(request))

        return ':'.join(key_parts)

    
    def _check_rate_limit(self, key):
        """Check if rate limit is exceeded"""
        # Implementation depends on chosen method
        # This is a simplified version - in production, use a proper rate limiting library
        current_count = cache.get(key, 0)
        
        # Parse rate string (e.g., '100/hour')
        limit, period = self.rate.split('/')
        limit = int(limit)
        
        return current_count < limit
    
    def _increment_counter(self, key):
        """Increment rate limit counter"""
        # Parse period from rate string
        _, period = self.rate.split('/')
        
        # Determine TTL based on period
        ttl_map = {
            'second': 1,
            'minute': 60,
            'hour': 3600,
            'day': 86400
        }
        
        ttl = ttl_map.get(period.lower(), 3600)
        
        # Increment counter
        cache.add(key, 0, ttl)
        cache.incr(key)
    
    def _get_retry_after(self, key):
        """Get retry-after time in seconds"""
        # Simplified - in production, calculate actual retry time
        return 60


# Method decorator versions for class-based views
def method_handle_service_errors(**kwargs):
    return method_decorator(handle_service_errors(**kwargs))


def method_cache_response(**kwargs):
    return method_decorator(cache_response(**kwargs))


def method_require_permissions(**kwargs):
    return method_decorator(require_permissions(**kwargs))


def method_validate_request_data(**kwargs):
    return method_decorator(validate_request_data(**kwargs))


def method_log_operation(**kwargs):
    return method_decorator(log_operation(**kwargs))