# from rest_framework import serializers
# from django.contrib.auth.models import User
# from account.models.admin_profile import AdminProfile, RecentActivity, NetworkHealth, ServerStatus

# class UserSerializer(serializers.ModelSerializer):
#     """
#     Serializer for User model to handle user profile data.

#     Fields:
#         id (IntegerField): User's unique identifier.
#         email (EmailField): User's email address.
#         username (CharField): User's username.
#     """
#     class Meta:
#         model = User
#         fields = ['id', 'email', 'username']

# class AdminProfileSerializer(serializers.ModelSerializer):
#     """
#     Serializer for AdminProfile model to manage admin profile details.

#     Fields:
#         profile_pic (ImageField): Admin's profile picture.
#     """
#     class Meta:
#         model = AdminProfile
#         fields = ['profile_pic']

# class RecentActivitySerializer(serializers.ModelSerializer):
#     """
#     Serializer for RecentActivity model to manage activity logs.

#     Fields:
#         description (CharField): Description of the activity.
#         timestamp (DateTimeField): Timestamp of the activity.
#     """
#     class Meta:
#         model = RecentActivity
#         fields = ['description', 'timestamp']

# class NetworkHealthSerializer(serializers.ModelSerializer):
#     """
#     Serializer for NetworkHealth model to manage network metrics.

#     Fields:
#         latency (CharField): Network latency.
#         bandwidth_usage (CharField): Bandwidth usage.
#     """
#     class Meta:
#         model = NetworkHealth
#         fields = ['latency', 'bandwidth_usage']

# class ServerStatusSerializer(serializers.ModelSerializer):
#     """
#     Serializer for ServerStatus model to manage server statuses.

#     Fields:
#         name (CharField): Name of the server or device.
#         status (CharField): Status of the server.
#         color (CharField): Color code for status indication.
#     """
#     class Meta:
#         model = ServerStatus
#         fields = ['name', 'status', 'color']


from rest_framework import serializers
from account.models.admin_profile import AdminProfile, UserProfile, \
SecuritySettings, NotificationSettings

class AdminProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdminProfile
        fields = ['id', 'user', 'profile_pic']

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['id', 'user', 'phone', 'profile_pic']

class SecuritySettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SecuritySettings
        fields = ['id', 'user', 'two_factor_auth', 'password_last_changed']

class NotificationSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationSettings
        fields = ['id', 'user', 'internet_usage_alerts', 'usage_threshold', 
                  'subscription_reminders', 'days_before_reminder', 
                  'system_updates', 'notification_frequency']