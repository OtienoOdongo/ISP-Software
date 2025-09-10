

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
#     """Serializer for PaymentGateway model, handling gateway details and related configurations."""
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
#         """Dynamically returns the appropriate config serializer based on gateway type."""
#         if obj.name in ['mpesa_paybill', 'mpesa_till'] and hasattr(obj, 'mpesaconfig'):
#             return MpesaConfigSerializer(obj.mpesaconfig).data
#         elif obj.name == 'paypal' and hasattr(obj, 'paypalconfig'):
#             return PayPalConfigSerializer(obj.paypalconfig).data
#         elif obj.name == 'bank_transfer' and hasattr(obj, 'bankconfig'):
#             return BankConfigSerializer(obj.bankconfig).data
#         return None

#     def get_created_by_name(self, obj):
#         """Returns the name of the user who created the gateway, handling None case."""
#         return obj.created_by.name if obj.created_by else "Unknown"

# class MpesaConfigSerializer(serializers.ModelSerializer):
#     """Serializer for MpesaConfig model, handling M-Pesa-specific configurations."""
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
#         """Check if this is a paybill configuration."""
#         return bool(obj.paybill_number)

#     def validate(self, data):
#         """Ensure exactly one of paybill_number or till_number is provided."""
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
#     """Serializer for PayPalConfig model, handling PayPal-specific configurations."""
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
#         """Ensure required fields are provided."""
#         required_fields = ['client_id', 'secret', 'callback_url']
#         for field in required_fields:
#             if not data.get(field):
#                 raise serializers.ValidationError(f"{field} is required")
#         return data

# class BankConfigSerializer(serializers.ModelSerializer):
#     """Serializer for BankConfig model, handling bank transfer configurations."""
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
#         """Format bank name for display."""
#         return f"{obj.bank_name} ({obj.bank_code})" if obj.bank_code else obj.bank_name

#     def validate(self, data):
#         """Ensure required fields are provided."""
#         required_fields = ['bank_name', 'account_name', 'account_number']
#         for field in required_fields:
#             if not data.get(field):
#                 raise serializers.ValidationError(f"{field} is required")
#         return data

# class ClientPaymentMethodSerializer(serializers.ModelSerializer):
#     """Serializer for ClientPaymentMethod model, linking clients to payment gateways."""
#     gateway_details = PaymentGatewaySerializer(source='gateway', read_only=True)
#     client_name = serializers.SerializerMethodField()
#     client_phone = serializers.SerializerMethodField()

#     class Meta:
#         model = ClientPaymentMethod
#         fields = [
#             'id',
#             'client',
#             'client_name',
#             'client_phone',
#             'gateway',
#             'gateway_details',
#             'is_default',
#             'created_at'
#         ]
#         read_only_fields = [
#             'id',
#             'client_name',
#             'client_phone',
#             'gateway_details',
#             'created_at'
#         ]

#     def get_client_name(self, obj):
#         """Returns client name, handling None case."""
#         return obj.client.user.name if obj.client.user else "Unknown"

#     def get_client_phone(self, obj):
#         """Returns client phone number, handling None case."""
#         return str(obj.client.user.phonenumber) if obj.client.user and obj.client.user.phonenumber else "Unknown"

#     def validate(self, data):
#         """Validate payment method assignment."""
#         if not data.get('gateway').is_active:
#             raise serializers.ValidationError("Cannot assign inactive payment method to client")
#         return data

#     def validate_is_default(self, value):
#         """Ensure only one default payment method per client."""
#         if value and self.instance:
#             existing_default = ClientPaymentMethod.objects.filter(
#                 client=self.validated_data['client'], is_default=True
#             ).exclude(pk=self.instance.pk).exists()
#             if existing_default:
#                 raise serializers.ValidationError(
#                     "Another default payment method already exists for this client"
#                 )
#         return value

# class TransactionSerializer(serializers.ModelSerializer):
#     """Serializer for Transaction model, handling transaction details."""
#     status_display = serializers.CharField(source='get_status_display', read_only=True)
#     client_name = serializers.SerializerMethodField()
#     client_phone = serializers.SerializerMethodField()
#     gateway_details = serializers.SerializerMethodField()
#     plan_details = serializers.SerializerMethodField()
#     security_level = serializers.CharField(source='gateway.security_level', read_only=True)
#     security_level_display = serializers.CharField(source='gateway.get_security_level_display', read_only=True)

#     class Meta:
#         model = Transaction
#         fields = [
#             'id',
#             'client',
#             'client_name',
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
#             'client_name',
#             'client_phone',
#             'gateway_details',
#             'plan_details',
#             'security_level',
#             'security_level_display',
#             'created_at',
#             'updated_at',
#             'reference'
#         ]

#     def get_client_name(self, obj):
#         """Returns client name, handling None case."""
#         return obj.client.user.name if obj.client.user else "Unknown"

#     def get_client_phone(self, obj):
#         """Returns client phone number, handling None case."""
#         return str(obj.client.user.phonenumber) if obj.client.user and obj.client.user.phonenumber else "Unknown"

#     def get_gateway_details(self, obj):
#         """Get gateway details."""
#         if obj.gateway:
#             return PaymentGatewaySerializer(obj.gateway).data
#         return None

#     def get_plan_details(self, obj):
#         """Get simplified plan details."""
#         if obj.plan:
#             return {
#                 'id': obj.plan.id,
#                 'name': obj.plan.name,
#                 'price': str(obj.plan.price),
#                 'duration': obj.plan.duration_display()  # Assumes duration_display exists
#             }
#         return None

# class TransactionCreateSerializer(TransactionSerializer):
#     """Serializer for creating transactions, handling authenticated and unauthenticated users."""
#     phone = PhoneNumberField(write_only=True, required=False)

#     class Meta(TransactionSerializer.Meta):
#         extra_kwargs = {
#             'reference': {'read_only': True},
#             'status': {'read_only': True},
#             'client': {'required': False}
#         }

#     def validate(self, data):
#         """Validate transaction creation."""
#         if not self.context['request'].user.is_authenticated and not data.get('phone'):
#             raise serializers.ValidationError(
#                 "Phone number is required for unauthenticated transactions"
#             )
#         return data

#     def create(self, validated_data):
#         """Create transaction with secure reference generation."""
#         phone = validated_data.pop('phone', None)
#         request = self.context['request']

#         # Get or create client
#         try:
#             if request.user.is_authenticated:
#                 client = Client.objects.get(user=request.user)
#             else:
#                 client, _ = Client.objects.get_or_create(
#                     user__phonenumber=phone,
#                     defaults={
#                         'user__name': "Internet Customer",  # Consider making configurable
#                         'user__user_type': 'client'
#                     }
#                 )
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
#                     time.sleep(0.1)  # Small delay to prevent database overload
#                     validated_data['reference'] = self._generate_secure_reference()
#                 else:
#                     logger.error(f"Failed to create transaction after {max_retries} attempts")
#                     raise serializers.ValidationError(
#                         {'reference': 'Could not generate unique reference'}
#                     )

#     def _generate_secure_reference(self):
#         """Generate cryptographically secure reference, aligned with model."""
#         timestamp = timezone.now().strftime('%Y%m%d%H%M%S')
#         random_part = get_random_string(8, 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789')
#         return f"TX-{timestamp}-{random_part}"

# class TransactionUpdateSerializer(TransactionSerializer):
#     """Serializer for updating transactions, restricting critical fields."""
#     class Meta(TransactionSerializer.Meta):
#         read_only_fields = TransactionSerializer.Meta.read_only_fields + [
#             'client',
#             'gateway',
#             'plan',
#             'amount',
#             'reference'
#         ]

#     def validate_status(self, value):
#         """Ensure valid status transitions."""
#         if self.instance and self.instance.status == 'completed' and value != 'refunded':
#             raise serializers.ValidationError(
#                 "Completed transactions can only be updated to refunded status"
#             )
#         return value

# class ConfigurationHistorySerializer(serializers.ModelSerializer):
#     """Serializer for ConfigurationHistory model, for auditing configuration changes."""
#     action_display = serializers.CharField(source='get_action_display', read_only=True)
#     user_name = serializers.SerializerMethodField()
#     user_email = serializers.SerializerMethodField()

#     class Meta:
#         model = ConfigurationHistory
#         fields = [
#             'id',
#             'action',
#             'action_display',
#             'model',
#             'object_id',
#             'changes',
#             'user',
#             'user_name',
#             'user_email',
#             'timestamp'
#         ]
#         read_only_fields = fields

#     def get_user_name(self, obj):
#         """Returns user name, handling None case."""
#         return obj.user.name if obj.user else "Unknown"

#     def get_user_email(self, obj):
#         """Returns user email, handling None case."""
#         return obj.user.email if obj.user else "Unknown"

# class WebhookLogSerializer(serializers.ModelSerializer):
#     """Serializer for WebhookLog model, for auditing webhook requests."""
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
#         """Get simplified gateway details."""
#         if obj.gateway:
#             return {
#                 'id': obj.gateway.id,
#                 'name': obj.gateway.get_name_display(),
#                 'type': obj.gateway.name
#             }
#         return None

#     def validate_payload(self, value):
#         """Ensure payload is valid JSON."""
#         try:
#             json.loads(value) if isinstance(value, str) else value
#             return value
#         except json.JSONDecodeError:
#             raise serializers.ValidationError("Invalid JSON payload")

#     def validate_headers(self, value):
#         """Ensure headers is valid JSON."""
#         try:
#             json.loads(value) if isinstance(value, str) else value
#             return value
#         except json.JSONDecodeError:
#             raise serializers.ValidationError("Invalid JSON headers")

# class PaymentGatewayConfigSerializer(serializers.Serializer):
#     """
#     Combined serializer for payment gateway configurations.
#     Expects exactly one configuration type (mpesa_paybill, mpesa_till, paypal, or bank_transfer).
#     """
#     mpesa_paybill = MpesaConfigSerializer(required=False)
#     mpesa_till = MpesaConfigSerializer(required=False)
#     paypal = PayPalConfigSerializer(required=False)
#     bank_transfer = BankConfigSerializer(required=False)
#     is_active = serializers.BooleanField(default=False)
#     sandbox_mode = serializers.BooleanField(default=True)
#     transaction_limit = serializers.DecimalField(
#         max_digits=12, decimal_places=2, required=False
#     )
#     auto_settle = serializers.BooleanField(default=True)

#     def validate(self, data):
#         """Validate that exactly one configuration type is provided and matches existing type for updates."""
#         config_types = [
#             k for k in data.keys() 
#             if k in ['mpesa_paybill', 'mpesa_till', 'paypal', 'bank_transfer']
#         ]
#         if len(config_types) != 1:
#             raise serializers.ValidationError(
#                 "Exactly one payment gateway configuration must be provided"
#             )
#         if self.instance and self.instance.name != config_types[0]:
#             raise serializers.ValidationError(
#                 "Cannot change the payment gateway type during update"
#             )
#         return data

#     def create(self, validated_data):
#         """Handle creation of gateway configuration."""
#         try:
#             # Determine which configuration type we're creating
#             config_type, config_data = next(
#                 (k, v) for k, v in validated_data.items() 
#                 if k in ['mpesa_paybill', 'mpesa_till', 'paypal', 'bank_transfer']
#             )

#             # Create the base gateway
#             gateway = PaymentGateway.objects.create(
#                 name=config_type,
#                 is_active=validated_data.get('is_active', False),
#                 sandbox_mode=validated_data.get('sandbox_mode', True),
#                 transaction_limit=validated_data.get('transaction_limit'),
#                 auto_settle=validated_data.get('auto_settle', True),
#                 created_by=self.context['request'].user
#             )

#             # Create the specific configuration
#             if config_type in ['mpesa_paybill', 'mpesa_till']:
#                 MpesaConfig.objects.create(
#                     gateway=gateway,
#                     paybill_number=config_data.get('paybill_number'),
#                     till_number=config_data.get('till_number'),
#                     consumer_key=config_data.get('consumer_key'),
#                     consumer_secret=config_data.get('consumer_secret'),
#                     passkey=config_data.get('passkey'),
#                     callback_url=config_data.get('callback_url'),
#                     initiator_name=config_data.get('initiator_name'),
#                     security_credential=config_data.get('security_credential')
#                 )
#             elif config_type == 'paypal':
#                 PayPalConfig.objects.create(
#                     gateway=gateway,
#                     client_id=config_data.get('client_id'),
#                     secret=config_data.get('secret'),
#                     merchant_id=config_data.get('merchant_id'),
#                     callback_url=config_data.get('callback_url'),
#                     webhook_id=config_data.get('webhook_id'),
#                     bn_code=config_data.get('bn_code')
#                 )
#             elif config_type == 'bank_transfer':
#                 BankConfig.objects.create(
#                     gateway=gateway,
#                     bank_name=config_data.get('bank_name'),
#                     account_name=config_data.get('account_name'),
#                     account_number=config_data.get('account_number'),
#                     branch_code=config_data.get('branch_code'),
#                     swift_code=config_data.get('swift_code'),
#                     iban=config_data.get('iban'),
#                     bank_code=config_data.get('bank_code')
#                 )

#             # Log the configuration change
#             ConfigurationHistory.objects.create(
#                 action='create',
#                 model='PaymentGateway',
#                 object_id=str(gateway.id),
#                 changes=[f"Created {gateway.get_name_display()} configuration"],
#                 user=self.context['request'].user
#             )

#             return gateway

#         except Exception as e:
#             logger.error(f"Failed to create payment gateway configuration: {str(e)}")
#             raise serializers.ValidationError(
#                 {"error": f"Failed to create configuration: {str(e)}"}
#             )

#     def update(self, instance, validated_data):
#         """Handle updating of gateway configuration."""
#         try:
#             # Determine which configuration type we're updating
#             config_type, config_data = next(
#                 (k, v) for k, v in validated_data.items() 
#                 if k in ['mpesa_paybill', 'mpesa_till', 'paypal', 'bank_transfer']
#             )

#             # Update base gateway fields
#             instance.is_active = validated_data.get('is_active', instance.is_active)
#             instance.sandbox_mode = validated_data.get('sandbox_mode', instance.sandbox_mode)
#             instance.transaction_limit = validated_data.get('transaction_limit', instance.transaction_limit)
#             instance.auto_settle = validated_data.get('auto_settle', instance.auto_settle)
#             instance.save()

#             # Update the specific configuration
#             if config_type in ['mpesa_paybill', 'mpesa_till'] and hasattr(instance, 'mpesaconfig'):
#                 config = instance.mpesaconfig
#                 config.paybill_number = config_data.get('paybill_number', config.paybill_number)
#                 config.till_number = config_data.get('till_number', config.till_number)
#                 config.consumer_key = config_data.get('consumer_key', config.consumer_key)
#                 config.consumer_secret = config_data.get('consumer_secret', config.consumer_secret)
#                 config.passkey = config_data.get('passkey', config.passkey)
#                 config.callback_url = config_data.get('callback_url', config.callback_url)
#                 config.initiator_name = config_data.get('initiator_name', config.initiator_name)
#                 config.security_credential = config_data.get('security_credential', config.security_credential)
#                 config.save()
#             elif config_type == 'paypal' and hasattr(instance, 'paypalconfig'):
#                 config = instance.paypalconfig
#                 config.client_id = config_data.get('client_id', config.client_id)
#                 config.secret = config_data.get('secret', config.secret)
#                 config.merchant_id = config_data.get('merchant_id', config.merchant_id)
#                 config.callback_url = config_data.get('callback_url', config.callback_url)
#                 config.webhook_id = config_data.get('webhook_id', config.webhook_id)
#                 config.bn_code = config_data.get('bn_code', config.bn_code)
#                 config.save()
#             elif config_type == 'bank_transfer' and hasattr(instance, 'bankconfig'):
#                 config = instance.bankconfig
#                 config.bank_name = config_data.get('bank_name', config.bank_name)
#                 config.account_name = config_data.get('account_name', config.account_name)
#                 config.account_number = config_data.get('account_number', config.account_number)
#                 config.branch_code = config_data.get('branch_code', config.branch_code)
#                 config.swift_code = config_data.get('swift_code', config.swift_code)
#                 config.iban = config_data.get('iban', config.iban)
#                 config.bank_code = config_data.get('bank_code', config.bank_code)
#                 config.save()

#             # Log the configuration change
#             ConfigurationHistory.objects.create(
#                 action='update',
#                 model='PaymentGateway',
#                 object_id=str(instance.id),
#                 changes=["Updated gateway configuration"],
#                 user=self.context['request'].user
#             )

#             return instance

#         except Exception as e:
#             logger.error(f"Failed to update payment gateway configuration: {str(e)}")
#             raise serializers.ValidationError(
#                 {"error": f"Failed to update configuration: {str(e)}"}
#             )











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
#         return obj.created_by.get_full_name() if obj.created_by else "System"

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
#     client_name = serializers.SerializerMethodField()
#     client_phone = serializers.SerializerMethodField()

#     class Meta:
#         model = ClientPaymentMethod
#         fields = [
#             'id',
#             'client',
#             'client_name',
#             'client_phone',
#             'gateway',
#             'gateway_details',
#             'is_default',
#             'created_at'
#         ]
#         read_only_fields = [
#             'id',
#             'client_name',
#             'client_phone',
#             'gateway_details',
#             'created_at'
#         ]

#     def get_client_name(self, obj):
#         return obj.client.user.get_full_name() if obj.client.user else "Unknown"

#     def get_client_phone(self, obj):
#         return str(obj.client.user.phone_number) if obj.client.user and obj.client.user.phone_number else "Unknown"

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
#     client_name = serializers.SerializerMethodField()
#     client_phone = serializers.SerializerMethodField()
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
#             'client_name',
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
#             'client_name',
#             'client_phone',
#             'gateway_details',
#             'plan_details',
#             'security_level',
#             'security_level_display',
#             'created_at',
#             'updated_at',
#             'reference'
#         ]

#     def get_client_name(self, obj):
#         return obj.client.user.get_full_name() if obj.client.user else "Unknown"

#     def get_client_phone(self, obj):
#         return str(obj.client.user.phone_number) if obj.client.user and obj.client.user.phone_number else "Unknown"

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
#                 client, _ = Client.objects.get_or_create(
#                     user__phone_number=phone,
#                     defaults={
#                         'user__full_name': "Internet Customer",
#                         'user__user_type': 'client'
#                     }
#                 )
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
#     user_name = serializers.SerializerMethodField()
#     user_email = serializers.SerializerMethodField()

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
#             'user_name',
#             'user_email',
#             'timestamp'
#         ]
#         read_only_fields = fields

#     def get_user_name(self, obj):
#         return obj.user.get_full_name() if obj.user else "System"

#     def get_user_email(self, obj):
#         return obj.user.email if obj.user else "system"

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
#         return obj.created_by.get_full_name() if obj.created_by else "System"

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
#     client_name = serializers.SerializerMethodField()
#     client_phone = serializers.SerializerMethodField()

#     class Meta:
#         model = ClientPaymentMethod
#         fields = [
#             'id',
#             'client',
#             'client_name',
#             'client_phone',
#             'gateway',
#             'gateway_details',
#             'is_default',
#             'created_at'
#         ]
#         read_only_fields = [
#             'id',
#             'client_name',
#             'client_phone',
#             'gateway_details',
#             'created_at'
#         ]

#     def get_client_name(self, obj):
#         return obj.client.user.get_full_name() if obj.client.user else "Unknown"

#     def get_client_phone(self, obj):
#         return str(obj.client.user.phone_number) if obj.client.user and obj.client.user.phone_number else "Unknown"

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
#     client_name = serializers.SerializerMethodField()
#     client_phone = serializers.SerializerMethodField()
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
#             'client_name',
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
#             'client_name',
#             'client_phone',
#             'gateway_details',
#             'plan_details',
#             'security_level',
#             'security_level_display',
#             'created_at',
#             'updated_at',
#             'reference'
#         ]

#     def get_client_name(self, obj):
#         return obj.client.user.get_full_name() if obj.client.user else "Unknown"

#     def get_client_phone(self, obj):
#         return str(obj.client.user.phone_number) if obj.client.user and obj.client.user.phone_number else "Unknown"

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
#                 client, _ = Client.objects.get_or_create(
#                     user__phone_number=phone,
#                     defaults={
#                         'user__full_name': "Internet Customer",
#                         'user__user_type': 'client'
#                     }
#                 )
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
#     user_name = serializers.SerializerMethodField()
#     user_email = serializers.SerializerMethodField()

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
#             'user_name',
#             'user_email',
#             'timestamp'
#         ]
#         read_only_fields = fields

#     def get_user_name(self, obj):
#         return obj.user.get_full_name() if obj.user else "System"

#     def get_user_email(self, obj):
#         return obj.user.email if obj.user else "system"


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
    WebhookLog
)
from account.models.admin_model import Client
from internet_plans.models.create_plan_models import InternetPlan
import logging

logger = logging.getLogger(__name__)

class PaymentGatewaySerializer(serializers.ModelSerializer):
    type_display = serializers.CharField(source='get_name_display', read_only=True)
    security_level_display = serializers.CharField(
        source='get_security_level_display',
        read_only=True
    )
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
            'updated_at'
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
            'webhook_secret'
        ]

    def get_config(self, obj):
        if obj.name in ['mpesa_paybill', 'mpesa_till'] and hasattr(obj, 'mpesaconfig'):
            return MpesaConfigSerializer(obj.mpesaconfig).data
        elif obj.name == 'paypal' and hasattr(obj, 'paypalconfig'):
            return PayPalConfigSerializer(obj.paypalconfig).data
        elif obj.name == 'bank_transfer' and hasattr(obj, 'bankconfig'):
            return BankConfigSerializer(obj.bankconfig).data
        return None

    def get_created_by_name(self, obj):
        return obj.created_by.username if obj.created_by else "System"  # Changed to username

    def create(self, validated_data):
        instance = super().create(validated_data)
        instance.generate_webhook_secret()
        instance.save()

        ConfigurationHistory.track_changes(
            instance=instance,
            user=self.context['request'].user,
            action='create',
            changed_fields=list(validated_data.keys())
        )
        return instance

    def update(self, instance, validated_data):
        old_values = {field: getattr(instance, field) for field in validated_data.keys()}
        instance = super().update(instance, validated_data)

        ConfigurationHistory.track_changes(
            instance=instance,
            user=self.context['request'].user,
            action='update',
            changed_fields=list(validated_data.keys())
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
            'security_credential'
        ]
        extra_kwargs = {
            'consumer_key': {'write_only': True},
            'consumer_secret': {'write_only': True},
            'passkey': {'write_only': True},
            'security_credential': {'write_only': True},
            'gateway': {'read_only': True}
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
            'bn_code'
        ]
        extra_kwargs = {
            'client_id': {'write_only': True},
            'secret': {'write_only': True},
            'merchant_id': {'write_only': True},
            'gateway': {'read_only': True}
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
            'bank_code'
        ]
        extra_kwargs = {
            'gateway': {'read_only': True}
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
    client_username = serializers.CharField(source='client.user.username', read_only=True)  # Changed to username
    client_phone = serializers.CharField(source='client.user.phone_number', read_only=True)

    class Meta:
        model = ClientPaymentMethod
        fields = [
            'id',
            'client',
            'client_username',  # Changed from client_name
            'client_phone',
            'gateway',
            'gateway_details',
            'is_default',
            'created_at'
        ]
        read_only_fields = [
            'id',
            'client_username',  # Changed from client_name
            'client_phone',
            'gateway_details',
            'created_at'
        ]

    def validate(self, data):
        if not data.get('gateway').is_active:
            raise serializers.ValidationError("Cannot assign inactive payment method to client")
        return data

    def validate_is_default(self, value):
        if value and self.instance:
            existing_default = ClientPaymentMethod.objects.filter(
                client=self.validated_data['client'],
                is_default=True
            ).exclude(pk=self.instance.pk).exists()
            if existing_default:
                raise serializers.ValidationError(
                    "Another default payment method already exists for this client"
                )
        return value


class TransactionSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    client_username = serializers.CharField(source='client.user.username', read_only=True)  # Changed to username
    client_phone = serializers.CharField(source='client.user.phone_number', read_only=True)
    gateway_details = serializers.SerializerMethodField()
    plan_details = serializers.SerializerMethodField()
    security_level = serializers.CharField(source='gateway.security_level', read_only=True)
    security_level_display = serializers.CharField(
        source='gateway.get_security_level_display',
        read_only=True
    )

    class Meta:
        model = Transaction
        fields = [
            'id',
            'client',
            'client_username',  # Changed from client_name
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
            'updated_at'
        ]
        read_only_fields = [
            'id',
            'status_display',
            'client_username',  # Changed from client_name
            'client_phone',
            'gateway_details',
            'plan_details',
            'security_level',
            'security_level_display',
            'created_at',
            'updated_at',
            'reference'
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
                'duration': f"{obj.plan.expiry_value} {obj.plan.expiry_unit}"
            }
        return None


class TransactionCreateSerializer(TransactionSerializer):
    phone = PhoneNumberField(write_only=True, required=False)

    class Meta(TransactionSerializer.Meta):
        extra_kwargs = {
            'reference': {'read_only': True},
            'status': {'read_only': True},
            'client': {'required': False}
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
                # For clients, we only need phone number, no name
                from django.contrib.auth import get_user_model
                User = get_user_model()
                
                # Check if user already exists with this phone number
                if User.objects.filter(phone_number=phone).exists():
                    user = User.objects.get(phone_number=phone)
                    client, created = Client.objects.get_or_create(user=user)
                else:
                    # Create user with just phone number (no name)
                    user = User.objects.create_user(
                        phone_number=phone,
                        user_type='client'
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
            'reference'
        ]

    def validate_status(self, value):
        if self.instance and self.instance.status == 'completed' and value != 'refunded':
            raise serializers.ValidationError(
                "Completed transactions can only be updated to refunded status"
            )
        return value


class ConfigurationHistorySerializer(serializers.ModelSerializer):
    action_display = serializers.CharField(source='get_action_display', read_only=True)
    user_username = serializers.CharField(source='user.username', read_only=True)  # Changed to username
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
            'user_username',  # Changed from user_name
            'user_email',
            'timestamp'
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
            'timestamp'
        ]
        read_only_fields = fields

    def get_gateway_details(self, obj):
        if obj.gateway:
            return {
                'id': obj.gateway.id,
                'name': obj.gateway.get_name_display(),
                'type': obj.gateway.name
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
            'webhook_secret': gateway.generate_webhook_secret()
        }