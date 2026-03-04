

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