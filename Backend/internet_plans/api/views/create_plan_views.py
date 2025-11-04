# from django.shortcuts import get_object_or_404
# from django.db.models import Q, Count, Sum, F
# from django.utils import timezone
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework.permissions import IsAuthenticated, AllowAny
# from rest_framework.pagination import PageNumberPagination
# from rest_framework import status
# from internet_plans.models.create_plan_models import InternetPlan, Subscription, PlanTemplate
# from internet_plans.serializers.create_plan_serializers import (
#     InternetPlanSerializer, 
#     SubscriptionSerializer, 
#     PlanTemplateSerializer
# )
# from network_management.models.router_management_model import Router
# from network_management.serializers.router_management_serializer import RouterSerializer


# class StandardResultsSetPagination(PageNumberPagination):
#     """Custom pagination with configurable page size."""
#     page_size = 20
#     page_size_query_param = 'page_size'
#     max_page_size = 100


# class PlanTemplateListCreateView(APIView):
#     """
#     Enhanced template management with filtering and analytics support.
#     """
#     pagination_class = StandardResultsSetPagination
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         # Get public templates and templates created by current user
#         queryset = PlanTemplate.objects.filter(
#             Q(is_public=True) | Q(created_by=request.user)
#         ).filter(is_active=True)
        
#         queryset = self.apply_filters(queryset, request)
#         queryset = self.apply_sorting(queryset, request)
        
#         paginator = self.pagination_class()
#         page = paginator.paginate_queryset(queryset, request)
#         serializer = PlanTemplateSerializer(page, many=True, context={'request': request})
#         return paginator.get_paginated_response(serializer.data)

#     def post(self, request):
#         serializer = PlanTemplateSerializer(
#             data=request.data, 
#             context={'request': request}
#         )
#         if serializer.is_valid():
#             template = serializer.save()
#             return Response(
#                 PlanTemplateSerializer(template, context={'request': request}).data, 
#                 status=status.HTTP_201_CREATED
#             )
#         return Response(
#             {'error': 'Validation failed', 'details': serializer.errors}, 
#             status=status.HTTP_400_BAD_REQUEST
#         )

#     def apply_filters(self, queryset, request):
#         """Apply comprehensive filters to template queryset."""
#         # Category filter
#         if category := request.query_params.get('category'):
#             queryset = queryset.filter(category=category)
        
#         # Search filter
#         if search := request.query_params.get('search'):
#             queryset = queryset.filter(
#                 Q(name__icontains=search) | Q(description__icontains=search)
#             )
        
#         # Access type filter
#         if access_type := request.query_params.get('access_type'):
#             if access_type == 'hotspot':
#                 queryset = queryset.filter(access_methods__hotspot__enabled=True)
#             elif access_type == 'pppoe':
#                 queryset = queryset.filter(access_methods__pppoe__enabled=True)
        
#         # Visibility filter
#         if visibility := request.query_params.get('visibility'):
#             if visibility == 'public':
#                 queryset = queryset.filter(is_public=True)
#             elif visibility == 'private':
#                 queryset = queryset.filter(is_public=False)
        
#         return queryset

#     def apply_sorting(self, queryset, request):
#         """Apply sorting based on query params."""
#         sort_by = request.query_params.get('sort_by', 'name')
#         sort_order = request.query_params.get('sort_order', 'asc')
        
#         field_mapping = {
#             'usageCount': 'usage_count',
#             'createdAt': 'created_at',
#             'basePrice': 'base_price',
#             'name': 'name',
#         }
        
#         field = field_mapping.get(sort_by, sort_by)
#         if sort_order == 'desc':
#             field = f'-{field}'
#         return queryset.order_by(field)


# class PlanTemplateDetailView(APIView):
#     """Enhanced template CRUD operations."""
#     permission_classes = [IsAuthenticated]

#     def get(self, request, pk):
#         template = get_object_or_404(
#             PlanTemplate.objects.filter(
#                 Q(is_public=True) | Q(created_by=request.user)
#             ),
#             pk=pk,
#             is_active=True
#         )
#         serializer = PlanTemplateSerializer(template, context={'request': request})
#         return Response(serializer.data, status=status.HTTP_200_OK)

#     def put(self, request, pk):
#         template = get_object_or_404(
#             PlanTemplate.objects.filter(created_by=request.user),
#             pk=pk
#         )
#         serializer = PlanTemplateSerializer(
#             template, 
#             data=request.data, 
#             partial=True,
#             context={'request': request}
#         )
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_200_OK)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#     def delete(self, request, pk):
#         template = get_object_or_404(
#             PlanTemplate.objects.filter(created_by=request.user),
#             pk=pk
#         )
#         template.is_active = False
#         template.save()
#         return Response(status=status.HTTP_204_NO_CONTENT)


# class PublicPlanTemplateListView(APIView):
#     """
#     Public endpoint for listing active plan templates (no auth required).
#     """
#     permission_classes = [AllowAny]

#     def get(self, request):
#         try:
#             queryset = PlanTemplate.objects.filter(
#                 is_public=True, 
#                 is_active=True
#             ).order_by('name')
            
#             # Apply basic filters for public access
#             if category := request.query_params.get('category'):
#                 queryset = queryset.filter(category=category)
            
#             if access_type := request.query_params.get('access_type'):
#                 if access_type == 'hotspot':
#                     queryset = queryset.filter(access_methods__hotspot__enabled=True)
#                 elif access_type == 'pppoe':
#                     queryset = queryset.filter(access_methods__pppoe__enabled=True)
            
#             serializer = PlanTemplateSerializer(queryset, many=True)
#             return Response(serializer.data, status=status.HTTP_200_OK)
#         except Exception as e:
#             return Response(
#                 {'error': 'Failed to load templates', 'details': str(e)}, 
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )


# class CreatePlanFromTemplateView(APIView):
#     """
#     Enhanced plan creation from template with additional customization.
#     """
#     permission_classes = [IsAuthenticated]

#     def post(self, request, template_id):
#         template = get_object_or_404(
#             PlanTemplate.objects.filter(
#                 Q(is_public=True) | Q(created_by=request.user)
#             ),
#             pk=template_id,
#             is_active=True
#         )
        
#         # Create plan data from template
#         plan_data = {
#             'name': request.data.get('name', template.name),
#             'category': template.category,
#             'price': template.base_price,
#             'access_methods': template.access_methods,
#             'template_id': template.id,
#             'plan_type': 'Paid' if template.base_price > 0 else 'Free Trial',
#             'description': template.description,
#             'active': True,
#         }
        
#         # Merge with any additional data from request (allows customization)
#         if request.data:
#             # Don't allow overriding template_id and ensure proper field mapping
#             override_fields = ['name', 'price', 'description', 'active', 'category']
#             for field in override_fields:
#                 if field in request.data:
#                     plan_data[field] = request.data[field]
            
#             # Handle access methods customization
#             if 'accessMethods' in request.data:
#                 plan_data['access_methods'] = request.data['accessMethods']
        
#         serializer = InternetPlanSerializer(data=plan_data)
#         if serializer.is_valid():
#             plan = serializer.save()
#             return Response(
#                 InternetPlanSerializer(plan).data, 
#                 status=status.HTTP_201_CREATED
#             )
        
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# class InternetPlanListCreateView(APIView):
#     """
#     Enhanced plan management with comprehensive filtering and analytics support.
#     """
#     pagination_class = StandardResultsSetPagination
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         queryset = InternetPlan.objects.all().prefetch_related('allowed_routers', 'template')
#         queryset = self.apply_filters(queryset, request)
#         queryset = self.apply_sorting(queryset, request)
        
#         paginator = self.pagination_class()
#         page = paginator.paginate_queryset(queryset, request)
#         serializer = InternetPlanSerializer(page, many=True)
#         return paginator.get_paginated_response(serializer.data)

#     def post(self, request):
#         serializer = InternetPlanSerializer(data=request.data)
#         if serializer.is_valid():
#             plan = serializer.save()
#             return Response(
#                 InternetPlanSerializer(plan).data, 
#                 status=status.HTTP_201_CREATED
#             )
#         return Response(
#             {'error': 'Validation failed', 'details': serializer.errors}, 
#             status=status.HTTP_400_BAD_REQUEST
#         )

#     def apply_filters(self, queryset, request):
#         """Apply comprehensive filters to plan queryset."""
#         # Basic filters
#         if category := request.query_params.get('category'):
#             queryset = queryset.filter(category=category)
        
#         if plan_type := request.query_params.get('planType'):
#             queryset = queryset.filter(plan_type=plan_type)
        
#         if (active := request.query_params.get('active')) is not None:
#             queryset = queryset.filter(active=active.lower() == 'true')
        
#         # Search filter
#         if search := request.query_params.get('search'):
#             queryset = queryset.filter(
#                 Q(name__icontains=search) | Q(description__icontains=search)
#             )
        
#         # Access type filter
#         if access_type := request.query_params.get('access_type'):
#             if access_type == 'hotspot':
#                 queryset = queryset.filter(access_methods__hotspot__enabled=True)
#             elif access_type == 'pppoe':
#                 queryset = queryset.filter(access_methods__pppoe__enabled=True)
        
#         # Template filter
#         if template_id := request.query_params.get('template_id'):
#             queryset = queryset.filter(template_id=template_id)
        
#         return queryset

#     def apply_sorting(self, queryset, request):
#         """Apply sorting based on query params."""
#         sort_by = request.query_params.get('sort_by', 'name')
#         sort_order = request.query_params.get('sort_order', 'asc')
        
#         field_mapping = {
#             'planType': 'plan_type',
#             'createdAt': 'created_at',
#             'price': 'price',
#             'purchases': 'purchases',
#             'name': 'name',
#         }
        
#         field = field_mapping.get(sort_by, sort_by)
#         if sort_order == 'desc':
#             field = f'-{field}'
#         return queryset.order_by(field)


# class InternetPlanDetailView(APIView):
#     """Enhanced plan CRUD operations."""
#     permission_classes = [IsAuthenticated]

#     def get(self, request, pk):
#         plan = get_object_or_404(
#             InternetPlan.objects.prefetch_related('allowed_routers', 'template'), 
#             pk=pk
#         )
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
#     """
#     Enhanced public endpoint for listing active plans with access method filtering.
#     """
#     permission_classes = [AllowAny]

#     def get(self, request):
#         try:
#             # Only return plans that are active and have at least one enabled access method
#             queryset = InternetPlan.objects.filter(active=True)
            
#             # Apply access type filter for public API
#             if access_type := request.query_params.get('access_type'):
#                 if access_type == 'hotspot':
#                     queryset = queryset.filter(access_methods__hotspot__enabled=True)
#                 elif access_type == 'pppoe':
#                     queryset = queryset.filter(access_methods__pppoe__enabled=True)
            
#             # Apply category filter
#             if category := request.query_params.get('category'):
#                 queryset = queryset.filter(category=category)
            
#             # Filter plans with enabled access methods (database-level filtering)
#             # This uses database JSON field queries for better performance
#             queryset = queryset.filter(
#                 Q(access_methods__hotspot__enabled=True) | 
#                 Q(access_methods__pppoe__enabled=True)
#             )
            
#             serializer = InternetPlanSerializer(queryset, many=True)
#             return Response(serializer.data, status=status.HTTP_200_OK)
#         except Exception as e:
#             return Response(
#                 {'error': 'Failed to load plans', 'details': str(e)}, 
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )


# class SubscriptionListView(APIView):
#     """Enhanced subscription listing with comprehensive filtering."""
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         queryset = Subscription.objects.select_related(
#             'client', 'internet_plan', 'router', 'transaction'
#         ).order_by('-start_date')
        
#         # Apply comprehensive filters
#         status_filter = request.query_params.get('status')
#         if status_filter:
#             queryset = queryset.filter(status=status_filter)
            
#         plan_filter = request.query_params.get('plan')
#         if plan_filter:
#             queryset = queryset.filter(internet_plan_id=plan_filter)
            
#         router_filter = request.query_params.get('router')
#         if router_filter:
#             queryset = queryset.filter(router_id=router_filter)
            
#         access_method_filter = request.query_params.get('access_method')
#         if access_method_filter:
#             queryset = queryset.filter(access_method=access_method_filter)
            
#         # Date range filtering
#         start_date = request.query_params.get('start_date')
#         end_date = request.query_params.get('end_date')
#         if start_date and end_date:
#             queryset = queryset.filter(
#                 start_date__gte=start_date,
#                 start_date__lte=end_date
#             )
            
#         serializer = SubscriptionSerializer(queryset, many=True)
#         return Response(serializer.data, status=status.HTTP_200_OK)


# class PlanAnalyticsView(APIView):
#     """
#     Comprehensive analytics for plans, templates, and subscriptions.
#     Enhanced to support dual access methods and template analytics.
#     """
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         # Get time range from query params
#         time_range = request.query_params.get('time_range', '30d')
#         access_type = request.query_params.get('access_type')  # hotspot or pppoe
        
#         # Calculate date range
#         end_date = timezone.now()
#         if time_range == '7d':
#             start_date = end_date - timezone.timedelta(days=7)
#         elif time_range == '90d':
#             start_date = end_date - timezone.timedelta(days=90)
#         elif time_range == '1y':
#             start_date = end_date - timezone.timedelta(days=365)
#         else:  # 30d default
#             start_date = end_date - timezone.timedelta(days=30)

#         # Base querysets with date filtering
#         recent_subscriptions = Subscription.objects.filter(
#             start_date__gte=start_date
#         )
        
#         if access_type:
#             recent_subscriptions = recent_subscriptions.filter(access_method=access_type)

#         # Get plan usage statistics with access method filtering
#         plans = InternetPlan.objects.annotate(
#             active_subscriptions=Count(
#                 'subscriptions', 
#                 filter=Q(subscriptions__status='active') & 
#                        Q(subscriptions__start_date__gte=start_date)
#             ),
#             total_subscriptions=Count(
#                 'subscriptions',
#                 filter=Q(subscriptions__start_date__gte=start_date)
#             ),
#             total_revenue=Sum(
#                 'subscriptions__transaction__amount', 
#                 filter=Q(subscriptions__transaction__status='completed') &
#                        Q(subscriptions__start_date__gte=start_date)
#             )
#         )
        
#         # Apply access type filter to plans
#         if access_type:
#             if access_type == 'hotspot':
#                 plans = plans.filter(access_methods__hotspot__enabled=True)
#             elif access_type == 'pppoe':
#                 plans = plans.filter(access_methods__pppoe__enabled=True)

#         # Get template usage statistics
#         templates = PlanTemplate.objects.annotate(
#             plans_created=Count('created_plans'),
#             recent_usage=Count('created_plans', filter=Q(created_plans__created_at__gte=start_date))
#         )

#         # Get subscription status counts
#         status_counts = recent_subscriptions.values('status').annotate(count=Count('id'))
        
#         # Get access method distribution
#         access_method_counts = recent_subscriptions.values('access_method').annotate(count=Count('id'))
        
#         # Calculate category performance
#         category_stats = {}
#         for plan in plans:
#             category = plan.category
#             if category not in category_stats:
#                 category_stats[category] = {
#                     'plans': 0,
#                     'total_subscriptions': 0,
#                     'active_subscriptions': 0,
#                     'total_revenue': 0,
#                     'access_methods': set()
#                 }
            
#             category_stats[category]['plans'] += 1
#             category_stats[category]['total_subscriptions'] += plan.total_subscriptions
#             category_stats[category]['active_subscriptions'] += plan.active_subscriptions
#             category_stats[category]['total_revenue'] += (plan.total_revenue or 0)
            
#             # Track access methods in this category
#             enabled_methods = plan.get_enabled_access_methods()
#             category_stats[category]['access_methods'].update(enabled_methods)

#         # Convert sets to lists for JSON serialization
#         for category in category_stats:
#             category_stats[category]['access_methods'] = list(category_stats[category]['access_methods'])

#         # Top performing plans (by subscriptions)
#         top_plans = plans.order_by('-total_subscriptions')[:10]

#         # Popular templates
#         popular_templates = templates.order_by('-usage_count')[:5]

#         data = {
#             'time_range': time_range,
#             'access_type': access_type,
#             'date_range': {
#                 'start_date': start_date,
#                 'end_date': end_date
#             },
#             'plans': [
#                 {
#                     'id': plan.id,
#                     'name': plan.name,
#                     'category': plan.category,
#                     'access_type': plan.get_access_type(),
#                     'active_subscriptions': plan.active_subscriptions,
#                     'total_subscriptions': plan.total_subscriptions,
#                     'total_revenue': plan.total_revenue or 0,
#                     'enabled_access_methods': plan.get_enabled_access_methods(),
#                     'template': plan.template.name if plan.template else None
#                 }
#                 for plan in top_plans
#             ],
#             'templates': [
#                 {
#                     'id': template.id,
#                     'name': template.name,
#                     'category': template.category,
#                     'access_type': template.get_access_type(),
#                     'usage_count': template.usage_count,
#                     'plans_created': template.plans_created,
#                     'recent_usage': template.recent_usage,
#                     'is_public': template.is_public
#                 }
#                 for template in templates
#             ],
#             'recent_subscriptions': SubscriptionSerializer(
#                 recent_subscriptions.select_related('internet_plan', 'client')[:10], 
#                 many=True
#             ).data,
#             'status_counts': {item['status']: item['count'] for item in status_counts},
#             'access_method_counts': {item['access_method']: item['count'] for item in access_method_counts},
#             'category_stats': category_stats,
#             'total_subscriptions': recent_subscriptions.count(),
#             'active_subscriptions': recent_subscriptions.filter(status='active').count(),
#             'total_revenue': recent_subscriptions.filter(
#                 transaction__status='completed'
#             ).aggregate(total=Sum('transaction__amount'))['total'] or 0,
#             'total_templates': templates.count(),
#             'popular_templates': PlanTemplateSerializer(popular_templates, many=True).data
#         }
        
#         return Response(data, status=status.HTTP_200_OK)


# class PlanAccessTypeAnalyticsView(APIView):
#     """
#     Specialized analytics for access type comparison.
#     """
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         # Get analytics for both access types
#         hotspot_analytics = self.get_access_type_analytics('hotspot')
#         pppoe_analytics = self.get_access_type_analytics('pppoe')
        
#         data = {
#             'hotspot': hotspot_analytics,
#             'pppoe': pppoe_analytics,
#             'comparison': {
#                 'total_plans': {
#                     'hotspot': hotspot_analytics['total_plans'],
#                     'pppoe': pppoe_analytics['total_plans']
#                 },
#                 'total_subscriptions': {
#                     'hotspot': hotspot_analytics['total_subscriptions'],
#                     'pppoe': pppoe_analytics['total_subscriptions']
#                 },
#                 'total_revenue': {
#                     'hotspot': hotspot_analytics['total_revenue'],
#                     'pppoe': pppoe_analytics['total_revenue']
#                 }
#             }
#         }
        
#         return Response(data, status=status.HTTP_200_OK)
    
#     def get_access_type_analytics(self, access_type):
#         """Get analytics for specific access type."""
#         # Fixed the problematic line - use explicit conditions instead of f-strings
#         if access_type == 'hotspot':
#             plans = InternetPlan.objects.filter(access_methods__hotspot__enabled=True)
#         elif access_type == 'pppoe':
#             plans = InternetPlan.objects.filter(access_methods__pppoe__enabled=True)
#         else:
#             plans = InternetPlan.objects.none()
        
#         # Subscriptions using this access type
#         subscriptions = Subscription.objects.filter(access_method=access_type)
        
#         return {
#             'total_plans': plans.count(),
#             'active_plans': plans.filter(active=True).count(),
#             'total_subscriptions': subscriptions.count(),
#             'active_subscriptions': subscriptions.filter(status='active').count(),
#             'total_revenue': subscriptions.filter(
#                 transaction__status='completed'
#             ).aggregate(total=Sum('transaction__amount'))['total'] or 0,
#             'category_distribution': list(plans.values('category').annotate(count=Count('id'))),
#             'popular_plans': list(plans.order_by('-purchases')[:5].values('id', 'name', 'purchases'))
#         }


# class RouterCompatibilityView(APIView):
#     """Enhanced router compatibility checking."""
#     permission_classes = [IsAuthenticated]

#     def get(self, request, plan_id):
#         plan = get_object_or_404(InternetPlan, pk=plan_id)
        
#         if plan.router_specific:
#             # Return only allowed routers
#             routers = plan.allowed_routers.filter(status='connected', is_active=True)
#         else:
#             # Return all active routers
#             routers = Router.objects.filter(status='connected', is_active=True)
        
#         serializer = RouterSerializer(routers, many=True)
#         return Response(serializer.data, status=status.HTTP_200_OK)


# class ActivatePlanOnRouterView(APIView):
#     """Enhanced plan activation with access method support."""
#     permission_classes = [IsAuthenticated]

#     def post(self, request, plan_id, router_id):
#         plan = get_object_or_404(InternetPlan, pk=plan_id)
#         router = get_object_or_404(Router, pk=router_id)
        
#         # Check if plan can be used on this router
#         if not plan.can_be_used_on_router(router_id):
#             return Response(
#                 {'error': f'Plan "{plan.name}" cannot be used on router "{router.name}"'},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
        
#         # Check if router is connected
#         if router.status != 'connected':
#             return Response(
#                 {'error': f'Router "{router.name}" is not connected'},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
        
#         # Check if plan has enabled access methods
#         if not plan.has_enabled_access_methods():
#             return Response(
#                 {'error': f'Plan "{plan.name}" has no enabled access methods'},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
        
#         # Get the enabled access methods for configuration
#         enabled_methods = plan.get_enabled_access_methods()
        
#         response_data = {
#             'success': True,
#             'message': f'Plan "{plan.name}" activated on router "{router.name}"',
#             'enabled_access_methods': enabled_methods,
#             'router_configuration': {
#                 method: plan.access_methods.get(method, {})
#                 for method in enabled_methods
#             }
#         }
        
#         return Response(response_data, status=status.HTTP_200_OK)












# from django.shortcuts import get_object_or_404
# from django.db.models import Q, Count, Sum, F
# from django.utils import timezone
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework.permissions import IsAuthenticated, AllowAny
# from rest_framework.pagination import PageNumberPagination
# from rest_framework import status
# from internet_plans.models.create_plan_models import InternetPlan, Subscription, PlanTemplate
# from internet_plans.serializers.create_plan_serializers import (
#     InternetPlanSerializer, 
#     SubscriptionSerializer, 
#     PlanTemplateSerializer
# )
# from network_management.models.router_management_model import Router
# from network_management.serializers.router_management_serializer import RouterSerializer


# class StandardResultsSetPagination(PageNumberPagination):
#     """Custom pagination with configurable page size."""
#     page_size = 20
#     page_size_query_param = 'page_size'
#     max_page_size = 100


# class PlanTemplateListCreateView(APIView):
#     """
#     Enhanced template management with filtering and analytics support.
#     """
#     pagination_class = StandardResultsSetPagination
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         # Get public templates and templates created by current user
#         queryset = PlanTemplate.objects.filter(
#             Q(is_public=True) | Q(created_by=request.user)
#         ).filter(is_active=True)
        
#         queryset = self.apply_filters(queryset, request)
#         queryset = self.apply_sorting(queryset, request)
        
#         paginator = self.pagination_class()
#         page = paginator.paginate_queryset(queryset, request)
#         serializer = PlanTemplateSerializer(page, many=True, context={'request': request})
#         return paginator.get_paginated_response(serializer.data)

#     def post(self, request):
#         serializer = PlanTemplateSerializer(
#             data=request.data, 
#             context={'request': request}
#         )
#         if serializer.is_valid():
#             template = serializer.save()
#             return Response(
#                 PlanTemplateSerializer(template, context={'request': request}).data, 
#                 status=status.HTTP_201_CREATED
#             )
#         return Response(
#             {'error': 'Validation failed', 'details': serializer.errors}, 
#             status=status.HTTP_400_BAD_REQUEST
#         )

#     def apply_filters(self, queryset, request):
#         """Apply comprehensive filters to template queryset."""
#         # Category filter
#         if category := request.query_params.get('category'):
#             queryset = queryset.filter(category=category)
        
#         # Search filter
#         if search := request.query_params.get('search'):
#             queryset = queryset.filter(
#                 Q(name__icontains=search) | Q(description__icontains=search)
#             )
        
#         # Access type filter
#         if access_type := request.query_params.get('access_type'):
#             if access_type == 'hotspot':
#                 queryset = queryset.filter(access_methods__hotspot__enabled=True)
#             elif access_type == 'pppoe':
#                 queryset = queryset.filter(access_methods__pppoe__enabled=True)
        
#         # Visibility filter
#         if visibility := request.query_params.get('visibility'):
#             if visibility == 'public':
#                 queryset = queryset.filter(is_public=True)
#             elif visibility == 'private':
#                 queryset = queryset.filter(is_public=False)
        
#         return queryset

#     def apply_sorting(self, queryset, request):
#         """Apply sorting based on query params."""
#         sort_by = request.query_params.get('sort_by', 'name')
#         sort_order = request.query_params.get('sort_order', 'asc')
        
#         field_mapping = {
#             'usageCount': 'usage_count',
#             'createdAt': 'created_at',
#             'basePrice': 'base_price',
#             'name': 'name',
#         }
        
#         field = field_mapping.get(sort_by, sort_by)
#         if sort_order == 'desc':
#             field = f'-{field}'
#         return queryset.order_by(field)


# class PlanTemplateDetailView(APIView):
#     """Enhanced template CRUD operations."""
#     permission_classes = [IsAuthenticated]

#     def get(self, request, pk):
#         template = get_object_or_404(
#             PlanTemplate.objects.filter(
#                 Q(is_public=True) | Q(created_by=request.user)
#             ),
#             pk=pk,
#             is_active=True
#         )
#         serializer = PlanTemplateSerializer(template, context={'request': request})
#         return Response(serializer.data, status=status.HTTP_200_OK)

#     def put(self, request, pk):
#         template = get_object_or_404(
#             PlanTemplate.objects.filter(created_by=request.user),
#             pk=pk
#         )
#         serializer = PlanTemplateSerializer(
#             template, 
#             data=request.data, 
#             partial=True,
#             context={'request': request}
#         )
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_200_OK)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#     def delete(self, request, pk):
#         template = get_object_or_404(
#             PlanTemplate.objects.filter(created_by=request.user),
#             pk=pk
#         )
#         template.is_active = False
#         template.save()
#         return Response(status=status.HTTP_204_NO_CONTENT)


# class TemplateIncrementUsageView(APIView):
#     """API endpoint to increment template usage count."""
#     permission_classes = [IsAuthenticated]

#     def patch(self, request, pk):
#         template = get_object_or_404(
#             PlanTemplate.objects.filter(
#                 Q(is_public=True) | Q(created_by=request.user)
#             ),
#             pk=pk,
#             is_active=True
#         )
        
#         # Increment usage count atomically
#         template.usage_count = F('usage_count') + 1
#         template.save()
#         template.refresh_from_db()
        
#         return Response({
#             'success': True,
#             'usage_count': template.usage_count,
#             'message': f'Template usage count incremented to {template.usage_count}'
#         }, status=status.HTTP_200_OK)


# class PublicPlanTemplateListView(APIView):
#     """
#     Public endpoint for listing active plan templates (no auth required).
#     """
#     permission_classes = [AllowAny]

#     def get(self, request):
#         try:
#             queryset = PlanTemplate.objects.filter(
#                 is_public=True, 
#                 is_active=True
#             ).order_by('name')
            
#             # Apply basic filters for public access
#             if category := request.query_params.get('category'):
#                 queryset = queryset.filter(category=category)
            
#             if access_type := request.query_params.get('access_type'):
#                 if access_type == 'hotspot':
#                     queryset = queryset.filter(access_methods__hotspot__enabled=True)
#                 elif access_type == 'pppoe':
#                     queryset = queryset.filter(access_methods__pppoe__enabled=True)
            
#             serializer = PlanTemplateSerializer(queryset, many=True)
#             return Response(serializer.data, status=status.HTTP_200_OK)
#         except Exception as e:
#             return Response(
#                 {'error': 'Failed to load templates', 'details': str(e)}, 
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )


# class CreatePlanFromTemplateView(APIView):
#     """
#     Enhanced plan creation from template with additional customization and usage tracking.
#     """
#     permission_classes = [IsAuthenticated]

#     def post(self, request, template_id):
#         template = get_object_or_404(
#             PlanTemplate.objects.filter(
#                 Q(is_public=True) | Q(created_by=request.user)
#             ),
#             pk=template_id,
#             is_active=True
#         )
        
#         # Check for duplicate plan names to prevent duplication
#         plan_name = request.data.get('name', template.name)
#         if InternetPlan.objects.filter(name=plan_name).exists():
#             return Response(
#                 {'error': f'A plan with the name "{plan_name}" already exists. Please choose a different name.'},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
        
#         # Create plan data from template
#         plan_data = {
#             'name': plan_name,
#             'category': template.category,
#             'price': template.base_price,
#             'access_methods': template.access_methods,
#             'template_id': template.id,
#             'plan_type': 'Paid' if template.base_price > 0 else 'Free Trial',
#             'description': template.description,
#             'active': True,
#             # Include advanced settings from template
#             'priority_level': template.priority_level if hasattr(template, 'priority_level') else 4,
#             'router_specific': template.router_specific if hasattr(template, 'router_specific') else False,
#             'FUP_policy': template.FUP_policy if hasattr(template, 'FUP_policy') else '',
#             'FUP_threshold': template.FUP_threshold if hasattr(template, 'FUP_threshold') else 80,
#         }
        
#         # Merge with any additional data from request (allows customization)
#         if request.data:
#             override_fields = ['name', 'price', 'description', 'active', 'category', 
#                              'priority_level', 'router_specific', 'FUP_policy', 'FUP_threshold']
#             for field in override_fields:
#                 if field in request.data:
#                     plan_data[field] = request.data[field]
            
#             # Handle access methods customization
#             if 'accessMethods' in request.data:
#                 plan_data['access_methods'] = request.data['accessMethods']
        
#         serializer = InternetPlanSerializer(data=plan_data)
#         if serializer.is_valid():
#             plan = serializer.save()
            
#             # Increment template usage count after successful plan creation
#             template.usage_count = F('usage_count') + 1
#             template.save()
#             template.refresh_from_db()
            
#             return Response(
#                 InternetPlanSerializer(plan).data, 
#                 status=status.HTTP_201_CREATED
#             )
        
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# class InternetPlanListCreateView(APIView):
#     """
#     Enhanced plan management with comprehensive filtering and analytics support.
#     """
#     pagination_class = StandardResultsSetPagination
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         queryset = InternetPlan.objects.all().prefetch_related('allowed_routers', 'template')
#         queryset = self.apply_filters(queryset, request)
#         queryset = self.apply_sorting(queryset, request)
        
#         paginator = self.pagination_class()
#         page = paginator.paginate_queryset(queryset, request)
#         serializer = InternetPlanSerializer(page, many=True)
#         return paginator.get_paginated_response(serializer.data)

#     def post(self, request):
#         # Check for duplicate plan names
#         plan_name = request.data.get('name', '')
#         if plan_name and InternetPlan.objects.filter(name=plan_name).exists():
#             return Response(
#                 {'error': f'A plan with the name "{plan_name}" already exists. Please choose a different name.'},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
        
#         serializer = InternetPlanSerializer(data=request.data)
#         if serializer.is_valid():
#             plan = serializer.save()
#             return Response(
#                 InternetPlanSerializer(plan).data, 
#                 status=status.HTTP_201_CREATED
#             )
#         return Response(
#             {'error': 'Validation failed', 'details': serializer.errors}, 
#             status=status.HTTP_400_BAD_REQUEST
#         )

#     def apply_filters(self, queryset, request):
#         """Apply comprehensive filters to plan queryset."""
#         # Basic filters
#         if category := request.query_params.get('category'):
#             queryset = queryset.filter(category=category)
        
#         if plan_type := request.query_params.get('planType'):
#             queryset = queryset.filter(plan_type=plan_type)
        
#         if (active := request.query_params.get('active')) is not None:
#             queryset = queryset.filter(active=active.lower() == 'true')
        
#         # Search filter
#         if search := request.query_params.get('search'):
#             queryset = queryset.filter(
#                 Q(name__icontains=search) | Q(description__icontains=search)
#             )
        
#         # Access type filter
#         if access_type := request.query_params.get('access_type'):
#             if access_type == 'hotspot':
#                 queryset = queryset.filter(access_methods__hotspot__enabled=True)
#             elif access_type == 'pppoe':
#                 queryset = queryset.filter(access_methods__pppoe__enabled=True)
        
#         # Template filter
#         if template_id := request.query_params.get('template_id'):
#             queryset = queryset.filter(template_id=template_id)
        
#         return queryset

#     def apply_sorting(self, queryset, request):
#         """Apply sorting based on query params."""
#         sort_by = request.query_params.get('sort_by', 'name')
#         sort_order = request.query_params.get('sort_order', 'asc')
        
#         field_mapping = {
#             'planType': 'plan_type',
#             'createdAt': 'created_at',
#             'price': 'price',
#             'purchases': 'purchases',
#             'name': 'name',
#         }
        
#         field = field_mapping.get(sort_by, sort_by)
#         if sort_order == 'desc':
#             field = f'-{field}'
#         return queryset.order_by(field)


# class InternetPlanDetailView(APIView):
#     """Enhanced plan CRUD operations."""
#     permission_classes = [IsAuthenticated]

#     def get(self, request, pk):
#         plan = get_object_or_404(
#             InternetPlan.objects.prefetch_related('allowed_routers', 'template'), 
#             pk=pk
#         )
#         serializer = InternetPlanSerializer(plan)
#         return Response(serializer.data, status=status.HTTP_200_OK)

#     def put(self, request, pk):
#         plan = get_object_or_404(InternetPlan, pk=pk)
        
#         # Check for duplicate names when updating
#         new_name = request.data.get('name')
#         if new_name and new_name != plan.name:
#             if InternetPlan.objects.filter(name=new_name).exclude(pk=pk).exists():
#                 return Response(
#                     {'error': f'A plan with the name "{new_name}" already exists. Please choose a different name.'},
#                     status=status.HTTP_400_BAD_REQUEST
#                 )
        
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
#     """
#     Enhanced public endpoint for listing active plans with access method filtering.
#     """
#     permission_classes = [AllowAny]

#     def get(self, request):
#         try:
#             # Only return plans that are active and have at least one enabled access method
#             queryset = InternetPlan.objects.filter(active=True)
            
#             # Apply access type filter for public API
#             if access_type := request.query_params.get('access_type'):
#                 if access_type == 'hotspot':
#                     queryset = queryset.filter(access_methods__hotspot__enabled=True)
#                 elif access_type == 'pppoe':
#                     queryset = queryset.filter(access_methods__pppoe__enabled=True)
            
#             # Apply category filter
#             if category := request.query_params.get('category'):
#                 queryset = queryset.filter(category=category)
            
#             # Filter plans with enabled access methods (database-level filtering)
#             # This uses database JSON field queries for better performance
#             queryset = queryset.filter(
#                 Q(access_methods__hotspot__enabled=True) | 
#                 Q(access_methods__pppoe__enabled=True)
#             )
            
#             serializer = InternetPlanSerializer(queryset, many=True)
#             return Response(serializer.data, status=status.HTTP_200_OK)
#         except Exception as e:
#             return Response(
#                 {'error': 'Failed to load plans', 'details': str(e)}, 
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )


# class SubscriptionListView(APIView):
#     """Enhanced subscription listing with comprehensive filtering."""
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         queryset = Subscription.objects.select_related(
#             'client', 'internet_plan', 'router', 'transaction'
#         ).order_by('-start_date')
        
#         # Apply comprehensive filters
#         status_filter = request.query_params.get('status')
#         if status_filter:
#             queryset = queryset.filter(status=status_filter)
            
#         plan_filter = request.query_params.get('plan')
#         if plan_filter:
#             queryset = queryset.filter(internet_plan_id=plan_filter)
            
#         router_filter = request.query_params.get('router')
#         if router_filter:
#             queryset = queryset.filter(router_id=router_filter)
            
#         access_method_filter = request.query_params.get('access_method')
#         if access_method_filter:
#             queryset = queryset.filter(access_method=access_method_filter)
            
#         # Date range filtering
#         start_date = request.query_params.get('start_date')
#         end_date = request.query_params.get('end_date')
#         if start_date and end_date:
#             queryset = queryset.filter(
#                 start_date__gte=start_date,
#                 start_date__lte=end_date
#             )
            
#         serializer = SubscriptionSerializer(queryset, many=True)
#         return Response(serializer.data, status=status.HTTP_200_OK)


# class PlanAnalyticsView(APIView):
#     """
#     Comprehensive analytics for plans, templates, and subscriptions.
#     Enhanced to support dual access methods and template analytics.
#     """
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         # Get time range from query params
#         time_range = request.query_params.get('time_range', '30d')
#         access_type = request.query_params.get('access_type')  # hotspot or pppoe
        
#         # Calculate date range
#         end_date = timezone.now()
#         if time_range == '7d':
#             start_date = end_date - timezone.timedelta(days=7)
#         elif time_range == '90d':
#             start_date = end_date - timezone.timedelta(days=90)
#         elif time_range == '1y':
#             start_date = end_date - timezone.timedelta(days=365)
#         else:  # 30d default
#             start_date = end_date - timezone.timedelta(days=30)

#         # Base querysets with date filtering
#         recent_subscriptions = Subscription.objects.filter(
#             start_date__gte=start_date
#         )
        
#         if access_type:
#             recent_subscriptions = recent_subscriptions.filter(access_method=access_type)

#         # Get plan usage statistics with access method filtering
#         plans = InternetPlan.objects.annotate(
#             active_subscriptions=Count(
#                 'subscriptions', 
#                 filter=Q(subscriptions__status='active') & 
#                        Q(subscriptions__start_date__gte=start_date)
#             ),
#             total_subscriptions=Count(
#                 'subscriptions',
#                 filter=Q(subscriptions__start_date__gte=start_date)
#             ),
#             total_revenue=Sum(
#                 'subscriptions__transaction__amount', 
#                 filter=Q(subscriptions__transaction__status='completed') &
#                        Q(subscriptions__start_date__gte=start_date)
#             )
#         )
        
#         # Apply access type filter to plans
#         if access_type:
#             if access_type == 'hotspot':
#                 plans = plans.filter(access_methods__hotspot__enabled=True)
#             elif access_type == 'pppoe':
#                 plans = plans.filter(access_methods__pppoe__enabled=True)

#         # Get template usage statistics
#         templates = PlanTemplate.objects.annotate(
#             plans_created=Count('created_plans'),
#             recent_usage=Count('created_plans', filter=Q(created_plans__created_at__gte=start_date))
#         )

#         # Get subscription status counts
#         status_counts = recent_subscriptions.values('status').annotate(count=Count('id'))
        
#         # Get access method distribution
#         access_method_counts = recent_subscriptions.values('access_method').annotate(count=Count('id'))
        
#         # Calculate category performance
#         category_stats = {}
#         for plan in plans:
#             category = plan.category
#             if category not in category_stats:
#                 category_stats[category] = {
#                     'plans': 0,
#                     'total_subscriptions': 0,
#                     'active_subscriptions': 0,
#                     'total_revenue': 0,
#                     'access_methods': set()
#                 }
            
#             category_stats[category]['plans'] += 1
#             category_stats[category]['total_subscriptions'] += plan.total_subscriptions
#             category_stats[category]['active_subscriptions'] += plan.active_subscriptions
#             category_stats[category]['total_revenue'] += (plan.total_revenue or 0)
            
#             # Track access methods in this category
#             enabled_methods = plan.get_enabled_access_methods()
#             category_stats[category]['access_methods'].update(enabled_methods)

#         # Convert sets to lists for JSON serialization
#         for category in category_stats:
#             category_stats[category]['access_methods'] = list(category_stats[category]['access_methods'])

#         # Top performing plans (by subscriptions)
#         top_plans = plans.order_by('-total_subscriptions')[:10]

#         # Popular templates
#         popular_templates = templates.order_by('-usage_count')[:5]

#         data = {
#             'time_range': time_range,
#             'access_type': access_type,
#             'date_range': {
#                 'start_date': start_date,
#                 'end_date': end_date
#             },
#             'plans': [
#                 {
#                     'id': plan.id,
#                     'name': plan.name,
#                     'category': plan.category,
#                     'access_type': plan.get_access_type(),
#                     'active_subscriptions': plan.active_subscriptions,
#                     'total_subscriptions': plan.total_subscriptions,
#                     'total_revenue': plan.total_revenue or 0,
#                     'enabled_access_methods': plan.get_enabled_access_methods(),
#                     'template': plan.template.name if plan.template else None
#                 }
#                 for plan in top_plans
#             ],
#             'templates': [
#                 {
#                     'id': template.id,
#                     'name': template.name,
#                     'category': template.category,
#                     'access_type': template.get_access_type(),
#                     'usage_count': template.usage_count,
#                     'plans_created': template.plans_created,
#                     'recent_usage': template.recent_usage,
#                     'is_public': template.is_public
#                 }
#                 for template in templates
#             ],
#             'recent_subscriptions': SubscriptionSerializer(
#                 recent_subscriptions.select_related('internet_plan', 'client')[:10], 
#                 many=True
#             ).data,
#             'status_counts': {item['status']: item['count'] for item in status_counts},
#             'access_method_counts': {item['access_method']: item['count'] for item in access_method_counts},
#             'category_stats': category_stats,
#             'total_subscriptions': recent_subscriptions.count(),
#             'active_subscriptions': recent_subscriptions.filter(status='active').count(),
#             'total_revenue': recent_subscriptions.filter(
#                 transaction__status='completed'
#             ).aggregate(total=Sum('transaction__amount'))['total'] or 0,
#             'total_templates': templates.count(),
#             'popular_templates': PlanTemplateSerializer(popular_templates, many=True).data
#         }
        
#         return Response(data, status=status.HTTP_200_OK)


# class PlanAccessTypeAnalyticsView(APIView):
#     """
#     Specialized analytics for access type comparison.
#     """
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         # Get analytics for both access types
#         hotspot_analytics = self.get_access_type_analytics('hotspot')
#         pppoe_analytics = self.get_access_type_analytics('pppoe')
        
#         data = {
#             'hotspot': hotspot_analytics,
#             'pppoe': pppoe_analytics,
#             'comparison': {
#                 'total_plans': {
#                     'hotspot': hotspot_analytics['total_plans'],
#                     'pppoe': pppoe_analytics['total_plans']
#                 },
#                 'total_subscriptions': {
#                     'hotspot': hotspot_analytics['total_subscriptions'],
#                     'pppoe': pppoe_analytics['total_subscriptions']
#                 },
#                 'total_revenue': {
#                     'hotspot': hotspot_analytics['total_revenue'],
#                     'pppoe': pppoe_analytics['total_revenue']
#                 }
#             }
#         }
        
#         return Response(data, status=status.HTTP_200_OK)
    
#     def get_access_type_analytics(self, access_type):
#         """Get analytics for specific access type."""
#         if access_type == 'hotspot':
#             plans = InternetPlan.objects.filter(access_methods__hotspot__enabled=True)
#         elif access_type == 'pppoe':
#             plans = InternetPlan.objects.filter(access_methods__pppoe__enabled=True)
#         else:
#             plans = InternetPlan.objects.none()
        
#         # Subscriptions using this access type
#         subscriptions = Subscription.objects.filter(access_method=access_type)
        
#         return {
#             'total_plans': plans.count(),
#             'active_plans': plans.filter(active=True).count(),
#             'total_subscriptions': subscriptions.count(),
#             'active_subscriptions': subscriptions.filter(status='active').count(),
#             'total_revenue': subscriptions.filter(
#                 transaction__status='completed'
#             ).aggregate(total=Sum('transaction__amount'))['total'] or 0,
#             'category_distribution': list(plans.values('category').annotate(count=Count('id'))),
#             'popular_plans': list(plans.order_by('-purchases')[:5].values('id', 'name', 'purchases'))
#         }


# class RouterCompatibilityView(APIView):
#     """Enhanced router compatibility checking."""
#     permission_classes = [IsAuthenticated]

#     def get(self, request, plan_id):
#         plan = get_object_or_404(InternetPlan, pk=plan_id)
        
#         if plan.router_specific:
#             # Return only allowed routers
#             routers = plan.allowed_routers.filter(status='connected', is_active=True)
#         else:
#             # Return all active routers
#             routers = Router.objects.filter(status='connected', is_active=True)
        
#         serializer = RouterSerializer(routers, many=True)
#         return Response(serializer.data, status=status.HTTP_200_OK)


# class ActivatePlanOnRouterView(APIView):
#     """Enhanced plan activation with access method support."""
#     permission_classes = [IsAuthenticated]

#     def post(self, request, plan_id, router_id):
#         plan = get_object_or_404(InternetPlan, pk=plan_id)
#         router = get_object_or_404(Router, pk=router_id)
        
#         # Check if plan can be used on this router
#         if not plan.can_be_used_on_router(router_id):
#             return Response(
#                 {'error': f'Plan "{plan.name}" cannot be used on router "{router.name}"'},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
        
#         # Check if router is connected
#         if router.status != 'connected':
#             return Response(
#                 {'error': f'Router "{router.name}" is not connected'},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
        
#         # Check if plan has enabled access methods
#         if not plan.has_enabled_access_methods():
#             return Response(
#                 {'error': f'Plan "{plan.name}" has no enabled access methods'},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
        
#         # Get the enabled access methods for configuration
#         enabled_methods = plan.get_enabled_access_methods()
        
#         response_data = {
#             'success': True,
#             'message': f'Plan "{plan.name}" activated on router "{router.name}"',
#             'enabled_access_methods': enabled_methods,
#             'router_configuration': {
#                 method: plan.access_methods.get(method, {})
#                 for method in enabled_methods
#             }
#         }
        
#         return Response(response_data, status=status.HTTP_200_OK)




# class TemplateUsageAnalyticsView(APIView):
#     """
#     Enhanced template usage analytics with proper access method tracking.
#     """
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         # Get analytics for template usage by access type
#         hotspot_templates = PlanTemplate.objects.filter(
#             access_methods__hotspot__enabled=True
#         ).annotate(
#             hotspot_usage=Count('created_plans', filter=Q(created_plans__access_methods__hotspot__enabled=True))
#         )
        
#         pppoe_templates = PlanTemplate.objects.filter(
#             access_methods__pppoe__enabled=True
#         ).annotate(
#             pppoe_usage=Count('created_plans', filter=Q(created_plans__access_methods__pppoe__enabled=True))
#         )

#         data = {
#             'hotspot_templates': [
#                 {
#                     'id': template.id,
#                     'name': template.name,
#                     'usage_count': template.usage_count,
#                     'hotspot_usage': template.hotspot_usage,
#                     'total_plans_created': template.created_plans.count()
#                 }
#                 for template in hotspot_templates
#             ],
#             'pppoe_templates': [
#                 {
#                     'id': template.id,
#                     'name': template.name,
#                     'usage_count': template.usage_count,
#                     'pppoe_usage': template.pppoe_usage,
#                     'total_plans_created': template.created_plans.count()
#                 }
#                 for template in pppoe_templates
#             ],
#             'summary': {
#                 'total_templates': PlanTemplate.objects.count(),
#                 'hotspot_templates_count': hotspot_templates.count(),
#                 'pppoe_templates_count': pppoe_templates.count(),
#                 'total_usage_count': PlanTemplate.objects.aggregate(total=Sum('usage_count'))['total'] or 0,
#             }
#         }
        
#         return Response(data, status=status.HTTP_200_OK)













# internet_plans/api/views/create_plan_views.py

from django.shortcuts import get_object_or_404
from django.db.models import Q, Count, Sum, F
from django.utils import timezone
from django.db import transaction
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.pagination import PageNumberPagination
from rest_framework import status
from internet_plans.models.create_plan_models import InternetPlan, Subscription, PlanTemplate
from internet_plans.serializers.create_plan_serializers import (
    InternetPlanSerializer, 
    SubscriptionSerializer, 
    PlanTemplateSerializer
)
from network_management.models.router_management_model import Router
from network_management.serializers.router_management_serializer import RouterSerializer


class StandardResultsSetPagination(PageNumberPagination):
    """Custom pagination with configurable page size."""
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class PlanTemplateListCreateView(APIView):
    """
    Enhanced template management with filtering and analytics support.
    """
    pagination_class = StandardResultsSetPagination
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Get public templates and templates created by current user
        queryset = PlanTemplate.objects.filter(
            Q(is_public=True) | Q(created_by=request.user)
        ).filter(is_active=True)
        
        queryset = self.apply_filters(queryset, request)
        queryset = self.apply_sorting(queryset, request)
        
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(queryset, request)
        serializer = PlanTemplateSerializer(page, many=True, context={'request': request})
        return paginator.get_paginated_response(serializer.data)

    def post(self, request):
        serializer = PlanTemplateSerializer(
            data=request.data, 
            context={'request': request}
        )
        if serializer.is_valid():
            template = serializer.save()
            return Response(
                PlanTemplateSerializer(template, context={'request': request}).data, 
                status=status.HTTP_201_CREATED
            )
        return Response(
            {'error': 'Validation failed', 'details': serializer.errors}, 
            status=status.HTTP_400_BAD_REQUEST
        )

    def apply_filters(self, queryset, request):
        """Apply comprehensive filters to template queryset."""
        # Category filter
        if category := request.query_params.get('category'):
            queryset = queryset.filter(category=category)
        
        # Search filter
        if search := request.query_params.get('search'):
            queryset = queryset.filter(
                Q(name__icontains=search) | Q(description__icontains=search)
            )
        
        # Access type filter
        if access_type := request.query_params.get('access_type'):
            if access_type == 'hotspot':
                queryset = queryset.filter(access_methods__hotspot__enabled=True)
            elif access_type == 'pppoe':
                queryset = queryset.filter(access_methods__pppoe__enabled=True)
            elif access_type == 'both':
                queryset = queryset.filter(
                    access_methods__hotspot__enabled=True,
                    access_methods__pppoe__enabled=True
                )
        
        # Visibility filter
        if visibility := request.query_params.get('visibility'):
            if visibility == 'public':
                queryset = queryset.filter(is_public=True)
            elif visibility == 'private':
                queryset = queryset.filter(is_public=False)
        
        return queryset

    def apply_sorting(self, queryset, request):
        """Apply sorting based on query params."""
        sort_by = request.query_params.get('sort_by', 'name')
        sort_order = request.query_params.get('sort_order', 'asc')
        
        field_mapping = {
            'usageCount': 'usage_count',
            'createdAt': 'created_at',
            'basePrice': 'base_price',
            'name': 'name',
        }
        
        field = field_mapping.get(sort_by, sort_by)
        if sort_order == 'desc':
            field = f'-{field}'
        return queryset.order_by(field)


class PlanTemplateDetailView(APIView):
    """Enhanced template CRUD operations."""
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        template = get_object_or_404(
            PlanTemplate.objects.filter(
                Q(is_public=True) | Q(created_by=request.user)
            ),
            pk=pk,
            is_active=True
        )
        serializer = PlanTemplateSerializer(template, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, pk):
        template = get_object_or_404(
            PlanTemplate.objects.filter(created_by=request.user),
            pk=pk
        )
        serializer = PlanTemplateSerializer(
            template, 
            data=request.data, 
            partial=True,
            context={'request': request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        template = get_object_or_404(
            PlanTemplate.objects.filter(created_by=request.user),
            pk=pk
        )
        # HARD DELETE - actually remove from database
        template.delete()
        return Response(
            {'message': 'Template deleted successfully'}, 
            status=status.HTTP_204_NO_CONTENT
        )


class TemplateIncrementUsageView(APIView):
    """API endpoint to increment template usage count."""
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        try:
            with transaction.atomic():
                template = get_object_or_404(
                    PlanTemplate.objects.filter(
                        Q(is_public=True) | Q(created_by=request.user)
                    ),
                    pk=pk,
                    is_active=True
                )
                
                # Use the model method which handles atomic increment
                template.increment_usage()
                
                return Response({
                    'success': True,
                    'id': template.id,
                    'name': template.name,
                    'usage_count': template.usage_count,
                    'message': 'Usage count incremented successfully'
                }, status=status.HTTP_200_OK)
                
        except Exception as e:
            return Response({
                'success': False,
                'error': 'Failed to increment usage count',
                'details': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class CreatePlanFromTemplateView(APIView):
    """
    Enhanced plan creation from template with additional customization and usage tracking.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, template_id):
        try:
            with transaction.atomic():
                template = get_object_or_404(
                    PlanTemplate.objects.filter(
                        Q(is_public=True) | Q(created_by=request.user)
                    ),
                    pk=template_id,
                    is_active=True
                )

                plan_name = request.data.get('name', f"{template.name} Plan")
                if InternetPlan.objects.filter(name=plan_name).exists():
                    return Response({
                        'error': f'A plan with the name "{plan_name}" already exists. Please choose a different name.'
                    }, status=status.HTTP_400_BAD_REQUEST)

                plan_data = {
                    'name': plan_name,
                    'category': template.category,
                    'price': str(template.base_price),
                    'description': request.data.get('description', template.description),
                    'access_methods': request.data.get('accessMethods', template.access_methods),
                    'plan_type': 'Paid' if template.base_price > 0 else 'Free Trial',
                    'active': request.data.get('active', True),
                    'priority_level': request.data.get('priority_level', template.priority_level),
                    'router_specific': request.data.get('router_specific', template.router_specific),
                    'FUP_policy': request.data.get('FUP_policy', template.FUP_policy),
                    'FUP_threshold': request.data.get('FUP_threshold', template.FUP_threshold),
                    'template_id': template.id,
                }

                if 'allowed_routers_ids' in request.data:
                    plan_data['allowed_routers_ids'] = request.data['allowed_routers_ids']

                serializer = InternetPlanSerializer(data=plan_data, context={'request': request})
                if serializer.is_valid():
                    plan = serializer.save()
                    
                    # Increment template usage count
                    template.increment_usage()
                    
                    return Response(
                        InternetPlanSerializer(plan).data, 
                        status=status.HTTP_201_CREATED
                    )

                return Response({
                    'error': 'Validation failed',
                    'details': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            return Response({
                'error': 'Failed to create plan from template',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class InternetPlanListCreateView(APIView):
    """
    Enhanced plan management with comprehensive filtering and analytics support.
    """
    pagination_class = StandardResultsSetPagination
    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = InternetPlan.objects.all().prefetch_related('allowed_routers', 'template')
        queryset = self.apply_filters(queryset, request)
        queryset = self.apply_sorting(queryset, request)
        
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(queryset, request)
        serializer = InternetPlanSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)

    def post(self, request):
        # Check for duplicate plan names
        plan_name = request.data.get('name', '')
        if plan_name and InternetPlan.objects.filter(name=plan_name).exists():
            return Response(
                {'error': f'A plan with the name "{plan_name}" already exists. Please choose a different name.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = InternetPlanSerializer(data=request.data)
        if serializer.is_valid():
            plan = serializer.save()
            return Response(
                InternetPlanSerializer(plan).data, 
                status=status.HTTP_201_CREATED
            )
        return Response(
            {'error': 'Validation failed', 'details': serializer.errors}, 
            status=status.HTTP_400_BAD_REQUEST
        )

    def apply_filters(self, queryset, request):
        """Apply comprehensive filters to plan queryset."""
        # Basic filters
        if category := request.query_params.get('category'):
            queryset = queryset.filter(category=category)
        
        if plan_type := request.query_params.get('planType'):
            queryset = queryset.filter(plan_type=plan_type)
        
        if (active := request.query_params.get('active')) is not None:
            queryset = queryset.filter(active=active.lower() == 'true')
        
        # Search filter
        if search := request.query_params.get('search'):
            queryset = queryset.filter(
                Q(name__icontains=search) | Q(description__icontains=search)
            )
        
        # Access type filter
        if access_type := request.query_params.get('access_type'):
            if access_type == 'hotspot':
                queryset = queryset.filter(access_methods__hotspot__enabled=True)
            elif access_type == 'pppoe':
                queryset = queryset.filter(access_methods__pppoe__enabled=True)
        
        # Template filter
        if template_id := request.query_params.get('template_id'):
            queryset = queryset.filter(template_id=template_id)
        
        return queryset

    def apply_sorting(self, queryset, request):
        """Apply sorting based on query params."""
        sort_by = request.query_params.get('sort_by', 'name')
        sort_order = request.query_params.get('sort_order', 'asc')
        
        field_mapping = {
            'planType': 'plan_type',
            'createdAt': 'created_at',
            'price': 'price',
            'purchases': 'purchases',
            'name': 'name',
        }
        
        field = field_mapping.get(sort_by, sort_by)
        if sort_order == 'desc':
            field = f'-{field}'
        return queryset.order_by(field)


class InternetPlanDetailView(APIView):
    """Enhanced plan CRUD operations."""
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        plan = get_object_or_404(
            InternetPlan.objects.prefetch_related('allowed_routers', 'template'), 
            pk=pk
        )
        serializer = InternetPlanSerializer(plan)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, pk):
        plan = get_object_or_404(InternetPlan, pk=pk)
        
        # Check for duplicate names when updating
        new_name = request.data.get('name')
        if new_name and new_name != plan.name:
            if InternetPlan.objects.filter(name=new_name).exclude(pk=pk).exists():
                return Response(
                    {'error': f'A plan with the name "{new_name}" already exists. Please choose a different name.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        serializer = InternetPlanSerializer(plan, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        plan = get_object_or_404(InternetPlan, pk=pk)
        plan.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class PublicInternetPlanListView(APIView):
    """
    Enhanced public endpoint for listing active plans with access method filtering.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            # Only return plans that are active and have at least one enabled access method
            queryset = InternetPlan.objects.filter(active=True)
            
            # Apply access type filter for public API
            if access_type := request.query_params.get('access_type'):
                if access_type == 'hotspot':
                    queryset = queryset.filter(access_methods__hotspot__enabled=True)
                elif access_type == 'pppoe':
                    queryset = queryset.filter(access_methods__pppoe__enabled=True)
            
            # Apply category filter
            if category := request.query_params.get('category'):
                queryset = queryset.filter(category=category)
            
            # Filter plans with enabled access methods (database-level filtering)
            # This uses database JSON field queries for better performance
            queryset = queryset.filter(
                Q(access_methods__hotspot__enabled=True) | 
                Q(access_methods__pppoe__enabled=True)
            )
            
            serializer = InternetPlanSerializer(queryset, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {'error': 'Failed to load plans', 'details': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class SubscriptionListView(APIView):
    """Enhanced subscription listing with comprehensive filtering."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = Subscription.objects.select_related(
            'client', 'internet_plan', 'router', 'transaction'
        ).order_by('-start_date')
        
        # Apply comprehensive filters
        status_filter = request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
            
        plan_filter = request.query_params.get('plan')
        if plan_filter:
            queryset = queryset.filter(internet_plan_id=plan_filter)
            
        router_filter = request.query_params.get('router')
        if router_filter:
            queryset = queryset.filter(router_id=router_filter)
            
        access_method_filter = request.query_params.get('access_method')
        if access_method_filter:
            queryset = queryset.filter(access_method=access_method_filter)
            
        # Date range filtering
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        if start_date and end_date:
            queryset = queryset.filter(
                start_date__gte=start_date,
                start_date__lte=end_date
            )
            
        serializer = SubscriptionSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class PlanAnalyticsView(APIView):
    """
    Comprehensive analytics for plans, templates, and subscriptions.
    Enhanced to support dual access methods and template analytics.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Get time range from query params
        time_range = request.query_params.get('time_range', '30d')
        access_type = request.query_params.get('access_type')  # hotspot or pppoe
        
        # Calculate date range
        end_date = timezone.now()
        if time_range == '7d':
            start_date = end_date - timezone.timedelta(days=7)
        elif time_range == '90d':
            start_date = end_date - timezone.timedelta(days=90)
        elif time_range == '1y':
            start_date = end_date - timezone.timedelta(days=365)
        else:  # 30d default
            start_date = end_date - timezone.timedelta(days=30)

        # Base querysets with date filtering
        recent_subscriptions = Subscription.objects.filter(
            start_date__gte=start_date
        )
        
        if access_type:
            recent_subscriptions = recent_subscriptions.filter(access_method=access_type)

        # Get plan usage statistics with access method filtering
        plans = InternetPlan.objects.annotate(
            active_subscriptions=Count(
                'subscriptions', 
                filter=Q(subscriptions__status='active') & 
                       Q(subscriptions__start_date__gte=start_date)
            ),
            total_subscriptions=Count(
                'subscriptions',
                filter=Q(subscriptions__start_date__gte=start_date)
            ),
            total_revenue=Sum(
                'subscriptions__transaction__amount', 
                filter=Q(subscriptions__transaction__status='completed') &
                       Q(subscriptions__start_date__gte=start_date)
            )
        )
        
        # Apply access type filter to plans
        if access_type:
            if access_type == 'hotspot':
                plans = plans.filter(access_methods__hotspot__enabled=True)
            elif access_type == 'pppoe':
                plans = plans.filter(access_methods__pppoe__enabled=True)

        # Get template usage statistics
        templates = PlanTemplate.objects.annotate(
            plans_created=Count('created_plans'),
            recent_usage=Count('created_plans', filter=Q(created_plans__created_at__gte=start_date))
        )

        # Get subscription status counts
        status_counts = recent_subscriptions.values('status').annotate(count=Count('id'))
        
        # Get access method distribution
        access_method_counts = recent_subscriptions.values('access_method').annotate(count=Count('id'))
        
        # Calculate category performance
        category_stats = {}
        for plan in plans:
            category = plan.category
            if category not in category_stats:
                category_stats[category] = {
                    'plans': 0,
                    'total_subscriptions': 0,
                    'active_subscriptions': 0,
                    'total_revenue': 0,
                    'access_methods': set()
                }
            
            category_stats[category]['plans'] += 1
            category_stats[category]['total_subscriptions'] += plan.total_subscriptions
            category_stats[category]['active_subscriptions'] += plan.active_subscriptions
            category_stats[category]['total_revenue'] += (plan.total_revenue or 0)
            
            # Track access methods in this category
            enabled_methods = plan.get_enabled_access_methods()
            category_stats[category]['access_methods'].update(enabled_methods)

        # Convert sets to lists for JSON serialization
        for category in category_stats:
            category_stats[category]['access_methods'] = list(category_stats[category]['access_methods'])

        # Top performing plans (by subscriptions)
        top_plans = plans.order_by('-total_subscriptions')[:10]

        # Popular templates
        popular_templates = templates.order_by('-usage_count')[:5]

        data = {
            'time_range': time_range,
            'access_type': access_type,
            'date_range': {
                'start_date': start_date,
                'end_date': end_date
            },
            'plans': [
                {
                    'id': plan.id,
                    'name': plan.name,
                    'category': plan.category,
                    'access_type': plan.get_access_type(),
                    'active_subscriptions': plan.active_subscriptions,
                    'total_subscriptions': plan.total_subscriptions,
                    'total_revenue': plan.total_revenue or 0,
                    'enabled_access_methods': plan.get_enabled_access_methods(),
                    'template': plan.template.name if plan.template else None
                }
                for plan in top_plans
            ],
            'templates': [
                {
                    'id': template.id,
                    'name': template.name,
                    'category': template.category,
                    'access_type': template.get_access_type(),
                    'usage_count': template.usage_count,
                    'plans_created': template.plans_created,
                    'recent_usage': template.recent_usage,
                    'is_public': template.is_public
                }
                for template in templates
            ],
            'recent_subscriptions': SubscriptionSerializer(
                recent_subscriptions.select_related('internet_plan', 'client')[:10], 
                many=True
            ).data,
            'status_counts': {item['status']: item['count'] for item in status_counts},
            'access_method_counts': {item['access_method']: item['count'] for item in access_method_counts},
            'category_stats': category_stats,
            'total_subscriptions': recent_subscriptions.count(),
            'active_subscriptions': recent_subscriptions.filter(status='active').count(),
            'total_revenue': recent_subscriptions.filter(
                transaction__status='completed'
            ).aggregate(total=Sum('transaction__amount'))['total'] or 0,
            'total_templates': templates.count(),
            'popular_templates': PlanTemplateSerializer(popular_templates, many=True).data
        }
        
        return Response(data, status=status.HTTP_200_OK)


class PlanAccessTypeAnalyticsView(APIView):
    """
    Specialized analytics for access type comparison.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Get analytics for both access types
        hotspot_analytics = self.get_access_type_analytics('hotspot')
        pppoe_analytics = self.get_access_type_analytics('pppoe')
        
        data = {
            'hotspot': hotspot_analytics,
            'pppoe': pppoe_analytics,
            'comparison': {
                'total_plans': {
                    'hotspot': hotspot_analytics['total_plans'],
                    'pppoe': pppoe_analytics['total_plans']
                },
                'total_subscriptions': {
                    'hotspot': hotspot_analytics['total_subscriptions'],
                    'pppoe': pppoe_analytics['total_subscriptions']
                },
                'total_revenue': {
                    'hotspot': hotspot_analytics['total_revenue'],
                    'pppoe': pppoe_analytics['total_revenue']
                }
            }
        }
        
        return Response(data, status=status.HTTP_200_OK)
    
    def get_access_type_analytics(self, access_type):
        """Get analytics for specific access type."""
        if access_type == 'hotspot':
            plans = InternetPlan.objects.filter(access_methods__hotspot__enabled=True)
        elif access_type == 'pppoe':
            plans = InternetPlan.objects.filter(access_methods__pppoe__enabled=True)
        else:
            plans = InternetPlan.objects.none()
        
        # Subscriptions using this access type
        subscriptions = Subscription.objects.filter(access_method=access_type)
        
        return {
            'total_plans': plans.count(),
            'active_plans': plans.filter(active=True).count(),
            'total_subscriptions': subscriptions.count(),
            'active_subscriptions': subscriptions.filter(status='active').count(),
            'total_revenue': subscriptions.filter(
                transaction__status='completed'
            ).aggregate(total=Sum('transaction__amount'))['total'] or 0,
            'category_distribution': list(plans.values('category').annotate(count=Count('id'))),
            'popular_plans': list(plans.order_by('-purchases')[:5].values('id', 'name', 'purchases'))
        }


class RouterCompatibilityView(APIView):
    """Enhanced router compatibility checking."""
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
    """Enhanced plan activation with access method support."""
    permission_classes = [IsAuthenticated]

    def post(self, request, plan_id, router_id):
        plan = get_object_or_404(InternetPlan, pk=plan_id)
        router = get_object_or_404(Router, pk=router_id)
        
        # Check if plan can be used on this router
        if not plan.can_be_used_on_router(router_id):
            return Response(
                {'error': f'Plan "{plan.name}" cannot be used on router "{router.name}"'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if router is connected
        if router.status != 'connected':
            return Response(
                {'error': f'Router "{router.name}" is not connected'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if plan has enabled access methods
        if not plan.has_enabled_access_methods():
            return Response(
                {'error': f'Plan "{plan.name}" has no enabled access methods'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get the enabled access methods for configuration
        enabled_methods = plan.get_enabled_access_methods()
        
        response_data = {
            'success': True,
            'message': f'Plan "{plan.name}" activated on router "{router.name}"',
            'enabled_access_methods': enabled_methods,
            'router_configuration': {
                method: plan.access_methods.get(method, {})
                for method in enabled_methods
            }
        }
        
        return Response(response_data, status=status.HTTP_200_OK)


class TemplateUsageAnalyticsView(APIView):
    """
    Enhanced template usage analytics with proper access method tracking.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Get analytics for template usage by access type
        hotspot_templates = PlanTemplate.objects.filter(
            access_methods__hotspot__enabled=True
        ).annotate(
            hotspot_usage=Count('created_plans', filter=Q(created_plans__access_methods__hotspot__enabled=True))
        )
        
        pppoe_templates = PlanTemplate.objects.filter(
            access_methods__pppoe__enabled=True
        ).annotate(
            pppoe_usage=Count('created_plans', filter=Q(created_plans__access_methods__pppoe__enabled=True))
        )

        data = {
            'hotspot_templates': [
                {
                    'id': template.id,
                    'name': template.name,
                    'usage_count': template.usage_count,
                    'hotspot_usage': template.hotspot_usage,
                    'total_plans_created': template.created_plans.count()
                }
                for template in hotspot_templates
            ],
            'pppoe_templates': [
                {
                    'id': template.id,
                    'name': template.name,
                    'usage_count': template.usage_count,
                    'pppoe_usage': template.pppoe_usage,
                    'total_plans_created': template.created_plans.count()
                }
                for template in pppoe_templates
            ],
            'summary': {
                'total_templates': PlanTemplate.objects.count(),
                'hotspot_templates_count': hotspot_templates.count(),
                'pppoe_templates_count': pppoe_templates.count(),
                'total_usage_count': PlanTemplate.objects.aggregate(total=Sum('usage_count'))['total'] or 0,
            }
        }
        
        return Response(data, status=status.HTTP_200_OK)


class PublicPlanTemplateListView(APIView):
    """
    Public endpoint for listing active plan templates (no auth required).
    """
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            queryset = PlanTemplate.objects.filter(
                is_public=True, 
                is_active=True
            ).order_by('name')
            
            # Apply basic filters for public access
            if category := request.query_params.get('category'):
                queryset = queryset.filter(category=category)
            
            if access_type := request.query_params.get('access_type'):
                if access_type == 'hotspot':
                    queryset = queryset.filter(access_methods__hotspot__enabled=True)
                elif access_type == 'pppoe':
                    queryset = queryset.filter(access_methods__pppoe__enabled=True)
            
            serializer = PlanTemplateSerializer(queryset, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {'error': 'Failed to load templates', 'details': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )