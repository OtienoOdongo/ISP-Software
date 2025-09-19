# from django.db import models
# from django.core.validators import MinValueValidator
# from django.utils import timezone
# from django.contrib.auth import get_user_model
# import uuid

# User = get_user_model()

# class TransactionLog(models.Model):
#     STATUS_CHOICES = (
#         ('pending', 'Pending'),
#         ('success', 'Success'),
#         ('failed', 'Failed'),
#         ('refunded', 'Refunded'),
#     )
    
#     PAYMENT_METHODS = (
#         ('mpesa', 'M-Pesa'),
#         ('paypal', 'PayPal'),
#         ('bank_transfer', 'Bank Transfer'),
#     )
    
#     id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
#     transaction_id = models.CharField(max_length=20, unique=True, editable=False)
#     payment_transaction = models.ForeignKey(
#         'payments.Transaction', 
#         on_delete=models.CASCADE, 
#         related_name='logs',
#         null=True,
#         blank=True
#     )
#     client = models.ForeignKey(
#         'account.Client',
#         on_delete=models.CASCADE,
#         related_name='transaction_logs'
#     )
#     user = models.ForeignKey(
#         User,
#         on_delete=models.SET_NULL,
#         null=True,
#         blank=True,
#         related_name='transaction_logs'
#     )
#     amount = models.DecimalField(
#         max_digits=12,
#         decimal_places=2,
#         validators=[MinValueValidator(0)]
#     )
#     status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
#     payment_method = models.CharField(max_length=15, choices=PAYMENT_METHODS, default='mpesa')
#     phone_number = models.CharField(max_length=15, blank=True, null=True)
#     reference_number = models.CharField(max_length=100, blank=True, null=True)
#     description = models.TextField(blank=True, null=True)
#     metadata = models.JSONField(default=dict, blank=True)
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)
    
#     class Meta:
#         verbose_name = "Transaction Log"
#         verbose_name_plural = "Transaction Logs"
#         ordering = ['-created_at']
#         indexes = [
#             models.Index(fields=['transaction_id']),
#             models.Index(fields=['status']),
#             models.Index(fields=['created_at']),
#             models.Index(fields=['client', 'payment_method']),
#             models.Index(fields=['phone_number']),
#         ]
    
#     def __str__(self):
#         return f"{self.transaction_id} - {self.get_status_display()} ({self.amount})"
    
#     def save(self, *args, **kwargs):
#         if not self.transaction_id:
#             self.transaction_id = self._generate_transaction_id()
        
#         # Auto-populate user from client if not set
#         if not self.user and self.client:
#             self.user = self.client.user
            
#         super().save(*args, **kwargs)
    
#     def _generate_transaction_id(self):
#         timestamp = timezone.now().strftime("%y%m%d")
#         random_part = str(uuid.uuid4().int)[:6]
#         return f"TX{timestamp}{random_part}"
    
#     @property
#     def user_name(self):
#         """Get user's full name for frontend display"""
#         if self.user:
#             return f"{self.user.first_name} {self.user.last_name}".strip() or self.user.username
#         elif self.client and self.client.user:
#             return f"{self.client.user.first_name} {self.client.user.last_name}".strip() or self.client.user.username
#         return "Unknown User"
    
#     @property
#     def formatted_phone(self):
#         """Format phone number for display"""
#         if self.phone_number:
#             # Convert to Kenyan format: 254712345678
#             phone = self.phone_number.replace('+', '').replace(' ', '')
#             if phone.startswith('0') and len(phone) == 10:
#                 return f"254{phone[1:]}"
#             elif phone.startswith('254') and len(phone) == 12:
#                 return phone
#             elif phone.startswith('+254') and len(phone) == 13:
#                 return phone[1:]
#         return self.phone_number

# class TransactionLogHistory(models.Model):
#     ACTIONS = (
#         ('create', 'Create'),
#         ('update', 'Update'),
#         ('status_change', 'Status Change'),
#         ('refund', 'Refund'),
#     )
    
#     id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
#     transaction_log = models.ForeignKey(
#         TransactionLog,
#         on_delete=models.CASCADE,
#         related_name='history'
#     )
#     action = models.CharField(max_length=15, choices=ACTIONS)
#     old_status = models.CharField(max_length=10, choices=TransactionLog.STATUS_CHOICES, blank=True, null=True)
#     new_status = models.CharField(max_length=10, choices=TransactionLog.STATUS_CHOICES, blank=True, null=True)
#     changes = models.JSONField(default=dict)
#     performed_by = models.ForeignKey(
#         User,
#         on_delete=models.SET_NULL,
#         null=True,
#         blank=True
#     )
#     notes = models.TextField(blank=True, null=True)
#     timestamp = models.DateTimeField(auto_now_add=True)
    
#     class Meta:
#         verbose_name = "Transaction Log History"
#         verbose_name_plural = "Transaction Log Histories"
#         ordering = ['-timestamp']
    
#     def __str__(self):
#         return f"{self.get_action_display()} on {self.transaction_log.transaction_id}"





# from django.db import models
# from django.core.validators import MinValueValidator
# from django.utils import timezone
# from django.contrib.auth import get_user_model
# import uuid

# User = get_user_model()

# class TransactionLog(models.Model):
#     STATUS_CHOICES = (
#         ('pending', 'Pending'),
#         ('success', 'Success'),
#         ('failed', 'Failed'),
#         ('refunded', 'Refunded'),
#     )
    
#     PAYMENT_METHODS = (
#         ('mpesa', 'M-Pesa'),
#         ('paypal', 'PayPal'),
#         ('bank_transfer', 'Bank Transfer'),
#     )
    
#     id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
#     transaction_id = models.CharField(max_length=20, unique=True, editable=False)

#     payment_transaction = models.ForeignKey(
#         'payments.Transaction', 
#         on_delete=models.CASCADE, 
#         related_name='logs',
#         null=True,
#         blank=True
#     )

#     client = models.ForeignKey(
#         'account.Client',
#         on_delete=models.CASCADE,
#         related_name='transaction_logs'
#     )

#     # ✅ NEW FIELD: link each transaction to a subscription
#     subscription = models.ForeignKey(
#         'internet_plans.Subscription',
#         on_delete=models.SET_NULL,
#         null=True,
#         blank=True,
#         related_name='transactions'
#     )

#     user = models.ForeignKey(
#         User,
#         on_delete=models.SET_NULL,
#         null=True,
#         blank=True,
#         related_name='transaction_logs'
#     )

#     amount = models.DecimalField(
#         max_digits=12,
#         decimal_places=2,
#         validators=[MinValueValidator(0)]
#     )

#     status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
#     payment_method = models.CharField(max_length=15, choices=PAYMENT_METHODS, default='mpesa')
#     phone_number = models.CharField(max_length=15, blank=True, null=True)
#     reference_number = models.CharField(max_length=100, blank=True, null=True)
#     description = models.TextField(blank=True, null=True)
#     metadata = models.JSONField(default=dict, blank=True)
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)
    
#     class Meta:
#         verbose_name = "Transaction Log"
#         verbose_name_plural = "Transaction Logs"
#         ordering = ['-created_at']
#         indexes = [
#             models.Index(fields=['transaction_id']),
#             models.Index(fields=['status']),
#             models.Index(fields=['created_at']),
#             models.Index(fields=['client', 'payment_method']),
#             models.Index(fields=['phone_number']),
#             models.Index(fields=['subscription']),   # ✅ added index for subscription lookups
#         ]
    
#     def __str__(self):
#         return f"{self.transaction_id} - {self.get_status_display()} ({self.amount})"
    
#     def save(self, *args, **kwargs):
#         if not self.transaction_id:
#             self.transaction_id = self._generate_transaction_id()
        
#         # Auto-populate user from client if not set
#         if not self.user and self.client:
#             self.user = self.client.user
            
#         super().save(*args, **kwargs)
    
#     def _generate_transaction_id(self):
#         timestamp = timezone.now().strftime("%y%m%d")
#         random_part = str(uuid.uuid4().int)[:6]
#         return f"TX{timestamp}{random_part}"
    
#     @property
#     def user_name(self):
#         """Get user's full name for frontend display"""
#         if self.user:
#             return f"{self.user.first_name} {self.user.last_name}".strip() or self.user.username
#         elif self.client and self.client.user:
#             return f"{self.client.user.first_name} {self.client.user.last_name}".strip() or self.client.user.username
#         return "Unknown User"
    
#     @property
#     def formatted_phone(self):
#         """Format phone number for display"""
#         if self.phone_number:
#             phone = self.phone_number.replace('+', '').replace(' ', '')
#             if phone.startswith('0') and len(phone) == 10:
#                 return f"254{phone[1:]}"
#             elif phone.startswith('254') and len(phone) == 12:
#                 return phone
#             elif phone.startswith('+254') and len(phone) == 13:
#                 return phone[1:]
#         return self.phone_number

# class TransactionLogHistory(models.Model):
#     ACTIONS = (
#         ('create', 'Create'),
#         ('update', 'Update'),
#         ('status_change', 'Status Change'),
#         ('refund', 'Refund'),
#     )
    
#     id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
#     transaction_log = models.ForeignKey(
#         TransactionLog,
#         on_delete=models.CASCADE,
#         related_name='history'
#     )
#     action = models.CharField(max_length=15, choices=ACTIONS)
#     old_status = models.CharField(max_length=10, choices=TransactionLog.STATUS_CHOICES, blank=True, null=True)
#     new_status = models.CharField(max_length=10, choices=TransactionLog.STATUS_CHOICES, blank=True, null=True)
#     changes = models.JSONField(default=dict)
#     performed_by = models.ForeignKey(
#         User,
#         on_delete=models.SET_NULL,
#         null=True,
#         blank=True
#     )
#     notes = models.TextField(blank=True, null=True)
#     timestamp = models.DateTimeField(auto_now_add=True)
    
#     class Meta:
#         verbose_name = "Transaction Log History"
#         verbose_name_plural = "Transaction Log Histories"
#         ordering = ['-timestamp']
    
#     def __str__(self):
#         return f"{self.get_action_display()} on {self.transaction_log.transaction_id}"





from django.db import models
from django.core.validators import MinValueValidator
from django.utils import timezone
from django.contrib.auth import get_user_model
import uuid

User = get_user_model()

class TransactionLog(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('success', 'Success'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    )
    
    PAYMENT_METHODS = (
        ('mpesa', 'M-Pesa'),
        ('paypal', 'PayPal'),
        ('bank_transfer', 'Bank Transfer'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    transaction_id = models.CharField(max_length=20, unique=True, editable=False)

    payment_transaction = models.ForeignKey(
        'payments.Transaction', 
        on_delete=models.CASCADE, 
        related_name='logs',
        null=True,
        blank=True
    )

    client = models.ForeignKey(
        'account.Client',
        on_delete=models.CASCADE,
        related_name='transaction_logs'
    )

    # ✅ NEW FIELD: link each transaction to a subscription
    subscription = models.ForeignKey(
        'internet_plans.Subscription',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='transactions'
    )

    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='transaction_logs'
    )

    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )

    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    payment_method = models.CharField(max_length=15, choices=PAYMENT_METHODS, default='mpesa')
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    reference_number = models.CharField(max_length=100, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Transaction Log"
        verbose_name_plural = "Transaction Logs"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['transaction_id']),
            models.Index(fields=['status']),
            models.Index(fields=['created_at']),
            models.Index(fields=['client', 'payment_method']),
            models.Index(fields=['phone_number']),
            models.Index(fields=['subscription']),   # ✅ added index for subscription lookups
        ]
    
    def __str__(self):
        return f"{self.transaction_id} - {self.get_status_display()} ({self.amount})"
    
    def save(self, *args, **kwargs):
        if not self.transaction_id:
            self.transaction_id = self._generate_transaction_id()
        
        # Auto-populate user from client if not set
        if not self.user and self.client:
            self.user = self.client.user
            
        super().save(*args, **kwargs)
    
    def _generate_transaction_id(self):
        timestamp = timezone.now().strftime("%y%m%d")
        random_part = str(uuid.uuid4().int)[:6]
        return f"TX{timestamp}{random_part}"
    
    @property
    def user_name(self):
        """Get user's full name for frontend display"""
        if self.user:
            return f"{self.user.first_name} {self.user.last_name}".strip() or self.user.username
        elif self.client and self.client.user:
            return f"{self.client.user.first_name} {self.client.user.last_name}".strip() or self.client.user.username
        return "Unknown User"
    
    @property
    def formatted_phone(self):
        """Format phone number for display"""
        if self.phone_number:
            phone = self.phone_number.replace('+', '').replace(' ', '')
            if phone.startswith('0') and len(phone) == 10:
                return f"254{phone[1:]}"
            elif phone.startswith('254') and len(phone) == 12:
                return phone
            elif phone.startswith('+254') and len(phone) == 13:
                return phone[1:]
        return self.phone_number
    
    @property
    def subscription_plan_name(self):
        """Get subscription plan name with fallback"""
        if self.subscription and hasattr(self.subscription, 'internet_plan') and self.subscription.internet_plan:
            return self.subscription.internet_plan.name
        elif self.subscription:
            # Try to get plan name from other possible fields
            return getattr(self.subscription, 'plan_name', 'N/A')
        return 'N/A'

class TransactionLogHistory(models.Model):
    ACTIONS = (
        ('create', 'Create'),
        ('update', 'Update'),
        ('status_change', 'Status Change'),
        ('refund', 'Refund'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    transaction_log = models.ForeignKey(
        TransactionLog,
        on_delete=models.CASCADE,
        related_name='history'
    )
    action = models.CharField(max_length=15, choices=ACTIONS)
    old_status = models.CharField(max_length=10, choices=TransactionLog.STATUS_CHOICES, blank=True, null=True)
    new_status = models.CharField(max_length=10, choices=TransactionLog.STATUS_CHOICES, blank=True, null=True)
    changes = models.JSONField(default=dict)
    performed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    notes = models.TextField(blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Transaction Log History"
        verbose_name_plural = "Transaction Log Histories"
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"{self.get_action_display()} on {self.transaction_log.transaction_id}"