
# from django.db import models
# from django.core.exceptions import ValidationError
# from django.utils.crypto import get_random_string

# class PaymentMethodConfig(models.Model):
#     PAYMENT_METHOD_TYPES = (
#         ('mpesa_paybill', 'M-Pesa Paybill'),
#         ('mpesa_till', 'M-Pesa Till'),
#         ('paypal', 'PayPal'),
#         ('bank', 'Bank Transfer'),
#     )
    
#     SECURITY_LEVELS = (
#         ('critical', 'Critical'),
#         ('high', 'High'),
#         ('medium', 'Medium'),
#         ('low', 'Low'),
#         ('secure', 'Secure'),
#     )

#     KENYAN_BANKS = [
#         {'name': 'Equity Bank', 'code': '68'},
#         {'name': 'KCB Bank', 'code': '01'},
#         {'name': 'Cooperative Bank', 'code': '11'},
#         {'name': 'Standard Chartered', 'code': '02'},
#         {'name': 'Absa Bank', 'code': '03'},
#         {'name': 'NCBA Bank', 'code': '07'},
#         {'name': 'DTB Bank', 'code': '63'},
#         {'name': 'I&M Bank', 'code': '57'},
#         {'name': 'Stanbic Bank', 'code': '31'},
#         {'name': 'Citi Bank', 'code': '04'},
#         {'name': 'Bank of Africa', 'code': '55'},
#         {'name': 'Sidian Bank', 'code': '66'},
#         {'name': 'Prime Bank', 'code': '40'},
#         {'name': 'Family Bank', 'code': '70'},
#         {'name': 'GT Bank', 'code': '53'}
#     ]

#     client = models.ForeignKey('account.Client', on_delete=models.CASCADE, related_name='payment_configs')
#     method_type = models.CharField(max_length=20, choices=PAYMENT_METHOD_TYPES)
#     is_active = models.BooleanField(default=True)
#     sandbox_mode = models.BooleanField(default=False)
#     auto_settle = models.BooleanField(default=True)
#     callback_url = models.URLField(max_length=255, blank=True, null=True)
#     webhook_secret = models.CharField(max_length=64, blank=True, null=True)
#     transaction_limit = models.DecimalField(max_digits=15, decimal_places=2, blank=True, null=True)
#     security_level = models.CharField(max_length=10, choices=SECURITY_LEVELS, default='medium')

#     # M-Pesa Paybill fields
#     api_key = models.CharField(max_length=100, blank=True, null=True)
#     secret_key = models.CharField(max_length=100, blank=True, null=True)
#     short_code = models.CharField(max_length=20, blank=True, null=True)
#     pass_key = models.CharField(max_length=100, blank=True, null=True)

#     # M-Pesa Till fields
#     till_number = models.CharField(max_length=20, blank=True, null=True)
#     store_number = models.CharField(max_length=20, blank=True, null=True)

#     # PayPal fields
#     paypal_client_id = models.CharField(max_length=100, blank=True, null=True)
#     secret = models.CharField(max_length=100, blank=True, null=True)
#     merchant_id = models.CharField(max_length=100, blank=True, null=True)

#     # Bank Transfer fields
#     bank_name = models.CharField(max_length=100, blank=True, null=True)
#     account_number = models.CharField(max_length=50, blank=True, null=True)
#     account_name = models.CharField(max_length=100, blank=True, null=True)
#     branch_code = models.CharField(max_length=20, blank=True, null=True)
#     swift_code = models.CharField(max_length=20, blank=True, null=True)

#     configuration_version = models.CharField(max_length=10, default='1.0.0')
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)

#     class Meta:
#         unique_together = ('client', 'method_type')
#         indexes = [
#             models.Index(fields=['client', 'method_type']),
#             models.Index(fields=['is_active']),
#             models.Index(fields=['security_level']),
#         ]

#     def __str__(self):
#         return f"{self.get_method_type_display()} - {self.client.phonenumber}"

#     def clean(self):
#         if self.is_active:
#             if self.method_type == 'mpesa_paybill' and not (self.short_code and self.pass_key and self.api_key and self.secret_key):
#                 raise ValidationError("M-Pesa Paybill requires short_code, pass_key, api_key, and secret_key.")
#             elif self.method_type == 'mpesa_till' and not (self.till_number and self.store_number and self.pass_key):
#                 raise ValidationError("M-Pesa Till requires till_number, store_number, and pass_key.")
#             elif self.method_type == 'paypal' and not (self.paypal_client_id and self.secret and self.merchant_id):
#                 raise ValidationError("PayPal requires paypal_client_id, secret, and merchant_id.")
#             elif self.method_type == 'bank' and not (self.bank_name and self.account_number and self.account_name):
#                 raise ValidationError("Bank Transfer requires bank_name, account_number, and account_name.")
                
#             if self.method_type == 'bank' and self.bank_name:
#                 valid_banks = [bank['name'] for bank in self.KENYAN_BANKS]
#                 if self.bank_name not in valid_banks:
#                     raise ValidationError(f"Invalid bank name. Must be one of: {', '.join(valid_banks)}")

#     def save(self, *args, **kwargs):
#         if not self.webhook_secret:
#             self.webhook_secret = get_random_string(64)
            
#         if self.is_active and self.callback_url and self.webhook_secret and self._check_required_fields():
#             self.security_level = 'secure'
#         elif self.is_active:
#             self.security_level = 'medium'
#         else:
#             self.security_level = 'low'
            
#         super().save(*args, **kwargs)

#     def _check_required_fields(self):
#         if self.method_type == 'mpesa_paybill':
#             return all([self.api_key, self.secret_key, self.short_code, self.pass_key])
#         elif self.method_type == 'mpesa_till':
#             return all([self.till_number, self.store_number, self.pass_key])
#         elif self.method_type == 'paypal':
#             return all([self.paypal_client_id, self.secret, self.merchant_id])
#         elif self.method_type == 'bank':
#             return all([self.bank_name, self.account_number, self.account_name])
#         return False

#     def test_connection(self):
#         if self.method_type in ['mpesa_paybill', 'mpesa_till']:
#             try:
#                 if not all([self.api_key, self.secret_key]):
#                     return {
#                         'success': False, 
#                         'message': 'Missing API credentials',
#                         'status': 'error',
#                         'details': {'missing_fields': ['api_key', 'secret_key']}
#                     }
                    
#                 return {
#                     'success': True, 
#                     'message': 'Credentials appear valid',
#                     'status': 'success',
#                     'details': {
#                         'provider': 'M-Pesa',
#                         'environment': 'Sandbox' if self.sandbox_mode else 'Production'
#                     }
#                 }
#             except Exception as e:
#                 return {
#                     'success': False, 
#                     'message': str(e),
#                     'status': 'error',
#                     'details': {'error': str(e)}
#                 }
                
#         return {
#             'success': False, 
#             'message': 'Connection test not implemented for this method',
#             'status': 'warning',
#             'details': None
#         }

#     def get_method_metadata(self):
#         metadata = {
#             'mpesa_paybill': {
#                 'description': 'Accept payments via M-Pesa Paybill number',
#                 'supportedCurrencies': ['KES'],
#                 'feeStructure': '1.5% + KES 10 per transaction',
#                 'documentationLink': 'https://developer.safaricom.co.ke/Documentation'
#             },
#             'mpesa_till': {
#                 'description': 'Accept payments via M-Pesa Till number',
#                 'supportedCurrencies': ['KES'],
#                 'feeStructure': '1.2% + KES 5 per transaction',
#                 'documentationLink': 'https://developer.safaricom.co.ke/Documentation'
#             },
#             'paypal': {
#                 'description': 'Accept international payments via PayPal',
#                 'supportedCurrencies': ['USD', 'EUR', 'GBP', 'AUD'],
#                 'feeStructure': '2.9% + $0.30 per transaction',
#                 'documentationLink': 'https://developer.paypal.com/home'
#             },
#             'bank': {
#                 'description': 'Accept direct bank transfers',
#                 'supportedCurrencies': ['KES', 'USD', 'EUR'],
#                 'feeStructure': 'Flat fee of KES 50 per transaction',
#                 'documentationLink': 'https://buni.kcbgroup.com/discover-apis'
#             }
#         }
#         return metadata.get(self.method_type, {})

# class ConfigurationHistory(models.Model):
#     ACTIONS = (
#         ('created', 'Created'),
#         ('updated', 'Updated'),
#         ('deleted', 'Deleted'),
#         ('tested', 'Tested'),
#         ('enabled', 'Enabled'),
#         ('disabled', 'Disabled'),
#     )
    
#     STATUSES = (
#         ('success', 'success'),
#         ('failed', 'Failed'),
#         ('pending', 'Pending'),
#     )

#     client = models.ForeignKey('account.Client', on_delete=models.CASCADE, related_name='config_history')
#     action = models.CharField(max_length=20, choices=ACTIONS)
#     status = models.CharField(max_length=10, choices=STATUSES, default='success')
#     changes = models.JSONField(default=list)
#     created_at = models.DateTimeField(auto_now_add=True)
#     user_id = models.CharField(max_length=100, blank=True, null=True)

#     class Meta:
#         ordering = ['-created_at']
#         indexes = [
#             models.Index(fields=['client', 'created_at']),
#             models.Index(fields=['action']),
#             models.Index(fields=['status']),
#         ]
#         verbose_name_plural = 'changes'

#     def __str__(self):
#         return f"{self.get_action_display()} by {self.client.user.username} at {self.created_at}"

#     def save(self, *args, **kwargs):
#         if not self.user_id:
#             self.user_id = 'system'
#         if not isinstance(self.changes, list):
#             self.changes = []
#         super().save(*args, **kwargs)

# class Transaction(models.Model):
#     STATUS_CHOICES = (
#         ("Pending", "Pending"),
#         ("Success", "Success"),
#         ("Failed", "Failed"),
#     )

#     SECURITY_LEVELS = (
#         ('critical', 'Critical'),
#         ('high', 'secure'),
#         ('medium', 'Medium'),
#         ('low', 'normal'),
#         ('secure', 'Secure'),
#     )

#     amount = models.DecimalField(max_digits=10, decimal_places=2)
#     checkout_id = models.CharField(max_length=100, unique=True, null=True)
#     mpesa_code = models.CharField(max_length=100, unique=True, blank=True, null=True)
#     phone_number = models.CharField(max_length=15)
#     status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Pending")
#     timestamp = models.DateTimeField(auto_now_add=True)
#     plan = models.ForeignKey('internet_plans.InternetPlan', on_delete=models.SET_NULL, null=True)
#     payment_method = models.ForeignKey('PaymentMethodConfig', on_delete=models.SET_NULL, null=True, blank=True)
#     security_level = models.CharField(max_length=10, choices=SECURITY_LEVELS, default='medium')

#     def __str__(self):
#         return f"{self.mpesa_code or 'Pending'} - {self.amount} KES"

#     def save(self, *args, **kwargs):
#         if not self.security_level and self.payment_method:
#             self.security_level = self.payment_method.security_level
#         super().save(*args, **kwargs)





from django.db import models
from django.core.exceptions import ValidationError
from django.utils.crypto import get_random_string

class PaymentMethodConfig(models.Model):
    PAYMENT_METHOD_TYPES = (
        ('mpesa_paybill', 'M-Pesa Paybill'),
        ('mpesa_till', 'M-Pesa Till'),
        ('paypal', 'PayPal'),
        ('bank', 'Bank Transfer'),
    )
    
    SECURITY_LEVELS = (
        ('critical', 'Critical'),
        ('high', 'High'),
        ('medium', 'Medium'),
        ('low', 'Low'),
        ('secure', 'Secure'),
    )

    KENYAN_BANKS = [
        {'name': 'Equity Bank', 'code': '68'},
        {'name': 'KCB Bank', 'code': '01'},
        {'name': 'Cooperative Bank', 'code': '11'},
        {'name': 'Standard Chartered', 'code': '02'},
        {'name': 'Absa Bank', 'code': '03'},
        {'name': 'NCBA Bank', 'code': '07'},
        {'name': 'DTB Bank', 'code': '63'},
        {'name': 'I&M Bank', 'code': '57'},
        {'name': 'Stanbic Bank', 'code': '31'},
        {'name': 'Citi Bank', 'code': '04'},
        {'name': 'Bank of Africa', 'code': '55'},
        {'name': 'Sidian Bank', 'code': '66'},
        {'name': 'Prime Bank', 'code': '40'},
        {'name': 'Family Bank', 'code': '70'},
        {'name': 'GT Bank', 'code': '53'}
    ]

    client = models.ForeignKey('account.Client', on_delete=models.CASCADE, related_name='payment_configs')
    method_type = models.CharField(max_length=20, choices=PAYMENT_METHOD_TYPES)
    is_active = models.BooleanField(default=True)
    sandbox_mode = models.BooleanField(default=False)
    auto_settle = models.BooleanField(default=True)
    callback_url = models.URLField(max_length=255, blank=True, null=True)
    webhook_secret = models.CharField(max_length=64, blank=True, null=True)
    transaction_limit = models.DecimalField(max_digits=15, decimal_places=2, blank=True, null=True)
    security_level = models.CharField(max_length=10, choices=SECURITY_LEVELS, default='medium')

    # M-Pesa Paybill fields
    api_key = models.CharField(max_length=100, blank=True, null=True)
    secret_key = models.CharField(max_length=100, blank=True, null=True)
    short_code = models.CharField(max_length=20, blank=True, null=True)
    pass_key = models.CharField(max_length=100, blank=True, null=True)

    # M-Pesa Till fields
    till_number = models.CharField(max_length=20, blank=True, null=True)
    store_number = models.CharField(max_length=20, blank=True, null=True)

    # PayPal fields
    paypal_client_id = models.CharField(max_length=100, blank=True, null=True)
    secret = models.CharField(max_length=100, blank=True, null=True)
    merchant_id = models.CharField(max_length=100, blank=True, null=True)

    # Bank Transfer fields
    bank_name = models.CharField(max_length=100, blank=True, null=True)
    account_number = models.CharField(max_length=50, blank=True, null=True)
    account_name = models.CharField(max_length=100, blank=True, null=True)
    branch_code = models.CharField(max_length=20, blank=True, null=True)
    swift_code = models.CharField(max_length=20, blank=True, null=True)

    configuration_version = models.CharField(max_length=10, default='1.0.0')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('client', 'method_type')
        indexes = [
            models.Index(fields=['client', 'method_type']),
            models.Index(fields=['is_active']),
            models.Index(fields=['security_level']),
        ]

    def __str__(self):
        return f"{self.get_method_type_display()} - {self.client.phonenumber}"

    def clean(self):
        if self.is_active:
            if self.method_type == 'mpesa_paybill' and not (self.short_code and self.pass_key and self.api_key and self.secret_key):
                raise ValidationError("M-Pesa Paybill requires short_code, pass_key, api_key, and secret_key.")
            elif self.method_type == 'mpesa_till' and not (self.till_number and self.store_number and self.pass_key):
                raise ValidationError("M-Pesa Till requires till_number, store_number, and pass_key.")
            elif self.method_type == 'paypal' and not (self.paypal_client_id and self.secret and self.merchant_id):
                raise ValidationError("PayPal requires paypal_client_id, secret, and merchant_id.")
            elif self.method_type == 'bank' and not (self.bank_name and self.account_number and self.account_name):
                raise ValidationError("Bank Transfer requires bank_name, account_number, and account_name.")
                
            if self.method_type == 'bank' and self.bank_name:
                valid_banks = [bank['name'] for bank in self.KENYAN_BANKS]
                if self.bank_name not in valid_banks:
                    raise ValidationError(f"Invalid bank name. Must be one of: {', '.join(valid_banks)}")

    def save(self, *args, **kwargs):
        if not self.webhook_secret:
            self.webhook_secret = get_random_string(64)
            
        if self.is_active and self.callback_url and self.webhook_secret and self._check_required_fields():
            self.security_level = 'secure'
        elif self.is_active:
            self.security_level = 'medium'
        else:
            self.security_level = 'low'
            
        super().save(*args, **kwargs)

    def _check_required_fields(self):
        if self.method_type == 'mpesa_paybill':
            return all([self.api_key, self.secret_key, self.short_code, self.pass_key])
        elif self.method_type == 'mpesa_till':
            return all([self.till_number, self.store_number, self.pass_key])
        elif self.method_type == 'paypal':
            return all([self.paypal_client_id, self.secret, self.merchant_id])
        elif self.method_type == 'bank':
            return all([self.bank_name, self.account_number, self.account_name])
        return False

    def test_connection(self):
        if self.method_type in ['mpesa_paybill', 'mpesa_till']:
            try:
                if not all([self.api_key, self.secret_key]):
                    return {
                        'success': False, 
                        'message': 'Missing API credentials',
                        'status': 'error',
                        'details': {'missing_fields': ['api_key', 'secret_key']}
                    }
                    
                return {
                    'success': True, 
                    'message': 'Credentials appear valid',
                    'status': 'success',
                    'details': {
                        'provider': 'M-Pesa',
                        'environment': 'Sandbox' if self.sandbox_mode else 'Production'
                    }
                }
            except Exception as e:
                return {
                    'success': False, 
                    'message': str(e),
                    'status': 'error',
                    'details': {'error': str(e)}
                }
                
        return {
            'success': False, 
            'message': 'Connection test not implemented for this method',
            'status': 'warning',
            'details': None
        }

    def get_method_metadata(self):
        metadata = {
            'mpesa_paybill': {
                'description': 'Accept payments via M-Pesa Paybill number',
                'supportedCurrencies': ['KES'],
                'feeStructure': '1.5% + KES 10 per transaction',
                'documentationLink': 'https://developer.safaricom.co.ke/Documentation'
            },
            'mpesa_till': {
                'description': 'Accept payments via M-Pesa Till number',
                'supportedCurrencies': ['KES'],
                'feeStructure': '1.2% + KES 5 per transaction',
                'documentationLink': 'https://developer.safaricom.co.ke/Documentation'
            },
            'paypal': {
                'description': 'Accept international payments via PayPal',
                'supportedCurrencies': ['USD', 'EUR', 'GBP', 'AUD'],
                'feeStructure': '2.9% + $0.30 per transaction',
                'documentationLink': 'https://developer.paypal.com/home'
            },
            'bank': {
                'description': 'Accept direct bank transfers',
                'supportedCurrencies': ['KES', 'USD', 'EUR'],
                'feeStructure': 'Flat fee of KES 50 per transaction',
                'documentationLink': 'https://buni.kcbgroup.com/discover-apis'
            }
        }
        return metadata.get(self.method_type, {})

class ConfigurationHistory(models.Model):
    ACTIONS = (
        ('created', 'Created'),
        ('updated', 'Updated'),
        ('deleted', 'Deleted'),
        ('tested', 'Tested'),
        ('enabled', 'Enabled'),
        ('disabled', 'Disabled'),
    )
    
    STATUSES = (
        ('success', 'success'),
        ('failed', 'Failed'),
        ('pending', 'Pending'),
    )

    client = models.ForeignKey('account.Client', on_delete=models.CASCADE, related_name='config_history')
    action = models.CharField(max_length=20, choices=ACTIONS)
    status = models.CharField(max_length=10, choices=STATUSES, default='success')
    changes = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)
    user_id = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['client', 'created_at']),
            models.Index(fields=['action']),
            models.Index(fields=['status']),
        ]
        verbose_name_plural = 'changes'

    def __str__(self):
        return f"{self.get_action_display()} by {self.client.user.username} at {self.created_at}"

    def save(self, *args, **kwargs):
        if not self.user_id:
            self.user_id = 'system'
        if not isinstance(self.changes, list):
            self.changes = []
        super().save(*args, **kwargs)

class Transaction(models.Model):
    STATUS_CHOICES = (
        ("Pending", "Pending"),
        ("Success", "Success"),
        ("Failed", "Failed"),
    )

    SECURITY_LEVELS = (
        ('critical', 'Critical'),
        ('high', 'secure'),
        ('medium', 'Medium'),
        ('low', 'normal'),
        ('secure', 'Secure'),
    )

    client = models.ForeignKey('account.Client', on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    checkout_id = models.CharField(max_length=100, unique=True, null=True)
    mpesa_code = models.CharField(max_length=100, unique=True, blank=True, null=True)
    phone_number = models.CharField(max_length=15)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Pending")
    timestamp = models.DateTimeField(auto_now_add=True)
    plan = models.ForeignKey('internet_plans.InternetPlan', on_delete=models.SET_NULL, null=True)
    payment_method = models.ForeignKey('PaymentMethodConfig', on_delete=models.SET_NULL, null=True, blank=True)
    security_level = models.CharField(max_length=10, choices=SECURITY_LEVELS, default='medium')
    subscription = models.ForeignKey('account.Subscription', on_delete=models.SET_NULL, null=True, blank=True, related_name='payments')

    def __str__(self):
        return f"{self.mpesa_code or 'Pending'} - {self.amount} KES"

    def save(self, *args, **kwargs):
        if not self.security_level and self.payment_method:
            self.security_level = self.payment_method.security_level
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = 'Payment'
        verbose_name_plural = 'Payments'
        ordering = ['-timestamp']