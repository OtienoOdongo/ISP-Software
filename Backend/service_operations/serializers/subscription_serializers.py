"""
Subscription Serializers for dynamic subscription management
Production-ready with comprehensive validation
"""

from rest_framework import serializers
from django.utils import timezone
from django.core.exceptions import ValidationError
from django.core.cache import cache
from django.db import transaction
import logging
import uuid
import re
from typing import Dict, Any, Optional
from datetime import timedelta 

from service_operations.models import Subscription, UsageTracking
from service_operations.utils.validators import (
    validate_mac_address,
    validate_duration_hours,
    validate_network_config,
)
from service_operations.utils.formatters import (
    format_bytes_human_readable,
    format_seconds_human_readable,
    calculate_usage_percentage,
)

logger = logging.getLogger(__name__)


class SubscriptionSerializer(serializers.ModelSerializer):
    """
    Base subscription serializer with dynamic field calculation
    """
    
    # Computed fields
    remaining_data_bytes = serializers.IntegerField(read_only=True)
    remaining_time_seconds = serializers.IntegerField(read_only=True)
    is_expired = serializers.BooleanField(read_only=True)
    can_be_activated = serializers.BooleanField(read_only=True)
    usage_percentage = serializers.DictField(read_only=True)
    client_type_display = serializers.CharField(source='get_client_type_display', read_only=True)
    access_method_display = serializers.CharField(source='get_access_method_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    # Formatted fields for frontend
    data_used_display = serializers.SerializerMethodField()
    data_remaining_display = serializers.SerializerMethodField()
    time_used_display = serializers.SerializerMethodField()
    time_remaining_display = serializers.SerializerMethodField()
    duration_display = serializers.SerializerMethodField()
    
    class Meta:
        model = Subscription
        fields = [
            'id', 'client_id', 'internet_plan_id', 'client_type', 'client_type_display',
            'access_method', 'access_method_display', 'status', 'status_display',
            'router_id', 'hotspot_mac_address', 'pppoe_username', 'pppoe_password',
            'payment_reference', 'payment_method', 'payment_confirmed_at',
            'start_date', 'end_date', 'scheduled_activation',
            'used_data_bytes', 'data_used_display',
            'used_time_seconds', 'time_used_display',
            'data_limit_bytes', 'time_limit_seconds',
            'remaining_data_bytes', 'data_remaining_display',
            'remaining_time_seconds', 'time_remaining_display',
            'activation_attempts', 'activation_successful', 'activation_error',
            'activation_completed_at', 'auto_renew', 'parent_subscription',
            'is_expired', 'can_be_activated', 'usage_percentage',
            'duration_display', 'metadata', 'is_active',
            'created_at', 'updated_at', 'last_usage_update',
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'payment_confirmed_at',
            'activation_completed_at', 'last_usage_update',
            'remaining_data_bytes', 'remaining_time_seconds',
            'is_expired', 'can_be_activated', 'usage_percentage',
        ]
    
    def get_data_used_display(self, obj) -> str:
        return format_bytes_human_readable(obj.used_data_bytes)
    
    def get_data_remaining_display(self, obj) -> str:
        if obj.data_limit_bytes == 0:
            return "Unlimited"
        return format_bytes_human_readable(obj.remaining_data_bytes)
    
    def get_time_used_display(self, obj) -> str:
        return format_seconds_human_readable(obj.used_time_seconds)
    
    def get_time_remaining_display(self, obj) -> str:
        if obj.time_limit_seconds == 0:
            return "Unlimited"
        return format_seconds_human_readable(obj.remaining_time_seconds)
    
    def get_duration_display(self, obj) -> Optional[str]:
        if obj.start_date and obj.end_date:
            duration = obj.end_date - obj.start_date
            days = duration.days
            hours = duration.seconds // 3600
            if days > 0:
                return f"{days} day{'s' if days != 1 else ''}"
            elif hours > 0:
                return f"{hours} hour{'s' if hours != 1 else ''}"
        return None
    
    def validate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Comprehensive validation"""
        errors = {}
        
        # Validate client type and access method consistency
        client_type = data.get('client_type', getattr(self.instance, 'client_type', None))
        access_method = data.get('access_method', getattr(self.instance, 'access_method', None))
        
        if client_type and access_method:
            if client_type == 'hotspot_client' and access_method != 'hotspot':
                errors['access_method'] = 'Hotspot clients must use hotspot access method'
            if client_type == 'pppoe_client' and access_method != 'pppoe':
                errors['access_method'] = 'PPPoE clients must use PPPoE access method'
        
        # Validate MAC address
        if 'hotspot_mac_address' in data and data['hotspot_mac_address']:
            if not validate_mac_address(data['hotspot_mac_address']):
                errors['hotspot_mac_address'] = 'Invalid MAC address format'
        
        # Validate payment reference format
        if 'payment_reference' in data and data['payment_reference']:
            if len(data['payment_reference']) < 5 or len(data['payment_reference']) > 100:
                errors['payment_reference'] = 'Payment reference must be 5-100 characters'
            if not re.match(r'^[a-zA-Z0-9_-]+$', data['payment_reference']):
                errors['payment_reference'] = 'Invalid payment reference format'
        
        # Validate metadata size
        if 'metadata' in data:
            if len(str(data['metadata'])) > 5000:
                errors['metadata'] = 'Metadata too large (max 5000 characters)'
        
        if errors:
            logger.warning(f"Subscription validation failed: {errors}")
            raise serializers.ValidationError(errors)
        
        return data


class SubscriptionCreateSerializer(serializers.Serializer):
    """
    Serializer for creating new subscriptions dynamically
    """
    
    # Required fields
    client_id = serializers.UUIDField(required=True)
    internet_plan_id = serializers.UUIDField(required=True)
    client_type = serializers.ChoiceField(
        choices=Subscription.CLIENT_TYPE_CHOICES,
        required=True
    )
    
    # Optional fields with defaults
    access_method = serializers.ChoiceField(
        choices=Subscription.ACCESS_METHOD_CHOICES,
        default='hotspot'
    )
    
    router_id = serializers.IntegerField(
        required=False,
        allow_null=True,
        min_value=1
    )
    
    hotspot_mac_address = serializers.CharField(
        required=False,
        allow_null=True,
        allow_blank=True,
        max_length=17
    )
    
    duration_hours = serializers.IntegerField(
        required=False,
        min_value=1,
        max_value=744,  # 31 days
        default=24
    )
    
    scheduled_activation = serializers.DateTimeField(
        required=False,
        allow_null=True
    )
    
    auto_renew = serializers.BooleanField(default=False)
    metadata = serializers.JSONField(required=False, default=dict)
    
    def validate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate subscription creation data"""
        errors = {}
        
        # Validate client type specific requirements
        client_type = data.get('client_type')
        access_method = data.get('access_method', 'hotspot')
        
        if client_type == 'hotspot_client':
            if access_method != 'hotspot':
                errors['access_method'] = 'Hotspot clients must use hotspot access method'
            
            # MAC address is optional but recommended
            mac_address = data.get('hotspot_mac_address')
            if mac_address and not validate_mac_address(mac_address):
                errors['hotspot_mac_address'] = 'Invalid MAC address format'
        
        elif client_type == 'pppoe_client':
            if access_method != 'pppoe':
                errors['access_method'] = 'PPPoE clients must use PPPoE access method'
        
        # Validate duration
        duration_hours = data.get('duration_hours', 24)
        if not validate_duration_hours(duration_hours):
            errors['duration_hours'] = 'Duration must be between 1 and 744 hours'
        
        # Validate scheduled activation
        scheduled_activation = data.get('scheduled_activation')
        if scheduled_activation:
            if scheduled_activation <= timezone.now():
                errors['scheduled_activation'] = 'Scheduled activation must be in the future'
            if scheduled_activation > timezone.now() + timezone.timedelta(days=30):
                errors['scheduled_activation'] = 'Cannot schedule activation more than 30 days in advance'
        
        if errors:
            logger.warning(f"Subscription creation validation failed: {errors}")
            raise serializers.ValidationError(errors)
        
        return data
    
    def create(self, validated_data: Dict[str, Any]) -> Subscription:
        """Create subscription with dynamic configuration"""
        from service_operations.services.subscription_service import SubscriptionService
        
        try:
            subscription = SubscriptionService.create_subscription(
                client_id=str(validated_data['client_id']),
                internet_plan_id=str(validated_data['internet_plan_id']),
                client_type=validated_data['client_type'],
                access_method=validated_data.get('access_method', 'hotspot'),
                router_id=validated_data.get('router_id'),
                hotspot_mac_address=validated_data.get('hotspot_mac_address'),
                duration_hours=validated_data.get('duration_hours', 24),
                scheduled_activation=validated_data.get('scheduled_activation'),
                auto_renew=validated_data.get('auto_renew', False),
                metadata=validated_data.get('metadata', {})
            )
            
            logger.info(f"Subscription created: {subscription.id}")
            return subscription
            
        except Exception as e:
            logger.error(f"Failed to create subscription: {e}")
            raise serializers.ValidationError(f"Failed to create subscription: {str(e)}")


class SubscriptionUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating subscriptions with limited fields
    """
    
    class Meta:
        model = Subscription
        fields = [
            'hotspot_mac_address',
            'router_id',
            'auto_renew',
            'metadata',
        ]
    
    def validate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate update data"""
        errors = {}
        
        instance = self.instance
        
        # Validate MAC address if changing for hotspot client
        if 'hotspot_mac_address' in data and data['hotspot_mac_address']:
            if instance.client_type == 'hotspot_client':
                if not validate_mac_address(data['hotspot_mac_address']):
                    errors['hotspot_mac_address'] = 'Invalid MAC address format'
            else:
                errors['hotspot_mac_address'] = 'MAC address only applicable for hotspot clients'
        
        # Cannot update subscription that's not active
        if instance.status not in ['draft', 'pending_activation', 'active', 'suspended']:
            errors['non_field_errors'] = 'Cannot update subscription in current status'
        
        if errors:
            raise serializers.ValidationError(errors)
        
        return data
    
    def update(self, instance: Subscription, validated_data: Dict[str, Any]) -> Subscription:
        """Update subscription with cache invalidation"""
        # Update fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # Validate and save
        instance.full_clean()
        instance.save()
        
        # Invalidate cache
        cache.delete(f"subscription:{instance.id}")
        
        logger.info(f"Subscription updated: {instance.id}")
        return instance


class SubscriptionActivationSerializer(serializers.Serializer):
    """
    Serializer for activating subscriptions after payment
    """
    
    payment_reference = serializers.CharField(
        max_length=100,
        required=True,
        help_text="Payment transaction reference"
    )
    
    payment_method = serializers.ChoiceField(
        choices=[
            ('mpesa_till', 'M-Pesa Till'),
            ('mpesa_paybill', 'M-Pesa Paybill'),
            ('paypal', 'PayPal'),
            ('bank_transfer', 'Bank Transfer'),
            ('card', 'Credit/Debit Card'),
        ],
        required=True,
        help_text="Payment method used"
    )
    
    activate_immediately = serializers.BooleanField(
        default=True,
        help_text="Activate immediately or use scheduled time"
    )
    
    priority = serializers.IntegerField(
        min_value=1,
        max_value=6,
        default=3,
        help_text="Activation priority"
    )
    
    metadata = serializers.JSONField(
        required=False,
        default=dict,
        help_text="Additional activation metadata"
    )
    
    def validate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate activation request"""
        errors = {}
        
        # Validate payment reference
        payment_ref = data.get('payment_reference')
        if not payment_ref or len(payment_ref) < 5:
            errors['payment_reference'] = 'Valid payment reference required'
        
        if errors:
            raise serializers.ValidationError(errors)
        
        return data


class SubscriptionRenewSerializer(serializers.Serializer):
    """
    Serializer for renewing subscriptions dynamically
    """
    
    new_plan_id = serializers.UUIDField(
        required=False,
        allow_null=True,
        help_text="New plan ID (defaults to current plan)"
    )
    
    duration_hours = serializers.IntegerField(
        required=False,
        min_value=1,
        max_value=744,
        default=None,
        allow_null=True,
        help_text="Duration in hours (defaults to plan duration)"
    )
    
    auto_renew = serializers.BooleanField(
        default=None,
        allow_null=True,
        help_text="Enable auto-renew for renewed subscription"
    )
    
    metadata = serializers.JSONField(
        required=False,
        default=dict,
        help_text="Renewal metadata"
    )
    
    def validate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate renewal request"""
        errors = {}
        
        # Validate duration
        duration_hours = data.get('duration_hours')
        if duration_hours is not None and not validate_duration_hours(duration_hours):
            errors['duration_hours'] = 'Duration must be between 1 and 744 hours'
        
        if errors:
            raise serializers.ValidationError(errors)
        
        return data




class SubscriptionSuspendSerializer(serializers.Serializer):
    """
    Serializer for suspending subscriptions
    """
    
    reason = serializers.CharField(
        required=True,
        max_length=255,
        help_text="Reason for suspension"
    )
    
    suspend_immediately = serializers.BooleanField(
        default=True,
        help_text="Suspend immediately or schedule"
    )
    
    scheduled_suspend = serializers.DateTimeField(
        required=False,
        allow_null=True,
        help_text="Scheduled suspension time"
    )
    
    notify_client = serializers.BooleanField(
        default=True,
        help_text="Send notification to client"
    )
    
    metadata = serializers.JSONField(
        required=False,
        default=dict,
        help_text="Suspension metadata"
    )
    
    def validate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate suspension request"""
        errors = {}
        
        # Validate scheduled suspension time
        scheduled_suspend = data.get('scheduled_suspend')
        if scheduled_suspend:
            if scheduled_suspend <= timezone.now():
                errors['scheduled_suspend'] = 'Scheduled suspension must be in the future'
            if scheduled_suspend > timezone.now() + timezone.timedelta(days=30):
                errors['scheduled_suspend'] = 'Cannot schedule suspension more than 30 days in advance'
        
        # Validate reason
        reason = data.get('reason', '').strip()
        if not reason:
            errors['reason'] = 'Suspension reason is required'
        elif len(reason) < 10:
            errors['reason'] = 'Reason should be at least 10 characters'
        
        if errors:
            raise serializers.ValidationError(errors)
        
        return data




class SubscriptionExtendSerializer(serializers.Serializer):
    """
    Serializer for extending subscription duration
    """
    
    extension_days = serializers.IntegerField(
        required=False,
        min_value=1,
        max_value=365,
        default=None,
        allow_null=True,
        help_text="Number of days to extend"
    )
    
    extension_hours = serializers.IntegerField(
        required=False,
        min_value=1,
        max_value=744,
        default=None,
        allow_null=True,
        help_text="Number of hours to extend"
    )
    
    new_end_date = serializers.DateTimeField(
        required=False,
        allow_null=True,
        help_text="Specific new end date (alternative to duration)"
    )
    
    reason = serializers.CharField(
        required=False,
        max_length=255,
        default="Subscription extension",
        help_text="Reason for extension"
    )
    
    prorate_amount = serializers.DecimalField(
        required=False,
        max_digits=10,
        decimal_places=2,
        allow_null=True,
        help_text="Prorated amount for extension"
    )
    
    notify_client = serializers.BooleanField(
        default=True,
        help_text="Send notification to client"
    )
    
    metadata = serializers.JSONField(
        required=False,
        default=dict,
        help_text="Extension metadata"
    )
    
    def validate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate extension request"""
        errors = {}
        
        extension_days = data.get('extension_days')
        extension_hours = data.get('extension_hours')
        new_end_date = data.get('new_end_date')
        
        # Validate that at least one extension method is provided
        if not any([extension_days, extension_hours, new_end_date]):
            errors['non_field_errors'] = 'Either extension_days, extension_hours, or new_end_date must be provided'
        
        # Validate extension durations
        if extension_days and extension_days > 365:
            errors['extension_days'] = 'Cannot extend more than 365 days at once'
        
        if extension_hours and extension_hours > 744:  # 31 days
            errors['extension_hours'] = 'Cannot extend more than 744 hours (31 days) at once'
        
        # Validate new end date
        if new_end_date:
            # Get current subscription end date
            instance = self.context.get('subscription')
            if instance and instance.end_date:
                if new_end_date <= instance.end_date:
                    errors['new_end_date'] = 'New end date must be after current end date'
                if new_end_date > instance.end_date + timezone.timedelta(days=365):
                    errors['new_end_date'] = 'Cannot extend more than 365 days from current end date'
            else:
                if new_end_date <= timezone.now():
                    errors['new_end_date'] = 'New end date must be in the future'
        
        # Ensure only one extension method is used
        method_count = sum([1 for x in [extension_days, extension_hours, new_end_date] if x is not None])
        if method_count > 1:
            errors['non_field_errors'] = 'Only one extension method (days, hours, or date) can be specified'
        
        # Validate prorate amount if provided
        prorate_amount = data.get('prorate_amount')
        if prorate_amount is not None:
            if prorate_amount < 0:
                errors['prorate_amount'] = 'Prorate amount cannot be negative'
        
        if errors:
            raise serializers.ValidationError(errors)
        
        return data
    
    def calculate_extension_duration(self, validated_data: Dict[str, Any], subscription) -> timedelta:
        """
        Calculate the extension duration based on provided parameters
        
        Args:
            validated_data: Validated serializer data
            subscription: Subscription instance being extended
        
        Returns:
            timedelta: Duration to extend
        """
        extension_days = validated_data.get('extension_days')
        extension_hours = validated_data.get('extension_hours')
        new_end_date = validated_data.get('new_end_date')
        
        if new_end_date:
            # Calculate from new end date
            current_end = subscription.end_date or timezone.now()
            return new_end_date - current_end
        elif extension_days:
            return timedelta(days=extension_days)
        elif extension_hours:
            return timedelta(hours=extension_hours)
        
        return timedelta(0)


class SubscriptionUsageSerializer(serializers.Serializer):
    """
    Serializer for updating subscription usage from network management
    """
    
    data_used_bytes = serializers.IntegerField(
        required=True,
        min_value=0,
        help_text="Data used in bytes"
    )
    
    time_used_seconds = serializers.IntegerField(
        required=True,
        min_value=0,
        help_text="Time used in seconds"
    )
    
    session_id = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=100,
        help_text="Session ID for tracking"
    )
    
    device_id = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=100,
        help_text="Device identifier"
    )
    
    network_metrics = serializers.JSONField(
        required=False,
        default=dict,
        help_text="Network performance metrics"
    )
    
    metadata = serializers.JSONField(
        required=False,
        default=dict,
        help_text="Additional metadata"
    )
    
    def validate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate usage update"""
        errors = {}
        
        # Validate data usage is reasonable
        data_used = data.get('data_used_bytes', 0)
        if data_used > 10 * 1024 * 1024 * 1024:  # 10GB per update
            errors['data_used_bytes'] = 'Data usage too high for single update'
        
        # Validate time usage is reasonable
        time_used = data.get('time_used_seconds', 0)
        if time_used > 24 * 3600:  # 24 hours per update
            errors['time_used_seconds'] = 'Time usage too high for single update'
        
        if errors:
            raise serializers.ValidationError(errors)
        
        return data


class SubscriptionListSerializer(serializers.ModelSerializer):
    """
    Optimized serializer for listing subscriptions
    """
    
    client_type_display = serializers.CharField(source='get_client_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    is_expired = serializers.BooleanField(read_only=True)
    usage_percentage = serializers.DictField(read_only=True)
    
    class Meta:
        model = Subscription
        fields = [
            'id', 'client_id', 'internet_plan_id', 'client_type', 'client_type_display',
            'access_method', 'status', 'status_display', 'payment_method',
            'start_date', 'end_date', 'used_data_bytes', 'used_time_seconds',
            'data_limit_bytes', 'time_limit_seconds', 'is_expired',
            'usage_percentage', 'activation_successful', 'auto_renew',
            'created_at',
        ]
        read_only_fields = fields


class SubscriptionDetailSerializer(SubscriptionSerializer):
    """
    Detailed subscription serializer with related data
    """
    
    # Related usage records
    recent_usage = serializers.SerializerMethodField()
    
    # Activation history
    activation_history = serializers.SerializerMethodField()
    
    # Client operations
    client_operations = serializers.SerializerMethodField()
    
    class Meta:
        model = Subscription
        fields = SubscriptionSerializer.Meta.fields + [
            'recent_usage',
            'activation_history',
            'client_operations',
        ]
    
    def get_recent_usage(self, obj) -> list:
        """Get recent usage records"""
        from service_operations.models import UsageTracking
        
        records = UsageTracking.objects.filter(
            subscription=obj
        ).order_by('-session_start')[:10]
        
        return [
            {
                'id': str(record.id),
                'data_used_bytes': record.data_used_bytes,
                'data_used_display': format_bytes_human_readable(record.data_used_bytes),
                'time_used_seconds': record.session_duration_seconds,
                'time_used_display': format_seconds_human_readable(record.session_duration_seconds),
                'session_start': record.session_start.isoformat(),
                'session_end': record.session_end.isoformat(),
                'avg_data_rate': record.avg_data_rate,
            }
            for record in records
        ]
    
    def get_activation_history(self, obj) -> dict:
        """Get activation history"""
        from service_operations.models import ActivationQueue
        
        activations = ActivationQueue.objects.filter(
            subscription=obj
        ).order_by('-created_at')[:5]
        
        return {
            'total_attempts': activations.count(),
            'successful': activations.filter(status='completed').count(),
            'failed': activations.filter(status='failed').count(),
            'pending': activations.filter(status__in=['pending', 'processing', 'retrying']).count(),
            'recent': [
                {
                    'id': str(act.id),
                    'activation_type': act.activation_type,
                    'status': act.status,
                    'created_at': act.created_at.isoformat(),
                    'error_message': act.error_message,
                }
                for act in activations
            ]
        }
    
    def get_client_operations(self, obj) -> list:
        """Get related client operations"""
        from service_operations.models import ClientOperation
        
        operations = ClientOperation.objects.filter(
            subscription=obj
        ).order_by('-created_at')[:5]
        
        return [
            {
                'id': str(op.id),
                'operation_type': op.operation_type,
                'status': op.status,
                'title': op.title,
                'created_at': op.created_at.isoformat(),
            }
            for op in operations
        ]




class SubscriptionStatisticsSerializer(serializers.Serializer):
    """
    Serializer for subscription statistics and analytics
    """
    
    # Time period filters
    start_date = serializers.DateTimeField(
        required=False,
        allow_null=True,
        help_text="Start date for statistics period"
    )
    
    end_date = serializers.DateTimeField(
        required=False,
        allow_null=True,
        help_text="End date for statistics period"
    )
    
    group_by = serializers.ChoiceField(
        choices=[
            ('hour', 'Hour'),
            ('day', 'Day'),
            ('week', 'Week'),
            ('month', 'Month'),
        ],
        default='day',
        help_text="Group statistics by time period"
    )
    
    include_usage_details = serializers.BooleanField(
        default=True,
        help_text="Include detailed usage statistics"
    )
    
    include_activation_stats = serializers.BooleanField(
        default=True,
        help_text="Include activation statistics"
    )
    
    include_financial_stats = serializers.BooleanField(
        default=False,
        help_text="Include financial statistics"
    )
    
    def validate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate statistics request parameters"""
        errors = {}
        
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        
        if start_date and end_date:
            if end_date <= start_date:
                errors['end_date'] = 'End date must be after start date'
            
            # Limit to maximum 1 year period
            max_days = 365
            if (end_date - start_date).days > max_days:
                errors['non_field_errors'] = f'Maximum statistics period is {max_days} days'
        
        elif start_date and not end_date:
            # Default end date to now if only start date provided
            data['end_date'] = timezone.now()
        
        elif end_date and not start_date:
            # Default start date to 30 days before if only end date provided
            data['start_date'] = end_date - timedelta(days=30)
        
        else:
            # Default to last 30 days if no dates provided
            data['end_date'] = timezone.now()
            data['start_date'] = timezone.now() - timedelta(days=30)
        
        return data
    
    def get_statistics(self, subscription) -> Dict[str, Any]:
        """
        Generate comprehensive subscription statistics
        
        Args:
            subscription: Subscription instance
        
        Returns:
            Dict with subscription statistics
        """
        validated_data = self.validated_data
        start_date = validated_data['start_date']
        end_date = validated_data['end_date']
        group_by = validated_data['group_by']
        
        from service_operations.models import UsageTracking, ActivationQueue, OperationLog
        from django.db.models import Sum, Avg, Count, Max, Min
        from django.db.models.functions import Trunc
        
        statistics = {
            'subscription_id': str(subscription.id),
            'client_id': str(subscription.client_id),
            'client_type': subscription.client_type,
            'period': {
                'start': start_date.isoformat(),
                'end': end_date.isoformat(),
                'duration_days': (end_date - start_date).days
            },
            'group_by': group_by,
            'generated_at': timezone.now().isoformat()
        }
        
        # Usage statistics
        if validated_data['include_usage_details']:
            usage_records = UsageTracking.objects.filter(
                subscription=subscription,
                session_start__gte=start_date,
                session_start__lte=end_date
            )
            
            usage_stats = usage_records.aggregate(
                total_sessions=Count('id'),
                total_data_bytes=Sum('data_used_bytes'),
                total_time_seconds=Sum('session_duration_seconds'),
                avg_data_rate=Avg('avg_data_rate'),
                peak_data_usage=Max('data_used_bytes'),
                avg_session_duration=Avg('session_duration_seconds')
            )
            
            # Grouped usage by time period
            if group_by in ['hour', 'day', 'week', 'month']:
                trunc_kwarg = group_by
                grouped_usage = usage_records.annotate(
                    period=Trunc('session_start', trunc_kwarg)
                ).values('period').annotate(
                    sessions=Count('id'),
                    data_used=Sum('data_used_bytes'),
                    time_used=Sum('session_duration_seconds')
                ).order_by('period')
                
                usage_stats['grouped_usage'] = [
                    {
                        'period': item['period'].isoformat(),
                        'sessions': item['sessions'],
                        'data_used_bytes': item['data_used'],
                        'data_used_display': format_bytes_human_readable(item['data_used']),
                        'time_used_seconds': item['time_used'],
                        'time_used_display': format_seconds_human_readable(item['time_used'])
                    }
                    for item in grouped_usage
                ]
            
            statistics['usage_statistics'] = {
                'summary': {
                    'total_sessions': usage_stats['total_sessions'] or 0,
                    'total_data_bytes': usage_stats['total_data_bytes'] or 0,
                    'total_data_display': format_bytes_human_readable(usage_stats['total_data_bytes'] or 0),
                    'total_time_seconds': usage_stats['total_time_seconds'] or 0,
                    'total_time_display': format_seconds_human_readable(usage_stats['total_time_seconds'] or 0),
                    'average_data_rate': usage_stats['avg_data_rate'] or 0,
                    'peak_data_usage': usage_stats['peak_data_usage'] or 0,
                    'peak_data_display': format_bytes_human_readable(usage_stats['peak_data_usage'] or 0),
                    'average_session_duration': usage_stats['avg_session_duration'] or 0,
                    'average_session_display': format_seconds_human_readable(usage_stats['avg_session_duration'] or 0)
                },
                'current_usage_percentage': calculate_usage_percentage(
                    subscription.used_data_bytes,
                    subscription.data_limit_bytes
                ) if subscription.data_limit_bytes > 0 else 100.0
            }
        
        # Activation statistics
        if validated_data['include_activation_stats']:
            activation_records = ActivationQueue.objects.filter(
                subscription=subscription,
                created_at__gte=start_date,
                created_at__lte=end_date
            )
            
            activation_stats = activation_records.aggregate(
                total_attempts=Count('id'),
                successful=Count('id', filter=models.Q(status='completed')),
                failed=Count('id', filter=models.Q(status='failed')),
                avg_processing_time=Avg('processing_duration_seconds')
            )
            
            # Activation success rate
            total_attempts = activation_stats['total_attempts'] or 0
            successful = activation_stats['successful'] or 0
            success_rate = (successful / total_attempts * 100) if total_attempts > 0 else 0
            
            statistics['activation_statistics'] = {
                'total_attempts': total_attempts,
                'successful_attempts': successful,
                'failed_attempts': activation_stats['failed'] or 0,
                'success_rate': round(success_rate, 1),
                'average_processing_time_seconds': activation_stats['avg_processing_time'] or 0,
                'average_processing_display': format_seconds_human_readable(activation_stats['avg_processing_time'] or 0)
            }
        
        # Financial statistics (if enabled)
        if validated_data['include_financial_stats']:
            # Note: This would typically integrate with your payment system
            # Placeholder for financial statistics
            statistics['financial_statistics'] = {
                'total_revenue': 0.0,  # Would come from payment system
                'average_revenue_per_day': 0.0,
                'renewal_rate': 0.0,
                'payment_methods': {}
            }
        
        # Performance metrics
        operation_logs = OperationLog.objects.filter(
            subscription=subscription,
            created_at__gte=start_date,
            created_at__lte=end_date
        )
        
        error_count = operation_logs.filter(
            severity__in=['error', 'critical']
        ).count()
        
        statistics['performance_metrics'] = {
            'total_operations': operation_logs.count(),
            'error_count': error_count,
            'error_rate': (error_count / max(operation_logs.count(), 1)) * 100,
            'average_operation_duration_ms': operation_logs.aggregate(
                avg_duration=Avg('duration_ms')
            )['avg_duration'] or 0
        }
        
        # Subscription health score
        health_score = self.calculate_health_score(subscription, statistics)
        statistics['health_score'] = health_score
        
        return statistics
    
    def calculate_health_score(self, subscription, statistics) -> Dict[str, Any]:
        """
        Calculate subscription health score (0-100)
        
        Args:
            subscription: Subscription instance
            statistics: Pre-calculated statistics
        
        Returns:
            Dict with health score breakdown
        """
        score = 100
        factors = []
        
        # 1. Usage health (max 30 points)
        usage_percentage = calculate_usage_percentage(
            subscription.used_data_bytes,
            subscription.data_limit_bytes
        ) if subscription.data_limit_bytes > 0 else 0
        
        if usage_percentage > 90:
            usage_score = 10  # Critical
            factors.append({'factor': 'usage', 'status': 'critical', 'score': usage_score})
        elif usage_percentage > 75:
            usage_score = 20  # Warning
            factors.append({'factor': 'usage', 'status': 'warning', 'score': usage_score})
        else:
            usage_score = 30  # Good
            factors.append({'factor': 'usage', 'status': 'good', 'score': usage_score})
        
        # 2. Activation success rate (max 30 points)
        activation_stats = statistics.get('activation_statistics', {})
        success_rate = activation_stats.get('success_rate', 100)
        
        if success_rate < 80:
            activation_score = 10  # Critical
            factors.append({'factor': 'activation', 'status': 'critical', 'score': activation_score})
        elif success_rate < 95:
            activation_score = 20  # Warning
            factors.append({'factor': 'activation', 'status': 'warning', 'score': activation_score})
        else:
            activation_score = 30  # Good
            factors.append({'factor': 'activation', 'status': 'good', 'score': activation_score})
        
        # 3. Error rate (max 20 points)
        perf_metrics = statistics.get('performance_metrics', {})
        error_rate = perf_metrics.get('error_rate', 0)
        
        if error_rate > 10:
            error_score = 5  # Critical
            factors.append({'factor': 'error_rate', 'status': 'critical', 'score': error_score})
        elif error_rate > 5:
            error_score = 10  # Warning
            factors.append({'factor': 'error_rate', 'status': 'warning', 'score': error_score})
        else:
            error_score = 20  # Good
            factors.append({'factor': 'error_rate', 'status': 'good', 'score': error_score})
        
        # 4. Time remaining (max 20 points)
        if subscription.end_date:
            time_remaining = (subscription.end_date - timezone.now()).total_seconds()
            if time_remaining <= 0:
                time_score = 0  # Expired
                factors.append({'factor': 'time_remaining', 'status': 'critical', 'score': time_score})
            elif time_remaining < 24 * 3600:  # Less than 24 hours
                time_score = 5  # Warning
                factors.append({'factor': 'time_remaining', 'status': 'warning', 'score': time_score})
            elif time_remaining < 7 * 24 * 3600:  # Less than 7 days
                time_score = 10  # Caution
                factors.append({'factor': 'time_remaining', 'status': 'caution', 'score': time_score})
            else:
                time_score = 20  # Good
                factors.append({'factor': 'time_remaining', 'status': 'good', 'score': time_score})
        else:
            time_score = 20  # No expiration (unlimited)
            factors.append({'factor': 'time_remaining', 'status': 'good', 'score': time_score})
        
        total_score = usage_score + activation_score + error_score + time_score
        
        # Determine overall status
        if total_score >= 85:
            overall_status = 'excellent'
        elif total_score >= 70:
            overall_status = 'good'
        elif total_score >= 50:
            overall_status = 'fair'
        elif total_score >= 30:
            overall_status = 'poor'
        else:
            overall_status = 'critical'
        
        return {
            'score': total_score,
            'status': overall_status,
            'factors': factors,
            'breakdown': {
                'usage': usage_score,
                'activation': activation_score,
                'error_rate': error_score,
                'time_remaining': time_score
            }
        }