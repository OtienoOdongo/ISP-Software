from rest_framework import serializers
from payments.models.mpesa_transaction_log import MpesaTransaction

class MpesaTransactionSerializer(serializers.ModelSerializer):
    """
    Serializer for MpesaTransaction model to convert model instances to/from native Python datatypes.
    """
    class Meta:
        model = MpesaTransaction
        fields = ['id', 'transaction_id', 'amount', 'status', 'date', 'user']