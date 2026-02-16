



# """
# Internet Plans - Plan Serializers with Time Variant Support
# PRODUCTION READY: Complete with all required serializers, proper validation, and error handling
# FIXED: Validation issues resolved with proper integration of validators and None value handling
# """

# from rest_framework import serializers
# from django.core.exceptions import ValidationError
# from django.db import transaction
# from django.db.models import Q
# from django.utils import timezone
# from decimal import Decimal
# import logging
# from django.core.cache import cache

# from internet_plans.models.plan_models import InternetPlan, PlanTemplate, TimeVariantConfig
# from internet_plans.utils.validators import (
#     validate_access_methods,
#     validate_price,
#     validate_duration_hours,
#     validate_time_variant,
#     validate_date_format,
#     validate_future_date
# )

# logger = logging.getLogger(__name__)


# class TimeVariantConfigSerializer(serializers.ModelSerializer):
#     """
#     Serializer for Time Variant Configuration
#     """
    
#     is_available_now = serializers.SerializerMethodField(read_only=True)
#     availability_summary = serializers.SerializerMethodField(read_only=True)
#     next_available_time = serializers.SerializerMethodField(read_only=True)
    
#     class Meta:
#         model = TimeVariantConfig
#         fields = [
#             'id', 'is_active', 'start_time', 'end_time', 'available_days',
#             'schedule_active', 'schedule_start_date', 'schedule_end_date',
#             'duration_active', 'duration_value', 'duration_unit', 'duration_start_date',
#             'exclusion_dates', 'timezone', 'force_available', 'created_at', 'updated_at',
#             'is_available_now', 'availability_summary', 'next_available_time'
#         ]
#         read_only_fields = ['id', 'created_at', 'updated_at']
    
#     def get_is_available_now(self, obj):
#         return obj.is_available_now()
    
#     def get_availability_summary(self, obj):
#         return obj.get_availability_summary()
    
#     def get_next_available_time(self, obj):
#         return obj.get_next_available_time()
    
#     def validate(self, data):
#         """Validate time variant configuration using validators"""
#         errors = validate_time_variant(data)
        
#         if errors:
#             raise serializers.ValidationError(errors)
        
#         return data


# class InternetPlanSerializer(serializers.ModelSerializer):
#     """
#     Serializer for Internet Plans - Production Ready
#     FIXED: Proper validation integration with utils.validators and None value handling
#     """
    
#     # Write-only fields for IDs
#     template_id = serializers.UUIDField(
#         write_only=True,
#         required=False,
#         allow_null=True,
#         help_text="Template ID to copy configuration from"
#     )
    
#     time_variant_id = serializers.UUIDField(
#         write_only=True,
#         required=False,
#         allow_null=True,
#         help_text="Time variant configuration ID"
#     )
    
#     allowed_routers_ids = serializers.ListField(
#         child=serializers.IntegerField(),
#         write_only=True,
#         required=False,
#         default=list,
#         help_text="List of allowed router IDs (only if router_specific is true)"
#     )
    
#     # Read-only computed fields
#     allowed_routers = serializers.SerializerMethodField(read_only=True)
#     enabled_access_methods = serializers.SerializerMethodField(read_only=True)
#     access_type = serializers.SerializerMethodField(read_only=True)
#     is_available_now = serializers.SerializerMethodField(read_only=True)
#     availability_info = serializers.SerializerMethodField(read_only=True)
#     time_variant_summary = serializers.SerializerMethodField(read_only=True)
#     technical_config = serializers.SerializerMethodField(read_only=True)
#     created_by_info = serializers.SerializerMethodField(read_only=True)
#     has_time_variant = serializers.SerializerMethodField(read_only=True)
#     price_formatted = serializers.SerializerMethodField(read_only=True)
    
#     # Related objects
#     time_variant = TimeVariantConfigSerializer(read_only=True)
    
#     class Meta:
#         model = InternetPlan
#         fields = [
#             # Core fields
#             'id', 'plan_type', 'name', 'price', 'price_formatted', 'active', 'category', 'description',
            
#             # Configuration
#             'access_methods', 'priority_level', 'router_specific',
#             'fup_policy', 'fup_threshold',
            
#             # Relationship IDs (write-only)
#             'template_id', 'time_variant_id', 'allowed_routers_ids',
            
#             # Related objects (read-only)
#             'time_variant', 'allowed_routers',
            
#             # Metadata
#             'purchases', 'client_sessions', 'created_at', 'updated_at', 'created_by',
            
#             # Computed fields
#             'enabled_access_methods', 'access_type', 'is_available_now',
#             'availability_info', 'time_variant_summary', 'technical_config',
#             'created_by_info', 'has_time_variant'
#         ]
#         read_only_fields = [
#             'id', 'purchases', 'client_sessions', 'created_at', 'updated_at',
#             'created_by', 'allowed_routers', 'time_variant', 'enabled_access_methods',
#             'access_type', 'is_available_now', 'availability_info', 'time_variant_summary',
#             'technical_config', 'created_by_info', 'has_time_variant', 'price_formatted'
#         ]
    
#     def get_enabled_access_methods(self, obj):
#         return obj.get_enabled_access_methods()
    
#     def get_access_type(self, obj):
#         return obj.get_access_type()
    
#     def get_is_available_now(self, obj):
#         availability = obj.is_available_for_client()
#         return availability.get('available', False)
    
#     def get_availability_info(self, obj):
#         return obj.is_available_for_client()
    
#     def get_time_variant_summary(self, obj):
#         return obj.get_time_variant_summary()
    
#     def get_technical_config(self, obj):
#         configs = {}
#         for method in obj.get_enabled_access_methods():
#             configs[method] = obj.get_technical_config(method)
#         return configs
    
#     def get_allowed_routers(self, obj):
#         try:
#             from network_management.serializers.router_management_serializer import RouterSerializer
#             return RouterSerializer(obj.allowed_routers.all(), many=True).data
#         except ImportError:
#             return []
    
#     def get_created_by_info(self, obj):
#         if obj.created_by:
#             return {
#                 'id': obj.created_by.id,
#                 'email': obj.created_by.email,
#                 'username': getattr(obj.created_by, 'username', None)
#             }
#         return None
    
#     def get_has_time_variant(self, obj):
#         return obj.has_time_variant()
    
#     def get_price_formatted(self, obj):
#         return f"KSH {float(obj.price):,.2f}"
    
#     def _clean_access_methods(self, access_methods):
#         """
#         Clean access methods by removing None values and empty strings
#         """
#         if not isinstance(access_methods, dict):
#             return access_methods
        
#         cleaned = {}
#         for method, config in access_methods.items():
#             if not isinstance(config, dict):
#                 cleaned[method] = config
#                 continue
            
#             cleaned_config = {}
#             for key, value in config.items():
#                 # Handle None values - skip them (will use model defaults)
#                 if value is None:
#                     continue
                
#                 # Handle empty strings for various fields
#                 if isinstance(value, str) and value.strip() == '':
#                     # For required fields, keep empty string will fail validation
#                     # For optional fields, skip to use default
#                     if key in ['ip_pool', 'service_name']:
#                         # Optional string fields - keep as empty string
#                         cleaned_config[key] = ''
#                     elif key in ['download_speed', 'upload_speed', 'data_limit', 'usage_limit']:
#                         # Required fields - keep as is, validation will catch
#                         cleaned_config[key] = value
#                     else:
#                         # Skip other empty strings
#                         continue
#                 else:
#                     cleaned_config[key] = value
            
#             cleaned[method] = cleaned_config
        
#         return cleaned
    
#     def validate(self, data):
#         """Validate plan data using utils.validators"""
#         errors = {}
        
#         # Validate name uniqueness
#         name = data.get('name')
#         instance_id = self.instance.id if self.instance else None
#         if name:
#             # Check for empty/whitespace only names
#             if not name.strip():
#                 errors['name'] = 'Plan name cannot be empty'
#             elif InternetPlan.objects.filter(name=name).exclude(id=instance_id).exists():
#                 errors['name'] = f'A plan with the name "{name}" already exists'
        
#         # Determine if zero price is allowed based on plan type
#         plan_type = data.get('plan_type', '').lower()
#         is_free_trial = plan_type == 'free_trial'
        
#         # Validate price using validator - FIXED: Properly handle allow_zero
#         price = data.get('price')
#         if price is not None:
#             # For free trial, allow zero price
#             allow_zero = is_free_trial
#             is_valid_price, price_result = validate_price(price, allow_zero)
            
#             if not is_valid_price:
#                 # price_result is an error message string
#                 errors['price'] = str(price_result)
#             else:
#                 # price_result is a Decimal
#                 data['price'] = price_result
        
#         # Additional validation for free trial
#         if is_free_trial:
#             # Double-check price is zero
#             final_price = data.get('price', Decimal('0'))
#             if final_price != Decimal('0'):
#                 errors['price'] = 'Free Trial plans must have price set to 0'
        
#         # Validate access methods using validator - Clean None values first
#         access_methods = data.get('access_methods')
#         if access_methods:
#             # Clean the access methods data - remove None values that will use defaults
#             cleaned_access_methods = self._clean_access_methods(access_methods)
#             is_valid, error_message = validate_access_methods(cleaned_access_methods)
#             if not is_valid:
#                 errors['access_methods'] = error_message
#             else:
#                 # Update with cleaned data
#                 data['access_methods'] = cleaned_access_methods
#         else:
#             errors['access_methods'] = 'Access methods configuration is required'
        
#         # Validate FUP threshold
#         fup_threshold = data.get('fup_threshold')
#         if fup_threshold is not None:
#             try:
#                 threshold = int(fup_threshold)
#                 if threshold < 1 or threshold > 100:
#                     errors['fup_threshold'] = 'FUP threshold must be between 1% and 100%'
#             except (ValueError, TypeError):
#                 errors['fup_threshold'] = 'FUP threshold must be a valid number'
        
#         # Validate router-specific settings
#         router_specific = data.get('router_specific', False)
#         allowed_routers_ids = data.get('allowed_routers_ids', [])
        
#         if router_specific and not allowed_routers_ids:
#             errors['allowed_routers_ids'] = 'Allowed routers are required for router-specific plans'
#         elif not router_specific and allowed_routers_ids:
#             errors['allowed_routers_ids'] = 'Allowed routers can only be specified for router-specific plans'
        
#         # Validate priority level
#         priority_level = data.get('priority_level')
#         if priority_level is not None:
#             try:
#                 priority = int(priority_level)
#                 if priority < 1 or priority > 8:
#                     errors['priority_level'] = 'Priority level must be between 1 and 8'
#             except (ValueError, TypeError):
#                 errors['priority_level'] = 'Priority level must be a valid number'
        
#         if errors:
#             raise serializers.ValidationError(errors)
        
#         return data
    
#     def create(self, validated_data):
#         """Create plan with proper relationship handling"""
#         # Extract relationship IDs
#         template_id = validated_data.pop('template_id', None)
#         time_variant_id = validated_data.pop('time_variant_id', None)
#         allowed_routers_ids = validated_data.pop('allowed_routers_ids', [])
        
#         # Set created_by from request
#         request = self.context.get('request')
#         if request and request.user.is_authenticated:
#             validated_data['created_by'] = request.user
        
#         with transaction.atomic():
#             # Handle template
#             if template_id:
#                 try:
#                     template = PlanTemplate.objects.get(id=template_id, is_active=True)
#                     validated_data['template'] = template
#                 except PlanTemplate.DoesNotExist:
#                     raise serializers.ValidationError({
#                         'template_id': 'Template not found or inactive'
#                     })
            
#             # Handle time variant
#             if time_variant_id:
#                 try:
#                     time_variant = TimeVariantConfig.objects.get(id=time_variant_id)
#                     validated_data['time_variant'] = time_variant
#                 except TimeVariantConfig.DoesNotExist:
#                     raise serializers.ValidationError({
#                         'time_variant_id': 'Time variant configuration not found'
#                     })
            
#             # Create plan
#             plan = InternetPlan.objects.create(**validated_data)
            
#             # Handle allowed routers
#             if plan.router_specific and allowed_routers_ids:
#                 try:
#                     from network_management.models.router_management_model import Router
#                     routers = Router.objects.filter(id__in=allowed_routers_ids, is_active=True)
#                     plan.allowed_routers.set(routers)
#                 except ImportError:
#                     logger.warning("Network management app not installed")
        
#         # Clear cache
#         cache.delete_pattern("internet_plans:*")
#         cache.delete(f"internet_plan:{plan.id}")
        
#         return plan
    
#     def update(self, instance, validated_data):
#         """Update plan with proper relationship handling"""
#         template_id = validated_data.pop('template_id', None)
#         time_variant_id = validated_data.pop('time_variant_id', None)
#         allowed_routers_ids = validated_data.pop('allowed_routers_ids', None)
        
#         with transaction.atomic():
#             # Handle template
#             if template_id is not None:
#                 if template_id:
#                     try:
#                         template = PlanTemplate.objects.get(id=template_id, is_active=True)
#                         instance.template = template
#                     except PlanTemplate.DoesNotExist:
#                         raise serializers.ValidationError({
#                             'template_id': 'Template not found or inactive'
#                         })
#                 else:
#                     instance.template = None
            
#             # Handle time variant
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
            
#             instance.save()
            
#             # Handle allowed routers
#             if allowed_routers_ids is not None:
#                 if instance.router_specific:
#                     try:
#                         from network_management.models.router_management_model import Router
#                         routers = Router.objects.filter(id__in=allowed_routers_ids, is_active=True)
#                         instance.allowed_routers.set(routers)
#                     except ImportError:
#                         logger.warning("Network management app not installed")
#                 else:
#                     instance.allowed_routers.clear()
        
#         # Clear cache
#         cache.delete_pattern("internet_plans:*")
#         cache.delete(f"internet_plan:{instance.id}")
        
#         return instance


# class InternetPlanListSerializer(serializers.ModelSerializer):
#     """
#     Simplified serializer for plan listing
#     """
    
#     access_type = serializers.SerializerMethodField(read_only=True)
#     is_available_now = serializers.SerializerMethodField(read_only=True)
#     price_formatted = serializers.SerializerMethodField(read_only=True)
#     has_time_variant = serializers.SerializerMethodField(read_only=True)
    
#     class Meta:
#         model = InternetPlan
#         fields = [
#             'id', 'name', 'price', 'price_formatted', 'plan_type', 'category',
#             'description', 'access_type', 'is_available_now', 'purchases',
#             'active', 'priority_level', 'created_at', 'has_time_variant'
#         ]
    
#     def get_access_type(self, obj):
#         return obj.get_access_type()
    
#     def get_is_available_now(self, obj):
#         availability = obj.is_available_for_client()
#         return availability.get('available', False)
    
#     def get_price_formatted(self, obj):
#         return f"KSH {float(obj.price):,.2f}"
    
#     def get_has_time_variant(self, obj):
#         return obj.has_time_variant()


# class InternetPlanCreateSerializer(serializers.ModelSerializer):
#     """
#     Serializer for creating new plans - Optimized for frontend
#     """
    
#     template_id = serializers.UUIDField(
#         write_only=True,
#         required=False,
#         allow_null=True
#     )
    
#     time_variant_id = serializers.UUIDField(
#         write_only=True,
#         required=False,
#         allow_null=True
#     )
    
#     allowed_routers_ids = serializers.ListField(
#         child=serializers.IntegerField(),
#         write_only=True,
#         required=False,
#         default=list
#     )
    
#     class Meta:
#         model = InternetPlan
#         fields = [
#             'plan_type', 'name', 'price', 'active', 'category', 'description',
#             'access_methods', 'priority_level', 'router_specific',
#             'fup_policy', 'fup_threshold',
#             'template_id', 'time_variant_id', 'allowed_routers_ids'
#         ]
    
#     def validate(self, data):
#         """Validate creation data"""
#         errors = {}
        
#         # Required fields
#         if not data.get('name'):
#             errors['name'] = 'Plan name is required'
#         elif not data['name'].strip():
#             errors['name'] = 'Plan name cannot be empty'
        
#         if not data.get('category'):
#             errors['category'] = 'Category is required'
        
#         if data.get('price') is None:
#             errors['price'] = 'Price is required'
        
#         # Free trial validation - FIXED: More explicit
#         plan_type = data.get('plan_type')
#         if plan_type == 'free_trial':
#             price = data.get('price')
#             if price != 0 and price != Decimal('0'):
#                 errors['price'] = 'Free Trial plans must have price set to 0'
        
#         # Validate router-specific settings
#         router_specific = data.get('router_specific', False)
#         allowed_routers_ids = data.get('allowed_routers_ids', [])
        
#         if router_specific and not allowed_routers_ids:
#             errors['allowed_routers_ids'] = 'Allowed routers are required for router-specific plans'
        
#         if errors:
#             raise serializers.ValidationError(errors)
        
#         return data
    
#     def create(self, validated_data):
#         """Use main serializer for creation"""
#         serializer = InternetPlanSerializer(
#             data=validated_data,
#             context=self.context
#         )
#         serializer.is_valid(raise_exception=True)
#         return serializer.save()


# class InternetPlanUpdateSerializer(serializers.ModelSerializer):
#     """
#     Serializer for updating existing plans
#     """
    
#     template_id = serializers.UUIDField(
#         write_only=True,
#         required=False,
#         allow_null=True
#     )
    
#     time_variant_id = serializers.UUIDField(
#         write_only=True,
#         required=False,
#         allow_null=True
#     )
    
#     allowed_routers_ids = serializers.ListField(
#         child=serializers.IntegerField(),
#         write_only=True,
#         required=False
#     )
    
#     class Meta:
#         model = InternetPlan
#         fields = [
#             'plan_type', 'name', 'price', 'active', 'category', 'description',
#             'access_methods', 'priority_level', 'router_specific',
#             'fup_policy', 'fup_threshold',
#             'template_id', 'time_variant_id', 'allowed_routers_ids'
#         ]
    
#     def validate(self, data):
#         """Validate update data"""
#         errors = {}
        
#         # Name uniqueness check
#         name = data.get('name')
#         if name is not None:
#             if not name.strip():
#                 errors['name'] = 'Plan name cannot be empty'
#             elif self.instance and InternetPlan.objects.filter(name=name).exclude(id=self.instance.id).exists():
#                 errors['name'] = f'A plan with the name "{name}" already exists'
        
#         # Free trial validation
#         if data.get('plan_type') == 'free_trial':
#             price = data.get('price')
#             if price is not None and price != Decimal('0'):
#                 errors['price'] = 'Free Trial plans must have price set to 0'
        
#         # Validate access methods if provided
#         access_methods = data.get('access_methods')
#         if access_methods:
#             # Let the main serializer handle detailed validation
#             pass
        
#         # Validate router-specific settings
#         router_specific = data.get('router_specific')
#         allowed_routers_ids = data.get('allowed_routers_ids')
        
#         if router_specific is not None:
#             if router_specific and not allowed_routers_ids:
#                 errors['allowed_routers_ids'] = 'Allowed routers are required for router-specific plans'
#             elif not router_specific and allowed_routers_ids:
#                 errors['allowed_routers_ids'] = 'Allowed routers can only be specified for router-specific plans'
        
#         if errors:
#             raise serializers.ValidationError(errors)
        
#         return data
    
#     def update(self, instance, validated_data):
#         """Use main serializer for update"""
#         serializer = InternetPlanSerializer(
#             instance,
#             data=validated_data,
#             context=self.context,
#             partial=True
#         )
#         serializer.is_valid(raise_exception=True)
#         return serializer.save()


# class InternetPlanDetailSerializer(serializers.ModelSerializer):
#     """
#     Detailed serializer for individual plan view
#     """
    
#     # Related objects
#     time_variant = TimeVariantConfigSerializer(read_only=True)
#     allowed_routers = serializers.SerializerMethodField(read_only=True)
    
#     # Computed fields
#     enabled_access_methods = serializers.SerializerMethodField(read_only=True)
#     access_type = serializers.SerializerMethodField(read_only=True)
#     is_available_now = serializers.SerializerMethodField(read_only=True)
#     availability_info = serializers.SerializerMethodField(read_only=True)
#     time_variant_summary = serializers.SerializerMethodField(read_only=True)
#     technical_config = serializers.SerializerMethodField(read_only=True)
#     price_formatted = serializers.SerializerMethodField(read_only=True)
    
#     # User info
#     created_by_info = serializers.SerializerMethodField(read_only=True)
    
#     class Meta:
#         model = InternetPlan
#         fields = [
#             'id', 'plan_type', 'name', 'price', 'price_formatted', 'active', 'category', 'description',
#             'access_methods', 'priority_level', 'router_specific', 
#             'fup_policy', 'fup_threshold', 'time_variant',
#             'allowed_routers', 'purchases', 'client_sessions',
#             'created_at', 'updated_at', 'created_by', 'created_by_info',
#             'enabled_access_methods', 'access_type', 'is_available_now',
#             'availability_info', 'time_variant_summary', 'technical_config',
#             'template'
#         ]
#         read_only_fields = fields
    
#     def get_enabled_access_methods(self, obj):
#         return obj.get_enabled_access_methods()
    
#     def get_access_type(self, obj):
#         return obj.get_access_type()
    
#     def get_is_available_now(self, obj):
#         availability = obj.is_available_for_client()
#         return availability.get('available', False)
    
#     def get_availability_info(self, obj):
#         return obj.is_available_for_client()
    
#     def get_time_variant_summary(self, obj):
#         return obj.get_time_variant_summary()
    
#     def get_technical_config(self, obj):
#         configs = {}
#         for method in obj.get_enabled_access_methods():
#             configs[method] = obj.get_technical_config(method)
#         return configs
    
#     def get_allowed_routers(self, obj):
#         try:
#             from network_management.serializers.router_management_serializer import RouterSerializer
#             return RouterSerializer(obj.allowed_routers.all(), many=True).data
#         except ImportError:
#             return []
    
#     def get_created_by_info(self, obj):
#         if obj.created_by:
#             return {
#                 'id': obj.created_by.id,
#                 'email': obj.created_by.email,
#                 'username': getattr(obj.created_by, 'username', None)
#             }
#         return None
    
#     def get_price_formatted(self, obj):
#         return f"KSH {float(obj.price):,.2f}"


# class PlanCompatibilitySerializer(serializers.Serializer):
#     """
#     Serializer for checking plan compatibility
#     """
    
#     plan_id = serializers.UUIDField(required=True)
#     access_method = serializers.ChoiceField(
#         choices=[('hotspot', 'Hotspot'), ('pppoe', 'PPPoE')],
#         required=True
#     )
#     router_id = serializers.IntegerField(required=False, allow_null=True)
#     check_time_availability = serializers.BooleanField(default=True)
    
#     def validate(self, data):
#         """Validate compatibility check"""
#         plan_id = data['plan_id']
        
#         try:
#             plan = InternetPlan.objects.get(id=plan_id, active=True)
#         except InternetPlan.DoesNotExist:
#             raise serializers.ValidationError({
#                 'plan_id': 'Plan not found or inactive'
#             })
        
#         # Check access method support
#         access_method = data['access_method']
#         if not plan.supports_access_method(access_method):
#             raise serializers.ValidationError({
#                 'access_method': f'Plan does not support {access_method} access method'
#             })
        
#         # Check router compatibility
#         router_id = data.get('router_id')
#         if plan.router_specific and router_id:
#             if not plan.can_be_used_on_router(router_id):
#                 raise serializers.ValidationError({
#                     'router_id': 'Plan cannot be used on specified router'
#                 })
        
#         # Check time availability
#         if data.get('check_time_availability', True):
#             availability = plan.is_available_for_client()
#             if not availability['available']:
#                 raise serializers.ValidationError({
#                     'availability': availability['reason'],
#                     'code': availability['code'],
#                     'next_available': availability.get('next_available')
#                 })
        
#         self.context['plan'] = plan
#         return data
    
#     def get_compatibility_result(self):
#         """Get compatibility result"""
#         plan = self.context.get('plan')
#         if not plan:
#             return None
        
#         return {
#             'compatible': True,
#             'plan_id': str(plan.id),
#             'plan_name': plan.name,
#             'access_method': self.validated_data['access_method'],
#             'router_specific': plan.router_specific,
#             'technical_config': plan.get_technical_config(self.validated_data['access_method']),
#             'availability': plan.is_available_for_client()
#         }


# class PlanAvailabilityCheckSerializer(serializers.Serializer):
#     """
#     Serializer for checking plan availability
#     """
    
#     plan_id = serializers.UUIDField(required=True)
#     check_time_variant = serializers.BooleanField(default=True)
    
#     def validate(self, data):
#         """Validate availability check"""
#         plan_id = data['plan_id']
        
#         try:
#             plan = InternetPlan.objects.get(id=plan_id, active=True)
#         except InternetPlan.DoesNotExist:
#             raise serializers.ValidationError({
#                 'plan_id': 'Plan not found or inactive'
#             })
        
#         self.context['plan'] = plan
#         return data


# class AvailablePlansRequestSerializer(serializers.Serializer):
#     """
#     Serializer for requesting available plans
#     """
    
#     client_type = serializers.ChoiceField(
#         choices=[('hotspot', 'Hotspot'), ('pppoe', 'PPPoE')],
#         default='hotspot',
#         required=False
#     )
    
#     router_id = serializers.IntegerField(
#         required=False,
#         allow_null=True
#     )
    
#     category = serializers.CharField(
#         required=False,
#         allow_null=True
#     )
    
#     max_price = serializers.DecimalField(
#         max_digits=10,
#         decimal_places=2,
#         required=False,
#         allow_null=True
#     )
    
#     include_unavailable = serializers.BooleanField(
#         default=False
#     )
    
#     def get_available_plans(self):
#         """Get available plans based on filters"""
#         client_type = self.validated_data['client_type']
#         router_id = self.validated_data.get('router_id')
#         category = self.validated_data.get('category')
#         max_price = self.validated_data.get('max_price')
#         include_unavailable = self.validated_data.get('include_unavailable', False)
        
#         if include_unavailable:
#             queryset = InternetPlan.objects.filter(active=True).select_related('time_variant')
            
#             if category:
#                 queryset = queryset.filter(category=category)
            
#             if max_price is not None:
#                 queryset = queryset.filter(price__lte=max_price)
            
#             if client_type == 'hotspot':
#                 queryset = queryset.filter(access_methods__hotspot__enabled=True)
#             elif client_type == 'pppoe':
#                 queryset = queryset.filter(access_methods__pppoe__enabled=True)
            
#             if router_id:
#                 queryset = queryset.filter(
#                     Q(router_specific=False) |
#                     Q(router_specific=True, allowed_routers__id=router_id)
#                 ).distinct()
            
#             plans = list(queryset.order_by('-priority_level', 'price'))
#         else:
#             plans = InternetPlan.get_available_plans_for_client(client_type, router_id)
            
#             if category:
#                 plans = [p for p in plans if p.category == category]
            
#             if max_price is not None:
#                 plans = [p for p in plans if p.price <= max_price]
        
#         serializer = InternetPlanListSerializer(plans, many=True, context=self.context)
        
#         return {
#             'count': len(plans),
#             'client_type': client_type,
#             'filters_applied': {
#                 'router_id': router_id,
#                 'category': category,
#                 'max_price': float(max_price) if max_price else None,
#                 'include_unavailable': include_unavailable
#             },
#             'plans': serializer.data
#         }







"""
Internet Plans - Plan Serializers with Time Variant Support
PRODUCTION READY: Complete with all required serializers, proper validation, and error handling
FIXED: Access methods serialization and None value handling
"""

from rest_framework import serializers
from django.core.exceptions import ValidationError
from django.db import transaction
from django.db.models import Q
from django.utils import timezone
from decimal import Decimal
import logging
from django.core.cache import cache

from internet_plans.models.plan_models import InternetPlan, PlanTemplate, TimeVariantConfig
from internet_plans.utils.validators import (
    validate_access_methods,
    validate_price,
    validate_duration_hours,
    validate_time_variant,
    validate_date_format,
    validate_future_date
)

logger = logging.getLogger(__name__)


class TimeVariantConfigSerializer(serializers.ModelSerializer):
    """
    Serializer for Time Variant Configuration
    """
    
    is_available_now = serializers.SerializerMethodField(read_only=True)
    availability_summary = serializers.SerializerMethodField(read_only=True)
    next_available_time = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = TimeVariantConfig
        fields = [
            'id', 'is_active', 'start_time', 'end_time', 'available_days',
            'schedule_active', 'schedule_start_date', 'schedule_end_date',
            'duration_active', 'duration_value', 'duration_unit', 'duration_start_date',
            'exclusion_dates', 'timezone', 'force_available', 'created_at', 'updated_at',
            'is_available_now', 'availability_summary', 'next_available_time'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_is_available_now(self, obj):
        return obj.is_available_now()
    
    def get_availability_summary(self, obj):
        return obj.get_availability_summary()
    
    def get_next_available_time(self, obj):
        return obj.get_next_available_time()
    
    def validate(self, data):
        """Validate time variant configuration using validators"""
        errors = validate_time_variant(data)
        
        if errors:
            raise serializers.ValidationError(errors)
        
        return data


class InternetPlanSerializer(serializers.ModelSerializer):
    """
    Serializer for Internet Plans - Production Ready
    FIXED: Proper access methods serialization and None value handling
    """
    
    # Write-only fields for IDs
    template_id = serializers.UUIDField(
        write_only=True,
        required=False,
        allow_null=True,
        help_text="Template ID to copy configuration from"
    )
    
    time_variant_id = serializers.UUIDField(
        write_only=True,
        required=False,
        allow_null=True,
        help_text="Time variant configuration ID"
    )
    
    allowed_routers_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False,
        default=list,
        help_text="List of allowed router IDs (only if router_specific is true)"
    )
    
    # Read-only computed fields
    allowed_routers = serializers.SerializerMethodField(read_only=True)
    enabled_access_methods = serializers.SerializerMethodField(read_only=True)
    access_type = serializers.SerializerMethodField(read_only=True)
    is_available_now = serializers.SerializerMethodField(read_only=True)
    availability_info = serializers.SerializerMethodField(read_only=True)
    time_variant_summary = serializers.SerializerMethodField(read_only=True)
    technical_config = serializers.SerializerMethodField(read_only=True)
    created_by_info = serializers.SerializerMethodField(read_only=True)
    has_time_variant = serializers.SerializerMethodField(read_only=True)
    price_formatted = serializers.SerializerMethodField(read_only=True)
    
    # Related objects
    time_variant = TimeVariantConfigSerializer(read_only=True)
    
    class Meta:
        model = InternetPlan
        fields = [
            # Core fields
            'id', 'plan_type', 'name', 'price', 'price_formatted', 'active', 'category', 'description',
            
            # Configuration
            'access_methods', 'priority_level', 'router_specific',
            'fup_policy', 'fup_threshold',
            
            # Relationship IDs (write-only)
            'template_id', 'time_variant_id', 'allowed_routers_ids',
            
            # Related objects (read-only)
            'time_variant', 'allowed_routers',
            
            # Metadata
            'purchases', 'client_sessions', 'created_at', 'updated_at', 'created_by',
            
            # Computed fields
            'enabled_access_methods', 'access_type', 'is_available_now',
            'availability_info', 'time_variant_summary', 'technical_config',
            'created_by_info', 'has_time_variant'
        ]
        read_only_fields = [
            'id', 'purchases', 'client_sessions', 'created_at', 'updated_at',
            'created_by', 'allowed_routers', 'time_variant', 'enabled_access_methods',
            'access_type', 'is_available_now', 'availability_info', 'time_variant_summary',
            'technical_config', 'created_by_info', 'has_time_variant', 'price_formatted'
        ]
    
    def get_enabled_access_methods(self, obj):
        return obj.get_enabled_access_methods()
    
    def get_access_type(self, obj):
        return obj.get_access_type()
    
    def get_is_available_now(self, obj):
        availability = obj.is_available_for_client()
        return availability.get('available', False)
    
    def get_availability_info(self, obj):
        return obj.is_available_for_client()
    
    def get_time_variant_summary(self, obj):
        return obj.get_time_variant_summary()
    
    def get_technical_config(self, obj):
        configs = {}
        for method in obj.get_enabled_access_methods():
            configs[method] = obj.get_technical_config(method)
        return configs
    
    def get_allowed_routers(self, obj):
        try:
            # Use string reference to avoid circular import
            from network_management.serializers.router_management_serializer import RouterSerializer
            return RouterSerializer(obj.allowed_routers.all(), many=True).data
        except ImportError:
            return []
    
    def get_created_by_info(self, obj):
        if obj.created_by:
            return {
                'id': obj.created_by.id,
                'email': obj.created_by.email,
                'username': getattr(obj.created_by, 'username', None)
            }
        return None
    
    def get_has_time_variant(self, obj):
        return obj.has_time_variant()
    
    def get_price_formatted(self, obj):
        return f"KSH {float(obj.price):,.2f}"
    
    def _ensure_access_methods_structure(self, access_methods):
        """
        Ensure access methods have proper structure with both methods present
        """
        if not isinstance(access_methods, dict):
            access_methods = {}
        
        # Ensure both methods exist
        if 'hotspot' not in access_methods:
            access_methods['hotspot'] = {}
        if 'pppoe' not in access_methods:
            access_methods['pppoe'] = {}
        
        # Process each method
        for method in ['hotspot', 'pppoe']:
            config = access_methods[method]
            if not isinstance(config, dict):
                config = {}
            
            # Ensure enabled is boolean
            if 'enabled' not in config:
                config['enabled'] = method == 'hotspot'  # Default: hotspot enabled
            elif isinstance(config['enabled'], str):
                config['enabled'] = config['enabled'].lower() == 'true'
            elif config['enabled'] is None:
                config['enabled'] = False
            
            # Ensure required nested fields exist
            nested_fields = ['download_speed', 'upload_speed', 'data_limit', 'usage_limit', 'validity_period']
            for field in nested_fields:
                if field not in config or not isinstance(config[field], dict):
                    config[field] = {'value': '', 'unit': self._get_default_unit(field)}
                else:
                    # Clean nested field
                    field_config = config[field]
                    if not isinstance(field_config, dict):
                        field_config = {'value': '', 'unit': self._get_default_unit(field)}
                    if 'value' not in field_config or field_config['value'] is None:
                        field_config['value'] = ''
                    if 'unit' not in field_config or field_config['unit'] is None:
                        field_config['unit'] = self._get_default_unit(field)
                    config[field] = field_config
            
            # Ensure numeric fields exist
            numeric_fields = ['bandwidth_limit', 'max_devices', 'session_timeout', 'idle_timeout']
            for field in numeric_fields:
                if field not in config or config[field] is None:
                    config[field] = ''
            
            # PPPoE specific fields
            if method == 'pppoe':
                pppoe_fields = ['ip_pool', 'service_name', 'mtu']
                for field in pppoe_fields:
                    if field not in config or config[field] is None:
                        config[field] = ''
            
            # MAC binding
            if 'mac_binding' not in config or config['mac_binding'] is None:
                config['mac_binding'] = False
            elif isinstance(config['mac_binding'], str):
                config['mac_binding'] = config['mac_binding'].lower() == 'true'
            
            access_methods[method] = config
        
        return access_methods
    
    def _get_default_unit(self, field):
        """Get default unit for a field"""
        units = {
            'download_speed': 'mbps',
            'upload_speed': 'mbps',
            'data_limit': 'gb',
            'usage_limit': 'hours',
            'validity_period': 'days'
        }
        return units.get(field, '')
    
    def _clean_access_methods(self, access_methods):
        """
        Clean access methods by removing None values and empty strings
        """
        if not isinstance(access_methods, dict):
            return access_methods
        
        cleaned = {}
        for method, config in access_methods.items():
            if not isinstance(config, dict):
                cleaned[method] = config
                continue
            
            cleaned_config = {}
            for key, value in config.items():
                # Handle None values - use defaults
                if value is None:
                    continue
                
                # Handle empty strings
                if isinstance(value, str) and value.strip() == '':
                    # For optional fields, keep empty string
                    if key in ['ip_pool', 'service_name']:
                        cleaned_config[key] = ''
                    elif key in ['download_speed', 'upload_speed', 'data_limit', 'usage_limit', 'validity_period']:
                        # These should be dictionaries, handle in nested processing
                        cleaned_config[key] = value
                    else:
                        # Skip other empty strings
                        continue
                else:
                    cleaned_config[key] = value
            
            # Process nested fields that might be strings instead of dictionaries
            nested_fields = ['download_speed', 'upload_speed', 'data_limit', 'usage_limit', 'validity_period']
            for field in nested_fields:
                if field in cleaned_config and not isinstance(cleaned_config[field], dict):
                    if isinstance(cleaned_config[field], str) and cleaned_config[field].strip():
                        # Try to parse as JSON if it's a string
                        try:
                            import json
                            parsed = json.loads(cleaned_config[field])
                            if isinstance(parsed, dict):
                                cleaned_config[field] = parsed
                        except:
                            # Not valid JSON, use default
                            cleaned_config[field] = {'value': cleaned_config[field], 'unit': self._get_default_unit(field)}
                    else:
                        # Not a dict and not a valid string, use default
                        cleaned_config[field] = {'value': '', 'unit': self._get_default_unit(field)}
            
            cleaned[method] = cleaned_config
        
        return cleaned
    
    def to_representation(self, instance):
        """
        Custom representation to ensure access methods are properly structured
        """
        data = super().to_representation(instance)
        
        # Ensure access methods are properly structured
        if 'access_methods' in data:
            data['access_methods'] = self._ensure_access_methods_structure(data['access_methods'])
            
            # Recalculate computed fields after ensuring structure
            hotspot_enabled = data['access_methods'].get('hotspot', {}).get('enabled', False)
            pppoe_enabled = data['access_methods'].get('pppoe', {}).get('enabled', False)
            
            enabled_methods = []
            if hotspot_enabled:
                enabled_methods.append('hotspot')
            if pppoe_enabled:
                enabled_methods.append('pppoe')
            
            data['enabled_access_methods'] = enabled_methods
            
            if hotspot_enabled and pppoe_enabled:
                data['access_type'] = 'both'
            elif hotspot_enabled:
                data['access_type'] = 'hotspot'
            elif pppoe_enabled:
                data['access_type'] = 'pppoe'
            else:
                data['access_type'] = 'none'
        
        return data
    
    def validate(self, data):
        """Validate plan data using utils.validators"""
        errors = {}
        
        # Validate name uniqueness
        name = data.get('name')
        instance_id = self.instance.id if self.instance else None
        if name:
            # Check for empty/whitespace only names
            if not name.strip():
                errors['name'] = 'Plan name cannot be empty'
            elif InternetPlan.objects.filter(name=name).exclude(id=instance_id).exists():
                errors['name'] = f'A plan with the name "{name}" already exists'
        
        # Determine if zero price is allowed based on plan type
        plan_type = data.get('plan_type', '').lower()
        is_free_trial = plan_type == 'free_trial'
        
        # Validate price using validator
        price = data.get('price')
        if price is not None:
            # For free trial, allow zero price
            allow_zero = is_free_trial
            is_valid_price, price_result = validate_price(price, allow_zero)
            
            if not is_valid_price:
                # price_result is an error message string
                errors['price'] = str(price_result)
            else:
                # price_result is a Decimal
                data['price'] = price_result
        
        # Additional validation for free trial
        if is_free_trial:
            # Double-check price is zero
            final_price = data.get('price', Decimal('0'))
            if final_price != Decimal('0'):
                errors['price'] = 'Free Trial plans must have price set to 0'
        
        # Validate access methods using validator - Ensure structure first
        access_methods = data.get('access_methods')
        if access_methods:
            # First ensure proper structure
            structured_methods = self._ensure_access_methods_structure(access_methods)
            # Clean None values
            cleaned_access_methods = self._clean_access_methods(structured_methods)
            # Validate
            is_valid, error_message = validate_access_methods(cleaned_access_methods)
            if not is_valid:
                errors['access_methods'] = error_message
            else:
                # Update with cleaned data
                data['access_methods'] = cleaned_access_methods
        else:
            # Use default access methods
            default_plan = InternetPlan()
            default_plan.set_default_access_methods()
            data['access_methods'] = default_plan.access_methods
        
        # Validate FUP threshold
        fup_threshold = data.get('fup_threshold')
        if fup_threshold is not None:
            try:
                threshold = int(fup_threshold)
                if threshold < 1 or threshold > 100:
                    errors['fup_threshold'] = 'FUP threshold must be between 1% and 100%'
            except (ValueError, TypeError):
                errors['fup_threshold'] = 'FUP threshold must be a valid number'
        
        # Validate router-specific settings
        router_specific = data.get('router_specific', False)
        allowed_routers_ids = data.get('allowed_routers_ids', [])
        
        if router_specific and not allowed_routers_ids:
            errors['allowed_routers_ids'] = 'Allowed routers are required for router-specific plans'
        elif not router_specific and allowed_routers_ids:
            errors['allowed_routers_ids'] = 'Allowed routers can only be specified for router-specific plans'
        
        # Validate priority level
        priority_level = data.get('priority_level')
        if priority_level is not None:
            try:
                priority = int(priority_level)
                if priority < 1 or priority > 8:
                    errors['priority_level'] = 'Priority level must be between 1 and 8'
            except (ValueError, TypeError):
                errors['priority_level'] = 'Priority level must be a valid number'
        
        if errors:
            raise serializers.ValidationError(errors)
        
        return data
    
    def create(self, validated_data):
        """Create plan with proper relationship handling"""
        # Extract relationship IDs
        template_id = validated_data.pop('template_id', None)
        time_variant_id = validated_data.pop('time_variant_id', None)
        allowed_routers_ids = validated_data.pop('allowed_routers_ids', [])
        
        # Ensure access methods are properly structured
        if 'access_methods' in validated_data:
            validated_data['access_methods'] = self._ensure_access_methods_structure(validated_data['access_methods'])
        
        # Set created_by from request
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['created_by'] = request.user
        
        with transaction.atomic():
            # Handle template
            if template_id:
                try:
                    template = PlanTemplate.objects.get(id=template_id, is_active=True)
                    validated_data['template'] = template
                except PlanTemplate.DoesNotExist:
                    raise serializers.ValidationError({
                        'template_id': 'Template not found or inactive'
                    })
            
            # Handle time variant
            if time_variant_id:
                try:
                    time_variant = TimeVariantConfig.objects.get(id=time_variant_id)
                    validated_data['time_variant'] = time_variant
                except TimeVariantConfig.DoesNotExist:
                    raise serializers.ValidationError({
                        'time_variant_id': 'Time variant configuration not found'
                    })
            
            # Create plan
            plan = InternetPlan.objects.create(**validated_data)
            
            # Handle allowed routers
            if plan.router_specific and allowed_routers_ids:
                try:
                    from network_management.models.router_management_model import Router
                    routers = Router.objects.filter(id__in=allowed_routers_ids, is_active=True)
                    plan.allowed_routers.set(routers)
                except ImportError:
                    logger.warning("Network management app not installed")
        
        # Clear cache
        try:
            cache.delete_pattern("internet_plans:*")
        except AttributeError:
            pass
        cache.delete(f"internet_plan:{plan.id}")
        
        return plan
    
    def update(self, instance, validated_data):
        """Update plan with proper relationship handling"""
        template_id = validated_data.pop('template_id', None)
        time_variant_id = validated_data.pop('time_variant_id', None)
        allowed_routers_ids = validated_data.pop('allowed_routers_ids', None)
        
        # Ensure access methods are properly structured
        if 'access_methods' in validated_data:
            validated_data['access_methods'] = self._ensure_access_methods_structure(validated_data['access_methods'])
        
        with transaction.atomic():
            # Handle template
            if template_id is not None:
                if template_id:
                    try:
                        template = PlanTemplate.objects.get(id=template_id, is_active=True)
                        instance.template = template
                    except PlanTemplate.DoesNotExist:
                        raise serializers.ValidationError({
                            'template_id': 'Template not found or inactive'
                        })
                else:
                    instance.template = None
            
            # Handle time variant
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
            
            instance.save()
            
            # Handle allowed routers
            if allowed_routers_ids is not None:
                if instance.router_specific:
                    try:
                        from network_management.models.router_management_model import Router
                        routers = Router.objects.filter(id__in=allowed_routers_ids, is_active=True)
                        instance.allowed_routers.set(routers)
                    except ImportError:
                        logger.warning("Network management app not installed")
                else:
                    instance.allowed_routers.clear()
        
        # Clear cache
        try:
            cache.delete_pattern("internet_plans:*")
        except AttributeError:
            pass
        cache.delete(f"internet_plan:{instance.id}")
        
        return instance


class InternetPlanListSerializer(serializers.ModelSerializer):
    """
    Simplified serializer for plan listing
    """
    
    access_type = serializers.SerializerMethodField(read_only=True)
    is_available_now = serializers.SerializerMethodField(read_only=True)
    price_formatted = serializers.SerializerMethodField(read_only=True)
    has_time_variant = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = InternetPlan
        fields = [
            'id', 'name', 'price', 'price_formatted', 'plan_type', 'category',
            'description', 'access_type', 'is_available_now', 'purchases',
            'active', 'priority_level', 'created_at', 'has_time_variant'
        ]
    
    def get_access_type(self, obj):
        return obj.get_access_type()
    
    def get_is_available_now(self, obj):
        availability = obj.is_available_for_client()
        return availability.get('available', False)
    
    def get_price_formatted(self, obj):
        return f"KSH {float(obj.price):,.2f}"
    
    def get_has_time_variant(self, obj):
        return obj.has_time_variant()
    
    def to_representation(self, instance):
        """Ensure access methods are included in list view"""
        data = super().to_representation(instance)
        # Include access methods for client-side filtering
        data['access_methods'] = instance.access_methods
        return data


class InternetPlanCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating new plans - Optimized for frontend
    """
    
    template_id = serializers.UUIDField(
        write_only=True,
        required=False,
        allow_null=True
    )
    
    time_variant_id = serializers.UUIDField(
        write_only=True,
        required=False,
        allow_null=True
    )
    
    allowed_routers_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False,
        default=list
    )
    
    class Meta:
        model = InternetPlan
        fields = [
            'plan_type', 'name', 'price', 'active', 'category', 'description',
            'access_methods', 'priority_level', 'router_specific',
            'fup_policy', 'fup_threshold',
            'template_id', 'time_variant_id', 'allowed_routers_ids'
        ]
    
    def validate(self, data):
        """Validate creation data"""
        errors = {}
        
        # Required fields
        if not data.get('name'):
            errors['name'] = 'Plan name is required'
        elif not data['name'].strip():
            errors['name'] = 'Plan name cannot be empty'
        
        if not data.get('category'):
            errors['category'] = 'Category is required'
        
        if data.get('price') is None:
            errors['price'] = 'Price is required'
        
        # Free trial validation
        plan_type = data.get('plan_type')
        if plan_type == 'free_trial':
            price = data.get('price')
            if price != 0 and price != Decimal('0'):
                errors['price'] = 'Free Trial plans must have price set to 0'
        
        # Validate router-specific settings
        router_specific = data.get('router_specific', False)
        allowed_routers_ids = data.get('allowed_routers_ids', [])
        
        if router_specific and not allowed_routers_ids:
            errors['allowed_routers_ids'] = 'Allowed routers are required for router-specific plans'
        
        if errors:
            raise serializers.ValidationError(errors)
        
        return data
    
    def create(self, validated_data):
        """Use main serializer for creation"""
        serializer = InternetPlanSerializer(
            data=validated_data,
            context=self.context
        )
        serializer.is_valid(raise_exception=True)
        return serializer.save()


class InternetPlanUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating existing plans
    """
    
    template_id = serializers.UUIDField(
        write_only=True,
        required=False,
        allow_null=True
    )
    
    time_variant_id = serializers.UUIDField(
        write_only=True,
        required=False,
        allow_null=True
    )
    
    allowed_routers_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = InternetPlan
        fields = [
            'plan_type', 'name', 'price', 'active', 'category', 'description',
            'access_methods', 'priority_level', 'router_specific',
            'fup_policy', 'fup_threshold',
            'template_id', 'time_variant_id', 'allowed_routers_ids'
        ]
    
    def validate(self, data):
        """Validate update data"""
        errors = {}
        
        # Name uniqueness check
        name = data.get('name')
        if name is not None:
            if not name.strip():
                errors['name'] = 'Plan name cannot be empty'
            elif self.instance and InternetPlan.objects.filter(name=name).exclude(id=self.instance.id).exists():
                errors['name'] = f'A plan with the name "{name}" already exists'
        
        # Free trial validation
        if data.get('plan_type') == 'free_trial':
            price = data.get('price')
            if price is not None and price != Decimal('0'):
                errors['price'] = 'Free Trial plans must have price set to 0'
        
        # Validate router-specific settings
        router_specific = data.get('router_specific')
        allowed_routers_ids = data.get('allowed_routers_ids')
        
        if router_specific is not None:
            if router_specific and not allowed_routers_ids:
                errors['allowed_routers_ids'] = 'Allowed routers are required for router-specific plans'
            elif not router_specific and allowed_routers_ids:
                errors['allowed_routers_ids'] = 'Allowed routers can only be specified for router-specific plans'
        
        if errors:
            raise serializers.ValidationError(errors)
        
        return data
    
    def update(self, instance, validated_data):
        """Use main serializer for update"""
        serializer = InternetPlanSerializer(
            instance,
            data=validated_data,
            context=self.context,
            partial=True
        )
        serializer.is_valid(raise_exception=True)
        return serializer.save()


class InternetPlanDetailSerializer(serializers.ModelSerializer):
    """
    Detailed serializer for individual plan view
    """
    
    # Related objects
    time_variant = TimeVariantConfigSerializer(read_only=True)
    allowed_routers = serializers.SerializerMethodField(read_only=True)
    
    # Computed fields
    enabled_access_methods = serializers.SerializerMethodField(read_only=True)
    access_type = serializers.SerializerMethodField(read_only=True)
    is_available_now = serializers.SerializerMethodField(read_only=True)
    availability_info = serializers.SerializerMethodField(read_only=True)
    time_variant_summary = serializers.SerializerMethodField(read_only=True)
    technical_config = serializers.SerializerMethodField(read_only=True)
    price_formatted = serializers.SerializerMethodField(read_only=True)
    
    # User info
    created_by_info = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = InternetPlan
        fields = [
            'id', 'plan_type', 'name', 'price', 'price_formatted', 'active', 'category', 'description',
            'access_methods', 'priority_level', 'router_specific', 
            'fup_policy', 'fup_threshold', 'time_variant',
            'allowed_routers', 'purchases', 'client_sessions',
            'created_at', 'updated_at', 'created_by', 'created_by_info',
            'enabled_access_methods', 'access_type', 'is_available_now',
            'availability_info', 'time_variant_summary', 'technical_config',
            'template'
        ]
        read_only_fields = fields
    
    def get_enabled_access_methods(self, obj):
        return obj.get_enabled_access_methods()
    
    def get_access_type(self, obj):
        return obj.get_access_type()
    
    def get_is_available_now(self, obj):
        availability = obj.is_available_for_client()
        return availability.get('available', False)
    
    def get_availability_info(self, obj):
        return obj.is_available_for_client()
    
    def get_time_variant_summary(self, obj):
        return obj.get_time_variant_summary()
    
    def get_technical_config(self, obj):
        configs = {}
        for method in obj.get_enabled_access_methods():
            configs[method] = obj.get_technical_config(method)
        return configs
    
    def get_allowed_routers(self, obj):
        try:
            from network_management.serializers.router_management_serializer import RouterSerializer
            return RouterSerializer(obj.allowed_routers.all(), many=True).data
        except ImportError:
            return []
    
    def get_created_by_info(self, obj):
        if obj.created_by:
            return {
                'id': obj.created_by.id,
                'email': obj.created_by.email,
                'username': getattr(obj.created_by, 'username', None)
            }
        return None
    
    def get_price_formatted(self, obj):
        return f"KSH {float(obj.price):,.2f}"
    
    def to_representation(self, instance):
        """Ensure access methods are properly structured"""
        data = super().to_representation(instance)
        
        # Create a temporary serializer to leverage the structure fixing logic
        temp_serializer = InternetPlanSerializer()
        if 'access_methods' in data:
            data['access_methods'] = temp_serializer._ensure_access_methods_structure(data['access_methods'])
        
        return data


class PlanCompatibilitySerializer(serializers.Serializer):
    """
    Serializer for checking plan compatibility
    """
    
    plan_id = serializers.UUIDField(required=True)
    access_method = serializers.ChoiceField(
        choices=[('hotspot', 'Hotspot'), ('pppoe', 'PPPoE')],
        required=True
    )
    router_id = serializers.IntegerField(required=False, allow_null=True)
    check_time_availability = serializers.BooleanField(default=True)
    
    def validate(self, data):
        """Validate compatibility check"""
        plan_id = data['plan_id']
        
        try:
            plan = InternetPlan.objects.get(id=plan_id, active=True)
        except InternetPlan.DoesNotExist:
            raise serializers.ValidationError({
                'plan_id': 'Plan not found or inactive'
            })
        
        # Check access method support
        access_method = data['access_method']
        if not plan.supports_access_method(access_method):
            raise serializers.ValidationError({
                'access_method': f'Plan does not support {access_method} access method'
            })
        
        # Check router compatibility
        router_id = data.get('router_id')
        if plan.router_specific and router_id:
            if not plan.can_be_used_on_router(router_id):
                raise serializers.ValidationError({
                    'router_id': 'Plan cannot be used on specified router'
                })
        
        # Check time availability
        if data.get('check_time_availability', True):
            availability = plan.is_available_for_client()
            if not availability['available']:
                raise serializers.ValidationError({
                    'availability': availability['reason'],
                    'code': availability['code'],
                    'next_available': availability.get('next_available')
                })
        
        self.context['plan'] = plan
        return data
    
    def get_compatibility_result(self):
        """Get compatibility result"""
        plan = self.context.get('plan')
        if not plan:
            return None
        
        return {
            'compatible': True,
            'plan_id': str(plan.id),
            'plan_name': plan.name,
            'access_method': self.validated_data['access_method'],
            'router_specific': plan.router_specific,
            'technical_config': plan.get_technical_config(self.validated_data['access_method']),
            'availability': plan.is_available_for_client()
        }


class PlanAvailabilityCheckSerializer(serializers.Serializer):
    """
    Serializer for checking plan availability
    """
    
    plan_id = serializers.UUIDField(required=True)
    check_time_variant = serializers.BooleanField(default=True)
    
    def validate(self, data):
        """Validate availability check"""
        plan_id = data['plan_id']
        
        try:
            plan = InternetPlan.objects.get(id=plan_id, active=True)
        except InternetPlan.DoesNotExist:
            raise serializers.ValidationError({
                'plan_id': 'Plan not found or inactive'
            })
        
        self.context['plan'] = plan
        return data


class AvailablePlansRequestSerializer(serializers.Serializer):
    """
    Serializer for requesting available plans
    """
    
    client_type = serializers.ChoiceField(
        choices=[('hotspot', 'Hotspot'), ('pppoe', 'PPPoE')],
        default='hotspot',
        required=False
    )
    
    router_id = serializers.IntegerField(
        required=False,
        allow_null=True
    )
    
    category = serializers.CharField(
        required=False,
        allow_null=True
    )
    
    max_price = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        required=False,
        allow_null=True
    )
    
    include_unavailable = serializers.BooleanField(
        default=False
    )
    
    def get_available_plans(self):
        """Get available plans based on filters"""
        client_type = self.validated_data['client_type']
        router_id = self.validated_data.get('router_id')
        category = self.validated_data.get('category')
        max_price = self.validated_data.get('max_price')
        include_unavailable = self.validated_data.get('include_unavailable', False)
        
        if include_unavailable:
            queryset = InternetPlan.objects.filter(active=True).select_related('time_variant')
            
            if category:
                queryset = queryset.filter(category=category)
            
            if max_price is not None:
                queryset = queryset.filter(price__lte=max_price)
            
            if client_type == 'hotspot':
                queryset = queryset.filter(access_methods__hotspot__enabled=True)
            elif client_type == 'pppoe':
                queryset = queryset.filter(access_methods__pppoe__enabled=True)
            
            if router_id:
                queryset = queryset.filter(
                    Q(router_specific=False) |
                    Q(router_specific=True, allowed_routers__id=router_id)
                ).distinct()
            
            plans = list(queryset.order_by('-priority_level', 'price'))
        else:
            plans = InternetPlan.get_available_plans_for_client(client_type, router_id)
            
            if category:
                plans = [p for p in plans if p.category == category]
            
            if max_price is not None:
                plans = [p for p in plans if p.price <= max_price]
        
        serializer = InternetPlanListSerializer(plans, many=True, context=self.context)
        
        return {
            'count': len(plans),
            'client_type': client_type,
            'filters_applied': {
                'router_id': router_id,
                'category': category,
                'max_price': float(max_price) if max_price else None,
                'include_unavailable': include_unavailable
            },
            'plans': serializer.data
        }