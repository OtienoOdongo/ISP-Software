




# from rest_framework import serializers
# from django.utils import timezone
# from django.utils.crypto import get_random_string
# from django.db import IntegrityError
# import json
# import time
# from phonenumber_field.serializerfields import PhoneNumberField
# from payments.models.payment_config_model import (
#     PaymentGateway,
#     MpesaConfig,
#     PayPalConfig,
#     BankConfig,
#     ClientPaymentMethod,
#     Transaction,
#     ConfigurationHistory,
#     WebhookLog,
#     PaymentAnalytics,
#     CallbackDeliveryLog,
# )
# from account.models.admin_model import Client
# import logging

# logger = logging.getLogger(__name__)

# class PaymentGatewaySerializer(serializers.ModelSerializer):
#     type_display = serializers.CharField(source='get_name_display', read_only=True)
#     security_level_display = serializers.CharField(source='get_security_level_display', read_only=True)
#     config = serializers.SerializerMethodField()
#     created_by_name = serializers.SerializerMethodField()
#     is_operational = serializers.SerializerMethodField()

#     class Meta:
#         model = PaymentGateway
#         fields = [
#             'id',
#             'name',
#             'type_display',
#             'is_active',
#             'sandbox_mode',
#             'transaction_limit',
#             'auto_settle',
#             'security_level',
#             'security_level_display',
#             'webhook_secret',
#             'config',
#             'health_status',
#             'last_health_check',
#             'is_operational',
#             'created_by',
#             'created_by_name',
#             'created_at',
#             'updated_at',
#         ]
#         read_only_fields = [
#             'id',
#             'type_display',
#             'security_level_display',
#             'config',
#             'created_by',
#             'created_by_name',
#             'created_at',
#             'updated_at',
#             'webhook_secret',
#             'health_status',
#             'last_health_check',
#             'is_operational',
#         ]
#         extra_kwargs = {
#             'webhook_secret': {'write_only': True},
#         }

#     def get_config(self, obj):
#         if obj.name in ['mpesa_paybill', 'mpesa_till'] and hasattr(obj, 'mpesaconfig'):
#             return MpesaConfigSerializer(obj.mpesaconfig).data
#         elif obj.name == 'paypal' and hasattr(obj, 'paypalconfig'):
#             return PayPalConfigSerializer(obj.paypalconfig).data
#         elif obj.name == 'bank_transfer' and hasattr(obj, 'bankconfig'):
#             return BankConfigSerializer(obj.bankconfig).data
#         return None

#     def get_created_by_name(self, obj):
#         return obj.created_by.username if obj.created_by else "System"

#     def get_is_operational(self, obj):
#         return obj.is_active and obj.health_status == 'healthy'

#     def create(self, validated_data):
#         instance = super().create(validated_data)
#         instance.generate_webhook_secret()
#         instance.save()

#         ConfigurationHistory.track_changes(
#             instance=instance,
#             user=self.context['request'].user,
#             action='create',
#             changed_fields=list(validated_data.keys()),
#         )
#         return instance

#     def update(self, instance, validated_data):
#         old_values = {field: getattr(instance, field) for field in validated_data.keys()}
#         instance = super().update(instance, validated_data)

#         ConfigurationHistory.track_changes(
#             instance=instance,
#             user=self.context['request'].user,
#             action='update',
#             changed_fields=list(validated_data.keys()),
#         )
#         return instance


# class MpesaConfigSerializer(serializers.ModelSerializer):
#     short_code = serializers.CharField(read_only=True)
#     is_paybill = serializers.SerializerMethodField()

#     class Meta:
#         model = MpesaConfig
#         fields = [
#             'id',
#             'gateway',
#             'paybill_number',
#             'till_number',
#             'short_code',
#             'is_paybill',
#             'consumer_key',
#             'consumer_secret',
#             'passkey',
#             'callback_url',
#             'initiator_name',
#             'security_credential',
#         ]
#         extra_kwargs = {
#             'consumer_key': {'write_only': True},
#             'consumer_secret': {'write_only': True},
#             'passkey': {'write_only': True},
#             'security_credential': {'write_only': True},
#             'gateway': {'read_only': True},
#         }

#     def get_is_paybill(self, obj):
#         return bool(obj.paybill_number)

#     def validate(self, data):
#         if not data.get('paybill_number') and not data.get('till_number'):
#             raise serializers.ValidationError("Either paybill number or till number must be set")
#         if data.get('paybill_number') and data.get('till_number'):
#             raise serializers.ValidationError("Cannot have both paybill and till number")
#         required_fields = ['consumer_key', 'consumer_secret', 'passkey', 'callback_url']
#         for field in required_fields:
#             if not data.get(field):
#                 raise serializers.ValidationError(f"{field} is required")
#         return data


# class PayPalConfigSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = PayPalConfig
#         fields = [
#             'id',
#             'gateway',
#             'client_id',
#             'secret',
#             'merchant_id',
#             'callback_url',
#             'webhook_id',
#             'bn_code',
#         ]
#         extra_kwargs = {
#             'client_id': {'write_only': True},
#             'secret': {'write_only': True},
#             'merchant_id': {'write_only': True},
#             'gateway': {'read_only': True},
#         }

#     def validate(self, data):
#         required_fields = ['client_id', 'secret', 'callback_url']
#         for field in required_fields:
#             if not data.get(field):
#                 raise serializers.ValidationError(f"{field} is required")
#         return data


# class BankConfigSerializer(serializers.ModelSerializer):
#     bank_display = serializers.SerializerMethodField()

#     class Meta:
#         model = BankConfig
#         fields = [
#             'id',
#             'gateway',
#             'bank_name',
#             'bank_display',
#             'account_name',
#             'account_number',
#             'branch_code',
#             'swift_code',
#             'iban',
#             'bank_code',
#         ]
#         extra_kwargs = {
#             'gateway': {'read_only': True},
#         }

#     def get_bank_display(self, obj):
#         return f"{obj.bank_name} ({obj.bank_code})" if obj.bank_code else obj.bank_name

#     def validate(self, data):
#         required_fields = ['bank_name', 'account_name', 'account_number']
#         for field in required_fields:
#             if not data.get(field):
#                 raise serializers.ValidationError(f"{field} is required")
#         return data


# class ClientPaymentMethodSerializer(serializers.ModelSerializer):
#     gateway_details = PaymentGatewaySerializer(source='gateway', read_only=True)
#     client_username = serializers.CharField(source='client.user.username', read_only=True)
#     client_phone = serializers.CharField(source='client.user.phone_number', read_only=True)

#     class Meta:
#         model = ClientPaymentMethod
#         fields = [
#             'id',
#             'client',
#             'client_username',
#             'client_phone',
#             'gateway',
#             'gateway_details',
#             'is_default',
#             'created_at',
#         ]
#         read_only_fields = [
#             'id',
#             'client_username',
#             'client_phone',
#             'gateway_details',
#             'created_at',
#         ]

#     def validate(self, data):
#         if not data.get('gateway').is_active:
#             raise serializers.ValidationError("Cannot assign inactive payment method to client")
#         return data

#     def validate_is_default(self, value):
#         if value and self.instance:
#             existing_default = ClientPaymentMethod.objects.filter(
#                 client=self.validated_data['client'],
#                 is_default=True,
#             ).exclude(pk=self.instance.pk).exists()
#             if existing_default:
#                 raise serializers.ValidationError(
#                     "Another default payment method already exists for this client"
#                 )
#         return value


# class TransactionSerializer(serializers.ModelSerializer):
#     status_display = serializers.CharField(source='get_status_display', read_only=True)
#     client_username = serializers.CharField(source='client.user.username', read_only=True)
#     client_phone = serializers.CharField(source='client.user.phone_number', read_only=True)
#     gateway_details = serializers.SerializerMethodField()
#     security_level = serializers.CharField(source='gateway.security_level', read_only=True)
#     security_level_display = serializers.CharField(
#         source='gateway.get_security_level_display',
#         read_only=True,
#     )
#     subscription_linked = serializers.SerializerMethodField()
#     can_activate_subscription = serializers.SerializerMethodField()

#     class Meta:
#         model = Transaction
#         fields = [
#             'id',
#             'client',
#             'client_username',
#             'client_phone',
#             'gateway',
#             'gateway_details',
#             'plan_id',
#             'amount',
#             'reference',
#             'status',
#             'status_display',
#             'security_level',
#             'security_level_display',
#             'idempotency_key',
#             'subscription_id',
#             'subscription_linked',
#             'can_activate_subscription',
#             'callback_attempts',
#             'last_callback_attempt',
#             'metadata',
#             'created_at',
#             'updated_at',
#         ]
#         read_only_fields = [
#             'id',
#             'status_display',
#             'client_username',
#             'client_phone',
#             'gateway_details',
#             'security_level',
#             'security_level_display',
#             'created_at',
#             'updated_at',
#             'reference',
#             'idempotency_key',
#             'subscription_linked',
#             'can_activate_subscription',
#             'callback_attempts',
#             'last_callback_attempt',
#         ]

#     def get_gateway_details(self, obj):
#         if obj.gateway:
#             return PaymentGatewaySerializer(obj.gateway).data
#         return None

#     def get_subscription_linked(self, obj):
#         return bool(obj.subscription_id)

#     def get_can_activate_subscription(self, obj):
#         return obj.status == 'completed' and not obj.subscription_id


# class TransactionCreateSerializer(TransactionSerializer):
#     phone = PhoneNumberField(write_only=True, required=False)
#     idempotency_key = serializers.CharField(required=False)

#     class Meta(TransactionSerializer.Meta):
#         extra_kwargs = {
#             'reference': {'read_only': True},
#             'status': {'read_only': True},
#             'client': {'required': False},
#         }

#     def validate(self, data):
#         if not self.context['request'].user.is_authenticated and not data.get('phone'):
#             raise serializers.ValidationError(
#                 "Phone number is required for unauthenticated transactions"
#             )
        
#         # Validate idempotency key
#         idempotency_key = data.get('idempotency_key')
#         if idempotency_key and Transaction.objects.filter(idempotency_key=idempotency_key).exists():
#             raise serializers.ValidationError(
#                 "A transaction with this idempotency key already exists"
#             )
        
#         return data

#     def create(self, validated_data):
#         phone = validated_data.pop('phone', None)
#         idempotency_key = validated_data.pop('idempotency_key', None)
#         request = self.context['request']

#         try:
#             if request.user.is_authenticated:
#                 client = Client.objects.get(user=request.user)
#             else:
#                 from django.contrib.auth import get_user_model
#                 User = get_user_model()

#                 if User.objects.filter(phone_number=phone).exists():
#                     user = User.objects.get(phone_number=phone)
#                     client, created = Client.objects.get_or_create(user=user)
#                 else:
#                     raise serializers.ValidationError("Client not found. Please register first.")

#         except Exception as e:
#             logger.error(f"Failed to get client: {str(e)}")
#             raise serializers.ValidationError(f"Failed to get client: {str(e)}")

#         validated_data['client'] = client
        
#         if idempotency_key:
#             validated_data['idempotency_key'] = idempotency_key

#         if not validated_data.get('reference'):
#             validated_data['reference'] = self._generate_secure_reference()

#         max_retries = 3
#         for attempt in range(max_retries):
#             try:
#                 return super().create(validated_data)
#             except IntegrityError as e:
#                 if 'reference' in str(e).lower() and attempt < max_retries - 1:
#                     time.sleep(0.1)
#                     validated_data['reference'] = self._generate_secure_reference()
#                 else:
#                     logger.error(f"Failed to create transaction after {max_retries} attempts")
#                     raise serializers.ValidationError(
#                         {'reference': 'Could not generate unique reference'}
#                     )

#     def _generate_secure_reference(self):
#         timestamp = timezone.now().strftime('%Y%m%d%H%M%S')
#         random_part = get_random_string(8, 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789')
#         return f"TX-{timestamp}-{random_part}"


# class TransactionUpdateSerializer(TransactionSerializer):
#     class Meta(TransactionSerializer.Meta):
#         read_only_fields = TransactionSerializer.Meta.read_only_fields + [
#             'client',
#             'gateway',
#             'plan_id',
#             'amount',
#             'reference',
#             'idempotency_key',
#         ]

#     def validate_status(self, value):
#         if self.instance and self.instance.status == 'completed' and value != 'refunded':
#             raise serializers.ValidationError(
#                 "Completed transactions can only be updated to refunded status"
#             )
#         return value


# class LinkSubscriptionSerializer(serializers.Serializer):
#     subscription_id = serializers.CharField(max_length=100, required=True)

#     def validate_subscription_id(self, value):
#         if not value.strip():
#             raise serializers.ValidationError("Subscription ID cannot be empty")
#         return value


# class ConfigurationHistorySerializer(serializers.ModelSerializer):
#     action_display = serializers.CharField(source='get_action_display', read_only=True)
#     user_username = serializers.CharField(source='user.username', read_only=True)
#     user_email = serializers.CharField(source='user.email', read_only=True)

#     class Meta:
#         model = ConfigurationHistory
#         fields = [
#             'id',
#             'action',
#             'action_display',
#             'model',
#             'object_id',
#             'changes',
#             'old_values',
#             'new_values',
#             'user',
#             'user_username',
#             'user_email',
#             'timestamp',
#         ]
#         read_only_fields = fields


# class WebhookLogSerializer(serializers.ModelSerializer):
#     gateway_details = serializers.SerializerMethodField()

#     class Meta:
#         model = WebhookLog
#         fields = [
#             'id',
#             'gateway',
#             'gateway_details',
#             'event_type',
#             'payload',
#             'headers',
#             'ip_address',
#             'status_code',
#             'response',
#             'signature_valid',
#             'timestamp',
#         ]
#         read_only_fields = fields

#     def get_gateway_details(self, obj):
#         if obj.gateway:
#             return {
#                 'id': obj.gateway.id,
#                 'name': obj.gateway.get_name_display(),
#                 'type': obj.gateway.name,
#             }
#         return None

#     def validate_payload(self, value):
#         try:
#             json.loads(value) if isinstance(value, str) else value
#             return value
#         except json.JSONDecodeError:
#             raise serializers.ValidationError("Invalid JSON payload")

#     def validate_headers(self, value):
#         try:
#             json.loads(value) if isinstance(value, str) else value
#             return value
#         except json.JSONDecodeError:
#             raise serializers.ValidationError("Invalid JSON headers")


# class PaymentAnalyticsSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = PaymentAnalytics
#         fields = [
#             'date',
#             'total_revenue',
#             'successful_transactions',
#             'failed_transactions',
#             'pending_transactions',
#             'success_rate',
#             'total_transactions',
#             'revenue_by_gateway',
#         ]


# class CallbackDeliveryLogSerializer(serializers.ModelSerializer):
#     transaction_reference = serializers.CharField(source='transaction.reference', read_only=True)

#     class Meta:
#         model = CallbackDeliveryLog
#         fields = [
#             'id',
#             'transaction',
#             'transaction_reference',
#             'payload',
#             'status',
#             'response_status',
#             'response_body',
#             'attempt_count',
#             'error_message',
#             'delivered_at',
#             'created_at',
#         ]
#         read_only_fields = fields


# class SubscriptionCallbackSerializer(serializers.Serializer):
#     """Serializer for subscription activation callbacks from internetplans app"""
#     reference = serializers.CharField(required=True)
#     status = serializers.CharField(required=True)
#     subscription_id = serializers.CharField(required=True)
#     plan_id = serializers.CharField(required=True)
#     client_id = serializers.CharField(required=True)
#     activation_result = serializers.JSONField(required=False)
#     error_message = serializers.CharField(required=False, allow_blank=True)

#     def validate_status(self, value):
#         valid_statuses = ['activated', 'failed', 'pending']
#         if value not in valid_statuses:
#             raise serializers.ValidationError(f"Status must be one of {valid_statuses}")
#         return value


# class PaymentVerificationSerializer(serializers.Serializer):
#     """Serializer for payment verification requests"""
#     reference = serializers.CharField(required=False)
#     phone_number = serializers.CharField(required=False)
#     amount = serializers.DecimalField(max_digits=12, decimal_places=2, required=False)
#     gateway = serializers.CharField(required=False)

#     def validate(self, data):
#         if not any([data.get('reference'), data.get('phone_number')]):
#             raise serializers.ValidationError(
#                 "Either reference or phone_number must be provided"
#             )
#         return data









# from rest_framework import serializers
# from django.utils import timezone
# from django.utils.crypto import get_random_string
# from django.db import IntegrityError
# import json
# import time
# from phonenumber_field.serializerfields import PhoneNumberField
# from payments.models.payment_config_model import (
#     PaymentGateway,
#     MpesaConfig,
#     PayPalConfig,
#     BankConfig,
#     ClientPaymentMethod,
#     Transaction,
#     ConfigurationHistory,
#     WebhookLog,
#     PaymentAnalytics,
#     CallbackDeliveryLog,
# )
# from account.models.admin_model import Client
# import logging

# logger = logging.getLogger(__name__)

# class PaymentGatewaySerializer(serializers.ModelSerializer):
#     type_display = serializers.CharField(source='get_name_display', read_only=True)
#     security_level_display = serializers.CharField(source='get_security_level_display', read_only=True)
#     config = serializers.SerializerMethodField()
#     created_by_name = serializers.SerializerMethodField()
#     is_operational = serializers.SerializerMethodField()

#     class Meta:
#         model = PaymentGateway
#         fields = [
#             'id',
#             'name',
#             'type_display',
#             'is_active',
#             'sandbox_mode',
#             'transaction_limit',
#             'auto_settle',
#             'security_level',
#             'security_level_display',
#             'webhook_secret',
#             'config',
#             'health_status',
#             'last_health_check',
#             'is_operational',
#             'created_by',
#             'created_by_name',
#             'created_at',
#             'updated_at',
#         ]
#         read_only_fields = [
#             'id',
#             'type_display',
#             'security_level_display',
#             'config',
#             'created_by',
#             'created_by_name',
#             'created_at',
#             'updated_at',
#             'webhook_secret',
#             'health_status',
#             'last_health_check',
#             'is_operational',
#         ]
#         extra_kwargs = {
#             'webhook_secret': {'write_only': True},
#         }

#     def get_config(self, obj):
#         if obj.name in ['mpesa_paybill', 'mpesa_till'] and hasattr(obj, 'mpesaconfig'):
#             return MpesaConfigSerializer(obj.mpesaconfig).data
#         elif obj.name == 'paypal' and hasattr(obj, 'paypalconfig'):
#             return PayPalConfigSerializer(obj.paypalconfig).data
#         elif obj.name == 'bank_transfer' and hasattr(obj, 'bankconfig'):
#             return BankConfigSerializer(obj.bankconfig).data
#         return None

#     def get_created_by_name(self, obj):
#         return obj.created_by.username if obj.created_by else "System"

#     def get_is_operational(self, obj):
#         return obj.is_active and obj.health_status == 'healthy'

#     def create(self, validated_data):
#         instance = super().create(validated_data)
#         instance.generate_webhook_secret()
#         instance.save()

#         ConfigurationHistory.track_changes(
#             instance=instance,
#             user=self.context['request'].user,
#             action='create',
#             changed_fields=list(validated_data.keys()),
#         )
#         return instance

#     def update(self, instance, validated_data):
#         old_values = {field: getattr(instance, field) for field in validated_data.keys()}
#         instance = super().update(instance, validated_data)

#         ConfigurationHistory.track_changes(
#             instance=instance,
#             user=self.context['request'].user,
#             action='update',
#             changed_fields=list(validated_data.keys()),
#         )
#         return instance


# class MpesaConfigSerializer(serializers.ModelSerializer):
#     short_code = serializers.CharField(read_only=True)
#     is_paybill = serializers.SerializerMethodField()

#     class Meta:
#         model = MpesaConfig
#         fields = [
#             'id',
#             'gateway',
#             'paybill_number',
#             'till_number',
#             'short_code',
#             'is_paybill',
#             'consumer_key',
#             'consumer_secret',
#             'passkey',
#             'callback_url',
#             'initiator_name',
#             'security_credential',
#         ]
#         extra_kwargs = {
#             'consumer_key': {'write_only': True},
#             'consumer_secret': {'write_only': True},
#             'passkey': {'write_only': True},
#             'security_credential': {'write_only': True},
#             'gateway': {'read_only': True},
#         }

#     def get_is_paybill(self, obj):
#         return bool(obj.paybill_number)

#     def validate(self, data):
#         if not data.get('paybill_number') and not data.get('till_number'):
#             raise serializers.ValidationError("Either paybill number or till number must be set")
#         if data.get('paybill_number') and data.get('till_number'):
#             raise serializers.ValidationError("Cannot have both paybill and till number")
#         required_fields = ['consumer_key', 'consumer_secret', 'passkey', 'callback_url']
#         for field in required_fields:
#             if not data.get(field):
#                 raise serializers.ValidationError(f"{field} is required")
#         return data


# class PayPalConfigSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = PayPalConfig
#         fields = [
#             'id',
#             'gateway',
#             'client_id',
#             'secret',
#             'merchant_id',
#             'callback_url',
#             'webhook_id',
#             'bn_code',
#         ]
#         extra_kwargs = {
#             'client_id': {'write_only': True},
#             'secret': {'write_only': True},
#             'merchant_id': {'write_only': True},
#             'gateway': {'read_only': True},
#         }

#     def validate(self, data):
#         required_fields = ['client_id', 'secret', 'callback_url']
#         for field in required_fields:
#             if not data.get(field):
#                 raise serializers.ValidationError(f"{field} is required")
#         return data


# class BankConfigSerializer(serializers.ModelSerializer):
#     bank_display = serializers.SerializerMethodField()
#     account_type_display = serializers.CharField(source='get_account_type_display', read_only=True)
#     currency_display = serializers.SerializerMethodField()

#     class Meta:
#         model = BankConfig
#         fields = [
#             'id',
#             'gateway',
#             'bank_name',
#             'bank_display',
#             'account_name',
#             'account_number',
#             'branch_code',
#             'swift_code',
#             'iban',
#             'bank_code',
#             'routing_number',
#             'bank_address',
#             'account_type',
#             'account_type_display',
#             'currency',
#             'currency_display',
#         ]
#         extra_kwargs = {
#             'gateway': {'read_only': True},
#         }

#     def get_bank_display(self, obj):
#         return f"{obj.bank_name} ({obj.bank_code})" if obj.bank_code else obj.bank_name

#     def get_currency_display(self, obj):
#         return dict(BankConfig._meta.get_field('currency').choices).get(obj.currency, obj.currency)

#     def validate(self, data):
#         required_fields = ['bank_name', 'account_name', 'account_number']
#         for field in required_fields:
#             if not data.get(field):
#                 raise serializers.ValidationError(f"{field} is required")
#         return data


# class ClientPaymentMethodSerializer(serializers.ModelSerializer):
#     gateway_details = PaymentGatewaySerializer(source='gateway', read_only=True)
#     client_username = serializers.CharField(source='client.user.username', read_only=True)
#     client_phone = serializers.CharField(source='client.user.phone_number', read_only=True)

#     class Meta:
#         model = ClientPaymentMethod
#         fields = [
#             'id',
#             'client',
#             'client_username',
#             'client_phone',
#             'gateway',
#             'gateway_details',
#             'is_default',
#             'created_at',
#         ]
#         read_only_fields = [
#             'id',
#             'client_username',
#             'client_phone',
#             'gateway_details',
#             'created_at',
#         ]

#     def validate(self, data):
#         if not data.get('gateway').is_active:
#             raise serializers.ValidationError("Cannot assign inactive payment method to client")
#         return data

#     def validate_is_default(self, value):
#         if value and self.instance:
#             existing_default = ClientPaymentMethod.objects.filter(
#                 client=self.validated_data['client'],
#                 is_default=True,
#             ).exclude(pk=self.instance.pk).exists()
#             if existing_default:
#                 raise serializers.ValidationError(
#                     "Another default payment method already exists for this client"
#                 )
#         return value


# class TransactionSerializer(serializers.ModelSerializer):
#     status_display = serializers.CharField(source='get_status_display', read_only=True)
#     client_username = serializers.CharField(source='client.user.username', read_only=True)
#     client_phone = serializers.CharField(source='client.user.phone_number', read_only=True)
#     gateway_details = serializers.SerializerMethodField()
#     security_level = serializers.CharField(source='gateway.security_level', read_only=True)
#     security_level_display = serializers.CharField(
#         source='gateway.get_security_level_display',
#         read_only=True,
#     )
#     subscription_linked = serializers.SerializerMethodField()
#     can_activate_subscription = serializers.SerializerMethodField()

#     class Meta:
#         model = Transaction
#         fields = [
#             'id',
#             'client',
#             'client_username',
#             'client_phone',
#             'gateway',
#             'gateway_details',
#             'plan_id',
#             'amount',
#             'reference',
#             'status',
#             'status_display',
#             'security_level',
#             'security_level_display',
#             'idempotency_key',
#             'subscription_id',
#             'subscription_linked',
#             'can_activate_subscription',
#             'callback_attempts',
#             'last_callback_attempt',
#             'metadata',
#             'created_at',
#             'updated_at',
#         ]
#         read_only_fields = [
#             'id',
#             'status_display',
#             'client_username',
#             'client_phone',
#             'gateway_details',
#             'security_level',
#             'security_level_display',
#             'created_at',
#             'updated_at',
#             'reference',
#             'idempotency_key',
#             'subscription_linked',
#             'can_activate_subscription',
#             'callback_attempts',
#             'last_callback_attempt',
#         ]

#     def get_gateway_details(self, obj):
#         if obj.gateway:
#             return PaymentGatewaySerializer(obj.gateway).data
#         return None

#     def get_subscription_linked(self, obj):
#         return bool(obj.subscription_id)

#     def get_can_activate_subscription(self, obj):
#         return obj.status == 'completed' and not obj.subscription_id


# class TransactionCreateSerializer(TransactionSerializer):
#     phone = PhoneNumberField(write_only=True, required=False)
#     idempotency_key = serializers.CharField(required=False)

#     class Meta(TransactionSerializer.Meta):
#         extra_kwargs = {
#             'reference': {'read_only': True},
#             'status': {'read_only': True},
#             'client': {'required': False},
#         }

#     def validate(self, data):
#         if not self.context['request'].user.is_authenticated and not data.get('phone'):
#             raise serializers.ValidationError(
#                 "Phone number is required for unauthenticated transactions"
#             )
        
#         # Validate idempotency key
#         idempotency_key = data.get('idempotency_key')
#         if idempotency_key and Transaction.objects.filter(idempotency_key=idempotency_key).exists():
#             raise serializers.ValidationError(
#                 "A transaction with this idempotency key already exists"
#             )
        
#         return data

#     def create(self, validated_data):
#         phone = validated_data.pop('phone', None)
#         idempotency_key = validated_data.pop('idempotency_key', None)
#         request = self.context['request']

#         try:
#             if request.user.is_authenticated:
#                 client = Client.objects.get(user=request.user)
#             else:
#                 from django.contrib.auth import get_user_model
#                 User = get_user_model()

#                 if User.objects.filter(phone_number=phone).exists():
#                     user = User.objects.get(phone_number=phone)
#                     client, created = Client.objects.get_or_create(user=user)
#                 else:
#                     raise serializers.ValidationError("Client not found. Please register first.")

#         except Exception as e:
#             logger.error(f"Failed to get client: {str(e)}")
#             raise serializers.ValidationError(f"Failed to get client: {str(e)}")

#         validated_data['client'] = client
        
#         if idempotency_key:
#             validated_data['idempotency_key'] = idempotency_key

#         if not validated_data.get('reference'):
#             validated_data['reference'] = self._generate_secure_reference()

#         max_retries = 3
#         for attempt in range(max_retries):
#             try:
#                 return super().create(validated_data)
#             except IntegrityError as e:
#                 if 'reference' in str(e).lower() and attempt < max_retries - 1:
#                     time.sleep(0.1)
#                     validated_data['reference'] = self._generate_secure_reference()
#                 else:
#                     logger.error(f"Failed to create transaction after {max_retries} attempts")
#                     raise serializers.ValidationError(
#                         {'reference': 'Could not generate unique reference'}
#                     )

#     def _generate_secure_reference(self):
#         timestamp = timezone.now().strftime('%Y%m%d%H%M%S')
#         random_part = get_random_string(8, 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789')
#         return f"TX-{timestamp}-{random_part}"


# class TransactionUpdateSerializer(TransactionSerializer):
#     class Meta(TransactionSerializer.Meta):
#         read_only_fields = TransactionSerializer.Meta.read_only_fields + [
#             'client',
#             'gateway',
#             'plan_id',
#             'amount',
#             'reference',
#             'idempotency_key',
#         ]

#     def validate_status(self, value):
#         if self.instance and self.instance.status == 'completed' and value != 'refunded':
#             raise serializers.ValidationError(
#                 "Completed transactions can only be updated to refunded status"
#             )
#         return value


# class LinkSubscriptionSerializer(serializers.Serializer):
#     subscription_id = serializers.CharField(max_length=100, required=True)

#     def validate_subscription_id(self, value):
#         if not value.strip():
#             raise serializers.ValidationError("Subscription ID cannot be empty")
#         return value


# class ConfigurationHistorySerializer(serializers.ModelSerializer):
#     action_display = serializers.CharField(source='get_action_display', read_only=True)
#     user_username = serializers.CharField(source='user.username', read_only=True)
#     user_email = serializers.CharField(source='user.email', read_only=True)

#     class Meta:
#         model = ConfigurationHistory
#         fields = [
#             'id',
#             'action',
#             'action_display',
#             'model',
#             'object_id',
#             'changes',
#             'old_values',
#             'new_values',
#             'user',
#             'user_username',
#             'user_email',
#             'timestamp',
#         ]
#         read_only_fields = fields


# class WebhookLogSerializer(serializers.ModelSerializer):
#     gateway_details = serializers.SerializerMethodField()

#     class Meta:
#         model = WebhookLog
#         fields = [
#             'id',
#             'gateway',
#             'gateway_details',
#             'event_type',
#             'payload',
#             'headers',
#             'ip_address',
#             'status_code',
#             'response',
#             'signature_valid',
#             'timestamp',
#         ]
#         read_only_fields = fields

#     def get_gateway_details(self, obj):
#         if obj.gateway:
#             return {
#                 'id': obj.gateway.id,
#                 'name': obj.gateway.get_name_display(),
#                 'type': obj.gateway.name,
#             }
#         return None

#     def validate_payload(self, value):
#         try:
#             json.loads(value) if isinstance(value, str) else value
#             return value
#         except json.JSONDecodeError:
#             raise serializers.ValidationError("Invalid JSON payload")

#     def validate_headers(self, value):
#         try:
#             json.loads(value) if isinstance(value, str) else value
#             return value
#         except json.JSONDecodeError:
#             raise serializers.ValidationError("Invalid JSON headers")


# class PaymentAnalyticsSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = PaymentAnalytics
#         fields = [
#             'date',
#             'total_revenue',
#             'successful_transactions',
#             'failed_transactions',
#             'pending_transactions',
#             'success_rate',
#             'total_transactions',
#             'revenue_by_gateway',
#         ]


# class CallbackDeliveryLogSerializer(serializers.ModelSerializer):
#     transaction_reference = serializers.CharField(source='transaction.reference', read_only=True)

#     class Meta:
#         model = CallbackDeliveryLog
#         fields = [
#             'id',
#             'transaction',
#             'transaction_reference',
#             'payload',
#             'status',
#             'response_status',
#             'response_body',
#             'attempt_count',
#             'error_message',
#             'delivered_at',
#             'created_at',
#         ]
#         read_only_fields = fields


# class SubscriptionCallbackSerializer(serializers.Serializer):
#     """Serializer for subscription activation callbacks from internetplans app"""
#     reference = serializers.CharField(required=True)
#     status = serializers.CharField(required=True)
#     subscription_id = serializers.CharField(required=True)
#     plan_id = serializers.CharField(required=True)
#     client_id = serializers.CharField(required=True)
#     activation_result = serializers.JSONField(required=False)
#     error_message = serializers.CharField(required=False, allow_blank=True)

#     def validate_status(self, value):
#         valid_statuses = ['activated', 'failed', 'pending']
#         if value not in valid_statuses:
#             raise serializers.ValidationError(f"Status must be one of {valid_statuses}")
#         return value


# class PaymentVerificationSerializer(serializers.Serializer):
#     """Serializer for payment verification requests"""
#     reference = serializers.CharField(required=False)
#     phone_number = serializers.CharField(required=False)
#     amount = serializers.DecimalField(max_digits=12, decimal_places=2, required=False)
#     gateway = serializers.CharField(required=False)

#     def validate(self, data):
#         if not any([data.get('reference'), data.get('phone_number')]):
#             raise serializers.ValidationError(
#                 "Either reference or phone_number must be provided"
#             )
#         return data










from rest_framework import serializers
from django.utils import timezone
from django.utils.crypto import get_random_string
from django.db import IntegrityError
import json
import time
from phonenumber_field.serializerfields import PhoneNumberField
from payments.models.payment_config_model import (
    PaymentGateway,
    MpesaConfig,
    PayPalConfig,
    BankConfig,
    ClientPaymentMethod,
    Transaction,
    ConfigurationHistory,
    WebhookLog,
    PaymentAnalytics,
    CallbackDeliveryLog,
)
from account.models.admin_model import Client
import logging

logger = logging.getLogger(__name__)

class PaymentGatewaySerializer(serializers.ModelSerializer):
    type_display = serializers.CharField(source='get_name_display', read_only=True)
    security_level_display = serializers.CharField(source='get_security_level_display', read_only=True)
    config = serializers.SerializerMethodField()
    created_by_name = serializers.SerializerMethodField()
    is_operational = serializers.SerializerMethodField()
    transaction_count = serializers.SerializerMethodField()
    total_revenue = serializers.SerializerMethodField()

    class Meta:
        model = PaymentGateway
        fields = [
            'id',
            'name',
            'type_display',
            'is_active',
            'sandbox_mode',
            'transaction_limit',
            'auto_settle',
            'security_level',
            'security_level_display',
            'webhook_secret',
            'config',
            'health_status',
            'last_health_check',
            'is_operational',
            'transaction_count',
            'total_revenue',
            'created_by',
            'created_by_name',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'type_display',
            'security_level_display',
            'config',
            'created_by',
            'created_by_name',
            'created_at',
            'updated_at',
            'webhook_secret',
            'health_status',
            'last_health_check',
            'is_operational',
            'transaction_count',
            'total_revenue',
        ]
        extra_kwargs = {
            'webhook_secret': {'write_only': True},
        }

    def get_config(self, obj):
        if obj.name in ['mpesa_paybill', 'mpesa_till'] and hasattr(obj, 'mpesaconfig'):
            return MpesaConfigSerializer(obj.mpesaconfig).data
        elif obj.name == 'paypal' and hasattr(obj, 'paypalconfig'):
            return PayPalConfigSerializer(obj.paypalconfig).data
        elif obj.name == 'bank_transfer' and hasattr(obj, 'bankconfig'):
            return BankConfigSerializer(obj.bankconfig).data
        return None

    def get_created_by_name(self, obj):
        return obj.created_by.username if obj.created_by else "System"

    def get_is_operational(self, obj):
        return obj.is_active and obj.health_status == 'healthy'

    def get_transaction_count(self, obj):
        """Get count of successful transactions for this gateway"""
        return obj.transactions.filter(status='completed').count()

    def get_total_revenue(self, obj):
        """Get total revenue generated by this gateway"""
        from django.db.models import Sum
        result = obj.transactions.filter(status='completed').aggregate(
            total=Sum('amount')
        )
        return result['total'] or 0

    def create(self, validated_data):
        instance = super().create(validated_data)
        instance.generate_webhook_secret()
        instance.save()

        ConfigurationHistory.track_changes(
            instance=instance,
            user=self.context['request'].user,
            action='create',
            changed_fields=list(validated_data.keys()),
        )
        return instance

    def update(self, instance, validated_data):
        old_values = {field: getattr(instance, field) for field in validated_data.keys()}
        instance = super().update(instance, validated_data)

        ConfigurationHistory.track_changes(
            instance=instance,
            user=self.context['request'].user,
            action='update',
            changed_fields=list(validated_data.keys()),
        )
        return instance


class MpesaConfigSerializer(serializers.ModelSerializer):
    short_code = serializers.CharField(read_only=True)
    is_paybill = serializers.SerializerMethodField()
    is_till = serializers.SerializerMethodField()

    class Meta:
        model = MpesaConfig
        fields = [
            'id',
            'gateway',
            'paybill_number',
            'till_number',
            'short_code',
            'is_paybill',
            'is_till',
            'consumer_key',
            'consumer_secret',
            'passkey',
            'callback_url',
            'initiator_name',
            'security_credential',
        ]
        extra_kwargs = {
            'consumer_key': {'write_only': True},
            'consumer_secret': {'write_only': True},
            'passkey': {'write_only': True},
            'security_credential': {'write_only': True},
            'gateway': {'read_only': True},
        }

    def get_is_paybill(self, obj):
        return bool(obj.paybill_number)

    def get_is_till(self, obj):
        return bool(obj.till_number)

    def validate(self, data):
        if not data.get('paybill_number') and not data.get('till_number'):
            raise serializers.ValidationError("Either paybill number or till number must be set")
        if data.get('paybill_number') and data.get('till_number'):
            raise serializers.ValidationError("Cannot have both paybill and till number")
        required_fields = ['consumer_key', 'consumer_secret', 'passkey', 'callback_url']
        for field in required_fields:
            if not data.get(field):
                raise serializers.ValidationError(f"{field} is required")
        return data


class PayPalConfigSerializer(serializers.ModelSerializer):
    environment = serializers.SerializerMethodField()

    class Meta:
        model = PayPalConfig
        fields = [
            'id',
            'gateway',
            'client_id',
            'secret',
            'merchant_id',
            'callback_url',
            'webhook_id',
            'bn_code',
            'environment',
        ]
        extra_kwargs = {
            'client_id': {'write_only': True},
            'secret': {'write_only': True},
            'merchant_id': {'write_only': True},
            'gateway': {'read_only': True},
        }

    def get_environment(self, obj):
        return "sandbox" if obj.gateway.sandbox_mode else "production"

    def validate(self, data):
        required_fields = ['client_id', 'secret', 'callback_url']
        for field in required_fields:
            if not data.get(field):
                raise serializers.ValidationError(f"{field} is required")
        return data


class BankConfigSerializer(serializers.ModelSerializer):
    bank_display = serializers.SerializerMethodField()
    account_type_display = serializers.CharField(source='get_account_type_display', read_only=True)
    currency_display = serializers.SerializerMethodField()

    class Meta:
        model = BankConfig
        fields = [
            'id',
            'gateway',
            'bank_name',
            'bank_display',
            'account_name',
            'account_number',
            'branch_code',
            'swift_code',
            'iban',
            'bank_code',
            'routing_number',
            'bank_address',
            'account_type',
            'account_type_display',
            'currency',
            'currency_display',
        ]
        extra_kwargs = {
            'gateway': {'read_only': True},
        }

    def get_bank_display(self, obj):
        return f"{obj.bank_name} ({obj.bank_code})" if obj.bank_code else obj.bank_name

    def get_currency_display(self, obj):
        return dict(BankConfig._meta.get_field('currency').choices).get(obj.currency, obj.currency)

    def validate(self, data):
        required_fields = ['bank_name', 'account_name', 'account_number']
        for field in required_fields:
            if not data.get(field):
                raise serializers.ValidationError(f"{field} is required")
        return data


class ClientPaymentMethodSerializer(serializers.ModelSerializer):
    gateway_details = PaymentGatewaySerializer(source='gateway', read_only=True)
    client_username = serializers.CharField(source='client.user.username', read_only=True)
    client_phone = serializers.CharField(source='client.user.phone_number', read_only=True)
    transaction_count = serializers.SerializerMethodField()

    class Meta:
        model = ClientPaymentMethod
        fields = [
            'id',
            'client',
            'client_username',
            'client_phone',
            'gateway',
            'gateway_details',
            'is_default',
            'transaction_count',
            'created_at',
        ]
        read_only_fields = [
            'id',
            'client_username',
            'client_phone',
            'gateway_details',
            'transaction_count',
            'created_at',
        ]

    def get_transaction_count(self, obj):
        """Get count of transactions using this payment method"""
        return obj.client.transactions.filter(gateway=obj.gateway).count()

    def validate(self, data):
        if not data.get('gateway').is_active:
            raise serializers.ValidationError("Cannot assign inactive payment method to client")
        return data

    def validate_is_default(self, value):
        if value and self.instance:
            existing_default = ClientPaymentMethod.objects.filter(
                client=self.validated_data['client'],
                is_default=True,
            ).exclude(pk=self.instance.pk).exists()
            if existing_default:
                raise serializers.ValidationError(
                    "Another default payment method already exists for this client"
                )
        return value


class TransactionSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    client_username = serializers.CharField(source='client.user.username', read_only=True)
    client_phone = serializers.CharField(source='client.user.phone_number', read_only=True)
    gateway_details = serializers.SerializerMethodField()
    security_level = serializers.CharField(source='gateway.security_level', read_only=True)
    security_level_display = serializers.CharField(
        source='gateway.get_security_level_display',
        read_only=True,
    )
    subscription_linked = serializers.SerializerMethodField()
    can_activate_subscription = serializers.SerializerMethodField()
    transaction_logs_count = serializers.SerializerMethodField()
    plan_name = serializers.CharField(source='plan.name', read_only=True, allow_null=True)

    class Meta:
        model = Transaction
        fields = [
            'id',
            'client',
            'client_username',
            'client_phone',
            'gateway',
            'gateway_details',
            'plan',
            'plan_name',
            'amount',
            'reference',
            'status',
            'status_display',
            'security_level',
            'security_level_display',
            'idempotency_key',
            'subscription_id',
            'subscription_linked',
            'can_activate_subscription',
            'transaction_logs_count',
            'callback_attempts',
            'last_callback_attempt',
            'metadata',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'status_display',
            'client_username',
            'client_phone',
            'gateway_details',
            'security_level',
            'security_level_display',
            'created_at',
            'updated_at',
            'reference',
            'idempotency_key',
            'subscription_linked',
            'can_activate_subscription',
            'transaction_logs_count',
            'callback_attempts',
            'last_callback_attempt',
            'plan_name',
        ]

    def get_gateway_details(self, obj):
        if obj.gateway:
            return PaymentGatewaySerializer(obj.gateway).data
        return None

    def get_subscription_linked(self, obj):
        return bool(obj.subscription_id)

    def get_can_activate_subscription(self, obj):
        return obj.status == 'completed' and not obj.subscription_id

    def get_transaction_logs_count(self, obj):
        """Get count of linked transaction logs"""
        return obj.logs.count()


class TransactionCreateSerializer(TransactionSerializer):
    phone = PhoneNumberField(write_only=True, required=False)
    idempotency_key = serializers.CharField(required=False)
    access_type = serializers.ChoiceField(
        choices=[('hotspot', 'Hotspot'), ('pppoe', 'PPPoE'), ('both', 'Both')],
        required=False,
        default='hotspot'
    )

    class Meta(TransactionSerializer.Meta):
        extra_kwargs = {
            'reference': {'read_only': True},
            'status': {'read_only': True},
            'client': {'required': False},
        }

    def validate(self, data):
        if not self.context['request'].user.is_authenticated and not data.get('phone'):
            raise serializers.ValidationError(
                "Phone number is required for unauthenticated transactions"
            )
        
        # Validate idempotency key
        idempotency_key = data.get('idempotency_key')
        if idempotency_key and Transaction.objects.filter(idempotency_key=idempotency_key).exists():
            raise serializers.ValidationError(
                "A transaction with this idempotency key already exists"
            )
        
        return data

    def create(self, validated_data):
        phone = validated_data.pop('phone', None)
        idempotency_key = validated_data.pop('idempotency_key', None)
        access_type = validated_data.pop('access_type', 'hotspot')
        request = self.context['request']

        try:
            if request.user.is_authenticated:
                client = Client.objects.get(user=request.user)
            else:
                from django.contrib.auth import get_user_model
                User = get_user_model()

                if User.objects.filter(phone_number=phone).exists():
                    user = User.objects.get(phone_number=phone)
                    client, created = Client.objects.get_or_create(user=user)
                else:
                    raise serializers.ValidationError("Client not found. Please register first.")

        except Exception as e:
            logger.error(f"Failed to get client: {str(e)}")
            raise serializers.ValidationError(f"Failed to get client: {str(e)}")

        validated_data['client'] = client
        
        if idempotency_key:
            validated_data['idempotency_key'] = idempotency_key

        if not validated_data.get('reference'):
            validated_data['reference'] = self._generate_secure_reference()

        max_retries = 3
        for attempt in range(max_retries):
            try:
                transaction = super().create(validated_data)
                
                # Create initial transaction log
                transaction.create_transaction_log(status='pending', access_type=access_type)
                
                return transaction
            except IntegrityError as e:
                if 'reference' in str(e).lower() and attempt < max_retries - 1:
                    time.sleep(0.1)
                    validated_data['reference'] = self._generate_secure_reference()
                else:
                    logger.error(f"Failed to create transaction after {max_retries} attempts")
                    raise serializers.ValidationError(
                        {'reference': 'Could not generate unique reference'}
                    )

    def _generate_secure_reference(self):
        timestamp = timezone.now().strftime('%Y%m%d%H%M%S')
        random_part = get_random_string(8, 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789')
        return f"TX-{timestamp}-{random_part}"


class TransactionUpdateSerializer(TransactionSerializer):
    class Meta(TransactionSerializer.Meta):
        read_only_fields = TransactionSerializer.Meta.read_only_fields + [
            'client',
            'gateway',
            'plan_id',
            'amount',
            'reference',
            'idempotency_key',
        ]

    def validate_status(self, value):
        if self.instance and self.instance.status == 'completed' and value != 'refunded':
            raise serializers.ValidationError(
                "Completed transactions can only be updated to refunded status"
            )
        return value


class LinkSubscriptionSerializer(serializers.Serializer):
    subscription_id = serializers.CharField(max_length=100, required=True)

    def validate_subscription_id(self, value):
        if not value.strip():
            raise serializers.ValidationError("Subscription ID cannot be empty")
        return value


class ConfigurationHistorySerializer(serializers.ModelSerializer):
    action_display = serializers.CharField(source='get_action_display', read_only=True)
    user_username = serializers.CharField(source='user.username', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = ConfigurationHistory
        fields = [
            'id',
            'action',
            'action_display',
            'model',
            'object_id',
            'changes',
            'old_values',
            'new_values',
            'user',
            'user_username',
            'user_email',
            'timestamp',
        ]
        read_only_fields = fields


class WebhookLogSerializer(serializers.ModelSerializer):
    gateway_details = serializers.SerializerMethodField()
    environment = serializers.SerializerMethodField()

    class Meta:
        model = WebhookLog
        fields = [
            'id',
            'gateway',
            'gateway_details',
            'event_type',
            'payload',
            'headers',
            'ip_address',
            'status_code',
            'response',
            'signature_valid',
            'environment',
            'timestamp',
        ]
        read_only_fields = fields

    def get_gateway_details(self, obj):
        if obj.gateway:
            return {
                'id': obj.gateway.id,
                'name': obj.gateway.get_name_display(),
                'type': obj.gateway.name,
            }
        return None

    def get_environment(self, obj):
        return "sandbox" if obj.gateway.sandbox_mode else "production"

    def validate_payload(self, value):
        try:
            json.loads(value) if isinstance(value, str) else value
            return value
        except json.JSONDecodeError:
            raise serializers.ValidationError("Invalid JSON payload")

    def validate_headers(self, value):
        try:
            json.loads(value) if isinstance(value, str) else value
            return value
        except json.JSONDecodeError:
            raise serializers.ValidationError("Invalid JSON headers")


class PaymentAnalyticsSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentAnalytics
        fields = [
            'date',
            'total_revenue',
            'successful_transactions',
            'failed_transactions',
            'pending_transactions',
            'success_rate',
            'total_transactions',
            'revenue_by_gateway',
        ]


class CallbackDeliveryLogSerializer(serializers.ModelSerializer):
    transaction_reference = serializers.CharField(source='transaction.reference', read_only=True)
    gateway_name = serializers.CharField(source='transaction.gateway.name', read_only=True)

    class Meta:
        model = CallbackDeliveryLog
        fields = [
            'id',
            'transaction',
            'transaction_reference',
            'gateway_name',
            'payload',
            'status',
            'response_status',
            'response_body',
            'attempt_count',
            'error_message',
            'delivered_at',
            'created_at',
        ]
        read_only_fields = fields


class SubscriptionCallbackSerializer(serializers.Serializer):
    """Serializer for subscription activation callbacks from internetplans app"""
    reference = serializers.CharField(required=True)
    status = serializers.CharField(required=True)
    subscription_id = serializers.CharField(required=True)
    plan_id = serializers.CharField(required=True)
    client_id = serializers.CharField(required=True)
    activation_result = serializers.JSONField(required=False)
    error_message = serializers.CharField(required=False, allow_blank=True)

    def validate_status(self, value):
        valid_statuses = ['activated', 'failed', 'pending']
        if value not in valid_statuses:
            raise serializers.ValidationError(f"Status must be one of {valid_statuses}")
        return value


class PaymentVerificationSerializer(serializers.Serializer):
    """Serializer for payment verification requests"""
    reference = serializers.CharField(required=False)
    phone_number = serializers.CharField(required=False)
    amount = serializers.DecimalField(max_digits=12, decimal_places=2, required=False)
    gateway = serializers.CharField(required=False)
    access_type = serializers.ChoiceField(
        choices=[('hotspot', 'Hotspot'), ('pppoe', 'PPPoE'), ('both', 'Both')],
        required=False,
        default='hotspot'
    )

    def validate(self, data):
        if not any([data.get('reference'), data.get('phone_number')]):
            raise serializers.ValidationError(
                "Either reference or phone_number must be provided"
            )
        return data