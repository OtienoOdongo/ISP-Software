# from django.db import models
# from django.utils import timezone
# from datetime import timedelta
# from account.models.admin_model import Client

# # Subscription plan options (if needed separately from Subscription model)
# SUBSCRIPTION_PLANS = [
#     ('Premium', 'Premium'),
#     ('Plus', 'Plus'),
#     ('Basic', 'Basic')
# ]

# # Payment status options (if needed separately from Payment model)
# PAYMENT_STATUS = [
#     ('Paid', 'Paid'),
#     ('Pending', 'Pending')
# ]

# class UserProfile(models.Model):
#     client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name="user_profiles")
#     last_login = models.DateTimeField(null=True, blank=True)  # Additional field
#     active = models.BooleanField(default=True)  # Additional field for status toggle

#     # Data Usage
#     data_used = models.FloatField(default=0)
#     data_total = models.FloatField(default=100)
#     data_unit = models.CharField(max_length=10, default='GB')

#     # Payment and Subscription (derived or overridden if needed)
#     payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default='Pending')
#     subscription_plan = models.CharField(max_length=20, choices=SUBSCRIPTION_PLANS, default='Basic')
#     subscription_start_date = models.DateField(default=timezone.now)

#     def calculate_expiry_date():
#         return timezone.now().date() + timedelta(days=30)

#     subscription_expiry_date = models.DateField(default=calculate_expiry_date)

#     @property
#     def is_subscription_active(self):
#         return self.subscription_expiry_date >= timezone.now().date()

#     def __str__(self):
#         return f"{self.client.full_name} ({self.client.phonenumber})"



from django.db import models
from django.utils import timezone
from datetime import timedelta
from account.models.admin_model import Client

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

def calculate_expiry_date():
    """Calculate the default subscription expiry date (30 days from now)."""
    return timezone.now().date() + timedelta(days=30)

class UserProfile(models.Model):
    client = models.ForeignKey(
        Client,
        on_delete=models.CASCADE,
        related_name="user_profiles"
    )
    last_login = models.DateTimeField(null=True, blank=True)
    active = models.BooleanField(default=True)

    # Data Usage
    data_used = models.FloatField(default=0.0)
    data_total = models.FloatField(default=100.0)
    data_unit = models.CharField(max_length=10, default='GB')

    # Payment and Subscription
    payment_status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS,
        default='Pending'
    )
    subscription_plan = models.CharField(
        max_length=20,
        choices=SUBSCRIPTION_PLANS,
        default='Basic'
    )
    subscription_start_date = models.DateField(default=timezone.now)
    subscription_expiry_date = models.DateField(default=calculate_expiry_date)

    @property
    def is_subscription_active(self):
        """Check if the subscription is active based on the expiry date."""
        return self.subscription_expiry_date >= timezone.now().date()

    def __str__(self):
        """String representation of the UserProfile."""
        try:
            return f"{self.client.full_name} ({self.client.phonenumber})"
        except AttributeError:
            return f"UserProfile ID: {self.id} (No Client)"

    class Meta:
        verbose_name = "User Profile"
        verbose_name_plural = "User Profiles"