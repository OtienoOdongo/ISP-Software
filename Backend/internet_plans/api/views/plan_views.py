"""
Internet Plans - Plan Views
API views for Plan Templates and Internet Plans
"""

from django.shortcuts import get_object_or_404
from django.db.models import Q, Count, F, Sum
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

from internet_plans.models.plan_models import PlanTemplate, InternetPlan
from internet_plans.serializers.plan_serializers import PlanTemplateSerializer, InternetPlanSerializer
from internet_plans.serializers.client_serializers import ClientPlanSerializer
from internet_plans.services.integration_service import IntegrationService

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


class PlanTemplateListView(APIView):
    """
    List and create Plan Templates
    GET: List templates with filtering
    POST: Create new template
    """
    
    permission_classes = [IsAuthenticated]
    pagination_class = StandardPagination
    throttle_classes = [UserRateThrottle]
    
    def get(self, request):
        """Get list of templates with filtering"""
        try:
            # Base queryset
            queryset = PlanTemplate.objects.filter(is_active=True)
            
            # Apply filters
            queryset = self._apply_filters(queryset, request)
            
            # Apply sorting
            queryset = self._apply_sorting(queryset, request)
            
            # Paginate
            paginator = self.pagination_class()
            page = paginator.paginate_queryset(queryset, request)
            
            # Serialize
            serializer = PlanTemplateSerializer(
                page, 
                many=True, 
                context={'request': request}
            )
            
            return paginator.get_paginated_response(serializer.data)
            
        except Exception as e:
            logger.error(f"Failed to get templates: {e}")
            return Response({
                'success': False,
                'error': 'Failed to load templates',
                'details': str(e) if request.user.is_staff else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def post(self, request):
        """Create new template"""
        try:
            serializer = PlanTemplateSerializer(
                data=request.data,
                context={'request': request}
            )
            
            if not serializer.is_valid():
                return Response({
                    'success': False,
                    'error': 'Validation failed',
                    'details': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
            
            template = serializer.save()
            
            # Clear cache
            cache.delete_pattern('plan_templates:*')
            
            logger.info(f"Template created: {template.name} by {request.user.username}")
            
            return Response({
                'success': True,
                'message': 'Template created successfully',
                'template': PlanTemplateSerializer(template).data
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Failed to create template: {e}")
            return Response({
                'success': False,
                'error': 'Failed to create template',
                'details': str(e) if request.user.is_staff else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _apply_filters(self, queryset, request):
        """Apply filters to queryset"""
        # Category filter
        if category := request.query_params.get('category'):
            queryset = queryset.filter(category=category)
        
        # Search filter
        if search := request.query_params.get('search'):
            queryset = queryset.filter(
                Q(name__icontains=search) | 
                Q(description__icontains=search)
            )
        
        # Access type filter
        if access_type := request.query_params.get('access_type'):
            if access_type == 'hotspot':
                queryset = queryset.filter(access_methods__hotspot__enabled=True)
            elif access_type == 'pppoe':
                queryset = queryset.filter(access_methods__pppoe__enabled=True)
            elif access_type == 'dual':
                queryset = queryset.filter(
                    access_methods__hotspot__enabled=True,
                    access_methods__pppoe__enabled=True
                )
        
        # Visibility filter
        if not request.user.is_staff:
            queryset = queryset.filter(is_public=True)
        elif visibility := request.query_params.get('visibility'):
            if visibility == 'public':
                queryset = queryset.filter(is_public=True)
            elif visibility == 'private':
                queryset = queryset.filter(is_public=False)
        
        # Price range filter
        min_price = request.query_params.get('min_price')
        max_price = request.query_params.get('max_price')
        if min_price:
            try:
                queryset = queryset.filter(base_price__gte=min_price)
            except (ValueError, TypeError):
                pass
        if max_price:
            try:
                queryset = queryset.filter(base_price__lte=max_price)
            except (ValueError, TypeError):
                pass
        
        return queryset
    
    def _apply_sorting(self, queryset, request):
        """Apply sorting to queryset"""
        sort_by = request.query_params.get('sort_by', 'name')
        sort_order = request.query_params.get('sort_order', 'asc')
        
        sort_map = {
            'name': 'name',
            'basePrice': 'base_price',
            'usageCount': 'usage_count',
            'createdAt': 'created_at',
            'updatedAt': 'updated_at',
        }
        
        field = sort_map.get(sort_by, sort_by)
        if sort_order == 'desc':
            field = f'-{field}'
        
        return queryset.order_by(field)


class PlanTemplateDetailView(APIView):
    """
    Retrieve, update, or delete a Plan Template
    """
    
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    
    def get(self, request, template_id):
        """Get template details"""
        try:
            # Get template
            if request.user.is_staff:
                template = get_object_or_404(PlanTemplate, id=template_id)
            else:
                template = get_object_or_404(
                    PlanTemplate, 
                    id=template_id, 
                    is_active=True,
                    is_public=True
                )
            
            serializer = PlanTemplateSerializer(
                template, 
                context={'request': request}
            )
            
            return Response({
                'success': True,
                'template': serializer.data
            })
            
        except Exception as e:
            logger.error(f"Failed to get template {template_id}: {e}")
            return Response({
                'success': False,
                'error': 'Template not found'
            }, status=status.HTTP_404_NOT_FOUND)
    
    def put(self, request, template_id):
        """Update template"""
        if not request.user.is_staff:
            return Response({
                'success': False,
                'error': 'Permission denied'
            }, status=status.HTTP_403_FORBIDDEN)
        
        try:
            template = get_object_or_404(PlanTemplate, id=template_id)
            
            # Check ownership
            if not request.user.is_superuser and template.created_by != request.user:
                return Response({
                    'success': False,
                    'error': 'You can only edit your own templates'
                }, status=status.HTTP_403_FORBIDDEN)
            
            serializer = PlanTemplateSerializer(
                template, 
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
            
            updated_template = serializer.save()
            
            # Clear cache
            cache.delete_pattern('plan_templates:*')
            
            logger.info(f"Template updated: {template_id} by {request.user.username}")
            
            return Response({
                'success': True,
                'message': 'Template updated successfully',
                'template': PlanTemplateSerializer(updated_template).data
            })
            
        except Exception as e:
            logger.error(f"Failed to update template {template_id}: {e}")
            return Response({
                'success': False,
                'error': 'Failed to update template',
                'details': str(e) if request.user.is_staff else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def delete(self, request, template_id):
        """Delete template"""
        if not request.user.is_staff:
            return Response({
                'success': False,
                'error': 'Permission denied'
            }, status=status.HTTP_403_FORBIDDEN)
        
        try:
            template = get_object_or_404(PlanTemplate, id=template_id)
            
            # Check ownership
            if not request.user.is_superuser and template.created_by != request.user:
                return Response({
                    'success': False,
                    'error': 'You can only delete your own templates'
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Soft delete
            template.is_active = False
            template.save()
            
            # Clear cache
            cache.delete_pattern('plan_templates:*')
            
            logger.info(f"Template deleted: {template_id} by {request.user.username}")
            
            return Response({
                'success': True,
                'message': 'Template deleted successfully'
            })
            
        except Exception as e:
            logger.error(f"Failed to delete template {template_id}: {e}")
            return Response({
                'success': False,
                'error': 'Failed to delete template'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CreatePlanFromTemplateView(APIView):
    """
    Create Internet Plan from Template
    """
    
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    
    def post(self, request, template_id):
        """Create plan from template"""
        try:
            # Get template
            template = get_object_or_404(
                PlanTemplate,
                id=template_id,
                is_active=True
            )
            
            # Check permissions
            if not template.is_public and template.created_by != request.user:
                return Response({
                    'success': False,
                    'error': 'You do not have permission to use this template'
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Validate plan name
            plan_name = request.data.get('name', f"{template.name} Plan")
            if InternetPlan.objects.filter(name=plan_name).exists():
                return Response({
                    'success': False,
                    'error': f'A plan with the name "{plan_name}" already exists'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Prepare plan data
            plan_data = {
                'name': plan_name,
                'description': request.data.get('description', template.description),
                'category': request.data.get('category', template.category),
                'price': request.data.get('price', str(template.base_price)),
                'plan_type': request.data.get('plan_type', 'paid' if template.base_price > 0 else 'free_trial'),
                'access_methods': request.data.get('accessMethods', template.access_methods),
                'priority_level': request.data.get('priority_level', 4),
                'router_specific': request.data.get('router_specific', False),
                'FUP_policy': request.data.get('FUP_policy', ''),
                'FUP_threshold': request.data.get('FUP_threshold', 80),
                'templateId': str(template.id),
            }
            
            # Allowed routers
            if 'allowed_routers_ids' in request.data:
                plan_data['allowedRoutersIds'] = request.data['allowed_routers_ids']
            
            # Create plan
            with transaction.atomic():
                serializer = InternetPlanSerializer(
                    data=plan_data,
                    context={'request': request}
                )
                
                if not serializer.is_valid():
                    return Response({
                        'success': False,
                        'error': 'Validation failed',
                        'details': serializer.errors
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                plan = serializer.save()
                
                # Increment template usage
                template.increment_usage()
                
                # Clear cache
                cache.delete_pattern('internet_plans:*')
                
                logger.info(f"Plan created from template: {plan.name} by {request.user.username}")
                
                return Response({
                    'success': True,
                    'message': 'Plan created successfully',
                    'plan': InternetPlanSerializer(plan).data
                }, status=status.HTTP_201_CREATED)
                
        except Exception as e:
            logger.error(f"Failed to create plan from template {template_id}: {e}")
            return Response({
                'success': False,
                'error': 'Failed to create plan',
                'details': str(e) if request.user.is_staff else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class InternetPlanListView(APIView):
    """
    List and create Internet Plans
    GET: List plans with filtering
    POST: Create new plan
    """
    
    permission_classes = [IsAuthenticated]
    pagination_class = StandardPagination
    throttle_classes = [UserRateThrottle]
    
    def get(self, request):
        """Get list of plans with filtering"""
        try:
            # Base queryset
            queryset = InternetPlan.objects.select_related('template').prefetch_related('allowed_routers')
            
            # Apply filters
            queryset = self._apply_filters(queryset, request)
            
            # Apply sorting
            queryset = self._apply_sorting(queryset, request)
            
            # Paginate
            paginator = self.pagination_class()
            page = paginator.paginate_queryset(queryset, request)
            
            # Serialize
            serializer = InternetPlanSerializer(page, many=True)
            
            return paginator.get_paginated_response(serializer.data)
            
        except Exception as e:
            logger.error(f"Failed to get plans: {e}")
            return Response({
                'success': False,
                'error': 'Failed to load plans',
                'details': str(e) if request.user.is_staff else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def post(self, request):
        """Create new plan"""
        try:
            # Check for duplicate name
            plan_name = request.data.get('name', '')
            if plan_name and InternetPlan.objects.filter(name=plan_name).exists():
                return Response({
                    'success': False,
                    'error': f'A plan with the name "{plan_name}" already exists'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            serializer = InternetPlanSerializer(
                data=request.data,
                context={'request': request}
            )
            
            if not serializer.is_valid():
                return Response({
                    'success': False,
                    'error': 'Validation failed',
                    'details': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
            
            plan = serializer.save()
            
            # Clear cache
            cache.delete_pattern('internet_plans:*')
            
            logger.info(f"Plan created: {plan.name} by {request.user.username}")
            
            return Response({
                'success': True,
                'message': 'Plan created successfully',
                'plan': InternetPlanSerializer(plan).data
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Failed to create plan: {e}")
            return Response({
                'success': False,
                'error': 'Failed to create plan',
                'details': str(e) if request.user.is_staff else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _apply_filters(self, queryset, request):
        """Apply filters to queryset"""
        # Active filter
        if active := request.query_params.get('active'):
            queryset = queryset.filter(active=active.lower() == 'true')
        else:
            queryset = queryset.filter(active=True)
        
        # Category filter
        if category := request.query_params.get('category'):
            queryset = queryset.filter(category=category)
        
        # Plan type filter
        if plan_type := request.query_params.get('plan_type'):
            queryset = queryset.filter(plan_type=plan_type)
        
        # Search filter
        if search := request.query_params.get('search'):
            queryset = queryset.filter(
                Q(name__icontains=search) | 
                Q(description__icontains=search)
            )
        
        # Access type filter
        if access_type := request.query_params.get('access_type'):
            if access_type == 'hotspot':
                queryset = queryset.filter(access_methods__hotspot__enabled=True)
            elif access_type == 'pppoe':
                queryset = queryset.filter(access_methods__pppoe__enabled=True)
        
        # Price range filter
        min_price = request.query_params.get('min_price')
        max_price = request.query_params.get('max_price')
        if min_price:
            try:
                queryset = queryset.filter(price__gte=min_price)
            except (ValueError, TypeError):
                pass
        if max_price:
            try:
                queryset = queryset.filter(price__lte=max_price)
            except (ValueError, TypeError):
                pass
        
        # Template filter
        if template_id := request.query_params.get('template_id'):
            queryset = queryset.filter(template_id=template_id)
        
        return queryset
    
    def _apply_sorting(self, queryset, request):
        """Apply sorting to queryset"""
        sort_by = request.query_params.get('sort_by', 'name')
        sort_order = request.query_params.get('sort_order', 'asc')
        
        sort_map = {
            'name': 'name',
            'price': 'price',
            'purchases': 'purchases',
            'priority': 'priority_level',
            'createdAt': 'created_at',
            'updatedAt': 'updated_at',
        }
        
        field = sort_map.get(sort_by, sort_by)
        if sort_order == 'desc':
            field = f'-{field}'
        
        return queryset.order_by(field)


class InternetPlanDetailView(APIView):
    """
    Retrieve, update, or delete an Internet Plan
    """
    
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    
    def get(self, request, plan_id):
        """Get plan details"""
        try:
            plan = get_object_or_404(
                InternetPlan.objects.select_related('template').prefetch_related('allowed_routers'),
                id=plan_id
            )
            
            serializer = InternetPlanSerializer(plan)
            
            return Response({
                'success': True,
                'plan': serializer.data
            })
            
        except Exception as e:
            logger.error(f"Failed to get plan {plan_id}: {e}")
            return Response({
                'success': False,
                'error': 'Plan not found'
            }, status=status.HTTP_404_NOT_FOUND)
    
    def put(self, request, plan_id):
        """Update plan"""
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
            
            serializer = InternetPlanSerializer(
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
            
            updated_plan = serializer.save()
            
            # Clear cache
            cache.delete_pattern('internet_plans:*')
            
            logger.info(f"Plan updated: {plan_id} by {request.user.username}")
            
            return Response({
                'success': True,
                'message': 'Plan updated successfully',
                'plan': InternetPlanSerializer(updated_plan).data
            })
            
        except Exception as e:
            logger.error(f"Failed to update plan {plan_id}: {e}")
            return Response({
                'success': False,
                'error': 'Failed to update plan',
                'details': str(e) if request.user.is_staff else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def delete(self, request, plan_id):
        """Delete plan"""
        if not request.user.is_staff:
            return Response({
                'success': False,
                'error': 'Permission denied'
            }, status=status.HTTP_403_FORBIDDEN)
        
        try:
            plan = get_object_or_404(InternetPlan, id=plan_id)
            
            # Check if plan has active subscriptions
            from internet_plans.models.subscription_models import Subscription
            active_subs = Subscription.objects.filter(
                internet_plan=plan,
                status='active',
                is_active=True
            ).exists()
            
            if active_subs:
                return Response({
                    'success': False,
                    'error': 'Cannot delete plan with active subscriptions'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Soft delete
            plan.active = False
            plan.save()
            
            # Clear cache
            cache.delete_pattern('internet_plans:*')
            
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


class PublicInternetPlanListView(APIView):
    """
    Public API for listing Internet Plans
    No authentication required
    """
    
    permission_classes = [AllowAny]
    throttle_classes = [UserRateThrottle]
    
    def get(self, request):
        """Get public list of plans"""
        try:
            # Cache key
            cache_key = f"public_plans:{request.GET.urlencode()}"
            cached_data = cache.get(cache_key)
            
            if cached_data:
                return Response(cached_data)
            
            # Base queryset - only active plans
            queryset = InternetPlan.objects.filter(active=True)
            
            # Apply filters
            queryset = self._apply_filters(queryset, request)
            
            # Apply sorting
            queryset = self._apply_sorting(queryset, request)
            
            # Serialize
            serializer = ClientPlanSerializer(queryset, many=True)
            
            response_data = {
                'success': True,
                'count': len(serializer.data),
                'plans': serializer.data,
                'timestamp': timezone.now().isoformat()
            }
            
            # Cache for 5 minutes
            cache.set(cache_key, response_data, 300)
            
            return Response(response_data)
            
        except Exception as e:
            logger.error(f"Failed to get public plans: {e}")
            return Response({
                'success': False,
                'error': 'Failed to load plans',
                'timestamp': timezone.now().isoformat()
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _apply_filters(self, queryset, request):
        """Apply filters to queryset"""
        # Category filter
        if category := request.query_params.get('category'):
            queryset = queryset.filter(category=category)
        
        # Plan type filter
        if plan_type := request.query_params.get('plan_type'):
            queryset = queryset.filter(plan_type=plan_type)
        
        # Access method filter
        if access_method := request.query_params.get('access_method'):
            if access_method == 'hotspot':
                queryset = queryset.filter(access_methods__hotspot__enabled=True)
            elif access_method == 'pppoe':
                queryset = queryset.filter(access_methods__pppoe__enabled=True)
        
        # Price range filter
        min_price = request.query_params.get('min_price')
        max_price = request.query_params.get('max_price')
        if min_price:
            try:
                queryset = queryset.filter(price__gte=float(min_price))
            except (ValueError, TypeError):
                pass
        if max_price:
            try:
                queryset = queryset.filter(price__lte=float(max_price))
            except (ValueError, TypeError):
                pass
        
        return queryset
    
    def _apply_sorting(self, queryset, request):
        """Apply sorting to queryset"""
        sort_by = request.query_params.get('sort_by', 'name')
        sort_order = request.query_params.get('sort_order', 'asc')
        
        sort_map = {
            'name': 'name',
            'price': 'price',
            'popularity': 'purchases',
        }
        
        field = sort_map.get(sort_by, sort_by)
        if sort_order == 'desc':
            field = f'-{field}'
        
        return queryset.order_by(field)


class PlanStatisticsView(APIView):
    """
    Get statistics about plans
    """
    
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get plan statistics"""
        try:
            # Cache key
            cache_key = f"plan_stats:{request.user.id}"
            cached_data = cache.get(cache_key)
            
            if cached_data:
                return Response(cached_data)
            
            # Get statistics
            total_plans = InternetPlan.objects.filter(active=True).count()
            active_plans = InternetPlan.objects.filter(active=True).count()
            free_trials = InternetPlan.objects.filter(plan_type='free_trial', active=True).count()
            
            # Popular plans
            popular_plans = InternetPlan.objects.filter(
                active=True
            ).order_by('-purchases')[:5].values('id', 'name', 'purchases')
            
            # Plans by category
            plans_by_category = InternetPlan.objects.filter(
                active=True
            ).values('category').annotate(
                count=Count('id'),
                total_purchases=Sum('purchases')
            ).order_by('-count')
            
            # Plans by access type
            hotspot_plans = InternetPlan.objects.filter(
                active=True,
                access_methods__hotspot__enabled=True
            ).count()
            
            pppoe_plans = InternetPlan.objects.filter(
                active=True,
                access_methods__pppoe__enabled=True
            ).count()
            
            dual_plans = InternetPlan.objects.filter(
                active=True,
                access_methods__hotspot__enabled=True,
                access_methods__pppoe__enabled=True
            ).count()
            
            response_data = {
                'success': True,
                'statistics': {
                    'total_plans': total_plans,
                    'active_plans': active_plans,
                    'free_trials': free_trials,
                    'popular_plans': list(popular_plans),
                    'by_category': list(plans_by_category),
                    'by_access_type': {
                        'hotspot': hotspot_plans,
                        'pppoe': pppoe_plans,
                        'dual': dual_plans
                    }
                },
                'timestamp': timezone.now().isoformat()
            }
            
            # Cache for 10 minutes
            cache.set(cache_key, response_data, 600)
            
            return Response(response_data)
            
        except Exception as e:
            logger.error(f"Failed to get plan statistics: {e}")
            return Response({
                'success': False,
                'error': 'Failed to get statistics',
                'timestamp': timezone.now().isoformat()
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)