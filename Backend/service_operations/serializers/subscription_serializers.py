# """
# Subscription Serializers for dynamic subscription management
# Production-ready with comprehensive validation
# """

# from rest_framework import serializers
# from django.utils import timezone
# from django.core.exceptions import ValidationError
# from django.core.cache import cache
# from django.db import transaction
# import logging
# import uuid
# import re
# from typing import Dict, Any, Optional
# from datetime import timedelta 

# from service_operations.models import Subscription, UsageTracking
# from service_operations.utils.validators import (
#     validate_mac_address,
#     validate_duration_hours,
#     validate_network_config,
# )
# from service_operations.utils.formatters import (
#     format_bytes_human_readable,
#     format_seconds_human_readable,
#     calculate_usage_percentage,
# )

# logger = logging.getLogger(__name__)


# class SubscriptionSerializer(serializers.ModelSerializer):
#     """
#     Base subscription serializer with dynamic field calculation
#     """
    
#     # Computed fields
#     remaining_data_bytes = serializers.IntegerField(read_only=True)
#     remaining_time_seconds = serializers.IntegerField(read_only=True)
#     is_expired = serializers.BooleanField(read_only=True)
#     can_be_activated = serializers.BooleanField(read_only=True)
#     usage_percentage = serializers.DictField(read_only=True)
#     client_type_display = serializers.CharField(source='get_client_type_display', read_only=True)
#     access_method_display = serializers.CharField(source='get_access_method_display', read_only=True)
#     status_display = serializers.CharField(source='get_status_display', read_only=True)
    
#     # Formatted fields for frontend
#     data_used_display = serializers.SerializerMethodField()
#     data_remaining_display = serializers.SerializerMethodField()
#     time_used_display = serializers.SerializerMethodField()
#     time_remaining_display = serializers.SerializerMethodField()
#     duration_display = serializers.SerializerMethodField()
    
#     class Meta:
#         model = Subscription
#         fields = [
#             'id', 'client_id', 'internet_plan_id', 'client_type', 'client_type_display',
#             'access_method', 'access_method_display', 'status', 'status_display',
#             'router_id', 'hotspot_mac_address', 'pppoe_username', 'pppoe_password',
#             'payment_reference', 'payment_method', 'payment_confirmed_at',
#             'start_date', 'end_date', 'scheduled_activation',
#             'used_data_bytes', 'data_used_display',
#             'used_time_seconds', 'time_used_display',
#             'data_limit_bytes', 'time_limit_seconds',
#             'remaining_data_bytes', 'data_remaining_display',
#             'remaining_time_seconds', 'time_remaining_display',
#             'activation_attempts', 'activation_successful', 'activation_error',
#             'activation_completed_at', 'auto_renew', 'parent_subscription',
#             'is_expired', 'can_be_activated', 'usage_percentage',
#             'duration_display', 'metadata', 'is_active',
#             'created_at', 'updated_at', 'last_usage_update',
#         ]
#         read_only_fields = [
#             'id', 'created_at', 'updated_at', 'payment_confirmed_at',
#             'activation_completed_at', 'last_usage_update',
#             'remaining_data_bytes', 'remaining_time_seconds',
#             'is_expired', 'can_be_activated', 'usage_percentage',
#         ]
    
#     def get_data_used_display(self, obj) -> str:
#         return format_bytes_human_readable(obj.used_data_bytes)
    
#     def get_data_remaining_display(self, obj) -> str:
#         if obj.data_limit_bytes == 0:
#             return "Unlimited"
#         return format_bytes_human_readable(obj.remaining_data_bytes)
    
#     def get_time_used_display(self, obj) -> str:
#         return format_seconds_human_readable(obj.used_time_seconds)
    
#     def get_time_remaining_display(self, obj) -> str:
#         if obj.time_limit_seconds == 0:
#             return "Unlimited"
#         return format_seconds_human_readable(obj.remaining_time_seconds)
    
#     def get_duration_display(self, obj) -> Optional[str]:
#         if obj.start_date and obj.end_date:
#             duration = obj.end_date - obj.start_date
#             days = duration.days
#             hours = duration.seconds // 3600
#             if days > 0:
#                 return f"{days} day{'s' if days != 1 else ''}"
#             elif hours > 0:
#                 return f"{hours} hour{'s' if hours != 1 else ''}"
#         return None
    
#     def validate(self, data: Dict[str, Any]) -> Dict[str, Any]:
#         """Comprehensive validation"""
#         errors = {}
        
#         # Validate client type and access method consistency
#         client_type = data.get('client_type', getattr(self.instance, 'client_type', None))
#         access_method = data.get('access_method', getattr(self.instance, 'access_method', None))
        
#         if client_type and access_method:
#             if client_type == 'hotspot_client' and access_method != 'hotspot':
#                 errors['access_method'] = 'Hotspot clients must use hotspot access method'
#             if client_type == 'pppoe_client' and access_method != 'pppoe':
#                 errors['access_method'] = 'PPPoE clients must use PPPoE access method'
        
#         # Validate MAC address
#         if 'hotspot_mac_address' in data and data['hotspot_mac_address']:
#             if not validate_mac_address(data['hotspot_mac_address']):
#                 errors['hotspot_mac_address'] = 'Invalid MAC address format'
        
#         # Validate payment reference format
#         if 'payment_reference' in data and data['payment_reference']:
#             if len(data['payment_reference']) < 5 or len(data['payment_reference']) > 100:
#                 errors['payment_reference'] = 'Payment reference must be 5-100 characters'
#             if not re.match(r'^[a-zA-Z0-9_-]+$', data['payment_reference']):
#                 errors['payment_reference'] = 'Invalid payment reference format'
        
#         # Validate metadata size
#         if 'metadata' in data:
#             if len(str(data['metadata'])) > 5000:
#                 errors['metadata'] = 'Metadata too large (max 5000 characters)'
        
#         if errors:
#             logger.warning(f"Subscription validation failed: {errors}")
#             raise serializers.ValidationError(errors)
        
#         return data


# class SubscriptionCreateSerializer(serializers.Serializer):
#     """
#     Serializer for creating new subscriptions dynamically
#     """
    
#     # Required fields
#     client_id = serializers.UUIDField(required=True)
#     internet_plan_id = serializers.UUIDField(required=True)
#     client_type = serializers.ChoiceField(
#         choices=Subscription.CLIENT_TYPE_CHOICES,
#         required=True
#     )
    
#     # Optional fields with defaults
#     access_method = serializers.ChoiceField(
#         choices=Subscription.ACCESS_METHOD_CHOICES,
#         default='hotspot'
#     )
    
#     router_id = serializers.IntegerField(
#         required=False,
#         allow_null=True,
#         min_value=1
#     )
    
#     hotspot_mac_address = serializers.CharField(
#         required=False,
#         allow_null=True,
#         allow_blank=True,
#         max_length=17
#     )
    
#     duration_hours = serializers.IntegerField(
#         required=False,
#         min_value=1,
#         max_value=744,  # 31 days
#         default=24
#     )
    
#     scheduled_activation = serializers.DateTimeField(
#         required=False,
#         allow_null=True
#     )
    
#     auto_renew = serializers.BooleanField(default=False)
#     metadata = serializers.JSONField(required=False, default=dict)
    
#     def validate(self, data: Dict[str, Any]) -> Dict[str, Any]:
#         """Validate subscription creation data"""
#         errors = {}
        
#         # Validate client type specific requirements
#         client_type = data.get('client_type')
#         access_method = data.get('access_method', 'hotspot')
        
#         if client_type == 'hotspot_client':
#             if access_method != 'hotspot':
#                 errors['access_method'] = 'Hotspot clients must use hotspot access method'
            
#             # MAC address is optional but recommended
#             mac_address = data.get('hotspot_mac_address')
#             if mac_address and not validate_mac_address(mac_address):
#                 errors['hotspot_mac_address'] = 'Invalid MAC address format'
        
#         elif client_type == 'pppoe_client':
#             if access_method != 'pppoe':
#                 errors['access_method'] = 'PPPoE clients must use PPPoE access method'
        
#         # Validate duration
#         duration_hours = data.get('duration_hours', 24)
#         if not validate_duration_hours(duration_hours):
#             errors['duration_hours'] = 'Duration must be between 1 and 744 hours'
        
#         # Validate scheduled activation
#         scheduled_activation = data.get('scheduled_activation')
#         if scheduled_activation:
#             if scheduled_activation <= timezone.now():
#                 errors['scheduled_activation'] = 'Scheduled activation must be in the future'
#             if scheduled_activation > timezone.now() + timezone.timedelta(days=30):
#                 errors['scheduled_activation'] = 'Cannot schedule activation more than 30 days in advance'
        
#         if errors:
#             logger.warning(f"Subscription creation validation failed: {errors}")
#             raise serializers.ValidationError(errors)
        
#         return data
    
#     def create(self, validated_data: Dict[str, Any]) -> Subscription:
#         """Create subscription with dynamic configuration"""
#         from service_operations.services.subscription_service import SubscriptionService
        
#         try:
#             subscription = SubscriptionService.create_subscription(
#                 client_id=str(validated_data['client_id']),
#                 internet_plan_id=str(validated_data['internet_plan_id']),
#                 client_type=validated_data['client_type'],
#                 access_method=validated_data.get('access_method', 'hotspot'),
#                 router_id=validated_data.get('router_id'),
#                 hotspot_mac_address=validated_data.get('hotspot_mac_address'),
#                 duration_hours=validated_data.get('duration_hours', 24),
#                 scheduled_activation=validated_data.get('scheduled_activation'),
#                 auto_renew=validated_data.get('auto_renew', False),
#                 metadata=validated_data.get('metadata', {})
#             )
            
#             logger.info(f"Subscription created: {subscription.id}")
#             return subscription
            
#         except Exception as e:
#             logger.error(f"Failed to create subscription: {e}")
#             raise serializers.ValidationError(f"Failed to create subscription: {str(e)}")


# class SubscriptionUpdateSerializer(serializers.ModelSerializer):
#     """
#     Serializer for updating subscriptions with limited fields
#     """
    
#     class Meta:
#         model = Subscription
#         fields = [
#             'hotspot_mac_address',
#             'router_id',
#             'auto_renew',
#             'metadata',
#         ]
    
#     def validate(self, data: Dict[str, Any]) -> Dict[str, Any]:
#         """Validate update data"""
#         errors = {}
        
#         instance = self.instance
        
#         # Validate MAC address if changing for hotspot client
#         if 'hotspot_mac_address' in data and data['hotspot_mac_address']:
#             if instance.client_type == 'hotspot_client':
#                 if not validate_mac_address(data['hotspot_mac_address']):
#                     errors['hotspot_mac_address'] = 'Invalid MAC address format'
#             else:
#                 errors['hotspot_mac_address'] = 'MAC address only applicable for hotspot clients'
        
#         # Cannot update subscription that's not active
#         if instance.status not in ['draft', 'pending_activation', 'active', 'suspended']:
#             errors['non_field_errors'] = 'Cannot update subscription in current status'
        
#         if errors:
#             raise serializers.ValidationError(errors)
        
#         return data
    
#     def update(self, instance: Subscription, validated_data: Dict[str, Any]) -> Subscription:
#         """Update subscription with cache invalidation"""
#         # Update fields
#         for attr, value in validated_data.items():
#             setattr(instance, attr, value)
        
#         # Validate and save
#         instance.full_clean()
#         instance.save()
        
#         # Invalidate cache
#         cache.delete(f"subscription:{instance.id}")
        
#         logger.info(f"Subscription updated: {instance.id}")
#         return instance


# class SubscriptionActivationSerializer(serializers.Serializer):
#     """
#     Serializer for activating subscriptions after payment
#     """
    
#     payment_reference = serializers.CharField(
#         max_length=100,
#         required=True,
#         help_text="Payment transaction reference"
#     )
    
#     payment_method = serializers.ChoiceField(
#         choices=[
#             ('mpesa_till', 'M-Pesa Till'),
#             ('mpesa_paybill', 'M-Pesa Paybill'),
#             ('paypal', 'PayPal'),
#             ('bank_transfer', 'Bank Transfer'),
#             ('card', 'Credit/Debit Card'),
#         ],
#         required=True,
#         help_text="Payment method used"
#     )
    
#     activate_immediately = serializers.BooleanField(
#         default=True,
#         help_text="Activate immediately or use scheduled time"
#     )
    
#     priority = serializers.IntegerField(
#         min_value=1,
#         max_value=6,
#         default=3,
#         help_text="Activation priority"
#     )
    
#     metadata = serializers.JSONField(
#         required=False,
#         default=dict,
#         help_text="Additional activation metadata"
#     )
    
#     def validate(self, data: Dict[str, Any]) -> Dict[str, Any]:
#         """Validate activation request"""
#         errors = {}
        
#         # Validate payment reference
#         payment_ref = data.get('payment_reference')
#         if not payment_ref or len(payment_ref) < 5:
#             errors['payment_reference'] = 'Valid payment reference required'
        
#         if errors:
#             raise serializers.ValidationError(errors)
        
#         return data


# class SubscriptionRenewSerializer(serializers.Serializer):
#     """
#     Serializer for renewing subscriptions dynamically
#     """
    
#     new_plan_id = serializers.UUIDField(
#         required=False,
#         allow_null=True,
#         help_text="New plan ID (defaults to current plan)"
#     )
    
#     duration_hours = serializers.IntegerField(
#         required=False,
#         min_value=1,
#         max_value=744,
#         default=None,
#         allow_null=True,
#         help_text="Duration in hours (defaults to plan duration)"
#     )
    
#     auto_renew = serializers.BooleanField(
#         default=None,
#         allow_null=True,
#         help_text="Enable auto-renew for renewed subscription"
#     )
    
#     metadata = serializers.JSONField(
#         required=False,
#         default=dict,
#         help_text="Renewal metadata"
#     )
    
#     def validate(self, data: Dict[str, Any]) -> Dict[str, Any]:
#         """Validate renewal request"""
#         errors = {}
        
#         # Validate duration
#         duration_hours = data.get('duration_hours')
#         if duration_hours is not None and not validate_duration_hours(duration_hours):
#             errors['duration_hours'] = 'Duration must be between 1 and 744 hours'
        
#         if errors:
#             raise serializers.ValidationError(errors)
        
#         return data




# class SubscriptionSuspendSerializer(serializers.Serializer):
#     """
#     Serializer for suspending subscriptions
#     """
    
#     reason = serializers.CharField(
#         required=True,
#         max_length=255,
#         help_text="Reason for suspension"
#     )
    
#     suspend_immediately = serializers.BooleanField(
#         default=True,
#         help_text="Suspend immediately or schedule"
#     )
    
#     scheduled_suspend = serializers.DateTimeField(
#         required=False,
#         allow_null=True,
#         help_text="Scheduled suspension time"
#     )
    
#     notify_client = serializers.BooleanField(
#         default=True,
#         help_text="Send notification to client"
#     )
    
#     metadata = serializers.JSONField(
#         required=False,
#         default=dict,
#         help_text="Suspension metadata"
#     )
    
#     def validate(self, data: Dict[str, Any]) -> Dict[str, Any]:
#         """Validate suspension request"""
#         errors = {}
        
#         # Validate scheduled suspension time
#         scheduled_suspend = data.get('scheduled_suspend')
#         if scheduled_suspend:
#             if scheduled_suspend <= timezone.now():
#                 errors['scheduled_suspend'] = 'Scheduled suspension must be in the future'
#             if scheduled_suspend > timezone.now() + timezone.timedelta(days=30):
#                 errors['scheduled_suspend'] = 'Cannot schedule suspension more than 30 days in advance'
        
#         # Validate reason
#         reason = data.get('reason', '').strip()
#         if not reason:
#             errors['reason'] = 'Suspension reason is required'
#         elif len(reason) < 10:
#             errors['reason'] = 'Reason should be at least 10 characters'
        
#         if errors:
#             raise serializers.ValidationError(errors)
        
#         return data




# class SubscriptionExtendSerializer(serializers.Serializer):
#     """
#     Serializer for extending subscription duration
#     """
    
#     extension_days = serializers.IntegerField(
#         required=False,
#         min_value=1,
#         max_value=365,
#         default=None,
#         allow_null=True,
#         help_text="Number of days to extend"
#     )
    
#     extension_hours = serializers.IntegerField(
#         required=False,
#         min_value=1,
#         max_value=744,
#         default=None,
#         allow_null=True,
#         help_text="Number of hours to extend"
#     )
    
#     new_end_date = serializers.DateTimeField(
#         required=False,
#         allow_null=True,
#         help_text="Specific new end date (alternative to duration)"
#     )
    
#     reason = serializers.CharField(
#         required=False,
#         max_length=255,
#         default="Subscription extension",
#         help_text="Reason for extension"
#     )
    
#     prorate_amount = serializers.DecimalField(
#         required=False,
#         max_digits=10,
#         decimal_places=2,
#         allow_null=True,
#         help_text="Prorated amount for extension"
#     )
    
#     notify_client = serializers.BooleanField(
#         default=True,
#         help_text="Send notification to client"
#     )
    
#     metadata = serializers.JSONField(
#         required=False,
#         default=dict,
#         help_text="Extension metadata"
#     )
    
#     def validate(self, data: Dict[str, Any]) -> Dict[str, Any]:
#         """Validate extension request"""
#         errors = {}
        
#         extension_days = data.get('extension_days')
#         extension_hours = data.get('extension_hours')
#         new_end_date = data.get('new_end_date')
        
#         # Validate that at least one extension method is provided
#         if not any([extension_days, extension_hours, new_end_date]):
#             errors['non_field_errors'] = 'Either extension_days, extension_hours, or new_end_date must be provided'
        
#         # Validate extension durations
#         if extension_days and extension_days > 365:
#             errors['extension_days'] = 'Cannot extend more than 365 days at once'
        
#         if extension_hours and extension_hours > 744:  # 31 days
#             errors['extension_hours'] = 'Cannot extend more than 744 hours (31 days) at once'
        
#         # Validate new end date
#         if new_end_date:
#             # Get current subscription end date
#             instance = self.context.get('subscription')
#             if instance and instance.end_date:
#                 if new_end_date <= instance.end_date:
#                     errors['new_end_date'] = 'New end date must be after current end date'
#                 if new_end_date > instance.end_date + timezone.timedelta(days=365):
#                     errors['new_end_date'] = 'Cannot extend more than 365 days from current end date'
#             else:
#                 if new_end_date <= timezone.now():
#                     errors['new_end_date'] = 'New end date must be in the future'
        
#         # Ensure only one extension method is used
#         method_count = sum([1 for x in [extension_days, extension_hours, new_end_date] if x is not None])
#         if method_count > 1:
#             errors['non_field_errors'] = 'Only one extension method (days, hours, or date) can be specified'
        
#         # Validate prorate amount if provided
#         prorate_amount = data.get('prorate_amount')
#         if prorate_amount is not None:
#             if prorate_amount < 0:
#                 errors['prorate_amount'] = 'Prorate amount cannot be negative'
        
#         if errors:
#             raise serializers.ValidationError(errors)
        
#         return data
    
#     def calculate_extension_duration(self, validated_data: Dict[str, Any], subscription) -> timedelta:
#         """
#         Calculate the extension duration based on provided parameters
        
#         Args:
#             validated_data: Validated serializer data
#             subscription: Subscription instance being extended
        
#         Returns:
#             timedelta: Duration to extend
#         """
#         extension_days = validated_data.get('extension_days')
#         extension_hours = validated_data.get('extension_hours')
#         new_end_date = validated_data.get('new_end_date')
        
#         if new_end_date:
#             # Calculate from new end date
#             current_end = subscription.end_date or timezone.now()
#             return new_end_date - current_end
#         elif extension_days:
#             return timedelta(days=extension_days)
#         elif extension_hours:
#             return timedelta(hours=extension_hours)
        
#         return timedelta(0)


# class SubscriptionUsageSerializer(serializers.Serializer):
#     """
#     Serializer for updating subscription usage from network management
#     """
    
#     data_used_bytes = serializers.IntegerField(
#         required=True,
#         min_value=0,
#         help_text="Data used in bytes"
#     )
    
#     time_used_seconds = serializers.IntegerField(
#         required=True,
#         min_value=0,
#         help_text="Time used in seconds"
#     )
    
#     session_id = serializers.CharField(
#         required=False,
#         allow_blank=True,
#         max_length=100,
#         help_text="Session ID for tracking"
#     )
    
#     device_id = serializers.CharField(
#         required=False,
#         allow_blank=True,
#         max_length=100,
#         help_text="Device identifier"
#     )
    
#     network_metrics = serializers.JSONField(
#         required=False,
#         default=dict,
#         help_text="Network performance metrics"
#     )
    
#     metadata = serializers.JSONField(
#         required=False,
#         default=dict,
#         help_text="Additional metadata"
#     )
    
#     def validate(self, data: Dict[str, Any]) -> Dict[str, Any]:
#         """Validate usage update"""
#         errors = {}
        
#         # Validate data usage is reasonable
#         data_used = data.get('data_used_bytes', 0)
#         if data_used > 10 * 1024 * 1024 * 1024:  # 10GB per update
#             errors['data_used_bytes'] = 'Data usage too high for single update'
        
#         # Validate time usage is reasonable
#         time_used = data.get('time_used_seconds', 0)
#         if time_used > 24 * 3600:  # 24 hours per update
#             errors['time_used_seconds'] = 'Time usage too high for single update'
        
#         if errors:
#             raise serializers.ValidationError(errors)
        
#         return data


# class SubscriptionListSerializer(serializers.ModelSerializer):
#     """
#     Optimized serializer for listing subscriptions
#     """
    
#     client_type_display = serializers.CharField(source='get_client_type_display', read_only=True)
#     status_display = serializers.CharField(source='get_status_display', read_only=True)
#     is_expired = serializers.BooleanField(read_only=True)
#     usage_percentage = serializers.DictField(read_only=True)
    
#     class Meta:
#         model = Subscription
#         fields = [
#             'id', 'client_id', 'internet_plan_id', 'client_type', 'client_type_display',
#             'access_method', 'status', 'status_display', 'payment_method',
#             'start_date', 'end_date', 'used_data_bytes', 'used_time_seconds',
#             'data_limit_bytes', 'time_limit_seconds', 'is_expired',
#             'usage_percentage', 'activation_successful', 'auto_renew',
#             'created_at',
#         ]
#         read_only_fields = fields


# class SubscriptionDetailSerializer(SubscriptionSerializer):
#     """
#     Detailed subscription serializer with related data
#     """
    
#     # Related usage records
#     recent_usage = serializers.SerializerMethodField()
    
#     # Activation history
#     activation_history = serializers.SerializerMethodField()
    
#     # Client operations
#     client_operations = serializers.SerializerMethodField()
    
#     class Meta:
#         model = Subscription
#         fields = SubscriptionSerializer.Meta.fields + [
#             'recent_usage',
#             'activation_history',
#             'client_operations',
#         ]
    
#     def get_recent_usage(self, obj) -> list:
#         """Get recent usage records"""
#         from service_operations.models import UsageTracking
        
#         records = UsageTracking.objects.filter(
#             subscription=obj
#         ).order_by('-session_start')[:10]
        
#         return [
#             {
#                 'id': str(record.id),
#                 'data_used_bytes': record.data_used_bytes,
#                 'data_used_display': format_bytes_human_readable(record.data_used_bytes),
#                 'time_used_seconds': record.session_duration_seconds,
#                 'time_used_display': format_seconds_human_readable(record.session_duration_seconds),
#                 'session_start': record.session_start.isoformat(),
#                 'session_end': record.session_end.isoformat(),
#                 'avg_data_rate': record.avg_data_rate,
#             }
#             for record in records
#         ]
    
#     def get_activation_history(self, obj) -> dict:
#         """Get activation history"""
#         from service_operations.models import ActivationQueue
        
#         activations = ActivationQueue.objects.filter(
#             subscription=obj
#         ).order_by('-created_at')[:5]
        
#         return {
#             'total_attempts': activations.count(),
#             'successful': activations.filter(status='completed').count(),
#             'failed': activations.filter(status='failed').count(),
#             'pending': activations.filter(status__in=['pending', 'processing', 'retrying']).count(),
#             'recent': [
#                 {
#                     'id': str(act.id),
#                     'activation_type': act.activation_type,
#                     'status': act.status,
#                     'created_at': act.created_at.isoformat(),
#                     'error_message': act.error_message,
#                 }
#                 for act in activations
#             ]
#         }
    
#     def get_client_operations(self, obj) -> list:
#         """Get related client operations"""
#         from service_operations.models import ClientOperation
        
#         operations = ClientOperation.objects.filter(
#             subscription=obj
#         ).order_by('-created_at')[:5]
        
#         return [
#             {
#                 'id': str(op.id),
#                 'operation_type': op.operation_type,
#                 'status': op.status,
#                 'title': op.title,
#                 'created_at': op.created_at.isoformat(),
#             }
#             for op in operations
#         ]







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

from service_operations.models import Subscription, UsageTracking, ClientOperation, ActivationQueue
from service_operations.utils.validators import (
    validate_mac_address,
    validate_duration_hours,
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
    
    renewal_strategy = serializers.ChoiceField(
        choices=[
            ('immediate', 'Immediate Renewal'),
            ('after_expiry', 'Renew After Expiry'),
            ('scheduled', 'Scheduled Renewal'),
        ],
        default='immediate'
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
    
    reactivation_date = serializers.DateTimeField(
        required=False,
        allow_null=True,
        help_text="Date to reactivate subscription"
    )
    
    duration_days = serializers.IntegerField(
        required=False,
        min_value=1,
        max_value=365,
        help_text="Duration of suspension in days"
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
        
        # Validate reactivation date
        reactivation_date = data.get('reactivation_date')
        if reactivation_date:
            if reactivation_date <= timezone.now():
                errors['reactivation_date'] = 'Reactivation date must be in the future'
        
        # Validate duration days
        duration_days = data.get('duration_days')
        if duration_days and duration_days > 365:
            errors['duration_days'] = 'Suspension duration cannot exceed 365 days'
        
        # Validate reason
        reason = data.get('reason', '').strip()
        if not reason:
            errors['reason'] = 'Suspension reason is required'
        elif len(reason) < 5:
            errors['reason'] = 'Reason should be at least 5 characters'
        
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
            # Get current subscription end date from context
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
        if data_used > 100 * 1024 * 1024 * 1024:  # 100GB per update
            errors['data_used_bytes'] = 'Data usage too high for single update'
        
        # Validate time usage is reasonable
        time_used = data.get('time_used_seconds', 0)
        if time_used > 7 * 24 * 3600:  # 1 week per update
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
    Serializer for subscription statistics
    """
    
    period_days = serializers.IntegerField(
        min_value=1,
        max_value=365,
        default=30,
        help_text="Number of days for statistics period"
    )
    
    client_type = serializers.ChoiceField(
        choices=Subscription.CLIENT_TYPE_CHOICES,
        required=False,
        allow_null=True,
        help_text="Filter by client type"
    )
    
    access_method = serializers.ChoiceField(
        choices=Subscription.ACCESS_METHOD_CHOICES,
        required=False,
        allow_null=True,
        help_text="Filter by access method"
    )
    
    status = serializers.ChoiceField(
        choices=Subscription.STATUS_CHOICES,
        required=False,
        allow_null=True,
        help_text="Filter by status"
    )


class SubscriptionSearchSerializer(serializers.Serializer):
    """
    Serializer for subscription search
    """
    
    q = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=100,
        help_text="Search query"
    )
    
    client_id = serializers.UUIDField(
        required=False,
        allow_null=True,
        help_text="Filter by client ID"
    )
    
    plan_id = serializers.UUIDField(
        required=False,
        allow_null=True,
        help_text="Filter by plan ID"
    )
    
    status = serializers.CharField(
        required=False,
        allow_null=True,
        max_length=20,
        help_text="Filter by status"
    )
    
    client_type = serializers.CharField(
        required=False,
        allow_null=True,
        max_length=20,
        help_text="Filter by client type"
    )
    
    access_method = serializers.CharField(
        required=False,
        allow_null=True,
        max_length=10,
        help_text="Filter by access method"
    )
    
    sort_by = serializers.CharField(
        required=False,
        default='-created_at',
        help_text="Field to sort by"
    )
    
    sort_order = serializers.ChoiceField(
        choices=[('asc', 'Ascending'), ('desc', 'Descending')],
        default='desc',
        required=False,
        help_text="Sort order"
    )