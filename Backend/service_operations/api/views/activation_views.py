"""
Activation Views for dynamic activation queue management
Production-ready with automatic retry and prioritization
"""

from django.shortcuts import get_object_or_404
from django.db.models import Q, Count, Avg
from django.utils import timezone
from django.db import transaction
from django.core.cache import cache
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.pagination import PageNumberPagination
from rest_framework import status
from rest_framework.throttling import UserRateThrottle
import logging
from datetime import datetime, timedelta
from typing import Dict, Any

from service_operations.models.activation_queue_models import ActivationQueue
from service_operations.models.operation_log_models import OperationLog
from service_operations.models.subscription_models import Subscription
from service_operations.serializers.operation_serializers import (
    ActivationQueueSerializer,
    ActivationQueueCreateSerializer,
    ActivationRetrySerializer,
)
from service_operations.services.queue_service import QueueService
from service_operations.services.activation_service import ActivationService
from service_operations.adapters.network_adapter import NetworkAdapter

logger = logging.getLogger(__name__)


class ActivationPagination(PageNumberPagination):
    """Pagination for activation queue"""
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 50


class ActivationQueueView(APIView):
    """
    View for activation queue management
    """
    
    permission_classes = [IsAuthenticated]
    pagination_class = ActivationPagination
    throttle_classes = [UserRateThrottle]
    
    def get(self, request):
        """
        Get activation queue with filtering
        """
        if not request.user.is_staff:
            return Response({
                'success': False,
                'error': 'Permission denied'
            }, status=status.HTTP_403_FORBIDDEN)
        
        try:
            queryset = ActivationQueue.objects.select_related('subscription').all()
            
            # Apply filters
            queryset = self._apply_filters(queryset, request)
            queryset = self._apply_sorting(queryset, request)
            
            # Paginate
            paginator = self.pagination_class()
            page = paginator.paginate_queryset(queryset, request)
            
            # Serialize
            serializer = ActivationQueueSerializer(page, many=True, context={'request': request})
            
            # Get queue statistics
            stats = ActivationQueue.get_queue_stats()
            
            response_data = {
                'success': True,
                'count': len(page),
                'results': serializer.data,
                'statistics': stats,
                'queue_health': QueueService.health_check(),
            }
            
            return Response(response_data)
            
        except Exception as e:
            logger.error(f"Failed to get activation queue: {e}", exc_info=True)
            return Response({
                'success': False,
                'error': 'Failed to load activation queue',
                'details': str(e) if request.user.is_staff else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def post(self, request):
        """
        Create activation queue item
        """
        if not request.user.is_staff:
            return Response({
                'success': False,
                'error': 'Permission denied'
            }, status=status.HTTP_403_FORBIDDEN)
        
        try:
            serializer = ActivationQueueCreateSerializer(data=request.data)
            
            if not serializer.is_valid():
                return Response({
                    'success': False,
                    'error': 'Validation failed',
                    'details': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Create activation queue item
            activation = serializer.save()
            
            logger.info(f"Activation queue item created: {activation.id} by {request.user.username}")
            
            return Response({
                'success': True,
                'message': 'Activation queue item created successfully',
                'activation': ActivationQueueSerializer(activation, context={'request': request}).data
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Failed to create activation queue item: {e}", exc_info=True)
            return Response({
                'success': False,
                'error': 'Failed to create activation queue item',
                'details': str(e) if request.user.is_staff else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _apply_filters(self, queryset, request):
        """Apply filters to activation queue"""
        # Status filter
        if status_filter := request.query_params.get('status'):
            queryset = queryset.filter(status=status_filter)
        
        # Priority filter
        if priority := request.query_params.get('priority'):
            try:
                queryset = queryset.filter(priority=int(priority))
            except ValueError:
                pass
        
        # Subscription filter
        if subscription_id := request.query_params.get('subscription_id'):
            queryset = queryset.filter(subscription_id=subscription_id)
        
        # Client filter
        if client_id := request.query_params.get('client_id'):
            queryset = queryset.filter(subscription__client_id=client_id)
        
        # Client type filter
        if client_type := request.query_params.get('client_type'):
            queryset = queryset.filter(subscription__client_type=client_type)
        
        # Router filter
        if router_id := request.query_params.get('router_id'):
            queryset = queryset.filter(router_id=router_id)
        
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
                Q(subscription__id__icontains=search) |
                Q(error_message__icontains=search) |
                Q(processor_id__icontains=search)
            )
        
        return queryset
    
    def _apply_sorting(self, queryset, request):
        """Apply sorting to activation queue"""
        sort_by = request.query_params.get('sort_by', '-priority')
        sort_order = request.query_params.get('sort_order', 'desc')
        
        sort_map = {
            'priority': 'priority',
            'status': 'status',
            'created': 'created_at',
            'updated': 'updated_at',
            'retry_count': 'retry_count',
            'next_retry': 'next_retry_at',
        }
        
        field = sort_map.get(sort_by, sort_by)
        if sort_order == 'desc' and not field.startswith('-'):
            field = f'-{field}'
        elif sort_order == 'asc' and field.startswith('-'):
            field = field[1:]
        
        return queryset.order_by(field)


class ActivationQueueDetailView(APIView):
    """
    View for activation queue item details
    """
    
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    
    def get(self, request, activation_id):
        """
        Get activation queue item details
        """
        if not request.user.is_staff:
            return Response({
                'success': False,
                'error': 'Permission denied'
            }, status=status.HTTP_403_FORBIDDEN)
        
        try:
            activation = get_object_or_404(
                ActivationQueue.objects.select_related('subscription'),
                id=activation_id
            )
            
            serializer = ActivationQueueSerializer(activation, context={'request': request})
            
            # Get related operation logs
            operation_logs = OperationLog.objects.filter(
                subscription=activation.subscription,
                operation_type__in=['subscription_activation', 'activation_requested']
            ).order_by('-created_at')[:10]
            
            response_data = {
                'success': True,
                'activation': serializer.data,
                'subscription_details': {
                    'id': str(activation.subscription.id),
                    'client_id': str(activation.subscription.client_id),
                    'client_type': activation.subscription.client_type,
                    'status': activation.subscription.status,
                    'access_method': activation.subscription.access_method,
                    'is_expired': activation.subscription.is_expired,
                    'can_be_activated': activation.subscription.can_be_activated,
                },
                'operation_logs': [
                    {
                        'id': str(log.id),
                        'operation_type': log.operation_type,
                        'severity': log.severity,
                        'description': log.description,
                        'created_at': log.created_at.isoformat(),
                        'error_message': log.error_message,
                    }
                    for log in operation_logs
                ],
            }
            
            return Response(response_data)
            
        except Exception as e:
            logger.error(f"Failed to get activation queue item {activation_id}: {e}", exc_info=True)
            return Response({
                'success': False,
                'error': 'Activation queue item not found'
            }, status=status.HTTP_404_NOT_FOUND)


class ActivationProcessView(APIView):
    """
    View for processing activation queue items
    """
    
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    
    def post(self, request, activation_id):
        """
        Process an activation queue item
        """
        if not request.user.is_staff:
            return Response({
                'success': False,
                'error': 'Permission denied'
            }, status=status.HTTP_403_FORBIDDEN)
        
        try:
            activation = get_object_or_404(
                ActivationQueue.objects.select_related('subscription'),
                id=activation_id,
                status__in=['pending', 'retrying']
            )
            
            # Mark as processing
            processor_id = f"staff_{request.user.id}"
            activation.mark_processing(processor_id)
            
            # Process activation based on client type
            subscription = activation.subscription
            
            if subscription.client_type == 'hotspot_client':
                result = self._process_hotspot_activation(activation)
            elif subscription.client_type == 'pppoe_client':
                result = self._process_pppoe_activation(activation)
            else:
                result = {'success': False, 'error': 'Unknown client type'}
            
            # Handle result
            if result['success']:
                activation.mark_completed()
                
                # Create success log
                OperationLog.log_operation(
                    operation_type='subscription_activation',
                    severity='info',
                    subscription=subscription,
                    description=f"Activation completed successfully for {subscription.client_type}",
                    details={
                        'activation_id': str(activation.id),
                        'processor_id': processor_id,
                        'client_type': subscription.client_type,
                        'access_method': subscription.access_method,
                    },
                    source_module='activation_views',
                    source_function='ActivationProcessView'
                )
                
                logger.info(f"Activation {activation_id} completed successfully")
                
                return Response({
                    'success': True,
                    'message': 'Activation completed successfully',
                    'activation': ActivationQueueSerializer(activation, context={'request': request}).data,
                })
                
            else:
                activation.mark_failed(
                    error_message=result.get('error', 'Unknown error'),
                    error_details=result.get('details', {}),
                    retry=True
                )
                
                # Create error log
                OperationLog.log_operation(
                    operation_type='subscription_activation',
                    severity='error',
                    subscription=subscription,
                    description=f"Activation failed for {subscription.client_type}",
                    details={
                        'activation_id': str(activation.id),
                        'processor_id': processor_id,
                        'error': result.get('error'),
                        'error_details': result.get('details'),
                    },
                    source_module='activation_views',
                    source_function='ActivationProcessView'
                )
                
                logger.error(f"Activation {activation_id} failed: {result.get('error')}")
                
                return Response({
                    'success': False,
                    'error': result.get('error', 'Activation failed'),
                    'details': result.get('details'),
                    'activation': ActivationQueueSerializer(activation, context={'request': request}).data,
                }, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            logger.error(f"Failed to process activation {activation_id}: {e}", exc_info=True)
            return Response({
                'success': False,
                'error': 'Failed to process activation',
                'details': str(e) if request.user.is_staff else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _process_hotspot_activation(self, activation):
        """Process hotspot client activation"""
        try:
            subscription = activation.subscription
            
            # Verify we have MAC address
            if not subscription.hotspot_mac_address:
                return {
                    'success': False,
                    'error': 'MAC address required for hotspot activation',
                    'details': {'client_type': 'hotspot_client'}
                }
            
            # Verify we have router ID
            if not subscription.router_id:
                return {
                    'success': False,
                    'error': 'Router ID required for hotspot activation',
                    'details': {'client_type': 'hotspot_client'}
                }
            
            # Call network adapter to configure hotspot user
            network_result = NetworkAdapter.configure_hotspot_user(
                router_id=subscription.router_id,
                mac_address=subscription.hotspot_mac_address,
                username=f"hotspot_{subscription.client_id}",
                password=subscription.pppoe_password or f"pass_{subscription.id.hex[:8]}",
                data_limit_mb=subscription.data_limit_bytes // (1024 * 1024) if subscription.data_limit_bytes > 0 else 0,
                time_limit_hours=subscription.time_limit_seconds // 3600 if subscription.time_limit_seconds > 0 else 0,
                metadata={
                    'subscription_id': str(subscription.id),
                    'client_id': str(subscription.client_id),
                    'activation_id': str(activation.id),
                }
            )
            
            if not network_result.get('success'):
                return {
                    'success': False,
                    'error': network_result.get('error', 'Network configuration failed'),
                    'details': network_result.get('details', {})
                }
            
            return {
                'success': True,
                'details': network_result.get('details', {})
            }
            
        except Exception as e:
            logger.error(f"Hotspot activation failed: {e}", exc_info=True)
            return {
                'success': False,
                'error': f'Hotspot activation failed: {str(e)}',
                'details': {'exception': str(e)}
            }
    
    def _process_pppoe_activation(self, activation):
        """Process PPPoE client activation"""
        try:
            subscription = activation.subscription
            
            # Verify we have PPPoE credentials
            if not subscription.pppoe_username or not subscription.pppoe_password:
                return {
                    'success': False,
                    'error': 'PPPoE credentials required for PPPoE activation',
                    'details': {'client_type': 'pppoe_client'}
                }
            
            # Verify we have router ID
            if not subscription.router_id:
                return {
                    'success': False,
                    'error': 'Router ID required for PPPoE activation',
                    'details': {'client_type': 'pppoe_client'}
                }
            
            # Call network adapter to configure PPPoE user
            network_result = NetworkAdapter.configure_pppoe_user(
                router_id=subscription.router_id,
                username=subscription.pppoe_username,
                password=subscription.pppoe_password,
                data_limit_mb=subscription.data_limit_bytes // (1024 * 1024) if subscription.data_limit_bytes > 0 else 0,
                time_limit_hours=subscription.time_limit_seconds // 3600 if subscription.time_limit_seconds > 0 else 0,
                metadata={
                    'subscription_id': str(subscription.id),
                    'client_id': str(subscription.client_id),
                    'activation_id': str(activation.id),
                }
            )
            
            if not network_result.get('success'):
                return {
                    'success': False,
                    'error': network_result.get('error', 'Network configuration failed'),
                    'details': network_result.get('details', {})
                }
            
            return {
                'success': True,
                'details': network_result.get('details', {})
            }
            
        except Exception as e:
            logger.error(f"PPPoE activation failed: {e}", exc_info=True)
            return {
                'success': False,
                'error': f'PPPoE activation failed: {str(e)}',
                'details': {'exception': str(e)}
            }


class ActivationRetryView(APIView):
    """
    View for retrying failed activations
    """
    
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    
    def post(self, request, activation_id):
        """
        Retry a failed activation
        """
        if not request.user.is_staff:
            return Response({
                'success': False,
                'error': 'Permission denied'
            }, status=status.HTTP_403_FORBIDDEN)
        
        try:
            activation = get_object_or_404(
                ActivationQueue.objects.select_related('subscription'),
                id=activation_id,
                status__in=['failed', 'retrying']
            )
            
            # Validate retry request
            serializer = ActivationRetrySerializer(data=request.data)
            
            if not serializer.is_valid():
                return Response({
                    'success': False,
                    'error': 'Validation failed',
                    'details': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
            
            validated_data = serializer.validated_data
            
            # Check if retry is allowed
            force_retry = validated_data.get('force_retry', False)
            reset_retry_count = validated_data.get('reset_retry_count', False)
            
            if activation.retry_count >= activation.max_retries and not force_retry:
                return Response({
                    'success': False,
                    'error': f'Max retries ({activation.max_retries}) exceeded'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Reset for retry
            activation.status = 'pending'
            activation.next_retry_at = None
            
            if reset_retry_count:
                activation.retry_count = 0
            
            if force_retry:
                activation.max_retries += 1
            
            # Update priority if specified
            if validated_data.get('priority'):
                activation.priority = validated_data['priority']
            
            activation.save()
            
            # Create retry log
            OperationLog.log_operation(
                operation_type='activation_retry',
                severity='info',
                subscription=activation.subscription,
                description=f'Activation retry requested by {request.user.username}',
                details={
                    'activation_id': str(activation.id),
                    'force_retry': force_retry,
                    'reset_retry_count': reset_retry_count,
                    'previous_retry_count': activation.retry_count,
                    'new_priority': activation.priority,
                },
                source_module='activation_views',
                source_function='ActivationRetryView'
            )
            
            logger.info(f"Activation retry requested: {activation_id}")
            
            return Response({
                'success': True,
                'message': 'Activation retry requested successfully',
                'activation': {
                    'id': str(activation.id),
                    'status': activation.status,
                    'retry_count': activation.retry_count,
                    'max_retries': activation.max_retries,
                    'priority': activation.priority,
                }
            })
            
        except Exception as e:
            logger.error(f"Failed to retry activation {activation_id}: {e}", exc_info=True)
            return Response({
                'success': False,
                'error': 'Failed to retry activation',
                'details': str(e) if request.user.is_staff else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ActivationStatsView(APIView):
    """
    View for activation statistics
    """
    
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """
        Get activation statistics
        """
        if not request.user.is_staff:
            return Response({
                'success': False,
                'error': 'Permission denied'
            }, status=status.HTTP_403_FORBIDDEN)
        
        try:
            # Cache key
            cache_key = "activation_statistics"
            cached_data = cache.get(cache_key)
            
            if cached_data:
                return Response(cached_data)
            
            now = timezone.now()
            today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
            week_start = now - timedelta(days=7)
            month_start = now - timedelta(days=30)
            
            # Today's statistics
            today_stats = ActivationQueue.objects.filter(
                created_at__gte=today_start
            ).aggregate(
                total=Count('id'),
                completed=Count('id', filter=Q(status='completed')),
                failed=Count('id', filter=Q(status='failed')),
                pending=Count('id', filter=Q(status__in=['pending', 'processing', 'retrying']))
            )
            
            # This week's statistics
            week_stats = ActivationQueue.objects.filter(
                created_at__gte=week_start
            ).aggregate(
                total=Count('id'),
                completed=Count('id', filter=Q(status='completed')),
                failed=Count('id', filter=Q(status='failed')),
                average_duration=Avg('actual_duration_seconds', filter=Q(status='completed'))
            )
            
            # This month's statistics
            month_stats = ActivationQueue.objects.filter(
                created_at__gte=month_start
            ).aggregate(
                total=Count('id'),
                completed=Count('id', filter=Q(status='completed')),
                failed=Count('id', filter=Q(status='failed')),
            )
            
            # Success rate calculation
            total_completed = week_stats['completed'] or 0
            total_failed = week_stats['failed'] or 0
            total_attempts = total_completed + total_failed
            
            success_rate = (total_completed * 100.0 / total_attempts) if total_attempts > 0 else 0
            
            # Priority distribution
            priority_dist = ActivationQueue.objects.filter(
                created_at__gte=week_start
            ).values('priority').annotate(
                count=Count('id')
            ).order_by('priority')
            
            # Client type distribution
            client_type_dist = ActivationQueue.objects.filter(
                created_at__gte=week_start
            ).values('subscription__client_type').annotate(
                count=Count('id')
            )
            
            response_data = {
                'success': True,
                'statistics': {
                    'today': {
                        'total': today_stats['total'] or 0,
                        'completed': today_stats['completed'] or 0,
                        'failed': today_stats['failed'] or 0,
                        'pending': today_stats['pending'] or 0,
                    },
                    'this_week': {
                        'total': week_stats['total'] or 0,
                        'completed': total_completed,
                        'failed': total_failed,
                        'success_rate': round(success_rate, 2),
                        'average_duration_seconds': round(week_stats['average_duration'] or 0, 2),
                    },
                    'this_month': {
                        'total': month_stats['total'] or 0,
                        'completed': month_stats['completed'] or 0,
                        'failed': month_stats['failed'] or 0,
                    },
                    'priority_distribution': [
                        {'priority': item['priority'], 'count': item['count']}
                        for item in priority_dist
                    ],
                    'client_type_distribution': [
                        {'client_type': item['subscription__client_type'], 'count': item['count']}
                        for item in client_type_dist
                    ],
                },
                'queue_health': QueueService.health_check(),
                'activation_service_health': ActivationService.health_check(),
                'timestamp': now.isoformat(),
            }
            
            # Cache for 5 minutes
            cache.set(cache_key, response_data, 300)
            
            return Response(response_data)
            
        except Exception as e:
            logger.error(f"Failed to get activation statistics: {e}", exc_info=True)
            return Response({
                'success': False,
                'error': 'Failed to get statistics',
                'timestamp': timezone.now().isoformat()
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)