



# from django.db import models
# from django.core.validators import MinValueValidator
# from django.core.exceptions import ValidationError
# from decimal import Decimal

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
#         help_text="Numerical value of download speed"
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
#         help_text="Numerical value of upload speed"
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
#         help_text="Duration after which plan expires"
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
#         for field in ['data_limit_value', 'usage_limit_value']:
#             value = getattr(self, field)
#             if value.lower() != 'unlimited':
#                 try:
#                     decimal_value = Decimal(value)
#                     if decimal_value <= Decimal('0'):
#                         raise ValidationError({
#                             field: f'{field} must be a positive number or "Unlimited"'
#                         })
#                 except (ValueError, InvalidOperation):
#                     raise ValidationError({
#                         field: f'{field} must be a number or "Unlimited"'
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










from django.db import models
from django.core.validators import MinValueValidator
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
    
    # Usage Limits
    usage_limit_value = models.CharField(
        max_length=20,
        help_text="Maximum usage time allowed (numeric or 'Unlimited')"
    )
    
    usage_limit_unit = models.CharField(
        max_length=10,
        choices=USAGE_UNITS,
        default='Hours',
        help_text="Unit of measurement for usage time"
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
        - Free Trial plans have price = 0
        - Speed values are positive numbers
        - Data and usage limit values are either numeric or 'Unlimited'
        - If unit is 'Unlimited', value must be 'Unlimited'
        """
        # Validate Free Trial price
        if self.plan_type == 'Free Trial' and self.price != Decimal('0'):
            raise ValidationError({
                'price': 'Free Trial plans must have price set to 0'
            })

        # Validate speed values
        if self.download_speed_value <= Decimal('0'):
            raise ValidationError({
                'download_speed_value': 'Download speed must be greater than 0'
            })
        if self.upload_speed_value <= Decimal('0'):
            raise ValidationError({
                'upload_speed_value': 'Upload speed must be greater than 0'
            })

        # Validate data_limit_value and usage_limit_value
        for field_value, field_unit in [('data_limit_value', 'data_limit_unit'), ('usage_limit_value', 'usage_limit_unit')]:
            value = getattr(self, field_value)
            unit = getattr(self, field_unit)
            if unit == 'Unlimited' and value.lower() != 'unlimited':
                raise ValidationError({
                    field_value: f'{field_value} must be "Unlimited" when unit is Unlimited'
                })
            if value.lower() != 'unlimited':
                try:
                    decimal_value = Decimal(value)
                    if decimal_value <= Decimal('0'):
                        raise ValidationError({
                            field_value: f'{field_value} must be a positive number or "Unlimited"'
                        })
                except (ValueError, InvalidOperation):
                    raise ValidationError({
                        field_value: f'{field_value} must be a number or "Unlimited"'
                    })

    def save(self, *args, **kwargs):
        """Override save to run full validation"""
        self.full_clean()
        super().save(*args, **kwargs)

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
        ]

class Subscription(models.Model):
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
    transaction = models.ForeignKey(
        'payments.Transaction',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='subscriptions'
    )
    is_active = models.BooleanField(default=True)
    start_date = models.DateTimeField(auto_now_add=True)
    end_date = models.DateTimeField()

    def __str__(self):
        return f"Subscription for {self.client.user.name or self.client.user.phonenumber} ({self.internet_plan.name if self.internet_plan else 'No Plan'})"

    def clean(self):
        """Ensure end_date is after start_date"""
        if self.end_date <= timezone.now():
            raise ValidationError("End date must be in the future.")

    class Meta:
        verbose_name = 'Subscription'
        verbose_name_plural = 'Subscriptions'
        ordering = ['-start_date']
        indexes = [
            models.Index(fields=['client', 'start_date']),
            models.Index(fields=['internet_plan']),
            models.Index(fields=['is_active']),
        ]