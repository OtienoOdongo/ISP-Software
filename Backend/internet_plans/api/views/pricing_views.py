"""
Internet Plans - Pricing Views
API views for pricing and discount management
Production-ready pricing views with proper error handling and validation
"""

from datetime import datetime
from django.shortcuts import get_object_or_404
from django.db.models import Q, Count, Sum, F
from django.utils import timezone
from django.db import transaction
from django.core.cache import cache
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.pagination import PageNumberPagination
from rest_framework import status
from rest_framework.throttling import UserRateThrottle
from rest_framework.exceptions import ValidationError
import logging

from internet_plans.models.pricing_models import PriceMatrix, DiscountRule
from internet_plans.models.plan_models import InternetPlan
from internet_plans.serializers.pricing_serializers import (
    PriceMatrixSerializer,
    DiscountRuleSerializer,
    PriceCalculationSerializer,
    BulkPriceCalculationSerializer
)
from internet_plans.services.pricing_service import PricingService
from internet_plans.utils.formatters import format_discount_summary
from internet_plans.utils.validators import validate_date_format

logger = logging.getLogger(__name__)


class PricingPagination(PageNumberPagination):
    """Pricing pagination class"""
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 50
    
    def get_paginated_response(self, data):
        """Override to add pagination metadata"""
        return Response({
            'success': True,
            'pagination': {
                'count': self.page.paginator.count,
                'next': self.get_next_link(),
                'previous': self.get_previous_link(),
                'page_size': self.get_page_size(self.request)
            },
            'results': data
        })


class BasePricingView(APIView):
    """Base view for pricing-related operations with common functionality"""
    
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    
    def handle_exception(self, exc):
        """Handle exceptions consistently across all views"""
        logger.error(f"Error in {self.__class__.__name__}: {exc}")
        
        if isinstance(exc, ValidationError):
            return Response({
                'success': False,
                'error': 'Validation failed',
                'details': exc.detail
            }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({
            'success': False,
            'error': 'An unexpected error occurred',
            'details': str(exc) if self.request.user.is_staff else None
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def validate_staff_permission(self):
        """Validate user has staff permissions"""
        if not self.request.user.is_staff:
            raise PermissionError('Permission denied. Staff access required.')


class PriceMatrixListView(BasePricingView):
    """
    List and create Price Matrices
    """
    
    pagination_class = PricingPagination
    
    def get(self, request):
        """Get list of price matrices with filtering"""
        try:
            # Base queryset
            queryset = PriceMatrix.objects.all()
            
            # Apply filters
            queryset = self._apply_filters(queryset, request)
            
            # Apply sorting
            queryset = self._apply_sorting(queryset, request)
            
            # Paginate
            paginator = self.pagination_class()
            page = paginator.paginate_queryset(queryset, request)
            
            # Serialize
            serializer = PriceMatrixSerializer(
                page, 
                many=True, 
                context={'request': request}
            )
            
            return paginator.get_paginated_response(serializer.data)
            
        except Exception as e:
            return self.handle_exception(e)
    
    def post(self, request):
        """Create new price matrix"""
        try:
            self.validate_staff_permission()
            
            serializer = PriceMatrixSerializer(
                data=request.data,
                context={'request': request}
            )
            
            serializer.is_valid(raise_exception=True)
            
            with transaction.atomic():
                price_matrix = serializer.save()
            
            logger.info(f"Price matrix created: {price_matrix.name} by {request.user.username}")
            
            # Clear relevant cache
            cache.delete('pricing_matrices_active')
            cache.delete_pattern('pricing_stats:*')
            
            return Response({
                'success': True,
                'message': 'Price matrix created successfully',
                'data': PriceMatrixSerializer(price_matrix).data
            }, status=status.HTTP_201_CREATED)
            
        except PermissionError as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_403_FORBIDDEN)
        except Exception as e:
            return self.handle_exception(e)
    
    def _apply_filters(self, queryset, request):
        """Apply filters to queryset"""
        query_params = request.query_params
        
        # Active filter
        is_active = query_params.get('is_active')
        if is_active is not None:
            try:
                is_active_bool = is_active.lower() == 'true'
                queryset = queryset.filter(is_active=is_active_bool)
            except (ValueError, AttributeError):
                pass
        
        # Discount type filter
        discount_type = query_params.get('discount_type')
        if discount_type:
            queryset = queryset.filter(discount_type=discount_type)
        
        # Applies to filter
        applies_to = query_params.get('applies_to')
        if applies_to:
            queryset = queryset.filter(applies_to=applies_to)
        
        # Target plan filter
        target_plan_id = query_params.get('target_plan_id')
        if target_plan_id:
            try:
                queryset = queryset.filter(target_plan_id=int(target_plan_id))
            except (ValueError, TypeError):
                pass
        
        # Valid date filter - FIXED: Proper Q object usage
        valid_date = query_params.get('valid_date')
        if valid_date:
            try:
                date_obj = timezone.datetime.fromisoformat(valid_date)
                # Correct Q object usage - no positional arguments after keyword arguments
                queryset = queryset.filter(
                    Q(valid_from__lte=date_obj) &
                    (Q(valid_to__isnull=True) | Q(valid_to__gte=date_obj))
                )
            except (ValueError, TypeError):
                # Log but don't fail the request
                logger.debug(f"Invalid date format: {valid_date}")
        
        # Search filter
        search = query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(description__icontains=search)
            )
        
        return queryset.distinct()
    
    def _apply_sorting(self, queryset, request):
        """Apply sorting to queryset"""
        sort_by = request.query_params.get('sort_by', '-created_at')
        sort_order = request.query_params.get('sort_order')
        
        # Map user-friendly names to model fields
        sort_map = {
            'name': 'name',
            'discount_type': 'discount_type',
            'valid_from': 'valid_from',
            'usage_count': 'usage_count',
            'created': 'created_at',
            'updated': 'updated_at',
            'total_discount': 'total_discount_amount',
        }
        
        # Get the actual field name
        field = sort_map.get(sort_by, sort_by)
        
        # Handle sort order
        if sort_order:
            if sort_order.lower() == 'desc' and not field.startswith('-'):
                field = f'-{field}'
            elif sort_order.lower() == 'asc' and field.startswith('-'):
                field = field[1:]
        
        # Validate field exists on model
        valid_fields = [f.name for f in PriceMatrix._meta.get_fields()]
        if field.lstrip('-') not in valid_fields:
            field = '-created_at'
        
        return queryset.order_by(field)


class PriceMatrixDetailView(BasePricingView):
    """
    Retrieve, update, or delete a Price Matrix
    """
    
    def get(self, request, price_matrix_id):
        """Get price matrix details"""
        try:
            price_matrix = get_object_or_404(PriceMatrix, id=price_matrix_id)
            
            # Check if user has permission to view inactive matrices
            if not price_matrix.is_active and not request.user.is_staff:
                return Response({
                    'success': False,
                    'error': 'Price matrix not found or inactive'
                }, status=status.HTTP_404_NOT_FOUND)
            
            serializer = PriceMatrixSerializer(
                price_matrix, 
                context={'request': request}
            )
            
            # Add statistics
            discount_rules_count = price_matrix.discount_rules.filter(
                is_active=True
            ).count()
            
            average_discount = 0
            if price_matrix.usage_count > 0:
                average_discount = float(
                    price_matrix.total_discount_amount / price_matrix.usage_count
                )
            
            response_data = {
                'success': True,
                'data': {
                    **serializer.data,
                    'statistics': {
                        'usage_count': price_matrix.usage_count,
                        'total_discount': float(price_matrix.total_discount_amount),
                        'discount_rules': discount_rules_count,
                        'average_discount': average_discount
                    },
                    'summary': format_discount_summary(price_matrix)
                }
            }
            
            return Response(response_data)
            
        except Exception as e:
            return self.handle_exception(e)
    
    def put(self, request, price_matrix_id):
        """Update price matrix"""
        try:
            self.validate_staff_permission()
            
            price_matrix = get_object_or_404(PriceMatrix, id=price_matrix_id)
            
            serializer = PriceMatrixSerializer(
                price_matrix, 
                data=request.data, 
                partial=True,
                context={'request': request}
            )
            
            serializer.is_valid(raise_exception=True)
            
            with transaction.atomic():
                updated_price_matrix = serializer.save()
            
            logger.info(f"Price matrix updated: {price_matrix_id} by {request.user.username}")
            
            # Clear cache
            cache.delete(f'price_matrix_{price_matrix_id}')
            cache.delete_pattern('pricing_stats:*')
            
            return Response({
                'success': True,
                'message': 'Price matrix updated successfully',
                'data': PriceMatrixSerializer(updated_price_matrix).data
            })
            
        except PermissionError as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_403_FORBIDDEN)
        except Exception as e:
            return self.handle_exception(e)
    
    def delete(self, request, price_matrix_id):
        """Delete price matrix (soft delete)"""
        try:
            self.validate_staff_permission()
            
            price_matrix = get_object_or_404(PriceMatrix, id=price_matrix_id)
            
            # Check if used by active discount rules
            active_rules = price_matrix.discount_rules.filter(is_active=True)
            if active_rules.exists():
                return Response({
                    'success': False,
                    'error': f'Cannot delete price matrix used by {active_rules.count()} active discount rules',
                    'active_rules': list(active_rules.values_list('id', flat=True))
                }, status=status.HTTP_400_BAD_REQUEST)
            
            with transaction.atomic():
                # Soft delete
                price_matrix.is_active = False
                price_matrix.save()
                
                # Also deactivate associated discount rules
                price_matrix.discount_rules.update(is_active=False)
            
            # Clear cache
            cache.delete(f'price_matrix_{price_matrix_id}')
            cache.delete_pattern('pricing:*')
            cache.delete_pattern('pricing_stats:*')
            
            logger.info(f"Price matrix deleted: {price_matrix_id} by {request.user.username}")
            
            return Response({
                'success': True,
                'message': 'Price matrix deleted successfully'
            })
            
        except PermissionError as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_403_FORBIDDEN)
        except Exception as e:
            return self.handle_exception(e)


class DiscountRuleListView(BasePricingView):
    """
    List and create Discount Rules
    """
    
    pagination_class = PricingPagination
    
    def get(self, request):
        """Get list of discount rules with filtering"""
        try:
            # Base queryset with prefetching for performance
            queryset = DiscountRule.objects.select_related(
                'price_matrix'
            ).prefetch_related(
                'price_matrix__discount_rules'
            )
            
            # Apply filters
            queryset = self._apply_filters(queryset, request)
            
            # Apply sorting
            queryset = self._apply_sorting(queryset, request)
            
            # Paginate
            paginator = self.pagination_class()
            page = paginator.paginate_queryset(queryset, request)
            
            # Serialize
            serializer = DiscountRuleSerializer(
                page, 
                many=True, 
                context={'request': request}
            )
            
            return paginator.get_paginated_response(serializer.data)
            
        except Exception as e:
            return self.handle_exception(e)
    
    def post(self, request):
        """Create new discount rule"""
        try:
            self.validate_staff_permission()
            
            serializer = DiscountRuleSerializer(
                data=request.data,
                context={'request': request}
            )
            
            serializer.is_valid(raise_exception=True)
            
            with transaction.atomic():
                discount_rule = serializer.save()
            
            logger.info(f"Discount rule created: {discount_rule.name} by {request.user.username}")
            
            # Clear cache
            cache.delete_pattern('discount_rules:*')
            cache.delete_pattern('pricing_stats:*')
            
            return Response({
                'success': True,
                'message': 'Discount rule created successfully',
                'data': DiscountRuleSerializer(discount_rule).data
            }, status=status.HTTP_201_CREATED)
            
        except PermissionError as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_403_FORBIDDEN)
        except Exception as e:
            return self.handle_exception(e)
    
    def _apply_filters(self, queryset, request):
        """Apply filters to queryset"""
        query_params = request.query_params
        
        # Active filter
        is_active = query_params.get('is_active')
        if is_active is not None:
            try:
                is_active_bool = is_active.lower() == 'true'
                queryset = queryset.filter(is_active=is_active_bool)
            except (ValueError, AttributeError):
                pass
        
        # Rule type filter
        rule_type = query_params.get('rule_type')
        if rule_type:
            queryset = queryset.filter(rule_type=rule_type)
        
        # Price matrix filter
        price_matrix_id = query_params.get('price_matrix_id')
        if price_matrix_id:
            try:
                queryset = queryset.filter(price_matrix_id=int(price_matrix_id))
            except (ValueError, TypeError):
                pass
        
        # Valid date filter
        valid_date = query_params.get('valid_date')
        if valid_date:
            try:
                date_obj = timezone.datetime.fromisoformat(valid_date)
                queryset = queryset.filter(
                    Q(valid_from__lte=date_obj) &
                    (Q(valid_to__isnull=True) | Q(valid_to__gte=date_obj))
                )
            except (ValueError, TypeError):
                logger.debug(f"Invalid date format: {valid_date}")
        
        # Search filter
        search = query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(description__icontains=search) |
                Q(code__icontains=search)
            )
        
        return queryset.distinct()
    
    def _apply_sorting(self, queryset, request):
        """Apply sorting to queryset"""
        sort_by = request.query_params.get('sort_by', '-priority')
        sort_order = request.query_params.get('sort_order')
        
        sort_map = {
            'name': 'name',
            'rule_type': 'rule_type',
            'priority': 'priority',
            'current_usage': 'current_usage',
            'created': 'created_at',
            'updated': 'updated_at',
            'valid_from': 'valid_from',
        }
        
        field = sort_map.get(sort_by, sort_by)
        
        if sort_order:
            if sort_order.lower() == 'desc' and not field.startswith('-'):
                field = f'-{field}'
            elif sort_order.lower() == 'asc' and field.startswith('-'):
                field = field[1:]
        
        # Validate field exists
        valid_fields = [f.name for f in DiscountRule._meta.get_fields()]
        if field.lstrip('-') not in valid_fields:
            field = '-priority'
        
        return queryset.order_by(field)


class DiscountRuleDetailView(BasePricingView):
    """
    Retrieve, update, or delete a Discount Rule
    """
    
    def get(self, request, discount_rule_id):
        """Get discount rule details"""
        try:
            discount_rule = get_object_or_404(DiscountRule, id=discount_rule_id)
            
            # Check if user has permission to view inactive rules
            if not discount_rule.is_active and not request.user.is_staff:
                return Response({
                    'success': False,
                    'error': 'Discount rule not found or inactive'
                }, status=status.HTTP_404_NOT_FOUND)
            
            serializer = DiscountRuleSerializer(
                discount_rule, 
                context={'request': request}
            )
            
            # Add additional data
            price_matrix_summary = format_discount_summary(discount_rule.price_matrix)
            
            response_data = {
                'success': True,
                'data': {
                    **serializer.data,
                    'price_matrix_summary': price_matrix_summary,
                    'eligibility_criteria': discount_rule.eligibility_criteria,
                    'is_applicable': discount_rule.is_applicable()
                }
            }
            
            return Response(response_data)
            
        except Exception as e:
            return self.handle_exception(e)
    
    def put(self, request, discount_rule_id):
        """Update discount rule"""
        try:
            self.validate_staff_permission()
            
            discount_rule = get_object_or_404(DiscountRule, id=discount_rule_id)
            
            serializer = DiscountRuleSerializer(
                discount_rule, 
                data=request.data, 
                partial=True,
                context={'request': request}
            )
            
            serializer.is_valid(raise_exception=True)
            
            with transaction.atomic():
                updated_discount_rule = serializer.save()
            
            logger.info(f"Discount rule updated: {discount_rule_id} by {request.user.username}")
            
            # Clear cache
            cache.delete(f'discount_rule_{discount_rule_id}')
            cache.delete_pattern('pricing:*')
            cache.delete_pattern('pricing_stats:*')
            
            return Response({
                'success': True,
                'message': 'Discount rule updated successfully',
                'data': DiscountRuleSerializer(updated_discount_rule).data
            })
            
        except PermissionError as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_403_FORBIDDEN)
        except Exception as e:
            return self.handle_exception(e)
    
    def delete(self, request, discount_rule_id):
        """Delete discount rule (soft delete)"""
        try:
            self.validate_staff_permission()
            
            discount_rule = get_object_or_404(DiscountRule, id=discount_rule_id)
            
            with transaction.atomic():
                # Soft delete
                discount_rule.is_active = False
                discount_rule.save()
            
            # Clear cache
            cache.delete(f'discount_rule_{discount_rule_id}')
            cache.delete_pattern('pricing:*')
            cache.delete_pattern('pricing_stats:*')
            
            logger.info(f"Discount rule deleted: {discount_rule_id} by {request.user.username}")
            
            return Response({
                'success': True,
                'message': 'Discount rule deleted successfully'
            })
            
        except PermissionError as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_403_FORBIDDEN)
        except Exception as e:
            return self.handle_exception(e)


class PriceCalculationView(BasePricingView):
    """
    Calculate price for a plan
    """
    
    def post(self, request):
        """Calculate price"""
        try:
            serializer = PriceCalculationSerializer(
                data=request.data,
                context={'request': request}
            )
            
            serializer.is_valid(raise_exception=True)
            
            result = serializer.calculate_price()
            
            if not result or 'error' in result:
                return Response({
                    'success': False,
                    'error': result.get('error', 'Failed to calculate price')
                }, status=status.HTTP_400_BAD_REQUEST)
            
            return Response({
                'success': True,
                'data': result
            })
            
        except Exception as e:
            return self.handle_exception(e)


class BulkPriceCalculationView(BasePricingView):
    """
    Calculate prices in bulk
    """
    
    def post(self, request):
        """Calculate prices in bulk"""
        try:
            serializer = BulkPriceCalculationSerializer(
                data=request.data,
                context={'request': request}
            )
            
            serializer.is_valid(raise_exception=True)
            
            results = serializer.calculate_prices()
            
            # Calculate summary
            total = len(results)
            successful = sum(1 for r in results if r.get('success', False))
            failed = total - successful
            
            summary = {
                'total': total,
                'successful': successful,
                'failed': failed,
                'success_rate': (successful / total * 100) if total > 0 else 0
            }
            
            return Response({
                'success': True,
                'data': {
                    'results': results,
                    'summary': summary
                }
            })
            
        except Exception as e:
            return self.handle_exception(e)


class PricingStatisticsView(BasePricingView):
    """
    Get pricing statistics
    """
    
    def get(self, request):
        """Get pricing statistics"""
        try:
            # Try to get from cache first
            cache_key = f'pricing_stats:{request.user.id}'
            stats = cache.get(cache_key)
            
            if stats is None:
                stats = PricingService.get_pricing_statistics()
                
                # Cache for 5 minutes
                cache.set(cache_key, stats, 300)
            
            if 'error' in stats:
                return Response({
                    'success': False,
                    'error': stats['error']
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            return Response({
                'success': True,
                'data': stats,
                'timestamp': timezone.now().isoformat()
            })
            
        except Exception as e:
            return self.handle_exception(e)


class PriceMatrixExportView(BasePricingView):
    """
    Export price matrices to various formats
    """
    
    def get(self, request):
        """Export price matrices"""
        try:
            self.validate_staff_permission()
            
            format_type = request.query_params.get('format', 'json')
            queryset = PriceMatrix.objects.filter(is_active=True)
            
            if format_type == 'csv':
                # CSV export logic here
                pass
            elif format_type == 'excel':
                # Excel export logic here
                pass
            else:
                # Default to JSON
                serializer = PriceMatrixSerializer(
                    queryset, 
                    many=True, 
                    context={'request': request}
                )
                
                return Response({
                    'success': True,
                    'data': serializer.data,
                    'exported_at': timezone.now().isoformat(),
                    'count': queryset.count()
                })
            
        except PermissionError as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_403_FORBIDDEN)
        except Exception as e:
            return self.handle_exception(e)