from rest_framework import serializers
from ..models.user_profile import UserProfile

class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for the UserProfile model. Converts model instance data
    to native Python datatypes that can then be rendered into JSON, XML etc.
    
    Attributes:
        Meta.model (UserProfile): The model class to serialize.
        Meta.fields (list): List of fields to include in serialization.
    """
    class Meta:
        model = UserProfile
        fields = ['id', 'name', 'phone', 'last_login', 'active', 'data_used', 'data_total', 'data_unit', 
                  'payment_status', 'subscription_plan', 'subscription_start_date', 'subscription_expiry_date']