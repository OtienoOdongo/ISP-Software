

# from django.db import models
# from django.utils import timezone
# from decimal import Decimal
# from network_management.models.router_management_model import Router
# from network_management.models.ip_address_model import IPAddress

# class DiagnosticTest(models.Model):
#     TEST_TYPES = (
#         ('ping', 'Ping'),
#         ('traceroute', 'Traceroute'),
#         ('speedtest', 'Speed Test'),
#         ('dns', 'DNS Resolution'),
#         ('packet_loss', 'Packet Loss'),
#         ('health_check', 'Health Check'),
#     )

#     STATUS_CHOICES = (
#         ('idle', 'Idle'),
#         ('running', 'Running'),
#         ('success', 'Success'),
#         ('error', 'Error'),
#     )

#     router = models.ForeignKey(Router, on_delete=models.CASCADE, related_name='diagnostic_tests')
#     test_type = models.CharField(max_length=20, choices=TEST_TYPES)
#     target = models.CharField(max_length=255, blank=True)
#     client_ip = models.ForeignKey(
#         IPAddress, on_delete=models.SET_NULL, null=True, blank=True, related_name='diagnostic_tests'
#     )
#     status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='idle')
#     result = models.JSONField(null=True, blank=True)
#     created_at = models.DateTimeField(default=timezone.now)
#     updated_at = models.DateTimeField(auto_now=True)

#     class Meta:
#         indexes = [
#             models.Index(fields=['router', 'test_type']),
#             models.Index(fields=['created_at']),
#         ]

#     def __str__(self):
#         return f"{self.get_test_type_display()} on {self.router} at {self.created_at}"

# class SpeedTestHistory(models.Model):
#     router = models.ForeignKey(Router, on_delete=models.CASCADE, related_name='speed_test_history')
#     client_ip = models.ForeignKey(
#         IPAddress, on_delete=models.SET_NULL, null=True, blank=True, related_name='speed_test_history'
#     )
#     download = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
#     upload = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
#     client_download = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
#     client_upload = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
#     latency = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
#     jitter = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
#     server = models.CharField(max_length=255, blank=True)
#     isp = models.CharField(max_length=255, blank=True)
#     device = models.CharField(max_length=255, blank=True)
#     connection_type = models.CharField(max_length=50, blank=True)
#     timestamp = models.DateTimeField(default=timezone.now)

#     class Meta:
#         indexes = [
#             models.Index(fields=['router', 'timestamp']),
#             models.Index(fields=['client_ip']),
#         ]

#     def __str__(self):
#         return f"Speed Test on {self.router} at {self.timestamp}"









from django.db import models
from django.utils import timezone
from decimal import Decimal
from network_management.models.router_management_model import Router
from network_management.models.ip_address_model import IPAddress

class DiagnosticTest(models.Model):
    TEST_TYPES = (
        ('ping', 'Ping'),
        ('traceroute', 'Traceroute'),
        ('speedtest', 'Speed Test'),
        ('dns', 'DNS Resolution'),
        ('packet_loss', 'Packet Loss'),
        ('health_check', 'Health Check'),
        ('port_scan', 'Port Scan'),
    )

    STATUS_CHOICES = (
        ('idle', 'Idle'),
        ('running', 'Running'),
        ('success', 'Success'),
        ('error', 'Error'),
        ('timeout', 'Timeout'),
    )

    router = models.ForeignKey(Router, on_delete=models.CASCADE, related_name='diagnostic_tests')
    test_type = models.CharField(max_length=20, choices=TEST_TYPES)
    target = models.CharField(max_length=255, blank=True)
    client_ip = models.ForeignKey(
        IPAddress, on_delete=models.SET_NULL, null=True, blank=True, related_name='diagnostic_tests'
    )
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='idle')
    result = models.JSONField(null=True, blank=True)
    error_message = models.TextField(blank=True)
    duration = models.DecimalField(max_digits=10, decimal_places=3, null=True, blank=True)  # Duration in seconds
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['router', 'test_type']),
            models.Index(fields=['created_at']),
            models.Index(fields=['status']),
            models.Index(fields=['client_ip']),
        ]
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.get_test_type_display()} on {self.router} at {self.created_at}"

    def save(self, *args, **kwargs):
        """Update updated_at on save"""
        self.updated_at = timezone.now()
        super().save(*args, **kwargs)

    def get_test_description(self):
        """Get human-readable test description"""
        descriptions = {
            'ping': f"Ping test to {self.target}",
            'traceroute': f"Traceroute to {self.target}",
            'speedtest': "Internet speed test",
            'dns': f"DNS resolution for {self.target}",
            'packet_loss': f"Packet loss test to {self.target}",
            'health_check': "Router health check",
            'port_scan': f"Port scan for {self.target}",
        }
        return descriptions.get(self.test_type, self.get_test_type_display())

class SpeedTestHistory(models.Model):
    router = models.ForeignKey(Router, on_delete=models.CASCADE, related_name='speed_test_history')
    client_ip = models.ForeignKey(
        IPAddress, on_delete=models.SET_NULL, null=True, blank=True, related_name='speed_test_history'
    )
    download = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    upload = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    client_download = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    client_upload = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    latency = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    jitter = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    packet_loss = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    server = models.CharField(max_length=255, blank=True)
    isp = models.CharField(max_length=255, blank=True)
    device = models.CharField(max_length=255, blank=True)
    connection_type = models.CharField(max_length=50, blank=True)
    test_mode = models.CharField(max_length=20, default='full', choices=[('quick', 'Quick'), ('full', 'Full')])
    timestamp = models.DateTimeField(default=timezone.now)

    class Meta:
        indexes = [
            models.Index(fields=['router', 'timestamp']),
            models.Index(fields=['client_ip']),
            models.Index(fields=['timestamp']),
        ]
        ordering = ['-timestamp']

    def __str__(self):
        return f"Speed Test on {self.router} at {self.timestamp}"

    def get_efficiency_percentage(self, isp_speed, client_speed):
        """Calculate efficiency percentage"""
        if not isp_speed or not client_speed or isp_speed == 0:
            return 0
        return min(100, (client_speed / isp_speed) * 100)

    @property
    def download_efficiency(self):
        """Calculate download efficiency"""
        return self.get_efficiency_percentage(self.download, self.client_download)

    @property
    def upload_efficiency(self):
        """Calculate upload efficiency"""
        return self.get_efficiency_percentage(self.upload, self.client_upload)

class NetworkAlert(models.Model):
    SEVERITY_CHOICES = (
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    )

    ALERT_TYPES = (
        ('high_latency', 'High Latency'),
        ('packet_loss', 'High Packet Loss'),
        ('slow_speed', 'Slow Speed'),
        ('service_down', 'Service Down'),
        ('high_usage', 'High Bandwidth Usage'),
        ('security', 'Security Alert'),
    )

    router = models.ForeignKey(Router, on_delete=models.CASCADE, related_name='alerts')
    alert_type = models.CharField(max_length=20, choices=ALERT_TYPES)
    severity = models.CharField(max_length=10, choices=SEVERITY_CHOICES)
    title = models.CharField(max_length=255)
    description = models.TextField()
    related_test = models.ForeignKey(DiagnosticTest, on_delete=models.SET_NULL, null=True, blank=True)
    is_resolved = models.BooleanField(default=False)
    resolved_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['router', 'is_resolved']),
            models.Index(fields=['severity']),
            models.Index(fields=['created_at']),
        ]
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.get_severity_display()} {self.alert_type} - {self.router}"

    def resolve(self):
        """Mark alert as resolved"""
        self.is_resolved = True
        self.resolved_at = timezone.now()
        self.save()