




# from django.db import models
# from django.utils import timezone
# from account.models.admin_model import Client
# from internet_plans.models.create_plan_models import InternetPlan
# from payments.models.payment_config_model import Transaction


# class QoSProfile(models.Model):
#     """
#     Represents a Quality of Service (QoS) profile defining bandwidth priorities and limits.
#     """
#     name = models.CharField(max_length=50, unique=True, help_text="Unique name of the QoS profile")
#     priority = models.CharField(
#         max_length=10,
#         choices=[('high', 'High'), ('medium', 'Medium'), ('low', 'Low')],
#         help_text="Priority level for traffic"
#     )
#     max_bandwidth = models.CharField(max_length=20, help_text="Maximum bandwidth (e.g., '100M')")
#     min_bandwidth = models.CharField(max_length=20, help_text="Minimum guaranteed bandwidth (e.g., '10M')")
#     burst_limit = models.CharField(max_length=20, blank=True, help_text="Burst limit for temporary speed boosts")
#     description = models.TextField(blank=True, help_text="Description of the QoS profile")

#     def __str__(self):
#         return self.name

#     class Meta:
#         indexes = [models.Index(fields=['name', 'priority'])]


# class BandwidthAllocation(models.Model):
#     """
#     Represents a bandwidth allocation for a client, including quota and QoS settings.
#     """
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

#     client = models.ForeignKey(
#         Client,
#         on_delete=models.CASCADE,
#         related_name='bandwidth_allocations',
#         help_text="Client associated with this allocation"
#     )
#     plan = models.ForeignKey(
#         InternetPlan,
#         on_delete=models.SET_NULL,
#         null=True,
#         blank=True,
#         help_text="Internet plan for this allocation"
#     )
#     transaction = models.ForeignKey(
#         Transaction,
#         on_delete=models.SET_NULL,
#         null=True,
#         blank=True,
#         help_text="Transaction associated with this allocation"
#     )
#     qos_profile = models.ForeignKey(
#         QoSProfile,
#         on_delete=models.SET_NULL,
#         null=True,
#         blank=True,
#         help_text="QoS profile applied to this allocation"
#     )
#     ip_address = models.GenericIPAddressField(help_text="IP address of the device")
#     mac_address = models.CharField(max_length=17, help_text="MAC address of the device")
#     allocated_bandwidth = models.CharField(max_length=20, help_text="Allocated bandwidth (e.g., '50GB' or 'Unlimited')")
#     quota = models.CharField(max_length=20, help_text="Data quota (e.g., '50GB' or 'Unlimited')")
#     used_bandwidth = models.FloatField(default=0, help_text="Used bandwidth in GB")
#     priority = models.CharField(
#         max_length=10,
#         choices=PRIORITY_CHOICES,
#         default='medium',
#         help_text="QoS priority level"
#     )
#     status = models.CharField(
#         max_length=10,
#         choices=STATUS_CHOICES,
#         default='active',
#         help_text="Status of the allocation"
#     )
#     last_used = models.DateTimeField(null=True, blank=True, help_text="Last usage timestamp")
#     created_at = models.DateTimeField(default=timezone.now, help_text="Creation timestamp")
#     updated_at = models.DateTimeField(auto_now=True, help_text="Last update timestamp")

#     def __str__(self):
#         return f"{self.client.full_name} - {self.ip_address} ({self.allocated_bandwidth})"

#     class Meta:
#         indexes = [
#             models.Index(fields=['client', 'status']),
#             models.Index(fields=['mac_address']),
#             models.Index(fields=['ip_address'])
#         ]


# class BandwidthUsageHistory(models.Model):
#     """
#     Tracks historical bandwidth usage for an allocation.
#     """
#     allocation = models.ForeignKey(
#         BandwidthAllocation,
#         on_delete=models.CASCADE,
#         related_name='usage_history',
#         help_text="Associated bandwidth allocation"
#     )
#     timestamp = models.DateTimeField(default=timezone.now, help_text="Usage timestamp")
#     bytes_used = models.BigIntegerField(help_text="Bytes used in this period")
#     duration = models.PositiveIntegerField(help_text="Duration in seconds")

#     def __str__(self):
#         return f"{self.allocation} - {self.timestamp}"

#     class Meta:
#         indexes = [models.Index(fields=['allocation', 'timestamp'])]








from django.db import models
from django.utils import timezone
from django.core.exceptions import ValidationError


class QoSProfile(models.Model):
    """
    Represents a Quality of Service (QoS) profile defining bandwidth priorities and limits.
    """
    PRIORITY_CHOICES = [
        ('high', 'High'),
        ('medium', 'Medium'), 
        ('low', 'Low'),
    ]
    
    name = models.CharField(max_length=50, unique=True, help_text="Unique name of the QoS profile")
    priority = models.CharField(
        max_length=10,
        choices=PRIORITY_CHOICES,
        help_text="Priority level for traffic"
    )
    max_bandwidth = models.CharField(max_length=20, help_text="Maximum bandwidth (e.g., '100M')")
    min_bandwidth = models.CharField(max_length=20, help_text="Minimum guaranteed bandwidth (e.g., '10M')")
    burst_limit = models.CharField(max_length=20, blank=True, help_text="Burst limit for temporary speed boosts")
    description = models.TextField(blank=True, help_text="Description of the QoS profile")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.priority})"

    class Meta:
        indexes = [
            models.Index(fields=['name', 'priority']),
            models.Index(fields=['is_active']),
        ]
        ordering = ['priority', 'name']

    def get_max_bandwidth_mbps(self):
        """Convert max_bandwidth string to Mbps value"""
        return self._convert_bandwidth_to_mbps(self.max_bandwidth)

    def get_min_bandwidth_mbps(self):
        """Convert min_bandwidth string to Mbps value"""
        return self._convert_bandwidth_to_mbps(self.min_bandwidth)

    def _convert_bandwidth_to_mbps(self, bandwidth_str):
        """Convert bandwidth string to Mbps"""
        try:
            if not bandwidth_str:
                return 0
                
            bandwidth_str = bandwidth_str.upper().strip()
            
            if 'G' in bandwidth_str:
                value = float(bandwidth_str.replace('G', '').strip())
                return value * 1000
            elif 'M' in bandwidth_str:
                value = float(bandwidth_str.replace('M', '').strip())
                return value
            elif 'K' in bandwidth_str:
                value = float(bandwidth_str.replace('K', '').strip())
                return value / 1000
            else:
                return float(bandwidth_str)
        except (ValueError, AttributeError):
            return 0

class BandwidthAllocation(models.Model):
    """
    Represents a bandwidth allocation for a client, including quota and QoS settings.
    """
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('suspended', 'Suspended'),
    ]

    PRIORITY_CHOICES = [
        ('high', 'High'),
        ('medium', 'Medium'),
        ('low', 'Low'),
    ]

    client = models.ForeignKey(
        "authentication.UserAccount", 
        on_delete=models.CASCADE, 
        related_name='bandwidth_allocations',
        limit_choices_to={'user_type': 'client'},  
        help_text="Client associated with this allocation"
    )
    plan = models.ForeignKey(
        "internet_plans.InternetPlan",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        help_text="Internet plan for this allocation"
    )
    # transaction = models.ForeignKey(
    #     "payments.Transaction", 
    #     on_delete=models.SET_NULL,
    #     null=True,
    #     blank=True,
    #     help_text="Transaction associated with this allocation"
    # )
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
            models.Index(fields=['ip_address']),
            models.Index(fields=['status']),
            models.Index(fields=['created_at']),
        ]
        unique_together = ['client', 'ip_address', 'mac_address']
        ordering = ['-created_at']

    def clean(self):
        """Validate allocation constraints"""
        import re
        
        # Validate MAC address format
        if not re.match(r'^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$', self.mac_address):
            raise ValidationError("Invalid MAC address format")

        # Validate bandwidth format
        if not self._is_valid_bandwidth_format(self.allocated_bandwidth):
            raise ValidationError("Invalid allocated bandwidth format")
            
        if not self._is_valid_bandwidth_format(self.quota):
            raise ValidationError("Invalid quota format")

    def _is_valid_bandwidth_format(self, bandwidth_str):
        """Validate bandwidth format"""
        if bandwidth_str.lower() == 'unlimited':
            return True
            
        try:
            if bandwidth_str.upper().endswith('GB'):
                float(bandwidth_str.upper().replace('GB', '').strip())
                return True
        except (ValueError, AttributeError):
            pass
            
        return False

    def get_allocated_gb(self):
        """Get allocated bandwidth in GB as float"""
        if self.allocated_bandwidth.lower() == 'unlimited':
            return float('inf')
        try:
            return float(self.allocated_bandwidth.upper().replace('GB', '').strip())
        except (ValueError, AttributeError):
            return 0

    def get_quota_gb(self):
        """Get quota in GB as float"""
        if self.quota.lower() == 'unlimited':
            return float('inf')
        try:
            return float(self.quota.upper().replace('GB', '').strip())
        except (ValueError, AttributeError):
            return 0

    def get_usage_percentage(self):
        """Calculate bandwidth usage percentage"""
        allocated = self.get_allocated_gb()
        if allocated == float('inf') or allocated == 0:
            return 0
        return (self.used_bandwidth / allocated) * 100

    def get_remaining_quota(self):
        """Calculate remaining quota"""
        quota = self.get_quota_gb()
        if quota == float('inf'):
            return float('inf')
        return max(0, quota - self.used_bandwidth)

    def is_over_quota(self):
        """Check if allocation is over quota"""
        if self.quota.lower() == 'unlimited':
            return False
        return self.used_bandwidth > self.get_quota_gb()

    def update_usage(self, additional_bytes):
        """Update usage with additional bytes"""
        additional_gb = additional_bytes / (1024 ** 3)  # Convert bytes to GB
        self.used_bandwidth += additional_gb
        self.last_used = timezone.now()
        self.save()

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
    peak_bandwidth = models.FloatField(help_text="Peak bandwidth in Mbps during this period", blank=True, null=True)
    average_bandwidth = models.FloatField(help_text="Average bandwidth in Mbps during this period", blank=True, null=True)

    class Meta:
        indexes = [
            models.Index(fields=['allocation', 'timestamp']),
            models.Index(fields=['timestamp']),
        ]
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.allocation} - {self.timestamp}"

    def get_usage_gb(self):
        """Get usage in GB"""
        return self.bytes_used / (1024 ** 3)