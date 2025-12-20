"""
Client Serializers for dynamic client operations
Production-ready with comprehensive validation for both client types
"""

from rest_framework import serializers
from django.utils import timezone
from django.core.exceptions import ValidationError
import logging
import uuid
import re
from typing import Dict, Any, Optional

from service_operations.models import ClientOperation, Subscription
from service_operations.utils.validators import (
    validate_mac_address,
    validate_phone_number,
    validate_email,
)

logger = logging.getLogger(__name__)


class ClientSubscriptionRequestSerializer(serializers.Serializer):
    """
    Serializer for client subscription requests from captive portal
    """
    
    # Client identification
    client_id = serializers.UUIDField(required=True)
    client_type = serializers.ChoiceField(
        choices=[
            ('hotspot_client', 'Hotspot Client'),
            ('pppoe_client', 'PPPoE Client'),
        ],
        required=True
    )
    
    # Plan selection
    internet_plan_id = serializers.UUIDField(required=True)
    
    # Client-specific data
    hotspot_mac_address = serializers.CharField(
        required=False,
        allow_null=True,
        allow_blank=True,
        max_length=17,
        help_text="MAC address for hotspot clients"
    )
    
    # Payment method (from available payment methods)
    payment_method = serializers.ChoiceField(
        choices=[
            ('mpesa_till', 'M-Pesa Till'),
            ('mpesa_paybill', 'M-Pesa Paybill'),
            ('paypal', 'PayPal'),
            ('bank_transfer', 'Bank Transfer'),
        ],
        required=True
    )
    
    # Duration (optional - defaults to plan duration)
    duration_hours = serializers.IntegerField(
        required=False,
        min_value=1,
        max_value=744,
        default=24
    )
    
    # Additional data
    metadata = serializers.JSONField(required=False, default=dict)
    
    def validate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate client subscription request"""
        errors = {}
        
        client_type = data.get('client_type')
        hotspot_mac = data.get('hotspot_mac_address')
        
        # Validate client type specific requirements
        if client_type == 'hotspot_client':
            if not hotspot_mac:
                errors['hotspot_mac_address'] = 'MAC address required for hotspot clients'
            elif hotspot_mac and not validate_mac_address(hotspot_mac):
                errors['hotspot_mac_address'] = 'Invalid MAC address format'
        
        elif client_type == 'pppoe_client':
            # PPPoE clients don't need MAC address
            pass
        
        # Validate duration
        duration_hours = data.get('duration_hours', 24)
        if duration_hours < 1 or duration_hours > 744:
            errors['duration_hours'] = 'Duration must be 1-744 hours'
        
        # Validate metadata size
        metadata = data.get('metadata', {})
        if len(str(metadata)) > 2000:
            errors['metadata'] = 'Metadata too large'
        
        if errors:
            logger.warning(f"Client subscription request validation failed: {errors}")
            raise serializers.ValidationError(errors)
        
        return data


class ClientPurchaseRequestSerializer(serializers.Serializer):
    """
    Serializer for client purchase requests (payment initiation)
    """
    
    # Subscription reference
    subscription_id = serializers.UUIDField(required=True)
    
    # Payment details
    payment_method = serializers.ChoiceField(
        choices=[
            ('mpesa_till', 'M-Pesa Till'),
            ('mpesa_paybill', 'M-Pesa Paybill'),
            ('paypal', 'PayPal'),
            ('bank_transfer', 'Bank Transfer'),
            ('card', 'Credit/Debit Card'),
        ],
        required=True
    )
    
    # Customer information for payment
    customer_phone = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=20,
        help_text="Customer phone for payment notifications"
    )
    
  
    
    # Payment metadata
    payment_metadata = serializers.JSONField(
        required=False,
        default=dict,
        help_text="Additional payment metadata"
    )
    
    # Callback URL for payment notifications
    callback_url = serializers.URLField(
        required=False,
        allow_blank=True,
        help_text="Callback URL for payment notifications"
    )
    
    def validate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate purchase request"""
        errors = {}
        
        # Validate customer phone
        customer_phone = data.get('customer_phone')
        if customer_phone:
            is_valid, normalized = validate_phone_number(customer_phone)
            if not is_valid:
                errors['customer_phone'] = 'Invalid phone number format'
            else:
                data['customer_phone'] = normalized
       
        
        # Validate payment metadata
        payment_metadata = data.get('payment_metadata', {})
        if len(str(payment_metadata)) > 1000:
            errors['payment_metadata'] = 'Payment metadata too large'
        
        if errors:
            raise serializers.ValidationError(errors)
        
        return data


class ClientPaymentCallbackSerializer(serializers.Serializer):
    """
    Serializer for payment callbacks from payment gateway
    Production-ready with security validation
    """
    
    # Core fields
    reference = serializers.CharField(required=True, max_length=100)
    status = serializers.ChoiceField(
        choices=[
            ('completed', 'Completed'),
            ('failed', 'Failed'),
            ('pending', 'Pending'),
            ('cancelled', 'Cancelled'),
        ],
        required=True
    )
    
    subscription_id = serializers.UUIDField(required=True)
    
    # Payment details
    amount = serializers.DecimalField(
        required=True,
        max_digits=10,
        decimal_places=2,
        min_value=0.01
    )
    
    currency = serializers.CharField(
        required=True,
        default='KES',
        max_length=3
    )
    
    payment_method = serializers.CharField(required=True)
    payment_date = serializers.DateTimeField(required=True)
    
    # Error information
    error_message = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=500
    )
    
    error_code = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=50
    )
    
    # Security fields
    signature = serializers.CharField(required=True)
    timestamp = serializers.CharField(required=True)
    
    # Metadata
    metadata = serializers.JSONField(required=False, default=dict)
    
    def validate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate payment callback with security checks"""
        errors = {}
        
        # Validate currency
        currency = data.get('currency', 'KES')
        valid_currencies = ['KES', 'USD', 'EUR', 'GBP']
        if currency not in valid_currencies:
            errors['currency'] = f'Invalid currency. Must be: {", ".join(valid_currencies)}'
        
        # Validate payment date
        payment_date = data.get('payment_date')
        if payment_date:
            if payment_date > timezone.now() + timezone.timedelta(minutes=5):
                errors['payment_date'] = 'Payment date cannot be in the future'
        
        # Validate amount for completed payments
        status = data.get('status')
        amount = data.get('amount')
        
        if status == 'completed' and amount <= 0:
            errors['amount'] = 'Amount must be positive for completed payments'
        
        # Validate error fields for failed payments
        if status == 'failed':
            if not data.get('error_message'):
                errors['error_message'] = 'Error message required for failed payments'
        
        # Validate signature format (HMAC SHA256 hex digest)
        signature = data.get('signature')
        if signature and len(signature) != 64:  # SHA256 hex digest length
            errors['signature'] = 'Invalid signature format'
        
        if errors:
            logger.warning(f"Payment callback validation failed: {errors}")
            raise serializers.ValidationError(errors)
        
        return data
    
    def validate_timestamp(self, value: str) -> str:
        """Validate timestamp to prevent replay attacks"""
        try:
            timestamp = timezone.datetime.fromisoformat(value.replace('Z', '+00:00'))
            
            # Check if timestamp is within acceptable range (5 minutes)
            now = timezone.now()
            time_diff = abs((now - timestamp).total_seconds())
            
            if time_diff > 300:  # 5 minutes
                raise serializers.ValidationError('Timestamp is too old or in the future')
            
            return value
            
        except (ValueError, TypeError):
            raise serializers.ValidationError('Invalid timestamp format')


class ClientRenewalSerializer(serializers.Serializer):
    """
    Serializer for client subscription renewals
    """
    
    # Renewal options
    duration_hours = serializers.IntegerField(
        required=False,
        min_value=1,
        max_value=744,
        default=None,
        allow_null=True
    )
    
    new_plan_id = serializers.UUIDField(
        required=False,
        allow_null=True
    )
    
    # Payment method for renewal
    payment_method = serializers.ChoiceField(
        choices=[
            ('mpesa_till', 'M-Pesa Till'),
            ('mpesa_paybill', 'M-Pesa Paybill'),
            ('paypal', 'PayPal'),
            ('bank_transfer', 'Bank Transfer'),
        ],
        required=True
    )
    
    # Renewal strategy
    renewal_strategy = serializers.ChoiceField(
        choices=[
            ('immediate', 'Immediate - Start renewal immediately'),
            ('after_expiry', 'After Expiry - Start renewal after current subscription expires'),
        ],
        default='immediate'
    )
    
    # Auto-renew settings
    enable_auto_renew = serializers.BooleanField(default=False)
    
    # Customer information
    customer_phone = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=20
    )
    
   
    # Payment metadata
    payment_metadata = serializers.JSONField(
        required=False,
        default=dict
    )
    
    def validate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate renewal request"""
        errors = {}
        
        # Validate customer phone
        customer_phone = data.get('customer_phone')
        if customer_phone:
            is_valid, normalized = validate_phone_number(customer_phone)
            if not is_valid:
                errors['customer_phone'] = 'Invalid phone number format'
            else:
                data['customer_phone'] = normalized
     


class ClientOperationSerializer(serializers.ModelSerializer):
    """
    Serializer for client operations
    """
    
    # Computed fields
    duration_seconds = serializers.IntegerField(read_only=True)
    progress_percentage = serializers.IntegerField(read_only=True)
    is_completed = serializers.BooleanField(read_only=True)
    
    # Display fields
    operation_type_display = serializers.CharField(
        source='get_operation_type_display',
        read_only=True
    )
    
    status_display = serializers.CharField(
        source='get_status_display',
        read_only=True
    )
    
    priority_display = serializers.CharField(
        source='get_priority_display',
        read_only=True
    )
    
    source_platform_display = serializers.CharField(
        source='get_source_platform_display',
        read_only=True
    )
    
    class Meta:
        model = ClientOperation
        fields = [
            'id', 'client_id', 'client_type', 'subscription',
            'operation_type', 'operation_type_display',
            'status', 'status_display',
            'priority', 'priority_display',
            'title', 'description',
            'source_platform', 'source_platform_display',
            'requested_at', 'started_at', 'completed_at',
            'result_data', 'error_message', 'error_details',
            'sla_due_at', 'sla_breached',
            'current_step', 'total_steps',
            'duration_seconds', 'progress_percentage', 'is_completed',
            'metadata', 'tags',
            'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at',
            'duration_seconds', 'progress_percentage', 'is_completed',
        ]


class ClientOperationCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating client operations
    """
    
    class Meta:
        model = ClientOperation
        fields = [
            'client_id', 'client_type', 'subscription',
            'operation_type', 'title', 'description',
            'source_platform', 'priority',
            'metadata', 'tags',
        ]
    
    def validate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate client operation creation"""
        errors = {}
        
        # Validate subscription exists if provided
        subscription = data.get('subscription')
        if subscription:
            try:
                Subscription.objects.get(id=subscription.id, is_active=True)
            except Subscription.DoesNotExist:
                errors['subscription'] = 'Subscription not found or inactive'
        
        # Validate client type consistency
        client_type = data.get('client_type')
        source_platform = data.get('source_platform')
        
        if client_type == 'hotspot_client' and source_platform != 'hotspot_portal':
            errors['source_platform'] = 'Hotspot client operations must come from hotspot portal'
        
        if client_type == 'pppoe_client' and source_platform != 'pppoe_portal':
            errors['source_platform'] = 'PPPoE client operations must come from PPPoE portal'
        
        # Validate title and description
        title = data.get('title', '')
        description = data.get('description', '')
        
        if len(title) < 5 or len(title) > 200:
            errors['title'] = 'Title must be 5-200 characters'
        
        if len(description) > 5000:
            errors['description'] = 'Description too long (max 5000 characters)'
        
        if errors:
            raise serializers.ValidationError(errors)
        
        return data
    
    def create(self, validated_data: Dict[str, Any]) -> ClientOperation:
        """Create client operation with SLA calculation"""
        operation = ClientOperation(**validated_data)
        
        # Set SLA based on operation type and priority
        if operation.operation_type in ['plan_purchase', 'payment_verification']:
            operation.sla_due_at = timezone.now() + timezone.timedelta(minutes=30)
        elif operation.operation_type in ['activation_request', 'emergency']:
            operation.sla_due_at = timezone.now() + timezone.timedelta(minutes=10)
        else:
            operation.sla_due_at = timezone.now() + timezone.timedelta(hours=24)
        
        operation.save()
        logger.info(f"Client operation created: {operation.id}")
        
        return operation