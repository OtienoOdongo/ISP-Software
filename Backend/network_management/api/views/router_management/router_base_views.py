

# network_management/api/views/router_management/router_base_views.py

"""
Enhanced Base Router Management Views for Network Management System

This module provides core API views for router CRUD operations with integrated
connection testing and dynamic SSID support.
"""

import logging
from django.utils import timezone
from datetime import timedelta
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.core.cache import cache
from django.db import models
import uuid

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from network_management.utils.mikrotik_connector import MikroTikConnector
from network_management.models.router_management_model import Router, RouterAuditLog, RouterConnectionTest
from network_management.serializers.router_management_serializer import RouterSerializer, RouterListSerializer
from network_management.utils.websocket_utils import WebSocketManager

logger = logging.getLogger(__name__)


class RouterBaseView(APIView):
    """
    Enhanced base view class for router operations with connection management.
    """
    permission_classes = [IsAuthenticated]
    
    def get_router(self, pk):
        """Retrieve router instance with common checks."""
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
    
    def create_audit_log(self, router, action, description, user, request, changes=None, status_code=None):
        """Create standardized audit log entry."""
        audit_log_data = {
            'action': action,
            'description': description,
            'user': user,
            'ip_address': self.get_client_ip(request),
            'user_agent': request.META.get('HTTP_USER_AGENT', ''),
            'changes': changes or {},
            'status_code': status_code
        }
        
        # Only add router if it's provided (router is now nullable)
        if router is not None:
            audit_log_data['router'] = router
        
        return RouterAuditLog.objects.create(**audit_log_data)
    
    def get_client_ip(self, request):
        """Get client IP address."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0]
        else:
            return request.META.get('REMOTE_ADDR')
    
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
                },
                status_code=200 if test_results.get('system_access') else 400
            )
            
            return test_results.get('system_access', False), test_results, message
            
        except Exception as e:
            logger.error(f"Connection test failed for router {router.id}: {str(e)}")
            
            # Save failed test
            RouterConnectionTest.objects.create(
                router=router,
                success=False,
                response_time=None,
                system_info={},
                error_messages=[f"Connection test failed: {str(e)}"],
                tested_by=request.user
            )
            
            self.create_audit_log(
                router=router,
                action='connection_test',
                description=f"Connection test failed: {str(e)}",
                user=request.user,
                request=request,
                changes={
                    'success': False,
                    'error_messages': [f"Connection test failed: {str(e)}"]
                },
                status_code=500
            )
            
            router.connection_status = 'disconnected'
            router.last_connection_test = timezone.now()
            router.save()
            
            return False, {}, f"Connection test failed: {str(e)}"


class RouterListView(RouterBaseView):
    """
    Enhanced API View for listing and creating routers with connection testing.
    """
    
    def get(self, request):
        """Retrieve a list of routers with enhanced filtering and connection status."""
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
            
        # Connection status filtering
        if connection_status != 'all':
            routers = routers.filter(connection_status=connection_status)
            
        # Configuration status filtering
        if configuration_status != 'all':
            routers = routers.filter(configuration_status=configuration_status)

        # Use list serializer for better performance
        serializer = RouterListSerializer(routers, many=True)
        
        response_data = serializer.data
        
        # Ensure response data is never empty - return empty list instead of None
        if not response_data:
            response_data = []
            
        cache.set(cache_key, response_data, 120)  # Cache for 2 minutes
        
        return Response(response_data)

    def post(self, request):
        """Create a new router instance with optional connection testing."""
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
                    },
                    status_code=201
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
        
        # Return proper error response with validation errors
        return Response(
            {
                'error': 'Validation failed',
                'details': serializer.errors
            }, 
            status=status.HTTP_400_BAD_REQUEST
        )


class RouterDetailView(RouterBaseView):
    """
    Enhanced API View for retrieving, updating, and deleting individual routers
    with integrated connection management.
    """
    
    def get(self, request, pk):
        """Retrieve detailed information about a specific router with connection status."""
        cache_key = f"router:{pk}:detail"
        cached_data = cache.get(cache_key)
        
        if cached_data:
            return Response(cached_data)

        router = self.get_router(pk)
        serializer = RouterSerializer(router)
        
        response_data = serializer.data
        
        # Ensure response data is never empty
        if not response_data:
            response_data = {
                'id': router.id,
                'name': router.name,
                'ip': router.ip,
                'connection_status': router.connection_status,
                'status': router.status,
                'is_active': router.is_active
            }
            
        cache.set(cache_key, response_data, 300)  # Cache for 5 minutes
        
        return Response(response_data)

    def put(self, request, pk):
        """Update a router instance with connection validation."""
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
                    },
                    status_code=200
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
        
        # Return proper error response with validation errors
        return Response(
            {
                'error': 'Validation failed',
                'details': serializer.errors
            }, 
            status=status.HTTP_400_BAD_REQUEST
        )

    def delete(self, request, pk):
        """Soft delete a router instance."""
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
                request=request,
                changes={
                    'old_status': router.status,
                    'old_connection_status': router.connection_status
                },
                status_code=204
            )
            
            self.clear_router_cache(pk)
            self.clear_routers_cache()
            WebSocketManager.send_router_update(pk, 'router_deleted', {'name': router.name})
            
        return Response(
            {
                'message': 'Router deleted successfully',
                'router_id': pk
            },
            status=status.HTTP_204_NO_CONTENT
        )

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
                {
                    'error': 'Invalid action',
                    'available_actions': ['test_connection', 'get_connection_history']
                }, 
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
        
        # Calculate average response time from successful tests only
        successful_response_times = connection_tests.filter(
            success=True, 
            response_time__isnull=False
        ).values_list('response_time', flat=True)
        
        avg_response_time = sum(successful_response_times) / len(successful_response_times) if successful_response_times else 0
        
        statistics = {
            'total_tests': total_tests,
            'successful_tests': successful_tests,
            'success_rate': round(success_rate, 2),
            'average_response_time': round(avg_response_time, 3),
            'time_period_days': days
        }
        
        response_data = {
            'router': {
                'id': router.id,
                'name': router.name,
                'ip': router.ip
            },
            'connection_tests': serializer.data if connection_tests.exists() else [],
            'statistics': statistics
        }
        
        return Response(response_data)


class RouterConnectionManagementView(RouterBaseView):
    """
    Enhanced API View for router connection management operations.
    """
    
    def post(self, request, pk=None):
        """
        Handle connection management operations.
        
        Actions:
        - test_connection: Test router connection
        - get_connection_quality: Get connection quality metrics
        - bulk_test: Test multiple routers
        """
        action = request.data.get('action')
        
        if action == 'test_connection':
            if pk:
                return self.test_single_connection(request, pk)
            else:
                return self.test_multiple_connections(request)
        elif action == 'get_connection_quality':
            return self.get_connection_quality(request, pk)
        elif action == 'bulk_test':
            return self.bulk_test_connections(request)
        else:
            return Response(
                {
                    'error': 'Invalid action',
                    'available_actions': ['test_connection', 'get_connection_quality', 'bulk_test']
                }, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def test_single_connection(self, request, pk):
        """Test connection for a single router."""
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
    
    def test_multiple_connections(self, request):
        """Test connections for multiple routers specified in request."""
        router_ids = request.data.get('router_ids', [])
        
        if not router_ids:
            return Response(
                {
                    'error': 'router_ids is required',
                    'message': 'Please provide a list of router IDs to test'
                }, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        results = {
            'total': len(router_ids),
            'successful': 0,
            'failed': 0,
            'details': {}
        }
        
        for router_id in router_ids:
            try:
                router = Router.objects.get(id=router_id, is_active=True)
                success, test_results, message = self.test_router_connection(router, request)
                
                if success:
                    results['successful'] += 1
                    results['details'][str(router_id)] = {
                        'status': 'success',
                        'message': 'Connection test successful',
                        'response_time': test_results.get('response_time'),
                        'router_name': router.name
                    }
                else:
                    results['failed'] += 1
                    results['details'][str(router_id)] = {
                        'status': 'failed',
                        'message': test_results.get('error_messages', ['Unknown error'])[0],
                        'response_time': test_results.get('response_time'),
                        'router_name': router.name
                    }
                    
            except Router.DoesNotExist:
                results['failed'] += 1
                results['details'][str(router_id)] = {
                    'status': 'error',
                    'message': 'Router not found or inactive',
                    'router_name': 'Unknown'
                }
            except Exception as e:
                results['failed'] += 1
                results['details'][str(router_id)] = {
                    'status': 'error',
                    'message': str(e),
                    'router_name': 'Unknown'
                }
        
        # Create audit log for bulk operation (no router associated)
        self.create_audit_log(
            router=None,  # This will now work since router is nullable
            action='bulk_operation',
            description=f"Bulk connection test: {results['successful']} successful, {results['failed']} failed",
            user=request.user,
            request=request,
            changes=results,
            status_code=200
        )
        
        return Response(results)
    
    def get_connection_quality(self, request, pk):
        """Get connection quality metrics for router."""
        router = self.get_router(pk)
        
        quality_data = router.get_connection_quality()
        
        response_data = {
            'router': {
                'id': router.id,
                'name': router.name,
                'ip': router.ip
            },
            'connection_quality': quality_data
        }
        
        return Response(response_data)
    
    def bulk_test_connections(self, request):
        """Bulk test connections for all active routers."""
        routers = Router.objects.filter(is_active=True)
        
        results = {
            'total': routers.count(),
            'successful': 0,
            'failed': 0,
            'details': {}
        }
        
        for router in routers:
            try:
                success, test_results, message = self.test_router_connection(router, request)
                
                if success:
                    results['successful'] += 1
                    results['details'][str(router.id)] = {
                        'status': 'success',
                        'message': 'Connection test successful',
                        'response_time': test_results.get('response_time'),
                        'router_name': router.name
                    }
                else:
                    results['failed'] += 1
                    results['details'][str(router.id)] = {
                        'status': 'failed',
                        'message': test_results.get('error_messages', ['Unknown error'])[0],
                        'response_time': test_results.get('response_time'),
                        'router_name': router.name
                    }
                    
            except Exception as e:
                results['failed'] += 1
                results['details'][str(router.id)] = {
                    'status': 'error',
                    'message': str(e),
                    'router_name': router.name
                }
        
        # Create audit log for bulk operation (no router associated)
        self.create_audit_log(
            router=None,  # This will now work since router is nullable
            action='bulk_operation',
            description=f"Complete bulk connection test: {results['successful']} successful, {results['failed']} failed",
            user=request.user,
            request=request,
            changes=results,
            status_code=200
        )
        
        return Response(results)


class RouterStatusView(RouterBaseView):
    """
    API View for router status management and monitoring.
    """
    
    def get(self, request, pk=None):
        """Get router status information."""
        if pk:
            return self.get_single_router_status(request, pk)
        else:
            return self.get_all_routers_status(request)
    
    def get_single_router_status(self, request, pk):
        """Get detailed status for a single router."""
        router = self.get_router(pk)
        
        status_data = {
            'router': {
                'id': router.id,
                'name': router.name,
                'ip': router.ip
            },
            'status': router.status,
            'connection_status': router.connection_status,
            'configuration_status': router.configuration_status,
            'last_seen': router.last_seen,
            'last_connection_test': router.last_connection_test,
            'connection_quality': router.get_connection_quality(),
            'active_users': router.get_active_users_count(),
            'system_info': {
                'firmware_version': router.firmware_version,
                'type': router.type,
                'ssid': router.ssid
            }
        }
        
        return Response(status_data)
    
    def get_all_routers_status(self, request):
        """Get status overview for all routers."""
        routers = Router.objects.filter(is_active=True)
        
        status_overview = {
            'total_routers': routers.count(),
            'online_routers': routers.filter(connection_status='connected').count(),
            'offline_routers': routers.filter(connection_status='disconnected').count(),
            'connection_testing_routers': routers.filter(connection_status='testing').count(),
            'configured_routers': routers.filter(configuration_status='configured').count(),
            'not_configured_routers': routers.filter(configuration_status='not_configured').count(),
            'routers': []
        }
        
        for router in routers:
            router_status = {
                'id': router.id,
                'name': router.name,
                'ip': router.ip,
                'status': router.status,
                'connection_status': router.connection_status,
                'configuration_status': router.configuration_status,
                'last_seen': router.last_seen,
                'active_users': router.get_active_users_count(),
                'connection_quality': router.get_connection_quality().get('quality', 'unknown')
            }
            status_overview['routers'].append(router_status)
        
        # Ensure routers list is never None
        if not status_overview['routers']:
            status_overview['routers'] = []
            
        return Response(status_overview)
    
    def post(self, request, pk):
        """Update router status."""
        router = self.get_router(pk)
        
        new_status = request.data.get('status')
        new_connection_status = request.data.get('connection_status')
        
        old_status = router.status
        old_connection_status = router.connection_status
        
        changes = {}
        
        if new_status and new_status != router.status:
            router.status = new_status
            changes['status'] = {'old': old_status, 'new': new_status}
        
        if new_connection_status and new_connection_status != router.connection_status:
            router.connection_status = new_connection_status
            changes['connection_status'] = {'old': old_connection_status, 'new': new_connection_status}
        
        if changes:
            router.save()
            
            self.create_audit_log(
                router=router,
                action='status_change',
                description=f"Router status updated: {old_status}->{new_status}, {old_connection_status}->{new_connection_status}",
                user=request.user,
                request=request,
                changes=changes,
                status_code=200
            )
            
            self.clear_router_cache(pk)
            self.clear_routers_cache()
            
            WebSocketManager.send_router_update(
                pk, 
                'status_updated', 
                {
                    'name': router.name,
                    'status': router.status,
                    'connection_status': router.connection_status,
                    'changes': changes
                }
            )
            
            return Response({
                'message': 'Router status updated successfully',
                'changes': changes
            })
        else:
            return Response({
                'message': 'No changes made to router status'
            }, status=status.HTTP_304_NOT_MODIFIED)






class NetworkServiceOperationsView(APIView):
    """
    Integration endpoint for Service Operations app
    Handles subscription activation requests from Service Operations
    """
    
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Activate subscription on network (called by Service Operations)"""
        try:
            data = request.data
            subscription_id = data.get('subscription_id')
            client_id = data.get('client_id')
            plan_id = data.get('plan_id')
            access_method = data.get('access_method', 'hotspot')
            
            logger.info(f"Service Operations activation request: subscription={subscription_id}, client={client_id}")
            
            # Validate required fields
            if not all([subscription_id, client_id, plan_id]):
                return Response(
                    {"error": "Missing required fields: subscription_id, client_id, plan_id"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Find client
            from account.models.admin_model import Client
            try:
                client = Client.objects.get(id=client_id, is_active=True)
            except Client.DoesNotExist:
                return Response(
                    {"error": f"Client not found or inactive: {client_id}"},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Find router (choose default or first available)
            from network_management.models.router_management_model import Router
            router = Router.objects.filter(
                is_active=True, 
                status='connected',
                is_default=True
            ).first()
            
            if not router:
                # Fallback to any connected router
                router = Router.objects.filter(
                    is_active=True, 
                    status='connected'
                ).first()
            
            if not router:
                return Response(
                    {"error": "No active routers available for activation"},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE
                )
            
            # Create activation record
            from network_management.models.router_management_model import ServiceOperationActivation
            import uuid
            
            activation = ServiceOperationActivation.objects.create(
                service_operation_id=uuid.uuid4(),
                subscription_id=subscription_id,
                router=router,
                client=client,
                internet_plan_id=plan_id,
                activation_data=data,
                status='queued'
            )
            
            # Trigger async activation
            self._trigger_async_activation(activation)
            
            return Response({
                'success': True,
                'activation_id': str(activation.service_operation_id),
                'subscription_id': subscription_id,
                'router_id': router.id,
                'router_name': router.name,
                'status': 'queued',
                'message': 'Activation queued for processing',
                'estimated_completion': 'within 2 minutes',
                'timestamp': timezone.now().isoformat()
            }, status=status.HTTP_202_ACCEPTED)
            
        except Exception as e:
            logger.error(f"Service operations activation failed: {str(e)}")
            return Response(
                {
                    'success': False,
                    'error': f"Activation failed: {str(e)}",
                    'timestamp': timezone.now().isoformat()
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _trigger_async_activation(self, activation):
        """Trigger async activation processing"""
        try:
            # Import here to avoid circular imports
            from celery import shared_task
            from network_management.tasks.service_operations_tasks import process_service_operation_activation
            
            # Trigger async task
            process_service_operation_activation.delay(str(activation.service_operation_id))
            logger.info(f"Async activation triggered for {activation.service_operation_id}")
            
        except Exception as e:
            logger.error(f"Failed to trigger async activation: {e}")




class ServiceOperationsHealthView(APIView):
    """
    Health endpoint for Service Operations
    Provides health status of network management service
    """
    
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get comprehensive health status for network management"""
        try:
            # FIX: Import models locally
            from network_management.models.router_management_model import (
                HotspotUser, PPPoEUser, RouterHealthCheck
            )
            
            # Get connected routers count
            connected_routers = Router.objects.filter(
                status='connected', 
                is_active=True
            ).count()
            
            # Get total routers count
            total_routers = Router.objects.filter(is_active=True).count()
            
            # Get active users count
            active_hotspot_users = HotspotUser.objects.filter(active=True).count()
            active_pppoe_users = PPPoEUser.objects.filter(active=True).count()
            total_active_users = active_hotspot_users + active_pppoe_users
            
            # Get recent health check status
            recent_health_check = RouterHealthCheck.objects.filter(
                is_online=True
            ).order_by('-timestamp').first()
            
            # Determine overall health status
            health_score = recent_health_check.health_score if recent_health_check else 0
            is_healthy = (
                connected_routers > 0 and 
                recent_health_check and 
                health_score >= 60
            )
            
            status_info = {
                'service': 'network_management',
                'status': 'healthy' if is_healthy else 'degraded',
                'version': '1.0',
                'connected_routers': connected_routers,
                'total_routers': total_routers,
                'active_hotspot_users': active_hotspot_users,
                'active_pppoe_users': active_pppoe_users,
                'total_active_users': total_active_users,
                'recent_health_score': health_score,
                'last_health_check': recent_health_check.timestamp.isoformat() if recent_health_check else None,
                'timestamp': timezone.now().isoformat()
            }
            
            return Response(status_info)
            
        except Exception as e:
            logger.error(f"Health check failed: {str(e)}")
            return Response({
                'service': 'network_management',
                'status': 'error',
                'error': str(e),
                'timestamp': timezone.now().isoformat()
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

class ActivationStatusView(APIView):
    """
    Comprehensive activation status management for Service Operations
    Provides detailed status tracking, polling, and webhook integration
    """
    
    permission_classes = [IsAuthenticated]
    
    def get(self, request, activation_id):
        """
        Get detailed activation status by activation ID
        
        Query Parameters:
            include_details: Include detailed activation data (bool, default: true)
            include_router_info: Include router information (bool, default: false)
            include_client_info: Include client information (bool, default: false)
        """
        try:
            # Import models locally to avoid circular imports
            from network_management.models.router_management_model import ServiceOperationActivation
            from account.models.admin_model import Client
            from internet_plans.models.create_plan_models import InternetPlan
            
            include_details = request.query_params.get('include_details', 'true').lower() == 'true'
            include_router_info = request.query_params.get('include_router_info', 'false').lower() == 'true'
            include_client_info = request.query_params.get('include_client_info', 'false').lower() == 'true'
            
            # Get activation with related objects
            activation = ServiceOperationActivation.objects.select_related(
                'router',
                'client',
                'internet_plan'
            ).get(service_operation_id=activation_id)
            
            # Build base response
            response_data = self._build_base_response(activation)
            
            # Add detailed information if requested
            if include_details:
                response_data['details'] = self._get_detailed_information(activation)
            
            # Add router information if requested
            if include_router_info and activation.router:
                response_data['router_info'] = self._get_router_information(activation.router)
            
            # Add client information if requested
            if include_client_info and activation.client:
                response_data['client_info'] = self._get_client_information(activation.client)
            
            # Add progress information if processing
            if activation.status == 'processing':
                response_data['progress'] = self._get_activation_progress(activation)
            
            # Add health check information
            response_data['service_health'] = self._check_service_health(activation)
            
            # Update last accessed timestamp
            activation.activation_data['last_status_check'] = timezone.now().isoformat()
            activation.save(update_fields=['activation_data'])
            
            logger.info(f"Status retrieved for activation {activation_id}: {activation.status}")
            
            return Response(response_data)
            
        except ServiceOperationActivation.DoesNotExist:
            logger.warning(f"Activation not found: {activation_id}")
            return Response(
                {
                    'success': False,
                    'error': f'Activation not found: {activation_id}',
                    'timestamp': timezone.now().isoformat(),
                    'suggestions': [
                        'Check activation ID format (UUID expected)',
                        'Verify the activation exists in the system',
                        'Ensure you have proper permissions'
                    ]
                },
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Failed to get activation status for {activation_id}: {str(e)}", exc_info=True)
            return Response(
                {
                    'success': False,
                    'error': f'Failed to retrieve activation status: {str(e)}',
                    'activation_id': activation_id,
                    'timestamp': timezone.now().isoformat()
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def put(self, request, activation_id):
        """
        Update activation status (for internal/worker use)
        
        Request Body:
            status: New status (queued|processing|completed|failed|cancelled)
            error_message: Error message if failed (optional)
            progress: Progress percentage (0-100) (optional)
            details: Additional details (optional)
        """
        try:
            # Import model locally
            from network_management.models.router_management_model import ServiceOperationActivation
            
            data = request.data
            new_status = data.get('status')
            
            # Validate status
            valid_statuses = ['queued', 'processing', 'completed', 'failed', 'cancelled']
            if new_status not in valid_statuses:
                return Response(
                    {
                        'error': f'Invalid status: {new_status}. Valid statuses: {valid_statuses}',
                        'timestamp': timezone.now().isoformat()
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            activation = ServiceOperationActivation.objects.get(service_operation_id=activation_id)
            
            # Update activation
            old_status = activation.status
            activation.status = new_status
            
            if new_status in ['completed', 'failed', 'cancelled']:
                activation.completed_at = timezone.now()
            
            if 'error_message' in data:
                activation.error_message = data['error_message']
            
            # Update metadata
            if not activation.activation_data:
                activation.activation_data = {}
            
            activation.activation_data['status_updates'] = activation.activation_data.get('status_updates', [])
            activation.activation_data['status_updates'].append({
                'old_status': old_status,
                'new_status': new_status,
                'timestamp': timezone.now().isoformat(),
                'updated_by': request.user.username if request.user.is_authenticated else 'system',
                'progress': data.get('progress'),
                'details': data.get('details')
            })
            
            activation.save()
            
            # Trigger webhook if configured
            self._trigger_status_webhook(activation, old_status, new_status)
            
            # Log status change
            logger.info(
                f"Activation {activation_id} status updated: "
                f"{old_status} -> {new_status} by {request.user.username if request.user.is_authenticated else 'system'}"
            )
            
            return Response({
                'success': True,
                'activation_id': str(activation.service_operation_id),
                'old_status': old_status,
                'new_status': new_status,
                'message': f'Status updated from {old_status} to {new_status}',
                'completed_at': activation.completed_at.isoformat() if activation.completed_at else None,
                'timestamp': timezone.now().isoformat()
            })
            
        except ServiceOperationActivation.DoesNotExist:
            return Response(
                {'error': f'Activation not found: {activation_id}'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Failed to update activation status for {activation_id}: {str(e)}")
            return Response(
                {'error': f'Failed to update status: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def delete(self, request, activation_id):
        """
        Cancel an activation (soft delete)
        
        Request Body:
            reason: Cancellation reason (required)
            notify_client: Send notification to client (bool, default: true)
        """
        try:
            # Import models locally
            from network_management.models.router_management_model import ServiceOperationActivation
            
            data = request.data
            reason = data.get('reason')
            
            if not reason:
                return Response(
                    {'error': 'Cancellation reason is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            activation = ServiceOperationActivation.objects.get(service_operation_id=activation_id)
            
            # Check if cancellation is allowed
            if activation.status in ['completed', 'cancelled']:
                return Response(
                    {
                        'error': f'Cannot cancel activation with status: {activation.status}',
                        'current_status': activation.status
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Store old status
            old_status = activation.status
            
            # Update activation
            activation.status = 'cancelled'
            activation.error_message = f"Cancelled: {reason}"
            activation.completed_at = timezone.now()
            
            # Update metadata
            if not activation.activation_data:
                activation.activation_data = {}
            
            activation.activation_data['cancellation'] = {
                'reason': reason,
                'cancelled_by': request.user.username if request.user.is_authenticated else 'system',
                'cancelled_at': timezone.now().isoformat(),
                'old_status': old_status,
                'notify_client': data.get('notify_client', True),
                'request_data': data
            }
            
            activation.save()
            
            # Trigger cancellation webhook
            self._trigger_cancellation_webhook(activation, reason)
            
            # Notify client if requested
            if data.get('notify_client', True):
                self._notify_client_of_cancellation(activation, reason)
            
            # Log cancellation
            logger.info(
                f"Activation {activation_id} cancelled: "
                f"reason='{reason}', old_status={old_status}"
            )
            
            return Response({
                'success': True,
                'activation_id': str(activation.service_operation_id),
                'subscription_id': activation.subscription_id,
                'status': 'cancelled',
                'reason': reason,
                'old_status': old_status,
                'cancelled_at': activation.completed_at.isoformat(),
                'message': f'Activation cancelled successfully',
                'timestamp': timezone.now().isoformat()
            })
            
        except ServiceOperationActivation.DoesNotExist:
            return Response(
                {'error': f'Activation not found: {activation_id}'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Failed to cancel activation {activation_id}: {str(e)}")
            return Response(
                {'error': f'Failed to cancel activation: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def post(self, request, activation_id):
        """
        Retry a failed activation or trigger manual completion
        
        Request Body:
            action: 'retry' or 'complete' (required)
            force: Force retry even if max retries reached (bool, default: false)
            manual_completion_data: Data for manual completion (optional)
        """
        try:
            # Import models locally
            from network_management.models.router_management_model import ServiceOperationActivation
            from network_management.tasks.service_operations_tasks import retry_service_operation_activation
            
            data = request.data
            action = data.get('action')
            
            if action not in ['retry', 'complete']:
                return Response(
                    {
                        'error': f'Invalid action: {action}. Valid actions: retry, complete',
                        'timestamp': timezone.now().isoformat()
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            activation = ServiceOperationActivation.objects.get(service_operation_id=activation_id)
            
            if action == 'retry':
                return self._handle_retry_action(activation, data, request.user)
            elif action == 'complete':
                return self._handle_complete_action(activation, data, request.user)
                
        except ServiceOperationActivation.DoesNotExist:
            return Response(
                {'error': f'Activation not found: {activation_id}'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Failed to process action for activation {activation_id}: {str(e)}")
            return Response(
                {'error': f'Failed to process action: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    # Helper Methods
    def _build_base_response(self, activation):
        """Build base activation response"""
        from network_management.models.router_management_model import RouterStats
        from network_management.models.router_management_model import ServiceOperationActivation
        
        # Calculate estimated time remaining for processing activations
        estimated_completion = None
        if activation.status == 'processing':
            # Get average processing time from recent completions
            recent_completions = ServiceOperationActivation.objects.filter(
                status='completed',
                completed_at__isnull=False,
                created_at__gte=timezone.now() - timedelta(hours=1)
            )
            
            if recent_completions.exists():
                avg_seconds = sum(
                    (comp.completed_at - comp.created_at).total_seconds()
                    for comp in recent_completions
                ) / recent_completions.count()
                
                time_elapsed = (timezone.now() - activation.created_at).total_seconds()
                time_remaining = max(0, avg_seconds - time_elapsed)
                
                if time_remaining > 0:
                    estimated_completion = timezone.now() + timedelta(seconds=time_remaining)
        
        return {
            'success': True,
            'activation_id': str(activation.service_operation_id),
            'subscription_id': activation.subscription_id,
            'router_id': activation.router.id if activation.router else None,
            'router_name': activation.router.name if activation.router else None,
            'client_id': str(activation.client.id) if activation.client else None,
            'plan_id': str(activation.internet_plan.id) if activation.internet_plan else None,
            'plan_name': activation.internet_plan.name if activation.internet_plan else None,
            'status': activation.status,
            'created_at': activation.created_at.isoformat(),
            'updated_at': activation.updated_at.isoformat(),
            'completed_at': activation.completed_at.isoformat() if activation.completed_at else None,
            'error_message': activation.error_message,
            'estimated_completion': estimated_completion.isoformat() if estimated_completion else None,
            'retry_count': activation.activation_data.get('retry_count', 0) if activation.activation_data else 0,
            'priority': activation.activation_data.get('priority', 5) if activation.activation_data else 5,
            'timestamp': timezone.now().isoformat()
        }
    
    def _get_detailed_information(self, activation):
        """Get detailed activation information"""
        details = {
            'activation_data': activation.activation_data,
            'status_history': activation.activation_data.get('status_updates', []) if activation.activation_data else [],
            'access_method': activation.activation_data.get('access_method') if activation.activation_data else None,
            'client_type': activation.activation_data.get('client_type') if activation.activation_data else None,
            'technical_config': activation.activation_data.get('technical_config') if activation.activation_data else None,
            'queue_position': self._get_queue_position(activation),
            'last_status_check': activation.activation_data.get('last_status_check') if activation.activation_data else None,
            'webhook_url': activation.activation_data.get('webhook_url') if activation.activation_data else None,
        }
        
        # Add failure analysis if failed
        if activation.status == 'failed' and activation.error_message:
            details['failure_analysis'] = {
                'error_type': self._classify_error(activation.error_message),
                'suggested_action': self._get_suggested_action(activation.error_message),
                'retry_recommended': self._should_retry(activation),
                'technical_details': activation.activation_data.get('error_details') if activation.activation_data else None
            }
        
        return details
    
    def _get_router_information(self, router):
        """Get detailed router information"""
        from network_management.models.router_management_model import RouterStats
        
        latest_stats = router.stats.order_by('-timestamp').first()
        
        return {
            'id': router.id,
            'name': router.name,
            'ip': router.ip,
            'type': router.type,
            'status': router.status,
            'location': router.location,
            'max_clients': router.max_clients,
            'current_stats': {
                'cpu': latest_stats.cpu if latest_stats else None,
                'memory': latest_stats.memory if latest_stats else None,
                'connected_clients': latest_stats.connected_clients_count if latest_stats else None,
                'uptime': latest_stats.uptime if latest_stats else None
            } if latest_stats else None,
            'is_default': router.is_default,
            'last_seen': router.last_seen.isoformat() if router.last_seen else None,
            'health_score': self._get_router_health_score(router)
        }
    
    def _get_client_information(self, client):
        """Get client information (sanitized for security)"""
        user = client.user if hasattr(client, 'user') else None
        
        return {
            'id': client.id,
            'username': user.username if user else None,
            'email': user.email if user and hasattr(user, 'email') else None,
            'phone': user.phone_number if user and hasattr(user, 'phone_number') else None,
            'is_active': client.is_active if hasattr(client, 'is_active') else True,
            'created_at': client.created_at.isoformat() if hasattr(client, 'created_at') else None,
            'subscription_count': client.subscriptions.count() if hasattr(client, 'subscriptions') else 0
        }
    
    def _get_activation_progress(self, activation):
        """Get activation progress information"""
        if activation.status != 'processing':
            return None
        
        # Calculate progress based on status updates
        status_updates = activation.activation_data.get('status_updates', []) if activation.activation_data else []
        processing_updates = [u for u in status_updates if u.get('new_status') == 'processing']
        
        if not processing_updates:
            return {
                'percentage': 0,
                'stage': 'initializing',
                'message': 'Starting activation process'
            }
        
        latest_update = processing_updates[-1]
        progress = latest_update.get('progress', 0)
        
        # Map progress to stages
        if progress < 25:
            stage = 'initializing'
            message = 'Preparing activation'
        elif progress < 50:
            stage = 'configuring'
            message = 'Configuring network settings'
        elif progress < 75:
            stage = 'applying'
            message = 'Applying configuration to router'
        elif progress < 100:
            stage = 'verifying'
            message = 'Verifying activation'
        else:
            stage = 'completing'
            message = 'Finalizing activation'
        
        return {
            'percentage': progress,
            'stage': stage,
            'message': message,
            'last_progress_update': latest_update.get('timestamp'),
            'estimated_time_remaining': self._estimate_time_remaining(activation, progress)
        }
    
    def _check_service_health(self, activation):
        """Check service health for this activation"""
        from network_management.models.router_management_model import RouterHealthCheck
        from network_management.models.router_management_model import ServiceOperationActivation
        
        health_info = {
            'router_online': False,
            'service_available': True,
            'queue_health': 'good'
        }
        
        # Check router health
        if activation.router:
            latest_health = activation.router.health_checks.order_by('-timestamp').first()
            if latest_health:
                health_info['router_online'] = latest_health.is_online
                health_info['router_health_score'] = latest_health.health_score
                health_info['router_last_check'] = latest_health.timestamp.isoformat()
        
        # Check queue health
        pending_count = ServiceOperationActivation.objects.filter(
            status__in=['queued', 'processing'],
            created_at__gte=timezone.now() - timedelta(minutes=30)
        ).count()
        
        if pending_count > 50:
            health_info['queue_health'] = 'congested'
        elif pending_count > 20:
            health_info['queue_health'] = 'busy'
        elif pending_count > 5:
            health_info['queue_health'] = 'moderate'
        else:
            health_info['queue_health'] = 'good'
        
        health_info['pending_activations'] = pending_count
        
        return health_info
    
    def _get_queue_position(self, activation):
        """Get position in activation queue"""
        from network_management.models.router_management_model import ServiceOperationActivation
        if activation.status != 'queued':
            return None
        
        # Count activations queued before this one
        position = ServiceOperationActivation.objects.filter(
            status='queued',
            created_at__lt=activation.created_at
        ).count() + 1
        
        return position
    
    def _classify_error(self, error_message):
        """Classify error type from error message"""
        error_lower = error_message.lower()
        
        if any(word in error_lower for word in ['timeout', 'timed out', 'time out']):
            return 'timeout'
        elif any(word in error_lower for word in ['connection', 'connect', 'network']):
            return 'connection'
        elif any(word in error_lower for word in ['auth', 'authenticate', 'password', 'credentials']):
            return 'authentication'
        elif any(word in error_lower for word in ['router', 'device', 'hardware']):
            return 'router'
        elif any(word in error_lower for word in ['client', 'user', 'account']):
            return 'client'
        elif any(word in error_lower for word in ['config', 'configuration', 'settings']):
            return 'configuration'
        elif any(word in error_lower for word in ['database', 'query', 'sql']):
            return 'database'
        elif any(word in error_lower for word in ['memory', 'cpu', 'resource']):
            return 'resource'
        else:
            return 'unknown'
    
    def _get_suggested_action(self, error_message):
        """Get suggested action based on error type"""
        error_type = self._classify_error(error_message)
        
        suggestions = {
            'timeout': 'Check network connectivity and try again. Increase timeout if necessary.',
            'connection': 'Verify router is online and network connection is stable.',
            'authentication': 'Check router credentials and permissions.',
            'router': 'Restart router or check hardware status.',
            'client': 'Verify client account status and subscription details.',
            'configuration': 'Review activation configuration and parameters.',
            'database': 'Check database connectivity and performance.',
            'resource': 'Check system resources (memory, CPU) and optimize.',
            'unknown': 'Contact system administrator for investigation.'
        }
        
        return suggestions.get(error_type, 'Contact support for assistance.')
    
    def _should_retry(self, activation):
        """Determine if activation should be retried"""
        if activation.status != 'failed':
            return False
        
        error_type = self._classify_error(activation.error_message)
        
        # Retry transient errors
        retry_errors = ['timeout', 'connection', 'resource']
        if error_type in retry_errors:
            retry_count = activation.activation_data.get('retry_count', 0) if activation.activation_data else 0
            return retry_count < 3  # Max 3 retries
        
        return False
    
    def _get_router_health_score(self, router):
        """Get router health score"""
        latest_health = router.health_checks.order_by('-timestamp').first()
        return latest_health.health_score if latest_health else 0
    
    def _estimate_time_remaining(self, activation, progress):
        """Estimate time remaining for activation"""
        if progress >= 100:
            return 0
        
        time_elapsed = (timezone.now() - activation.created_at).total_seconds()
        
        if progress > 0:
            estimated_total = time_elapsed * (100 / progress)
            remaining = estimated_total - time_elapsed
            return max(0, remaining)
        
        return None
    
    def _trigger_status_webhook(self, activation, old_status, new_status):
        """Trigger webhook for status change"""
        webhook_url = activation.activation_data.get('webhook_url') if activation.activation_data else None
        
        if not webhook_url:
            return
        
        try:
            import requests
            from django.conf import settings
            
            payload = {
                'activation_id': str(activation.service_operation_id),
                'subscription_id': activation.subscription_id,
                'old_status': old_status,
                'new_status': new_status,
                'timestamp': timezone.now().isoformat(),
                'router_id': activation.router.id if activation.router else None,
                'client_id': str(activation.client.id) if activation.client else None,
                'error_message': activation.error_message
            }
            
            response = requests.post(
                webhook_url,
                json=payload,
                headers={'Content-Type': 'application/json'},
                timeout=5
            )
            
            logger.info(f"Webhook triggered for activation {activation.service_operation_id}: {response.status_code}")
            
        except Exception as e:
            logger.warning(f"Failed to trigger webhook for activation {activation.service_operation_id}: {e}")
    
    def _trigger_cancellation_webhook(self, activation, reason):
        """Trigger webhook for cancellation"""
        webhook_url = activation.activation_data.get('cancellation_webhook_url') if activation.activation_data else None
        
        if not webhook_url:
            webhook_url = activation.activation_data.get('webhook_url') if activation.activation_data else None
        
        if not webhook_url:
            return
        
        try:
            import requests
            
            payload = {
                'activation_id': str(activation.service_operation_id),
                'subscription_id': activation.subscription_id,
                'action': 'cancelled',
                'reason': reason,
                'timestamp': timezone.now().isoformat(),
                'cancelled_by': activation.activation_data.get('cancellation', {}).get('cancelled_by', 'system'),
                'old_status': activation.activation_data.get('cancellation', {}).get('old_status')
            }
            
            response = requests.post(
                webhook_url,
                json=payload,
                headers={'Content-Type': 'application/json'},
                timeout=5
            )
            
            logger.info(f"Cancellation webhook triggered: {response.status_code}")
            
        except Exception as e:
            logger.warning(f"Failed to trigger cancellation webhook: {e}")
    
    def _notify_client_of_cancellation(self, activation, reason):
        """Notify client of cancellation"""
        # This would integrate with your notification system
        # For now, just log it
        logger.info(
            f"Client notification for cancellation: "
            f"activation={activation.service_operation_id}, "
            f"client={activation.client.id if activation.client else 'unknown'}, "
            f"reason={reason}"
        )
    
    def _handle_retry_action(self, activation, data, user):
        """Handle retry action"""
        from network_management.tasks.service_operations_tasks import retry_service_operation_activation
        
        # Check if retry is allowed
        if activation.status not in ['failed', 'cancelled']:
            return Response(
                {
                    'error': f'Cannot retry activation with status: {activation.status}',
                    'allowed_statuses': ['failed', 'cancelled']
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check max retries
        retry_count = activation.activation_data.get('retry_count', 0) if activation.activation_data else 0
        if retry_count >= 3 and not data.get('force', False):
            return Response(
                {
                    'error': 'Maximum retries reached (3). Use force=true to override.',
                    'retry_count': retry_count,
                    'max_retries': 3
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update activation for retry
        old_status = activation.status
        activation.status = 'queued'
        activation.error_message = None
        
        if not activation.activation_data:
            activation.activation_data = {}
        
        activation.activation_data['retry_count'] = retry_count + 1
        activation.activation_data['retry_initiated_by'] = user.username if user.is_authenticated else 'system'
        activation.activation_data['retry_initiated_at'] = timezone.now().isoformat()
        activation.activation_data['retry_reason'] = data.get('reason', 'Manual retry requested')
        
        activation.save()
        
        # Trigger retry task
        retry_service_operation_activation.delay(str(activation.service_operation_id))
        
        return Response({
            'success': True,
            'activation_id': str(activation.service_operation_id),
            'action': 'retry',
            'old_status': old_status,
            'new_status': 'queued',
            'retry_count': retry_count + 1,
            'message': 'Activation queued for retry',
            'timestamp': timezone.now().isoformat()
        })
    
    def _handle_complete_action(self, activation, data, user):
        """Handle manual completion action"""
        # Validate activation can be completed
        if activation.status == 'completed':
            return Response(
                {
                    'error': 'Activation is already completed',
                    'current_status': activation.status
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update activation
        old_status = activation.status
        activation.status = 'completed'
        activation.completed_at = timezone.now()
        
        if not activation.activation_data:
            activation.activation_data = {}
        
        activation.activation_data['manual_completion'] = {
            'completed_by': user.username if user.is_authenticated else 'system',
            'completed_at': timezone.now().isoformat(),
            'old_status': old_status,
            'reason': data.get('reason', 'Manually completed'),
            'completion_data': data.get('manual_completion_data', {})
        }
        
        activation.save()
        
        # Trigger completion webhook
        self._trigger_status_webhook(activation, old_status, 'completed')
        
        return Response({
            'success': True,
            'activation_id': str(activation.service_operation_id),
            'action': 'complete',
            'old_status': old_status,
            'new_status': 'completed',
            'completed_at': activation.completed_at.isoformat(),
            'message': 'Activation manually completed',
            'timestamp': timezone.now().isoformat()
        })