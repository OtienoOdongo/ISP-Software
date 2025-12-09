# from django.shortcuts import get_object_or_404
# from django.db.models import Q
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework.permissions import IsAuthenticated
# from rest_framework import status
# from django.db.models import Q, Count
# import logging
# from django.core.cache import cache
# from django.core.paginator import Paginator, EmptyPage
# from internet_plans.models.create_plan_models import Subscription
# from internet_plans.serializers.create_plan_serializers import SubscriptionSerializer
# import logging


# logger = logging.getLogger(__name__)



# class SubscriptionListView(APIView):
#     """
#     Production-ready Subscription List View with comprehensive filtering and client support
#     """
#     permission_classes = [IsAuthenticated]
    
#     def get(self, request):
#         """
#         Get subscriptions with advanced filtering, pagination, and caching
#         """
#         try:
#             # Generate cache key
#             cache_key = f"subscriptions_{request.user.id}_{request.GET.urlencode()}"
#             cached_data = cache.get(cache_key)
            
#             if cached_data:
#                 logger.info(f"Cache hit for subscriptions - User: {request.user.id}")
#                 return Response(cached_data)
            
#             # Build optimized query
#             queryset = Subscription.objects.select_related(
#                 'client', 'internet_plan', 'router', 'client__user'
#             ).prefetch_related('usage_records').order_by('-start_date')
            
#             # ✅ PRODUCTION FIX: Add client_id filter support
#             client_id = request.query_params.get('client_id')
#             if client_id:
#                 try:
#                     client_id_int = int(client_id)
#                     queryset = queryset.filter(client_id=client_id_int)
#                 except (ValueError, TypeError):
#                     return Response(
#                         {
#                             "error": "Invalid client_id format",
#                             "code": "INVALID_CLIENT_ID"
#                         },
#                         status=status.HTTP_400_BAD_REQUEST
#                     )
            
#             # Apply status filter
#             status_filter = request.query_params.get('status')
#             if status_filter:
#                 valid_statuses = ['active', 'pending', 'expired', 'cancelled', 'suspended']
#                 if status_filter in valid_statuses:
#                     queryset = queryset.filter(status=status_filter)
#                 else:
#                     return Response(
#                         {
#                             "error": f"Invalid status. Must be one of: {', '.join(valid_statuses)}",
#                             "code": "INVALID_STATUS"
#                         },
#                         status=status.HTTP_400_BAD_REQUEST
#                     )
            
#             # Apply plan filter
#             plan_filter = request.query_params.get('plan')
#             if plan_filter:
#                 try:
#                     plan_id = int(plan_filter)
#                     queryset = queryset.filter(internet_plan_id=plan_id)
#                 except (ValueError, TypeError):
#                     return Response(
#                         {
#                             "error": "Invalid plan ID format",
#                             "code": "INVALID_PLAN_ID"
#                         },
#                         status=status.HTTP_400_BAD_REQUEST
#                     )
            
#             # Apply router filter
#             router_filter = request.query_params.get('router')
#             if router_filter:
#                 try:
#                     router_id = int(router_filter)
#                     queryset = queryset.filter(router_id=router_id)
#                 except (ValueError, TypeError):
#                     return Response(
#                         {
#                             "error": "Invalid router ID format",
#                             "code": "INVALID_ROUTER_ID"
#                         },
#                         status=status.HTTP_400_BAD_REQUEST
#                     )
            
#             # Apply access method filter
#             access_method_filter = request.query_params.get('access_method')
#             if access_method_filter:
#                 valid_methods = ['hotspot', 'pppoe', 'both']
#                 if access_method_filter in valid_methods:
#                     queryset = queryset.filter(access_method=access_method_filter)
#                 else:
#                     return Response(
#                         {
#                             "error": f"Invalid access method. Must be one of: {', '.join(valid_methods)}",
#                             "code": "INVALID_ACCESS_METHOD"
#                         },
#                         status=status.HTTP_400_BAD_REQUEST
#                     )
            
#             # Apply date range filter
#             start_date = request.query_params.get('start_date')
#             end_date = request.query_params.get('end_date')
#             if start_date and end_date:
#                 queryset = queryset.filter(
#                     start_date__gte=start_date,
#                     start_date__lte=end_date
#                 )
            
#             # Apply search filter
#             search_query = request.query_params.get('search')
#             if search_query:
#                 queryset = queryset.filter(
#                     Q(client__user__username__icontains=search_query) |
#                     Q(client__user__phone_number__icontains=search_query) |
#                     Q(internet_plan__name__icontains=search_query) |
#                     Q(access_method__icontains=search_query)
#                 )
            
#             # Enhanced pagination
#             page = int(request.query_params.get('page', 1))
#             page_size = min(int(request.query_params.get('page_size', 20)), 50)  # Max 50 per page
            
#             paginator = Paginator(queryset, page_size)
            
#             try:
#                 page_obj = paginator.page(page)
#             except EmptyPage:
#                 page_obj = paginator.page(paginator.num_pages)
            
#             # Serialize with performance optimization
#             serializer = SubscriptionSerializer(page_obj, many=True)
            
#             # Calculate subscription statistics
#             stats = self._calculate_subscription_stats(queryset)
            
#             response_data = {
#                 "subscriptions": serializer.data,
#                 "pagination": {
#                     "current_page": page_obj.number,
#                     "total_pages": paginator.num_pages,
#                     "total_items": paginator.count,
#                     "page_size": page_size,
#                     "has_next": page_obj.has_next(),
#                     "has_previous": page_obj.has_previous()
#                 },
#                 "statistics": stats
#             }
            
#             # Cache for 3 minutes
#             cache.set(cache_key, response_data, 180)
            
#             logger.info(
#                 f"Subscriptions fetched successfully - "
#                 f"User: {request.user.id}, "
#                 f"Count: {paginator.count}, "
#                 f"Client ID: {client_id or 'All'}"
#             )
            
#             return Response(response_data)
            
#         except Exception as e:
#             logger.error(
#                 f"Failed to fetch subscriptions - "
#                 f"User: {request.user.id}, "
#                 f"Error: {str(e)}",
#                 exc_info=True
#             )
#             return Response(
#                 {
#                     "error": "Failed to fetch subscriptions",
#                     "code": "SUBSCRIPTION_FETCH_ERROR",
#                     "details": "Please try again or contact support"
#                 },
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )
    
#     def _calculate_subscription_stats(self, queryset):
#         """Calculate comprehensive subscription statistics"""
#         try:
#             # Basic counts
#             counts = queryset.aggregate(
#                 total=Count('id'),
#                 active=Count('id', filter=Q(status='active')),
#                 pending=Count('id', filter=Q(status='pending')),
#                 expired=Count('id', filter=Q(status='expired')),
#                 cancelled=Count('id', filter=Q(status='cancelled'))
#             )
            
#             # Access method breakdown
#             access_method_stats = list(queryset.values('access_method').annotate(
#                 count=Count('id'),
#                 active_count=Count('id', filter=Q(status='active'))
#             ).order_by('access_method'))
            
#             # Plan type breakdown
#             plan_stats = list(queryset.values('internet_plan__name').annotate(
#                 count=Count('id'),
#                 active_count=Count('id', filter=Q(status='active'))
#             ).order_by('-count')[:10])  # Top 10 plans
            
#             # Convert to structured format
#             access_method_dict = {}
#             for stat in access_method_stats:
#                 access_method_dict[stat['access_method']] = {
#                     'count': stat['count'],
#                     'active_count': stat['active_count'],
#                     'active_rate': (stat['active_count'] / stat['count'] * 100) if stat['count'] > 0 else 0
#                 }
            
#             plan_dict = {}
#             for stat in plan_stats:
#                 plan_name = stat['internet_plan__name'] or 'Unknown'
#                 plan_dict[plan_name] = {
#                     'count': stat['count'],
#                     'active_count': stat['active_count']
#                 }
            
#             return {
#                 "total": counts['total'],
#                 "active": counts['active'],
#                 "pending": counts['pending'],
#                 "expired": counts['expired'],
#                 "cancelled": counts['cancelled'],
#                 "active_rate": (counts['active'] / counts['total'] * 100) if counts['total'] > 0 else 0,
#                 "by_access_method": access_method_dict,
#                 "by_plan": plan_dict
#             }
            
#         except Exception as e:
#             logger.error(f"Error calculating subscription statistics: {str(e)}")
#             return {
#                 "total": 0,
#                 "active": 0,
#                 "pending": 0,
#                 "expired": 0,
#                 "cancelled": 0,
#                 "active_rate": 0,
#                 "by_access_method": {},
#                 "by_plan": {}
#             }

# class SubscriptionActivationView(APIView):
#     permission_classes = [IsAuthenticated]

#     def post(self, request, subscription_id):
#         subscription = get_object_or_404(
#             Subscription.objects.select_related('client', 'internet_plan', 'router'),
#             pk=subscription_id
#         )
        
#         if subscription.status != 'active':
#             return Response({
#                 'error': 'Subscription is not active'
#             }, status=status.HTTP_400_BAD_REQUEST)
        
#         if subscription.activation_requested:
#             return Response({
#                 'error': 'Activation already requested'
#             }, status=status.HTTP_400_BAD_REQUEST)
        
#         # Request activation via service
#         activation_result = subscription.request_activation()
        
#         if activation_result['success']:
#             return Response({
#                 'success': True,
#                 'message': 'Activation request submitted successfully',
#                 'activation_id': activation_result.get('activation_id')
#             }, status=status.HTTP_202_ACCEPTED)
#         else:
#             return Response({
#                 'success': False,
#                 'error': activation_result['error']
#             }, status=status.HTTP_400_BAD_REQUEST)

# class SubscriptionStatusView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request, subscription_id):
#         subscription = get_object_or_404(Subscription, pk=subscription_id)
        
#         from internet_plans.services.activation_service import ActivationService
        
#         activation_status = ActivationService.check_activation_status(subscription)
        
#         return Response({
#             'subscription_id': subscription.id,
#             'status': subscription.status,
#             'activation_status': activation_status,
#             'remaining_data': subscription.get_remaining_data_display(),
#             'remaining_time': subscription.get_remaining_time_display()
#         })









"""
Internet Plans - Subscription Views
API views for Subscriptions
"""

from django.shortcuts import get_object_or_404
from django.db.models import Q, Count, Sum, Avg
from django.utils import timezone
from django.db import transaction
from django.core.cache import cache
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.pagination import PageNumberPagination
from rest_framework import status
from rest_framework.throttling import UserRateThrottle
import logging
from datetime import datetime, timedelta

from internet_plans.models.subscription_models import Subscription
from internet_plans.models.plan_models import InternetPlan
from internet_plans.serializers.subscription_serializers import (
    SubscriptionSerializer,
    SubscriptionActivationSerializer,
    SubscriptionRenewSerializer
)
from internet_plans.services.activation_service import ActivationService
from internet_plans.services.integration_service import IntegrationService

logger = logging.getLogger(__name__)


class SubscriptionPagination(PageNumberPagination):
    """Subscription pagination class"""
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 50
    
    def get_paginated_response(self, data):
        return Response({
            'success': True,
            'count': self.page.paginator.count,
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'results': data,
            'page': self.page.number,
            'total_pages': self.page.paginator.num_pages
        })


class SubscriptionListView(APIView):
    """
    List and create Subscriptions
    GET: List subscriptions with filtering
    POST: Create new subscription
    """
    
    permission_classes = [IsAuthenticated]
    pagination_class = SubscriptionPagination
    throttle_classes = [UserRateThrottle]
    
    def get(self, request):
        """Get list of subscriptions with filtering"""
        try:
            # Base queryset
            queryset = Subscription.objects.select_related(
                'client', 'internet_plan', 'router'
            ).filter(is_active=True)
            
            # Apply permissions
            if not request.user.is_staff:
                # Clients can only see their own subscriptions
                queryset = queryset.filter(client=request.user)
            
            # Apply filters
            queryset = self._apply_filters(queryset, request)
            
            # Apply sorting
            queryset = self._apply_sorting(queryset, request)
            
            # Paginate
            paginator = self.pagination_class()
            page = paginator.paginate_queryset(queryset, request)
            
            # Serialize
            serializer = SubscriptionSerializer(page, many=True, context={'request': request})
            
            return paginator.get_paginated_response(serializer.data)
            
        except Exception as e:
            logger.error(f"Failed to get subscriptions: {e}")
            return Response({
                'success': False,
                'error': 'Failed to load subscriptions',
                'details': str(e) if request.user.is_staff else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def post(self, request):
        """Create new subscription"""
        try:
            serializer = SubscriptionSerializer(
                data=request.data,
                context={'request': request}
            )
            
            if not serializer.is_valid():
                return Response({
                    'success': False,
                    'error': 'Validation failed',
                    'details': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
            
            subscription = serializer.save()
            
            # Clear cache
            cache.delete_pattern(f"subscriptions:{request.user.id}:*")
            
            logger.info(f"Subscription created: {subscription.id} by {request.user.username}")
            
            return Response({
                'success': True,
                'message': 'Subscription created successfully',
                'subscription': SubscriptionSerializer(subscription, context={'request': request}).data
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Failed to create subscription: {e}")
            return Response({
                'success': False,
                'error': 'Failed to create subscription',
                'details': str(e) if request.user.is_staff else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _apply_filters(self, queryset, request):
        """Apply filters to queryset"""
        # Client filter (for staff only)
        if request.user.is_staff and (client_id := request.query_params.get('client_id')):
            queryset = queryset.filter(client_id=client_id)
        
        # Status filter
        if status_filter := request.query_params.get('status'):
            queryset = queryset.filter(status=status_filter)
        
        # Plan filter
        if plan_id := request.query_params.get('plan_id'):
            queryset = queryset.filter(internet_plan_id=plan_id)
        
        # Router filter
        if router_id := request.query_params.get('router_id'):
            queryset = queryset.filter(router_id=router_id)
        
        # Access method filter
        if access_method := request.query_params.get('access_method'):
            queryset = queryset.filter(access_method=access_method)
        
        # Date range filter
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        if start_date:
            try:
                start = timezone.make_aware(datetime.fromisoformat(start_date))
                queryset = queryset.filter(start_date__gte=start)
            except (ValueError, TypeError):
                pass
        if end_date:
            try:
                end = timezone.make_aware(datetime.fromisoformat(end_date))
                queryset = queryset.filter(start_date__lte=end)
            except (ValueError, TypeError):
                pass
        
        # Search filter
        if search := request.query_params.get('search'):
            try:
                from authentication.models import UserAccount
                clients = UserAccount.objects.filter(
                    Q(username__icontains=search) |
                    Q(phone_number__icontains=search)
                )
                queryset = queryset.filter(client__in=clients)
            except ImportError:
                # Fallback if authentication app not available
                pass
        
        return queryset
    
    def _apply_sorting(self, queryset, request):
        """Apply sorting to queryset"""
        sort_by = request.query_params.get('sort_by', '-start_date')
        sort_order = request.query_params.get('sort_order', 'desc')
        
        sort_map = {
            'start_date': 'start_date',
            'end_date': 'end_date',
            'status': 'status',
            'access_method': 'access_method',
        }
        
        field = sort_map.get(sort_by, sort_by)
        if sort_order == 'desc' and not field.startswith('-'):
            field = f'-{field}'
        elif sort_order == 'asc' and field.startswith('-'):
            field = field[1:]
        
        return queryset.order_by(field)


class SubscriptionDetailView(APIView):
    """
    Retrieve, update, or delete a Subscription
    """
    
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    
    def get(self, request, subscription_id):
        """Get subscription details"""
        try:
            subscription = get_object_or_404(
                Subscription.objects.select_related('client', 'internet_plan', 'router'),
                id=subscription_id,
                is_active=True
            )
            
            # Check permissions
            if not request.user.is_staff and subscription.client != request.user:
                return Response({
                    'success': False,
                    'error': 'Permission denied'
                }, status=status.HTTP_403_FORBIDDEN)
            
            serializer = SubscriptionSerializer(
                subscription, 
                context={'request': request}
            )
            
            return Response({
                'success': True,
                'subscription': serializer.data
            })
            
        except Exception as e:
            logger.error(f"Failed to get subscription {subscription_id}: {e}")
            return Response({
                'success': False,
                'error': 'Subscription not found'
            }, status=status.HTTP_404_NOT_FOUND)
    
    def put(self, request, subscription_id):
        """Update subscription"""
        try:
            subscription = get_object_or_404(Subscription, id=subscription_id, is_active=True)
            
            # Check permissions
            if not request.user.is_staff and subscription.client != request.user:
                return Response({
                    'success': False,
                    'error': 'Permission denied'
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Only allow certain fields to be updated
            allowed_fields = ['mac_address', 'notes', 'auto_renew']
            update_data = {
                k: v for k, v in request.data.items() 
                if k in allowed_fields
            }
            
            if not update_data:
                return Response({
                    'success': False,
                    'error': 'No valid fields to update'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Update subscription
            for field, value in update_data.items():
                setattr(subscription, field, value)
            
            subscription.save()
            
            # Clear cache
            cache.delete_pattern(f"subscriptions:{request.user.id}:*")
            
            logger.info(f"Subscription updated: {subscription_id} by {request.user.username}")
            
            return Response({
                'success': True,
                'message': 'Subscription updated successfully',
                'subscription': SubscriptionSerializer(subscription, context={'request': request}).data
            })
            
        except Exception as e:
            logger.error(f"Failed to update subscription {subscription_id}: {e}")
            return Response({
                'success': False,
                'error': 'Failed to update subscription',
                'details': str(e) if request.user.is_staff else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def delete(self, request, subscription_id):
        """Delete subscription"""
        if not request.user.is_staff:
            return Response({
                'success': False,
                'error': 'Permission denied'
            }, status=status.HTTP_403_FORBIDDEN)
        
        try:
            subscription = get_object_or_404(Subscription, id=subscription_id)
            
            # Soft delete
            subscription.is_active = False
            subscription.status = 'cancelled'
            subscription.save()
            
            # Clear cache
            cache.delete_pattern(f"subscriptions:*")
            
            logger.info(f"Subscription cancelled: {subscription_id} by {request.user.username}")
            
            return Response({
                'success': True,
                'message': 'Subscription cancelled successfully'
            })
            
        except Exception as e:
            logger.error(f"Failed to cancel subscription {subscription_id}: {e}")
            return Response({
                'success': False,
                'error': 'Failed to cancel subscription'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SubscriptionActivationView(APIView):
    """
    Activate a subscription after payment
    """
    
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    
    def post(self, request, subscription_id):
        """Activate subscription"""
        try:
            subscription = get_object_or_404(
                Subscription, 
                id=subscription_id,
                is_active=True
            )
            
            # Check permissions
            if not request.user.is_staff and subscription.client != request.user:
                return Response({
                    'success': False,
                    'error': 'Permission denied'
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Validate activation data
            serializer = SubscriptionActivationSerializer(
                data=request.data,
                context={'subscription': subscription}
            )
            
            if not serializer.is_valid():
                return Response({
                    'success': False,
                    'error': 'Validation failed',
                    'details': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
            
            transaction_reference = serializer.validated_data['transactionReference']
            
            # Activate subscription
            with transaction.atomic():
                success = subscription.activate(transaction_reference)
                
                if not success:
                    return Response({
                        'success': False,
                        'error': 'Failed to activate subscription'
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                # Clear cache
                cache.delete_pattern(f"subscriptions:{request.user.id}:*")
                
                logger.info(f"Subscription activated: {subscription_id} by {request.user.username}")
                
                return Response({
                    'success': True,
                    'message': 'Subscription activated successfully',
                    'subscription': SubscriptionSerializer(subscription, context={'request': request}).data
                })
                
        except Exception as e:
            logger.error(f"Failed to activate subscription {subscription_id}: {e}")
            return Response({
                'success': False,
                'error': 'Failed to activate subscription',
                'details': str(e) if request.user.is_staff else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SubscriptionRenewView(APIView):
    """
    Renew a subscription
    """
    
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    
    def post(self, request, subscription_id):
        """Renew subscription"""
        try:
            subscription = get_object_or_404(
                Subscription,
                id=subscription_id,
                is_active=True
            )
            
            # Check permissions
            if not request.user.is_staff and subscription.client != request.user:
                return Response({
                    'success': False,
                    'error': 'Permission denied'
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Validate renewal data
            serializer = SubscriptionRenewSerializer(data=request.data)
            
            if not serializer.is_valid():
                return Response({
                    'success': False,
                    'error': 'Validation failed',
                    'details': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
            
            duration_hours = serializer.validated_data.get('durationHours')
            
            # Check if subscription can be renewed
            if not subscription.can_renew():
                return Response({
                    'success': False,
                    'error': 'Subscription cannot be renewed'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Renew subscription
            with transaction.atomic():
                success = subscription.renew(duration_hours)
                
                if not success:
                    return Response({
                        'success': False,
                        'error': 'Failed to renew subscription'
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                # Clear cache
                cache.delete_pattern(f"subscriptions:{request.user.id}:*")
                
                logger.info(f"Subscription renewed: {subscription_id} by {request.user.username}")
                
                return Response({
                    'success': True,
                    'message': 'Subscription renewed successfully',
                    'subscription': SubscriptionSerializer(subscription, context={'request': request}).data
                })
                
        except Exception as e:
            logger.error(f"Failed to renew subscription {subscription_id}: {e}")
            return Response({
                'success': False,
                'error': 'Failed to renew subscription',
                'details': str(e) if request.user.is_staff else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SubscriptionStatusView(APIView):
    """
    Get subscription status and details
    """
    
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    
    def get(self, request, subscription_id):
        """Get subscription status"""
        try:
            subscription = get_object_or_404(
                Subscription.objects.select_related('client', 'internet_plan', 'router'),
                id=subscription_id,
                is_active=True
            )
            
            # Check permissions
            if not request.user.is_staff and subscription.client != request.user:
                return Response({
                    'success': False,
                    'error': 'Permission denied'
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Get activation status
            activation_status = ActivationService.check_activation_status(subscription)
            
            # Check if expired
            is_expired = subscription.is_expired()
            
            response_data = {
                'success': True,
                'subscription': {
                    'id': str(subscription.id),
                    'status': subscription.status,
                    'access_method': subscription.access_method,
                    'start_date': subscription.start_date.isoformat(),
                    'end_date': subscription.end_date.isoformat(),
                    'is_expired': is_expired,
                    'remaining_data': subscription.get_remaining_data_display(),
                    'remaining_time': subscription.get_remaining_time_display(),
                    'data_used': subscription.data_used,
                    'time_used': subscription.time_used,
                    'plan_name': subscription.internet_plan.name if subscription.internet_plan else None,
                    'router_name': subscription.router.name if subscription.router else None,
                },
                'activation': activation_status,
                'can_renew': subscription.can_renew(),
                'timestamp': timezone.now().isoformat()
            }
            
            return Response(response_data)
            
        except Exception as e:
            logger.error(f"Failed to get subscription status {subscription_id}: {e}")
            return Response({
                'success': False,
                'error': 'Failed to get subscription status',
                'timestamp': timezone.now().isoformat()
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SubscriptionStatisticsView(APIView):
    """
    Get subscription statistics
    """
    
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get subscription statistics"""
        try:
            # Cache key
            cache_key = f"subscription_stats:{request.user.id}"
            cached_data = cache.get(cache_key)
            
            if cached_data:
                return Response(cached_data)
            
            # Base queryset
            if request.user.is_staff:
                queryset = Subscription.objects.filter(is_active=True)
            else:
                queryset = Subscription.objects.filter(
                    client=request.user,
                    is_active=True
                )
            
            # Total subscriptions
            total_subs = queryset.count()
            
            # Subscriptions by status
            subs_by_status = list(queryset.values('status').annotate(
                count=Count('id')
            ).order_by('-count'))
            
            # Subscriptions by access method
            subs_by_method = list(queryset.values('access_method').annotate(
                count=Count('id'),
                active_count=Count('id', filter=Q(status='active'))
            ).order_by('-count'))
            
            # Active subscriptions
            active_subs = queryset.filter(status='active').count()
            
            # Expiring soon (within 24 hours)
            expiring_soon = queryset.filter(
                status='active',
                end_date__lte=timezone.now() + timedelta(hours=24),
                end_date__gt=timezone.now()
            ).count()
            
            # Recently created (last 7 days)
            recent_subs = queryset.filter(
                start_date__gte=timezone.now() - timedelta(days=7)
            ).count()
            
            # Data usage statistics
            total_data_used = queryset.aggregate(
                total=Sum('data_used')
            )['total'] or 0
            
            avg_data_used = queryset.aggregate(
                avg=Avg('data_used')
            )['avg'] or 0
            
            response_data = {
                'success': True,
                'statistics': {
                    'total_subscriptions': total_subs,
                    'active_subscriptions': active_subs,
                    'expiring_soon': expiring_soon,
                    'recently_created': recent_subs,
                    'by_status': subs_by_status,
                    'by_access_method': subs_by_method,
                    'data_usage': {
                        'total_bytes': total_data_used,
                        'average_bytes': avg_data_used,
                        'total_gb': total_data_used / (1024 ** 3)
                    }
                },
                'timestamp': timezone.now().isoformat()
            }
            
            # Cache for 5 minutes
            cache.set(cache_key, response_data, 300)
            
            return Response(response_data)
            
        except Exception as e:
            logger.error(f"Failed to get subscription statistics: {e}")
            return Response({
                'success': False,
                'error': 'Failed to get statistics',
                'timestamp': timezone.now().isoformat()
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)