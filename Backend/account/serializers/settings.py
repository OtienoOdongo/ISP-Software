from rest_framework import serializers
from account.models.settings import Profile, SecuritySettings, NotificationSettings
from django.contrib.auth.models import User

class ProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for Profile model, handling user profile data.
    """
    class Meta:
        model = Profile
        fields = ['name', 'email', 'phone', 'profile_pic', 'role']

class SecuritySettingsSerializer(serializers.ModelSerializer):
    """
    Serializer for SecuritySettings model, managing security settings.
    """
    class Meta:
        model = SecuritySettings
        fields = ['two_factor_auth', 'password_last_changed']

class NotificationSettingsSerializer(serializers.ModelSerializer):
    """
    Serializer for NotificationSettings, handling notification preferences.
    """
    class Meta:
        model = NotificationSettings
        fields = ['notification_type', 'active', 'threshold', 'days_before', 'frequency']