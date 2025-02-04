from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for the User model, used for creating and representing user data.
    
    This serializer includes fields for user creation with password handling.
    """
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'fullname', 'email', 'password', 'is_verified', 
                  'last_login', 'created_at', 'updated_at']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        """
        Create a new user instance with the validated data.

        :param validated_data: Dictionary containing the validated user data
        :return: A newly created User instance
        """
        user = User.objects.create_user(
            username=validated_data['email'],  # Using email as username since we've made email unique
            email=validated_data['email'],
            fullname=validated_data['fullname'],
            password=validated_data['password']
        )
        return user