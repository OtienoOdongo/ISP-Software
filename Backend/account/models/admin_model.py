from django.db import models
from authentication.models import UserAccount

# Client model represents customers who buy data plans
class Client(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=False)

    def __str__(self):
        return f"Client {self.id}"

# Subscription model for client data plans
class Subscription(models.Model):
    PLAN_TYPES = (
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
    )
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='subscriptions')
    plan_type = models.CharField(max_length=10, choices=PLAN_TYPES)
    start_date = models.DateTimeField(auto_now_add=True)
    end_date = models.DateTimeField()
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"Subscription {self.id} - {self.plan_type}"

# Payment model for client transactions
class Payment(models.Model):
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    transaction_id = models.CharField(max_length=50, unique=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    subscription = models.ForeignKey(Subscription, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"Payment {self.transaction_id} - {self.amount} KES"

# ActivityLog model for admin actions and system events
class ActivityLog(models.Model):
    description = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(UserAccount, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return self.description

# Router model for network infrastructure
class Router(models.Model):
    STATUS_CHOICES = (
        ('Online', 'Online'),
        ('Offline', 'Offline'),
    )
    name = models.CharField(max_length=100)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='Offline')
    latency = models.FloatField(blank=True, null=True)
    bandwidth_usage = models.FloatField(blank=True, null=True)
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


