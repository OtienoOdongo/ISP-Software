"""
Internet Plans - Plan Serializers with Time Variant Support
Maintains original serialization logic with time variant features
Production-ready with comprehensive validation
"""

from rest_framework import serializers
from django.core.exceptions import ValidationError
from django.db import transaction
from django.db import models
from django.db.models import Q
from django.utils import timezone
from decimal import Decimal
import logging
from django.core.cache import cache

from internet_plans.models.plan_models import InternetPlan, PlanTemplate, TimeVariantConfig
from internet_plans.utils.validators import validate_access_methods

logger = logging.getLogger(__name__)


class TimeVariantConfigSerializer(serializers.ModelSerializer):
    """
    Serializer for Time Variant Configuration
    """
    
    # Field mappings for API
    isActive = serializers.BooleanField(
        source='is_active',
        default=False,
        help_text="Enable time variant controls"
    )
    
    startTime = serializers.TimeField(
        source='start_time',
        required=False,
        allow_null=True,
        format='%H:%M',
        input_formats=['%H:%M', '%H:%M:%S', '%I:%M %p'],
        help_text="Start time (24-hour format, e.g., '09:00')"
    )
    
    endTime = serializers.TimeField(
        source='end_time',
        required=False,
        allow_null=True,
        format='%H:%M',
        input_formats=['%H:%M', '%H:%M:%S', '%I:%M %p'],
        help_text="End time (24-hour format, e.g., '17:00')"
    )
    
    availableDays = serializers.ListField(
        source='available_days',
        child=serializers.ChoiceField(choices=[day[0] for day in TimeVariantConfig.DAYS_OF_WEEK]),
        required=False,
        allow_empty=True,
        help_text="Days of week when plan is available (e.g., ['mon', 'wed', 'fri'])"
    )
    
    scheduleActive = serializers.BooleanField(
        source='schedule_active',
        default=False,
        help_text="Enable scheduled availability"
    )
    
    scheduleStartDate = serializers.DateTimeField(
        source='schedule_start_date',
        required=False,
        allow_null=True,
        help_text="Start date for scheduled availability"
    )
    
    scheduleEndDate = serializers.DateTimeField(
        source='schedule_end_date',
        required=False,
        allow_null=True,
        help_text="End date for scheduled availability"
    )
    
    durationActive = serializers.BooleanField(
        source='duration_active',
        default=False,
        help_text="Enable duration-based availability"
    )
    
    durationValue = serializers.IntegerField(
        source='duration_value',
        required=False,
        min_value=1,
        help_text="Duration value (e.g., 7 for 7 days)"
    )
    
    durationUnit = serializers.ChoiceField(
        source='duration_unit',
        choices=[unit[0] for unit in TimeVariantConfig.TIME_UNITS],
        default='days',
        help_text="Duration unit"
    )
    
    durationStartDate = serializers.DateTimeField(
        source='duration_start_date',
        required=False,
        allow_null=True,
        help_text="Start date for duration-based availability"
    )
    
    exclusionDates = serializers.ListField(
        source='exclusion_dates',
        child=serializers.DateField(),
        required=False,
        allow_empty=True,
        help_text="Dates when plan is NOT available (YYYY-MM-DD format)"
    )
    
    forceAvailable = serializers.BooleanField(
        source='force_available',
        default=False,
        help_text="Override all time restrictions"
    )
    
    # Read-only fields
    isAvailableNow = serializers.SerializerMethodField(
        read_only=True,
        help_text="Whether plan is available for purchase right now"
    )
    
    availabilitySummary = serializers.SerializerMethodField(
        read_only=True,
        help_text="Human-readable availability summary"
    )
    
    nextAvailableTime = serializers.SerializerMethodField(
        read_only=True,
        help_text="Next available time if currently unavailable"
    )
    
    class Meta:
        model = TimeVariantConfig
        fields = [
            'id', 'isActive', 'startTime', 'endTime', 'availableDays',
            'scheduleActive', 'scheduleStartDate', 'scheduleEndDate',
            'durationActive', 'durationValue', 'durationUnit', 'durationStartDate',
            'exclusionDates', 'timezone', 'forceAvailable',
            'isAvailableNow', 'availabilitySummary', 'nextAvailableTime',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'isAvailableNow', 
                          'availabilitySummary', 'nextAvailableTime']
    
    def get_isAvailableNow(self, obj):
        """Get current availability status"""
        return obj.is_available_now() if obj.is_active else True
    
    def get_availabilitySummary(self, obj):
        """Get availability summary"""
        return obj.get_availability_summary() if obj.is_active else {
            'status': 'always_available',
            'message': 'Available at all times'
        }
    
    def get_nextAvailableTime(self, obj):
        """Get next available time"""
        if not obj.is_active or obj.is_available_now():
            return None
        return obj.get_next_available_time()
    
    def validate(self, data):
        """Validate time variant configuration"""
        # If not active, no further validation needed
        if not data.get('is_active', False):
            return data
        
        errors = {}
        
        # Validate time range
        start_time = data.get('start_time')
        end_time = data.get('end_time')
        
        if start_time and end_time:
            if start_time >= end_time:
                errors['endTime'] = 'End time must be after start time'
        
        # Validate available days
        available_days = data.get('available_days')
        if available_days:
            if not isinstance(available_days, list):
                errors['availableDays'] = 'Available days must be a list'
            else:
                valid_days = [day[0] for day in TimeVariantConfig.DAYS_OF_WEEK]
                for day in available_days:
                    if day not in valid_days:
                        errors['availableDays'] = f'Invalid day: {day}. Must be one of {valid_days}'
        
        # Validate schedule dates
        if data.get('schedule_active', False):
            schedule_start = data.get('schedule_start_date')
            schedule_end = data.get('schedule_end_date')
            
            if not schedule_start:
                errors['scheduleStartDate'] = 'Schedule start date is required when schedule is active'
            if not schedule_end:
                errors['scheduleEndDate'] = 'Schedule end date is required when schedule is active'
            elif schedule_start and schedule_end:
                if schedule_start >= schedule_end:
                    errors['scheduleEndDate'] = 'Schedule end date must be after start date'
        
        # Validate duration
        if data.get('duration_active', False):
            duration_value = data.get('duration_value')
            duration_start = data.get('duration_start_date')
            
            if not duration_value or duration_value <= 0:
                errors['durationValue'] = 'Duration value must be greater than 0'
            if not duration_start:
                errors['durationStartDate'] = 'Duration start date is required when duration is active'
        
        # Validate exclusion dates
        exclusion_dates = data.get('exclusion_dates')
        if exclusion_dates:
            if not isinstance(exclusion_dates, list):
                errors['exclusionDates'] = 'Exclusion dates must be a list'
            else:
                # Validate date format
                for i, date_str in enumerate(exclusion_dates):
                    if not isinstance(date_str, str):
                        try:
                            # Try to serialize date object
                            exclusion_dates[i] = date_str.isoformat()
                        except AttributeError:
                            errors['exclusionDates'] = f'Invalid date at index {i}'
        
        if errors:
            raise serializers.ValidationError(errors)
        
        return data
    
    def create(self, validated_data):
        """Create time variant configuration"""
        return TimeVariantConfig.objects.create(**validated_data)
    
    def update(self, instance, validated_data):
        """Update time variant configuration"""
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance


class InternetPlanSerializer(serializers.ModelSerializer):
    """
    Serializer for Internet Plans with Time Variant Support
    """
    
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
    
    template = serializers.PrimaryKeyRelatedField(
        queryset=PlanTemplate.objects.filter(is_active=True),
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
    
    effectivePrice = serializers.SerializerMethodField(
        read_only=True
    )
    
    # Time variant fields
    timeVariant = TimeVariantConfigSerializer(
        required=False,
        allow_null=True,
        help_text="Time variant configuration"
    )
    
    timeVariantId = serializers.UUIDField(
        write_only=True,
        required=False,
        allow_null=True,
        help_text="Existing time variant configuration ID"
    )
    
    # Availability fields (read-only)
    isAvailableNow = serializers.SerializerMethodField(
        read_only=True,
        help_text="Whether plan is available for purchase right now"
    )
    
    availabilityInfo = serializers.SerializerMethodField(
        read_only=True,
        help_text="Detailed availability information"
    )
    
    timeVariantSummary = serializers.SerializerMethodField(
        read_only=True,
        help_text="Time variant configuration summary"
    )
    
    class Meta:
        model = InternetPlan
        fields = [
            'id', 'planType', 'name', 'price', 'effectivePrice', 'active', 'category',
            'description', 'purchases', 'client_sessions', 'createdAt', 'updatedAt',
            'accessMethods', 'priority_level', 'router_specific',
            'allowedRouters', 'allowedRoutersIds', 'FUP_policy',
            'FUP_threshold', 'hasEnabledAccessMethods',
            'enabledAccessMethods', 'template', 'accessType',
            'routerCompatibility', 'timeVariant', 'timeVariantId',
            'isAvailableNow', 'availabilityInfo', 'timeVariantSummary'
        ]
        read_only_fields = ['createdAt', 'updatedAt', 'purchases', 'client_sessions',
                          'isAvailableNow', 'availabilityInfo', 'timeVariantSummary']
    
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
    
    def get_effectivePrice(self, obj):
        """Calculate effective price with discounts"""
        from internet_plans.services.pricing_service import PricingService
        return PricingService.calculate_effective_price(obj)
    
    def get_isAvailableNow(self, obj):
        """Get current availability status"""
        return obj.is_available_for_client()['available']
    
    def get_availabilityInfo(self, obj):
        """Get detailed availability information"""
        return obj.is_available_for_client()
    
    def get_timeVariantSummary(self, obj):
        """Get time variant summary"""
        return obj.get_time_variant_summary()
    
    def validate(self, data):
        """Validate plan data - SIMPLIFIED (no client type restriction validation)"""
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
        allowed_routers_ids = validated_data.pop('allowed_routers_ids', [])
        template = validated_data.pop('template', None)
        time_variant_id = validated_data.pop('time_variant_id', None)
        time_variant_data = validated_data.pop('time_variant', None)
        
        # Handle time variant
        time_variant = None
        if time_variant_id:
            # Use existing time variant
            try:
                time_variant = TimeVariantConfig.objects.get(id=time_variant_id)
            except TimeVariantConfig.DoesNotExist:
                raise serializers.ValidationError({
                    'timeVariantId': 'Time variant configuration not found'
                })
        elif time_variant_data:
            # Create new time variant
            time_variant_serializer = TimeVariantConfigSerializer(data=time_variant_data)
            if time_variant_serializer.is_valid():
                time_variant = time_variant_serializer.save()
            else:
                raise serializers.ValidationError({
                    'timeVariant': time_variant_serializer.errors
                })
        
        # Set default access methods if not provided
        if 'access_methods' not in validated_data or not validated_data['access_methods']:
            plan = InternetPlan()
            plan.set_default_access_methods()
            validated_data['access_methods'] = plan.access_methods
        
        with transaction.atomic():
            # Create plan
            plan = InternetPlan.objects.create(**validated_data)
            
            # Set time variant
            if time_variant:
                plan.time_variant = time_variant
                plan.save(update_fields=['time_variant'])
            
            # Set template if provided
            if template:
                plan.template = template
                plan.save(update_fields=['template'])
            
            # Set allowed routers
            if allowed_routers_ids:
                plan.allowed_routers.set(allowed_routers_ids)
        
        # Clear cache
        cache.delete_pattern("internet_plans:*")
        cache.delete(f"internet_plan:{plan.id}")
        
        return plan
    
    def update(self, instance, validated_data):
        """Update plan with proper relationships"""
        allowed_routers_ids = validated_data.pop('allowed_routers_ids', None)
        template = validated_data.pop('template', None)
        time_variant_id = validated_data.pop('time_variant_id', None)
        time_variant_data = validated_data.pop('time_variant', None)
        
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
        elif time_variant_data is not None:
            if time_variant_data:
                # Update or create time variant
                if instance.time_variant:
                    time_variant_serializer = TimeVariantConfigSerializer(
                        instance.time_variant, 
                        data=time_variant_data, 
                        partial=True
                    )
                else:
                    time_variant_serializer = TimeVariantConfigSerializer(data=time_variant_data)
                
                if time_variant_serializer.is_valid():
                    time_variant = time_variant_serializer.save()
                    instance.time_variant = time_variant
                else:
                    raise serializers.ValidationError({
                        'timeVariant': time_variant_serializer.errors
                    })
            else:
                instance.time_variant = None
        
        with transaction.atomic():
            # Update instance
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            instance.save()
            
            # Update template if provided
            if template is not None:
                instance.template = template
                instance.save(update_fields=['template'])
            
            # Update allowed routers if provided
            if allowed_routers_ids is not None:
                instance.allowed_routers.set(allowed_routers_ids)
        
        # Clear cache
        cache.delete_pattern("internet_plans:*")
        cache.delete(f"internet_plan:{instance.id}")
        
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
        
        # Add technical configuration
        data['technicalConfig'] = {
            method: instance.get_technical_config(method)
            for method in instance.get_enabled_access_methods()
        }
        
        # Add time variant summary if exists
        if instance.time_variant:
            data['timeVariantSummary'] = instance.get_time_variant_summary()
        
        return data


class InternetPlanCreateSerializer(serializers.ModelSerializer):
    """
    Simplified serializer for plan creation
    """
    
    time_variant = TimeVariantConfigSerializer(required=False, allow_null=True)
    
    class Meta:
        model = InternetPlan
        fields = ['name', 'plan_type', 'price', 'category', 'description', 
                 'access_methods', 'priority_level', 'router_specific',
                 'template', 'FUP_policy', 'FUP_threshold',
                 'time_variant']


class InternetPlanUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for plan updates
    """
    
    time_variant = TimeVariantConfigSerializer(required=False, allow_null=True)
    
    class Meta:
        model = InternetPlan
        fields = ['name', 'price', 'category', 'description', 'active',
                 'access_methods', 'priority_level', 'router_specific',
                 'FUP_policy', 'FUP_threshold', 'time_variant']


class InternetPlanDetailSerializer(serializers.ModelSerializer):
    """
    Detailed serializer for plan view
    """
    
    template_details = serializers.SerializerMethodField()
    pricing_options = serializers.SerializerMethodField()
    compatibility = serializers.SerializerMethodField()
    availability = serializers.SerializerMethodField()
    time_variant_details = TimeVariantConfigSerializer(source='time_variant')
    
    class Meta:
        model = InternetPlan
        fields = '__all__'
    
    def get_template_details(self, obj):
        if obj.template:
            from internet_plans.serializers.template_serializers import PlanTemplateSerializer
            return PlanTemplateSerializer(obj.template).data
        return None
    
    def get_pricing_options(self, obj):
        from internet_plans.services.pricing_service import PricingService
        return PricingService.get_pricing_options(obj)
    
    def get_compatibility(self, obj):
        return {
            'supported_access_methods': obj.get_enabled_access_methods(),
            'router_specific': obj.router_specific,
            'allowed_routers': obj.allowed_routers.count() if obj.router_specific else 'All'
        }
    
    def get_availability(self, obj):
        return obj.is_available_for_client()


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
    
    class Meta:
        fields = ['plan_id', 'access_method', 'router_id', 'check_time_availability']
    
    def validate(self, data):
        plan_id = data['plan_id']
        
        # Get plan from cache or database
        plan = InternetPlan.get_cached_plan(plan_id)
        if not plan:
            raise serializers.ValidationError({
                'plan_id': 'Plan not found or inactive'
            })
        
        # Check access method support
        access_method = data['access_method']
        if not plan.supports_access_method(access_method):
            raise serializers.ValidationError({
                'access_method': f'Plan does not support {access_method} access method'
            })
        
        # Check router compatibility if router-specific
        router_id = data.get('router_id')
        if plan.router_specific and router_id:
            if not plan.can_be_used_on_router(router_id):
                raise serializers.ValidationError({
                    'router_id': 'Plan cannot be used on specified router'
                })
        
        # Check time availability if requested
        if data.get('check_time_availability', True):
            availability = plan.is_available_for_client()
            if not availability['available']:
                raise serializers.ValidationError({
                    'availability': availability['reason'],
                    'code': availability['code'],
                    'next_available': availability.get('next_available')
                })
        
        # Store validated data
        self.context['plan'] = plan
        
        return data
    
    def get_compatibility_result(self):
        """Get compatibility result"""
        plan = self.context.get('plan')
        if not plan:
            return None
        
        availability = plan.is_available_for_client(
            self.validated_data.get('check_time_availability', True)
        )
        
        return {
            'compatible': True,
            'plan_name': plan.name,
            'plan_type': plan.plan_type,
            'access_method_supported': True,
            'router_compatible': not plan.router_specific or self.validated_data.get('router_id') is not None,
            'availability': availability,
            'technical_config': plan.get_technical_config(self.validated_data['access_method'])
        }


class PlanAvailabilityCheckSerializer(serializers.Serializer):
    """
    Serializer specifically for checking plan availability
    """
    
    plan_id = serializers.UUIDField(required=True)
    timestamp = serializers.DateTimeField(
        required=False,
        help_text="Check availability at specific time (defaults to now)"
    )
    
    class Meta:
        fields = ['plan_id', 'timestamp']
    
    def validate(self, data):
        plan_id = data['plan_id']
        
        plan = InternetPlan.get_cached_plan(plan_id)
        if not plan:
            raise serializers.ValidationError({
                'plan_id': 'Plan not found or inactive'
            })
        
        self.context['plan'] = plan
        return data
    
    def get_availability_result(self):
        """Get detailed availability result"""
        plan = self.context['plan']
        
        # For specific timestamp checking, we need to temporarily adjust time
        timestamp = self.validated_data.get('timestamp')
        
        if timestamp:
            # This would require more complex logic to check future availability
            # For now, return current availability with note
            availability = plan.is_available_for_client()
            availability['note'] = 'Timestamp parameter not yet implemented for future checking'
        else:
            availability = plan.is_available_for_client()
        
        result = {
            'plan_id': str(plan.id),
            'plan_name': plan.name,
            'availability': availability,
            'has_time_variant': plan.has_time_variant(),
            'time_variant_summary': plan.get_time_variant_summary(),
            'timestamp': timezone.now().isoformat()
        }
        
        return result


class AvailablePlansRequestSerializer(serializers.Serializer):
    """
    Serializer for requesting available plans
    """
    
    client_type = serializers.ChoiceField(
        choices=[('hotspot', 'Hotspot'), ('pppoe', 'PPPoE')],
        default='hotspot',
        required=False,
        help_text="Type of client (hotspot or PPPoE)"
    )
    
    router_id = serializers.IntegerField(
        required=False,
        allow_null=True,
        help_text="Optional router ID for router-specific plans"
    )
    
    category = serializers.CharField(
        required=False,
        allow_null=True,
        help_text="Filter by plan category"
    )
    
    max_price = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        required=False,
        allow_null=True,
        help_text="Maximum price filter"
    )
    
    include_unavailable = serializers.BooleanField(
        default=False,
        help_text="Include plans that are currently unavailable (with reason)"
    )
    
    class Meta:
        fields = ['client_type', 'router_id', 'category', 'max_price', 'include_unavailable']
    
    def get_available_plans(self):
        """Get available plans based on filters"""
        client_type = self.validated_data['client_type']
        router_id = self.validated_data.get('router_id')
        category = self.validated_data.get('category')
        max_price = self.validated_data.get('max_price')
        include_unavailable = self.validated_data.get('include_unavailable', False)
        
        # Get all plans for this client type
        if include_unavailable:
            # Get all plans and check availability individually
            queryset = InternetPlan.objects.filter(active=True)
            
            # Apply filters
            if category:
                queryset = queryset.filter(category=category)
            
            if max_price is not None:
                queryset = queryset.filter(price__lte=max_price)
            
            # Filter by client type
            if client_type == 'hotspot':
                queryset = queryset.filter(access_methods__hotspot__enabled=True)
            elif client_type == 'pppoe':
                queryset = queryset.filter(access_methods__pppoe__enabled=True)
            
            # Filter by router
            if router_id:
                queryset = queryset.filter(
                    models.Q(router_specific=False) |
                    models.Q(router_specific=True, allowed_routers__id=router_id)
                ).distinct()
            
            plans = list(queryset.select_related('time_variant').order_by('-priority_level', 'price'))
            
            # Add availability info to each plan
            for plan in plans:
                plan.availability_info = plan.is_available_for_client()
            
        else:
            # Use optimized method for available plans only
            plans = InternetPlan.get_available_plans_for_client(client_type, router_id)
            
            # Apply additional filters
            if category:
                plans = [p for p in plans if p.category == category]
            
            if max_price is not None:
                plans = [p for p in plans if p.price <= max_price]
        
        # Serialize plans
        from internet_plans.serializers.plan_serializers import InternetPlanSerializer
        serializer = InternetPlanSerializer(plans, many=True, context=self.context)
        
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