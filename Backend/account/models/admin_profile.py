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
        user (OneToOneField): Links to a User instance for a unique admin profile.
        profile_pic (ImageField): Stores the path for the admin's profile picture.

    Methods:
        __str__: Returns a string representation of the AdminProfile instance.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='admin_profile')
    profile_pic = models.ImageField(upload_to='profile_pics/', blank=True, null=True)

    def __str__(self):
        """
        String representation of the AdminProfile.

        Returns:
            str: A string describing the profile with the user's full name.
        """
        return f"Profile for {self.user.fullname}"

class RecentActivity(models.Model):
    """
    Stores recent activities logged by the admin or system.

    Attributes:
        user (ForeignKey): Links the activity to a user.
        description (TextField): Textual description of the activity.
        timestamp (DateTimeField): Automatically set to the time of creation.

    Methods:
        __str__: Returns a string representation of the RecentActivity instance.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='recent_activities', null=True)
    description = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        """
        String representation of the RecentActivity.

        Returns:
            str: A string with the user's name and a truncated description of the activity.
        """
        return f"{self.user.fullname} - {self.description[:50]}"

class NetworkHealth(models.Model):
    """
    Holds current network health metrics.

    Attributes:
        user (ForeignKey): Links network health metrics to a user.
        latency (CharField): Current network latency.
        bandwidth_usage (CharField): Current bandwidth usage.

    Methods:
        __str__: Returns a string representation of the NetworkHealth instance.
    """
    # Here we're adding `null=True` to allow for rows without an associated user initially.
    # You can later update this if you want to enforce non-null values.
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='network_health', null=True)
    latency = models.CharField(max_length=10)
    bandwidth_usage = models.CharField(max_length=10)

    def __str__(self):
        """
        String representation of the NetworkHealth.

        Returns:
            str: A string indicating network health for the specified user or 'Unknown User' if user is null.
        """
        return f"Network Health for {self.user.fullname if self.user else 'Unknown User'}"

class ServerStatus(models.Model):
    """
    Represents the status of different servers or network devices.

    Attributes:
        user (ForeignKey): Links server status to a user.
        name (CharField): Name or identifier of the server or device.
        status (CharField): Current operational status.
        color (CharField): Color code for status representation.

    Methods:
        __str__: Returns a string representation of the ServerStatus instance.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='server_statuses', null=True)
    name = models.CharField(max_length=100)
    status = models.CharField(max_length=10)  # 'Online', 'Offline'
    color = models.CharField(max_length=10)  # 'green', 'red'

    def __str__(self):
        """
        String representation of the ServerStatus.

        Returns:
            str: A string with server name, status, and user's full name.
        """
        return f"{self.name} - Status: {self.status} for {self.user.fullname}"