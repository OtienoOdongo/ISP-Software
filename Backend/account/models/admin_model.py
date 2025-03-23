# account/models/admin_model.py
from django.db import models
from django.contrib.auth import get_user_model
from phonenumber_field.modelfields import PhoneNumberField

User = get_user_model()  # Admin user (UserAccount)


class Client(models.Model):
    # represents the client user or end-users of the system who are managed by the admin users.
    full_name = models.CharField(max_length=255)
    phonenumber = PhoneNumberField(unique=True)  
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.phonenumber})"


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