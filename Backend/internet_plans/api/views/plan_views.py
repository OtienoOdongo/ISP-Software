"""
Internet Plans - Plan Views with Time Variant Support
API views for Internet Plan management with time-based availability
Production-ready with comprehensive error handling
"""

from django.shortcuts import get_object_or_404
from django.db.models import Q, Count, Sum, Avg
from django.utils import timezone
from django.db import transaction
from django.core.cache import cache
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework.pagination import PageNumberPagination
from rest_framework import status
from rest_framework.throttling import UserRateThrottle
import logging
from datetime import datetime, timedelta

from internet_plans.models.plan_models import InternetPlan, TimeVariantConfig, PlanTemplate
from internet_plans.serializers.plan_serializers import (
    InternetPlanSerializer,
    InternetPlanCreateSerializer,
    InternetPlanUpdateSerializer,
    InternetPlanDetailSerializer,
    PlanCompatibilitySerializer,
    PlanAvailabilityCheckSerializer,
    AvailablePlansRequestSerializer,
    TimeVariantConfigSerializer
)
from internet_plans.services.plan_service import PlanService
from internet_plans.services.pricing_service import PricingService
from internet_plans.utils.formatters import format_plan_summary

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
    List and create Internet Plans with Time Variant Support
    GET: List plans with filtering (including time availability)
    POST: Create new plan with time variant
    UPDATED: Added time variant support
    """
    
    permission_classes = [IsAuthenticated]
    pagination_class = StandardPagination
    throttle_classes = [UserRateThrottle]
    
    def get(self, request):
        """Get list of plans with filtering - UPDATED with time variant filters"""
        try:
            # Use PlanService for efficient querying
            filters = self._extract_filters(request)
            page = int(request.query_params.get('page', 1))
            page_size = int(request.query_params.get('page_size', 20))
            
            result = PlanService.get_plans_by_filters(filters, page, page_size)
            
            # Add time variant info to each plan
            for plan in result['plans']:
                plan.time_variant_info = plan.get_time_variant_summary()
                plan.availability_info = plan.is_available_for_client()
            
            # Serialize plans
            serializer = InternetPlanSerializer(result['plans'], many=True, context={'request': request})
            
            return Response({
                'success': True,
                'count': result['total_count'],
                'next': f"?page={page + 1}&page_size={page_size}" if page < result['total_pages'] else None,
                'previous': f"?page={page - 1}&page_size={page_size}" if page > 1 else None,
                'results': serializer.data,
                'page': page,
                'page_size': page_size,
                'total_pages': result['total_pages'],
                'filters_applied': filters
            })
            
        except Exception as e:
            logger.error(f"Failed to get plans: {e}")
            return Response({
                'success': False,
                'error': 'Failed to load plans',
                'details': str(e) if request.user.is_staff else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def post(self, request):
        """Create new plan with time variant support"""
        if not request.user.is_staff:
            return Response({
                'success': False,
                'error': 'Permission denied'
            }, status=status.HTTP_403_FORBIDDEN)
        
        try:
            # Check for duplicate name
            plan_name = request.data.get('name', '')
            if plan_name and InternetPlan.objects.filter(name=plan_name).exists():
                return Response({
                    'success': False,
                    'error': f'A plan with the name "{plan_name}" already exists'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            serializer = InternetPlanCreateSerializer(
                data=request.data,
                context={'request': request}
            )
            
            if not serializer.is_valid():
                return Response({
                    'success': False,
                    'error': 'Validation failed',
                    'details': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
            
            with transaction.atomic():
                plan = serializer.save()
                
                # Set created_by
                plan.created_by = request.user
                plan.save(update_fields=['created_by'])
                
                # Emit signal
                from internet_plans.signals.plan_signals import plan_created
                plan_created.send(
                    sender=InternetPlan,
                    plan_id=str(plan.id),
                    plan_name=plan.name,
                    plan_type=plan.plan_type,
                    price=plan.price,
                    category=plan.category,
                    access_methods=plan.get_enabled_access_methods(),
                    has_time_variant=plan.has_time_variant(),
                    created_by=request.user.username,
                    timestamp=plan.created_at
                )
                
                logger.info(f"Plan created: {plan.name} by {request.user.username}")
                
                return Response({
                    'success': True,
                    'message': 'Plan created successfully',
                    'plan': InternetPlanSerializer(plan, context={'request': request}).data
                }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Failed to create plan: {e}")
            return Response({
                'success': False,
                'error': 'Failed to create plan',
                'details': str(e) if request.user.is_staff else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _extract_filters(self, request):
        """Extract and validate filters from request - UPDATED with time variant filters"""
        filters = {}
        
        # Active filter
        if active := request.query_params.get('active'):
            filters['active'] = active.lower() == 'true'
        
        # Category filter
        if category := request.query_params.get('category'):
            filters['category'] = category
        
        # Plan type filter
        if plan_type := request.query_params.get('plan_type'):
            filters['plan_type'] = plan_type
        
        # Access method filter
        if access_method := request.query_params.get('access_method'):
            filters['access_method'] = access_method
        
        # Client type restriction filter - NEW
        if client_type := request.query_params.get('client_type'):
            filters['client_type_restriction'] = client_type
        
        # Time variant filter - NEW
        if time_variant := request.query_params.get('time_variant'):
            if time_variant.lower() == 'active':
                filters['has_time_variant'] = True
            elif time_variant.lower() == 'inactive':
                filters['has_time_variant'] = False
        
        # Availability filter - NEW
        if available_now := request.query_params.get('available_now'):
            filters['available_now'] = available_now.lower() == 'true'
        
        # Search filter
        if search := request.query_params.get('search'):
            filters['search'] = search
        
        # Price range filter
        if min_price := request.query_params.get('min_price'):
            try:
                filters['min_price'] = float(min_price)
            except (ValueError, TypeError):
                pass
        
        if max_price := request.query_params.get('max_price'):
            try:
                filters['max_price'] = float(max_price)
            except (ValueError, TypeError):
                pass
        
        # Template filter
        if template_id := request.query_params.get('template_id'):
            filters['template_id'] = template_id
        
        # Sorting
        if sort_by := request.query_params.get('sort_by'):
            filters['sort_by'] = sort_by
        
        if sort_order := request.query_params.get('sort_order'):
            filters['sort_order'] = sort_order
        
        return filters


class InternetPlanDetailView(APIView):
    """
    Retrieve, update, or delete an Internet Plan with Time Variant
    UPDATED: Added time variant support
    """
    
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    
    def get(self, request, plan_id):
        """Get plan details with time variant info"""
        try:
            # Use caching
            plan = PlanService.get_plan_with_cache(plan_id)
            
            if not plan:
                return Response({
                    'success': False,
                    'error': 'Plan not found'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Check permissions for inactive plans
            if not plan.active and not request.user.is_staff:
                return Response({
                    'success': False,
                    'error': 'Plan not available'
                }, status=status.HTTP_404_NOT_FOUND)
            
            serializer = InternetPlanDetailSerializer(plan, context={'request': request})
            
            # Add pricing information
            pricing_info = PricingService.get_pricing_options(plan)
            
            # Add time variant availability for different client types
            availability = {
                'hotspot': plan.is_available_for_client('hotspot'),
                'pppoe': plan.is_available_for_client('pppoe') if plan.supports_access_method('pppoe') else None
            }
            
            response_data = {
                'success': True,
                'plan': serializer.data,
                'pricing_options': pricing_info,
                'summary': format_plan_summary(plan),
                'availability': availability,
                'compatibility': {
                    'supported_access_methods': plan.get_enabled_access_methods(),
                    'router_specific': plan.router_specific,
                    'allowed_routers_count': plan.allowed_routers.count() if plan.router_specific else 'All',
                    'client_type_restriction': plan.client_type_restriction
                }
            }
            
            return Response(response_data)
            
        except Exception as e:
            logger.error(f"Failed to get plan {plan_id}: {e}")
            return Response({
                'success': False,
                'error': 'Failed to load plan details'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def put(self, request, plan_id):
        """Update plan with time variant support"""
        if not request.user.is_staff:
            return Response({
                'success': False,
                'error': 'Permission denied'
            }, status=status.HTTP_403_FORBIDDEN)
        
        try:
            plan = get_object_or_404(InternetPlan, id=plan_id)
            
            # Check for duplicate name
            new_name = request.data.get('name')
            if new_name and new_name != plan.name:
                if InternetPlan.objects.filter(name=new_name).exclude(id=plan_id).exists():
                    return Response({
                        'success': False,
                        'error': f'A plan with the name "{new_name}" already exists'
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
                
                # Emit price change signal if price changed
                if old_price != updated_plan.price:
                    from internet_plans.signals.plan_signals import plan_price_changed
                    plan_price_changed.send(
                        sender=InternetPlan,
                        plan_id=str(plan_id),
                        old_price=old_price,
                        new_price=updated_plan.price,
                        changed_by=request.user.username,
                        reason=request.data.get('price_change_reason', 'Price updated'),
                        timestamp=timezone.now()
                    )
                
                # Emit update signal
                from internet_plans.signals.plan_signals import plan_updated
                plan_updated.send(
                    sender=InternetPlan,
                    plan_id=str(plan_id),
                    plan_name=updated_plan.name,
                    changes=serializer.validated_data,
                    updated_by=request.user.username,
                    timestamp=timezone.now()
                )
                
                logger.info(f"Plan updated: {plan_id} by {request.user.username}")
                
                return Response({
                    'success': True,
                    'message': 'Plan updated successfully',
                    'plan': InternetPlanSerializer(updated_plan, context={'request': request}).data
                })
            
        except Exception as e:
            logger.error(f"Failed to update plan {plan_id}: {e}")
            return Response({
                'success': False,
                'error': 'Failed to update plan',
                'details': str(e) if request.user.is_staff else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def delete(self, request, plan_id):
        """Delete (deactivate) plan"""
        if not request.user.is_staff:
            return Response({
                'success': False,
                'error': 'Permission denied'
            }, status=status.HTTP_403_FORBIDDEN)
        
        try:
            plan = get_object_or_404(InternetPlan, id=plan_id)
            
            # Check if plan has active subscriptions
            from service_operations.models.subscription_models import Subscription
            active_subs = Subscription.objects.filter(
                internet_plan=plan,
                status='active',
                is_active=True
            ).exists()
            
            if active_subs:
                return Response({
                    'success': False,
                    'error': 'Cannot deactivate plan with active subscriptions'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Soft delete (deactivate)
            plan.active = False
            plan.save()
            
            # Clear cache
            cache.delete(f"internet_plan:{plan_id}")
            cache.delete_pattern("internet_plans:*")
            
            # Emit deactivation signal
            from internet_plans.signals.plan_signals import plan_deactivated
            plan_deactivated.send(
                sender=InternetPlan,
                plan_id=str(plan_id),
                plan_name=plan.name,
                deactivated_by=request.user.username,
                reason=request.data.get('reason', 'Plan deactivated'),
                timestamp=timezone.now()
            )
            
            logger.info(f"Plan deactivated: {plan_id} by {request.user.username}")
            
            return Response({
                'success': True,
                'message': 'Plan deactivated successfully'
            })
            
        except Exception as e:
            logger.error(f"Failed to deactivate plan {plan_id}: {e}")
            return Response({
                'success': False,
                'error': 'Failed to deactivate plan'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class TimeVariantConfigView(APIView):
    """
    Manage Time Variant Configurations
    NEW: Dedicated endpoint for time variant management
    """
    
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    
    def get(self, request, config_id=None):
        """Get time variant configuration(s)"""
        if not request.user.is_staff:
            return Response({
                'success': False,
                'error': 'Permission denied'
            }, status=status.HTTP_403_FORBIDDEN)
        
        try:
            if config_id:
                # Get specific configuration
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
            
        except Exception as e:
            logger.error(f"Failed to get time variant configs: {e}")
            return Response({
                'success': False,
                'error': 'Failed to load configurations',
                'details': str(e) if request.user.is_staff else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def post(self, request):
        """Create new time variant configuration"""
        if not request.user.is_staff:
            return Response({
                'success': False,
                'error': 'Permission denied'
            }, status=status.HTTP_403_FORBIDDEN)
        
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
            
            logger.info(f"Time variant config created: {config.id} by {request.user.username}")
            
            return Response({
                'success': True,
                'message': 'Time variant configuration created successfully',
                'config': TimeVariantConfigSerializer(config, context={'request': request}).data
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Failed to create time variant config: {e}")
            return Response({
                'success': False,
                'error': 'Failed to create configuration',
                'details': str(e) if request.user.is_staff else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def put(self, request, config_id):
        """Update time variant configuration"""
        if not request.user.is_staff:
            return Response({
                'success': False,
                'error': 'Permission denied'
            }, status=status.HTTP_403_FORBIDDEN)
        
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
            cache.delete_pattern("available_plans:*")
            
            logger.info(f"Time variant config updated: {config_id} by {request.user.username}")
            
            return Response({
                'success': True,
                'message': 'Time variant configuration updated successfully',
                'config': TimeVariantConfigSerializer(updated_config, context={'request': request}).data
            })
            
        except Exception as e:
            logger.error(f"Failed to update time variant config {config_id}: {e}")
            return Response({
                'success': False,
                'error': 'Failed to update configuration',
                'details': str(e) if request.user.is_staff else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def delete(self, request, config_id):
        """Delete time variant configuration"""
        if not request.user.is_staff:
            return Response({
                'success': False,
                'error': 'Permission denied'
            }, status=status.HTTP_403_FORBIDDEN)
        
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
            
            config.delete()
            
            logger.info(f"Time variant config deleted: {config_id} by {request.user.username}")
            
            return Response({
                'success': True,
                'message': 'Time variant configuration deleted successfully'
            })
            
        except Exception as e:
            logger.error(f"Failed to delete time variant config {config_id}: {e}")
            return Response({
                'success': False,
                'error': 'Failed to delete configuration'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PlanAvailabilityCheckView(APIView):
    """
    Check plan availability for clients
    NEW: Dedicated endpoint for availability checking
    """
    
    permission_classes = [AllowAny]  # Allow access from captive portal
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
            
            result = serializer.get_availability_result()
            
            return Response({
                'success': True,
                'data': result
            })
            
        except Exception as e:
            logger.error(f"Failed to check plan availability: {e}")
            return Response({
                'success': False,
                'error': 'Failed to check availability',
                'timestamp': timezone.now().isoformat()
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AvailablePlansView(APIView):
    """
    Get available plans for clients (for captive portal)
    NEW: Client-facing endpoint for plan listing
    """
    
    permission_classes = [AllowAny]  # Allow access from captive portal
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
            logger.error(f"Failed to get available plans: {e}")
            return Response({
                'success': False,
                'error': 'Failed to get available plans',
                'timestamp': timezone.now().isoformat()
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def get(self, request):
        """Get available plans with query parameters (for GET requests)"""
        try:
            # Convert GET parameters to serializer data
            data = {
                'client_type': request.query_params.get('client_type', 'hotspot'),
                'router_id': request.query_params.get('router_id'),
                'category': request.query_params.get('category'),
                'max_price': request.query_params.get('max_price'),
                'include_unavailable': request.query_params.get('include_unavailable', 'false').lower() == 'true'
            }
            
            # Remove None values
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
            logger.error(f"Failed to get available plans: {e}")
            return Response({
                'success': False,
                'error': 'Failed to get available plans',
                'timestamp': timezone.now().isoformat()
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PublicInternetPlanListView(APIView):
    """
    Public API for listing available Internet Plans
    No authentication required
    UPDATED: Filter by time availability
    """
    
    permission_classes = [AllowAny]
    throttle_classes = [UserRateThrottle]
    
    def get(self, request):
        """Get public list of available plans"""
        try:
            # Determine client type from request (default to hotspot)
            client_type = request.query_params.get('client_type', 'hotspot')
            
            # Cache key
            cache_key = f"public_available_plans:{client_type}:{request.GET.urlencode()}"
            cached_data = cache.get(cache_key)
            
            if cached_data:
                return Response(cached_data)
            
            # Use AvailablePlansRequestSerializer for consistency
            data = {
                'client_type': client_type,
                'router_id': request.query_params.get('router_id'),
                'category': request.query_params.get('category'),
                'max_price': request.query_params.get('max_price'),
                'include_unavailable': False  # Public API only shows available plans
            }
            
            # Remove None values
            data = {k: v for k, v in data.items() if v is not None}
            
            serializer = AvailablePlansRequestSerializer(data=data, context={'request': request})
            
            if not serializer.is_valid():
                return Response({
                    'success': False,
                    'error': 'Validation failed',
                    'details': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
            
            result = serializer.get_available_plans()
            
            response_data = {
                'success': True,
                'count': result['count'],
                'client_type': client_type,
                'plans': result['plans'],
                'timestamp': timezone.now().isoformat()
            }
            
            # Cache for 1 minute (time-sensitive)
            cache.set(cache_key, response_data, 60)
            
            return Response(response_data)
            
        except Exception as e:
            logger.error(f"Failed to get public plans: {e}")
            return Response({
                'success': False,
                'error': 'Failed to load plans',
                'timestamp': timezone.now().isoformat()
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PlanStatisticsView(APIView):
    """
    Get statistics about plans
    UPDATED: Added time variant statistics
    """
    
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get plan statistics including time variant stats"""
        try:
            stats = PlanService.get_plan_statistics()
            
            if 'error' in stats:
                return Response({
                    'success': False,
                    'error': stats['error']
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            # Add time variant statistics - NEW
            time_variant_stats = {
                'plans_with_time_variant': InternetPlan.objects.filter(
                    active=True,
                    time_variant__is_active=True
                ).count(),
                'time_variant_configs': TimeVariantConfig.objects.filter(is_active=True).count(),
                'availability_by_time': self._get_availability_stats()
            }
            
            stats['time_variant'] = time_variant_stats
            
            return Response({
                'success': True,
                'statistics': stats
            })
            
        except Exception as e:
            logger.error(f"Failed to get plan statistics: {e}")
            return Response({
                'success': False,
                'error': 'Failed to get statistics',
                'timestamp': timezone.now().isoformat()
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _get_availability_stats(self):
        """Get availability statistics"""
        now = timezone.now()
        current_hour = now.hour
        current_day = now.strftime('%a').lower()[:3]
        
        # Count plans available now
        available_now = 0
        total_with_time_variant = 0
        
        plans_with_time_variant = InternetPlan.objects.filter(
            active=True,
            time_variant__is_active=True
        ).select_related('time_variant')
        
        for plan in plans_with_time_variant:
            total_with_time_variant += 1
            if plan.time_variant.is_available_now():
                available_now += 1
        
        return {
            'available_now': available_now,
            'total_with_time_variant': total_with_time_variant,
            'percentage_available': (available_now / total_with_time_variant * 100) if total_with_time_variant > 0 else 0,
            'current_time': now.isoformat(),
            'current_hour': current_hour,
            'current_day': current_day
        }


class PlanCompatibilityCheckView(APIView):
    """
    Check plan compatibility
    UPDATED: Added time availability checking
    """
    
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    
    def post(self, request):
        """Check plan compatibility including time availability"""
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
            logger.error(f"Failed to check plan compatibility: {e}")
            return Response({
                'success': False,
                'error': 'Failed to check compatibility',
                'details': str(e) if request.user.is_staff else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PlanRecommendationView(APIView):
    """
    Get plan recommendations
    UPDATED: Consider time availability in recommendations
    """
    
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    
    def get(self, request):
        """Get plan recommendations considering availability"""
        try:
            # Extract parameters
            client_type = request.query_params.get('client_type')
            budget = request.query_params.get('budget')
            access_method = request.query_params.get('access_method')
            limit = int(request.query_params.get('limit', 5))
            
            # Parse budget
            budget_value = None
            if budget:
                try:
                    budget_value = float(budget)
                except ValueError:
                    return Response({
                        'success': False,
                        'error': 'Invalid budget format'
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            # Get recommendations
            recommendations = PlanService.get_recommended_plans(
                client_type=client_type,
                budget=budget_value,
                access_method=access_method,
                limit=limit
            )
            
            # Filter by availability for the specific client type
            filtered_recommendations = []
            for rec in recommendations:
                plan_id = rec['id']
                plan = InternetPlan.get_cached_plan(plan_id)
                if plan:
                    availability = plan.is_available_for_client(client_type or 'hotspot')
                    if availability['available']:
                        rec['availability'] = availability
                        filtered_recommendations.append(rec)
            
            return Response({
                'success': True,
                'recommendations': filtered_recommendations,
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
    NEW: For debugging and testing time variant logic
    """
    
    permission_classes = [IsAdminUser]
    throttle_classes = [UserRateThrottle]
    
    def post(self, request):
        """Test time variant configuration"""
        try:
            # Create a test time variant
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
                
                # Test availability
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
            logger.error(f"Failed to test time variant: {e}")
            return Response({
                'success': False,
                'error': 'Failed to test time variant',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)