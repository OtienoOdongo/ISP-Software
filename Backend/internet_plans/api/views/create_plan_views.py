

# from django.shortcuts import get_object_or_404
# from django.db.models import Q
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework.permissions import IsAuthenticated, AllowAny
# from rest_framework.pagination import PageNumberPagination
# from internet_plans.models.create_plan_models import InternetPlan, Subscription
# from internet_plans.serializers.create_plan_serializers import InternetPlanSerializer, SubscriptionSerializer
# from rest_framework import status

# class StandardResultsSetPagination(PageNumberPagination):
#     page_size = 20
#     page_size_query_param = 'page_size'
#     max_page_size = 100

# class InternetPlanListCreateView(APIView):
#     pagination_class = StandardResultsSetPagination
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         queryset = InternetPlan.objects.all()
#         queryset = self.apply_filters(queryset, request)
#         queryset = self.apply_sorting(queryset, request)
#         paginator = self.pagination_class()
#         page = paginator.paginate_queryset(queryset, request)
#         serializer = InternetPlanSerializer(page, many=True)
#         return paginator.get_paginated_response(serializer.data)

#     def post(self, request):
#         serializer = InternetPlanSerializer(data=request.data)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         return Response({'error': 'Validation failed', 'details': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

#     def apply_filters(self, queryset, request):
#         if category := request.query_params.get('category'):
#             queryset = queryset.filter(category=category)
#         if plan_type := request.query_params.get('planType'):
#             queryset = queryset.filter(plan_type=plan_type)
#         if (active := request.query_params.get('active')) is not None:
#             queryset = queryset.filter(active=active.lower() == 'true')
#         if search := request.query_params.get('search'):
#             queryset = queryset.filter(Q(name__icontains=search) | Q(description__icontains=search))
#         return queryset

#     def apply_sorting(self, queryset, request):
#         sort_by = request.query_params.get('sort_by', 'name')
#         sort_order = request.query_params.get('sort_order', 'asc')
#         field_mapping = {
#             'downloadSpeed': 'download_speed_value',
#             'uploadSpeed': 'upload_speed_value',
#             'expiry': 'expiry_value',
#             'dataLimit': 'data_limit_value',
#             'usageLimit': 'usage_limit_value',
#             'planType': 'plan_type',
#             'createdAt': 'created_at',
#         }
#         field = field_mapping.get(sort_by, sort_by)
#         if sort_order == 'desc':
#             field = f'-{field}'
#         return queryset.order_by(field)

# class InternetPlanDetailView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request, pk):
#         plan = get_object_or_404(InternetPlan, pk=pk)
#         serializer = InternetPlanSerializer(plan)
#         return Response(serializer.data, status=status.HTTP_200_OK)

#     def put(self, request, pk):
#         plan = get_object_or_404(InternetPlan, pk=pk)
#         serializer = InternetPlanSerializer(plan, data=request.data, partial=True)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_200_OK)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#     def delete(self, request, pk):
#         plan = get_object_or_404(InternetPlan, pk=pk)
#         plan.delete()
#         return Response(status=status.HTTP_204_NO_CONTENT)

# class PublicInternetPlanListView(APIView):
#     permission_classes = [AllowAny]

#     def get(self, request):
#         try:
#             queryset = InternetPlan.objects.filter(active=True)
#             serializer = InternetPlanSerializer(queryset, many=True)
#             return Response(serializer.data, status=status.HTTP_200_OK)
#         except Exception as e:
#             return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# class SubscriptionListView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         queryset = Subscription.objects.all().order_by('-start_date')
#         serializer = SubscriptionSerializer(queryset, many=True)
#         return Response(serializer.data, status=status.HTTP_200_OK)










# from django.shortcuts import get_object_or_404
# from django.db.models import Q, Count, Sum, F, ExpressionWrapper, DurationField
# from django.utils import timezone
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework.permissions import IsAuthenticated, AllowAny
# from rest_framework.pagination import PageNumberPagination
# from rest_framework import status
# from datetime import timedelta
# from internet_plans.models.create_plan_models import InternetPlan, Subscription
# from internet_plans.serializers.create_plan_serializers import InternetPlanSerializer, SubscriptionSerializer
# from network_management.models.router_management_model import Router


# class StandardResultsSetPagination(PageNumberPagination):
#     page_size = 20
#     page_size_query_param = 'page_size'
#     max_page_size = 100


# class InternetPlanListCreateView(APIView):
#     pagination_class = StandardResultsSetPagination
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         queryset = InternetPlan.objects.all().prefetch_related('allowed_routers')
#         queryset = self.apply_filters(queryset, request)
#         queryset = self.apply_sorting(queryset, request)
#         paginator = self.pagination_class()
#         page = paginator.paginate_queryset(queryset, request)
#         serializer = InternetPlanSerializer(page, many=True)
#         return paginator.get_paginated_response(serializer.data)

#     def post(self, request):
#         serializer = InternetPlanSerializer(data=request.data)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         return Response({'error': 'Validation failed', 'details': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

#     def apply_filters(self, queryset, request):
#         if category := request.query_params.get('category'):
#             queryset = queryset.filter(category=category)
#         if plan_type := request.query_params.get('planType'):
#             queryset = queryset.filter(plan_type=plan_type)
#         if (active := request.query_params.get('active')) is not None:
#             queryset = queryset.filter(active=active.lower() == 'true')
#         if search := request.query_params.get('search'):
#             queryset = queryset.filter(Q(name__icontains=search) | Q(description__icontains=search))
#         return queryset

#     def apply_sorting(self, queryset, request):
#         sort_by = request.query_params.get('sort_by', 'name')
#         sort_order = request.query_params.get('sort_order', 'asc')
#         field_mapping = {
#             'downloadSpeed': 'download_speed_value',
#             'uploadSpeed': 'upload_speed_value',
#             'expiry': 'expiry_value',
#             'dataLimit': 'data_limit_value',
#             'usageLimit': 'usage_limit_value',
#             'planType': 'plan_type',
#             'createdAt': 'created_at',
#             'bandwidth': 'bandwidth_limit',
#             'priority': 'priority_level',
#         }
#         field = field_mapping.get(sort_by, sort_by)
#         if sort_order == 'desc':
#             field = f'-{field}'
#         return queryset.order_by(field)


# class InternetPlanDetailView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request, pk):
#         plan = get_object_or_404(InternetPlan.objects.prefetch_related('allowed_routers'), pk=pk)
#         serializer = InternetPlanSerializer(plan)
#         return Response(serializer.data, status=status.HTTP_200_OK)

#     def put(self, request, pk):
#         plan = get_object_or_404(InternetPlan, pk=pk)
#         serializer = InternetPlanSerializer(plan, data=request.data, partial=True)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_200_OK)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#     def delete(self, request, pk):
#         plan = get_object_or_404(InternetPlan, pk=pk)
#         plan.delete()
#         return Response(status=status.HTTP_204_NO_CONTENT)


# class PublicInternetPlanListView(APIView):
#     permission_classes = [AllowAny]

#     def get(self, request):
#         try:
#             queryset = InternetPlan.objects.filter(active=True).prefetch_related('allowed_routers')
#             serializer = InternetPlanSerializer(queryset, many=True)
#             return Response(serializer.data, status=status.HTTP_200_OK)
#         except Exception as e:
#             return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# class SubscriptionListView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         queryset = Subscription.objects.select_related(
#             'client', 'internet_plan', 'router', 'transaction'
#         ).order_by('-start_date')
        
#         # Apply filters
#         status_filter = request.query_params.get('status')
#         if status_filter:
#             queryset = queryset.filter(status=status_filter)
            
#         plan_filter = request.query_params.get('plan')
#         if plan_filter:
#             queryset = queryset.filter(internet_plan_id=plan_filter)
            
#         router_filter = request.query_params.get('router')
#         if router_filter:
#             queryset = queryset.filter(router_id=router_filter)
            
#         serializer = SubscriptionSerializer(queryset, many=True)
#         return Response(serializer.data, status=status.HTTP_200_OK)


# class PlanAnalyticsView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         # Get plan usage statistics
#         plans = InternetPlan.objects.annotate(
#             active_subscriptions=Count('subscriptions', filter=Q(subscriptions__status='active')),
#             total_subscriptions=Count('subscriptions'),
#             total_revenue=Sum('subscriptions__transaction__amount', filter=Q(subscriptions__transaction__status='completed'))
#         )
        
#         # Get recent subscriptions
#         recent_subscriptions = Subscription.objects.select_related(
#             'internet_plan', 'client'
#         ).order_by('-start_date')[:10]
        
#         # Get subscription status counts
#         status_counts = Subscription.objects.values('status').annotate(count=Count('id'))
        
#         data = {
#             'plans': [
#                 {
#                     'id': plan.id,
#                     'name': plan.name,
#                     'active_subscriptions': plan.active_subscriptions,
#                     'total_subscriptions': plan.total_subscriptions,
#                     'total_revenue': plan.total_revenue or 0
#                 }
#                 for plan in plans
#             ],
#             'recent_subscriptions': SubscriptionSerializer(recent_subscriptions, many=True).data,
#             'status_counts': {item['status']: item['count'] for item in status_counts},
#             'total_subscriptions': Subscription.objects.count(),
#             'active_subscriptions': Subscription.objects.filter(status='active').count(),
#             'total_revenue': Subscription.objects.filter(
#                 transaction__status='completed'
#             ).aggregate(total=Sum('transaction__amount'))['total'] or 0
#         }
        
#         return Response(data, status=status.HTTP_200_OK)


# class RouterCompatibilityView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request, plan_id):
#         plan = get_object_or_404(InternetPlan, pk=plan_id)
        
#         if plan.router_specific:
#             # Return only allowed routers
#             routers = plan.allowed_routers.all()
#         else:
#             # Return all active routers
#             routers = Router.objects.filter(status='connected', is_active=True)
        
#         serializer = RouterSerializer(routers, many=True)
#         return Response(serializer.data, status=status.HTTP_200_OK)








from django.shortcuts import get_object_or_404
from django.db.models import Q, Count, Sum
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.pagination import PageNumberPagination
from rest_framework import status
from internet_plans.models.create_plan_models import InternetPlan, Subscription
from internet_plans.serializers.create_plan_serializers import InternetPlanSerializer, SubscriptionSerializer
from network_management.models.router_management_model import Router
from network_management.serializers.router_management_serializer import RouterSerializer

# Placeholder for logging
# import logging
# logger = logging.getLogger(__name__)


class StandardResultsSetPagination(PageNumberPagination):
    """Custom pagination with configurable page size."""
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class InternetPlanListCreateView(APIView):
    """
    Handles listing and creating InternetPlan instances.
    Supports filtering, sorting, and pagination.
    """
    pagination_class = StandardResultsSetPagination
    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = InternetPlan.objects.all().prefetch_related('allowed_routers')
        queryset = self.apply_filters(queryset, request)
        queryset = self.apply_sorting(queryset, request)
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(queryset, request)
        serializer = InternetPlanSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)

    def post(self, request):
        serializer = InternetPlanSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            # logger.info(f"Created new plan: {serializer.data['name']}")
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        # logger.error(f"Failed to create plan: {serializer.errors}")
        return Response({'error': 'Validation failed', 'details': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    def apply_filters(self, queryset, request):
        """Apply query param filters to queryset."""
        if category := request.query_params.get('category'):
            queryset = queryset.filter(category=category)
        if plan_type := request.query_params.get('planType'):
            queryset = queryset.filter(plan_type=plan_type)
        if (active := request.query_params.get('active')) is not None:
            queryset = queryset.filter(active=active.lower() == 'true')
        if search := request.query_params.get('search'):
            queryset = queryset.filter(Q(name__icontains=search) | Q(description__icontains=search))
        return queryset

    def apply_sorting(self, queryset, request):
        """Apply sorting based on query params."""
        sort_by = request.query_params.get('sort_by', 'name')
        sort_order = request.query_params.get('sort_order', 'asc')
        field_mapping = {
            'downloadSpeed': 'download_speed_value',
            'uploadSpeed': 'upload_speed_value',
            'expiry': 'expiry_value',
            'dataLimit': 'data_limit_value',
            'usageLimit': 'usage_limit_value',
            'planType': 'plan_type',
            'createdAt': 'created_at',
            'bandwidth': 'bandwidth_limit',
            'priority': 'priority_level',
        }
        field = field_mapping.get(sort_by, sort_by)
        if sort_order == 'desc':
            field = f'-{field}'
        return queryset.order_by(field)


class InternetPlanDetailView(APIView):
    """Handles CRUD for individual InternetPlan instances."""
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        plan = get_object_or_404(InternetPlan.objects.prefetch_related('allowed_routers'), pk=pk)
        serializer = InternetPlanSerializer(plan)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, pk):
        plan = get_object_or_404(InternetPlan, pk=pk)
        serializer = InternetPlanSerializer(plan, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            # logger.info(f"Updated plan: {plan.name}")
            return Response(serializer.data, status=status.HTTP_200_OK)
        # logger.error(f"Failed to update plan {pk}: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        plan = get_object_or_404(InternetPlan, pk=pk)
        plan_name = plan.name
        plan.delete()
        # logger.info(f"Deleted plan: {plan_name}")
        return Response(status=status.HTTP_204_NO_CONTENT)


class PublicInternetPlanListView(APIView):
    """Public endpoint for listing active plans (no auth required)."""
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            queryset = InternetPlan.objects.filter(active=True).prefetch_related('allowed_routers')
            serializer = InternetPlanSerializer(queryset, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            # logger.error(f"Error in public plan list: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SubscriptionListView(APIView):
    """Lists subscriptions with filtering by status, plan, or router."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = Subscription.objects.select_related(
            'client', 'internet_plan', 'router', 'transaction'
        ).order_by('-start_date')
        
        # Apply filters
        status_filter = request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
            
        plan_filter = request.query_params.get('plan')
        if plan_filter:
            queryset = queryset.filter(internet_plan_id=plan_filter)
            
        router_filter = request.query_params.get('router')
        if router_filter:
            queryset = queryset.filter(router_id=router_filter)
            
        serializer = SubscriptionSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class SubscriptionAnalyticsView(APIView):
    """Provides aggregated analytics for plans and subscriptions."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Get plan usage statistics
        plans = InternetPlan.objects.annotate(
            active_subscriptions=Count('subscriptions', filter=Q(subscriptions__status='active')),
            total_subscriptions=Count('subscriptions'),
            total_revenue=Sum('subscriptions__transaction__amount', filter=Q(subscriptions__transaction__status='completed'))
        )
        
        # Get recent subscriptions
        recent_subscriptions = Subscription.objects.select_related(
            'internet_plan', 'client'
        ).order_by('-start_date')[:10]
        
        # Get subscription status counts
        status_counts = Subscription.objects.values('status').annotate(count=Count('id'))
        
        data = {
            'plans': [
                {
                    'id': plan.id,
                    'name': plan.name,
                    'active_subscriptions': plan.active_subscriptions,
                    'total_subscriptions': plan.total_subscriptions,
                    'total_revenue': plan.total_revenue or 0
                }
                for plan in plans
            ],
            'recent_subscriptions': SubscriptionSerializer(recent_subscriptions, many=True).data,
            'status_counts': {item['status']: item['count'] for item in status_counts},
            'total_subscriptions': Subscription.objects.count(),
            'active_subscriptions': Subscription.objects.filter(status='active').count(),
            'total_revenue': Subscription.objects.filter(
                transaction__status='completed'
            ).aggregate(total=Sum('transaction__amount'))['total'] or 0
        }
        
        # logger.info("Plan analytics retrieved successfully")
        return Response(data, status=status.HTTP_200_OK)


class RouterCompatibilityView(APIView):
    """Lists compatible routers for a given plan."""
    permission_classes = [IsAuthenticated]

    def get(self, request, plan_id):
        plan = get_object_or_404(InternetPlan, pk=plan_id)
        
        if plan.router_specific:
            # Return only allowed routers
            routers = plan.allowed_routers.filter(status='connected', is_active=True)
        else:
            # Return all active routers
            routers = Router.objects.filter(status='connected', is_active=True)
        
        serializer = RouterSerializer(routers, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ActivatePlanOnRouterView(APIView):
    """Activates a plan on a specific router (placeholder for router API integration)."""
    permission_classes = [IsAuthenticated]

    def post(self, request, plan_id, router_id):
        plan = get_object_or_404(InternetPlan, pk=plan_id)
        router = get_object_or_404(Router, pk=router_id)
        
        # Check if plan can be used on this router
        if not plan.can_be_used_on_router(router_id):
            # logger.warning(f"Plan {plan.name} incompatible with router {router.name}")
            return Response(
                {'error': f'Plan "{plan.name}" cannot be used on router "{router.name}"'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if router is connected
        if router.status != 'connected':
            # logger.warning(f"Router {router.name} not connected")
            return Response(
                {'error': f'Router "{router.name}" is not connected'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Here you would typically configure the router with the plan settings
        # This would involve calling your router management API
        
        response_data = {
            'success': True,
            'message': f'Plan "{plan.name}" activated on router "{router.name}"',
            'bandwidth_limit': plan.get_bandwidth_limit_for_router(),
            'priority_level': plan.priority_level
        }
        # logger.info(f"Activated plan {plan.name} on router {router.name}")
        return Response(response_data, status=status.HTTP_200_OK)