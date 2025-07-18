



# from rest_framework import serializers
# from django.core.files.images import get_image_dimensions
# from django.core.exceptions import ValidationError
# from account.models.admin_model import Client, Subscription, Payment, ActivityLog, Router
# from django.contrib.auth import get_user_model
# from phonenumber_field.modelfields import PhoneNumberField
# from decimal import Decimal
# from internet_plans.models.create_plan_models import InternetPlan
# from internet_plans.serializers.create_plan_serializers import InternetPlanSerializer
# from payments.models.mpesa_config_model import Transaction
# from payments.serializers.mpesa_config_serializer import TransactionSerializer

# User = get_user_model()

# class AdminProfileSerializer(serializers.ModelSerializer):
#     profile_pic = serializers.ImageField(max_length=None, use_url=True, allow_null=True, required=False)

#     def validate_profile_pic(self, value):
#         if value:
#             if value.size > 5 * 1024 * 1024:
#                 raise ValidationError("File size must be less than 5MB.")
#             if not value.content_type.startswith('image/'):
#                 raise ValidationError("Please upload an image file.")
#         return value

#     class Meta:
#         model = User
#         fields = ('name', 'email', 'profile_pic')
#         read_only_fields = ('email',)

# class ClientSerializer(serializers.ModelSerializer):
#     phonenumber = serializers.CharField()

#     def validate_phonenumber(self, value):
#         # Handle formats: 07XXXXXXXX (10 digits), +254XXXXXXXXX (13 digits with +)
#         if value.startswith("07") and len(value) == 10:
#             return f"+254{value[2:]}"
#         elif value.startswith("+254") and len(value) == 13:
#             return value
#         elif value.startswith("254") and len(value) == 12:
#             return f"+{value}"
#         raise serializers.ValidationError("Phone number must be in the format 07XXXXXXXX or +254XXXXXXXXX.")

#     class Meta:
#         model = Client
#         fields = ('id', 'full_name', 'phonenumber', 'created_at')

# class SubscriptionSerializer(serializers.ModelSerializer):
#     client = ClientSerializer(read_only=True)
#     internet_plan = InternetPlanSerializer(read_only=True)

#     class Meta:
#         model = Subscription
#         fields = ('id', 'client', 'internet_plan', 'is_active', 'start_date', 'end_date')

# class PaymentSerializer(serializers.ModelSerializer):
#     client = ClientSerializer(read_only=True)
#     amount = serializers.DecimalField(max_digits=10, decimal_places=2, coerce_to_string=False)
#     transaction = TransactionSerializer(read_only=True)
#     subscription = SubscriptionSerializer(read_only=True)

#     class Meta:
#         model = Payment
#         fields = ('id', 'client', 'amount', 'timestamp', 'transaction', 'subscription')

# class StatsSerializer(serializers.Serializer):
#     clients = serializers.IntegerField()
#     active_clients = serializers.IntegerField()
#     revenue = serializers.FloatField()
#     uptime = serializers.CharField()
#     total_subscriptions = serializers.IntegerField()
#     successful_transactions = serializers.IntegerField()

# class ActivityLogSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = ActivityLog
#         fields = ('description', 'timestamp')

# class NetworkHealthSerializer(serializers.Serializer):
#     latency = serializers.CharField()
#     bandwidth = serializers.CharField()

# class RouterSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Router
#         fields = ('name', 'status', 'color', 'latency', 'bandwidth_usage')




# from rest_framework import serializers
# from django.core.files.images import get_image_dimensions
# from django.core.exceptions import ValidationError
# from account.models.admin_model import Client, Subscription, ActivityLog, Router
# from django.contrib.auth import get_user_model
# from phonenumber_field.modelfields import PhoneNumberField
# from internet_plans.models.create_plan_models import InternetPlan
# from internet_plans.serializers.create_plan_serializers import InternetPlanSerializer

# User = get_user_model()

# class AdminProfileSerializer(serializers.ModelSerializer):
#     profile_pic = serializers.ImageField(max_length=None, use_url=True, allow_null=True, required=False)

#     def validate_profile_pic(self, value):
#         if value:
#             if value.size > 5 * 1024 * 1024:
#                 raise ValidationError("File size must be less than 5MB.")
#             if not value.content_type.startswith('image/'):
#                 raise ValidationError("Please upload an image file.")
#         return value

#     class Meta:
#         model = User
#         fields = ('name', 'email', 'profile_pic')
#         read_only_fields = ('email',)

# class ClientSerializer(serializers.ModelSerializer):
#     phonenumber = serializers.CharField()

#     def validate_phonenumber(self, value):
#         if value.startswith("07") and len(value) == 10:
#             return f"+254{value[2:]}"
#         elif value.startswith("+254") and len(value) == 13:
#             return value
#         elif value.startswith("254") and len(value) == 12:
#             return f"+{value}"
#         raise serializers.ValidationError("Phone number must be in the format 07XXXXXXXX or +254XXXXXXXXX.")

#     class Meta:
#         model = Client
#         fields = ('id', 'full_name', 'phonenumber', 'created_at')

# class SubscriptionSerializer(serializers.ModelSerializer):
#     client = ClientSerializer(read_only=True)
#     internet_plan = InternetPlanSerializer(read_only=True)

#     class Meta:
#         model = Subscription
#         fields = ('id', 'client', 'internet_plan', 'is_active', 'start_date', 'end_date')

# class StatsSerializer(serializers.Serializer):
#     clients = serializers.IntegerField()
#     active_clients = serializers.IntegerField()
#     revenue = serializers.FloatField()
#     uptime = serializers.CharField()
#     total_subscriptions = serializers.IntegerField()
#     successful_transactions = serializers.IntegerField()

# class ActivityLogSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = ActivityLog
#         fields = ('description', 'timestamp')

# class NetworkHealthSerializer(serializers.Serializer):
#     latency = serializers.CharField()
#     bandwidth = serializers.CharField()

# class RouterSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Router
#         fields = ('name', 'status', 'color', 'latency', 'bandwidth_usage')





from rest_framework import serializers
from django.core.files.images import get_image_dimensions
from django.core.exceptions import ValidationError
from account.models.admin_model import Client, Subscription, ActivityLog
from django.contrib.auth import get_user_model
from phonenumber_field.modelfields import PhoneNumberField
from internet_plans.models.create_plan_models import InternetPlan
from internet_plans.serializers.create_plan_serializers import InternetPlanSerializer

User = get_user_model()

class AdminProfileSerializer(serializers.ModelSerializer):
    profile_pic = serializers.ImageField(max_length=None, use_url=True, allow_null=True, required=False)

    def validate_profile_pic(self, value):
        if value:
            if value.size > 5 * 1024 * 1024:
                raise ValidationError("File size must be less than 5MB.")
            if not value.content_type.startswith('image/'):
                raise ValidationError("Please upload an image file.")
        return value

    class Meta:
        model = User
        fields = ('name', 'email', 'profile_pic')
        read_only_fields = ('email',)

class ClientSerializer(serializers.ModelSerializer):
    phonenumber = serializers.CharField()

    def validate_phonenumber(self, value):
        if value.startswith("07") and len(value) == 10:
            return f"+254{value[2:]}"
        elif value.startswith("+254") and len(value) == 13:
            return value
        elif value.startswith("254") and len(value) == 12:
            return f"+{value}"
        raise serializers.ValidationError("Phone number must be in the format 07XXXXXXXX or +254XXXXXXXXX.")

    class Meta:
        model = Client
        fields = ('id', 'full_name', 'phonenumber', 'created_at')

class SubscriptionSerializer(serializers.ModelSerializer):
    client = ClientSerializer(read_only=True)
    internet_plan = InternetPlanSerializer(read_only=True)

    class Meta:
        model = Subscription
        fields = ('id', 'client', 'internet_plan', 'is_active', 'start_date', 'end_date')

class StatsSerializer(serializers.Serializer):
    clients = serializers.IntegerField()
    active_clients = serializers.IntegerField()
    revenue = serializers.FloatField()
    uptime = serializers.CharField()
    total_subscriptions = serializers.IntegerField()
    successful_transactions = serializers.IntegerField()

class ActivityLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityLog
        fields = ('description', 'timestamp')

class NetworkHealthSerializer(serializers.Serializer):
    latency = serializers.CharField()
    bandwidth = serializers.CharField()