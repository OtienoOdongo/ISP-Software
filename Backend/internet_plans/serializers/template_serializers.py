# """
# Internet Plans - Template Serializers
# Serializers for Plan Templates
# Maintains original logic with improvements
# """

# from rest_framework import serializers
# from django.core.exceptions import ValidationError
# from django.db import transaction
# from django.utils import timezone
# from decimal import Decimal
# import logging
# from django.core.cache import cache

# from internet_plans.models.plan_models import PlanTemplate
# from internet_plans.utils.validators import validate_access_methods

# logger = logging.getLogger(__name__)


# class PlanTemplateSerializer(serializers.ModelSerializer):
#     """
#     Serializer for Plan Templates
#     """
    
#     # Field mappings for API
#     basePrice = serializers.DecimalField(
#         source='base_price', 
#         max_digits=10, 
#         decimal_places=2,
#         required=True
#     )
#     accessMethods = serializers.JSONField(
#         source='access_methods',
#         required=False
#     )
#     isPublic = serializers.BooleanField(
#         source='is_public',
#         default=True
#     )
#     isActive = serializers.BooleanField(
#         source='is_active',
#         default=True
#     )
#     usageCount = serializers.IntegerField(
#         source='usage_count',
#         read_only=True
#     )
#     createdBy = serializers.SerializerMethodField(
#         read_only=True,
#         help_text="Admin who created this template"
#     )
#     createdAt = serializers.DateTimeField(
#         source='created_at',
#         read_only=True
#     )
#     updatedAt = serializers.DateTimeField(
#         source='updated_at',
#         read_only=True
#     )
#     hasEnabledAccessMethods = serializers.BooleanField(
#         read_only=True
#     )
#     enabledAccessMethods = serializers.SerializerMethodField(
#         read_only=True
#     )
#     accessType = serializers.SerializerMethodField(
#         read_only=True
#     )
#     createdPlansCount = serializers.SerializerMethodField(
#         read_only=True
#     )
    
#     # Time Variant Fields
#     timeVariant = serializers.SerializerMethodField(
#         read_only=True,
#         help_text="Time variant configuration"
#     )
    
#     class Meta:
#         model = PlanTemplate
#         fields = [
#             'id', 'name', 'description', 'category', 'basePrice',
#             'accessMethods', 'isPublic', 'isActive', 'usageCount',
#             'createdBy', 'createdAt', 'updatedAt', 'hasEnabledAccessMethods',
#             'enabledAccessMethods', 'accessType', 'createdPlansCount',
#             'timeVariant'
#         ]
#         read_only_fields = ['createdBy', 'createdAt', 'updatedAt', 'usageCount',
#                           'hasEnabledAccessMethods', 'enabledAccessMethods',
#                           'accessType', 'createdPlansCount', 'timeVariant']
    
#     def get_createdBy(self, obj):
#         """Get creator user info"""
#         if obj.created_by:
#             # Return user ID and email instead of username
#             return {
#                 'id': str(obj.created_by.id),
#                 'email': obj.created_by.email,
#                 'is_staff': obj.created_by.is_staff
#             }
#         return None
    
#     def get_enabledAccessMethods(self, obj):
#         """Get enabled access methods"""
#         return obj.get_enabled_access_methods()
    
#     def get_accessType(self, obj):
#         """Get access type"""
#         return obj.get_access_type()
    
#     def get_createdPlansCount(self, obj):
#         """Get count of plans created from this template"""
#         return obj.created_plans.count()
    
#     def get_timeVariant(self, obj):
#         """Get time variant info"""
#         if obj.time_variant:
#             from internet_plans.serializers.plan_serializers import TimeVariantConfigSerializer
#             return TimeVariantConfigSerializer(obj.time_variant).data
#         return None
    
#     def validate(self, data):
#         """Validate template data"""
#         # Validate access methods
#         if 'access_methods' in data:
#             access_methods = data['access_methods']
#             is_valid, error = validate_access_methods(access_methods)
#             if not is_valid:
#                 raise serializers.ValidationError({
#                     'accessMethods': error
#                 })
        
#         # Validate category based on access methods
#         if 'category' in data and 'access_methods' in data:
#             category = data['category']
#             access_methods = data.get('access_methods', {})
            
#             # Get enabled methods
#             enabled_methods = [
#                 method for method, config in access_methods.items() 
#                 if config.get('enabled', False)
#             ]
            
#             # Validate category matches access methods
#             if category == 'Hotspot' and 'hotspot' not in enabled_methods:
#                 raise serializers.ValidationError({
#                     'category': 'Hotspot category requires hotspot access method'
#                 })
#             elif category == 'PPPoE' and 'pppoe' not in enabled_methods:
#                 raise serializers.ValidationError({
#                     'category': 'PPPoE category requires PPPoE access method'
#                 })
#             elif category == 'Dual' and (not {'hotspot', 'pppoe'}.issubset(set(enabled_methods))):
#                 raise serializers.ValidationError({
#                     'category': 'Dual category requires both hotspot and PPPoE access methods'
#                 })
        
#         # Check for duplicate name
#         name = data.get('name')
#         if name:
#             instance_id = self.instance.id if self.instance else None
#             if PlanTemplate.objects.filter(name=name).exclude(id=instance_id).exists():
#                 raise serializers.ValidationError({
#                     'name': f'A template with the name "{name}" already exists'
#                 })
        
#         return data
    
#     def create(self, validated_data):
#         """Create template with proper defaults"""
#         request = self.context.get('request')
#         if request and request.user.is_authenticated:
#             validated_data['created_by'] = request.user
        
#         # Set default access methods if not provided
#         if 'access_methods' not in validated_data or not validated_data['access_methods']:
#             template = PlanTemplate()
#             template.set_default_access_methods()
#             validated_data['access_methods'] = template.access_methods
        
#         template = super().create(validated_data)
        
#         # Clear cache
#         cache.delete(f"plan_template:{template.id}")
#         cache.delete_pattern("plan_templates:*")
        
#         return template
    
#     def to_representation(self, instance):
#         """Custom representation"""
#         data = super().to_representation(instance)
        
#         # Ensure proper field names in output
#         data['basePrice'] = str(instance.base_price)
#         data['accessMethods'] = instance.access_methods
#         data['hasEnabledAccessMethods'] = instance.has_enabled_access_methods()
#         data['enabledAccessMethods'] = instance.get_enabled_access_methods()
#         data['accessType'] = instance.get_access_type()
        
#         # Add sample configuration
#         data['sampleConfig'] = {
#             'hotspot': instance.get_config_for_method('hotspot') if 'hotspot' in instance.get_enabled_access_methods() else None,
#             'pppoe': instance.get_config_for_method('pppoe') if 'pppoe' in instance.get_enabled_access_methods() else None
#         }
        
#         return data


# class PlanTemplateCreateSerializer(serializers.ModelSerializer):
#     """
#     Simplified serializer for template creation
#     """
    
#     # Write-only field for admin assignment
#     assign_to_admin = serializers.BooleanField(
#         write_only=True,
#         required=False,
#         default=True,
#         help_text="Automatically assign template to authenticated admin"
#     )
    
#     class Meta:
#         model = PlanTemplate
#         fields = ['name', 'description', 'category', 'base_price', 
#                  'access_methods', 'is_public', 'assign_to_admin']
#         read_only_fields = []
    
#     def create(self, validated_data):
#         """Create template and assign to authenticated admin"""
#         # Remove assign_to_admin field before saving
#         validated_data.pop('assign_to_admin', True)
        
#         request = self.context.get('request')
#         if request and request.user.is_authenticated:
#             validated_data['created_by'] = request.user
        
#         # Set default access methods if not provided
#         if 'access_methods' not in validated_data or not validated_data['access_methods']:
#             template = PlanTemplate()
#             template.set_default_access_methods()
#             validated_data['access_methods'] = template.access_methods
        
#         template = super().create(validated_data)
        
#         # Clear cache
#         cache.delete(f"plan_template:{template.id}")
#         cache.delete_pattern("plan_templates:*")
        
#         return template


# class PlanTemplateUpdateSerializer(serializers.ModelSerializer):
#     """
#     Serializer for template updates
#     """
    
#     class Meta:
#         model = PlanTemplate
#         fields = ['name', 'description', 'category', 'base_price',
#                  'access_methods', 'is_public', 'is_active']
#         read_only_fields = ['created_by']  # Cannot change creator
    
#     def validate(self, data):
#         """Validate update data"""
#         # Check for duplicate name
#         name = data.get('name')
#         if name and self.instance:
#             if PlanTemplate.objects.filter(name=name).exclude(id=self.instance.id).exists():
#                 raise serializers.ValidationError({
#                     'name': f'A template with the name "{name}" already exists'
#                 })
        
#         return data
    
#     def update(self, instance, validated_data):
#         """Update template"""
#         template = super().update(instance, validated_data)
        
#         # Clear cache
#         cache.delete(f"plan_template:{template.id}")
#         cache.delete_pattern("plan_templates:*")
        
#         return template


# class TemplateToPlanSerializer(serializers.Serializer):
#     """
#     Serializer for creating plan from template
#     """
    
#     template_id = serializers.UUIDField(required=True)
#     plan_name = serializers.CharField(required=True, max_length=100)
#     custom_price = serializers.DecimalField(
#         required=False, 
#         max_digits=10, 
#         decimal_places=2,
#         allow_null=True
#     )
#     custom_description = serializers.CharField(required=False, allow_blank=True)
#     enable_both_methods = serializers.BooleanField(default=False)
#     assign_to_admin = serializers.BooleanField(
#         default=True,
#         help_text="Assign created plan to authenticated admin"
#     )
    
#     class Meta:
#         fields = ['template_id', 'plan_name', 'custom_price', 
#                  'custom_description', 'enable_both_methods', 'assign_to_admin']
    
#     def validate(self, data):
#         template_id = data['template_id']
        
#         # Get template from cache
#         template = PlanTemplate.get_cached_template(template_id)
#         if not template:
#             raise serializers.ValidationError({
#                 'template_id': 'Template not found or inactive'
#             })
        
#         # Check if plan name already exists
#         plan_name = data['plan_name']
#         from internet_plans.models.plan_models import InternetPlan
#         if InternetPlan.objects.filter(name=plan_name).exists():
#             raise serializers.ValidationError({
#                 'plan_name': f'A plan with the name "{plan_name}" already exists'
#             })
        
#         # Check permissions
#         request = self.context.get('request')
#         if request and request.user.is_authenticated:
#             # Check if user can use this template
#             if not template.is_public and template.created_by != request.user:
#                 if not request.user.is_staff:
#                     raise serializers.ValidationError({
#                         'template_id': 'You do not have permission to use this template'
#                     })
        
#         self.context['template'] = template
#         return data
    
#     def create_plan(self):
#         """Create plan from template"""
#         template = self.context['template']
#         validated_data = self.validated_data
        
#         from internet_plans.models.plan_models import InternetPlan
        
#         # Create plan from template
#         plan = InternetPlan()
#         plan.name = validated_data['plan_name']
#         plan.category = template.category
#         plan.price = validated_data.get('custom_price') or template.base_price
#         plan.description = validated_data.get('custom_description') or template.description
#         plan.access_methods = template.access_methods.copy()
#         plan.template = template
        
#         # Enable both methods if requested
#         if validated_data.get('enable_both_methods'):
#             plan.access_methods['hotspot']['enabled'] = True
#             plan.access_methods['pppoe']['enabled'] = True
        
#         # Determine plan type based on price
#         plan.plan_type = 'free_trial' if plan.price == 0 else 'paid'
        
#         # Set priority level
#         plan.priority_level = 5
        
#         # Assign to admin if requested
#         if validated_data.get('assign_to_admin', True):
#             request = self.context.get('request')
#             if request and request.user.is_authenticated:
#                 plan.created_by = request.user
        
#         plan.active = True
#         plan.save()
#         template.increment_usage()
        
#         # Clear cache
#         cache.delete_pattern("internet_plans:*")
        
#         return plan







"""
Internet Plans - Template Serializers (NEW COMPLETE VERSION)
Serializers for Plan Templates with Time Variant Support
FIXED: Complete implementation with all required fields
"""

from rest_framework import serializers
from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils import timezone
from decimal import Decimal
import logging
from django.core.cache import cache

from internet_plans.models.plan_models import PlanTemplate, InternetPlan, TimeVariantConfig
from internet_plans.utils.validators import validate_access_methods
from internet_plans.serializers.plan_serializers import TimeVariantConfigSerializer

logger = logging.getLogger(__name__)


class PlanTemplateSerializer(serializers.ModelSerializer):
    """
    Serializer for Plan Templates with Time Variant Support
    """
    
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
        read_only=True,
        help_text="Admin who created this template"
    )
    createdAt = serializers.DateTimeField(
        source='created_at',
        read_only=True
    )
    updatedAt = serializers.DateTimeField(
        source='updated_at',
        read_only=True
    )
    hasEnabledAccessMethods = serializers.SerializerMethodField(
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
    
    # Time Variant Fields
    timeVariant = TimeVariantConfigSerializer(
        source='time_variant',
        required=False,
        allow_null=True,
        read_only=True
    )
    
    timeVariantId = serializers.UUIDField(
        write_only=True,
        required=False,
        allow_null=True,
        help_text="Existing time variant configuration ID"
    )
    
    class Meta:
        model = PlanTemplate
        fields = [
            'id', 'name', 'description', 'category', 'basePrice',
            'accessMethods', 'isPublic', 'isActive', 'usageCount',
            'createdBy', 'createdAt', 'updatedAt', 'hasEnabledAccessMethods',
            'enabledAccessMethods', 'accessType', 'createdPlansCount',
            'timeVariant', 'timeVariantId'
        ]
        read_only_fields = ['createdBy', 'createdAt', 'updatedAt', 'usageCount',
                          'hasEnabledAccessMethods', 'enabledAccessMethods',
                          'accessType', 'createdPlansCount', 'timeVariant']
    
    def get_createdBy(self, obj):
        """Get creator user info"""
        if obj.created_by:
            # Return user ID and email instead of username
            return {
                'id': str(obj.created_by.id),
                'email': obj.created_by.email,
                'is_staff': obj.created_by.is_staff
            }
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
    
    def get_hasEnabledAccessMethods(self, obj):
        """Check if template has enabled access methods"""
        return obj.has_enabled_access_methods()
    
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
        
        # Check for duplicate name
        name = data.get('name')
        if name:
            instance_id = self.instance.id if self.instance else None
            if PlanTemplate.objects.filter(name=name).exclude(id=instance_id).exists():
                raise serializers.ValidationError({
                    'name': f'A template with the name "{name}" already exists'
                })
        
        return data
    
    def create(self, validated_data):
        """Create template with proper defaults"""
        request = self.context.get('request')
        
        # Extract time variant ID
        time_variant_id = validated_data.pop('time_variant_id', None)
        
        if request and request.user.is_authenticated:
            validated_data['created_by'] = request.user
        
        # Set default access methods if not provided
        if 'access_methods' not in validated_data or not validated_data['access_methods']:
            template = PlanTemplate()
            template.set_default_access_methods()
            validated_data['access_methods'] = template.access_methods
        
        # Handle time variant
        time_variant = None
        if time_variant_id:
            try:
                time_variant = TimeVariantConfig.objects.get(id=time_variant_id)
                validated_data['time_variant'] = time_variant
            except TimeVariantConfig.DoesNotExist:
                raise serializers.ValidationError({
                    'timeVariantId': 'Time variant configuration not found'
                })
        
        with transaction.atomic():
            template = PlanTemplate.objects.create(**validated_data)
            
            # Clear cache
            cache.delete(f"plan_template:{template.id}")
            cache.delete_pattern("plan_templates:*")
            
            return template
    
    def update(self, instance, validated_data):
        """Update template with proper relationships"""
        time_variant_id = validated_data.pop('time_variant_id', None)
        
        with transaction.atomic():
            # Handle time variant update
            if time_variant_id is not None:
                if time_variant_id:
                    try:
                        time_variant = TimeVariantConfig.objects.get(id=time_variant_id)
                        instance.time_variant = time_variant
                    except TimeVariantConfig.DoesNotExist:
                        raise serializers.ValidationError({
                            'timeVariantId': 'Time variant configuration not found'
                        })
                else:
                    instance.time_variant = None
            
            # Update instance
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            
            instance.save()
            
            # Clear cache
            cache.delete(f"plan_template:{instance.id}")
            cache.delete_pattern("plan_templates:*")
            
            return instance
    
    def to_representation(self, instance):
        """Custom representation"""
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
        
        # Add availability check
        data['availability'] = instance.is_available_for_purchase()
        
        return data


class PlanTemplateCreateSerializer(serializers.ModelSerializer):
    """
    Simplified serializer for template creation
    """
    
    # Write-only field for admin assignment
    assign_to_admin = serializers.BooleanField(
        write_only=True,
        required=False,
        default=True,
        help_text="Automatically assign template to authenticated admin"
    )
    
    class Meta:
        model = PlanTemplate
        fields = ['name', 'description', 'category', 'base_price', 
                 'access_methods', 'is_public', 'assign_to_admin']
        read_only_fields = []
    
    def create(self, validated_data):
        """Create template and assign to authenticated admin"""
        # Remove assign_to_admin field before saving
        validated_data.pop('assign_to_admin', True)
        
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['created_by'] = request.user
        
        # Set default access methods if not provided
        if 'access_methods' not in validated_data or not validated_data['access_methods']:
            template = PlanTemplate()
            template.set_default_access_methods()
            validated_data['access_methods'] = template.access_methods
        
        template = PlanTemplate.objects.create(**validated_data)
        
        # Clear cache
        cache.delete(f"plan_template:{template.id}")
        cache.delete_pattern("plan_templates:*")
        
        return template


class PlanTemplateUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for template updates
    """
    
    class Meta:
        model = PlanTemplate
        fields = ['name', 'description', 'category', 'base_price',
                 'access_methods', 'is_public', 'is_active']
        read_only_fields = ['created_by']  # Cannot change creator
    
    def validate(self, data):
        """Validate update data"""
        # Check for duplicate name
        name = data.get('name')
        if name and self.instance:
            if PlanTemplate.objects.filter(name=name).exclude(id=self.instance.id).exists():
                raise serializers.ValidationError({
                    'name': f'A template with the name "{name}" already exists'
                })
        
        return data
    
    def update(self, instance, validated_data):
        """Update template"""
        template = super().update(instance, validated_data)
        
        # Clear cache
        cache.delete(f"plan_template:{template.id}")
        cache.delete_pattern("plan_templates:*")
        
        return template


class TemplateToPlanSerializer(serializers.Serializer):
    """
    Serializer for creating plan from template
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
    assign_to_admin = serializers.BooleanField(
        default=True,
        help_text="Assign created plan to authenticated admin"
    )
    
    class Meta:
        fields = ['template_id', 'plan_name', 'custom_price', 
                 'custom_description', 'enable_both_methods', 'assign_to_admin']
    
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
        if InternetPlan.objects.filter(name=plan_name).exists():
            raise serializers.ValidationError({
                'plan_name': f'A plan with the name "{plan_name}" already exists'
            })
        
        # Check permissions
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            # Check if user can use this template
            if not template.is_public and template.created_by != request.user:
                if not request.user.is_staff:
                    raise serializers.ValidationError({
                        'template_id': 'You do not have permission to use this template'
                    })
        
        self.context['template'] = template
        return data
    
    def create_plan(self):
        """Create plan from template"""
        template = self.context['template']
        validated_data = self.validated_data
        
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
        
        # Set priority level
        plan.priority_level = 5
        
        # Assign to admin if requested
        if validated_data.get('assign_to_admin', True):
            request = self.context.get('request')
            if request and request.user.is_authenticated:
                plan.created_by = request.user
        
        plan.active = True
        plan.save()
        template.increment_usage()
        
        # Clear cache
        cache.delete_pattern("internet_plans:*")
        
        return plan