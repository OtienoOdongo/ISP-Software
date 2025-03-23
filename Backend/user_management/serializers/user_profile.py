from rest_framework import serializers
from user_management.models.user_profile import UserProfile
from account.models.admin_model import Client
from account.serializers.admin_serializer import ClientSerializer

class UserProfileSerializer(serializers.ModelSerializer):
    client = serializers.SerializerMethodField()
    is_subscription_active = serializers.ReadOnlyField()

    class Meta:
        model = UserProfile
        fields = [
            'id',
            'client',
            'last_login',
            'active',
            'data_used',
            'data_total',
            'data_unit',
            'payment_status',
            'subscription_plan',
            'subscription_start_date',
            'subscription_expiry_date',
            'is_subscription_active'
        ]

    def get_client(self, obj):
        """
        Serialize the associated Client object or return None if unavailable.
        """
        try:
            if obj.client:
                return ClientSerializer(obj.client).data
            return None
        except Client.DoesNotExist:
            return None
        except Exception as e:
            # Log the error if needed, but return None to keep API response clean
            return None