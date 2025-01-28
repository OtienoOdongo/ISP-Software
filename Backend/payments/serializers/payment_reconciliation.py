from rest_framework import serializers
from payments.models.payment_reconciliation import PaymentTransaction

class PaymentTransactionSerializer(serializers.ModelSerializer):
    """
    Serializer for PaymentTransaction model to convert model instances to/from native Python datatypes.
    """
    class Meta:
        model = PaymentTransaction
        fields = ['id', 'date', 'amount', 'status', 'type', 'reference']