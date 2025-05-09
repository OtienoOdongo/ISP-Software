# from django.db import models
# from django.utils import timezone
# from network_management.models.router_management_model import Router

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
#         ('running', 'Running'),
#         ('success', 'Success'),
#         ('failed', 'Failed'),
#     )
    
#     router = models.ForeignKey(Router, on_delete=models.CASCADE, related_name='diagnostic_tests')
#     test_type = models.CharField(max_length=20, choices=TEST_TYPES)
#     target = models.CharField(max_length=255, blank=True)
#     status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='running')
#     result = models.JSONField()
#     started_at = models.DateTimeField(default=timezone.now)
#     completed_at = models.DateTimeField(null=True, blank=True)

#     def __str__(self):
#         return f"{self.get_test_type_display()} - {self.router.name}"

# class SpeedTestResult(models.Model):
#     test = models.OneToOneField(DiagnosticTest, on_delete=models.CASCADE, related_name='speed_test')
#     download_speed = models.FloatField()  # in Mbps
#     upload_speed = models.FloatField()  # in Mbps
#     latency = models.FloatField()  # in ms
#     jitter = models.FloatField()  # in ms
#     server = models.CharField(max_length=255)
#     isp = models.CharField(max_length=255)

#     def __str__(self):
#         return f"{self.download_speed} Mbps / {self.upload_speed} Mbps"

# class HealthCheckResult(models.Model):
#     test = models.OneToOneField(DiagnosticTest, on_delete=models.CASCADE, related_name='health_check')
#     services = models.JSONField()  # List of services and their statuses
#     cpu_usage = models.FloatField()  # in percentage
#     memory_usage = models.FloatField()  # in percentage
#     disk_usage = models.FloatField()  # in percentage

#     def __str__(self):
#         return f"Health Check - {self.test.router.name}"





# from django.db import models
# from django.utils import timezone
# from network_management.models.router_management_model import Router
# from network_management.models.ip_address_model import IPAddress, Subnet, DHCPLease
# from account.models.admin_model import Client

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
#     target = models.CharField(max_length=255, blank=True)  # e.g., domain or IP for ping/traceroute
#     client_ip = models.ForeignKey(IPAddress, on_delete=models.SET_NULL, null=True, blank=True, related_name='diagnostic_tests')
#     status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='idle')
#     result = models.JSONField(null=True, blank=True)  # Stores test results (e.g., latency, hops, speeds)
#     created_at = models.DateTimeField(default=timezone.now)
#     updated_at = models.DateTimeField(auto_now=True)

#     def __str__(self):
#         return f"{self.test_type} on {self.router} at {self.created_at}"

# class SpeedTestHistory(models.Model):
#     router = models.ForeignKey(Router, on_delete=models.CASCADE, related_name='speed_test_history')
#     client_ip = models.ForeignKey(IPAddress, on_delete=models.SET_NULL, null=True, blank=True, related_name='speed_test_history')
#     download = models.FloatField(null=True, blank=True)  # Mbps (ISP)
#     upload = models.FloatField(null=True, blank=True)  # Mbps (ISP)
#     client_download = models.FloatField(null=True, blank=True)  # Mbps (Client)
#     client_upload = models.FloatField(null=True, blank=True)  # Mbps (Client)
#     latency = models.FloatField(null=True, blank=True)  # ms
#     jitter = models.FloatField(null=True, blank=True)  # ms
#     server = models.CharField(max_length=255, blank=True)  # Speed test server
#     isp = models.CharField(max_length=255, blank=True)  # ISP name
#     device = models.CharField(max_length=255, blank=True)  # Client device
#     connection_type = models.CharField(max_length=50, blank=True)  # e.g., WiFi, Ethernet
#     timestamp = models.DateTimeField(default=timezone.now)

#     def __str__(self):
#         return f"Speed Test on {self.router} at {self.timestamp}"






# from django.db import models
# from django.utils import timezone
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
#     client_ip = models.ForeignKey(IPAddress, on_delete=models.SET_NULL, null=True, blank=True, related_name='diagnostic_tests')
#     status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='idle')
#     result = models.JSONField(null=True, blank=True)
#     created_at = models.DateTimeField(default=timezone.now)
#     updated_at = models.DateTimeField(auto_now=True)

#     def __str__(self):
#         return f"{self.test_type} on {self.router} at {self.created_at}"

# class SpeedTestHistory(models.Model):
#     router = models.ForeignKey(Router, on_delete=models.CASCADE, related_name='speed_test_history')
#     client_ip = models.ForeignKey(IPAddress, on_delete=models.SET_NULL, null=True, blank=True, related_name='speed_test_history')
#     download = models.FloatField(null=True, blank=True)
#     upload = models.FloatField(null=True, blank=True)
#     client_download = models.FloatField(null=True, blank=True)
#     client_upload = models.FloatField(null=True, blank=True)
#     latency = models.FloatField(null=True, blank=True)
#     jitter = models.FloatField(null=True, blank=True)
#     server = models.CharField(max_length=255, blank=True)
#     isp = models.CharField(max_length=255, blank=True)
#     device = models.CharField(max_length=255, blank=True)
#     connection_type = models.CharField(max_length=50, blank=True)
#     timestamp = models.DateTimeField(default=timezone.now)

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
    )

    STATUS_CHOICES = (
        ('idle', 'Idle'),
        ('running', 'Running'),
        ('success', 'Success'),
        ('error', 'Error'),
    )

    router = models.ForeignKey(Router, on_delete=models.CASCADE, related_name='diagnostic_tests')
    test_type = models.CharField(max_length=20, choices=TEST_TYPES)
    target = models.CharField(max_length=255, blank=True)
    client_ip = models.ForeignKey(
        IPAddress, on_delete=models.SET_NULL, null=True, blank=True, related_name='diagnostic_tests'
    )
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='idle')
    result = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['router', 'test_type']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"{self.get_test_type_display()} on {self.router} at {self.created_at}"

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
    server = models.CharField(max_length=255, blank=True)
    isp = models.CharField(max_length=255, blank=True)
    device = models.CharField(max_length=255, blank=True)
    connection_type = models.CharField(max_length=50, blank=True)
    timestamp = models.DateTimeField(default=timezone.now)

    class Meta:
        indexes = [
            models.Index(fields=['router', 'timestamp']),
            models.Index(fields=['client_ip']),
        ]

    def __str__(self):
        return f"Speed Test on {self.router} at {self.timestamp}"