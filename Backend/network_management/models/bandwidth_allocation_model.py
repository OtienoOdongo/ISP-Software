# from django.db import models
# from django.utils import timezone
# from account.models.admin_model import Client
# from internet_plans.models.create_plan_models import InternetPlan
# from payments.models.mpesa_config_model import Transaction

# class BandwidthAllocation(models.Model):
#     STATUS_CHOICES = (
#         ('active', 'Active'),
#         ('inactive', 'Inactive'),
#         ('suspended', 'Suspended'),
#     )
    
#     PRIORITY_CHOICES = (
#         ('high', 'High'),
#         ('medium', 'Medium'),
#         ('low', 'Low'),
#     )
    
#     client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='bandwidth_allocations')
#     plan = models.ForeignKey(InternetPlan, on_delete=models.SET_NULL, null=True, blank=True)
#     transaction = models.ForeignKey(Transaction, on_delete=models.SET_NULL, null=True, blank=True)
#     ip_address = models.GenericIPAddressField()
#     mac_address = models.CharField(max_length=17)
#     allocated_bandwidth = models.CharField(max_length=20)  # e.g., "50GB" or "Unlimited"
#     used_bandwidth = models.FloatField(default=0)  # in GB
#     priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
#     status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='active')
#     last_used = models.DateTimeField(null=True, blank=True)
#     created_at = models.DateTimeField(default=timezone.now)
#     updated_at = models.DateTimeField(auto_now=True)

#     def __str__(self):
#         return f"{self.client.full_name} - {self.ip_address} ({self.allocated_bandwidth})"

# class BandwidthUsageHistory(models.Model):
#     allocation = models.ForeignKey(BandwidthAllocation, on_delete=models.CASCADE, related_name='usage_history')
#     timestamp = models.DateTimeField(default=timezone.now)
#     bytes_used = models.BigIntegerField()
#     duration = models.PositiveIntegerField()  # in seconds

#     def __str__(self):
#         return f"{self.allocation} - {self.timestamp}"

# class QoSProfile(models.Model):
#     name = models.CharField(max_length=50)
#     priority = models.CharField(max_length=10, choices=BandwidthAllocation.PRIORITY_CHOICES)
#     max_bandwidth = models.CharField(max_length=20)
#     min_bandwidth = models.CharField(max_length=20)
#     burst_limit = models.CharField(max_length=20, blank=True)
#     description = models.TextField(blank=True)

#     def __str__(self):
#         return self.name





from django.db import models
from django.utils import timezone
from account.models.admin_model import Client
from internet_plans.models.create_plan_models import InternetPlan
from payments.models.mpesa_config_model import Transaction


class QoSProfile(models.Model):
    """
    Represents a Quality of Service (QoS) profile defining bandwidth priorities and limits.
    """
    name = models.CharField(max_length=50, unique=True, help_text="Unique name of the QoS profile")
    priority = models.CharField(
        max_length=10,
        choices=[('high', 'High'), ('medium', 'Medium'), ('low', 'Low')],
        help_text="Priority level for traffic"
    )
    max_bandwidth = models.CharField(max_length=20, help_text="Maximum bandwidth (e.g., '100M')")
    min_bandwidth = models.CharField(max_length=20, help_text="Minimum guaranteed bandwidth (e.g., '10M')")
    burst_limit = models.CharField(max_length=20, blank=True, help_text="Burst limit for temporary speed boosts")
    description = models.TextField(blank=True, help_text="Description of the QoS profile")

    def __str__(self):
        return self.name

    class Meta:
        indexes = [models.Index(fields=['name', 'priority'])]


class BandwidthAllocation(models.Model):
    """
    Represents a bandwidth allocation for a client, including quota and QoS settings.
    """
    STATUS_CHOICES = (
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('suspended', 'Suspended'),
    )

    PRIORITY_CHOICES = (
        ('high', 'High'),
        ('medium', 'Medium'),
        ('low', 'Low'),
    )

    client = models.ForeignKey(
        Client,
        on_delete=models.CASCADE,
        related_name='bandwidth_allocations',
        help_text="Client associated with this allocation"
    )
    plan = models.ForeignKey(
        InternetPlan,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        help_text="Internet plan for this allocation"
    )
    transaction = models.ForeignKey(
        Transaction,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        help_text="Transaction associated with this allocation"
    )
    qos_profile = models.ForeignKey(
        QoSProfile,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        help_text="QoS profile applied to this allocation"
    )
    ip_address = models.GenericIPAddressField(help_text="IP address of the device")
    mac_address = models.CharField(max_length=17, help_text="MAC address of the device")
    allocated_bandwidth = models.CharField(max_length=20, help_text="Allocated bandwidth (e.g., '50GB' or 'Unlimited')")
    quota = models.CharField(max_length=20, help_text="Data quota (e.g., '50GB' or 'Unlimited')")
    used_bandwidth = models.FloatField(default=0, help_text="Used bandwidth in GB")
    priority = models.CharField(
        max_length=10,
        choices=PRIORITY_CHOICES,
        default='medium',
        help_text="QoS priority level"
    )
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default='active',
        help_text="Status of the allocation"
    )
    last_used = models.DateTimeField(null=True, blank=True, help_text="Last usage timestamp")
    created_at = models.DateTimeField(default=timezone.now, help_text="Creation timestamp")
    updated_at = models.DateTimeField(auto_now=True, help_text="Last update timestamp")

    def __str__(self):
        return f"{self.client.full_name} - {self.ip_address} ({self.allocated_bandwidth})"

    class Meta:
        indexes = [
            models.Index(fields=['client', 'status']),
            models.Index(fields=['mac_address']),
            models.Index(fields=['ip_address'])
        ]


class BandwidthUsageHistory(models.Model):
    """
    Tracks historical bandwidth usage for an allocation.
    """
    allocation = models.ForeignKey(
        BandwidthAllocation,
        on_delete=models.CASCADE,
        related_name='usage_history',
        help_text="Associated bandwidth allocation"
    )
    timestamp = models.DateTimeField(default=timezone.now, help_text="Usage timestamp")
    bytes_used = models.BigIntegerField(help_text="Bytes used in this period")
    duration = models.PositiveIntegerField(help_text="Duration in seconds")

    def __str__(self):
        return f"{self.allocation} - {self.timestamp}"

    class Meta:
        indexes = [models.Index(fields=['allocation', 'timestamp'])]