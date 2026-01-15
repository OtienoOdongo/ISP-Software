




"""
SMS Automation Serializers - Production Ready
Fully integrated with User Management
"""
from rest_framework import serializers
from django.utils import timezone
from django.core.exceptions import ValidationError
from django.db import models, transaction
from datetime import datetime, timedelta
import logging
import re
import base64
import json

from Backend.sms_automation.models.sms_automation_model import (
    SMSGatewayConfig, SMSTemplate, SMSMessage,
    SMSDeliveryLog, SMSAutomationRule, SMSQueue, SMSAnalytics
)
from user_management.models.client_model import ClientProfile

logger = logging.getLogger(__name__)


class BaseSMSSerializer(serializers.ModelSerializer):
    """Base serializer with common functionality"""
    
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['_meta'] = {
            'timestamp': timezone.now().isoformat(),
            'version': '2.0.0'
        }
        return representation
    
    def validate_phone_number(self, value):
        """Validate and format phone number"""
        # Remove all non-digit characters
        cleaned = re.sub(r'\D', '', str(value))
        
        if not cleaned:
            raise serializers.ValidationError(
                "Invalid phone number format. Use Kenyan format (07XXXXXXXX or 01XXXXXXXX)"
            )
        
        # Validate Kenyan phone numbers
        if cleaned.startswith('0') and len(cleaned) == 10:
            # Convert 07XXXXXXXX to 2547XXXXXXXX
            return f"254{cleaned[1:]}"
        elif len(cleaned) == 9:
            # Assume missing country code
            return f"254{cleaned}"
        elif cleaned.startswith('254') and len(cleaned) == 12:
            return cleaned
        else:
            raise serializers.ValidationError(
                "Invalid phone number format. Use Kenyan format (07XXXXXXXX or 01XXXXXXXX)"
            )


class SMSGatewayConfigSerializer(BaseSMSSerializer):
    """Serializer for SMS Gateway Configuration"""
    
    gateway_type_display = serializers.CharField(source='get_gateway_type_display', read_only=True)
    health_status = serializers.SerializerMethodField()
    balance_formatted = serializers.SerializerMethodField()
    last_used_formatted = serializers.SerializerMethodField()
    last_online_check_formatted = serializers.SerializerMethodField()
    success_rate_formatted = serializers.SerializerMethodField()
    avg_delivery_time_formatted = serializers.SerializerMethodField()
    cost_per_message_formatted = serializers.SerializerMethodField()
    is_healthy = serializers.SerializerMethodField()
    
    # Statistics
    messages_today = serializers.SerializerMethodField()
    messages_this_month = serializers.SerializerMethodField()
    delivery_rate_today = serializers.SerializerMethodField()
    
    class Meta:
        model = SMSGatewayConfig
        fields = [
            # Basic Info
            'id', 'name', 'gateway_type', 'gateway_type_display',
            'is_default', 'is_active', 'weight',
            
            # Status
            'health_status', 'is_healthy', 'is_online',
            'balance', 'balance_formatted',
            'last_used', 'last_used_formatted',
            'last_online_check', 'last_online_check_formatted',
            'last_balance_check',
            
            # Performance
            'total_messages_sent', 'total_messages_failed',
            'success_rate', 'success_rate_formatted',
            'avg_delivery_time', 'avg_delivery_time_formatted',
            
            # Configuration
            'api_key', 'api_secret', 'api_url', 'sender_id', 'shortcode',
            'smpp_host', 'smpp_port', 'smpp_system_id', 'smpp_password', 'smpp_system_type',
            
            # Rate Limiting
            'max_messages_per_minute', 'max_messages_per_hour', 'max_messages_per_day',
            
            # Cost
            'cost_per_message', 'cost_per_message_formatted', 'currency',
            
            # Stats
            'messages_today', 'messages_this_month', 'delivery_rate_today',
            
            # Metadata
            'config', 'health_check_url', 'delivery_report_url',
            
            # Timestamps
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'created_at', 'updated_at', 'last_used', 'last_online_check',
            'last_balance_check', 'total_messages_sent', 'total_messages_failed',
            'success_rate', 'avg_delivery_time', 'balance', 'is_online'
        ]
        extra_kwargs = {
            'api_key': {'write_only': True},
            'api_secret': {'write_only': True},
            'smpp_password': {'write_only': True}
        }
    
    def get_health_status(self, obj):
        return obj.get_health_status()
    
    def get_is_healthy(self, obj):
        return obj.get_health_status() == 'healthy'
    
    def get_balance_formatted(self, obj):
        return f"{obj.currency} {obj.balance:,.2f}"
    
    def get_last_used_formatted(self, obj):
        if obj.last_used:
            return obj.last_used.strftime('%Y-%m-%d %H:%M:%S')
        return 'Never'
    
    def get_last_online_check_formatted(self, obj):
        if obj.last_online_check:
            return obj.last_online_check.strftime('%Y-%m-%d %H:%M:%S')
        return 'Never'
    
    def get_success_rate_formatted(self, obj):
        return f"{obj.success_rate:.1f}%"
    
    def get_avg_delivery_time_formatted(self, obj):
        if obj.avg_delivery_time:
            seconds = obj.avg_delivery_time.total_seconds()
            if seconds < 60:
                return f"{seconds:.0f}s"
            elif seconds < 3600:
                return f"{seconds/60:.1f}m"
            else:
                return f"{seconds/3600:.1f}h"
        return "N/A"
    
    def get_cost_per_message_formatted(self, obj):
        return f"{obj.currency} {obj.cost_per_message:.4f}"
    
    def get_messages_today(self, obj):
        today = timezone.now().date()
        return obj.messages.filter(created_at__date=today).count()
    
    def get_messages_this_month(self, obj):
        today = timezone.now().date()
        first_day = today.replace(day=1)
        return obj.messages.filter(created_at__date__gte=first_day).count()
    
    def get_delivery_rate_today(self, obj):
        today = timezone.now().date()
        messages = obj.messages.filter(created_at__date=today)
        
        sent = messages.filter(status='sent').count()
        delivered = messages.filter(status='delivered').count()
        
        if sent > 0:
            return (delivered / sent) * 100
        return 0
    
    def validate(self, data):
        """Validate gateway configuration"""
        gateway_type = data.get('gateway_type', self.instance.gateway_type if self.instance else None)
        
        # Validate required fields based on gateway type
        if gateway_type == 'africas_talking':
            if not data.get('api_key') and not self.instance:
                raise serializers.ValidationError({
                    'api_key': 'API username is required for Africa\'s Talking'
                })
            if not data.get('api_secret') and not self.instance:
                raise serializers.ValidationError({
                    'api_secret': 'API key is required for Africa\'s Talking'
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
        
        elif gateway_type == 'smpp':
            if not data.get('smpp_host') and not self.instance:
                raise serializers.ValidationError({
                    'smpp_host': 'SMTP host is required for SMPP'
                })
            if not data.get('smpp_system_id') and not self.instance:
                raise serializers.ValidationError({
                    'smpp_system_id': 'System ID is required for SMPP'
                })
        
        elif gateway_type == 'custom':
            if not data.get('api_url') and not self.instance:
                raise serializers.ValidationError({
                    'api_url': 'API URL is required for custom gateway'
                })
        
        # Validate rate limits
        if data.get('max_messages_per_minute', 60) <= 0:
            raise serializers.ValidationError({
                'max_messages_per_minute': 'Must be greater than 0'
            })
        
        if data.get('max_messages_per_hour', 1000) <= 0:
            raise serializers.ValidationError({
                'max_messages_per_hour': 'Must be greater than 0'
            })
        
        if data.get('max_messages_per_day', 10000) <= 0:
            raise serializers.ValidationError({
                'max_messages_per_day': 'Must be greater than 0'
            })
        
        return data


class SMSTemplateSerializer(BaseSMSSerializer):
    """Serializer for SMS Templates"""
    
    template_type_display = serializers.CharField(source='get_template_type_display', read_only=True)
    variables_list = serializers.SerializerMethodField()
    required_variables_list = serializers.SerializerMethodField()
    usage_count_formatted = serializers.SerializerMethodField()
    last_used_formatted = serializers.SerializerMethodField()
    character_count_info = serializers.SerializerMethodField()
    is_compatible = serializers.SerializerMethodField()
    
    # Statistics
    success_rate = serializers.SerializerMethodField()
    avg_delivery_time = serializers.SerializerMethodField()
    
    class Meta:
        model = SMSTemplate
        fields = [
            # Basic Info
            'id', 'name', 'template_type', 'template_type_display',
            'language', 'subject', 'description', 'category',
            
            # Template Content
            'message_template', 'character_count', 'character_count_info',
            'max_length', 'allow_unicode',
            
            # Variables
            'variables', 'variables_list', 'required_variables', 'required_variables_list',
            
            # Configuration
            'is_active', 'is_system', 'tags',
            
            # Usage Stats
            'usage_count', 'usage_count_formatted', 'last_used', 'last_used_formatted',
            'success_rate', 'avg_delivery_time',
            
            # Compatibility
            'is_compatible',
            
            # Metadata
            'created_at', 'updated_at', 'created_by'
        ]
        read_only_fields = [
            'created_at', 'updated_at', 'usage_count', 'last_used',
            'character_count', 'created_by'
        ]
    
    def get_variables_list(self, obj):
        if isinstance(obj.variables, dict):
            return list(obj.variables.keys())
        return []
    
    def get_required_variables_list(self, obj):
        return obj.required_variables or []
    
    def get_usage_count_formatted(self, obj):
        if obj.usage_count >= 1000:
            return f"{obj.usage_count/1000:.1f}K"
        return str(obj.usage_count)
    
    def get_last_used_formatted(self, obj):
        if obj.last_used:
            delta = timezone.now() - obj.last_used
            if delta.days > 30:
                return f"{delta.days // 30} months ago"
            elif delta.days > 0:
                return f"{delta.days} days ago"
            elif delta.seconds >= 3600:
                return f"{delta.seconds // 3600} hours ago"
            elif delta.seconds >= 60:
                return f"{delta.seconds // 60} minutes ago"
            else:
                return "Just now"
        return "Never used"
    
    def get_character_count_info(self, obj):
        """Get character count information"""
        count = obj.character_count
        parts = 1
        if count > 160:
            if count <= 306:
                parts = 2
            else:
                parts = 2 + ((count - 306) // 153) + (1 if (count - 306) % 153 > 0 else 0)
        
        return {
            'characters': count,
            'parts': parts,
            'remaining': obj.max_length - count,
            'is_within_limit': count <= obj.max_length,
            'encoding': 'GSM' if not obj.allow_unicode else 'Unicode'
        }
    
    def get_is_compatible(self, obj):
        """Check template compatibility with common contexts"""
        required = set(obj.required_variables or [])
        common_vars = {'client_name', 'phone_number', 'username'}
        return required.issubset(common_vars)
    
    def get_success_rate(self, obj):
        """Calculate template success rate"""
        from django.db.models import Count, Q
        
        messages = obj.messages.all()
        if not messages:
            return 0
        
        successful = messages.filter(status__in=['sent', 'delivered']).count()
        return (successful / messages.count()) * 100 if messages.count() > 0 else 0
    
    def get_avg_delivery_time(self, obj):
        """Calculate average delivery time"""
        from django.db.models import Avg
        
        delivered = obj.messages.filter(
            status='delivered',
            delivery_latency__isnull=False
        )
        
        if not delivered.exists():
            return None
        
        avg_seconds = delivered.aggregate(
            avg=Avg('delivery_latency')
        )['avg'].total_seconds()
        
        return avg_seconds
    
    def validate_message_template(self, value):
        """Validate template content"""
        # Check length
        if len(value) > 1000:  # Reasonable upper limit
            raise serializers.ValidationError(
                "Template is too long. Maximum 1000 characters."
            )
        
        # Check for required variables if certain template types
        if self.instance and self.instance.template_type in ['pppoe_credentials', 'welcome']:
            if '{{client_name}}' not in value:
                raise serializers.ValidationError(
                    "Template should contain {{client_name}} variable"
                )
        
        return value
    
    def validate(self, data):
        """Validate template data"""
        # Ensure system templates cannot be deactivated
        if self.instance and self.instance.is_system:
            if data.get('is_active') is False:
                raise serializers.ValidationError({
                    'is_active': 'System templates cannot be deactivated'
                })
        
        return data


class SMSMessageSerializer(BaseSMSSerializer):
    """Serializer for SMS Messages with comprehensive data"""
    
    # Display fields
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    
    # Related object names
    gateway_name = serializers.CharField(source='gateway.name', read_only=True)
    gateway_type = serializers.CharField(source='gateway.gateway_type', read_only=True)
    template_name = serializers.CharField(source='template.name', read_only=True, allow_null=True)
    template_type = serializers.CharField(source='template.template_type', read_only=True, allow_null=True)
    
    # Client information
    client_name = serializers.SerializerMethodField()
    client_phone = serializers.SerializerMethodField()
    client_tier = serializers.SerializerMethodField()
    
    # Phone formatting
    phone_formatted = serializers.SerializerMethodField()
    phone_e164 = serializers.SerializerMethodField()
    
    # Time formatting
    created_at_formatted = serializers.SerializerMethodField()
    sent_at_formatted = serializers.SerializerMethodField()
    delivered_at_formatted = serializers.SerializerMethodField()
    scheduled_for_formatted = serializers.SerializerMethodField()
    expires_at_formatted = serializers.SerializerMethodField()
    next_retry_at_formatted = serializers.SerializerMethodField()
    
    # Status information
    time_ago = serializers.SerializerMethodField()
    delivery_time = serializers.SerializerMethodField()
    can_retry = serializers.SerializerMethodField()
    can_cancel = serializers.SerializerMethodField()
    is_expired = serializers.SerializerMethodField()
    
    # Cost information
    cost_formatted = serializers.SerializerMethodField()
    estimated_cost_formatted = serializers.SerializerMethodField()
    
    # Message information
    message_preview = serializers.SerializerMethodField()
    message_parts_info = serializers.SerializerMethodField()
    
    # Status history
    status_history_summary = serializers.SerializerMethodField()
    
    class Meta:
        model = SMSMessage
        fields = [
            # Identification
            'id', 'correlation_id', 'reference_id',
            
            # Recipient Info
            'phone_number', 'phone_formatted', 'phone_e164',
            'recipient_name', 'client', 'client_name', 'client_phone', 'client_tier',
            
            # Message Content
            'template', 'template_name', 'template_type',
            'original_template', 'message', 'message_preview',
            'character_count', 'message_parts', 'message_parts_info',
            
            # Sending Configuration
            'gateway', 'gateway_name', 'gateway_type',
            'priority', 'priority_display',
            'scheduled_for', 'scheduled_for_formatted',
            'expires_at', 'expires_at_formatted',
            
            # Status Tracking
            'status', 'status_display', 'status_message',
            'status_history', 'status_history_summary',
            'sent_at', 'sent_at_formatted',
            'delivered_at', 'delivered_at_formatted',
            'delivery_latency', 'delivery_time',
            
            # Delivery Tracking
            'gateway_message_id', 'gateway_response',
            'delivery_attempts', 'delivery_confirmations',
            
            # Retry Logic
            'retry_count', 'max_retries',
            'next_retry_at', 'next_retry_at_formatted',
            'retry_strategy',
            
            # Cost Tracking
            'cost', 'cost_formatted', 'estimated_cost_formatted', 'currency',
            
            # Metadata
            'source', 'source_module', 'context_data', 'metadata',
            'created_by', 'sent_by',
            
            # Status Flags
            'can_retry', 'can_cancel', 'is_expired',
            
            # Timestamps
            'created_at', 'created_at_formatted', 'time_ago',
            'updated_at'
        ]
        read_only_fields = [
            'created_at', 'updated_at', 'sent_at', 'delivered_at',
            'gateway_message_id', 'gateway_response', 'retry_count',
            'next_retry_at', 'delivery_attempts', 'delivery_latency',
            'delivery_confirmations', 'created_by', 'sent_by',
            'character_count', 'message_parts', 'status_history'
        ]
    
    def get_client_name(self, obj):
        if obj.client:
            return obj.client.username or obj.client.email
        return obj.recipient_name or 'Unknown'
    
    def get_client_phone(self, obj):
        if obj.client:
            return obj.client.phone_number
        return obj.phone_number
    
    def get_client_tier(self, obj):
        if obj.client:
            return obj.client.tier
        return None
    
    def get_phone_formatted(self, obj):
        """Format for display"""
        phone = obj.phone_number
        if phone.startswith('254'):
            return f"+{phone}"
        elif phone.startswith('0'):
            return f"+254{phone[1:]}"
        return phone
    
    def get_phone_e164(self, obj):
        """Get E.164 formatted phone"""
        return obj.phone_formatted
    
    def get_created_at_formatted(self, obj):
        return obj.created_at.strftime('%Y-%m-%d %H:%M:%S')
    
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
    
    def get_expires_at_formatted(self, obj):
        if obj.expires_at:
            return obj.expires_at.strftime('%Y-%m-%d %H:%M:%S')
        return None
    
    def get_next_retry_at_formatted(self, obj):
        if obj.next_retry_at:
            return obj.next_retry_at.strftime('%Y-%m-%d %H:%M:%S')
        return None
    
    def get_time_ago(self, obj):
        """Human-readable time ago"""
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
    
    def get_delivery_time(self, obj):
        """Get delivery time in human-readable format"""
        if obj.delivery_latency:
            seconds = obj.delivery_latency.total_seconds()
            if seconds < 60:
                return f"{seconds:.0f} seconds"
            elif seconds < 3600:
                return f"{seconds/60:.1f} minutes"
            else:
                return f"{seconds/3600:.1f} hours"
        return None
    
    def get_can_retry(self, obj):
        return obj.status == 'failed' and obj.retry_count < obj.max_retries
    
    def get_can_cancel(self, obj):
        return obj.status in ['pending', 'scheduled']
    
    def get_is_expired(self, obj):
        if obj.expires_at:
            return timezone.now() > obj.expires_at
        return False
    
    def get_cost_formatted(self, obj):
        if obj.cost:
            return f"{obj.currency} {obj.cost:.4f}"
        return None
    
    def get_estimated_cost_formatted(self, obj):
        estimated = obj.get_estimated_cost()
        if estimated:
            return f"{obj.currency} {estimated:.4f}"
        return None
    
    def get_message_preview(self, obj):
        """Get message preview (first 50 chars)"""
        if obj.message:
            preview = obj.message[:50]
            if len(obj.message) > 50:
                preview += "..."
            return preview
        return ""
    
    def get_message_parts_info(self, obj):
        """Get message parts information"""
        parts = obj.message_parts
        chars = obj.character_count
        
        if parts == 1:
            return {
                'parts': parts,
                'characters_per_part': 160,
                'total_characters': chars,
                'remaining_characters': 160 - chars,
                'cost_multiplier': parts
            }
        else:
            total_capacity = 306 + (parts - 2) * 153
            return {
                'parts': parts,
                'characters_per_part': 153,
                'total_characters': chars,
                'remaining_characters': total_capacity - chars,
                'cost_multiplier': parts
            }
    
    def get_status_history_summary(self, obj):
        """Get summary of status history"""
        if not obj.status_history:
            return []
        
        # Ensure we have valid history
        history = []
        for item in obj.status_history[-5:]:  # Last 5 entries
            if isinstance(item, dict):
                history.append({
                    'timestamp': item.get('timestamp', ''),
                    'old_status': item.get('old_status', ''),
                    'new_status': item.get('new_status', ''),
                    'message': (item.get('message', '') or '')[:100]
                })
        
        return history
    
    def validate_scheduled_for(self, value):
        """Validate scheduled time"""
        if value and value < timezone.now():
            raise serializers.ValidationError(
                "Scheduled time must be in the future"
            )
        return value
    
    def validate(self, data):
        """Validate message data"""
        # Check message or template
        if not data.get('message') and not data.get('template'):
            raise serializers.ValidationError({
                'message': 'Either message or template is required'
            })
        
        # Validate template if provided
        template = data.get('template')
        if template and not template.is_active:
            raise serializers.ValidationError({
                'template': 'Template is not active'
            })
        
        # Check expiry
        if data.get('expires_at') and data.get('scheduled_for'):
            if data['expires_at'] <= data['scheduled_for']:
                raise serializers.ValidationError({
                    'expires_at': 'Expiry time must be after scheduled time'
                })
        
        return data


class SMSMessageCreateSerializer(BaseSMSSerializer):
    """Serializer for creating SMS messages"""
    
    client_id = serializers.UUIDField(required=False, write_only=True)
    
    class Meta:
        model = SMSMessage
        fields = [
            'phone_number', 'recipient_name', 'client', 'client_id',
            'template', 'message',
            'gateway', 'priority', 'scheduled_for', 'expires_at',
            'source', 'source_module', 'reference_id', 'correlation_id',
            'context_data', 'metadata'
        ]
        read_only_fields = ['client']
    
    def create(self, validated_data):
        """Create SMS message with additional logic"""
        from sms_automation.services.sms_service import SMSService
        
        # Extract client_id if provided
        client_id = validated_data.pop('client_id', None)
        
        # Get client from context if not provided
        if not validated_data.get('client') and client_id:
            try:
                client = ClientProfile.objects.get(id=client_id)
                validated_data['client'] = client
                if not validated_data.get('recipient_name'):
                    validated_data['recipient_name'] = client.username or client.email
                if not validated_data.get('phone_number'):
                    validated_data['phone_number'] = client.phone_number
            except ClientProfile.DoesNotExist:
                pass
        
        # Set created_by if not set
        if not validated_data.get('created_by') and 'request' in self.context:
            validated_data['created_by'] = self.context['request'].user
        
        # Create message
        message = super().create(validated_data)
        
        # Queue for sending if not scheduled
        if not message.scheduled_for or message.scheduled_for <= timezone.now():
            sms_service = SMSService()
            sms_service.queue_message(message)
        
        return message


class SMSDeliveryLogSerializer(BaseSMSSerializer):
    """Serializer for SMS Delivery Logs"""
    
    message_phone = serializers.CharField(source='message.phone_number', read_only=True)
    message_status = serializers.CharField(source='message.status', read_only=True)
    gateway_name = serializers.CharField(source='gateway.name', read_only=True)
    cost_formatted = serializers.SerializerMethodField()
    event_time_formatted = serializers.SerializerMethodField()
    response_time_formatted = serializers.SerializerMethodField()
    
    class Meta:
        model = SMSDeliveryLog
        fields = [
            'id', 'message', 'message_phone', 'message_status',
            'gateway', 'gateway_name', 'gateway_transaction_id',
            'old_status', 'new_status',
            'gateway_response', 'gateway_status_code', 'gateway_status_message',
            'error_type', 'error_code', 'error_message', 'error_details',
            'response_time_ms', 'response_time_formatted',
            'network_latency_ms',
            'cost', 'cost_formatted', 'currency',
            'operator', 'country_code',
            'event_time', 'event_time_formatted',
            'created_at'
        ]
        read_only_fields = ['event_time', 'created_at']
    
    def get_cost_formatted(self, obj):
        if obj.cost:
            return f"{obj.currency} {obj.cost:.4f}"
        return "N/A"
    
    def get_event_time_formatted(self, obj):
        return obj.event_time.strftime('%Y-%m-%d %H:%M:%S')
    
    def get_response_time_formatted(self, obj):
        if obj.response_time_ms:
            if obj.response_time_ms < 1000:
                return f"{obj.response_time_ms}ms"
            else:
                return f"{obj.response_time_ms/1000:.2f}s"
        return "N/A"


class SMSAutomationRuleSerializer(BaseSMSSerializer):
    """Serializer for SMS Automation Rules"""
    
    rule_type_display = serializers.CharField(source='get_rule_type_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    template_name = serializers.CharField(source='template.name', read_only=True)
    gateway_name = serializers.CharField(source='gateway_override.name', read_only=True, allow_null=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True, allow_null=True)
    
    # Status info
    is_active_now = serializers.SerializerMethodField()
    execution_rate = serializers.SerializerMethodField()
    time_window_formatted = serializers.SerializerMethodField()
    
    # Statistics
    success_rate = serializers.SerializerMethodField()
    avg_delay_minutes = serializers.SerializerMethodField()
    
    class Meta:
        model = SMSAutomationRule
        fields = [
            # Basic Info
            'id', 'name', 'rule_type', 'rule_type_display', 'description',
            
            # Activation
            'is_active', 'is_active_now', 'enabled_from', 'enabled_until',
            
            # Template & Message
            'template', 'template_name', 'fallback_message',
            
            # Conditions & Filters
            'conditions', 'filters',
            
            # Scheduling
            'delay_minutes', 'schedule_cron',
            'time_window_start', 'time_window_end', 'time_window_formatted',
            
            # Rate Limiting
            'max_messages_per_day', 'max_messages_per_client', 'cool_down_hours',
            
            # Execution Tracking
            'execution_count', 'last_executed', 'success_count', 'failure_count',
            'execution_rate', 'success_rate', 'avg_delay_minutes',
            
            # Configuration
            'priority', 'priority_display', 'gateway_override', 'gateway_name',
            
            # Metadata
            'tags', 'metadata',
            
            # User context
            'created_by', 'created_by_username',
            
            # Timestamps
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'created_at', 'updated_at', 'execution_count', 'last_executed',
            'success_count', 'failure_count', 'created_by'
        ]
    
    def get_is_active_now(self, obj):
        return obj.is_active_now()
    
    def get_execution_rate(self, obj):
        """Calculate execution rate (successful/total)"""
        if obj.execution_count > 0:
            return (obj.success_count / obj.execution_count) * 100
        return 0
    
    def get_success_rate(self, obj):
        """Calculate success rate based on message status"""
        from django.db.models import Count, Q
        
        messages = SMSMessage.objects.filter(
            source=f"rule_{obj.id}",
            status__in=['sent', 'delivered', 'failed']
        )
        
        successful = messages.filter(status__in=['sent', 'delivered']).count()
        total = messages.count()
        
        if total > 0:
            return (successful / total) * 100
        return 100
    
    def get_avg_delay_minutes(self, obj):
        """Calculate average delay from trigger to sending"""
        messages = SMSMessage.objects.filter(
            source=f"rule_{obj.id}",
            sent_at__isnull=False,
            created_at__isnull=False
        )
        
        if not messages.exists():
            return 0
        
        avg_delay = messages.aggregate(
            avg=models.Avg(models.F('sent_at') - models.F('created_at'))
        )['avg']
        
        if avg_delay:
            return avg_delay.total_seconds() / 60
        return 0
    
    def get_time_window_formatted(self, obj):
        if obj.time_window_start and obj.time_window_end:
            return f"{obj.time_window_start.strftime('%H:%M')} - {obj.time_window_end.strftime('%H:%M')}"
        return "24/7"
    
    def validate_schedule_cron(self, value):
        """Validate cron expression"""
        if value:
            # Basic cron validation
            parts = value.strip().split()
            if len(parts) != 5:
                raise serializers.ValidationError(
                    "Cron expression must have 5 parts (minute hour day month weekday)"
                )
            
            # Validate each part
            for i, part in enumerate(parts):
                if not self._is_valid_cron_part(part, i):
                    raise serializers.ValidationError(
                        f"Invalid cron part: {part} at position {i}"
                    )
        
        return value
    
    def _is_valid_cron_part(self, part, position):
        """Validate individual cron part"""
        if part == '*':
            return True
        
        # Check ranges
        if '-' in part:
            try:
                start, end = map(int, part.split('-'))
                return 0 <= start <= end <= self._get_max_for_position(position)
            except:
                return False
        
        # Check lists
        if ',' in part:
            try:
                values = list(map(int, part.split(',')))
                return all(0 <= v <= self._get_max_for_position(position) for v in values)
            except:
                return False
        
        # Check steps
        if '/' in part:
            try:
                step_part, step = part.split('/')
                step = int(step)
                if step_part == '*':
                    return step > 0
                elif '-' in step_part:
                    start, end = map(int, step_part.split('-'))
                    return 0 <= start <= end <= self._get_max_for_position(position) and step > 0
                else:
                    return 0 <= int(step_part) <= self._get_max_for_position(position) and step > 0
            except:
                return False
        
        # Check single value
        try:
            value = int(part)
            return 0 <= value <= self._get_max_for_position(position)
        except:
            return False
    
    def _get_max_for_position(self, position):
        """Get max value for cron position"""
        max_values = [59, 23, 31, 12, 6]  # Minute, Hour, Day, Month, Weekday
        return max_values[position] if position < len(max_values) else 99
    
    def validate(self, data):
        """Validate automation rule"""
        # Check time window
        start = data.get('time_window_start')
        end = data.get('time_window_end')
        
        if start and end and start >= end:
            raise serializers.ValidationError({
                'time_window_end': 'End time must be after start time'
            })
        
        # Validate enabled dates
        enabled_from = data.get('enabled_from')
        enabled_until = data.get('enabled_until')
        
        if enabled_from and enabled_until and enabled_from >= enabled_until:
            raise serializers.ValidationError({
                'enabled_until': 'End date must be after start date'
            })
        
        return data
    
    def create(self, validated_data):
        """Set created_by user"""
        if not validated_data.get('created_by') and 'request' in self.context:
            validated_data['created_by'] = self.context['request'].user
        
        return super().create(validated_data)


class SMSQueueSerializer(BaseSMSSerializer):
    """Serializer for SMS Queue"""
    
    queue_status_display = serializers.CharField(source='get_status_display', read_only=True)
    message_phone = serializers.CharField(source='message.phone_number', read_only=True)
    message_status = serializers.CharField(source='message.status', read_only=True)
    message_preview = serializers.CharField(source='message.message_preview', read_only=True)
    queued_at_formatted = serializers.SerializerMethodField()
    processing_started_formatted = serializers.SerializerMethodField()
    processing_ended_formatted = serializers.SerializerMethodField()
    last_error_at_formatted = serializers.SerializerMethodField()
    
    # Processing info
    processing_time = serializers.SerializerMethodField()
    estimated_completion = serializers.SerializerMethodField()
    
    class Meta:
        model = SMSQueue
        fields = [
            # Basic Info
            'id', 'message', 'message_phone', 'message_status', 'message_preview',
            'priority', 'status', 'queue_status_display',
            
            # Queue Management
            'queue_position', 'queued_at', 'queued_at_formatted',
            
            # Processing Info
            'processing_started', 'processing_started_formatted',
            'processing_ended', 'processing_ended_formatted',
            'processing_attempts', 'max_processing_attempts',
            'processing_time', 'estimated_completion',
            
            # Error Tracking
            'error_message', 'last_error_at', 'last_error_at_formatted'
        ]
        read_only_fields = [
            'queued_at', 'processing_started', 'processing_ended',
            'processing_attempts', 'last_error_at', 'queue_position'
        ]
    
    def get_queued_at_formatted(self, obj):
        return obj.queued_at.strftime('%Y-%m-%d %H:%M:%S')
    
    def get_processing_started_formatted(self, obj):
        if obj.processing_started:
            return obj.processing_started.strftime('%Y-%m-%d %H:%M:%S')
        return None
    
    def get_processing_ended_formatted(self, obj):
        if obj.processing_ended:
            return obj.processing_ended.strftime('%Y-%m-%d %H:%M:%S')
        return None
    
    def get_last_error_at_formatted(self, obj):
        if obj.last_error_at:
            return obj.last_error_at.strftime('%Y-%m-%d %H:%M:%S')
        return None
    
    def get_processing_time(self, obj):
        """Calculate processing time in seconds"""
        if obj.processing_started:
            end_time = obj.processing_ended or timezone.now()
            return (end_time - obj.processing_started).total_seconds()
        return None
    
    def get_estimated_completion(self, obj):
        """Estimate completion time based on queue position"""
        if obj.queue_position > 0 and obj.status == 'pending':
            # Assume 2 seconds per message in queue
            estimated_seconds = obj.queue_position * 2
            estimated_time = timezone.now() + timedelta(seconds=estimated_seconds)
            return estimated_time.strftime('%H:%M:%S')
        return None


class SMSAnalyticsSerializer(BaseSMSSerializer):
    """Serializer for SMS Analytics"""
    
    date_formatted = serializers.SerializerMethodField()
    delivery_rate_formatted = serializers.SerializerMethodField()
    success_rate_formatted = serializers.SerializerMethodField()
    total_cost_formatted = serializers.SerializerMethodField()
    avg_cost_formatted = serializers.SerializerMethodField()
    avg_delivery_time_formatted = serializers.SerializerMethodField()
    peak_hour_formatted = serializers.SerializerMethodField()
    
    # Summary stats
    gateway_summary = serializers.SerializerMethodField()
    template_summary = serializers.SerializerMethodField()
    client_summary = serializers.SerializerMethodField()
    
    class Meta:
        model = SMSAnalytics
        fields = [
            # Date
            'date', 'date_formatted',
            
            # Volume Metrics
            'total_messages', 'sent_messages', 'delivered_messages',
            'failed_messages', 'pending_messages',
            
            # Performance Metrics
            'delivery_rate', 'delivery_rate_formatted',
            'avg_delivery_time_seconds', 'avg_delivery_time_formatted',
            'success_rate', 'success_rate_formatted',
            
            # Gateway Metrics
            'gateway_metrics', 'gateway_summary',
            
            # Cost Metrics
            'total_cost', 'total_cost_formatted',
            'avg_cost_per_message', 'avg_cost_formatted',
            
            # Template Metrics
            'template_metrics', 'template_summary',
            
            # Client Metrics
            'client_metrics', 'client_summary',
            
            # Peak Hours
            'peak_hour', 'peak_hour_formatted', 'messages_at_peak',
            
            # Timestamps
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_date_formatted(self, obj):
        return obj.date.strftime('%Y-%m-%d')
    
    def get_delivery_rate_formatted(self, obj):
        return f"{obj.delivery_rate:.1f}%"
    
    def get_success_rate_formatted(self, obj):
        return f"{obj.success_rate:.1f}%"
    
    def get_total_cost_formatted(self, obj):
        # Find currency from gateway metrics
        currency = 'KES'  # Default
        if obj.gateway_metrics:
            for gw_data in obj.gateway_metrics.values():
                if 'currency' in gw_data:
                    currency = gw_data.get('currency', 'KES')
                    break
        
        return f"{currency} {obj.total_cost:,.2f}"
    
    def get_avg_cost_formatted(self, obj):
        # Find currency from gateway metrics
        currency = 'KES'  # Default
        if obj.gateway_metrics:
            for gw_data in obj.gateway_metrics.values():
                if 'currency' in gw_data:
                    currency = gw_data.get('currency', 'KES')
                    break
        
        return f"{currency} {obj.avg_cost_per_message:.4f}"
    
    def get_avg_delivery_time_formatted(self, obj):
        if obj.avg_delivery_time_seconds:
            seconds = float(obj.avg_delivery_time_seconds)
            if seconds < 60:
                return f"{seconds:.0f}s"
            elif seconds < 3600:
                return f"{seconds/60:.1f}m"
            else:
                return f"{seconds/3600:.1f}h"
        return "N/A"
    
    def get_peak_hour_formatted(self, obj):
        if obj.peak_hour is not None:
            hour = int(obj.peak_hour)
            return f"{hour:02d}:00 - {hour+1:02d}:00"
        return "N/A"
    
    def get_gateway_summary(self, obj):
        """Create gateway summary"""
        if not obj.gateway_metrics:
            return {}
        
        summary = {
            'total_gateways': len(obj.gateway_metrics),
            'most_used': None,
            'most_successful': None,
            'highest_cost': None
        }
        
        if summary['total_gateways'] > 0:
            # Find most used gateway
            most_used = max(obj.gateway_metrics.items(), key=lambda x: x[1].get('total', 0))
            summary['most_used'] = {
                'gateway': most_used[0],
                'messages': most_used[1].get('total', 0)
            }
            
            # Find most successful gateway
            most_successful = max(
                obj.gateway_metrics.items(),
                key=lambda x: x[1].get('success_rate', 0)
            )
            summary['most_successful'] = {
                'gateway': most_successful[0],
                'success_rate': most_successful[1].get('success_rate', 0)
            }
            
            # Find gateway with highest cost
            highest_cost = max(
                obj.gateway_metrics.items(),
                key=lambda x: x[1].get('cost', 0)
            )
            summary['highest_cost'] = {
                'gateway': highest_cost[0],
                'cost': highest_cost[1].get('cost', 0)
            }
        
        return summary
    
    def get_template_summary(self, obj):
        """Create template summary"""
        if not obj.template_metrics:
            return {}
        
        summary = {
            'total_templates': len(obj.template_metrics),
            'most_used': None,
            'usage_distribution': []
        }
        
        if summary['total_templates'] > 0:
            # Find most used template
            most_used = max(obj.template_metrics.items(), key=lambda x: x[1])
            summary['most_used'] = {
                'template': most_used[0],
                'count': most_used[1]
            }
            
            # Create usage distribution
            total_messages = sum(obj.template_metrics.values())
            if total_messages > 0:
                for template, count in obj.template_metrics.items():
                    percentage = (count / total_messages) * 100
                    summary['usage_distribution'].append({
                        'template': template,
                        'count': count,
                        'percentage': round(percentage, 1)
                    })
        
        return summary
    
    def get_client_summary(self, obj):
        """Create client summary"""
        if not obj.client_metrics:
            return {}
        
        return {
            'total_client_segments': len(obj.client_metrics),
            'segment_breakdown': obj.client_metrics
        }


class SMSDashboardSerializer(serializers.Serializer):
    """Serializer for SMS Dashboard Data"""
    
    # Today's stats
    today_total = serializers.IntegerField()
    today_sent = serializers.IntegerField()
    today_delivered = serializers.IntegerField()
    today_failed = serializers.IntegerField()
    today_cost = serializers.DecimalField(max_digits=10, decimal_places=2)
    
    # This month stats
    month_total = serializers.IntegerField()
    month_sent = serializers.IntegerField()
    month_delivered = serializers.IntegerField()
    month_failed = serializers.IntegerField()
    month_cost = serializers.DecimalField(max_digits=10, decimal_places=2)
    
    # Gateway stats
    gateway_stats = serializers.ListField(child=serializers.DictField())
    active_gateways = serializers.IntegerField()
    
    # Template stats
    template_stats = serializers.ListField(child=serializers.DictField())
    active_templates = serializers.IntegerField()
    
    # Queue stats
    queue_pending = serializers.IntegerField()
    queue_processing = serializers.IntegerField()
    queue_failed = serializers.IntegerField()
    
    # Automation stats
    active_rules = serializers.IntegerField()
    rule_executions_today = serializers.IntegerField()
    
    # Performance
    overall_success_rate = serializers.DecimalField(max_digits=5, decimal_places=2)
    avg_delivery_time = serializers.DecimalField(max_digits=10, decimal_places=2)
    
    # Charts data
    daily_volume = serializers.ListField(child=serializers.DictField())
    hourly_distribution = serializers.ListField(child=serializers.DictField())
    template_distribution = serializers.ListField(child=serializers.DictField())
    
    # Issues
    issues = serializers.ListField(child=serializers.DictField())
    critical_alerts = serializers.IntegerField()


class SMSBulkSendSerializer(serializers.Serializer):
    """Serializer for bulk SMS sending"""
    
    phone_numbers = serializers.ListField(
        child=serializers.CharField(),
        min_length=1,
        max_length=1000,
        help_text="List of phone numbers to send to"
    )
    message = serializers.CharField(required=False, allow_blank=True)
    template_id = serializers.UUIDField(required=False)
    context_data = serializers.DictField(required=False, default=dict)
    gateway_id = serializers.UUIDField(required=False)
    priority = serializers.ChoiceField(
        choices=SMSMessage.PriorityChoices.choices,
        default='normal'
    )
    scheduled_for = serializers.DateTimeField(required=False)
    
    def validate(self, data):
        """Validate bulk send data"""
        # Either message or template_id must be provided
        if not data.get('message') and not data.get('template_id'):
            raise serializers.ValidationError(
                "Either message or template_id must be provided"
            )
        
        # Validate template if provided
        if data.get('template_id'):
            try:
                template = SMSTemplate.objects.get(id=data['template_id'])
                if not template.is_active:
                    raise serializers.ValidationError(
                        "Template is not active"
                    )
                data['template'] = template
            except SMSTemplate.DoesNotExist:
                raise serializers.ValidationError(
                    "Template not found"
                )
        
        # Validate gateway if provided
        if data.get('gateway_id'):
            try:
                gateway = SMSGatewayConfig.objects.get(id=data['gateway_id'])
                if not gateway.is_active:
                    raise serializers.ValidationError(
                        "Gateway is not active"
                    )
                data['gateway'] = gateway
            except SMSGatewayConfig.DoesNotExist:
                raise serializers.ValidationError(
                    "Gateway not found"
                )
        
        # Validate phone numbers
        valid_numbers = []
        for phone in data['phone_numbers']:
            try:
                validated = self._validate_phone_number(phone)
                valid_numbers.append(validated)
            except serializers.ValidationError:
                # Skip invalid numbers, but log them
                logger.warning(f"Invalid phone number in bulk send: {phone}")
                continue
        
        if not valid_numbers:
            raise serializers.ValidationError(
                "No valid phone numbers provided"
            )
        
        data['phone_numbers'] = valid_numbers
        
        return data
    
    def _validate_phone_number(self, value):
        """Validate individual phone number"""
        # Remove all non-digit characters
        cleaned = re.sub(r'\D', '', str(value))
        
        if not cleaned:
            raise serializers.ValidationError("Invalid phone number")
        
        # Validate Kenyan phone numbers
        if cleaned.startswith('0') and len(cleaned) == 10:
            return f"254{cleaned[1:]}"
        elif len(cleaned) == 9:
            return f"254{cleaned}"
        elif cleaned.startswith('254') and len(cleaned) == 12:
            return cleaned
        else:
            raise serializers.ValidationError("Invalid Kenyan phone number format")


class SMSStatusUpdateSerializer(serializers.Serializer):
    """Serializer for updating SMS message status"""
    
    status = serializers.ChoiceField(choices=SMSMessage.StatusChoices.choices)
    status_message = serializers.CharField(required=False, allow_blank=True)
    gateway_message_id = serializers.CharField(required=False, allow_blank=True)
    gateway_response = serializers.DictField(required=False, default=dict)
    cost = serializers.DecimalField(
        max_digits=10,
        decimal_places=4,
        required=False,
        min_value=0
    )
    
    def validate_status(self, value):
        """Validate status transition"""
        if 'instance' in self.context:
            instance = self.context['instance']
            
            # Check valid transitions
            valid_transitions = {
                'pending': ['queued', 'sending', 'cancelled'],
                'queued': ['sending', 'cancelled'],
                'sending': ['sent', 'failed', 'cancelled'],
                'sent': ['delivered', 'failed'],
                'failed': ['pending'],  # For retries
                'cancelled': [],  # Terminal state
                'delivered': [],  # Terminal state
                'expired': [],  # Terminal state
                'rejected': []  # Terminal state
            }
            
            if instance.status in valid_transitions:
                if value not in valid_transitions[instance.status]:
                    raise serializers.ValidationError(
                        f"Cannot transition from {instance.status} to {value}"
                    )
        
        return value