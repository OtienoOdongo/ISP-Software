from rest_framework import serializers
from user_management.models.activity_log import UserActivity

class UserActivitySerializer(serializers.ModelSerializer):
    """
    Serializer for the UserActivity model. Converts model instance data
    to native Python datatypes for JSON or other format responses.

    Attributes:
        Meta.model (UserActivity): The model class to serialize.
        Meta.fields (list): List of fields to include in serialization.
    """
    class Meta:
        model = UserActivity
        fields = ['id', 'user', 'type', 'details', 'timestamp']