from rest_framework import serializers
from payments.models.mpesa_configuration import MpesaConfig

class MpesaConfigSerializer(serializers.ModelSerializer):
    """
    Serializer for MpesaConfig model to convert model instances to/from native Python datatypes.
    """
    class Meta:
        model = MpesaConfig
        fields = ['apiKey', 'secretKey', 'shortCode', 'passKey', 'callbackURL', 'validationURL']