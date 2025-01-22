from rest_framework import serializers
from ..models import Device

class DeviceSerializer(serializers.ModelSerializer):
    """
    Serializer for Device model to manage bandwidth for devices.
    """
    class Meta:
        model = Device
        fields = ['device_id', 'mac', 'allocated', 'used', 'qos', 'quota', 'unlimited']

    def validate_allocated(self, value):
        if value != 'Unlimited':
            try:
                int(value)
            except ValueError:
                raise serializers.ValidationError("Allocated must be an integer or 'Unlimited'")
        return value

    def validate_quota(self, value):
        if value != 'Unlimited':
            try:
                int(value)
            except ValueError:
                raise serializers.ValidationError("Quota must be an integer or 'Unlimited'")
        return value