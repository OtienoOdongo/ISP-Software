



# from rest_framework import serializers
# from internet_plans.models.create_plan_models import InternetPlan, Subscription, PlanTemplate
# from network_management.models.router_management_model import Router
# from network_management.serializers.router_management_serializer import RouterSerializer
# from django.db import transaction
# from decimal import Decimal
# import logging

# logger = logging.getLogger(__name__)

# class PlanTemplateSerializer(serializers.ModelSerializer):
#     basePrice = serializers.DecimalField(source='base_price', max_digits=10, decimal_places=2)
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
#         return obj.created_plans.count()

#     def to_representation(self, instance):
#         data = super().to_representation(instance)
#         data['accessMethods'] = instance.access_methods
#         data['hasEnabledAccessMethods'] = instance.has_enabled_access_methods()
#         data['enabledAccessMethods'] = instance.get_enabled_access_methods()
#         data['accessType'] = instance.get_access_type()
#         return data

#     def validate(self, data):
#         access_methods = data.get('access_methods', {})
#         if not isinstance(access_methods, dict):
#             raise serializers.ValidationError({'accessMethods': 'Access methods must be a dictionary'})

#         for method in ['hotspot', 'pppoe']:
#             if method not in access_methods:
#                 raise serializers.ValidationError({'accessMethods': f'Missing {method} configuration'})
#             config = access_methods[method]
#             if not isinstance(config, dict):
#                 raise serializers.ValidationError({'accessMethods': f'{method} configuration must be a dictionary'})
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

#         enabled_methods = [method for method, config in access_methods.items() if config.get('enabled', False)]
#         if not enabled_methods:
#             raise serializers.ValidationError({'accessMethods': 'At least one access method must be enabled'})
#         return data

#     def create(self, validated_data):
#         request = self.context.get('request')
#         if request and hasattr(request, 'user'):
#             validated_data['created_by'] = request.user
#         if 'access_methods' not in validated_data or not validated_data['access_methods']:
#             template = PlanTemplate()
#             template.set_default_access_methods()
#             validated_data['access_methods'] = template.access_methods
#         return super().create(validated_data)


# class InternetPlanSerializer(serializers.ModelSerializer):
#     planType = serializers.CharField(source='plan_type')
#     accessMethods = serializers.JSONField(source='access_methods')
#     allowed_routers = RouterSerializer(many=True, read_only=True)
#     allowed_routers_ids = serializers.ListField(child=serializers.IntegerField(), write_only=True, required=False)
#     template = PlanTemplateSerializer(read_only=True)
#     template_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
#     has_enabled_access_methods = serializers.BooleanField(read_only=True)
#     enabled_access_methods = serializers.ListField(read_only=True)
#     accessType = serializers.CharField(read_only=True)
#     router_compatibility = serializers.SerializerMethodField()

#     class Meta:
#         model = InternetPlan
#         fields = [
#             'id', 'planType', 'name', 'price', 'active', 'category',
#             'description', 'purchases', 'client_sessions', 'created_at',
#             'accessMethods', 'priority_level', 'router_specific',
#             'allowed_routers', 'allowed_routers_ids', 'FUP_policy',
#             'FUP_threshold', 'has_enabled_access_methods',
#             'enabled_access_methods', 'template', 'template_id', 'accessType',
#             'router_compatibility'
#         ]

#     def get_router_compatibility(self, obj):
#         return obj.get_router_compatibility()

#     def validate(self, data):
#         if data.get('plan_type') == 'Free Trial':
#             if data.get('price', 0) != 0:
#                 raise serializers.ValidationError({'price': 'Free Trial plans must have price set to 0'})
#             if data.get('router_specific', False):
#                 raise serializers.ValidationError({'router_specific': 'Free Trial plans cannot be router-specific'})
#             if data.get('priority_level', 4) > 4:
#                 raise serializers.ValidationError({'priority_level': 'Free Trial plans cannot have premium priority levels'})

#         access_methods = data.get('access_methods', {})
#         if not isinstance(access_methods, dict):
#             raise serializers.ValidationError({'accessMethods': 'Access methods must be a dictionary'})

#         for method in ['hotspot', 'pppoe']:
#             if method not in access_methods:
#                 raise serializers.ValidationError({'accessMethods': f'Missing {method} configuration'})
#             config = access_methods[method]
#             if not isinstance(config, dict):
#                 raise serializers.ValidationError({'accessMethods': f'{method} configuration must be a dictionary'})
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

#         enabled_methods = [m for m, c in access_methods.items() if c.get('enabled', False)]
#         if not enabled_methods:
#             raise serializers.ValidationError({'accessMethods': 'At least one access method must be enabled'})
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

#         if not validated_data.get('access_methods'):
#             plan = InternetPlan()
#             plan.set_default_access_methods()
#             validated_data['access_methods'] = plan.access_methods

#         with transaction.atomic():
#             plan = InternetPlan.objects.create(**validated_data)

#             if template_id:
#                 try:
#                     template = PlanTemplate.objects.select_for_update().get(id=template_id, is_active=True)
#                     plan.template = template
#                     plan.save(update_fields=['template'])
#                 except PlanTemplate.DoesNotExist:
#                     pass

#             if allowed_routers_ids:
#                 plan.allowed_routers.set(allowed_routers_ids)

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
#     client = serializers.SerializerMethodField()
#     internet_plan = InternetPlanSerializer(read_only=True)
#     payment_reference = serializers.CharField(source='transaction_reference', read_only=True)
#     payment_status = serializers.SerializerMethodField()
#     router = RouterSerializer(read_only=True)
#     remaining_data_display = serializers.CharField(read_only=True)
#     remaining_time_display = serializers.CharField(read_only=True)
#     can_activate = serializers.SerializerMethodField()
#     activation_error = serializers.CharField(read_only=True)

#     class Meta:
#         model = Subscription
#         fields = [
#             'id', 'client', 'internet_plan', 'router', 'payment_reference',
#             'payment_status', 'access_method', 'status', 'mac_address', 'start_date', 'end_date',
#             'remaining_data', 'remaining_time', 'data_used', 'time_used',
#             'last_activity', 'is_active', 'remaining_data_display', 'remaining_time_display',
#             'activation_attempts', 'last_activation_attempt', 'activation_successful', 
#             'can_activate', 'activation_error'
#         ]
#         read_only_fields = ['payment_reference', 'payment_status']

#     def get_client(self, obj):
#         if obj.client and obj.client.user:
#             return {
#                 'id': obj.client.id,
#                 'name': obj.client.user.get_full_name() or obj.client.user.username,
#                 'username': obj.client.user.username,
#                 'phonenumber': str(obj.client.user.phonenumber) if obj.client.user.phonenumber else None
#             }
#         return {'id': None, 'name': 'Unknown', 'username': 'unknown', 'phonenumber': None}

#     def get_payment_status(self, obj):
#         """Get payment status from payment service"""
#         if not obj.transaction_reference:
#             return 'no_payment'
        
#         # Import here to avoid circular imports
#         from internet_plans.api.views.integration_views import PaymentService
#         payment_status = PaymentService.get_transaction_status(obj.transaction_reference)
#         return payment_status.get('status', 'unknown')

#     def get_can_activate(self, obj):
#         return (obj.router and 
#                 obj.router.status == 'connected' and 
#                 obj.status == 'active' and 
#                 not obj.activation_successful)

#     def to_representation(self, instance):
#         data = super().to_representation(instance)
#         data['remaining_data_display'] = instance.get_remaining_data_display()
#         data['remaining_time_display'] = instance.get_remaining_time_display()
#         return data







from rest_framework import serializers
from internet_plans.models.create_plan_models import InternetPlan, Subscription, PlanTemplate
from network_management.serializers.router_management_serializer import RouterSerializer
from django.db import transaction
from decimal import Decimal
import logging

logger = logging.getLogger(__name__)

class PlanTemplateSerializer(serializers.ModelSerializer):
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
        return obj.created_plans.count()

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['accessMethods'] = instance.access_methods
        data['hasEnabledAccessMethods'] = instance.has_enabled_access_methods()
        data['enabledAccessMethods'] = instance.get_enabled_access_methods()
        data['accessType'] = instance.get_access_type()
        return data

    def validate(self, data):
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
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['created_by'] = request.user
        if 'access_methods' not in validated_data or not validated_data['access_methods']:
            template = PlanTemplate()
            template.set_default_access_methods()
            validated_data['access_methods'] = template.access_methods
        return super().create(validated_data)


class InternetPlanSerializer(serializers.ModelSerializer):
    planType = serializers.CharField(source='plan_type')
    accessMethods = serializers.JSONField(source='access_methods')
    allowed_routers = RouterSerializer(many=True, read_only=True)
    allowed_routers_ids = serializers.ListField(child=serializers.IntegerField(), write_only=True, required=False)
    template = PlanTemplateSerializer(read_only=True)
    template_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    has_enabled_access_methods = serializers.BooleanField(read_only=True)
    enabled_access_methods = serializers.ListField(read_only=True)
    accessType = serializers.CharField(read_only=True)
    router_compatibility = serializers.SerializerMethodField()

    class Meta:
        model = InternetPlan
        fields = [
            'id', 'planType', 'name', 'price', 'active', 'category',
            'description', 'purchases', 'client_sessions', 'created_at',
            'accessMethods', 'priority_level', 'router_specific',
            'allowed_routers', 'allowed_routers_ids', 'FUP_policy',
            'FUP_threshold', 'has_enabled_access_methods',
            'enabled_access_methods', 'template', 'template_id', 'accessType',
            'router_compatibility'
        ]

    def get_router_compatibility(self, obj):
        return obj.get_router_compatibility()

    def validate(self, data):
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
                    pass

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
    client = serializers.SerializerMethodField()
    internet_plan = InternetPlanSerializer(read_only=True)
    payment_reference = serializers.CharField(source='transaction_reference', read_only=True)
    router = RouterSerializer(read_only=True)
    remaining_data_display = serializers.CharField(read_only=True)
    remaining_time_display = serializers.CharField(read_only=True)
    can_activate = serializers.SerializerMethodField()
    activation_status = serializers.SerializerMethodField()

    class Meta:
        model = Subscription
        fields = [
            'id', 'client', 'internet_plan', 'router', 'payment_reference',
            'access_method', 'status', 'mac_address', 'start_date', 'end_date',
            'remaining_data', 'remaining_time', 'data_used', 'time_used',
            'last_activity', 'is_active', 'remaining_data_display', 'remaining_time_display',
            'activation_requested', 'activation_successful', 'activation_error',
            'activation_requested_at', 'can_activate', 'activation_status'
        ]
        read_only_fields = ['payment_reference']

    def get_client(self, obj):
        if obj.client and obj.client.user:
            return {
                'id': obj.client.id,
                'name': obj.client.user.get_full_name() or obj.client.user.username,
                'username': obj.client.user.username,
                'phonenumber': str(obj.client.user.phonenumber) if obj.client.user.phonenumber else None
            }
        return {'id': None, 'name': 'Unknown', 'username': 'unknown', 'phonenumber': None}

    def get_can_activate(self, obj):
        return (obj.router and 
                obj.router.status == 'connected' and 
                obj.status == 'active' and 
                not obj.activation_requested)

    def get_activation_status(self, obj):
        """Get activation status from activation service"""
        from internet_plans.services.activation_service import ActivationService
        
        if not obj.activation_requested:
            return 'not_requested'
        
        if obj.activation_successful:
            return 'successful'
        
        if obj.activation_error:
            return f'failed: {obj.activation_error}'
        
        return 'pending'

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['remaining_data_display'] = instance.get_remaining_data_display()
        data['remaining_time_display'] = instance.get_remaining_time_display()
        return data