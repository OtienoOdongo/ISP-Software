from django.db import models

class RouterManagement(models.Model):
    """
    Model to manage router details.
    """
    router_name = models.CharField(max_length=255, help_text="Name of the router")
    ip_address = models.GenericIPAddressField(help_text="IP address of the router")
    mac_address = models.CharField(max_length=255, help_text="MAC address of the router")
    status = models.CharField(max_length=50, choices=[("active", "Active"), ("inactive", "Inactive")], default="active")
    bandwidth = models.FloatField(help_text="Allocated bandwidth in Mbps")

    def __str__(self):
        return self.router_name


class BandwidthAllocation(models.Model):
    """
    Model to allocate bandwidth to specific users or devices.
    """
    device_name = models.CharField(max_length=255, help_text="Name of the device or user")
    allocated_bandwidth = models.FloatField(help_text="Bandwidth allocated in Mbps")
    router = models.ForeignKey(RouterManagement, on_delete=models.CASCADE, related_name="bandwidth_allocations")

    def __str__(self):
        return f"{self.device_name} - {self.allocated_bandwidth} Mbps"


class IPAddressManagement(models.Model):
    """
    Model to manage IP address assignments.
    """
    ip_address = models.GenericIPAddressField(help_text="Assigned IP address")
    device_name = models.CharField(max_length=255, help_text="Name of the device")
    is_static = models.BooleanField(default=False, help_text="True if the IP is static")
    router = models.ForeignKey(RouterManagement, on_delete=models.CASCADE, related_name="ip_assignments")

    def __str__(self):
        return self.ip_address


class NetworkDiagnostics(models.Model):
    """
    Model to store diagnostic information for network troubleshooting.
    """
    router = models.ForeignKey(RouterManagement, on_delete=models.CASCADE, related_name="diagnostics")
    log = models.TextField(help_text="Diagnostic logs or issues")
    created_at = models.DateTimeField(auto_now_add=True, help_text="Timestamp of the diagnostic log")

    def __str__(self):
        return f"Diagnostics for {self.router} at {self.created_at}"


class SecuritySettings(models.Model):
    """
    Model to manage network security settings.
    """
    router = models.ForeignKey(RouterManagement, on_delete=models.CASCADE, related_name="security_settings")
    firewall_enabled = models.BooleanField(default=True, help_text="Indicates if the firewall is enabled")
    encryption_type = models.CharField(max_length=100, help_text="Type of encryption used")

    def __str__(self):
        return f"Security settings for {self.router}"
