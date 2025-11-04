







# from rest_framework import serializers
# from internet_plans.models.create_plan_models import InternetPlan, Subscription, PlanTemplate
# from network_management.models.router_management_model import Router


# class RouterSerializer(serializers.ModelSerializer):
#     """
#     Serializer for Router model, used in nested representations.
#     """

#     class Meta:
#         model = Router
#         fields = ['id', 'name', 'ip', 'location', 'status']


# class PlanTemplateSerializer(serializers.ModelSerializer):
#     """
#     Enhanced Serializer for PlanTemplate model with proper usage count handling.
#     """
#     basePrice = serializers.DecimalField(
#         source='base_price', 
#         max_digits=10, 
#         decimal_places=2
#     )
#     accessMethods = serializers.JSONField(source='access_methods')
#     isPublic = serializers.BooleanField(source='is_public')
#     isActive = serializers.BooleanField(source='is_active')
#     usageCount = serializers.IntegerField(source='usage_count', read_only=True)
#     createdBy = serializers.CharField(source='created_by.username', read_only=True)
#     createdAt = serializers.DateTimeField(source='created_at', read_only=True)
#     updatedAt = serializers.DateTimeField(source='updated_at', read_only=True)
#     hasEnabledAccessMethods = serializers.BooleanField(read_only=True)
#     enabledAccessMethods = serializers.ListField(read_only=True)
#     accessType = serializers.CharField(read_only=True)
    
#     # Add this field to include created plans count
#     createdPlansCount = serializers.SerializerMethodField()

#     class Meta:
#         model = PlanTemplate
#         fields = [
#             'id', 'name', 'description', 'category', 'basePrice',
#             'accessMethods', 'isPublic', 'isActive', 'usageCount',
#             'createdBy', 'createdAt', 'updatedAt', 'hasEnabledAccessMethods',
#             'enabledAccessMethods', 'accessType', 'createdPlansCount'
#         ]

#     def get_createdPlansCount(self, obj):
#         """Return count of plans created from this template."""
#         return obj.created_plans.count()

#     def to_representation(self, instance):
#         data = super().to_representation(instance)
        
#         # Ensure usage_count is properly mapped to usageCount
#         if 'usage_count' in data:
#             data['usageCount'] = data['usage_count']
        
#         # If usageCount is 0 but there are created plans, update it
#         if data.get('usageCount', 0) == 0 and instance.created_plans.exists():
#             data['usageCount'] = instance.created_plans.count()
        
#         data['accessMethods'] = instance.access_methods
#         data['hasEnabledAccessMethods'] = instance.has_enabled_access_methods()
#         data['enabledAccessMethods'] = instance.get_enabled_access_methods()
#         data['accessType'] = instance.get_access_type()
        
#         return data

#     def validate(self, data):
#         """Enhanced validation for template data"""
#         access_methods = data.get('access_methods', {})
#         if not isinstance(access_methods, dict):
#             raise serializers.ValidationError({'accessMethods': 'Access methods must be a dictionary'})
        
#         # Validate structure for both access methods
#         for method in ['hotspot', 'pppoe']:
#             if method not in access_methods:
#                 raise serializers.ValidationError({'accessMethods': f'Missing {method} configuration'})
            
#             config = access_methods[method]
#             if not isinstance(config, dict):
#                 raise serializers.ValidationError({'accessMethods': f'{method} configuration must be a dictionary'})
            
#             # Validate required fields for enabled methods
#             if config.get('enabled', False):
#                 required_fields = ['downloadSpeed', 'uploadSpeed', 'dataLimit', 'usageLimit']
#                 for field in required_fields:
#                     if field not in config:
#                         raise serializers.ValidationError({'accessMethods': f'Missing {field} for enabled {method}'})
                    
#                     field_config = config[field]
#                     if not isinstance(field_config, dict):
#                         raise serializers.ValidationError({'accessMethods': f'{method}.{field} must be a dictionary'})
                    
#                     if 'value' not in field_config:
#                         raise serializers.ValidationError({'accessMethods': f'{method}.{field}.value is required'})

#         # Ensure at least one access method is enabled
#         enabled_methods = [
#             method for method, config in access_methods.items() 
#             if config.get('enabled', False)
#         ]
#         if not enabled_methods:
#             raise serializers.ValidationError({
#                 'accessMethods': 'At least one access method must be enabled'
#             })
            
#         return data

#     def create(self, validated_data):
#         """Create template with current user as creator"""
#         request = self.context.get('request')
#         if request and hasattr(request, 'user'):
#             validated_data['created_by'] = request.user
        
#         # Ensure access methods have proper structure
#         if 'access_methods' not in validated_data or not validated_data['access_methods']:
#             template = PlanTemplate()
#             template.set_default_access_methods()
#             validated_data['access_methods'] = template.access_methods
        
#         return super().create(validated_data)


# class InternetPlanSerializer(serializers.ModelSerializer):
#     """
#     Enhanced Serializer for InternetPlan with complete dual access method support.
#     """
#     planType = serializers.CharField(source='plan_type')
#     accessMethods = serializers.JSONField(source='access_methods')
#     allowed_routers = RouterSerializer(many=True, read_only=True)
#     allowed_routers_ids = serializers.ListField(
#         child=serializers.IntegerField(),
#         write_only=True,
#         required=False
#     )
#     template = PlanTemplateSerializer(read_only=True)
#     template_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
#     has_enabled_access_methods = serializers.BooleanField(read_only=True)
#     enabled_access_methods = serializers.ListField(read_only=True)
#     accessType = serializers.CharField(read_only=True)

#     class Meta:
#         model = InternetPlan
#         fields = [
#             'id', 'planType', 'name', 'price', 'active', 'category',
#             'description', 'purchases', 'client_sessions', 'created_at', 
#             'accessMethods', 'priority_level', 'router_specific', 
#             'allowed_routers', 'allowed_routers_ids', 'FUP_policy', 
#             'FUP_threshold', 'has_enabled_access_methods', 
#             'enabled_access_methods', 'template', 'template_id', 'accessType'
#         ]

#     def validate(self, data):
#         """Enhanced validation for plan data"""
#         # Free trial validation
#         if data.get('plan_type') == 'Free Trial':
#             if data.get('price', 0) != 0:
#                 raise serializers.ValidationError({'price': 'Free Trial plans must have price set to 0'})
#             if data.get('router_specific', False):
#                 raise serializers.ValidationError({'router_specific': 'Free Trial plans cannot be router-specific'})
#             if data.get('priority_level', 4) > 4:
#                 raise serializers.ValidationError({'priority_level': 'Free Trial plans cannot have premium priority levels'})
        
#         # Validate access methods structure
#         access_methods = data.get('access_methods', {})
#         if not isinstance(access_methods, dict):
#             raise serializers.ValidationError({'accessMethods': 'Access methods must be a dictionary'})
        
#         # Validate structure for both access methods
#         for method in ['hotspot', 'pppoe']:
#             if method not in access_methods:
#                 raise serializers.ValidationError({'accessMethods': f'Missing {method} configuration'})
            
#             config = access_methods[method]
#             if not isinstance(config, dict):
#                 raise serializers.ValidationError({'accessMethods': f'{method} configuration must be a dictionary'})
            
#             # Validate required fields for enabled methods
#             if config.get('enabled', False):
#                 required_fields = ['downloadSpeed', 'uploadSpeed', 'dataLimit', 'usageLimit']
#                 for field in required_fields:
#                     if field not in config:
#                         raise serializers.ValidationError({'accessMethods': f'Missing {field} for enabled {method}'})
                    
#                     field_config = config[field]
#                     if not isinstance(field_config, dict):
#                         raise serializers.ValidationError({'accessMethods': f'{method}.{field} must be a dictionary'})
                    
#                     if 'value' not in field_config:
#                         raise serializers.ValidationError({'accessMethods': f'{method}.{field}.value is required'})

#         # Ensure at least one access method is enabled
#         enabled_methods = [
#             method for method, config in access_methods.items() 
#             if config.get('enabled', False)
#         ]
#         if not enabled_methods:
#             raise serializers.ValidationError({
#                 'accessMethods': 'At least one access method must be enabled'
#             })
            
#         return data

#     def to_representation(self, instance):
#         data = super().to_representation(instance)
#         data['planType'] = instance.plan_type
#         data['accessMethods'] = instance.access_methods
#         data['has_enabled_access_methods'] = instance.has_enabled_access_methods()
#         data['enabled_access_methods'] = instance.get_enabled_access_methods()
#         data['accessType'] = instance.get_access_type()
#         return data

#     def create(self, validated_data):
#         template_id = validated_data.pop('template_id', None)
#         allowed_routers_ids = validated_data.pop('allowed_routers_ids', [])
        
#         # Ensure access methods have proper structure
#         if 'access_methods' not in validated_data or not validated_data['access_methods']:
#             plan = InternetPlan()
#             plan.set_default_access_methods()
#             validated_data['access_methods'] = plan.access_methods
        
#         # Handle template creation
#         if template_id:
#             try:
#                 template = PlanTemplate.objects.get(id=template_id, is_active=True)
#                 plan = InternetPlan.objects.create(
#                     template=template,
#                     **validated_data
#                 )
#                 template.increment_usage()
#             except PlanTemplate.DoesNotExist:
#                 plan = InternetPlan.objects.create(**validated_data)
#         else:
#             plan = InternetPlan.objects.create(**validated_data)
        
#         if allowed_routers_ids:
#             plan.allowed_routers.set(allowed_routers_ids)
        
#         return plan

#     def update(self, instance, validated_data):
#         allowed_routers_ids = validated_data.pop('allowed_routers_ids', None)
#         template_id = validated_data.pop('template_id', None)
        
#         for attr, value in validated_data.items():
#             setattr(instance, attr, value)
        
#         instance.save()
        
#         if allowed_routers_ids is not None:
#             instance.allowed_routers.set(allowed_routers_ids)
        
#         return instance


# class SubscriptionSerializer(serializers.ModelSerializer):
#     """
#     Enhanced Serializer for Subscription with access method support.
#     """

#     client = serializers.SerializerMethodField()
#     internet_plan = InternetPlanSerializer(read_only=True)
#     transaction = serializers.SerializerMethodField()
#     router = RouterSerializer(read_only=True)
#     remaining_data_display = serializers.CharField(read_only=True)
#     remaining_time_display = serializers.CharField(read_only=True)

#     class Meta:
#         model = Subscription
#         fields = '__all__'

#     def get_client(self, obj):
#         if obj.client and obj.client.user:
#             return {
#                 'id': obj.client.id,
#                 'name': obj.client.user.name,
#                 'username': obj.client.user.username,
#                 'phonenumber': str(obj.client.user.phonenumber) if obj.client.user.phonenumber else None
#             }
#         return {'id': None, 'name': 'Unknown', 'username': 'unknown', 'phonenumber': None}

#     def get_transaction(self, obj):
#         if obj.transaction:
#             return {
#                 'id': obj.transaction.id,
#                 'reference': obj.transaction.reference,
#                 'status': obj.transaction.status,
#                 'amount': obj.transaction.amount
#             }
#         return None












# internet_plans/serializers/create_plan_serializers.py

from rest_framework import serializers
from internet_plans.models.create_plan_models import InternetPlan, Subscription, PlanTemplate
from network_management.models.router_management_model import Router
from django.db import transaction


class RouterSerializer(serializers.ModelSerializer):
    """
    Serializer for Router model, used in nested representations.
    """
    class Meta:
        model = Router
        fields = ['id', 'name', 'ip', 'location', 'status']


class PlanTemplateSerializer(serializers.ModelSerializer):
    """
    Enhanced Serializer for PlanTemplate model with proper usage count handling.
    """
    basePrice = serializers.DecimalField(source='base_price', max_digits=10, decimal_places=2)
    accessMethods = serializers.JSONField(source='access_methods')
    isPublic = serializers.BooleanField(source='is_public')
    isActive = serializers.BooleanField(source='is_active')
    usageCount = serializers.IntegerField(source='usage_count', read_only=True)
    createdBy = serializers.CharField(source='created_by.username', read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    updatedAt = serializers.DateTimeField(source='updated_at', read_only=True)
    hasEnabledAccessMethods = serializers.BooleanField(read_only=True)
    enabledAccessMethods = serializers.ListField(read_only=True)
    accessType = serializers.CharField(read_only=True)
    createdPlansCount = serializers.SerializerMethodField()

    class Meta:
        model = PlanTemplate
        fields = [
            'id', 'name', 'description', 'category', 'basePrice',
            'accessMethods', 'isPublic', 'isActive', 'usageCount',
            'createdBy', 'createdAt', 'updatedAt', 'hasEnabledAccessMethods',
            'enabledAccessMethods', 'accessType', 'createdPlansCount'
        ]

    def get_createdPlansCount(self, obj):
        """Return count of plans created from this template."""
        return obj.created_plans.count()

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['accessMethods'] = instance.access_methods
        data['hasEnabledAccessMethods'] = instance.has_enabled_access_methods()
        data['enabledAccessMethods'] = instance.get_enabled_access_methods()
        data['accessType'] = instance.get_access_type()
        return data

    def validate(self, data):
        """Enhanced validation for template data"""
        access_methods = data.get('access_methods', {})
        if not isinstance(access_methods, dict):
            raise serializers.ValidationError({'accessMethods': 'Access methods must be a dictionary'})

        for method in ['hotspot', 'pppoe']:
            if method not in access_methods:
                raise serializers.ValidationError({'accessMethods': f'Missing {method} configuration'})
            config = access_methods[method]
            if not isinstance(config, dict):
                raise serializers.ValidationError({'accessMethods': f'{method} configuration must be a dictionary'})
            if config.get('enabled', False):
                required_fields = ['downloadSpeed', 'uploadSpeed', 'dataLimit', 'usageLimit']
                for field in required_fields:
                    if field not in config:
                        raise serializers.ValidationError({'accessMethods': f'Missing {field} for enabled {method}'})
                    field_config = config[field]
                    if not isinstance(field_config, dict):
                        raise serializers.ValidationError({'accessMethods': f'{method}.{field} must be a dictionary'})
                    if 'value' not in field_config:
                        raise serializers.ValidationError({'accessMethods': f'{method}.{field}.value is required'})

        enabled_methods = [method for method, config in access_methods.items() if config.get('enabled', False)]
        if not enabled_methods:
            raise serializers.ValidationError({'accessMethods': 'At least one access method must be enabled'})
        return data

    def create(self, validated_data):
        """Create template with current user as creator"""
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['created_by'] = request.user
        if 'access_methods' not in validated_data or not validated_data['access_methods']:
            template = PlanTemplate()
            template.set_default_access_methods()
            validated_data['access_methods'] = template.access_methods
        return super().create(validated_data)


class InternetPlanSerializer(serializers.ModelSerializer):
    """
    Enhanced Serializer for InternetPlan with complete dual access method support.
    """
    planType = serializers.CharField(source='plan_type')
    accessMethods = serializers.JSONField(source='access_methods')
    allowed_routers = RouterSerializer(many=True, read_only=True)
    allowed_routers_ids = serializers.ListField(child=serializers.IntegerField(), write_only=True, required=False)
    template = PlanTemplateSerializer(read_only=True)
    template_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    has_enabled_access_methods = serializers.BooleanField(read_only=True)
    enabled_access_methods = serializers.ListField(read_only=True)
    accessType = serializers.CharField(read_only=True)

    class Meta:
        model = InternetPlan
        fields = [
            'id', 'planType', 'name', 'price', 'active', 'category',
            'description', 'purchases', 'client_sessions', 'created_at',
            'accessMethods', 'priority_level', 'router_specific',
            'allowed_routers', 'allowed_routers_ids', 'FUP_policy',
            'FUP_threshold', 'has_enabled_access_methods',
            'enabled_access_methods', 'template', 'template_id', 'accessType'
        ]

    def validate(self, data):
        """Enhanced validation for plan data"""
        if data.get('plan_type') == 'Free Trial':
            if data.get('price', 0) != 0:
                raise serializers.ValidationError({'price': 'Free Trial plans must have price set to 0'})
            if data.get('router_specific', False):
                raise serializers.ValidationError({'router_specific': 'Free Trial plans cannot be router-specific'})
            if data.get('priority_level', 4) > 4:
                raise serializers.ValidationError({'priority_level': 'Free Trial plans cannot have premium priority levels'})

        access_methods = data.get('access_methods', {})
        if not isinstance(access_methods, dict):
            raise serializers.ValidationError({'accessMethods': 'Access methods must be a dictionary'})

        for method in ['hotspot', 'pppoe']:
            if method not in access_methods:
                raise serializers.ValidationError({'accessMethods': f'Missing {method} configuration'})
            config = access_methods[method]
            if not isinstance(config, dict):
                raise serializers.ValidationError({'accessMethods': f'{method} configuration must be a dictionary'})
            if config.get('enabled', False):
                required_fields = ['downloadSpeed', 'uploadSpeed', 'dataLimit', 'usageLimit']
                for field in required_fields:
                    if field not in config:
                        raise serializers.ValidationError({'accessMethods': f'Missing {field} for enabled {method}'})
                    field_config = config[field]
                    if not isinstance(field_config, dict):
                        raise serializers.ValidationError({'accessMethods': f'{method}.{field} must be a dictionary'})
                    if 'value' not in field_config:
                        raise serializers.ValidationError({'accessMethods': f'{method}.{field}.value is required'})

        enabled_methods = [m for m, c in access_methods.items() if c.get('enabled', False)]
        if not enabled_methods:
            raise serializers.ValidationError({'accessMethods': 'At least one access method must be enabled'})
        return data

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['planType'] = instance.plan_type
        data['accessMethods'] = instance.access_methods
        data['has_enabled_access_methods'] = instance.has_enabled_access_methods()
        data['enabled_access_methods'] = instance.get_enabled_access_methods()
        data['accessType'] = instance.get_access_type()
        return data

    def create(self, validated_data):
        template_id = validated_data.pop('template_id', None)
        allowed_routers_ids = validated_data.pop('allowed_routers_ids', [])

        if not validated_data.get('access_methods'):
            plan = InternetPlan()
            plan.set_default_access_methods()
            validated_data['access_methods'] = plan.access_methods

        with transaction.atomic():
            plan = InternetPlan.objects.create(**validated_data)

            if template_id:
                try:
                    template = PlanTemplate.objects.select_for_update().get(id=template_id, is_active=True)
                    plan.template = template
                    plan.save(update_fields=['template'])
                except PlanTemplate.DoesNotExist:
                    pass  # Template deleted; continue without linking

            if allowed_routers_ids:
                plan.allowed_routers.set(allowed_routers_ids)

        return plan

    def update(self, instance, validated_data):
        allowed_routers_ids = validated_data.pop('allowed_routers_ids', None)
        template_id = validated_data.pop('template_id', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if allowed_routers_ids is not None:
            instance.allowed_routers.set(allowed_routers_ids)

        return instance


class SubscriptionSerializer(serializers.ModelSerializer):
    """
    Enhanced Serializer for Subscription with access method support.
    """
    client = serializers.SerializerMethodField()
    internet_plan = InternetPlanSerializer(read_only=True)
    transaction = serializers.SerializerMethodField()
    router = RouterSerializer(read_only=True)
    remaining_data_display = serializers.CharField(read_only=True)
    remaining_time_display = serializers.CharField(read_only=True)

    class Meta:
        model = Subscription
        fields = [
            'id', 'client', 'internet_plan', 'router', 'transaction',
            'access_method', 'status', 'mac_address', 'start_date', 'end_date',
            'remaining_data', 'remaining_time', 'data_used', 'time_used',
            'last_activity', 'is_active', 'remaining_data_display', 'remaining_time_display'
        ]

    def get_client(self, obj):
        if obj.client and obj.client.user:
            return {
                'id': obj.client.id,
                'name': obj.client.user.get_full_name() or obj.client.user.username,
                'username': obj.client.user.username,
                'phonenumber': str(obj.client.user.phonenumber) if obj.client.user.phonenumber else None
            }
        return {'id': None, 'name': 'Unknown', 'username': 'unknown', 'phonenumber': None}

    def get_transaction(self, obj):
        if obj.transaction:
            return {
                'id': obj.transaction.id,
                'reference': obj.transaction.reference,
                'status': obj.transaction.status,
                'amount': obj.transaction.amount
            }
        return None

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Add calculated fields
        data['remaining_data_display'] = instance.get_remaining_data_display()
        data['remaining_time_display'] = instance.get_remaining_time_display()
        return data