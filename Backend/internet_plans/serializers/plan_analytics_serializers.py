# internet_plans/serializers/plan_analytics_serializers.py
from rest_framework import serializers
from internet_plans.models.create_plan_models import InternetPlan
from internet_plans.models.plan_analytics_models import PlanAnalytics

class PlanAnalyticsSerializer(serializers.ModelSerializer):
    planType = serializers.CharField(source='plan_type')
    downloadSpeed = serializers.SerializerMethodField()
    uploadSpeed = serializers.SerializerMethodField()
    expiry = serializers.SerializerMethodField()
    dataLimit = serializers.SerializerMethodField()
    usageLimit = serializers.SerializerMethodField()
    features = serializers.JSONField(default=list)
    restrictions = serializers.JSONField(default=list)
    client_sessions = serializers.JSONField(default=dict)
    uptime = serializers.SerializerMethodField()

    class Meta:
        model = InternetPlan  # Directly serialize InternetPlan for analytics
        fields = [
            'id', 'planType', 'name', 'price', 'active',
            'downloadSpeed', 'uploadSpeed', 'expiry', 'dataLimit', 'usageLimit',
            'description', 'category', 'purchases', 'features', 'restrictions',
            'client_sessions', 'created_at', 'uptime'
        ]

    def get_downloadSpeed(self, obj):
        return {'value': str(obj.download_speed_value), 'unit': obj.download_speed_unit}

    def get_uploadSpeed(self, obj):
        return {'value': str(obj.upload_speed_value), 'unit': obj.upload_speed_unit}

    def get_expiry(self, obj):
        return {'value': str(obj.expiry_value), 'unit': obj.expiry_unit}

    def get_dataLimit(self, obj):
        return {'value': obj.data_limit_value, 'unit': obj.data_limit_unit}

    def get_usageLimit(self, obj):
        return {'value': obj.usage_limit_value, 'unit': obj.usage_limit_unit}

    def get_uptime(self, obj):
        # Fetch uptime from PlanAnalytics if it exists, else mock it
        analytics = PlanAnalytics.objects.filter(plan=obj).first()
        return analytics.uptime if analytics else (99.0 + (obj.id % 10) * 0.1)  # Mock for demo