from django.db import models
from django.core.validators import MinValueValidator
from django.core.exceptions import ValidationError

class InternetPlan(models.Model):
    """
    Represents an internet service plan with various specifications and attributes.
    Includes validation to ensure data consistency between plan type and pricing.

    Note: After making changes to this model, ensure you run the following commands
    to update the database schema and avoid OperationalErrors (e.g., missing columns):
        python manage.py makemigrations internet_plans
        python manage.py migrate internet_plans
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
        default=0.00,
        validators=[MinValueValidator(0)],
        help_text="Cost of the plan in Ksh. Must be 0 for Free Trial plans"
    )
    
    active = models.BooleanField(
        default=True,
        help_text="Whether the plan is currently available for purchase"
    )
    
    # Speed Specifications
    download_speed_value = models.FloatField(
        validators=[MinValueValidator(0)],
        help_text="Numerical value of download speed"
    )
    
    download_speed_unit = models.CharField(
        max_length=10,
        choices=SPEED_UNITS,
        default='Mbps',
        help_text="Unit of measurement for download speed"
    )
    
    upload_speed_value = models.FloatField(
        validators=[MinValueValidator(0)],
        help_text="Numerical value of upload speed"
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
        help_text="Duration after which plan expires"
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
    created_at = models.DateField(
        auto_now_add=True,
        help_text="Date when this plan was created"
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
        """
        # Validate Free Trial price
        if self.plan_type == 'Free Trial' and self.price != 0:
            raise ValidationError({
                'price': 'Free Trial plans must have price set to 0'
            })

        # Validate speed values
        if self.download_speed_value <= 0:
            raise ValidationError({
                'download_speed_value': 'Download speed must be greater than 0'
            })
        if self.upload_speed_value <= 0:
            raise ValidationError({
                'upload_speed_value': 'Upload speed must be greater than 0'
            })

        # Validate data_limit_value and usage_limit_value
        for field in ['data_limit_value', 'usage_limit_value']:
            value = getattr(self, field)
            if value.lower() != 'unlimited':
                try:
                    float(value)  # Check if it’s a valid number
                    if float(value) <= 0:
                        raise ValidationError({
                            field: f'{field} must be a positive number or "Unlimited"'
                        })
                except ValueError:
                    raise ValidationError({
                        field: f'{field} must be a number or "Unlimited"'
                    })

    def save(self, *args, **kwargs):
        """Override save to run full validation"""
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.plan_type})"

    class Meta:
        ordering = ['name']
        verbose_name = 'Internet Plan'
        verbose_name_plural = 'Internet Plans'
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['category']),
            models.Index(fields=['plan_type']),
            models.Index(fields=['active']),
        ]