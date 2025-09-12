




# # network_management/models/router_management_model.py

# from django.db import models
# from django.utils import timezone
# from account.models.admin_model import Client
# from internet_plans.models.create_plan_models import InternetPlan
# from payments.models.payment_config_model import Transaction

# class Router(models.Model):
#     ROUTER_TYPES = (
#         ("mikrotik", "MikroTik"),
#         ("ubiquiti", "Ubiquiti"),
#         ("cisco", "Cisco"),
#         ("other", "Other"),
#     )
#     STATUS_CHOICES = (
#         ("connected", "Connected"),
#         ("disconnected", "Disconnected"),
#         ("updating", "Updating"),
#         ("error", "Error"),
#     )

#     name = models.CharField(max_length=100)
#     ip = models.GenericIPAddressField()
#     port = models.PositiveIntegerField(default=8728)
#     username = models.CharField(max_length=100, default="admin")
#     password = models.CharField(max_length=100, blank=True)
#     type = models.CharField(max_length=20, choices=ROUTER_TYPES, default="mikrotik")
#     location = models.CharField(max_length=100, blank=True, null=True)
#     status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="disconnected")
#     last_seen = models.DateTimeField(default=timezone.now)
#     hotspot_config = models.JSONField(blank=True, null=True)

#     def __str__(self):
#         return f"{self.name} ({self.ip}) - {self.type}"

# class RouterStats(models.Model):
#     router = models.ForeignKey(Router, on_delete=models.CASCADE, related_name="stats")
#     cpu = models.FloatField()
#     memory = models.FloatField()
#     clients = models.IntegerField()
#     uptime = models.CharField(max_length=10)
#     signal = models.IntegerField()
#     temperature = models.FloatField()
#     throughput = models.FloatField()
#     disk = models.FloatField()
#     timestamp = models.DateTimeField(default=timezone.now)

#     def __str__(self):
#         return f"Stats for {self.router.name} at {self.timestamp}"

# class HotspotUser(models.Model):
#     router = models.ForeignKey(Router, on_delete=models.CASCADE, related_name="hotspot_users")
#     client = models.ForeignKey(Client, on_delete=models.CASCADE, null=True)
#     plan = models.ForeignKey(InternetPlan, on_delete=models.SET_NULL, null=True)
#     transaction = models.ForeignKey(Transaction, on_delete=models.SET_NULL, null=True)
#     mac = models.CharField(max_length=17)
#     ip = models.GenericIPAddressField()
#     connected_at = models.DateTimeField(default=timezone.now)
#     data_used = models.BigIntegerField(default=0)
#     active = models.BooleanField(default=False)

#     def __str__(self):
#         return f"{self.client.user.name if self.client else 'Guest'} on {self.router.name}"







from django.db import models
from django.utils import timezone
from django.core.validators import MinValueValidator
from account.models.admin_model import Client
from internet_plans.models.create_plan_models import InternetPlan
from payments.models.payment_config_model import Transaction
import uuid

class Router(models.Model):
    ROUTER_TYPES = (
        ("mikrotik", "MikroTik"),
        ("ubiquiti", "Ubiquiti"),
        ("cisco", "Cisco"),
        ("other", "Other"),
    )
    STATUS_CHOICES = (
        ("connected", "Connected"),
        ("disconnected", "Disconnected"),
        ("updating", "Updating"),
        ("error", "Error"),
    )

    name = models.CharField(max_length=100)
    ip = models.GenericIPAddressField()
    port = models.PositiveIntegerField(default=8728)
    username = models.CharField(max_length=100, default="admin")
    password = models.CharField(max_length=100, blank=True)
    type = models.CharField(max_length=20, choices=ROUTER_TYPES, default="mikrotik")
    location = models.CharField(max_length=100, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="disconnected")
    last_seen = models.DateTimeField(default=timezone.now)
    hotspot_config = models.JSONField(blank=True, null=True)
    is_default = models.BooleanField(default=False)
    captive_portal_enabled = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} ({self.ip}) - {self.type}"

    class Meta:
        ordering = ['-is_default', 'name']

class RouterStats(models.Model):
    router = models.ForeignKey(Router, on_delete=models.CASCADE, related_name="stats")
    cpu = models.FloatField()
    memory = models.FloatField()
    connected_clients_count = models.IntegerField()
    uptime = models.CharField(max_length=10)
    signal = models.IntegerField()
    temperature = models.FloatField() # in Mps
    throughput = models.FloatField()  # in percentage
    disk = models.FloatField()
    timestamp = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"Stats for {self.router.name} at {self.timestamp}"

    class Meta:
        ordering = ['-timestamp']

class HotspotUser(models.Model):
    router = models.ForeignKey(Router, on_delete=models.CASCADE, related_name="hotspot_users")
    client = models.ForeignKey(Client, on_delete=models.CASCADE, null=True)
    plan = models.ForeignKey(InternetPlan, on_delete=models.SET_NULL, null=True)
    transaction = models.ForeignKey(Transaction, on_delete=models.SET_NULL, null=True)
    mac = models.CharField(max_length=17)
    ip = models.GenericIPAddressField()
    connected_at = models.DateTimeField(default=timezone.now)
    disconnected_at = models.DateTimeField(null=True, blank=True)
    data_used = models.BigIntegerField(default=0)
    active = models.BooleanField(default=False)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    location_data = models.JSONField(default=dict)
    session_id = models.UUIDField(default=uuid.uuid4, editable=False)
    total_session_time = models.IntegerField(default=0, help_text="Total session time in seconds")
    remaining_time = models.IntegerField(default=0, help_text="Remaining time in seconds")
    last_activity = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.client.user.username if self.client else 'Guest'} on {self.router.name}"

    def save(self, *args, **kwargs):
        # Update last activity timestamp
        if self.active:
            self.last_activity = timezone.now()
        super().save(*args, **kwargs)

    class Meta:
        ordering = ['-connected_at']
        indexes = [
            models.Index(fields=['mac']),
            models.Index(fields=['session_id']),
            models.Index(fields=['active']),
        ]

class ActivationAttempt(models.Model):
    subscription = models.ForeignKey('internet_plans.Subscription', on_delete=models.CASCADE)
    router = models.ForeignKey(Router, on_delete=models.CASCADE)
    attempted_at = models.DateTimeField(auto_now_add=True)
    success = models.BooleanField(default=False)
    error_message = models.TextField(blank=True)
    retry_count = models.IntegerField(default=0)

    class Meta:
        ordering = ['-attempted_at']

class RouterSessionHistory(models.Model):
    hotspot_user = models.ForeignKey(HotspotUser, on_delete=models.CASCADE, related_name="session_history")
    router = models.ForeignKey(Router, on_delete=models.CASCADE)
    start_time = models.DateTimeField(default=timezone.now)
    end_time = models.DateTimeField(null=True, blank=True)
    data_used = models.BigIntegerField(default=0)
    duration = models.IntegerField(default=0, help_text="Session duration in seconds")
    disconnected_reason = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        ordering = ['-start_time']

class RouterHealthCheck(models.Model):
    router = models.ForeignKey(Router, on_delete=models.CASCADE, related_name="health_checks")
    timestamp = models.DateTimeField(default=timezone.now)
    is_online = models.BooleanField(default=False)
    response_time = models.FloatField(null=True, blank=True)
    error_message = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ['-timestamp']