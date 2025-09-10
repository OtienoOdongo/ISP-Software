





# # account/serializers/admin_serializer.py  

# from rest_framework import serializers
# from django.contrib.auth import get_user_model
# from account.models.admin_model import Client, ActivityLog

# User = get_user_model()

# class AdminProfileSerializer(serializers.ModelSerializer):
#     """Serializer for admin user profiles"""
#     class Meta:
#         model = User
#         fields = ['name', 'email', 'profile_pic']
#         read_only_fields = ['email']

# class StatsSerializer(serializers.Serializer):
#     """Serializer for system statistics"""
#     clients = serializers.IntegerField()
#     active_clients = serializers.IntegerField()

# class ActivityLogSerializer(serializers.ModelSerializer):
#     """Serializer for activity logs"""
#     class Meta:
#         model = ActivityLog
#         fields = ['action_type', 'description', 'timestamp']
#         read_only_fields = fields

# class ClientSerializer(serializers.ModelSerializer):
#     """
#     Updated Client serializer with proper phone_number field mapping
#     and validation for client creation.
#     """
#     full_name = serializers.CharField(source='user.name', required=True)
#     phonenumber = serializers.CharField(source='user.phone_number', required=True)
    
#     class Meta:
#         model = Client
#         fields = ['id', 'full_name', 'phonenumber', 'created_at']
#         read_only_fields = ['id', 'created_at']
        
#     def validate_phonenumber(self, value):
#         """Validate phone number format"""
#         if not value.startswith('+'):
#             raise serializers.ValidationError("Phone number must include country code (e.g., +254...)")
#         return value

#     def create(self, validated_data):
#         """
#         Custom create method to handle client user creation
#         through the proper UserAccountManager.
#         """
#         user_data = validated_data['user']
#         # Create the client user using the custom manager
#         user = User.objects.create_client(name=user_data['name'], phone_number=user_data['phone_number'])
        
#         # Create the client profile
#         client = Client.objects.create(user=user)
#         return client






from rest_framework import serializers
from django.contrib.auth import get_user_model
from account.models.admin_model import Client, ActivityLog

User = get_user_model()

class AdminProfileSerializer(serializers.ModelSerializer):
    """Serializer for admin user profiles"""
    class Meta:
        model = User
        fields = ['name', 'email', 'profile_pic']
        read_only_fields = ['email']

class StatsSerializer(serializers.Serializer):
    """Serializer for system statistics"""
    clients = serializers.IntegerField()
    active_clients = serializers.IntegerField()

class ActivityLogSerializer(serializers.ModelSerializer):
    """Serializer for activity logs"""
    class Meta:
        model = ActivityLog
        fields = ['action_type', 'description', 'timestamp']
        read_only_fields = fields

class ClientSerializer(serializers.ModelSerializer):
    """
    Updated Client serializer - removed name field, using username instead
    """
    username = serializers.CharField(source='user.username', read_only=True)
    phonenumber = serializers.CharField(source='user.phone_number', required=True)
    
    class Meta:
        model = Client
        fields = ['id', 'username', 'phonenumber', 'created_at']
        read_only_fields = ['id', 'username', 'created_at']
        
    def validate_phonenumber(self, value):
        """Validate phone number format and uniqueness"""
        if not value.startswith('+'):
            raise serializers.ValidationError("Phone number must include country code (e.g., +254...)")
        
        # Check if phone number already exists
        if User.objects.filter(phone_number=value).exists():
            raise serializers.ValidationError("A client with this phone number already exists.")
        
        return value

    def create(self, validated_data):
        """
        Custom create method to handle client user creation
        """
        phone_number = validated_data['user']['phone_number']
        
        # Check if user already exists with this phone number
        if User.objects.filter(phone_number=phone_number).exists():
            raise serializers.ValidationError({"phonenumber": "A client with this phone number already exists."})
        
        # Create the client user using the custom manager
        user = User.objects.create_client(phone_number=phone_number)
        
        # Create the client profile
        client = Client.objects.create(user=user)
        return client