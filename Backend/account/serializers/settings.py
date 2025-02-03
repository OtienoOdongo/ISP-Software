from rest_framework import serializers
from account.models.settings import UserProfile, SecuritySettings, NotificationSettings
from django.contrib.auth.models import User

class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for UserProfile model.
    """
    class Meta:
        model = UserProfile
        fields = ['phone', 'profile_pic']

class SecuritySettingsSerializer(serializers.ModelSerializer):
    """
    Serializer for SecuritySettings model.
    """
    class Meta:
        model = SecuritySettings
        fields = ['two_factor_auth', 'password_last_changed']

class NotificationSettingsSerializer(serializers.ModelSerializer):
    """
    Serializer for NotificationSettings model.
    """
    class Meta:
        model = NotificationSettings
        fields = ['internet_usage_alerts', 'usage_threshold', 'subscription_reminders', 
                  'days_before_reminder', 'system_updates', 'notification_frequency']

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for User model, including custom fields from related models.
    """
    profile = UserProfileSerializer(required=False)
    security = SecuritySettingsSerializer(required=False)
    notifications = NotificationSettingsSerializer(required=False)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'profile', 'security', 'notifications']

    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', None)
        if profile_data:
            profile = instance.userprofile
            for attr, value in profile_data.items():
                setattr(profile, attr, value)
            profile.save()

        security_data = validated_data.pop('security', None)
        if security_data:
            security = instance.securitysettings
            for attr, value in security_data.items():
                setattr(security, attr, value)
            security.save()

        notifications_data = validated_data.pop('notifications', None)
        if notifications_data:
            notifications = instance.notificationsettings
            for attr, value in notifications_data.items():
                setattr(notifications, attr, value)
            notifications.save()

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance