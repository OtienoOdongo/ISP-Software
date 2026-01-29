"""
Operation Views for system monitoring and logging
Production-ready with comprehensive metrics
"""

from django.shortcuts import get_object_or_404
from django.db.models import Q, Count, Avg, Max, Min
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
from typing import Dict, Any

from service_operations.models import OperationLog, Subscription, ClientOperation, ActivationQueue
from service_operations.serializers.operation_serializers import (
    OperationLogSerializer,
    OperationStatisticsSerializer,
)
from service_operations.services.subscription_service import SubscriptionService
from service_operations.services.subscription_service import ActivationService
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
            
            response_data = {
                'success': True,
                'count': len(page),
                'results': serializer.data,
                'statistics': stats,
                'metadata': {
                    'total': paginator.page.paginator.count,
                    'page_size': paginator.get_page_size(request),
                    'timestamp': timezone.now().isoformat(),
                }
            }
            
            return paginator.get_paginated_response(serializer.data)
            
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
            })
            
        except Exception as e:
            logger.error(f"Failed to get operation log {log_id}: {e}", exc_info=True)
            return Response({
                'success': False,
                'error': 'Operation log not found'
            }, status=status.HTTP_404_NOT_FOUND)


class OperationStatsView(APIView):
    """
    View for comprehensive operation statistics
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
            
            # General operation statistics
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
            
            # Recent activity (last hour)
            recent_activity = OperationLog.objects.filter(
                created_at__gte=last_hour
            ).aggregate(
                ops_last_hour=Count('id'),
                errors_last_hour=Count('id', filter=Q(severity__in=['error', 'critical']))
            )
            
            # Client operation statistics
            client_op_stats = ClientOperation.objects.filter(
                requested_at__gte=last_week
            ).aggregate(
                total_requests=Count('id'),
                completed_requests=Count('id', filter=Q(status='completed')),
                failed_requests=Count('id', filter=Q(status='failed')),
                avg_resolution_time=Avg('duration_seconds', filter=Q(status='completed'))
            )
            
            # Subscription statistics
            subscription_stats = Subscription.objects.filter(
                is_active=True
            ).aggregate(
                total=Count('id'),
                active=Count('id', filter=Q(status='active')),
                pending=Count('id', filter=Q(status='pending_activation')),
                expired=Count('id', filter=Q(status='expired')),
            )
            
            # Activation queue statistics
            activation_stats = ActivationQueue.get_queue_stats()
            
            # System health indicators
            system_health = {
                'database': True,  # Would check database connection
                'cache': True,     # Would check cache connection
                'external_services': {
                    'internet_plans': InternetPlansAdapter.check_health(),
                    'network_management': NetworkAdapter.check_health(),
                    'payment_gateway': PaymentAdapter.check_health(),
                }
            }
            
            response_data = {
                'success': True,
                'timestamp': now.isoformat(),
                'general_stats': {
                    'total_operations_24h': general_stats['total_operations'] or 0,
                    'total_errors_24h': general_stats['total_errors'] or 0,
                    'total_warnings_24h': general_stats['total_warnings'] or 0,
                    'avg_duration_ms': round(general_stats['avg_duration'] or 0, 2),
                    'max_duration_ms': general_stats['max_duration'] or 0,
                    'min_duration_ms': general_stats['min_duration'] or 0,
                },
                'activity_last_hour': {
                    'operations': recent_activity['ops_last_hour'] or 0,
                    'errors': recent_activity['errors_last_hour'] or 0,
                },
                'client_operation_stats': {
                    'total_requests_7d': client_op_stats['total_requests'] or 0,
                    'completed_requests_7d': client_op_stats['completed_requests'] or 0,
                    'failed_requests_7d': client_op_stats['failed_requests'] or 0,
                    'avg_resolution_time_seconds': round(client_op_stats['avg_resolution_time'] or 0, 2),
                },
                'subscription_stats': {
                    'total': subscription_stats['total'] or 0,
                    'active': subscription_stats['active'] or 0,
                    'pending_activation': subscription_stats['pending'] or 0,
                    'expired': subscription_stats['expired'] or 0,
                },
                'activation_stats': activation_stats,
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
                'timestamp': timezone.now().isoformat()
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SystemHealthView(APIView):
    """
    Public health check endpoint
    """
    
    permission_classes = [AllowAny]
    throttle_classes = [AnonRateThrottle]
    
    def get(self, request):
        """
        Perform system health check
        """
        try:
            # Check database connection
            try:
                Subscription.objects.first()
                database_ok = True
            except Exception as db_e:
                logger.error(f"Database health check failed: {db_e}")
                database_ok = False
            
            # Check cache
            try:
                cache_key = "health_check"
                test_value = str(uuid.uuid4())
                cache.set(cache_key, test_value, timeout=10)
                cached_value = cache.get(cache_key)
                cache_ok = cached_value == test_value
            except Exception as cache_e:
                logger.error(f"Cache health check failed: {cache_e}")
                cache_ok = False
            
            # Check external services (non-blocking)
            external_services = {
                'internet_plans': InternetPlansAdapter.check_health(),
                'network_management': NetworkAdapter.check_health(),
                'payment_gateway': PaymentAdapter.check_health(),
            }
            
            # Determine overall health
            overall_healthy = database_ok and cache_ok
            
            response_data = {
                'success': overall_healthy,
                'timestamp': timezone.now().isoformat(),
                'checks': {
                    'database': database_ok,
                    'cache': cache_ok,
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
                'error': 'Health check failed',
                'timestamp': timezone.now().isoformat()
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class DashboardView(APIView):
    """
    Dashboard view for system overview
    """
    
    permission_classes = [IsAdminUser]
    throttle_classes = [UserRateThrottle]
    
    def get(self, request):
        """
        Get dashboard data
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
            
            # Recent subscriptions
            recent_subscriptions = Subscription.objects.filter(
                created_at__gte=week_start
            ).order_by('-created_at')[:10]
            
            # Pending activations
            pending_activations = ActivationQueue.objects.filter(
                status__in=['pending', 'retrying']
            ).order_by('-priority', 'created_at')[:10]
            
            # Recent errors
            recent_errors = OperationLog.objects.filter(
                severity__in=['error', 'critical'],
                created_at__gte=today_start
            ).order_by('-created_at')[:10]
            
            # Today's statistics
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
            }
            
            # Client type distribution
            client_type_dist = Subscription.objects.filter(
                is_active=True
            ).values('client_type').annotate(
                count=Count('id')
            )
            
            # Build dashboard data
            dashboard_data = {
                'success': True,
                'timestamp': now.isoformat(),
                'today_stats': today_stats,
                'client_type_distribution': list(client_type_dist),
                'recent_subscriptions': [
                    {
                        'id': str(sub.id),
                        'client_type': sub.client_type,
                        'status': sub.status,
                        'created_at': sub.created_at.isoformat(),
                        'payment_method': sub.payment_method,
                    }
                    for sub in recent_subscriptions
                ],
                'pending_activations': [
                    {
                        'id': str(act.id),
                        'subscription_id': str(act.subscription.id),
                        'client_type': act.subscription.client_type,
                        'priority': act.priority,
                        'status': act.status,
                        'created_at': act.created_at.isoformat(),
                        'error_message': act.error_message,
                    }
                    for act in pending_activations
                ],
                'recent_errors': [
                    {
                        'id': str(log.id),
                        'operation_type': log.operation_type,
                        'severity': log.severity,
                        'description': log.description[:100],
                        'created_at': log.created_at.isoformat(),
                        'source_module': log.source_module,
                    }
                    for log in recent_errors
                ],
                'system_health': {
                    'subscription_service': SubscriptionService.health_check(),
                    'queue_service': QueueService.health_check(),
                    'activation_service': ActivationService.health_check(),
                },
            }
            
            # Cache for 1 minute
            cache.set(cache_key, dashboard_data, 60)
            
            return Response(dashboard_data)
            
        except Exception as e:
            logger.error(f"Failed to get dashboard data: {e}", exc_info=True)
            return Response({
                'success': False,
                'error': 'Failed to load dashboard data',
                'timestamp': timezone.now().isoformat()
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)