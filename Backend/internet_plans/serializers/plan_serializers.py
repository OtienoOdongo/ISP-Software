"""
Internet Plans - Plan Serializers
Serializers for Plan Templates and Internet Plans
"""

from rest_framework import serializers
from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils import timezone
from decimal import Decimal
import logging

from internet_plans.models.plan_models import PlanTemplate, InternetPlan
from internet_plans.utils.validators import validate_access_methods

logger = logging.getLogger(__name__)


class PlanTemplateSerializer(serializers.ModelSerializer):
    """Serializer for Plan Templates"""
    
    # Field mappings for API
    basePrice = serializers.DecimalField(
        source='base_price', 
        max_digits=10, 
        decimal_places=2,
        required=True
    )
    accessMethods = serializers.JSONField(
        source='access_methods',
        required=False
    )
    isPublic = serializers.BooleanField(
        source='is_public',
        default=True
    )
    isActive = serializers.BooleanField(
        source='is_active',
        default=True
    )
    usageCount = serializers.IntegerField(
        source='usage_count',
        read_only=True
    )
    createdBy = serializers.SerializerMethodField(
        read_only=True
    )
    createdAt = serializers.DateTimeField(
        source='created_at',
        read_only=True
    )
    updatedAt = serializers.DateTimeField(
        source='updated_at',
        read_only=True
    )
    hasEnabledAccessMethods = serializers.BooleanField(
        read_only=True
    )
    enabledAccessMethods = serializers.SerializerMethodField(
        read_only=True
    )
    accessType = serializers.SerializerMethodField(
        read_only=True
    )
    createdPlansCount = serializers.SerializerMethodField(
        read_only=True
    )
    
    class Meta:
        model = PlanTemplate
        fields = [
            'id', 'name', 'description', 'category', 'basePrice',
            'accessMethods', 'isPublic', 'isActive', 'usageCount',
            'createdBy', 'createdAt', 'updatedAt', 'hasEnabledAccessMethods',
            'enabledAccessMethods', 'accessType', 'createdPlansCount'
        ]
    
    def get_createdBy(self, obj):
        """Get creator username"""
        if obj.created_by:
            return obj.created_by.username
        return None
    
    def get_enabledAccessMethods(self, obj):
        """Get enabled access methods"""
        return obj.get_enabled_access_methods()
    
    def get_accessType(self, obj):
        """Get access type"""
        return obj.get_access_type()
    
    def get_createdPlansCount(self, obj):
        """Get count of plans created from this template"""
        return obj.created_plans.count()
    
    def validate(self, data):
        """Validate template data"""
        # Validate access methods
        if 'access_methods' in data:
            access_methods = data['access_methods']
            is_valid, error = validate_access_methods(access_methods)
            if not is_valid:
                raise serializers.ValidationError({
                    'accessMethods': error
                })
        
        # Validate category based on access methods
        if 'category' in data and 'access_methods' in data:
            category = data['category']
            access_methods = data.get('access_methods', {})
            
            # Get enabled methods
            enabled_methods = [
                method for method, config in access_methods.items() 
                if config.get('enabled', False)
            ]
            
            # Validate category matches access methods
            if category == 'Hotspot' and 'hotspot' not in enabled_methods:
                raise serializers.ValidationError({
                    'category': 'Hotspot category requires hotspot access method'
                })
            elif category == 'PPPoE' and 'pppoe' not in enabled_methods:
                raise serializers.ValidationError({
                    'category': 'PPPoE category requires PPPoE access method'
                })
            elif category == 'Dual' and (not {'hotspot', 'pppoe'}.issubset(set(enabled_methods))):
                raise serializers.ValidationError({
                    'category': 'Dual category requires both hotspot and PPPoE access methods'
                })
        
        return data
    
    def create(self, validated_data):
        """Create template with proper defaults"""
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['created_by'] = request.user
        
        # Set default access methods if not provided
        if 'access_methods' not in validated_data or not validated_data['access_methods']:
            template = PlanTemplate()
            template.set_default_access_methods()
            validated_data['access_methods'] = template.access_methods
        
        return super().create(validated_data)
    
    def to_representation(self, instance):
        """Custom representation"""
        data = super().to_representation(instance)
        
        # Ensure proper field names in output
        data['basePrice'] = str(instance.base_price)
        data['accessMethods'] = instance.access_methods
        data['hasEnabledAccessMethods'] = instance.has_enabled_access_methods()
        data['enabledAccessMethods'] = instance.get_enabled_access_methods()
        data['accessType'] = instance.get_access_type()
        
        return data


class InternetPlanSerializer(serializers.ModelSerializer):
    """Serializer for Internet Plans"""
    
    # Field mappings for API
    planType = serializers.CharField(
        source='plan_type',
        required=True
    )
    accessMethods = serializers.JSONField(
        source='access_methods',
        required=False
    )
    allowedRouters = serializers.SerializerMethodField(
        read_only=True
    )
    allowedRoutersIds = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False,
        allow_empty=True
    )
    template = PlanTemplateSerializer(
        read_only=True
    )
    templateId = serializers.UUIDField(
        source='template_id',
        write_only=True,
        required=False,
        allow_null=True
    )
    hasEnabledAccessMethods = serializers.BooleanField(
        read_only=True
    )
    enabledAccessMethods = serializers.SerializerMethodField(
        read_only=True
    )
    accessType = serializers.SerializerMethodField(
        read_only=True
    )
    routerCompatibility = serializers.SerializerMethodField(
        read_only=True
    )
    purchases = serializers.IntegerField(
        read_only=True
    )
    createdAt = serializers.DateTimeField(
        source='created_at',
        read_only=True
    )
    updatedAt = serializers.DateTimeField(
        source='updated_at',
        read_only=True
    )
    
    class Meta:
        model = InternetPlan
        fields = [
            'id', 'planType', 'name', 'price', 'active', 'category',
            'description', 'purchases', 'client_sessions', 'createdAt', 'updatedAt',
            'accessMethods', 'priority_level', 'router_specific',
            'allowedRouters', 'allowedRoutersIds', 'FUP_policy',
            'FUP_threshold', 'hasEnabledAccessMethods',
            'enabledAccessMethods', 'template', 'templateId', 'accessType',
            'routerCompatibility'
        ]
        read_only_fields = ['createdAt', 'updatedAt', 'purchases', 'client_sessions']
    
    def get_allowedRouters(self, obj):
        """Get allowed routers"""
        from network_management.serializers import RouterSerializer
        return RouterSerializer(obj.allowed_routers.all(), many=True).data
    
    def get_enabledAccessMethods(self, obj):
        """Get enabled access methods"""
        return obj.get_enabled_access_methods()
    
    def get_accessType(self, obj):
        """Get access type"""
        return obj.get_access_type()
    
    def get_routerCompatibility(self, obj):
        """Get router compatibility"""
        return obj.get_router_compatibility()
    
    def validate(self, data):
        """Validate plan data"""
        # Free Trial validation
        if data.get('plan_type') == 'free_trial':
            if data.get('price', 0) != 0:
                raise serializers.ValidationError({
                    'price': 'Free Trial plans must have price set to 0'
                })
            if data.get('router_specific', False):
                raise serializers.ValidationError({
                    'router_specific': 'Free Trial plans cannot be router-specific'
                })
            if data.get('priority_level', 4) > 4:
                raise serializers.ValidationError({
                    'priority_level': 'Free Trial plans cannot have premium priority levels'
                })
        
        # Validate access methods
        if 'access_methods' in data:
            access_methods = data['access_methods']
            is_valid, error = validate_access_methods(access_methods)
            if not is_valid:
                raise serializers.ValidationError({
                    'accessMethods': error
                })
        
        # Check for duplicate name
        name = data.get('name')
        if name:
            instance_id = self.instance.id if self.instance else None
            if InternetPlan.objects.filter(name=name).exclude(id=instance_id).exists():
                raise serializers.ValidationError({
                    'name': f'A plan with the name "{name}" already exists'
                })
        
        return data
    
    def create(self, validated_data):
        """Create plan with proper relationships"""
        # Extract foreign key IDs
        template_id = validated_data.pop('template_id', None)
        allowed_routers_ids = validated_data.pop('allowed_routers_ids', [])
        
        # Set default access methods if not provided
        if 'access_methods' not in validated_data or not validated_data['access_methods']:
            plan = InternetPlan()
            plan.set_default_access_methods()
            validated_data['access_methods'] = plan.access_methods
        
        with transaction.atomic():
            # Create plan
            plan = InternetPlan.objects.create(**validated_data)
            
            # Set template if provided
            if template_id:
                try:
                    template = PlanTemplate.objects.get(id=template_id, is_active=True)
                    plan.template = template
                    plan.save(update_fields=['template'])
                except PlanTemplate.DoesNotExist:
                    logger.warning(f"Template {template_id} not found or inactive")
            
            # Set allowed routers
            if allowed_routers_ids:
                plan.allowed_routers.set(allowed_routers_ids)
        
        return plan
    
    def update(self, instance, validated_data):
        """Update plan with proper relationships"""
        allowed_routers_ids = validated_data.pop('allowed_routers_ids', None)
        template_id = validated_data.pop('template_id', None)
        
        with transaction.atomic():
            # Update instance
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            instance.save()
            
            # Update template if provided
            if template_id is not None:
                if template_id:
                    try:
                        template = PlanTemplate.objects.get(id=template_id, is_active=True)
                        instance.template = template
                    except PlanTemplate.DoesNotExist:
                        instance.template = None
                else:
                    instance.template = None
                instance.save(update_fields=['template'])
            
            # Update allowed routers if provided
            if allowed_routers_ids is not None:
                instance.allowed_routers.set(allowed_routers_ids)
        
        return instance
    
    def to_representation(self, instance):
        """Custom representation"""
        data = super().to_representation(instance)
        
        # Ensure proper field names in output
        data['planType'] = instance.plan_type
        data['price'] = str(instance.price)
        data['accessMethods'] = instance.access_methods
        data['hasEnabledAccessMethods'] = instance.has_enabled_access_methods()
        data['enabledAccessMethods'] = instance.get_enabled_access_methods()
        data['accessType'] = instance.get_access_type()
        
        return data