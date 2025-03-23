from django.db import models
from django.utils import timezone
from user_management.models.user_profile import UserProfile
import uuid

class Plan(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    validity = models.CharField(max_length=20)
    data = models.CharField(max_length=20)
    price = models.FloatField()

    def __str__(self):
        return self.name

class UserPlan(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name="user_plans")
    plan = models.ForeignKey(Plan, on_delete=models.SET_NULL, null=True)
    assigned_date = models.DateTimeField(default=timezone.now)
    device_mac_address = models.CharField(max_length=17)
    payment_status = models.CharField(
        max_length=20,
        choices=[('Pending', 'Pending'), ('Completed', 'Completed'), ('Failed', 'Failed')],
        default='Pending'
    )
    transaction_id = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return f"{self.user.client.full_name}'s {self.plan.name} Plan" if self.plan else f"{self.user.client.full_name}'s Plan"

    class Meta:
        unique_together = ('user', 'device_mac_address')