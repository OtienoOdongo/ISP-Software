



# from django.db import models
# from django.utils import timezone
# from account.models.admin_model import Client
# from internet_plans.models.create_plan_models import InternetPlan
# from payments.models.payment_config_model import Transaction

# class Router(models.Model):
#     ROUTER_TYPES = (("mikrotik", "Mikrotik"),)
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
#         return f"{self.name} ({self.ip})"

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
#         return f"{self.client.full_name if self.client else 'Guest'} on {self.router.name}"






# network_management/models/router_management_model.py

from django.db import models
from django.utils import timezone
from account.models.admin_model import Client
from internet_plans.models.create_plan_models import InternetPlan
from payments.models.payment_config_model import Transaction

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

    def __str__(self):
        return f"{self.name} ({self.ip}) - {self.type}"

class RouterStats(models.Model):
    router = models.ForeignKey(Router, on_delete=models.CASCADE, related_name="stats")
    cpu = models.FloatField()
    memory = models.FloatField()
    clients = models.IntegerField()
    uptime = models.CharField(max_length=10)
    signal = models.IntegerField()
    temperature = models.FloatField()
    throughput = models.FloatField()
    disk = models.FloatField()
    timestamp = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"Stats for {self.router.name} at {self.timestamp}"

class HotspotUser(models.Model):
    router = models.ForeignKey(Router, on_delete=models.CASCADE, related_name="hotspot_users")
    client = models.ForeignKey(Client, on_delete=models.CASCADE, null=True)
    plan = models.ForeignKey(InternetPlan, on_delete=models.SET_NULL, null=True)
    transaction = models.ForeignKey(Transaction, on_delete=models.SET_NULL, null=True)
    mac = models.CharField(max_length=17)
    ip = models.GenericIPAddressField()
    connected_at = models.DateTimeField(default=timezone.now)
    data_used = models.BigIntegerField(default=0)
    active = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.client.user.name if self.client else 'Guest'} on {self.router.name}"

