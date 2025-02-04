
# from django.db import models
# from django.contrib.auth.models import User

# class UserProfile(models.Model):
#     """
#     Represents user profile details.

#     Attributes:
#         user (ForeignKey): One-to-one relationship with User model.
#         phone (CharField): User's phone number.
#         profile_pic (ImageField): User's profile picture.
#     """
#     user = models.OneToOneField(User, on_delete=models.CASCADE)
#     phone = models.CharField(max_length=20, null=True, blank=True)
#     profile_pic = models.ImageField(upload_to='profile_pics/', null=True, blank=True)

# class SecuritySettings(models.Model):
#     """
#     Represents security settings for a user.

#     Attributes:
#         user (ForeignKey): One-to-one relationship with User model.
#         two_factor_auth (BooleanField): Whether two-factor authentication is enabled.
#         password_last_changed (DateField): Date when the password was last changed.
#     """
#     user = models.OneToOneField(User, on_delete=models.CASCADE)
#     two_factor_auth = models.BooleanField(default=False)
#     password_last_changed = models.DateField(null=True, blank=True)

# class NotificationSettings(models.Model):
#     """
#     Represents notification preferences for a user.

#     Attributes:
#         user (ForeignKey): One-to-one relationship with User model.
#         Various fields for different notification types with their settings.
#     """
#     user = models.OneToOneField(User, on_delete=models.CASCADE)
#     internet_usage_alerts = models.BooleanField(default=True)
#     usage_threshold = models.CharField(max_length=10, default='80%')
#     subscription_reminders = models.BooleanField(default=True)
#     days_before_reminder = models.IntegerField(default=3)
#     system_updates = models.BooleanField(default=True)
#     notification_frequency = models.CharField(max_length=20, default='daily')

from django.db import models
from authentication.models import User

class UserProfile(models.Model):
    """
    Represents user profile details.

    Attributes:
        user (OneToOneField): One-to-one relationship with User model from authentication app.
        phone (CharField): User's phone number.
        profile_pic (ImageField): User's profile picture.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    phone = models.CharField(max_length=20, null=True, blank=True)
    profile_pic = models.ImageField(upload_to='profile_pics/', null=True, blank=True)

    def __str__(self):
        return f"Profile for {self.user.fullname}"

class SecuritySettings(models.Model):
    """
    Represents security settings for a user.

    Attributes:
        user (OneToOneField): One-to-one relationship with User model from authentication app.
        two_factor_auth (BooleanField): Whether two-factor authentication is enabled.
        password_last_changed (DateField): Date when the password was last changed.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='security_settings')
    two_factor_auth = models.BooleanField(default=False)
    password_last_changed = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"Security Settings for {self.user.fullname}"

class NotificationSettings(models.Model):
    """
    Represents notification preferences for a user.

    Attributes:
        user (OneToOneField): One-to-one relationship with User model from authentication app.
        Various fields for different notification types with their settings.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='notification_settings')
    internet_usage_alerts = models.BooleanField(default=True)
    usage_threshold = models.CharField(max_length=10, default='80%')
    subscription_reminders = models.BooleanField(default=True)
    days_before_reminder = models.IntegerField(default=3)
    system_updates = models.BooleanField(default=True)
    notification_frequency = models.CharField(max_length=20, default='daily')

    def __str__(self):
        return f"Notification Settings for {self.user.fullname}"