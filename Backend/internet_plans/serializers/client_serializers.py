# from rest_framework import serializers
# from internet_plans.models.create_plan_models import InternetPlan

# class ClientPlanSerializer(serializers.ModelSerializer):
#     access_methods_summary = serializers.SerializerMethodField()
#     duration_display = serializers.SerializerMethodField()
#     data_limit_display = serializers.SerializerMethodField()
#     payment_required = serializers.SerializerMethodField()
#     free_trial_available = serializers.SerializerMethodField()
    
#     class Meta:
#         model = InternetPlan
#         fields = [
#             'id', 'name', 'price', 'plan_type', 'category', 'description',
#             'access_methods_summary', 'duration_display', 'data_limit_display',
#             'FUP_policy', 'payment_required', 'free_trial_available'
#         ]
    
#     def get_access_methods_summary(self, obj):
#         enabled_methods = obj.get_enabled_access_methods()
#         return {
#             'hotspot': 'hotspot' in enabled_methods,
#             'pppoe': 'pppoe' in enabled_methods
#         }
    
#     def get_duration_display(self, obj):
#         primary_method = obj.get_access_type()
#         if primary_method and primary_method in obj.access_methods:
#             usage_limit = obj.access_methods[primary_method].get('usageLimit', {})
#             return f"{usage_limit.get('value', 'N/A')} {usage_limit.get('unit', '')}"
#         return "N/A"
    
#     def get_data_limit_display(self, obj):
#         primary_method = obj.get_access_type()
#         if primary_method and primary_method in obj.access_methods:
#             data_limit = obj.access_methods[primary_method].get('dataLimit', {})
#             return f"{data_limit.get('value', 'N/A')} {data_limit.get('unit', '')}"
#         return "N/A"
    
#     def get_payment_required(self, obj):
#         return obj.plan_type == 'Paid' and obj.price > 0
    
#     def get_free_trial_available(self, obj):
#         return obj.plan_type == 'Free Trial' or obj.price == 0






# internet_plans/serializers/client_serializers.py

from rest_framework import serializers
from internet_plans.models.create_plan_models import InternetPlan

class ClientPlanSerializer(serializers.ModelSerializer):
    access_methods_summary = serializers.SerializerMethodField()
    duration_display = serializers.SerializerMethodField()
    data_limit_display = serializers.SerializerMethodField()
    payment_required = serializers.SerializerMethodField()
    free_trial_available = serializers.SerializerMethodField()
    download_speed = serializers.SerializerMethodField()
    upload_speed = serializers.SerializerMethodField()
    speed_unit = serializers.SerializerMethodField()
    max_devices = serializers.SerializerMethodField()
    
    class Meta:
        model = InternetPlan
        fields = [
            'id', 'name', 'price', 'plan_type', 'category', 'description',
            'access_methods_summary', 'duration_display', 'data_limit_display',
            'FUP_policy', 'payment_required', 'free_trial_available',
            'download_speed', 'upload_speed', 'speed_unit', 'max_devices'
        ]
    
    def get_access_methods_summary(self, obj):
        enabled_methods = obj.get_enabled_access_methods()
        return {
            'hotspot': 'hotspot' in enabled_methods,
            'pppoe': 'pppoe' in enabled_methods
        }
    
    def get_duration_display(self, obj):
        """Get duration from hotspot validityPeriod or usageLimit"""
        hotspot_config = obj.access_methods.get('hotspot', {})
        if hotspot_config.get('enabled', False):
            # Try validityPeriod first, then usageLimit
            validity_period = hotspot_config.get('validityPeriod', {})
            if validity_period.get('value'):
                return f"{validity_period.get('value')} {validity_period.get('unit', '')}"
            
            usage_limit = hotspot_config.get('usageLimit', {})
            if usage_limit.get('value'):
                return f"{usage_limit.get('value')} {usage_limit.get('unit', '')}"
        
        return "Unlimited"
    
    def get_data_limit_display(self, obj):
        """Get data limit from hotspot configuration"""
        hotspot_config = obj.access_methods.get('hotspot', {})
        if hotspot_config.get('enabled', False):
            data_limit = hotspot_config.get('dataLimit', {})
            value = data_limit.get('value', '')
            unit = data_limit.get('unit', '')
            
            if value and unit:
                return f"{value} {unit}"
            elif value == "Unlimited":
                return "Unlimited"
        
        return "Unlimited"
    
    def get_download_speed(self, obj):
        """Get actual download speed from hotspot configuration"""
        hotspot_config = obj.access_methods.get('hotspot', {})
        if hotspot_config.get('enabled', False):
            download_speed = hotspot_config.get('downloadSpeed', {})
            return download_speed.get('value', '')
        return ""
    
    def get_upload_speed(self, obj):
        """Get actual upload speed from hotspot configuration"""
        hotspot_config = obj.access_methods.get('hotspot', {})
        if hotspot_config.get('enabled', False):
            upload_speed = hotspot_config.get('uploadSpeed', {})
            return upload_speed.get('value', '')
        return ""
    
    def get_speed_unit(self, obj):
        """Get speed unit from hotspot configuration"""
        hotspot_config = obj.access_methods.get('hotspot', {})
        if hotspot_config.get('enabled', False):
            download_speed = hotspot_config.get('downloadSpeed', {})
            return download_speed.get('unit', 'Mbps')
        return "Mbps"
    
    def get_max_devices(self, obj):
        """Get maximum devices from hotspot configuration"""
        hotspot_config = obj.access_methods.get('hotspot', {})
        if hotspot_config.get('enabled', False):
            return hotspot_config.get('maxDevices', 1)
        return 1
    
    def get_payment_required(self, obj):
        return obj.plan_type == 'Paid' and obj.price > 0
    
    def get_free_trial_available(self, obj):
        return obj.plan_type == 'Free Trial' or obj.price == 0