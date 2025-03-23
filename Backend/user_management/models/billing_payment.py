from django.db import models
from user_management.models.user_profile import UserProfile
from user_management.models.plan_assignment import Plan
from django.utils import timezone

class UserBilling(models.Model):
    user = models.OneToOneField(UserProfile, on_delete=models.CASCADE)
    phone_number = models.CharField(max_length=20)

    def __str__(self):
        return f"{self.user.client.full_name}'s Billing"  

class Payment(models.Model):
    STATUS_CHOICES = [
        ('Paid', 'Paid'),
        ('Failed', 'Failed'),
        ('Pending', 'Pending'),
    ]

    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    plan = models.ForeignKey(Plan, on_delete=models.SET_NULL, null=True)
    date = models.DateTimeField(default=timezone.now)
    amount = models.FloatField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')

    def __str__(self):
        return f"{self.user.client.full_name} - {self.plan.name if self.plan else 'N/A'} - {self.status} on {self.date}"