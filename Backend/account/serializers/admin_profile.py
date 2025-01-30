from rest_framework import serializers
from account.models.admin_profile import AdminProfile, RecentActivity, NetworkHealth, ServerStatus

class AdminProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for the AdminProfile model, handling phone and profile picture data.
    """
    class Meta:
        model = AdminProfile
        fields = ['phone', 'profile_pic']

class RecentActivitySerializer(serializers.ModelSerializer):
    """
    Serializer for RecentActivity, providing structure for activity logs.
    """
    class Meta:
        model = RecentActivity
        fields = ['description', 'timestamp']

class NetworkHealthSerializer(serializers.ModelSerializer):
    """
    Serializer for NetworkHealth, encapsulating network performance metrics.
    """
    class Meta:
        model = NetworkHealth
        fields = ['latency', 'bandwidth_usage']

class ServerStatusSerializer(serializers.ModelSerializer):
    """
    Serializer for ServerStatus, describing server health status.
    """
    class Meta:
        model = ServerStatus
        fields = ['name', 'status', 'color']