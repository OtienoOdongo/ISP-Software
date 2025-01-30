from django.db import models
from django.contrib.auth.models import User

class Profile(models.Model):
    """
    Represents user profile information.

    Attributes:
        user (ForeignKey): One-to-one relationship with User model.
        name (CharField): Full name of the user.
        email (EmailField): Email address of the user.
        phone (CharField): Phone number of the user.
        profile_pic (ImageField): Profile picture of the user, stored in 'profile_pics/' directory.
        role (CharField): Role of the user, like 'Admin'.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True)
    profile_pic = models.ImageField(upload_to='profile_pics/', blank=True, null=True)
    role = models.CharField(max_length=50)

class SecuritySettings(models.Model):
    """
    Stores security-related settings for a user.

    Attributes:
        user (ForeignKey): One-to-one relationship with User model.
        two_factor_auth (BooleanField): Whether two-factor authentication is enabled.
        password_last_changed (DateField): Date when the password was last changed.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    two_factor_auth = models.BooleanField(default=False)
    password_last_changed = models.DateField()

class NotificationSettings(models.Model):
    """
    Represents notification preferences for different types of alerts.

    Attributes:
        user (ForeignKey): One-to-one relationship with User model.
        notification_type (CharField): Type of notification (e.g., 'internetUsageAlerts').
        active (BooleanField): Whether this notification type is active.
        threshold (CharField): Usage threshold for internet alerts.
        days_before (IntegerField): Days before event for subscription reminders.
        frequency (CharField): How often notifications should be sent.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    notification_type = models.CharField(max_length=50)
    active = models.BooleanField(default=True)
    threshold = models.CharField(max_length=10, blank=True, null=True)
    days_before = models.IntegerField(blank=True, null=True)
    frequency = models.CharField(max_length=20)

    class Meta:
        unique_together = ('user', 'notification_type')  # Ensures only one setting per type per user