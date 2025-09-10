

# import logging
# import uuid
# import json
# from django.db import models
# from django.core.exceptions import ValidationError
# from django.utils import timezone
# from django.contrib.auth import get_user_model
# from django.utils.crypto import get_random_string
# from django.core.validators import MinValueValidator
# from encrypted_fields import fields as encrypted_fields
# from phonenumber_field.modelfields import PhoneNumberField

# logger = logging.getLogger(__name__)
# User = get_user_model()

# class PaymentGateway(models.Model):
#     SECURITY_LEVELS = (
#         ('low', 'Low'),
#         ('medium', 'Medium'),
#         ('high', 'High'),
#         ('critical', 'Critical'),
#     )
    
#     PAYMENT_TYPES = (
#         ('mpesa_paybill', 'M-Pesa Paybill'),
#         ('mpesa_till', 'M-Pesa Till'),
#         ('bank_transfer', 'Bank Transfer'),
#         ('paypal', 'PayPal'),
#     )
    
#     id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
#     name = models.CharField(max_length=50, choices=PAYMENT_TYPES)
#     is_active = models.BooleanField(default=True)
#     sandbox_mode = models.BooleanField(default=True)
#     security_level = models.CharField(max_length=10, choices=SECURITY_LEVELS, default='medium')
#     transaction_limit = models.DecimalField(
#         max_digits=12, 
#         decimal_places=2, 
#         null=True, 
#         blank=True,
#         validators=[MinValueValidator(0)]
#     )
#     auto_settle = models.BooleanField(default=True)
#     webhook_secret = models.CharField(max_length=64, blank=True)
#     created_by = models.ForeignKey(
#         User, 
#         on_delete=models.SET_NULL,
#         null=True,
#         related_name='created_payment_gateways'
#     )
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)
    
#     class Meta:
#         verbose_name = 'Payment Gateway'
#         verbose_name_plural = 'Payment Gateways'
#         ordering = ['name']
#         indexes = [
#             models.Index(fields=['name', 'is_active']),
#             models.Index(fields=['security_level']),
#             models.Index(fields=['created_at']),
#         ]
    
#     def __str__(self):
#         return f"{self.get_name_display()} ({'Active' if self.is_active else 'Inactive'})"
    
#     def clean(self):
#         if self.name in ['mpesa_paybill', 'mpesa_till'] and not hasattr(self, 'mpesaconfig'):
#             raise ValidationError("M-Pesa configuration is required for M-Pesa gateways")
#         elif self.name == 'paypal' and not hasattr(self, 'paypalconfig'):
#             raise ValidationError("PayPal configuration is required for PayPal gateways")
#         elif self.name == 'bank_transfer' and not hasattr(self, 'bankconfig'):
#             raise ValidationError("Bank configuration is required for Bank Transfer gateways")
    
#     def save(self, *args, **kwargs):
#         if not self.webhook_secret:
#             self.webhook_secret = get_random_string(64)
#         super().save(*args, **kwargs)
    
#     def generate_webhook_secret(self):
#         if not self.webhook_secret:
#             self.webhook_secret = get_random_string(64)
#             self.save()
#         return self.webhook_secret

# class MpesaConfig(models.Model):
#     id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
#     gateway = models.OneToOneField(
#         PaymentGateway,
#         on_delete=models.CASCADE,
#         related_name='mpesaconfig'
#     )
#     consumer_key = encrypted_fields.EncryptedCharField(max_length=100)
#     consumer_secret = encrypted_fields.EncryptedCharField(max_length=100)
#     passkey = encrypted_fields.EncryptedCharField(max_length=100)
#     paybill_number = models.CharField(max_length=20, blank=True, null=True)
#     till_number = models.CharField(max_length=20, blank=True, null=True)
#     callback_url = models.URLField(max_length=500)
#     initiator_name = models.CharField(max_length=100, blank=True, null=True)
#     security_credential = encrypted_fields.EncryptedCharField(max_length=255, blank=True, null=True)
    
#     class Meta:
#         verbose_name = 'M-Pesa Configuration'
#         verbose_name_plural = 'M-Pesa Configurations'
    
#     def clean(self):
#         if not self.paybill_number and not self.till_number:
#             raise ValidationError("Either paybill number or till number must be set")
#         if self.paybill_number and self.till_number:
#             raise ValidationError("Cannot have both paybill and till number - choose one")
    
#     @property
#     def short_code(self):
#         return self.paybill_number or self.till_number

# class PayPalConfig(models.Model):
#     id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
#     gateway = models.OneToOneField(
#         PaymentGateway,
#         on_delete=models.CASCADE,
#         related_name='paypalconfig'
#     )
#     client_id = encrypted_fields.EncryptedCharField(max_length=100)
#     secret = encrypted_fields.EncryptedCharField(max_length=100)
#     merchant_id = encrypted_fields.EncryptedCharField(max_length=100, blank=True, null=True)
#     callback_url = models.URLField(max_length=500)
#     webhook_id = models.CharField(max_length=100, blank=True, null=True)
#     bn_code = models.CharField(max_length=50, blank=True, null=True)
    
#     class Meta:
#         verbose_name = 'PayPal Configuration'
#         verbose_name_plural = 'PayPal Configurations'

# class BankConfig(models.Model):
#     id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
#     gateway = models.OneToOneField(
#         PaymentGateway,
#         on_delete=models.CASCADE,
#         related_name='bankconfig'
#     )
#     bank_name = models.CharField(max_length=100)
#     account_name = models.CharField(max_length=100)
#     account_number = models.CharField(max_length=50)
#     branch_code = models.CharField(max_length=20, blank=True, null=True)
#     swift_code = models.CharField(max_length=20, blank=True, null=True)
#     iban = models.CharField(max_length=50, blank=True, null=True)
#     bank_code = models.CharField(max_length=20, blank=True, null=True)
    
#     class Meta:
#         verbose_name = 'Bank Configuration'
#         verbose_name_plural = 'Bank Configurations'

# class ClientPaymentMethod(models.Model):
#     id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
#     client = models.ForeignKey(
#         'account.Client',
#         on_delete=models.CASCADE,
#         related_name='payment_methods'
#     )
#     gateway = models.ForeignKey(
#         PaymentGateway,
#         on_delete=models.CASCADE,
#         related_name='client_methods'
#     )
#     is_default = models.BooleanField(default=False)
#     created_at = models.DateTimeField(auto_now_add=True)
    
#     class Meta:
#         verbose_name = 'Client Payment Method'
#         verbose_name_plural = 'Client Payment Methods'
#         unique_together = ('client', 'gateway')
#         ordering = ['-is_default', '-created_at']
    
#     def clean(self):
#         if not self.gateway.is_active:
#             raise ValidationError("Cannot assign inactive payment method to client")
    
#     def save(self, *args, **kwargs):
#         if self.is_default:
#             ClientPaymentMethod.objects.filter(
#                 client=self.client
#             ).exclude(pk=self.pk).update(is_default=False)
#         super().save(*args, **kwargs)
    
#     def __str__(self):
#         return f"{self.client} - {self.gateway.get_name_display()}"

# class Transaction(models.Model):
#     STATUS_CHOICES = (
#         ('pending', 'Pending'),
#         ('completed', 'Completed'),
#         ('failed', 'Failed'),
#         ('refunded', 'Refunded'),
#     )
    
#     id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
#     client = models.ForeignKey(
#         'account.Client',
#         on_delete=models.CASCADE,
#         related_name='transactions'
#     )
#     gateway = models.ForeignKey(
#         PaymentGateway,
#         on_delete=models.SET_NULL,
#         null=True,
#         related_name='transactions'
#     )
#     plan = models.ForeignKey(
#         'internet_plans.InternetPlan',
#         on_delete=models.SET_NULL,
#         null=True,
#         blank=True,
#         related_name='transactions'
#     )
#     amount = models.DecimalField(max_digits=12, decimal_places=2)
#     reference = models.CharField(max_length=100, unique=True)
#     status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
#     metadata = models.JSONField(default=dict)
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)
    
#     class Meta:
#         verbose_name = 'Transaction'
#         verbose_name_plural = 'Transactions'
#         ordering = ['-created_at']
#         indexes = [
#             models.Index(fields=['reference']),
#             models.Index(fields=['status']),
#             models.Index(fields=['created_at']),
#             models.Index(fields=['client', 'gateway']),
#         ]
    
#     def __str__(self):
#         return f"{self.reference} - {self.get_status_display()} ({self.amount})"
    
#     def save(self, *args, **kwargs):
#         if not self.reference:
#             self.reference = self._generate_reference()
#         super().save(*args, **kwargs)
    
#     def _generate_reference(self):
#         timestamp = timezone.now().strftime('%Y%m%d%H%M%S')
#         random_part = get_random_string(8, 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789')
#         return f"TX-{timestamp}-{random_part}"

# class ConfigurationHistory(models.Model):
#     ACTIONS = (
#         ('create', 'Create'),
#         ('update', 'Update'),
#         ('delete', 'Delete'),
#         ('activate', 'Activate'),
#         ('deactivate', 'Deactivate'),
#         ('test', 'Test Connection'),
#     )
    
#     id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
#     action = models.CharField(max_length=20, choices=ACTIONS)
#     model = models.CharField(max_length=50)
#     object_id = models.CharField(max_length=36)
#     changes = models.JSONField(default=list)
#     old_values = models.JSONField(default=dict)
#     new_values = models.JSONField(default=dict)
#     user = models.ForeignKey(
#         User,
#         on_delete=models.SET_NULL,
#         null=True,
#         related_name='payment_config_changes'
#     )
#     timestamp = models.DateTimeField(auto_now_add=True)
    
#     class Meta:
#         verbose_name = 'Configuration History'
#         verbose_name_plural = 'Configuration Histories'
#         ordering = ['-timestamp']
#         indexes = [
#             models.Index(fields=['model', 'object_id']),
#             models.Index(fields=['timestamp']),
#         ]
    
#     def __str__(self):
#         return f"{self.get_action_display()} on {self.model} {self.object_id} by {self.user}"
    
#     @classmethod
#     def track_changes(cls, instance, user, action, changed_fields):
#         old_values = {}
#         new_values = {}
        
#         for field in changed_fields:
#             old_values[field] = getattr(instance, f'_original_{field}', None)
#             new_values[field] = getattr(instance, field)
        
#         return cls.objects.create(
#             action=action,
#             model=instance.__class__.__name__,
#             object_id=instance.id,
#             changes=list(changed_fields),
#             old_values=old_values,
#             new_values=new_values,
#             user=user
#         )

# class WebhookLog(models.Model):
#     id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
#     gateway = models.ForeignKey(
#         PaymentGateway,
#         on_delete=models.CASCADE,
#         related_name='webhook_logs'
#     )
#     event_type = models.CharField(max_length=100)
#     payload = models.JSONField()
#     headers = models.JSONField()
#     ip_address = models.GenericIPAddressField()
#     status_code = models.PositiveSmallIntegerField()
#     response = models.TextField()
#     timestamp = models.DateTimeField(auto_now_add=True)
    
#     class Meta:
#         verbose_name = 'Webhook Log'
#         verbose_name_plural = 'Webhook Logs'
#         ordering = ['-timestamp']
    
#     def __str__(self):
#         return f"{self.gateway} webhook - {self.event_type} ({self.timestamp})"









# import logging
# import uuid
# import json
# from django.db import models
# from django.core.exceptions import ValidationError
# from django.utils import timezone
# from django.contrib.auth import get_user_model
# from django.utils.crypto import get_random_string
# from django.core.validators import MinValueValidator
# from phonenumber_field.modelfields import PhoneNumberField

# from utils.fernet_helper import get_fernet

# logger = logging.getLogger(__name__)
# User = get_user_model()


# class FernetEncryptedMixin:
#     """
#     Mixin to transparently encrypt/decrypt specified model fields using Fernet.
#     - define `_encrypted_fields = ["field_name", ...]` on the model
#     - fields should be stored in DB as TextField (encrypted bytes/base64 as str)
#     """

#     _encrypted_fields = []

#     def _encrypt(self, value: str) -> str:
#         if value is None or value == "":
#             return value
#         f = get_fernet()
#         return f.encrypt(value.encode()).decode()

#     def _decrypt(self, value: str) -> str:
#         if value is None or value == "":
#             return value
#         f = get_fernet()
#         return f.decrypt(value.encode()).decode()

#     def _is_encrypted(self, value: str) -> bool:
#         """
#         Quick heuristic: try decrypting; if it succeeds, treat as encrypted.
#         """
#         if value is None or value == "":
#             return False
#         try:
#             f = get_fernet()
#             f.decrypt(value.encode())
#             return True
#         except Exception:
#             return False

#     def save(self, *args, **kwargs):
#         # Encrypt all declared encrypted fields before saving (if not already encrypted)
#         for field in getattr(self, "_encrypted_fields", []):
#             # Use getattr with default to avoid AttributeError
#             raw_value = getattr(self, field, None)
#             if raw_value and not self._is_encrypted(raw_value):
#                 setattr(self, field, self._encrypt(raw_value))
#         super().save(*args, **kwargs)

#     def __getattribute__(self, name):
#         # avoid recursion and protect internal attributes
#         if name.startswith("_") or name in ("save",):
#             return super().__getattribute__(name)

#         try:
#             encrypted_fields = super().__getattribute__("_encrypted_fields")
#         except Exception:
#             encrypted_fields = []

#         if name in encrypted_fields:
#             # get the stored (possibly encrypted) value
#             val = super().__getattribute__(name)
#             if not val:
#                 return val
#             try:
#                 return self._decrypt(val)
#             except Exception:
#                 # if decryption fails, return raw value so code doesn't crash
#                 return val
#         return super().__getattribute__(name)


# class PaymentGateway(models.Model):
#     """
#     Represents a payment gateway configuration (e.g., M-Pesa, PayPal, Bank Transfer).
#     Supports sandbox mode, security levels, and per-gateway settings.
#     """

#     SECURITY_LEVELS = (
#         ("low", "Low"),
#         ("medium", "Medium"),
#         ("high", "High"),
#         ("critical", "Critical"),
#     )

#     PAYMENT_TYPES = (
#         ("mpesa_paybill", "M-Pesa Paybill"),
#         ("mpesa_till", "M-Pesa Till"),
#         ("bank_transfer", "Bank Transfer"),
#         ("paypal", "PayPal"),
#     )

#     id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
#     name = models.CharField(
#         max_length=50,
#         choices=PAYMENT_TYPES,
#         default="paypal",  
#     )
#     is_active = models.BooleanField(default=True)
#     sandbox_mode = models.BooleanField(default=True)
#     security_level = models.CharField(
#         max_length=10,
#         choices=SECURITY_LEVELS,
#         default="medium"
#     )
#     transaction_limit = models.DecimalField(
#         max_digits=12,
#         decimal_places=2,
#         null=True,
#         blank=True,
#         validators=[MinValueValidator(0)],
#     )
#     auto_settle = models.BooleanField(default=True)
#     webhook_secret = models.CharField(max_length=64, blank=True)
#     created_by = models.ForeignKey(
#         User,
#         on_delete=models.SET_NULL,
#         null=True,
#         related_name="created_payment_gateways"
#     )
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)

#     class Meta:
#         verbose_name = "Payment Gateway"
#         verbose_name_plural = "Payment Gateways"
#         ordering = ["name"]
#         indexes = [
#             models.Index(fields=["name", "is_active"]),
#             models.Index(fields=["security_level"]),
#             models.Index(fields=["created_at"]),
#         ]

#     def __str__(self):
#         """Returns a human-readable representation of the gateway."""
#         try:
#             return f"{self.get_name_display()} ({'Active' if self.is_active else 'Inactive'})"
#         except Exception:
#             return f"{self.name} ({'Active' if self.is_active else 'Inactive'})"

#     def clean(self):
#         """Validates related configuration depending on payment type."""
#         if self.name in ["mpesa_paybill", "mpesa_till"] and not hasattr(self, "mpesaconfig"):
#             raise ValidationError("M-Pesa configuration is required for M-Pesa gateways")
#         elif self.name == "paypal" and not hasattr(self, "paypalconfig"):
#             raise ValidationError("PayPal configuration is required for PayPal gateways")
#         elif self.name == "bank_transfer" and not hasattr(self, "bankconfig"):
#             raise ValidationError("Bank configuration is required for Bank Transfer gateways")

#     def save(self, *args, **kwargs):
#         """Auto-generate webhook secret if not provided."""
#         if not self.webhook_secret:
#             self.webhook_secret = get_random_string(64)
#         super().save(*args, **kwargs)

#     def generate_webhook_secret(self):
#         """Generates and saves a new webhook secret if missing."""
#         if not self.webhook_secret:
#             self.webhook_secret = get_random_string(64)
#             self.save()
#         return self.webhook_secret


# class MpesaConfig(FernetEncryptedMixin, models.Model):
#     _encrypted_fields = ["consumer_key", "consumer_secret", "passkey", "security_credential"]

#     id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
#     gateway = models.OneToOneField(PaymentGateway, on_delete=models.CASCADE, related_name="mpesaconfig")
#     consumer_key = models.TextField()
#     consumer_secret = models.TextField()
#     passkey = models.TextField()
#     paybill_number = models.CharField(max_length=20, blank=True, null=True)
#     till_number = models.CharField(max_length=20, blank=True, null=True)
#     callback_url = models.URLField(max_length=500)
#     initiator_name = models.CharField(max_length=100, blank=True, null=True)
#     security_credential = models.TextField(blank=True, null=True)

#     class Meta:
#         verbose_name = "M-Pesa Configuration"
#         verbose_name_plural = "M-Pesa Configurations"

#     def clean(self):
#         if not self.paybill_number and not self.till_number:
#             raise ValidationError("Either paybill number or till number must be set")
#         if self.paybill_number and self.till_number:
#             raise ValidationError("Cannot have both paybill and till number - choose one")

#     @property
#     def short_code(self):
#         return self.paybill_number or self.till_number

#     def __str__(self):
#         return f"M-Pesa config for {self.gateway}"


# class PayPalConfig(FernetEncryptedMixin, models.Model):
#     _encrypted_fields = ["client_id", "secret", "merchant_id"]

#     id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
#     gateway = models.OneToOneField(PaymentGateway, on_delete=models.CASCADE, related_name="paypalconfig")
#     client_id = models.TextField()
#     secret = models.TextField()
#     merchant_id = models.TextField(blank=True, null=True)
#     callback_url = models.URLField(max_length=500)
#     webhook_id = models.CharField(max_length=100, blank=True, null=True)
#     bn_code = models.CharField(max_length=50, blank=True, null=True)

#     class Meta:
#         verbose_name = "PayPal Configuration"
#         verbose_name_plural = "PayPal Configurations"

#     def __str__(self):
#         return f"PayPal config for {self.gateway}"


# class BankConfig(models.Model):
#     id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
#     gateway = models.OneToOneField(PaymentGateway, on_delete=models.CASCADE, related_name="bankconfig")
#     bank_name = models.CharField(max_length=100)
#     account_name = models.CharField(max_length=100)
#     account_number = models.CharField(max_length=50)
#     branch_code = models.CharField(max_length=20, blank=True, null=True)
#     swift_code = models.CharField(max_length=20, blank=True, null=True)
#     iban = models.CharField(max_length=50, blank=True, null=True)
#     bank_code = models.CharField(max_length=20, blank=True, null=True)

#     class Meta:
#         verbose_name = "Bank Configuration"
#         verbose_name_plural = "Bank Configurations"

#     def __str__(self):
#         return f"{self.bank_name} - {self.account_name}"


# class ClientPaymentMethod(models.Model):
#     id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
#     client = models.ForeignKey("account.Client", on_delete=models.CASCADE, related_name="payment_methods")
#     gateway = models.ForeignKey(PaymentGateway, on_delete=models.CASCADE, related_name="client_methods")
#     is_default = models.BooleanField(default=False)
#     created_at = models.DateTimeField(auto_now_add=True)

#     class Meta:
#         verbose_name = "Client Payment Method"
#         verbose_name_plural = "Client Payment Methods"
#         unique_together = ("client", "gateway")
#         ordering = ["-is_default", "-created_at"]

#     def clean(self):
#         if not self.gateway.is_active:
#             raise ValidationError("Cannot assign inactive payment method to client")

#     def save(self, *args, **kwargs):
#         if self.is_default:
#             ClientPaymentMethod.objects.filter(client=self.client).exclude(pk=self.pk).update(is_default=False)
#         super().save(*args, **kwargs)

#     def __str__(self):
#         return f"{self.client} - {self.gateway.get_name_display() if hasattr(self.gateway, 'get_name_display') else self.gateway.name}"


# class Transaction(models.Model):
#     STATUS_CHOICES = (
#         ("pending", "Pending"),
#         ("completed", "Completed"),
#         ("failed", "Failed"),
#         ("refunded", "Refunded"),
#     )

#     id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
#     client = models.ForeignKey("account.Client", on_delete=models.CASCADE, related_name="transactions")
#     gateway = models.ForeignKey(PaymentGateway, on_delete=models.SET_NULL, null=True, related_name="transactions")
#     plan = models.ForeignKey(
#         "internet_plans.InternetPlan", on_delete=models.SET_NULL, null=True, blank=True, related_name="transactions"
#     )
#     amount = models.DecimalField(max_digits=12, decimal_places=2)
#     reference = models.CharField(max_length=100, unique=True, blank=True)
#     status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
#     metadata = models.JSONField(default=dict)
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)

#     class Meta:
#         verbose_name = "Transaction"
#         verbose_name_plural = "Transactions"
#         ordering = ["-created_at"]
#         indexes = [
#             models.Index(fields=["reference"]),
#             models.Index(fields=["status"]),
#             models.Index(fields=["created_at"]),
#             models.Index(fields=["client", "gateway"]),
#         ]

#     def __str__(self):
#         return f"{self.reference} - {self.get_status_display()} ({self.amount})"

#     def save(self, *args, **kwargs):
#         if not self.reference:
#             self.reference = self._generate_reference()
#         super().save(*args, **kwargs)

#     def _generate_reference(self):
#         timestamp = timezone.now().strftime("%Y%m%d%H%M%S")
#         random_part = get_random_string(8, "ABCDEFGHJKLMNPQRSTUVWXYZ23456789")
#         return f"TX-{timestamp}-{random_part}"


# class ConfigurationHistory(models.Model):
#     ACTIONS = (
#         ("create", "Create"),
#         ("update", "Update"),
#         ("delete", "Delete"),
#         ("activate", "Activate"),
#         ("deactivate", "Deactivate"),
#         ("test", "Test Connection"),
#     )

#     id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
#     action = models.CharField(max_length=20, choices=ACTIONS)
#     model = models.CharField(max_length=50)
#     object_id = models.CharField(max_length=36)
#     changes = models.JSONField(default=list)
#     old_values = models.JSONField(default=dict)
#     new_values = models.JSONField(default=dict)
#     user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="payment_config_changes")
#     timestamp = models.DateTimeField(auto_now_add=True)

#     class Meta:
#         verbose_name = "Configuration History"
#         verbose_name_plural = "Configuration Histories"
#         ordering = ["-timestamp"]
#         indexes = [
#             models.Index(fields=["model", "object_id"]),
#             models.Index(fields=["timestamp"]),
#         ]

#     def __str__(self):
#         return f"{self.get_action_display()} on {self.model} {self.object_id} by {self.user}"

#     @classmethod
#     def track_changes(cls, instance, user, action, changed_fields):
#         old_values = {}
#         new_values = {}

#         for field in changed_fields:
#             old_values[field] = getattr(instance, f"_original_{field}", None)
#             new_values[field] = getattr(instance, field)

#         return cls.objects.create(
#             action=action,
#             model=instance.__class__.__name__,
#             object_id=str(instance.id),
#             changes=list(changed_fields),
#             old_values=old_values,
#             new_values=new_values,
#             user=user,
#         )


# class WebhookLog(models.Model):
#     id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
#     gateway = models.ForeignKey(PaymentGateway, on_delete=models.CASCADE, related_name="webhook_logs")
#     event_type = models.CharField(max_length=100)
#     payload = models.JSONField()
#     headers = models.JSONField()
#     ip_address = models.GenericIPAddressField()
#     status_code = models.PositiveSmallIntegerField()
#     response = models.TextField()
#     timestamp = models.DateTimeField(auto_now_add=True)

#     class Meta:
#         verbose_name = "Webhook Log"
#         verbose_name_plural = "Webhook Logs"
#         ordering = ["-timestamp"]

#     def __str__(self):
#         return f"{self.gateway} webhook - {self.event_type} ({self.timestamp})"
















# import logging
# import uuid
# from django.db import models
# from django.core.exceptions import ValidationError
# from django.utils import timezone
# from django.contrib.auth import get_user_model
# from django.utils.crypto import get_random_string
# from django.core.validators import MinValueValidator
# from phonenumber_field.modelfields import PhoneNumberField

# from utils.fernet_helper import get_fernet

# logger = logging.getLogger(__name__)
# User = get_user_model()


# class FernetEncryptedMixin:
#     _encrypted_fields = []

#     def _encrypt(self, value: str) -> str:
#         if value is None or value == "":
#             return value
#         f = get_fernet()
#         return f.encrypt(value.encode()).decode()

#     def _decrypt(self, value: str) -> str:
#         if value is None or value == "":
#             return value
#         f = get_fernet()
#         return f.decrypt(value.encode()).decode()

#     def _is_encrypted(self, value: str) -> bool:
#         if value is None or value == "":
#             return False
#         try:
#             f = get_fernet()
#             f.decrypt(value.encode())
#             return True
#         except Exception:
#             return False

#     def save(self, *args, **kwargs):
#         for field in getattr(self, "_encrypted_fields", []):
#             raw_value = getattr(self, field, None)
#             if raw_value and not self._is_encrypted(raw_value):
#                 setattr(self, field, self._encrypt(raw_value))
#         super().save(*args, **kwargs)

#     def __getattribute__(self, name):
#         if name.startswith("_") or name in ("save",):
#             return super().__getattribute__(name)
#         try:
#             encrypted_fields = super().__getattribute__("_encrypted_fields")
#         except Exception:
#             encrypted_fields = []
#         if name in encrypted_fields:
#             val = super().__getattribute__(name)
#             if not val:
#                 return val
#             try:
#                 return self._decrypt(val)
#             except Exception:
#                 return val
#         return super().__getattribute__(name)


# class PaymentGateway(models.Model):
#     SECURITY_LEVELS = (
#         ("low", "Low"),
#         ("medium", "Medium"),
#         ("high", "High"),
#         ("critical", "Critical"),
#     )

#     PAYMENT_TYPES = (
#         ("mpesa_paybill", "M-Pesa Paybill"),
#         ("mpesa_till", "M-Pesa Till"),
#         ("bank_transfer", "Bank Transfer"),
#         ("paypal", "PayPal"),
#     )

#     id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
#     name = models.CharField(max_length=50, choices=PAYMENT_TYPES, default="paypal")
#     is_active = models.BooleanField(default=True)
#     sandbox_mode = models.BooleanField(default=True)
#     security_level = models.CharField(max_length=10, choices=SECURITY_LEVELS, default="medium")
#     transaction_limit = models.DecimalField(
#         max_digits=12,
#         decimal_places=2,
#         null=True,
#         blank=True,
#         validators=[MinValueValidator(0)],
#     )
#     auto_settle = models.BooleanField(default=True)
#     webhook_secret = models.CharField(max_length=64, blank=True)
#     created_by = models.ForeignKey(
#         User, on_delete=models.SET_NULL, null=True, related_name="created_payment_gateways"
#     )
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)

#     class Meta:
#         verbose_name = "Payment Gateway"
#         verbose_name_plural = "Payment Gateways"
#         ordering = ["name"]
#         indexes = [
#             models.Index(fields=["name", "is_active"]),
#             models.Index(fields=["security_level"]),
#             models.Index(fields=["created_at"]),
#         ]

#     def __str__(self):
#         try:
#             return f"{self.get_name_display()} ({'Active' if self.is_active else 'Inactive'})"
#         except Exception:
#             return f"{self.name} ({'Active' if self.is_active else 'Inactive'})"

#     def clean(self):
#         if self.name in ["mpesa_paybill", "mpesa_till"] and not hasattr(self, "mpesaconfig"):
#             raise ValidationError("M-Pesa configuration is required for M-Pesa gateways")
#         elif self.name == "paypal" and not hasattr(self, "paypalconfig"):
#             raise ValidationError("PayPal configuration is required for PayPal gateways")
#         elif self.name == "bank_transfer" and not hasattr(self, "bankconfig"):
#             raise ValidationError("Bank configuration is required for Bank Transfer gateways")

#     def save(self, *args, **kwargs):
#         if not self.webhook_secret:
#             self.webhook_secret = get_random_string(64)
#         super().save(*args, **kwargs)

#     def generate_webhook_secret(self):
#         if not self.webhook_secret:
#             self.webhook_secret = get_random_string(64)
#             self.save()
#         return self.webhook_secret


# class MpesaConfig(FernetEncryptedMixin, models.Model):
#     _encrypted_fields = ["consumer_key", "consumer_secret", "passkey", "security_credential"]

#     id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
#     gateway = models.OneToOneField(PaymentGateway, on_delete=models.CASCADE, related_name="mpesaconfig")
#     consumer_key = models.TextField()
#     consumer_secret = models.TextField()
#     passkey = models.TextField()
#     paybill_number = models.CharField(max_length=20, blank=True, null=True)
#     till_number = models.CharField(max_length=20, blank=True, null=True)
#     callback_url = models.URLField(max_length=500)
#     initiator_name = models.CharField(max_length=100, blank=True, null=True)
#     security_credential = models.TextField(blank=True, null=True)

#     class Meta:
#         verbose_name = "M-Pesa Configuration"
#         verbose_name_plural = "M-Pesa Configurations"

#     def clean(self):
#         if not self.paybill_number and not self.till_number:
#             raise ValidationError("Either paybill number or till number must be set")
#         if self.paybill_number and self.till_number:
#             raise ValidationError("Cannot have both paybill and till number - choose one")

#     @property
#     def short_code(self):
#         return self.paybill_number or self.till_number

#     def __str__(self):
#         return f"M-Pesa config for {self.gateway}"


# class PayPalConfig(FernetEncryptedMixin, models.Model):
#     _encrypted_fields = ["client_id", "secret", "merchant_id"]

#     id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
#     gateway = models.OneToOneField(PaymentGateway, on_delete=models.CASCADE, related_name="paypalconfig")
#     client_id = models.TextField()
#     secret = models.TextField()
#     merchant_id = models.TextField(blank=True, null=True)
#     callback_url = models.URLField(max_length=500)
#     webhook_id = models.CharField(max_length=100, blank=True, null=True)
#     bn_code = models.CharField(max_length=50, blank=True, null=True)

#     class Meta:
#         verbose_name = "PayPal Configuration"
#         verbose_name_plural = "PayPal Configurations"

#     def __str__(self):
#         return f"PayPal config for {self.gateway}"


# class BankConfig(models.Model):
#     id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
#     gateway = models.OneToOneField(PaymentGateway, on_delete=models.CASCADE, related_name="bankconfig")
#     bank_name = models.CharField(max_length=100)
#     account_name = models.CharField(max_length=100)
#     account_number = models.CharField(max_length=50)
#     branch_code = models.CharField(max_length=20, blank=True, null=True)
#     swift_code = models.CharField(max_length=20, blank=True, null=True)
#     iban = models.CharField(max_length=50, blank=True, null=True)
#     bank_code = models.CharField(max_length=20, blank=True, null=True)

#     class Meta:
#         verbose_name = "Bank Configuration"
#         verbose_name_plural = "Bank Configurations"

#     def __str__(self):
#         return f"{self.bank_name} - {self.account_name}"


# class ClientPaymentMethod(models.Model):
#     id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
#     client = models.ForeignKey("account.Client", on_delete=models.CASCADE, related_name="payment_methods")
#     gateway = models.ForeignKey(PaymentGateway, on_delete=models.CASCADE, related_name="client_methods")
#     is_default = models.BooleanField(default=False)
#     created_at = models.DateTimeField(auto_now_add=True)

#     class Meta:
#         verbose_name = "Client Payment Method"
#         verbose_name_plural = "Client Payment Methods"
#         unique_together = ("client", "gateway")
#         ordering = ["-is_default", "-created_at"]

#     def clean(self):
#         if not self.gateway.is_active:
#             raise ValidationError("Cannot assign inactive payment method to client")

#     def save(self, *args, **kwargs):
#         if self.is_default:
#             ClientPaymentMethod.objects.filter(client=self.client).exclude(pk=self.pk).update(is_default=False)
#         super().save(*args, **kwargs)

#     def __str__(self):
#         return f"{self.client} - {self.gateway.get_name_display() if hasattr(self.gateway, 'get_name_display') else self.gateway.name}"


# class Transaction(models.Model):
#     STATUS_CHOICES = (
#         ("pending", "Pending"),
#         ("completed", "Completed"),
#         ("failed", "Failed"),
#         ("refunded", "Refunded"),
#     )

#     id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
#     client = models.ForeignKey("account.Client", on_delete=models.CASCADE, related_name="transactions")
#     gateway = models.ForeignKey(PaymentGateway, on_delete=models.SET_NULL, null=True, related_name="transactions")
#     plan = models.ForeignKey(
#         "internet_plans.InternetPlan", on_delete=models.SET_NULL, null=True, blank=True, related_name="transactions"
#     )
#     amount = models.DecimalField(max_digits=12, decimal_places=2)
#     reference = models.CharField(max_length=100, unique=True, blank=True)
#     status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
#     metadata = models.JSONField(default=dict)
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)

#     class Meta:
#         verbose_name = "Transaction"
#         verbose_name_plural = "Transactions"
#         ordering = ["-created_at"]
#         indexes = [
#             models.Index(fields=["reference"]),
#             models.Index(fields=["status"]),
#             models.Index(fields=["created_at"]),
#             models.Index(fields=["client", "gateway"]),
#         ]

#     def __str__(self):
#         return f"{self.reference} - {self.get_status_display()} ({self.amount})"

#     def save(self, *args, **kwargs):
#         if not self.reference:
#             self.reference = self._generate_reference()
#         super().save(*args, **kwargs)

#     def _generate_reference(self):
#         timestamp = timezone.now().strftime("%Y%m%d%H%M%S")
#         random_part = get_random_string(8, "ABCDEFGHJKLMNPQRSTUVWXYZ23456789")
#         return f"TX-{timestamp}-{random_part}"


# class ConfigurationHistory(models.Model):
#     ACTIONS = (
#         ("create", "Create"),
#         ("update", "Update"),
#         ("delete", "Delete"),
#         ("activate", "Activate"),
#         ("deactivate", "Deactivate"),
#         ("test", "Test Connection"),
#     )

#     id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
#     action = models.CharField(max_length=20, choices=ACTIONS)
#     model = models.CharField(max_length=50)
#     object_id = models.CharField(max_length=36)
#     changes = models.JSONField(default=list)
#     old_values = models.JSONField(default=dict)
#     new_values = models.JSONField(default=dict)
#     user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="payment_config_changes")
#     timestamp = models.DateTimeField(auto_now_add=True)

#     class Meta:
#         verbose_name = "Configuration History"
#         verbose_name_plural = "Configuration Histories"
#         ordering = ["-timestamp"]
#         indexes = [
#             models.Index(fields=["model", "object_id"]),
#             models.Index(fields=["timestamp"]),
#         ]

#     def __str__(self):
#         return f"{self.get_action_display()} on {self.model} {self.object_id} by {self.user}"

#     @classmethod
#     def track_changes(cls, instance, user, action, changed_fields):
#         old_values = {}
#         new_values = {}

#         for field in changed_fields:
#             old_values[field] = getattr(instance, f"_original_{field}", None)
#             new_values[field] = getattr(instance, field)

#         return cls.objects.create(
#             action=action,
#             model=instance.__class__.__name__,
#             object_id=str(instance.id),
#             changes=list(changed_fields),
#             old_values=old_values,
#             new_values=new_values,
#             user=user,
#         )


# class WebhookLog(models.Model):
#     id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
#     gateway = models.ForeignKey(PaymentGateway, on_delete=models.CASCADE, related_name="webhook_logs")
#     event_type = models.CharField(max_length=100)
#     payload = models.JSONField()
#     headers = models.JSONField()
#     ip_address = models.GenericIPAddressField()
#     status_code = models.PositiveSmallIntegerField()
#     response = models.TextField()
#     timestamp = models.DateTimeField(auto_now_add=True)

#     class Meta:
#         verbose_name = "Webhook Log"
#         verbose_name_plural = "Webhook Logs"
#         ordering = ["-timestamp"]

#     def __str__(self):
#         return f"{self.gateway} webhook - {self.event_type} ({self.timestamp})"








import logging
import uuid
from django.db import models
from django.core.exceptions import ValidationError
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.utils.crypto import get_random_string
from django.core.validators import MinValueValidator
from phonenumber_field.modelfields import PhoneNumberField

from utils.fernet_helper import get_fernet

logger = logging.getLogger(__name__)
User = get_user_model()


class FernetEncryptedMixin:
    _encrypted_fields = []

    def _encrypt(self, value: str) -> str:
        if value is None or value == "":
            return value
        f = get_fernet()
        return f.encrypt(value.encode()).decode()

    def _decrypt(self, value: str) -> str:
        if value is None or value == "":
            return value
        f = get_fernet()
        return f.decrypt(value.encode()).decode()

    def _is_encrypted(self, value: str) -> bool:
        if value is None or value == "":
            return False
        try:
            f = get_fernet()
            f.decrypt(value.encode())
            return True
        except Exception:
            return False

    def save(self, *args, **kwargs):
        for field in getattr(self, "_encrypted_fields", []):
            raw_value = getattr(self, field, None)
            if raw_value and not self._is_encrypted(raw_value):
                setattr(self, field, self._encrypt(raw_value))
        super().save(*args, **kwargs)

    def __getattribute__(self, name):
        if name.startswith("_") or name in ("save",):
            return super().__getattribute__(name)
        try:
            encrypted_fields = super().__getattribute__("_encrypted_fields")
        except Exception:
            encrypted_fields = []
        if name in encrypted_fields:
            val = super().__getattribute__(name)
            if not val:
                return val
            try:
                return self._decrypt(val)
            except Exception:
                return val
        return super().__getattribute__(name)


class PaymentGateway(models.Model):
    SECURITY_LEVELS = (
        ("low", "Low"),
        ("medium", "Medium"),
        ("high", "High"),
        ("critical", "Critical"),
    )

    PAYMENT_TYPES = (
        ("mpesa_paybill", "M-Pesa Paybill"),
        ("mpesa_till", "M-Pesa Till"),
        ("bank_transfer", "Bank Transfer"),
        ("paypal", "PayPal"),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=50, choices=PAYMENT_TYPES, default="paypal")
    is_active = models.BooleanField(default=True)
    sandbox_mode = models.BooleanField(default=True)
    security_level = models.CharField(max_length=10, choices=SECURITY_LEVELS, default="medium")
    transaction_limit = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0)],
    )
    auto_settle = models.BooleanField(default=True)
    webhook_secret = models.CharField(max_length=64, blank=True)
    created_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name="created_payment_gateways"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Payment Gateway"
        verbose_name_plural = "Payment Gateways"
        ordering = ["name"]
        indexes = [
            models.Index(fields=["name", "is_active"]),
            models.Index(fields=["security_level"]),
            models.Index(fields=["created_at"]),
        ]

    def __str__(self):
        try:
            return f"{self.get_name_display()} ({'Active' if self.is_active else 'Inactive'})"
        except Exception:
            return f"{self.name} ({'Active' if self.is_active else 'Inactive'})"

    def clean(self):
        if self.name in ["mpesa_paybill", "mpesa_till"] and not hasattr(self, "mpesaconfig"):
            raise ValidationError("M-Pesa configuration is required for M-Pesa gateways")
        elif self.name == "paypal" and not hasattr(self, "paypalconfig"):
            raise ValidationError("PayPal configuration is required for PayPal gateways")
        elif self.name == "bank_transfer" and not hasattr(self, "bankconfig"):
            raise ValidationError("Bank configuration is required for Bank Transfer gateways")

    def save(self, *args, **kwargs):
        if not self.webhook_secret:
            self.webhook_secret = get_random_string(64)
        super().save(*args, **kwargs)

    def generate_webhook_secret(self):
        if not self.webhook_secret:
            self.webhook_secret = get_random_string(64)
            self.save()
        return self.webhook_secret


class MpesaConfig(FernetEncryptedMixin, models.Model):
    _encrypted_fields = ["consumer_key", "consumer_secret", "passkey", "security_credential"]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    gateway = models.OneToOneField(PaymentGateway, on_delete=models.CASCADE, related_name="mpesaconfig")
    consumer_key = models.TextField()
    consumer_secret = models.TextField()
    passkey = models.TextField()
    paybill_number = models.CharField(max_length=20, blank=True, null=True)
    till_number = models.CharField(max_length=20, blank=True, null=True)
    callback_url = models.URLField(max_length=500)
    initiator_name = models.CharField(max_length=100, blank=True, null=True)
    security_credential = models.TextField(blank=True, null=True)

    class Meta:
        verbose_name = "M-Pesa Configuration"
        verbose_name_plural = "M-Pesa Configurations"

    def clean(self):
        if not self.paybill_number and not self.till_number:
            raise ValidationError("Either paybill number or till number must be set")
        if self.paybill_number and self.till_number:
            raise ValidationError("Cannot have both paybill and till number - choose one")

    @property
    def short_code(self):
        return self.paybill_number or self.till_number

    def __str__(self):
        return f"M-Pesa config for {self.gateway}"


class PayPalConfig(FernetEncryptedMixin, models.Model):
    _encrypted_fields = ["client_id", "secret", "merchant_id"]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    gateway = models.OneToOneField(PaymentGateway, on_delete=models.CASCADE, related_name="paypalconfig")
    client_id = models.TextField()
    secret = models.TextField()
    merchant_id = models.TextField(blank=True, null=True)
    callback_url = models.URLField(max_length=500)
    webhook_id = models.CharField(max_length=100, blank=True, null=True)
    bn_code = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        verbose_name = "PayPal Configuration"
        verbose_name_plural = "PayPal Configurations"

    def __str__(self):
        return f"PayPal config for {self.gateway}"


class BankConfig(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    gateway = models.OneToOneField(PaymentGateway, on_delete=models.CASCADE, related_name="bankconfig")
    bank_name = models.CharField(max_length=100)
    account_name = models.CharField(max_length=100)
    account_number = models.CharField(max_length=50)
    branch_code = models.CharField(max_length=20, blank=True, null=True)
    swift_code = models.CharField(max_length=20, blank=True, null=True)
    iban = models.CharField(max_length=50, blank=True, null=True)
    bank_code = models.CharField(max_length=20, blank=True, null=True)

    class Meta:
        verbose_name = "Bank Configuration"
        verbose_name_plural = "Bank Configurations"

    def __str__(self):
        return f"{self.bank_name} - {self.account_name}"


class ClientPaymentMethod(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    client = models.ForeignKey("account.Client", on_delete=models.CASCADE, related_name="payment_methods")
    gateway = models.ForeignKey(PaymentGateway, on_delete=models.CASCADE, related_name="client_methods")
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Client Payment Method"
        verbose_name_plural = "Client Payment Methods"
        unique_together = ("client", "gateway")
        ordering = ["-is_default", "-created_at"]

    def clean(self):
        if not self.gateway.is_active:
            raise ValidationError("Cannot assign inactive payment method to client")

    def save(self, *args, **kwargs):
        if self.is_default:
            ClientPaymentMethod.objects.filter(client=self.client).exclude(pk=self.pk).update(is_default=False)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.client.user.username} - {self.gateway.get_name_display() if hasattr(self.gateway, 'get_name_display') else self.gateway.name}"  # Changed to use username


class Transaction(models.Model):
    STATUS_CHOICES = (
        ("pending", "Pending"),
        ("completed", "Completed"),
        ("failed", "Failed"),
        ("refunded", "Refunded"),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    client = models.ForeignKey("account.Client", on_delete=models.CASCADE, related_name="transactions")
    gateway = models.ForeignKey(PaymentGateway, on_delete=models.SET_NULL, null=True, related_name="transactions")
    plan = models.ForeignKey(
        "internet_plans.InternetPlan", on_delete=models.SET_NULL, null=True, blank=True, related_name="transactions"
    )
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    reference = models.CharField(max_length=100, unique=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    metadata = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Transaction"
        verbose_name_plural = "Transactions"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["reference"]),
            models.Index(fields=["status"]),
            models.Index(fields=["created_at"]),
            models.Index(fields=["client", "gateway"]),
        ]

    def __str__(self):
        return f"{self.reference} - {self.get_status_display()} ({self.amount})"

    def save(self, *args, **kwargs):
        if not self.reference:
            self.reference = self._generate_reference()
        super().save(*args, **kwargs)

    def _generate_reference(self):
        timestamp = timezone.now().strftime("%Y%m%d%H%M%S")
        random_part = get_random_string(8, "ABCDEFGHJKLMNPQRSTUVWXYZ23456789")
        return f"TX-{timestamp}-{random_part}"


class ConfigurationHistory(models.Model):
    ACTIONS = (
        ("create", "Create"),
        ("update", "Update"),
        ("delete", "Delete"),
        ("activate", "Activate"),
        ("deactivate", "Deactivate"),
        ("test", "Test Connection"),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    action = models.CharField(max_length=20, choices=ACTIONS)
    model = models.CharField(max_length=50)
    object_id = models.CharField(max_length=36)
    changes = models.JSONField(default=list)
    old_values = models.JSONField(default=dict)
    new_values = models.JSONField(default=dict)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="payment_config_changes")
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Configuration History"
        verbose_name_plural = "Configuration Histories"
        ordering = ["-timestamp"]
        indexes = [
            models.Index(fields=["model", "object_id"]),
            models.Index(fields=["timestamp"]),
        ]

    def __str__(self):
        return f"{self.get_action_display()} on {self.model} {self.object_id} by {self.user}"

    @classmethod
    def track_changes(cls, instance, user, action, changed_fields):
        old_values = {}
        new_values = {}

        for field in changed_fields:
            old_values[field] = getattr(instance, f"_original_{field}", None)
            new_values[field] = getattr(instance, field)

        return cls.objects.create(
            action=action,
            model=instance.__class__.__name__,
            object_id=str(instance.id),
            changes=list(changed_fields),
            old_values=old_values,
            new_values=new_values,
            user=user,
        )


class WebhookLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    gateway = models.ForeignKey(PaymentGateway, on_delete=models.CASCADE, related_name="webhook_logs")
    event_type = models.CharField(max_length=100)
    payload = models.JSONField()
    headers = models.JSONField()
    ip_address = models.GenericIPAddressField()
    status_code = models.PositiveSmallIntegerField()
    response = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Webhook Log"
        verbose_name_plural = "Webhook Logs"
        ordering = ["-timestamp"]

    def __str__(self):
        return f"{self.gateway} webhook - {self.event_type} ({self.timestamp})"