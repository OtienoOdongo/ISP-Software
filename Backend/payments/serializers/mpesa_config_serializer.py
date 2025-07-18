

from rest_framework import serializers
from payments.models.mpesa_config_model import PaymentMethodConfig, ConfigurationHistory, Transaction
from account.models.admin_model import Client, Subscription
from account.serializers.admin_serializer import ClientSerializer, SubscriptionSerializer
from internet_plans.serializers.create_plan_serializers import InternetPlanSerializer
from decimal import Decimal

class PaymentMethodConfigSerializer(serializers.ModelSerializer):
    method_type_label = serializers.CharField(source='get_method_type_display', read_only=True)
    security_level_label = serializers.CharField(source='get_security_level_display', read_only=True)
    client = serializers.StringRelatedField()
    test_connection_url = serializers.SerializerMethodField()
    webhook_secret_display = serializers.SerializerMethodField()
    method_metadata = serializers.SerializerMethodField()
    kenyan_banks = serializers.SerializerMethodField()

    class Meta:
        model = PaymentMethodConfig
        fields = '__all__'
        extra_kwargs = {
            'secret_key': {'write_only': True},
            'pass_key': {'write_only': True},
            'secret': {'write_only': True},
            'webhook_secret': {'write_only': True},
        }

    def get_test_connection_url(self, obj):
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(f'/api/payments/config/{obj.id}/test/')
        return None

    def get_webhook_secret_display(self, obj):
        if obj.webhook_secret:
            return f"{obj.webhook_secret[:4]}...{obj.webhook_secret[-4:]}"
        return None

    def get_method_metadata(self, obj):
        return obj.get_method_metadata()

    def get_kenyan_banks(self, obj):
        return obj.KENYAN_BANKS

    def validate(self, data):
        method_type = data.get('method_type', self.instance.method_type if self.instance else None)
        is_active = data.get('is_active', self.instance.is_active if self.instance else True)

        if is_active:
            if method_type == 'mpesa_paybill' and not all([
                data.get('short_code'), 
                data.get('pass_key'), 
                data.get('api_key'), 
                data.get('secret_key')
            ]):
                raise serializers.ValidationError("M-Pesa Paybill requires short_code, pass_key, api_key, and secret_key.")
            elif method_type == 'mpesa_till' and not all([
                data.get('till_number'), 
                data.get('store_number'), 
                data.get('pass_key')
            ]):
                raise serializers.ValidationError("M-Pesa Till requires till_number, store_number, and pass_key.")
            elif method_type == 'paypal' and not all([
                data.get('paypal_client_id'), 
                data.get('secret'), 
                data.get('merchant_id')
            ]):
                raise serializers.ValidationError("PayPal requires paypal_client_id, secret, and merchant_id.")
            elif method_type == 'bank' and not all([
                data.get('bank_name'), 
                data.get('account_number'), 
                data.get('account_name')
            ]):
                raise serializers.ValidationError("Bank Transfer requires bank_name, account_number, and account_name.")
            
            if method_type == 'bank' and data.get('bank_name'):
                valid_banks = [bank['name'] for bank in PaymentMethodConfig.KENYAN_BANKS]
                if data['bank_name'] not in valid_banks:
                    raise serializers.ValidationError(f"Invalid bank name. Must be one of: {', '.join(valid_banks)}")
        return data

class ConfigurationHistorySerializer(serializers.ModelSerializer):
    client = serializers.StringRelatedField()
    action_label = serializers.CharField(source='get_action_display', read_only=True)
    status_label = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = ConfigurationHistory
        fields = '__all__'

class TransactionSerializer(serializers.ModelSerializer):
    client = ClientSerializer(read_only=True)
    plan = InternetPlanSerializer(read_only=True)
    payment_method = serializers.StringRelatedField()
    security_level_label = serializers.CharField(source='get_security_level_display', read_only=True)
    subscription = SubscriptionSerializer(read_only=True)
    amount = serializers.DecimalField(max_digits=10, decimal_places=2, coerce_to_string=False)

    class Meta:
        model = Transaction
        fields = '__all__'

