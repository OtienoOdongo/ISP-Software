from django.db import models

class Subnet(models.Model):
    """
    Model representing a network subnet.

    Attributes:
        network_address (GenericIPAddressField): The start address of the subnet.
        netmask (CharField): The netmask for this subnet.
    """
    network_address = models.GenericIPAddressField(unique=True)
    netmask = models.CharField(max_length=18)  # e.g., '255.255.255.0'

    def __str__(self):
        return f"{self.network_address}/{self.netmask}"

class IPAddress(models.Model):
    """
    Model representing an IP address within a subnet.

    Attributes:
        ip_address (GenericIPAddressField): The IP address.
        status (CharField): The current status of the IP address.
        assigned_to (CharField): The entity or device assigned to this IP address.
        description (TextField): A brief description of the IP's purpose or use.
        subnet (ForeignKey): The subnet this IP belongs to.
    """
    STATUS_CHOICES = [
        ('available', 'Available'),
        ('assigned', 'Assigned'),
        ('reserved', 'Reserved'),
    ]

    ip_address = models.GenericIPAddressField(unique=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')
    assigned_to = models.CharField(max_length=100, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    subnet = models.ForeignKey(Subnet, on_delete=models.CASCADE, related_name='ip_addresses')

    def __str__(self):
        return self.ip_address