

"""
SMS Automation Models - Integrated with User Management
"""
from django.db import models
import logging
from django.utils import timezone
from django.contrib.auth import get_user_model
import uuid

logger = logging.getLogger(__name__)
User = get_user_model()


class SMSGatewayConfig(models.Model):
    """SMS Gateway Configuration"""
    GATEWAY_CHOICES = (
        ('africas_talking', "Africa's Talking"),
        ('twilio', 'Twilio'),
        ('smpp', 'SMPP Gateway'),
        ('custom', 'Custom API'),
    )
    
    name = models.CharField(max_length=100, unique=True)
    gateway_type = models.CharField(max_length=20, choices=GATEWAY_CHOICES)
    is_default = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    
    # API credentials
    api_key = models.CharField(max_length=255, blank=True)
    api_secret = models.CharField(max_length=255, blank=True)
    api_url = models.URLField(blank=True)
    sender_id = models.CharField(max_length=20, blank=True)
    
    # Rate limiting
    max_messages_per_minute = models.IntegerField(default=60)
    max_messages_per_day = models.IntegerField(default=1000)
    
    # Status tracking
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    last_checked = models.DateTimeField(null=True, blank=True)
    last_used = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'SMS Gateway'
        verbose_name_plural = 'SMS Gateways'
        ordering = ['-is_default', 'name']
    
    def __str__(self):
        return f"{self.name} ({self.get_gateway_type_display()})"
    
    def save(self, *args, **kwargs):
        """Ensure only one default gateway"""
        if self.is_default:
            SMSGatewayConfig.objects.filter(is_default=True).update(is_default=False)
        super().save(*args, **kwargs)


class SMSTemplate(models.Model):
    """SMS message templates"""
    TEMPLATE_TYPES = (
        ('pppoe_credentials', 'PPPoE Credentials'),
        ('welcome', 'Welcome Message'),
        ('payment_reminder', 'Payment Reminder'),
        ('plan_expiry', 'Plan Expiry Warning'),
        ('promotion', 'Promotional Message'),
        ('system', 'System Notification'),
        ('custom', 'Custom Message'),
    )
    
    name = models.CharField(max_length=100, unique=True)
    template_type = models.CharField(max_length=20, choices=TEMPLATE_TYPES)
    subject = models.CharField(max_length=200, blank=True)
    
    # Template with variables
    message_template = models.TextField(
        help_text="Template with variables: {client_name}, {username}, {password}, {phone}"
    )
    
    # Variables description
    variables = models.JSONField(default=dict, help_text="Available variables for this template")
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} ({self.get_template_type_display()})"
    
    def render(self, context):
        """Render template with context"""
        try:
            message = self.message_template
            for key, value in context.items():
                placeholder = f"{{{key}}}"
                if placeholder in message:
                    message = message.replace(placeholder, str(value))
            return message
        except Exception as e:
            logger.error(f"Error rendering template {self.name}: {str(e)}")
            return self.message_template


class SMSMessage(models.Model):
    """SMS Message to be sent"""
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('queued', 'Queued'),
        ('sending', 'Sending'),
        ('sent', 'Sent'),
        ('delivered', 'Delivered'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    )
    
    PRIORITY_CHOICES = (
        ('low', 'Low'),
        ('normal', 'Normal'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Recipient
    phone_number = models.CharField(max_length=20, db_index=True)
    recipient_name = models.CharField(max_length=100, blank=True)
    
    # Reference to client (optional, for tracking)
    client = models.ForeignKey(
        'user_management.ClientProfile',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='sms_messages'
    )
    
    # Message content
    template = models.ForeignKey(
        SMSTemplate,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='messages'
    )
    message = models.TextField()
    original_message = models.TextField(blank=True)
    
    # Sending configuration
    gateway = models.ForeignKey(
        SMSGatewayConfig,
        on_delete=models.SET_NULL,
        null=True,
        related_name='messages'
    )
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='normal')
    scheduled_for = models.DateTimeField(null=True, blank=True, db_index=True)
    
    # Status tracking
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    status_message = models.TextField(blank=True)
    
    # Delivery tracking
    sent_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    message_id = models.CharField(max_length=100, blank=True, db_index=True)
    delivery_report = models.JSONField(default=dict, blank=True)
    
    # Retry logic
    retry_count = models.IntegerField(default=0)
    max_retries = models.IntegerField(default=3)
    next_retry_at = models.DateTimeField(null=True, blank=True)
    
    # Metadata
    source = models.CharField(max_length=100, default='system')
    reference_id = models.CharField(max_length=100, blank=True, db_index=True)
    metadata = models.JSONField(default=dict, blank=True)
    
    created_at = models.DateTimeField(default=timezone.now, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['phone_number', 'status']),
            models.Index(fields=['scheduled_for', 'status']),
            models.Index(fields=['status', 'priority']),
            models.Index(fields=['client', 'created_at']),
        ]
    
    def __str__(self):
        return f"SMS to {self.phone_number} ({self.status})"
    
    def can_send(self):
        """Check if message can be sent"""
        if self.status in ['sent', 'delivered', 'cancelled']:
            return False
        
        if self.scheduled_for and self.scheduled_for > timezone.now():
            return False
        
        return True
    
    def mark_as_sent(self, message_id=None):
        """Mark message as sent"""
        self.status = 'sent'
        self.sent_at = timezone.now()
        if message_id:
            self.message_id = message_id
        self.save()
    
    def mark_as_delivered(self, delivery_report=None):
        """Mark message as delivered"""
        self.status = 'delivered'
        self.delivered_at = timezone.now()
        if delivery_report:
            self.delivery_report = delivery_report
        self.save()
    
    def mark_as_failed(self, error_message):
        """Mark message as failed"""
        self.status = 'failed'
        self.status_message = error_message[:500]
        self.retry_count += 1
        
        if self.retry_count < self.max_retries:
            from datetime import timedelta
            retry_delay = timedelta(minutes=5 * self.retry_count)
            self.next_retry_at = timezone.now() + retry_delay
            self.status = 'pending'
        
        self.save()


class SMSDeliveryLog(models.Model):
    """Detailed delivery logs for SMS messages"""
    message = models.ForeignKey(SMSMessage, on_delete=models.CASCADE, related_name='delivery_logs')
    
    # Status changes
    old_status = models.CharField(max_length=10)
    new_status = models.CharField(max_length=10)
    
    # Gateway response
    gateway_response = models.JSONField(default=dict, blank=True)
    error_message = models.TextField(blank=True)
    
    # Cost tracking
    cost = models.DecimalField(max_digits=10, decimal_places=4, null=True, blank=True)
    currency = models.CharField(max_length=3, default='KES')
    
    timestamp = models.DateTimeField(default=timezone.now)
    
    class Meta:
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"Log: {self.message.phone_number} - {self.old_status}→{self.new_status}"


class SMSAutomationRule(models.Model):
    """Rules for automatic SMS sending"""
    RULE_TYPES = (
        ('pppoe_creation', 'On PPPoE Client Creation'),
        ('hotspot_creation', 'On Hotspot Client Creation'),
        ('payment_reminder', 'Payment Reminder'),
        ('plan_expiry', 'Plan Expiry Warning'),
        ('welcome', 'Welcome Message'),
        ('promotion', 'Promotional Campaign'),
        ('system_alert', 'System Alert'),
    )
    
    name = models.CharField(max_length=100)
    rule_type = models.CharField(max_length=20, choices=RULE_TYPES)
    is_active = models.BooleanField(default=True)
    
    # Template to use
    template = models.ForeignKey(SMSTemplate, on_delete=models.CASCADE, related_name='automation_rules')
    
    # Conditions
    conditions = models.JSONField(default=dict, blank=True)
    
    # Scheduling
    delay_minutes = models.IntegerField(default=0, help_text="Delay after trigger in minutes")
    
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} ({self.get_rule_type_display()})"