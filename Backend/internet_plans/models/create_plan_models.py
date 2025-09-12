


# from django.db import models
# from django.core.validators import MinValueValidator
# from django.core.exceptions import ValidationError
# from django.utils import timezone
# from decimal import Decimal, InvalidOperation

# class InternetPlan(models.Model):
#     """
#     Represents an internet service plan with various specifications and attributes.
#     Includes validation to ensure data consistency between plan type and pricing.
#     All monetary values use Decimal for precise financial calculations.
#     """

#     # Choice tuples for constrained fields
#     PLAN_TYPES = (
#         ('Paid', 'Paid'),
#         ('Free Trial', 'Free Trial'),
#     )
    
#     CATEGORIES = (
#         ('Residential', 'Residential'),
#         ('Business', 'Business'),
#         ('Promotional', 'Promotional'),
#         ('Enterprise', 'Enterprise'),
#     )
    
#     SPEED_UNITS = (
#         ('Kbps', 'Kilobits per second'),
#         ('Mbps', 'Megabits per second'),
#         ('Gbps', 'Gigabits per second'),
#     )
    
#     EXPIRY_UNITS = (
#         ('Days', 'Days'),
#         ('Months', 'Months'),
#     )
    
#     DATA_UNITS = (
#         ('GB', 'Gigabytes'),
#         ('TB', 'Terabytes'),
#         ('Unlimited', 'Unlimited'),
#     )
    
#     USAGE_UNITS = (
#         ('Hours', 'Hours'),
#         ('Unlimited', 'Unlimited'),
#     )

#     # Core Plan Information
#     plan_type = models.CharField(
#         max_length=20,
#         choices=PLAN_TYPES,
#         default='Paid',
#         help_text="Whether the plan is paid or a free trial"
#     )
    
#     name = models.CharField(
#         max_length=100,
#         unique=True,
#         help_text="Unique name identifying the plan"
#     )
    
#     price = models.DecimalField(
#         max_digits=10,
#         decimal_places=2,
#         default=Decimal('0.00'),
#         validators=[MinValueValidator(Decimal('0'))],
#         help_text="Cost of the plan in Ksh. Must be 0 for Free Trial plans"
#     )
    
#     active = models.BooleanField(
#         default=True,
#         help_text="Whether the plan is currently available for purchase"
#     )
    
#     # Speed Specifications
#     download_speed_value = models.DecimalField(
#         max_digits=10,
#         decimal_places=2,
#         default=Decimal('0.00'),
#         validators=[MinValueValidator(Decimal('0'))],
#         help_text="Numerical value of download speed (e.g., 10.00)"
#     )
    
#     download_speed_unit = models.CharField(
#         max_length=10,
#         choices=SPEED_UNITS,
#         default='Mbps',
#         help_text="Unit of measurement for download speed"
#     )
    
#     upload_speed_value = models.DecimalField(
#         max_digits=10,
#         decimal_places=2,
#         default=Decimal('0.00'),
#         validators=[MinValueValidator(Decimal('0'))],
#         help_text="Numerical value of upload speed (e.g., 2.00)"
#     )
    
#     upload_speed_unit = models.CharField(
#         max_length=10,
#         choices=SPEED_UNITS,
#         default='Mbps',
#         help_text="Unit of measurement for upload speed"
#     )
    
#     # Plan Duration
#     expiry_value = models.PositiveIntegerField(
#         validators=[MinValueValidator(1)],
#         help_text="Duration after which plan expires (e.g., 30)"
#     )
    
#     expiry_unit = models.CharField(
#         max_length=10,
#         choices=EXPIRY_UNITS,
#         default='Days',
#         help_text="Unit of measurement for plan duration"
#     )
    
#     # Data Allowance
#     data_limit_value = models.CharField(
#         max_length=20,
#         help_text="Amount of data included in the plan (numeric or 'Unlimited')"
#     )
    
#     data_limit_unit = models.CharField(
#         max_length=10,
#         choices=DATA_UNITS,
#         default='GB',
#         help_text="Unit of measurement for data allowance"
#     )
    
#     # Usage Limits
#     usage_limit_value = models.CharField(
#         max_length=20,
#         help_text="Maximum usage time allowed (numeric or 'Unlimited')"
#     )
    
#     usage_limit_unit = models.CharField(
#         max_length=10,
#         choices=USAGE_UNITS,
#         default='Hours',
#         help_text="Unit of measurement for usage time"
#     )
    
#     # Descriptive Fields
#     description = models.TextField(
#         help_text="Detailed description of the plan features"
#     )
    
#     category = models.CharField(
#         max_length=20,
#         choices=CATEGORIES,
#         default='Residential',
#         help_text="Target audience for this plan"
#     )
    
#     # Statistics
#     purchases = models.PositiveIntegerField(
#         default=0,
#         help_text="Number of times this plan has been purchased"
#     )
    
#     # Plan Features and Restrictions
#     features = models.JSONField(
#         default=list,
#         blank=True,
#         help_text="List of features included in this plan"
#     )
    
#     restrictions = models.JSONField(
#         default=list,
#         blank=True,
#         help_text="List of restrictions applied to this plan"
#     )
    
#     # Metadata
#     created_at = models.DateTimeField(
#         auto_now_add=True,
#         help_text="Date and time when this plan was created"
#     )
    
#     updated_at = models.DateTimeField(
#         auto_now=True,
#         help_text="Date and time when this plan was last updated"
#     )
    
#     client_sessions = models.JSONField(
#         default=dict,
#         blank=True,
#         help_text="Tracking data for client sessions using this plan"
#     )

#     def clean(self):
#         """
#         Custom validation to ensure:
#         - Free Trial plans have price = 0
#         - Speed values are positive numbers
#         - Data and usage limit values are either numeric or 'Unlimited'
#         - If unit is 'Unlimited', value must be 'Unlimited'
#         """
#         # Validate Free Trial price
#         if self.plan_type == 'Free Trial' and self.price != Decimal('0'):
#             raise ValidationError({
#                 'price': 'Free Trial plans must have price set to 0'
#             })

#         # Validate speed values
#         if self.download_speed_value <= Decimal('0'):
#             raise ValidationError({
#                 'download_speed_value': 'Download speed must be greater than 0'
#             })
#         if self.upload_speed_value <= Decimal('0'):
#             raise ValidationError({
#                 'upload_speed_value': 'Upload speed must be greater than 0'
#             })

#         # Validate data_limit_value and usage_limit_value
#         for field_value, field_unit in [('data_limit_value', 'data_limit_unit'), ('usage_limit_value', 'usage_limit_unit')]:
#             value = getattr(self, field_value)
#             unit = getattr(self, field_unit)
#             if unit == 'Unlimited' and value.lower() != 'unlimited':
#                 raise ValidationError({
#                     field_value: f'{field_value} must be "Unlimited" when unit is Unlimited'
#                 })
#             if value.lower() != 'unlimited':
#                 try:
#                     decimal_value = Decimal(value)
#                     if decimal_value <= Decimal('0'):
#                         raise ValidationError({
#                             field_value: f'{field_value} must be a positive number or "Unlimited"'
#                         })
#                 except (ValueError, InvalidOperation):
#                     raise ValidationError({
#                         field_value: f'{field_value} must be a number or "Unlimited"'
#                     })

#     def save(self, *args, **kwargs):
#         """Override save to run full validation"""
#         self.full_clean()
#         super().save(*args, **kwargs)

#     def __str__(self):
#         return f"{self.name} ({self.plan_type}) - {self.price} Ksh"

#     class Meta:
#         ordering = ['name']
#         verbose_name = 'Internet Plan'
#         verbose_name_plural = 'Internet Plans'
#         indexes = [
#             models.Index(fields=['name']),
#             models.Index(fields=['category']),
#             models.Index(fields=['plan_type']),
#             models.Index(fields=['active']),
#             models.Index(fields=['price']),
#             models.Index(fields=['created_at']),
#         ]

# class Subscription(models.Model):
#     client = models.ForeignKey(
#         'account.Client',
#         on_delete=models.CASCADE,
#         related_name='subscriptions'
#     )
#     internet_plan = models.ForeignKey(
#         InternetPlan,
#         on_delete=models.SET_NULL,
#         null=True,
#         blank=True,
#         related_name='subscriptions'
#     )
#     transaction = models.ForeignKey(
#         'payments.Transaction',
#         on_delete=models.SET_NULL,
#         null=True,
#         blank=True,
#         related_name='subscriptions'
#     )
#     is_active = models.BooleanField(default=True)
#     start_date = models.DateTimeField(auto_now_add=True)
#     end_date = models.DateTimeField()

#     def __str__(self):
#         return f"Subscription for {self.client.user.name or self.client.user.phonenumber} ({self.internet_plan.name if self.internet_plan else 'No Plan'})"

#     def clean(self):
#         """Ensure end_date is after start_date"""
#         if self.end_date <= timezone.now():
#             raise ValidationError("End date must be in the future.")

#     class Meta:
#         verbose_name = 'Subscription'
#         verbose_name_plural = 'Subscriptions'
#         ordering = ['-start_date']
#         indexes = [
#             models.Index(fields=['client', 'start_date']),
#             models.Index(fields=['internet_plan']),
#             models.Index(fields=['is_active']),
#         ]










# from django.db import models
# from django.core.validators import MinValueValidator, MaxValueValidator
# from django.core.exceptions import ValidationError
# from django.utils import timezone
# from decimal import Decimal, InvalidOperation

# class InternetPlan(models.Model):
#     """
#     Represents an internet service plan with various specifications and attributes.
#     Includes validation to ensure data consistency between plan type and pricing.
#     All monetary values use Decimal for precise financial calculations.
#     """

#     # Choice tuples for constrained fields
#     PLAN_TYPES = (
#         ('Paid', 'Paid'),
#         ('Free Trial', 'Free Trial'),
#     )
    
#     CATEGORIES = (
#         ('Residential', 'Residential'),
#         ('Business', 'Business'),
#         ('Promotional', 'Promotional'),
#         ('Enterprise', 'Enterprise'),
#     )
    
#     SPEED_UNITS = (
#         ('Kbps', 'Kilobits per second'),
#         ('Mbps', 'Megabits per second'),
#         ('Gbps', 'Gigabits per second'),
#     )
    
#     EXPIRY_UNITS = (
#         ('Days', 'Days'),
#         ('Months', 'Months'),
#     )
    
#     DATA_UNITS = (
#         ('GB', 'Gigabytes'),
#         ('TB', 'Terabytes'),
#         ('Unlimited', 'Unlimited'),
#     )
    
#     USAGE_UNITS = (
#         ('Hours', 'Hours'),
#         ('Unlimited', 'Unlimited'),
#     )
    
#     PRIORITY_LEVELS = (
#         (1, 'Lowest'),
#         (2, 'Low'),
#         (3, 'Medium'),
#         (4, 'High'),
#         (5, 'Highest'),
#         (6, 'Critical'),
#         (7, 'Premium'),
#         (8, 'VIP'),
#     )

#     # Core Plan Information
#     plan_type = models.CharField(
#         max_length=20,
#         choices=PLAN_TYPES,
#         default='Paid',
#         help_text="Whether the plan is paid or a free trial"
#     )
    
#     name = models.CharField(
#         max_length=100,
#         unique=True,
#         help_text="Unique name identifying the plan"
#     )
    
#     price = models.DecimalField(
#         max_digits=10,
#         decimal_places=2,
#         default=Decimal('0.00'),
#         validators=[MinValueValidator(Decimal('0'))],
#         help_text="Cost of the plan in Ksh. Must be 0 for Free Trial plans"
#     )
    
#     active = models.BooleanField(
#         default=True,
#         help_text="Whether the plan is currently available for purchase"
#     )
    
#     # Speed Specifications
#     download_speed_value = models.DecimalField(
#         max_digits=10,
#         decimal_places=2,
#         default=Decimal('0.00'),
#         validators=[MinValueValidator(Decimal('0'))],
#         help_text="Numerical value of download speed (e.g., 10.00)"
#     )
    
#     download_speed_unit = models.CharField(
#         max_length=10,
#         choices=SPEED_UNITS,
#         default='Mbps',
#         help_text="Unit of measurement for download speed"
#     )
    
#     upload_speed_value = models.DecimalField(
#         max_digits=10,
#         decimal_places=2,
#         default=Decimal('0.00'),
#         validators=[MinValueValidator(Decimal('0'))],
#         help_text="Numerical value of upload speed (e.g., 2.00)"
#     )
    
#     upload_speed_unit = models.CharField(
#         max_length=10,
#         choices=SPEED_UNITS,
#         default='Mbps',
#         help_text="Unit of measurement for upload speed"
#     )
    
#     # Bandwidth limit for router configuration (in kbps)
#     bandwidth_limit = models.PositiveIntegerField(
#         default=0,
#         help_text="Bandwidth limit in kbps for router configuration (0 = unlimited)"
#     )
    
#     # Plan Duration
#     expiry_value = models.PositiveIntegerField(
#         validators=[MinValueValidator(1)],
#         help_text="Duration after which plan expires (e.g., 30)"
#     )
    
#     expiry_unit = models.CharField(
#         max_length=10,
#         choices=EXPIRY_UNITS,
#         default='Days',
#         help_text="Unit of measurement for plan duration"
#     )
    
#     # Data Allowance
#     data_limit_value = models.CharField(
#         max_length=20,
#         help_text="Amount of data included in the plan (numeric or 'Unlimited')"
#     )
    
#     data_limit_unit = models.CharField(
#         max_length=10,
#         choices=DATA_UNITS,
#         default='GB',
#         help_text="Unit of measurement for data allowance"
#     )
    
#     # Usage Limits
#     usage_limit_value = models.CharField(
#         max_length=20,
#         help_text="Maximum usage time allowed (numeric or 'Unlimited')"
#     )
    
#     usage_limit_unit = models.CharField(
#         max_length=10,
#         choices=USAGE_UNITS,
#         default='Hours',
#         help_text="Unit of measurement for usage time"
#     )
    
#     # Concurrent connections limit
#     concurrent_connections = models.PositiveIntegerField(
#         default=1,
#         help_text="Maximum number of simultaneous connections allowed"
#     )
    
#     # Priority level for QoS
#     priority_level = models.IntegerField(
#         choices=PRIORITY_LEVELS,
#         default=4,
#         help_text="Quality of Service priority level (higher = better service)"
#     )
    
#     # Router-specific settings
#     router_specific = models.BooleanField(
#         default=False,
#         help_text="If enabled, this plan can only be used on selected routers"
#     )
    
#     allowed_routers = models.ManyToManyField(
#         'network_management.Router',
#         blank=True,
#         help_text="Routers where this plan can be activated (if router-specific)"
#     )
    
#     # Fair Usage Policy
#     FUP_policy = models.TextField(
#         blank=True,
#         default="",
#         help_text="Fair Usage Policy description for this plan"
#     )
    
#     FUP_threshold = models.PositiveIntegerField(
#         default=80,
#         validators=[MinValueValidator(1), MaxValueValidator(100)],
#         help_text="Usage percentage threshold after which speed may be reduced"
#     )
    
#     # Descriptive Fields
#     description = models.TextField(
#         help_text="Detailed description of the plan features"
#     )
    
#     category = models.CharField(
#         max_length=20,
#         choices=CATEGORIES,
#         default='Residential',
#         help_text="Target audience for this plan"
#     )
    
#     # Statistics
#     purchases = models.PositiveIntegerField(
#         default=0,
#         help_text="Number of times this plan has been purchased"
#     )
    
#     # Plan Features and Restrictions
#     features = models.JSONField(
#         default=list,
#         blank=True,
#         help_text="List of features included in this plan"
#     )
    
#     restrictions = models.JSONField(
#         default=list,
#         blank=True,
#         help_text="List of restrictions applied to this plan"
#     )
    
#     # Metadata
#     created_at = models.DateTimeField(
#         auto_now_add=True,
#         help_text="Date and time when this plan was created"
#     )
    
#     updated_at = models.DateTimeField(
#         auto_now=True,
#         help_text="Date and time when this plan was last updated"
#     )
    
#     client_sessions = models.JSONField(
#         default=dict,
#         blank=True,
#         help_text="Tracking data for client sessions using this plan"
#     )

#     def clean(self):
#         """
#         Custom validation to ensure:
#         - Free Trial plans have price = 0
#         - Speed values are positive numbers
#         - Data and usage limit values are either numeric or 'Unlimited'
#         - If unit is 'Unlimited', value must be 'Unlimited'
#         """
#         # Validate Free Trial price
#         if self.plan_type == 'Free Trial' and self.price != Decimal('0'):
#             raise ValidationError({
#                 'price': 'Free Trial plans must have price set to 0'
#             })

#         # Validate speed values
#         if self.download_speed_value <= Decimal('0'):
#             raise ValidationError({
#                 'download_speed_value': 'Download speed must be greater than 0'
#             })
#         if self.upload_speed_value <= Decimal('0'):
#             raise ValidationError({
#                 'upload_speed_value': 'Upload speed must be greater than 0'
#             })

#         # Validate data_limit_value and usage_limit_value
#         for field_value, field_unit in [('data_limit_value', 'data_limit_unit'), ('usage_limit_value', 'usage_limit_unit')]:
#             value = getattr(self, field_value)
#             unit = getattr(self, field_unit)
#             if unit == 'Unlimited' and value.lower() != 'unlimited':
#                 raise ValidationError({
#                     field_value: f'{field_value} must be "Unlimited" when unit is Unlimited'
#                 })
#             if value.lower() != 'unlimited':
#                 try:
#                     decimal_value = Decimal(value)
#                     if decimal_value <= Decimal('0'):
#                         raise ValidationError({
#                             field_value: f'{field_value} must be a positive number or "Unlimited"'
#                         })
#                 except (ValueError, InvalidOperation):
#                     raise ValidationError({
#                         field_value: f'{field_value} must be a number or "Unlimited"'
#                     })

#     def get_bandwidth_limit_display(self):
#         """Return formatted bandwidth limit for display"""
#         if self.bandwidth_limit == 0:
#             return "Unlimited"
#         elif self.bandwidth_limit >= 1000:
#             return f"{self.bandwidth_limit / 1000} Mbps"
#         else:
#             return f"{self.bandwidth_limit} Kbps"

#     def is_unlimited_data(self):
#         """Check if plan has unlimited data"""
#         return self.data_limit_value.lower() == 'unlimited' or self.data_limit_unit.lower() == 'unlimited'

#     def is_unlimited_time(self):
#         """Check if plan has unlimited time"""
#         return self.usage_limit_value.lower() == 'unlimited' or self.usage_limit_unit.lower() == 'unlimited'

#     def save(self, *args, **kwargs):
#         """Override save to run full validation"""
#         self.full_clean()
#         super().save(*args, **kwargs)

#     def __str__(self):
#         return f"{self.name} ({self.plan_type}) - {self.price} Ksh"

#     class Meta:
#         ordering = ['name']
#         verbose_name = 'Internet Plan'
#         verbose_name_plural = 'Internet Plans'
#         indexes = [
#             models.Index(fields=['name']),
#             models.Index(fields=['category']),
#             models.Index(fields=['plan_type']),
#             models.Index(fields=['active']),
#             models.Index(fields=['price']),
#             models.Index(fields=['created_at']),
#             models.Index(fields=['bandwidth_limit']),
#             models.Index(fields=['priority_level']),
#         ]


# class Subscription(models.Model):
#     STATUS_CHOICES = (
#         ('active', 'Active'),
#         ('expired', 'Expired'),
#         ('suspended', 'Suspended'),
#         ('cancelled', 'Cancelled'),
#     )

#     client = models.ForeignKey(
#         'account.Client',
#         on_delete=models.CASCADE,
#         related_name='subscriptions'
#     )
#     internet_plan = models.ForeignKey(
#         InternetPlan,
#         on_delete=models.SET_NULL,
#         null=True,
#         blank=True,
#         related_name='subscriptions'
#     )
#     router = models.ForeignKey(
#         'network_management.Router',
#         on_delete=models.SET_NULL,
#         null=True,
#         blank=True,
#         related_name='subscriptions',
#         help_text="Router where this subscription is active"
#     )
#     transaction = models.ForeignKey(
#         'payments.Transaction',
#         on_delete=models.SET_NULL,
#         null=True,
#         blank=True,
#         related_name='subscriptions'
#     )
#     status = models.CharField(
#         max_length=20,
#         choices=STATUS_CHOICES,
#         default='active'
#     )
#     mac_address = models.CharField(
#         max_length=17,
#         blank=True,
#         null=True,
#         help_text="MAC address of the device using this subscription"
#     )
#     start_date = models.DateTimeField(auto_now_add=True)
#     end_date = models.DateTimeField()
#     remaining_data = models.BigIntegerField(
#         default=0,
#         help_text="Remaining data in bytes"
#     )
#     remaining_time = models.PositiveIntegerField(
#         default=0,
#         help_text="Remaining time in seconds"
#     )
#     data_used = models.BigIntegerField(
#         default=0,
#         help_text="Total data used in bytes"
#     )
#     time_used = models.PositiveIntegerField(
#         default=0,
#         help_text="Total time used in seconds"
#     )
#     last_activity = models.DateTimeField(
#         auto_now=True,
#         help_text="Last time this subscription was active"
#     )
#     is_active = models.BooleanField(default=True)

#     def __str__(self):
#         return f"Subscription for {self.client.user.name or self.client.user.phonenumber} ({self.internet_plan.name if self.internet_plan else 'No Plan'})"

#     def clean(self):
#         """Ensure end_date is after start_date"""
#         if self.end_date <= timezone.now():
#             raise ValidationError("End date must be in the future.")

#     def update_usage(self, data_used, time_used):
#         """Update usage statistics for this subscription"""
#         self.data_used += data_used
#         self.time_used += time_used
        
#         if not self.internet_plan.is_unlimited_data():
#             self.remaining_data -= data_used
#             if self.remaining_data < 0:
#                 self.remaining_data = 0
#                 self.status = 'suspended'
        
#         if not self.internet_plan.is_unlimited_time():
#             self.remaining_time -= time_used
#             if self.remaining_time < 0:
#                 self.remaining_time = 0
#                 self.status = 'suspended'
        
#         self.last_activity = timezone.now()
#         self.save()

#     def get_remaining_data_display(self):
#         """Return formatted remaining data"""
#         if self.internet_plan.is_unlimited_data():
#             return "Unlimited"
        
#         bytes = self.remaining_data
#         if bytes >= 1024 ** 3:  # GB
#             return f"{(bytes / (1024 ** 3)):.2f} GB"
#         elif bytes >= 1024 ** 2:  # MB
#             return f"{(bytes / (1024 ** 2)):.2f} MB"
#         elif bytes >= 1024:  # KB
#             return f"{(bytes / 1024):.2f} KB"
#         else:
#             return f"{bytes} B"

#     def get_remaining_time_display(self):
#         """Return formatted remaining time"""
#         if self.internet_plan.is_unlimited_time():
#             return "Unlimited"
        
#         seconds = self.remaining_time
#         if seconds >= 3600:  # Hours
#             hours = seconds // 3600
#             minutes = (seconds % 3600) // 60
#             return f"{hours}h {minutes}m"
#         elif seconds >= 60:  # Minutes
#             minutes = seconds // 60
#             return f"{minutes}m"
#         else:
#             return f"{seconds}s"

#     class Meta:
#         verbose_name = 'Subscription'
#         verbose_name_plural = 'Subscriptions'
#         ordering = ['-start_date']
#         indexes = [
#             models.Index(fields=['client', 'start_date']),
#             models.Index(fields=['internet_plan']),
#             models.Index(fields=['is_active']),
#             models.Index(fields=['status']),
#             models.Index(fields=['mac_address']),
#             models.Index(fields=['router']),
#         ]





from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError
from django.utils import timezone
from decimal import Decimal, InvalidOperation


class InternetPlan(models.Model):
    """
    Represents an internet service plan with various specifications and attributes.
    Includes validation to ensure data consistency between plan type and pricing.
    All monetary values use Decimal for precise financial calculations.
    """

    # Choice tuples for constrained fields
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
    
    SPEED_UNITS = (
        ('Kbps', 'Kilobits per second'),
        ('Mbps', 'Megabits per second'),
        ('Gbps', 'Gigabits per second'),
    )
    
    EXPIRY_UNITS = (
        ('Days', 'Days'),
        ('Months', 'Months'),
    )
    
    DATA_UNITS = (
        ('GB', 'Gigabytes'),
        ('TB', 'Terabytes'),
        ('Unlimited', 'Unlimited'),
    )
    
    USAGE_UNITS = (
        ('Hours', 'Hours'),
        ('Unlimited', 'Unlimited'),
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

    # Speed Specifications
    download_speed_value = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0'))],
        help_text="Numerical value of download speed (e.g., 10.00)"
    )
    
    download_speed_unit = models.CharField(
        max_length=10,
        choices=SPEED_UNITS,
        default='Mbps',
        help_text="Unit of measurement for download speed"
    )
    
    upload_speed_value = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0'))],
        help_text="Numerical value of upload speed (e.g., 2.00)"
    )
    
    upload_speed_unit = models.CharField(
        max_length=10,
        choices=SPEED_UNITS,
        default='Mbps',
        help_text="Unit of measurement for upload speed"
    )

    # Bandwidth limit for router configuration (in kbps)
    bandwidth_limit = models.PositiveIntegerField(
        default=0,
        help_text="Bandwidth limit in kbps for router configuration (0 = unlimited)"
    )

    # Plan Duration
    expiry_value = models.PositiveIntegerField(
        validators=[MinValueValidator(1)],
        help_text="Duration after which plan expires (e.g., 30)"
    )
    
    expiry_unit = models.CharField(
        max_length=10,
        choices=EXPIRY_UNITS,
        default='Days',
        help_text="Unit of measurement for plan duration"
    )

    # Data Allowance
    data_limit_value = models.CharField(
        max_length=20,
        help_text="Amount of data included in the plan (numeric or 'Unlimited')"
    )
    
    data_limit_unit = models.CharField(
        max_length=10,
        choices=DATA_UNITS,
        default='GB',
        help_text="Unit of measurement for data allowance"
    )

    # Usage Limits (connection time)
    usage_limit_value = models.CharField(
        max_length=20,
        help_text="Maximum connection time allowed in hours (numeric or 'Unlimited')"
    )
    
    usage_limit_unit = models.CharField(
        max_length=10,
        choices=USAGE_UNITS,
        default='Hours',
        help_text="Unit of measurement for usage time"
    )

    # Concurrent connections limit
    concurrent_connections = models.PositiveIntegerField(
        default=1,
        help_text="Maximum number of simultaneous connections allowed"
    )

    # Priority level for QoS
    priority_level = models.IntegerField(
        choices=PRIORITY_LEVELS,
        default=4,
        help_text="Quality of Service priority level (higher = better service)"
    )

    # Router-specific settings
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

    # Descriptive Fields
    description = models.TextField(
        help_text="Detailed description of the plan features"
    )
    
    category = models.CharField(
        max_length=20,
        choices=CATEGORIES,
        default='Residential',
        help_text="Target audience for this plan"
    )

    # Statistics
    purchases = models.PositiveIntegerField(
        default=0,
        help_text="Number of times this plan has been purchased"
    )

    # Plan Features and Restrictions
    features = models.JSONField(
        default=list,
        blank=True,
        help_text="List of features included in this plan"
    )
    
    restrictions = models.JSONField(
        default=list,
        blank=True,
        help_text="List of restrictions applied to this plan"
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
        """
        Custom validation to ensure:
        - Free Trial plans have price = 0 and no router-specific restrictions
        - Speed values are positive numbers
        - Data and usage limit values are properly handled for unlimited plans
        """
        # Validate Free Trial constraints
        if self.plan_type == 'Free Trial':
            if self.price != Decimal('0'):
                raise ValidationError({'price': 'Free Trial plans must have price set to 0'})
            if self.router_specific:
                raise ValidationError({'router_specific': 'Free Trial plans cannot be router-specific'})
            if self.priority_level > 4:  # Prevent high priority for free trials
                raise ValidationError({'priority_level': 'Free Trial plans cannot have premium priority levels'})

        # Validate speed values
        if self.download_speed_value <= Decimal('0'):
            raise ValidationError({'download_speed_value': 'Download speed must be greater than 0'})
        if self.upload_speed_value <= Decimal('0'):
            raise ValidationError({'upload_speed_value': 'Upload speed must be greater than 0'})

        # Validate expiry value
        if self.expiry_value <= 0:
            raise ValidationError({'expiry_value': 'Expiry duration must be a positive integer'})

        # Validate data_limit - automatic handling for unlimited
        if self.data_limit_unit == 'Unlimited':
            self.data_limit_value = 'Unlimited'
        elif not self.data_limit_value or self.data_limit_value.lower() == 'unlimited':
            raise ValidationError({
                'data_limit_value': 'Data limit value must be a positive number when unit is not Unlimited'
            })
        else:
            try:
                decimal_value = Decimal(self.data_limit_value)
                if decimal_value <= Decimal('0'):
                    raise ValidationError({
                        'data_limit_value': 'Data limit must be a positive number or "Unlimited"'
                    })
            except (ValueError, InvalidOperation):
                raise ValidationError({
                    'data_limit_value': 'Data limit must be a number or "Unlimited"'
                })

        # Validate usage_limit - automatic handling for unlimited
        if self.usage_limit_unit == 'Unlimited':
            self.usage_limit_value = 'Unlimited'
        elif not self.usage_limit_value or self.usage_limit_value.lower() == 'unlimited':
            raise ValidationError({
                'usage_limit_value': 'Usage limit value must be a positive number when unit is not Unlimited'
            })
        else:
            try:
                decimal_value = Decimal(self.usage_limit_value)
                if decimal_value <= Decimal('0'):
                    raise ValidationError({
                        'usage_limit_value': 'Usage limit must be a positive number or "Unlimited"'
                    })
            except (ValueError, InvalidOperation):
                raise ValidationError({
                    'usage_limit_value': 'Usage limit must be a number or "Unlimited"'
                })

    def save(self, *args, **kwargs):
        """Override save to run full validation"""
        self.full_clean()
        super().save(*args, **kwargs)

    def is_unlimited_data(self):
        """Check if plan has unlimited data"""
        return self.data_limit_unit == 'Unlimited' or self.data_limit_value.lower() == 'unlimited'

    def is_unlimited_time(self):
        """Check if plan has unlimited time"""
        return self.usage_limit_unit == 'Unlimited' or self.usage_limit_value.lower() == 'unlimited'

    def get_bandwidth_limit_display(self):
        """Return formatted bandwidth limit for display"""
        if self.bandwidth_limit == 0:
            return "Unlimited"
        elif self.bandwidth_limit >= 1000:
            return f"{self.bandwidth_limit / 1000:.1f} Mbps"
        else:
            return f"{self.bandwidth_limit} Kbps"

    def get_bandwidth_limit_for_router(self):
        """Return bandwidth limit in kbps format for router configuration"""
        if self.bandwidth_limit == 0:
            return "0"  # Unlimited in router terms
        return str(self.bandwidth_limit)

    def can_be_used_on_router(self, router_id):
        """Check if this plan can be used on the specified router"""
        if not self.router_specific:
            return True
        return self.allowed_routers.filter(id=router_id).exists()

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
            models.Index(fields=['bandwidth_limit']),
            models.Index(fields=['priority_level']),
        ]


class Subscription(models.Model):
    """
    Tracks active subscriptions tied to clients, plans, routers, and transactions.
    Handles usage tracking and status updates.
    """

    STATUS_CHOICES = (
        ('active', 'Active'),
        ('expired', 'Expired'),
        ('suspended', 'Suspended'),
        ('cancelled', 'Cancelled'),
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
        """Ensure end_date is after start_date"""
        if self.end_date <= timezone.now():
            raise ValidationError("End date must be in the future.")

    def update_usage(self, data_used, time_used):
        """Update usage statistics for this subscription"""
        self.data_used += data_used
        self.time_used += time_used
        
        if not self.internet_plan.is_unlimited_data():
            self.remaining_data -= data_used
            if self.remaining_data < 0:
                self.remaining_data = 0
                self.status = 'suspended'
        
        if not self.internet_plan.is_unlimited_time():
            self.remaining_time -= time_used
            if self.remaining_time < 0:
                self.remaining_time = 0
                self.status = 'suspended'
        
        self.last_activity = timezone.now()
        self.save()

    def get_remaining_data_display(self):
        """Return formatted remaining data"""
        if self.internet_plan and self.internet_plan.is_unlimited_data():
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
        if self.internet_plan and self.internet_plan.is_unlimited_time():
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
        return f"Subscription for {self.client.user.username if self.client else 'Unknown'} - {self.internet_plan.name if self.internet_plan else 'No Plan'}"

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
        ]