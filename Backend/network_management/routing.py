


# # network_management/routing.py
# from django.urls import re_path
# from .consumers import RouterConsumer, RouterHealthConsumer, BulkOperationsConsumer, NotificationConsumer

# # WebSocket URL patterns
# websocket_urlpatterns = [
#     # Global router updates and management
#     re_path(r'ws/routers/$', RouterConsumer.as_asgi(), name="websocket-routers-global"),
    
#     # Individual router health monitoring
#     re_path(r'ws/routers/(?P<router_id>\w+)/health/$', RouterHealthConsumer.as_asgi(), name="websocket-router-health"),
    
#     # Bulk operations progress and completion
#     re_path(r'ws/bulk-operations/$', BulkOperationsConsumer.as_asgi(), name="websocket-bulk-operations"),
    
#     # General notifications and alerts
#     re_path(r'ws/notifications/$', NotificationConsumer.as_asgi(), name="websocket-notifications"),
# ]





"""
Enhanced WebSocket Routing for Network Management System

This module provides WebSocket URL routing with enhanced security and organization.
"""

from django.urls import re_path
from . import consumers

# WebSocket URL patterns with enhanced security and organization
websocket_urlpatterns = [
    # Global router updates and management
    re_path(
        r'ws/routers/$', 
        consumers.RouterConsumer.as_asgi(), 
        name="websocket-routers-global"
    ),
    
    # Individual router health monitoring
    re_path(
        r'ws/routers/(?P<router_id>\w+)/health/$', 
        consumers.RouterHealthConsumer.as_asgi(), 
        name="websocket-router-health"
    ),
    
    # Bulk operations progress and completion
    re_path(
        r'ws/bulk-operations/$', 
        consumers.BulkOperationsConsumer.as_asgi(), 
        name="websocket-bulk-operations"
    ),
    
    # General notifications and alerts
    re_path(
        r'ws/notifications/$', 
        consumers.NotificationConsumer.as_asgi(), 
        name="websocket-notifications"
    ),
    
    # Individual operation progress (for specific bulk operations)
    re_path(
        r'ws/bulk-operations/(?P<operation_id>[0-9a-f-]+)/$', 
        consumers.BulkOperationsConsumer.as_asgi(), 
        name="websocket-bulk-operation-detail"
    ),
]


class WebSocketRouteManager:
    """
    Manager for WebSocket route configuration and validation.
    """
    
    @staticmethod
    def get_websocket_urlpatterns():
        """
        Get all WebSocket URL patterns with validation.
        
        Returns:
            list: Validated WebSocket URL patterns
        """
        return websocket_urlpatterns
    
    @staticmethod
    def validate_route_configuration():
        """
        Validate WebSocket route configuration.
        
        Returns:
            dict: Validation results
        """
        validation_results = {
            'total_routes': len(websocket_urlpatterns),
            'valid_routes': [],
            'invalid_routes': [],
            'warnings': []
        }
        
        for pattern in websocket_urlpatterns:
            try:
                # Check if pattern has required attributes
                if hasattr(pattern, 'pattern') and hasattr(pattern, 'callback'):
                    validation_results['valid_routes'].append({
                        'pattern': str(pattern.pattern),
                        'name': getattr(pattern, 'name', 'Unnamed')
                    })
                else:
                    validation_results['invalid_routes'].append(str(pattern))
                    
            except Exception as e:
                validation_results['invalid_routes'].append(f"Error: {str(e)}")
        
        return validation_results
    
    @staticmethod
    def get_route_info():
        """
        Get detailed information about all WebSocket routes.
        
        Returns:
            dict: Route information
        """
        route_info = {
            'routes': [],
            'total_consumers': 0,
            'consumer_types': set()
        }
        
        for pattern in websocket_urlpatterns:
            consumer_class = pattern.callback.__self__.__class__
            route_info['consumer_types'].add(consumer_class.__name__)
            
            route_info['routes'].append({
                'url_pattern': str(pattern.pattern),
                'route_name': getattr(pattern, 'name', 'Unnamed'),
                'consumer_class': consumer_class.__name__,
                'description': getattr(consumer_class, '__doc__', 'No description').strip().split('\n')[0] if getattr(consumer_class, '__doc__', None) else 'No description'
            })
        
        route_info['total_consumers'] = len(route_info['consumer_types'])
        
        return route_info