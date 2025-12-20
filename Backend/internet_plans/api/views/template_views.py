"""
Internet Plans - Template Views
API views for Plan Template management
Maintains original logic with improvements
Production-ready with comprehensive error handling
"""

from django.shortcuts import get_object_or_404
from django.db.models import Q, Count
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

from internet_plans.models.plan_models import PlanTemplate, InternetPlan
from internet_plans.serializers.template_serializers import (
    PlanTemplateSerializer,
    PlanTemplateCreateSerializer,
    PlanTemplateUpdateSerializer,
    TemplateToPlanSerializer
)
from internet_plans.services.plan_service import PlanService

logger = logging.getLogger(__name__)


class TemplatePagination(PageNumberPagination):
    """Template pagination class"""
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 50


class PlanTemplateListView(APIView):
    """
    List and create Plan Templates
    ORIGINAL LOGIC MAINTAINED with improvements
    """
    
    permission_classes = [IsAuthenticated]
    pagination_class = TemplatePagination
    throttle_classes = [UserRateThrottle]
    
    def get(self, request):
        """Get list of templates with filtering"""
        try:
            # Base queryset
            queryset = PlanTemplate.objects.filter(is_active=True)
            
            # Apply permissions
            if not request.user.is_staff:
                queryset = queryset.filter(is_public=True)
            
            # Apply filters
            queryset = self._apply_filters(queryset, request)
            
            # Apply sorting
            queryset = self._apply_sorting(queryset, request)
            
            # Paginate
            paginator = self.pagination_class()
            page = paginator.paginate_queryset(queryset, request)
            
            # Serialize
            serializer = PlanTemplateSerializer(page, many=True, context={'request': request})
            
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
        if not request.user.is_staff:
            return Response({
                'success': False,
                'error': 'Permission denied'
            }, status=status.HTTP_403_FORBIDDEN)
        
        try:
            serializer = PlanTemplateCreateSerializer(
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
            
            # Emit signal
            from internet_plans.signals.plan_signals import template_created
            template_created.send(
                sender=PlanTemplate,
                template_id=str(template.id),
                template_name=template.name,
                category=template.category,
                base_price=template.base_price,
                created_by=request.user.username,
                timestamp=template.created_at
            )
            
            logger.info(f"Template created: {template.name} by {request.user.username}")
            
            return Response({
                'success': True,
                'message': 'Template created successfully',
                'template': PlanTemplateSerializer(template, context={'request': request}).data
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
        if request.user.is_staff and (visibility := request.query_params.get('visibility')):
            if visibility == 'public':
                queryset = queryset.filter(is_public=True)
            elif visibility == 'private':
                queryset = queryset.filter(is_public=False)
        
        # Price range filter
        min_price = request.query_params.get('min_price')
        max_price = request.query_params.get('max_price')
        if min_price:
            try:
                queryset = queryset.filter(base_price__gte=float(min_price))
            except (ValueError, TypeError):
                pass
        if max_price:
            try:
                queryset = queryset.filter(base_price__lte=float(max_price))
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
    ORIGINAL LOGIC MAINTAINED with improvements
    """
    
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    
    def get(self, request, template_id):
        """Get template details"""
        try:
            # Get template with caching
            template = PlanTemplate.get_cached_template(template_id)
            
            if not template:
                return Response({
                    'success': False,
                    'error': 'Template not found'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Check permissions
            if not template.is_public and template.created_by != request.user:
                if not request.user.is_staff:
                    return Response({
                        'success': False,
                        'error': 'Permission denied'
                    }, status=status.HTTP_403_FORBIDDEN)
            
            serializer = PlanTemplateSerializer(template, context={'request': request})
            
            # Add usage statistics
            created_plans = template.created_plans.filter(active=True).count()
            
            response_data = {
                'success': True,
                'template': serializer.data,
                'statistics': {
                    'usage_count': template.usage_count,
                    'created_plans': created_plans,
                    'created_plans_active': created_plans
                }
            }
            
            return Response(response_data)
            
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
            
            serializer = PlanTemplateUpdateSerializer(
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
            
            # Emit signal
            from internet_plans.signals.plan_signals import template_updated
            template_updated.send(
                sender=PlanTemplate,
                template_id=str(template_id),
                template_name=updated_template.name,
                updated_by=request.user.username,
                timestamp=timezone.now()
            )
            
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
            
            # Check if template is used by active plans
            active_plans = template.created_plans.filter(active=True).count()
            if active_plans > 0:
                return Response({
                    'success': False,
                    'error': f'Cannot delete template used by {active_plans} active plans'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Soft delete
            template.is_active = False
            template.save()
            
            # Clear cache
            cache.delete(f"plan_template:{template_id}")
            cache.delete_pattern("plan_templates:*")
            
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


class PlanTemplateCreateView(APIView):
    """
    Simplified view for template creation
    NEW: For specific use cases
    """
    
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    
    def post(self, request):
        """Create template with minimal parameters"""
        if not request.user.is_staff:
            return Response({
                'success': False,
                'error': 'Permission denied'
            }, status=status.HTTP_403_FORBIDDEN)
        
        try:
            # Required fields
            required_fields = ['name', 'category', 'base_price']
            for field in required_fields:
                if field not in request.data:
                    return Response({
                        'success': False,
                        'error': f'Missing required field: {field}'
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            serializer = PlanTemplateCreateSerializer(
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
            
            return Response({
                'success': True,
                'message': 'Template created successfully',
                'template_id': str(template.id),
                'template_name': template.name
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Failed to create template: {e}")
            return Response({
                'success': False,
                'error': 'Failed to create template',
                'details': str(e) if request.user.is_staff else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PlanTemplateUpdateView(APIView):
    """
    View for specific template updates
    NEW: For specific update operations
    """
    
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    
    def patch(self, request, template_id):
        """Update specific template fields"""
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
            
            # Allowed fields for patch
            allowed_fields = ['name', 'description', 'base_price', 'is_public', 'is_active']
            
            update_data = {
                k: v for k, v in request.data.items() 
                if k in allowed_fields
            }
            
            if not update_data:
                return Response({
                    'success': False,
                    'error': 'No valid fields to update'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            serializer = PlanTemplateUpdateSerializer(
                template,
                data=update_data,
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
            
            return Response({
                'success': True,
                'message': 'Template updated successfully',
                'updated_fields': list(update_data.keys())
            })
            
        except Exception as e:
            logger.error(f"Failed to update template {template_id}: {e}")
            return Response({
                'success': False,
                'error': 'Failed to update template'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PlanTemplateDeleteView(APIView):
    """
    View for template deletion (hard delete)
    Use with caution - only for admins
    """
    
    permission_classes = [IsAdminUser]
    throttle_classes = [UserRateThrottle]
    
    def delete(self, request, template_id):
        """Hard delete template (admin only)"""
        try:
            template = get_object_or_404(PlanTemplate, id=template_id)
            
            # Check if template is used by any plans
            plan_count = template.created_plans.count()
            if plan_count > 0:
                return Response({
                    'success': False,
                    'error': f'Cannot delete template used by {plan_count} plans'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Hard delete
            template_name = template.name
            template.delete()
            
            # Clear cache
            cache.delete_pattern("plan_templates:*")
            
            logger.warning(f"Template hard deleted: {template_id} by {request.user.username}")
            
            return Response({
                'success': True,
                'message': f'Template "{template_name}" deleted permanently'
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
    ORIGINAL LOGIC MAINTAINED with improvements
    """
    
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    
    def post(self, request, template_id):
        """Create plan from template"""
        try:
            # Get template
            template = PlanTemplate.get_cached_template(template_id)
            if not template:
                return Response({
                    'success': False,
                    'error': 'Template not found or inactive'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Check permissions
            if not template.is_public and template.created_by != request.user:
                if not request.user.is_staff:
                    return Response({
                        'success': False,
                        'error': 'You do not have permission to use this template'
                    }, status=status.HTTP_403_FORBIDDEN)
            
            # Use TemplateToPlanSerializer
            serializer = TemplateToPlanSerializer(
                data=request.data,
                context={'request': request}
            )
            
            if not serializer.is_valid():
                return Response({
                    'success': False,
                    'error': 'Validation failed',
                    'details': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Create plan
            plan = serializer.create_plan()
            
            # Set created_by
            plan.created_by = request.user
            plan.save(update_fields=['created_by'])
            
            # Emit signals
            from internet_plans.signals.plan_signals import plan_created
            plan_created.send(
                sender=InternetPlan,
                plan_id=str(plan.id),
                plan_name=plan.name,
                plan_type=plan.plan_type,
                price=plan.price,
                category=plan.category,
                access_methods=plan.get_enabled_access_methods(),
                created_by=request.user.username,
                timestamp=plan.created_at
            )
            
            logger.info(f"Plan created from template: {plan.name} by {request.user.username}")
            
            return Response({
                'success': True,
                'message': 'Plan created successfully from template',
                'plan': {
                    'id': str(plan.id),
                    'name': plan.name,
                    'category': plan.category,
                    'price': float(plan.price),
                    'plan_type': plan.plan_type,
                    'access_methods': plan.get_enabled_access_methods(),
                    'template_used': template.name
                }
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Failed to create plan from template {template_id}: {e}")
            return Response({
                'success': False,
                'error': 'Failed to create plan',
                'details': str(e) if request.user.is_staff else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)