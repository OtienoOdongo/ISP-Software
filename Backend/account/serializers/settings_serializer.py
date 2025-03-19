# account/serializers/settings_serializer.py
from rest_framework import serializers
from account.models.setting_model import AdminSettings, Session

class AdminSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdminSettings
        fields = [
            "email_alerts", "payment_alerts", "system_alerts", "security_alerts",
            "priority_only", "digest_frequency", "two_factor_enabled",
            "session_timeout", "ip_whitelist", "api_key", "profile_visible",
            "opt_out_analytics"
        ]

class SessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Session
        fields = ["id", "device", "last_active"]