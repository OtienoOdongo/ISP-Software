








# from django.shortcuts import get_object_or_404
# from django.db.models import Q, Count, Sum, Avg, F
# from django.utils import timezone
# from django.db import transaction
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
# from internet_plans.serializers.integration_serializers import IntegratedInternetPlanSerializer, ClientPlanSerializer
# from network_management.models.router_management_model import Router
# from network_management.serializers.router_management_serializer import RouterSerializer
# import logging
# import requests
# from django.conf import settings

# logger = logging.getLogger(__name__)

# class AnalyticsService:
#     """Service class for analytics data from payment app"""
    
#     @staticmethod
#     def get_revenue_data(time_range, access_type=None):
#         """
#         Get revenue data from payment app
#         """
#         try:
#             params = {'time_range': time_range}
#             if access_type:
#                 params['access_type'] = access_type
                
#             response = requests.get(
#                 f"{settings.PAYMENT_APP_BASE_URL}/api/payments/analytics/revenue/",
#                 params=params,
#                 timeout=10
#             )
            
#             if response.status_code == 200:
#                 return response.json()
#             else:
#                 logger.warning(f"Failed to fetch revenue data: {response.status_code}")
#                 return {'total_revenue': 0, 'revenue_by_plan': []}
                
#         except requests.exceptions.RequestException as e:
#             logger.error(f"Revenue analytics fetch error: {e}")
#             return {'total_revenue': 0, 'revenue_by_plan': []}
    
#     @staticmethod
#     def get_payment_success_rate(time_range):
#         """
#         Get payment success rate from payment app
#         """
#         try:
#             response = requests.get(
#                 f"{settings.PAYMENT_APP_BASE_URL}/api/payments/analytics/success-rate/",
#                 params={'time_range': time_range},
#                 timeout=10
#             )
            
#             if response.status_code == 200:
#                 return response.json()
#             else:
#                 return {'success_rate': 0, 'total_transactions': 0}
                
#         except requests.exceptions.RequestException as e:
#             logger.error(f"Success rate fetch error: {e}")
#             return {'success_rate': 0, 'total_transactions': 0}

# class StandardResultsSetPagination(PageNumberPagination):
#     page_size = 20
#     page_size_query_param = 'page_size'
#     max_page_size = 100

# class PlanTemplateListCreateView(APIView):
#     pagination_class = StandardResultsSetPagination
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
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
#         if category := request.query_params.get('category'):
#             queryset = queryset.filter(category=category)
        
#         if search := request.query_params.get('search'):
#             queryset = queryset.filter(
#                 Q(name__icontains=search) | Q(description__icontains=search)
#             )
        
#         if access_type := request.query_params.get('access_type'):
#             if access_type == 'hotspot':
#                 queryset = queryset.filter(access_methods__hotspot__enabled=True)
#             elif access_type == 'pppoe':
#                 queryset = queryset.filter(access_methods__pppoe__enabled=True)
#             elif access_type == 'both':
#                 queryset = queryset.filter(
#                     access_methods__hotspot__enabled=True,
#                     access_methods__pppoe__enabled=True
#                 )
        
#         if visibility := request.query_params.get('visibility'):
#             if visibility == 'public':
#                 queryset = queryset.filter(is_public=True)
#             elif visibility == 'private':
#                 queryset = queryset.filter(is_public=False)
        
#         return queryset

#     def apply_sorting(self, queryset, request):
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
#         template.delete()
#         return Response(
#             {'message': 'Template deleted successfully'}, 
#             status=status.HTTP_204_NO_CONTENT
#         )

# class TemplateIncrementUsageView(APIView):
#     permission_classes = [IsAuthenticated]

#     def patch(self, request, pk):
#         try:
#             with transaction.atomic():
#                 template = get_object_or_404(
#                     PlanTemplate.objects.filter(
#                         Q(is_public=True) | Q(created_by=request.user)
#                     ),
#                     pk=pk,
#                     is_active=True
#                 )
                
#                 template.increment_usage()
                
#                 return Response({
#                     'success': True,
#                     'id': template.id,
#                     'name': template.name,
#                     'usage_count': template.usage_count,
#                     'message': 'Usage count incremented successfully'
#                 }, status=status.HTTP_200_OK)
                
#         except Exception as e:
#             logger.error(f"Failed to increment template usage: {e}")
#             return Response({
#                 'success': False,
#                 'error': 'Failed to increment usage count',
#                 'details': str(e)
#             }, status=status.HTTP_400_BAD_REQUEST)

# class CreatePlanFromTemplateView(APIView):
#     permission_classes = [IsAuthenticated]

#     def post(self, request, template_id):
#         try:
#             with transaction.atomic():
#                 template = get_object_or_404(
#                     PlanTemplate.objects.filter(
#                         Q(is_public=True) | Q(created_by=request.user)
#                     ),
#                     pk=template_id,
#                     is_active=True
#                 )

#                 plan_name = request.data.get('name', f"{template.name} Plan")
#                 if InternetPlan.objects.filter(name=plan_name).exists():
#                     return Response({
#                         'error': f'A plan with the name "{plan_name}" already exists. Please choose a different name.'
#                     }, status=status.HTTP_400_BAD_REQUEST)

#                 plan_data = {
#                     'name': plan_name,
#                     'category': template.category,
#                     'price': str(template.base_price),
#                     'description': request.data.get('description', template.description),
#                     'access_methods': request.data.get('accessMethods', template.access_methods),
#                     'plan_type': 'Paid' if template.base_price > 0 else 'Free Trial',
#                     'active': request.data.get('active', True),
#                     'priority_level': request.data.get('priority_level', 4),
#                     'router_specific': request.data.get('router_specific', False),
#                     'FUP_policy': request.data.get('FUP_policy', ''),
#                     'FUP_threshold': request.data.get('FUP_threshold', 80),
#                     'template_id': template.id,
#                 }

#                 if 'allowed_routers_ids' in request.data:
#                     plan_data['allowed_routers_ids'] = request.data['allowed_routers_ids']

#                 serializer = InternetPlanSerializer(data=plan_data, context={'request': request})
#                 if serializer.is_valid():
#                     plan = serializer.save()
                    
#                     template.increment_usage()
                    
#                     return Response(
#                         InternetPlanSerializer(plan).data, 
#                         status=status.HTTP_201_CREATED
#                     )

#                 return Response({
#                     'error': 'Validation failed',
#                     'details': serializer.errors
#                 }, status=status.HTTP_400_BAD_REQUEST)
                
#         except Exception as e:
#             logger.error(f"Failed to create plan from template: {e}")
#             return Response({
#                 'error': 'Failed to create plan from template',
#                 'details': str(e)
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# class InternetPlanListCreateView(APIView):
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
#         if category := request.query_params.get('category'):
#             queryset = queryset.filter(category=category)
        
#         if plan_type := request.query_params.get('planType'):
#             queryset = queryset.filter(plan_type=plan_type)
        
#         if (active := request.query_params.get('active')) is not None:
#             queryset = queryset.filter(active=active.lower() == 'true')
        
#         if search := request.query_params.get('search'):
#             queryset = queryset.filter(
#                 Q(name__icontains=search) | Q(description__icontains=search)
#             )
        
#         if access_type := request.query_params.get('access_type'):
#             if access_type == 'hotspot':
#                 queryset = queryset.filter(access_methods__hotspot__enabled=True)
#             elif access_type == 'pppoe':
#                 queryset = queryset.filter(access_methods__pppoe__enabled=True)
        
#         if template_id := request.query_params.get('template_id'):
#             queryset = queryset.filter(template_id=template_id)
        
#         return queryset

#     def apply_sorting(self, queryset, request):
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
#     permission_classes = [AllowAny]

#     def get(self, request):
#         try:
#             queryset = InternetPlan.objects.filter(active=True)
            
#             access_type = request.query_params.get('access_type')
#             if access_type:
#                 if access_type == 'hotspot':
#                     queryset = queryset.filter(access_methods__hotspot__enabled=True)
#                 elif access_type == 'pppoe':
#                     queryset = queryset.filter(access_methods__pppoe__enabled=True)
            
#             if category := request.query_params.get('category'):
#                 queryset = queryset.filter(category=category)
            
#             queryset = queryset.filter(
#                 Q(access_methods__hotspot__enabled=True) | 
#                 Q(access_methods__pppoe__enabled=True)
#             )
            
#             serializer = ClientPlanSerializer(queryset, many=True)
#             return Response(serializer.data, status=status.HTTP_200_OK)
#         except Exception as e:
#             logger.error(f"Failed to load public plans: {e}")
#             return Response(
#                 {'error': 'Failed to load plans', 'details': str(e)}, 
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )

# class SubscriptionListView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         queryset = Subscription.objects.select_related(
#             'client', 'internet_plan', 'router'
#         ).order_by('-start_date')
        
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
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         time_range = request.query_params.get('time_range', '30d')
#         access_type = request.query_params.get('access_type')
        
#         end_date = timezone.now()
#         if time_range == '7d':
#             start_date = end_date - timezone.timedelta(days=7)
#         elif time_range == '90d':
#             start_date = end_date - timezone.timedelta(days=90)
#         elif time_range == '1y':
#             start_date = end_date - timezone.timedelta(days=365)
#         else:
#             start_date = end_date - timezone.timedelta(days=30)

#         recent_subscriptions = Subscription.objects.filter(
#             start_date__gte=start_date
#         )
        
#         if access_type:
#             recent_subscriptions = recent_subscriptions.filter(access_method=access_type)

#         plans = InternetPlan.objects.annotate(
#             active_subscriptions=Count(
#                 'subscriptions', 
#                 filter=Q(subscriptions__status='active') & 
#                        Q(subscriptions__start_date__gte=start_date)
#             ),
#             total_subscriptions=Count(
#                 'subscriptions',
#                 filter=Q(subscriptions__start_date__gte=start_date)
#             )
#             # Removed total_revenue calculation - now handled by payment app
#         )
        
#         if access_type:
#             if access_type == 'hotspot':
#                 plans = plans.filter(access_methods__hotspot__enabled=True)
#             elif access_type == 'pppoe':
#                 plans = plans.filter(access_methods__pppoe__enabled=True)

#         templates = PlanTemplate.objects.annotate(
#             plans_created=Count('created_plans'),
#             recent_usage=Count('created_plans', filter=Q(created_plans__created_at__gte=start_date))
#         )

#         status_counts = recent_subscriptions.values('status').annotate(count=Count('id'))
#         access_method_counts = recent_subscriptions.values('access_method').annotate(count=Count('id'))
        
#         # Get revenue data from payment service
#         revenue_data = AnalyticsService.get_revenue_data(time_range, access_type)
#         payment_success_data = AnalyticsService.get_payment_success_rate(time_range)
        
#         category_stats = {}
#         for plan in plans:
#             category = plan.category
#             if category not in category_stats:
#                 category_stats[category] = {
#                     'plans': 0,
#                     'total_subscriptions': 0,
#                     'active_subscriptions': 0,
#                     'access_methods': set()
#                 }
            
#             category_stats[category]['plans'] += 1
#             category_stats[category]['total_subscriptions'] += plan.total_subscriptions
#             category_stats[category]['active_subscriptions'] += plan.active_subscriptions
            
#             enabled_methods = plan.get_enabled_access_methods()
#             category_stats[category]['access_methods'].update(enabled_methods)

#         for category in category_stats:
#             category_stats[category]['access_methods'] = list(category_stats[category]['access_methods'])

#         top_plans = plans.order_by('-total_subscriptions')[:10]
#         popular_templates = templates.order_by('-usage_count')[:5]
#         router_analytics = self.get_router_analytics()
#         activation_metrics = self.get_activation_metrics()

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
#             'router_analytics': router_analytics,
#             'activation_metrics': activation_metrics,
#             'payment_analytics': {
#                 'total_revenue': revenue_data.get('total_revenue', 0),
#                 'revenue_by_plan': revenue_data.get('revenue_by_plan', []),
#                 'payment_success_rate': payment_success_data.get('success_rate', 0),
#                 'total_transactions': payment_success_data.get('total_transactions', 0)
#             },
#             'total_subscriptions': recent_subscriptions.count(),
#             'active_subscriptions': recent_subscriptions.filter(status='active').count(),
#             'total_templates': templates.count(),
#             'popular_templates': PlanTemplateSerializer(popular_templates, many=True).data
#         }
        
#         return Response(data, status=status.HTTP_200_OK)
    
#     def get_router_analytics(self):
#         from network_management.models.router_management_model import Router
        
#         routers = Router.objects.filter(is_active=True)
#         router_stats = []
        
#         for router in routers:
#             active_subs = Subscription.objects.filter(
#                 router=router,
#                 status='active',
#                 is_active=True
#             )
            
#             router_stats.append({
#                 'router_id': router.id,
#                 'router_name': router.name,
#                 'active_subscriptions': active_subs.count(),
#                 'access_methods': list(active_subs.values('access_method').annotate(count=Count('id'))),
#                 'plan_distribution': list(active_subs.values('internet_plan__name').annotate(count=Count('id')))
#             })
        
#         return router_stats
    
#     def get_activation_metrics(self):
#         activation_attempts = Subscription.objects.all()
        
#         return {
#             'total_attempts': activation_attempts.count(),
#             'successful_activations': activation_attempts.filter(activation_successful=True).count(),
#             'failed_activations': activation_attempts.filter(activation_successful=False, activation_attempts__gt=0).count(),
#             'success_rate': (activation_attempts.filter(activation_successful=True).count() / activation_attempts.count() * 100) if activation_attempts.count() > 0 else 0,
#             'by_access_method': list(activation_attempts.values('access_method').annotate(
#                 total=Count('id'),
#                 success=Count('id', filter=Q(activation_successful=True))
#             ))
#         }

# class PlanAccessTypeAnalyticsView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         hotspot_analytics = self.get_access_type_analytics('hotspot')
#         pppoe_analytics = self.get_access_type_analytics('pppoe')
        
#         # Get revenue data by access type
#         hotspot_revenue = AnalyticsService.get_revenue_data('30d', 'hotspot')
#         pppoe_revenue = AnalyticsService.get_revenue_data('30d', 'pppoe')
        
#         data = {
#             'hotspot': {
#                 **hotspot_analytics,
#                 'total_revenue': hotspot_revenue.get('total_revenue', 0)
#             },
#             'pppoe': {
#                 **pppoe_analytics,
#                 'total_revenue': pppoe_revenue.get('total_revenue', 0)
#             },
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
#                     'hotspot': hotspot_revenue.get('total_revenue', 0),
#                     'pppoe': pppoe_revenue.get('total_revenue', 0)
#                 }
#             }
#         }
        
#         return Response(data, status=status.HTTP_200_OK)
    
#     def get_access_type_analytics(self, access_type):
#         if access_type == 'hotspot':
#             plans = InternetPlan.objects.filter(access_methods__hotspot__enabled=True)
#         elif access_type == 'pppoe':
#             plans = InternetPlan.objects.filter(access_methods__pppoe__enabled=True)
#         else:
#             plans = InternetPlan.objects.none()
        
#         subscriptions = Subscription.objects.filter(access_method=access_type)
        
#         return {
#             'total_plans': plans.count(),
#             'active_plans': plans.filter(active=True).count(),
#             'total_subscriptions': subscriptions.count(),
#             'active_subscriptions': subscriptions.filter(status='active').count(),
#             'category_distribution': list(plans.values('category').annotate(count=Count('id'))),
#             'popular_plans': list(plans.order_by('-purchases')[:5].values('id', 'name', 'purchases'))
#         }

# class RouterCompatibilityView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request, plan_id):
#         plan = get_object_or_404(InternetPlan, pk=plan_id)
        
#         if plan.router_specific:
#             routers = plan.allowed_routers.filter(status='connected', is_active=True)
#         else:
#             routers = Router.objects.filter(status='connected', is_active=True)
        
#         serializer = RouterSerializer(routers, many=True)
#         return Response(serializer.data, status=status.HTTP_200_OK)

# class ActivatePlanOnRouterView(APIView):
#     permission_classes = [IsAuthenticated]

#     def post(self, request, plan_id, router_id):
#         plan = get_object_or_404(InternetPlan, pk=plan_id)
#         router = get_object_or_404(Router, pk=router_id)
        
#         if not plan.can_be_used_on_router(router_id):
#             return Response(
#                 {'error': f'Plan "{plan.name}" cannot be used on router "{router.name}"'},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
        
#         if router.status != 'connected':
#             return Response(
#                 {'error': f'Router "{router.name}" is not connected'},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
        
#         if not plan.has_enabled_access_methods():
#             return Response(
#                 {'error': f'Plan "{plan.name}" has no enabled access methods'},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
        
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
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
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

# class PublicPlanTemplateListView(APIView):
#     permission_classes = [AllowAny]

#     def get(self, request):
#         try:
#             queryset = PlanTemplate.objects.filter(
#                 is_public=True, 
#                 is_active=True
#             ).order_by('name')
            
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
#             logger.error(f"Failed to load public templates: {e}")
#             return Response(
#                 {'error': 'Failed to load templates', 'details': str(e)}, 
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )

























from django.shortcuts import get_object_or_404
from django.db.models import Q, Count
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
from internet_plans.serializers.client_serializers import ClientPlanSerializer
import logging

logger = logging.getLogger(__name__)

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

class PlanTemplateListCreateView(APIView):
    pagination_class = StandardResultsSetPagination
    permission_classes = [IsAuthenticated]

    def get(self, request):
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
        if category := request.query_params.get('category'):
            queryset = queryset.filter(category=category)
        
        if search := request.query_params.get('search'):
            queryset = queryset.filter(
                Q(name__icontains=search) | Q(description__icontains=search)
            )
        
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
        
        if visibility := request.query_params.get('visibility'):
            if visibility == 'public':
                queryset = queryset.filter(is_public=True)
            elif visibility == 'private':
                queryset = queryset.filter(is_public=False)
        
        return queryset

    def apply_sorting(self, queryset, request):
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
        template.delete()
        return Response(
            {'message': 'Template deleted successfully'}, 
            status=status.HTTP_204_NO_CONTENT
        )

class CreatePlanFromTemplateView(APIView):
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
                    'priority_level': request.data.get('priority_level', 4),
                    'router_specific': request.data.get('router_specific', False),
                    'FUP_policy': request.data.get('FUP_policy', ''),
                    'FUP_threshold': request.data.get('FUP_threshold', 80),
                    'template_id': template.id,
                }

                if 'allowed_routers_ids' in request.data:
                    plan_data['allowed_routers_ids'] = request.data['allowed_routers_ids']

                serializer = InternetPlanSerializer(data=plan_data, context={'request': request})
                if serializer.is_valid():
                    plan = serializer.save()
                    
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
            logger.error(f"Failed to create plan from template: {e}")
            return Response({
                'error': 'Failed to create plan from template',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class InternetPlanListCreateView(APIView):
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
        if category := request.query_params.get('category'):
            queryset = queryset.filter(category=category)
        
        if plan_type := request.query_params.get('planType'):
            queryset = queryset.filter(plan_type=plan_type)
        
        if (active := request.query_params.get('active')) is not None:
            queryset = queryset.filter(active=active.lower() == 'true')
        
        if search := request.query_params.get('search'):
            queryset = queryset.filter(
                Q(name__icontains=search) | Q(description__icontains=search)
            )
        
        if access_type := request.query_params.get('access_type'):
            if access_type == 'hotspot':
                queryset = queryset.filter(access_methods__hotspot__enabled=True)
            elif access_type == 'pppoe':
                queryset = queryset.filter(access_methods__pppoe__enabled=True)
        
        if template_id := request.query_params.get('template_id'):
            queryset = queryset.filter(template_id=template_id)
        
        return queryset

    def apply_sorting(self, queryset, request):
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
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            # Use database JSON queries to filter hotspot-enabled plans efficiently
            queryset = InternetPlan.objects.filter(
                active=True,
                access_methods__hotspot__enabled=True
            )
            
            # Apply additional filters
            access_type = request.query_params.get('access_type')
            if access_type == 'pppoe':
                queryset = queryset.filter(
                    access_methods__pppoe__enabled=True
                )
            
            if category := request.query_params.get('category'):
                queryset = queryset.filter(category=category)
            
            serializer = ClientPlanSerializer(queryset, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Failed to load public plans: {e}")
            return Response(
                {'error': 'Failed to load plans', 'details': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )