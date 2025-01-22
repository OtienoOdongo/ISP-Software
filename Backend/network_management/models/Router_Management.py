# models.py
from django.db import models

class Router(models.Model):
    """
    Model representing a MikroTik Router in the system.

    Attributes:
        name (CharField): Name of the router.
        ip_address (GenericIPAddressField): IP address of the router.
        username (CharField): Username for router access.
        password (CharField): Password for router access.
        version (CharField): Current firmware version of the router.
        status (CharField): Current connection status of the router.
        uptime (CharField): Uptime of the router.
        bandwidth (CharField): Bandwidth usage or status indicator.
    """
    name = models.CharField(max_length=255)
    ip_address = models.GenericIPAddressField()
    username = models.CharField(max_length=255)
    password = models.CharField(max_length=255)
    version = models.CharField(max_length=50, null=True, blank=True)
    status = models.CharField(max_length=20, default="Disconnected")
    uptime = models.CharField(max_length=50, null=True, blank=True)
    bandwidth = models.CharField(max_length=50, null=True, blank=True)

    def __str__(self):
        return self.name