# """
# Operation Views for system monitoring and logging
# Production-ready with comprehensive metrics
# """

# from django.shortcuts import get_object_or_404
# from django.db.models import Q, Count, Avg, Max, Min
# from django.utils import timezone
# from django.core.cache import cache
# from django.conf import settings
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
# from rest_framework.pagination import PageNumberPagination
# from rest_framework import status
# from rest_framework.throttling import UserRateThrottle, AnonRateThrottle
# import logging
# import uuid
# from datetime import datetime, timedelta
# from typing import Dict, Any

# from service_operations.models import OperationLog, Subscription, ClientOperation, ActivationQueue
# from service_operations.serializers.operation_serializers import (
#     OperationLogSerializer,
#     OperationStatisticsSerializer,
# )
# from service_operations.services.subscription_service import SubscriptionService
# from service_operations.services.subscription_service import ActivationService
# from service_operations.services.queue_service import QueueService
# from service_operations.adapters.internet_plans_adapter import InternetPlansAdapter
# from service_operations.adapters.network_adapter import NetworkAdapter
# from service_operations.adapters.payment_adapter import PaymentAdapter

# logger = logging.getLogger(__name__)


# class OperationLogPagination(PageNumberPagination):
#     """Pagination for operation logs"""
#     page_size = 50
#     page_size_query_param = 'page_size'
#     max_page_size = 200


# class OperationLogView(APIView):
#     """
#     View for operation logs (staff only)
#     """
    
#     permission_classes = [IsAdminUser]
#     pagination_class = OperationLogPagination
#     throttle_classes = [UserRateThrottle]
    
#     def get(self, request):
#         """
#         Get operation logs with filtering
#         """
#         try:
#             queryset = OperationLog.objects.select_related('subscription', 'client_operation').all()
            
#             # Apply filters
#             queryset = self._apply_filters(queryset, request)
#             queryset = self._apply_sorting(queryset, request)
            
#             # Paginate
#             paginator = self.pagination_class()
#             page = paginator.paginate_queryset(queryset, request)
            
#             # Serialize
#             serializer = OperationLogSerializer(page, many=True, context={'request': request})
            
#             # Get log statistics
#             stats = self._get_log_statistics()
            
#             response_data = {
#                 'success': True,
#                 'count': len(page),
#                 'results': serializer.data,
#                 'statistics': stats,
#                 'metadata': {
#                     'total': paginator.page.paginator.count,
#                     'page_size': paginator.get_page_size(request),
#                     'timestamp': timezone.now().isoformat(),
#                 }
#             }
            
#             return paginator.get_paginated_response(serializer.data)
            
#         except Exception as e:
#             logger.error(f"Failed to get operation logs: {e}", exc_info=True)
#             return Response({
#                 'success': False,
#                 'error': 'Failed to load operation logs',
#                 'details': str(e) if request.user.is_staff else None
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
#     def _apply_filters(self, queryset, request):
#         """Apply filters to operation logs"""
#         # Operation type filter
#         if operation_type := request.query_params.get('operation_type'):
#             queryset = queryset.filter(operation_type=operation_type)
        
#         # Severity filter
#         if severity := request.query_params.get('severity'):
#             queryset = queryset.filter(severity=severity)
        
#         # Errors only filter
#         if errors_only := request.query_params.get('errors_only'):
#             if errors_only.lower() in ['true', '1']:
#                 queryset = queryset.filter(severity__in=['error', 'critical'])
        
#         # Subscription filter
#         if subscription_id := request.query_params.get('subscription_id'):
#             queryset = queryset.filter(subscription_id=subscription_id)
        
#         # Client filter
#         if client_id := request.query_params.get('client_id'):
#             queryset = queryset.filter(subscription__client_id=client_id)
        
#         # Client type filter
#         if client_type := request.query_params.get('client_type'):
#             queryset = queryset.filter(subscription__client_type=client_type)
        
#         # Source module filter
#         if source_module := request.query_params.get('source_module'):
#             queryset = queryset.filter(source_module=source_module)
        
#         # Date range filter
#         if start_date := request.query_params.get('start_date'):
#             try:
#                 start = timezone.make_aware(datetime.fromisoformat(start_date))
#                 queryset = queryset.filter(created_at__gte=start)
#             except ValueError:
#                 pass
        
#         if end_date := request.query_params.get('end_date'):
#             try:
#                 end = timezone.make_aware(datetime.fromisoformat(end_date))
#                 queryset = queryset.filter(created_at__lte=end)
#             except ValueError:
#                 pass
        
#         # Search filter
#         if search := request.query_params.get('search'):
#             queryset = queryset.filter(
#                 Q(description__icontains=search) |
#                 Q(error_message__icontains=search) |
#                 Q(source_module__icontains=search) |
#                 Q(source_function__icontains=search)
#             )
        
#         return queryset
    
#     def _apply_sorting(self, queryset, request):
#         """Apply sorting to operation logs"""
#         sort_by = request.query_params.get('sort_by', '-created_at')
#         sort_order = request.query_params.get('sort_order', 'desc')
        
#         sort_map = {
#             'created': 'created_at',
#             'severity': 'severity',
#             'operation_type': 'operation_type',
#             'duration': 'duration_ms',
#             'source': 'source_module',
#         }
        
#         field = sort_map.get(sort_by, sort_by)
#         if sort_order == 'desc' and not field.startswith('-'):
#             field = f'-{field}'
#         elif sort_order == 'asc' and field.startswith('-'):
#             field = field[1:]
        
#         return queryset.order_by(field)
    
#     def _get_log_statistics(self):
#         """Get operation log statistics"""
#         now = timezone.now()
#         last_24_hours = now - timedelta(hours=24)
        
#         stats = OperationLog.objects.filter(
#             created_at__gte=last_24_hours
#         ).aggregate(
#             total=Count('id'),
#             errors=Count('id', filter=Q(severity__in=['error', 'critical'])),
#             warnings=Count('id', filter=Q(severity='warning')),
#             avg_duration=Avg('duration_ms'),
#         )
        
#         # Get top error sources
#         error_sources = OperationLog.objects.filter(
#             created_at__gte=last_24_hours,
#             severity__in=['error', 'critical']
#         ).values('source_module', 'source_function').annotate(
#             error_count=Count('id')
#         ).order_by('-error_count')[:10]
        
#         return {
#             'last_24_hours': {
#                 'total': stats['total'] or 0,
#                 'errors': stats['errors'] or 0,
#                 'warnings': stats['warnings'] or 0,
#                 'avg_duration_ms': round(stats['avg_duration'] or 0, 2),
#             },
#             'top_error_sources': list(error_sources),
#             'timestamp': now.isoformat(),
#         }


# class OperationLogDetailView(APIView):
#     """
#     View for operation log details
#     """
    
#     permission_classes = [IsAdminUser]
#     throttle_classes = [UserRateThrottle]
    
#     def get(self, request, log_id):
#         """
#         Get operation log details
#         """
#         try:
#             log_entry = get_object_or_404(
#                 OperationLog.objects.select_related('subscription', 'client_operation'),
#                 id=log_id
#             )
            
#             serializer = OperationLogSerializer(log_entry, context={'request': request})
            
#             return Response({
#                 'success': True,
#                 'log_entry': serializer.data,
#             })
            
#         except Exception as e:
#             logger.error(f"Failed to get operation log {log_id}: {e}", exc_info=True)
#             return Response({
#                 'success': False,
#                 'error': 'Operation log not found'
#             }, status=status.HTTP_404_NOT_FOUND)


# class OperationStatsView(APIView):
#     """
#     View for comprehensive operation statistics
#     """
    
#     permission_classes = [IsAdminUser]
#     throttle_classes = [UserRateThrottle]
    
#     def get(self, request):
#         """
#         Get comprehensive operation statistics
#         """
#         try:
#             # Cache key
#             cache_key = "operation_statistics"
#             cached_data = cache.get(cache_key)
            
#             if cached_data:
#                 return Response(cached_data)
            
#             now = timezone.now()
#             last_hour = now - timedelta(hours=1)
#             last_24_hours = now - timedelta(hours=24)
#             last_week = now - timedelta(days=7)
            
#             # General operation statistics
#             general_stats = OperationLog.objects.filter(
#                 created_at__gte=last_24_hours
#             ).aggregate(
#                 total_operations=Count('id'),
#                 total_errors=Count('id', filter=Q(severity__in=['error', 'critical'])),
#                 total_warnings=Count('id', filter=Q(severity='warning')),
#                 avg_duration=Avg('duration_ms'),
#                 max_duration=Max('duration_ms'),
#                 min_duration=Min('duration_ms'),
#             )
            
#             # Recent activity (last hour)
#             recent_activity = OperationLog.objects.filter(
#                 created_at__gte=last_hour
#             ).aggregate(
#                 ops_last_hour=Count('id'),
#                 errors_last_hour=Count('id', filter=Q(severity__in=['error', 'critical']))
#             )
            
#             # Client operation statistics
#             client_op_stats = ClientOperation.objects.filter(
#                 requested_at__gte=last_week
#             ).aggregate(
#                 total_requests=Count('id'),
#                 completed_requests=Count('id', filter=Q(status='completed')),
#                 failed_requests=Count('id', filter=Q(status='failed')),
#                 avg_resolution_time=Avg('duration_seconds', filter=Q(status='completed'))
#             )
            
#             # Subscription statistics
#             subscription_stats = Subscription.objects.filter(
#                 is_active=True
#             ).aggregate(
#                 total=Count('id'),
#                 active=Count('id', filter=Q(status='active')),
#                 pending=Count('id', filter=Q(status='pending_activation')),
#                 expired=Count('id', filter=Q(status='expired')),
#             )
            
#             # Activation queue statistics
#             activation_stats = ActivationQueue.get_queue_stats()
            
#             # System health indicators
#             system_health = {
#                 'database': True,  # Would check database connection
#                 'cache': True,     # Would check cache connection
#                 'external_services': {
#                     'internet_plans': InternetPlansAdapter.check_health(),
#                     'network_management': NetworkAdapter.check_health(),
#                     'payment_gateway': PaymentAdapter.check_health(),
#                 }
#             }
            
#             response_data = {
#                 'success': True,
#                 'timestamp': now.isoformat(),
#                 'general_stats': {
#                     'total_operations_24h': general_stats['total_operations'] or 0,
#                     'total_errors_24h': general_stats['total_errors'] or 0,
#                     'total_warnings_24h': general_stats['total_warnings'] or 0,
#                     'avg_duration_ms': round(general_stats['avg_duration'] or 0, 2),
#                     'max_duration_ms': general_stats['max_duration'] or 0,
#                     'min_duration_ms': general_stats['min_duration'] or 0,
#                 },
#                 'activity_last_hour': {
#                     'operations': recent_activity['ops_last_hour'] or 0,
#                     'errors': recent_activity['errors_last_hour'] or 0,
#                 },
#                 'client_operation_stats': {
#                     'total_requests_7d': client_op_stats['total_requests'] or 0,
#                     'completed_requests_7d': client_op_stats['completed_requests'] or 0,
#                     'failed_requests_7d': client_op_stats['failed_requests'] or 0,
#                     'avg_resolution_time_seconds': round(client_op_stats['avg_resolution_time'] or 0, 2),
#                 },
#                 'subscription_stats': {
#                     'total': subscription_stats['total'] or 0,
#                     'active': subscription_stats['active'] or 0,
#                     'pending_activation': subscription_stats['pending'] or 0,
#                     'expired': subscription_stats['expired'] or 0,
#                 },
#                 'activation_stats': activation_stats,
#                 'system_health': system_health,
#             }
            
#             # Cache for 2 minutes
#             cache.set(cache_key, response_data, 120)
            
#             return Response(response_data)
            
#         except Exception as e:
#             logger.error(f"Failed to get operation statistics: {e}", exc_info=True)
#             return Response({
#                 'success': False,
#                 'error': 'Failed to get statistics',
#                 'timestamp': timezone.now().isoformat()
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# class SystemHealthView(APIView):
#     """
#     Public health check endpoint
#     """
    
#     permission_classes = [AllowAny]
#     throttle_classes = [AnonRateThrottle]
    
#     def get(self, request):
#         """
#         Perform system health check
#         """
#         try:
#             # Check database connection
#             try:
#                 Subscription.objects.first()
#                 database_ok = True
#             except Exception as db_e:
#                 logger.error(f"Database health check failed: {db_e}")
#                 database_ok = False
            
#             # Check cache
#             try:
#                 cache_key = "health_check"
#                 test_value = str(uuid.uuid4())
#                 cache.set(cache_key, test_value, timeout=10)
#                 cached_value = cache.get(cache_key)
#                 cache_ok = cached_value == test_value
#             except Exception as cache_e:
#                 logger.error(f"Cache health check failed: {cache_e}")
#                 cache_ok = False
            
#             # Check external services (non-blocking)
#             external_services = {
#                 'internet_plans': InternetPlansAdapter.check_health(),
#                 'network_management': NetworkAdapter.check_health(),
#                 'payment_gateway': PaymentAdapter.check_health(),
#             }
            
#             # Determine overall health
#             overall_healthy = database_ok and cache_ok
            
#             response_data = {
#                 'success': overall_healthy,
#                 'timestamp': timezone.now().isoformat(),
#                 'checks': {
#                     'database': database_ok,
#                     'cache': cache_ok,
#                     'external_services': external_services,
#                 },
#                 'version': getattr(settings, 'SERVICE_OPERATIONS_VERSION', '1.0.0'),
#                 'environment': getattr(settings, 'ENVIRONMENT', 'production'),
#             }
            
#             status_code = status.HTTP_200_OK if overall_healthy else status.HTTP_503_SERVICE_UNAVAILABLE
            
#             return Response(response_data, status=status_code)
            
#         except Exception as e:
#             logger.error(f"Health check failed: {e}", exc_info=True)
#             return Response({
#                 'success': False,
#                 'error': 'Health check failed',
#                 'timestamp': timezone.now().isoformat()
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# class DashboardView(APIView):
#     """
#     Dashboard view for system overview
#     """
    
#     permission_classes = [IsAdminUser]
#     throttle_classes = [UserRateThrottle]
    
#     def get(self, request):
#         """
#         Get dashboard data
#         """
#         try:
#             # Cache key
#             cache_key = "dashboard_data"
#             cached_data = cache.get(cache_key)
            
#             if cached_data:
#                 return Response(cached_data)
            
#             now = timezone.now()
#             today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
#             week_start = now - timedelta(days=7)
            
#             # Recent subscriptions
#             recent_subscriptions = Subscription.objects.filter(
#                 created_at__gte=week_start
#             ).order_by('-created_at')[:10]
            
#             # Pending activations
#             pending_activations = ActivationQueue.objects.filter(
#                 status__in=['pending', 'retrying']
#             ).order_by('-priority', 'created_at')[:10]
            
#             # Recent errors
#             recent_errors = OperationLog.objects.filter(
#                 severity__in=['error', 'critical'],
#                 created_at__gte=today_start
#             ).order_by('-created_at')[:10]
            
#             # Today's statistics
#             today_stats = {
#                 'subscriptions_created': Subscription.objects.filter(
#                     created_at__gte=today_start
#                 ).count(),
#                 'activations_completed': ActivationQueue.objects.filter(
#                     status='completed',
#                     completed_at__gte=today_start
#                 ).count(),
#                 'payments_received': Subscription.objects.filter(
#                     payment_confirmed_at__gte=today_start
#                 ).count(),
#                 'client_operations': ClientOperation.objects.filter(
#                     requested_at__gte=today_start
#                 ).count(),
#             }
            
#             # Client type distribution
#             client_type_dist = Subscription.objects.filter(
#                 is_active=True
#             ).values('client_type').annotate(
#                 count=Count('id')
#             )
            
#             # Build dashboard data
#             dashboard_data = {
#                 'success': True,
#                 'timestamp': now.isoformat(),
#                 'today_stats': today_stats,
#                 'client_type_distribution': list(client_type_dist),
#                 'recent_subscriptions': [
#                     {
#                         'id': str(sub.id),
#                         'client_type': sub.client_type,
#                         'status': sub.status,
#                         'created_at': sub.created_at.isoformat(),
#                         'payment_method': sub.payment_method,
#                     }
#                     for sub in recent_subscriptions
#                 ],
#                 'pending_activations': [
#                     {
#                         'id': str(act.id),
#                         'subscription_id': str(act.subscription.id),
#                         'client_type': act.subscription.client_type,
#                         'priority': act.priority,
#                         'status': act.status,
#                         'created_at': act.created_at.isoformat(),
#                         'error_message': act.error_message,
#                     }
#                     for act in pending_activations
#                 ],
#                 'recent_errors': [
#                     {
#                         'id': str(log.id),
#                         'operation_type': log.operation_type,
#                         'severity': log.severity,
#                         'description': log.description[:100],
#                         'created_at': log.created_at.isoformat(),
#                         'source_module': log.source_module,
#                     }
#                     for log in recent_errors
#                 ],
#                 'system_health': {
#                     'subscription_service': SubscriptionService.health_check(),
#                     'queue_service': QueueService.health_check(),
#                     'activation_service': ActivationService.health_check(),
#                 },
#             }
            
#             # Cache for 1 minute
#             cache.set(cache_key, dashboard_data, 60)
            
#             return Response(dashboard_data)
            
#         except Exception as e:
#             logger.error(f"Failed to get dashboard data: {e}", exc_info=True)
#             return Response({
#                 'success': False,
#                 'error': 'Failed to load dashboard data',
#                 'timestamp': timezone.now().isoformat()
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)










"""
Operation Views for system monitoring and logging
Production-ready with comprehensive metrics
FIXED: Resolved FieldError for duration_seconds by using ExpressionWrapper
FIXED: Added proper error handling for all external service health checks
FIXED: Improved cache management and response structure
"""

from django.shortcuts import get_object_or_404
from django.db.models import Q, Count, Avg, Max, Min, F, ExpressionWrapper, DurationField
from django.utils import timezone
from django.core.cache import cache
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.pagination import PageNumberPagination
from rest_framework import status
from rest_framework.throttling import UserRateThrottle, AnonRateThrottle
import logging
import uuid
from datetime import datetime, timedelta
from typing import Dict, Any, Optional

from service_operations.models import OperationLog, Subscription, ClientOperation, ActivationQueue
from service_operations.serializers.operation_serializers import (
    OperationLogSerializer,
    OperationStatisticsSerializer,
)
from service_operations.services.subscription_service import SubscriptionService
from service_operations.services.activation_service import ActivationService
from service_operations.services.queue_service import QueueService
from service_operations.adapters.internet_plans_adapter import InternetPlansAdapter
from service_operations.adapters.network_adapter import NetworkAdapter
from service_operations.adapters.payment_adapter import PaymentAdapter

logger = logging.getLogger(__name__)


class OperationLogPagination(PageNumberPagination):
    """Pagination for operation logs"""
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 200
    
    def get_paginated_response(self, data):
        """Enhanced paginated response with metadata"""
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


class OperationLogView(APIView):
    """
    View for operation logs (staff only)
    """
    
    permission_classes = [IsAdminUser]
    pagination_class = OperationLogPagination
    throttle_classes = [UserRateThrottle]
    
    def get(self, request):
        """
        Get operation logs with filtering
        """
        try:
            queryset = OperationLog.objects.select_related('subscription', 'client_operation').all()
            
            # Apply filters
            queryset = self._apply_filters(queryset, request)
            queryset = self._apply_sorting(queryset, request)
            
            # Paginate
            paginator = self.pagination_class()
            page = paginator.paginate_queryset(queryset, request)
            
            # Serialize
            serializer = OperationLogSerializer(page, many=True, context={'request': request})
            
            # Get log statistics
            stats = self._get_log_statistics()
            
            return paginator.get_paginated_response({
                'results': serializer.data,
                'statistics': stats,
            })
            
        except Exception as e:
            logger.error(f"Failed to get operation logs: {e}", exc_info=True)
            return Response({
                'success': False,
                'error': 'Failed to load operation logs',
                'details': str(e) if request.user.is_staff else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _apply_filters(self, queryset, request):
        """Apply filters to operation logs"""
        # Operation type filter
        if operation_type := request.query_params.get('operation_type'):
            queryset = queryset.filter(operation_type=operation_type)
        
        # Severity filter
        if severity := request.query_params.get('severity'):
            queryset = queryset.filter(severity=severity)
        
        # Errors only filter
        if errors_only := request.query_params.get('errors_only'):
            if errors_only.lower() in ['true', '1']:
                queryset = queryset.filter(severity__in=['error', 'critical'])
        
        # Subscription filter
        if subscription_id := request.query_params.get('subscription_id'):
            queryset = queryset.filter(subscription_id=subscription_id)
        
        # Client filter
        if client_id := request.query_params.get('client_id'):
            queryset = queryset.filter(subscription__client_id=client_id)
        
        # Client type filter
        if client_type := request.query_params.get('client_type'):
            queryset = queryset.filter(subscription__client_type=client_type)
        
        # Source module filter
        if source_module := request.query_params.get('source_module'):
            queryset = queryset.filter(source_module=source_module)
        
        # Date range filter
        if start_date := request.query_params.get('start_date'):
            try:
                start = timezone.make_aware(datetime.fromisoformat(start_date))
                queryset = queryset.filter(created_at__gte=start)
            except ValueError:
                pass
        
        if end_date := request.query_params.get('end_date'):
            try:
                end = timezone.make_aware(datetime.fromisoformat(end_date))
                queryset = queryset.filter(created_at__lte=end)
            except ValueError:
                pass
        
        # Search filter
        if search := request.query_params.get('search'):
            queryset = queryset.filter(
                Q(description__icontains=search) |
                Q(error_message__icontains=search) |
                Q(source_module__icontains=search) |
                Q(source_function__icontains=search)
            )
        
        return queryset
    
    def _apply_sorting(self, queryset, request):
        """Apply sorting to operation logs"""
        sort_by = request.query_params.get('sort_by', '-created_at')
        sort_order = request.query_params.get('sort_order', 'desc')
        
        sort_map = {
            'created': 'created_at',
            'severity': 'severity',
            'operation_type': 'operation_type',
            'duration': 'duration_ms',
            'source': 'source_module',
        }
        
        field = sort_map.get(sort_by, sort_by)
        if sort_order == 'desc' and not field.startswith('-'):
            field = f'-{field}'
        elif sort_order == 'asc' and field.startswith('-'):
            field = field[1:]
        
        return queryset.order_by(field)
    
    def _get_log_statistics(self):
        """Get operation log statistics"""
        now = timezone.now()
        last_24_hours = now - timedelta(hours=24)
        
        stats = OperationLog.objects.filter(
            created_at__gte=last_24_hours
        ).aggregate(
            total=Count('id'),
            errors=Count('id', filter=Q(severity__in=['error', 'critical'])),
            warnings=Count('id', filter=Q(severity='warning')),
            avg_duration=Avg('duration_ms'),
        )
        
        # Get top error sources
        error_sources = OperationLog.objects.filter(
            created_at__gte=last_24_hours,
            severity__in=['error', 'critical']
        ).values('source_module', 'source_function').annotate(
            error_count=Count('id')
        ).order_by('-error_count')[:10]
        
        return {
            'last_24_hours': {
                'total': stats['total'] or 0,
                'errors': stats['errors'] or 0,
                'warnings': stats['warnings'] or 0,
                'avg_duration_ms': round(stats['avg_duration'] or 0, 2),
            },
            'top_error_sources': list(error_sources),
            'timestamp': now.isoformat(),
        }


class OperationLogDetailView(APIView):
    """
    View for operation log details
    """
    
    permission_classes = [IsAdminUser]
    throttle_classes = [UserRateThrottle]
    
    def get(self, request, log_id):
        """
        Get operation log details
        """
        try:
            log_entry = get_object_or_404(
                OperationLog.objects.select_related('subscription', 'client_operation'),
                id=log_id
            )
            
            serializer = OperationLogSerializer(log_entry, context={'request': request})
            
            return Response({
                'success': True,
                'log_entry': serializer.data,
                'timestamp': timezone.now().isoformat()
            })
            
        except Exception as e:
            logger.error(f"Failed to get operation log {log_id}: {e}", exc_info=True)
            return Response({
                'success': False,
                'error': 'Operation log not found',
                'timestamp': timezone.now().isoformat()
            }, status=status.HTTP_404_NOT_FOUND)


class OperationStatsView(APIView):
    """
    View for comprehensive operation statistics
    FIXED: Resolved FieldError for duration_seconds by using ExpressionWrapper
    """
    
    permission_classes = [IsAdminUser]
    throttle_classes = [UserRateThrottle]
    
    def get(self, request):
        """
        Get comprehensive operation statistics
        """
        try:
            # Cache key
            cache_key = "operation_statistics"
            cached_data = cache.get(cache_key)
            
            if cached_data:
                return Response(cached_data)
            
            now = timezone.now()
            last_hour = now - timedelta(hours=1)
            last_24_hours = now - timedelta(hours=24)
            last_week = now - timedelta(days=7)
            
            # ==================== GENERAL OPERATION STATISTICS ====================
            general_stats = OperationLog.objects.filter(
                created_at__gte=last_24_hours
            ).aggregate(
                total_operations=Count('id'),
                total_errors=Count('id', filter=Q(severity__in=['error', 'critical'])),
                total_warnings=Count('id', filter=Q(severity='warning')),
                avg_duration=Avg('duration_ms'),
                max_duration=Max('duration_ms'),
                min_duration=Min('duration_ms'),
            )
            
            # ==================== RECENT ACTIVITY ====================
            recent_activity = OperationLog.objects.filter(
                created_at__gte=last_hour
            ).aggregate(
                ops_last_hour=Count('id'),
                errors_last_hour=Count('id', filter=Q(severity__in=['error', 'critical']))
            )
            
            # ==================== CLIENT OPERATION STATISTICS ====================
            # FIXED: Use ExpressionWrapper to calculate duration from started_at and completed_at
            client_operations = ClientOperation.objects.filter(
                requested_at__gte=last_week
            ).annotate(
                calculated_duration=ExpressionWrapper(
                    F('completed_at') - F('started_at'),
                    output_field=DurationField()
                )
            )
            
            client_op_stats = client_operations.aggregate(
                total_requests=Count('id'),
                completed_requests=Count('id', filter=Q(status='completed')),
                failed_requests=Count('id', filter=Q(status='failed')),
                pending_requests=Count('id', filter=Q(status='pending')),
                in_progress_requests=Count('id', filter=Q(status='in_progress')),
                avg_resolution_time=Avg('calculated_duration', filter=Q(status='completed'))
            )
            
            # Convert duration to seconds for consistent response
            avg_resolution_seconds = None
            if client_op_stats['avg_resolution_time']:
                avg_resolution_seconds = client_op_stats['avg_resolution_time'].total_seconds()
            
            # ==================== SUBSCRIPTION STATISTICS ====================
            subscription_stats = Subscription.objects.filter(
                is_active=True
            ).aggregate(
                total=Count('id'),
                active=Count('id', filter=Q(status='active')),
                pending_activation=Count('id', filter=Q(status='pending_activation')),
                expired=Count('id', filter=Q(status='expired')),
                suspended=Count('id', filter=Q(status='suspended')),
                cancelled=Count('id', filter=Q(status='cancelled')),
            )
            
            # ==================== ACTIVATION QUEUE STATISTICS ====================
            activation_stats = self._get_activation_statistics()
            
            # ==================== ERROR DISTRIBUTION ====================
            error_distribution = self._get_error_distribution(last_24_hours)
            
            # ==================== SYSTEM HEALTH INDICATORS ====================
            system_health = self._get_system_health()
            
            # ==================== SUCCESS RATE CALCULATION ====================
            total_completed = client_op_stats['completed_requests'] or 0
            total_failed = client_op_stats['failed_requests'] or 0
            total_ops = total_completed + total_failed
            success_rate = (total_completed * 100.0 / total_ops) if total_ops > 0 else 100.0
            
            # ==================== BUILD RESPONSE ====================
            response_data = {
                'success': True,
                'timestamp': now.isoformat(),
                'statistics': {
                    'general': {
                        'total_operations_24h': general_stats['total_operations'] or 0,
                        'total_errors_24h': general_stats['total_errors'] or 0,
                        'total_warnings_24h': general_stats['total_warnings'] or 0,
                        'avg_duration_ms': round(general_stats['avg_duration'] or 0, 2),
                        'max_duration_ms': general_stats['max_duration'] or 0,
                        'min_duration_ms': general_stats['min_duration'] or 0,
                    },
                    'recent_activity': {
                        'operations': recent_activity['ops_last_hour'] or 0,
                        'errors': recent_activity['errors_last_hour'] or 0,
                    },
                    'client_operations': {
                        'total_requests_7d': client_op_stats['total_requests'] or 0,
                        'completed_requests_7d': client_op_stats['completed_requests'] or 0,
                        'failed_requests_7d': client_op_stats['failed_requests'] or 0,
                        'pending_requests': client_op_stats['pending_requests'] or 0,
                        'in_progress_requests': client_op_stats['in_progress_requests'] or 0,
                        'avg_resolution_time_seconds': round(avg_resolution_seconds or 0, 2),
                    },
                    'subscriptions': {
                        'total': subscription_stats['total'] or 0,
                        'active': subscription_stats['active'] or 0,
                        'pending_activation': subscription_stats['pending_activation'] or 0,
                        'expired': subscription_stats['expired'] or 0,
                        'suspended': subscription_stats['suspended'] or 0,
                        'cancelled': subscription_stats['cancelled'] or 0,
                    },
                    'activation_queue': activation_stats,
                    'error_distribution': error_distribution,
                    'success_rate': round(success_rate, 1),
                    'errors_last_24h': general_stats['total_errors'] or 0,
                    'warnings_last_24h': general_stats['total_warnings'] or 0,
                    'average_duration_ms': round(general_stats['avg_duration'] or 0, 2),
                },
                'system_health': system_health,
            }
            
            # Cache for 2 minutes
            cache.set(cache_key, response_data, 120)
            
            return Response(response_data)
            
        except Exception as e:
            logger.error(f"Failed to get operation statistics: {e}", exc_info=True)
            return Response({
                'success': False,
                'error': 'Failed to get statistics',
                'details': str(e) if settings.DEBUG else None,
                'timestamp': timezone.now().isoformat()
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _get_activation_statistics(self) -> Dict[str, Any]:
        """Get activation queue statistics"""
        try:
            # Get queue stats from service
            queue_stats = QueueService.get_queue_stats()
            
            if queue_stats and queue_stats.get('success'):
                return queue_stats
            
            # Fallback: direct database query
            now = timezone.now()
            last_24_hours = now - timedelta(hours=24)
            
            stats = ActivationQueue.objects.filter(
                created_at__gte=last_24_hours
            ).aggregate(
                total=Count('id'),
                pending=Count('id', filter=Q(status='pending')),
                processing=Count('id', filter=Q(status='processing')),
                retrying=Count('id', filter=Q(status='retrying')),
                failed=Count('id', filter=Q(status='failed')),
                completed=Count('id', filter=Q(status='completed')),
                avg_duration=Avg('actual_duration_seconds', filter=Q(status='completed')),
            )
            
            return {
                'total': stats['total'] or 0,
                'pending': stats['pending'] or 0,
                'processing': stats['processing'] or 0,
                'retrying': stats['retrying'] or 0,
                'failed': stats['failed'] or 0,
                'completed': stats['completed'] or 0,
                'avg_duration_seconds': round(stats['avg_duration'] or 0, 2),
            }
            
        except Exception as e:
            logger.error(f"Failed to get activation statistics: {e}")
            return {
                'total': 0,
                'pending': 0,
                'processing': 0,
                'retrying': 0,
                'failed': 0,
                'completed': 0,
                'avg_duration_seconds': 0,
            }
    
    def _get_error_distribution(self, since: datetime) -> list:
        """Get error distribution by source module"""
        try:
            error_distribution = OperationLog.objects.filter(
                created_at__gte=since,
                severity__in=['error', 'critical']
            ).values('source_module').annotate(
                count=Count('id')
            ).order_by('-count')[:10]
            
            total_errors = sum(item['count'] for item in error_distribution)
            
            distribution = []
            for item in error_distribution:
                distribution.append({
                    'type': item['source_module'] or 'unknown',
                    'count': item['count'],
                    'percentage': round((item['count'] / total_errors * 100), 1) if total_errors > 0 else 0
                })
            
            return distribution
            
        except Exception as e:
            logger.error(f"Failed to get error distribution: {e}")
            return []
    
    def _get_system_health(self) -> Dict[str, Any]:
        """Get system health indicators with graceful fallbacks"""
        health = {
            'database': True,
            'cache': True,
            'external_services': {}
        }
        
        # Check external services with error handling
        try:
            health['external_services']['internet_plans'] = InternetPlansAdapter.health_check()
        except Exception as e:
            logger.warning(f"Internet Plans health check failed: {e}")
            health['external_services']['internet_plans'] = {'status': 'unavailable', 'error': str(e)}
        
        try:
            health['external_services']['network_management'] = NetworkAdapter.health_check()
        except Exception as e:
            logger.warning(f"Network Management health check failed: {e}")
            health['external_services']['network_management'] = {'status': 'unavailable', 'error': str(e)}
        
        try:
            health['external_services']['payment_gateway'] = PaymentAdapter.health_check()
        except Exception as e:
            logger.warning(f"Payment Gateway health check failed: {e}")
            health['external_services']['payment_gateway'] = {'status': 'unavailable', 'error': str(e)}
        
        return health


class SystemHealthView(APIView):
    """
    Public health check endpoint
    FIXED: Added comprehensive health checks for all services
    """
    
    permission_classes = [AllowAny]
    throttle_classes = [AnonRateThrottle]
    
    def get(self, request):
        """
        Perform comprehensive system health check
        """
        try:
            # Check database connection
            database_ok = self._check_database_health()
            
            # Check cache
            cache_ok = self._check_cache_health()
            
            # Check external services
            external_services = self._check_external_services()
            
            # Determine overall health
            overall_healthy = database_ok and cache_ok
            
            response_data = {
                'success': overall_healthy,
                'status': 'healthy' if overall_healthy else 'degraded',
                'timestamp': timezone.now().isoformat(),
                'checks': {
                    'database': {
                        'status': 'healthy' if database_ok else 'unhealthy',
                        'healthy': database_ok
                    },
                    'cache': {
                        'status': 'healthy' if cache_ok else 'unhealthy',
                        'healthy': cache_ok
                    },
                    'external_services': external_services,
                },
                'version': getattr(settings, 'SERVICE_OPERATIONS_VERSION', '1.0.0'),
                'environment': getattr(settings, 'ENVIRONMENT', 'production'),
            }
            
            status_code = status.HTTP_200_OK if overall_healthy else status.HTTP_503_SERVICE_UNAVAILABLE
            
            return Response(response_data, status=status_code)
            
        except Exception as e:
            logger.error(f"Health check failed: {e}", exc_info=True)
            return Response({
                'success': False,
                'status': 'error',
                'error': 'Health check failed',
                'details': str(e) if settings.DEBUG else None,
                'timestamp': timezone.now().isoformat()
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _check_database_health(self) -> bool:
        """Check database connectivity"""
        try:
            Subscription.objects.exists()
            return True
        except Exception as e:
            logger.error(f"Database health check failed: {e}")
            return False
    
    def _check_cache_health(self) -> bool:
        """Check cache connectivity"""
        try:
            cache_key = "health_check"
            test_value = str(uuid.uuid4())
            cache.set(cache_key, test_value, timeout=10)
            cached_value = cache.get(cache_key)
            cache.delete(cache_key)
            return cached_value == test_value
        except Exception as e:
            logger.error(f"Cache health check failed: {e}")
            return False
    
    def _check_external_services(self) -> Dict[str, Any]:
        """Check all external services health"""
        services = {}
        
        # Internet Plans
        try:
            services['internet_plans'] = InternetPlansAdapter.health_check()
        except Exception as e:
            services['internet_plans'] = {
                'status': 'unavailable',
                'healthy': False,
                'error': str(e)
            }
        
        # Network Management
        try:
            services['network_management'] = NetworkAdapter.health_check()
        except Exception as e:
            services['network_management'] = {
                'status': 'unavailable',
                'healthy': False,
                'error': str(e)
            }
        
        # Payment Gateway
        try:
            services['payment_gateway'] = PaymentAdapter.health_check()
        except Exception as e:
            services['payment_gateway'] = {
                'status': 'unavailable',
                'healthy': False,
                'error': str(e)
            }
        
        return services


class DashboardView(APIView):
    """
    Dashboard view for system overview
    """
    
    permission_classes = [IsAdminUser]
    throttle_classes = [UserRateThrottle]
    
    def get(self, request):
        """
        Get comprehensive dashboard data
        """
        try:
            # Cache key
            cache_key = "dashboard_data"
            cached_data = cache.get(cache_key)
            
            if cached_data:
                return Response(cached_data)
            
            now = timezone.now()
            today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
            week_start = now - timedelta(days=7)
            
            # ==================== RECENT SUBSCRIPTIONS ====================
            recent_subscriptions = Subscription.objects.filter(
                created_at__gte=week_start
            ).select_related('parent_subscription').order_by('-created_at')[:10]
            
            # ==================== PENDING ACTIVATIONS ====================
            pending_activations = ActivationQueue.objects.filter(
                status__in=['pending', 'retrying']
            ).select_related('subscription').order_by('-priority', 'created_at')[:10]
            
            # ==================== RECENT ERRORS ====================
            recent_errors = OperationLog.objects.filter(
                severity__in=['error', 'critical'],
                created_at__gte=today_start
            ).order_by('-created_at')[:10]
            
            # ==================== TODAY'S STATISTICS ====================
            today_stats = {
                'subscriptions_created': Subscription.objects.filter(
                    created_at__gte=today_start
                ).count(),
                'activations_completed': ActivationQueue.objects.filter(
                    status='completed',
                    completed_at__gte=today_start
                ).count(),
                'payments_received': Subscription.objects.filter(
                    payment_confirmed_at__gte=today_start
                ).count(),
                'client_operations': ClientOperation.objects.filter(
                    requested_at__gte=today_start
                ).count(),
                'errors_today': OperationLog.objects.filter(
                    severity__in=['error', 'critical'],
                    created_at__gte=today_start
                ).count(),
            }
            
            # ==================== CLIENT TYPE DISTRIBUTION ====================
            client_type_dist = Subscription.objects.filter(
                is_active=True
            ).values('client_type').annotate(
                count=Count('id')
            )
            
            # ==================== STATUS DISTRIBUTION ====================
            status_dist = Subscription.objects.filter(
                is_active=True
            ).values('status').annotate(
                count=Count('id')
            )
            
            # ==================== WEEKLY TREND ====================
            weekly_trend = []
            for i in range(7):
                day = now - timedelta(days=i)
                day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
                day_end = day_start + timedelta(days=1)
                
                weekly_trend.append({
                    'date': day_start.date().isoformat(),
                    'subscriptions': Subscription.objects.filter(
                        created_at__gte=day_start,
                        created_at__lt=day_end
                    ).count(),
                    'activations': ActivationQueue.objects.filter(
                        completed_at__gte=day_start,
                        completed_at__lt=day_end,
                        status='completed'
                    ).count(),
                })
            
            # ==================== SERVICE HEALTH ====================
            service_health = {
                'subscription_service': self._safe_health_check(SubscriptionService.health_check),
                'queue_service': self._safe_health_check(QueueService.health_check),
                'activation_service': self._safe_health_check(ActivationService.health_check),
            }
            
            # ==================== BUILD DASHBOARD DATA ====================
            dashboard_data = {
                'success': True,
                'timestamp': now.isoformat(),
                'today_stats': today_stats,
                'client_type_distribution': [
                    {
                        'type': item['client_type'],
                        'count': item['count']
                    }
                    for item in client_type_dist
                ],
                'status_distribution': [
                    {
                        'status': item['status'],
                        'count': item['count']
                    }
                    for item in status_dist
                ],
                'weekly_trend': weekly_trend,
                'recent_subscriptions': [
                    {
                        'id': str(sub.id),
                        'client_id': str(sub.client_id) if sub.client_id else None,
                        'client_type': sub.client_type,
                        'status': sub.status,
                        'created_at': sub.created_at.isoformat(),
                        'payment_method': sub.payment_method,
                        'amount': float(sub.metadata.get('plan_price', 0)) if sub.metadata else 0,
                    }
                    for sub in recent_subscriptions
                ],
                'pending_activations': [
                    {
                        'id': str(act.id),
                        'subscription_id': str(act.subscription.id) if act.subscription else None,
                        'client_type': act.subscription.client_type if act.subscription else None,
                        'priority': act.priority,
                        'status': act.status,
                        'created_at': act.created_at.isoformat(),
                        'error_message': act.error_message,
                        'retry_count': act.retry_count,
                    }
                    for act in pending_activations
                ],
                'recent_errors': [
                    {
                        'id': str(log.id),
                        'operation_type': log.operation_type,
                        'severity': log.severity,
                        'description': log.description[:100] + ('...' if len(log.description) > 100 else ''),
                        'created_at': log.created_at.isoformat(),
                        'source_module': log.source_module,
                        'subscription_id': str(log.subscription.id) if log.subscription else None,
                    }
                    for log in recent_errors
                ],
                'system_health': service_health,
            }
            
            # Cache for 1 minute
            cache.set(cache_key, dashboard_data, 60)
            
            return Response(dashboard_data)
            
        except Exception as e:
            logger.error(f"Failed to get dashboard data: {e}", exc_info=True)
            return Response({
                'success': False,
                'error': 'Failed to load dashboard data',
                'details': str(e) if settings.DEBUG else None,
                'timestamp': timezone.now().isoformat()
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _safe_health_check(self, health_func) -> Dict[str, Any]:
        """Safely execute health check function"""
        try:
            result = health_func()
            if isinstance(result, dict):
                return result
            return {'status': 'healthy' if result else 'unknown'}
        except Exception as e:
            logger.warning(f"Health check failed: {e}")
            return {
                'status': 'unavailable',
                'error': str(e)
            }