from rest_framework import serializers
from authentication.models import UserAccount
from account.models.admin_model import Client, Subscription, Payment, ActivityLog, Router

# Client Serializer
class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = ['id', 'created_at', 'is_active']

# Subscription Serializer
class SubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscription
        fields = ['id', 'client', 'plan_type', 'start_date', 'end_date', 'is_active']

# Payment Serializer
class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['id', 'client', 'amount', 'transaction_id', 'timestamp', 'subscription']

# Admin Profile Serializer
class AdminProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserAccount
        fields = ['name', 'email', 'profile_pic']
        read_only_fields = ['email']

    profile_pic = serializers.ImageField(required=False, allow_null=True)

# Stats Serializer
class StatsSerializer(serializers.Serializer):
    clients = serializers.IntegerField()
    active_clients = serializers.IntegerField()
    revenue = serializers.DecimalField(max_digits=10, decimal_places=2)
    uptime = serializers.CharField()

# ActivityLog Serializer
class ActivityLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityLog
        fields = ['description']

# NetworkHealth Serializer
class NetworkHealthSerializer(serializers.Serializer):
    latency = serializers.CharField()
    bandwidth = serializers.CharField()

# Router Serializer
class RouterSerializer(serializers.ModelSerializer):
    color = serializers.SerializerMethodField()

    class Meta:
        model = Router
        fields = ['name', 'status', 'color']

    def get_color(self, obj):
        return 'green' if obj.status == 'Online' else 'red'


