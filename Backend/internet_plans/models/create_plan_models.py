from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError
from django.utils import timezone
from decimal import Decimal
from django.contrib.auth import get_user_model

User = get_user_model()


class PlanTemplate(models.Model):
    """
    Enhanced Plan Template model with complete support for dual access methods.
    """
    CATEGORIES = (
        ('Residential', 'Residential'),
        ('Business', 'Business'),
        ('Promotional', 'Promotional'),
        ('Enterprise', 'Enterprise'),
    )

    name = models.CharField(
        max_length=100,
        unique=True,
        help_text="Unique name identifying the template"
    )
    
    description = models.TextField(
        blank=True,
        default="",
        help_text="Description of the template and its use cases"
    )
    
    category = models.CharField(
        max_length=20,
        choices=CATEGORIES,
        default='Residential',
        help_text="Target audience for this template"
    )

    base_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0'))],
        help_text="Base price suggestion for this template"
    )

    # Access Methods Configuration (Hotspot & PPPoE)
    access_methods = models.JSONField(
        default=dict,
        help_text="Configuration for Hotspot and PPPoE access methods"
    )

    # Template metadata
    is_public = models.BooleanField(
        default=True,
        help_text="Whether this template is available to all users"
    )
    
    is_active = models.BooleanField(
        default=True,
        help_text="Whether this template is active and can be used"
    )
    
    usage_count = models.PositiveIntegerField(
        default=0,
        help_text="Number of times this template has been used"
    )

    created_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='created_templates',
        help_text="User who created this template"
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Date and time when this template was created"
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="Date and time when this template was last updated"
    )

    def clean(self):
        """Validate template structure"""
        if not isinstance(self.access_methods, dict):
            raise ValidationError({'access_methods': 'Access methods must be a dictionary'})
        
        # Validate both access methods exist
        for method in ['hotspot', 'pppoe']:
            if method not in self.access_methods:
                raise ValidationError({'access_methods': f'Missing {method} configuration'})
            
            config = self.access_methods[method]
            if not isinstance(config, dict):
                raise ValidationError({'access_methods': f'{method} configuration must be a dictionary'})
            
            # Validate required nested structures for enabled methods
            if config.get('enabled', False):
                required_fields = ['downloadSpeed', 'uploadSpeed', 'dataLimit', 'usageLimit']
                for field in required_fields:
                    if field not in config:
                        raise ValidationError({'access_methods': f'Missing {field} for enabled {method}'})
                    
                    field_config = config[field]
                    if not isinstance(field_config, dict):
                        raise ValidationError({'access_methods': f'{method}.{field} must be a dictionary'})
                    
                    if 'value' not in field_config:
                        raise ValidationError({'access_methods': f'{method}.{field}.value is required'})

        # Ensure at least one access method is enabled
        if not self.has_enabled_access_methods():
            raise ValidationError({'access_methods': 'At least one access method must be enabled'})

    def save(self, *args, **kwargs):
        """Override save to run full validation and set default access methods"""
        if not self.access_methods:
            self.set_default_access_methods()
        
        self.full_clean()
        super().save(*args, **kwargs)

    def set_default_access_methods(self):
        """Set comprehensive default access methods structure"""
        self.access_methods = {
            'hotspot': {
                'enabled': True,
                'downloadSpeed': {'value': '', 'unit': 'Mbps'},
                'uploadSpeed': {'value': '', 'unit': 'Mbps'},
                'dataLimit': {'value': '', 'unit': 'GB'},
                'usageLimit': {'value': '', 'unit': 'Hours'},
                'bandwidthLimit': 0,
                'maxDevices': 1,
                'sessionTimeout': 86400,
                'idleTimeout': 300,
                'validityPeriod': {'value': '', 'unit': 'Hours'},
                'macBinding': False,
            },
            'pppoe': {
                'enabled': False,
                'downloadSpeed': {'value': '', 'unit': 'Mbps'},
                'uploadSpeed': {'value': '', 'unit': 'Mbps'},
                'dataLimit': {'value': '', 'unit': 'GB'},
                'usageLimit': {'value': '', 'unit': 'Hours'},
                'bandwidthLimit': 0,
                'maxDevices': 1,
                'sessionTimeout': 86400,
                'idleTimeout': 300,
                'validityPeriod': {'value': '', 'unit': 'Hours'},
                'macBinding': False,
                'ipPool': 'pppoe-pool-1',
                'serviceName': '',
                'mtu': 1492,
                'dnsServers': ['8.8.8.8', '1.1.1.1'],
            }
        }

    def increment_usage(self):
        """Increment the usage count for this template"""
        self.usage_count += 1
        self.save(update_fields=['usage_count'])

    def has_enabled_access_methods(self):
        """Check if at least one access method is enabled"""
        return any(
            method_config.get('enabled', False) 
            for method_config in self.access_methods.values()
        )

    def get_enabled_access_methods(self):
        """Return list of enabled access methods"""
        return [
            method for method, config in self.access_methods.items() 
            if config.get('enabled', False)
        ]

    def get_access_type(self):
        """Determine primary access type based on enabled methods"""
        enabled_methods = self.get_enabled_access_methods()
        if 'hotspot' in enabled_methods:
            return 'hotspot'
        elif 'pppoe' in enabled_methods:
            return 'pppoe'
        return None

    def __str__(self):
        return f"{self.name} Template - {self.category}"

    class Meta:
        ordering = ['name']
        verbose_name = 'Plan Template'
        verbose_name_plural = 'Plan Templates'
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['category']),
            models.Index(fields=['is_public']),
            models.Index(fields=['is_active']),
            models.Index(fields=['created_at']),
        ]


class InternetPlan(models.Model):
    """
    Enhanced Internet Plan model with complete dual access methods support.
    """

    PLAN_TYPES = (
        ('Paid', 'Paid'),
        ('Free Trial', 'Free Trial'),
    )
    
    CATEGORIES = (
        ('Residential', 'Residential'),
        ('Business', 'Business'),
        ('Promotional', 'Promotional'),
        ('Enterprise', 'Enterprise'),
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

    # Core Plan Information
    plan_type = models.CharField(
        max_length=20,
        choices=PLAN_TYPES,
        default='Paid',
        help_text="Whether the plan is paid or a free trial"
    )
    
    name = models.CharField(
        max_length=100,
        unique=True,
        help_text="Unique name identifying the plan"
    )
    
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0'))],
        help_text="Cost of the plan in Ksh. Must be 0 for Free Trial plans"
    )
    
    active = models.BooleanField(
        default=True,
        help_text="Whether the plan is currently available for purchase"
    )

    category = models.CharField(
        max_length=20,
        choices=CATEGORIES,
        default='Residential',
        help_text="Target audience for this plan"
    )

    description = models.TextField(
        blank=True,
        default="",
        help_text="Detailed description of the plan features"
    )

    # Template reference (optional)
    template = models.ForeignKey(
        PlanTemplate,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_plans',
        help_text="Template used to create this plan"
    )

    # Access Methods Configuration (Hotspot & PPPoE)
    access_methods = models.JSONField(
        default=dict,
        help_text="Configuration for Hotspot and PPPoE access methods"
    )

    # Advanced Settings
    priority_level = models.IntegerField(
        choices=PRIORITY_LEVELS,
        default=4,
        help_text="Quality of Service priority level"
    )

    router_specific = models.BooleanField(
        default=False,
        help_text="If enabled, this plan can only be used on selected routers"
    )
    
    allowed_routers = models.ManyToManyField(
        'network_management.Router',
        blank=True,
        help_text="Routers where this plan can be activated (if router-specific)"
    )

    # Fair Usage Policy
    FUP_policy = models.TextField(
        blank=True,
        default="",
        help_text="Fair Usage Policy description for this plan"
    )
    
    FUP_threshold = models.PositiveIntegerField(
        default=80,
        validators=[MinValueValidator(1), MaxValueValidator(100)],
        help_text="Usage percentage threshold after which speed may be reduced"
    )

    # Statistics
    purchases = models.PositiveIntegerField(
        default=0,
        help_text="Number of times this plan has been purchased"
    )

    # Metadata
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Date and time when this plan was created"
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="Date and time when this plan was last updated"
    )
    
    client_sessions = models.JSONField(
        default=dict,
        blank=True,
        help_text="Tracking data for client sessions using this plan"
    )

    def clean(self):
        """Enhanced validation for plan data"""
        # Free Trial constraints
        if self.plan_type == 'Free Trial':
            if self.price != Decimal('0'):
                raise ValidationError({'price': 'Free Trial plans must have price set to 0'})
            if self.router_specific:
                raise ValidationError({'router_specific': 'Free Trial plans cannot be router-specific'})
            if self.priority_level > 4:
                raise ValidationError({'priority_level': 'Free Trial plans cannot have premium priority levels'})

        # Validate access methods structure
        if not isinstance(self.access_methods, dict):
            raise ValidationError({'access_methods': 'Access methods must be a dictionary'})
        
        for method in ['hotspot', 'pppoe']:
            if method not in self.access_methods:
                raise ValidationError({'access_methods': f'Missing {method} configuration'})
            
            config = self.access_methods[method]
            if not isinstance(config, dict):
                raise ValidationError({'access_methods': f'{method} configuration must be a dictionary'})
            
            # Validate required fields for enabled methods
            if config.get('enabled', False):
                required_fields = ['downloadSpeed', 'uploadSpeed', 'dataLimit', 'usageLimit']
                for field in required_fields:
                    if field not in config:
                        raise ValidationError({'access_methods': f'Missing {field} for enabled {method}'})
                    
                    field_config = config[field]
                    if not isinstance(field_config, dict):
                        raise ValidationError({'access_methods': f'{method}.{field} must be a dictionary'})
                    
                    if 'value' not in field_config:
                        raise ValidationError({'access_methods': f'{method}.{field}.value is required'})

        # Ensure at least one access method is enabled
        if not self.has_enabled_access_methods():
            raise ValidationError({'access_methods': 'At least one access method must be enabled'})

    def save(self, *args, **kwargs):
        """Override save to run full validation and set default access methods"""
        if not self.access_methods:
            self.set_default_access_methods()
        
        self.full_clean()
        super().save(*args, **kwargs)

    def set_default_access_methods(self):
        """Set comprehensive default access methods structure"""
        self.access_methods = {
            'hotspot': {
                'enabled': True,
                'downloadSpeed': {'value': '', 'unit': 'Mbps'},
                'uploadSpeed': {'value': '', 'unit': 'Mbps'},
                'dataLimit': {'value': '', 'unit': 'GB'},
                'usageLimit': {'value': '', 'unit': 'Hours'},
                'bandwidthLimit': 0,
                'maxDevices': 1,
                'sessionTimeout': 86400,
                'idleTimeout': 300,
                'validityPeriod': {'value': '', 'unit': 'Hours'},
                'macBinding': False,
            },
            'pppoe': {
                'enabled': False,
                'downloadSpeed': {'value': '', 'unit': 'Mbps'},
                'uploadSpeed': {'value': '', 'unit': 'Mbps'},
                'dataLimit': {'value': '', 'unit': 'GB'},
                'usageLimit': {'value': '', 'unit': 'Hours'},
                'bandwidthLimit': 0,
                'maxDevices': 1,
                'sessionTimeout': 86400,
                'idleTimeout': 300,
                'validityPeriod': {'value': '', 'unit': 'Hours'},
                'macBinding': False,
                'ipPool': 'pppoe-pool-1',
                'serviceName': '',
                'mtu': 1492,
                'dnsServers': ['8.8.8.8', '1.1.1.1'],
            }
        }

    def create_from_template(self, template):
        """Create a plan from a template with proper access method mapping"""
        self.name = template.name
        self.category = template.category
        self.price = template.base_price
        self.description = template.description
        self.access_methods = template.access_methods
        self.template = template
        
        # Set plan type based on price
        if template.base_price > 0:
            self.plan_type = 'Paid'
        else:
            self.plan_type = 'Free Trial'
        
        # Increment template usage count
        template.increment_usage()

    def has_enabled_access_methods(self):
        """Check if at least one access method is enabled"""
        return any(
            method_config.get('enabled', False) 
            for method_config in self.access_methods.values()
        )

    def get_enabled_access_methods(self):
        """Return list of enabled access methods"""
        return [
            method for method, config in self.access_methods.items() 
            if config.get('enabled', False)
        ]

    def get_access_type(self):
        """Determine primary access type based on enabled methods"""
        enabled_methods = self.get_enabled_access_methods()
        if 'hotspot' in enabled_methods:
            return 'hotspot'
        elif 'pppoe' in enabled_methods:
            return 'pppoe'
        return None

    def can_be_used_on_router(self, router_id):
        """Check if this plan can be used on the specified router"""
        if not self.router_specific:
            return True
        return self.allowed_routers.filter(id=router_id).exists()

    def increment_purchases(self):
        """Increment the purchase count for this plan"""
        self.purchases += 1
        self.save(update_fields=['purchases'])

    def __str__(self):
        return f"{self.name} ({self.plan_type}) - {self.price} Ksh"

    class Meta:
        ordering = ['name']
        verbose_name = 'Internet Plan'
        verbose_name_plural = 'Internet Plans'
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['category']),
            models.Index(fields=['plan_type']),
            models.Index(fields=['active']),
            models.Index(fields=['price']),
            models.Index(fields=['created_at']),
            models.Index(fields=['template']),
        ]


class Subscription(models.Model):
    """
    Enhanced Subscription model with comprehensive access method support.
    """

    STATUS_CHOICES = (
        ('active', 'Active'),
        ('expired', 'Expired'),
        ('suspended', 'Suspended'),
        ('cancelled', 'Cancelled'),
    )

    ACCESS_METHOD_CHOICES = (
        ('hotspot', 'Hotspot'),
        ('pppoe', 'PPPoE'),
    )

    client = models.ForeignKey(
        'account.Client',
        on_delete=models.CASCADE,
        related_name='subscriptions'
    )
    internet_plan = models.ForeignKey(
        InternetPlan,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='subscriptions'
    )
    router = models.ForeignKey(
        'network_management.Router',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='subscriptions',
        help_text="Router where this subscription is active"
    )
    transaction = models.ForeignKey(
        'payments.Transaction',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='subscriptions'
    )
    
    # Access method specific to this subscription
    access_method = models.CharField(
        max_length=10,
        choices=ACCESS_METHOD_CHOICES,
        default='hotspot',
        help_text="Access method used for this subscription"
    )
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='active'
    )
    mac_address = models.CharField(
        max_length=17,
        blank=True,
        null=True,
        help_text="MAC address of the device using this subscription"
    )
    start_date = models.DateTimeField(auto_now_add=True)
    end_date = models.DateTimeField()
    remaining_data = models.BigIntegerField(
        default=0,
        help_text="Remaining data in bytes"
    )
    remaining_time = models.PositiveIntegerField(
        default=0,
        help_text="Remaining time in seconds"
    )
    data_used = models.BigIntegerField(
        default=0,
        help_text="Total data used in bytes"
    )
    time_used = models.PositiveIntegerField(
        default=0,
        help_text="Total time used in seconds"
    )
    last_activity = models.DateTimeField(
        auto_now=True,
        help_text="Last time this subscription was active"
    )
    is_active = models.BooleanField(default=True)

    def clean(self):
        """Enhanced validation for subscriptions"""
        if self.end_date <= timezone.now():
            raise ValidationError("End date must be in the future.")
        
        if self.internet_plan:
            access_methods = self.internet_plan.get_enabled_access_methods()
            if self.access_method not in access_methods:
                raise ValidationError(
                    f"Selected access method '{self.access_method}' is not enabled for this plan"
                )

    def update_usage(self, data_used, time_used):
        """Enhanced usage tracking with access method specific limits"""
        self.data_used += data_used
        self.time_used += time_used
        
        if self.internet_plan:
            method_config = self.internet_plan.access_methods.get(self.access_method, {})
            
            # Check data limits
            data_limit = method_config.get('dataLimit', {})
            if data_limit.get('value', '').lower() != 'unlimited':
                self.remaining_data -= data_used
                if self.remaining_data < 0:
                    self.remaining_data = 0
                    self.status = 'suspended'
            
            # Check time limits
            usage_limit = method_config.get('usageLimit', {})
            if usage_limit.get('value', '').lower() != 'unlimited':
                self.remaining_time -= time_used
                if self.remaining_time < 0:
                    self.remaining_time = 0
                    self.status = 'suspended'
        
        self.last_activity = timezone.now()
        self.save()

    def get_remaining_data_display(self):
        """Return formatted remaining data"""
        if self.internet_plan:
            method_config = self.internet_plan.access_methods.get(self.access_method, {})
            data_limit = method_config.get('dataLimit', {})
            if data_limit.get('value', '').lower() == 'unlimited':
                return "Unlimited"
        
        bytes_val = self.remaining_data
        if bytes_val >= 1024 ** 3:  # GB
            return f"{(bytes_val / (1024 ** 3)):.2f} GB"
        elif bytes_val >= 1024 ** 2:  # MB
            return f"{(bytes_val / (1024 ** 2)):.2f} MB"
        elif bytes_val >= 1024:  # KB
            return f"{(bytes_val / 1024):.2f} KB"
        else:
            return f"{bytes_val} B"

    def get_remaining_time_display(self):
        """Return formatted remaining time"""
        if self.internet_plan:
            method_config = self.internet_plan.access_methods.get(self.access_method, {})
            usage_limit = method_config.get('usageLimit', {})
            if usage_limit.get('value', '').lower() == 'unlimited':
                return "Unlimited"
        
        seconds = self.remaining_time
        if seconds >= 3600:  # Hours
            hours = seconds // 3600
            minutes = (seconds % 3600) // 60
            return f"{hours}h {minutes}m"
        elif seconds >= 60:  # Minutes
            minutes = seconds // 60
            return f"{minutes}m"
        else:
            return f"{seconds}s"

    def __str__(self):
        return f"Subscription for {self.client.user.username if self.client else 'Unknown'} - {self.internet_plan.name if self.internet_plan else 'No Plan'} ({self.access_method})"

    class Meta:
        verbose_name = 'Subscription'
        verbose_name_plural = 'Subscriptions'
        ordering = ['-start_date']
        indexes = [
            models.Index(fields=['client', 'start_date']),
            models.Index(fields=['internet_plan']),
            models.Index(fields=['is_active']),
            models.Index(fields=['status']),
            models.Index(fields=['mac_address']),
            models.Index(fields=['router']),
            models.Index(fields=['access_method']),
        ]