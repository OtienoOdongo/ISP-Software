from rest_framework import serializers
from payments.models.mpesa_callback_settings import (
    MpesaCallbackEvent, MpesaCallbackConfiguration, 
    MpesaCallbackLog, MpesaCallbackRule, MpesaCallbackSecurityProfile
)
from network_management.serializers.router_management_serializer import RouterSerializer

class MpesaCallbackEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = MpesaCallbackEvent
        fields = '__all__'

class MpesaCallbackConfigurationSerializer(serializers.ModelSerializer):
    router_details = RouterSerializer(source='router', read_only=True)
    event_details = MpesaCallbackEventSerializer(source='event', read_only=True)
    
    class Meta:
        model = MpesaCallbackConfiguration
        fields = '__all__'
        read_only_fields = ['id', 'webhook_secret', 'created_at', 'updated_at']
    
    def validate(self, data):
        # Ensure callback URL is valid for the router's network
        router = data.get('router')
        callback_url = data.get('callback_url')
        
        if router and callback_url:
            # Add validation logic here based on router capabilities
            pass
            
        return data

class MpesaCallbackLogSerializer(serializers.ModelSerializer):
    configuration_details = MpesaCallbackConfigurationSerializer(source='configuration', read_only=True)
    
    class Meta:
        model = MpesaCallbackLog
        fields = '__all__'
        read_only_fields = ['id', 'created_at']

class MpesaCallbackRuleSerializer(serializers.ModelSerializer):
    target_configuration_details = MpesaCallbackConfigurationSerializer(
        source='target_configuration', read_only=True
    )
    
    class Meta:
        model = MpesaCallbackRule
        fields = '__all__'

class MpesaCallbackSecurityProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = MpesaCallbackSecurityProfile
        fields = '__all__'

class MpesaCallbackTestSerializer(serializers.Serializer):
    """Serializer for testing callback configurations"""
    configuration_id = serializers.UUIDField()
    test_payload = serializers.JSONField(default=dict)
    validate_security = serializers.BooleanField(default=True)
    
    def validate_configuration_id(self, value):
        try:
            MpesaCallbackConfiguration.objects.get(id=value)
        except MpesaCallbackConfiguration.DoesNotExist:
            raise serializers.ValidationError("Configuration not found")
        return value

class MpesaCallbackBulkUpdateSerializer(serializers.Serializer):
    """Serializer for bulk updates"""
    configuration_ids = serializers.ListField(
        child=serializers.UUIDField()
    )
    is_active = serializers.BooleanField(required=False)
    security_level = serializers.ChoiceField(
        choices=MpesaCallbackConfiguration.SECURITY_LEVELS, 
        required=False
    )