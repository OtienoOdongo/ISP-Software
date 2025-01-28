from django.db import models
from django.utils import timezone
from user_management.models.user_profile import UserProfile
import uuid


class Plan(models.Model):
    """
    Represents a plan that can be assigned to users.

    Attributes:
        id (UUIDField): Unique identifier for the plan.
        name (CharField): Name of the plan (e.g., Basic, Plus, Premium).
        validity (CharField): Duration for which the plan is valid (e.g., '1 day', '7 days').
        data (CharField): Amount of data included in the plan (e.g., '1GB', '10GB').
        price (FloatField): Price of the plan.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    validity = models.CharField(max_length=20)
    data = models.CharField(max_length=20)
    price = models.FloatField()

    def __str__(self):
        return self.name

class UserPlan(models.Model):
    """
    Represents the association between a user and their current plan.

    Attributes:
        id (UUIDField): Unique identifier for each plan assignment to prevent guessing.
        user (ForeignKey): The user to whom this plan is assigned.
        plan (ForeignKey): The plan that's currently assigned to the user.
        assigned_date (DateTimeField): When the plan was assigned to the user.
        device_mac_address (CharField): MAC address of the user's device, used for uniqueness.
        payment_status (CharField): Status of the payment for this plan assignment.
        transaction_id (CharField): Unique identifier for the M-Pesa transaction.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    plan = models.ForeignKey(Plan, on_delete=models.SET_NULL, null=True)
    assigned_date = models.DateTimeField(default=timezone.now)
    device_mac_address = models.CharField(max_length=17)
    payment_status = models.CharField(
        max_length=20, 
        choices=[
            ('Pending', 'Pending'), 
            ('Completed', 'Completed'), 
            ('Failed', 'Failed')
        ], 
        default='Pending'
    )
    transaction_id = models.CharField(max_length=50, unique=True)

    def __str__(self):
        # Handle case where plan might be null
        return f"{self.user.name}'s {self.plan.name} Plan" if self.plan else f"{self.user.name}'s Plan"

    class Meta:
        unique_together = ('user', 'device_mac_address')