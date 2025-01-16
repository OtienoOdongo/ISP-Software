from rest_framework import serializers
from ..models import UserBilling

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


from rest_framework import serializers
from ..models import Payment
from ..serializers import PlanSerializer

class PaymentSerializer(serializers.ModelSerializer):
    """
    Serializer for Payment model. Includes nested serialization of the Plan.

    Attributes:
        Meta.model (Payment): The model class to serialize.
        Meta.fields (list): List of fields to include in serialization.
    """
    plan = PlanSerializer()

    class Meta:
        model = Payment
        fields = ['id', 'user', 'plan', 'date', 'amount', 'status']