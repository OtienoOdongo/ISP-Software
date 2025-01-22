from rest_framework import serializers
from network_management.models.Security_Settings import *

class FirewallRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = FirewallRule
        fields = ['type', 'ip', 'description']

class VPNConnectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = VPNConnection
        fields = ['server', 'connection_time']

class PortSerializer(serializers.ModelSerializer):
    class Meta:
        model = Port
        fields = ['port', 'service']

class GuestNetworkSerializer(serializers.ModelSerializer):
    class Meta:
        model = GuestNetwork
        fields = ['network_name', 'isolation']

class UserSecurityProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSecurityProfile
        fields = ['two_factor_auth', 'dns_encryption', 'device_limit']

class RegisteredDeviceSerializer(serializers.ModelSerializer):
    class Meta:
        model = RegisteredDevice
        fields = ['mac_address']

class SoftwareUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SoftwareUpdate
        fields = ['last_updated', 'status']