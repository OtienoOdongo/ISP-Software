"""
Internet Plans - Pricing Service
Advanced pricing calculations and discount management
NEW: Production-ready pricing engine
"""

import logging
from typing import Dict, List, Optional, Tuple
from django.core.cache import cache
from django.db import transaction
from django.db.models import Q, Avg, Sum
from django.utils import timezone
from decimal import Decimal, ROUND_HALF_UP
import json
from collections import defaultdict

from internet_plans.models.plan_models import InternetPlan
from internet_plans.models.pricing_models import PriceMatrix, DiscountRule

logger = logging.getLogger(__name__)


class PricingService:
    """
    Service for pricing calculations and discount management
    Uses efficient caching and calculation algorithms
    """
    
    CACHE_TIMEOUT = 300  # 5 minutes
    
    @classmethod
    def calculate_effective_price(cls, plan, quantity=1, discount_code=None, client_data=None):
        """
        Calculate effective price for a plan
        Takes into account all applicable discounts
        """
        if not plan or not plan.active:
            return None
        
        base_price = plan.price * quantity
        
        # Get applicable discounts
        applicable_discounts = cls._get_applicable_discounts(
            plan=plan,
            quantity=quantity,
            discount_code=discount_code,
            client_data=client_data or {}
        )
        
        if not applicable_discounts:
            return {
                'original_price': float(base_price),
                'discounted_price': float(base_price),
                'discount_amount': 0.0,
                'discount_percentage': 0.0,
                'applied_discounts': []
            }
        
        # Apply discounts
        current_price = base_price
        applied_discounts = []
        
        for discount in applicable_discounts:
            discounted_price = discount.calculate_discounted_price(current_price, quantity)
            discount_amount = current_price - discounted_price
            
            if discount_amount > 0:
                applied_discounts.append({
                    'type': discount.discount_type,
                    'name': discount.name,
                    'amount': float(discount_amount),
                    'percentage': float((discount_amount / current_price) * 100) if current_price > 0 else 0
                })
                
                current_price = discounted_price
        
        # Ensure price doesn't go below 0
        if current_price < 0:
            current_price = Decimal('0')
        
        return {
            'original_price': float(base_price),
            'discounted_price': float(current_price),
            'discount_amount': float(base_price - current_price),
            'discount_percentage': float(((base_price - current_price) / base_price) * 100) if base_price > 0 else 0,
            'applied_discounts': applied_discounts,
            'final_price_per_unit': float(current_price / quantity) if quantity > 0 else 0
        }
    
    @classmethod
    def _get_applicable_discounts(cls, plan, quantity, discount_code=None, client_data=None):
        """
        Get all applicable discounts for a plan
        Uses caching for performance
        """
        cache_key = f"applicable_discounts:{plan.id}:{quantity}:{discount_code or 'none'}"
        cached_discounts = cache.get(cache_key)
        
        if cached_discounts is not None:
            # Convert back to PriceMatrix objects
            return [PriceMatrix.objects.get(id=discount_id) for discount_id in cached_discounts]
        
        # Get price matrices
        now = timezone.now()
        
        # Base query for active price matrices
        price_matrices = PriceMatrix.objects.filter(
            is_active=True,
            valid_from__lte=now
        ).filter(
            Q(valid_to__isnull=True) | Q(valid_to__gte=now)
        )
        
        # Filter by applicability
        applicable = []
        
        for price_matrix in price_matrices:
            if price_matrix.is_valid_for_plan(plan, quantity):
                applicable.append(price_matrix)
        
        # Apply discount rules if client data provided
        if client_data:
            discount_rules = DiscountRule.objects.filter(
                is_active=True,
                price_matrix__in=applicable
            ).select_related('price_matrix').order_by('-priority')
            
            applicable = []
            for rule in discount_rules:
                if rule.can_apply_to_client(client_data):
                    applicable.append(rule.price_matrix)
        
        # Cache discount IDs
        cache.set(cache_key, [str(pm.id) for pm in applicable], cls.CACHE_TIMEOUT)
        
        return applicable
    
    @classmethod
    def calculate_final_price(cls, plan, quantity=1, discount_code=None, client_data=None):
        """
        Calculate final price with detailed breakdown
        """
        effective_price = cls.calculate_effective_price(
            plan=plan,
            quantity=quantity,
            discount_code=discount_code,
            client_data=client_data
        )
        
        if not effective_price:
            return None
        
        # Add tax calculation (if applicable)
        tax_rate = Decimal('0.16')  # 16% VAT for Kenya
        tax_amount = effective_price['discounted_price'] * tax_rate
        total_amount = effective_price['discounted_price'] + tax_amount
        
        result = {
            **effective_price,
            'quantity': quantity,
            'unit_price': float(plan.price),
            'tax_rate': float(tax_rate * 100),  # Percentage
            'tax_amount': float(tax_amount),
            'total_amount': float(total_amount),
            'currency': 'KES',
            'plan_details': {
                'id': str(plan.id),
                'name': plan.name,
                'category': plan.category,
                'plan_type': plan.plan_type
            }
        }
        
        return result
    
    @classmethod
    def get_pricing_options(cls, plan):
        """
        Get all pricing options for a plan
        Includes bulk discounts, promotions, etc.
        """
        cache_key = f"pricing_options:{plan.id}"
        cached_options = cache.get(cache_key)
        
        if cached_options:
            return cached_options
        
        now = timezone.now()
        
        # Get all active price matrices for this plan
        price_matrices = PriceMatrix.objects.filter(
            is_active=True,
            valid_from__lte=now,
            target_plan=plan
        ).filter(
            Q(valid_to__isnull=True) | Q(valid_to__gte=now)
        ).order_by('min_quantity')
        
        # Build pricing options
        options = {
            'standard': {
                'price': float(plan.price),
                'description': 'Standard pricing',
                'min_quantity': 1
            },
            'bulk_discounts': [],
            'promotions': [],
            'tiered_pricing': []
        }
        
        for price_matrix in price_matrices:
            if price_matrix.discount_type == 'tiered':
                for tier in price_matrix.tier_config:
                    options['tiered_pricing'].append({
                        'min_quantity': tier.get('min_qty', 1),
                        'price': float(tier.get('price', plan.price)),
                        'description': price_matrix.name
                    })
            
            elif price_matrix.discount_type == 'volume':
                options['bulk_discounts'].append({
                    'min_quantity': price_matrix.min_quantity,
                    'max_quantity': price_matrix.max_quantity,
                    'discount_percentage': float(price_matrix.percentage),
                    'description': price_matrix.description
                })
            
            else:
                options['promotions'].append({
                    'name': price_matrix.name,
                    'type': price_matrix.discount_type,
                    'discount': float(price_matrix.percentage) if price_matrix.discount_type == 'percentage' else float(price_matrix.fixed_amount),
                    'valid_until': price_matrix.valid_to.isoformat() if price_matrix.valid_to else None,
                    'description': price_matrix.description
                })
        
        # Sort tiered pricing
        options['tiered_pricing'].sort(key=lambda x: x['min_quantity'])
        
        cache.set(cache_key, options, cls.CACHE_TIMEOUT)
        return options
    
    @classmethod
    def validate_discount_code(cls, discount_code, plan, quantity=1, client_data=None):
        """
        Validate a discount code
        """
        cache_key = f"discount_validation:{discount_code}:{plan.id}:{quantity}"
        cached_result = cache.get(cache_key)
        
        if cached_result:
            return cached_result
        
        try:
            # Look for discount rule with matching criteria
            discount_rule = DiscountRule.objects.get(
                name=discount_code,
                is_active=True
            )
            
            # Check if applicable
            if discount_rule.price_matrix.target_plan != plan:
                result = {
                    'valid': False,
                    'error': 'Discount code not valid for this plan'
                }
            elif not discount_rule.can_apply_to_client(client_data or {}):
                result = {
                    'valid': False,
                    'error': 'Discount code eligibility criteria not met'
                }
            elif not discount_rule.price_matrix.is_valid_for_plan(plan, quantity):
                result = {
                    'valid': False,
                    'error': 'Discount code not valid for this quantity'
                }
            else:
                # Calculate discount
                original_price = plan.price * quantity
                discounted_price = discount_rule.apply_rule(
                    original_price, 
                    quantity, 
                    client_data
                )
                
                result = {
                    'valid': True,
                    'discount_code': discount_code,
                    'original_price': float(original_price),
                    'discounted_price': float(discounted_price),
                    'discount_amount': float(original_price - discounted_price),
                    'discount_percentage': float(((original_price - discounted_price) / original_price) * 100) if original_price > 0 else 0,
                    'description': discount_rule.description
                }
        
        except DiscountRule.DoesNotExist:
            result = {
                'valid': False,
                'error': 'Invalid discount code'
            }
        
        cache.set(cache_key, result, 60)  # Cache for 1 minute
        return result
    
    @classmethod
    def get_best_discount(cls, plan, quantity=1, client_data=None):
        """
        Find the best available discount for a plan
        """
        applicable_discounts = cls._get_applicable_discounts(
            plan=plan,
            quantity=quantity,
            client_data=client_data
        )
        
        if not applicable_discounts:
            return None
        
        original_price = plan.price * quantity
        best_discount = None
        best_savings = Decimal('0')
        
        for discount in applicable_discounts:
            discounted_price = discount.calculate_discounted_price(original_price, quantity)
            savings = original_price - discounted_price
            
            if savings > best_savings:
                best_savings = savings
                best_discount = {
                    'price_matrix': discount,
                    'discounted_price': discounted_price,
                    'savings': savings,
                    'savings_percentage': (savings / original_price) * 100 if original_price > 0 else 0
                }
        
        if best_discount:
            return {
                'discount_name': best_discount['price_matrix'].name,
                'original_price': float(original_price),
                'discounted_price': float(best_discount['discounted_price']),
                'savings': float(best_discount['savings']),
                'savings_percentage': float(best_discount['savings_percentage']),
                'description': best_discount['price_matrix'].description
            }
        
        return None
    
    @classmethod
    def calculate_bulk_purchase(cls, plan, quantities):
        """
        Calculate prices for multiple quantities
        Returns price breakdown for each quantity
        """
        results = []
        
        for quantity in quantities:
            if quantity < 1:
                continue
            
            price_info = cls.calculate_final_price(plan, quantity)
            if price_info:
                results.append({
                    'quantity': quantity,
                    **price_info
                })
        
        # Add volume discount analysis
        if len(results) > 1:
            # Calculate cost per unit for each quantity
            for result in results:
                result['cost_per_unit'] = result['total_amount'] / result['quantity']
            
            # Sort by quantity
            results.sort(key=lambda x: x['quantity'])
        
        return results
    
    @classmethod
    def get_pricing_statistics(cls):
        """
        Get pricing statistics and analytics
        """
        cache_key = "pricing_statistics"
        cached_stats = cache.get(cache_key)
        
        if cached_stats:
            return cached_stats
        
        try:
            # Get active price matrices
            active_matrices = PriceMatrix.objects.filter(is_active=True).count()
            
            # Get discount usage
            discount_usage = PriceMatrix.objects.aggregate(
                total_usage=Sum('usage_count'),
                total_discount=Sum('total_discount_amount'),
                avg_discount=Avg('total_discount_amount')
            )
            
            # Get active discount rules
            active_rules = DiscountRule.objects.filter(is_active=True).count()
            rule_usage = DiscountRule.objects.aggregate(
                total_usage=Sum('current_usage'),
                avg_usage=Avg('current_usage')
            )
            
            # Get most used discounts
            popular_discounts = PriceMatrix.objects.filter(
                usage_count__gt=0
            ).order_by('-usage_count')[:5].values(
                'id', 'name', 'discount_type', 'usage_count', 'total_discount_amount'
            )
            
            stats = {
                'active_price_matrices': active_matrices,
                'active_discount_rules': active_rules,
                'discount_usage': {
                    'total_applications': discount_usage['total_usage'] or 0,
                    'total_discount_amount': float(discount_usage['total_discount'] or 0),
                    'average_discount': float(discount_usage['avg_discount'] or 0)
                },
                'rule_usage': {
                    'total_applications': rule_usage['total_usage'] or 0,
                    'average_per_rule': rule_usage['avg_usage'] or 0
                },
                'popular_discounts': list(popular_discounts),
                'timestamp': timezone.now().isoformat()
            }
            
            cache.set(cache_key, stats, 600)  # Cache for 10 minutes
            return stats
            
        except Exception as e:
            logger.error(f"Failed to get pricing statistics: {e}")
            return {
                'error': 'Failed to get pricing statistics',
                'timestamp': timezone.now().isoformat()
            }