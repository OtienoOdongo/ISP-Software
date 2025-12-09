"""
SMS Automation Serializers
Production-ready serializers for SMS automation models
"""
from rest_framework import serializers
from django.utils import timezone
from datetime import timedelta
import logging

from user_management.models.sms_automation_model import (
    SMSGatewayConfig, SMSTemplate, SMSMessage,
    SMSDeliveryLog, SMSAutomationRule
)

logger = logging.getLogger(__name__)


class BaseSMSerializer(serializers.ModelSerializer):
    """Base serializer with common functionality"""
    
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['_meta'] = {
            'timestamp': timezone.now().isoformat(),
            'version': '1.0.0'
        }
        return representation


class SMSGatewayConfigSerializer(BaseSMSerializer):
    """Serializer for SMS Gateway Configuration"""
    
    gateway_type_display = serializers.CharField(source='get_gateway_type_display', read_only=True)
    status = serializers.SerializerMethodField()
    balance_formatted = serializers.SerializerMethodField()
    last_used_formatted = serializers.SerializerMethodField()
    
    class Meta:
        model = SMSGatewayConfig
        fields = [
            'id', 'name', 'gateway_type', 'gateway_type_display',
            'is_default', 'is_active', 'status',
            'api_key', 'api_secret', 'api_url', 'sender_id',
            'max_messages_per_minute', 'max_messages_per_day',
            'balance', 'balance_formatted',
            'last_checked', 'last_used', 'last_used_formatted',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'last_checked', 'last_used']
        extra_kwargs = {
            'api_key': {'write_only': True},
            'api_secret': {'write_only': True}
        }
    
    def get_status(self, obj):
        """Get gateway status"""
        if not obj.is_active:
            return 'inactive'
        if obj.balance <= 0:
            return 'no_balance'
        return 'active'
    
    def get_balance_formatted(self, obj):
        return f"KES {obj.balance:,.2f}"
    
    def get_last_used_formatted(self, obj):
        if obj.last_used:
            return obj.last_used.strftime('%Y-%m-%d %H:%M')
        return 'Never used'
    
    def validate(self, data):
        """Validate gateway configuration"""
        if data.get('is_default'):
            # Check if another default exists
            existing_default = SMSGatewayConfig.objects.filter(is_default=True).first()
            if existing_default and existing_default.id != self.instance.id:
                data['is_default'] = False
        
        # Validate API credentials based on gateway type
        gateway_type = data.get('gateway_type', self.instance.gateway_type if self.instance else None)
        
        if gateway_type == 'africas_talking':
            if not data.get('api_key') and not self.instance:
                raise serializers.ValidationError({
                    'api_key': 'API key is required for Africa\'s Talking'
                })
        
        elif gateway_type == 'twilio':
            if not data.get('api_key') and not self.instance:
                raise serializers.ValidationError({
                    'api_key': 'Account SID is required for Twilio'
                })
            if not data.get('api_secret') and not self.instance:
                raise serializers.ValidationError({
                    'api_secret': 'Auth Token is required for Twilio'
                })
        
        elif gateway_type == 'custom':
            if not data.get('api_url') and not self.instance:
                raise serializers.ValidationError({
                    'api_url': 'API URL is required for custom gateway'
                })
        
        return data


class SMSTemplateSerializer(BaseSMSerializer):
    """Serializer for SMS Templates"""
    
    template_type_display = serializers.CharField(source='get_template_type_display', read_only=True)
    variables_list = serializers.SerializerMethodField()
    usage_count = serializers.SerializerMethodField()
    
    class Meta:
        model = SMSTemplate
        fields = [
            'id', 'name', 'template_type', 'template_type_display',
            'subject', 'message_template', 'variables', 'variables_list',
            'is_active', 'usage_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_variables_list(self, obj):
        """Get list of available variables"""
        if isinstance(obj.variables, dict):
            return list(obj.variables.keys())
        return []
    
    def get_usage_count(self, obj):
        """Get count of messages sent with this template"""
        return obj.messages.count()
    
    def validate_message_template(self, value):
        """Validate template contains required variables"""
        # Check for common required variables
        if '{client_name}' not in value:
            raise serializers.ValidationError(
                "Template should contain {client_name} variable"
            )
        return value


class SMSMessageSerializer(BaseSMSerializer):
    """Serializer for SMS Messages"""
    
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    gateway_name = serializers.CharField(source='gateway.name', read_only=True)
    template_name = serializers.CharField(source='template.name', read_only=True, allow_null=True)
    client_name = serializers.SerializerMethodField()
    phone_formatted = serializers.SerializerMethodField()
    sent_at_formatted = serializers.SerializerMethodField()
    delivered_at_formatted = serializers.SerializerMethodField()
    scheduled_for_formatted = serializers.SerializerMethodField()
    created_at_formatted = serializers.SerializerMethodField()
    can_retry = serializers.SerializerMethodField()
    time_ago = serializers.SerializerMethodField()
    
    class Meta:
        model = SMSMessage
        fields = [
            'id', 'phone_number', 'phone_formatted',
            'recipient_name', 'client', 'client_name',
            'template', 'template_name',
            'message', 'original_message',
            'gateway', 'gateway_name',
            'priority', 'priority_display',
            'scheduled_for', 'scheduled_for_formatted',
            'status', 'status_display', 'status_message',
            'sent_at', 'sent_at_formatted',
            'delivered_at', 'delivered_at_formatted',
            'message_id', 'delivery_report',
            'retry_count', 'max_retries', 'next_retry_at',
            'can_retry',
            'source', 'reference_id', 'metadata',
            'created_at', 'created_at_formatted', 'time_ago',
            'updated_at'
        ]
        read_only_fields = [
            'created_at', 'updated_at', 'sent_at', 'delivered_at',
            'message_id', 'delivery_report', 'retry_count', 'next_retry_at'
        ]
    
    def get_client_name(self, obj):
        if obj.client:
            return obj.client.username
        return obj.recipient_name or 'Unknown'
    
    def get_phone_formatted(self, obj):
        """Format phone number for display"""
        phone = obj.phone_number
        if phone.startswith('254'):
            return f"+{phone}"
        elif phone.startswith('0'):
            return f"+254{phone[1:]}"
        return phone
    
    def get_sent_at_formatted(self, obj):
        if obj.sent_at:
            return obj.sent_at.strftime('%Y-%m-%d %H:%M:%S')
        return None
    
    def get_delivered_at_formatted(self, obj):
        if obj.delivered_at:
            return obj.delivered_at.strftime('%Y-%m-%d %H:%M:%S')
        return None
    
    def get_scheduled_for_formatted(self, obj):
        if obj.scheduled_for:
            return obj.scheduled_for.strftime('%Y-%m-%d %H:%M:%S')
        return None
    
    def get_created_at_formatted(self, obj):
        return obj.created_at.strftime('%Y-%m-%d %H:%M:%S')
    
    def get_can_retry(self, obj):
        """Check if message can be retried"""
        return obj.status == 'failed' and obj.retry_count < obj.max_retries
    
    def get_time_ago(self, obj):
        """Get human-readable time ago"""
        delta = timezone.now() - obj.created_at
        
        if delta.days > 365:
            years = delta.days // 365
            return f"{years} year{'s' if years > 1 else ''} ago"
        elif delta.days > 30:
            months = delta.days // 30
            return f"{months} month{'s' if months > 1 else ''} ago"
        elif delta.days > 0:
            return f"{delta.days} day{'s' if delta.days > 1 else ''} ago"
        elif delta.seconds >= 3600:
            hours = delta.seconds // 3600
            return f"{hours} hour{'s' if hours > 1 else ''} ago"
        elif delta.seconds >= 60:
            minutes = delta.seconds // 60
            return f"{minutes} minute{'s' if minutes > 1 else ''} ago"
        else:
            return "Just now"
    
    def validate_phone_number(self, value):
        """Validate phone number format"""
        import re
        
        # Remove any non-digit characters
        cleaned = ''.join(filter(str.isdigit, value))
        
        # Check for Kenyan phone numbers
        if (cleaned.startswith('254') and len(cleaned) == 12) or \
           (cleaned.startswith('0') and len(cleaned) == 10) or \
           (len(cleaned) == 9):
            return cleaned
        
        raise serializers.ValidationError(
            "Invalid phone number format. Use Kenyan format (07XXXXXXXX or 01XXXXXXXX)"
        )
    
    def validate(self, data):
        """Validate message data"""
        if data.get('scheduled_for'):
            if data['scheduled_for'] < timezone.now():
                raise serializers.ValidationError({
                    'scheduled_for': 'Scheduled time must be in the future'
                })
        
        return data


class SMSMessageCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating SMS messages"""
    
    class Meta:
        model = SMSMessage
        fields = [
            'phone_number', 'recipient_name', 'client',
            'template', 'message',
            'gateway', 'priority', 'scheduled_for',
            'source', 'reference_id', 'metadata'
        ]
    
    def validate(self, data):
        """Validate message creation"""
        # If no message provided but template is provided, use template
        if not data.get('message') and data.get('template'):
            template = data['template']
            if not template.is_active:
                raise serializers.ValidationError({
                    'template': 'Template is not active'
                })
        
        # If no template and no message, error
        if not data.get('message') and not data.get('template'):
            raise serializers.ValidationError({
                'message': 'Either message or template is required'
            })
        
        return data


class SMSDeliveryLogSerializer(BaseSMSerializer):
    """Serializer for SMS Delivery Logs"""
    
    message_phone = serializers.CharField(source='message.phone_number', read_only=True)
    cost_formatted = serializers.SerializerMethodField()
    timestamp_formatted = serializers.SerializerMethodField()
    
    class Meta:
        model = SMSDeliveryLog
        fields = [
            'id', 'message', 'message_phone',
            'old_status', 'new_status',
            'gateway_response', 'error_message',
            'cost', 'cost_formatted', 'currency',
            'timestamp', 'timestamp_formatted'
        ]
        read_only_fields = ['timestamp']
    
    def get_cost_formatted(self, obj):
        if obj.cost:
            return f"{obj.cost:.4f} {obj.currency}"
        return "N/A"
    
    def get_timestamp_formatted(self, obj):
        return obj.timestamp.strftime('%Y-%m-%d %H:%M:%S')


class SMSAutomationRuleSerializer(BaseSMSerializer):
    """Serializer for SMS Automation Rules"""
    
    rule_type_display = serializers.CharField(source='get_rule_type_display', read_only=True)
    template_name = serializers.CharField(source='template.name', read_only=True)
    trigger_count = serializers.SerializerMethodField()
    last_triggered = serializers.SerializerMethodField()
    
    class Meta:
        model = SMSAutomationRule
        fields = [
            'id', 'name', 'rule_type', 'rule_type_display',
            'is_active', 'template', 'template_name',
            'conditions', 'delay_minutes',
            'trigger_count', 'last_triggered',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_trigger_count(self, obj):
        """Get count of triggered messages"""
        from sms_automation.models import SMSMessage
        return SMSMessage.objects.filter(
            source=f"rule_{obj.id}",
            template=obj.template
        ).count()
    
    def get_last_triggered(self, obj):
        """Get last triggered time"""
        from sms_automation.models import SMSMessage
        last_message = SMSMessage.objects.filter(
            source=f"rule_{obj.id}",
            template=obj.template
        ).order_by('-created_at').first()
        
        if last_message:
            return last_message.created_at
        return None


class SMSSendTestSerializer(serializers.Serializer):
    """Serializer for sending test SMS"""
    
    phone_number = serializers.CharField(max_length=20, required=True)
    message = serializers.CharField(required=True)
    gateway_id = serializers.IntegerField(required=False)
    
    def validate_phone_number(self, value):
        import re
        cleaned = ''.join(filter(str.isdigit, value))
        
        if (cleaned.startswith('254') and len(cleaned) == 12) or \
           (cleaned.startswith('0') and len(cleaned) == 10) or \
           (len(cleaned) == 9):
            return cleaned
        
        raise serializers.ValidationError("Invalid phone number format")


class SMSBulkSendSerializer(serializers.Serializer):
    """Serializer for bulk SMS sending"""
    
    phone_numbers = serializers.ListField(
        child=serializers.CharField(max_length=20),
        required=True
    )
    message = serializers.CharField(required=True)
    template_id = serializers.IntegerField(required=False)
    scheduled_for = serializers.DateTimeField(required=False)
    
    def validate_phone_numbers(self, value):
        import re
        valid_numbers = []
        
        for phone in value:
            cleaned = ''.join(filter(str.isdigit, phone))
            
            if (cleaned.startswith('254') and len(cleaned) == 12) or \
               (cleaned.startswith('0') and len(cleaned) == 10) or \
               (len(cleaned) == 9):
                valid_numbers.append(cleaned)
            else:
                raise serializers.ValidationError(
                    f"Invalid phone number: {phone}"
                )
        
        return valid_numbers


class SMSAnalyticsFilterSerializer(serializers.Serializer):
    """Serializer for SMS analytics filters"""
    
    start_date = serializers.DateField(required=False)
    end_date = serializers.DateField(required=False)
    gateway_id = serializers.IntegerField(required=False)
    status = serializers.CharField(required=False)
    group_by = serializers.ChoiceField(
        choices=['day', 'week', 'month', 'gateway', 'status', 'source'],
        default='day',
        required=False
    )


class SMSDashboardSerializer(serializers.Serializer):
    """Serializer for SMS dashboard data"""
    
    total_messages = serializers.IntegerField()
    sent_today = serializers.IntegerField()
    delivery_rate = serializers.FloatField()
    active_gateways = serializers.IntegerField()
    low_balance_gateways = serializers.IntegerField()
    pending_messages = serializers.IntegerField()
    top_templates = serializers.ListField()
    recent_messages = serializers.ListField()
    
    class Meta:
        fields = [
            'total_messages', 'sent_today', 'delivery_rate',
            'active_gateways', 'low_balance_gateways', 'pending_messages',
            'top_templates', 'recent_messages'
        ]