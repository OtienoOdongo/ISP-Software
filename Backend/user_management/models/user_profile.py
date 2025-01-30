from django.db import models
from django.utils import timezone
from datetime import timedelta
from phonenumber_field.modelfields import PhoneNumberField

# Subscription plan options
SUBSCRIPTION_PLANS = [
    ('Premium', 'Premium'),
    ('Plus', 'Plus'),
    ('Basic', 'Basic')
]

# Payment status options
PAYMENT_STATUS = [
    ('Paid', 'Paid'),
    ('Pending', 'Pending')
]

class UserProfile(models.Model):
    """
    Represents a user's profile in the Interlink system, managing user details, 
    subscription plans, payment status, and data usage.

    Attributes:
        id (AutoField): Unique identifier for the user.
        name (CharField): The full name of the user.
        phone (PhoneNumberField): User's phone number (ensures valid format).
        last_login (DateTimeField): Timestamp of the user's last login.
        active (BooleanField): Indicates if the user's account is active.

    Data Usage:
        data_used (FloatField): Amount of data (GB) consumed by the user.
        data_total (FloatField): Total allocated data limit.
        data_unit (CharField): Measurement unit for data (default: 'GB').

    Subscription & Payment:
        payment_status (CharField): Status of the user's payment (Paid or Pending).
        subscription_plan (CharField): The plan the user is subscribed to (Basic, Plus, Premium).
        subscription_start_date (DateField): Date when the subscription started.
        subscription_expiry_date (DateField): Automatically calculated expiry date (default: 30 days from start).

    Methods:
        is_subscription_active(): Checks if the user's subscription is still valid.
        calculate_expiry_date(): Returns the expiry date (30 days after start).
    """

    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    phone = PhoneNumberField(unique=True)  # Ensures phone number validity
    last_login = models.DateTimeField(default=timezone.now)
    active = models.BooleanField(default=True)

    # Data Usage
    data_used = models.FloatField(default=0)
    data_total = models.FloatField(default=100)
    data_unit = models.CharField(max_length=10, default='GB')

    # Payment and Subscription
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default='Pending')
    subscription_plan = models.CharField(max_length=20, choices=SUBSCRIPTION_PLANS, default='Basic')
    subscription_start_date = models.DateField(default=timezone.now)

    def calculate_expiry_date():
        """
        Calculates the expiry date of the user's subscription.
        Default: 30 days after the subscription starts.

        Returns:
            date: Expiry date (30 days from start).
        """
        return timezone.now().date() + timedelta(days=30)
    
    subscription_expiry_date = models.DateField(default=calculate_expiry_date)

    @property
    def is_subscription_active(self):
        """
        Checks if the subscription is still valid based on the expiry date.

        Returns:
            bool: True if the subscription is active, False otherwise.
        """
        return self.subscription_expiry_date >= timezone.now().date()

    def __str__(self):
        """
        Returns a string representation of the user profile.

        Returns:
            str: User's name and subscription plan.
        """
        return f"{self.name} ({self.subscription_plan})"
