from rest_framework import serializers
from payments.models.mpesa_config_model import Transaction
from internet_plans.serializers.create_plan_serializers import InternetPlanSerializer

class TransactionSerializer(serializers.ModelSerializer):
    plan = InternetPlanSerializer(read_only=True)  # Nested plan info

    class Meta:
        model = Transaction
        fields = ('id', 'amount', 'checkout_id', 'mpesa_code', 'phone_number',
                   'status', 'timestamp', 'plan')
        read_only_fields = ('timestamp', 'checkout_id', 'mpesa_code', 'status')