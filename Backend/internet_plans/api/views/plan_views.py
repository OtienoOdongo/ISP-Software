# """
# Internet Plans - Plan Views with Time Variant Support
# API views for Internet Plan management with time-based availability
# Production-ready with comprehensive error handling
# """

# from django.shortcuts import get_object_or_404
# from django.db.models import Q, Count, Sum, Avg
# from django.utils import timezone
# from django.db import transaction
# from django.core.cache import cache
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
# from rest_framework.pagination import PageNumberPagination
# from rest_framework import status
# from rest_framework.throttling import UserRateThrottle
# import logging
# from datetime import datetime, timedelta

# from internet_plans.models.plan_models import InternetPlan, TimeVariantConfig, PlanTemplate
# from internet_plans.serializers.plan_serializers import (
#     InternetPlanSerializer,
#     InternetPlanCreateSerializer,
#     InternetPlanUpdateSerializer,
#     InternetPlanDetailSerializer,
#     PlanCompatibilitySerializer,
#     PlanAvailabilityCheckSerializer,
#     AvailablePlansRequestSerializer,
#     TimeVariantConfigSerializer
# )
# from internet_plans.services.plan_service import PlanService
# from internet_plans.services.pricing_service import PricingService
# from internet_plans.utils.formatters import format_plan_summary


# logger = logging.getLogger(__name__)


# class StandardPagination(PageNumberPagination):
#     """Standard pagination class"""
#     page_size = 20
#     page_size_query_param = 'page_size'
#     max_page_size = 100
    
#     def get_paginated_response(self, data):
#         return Response({
#             'success': True,
#             'count': self.page.paginator.count,
#             'next': self.get_next_link(),
#             'previous': self.get_previous_link(),
#             'results': data,
#             'page': self.page.number,
#             'total_pages': self.page.paginator.num_pages
#         })


# class InternetPlanListView(APIView):
#     """
#     List and create Internet Plans with Time Variant Support
#     GET: List plans with filtering (including time availability)
#     POST: Create new plan with time variant
#     """
    
#     permission_classes = [IsAuthenticated]
#     pagination_class = StandardPagination
#     throttle_classes = [UserRateThrottle]
    
#     def get(self, request):
#         """Get list of plans with filtering"""
#         try:
#             # Use PlanService for efficient querying
#             filters = self._extract_filters(request)
#             page = int(request.query_params.get('page', 1))
#             page_size = int(request.query_params.get('page_size', 20))
            
#             result = PlanService.get_plans_by_filters(filters, page, page_size)
            
#             # Add time variant info to each plan
#             for plan in result['plans']:
#                 plan.time_variant_info = plan.get_time_variant_summary()
#                 plan.availability_info = plan.is_available_for_client()
            
#             # Serialize plans
#             serializer = InternetPlanSerializer(result['plans'], many=True, context={'request': request})
            
#             return Response({
#                 'success': True,
#                 'count': result['total_count'],
#                 'next': f"?page={page + 1}&page_size={page_size}" if page < result['total_pages'] else None,
#                 'previous': f"?page={page - 1}&page_size={page_size}" if page > 1 else None,
#                 'results': serializer.data,
#                 'page': page,
#                 'page_size': page_size,
#                 'total_pages': result['total_pages'],
#                 'filters_applied': filters
#             })
            
#         except Exception as e:
#             logger.error(f"Failed to get plans: {e}")
#             return Response({
#                 'success': False,
#                 'error': 'Failed to load plans',
#                 'details': str(e) if request.user.is_staff else None
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
#     def post(self, request):
#         """Create new plan with time variant support"""
#         if not request.user.is_staff:
#             return Response({
#                 'success': False,
#                 'error': 'Permission denied'
#             }, status=status.HTTP_403_FORBIDDEN)
        
#         try:
#             # Check for duplicate name
#             plan_name = request.data.get('name', '')
#             if plan_name and InternetPlan.objects.filter(name=plan_name).exists():
#                 return Response({
#                     'success': False,
#                     'error': f'A plan with the name "{plan_name}" already exists'
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             serializer = InternetPlanCreateSerializer(
#                 data=request.data,
#                 context={'request': request}
#             )
            
#             if not serializer.is_valid():
#                 return Response({
#                     'success': False,
#                     'error': 'Validation failed',
#                     'details': serializer.errors
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             with transaction.atomic():
#                 plan = serializer.save()
                
#                 # Emit signal
#                 from internet_plans.signals.plan_signals import plan_created
#                 plan_created.send(
#                     sender=InternetPlan,
#                     plan_id=str(plan.id),
#                     plan_name=plan.name,
#                     plan_type=plan.plan_type,
#                     price=plan.price,
#                     category=plan.category,
#                     access_methods=plan.get_enabled_access_methods(),
#                     has_time_variant=plan.has_time_variant(),
#                     created_by=request.user.username,
#                     timestamp=plan.created_at
#                 )
                
#                 logger.info(f"Plan created: {plan.name} by {request.user.username}")
                
#                 return Response({
#                     'success': True,
#                     'message': 'Plan created successfully',
#                     'plan': InternetPlanSerializer(plan, context={'request': request}).data
#                 }, status=status.HTTP_201_CREATED)
            
#         except Exception as e:
#             logger.error(f"Failed to create plan: {e}")
#             return Response({
#                 'success': False,
#                 'error': 'Failed to create plan',
#                 'details': str(e) if request.user.is_staff else None
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
#     def _extract_filters(self, request):
#         """Extract and validate filters from request"""
#         filters = {}
        
#         # Active filter
#         if active := request.query_params.get('active'):
#             filters['active'] = active.lower() == 'true'
        
#         # Category filter
#         if category := request.query_params.get('category'):
#             filters['category'] = category
        
#         # Plan type filter
#         if plan_type := request.query_params.get('plan_type'):
#             filters['plan_type'] = plan_type
        
#         # Access method filter
#         if access_method := request.query_params.get('access_method'):
#             filters['access_method'] = access_method
        
#         # Time variant filter
#         if time_variant := request.query_params.get('time_variant'):
#             if time_variant.lower() == 'active':
#                 filters['has_time_variant'] = True
#             elif time_variant.lower() == 'inactive':
#                 filters['has_time_variant'] = False
        
#         # Availability filter
#         if available_now := request.query_params.get('available_now'):
#             filters['available_now'] = available_now.lower() == 'true'
        
#         # Search filter
#         if search := request.query_params.get('search'):
#             filters['search'] = search
        
#         # Price range filter
#         if min_price := request.query_params.get('min_price'):
#             try:
#                 filters['min_price'] = float(min_price)
#             except (ValueError, TypeError):
#                 pass
        
#         if max_price := request.query_params.get('max_price'):
#             try:
#                 filters['max_price'] = float(max_price)
#             except (ValueError, TypeError):
#                 pass
        
#         # Template filter
#         if template_id := request.query_params.get('template_id'):
#             filters['template_id'] = template_id
        
#         # Sorting
#         if sort_by := request.query_params.get('sort_by'):
#             filters['sort_by'] = sort_by
        
#         if sort_order := request.query_params.get('sort_order'):
#             filters['sort_order'] = sort_order
        
#         return filters


# class InternetPlanDetailView(APIView):
#     """
#     Retrieve, update, or delete an Internet Plan with Time Variant
#     """
    
#     permission_classes = [IsAuthenticated]
#     throttle_classes = [UserRateThrottle]
    
#     def get(self, request, plan_id):
#         """Get plan details with time variant info"""
#         try:
#             # Use caching
#             plan = PlanService.get_plan_with_cache(plan_id)
            
#             if not plan:
#                 return Response({
#                     'success': False,
#                     'error': 'Plan not found'
#                 }, status=status.HTTP_404_NOT_FOUND)
            
#             # Check permissions for inactive plans
#             if not plan.active and not request.user.is_staff:
#                 return Response({
#                     'success': False,
#                     'error': 'Plan not available'
#                 }, status=status.HTTP_404_NOT_FOUND)
            
#             serializer = InternetPlanDetailSerializer(plan, context={'request': request})
            
#             # Add pricing information
#             pricing_info = PricingService.get_pricing_options(plan)
            
#             # Add time variant availability
#             availability = plan.is_available_for_client()
            
#             response_data = {
#                 'success': True,
#                 'plan': serializer.data,
#                 'pricing_options': pricing_info,
#                 'summary': format_plan_summary(plan),
#                 'availability': availability,
#                 'compatibility': {
#                     'supported_access_methods': plan.get_enabled_access_methods(),
#                     'router_specific': plan.router_specific,
#                     'allowed_routers_count': plan.allowed_routers.count() if plan.router_specific else 'All'
#                 }
#             }
            
#             return Response(response_data)
            
#         except Exception as e:
#             logger.error(f"Failed to get plan {plan_id}: {e}")
#             return Response({
#                 'success': False,
#                 'error': 'Failed to load plan details'
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
#     def put(self, request, plan_id):
#         """Update plan with time variant support"""
#         if not request.user.is_staff:
#             return Response({
#                 'success': False,
#                 'error': 'Permission denied'
#             }, status=status.HTTP_403_FORBIDDEN)
        
#         try:
#             plan = get_object_or_404(InternetPlan, id=plan_id)
            
#             # Check for duplicate name
#             new_name = request.data.get('name')
#             if new_name and new_name != plan.name:
#                 if InternetPlan.objects.filter(name=new_name).exclude(id=plan_id).exists():
#                     return Response({
#                         'success': False,
#                         'error': f'A plan with the name "{new_name}" already exists'
#                     }, status=status.HTTP_400_BAD_REQUEST)
            
#             serializer = InternetPlanUpdateSerializer(
#                 plan, 
#                 data=request.data, 
#                 partial=True,
#                 context={'request': request}
#             )
            
#             if not serializer.is_valid():
#                 return Response({
#                     'success': False,
#                     'error': 'Validation failed',
#                     'details': serializer.errors
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             # Track price changes
#             old_price = plan.price
            
#             with transaction.atomic():
#                 updated_plan = serializer.save()
                
#                 # Emit price change signal if price changed
#                 if old_price != updated_plan.price:
#                     from internet_plans.signals.plan_signals import plan_price_changed
#                     plan_price_changed.send(
#                         sender=InternetPlan,
#                         plan_id=str(plan_id),
#                         old_price=old_price,
#                         new_price=updated_plan.price,
#                         changed_by=request.user.username,
#                         reason=request.data.get('price_change_reason', 'Price updated'),
#                         timestamp=timezone.now()
#                     )
                
#                 # Emit update signal
#                 from internet_plans.signals.plan_signals import plan_updated
#                 plan_updated.send(
#                     sender=InternetPlan,
#                     plan_id=str(plan_id),
#                     plan_name=updated_plan.name,
#                     changes=serializer.validated_data,
#                     updated_by=request.user.username,
#                     timestamp=timezone.now()
#                 )
                
#                 logger.info(f"Plan updated: {plan_id} by {request.user.username}")
                
#                 return Response({
#                     'success': True,
#                     'message': 'Plan updated successfully',
#                     'plan': InternetPlanSerializer(updated_plan, context={'request': request}).data
#                 })
            
#         except Exception as e:
#             logger.error(f"Failed to update plan {plan_id}: {e}")
#             return Response({
#                 'success': False,
#                 'error': 'Failed to update plan',
#                 'details': str(e) if request.user.is_staff else None
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
#     def delete(self, request, plan_id):
#         """Delete (deactivate) plan"""
#         if not request.user.is_staff:
#             return Response({
#                 'success': False,
#                 'error': 'Permission denied'
#             }, status=status.HTTP_403_FORBIDDEN)
        
#         try:
#             plan = get_object_or_404(InternetPlan, id=plan_id)
            
#             # Check if plan has active subscriptions
#             from service_operations.models.subscription_models import Subscription
#             active_subs = Subscription.objects.filter(
#                 internet_plan=plan,
#                 status='active',
#                 is_active=True
#             ).exists()
            
#             if active_subs:
#                 return Response({
#                     'success': False,
#                     'error': 'Cannot deactivate plan with active subscriptions'
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             # Soft delete (deactivate)
#             plan.active = False
#             plan.save()
            
#             # Clear cache
#             cache.delete(f"internet_plan:{plan_id}")
#             cache.delete_pattern("internet_plans:*")
            
#             # Emit deactivation signal
#             from internet_plans.signals.plan_signals import plan_deactivated
#             plan_deactivated.send(
#                 sender=InternetPlan,
#                 plan_id=str(plan_id),
#                 plan_name=plan.name,
#                 deactivated_by=request.user.username,
#                 reason=request.data.get('reason', 'Plan deactivated'),
#                 timestamp=timezone.now()
#             )
            
#             logger.info(f"Plan deactivated: {plan_id} by {request.user.username}")
            
#             return Response({
#                 'success': True,
#                 'message': 'Plan deactivated successfully'
#             })
            
#         except Exception as e:
#             logger.error(f"Failed to deactivate plan {plan_id}: {e}")
#             return Response({
#                 'success': False,
#                 'error': 'Failed to deactivate plan'
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# class TimeVariantConfigView(APIView):
#     """
#     Manage Time Variant Configurations
#     """
    
#     permission_classes = [IsAuthenticated]
#     throttle_classes = [UserRateThrottle]
    
#     def get(self, request, config_id=None):
#         """Get time variant configuration(s)"""
#         if not request.user.is_staff:
#             return Response({
#                 'success': False,
#                 'error': 'Permission denied'
#             }, status=status.HTTP_403_FORBIDDEN)
        
#         try:
#             if config_id:
#                 # Get specific configuration
#                 config = get_object_or_404(TimeVariantConfig, id=config_id)
#                 serializer = TimeVariantConfigSerializer(config, context={'request': request})
                
#                 # Add usage information
#                 usage_info = {
#                     'used_by_plans': InternetPlan.objects.filter(time_variant=config).count(),
#                     'used_by_templates': PlanTemplate.objects.filter(time_variant=config).count()
#                 }
                
#                 return Response({
#                     'success': True,
#                     'config': serializer.data,
#                     'usage': usage_info
#                 })
            
#             else:
#                 # List all configurations with filtering
#                 queryset = TimeVariantConfig.objects.all()
                
#                 # Apply filters
#                 is_active = request.query_params.get('is_active')
#                 if is_active is not None:
#                     queryset = queryset.filter(is_active=is_active.lower() == 'true')
                
#                 search = request.query_params.get('search')
#                 if search:
#                     queryset = queryset.filter(
#                         Q(id__icontains=search)
#                     )
                
#                 # Paginate
#                 paginator = StandardPagination()
#                 page = paginator.paginate_queryset(queryset, request)
                
#                 serializer = TimeVariantConfigSerializer(page, many=True, context={'request': request})
                
#                 return paginator.get_paginated_response(serializer.data)
            
#         except Exception as e:
#             logger.error(f"Failed to get time variant configs: {e}")
#             return Response({
#                 'success': False,
#                 'error': 'Failed to load configurations',
#                 'details': str(e) if request.user.is_staff else None
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
#     def post(self, request):
#         """Create new time variant configuration"""
#         if not request.user.is_staff:
#             return Response({
#                 'success': False,
#                 'error': 'Permission denied'
#             }, status=status.HTTP_403_FORBIDDEN)
        
#         try:
#             serializer = TimeVariantConfigSerializer(
#                 data=request.data,
#                 context={'request': request}
#             )
            
#             if not serializer.is_valid():
#                 return Response({
#                     'success': False,
#                     'error': 'Validation failed',
#                     'details': serializer.errors
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             config = serializer.save()
            
#             logger.info(f"Time variant config created: {config.id} by {request.user.username}")
            
#             return Response({
#                 'success': True,
#                 'message': 'Time variant configuration created successfully',
#                 'config': TimeVariantConfigSerializer(config, context={'request': request}).data
#             }, status=status.HTTP_201_CREATED)
            
#         except Exception as e:
#             logger.error(f"Failed to create time variant config: {e}")
#             return Response({
#                 'success': False,
#                 'error': 'Failed to create configuration',
#                 'details': str(e) if request.user.is_staff else None
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
#     def put(self, request, config_id):
#         """Update time variant configuration"""
#         if not request.user.is_staff:
#             return Response({
#                 'success': False,
#                 'error': 'Permission denied'
#             }, status=status.HTTP_403_FORBIDDEN)
        
#         try:
#             config = get_object_or_404(TimeVariantConfig, id=config_id)
            
#             serializer = TimeVariantConfigSerializer(
#                 config,
#                 data=request.data,
#                 partial=True,
#                 context={'request': request}
#             )
            
#             if not serializer.is_valid():
#                 return Response({
#                     'success': False,
#                     'error': 'Validation failed',
#                     'details': serializer.errors
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             updated_config = serializer.save()
            
#             # Clear related plan caches
#             plan_ids = InternetPlan.objects.filter(time_variant=config).values_list('id', flat=True)
#             for plan_id in plan_ids:
#                 cache.delete(f"internet_plan:{plan_id}")
#             cache.delete_pattern("available_plans:*")
            
#             logger.info(f"Time variant config updated: {config_id} by {request.user.username}")
            
#             return Response({
#                 'success': True,
#                 'message': 'Time variant configuration updated successfully',
#                 'config': TimeVariantConfigSerializer(updated_config, context={'request': request}).data
#             })
            
#         except Exception as e:
#             logger.error(f"Failed to update time variant config {config_id}: {e}")
#             return Response({
#                 'success': False,
#                 'error': 'Failed to update configuration',
#                 'details': str(e) if request.user.is_staff else None
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
#     def delete(self, request, config_id):
#         """Delete time variant configuration"""
#         if not request.user.is_staff:
#             return Response({
#                 'success': False,
#                 'error': 'Permission denied'
#             }, status=status.HTTP_403_FORBIDDEN)
        
#         try:
#             config = get_object_or_404(TimeVariantConfig, id=config_id)
            
#             # Check if config is in use
#             plan_count = InternetPlan.objects.filter(time_variant=config).count()
#             template_count = PlanTemplate.objects.filter(time_variant=config).count()
            
#             if plan_count > 0 or template_count > 0:
#                 return Response({
#                     'success': False,
#                     'error': f'Cannot delete configuration used by {plan_count} plan(s) and {template_count} template(s)',
#                     'usage': {
#                         'plans': plan_count,
#                         'templates': template_count
#                     }
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             config.delete()
            
#             logger.info(f"Time variant config deleted: {config_id} by {request.user.username}")
            
#             return Response({
#                 'success': True,
#                 'message': 'Time variant configuration deleted successfully'
#             })
            
#         except Exception as e:
#             logger.error(f"Failed to delete time variant config {config_id}: {e}")
#             return Response({
#                 'success': False,
#                 'error': 'Failed to delete configuration'
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# class PlanAvailabilityCheckView(APIView):
#     """
#     Check plan availability for clients
#     """
    
#     permission_classes = [AllowAny]  # Allow access from captive portal
#     throttle_classes = [UserRateThrottle]
    
#     def post(self, request):
#         """Check plan availability"""
#         try:
#             serializer = PlanAvailabilityCheckSerializer(data=request.data)
            
#             if not serializer.is_valid():
#                 return Response({
#                     'success': False,
#                     'error': 'Validation failed',
#                     'details': serializer.errors
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             result = serializer.get_availability_result()
            
#             return Response({
#                 'success': True,
#                 'data': result
#             })
            
#         except Exception as e:
#             logger.error(f"Failed to check plan availability: {e}")
#             return Response({
#                 'success': False,
#                 'error': 'Failed to check availability',
#                 'timestamp': timezone.now().isoformat()
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# class AvailablePlansView(APIView):
#     """
#     Get available plans for clients (for captive portal)
#     """
    
#     permission_classes = [AllowAny]  # Allow access from captive portal
#     throttle_classes = [UserRateThrottle]
    
#     def post(self, request):
#         """Get available plans based on client type and filters"""
#         try:
#             serializer = AvailablePlansRequestSerializer(data=request.data)
            
#             if not serializer.is_valid():
#                 return Response({
#                     'success': False,
#                     'error': 'Validation failed',
#                     'details': serializer.errors
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             result = serializer.get_available_plans()
            
#             return Response({
#                 'success': True,
#                 'data': result
#             })
            
#         except Exception as e:
#             logger.error(f"Failed to get available plans: {e}")
#             return Response({
#                 'success': False,
#                 'error': 'Failed to get available plans',
#                 'timestamp': timezone.now().isoformat()
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
#     def get(self, request):
#         """Get available plans with query parameters (for GET requests)"""
#         try:
#             # Convert GET parameters to serializer data
#             data = {
#                 'client_type': request.query_params.get('client_type', 'hotspot'),
#                 'router_id': request.query_params.get('router_id'),
#                 'category': request.query_params.get('category'),
#                 'max_price': request.query_params.get('max_price'),
#                 'include_unavailable': request.query_params.get('include_unavailable', 'false').lower() == 'true'
#             }
            
#             # Remove None values
#             data = {k: v for k, v in data.items() if v is not None}
            
#             serializer = AvailablePlansRequestSerializer(data=data)
            
#             if not serializer.is_valid():
#                 return Response({
#                     'success': False,
#                     'error': 'Validation failed',
#                     'details': serializer.errors
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             result = serializer.get_available_plans()
            
#             return Response({
#                 'success': True,
#                 'data': result
#             })
            
#         except Exception as e:
#             logger.error(f"Failed to get available plans: {e}")
#             return Response({
#                 'success': False,
#                 'error': 'Failed to get available plans',
#                 'timestamp': timezone.now().isoformat()
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# class PublicInternetPlanListView(APIView):
#     """
#     Public API for listing available Internet Plans
#     No authentication required
#     """
    
#     permission_classes = [AllowAny]
#     throttle_classes = [UserRateThrottle]
    
#     def get(self, request):
#         """Get public list of available plans"""
#         try:
#             # Determine client type from request (default to hotspot)
#             client_type = request.query_params.get('client_type', 'hotspot')
            
#             # Cache key
#             cache_key = f"public_available_plans:{client_type}:{request.GET.urlencode()}"
#             cached_data = cache.get(cache_key)
            
#             if cached_data:
#                 return Response(cached_data)
            
#             # Use AvailablePlansRequestSerializer for consistency
#             data = {
#                 'client_type': client_type,
#                 'router_id': request.query_params.get('router_id'),
#                 'category': request.query_params.get('category'),
#                 'max_price': request.query_params.get('max_price'),
#                 'include_unavailable': False  # Public API only shows available plans
#             }
            
#             # Remove None values
#             data = {k: v for k, v in data.items() if v is not None}
            
#             serializer = AvailablePlansRequestSerializer(data=data, context={'request': request})
            
#             if not serializer.is_valid():
#                 return Response({
#                     'success': False,
#                     'error': 'Validation failed',
#                     'details': serializer.errors
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             result = serializer.get_available_plans()
            
#             response_data = {
#                 'success': True,
#                 'count': result['count'],
#                 'client_type': client_type,
#                 'plans': result['plans'],
#                 'timestamp': timezone.now().isoformat()
#             }
            
#             # Cache for 1 minute (time-sensitive)
#             cache.set(cache_key, response_data, 60)
            
#             return Response(response_data)
            
#         except Exception as e:
#             logger.error(f"Failed to get public plans: {e}")
#             return Response({
#                 'success': False,
#                 'error': 'Failed to load plans',
#                 'timestamp': timezone.now().isoformat()
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# class PlanStatisticsView(APIView):
#     """
#     Get statistics about plans
#     """
    
#     permission_classes = [IsAuthenticated]
    
#     def get(self, request):
#         """Get plan statistics including time variant stats"""
#         try:
#             stats = PlanService.get_plan_statistics()
            
#             if 'error' in stats:
#                 return Response({
#                     'success': False,
#                     'error': stats['error']
#                 }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
#             # Add time variant statistics
#             time_variant_stats = {
#                 'plans_with_time_variant': InternetPlan.objects.filter(
#                     active=True,
#                     time_variant__is_active=True
#                 ).count(),
#                 'time_variant_configs': TimeVariantConfig.objects.filter(is_active=True).count(),
#                 'availability_by_time': self._get_availability_stats()
#             }
            
#             stats['time_variant'] = time_variant_stats
            
#             return Response({
#                 'success': True,
#                 'statistics': stats
#             })
            
#         except Exception as e:
#             logger.error(f"Failed to get plan statistics: {e}")
#             return Response({
#                 'success': False,
#                 'error': 'Failed to get statistics',
#                 'timestamp': timezone.now().isoformat()
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
#     def _get_availability_stats(self):
#         """Get availability statistics"""
#         now = timezone.now()
#         current_hour = now.hour
#         current_day = now.strftime('%a').lower()[:3]
        
#         # Count plans available now
#         available_now = 0
#         total_with_time_variant = 0
        
#         plans_with_time_variant = InternetPlan.objects.filter(
#             active=True,
#             time_variant__is_active=True
#         ).select_related('time_variant')
        
#         for plan in plans_with_time_variant:
#             total_with_time_variant += 1
#             if plan.time_variant.is_available_now():
#                 available_now += 1
        
#         return {
#             'available_now': available_now,
#             'total_with_time_variant': total_with_time_variant,
#             'percentage_available': (available_now / total_with_time_variant * 100) if total_with_time_variant > 0 else 0,
#             'current_time': now.isoformat(),
#             'current_hour': current_hour,
#             'current_day': current_day
#         }


# class PlanCompatibilityCheckView(APIView):
#     """
#     Check plan compatibility
#     """
    
#     permission_classes = [IsAuthenticated]
#     throttle_classes = [UserRateThrottle]
    
#     def post(self, request):
#         """Check plan compatibility including time availability"""
#         try:
#             serializer = PlanCompatibilitySerializer(data=request.data)
            
#             if not serializer.is_valid():
#                 return Response({
#                     'success': False,
#                     'error': 'Validation failed',
#                     'details': serializer.errors
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             result = serializer.get_compatibility_result()
            
#             if not result:
#                 return Response({
#                     'success': False,
#                     'error': 'Failed to check compatibility'
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             return Response({
#                 'success': True,
#                 'compatibility': result
#             })
            
#         except Exception as e:
#             logger.error(f"Failed to check plan compatibility: {e}")
#             return Response({
#                 'success': False,
#                 'error': 'Failed to check compatibility',
#                 'details': str(e) if request.user.is_staff else None
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# class PlanRecommendationView(APIView):
#     """
#     Get plan recommendations
#     """
    
#     permission_classes = [IsAuthenticated]
#     throttle_classes = [UserRateThrottle]
    
#     def get(self, request):
#         """Get plan recommendations considering availability"""
#         try:
#             # Extract parameters
#             client_type = request.query_params.get('client_type')
#             budget = request.query_params.get('budget')
#             access_method = request.query_params.get('access_method')
#             limit = int(request.query_params.get('limit', 5))
            
#             # Parse budget
#             budget_value = None
#             if budget:
#                 try:
#                     budget_value = float(budget)
#                 except ValueError:
#                     return Response({
#                         'success': False,
#                         'error': 'Invalid budget format'
#                     }, status=status.HTTP_400_BAD_REQUEST)
            
#             # Get recommendations
#             recommendations = PlanService.get_recommended_plans(
#                 client_type=client_type,
#                 budget=budget_value,
#                 access_method=access_method,
#                 limit=limit
#             )
            
#             # Filter by availability for the specific client type
#             filtered_recommendations = []
#             for rec in recommendations:
#                 plan_id = rec['id']
#                 plan = InternetPlan.get_cached_plan(plan_id)
#                 if plan:
#                     availability = plan.is_available_for_client()
#                     if availability['available']:
#                         rec['availability'] = availability
#                         filtered_recommendations.append(rec)
            
#             return Response({
#                 'success': True,
#                 'recommendations': filtered_recommendations,
#                 'criteria': {
#                     'client_type': client_type,
#                     'budget': budget_value,
#                     'access_method': access_method,
#                     'limit': limit
#                 },
#                 'timestamp': timezone.now().isoformat()
#             })
            
#         except Exception as e:
#             logger.error(f"Failed to get plan recommendations: {e}")
#             return Response({
#                 'success': False,
#                 'error': 'Failed to get recommendations',
#                 'timestamp': timezone.now().isoformat()
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# class TimeVariantTestView(APIView):
#     """
#     Test time variant configurations
#     """
    
#     permission_classes = [IsAdminUser]
#     throttle_classes = [UserRateThrottle]
    
#     def post(self, request):
#         """Test time variant configuration"""
#         try:
#             # Create a test time variant
#             test_data = {
#                 'is_active': True,
#                 'start_time': '09:00',
#                 'end_time': '17:00',
#                 'available_days': ['mon', 'tue', 'wed', 'thu', 'fri'],
#                 'timezone': 'Africa/Nairobi'
#             }
            
#             serializer = TimeVariantConfigSerializer(data=test_data)
            
#             if serializer.is_valid():
#                 config = serializer.save()
                
#                 # Test availability
#                 is_available = config.is_available_now()
#                 summary = config.get_availability_summary()
#                 next_available = config.get_next_available_time()
                
#                 return Response({
#                     'success': True,
#                     'test_config': serializer.data,
#                     'results': {
#                         'is_available_now': is_available,
#                         'summary': summary,
#                         'next_available_time': next_available
#                     },
#                     'current_time': timezone.now().isoformat(),
#                     'current_day': timezone.now().strftime('%A'),
#                     'current_time_local': timezone.now().strftime('%H:%M:%S')
#                 })
#             else:
#                 return Response({
#                     'success': False,
#                     'error': 'Test configuration invalid',
#                     'details': serializer.errors
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#         except Exception as e:
#             logger.error(f"Failed to test time variant: {e}")
#             return Response({
#                 'success': False,
#                 'error': 'Failed to test time variant',
#                 'details': str(e)
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)




# """
# Internet Plans - Plan Views with Time Variant Support
# API views for Internet Plan management with time-based availability
# Production-ready with comprehensive error handling
# FIXED: Removed signal emission code that was causing 500 errors
# """

# from django.shortcuts import get_object_or_404
# from django.db.models import Q, Count, Sum, Avg
# from django.utils import timezone
# from django.db import transaction
# from django.core.cache import cache
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
# from rest_framework.pagination import PageNumberPagination
# from rest_framework import status
# from rest_framework.throttling import UserRateThrottle
# import logging
# from datetime import datetime, timedelta

# from internet_plans.models.plan_models import InternetPlan, TimeVariantConfig, PlanTemplate
# from internet_plans.serializers.plan_serializers import (
#     InternetPlanSerializer,
#     InternetPlanCreateSerializer,
#     InternetPlanUpdateSerializer,
#     InternetPlanDetailSerializer,
#     PlanCompatibilitySerializer,
#     PlanAvailabilityCheckSerializer,
#     AvailablePlansRequestSerializer,
#     TimeVariantConfigSerializer
# )
# from internet_plans.utils.formatters import format_plan_summary

# logger = logging.getLogger(__name__)


# class StandardPagination(PageNumberPagination):
#     """Standard pagination class"""
#     page_size = 20
#     page_size_query_param = 'page_size'
#     max_page_size = 100
    
#     def get_paginated_response(self, data):
#         return Response({
#             'success': True,
#             'count': self.page.paginator.count,
#             'next': self.get_next_link(),
#             'previous': self.get_previous_link(),
#             'results': data,
#             'page': self.page.number,
#             'total_pages': self.page.paginator.num_pages
#         })


# class InternetPlanListView(APIView):
#     """
#     List and create Internet Plans with Time Variant Support
#     GET: List plans with filtering (including time availability)
#     POST: Create new plan with time variant
#     FIXED: Removed problematic signal emission
#     """
    
#     permission_classes = [IsAuthenticated]
#     pagination_class = StandardPagination
#     throttle_classes = [UserRateThrottle]
    
#     def get(self, request):
#         """Get list of plans with filtering"""
#         try:
#             # Use efficient querying
#             filters = self._extract_filters(request)
#             page = int(request.query_params.get('page', 1))
#             page_size = int(request.query_params.get('page_size', 20))
            
#             # Start with active plans
#             queryset = InternetPlan.objects.filter(active=True).select_related('time_variant')
            
#             # Apply filters
#             if filters.get('category'):
#                 queryset = queryset.filter(category=filters['category'])
            
#             if filters.get('plan_type'):
#                 queryset = queryset.filter(plan_type=filters['plan_type'])
            
#             if filters.get('access_method'):
#                 if filters['access_method'] == 'hotspot':
#                     queryset = queryset.filter(access_methods__hotspot__enabled=True)
#                 elif filters['access_method'] == 'pppoe':
#                     queryset = queryset.filter(access_methods__pppoe__enabled=True)
#                 elif filters['access_method'] == 'dual':
#                     queryset = queryset.filter(
#                         access_methods__hotspot__enabled=True,
#                         access_methods__pppoe__enabled=True
#                     )
            
#             if filters.get('has_time_variant') is not None:
#                 if filters['has_time_variant']:
#                     queryset = queryset.filter(time_variant__is_active=True)
#                 else:
#                     queryset = queryset.filter(Q(time_variant__isnull=True) | Q(time_variant__is_active=False))
            
#             if filters.get('available_now'):
#                 # This is complex and might be better handled in application logic
#                 # For now, we'll just return all and filter in application layer
#                 pass
            
#             if filters.get('search'):
#                 queryset = queryset.filter(
#                     Q(name__icontains=filters['search']) |
#                     Q(description__icontains=filters['search'])
#                 )
            
#             if filters.get('min_price') is not None:
#                 queryset = queryset.filter(price__gte=filters['min_price'])
            
#             if filters.get('max_price') is not None:
#                 queryset = queryset.filter(price__lte=filters['max_price'])
            
#             # Count and paginate
#             total_count = queryset.count()
#             total_pages = (total_count + page_size - 1) // page_size
            
#             # Apply sorting
#             sort_by = filters.get('sort_by', 'name')
#             sort_order = filters.get('sort_order', 'asc')
#             sort_field = f'-{sort_by}' if sort_order == 'desc' else sort_by
#             queryset = queryset.order_by(sort_field)
            
#             # Paginate manually for now
#             offset = (page - 1) * page_size
#             plans = list(queryset[offset:offset + page_size])
            
#             # Add time variant info to each plan
#             for plan in plans:
#                 plan.time_variant_info = plan.get_time_variant_summary()
#                 plan.availability_info = plan.is_available_for_client()
            
#             # Serialize plans
#             serializer = InternetPlanSerializer(plans, many=True, context={'request': request})
            
#             return Response({
#                 'success': True,
#                 'count': total_count,
#                 'next': f"?page={page + 1}&page_size={page_size}" if page < total_pages else None,
#                 'previous': f"?page={page - 1}&page_size={page_size}" if page > 1 else None,
#                 'results': serializer.data,
#                 'page': page,
#                 'page_size': page_size,
#                 'total_pages': total_pages,
#                 'filters_applied': filters
#             })
            
#         except Exception as e:
#             logger.error(f"Failed to get plans: {e}", exc_info=True)
#             return Response({
#                 'success': False,
#                 'error': 'Failed to load plans',
#                 'details': str(e) if request.user.is_staff else None
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
#     def post(self, request):
#         """Create new plan with time variant support - FIXED: No signal emission"""
#         if not request.user.is_staff:
#             return Response({
#                 'success': False,
#                 'error': 'Permission denied'
#             }, status=status.HTTP_403_FORBIDDEN)
        
#         try:
#             # Check for duplicate name
#             plan_name = request.data.get('name', '')
#             if plan_name and InternetPlan.objects.filter(name=plan_name).exists():
#                 return Response({
#                     'success': False,
#                     'error': f'A plan with the name "{plan_name}" already exists'
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             serializer = InternetPlanCreateSerializer(
#                 data=request.data,
#                 context={'request': request}
#             )
            
#             if not serializer.is_valid():
#                 return Response({
#                     'success': False,
#                     'error': 'Validation failed',
#                     'details': serializer.errors
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             with transaction.atomic():
#                 plan = serializer.save()
                
#                 # Log the creation instead of emitting signal
#                 logger.info(f"Plan created: {plan.name} (ID: {plan.id}) by {request.user.username}")
                
#                 return Response({
#                     'success': True,
#                     'message': 'Plan created successfully',
#                     'plan': InternetPlanSerializer(plan, context={'request': request}).data
#                 }, status=status.HTTP_201_CREATED)
            
#         except Exception as e:
#             logger.error(f"Failed to create plan: {e}", exc_info=True)
#             return Response({
#                 'success': False,
#                 'error': 'Failed to create plan',
#                 'details': str(e) if request.user.is_staff else None
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
#     def _extract_filters(self, request):
#         """Extract and validate filters from request"""
#         filters = {}
        
#         # Active filter
#         if active := request.query_params.get('active'):
#             filters['active'] = active.lower() == 'true'
        
#         # Category filter
#         if category := request.query_params.get('category'):
#             filters['category'] = category
        
#         # Plan type filter
#         if plan_type := request.query_params.get('plan_type'):
#             filters['plan_type'] = plan_type
        
#         # Access method filter
#         if access_method := request.query_params.get('access_method'):
#             filters['access_method'] = access_method
        
#         # Time variant filter
#         if time_variant := request.query_params.get('time_variant'):
#             if time_variant.lower() == 'active':
#                 filters['has_time_variant'] = True
#             elif time_variant.lower() == 'inactive':
#                 filters['has_time_variant'] = False
        
#         # Availability filter
#         if available_now := request.query_params.get('available_now'):
#             filters['available_now'] = available_now.lower() == 'true'
        
#         # Search filter
#         if search := request.query_params.get('search'):
#             filters['search'] = search
        
#         # Price range filter
#         if min_price := request.query_params.get('min_price'):
#             try:
#                 filters['min_price'] = float(min_price)
#             except (ValueError, TypeError):
#                 pass
        
#         if max_price := request.query_params.get('max_price'):
#             try:
#                 filters['max_price'] = float(max_price)
#             except (ValueError, TypeError):
#                 pass
        
#         # Template filter
#         if template_id := request.query_params.get('template_id'):
#             filters['template_id'] = template_id
        
#         # Sorting
#         if sort_by := request.query_params.get('sort_by'):
#             filters['sort_by'] = sort_by
        
#         if sort_order := request.query_params.get('sort_order'):
#             filters['sort_order'] = sort_order
        
#         return filters


# class InternetPlanDetailView(APIView):
#     """
#     Retrieve, update, or delete an Internet Plan with Time Variant
#     FIXED: Removed problematic signal emission
#     """
    
#     permission_classes = [IsAuthenticated]
#     throttle_classes = [UserRateThrottle]
    
#     def get(self, request, plan_id):
#         """Get plan details with time variant info"""
#         try:
#             # Get plan
#             plan = get_object_or_404(InternetPlan, id=plan_id)
            
#             # Check permissions for inactive plans
#             if not plan.active and not request.user.is_staff:
#                 return Response({
#                     'success': False,
#                     'error': 'Plan not available'
#                 }, status=status.HTTP_404_NOT_FOUND)
            
#             serializer = InternetPlanDetailSerializer(plan, context={'request': request})
            
#             # Add pricing information
#             from internet_plans.services.pricing_service import PricingService
#             pricing_info = PricingService.get_pricing_options(plan) if hasattr(PricingService, 'get_pricing_options') else {}
            
#             # Add time variant availability
#             availability = plan.is_available_for_client()
            
#             response_data = {
#                 'success': True,
#                 'plan': serializer.data,
#                 'pricing_options': pricing_info,
#                 'summary': format_plan_summary(plan) if hasattr(format_plan_summary, '__call__') else {},
#                 'availability': availability,
#                 'compatibility': {
#                     'supported_access_methods': plan.get_enabled_access_methods(),
#                     'router_specific': plan.router_specific,
#                     'allowed_routers_count': plan.allowed_routers.count() if plan.router_specific else 'All'
#                 }
#             }
            
#             return Response(response_data)
            
#         except InternetPlan.DoesNotExist:
#             return Response({
#                 'success': False,
#                 'error': 'Plan not found'
#             }, status=status.HTTP_404_NOT_FOUND)
#         except Exception as e:
#             logger.error(f"Failed to get plan {plan_id}: {e}", exc_info=True)
#             return Response({
#                 'success': False,
#                 'error': 'Failed to load plan details'
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
#     def put(self, request, plan_id):
#         """Update plan with time variant support - FIXED: No signal emission"""
#         if not request.user.is_staff:
#             return Response({
#                 'success': False,
#                 'error': 'Permission denied'
#             }, status=status.HTTP_403_FORBIDDEN)
        
#         try:
#             plan = get_object_or_404(InternetPlan, id=plan_id)
            
#             # Check for duplicate name
#             new_name = request.data.get('name')
#             if new_name and new_name != plan.name:
#                 if InternetPlan.objects.filter(name=new_name).exclude(id=plan_id).exists():
#                     return Response({
#                         'success': False,
#                         'error': f'A plan with the name "{new_name}" already exists'
#                     }, status=status.HTTP_400_BAD_REQUEST)
            
#             serializer = InternetPlanUpdateSerializer(
#                 plan, 
#                 data=request.data, 
#                 partial=True,
#                 context={'request': request}
#             )
            
#             if not serializer.is_valid():
#                 return Response({
#                     'success': False,
#                     'error': 'Validation failed',
#                     'details': serializer.errors
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             # Track price changes
#             old_price = plan.price
            
#             with transaction.atomic():
#                 updated_plan = serializer.save()
                
#                 # Log price change instead of emitting signal
#                 if old_price != updated_plan.price:
#                     logger.info(
#                         f"Plan price changed: {plan_id} - {old_price} to {updated_plan.price} "
#                         f"by {request.user.username}"
#                     )
                
#                 # Log update instead of emitting signal
#                 logger.info(f"Plan updated: {plan_id} by {request.user.username}")
                
#                 return Response({
#                     'success': True,
#                     'message': 'Plan updated successfully',
#                     'plan': InternetPlanSerializer(updated_plan, context={'request': request}).data
#                 })
            
#         except InternetPlan.DoesNotExist:
#             return Response({
#                 'success': False,
#                 'error': 'Plan not found'
#             }, status=status.HTTP_404_NOT_FOUND)
#         except Exception as e:
#             logger.error(f"Failed to update plan {plan_id}: {e}", exc_info=True)
#             return Response({
#                 'success': False,
#                 'error': 'Failed to update plan',
#                 'details': str(e) if request.user.is_staff else None
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
#     def delete(self, request, plan_id):
#         """Delete (deactivate) plan - FIXED: No signal emission"""
#         if not request.user.is_staff:
#             return Response({
#                 'success': False,
#                 'error': 'Permission denied'
#             }, status=status.HTTP_403_FORBIDDEN)
        
#         try:
#             plan = get_object_or_404(InternetPlan, id=plan_id)
            
#             # Check if plan has active subscriptions
#             try:
#                 from service_operations.models.subscription_models import Subscription
#                 active_subs = Subscription.objects.filter(
#                     internet_plan=plan,
#                     status='active',
#                     is_active=True
#                 ).exists()
                
#                 if active_subs:
#                     return Response({
#                         'success': False,
#                         'error': 'Cannot deactivate plan with active subscriptions'
#                     }, status=status.HTTP_400_BAD_REQUEST)
#             except ImportError:
#                 # Subscription model not available, proceed with caution
#                 logger.warning("Subscription model not available, skipping subscription check")
            
#             # Soft delete (deactivate)
#             plan.active = False
#             plan.save()
            
#             # Clear cache
#             cache.delete(f"internet_plan:{plan_id}")
#             cache.delete_pattern("internet_plans:*")
            
#             # Log deactivation instead of emitting signal
#             logger.info(f"Plan deactivated: {plan_id} by {request.user.username}")
            
#             return Response({
#                 'success': True,
#                 'message': 'Plan deactivated successfully'
#             })
            
#         except InternetPlan.DoesNotExist:
#             return Response({
#                 'success': False,
#                 'error': 'Plan not found'
#             }, status=status.HTTP_404_NOT_FOUND)
#         except Exception as e:
#             logger.error(f"Failed to deactivate plan {plan_id}: {e}", exc_info=True)
#             return Response({
#                 'success': False,
#                 'error': 'Failed to deactivate plan'
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# class TimeVariantConfigView(APIView):
#     """
#     Manage Time Variant Configurations
#     """
    
#     permission_classes = [IsAuthenticated]
#     throttle_classes = [UserRateThrottle]
    
#     def get(self, request, config_id=None):
#         """Get time variant configuration(s)"""
#         if not request.user.is_staff:
#             return Response({
#                 'success': False,
#                 'error': 'Permission denied'
#             }, status=status.HTTP_403_FORBIDDEN)
        
#         try:
#             if config_id:
#                 # Get specific configuration
#                 config = get_object_or_404(TimeVariantConfig, id=config_id)
#                 serializer = TimeVariantConfigSerializer(config, context={'request': request})
                
#                 # Add usage information
#                 usage_info = {
#                     'used_by_plans': InternetPlan.objects.filter(time_variant=config).count(),
#                     'used_by_templates': PlanTemplate.objects.filter(time_variant=config).count()
#                 }
                
#                 return Response({
#                     'success': True,
#                     'config': serializer.data,
#                     'usage': usage_info
#                 })
            
#             else:
#                 # List all configurations with filtering
#                 queryset = TimeVariantConfig.objects.all()
                
#                 # Apply filters
#                 is_active = request.query_params.get('is_active')
#                 if is_active is not None:
#                     queryset = queryset.filter(is_active=is_active.lower() == 'true')
                
#                 search = request.query_params.get('search')
#                 if search:
#                     queryset = queryset.filter(
#                         Q(id__icontains=search)
#                     )
                
#                 # Paginate
#                 paginator = StandardPagination()
#                 page = paginator.paginate_queryset(queryset, request)
                
#                 serializer = TimeVariantConfigSerializer(page, many=True, context={'request': request})
                
#                 return paginator.get_paginated_response(serializer.data)
            
#         except Exception as e:
#             logger.error(f"Failed to get time variant configs: {e}", exc_info=True)
#             return Response({
#                 'success': False,
#                 'error': 'Failed to load configurations',
#                 'details': str(e) if request.user.is_staff else None
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
#     def post(self, request):
#         """Create new time variant configuration"""
#         if not request.user.is_staff:
#             return Response({
#                 'success': False,
#                 'error': 'Permission denied'
#             }, status=status.HTTP_403_FORBIDDEN)
        
#         try:
#             serializer = TimeVariantConfigSerializer(
#                 data=request.data,
#                 context={'request': request}
#             )
            
#             if not serializer.is_valid():
#                 return Response({
#                     'success': False,
#                     'error': 'Validation failed',
#                     'details': serializer.errors
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             config = serializer.save()
            
#             logger.info(f"Time variant config created: {config.id} by {request.user.username}")
            
#             return Response({
#                 'success': True,
#                 'message': 'Time variant configuration created successfully',
#                 'config': TimeVariantConfigSerializer(config, context={'request': request}).data
#             }, status=status.HTTP_201_CREATED)
            
#         except Exception as e:
#             logger.error(f"Failed to create time variant config: {e}", exc_info=True)
#             return Response({
#                 'success': False,
#                 'error': 'Failed to create configuration',
#                 'details': str(e) if request.user.is_staff else None
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
#     def put(self, request, config_id):
#         """Update time variant configuration"""
#         if not request.user.is_staff:
#             return Response({
#                 'success': False,
#                 'error': 'Permission denied'
#             }, status=status.HTTP_403_FORBIDDEN)
        
#         try:
#             config = get_object_or_404(TimeVariantConfig, id=config_id)
            
#             serializer = TimeVariantConfigSerializer(
#                 config,
#                 data=request.data,
#                 partial=True,
#                 context={'request': request}
#             )
            
#             if not serializer.is_valid():
#                 return Response({
#                     'success': False,
#                     'error': 'Validation failed',
#                     'details': serializer.errors
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             updated_config = serializer.save()
            
#             # Clear related plan caches
#             plan_ids = InternetPlan.objects.filter(time_variant=config).values_list('id', flat=True)
#             for plan_id in plan_ids:
#                 cache.delete(f"internet_plan:{plan_id}")
#             cache.delete_pattern("available_plans:*")
            
#             logger.info(f"Time variant config updated: {config_id} by {request.user.username}")
            
#             return Response({
#                 'success': True,
#                 'message': 'Time variant configuration updated successfully',
#                 'config': TimeVariantConfigSerializer(updated_config, context={'request': request}).data
#             })
            
#         except TimeVariantConfig.DoesNotExist:
#             return Response({
#                 'success': False,
#                 'error': 'Configuration not found'
#             }, status=status.HTTP_404_NOT_FOUND)
#         except Exception as e:
#             logger.error(f"Failed to update time variant config {config_id}: {e}", exc_info=True)
#             return Response({
#                 'success': False,
#                 'error': 'Failed to update configuration',
#                 'details': str(e) if request.user.is_staff else None
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
#     def delete(self, request, config_id):
#         """Delete time variant configuration"""
#         if not request.user.is_staff:
#             return Response({
#                 'success': False,
#                 'error': 'Permission denied'
#             }, status=status.HTTP_403_FORBIDDEN)
        
#         try:
#             config = get_object_or_404(TimeVariantConfig, id=config_id)
            
#             # Check if config is in use
#             plan_count = InternetPlan.objects.filter(time_variant=config).count()
#             template_count = PlanTemplate.objects.filter(time_variant=config).count()
            
#             if plan_count > 0 or template_count > 0:
#                 return Response({
#                     'success': False,
#                     'error': f'Cannot delete configuration used by {plan_count} plan(s) and {template_count} template(s)',
#                     'usage': {
#                         'plans': plan_count,
#                         'templates': template_count
#                     }
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             config.delete()
            
#             logger.info(f"Time variant config deleted: {config_id} by {request.user.username}")
            
#             return Response({
#                 'success': True,
#                 'message': 'Time variant configuration deleted successfully'
#             })
            
#         except TimeVariantConfig.DoesNotExist:
#             return Response({
#                 'success': False,
#                 'error': 'Configuration not found'
#             }, status=status.HTTP_404_NOT_FOUND)
#         except Exception as e:
#             logger.error(f"Failed to delete time variant config {config_id}: {e}", exc_info=True)
#             return Response({
#                 'success': False,
#                 'error': 'Failed to delete configuration'
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# class PlanAvailabilityCheckView(APIView):
#     """
#     Check plan availability for clients
#     """
    
#     permission_classes = [AllowAny]  # Allow access from captive portal
#     throttle_classes = [UserRateThrottle]
    
#     def post(self, request):
#         """Check plan availability"""
#         try:
#             serializer = PlanAvailabilityCheckSerializer(data=request.data)
            
#             if not serializer.is_valid():
#                 return Response({
#                     'success': False,
#                     'error': 'Validation failed',
#                     'details': serializer.errors
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             result = serializer.get_availability_result()
            
#             return Response({
#                 'success': True,
#                 'data': result
#             })
            
#         except Exception as e:
#             logger.error(f"Failed to check plan availability: {e}", exc_info=True)
#             return Response({
#                 'success': False,
#                 'error': 'Failed to check availability',
#                 'timestamp': timezone.now().isoformat()
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# class AvailablePlansView(APIView):
#     """
#     Get available plans for clients (for captive portal)
#     """
    
#     permission_classes = [AllowAny]  # Allow access from captive portal
#     throttle_classes = [UserRateThrottle]
    
#     def post(self, request):
#         """Get available plans based on client type and filters"""
#         try:
#             serializer = AvailablePlansRequestSerializer(data=request.data)
            
#             if not serializer.is_valid():
#                 return Response({
#                     'success': False,
#                     'error': 'Validation failed',
#                     'details': serializer.errors
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             result = serializer.get_available_plans()
            
#             return Response({
#                 'success': True,
#                 'data': result
#             })
            
#         except Exception as e:
#             logger.error(f"Failed to get available plans: {e}", exc_info=True)
#             return Response({
#                 'success': False,
#                 'error': 'Failed to get available plans',
#                 'timestamp': timezone.now().isoformat()
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
#     def get(self, request):
#         """Get available plans with query parameters (for GET requests)"""
#         try:
#             # Convert GET parameters to serializer data
#             data = {
#                 'client_type': request.query_params.get('client_type', 'hotspot'),
#                 'router_id': request.query_params.get('router_id'),
#                 'category': request.query_params.get('category'),
#                 'max_price': request.query_params.get('max_price'),
#                 'include_unavailable': request.query_params.get('include_unavailable', 'false').lower() == 'true'
#             }
            
#             # Remove None values
#             data = {k: v for k, v in data.items() if v is not None}
            
#             serializer = AvailablePlansRequestSerializer(data=data)
            
#             if not serializer.is_valid():
#                 return Response({
#                     'success': False,
#                     'error': 'Validation failed',
#                     'details': serializer.errors
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             result = serializer.get_available_plans()
            
#             return Response({
#                 'success': True,
#                 'data': result
#             })
            
#         except Exception as e:
#             logger.error(f"Failed to get available plans: {e}", exc_info=True)
#             return Response({
#                 'success': False,
#                 'error': 'Failed to get available plans',
#                 'timestamp': timezone.now().isoformat()
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# class PublicInternetPlanListView(APIView):
#     """
#     Public API for listing available Internet Plans
#     No authentication required
#     """
    
#     permission_classes = [AllowAny]
#     throttle_classes = [UserRateThrottle]
    
#     def get(self, request):
#         """Get public list of available plans"""
#         try:
#             # Determine client type from request (default to hotspot)
#             client_type = request.query_params.get('client_type', 'hotspot')
            
#             # Cache key
#             cache_key = f"public_available_plans:{client_type}:{request.GET.urlencode()}"
#             cached_data = cache.get(cache_key)
            
#             if cached_data:
#                 return Response(cached_data)
            
#             # Use AvailablePlansRequestSerializer for consistency
#             data = {
#                 'client_type': client_type,
#                 'router_id': request.query_params.get('router_id'),
#                 'category': request.query_params.get('category'),
#                 'max_price': request.query_params.get('max_price'),
#                 'include_unavailable': False  # Public API only shows available plans
#             }
            
#             # Remove None values
#             data = {k: v for k, v in data.items() if v is not None}
            
#             serializer = AvailablePlansRequestSerializer(data=data, context={'request': request})
            
#             if not serializer.is_valid():
#                 return Response({
#                     'success': False,
#                     'error': 'Validation failed',
#                     'details': serializer.errors
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             result = serializer.get_available_plans()
            
#             response_data = {
#                 'success': True,
#                 'count': result['count'],
#                 'client_type': client_type,
#                 'plans': result['plans'],
#                 'timestamp': timezone.now().isoformat()
#             }
            
#             # Cache for 1 minute (time-sensitive)
#             cache.set(cache_key, response_data, 60)
            
#             return Response(response_data)
            
#         except Exception as e:
#             logger.error(f"Failed to get public plans: {e}", exc_info=True)
#             return Response({
#                 'success': False,
#                 'error': 'Failed to load plans',
#                 'timestamp': timezone.now().isoformat()
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# class PlanStatisticsView(APIView):
#     """
#     Get statistics about plans
#     """
    
#     permission_classes = [IsAuthenticated]
    
#     def get(self, request):
#         """Get plan statistics including time variant stats"""
#         try:
#             # Basic statistics
#             stats = {
#                 'total_plans': InternetPlan.objects.count(),
#                 'active_plans': InternetPlan.objects.filter(active=True).count(),
#                 'by_category': dict(
#                     InternetPlan.objects.values('category')
#                     .annotate(count=Count('id'))
#                     .values_list('category', 'count')
#                 ),
#                 'by_plan_type': dict(
#                     InternetPlan.objects.values('plan_type')
#                     .annotate(count=Count('id'))
#                     .values_list('plan_type', 'count')
#                 ),
#                 'total_purchases': InternetPlan.objects.aggregate(total=Sum('purchases'))['total'] or 0,
#                 'average_price': float(InternetPlan.objects.filter(active=True).aggregate(avg=Avg('price'))['avg'] or 0)
#             }
            
#             # Add time variant statistics
#             time_variant_stats = {
#                 'plans_with_time_variant': InternetPlan.objects.filter(
#                     active=True,
#                     time_variant__is_active=True
#                 ).count(),
#                 'time_variant_configs': TimeVariantConfig.objects.filter(is_active=True).count(),
#                 'availability_by_time': self._get_availability_stats()
#             }
            
#             stats['time_variant'] = time_variant_stats
            
#             return Response({
#                 'success': True,
#                 'statistics': stats
#             })
            
#         except Exception as e:
#             logger.error(f"Failed to get plan statistics: {e}", exc_info=True)
#             return Response({
#                 'success': False,
#                 'error': 'Failed to get statistics',
#                 'timestamp': timezone.now().isoformat()
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
#     def _get_availability_stats(self):
#         """Get availability statistics"""
#         now = timezone.now()
#         current_hour = now.hour
#         current_day = now.strftime('%a').lower()[:3]
        
#         # Count plans available now
#         available_now = 0
#         total_with_time_variant = 0
        
#         plans_with_time_variant = InternetPlan.objects.filter(
#             active=True,
#             time_variant__is_active=True
#         ).select_related('time_variant')
        
#         for plan in plans_with_time_variant:
#             total_with_time_variant += 1
#             if plan.time_variant.is_available_now():
#                 available_now += 1
        
#         return {
#             'available_now': available_now,
#             'total_with_time_variant': total_with_time_variant,
#             'percentage_available': (available_now / total_with_time_variant * 100) if total_with_time_variant > 0 else 0,
#             'current_time': now.isoformat(),
#             'current_hour': current_hour,
#             'current_day': current_day
#         }


# class PlanCompatibilityCheckView(APIView):
#     """
#     Check plan compatibility
#     """
    
#     permission_classes = [IsAuthenticated]
#     throttle_classes = [UserRateThrottle]
    
#     def post(self, request):
#         """Check plan compatibility including time availability"""
#         try:
#             serializer = PlanCompatibilitySerializer(data=request.data)
            
#             if not serializer.is_valid():
#                 return Response({
#                     'success': False,
#                     'error': 'Validation failed',
#                     'details': serializer.errors
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             result = serializer.get_compatibility_result()
            
#             if not result:
#                 return Response({
#                     'success': False,
#                     'error': 'Failed to check compatibility'
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             return Response({
#                 'success': True,
#                 'compatibility': result
#             })
            
#         except Exception as e:
#             logger.error(f"Failed to check plan compatibility: {e}", exc_info=True)
#             return Response({
#                 'success': False,
#                 'error': 'Failed to check compatibility',
#                 'details': str(e) if request.user.is_staff else None
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        



# class PlanRecommendationView(APIView):
#     """
#     Get plan recommendations
#     """
    
#     permission_classes = [IsAuthenticated]
#     throttle_classes = [UserRateThrottle]
    
#     def get(self, request):
#         """Get plan recommendations considering availability"""
#         try:
#             # Extract parameters
#             client_type = request.query_params.get('client_type')
#             budget = request.query_params.get('budget')
#             access_method = request.query_params.get('access_method')
#             limit = int(request.query_params.get('limit', 5))
            
#             # Parse budget
#             budget_value = None
#             if budget:
#                 try:
#                     budget_value = float(budget)
#                 except ValueError:
#                     return Response({
#                         'success': False,
#                         'error': 'Invalid budget format'
#                     }, status=status.HTTP_400_BAD_REQUEST)
            
#             # Get recommendations
#             recommendations = PlanService.get_recommended_plans(
#                 client_type=client_type,
#                 budget=budget_value,
#                 access_method=access_method,
#                 limit=limit
#             )
            
#             # Filter by availability for the specific client type
#             filtered_recommendations = []
#             for rec in recommendations:
#                 plan_id = rec['id']
#                 plan = InternetPlan.get_cached_plan(plan_id)
#                 if plan:
#                     availability = plan.is_available_for_client()
#                     if availability['available']:
#                         rec['availability'] = availability
#                         filtered_recommendations.append(rec)
            
#             return Response({
#                 'success': True,
#                 'recommendations': filtered_recommendations,
#                 'criteria': {
#                     'client_type': client_type,
#                     'budget': budget_value,
#                     'access_method': access_method,
#                     'limit': limit
#                 },
#                 'timestamp': timezone.now().isoformat()
#             })
            
#         except Exception as e:
#             logger.error(f"Failed to get plan recommendations: {e}")
#             return Response({
#                 'success': False,
#                 'error': 'Failed to get recommendations',
#                 'timestamp': timezone.now().isoformat()
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        


# class TimeVariantTestView(APIView):
#     """
#     Test time variant configurations
#     """
    
#     permission_classes = [IsAdminUser]
#     throttle_classes = [UserRateThrottle]
    
#     def post(self, request):
#         """Test time variant configuration"""
#         try:
#             # Create a test time variant
#             test_data = {
#                 'is_active': True,
#                 'start_time': '09:00',
#                 'end_time': '17:00',
#                 'available_days': ['mon', 'tue', 'wed', 'thu', 'fri'],
#                 'timezone': 'Africa/Nairobi'
#             }
            
#             serializer = TimeVariantConfigSerializer(data=test_data)
            
#             if serializer.is_valid():
#                 config = serializer.save()
                
#                 # Test availability
#                 is_available = config.is_available_now()
#                 summary = config.get_availability_summary()
#                 next_available = config.get_next_available_time()
                
#                 return Response({
#                     'success': True,
#                     'test_config': serializer.data,
#                     'results': {
#                         'is_available_now': is_available,
#                         'summary': summary,
#                         'next_available_time': next_available
#                     },
#                     'current_time': timezone.now().isoformat(),
#                     'current_day': timezone.now().strftime('%A'),
#                     'current_time_local': timezone.now().strftime('%H:%M:%S')
#                 })
#             else:
#                 return Response({
#                     'success': False,
#                     'error': 'Test configuration invalid',
#                     'details': serializer.errors
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#         except Exception as e:
#             logger.error(f"Failed to test time variant: {e}", exc_info=True)
#             return Response({
#                 'success': False,
#                 'error': 'Failed to test time variant',
#                 'details': str(e)
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
















# """
# Internet Plans - Plan Views with Time Variant Support
# API views for Internet Plan management with time-based availability
# Production-ready with comprehensive error handling
# FIXED: Complete implementation with all required methods
# """

# from django.shortcuts import get_object_or_404
# from django.db.models import Q, Count, Sum, Avg
# from django.utils import timezone
# from django.db import transaction
# from django.core.cache import cache
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
# from rest_framework.pagination import PageNumberPagination
# from rest_framework import status
# from rest_framework.throttling import UserRateThrottle
# import logging
# from datetime import datetime, timedelta

# from internet_plans.models.plan_models import InternetPlan, TimeVariantConfig, PlanTemplate
# from internet_plans.serializers.plan_serializers import (
#     InternetPlanSerializer,
#     InternetPlanCreateSerializer,
#     InternetPlanUpdateSerializer,
#     InternetPlanDetailSerializer,
#     PlanCompatibilitySerializer,
#     PlanAvailabilityCheckSerializer,
#     AvailablePlansRequestSerializer,
#     TimeVariantConfigSerializer
# )
# from internet_plans.utils.formatters import format_plan_summary
# from internet_plans.services.plan_service import PlanService

# logger = logging.getLogger(__name__)


# class StandardPagination(PageNumberPagination):
#     """Standard pagination class"""
#     page_size = 20
#     page_size_query_param = 'page_size'
#     max_page_size = 100
    
#     def get_paginated_response(self, data):
#         return Response({
#             'success': True,
#             'count': self.page.paginator.count,
#             'next': self.get_next_link(),
#             'previous': self.get_previous_link(),
#             'results': data,
#             'page': self.page.number,
#             'total_pages': self.page.paginator.num_pages
#         })


# class InternetPlanListView(APIView):
#     """
#     List and create Internet Plans with Time Variant Support
#     GET: List plans with filtering (including time availability)
#     POST: Create new plan with time variant
#     """
    
#     permission_classes = [IsAuthenticated]
#     pagination_class = StandardPagination
#     throttle_classes = [UserRateThrottle]
    
#     def get(self, request):
#         """Get list of plans with filtering"""
#         try:
#             # Use efficient querying
#             filters = self._extract_filters(request)
#             page = int(request.query_params.get('page', 1))
#             page_size = int(request.query_params.get('page_size', 20))
            
#             # Start with active plans
#             queryset = InternetPlan.objects.filter(active=True).select_related('time_variant')
            
#             # Apply filters
#             if filters.get('category'):
#                 queryset = queryset.filter(category=filters['category'])
            
#             if filters.get('plan_type'):
#                 queryset = queryset.filter(plan_type=filters['plan_type'])
            
#             if filters.get('access_method'):
#                 if filters['access_method'] == 'hotspot':
#                     queryset = queryset.filter(access_methods__hotspot__enabled=True)
#                 elif filters['access_method'] == 'pppoe':
#                     queryset = queryset.filter(access_methods__pppoe__enabled=True)
#                 elif filters['access_method'] == 'dual':
#                     queryset = queryset.filter(
#                         access_methods__hotspot__enabled=True,
#                         access_methods__pppoe__enabled=True
#                     )
            
#             if filters.get('has_time_variant') is not None:
#                 if filters['has_time_variant']:
#                     queryset = queryset.filter(time_variant__is_active=True)
#                 else:
#                     queryset = queryset.filter(Q(time_variant__isnull=True) | Q(time_variant__is_active=False))
            
#             if filters.get('available_now'):
#                 # This is complex and might be better handled in application logic
#                 # For now, we'll just return all and filter in application layer
#                 pass
            
#             if filters.get('search'):
#                 queryset = queryset.filter(
#                     Q(name__icontains=filters['search']) |
#                     Q(description__icontains=filters['search'])
#                 )
            
#             if filters.get('min_price') is not None:
#                 queryset = queryset.filter(price__gte=filters['min_price'])
            
#             if filters.get('max_price') is not None:
#                 queryset = queryset.filter(price__lte=filters['max_price'])
            
#             # Count and paginate
#             total_count = queryset.count()
#             total_pages = (total_count + page_size - 1) // page_size
            
#             # Apply sorting
#             sort_by = filters.get('sort_by', 'name')
#             sort_order = filters.get('sort_order', 'asc')
#             sort_field = f'-{sort_by}' if sort_order == 'desc' else sort_by
#             queryset = queryset.order_by(sort_field)
            
#             # Paginate manually for now
#             offset = (page - 1) * page_size
#             plans = list(queryset[offset:offset + page_size])
            
#             # Add time variant info to each plan
#             for plan in plans:
#                 plan.time_variant_info = plan.get_time_variant_summary()
#                 plan.availability_info = plan.is_available_for_client()
            
#             # Serialize plans
#             serializer = InternetPlanSerializer(plans, many=True, context={'request': request})
            
#             return Response({
#                 'success': True,
#                 'count': total_count,
#                 'next': f"?page={page + 1}&page_size={page_size}" if page < total_pages else None,
#                 'previous': f"?page={page - 1}&page_size={page_size}" if page > 1 else None,
#                 'results': serializer.data,
#                 'page': page,
#                 'page_size': page_size,
#                 'total_pages': total_pages,
#                 'filters_applied': filters
#             })
            
#         except Exception as e:
#             logger.error(f"Failed to get plans: {e}", exc_info=True)
#             return Response({
#                 'success': False,
#                 'error': 'Failed to load plans',
#                 'details': str(e) if request.user.is_staff else None
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
#     def post(self, request):
#         """Create new plan with time variant support"""
#         if not request.user.is_staff:
#             return Response({
#                 'success': False,
#                 'error': 'Permission denied'
#             }, status=status.HTTP_403_FORBIDDEN)
        
#         try:
#             # Check for duplicate name
#             plan_name = request.data.get('name', '')
#             if plan_name and InternetPlan.objects.filter(name=plan_name).exists():
#                 return Response({
#                     'success': False,
#                     'error': f'A plan with the name "{plan_name}" already exists'
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             serializer = InternetPlanCreateSerializer(
#                 data=request.data,
#                 context={'request': request}
#             )
            
#             if not serializer.is_valid():
#                 return Response({
#                     'success': False,
#                     'error': 'Validation failed',
#                     'details': serializer.errors
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             with transaction.atomic():
#                 plan = serializer.save()
                
#                 # Log the creation
#                 logger.info(f"Plan created: {plan.name} (ID: {plan.id}) by {request.user.username}")
                
#                 return Response({
#                     'success': True,
#                     'message': 'Plan created successfully',
#                     'plan': InternetPlanSerializer(plan, context={'request': request}).data
#                 }, status=status.HTTP_201_CREATED)
            
#         except Exception as e:
#             logger.error(f"Failed to create plan: {e}", exc_info=True)
#             return Response({
#                 'success': False,
#                 'error': 'Failed to create plan',
#                 'details': str(e) if request.user.is_staff else None
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
#     def _extract_filters(self, request):
#         """Extract and validate filters from request"""
#         filters = {}
        
#         # Active filter
#         if active := request.query_params.get('active'):
#             filters['active'] = active.lower() == 'true'
        
#         # Category filter
#         if category := request.query_params.get('category'):
#             filters['category'] = category
        
#         # Plan type filter
#         if plan_type := request.query_params.get('plan_type'):
#             filters['plan_type'] = plan_type
        
#         # Access method filter
#         if access_method := request.query_params.get('access_method'):
#             filters['access_method'] = access_method
        
#         # Time variant filter
#         if time_variant := request.query_params.get('time_variant'):
#             if time_variant.lower() == 'active':
#                 filters['has_time_variant'] = True
#             elif time_variant.lower() == 'inactive':
#                 filters['has_time_variant'] = False
        
#         # Availability filter
#         if available_now := request.query_params.get('available_now'):
#             filters['available_now'] = available_now.lower() == 'true'
        
#         # Search filter
#         if search := request.query_params.get('search'):
#             filters['search'] = search
        
#         # Price range filter
#         if min_price := request.query_params.get('min_price'):
#             try:
#                 filters['min_price'] = float(min_price)
#             except (ValueError, TypeError):
#                 pass
        
#         if max_price := request.query_params.get('max_price'):
#             try:
#                 filters['max_price'] = float(max_price)
#             except (ValueError, TypeError):
#                 pass
        
#         # Template filter
#         if template_id := request.query_params.get('template_id'):
#             filters['template_id'] = template_id
        
#         # Sorting
#         if sort_by := request.query_params.get('sort_by'):
#             filters['sort_by'] = sort_by
        
#         if sort_order := request.query_params.get('sort_order'):
#             filters['sort_order'] = sort_order
        
#         return filters


# class InternetPlanDetailView(APIView):
#     """
#     Retrieve, update, or delete an Internet Plan with Time Variant
#     """
    
#     permission_classes = [IsAuthenticated]
#     throttle_classes = [UserRateThrottle]
    
#     def get(self, request, plan_id):
#         """Get plan details with time variant info"""
#         try:
#             # Get plan
#             plan = get_object_or_404(InternetPlan, id=plan_id)
            
#             # Check permissions for inactive plans
#             if not plan.active and not request.user.is_staff:
#                 return Response({
#                     'success': False,
#                     'error': 'Plan not available'
#                 }, status=status.HTTP_404_NOT_FOUND)
            
#             serializer = InternetPlanDetailSerializer(plan, context={'request': request})
            
#             # Add pricing information
#             from internet_plans.services.pricing_service import PricingService
#             pricing_info = PricingService.get_pricing_options(plan)
            
#             # Add time variant availability
#             availability = plan.is_available_for_client()
            
#             response_data = {
#                 'success': True,
#                 'plan': serializer.data,
#                 'pricing_options': pricing_info,
#                 'summary': format_plan_summary(plan),
#                 'availability': availability,
#                 'compatibility': {
#                     'supported_access_methods': plan.get_enabled_access_methods(),
#                     'router_specific': plan.router_specific,
#                     'allowed_routers_count': plan.allowed_routers.count() if plan.router_specific else 'All'
#                 }
#             }
            
#             return Response(response_data)
            
#         except InternetPlan.DoesNotExist:
#             return Response({
#                 'success': False,
#                 'error': 'Plan not found'
#             }, status=status.HTTP_404_NOT_FOUND)
#         except Exception as e:
#             logger.error(f"Failed to get plan {plan_id}: {e}", exc_info=True)
#             return Response({
#                 'success': False,
#                 'error': 'Failed to load plan details'
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
#     def put(self, request, plan_id):
#         """Update plan with time variant support"""
#         if not request.user.is_staff:
#             return Response({
#                 'success': False,
#                 'error': 'Permission denied'
#             }, status=status.HTTP_403_FORBIDDEN)
        
#         try:
#             plan = get_object_or_404(InternetPlan, id=plan_id)
            
#             # Check for duplicate name
#             new_name = request.data.get('name')
#             if new_name and new_name != plan.name:
#                 if InternetPlan.objects.filter(name=new_name).exclude(id=plan_id).exists():
#                     return Response({
#                         'success': False,
#                         'error': f'A plan with the name "{new_name}" already exists'
#                     }, status=status.HTTP_400_BAD_REQUEST)
            
#             serializer = InternetPlanUpdateSerializer(
#                 plan, 
#                 data=request.data, 
#                 partial=True,
#                 context={'request': request}
#             )
            
#             if not serializer.is_valid():
#                 return Response({
#                     'success': False,
#                     'error': 'Validation failed',
#                     'details': serializer.errors
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             # Track price changes
#             old_price = plan.price
            
#             with transaction.atomic():
#                 updated_plan = serializer.save()
                
#                 # Log price change
#                 if old_price != updated_plan.price:
#                     logger.info(
#                         f"Plan price changed: {plan_id} - {old_price} to {updated_plan.price} "
#                         f"by {request.user.username}"
#                     )
                
#                 # Log update
#                 logger.info(f"Plan updated: {plan_id} by {request.user.username}")
                
#                 return Response({
#                     'success': True,
#                     'message': 'Plan updated successfully',
#                     'plan': InternetPlanSerializer(updated_plan, context={'request': request}).data
#                 })
            
#         except InternetPlan.DoesNotExist:
#             return Response({
#                 'success': False,
#                 'error': 'Plan not found'
#             }, status=status.HTTP_404_NOT_FOUND)
#         except Exception as e:
#             logger.error(f"Failed to update plan {plan_id}: {e}", exc_info=True)
#             return Response({
#                 'success': False,
#                 'error': 'Failed to update plan',
#                 'details': str(e) if request.user.is_staff else None
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
#     def delete(self, request, plan_id):
#         """Delete (deactivate) plan"""
#         if not request.user.is_staff:
#             return Response({
#                 'success': False,
#                 'error': 'Permission denied'
#             }, status=status.HTTP_403_FORBIDDEN)
        
#         try:
#             plan = get_object_or_404(InternetPlan, id=plan_id)
            
#             # Check if plan has active subscriptions
#             try:
#                 from service_operations.models.subscription_models import Subscription
#                 active_subs = Subscription.objects.filter(
#                     internet_plan=plan,
#                     status='active',
#                     is_active=True
#                 ).exists()
                
#                 if active_subs:
#                     return Response({
#                         'success': False,
#                         'error': 'Cannot deactivate plan with active subscriptions'
#                     }, status=status.HTTP_400_BAD_REQUEST)
#             except ImportError:
#                 # Subscription model not available, proceed with caution
#                 logger.warning("Subscription model not available, skipping subscription check")
            
#             # Soft delete (deactivate)
#             plan.active = False
#             plan.save()
            
#             # Clear cache
#             cache.delete(f"internet_plan:{plan_id}")
#             cache.delete_pattern("internet_plans:*")
            
#             # Log deactivation
#             logger.info(f"Plan deactivated: {plan_id} by {request.user.username}")
            
#             return Response({
#                 'success': True,
#                 'message': 'Plan deactivated successfully'
#             })
            
#         except InternetPlan.DoesNotExist:
#             return Response({
#                 'success': False,
#                 'error': 'Plan not found'
#             }, status=status.HTTP_404_NOT_FOUND)
#         except Exception as e:
#             logger.error(f"Failed to deactivate plan {plan_id}: {e}", exc_info=True)
#             return Response({
#                 'success': False,
#                 'error': 'Failed to deactivate plan'
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# class TimeVariantConfigView(APIView):
#     """
#     Manage Time Variant Configurations
#     """
    
#     permission_classes = [IsAuthenticated]
#     throttle_classes = [UserRateThrottle]
    
#     def get(self, request, config_id=None):
#         """Get time variant configuration(s)"""
#         if not request.user.is_staff:
#             return Response({
#                 'success': False,
#                 'error': 'Permission denied'
#             }, status=status.HTTP_403_FORBIDDEN)
        
#         try:
#             if config_id:
#                 # Get specific configuration
#                 config = get_object_or_404(TimeVariantConfig, id=config_id)
#                 serializer = TimeVariantConfigSerializer(config, context={'request': request})
                
#                 # Add usage information
#                 usage_info = {
#                     'used_by_plans': InternetPlan.objects.filter(time_variant=config).count(),
#                     'used_by_templates': PlanTemplate.objects.filter(time_variant=config).count()
#                 }
                
#                 return Response({
#                     'success': True,
#                     'config': serializer.data,
#                     'usage': usage_info
#                 })
            
#             else:
#                 # List all configurations with filtering
#                 queryset = TimeVariantConfig.objects.all()
                
#                 # Apply filters
#                 is_active = request.query_params.get('is_active')
#                 if is_active is not None:
#                     queryset = queryset.filter(is_active=is_active.lower() == 'true')
                
#                 search = request.query_params.get('search')
#                 if search:
#                     queryset = queryset.filter(
#                         Q(id__icontains=search)
#                     )
                
#                 # Paginate
#                 paginator = StandardPagination()
#                 page = paginator.paginate_queryset(queryset, request)
                
#                 serializer = TimeVariantConfigSerializer(page, many=True, context={'request': request})
                
#                 return paginator.get_paginated_response(serializer.data)
            
#         except Exception as e:
#             logger.error(f"Failed to get time variant configs: {e}", exc_info=True)
#             return Response({
#                 'success': False,
#                 'error': 'Failed to load configurations',
#                 'details': str(e) if request.user.is_staff else None
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
#     def post(self, request):
#         """Create new time variant configuration"""
#         if not request.user.is_staff:
#             return Response({
#                 'success': False,
#                 'error': 'Permission denied'
#             }, status=status.HTTP_403_FORBIDDEN)
        
#         try:
#             serializer = TimeVariantConfigSerializer(
#                 data=request.data,
#                 context={'request': request}
#             )
            
#             if not serializer.is_valid():
#                 return Response({
#                     'success': False,
#                     'error': 'Validation failed',
#                     'details': serializer.errors
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             config = serializer.save()
            
#             logger.info(f"Time variant config created: {config.id} by {request.user.username}")
            
#             return Response({
#                 'success': True,
#                 'message': 'Time variant configuration created successfully',
#                 'config': TimeVariantConfigSerializer(config, context={'request': request}).data
#             }, status=status.HTTP_201_CREATED)
            
#         except Exception as e:
#             logger.error(f"Failed to create time variant config: {e}", exc_info=True)
#             return Response({
#                 'success': False,
#                 'error': 'Failed to create configuration',
#                 'details': str(e) if request.user.is_staff else None
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
#     def put(self, request, config_id):
#         """Update time variant configuration"""
#         if not request.user.is_staff:
#             return Response({
#                 'success': False,
#                 'error': 'Permission denied'
#             }, status=status.HTTP_403_FORBIDDEN)
        
#         try:
#             config = get_object_or_404(TimeVariantConfig, id=config_id)
            
#             serializer = TimeVariantConfigSerializer(
#                 config,
#                 data=request.data,
#                 partial=True,
#                 context={'request': request}
#             )
            
#             if not serializer.is_valid():
#                 return Response({
#                     'success': False,
#                     'error': 'Validation failed',
#                     'details': serializer.errors
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             updated_config = serializer.save()
            
#             # Clear related plan caches
#             plan_ids = InternetPlan.objects.filter(time_variant=config).values_list('id', flat=True)
#             for plan_id in plan_ids:
#                 cache.delete(f"internet_plan:{plan_id}")
#             cache.delete_pattern("available_plans:*")
            
#             logger.info(f"Time variant config updated: {config_id} by {request.user.username}")
            
#             return Response({
#                 'success': True,
#                 'message': 'Time variant configuration updated successfully',
#                 'config': TimeVariantConfigSerializer(updated_config, context={'request': request}).data
#             })
            
#         except TimeVariantConfig.DoesNotExist:
#             return Response({
#                 'success': False,
#                 'error': 'Configuration not found'
#             }, status=status.HTTP_404_NOT_FOUND)
#         except Exception as e:
#             logger.error(f"Failed to update time variant config {config_id}: {e}", exc_info=True)
#             return Response({
#                 'success': False,
#                 'error': 'Failed to update configuration',
#                 'details': str(e) if request.user.is_staff else None
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
#     def delete(self, request, config_id):
#         """Delete time variant configuration"""
#         if not request.user.is_staff:
#             return Response({
#                 'success': False,
#                 'error': 'Permission denied'
#             }, status=status.HTTP_403_FORBIDDEN)
        
#         try:
#             config = get_object_or_404(TimeVariantConfig, id=config_id)
            
#             # Check if config is in use
#             plan_count = InternetPlan.objects.filter(time_variant=config).count()
#             template_count = PlanTemplate.objects.filter(time_variant=config).count()
            
#             if plan_count > 0 or template_count > 0:
#                 return Response({
#                     'success': False,
#                     'error': f'Cannot delete configuration used by {plan_count} plan(s) and {template_count} template(s)',
#                     'usage': {
#                         'plans': plan_count,
#                         'templates': template_count
#                     }
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             config.delete()
            
#             logger.info(f"Time variant config deleted: {config_id} by {request.user.username}")
            
#             return Response({
#                 'success': True,
#                 'message': 'Time variant configuration deleted successfully'
#             })
            
#         except TimeVariantConfig.DoesNotExist:
#             return Response({
#                 'success': False,
#                 'error': 'Configuration not found'
#             }, status=status.HTTP_404_NOT_FOUND)
#         except Exception as e:
#             logger.error(f"Failed to delete time variant config {config_id}: {e}", exc_info=True)
#             return Response({
#                 'success': False,
#                 'error': 'Failed to delete configuration'
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# class PlanAvailabilityCheckView(APIView):
#     """
#     Check plan availability for clients
#     """
    
#     permission_classes = [AllowAny]  # Allow access from captive portal
#     throttle_classes = [UserRateThrottle]
    
#     def post(self, request):
#         """Check plan availability"""
#         try:
#             serializer = PlanAvailabilityCheckSerializer(data=request.data)
            
#             if not serializer.is_valid():
#                 return Response({
#                     'success': False,
#                     'error': 'Validation failed',
#                     'details': serializer.errors
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             result = serializer.get_availability_result()
            
#             return Response({
#                 'success': True,
#                 'data': result
#             })
            
#         except Exception as e:
#             logger.error(f"Failed to check plan availability: {e}", exc_info=True)
#             return Response({
#                 'success': False,
#                 'error': 'Failed to check availability',
#                 'timestamp': timezone.now().isoformat()
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# class AvailablePlansView(APIView):
#     """
#     Get available plans for clients (for captive portal)
#     """
    
#     permission_classes = [AllowAny]  # Allow access from captive portal
#     throttle_classes = [UserRateThrottle]
    
#     def post(self, request):
#         """Get available plans based on client type and filters"""
#         try:
#             serializer = AvailablePlansRequestSerializer(data=request.data)
            
#             if not serializer.is_valid():
#                 return Response({
#                     'success': False,
#                     'error': 'Validation failed',
#                     'details': serializer.errors
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             result = serializer.get_available_plans()
            
#             return Response({
#                 'success': True,
#                 'data': result
#             })
            
#         except Exception as e:
#             logger.error(f"Failed to get available plans: {e}", exc_info=True)
#             return Response({
#                 'success': False,
#                 'error': 'Failed to get available plans',
#                 'timestamp': timezone.now().isoformat()
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
#     def get(self, request):
#         """Get available plans with query parameters (for GET requests)"""
#         try:
#             # Convert GET parameters to serializer data
#             data = {
#                 'client_type': request.query_params.get('client_type', 'hotspot'),
#                 'router_id': request.query_params.get('router_id'),
#                 'category': request.query_params.get('category'),
#                 'max_price': request.query_params.get('max_price'),
#                 'include_unavailable': request.query_params.get('include_unavailable', 'false').lower() == 'true'
#             }
            
#             # Remove None values
#             data = {k: v for k, v in data.items() if v is not None}
            
#             serializer = AvailablePlansRequestSerializer(data=data)
            
#             if not serializer.is_valid():
#                 return Response({
#                     'success': False,
#                     'error': 'Validation failed',
#                     'details': serializer.errors
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             result = serializer.get_available_plans()
            
#             return Response({
#                 'success': True,
#                 'data': result
#             })
            
#         except Exception as e:
#             logger.error(f"Failed to get available plans: {e}", exc_info=True)
#             return Response({
#                 'success': False,
#                 'error': 'Failed to get available plans',
#                 'timestamp': timezone.now().isoformat()
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# class PublicInternetPlanListView(APIView):
#     """
#     Public API for listing available Internet Plans
#     No authentication required
#     """
    
#     permission_classes = [AllowAny]
#     throttle_classes = [UserRateThrottle]
    
#     def get(self, request):
#         """Get public list of available plans"""
#         try:
#             # Determine client type from request (default to hotspot)
#             client_type = request.query_params.get('client_type', 'hotspot')
            
#             # Cache key
#             cache_key = f"public_available_plans:{client_type}:{request.GET.urlencode()}"
#             cached_data = cache.get(cache_key)
            
#             if cached_data:
#                 return Response(cached_data)
            
#             # Use AvailablePlansRequestSerializer for consistency
#             data = {
#                 'client_type': client_type,
#                 'router_id': request.query_params.get('router_id'),
#                 'category': request.query_params.get('category'),
#                 'max_price': request.query_params.get('max_price'),
#                 'include_unavailable': False  # Public API only shows available plans
#             }
            
#             # Remove None values
#             data = {k: v for k, v in data.items() if v is not None}
            
#             serializer = AvailablePlansRequestSerializer(data=data, context={'request': request})
            
#             if not serializer.is_valid():
#                 return Response({
#                     'success': False,
#                     'error': 'Validation failed',
#                     'details': serializer.errors
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             result = serializer.get_available_plans()
            
#             response_data = {
#                 'success': True,
#                 'count': result['count'],
#                 'client_type': client_type,
#                 'plans': result['plans'],
#                 'timestamp': timezone.now().isoformat()
#             }
            
#             # Cache for 1 minute (time-sensitive)
#             cache.set(cache_key, response_data, 60)
            
#             return Response(response_data)
            
#         except Exception as e:
#             logger.error(f"Failed to get public plans: {e}", exc_info=True)
#             return Response({
#                 'success': False,
#                 'error': 'Failed to load plans',
#                 'timestamp': timezone.now().isoformat()
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# class PlanStatisticsView(APIView):
#     """
#     Get statistics about plans
#     """
    
#     permission_classes = [IsAuthenticated]
    
#     def get(self, request):
#         """Get plan statistics including time variant stats"""
#         try:
#             stats = PlanService.get_plan_statistics()
            
#             if 'error' in stats:
#                 return Response({
#                     'success': False,
#                     'error': stats['error']
#                 }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
#             return Response({
#                 'success': True,
#                 'statistics': stats
#             })
            
#         except Exception as e:
#             logger.error(f"Failed to get plan statistics: {e}", exc_info=True)
#             return Response({
#                 'success': False,
#                 'error': 'Failed to get statistics',
#                 'timestamp': timezone.now().isoformat()
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# class PlanCompatibilityCheckView(APIView):
#     """
#     Check plan compatibility
#     """
    
#     permission_classes = [IsAuthenticated]
#     throttle_classes = [UserRateThrottle]
    
#     def post(self, request):
#         """Check plan compatibility including time availability"""
#         try:
#             serializer = PlanCompatibilitySerializer(data=request.data)
            
#             if not serializer.is_valid():
#                 return Response({
#                     'success': False,
#                     'error': 'Validation failed',
#                     'details': serializer.errors
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             result = serializer.get_compatibility_result()
            
#             if not result:
#                 return Response({
#                     'success': False,
#                     'error': 'Failed to check compatibility'
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             return Response({
#                 'success': True,
#                 'compatibility': result
#             })
            
#         except Exception as e:
#             logger.error(f"Failed to check plan compatibility: {e}", exc_info=True)
#             return Response({
#                 'success': False,
#                 'error': 'Failed to check compatibility',
#                 'details': str(e) if request.user.is_staff else None
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# class PlanRecommendationView(APIView):
#     """
#     Get plan recommendations
#     """
    
#     permission_classes = [IsAuthenticated]
#     throttle_classes = [UserRateThrottle]
    
#     def get(self, request):
#         """Get plan recommendations considering availability"""
#         try:
#             # Extract parameters
#             client_type = request.query_params.get('client_type')
#             budget = request.query_params.get('budget')
#             access_method = request.query_params.get('access_method')
#             limit = int(request.query_params.get('limit', 5))
            
#             # Parse budget
#             budget_value = None
#             if budget:
#                 try:
#                     budget_value = float(budget)
#                 except ValueError:
#                     return Response({
#                         'success': False,
#                         'error': 'Invalid budget format'
#                     }, status=status.HTTP_400_BAD_REQUEST)
            
#             # Get recommendations
#             recommendations = PlanService.get_recommended_plans(
#                 client_type=client_type,
#                 budget=budget_value,
#                 access_method=access_method,
#                 limit=limit
#             )
            
#             return Response({
#                 'success': True,
#                 'recommendations': recommendations,
#                 'criteria': {
#                     'client_type': client_type,
#                     'budget': budget_value,
#                     'access_method': access_method,
#                     'limit': limit
#                 },
#                 'timestamp': timezone.now().isoformat()
#             })
            
#         except Exception as e:
#             logger.error(f"Failed to get plan recommendations: {e}")
#             return Response({
#                 'success': False,
#                 'error': 'Failed to get recommendations',
#                 'timestamp': timezone.now().isoformat()
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# class TimeVariantTestView(APIView):
#     """
#     Test time variant configurations
#     """
    
#     permission_classes = [IsAdminUser]
#     throttle_classes = [UserRateThrottle]
    
#     def post(self, request):
#         """Test time variant configuration"""
#         try:
#             # Create a test time variant
#             test_data = {
#                 'is_active': True,
#                 'start_time': '09:00',
#                 'end_time': '17:00',
#                 'available_days': ['mon', 'tue', 'wed', 'thu', 'fri'],
#                 'timezone': 'Africa/Nairobi'
#             }
            
#             serializer = TimeVariantConfigSerializer(data=test_data)
            
#             if serializer.is_valid():
#                 config = serializer.save()
                
#                 # Test availability
#                 is_available = config.is_available_now()
#                 summary = config.get_availability_summary()
#                 next_available = config.get_next_available_time()
                
#                 return Response({
#                     'success': True,
#                     'test_config': serializer.data,
#                     'results': {
#                         'is_available_now': is_available,
#                         'summary': summary,
#                         'next_available_time': next_available
#                     },
#                     'current_time': timezone.now().isoformat(),
#                     'current_day': timezone.now().strftime('%A'),
#                     'current_time_local': timezone.now().strftime('%H:%M:%S')
#                 })
#             else:
#                 return Response({
#                     'success': False,
#                     'error': 'Test configuration invalid',
#                     'details': serializer.errors
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#         except Exception as e:
#             logger.error(f"Failed to test time variant: {e}", exc_info=True)
#             return Response({
#                 'success': False,
#                 'error': 'Failed to test time variant',
#                 'details': str(e)
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)








# """
# Internet Plans - Plan Views with Time Variant Support
# CORRECTED: Fixed imports and serializer usage
# """

# from django.shortcuts import get_object_or_404
# from django.db.models import Q, Count, Sum, Avg
# from django.utils import timezone
# from django.db import transaction
# from django.core.cache import cache
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
# from rest_framework.pagination import PageNumberPagination
# from rest_framework import status
# from rest_framework.throttling import UserRateThrottle
# import logging
# from datetime import datetime, timedelta
# from decimal import Decimal

# from internet_plans.models.plan_models import InternetPlan, TimeVariantConfig, PlanTemplate
# # FIXED: Correct serializer imports
# from internet_plans.serializers.plan_serializers import (
#     InternetPlanSerializer,
#     InternetPlanListSerializer,
#     InternetPlanCreateSerializer,
#     InternetPlanUpdateSerializer,
#     TimeVariantConfigSerializer,
#     PlanCompatibilitySerializer,
#     PlanAvailabilityCheckSerializer,
#     AvailablePlansRequestSerializer
# )
# from internet_plans.utils.formatters import format_plan_summary
# from internet_plans.services.plan_service import PlanService

# logger = logging.getLogger(__name__)


# class StandardPagination(PageNumberPagination):
#     """Standard pagination class"""
#     page_size = 20
#     page_size_query_param = 'page_size'
#     max_page_size = 100
    
#     def get_paginated_response(self, data):
#         return Response({
#             'success': True,
#             'count': self.page.paginator.count,
#             'next': self.get_next_link(),
#             'previous': self.get_previous_link(),
#             'results': data,
#             'page': self.page.number,
#             'total_pages': self.page.paginator.num_pages
#         })


# class InternetPlanListView(APIView):
#     """
#     List and create Internet Plans with Time Variant Support
#     GET: List plans with filtering (including time availability)
#     POST: Create new plan with time variant
#     """
    
#     permission_classes = [IsAuthenticated]
#     pagination_class = StandardPagination
#     throttle_classes = [UserRateThrottle]
    
#     def get(self, request):
#         """Get list of plans with filtering"""
#         try:
#             # Use efficient querying
#             filters = self._extract_filters(request)
#             page = int(request.query_params.get('page', 1))
#             page_size = int(request.query_params.get('page_size', 20))
            
#             # Start with active plans
#             queryset = InternetPlan.objects.filter(active=True).select_related('time_variant')
            
#             # Apply filters
#             if filters.get('category'):
#                 queryset = queryset.filter(category=filters['category'])
            
#             if filters.get('plan_type'):
#                 queryset = queryset.filter(plan_type=filters['plan_type'])
            
#             if filters.get('access_method'):
#                 if filters['access_method'] == 'hotspot':
#                     queryset = queryset.filter(access_methods__hotspot__enabled=True)
#                 elif filters['access_method'] == 'pppoe':
#                     queryset = queryset.filter(access_methods__pppoe__enabled=True)
#                 elif filters['access_method'] == 'dual':
#                     queryset = queryset.filter(
#                         access_methods__hotspot__enabled=True,
#                         access_methods__pppoe__enabled=True
#                     )
            
#             if filters.get('has_time_variant') is not None:
#                 if filters['has_time_variant']:
#                     queryset = queryset.filter(time_variant__is_active=True)
#                 else:
#                     queryset = queryset.filter(Q(time_variant__isnull=True) | Q(time_variant__is_active=False))
            
#             if filters.get('available_now'):
#                 # Filter plans that are available now
#                 available_plan_ids = []
#                 all_plans = list(queryset)
                
#                 for plan in all_plans:
#                     availability = plan.is_available_for_client()
#                     if availability.get('available'):
#                         available_plan_ids.append(plan.id)
                
#                 queryset = queryset.filter(id__in=available_plan_ids)
            
#             if filters.get('search'):
#                 queryset = queryset.filter(
#                     Q(name__icontains=filters['search']) |
#                     Q(description__icontains=filters['search'])
#                 )
            
#             if filters.get('min_price') is not None:
#                 queryset = queryset.filter(price__gte=filters['min_price'])
            
#             if filters.get('max_price') is not None:
#                 queryset = queryset.filter(price__lte=filters['max_price'])
            
#             # Count and paginate
#             total_count = queryset.count()
#             total_pages = (total_count + page_size - 1) // page_size
            
#             # Apply sorting
#             sort_by = filters.get('sort_by', 'name')
#             sort_order = filters.get('sort_order', 'asc')
#             sort_field = f'-{sort_by}' if sort_order == 'desc' else sort_by
#             queryset = queryset.order_by(sort_field)
            
#             # Paginate manually for now
#             offset = (page - 1) * page_size
#             plans = list(queryset[offset:offset + page_size])
            
#             # Serialize plans - FIXED: Use correct serializer
#             serializer = InternetPlanListSerializer(plans, many=True, context={'request': request})
            
#             return Response({
#                 'success': True,
#                 'count': total_count,
#                 'next': f"?page={page + 1}&page_size={page_size}" if page < total_pages else None,
#                 'previous': f"?page={page - 1}&page_size={page_size}" if page > 1 else None,
#                 'results': serializer.data,
#                 'page': page,
#                 'page_size': page_size,
#                 'total_pages': total_pages,
#                 'filters_applied': filters
#             })
            
#         except Exception as e:
#             logger.error(f"Failed to get plans: {e}", exc_info=True)
#             return Response({
#                 'success': False,
#                 'error': 'Failed to load plans',
#                 'details': str(e) if request.user.is_staff else None
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
#     def post(self, request):
#         """Create new plan with time variant support"""
#         if not request.user.is_staff:
#             return Response({
#                 'success': False,
#                 'error': 'Permission denied'
#             }, status=status.HTTP_403_FORBIDDEN)
        
#         try:
#             # Check for duplicate name
#             plan_name = request.data.get('name', '')
#             if plan_name and InternetPlan.objects.filter(name=plan_name).exists():
#                 return Response({
#                     'success': False,
#                     'error': f'A plan with the name "{plan_name}" already exists'
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             serializer = InternetPlanCreateSerializer(
#                 data=request.data,
#                 context={'request': request}
#             )
            
#             if not serializer.is_valid():
#                 return Response({
#                     'success': False,
#                     'error': 'Validation failed',
#                     'details': serializer.errors
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             with transaction.atomic():
#                 plan = serializer.save()
                
#                 # Log the creation
#                 logger.info(f"Plan created: {plan.name} (ID: {plan.id}) by {request.user.username}")
                
#                 return Response({
#                     'success': True,
#                     'message': 'Plan created successfully',
#                     'plan': InternetPlanSerializer(plan, context={'request': request}).data
#                 }, status=status.HTTP_201_CREATED)
            
#         except Exception as e:
#             logger.error(f"Failed to create plan: {e}", exc_info=True)
#             return Response({
#                 'success': False,
#                 'error': 'Failed to create plan',
#                 'details': str(e) if request.user.is_staff else None
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
#     def _extract_filters(self, request):
#         """Extract and validate filters from request"""
#         filters = {}
        
#         # Active filter
#         if active := request.query_params.get('active'):
#             filters['active'] = active.lower() == 'true'
        
#         # Category filter
#         if category := request.query_params.get('category'):
#             filters['category'] = category
        
#         # Plan type filter
#         if plan_type := request.query_params.get('plan_type'):
#             filters['plan_type'] = plan_type
        
#         # Access method filter
#         if access_method := request.query_params.get('access_method'):
#             filters['access_method'] = access_method
        
#         # Time variant filter
#         if time_variant := request.query_params.get('time_variant'):
#             if time_variant.lower() == 'active':
#                 filters['has_time_variant'] = True
#             elif time_variant.lower() == 'inactive':
#                 filters['has_time_variant'] = False
        
#         # Availability filter
#         if available_now := request.query_params.get('available_now'):
#             filters['available_now'] = available_now.lower() == 'true'
        
#         # Search filter
#         if search := request.query_params.get('search'):
#             filters['search'] = search
        
#         # Price range filter
#         if min_price := request.query_params.get('min_price'):
#             try:
#                 filters['min_price'] = Decimal(min_price)
#             except (ValueError, TypeError):
#                 pass
        
#         if max_price := request.query_params.get('max_price'):
#             try:
#                 filters['max_price'] = Decimal(max_price)
#             except (ValueError, TypeError):
#                 pass
        
#         # Template filter
#         if template_id := request.query_params.get('template_id'):
#             filters['template_id'] = template_id
        
#         # Sorting
#         if sort_by := request.query_params.get('sort_by'):
#             filters['sort_by'] = sort_by
        
#         if sort_order := request.query_params.get('sort_order'):
#             filters['sort_order'] = sort_order
        
#         return filters


# class InternetPlanDetailView(APIView):
#     """
#     Retrieve, update, or delete an Internet Plan with Time Variant
#     """
    
#     permission_classes = [IsAuthenticated]
#     throttle_classes = [UserRateThrottle]
    
#     def get(self, request, plan_id):
#         """Get plan details with time variant info"""
#         try:
#             # Get plan
#             plan = get_object_or_404(InternetPlan, id=plan_id)
            
#             # Check permissions for inactive plans
#             if not plan.active and not request.user.is_staff:
#                 return Response({
#                     'success': False,
#                     'error': 'Plan not available'
#                 }, status=status.HTTP_404_NOT_FOUND)
            
#             serializer = InternetPlanSerializer(plan, context={'request': request})
            
#             # Add pricing information
#             from internet_plans.services.pricing_service import PricingService
#             pricing_info = PricingService.get_pricing_options(plan)
            
#             # Add time variant availability
#             availability = plan.is_available_for_client()
            
#             response_data = {
#                 'success': True,
#                 'plan': serializer.data,
#                 'pricing_options': pricing_info,
#                 'summary': format_plan_summary(plan),
#                 'availability': availability,
#                 'compatibility': {
#                     'supported_access_methods': plan.get_enabled_access_methods(),
#                     'router_specific': plan.router_specific,
#                     'allowed_routers_count': plan.allowed_routers.count() if plan.router_specific else 'All'
#                 }
#             }
            
#             return Response(response_data)
            
#         except InternetPlan.DoesNotExist:
#             return Response({
#                 'success': False,
#                 'error': 'Plan not found'
#             }, status=status.HTTP_404_NOT_FOUND)
#         except Exception as e:
#             logger.error(f"Failed to get plan {plan_id}: {e}", exc_info=True)
#             return Response({
#                 'success': False,
#                 'error': 'Failed to load plan details'
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
#     def put(self, request, plan_id):
#         """Update plan with time variant support"""
#         if not request.user.is_staff:
#             return Response({
#                 'success': False,
#                 'error': 'Permission denied'
#             }, status=status.HTTP_403_FORBIDDEN)
        
#         try:
#             plan = get_object_or_404(InternetPlan, id=plan_id)
            
#             # Check for duplicate name
#             new_name = request.data.get('name')
#             if new_name and new_name != plan.name:
#                 if InternetPlan.objects.filter(name=new_name).exclude(id=plan_id).exists():
#                     return Response({
#                         'success': False,
#                         'error': f'A plan with the name "{new_name}" already exists'
#                     }, status=status.HTTP_400_BAD_REQUEST)
            
#             serializer = InternetPlanUpdateSerializer(
#                 plan, 
#                 data=request.data, 
#                 partial=True,
#                 context={'request': request}
#             )
            
#             if not serializer.is_valid():
#                 return Response({
#                     'success': False,
#                     'error': 'Validation failed',
#                     'details': serializer.errors
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             # Track price changes
#             old_price = plan.price
            
#             with transaction.atomic():
#                 updated_plan = serializer.save()
                
#                 # Log price change
#                 if old_price != updated_plan.price:
#                     logger.info(
#                         f"Plan price changed: {plan_id} - {old_price} to {updated_plan.price} "
#                         f"by {request.user.username}"
#                     )
                
#                 # Log update
#                 logger.info(f"Plan updated: {plan_id} by {request.user.username}")
                
#                 return Response({
#                     'success': True,
#                     'message': 'Plan updated successfully',
#                     'plan': InternetPlanSerializer(updated_plan, context={'request': request}).data
#                 })
            
#         except InternetPlan.DoesNotExist:
#             return Response({
#                 'success': False,
#                 'error': 'Plan not found'
#             }, status=status.HTTP_404_NOT_FOUND)
#         except Exception as e:
#             logger.error(f"Failed to update plan {plan_id}: {e}", exc_info=True)
#             return Response({
#                 'success': False,
#                 'error': 'Failed to update plan',
#                 'details': str(e) if request.user.is_staff else None
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
#     def delete(self, request, plan_id):
#         """Delete (deactivate) plan"""
#         if not request.user.is_staff:
#             return Response({
#                 'success': False,
#                 'error': 'Permission denied'
#             }, status=status.HTTP_403_FORBIDDEN)
        
#         try:
#             plan = get_object_or_404(InternetPlan, id=plan_id)
            
#             # Check if plan has active subscriptions
#             try:
#                 from service_operations.models.subscription_models import Subscription
#                 active_subs = Subscription.objects.filter(
#                     internet_plan=plan,
#                     status='active',
#                     is_active=True
#                 ).exists()
                
#                 if active_subs:
#                     return Response({
#                         'success': False,
#                         'error': 'Cannot deactivate plan with active subscriptions'
#                     }, status=status.HTTP_400_BAD_REQUEST)
#             except ImportError:
#                 # Subscription model not available, proceed with caution
#                 logger.warning("Subscription model not available, skipping subscription check")
            
#             # Soft delete (deactivate)
#             plan.active = False
#             plan.save()
            
#             # Clear cache
#             cache.delete(f"internet_plan:{plan_id}")
#             cache.delete_pattern("internet_plans:*")
            
#             # Log deactivation
#             logger.info(f"Plan deactivated: {plan_id} by {request.user.username}")
            
#             return Response({
#                 'success': True,
#                 'message': 'Plan deactivated successfully'
#             })
            
#         except InternetPlan.DoesNotExist:
#             return Response({
#                 'success': False,
#                 'error': 'Plan not found'
#             }, status=status.HTTP_404_NOT_FOUND)
#         except Exception as e:
#             logger.error(f"Failed to deactivate plan {plan_id}: {e}", exc_info=True)
#             return Response({
#                 'success': False,
#                 'error': 'Failed to deactivate plan'
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# class TimeVariantConfigView(APIView):
#     """
#     Manage Time Variant Configurations
#     """
    
#     permission_classes = [IsAuthenticated]
#     throttle_classes = [UserRateThrottle]
    
#     def get(self, request, config_id=None):
#         """Get time variant configuration(s)"""
#         if not request.user.is_staff:
#             return Response({
#                 'success': False,
#                 'error': 'Permission denied'
#             }, status=status.HTTP_403_FORBIDDEN)
        
#         try:
#             if config_id:
#                 # Get specific configuration
#                 config = get_object_or_404(TimeVariantConfig, id=config_id)
#                 serializer = TimeVariantConfigSerializer(config, context={'request': request})
                
#                 # Add usage information
#                 usage_info = {
#                     'used_by_plans': InternetPlan.objects.filter(time_variant=config).count(),
#                     'used_by_templates': PlanTemplate.objects.filter(time_variant=config).count()
#                 }
                
#                 return Response({
#                     'success': True,
#                     'config': serializer.data,
#                     'usage': usage_info
#                 })
            
#             else:
#                 # List all configurations with filtering
#                 queryset = TimeVariantConfig.objects.all()
                
#                 # Apply filters
#                 is_active = request.query_params.get('is_active')
#                 if is_active is not None:
#                     queryset = queryset.filter(is_active=is_active.lower() == 'true')
                
#                 search = request.query_params.get('search')
#                 if search:
#                     queryset = queryset.filter(
#                         Q(id__icontains=search)
#                     )
                
#                 # Paginate
#                 paginator = StandardPagination()
#                 page = paginator.paginate_queryset(queryset, request)
                
#                 serializer = TimeVariantConfigSerializer(page, many=True, context={'request': request})
                
#                 return paginator.get_paginated_response(serializer.data)
            
#         except Exception as e:
#             logger.error(f"Failed to get time variant configs: {e}", exc_info=True)
#             return Response({
#                 'success': False,
#                 'error': 'Failed to load configurations',
#                 'details': str(e) if request.user.is_staff else None
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
#     def post(self, request):
#         """Create new time variant configuration"""
#         if not request.user.is_staff:
#             return Response({
#                 'success': False,
#                 'error': 'Permission denied'
#             }, status=status.HTTP_403_FORBIDDEN)
        
#         try:
#             serializer = TimeVariantConfigSerializer(
#                 data=request.data,
#                 context={'request': request}
#             )
            
#             if not serializer.is_valid():
#                 return Response({
#                     'success': False,
#                     'error': 'Validation failed',
#                     'details': serializer.errors
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             config = serializer.save()
            
#             logger.info(f"Time variant config created: {config.id} by {request.user.username}")
            
#             return Response({
#                 'success': True,
#                 'message': 'Time variant configuration created successfully',
#                 'config': TimeVariantConfigSerializer(config, context={'request': request}).data
#             }, status=status.HTTP_201_CREATED)
            
#         except Exception as e:
#             logger.error(f"Failed to create time variant config: {e}", exc_info=True)
#             return Response({
#                 'success': False,
#                 'error': 'Failed to create configuration',
#                 'details': str(e) if request.user.is_staff else None
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
#     def put(self, request, config_id):
#         """Update time variant configuration"""
#         if not request.user.is_staff:
#             return Response({
#                 'success': False,
#                 'error': 'Permission denied'
#             }, status=status.HTTP_403_FORBIDDEN)
        
#         try:
#             config = get_object_or_404(TimeVariantConfig, id=config_id)
            
#             serializer = TimeVariantConfigSerializer(
#                 config,
#                 data=request.data,
#                 partial=True,
#                 context={'request': request}
#             )
            
#             if not serializer.is_valid():
#                 return Response({
#                     'success': False,
#                     'error': 'Validation failed',
#                     'details': serializer.errors
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             updated_config = serializer.save()
            
#             # Clear related plan caches
#             plan_ids = InternetPlan.objects.filter(time_variant=config).values_list('id', flat=True)
#             for plan_id in plan_ids:
#                 cache.delete(f"internet_plan:{plan_id}")
#             cache.delete_pattern("available_plans:*")
            
#             logger.info(f"Time variant config updated: {config_id} by {request.user.username}")
            
#             return Response({
#                 'success': True,
#                 'message': 'Time variant configuration updated successfully',
#                 'config': TimeVariantConfigSerializer(updated_config, context={'request': request}).data
#             })
            
#         except TimeVariantConfig.DoesNotExist:
#             return Response({
#                 'success': False,
#                 'error': 'Configuration not found'
#             }, status=status.HTTP_404_NOT_FOUND)
#         except Exception as e:
#             logger.error(f"Failed to update time variant config {config_id}: {e}", exc_info=True)
#             return Response({
#                 'success': False,
#                 'error': 'Failed to update configuration',
#                 'details': str(e) if request.user.is_staff else None
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
#     def delete(self, request, config_id):
#         """Delete time variant configuration"""
#         if not request.user.is_staff:
#             return Response({
#                 'success': False,
#                 'error': 'Permission denied'
#             }, status=status.HTTP_403_FORBIDDEN)
        
#         try:
#             config = get_object_or_404(TimeVariantConfig, id=config_id)
            
#             # Check if config is in use
#             plan_count = InternetPlan.objects.filter(time_variant=config).count()
#             template_count = PlanTemplate.objects.filter(time_variant=config).count()
            
#             if plan_count > 0 or template_count > 0:
#                 return Response({
#                     'success': False,
#                     'error': f'Cannot delete configuration used by {plan_count} plan(s) and {template_count} template(s)',
#                     'usage': {
#                         'plans': plan_count,
#                         'templates': template_count
#                     }
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             config.delete()
            
#             logger.info(f"Time variant config deleted: {config_id} by {request.user.username}")
            
#             return Response({
#                 'success': True,
#                 'message': 'Time variant configuration deleted successfully'
#             })
            
#         except TimeVariantConfig.DoesNotExist:
#             return Response({
#                 'success': False,
#                 'error': 'Configuration not found'
#             }, status=status.HTTP_404_NOT_FOUND)
#         except Exception as e:
#             logger.error(f"Failed to delete time variant config {config_id}: {e}", exc_info=True)
#             return Response({
#                 'success': False,
#                 'error': 'Failed to delete configuration'
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# class PlanAvailabilityCheckView(APIView):
#     """
#     Check plan availability for clients
#     """
    
#     permission_classes = [AllowAny]  # Allow access from captive portal
#     throttle_classes = [UserRateThrottle]
    
#     def post(self, request):
#         """Check plan availability"""
#         try:
#             serializer = PlanAvailabilityCheckSerializer(data=request.data)
            
#             if not serializer.is_valid():
#                 return Response({
#                     'success': False,
#                     'error': 'Validation failed',
#                     'details': serializer.errors
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             # Get the validated plan from context
#             plan = serializer.context.get('plan')
            
#             # Check availability
#             availability = plan.is_available_for_client()
            
#             result = {
#                 'plan_id': str(plan.id),
#                 'plan_name': plan.name,
#                 'plan_active': plan.active,
#                 'availability': availability,
#                 'time_variant_info': plan.get_time_variant_summary()
#             }
            
#             return Response({
#                 'success': True,
#                 'data': result
#             })
            
#         except Exception as e:
#             logger.error(f"Failed to check plan availability: {e}", exc_info=True)
#             return Response({
#                 'success': False,
#                 'error': 'Failed to check availability',
#                 'timestamp': timezone.now().isoformat()
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# class AvailablePlansView(APIView):
#     """
#     Get available plans for clients (for captive portal)
#     """
    
#     permission_classes = [AllowAny]  # Allow access from captive portal
#     throttle_classes = [UserRateThrottle]
    
#     def post(self, request):
#         """Get available plans based on client type and filters"""
#         try:
#             serializer = AvailablePlansRequestSerializer(data=request.data)
            
#             if not serializer.is_valid():
#                 return Response({
#                     'success': False,
#                     'error': 'Validation failed',
#                     'details': serializer.errors
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             result = serializer.get_available_plans()
            
#             return Response({
#                 'success': True,
#                 'data': result
#             })
            
#         except Exception as e:
#             logger.error(f"Failed to get available plans: {e}", exc_info=True)
#             return Response({
#                 'success': False,
#                 'error': 'Failed to get available plans',
#                 'timestamp': timezone.now().isoformat()
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
#     def get(self, request):
#         """Get available plans with query parameters (for GET requests)"""
#         try:
#             # Convert GET parameters to serializer data
#             data = {
#                 'client_type': request.query_params.get('client_type', 'hotspot'),
#                 'router_id': request.query_params.get('router_id'),
#                 'category': request.query_params.get('category'),
#                 'max_price': request.query_params.get('max_price'),
#                 'include_unavailable': request.query_params.get('include_unavailable', 'false').lower() == 'true'
#             }
            
#             # Remove None values
#             data = {k: v for k, v in data.items() if v is not None}
            
#             serializer = AvailablePlansRequestSerializer(data=data)
            
#             if not serializer.is_valid():
#                 return Response({
#                     'success': False,
#                     'error': 'Validation failed',
#                     'details': serializer.errors
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             result = serializer.get_available_plans()
            
#             return Response({
#                 'success': True,
#                 'data': result
#             })
            
#         except Exception as e:
#             logger.error(f"Failed to get available plans: {e}", exc_info=True)
#             return Response({
#                 'success': False,
#                 'error': 'Failed to get available plans',
#                 'timestamp': timezone.now().isoformat()
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# class PublicInternetPlanListView(APIView):
#     """
#     Public API for listing available Internet Plans
#     No authentication required
#     """
    
#     permission_classes = [AllowAny]
#     throttle_classes = [UserRateThrottle]
    
#     def get(self, request):
#         """Get public list of available plans"""
#         try:
#             # Determine client type from request (default to hotspot)
#             client_type = request.query_params.get('client_type', 'hotspot')
            
#             # Cache key
#             cache_key = f"public_available_plans:{client_type}:{request.GET.urlencode()}"
#             cached_data = cache.get(cache_key)
            
#             if cached_data:
#                 return Response(cached_data)
            
#             # Use AvailablePlansRequestSerializer for consistency
#             data = {
#                 'client_type': client_type,
#                 'router_id': request.query_params.get('router_id'),
#                 'category': request.query_params.get('category'),
#                 'max_price': request.query_params.get('max_price'),
#                 'include_unavailable': False  # Public API only shows available plans
#             }
            
#             # Remove None values
#             data = {k: v for k, v in data.items() if v is not None}
            
#             serializer = AvailablePlansRequestSerializer(data=data, context={'request': request})
            
#             if not serializer.is_valid():
#                 return Response({
#                     'success': False,
#                     'error': 'Validation failed',
#                     'details': serializer.errors
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             result = serializer.get_available_plans()
            
#             response_data = {
#                 'success': True,
#                 'count': result['count'],
#                 'client_type': client_type,
#                 'plans': result['plans'],
#                 'timestamp': timezone.now().isoformat()
#             }
            
#             # Cache for 1 minute (time-sensitive)
#             cache.set(cache_key, response_data, 60)
            
#             return Response(response_data)
            
#         except Exception as e:
#             logger.error(f"Failed to get public plans: {e}", exc_info=True)
#             return Response({
#                 'success': False,
#                 'error': 'Failed to load plans',
#                 'timestamp': timezone.now().isoformat()
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# class PlanStatisticsView(APIView):
#     """
#     Get statistics about plans
#     """
    
#     permission_classes = [IsAuthenticated]
    
#     def get(self, request):
#         """Get plan statistics including time variant stats"""
#         try:
#             stats = PlanService.get_plan_statistics()
            
#             if 'error' in stats:
#                 return Response({
#                     'success': False,
#                     'error': stats['error']
#                 }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
#             return Response({
#                 'success': True,
#                 'statistics': stats
#             })
            
#         except Exception as e:
#             logger.error(f"Failed to get plan statistics: {e}", exc_info=True)
#             return Response({
#                 'success': False,
#                 'error': 'Failed to get statistics',
#                 'timestamp': timezone.now().isoformat()
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# class PlanCompatibilityCheckView(APIView):
#     """
#     Check plan compatibility
#     """
    
#     permission_classes = [IsAuthenticated]
#     throttle_classes = [UserRateThrottle]
    
#     def post(self, request):
#         """Check plan compatibility including time availability"""
#         try:
#             serializer = PlanCompatibilitySerializer(data=request.data)
            
#             if not serializer.is_valid():
#                 return Response({
#                     'success': False,
#                     'error': 'Validation failed',
#                     'details': serializer.errors
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             # Get compatibility result from serializer
#             result = serializer.get_compatibility_result()
            
#             if not result:
#                 return Response({
#                     'success': False,
#                     'error': 'Failed to check compatibility'
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             return Response({
#                 'success': True,
#                 'compatibility': result
#             })
            
#         except Exception as e:
#             logger.error(f"Failed to check plan compatibility: {e}", exc_info=True)
#             return Response({
#                 'success': False,
#                 'error': 'Failed to check compatibility',
#                 'details': str(e) if request.user.is_staff else None
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# class PlanRecommendationView(APIView):
#     """
#     Get plan recommendations
#     """
    
#     permission_classes = [IsAuthenticated]
#     throttle_classes = [UserRateThrottle]
    
#     def get(self, request):
#         """Get plan recommendations considering availability"""
#         try:
#             # Extract parameters
#             client_type = request.query_params.get('client_type')
#             budget = request.query_params.get('budget')
#             access_method = request.query_params.get('access_method')
#             limit = int(request.query_params.get('limit', 5))
            
#             # Parse budget
#             budget_value = None
#             if budget:
#                 try:
#                     budget_value = float(budget)
#                 except ValueError:
#                     return Response({
#                         'success': False,
#                         'error': 'Invalid budget format'
#                     }, status=status.HTTP_400_BAD_REQUEST)
            
#             # Get recommendations
#             recommendations = PlanService.get_recommended_plans(
#                 client_type=client_type,
#                 budget=budget_value,
#                 access_method=access_method,
#                 limit=limit
#             )
            
#             return Response({
#                 'success': True,
#                 'recommendations': recommendations,
#                 'criteria': {
#                     'client_type': client_type,
#                     'budget': budget_value,
#                     'access_method': access_method,
#                     'limit': limit
#                 },
#                 'timestamp': timezone.now().isoformat()
#             })
            
#         except Exception as e:
#             logger.error(f"Failed to get plan recommendations: {e}")
#             return Response({
#                 'success': False,
#                 'error': 'Failed to get recommendations',
#                 'timestamp': timezone.now().isoformat()
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# class TimeVariantTestView(APIView):
#     """
#     Test time variant configurations
#     """
    
#     permission_classes = [IsAdminUser]
#     throttle_classes = [UserRateThrottle]
    
#     def post(self, request):
#         """Test time variant configuration"""
#         try:
#             # Create a test time variant
#             test_data = {
#                 'is_active': True,
#                 'start_time': '09:00',
#                 'end_time': '17:00',
#                 'available_days': ['mon', 'tue', 'wed', 'thu', 'fri'],
#                 'timezone': 'Africa/Nairobi'
#             }
            
#             serializer = TimeVariantConfigSerializer(data=test_data)
            
#             if serializer.is_valid():
#                 config = serializer.save()
                
#                 # Test availability
#                 is_available = config.is_available_now()
#                 summary = config.get_availability_summary()
#                 next_available = config.get_next_available_time()
                
#                 return Response({
#                     'success': True,
#                     'test_config': serializer.data,
#                     'results': {
#                         'is_available_now': is_available,
#                         'summary': summary,
#                         'next_available_time': next_available
#                     },
#                     'current_time': timezone.now().isoformat(),
#                     'current_day': timezone.now().strftime('%A'),
#                     'current_time_local': timezone.now().strftime('%H:%M:%S')
#                 })
#             else:
#                 return Response({
#                     'success': False,
#                     'error': 'Test configuration invalid',
#                     'details': serializer.errors
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#         except Exception as e:
#             logger.error(f"Failed to test time variant: {e}", exc_info=True)
#             return Response({
#                 'success': False,
#                 'error': 'Failed to test time variant',
#                 'details': str(e)
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)






# """
# Internet Plans - Plan Views with Time Variant Support
# PRODUCTION-READY: Complete with proper error handling, caching, and security
# """

# from django.shortcuts import get_object_or_404
# from django.db.models import Q, Count, Sum, Avg
# from django.utils import timezone
# from django.db import transaction
# from django.core.cache import cache
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
# from rest_framework.pagination import PageNumberPagination
# from rest_framework import status
# from rest_framework.throttling import UserRateThrottle
# import logging
# from datetime import datetime, timedelta
# from decimal import Decimal

# from internet_plans.models.plan_models import InternetPlan, TimeVariantConfig, PlanTemplate
# from internet_plans.serializers.plan_serializers import (
#     InternetPlanSerializer,
#     InternetPlanListSerializer,
#     InternetPlanCreateSerializer,
#     InternetPlanUpdateSerializer,
#     TimeVariantConfigSerializer,
#     PlanCompatibilitySerializer,
#     PlanAvailabilityCheckSerializer,
#     AvailablePlansRequestSerializer
# )
# from internet_plans.utils.formatters import format_plan_summary
# from internet_plans.services.plan_service import PlanService

# logger = logging.getLogger(__name__)


# class StandardPagination(PageNumberPagination):
#     """Standard pagination class"""
#     page_size = 20
#     page_size_query_param = 'page_size'
#     max_page_size = 100
    
#     def get_paginated_response(self, data):
#         return Response({
#             'success': True,
#             'count': self.page.paginator.count,
#             'next': self.get_next_link(),
#             'previous': self.get_previous_link(),
#             'results': data,
#             'page': self.page.number,
#             'total_pages': self.page.paginator.num_pages
#         })




# class InternetPlanDetailView(APIView):
#     """
#     Retrieve, update, or delete an Internet Plan with Time Variant
#     """
    
#     permission_classes = [IsAuthenticated]
#     throttle_classes = [UserRateThrottle]
    
#     def get(self, request, plan_id):
#         """Get plan details with time variant info"""
#         try:
#             # Get plan
#             plan = get_object_or_404(InternetPlan, id=plan_id)
            
#             # Check permissions for inactive plans
#             if not plan.active and not request.user.is_staff:
#                 return Response({
#                     'success': False,
#                     'error': 'Plan not available'
#                 }, status=status.HTTP_404_NOT_FOUND)
            
#             serializer = InternetPlanSerializer(plan, context={'request': request})
            
#             # Add pricing information
#             from internet_plans.services.pricing_service import PricingService
#             pricing_info = PricingService.get_pricing_options(plan)
            
#             # Add time variant availability
#             availability = plan.is_available_for_client()
            
#             response_data = {
#                 'success': True,
#                 'plan': serializer.data,
#                 'pricing_options': pricing_info,
#                 'summary': format_plan_summary(plan),
#                 'availability': availability,
#                 'compatibility': {
#                     'supported_access_methods': plan.get_enabled_access_methods(),
#                     'router_specific': plan.router_specific,
#                     'allowed_routers_count': plan.allowed_routers.count() if plan.router_specific else 'All'
#                 }
#             }
            
#             return Response(response_data)
            
#         except InternetPlan.DoesNotExist:
#             return Response({
#                 'success': False,
#                 'error': 'Plan not found'
#             }, status=status.HTTP_404_NOT_FOUND)
#         except Exception as e:
#             logger.error(f"Failed to get plan {plan_id}: {e}", exc_info=True)
#             return Response({
#                 'success': False,
#                 'error': 'Failed to load plan details'
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
#     def put(self, request, plan_id):
#         """Update plan with time variant support"""
#         if not request.user.is_staff:
#             return Response({
#                 'success': False,
#                 'error': 'Permission denied'
#             }, status=status.HTTP_403_FORBIDDEN)
        
#         try:
#             plan = get_object_or_404(InternetPlan, id=plan_id)
            
#             # Check for duplicate name
#             new_name = request.data.get('name')
#             if new_name and new_name != plan.name:
#                 if InternetPlan.objects.filter(name=new_name).exclude(id=plan_id).exists():
#                     return Response({
#                         'success': False,
#                         'error': f'A plan with the name "{new_name}" already exists'
#                     }, status=status.HTTP_400_BAD_REQUEST)
            
#             serializer = InternetPlanUpdateSerializer(
#                 plan, 
#                 data=request.data, 
#                 partial=True,
#                 context={'request': request}
#             )
            
#             if not serializer.is_valid():
#                 return Response({
#                     'success': False,
#                     'error': 'Validation failed',
#                     'details': serializer.errors
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             # Track price changes
#             old_price = plan.price
            
#             with transaction.atomic():
#                 updated_plan = serializer.save()
                
#                 # Log price change
#                 if old_price != updated_plan.price:
#                     logger.info(
#                         f"Plan price changed: {plan_id} - {old_price} to {updated_plan.price} "
#                         f"by {request.user.username}"
#                     )
                
#                 # Log update
#                 logger.info(f"Plan updated: {plan_id} by {request.user.username}")
                
#                 return Response({
#                     'success': True,
#                     'message': 'Plan updated successfully',
#                     'plan': InternetPlanSerializer(updated_plan, context={'request': request}).data
#                 })
            
#         except InternetPlan.DoesNotExist:
#             return Response({
#                 'success': False,
#                 'error': 'Plan not found'
#             }, status=status.HTTP_404_NOT_FOUND)
#         except Exception as e:
#             logger.error(f"Failed to update plan {plan_id}: {e}", exc_info=True)
#             return Response({
#                 'success': False,
#                 'error': 'Failed to update plan',
#                 'details': str(e) if request.user.is_staff else None
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
#     def delete(self, request, plan_id):
#         """Delete (deactivate) plan"""
#         if not request.user.is_staff:
#             return Response({
#                 'success': False,
#                 'error': 'Permission denied'
#             }, status=status.HTTP_403_FORBIDDEN)
        
#         try:
#             plan = get_object_or_404(InternetPlan, id=plan_id)
            
#             # Check if plan has active subscriptions
#             try:
#                 from service_operations.models.subscription_models import Subscription
#                 active_subs = Subscription.objects.filter(
#                     internet_plan=plan,
#                     status='active',
#                     is_active=True
#                 ).exists()
                
#                 if active_subs:
#                     return Response({
#                         'success': False,
#                         'error': 'Cannot deactivate plan with active subscriptions'
#                     }, status=status.HTTP_400_BAD_REQUEST)
#             except ImportError:
#                 # Subscription model not available, proceed with caution
#                 logger.warning("Subscription model not available, skipping subscription check")
            
#             # Soft delete (deactivate)
#             plan.active = False
#             plan.save()
            
#             # Clear cache
#             cache.delete(f"internet_plan:{plan_id}")
#             cache.delete_pattern("internet_plans:*")
            
#             # Log deactivation
#             logger.info(f"Plan deactivated: {plan_id} by {request.user.username}")
            
#             return Response({
#                 'success': True,
#                 'message': 'Plan deactivated successfully'
#             })
            
#         except InternetPlan.DoesNotExist:
#             return Response({
#                 'success': False,
#                 'error': 'Plan not found'
#             }, status=status.HTTP_404_NOT_FOUND)
#         except Exception as e:
#             logger.error(f"Failed to deactivate plan {plan_id}: {e}", exc_info=True)
#             return Response({
#                 'success': False,
#                 'error': 'Failed to deactivate plan'
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# class TimeVariantConfigView(APIView):
#     """
#     Manage Time Variant Configurations
#     """
    
#     permission_classes = [IsAuthenticated]
#     throttle_classes = [UserRateThrottle]
    
#     def get(self, request, config_id=None):
#         """Get time variant configuration(s)"""
#         if not request.user.is_staff:
#             return Response({
#                 'success': False,
#                 'error': 'Permission denied'
#             }, status=status.HTTP_403_FORBIDDEN)
        
#         try:
#             if config_id:
#                 # Get specific configuration
#                 config = get_object_or_404(TimeVariantConfig, id=config_id)
#                 serializer = TimeVariantConfigSerializer(config, context={'request': request})
                
#                 # Add usage information
#                 usage_info = {
#                     'used_by_plans': InternetPlan.objects.filter(time_variant=config).count(),
#                     'used_by_templates': PlanTemplate.objects.filter(time_variant=config).count()
#                 }
                
#                 return Response({
#                     'success': True,
#                     'config': serializer.data,
#                     'usage': usage_info
#                 })
            
#             else:
#                 # List all configurations with filtering
#                 queryset = TimeVariantConfig.objects.all()
                
#                 # Apply filters
#                 is_active = request.query_params.get('is_active')
#                 if is_active is not None:
#                     queryset = queryset.filter(is_active=is_active.lower() == 'true')
                
#                 search = request.query_params.get('search')
#                 if search:
#                     queryset = queryset.filter(
#                         Q(id__icontains=search)
#                     )
                
#                 # Paginate
#                 paginator = StandardPagination()
#                 page = paginator.paginate_queryset(queryset, request)
                
#                 serializer = TimeVariantConfigSerializer(page, many=True, context={'request': request})
                
#                 return paginator.get_paginated_response(serializer.data)
            
#         except Exception as e:
#             logger.error(f"Failed to get time variant configs: {e}", exc_info=True)
#             return Response({
#                 'success': False,
#                 'error': 'Failed to load configurations',
#                 'details': str(e) if request.user.is_staff else None
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
#     def post(self, request):
#         """Create new time variant configuration"""
#         if not request.user.is_staff:
#             return Response({
#                 'success': False,
#                 'error': 'Permission denied'
#             }, status=status.HTTP_403_FORBIDDEN)
        
#         try:
#             serializer = TimeVariantConfigSerializer(
#                 data=request.data,
#                 context={'request': request}
#             )
            
#             if not serializer.is_valid():
#                 return Response({
#                     'success': False,
#                     'error': 'Validation failed',
#                     'details': serializer.errors
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             config = serializer.save()
            
#             logger.info(f"Time variant config created: {config.id} by {request.user.username}")
            
#             return Response({
#                 'success': True,
#                 'message': 'Time variant configuration created successfully',
#                 'config': TimeVariantConfigSerializer(config, context={'request': request}).data
#             }, status=status.HTTP_201_CREATED)
            
#         except Exception as e:
#             logger.error(f"Failed to create time variant config: {e}", exc_info=True)
#             return Response({
#                 'success': False,
#                 'error': 'Failed to create configuration',
#                 'details': str(e) if request.user.is_staff else None
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
#     def put(self, request, config_id):
#         """Update time variant configuration"""
#         if not request.user.is_staff:
#             return Response({
#                 'success': False,
#                 'error': 'Permission denied'
#             }, status=status.HTTP_403_FORBIDDEN)
        
#         try:
#             config = get_object_or_404(TimeVariantConfig, id=config_id)
            
#             serializer = TimeVariantConfigSerializer(
#                 config,
#                 data=request.data,
#                 partial=True,
#                 context={'request': request}
#             )
            
#             if not serializer.is_valid():
#                 return Response({
#                     'success': False,
#                     'error': 'Validation failed',
#                     'details': serializer.errors
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             updated_config = serializer.save()
            
#             # Clear related plan caches
#             plan_ids = InternetPlan.objects.filter(time_variant=config).values_list('id', flat=True)
#             for plan_id in plan_ids:
#                 cache.delete(f"internet_plan:{plan_id}")
#             cache.delete_pattern("available_plans:*")
            
#             logger.info(f"Time variant config updated: {config_id} by {request.user.username}")
            
#             return Response({
#                 'success': True,
#                 'message': 'Time variant configuration updated successfully',
#                 'config': TimeVariantConfigSerializer(updated_config, context={'request': request}).data
#             })
            
#         except TimeVariantConfig.DoesNotExist:
#             return Response({
#                 'success': False,
#                 'error': 'Configuration not found'
#             }, status=status.HTTP_404_NOT_FOUND)
#         except Exception as e:
#             logger.error(f"Failed to update time variant config {config_id}: {e}", exc_info=True)
#             return Response({
#                 'success': False,
#                 'error': 'Failed to update configuration',
#                 'details': str(e) if request.user.is_staff else None
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
#     def delete(self, request, config_id):
#         """Delete time variant configuration"""
#         if not request.user.is_staff:
#             return Response({
#                 'success': False,
#                 'error': 'Permission denied'
#             }, status=status.HTTP_403_FORBIDDEN)
        
#         try:
#             config = get_object_or_404(TimeVariantConfig, id=config_id)
            
#             # Check if config is in use
#             plan_count = InternetPlan.objects.filter(time_variant=config).count()
#             template_count = PlanTemplate.objects.filter(time_variant=config).count()
            
#             if plan_count > 0 or template_count > 0:
#                 return Response({
#                     'success': False,
#                     'error': f'Cannot delete configuration used by {plan_count} plan(s) and {template_count} template(s)',
#                     'usage': {
#                         'plans': plan_count,
#                         'templates': template_count
#                     }
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             config.delete()
            
#             logger.info(f"Time variant config deleted: {config_id} by {request.user.username}")
            
#             return Response({
#                 'success': True,
#                 'message': 'Time variant configuration deleted successfully'
#             })
            
#         except TimeVariantConfig.DoesNotExist:
#             return Response({
#                 'success': False,
#                 'error': 'Configuration not found'
#             }, status=status.HTTP_404_NOT_FOUND)
#         except Exception as e:
#             logger.error(f"Failed to delete time variant config {config_id}: {e}", exc_info=True)
#             return Response({
#                 'success': False,
#                 'error': 'Failed to delete configuration'
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# class PlanAvailabilityCheckView(APIView):
#     """
#     Check plan availability for clients
#     """
    
#     permission_classes = [AllowAny]  # Allow access from captive portal
#     throttle_classes = [UserRateThrottle]
    
#     def post(self, request):
#         """Check plan availability"""
#         try:
#             serializer = PlanAvailabilityCheckSerializer(data=request.data)
            
#             if not serializer.is_valid():
#                 return Response({
#                     'success': False,
#                     'error': 'Validation failed',
#                     'details': serializer.errors
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             # Get the validated plan from context
#             plan = serializer.context.get('plan')
            
#             # Check availability
#             availability = plan.is_available_for_client()
            
#             result = {
#                 'plan_id': str(plan.id),
#                 'plan_name': plan.name,
#                 'plan_active': plan.active,
#                 'availability': availability,
#                 'time_variant_info': plan.get_time_variant_summary()
#             }
            
#             return Response({
#                 'success': True,
#                 'data': result
#             })
            
#         except Exception as e:
#             logger.error(f"Failed to check plan availability: {e}", exc_info=True)
#             return Response({
#                 'success': False,
#                 'error': 'Failed to check availability',
#                 'timestamp': timezone.now().isoformat()
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# class AvailablePlansView(APIView):
#     """
#     Get available plans for clients (for captive portal)
#     """
    
#     permission_classes = [AllowAny]  # Allow access from captive portal
#     throttle_classes = [UserRateThrottle]
    
#     def post(self, request):
#         """Get available plans based on client type and filters"""
#         try:
#             serializer = AvailablePlansRequestSerializer(data=request.data)
            
#             if not serializer.is_valid():
#                 return Response({
#                     'success': False,
#                     'error': 'Validation failed',
#                     'details': serializer.errors
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             result = serializer.get_available_plans()
            
#             return Response({
#                 'success': True,
#                 'data': result
#             })
            
#         except Exception as e:
#             logger.error(f"Failed to get available plans: {e}", exc_info=True)
#             return Response({
#                 'success': False,
#                 'error': 'Failed to get available plans',
#                 'timestamp': timezone.now().isoformat()
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
#     def get(self, request):
#         """Get available plans with query parameters (for GET requests)"""
#         try:
#             # Convert GET parameters to serializer data
#             data = {
#                 'client_type': request.query_params.get('client_type', 'hotspot'),
#                 'router_id': request.query_params.get('router_id'),
#                 'category': request.query_params.get('category'),
#                 'max_price': request.query_params.get('max_price'),
#                 'include_unavailable': request.query_params.get('include_unavailable', 'false').lower() == 'true'
#             }
            
#             # Remove None values
#             data = {k: v for k, v in data.items() if v is not None}
            
#             serializer = AvailablePlansRequestSerializer(data=data)
            
#             if not serializer.is_valid():
#                 return Response({
#                     'success': False,
#                     'error': 'Validation failed',
#                     'details': serializer.errors
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             result = serializer.get_available_plans()
            
#             return Response({
#                 'success': True,
#                 'data': result
#             })
            
#         except Exception as e:
#             logger.error(f"Failed to get available plans: {e}", exc_info=True)
#             return Response({
#                 'success': False,
#                 'error': 'Failed to get available plans',
#                 'timestamp': timezone.now().isoformat()
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# class PublicInternetPlanListView(APIView):
#     """
#     Public API for listing available Internet Plans
#     No authentication required
#     """
    
#     permission_classes = [AllowAny]
#     throttle_classes = [UserRateThrottle]
    
#     def get(self, request):
#         """Get public list of available plans"""
#         try:
#             # Determine client type from request (default to hotspot)
#             client_type = request.query_params.get('client_type', 'hotspot')
            
#             # Cache key
#             cache_key = f"public_available_plans:{client_type}:{request.GET.urlencode()}"
#             cached_data = cache.get(cache_key)
            
#             if cached_data:
#                 return Response(cached_data)
            
#             # Use AvailablePlansRequestSerializer for consistency
#             data = {
#                 'client_type': client_type,
#                 'router_id': request.query_params.get('router_id'),
#                 'category': request.query_params.get('category'),
#                 'max_price': request.query_params.get('max_price'),
#                 'include_unavailable': False  # Public API only shows available plans
#             }
            
#             # Remove None values
#             data = {k: v for k, v in data.items() if v is not None}
            
#             serializer = AvailablePlansRequestSerializer(data=data, context={'request': request})
            
#             if not serializer.is_valid():
#                 return Response({
#                     'success': False,
#                     'error': 'Validation failed',
#                     'details': serializer.errors
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             result = serializer.get_available_plans()
            
#             response_data = {
#                 'success': True,
#                 'count': result['count'],
#                 'client_type': client_type,
#                 'plans': result['plans'],
#                 'timestamp': timezone.now().isoformat()
#             }
            
#             # Cache for 1 minute (time-sensitive)
#             cache.set(cache_key, response_data, 60)
            
#             return Response(response_data)
            
#         except Exception as e:
#             logger.error(f"Failed to get public plans: {e}", exc_info=True)
#             return Response({
#                 'success': False,
#                 'error': 'Failed to load plans',
#                 'timestamp': timezone.now().isoformat()
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# class PlanStatisticsView(APIView):
#     """
#     Get statistics about plans
#     """
    
#     permission_classes = [IsAuthenticated]
    
#     def get(self, request):
#         """Get plan statistics including time variant stats"""
#         try:
#             stats = PlanService.get_plan_statistics()
            
#             if 'error' in stats:
#                 return Response({
#                     'success': False,
#                     'error': stats['error']
#                 }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
#             return Response({
#                 'success': True,
#                 'statistics': stats
#             })
            
#         except Exception as e:
#             logger.error(f"Failed to get plan statistics: {e}", exc_info=True)
#             return Response({
#                 'success': False,
#                 'error': 'Failed to get statistics',
#                 'timestamp': timezone.now().isoformat()
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# class PlanCompatibilityCheckView(APIView):
#     """
#     Check plan compatibility
#     """
    
#     permission_classes = [IsAuthenticated]
#     throttle_classes = [UserRateThrottle]
    
#     def post(self, request):
#         """Check plan compatibility including time availability"""
#         try:
#             serializer = PlanCompatibilitySerializer(data=request.data)
            
#             if not serializer.is_valid():
#                 return Response({
#                     'success': False,
#                     'error': 'Validation failed',
#                     'details': serializer.errors
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             # Get compatibility result
#             result = serializer.get_compatibility_result()
            
#             if not result:
#                 return Response({
#                     'success': False,
#                     'error': 'Failed to check compatibility'
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             return Response({
#                 'success': True,
#                 'compatibility': result
#             })
            
#         except Exception as e:
#             logger.error(f"Failed to check plan compatibility: {e}", exc_info=True)
#             return Response({
#                 'success': False,
#                 'error': 'Failed to check compatibility',
#                 'details': str(e) if request.user.is_staff else None
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# class PlanRecommendationView(APIView):
#     """
#     Get plan recommendations
#     """
    
#     permission_classes = [IsAuthenticated]
#     throttle_classes = [UserRateThrottle]
    
#     def get(self, request):
#         """Get plan recommendations considering availability"""
#         try:
#             # Extract parameters
#             client_type = request.query_params.get('client_type')
#             budget = request.query_params.get('budget')
#             access_method = request.query_params.get('access_method')
#             limit = int(request.query_params.get('limit', 5))
            
#             # Parse budget
#             budget_value = None
#             if budget:
#                 try:
#                     budget_value = float(budget)
#                 except ValueError:
#                     return Response({
#                         'success': False,
#                         'error': 'Invalid budget format'
#                     }, status=status.HTTP_400_BAD_REQUEST)
            
#             # Get recommendations
#             recommendations = PlanService.get_recommended_plans(
#                 client_type=client_type,
#                 budget=budget_value,
#                 access_method=access_method,
#                 limit=limit
#             )
            
#             return Response({
#                 'success': True,
#                 'recommendations': recommendations,
#                 'criteria': {
#                     'client_type': client_type,
#                     'budget': budget_value,
#                     'access_method': access_method,
#                     'limit': limit
#                 },
#                 'timestamp': timezone.now().isoformat()
#             })
            
#         except Exception as e:
#             logger.error(f"Failed to get plan recommendations: {e}")
#             return Response({
#                 'success': False,
#                 'error': 'Failed to get recommendations',
#                 'timestamp': timezone.now().isoformat()
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# class TimeVariantTestView(APIView):
#     """
#     Test time variant configurations
#     """
    
#     permission_classes = [IsAdminUser]
#     throttle_classes = [UserRateThrottle]
    
#     def post(self, request):
#         """Test time variant configuration"""
#         try:
#             # Create a test time variant
#             test_data = {
#                 'is_active': True,
#                 'start_time': '09:00',
#                 'end_time': '17:00',
#                 'available_days': ['mon', 'tue', 'wed', 'thu', 'fri'],
#                 'timezone': 'Africa/Nairobi'
#             }
            
#             serializer = TimeVariantConfigSerializer(data=test_data)
            
#             if serializer.is_valid():
#                 config = serializer.save()
                
#                 # Test availability
#                 is_available = config.is_available_now()
#                 summary = config.get_availability_summary()
#                 next_available = config.get_next_available_time()
                
#                 return Response({
#                     'success': True,
#                     'test_config': serializer.data,
#                     'results': {
#                         'is_available_now': is_available,
#                         'summary': summary,
#                         'next_available_time': next_available
#                     },
#                     'current_time': timezone.now().isoformat(),
#                     'current_day': timezone.now().strftime('%A'),
#                     'current_time_local': timezone.now().strftime('%H:%M:%S')
#                 })
#             else:
#                 return Response({
#                     'success': False,
#                     'error': 'Test configuration invalid',
#                     'details': serializer.errors
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#         except Exception as e:
#             logger.error(f"Failed to test time variant: {e}", exc_info=True)
#             return Response({
#                 'success': False,
#                 'error': 'Failed to test time variant',
#                 'details': str(e)
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)





# class InternetPlanListView(APIView):
#     """
#     List and create Internet Plans - FIXED: ALL authenticated users can:
#     - View ALL plans (active AND inactive)
#     - Create new plans (staff no longer required)
#     """
    
#     permission_classes = [IsAuthenticated]  
    
#     def get(self, request):
#         """Get list of plans - FIXED: Show ALL plans to ALL authenticated users"""
#         try:
#             filters = self._extract_filters(request)
#             queryset = InternetPlan.objects.all()
            
#             # Apply filters
#             if filters.get('active') is not None:
#                 queryset = queryset.filter(active=filters['active'])
            
#             if filters.get('category'):
#                 queryset = queryset.filter(category=filters['category'])
            
#             if filters.get('plan_type'):
#                 queryset = queryset.filter(plan_type=filters['plan_type'])
            
#             if filters.get('search'):
#                 search = filters['search']
#                 queryset = queryset.filter(
#                     Q(name__icontains=search) |
#                     Q(description__icontains=search) |
#                     Q(category__icontains=search)
#                 )
            
#             # FIXED: REMOVED THE FILTER THAT HIDES PLANS FROM NON-STAFF USERS
#             # ALL authenticated users can see ALL plans regardless of active status
            
#             # Order by priority and name
#             queryset = queryset.order_by('-priority_level', 'name')
            
#             serializer = InternetPlanListSerializer(
#                 queryset, 
#                 many=True, 
#                 context={'request': request}
#             )
            
#             return Response({
#                 'success': True,
#                 'count': queryset.count(),
#                 'plans': serializer.data  # CHANGED: from 'plans' to match frontend expectation
#             })
            
#         except Exception as e:
#             logger.error(f"Failed to get plans: {e}", exc_info=True)
#             return Response({
#                 'success': False,
#                 'error': 'Failed to load plans'
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
#     def post(self, request):
#         """Create new plan - FIXED: ALL authenticated users can create plans"""
#         # FIXED: REMOVED the staff-only restriction
#         # if not request.user.is_staff:
#         #     return Response(...)
        
#         try:
#             # Log incoming data for debugging
#             logger.info(f"Creating plan. User: {request.user.email}")
#             logger.info(f"Request data: {request.data}")
            
#             # Check for duplicate name
#             plan_name = request.data.get('name', '')
#             if plan_name and InternetPlan.objects.filter(name=plan_name).exists():
#                 return Response({
#                     'success': False,
#                     'error': f'A plan with the name "{plan_name}" already exists'
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             # Use CreateSerializer for proper validation
#             serializer = InternetPlanCreateSerializer(
#                 data=request.data,
#                 context={'request': request}
#             )
            
#             if not serializer.is_valid():
#                 logger.error(f"Serializer validation failed: {serializer.errors}")
#                 return Response({
#                     'success': False,
#                     'error': 'Validation failed',
#                     'details': serializer.errors
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             with transaction.atomic():
#                 plan = serializer.save()
                
#                 logger.info(f"Plan created: {plan.name} (ID: {plan.id}) by {request.user.email}")
                
#                 # Return full plan data
#                 full_serializer = InternetPlanSerializer(plan, context={'request': request})
                
#                 return Response({
#                     'success': True,
#                     'message': 'Plan created successfully',
#                     'plan': full_serializer.data  # CHANGED: from 'plan' to match frontend expectation
#                 }, status=status.HTTP_201_CREATED)
            
#         except Exception as e:
#             logger.error(f"Failed to create plan: {e}", exc_info=True)
#             return Response({
#                 'success': False,
#                 'error': 'Failed to create plan',
#                 'details': str(e) if request.user.is_staff else None
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
#     def _extract_filters(self, request):
#         """Extract filters from request"""
#         filters = {}
        
#         if active := request.query_params.get('active'):
#             filters['active'] = active.lower() == 'true'
        
#         if category := request.query_params.get('category'):
#             filters['category'] = category
        
#         if plan_type := request.query_params.get('plan_type'):
#             filters['plan_type'] = plan_type
        
#         if search := request.query_params.get('search'):
#             filters['search'] = search
        
#         return filters










"""
Internet Plans - Plan Views with Full CRUD for Authenticated Users
PRODUCTION-READY: Complete with proper error handling, caching, and security
"""

from django.shortcuts import get_object_or_404
from django.db.models import Q, Count, Sum, Avg
from django.utils import timezone
from django.db import transaction
from django.core.cache import cache
from django.db.models import ProtectedError
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.pagination import PageNumberPagination
from rest_framework import status
from rest_framework.throttling import UserRateThrottle
import logging
from datetime import datetime, timedelta
from decimal import Decimal

from internet_plans.models.plan_models import InternetPlan, TimeVariantConfig, PlanTemplate
from internet_plans.serializers.plan_serializers import (
    InternetPlanSerializer,
    InternetPlanListSerializer,
    InternetPlanCreateSerializer,
    InternetPlanUpdateSerializer,
    TimeVariantConfigSerializer,
    PlanCompatibilitySerializer,
    PlanAvailabilityCheckSerializer,
    AvailablePlansRequestSerializer
)
from internet_plans.utils.formatters import format_plan_summary
from internet_plans.services.plan_service import PlanService

logger = logging.getLogger(__name__)


class StandardPagination(PageNumberPagination):
    """Standard pagination class"""
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100
    
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


class InternetPlanListView(APIView):
    """
    List and create Internet Plans
    - ALL authenticated users can view ALL plans (active AND inactive)
    - ALL authenticated users can create new plans
    """
    
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    
    def get(self, request):
        """Get list of all plans - ALL authenticated users see everything"""
        try:
            filters = self._extract_filters(request)
            
            # Get ALL plans - no filtering by active status for authenticated users
            queryset = InternetPlan.objects.all()
            
            # Apply optional filters
            if filters.get('active') is not None:
                queryset = queryset.filter(active=filters['active'])
            
            if filters.get('category'):
                queryset = queryset.filter(category=filters['category'])
            
            if filters.get('plan_type'):
                queryset = queryset.filter(plan_type=filters['plan_type'])
            
            if filters.get('search'):
                search = filters['search']
                queryset = queryset.filter(
                    Q(name__icontains=search) |
                    Q(description__icontains=search) |
                    Q(category__icontains=search)
                )
            
            # Order by priority and name
            queryset = queryset.order_by('-priority_level', 'name')
            
            # Paginate
            paginator = StandardPagination()
            page = paginator.paginate_queryset(queryset, request)
            
            if page is not None:
                serializer = InternetPlanListSerializer(
                    page, 
                    many=True, 
                    context={'request': request}
                )
                return paginator.get_paginated_response(serializer.data)
            
            # No pagination
            serializer = InternetPlanListSerializer(
                queryset, 
                many=True, 
                context={'request': request}
            )
            
            return Response({
                'success': True,
                'count': queryset.count(),
                'plans': serializer.data
            })
            
        except Exception as e:
            logger.error(f"Failed to get plans: {e}", exc_info=True)
            return Response({
                'success': False,
                'error': 'Failed to load plans',
                'details': str(e) if request.user.is_staff else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def post(self, request):
        """Create new plan - ANY authenticated user can create plans"""
        try:
            # Log incoming data for debugging
            logger.info(f"Creating plan. User: {request.user.email}")
            logger.debug(f"Request data: {request.data}")
            
            # Check for duplicate name
            plan_name = request.data.get('name', '').strip()
            if plan_name:
                if InternetPlan.objects.filter(name__iexact=plan_name).exists():
                    return Response({
                        'success': False,
                        'error': f'A plan with the name "{plan_name}" already exists',
                        'field': 'name'
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            # Use CreateSerializer for proper validation
            serializer = InternetPlanCreateSerializer(
                data=request.data,
                context={'request': request}
            )
            
            if not serializer.is_valid():
                logger.error(f"Serializer validation failed: {serializer.errors}")
                return Response({
                    'success': False,
                    'error': 'Validation failed',
                    'details': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
            
            with transaction.atomic():
                plan = serializer.save()
                
                logger.info(f"Plan created: {plan.name} (ID: {plan.id}) by {request.user.email}")
                
                # Return full plan data
                full_serializer = InternetPlanSerializer(plan, context={'request': request})
                
                # Clear cache
                cache.delete_pattern("internet_plans:*")
                cache.delete_pattern("available_plans:*")
                
                return Response({
                    'success': True,
                    'message': 'Plan created successfully',
                    'plan': full_serializer.data
                }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Failed to create plan: {e}", exc_info=True)
            return Response({
                'success': False,
                'error': 'Failed to create plan',
                'details': str(e) if request.user.is_staff else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _extract_filters(self, request):
        """Extract filters from request"""
        filters = {}
        
        if active := request.query_params.get('active'):
            filters['active'] = active.lower() == 'true'
        
        if category := request.query_params.get('category'):
            filters['category'] = category
        
        if plan_type := request.query_params.get('plan_type'):
            filters['plan_type'] = plan_type
        
        if search := request.query_params.get('search'):
            filters['search'] = search
        
        return filters


class InternetPlanDetailView(APIView):
    """
    Retrieve, update, or delete an Internet Plan with Time Variant
    - ALL authenticated users can perform ALL operations
    """
    
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    
    def get(self, request, plan_id):
        """Get plan details - ANY authenticated user can view ANY plan"""
        try:
            plan = get_object_or_404(InternetPlan, id=plan_id)
            
            # ALL authenticated users can view ALL plans regardless of active status
            serializer = InternetPlanSerializer(plan, context={'request': request})
            
            # Add pricing information
            try:
                from internet_plans.services.pricing_service import PricingService
                pricing_info = PricingService.get_pricing_options(plan)
            except ImportError:
                pricing_info = []
                logger.warning("Pricing service not available")
            
            # Add time variant availability
            availability = plan.is_available_for_client()
            
            response_data = {
                'success': True,
                'plan': serializer.data,
                'pricing_options': pricing_info,
                'summary': format_plan_summary(plan),
                'availability': availability,
                'compatibility': {
                    'supported_access_methods': plan.get_enabled_access_methods(),
                    'router_specific': plan.router_specific,
                    'allowed_routers_count': plan.allowed_routers.count() if plan.router_specific else 'All'
                }
            }
            
            return Response(response_data)
            
        except InternetPlan.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Plan not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Failed to get plan {plan_id}: {e}", exc_info=True)
            return Response({
                'success': False,
                'error': 'Failed to load plan details',
                'details': str(e) if request.user.is_staff else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def put(self, request, plan_id):
        """Update plan - ANY authenticated user can update ANY plan"""
        try:
            plan = get_object_or_404(InternetPlan, id=plan_id)
            
            # Check for duplicate name
            new_name = request.data.get('name', '').strip()
            if new_name and new_name != plan.name:
                if InternetPlan.objects.filter(name__iexact=new_name).exclude(id=plan_id).exists():
                    return Response({
                        'success': False,
                        'error': f'A plan with the name "{new_name}" already exists',
                        'field': 'name'
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            serializer = InternetPlanUpdateSerializer(
                plan, 
                data=request.data, 
                partial=True,
                context={'request': request}
            )
            
            if not serializer.is_valid():
                return Response({
                    'success': False,
                    'error': 'Validation failed',
                    'details': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Track price changes
            old_price = plan.price
            
            with transaction.atomic():
                updated_plan = serializer.save()
                
                # Log price change
                if old_price != updated_plan.price:
                    logger.info(
                        f"Plan price changed: {plan_id} - {old_price} to {updated_plan.price} "
                        f"by {request.user.email}"
                    )
                
                # Log update
                logger.info(f"Plan updated: {plan_id} by {request.user.email}")
                
                # Clear cache
                cache.delete(f"internet_plan:{plan_id}")
                cache.delete_pattern("internet_plans:*")
                cache.delete_pattern("available_plans:*")
                
                return Response({
                    'success': True,
                    'message': 'Plan updated successfully',
                    'plan': InternetPlanSerializer(updated_plan, context={'request': request}).data
                })
            
        except InternetPlan.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Plan not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Failed to update plan {plan_id}: {e}", exc_info=True)
            return Response({
                'success': False,
                'error': 'Failed to update plan',
                'details': str(e) if request.user.is_staff else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def delete(self, request, plan_id):
        """HARD DELETE plan - ANY authenticated user can delete ANY plan"""
        try:
            plan = get_object_or_404(InternetPlan, id=plan_id)
            
            # Check if plan has active subscriptions
            try:
                from service_operations.models.subscription_models import Subscription
                active_subs = Subscription.objects.filter(
                    internet_plan=plan,
                    status__in=['active', 'pending', 'suspended'],
                    is_active=True
                ).exists()
                
                if active_subs:
                    return Response({
                        'success': False,
                        'error': 'Cannot delete plan with active subscriptions',
                        'details': {
                            'has_active_subscriptions': True,
                            'message': 'This plan is currently being used by active subscriptions. Please deactivate it instead or cancel all subscriptions first.',
                            'plan_id': str(plan.id),
                            'plan_name': plan.name
                        }
                    }, status=status.HTTP_400_BAD_REQUEST)
            except ImportError:
                logger.warning("Subscription model not available, skipping subscription check")
            except Exception as e:
                logger.error(f"Error checking subscriptions: {e}")
            
            # Check if plan has any transactions
            try:
                from billing.models import Transaction
                has_transactions = Transaction.objects.filter(
                    plan_id=plan_id
                ).exists()
                
                if has_transactions:
                    return Response({
                        'success': False,
                        'error': 'Cannot delete plan with transaction history',
                        'details': {
                            'has_transactions': True,
                            'message': 'This plan has associated transactions. Please deactivate it instead.',
                            'plan_id': str(plan.id),
                            'plan_name': plan.name
                        }
                    }, status=status.HTTP_400_BAD_REQUEST)
            except ImportError:
                logger.warning("Transaction model not available, skipping transaction check")
            except Exception as e:
                logger.error(f"Error checking transactions: {e}")
            
            # Store plan info before deletion for response
            plan_id_str = str(plan.id)
            plan_name = plan.name
            
            with transaction.atomic():
                # Delete associated time variant if not used elsewhere
                if plan.time_variant:
                    # Check if time variant is used by other plans or templates
                    time_variant = plan.time_variant
                    other_plans_count = InternetPlan.objects.filter(
                        time_variant=time_variant
                    ).exclude(id=plan_id).count()
                    
                    templates_count = PlanTemplate.objects.filter(
                        time_variant=time_variant
                    ).count()
                    
                    if other_plans_count == 0 and templates_count == 0:
                        time_variant.delete()
                        logger.info(f"Deleted orphaned time variant: {time_variant.id}")
                
                # Delete the plan
                plan.delete()
            
            # Clear cache
            cache.delete(f"internet_plan:{plan_id_str}")
            cache.delete_pattern("internet_plans:*")
            cache.delete_pattern("available_plans:*")
            
            # Log deletion
            logger.info(f"Plan permanently deleted: {plan_name} (ID: {plan_id_str}) by {request.user.email}")
            
            return Response({
                'success': True,
                'message': 'Plan deleted successfully',
                'deleted_id': plan_id_str,
                'deleted_name': plan_name
            })
            
        except InternetPlan.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Plan not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except ProtectedError as e:
            logger.error(f"Cannot delete plan {plan_id} due to protected relationships: {e}")
            return Response({
                'success': False,
                'error': 'Cannot delete plan because it has related records',
                'details': {
                    'protected': True,
                    'message': 'This plan is referenced by other records and cannot be deleted.'
                }
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Failed to delete plan {plan_id}: {e}", exc_info=True)
            return Response({
                'success': False,
                'error': 'Failed to delete plan',
                'details': str(e) if request.user.is_staff else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class TimeVariantConfigView(APIView):
    """
    Manage Time Variant Configurations
    - ALL authenticated users can perform ALL operations
    """
    
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    
    def get(self, request, config_id=None):
        """Get time variant configuration(s) - ANY authenticated user can view"""
        try:
            if config_id:
                config = get_object_or_404(TimeVariantConfig, id=config_id)
                serializer = TimeVariantConfigSerializer(config, context={'request': request})
                
                # Add usage information
                usage_info = {
                    'used_by_plans': InternetPlan.objects.filter(time_variant=config).count(),
                    'used_by_templates': PlanTemplate.objects.filter(time_variant=config).count()
                }
                
                return Response({
                    'success': True,
                    'config': serializer.data,
                    'usage': usage_info
                })
            
            else:
                # List all configurations with filtering
                queryset = TimeVariantConfig.objects.all()
                
                # Apply filters
                is_active = request.query_params.get('is_active')
                if is_active is not None:
                    queryset = queryset.filter(is_active=is_active.lower() == 'true')
                
                search = request.query_params.get('search')
                if search:
                    queryset = queryset.filter(
                        Q(id__icontains=search)
                    )
                
                # Paginate
                paginator = StandardPagination()
                page = paginator.paginate_queryset(queryset, request)
                
                serializer = TimeVariantConfigSerializer(page, many=True, context={'request': request})
                
                return paginator.get_paginated_response(serializer.data)
            
        except TimeVariantConfig.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Configuration not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Failed to get time variant configs: {e}", exc_info=True)
            return Response({
                'success': False,
                'error': 'Failed to load configurations',
                'details': str(e) if request.user.is_staff else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def post(self, request):
        """Create new time variant configuration - ANY authenticated user can create"""
        try:
            serializer = TimeVariantConfigSerializer(
                data=request.data,
                context={'request': request}
            )
            
            if not serializer.is_valid():
                return Response({
                    'success': False,
                    'error': 'Validation failed',
                    'details': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
            
            config = serializer.save()
            
            logger.info(f"Time variant config created: {config.id} by {request.user.email}")
            
            return Response({
                'success': True,
                'message': 'Time variant configuration created successfully',
                'config': TimeVariantConfigSerializer(config, context={'request': request}).data
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Failed to create time variant config: {e}", exc_info=True)
            return Response({
                'success': False,
                'error': 'Failed to create configuration',
                'details': str(e) if request.user.is_staff else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def put(self, request, config_id):
        """Update time variant configuration - ANY authenticated user can update"""
        try:
            config = get_object_or_404(TimeVariantConfig, id=config_id)
            
            serializer = TimeVariantConfigSerializer(
                config,
                data=request.data,
                partial=True,
                context={'request': request}
            )
            
            if not serializer.is_valid():
                return Response({
                    'success': False,
                    'error': 'Validation failed',
                    'details': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
            
            updated_config = serializer.save()
            
            # Clear related plan caches
            plan_ids = InternetPlan.objects.filter(time_variant=config).values_list('id', flat=True)
            for plan_id in plan_ids:
                cache.delete(f"internet_plan:{plan_id}")
            cache.delete_pattern("internet_plans:*")
            cache.delete_pattern("available_plans:*")
            
            logger.info(f"Time variant config updated: {config_id} by {request.user.email}")
            
            return Response({
                'success': True,
                'message': 'Time variant configuration updated successfully',
                'config': TimeVariantConfigSerializer(updated_config, context={'request': request}).data
            })
            
        except TimeVariantConfig.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Configuration not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Failed to update time variant config {config_id}: {e}", exc_info=True)
            return Response({
                'success': False,
                'error': 'Failed to update configuration',
                'details': str(e) if request.user.is_staff else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def delete(self, request, config_id):
        """HARD DELETE time variant configuration - ANY authenticated user can delete"""
        try:
            config = get_object_or_404(TimeVariantConfig, id=config_id)
            
            # Check if config is in use
            plan_count = InternetPlan.objects.filter(time_variant=config).count()
            template_count = PlanTemplate.objects.filter(time_variant=config).count()
            
            if plan_count > 0 or template_count > 0:
                return Response({
                    'success': False,
                    'error': f'Cannot delete configuration used by {plan_count} plan(s) and {template_count} template(s)',
                    'usage': {
                        'plans': plan_count,
                        'templates': template_count
                    }
                }, status=status.HTTP_400_BAD_REQUEST)
            
            config_id_str = str(config.id)
            config.delete()
            
            # Clear cache
            cache.delete_pattern(f"*time_variant:{config_id_str}*")
            cache.delete_pattern("available_plans:*")
            
            logger.info(f"Time variant config deleted: {config_id} by {request.user.email}")
            
            return Response({
                'success': True,
                'message': 'Time variant configuration deleted successfully',
                'deleted_id': config_id_str
            })
            
        except TimeVariantConfig.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Configuration not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except ProtectedError:
            return Response({
                'success': False,
                'error': 'Cannot delete configuration because it is referenced by other records'
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Failed to delete time variant config {config_id}: {e}", exc_info=True)
            return Response({
                'success': False,
                'error': 'Failed to delete configuration'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ============================================================================
# PUBLIC ENDPOINTS - NO AUTHENTICATION REQUIRED
# ============================================================================


class PublicInternetPlanListView(APIView):
    """
    Public API for listing available Internet Plans
    NO authentication required - for captive portal and public facing
    """
    
    permission_classes = [AllowAny]
    throttle_classes = [UserRateThrottle]
    
    def get(self, request):
        """Get public list of available plans"""
        try:
            client_type = request.query_params.get('client_type', 'hotspot')
            
            # Cache key
            cache_key = f"public_available_plans:{client_type}:{request.GET.urlencode()}"
            cached_data = cache.get(cache_key)
            
            if cached_data:
                return Response(cached_data)
            
            # Get active plans only for public
            queryset = InternetPlan.objects.filter(active=True)
            
            # Filter by access method
            if client_type == 'hotspot':
                queryset = queryset.filter(access_methods__hotspot__enabled=True)
            elif client_type == 'pppoe':
                queryset = queryset.filter(access_methods__pppoe__enabled=True)
            
            # Additional filters
            category = request.query_params.get('category')
            if category:
                queryset = queryset.filter(category=category)
            
            max_price = request.query_params.get('max_price')
            if max_price:
                try:
                    queryset = queryset.filter(price__lte=float(max_price))
                except ValueError:
                    pass
            
            # Order by price
            queryset = queryset.order_by('price', 'name')
            
            serializer = InternetPlanListSerializer(
                queryset, 
                many=True, 
                context={'request': request}
            )
            
            response_data = {
                'success': True,
                'count': queryset.count(),
                'client_type': client_type,
                'plans': serializer.data,
                'timestamp': timezone.now().isoformat()
            }
            
            # Cache for 1 minute
            cache.set(cache_key, response_data, 60)
            
            return Response(response_data)
            
        except Exception as e:
            logger.error(f"Failed to get public plans: {e}", exc_info=True)
            return Response({
                'success': False,
                'error': 'Failed to load plans',
                'timestamp': timezone.now().isoformat()
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PlanAvailabilityCheckView(APIView):
    """
    Check plan availability for clients
    NO authentication required - for captive portal
    """
    
    permission_classes = [AllowAny]
    throttle_classes = [UserRateThrottle]
    
    def post(self, request):
        """Check plan availability"""
        try:
            serializer = PlanAvailabilityCheckSerializer(data=request.data)
            
            if not serializer.is_valid():
                return Response({
                    'success': False,
                    'error': 'Validation failed',
                    'details': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
            
            plan = serializer.context.get('plan')
            
            # Check availability
            availability = plan.is_available_for_client()
            
            result = {
                'plan_id': str(plan.id),
                'plan_name': plan.name,
                'plan_active': plan.active,
                'availability': availability,
                'time_variant_info': plan.get_time_variant_summary()
            }
            
            return Response({
                'success': True,
                'data': result
            })
            
        except Exception as e:
            logger.error(f"Failed to check plan availability: {e}", exc_info=True)
            return Response({
                'success': False,
                'error': 'Failed to check availability',
                'timestamp': timezone.now().isoformat()
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AvailablePlansView(APIView):
    """
    Get available plans for clients
    NO authentication required - for captive portal
    """
    
    permission_classes = [AllowAny]
    throttle_classes = [UserRateThrottle]
    
    def post(self, request):
        """Get available plans based on client type and filters"""
        try:
            serializer = AvailablePlansRequestSerializer(data=request.data)
            
            if not serializer.is_valid():
                return Response({
                    'success': False,
                    'error': 'Validation failed',
                    'details': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
            
            result = serializer.get_available_plans()
            
            return Response({
                'success': True,
                'data': result
            })
            
        except Exception as e:
            logger.error(f"Failed to get available plans: {e}", exc_info=True)
            return Response({
                'success': False,
                'error': 'Failed to get available plans',
                'timestamp': timezone.now().isoformat()
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def get(self, request):
        """Get available plans with query parameters"""
        try:
            data = {
                'client_type': request.query_params.get('client_type', 'hotspot'),
                'router_id': request.query_params.get('router_id'),
                'category': request.query_params.get('category'),
                'max_price': request.query_params.get('max_price'),
                'include_unavailable': request.query_params.get('include_unavailable', 'false').lower() == 'true'
            }
            
            data = {k: v for k, v in data.items() if v is not None}
            
            serializer = AvailablePlansRequestSerializer(data=data)
            
            if not serializer.is_valid():
                return Response({
                    'success': False,
                    'error': 'Validation failed',
                    'details': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
            
            result = serializer.get_available_plans()
            
            return Response({
                'success': True,
                'data': result
            })
            
        except Exception as e:
            logger.error(f"Failed to get available plans: {e}", exc_info=True)
            return Response({
                'success': False,
                'error': 'Failed to get available plans',
                'timestamp': timezone.now().isoformat()
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ============================================================================
# ANALYTICS & STATISTICS ENDPOINTS
# ============================================================================


class PlanStatisticsView(APIView):
    """
    Get statistics about plans
    - ANY authenticated user can view statistics
    """
    
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    
    def get(self, request):
        """Get plan statistics"""
        try:
            stats = PlanService.get_plan_statistics()
            
            if 'error' in stats:
                return Response({
                    'success': False,
                    'error': stats['error']
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            return Response({
                'success': True,
                'statistics': stats
            })
            
        except Exception as e:
            logger.error(f"Failed to get plan statistics: {e}", exc_info=True)
            return Response({
                'success': False,
                'error': 'Failed to get statistics',
                'timestamp': timezone.now().isoformat()
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PlanCompatibilityCheckView(APIView):
    """
    Check plan compatibility
    - ANY authenticated user can check compatibility
    """
    
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    
    def post(self, request):
        """Check plan compatibility"""
        try:
            serializer = PlanCompatibilitySerializer(data=request.data)
            
            if not serializer.is_valid():
                return Response({
                    'success': False,
                    'error': 'Validation failed',
                    'details': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
            
            result = serializer.get_compatibility_result()
            
            if not result:
                return Response({
                    'success': False,
                    'error': 'Failed to check compatibility'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            return Response({
                'success': True,
                'compatibility': result
            })
            
        except Exception as e:
            logger.error(f"Failed to check plan compatibility: {e}", exc_info=True)
            return Response({
                'success': False,
                'error': 'Failed to check compatibility',
                'details': str(e) if request.user.is_staff else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PlanRecommendationView(APIView):
    """
    Get plan recommendations
    - ANY authenticated user can get recommendations
    """
    
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    
    def get(self, request):
        """Get plan recommendations"""
        try:
            client_type = request.query_params.get('client_type')
            budget = request.query_params.get('budget')
            access_method = request.query_params.get('access_method')
            
            try:
                limit = int(request.query_params.get('limit', 5))
            except ValueError:
                limit = 5
            
            budget_value = None
            if budget:
                try:
                    budget_value = float(budget)
                except ValueError:
                    return Response({
                        'success': False,
                        'error': 'Invalid budget format'
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            recommendations = PlanService.get_recommended_plans(
                client_type=client_type,
                budget=budget_value,
                access_method=access_method,
                limit=limit
            )
            
            return Response({
                'success': True,
                'recommendations': recommendations,
                'criteria': {
                    'client_type': client_type,
                    'budget': budget_value,
                    'access_method': access_method,
                    'limit': limit
                },
                'timestamp': timezone.now().isoformat()
            })
            
        except Exception as e:
            logger.error(f"Failed to get plan recommendations: {e}")
            return Response({
                'success': False,
                'error': 'Failed to get recommendations',
                'timestamp': timezone.now().isoformat()
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class TimeVariantTestView(APIView):
    """
    Test time variant configurations
    - ANY authenticated user can test configurations
    """
    
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    
    def post(self, request):
        """Test time variant configuration"""
        try:
            test_data = {
                'is_active': True,
                'start_time': '09:00',
                'end_time': '17:00',
                'available_days': ['mon', 'tue', 'wed', 'thu', 'fri'],
                'timezone': 'Africa/Nairobi'
            }
            
            serializer = TimeVariantConfigSerializer(data=test_data)
            
            if serializer.is_valid():
                config = serializer.save()
                
                is_available = config.is_available_now()
                summary = config.get_availability_summary()
                next_available = config.get_next_available_time()
                
                return Response({
                    'success': True,
                    'test_config': serializer.data,
                    'results': {
                        'is_available_now': is_available,
                        'summary': summary,
                        'next_available_time': next_available
                    },
                    'current_time': timezone.now().isoformat(),
                    'current_day': timezone.now().strftime('%A'),
                    'current_time_local': timezone.now().strftime('%H:%M:%S')
                })
            else:
                return Response({
                    'success': False,
                    'error': 'Test configuration invalid',
                    'details': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            logger.error(f"Failed to test time variant: {e}", exc_info=True)
            return Response({
                'success': False,
                'error': 'Failed to test time variant',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)