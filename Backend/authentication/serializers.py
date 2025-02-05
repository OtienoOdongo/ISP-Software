from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for the User model, used for creating and representing user data.

    Attributes:
        Meta:
            model (Model): The User model to serialize.
            fields (list): Fields of the User model to include in serialization.
            extra_kwargs (dict): Additional serialization options for fields.

    Methods:
        create: Creates a new user instance with the validated data.
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

        Args:
            validated_data (dict): Dictionary containing the validated user data.

        Returns:
            User: New user instance created with the provided data.
        """
        user = User.objects.create_user(
            username=validated_data['email'],  # Using email as username
            email=validated_data['email'],
            fullname=validated_data['fullname'],
            password=validated_data['password']
        )
        return user