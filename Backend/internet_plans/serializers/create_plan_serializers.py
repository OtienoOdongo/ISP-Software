


# from rest_framework import serializers
# from internet_plans.models.create_plan_models import InternetPlan, Subscription


# class InternetPlanSerializer(serializers.ModelSerializer):
#     planType = serializers.CharField(source='plan_type')
#     downloadSpeed = serializers.DictField(child=serializers.CharField(), write_only=True)
#     uploadSpeed = serializers.DictField(child=serializers.CharField(), write_only=True)
#     expiry = serializers.DictField(child=serializers.CharField(), write_only=True)
#     dataLimit = serializers.DictField(child=serializers.CharField(), write_only=True)
#     usageLimit = serializers.DictField(child=serializers.CharField(), write_only=True)
#     features = serializers.JSONField(default=list, allow_null=True, required=False)
#     restrictions = serializers.JSONField(default=list, allow_null=True, required=False)
#     client_sessions = serializers.JSONField(default=dict, allow_null=True, required=False)

#     class Meta:
#         model = InternetPlan
#         fields = [
#             'id', 'planType', 'name', 'price', 'active', 'category',
#             'downloadSpeed', 'uploadSpeed', 'expiry', 'dataLimit', 'usageLimit',
#             'description', 'purchases', 'features', 'restrictions',
#             'client_sessions', 'created_at'
#         ]
#         extra_kwargs = {
#             'downloadSpeed': {'write_only': True},
#             'uploadSpeed': {'write_only': True},
#             'expiry': {'write_only': True},
#             'dataLimit': {'write_only': True},
#             'usageLimit': {'write_only': True},
#         }

#     def to_representation(self, instance):
#         data = super().to_representation(instance)
#         data['planType'] = instance.plan_type
#         data['downloadSpeed'] = {
#             'value': str(instance.download_speed_value) if instance.download_speed_value != 'Unlimited' else 'Unlimited',
#             'unit': instance.download_speed_unit
#         }
#         data['uploadSpeed'] = {
#             'value': str(instance.upload_speed_value) if instance.upload_speed_value != 'Unlimited' else 'Unlimited',
#             'unit': instance.upload_speed_unit
#         }
#         data['expiry'] = {
#             'value': str(instance.expiry_value),
#             'unit': instance.expiry_unit
#         }
#         data['dataLimit'] = {
#             'value': instance.data_limit_value,
#             'unit': instance.data_limit_unit if instance.data_limit_value.lower() != 'unlimited' else ''
#         }
#         data['usageLimit'] = {
#             'value': instance.usage_limit_value,
#             'unit': instance.usage_limit_unit if instance.usage_limit_value.lower() != 'unlimited' else ''
#         }
#         data['features'] = instance.features if instance.features is not None else []
#         data['restrictions'] = instance.restrictions if instance.restrictions is not None else []
#         return data

#     def to_internal_value(self, data):
#         internal = super().to_internal_value(data)
#         internal['plan_type'] = data.get('planType', internal.get('plan_type', 'Paid'))
#         internal['download_speed_value'] = data['downloadSpeed']['value'] if data['downloadSpeed']['value'] == 'Unlimited' else float(data['downloadSpeed']['value'])
#         internal['download_speed_unit'] = data['downloadSpeed']['unit']
#         internal['upload_speed_value'] = data['uploadSpeed']['value'] if data['uploadSpeed']['value'] == 'Unlimited' else float(data['uploadSpeed']['value'])
#         internal['upload_speed_unit'] = data['uploadSpeed']['unit']
#         internal['expiry_value'] = int(data['expiry']['value'])
#         internal['expiry_unit'] = data['expiry']['unit']
#         internal['data_limit_value'] = data['dataLimit']['value']
#         internal['data_limit_unit'] = data['dataLimit']['unit']
#         internal['usage_limit_value'] = data['usageLimit']['value']
#         internal['usage_limit_unit'] = data['usageLimit']['unit']
#         internal['features'] = data.get('features', [])
#         internal['restrictions'] = data.get('restrictions', [])
#         internal['client_sessions'] = data.get('client_sessions', internal.get('client_sessions', {}))
#         for field in ['downloadSpeed', 'uploadSpeed', 'expiry', 'dataLimit', 'usageLimit']:
#             internal.pop(field, None)
#         return internal

#     def validate(self, data):
#         if data['plan_type'] == 'Free Trial' and data.get('price', 0) != 0:
#             raise serializers.ValidationError({'price': 'Free Trial plans must have price set to 0'})
#         if data['category'] not in dict(InternetPlan.CATEGORIES):
#             raise serializers.ValidationError({'category': 'Invalid category'})
#         return data

#     def create(self, validated_data):
#         return InternetPlan.objects.create(**validated_data)

#     def update(self, instance, validated_data):
#         for attr, value in validated_data.items():
#             setattr(instance, attr, value)
#         instance.save()
#         return instance

# class SubscriptionSerializer(serializers.ModelSerializer):
#     client = serializers.SerializerMethodField()
#     internet_plan = serializers.SerializerMethodField()
#     transaction = serializers.SerializerMethodField()

#     class Meta:
#         model = Subscription
#         fields = '__all__'

#     def get_client(self, obj):
#         return {
#             'id': obj.client.id,
#             'name': obj.client.user.name,
#             'phonenumber': str(obj.client.user.phonenumber) if obj.client.user.phonenumber else None
#         }

#     def get_internet_plan(self, obj):
#         if obj.internet_plan:
#             return {
#                 'id': obj.internet_plan.id,
#                 'name': obj.internet_plan.name
#             }
#         return None

#     def get_transaction(self, obj):
#         if obj.transaction:
#             return {
#                 'id': obj.transaction.id,
#                 'reference': obj.transaction.reference,
#                 'status': obj.transaction.status
#             }
#         return None







# from rest_framework import serializers
# from internet_plans.models.create_plan_models import InternetPlan, Subscription
# from network_management.models.router_management_model import Router


# class RouterSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Router
#         fields = ['id', 'name', 'ip', 'location', 'status']


# class InternetPlanSerializer(serializers.ModelSerializer):
#     planType = serializers.CharField(source='plan_type')
#     downloadSpeed = serializers.DictField(child=serializers.CharField(), write_only=True)
#     uploadSpeed = serializers.DictField(child=serializers.CharField(), write_only=True)
#     expiry = serializers.DictField(child=serializers.CharField(), write_only=True)
#     dataLimit = serializers.DictField(child=serializers.CharField(), write_only=True)
#     usageLimit = serializers.DictField(child=serializers.CharField(), write_only=True)
#     features = serializers.JSONField(default=list, allow_null=True, required=False)
#     restrictions = serializers.JSONField(default=list, allow_null=True, required=False)
#     client_sessions = serializers.JSONField(default=dict, allow_null=True, required=False)
#     allowed_routers = RouterSerializer(many=True, read_only=True)
#     allowed_routers_ids = serializers.ListField(
#         child=serializers.IntegerField(),
#         write_only=True,
#         required=False
#     )
#     bandwidth_limit_display = serializers.CharField(read_only=True)

#     class Meta:
#         model = InternetPlan
#         fields = [
#             'id', 'planType', 'name', 'price', 'active', 'category',
#             'downloadSpeed', 'uploadSpeed', 'expiry', 'dataLimit', 'usageLimit',
#             'description', 'purchases', 'features', 'restrictions',
#             'client_sessions', 'created_at', 'bandwidth_limit', 'bandwidth_limit_display',
#             'concurrent_connections', 'priority_level', 'router_specific',
#             'allowed_routers', 'allowed_routers_ids', 'FUP_policy', 'FUP_threshold'
#         ]
#         extra_kwargs = {
#             'downloadSpeed': {'write_only': True},
#             'uploadSpeed': {'write_only': True},
#             'expiry': {'write_only': True},
#             'dataLimit': {'write_only': True},
#             'usageLimit': {'write_only': True},
#         }

#     def to_representation(self, instance):
#         data = super().to_representation(instance)
#         data['planType'] = instance.plan_type
#         data['downloadSpeed'] = {
#             'value': str(instance.download_speed_value) if instance.download_speed_value != 'Unlimited' else 'Unlimited',
#             'unit': instance.download_speed_unit
#         }
#         data['uploadSpeed'] = {
#             'value': str(instance.upload_speed_value) if instance.upload_speed_value != 'Unlimited' else 'Unlimited',
#             'unit': instance.upload_speed_unit
#         }
#         data['expiry'] = {
#             'value': str(instance.expiry_value),
#             'unit': instance.expiry_unit
#         }
#         data['dataLimit'] = {
#             'value': instance.data_limit_value,
#             'unit': instance.data_limit_unit if instance.data_limit_value.lower() != 'unlimited' else ''
#         }
#         data['usageLimit'] = {
#             'value': instance.usage_limit_value,
#             'unit': instance.usage_limit_unit if instance.usage_limit_value.lower() != 'unlimited' else ''
#         }
#         data['features'] = instance.features if instance.features is not None else []
#         data['restrictions'] = instance.restrictions if instance.restrictions is not None else []
#         data['bandwidth_limit_display'] = instance.get_bandwidth_limit_display()
#         data['is_unlimited_data'] = instance.is_unlimited_data()
#         data['is_unlimited_time'] = instance.is_unlimited_time()
#         return data

#     def to_internal_value(self, data):
#         internal = super().to_internal_value(data)
#         internal['plan_type'] = data.get('planType', internal.get('plan_type', 'Paid'))
#         internal['download_speed_value'] = data['downloadSpeed']['value'] if data['downloadSpeed']['value'] == 'Unlimited' else float(data['downloadSpeed']['value'])
#         internal['download_speed_unit'] = data['downloadSpeed']['unit']
#         internal['upload_speed_value'] = data['uploadSpeed']['value'] if data['uploadSpeed']['value'] == 'Unlimited' else float(data['uploadSpeed']['value'])
#         internal['upload_speed_unit'] = data['uploadSpeed']['unit']
#         internal['expiry_value'] = int(data['expiry']['value'])
#         internal['expiry_unit'] = data['expiry']['unit']
#         internal['data_limit_value'] = data['dataLimit']['value']
#         internal['data_limit_unit'] = data['dataLimit']['unit']
#         internal['usage_limit_value'] = data['usageLimit']['value']
#         internal['usage_limit_unit'] = data['usageLimit']['unit']
#         internal['features'] = data.get('features', [])
#         internal['restrictions'] = data.get('restrictions', [])
#         internal['client_sessions'] = data.get('client_sessions', internal.get('client_sessions', {}))
#         internal['bandwidth_limit'] = data.get('bandwidth_limit', 0)
#         internal['concurrent_connections'] = data.get('concurrent_connections', 1)
#         internal['priority_level'] = data.get('priority_level', 4)
#         internal['router_specific'] = data.get('router_specific', False)
#         internal['FUP_policy'] = data.get('FUP_policy', '')
#         internal['FUP_threshold'] = data.get('FUP_threshold', 80)
        
#         for field in ['downloadSpeed', 'uploadSpeed', 'expiry', 'dataLimit', 'usageLimit']:
#             internal.pop(field, None)
        
#         return internal

#     def validate(self, data):
#         if data['plan_type'] == 'Free Trial' and data.get('price', 0) != 0:
#             raise serializers.ValidationError({'price': 'Free Trial plans must have price set to 0'})
#         if data['category'] not in dict(InternetPlan.CATEGORIES):
#             raise serializers.ValidationError({'category': 'Invalid category'})
#         return data

#     def create(self, validated_data):
#         allowed_routers_ids = validated_data.pop('allowed_routers_ids', [])
#         plan = InternetPlan.objects.create(**validated_data)
        
#         if allowed_routers_ids:
#             plan.allowed_routers.set(allowed_routers_ids)
        
#         return plan

#     def update(self, instance, validated_data):
#         allowed_routers_ids = validated_data.pop('allowed_routers_ids', None)
        
#         for attr, value in validated_data.items():
#             setattr(instance, attr, value)
        
#         instance.save()
        
#         if allowed_routers_ids is not None:
#             instance.allowed_routers.set(allowed_routers_ids)
        
#         return instance


# class SubscriptionSerializer(serializers.ModelSerializer):
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
#         return {
#             'id': obj.client.id,
#             'name': obj.client.user.name,
#             'phonenumber': str(obj.client.user.phonenumber) if obj.client.user.phonenumber else None
#         }

#     def get_transaction(self, obj):
#         if obj.transaction:
#             return {
#                 'id': obj.transaction.id,
#                 'reference': obj.transaction.reference,
#                 'status': obj.transaction.status
#             }
#         return None





from rest_framework import serializers
from internet_plans.models.create_plan_models import InternetPlan, Subscription
from network_management.models.router_management_model import Router


class RouterSerializer(serializers.ModelSerializer):
    """
    Serializer for Router model, used in nested representations.
    """

    class Meta:
        model = Router
        fields = ['id', 'name', 'ip', 'location', 'status']


class InternetPlanSerializer(serializers.ModelSerializer):
    """
    Serializer for InternetPlan, handling complex dict fields for speeds/limits.
    Supports unlimited handling and router assignments.
    """
    planType = serializers.CharField(source='plan_type')
    downloadSpeed = serializers.DictField(child=serializers.CharField(), write_only=True)
    uploadSpeed = serializers.DictField(child=serializers.CharField(), write_only=True)
    expiry = serializers.DictField(child=serializers.CharField(), write_only=True)
    dataLimit = serializers.DictField(child=serializers.CharField(), write_only=True)
    usageLimit = serializers.DictField(child=serializers.CharField(), write_only=True)
    features = serializers.JSONField(default=list, allow_null=True, required=False)
    restrictions = serializers.JSONField(default=list, allow_null=True, required=False)
    client_sessions = serializers.JSONField(default=dict, allow_null=True, required=False)
    allowed_routers = RouterSerializer(many=True, read_only=True)
    allowed_routers_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )
    bandwidth_limit_display = serializers.CharField(read_only=True)
    is_unlimited_data = serializers.BooleanField(read_only=True)
    is_unlimited_time = serializers.BooleanField(read_only=True)

    class Meta:
        model = InternetPlan
        fields = [
            'id', 'planType', 'name', 'price', 'active', 'category',
            'downloadSpeed', 'uploadSpeed', 'expiry', 'dataLimit', 'usageLimit',
            'description', 'purchases', 'features', 'restrictions',
            'client_sessions', 'created_at', 'bandwidth_limit', 'bandwidth_limit_display',
            'concurrent_connections', 'priority_level', 'router_specific',
            'allowed_routers', 'allowed_routers_ids', 'FUP_policy', 'FUP_threshold',
            'is_unlimited_data', 'is_unlimited_time'
        ]
        extra_kwargs = {
            'downloadSpeed': {'write_only': True},
            'uploadSpeed': {'write_only': True},
            'expiry': {'write_only': True},
            'dataLimit': {'write_only': True},
            'usageLimit': {'write_only': True},
        }

    def validate(self, data):
        # Free trial validation
        if data.get('plan_type') == 'Free Trial':
            if data.get('price', 0) != 0:
                raise serializers.ValidationError({'price': 'Free Trial plans must have price set to 0'})
            if data.get('router_specific', False):
                raise serializers.ValidationError({'router_specific': 'Free Trial plans cannot be router-specific'})
            if data.get('priority_level', 4) > 4:
                raise serializers.ValidationError({'priority_level': 'Free Trial plans cannot have premium priority levels'})
        
        # Automatic unlimited handling
        if data.get('data_limit_unit') == 'Unlimited':
            data['data_limit_value'] = 'Unlimited'
        if data.get('usage_limit_unit') == 'Unlimited':
            data['usage_limit_value'] = 'Unlimited'
            
        return data

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['planType'] = instance.plan_type
        
        # Enhanced speed display
        data['downloadSpeed'] = {
            'value': str(instance.download_speed_value),
            'unit': instance.download_speed_unit
        }
        data['uploadSpeed'] = {
            'value': str(instance.upload_speed_value),
            'unit': instance.upload_speed_unit
        }
        
        # Enhanced expiry display
        data['expiry'] = {
            'value': str(instance.expiry_value),
            'unit': instance.expiry_unit
        }
        
        # Enhanced unlimited data display
        if instance.is_unlimited_data():
            data['dataLimit'] = {'value': 'Unlimited', 'unit': ''}
        else:
            data['dataLimit'] = {
                'value': instance.data_limit_value,
                'unit': instance.data_limit_unit
            }
            
        # Enhanced unlimited time display
        if instance.is_unlimited_time():
            data['usageLimit'] = {'value': 'Unlimited', 'unit': ''}
        else:
            data['usageLimit'] = {
                'value': instance.usage_limit_value,
                'unit': instance.usage_limit_unit
            }
            
        data['features'] = instance.features if instance.features is not None else []
        data['restrictions'] = instance.restrictions if instance.restrictions is not None else []
        data['bandwidth_limit_display'] = instance.get_bandwidth_limit_display()
        data['is_unlimited_data'] = instance.is_unlimited_data()
        data['is_unlimited_time'] = instance.is_unlimited_time()
        
        return data

    def to_internal_value(self, data):
        # Start with super to get basic internal data
        internal = super().to_internal_value(data)
        internal['plan_type'] = data.get('planType', internal.get('plan_type', 'Paid'))
        
        # Handle speed values (assume dicts are provided)
        if 'downloadSpeed' in data:
            internal['download_speed_value'] = data['downloadSpeed']['value']
            internal['download_speed_unit'] = data['downloadSpeed']['unit']
        if 'uploadSpeed' in data:
            internal['upload_speed_value'] = data['uploadSpeed']['value']
            internal['upload_speed_unit'] = data['uploadSpeed']['unit']
        
        # Handle expiry
        if 'expiry' in data:
            internal['expiry_value'] = int(data['expiry']['value'])
            internal['expiry_unit'] = data['expiry']['unit']
        
        # Handle data and usage limits with automatic unlimited handling
        if 'dataLimit' in data:
            internal['data_limit_value'] = data['dataLimit']['value']
            internal['data_limit_unit'] = data['dataLimit']['unit']
        if 'usageLimit' in data:
            internal['usage_limit_value'] = data['usageLimit']['value']
            internal['usage_limit_unit'] = data['usageLimit']['unit']
        
        # Handle other fields with defaults
        internal['features'] = data.get('features', [])
        internal['restrictions'] = data.get('restrictions', [])
        internal['client_sessions'] = data.get('client_sessions', internal.get('client_sessions', {}))
        internal['bandwidth_limit'] = data.get('bandwidth_limit', 0)
        internal['concurrent_connections'] = data.get('concurrent_connections', 1)
        internal['priority_level'] = data.get('priority_level', 4)
        internal['router_specific'] = data.get('router_specific', False)
        internal['FUP_policy'] = data.get('FUP_policy', '')
        internal['FUP_threshold'] = data.get('FUP_threshold', 80)
        
        # Remove temporary fields
        for field in ['downloadSpeed', 'uploadSpeed', 'expiry', 'dataLimit', 'usageLimit']:
            internal.pop(field, None)
        
        return internal

    def create(self, validated_data):
        allowed_routers_ids = validated_data.pop('allowed_routers_ids', [])
        plan = InternetPlan.objects.create(**validated_data)
        
        if allowed_routers_ids:
            plan.allowed_routers.set(allowed_routers_ids)
        
        return plan

    def update(self, instance, validated_data):
        allowed_routers_ids = validated_data.pop('allowed_routers_ids', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        
        if allowed_routers_ids is not None:
            instance.allowed_routers.set(allowed_routers_ids)
        
        return instance


class SubscriptionSerializer(serializers.ModelSerializer):
    """
    Serializer for Subscription, with nested plan/router and custom client/transaction formatting.
    """

    client = serializers.SerializerMethodField()
    internet_plan = InternetPlanSerializer(read_only=True)
    transaction = serializers.SerializerMethodField()
    router = RouterSerializer(read_only=True)
    remaining_data_display = serializers.CharField(read_only=True)
    remaining_time_display = serializers.CharField(read_only=True)

    class Meta:
        model = Subscription
        fields = '__all__'

    def get_client(self, obj):
        if obj.client and obj.client.user:
            return {
                'id': obj.client.id,
                'name': obj.client.user.name,
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