"""
Internet Plans - Core Plan Models
Manages Internet Plans and Templates with proper integration
"""

from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError
from django.utils import timezone
from decimal import Decimal
from django.contrib.auth import get_user_model
import uuid
import logging
from typing import Dict, List, Optional, Tuple
from django.db import transaction
import json

logger = logging.getLogger(__name__)

# Import from Authentication app
try:
    from authentication.models import UserAccount
    AUTH_APP_AVAILABLE = True
except ImportError:
    logger.warning("Authentication app not available - limited functionality")
    AUTH_APP_AVAILABLE = False


class PlanTemplate(models.Model):
    """
    Template for creating Internet Plans
    Templates define the structure that can be reused for multiple plans
    """
    
    CATEGORIES = (
        ('Residential', 'Residential'),
        ('Business', 'Business'),
        ('Promotional', 'Promotional'),
        ('Enterprise', 'Enterprise'),
        ('Hotspot', 'Hotspot Only'),
        ('PPPoE', 'PPPoE Only'),
        ('Dual', 'Hotspot & PPPoE'),
    )
    
    # Core Template Fields
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True, db_index=True)
    description = models.TextField(blank=True, default="")
    category = models.CharField(max_length=20, choices=CATEGORIES, default='Residential', db_index=True)
    base_price = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0'))],
        help_text="Base price in KSH"
    )
    
    # Access Methods Configuration
    access_methods = models.JSONField(
        default=dict,
        help_text="Configuration for hotspot and PPPoE access methods"
    )
    
    # Template Management
    is_public = models.BooleanField(default=True, db_index=True)
    is_active = models.BooleanField(default=True, db_index=True)
    usage_count = models.PositiveIntegerField(default=0, db_index=True)
    
    # Ownership
    created_by = models.ForeignKey(
        get_user_model(),
        on_delete=models.CASCADE,
        related_name='created_templates',
        null=True,
        blank=True,
        help_text="Admin who created this template"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True, db_index=True)
    
    class Meta:
        verbose_name = 'Plan Template'
        verbose_name_plural = 'Plan Templates'
        ordering = ['name']
        indexes = [
            models.Index(fields=['name', 'is_active']),
            models.Index(fields=['category', 'is_active']),
            models.Index(fields=['is_public', 'is_active']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.category})"
    
    def clean(self):
        """Validate template configuration"""
        errors = {}
        
        # Validate JSON structure
        if not isinstance(self.access_methods, dict):
            errors['access_methods'] = 'Access methods must be a dictionary'
        
        # Validate access method configurations
        required_methods = ['hotspot', 'pppoe']
        for method in required_methods:
            if method not in self.access_methods:
                errors['access_methods'] = f'Missing {method} configuration'
                continue
            
            config = self.access_methods[method]
            if not isinstance(config, dict):
                errors['access_methods'] = f'{method} configuration must be a dictionary'
                continue
            
            if config.get('enabled', False):
                # Validate required fields for enabled methods
                required_fields = ['downloadSpeed', 'uploadSpeed', 'dataLimit', 'usageLimit']
                for field in required_fields:
                    if field not in config:
                        errors['access_methods'] = f'Missing {field} for enabled {method}'
                        continue
                    
                    field_config = config[field]
                    if not isinstance(field_config, dict):
                        errors['access_methods'] = f'{method}.{field} must be a dictionary'
                        continue
                    
                    if 'value' not in field_config:
                        errors['access_methods'] = f'{method}.{field}.value is required'
        
        if not self.has_enabled_access_methods():
            errors['access_methods'] = 'At least one access method must be enabled'
        
        if errors:
            raise ValidationError(errors)
    
    def save(self, *args, **kwargs):
        """Save with validation and default configuration"""
        if not self.access_methods:
            self.set_default_access_methods()
        
        self.full_clean()
        super().save(*args, **kwargs)
    
    def set_default_access_methods(self):
        """Set default access method configurations"""
        self.access_methods = {
            'hotspot': {
                'enabled': True,
                'downloadSpeed': {'value': '10', 'unit': 'Mbps'},
                'uploadSpeed': {'value': '5', 'unit': 'Mbps'},
                'dataLimit': {'value': '10', 'unit': 'GB'},
                'usageLimit': {'value': '24', 'unit': 'Hours'},
                'bandwidthLimit': 0,
                'maxDevices': 1,
                'sessionTimeout': 86400,
                'idleTimeout': 300,
                'validityPeriod': {'value': '30', 'unit': 'Days'},
                'macBinding': False,
            },
            'pppoe': {
                'enabled': False,
                'downloadSpeed': {'value': '10', 'unit': 'Mbps'},
                'uploadSpeed': {'value': '5', 'unit': 'Mbps'},
                'dataLimit': {'value': '10', 'unit': 'GB'},
                'usageLimit': {'value': '24', 'unit': 'Hours'},
                'bandwidthLimit': 0,
                'maxDevices': 1,
                'sessionTimeout': 86400,
                'idleTimeout': 300,
                'validityPeriod': {'value': '30', 'unit': 'Days'},
                'macBinding': False,
                'ipPool': 'pppoe-pool-1',
                'serviceName': '',
                'mtu': 1492,
                'dnsServers': ['8.8.8.8', '1.1.1.1'],
            }
        }
    
    def increment_usage(self):
        """Atomically increment usage count"""
        with transaction.atomic():
            PlanTemplate.objects.filter(pk=self.pk).update(
                usage_count=models.F('usage_count') + 1
            )
            self.refresh_from_db()
    
    def has_enabled_access_methods(self):
        """Check if any access method is enabled"""
        return any(
            method_config.get('enabled', False) 
            for method_config in self.access_methods.values()
        )
    
    def get_enabled_access_methods(self) -> List[str]:
        """Get list of enabled access methods"""
        return [
            method for method, config in self.access_methods.items() 
            if config.get('enabled', False)
        ]
    
    def get_access_type(self) -> str:
        """Get access type category"""
        enabled_methods = self.get_enabled_access_methods()
        if 'hotspot' in enabled_methods and 'pppoe' in enabled_methods:
            return 'dual'
        elif 'hotspot' in enabled_methods:
            return 'hotspot'
        elif 'pppoe' in enabled_methods:
            return 'pppoe'
        return 'none'
    
    def get_config_for_method(self, method: str) -> Dict:
        """Get configuration for specific access method"""
        return self.access_methods.get(method, {})


class InternetPlan(models.Model):
    """
    Internet Plan that can be purchased by clients
    Each plan is created from a template or custom configuration
    """
    
    PLAN_TYPES = (
        ('paid', 'Paid'),
        ('free_trial', 'Free Trial'),
        ('promotional', 'Promotional'),
    )
    
    CATEGORIES = (
        ('Residential', 'Residential'),
        ('Business', 'Business'),
        ('Promotional', 'Promotional'),
        ('Enterprise', 'Enterprise'),
        ('Hotspot', 'Hotspot Only'),
        ('PPPoE', 'PPPoE Only'),
        ('Dual', 'Hotspot & PPPoE'),
    )
    
    PRIORITY_LEVELS = (
        (1, 'Lowest'),
        (2, 'Low'),
        (3, 'Medium'),
        (4, 'High'),
        (5, 'Highest'),
        (6, 'Critical'),
        (7, 'Premium'),
        (8, 'VIP'),
    )
    
    # Core Plan Fields
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    plan_type = models.CharField(max_length=20, choices=PLAN_TYPES, default='paid', db_index=True)
    name = models.CharField(max_length=100, unique=True, db_index=True)
    price = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0'))],
        help_text="Price in KSH"
    )
    active = models.BooleanField(default=True, db_index=True)
    category = models.CharField(max_length=20, choices=CATEGORIES, default='Residential', db_index=True)
    description = models.TextField(blank=True, default="")
    
    # Template Reference
    template = models.ForeignKey(
        PlanTemplate, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='created_plans',
        help_text="Template used to create this plan"
    )
    
    # Access Methods
    access_methods = models.JSONField(
        default=dict,
        help_text="Configuration for hotspot and PPPoE access methods"
    )
    
    # Plan Configuration
    priority_level = models.IntegerField(choices=PRIORITY_LEVELS, default=4)
    router_specific = models.BooleanField(default=False)
    allowed_routers = models.ManyToManyField(
        'network_management.Router',
        blank=True,
        related_name='allowed_plans',
        help_text="Routers where this plan can be used (if router_specific)"
    )
    
    # FUP (Fair Usage Policy)
    FUP_policy = models.TextField(blank=True, default="")
    FUP_threshold = models.PositiveIntegerField(
        default=80,
        validators=[MinValueValidator(1), MaxValueValidator(100)],
        help_text="Usage threshold percentage for FUP"
    )
    
    # Usage Tracking
    purchases = models.PositiveIntegerField(default=0, db_index=True)
    
    # Session Tracking
    client_sessions = models.JSONField(default=dict, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True, db_index=True)
    
    class Meta:
        verbose_name = 'Internet Plan'
        verbose_name_plural = 'Internet Plans'
        ordering = ['-priority_level', 'name']
        indexes = [
            models.Index(fields=['name', 'active']),
            models.Index(fields=['plan_type', 'active']),
            models.Index(fields=['category', 'active']),
            models.Index(fields=['price']),
            models.Index(fields=['purchases']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        plan_type = self.get_plan_type_display()
        return f"{self.name} ({plan_type}) - KSH {self.price}"
    
    def clean(self):
        """Validate plan configuration"""
        errors = {}
        
        # Free Trial validation
        if self.plan_type == 'free_trial':
            if self.price != Decimal('0'):
                errors['price'] = 'Free Trial plans must have price set to 0'
            if self.router_specific:
                errors['router_specific'] = 'Free Trial plans cannot be router-specific'
            if self.priority_level > 4:
                errors['priority_level'] = 'Free Trial plans cannot have premium priority levels'
        
        # Access Methods validation
        if not isinstance(self.access_methods, dict):
            errors['access_methods'] = 'Access methods must be a dictionary'
        else:
            required_methods = ['hotspot', 'pppoe']
            for method in required_methods:
                if method not in self.access_methods:
                    errors['access_methods'] = f'Missing {method} configuration'
                    continue
                
                config = self.access_methods[method]
                if not isinstance(config, dict):
                    errors['access_methods'] = f'{method} configuration must be a dictionary'
                    continue
                
                if config.get('enabled', False):
                    required_fields = ['downloadSpeed', 'uploadSpeed', 'dataLimit', 'usageLimit']
                    for field in required_fields:
                        if field not in config:
                            errors['access_methods'] = f'Missing {field} for enabled {method}'
                            continue
                        
                        field_config = config[field]
                        if not isinstance(field_config, dict):
                            errors['access_methods'] = f'{method}.{field} must be a dictionary'
                            continue
                        
                        if 'value' not in field_config:
                            errors['access_methods'] = f'{method}.{field}.value is required'
        
        if not self.has_enabled_access_methods():
            errors['access_methods'] = 'At least one access method must be enabled'
        
        if errors:
            raise ValidationError(errors)
    
    def save(self, *args, **kwargs):
        """Save with validation"""
        if not self.access_methods:
            self.set_default_access_methods()
        
        self.full_clean()
        super().save(*args, **kwargs)
    
    def set_default_access_methods(self):
        """Set default access method configurations"""
        self.access_methods = {
            'hotspot': {
                'enabled': True,
                'downloadSpeed': {'value': '10', 'unit': 'Mbps'},
                'uploadSpeed': {'value': '5', 'unit': 'Mbps'},
                'dataLimit': {'value': '10', 'unit': 'GB'},
                'usageLimit': {'value': '24', 'unit': 'Hours'},
                'bandwidthLimit': 0,
                'maxDevices': 1,
                'sessionTimeout': 86400,
                'idleTimeout': 300,
                'validityPeriod': {'value': '30', 'unit': 'Days'},
                'macBinding': False,
            },
            'pppoe': {
                'enabled': False,
                'downloadSpeed': {'value': '10', 'unit': 'Mbps'},
                'uploadSpeed': {'value': '5', 'unit': 'Mbps'},
                'dataLimit': {'value': '10', 'unit': 'GB'},
                'usageLimit': {'value': '24', 'unit': 'Hours'},
                'bandwidthLimit': 0,
                'maxDevices': 1,
                'sessionTimeout': 86400,
                'idleTimeout': 300,
                'validityPeriod': {'value': '30', 'unit': 'Days'},
                'macBinding': False,
                'ipPool': 'pppoe-pool-1',
                'serviceName': '',
                'mtu': 1492,
                'dnsServers': ['8.8.8.8', '1.1.1.1'],
            }
        }
    
    def create_from_template(self, template: PlanTemplate):
        """Create plan from template"""
        self.name = template.name
        self.category = template.category
        self.price = template.base_price
        self.description = template.description
        self.access_methods = template.access_methods
        self.template = template
        
        if template.base_price > 0:
            self.plan_type = 'paid'
        else:
            self.plan_type = 'free_trial'
        
        template.increment_usage()
        self.save()
    
    def has_enabled_access_methods(self) -> bool:
        """Check if any access method is enabled"""
        return any(
            method_config.get('enabled', False) 
            for method_config in self.access_methods.values()
        )
    
    def get_enabled_access_methods(self) -> List[str]:
        """Get list of enabled access methods"""
        return [
            method for method, config in self.access_methods.items() 
            if config.get('enabled', False)
        ]
    
    def get_access_type(self) -> str:
        """Get access type category"""
        enabled_methods = self.get_enabled_access_methods()
        if 'hotspot' in enabled_methods and 'pppoe' in enabled_methods:
            return 'dual'
        elif 'hotspot' in enabled_methods:
            return 'hotspot'
        elif 'pppoe' in enabled_methods:
            return 'pppoe'
        return 'none'
    
    def can_be_used_on_router(self, router_id: int) -> bool:
        """Check if plan can be used on specific router"""
        if not self.router_specific:
            return True
        
        from network_management.models import Router
        return self.allowed_routers.filter(id=router_id).exists()
    
    def increment_purchases(self):
        """Increment purchase count"""
        self.purchases += 1
        self.save(update_fields=['purchases', 'updated_at'])
    
    def get_router_compatibility(self) -> List[Dict]:
        """Get router compatibility information"""
        from network_management.models import Router
        
        routers = Router.objects.filter(is_active=True, status='connected')
        compatibility_data = []
        
        for router in routers:
            compatible = self.can_be_used_on_router(router.id)
            compatibility_data.append({
                'router_id': router.id,
                'router_name': router.name,
                'compatible': compatible,
                'access_methods': self.get_enabled_access_methods() if compatible else []
            })
        
        return compatibility_data
    
    def is_compatible_with_client(self, client) -> bool:
        """Check if plan is compatible with client's connection type"""
        if not AUTH_APP_AVAILABLE:
            return True
        
        if not isinstance(client, UserAccount):
            return True
        
        if not client.is_client:
            return False
        
        enabled_methods = self.get_enabled_access_methods()
        
        if client.is_pppoe_client:
            return 'pppoe' in enabled_methods
        elif client.is_hotspot_client:
            return 'hotspot' in enabled_methods
        
        return False
    
    def get_config_for_method(self, method: str) -> Dict:
        """Get configuration for specific access method"""
        return self.access_methods.get(method, {})