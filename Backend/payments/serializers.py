from rest_framework import serializers
from .models import Transaction, PaymentGateway


class TransactionSerializer(serializers.ModelSerializer):
    """
    Serializer for the Transaction model.
    """

    class Meta:
        model = Transaction
        fields = "__all__"


class PaymentGatewaySerializer(serializers.ModelSerializer):
    """
    Serializer for the PaymentGateway model.
    """

    class Meta:
        model = PaymentGateway
        fields = "__all__"
