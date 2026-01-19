



# # account/serializers/admin_serializer.py
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







from rest_framework import serializers
from django.contrib.auth import get_user_model
from account.models.admin_model import (
    Client, ActivityLog, LoginHistory, Notification, 
    PPPoEConnectionLog, HotspotSessionLog
)
from payments.models.transaction_log_model import TransactionLog
from service_operations.models.subscription_models import Subscription
from network_management.models.router_management_model import RouterHealthCheck
from phonenumber_field.serializerfields import PhoneNumberField
from rest_framework.validators import UniqueValidator
from django.utils import timezone

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
    # General stats
    clients = serializers.IntegerField()
    active_clients = serializers.IntegerField()
    revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
    uptime = serializers.CharField()
    total_subscriptions = serializers.IntegerField()
    successful_transactions = serializers.IntegerField()
    
    # Connection specific stats
    hotspot_clients = serializers.IntegerField()
    pppoe_clients = serializers.IntegerField()
    online_clients = serializers.IntegerField()
    offline_clients = serializers.IntegerField()
    
    # Usage stats
    total_data_used = serializers.CharField()
    average_session_duration = serializers.CharField()

class ClientConnectionStatsSerializer(serializers.Serializer):
    total_connections = serializers.IntegerField()
    total_duration = serializers.DurationField()
    average_duration = serializers.DurationField()
    total_data_used = serializers.IntegerField()

class ActivityLogSerializer(serializers.ModelSerializer):
    user_display = serializers.CharField(source='user.get_display_name', read_only=True)
    related_user_display = serializers.CharField(source='related_user.get_display_name', read_only=True)
    related_client_display = serializers.CharField(source='related_client.user.username', read_only=True)

    class Meta:
        model = ActivityLog
        fields = [
            'id', 'action_type', 'description', 'timestamp', 'is_critical', 
            'metadata', 'user_display', 'related_user_display', 'related_client_display'
        ]
        read_only_fields = fields

class ClientSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    phone_number = PhoneNumberField(source='user.phone_number', read_only=True)
    connection_type = serializers.CharField(source='user.connection_type', read_only=True)
    client_id = serializers.CharField(source='user.client_id', read_only=True)
    pppoe_username = serializers.CharField(source='user.pppoe_username', read_only=True)
    data_usage_percentage = serializers.FloatField(read_only=True)
    data_used_display = serializers.CharField(read_only=True)
    data_capacity_display = serializers.CharField(read_only=True)
    data_remaining_display = serializers.SerializerMethodField()
    is_online = serializers.BooleanField(read_only=True)
    total_connection_time_display = serializers.SerializerMethodField()

    class Meta:
        model = Client
        fields = [
            'id', 'username', 'phone_number', 'connection_type', 'client_id',
            'connection_status', 'last_connection', 'total_connection_time',
            'total_connection_time_display', 'data_used', 'data_capacity',
            'data_used_display', 'data_capacity_display', 'data_remaining_display',
            'data_usage_percentage', 'pppoe_username', 'pppoe_service_name',
            'pppoe_local_ip', 'pppoe_remote_ip', 'hotspot_mac_address',
            'hotspot_session_id', 'created_at', 'last_updated', 'metadata',
            'notes', 'is_online'
        ]
        read_only_fields = [
            'id', 'username', 'phone_number', 'connection_type', 'client_id',
            'last_connection', 'total_connection_time', 'data_used_display',
            'data_capacity_display', 'data_remaining_display', 'data_usage_percentage',
            'pppoe_username', 'created_at', 'last_updated', 'is_online'
        ]

    def get_data_remaining_display(self, obj):
        return obj.data_remaining_display

    def get_total_connection_time_display(self, obj):
        """Format total connection time for display"""
        if not obj.total_connection_time:
            return "0h 0m"
        
        total_seconds = int(obj.total_connection_time.total_seconds())
        hours = total_seconds // 3600
        minutes = (total_seconds % 3600) // 60
        return f"{hours}h {minutes}m"

    def validate(self, attrs):
        # Validate connection-specific fields
        connection_type = self.instance.user.connection_type if self.instance else None
        
        if connection_type == 'pppoe':
            if 'hotspot_mac_address' in attrs or 'hotspot_session_id' in attrs:
                raise serializers.ValidationError("Hotspot fields cannot be set for PPPoE clients")
        elif connection_type == 'hotspot':
            if 'pppoe_service_name' in attrs or 'pppoe_local_ip' in attrs or 'pppoe_remote_ip' in attrs:
                raise serializers.ValidationError("PPPoE fields cannot be set for Hotspot clients")
        
        return attrs

class ClientDetailSerializer(ClientSerializer):
    """Extended serializer for client detail view with connection logs"""
    pppoe_connection_logs = serializers.SerializerMethodField()
    hotspot_session_logs = serializers.SerializerMethodField()
    active_subscription = serializers.SerializerMethodField()
    recent_transactions = serializers.SerializerMethodField()

    class Meta(ClientSerializer.Meta):
        fields = ClientSerializer.Meta.fields + [
            'pppoe_connection_logs', 'hotspot_session_logs', 
            'active_subscription', 'recent_transactions'
        ]

    def get_pppoe_connection_logs(self, obj):
        if obj.is_pppoe:
            logs = obj.pppoe_connection_logs.all()[:10]  # Last 10 sessions
            return PPPoEConnectionLogSerializer(logs, many=True).data
        return []

    def get_hotspot_session_logs(self, obj):
        if obj.is_hotspot:
            logs = obj.hotspot_session_logs.all()[:10]  # Last 10 sessions
            return HotspotSessionLogSerializer(logs, many=True).data
        return []

    def get_active_subscription(self, obj):
        try:
            active_sub = obj.user.subscriptions.filter(
                status='active', 
                is_active=True
            ).first()
            if active_sub:
                from internet_plans.serializers.create_plan_serializers import SubscriptionSerializer
                return SubscriptionSerializer(active_sub).data
        except Exception:
            pass
        return None

    def get_recent_transactions(self, obj):
        try:
            transactions = TransactionLog.objects.filter(
                client=obj.user
            ).order_by('-created_at')[:5]
            from payments.serializers.transaction_log_serializer import TransactionLogSerializer
            return TransactionLogSerializer(transactions, many=True).data
        except Exception:
            return []

class PPPoEConnectionLogSerializer(serializers.ModelSerializer):
    duration_display = serializers.SerializerMethodField()
    data_used_display = serializers.SerializerMethodField()

    class Meta:
        model = PPPoEConnectionLog
        fields = [
            'id', 'session_start', 'session_end', 'duration', 'duration_display',
            'local_ip', 'remote_ip', 'data_sent', 'data_received', 'data_used_display',
            'termination_reason', 'router_identifier'
        ]
        read_only_fields = fields

    def get_duration_display(self, obj):
        if obj.duration:
            total_seconds = int(obj.duration.total_seconds())
            hours = total_seconds // 3600
            minutes = (total_seconds % 3600) // 60
            return f"{hours}h {minutes}m"
        return "N/A"

    def get_data_used_display(self, obj):
        total_bytes = obj.data_sent + obj.data_received
        if total_bytes >= 1024 ** 3:  # GB
            return f"{(total_bytes / (1024 ** 3)):.2f} GB"
        elif total_bytes >= 1024 ** 2:  # MB
            return f"{(total_bytes / (1024 ** 2)):.2f} MB"
        elif total_bytes >= 1024:  # KB
            return f"{(total_bytes / 1024):.2f} KB"
        else:
            return f"{total_bytes} B"

class HotspotSessionLogSerializer(serializers.ModelSerializer):
    duration_display = serializers.SerializerMethodField()
    data_used_display = serializers.SerializerMethodField()

    class Meta:
        model = HotspotSessionLog
        fields = [
            'id', 'session_start', 'session_end', 'duration', 'duration_display',
            'mac_address', 'ip_address', 'data_used', 'data_used_display',
            'router_identifier', 'session_id'
        ]
        read_only_fields = fields

    def get_duration_display(self, obj):
        if obj.duration:
            total_seconds = int(obj.duration.total_seconds())
            hours = total_seconds // 3600
            minutes = (total_seconds % 3600) // 60
            return f"{hours}h {minutes}m"
        return "N/A"

    def get_data_used_display(self, obj):
        bytes_val = obj.data_used
        if bytes_val >= 1024 ** 3:  # GB
            return f"{(bytes_val / (1024 ** 3)):.2f} GB"
        elif bytes_val >= 1024 ** 2:  # MB
            return f"{(bytes_val / (1024 ** 2)):.2f} MB"
        elif bytes_val >= 1024:  # KB
            return f"{(bytes_val / 1024):.2f} KB"
        else:
            return f"{bytes_val} B"

class LoginHistorySerializer(serializers.ModelSerializer):
    user_display = serializers.CharField(source='user.get_display_name', read_only=True)

    class Meta:
        model = LoginHistory
        fields = [
            'id', 'timestamp', 'ip_address', 'device', 'location', 
            'user_agent', 'login_type', 'is_suspicious', 'user_display'
        ]

class NotificationSerializer(serializers.ModelSerializer):
    related_client_display = serializers.CharField(
        source='related_client.user.username', 
        read_only=True
    )

    class Meta:
        model = Notification
        fields = [
            'id', 'type', 'title', 'message', 'timestamp', 'read', 
            'priority', 'related_client', 'related_client_display',
            'related_id', 'metadata'
        ]

class ClientCreateSerializer(serializers.ModelSerializer):
    phone_number = PhoneNumberField(required=True)
    connection_type = serializers.ChoiceField(
        choices=[('hotspot', 'Hotspot'), ('pppoe', 'PPPoE')],
        required=True
    )
    generate_pppoe_credentials = serializers.BooleanField(default=True, write_only=True)

    class Meta:
        model = Client
        fields = ['phone_number', 'connection_type', 'generate_pppoe_credentials', 'notes']

    def validate(self, attrs):
        phone_number = attrs.get('phone_number')
        connection_type = attrs.get('connection_type')

        # Check if user already exists with this phone number
        if User.objects.filter(phone_number=phone_number).exists():
            raise serializers.ValidationError({
                "phone_number": "A client with this phone number already exists."
            })

        return attrs

    def create(self, validated_data):
        phone_number = validated_data.pop('phone_number')
        connection_type = validated_data.pop('connection_type')
        generate_pppoe_credentials = validated_data.pop('generate_pppoe_credentials', True)
        notes = validated_data.pop('notes', '')

        # Create user based on connection type
        if connection_type == 'hotspot':
            user = User.objects.create_hotspot_client(phone_number=phone_number)
        else:
            user = User.objects.create_pppoe_client(phone_number=phone_number)
            if not generate_pppoe_credentials:
                user.pppoe_username = None
                user.pppoe_password = None
                user.save()

        # Create client profile
        client = Client.objects.create(
            user=user,
            notes=notes,
            **validated_data
        )

        return client