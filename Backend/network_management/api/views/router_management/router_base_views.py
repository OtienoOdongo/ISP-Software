

# # network_management/api/views/router_management/router_base_views.py


# """
# Enhanced Base Router Management Views for Network Management System

# This module provides core API views for router CRUD operations with integrated
# connection testing and dynamic SSID support.
# """

# import logging
# from django.utils import timezone
# from django.db import transaction
# from django.shortcuts import get_object_or_404
# from django.db.models import Q
# from django.core.cache import cache
# from django.db import models

# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework import status
# from rest_framework.permissions import IsAuthenticated

# from network_management.utils.mikrotik_connector import MikroTikConnector
# from network_management.models.router_management_model import Router, RouterAuditLog, RouterConnectionTest
# from network_management.serializers.router_management_serializer import RouterSerializer, RouterListSerializer
# from network_management.utils.websocket_utils import WebSocketManager

# logger = logging.getLogger(__name__)


# class RouterBaseView(APIView):
#     """
#     Enhanced base view class for router operations with connection management.
#     """
#     permission_classes = [IsAuthenticated]
    
#     def get_router(self, pk):
#         """Retrieve router instance with common checks."""
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
#                 f"router:{router_id}:health_comprehensive",
#                 f"router:{router_id}:connection_tests"
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
    
#     def create_audit_log(self, router, action, description, user, request, changes=None, status_code=None):
#         """Create standardized audit log entry."""
#         audit_log_data = {
#             'action': action,
#             'description': description,
#             'user': user,
#             'ip_address': self.get_client_ip(request),
#             'user_agent': request.META.get('HTTP_USER_AGENT', ''),
#             'changes': changes or {},
#             'status_code': status_code
#         }
        
#         # Only add router if it's provided (router is now nullable)
#         if router is not None:
#             audit_log_data['router'] = router
        
#         return RouterAuditLog.objects.create(**audit_log_data)
    
#     def get_client_ip(self, request):
#         """Get client IP address."""
#         x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
#         if x_forwarded_for:
#             return x_forwarded_for.split(',')[0]
#         else:
#             return request.META.get('REMOTE_ADDR')
    
#     def test_router_connection(self, router, request):
#         """
#         Test router connection and update status.
        
#         Returns:
#             tuple: (success: bool, test_results: dict, message: str)
#         """
#         try:
#             connector = MikroTikConnector(
#                 ip=router.ip,
#                 username=router.username,
#                 password=router.password,
#                 port=router.port
#             )
            
#             test_results = connector.test_connection()
            
#             # Save connection test results
#             connection_test = RouterConnectionTest.objects.create(
#                 router=router,
#                 success=test_results.get('system_access', False),
#                 response_time=test_results.get('response_time'),
#                 system_info=test_results.get('system_info', {}),
#                 error_messages=test_results.get('error_messages', []),
#                 tested_by=request.user
#             )
            
#             # Update router connection status
#             if test_results.get('system_access'):
#                 router.connection_status = 'connected'
#                 router.last_connection_test = timezone.now()
#                 # Update system info if available
#                 if test_results.get('system_info'):
#                     router.firmware_version = test_results['system_info'].get('version', router.firmware_version)
#                 message = "Connection test successful"
#             else:
#                 router.connection_status = 'disconnected'
#                 message = "Connection test failed"
            
#             router.save()
            
#             # Create audit log
#             self.create_audit_log(
#                 router=router,
#                 action='connection_test',
#                 description=f"Connection test {'succeeded' if test_results.get('system_access') else 'failed'}",
#                 user=request.user,
#                 request=request,
#                 changes={
#                     'success': test_results.get('system_access', False),
#                     'response_time': test_results.get('response_time'),
#                     'error_messages': test_results.get('error_messages', [])
#                 },
#                 status_code=200 if test_results.get('system_access') else 400
#             )
            
#             return test_results.get('system_access', False), test_results, message
            
#         except Exception as e:
#             logger.error(f"Connection test failed for router {router.id}: {str(e)}")
            
#             # Save failed test
#             RouterConnectionTest.objects.create(
#                 router=router,
#                 success=False,
#                 response_time=None,
#                 system_info={},
#                 error_messages=[f"Connection test failed: {str(e)}"],
#                 tested_by=request.user
#             )
            
#             self.create_audit_log(
#                 router=router,
#                 action='connection_test',
#                 description=f"Connection test failed: {str(e)}",
#                 user=request.user,
#                 request=request,
#                 changes={
#                     'success': False,
#                     'error_messages': [f"Connection test failed: {str(e)}"]
#                 },
#                 status_code=500
#             )
            
#             router.connection_status = 'disconnected'
#             router.last_connection_test = timezone.now()
#             router.save()
            
#             return False, {}, f"Connection test failed: {str(e)}"


# class RouterListView(RouterBaseView):
#     """
#     Enhanced API View for listing and creating routers with connection testing.
#     """
    
#     def get(self, request):
#         """Retrieve a list of routers with enhanced filtering and connection status."""
#         search = request.query_params.get('search', '')
#         status_filter = request.query_params.get('status', 'all')
#         router_type = request.query_params.get('type', '')
#         connection_status = request.query_params.get('connection_status', 'all')
#         configuration_status = request.query_params.get('configuration_status', 'all')
        
#         cache_key = f"routers:list:{search}:{status_filter}:{router_type}:{connection_status}:{configuration_status}"
#         cached_data = cache.get(cache_key)
        
#         if cached_data:
#             return Response(cached_data)

#         routers = Router.objects.filter(is_active=True)
        
#         # Enhanced search across multiple fields
#         if search:
#             routers = routers.filter(
#                 Q(name__icontains=search) |
#                 Q(ip__icontains=search) |
#                 Q(location__icontains=search) |
#                 Q(ssid__icontains=search) |
#                 Q(description__icontains=search) |
#                 Q(firmware_version__icontains=search)
#             )
        
#         if status_filter != 'all':
#             routers = routers.filter(status=status_filter)
            
#         if router_type:
#             routers = routers.filter(type=router_type)
            
#         # Connection status filtering
#         if connection_status != 'all':
#             routers = routers.filter(connection_status=connection_status)
            
#         # Configuration status filtering
#         if configuration_status != 'all':
#             routers = routers.filter(configuration_status=configuration_status)

#         # Use list serializer for better performance
#         serializer = RouterListSerializer(routers, many=True)
        
#         response_data = serializer.data
#         cache.set(cache_key, response_data, 120)  # Cache for 2 minutes
        
#         return Response(response_data)

#     def post(self, request):
#         """Create a new router instance with optional connection testing."""
#         # Check if auto-connection test is requested
#         auto_test_connection = request.data.get('auto_test_connection', False)
        
#         serializer = RouterSerializer(
#             data=request.data, 
#             context={'auto_test_connection': auto_test_connection}
#         )
        
#         if serializer.is_valid():
#             with transaction.atomic():
#                 router = serializer.save(status="disconnected")
#                 router.callback_url = f"{request.build_absolute_uri('/')[:-1]}/api/payments/mpesa-callbacks/dispatch/{router.id}/"
#                 router.save()
                
#                 # Perform connection test if requested
#                 connection_test_results = None
#                 if auto_test_connection:
#                     success, test_results, message = self.test_router_connection(router, request)
#                     connection_test_results = {
#                         'success': success,
#                         'message': message,
#                         'test_results': test_results
#                     }
                
#                 self.create_audit_log(
#                     router=router,
#                     action='create',
#                     description=f"Router {router.name} created",
#                     user=request.user,
#                     request=request,
#                     changes={
#                         **request.data,
#                         'auto_tested_connection': auto_test_connection,
#                         'connection_test_results': connection_test_results
#                     },
#                     status_code=201
#                 )
                
#                 self.clear_routers_cache()
#                 WebSocketManager.send_router_update(
#                     router.id, 
#                     'router_created', 
#                     {
#                         'name': router.name,
#                         'connection_tested': auto_test_connection,
#                         'connection_status': router.connection_status
#                     }
#                 )
                
#                 # Include connection test results in response if performed
#                 response_data = RouterSerializer(router).data
#                 if connection_test_results:
#                     response_data['connection_test'] = connection_test_results
                
#             return Response(response_data, status=status.HTTP_201_CREATED)
        
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# class RouterDetailView(RouterBaseView):
#     """
#     Enhanced API View for retrieving, updating, and deleting individual routers
#     with integrated connection management.
#     """
    
#     def get(self, request, pk):
#         """Retrieve detailed information about a specific router with connection status."""
#         cache_key = f"router:{pk}:detail"
#         cached_data = cache.get(cache_key)
        
#         if cached_data:
#             return Response(cached_data)

#         router = self.get_router(pk)
#         serializer = RouterSerializer(router)
        
#         response_data = serializer.data
#         cache.set(cache_key, response_data, 300)  # Cache for 5 minutes
        
#         return Response(response_data)

#     def put(self, request, pk):
#         """Update a router instance with connection validation."""
#         router = self.get_router(pk)
#         old_data = RouterSerializer(router).data
        
#         # Check if connection test is requested
#         test_connection = request.data.get('test_connection', False)
        
#         serializer = RouterSerializer(router, data=request.data, partial=True)
#         if serializer.is_valid():
#             with transaction.atomic():
#                 router = serializer.save()
                
#                 # Perform connection test if requested
#                 connection_test_results = None
#                 if test_connection:
#                     success, test_results, message = self.test_router_connection(router, request)
#                     connection_test_results = {
#                         'success': success,
#                         'message': message,
#                         'test_results': test_results
#                     }
                
#                 changes = self.get_changes(old_data, request.data)
#                 self.create_audit_log(
#                     router=router,
#                     action='update',
#                     description=f"Router {router.name} updated",
#                     user=request.user,
#                     request=request,
#                     changes={
#                         **changes,
#                         'connection_tested': test_connection,
#                         'connection_test_results': connection_test_results
#                     },
#                     status_code=200
#                 )
                
#                 self.clear_router_cache(pk)
#                 self.clear_routers_cache()
                
#                 update_data = {
#                     'name': router.name, 
#                     'changes': changes,
#                     'connection_tested': test_connection,
#                     'connection_status': router.connection_status
#                 }
#                 WebSocketManager.send_router_update(pk, 'router_updated', update_data)
                
#                 # Include connection test results in response if performed
#                 response_data = serializer.data
#                 if connection_test_results:
#                     response_data['connection_test'] = connection_test_results
                
#             return Response(response_data)
        
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#     def delete(self, request, pk):
#         """Soft delete a router instance."""
#         router = self.get_router(pk)
        
#         with transaction.atomic():
#             router.is_active = False
#             router.status = "disconnected"
#             router.connection_status = "disconnected"
#             router.save()
            
#             self.create_audit_log(
#                 router=router,
#                 action='delete',
#                 description=f"Router {router.name} deleted",
#                 user=request.user,
#                 request=request,
#                 changes={
#                     'old_status': router.status,
#                     'old_connection_status': router.connection_status
#                 },
#                 status_code=204
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

#     def post(self, request, pk):
#         """
#         Additional operations on specific router.
#         Currently used for connection testing.
#         """
#         action = request.data.get('action')
        
#         if action == 'test_connection':
#             return self.test_connection(request, pk)
#         elif action == 'get_connection_history':
#             return self.get_connection_history(request, pk)
#         else:
#             return Response(
#                 {"error": "Invalid action"}, 
#                 status=status.HTTP_400_BAD_REQUEST
#             )

#     def test_connection(self, request, pk):
#         """Test connection to specific router."""
#         router = self.get_router(pk)
        
#         success, test_results, message = self.test_router_connection(router, request)
        
#         response_data = {
#             'success': success,
#             'message': message,
#             'test_results': test_results,
#             'router': {
#                 'id': router.id,
#                 'name': router.name,
#                 'ip': router.ip,
#                 'connection_status': router.connection_status
#             }
#         }
        
#         return Response(response_data)

#     def get_connection_history(self, request, pk):
#         """Get connection test history for router."""
#         router = self.get_router(pk)
        
#         days = int(request.query_params.get('days', 7))
#         start_date = timezone.now() - timezone.timedelta(days=days)
        
#         from network_management.serializers.router_management_serializer import RouterConnectionTestSerializer
        
#         connection_tests = RouterConnectionTest.objects.filter(
#             router=router,
#             tested_at__gte=start_date
#         ).order_by('-tested_at')
        
#         serializer = RouterConnectionTestSerializer(connection_tests, many=True)
        
#         # Calculate statistics
#         total_tests = connection_tests.count()
#         successful_tests = connection_tests.filter(success=True).count()
#         success_rate = (successful_tests / total_tests * 100) if total_tests > 0 else 0
        
#         # Calculate average response time from successful tests only
#         successful_response_times = connection_tests.filter(
#             success=True, 
#             response_time__isnull=False
#         ).values_list('response_time', flat=True)
        
#         avg_response_time = sum(successful_response_times) / len(successful_response_times) if successful_response_times else 0
        
#         statistics = {
#             'total_tests': total_tests,
#             'successful_tests': successful_tests,
#             'success_rate': round(success_rate, 2),
#             'average_response_time': round(avg_response_time, 3),
#             'time_period_days': days
#         }
        
#         return Response({
#             'router': {
#                 'id': router.id,
#                 'name': router.name,
#                 'ip': router.ip
#             },
#             'connection_tests': serializer.data,
#             'statistics': statistics
#         })


# class RouterConnectionManagementView(RouterBaseView):
#     """
#     Enhanced API View for router connection management operations.
#     """
    
#     def post(self, request, pk=None):
#         """
#         Handle connection management operations.
        
#         Actions:
#         - test_connection: Test router connection
#         - get_connection_quality: Get connection quality metrics
#         - bulk_test: Test multiple routers
#         """
#         action = request.data.get('action')
        
#         if action == 'test_connection':
#             if pk:
#                 return self.test_single_connection(request, pk)
#             else:
#                 return self.test_multiple_connections(request)
#         elif action == 'get_connection_quality':
#             return self.get_connection_quality(request, pk)
#         elif action == 'bulk_test':
#             return self.bulk_test_connections(request)
#         else:
#             return Response(
#                 {"error": "Invalid action"}, 
#                 status=status.HTTP_400_BAD_REQUEST
#             )
    
#     def test_single_connection(self, request, pk):
#         """Test connection for a single router."""
#         router = self.get_router(pk)
        
#         success, test_results, message = self.test_router_connection(router, request)
        
#         response_data = {
#             'success': success,
#             'message': message,
#             'test_results': test_results,
#             'router': {
#                 'id': router.id,
#                 'name': router.name,
#                 'ip': router.ip,
#                 'connection_status': router.connection_status
#             }
#         }
        
#         return Response(response_data)
    
#     def test_multiple_connections(self, request):
#         """Test connections for multiple routers specified in request."""
#         router_ids = request.data.get('router_ids', [])
        
#         if not router_ids:
#             return Response(
#                 {"error": "router_ids is required"}, 
#                 status=status.HTTP_400_BAD_REQUEST
#             )
        
#         results = {
#             'total': len(router_ids),
#             'successful': 0,
#             'failed': 0,
#             'details': {}
#         }
        
#         for router_id in router_ids:
#             try:
#                 router = Router.objects.get(id=router_id, is_active=True)
#                 success, test_results, message = self.test_router_connection(router, request)
                
#                 if success:
#                     results['successful'] += 1
#                     results['details'][router_id] = {
#                         'status': 'success',
#                         'message': 'Connection test successful',
#                         'response_time': test_results.get('response_time')
#                     }
#                 else:
#                     results['failed'] += 1
#                     results['details'][router_id] = {
#                         'status': 'failed',
#                         'message': test_results.get('error_messages', ['Unknown error'])[0],
#                         'response_time': test_results.get('response_time')
#                     }
                    
#             except Router.DoesNotExist:
#                 results['failed'] += 1
#                 results['details'][router_id] = {
#                     'status': 'error',
#                     'message': 'Router not found'
#                 }
#             except Exception as e:
#                 results['failed'] += 1
#                 results['details'][router_id] = {
#                     'status': 'error',
#                     'message': str(e)
#                 }
        
#         # Create audit log for bulk operation (no router associated)
#         self.create_audit_log(
#             router=None,  # This will now work since router is nullable
#             action='bulk_operation',
#             description=f"Bulk connection test: {results['successful']} successful, {results['failed']} failed",
#             user=request.user,
#             request=request,
#             changes=results,
#             status_code=200
#         )
        
#         return Response(results)
    
#     def get_connection_quality(self, request, pk):
#         """Get connection quality metrics for router."""
#         router = self.get_router(pk)
        
#         quality_data = router.get_connection_quality()
        
#         response_data = {
#             'router': {
#                 'id': router.id,
#                 'name': router.name,
#                 'ip': router.ip
#             },
#             'connection_quality': quality_data
#         }
        
#         return Response(response_data)
    
#     def bulk_test_connections(self, request):
#         """Bulk test connections for all active routers."""
#         routers = Router.objects.filter(is_active=True)
        
#         results = {
#             'total': routers.count(),
#             'successful': 0,
#             'failed': 0,
#             'details': {}
#         }
        
#         for router in routers:
#             try:
#                 success, test_results, message = self.test_router_connection(router, request)
                
#                 if success:
#                     results['successful'] += 1
#                     results['details'][router.id] = {
#                         'status': 'success',
#                         'message': 'Connection test successful',
#                         'response_time': test_results.get('response_time')
#                     }
#                 else:
#                     results['failed'] += 1
#                     results['details'][router.id] = {
#                         'status': 'failed',
#                         'message': test_results.get('error_messages', ['Unknown error'])[0],
#                         'response_time': test_results.get('response_time')
#                     }
                    
#             except Exception as e:
#                 results['failed'] += 1
#                 results['details'][router.id] = {
#                     'status': 'error',
#                     'message': str(e)
#                 }
        
#         # Create audit log for bulk operation (no router associated)
#         self.create_audit_log(
#             router=None,  # This will now work since router is nullable
#             action='bulk_operation',
#             description=f"Complete bulk connection test: {results['successful']} successful, {results['failed']} failed",
#             user=request.user,
#             request=request,
#             changes=results,
#             status_code=200
#         )
        
#         return Response(results)


# class RouterStatusView(RouterBaseView):
#     """
#     API View for router status management and monitoring.
#     """
    
#     def get(self, request, pk=None):
#         """Get router status information."""
#         if pk:
#             return self.get_single_router_status(request, pk)
#         else:
#             return self.get_all_routers_status(request)
    
#     def get_single_router_status(self, request, pk):
#         """Get detailed status for a single router."""
#         router = self.get_router(pk)
        
#         status_data = {
#             'router': {
#                 'id': router.id,
#                 'name': router.name,
#                 'ip': router.ip
#             },
#             'status': router.status,
#             'connection_status': router.connection_status,
#             'configuration_status': router.configuration_status,
#             'last_seen': router.last_seen,
#             'last_connection_test': router.last_connection_test,
#             'connection_quality': router.get_connection_quality(),
#             'active_users': router.get_active_users_count(),
#             'system_info': {
#                 'firmware_version': router.firmware_version,
#                 'type': router.type,
#                 'ssid': router.ssid
#             }
#         }
        
#         return Response(status_data)
    
#     def get_all_routers_status(self, request):
#         """Get status overview for all routers."""
#         routers = Router.objects.filter(is_active=True)
        
#         status_overview = {
#             'total_routers': routers.count(),
#             'online_routers': routers.filter(connection_status='connected').count(),
#             'offline_routers': routers.filter(connection_status='disconnected').count(),
#             'connection_testing_routers': routers.filter(connection_status='testing').count(),
#             'configured_routers': routers.filter(configuration_status='configured').count(),
#             'not_configured_routers': routers.filter(configuration_status='not_configured').count(),
#             'routers': []
#         }
        
#         for router in routers:
#             router_status = {
#                 'id': router.id,
#                 'name': router.name,
#                 'ip': router.ip,
#                 'status': router.status,
#                 'connection_status': router.connection_status,
#                 'configuration_status': router.configuration_status,
#                 'last_seen': router.last_seen,
#                 'active_users': router.get_active_users_count(),
#                 'connection_quality': router.get_connection_quality().get('quality', 'unknown')
#             }
#             status_overview['routers'].append(router_status)
        
#         return Response(status_overview)
    
#     def post(self, request, pk):
#         """Update router status."""
#         router = self.get_router(pk)
        
#         new_status = request.data.get('status')
#         new_connection_status = request.data.get('connection_status')
        
#         old_status = router.status
#         old_connection_status = router.connection_status
        
#         changes = {}
        
#         if new_status and new_status != router.status:
#             router.status = new_status
#             changes['status'] = {'old': old_status, 'new': new_status}
        
#         if new_connection_status and new_connection_status != router.connection_status:
#             router.connection_status = new_connection_status
#             changes['connection_status'] = {'old': old_connection_status, 'new': new_connection_status}
        
#         if changes:
#             router.save()
            
#             self.create_audit_log(
#                 router=router,
#                 action='status_change',
#                 description=f"Router status updated: {old_status}->{new_status}, {old_connection_status}->{new_connection_status}",
#                 user=request.user,
#                 request=request,
#                 changes=changes,
#                 status_code=200
#             )
            
#             self.clear_router_cache(pk)
#             self.clear_routers_cache()
            
#             WebSocketManager.send_router_update(
#                 pk, 
#                 'status_updated', 
#                 {
#                     'name': router.name,
#                     'status': router.status,
#                     'connection_status': router.connection_status,
#                     'changes': changes
#                 }
#             )
            
#             return Response({
#                 'message': 'Router status updated successfully',
#                 'changes': changes
#             })
#         else:
#             return Response({
#                 'message': 'No changes made to router status'
#             }, status=status.HTTP_304_NOT_MODIFIED)









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
from django.db import models

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