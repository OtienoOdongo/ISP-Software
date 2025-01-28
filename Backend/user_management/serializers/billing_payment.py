from rest_framework import serializers
from user_management.models.billing_payment import UserBilling
from user_management.models.billing_payment import Payment
from user_management.serializers.plan_assignment import PlanSerializer

class UserBillingSerializer(serializers.ModelSerializer):
    """
    Serializer for UserBilling model.

    Attributes:
        Meta.model (UserBilling): The model class to serialize.
        Meta.fields (list): List of fields to include in serialization.
    """
    class Meta:
        model = UserBilling
        fields = ['user', 'phone_number']


class PaymentSerializer(serializers.ModelSerializer):
    """
    Serializer for Payment model. Includes nested serialization of the Plan.

    Attributes:
        plan (PlanSerializer): Nested serializer for the associated plan.
        Meta.model (Payment): The model class to serialize.
        Meta.fields (list): List of fields to include in serialization.
    """
    plan = PlanSerializer(read_only=True)

    class Meta:
        model = Payment
        fields = ['id', 'user', 'plan', 'date', 'amount', 'status']