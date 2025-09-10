

# from rest_framework import serializers
# from internet_plans.models.create_plan_models import InternetPlan


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
#             'value': str(instance.download_speed_value),
#             'unit': instance.download_speed_unit
#         }
#         data['uploadSpeed'] = {
#             'value': str(instance.upload_speed_value),
#             'unit': instance.upload_speed_unit
#         }
#         data['expiry'] = {
#             'value': str(instance.expiry_value),
#             'unit': instance.expiry_unit
#         }
#         data['dataLimit'] = {
#             'value': instance.data_limit_value,
#             'unit': instance.data_limit_unit
#         }
#         data['usageLimit'] = {
#             'value': instance.usage_limit_value,
#             'unit': instance.usage_limit_unit
#         }
#         data['features'] = instance.features if instance.features is not None else []
#         data['restrictions'] = instance.restrictions if instance.restrictions is not None else []
#         return data

#     def to_internal_value(self, data):
#         internal = super().to_internal_value(data)
#         internal['plan_type'] = data.get('planType', internal.get('plan_type', 'Paid'))
#         internal['download_speed_value'] = float(data['downloadSpeed']['value'])
#         internal['download_speed_unit'] = data['downloadSpeed']['unit']
#         internal['upload_speed_value'] = float(data['uploadSpeed']['value'])
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









from rest_framework import serializers
from internet_plans.models.create_plan_models import InternetPlan, Subscription


class InternetPlanSerializer(serializers.ModelSerializer):
    planType = serializers.CharField(source='plan_type')
    downloadSpeed = serializers.DictField(child=serializers.CharField(), write_only=True)
    uploadSpeed = serializers.DictField(child=serializers.CharField(), write_only=True)
    expiry = serializers.DictField(child=serializers.CharField(), write_only=True)
    dataLimit = serializers.DictField(child=serializers.CharField(), write_only=True)
    usageLimit = serializers.DictField(child=serializers.CharField(), write_only=True)
    features = serializers.JSONField(default=list, allow_null=True, required=False)
    restrictions = serializers.JSONField(default=list, allow_null=True, required=False)
    client_sessions = serializers.JSONField(default=dict, allow_null=True, required=False)

    class Meta:
        model = InternetPlan
        fields = [
            'id', 'planType', 'name', 'price', 'active', 'category',
            'downloadSpeed', 'uploadSpeed', 'expiry', 'dataLimit', 'usageLimit',
            'description', 'purchases', 'features', 'restrictions',
            'client_sessions', 'created_at'
        ]
        extra_kwargs = {
            'downloadSpeed': {'write_only': True},
            'uploadSpeed': {'write_only': True},
            'expiry': {'write_only': True},
            'dataLimit': {'write_only': True},
            'usageLimit': {'write_only': True},
        }

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['planType'] = instance.plan_type
        data['downloadSpeed'] = {
            'value': str(instance.download_speed_value) if instance.download_speed_value != 'Unlimited' else 'Unlimited',
            'unit': instance.download_speed_unit
        }
        data['uploadSpeed'] = {
            'value': str(instance.upload_speed_value) if instance.upload_speed_value != 'Unlimited' else 'Unlimited',
            'unit': instance.upload_speed_unit
        }
        data['expiry'] = {
            'value': str(instance.expiry_value),
            'unit': instance.expiry_unit
        }
        data['dataLimit'] = {
            'value': instance.data_limit_value,
            'unit': instance.data_limit_unit if instance.data_limit_value.lower() != 'unlimited' else ''
        }
        data['usageLimit'] = {
            'value': instance.usage_limit_value,
            'unit': instance.usage_limit_unit if instance.usage_limit_value.lower() != 'unlimited' else ''
        }
        data['features'] = instance.features if instance.features is not None else []
        data['restrictions'] = instance.restrictions if instance.restrictions is not None else []
        return data

    def to_internal_value(self, data):
        internal = super().to_internal_value(data)
        internal['plan_type'] = data.get('planType', internal.get('plan_type', 'Paid'))
        internal['download_speed_value'] = data['downloadSpeed']['value'] if data['downloadSpeed']['value'] == 'Unlimited' else float(data['downloadSpeed']['value'])
        internal['download_speed_unit'] = data['downloadSpeed']['unit']
        internal['upload_speed_value'] = data['uploadSpeed']['value'] if data['uploadSpeed']['value'] == 'Unlimited' else float(data['uploadSpeed']['value'])
        internal['upload_speed_unit'] = data['uploadSpeed']['unit']
        internal['expiry_value'] = int(data['expiry']['value'])
        internal['expiry_unit'] = data['expiry']['unit']
        internal['data_limit_value'] = data['dataLimit']['value']
        internal['data_limit_unit'] = data['dataLimit']['unit']
        internal['usage_limit_value'] = data['usageLimit']['value']
        internal['usage_limit_unit'] = data['usageLimit']['unit']
        internal['features'] = data.get('features', [])
        internal['restrictions'] = data.get('restrictions', [])
        internal['client_sessions'] = data.get('client_sessions', internal.get('client_sessions', {}))
        for field in ['downloadSpeed', 'uploadSpeed', 'expiry', 'dataLimit', 'usageLimit']:
            internal.pop(field, None)
        return internal

    def validate(self, data):
        if data['plan_type'] == 'Free Trial' and data.get('price', 0) != 0:
            raise serializers.ValidationError({'price': 'Free Trial plans must have price set to 0'})
        if data['category'] not in dict(InternetPlan.CATEGORIES):
            raise serializers.ValidationError({'category': 'Invalid category'})
        return data

    def create(self, validated_data):
        return InternetPlan.objects.create(**validated_data)

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

class SubscriptionSerializer(serializers.ModelSerializer):
    client = serializers.SerializerMethodField()
    internet_plan = serializers.SerializerMethodField()
    transaction = serializers.SerializerMethodField()

    class Meta:
        model = Subscription
        fields = '__all__'

    def get_client(self, obj):
        return {
            'id': obj.client.id,
            'name': obj.client.user.name,
            'phonenumber': str(obj.client.user.phonenumber) if obj.client.user.phonenumber else None
        }

    def get_internet_plan(self, obj):
        if obj.internet_plan:
            return {
                'id': obj.internet_plan.id,
                'name': obj.internet_plan.name
            }
        return None

    def get_transaction(self, obj):
        if obj.transaction:
            return {
                'id': obj.transaction.id,
                'reference': obj.transaction.reference,
                'status': obj.transaction.status
            }
        return None