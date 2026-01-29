"""
Operation Serializers for system operations and monitoring
"""

from rest_framework import serializers
from django.utils import timezone
from django.core.exceptions import ValidationError
import logging
from typing import Dict, Any, Optional

from service_operations.models import ActivationQueue, OperationLog
from service_operations.models.subscription_models import Subscription
from service_operations.utils.formatters import (
    format_seconds_human_readable,
    format_bytes_human_readable,
)

logger = logging.getLogger(__name__)


class ActivationQueueSerializer(serializers.ModelSerializer):
    """
    Serializer for activation queue items with dynamic status
    """
    
    # Computed fields
    can_process = serializers.BooleanField(read_only=True)
    can_retry = serializers.BooleanField(read_only=True)
    is_urgent = serializers.BooleanField(read_only=True)
    processing_time_seconds = serializers.IntegerField(read_only=True)
    
    # Display fields
    priority_display = serializers.CharField(
        source='get_priority_display',
        read_only=True
    )
    
    status_display = serializers.CharField(
        source='get_status_display',
        read_only=True
    )
    
    activation_type_display = serializers.CharField(
        source='get_activation_type_display',
        read_only=True
    )
    
    # Related data
    subscription_details = serializers.SerializerMethodField()
    
    class Meta:
        model = ActivationQueue
        fields = [
            'id', 'subscription', 'subscription_details',
            'priority', 'priority_display',
            'status', 'status_display',
            'activation_type', 'activation_type_display',
            'processor_id', 'started_at', 'completed_at',
            'retry_count', 'max_retries', 'next_retry_at',
            'error_message', 'error_details',
            'estimated_duration_seconds', 'actual_duration_seconds',
            'can_process', 'can_retry', 'is_urgent',
            'processing_time_seconds',
            'router_id', 'network_config',
            'metadata', 'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at',
            'can_process', 'can_retry', 'is_urgent',
            'processing_time_seconds',
        ]
    
    def get_subscription_details(self, obj) -> Optional[dict]:
        """Get subscription details"""
        if not obj.subscription:
            return None
        
        return {
            'id': str(obj.subscription.id),
            'client_id': str(obj.subscription.client_id),
            'client_type': obj.subscription.client_type,
            'access_method': obj.subscription.access_method,
            'status': obj.subscription.status,
            'is_expired': obj.subscription.is_expired,
            'can_be_activated': obj.subscription.can_be_activated,
        }
    
    def validate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate activation queue data"""
        errors = {}
        
        # Validate priority
        if 'priority' in data:
            if not 1 <= data['priority'] <= 6:
                errors['priority'] = 'Priority must be 1-6'
        
        # Validate retry configuration
        if 'retry_count' in data and 'max_retries' in data:
            if data['retry_count'] > data['max_retries']:
                errors['retry_count'] = 'Retry count cannot exceed max retries'
        
        # Validate next retry time
        if 'next_retry_at' in data and data['next_retry_at']:
            if data['next_retry_at'] <= timezone.now():
                errors['next_retry_at'] = 'Next retry time must be in the future'
        
        if errors:
            raise serializers.ValidationError(errors)
        
        return data


class ActivationQueueCreateSerializer(serializers.Serializer):
    """
    Serializer for creating activation queue items
    """
    
    subscription_id = serializers.UUIDField(required=True)
    activation_type = serializers.ChoiceField(
        choices=ActivationQueue.ACTIVATION_TYPES,
        default='initial'
    )
    
    priority = serializers.IntegerField(
        min_value=1,
        max_value=6,
        default=3
    )
    
    router_id = serializers.IntegerField(
        required=False,
        allow_null=True
    )
    
    network_config = serializers.JSONField(
        required=False,
        default=dict
    )
    
    metadata = serializers.JSONField(
        required=False,
        default=dict
    )
    
    def validate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate activation queue creation"""
        errors = {}
        
        # Validate subscription exists
        subscription_id = data.get('subscription_id')
        try:
            subscription = Subscription.objects.get(id=subscription_id, is_active=True)
            data['_subscription'] = subscription
        except Subscription.DoesNotExist:
            errors['subscription_id'] = 'Subscription not found or inactive'
        
        # Validate subscription can be activated
        if '_subscription' in data:
            subscription = data['_subscription']
            if not subscription.can_be_activated:
                errors['subscription_id'] = 'Subscription cannot be activated'
        
        # Validate network config
        network_config = data.get('network_config', {})
        if len(str(network_config)) > 5000:
            errors['network_config'] = 'Network config too large'
        
        if errors:
            raise serializers.ValidationError(errors)
        
        return data
    
    def create(self, validated_data: Dict[str, Any]) -> ActivationQueue:
        """Create activation queue item"""
        subscription = validated_data['_subscription']
        
        activation = ActivationQueue.objects.create(
            subscription=subscription,
            activation_type=validated_data['activation_type'],
            priority=validated_data['priority'],
            router_id=validated_data.get('router_id'),
            network_config=validated_data.get('network_config', {}),
            metadata=validated_data.get('metadata', {})
        )
        
        logger.info(f"Activation queue item created: {activation.id}")
        return activation


class ActivationRetrySerializer(serializers.Serializer):
    """
    Serializer for retrying failed activations
    """
    
    force_retry = serializers.BooleanField(
        default=False,
        help_text="Force retry even if max retries reached"
    )
    
    reset_retry_count = serializers.BooleanField(
        default=False,
        help_text="Reset retry count to zero"
    )
    
    priority = serializers.IntegerField(
        required=False,
        min_value=1,
        max_value=6,
        default=None
    )
    
    delay_seconds = serializers.IntegerField(
        required=False,
        min_value=1,
        max_value=3600,
        default=300
    )
    
    metadata = serializers.JSONField(
        required=False,
        default=dict
    )
    
    def validate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate retry request"""
        errors = {}
        
        # Validate delay
        delay_seconds = data.get('delay_seconds', 300)
        if delay_seconds < 1 or delay_seconds > 3600:
            errors['delay_seconds'] = 'Delay must be 1-3600 seconds'
        
        if errors:
            raise serializers.ValidationError(errors)
        
        return data


class OperationLogSerializer(serializers.ModelSerializer):
    """
    Serializer for operation logs
    """
    
    # Display fields
    operation_type_display = serializers.CharField(
        source='get_operation_type_display',
        read_only=True
    )
    
    severity_display = serializers.CharField(
        source='get_severity_display',
        read_only=True
    )
    
    # Formatted fields
    duration_display = serializers.SerializerMethodField()
    source_display = serializers.SerializerMethodField()
    
    # Related data
    subscription_details = serializers.SerializerMethodField()
    client_operation_details = serializers.SerializerMethodField()
    
    class Meta:
        model = OperationLog
        fields = [
            'id', 'operation_type', 'operation_type_display',
            'severity', 'severity_display',
            'subscription', 'subscription_details',
            'client_operation', 'client_operation_details',
            'description', 'details',
            'error_message', 'error_traceback', 'error_code',
            'duration_ms', 'duration_display',
            'source_module', 'source_function', 'source_display',
            'source_ip', 'request_id', 'correlation_id',
            'metadata', 'created_at',
        ]
        read_only_fields = fields
    
    def get_duration_display(self, obj) -> str:
        """Format duration for display"""
        if obj.duration_ms < 1000:
            return f"{obj.duration_ms}ms"
        elif obj.duration_ms < 60000:
            return f"{obj.duration_ms/1000:.1f}s"
        else:
            return f"{obj.duration_ms/60000:.1f}min"
    
    def get_source_display(self, obj) -> str:
        """Format source for display"""
        return f"{obj.source_module}.{obj.source_function}"
    
    def get_subscription_details(self, obj) -> Optional[dict]:
        """Get subscription details"""
        if not obj.subscription:
            return None
        
        return {
            'id': str(obj.subscription.id),
            'client_id': str(obj.subscription.client_id),
            'client_type': obj.subscription.client_type,
            'status': obj.subscription.status,
        }
    
    def get_client_operation_details(self, obj) -> Optional[dict]:
        """Get client operation details"""
        if not obj.client_operation:
            return None
        
        return {
            'id': str(obj.client_operation.id),
            'operation_type': obj.client_operation.operation_type,
            'status': obj.client_operation.status,
        }


class OperationStatisticsSerializer(serializers.Serializer):
    """
    Serializer for operation statistics requests
    """
    
    start_date = serializers.DateTimeField(
        required=False,
        help_text="Start date for statistics"
    )
    
    end_date = serializers.DateTimeField(
        required=False,
        help_text="End date for statistics"
    )
    
    operation_type = serializers.ChoiceField(
        choices=OperationLog.OPERATION_TYPES,
        required=False,
        help_text="Filter by operation type"
    )
    
    severity = serializers.ChoiceField(
        choices=OperationLog.SEVERITY_LEVELS,
        required=False,
        help_text="Filter by severity"
    )
    
    subscription_id = serializers.UUIDField(
        required=False,
        help_text="Filter by subscription ID"
    )
    
    client_id = serializers.UUIDField(
        required=False,
        help_text="Filter by client ID"
    )
    
    source_module = serializers.CharField(
        required=False,
        max_length=100,
        help_text="Filter by source module"
    )
    
    def validate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate statistics request"""
        errors = {}
        
        # Validate date range
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        
        if start_date and end_date:
            if start_date > end_date:
                errors['start_date'] = 'Start date cannot be after end date'
            if (end_date - start_date).days > 365:
                errors['end_date'] = 'Date range cannot exceed 1 year'
        
        if errors:
            raise serializers.ValidationError(errors)
        
        return data