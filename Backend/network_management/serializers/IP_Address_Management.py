from rest_framework import serializers
from network_management.models import IPAddress, Subnet

class SubnetSerializer(serializers.ModelSerializer):
    """
    Serializer for the Subnet model.
    """
    class Meta:
        model = Subnet
        fields = ['id', 'network_address', 'netmask']

class IPAddressSerializer(serializers.ModelSerializer):
    """
    Serializer for the IPAddress model with nested subnet data.
    """
    subnet = SubnetSerializer()

    class Meta:
        model = IPAddress
        fields = ['id', 'ip_address', 'status', 'assigned_to', 'description', 'subnet']