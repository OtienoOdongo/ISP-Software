

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
#     WebhookLog
# )
# from account.models.admin_model import Client
# from internet_plans.models.create_plan_models import InternetPlan
# import logging

# logger = logging.getLogger(__name__)

# class PaymentGatewaySerializer(serializers.ModelSerializer):
#     type_display = serializers.CharField(source='get_name_display', read_only=True)
#     security_level_display = serializers.CharField(
#         source='get_security_level_display',
#         read_only=True
#     )
#     config = serializers.SerializerMethodField()
#     created_by_name = serializers.SerializerMethodField()

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
#             'created_by',
#             'created_by_name',
#             'created_at',
#             'updated_at'
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
#             'webhook_secret'
#         ]

#     def get_config(self, obj):
#         if obj.name in ['mpesa_paybill', 'mpesa_till'] and hasattr(obj, 'mpesaconfig'):
#             return MpesaConfigSerializer(obj.mpesaconfig).data
#         elif obj.name == 'paypal' and hasattr(obj, 'paypalconfig'):
#             return PayPalConfigSerializer(obj.paypalconfig).data
#         elif obj.name == 'bank_transfer' and hasattr(obj, 'bankconfig'):
#             return BankConfigSerializer(obj.bankconfig).data
#         return None

#     def get_created_by_name(self, obj):
#         return obj.created_by.username if obj.created_by else "System"  # Changed to username

#     def create(self, validated_data):
#         instance = super().create(validated_data)
#         instance.generate_webhook_secret()
#         instance.save()

#         ConfigurationHistory.track_changes(
#             instance=instance,
#             user=self.context['request'].user,
#             action='create',
#             changed_fields=list(validated_data.keys())
#         )
#         return instance

#     def update(self, instance, validated_data):
#         old_values = {field: getattr(instance, field) for field in validated_data.keys()}
#         instance = super().update(instance, validated_data)

#         ConfigurationHistory.track_changes(
#             instance=instance,
#             user=self.context['request'].user,
#             action='update',
#             changed_fields=list(validated_data.keys())
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
#             'security_credential'
#         ]
#         extra_kwargs = {
#             'consumer_key': {'write_only': True},
#             'consumer_secret': {'write_only': True},
#             'passkey': {'write_only': True},
#             'security_credential': {'write_only': True},
#             'gateway': {'read_only': True}
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
#             'bn_code'
#         ]
#         extra_kwargs = {
#             'client_id': {'write_only': True},
#             'secret': {'write_only': True},
#             'merchant_id': {'write_only': True},
#             'gateway': {'read_only': True}
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
#             'bank_code'
#         ]
#         extra_kwargs = {
#             'gateway': {'read_only': True}
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
#     client_username = serializers.CharField(source='client.user.username', read_only=True)  # Changed to username
#     client_phone = serializers.CharField(source='client.user.phone_number', read_only=True)

#     class Meta:
#         model = ClientPaymentMethod
#         fields = [
#             'id',
#             'client',
#             'client_username',  # Changed from client_name
#             'client_phone',
#             'gateway',
#             'gateway_details',
#             'is_default',
#             'created_at'
#         ]
#         read_only_fields = [
#             'id',
#             'client_username',  # Changed from client_name
#             'client_phone',
#             'gateway_details',
#             'created_at'
#         ]

#     def validate(self, data):
#         if not data.get('gateway').is_active:
#             raise serializers.ValidationError("Cannot assign inactive payment method to client")
#         return data

#     def validate_is_default(self, value):
#         if value and self.instance:
#             existing_default = ClientPaymentMethod.objects.filter(
#                 client=self.validated_data['client'],
#                 is_default=True
#             ).exclude(pk=self.instance.pk).exists()
#             if existing_default:
#                 raise serializers.ValidationError(
#                     "Another default payment method already exists for this client"
#                 )
#         return value


# class TransactionSerializer(serializers.ModelSerializer):
#     status_display = serializers.CharField(source='get_status_display', read_only=True)
#     client_username = serializers.CharField(source='client.user.username', read_only=True)  # Changed to username
#     client_phone = serializers.CharField(source='client.user.phone_number', read_only=True)
#     gateway_details = serializers.SerializerMethodField()
#     plan_details = serializers.SerializerMethodField()
#     security_level = serializers.CharField(source='gateway.security_level', read_only=True)
#     security_level_display = serializers.CharField(
#         source='gateway.get_security_level_display',
#         read_only=True
#     )

#     class Meta:
#         model = Transaction
#         fields = [
#             'id',
#             'client',
#             'client_username',  # Changed from client_name
#             'client_phone',
#             'gateway',
#             'gateway_details',
#             'plan',
#             'plan_details',
#             'amount',
#             'reference',
#             'status',
#             'status_display',
#             'security_level',
#             'security_level_display',
#             'metadata',
#             'created_at',
#             'updated_at'
#         ]
#         read_only_fields = [
#             'id',
#             'status_display',
#             'client_username',  # Changed from client_name
#             'client_phone',
#             'gateway_details',
#             'plan_details',
#             'security_level',
#             'security_level_display',
#             'created_at',
#             'updated_at',
#             'reference'
#         ]

#     def get_gateway_details(self, obj):
#         if obj.gateway:
#             return PaymentGatewaySerializer(obj.gateway).data
#         return None

#     def get_plan_details(self, obj):
#         if obj.plan:
#             return {
#                 'id': obj.plan.id,
#                 'name': obj.plan.name,
#                 'price': str(obj.plan.price),
#                 'duration': f"{obj.plan.expiry_value} {obj.plan.expiry_unit}"
#             }
#         return None


# class TransactionCreateSerializer(TransactionSerializer):
#     phone = PhoneNumberField(write_only=True, required=False)

#     class Meta(TransactionSerializer.Meta):
#         extra_kwargs = {
#             'reference': {'read_only': True},
#             'status': {'read_only': True},
#             'client': {'required': False}
#         }

#     def validate(self, data):
#         if not self.context['request'].user.is_authenticated and not data.get('phone'):
#             raise serializers.ValidationError(
#                 "Phone number is required for unauthenticated transactions"
#             )
#         return data

#     def create(self, validated_data):
#         phone = validated_data.pop('phone', None)
#         request = self.context['request']

#         try:
#             if request.user.is_authenticated:
#                 client = Client.objects.get(user=request.user)
#             else:
#                 # For clients, we only need phone number, no name
#                 from django.contrib.auth import get_user_model
#                 User = get_user_model()
                
#                 # Check if user already exists with this phone number
#                 if User.objects.filter(phone_number=phone).exists():
#                     user = User.objects.get(phone_number=phone)
#                     client, created = Client.objects.get_or_create(user=user)
#                 else:
#                     # Create user with just phone number (no name)
#                     user = User.objects.create_user(
#                         phone_number=phone,
#                         user_type='client'
#                     )
#                     client = Client.objects.create(user=user)
                    
#         except Exception as e:
#             logger.error(f"Failed to create client: {str(e)}")
#             raise serializers.ValidationError(f"Failed to create client: {str(e)}")

#         validated_data['client'] = client

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
#             'plan',
#             'amount',
#             'reference'
#         ]

#     def validate_status(self, value):
#         if self.instance and self.instance.status == 'completed' and value != 'refunded':
#             raise serializers.ValidationError(
#                 "Completed transactions can only be updated to refunded status"
#             )
#         return value


# class ConfigurationHistorySerializer(serializers.ModelSerializer):
#     action_display = serializers.CharField(source='get_action_display', read_only=True)
#     user_username = serializers.CharField(source='user.username', read_only=True)  # Changed to username
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
#             'user_username',  # Changed from user_name
#             'user_email',
#             'timestamp'
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
#             'timestamp'
#         ]
#         read_only_fields = fields

#     def get_gateway_details(self, obj):
#         if obj.gateway:
#             return {
#                 'id': obj.gateway.id,
#                 'name': obj.gateway.get_name_display(),
#                 'type': obj.gateway.name
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


# class WebhookSerializer(serializers.Serializer):
#     gateway_id = serializers.UUIDField()
#     callback_url = serializers.URLField()

#     def validate_gateway_id(self, value):
#         try:
#             PaymentGateway.objects.get(id=value)
#             return value
#         except PaymentGateway.DoesNotExist:
#             raise serializers.ValidationError("Payment gateway not found")

#     def generate_secret(self):
#         gateway = PaymentGateway.objects.get(id=self.validated_data['gateway_id'])
#         return {
#             'callback_url': self.validated_data['callback_url'],
#             'webhook_secret': gateway.generate_webhook_secret()
#         }





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
#     MpesaCallbackEvent,
#     MpesaCallbackConfiguration,
#     MpesaCallbackLog,
#     MpesaCallbackRule,
#     MpesaCallbackSecurityProfile,
# )
# from account.models.admin_model import Client
# from internet_plans.models.create_plan_models import InternetPlan
# from network_management.models.router_management_model import Router
# import logging

# logger = logging.getLogger(__name__)

# class MpesaCallbackEventSerializer(serializers.ModelSerializer):
#     name_display = serializers.CharField(source='get_name_display', read_only=True)

#     class Meta:
#         model = MpesaCallbackEvent
#         fields = [
#             'id',
#             'name',
#             'name_display',
#             'description',
#             'is_active',
#             'priority',
#         ]
#         read_only_fields = ['id', 'name_display']

#     def validate_priority(self, value):
#         if not 1 <= value <= 10:
#             raise serializers.ValidationError("Priority must be between 1 and 10")
#         return value


# class MpesaCallbackSecurityProfileSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = MpesaCallbackSecurityProfile
#         fields = [
#             'id',
#             'name',
#             'ip_whitelist',
#             'rate_limit_requests',
#             'rate_limit_period',
#             'require_https',
#             'signature_validation',
#             'encryption_required',
#             'custom_headers',
#         ]
#         read_only_fields = ['id']

#     def validate(self, data):
#         if data.get('rate_limit_requests', 0) < 0:
#             raise serializers.ValidationError("Rate limit requests cannot be negative")
#         if data.get('rate_limit_period', 0) <= 0:
#             raise serializers.ValidationError("Rate limit period must be greater than 0")
#         return data


# class MpesaCallbackConfigurationSerializer(serializers.ModelSerializer):
#     security_level_display = serializers.CharField(source='get_security_level_display', read_only=True)
#     router_name = serializers.CharField(source='router.name', read_only=True)
#     event_details = MpesaCallbackEventSerializer(source='event', read_only=True)
#     security_profile_details = MpesaCallbackSecurityProfileSerializer(source='security_profile', read_only=True)

#     class Meta:
#         model = MpesaCallbackConfiguration
#         fields = [
#             'id',
#             'router',
#             'router_name',
#             'event',
#             'event_details',
#             'callback_url',
#             'webhook_secret',
#             'security_level',
#             'security_level_display',
#             'security_profile',
#             'security_profile_details',
#             'is_active',
#             'retry_enabled',
#             'max_retries',
#             'timeout_seconds',
#             'custom_headers',
#             'created_at',
#             'updated_at',
#         ]
#         read_only_fields = [
#             'id',
#             'router_name',
#             'event_details',
#             'security_level_display',
#             'security_profile_details',
#             'created_at',
#             'updated_at',
#             'webhook_secret',
#         ]
#         extra_kwargs = {
#             'webhook_secret': {'write_only': True},
#         }

#     def validate(self, data):
#         if data.get('max_retries', 0) < 0:
#             raise serializers.ValidationError("Max retries cannot be negative")
#         if data.get('timeout_seconds', 0) < 1:
#             raise serializers.ValidationError("Timeout seconds must be at least 1")
#         return data

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


# class MpesaCallbackLogSerializer(serializers.ModelSerializer):
#     status_display = serializers.CharField(source='get_status_display', read_only=True)
#     configuration_details = MpesaCallbackConfigurationSerializer(source='configuration', read_only=True)
#     transaction_details = serializers.SerializerMethodField()

#     class Meta:
#         model = MpesaCallbackLog
#         fields = [
#             'id',
#             'configuration',
#             'configuration_details',
#             'transaction',
#             'transaction_details',
#             'payload',
#             'response_status',
#             'response_body',
#             'status',
#             'status_display',
#             'retry_count',
#             'error_message',
#             'is_test',
#             'processed_at',
#             'created_at',
#         ]
#         read_only_fields = fields

#     def get_transaction_details(self, obj):
#         if obj.transaction:
#             return TransactionSerializer(obj.transaction).data
#         return None


# class MpesaCallbackRuleSerializer(serializers.ModelSerializer):
#     rule_type_display = serializers.CharField(source='get_rule_type_display', read_only=True)
#     target_configuration_details = MpesaCallbackConfigurationSerializer(source='target_configuration', read_only=True)

#     class Meta:
#         model = MpesaCallbackRule
#         fields = [
#             'id',
#             'name',
#             'rule_type',
#             'rule_type_display',
#             'condition',
#             'target_configuration',
#             'target_configuration_details',
#             'priority',
#             'is_active',
#             'description',
#         ]
#         read_only_fields = ['id', 'rule_type_display', 'target_configuration_details']

#     def validate_condition(self, value):
#         try:
#             json.loads(value) if isinstance(value, str) else value
#             return value
#         except json.JSONDecodeError:
#             raise serializers.ValidationError("Condition must be valid JSON")

#     def validate_priority(self, value):
#         if not 1 <= value <= 10:
#             raise serializers.ValidationError("Priority must be between 1 and 10")
#         return value


# class PaymentGatewaySerializer(serializers.ModelSerializer):
#     type_display = serializers.CharField(source='get_name_display', read_only=True)
#     security_level_display = serializers.CharField(source='get_security_level_display', read_only=True)
#     config = serializers.SerializerMethodField()
#     created_by_name = serializers.SerializerMethodField()

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
#     plan_details = serializers.SerializerMethodField()
#     security_level = serializers.CharField(source='gateway.security_level', read_only=True)
#     security_level_display = serializers.CharField(
#         source='gateway.get_security_level_display',
#         read_only=True,
#     )

#     class Meta:
#         model = Transaction
#         fields = [
#             'id',
#             'client',
#             'client_username',
#             'client_phone',
#             'gateway',
#             'gateway_details',
#             'plan',
#             'plan_details',
#             'amount',
#             'reference',
#             'status',
#             'status_display',
#             'security_level',
#             'security_level_display',
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
#             'plan_details',
#             'security_level',
#             'security_level_display',
#             'created_at',
#             'updated_at',
#             'reference',
#         ]

#     def get_gateway_details(self, obj):
#         if obj.gateway:
#             return PaymentGatewaySerializer(obj.gateway).data
#         return None

#     def get_plan_details(self, obj):
#         if obj.plan:
#             return {
#                 'id': obj.plan.id,
#                 'name': obj.plan.name,
#                 'price': str(obj.plan.price),
#                 'duration': f"{obj.plan.expiry_value} {obj.plan.expiry_unit}",
#             }
#         return None


# class TransactionCreateSerializer(TransactionSerializer):
#     phone = PhoneNumberField(write_only=True, required=False)

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
#         return data

#     def create(self, validated_data):
#         phone = validated_data.pop('phone', None)
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
#                     user = User.objects.create_user(
#                         phone_number=phone,
#                         user_type='client',
#                     )
#                     client = Client.objects.create(user=user)

#         except Exception as e:
#             logger.error(f"Failed to create client: {str(e)}")
#             raise serializers.ValidationError(f"Failed to create client: {str(e)}")

#         validated_data['client'] = client

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
#             'plan',
#             'amount',
#             'reference',
#         ]

#     def validate_status(self, value):
#         if self.instance and self.instance.status == 'completed' and value != 'refunded':
#             raise serializers.ValidationError(
#                 "Completed transactions can only be updated to refunded status"
#             )
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


# class WebhookSerializer(serializers.Serializer):
#     gateway_id = serializers.UUIDField()
#     callback_url = serializers.URLField()

#     def validate_gateway_id(self, value):
#         try:
#             PaymentGateway.objects.get(id=value)
#             return value
#         except PaymentGateway.DoesNotExist:
#             raise serializers.ValidationError("Payment gateway not found")

#     def generate_secret(self):
#         gateway = PaymentGateway.objects.get(id=self.validated_data['gateway_id'])
#         return {
#             'callback_url': self.validated_data['callback_url'],
#             'webhook_secret': gateway.generate_webhook_secret(),
#         }







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
    MpesaCallbackEvent,
    MpesaCallbackConfiguration,
    MpesaCallbackLog,
    MpesaCallbackRule,
    MpesaCallbackSecurityProfile,
)
from account.models.admin_model import Client
from internet_plans.models.create_plan_models import InternetPlan
from network_management.models.router_management_model import Router
import logging

logger = logging.getLogger(__name__)

class MpesaCallbackEventSerializer(serializers.ModelSerializer):
    name_display = serializers.CharField(source='get_name_display', read_only=True)

    class Meta:
        model = MpesaCallbackEvent
        fields = [
            'id',
            'name',
            'name_display',
            'description',
            'is_active',
            'priority',
        ]
        read_only_fields = ['id', 'name_display']

    def validate_priority(self, value):
        if not 1 <= value <= 10:
            raise serializers.ValidationError("Priority must be between 1 and 10")
        return value


class MpesaCallbackSecurityProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = MpesaCallbackSecurityProfile
        fields = [
            'id',
            'name',
            'ip_whitelist',
            'rate_limit_requests',
            'rate_limit_period',
            'require_https',
            'signature_validation',
            'encryption_required',
            'custom_headers',
        ]
        read_only_fields = ['id']

    def validate(self, data):
        if data.get('rate_limit_requests', 0) < 0:
            raise serializers.ValidationError("Rate limit requests cannot be negative")
        if data.get('rate_limit_period', 0) <= 0:
            raise serializers.ValidationError("Rate limit period must be greater than 0")
        return data


class MpesaCallbackConfigurationSerializer(serializers.ModelSerializer):
    security_level_display = serializers.CharField(source='get_security_level_display', read_only=True)
    router_name = serializers.CharField(source='router.name', read_only=True)
    event_details = MpesaCallbackEventSerializer(source='event', read_only=True)
    security_profile_details = MpesaCallbackSecurityProfileSerializer(source='security_profile', read_only=True)

    class Meta:
        model = MpesaCallbackConfiguration
        fields = [
            'id',
            'router',
            'router_name',
            'event',
            'event_details',
            'callback_url',
            'webhook_secret',
            'security_level',
            'security_level_display',
            'security_profile',
            'security_profile_details',
            'is_active',
            'retry_enabled',
            'max_retries',
            'timeout_seconds',
            'custom_headers',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'router_name',
            'event_details',
            'security_level_display',
            'security_profile_details',
            'created_at',
            'updated_at',
            'webhook_secret',
        ]
        extra_kwargs = {
            'webhook_secret': {'write_only': True},
        }

    def validate(self, data):
        if data.get('max_retries', 0) < 0:
            raise serializers.ValidationError("Max retries cannot be negative")
        if data.get('timeout_seconds', 0) < 1:
            raise serializers.ValidationError("Timeout seconds must be at least 1")
        return data

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


class MpesaCallbackLogSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    configuration_details = MpesaCallbackConfigurationSerializer(source='configuration', read_only=True)
    transaction_details = serializers.SerializerMethodField()

    class Meta:
        model = MpesaCallbackLog
        fields = [
            'id',
            'configuration',
            'configuration_details',
            'transaction',
            'transaction_details',
            'payload',
            'response_status',
            'response_body',
            'status',
            'status_display',
            'retry_count',
            'error_message',
            'is_test',
            'processed_at',
            'created_at',
        ]
        read_only_fields = fields

    def get_transaction_details(self, obj):
        if obj.transaction:
            return TransactionSerializer(obj.transaction).data
        return None


class MpesaCallbackRuleSerializer(serializers.ModelSerializer):
    rule_type_display = serializers.CharField(source='get_rule_type_display', read_only=True)
    target_configuration_details = MpesaCallbackConfigurationSerializer(source='target_configuration', read_only=True)

    class Meta:
        model = MpesaCallbackRule
        fields = [
            'id',
            'name',
            'rule_type',
            'rule_type_display',
            'condition',
            'target_configuration',
            'target_configuration_details',
            'priority',
            'is_active',
            'description',
        ]
        read_only_fields = ['id', 'rule_type_display', 'target_configuration_details']

    def validate_condition(self, value):
        try:
            json.loads(value) if isinstance(value, str) else value
            return value
        except json.JSONDecodeError:
            raise serializers.ValidationError("Condition must be valid JSON")

    def validate_priority(self, value):
        if not 1 <= value <= 10:
            raise serializers.ValidationError("Priority must be between 1 and 10")
        return value


class PaymentGatewaySerializer(serializers.ModelSerializer):
    type_display = serializers.CharField(source='get_name_display', read_only=True)
    security_level_display = serializers.CharField(source='get_security_level_display', read_only=True)
    config = serializers.SerializerMethodField()
    created_by_name = serializers.SerializerMethodField()

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

    class Meta:
        model = MpesaConfig
        fields = [
            'id',
            'gateway',
            'paybill_number',
            'till_number',
            'short_code',
            'is_paybill',
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
        ]
        extra_kwargs = {
            'client_id': {'write_only': True},
            'secret': {'write_only': True},
            'merchant_id': {'write_only': True},
            'gateway': {'read_only': True},
        }

    def validate(self, data):
        required_fields = ['client_id', 'secret', 'callback_url']
        for field in required_fields:
            if not data.get(field):
                raise serializers.ValidationError(f"{field} is required")
        return data


class BankConfigSerializer(serializers.ModelSerializer):
    bank_display = serializers.SerializerMethodField()

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
        ]
        extra_kwargs = {
            'gateway': {'read_only': True},
        }

    def get_bank_display(self, obj):
        return f"{obj.bank_name} ({obj.bank_code})" if obj.bank_code else obj.bank_name

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
            'created_at',
        ]
        read_only_fields = [
            'id',
            'client_username',
            'client_phone',
            'gateway_details',
            'created_at',
        ]

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
    plan_details = serializers.SerializerMethodField()
    security_level = serializers.CharField(source='gateway.security_level', read_only=True)
    security_level_display = serializers.CharField(
        source='gateway.get_security_level_display',
        read_only=True,
    )

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
            'plan_details',
            'amount',
            'reference',
            'status',
            'status_display',
            'security_level',
            'security_level_display',
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
            'plan_details',
            'security_level',
            'security_level_display',
            'created_at',
            'updated_at',
            'reference',
        ]

    def get_gateway_details(self, obj):
        if obj.gateway:
            return PaymentGatewaySerializer(obj.gateway).data
        return None

    def get_plan_details(self, obj):
        if obj.plan:
            return {
                'id': obj.plan.id,
                'name': obj.plan.name,
                'price': str(obj.plan.price),
                'duration': f"{obj.plan.expiry_value} {obj.plan.expiry_unit}",
            }
        return None


class TransactionCreateSerializer(TransactionSerializer):
    phone = PhoneNumberField(write_only=True, required=False)

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
        return data

    def create(self, validated_data):
        phone = validated_data.pop('phone', None)
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
                    user = User.objects.create_user(
                        phone_number=phone,
                        user_type='client',
                    )
                    client = Client.objects.create(user=user)

        except Exception as e:
            logger.error(f"Failed to create client: {str(e)}")
            raise serializers.ValidationError(f"Failed to create client: {str(e)}")

        validated_data['client'] = client

        if not validated_data.get('reference'):
            validated_data['reference'] = self._generate_secure_reference()

        max_retries = 3
        for attempt in range(max_retries):
            try:
                return super().create(validated_data)
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
            'plan',
            'amount',
            'reference',
        ]

    def validate_status(self, value):
        if self.instance and self.instance.status == 'completed' and value != 'refunded':
            raise serializers.ValidationError(
                "Completed transactions can only be updated to refunded status"
            )
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


class WebhookSerializer(serializers.Serializer):
    gateway_id = serializers.UUIDField()
    callback_url = serializers.URLField()

    def validate_gateway_id(self, value):
        try:
            PaymentGateway.objects.get(id=value)
            return value
        except PaymentGateway.DoesNotExist:
            raise serializers.ValidationError("Payment gateway not found")

    def generate_secret(self):
        gateway = PaymentGateway.objects.get(id=self.validated_data['gateway_id'])
        return {
            'callback_url': self.validated_data['callback_url'],
            'webhook_secret': gateway.generate_webhook_secret(),
        }


class MpesaCallbackTestSerializer(serializers.Serializer):
    configuration_id = serializers.UUIDField()
    test_payload = serializers.JSONField()
    validate_security = serializers.BooleanField(default=True)


class MpesaCallbackBulkUpdateSerializer(serializers.Serializer):
    configuration_ids = serializers.ListField(child=serializers.UUIDField())
    is_active = serializers.BooleanField(required=False)
    security_level = serializers.CharField(required=False, max_length=10)

    def validate_security_level(self, value):
        if value and value not in dict(MpesaCallbackConfiguration.SECURITY_LEVELS).keys():
            raise serializers.ValidationError("Invalid security level")
        return value