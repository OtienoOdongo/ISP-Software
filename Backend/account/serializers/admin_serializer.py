# account/serializers/admin_serializer.py
from rest_framework import serializers
from django.core.files.images import get_image_dimensions
from django.core.exceptions import ValidationError
from account.models.admin_model import Client, Subscription, Payment, ActivityLog, Router
from django.contrib.auth import get_user_model

User = get_user_model()

class AdminProfileSerializer(serializers.ModelSerializer):
    profile_pic = serializers.ImageField(max_length=None, use_url=True, allow_null=True, required=False)

    def validate_profile_pic(self, value):
        if value:
            # Validate file size (5MB limit)
            if value.size > 5 * 1024 * 1024:
                raise ValidationError("File size must be less than 5MB.")
            # Validate file type
            if not value.content_type.startswith('image/'):
                raise ValidationError("Please upload an image file.")
        return value

    class Meta:
        model = User
        fields = ('name', 'email', 'profile_pic')
        read_only_fields = ('email',)

class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = ('id', 'name', 'email', 'created_at')

class SubscriptionSerializer(serializers.ModelSerializer):
    client = ClientSerializer(read_only=True)  # Nested client info

    class Meta:
        model = Subscription
        fields = ('id', 'client', 'is_active', 'start_date', 'end_date')

class PaymentSerializer(serializers.ModelSerializer):
    client = ClientSerializer(read_only=True)  # Nested client info

    class Meta:
        model = Payment
        fields = ('id', 'client', 'amount', 'timestamp')

class StatsSerializer(serializers.Serializer):
    clients = serializers.IntegerField()
    active_clients = serializers.IntegerField()
    revenue = serializers.FloatField()
    uptime = serializers.CharField()

class ActivityLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityLog
        fields = ('description',)

class NetworkHealthSerializer(serializers.Serializer):
    latency = serializers.CharField()
    bandwidth = serializers.CharField()

class RouterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Router
        fields = ('name', 'status', 'color')




