"""
Internet Plans - Template Serializers
Serializers for Plan Templates
Maintains original logic with improvements
"""

from rest_framework import serializers
from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils import timezone
from decimal import Decimal
import logging
from django.core.cache import cache

from internet_plans.models.plan_models import PlanTemplate
from internet_plans.utils.validators import validate_access_methods

logger = logging.getLogger(__name__)


class PlanTemplateSerializer(serializers.ModelSerializer):
    """
    Serializer for Plan Templates
    ORIGINAL LOGIC MAINTAINED from your code
    """
    
    # Field mappings for API - ORIGINAL FIELDS MAINTAINED
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
        """Get creator username - ORIGINAL LOGIC MAINTAINED"""
        if obj.created_by:
            return obj.created_by.username
        return None
    
    def get_enabledAccessMethods(self, obj):
        """Get enabled access methods - ORIGINAL LOGIC MAINTAINED"""
        return obj.get_enabled_access_methods()
    
    def get_accessType(self, obj):
        """Get access type - ORIGINAL LOGIC MAINTAINED"""
        return obj.get_access_type()
    
    def get_createdPlansCount(self, obj):
        """Get count of plans created from this template - ORIGINAL LOGIC MAINTAINED"""
        return obj.created_plans.count()
    
    def validate(self, data):
        """Validate template data - ORIGINAL LOGIC MAINTAINED"""
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
        """Create template with proper defaults - ORIGINAL LOGIC MAINTAINED with caching"""
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['created_by'] = request.user
        
        # Set default access methods if not provided
        if 'access_methods' not in validated_data or not validated_data['access_methods']:
            template = PlanTemplate()
            template.set_default_access_methods()
            validated_data['access_methods'] = template.access_methods
        
        template = super().create(validated_data)
        
        # Clear cache
        cache.delete(f"plan_template:{template.id}")
        cache.delete_pattern("plan_templates:*")
        
        return template
    
    def to_representation(self, instance):
        """Custom representation - ORIGINAL LOGIC MAINTAINED with improvements"""
        data = super().to_representation(instance)
        
        # Ensure proper field names in output
        data['basePrice'] = str(instance.base_price)
        data['accessMethods'] = instance.access_methods
        data['hasEnabledAccessMethods'] = instance.has_enabled_access_methods()
        data['enabledAccessMethods'] = instance.get_enabled_access_methods()
        data['accessType'] = instance.get_access_type()
        
        # Add sample configuration
        data['sampleConfig'] = {
            'hotspot': instance.get_config_for_method('hotspot') if 'hotspot' in instance.get_enabled_access_methods() else None,
            'pppoe': instance.get_config_for_method('pppoe') if 'pppoe' in instance.get_enabled_access_methods() else None
        }
        
        return data


class PlanTemplateCreateSerializer(serializers.ModelSerializer):
    """
    Simplified serializer for template creation
    NEW: For API consistency
    """
    
    class Meta:
        model = PlanTemplate
        fields = ['name', 'description', 'category', 'base_price', 
                 'access_methods', 'is_public', 'created_by']


class PlanTemplateUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for template updates
    NEW: For API consistency
    """
    
    class Meta:
        model = PlanTemplate
        fields = ['name', 'description', 'category', 'base_price',
                 'access_methods', 'is_public', 'is_active']


class TemplateToPlanSerializer(serializers.Serializer):
    """
    Serializer for creating plan from template
    NEW: Clean interface for plan creation
    """
    
    template_id = serializers.UUIDField(required=True)
    plan_name = serializers.CharField(required=True, max_length=100)
    custom_price = serializers.DecimalField(
        required=False, 
        max_digits=10, 
        decimal_places=2,
        allow_null=True
    )
    custom_description = serializers.CharField(required=False, allow_blank=True)
    enable_both_methods = serializers.BooleanField(default=False)
    
    class Meta:
        fields = ['template_id', 'plan_name', 'custom_price', 
                 'custom_description', 'enable_both_methods']
    
    def validate(self, data):
        template_id = data['template_id']
        
        # Get template from cache
        template = PlanTemplate.get_cached_template(template_id)
        if not template:
            raise serializers.ValidationError({
                'template_id': 'Template not found or inactive'
            })
        
        # Check if plan name already exists
        plan_name = data['plan_name']
        from internet_plans.models.plan_models import InternetPlan
        if InternetPlan.objects.filter(name=plan_name).exists():
            raise serializers.ValidationError({
                'plan_name': f'A plan with the name "{plan_name}" already exists'
            })
        
        self.context['template'] = template
        return data
    
    def create_plan(self):
        """Create plan from template"""
        template = self.context['template']
        validated_data = self.validated_data
        
        from internet_plans.models.plan_models import InternetPlan
        
        # Create plan from template
        plan = InternetPlan()
        plan.name = validated_data['plan_name']
        plan.category = template.category
        plan.price = validated_data.get('custom_price') or template.base_price
        plan.description = validated_data.get('custom_description') or template.description
        plan.access_methods = template.access_methods.copy()
        plan.template = template
        
        # Enable both methods if requested
        if validated_data.get('enable_both_methods'):
            plan.access_methods['hotspot']['enabled'] = True
            plan.access_methods['pppoe']['enabled'] = True
        
        # Determine plan type based on price
        plan.plan_type = 'free_trial' if plan.price == 0 else 'paid'
        
        plan.save()
        template.increment_usage()
        
        # Clear cache
        cache.delete_pattern("internet_plans:*")
        
        return plan