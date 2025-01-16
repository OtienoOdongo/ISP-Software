from django.db import models
from ..models import UserProfile

class UserBilling(models.Model):
    """
    Stores billing information for each user.

    Attributes:
        id (AutoField): Primary key for the billing information.
        user (ForeignKey): The user associated with this billing information.
        phone_number (CharField): User's phone number for billing purposes.
    """
    user = models.OneToOneField(UserProfile, on_delete=models.CASCADE)
    phone_number = models.CharField(max_length=20)

    def __str__(self):
        return f"{self.user.name}'s Billing"



from django.db import models
from ..models import UserProfile
from ..models import Plan
from django.utils import timezone

class Payment(models.Model):
    """
    Represents a payment transaction for a user.

    Attributes:
        id (AutoField): Primary key for the payment.
        user (ForeignKey): The user who made the payment.
        plan (ForeignKey): The plan associated with this payment.
        date (DateTimeField): Date and time of the payment.
        amount (FloatField): The amount paid.
        status (CharField): Current status of the payment (Paid, Failed, Pending).
    """
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
        return f"{self.user.name} - {self.plan.name} - {self.status} on {self.date}"