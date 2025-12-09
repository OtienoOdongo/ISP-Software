"""
Internet Plans - Subscription Serializers
Serializers for Subscriptions
"""

from rest_framework import serializers
from django.utils import timezone
from django.db import transaction
import logging

from internet_plans.models.subscription_models import Subscription
from internet_plans.models.plan_models import InternetPlan
from internet_plans.serializers.plan_serializers import InternetPlanSerializer

logger = logging.getLogger(__name__)


class SubscriptionSerializer(serializers.ModelSerializer):
    """Serializer for Subscriptions"""
    
    # Read-only fields
    clientInfo = serializers.SerializerMethodField(
        read_only=True
    )
    internetPlan = InternetPlanSerializer(
        source='internet_plan',
        read_only=True
    )
    routerInfo = serializers.SerializerMethodField(
        read_only=True
    )
    paymentReference = serializers.CharField(
        source='transaction_reference',
        read_only=True
    )
    remainingDataDisplay = serializers.SerializerMethodField(
        read_only=True
    )
    remainingTimeDisplay = serializers.SerializerMethodField(
        read_only=True
    )
    canActivate = serializers.SerializerMethodField(
        read_only=True
    )
    activationStatus = serializers.SerializerMethodField(
        read_only=True
    )
    startDate = serializers.DateTimeField(
        source='start_date',
        read_only=True
    )
    endDate = serializers.DateTimeField(
        source='end_date',
        read_only=True
    )
    lastActivity = serializers.DateTimeField(
        source='last_activity',
        read_only=True
    )
    isActive = serializers.BooleanField(
        source='is_active',
        read_only=True
    )
    
    # Write-only fields
    clientId = serializers.UUIDField(
        write_only=True,
        required=True
    )
    planId = serializers.UUIDField(
        write_only=True,
        required=True
    )
    routerId = serializers.IntegerField(
        write_only=True,
        required=False,
        allow_null=True
    )
    accessMethod = serializers.ChoiceField(
        choices=Subscription.ACCESS_METHOD_CHOICES,
        write_only=True,
        required=True
    )
    durationHours = serializers.IntegerField(
        write_only=True,
        required=False,
        min_value=1,
        max_value=744,  # 31 days
        default=24
    )
    macAddress = serializers.CharField(
        write_only=True,
        required=False,
        allow_null=True,
        allow_blank=True
    )
    
    class Meta:
        model = Subscription
        fields = [
            # Read-only fields
            'id', 'clientInfo', 'internetPlan', 'routerInfo', 'paymentReference',
            'remainingDataDisplay', 'remainingTimeDisplay', 'canActivate',
            'activationStatus', 'status', 'startDate', 'endDate', 'lastActivity',
            'isActive', 'activation_requested', 'activation_successful',
            'activation_error', 'activation_requested_at',
            
            # Write-only fields
            'clientId', 'planId', 'routerId', 'accessMethod', 'durationHours',
            'macAddress'
        ]
        read_only_fields = [
            'id', 'status', 'start_date', 'end_date', 'last_activity', 'is_active',
            'activation_requested', 'activation_successful', 'activation_error',
            'activation_requested_at'
        ]
    
    def get_clientInfo(self, obj):
        """Get client information"""
        try:
            from authentication.serializers import UserAccountSerializer
            client_data = UserAccountSerializer(obj.client).data
            
            return {
                'id': str(obj.client.id),
                'username': client_data.get('username'),
                'name': client_data.get('name'),
                'phoneNumber': client_data.get('phone_number'),
                'phoneNumberDisplay': client_data.get('phone_number_display'),
                'connectionType': client_data.get('connection_type'),
            }
        except ImportError:
            # Fallback if authentication app not available
            return {
                'id': str(obj.client.id),
                'username': getattr(obj.client, 'username', 'Unknown'),
            }
    
    def get_routerInfo(self, obj):
        """Get router information"""
        if not obj.router:
            return None
        
        from network_management.serializers import RouterSerializer
        return RouterSerializer(obj.router).data
    
    def get_remainingDataDisplay(self, obj):
        """Get remaining data display"""
        return obj.get_remaining_data_display()
    
    def get_remainingTimeDisplay(self, obj):
        """Get remaining time display"""
        return obj.get_remaining_time_display()
    
    def get_canActivate(self, obj):
        """Check if subscription can be activated"""
        return (
            obj.status == 'active' and 
            not obj.activation_requested and
            obj.router and
            obj.router.status == 'connected'
        )
    
    def get_activationStatus(self, obj):
        """Get activation status"""
        if not obj.activation_requested:
            return 'not_requested'
        
        if obj.activation_successful:
            return 'successful'
        
        if obj.activation_error:
            return f'failed: {obj.activation_error}'
        
        return 'pending'
    
    def validate(self, data):
        """Validate subscription data"""
        # Get plan
        plan_id = data.get('planId')
        try:
            plan = InternetPlan.objects.get(id=plan_id, active=True)
        except InternetPlan.DoesNotExist:
            raise serializers.ValidationError({
                'planId': 'Plan not found or inactive'
            })
        
        # Validate access method
        access_method = data.get('accessMethod')
        if access_method not in plan.get_enabled_access_methods():
            raise serializers.ValidationError({
                'accessMethod': f'Access method "{access_method}" not enabled for this plan'
            })
        
        # Validate router if provided
        router_id = data.get('routerId')
        if router_id and plan.router_specific:
            if not plan.can_be_used_on_router(router_id):
                raise serializers.ValidationError({
                    'routerId': f'Plan "{plan.name}" cannot be used on this router'
                })
        
        # Store validated data in context
        self.context['plan'] = plan
        self.context['access_method'] = access_method
        
        return data
    
    def create(self, validated_data):
        """Create subscription"""
        request = self.context.get('request')
        
        # Extract data
        client_id = validated_data.pop('clientId')
        plan_id = validated_data.pop('planId')
        router_id = validated_data.pop('routerId', None)
        access_method = validated_data.pop('accessMethod')
        duration_hours = validated_data.pop('durationHours', 24)
        mac_address = validated_data.pop('macAddress', None)
        
        # Get client from authentication app
        try:
            from authentication.models import UserAccount
            client = UserAccount.objects.get(id=client_id, is_active=True)
        except UserAccount.DoesNotExist:
            raise serializers.ValidationError({
                'clientId': 'Client not found or inactive'
            })
        
        # Get plan
        plan = self.context['plan']
        
        # Get router
        router = None
        if router_id:
            from network_management.models import Router
            try:
                router = Router.objects.get(id=router_id, is_active=True)
            except Router.DoesNotExist:
                pass
        
        # Auto-select router if not specified
        if not router and plan.router_specific:
            from network_management.models import Router
            compatible_routers = plan.allowed_routers.filter(is_active=True)
            if compatible_routers.exists():
                router = compatible_routers.first()
        
        # Create subscription
        with transaction.atomic():
            try:
                subscription = Subscription.create_pending_subscription(
                    client=client,
                    plan=plan,
                    access_method=access_method,
                    router=router,
                    mac_address=mac_address,
                    duration_hours=duration_hours
                )
                
                # Log creation
                logger.info(f"Subscription created: {subscription.id} for client {client_id}")
                
                return subscription
                
            except ValidationError as e:
                raise serializers.ValidationError(e.message_dict)
            except Exception as e:
                logger.error(f"Failed to create subscription: {e}")
                raise serializers.ValidationError(f"Failed to create subscription: {str(e)}")
    
    def to_representation(self, instance):
        """Custom representation"""
        data = super().to_representation(instance)
        
        # Add summary
        data['summary'] = instance.get_summary()
        
        return data


class SubscriptionActivationSerializer(serializers.Serializer):
    """Serializer for subscription activation"""
    
    transactionReference = serializers.CharField(
        max_length=100,
        required=True,
        help_text="Payment transaction reference"
    )
    
    class Meta:
        fields = ['transactionReference']
    
    def validate(self, data):
        """Validate activation data"""
        subscription = self.context.get('subscription')
        
        if not subscription:
            raise serializers.ValidationError('Subscription not found')
        
        if subscription.status != 'pending':
            raise serializers.ValidationError(
                f'Cannot activate subscription with status: {subscription.status}'
            )
        
        # Check if transaction reference already used
        transaction_reference = data.get('transactionReference')
        if Subscription.objects.filter(transaction_reference=transaction_reference).exists():
            raise serializers.ValidationError(
                'Transaction reference already used'
            )
        
        return data


class SubscriptionRenewSerializer(serializers.Serializer):
    """Serializer for subscription renewal"""
    
    durationHours = serializers.IntegerField(
        required=False,
        min_value=1,
        max_value=744,  # 31 days
        default=None,
        help_text="Duration in hours (defaults to plan duration)"
    )
    
    class Meta:
        fields = ['durationHours']