








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
#     subscription_id = models.CharField(max_length=100, blank=True, null=True)
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
#             models.Index(fields=['subscription_id']),
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
    
#     ACCESS_TYPES = (
#         ('hotspot', 'Hotspot'),
#         ('pppoe', 'PPPoE'),
#         ('both', 'Both'),
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
#     subscription = models.ForeignKey(
#         'internet_plans.Subscription',
#         on_delete=models.SET_NULL,
#         null=True,
#         blank=True,
#         related_name='transaction_logs'
#     )
#     internet_plan = models.ForeignKey(
#         'internet_plans.InternetPlan',
#         on_delete=models.SET_NULL,
#         null=True,
#         blank=True,
#         related_name='transaction_logs'
#     )
#     access_type = models.CharField(
#         max_length=10, 
#         choices=ACCESS_TYPES, 
#         default='hotspot',
#         help_text='Type of access method (Hotspot/PPPoE)'
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
#             models.Index(fields=['access_type']),
#             models.Index(fields=['internet_plan']),
#             models.Index(fields=['subscription']),
#         ]
    
#     def __str__(self):
#         return f"{self.transaction_id} - {self.get_access_type_display()} - {self.get_status_display()} ({self.amount})"
    
#     def save(self, *args, **kwargs):
#         if not self.transaction_id:
#             self.transaction_id = self._generate_transaction_id()
        
#         # Auto-populate user from client if not set
#         if not self.user and self.client:
#             self.user = self.client.user
            
#         # Auto-populate access_type from subscription if available
#         if not self.access_type and self.subscription:
#             self.access_type = self.subscription.access_method
            
#         # Auto-populate internet_plan from subscription if available
#         if not self.internet_plan and self.subscription:
#             self.internet_plan = self.subscription.internet_plan
            
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
    
#     @property
#     def plan_name(self):
#         """Get plan name for display"""
#         if self.internet_plan:
#             return self.internet_plan.name
#         elif self.subscription and self.subscription.internet_plan:
#             return self.subscription.internet_plan.name
#         return self.metadata.get('plan_name', 'N/A')
    
#     @property
#     def access_type_display(self):
#         """Get formatted access type for display"""
#         return self.get_access_type_display()


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
#     old_access_type = models.CharField(max_length=10, choices=TransactionLog.ACCESS_TYPES, blank=True, null=True)
#     new_access_type = models.CharField(max_length=10, choices=TransactionLog.ACCESS_TYPES, blank=True, null=True)
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
# from django.db.models.signals import post_save, pre_save
# from django.dispatch import receiver
# import uuid
# import logging

# logger = logging.getLogger(__name__)
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
    
#     ACCESS_TYPES = (
#         ('hotspot', 'Hotspot'),
#         ('pppoe', 'PPPoE'),
#         ('both', 'Both'),
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
#         'authentication.UserAccount',
#         on_delete=models.CASCADE,
#         related_name='client_transaction_logs'
#     )
#     subscription = models.ForeignKey(
#         'service_operations.Subscription',
#         on_delete=models.SET_NULL,
#         null=True,
#         blank=True,
#         related_name='transaction_logs'
#     )
#     internet_plan = models.ForeignKey(
#         'internet_plans.InternetPlan',
#         on_delete=models.SET_NULL,
#         null=True,
#         blank=True,
#         related_name='transaction_logs'
#     )
#     access_type = models.CharField(
#         max_length=10, 
#         choices=ACCESS_TYPES, 
#         default='hotspot',
#         help_text='Type of access method (Hotspot/PPPoE)'
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
#             models.Index(fields=['access_type']),
#             models.Index(fields=['internet_plan']),
#             models.Index(fields=['subscription']),
#         ]
    
#     def __str__(self):
#         return f"{self.transaction_id} - {self.get_access_type_display()} - {self.get_status_display()} ({self.amount})"
    
#     def save(self, *args, **kwargs):
#         if not self.transaction_id:
#             self.transaction_id = self._generate_transaction_id()
        
#         # Auto-populate user from client if not set
#         if not self.user and self.client:
#             self.user = self.client.user
            
#         # Auto-populate access_type from subscription if available
#         if not self.access_type and self.subscription:
#             self.access_type = self.subscription.access_method
            
#         # Auto-populate internet_plan from subscription if available
#         if not self.internet_plan and self.subscription:
#             self.internet_plan = self.subscription.internet_plan
            
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
    
#     @property
#     def plan_name(self):
#         """Get plan name for display"""
#         if self.internet_plan:
#             return self.internet_plan.name
#         elif self.subscription and self.subscription.internet_plan:
#             return self.subscription.internet_plan.name
#         return self.metadata.get('plan_name', 'N/A')
    
#     @property
#     def access_type_display(self):
#         """Get formatted access type for display"""
#         return self.get_access_type_display()


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
#     old_access_type = models.CharField(max_length=10, choices=TransactionLog.ACCESS_TYPES, blank=True, null=True)
#     new_access_type = models.CharField(max_length=10, choices=TransactionLog.ACCESS_TYPES, blank=True, null=True)
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


# # Enhanced Signal Handlers for automatic transaction log creation
# @receiver(post_save, sender='payments.Transaction')
# def create_transaction_log_on_payment_completion(sender, instance, created, **kwargs):
#     """
#     Automatically create transaction log when payment transaction is completed
#     Handles ALL payment methods: M-Pesa Paybill, M-Pesa Till, PayPal, Bank Transfer
#     """
#     from payments.models.transaction_log_model import TransactionLog
    
#     # Only process completed payments that don't have transaction logs
#     if instance.status == 'completed' and not instance.logs.exists():
#         try:
#             # Determine access type based on payment method
#             access_type = _determine_access_type(instance)
            
#             # Determine payment method display name
#             payment_method = _determine_payment_method(instance)
            
#             # Get phone number from client or metadata for M-Pesa transactions
#             phone_number = _extract_phone_number(instance)
            
#             # Create transaction log with all relevant data
#             transaction_log = TransactionLog.objects.create(
#                 payment_transaction=instance,
#                 client=instance.client,
#                 amount=instance.amount,
#                 status='success',
#                 payment_method=payment_method,
#                 access_type=access_type,
#                 user=instance.client.user,
#                 internet_plan=instance.plan,
#                 subscription=instance.subscription,
#                 phone_number=phone_number,
#                 reference_number=instance.reference,
#                 description=_generate_description(instance),
#                 metadata=_build_metadata(instance)
#             )
            
#             logger.info(f"Auto-created transaction log {transaction_log.transaction_id} for payment {instance.reference}")
            
#         except Exception as e:
#             logger.error(f"Failed to auto-create transaction log for {instance.reference}: {str(e)}", exc_info=True)


# def _determine_access_type(transaction_instance):
#     """
#     Determine access type based on payment gateway with COMPLETE coverage
#     """
#     if not transaction_instance.gateway:
#         return 'hotspot'  # Default fallback
    
#     gateway_name = transaction_instance.gateway.name
    
#     # COMPLETE access type mapping for ALL payment methods
#     access_type_mapping = {
#         'mpesa_paybill': 'hotspot',    # M-Pesa Paybill → Hotspot
#         'mpesa_till': 'hotspot',       # M-Pesa Till → Hotspot  
#         'bank_transfer': 'pppoe',      # Bank Transfer → PPPoE
#         'paypal': 'both'               # PayPal → Both access types
#     }
    
#     return access_type_mapping.get(gateway_name, 'hotspot')  # Default to hotspot


# def _determine_payment_method(transaction_instance):
#     """
#     Determine payment method display name with COMPLETE coverage
#     """
#     if not transaction_instance.gateway:
#         return 'unknown'
    
#     gateway_name = transaction_instance.gateway.name
    
#     # COMPLETE payment method mapping
#     payment_method_mapping = {
#         'mpesa_paybill': 'mpesa',
#         'mpesa_till': 'mpesa', 
#         'bank_transfer': 'bank_transfer',
#         'paypal': 'paypal'
#     }
    
#     return payment_method_mapping.get(gateway_name, 'unknown')


# def _extract_phone_number(transaction_instance):
#     """
#     Extract phone number from transaction metadata or client
#     Especially important for M-Pesa transactions
#     """
#     # Try to get from transaction metadata first (M-Pesa callback data)
#     if transaction_instance.metadata:
#         mpesa_phone = transaction_instance.metadata.get('phone_number')
#         if mpesa_phone:
#             return mpesa_phone
        
#         # Check callback data
#         callback_data = transaction_instance.metadata.get('callback_data', {})
#         if isinstance(callback_data, dict):
#             body_data = callback_data.get('Body', {})
#             stk_callback = body_data.get('stkCallback', {})
#             callback_metadata = stk_callback.get('CallbackMetadata', {})
#             items = callback_metadata.get('Item', [])
#             for item in items:
#                 if item.get('Name') == 'PhoneNumber':
#                     return item.get('Value')
    
#     # Fallback to client's phone number
#     if (transaction_instance.client and 
#         transaction_instance.client.user and 
#         transaction_instance.client.user.phone_number):
#         return transaction_instance.client.user.phone_number
    
#     return None


# def _generate_description(transaction_instance):
#     """
#     Generate appropriate description based on payment method
#     """
#     gateway_display = transaction_instance.gateway.get_name_display() if transaction_instance.gateway else 'Unknown Gateway'
    
#     description_templates = {
#         'mpesa_paybill': f"M-Pesa Paybill payment completed",
#         'mpesa_till': f"M-Pesa Till payment completed", 
#         'bank_transfer': f"Bank transfer payment completed",
#         'paypal': f"PayPal payment completed"
#     }
    
#     gateway_name = transaction_instance.gateway.name if transaction_instance.gateway else 'unknown'
#     base_description = description_templates.get(gateway_name, f"Payment completed via {gateway_display}")
    
#     # Add plan information if available
#     if transaction_instance.plan:
#         base_description += f" for {transaction_instance.plan.name}"
    
#     return base_description


# def _build_metadata(transaction_instance):
#     """
#     Build comprehensive metadata for transaction log
#     """
#     metadata = {
#         'auto_created': True,
#         'payment_reference': transaction_instance.reference,
#         'original_payment_id': str(transaction_instance.id),
#         'gateway_type': transaction_instance.gateway.name if transaction_instance.gateway else 'unknown',
#         'idempotency_key': transaction_instance.idempotency_key,
#         'callback_attempts': transaction_instance.callback_attempts
#     }
    
#     # Add gateway-specific metadata
#     if transaction_instance.gateway:
#         metadata.update({
#             'gateway_name_display': transaction_instance.gateway.get_name_display(),
#             'gateway_security_level': transaction_instance.gateway.security_level
#         })
    
#     # Add M-Pesa specific data if available
#     if (transaction_instance.gateway and 
#         transaction_instance.gateway.name in ['mpesa_paybill', 'mpesa_till'] and 
#         transaction_instance.metadata):
        
#         mpesa_data = {
#             'mpesa_receipt': transaction_instance.metadata.get('mpesa_receipt'),
#             'checkout_request_id': transaction_instance.metadata.get('checkout_request_id'),
#             'transaction_date': transaction_instance.metadata.get('transaction_date')
#         }
#         metadata.update(mpesa_data)
    
#     # Add PayPal specific data if available  
#     if (transaction_instance.gateway and 
#         transaction_instance.gateway.name == 'paypal' and 
#         transaction_instance.metadata):
        
#         paypal_data = {
#             'paypal_order_id': transaction_instance.metadata.get('paypal_order_id'),
#             'paypal_capture_id': transaction_instance.metadata.get('paypal_capture_id')
#         }
#         metadata.update(paypal_data)
    
#     # Add bank transfer specific data if available
#     if (transaction_instance.gateway and 
#         transaction_instance.gateway.name == 'bank_transfer' and 
#         transaction_instance.metadata):
        
#         bank_data = {
#             'verified_by': transaction_instance.metadata.get('verified_by'),
#             'verified_at': transaction_instance.metadata.get('verified_at'),
#             'proof_url': transaction_instance.metadata.get('proof_url')
#         }
#         metadata.update(bank_data)
    
#     return metadata






from django.db import models
from django.core.validators import MinValueValidator
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.core.exceptions import ValidationError
import uuid
import logging
import re

logger = logging.getLogger(__name__)
User = get_user_model()


class TransactionLog(models.Model):
    """
    Transaction log for client payments (hotspot/PPPoE clients only)
    Admin/staff users don't have transactions - they manage them
    
    CLIENT TYPES:
    1. PPPoE Clients: Have name + phone number, generate pppoe_username and pppoe_password
    2. Hotspot Clients: Only phone number, username auto-generated on purchase
    """
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
    
    ACCESS_TYPES = (
        ('hotspot', 'Hotspot'),
        ('pppoe', 'PPPoE'),
        ('both', 'Both'),
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
    
    # Link to UserAccount model (only client users have transactions)
    client = models.ForeignKey(
        'authentication.UserAccount',
        on_delete=models.CASCADE,
        related_name='transaction_logs',
        limit_choices_to={'user_type': 'client'},  # Only client users
        help_text="Client user associated with this transaction"
    )
    
    subscription = models.ForeignKey(
        'service_operations.Subscription',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='transaction_logs'
    )
    
    internet_plan = models.ForeignKey(
        'internet_plans.InternetPlan',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='transaction_logs'
    )
    
    access_type = models.CharField(
        max_length=10, 
        choices=ACCESS_TYPES, 
        default='hotspot',
        help_text='Type of access method (Hotspot/PPPoE/Both)'
    )
    
    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    payment_method = models.CharField(max_length=15, choices=PAYMENT_METHODS, default='mpesa')
    
    phone_number = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        help_text="Phone number used for payment (for M-Pesa transactions)"
    )
    
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
            models.Index(fields=['access_type']),
            models.Index(fields=['internet_plan']),
            models.Index(fields=['subscription']),
            models.Index(fields=['client', 'status']),
            models.Index(fields=['client', 'created_at']),
            models.Index(fields=['client', 'access_type']),
        ]
    
    def __str__(self):
        return f"{self.transaction_id} - {self.client_display_name} - {self.get_access_type_display()} - {self.get_status_display()} ({self.amount})"
    
    def clean(self):
        """Validate transaction log before saving"""
        errors = {}
        
        # Client must be a client user (not admin/staff)
        if self.client and self.client.user_type != 'client':
            errors['client'] = "Transaction logs can only be associated with client users"
        
        # Validate access type matches client's connection type
        if self.client and self.access_type:
            client_connection = self.client.connection_type
            
            if client_connection == 'hotspot' and self.access_type not in ['hotspot', 'both']:
                errors['access_type'] = f"Hotspot client cannot have {self.access_type} access type"
            
            elif client_connection == 'pppoe' and self.access_type not in ['pppoe', 'both']:
                errors['access_type'] = f"PPPoE client cannot have {self.access_type} access type"
            
            elif client_connection == 'admin':  # Admin users should never have transactions
                errors['client'] = "Admin/staff users cannot have transaction logs"
        
        # Validate phone number format if provided
        if self.phone_number:
            # Clean and validate phone number
            clean_number = re.sub(r'[^\d+]', '', self.phone_number)
            
            # Basic validation for Kenyan numbers
            patterns = [
                r'^\+2547\d{8}$',      # +254712345678
                r'^\+2541\d{8}$',      # +254112345678
                r'^07\d{8}$',          # 0712345678
                r'^01\d{8}$',          # 0112345678
            ]
            
            is_valid = any(re.match(pattern, clean_number) for pattern in patterns)
            if not is_valid:
                errors['phone_number'] = "Invalid phone number format"
        
        if errors:
            raise ValidationError(errors)
    
    def save(self, *args, **kwargs):
        """Custom save with auto-generation and validation"""
        if not self.transaction_id:
            self.transaction_id = self._generate_transaction_id()
        
        # Auto-populate phone number from client if not set
        if not self.phone_number and self.client and self.client.phone_number:
            self.phone_number = self.client.phone_number
        
        # Auto-populate access_type from client's connection type if not set
        if not self.access_type and self.client:
            self.access_type = self.client.connection_type
        
        # Auto-populate access_type from subscription if available
        if not self.access_type and self.subscription:
            self.access_type = getattr(self.subscription, 'access_method', self.client.connection_type)
        
        # Auto-populate internet_plan from subscription if available
        if not self.internet_plan and self.subscription:
            self.internet_plan = getattr(self.subscription, 'internet_plan', None)
        
        # Validate before saving
        self.full_clean()
        super().save(*args, **kwargs)
    
    def _generate_transaction_id(self):
        """Generate unique transaction ID"""
        timestamp = timezone.now().strftime("%y%m%d")
        random_part = str(uuid.uuid4().int)[:6]
        return f"TX{timestamp}{random_part}"
    
    @property
    def client_display_name(self):
        """Get client's display name for frontend display"""
        if self.client:
            # PPPoE clients have name field
            if self.client.name:
                return self.client.name
            # Hotspot clients use username
            elif self.client.username:
                return self.client.username
            # Fallback to phone number display
            elif self.client.phone_number:
                return self.client.get_phone_display()
        return "Unknown Client"
    
    @property
    def client_username(self):
        """Get client's username"""
        return self.client.username if self.client else "N/A"
    
    @property
    def client_pppoe_username(self):
        """Get PPPoE username if client is PPPoE user"""
        if self.client and self.client.is_pppoe_client:
            return self.client.pppoe_username
        return None
    
    @property
    def client_connection_type(self):
        """Get client's connection type"""
        return self.client.connection_type if self.client else "N/A"
    
    @property
    def client_connection_type_display(self):
        """Get client's connection type display name"""
        return self.client.get_connection_type_display() if self.client else "N/A"
    
    @property
    def is_pppoe_client(self):
        """Check if client is PPPoE client"""
        return self.client.is_pppoe_client if self.client else False
    
    @property
    def is_hotspot_client(self):
        """Check if client is hotspot client"""
        return self.client.is_hotspot_client if self.client else False
    
    @property
    def formatted_phone(self):
        """Format phone number for display"""
        if not self.phone_number:
            return None
        
        # Import phone validation utility
        try:
            from authentication.models import PhoneValidation
            return PhoneValidation.get_phone_display(self.phone_number)
        except ImportError:
            # Fallback basic formatting
            clean_number = re.sub(r'[^\d]', '', self.phone_number)
            if clean_number.startswith('254') and len(clean_number) == 12:
                return f"0{clean_number[3:]}"
            elif clean_number.startswith('+254') and len(clean_number) == 13:
                return f"0{clean_number[4:]}"
            elif clean_number.startswith('0') and len(clean_number) == 10:
                return clean_number
            return self.phone_number
    
    @property
    def plan_name(self):
        """Get plan name for display"""
        if self.internet_plan:
            return self.internet_plan.name
        elif self.subscription and hasattr(self.subscription, 'internet_plan'):
            return self.subscription.internet_plan.name if self.subscription.internet_plan else "N/A"
        return self.metadata.get('plan_name', 'N/A')
    
    @property
    def access_type_display(self):
        """Get formatted access type for display"""
        return self.get_access_type_display()
    
    @property
    def payment_method_display(self):
        """Get formatted payment method for display"""
        return self.get_payment_method_display()
    
    @property
    def status_display(self):
        """Get formatted status for display"""
        return self.get_status_display()
    
    def to_dict(self):
        """Convert transaction log to dictionary for API responses"""
        data = {
            'id': str(self.id),
            'transaction_id': self.transaction_id,
            'client_id': str(self.client.id) if self.client else None,
            'client_display_name': self.client_display_name,
            'client_username': self.client_username,
            'client_connection_type': self.client_connection_type,
            'client_connection_type_display': self.client_connection_type_display,
            'is_pppoe_client': self.is_pppoe_client,
            'is_hotspot_client': self.is_hotspot_client,
            'amount': float(self.amount),
            'status': self.status,
            'status_display': self.status_display,
            'payment_method': self.payment_method,
            'payment_method_display': self.payment_method_display,
            'access_type': self.access_type,
            'access_type_display': self.access_type_display,
            'phone_number': self.phone_number,
            'formatted_phone': self.formatted_phone,
            'reference_number': self.reference_number,
            'description': self.description,
            'plan_name': self.plan_name,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'metadata': self.metadata,
        }
        
        # Add PPPoE specific data if client is PPPoE
        if self.is_pppoe_client:
            data['client_pppoe_username'] = self.client_pppoe_username
        
        # Add subscription and plan IDs if available
        if self.internet_plan:
            data['internet_plan_id'] = str(self.internet_plan.id)
        if self.subscription:
            data['subscription_id'] = str(self.subscription.id)
        
        return data


class TransactionLogHistory(models.Model):
    """Audit trail for transaction log changes"""
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
    old_access_type = models.CharField(max_length=10, choices=TransactionLog.ACCESS_TYPES, blank=True, null=True)
    new_access_type = models.CharField(max_length=10, choices=TransactionLog.ACCESS_TYPES, blank=True, null=True)
    changes = models.JSONField(default=dict)
    performed_by = models.ForeignKey(
        'authentication.UserAccount',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        limit_choices_to={'user_type__in': ['staff', 'admin']},  # Only admin/staff can perform actions
        help_text="Admin/staff user who performed the action"
    )
    notes = models.TextField(blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Transaction Log History"
        verbose_name_plural = "Transaction Log Histories"
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['transaction_log', 'timestamp']),
            models.Index(fields=['action', 'timestamp']),
            models.Index(fields=['performed_by', 'timestamp']),
            models.Index(fields=['new_status', 'timestamp']),
        ]
    
    def __str__(self):
        if self.performed_by:
            performer = self.performed_by.email if self.performed_by.user_type in ['staff', 'admin'] else self.performed_by.username
        else:
            performer = "System"
        return f"{self.get_action_display()} on {self.transaction_log.transaction_id} by {performer}"
    
    @property
    def performed_by_display(self):
        """Get display name for performed_by user"""
        if self.performed_by:
            if self.performed_by.user_type in ['staff', 'admin']:
                return self.performed_by.email
            else:
                return self.performed_by.username
        return "System"


# Signal handlers for automatic transaction log creation
@receiver(pre_save, sender=TransactionLog)
def create_transaction_log_history_on_update(sender, instance, **kwargs):
    """Create history record when transaction log is updated"""
    if instance.pk:
        try:
            old_instance = TransactionLog.objects.get(pk=instance.pk)
            
            # Check for changes that need to be tracked
            changes = {}
            
            # Track status changes
            if old_instance.status != instance.status:
                changes['status'] = {
                    'old': old_instance.status,
                    'new': instance.status,
                    'old_display': old_instance.status_display,
                    'new_display': instance.status_display
                }
            
            # Track access type changes
            if old_instance.access_type != instance.access_type:
                changes['access_type'] = {
                    'old': old_instance.access_type,
                    'new': instance.access_type,
                    'old_display': old_instance.access_type_display,
                    'new_display': instance.access_type_display
                }
            
            # Track amount changes
            if old_instance.amount != instance.amount:
                changes['amount'] = {
                    'old': float(old_instance.amount),
                    'new': float(instance.amount)
                }
            
            # Track payment method changes
            if old_instance.payment_method != instance.payment_method:
                changes['payment_method'] = {
                    'old': old_instance.payment_method,
                    'new': instance.payment_method,
                    'old_display': old_instance.payment_method_display,
                    'new_display': instance.payment_method_display
                }
            
            # Create history record if there are changes
            if changes:
                # We'll set performed_by to None since we can't get current user in models
                # This can be set by views/API endpoints that manually create history
                TransactionLogHistory.objects.create(
                    transaction_log=instance,
                    action='update',
                    old_status=old_instance.status,
                    new_status=instance.status,
                    old_access_type=old_instance.access_type,
                    new_access_type=instance.access_type,
                    changes=changes,
                    performed_by=None,  # Set to None, can be updated by views if needed
                    notes="Transaction log updated automatically"
                )
                
        except TransactionLog.DoesNotExist:
            pass  # New instance, no history needed


@receiver(post_save, sender='payments.Transaction')
def create_transaction_log_on_payment_completion(sender, instance, created, **kwargs):
    """
    Automatically create transaction log when payment transaction is completed
    Only for client users (hotspot/PPPoE)
    """
    # Only process completed payments that don't have transaction logs
    if instance.status == 'completed' and not instance.logs.exists():
        try:
            # Check if this is a client transaction (not admin/staff)
            if not hasattr(instance, 'client') or not instance.client:
                return
            
            # Verify client is actually a client user
            if instance.client.user_type != 'client':
                logger.warning(f"Payment {instance.reference} is for non-client user, skipping transaction log")
                return
            
            # Determine access type based on client's connection type
            access_type = instance.client.connection_type if instance.client else 'hotspot'
            
            # Determine payment method
            payment_method = _determine_payment_method(instance)
            
            # Get phone number from client or metadata
            phone_number = _extract_phone_number(instance)
            
            # Create transaction log
            transaction_log = TransactionLog.objects.create(
                payment_transaction=instance,
                client=instance.client,
                amount=instance.amount,
                status='success',
                payment_method=payment_method,
                access_type=access_type,
                internet_plan=getattr(instance, 'plan', None),
                subscription=getattr(instance, 'subscription', None),
                phone_number=phone_number,
                reference_number=instance.reference,
                description=_generate_description(instance),
                metadata=_build_metadata(instance)
            )
            
            # Create initial history record
            TransactionLogHistory.objects.create(
                transaction_log=transaction_log,
                action='create',
                new_status='success',
                new_access_type=access_type,
                changes={'auto_created': True},
                notes=f"Auto-created from payment {instance.reference}"
            )
            
            logger.info(f"Auto-created transaction log {transaction_log.transaction_id} for client {instance.client.username}")
            
        except Exception as e:
            logger.error(f"Failed to auto-create transaction log for {getattr(instance, 'reference', 'unknown')}: {str(e)}", exc_info=True)


def _determine_payment_method(transaction_instance):
    """Determine payment method from transaction gateway"""
    if not hasattr(transaction_instance, 'gateway') or not transaction_instance.gateway:
        return 'unknown'
    
    gateway_name = getattr(transaction_instance.gateway, 'name', 'unknown')
    
    payment_method_mapping = {
        'mpesa_paybill': 'mpesa',
        'mpesa_till': 'mpesa', 
        'bank_transfer': 'bank_transfer',
        'paypal': 'paypal'
    }
    
    return payment_method_mapping.get(gateway_name, 'unknown')


def _extract_phone_number(transaction_instance):
    """Extract phone number from transaction metadata or client"""
    # Try to get from transaction metadata (M-Pesa callback data)
    if hasattr(transaction_instance, 'metadata') and transaction_instance.metadata:
        metadata = transaction_instance.metadata
        if isinstance(metadata, dict):
            # Check for M-Pesa phone number
            mpesa_phone = metadata.get('phone_number')
            if mpesa_phone:
                return mpesa_phone
            
            # Check callback data
            callback_data = metadata.get('callback_data', {})
            if isinstance(callback_data, dict):
                body_data = callback_data.get('Body', {})
                if isinstance(body_data, dict):
                    stk_callback = body_data.get('stkCallback', {})
                    if isinstance(stk_callback, dict):
                        callback_metadata = stk_callback.get('CallbackMetadata', {})
                        if isinstance(callback_metadata, dict):
                            items = callback_metadata.get('Item', [])
                            for item in items:
                                if isinstance(item, dict) and item.get('Name') == 'PhoneNumber':
                                    return item.get('Value')
    
    # Fallback to client's phone number
    if (hasattr(transaction_instance, 'client') and 
        transaction_instance.client and 
        transaction_instance.client.phone_number):
        return transaction_instance.client.phone_number
    
    return None


def _generate_description(transaction_instance):
    """Generate appropriate description based on client type"""
    if hasattr(transaction_instance, 'gateway') and transaction_instance.gateway:
        gateway_display = transaction_instance.gateway.get_name_display()
    else:
        gateway_display = 'Unknown Gateway'
    
    description_templates = {
        'mpesa_paybill': "M-Pesa Paybill payment completed",
        'mpesa_till': "M-Pesa Till payment completed", 
        'bank_transfer': "Bank transfer payment completed",
        'paypal': "PayPal payment completed"
    }
    
    gateway_name = getattr(getattr(transaction_instance, 'gateway', None), 'name', 'unknown')
    base_description = description_templates.get(gateway_name, f"Payment completed via {gateway_display}")
    
    # Add client information
    if hasattr(transaction_instance, 'client') and transaction_instance.client:
        if transaction_instance.client.is_pppoe_client:
            client_display = f"PPPoE client {transaction_instance.client.name or transaction_instance.client.username}"
        else:
            client_display = f"Hotspot client {transaction_instance.client.username}"
        base_description += f" for {client_display}"
    
    # Add plan information if available
    if hasattr(transaction_instance, 'plan') and transaction_instance.plan:
        base_description += f" - {transaction_instance.plan.name}"
    
    return base_description


def _build_metadata(transaction_instance):
    """Build comprehensive metadata"""
    metadata = {
        'auto_created': True,
        'original_payment_id': str(transaction_instance.id),
    }
    
    # Add client type information
    if hasattr(transaction_instance, 'client') and transaction_instance.client:
        metadata['client_type'] = transaction_instance.client.connection_type
        metadata['client_username'] = transaction_instance.client.username
        metadata['client_is_pppoe'] = transaction_instance.client.is_pppoe_client
        metadata['client_is_hotspot'] = transaction_instance.client.is_hotspot_client
    
    # Add payment reference if available
    if hasattr(transaction_instance, 'reference'):
        metadata['payment_reference'] = transaction_instance.reference
    
    # Add gateway information if available
    if hasattr(transaction_instance, 'gateway') and transaction_instance.gateway:
        metadata.update({
            'gateway_type': transaction_instance.gateway.name,
            'gateway_name_display': transaction_instance.gateway.get_name_display(),
        })
    
    # Add other transaction attributes
    for attr in ['idempotency_key', 'callback_attempts']:
        if hasattr(transaction_instance, attr):
            metadata[attr] = getattr(transaction_instance, attr)
    
    # Add M-Pesa specific data
    if (hasattr(transaction_instance, 'gateway') and 
        transaction_instance.gateway and 
        transaction_instance.gateway.name in ['mpesa_paybill', 'mpesa_till'] and 
        hasattr(transaction_instance, 'metadata') and 
        transaction_instance.metadata):
        
        mpesa_attrs = ['mpesa_receipt', 'checkout_request_id', 'transaction_date']
        for attr in mpesa_attrs:
            if attr in transaction_instance.metadata:
                metadata[attr] = transaction_instance.metadata[attr]
    
    return metadata