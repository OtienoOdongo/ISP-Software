





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
#     Updated Client serializer - removed name field, using username instead
#     """
#     username = serializers.CharField(source='user.username', read_only=True)
#     phonenumber = serializers.CharField(source='user.phone_number', required=True)
    
#     class Meta:
#         model = Client
#         fields = ['id', 'username', 'phonenumber', 'created_at']
#         read_only_fields = ['id', 'username', 'created_at']
        
#     def validate_phonenumber(self, value):
#         """Validate phone number format and uniqueness"""
#         if not value.startswith('+'):
#             raise serializers.ValidationError("Phone number must include country code (e.g., +254...)")
        
#         # Check if phone number already exists
#         if User.objects.filter(phone_number=value).exists():
#             raise serializers.ValidationError("A client with this phone number already exists.")
        
#         return value

#     def create(self, validated_data):
#         """
#         Custom create method to handle client user creation
#         """
#         phone_number = validated_data['user']['phone_number']
        
#         # Check if user already exists with this phone number
#         if User.objects.filter(phone_number=phone_number).exists():
#             raise serializers.ValidationError({"phonenumber": "A client with this phone number already exists."})
        
#         # Create the client user using the custom manager
#         user = User.objects.create_client(phone_number=phone_number)
        
#         # Create the client profile
#         client = Client.objects.create(user=user)
#         return client






# from rest_framework import serializers
# from django.contrib.auth import get_user_model
# from account.models.admin_model import Client, ActivityLog, LoginHistory, Notification
# from payments.models.transaction_log_model import TransactionLog
# from internet_plans.models.create_plan_models import Subscription
# from network_management.models.router_management_model import RouterHealthCheck

# User = get_user_model()

# class AdminProfileSerializer(serializers.ModelSerializer):
#     profile_pic = serializers.ImageField(required=False, allow_empty_file=True)

#     class Meta:
#         model = User
#         fields = ['name', 'email', 'profile_pic', 'user_type', 'is_2fa_enabled']
#         read_only_fields = ['email', 'user_type']

# class StatsSerializer(serializers.Serializer):
#     clients = serializers.IntegerField()
#     active_clients = serializers.IntegerField()
#     revenue = serializers.DecimalField(max_digits=10, decimal_places=2)
#     uptime = serializers.CharField()
#     total_subscriptions = serializers.IntegerField()
#     successful_transactions = serializers.IntegerField()

# class ActivityLogSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = ActivityLog
#         fields = ['action_type', 'description', 'timestamp']
#         read_only_fields = fields

# class ClientSerializer(serializers.ModelSerializer):
#     """
#     Updated Client serializer - removed name field, using username instead
#     """
#     username = serializers.CharField(source='user.username', read_only=True)
#     phonenumber = serializers.CharField(source='user.phone_number', required=True)
    
#     class Meta:
#         model = Client
#         fields = ['id', 'username', 'phonenumber', 'created_at']
#         read_only_fields = ['id', 'username', 'created_at']
        
#     def validate_phonenumber(self, value):
#         """Validate phone number format and uniqueness"""
#         if not value.startswith('+'):
#             raise serializers.ValidationError("Phone number must include country code (e.g., +254...)")
        
#         # Check if phone number already exists
#         if User.objects.filter(phone_number=value).exists():
#             raise serializers.ValidationError("A client with this phone number already exists.")
        
#         return value

#     def create(self, validated_data):
#         """
#         Custom create method to handle client user creation
#         """
#         phone_number = validated_data['user']['phone_number']
        
#         # Check if user already exists with this phone number
#         if User.objects.filter(phone_number=phone_number).exists():
#             raise serializers.ValidationError({"phonenumber": "A client with this phone number already exists."})
        
#         # Create the client user using the custom manager
#         user = User.objects.create_client(phone_number=phone_number)
        
#         # Create the client profile
#         client = Client.objects.create(user=user)
#         return client


# class LoginHistorySerializer(serializers.ModelSerializer):
#     class Meta:
#         model = LoginHistory
#         fields = ['timestamp', 'ip_address', 'device', 'location', 'user_agent']

# class NotificationSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Notification
#         fields = ['id', 'type', 'title', 'message', 'timestamp', 'read', 'priority', 'related_id']









# from rest_framework import serializers
# from django.contrib.auth import get_user_model
# from account.models.admin_model import Client, ActivityLog, LoginHistory, Notification
# from payments.models.transaction_log_model import TransactionLog
# from internet_plans.models.create_plan_models import Subscription
# from network_management.models.router_management_model import RouterHealthCheck
# from phonenumber_field.serializerfields import PhoneNumberField
# from rest_framework.validators import UniqueValidator

# User = get_user_model()

# class AdminProfileSerializer(serializers.ModelSerializer):
#     profile_pic = serializers.ImageField(required=False, allow_empty_file=True)
#     metadata = serializers.JSONField(required=False)

#     class Meta:
#         model = User
#         fields = ['name', 'email', 'profile_pic', 'user_type', 'is_2fa_enabled', 'metadata']
#         read_only_fields = ['email', 'user_type']

#     def validate_name(self, value):
#         if len(value) < 3:
#             raise serializers.ValidationError("Name must be at least 3 characters.")
#         return value

# class StatsSerializer(serializers.Serializer):
#     clients = serializers.IntegerField()
#     active_clients = serializers.IntegerField()
#     revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
#     uptime = serializers.CharField()
#     total_subscriptions = serializers.IntegerField()
#     successful_transactions = serializers.IntegerField()

# class ActivityLogSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = ActivityLog
#         fields = ['id', 'action_type', 'description', 'timestamp', 'is_critical', 'metadata']
#         read_only_fields = fields

# class ClientSerializer(serializers.ModelSerializer):
#     """
#     Enhanced Client serializer with phone validation and metadata.
#     """
#     username = serializers.CharField(source='user.username', read_only=True)
#     phone_number = PhoneNumberField(source='user.phone_number', required=True, validators=[UniqueValidator(queryset=User.objects.all())])
#     metadata = serializers.JSONField(required=False)

#     class Meta:
#         model = Client
#         fields = ['id', 'username', 'phone_number', 'created_at', 'metadata']
#         read_only_fields = ['id', 'username', 'created_at']

#     def validate_phone_number(self, value):
#         if not value:
#             raise serializers.ValidationError("Phone number is required.")
#         return value

#     def create(self, validated_data):
#         phone_number = validated_data.pop('user')['phone_number']
#         metadata = validated_data.pop('metadata', {})
#         user = User.objects.create_client(phone_number=phone_number)
#         client = Client.objects.create(user=user, metadata=metadata)
#         return client

# class LoginHistorySerializer(serializers.ModelSerializer):
#     class Meta:
#         model = LoginHistory
#         fields = ['id', 'timestamp', 'ip_address', 'device', 'location', 'user_agent', 'is_suspicious']

# class NotificationSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Notification
#         fields = ['id', 'type', 'title', 'message', 'timestamp', 'read', 'priority', 'related_id', 'metadata']







# account/serializers/admin_serializer.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from account.models.admin_model import Client, ActivityLog, LoginHistory, Notification
from payments.models.transaction_log_model import TransactionLog
from internet_plans.models.create_plan_models import Subscription
from network_management.models.router_management_model import RouterHealthCheck
from phonenumber_field.serializerfields import PhoneNumberField
from rest_framework.validators import UniqueValidator

User = get_user_model()

class AdminProfileSerializer(serializers.ModelSerializer):
    profile_pic = serializers.ImageField(required=False, allow_empty_file=True)
    metadata = serializers.JSONField(required=False)

    class Meta:
        model = User
        fields = ['name', 'email', 'profile_pic', 'user_type', 'is_2fa_enabled', 'metadata']
        read_only_fields = ['email', 'user_type']

    def validate_name(self, value):
        if len(value) < 3:
            raise serializers.ValidationError("Name must be at least 3 characters.")
        return value

class StatsSerializer(serializers.Serializer):
    clients = serializers.IntegerField()
    active_clients = serializers.IntegerField()
    revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
    uptime = serializers.CharField()
    total_subscriptions = serializers.IntegerField()
    successful_transactions = serializers.IntegerField()

class ActivityLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityLog
        fields = ['id', 'action_type', 'description', 'timestamp', 'is_critical', 'metadata']
        read_only_fields = fields

class ClientSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    phone_number = PhoneNumberField(source='user.phone_number', required=True, validators=[UniqueValidator(queryset=User.objects.all())])
    metadata = serializers.JSONField(required=False)

    class Meta:
        model = Client
        fields = ['id', 'username', 'phone_number', 'created_at', 'metadata']
        read_only_fields = ['id', 'username', 'created_at']

    def validate_phone_number(self, value):
        if not value:
            raise serializers.ValidationError("Phone number is required.")
        return value

    def create(self, validated_data):
        phone_number = validated_data.pop('user')['phone_number']
        metadata = validated_data.pop('metadata', {})
        user = User.objects.create_client(phone_number=phone_number)
        client = Client.objects.create(user=user, metadata=metadata)
        return client

class LoginHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = LoginHistory
        fields = ['id', 'timestamp', 'ip_address', 'device', 'location', 'user_agent', 'is_suspicious']

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'type', 'title', 'message', 'timestamp', 'read', 'priority', 'related_id', 'metadata']