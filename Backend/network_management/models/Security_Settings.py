from django.db import models
from user_management.models.user_profile import UserProfile

class FirewallRule(models.Model):
    """
    Model for storing firewall rules.

    Attributes:
        user (ForeignKey): User profile this rule applies to.
        type (CharField): Type of rule ('Block' or 'Allow').
        ip (CharField): IP address affected by this rule.
        description (TextField): Explanation of the rule.
    """
    TYPE_CHOICES = [
        ('Block', 'Block'),
        ('Allow', 'Allow'),
    ]
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='firewall_rules')
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    ip = models.GenericIPAddressField()
    description = models.TextField()

class VPNConnection(models.Model):
    """
    Model for VPN connection details.

    Attributes:
        user (ForeignKey): User profile this connection is for.
        server (CharField): VPN server address.
        connection_time (DateTimeField): Time when the connection was established.
    """
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='vpn_connections')
    server = models.CharField(max_length=255)
    connection_time = models.DateTimeField()

class Port(models.Model):
    """
    Model for managing open ports.

    Attributes:
        user (ForeignKey): User profile these ports are for.
        port (IntegerField): The port number.
        service (CharField): The service associated with the port.
    """
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='open_ports')
    port = models.IntegerField()
    service = models.CharField(max_length=50)

class GuestNetwork(models.Model):
    """
    Model for guest network settings.

    Attributes:
        user (ForeignKey): User profile this guest network is for.
        network_name (CharField): Name of the guest network.
        isolation (BooleanField): Whether the guest network is isolated from the main network.
    """
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='guest_network')
    network_name = models.CharField(max_length=100, unique=True)
    isolation = models.BooleanField(default=True)

class UserSecurityProfile(models.Model):
    """
    Model linking user to their security settings, including WiFi device limits.

    Attributes:
        user (ForeignKey): The user profile this security profile belongs to.
        two_factor_auth (BooleanField): Whether two-factor authentication is enabled.
        dns_encryption (CharField): The status of DNS encryption.
        device_limit (IntegerField): Maximum number of devices allowed for this user.
    """
    user = models.OneToOneField(UserProfile, on_delete=models.CASCADE)
    two_factor_auth = models.BooleanField(default=False)
    dns_encryption = models.CharField(max_length=20, default='Disabled')
    device_limit = models.IntegerField(default=2)

class RegisteredDevice(models.Model):
    """
    Model for devices registered to a user for WiFi access.

    Attributes:
        user (ForeignKey): User profile who registered the device.
        mac_address (CharField): MAC address of the device.
    """
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='registered_devices')
    mac_address = models.CharField(max_length=17, unique=True)

class SoftwareUpdate(models.Model):
    """
    Model for tracking software update status.

    Attributes:
        user (ForeignKey): User profile whose software update status this is.
        last_updated (DateTimeField): Date and time of the last update.
        status (CharField): Status of the software updates.
    """
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='software_updates')
    last_updated = models.DateTimeField()
    status = models.CharField(max_length=100)