from rest_framework import serializers
from user_management.models.billing_payment import UserBilling, Payment
from user_management.serializers.plan_assignment import PlanSerializer

class UserBillingSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserBilling
        fields = ['user', 'phone_number']

class PaymentSerializer(serializers.ModelSerializer):
    plan = PlanSerializer(read_only=True)

    class Meta:
        model = Payment
        fields = ['id', 'user', 'plan', 'date', 'amount', 'status']  