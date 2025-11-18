








# import uuid
# import os
# import logging
# from django.db import models
# from django.core.exceptions import ValidationError, ImproperlyConfigured
# from django.utils import timezone
# from django.contrib.auth import get_user_model
# from django.utils.crypto import get_random_string
# from django.core.validators import MinValueValidator, URLValidator
# from phonenumber_field.modelfields import PhoneNumberField
# from django.conf import settings
# from cryptography.fernet import Fernet, InvalidToken
# from payments.fields.encrypted_text_field import EncryptedTextField

# logger = logging.getLogger(__name__)
# User = get_user_model()



# # Ensure MPESA_ENCRYPTION_KEY is set
# _key = getattr(settings, 'MPESA_ENCRYPTION_KEY', None)
# if not _key:
#     raise ImproperlyConfigured("MPESA_ENCRYPTION_KEY is not configured in settings.py")
# if isinstance(_key, str):
#     _key = _key.encode()
# fernet = Fernet(_key)


# class FernetEncryptedMixin:
#     _encrypted_fields = []

#     def _encrypt(self, value: str) -> str:
#         if value is None or value == "":
#             return value
#         return fernet.encrypt(value.encode()).decode()

#     def _decrypt(self, value: str) -> str:
#         if value is None or value == "":
#             return value
#         try:
#             return fernet.decrypt(value.encode()).decode()
#         except InvalidToken:
#             return value

#     def _is_encrypted(self, value: str) -> bool:
#         if value is None or value == "":
#             return False
#         try:
#             fernet.decrypt(value.encode())
#             return True
#         except InvalidToken:
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
#     webhook_secret = EncryptedTextField(blank=True)
#     created_by = models.ForeignKey(
#         User, on_delete=models.SET_NULL, null=True, related_name="created_payment_gateways"
#     )
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)
#     last_health_check = models.DateTimeField(null=True, blank=True)
#     health_status = models.CharField(max_length=20, default="unknown", choices=(
#         ("healthy", "Healthy"),
#         ("degraded", "Degraded"),
#         ("unhealthy", "Unhealthy"),
#         ("unknown", "Unknown"),
#     ))

#     class Meta:
#         verbose_name = "Payment Gateway"
#         verbose_name_plural = "Payment Gateways"
#         ordering = ["name"]
#         indexes = [
#             models.Index(fields=["name", "is_active"]),
#             models.Index(fields=["security_level"]),
#             models.Index(fields=["created_at"]),
#             models.Index(fields=["health_status"]),
#         ]

#     def __str__(self):
#         return f"{self.get_name_display()} ({'Active' if self.is_active else 'Inactive'})"

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

#     def update_health_status(self, status):
#         self.health_status = status
#         self.last_health_check = timezone.now()
#         self.save(update_fields=['health_status', 'last_health_check'])


# class MpesaConfig(models.Model):
#     id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
#     gateway = models.OneToOneField(PaymentGateway, on_delete=models.CASCADE, related_name="mpesaconfig")
#     consumer_key = EncryptedTextField()
#     consumer_secret = EncryptedTextField()
#     passkey = EncryptedTextField()
#     paybill_number = models.CharField(max_length=20, blank=True, null=True)
#     till_number = models.CharField(max_length=20, blank=True, null=True)
#     callback_url = models.URLField(max_length=500)
#     initiator_name = models.CharField(max_length=100, blank=True, null=True)
#     security_credential = EncryptedTextField(blank=True, null=True)

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


# class PayPalConfig(models.Model):
#     id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
#     gateway = models.OneToOneField(PaymentGateway, on_delete=models.CASCADE, related_name="paypalconfig")
#     client_id = EncryptedTextField()
#     secret = EncryptedTextField()
#     merchant_id = EncryptedTextField(blank=True, null=True)
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
#         return f"{self.client.user.username} - {self.gateway.get_name_display()}"


# class Transaction(models.Model):
#     STATUS_CHOICES = (
#         ("pending", "Pending"),
#         ("completed", "Completed"),
#         ("failed", "Failed"),
#         ("refunded", "Refunded"),
#         ("cancelled", "Cancelled"),
#         ("verifying", "Verifying"),
#     )

#     id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
#     client = models.ForeignKey("account.Client", on_delete=models.CASCADE, related_name="transactions")
#     gateway = models.ForeignKey(PaymentGateway, on_delete=models.SET_NULL, null=True, related_name="transactions")
#     plan = models.ForeignKey(
#         'internet_plans.InternetPlan', 
#         on_delete=models.SET_NULL,
#         null=True,  
#         related_name="transactions"
#     )
#     amount = models.DecimalField(max_digits=12, decimal_places=2)
#     reference = models.CharField(max_length=100, unique=True, blank=True)
#     status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
#     idempotency_key = models.CharField(max_length=100, unique=True, blank=True, null=True)
#     subscription = models.ForeignKey(
#         'internet_plans.Subscription',
#         on_delete=models.SET_NULL,
#         null=True,
#         blank=True,
#         related_name="transactions"
#     )
#     callback_attempts = models.PositiveIntegerField(default=0)
#     last_callback_attempt = models.DateTimeField(null=True, blank=True)
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
#             models.Index(fields=["idempotency_key"]),
#             models.Index(fields=["plan_id"]),
#             models.Index(fields=["subscription_id"]),
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

#     def mark_callback_attempt(self):
#         self.callback_attempts += 1
#         self.last_callback_attempt = timezone.now()
#         self.save(update_fields=['callback_attempts', 'last_callback_attempt'])


# class WebhookLog(models.Model):
#     id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
#     gateway = models.ForeignKey(PaymentGateway, on_delete=models.CASCADE, related_name="webhook_logs")
#     event_type = models.CharField(max_length=100)
#     payload = models.JSONField()
#     headers = models.JSONField()
#     ip_address = models.GenericIPAddressField()
#     status_code = models.PositiveSmallIntegerField()
#     response = models.TextField()
#     signature_valid = models.BooleanField(default=False)
#     timestamp = models.DateTimeField(auto_now_add=True)

#     class Meta:
#         verbose_name = "Webhook Log"
#         verbose_name_plural = "Webhook Logs"
#         ordering = ["-timestamp"]

#     def __str__(self):
#         return f"{self.gateway} webhook - {self.event_type} ({self.timestamp})"


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


# class PaymentAnalytics(models.Model):
#     """Daily analytics snapshot for payment data"""
#     date = models.DateField(unique=True)
#     total_revenue = models.DecimalField(max_digits=15, decimal_places=2, default=0)
#     successful_transactions = models.PositiveIntegerField(default=0)
#     failed_transactions = models.PositiveIntegerField(default=0)
#     pending_transactions = models.PositiveIntegerField(default=0)
#     success_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
#     total_transactions = models.PositiveIntegerField(default=0)
#     revenue_by_gateway = models.JSONField(default=dict)
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)

#     class Meta:
#         verbose_name = "Payment Analytics"
#         verbose_name_plural = "Payment Analytics"
#         ordering = ["-date"]
#         indexes = [
#             models.Index(fields=["date"]),
#         ]

#     def __str__(self):
#         return f"Analytics for {self.date}: {self.success_rate}% success rate"

#     def calculate_success_rate(self):
#         if self.total_transactions > 0:
#             return (self.successful_transactions / self.total_transactions) * 100
#         return 0


# class CallbackDeliveryLog(models.Model):
#     """Track callback deliveries to internetplans app"""
#     STATUS_CHOICES = (
#         ("pending", "Pending"),
#         ("delivered", "Delivered"),
#         ("failed", "Failed"),
#         ("retrying", "Retrying"),
#     )

#     id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
#     transaction = models.ForeignKey(Transaction, on_delete=models.CASCADE, related_name="callback_deliveries")
#     payload = models.JSONField()
#     status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
#     response_status = models.IntegerField(null=True, blank=True)
#     response_body = models.TextField(blank=True)
#     attempt_count = models.PositiveIntegerField(default=0)
#     error_message = models.TextField(blank=True)
#     delivered_at = models.DateTimeField(null=True, blank=True)
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)

#     class Meta:
#         verbose_name = "Callback Delivery Log"
#         verbose_name_plural = "Callback Delivery Logs"
#         ordering = ["-created_at"]
#         indexes = [
#             models.Index(fields=["transaction", "status"]),
#             models.Index(fields=["created_at"]),
#         ]

#     def __str__(self):
#         return f"Callback for {self.transaction.reference} - {self.status}"


# class Client(models.Model):
#     @classmethod
#     def format_phone_number(cls, phone):
#         """Format phone number to M-Pesa compatible format (+254...)"""
#         if not phone:
#             raise ValueError("Phone number is required")
        
#         phone = ''.join(phone.split())
#         if phone.startswith("+254") and len(phone) == 13 and phone[1:].isdigit():
#             return phone
#         elif phone.startswith("254") and len(phone) == 12 and phone.isdigit():
#             return f"+{phone}"
#         elif phone.startswith("07") and len(phone) == 10 and phone.isdigit():
#             return f"+254{phone[2:]}"
#         elif phone.startswith("0") and len(phone) == 10 and phone.isdigit():
#             return f"+254{phone[1:]}"
#         else:
#             raise ValueError("Invalid phone number format. Use 07XXXXXXXX, 2547XXXXXXXX, or +2547XXXXXXXX.")



import uuid
import os
import logging
from django.db import models
from django.core.exceptions import ValidationError, ImproperlyConfigured
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.utils.crypto import get_random_string
from django.core.validators import MinValueValidator, URLValidator
from phonenumber_field.modelfields import PhoneNumberField
from django.conf import settings
from cryptography.fernet import Fernet, InvalidToken
from payments.fields.encrypted_text_field import EncryptedTextField

logger = logging.getLogger(__name__)
User = get_user_model()

# Ensure MPESA_ENCRYPTION_KEY is set
_key = getattr(settings, 'MPESA_ENCRYPTION_KEY', None)
if not _key:
    raise ImproperlyConfigured("MPESA_ENCRYPTION_KEY is not configured in settings.py")
if isinstance(_key, str):
    _key = _key.encode()
fernet = Fernet(_key)


class FernetEncryptedMixin:
    _encrypted_fields = []

    def _encrypt(self, value: str) -> str:
        if value is None or value == "":
            return value
        return fernet.encrypt(value.encode()).decode()

    def _decrypt(self, value: str) -> str:
        if value is None or value == "":
            return value
        try:
            return fernet.decrypt(value.encode()).decode()
        except InvalidToken:
            return value

    def _is_encrypted(self, value: str) -> bool:
        if value is None or value == "":
            return False
        try:
            fernet.decrypt(value.encode())
            return True
        except InvalidToken:
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
    webhook_secret = EncryptedTextField(blank=True)
    created_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name="created_payment_gateways"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_health_check = models.DateTimeField(null=True, blank=True)
    health_status = models.CharField(max_length=20, default="unknown", choices=(
        ("healthy", "Healthy"),
        ("degraded", "Degraded"),
        ("unhealthy", "Unhealthy"),
        ("unknown", "Unknown"),
    ))

    class Meta:
        verbose_name = "Payment Gateway"
        verbose_name_plural = "Payment Gateways"
        ordering = ["name"]
        indexes = [
            models.Index(fields=["name", "is_active"]),
            models.Index(fields=["security_level"]),
            models.Index(fields=["created_at"]),
            models.Index(fields=["health_status"]),
        ]

    def __str__(self):
        return f"{self.get_name_display()} ({'Active' if self.is_active else 'Inactive'})"

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

    def update_health_status(self, status):
        self.health_status = status
        self.last_health_check = timezone.now()
        self.save(update_fields=['health_status', 'last_health_check'])


class MpesaConfig(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    gateway = models.OneToOneField(PaymentGateway, on_delete=models.CASCADE, related_name="mpesaconfig")
    consumer_key = EncryptedTextField()
    consumer_secret = EncryptedTextField()
    passkey = EncryptedTextField()
    paybill_number = models.CharField(max_length=20, blank=True, null=True)
    till_number = models.CharField(max_length=20, blank=True, null=True)
    callback_url = models.URLField(max_length=500)
    initiator_name = models.CharField(max_length=100, blank=True, null=True)
    security_credential = EncryptedTextField(blank=True, null=True)

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


class PayPalConfig(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    gateway = models.OneToOneField(PaymentGateway, on_delete=models.CASCADE, related_name="paypalconfig")
    client_id = EncryptedTextField()
    secret = EncryptedTextField()
    merchant_id = EncryptedTextField(blank=True, null=True)
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
    routing_number = models.CharField(max_length=50, blank=True, null=True)
    bank_address = models.TextField(blank=True, null=True)
    account_type = models.CharField(max_length=20, default="checking", choices=(
        ("checking", "Checking Account"),
        ("savings", "Savings Account"),
        ("business", "Business Account"),
        ("corporate", "Corporate Account"),
    ))
    currency = models.CharField(max_length=3, default="KES", choices=(
        ("KES", "Kenyan Shilling"),
        ("USD", "US Dollar"),
        ("EUR", "Euro"),
        ("GBP", "British Pound"),
    ))

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
        return f"{self.client.user.username} - {self.gateway.get_name_display()}"


class Transaction(models.Model):
    STATUS_CHOICES = (
        ("pending", "Pending"),
        ("completed", "Completed"),
        ("failed", "Failed"),
        ("refunded", "Refunded"),
        ("cancelled", "Cancelled"),
        ("verifying", "Verifying"),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    client = models.ForeignKey("account.Client", on_delete=models.CASCADE, related_name="transactions")
    gateway = models.ForeignKey(PaymentGateway, on_delete=models.SET_NULL, null=True, related_name="transactions")
    plan = models.ForeignKey(
        'internet_plans.InternetPlan', 
        on_delete=models.SET_NULL,
        null=True,  
        related_name="transactions"
    )
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    reference = models.CharField(max_length=100, unique=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    idempotency_key = models.CharField(max_length=100, unique=True, blank=True, null=True)
    subscription = models.ForeignKey(
        'internet_plans.Subscription',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="transactions"
    )
    callback_attempts = models.PositiveIntegerField(default=0)
    last_callback_attempt = models.DateTimeField(null=True, blank=True)
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
            models.Index(fields=["idempotency_key"]),
            models.Index(fields=["plan_id"]),
            models.Index(fields=["subscription_id"]),
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

    def mark_callback_attempt(self):
        self.callback_attempts += 1
        self.last_callback_attempt = timezone.now()
        self.save(update_fields=['callback_attempts', 'last_callback_attempt'])


class WebhookLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    gateway = models.ForeignKey(PaymentGateway, on_delete=models.CASCADE, related_name="webhook_logs")
    event_type = models.CharField(max_length=100)
    payload = models.JSONField()
    headers = models.JSONField()
    ip_address = models.GenericIPAddressField()
    status_code = models.PositiveSmallIntegerField()
    response = models.TextField()
    signature_valid = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Webhook Log"
        verbose_name_plural = "Webhook Logs"
        ordering = ["-timestamp"]

    def __str__(self):
        return f"{self.gateway} webhook - {self.event_type} ({self.timestamp})"


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


class PaymentAnalytics(models.Model):
    """Daily analytics snapshot for payment data"""
    date = models.DateField(unique=True)
    total_revenue = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    successful_transactions = models.PositiveIntegerField(default=0)
    failed_transactions = models.PositiveIntegerField(default=0)
    pending_transactions = models.PositiveIntegerField(default=0)
    success_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    total_transactions = models.PositiveIntegerField(default=0)
    revenue_by_gateway = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Payment Analytics"
        verbose_name_plural = "Payment Analytics"
        ordering = ["-date"]
        indexes = [
            models.Index(fields=["date"]),
        ]

    def __str__(self):
        return f"Analytics for {self.date}: {self.success_rate}% success rate"

    def calculate_success_rate(self):
        if self.total_transactions > 0:
            return (self.successful_transactions / self.total_transactions) * 100
        return 0


class CallbackDeliveryLog(models.Model):
    """Track callback deliveries to internetplans app"""
    STATUS_CHOICES = (
        ("pending", "Pending"),
        ("delivered", "Delivered"),
        ("failed", "Failed"),
        ("retrying", "Retrying"),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    transaction = models.ForeignKey(Transaction, on_delete=models.CASCADE, related_name="callback_deliveries")
    payload = models.JSONField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    response_status = models.IntegerField(null=True, blank=True)
    response_body = models.TextField(blank=True)
    attempt_count = models.PositiveIntegerField(default=0)
    error_message = models.TextField(blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Callback Delivery Log"
        verbose_name_plural = "Callback Delivery Logs"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["transaction", "status"]),
            models.Index(fields=["created_at"]),
        ]

    def __str__(self):
        return f"Callback for {self.transaction.reference} - {self.status}"


class Client(models.Model):
    @classmethod
    def format_phone_number(cls, phone):
        """Format phone number to M-Pesa compatible format (+254...)"""
        if not phone:
            raise ValueError("Phone number is required")
        
        phone = ''.join(phone.split())
        if phone.startswith("+254") and len(phone) == 13 and phone[1:].isdigit():
            return phone
        elif phone.startswith("254") and len(phone) == 12 and phone.isdigit():
            return f"+{phone}"
        elif phone.startswith("07") and len(phone) == 10 and phone.isdigit():
            return f"+254{phone[2:]}"
        elif phone.startswith("0") and len(phone) == 10 and phone.isdigit():
            return f"+254{phone[1:]}"
        else:
            raise ValueError("Invalid phone number format. Use 07XXXXXXXX, 2547XXXXXXXX, or +2547XXXXXXXX.")