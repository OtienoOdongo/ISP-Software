from django.shortcuts import get_object_or_404
from django.db.models import Q
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.db.models import Q, Count
import logging
from django.core.cache import cache
from django.core.paginator import Paginator, EmptyPage
from internet_plans.models.create_plan_models import Subscription
from internet_plans.serializers.create_plan_serializers import SubscriptionSerializer
import logging


logger = logging.getLogger(__name__)



class SubscriptionListView(APIView):
    """
    Production-ready Subscription List View with comprehensive filtering and client support
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """
        Get subscriptions with advanced filtering, pagination, and caching
        """
        try:
            # Generate cache key
            cache_key = f"subscriptions_{request.user.id}_{request.GET.urlencode()}"
            cached_data = cache.get(cache_key)
            
            if cached_data:
                logger.info(f"Cache hit for subscriptions - User: {request.user.id}")
                return Response(cached_data)
            
            # Build optimized query
            queryset = Subscription.objects.select_related(
                'client', 'internet_plan', 'router', 'client__user'
            ).prefetch_related('usage_records').order_by('-start_date')
            
            # ✅ PRODUCTION FIX: Add client_id filter support
            client_id = request.query_params.get('client_id')
            if client_id:
                try:
                    client_id_int = int(client_id)
                    queryset = queryset.filter(client_id=client_id_int)
                except (ValueError, TypeError):
                    return Response(
                        {
                            "error": "Invalid client_id format",
                            "code": "INVALID_CLIENT_ID"
                        },
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            # Apply status filter
            status_filter = request.query_params.get('status')
            if status_filter:
                valid_statuses = ['active', 'pending', 'expired', 'cancelled', 'suspended']
                if status_filter in valid_statuses:
                    queryset = queryset.filter(status=status_filter)
                else:
                    return Response(
                        {
                            "error": f"Invalid status. Must be one of: {', '.join(valid_statuses)}",
                            "code": "INVALID_STATUS"
                        },
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            # Apply plan filter
            plan_filter = request.query_params.get('plan')
            if plan_filter:
                try:
                    plan_id = int(plan_filter)
                    queryset = queryset.filter(internet_plan_id=plan_id)
                except (ValueError, TypeError):
                    return Response(
                        {
                            "error": "Invalid plan ID format",
                            "code": "INVALID_PLAN_ID"
                        },
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            # Apply router filter
            router_filter = request.query_params.get('router')
            if router_filter:
                try:
                    router_id = int(router_filter)
                    queryset = queryset.filter(router_id=router_id)
                except (ValueError, TypeError):
                    return Response(
                        {
                            "error": "Invalid router ID format",
                            "code": "INVALID_ROUTER_ID"
                        },
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            # Apply access method filter
            access_method_filter = request.query_params.get('access_method')
            if access_method_filter:
                valid_methods = ['hotspot', 'pppoe', 'both']
                if access_method_filter in valid_methods:
                    queryset = queryset.filter(access_method=access_method_filter)
                else:
                    return Response(
                        {
                            "error": f"Invalid access method. Must be one of: {', '.join(valid_methods)}",
                            "code": "INVALID_ACCESS_METHOD"
                        },
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            # Apply date range filter
            start_date = request.query_params.get('start_date')
            end_date = request.query_params.get('end_date')
            if start_date and end_date:
                queryset = queryset.filter(
                    start_date__gte=start_date,
                    start_date__lte=end_date
                )
            
            # Apply search filter
            search_query = request.query_params.get('search')
            if search_query:
                queryset = queryset.filter(
                    Q(client__user__username__icontains=search_query) |
                    Q(client__user__phone_number__icontains=search_query) |
                    Q(internet_plan__name__icontains=search_query) |
                    Q(access_method__icontains=search_query)
                )
            
            # Enhanced pagination
            page = int(request.query_params.get('page', 1))
            page_size = min(int(request.query_params.get('page_size', 20)), 50)  # Max 50 per page
            
            paginator = Paginator(queryset, page_size)
            
            try:
                page_obj = paginator.page(page)
            except EmptyPage:
                page_obj = paginator.page(paginator.num_pages)
            
            # Serialize with performance optimization
            serializer = SubscriptionSerializer(page_obj, many=True)
            
            # Calculate subscription statistics
            stats = self._calculate_subscription_stats(queryset)
            
            response_data = {
                "subscriptions": serializer.data,
                "pagination": {
                    "current_page": page_obj.number,
                    "total_pages": paginator.num_pages,
                    "total_items": paginator.count,
                    "page_size": page_size,
                    "has_next": page_obj.has_next(),
                    "has_previous": page_obj.has_previous()
                },
                "statistics": stats
            }
            
            # Cache for 3 minutes
            cache.set(cache_key, response_data, 180)
            
            logger.info(
                f"Subscriptions fetched successfully - "
                f"User: {request.user.id}, "
                f"Count: {paginator.count}, "
                f"Client ID: {client_id or 'All'}"
            )
            
            return Response(response_data)
            
        except Exception as e:
            logger.error(
                f"Failed to fetch subscriptions - "
                f"User: {request.user.id}, "
                f"Error: {str(e)}",
                exc_info=True
            )
            return Response(
                {
                    "error": "Failed to fetch subscriptions",
                    "code": "SUBSCRIPTION_FETCH_ERROR",
                    "details": "Please try again or contact support"
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _calculate_subscription_stats(self, queryset):
        """Calculate comprehensive subscription statistics"""
        try:
            # Basic counts
            counts = queryset.aggregate(
                total=Count('id'),
                active=Count('id', filter=Q(status='active')),
                pending=Count('id', filter=Q(status='pending')),
                expired=Count('id', filter=Q(status='expired')),
                cancelled=Count('id', filter=Q(status='cancelled'))
            )
            
            # Access method breakdown
            access_method_stats = list(queryset.values('access_method').annotate(
                count=Count('id'),
                active_count=Count('id', filter=Q(status='active'))
            ).order_by('access_method'))
            
            # Plan type breakdown
            plan_stats = list(queryset.values('internet_plan__name').annotate(
                count=Count('id'),
                active_count=Count('id', filter=Q(status='active'))
            ).order_by('-count')[:10])  # Top 10 plans
            
            # Convert to structured format
            access_method_dict = {}
            for stat in access_method_stats:
                access_method_dict[stat['access_method']] = {
                    'count': stat['count'],
                    'active_count': stat['active_count'],
                    'active_rate': (stat['active_count'] / stat['count'] * 100) if stat['count'] > 0 else 0
                }
            
            plan_dict = {}
            for stat in plan_stats:
                plan_name = stat['internet_plan__name'] or 'Unknown'
                plan_dict[plan_name] = {
                    'count': stat['count'],
                    'active_count': stat['active_count']
                }
            
            return {
                "total": counts['total'],
                "active": counts['active'],
                "pending": counts['pending'],
                "expired": counts['expired'],
                "cancelled": counts['cancelled'],
                "active_rate": (counts['active'] / counts['total'] * 100) if counts['total'] > 0 else 0,
                "by_access_method": access_method_dict,
                "by_plan": plan_dict
            }
            
        except Exception as e:
            logger.error(f"Error calculating subscription statistics: {str(e)}")
            return {
                "total": 0,
                "active": 0,
                "pending": 0,
                "expired": 0,
                "cancelled": 0,
                "active_rate": 0,
                "by_access_method": {},
                "by_plan": {}
            }

class SubscriptionActivationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, subscription_id):
        subscription = get_object_or_404(
            Subscription.objects.select_related('client', 'internet_plan', 'router'),
            pk=subscription_id
        )
        
        if subscription.status != 'active':
            return Response({
                'error': 'Subscription is not active'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if subscription.activation_requested:
            return Response({
                'error': 'Activation already requested'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Request activation via service
        activation_result = subscription.request_activation()
        
        if activation_result['success']:
            return Response({
                'success': True,
                'message': 'Activation request submitted successfully',
                'activation_id': activation_result.get('activation_id')
            }, status=status.HTTP_202_ACCEPTED)
        else:
            return Response({
                'success': False,
                'error': activation_result['error']
            }, status=status.HTTP_400_BAD_REQUEST)

class SubscriptionStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, subscription_id):
        subscription = get_object_or_404(Subscription, pk=subscription_id)
        
        from internet_plans.services.activation_service import ActivationService
        
        activation_status = ActivationService.check_activation_status(subscription)
        
        return Response({
            'subscription_id': subscription.id,
            'status': subscription.status,
            'activation_status': activation_status,
            'remaining_data': subscription.get_remaining_data_display(),
            'remaining_time': subscription.get_remaining_time_display()
        })