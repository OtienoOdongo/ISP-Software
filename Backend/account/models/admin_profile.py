from django.db import models
from django.contrib.auth.models import User

class AdminProfile(models.Model):
    """
    Represents the profile details of an admin user, including contact information and profile image.

    Attributes:
        user (ForeignKey): One-to-one relationship with User model.
        phone (CharField): Phone number of the admin.
        profile_pic (ImageField): Profile picture of the admin, stored in 'profile_pics/' directory.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    phone = models.CharField(max_length=20, null=True, blank=True)
    profile_pic = models.ImageField(upload_to='profile_pics/', blank=True, null=True)

class RecentActivity(models.Model):
    """
    Stores recent activities logged by the admin or system.

    Attributes:
        description (TextField): A textual description of the activity.
        timestamp (DateTimeField): Automatically set to the time of creation of the activity log.
    """
    description = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

class NetworkHealth(models.Model):
    """
    Holds current network health metrics.

    Attributes:
        latency (CharField): Current network latency.
        bandwidth_usage (CharField): Current bandwidth usage percentage or amount.
    """
    latency = models.CharField(max_length=10)
    bandwidth_usage = models.CharField(max_length=10)

class ServerStatus(models.Model):
    """
    Represents the status of different servers or network devices.

    Attributes:
        name (CharField): Name or identifier of the server or device.
        status (CharField): Current operational status, e.g., 'Online' or 'Offline'.
        color (CharField): Color code to visually represent status, e.g., 'green' for online.
    """
    name = models.CharField(max_length=100)
    status = models.CharField(max_length=10)  # 'Online', 'Offline'
    color = models.CharField(max_length=10)  # 'green', 'red'