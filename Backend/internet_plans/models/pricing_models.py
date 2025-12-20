"""
Internet Plans - Pricing Models
Advanced pricing and discount management
NEW: Additional models for flexible pricing
"""

from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError
from django.utils import timezone
from decimal import Decimal
import uuid
import logging
from typing import Dict, List, Optional
from django.db import transaction
import json

logger = logging.getLogger(__name__)


class PriceMatrix(models.Model):
    """
    Advanced price matrix for dynamic pricing
    Supports tiered pricing, volume discounts, etc.
    """
    
    DISCOUNT_TYPES = (
        ('percentage', 'Percentage Discount'),
        ('fixed', 'Fixed Amount'),
        ('tiered', 'Tiered Pricing'),
        ('volume', 'Volume Discount'),
    )
    
    APPLIES_TO = (
        ('plan', 'Specific Plan'),
        ('category', 'Plan Category'),
        ('all', 'All Plans'),
    )
    
    # Core Fields
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True, db_index=True)
    description = models.TextField(blank=True, default="")
    
    # Discount Configuration
    discount_type = models.CharField(max_length=20, choices=DISCOUNT_TYPES, default='percentage')
    applies_to = models.CharField(max_length=20, choices=APPLIES_TO, default='plan')
    
    # Target Specification
    target_plan = models.ForeignKey(
        'InternetPlan',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='price_matrices'
    )
    target_category = models.CharField(max_length=20, blank=True)
    
    # Discount Parameters
    percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0')), MaxValueValidator(Decimal('100'))],
        help_text="Percentage discount (0-100)"
    )
    fixed_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0'))]
    )
    
    # Tiered/Volume Configuration
    tier_config = models.JSONField(
        default=list,
        blank=True,
        help_text="Tier configuration: [{'min_qty': 1, 'price': 1000}, ...]"
    )
    
    # Eligibility
    min_quantity = models.PositiveIntegerField(default=1)
    max_quantity = models.PositiveIntegerField(null=True, blank=True)
    
    # Validity
    valid_from = models.DateTimeField(default=timezone.now, db_index=True)
    valid_to = models.DateTimeField(null=True, blank=True, db_index=True)
    is_active = models.BooleanField(default=True, db_index=True)
    
    # Usage Tracking
    usage_count = models.PositiveIntegerField(default=0)
    total_discount_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00')
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True, db_index=True)
    
    class Meta:
        verbose_name = 'Price Matrix'
        verbose_name_plural = 'Price Matrices'
        ordering = ['-valid_from', 'name']
        indexes = [
            models.Index(fields=['applies_to', 'is_active']),
            models.Index(fields=['valid_from', 'valid_to']),
            models.Index(fields=['target_plan', 'is_active']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.get_discount_type_display()})"
    
    def clean(self):
        """Validate price matrix configuration"""
        errors = {}
        
        # Validate target specification
        if self.applies_to == 'plan' and not self.target_plan:
            errors['target_plan'] = 'Target plan is required when applies_to is "plan"'
        
        if self.applies_to == 'category' and not self.target_category:
            errors['target_category'] = 'Target category is required when applies_to is "category"'
        
        # Validate discount parameters
        if self.discount_type == 'percentage' and self.percentage == 0:
            errors['percentage'] = 'Percentage must be greater than 0'
        
        if self.discount_type == 'fixed' and self.fixed_amount == 0:
            errors['fixed_amount'] = 'Fixed amount must be greater than 0'
        
        if self.discount_type == 'tiered' and not self.tier_config:
            errors['tier_config'] = 'Tier configuration is required for tiered pricing'
        
        # Validate tier configuration
        if self.tier_config and isinstance(self.tier_config, list):
            for i, tier in enumerate(self.tier_config):
                if not isinstance(tier, dict):
                    errors['tier_config'] = f'Tier {i} must be a dictionary'
                    continue
                
                if 'min_qty' not in tier or 'price' not in tier:
                    errors['tier_config'] = f'Tier {i} must have min_qty and price'
        
        # Validate date range
        if self.valid_to and self.valid_to < self.valid_from:
            errors['valid_to'] = 'Valid to date must be after valid from date'
        
        if errors:
            raise ValidationError(errors)
    
    def is_valid_for_plan(self, plan, quantity=1):
        """Check if price matrix is valid for specific plan and quantity"""
        if not self.is_active:
            return False
        
        # Check date validity
        now = timezone.now()
        if self.valid_from > now:
            return False
        if self.valid_to and self.valid_to < now:
            return False
        
        # Check quantity limits
        if quantity < self.min_quantity:
            return False
        if self.max_quantity and quantity > self.max_quantity:
            return False
        
        # Check target matching
        if self.applies_to == 'plan':
            return self.target_plan == plan
        elif self.applies_to == 'category':
            return plan.category == self.target_category
        elif self.applies_to == 'all':
            return True
        
        return False
    
    def calculate_discounted_price(self, original_price, quantity=1):
        """Calculate discounted price"""
        if not self.is_active:
            return original_price
        
        if self.discount_type == 'percentage':
            discount = (original_price * self.percentage) / Decimal('100')
            return max(Decimal('0'), original_price - discount)
        
        elif self.discount_type == 'fixed':
            return max(Decimal('0'), original_price - self.fixed_amount)
        
        elif self.discount_type == 'tiered':
            # Find appropriate tier
            for tier in sorted(self.tier_config, key=lambda x: x['min_qty'], reverse=True):
                if quantity >= tier['min_qty']:
                    return Decimal(str(tier['price']))
            return original_price
        
        elif self.discount_type == 'volume':
            # Volume discount calculation
            if quantity >= 10:
                return original_price * Decimal('0.9')  # 10% off for 10+
            elif quantity >= 5:
                return original_price * Decimal('0.95')  # 5% off for 5+
            return original_price
        
        return original_price
    
    def record_usage(self, discount_amount):
        """Record usage of this price matrix"""
        with transaction.atomic():
            self.usage_count = models.F('usage_count') + 1
            self.total_discount_amount = models.F('total_discount_amount') + discount_amount
            self.save(update_fields=['usage_count', 'total_discount_amount', 'updated_at'])


class DiscountRule(models.Model):
    """
    Business rules for applying discounts
    Can be combined with price matrices
    """
    
    RULE_TYPES = (
        ('first_time', 'First Time Purchase'),
        ('loyalty', 'Loyalty Discount'),
        ('seasonal', 'Seasonal Promotion'),
        ('referral', 'Referral Bonus'),
        ('bulk', 'Bulk Purchase'),
    )
    
    # Core Fields
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True, db_index=True)
    rule_type = models.CharField(max_length=20, choices=RULE_TYPES, default='first_time')
    description = models.TextField(blank=True, default="")
    
    # Rule Configuration
    price_matrix = models.ForeignKey(
        PriceMatrix,
        on_delete=models.CASCADE,
        related_name='discount_rules',
        help_text="Price matrix to apply"
    )
    
    # Eligibility Criteria
    eligibility_criteria = models.JSONField(
        default=dict,
        blank=True,
        help_text="JSON criteria for eligibility"
    )
    
    # Priority
    priority = models.PositiveIntegerField(
        default=1,
        help_text="Higher priority rules are applied first"
    )
    
    # Usage Limits
    max_uses_per_client = models.PositiveIntegerField(null=True, blank=True)
    total_usage_limit = models.PositiveIntegerField(null=True, blank=True)
    current_usage = models.PositiveIntegerField(default=0)
    
    # Status
    is_active = models.BooleanField(default=True, db_index=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True, db_index=True)
    
    class Meta:
        verbose_name = 'Discount Rule'
        verbose_name_plural = 'Discount Rules'
        ordering = ['-priority', 'name']
        indexes = [
            models.Index(fields=['rule_type', 'is_active']),
            models.Index(fields=['priority', 'is_active']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.get_rule_type_display()})"
    
    def clean(self):
        """Validate discount rule"""
        errors = {}
        
        # Check usage limits
        if self.total_usage_limit and self.current_usage >= self.total_usage_limit:
            errors['total_usage_limit'] = 'Usage limit has been reached'
        
        # Validate eligibility criteria
        if self.eligibility_criteria and not isinstance(self.eligibility_criteria, dict):
            errors['eligibility_criteria'] = 'Eligibility criteria must be a dictionary'
        
        if errors:
            raise ValidationError(errors)
    
    def can_apply_to_client(self, client_data):
        """
        Check if rule can apply to client
        client_data should contain relevant information for rule evaluation
        """
        if not self.is_active:
            return False
        
        # Check total usage limit
        if self.total_usage_limit and self.current_usage >= self.total_usage_limit:
            return False
        
        # Check price matrix validity
        if not self.price_matrix.is_active:
            return False
        
        # Apply rule-specific logic
        criteria = self.eligibility_criteria
        
        if self.rule_type == 'first_time':
            return client_data.get('purchase_count', 0) == 0
        
        elif self.rule_type == 'loyalty':
            min_purchases = criteria.get('min_purchases', 3)
            return client_data.get('purchase_count', 0) >= min_purchases
        
        elif self.rule_type == 'seasonal':
            # Check if current date is within seasonal period
            seasonal_start = criteria.get('start_date')
            seasonal_end = criteria.get('end_date')
            current_date = timezone.now().date()
            
            if seasonal_start and seasonal_end:
                return seasonal_start <= current_date <= seasonal_end
            return True
        
        elif self.rule_type == 'referral':
            return client_data.get('referred_by') is not None
        
        elif self.rule_type == 'bulk':
            min_quantity = criteria.get('min_quantity', 5)
            return client_data.get('quantity', 1) >= min_quantity
        
        return True
    
    def apply_rule(self, original_price, quantity=1, client_data=None):
        """Apply discount rule and return discounted price"""
        if not self.can_apply_to_client(client_data or {}):
            return original_price
        
        discounted_price = self.price_matrix.calculate_discounted_price(
            original_price, quantity
        )
        
        # Record usage
        discount_amount = original_price - discounted_price
        self.record_usage(discount_amount)
        self.price_matrix.record_usage(discount_amount)
        
        return discounted_price
    
    def record_usage(self, discount_amount):
        """Record rule usage"""
        with transaction.atomic():
            self.current_usage = models.F('current_usage') + 1
            self.save(update_fields=['current_usage', 'updated_at'])