


# """
# Internet Plans - Template Serializers
# PRODUCTION-READY: Complete with all serializers, proper validation, and error handling
# """

# from rest_framework import serializers
# from django.core.exceptions import ValidationError
# from django.db import transaction
# from django.utils import timezone
# from decimal import Decimal
# import logging
# from django.core.cache import cache

# from internet_plans.models.plan_models import PlanTemplate, InternetPlan, TimeVariantConfig
# from internet_plans.utils.validators import validate_access_methods
# from internet_plans.serializers.plan_serializers import TimeVariantConfigSerializer

# logger = logging.getLogger(__name__)


# class PlanTemplateSerializer(serializers.ModelSerializer):
#     """
#     Serializer for Plan Templates
#     Complete with all fields, validation, and computed properties
#     """
    
#     # Read-only computed fields
#     enabled_access_methods = serializers.SerializerMethodField(read_only=True)
#     access_type = serializers.SerializerMethodField(read_only=True)
#     created_plans_count = serializers.SerializerMethodField(read_only=True)
#     has_enabled_access_methods = serializers.SerializerMethodField(read_only=True)
#     availability_info = serializers.SerializerMethodField(read_only=True)
#     config_for_method = serializers.SerializerMethodField(read_only=True)
    
#     # User information
#     created_by_info = serializers.SerializerMethodField(read_only=True)
    
#     # Time variant fields
#     time_variant = TimeVariantConfigSerializer(read_only=True)
#     time_variant_id = serializers.UUIDField(
#         write_only=True,
#         required=False,
#         allow_null=True
#     )
    
#     class Meta:
#         model = PlanTemplate
#         fields = [
#             # Core template fields
#             'id', 'name', 'description', 'category', 'base_price',
#             'access_methods', 'is_public', 'is_active', 'usage_count',
            
#             # Relationships
#             'created_by', 'created_by_info', 'time_variant', 'time_variant_id',
            
#             # Timestamps
#             'created_at', 'updated_at',
            
#             # Computed fields
#             'enabled_access_methods', 'access_type', 'created_plans_count',
#             'has_enabled_access_methods', 'availability_info', 'config_for_method'
#         ]
#         read_only_fields = [
#             'id', 'created_at', 'updated_at', 'usage_count', 'created_by',
#             'enabled_access_methods', 'access_type', 'created_plans_count',
#             'has_enabled_access_methods', 'availability_info', 'config_for_method',
#             'time_variant', 'created_by_info'
#         ]
    
#     def get_enabled_access_methods(self, obj):
#         """Get list of enabled access methods"""
#         return obj.get_enabled_access_methods()
    
#     def get_access_type(self, obj):
#         """Get access type category"""
#         return obj.get_access_type()
    
#     def get_created_plans_count(self, obj):
#         """Get count of plans created from this template"""
#         return obj.created_plans.count()
    
#     def get_has_enabled_access_methods(self, obj):
#         """Check if template has enabled access methods"""
#         return obj.has_enabled_access_methods()
    
#     def get_availability_info(self, obj):
#         """Get availability information for template"""
#         return obj.is_available_for_purchase()
    
#     def get_config_for_method(self, obj):
#         """Get configuration for specific access method"""
#         return {
#             method: obj.get_config_for_method(method)
#             for method in ['hotspot', 'pppoe']
#         }
    
#     def get_created_by_info(self, obj):
#         """Get creator user info"""
#         if obj.created_by:
#             return {
#                 'id': obj.created_by.id,
#                 'email': obj.created_by.email,
#                 'username': obj.created_by.username if hasattr(obj.created_by, 'username') else None
#             }
#         return None
    
#     def validate(self, data):
#         """Validate template data with comprehensive checks"""
#         errors = {}
        
#         # Validate access methods
#         if 'access_methods' in data:
#             access_methods = data['access_methods']
#             is_valid, error = validate_access_methods(access_methods)
#             if not is_valid:
#                 errors['access_methods'] = error
        
#         # Check for duplicate name
#         name = data.get('name')
#         if name:
#             instance_id = self.instance.id if self.instance else None
#             if PlanTemplate.objects.filter(name=name).exclude(id=instance_id).exists():
#                 errors['name'] = f'A template with the name "{name}" already exists'
        
#         # Validate base price
#         base_price = data.get('base_price')
#         if base_price is not None:
#             try:
#                 price_decimal = Decimal(str(base_price))
#                 if price_decimal < Decimal('0'):
#                     errors['base_price'] = 'Base price cannot be negative'
#             except (ValueError, TypeError):
#                 errors['base_price'] = 'Invalid price format'
        
#         # Validate template fields
#         if 'category' in data and data['category']:
#             valid_categories = ['residential', 'business', 'promotional', 'enterprise']
#             if data['category'] not in valid_categories:
#                 errors['category'] = f'Invalid category. Must be one of: {", ".join(valid_categories)}'
        
#         # Validate access_methods structure
#         if 'access_methods' in data and not errors.get('access_methods'):
#             access_methods = data['access_methods']
#             if not isinstance(access_methods, dict):
#                 errors['access_methods'] = 'Access methods must be a dictionary'
#             else:
#                 # Check for required methods
#                 required_methods = ['hotspot', 'pppoe']
#                 for method in required_methods:
#                     if method not in access_methods:
#                         errors['access_methods'] = f'Missing {method} configuration'
#                         break
                
#                 # Check if at least one method is enabled
#                 if not errors.get('access_methods'):
#                     enabled_methods = [
#                         method for method, config in access_methods.items()
#                         if config.get('enabled', False)
#                     ]
#                     if not enabled_methods:
#                         errors['access_methods'] = 'At least one access method must be enabled'
        
#         if errors:
#             raise serializers.ValidationError(errors)
        
#         return data
    
#     def create(self, validated_data):
#         """Create a new plan template with comprehensive error handling"""
#         # Extract write-only fields
#         time_variant_id = validated_data.pop('time_variant_id', None)
        
#         # Set created_by from request context
#         request = self.context.get('request')
#         if request and request.user.is_authenticated:
#             validated_data['created_by'] = request.user
        
#         # Set default access methods if not provided
#         if 'access_methods' not in validated_data or not validated_data['access_methods']:
#             template = PlanTemplate()
#             template.set_default_access_methods()
#             validated_data['access_methods'] = template.access_methods
        
#         with transaction.atomic():
#             # Handle time variant configuration
#             if time_variant_id:
#                 try:
#                     time_variant = TimeVariantConfig.objects.get(id=time_variant_id)
#                     validated_data['time_variant'] = time_variant
#                 except TimeVariantConfig.DoesNotExist:
#                     raise serializers.ValidationError({
#                         'time_variant_id': 'Time variant configuration not found'
#                     })
            
#             # Create the template
#             try:
#                 template = PlanTemplate.objects.create(**validated_data)
#             except Exception as e:
#                 logger.error(f"Error creating template: {e}")
#                 raise serializers.ValidationError({
#                     'non_field_errors': f'Failed to create template: {str(e)}'
#                 })
        
#         # Clear cache
#         cache.delete(f"plan_template:{template.id}")
#         cache.delete_pattern("plan_templates:*")
        
#         # Log successful creation
#         logger.info(f"Template created: {template.name} (ID: {template.id})")
        
#         return template
    
#     def update(self, instance, validated_data):
#         """Update an existing plan template with comprehensive error handling"""
#         time_variant_id = validated_data.pop('time_variant_id', None)
        
#         with transaction.atomic():
#             # Handle time variant update
#             if time_variant_id is not None:
#                 if time_variant_id:
#                     try:
#                         time_variant = TimeVariantConfig.objects.get(id=time_variant_id)
#                         instance.time_variant = time_variant
#                     except TimeVariantConfig.DoesNotExist:
#                         raise serializers.ValidationError({
#                             'time_variant_id': 'Time variant configuration not found'
#                         })
#                 else:
#                     instance.time_variant = None
            
#             # Update instance fields
#             for attr, value in validated_data.items():
#                 setattr(instance, attr, value)
            
#             try:
#                 instance.save()
#             except Exception as e:
#                 logger.error(f"Error updating template {instance.id}: {e}")
#                 raise serializers.ValidationError({
#                     'non_field_errors': f'Failed to update template: {str(e)}'
#                 })
        
#         # Clear cache
#         cache.delete(f"plan_template:{instance.id}")
#         cache.delete_pattern("plan_templates:*")
        
#         # Log successful update
#         logger.info(f"Template updated: {instance.name} (ID: {instance.id})")
        
#         return instance
    
#     def to_representation(self, instance):
#         """Custom representation with additional data"""
#         data = super().to_representation(instance)
        
#         # Add sample configuration
#         data['sample_config'] = {
#             method: instance.get_config_for_method(method)
#             for method in instance.get_enabled_access_methods()
#         }
        
#         # Add recent plans created from this template
#         recent_plans = instance.created_plans.filter(active=True).order_by('-created_at')[:5]
#         data['recent_plans'] = [
#             {
#                 'id': str(plan.id),
#                 'name': plan.name,
#                 'price': float(plan.price),
#                 'created_at': plan.created_at,
#                 'active': plan.active
#             }
#             for plan in recent_plans
#         ]
        
#         # Add statistics
#         data['statistics'] = {
#             'total_plans_created': instance.created_plans.count(),
#             'active_plans': instance.created_plans.filter(active=True).count(),
#             'usage_count': instance.usage_count,
#             'has_time_variant': instance.has_time_variant()
#         }
        
#         return data


# class PlanTemplateListSerializer(serializers.ModelSerializer):
#     """
#     Simplified serializer for template listing
#     Optimized for performance in list views
#     """
    
#     access_type = serializers.SerializerMethodField(read_only=True)
#     created_plans_count = serializers.SerializerMethodField(read_only=True)
#     has_time_variant = serializers.SerializerMethodField(read_only=True)
#     base_price_formatted = serializers.SerializerMethodField(read_only=True)
    
#     class Meta:
#         model = PlanTemplate
#         fields = [
#             'id', 'name', 'category', 'base_price', 'base_price_formatted',
#             'is_public', 'is_active', 'usage_count', 'access_type',
#             'created_plans_count', 'has_time_variant', 'created_at', 'updated_at'
#         ]
#         read_only_fields = fields
    
#     def get_access_type(self, obj):
#         return obj.get_access_type()
    
#     def get_created_plans_count(self, obj):
#         return obj.created_plans.count()
    
#     def get_has_time_variant(self, obj):
#         return obj.has_time_variant()
    
#     def get_base_price_formatted(self, obj):
#         return f"KSH {obj.base_price:.2f}"


# class PlanTemplateCreateSerializer(serializers.ModelSerializer):
#     """
#     Simplified serializer for template creation
#     Used in creation forms with required fields only
#     """
    
#     class Meta:
#         model = PlanTemplate
#         fields = [
#             'name', 'description', 'category', 'base_price',
#             'access_methods', 'is_public', 'is_active'
#         ]
    
#     def validate(self, data):
#         """Validate creation data"""
#         errors = {}
        
#         # Basic validations
#         if not data.get('name'):
#             errors['name'] = 'Template name is required'
        
#         if not data.get('category'):
#             errors['category'] = 'Category is required'
        
#         if 'base_price' not in data:
#             errors['base_price'] = 'Base price is required'
        
#         # Validate access methods
#         access_methods = data.get('access_methods')
#         if not access_methods:
#             errors['access_methods'] = 'Access methods configuration is required'
#         else:
#             is_valid, error = validate_access_methods(access_methods)
#             if not is_valid:
#                 errors['access_methods'] = error
        
#         # Validate base price
#         base_price = data.get('base_price')
#         if base_price is not None and base_price < Decimal('0'):
#             errors['base_price'] = 'Base price cannot be negative'
        
#         if errors:
#             raise serializers.ValidationError(errors)
        
#         return data
    
#     def create(self, validated_data):
#         """Create template using the main serializer"""
#         serializer = PlanTemplateSerializer(data=validated_data, context=self.context)
#         serializer.is_valid(raise_exception=True)
#         return serializer.save()


# class PlanTemplateUpdateSerializer(serializers.ModelSerializer):
#     """
#     Serializer for template updates
#     Used for partial updates
#     """
    
#     class Meta:
#         model = PlanTemplate
#         fields = [
#             'name', 'description', 'category', 'base_price',
#             'access_methods', 'is_public', 'is_active'
#         ]
    
#     def validate(self, data):
#         """Validate update data"""
#         errors = {}
        
#         # Check for duplicate name
#         name = data.get('name')
#         if name and self.instance:
#             if PlanTemplate.objects.filter(name=name).exclude(id=self.instance.id).exists():
#                 errors['name'] = f'A template with the name "{name}" already exists'
        
#         # Validate base price if provided
#         base_price = data.get('base_price')
#         if base_price is not None and base_price < Decimal('0'):
#             errors['base_price'] = 'Base price cannot be negative'
        
#         if errors:
#             raise serializers.ValidationError(errors)
        
#         return data
    
#     def update(self, instance, validated_data):
#         """Update template using the main serializer"""
#         serializer = PlanTemplateSerializer(
#             instance,
#             data=validated_data,
#             partial=True,
#             context=self.context
#         )
#         serializer.is_valid(raise_exception=True)
#         return serializer.save()


# class TemplateToPlanSerializer(serializers.Serializer):
#     """
#     Serializer for creating plan from template
#     Complete with all options and validations
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
#     make_router_specific = serializers.BooleanField(default=False)
#     allowed_routers_ids = serializers.ListField(
#         child=serializers.IntegerField(),
#         required=False,
#         default=list
#     )
#     set_active = serializers.BooleanField(default=True)
#     priority_level = serializers.IntegerField(
#         required=False,
#         min_value=1,
#         max_value=8,
#         default=4
#     )
    
#     def validate(self, data):
#         """Validate template to plan conversion"""
#         template_id = data['template_id']
        
#         # Get template
#         try:
#             template = PlanTemplate.objects.get(id=template_id, is_active=True)
#         except PlanTemplate.DoesNotExist:
#             raise serializers.ValidationError({
#                 'template_id': 'Template not found or inactive'
#             })
        
#         # Check if plan name already exists
#         plan_name = data['plan_name']
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
        
#         # Validate router-specific settings
#         make_router_specific = data.get('make_router_specific', False)
#         allowed_routers_ids = data.get('allowed_routers_ids', [])
        
#         if make_router_specific and not allowed_routers_ids:
#             raise serializers.ValidationError({
#                 'allowed_routers_ids': 'Allowed routers are required for router-specific plans'
#             })
        
#         # Validate custom price
#         custom_price = data.get('custom_price')
#         if custom_price is not None and custom_price < Decimal('0'):
#             raise serializers.ValidationError({
#                 'custom_price': 'Price cannot be negative'
#             })
        
#         # Validate priority level
#         priority_level = data.get('priority_level', 4)
#         if priority_level < 1 or priority_level > 8:
#             raise serializers.ValidationError({
#                 'priority_level': 'Priority level must be between 1 and 8'
#             })
        
#         self.context['template'] = template
#         return data
    
#     def create_plan(self):
#         """Create plan from template with comprehensive customization"""
#         template = self.context['template']
#         validated_data = self.validated_data
#         request = self.context.get('request')
        
#         with transaction.atomic():
#             # Create plan from template
#             plan = InternetPlan()
#             plan.create_from_template(template)
            
#             # Apply customizations
#             plan.name = validated_data['plan_name']
            
#             if validated_data.get('custom_price') is not None:
#                 plan.price = validated_data['custom_price']
#                 plan.plan_type = 'free_trial' if plan.price == 0 else 'paid'
            
#             if validated_data.get('custom_description'):
#                 plan.description = validated_data['custom_description']
            
#             # Enable both methods if requested
#             if validated_data.get('enable_both_methods', False):
#                 plan.access_methods['hotspot']['enabled'] = True
#                 plan.access_methods['pppoe']['enabled'] = True
            
#             # Set priority level
#             plan.priority_level = validated_data.get('priority_level', 4)
            
#             # Make router-specific if requested
#             plan.router_specific = validated_data.get('make_router_specific', False)
            
#             # Set active status
#             plan.active = validated_data.get('set_active', True)
            
#             # Set creator
#             if request and request.user.is_authenticated:
#                 plan.created_by = request.user
            
#             # Save the plan first to get an ID
#             plan.save()
            
#             # Set allowed routers
#             if plan.router_specific:
#                 allowed_routers_ids = validated_data.get('allowed_routers_ids', [])
#                 try:
#                     from network_management.models.router_management_model import Router
#                     routers = Router.objects.filter(id__in=allowed_routers_ids, is_active=True)
#                     plan.allowed_routers.set(routers)
#                 except ImportError:
#                     logger.warning("Network management app not installed")
            
#             # Clear cache
#             cache.delete_pattern("internet_plans:*")
#             cache.delete(f"internet_plan:{plan.id}")
            
#             # Log the creation
#             logger.info(
#                 f"Plan created from template: {plan.name} (ID: {plan.id}) "
#                 f"from template: {template.name} (ID: {template.id})"
#             )
        
#         return plan
    
#     def to_representation(self, instance=None):
#         """Return representation of the created plan"""
#         if not instance:
#             return {}
        
#         return {
#             'success': True,
#             'plan': {
#                 'id': str(instance.id),
#                 'name': instance.name,
#                 'category': instance.category,
#                 'price': float(instance.price),
#                 'plan_type': instance.plan_type,
#                 'access_methods': instance.get_enabled_access_methods(),
#                 'template_used': instance.template.name if instance.template else None,
#                 'created_at': instance.created_at,
#                 'active': instance.active
#             }
#         }


# class PlanTemplateDetailSerializer(serializers.ModelSerializer):
#     """
#     Detailed serializer for individual template view
#     Used for retrieving single template with all details
#     """
    
#     # Related objects
#     time_variant = TimeVariantConfigSerializer(read_only=True)
    
#     # Computed fields
#     enabled_access_methods = serializers.SerializerMethodField(read_only=True)
#     access_type = serializers.SerializerMethodField(read_only=True)
#     has_time_variant = serializers.SerializerMethodField(read_only=True)
#     availability_info = serializers.SerializerMethodField(read_only=True)
    
#     # User info
#     created_by_info = serializers.SerializerMethodField(read_only=True)
    
#     # Recent plans
#     recent_plans = serializers.SerializerMethodField(read_only=True)
    
#     class Meta:
#         model = PlanTemplate
#         fields = [
#             'id', 'name', 'description', 'category', 'base_price',
#             'access_methods', 'is_public', 'is_active', 'usage_count',
#             'created_by', 'created_by_info', 'time_variant',
#             'created_at', 'updated_at',
#             'enabled_access_methods', 'access_type', 'has_time_variant',
#             'availability_info', 'recent_plans'
#         ]
#         read_only_fields = fields
    
#     def get_enabled_access_methods(self, obj):
#         return obj.get_enabled_access_methods()
    
#     def get_access_type(self, obj):
#         return obj.get_access_type()
    
#     def get_has_time_variant(self, obj):
#         return obj.has_time_variant()
    
#     def get_availability_info(self, obj):
#         return obj.is_available_for_purchase()
    
#     def get_created_by_info(self, obj):
#         if obj.created_by:
#             return {
#                 'id': obj.created_by.id,
#                 'email': obj.created_by.email
#             }
#         return None
    
#     def get_recent_plans(self, obj):
#         recent_plans = obj.created_plans.filter(active=True).order_by('-created_at')[:10]
#         return [
#             {
#                 'id': str(plan.id),
#                 'name': plan.name,
#                 'price': float(plan.price),
#                 'created_at': plan.created_at,
#                 'active': plan.active
#             }
#             for plan in recent_plans
#         ]


# class PlanTemplateStatisticsSerializer(serializers.Serializer):
#     """
#     Serializer for template statistics
#     """
    
#     total_templates = serializers.IntegerField(read_only=True)
#     active_templates = serializers.IntegerField(read_only=True)
#     public_templates = serializers.IntegerField(read_only=True)
#     by_category = serializers.DictField(read_only=True)
#     total_plans_created = serializers.IntegerField(read_only=True)
#     most_used_templates = serializers.ListField(read_only=True)
    
#     class Meta:
#         fields = [
#             'total_templates', 'active_templates', 'public_templates',
#             'by_category', 'total_plans_created', 'most_used_templates'
#         ]





"""
Internet Plans - Template Serializers
PRODUCTION-READY: Complete with all serializers, proper validation, and error handling
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
    Serializer for Plan Templates
    Complete with all fields, validation, and computed properties
    """
    
    # Read-only computed fields
    enabled_access_methods = serializers.SerializerMethodField(read_only=True)
    access_type = serializers.SerializerMethodField(read_only=True)
    created_plans_count = serializers.SerializerMethodField(read_only=True)
    has_enabled_access_methods = serializers.SerializerMethodField(read_only=True)
    availability_info = serializers.SerializerMethodField(read_only=True)
    config_for_method = serializers.SerializerMethodField(read_only=True)
    
    # User information
    created_by_info = serializers.SerializerMethodField(read_only=True)
    
    # Time variant fields
    time_variant = TimeVariantConfigSerializer(read_only=True)
    time_variant_id = serializers.UUIDField(
        write_only=True,
        required=False,
        allow_null=True
    )
    
    class Meta:
        model = PlanTemplate
        fields = [
            # Core template fields
            'id', 'name', 'description', 'category', 'base_price',
            'access_methods', 'is_public', 'is_active', 'usage_count',
            
            # Relationships
            'created_by', 'created_by_info', 'time_variant', 'time_variant_id',
            
            # Timestamps
            'created_at', 'updated_at',
            
            # Computed fields
            'enabled_access_methods', 'access_type', 'created_plans_count',
            'has_enabled_access_methods', 'availability_info', 'config_for_method'
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'usage_count', 'created_by',
            'enabled_access_methods', 'access_type', 'created_plans_count',
            'has_enabled_access_methods', 'availability_info', 'config_for_method',
            'time_variant', 'created_by_info'
        ]
    
    def get_enabled_access_methods(self, obj):
        """Get list of enabled access methods"""
        return obj.get_enabled_access_methods()
    
    def get_access_type(self, obj):
        """Get access type category"""
        return obj.get_access_type()
    
    def get_created_plans_count(self, obj):
        """Get count of plans created from this template"""
        return obj.created_plans.count()
    
    def get_has_enabled_access_methods(self, obj):
        """Check if template has enabled access methods"""
        return obj.has_enabled_access_methods()
    
    def get_availability_info(self, obj):
        """Get availability information for template"""
        return obj.is_available_for_purchase()
    
    def get_config_for_method(self, obj):
        """Get configuration for specific access method"""
        return {
            method: obj.get_config_for_method(method)
            for method in ['hotspot', 'pppoe']
        }
    
    def get_created_by_info(self, obj):
        """Get creator user info"""
        if obj.created_by:
            return {
                'id': obj.created_by.id,
                'email': obj.created_by.email,
                'username': obj.created_by.username if hasattr(obj.created_by, 'username') else None
            }
        return None
    
    def validate(self, data):
        """Validate template data with comprehensive checks"""
        errors = {}
        
        # Validate access methods
        if 'access_methods' in data:
            access_methods = data['access_methods']
            is_valid, error = validate_access_methods(access_methods)
            if not is_valid:
                errors['access_methods'] = error
        
        # Check for duplicate name
        name = data.get('name')
        if name:
            instance_id = self.instance.id if self.instance else None
            if PlanTemplate.objects.filter(name=name).exclude(id=instance_id).exists():
                errors['name'] = f'A template with the name "{name}" already exists'
        
        # Validate base price
        base_price = data.get('base_price')
        if base_price is not None:
            try:
                price_decimal = Decimal(str(base_price))
                if price_decimal < Decimal('0'):
                    errors['base_price'] = 'Base price cannot be negative'
            except (ValueError, TypeError):
                errors['base_price'] = 'Invalid price format'
        
        # Fixed category validation - capitalized to match model choices
        if 'category' in data and data['category']:
            valid_categories = ['Residential', 'Business', 'Promotional', 'Enterprise']
            # Normalize to capitalized
            normalized_category = data['category'].strip().capitalize()
            if normalized_category not in valid_categories:
                errors['category'] = f'Invalid category. Must be one of: {", ".join(valid_categories)}'
            else:
                data['category'] = normalized_category  # Normalize
        
        # Validate access_methods structure
        if 'access_methods' in data and not errors.get('access_methods'):
            access_methods = data['access_methods']
            if not isinstance(access_methods, dict):
                errors['access_methods'] = 'Access methods must be a dictionary'
            else:
                # Check for required methods
                required_methods = ['hotspot', 'pppoe']
                for method in required_methods:
                    if method not in access_methods:
                        errors['access_methods'] = f'Missing {method} configuration'
                        break
                
                # Check if at least one method is enabled
                if not errors.get('access_methods'):
                    enabled_methods = [
                        method for method, config in access_methods.items()
                        if config.get('enabled', False)
                    ]
                    if not enabled_methods:
                        errors['access_methods'] = 'At least one access method must be enabled'
        
        if errors:
            raise serializers.ValidationError(errors)
        
        return data
    
    def create(self, validated_data):
        """Create a new plan template with comprehensive error handling"""
        # Extract write-only fields
        time_variant_id = validated_data.pop('time_variant_id', None)
        
        # Set created_by from request context
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['created_by'] = request.user
        
        # Set default access methods if not provided
        if 'access_methods' not in validated_data or not validated_data['access_methods']:
            template = PlanTemplate()
            template.set_default_access_methods()
            validated_data['access_methods'] = template.access_methods
        
        with transaction.atomic():
            # Handle time variant configuration
            if time_variant_id:
                try:
                    time_variant = TimeVariantConfig.objects.get(id=time_variant_id)
                    validated_data['time_variant'] = time_variant
                except TimeVariantConfig.DoesNotExist:
                    raise serializers.ValidationError({
                        'time_variant_id': 'Time variant configuration not found'
                    })
            
            # Create the template
            try:
                template = PlanTemplate.objects.create(**validated_data)
            except Exception as e:
                logger.error(f"Error creating template: {e}")
                raise serializers.ValidationError({
                    'non_field_errors': f'Failed to create template: {str(e)}'
                })
        
        # Clear cache
        cache.delete(f"plan_template:{template.id}")
        cache.delete_pattern("plan_templates:*")
        
        # Log successful creation
        logger.info(f"Template created: {template.name} (ID: {template.id})")
        
        return template
    
    def update(self, instance, validated_data):
        """Update an existing plan template with comprehensive error handling"""
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
                            'time_variant_id': 'Time variant configuration not found'
                        })
                else:
                    instance.time_variant = None
            
            # Update instance fields
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            
            try:
                instance.save()
            except Exception as e:
                logger.error(f"Error updating template {instance.id}: {e}")
                raise serializers.ValidationError({
                    'non_field_errors': f'Failed to update template: {str(e)}'
                })
        
        # Clear cache
        cache.delete(f"plan_template:{instance.id}")
        cache.delete_pattern("plan_templates:*")
        
        # Log successful update
        logger.info(f"Template updated: {instance.name} (ID: {instance.id})")
        
        return instance
    
    def to_representation(self, instance):
        """Custom representation with additional data"""
        data = super().to_representation(instance)
        
        # Add sample configuration
        data['sample_config'] = {
            method: instance.get_config_for_method(method)
            for method in instance.get_enabled_access_methods()
        }
        
        # Add recent plans created from this template
        recent_plans = instance.created_plans.filter(active=True).order_by('-created_at')[:5]
        data['recent_plans'] = [
            {
                'id': str(plan.id),
                'name': plan.name,
                'price': float(plan.price),
                'created_at': plan.created_at,
                'active': plan.active
            }
            for plan in recent_plans
        ]
        
        # Add statistics
        data['statistics'] = {
            'total_plans_created': instance.created_plans.count(),
            'active_plans': instance.created_plans.filter(active=True).count(),
            'usage_count': instance.usage_count,
            'has_time_variant': instance.has_time_variant()
        }
        
        return data


class PlanTemplateListSerializer(serializers.ModelSerializer):
    """
    Simplified serializer for template listing
    Optimized for performance in list views
    """
    
    access_type = serializers.SerializerMethodField(read_only=True)
    created_plans_count = serializers.SerializerMethodField(read_only=True)
    has_time_variant = serializers.SerializerMethodField(read_only=True)
    base_price_formatted = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = PlanTemplate
        fields = [
            'id', 'name', 'category', 'base_price', 'base_price_formatted',
            'is_public', 'is_active', 'usage_count', 'access_type',
            'created_plans_count', 'has_time_variant', 'created_at', 'updated_at'
        ]
        read_only_fields = fields
    
    def get_access_type(self, obj):
        return obj.get_access_type()
    
    def get_created_plans_count(self, obj):
        return obj.created_plans.count()
    
    def get_has_time_variant(self, obj):
        return obj.has_time_variant()
    
    def get_base_price_formatted(self, obj):
        return f"KSH {obj.base_price:.2f}"


class PlanTemplateCreateSerializer(serializers.ModelSerializer):
    """
    Simplified serializer for template creation
    Used in creation forms with required fields only
    """
    
    class Meta:
        model = PlanTemplate
        fields = [
            'name', 'description', 'category', 'base_price',
            'access_methods', 'is_public', 'is_active'
        ]
    
    def validate(self, data):
        """Validate creation data"""
        errors = {}
        
        if not data.get('name'):
            errors['name'] = 'Template name is required'
        
        if not data.get('category'):
            errors['category'] = 'Category is required'
        
        if 'base_price' not in data:
            errors['base_price'] = 'Base price is required'
        
        # Validate access methods
        access_methods = data.get('access_methods')
        if not access_methods:
            errors['access_methods'] = 'Access methods configuration is required'
        else:
            is_valid, error = validate_access_methods(access_methods)
            if not is_valid:
                errors['access_methods'] = error
        
        # Validate base price
        base_price = data.get('base_price')
        if base_price is not None and base_price < Decimal('0'):
            errors['base_price'] = 'Base price cannot be negative'
        
        if errors:
            raise serializers.ValidationError(errors)
        
        return data
    
    def create(self, validated_data):
        """Create template using the main serializer"""
        serializer = PlanTemplateSerializer(data=validated_data, context=self.context)
        serializer.is_valid(raise_exception=True)
        return serializer.save()


class PlanTemplateUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for template updates
    Used for partial updates
    """
    
    class Meta:
        model = PlanTemplate
        fields = [
            'name', 'description', 'category', 'base_price',
            'access_methods', 'is_public', 'is_active'
        ]
    
    def validate(self, data):
        """Validate update data"""
        errors = {}
        
        # Check for duplicate name
        name = data.get('name')
        if name and self.instance:
            if PlanTemplate.objects.filter(name=name).exclude(id=self.instance.id).exists():
                errors['name'] = f'A template with the name "{name}" already exists'
        
        # Validate base price if provided
        base_price = data.get('base_price')
        if base_price is not None and base_price < Decimal('0'):
            errors['base_price'] = 'Base price cannot be negative'
        
        if errors:
            raise serializers.ValidationError(errors)
        
        return data
    
    def update(self, instance, validated_data):
        """Update template using the main serializer"""
        serializer = PlanTemplateSerializer(
            instance,
            data=validated_data,
            partial=True,
            context=self.context
        )
        serializer.is_valid(raise_exception=True)
        return serializer.save()


class TemplateToPlanSerializer(serializers.Serializer):
    """
    Serializer for creating plan from template
    Complete with all options and validations
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
    make_router_specific = serializers.BooleanField(default=False)
    allowed_routers_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        default=list
    )
    set_active = serializers.BooleanField(default=True)
    priority_level = serializers.IntegerField(
        required=False,
        min_value=1,
        max_value=8,
        default=4
    )
    
    def validate(self, data):
        """Validate template to plan conversion"""
        template_id = data['template_id']
        
        # Get template
        try:
            template = PlanTemplate.objects.get(id=template_id, is_active=True)
        except PlanTemplate.DoesNotExist:
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
        
        # Validate router-specific settings
        make_router_specific = data.get('make_router_specific', False)
        allowed_routers_ids = data.get('allowed_routers_ids', [])
        
        if make_router_specific and not allowed_routers_ids:
            raise serializers.ValidationError({
                'allowed_routers_ids': 'Allowed routers are required for router-specific plans'
            })
        
        # Validate custom price
        custom_price = data.get('custom_price')
        if custom_price is not None and custom_price < Decimal('0'):
            raise serializers.ValidationError({
                'custom_price': 'Price cannot be negative'
            })
        
        # Validate priority level
        priority_level = data.get('priority_level', 4)
        if priority_level < 1 or priority_level > 8:
            raise serializers.ValidationError({
                'priority_level': 'Priority level must be between 1 and 8'
            })
        
        self.context['template'] = template
        return data
    
    def create_plan(self):
        """Create plan from template with comprehensive customization"""
        template = self.context['template']
        validated_data = self.validated_data
        request = self.context.get('request')
        
        with transaction.atomic():
            # Create plan from template
            plan = InternetPlan()
            plan.create_from_template(template)
            
            # Apply customizations
            plan.name = validated_data['plan_name']
            
            if validated_data.get('custom_price') is not None:
                plan.price = validated_data['custom_price']
                plan.plan_type = 'free_trial' if plan.price == 0 else 'paid'
            
            if validated_data.get('custom_description'):
                plan.description = validated_data['custom_description']
            
            # Enable both methods if requested
            if validated_data.get('enable_both_methods', False):
                plan.access_methods['hotspot']['enabled'] = True
                plan.access_methods['pppoe']['enabled'] = True
            
            # Set priority level
            plan.priority_level = validated_data.get('priority_level', 4)
            
            # Make router-specific if requested
            plan.router_specific = validated_data.get('make_router_specific', False)
            
            # Set active status
            plan.active = validated_data.get('set_active', True)
            
            # Set creator
            if request and request.user.is_authenticated:
                plan.created_by = request.user
            
            # Save the plan first to get an ID
            plan.save()
            
            # Set allowed routers
            if plan.router_specific:
                allowed_routers_ids = validated_data.get('allowed_routers_ids', [])
                try:
                    from network_management.models.router_management_model import Router
                    routers = Router.objects.filter(id__in=allowed_routers_ids, is_active=True)
                    plan.allowed_routers.set(routers)
                except ImportError:
                    logger.warning("Network management app not installed")
            
            # Clear cache
            cache.delete_pattern("internet_plans:*")
            cache.delete(f"internet_plan:{plan.id}")
            
            # Log the creation
            logger.info(
                f"Plan created from template: {plan.name} (ID: {plan.id}) "
                f"from template: {template.name} (ID: {template.id})"
            )
        
        return plan
    
    def to_representation(self, instance=None):
        """Return representation of the created plan"""
        if not instance:
            return {}
        
        return {
            'success': True,
            'plan': {
                'id': str(instance.id),
                'name': instance.name,
                'category': instance.category,
                'price': float(instance.price),
                'plan_type': instance.plan_type,
                'access_methods': instance.get_enabled_access_methods(),
                'template_used': instance.template.name if instance.template else None,
                'created_at': instance.created_at,
                'active': instance.active
            }
        }


class PlanTemplateDetailSerializer(serializers.ModelSerializer):
    """
    Detailed serializer for individual template view
    Used for retrieving single template with all details
    """
    
    # Related objects
    time_variant = TimeVariantConfigSerializer(read_only=True)
    
    # Computed fields
    enabled_access_methods = serializers.SerializerMethodField(read_only=True)
    access_type = serializers.SerializerMethodField(read_only=True)
    has_time_variant = serializers.SerializerMethodField(read_only=True)
    availability_info = serializers.SerializerMethodField(read_only=True)
    
    # User info
    created_by_info = serializers.SerializerMethodField(read_only=True)
    
    # Recent plans
    recent_plans = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = PlanTemplate
        fields = [
            'id', 'name', 'description', 'category', 'base_price',
            'access_methods', 'is_public', 'is_active', 'usage_count',
            'created_by', 'created_by_info', 'time_variant',
            'created_at', 'updated_at',
            'enabled_access_methods', 'access_type', 'has_time_variant',
            'availability_info', 'recent_plans'
        ]
        read_only_fields = fields
    
    def get_enabled_access_methods(self, obj):
        return obj.get_enabled_access_methods()
    
    def get_access_type(self, obj):
        return obj.get_access_type()
    
    def get_has_time_variant(self, obj):
        return obj.has_time_variant()
    
    def get_availability_info(self, obj):
        return obj.is_available_for_purchase()
    
    def get_created_by_info(self, obj):
        if obj.created_by:
            return {
                'id': obj.created_by.id,
                'email': obj.created_by.email
            }
        return None
    
    def get_recent_plans(self, obj):
        recent_plans = obj.created_plans.filter(active=True).order_by('-created_at')[:10]
        return [
            {
                'id': str(plan.id),
                'name': plan.name,
                'price': float(plan.price),
                'created_at': plan.created_at,
                'active': plan.active
            }
            for plan in recent_plans
        ]


class PlanTemplateStatisticsSerializer(serializers.Serializer):
    """
    Serializer for template statistics
    """
    
    total_templates = serializers.IntegerField(read_only=True)
    active_templates = serializers.IntegerField(read_only=True)
    public_templates = serializers.IntegerField(read_only=True)
    by_category = serializers.DictField(read_only=True)
    total_plans_created = serializers.IntegerField(read_only=True)
    most_used_templates = serializers.ListField(read_only=True)
    
    class Meta:
        fields = [
            'total_templates', 'active_templates', 'public_templates',
            'by_category', 'total_plans_created', 'most_used_templates'
        ]