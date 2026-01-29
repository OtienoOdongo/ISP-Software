# """
# Service Operations - Enhanced Subscription Views
# Production-ready with improved service integration, comprehensive error handling, and monitoring
# Key improvements:
# 1. Service-based architecture instead of direct database operations
# 2. Enhanced caching with smarter invalidation strategies
# 3. Circuit breaker integration for external services
# 4. Comprehensive audit logging and monitoring
# 5. Better permission management with role-based access
# 6. Advanced filtering, sorting, and pagination
# 7. Async task support for long-running operations
# 8. Health monitoring and metrics collection
# """

# from django.shortcuts import get_object_or_404
# from django.db.models import Q, Count, Sum, Avg, F, ExpressionWrapper, DurationField
# from django.utils import timezone
# from django.db import transaction
# from django.core.cache import cache
# from django.conf import settings
# from django.core.exceptions import PermissionDenied
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework.permissions import IsAuthenticated, IsAdminUser
# from rest_framework.pagination import PageNumberPagination
# from rest_framework import status
# from rest_framework.throttling import UserRateThrottle
# import logging
# from datetime import datetime, timedelta
# import time
# import uuid
# import json

# # Model imports
# from service_operations.models.activation_queue_models import ActivationQueue
# from service_operations.models.client_operation_models import ClientOperation
# from service_operations.models.operation_log_models import OperationLog
# from service_operations.models.subscription_models import Subscription, UsageTracking

# # Serializer imports
# from service_operations.serializers.subscription_serializers import (
#     SubscriptionSerializer,
#     SubscriptionCreateSerializer,
#     SubscriptionUpdateSerializer,
#     SubscriptionActivationSerializer,
#     SubscriptionRenewSerializer,
#     SubscriptionUsageSerializer,
#     SubscriptionListSerializer,
#     SubscriptionDetailSerializer,
#     SubscriptionSuspendSerializer,
#     SubscriptionSuspendSerializer,
#     SubscriptionExtendSerializer,
#     SubscriptionStatisticsSerializer,
#     SubscriptionSearchSerializer,
# )

# # Service imports
# from service_operations.services.subscription_services import SubscriptionService
# from service_operations.services.client_service import ClientService
# from service_operations.services.integration_service import IntegrationService
# from service_operations.services.queue_services import QueueService
# from service_operations.services.activation_service import ActivationService

# # Adapter imports
# from service_operations.adapters.internet_plans_adapter import InternetPlansAdapter
# from service_operations.adapters.payment_adapter import PaymentAdapter
# from service_operations.adapters.network_adapter import NetworkAdapter

# # Task imports
# from service_operations.tasks import (
#     async_process_subscription_activation,
#     async_notify_external_systems,
#     async_generate_subscription_report
# )

# logger = logging.getLogger(__name__)


# class EnhancedSubscriptionPagination(PageNumberPagination):
#     """
#     Enhanced pagination with metadata and performance optimizations
#     Supports custom page sizes, cursor-based pagination for large datasets
#     """
    
#     page_size = 20
#     page_size_query_param = 'page_size'
#     max_page_size = 200
#     page_query_param = 'page'
    
#     def get_paginated_response(self, data):
#         """
#         Enhanced response with additional metadata
#         """
#         response_data = {
#             'success': True,
#             'count': self.page.paginator.count,
#             'next': self.get_next_link(),
#             'previous': self.get_previous_link(),
#             'page': self.page.number,
#             'total_pages': self.page.paginator.num_pages,
#             'page_size': self.get_page_size(self.request),
#             'has_next': self.page.has_next(),
#             'has_previous': self.page.has_previous(),
#             'results': data,
#             'timestamp': timezone.now().isoformat()
#         }
        
#         # Add performance metrics for large datasets
#         if self.page.paginator.count > 1000:
#             response_data['performance'] = {
#                 'large_dataset': True,
#                 'recommendation': 'Use cursor pagination for better performance',
#                 'estimated_records': self.page.paginator.count
#             }
        
#         return Response(response_data)


# class BaseSubscriptionView(APIView):
#     """
#     Base view with common functionality for all subscription views
#     Provides consistent error handling, logging, and permission checking
#     """
    
#     permission_classes = [IsAuthenticated]
#     throttle_classes = [UserRateThrottle]
    
#     def initialize_request(self, request, *args, **kwargs):
#         """
#         Initialize request with additional context
#         """
#         request = super().initialize_request(request, *args, **kwargs)
#         request.start_time = timezone.now()
#         return request
    
#     def handle_exception(self, exc):
#         """
#         Global exception handling with consistent error responses
#         """
#         if isinstance(exc, PermissionDenied):
#             logger.warning(f"Permission denied: {exc}", exc_info=True)
#             OperationLog.log_operation(
#                 operation_type='view_exception',
#                 severity='warning',
#                 description=f'Permission denied: {exc}',
#                 details={
#                     'view': self.__class__.__name__,
#                     'method': self.request.method,
#                     'user': self.request.user.username,
#                     'error': str(exc)
#                 },
#                 source_module='subscription_views',
#                 source_function=self.__class__.__name__
#             )
#             return Response({
#                 'success': False,
#                 'error': 'Permission denied',
#                 'code': 'PERMISSION_DENIED',
#                 'timestamp': timezone.now().isoformat()
#             }, status=status.HTTP_403_FORBIDDEN)
        
#         elif isinstance(exc, Subscription.DoesNotExist):
#             logger.warning(f"Subscription not found: {exc}", exc_info=True)
#             OperationLog.log_operation(
#                 operation_type='view_exception',
#                 severity='warning',
#                 description='Subscription not found',
#                 details={
#                     'view': self.__class__.__name__,
#                     'method': self.request.method,
#                     'user': self.request.user.username,
#                     'error': str(exc)
#                 },
#                 source_module='subscription_views',
#                 source_function=self.__class__.__name__
#             )
#             return Response({
#                 'success': False,
#                 'error': 'Subscription not found',
#                 'code': 'SUBSCRIPTION_NOT_FOUND',
#                 'timestamp': timezone.now().isoformat()
#             }, status=status.HTTP_404_NOT_FOUND)
        
#         else:
#             logger.error(f"Unexpected error in {self.__class__.__name__}: {exc}", exc_info=True)
            
#             # Log detailed error for debugging
#             OperationLog.log_operation(
#                 operation_type='view_exception',
#                 severity='error',
#                 description=f'Exception in {self.__class__.__name__}: {str(exc)}',
#                 details={
#                     'view': self.__class__.__name__,
#                     'method': self.request.method,
#                     'user': self.request.user.username,
#                     'error': str(exc),
#                 },
#                 source_module='subscription_views',
#                 source_function=self.__class__.__name__
#             )
            
#             return Response({
#                 'success': False,
#                 'error': 'Internal server error',
#                 'code': 'INTERNAL_ERROR',
#                 'details': str(exc) if settings.DEBUG else None,
#                 'timestamp': timezone.now().isoformat()
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
#     def check_subscription_permissions(self, subscription, request):
#         """
#         Centralized permission checking for subscription access
#         """
#         # Staff can access all subscriptions
#         if request.user.is_staff:
#             return True
        
#         # Clients can only access their own subscriptions
#         return str(subscription.client_id) == str(request.user.id)
    
#     def get_subscription_with_related(self, subscription_id):
#         """
#         Get subscription with all related data for optimal performance
#         """
#         return get_object_or_404(
#             Subscription.objects.select_related(
#                 'parent_subscription'
#             ).prefetch_related(
#                 'usage_records',
#                 'activation_requests',
#                 'client_operations'
#             ),
#             id=subscription_id,
#             is_active=True
#         )
    
#     def clear_subscription_caches(self, subscription_id=None, client_id=None):
#         """
#         Comprehensive cache clearing for subscription-related data
#         """
#         cache_patterns = [
#             "subscriptions:*",
#             "subscription:*",
#             "dashboard:*",
#             "stats:subscriptions:*"
#         ]
        
#         if subscription_id:
#             cache_patterns.append(f"subscription:{subscription_id}:*")
        
#         if client_id:
#             cache_patterns.append(f"subscriptions:client:{client_id}:*")
        
#         for pattern in cache_patterns:
#             cache.delete_pattern(pattern)
        
#         logger.debug(f"Cleared subscription caches for subscription_id={subscription_id}, client_id={client_id}")


# class SubscriptionListView(BaseSubscriptionView):
#     """
#     Enhanced API for listing and creating subscriptions
#     Features:
#     1. Advanced filtering with multiple criteria support
#     2. Smart caching with role-based TTLs
#     3. Real-time statistics for filtered results
#     4. Service integration for client validation
#     5. Comprehensive monitoring and audit logging
#     """
    
#     permission_classes = [IsAuthenticated]
#     pagination_class = EnhancedSubscriptionPagination
#     throttle_classes = [UserRateThrottle]
    
#     def get_permissions(self):
#         """
#         Override permissions for POST method (staff only for creation)
#         """
#         if self.request.method == 'POST':
#             return [IsAdminUser()]
#         return super().get_permissions()
    
#     def get(self, request):
#         """
#         Get list of subscriptions with advanced filtering, sorting, and caching
#         """
#         try:
#             user = request.user
#             is_staff = user.is_staff
            
#             # Build and filter queryset
#             queryset = self._build_queryset(request, is_staff, user.id)
#             queryset = self._apply_advanced_filters(queryset, request)
#             queryset = self._apply_sorting(queryset, request)
            
#             # Paginate
#             paginator = self.pagination_class()
#             page = paginator.paginate_queryset(queryset, request)
            
#             # Get statistics for the filtered set (staff only for performance)
#             stats = self._get_queryset_statistics(queryset) if is_staff else {}
            
#             # Serialize with context
#             serializer = SubscriptionListSerializer(
#                 page, 
#                 many=True, 
#                 context={'request': request, 'is_staff': is_staff}
#             )
            
#             # Build comprehensive response
#             response_data = {
#                 'success': True,
#                 'count': paginator.page.paginator.count,
#                 'results': serializer.data,
#                 'statistics': stats,
#                 'filters_applied': self._get_applied_filters(request),
#                 'user_context': {
#                     'is_staff': is_staff,
#                     'client_id': str(user.id) if not is_staff else None
#                 },
#                 'timestamp': timezone.now().isoformat(),
#                 'performance': {
#                     'query_time_ms': (timezone.now() - request.start_time).total_seconds() * 1000,
#                     'result_count': paginator.page.paginator.count
#                 }
#             }
            
#             # Log access for monitoring
#             OperationLog.log_operation(
#                 operation_type='subscription_list_access',
#                 severity='info',
#                 description=f'Subscription list accessed by {"staff" if is_staff else "client"}',
#                 details={
#                     'user_id': str(user.id),
#                     'is_staff': is_staff,
#                     'filter_count': len(self._get_applied_filters(request)),
#                     'result_count': paginator.page.paginator.count,
#                     'execution_time_ms': (timezone.now() - request.start_time).total_seconds() * 1000
#                 },
#                 source_module='subscription_views',
#                 source_function='SubscriptionListView.get'
#             )
            
#             return paginator.get_paginated_response(serializer.data)
            
#         except Exception as e:
#             logger.error(f"Failed to get subscription list: {e}", exc_info=True)
#             return self.handle_exception(e)
    
#     def post(self, request):
#         """
#         Create new subscription with comprehensive validation and service integration
#         """
#         try:
#             # Validate request data
#             serializer = SubscriptionCreateSerializer(data=request.data)
#             if not serializer.is_valid():
#                 return Response({
#                     'success': False,
#                     'error': 'Invalid data',
#                     'details': serializer.errors,
#                     'timestamp': timezone.now().isoformat()
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             validated_data = serializer.validated_data
#             client_id = validated_data['client_id']
            
#             # Enhanced client validation using IntegrationService
#             client_validation = IntegrationService.validate_client_for_plan(
#                 client_id=str(client_id),
#                 plan_id=str(validated_data['internet_plan_id']),
#                 access_method=validated_data.get('access_method', 'hotspot')
#             )
            
#             if not client_validation.get('valid', False):
#                 OperationLog.log_operation(
#                     operation_type='client_validation_failed',
#                     severity='warning',
#                     description='Client validation failed for subscription creation',
#                     details={
#                         'client_id': str(client_id),
#                         'plan_id': str(validated_data['internet_plan_id']),
#                         'validation_results': client_validation
#                     },
#                     source_module='subscription_views',
#                     source_function='SubscriptionListView.post'
#                 )
#                 return Response({
#                     'success': False,
#                     'error': 'Client validation failed',
#                     'details': client_validation.get('reasons', []),
#                     'validation_results': client_validation.get('validation_results', {}),
#                     'code': 'CLIENT_VALIDATION_FAILED',
#                     'timestamp': timezone.now().isoformat()
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             # Check service availability
#             availability = ClientService.check_service_availability(
#                 client_id=str(client_id),
#                 client_type=validated_data['client_type'],
#                 plan_id=str(validated_data['internet_plan_id']),
#                 hotspot_mac_address=validated_data.get('hotspot_mac_address'),
#                 router_id=validated_data.get('router_id')
#             )
            
#             if not availability.get('available', False):
#                 OperationLog.log_operation(
#                     operation_type='service_unavailable',
#                     severity='warning',
#                     description='Service unavailable for subscription creation',
#                     details={
#                         'client_id': str(client_id),
#                         'plan_id': str(validated_data['internet_plan_id']),
#                         'availability': availability
#                     },
#                     source_module='subscription_views',
#                     source_function='SubscriptionListView.post'
#                 )
#                 return Response({
#                     'success': False,
#                     'error': 'Service unavailable',
#                     'details': availability.get('reasons', []),
#                     'checks': availability.get('checks', {}),
#                     'code': 'SERVICE_UNAVAILABLE',
#                     'timestamp': timezone.now().isoformat()
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             # Create subscription using SubscriptionService
#             subscription_result = SubscriptionService.create_subscription(
#                 client_id=str(client_id),
#                 internet_plan_id=str(validated_data['internet_plan_id']),
#                 client_type=validated_data['client_type'],
#                 access_method=validated_data.get('access_method', 'hotspot'),
#                 duration_hours=validated_data.get('duration_hours', 24),
#                 router_id=validated_data.get('router_id'),
#                 hotspot_mac_address=validated_data.get('hotspot_mac_address'),
#                 scheduled_activation=validated_data.get('scheduled_activation'),
#                 auto_renew=validated_data.get('auto_renew', False),
#                 metadata=validated_data.get('metadata', {}),
#                 created_by=request.user.username
#             )
            
#             if not subscription_result.get('success'):
#                 OperationLog.log_operation(
#                     operation_type='subscription_creation_failed',
#                     severity='error',
#                     description='Subscription creation failed',
#                     details={
#                         'client_id': str(client_id),
#                         'plan_id': str(validated_data['internet_plan_id']),
#                         'error': subscription_result.get('error'),
#                         'details': subscription_result.get('details')
#                     },
#                     source_module='subscription_views',
#                     source_function='SubscriptionListView.post'
#                 )
#                 return Response({
#                     'success': False,
#                     'error': subscription_result.get('error', 'Failed to create subscription'),
#                     'details': subscription_result.get('details'),
#                     'code': 'SUBSCRIPTION_CREATION_FAILED',
#                     'timestamp': timezone.now().isoformat()
#                 }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
#             subscription_id = subscription_result['subscription_id']
            
#             # Get comprehensive subscription details
#             subscription_details = SubscriptionService.get_subscription_details(subscription_id)
            
#             if not subscription_details.get('success'):
#                 logger.warning(f"Failed to get details for created subscription {subscription_id}")
            
#             # Clear relevant caches
#             self.clear_subscription_caches(client_id=str(client_id))
            
#             # Async notification to external systems
#             async_notify_external_systems.delay(
#                 event_type='subscription_created',
#                 data={
#                     'subscription_id': subscription_id,
#                     'client_id': str(client_id),
#                     'plan_id': str(validated_data['internet_plan_id']),
#                     'created_by': request.user.username
#                 }
#             )
            
#             # Log successful creation
#             OperationLog.log_operation(
#                 operation_type='subscription_created',
#                 severity='info',
#                 description=f'Subscription {subscription_id} created successfully',
#                 details={
#                     'subscription_id': subscription_id,
#                     'client_id': str(client_id),
#                     'plan_id': str(validated_data['internet_plan_id']),
#                     'created_by': request.user.username,
#                     'duration_hours': validated_data.get('duration_hours', 24)
#                 },
#                 source_module='subscription_views',
#                 source_function='SubscriptionListView.post'
#             )
            
#             logger.info(f"Subscription created successfully: {subscription_id}")
            
#             return Response({
#                 'success': True,
#                 'message': 'Subscription created successfully',
#                 'subscription': subscription_details.get('subscription', {}),
#                 'plan_details': subscription_details.get('plan_details', {}),
#                 'next_steps': [
#                     {
#                         'action': 'payment',
#                         'description': 'Initiate payment to activate subscription',
#                         'endpoint': f'/api/payments/create/',
#                         'parameters': {'subscription_id': subscription_id}
#                     },
#                     {
#                         'action': 'activate',
#                         'description': 'Activate after payment confirmation',
#                         'endpoint': f'/api/service-operations/subscriptions/{subscription_id}/activate/'
#                     }
#                 ],
#                 'subscription_id': subscription_id,
#                 'client_id': str(client_id),
#                 'created_by': request.user.username,
#                 'timestamp': timezone.now().isoformat(),
#                 'execution_time_ms': (timezone.now() - request.start_time).total_seconds() * 1000
#             }, status=status.HTTP_201_CREATED)
            
#         except Exception as e:
#             logger.error(f"Failed to create subscription: {e}", exc_info=True)
#             return self.handle_exception(e)
    
#     # Helper methods
#     def _build_queryset(self, request, is_staff: bool, user_id: int):
#         """
#         Build appropriate queryset based on user role with performance optimizations
#         """
#         if is_staff:
#             # Staff: all active subscriptions with optimized queries
#             queryset = Subscription.objects.select_related(
#                 'parent_subscription'
#             ).filter(
#                 is_active=True
#             )
#         else:
#             # Clients: only their subscriptions
#             queryset = Subscription.objects.select_related(
#                 'parent_subscription'
#             ).filter(
#                 client_id=user_id,
#                 is_active=True
#             )
        
#         # Apply basic optimization
#         return queryset.only(
#             'id', 'client_id', 'internet_plan_id', 'client_type',
#             'access_method', 'status', 'start_date', 'end_date',
#             'created_at', 'updated_at'
#         )
    
#     def _apply_advanced_filters(self, queryset, request):
#         """
#         Apply advanced filtering with validation
#         """
#         filter_handlers = {
#             'status': self._handle_status_filter,
#             'client_type': self._handle_client_type_filter,
#             'plan_id': self._handle_plan_filter,
#             'router_id': self._handle_router_filter,
#             'access_method': self._handle_access_method_filter,
#             'date_range': self._handle_date_range_filter,
#             'expiry_range': self._handle_expiry_range_filter,
#             'search': self._handle_search_filter,
#             'active': self._handle_active_filter,
#             'payment_status': self._handle_payment_status_filter
#         }
        
#         for filter_name, handler in filter_handlers.items():
#             queryset = handler(queryset, request)
        
#         return queryset
    
#     def _handle_status_filter(self, queryset, request):
#         """Handle status filtering (supports multiple statuses)"""
#         status_filter = request.query_params.getlist('status')
#         if status_filter:
#             valid_statuses = ['draft', 'pending_activation', 'active', 'suspended', 'expired', 'cancelled', 'failed', 'processing']
#             filtered_statuses = [s for s in status_filter if s in valid_statuses]
#             if filtered_statuses:
#                 queryset = queryset.filter(status__in=filtered_statuses)
#         return queryset
    
#     def _handle_client_type_filter(self, queryset, request):
#         """Handle client type filtering"""
#         client_type = request.query_params.get('client_type')
#         if client_type in ['hotspot_client', 'pppoe_client']:
#             queryset = queryset.filter(client_type=client_type)
#         return queryset
    
#     def _handle_plan_filter(self, queryset, request):
#         """Handle plan ID filtering"""
#         plan_id = request.query_params.get('plan_id')
#         if plan_id:
#             queryset = queryset.filter(internet_plan_id=plan_id)
#         return queryset
    
#     def _handle_router_filter(self, queryset, request):
#         """Handle router filtering"""
#         router_id = request.query_params.get('router_id')
#         if router_id and router_id.isdigit():
#             queryset = queryset.filter(router_id=int(router_id))
#         return queryset
    
#     def _handle_access_method_filter(self, queryset, request):
#         """Handle access method filtering"""
#         access_method = request.query_params.get('access_method')
#         if access_method in ['hotspot', 'pppoe']:
#             queryset = queryset.filter(access_method=access_method)
#         return queryset
    
#     def _handle_date_range_filter(self, queryset, request):
#         """Handle date range filtering"""
#         try:
#             if start_date := request.query_params.get('start_date'):
#                 start = timezone.make_aware(datetime.fromisoformat(start_date))
#                 queryset = queryset.filter(created_at__gte=start)
            
#             if end_date := request.query_params.get('end_date'):
#                 end = timezone.make_aware(datetime.fromisoformat(end_date))
#                 queryset = queryset.filter(created_at__lte=end)
#         except ValueError:
#             logger.warning("Invalid date format in filters")
        
#         return queryset
    
#     def _handle_expiry_range_filter(self, queryset, request):
#         """Handle expiry date filtering"""
#         try:
#             if expiry_start := request.query_params.get('expiry_start'):
#                 start = timezone.make_aware(datetime.fromisoformat(expiry_start))
#                 queryset = queryset.filter(end_date__gte=start)
            
#             if expiry_end := request.query_params.get('expiry_end'):
#                 end = timezone.make_aware(datetime.fromisoformat(expiry_end))
#                 queryset = queryset.filter(end_date__lte=end)
#         except ValueError:
#             logger.warning("Invalid expiry date format in filters")
        
#         return queryset
    
#     def _handle_search_filter(self, queryset, request):
#         """Handle search across multiple fields"""
#         search = request.query_params.get('search')
#         if search:
#             queryset = queryset.filter(
#                 Q(payment_reference__icontains=search) |
#                 Q(pppoe_username__icontains=search) |
#                 Q(hotspot_mac_address__icontains=search) |
#                 Q(metadata__icontains=search)
#             )
#         return queryset
    
#     def _handle_active_filter(self, queryset, request):
#         """Handle active/expired filtering"""
#         active_filter = request.query_params.get('active')
#         if active_filter:
#             if active_filter.lower() == 'true':
#                 queryset = queryset.filter(status='active')
#             elif active_filter.lower() == 'false':
#                 queryset = queryset.exclude(status='active')
#         return queryset
    
#     def _handle_payment_status_filter(self, queryset, request):
#         """Handle payment status filtering"""
#         payment_status = request.query_params.get('payment_status')
#         if payment_status == 'confirmed':
#             queryset = queryset.filter(payment_confirmed_at__isnull=False)
#         elif payment_status == 'pending':
#             queryset = queryset.filter(
#                 payment_confirmed_at__isnull=True,
#                 payment_reference__isnull=False
#             )
#         elif payment_status == 'unpaid':
#             queryset = queryset.filter(payment_reference__isnull=True)
#         return queryset
    
#     def _apply_sorting(self, queryset, request):
#         """Apply advanced sorting with validation"""
#         sort_by = request.query_params.get('sort_by', '-created_at')
#         sort_order = request.query_params.get('sort_order', 'desc')
        
#         # Map user-friendly names to actual field names
#         sort_map = {
#             'created': 'created_at',
#             'updated': 'updated_at',
#             'start_date': 'start_date',
#             'end_date': 'end_date',
#             'status': 'status',
#             'client_type': 'client_type',
#             'access_method': 'access_method',
#             'payment_confirmed': 'payment_confirmed_at',
#             'usage_data': 'used_data_bytes',
#             'usage_time': 'used_time_seconds',
#             'remaining_days': 'end_date'
#         }
        
#         field = sort_map.get(sort_by, sort_by)
        
#         # Handle custom sorting for remaining days
#         if field == 'end_date' and sort_by == 'remaining_days':
#             queryset = queryset.annotate(
#                 remaining_days=ExpressionWrapper(
#                     F('end_date') - timezone.now(),
#                     output_field=DurationField()
#                 )
#             )
#             field = 'remaining_days'
        
#         # Apply sort order
#         if sort_order == 'desc' and not field.startswith('-'):
#             field = f'-{field}'
#         elif sort_order == 'asc' and field.startswith('-'):
#             field = field[1:]
        
#         return queryset.order_by(field)
    
#     def _get_queryset_statistics(self, queryset):
#         """Get statistics for the filtered queryset"""
#         try:
#             stats = queryset.aggregate(
#                 total=Count('id'),
#                 active=Count('id', filter=Q(status='active')),
#                 pending=Count('id', filter=Q(status='pending_activation')),
#                 expired=Count('id', filter=Q(status='expired')),
#                 cancelled=Count('id', filter=Q(status='cancelled')),
#                 suspended=Count('id', filter=Q(status='suspended')),
#                 draft=Count('id', filter=Q(status='draft')),
#                 failed=Count('id', filter=Q(status='failed')),
#                 processing=Count('id', filter=Q(status='processing')),
#                 total_data_used=Sum('used_data_bytes'),
#                 total_time_used=Sum('used_time_seconds'),
#                 avg_data_usage=Avg('used_data_bytes', filter=Q(status='active')),
#                 avg_time_usage=Avg('used_time_seconds', filter=Q(status='active')),
#             )
            
#             # Calculate percentages
#             if stats['total']:
#                 stats['active_percentage'] = round((stats['active'] / stats['total']) * 100, 2)
#                 stats['expired_percentage'] = round((stats['expired'] / stats['total']) * 100, 2)
#                 stats['success_rate'] = round((stats['active'] / (stats['total'] - stats['draft'])) * 100, 2) if stats['total'] > stats['draft'] else 0
#             else:
#                 stats['active_percentage'] = 0
#                 stats['expired_percentage'] = 0
#                 stats['success_rate'] = 0
            
#             return stats
            
#         except Exception as e:
#             logger.error(f"Failed to calculate statistics: {e}")
#             return {}
    
#     def _get_applied_filters(self, request):
#         """Get list of applied filters"""
#         filters = {}
#         for key, value in request.query_params.items():
#             if key not in ['page', 'page_size', 'sort_by', 'sort_order', 'no_cache']:
#                 filters[key] = value
#         return filters


# class SubscriptionDetailView(BaseSubscriptionView):
#     """
#     Enhanced API for subscription detail, update, and deletion
#     Features:
#     1. Comprehensive subscription details with related data
#     2. Role-based update permissions
#     3. Service integration for all operations
#     4. Real-time analytics and health checks
#     5. Action-based workflow suggestions
#     """
    
#     def get(self, request, subscription_id):
#         """
#         Get comprehensive subscription details with enhanced data
#         """
#         try:
#             subscription = self.get_subscription_with_related(subscription_id)
            
#             # Check permissions
#             if not self.check_subscription_permissions(subscription, request):
#                 raise PermissionDenied("You do not have permission to access this subscription")
            
#             # Get comprehensive details using SubscriptionService
#             subscription_details = SubscriptionService.get_subscription_details(subscription_id)
            
#             if not subscription_details.get('success'):
#                 return Response({
#                     'success': False,
#                     'error': subscription_details.get('error', 'Failed to get subscription details'),
#                     'code': 'SUBSCRIPTION_DETAILS_FAILED',
#                     'timestamp': timezone.now().isoformat()
#                 }, status=status.HTTP_404_NOT_FOUND)
            
#             # Get additional analytics and related data
#             analytics = self._get_subscription_analytics(subscription)
#             related_data = self._get_related_data(subscription)
            
#             # Build comprehensive response
#             response_data = {
#                 'success': True,
#                 'subscription': subscription_details.get('subscription', {}),
#                 'plan_details': subscription_details.get('plan_details', {}),
#                 'usage_summary': subscription_details.get('usage_summary', {}),
#                 'activation_history': subscription_details.get('activation_history', {}),
#                 'client_operations': subscription_details.get('client_operations', []),
#                 'health': subscription_details.get('health', {}),
#                 'analytics': analytics,
#                 'related_data': related_data,
#                 'available_actions': self._get_available_actions(request, subscription),
#                 'permissions': {
#                     'can_update': self._can_update_subscription(request, subscription),
#                     'can_delete': self._can_delete_subscription(request, subscription),
#                     'can_renew': self._can_renew_subscription(subscription),
#                     'can_activate': subscription.can_be_activated,
#                     'can_suspend': self._can_suspend_subscription(request, subscription),
#                     'can_extend': self._can_extend_subscription(request, subscription)
#                 },
#                 'timestamp': timezone.now().isoformat(),
#                 'performance': {
#                     'query_time_ms': (timezone.now() - request.start_time).total_seconds() * 1000
#                 }
#             }
            
#             # Log access
#             OperationLog.log_operation(
#                 operation_type='subscription_detail_access',
#                 severity='info',
#                 subscription=subscription,
#                 description=f'Subscription details accessed',
#                 details={
#                     'user_id': str(request.user.id),
#                     'is_staff': request.user.is_staff,
#                     'subscription_id': str(subscription_id),
#                     'status': subscription.status
#                 },
#                 source_module='subscription_views',
#                 source_function='SubscriptionDetailView.get'
#             )
            
#             return Response(response_data)
            
#         except Exception as e:
#             logger.error(f"Failed to get subscription details: {e}", exc_info=True)
#             return self.handle_exception(e)
    
#     def put(self, request, subscription_id):
#         """
#         Update subscription with comprehensive validation and service integration
#         """
#         try:
#             subscription = self.get_subscription_with_related(subscription_id)
            
#             # Check update permissions based on subscription status
#             if not self._can_update_subscription(request, subscription):
#                 return Response({
#                     'success': False,
#                     'error': 'Cannot update subscription in current status',
#                     'current_status': subscription.status,
#                     'allowed_statuses': ['draft', 'pending_activation', 'active', 'suspended'],
#                     'code': 'UPDATE_NOT_ALLOWED',
#                     'timestamp': timezone.now().isoformat()
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             serializer = SubscriptionUpdateSerializer(
#                 subscription, 
#                 data=request.data, 
#                 partial=True
#             )
            
#             if not serializer.is_valid():
#                 return Response({
#                     'success': False,
#                     'error': 'Invalid data',
#                     'details': serializer.errors,
#                     'timestamp': timezone.now().isoformat()
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             validated_data = serializer.validated_data
            
#             # Filter fields based on user role and subscription status
#             allowed_fields = self._get_allowed_update_fields(request, subscription)
#             update_data = {k: v for k, v in validated_data.items() if k in allowed_fields}
            
#             if not update_data:
#                 return Response({
#                     'success': False,
#                     'error': 'No valid fields to update',
#                     'allowed_fields': list(allowed_fields),
#                     'code': 'NO_VALID_FIELDS',
#                     'timestamp': timezone.now().isoformat()
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             # Update subscription
#             for field, value in update_data.items():
#                 setattr(subscription, field, value)
            
#             subscription.save()
            
#             # Create audit log via ClientService
#             ClientService.create_client_operation_record(
#                 client_id=str(subscription.client_id),
#                 operation_type='subscription_update',
#                 title='Subscription Updated',
#                 description=f'Subscription {subscription_id} updated via API',
#                 client_type=subscription.client_type,
#                 subscription_id=subscription_id,
#                 priority=2,
#                 source_platform='dashboard',
#                 sla_hours=24,
#                 metadata={
#                     'updated_by': request.user.username,
#                     'updated_fields': list(update_data.keys()),
#                     'previous_status': subscription.status,
#                     'new_values': update_data
#                 }
#             )
            
#             # Clear caches
#             self.clear_subscription_caches(subscription_id, str(subscription.client_id))
            
#             # Log update
#             OperationLog.log_operation(
#                 operation_type='subscription_updated',
#                 severity='info',
#                 subscription=subscription,
#                 description=f'Subscription updated by {request.user.username}',
#                 details={
#                     'user_id': str(request.user.id),
#                     'is_staff': request.user.is_staff,
#                     'subscription_id': str(subscription_id),
#                     'updated_fields': list(update_data.keys()),
#                     'new_values': update_data
#                 },
#                 source_module='subscription_views',
#                 source_function='SubscriptionDetailView.put'
#             )
            
#             logger.info(f"Subscription updated: {subscription_id} by {request.user.username}")
            
#             return Response({
#                 'success': True,
#                 'message': 'Subscription updated successfully',
#                 'subscription': SubscriptionSerializer(subscription, context={'request': request}).data,
#                 'updated_fields': list(update_data.keys()),
#                 'subscription_id': str(subscription_id),
#                 'timestamp': timezone.now().isoformat(),
#                 'execution_time_ms': (timezone.now() - request.start_time).total_seconds() * 1000
#             })
            
#         except Exception as e:
#             logger.error(f"Failed to update subscription: {e}", exc_info=True)
#             return self.handle_exception(e)
    
#     def delete(self, request, subscription_id):
#         """
#         Cancel subscription with comprehensive cleanup and service integration
#         """
#         try:
#             # Get cancellation parameters
#             cancellation_reason = request.data.get('reason', 'Cancelled by admin')
#             refund_amount = request.data.get('refund_amount')
#             notify_client = request.data.get('notify_client', True)
            
#             # Cancel subscription using SubscriptionService
#             cancellation_result = SubscriptionService.cancel_subscription(
#                 subscription_id=subscription_id,
#                 reason=cancellation_reason,
#                 cancelled_by=request.user.username
#             )
            
#             if not cancellation_result.get('success'):
#                 OperationLog.log_operation(
#                     operation_type='subscription_cancellation_failed',
#                     severity='error',
#                     description=f'Subscription cancellation failed',
#                     details={
#                         'subscription_id': subscription_id,
#                         'reason': cancellation_reason,
#                         'cancelled_by': request.user.username,
#                         'error': cancellation_result.get('error')
#                     },
#                     source_module='subscription_views',
#                     source_function='SubscriptionDetailView.delete'
#                 )
#                 return Response({
#                     'success': False,
#                     'error': cancellation_result.get('error', 'Failed to cancel subscription'),
#                     'code': 'CANCELLATION_FAILED',
#                     'timestamp': timezone.now().isoformat()
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             # Process refund if applicable
#             if refund_amount:
#                 try:
#                     payment_result = PaymentAdapter.process_refund(
#                         subscription_id,
#                         amount=refund_amount,
#                         reason=f"Cancellation: {cancellation_reason}"
#                     )
                    
#                     if not payment_result.get('success'):
#                         logger.warning(f"Refund failed for subscription {subscription_id}: {payment_result.get('error')}")
#                 except Exception as e:
#                     logger.error(f"Refund processing error for subscription {subscription_id}: {e}")
            
#             # Async notification to external systems
#             async_notify_external_systems.delay(
#                 event_type='subscription_cancelled',
#                 data={
#                     'subscription_id': subscription_id,
#                     'reason': cancellation_reason,
#                     'cancelled_by': request.user.username,
#                     'refund_amount': refund_amount,
#                     'notify_client': notify_client
#                 },
#                 systems=['network_management', 'user_management', 'payment_gateway']
#             )
            
#             # Clear caches
#             self.clear_subscription_caches(subscription_id)
            
#             # Log cancellation
#             OperationLog.log_operation(
#                 operation_type='subscription_cancelled',
#                 severity='warning',
#                 description=f'Subscription cancelled by {request.user.username}',
#                 details={
#                     'subscription_id': subscription_id,
#                     'reason': cancellation_reason,
#                     'cancelled_by': request.user.username,
#                     'refund_amount': refund_amount,
#                     'cancellation_result': cancellation_result
#                 },
#                 source_module='subscription_views',
#                 source_function='SubscriptionDetailView.delete'
#             )
            
#             logger.info(f"Subscription cancelled: {subscription_id} by {request.user.username}")
            
#             return Response({
#                 'success': True,
#                 'message': 'Subscription cancelled successfully',
#                 'cancellation_details': cancellation_result,
#                 'refund_processed': refund_amount is not None,
#                 'notifications_sent': True,
#                 'timestamp': timezone.now().isoformat(),
#                 'execution_time_ms': (timezone.now() - request.start_time).total_seconds() * 1000
#             })
            
#         except Exception as e:
#             logger.error(f"Failed to cancel subscription: {e}", exc_info=True)
#             return self.handle_exception(e)
    
#     # Permission and validation methods
#     def _can_update_subscription(self, request, subscription) -> bool:
#         """Check if subscription can be updated"""
#         # Staff can update any active subscription
#         if request.user.is_staff:
#             return subscription.is_active
        
#         # Clients can only update their own subscriptions in certain statuses
#         if str(subscription.client_id) != str(request.user.id):
#             return False
        
#         # Clients can only update in these statuses
#         allowed_statuses = ['draft', 'pending_activation', 'active', 'suspended']
#         return subscription.status in allowed_statuses
    
#     def _can_delete_subscription(self, request, subscription) -> bool:
#         """Check if subscription can be deleted (cancelled)"""
#         # Only staff can delete subscriptions
#         return request.user.is_staff and subscription.is_active
    
#     def _can_renew_subscription(self, subscription) -> bool:
#         """Check if subscription can be renewed"""
#         return subscription.status == 'active' and not subscription.is_expired
    
#     def _can_suspend_subscription(self, request, subscription) -> bool:
#         """Check if subscription can be suspended"""
#         return request.user.is_staff and subscription.status == 'active'
    
#     def _can_extend_subscription(self, request, subscription) -> bool:
#         """Check if subscription can be extended"""
#         return request.user.is_staff and subscription.status in ['active', 'suspended']
    
#     def _get_allowed_update_fields(self, request, subscription):
#         """Get allowed update fields based on user role and subscription status"""
#         base_fields = {'metadata'}
        
#         if request.user.is_staff:
#             base_fields.update({
#                 'hotspot_mac_address',
#                 'router_id',
#                 'auto_renew',
#                 'scheduled_activation',
#                 'end_date',
#                 'status'
#             })
        
#         # Clients can only update limited fields
#         if str(subscription.client_id) == str(request.user.id):
#             client_fields = {'hotspot_mac_address', 'metadata'}
#             return client_fields
        
#         return base_fields
    
#     # Analytics and data methods
#     def _get_subscription_analytics(self, subscription):
#         """Get subscription analytics"""
#         try:
#             # Get usage records for last 30 days
#             usage_records = UsageTracking.objects.filter(
#                 subscription=subscription,
#                 session_start__gte=timezone.now() - timedelta(days=30)
#             )
            
#             if usage_records.exists():
#                 total_data = sum(r.data_used_bytes for r in usage_records)
#                 total_time = sum(r.session_duration_seconds for r in usage_records)
#                 record_count = usage_records.count()
                
#                 avg_daily_data = total_data / 30
#                 avg_daily_time = total_time / 30
#                 avg_session_data = total_data / record_count if record_count > 0 else 0
#                 avg_session_time = total_time / record_count if record_count > 0 else 0
#             else:
#                 avg_daily_data = avg_daily_time = avg_session_data = avg_session_time = 0
            
#             # Calculate estimated expiry based on usage pattern
#             estimated_days_remaining = None
#             if subscription.data_limit_bytes > 0 and avg_daily_data > 0:
#                 remaining_data = subscription.remaining_data_bytes
#                 estimated_days_remaining = round(remaining_data / avg_daily_data, 1)
            
#             # Calculate usage efficiency
#             time_efficiency = data_efficiency = 0
#             if subscription.time_limit_seconds > 0 and subscription.used_time_seconds > 0:
#                 time_efficiency = (subscription.used_time_seconds / subscription.time_limit_seconds) * 100
            
#             if subscription.data_limit_bytes > 0 and subscription.used_data_bytes > 0:
#                 data_efficiency = (subscription.used_data_bytes / subscription.data_limit_bytes) * 100
            
#             return {
#                 'daily_average': {
#                     'data_bytes': round(avg_daily_data, 2),
#                     'time_seconds': round(avg_daily_time, 2)
#                 },
#                 'session_average': {
#                     'data_bytes': round(avg_session_data, 2),
#                     'time_seconds': round(avg_session_time, 2)
#                 },
#                 'estimated_days_remaining': estimated_days_remaining,
#                 'efficiency': {
#                     'time_percentage': round(time_efficiency, 2),
#                     'data_percentage': round(data_efficiency, 2),
#                     'overall': round((time_efficiency + data_efficiency) / 2, 2) if time_efficiency and data_efficiency else 0
#                 },
#                 'usage_trend': self._calculate_usage_trend(subscription)
#             }
            
#         except Exception as e:
#             logger.error(f"Failed to get subscription analytics: {e}")
#             return {}
    
#     def _calculate_usage_trend(self, subscription):
#         """Calculate usage trend based on historical data"""
#         try:
#             # Get usage for last 7 days
#             seven_days_ago = timezone.now() - timedelta(days=7)
#             recent_usage = UsageTracking.objects.filter(
#                 subscription=subscription,
#                 session_start__gte=seven_days_ago
#             )
            
#             if not recent_usage.exists():
#                 return 'stable'
            
#             # Calculate daily usage
#             daily_data = {}
#             for record in recent_usage:
#                 day = record.session_start.date()
#                 daily_data[day] = daily_data.get(day, 0) + record.data_used_bytes
            
#             # Calculate trend
#             if len(daily_data) < 2:
#                 return 'stable'
            
#             sorted_days = sorted(daily_data.items())
#             first_avg = sum(v for _, v in sorted_days[:3]) / 3 if len(sorted_days) >= 3 else 0
#             last_avg = sum(v for _, v in sorted_days[-3:]) / 3 if len(sorted_days) >= 3 else 0
            
#             if last_avg > first_avg * 1.2:
#                 return 'increasing'
#             elif last_avg < first_avg * 0.8:
#                 return 'decreasing'
#             else:
#                 return 'stable'
                
#         except Exception:
#             return 'unknown'
    
#     def _get_related_data(self, subscription):
#         """Get related data for subscription"""
#         try:
#             # Get recent activations
#             recent_activations = ActivationQueue.objects.filter(
#                 subscription=subscription
#             ).order_by('-created_at')[:5]
            
#             # Get recent client operations
#             recent_operations = ClientOperation.objects.filter(
#                 subscription=subscription
#             ).order_by('-created_at')[:5]
            
#             # Get recent usage
#             recent_usage = UsageTracking.objects.filter(
#                 subscription=subscription
#             ).order_by('-session_start')[:10]
            
#             return {
#                 'recent_activations': [
#                     {
#                         'id': str(act.id),
#                         'type': act.activation_type,
#                         'status': act.status,
#                         'priority': act.priority,
#                         'created_at': act.created_at.isoformat(),
#                         'error': act.error_message
#                     }
#                     for act in recent_activations
#                 ],
#                 'recent_operations': [
#                     {
#                         'id': str(op.id),
#                         'type': op.operation_type,
#                         'status': op.status,
#                         'title': op.title,
#                         'created_at': op.created_at.isoformat(),
#                         'priority': op.priority
#                     }
#                     for op in recent_operations
#                 ],
#                 'recent_usage': [
#                     {
#                         'id': str(usage.id),
#                         'data_used_bytes': usage.data_used_bytes,
#                         'time_used_seconds': usage.session_duration_seconds,
#                         'session_start': usage.session_start.isoformat(),
#                         'session_end': usage.session_end.isoformat() if usage.session_end else None
#                     }
#                     for usage in recent_usage
#                 ]
#             }
            
#         except Exception as e:
#             logger.error(f"Failed to get related data: {e}")
#             return {}
    
#     def _get_available_actions(self, request, subscription):
#         """Get available actions for subscription"""
#         actions = []
        
#         # Common actions for all users
#         if subscription.can_be_activated and subscription.payment_confirmed_at:
#             actions.append({
#                 'action': 'activate',
#                 'label': 'Activate Now',
#                 'description': 'Activate subscription immediately',
#                 'endpoint': f'/api/service-operations/subscriptions/{subscription.id}/activate/',
#                 'method': 'POST',
#                 'requires_confirmation': False
#             })
        
#         if self._can_renew_subscription(subscription):
#             actions.append({
#                 'action': 'renew',
#                 'label': 'Renew Subscription',
#                 'description': 'Renew subscription with same or different plan',
#                 'endpoint': f'/api/service-operations/subscriptions/{subscription.id}/renew/',
#                 'method': 'POST',
#                 'requires_confirmation': True
#             })
        
#         # Staff-only actions
#         if request.user.is_staff:
#             if self._can_suspend_subscription(request, subscription):
#                 actions.append({
#                     'action': 'suspend',
#                     'label': 'Suspend Subscription',
#                     'description': 'Temporarily suspend subscription',
#                     'endpoint': f'/api/service-operations/subscriptions/{subscription.id}/suspend/',
#                     'method': 'POST',
#                     'requires_confirmation': True
#                 })
            
#             if self._can_extend_subscription(request, subscription):
#                 actions.append({
#                     'action': 'extend',
#                     'label': 'Extend Duration',
#                     'description': 'Extend subscription duration',
#                     'endpoint': f'/api/service-operations/subscriptions/{subscription.id}/extend/',
#                     'method': 'POST',
#                     'requires_confirmation': True
#                 })
            
#             # Always available for staff
#             actions.append({
#                 'action': 'cancel',
#                 'label': 'Cancel Subscription',
#                 'description': 'Permanently cancel subscription',
#                 'endpoint': f'/api/service-operations/subscriptions/{subscription.id}/',
#                 'method': 'DELETE',
#                 'requires_confirmation': True,
#                 'warning': 'This action cannot be undone'
#             })
        
#         return actions


# class SubscriptionActivateView(BaseSubscriptionView):
#     """
#     Enhanced API for activating subscriptions after payment
#     Features:
#     1. Payment verification via PaymentAdapter
#     2. Activation queuing with priority handling
#     3. Comprehensive error handling and retry logic
#     4. Real-time status updates
#     5. Async activation processing
#     """
    
#     def post(self, request, subscription_id):
#         """
#         Activate subscription with payment confirmation and service integration
#         """
#         try:
#             subscription = self.get_subscription_with_related(subscription_id)
            
#             # Check permissions
#             if not self.check_subscription_permissions(subscription, request):
#                 raise PermissionDenied("You do not have permission to activate this subscription")
            
#             serializer = SubscriptionActivationSerializer(data=request.data)
#             if not serializer.is_valid():
#                 return Response({
#                     'success': False,
#                     'error': 'Invalid data',
#                     'details': serializer.errors,
#                     'timestamp': timezone.now().isoformat()
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             validated_data = serializer.validated_data
            
#             # Verify subscription can be activated
#             if not subscription.can_be_activated:
#                 OperationLog.log_operation(
#                     operation_type='activation_not_allowed',
#                     severity='warning',
#                     subscription=subscription,
#                     description='Subscription cannot be activated',
#                     details={
#                         'subscription_id': subscription_id,
#                         'status': subscription.status,
#                         'can_be_activated': subscription.can_be_activated
#                     },
#                     source_module='subscription_views',
#                     source_function='SubscriptionActivateView.post'
#                 )
#                 return Response({
#                     'success': False,
#                     'error': 'Subscription cannot be activated',
#                     'reason': f'Current status: {subscription.status}',
#                     'allowed_statuses': ['draft', 'pending_activation'],
#                     'code': 'ACTIVATION_NOT_ALLOWED',
#                     'timestamp': timezone.now().isoformat()
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             # Verify payment using PaymentAdapter with retry logic
#             payment_result = self._verify_payment_with_retry(
#                 validated_data['payment_reference'],
#                 subscription_id,
#                 max_retries=3
#             )
            
#             if not payment_result.get('success'):
#                 OperationLog.log_operation(
#                     operation_type='payment_verification_failed',
#                     severity='error',
#                     subscription=subscription,
#                     description='Payment verification failed',
#                     details={
#                         'subscription_id': subscription_id,
#                         'payment_reference': validated_data['payment_reference'],
#                         'payment_error': payment_result.get('error')
#                     },
#                     source_module='subscription_views',
#                     source_function='SubscriptionActivateView.post'
#                 )
#                 return Response({
#                     'success': False,
#                     'error': 'Payment verification failed',
#                     'payment_error': payment_result.get('error'),
#                     'code': 'PAYMENT_VERIFICATION_FAILED',
#                     'timestamp': timezone.now().isoformat()
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             # Activate subscription using SubscriptionService
#             activation_result = SubscriptionService.activate_subscription(
#                 subscription_id=subscription_id,
#                 payment_reference=validated_data['payment_reference'],
#                 payment_method=validated_data['payment_method'],
#                 activate_immediately=validated_data.get('activate_immediately', True),
#                 priority=validated_data.get('priority', 4)
#             )
            
#             if not activation_result.get('success'):
#                 OperationLog.log_operation(
#                     operation_type='subscription_activation_failed',
#                     severity='error',
#                     subscription=subscription,
#                     description='Subscription activation failed',
#                     details={
#                         'subscription_id': subscription_id,
#                         'payment_reference': validated_data['payment_reference'],
#                         'error': activation_result.get('error')
#                     },
#                     source_module='subscription_views',
#                     source_function='SubscriptionActivateView.post'
#                 )
#                 return Response({
#                     'success': False,
#                     'error': activation_result.get('error', 'Failed to activate subscription'),
#                     'code': 'ACTIVATION_FAILED',
#                     'timestamp': timezone.now().isoformat()
#                 }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
#             # Async notification to external systems
#             async_notify_external_systems.delay(
#                 event_type='subscription_activated',
#                 data={
#                     'subscription_id': subscription_id,
#                     'client_id': str(subscription.client_id),
#                     'payment_reference': validated_data['payment_reference'],
#                     'payment_method': validated_data['payment_method'],
#                     'activated_by': request.user.username
#                 },
#                 systems=['network_management', 'user_management', 'payment_gateway']
#             )
            
#             # Async activation processing if requested
#             if validated_data.get('activate_immediately', True):
#                 async_process_subscription_activation.delay(
#                     subscription_id=subscription_id,
#                     priority=validated_data.get('priority', 4),
#                     initiated_by=request.user.username
#                 )
            
#             # Clear caches
#             self.clear_subscription_caches(subscription_id, str(subscription.client_id))
            
#             # Log successful activation
#             OperationLog.log_operation(
#                 operation_type='subscription_activated',
#                 severity='info',
#                 subscription=subscription,
#                 description='Subscription activated successfully',
#                 details={
#                     'subscription_id': subscription_id,
#                     'payment_reference': validated_data['payment_reference'],
#                     'payment_method': validated_data['payment_method'],
#                     'activated_by': request.user.username,
#                     'activation_result': activation_result
#                 },
#                 source_module='subscription_views',
#                 source_function='SubscriptionActivateView.post'
#             )
            
#             logger.info(f"Subscription activated: {subscription_id} by {request.user.username}")
            
#             return Response({
#                 'success': True,
#                 'message': 'Subscription activated successfully',
#                 'activation_result': activation_result,
#                 'next_steps': [
#                     {
#                         'action': 'check_status',
#                         'description': 'Check activation status',
#                         'endpoint': f'/api/service-operations/subscriptions/{subscription_id}/',
#                         'method': 'GET'
#                     },
#                     {
#                         'action': 'monitor_activation',
#                         'description': 'Monitor activation progress',
#                         'endpoint': f'/api/service-operations/activations/queue/?subscription_id={subscription_id}',
#                         'method': 'GET'
#                     }
#                 ],
#                 'subscription_id': subscription_id,
#                 'payment_verified': True,
#                 'activation_requested': validated_data.get('activate_immediately', True),
#                 'priority': validated_data.get('priority', 4),
#                 'timestamp': timezone.now().isoformat(),
#                 'execution_time_ms': (timezone.now() - request.start_time).total_seconds() * 1000
#             })
            
#         except Exception as e:
#             logger.error(f"Failed to activate subscription: {e}", exc_info=True)
#             return self.handle_exception(e)
    
#     def _verify_payment_with_retry(self, payment_reference, subscription_id, max_retries=3):
#         """Verify payment with retry logic"""
#         for attempt in range(max_retries):
#             try:
#                 result = PaymentAdapter.verify_payment(payment_reference)
                
#                 if result.get('success'):
#                     return result
                
#                 logger.warning(f"Payment verification attempt {attempt + 1} failed: {result.get('error')}")
                
#                 # Only retry on network or temporary errors
#                 if attempt < max_retries - 1 and result.get('retryable', False):
#                     time.sleep(2 ** attempt)  # Exponential backoff
#                     continue
                
#                 return result
                
#             except Exception as e:
#                 logger.error(f"Payment verification error on attempt {attempt + 1}: {e}")
#                 if attempt < max_retries - 1:
#                     time.sleep(2 ** attempt)
#                     continue
        
#         return {
#             'success': False,
#             'error': 'Payment verification failed after all retries',
#             'retryable': False
#         }


# class SubscriptionRenewView(BaseSubscriptionView):
#     """
#     Enhanced API for renewing subscriptions
#     Features:
#     1. Plan upgrade/downgrade support
#     2. Prorated billing calculation
#     3. Seamless transition between subscriptions
#     4. Comprehensive validation and error handling
#     5. Async processing for large renewals
#     """
    
#     def post(self, request, subscription_id):
#         """
#         Renew subscription with optional plan upgrade
#         """
#         try:
#             subscription = self.get_subscription_with_related(subscription_id)
            
#             # Check permissions
#             if not self.check_subscription_permissions(subscription, request):
#                 raise PermissionDenied("You do not have permission to renew this subscription")
            
#             # Verify subscription can be renewed
#             if not self._can_renew_subscription(subscription):
#                 OperationLog.log_operation(
#                     operation_type='renewal_not_allowed',
#                     severity='warning',
#                     subscription=subscription,
#                     description='Subscription cannot be renewed',
#                     details={
#                         'subscription_id': subscription_id,
#                         'status': subscription.status,
#                         'is_expired': subscription.is_expired
#                     },
#                     source_module='subscription_views',
#                     source_function='SubscriptionRenewView.post'
#                 )
#                 return Response({
#                     'success': False,
#                     'error': 'Subscription cannot be renewed',
#                     'reason': f'Current status: {subscription.status}',
#                     'is_expired': subscription.is_expired,
#                     'allowed_statuses': ['active'],
#                     'code': 'RENEWAL_NOT_ALLOWED',
#                     'timestamp': timezone.now().isoformat()
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             serializer = SubscriptionRenewSerializer(data=request.data)
#             if not serializer.is_valid():
#                 return Response({
#                     'success': False,
#                     'error': 'Invalid data',
#                     'details': serializer.errors,
#                     'timestamp': timezone.now().isoformat()
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             validated_data = serializer.validated_data
            
#             # Validate new plan if specified
#             new_plan_id = validated_data.get('new_plan_id')
#             if new_plan_id:
#                 plan_validation = InternetPlansAdapter.check_plan_compatibility(
#                     plan_id=new_plan_id,
#                     access_method=subscription.access_method
#                 )
                
#                 if not plan_validation.get('compatible', False):
#                     return Response({
#                         'success': False,
#                         'error': 'Plan not compatible',
#                         'details': plan_validation.get('errors', []),
#                         'code': 'PLAN_INCOMPATIBLE',
#                         'timestamp': timezone.now().isoformat()
#                     }, status=status.HTTP_400_BAD_REQUEST)
            
#             # Renew subscription using SubscriptionService
#             renewal_result = SubscriptionService.renew_subscription(
#                 subscription_id=subscription_id,
#                 new_plan_id=new_plan_id,
#                 duration_hours=validated_data.get('duration_hours'),
#                 auto_renew=validated_data.get('auto_renew'),
#                 renewal_strategy=validated_data.get('renewal_strategy', 'immediate')
#             )
            
#             if not renewal_result.get('success'):
#                 OperationLog.log_operation(
#                     operation_type='subscription_renewal_failed',
#                     severity='error',
#                     subscription=subscription,
#                     description='Subscription renewal failed',
#                     details={
#                         'subscription_id': subscription_id,
#                         'new_plan_id': new_plan_id,
#                         'error': renewal_result.get('error')
#                     },
#                     source_module='subscription_views',
#                     source_function='SubscriptionRenewView.post'
#                 )
#                 return Response({
#                     'success': False,
#                     'error': renewal_result.get('error', 'Failed to renew subscription'),
#                     'code': 'RENEWAL_FAILED',
#                     'timestamp': timezone.now().isoformat()
#                 }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
#             new_subscription_id = renewal_result['new_subscription_id']
            
#             # Async notification to external systems
#             async_notify_external_systems.delay(
#                 event_type='subscription_renewed',
#                 data={
#                     'previous_subscription_id': subscription_id,
#                     'new_subscription_id': new_subscription_id,
#                     'client_id': str(subscription.client_id),
#                     'plan_changed': new_plan_id is not None,
#                     'renewed_by': request.user.username
#                 },
#                 systems=['user_management', 'payment_gateway']
#             )
            
#             # Clear caches
#             self.clear_subscription_caches(subscription_id, str(subscription.client_id))
            
#             # Log successful renewal
#             OperationLog.log_operation(
#                 operation_type='subscription_renewed',
#                 severity='info',
#                 subscription=subscription,
#                 description='Subscription renewed successfully',
#                 details={
#                     'previous_subscription_id': subscription_id,
#                     'new_subscription_id': new_subscription_id,
#                     'client_id': str(subscription.client_id),
#                     'plan_changed': new_plan_id is not None,
#                     'renewed_by': request.user.username
#                 },
#                 source_module='subscription_views',
#                 source_function='SubscriptionRenewView.post'
#             )
            
#             logger.info(f"Subscription renewed: {subscription_id} -> {new_subscription_id}")
            
#             return Response({
#                 'success': True,
#                 'message': 'Subscription renewed successfully',
#                 'renewal_result': renewal_result,
#                 'previous_subscription': {
#                     'id': subscription_id,
#                     'status': subscription.status,
#                     'end_date': subscription.end_date.isoformat() if subscription.end_date else None
#                 },
#                 'new_subscription': {
#                     'id': new_subscription_id,
#                     'plan_id': new_plan_id or str(subscription.internet_plan_id),
#                     'duration_hours': validated_data.get('duration_hours', 24),
#                     'auto_renew': validated_data.get('auto_renew', subscription.auto_renew)
#                 },
#                 'next_steps': [
#                     {
#                         'action': 'view_new_subscription',
#                         'description': 'View new subscription details',
#                         'endpoint': f'/api/service-operations/subscriptions/{new_subscription_id}/',
#                         'method': 'GET'
#                     },
#                     {
#                         'action': 'activate',
#                         'description': 'Activate new subscription',
#                         'endpoint': f'/api/service-operations/subscriptions/{new_subscription_id}/activate/',
#                         'method': 'POST'
#                     }
#                 ],
#                 'timestamp': timezone.now().isoformat(),
#                 'execution_time_ms': (timezone.now() - request.start_time).total_seconds() * 1000
#             }, status=status.HTTP_201_CREATED)
            
#         except Exception as e:
#             logger.error(f"Failed to renew subscription: {e}", exc_info=True)
#             return self.handle_exception(e)
    
#     def _can_renew_subscription(self, subscription) -> bool:
#         """Check if subscription can be renewed"""
#         return subscription.status == 'active' and not subscription.is_expired


# class SubscriptionSuspendView(BaseSubscriptionView):
#     """
#     API for suspending subscriptions
#     Features:
#     1. Temporary suspension with reactivation support
#     2. Network deactivation via NetworkAdapter
#     3. Suspension reason tracking
#     4. Automatic reactivation scheduling
#     """
    
#     def post(self, request, subscription_id):
#         """
#         Suspend subscription temporarily
#         """
#         try:
#             if not request.user.is_staff:
#                 raise PermissionDenied("Only staff can suspend subscriptions")
            
#             subscription = self.get_subscription_with_related(subscription_id)
            
#             # Verify subscription can be suspended
#             if subscription.status != 'active':
#                 return Response({
#                     'success': False,
#                     'error': 'Only active subscriptions can be suspended',
#                     'current_status': subscription.status,
#                     'code': 'SUSPENSION_NOT_ALLOWED',
#                     'timestamp': timezone.now().isoformat()
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             serializer = SubscriptionSuspendSerializer(data=request.data)
#             if not serializer.is_valid():
#                 return Response({
#                     'success': False,
#                     'error': 'Invalid data',
#                     'details': serializer.errors,
#                     'timestamp': timezone.now().isoformat()
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             validated_data = serializer.validated_data
            
#             # Update subscription status
#             previous_status = subscription.status
#             subscription.status = 'suspended'
#             subscription.metadata = {
#                 **subscription.metadata,
#                 'suspension': {
#                     'reason': validated_data['reason'],
#                     'suspended_by': request.user.username,
#                     'suspended_at': timezone.now().isoformat(),
#                     'reactivation_date': validated_data.get('reactivation_date'),
#                     'duration_days': validated_data.get('duration_days')
#                 }
#             }
#             subscription.save()
            
#             # Deactivate on network
#             try:
#                 network_result = NetworkAdapter.deactivate_subscription(subscription_id)
#                 if not network_result.get('success'):
#                     logger.warning(f"Network deactivation failed for suspended subscription {subscription_id}")
#             except Exception as e:
#                 logger.error(f"Network deactivation error for suspended subscription {subscription_id}: {e}")
            
#             # Create client operation
#             ClientService.create_client_operation_record(
#                 client_id=str(subscription.client_id),
#                 operation_type='subscription_suspension',
#                 title='Subscription Suspended',
#                 description=f'Subscription suspended: {validated_data["reason"]}',
#                 client_type=subscription.client_type,
#                 subscription_id=subscription_id,
#                 priority=3,
#                 source_platform='dashboard',
#                 sla_hours=24,
#                 metadata={
#                     'reason': validated_data['reason'],
#                     'suspended_by': request.user.username,
#                     'previous_status': previous_status,
#                     'reactivation_date': validated_data.get('reactivation_date'),
#                     'duration_days': validated_data.get('duration_days')
#                 }
#             )
            
#             # Async notification
#             async_notify_external_systems.delay(
#                 event_type='subscription_suspended',
#                 data={
#                     'subscription_id': subscription_id,
#                     'reason': validated_data['reason'],
#                     'suspended_by': request.user.username,
#                     'duration_days': validated_data.get('duration_days'),
#                     'reactivation_date': validated_data.get('reactivation_date')
#                 },
#                 systems=['network_management', 'user_management']
#             )
            
#             # Clear caches
#             self.clear_subscription_caches(subscription_id, str(subscription.client_id))
            
#             # Log suspension
#             OperationLog.log_operation(
#                 operation_type='subscription_suspended',
#                 severity='warning',
#                 subscription=subscription,
#                 description='Subscription suspended',
#                 details={
#                     'subscription_id': subscription_id,
#                     'reason': validated_data['reason'],
#                     'suspended_by': request.user.username,
#                     'previous_status': previous_status,
#                     'reactivation_date': validated_data.get('reactivation_date')
#                 },
#                 source_module='subscription_views',
#                 source_function='SubscriptionSuspendView.post'
#             )
            
#             logger.info(f"Subscription suspended: {subscription_id} by {request.user.username}")
            
#             return Response({
#                 'success': True,
#                 'message': 'Subscription suspended successfully',
#                 'subscription': {
#                     'id': subscription_id,
#                     'previous_status': previous_status,
#                     'new_status': subscription.status,
#                     'suspension_reason': validated_data['reason'],
#                     'suspended_by': request.user.username,
#                     'reactivation_date': validated_data.get('reactivation_date')
#                 },
#                 'timestamp': timezone.now().isoformat()
#             })
            
#         except Exception as e:
#             logger.error(f"Failed to suspend subscription: {e}", exc_info=True)
#             return self.handle_exception(e)


# class SubscriptionUsageView(BaseSubscriptionView):
#     """
#     API for updating subscription usage (typically called by network management systems)
#     Features:
#     1. Batch usage updates for efficiency
#     2. Usage validation and rate limiting
#     3. Real-time status updates
#     4. Usage analytics and reporting
#     """
    
#     def post(self, request, subscription_id):
#         """
#         Update subscription usage
#         """
#         try:
#             subscription = self.get_subscription_with_related(subscription_id)
            
#             serializer = SubscriptionUsageSerializer(data=request.data)
#             if not serializer.is_valid():
#                 return Response({
#                     'success': False,
#                     'error': 'Invalid data',
#                     'details': serializer.errors,
#                     'timestamp': timezone.now().isoformat()
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             validated_data = serializer.validated_data
            
#             # Validate usage data
#             validation_error = self._validate_usage_data(validated_data)
#             if validation_error:
#                 OperationLog.log_operation(
#                     operation_type='usage_validation_failed',
#                     severity='warning',
#                     subscription=subscription,
#                     description='Usage validation failed',
#                     details={
#                         'subscription_id': subscription_id,
#                         'validation_error': validation_error,
#                         'usage_data': validated_data
#                     },
#                     source_module='subscription_views',
#                     source_function='SubscriptionUsageView.post'
#                 )
#                 return Response({
#                     'success': False,
#                     'error': validation_error,
#                     'code': 'USAGE_VALIDATION_FAILED',
#                     'timestamp': timezone.now().isoformat()
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             # Update usage using SubscriptionService
#             usage_result = SubscriptionService.update_usage(
#                 subscription_id=subscription_id,
#                 data_used_bytes=validated_data['data_used_bytes'],
#                 time_used_seconds=validated_data['time_used_seconds'],
#                 session_id=validated_data.get('session_id'),
#                 device_id=validated_data.get('device_id'),
#                 network_metrics=validated_data.get('network_metrics')
#             )
            
#             if not usage_result.get('success'):
#                 OperationLog.log_operation(
#                     operation_type='usage_update_failed',
#                     severity='error',
#                     subscription=subscription,
#                     description='Usage update failed',
#                     details={
#                         'subscription_id': subscription_id,
#                         'error': usage_result.get('error'),
#                         'usage_data': validated_data
#                     },
#                     source_module='subscription_views',
#                     source_function='SubscriptionUsageView.post'
#                 )
#                 return Response({
#                     'success': False,
#                     'error': usage_result.get('error', 'Failed to update usage'),
#                     'code': 'USAGE_UPDATE_FAILED',
#                     'timestamp': timezone.now().isoformat()
#                 }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
#             # Check if subscription needs status update
#             status_update = None
#             if usage_result.get('status') == 'suspended':
#                 status_update = self._handle_suspension_due_to_usage(subscription, usage_result)
            
#             # Clear cache
#             self.clear_subscription_caches(subscription_id)
            
#             # Log usage update
#             OperationLog.log_operation(
#                 operation_type='usage_updated',
#                 severity='info',
#                 subscription=subscription,
#                 description='Usage updated successfully',
#                 details={
#                     'subscription_id': subscription_id,
#                     'data_used_bytes': validated_data['data_used_bytes'],
#                     'time_used_seconds': validated_data['time_used_seconds'],
#                     'usage_result': usage_result
#                 },
#                 source_module='subscription_views',
#                 source_function='SubscriptionUsageView.post'
#             )
            
#             logger.info(f"Usage updated for subscription {subscription_id}: +{validated_data['data_used_bytes']} bytes, +{validated_data['time_used_seconds']}s")
            
#             response_data = {
#                 'success': True,
#                 'message': 'Usage updated successfully',
#                 'usage_result': usage_result,
#                 'subscription': {
#                     'id': subscription_id,
#                     'remaining_data_bytes': usage_result.get('usage', {}).get('remaining_data_bytes'),
#                     'remaining_time_seconds': usage_result.get('usage', {}).get('remaining_time_seconds'),
#                     'status': usage_result.get('status'),
#                     'limit_exceeded': usage_result.get('usage', {}).get('limit_exceeded', False)
#                 },
#                 'timestamp': timezone.now().isoformat()
#             }
            
#             if status_update:
#                 response_data['status_update'] = status_update
            
#             return Response(response_data)
            
#         except Exception as e:
#             logger.error(f"Failed to update usage: {e}", exc_info=True)
#             return self.handle_exception(e)
    
#     def _validate_usage_data(self, usage_data):
#         """Validate usage data before processing"""
#         if usage_data['data_used_bytes'] < 0:
#             return 'Data usage cannot be negative'
        
#         if usage_data['time_used_seconds'] < 0:
#             return 'Time usage cannot be negative'
        
#         # Prevent unrealistic usage spikes
#         if usage_data['data_used_bytes'] > 100 * 1024 * 1024 * 1024:  # 100GB
#             return 'Data usage too high for single update'
        
#         if usage_data['time_used_seconds'] > 7 * 24 * 3600:  # 1 week
#             return 'Time usage too high for single update'
        
#         return None
    
#     def _handle_suspension_due_to_usage(self, subscription, usage_result):
#         """Handle subscription suspension due to usage limits"""
#         try:
#             # Create suspension record
#             suspension_data = {
#                 'reason': 'Usage limit exceeded',
#                 'limit_type': 'data' if usage_result.get('usage', {}).get('remaining_data_bytes') == 0 else 'time',
#                 'suspended_at': timezone.now().isoformat(),
#                 'suspended_by': 'system',
#                 'usage_at_suspension': {
#                     'data_used_bytes': subscription.used_data_bytes,
#                     'time_used_seconds': subscription.used_time_seconds
#                 }
#             }
            
#             # Update subscription metadata
#             subscription.metadata = {
#                 **subscription.metadata,
#                 'auto_suspension': suspension_data
#             }
#             subscription.save()
            
#             # Notify via IntegrationService
#             IntegrationService.notify_external_systems(
#                 event_type='subscription_suspended',
#                 data={
#                     'subscription_id': str(subscription.id),
#                     'reason': 'Usage limit exceeded',
#                     'limit_type': suspension_data['limit_type'],
#                     'suspended_by': 'system'
#                 },
#                 systems=['user_management']
#             )
            
#             return suspension_data
            
#         except Exception as e:
#             logger.error(f"Failed to handle suspension due to usage: {e}")
#             return None


# class SubscriptionStatisticsView(BaseSubscriptionView):
#     """
#     Enhanced API for subscription statistics and analytics
#     Features:
#     1. Real-time statistics with caching
#     2. Customizable time periods
#     3. Trend analysis and forecasting
#     4. Performance metrics
#     5. Health monitoring
#     """
    
#     def get(self, request):
#         """
#         Get comprehensive subscription statistics and analytics
#         """
#         try:
#             if not request.user.is_staff:
#                 raise PermissionDenied("Only staff can view statistics")
            
#             serializer = SubscriptionStatisticsSerializer(data=request.query_params)
#             if not serializer.is_valid():
#                 return Response({
#                     'success': False,
#                     'error': 'Invalid parameters',
#                     'details': serializer.errors,
#                     'timestamp': timezone.now().isoformat()
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             validated_data = serializer.validated_data
#             period_days = validated_data.get('period_days', 30)
            
#             # Get statistics from SubscriptionService
#             stats_result = SubscriptionService.get_statistics(period_days)
            
#             if not stats_result.get('success'):
#                 return Response({
#                     'success': False,
#                     'error': stats_result.get('error', 'Failed to get statistics'),
#                     'timestamp': timezone.now().isoformat()
#                 }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
#             # Get service health
#             service_health = {
#                 'subscription_service': SubscriptionService.health_check(),
#                 'integration_service': IntegrationService.health_check(),
#                 'external_systems': IntegrationService.check_external_system_health()
#             }
            
#             # Get trend analysis
#             trend_analysis = self._analyze_trends(stats_result)
            
#             # Build comprehensive response
#             response_data = {
#                 'success': True,
#                 'statistics': stats_result,
#                 'trend_analysis': trend_analysis,
#                 'service_health': service_health,
#                 'performance_metrics': self._get_performance_metrics(),
#                 'recommendations': self._generate_recommendations(stats_result, trend_analysis),
#                 'period': {
#                     'days': period_days,
#                     'start_date': (timezone.now() - timedelta(days=period_days)).isoformat(),
#                     'end_date': timezone.now().isoformat()
#                 },
#                 'generated_at': timezone.now().isoformat(),
#                 'execution_time_ms': (timezone.now() - request.start_time).total_seconds() * 1000
#             }
            
#             # Log statistics access
#             OperationLog.log_operation(
#                 operation_type='statistics_access',
#                 severity='info',
#                 description='Subscription statistics accessed',
#                 details={
#                     'user': request.user.username,
#                     'period_days': period_days,
#                     'statistics_generated': True
#                 },
#                 source_module='subscription_views',
#                 source_function='SubscriptionStatisticsView.get'
#             )
            
#             return Response(response_data)
            
#         except Exception as e:
#             logger.error(f"Failed to get subscription statistics: {e}", exc_info=True)
#             return self.handle_exception(e)
    
#     def _analyze_trends(self, statistics):
#         """Analyze trends from statistics data"""
#         try:
#             trends = {
#                 'subscription_growth': 'stable',
#                 'renewal_rate': 'stable',
#                 'usage_patterns': 'stable',
#                 'client_distribution': 'stable'
#             }
            
#             # Analyze subscription growth trend
#             daily_trend = statistics.get('daily_trend', [])
#             if len(daily_trend) >= 7:
#                 recent_days = daily_trend[-7:]
#                 avg_recent = sum(day['count'] for day in recent_days) / 7
                
#                 if len(daily_trend) >= 14:
#                     previous_days = daily_trend[-14:-7]
#                     avg_previous = sum(day['count'] for day in previous_days) / 7
                    
#                     if avg_recent > avg_previous * 1.2:
#                         trends['subscription_growth'] = 'increasing'
#                     elif avg_recent < avg_previous * 0.8:
#                         trends['subscription_growth'] = 'decreasing'
            
#             # Analyze renewal rate
#             renewal_stats = statistics.get('renewals', {})
#             if renewal_stats.get('total', 0) > 0:
#                 success_rate = renewal_stats.get('success_rate', 0)
#                 if success_rate > 80:
#                     trends['renewal_rate'] = 'excellent'
#                 elif success_rate > 60:
#                     trends['renewal_rate'] = 'good'
#                 elif success_rate > 40:
#                     trends['renewal_rate'] = 'fair'
#                 else:
#                     trends['renewal_rate'] = 'poor'
            
#             return trends
            
#         except Exception as e:
#             logger.error(f"Failed to analyze trends: {e}")
#             return {}
    
#     def _get_performance_metrics(self):
#         """Get performance metrics for the subscription service"""
#         try:
#             metrics = {
#                 'average_response_time_ms': 0,
#                 'error_rate_percentage': 0,
#                 'concurrent_operations': 0,
#                 'cache_hit_rate': 0
#             }
            
#             # Placeholder - in production, would come from monitoring system
#             return metrics
            
#         except Exception:
#             return {}
    
#     def _generate_recommendations(self, statistics, trends):
#         """Generate actionable recommendations based on statistics and trends"""
#         recommendations = []
        
#         overall_stats = statistics.get('overall', {})
#         renewal_stats = statistics.get('renewals', {})
        
#         # Check subscription growth
#         if trends.get('subscription_growth') == 'decreasing':
#             recommendations.append({
#                 'type': 'growth',
#                 'priority': 'high',
#                 'message': 'Subscription growth is decreasing. Consider marketing campaigns or promotions.',
#                 'action': 'Review marketing strategies and customer acquisition channels'
#             })
        
#         # Check renewal rate
#         if renewal_stats.get('success_rate', 0) < 50:
#             recommendations.append({
#                 'type': 'retention',
#                 'priority': 'high',
#                 'message': 'Renewal rate is low. Improve customer retention strategies.',
#                 'action': 'Implement customer loyalty programs and improve service quality'
#             })
        
#         # Check active subscription rate
#         active_rate = statistics.get('performance', {}).get('active_rate', 0)
#         if active_rate < 60:
#             recommendations.append({
#                 'type': 'engagement',
#                 'priority': 'medium',
#                 'message': f'Only {active_rate:.1f}% of subscriptions are active. Improve customer engagement.',
#                 'action': 'Analyze churn reasons and implement engagement strategies'
#             })
        
#         # Check service health
#         service_health = statistics.get('service_health', {})
#         if service_health.get('circuit_breaker_state') == 'open':
#             recommendations.append({
#                 'type': 'infrastructure',
#                 'priority': 'critical',
#                 'message': 'Circuit breaker is open. External service issues detected.',
#                 'action': 'Check external service dependencies and implement fallback mechanisms'
#             })
        
#         return recommendations


# class SubscriptionSearchView(BaseSubscriptionView):
#     """
#     Advanced subscription search API
#     Features:
#     1. Full-text search across multiple fields
#     2. Advanced filtering and sorting
#     3. Search suggestions and autocomplete
#     4. Search analytics and logging
#     """
    
#     def get(self, request):
#         """
#         Advanced subscription search with comprehensive filtering
#         """
#         try:
#             if not request.user.is_staff:
#                 raise PermissionDenied("Only staff can search subscriptions")
            
#             serializer = SubscriptionSearchSerializer(data=request.query_params)
#             if not serializer.is_valid():
#                 return Response({
#                     'success': False,
#                     'error': 'Invalid search parameters',
#                     'details': serializer.errors,
#                     'timestamp': timezone.now().isoformat()
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             validated_data = serializer.validated_data
            
#             # Build search query
#             search_query = validated_data.get('q', '')
#             search_filters = validated_data.get('filters', {})
            
#             # Apply search and filters
#             queryset = Subscription.objects.filter(is_active=True)
            
#             # Apply full-text search
#             if search_query:
#                 queryset = self._apply_full_text_search(queryset, search_query)
            
#             # Apply filters
#             queryset = self._apply_search_filters(queryset, search_filters)
            
#             # Apply sorting
#             sort_by = validated_data.get('sort_by', '-created_at')
#             sort_order = validated_data.get('sort_order', 'desc')
#             queryset = self._apply_search_sorting(queryset, sort_by, sort_order)
            
#             # Paginate
#             paginator = EnhancedSubscriptionPagination()
#             page = paginator.paginate_queryset(queryset, request)
            
#             # Serialize results
#             serializer = SubscriptionListSerializer(
#                 page, 
#                 many=True, 
#                 context={'request': request, 'is_staff': True}
#             )
            
#             # Build response
#             response_data = paginator.get_paginated_response(serializer.data)
#             response_data.data.update({
#                 'search_metadata': {
#                     'query': search_query,
#                     'filters_applied': search_filters,
#                     'result_count': paginator.page.paginator.count,
#                     'search_time_ms': (timezone.now() - request.start_time).total_seconds() * 1000
#                 },
#                 'suggestions': self._generate_search_suggestions(search_query, queryset[:5])
#             })
            
#             # Log search
#             OperationLog.log_operation(
#                 operation_type='subscription_search',
#                 severity='info',
#                 description='Subscription search performed',
#                 details={
#                     'user': request.user.username,
#                     'query': search_query,
#                     'filters': search_filters,
#                     'result_count': paginator.page.paginator.count
#                 },
#                 source_module='subscription_views',
#                 source_function='SubscriptionSearchView.get'
#             )
            
#             return response_data
            
#         except Exception as e:
#             logger.error(f"Search failed: {e}", exc_info=True)
#             return self.handle_exception(e)
    
#     def _apply_full_text_search(self, queryset, search_query):
#         """Apply full-text search across multiple fields"""
#         return queryset.filter(
#             Q(payment_reference__icontains=search_query) |
#             Q(pppoe_username__icontains=search_query) |
#             Q(hotspot_mac_address__icontains=search_query) |
#             Q(metadata__icontains=search_query) |
#             Q(client_id__icontains=search_query)
#         )
    
#     def _apply_search_filters(self, queryset, filters):
#         """Apply advanced search filters"""
#         for field, value in filters.items():
#             if field == 'date_range':
#                 start_date, end_date = value.get('start'), value.get('end')
#                 if start_date:
#                     queryset = queryset.filter(created_at__gte=start_date)
#                 if end_date:
#                     queryset = queryset.filter(created_at__lte=end_date)
#             elif field == 'status':
#                 if isinstance(value, list):
#                     queryset = queryset.filter(status__in=value)
#                 else:
#                     queryset = queryset.filter(status=value)
#             elif field == 'client_type':
#                 queryset = queryset.filter(client_type=value)
#             elif field == 'access_method':
#                 queryset = queryset.filter(access_method=value)
#             elif field == 'min_usage_bytes':
#                 queryset = queryset.filter(used_data_bytes__gte=value)
#             elif field == 'max_usage_bytes':
#                 queryset = queryset.filter(used_data_bytes__lte=value)
        
#         return queryset
    
#     def _apply_search_sorting(self, queryset, sort_by, sort_order):
#         """Apply sorting for search results"""
#         sort_map = {
#             'relevance': '-created_at',  # Default for search
#             'date': 'created_at',
#             'status': 'status',
#             'usage': 'used_data_bytes',
#             'expiry': 'end_date'
#         }
        
#         field = sort_map.get(sort_by, sort_by)
#         if sort_order == 'desc' and not field.startswith('-'):
#             field = f'-{field}'
#         elif sort_order == 'asc' and field.startswith('-'):
#             field = field[1:]
        
#         return queryset.order_by(field)
    
#     def _generate_search_suggestions(self, query, results):
#         """Generate search suggestions based on query and results"""
#         suggestions = []
        
#         # Extract common patterns from results
#         if results:
#             for result in results:
#                 if result.pppoe_username and query.lower() in result.pppoe_username.lower():
#                     suggestions.append(f"PPPoE User: {result.pppoe_username}")
                
#                 if result.hotspot_mac_address and query.lower() in result.hotspot_mac_address.lower():
#                     suggestions.append(f"MAC Address: {result.hotspot_mac_address}")
        
#         # Add general suggestions
#         if query and len(query) >= 3:
#             suggestions.extend([
#                 f"Search for client ID containing: {query}",
#                 f"Search in payment references: {query}",
#                 f"Search in metadata: {query}"
#             ])
        
#         return suggestions[:5]  # Limit to 5 suggestions


# class SubscriptionHealthView(BaseSubscriptionView):
#     """
#     Comprehensive health check API for subscription services
#     Features:
#     1. Service health monitoring
#     2. Dependency checking
#     3. Performance metrics
#     4. Recommendations and alerts
#     """
    
#     def get(self, request):
#         """
#         Get comprehensive health status of subscription services
#         """
#         try:
#             health_data = {
#                 'service': 'subscription_views',
#                 'status': 'healthy',
#                 'timestamp': timezone.now().isoformat(),
#                 'checks': []
#             }
            
#             # Check database connection
#             db_check = self._check_database_health()
#             health_data['checks'].append(db_check)
            
#             # Check external services
#             external_checks = self._check_external_services_health()
#             health_data['checks'].extend(external_checks)
            
#             # Check internal services
#             internal_checks = self._check_internal_services_health()
#             health_data['checks'].extend(internal_checks)
            
#             # Check cache
#             cache_check = self._check_cache_health()
#             health_data['checks'].append(cache_check)
            
#             # Determine overall status
#             failed_checks = [check for check in health_data['checks'] if not check.get('healthy', True)]
#             if failed_checks:
#                 health_data['status'] = 'degraded'
#                 health_data['failed_checks'] = [check['name'] for check in failed_checks]
            
#             # Add recommendations
#             health_data['recommendations'] = self._generate_health_recommendations(health_data['checks'])
            
#             # Add performance metrics
#             health_data['performance'] = {
#                 'response_time_ms': (timezone.now() - request.start_time).total_seconds() * 1000,
#                 'check_count': len(health_data['checks']),
#                 'healthy_checks': len([c for c in health_data['checks'] if c.get('healthy', True)])
#             }
            
#             return Response(health_data)
            
#         except Exception as e:
#             logger.error(f"Health check failed: {e}", exc_info=True)
#             return Response({
#                 'service': 'subscription_views',
#                 'status': 'unhealthy',
#                 'error': str(e),
#                 'timestamp': timezone.now().isoformat()
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
#     def _check_database_health(self):
#         """Check database connectivity and performance"""
#         try:
#             start_time = timezone.now()
            
#             # Test basic query
#             Subscription.objects.first()
            
#             # Test count query
#             Subscription.objects.count()
            
#             execution_time = (timezone.now() - start_time).total_seconds() * 1000
            
#             return {
#                 'name': 'database',
#                 'healthy': True,
#                 'execution_time_ms': round(execution_time, 2),
#                 'message': 'Database connection is healthy',
#                 'threshold_ms': 100
#             }
            
#         except Exception as e:
#             return {
#                 'name': 'database',
#                 'healthy': False,
#                 'error': str(e),
#                 'message': 'Database connection failed'
#             }
    
#     def _check_external_services_health(self):
#         """Check health of external services"""
#         checks = []
        
#         # Check IntegrationService
#         try:
#             integration_health = IntegrationService.health_check()
#             checks.append({
#                 'name': 'integration_service',
#                 'healthy': integration_health.get('status') == 'healthy',
#                 'details': integration_health,
#                 'message': integration_health.get('status', 'unknown').upper()
#             })
#         except Exception as e:
#             checks.append({
#                 'name': 'integration_service',
#                 'healthy': False,
#                 'error': str(e),
#                 'message': 'Integration service check failed'
#             })
        
#         return checks
    
#     def _check_internal_services_health(self):
#         """Check health of internal services"""
#         checks = []
        
#         # Check SubscriptionService
#         try:
#             subscription_health = SubscriptionService.health_check()
#             checks.append({
#                 'name': 'subscription_service',
#                 'healthy': subscription_health.get('status') == 'healthy',
#                 'details': subscription_health,
#                 'message': subscription_health.get('status', 'unknown').upper()
#             })
#         except Exception as e:
#             checks.append({
#                 'name': 'subscription_service',
#                 'healthy': False,
#                 'error': str(e),
#                 'message': 'Subscription service check failed'
#             })
        
#         # Check ActivationService
#         try:
#             activation_health = ActivationService.health_check()
#             checks.append({
#                 'name': 'activation_service',
#                 'healthy': activation_health.get('status') == 'healthy',
#                 'details': activation_health,
#                 'message': activation_health.get('status', 'unknown').upper()
#             })
#         except Exception as e:
#             checks.append({
#                 'name': 'activation_service',
#                 'healthy': False,
#                 'error': str(e),
#                 'message': 'Activation service check failed'
#             })
        
#         return checks
    
#     def _check_cache_health(self):
#         """Check cache health and performance"""
#         try:
#             start_time = timezone.now()
            
#             # Test cache write/read
#             test_key = 'health_check_' + str(uuid.uuid4())
#             test_value = {'timestamp': timezone.now().isoformat()}
            
#             cache.set(test_key, test_value, 10)
#             cached_value = cache.get(test_key)
            
#             execution_time = (timezone.now() - start_time).total_seconds() * 1000
            
#             healthy = cached_value == test_value
            
#             return {
#                 'name': 'cache',
#                 'healthy': healthy,
#                 'execution_time_ms': round(execution_time, 2),
#                 'message': 'Cache is working correctly' if healthy else 'Cache test failed',
#                 'test_passed': cached_value == test_value
#             }
            
#         except Exception as e:
#             return {
#                 'name': 'cache',
#                 'healthy': False,
#                 'error': str(e),
#                 'message': 'Cache check failed'
#             }
    
#     def _generate_health_recommendations(self, checks):
#         """Generate recommendations based on health check results"""
#         recommendations = []
        
#         for check in checks:
#             if not check.get('healthy', True):
#                 recommendations.append({
#                     'check': check['name'],
#                     'priority': 'high',
#                     'message': f'{check["name"]} is unhealthy: {check.get("message", "Unknown error")}',
#                     'action': f'Investigate {check["name"]} service'
#                 })
            
#             # Check performance thresholds
#             exec_time = check.get('execution_time_ms', 0)
#             threshold = check.get('threshold_ms', 100)
#             if exec_time > threshold:
#                 recommendations.append({
#                     'check': check['name'],
#                     'priority': 'medium',
#                     'message': f'{check["name"]} response time {exec_time}ms exceeds threshold {threshold}ms',
#                     'action': f'Optimize {check["name"]} performance'
#                 })
        
#         return recommendations










"""
Service Operations - Enhanced Subscription Views
Production-ready with comprehensive error handling and monitoring
"""

from django.shortcuts import get_object_or_404
from django.db.models import Q, Count, Sum, Avg, F, ExpressionWrapper, DurationField
from django.utils import timezone
from django.db import transaction
from django.core.cache import cache
from django.conf import settings
from django.core.exceptions import PermissionDenied
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.pagination import PageNumberPagination
from rest_framework import status
from rest_framework.throttling import UserRateThrottle
import logging
from datetime import datetime, timedelta
import time
import uuid
import json

# Model imports
from service_operations.models.subscription_models import Subscription, UsageTracking
from service_operations.models.activation_queue_models import ActivationQueue
from service_operations.models.client_operation_models import ClientOperation
from service_operations.models.operation_log_models import OperationLog



# Serializer imports
from service_operations.serializers.subscription_serializers import (
    SubscriptionSerializer,
    SubscriptionCreateSerializer,
    SubscriptionUpdateSerializer,
    SubscriptionActivationSerializer,
    SubscriptionRenewSerializer,
    SubscriptionUsageSerializer,
    SubscriptionListSerializer,
    SubscriptionDetailSerializer,
    SubscriptionSuspendSerializer,
    SubscriptionExtendSerializer,
    SubscriptionStatisticsSerializer,
    SubscriptionSearchSerializer,
)

# Service imports
from service_operations.services.subscription_service import SubscriptionService
from service_operations.services.client_service import ClientService
from service_operations.services.integration_service import IntegrationService
from service_operations.services.activation_service import ActivationService

# Adapter imports
from service_operations.adapters.internet_plans_adapter import InternetPlansAdapter
from service_operations.adapters.payment_adapter import PaymentAdapter
from service_operations.adapters.network_adapter import NetworkAdapter

# Task imports
from service_operations.services.tasks import (
    async_process_subscription_activation,
    async_notify_external_systems,
    async_generate_subscription_report
)

logger = logging.getLogger(__name__)


class EnhancedSubscriptionPagination(PageNumberPagination):
    """
    Enhanced pagination with metadata
    """
    
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 200
    
    def get_paginated_response(self, data):
        """
        Enhanced response with additional metadata
        """
        return Response({
            'success': True,
            'count': self.page.paginator.count,
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'page': self.page.number,
            'total_pages': self.page.paginator.num_pages,
            'page_size': self.get_page_size(self.request),
            'results': data,
            'timestamp': timezone.now().isoformat()
        })


class BaseSubscriptionView(APIView):
    """
    Base view with common functionality for all subscription views
    """
    
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    
    def initialize_request(self, request, *args, **kwargs):
        """
        Initialize request with additional context
        """
        request = super().initialize_request(request, *args, **kwargs)
        request.start_time = timezone.now()
        return request
    
    def handle_exception(self, exc):
        """
        Global exception handling with consistent error responses
        """
        if isinstance(exc, PermissionDenied):
            logger.warning(f"Permission denied: {exc}", exc_info=True)
            return Response({
                'success': False,
                'error': 'Permission denied',
                'code': 'PERMISSION_DENIED',
                'timestamp': timezone.now().isoformat()
            }, status=status.HTTP_403_FORBIDDEN)
        
        elif isinstance(exc, Subscription.DoesNotExist):
            logger.warning(f"Subscription not found: {exc}", exc_info=True)
            return Response({
                'success': False,
                'error': 'Subscription not found',
                'code': 'SUBSCRIPTION_NOT_FOUND',
                'timestamp': timezone.now().isoformat()
            }, status=status.HTTP_404_NOT_FOUND)
        
        else:
            logger.error(f"Unexpected error in {self.__class__.__name__}: {exc}", exc_info=True)
            
            return Response({
                'success': False,
                'error': 'Internal server error',
                'code': 'INTERNAL_ERROR',
                'details': str(exc) if settings.DEBUG else None,
                'timestamp': timezone.now().isoformat()
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def check_subscription_permissions(self, subscription, request):
        """
        Centralized permission checking for subscription access
        """
        # Staff can access all subscriptions
        if request.user.is_staff:
            return True
        
        # Clients can only access their own subscriptions
        return str(subscription.client_id) == str(request.user.id)
    
    def get_subscription_with_related(self, subscription_id):
        """
        Get subscription with all related data for optimal performance
        """
        return get_object_or_404(
            Subscription.objects.select_related(
                'parent_subscription'
            ).prefetch_related(
                'usage_records',
                'activation_requests',
                'client_operations'
            ),
            id=subscription_id,
            is_active=True
        )
    
    def clear_subscription_caches(self, subscription_id=None, client_id=None):
        """
        Comprehensive cache clearing for subscription-related data
        """
        cache_patterns = [
            "subscriptions:*",
            "subscription:*",
            "dashboard:*",
            "stats:subscriptions:*"
        ]
        
        if subscription_id:
            cache_patterns.append(f"subscription:{subscription_id}:*")
        
        if client_id:
            cache_patterns.append(f"subscriptions:client:{client_id}:*")
        
        for pattern in cache_patterns:
            cache.delete_pattern(pattern)
        
        logger.debug(f"Cleared subscription caches for subscription_id={subscription_id}, client_id={client_id}")


class SubscriptionListView(BaseSubscriptionView):
    """
    API for listing and creating subscriptions
    """
    
    pagination_class = EnhancedSubscriptionPagination
    
    def get_permissions(self):
        """
        Override permissions for POST method (staff only for creation)
        """
        if self.request.method == 'POST':
            return [IsAdminUser()]
        return super().get_permissions()
    
    def get(self, request):
        """
        Get list of subscriptions with advanced filtering, sorting, and caching
        """
        try:
            user = request.user
            is_staff = user.is_staff
            
            # Build appropriate queryset
            if is_staff:
                queryset = Subscription.objects.select_related('parent_subscription').filter(is_active=True)
            else:
                queryset = Subscription.objects.select_related('parent_subscription').filter(
                    client_id=user.id,
                    is_active=True
                )
            
            # Apply filters
            queryset = self._apply_filters(queryset, request)
            
            # Apply sorting
            queryset = self._apply_sorting(queryset, request)
            
            # Paginate
            paginator = self.pagination_class()
            page = paginator.paginate_queryset(queryset, request)
            
            # Serialize
            serializer = SubscriptionListSerializer(
                page, 
                many=True, 
                context={'request': request, 'is_staff': is_staff}
            )
            
            return paginator.get_paginated_response(serializer.data)
            
        except Exception as e:
            logger.error(f"Failed to get subscription list: {e}", exc_info=True)
            return self.handle_exception(e)
    
    def post(self, request):
        """
        Create new subscription
        """
        try:
            # Validate request data
            serializer = SubscriptionCreateSerializer(data=request.data)
            if not serializer.is_valid():
                return Response({
                    'success': False,
                    'error': 'Invalid data',
                    'details': serializer.errors,
                    'timestamp': timezone.now().isoformat()
                }, status=status.HTTP_400_BAD_REQUEST)
            
            validated_data = serializer.validated_data
            client_id = validated_data['client_id']
            
            # Create subscription using SubscriptionService
            subscription_result = SubscriptionService.create_subscription(
                client_id=str(client_id),
                internet_plan_id=str(validated_data['internet_plan_id']),
                client_type=validated_data['client_type'],
                access_method=validated_data.get('access_method', 'hotspot'),
                duration_hours=validated_data.get('duration_hours', 24),
                router_id=validated_data.get('router_id'),
                hotspot_mac_address=validated_data.get('hotspot_mac_address'),
                scheduled_activation=validated_data.get('scheduled_activation'),
                auto_renew=validated_data.get('auto_renew', False),
                metadata=validated_data.get('metadata', {}),
                created_by=request.user.username
            )
            
            if not subscription_result.get('success'):
                return Response({
                    'success': False,
                    'error': subscription_result.get('error', 'Failed to create subscription'),
                    'details': subscription_result.get('details'),
                    'code': 'SUBSCRIPTION_CREATION_FAILED',
                    'timestamp': timezone.now().isoformat()
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            subscription_id = subscription_result['subscription_id']
            
            # Get subscription details
            subscription_details = SubscriptionService.get_subscription_details(subscription_id)
            
            # Clear caches
            self.clear_subscription_caches(client_id=str(client_id))
            
            # Async notification
            async_notify_external_systems.delay(
                event_type='subscription_created',
                data={
                    'subscription_id': subscription_id,
                    'client_id': str(client_id),
                    'plan_id': str(validated_data['internet_plan_id']),
                    'created_by': request.user.username
                }
            )
            
            logger.info(f"Subscription created successfully: {subscription_id}")
            
            return Response({
                'success': True,
                'message': 'Subscription created successfully',
                'subscription': subscription_details.get('subscription', {}),
                'plan_details': subscription_details.get('plan_details', {}),
                'subscription_id': subscription_id,
                'client_id': str(client_id),
                'created_by': request.user.username,
                'timestamp': timezone.now().isoformat(),
                'execution_time_ms': (timezone.now() - request.start_time).total_seconds() * 1000
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Failed to create subscription: {e}", exc_info=True)
            return self.handle_exception(e)
    
    def _apply_filters(self, queryset, request):
        """Apply filters to queryset"""
        # Status filter
        status_filter = request.query_params.getlist('status')
        if status_filter:
            queryset = queryset.filter(status__in=status_filter)
        
        # Client type filter
        client_type = request.query_params.get('client_type')
        if client_type in ['hotspot_client', 'pppoe_client']:
            queryset = queryset.filter(client_type=client_type)
        
        # Plan ID filter
        plan_id = request.query_params.get('plan_id')
        if plan_id:
            queryset = queryset.filter(internet_plan_id=plan_id)
        
        # Access method filter
        access_method = request.query_params.get('access_method')
        if access_method in ['hotspot', 'pppoe']:
            queryset = queryset.filter(access_method=access_method)
        
        # Search filter
        search = request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(payment_reference__icontains=search) |
                Q(pppoe_username__icontains=search) |
                Q(hotspot_mac_address__icontains=search) |
                Q(metadata__icontains=search)
            )
        
        return queryset
    
    def _apply_sorting(self, queryset, request):
        """Apply sorting to queryset"""
        sort_by = request.query_params.get('sort_by', '-created_at')
        sort_order = request.query_params.get('sort_order', 'desc')
        
        # Map user-friendly names to field names
        sort_map = {
            'created': 'created_at',
            'updated': 'updated_at',
            'start_date': 'start_date',
            'end_date': 'end_date',
            'status': 'status',
            'client_type': 'client_type',
            'access_method': 'access_method',
        }
        
        field = sort_map.get(sort_by, sort_by)
        
        # Apply sort order
        if sort_order == 'desc' and not field.startswith('-'):
            field = f'-{field}'
        elif sort_order == 'asc' and field.startswith('-'):
            field = field[1:]
        
        return queryset.order_by(field)


class SubscriptionDetailView(BaseSubscriptionView):
    """
    API for subscription detail, update, and deletion
    """
    
    def get(self, request, subscription_id):
        """
        Get comprehensive subscription details
        """
        try:
            subscription = self.get_subscription_with_related(subscription_id)
            
            # Check permissions
            if not self.check_subscription_permissions(subscription, request):
                raise PermissionDenied("You do not have permission to access this subscription")
            
            # Get subscription details using service
            subscription_details = SubscriptionService.get_subscription_details(subscription_id)
            
            if not subscription_details.get('success'):
                return Response({
                    'success': False,
                    'error': subscription_details.get('error', 'Failed to get subscription details'),
                    'code': 'SUBSCRIPTION_DETAILS_FAILED',
                    'timestamp': timezone.now().isoformat()
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Serialize subscription
            serializer = SubscriptionDetailSerializer(
                subscription,
                context={'request': request}
            )
            
            return Response({
                'success': True,
                'subscription': serializer.data,
                'plan_details': subscription_details.get('plan_details', {}),
                'usage_summary': subscription_details.get('usage_summary', {}),
                'activation_history': subscription_details.get('activation_history', {}),
                'client_operations': subscription_details.get('client_operations', []),
                'timestamp': timezone.now().isoformat()
            })
            
        except Exception as e:
            logger.error(f"Failed to get subscription details: {e}", exc_info=True)
            return self.handle_exception(e)
    
    def put(self, request, subscription_id):
        """
        Update subscription
        """
        try:
            subscription = self.get_subscription_with_related(subscription_id)
            
            # Check permissions
            if not self.check_subscription_permissions(subscription, request):
                raise PermissionDenied("You do not have permission to update this subscription")
            
            # Check if subscription can be updated
            if not self._can_update_subscription(request, subscription):
                return Response({
                    'success': False,
                    'error': 'Cannot update subscription in current status',
                    'current_status': subscription.status,
                    'allowed_statuses': ['draft', 'pending_activation', 'active', 'suspended'],
                    'code': 'UPDATE_NOT_ALLOWED',
                    'timestamp': timezone.now().isoformat()
                }, status=status.HTTP_400_BAD_REQUEST)
            
            serializer = SubscriptionUpdateSerializer(
                subscription, 
                data=request.data, 
                partial=True
            )
            
            if not serializer.is_valid():
                return Response({
                    'success': False,
                    'error': 'Invalid data',
                    'details': serializer.errors,
                    'timestamp': timezone.now().isoformat()
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Update subscription
            updated_subscription = serializer.save()
            
            # Create client operation
            ClientService.create_client_operation_record(
                client_id=str(subscription.client_id),
                operation_type='subscription_update',
                title='Subscription Updated',
                description=f'Subscription {subscription_id} updated via API',
                client_type=subscription.client_type,
                subscription_id=subscription_id,
                priority=2,
                source_platform='dashboard',
                sla_hours=24,
                metadata={
                    'updated_by': request.user.username,
                    'updated_fields': list(serializer.validated_data.keys())
                }
            )
            
            # Clear caches
            self.clear_subscription_caches(subscription_id, str(subscription.client_id))
            
            logger.info(f"Subscription updated: {subscription_id} by {request.user.username}")
            
            return Response({
                'success': True,
                'message': 'Subscription updated successfully',
                'subscription': SubscriptionSerializer(updated_subscription, context={'request': request}).data,
                'updated_fields': list(serializer.validated_data.keys()),
                'subscription_id': str(subscription_id),
                'timestamp': timezone.now().isoformat()
            })
            
        except Exception as e:
            logger.error(f"Failed to update subscription: {e}", exc_info=True)
            return self.handle_exception(e)
    
    def delete(self, request, subscription_id):
        """
        Cancel subscription
        """
        try:
            # Get cancellation parameters
            cancellation_reason = request.data.get('reason', 'Cancelled by admin')
            
            # Cancel subscription using service
            cancellation_result = SubscriptionService.cancel_subscription(
                subscription_id=subscription_id,
                reason=cancellation_reason,
                cancelled_by=request.user.username
            )
            
            if not cancellation_result.get('success'):
                return Response({
                    'success': False,
                    'error': cancellation_result.get('error', 'Failed to cancel subscription'),
                    'code': 'CANCELLATION_FAILED',
                    'timestamp': timezone.now().isoformat()
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Clear caches
            self.clear_subscription_caches(subscription_id)
            
            logger.info(f"Subscription cancelled: {subscription_id} by {request.user.username}")
            
            return Response({
                'success': True,
                'message': 'Subscription cancelled successfully',
                'cancellation_details': cancellation_result,
                'timestamp': timezone.now().isoformat()
            })
            
        except Exception as e:
            logger.error(f"Failed to cancel subscription: {e}", exc_info=True)
            return self.handle_exception(e)
    
    def _can_update_subscription(self, request, subscription) -> bool:
        """Check if subscription can be updated"""
        if request.user.is_staff:
            return subscription.is_active
        
        if str(subscription.client_id) != str(request.user.id):
            return False
        
        allowed_statuses = ['draft', 'pending_activation', 'active', 'suspended']
        return subscription.status in allowed_statuses


class SubscriptionActivateView(BaseSubscriptionView):
    """
    API for activating subscriptions after payment
    """
    
    def post(self, request, subscription_id):
        """
        Activate subscription with payment confirmation
        """
        try:
            subscription = self.get_subscription_with_related(subscription_id)
            
            # Check permissions
            if not self.check_subscription_permissions(subscription, request):
                raise PermissionDenied("You do not have permission to activate this subscription")
            
            serializer = SubscriptionActivationSerializer(data=request.data)
            if not serializer.is_valid():
                return Response({
                    'success': False,
                    'error': 'Invalid data',
                    'details': serializer.errors,
                    'timestamp': timezone.now().isoformat()
                }, status=status.HTTP_400_BAD_REQUEST)
            
            validated_data = serializer.validated_data
            
            # Verify subscription can be activated
            if not subscription.can_be_activated:
                return Response({
                    'success': False,
                    'error': 'Subscription cannot be activated',
                    'reason': f'Current status: {subscription.status}',
                    'allowed_statuses': ['draft', 'pending_activation'],
                    'code': 'ACTIVATION_NOT_ALLOWED',
                    'timestamp': timezone.now().isoformat()
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Activate subscription using service
            activation_result = SubscriptionService.activate_subscription(
                subscription_id=subscription_id,
                payment_reference=validated_data['payment_reference'],
                payment_method=validated_data['payment_method'],
                activate_immediately=validated_data.get('activate_immediately', True),
                priority=validated_data.get('priority', 4)
            )
            
            if not activation_result.get('success'):
                return Response({
                    'success': False,
                    'error': activation_result.get('error', 'Failed to activate subscription'),
                    'code': 'ACTIVATION_FAILED',
                    'timestamp': timezone.now().isoformat()
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            # Async notification
            async_notify_external_systems.delay(
                event_type='subscription_activated',
                data={
                    'subscription_id': subscription_id,
                    'client_id': str(subscription.client_id),
                    'payment_reference': validated_data['payment_reference'],
                    'payment_method': validated_data['payment_method'],
                    'activated_by': request.user.username
                }
            )
            
            # Async activation processing if requested
            if validated_data.get('activate_immediately', True):
                async_process_subscription_activation.delay(
                    subscription_id=subscription_id,
                    priority=validated_data.get('priority', 4),
                    initiated_by=request.user.username
                )
            
            # Clear caches
            self.clear_subscription_caches(subscription_id, str(subscription.client_id))
            
            logger.info(f"Subscription activated: {subscription_id} by {request.user.username}")
            
            return Response({
                'success': True,
                'message': 'Subscription activated successfully',
                'activation_result': activation_result,
                'subscription_id': subscription_id,
                'payment_verified': True,
                'activation_requested': validated_data.get('activate_immediately', True),
                'priority': validated_data.get('priority', 4),
                'timestamp': timezone.now().isoformat()
            })
            
        except Exception as e:
            logger.error(f"Failed to activate subscription: {e}", exc_info=True)
            return self.handle_exception(e)


class SubscriptionRenewView(BaseSubscriptionView):
    """
    API for renewing subscriptions
    """
    
    def post(self, request, subscription_id):
        """
        Renew subscription
        """
        try:
            subscription = self.get_subscription_with_related(subscription_id)
            
            # Check permissions
            if not self.check_subscription_permissions(subscription, request):
                raise PermissionDenied("You do not have permission to renew this subscription")
            
            # Verify subscription can be renewed
            if not subscription.status == 'active' or subscription.is_expired:
                return Response({
                    'success': False,
                    'error': 'Subscription cannot be renewed',
                    'reason': f'Current status: {subscription.status}',
                    'is_expired': subscription.is_expired,
                    'allowed_statuses': ['active'],
                    'code': 'RENEWAL_NOT_ALLOWED',
                    'timestamp': timezone.now().isoformat()
                }, status=status.HTTP_400_BAD_REQUEST)
            
            serializer = SubscriptionRenewSerializer(data=request.data)
            if not serializer.is_valid():
                return Response({
                    'success': False,
                    'error': 'Invalid data',
                    'details': serializer.errors,
                    'timestamp': timezone.now().isoformat()
                }, status=status.HTTP_400_BAD_REQUEST)
            
            validated_data = serializer.validated_data
            
            # Renew subscription using service
            renewal_result = SubscriptionService.renew_subscription(
                subscription_id=subscription_id,
                new_plan_id=validated_data.get('new_plan_id'),
                duration_hours=validated_data.get('duration_hours'),
                auto_renew=validated_data.get('auto_renew'),
                renewal_strategy=validated_data.get('renewal_strategy', 'immediate')
            )
            
            if not renewal_result.get('success'):
                return Response({
                    'success': False,
                    'error': renewal_result.get('error', 'Failed to renew subscription'),
                    'code': 'RENEWAL_FAILED',
                    'timestamp': timezone.now().isoformat()
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            new_subscription_id = renewal_result['new_subscription_id']
            
            # Async notification
            async_notify_external_systems.delay(
                event_type='subscription_renewed',
                data={
                    'previous_subscription_id': subscription_id,
                    'new_subscription_id': new_subscription_id,
                    'client_id': str(subscription.client_id),
                    'plan_changed': validated_data.get('new_plan_id') is not None,
                    'renewed_by': request.user.username
                }
            )
            
            # Clear caches
            self.clear_subscription_caches(subscription_id, str(subscription.client_id))
            
            logger.info(f"Subscription renewed: {subscription_id} -> {new_subscription_id}")
            
            return Response({
                'success': True,
                'message': 'Subscription renewed successfully',
                'renewal_result': renewal_result,
                'previous_subscription': {
                    'id': subscription_id,
                    'status': subscription.status,
                    'end_date': subscription.end_date.isoformat() if subscription.end_date else None
                },
                'new_subscription': {
                    'id': new_subscription_id,
                    'plan_id': validated_data.get('new_plan_id') or str(subscription.internet_plan_id),
                    'duration_hours': validated_data.get('duration_hours', 24),
                    'auto_renew': validated_data.get('auto_renew', subscription.auto_renew)
                },
                'timestamp': timezone.now().isoformat()
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Failed to renew subscription: {e}", exc_info=True)
            return self.handle_exception(e)


class SubscriptionSuspendView(BaseSubscriptionView):
    """
    API for suspending subscriptions
    """
    
    def post(self, request, subscription_id):
        """
        Suspend subscription temporarily
        """
        try:
            if not request.user.is_staff:
                raise PermissionDenied("Only staff can suspend subscriptions")
            
            subscription = self.get_subscription_with_related(subscription_id)
            
            # Verify subscription can be suspended
            if subscription.status != 'active':
                return Response({
                    'success': False,
                    'error': 'Only active subscriptions can be suspended',
                    'current_status': subscription.status,
                    'code': 'SUSPENSION_NOT_ALLOWED',
                    'timestamp': timezone.now().isoformat()
                }, status=status.HTTP_400_BAD_REQUEST)
            
            serializer = SubscriptionSuspendSerializer(data=request.data)
            if not serializer.is_valid():
                return Response({
                    'success': False,
                    'error': 'Invalid data',
                    'details': serializer.errors,
                    'timestamp': timezone.now().isoformat()
                }, status=status.HTTP_400_BAD_REQUEST)
            
            validated_data = serializer.validated_data
            
            # Update subscription
            subscription.status = 'suspended'
            subscription.metadata = {
                **subscription.metadata,
                'suspension': {
                    'reason': validated_data['reason'],
                    'suspended_by': request.user.username,
                    'suspended_at': timezone.now().isoformat(),
                    'reactivation_date': validated_data.get('reactivation_date'),
                    'duration_days': validated_data.get('duration_days')
                }
            }
            subscription.save()
            
            # Deactivate on network
            try:
                NetworkAdapter.deactivate_subscription(subscription_id)
            except Exception as e:
                logger.error(f"Network deactivation error for suspended subscription {subscription_id}: {e}")
            
            # Create client operation
            ClientService.create_client_operation_record(
                client_id=str(subscription.client_id),
                operation_type='subscription_suspension',
                title='Subscription Suspended',
                description=f'Subscription suspended: {validated_data["reason"]}',
                client_type=subscription.client_type,
                subscription_id=subscription_id,
                priority=3,
                source_platform='dashboard',
                sla_hours=24,
                metadata={
                    'reason': validated_data['reason'],
                    'suspended_by': request.user.username,
                    'reactivation_date': validated_data.get('reactivation_date'),
                    'duration_days': validated_data.get('duration_days')
                }
            )
            
            # Async notification
            async_notify_external_systems.delay(
                event_type='subscription_suspended',
                data={
                    'subscription_id': subscription_id,
                    'reason': validated_data['reason'],
                    'suspended_by': request.user.username,
                    'duration_days': validated_data.get('duration_days'),
                    'reactivation_date': validated_data.get('reactivation_date')
                }
            )
            
            # Clear caches
            self.clear_subscription_caches(subscription_id, str(subscription.client_id))
            
            logger.info(f"Subscription suspended: {subscription_id} by {request.user.username}")
            
            return Response({
                'success': True,
                'message': 'Subscription suspended successfully',
                'subscription': {
                    'id': subscription_id,
                    'status': subscription.status,
                    'suspension_reason': validated_data['reason'],
                    'suspended_by': request.user.username,
                    'reactivation_date': validated_data.get('reactivation_date')
                },
                'timestamp': timezone.now().isoformat()
            })
            
        except Exception as e:
            logger.error(f"Failed to suspend subscription: {e}", exc_info=True)
            return self.handle_exception(e)


class SubscriptionUsageView(BaseSubscriptionView):
    """
    API for updating subscription usage
    """
    
    def post(self, request, subscription_id):
        """
        Update subscription usage
        """
        try:
            subscription = self.get_subscription_with_related(subscription_id)
            
            serializer = SubscriptionUsageSerializer(data=request.data)
            if not serializer.is_valid():
                return Response({
                    'success': False,
                    'error': 'Invalid data',
                    'details': serializer.errors,
                    'timestamp': timezone.now().isoformat()
                }, status=status.HTTP_400_BAD_REQUEST)
            
            validated_data = serializer.validated_data
            
            # Update usage using service
            usage_result = SubscriptionService.update_usage(
                subscription_id=subscription_id,
                data_used_bytes=validated_data['data_used_bytes'],
                time_used_seconds=validated_data['time_used_seconds'],
                session_id=validated_data.get('session_id'),
                device_id=validated_data.get('device_id'),
                network_metrics=validated_data.get('network_metrics')
            )
            
            if not usage_result.get('success'):
                return Response({
                    'success': False,
                    'error': usage_result.get('error', 'Failed to update usage'),
                    'code': 'USAGE_UPDATE_FAILED',
                    'timestamp': timezone.now().isoformat()
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            # Clear cache
            self.clear_subscription_caches(subscription_id)
            
            logger.info(f"Usage updated for subscription {subscription_id}")
            
            return Response({
                'success': True,
                'message': 'Usage updated successfully',
                'usage_result': usage_result,
                'subscription': {
                    'id': subscription_id,
                    'remaining_data_bytes': usage_result.get('usage', {}).get('remaining_data_bytes'),
                    'remaining_time_seconds': usage_result.get('usage', {}).get('remaining_time_seconds'),
                    'status': usage_result.get('status')
                },
                'timestamp': timezone.now().isoformat()
            })
            
        except Exception as e:
            logger.error(f"Failed to update usage: {e}", exc_info=True)
            return self.handle_exception(e)


class SubscriptionStatisticsView(BaseSubscriptionView):
    """
    API for subscription statistics and analytics
    """
    
    def get(self, request):
        """
        Get comprehensive subscription statistics
        """
        try:
            if not request.user.is_staff:
                raise PermissionDenied("Only staff can view statistics")
            
            serializer = SubscriptionStatisticsSerializer(data=request.query_params)
            if not serializer.is_valid():
                return Response({
                    'success': False,
                    'error': 'Invalid parameters',
                    'details': serializer.errors,
                    'timestamp': timezone.now().isoformat()
                }, status=status.HTTP_400_BAD_REQUEST)
            
            validated_data = serializer.validated_data
            period_days = validated_data.get('period_days', 30)
            
            # Get statistics from service
            stats_result = SubscriptionService.get_statistics(period_days)
            
            if not stats_result.get('success'):
                return Response({
                    'success': False,
                    'error': stats_result.get('error', 'Failed to get statistics'),
                    'timestamp': timezone.now().isoformat()
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            return Response({
                'success': True,
                'statistics': stats_result,
                'period': {
                    'days': period_days,
                    'start_date': (timezone.now() - timedelta(days=period_days)).isoformat(),
                    'end_date': timezone.now().isoformat()
                },
                'timestamp': timezone.now().isoformat()
            })
            
        except Exception as e:
            logger.error(f"Failed to get subscription statistics: {e}", exc_info=True)
            return self.handle_exception(e)


class SubscriptionSearchView(BaseSubscriptionView):
    """
    Advanced subscription search API
    """
    
    def get(self, request):
        """
        Search subscriptions
        """
        try:
            if not request.user.is_staff:
                raise PermissionDenied("Only staff can search subscriptions")
            
            serializer = SubscriptionSearchSerializer(data=request.query_params)
            if not serializer.is_valid():
                return Response({
                    'success': False,
                    'error': 'Invalid search parameters',
                    'details': serializer.errors,
                    'timestamp': timezone.now().isoformat()
                }, status=status.HTTP_400_BAD_REQUEST)
            
            validated_data = serializer.validated_data
            
            # Build search query
            search_query = validated_data.get('q', '')
            client_id = validated_data.get('client_id')
            plan_id = validated_data.get('plan_id')
            status = validated_data.get('status')
            client_type = validated_data.get('client_type')
            access_method = validated_data.get('access_method')
            
            # Build queryset
            queryset = Subscription.objects.filter(is_active=True)
            
            # Apply filters
            if search_query:
                queryset = queryset.filter(
                    Q(payment_reference__icontains=search_query) |
                    Q(pppoe_username__icontains=search_query) |
                    Q(hotspot_mac_address__icontains=search_query) |
                    Q(metadata__icontains=search_query) |
                    Q(client_id__icontains=search_query)
                )
            
            if client_id:
                queryset = queryset.filter(client_id=client_id)
            
            if plan_id:
                queryset = queryset.filter(internet_plan_id=plan_id)
            
            if status:
                queryset = queryset.filter(status=status)
            
            if client_type:
                queryset = queryset.filter(client_type=client_type)
            
            if access_method:
                queryset = queryset.filter(access_method=access_method)
            
            # Apply sorting
            sort_by = validated_data.get('sort_by', '-created_at')
            sort_order = validated_data.get('sort_order', 'desc')
            
            if sort_order == 'desc' and not sort_by.startswith('-'):
                sort_by = f'-{sort_by}'
            elif sort_order == 'asc' and sort_by.startswith('-'):
                sort_by = sort_by[1:]
            
            queryset = queryset.order_by(sort_by)
            
            # Paginate
            paginator = EnhancedSubscriptionPagination()
            page = paginator.paginate_queryset(queryset, request)
            
            # Serialize
            serializer = SubscriptionListSerializer(
                page, 
                many=True, 
                context={'request': request, 'is_staff': True}
            )
            
            response = paginator.get_paginated_response(serializer.data)
            
            # Add search metadata
            response.data['search_metadata'] = {
                'query': search_query,
                'filters': {
                    'client_id': client_id,
                    'plan_id': plan_id,
                    'status': status,
                    'client_type': client_type,
                    'access_method': access_method
                },
                'result_count': paginator.page.paginator.count
            }
            
            return response
            
        except Exception as e:
            logger.error(f"Search failed: {e}", exc_info=True)
            return self.handle_exception(e)


class SubscriptionHealthView(BaseSubscriptionView):
    """
    Comprehensive health check API for subscription services
    """
    
    def get(self, request):
        """
        Get health status of subscription services
        """
        try:
            # Get health checks
            subscription_health = SubscriptionService.health_check()
            integration_health = IntegrationService.health_check()
            
            # Determine overall health
            overall_healthy = (
                subscription_health.get('status') == 'healthy' and
                integration_health.get('status') == 'healthy'
            )
            
            health_data = {
                'service': 'subscription_views',
                'status': 'healthy' if overall_healthy else 'degraded',
                'timestamp': timezone.now().isoformat(),
                'subscription_service': subscription_health,
                'integration_service': integration_health,
                'database_connection': self._check_database_health(),
                'cache_connection': self._check_cache_health(),
                'recommendations': []
            }
            
            # Generate recommendations
            if subscription_health.get('status') != 'healthy':
                health_data['recommendations'].append('Check subscription service health')
            
            if integration_health.get('status') != 'healthy':
                health_data['recommendations'].append('Check integration service health')
            
            return Response(health_data)
            
        except Exception as e:
            logger.error(f"Health check failed: {e}", exc_info=True)
            return Response({
                'service': 'subscription_views',
                'status': 'unhealthy',
                'error': str(e),
                'timestamp': timezone.now().isoformat()
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _check_database_health(self):
        """Check database connectivity"""
        try:
            Subscription.objects.first()
            return {'healthy': True, 'message': 'Database connection established'}
        except Exception as e:
            return {'healthy': False, 'error': str(e)}
    
    def _check_cache_health(self):
        """Check cache connectivity"""
        try:
            test_key = 'health_check_' + str(uuid.uuid4())
            test_value = {'timestamp': timezone.now().isoformat()}
            
            cache.set(test_key, test_value, 10)
            cached_value = cache.get(test_key)
            
            return {
                'healthy': cached_value == test_value,
                'message': 'Cache is working correctly' if cached_value == test_value else 'Cache test failed'
            }
        except Exception as e:
            return {'healthy': False, 'error': str(e)}