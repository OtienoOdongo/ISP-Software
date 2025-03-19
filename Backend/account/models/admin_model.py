# account/models/admin_model.py
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()  # Admin user (UserAccount)

class Client(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)  # Distinct from admin email
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.email

class Subscription(models.Model):
    client = models.ForeignKey(Client, on_delete=models.CASCADE)
    is_active = models.BooleanField(default=True)
    start_date = models.DateTimeField(auto_now_add=True)
    end_date = models.DateTimeField()

    def __str__(self):
        return f"Subscription for {self.client.email}"

class Payment(models.Model):
    client = models.ForeignKey(Client, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Payment of {self.amount} by {self.client.email}"

class ActivityLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)  
    description = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Activity: {self.description}"

class Router(models.Model):
    name = models.CharField(max_length=100)
    status = models.CharField(max_length=20, default="Offline")
    latency = models.FloatField(null=True, blank=True)
    bandwidth_usage = models.FloatField(null=True, blank=True)
    color = models.CharField(max_length=20, default="red")

    def save(self, *args, **kwargs):
        # Automatically set color based on status
        if self.status == "Online":
            self.color = "green"
        elif self.status == "Offline":
            self.color = "red"
        else:
            self.color = "yellow"
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name