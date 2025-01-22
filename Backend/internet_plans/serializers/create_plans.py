from rest_framework import serializers
from ..models import InternetPlan

class InternetPlanSerializer(serializers.ModelSerializer):
    """
    Serializer for the InternetPlan model. Converts model instance to and from native Python datatypes.
    
    Attributes:
        Meta (SerializerMeta): Configuration for the serializer.
            - model: Specifies the model class to serialize
            - fields: Lists all fields of the model to be included in serialization/deserialization
    """
    class Meta:
        model = InternetPlan
        fields = ['id', 'name', 'price', 'duration', 'data', 'description', 'features']