from rest_framework import serializers
from .models import (
    RouterManagement, 
    BandwidthAllocation, 
    IPAddressManagement, 
    NetworkDiagnostics, 
    SecuritySettings
)

class RouterManagementSerializer(serializers.ModelSerializer):
    """
    Serializer for RouterManagement model.
    """
    class Meta:
        model = RouterManagement
        fields = ['id', 'router_name', 'ip_address', 'mac_address', 'status', 'bandwidth']


class BandwidthAllocationSerializer(serializers.ModelSerializer):
    """
    Serializer for BandwidthAllocation model.
    """
    router = serializers.StringRelatedField()

    class Meta:
        model = BandwidthAllocation
        fields = ['id', 'device_name', 'allocated_bandwidth', 'router']


class IPAddressManagementSerializer(serializers.ModelSerializer):
    """
    Serializer for IPAddressManagement model.
    """
    router = serializers.StringRelatedField()

    class Meta:
        model = IPAddressManagement
        fields = ['id', 'ip_address', 'device_name', 'is_static', 'router']


class NetworkDiagnosticsSerializer(serializers.ModelSerializer):
    """
    Serializer for NetworkDiagnostics model.
    """
    router = serializers.StringRelatedField()

    class Meta:
        model = NetworkDiagnostics
        fields = ['id', 'router', 'log', 'created_at']


class SecuritySettingsSerializer(serializers.ModelSerializer):
    """
    Serializer for SecuritySettings model.
    """
    router = serializers.StringRelatedField()

    class Meta:
        model = SecuritySettings
        fields = ['id', 'router', 'firewall_enabled', 'encryption_type']
