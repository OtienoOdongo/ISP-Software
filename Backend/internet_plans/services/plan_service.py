"""
Internet Plans - Plan Service with Time Variant Support
Core business logic for plan management with time-based availability
Production-ready with caching and algorithms
"""

import logging
from typing import Dict, List, Optional, Any, Union
from django.core.cache import cache
from django.db import transaction
from django.db.models import Q, Count, Sum, Avg, F, ExpressionWrapper, DecimalField
from django.utils import timezone
from decimal import Decimal
import json
import hashlib

# Import your models
from internet_plans.models.plan_models import PlanTemplate, InternetPlan, TimeVariantConfig

logger = logging.getLogger(__name__)


class PlanService:
    """
    Service for plan management operations with time variant support
    Uses caching and efficient algorithms
    """
    
    # Cache configuration
    CACHE_TIMEOUT = 300  # 5 minutes
    BATCH_SIZE = 100
    
    @classmethod
    def warmup_caches(cls) -> None:
        """Warm up plan caches on startup - UPDATED with time variant"""
        try:
            logger.info("Warming up plan caches...")
            
            # Cache popular plans with time variant
            popular_plans = InternetPlan.objects.filter(
                active=True,
                purchases__gt=0
            ).select_related('time_variant').order_by('-purchases')[:20]
            
            for plan in popular_plans:
                cache_key = f"internet_plan:{plan.id}"
                cache.set(cache_key, plan, cls.CACHE_TIMEOUT)
            
            # Cache templates with time variant
            active_templates = PlanTemplate.objects.filter(is_active=True).select_related('time_variant')[:10]
            for template in active_templates:
                cache_key = f"plan_template:{template.id}"
                cache.set(cache_key, template, cls.CACHE_TIMEOUT)
            
            # Cache time variant configurations
            active_time_variants = TimeVariantConfig.objects.filter(is_active=True)[:20]
            for tv in active_time_variants:
                cache_key = f"time_variant:{tv.id}"
                cache.set(cache_key, tv, cls.CACHE_TIMEOUT)
            
            logger.info(
                f"Plan caches warmed up: {len(popular_plans)} plans, "
                f"{len(active_templates)} templates, {len(active_time_variants)} time variants"
            )
            
        except Exception as e:
            logger.error(f"Failed to warm up caches: {e}", exc_info=True)
    
    @classmethod
    def get_plan_with_cache(cls, plan_id: Union[str, int], force_refresh: bool = False) -> Optional[InternetPlan]:
        """
        Get plan with caching
        Uses LRU-like caching strategy - UPDATED with time variant
        """
        cache_key = f"internet_plan:{plan_id}"
        
        if not force_refresh:
            plan = cache.get(cache_key)
            if plan is not None:
                return plan
        
        try:
            plan = InternetPlan.objects.select_related('time_variant').get(id=plan_id, active=True)
            cache.set(cache_key, plan, cls.CACHE_TIMEOUT)
            return plan
        except InternetPlan.DoesNotExist:
            cache.set(cache_key, None, 60)  # Cache negative result for 1 minute
            return None
    
    @classmethod
    def get_plans_by_filters(cls, filters: Dict[str, Any], page: int = 1, page_size: int = 20) -> Dict[str, Any]:
        """
        Get plans with filtering and pagination
        Uses efficient database queries - UPDATED with time variant filters
        """
        # Create a hashable representation of filters
        filters_str = json.dumps(filters, sort_keys=True)
        filters_hash = hashlib.md5(filters_str.encode()).hexdigest()
        cache_key = f"plans_filtered:{filters_hash}:{page}:{page_size}"
        cached_result = cache.get(cache_key)
        
        if cached_result:
            return cached_result
        
        # Build query
        queryset = InternetPlan.objects.filter(active=True).select_related('time_variant')
        
        # Apply filters
        category = filters.get('category')
        if category:
            queryset = queryset.filter(category=category)
        
        plan_type = filters.get('plan_type')
        if plan_type:
            queryset = queryset.filter(plan_type=plan_type)
        
        access_method = filters.get('access_method')
        if access_method:
            if access_method == 'hotspot':
                queryset = queryset.filter(access_methods__hotspot__enabled=True)
            elif access_method == 'pppoe':
                queryset = queryset.filter(access_methods__pppoe__enabled=True)
        
        # Client type restriction filter
        client_type_restriction = filters.get('client_type_restriction')
        if client_type_restriction:
            queryset = queryset.filter(client_type_restriction=client_type_restriction)
        
        # Time variant filter - FIXED: Proper parentheses placement
        has_time_variant = filters.get('has_time_variant')
        if has_time_variant is not None:
            if has_time_variant:
                queryset = queryset.filter(time_variant__is_active=True)
            else:
                queryset = queryset.filter(
                    Q(time_variant__isnull=True) | Q(time_variant__is_active=False)
                )
        
        # Availability filter
        if filters.get('available_now'):
            # Filter plans that are available now
            available_plan_ids = []
            all_plans = list(queryset)
            
            for plan in all_plans:
                # Check if plan has is_available_for_client method
                if hasattr(plan, 'is_available_for_client'):
                    availability = plan.is_available_for_client()
                    if availability.get('available'):
                        available_plan_ids.append(plan.id)
                else:
                    # Fallback: if method doesn't exist, assume available
                    available_plan_ids.append(plan.id)
            
            queryset = queryset.filter(id__in=available_plan_ids)
        
        # Price range
        min_price = filters.get('min_price')
        max_price = filters.get('max_price')
        if min_price is not None:
            queryset = queryset.filter(price__gte=Decimal(str(min_price)))
        if max_price is not None:
            queryset = queryset.filter(price__lte=Decimal(str(max_price)))
        
        # Search
        search = filters.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(description__icontains=search)
            )
        
        # Sorting
        sort_by = filters.get('sort_by', 'name')
        sort_order = filters.get('sort_order', 'asc')
        
        sort_map = {
            'name': 'name',
            'price': 'price',
            'popularity': 'purchases',
            'priority': 'priority_level',
            'created': 'created_at',
            'availability': 'time_variant__is_active',
        }
        
        field = sort_map.get(sort_by, sort_by)
        if field not in ['name', 'price', 'purchases', 'priority_level', 'created_at', 'time_variant__is_active']:
            field = 'name'  # Default fallback
        
        if sort_order == 'desc':
            field = f'-{field}'
        
        queryset = queryset.order_by(field)
        
        # Pagination
        total_count = queryset.count()
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size
        
        plans = list(queryset[start_idx:end_idx])
        
        result = {
            'plans': plans,
            'total_count': total_count,
            'page': page,
            'page_size': page_size,
            'total_pages': (total_count + page_size - 1) // page_size if page_size > 0 else 0
        }
        
        cache.set(cache_key, result, cls.CACHE_TIMEOUT)
        return result
    
    @classmethod
    def create_plan_from_template(cls, template_id: Union[str, int], plan_data: Dict[str, Any], created_by: Optional[str] = None) -> InternetPlan:
        """
        Create plan from template with validation
        ORIGINAL LOGIC MAINTAINED with time variant support
        """
        with transaction.atomic():
            # Get template with time variant
            try:
                template = PlanTemplate.objects.select_related('time_variant').get(id=template_id)
            except PlanTemplate.DoesNotExist:
                raise ValueError(f"Template not found: {template_id}")
            
            # Check permissions
            if not template.is_public and template.created_by != created_by:
                raise PermissionError("You don't have permission to use this template")
            
            # Create plan
            plan = InternetPlan()
            plan.name = plan_data.get('name', f"{template.name} Plan")
            plan.category = plan_data.get('category', template.category)
            plan.price = Decimal(str(plan_data.get('price', template.base_price)))
            plan.description = plan_data.get('description', template.description)
            
            # Handle access_methods
            access_methods = plan_data.get('access_methods')
            if access_methods is not None:
                plan.access_methods = access_methods
            elif hasattr(template, 'access_methods'):
                plan.access_methods = template.access_methods.copy() if template.access_methods else {}
            else:
                plan.access_methods = {}
            
            plan.template = template
            
            # Copy time variant from template if exists
            if template.time_variant:
                # Create a copy of time variant
                time_variant_copy = TimeVariantConfig.objects.create(
                    is_active=template.time_variant.is_active,
                    start_time=template.time_variant.start_time,
                    end_time=template.time_variant.end_time,
                    available_days=template.time_variant.available_days.copy() if template.time_variant.available_days else [],
                    schedule_active=template.time_variant.schedule_active,
                    schedule_start_date=template.time_variant.schedule_start_date,
                    schedule_end_date=template.time_variant.schedule_end_date,
                    duration_active=template.time_variant.duration_active,
                    duration_value=template.time_variant.duration_value,
                    duration_unit=template.time_variant.duration_unit,
                    duration_start_date=template.time_variant.duration_start_date,
                    exclusion_dates=template.time_variant.exclusion_dates.copy() if template.time_variant.exclusion_dates else [],
                    timezone=template.time_variant.timezone,
                    force_available=template.time_variant.force_available
                )
                plan.time_variant = time_variant_copy
            
            # Set client type restriction
            if 'client_type_restriction' in plan_data:
                plan.client_type_restriction = plan_data['client_type_restriction']
            elif hasattr(template, 'client_type_restriction'):
                plan.client_type_restriction = template.client_type_restriction
            else:
                plan.client_type_restriction = 'any'
            
            # Set plan type based on price
            plan.plan_type = 'free_trial' if plan.price == 0 else 'paid'
            
            # Additional configuration
            if 'priority_level' in plan_data:
                plan.priority_level = plan_data['priority_level']
            elif hasattr(template, 'priority_level'):
                plan.priority_level = template.priority_level
            else:
                plan.priority_level = 5
            
            if 'router_specific' in plan_data:
                plan.router_specific = plan_data['router_specific']
            
            if 'FUP_policy' in plan_data:
                plan.FUP_policy = plan_data['FUP_policy']
            
            if 'FUP_threshold' in plan_data:
                plan.FUP_threshold = plan_data['FUP_threshold']
            
            plan.active = True
            plan.save()
            
            # Increment template usage if method exists
            if hasattr(template, 'increment_usage'):
                template.increment_usage()
            
            # Clear caches
            cache.delete_pattern("internet_plan:*")
            cache.delete_pattern("plans_filtered:*")
            cache.delete_pattern("available_plans:*")
            
            logger.info(f"Plan created from template: {plan.id} by {created_by}")
            
            return plan
    
    @classmethod
    def update_plan_purchases(cls, plan_id: Union[str, int], increment: int = 1) -> Optional[int]:
        """
        Update plan purchase count atomically
        ORIGINAL LOGIC MAINTAINED with caching
        """
        with transaction.atomic():
            try:
                plan = InternetPlan.objects.select_for_update().get(id=plan_id)
                plan.purchases = F('purchases') + increment
                plan.save(update_fields=['purchases', 'updated_at'])
                
                # Refresh from database to get updated value
                plan.refresh_from_db()
                
                # Update cache
                cache_key = f"internet_plan:{plan_id}"
                cached_plan = cache.get(cache_key)
                if cached_plan:
                    cached_plan.purchases = plan.purchases
                    cache.set(cache_key, cached_plan, cls.CACHE_TIMEOUT)
                
                return plan.purchases
            except InternetPlan.DoesNotExist:
                logger.error(f"Plan not found for purchase update: {plan_id}")
                return None
    
    @classmethod
    def check_plan_compatibility(cls, plan_id: Union[str, int], access_method: str, 
                                router_id: Optional[str] = None, client_type: str = 'hotspot') -> Dict[str, Any]:
        """
        Check plan compatibility for access method and router
        UPDATED: Added client type and time availability checking
        """
        plan = cls.get_plan_with_cache(plan_id)
        if not plan:
            return {
                'compatible': False,
                'error': 'Plan not found'
            }
        
        # Check access method support
        if not hasattr(plan, 'supports_access_method'):
            return {
                'compatible': False,
                'error': 'Plan does not have access method support check'
            }
        
        if not plan.supports_access_method(access_method):
            return {
                'compatible': False,
                'error': f'Plan does not support {access_method} access method'
            }
        
        # Check client type restriction
        if plan.client_type_restriction != 'any' and plan.client_type_restriction != client_type:
            return {
                'compatible': False,
                'error': f'Plan is restricted to {plan.client_type_restriction} clients only'
            }
        
        # Check router compatibility if router-specific
        if hasattr(plan, 'router_specific') and plan.router_specific and router_id:
            if not hasattr(plan, 'can_be_used_on_router'):
                return {
                    'compatible': False,
                    'error': 'Router compatibility check not available'
                }
            
            if not plan.can_be_used_on_router(router_id):
                return {
                    'compatible': False,
                    'error': 'Plan cannot be used on specified router'
                }
        
        # Check time availability
        if not hasattr(plan, 'is_available_for_client'):
            # If method doesn't exist, assume available
            availability = {'available': True, 'reason': 'No availability check configured'}
        else:
            availability = plan.is_available_for_client(client_type)
        
        if not availability.get('available', True):
            return {
                'compatible': False,
                'error': availability.get('reason', 'Plan not available'),
                'code': availability.get('code'),
                'next_available': availability.get('next_available')
            }
        
        # Get technical configuration
        config = {}
        if hasattr(plan, 'get_config_for_method'):
            config = plan.get_config_for_method(access_method) or {}
        
        return {
            'compatible': True,
            'plan_name': plan.name,
            'plan_type': plan.plan_type,
            'access_method': access_method,
            'client_type': client_type,
            'availability': availability,
            'technical_config': {
                'download_speed': config.get('downloadSpeed', {}).get('value', '10'),
                'upload_speed': config.get('uploadSpeed', {}).get('value', '5'),
                'data_limit': config.get('dataLimit', {}).get('value', '10'),
                'usage_limit': config.get('usageLimit', {}).get('value', '24'),
                'max_devices': config.get('maxDevices', 1)
            }
        }
    
    @classmethod
    def get_plan_statistics(cls) -> Dict[str, Any]:
        """
        Get comprehensive plan statistics
        Uses efficient aggregation - UPDATED with time variant stats
        """
        cache_key = "plan_statistics"
        cached_stats = cache.get(cache_key)
        
        if cached_stats:
            return cached_stats
        
        try:
            # Get active plans count by category
            category_stats = InternetPlan.objects.filter(active=True).values(
                'category'
            ).annotate(
                count=Count('id'),
                total_purchases=Sum('purchases'),
                avg_price=Avg('price')
            ).order_by('-count')
            
            # Get plans by access type
            hotspot_plans = InternetPlan.objects.filter(
                active=True,
                access_methods__hotspot__enabled=True
            ).count()
            
            pppoe_plans = InternetPlan.objects.filter(
                active=True,
                access_methods__pppoe__enabled=True
            ).count()
            
            # FIXED: Use proper Q object syntax
            dual_plans_q = Q(access_methods__hotspot__enabled=True) & Q(access_methods__pppoe__enabled=True)
            dual_plans = InternetPlan.objects.filter(
                active=True
            ).filter(dual_plans_q).count()
            
            # Get plans by client type restriction
            client_type_stats = InternetPlan.objects.filter(active=True).values(
                'client_type_restriction'
            ).annotate(
                count=Count('id')
            )
            
            # Get time variant statistics - FIXED: Proper parentheses placement
            with_time_variant = InternetPlan.objects.filter(
                active=True,
                time_variant__is_active=True
            ).count()
            
            without_time_variant = InternetPlan.objects.filter(
                active=True
            ).filter(
                Q(time_variant__isnull=True) | Q(time_variant__is_active=False)
            ).count()
            
            time_variant_stats = {
                'with_time_variant': with_time_variant,
                'without_time_variant': without_time_variant,
                'currently_available': cls._get_currently_available_count()
            }
            
            # Get top selling plans
            top_plans = InternetPlan.objects.filter(
                active=True,
                purchases__gt=0
            ).order_by('-purchases')[:10].values(
                'id', 'name', 'purchases', 'price', 'category', 'client_type_restriction'
            )
            
            # Get revenue estimates with proper calculation
            revenue_stats = InternetPlan.objects.filter(
                active=True,
                purchases__gt=0
            ).annotate(
                total_revenue=F('purchases') * F('price')
            ).aggregate(
                total_revenue_sum=Sum('total_revenue'),
                total_purchases=Sum('purchases'),
                avg_plan_price=Avg('price')
            )
            
            stats = {
                'category_distribution': list(category_stats),
                'access_type_distribution': {
                    'hotspot': hotspot_plans,
                    'pppoe': pppoe_plans,
                    'dual': dual_plans
                },
                'client_type_distribution': list(client_type_stats),
                'time_variant_distribution': time_variant_stats,
                'top_selling_plans': list(top_plans),
                'revenue_estimates': {
                    'total_revenue': float(revenue_stats['total_revenue_sum'] or 0),
                    'total_purchases': revenue_stats['total_purchases'] or 0,
                    'avg_plan_price': float(revenue_stats['avg_plan_price'] or 0)
                },
                'timestamp': timezone.now().isoformat()
            }
            
            cache.set(cache_key, stats, 600)  # Cache for 10 minutes
            return stats
            
        except Exception as e:
            logger.error(f"Failed to get plan statistics: {e}", exc_info=True)
            return {
                'error': 'Failed to get statistics',
                'timestamp': timezone.now().isoformat()
            }
    
    @classmethod
    def _get_currently_available_count(cls) -> int:
        """Get count of plans currently available"""
        now = timezone.now()
        
        # Get all active plans with time variant
        plans_with_time_variant = InternetPlan.objects.filter(
            active=True,
            time_variant__is_active=True
        ).select_related('time_variant')
        
        available_count = 0
        for plan in plans_with_time_variant:
            time_variant = plan.time_variant
            if time_variant and hasattr(time_variant, 'is_available_now'):
                if time_variant.is_available_now():
                    available_count += 1
        
        return available_count
    
    @classmethod
    def search_plans(cls, query: str, limit: int = 20, client_type: str = 'hotspot', available_only: bool = True) -> List[InternetPlan]:
        """
        Search plans with efficient full-text search
        Uses database indexes and caching - UPDATED with availability filtering
        """
        cache_key = f"plan_search:{query}:{limit}:{client_type}:{available_only}"
        cached_results = cache.get(cache_key)
        
        if cached_results:
            return cached_results
        
        # Build search query
        search_terms = query.lower().split()
        
        # Use Q objects for efficient searching
        q_objects = Q()
        for term in search_terms:
            if len(term) >= 3:  # Only search for terms with 3+ characters
                q_objects |= Q(name__icontains=term)
                q_objects |= Q(description__icontains=term)
                q_objects |= Q(category__icontains=term)
        
        if not q_objects:
            return []
        
        # Build base query
        queryset = InternetPlan.objects.filter(
            q_objects,
            active=True
        ).select_related('time_variant')
        
        # Filter by client type
        if client_type == 'hotspot':
            queryset = queryset.filter(
                Q(client_type_restriction='any') | 
                Q(client_type_restriction='hotspot')
            ).filter(access_methods__hotspot__enabled=True)
        elif client_type == 'pppoe':
            queryset = queryset.filter(
                Q(client_type_restriction='any') | 
                Q(client_type_restriction='pppoe')
            ).filter(access_methods__pppoe__enabled=True)
        
        # Execute query
        results = list(queryset.order_by('-priority_level', 'name')[:limit])
        
        # Filter by availability if requested
        if available_only:
            available_results = []
            for plan in results:
                if hasattr(plan, 'is_available_for_client'):
                    availability = plan.is_available_for_client(client_type)
                    if availability.get('available'):
                        plan.availability_info = availability
                        available_results.append(plan)
                else:
                    # If no availability check method, include plan
                    available_results.append(plan)
            results = available_results
        
        cache.set(cache_key, results, 300)  # Cache for 5 minutes
        return results
    
    @classmethod
    def bulk_update_plans(cls, plan_updates: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Bulk update plans efficiently
        Uses batch processing and caching - UPDATED with time variant cache clearing
        """
        updated_plans = []
        errors = []
        
        with transaction.atomic():
            for update in plan_updates:
                plan_id = update.get('plan_id')
                updates = update.get('updates', {})
                
                if not plan_id:
                    errors.append("Missing plan_id in update")
                    continue
                
                try:
                    plan = InternetPlan.objects.select_related('time_variant').get(id=plan_id)
                    
                    # Apply updates
                    for field, value in updates.items():
                        if hasattr(plan, field):
                            setattr(plan, field, value)
                        else:
                            errors.append(f"Invalid field '{field}' for plan {plan_id}")
                            continue
                    
                    plan.save()
                    updated_plans.append(str(plan_id))
                    
                    # Clear individual plan cache
                    cache.delete(f"internet_plan:{plan_id}")
                    
                except InternetPlan.DoesNotExist:
                    errors.append(f"Plan not found: {plan_id}")
                except Exception as e:
                    errors.append(f"Failed to update plan {plan_id}: {str(e)}")
        
        # Clear filtered plan caches
        cache.delete_pattern("plans_filtered:*")
        cache.delete_pattern("plan_search:*")
        cache.delete_pattern("available_plans:*")
        
        return {
            'updated': updated_plans,
            'errors': errors,
            'total_updated': len(updated_plans),
            'total_errors': len(errors)
        }
    
    @classmethod
    def get_recommended_plans(cls, client_type: Optional[str] = None, budget: Optional[float] = None,
                             access_method: Optional[str] = None, limit: int = 5) -> List[Dict[str, Any]]:
        """
        Get recommended plans based on criteria
        Uses recommendation algorithm - UPDATED with availability consideration
        """
        cache_key = f"recommended_plans:{client_type}:{budget}:{access_method}:{limit}"
        cached_recommendations = cache.get(cache_key)
        
        if cached_recommendations:
            return cached_recommendations
        
        # Build recommendation query
        queryset = InternetPlan.objects.filter(active=True).select_related('time_variant')
        
        # Filter by client type if specified
        if client_type:
            if client_type == 'hotspot':
                queryset = queryset.filter(
                    Q(client_type_restriction='any') | 
                    Q(client_type_restriction='hotspot')
                ).filter(access_methods__hotspot__enabled=True)
            elif client_type == 'pppoe':
                queryset = queryset.filter(
                    Q(client_type_restriction='any') | 
                    Q(client_type_restriction='pppoe')
                ).filter(access_methods__pppoe__enabled=True)
        
        # Filter by access method if specified
        if access_method:
            if access_method == 'hotspot':
                queryset = queryset.filter(access_methods__hotspot__enabled=True)
            elif access_method == 'pppoe':
                queryset = queryset.filter(access_methods__pppoe__enabled=True)
        
        # Filter by budget if specified
        if budget is not None:
            queryset = queryset.filter(price__lte=Decimal(str(budget)))
        
        # Get plans and calculate scores
        plans = list(queryset)
        
        if not plans:
            return []
        
        # Calculate price ranks
        sorted_by_price = sorted(plans, key=lambda p: p.price)
        price_ranks = {plan.id: i for i, plan in enumerate(sorted_by_price)}
        
        # Calculate scores
        scored_plans = []
        for plan in plans:
            # Normalize values
            priority_score = min(plan.priority_level / 8.0, 1.0) if hasattr(plan, 'priority_level') else 0.5
            popularity_score = min(plan.purchases / 100.0, 1.0) if hasattr(plan, 'purchases') else 0.0
            price_rank_score = price_ranks.get(plan.id, 0) / max(len(plans), 1)
            
            # Availability bonus - Plans available now get bonus
            availability_bonus = 0
            if client_type and hasattr(plan, 'is_available_for_client'):
                availability = plan.is_available_for_client(client_type)
                if availability.get('available'):
                    availability_bonus = 0.2  # 20% bonus for availability
            
            # Calculate final score
            score = (priority_score * 2) + (popularity_score * 0.5) - (price_rank_score * 0.3) + availability_bonus
            
            scored_plans.append({
                'plan': plan,
                'score': score,
                'priority_score': priority_score,
                'popularity_score': popularity_score,
                'value_score': 1 - price_rank_score,
                'availability_bonus': availability_bonus
            })
        
        # Sort by score
        scored_plans.sort(key=lambda x: x['score'], reverse=True)
        
        # Prepare results
        recommendations = []
        for item in scored_plans[:limit]:
            plan = item['plan']
            
            # Check availability for the specific client type
            if hasattr(plan, 'is_available_for_client'):
                availability = plan.is_available_for_client(client_type or 'hotspot')
            else:
                availability = {'available': True, 'reason': 'No availability check'}
            
            # Get enabled access methods
            enabled_methods = []
            if hasattr(plan, 'get_enabled_access_methods'):
                enabled_methods = plan.get_enabled_access_methods()
            else:
                # Fallback logic
                if hasattr(plan, 'access_methods'):
                    methods = plan.access_methods or {}
                    for method, config in methods.items():
                        if config.get('enabled'):
                            enabled_methods.append(method)
            
            recommendations.append({
                'id': str(plan.id),
                'name': plan.name,
                'price': float(plan.price) if hasattr(plan, 'price') else 0.0,
                'category': plan.category if hasattr(plan, 'category') else 'unknown',
                'plan_type': plan.plan_type if hasattr(plan, 'plan_type') else 'paid',
                'access_methods': enabled_methods,
                'client_type_restriction': plan.client_type_restriction if hasattr(plan, 'client_type_restriction') else 'any',
                'score': item['score'],
                'availability': availability,
                'has_time_variant': hasattr(plan, 'has_time_variant') and plan.has_time_variant(),
                'reasons': [
                    f"Priority level: {getattr(plan, 'priority_level', 'N/A')}",
                    f"Purchased {getattr(plan, 'purchases', 0)} times",
                    f"Good value at KSH {getattr(plan, 'price', 0)}",
                    "Available now" if availability.get('available') else "Currently unavailable"
                ]
            })
        
        cache.set(cache_key, recommendations, 300)  # Cache for 5 minutes
        return recommendations
    
    @classmethod
    def get_plans_by_time_availability(cls, time_filter: str = 'current') -> List[InternetPlan]:
        """
        Get plans filtered by time availability
        NEW: Advanced time-based filtering
        """
        cache_key = f"plans_by_time:{time_filter}"
        cached_results = cache.get(cache_key)
        
        if cached_results:
            return cached_results
        
        now = timezone.now()
        current_hour = now.hour
        current_day = now.strftime('%a').lower()[:3]
        
        # Get all active plans with time variant
        plans_with_time_variant = InternetPlan.objects.filter(
            active=True,
            time_variant__is_active=True
        ).select_related('time_variant')
        
        categorized_plans = {
            'available_now': [],
            'available_today': [],
            'available_this_week': [],
            'available_next_week': [],
            'scheduled_future': [],
            'unavailable': []
        }
        
        for plan in plans_with_time_variant:
            time_variant = plan.time_variant
            
            # Skip if no time variant
            if not time_variant:
                categorized_plans['unavailable'].append(plan)
                continue
            
            # Check current availability
            if hasattr(time_variant, 'is_available_now') and time_variant.is_available_now():
                categorized_plans['available_now'].append(plan)
                continue
            
            # Check if available later today (time of day restriction only)
            if time_variant.start_time and time_variant.end_time:
                if now.time() < time_variant.start_time:
                    categorized_plans['available_today'].append(plan)
                    continue
            
            # Check day of week availability
            if time_variant.available_days and current_day in time_variant.available_days:
                categorized_plans['available_this_week'].append(plan)
                continue
            
            # Check scheduled availability
            if time_variant.schedule_active and time_variant.schedule_start_date:
                if now < time_variant.schedule_start_date:
                    categorized_plans['scheduled_future'].append(plan)
                    continue
            
            # Otherwise unavailable
            categorized_plans['unavailable'].append(plan)
        
        # Filter based on requested time filter
        if time_filter == 'current':
            results = categorized_plans['available_now']
        elif time_filter == 'today':
            results = categorized_plans['available_now'] + categorized_plans['available_today']
        elif time_filter == 'week':
            results = (categorized_plans['available_now'] + 
                      categorized_plans['available_today'] + 
                      categorized_plans['available_this_week'])
        elif time_filter == 'future':
            results = categorized_plans['scheduled_future']
        elif time_filter == 'all':
            results = list(plans_with_time_variant)
        else:
            results = categorized_plans['available_now']
        
        cache.set(cache_key, results, 60)  # Cache for 1 minute (time-sensitive)
        return results
    
    @classmethod
    def create_time_variant_config(cls, config_data: Dict[str, Any]) -> TimeVariantConfig:
        """
        Create time variant configuration with validation
        NEW: Service method for time variant creation
        """
        try:
            # Validate required fields if active
            if config_data.get('is_active', False):
                if not config_data.get('timezone'):
                    config_data['timezone'] = 'Africa/Nairobi'
            
            config = TimeVariantConfig.objects.create(**config_data)
            
            logger.info(f"Time variant config created: {config.id}")
            
            return config
        
        except Exception as e:
            logger.error(f"Failed to create time variant config: {e}", exc_info=True)
            raise
    
    @classmethod
    def update_time_variant_availability(cls, config_id: str, is_available: bool) -> TimeVariantConfig:
        """
        Update time variant force availability
        NEW: Quick toggle for emergency overrides
        """
        try:
            config = TimeVariantConfig.objects.get(id=config_id)
            config.force_available = is_available
            config.save(update_fields=['force_available', 'updated_at'])
            
            # Clear related plan caches
            plan_ids = InternetPlan.objects.filter(time_variant=config).values_list('id', flat=True)
            for plan_id in plan_ids:
                cache.delete(f"internet_plan:{plan_id}")
            cache.delete_pattern("available_plans:*")
            
            logger.info(f"Time variant {config_id} force availability set to {is_available}")
            
            return config
        
        except TimeVariantConfig.DoesNotExist:
            logger.error(f"Time variant config not found: {config_id}")
            raise ValueError(f"Time variant configuration not found: {config_id}")