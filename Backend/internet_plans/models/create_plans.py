from django.db import models
import uuid
from django.core.exceptions import ValidationError

def validate_data_limit(value):
    """
    Validates that the data field is either 'unlimited' or a number followed by 'GB'.
    
    :param value: The string to validate
    :raises ValidationError: If the value doesn't match the required format
    """
    value = value.strip().lower()
    if value != 'unlimited':
        if not value.endswith('gb'):
            raise ValidationError("Data must be 'Unlimited' or a number followed by 'GB'.")
        try:
            int(value[:-2])  # Extract and validate the numeric part
        except ValueError:
            raise ValidationError("Data must be 'Unlimited' or a number followed by 'GB'.")

class InternetPlan(models.Model):
    """
    Model representing an internet data plan with various attributes.
    
    Attributes:
        id (UUIDField): Unique identifier for each plan.
        name (CharField): Name of the plan, must be unique.
        price (DecimalField): Price of the plan in the local currency.
        duration (CharField): Duration of the plan, limited to predefined choices.
        data (CharField): Data allowance, either a number in GB or 'Unlimited'.
        description (TextField): Detailed description of the plan.
        features (JSONField): List of features included in the plan.
    """
    DURATION_CHOICES = [
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True, help_text="Must be unique")
    price = models.DecimalField(max_digits=10, decimal_places=2)
    duration = models.CharField(max_length=50, choices=DURATION_CHOICES)
    data = models.CharField(max_length=20, validators=[validate_data_limit], 
                            help_text="Data allowance in GB or 'Unlimited'")
    description = models.TextField()
    features = models.JSONField(default=list)

    def __str__(self):
        return self.name