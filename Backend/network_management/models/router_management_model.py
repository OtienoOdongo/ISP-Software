# from django.db import models
# from django.utils import timezone

# class Router(models.Model):
#     ROUTER_TYPES = (
#         ("mikrotik", "Mikrotik"),
#         ("openwrt", "OpenWRT"),
#         ("cisco", "Cisco"),
#         ("generic", "Generic"),
#         ("tp-link", "TP-Link"),
#         ("ubiquiti", "Ubiquiti"),
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
#     hotspot_config = models.JSONField(blank=True, null=True)  # Stores hotspot settings as JSON

#     def __str__(self):
#         return f"{self.name} ({self.ip})"

#     class Meta:
#         verbose_name = "Router"
#         verbose_name_plural = "Routers"

# class RouterStats(models.Model):
#     router = models.ForeignKey(Router, on_delete=models.CASCADE, related_name="stats")
#     cpu = models.FloatField()  # CPU usage in percentage
#     memory = models.FloatField()  # Memory usage in MB
#     clients = models.IntegerField()  # Number of connected clients
#     uptime = models.CharField(max_length=10)  # Uptime as a percentage string (e.g., "99.9%")
#     signal = models.IntegerField()  # Signal strength in dBm
#     temperature = models.FloatField()  # Temperature in Celsius
#     throughput = models.FloatField()  # Throughput in Mbps
#     disk = models.FloatField()  # Disk usage in percentage
#     timestamp = models.DateTimeField(default=timezone.now)

#     def __str__(self):
#         return f"Stats for {self.router.name} at {self.timestamp}"

#     class Meta:
#         verbose_name = "Router Stats"
#         verbose_name_plural = "Router Stats"

# class HotspotUser(models.Model):
#     router = models.ForeignKey(Router, on_delete=models.CASCADE, related_name="hotspot_users")
#     name = models.CharField(max_length=100)
#     mac = models.CharField(max_length=17)  # MAC address (e.g., "00:11:22:33:44:55")
#     ip = models.GenericIPAddressField()
#     plan = models.CharField(max_length=50, blank=True, null=True)  # e.g., "Basic", "Premium"
#     connected_at = models.DateTimeField(default=timezone.now)
#     data_used = models.BigIntegerField(default=0)  # Data used in bytes

#     def __str__(self):
#         return f"{self.name} on {self.router.name}"

#     class Meta:
#         verbose_name = "Hotspot User"
#         verbose_name_plural = "Hotspot Users"






from django.db import models
from django.utils import timezone
from account.models.admin_model import Client
from internet_plans.models.create_plan_models import InternetPlan
from payments.models.mpesa_config_model import Transaction

class Router(models.Model):
    ROUTER_TYPES = (("mikrotik", "Mikrotik"),)
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
        return f"{self.name} ({self.ip})"

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
        return f"{self.client.full_name if self.client else 'Guest'} on {self.router.name}"