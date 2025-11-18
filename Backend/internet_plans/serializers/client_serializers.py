from rest_framework import serializers
from internet_plans.models.create_plan_models import InternetPlan

class ClientPlanSerializer(serializers.ModelSerializer):
    access_methods_summary = serializers.SerializerMethodField()
    duration_display = serializers.SerializerMethodField()
    data_limit_display = serializers.SerializerMethodField()
    payment_required = serializers.SerializerMethodField()
    free_trial_available = serializers.SerializerMethodField()
    
    class Meta:
        model = InternetPlan
        fields = [
            'id', 'name', 'price', 'plan_type', 'category', 'description',
            'access_methods_summary', 'duration_display', 'data_limit_display',
            'FUP_policy', 'payment_required', 'free_trial_available'
        ]
    
    def get_access_methods_summary(self, obj):
        enabled_methods = obj.get_enabled_access_methods()
        return {
            'hotspot': 'hotspot' in enabled_methods,
            'pppoe': 'pppoe' in enabled_methods
        }
    
    def get_duration_display(self, obj):
        primary_method = obj.get_access_type()
        if primary_method and primary_method in obj.access_methods:
            usage_limit = obj.access_methods[primary_method].get('usageLimit', {})
            return f"{usage_limit.get('value', 'N/A')} {usage_limit.get('unit', '')}"
        return "N/A"
    
    def get_data_limit_display(self, obj):
        primary_method = obj.get_access_type()
        if primary_method and primary_method in obj.access_methods:
            data_limit = obj.access_methods[primary_method].get('dataLimit', {})
            return f"{data_limit.get('value', 'N/A')} {data_limit.get('unit', '')}"
        return "N/A"
    
    def get_payment_required(self, obj):
        return obj.plan_type == 'Paid' and obj.price > 0
    
    def get_free_trial_available(self, obj):
        return obj.plan_type == 'Free Trial' or obj.price == 0