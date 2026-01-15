


"""
SMS Automation Models - Fully Integrated with User Management
Production-ready with comprehensive tracking and analytics
"""
from django.db import models
from django.utils import timezone
from datetime import timedelta
from django.core.validators import MinValueValidator
from django.contrib.auth import get_user_model
from django.core.cache import cache
import uuid
import logging
from enum import Enum
import json

from user_management.models.client_model import ClientProfile

logger = logging.getLogger(__name__)
User = get_user_model()


class GatewayType(Enum):
    AFRICAS_TALKING = 'africas_talking'
    TWILIO = 'twilio'
    SMPP = 'smpp'
    CUSTOM_API = 'custom'


class MessageStatus(Enum):
    PENDING = 'pending'
    QUEUED = 'queued'
    SENDING = 'sending'
    SENT = 'sent'
    DELIVERED = 'delivered'
    FAILED = 'failed'
    CANCELLED = 'cancelled'


class MessagePriority(Enum):
    LOW = 'low'
    NORMAL = 'normal'
    HIGH = 'high'
    URGENT = 'urgent'


class TemplateType(Enum):
    PPPOE_CREDENTIALS = 'pppoe_credentials'
    WELCOME = 'welcome'
    PAYMENT_REMINDER = 'payment_reminder'
    PLAN_EXPIRY = 'plan_expiry'
    PROMOTIONAL = 'promotional'
    SYSTEM = 'system'
    CUSTOM = 'custom'
    HOTSPOT_WELCOME = 'hotspot_welcome'
    CREDENTIALS_RESEND = 'credentials_resend'
    TIER_UPGRADE = 'tier_upgrade'
    COMMISSION_PAYOUT = 'commission_payout'


class AutomationRuleType(Enum):
    PPPOE_CREATION = 'pppoe_creation'
    HOTSPOT_CREATION = 'hotspot_creation'
    PAYMENT_REMINDER = 'payment_reminder'
    PLAN_EXPIRY = 'plan_expiry'
    WELCOME = 'welcome'
    PROMOTION = 'promotion'
    SYSTEM_ALERT = 'system_alert'
    TIER_CHANGE = 'tier_change'
    COMMISSION_EARNED = 'commission_earned'


class SMSGatewayConfig(models.Model):
    """SMS Gateway Configuration with comprehensive settings"""
    
    class GatewayChoices(models.TextChoices):
        AFRICAS_TALKING = 'africas_talking', "Africa's Talking"
        TWILIO = 'twilio', 'Twilio'
        SMPP = 'smpp', 'SMPP Gateway'
        CUSTOM_API = 'custom', 'Custom API'
    
    # Basic Info
    name = models.CharField(max_length=100, unique=True, help_text="Gateway name for identification")
    gateway_type = models.CharField(max_length=20, choices=GatewayChoices.choices)
    is_default = models.BooleanField(default=False, help_text="Use as default gateway")
    is_active = models.BooleanField(default=True)
    weight = models.IntegerField(default=1, help_text="Load balancing weight (higher = more traffic)")
    
    # API Configuration
    api_key = models.CharField(max_length=255, blank=True, help_text="API Key/Username")
    api_secret = models.CharField(max_length=255, blank=True, help_text="API Secret/Password")
    api_url = models.URLField(blank=True, help_text="Base API URL")
    sender_id = models.CharField(max_length=20, blank=True, help_text="Sender ID/Short Code")
    
    # Africa's Talking Specific
    shortcode = models.CharField(max_length=20, blank=True, help_text="Shortcode for premium messages")
    
    # SMPP Specific
    smpp_host = models.CharField(max_length=255, blank=True)
    smpp_port = models.IntegerField(default=2775, blank=True, null=True)
    smpp_system_id = models.CharField(max_length=100, blank=True)
    smpp_password = models.CharField(max_length=100, blank=True)
    smpp_system_type = models.CharField(max_length=100, blank=True, default='')
    
    # Rate Limiting & Quotas
    max_messages_per_minute = models.IntegerField(default=60, validators=[MinValueValidator(1)])
    max_messages_per_hour = models.IntegerField(default=1000, validators=[MinValueValidator(1)])
    max_messages_per_day = models.IntegerField(default=10000, validators=[MinValueValidator(1)])
    
    # Cost & Billing
    cost_per_message = models.DecimalField(
        max_digits=8, decimal_places=4, default=0.0,
        help_text="Cost per SMS in local currency"
    )
    currency = models.CharField(max_length=3, default='KES')
    
    # Status Tracking
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    last_balance_check = models.DateTimeField(null=True, blank=True)
    last_used = models.DateTimeField(null=True, blank=True)
    is_online = models.BooleanField(default=True)
    last_online_check = models.DateTimeField(null=True, blank=True)
    
    # Performance Metrics
    total_messages_sent = models.IntegerField(default=0)
    total_messages_failed = models.IntegerField(default=0)
    success_rate = models.DecimalField(max_digits=5, decimal_places=2, default=100.0)
    avg_delivery_time = models.DurationField(null=True, blank=True)
    
    # Configuration Metadata
    config = models.JSONField(default=dict, help_text="Gateway-specific configuration")
    health_check_url = models.URLField(blank=True)
    delivery_report_url = models.URLField(blank=True, help_text="Webhook URL for delivery reports")
    
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'SMS Gateway'
        verbose_name_plural = 'SMS Gateways'
        ordering = ['-is_default', '-weight', 'name']
        indexes = [
            models.Index(fields=['is_active', 'is_default']),
            models.Index(fields=['gateway_type', 'is_active']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.get_gateway_type_display()})"
    
    def save(self, *args, **kwargs):
        # Ensure only one default gateway
        if self.is_default:
            SMSGatewayConfig.objects.filter(is_default=True).exclude(id=self.id).update(is_default=False)
        
        # Clear gateway cache
        cache.delete('sms_gateways')
        super().save(*args, **kwargs)
    
    def get_health_status(self):
        """Get gateway health status"""
        if not self.is_active:
            return 'inactive'
        if not self.is_online:
            return 'offline'
        if self.balance <= 0:
            return 'no_balance'
        if self.success_rate < 80:
            return 'poor_performance'
        return 'healthy'
    
    def update_performance_metrics(self, success, delivery_time=None):
        """Update gateway performance metrics"""
        self.total_messages_sent += 1
        if not success:
            self.total_messages_failed += 1
        
        # Calculate success rate
        total = self.total_messages_sent
        if total > 0:
            self.success_rate = ((total - self.total_messages_failed) / total) * 100
        
        # Update average delivery time
        if delivery_time and success:
            if self.avg_delivery_time:
                # Weighted average (70% old, 30% new)
                self.avg_delivery_time = (self.avg_delivery_time * 0.7) + (delivery_time * 0.3)
            else:
                self.avg_delivery_time = delivery_time
        
        self.save(update_fields=[
            'total_messages_sent', 'total_messages_failed',
            'success_rate', 'avg_delivery_time', 'updated_at'
        ])


class SMSTemplate(models.Model):
    """Dynamic SMS Templates with comprehensive variable support"""
    
    class TemplateChoices(models.TextChoices):
        PPPOE_CREDENTIALS = 'pppoe_credentials', 'PPPoE Credentials'
        WELCOME = 'welcome', 'Welcome Message'
        PAYMENT_REMINDER = 'payment_reminder', 'Payment Reminder'
        PLAN_EXPIRY = 'plan_expiry', 'Plan Expiry Warning'
        PROMOTIONAL = 'promotional', 'Promotional Message'
        SYSTEM = 'system', 'System Notification'
        CUSTOM = 'custom', 'Custom Message'
        HOTSPOT_WELCOME = 'hotspot_welcome', 'Hotspot Welcome'
        CREDENTIALS_RESEND = 'credentials_resend', 'Credentials Resend'
        TIER_UPGRADE = 'tier_upgrade', 'Tier Upgrade Notification'
        COMMISSION_PAYOUT = 'commission_payout', 'Commission Payout'
        ACCOUNT_SUSPENDED = 'account_suspended', 'Account Suspended'
        ACCOUNT_REACTIVATED = 'account_reactivated', 'Account Reactivated'
        DATA_LIMIT_WARNING = 'data_limit_warning', 'Data Limit Warning'
        AUTO_RENEWAL_REMINDER = 'auto_renewal_reminder', 'Auto-renewal Reminder'
        REFERRAL_INVITE = 'referral_invite', 'Referral Invite'
        BIRTHDAY_GREETING = 'birthday_greeting', 'Birthday Greeting'
    
    # Basic Info
    name = models.CharField(max_length=100, unique=True)
    template_type = models.CharField(max_length=30, choices=TemplateChoices.choices)
    language = models.CharField(max_length=10, default='en', help_text="Language code (en, sw, etc.)")
    subject = models.CharField(max_length=200, blank=True, help_text="Optional subject/header")
    
    # Template Content
    message_template = models.TextField(
        help_text="Template with variables. Use {{variable_name}} syntax."
    )
    character_count = models.IntegerField(default=0, editable=False)
    
    # Variables
    variables = models.JSONField(
        default=dict,
        help_text="Available variables with descriptions"
    )
    required_variables = models.JSONField(
        default=list,
        help_text="List of required variables"
    )
    
    # Configuration
    is_active = models.BooleanField(default=True)
    is_system = models.BooleanField(default=False, help_text="System templates cannot be deleted")
    max_length = models.IntegerField(default=160, help_text="Maximum allowed characters")
    allow_unicode = models.BooleanField(default=True, help_text="Allow Unicode characters")
    
    # Usage Tracking
    usage_count = models.IntegerField(default=0, editable=False)
    last_used = models.DateTimeField(null=True, blank=True, editable=False)
    
    # Metadata
    description = models.TextField(blank=True, help_text="Template description and usage notes")
    category = models.CharField(max_length=50, blank=True, help_text="Category for grouping")
    
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_sms_templates'
    )
    
    class Meta:
        verbose_name = 'SMS Template'
        verbose_name_plural = 'SMS Templates'
        ordering = ['template_type', 'name']
        indexes = [
            models.Index(fields=['template_type', 'is_active']),
            models.Index(fields=['language', 'is_active']),
        ]
        unique_together = ['name', 'language']
    
    def __str__(self):
        return f"{self.name} ({self.get_template_type_display()})"
    
    def save(self, *args, **kwargs):
        # Calculate character count
        self.character_count = len(self.message_template)
        
        # Auto-populate variables from template
        if not self.variables:
            self.variables = self._extract_variables()
        
        super().save(*args, **kwargs)
    
    def _extract_variables(self):
        """Extract variables from template"""
        import re
        variables = {}
        pattern = r'{{(\w+)}}'
        
        for match in re.finditer(pattern, self.message_template):
            var_name = match.group(1)
            if var_name not in variables:
                variables[var_name] = {
                    'description': f"Replace with {var_name.replace('_', ' ')}",
                    'required': True,
                    'example': ''
                }
        
        return variables
    
    def render(self, context, strict=False):
        """Render template with context"""
        try:
            message = self.message_template
            
            for key, value in context.items():
                placeholder = f'{{{{{key}}}}}'
                if placeholder in message:
                    message = message.replace(placeholder, str(value))
            
            # Check for missing required variables
            if strict:
                import re
                remaining_vars = re.findall(r'{{(\w+)}}', message)
                if remaining_vars and any(var in self.required_variables for var in remaining_vars):
                    missing = [var for var in remaining_vars if var in self.required_variables]
                    raise ValueError(f"Missing required variables: {', '.join(missing)}")
            
            # Clean up any unreplaced variables
            import re
            message = re.sub(r'{{(\w+)}}', '', message)
            
            # Update usage stats
            self.usage_count += 1
            self.last_used = timezone.now()
            self.save(update_fields=['usage_count', 'last_used', 'updated_at'])
            
            return message.strip()
            
        except Exception as e:
            logger.error(f"Error rendering template {self.name}: {str(e)}")
            raise
    
    def is_compatible_with_context(self, context):
        """Check if context has all required variables"""
        if not self.required_variables:
            return True
        
        return all(var in context for var in self.required_variables)


class SMSMessage(models.Model):
    """Complete SMS Message tracking with delivery analytics"""
    
    class StatusChoices(models.TextChoices):
        PENDING = 'pending', 'Pending'
        QUEUED = 'queued', 'Queued for Sending'
        SENDING = 'sending', 'Sending to Gateway'
        SENT = 'sent', 'Sent to Gateway'
        DELIVERED = 'delivered', 'Delivered to Recipient'
        FAILED = 'failed', 'Failed to Send'
        CANCELLED = 'cancelled', 'Cancelled'
        EXPIRED = 'expired', 'Expired'
        REJECTED = 'rejected', 'Rejected by Gateway'
    
    class PriorityChoices(models.TextChoices):
        LOW = 'low', 'Low (Background)'
        NORMAL = 'normal', 'Normal'
        HIGH = 'high', 'High (Important)'
        URGENT = 'urgent', 'Urgent (Critical)'
    
    # Identification
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Recipient Information
    phone_number = models.CharField(max_length=20, db_index=True)
    phone_formatted = models.CharField(max_length=20, blank=True, editable=False)
    recipient_name = models.CharField(max_length=100, blank=True)
    
    # Client Reference (Linked to User Management)
    client = models.ForeignKey(
        ClientProfile,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='sms_messages',
        help_text="Linked client from user management"
    )
    
    # Message Content
    template = models.ForeignKey(
        SMSTemplate,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='messages'
    )
    original_template = models.TextField(blank=True, help_text="Original template content")
    
    message = models.TextField()
    message_encoded = models.TextField(blank=True, editable=False, help_text="Base64 encoded for special characters")
    character_count = models.IntegerField(default=0, editable=False)
    message_parts = models.IntegerField(default=1, editable=False)
    
    # Sending Configuration
    gateway = models.ForeignKey(
        SMSGatewayConfig,
        on_delete=models.SET_NULL,
        null=True,
        related_name='messages',
        help_text="Gateway used for sending"
    )
    priority = models.CharField(max_length=10, choices=PriorityChoices.choices, default='normal')
    scheduled_for = models.DateTimeField(null=True, blank=True, db_index=True)
    expires_at = models.DateTimeField(null=True, blank=True, help_text="Message expiry time")
    
    # Status Tracking
    status = models.CharField(max_length=10, choices=StatusChoices.choices, default='pending', db_index=True)
    status_message = models.TextField(blank=True, help_text="Detailed status/error message")
    status_history = models.JSONField(default=list, editable=False, help_text="Status change history")
    
    # Delivery Tracking
    sent_at = models.DateTimeField(null=True, blank=True, db_index=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    gateway_message_id = models.CharField(max_length=255, blank=True, db_index=True)
    gateway_response = models.JSONField(default=dict, blank=True)
    
    # Delivery Analytics
    delivery_attempts = models.IntegerField(default=0, editable=False)
    delivery_latency = models.DurationField(null=True, blank=True, help_text="Time from sent to delivered")
    delivery_confirmations = models.JSONField(default=list, blank=True, help_text="Delivery confirmations from gateway")
    
    # Cost Tracking
    cost = models.DecimalField(max_digits=10, decimal_places=4, null=True, blank=True)
    currency = models.CharField(max_length=3, default='KES')
    
    # Retry Logic
    retry_count = models.IntegerField(default=0)
    max_retries = models.IntegerField(default=3)
    next_retry_at = models.DateTimeField(null=True, blank=True)
    retry_strategy = models.JSONField(default=dict, blank=True, help_text="Retry configuration")
    
    # Metadata
    source = models.CharField(max_length=100, default='system', db_index=True)
    source_module = models.CharField(max_length=50, blank=True, help_text="Module that triggered the SMS")
    reference_id = models.CharField(max_length=100, blank=True, db_index=True, help_text="External reference ID")
    correlation_id = models.UUIDField(null=True, blank=True, help_text="For grouping related messages")
    
    # User Context
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_sms_messages'
    )
    sent_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='sent_sms_messages'
    )
    
    # Context Data
    context_data = models.JSONField(default=dict, blank=True, help_text="Context used for template rendering")
    metadata = models.JSONField(default=dict, blank=True, help_text="Additional metadata")
    
    # Audit Fields
    created_at = models.DateTimeField(default=timezone.now, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'SMS Message'
        verbose_name_plural = 'SMS Messages'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['phone_number', 'status']),
            models.Index(fields=['scheduled_for', 'status']),
            models.Index(fields=['status', 'priority']),
            models.Index(fields=['client', 'created_at']),
            models.Index(fields=['gateway_message_id']),
            models.Index(fields=['reference_id']),
            models.Index(fields=['correlation_id']),
            models.Index(fields=['source', 'created_at']),
        ]
    
    def __str__(self):
        return f"SMS to {self.phone_number} ({self.get_status_display()})"
    
    def save(self, *args, **kwargs):
        # Format phone number
        if self.phone_number and not self.phone_formatted:
            self.phone_formatted = self._format_phone_number()
        
        # Calculate character count and parts
        if self.message:
            self.character_count = len(self.message)
            self.message_parts = self._calculate_message_parts()
        
        # Set expiry if not set (default 7 days)
        if not self.expires_at and not self.sent_at:
            self.expires_at = timezone.now() + timezone.timedelta(days=7)
        
        super().save(*args, **kwargs)
    
    def _format_phone_number(self):
        """Format phone number to E.164"""
        import re
        cleaned = re.sub(r'\D', '', self.phone_number)
        
        if cleaned.startswith('0') and len(cleaned) == 10:
            return f"254{cleaned[1:]}"
        elif len(cleaned) == 9:
            return f"254{cleaned}"
        elif cleaned.startswith('254') and len(cleaned) == 12:
            return cleaned
        else:
            return cleaned
    
    def _calculate_message_parts(self):
        """Calculate number of SMS parts"""
        char_count = len(self.message)
        if char_count <= 160:
            return 1
        elif char_count <= 306:
            return 2
        else:
            # 153 characters per part after first part
            return 1 + ((char_count - 306) // 153) + (1 if (char_count - 306) % 153 > 0 else 0)
    
    def can_send(self):
        """Check if message can be sent"""
        now = timezone.now()
        
        if self.status in [self.StatusChoices.SENT, self.StatusChoices.DELIVERED,
                          self.StatusChoices.CANCELLED, self.StatusChoices.EXPIRED]:
            return False
        
        if self.expires_at and self.expires_at < now:
            self.status = self.StatusChoices.EXPIRED
            self.save()
            return False
        
        if self.scheduled_for and self.scheduled_for > now:
            return False
        
        if self.retry_count >= self.max_retries:
            return False
        
        return True
    
    def update_status(self, new_status, message=None, gateway_data=None):
        """Update message status with history tracking"""
        old_status = self.status
        self.status = new_status
        
        # Set timestamps
        now = timezone.now()
        if new_status == self.StatusChoices.SENT:
            self.sent_at = now
        elif new_status == self.StatusChoices.DELIVERED:
            self.delivered_at = now
            if self.sent_at:
                self.delivery_latency = now - self.sent_at
        
        # Update status message
        if message:
            self.status_message = message[:500]
        
        # Store gateway data
        if gateway_data:
            if not self.gateway_response:
                self.gateway_response = {}
            self.gateway_response.update(gateway_data)
        
        # Add to history
        self.status_history.append({
            'timestamp': now.isoformat(),
            'old_status': old_status,
            'new_status': new_status,
            'message': message,
            'gateway_data': gateway_data
        })
        
        self.save()
        logger.info(f"SMS {self.id} status changed: {old_status} -> {new_status}")
    
    def mark_as_sent(self, gateway_message_id=None, gateway_data=None):
        """Mark message as sent"""
        self.update_status(self.StatusChoices.SENT, "Message sent to gateway", gateway_data)
        if gateway_message_id:
            self.gateway_message_id = gateway_message_id
            self.save()
    
    def mark_as_delivered(self, gateway_data=None):
        """Mark message as delivered"""
        self.update_status(self.StatusChoices.DELIVERED, "Message delivered to recipient", gateway_data)
    
    def mark_as_failed(self, error_message, gateway_data=None, retry=True):
        """Mark message as failed with retry logic"""
        self.delivery_attempts += 1
        self.retry_count += 1
        
        if retry and self.retry_count < self.max_retries:
            # Schedule retry with exponential backoff
            import random
            backoff = min(3600, (2 ** self.retry_count) * 300 + random.randint(0, 60))
            self.next_retry_at = timezone.now() + timezone.timedelta(seconds=backoff)
            new_status = self.StatusChoices.PENDING
            error_message = f"Failed, retry {self.retry_count}/{self.max_retries}: {error_message}"
        else:
            new_status = self.StatusChoices.FAILED
            error_message = f"Failed permanently: {error_message}"
        
        self.update_status(new_status, error_message, gateway_data)
    
    def get_estimated_cost(self):
        """Get estimated cost based on message parts and gateway cost"""
        if self.gateway and self.gateway.cost_per_message:
            return self.message_parts * self.gateway.cost_per_message
        return None
    
    def to_dict(self):
        """Convert to dictionary for serialization"""
        return {
            'id': str(self.id),
            'phone_number': self.phone_number,
            'recipient_name': self.recipient_name,
            'message': self.message,
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'sent_at': self.sent_at.isoformat() if self.sent_at else None,
            'delivered_at': self.delivered_at.isoformat() if self.delivered_at else None,
            'cost': str(self.cost) if self.cost else None,
            'gateway': self.gateway.name if self.gateway else None
        }


class SMSDeliveryLog(models.Model):
    """Detailed delivery logs for auditing and analytics"""
    
    message = models.ForeignKey(SMSMessage, on_delete=models.CASCADE, related_name='delivery_logs')
    
    # Gateway Information
    gateway = models.ForeignKey(
        SMSGatewayConfig,
        on_delete=models.SET_NULL,
        null=True,
        related_name='delivery_logs'
    )
    gateway_transaction_id = models.CharField(max_length=255, blank=True)
    
    # Status Change
    old_status = models.CharField(max_length=10)
    new_status = models.CharField(max_length=10)
    
    # Gateway Response
    gateway_response = models.JSONField(default=dict, blank=True)
    gateway_status_code = models.CharField(max_length=50, blank=True)
    gateway_status_message = models.TextField(blank=True)
    
    # Error Tracking
    error_type = models.CharField(max_length=50, blank=True, help_text="Error category")
    error_code = models.CharField(max_length=100, blank=True)
    error_message = models.TextField(blank=True)
    error_details = models.JSONField(default=dict, blank=True)
    
    # Network Metrics
    response_time_ms = models.IntegerField(null=True, blank=True, help_text="Gateway response time in ms")
    network_latency_ms = models.IntegerField(null=True, blank=True)
    
    # Cost Tracking
    cost = models.DecimalField(max_digits=10, decimal_places=4, null=True, blank=True)
    currency = models.CharField(max_length=3, default='KES')
    
    # Location Data (if available)
    operator = models.CharField(max_length=100, blank=True, help_text="Mobile network operator")
    country_code = models.CharField(max_length=3, blank=True)
    
    # Timestamps
    event_time = models.DateTimeField(default=timezone.now)
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        verbose_name = 'SMS Delivery Log'
        verbose_name_plural = 'SMS Delivery Logs'
        ordering = ['-event_time']
        indexes = [
            models.Index(fields=['message', 'event_time']),
            models.Index(fields=['gateway', 'event_time']),
            models.Index(fields=['new_status', 'event_time']),
            models.Index(fields=['error_type', 'event_time']),
        ]
    
    def __str__(self):
        return f"Delivery log for SMS {self.message_id}: {self.old_status}→{self.new_status}"
    
    @classmethod
    def log_status_change(cls, message, old_status, new_status, gateway_data=None, error=None):
        """Create a delivery log entry"""
        log = cls.objects.create(
            message=message,
            gateway=message.gateway,
            old_status=old_status,
            new_status=new_status,
            event_time=timezone.now()
        )
        
        if gateway_data:
            log.gateway_response = gateway_data.get('response', {})
            log.gateway_status_code = gateway_data.get('status_code', '')
            log.gateway_status_message = gateway_data.get('status_message', '')
            log.gateway_transaction_id = gateway_data.get('transaction_id', '')
            log.response_time_ms = gateway_data.get('response_time_ms')
            log.network_latency_ms = gateway_data.get('network_latency_ms')
            log.cost = gateway_data.get('cost')
            log.operator = gateway_data.get('operator', '')
            log.country_code = gateway_data.get('country_code', '')
        
        if error:
            log.error_type = error.get('type', '')
            log.error_code = error.get('code', '')
            log.error_message = error.get('message', '')
            log.error_details = error.get('details', {})
        
        log.save()
        return log


class SMSAutomationRule(models.Model):
    """Automation rules for triggering SMS based on events"""
    
    class RuleChoices(models.TextChoices):
        PPPOE_CREATION = 'pppoe_creation', 'On PPPoE Client Creation'
        HOTSPOT_CREATION = 'hotspot_creation', 'On Hotspot Client Creation'
        PAYMENT_SUCCESS = 'payment_success', 'On Payment Success'
        PAYMENT_FAILED = 'payment_failed', 'On Payment Failed'
        PAYMENT_REMINDER = 'payment_reminder', 'Payment Reminder (Scheduled)'
        PLAN_EXPIRY = 'plan_expiry', 'Plan Expiry Warning'
        WELCOME = 'welcome', 'Welcome Message'
        PROMOTION = 'promotion', 'Promotional Campaign'
        SYSTEM_ALERT = 'system_alert', 'System Alert'
        TIER_UPGRADE = 'tier_upgrade', 'On Tier Upgrade'
        TIER_DOWNGRADE = 'tier_downgrade', 'On Tier Downgrade'
        COMMISSION_EARNED = 'commission_earned', 'On Commission Earned'
        COMMISSION_PAID = 'commission_paid', 'On Commission Paid'
        ACCOUNT_SUSPENDED = 'account_suspended', 'On Account Suspension'
        ACCOUNT_REACTIVATED = 'account_reactivated', 'On Account Reactivation'
        DATA_LIMIT_WARNING = 'data_limit_warning', 'Data Limit Warning'
        AUTO_RENEWAL_REMINDER = 'auto_renewal_reminder', 'Auto-renewal Reminder'
        BIRTHDAY_GREETING = 'birthday_greeting', 'Birthday Greeting'
        CUSTOM_EVENT = 'custom_event', 'Custom Event'
    
    # Basic Info
    name = models.CharField(max_length=100, unique=True)
    rule_type = models.CharField(max_length=30, choices=RuleChoices.choices)
    description = models.TextField(blank=True)
    
    # Activation
    is_active = models.BooleanField(default=True)
    enabled_from = models.DateTimeField(null=True, blank=True, help_text="Rule active from date")
    enabled_until = models.DateTimeField(null=True, blank=True, help_text="Rule active until date")
    
    # Template & Message
    template = models.ForeignKey(
        SMSTemplate,
        on_delete=models.CASCADE,
        related_name='automation_rules',
        help_text="Template to use for messages"
    )
    fallback_message = models.TextField(blank=True, help_text="Fallback message if template fails")
    
    # Conditions & Filters
    conditions = models.JSONField(
        default=dict,
        help_text="JSON conditions for rule execution"
    )
    filters = models.JSONField(
        default=dict,
        help_text="Filters for target clients"
    )
    
    # Scheduling
    delay_minutes = models.IntegerField(
        default=0,
        help_text="Delay after trigger in minutes"
    )
    schedule_cron = models.CharField(
        max_length=50,
        blank=True,
        help_text="Cron expression for scheduled rules"
    )
    time_window_start = models.TimeField(
        null=True,
        blank=True,
        help_text="Start time for sending window"
    )
    time_window_end = models.TimeField(
        null=True,
        blank=True,
        help_text="End time for sending window"
    )
    
    # Rate Limiting
    max_messages_per_day = models.IntegerField(default=1000)
    max_messages_per_client = models.IntegerField(default=10, help_text="Max messages per client per day")
    cool_down_hours = models.IntegerField(default=24, help_text="Hours between messages for same client")
    
    # Execution Tracking
    execution_count = models.IntegerField(default=0, editable=False)
    last_executed = models.DateTimeField(null=True, blank=True, editable=False)
    success_count = models.IntegerField(default=0, editable=False)
    failure_count = models.IntegerField(default=0, editable=False)
    
    # Configuration
    priority = models.CharField(
        max_length=10,
        choices=SMSMessage.PriorityChoices.choices,
        default='normal'
    )
    gateway_override = models.ForeignKey(
        SMSGatewayConfig,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        help_text="Override default gateway"
    )
    
    # Metadata
    tags = models.JSONField(default=list, blank=True, help_text="Tags for categorization")
    metadata = models.JSONField(default=dict, blank=True)
    
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_sms_rules'
    )
    
    class Meta:
        verbose_name = 'SMS Automation Rule'
        verbose_name_plural = 'SMS Automation Rules'
        ordering = ['name']
        indexes = [
            models.Index(fields=['rule_type', 'is_active']),
            models.Index(fields=['is_active', 'enabled_from', 'enabled_until']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.get_rule_type_display()})"
    
    def is_active_now(self):
        """Check if rule is currently active"""
        now = timezone.now()
        
        if not self.is_active:
            return False
        
        if self.enabled_from and now < self.enabled_from:
            return False
        
        if self.enabled_until and now > self.enabled_until:
            return False
        
        # Check time window
        if self.time_window_start and self.time_window_end:
            current_time = now.time()
            if not (self.time_window_start <= current_time <= self.time_window_end):
                return False
        
        return True
    
    def can_send_to_client(self, client):
        """Check if we can send to this client based on rate limits"""
        from django.db.models import Count
        from django.utils import timezone
        from datetime import timedelta
        
        # Check daily limit per client
        today = timezone.now().date()
        today_count = SMSMessage.objects.filter(
            client=client,
            source=f"rule_{self.id}",
            created_at__date=today
        ).count()
        
        if today_count >= self.max_messages_per_client:
            return False
        
        # Check cooldown
        last_message = SMSMessage.objects.filter(
            client=client,
            source=f"rule_{self.id}"
        ).order_by('-created_at').first()
        
        if last_message:
            cooldown_end = last_message.created_at + timedelta(hours=self.cool_down_hours)
            if timezone.now() < cooldown_end:
                return False
        
        return True
    
    def execute(self, context, client=None, trigger_event=None):
        """Execute rule with given context"""
        from sms_automation.services.sms_service import SMSService
        
        if not self.is_active_now():
            return None
        
        # Apply filters
        if client and not self._passes_filters(client):
            return None
        
        # Check rate limits
        if client and not self.can_send_to_client(client):
            return None
        
        try:
            # Render template
            message = self.template.render(context, strict=True)
        except Exception as e:
            logger.warning(f"Template render failed for rule {self.name}: {e}")
            if self.fallback_message:
                message = self.fallback_message
            else:
                self.failure_count += 1
                self.save()
                return None
        
        # Create SMS message
        sms_service = SMSService()
        
        sms_data = {
            'phone_number': context.get('phone_number'),
            'message': message,
            'recipient_name': context.get('client_name', ''),
            'template': self.template,
            'priority': self.priority,
            'source': f"rule_{self.id}",
            'reference_id': f"{trigger_event}_{timezone.now().timestamp()}",
            'context_data': context,
            'metadata': {
                'rule_id': str(self.id),
                'rule_name': self.name,
                'trigger_event': trigger_event
            }
        }
        
        if client:
            sms_data['client'] = client
        
        if self.gateway_override:
            sms_data['gateway'] = self.gateway_override
        
        # Apply delay if specified
        if self.delay_minutes > 0:
            sms_data['scheduled_for'] = timezone.now() + timedelta(minutes=self.delay_minutes)
        
        try:
            sms = sms_service.create_sms_message(**sms_data)
            
            # Update execution stats
            self.execution_count += 1
            self.success_count += 1
            self.last_executed = timezone.now()
            self.save()
            
            return sms
            
        except Exception as e:
            logger.error(f"Failed to execute rule {self.name}: {e}")
            self.failure_count += 1
            self.save()
            return None
    
    def _passes_filters(self, client):
        """Check if client passes rule filters"""
        filters = self.filters
        
        if not filters:
            return True
        
        # Check client type
        if 'client_type' in filters and client.client_type not in filters['client_type']:
            return False
        
        # Check connection type
        if 'connection_type' in filters:
            expected = filters['connection_type']
            actual = 'pppoe' if client.is_pppoe_client else 'hotspot'
            if actual not in expected:
                return False
        
        # Check tier
        if 'tier' in filters and client.tier not in filters['tier']:
            return False
        
        # Check status
        if 'status' in filters and client.status not in filters['status']:
            return False
        
        # Check revenue segment
        if 'revenue_segment' in filters and client.revenue_segment not in filters['revenue_segment']:
            return False
        
        # Check usage pattern
        if 'usage_pattern' in filters and client.usage_pattern not in filters['usage_pattern']:
            return False
        
        # Check days active
        if 'min_days_active' in filters and client.days_active < filters['min_days_active']:
            return False
        
        if 'max_days_active' in filters and client.days_active > filters['max_days_active']:
            return False
        
        # Check churn risk
        if 'max_churn_risk' in filters and client.churn_risk_score > filters['max_churn_risk']:
            return False
        
        return True


class SMSQueue(models.Model):
    """Queue for managing SMS sending with priority"""
    
    class QueueStatus(models.TextChoices):
        PENDING = 'pending', 'Pending'
        PROCESSING = 'processing', 'Processing'
        COMPLETED = 'completed', 'Completed'
        FAILED = 'failed', 'Failed'
    
    message = models.OneToOneField(
        SMSMessage,
        on_delete=models.CASCADE,
        related_name='queue_entry'
    )
    
    priority = models.IntegerField(
        default=0,
        help_text="Higher number = higher priority"
    )
    status = models.CharField(
        max_length=20,
        choices=QueueStatus.choices,
        default='pending'
    )
    
    # Processing info
    processing_started = models.DateTimeField(null=True, blank=True)
    processing_ended = models.DateTimeField(null=True, blank=True)
    processing_attempts = models.IntegerField(default=0)
    max_processing_attempts = models.IntegerField(default=3)
    
    # Queue management
    queue_position = models.IntegerField(default=0, editable=False)
    queued_at = models.DateTimeField(default=timezone.now)
    
    # Error tracking
    error_message = models.TextField(blank=True)
    last_error_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-priority', 'queued_at']
        indexes = [
            models.Index(fields=['status', 'priority', 'queued_at']),
            models.Index(fields=['message']),
        ]
    
    def __str__(self):
        return f"Queue entry for SMS {self.message_id} (Priority: {self.priority})"
    
    def mark_as_processing(self):
        """Mark as being processed"""
        self.status = self.QueueStatus.PROCESSING
        self.processing_started = timezone.now()
        self.processing_attempts += 1
        self.save()
    
    def mark_as_completed(self):
        """Mark as completed"""
        self.status = self.QueueStatus.COMPLETED
        self.processing_ended = timezone.now()
        self.save()
    
    def mark_as_failed(self, error_message):
        """Mark as failed"""
        self.status = self.QueueStatus.FAILED
        self.processing_ended = timezone.now()
        self.error_message = error_message[:500]
        self.last_error_at = timezone.now()
        self.save()


class SMSAnalytics(models.Model):
    """Aggregated analytics for performance monitoring"""
    
    date = models.DateField(unique=True, db_index=True)
    
    # Volume Metrics
    total_messages = models.IntegerField(default=0)
    sent_messages = models.IntegerField(default=0)
    delivered_messages = models.IntegerField(default=0)
    failed_messages = models.IntegerField(default=0)
    pending_messages = models.IntegerField(default=0)
    
    # Performance Metrics
    delivery_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    avg_delivery_time_seconds = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    success_rate = models.DecimalField(max_digits=5, decimal_places=2, default=100.0)
    
    # Gateway Metrics
    gateway_metrics = models.JSONField(default=dict, help_text="Metrics by gateway")
    
    # Cost Metrics
    total_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    avg_cost_per_message = models.DecimalField(max_digits=8, decimal_places=4, default=0.0)
    
    # Template Metrics
    template_metrics = models.JSONField(default=dict, help_text="Usage by template")
    
    # Client Metrics
    client_metrics = models.JSONField(default=dict, help_text="Metrics by client segment")
    
    # Peak Hours
    peak_hour = models.IntegerField(null=True, blank=True, help_text="Hour with most messages (0-23)")
    messages_at_peak = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'SMS Analytics'
        verbose_name_plural = 'SMS Analytics'
        ordering = ['-date']
        indexes = [
            models.Index(fields=['date']),
        ]
    
    def __str__(self):
        return f"SMS Analytics for {self.date}"
    
    @classmethod
    def update_daily_analytics(cls, date=None):
        """Update or create daily analytics"""
        from django.db.models import Count, Avg, Sum, Q
        from django.utils import timezone
        
        if not date:
            date = timezone.now().date()
        
        # Get messages for date
        messages = SMSMessage.objects.filter(created_at__date=date)
        
        # Calculate metrics
        total = messages.count()
        sent = messages.filter(status='sent').count()
        delivered = messages.filter(status='delivered').count()
        failed = messages.filter(status='failed').count()
        pending = messages.filter(status__in=['pending', 'scheduled']).count()
        
        delivery_rate = 0
        if sent > 0:
            delivery_rate = (delivered / sent) * 100
        
        # Calculate average delivery time
        delivered_messages = messages.filter(status='delivered', delivery_latency__isnull=False)
        avg_delivery_time = delivered_messages.aggregate(
            avg=Avg('delivery_latency')
        )['avg']
        
        avg_delivery_seconds = avg_delivery_time.total_seconds() if avg_delivery_time else 0
        
        # Calculate success rate
        success_rate = 100.0
        if total > 0:
            success_rate = ((sent + delivered) / total) * 100
        
        # Gateway metrics
        gateway_metrics = {}
        gateways = messages.filter(gateway__isnull=False).values('gateway__name').annotate(
            total=Count('id'),
            sent=Count('id', filter=Q(status='sent')),
            delivered=Count('id', filter=Q(status='delivered')),
            failed=Count('id', filter=Q(status='failed')),
            cost=Sum('cost')
        )
        
        for gw in gateways:
            gateway_metrics[gw['gateway__name']] = {
                'total': gw['total'],
                'sent': gw['sent'],
                'delivered': gw['delivered'],
                'failed': gw['failed'],
                'cost': float(gw['cost'] or 0.0),
                'success_rate': (gw['sent'] / gw['total'] * 100) if gw['total'] > 0 else 0
            }
        
        # Template metrics
        template_metrics = {}
        templates = messages.filter(template__isnull=False).values('template__name').annotate(
            count=Count('id')
        )
        
        for tmpl in templates:
            template_metrics[tmpl['template__name']] = tmpl['count']
        
        # Find peak hour
        peak_hour_data = messages.extra(
            select={'hour': "EXTRACT(HOUR FROM created_at)"}
        ).values('hour').annotate(
            count=Count('id')
        ).order_by('-count').first()
        
        peak_hour = peak_hour_data['hour'] if peak_hour_data else None
        messages_at_peak = peak_hour_data['count'] if peak_hour_data else 0
        
        # Cost metrics
        cost_data = messages.aggregate(
            total_cost=Sum('cost'),
            message_count=Count('id', filter=Q(cost__isnull=False))
        )
        
        total_cost = cost_data['total_cost'] or 0.0
        avg_cost = 0.0
        if cost_data['message_count'] > 0:
            avg_cost = total_cost / cost_data['message_count']
        
        # Create or update analytics
        analytics, created = cls.objects.update_or_create(
            date=date,
            defaults={
                'total_messages': total,
                'sent_messages': sent,
                'delivered_messages': delivered,
                'failed_messages': failed,
                'pending_messages': pending,
                'delivery_rate': delivery_rate,
                'avg_delivery_time_seconds': avg_delivery_seconds,
                'success_rate': success_rate,
                'gateway_metrics': gateway_metrics,
                'template_metrics': template_metrics,
                'peak_hour': peak_hour,
                'messages_at_peak': messages_at_peak,
                'total_cost': total_cost,
                'avg_cost_per_message': avg_cost
            }
        )
        
        return analytics