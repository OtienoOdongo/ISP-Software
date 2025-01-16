from django.db import models
from django.utils import timezone

class UserProfile(models.Model):
    """
    Represents a user's profile with details like name, contact information,
    activity status, data usage, and subscription details.

    Attributes:
        id (AutoField): Primary key for the user profile.
        name (CharField): The name of the user.
        phone (CharField): User's phone number.
        last_login (DateTimeField): Timestamp of the last login.
        active (BooleanField): Indicates if the user account is active.
        data_used (FloatField): Amount of data used by the user.
        data_total (FloatField): Total amount of data allocated to the user.
        data_unit (CharField): Unit of data measurement, e.g., 'GB'.
        payment_status (CharField): Current payment status of the user ('Paid' or 'Pending').
        subscription_plan (CharField): The type of subscription plan the user is on.
        subscription_start_date (DateField): Start date of the current subscription.
        subscription_expiry_date (DateField): Expiry date of the current subscription.
    """

    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20)
    last_login = models.DateTimeField(default=timezone.now)
    active = models.BooleanField(default=True)
    
    # Data Usage
    data_used = models.FloatField(default=0)
    data_total = models.FloatField(default=100)
    data_unit = models.CharField(max_length=10, default='GB')
    
    # Payment and Subscription
    payment_status = models.CharField(max_length=20, choices=[('Paid', 'Paid'), 
                                                              ('Pending', 'Pending')],
                                                                default='Pending')
    subscription_plan = models.CharField(max_length=20, choices=[('Premium', 'Premium'), 
                                                                 ('Plus', 'Plus'), ('Basic', 'Basic')], 
                                                                 default='Basic')
    subscription_start_date = models.DateField()
    subscription_expiry_date = models.DateField()

    def __str__(self):
        return self.name