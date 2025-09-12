
from django.db import models
from django.utils import timezone
from django.core.validators import URLValidator
import uuid
from fernet_fields import EncryptedTextField
from network_management.models.router_management_model import Router

class MpesaCallbackEvent(models.Model):
    """M-Pesa callback event types"""
    EVENT_TYPES = (
        ('payment_success', 'Payment Success'),
        ('payment_failure', 'Payment Failure'),
        ('transaction_cancellation', 'Transaction Cancellation'),
        ('balance_check', 'Balance Check'),
        ('reversal', 'Reversal'),
        ('timeout', 'Timeout'),
        ('validation', 'Validation'),
        ('confirmation', 'Confirmation'),
    )
    
    name = models.CharField(max_length=50, choices=EVENT_TYPES, unique=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    priority = models.IntegerField(default=1, help_text="Processing priority (1-10)")
    
    def __str__(self):
        return self.get_name_display()
    
    class Meta:
        ordering = ['priority', 'name']

class MpesaCallbackConfiguration(models.Model):
    """Router-specific M-Pesa callback configuration"""
    SECURITY_LEVELS = (
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    router = models.ForeignKey(Router, on_delete=models.CASCADE, related_name='mpesa_callbacks')
    event = models.ForeignKey(MpesaCallbackEvent, on_delete=models.CASCADE)
    callback_url = models.URLField(max_length=500, validators=[URLValidator()])
    webhook_secret = models.CharField(max_length=64, blank=True)
    security_level = models.CharField(max_length=10, choices=SECURITY_LEVELS, default='medium')
    is_active = models.BooleanField(default=True)
    retry_enabled = models.BooleanField(default=True)
    max_retries = models.IntegerField(default=3)
    timeout_seconds = models.IntegerField(default=30)
    custom_headers = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['router', 'event']
        ordering = ['router__name', 'event__priority']
        indexes = [
            models.Index(fields=['router', 'event']),
            models.Index(fields=['is_active']),
            models.Index(fields=['security_level']),
        ]
    
    def __str__(self):
        return f"{self.router.name} - {self.event.get_name_display()}"

class MpesaCallbackLog(models.Model):
    """Callback delivery logs"""
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('success', 'Success'),
        ('failed', 'Failed'),
        ('retrying', 'Retrying'),
        ('timeout', 'Timeout'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    configuration = models.ForeignKey(MpesaCallbackConfiguration, on_delete=models.CASCADE)
    transaction = models.ForeignKey('payments.Transaction', on_delete=models.SET_NULL, null=True, blank=True)
    payload = models.JSONField()
    response_status = models.IntegerField(null=True, blank=True)
    response_body = models.TextField(blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    retry_count = models.IntegerField(default=0)
    error_message = models.TextField(blank=True)
    processed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['configuration', 'status']),
            models.Index(fields=['created_at']),
            models.Index(fields=['transaction']),
        ]
    
    def __str__(self):
        return f"{self.configuration} - {self.status}"

class MpesaCallbackRule(models.Model):
    """Advanced callback routing rules"""
    RULE_TYPES = (
        ('header_based', 'Header Based'),
        ('payload_based', 'Payload Based'),
        ('ip_based', 'IP Based'),
        ('geo_based', 'Geographic Based'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    rule_type = models.CharField(max_length=20, choices=RULE_TYPES)
    condition = models.JSONField(help_text="Rule condition in JSON format")
    target_configuration = models.ForeignKey(MpesaCallbackConfiguration, on_delete=models.CASCADE)
    priority = models.IntegerField(default=1)
    is_active = models.BooleanField(default=True)
    description = models.TextField(blank=True)
    
    class Meta:
        ordering = ['priority', 'name']
    
    def __str__(self):
        return self.name

class MpesaCallbackSecurityProfile(models.Model):
    """Security profiles for callback endpoints"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    ip_whitelist = models.JSONField(default=list, blank=True)
    rate_limit_requests = models.IntegerField(default=100)
    rate_limit_period = models.IntegerField(default=60, help_text="Seconds")
    require_https = models.BooleanField(default=True)
    signature_validation = models.BooleanField(default=True)
    encryption_required = models.BooleanField(default=False)
    custom_headers = models.JSONField(default=dict, blank=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return self.name        