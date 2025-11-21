









# # network_management/api/views/router_management/router_base_views.py
# """
# Base Router Management Views for Network Management System

# This module provides core API views for router CRUD operations and basic management.
# """

# import logging
# from django.utils import timezone
# from django.db import transaction
# from django.shortcuts import get_object_or_404
# from django.db.models import Q
# from django.core.cache import cache
# from django.conf import settings

# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework import status
# from rest_framework.permissions import IsAuthenticated

# logger = logging.getLogger(__name__)


# class RouterBaseView(APIView):
#     """
#     Base view class for router operations with common functionality.
#     """
#     permission_classes = [IsAuthenticated]
    
#     def get_router_model(self):
#         """Import Router model locally to avoid circular imports."""
#         from network_management.models.router_management_model import Router
#         return Router
    
#     def get_router_audit_log_model(self):
#         """Import RouterAuditLog model locally to avoid circular imports."""
#         from network_management.models.router_management_model import RouterAuditLog
#         return RouterAuditLog
    
#     def get_router_serializer(self):
#         """Import RouterSerializer locally to avoid circular imports."""
#         from network_management.serializers.router_management_serializer import RouterSerializer
#         return RouterSerializer
    
#     def get_websocket_manager(self):
#         """Import WebSocketManager locally to avoid circular imports."""
#         from network_management.utils.websocket_utils import WebSocketManager
#         return WebSocketManager
    
#     def get_router(self, pk):
#         """Retrieve router instance with common checks."""
#         Router = self.get_router_model()
#         return get_object_or_404(Router, pk=pk, is_active=True)
    
#     def clear_router_cache(self, router_id):
#         """Clear cache for specific router."""
#         try:
#             cache.delete_pattern(f"router:{router_id}:*")
#         except Exception as e:
#             logger.warning(f"Cache pattern deletion failed: {e}")
#             cache_keys = [
#                 f"router:{router_id}:detail",
#                 f"router:{router_id}:stats",
#                 f"router:{router_id}:health_comprehensive"
#             ]
#             cache.delete_many(cache_keys)
    
#     def clear_routers_cache(self):
#         """Clear all routers list cache."""
#         try:
#             cache.delete_pattern("routers:list:*")
#         except Exception as e:
#             logger.warning(f"Cache pattern deletion failed: {e}")
#             cache_keys = [
#                 "routers:list",
#                 "routers:list:all",
#                 "routers:list:connected",
#                 "routers:list:disconnected"
#             ]
#             cache.delete_many(cache_keys)
    
#     def create_audit_log(self, router, action, description, user, request, changes=None):
#         """Create standardized audit log entry."""
#         RouterAuditLog = self.get_router_audit_log_model()
#         return RouterAuditLog.objects.create(
#             router=router,
#             action=action,
#             description=description,
#             user=user,
#             ip_address=request.META.get('REMOTE_ADDR'),
#             user_agent=request.META.get('HTTP_USER_AGENT', ''),
#             changes=changes or {}
#         )


# class RouterListView(RouterBaseView):
#     """
#     API View for listing and creating routers.
#     """
    
#     def get(self, request):
#         """Retrieve a list of routers with optional filtering and search."""
#         Router = self.get_router_model()
#         RouterSerializer = self.get_router_serializer()
        
#         search = request.query_params.get('search', '')
#         status_filter = request.query_params.get('status', 'all')
#         router_type = request.query_params.get('type', '')
        
#         cache_key = f"routers:list:{search}:{status_filter}:{router_type}"
#         cached_data = cache.get(cache_key)
        
#         if cached_data:
#             return Response(cached_data)

#         routers = Router.objects.filter(is_active=True)
        
#         if search:
#             routers = routers.filter(
#                 Q(name__icontains=search) |
#                 Q(ip__icontains=search) |
#                 Q(location__icontains=search) |
#                 Q(ssid__icontains=search) |
#                 Q(description__icontains=search)
#             )
        
#         if status_filter != 'all':
#             routers = routers.filter(status=status_filter)
            
#         if router_type:
#             routers = routers.filter(type=router_type)

#         serializer = RouterSerializer(routers, many=True)
#         cache.set(cache_key, serializer.data, 120)
        
#         return Response(serializer.data)

#     def post(self, request):
#         """Create a new router instance."""
#         RouterSerializer = self.get_router_serializer()
#         WebSocketManager = self.get_websocket_manager()
        
#         serializer = RouterSerializer(data=request.data)
#         if serializer.is_valid():
#             with transaction.atomic():
#                 router = serializer.save(status="disconnected")
#                 router.callback_url = f"{request.build_absolute_uri('/')[:-1]}/api/payments/mpesa-callbacks/dispatch/{router.id}/"
#                 router.save()
                
#                 self.create_audit_log(
#                     router=router,
#                     action='create',
#                     description=f"Router {router.name} created",
#                     user=request.user,
#                     request=request,
#                     changes=request.data
#                 )
                
#                 self.clear_routers_cache()
#                 WebSocketManager.send_router_update(router.id, 'router_created', {'name': router.name})
                
#             return Response(RouterSerializer(router).data, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# class RouterDetailView(RouterBaseView):
#     """
#     API View for retrieving, updating, and deleting individual routers.
#     """
    
#     def get(self, request, pk):
#         """Retrieve detailed information about a specific router."""
#         RouterSerializer = self.get_router_serializer()
        
#         cache_key = f"router:{pk}:detail"
#         cached_data = cache.get(cache_key)
        
#         if cached_data:
#             return Response(cached_data)

#         router = self.get_router(pk)
#         serializer = RouterSerializer(router)
#         cache.set(cache_key, serializer.data, 300)
        
#         return Response(serializer.data)

#     def put(self, request, pk):
#         """Update a router instance."""
#         RouterSerializer = self.get_router_serializer()
#         WebSocketManager = self.get_websocket_manager()
        
#         router = self.get_router(pk)
#         old_data = RouterSerializer(router).data
        
#         serializer = RouterSerializer(router, data=request.data, partial=True)
#         if serializer.is_valid():
#             with transaction.atomic():
#                 router = serializer.save()
                
#                 changes = self.get_changes(old_data, request.data)
#                 self.create_audit_log(
#                     router=router,
#                     action='update',
#                     description=f"Router {router.name} updated",
#                     user=request.user,
#                     request=request,
#                     changes=changes
#                 )
                
#                 self.clear_router_cache(pk)
#                 self.clear_routers_cache()
#                 WebSocketManager.send_router_update(pk, 'router_updated', {'name': router.name, 'changes': changes})
                
#             return Response(serializer.data)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#     def delete(self, request, pk):
#         """Soft delete a router instance."""
#         WebSocketManager = self.get_websocket_manager()
        
#         router = self.get_router(pk)
        
#         with transaction.atomic():
#             router.is_active = False
#             router.save()
            
#             self.create_audit_log(
#                 router=router,
#                 action='delete',
#                 description=f"Router {router.name} deleted",
#                 user=request.user,
#                 request=request
#             )
            
#             self.clear_router_cache(pk)
#             self.clear_routers_cache()
#             WebSocketManager.send_router_update(pk, 'router_deleted', {'name': router.name})
            
#         return Response(status=status.HTTP_204_NO_CONTENT)

#     def get_changes(self, old_data, new_data):
#         """Detect changes between old and new data."""
#         changes = {}
#         for key, new_value in new_data.items():
#             old_value = old_data.get(key)
#             if old_value != new_value:
#                 changes[key] = {'old': old_value, 'new': new_value}
#         return changes











# network_management/api/views/router_management/router_base_views.py

"""
Enhanced Base Router Management Views for Network Management System

This module provides core API views for router CRUD operations with integrated
connection testing and dynamic SSID support.
"""

import logging
from django.utils import timezone
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.core.cache import cache
from django.conf import settings

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from network_management.utils.mikrotik_connector import MikroTikConnector
from network_management.models.router_management_model import Router, RouterAuditLog, RouterConnectionTest
from network_management.serializers.router_management_serializer import RouterSerializer, RouterListSerializer

logger = logging.getLogger(__name__)


class RouterBaseView(APIView):
    """
    Enhanced base view class for router operations with connection management.
    """
    permission_classes = [IsAuthenticated]
    
    def get_router_model(self):
        from network_management.models.router_management_model import Router
        return Router
    
    def get_router_audit_log_model(self):
        from network_management.models.router_management_model import RouterAuditLog
        return RouterAuditLog
    
    def get_router_serializer(self):
        from network_management.serializers.router_management_serializer import RouterSerializer
        return RouterSerializer
    
    def get_websocket_manager(self):
        from network_management.utils.websocket_utils import WebSocketManager
        return WebSocketManager
    
    def get_router(self, pk):
        """Retrieve router instance with common checks."""
        Router = self.get_router_model()
        return get_object_or_404(Router, pk=pk, is_active=True)
    
    def clear_router_cache(self, router_id):
        """Clear cache for specific router."""
        try:
            cache.delete_pattern(f"router:{router_id}:*")
        except Exception as e:
            logger.warning(f"Cache pattern deletion failed: {e}")
            cache_keys = [
                f"router:{router_id}:detail",
                f"router:{router_id}:stats",
                f"router:{router_id}:health_comprehensive",
                f"router:{router_id}:connection_tests"
            ]
            cache.delete_many(cache_keys)
    
    def clear_routers_cache(self):
        """Clear all routers list cache."""
        try:
            cache.delete_pattern("routers:list:*")
        except Exception as e:
            logger.warning(f"Cache pattern deletion failed: {e}")
            cache_keys = [
                "routers:list",
                "routers:list:all",
                "routers:list:connected",
                "routers:list:disconnected"
            ]
            cache.delete_many(cache_keys)
    
    def create_audit_log(self, router, action, description, user, request, changes=None):
        """Create standardized audit log entry."""
        RouterAuditLog = self.get_router_audit_log_model()
        return RouterAuditLog.objects.create(
            router=router,
            action=action,
            description=description,
            user=user,
            ip_address=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
            changes=changes or {}
        )
    
    def test_router_connection(self, router, request):
        """
        Test router connection and update status.
        
        Returns:
            tuple: (success: bool, test_results: dict, message: str)
        """
        try:
            connector = MikroTikConnector(
                ip=router.ip,
                username=router.username,
                password=router.password,
                port=router.port
            )
            
            test_results = connector.test_connection()
            
            # Save connection test results
            connection_test = RouterConnectionTest.objects.create(
                router=router,
                success=test_results.get('system_access', False),
                response_time=test_results.get('response_time'),
                system_info=test_results.get('system_info', {}),
                error_messages=test_results.get('error_messages', []),
                tested_by=request.user
            )
            
            # Update router connection status
            if test_results.get('system_access'):
                router.connection_status = 'connected'
                router.last_connection_test = timezone.now()
                # Update system info if available
                if test_results.get('system_info'):
                    router.firmware_version = test_results['system_info'].get('version', router.firmware_version)
                message = "Connection test successful"
            else:
                router.connection_status = 'disconnected'
                message = "Connection test failed"
            
            router.save()
            
            # Create audit log
            self.create_audit_log(
                router=router,
                action='connection_test',
                description=f"Connection test {'succeeded' if test_results.get('system_access') else 'failed'}",
                user=request.user,
                request=request,
                changes={
                    'success': test_results.get('system_access', False),
                    'response_time': test_results.get('response_time'),
                    'error_messages': test_results.get('error_messages', [])
                }
            )
            
            return test_results.get('system_access', False), test_results, message
            
        except Exception as e:
            logger.error(f"Connection test failed for router {router.id}: {str(e)}")
            return False, {}, f"Connection test failed: {str(e)}"


class RouterListView(RouterBaseView):
    """
    Enhanced API View for listing and creating routers with connection testing.
    """
    
    def get(self, request):
        """Retrieve a list of routers with enhanced filtering and connection status."""
        Router = self.get_router_model()
        RouterListSerializer = self.get_router_serializer()
        
        search = request.query_params.get('search', '')
        status_filter = request.query_params.get('status', 'all')
        router_type = request.query_params.get('type', '')
        connection_status = request.query_params.get('connection_status', 'all')
        configuration_status = request.query_params.get('configuration_status', 'all')
        
        cache_key = f"routers:list:{search}:{status_filter}:{router_type}:{connection_status}:{configuration_status}"
        cached_data = cache.get(cache_key)
        
        if cached_data:
            return Response(cached_data)

        routers = Router.objects.filter(is_active=True)
        
        # Enhanced search across multiple fields
        if search:
            routers = routers.filter(
                Q(name__icontains=search) |
                Q(ip__icontains=search) |
                Q(location__icontains=search) |
                Q(ssid__icontains=search) |
                Q(description__icontains=search) |
                Q(firmware_version__icontains=search)
            )
        
        if status_filter != 'all':
            routers = routers.filter(status=status_filter)
            
        if router_type:
            routers = routers.filter(type=router_type)
            
        # NEW: Connection status filtering
        if connection_status != 'all':
            routers = routers.filter(connection_status=connection_status)
            
        # NEW: Configuration status filtering
        if configuration_status != 'all':
            routers = routers.filter(configuration_status=configuration_status)

        # Use list serializer for better performance
        serializer = RouterListSerializer(routers, many=True)
        cache.set(cache_key, serializer.data, 120)  # Cache for 2 minutes
        
        return Response(serializer.data)

    def post(self, request):
        """Create a new router instance with optional connection testing."""
        RouterSerializer = self.get_router_serializer()
        WebSocketManager = self.get_websocket_manager()
        
        # Check if auto-connection test is requested
        auto_test_connection = request.data.get('auto_test_connection', False)
        
        serializer = RouterSerializer(
            data=request.data, 
            context={'auto_test_connection': auto_test_connection}
        )
        
        if serializer.is_valid():
            with transaction.atomic():
                router = serializer.save(status="disconnected")
                router.callback_url = f"{request.build_absolute_uri('/')[:-1]}/api/payments/mpesa-callbacks/dispatch/{router.id}/"
                router.save()
                
                # Perform connection test if requested
                connection_test_results = None
                if auto_test_connection:
                    success, test_results, message = self.test_router_connection(router, request)
                    connection_test_results = {
                        'success': success,
                        'message': message,
                        'test_results': test_results
                    }
                
                self.create_audit_log(
                    router=router,
                    action='create',
                    description=f"Router {router.name} created",
                    user=request.user,
                    request=request,
                    changes={
                        **request.data,
                        'auto_tested_connection': auto_test_connection,
                        'connection_test_results': connection_test_results
                    }
                )
                
                self.clear_routers_cache()
                WebSocketManager.send_router_update(
                    router.id, 
                    'router_created', 
                    {
                        'name': router.name,
                        'connection_tested': auto_test_connection,
                        'connection_status': router.connection_status
                    }
                )
                
                # Include connection test results in response if performed
                response_data = RouterSerializer(router).data
                if connection_test_results:
                    response_data['connection_test'] = connection_test_results
                
            return Response(response_data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RouterDetailView(RouterBaseView):
    """
    Enhanced API View for retrieving, updating, and deleting individual routers
    with integrated connection management.
    """
    
    def get(self, request, pk):
        """Retrieve detailed information about a specific router with connection status."""
        RouterSerializer = self.get_router_serializer()
        
        cache_key = f"router:{pk}:detail"
        cached_data = cache.get(cache_key)
        
        if cached_data:
            return Response(cached_data)

        router = self.get_router(pk)
        serializer = RouterSerializer(router)
        cache.set(cache_key, serializer.data, 300)  # Cache for 5 minutes
        
        return Response(serializer.data)

    def put(self, request, pk):
        """Update a router instance with connection validation."""
        RouterSerializer = self.get_router_serializer()
        WebSocketManager = self.get_websocket_manager()
        
        router = self.get_router(pk)
        old_data = RouterSerializer(router).data
        
        # Check if connection test is requested
        test_connection = request.data.get('test_connection', False)
        
        serializer = RouterSerializer(router, data=request.data, partial=True)
        if serializer.is_valid():
            with transaction.atomic():
                router = serializer.save()
                
                # Perform connection test if requested
                connection_test_results = None
                if test_connection:
                    success, test_results, message = self.test_router_connection(router, request)
                    connection_test_results = {
                        'success': success,
                        'message': message,
                        'test_results': test_results
                    }
                
                changes = self.get_changes(old_data, request.data)
                self.create_audit_log(
                    router=router,
                    action='update',
                    description=f"Router {router.name} updated",
                    user=request.user,
                    request=request,
                    changes={
                        **changes,
                        'connection_tested': test_connection,
                        'connection_test_results': connection_test_results
                    }
                )
                
                self.clear_router_cache(pk)
                self.clear_routers_cache()
                
                update_data = {
                    'name': router.name, 
                    'changes': changes,
                    'connection_tested': test_connection,
                    'connection_status': router.connection_status
                }
                WebSocketManager.send_router_update(pk, 'router_updated', update_data)
                
                # Include connection test results in response if performed
                response_data = serializer.data
                if connection_test_results:
                    response_data['connection_test'] = connection_test_results
                
            return Response(response_data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        """Soft delete a router instance."""
        WebSocketManager = self.get_websocket_manager()
        
        router = self.get_router(pk)
        
        with transaction.atomic():
            router.is_active = False
            router.status = "disconnected"
            router.connection_status = "disconnected"
            router.save()
            
            self.create_audit_log(
                router=router,
                action='delete',
                description=f"Router {router.name} deleted",
                user=request.user,
                request=request
            )
            
            self.clear_router_cache(pk)
            self.clear_routers_cache()
            WebSocketManager.send_router_update(pk, 'router_deleted', {'name': router.name})
            
        return Response(status=status.HTTP_204_NO_CONTENT)

    def get_changes(self, old_data, new_data):
        """Detect changes between old and new data."""
        changes = {}
        for key, new_value in new_data.items():
            old_value = old_data.get(key)
            if old_value != new_value:
                changes[key] = {'old': old_value, 'new': new_value}
        return changes

    def post(self, request, pk):
        """
        Additional operations on specific router.
        Currently used for connection testing.
        """
        action = request.data.get('action')
        
        if action == 'test_connection':
            return self.test_connection(request, pk)
        elif action == 'get_connection_history':
            return self.get_connection_history(request, pk)
        else:
            return Response(
                {"error": "Invalid action"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    def test_connection(self, request, pk):
        """Test connection to specific router."""
        router = self.get_router(pk)
        
        success, test_results, message = self.test_router_connection(router, request)
        
        response_data = {
            'success': success,
            'message': message,
            'test_results': test_results,
            'router': {
                'id': router.id,
                'name': router.name,
                'ip': router.ip,
                'connection_status': router.connection_status
            }
        }
        
        return Response(response_data)

    def get_connection_history(self, request, pk):
        """Get connection test history for router."""
        router = self.get_router(pk)
        
        days = int(request.query_params.get('days', 7))
        start_date = timezone.now() - timezone.timedelta(days=days)
        
        from network_management.serializers.router_management_serializer import RouterConnectionTestSerializer
        
        connection_tests = RouterConnectionTest.objects.filter(
            router=router,
            tested_at__gte=start_date
        ).order_by('-tested_at')
        
        serializer = RouterConnectionTestSerializer(connection_tests, many=True)
        
        # Calculate statistics
        total_tests = connection_tests.count()
        successful_tests = connection_tests.filter(success=True).count()
        success_rate = (successful_tests / total_tests * 100) if total_tests > 0 else 0
        
        statistics = {
            'total_tests': total_tests,
            'successful_tests': successful_tests,
            'success_rate': round(success_rate, 2),
            'average_response_time': connection_tests.aggregate(
                avg_response_time=models.Avg('response_time')
            )['avg_response_time'] or 0,
            'time_period_days': days
        }
        
        return Response({
            'router': {
                'id': router.id,
                'name': router.name,
                'ip': router.ip
            },
            'connection_tests': serializer.data,
            'statistics': statistics
        })