"""
Internet Plans - Pricing Serializers
Serializers for pricing and discount models
NEW: Advanced pricing serialization
"""

from rest_framework import serializers
from django.utils import timezone
from decimal import Decimal
import logging

from internet_plans.models.pricing_models import PriceMatrix, DiscountRule
from internet_plans.models.plan_models import InternetPlan

logger = logging.getLogger(__name__)


class PriceMatrixSerializer(serializers.ModelSerializer):
    """
    Serializer for Price Matrix
    NEW: Advanced pricing configuration
    """
    
    # Read-only fields
    isCurrentlyValid = serializers.SerializerMethodField(
        read_only=True
    )
    usageStatistics = serializers.SerializerMethodField(
        read_only=True
    )
    
    # Write-only fields for specific targets
    targetPlanId = serializers.UUIDField(
        write_only=True,
        required=False,
        allow_null=True
    )
    
    class Meta:
        model = PriceMatrix
        fields = [
            'id', 'name', 'description', 'discount_type', 'applies_to',
            'targetPlanId', 'target_category', 'percentage', 'fixed_amount',
            'tier_config', 'min_quantity', 'max_quantity', 'valid_from',
            'valid_to', 'is_active', 'isCurrentlyValid', 'usage_count',
            'total_discount_amount', 'usageStatistics', 'created_at', 'updated_at'
        ]
        read_only_fields = ['usage_count', 'total_discount_amount', 'created_at', 'updated_at']
    
    def get_isCurrentlyValid(self, obj):
        """Check if price matrix is currently valid"""
        now = timezone.now()
        if obj.valid_from > now:
            return False
        if obj.valid_to and obj.valid_to < now:
            return False
        return obj.is_active
    
    def get_usageStatistics(self, obj):
        """Get usage statistics"""
        return {
            'usage_count': obj.usage_count,
            'total_discount': float(obj.total_discount_amount),
            'average_discount': float(obj.total_discount_amount / obj.usage_count) if obj.usage_count > 0 else 0
        }
    
    def validate(self, data):
        """Validate price matrix data"""
        # Set target plan if provided
        target_plan_id = data.pop('targetPlanId', None)
        if target_plan_id:
            try:
                target_plan = InternetPlan.objects.get(id=target_plan_id, active=True)
                data['target_plan'] = target_plan
            except InternetPlan.DoesNotExist:
                raise serializers.ValidationError({
                    'targetPlanId': 'Target plan not found or inactive'
                })
        
        # Validate tier configuration
        if data.get('discount_type') == 'tiered' and not data.get('tier_config'):
            raise serializers.ValidationError({
                'tier_config': 'Tier configuration is required for tiered pricing'
            })
        
        # Validate date range
        valid_from = data.get('valid_from')
        valid_to = data.get('valid_to')
        if valid_to and valid_from and valid_to < valid_from:
            raise serializers.ValidationError({
                'valid_to': 'Valid to date must be after valid from date'
            })
        
        return data
    
    def create(self, validated_data):
        """Create price matrix"""
        price_matrix = super().create(validated_data)
        
        # Clear pricing cache
        from django.core.cache import cache
        cache.delete_pattern("pricing:*")
        
        return price_matrix
    
    def update(self, instance, validated_data):
        """Update price matrix"""
        price_matrix = super().update(instance, validated_data)
        
        # Clear pricing cache
        from django.core.cache import cache
        cache.delete_pattern("pricing:*")
        
        return price_matrix


class DiscountRuleSerializer(serializers.ModelSerializer):
    """
    Serializer for Discount Rules
    NEW: Business rule serialization
    """
    
    # Read-only fields
    priceMatrixDetails = serializers.SerializerMethodField(
        read_only=True
    )
    canBeApplied = serializers.SerializerMethodField(
        read_only=True
    )
    
    class Meta:
        model = DiscountRule
        fields = [
            'id', 'name', 'rule_type', 'description', 'price_matrix',
            'priceMatrixDetails', 'eligibility_criteria', 'priority',
            'max_uses_per_client', 'total_usage_limit', 'current_usage',
            'is_active', 'canBeApplied', 'created_at', 'updated_at'
        ]
        read_only_fields = ['current_usage', 'created_at', 'updated_at']
    
    def get_priceMatrixDetails(self, obj):
        """Get price matrix details"""
        return {
            'id': str(obj.price_matrix.id),
            'name': obj.price_matrix.name,
            'discount_type': obj.price_matrix.discount_type
        }
    
    def get_canBeApplied(self, obj):
        """Check if rule can be applied"""
        if not obj.is_active or not obj.price_matrix.is_active:
            return False
        
        if obj.total_usage_limit and obj.current_usage >= obj.total_usage_limit:
            return False
        
        now = timezone.now()
        price_matrix = obj.price_matrix
        if price_matrix.valid_from > now:
            return False
        if price_matrix.valid_to and price_matrix.valid_to < now:
            return False
        
        return True
    
    def validate(self, data):
        """Validate discount rule"""
        # Check price matrix
        price_matrix = data.get('price_matrix')
        if price_matrix and not price_matrix.is_active:
            raise serializers.ValidationError({
                'price_matrix': 'Price matrix must be active'
            })
        
        # Check usage limits
        total_usage_limit = data.get('total_usage_limit')
        current_instance_usage = self.instance.current_usage if self.instance else 0
        
        if total_usage_limit and total_usage_limit < current_instance_usage:
            raise serializers.ValidationError({
                'total_usage_limit': f'Cannot set limit below current usage ({current_instance_usage})'
            })
        
        return data


class PriceCalculationSerializer(serializers.Serializer):
    """
    Serializer for price calculation requests
    NEW: Clean interface for pricing service
    """
    
    plan_id = serializers.UUIDField(required=True)
    quantity = serializers.IntegerField(
        required=False, 
        default=1,
        min_value=1
    )
    discount_code = serializers.CharField(
        required=False, 
        allow_blank=True
    )
    client_data = serializers.JSONField(
        required=False,
        default=dict
    )
    
    class Meta:
        fields = ['plan_id', 'quantity', 'discount_code', 'client_data']
    
    def validate(self, data):
        plan_id = data['plan_id']
        
        # Get plan from cache
        from internet_plans.models.plan_models import InternetPlan
        plan = InternetPlan.get_cached_plan(plan_id)
        if not plan:
            raise serializers.ValidationError({
                'plan_id': 'Plan not found or inactive'
            })
        
        self.context['plan'] = plan
        return data
    
    def calculate_price(self):
        """Calculate final price"""
        from internet_plans.services.pricing_service import PricingService
        
        plan = self.context['plan']
        validated_data = self.validated_data
        
        result = PricingService.calculate_final_price(
            plan=plan,
            quantity=validated_data.get('quantity', 1),
            discount_code=validated_data.get('discount_code'),
            client_data=validated_data.get('client_data', {})
        )
        
        return result


class BulkPriceCalculationSerializer(serializers.Serializer):
    """
    Serializer for bulk price calculations
    NEW: Efficient batch pricing
    """
    
    calculations = serializers.ListField(
        child=PriceCalculationSerializer(),
        required=True,
        max_length=50  # Limit batch size
    )
    
    class Meta:
        fields = ['calculations']
    
    def calculate_prices(self):
        """Calculate prices in bulk"""
        from internet_plans.services.pricing_service import PricingService
        
        calculations = self.validated_data['calculations']
        results = []
        
        for calculation in calculations:
            try:
                # Re-validate each calculation
                calc_serializer = PriceCalculationSerializer(data=calculation)
                if calc_serializer.is_valid():
                    result = calc_serializer.calculate_price()
                    results.append({
                        'plan_id': calculation['plan_id'],
                        'success': True,
                        'result': result
                    })
                else:
                    results.append({
                        'plan_id': calculation.get('plan_id'),
                        'success': False,
                        'error': calc_serializer.errors
                    })
            except Exception as e:
                logger.error(f"Bulk price calculation error: {e}")
                results.append({
                    'plan_id': calculation.get('plan_id'),
                    'success': False,
                    'error': str(e)
                })
        
        return results