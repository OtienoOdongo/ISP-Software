"""
Audit Logging Middleware for Network Management System

This module provides comprehensive audit logging middleware for all router management actions.
"""

import logging
from django.utils import timezone
from django.utils.deprecation import MiddlewareMixin
from network_management.models.router_management_model import RouterAuditLog
from network_management.models.router_management_model import Router, HotspotUser, PPPoEUser

logger = logging.getLogger(__name__)


class RouterAuditMiddleware(MiddlewareMixin):
    """
    Comprehensive audit logging middleware for all router management actions.
    """
    
    def process_view(self, request, view_func, view_args, view_kwargs):
        """
        Intercept requests and log router management actions.
        """
        # Skip for non-router management endpoints
        if not request.path.startswith('/api/network_management/'):
            return None
            
        # Skip for GET requests (except important ones)
        if request.method == 'GET' and not self._should_log_get_request(request.path):
            return None
            
        # Store request info for later use in process_response
        request._router_audit_info = {
            'start_time': timezone.now(),
            'user': request.user if request.user.is_authenticated else None,
            'view_name': view_func.__name__,
            'path': request.path,
            'method': request.method,
            'view_args': view_args,
            'view_kwargs': view_kwargs
        }
        
        return None

    def process_response(self, request, response):
        """
        Log the action after response is generated.
        """
        if not hasattr(request, '_router_audit_info'):
            return response
            
        audit_info = request._router_audit_info
        
        try:
            # Determine action type based on request method and path
            action_type = self._determine_action_type(request, response, audit_info)
            if not action_type:
                return response
                
            # Extract relevant data for logging
            description = self._generate_description(request, response, action_type, audit_info)
            changes = self._extract_changes(request, response)
            router_id = self._extract_router_id(request, audit_info['view_kwargs'])
            
            # Create audit log entry
            RouterAuditLog.objects.create(
                router_id=router_id,
                action=action_type,
                description=description,
                user=audit_info['user'],
                ip_address=self._get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                changes=changes,
                timestamp=audit_info['start_time'],
                status_code=response.status_code
            )
            
            logger.info(f"Audit log created: {action_type} - {description}")
            
        except Exception as e:
            logger.error(f"Audit logging failed: {str(e)}")
            
        return response

    def _should_log_get_request(self, path):
        """Determine if GET request should be logged."""
        important_get_paths = [
            '/api/network_management/routers/stats/',
            '/api/network_management/health-monitoring/',
            '/api/network_management/audit-logs/',
            '/api/network_management/bulk-operations/history/',
        ]
        
        return any(path.startswith(important_path) for important_path in important_get_paths)

    def _determine_action_type(self, request, response, audit_info):
        """Determine the action type based on request and response."""
        method = request.method
        path = request.path
        
        # Action mapping based on URL patterns and methods
        action_map = {
            'POST': {
                '/api/network_management/routers/': 'create',
                '/api/network_management/routers/[^/]+/activate-user/': 'user_activation',
                '/api/network_management/session-recovery/': 'session_recovery',
                '/api/network_management/bulk-operations/': 'bulk_operation',
                '/api/network_management/routers/[^/]+/hotspot-config/': 'configure',
                '/api/network_management/routers/[^/]+/pppoe-config/': 'configure',
                '/api/network_management/routers/[^/]+/restore-sessions/': 'session_restoration',
                '/api/network_management/routers/[^/]+/reboot/': 'reboot',
            },
            'PUT': {
                '/api/network_management/routers/[^/]+/': 'update',
                '/api/network_management/routers/[^/]+/callback-configs/[^/]+/': 'callback_config_update',
            },
            'DELETE': {
                '/api/network_management/routers/[^/]+/': 'delete',
                '/api/network_management/hotspot-users/[^/]+/': 'user_deactivation',
                '/api/network_management/pppoe-users/[^/]+/': 'user_deactivation',
                '/api/network_management/routers/[^/]+/callback-configs/[^/]+/': 'callback_config_delete',
            },
            'GET': {
                '/api/network_management/health-monitoring/': 'health_check',
                '/api/network_management/audit-logs/': 'audit_view',
                '/api/network_management/bulk-operations/history/': 'bulk_operations_view',
            }
        }
        
        for http_method, paths in action_map.items():
            if method == http_method:
                for path_pattern, action in paths.items():
                    import re
                    if re.match(path_pattern, path):
                        return action
        
        return None

    def _generate_description(self, request, response, action_type, audit_info):
        """Generate human-readable description for the audit log."""
        user = request.user.username if request.user.is_authenticated else 'Anonymous'
        path = request.path
        
        descriptions = {
            'create': f"Router created by {user}",
            'update': f"Router updated by {user}",
            'delete': f"Router deleted by {user}",
            'user_activation': f"User activated by {user}",
            'user_deactivation': f"User deactivated by {user}",
            'session_recovery': f"Session recovery performed by {user}",
            'bulk_operation': f"Bulk operation initiated by {user}",
            'configure': f"Router configuration updated by {user}",
            'session_restoration': f"Sessions restored by {user}",
            'reboot': f"Router rebooted by {user}",
            'health_check': f"Health check performed by {user}",
            'audit_view': f"Audit logs accessed by {user}",
            'callback_config_update': f"Callback configuration updated by {user}",
            'callback_config_delete': f"Callback configuration deleted by {user}",
            'bulk_operations_view': f"Bulk operations history viewed by {user}",
        }
        
        return descriptions.get(action_type, f"Action performed by {user}")

    def _extract_changes(self, request, response):
        """Extract relevant changes from request and response."""
        changes = {}
        
        try:
            if request.method in ['POST', 'PUT', 'PATCH']:
                # Extract safe data (exclude passwords and sensitive info)
                safe_data = {}
                for key, value in request.data.items():
                    if not self._is_sensitive_field(key):
                        safe_data[key] = value
                
                if safe_data:
                    changes['request_data'] = safe_data
                    
            if hasattr(response, 'data') and response.data:
                # Include relevant response data
                response_data = response.data
                if isinstance(response_data, dict):
                    safe_response = {}
                    for key, value in response_data.items():
                        if not self._is_sensitive_field(key):
                            safe_response[key] = value
                    changes['response_data'] = safe_response
                    
            # Include status code
            changes['status_code'] = response.status_code
                    
        except Exception as e:
            logger.warning(f"Failed to extract changes: {str(e)}")
            
        return changes

    def _is_sensitive_field(self, field_name):
        """Check if field contains sensitive information."""
        sensitive_patterns = [
            'password', 'secret', 'key', 'token', 'credential',
            'auth', 'login', 'pwd', 'passphrase', 'api_key',
            'private', 'signature', 'signature_key'
        ]
        
        field_lower = field_name.lower()
        return any(pattern in field_lower for pattern in sensitive_patterns)

    def _extract_router_id(self, request, view_kwargs):
        """Extract router ID from request parameters."""
        # Try to get router ID from URL kwargs
        router_id = view_kwargs.get('pk') or view_kwargs.get('router_id')
        
        if router_id:
            return router_id
            
        # Try to extract from request data
        if hasattr(request, 'data') and isinstance(request.data, dict):
            router_id = request.data.get('router_id') or request.data.get('router')
            
        return router_id

    def _get_client_ip(self, request):
        """Get client IP address."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0]
        else:
            return request.META.get('REMOTE_ADDR')

    def process_exception(self, request, exception):
        """
        Log exceptions that occur during request processing.
        """
        if hasattr(request, '_router_audit_info'):
            audit_info = request._router_audit_info
            
            try:
                RouterAuditLog.objects.create(
                    router_id=self._extract_router_id(request, audit_info.get('view_kwargs', {})),
                    action='error',
                    description=f"Exception occurred: {str(exception)}",
                    user=audit_info.get('user'),
                    ip_address=self._get_client_ip(request),
                    user_agent=request.META.get('HTTP_USER_AGENT', ''),
                    changes={
                        'exception_type': type(exception).__name__,
                        'exception_message': str(exception),
                        'path': request.path,
                        'method': request.method
                    },
                    timestamp=audit_info.get('start_time', timezone.now())
                )
                
                logger.error(f"Audit log created for exception: {str(exception)}")
                
            except Exception as e:
                logger.error(f"Failed to create audit log for exception: {str(e)}")


class AuditLogCleanupMiddleware(MiddlewareMixin):
    """
    Middleware for automatic audit log cleanup based on retention policy.
    """
    
    def __init__(self, get_response=None):
        super().__init__(get_response)
        self.retention_days = 365  # Default retention period
        
    def process_request(self, request):
        """
        Perform periodic audit log cleanup.
        """
        # Only run cleanup occasionally to avoid performance impact
        import random
        if random.random() < 0.01:  # 1% chance on each request
            self._cleanup_old_logs()
        
        return None

    def _cleanup_old_logs(self):
        """Clean up audit logs older than retention period."""
        try:
            from django.utils import timezone
            from datetime import timedelta
            
            cutoff_date = timezone.now() - timedelta(days=self.retention_days)
            old_logs = RouterAuditLog.objects.filter(timestamp__lt=cutoff_date)
            
            deleted_count = old_logs.count()
            if deleted_count > 0:
                old_logs.delete()
                logger.info(f"Audit log cleanup: {deleted_count} records deleted")
                
        except Exception as e:
            logger.error(f"Audit log cleanup failed: {str(e)}")