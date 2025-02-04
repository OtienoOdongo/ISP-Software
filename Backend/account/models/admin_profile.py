# from django.db import models
# from django.contrib.auth.models import User

# class AdminProfile(models.Model):
#     """
#     Represents the profile details of an admin user.

#     Attributes:
#         user (ForeignKey): One-to-one relationship with User model.
#         profile_pic (ImageField): Profile picture of the admin, stored in 'profile_pics/' directory.
#     """
#     user = models.OneToOneField(User, on_delete=models.CASCADE)
#     profile_pic = models.ImageField(upload_to='profile_pics/', blank=True, null=True)

# class RecentActivity(models.Model):
#     """
#     Stores recent activities logged by the admin or system.

#     Attributes:
#         description (TextField): A textual description of the activity.
#         timestamp (DateTimeField): Automatically set to the time of creation of the activity log.
#     """
#     description = models.TextField()
#     timestamp = models.DateTimeField(auto_now_add=True)

# class NetworkHealth(models.Model):
#     """
#     Holds current network health metrics.

#     Attributes:
#         latency (CharField): Current network latency.
#         bandwidth_usage (CharField): Current bandwidth usage percentage or amount.
#     """
#     latency = models.CharField(max_length=10)
#     bandwidth_usage = models.CharField(max_length=10)

# class ServerStatus(models.Model):
#     """
#     Represents the status of different servers or network devices.

#     Attributes:
#         name (CharField): Name or identifier of the server or device.
#         status (CharField): Current operational status, e.g., 'Online' or 'Offline'.
#         color (CharField): Color code to visually represent status, e.g., 'green' for online.
#     """
#     name = models.CharField(max_length=100)
#     status = models.CharField(max_length=10)  # 'Online', 'Offline'
#     color = models.CharField(max_length=10)  # 'green', 'red'

from django.db import models
from authentication.models import User

class AdminProfile(models.Model):
    """
    Represents the profile details of an admin user.

    Attributes:
        user (OneToOneField): One-to-one relationship with User model for unique admin profiles.
        profile_pic (ImageField): Profile picture of the admin, stored in 'profile_pics/' directory.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='admin_profile')
    profile_pic = models.ImageField(upload_to='profile_pics/', blank=True, null=True)

    def __str__(self):
        return f"Profile for {self.user.fullname}"

class RecentActivity(models.Model):
    """
    Stores recent activities logged by the admin or system.

    Attributes:
        user (ForeignKey): Links the activity to a user.
        description (TextField): A textual description of the activity.
        timestamp (DateTimeField): Automatically set to the time of creation of the activity log.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='recent_activities')
    description = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.fullname} - {self.description[:50]}"

class NetworkHealth(models.Model):
    """
    Holds current network health metrics.

    Attributes:
        user (ForeignKey): Links network health metrics to a user, assuming each user monitors different network segments.
        latency (CharField): Current network latency.
        bandwidth_usage (CharField): Current bandwidth usage percentage or amount.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='network_health')
    latency = models.CharField(max_length=10)
    bandwidth_usage = models.CharField(max_length=10)

    def __str__(self):
        return f"Network Health for {self.user.fullname}"

class ServerStatus(models.Model):
    """
    Represents the status of different servers or network devices.

    Attributes:
        user (ForeignKey): Links server status to a user, assuming each user might monitor different servers.
        name (CharField): Name or identifier of the server or device.
        status (CharField): Current operational status, e.g., 'Online' or 'Offline'.
        color (CharField): Color code to visually represent status, e.g., 'green' for online.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='server_statuses')
    name = models.CharField(max_length=100)
    status = models.CharField(max_length=10)  # 'Online', 'Offline'
    color = models.CharField(max_length=10)  # 'green', 'red'

    def __str__(self):
        return f"{self.name} - Status: {self.status} for {self.user.fullname}"