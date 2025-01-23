from rest_framework import serializers
from payments.models import MpesaCallback

class MpesaCallbackSerializer(serializers.ModelSerializer):
    """
    Serializer for the MpesaCallback model to convert model instances to/from native Python datatypes.
    """
    class Meta:
        model = MpesaCallback
        fields = ['id', 'event', 'url']