# # from rest_framework import serializers
# # from internet_plans.models.create_plan_models import InternetPlan

# # class ClientPlanSerializer(serializers.ModelSerializer):
# #     access_methods_summary = serializers.SerializerMethodField()
# #     duration_display = serializers.SerializerMethodField()
# #     data_limit_display = serializers.SerializerMethodField()
# #     payment_required = serializers.SerializerMethodField()
# #     free_trial_available = serializers.SerializerMethodField()
    
# #     class Meta:
# #         model = InternetPlan
# #         fields = [
# #             'id', 'name', 'price', 'plan_type', 'category', 'description',
# #             'access_methods_summary', 'duration_display', 'data_limit_display',
# #             'FUP_policy', 'payment_required', 'free_trial_available'
# #         ]
    
# #     def get_access_methods_summary(self, obj):
# #         enabled_methods = obj.get_enabled_access_methods()
# #         return {
# #             'hotspot': 'hotspot' in enabled_methods,
# #             'pppoe': 'pppoe' in enabled_methods
# #         }
    
# #     def get_duration_display(self, obj):
# #         primary_method = obj.get_access_type()
# #         if primary_method and primary_method in obj.access_methods:
# #             usage_limit = obj.access_methods[primary_method].get('usageLimit', {})
# #             return f"{usage_limit.get('value', 'N/A')} {usage_limit.get('unit', '')}"
# #         return "N/A"
    
# #     def get_data_limit_display(self, obj):
# #         primary_method = obj.get_access_type()
# #         if primary_method and primary_method in obj.access_methods:
# #             data_limit = obj.access_methods[primary_method].get('dataLimit', {})
# #             return f"{data_limit.get('value', 'N/A')} {data_limit.get('unit', '')}"
# #         return "N/A"
    
# #     def get_payment_required(self, obj):
# #         return obj.plan_type == 'Paid' and obj.price > 0
    
# #     def get_free_trial_available(self, obj):
# #         return obj.plan_type == 'Free Trial' or obj.price == 0






# # internet_plans/serializers/client_serializers.py

# from rest_framework import serializers
# from internet_plans.models.create_plan_models import InternetPlan

# class ClientPlanSerializer(serializers.ModelSerializer):
#     access_methods_summary = serializers.SerializerMethodField()
#     duration_display = serializers.SerializerMethodField()
#     data_limit_display = serializers.SerializerMethodField()
#     payment_required = serializers.SerializerMethodField()
#     free_trial_available = serializers.SerializerMethodField()
#     download_speed = serializers.SerializerMethodField()
#     upload_speed = serializers.SerializerMethodField()
#     speed_unit = serializers.SerializerMethodField()
#     max_devices = serializers.SerializerMethodField()
    
#     class Meta:
#         model = InternetPlan
#         fields = [
#             'id', 'name', 'price', 'plan_type', 'category', 'description',
#             'access_methods_summary', 'duration_display', 'data_limit_display',
#             'FUP_policy', 'payment_required', 'free_trial_available',
#             'download_speed', 'upload_speed', 'speed_unit', 'max_devices'
#         ]
    
#     def get_access_methods_summary(self, obj):
#         enabled_methods = obj.get_enabled_access_methods()
#         return {
#             'hotspot': 'hotspot' in enabled_methods,
#             'pppoe': 'pppoe' in enabled_methods
#         }
    
#     def get_duration_display(self, obj):
#         """Get duration from hotspot validityPeriod or usageLimit"""
#         hotspot_config = obj.access_methods.get('hotspot', {})
#         if hotspot_config.get('enabled', False):
#             # Try validityPeriod first, then usageLimit
#             validity_period = hotspot_config.get('validityPeriod', {})
#             if validity_period.get('value'):
#                 return f"{validity_period.get('value')} {validity_period.get('unit', '')}"
            
#             usage_limit = hotspot_config.get('usageLimit', {})
#             if usage_limit.get('value'):
#                 return f"{usage_limit.get('value')} {usage_limit.get('unit', '')}"
        
#         return "Unlimited"
    
#     def get_data_limit_display(self, obj):
#         """Get data limit from hotspot configuration"""
#         hotspot_config = obj.access_methods.get('hotspot', {})
#         if hotspot_config.get('enabled', False):
#             data_limit = hotspot_config.get('dataLimit', {})
#             value = data_limit.get('value', '')
#             unit = data_limit.get('unit', '')
            
#             if value and unit:
#                 return f"{value} {unit}"
#             elif value == "Unlimited":
#                 return "Unlimited"
        
#         return "Unlimited"
    
#     def get_download_speed(self, obj):
#         """Get actual download speed from hotspot configuration"""
#         hotspot_config = obj.access_methods.get('hotspot', {})
#         if hotspot_config.get('enabled', False):
#             download_speed = hotspot_config.get('downloadSpeed', {})
#             return download_speed.get('value', '')
#         return ""
    
#     def get_upload_speed(self, obj):
#         """Get actual upload speed from hotspot configuration"""
#         hotspot_config = obj.access_methods.get('hotspot', {})
#         if hotspot_config.get('enabled', False):
#             upload_speed = hotspot_config.get('uploadSpeed', {})
#             return upload_speed.get('value', '')
#         return ""
    
#     def get_speed_unit(self, obj):
#         """Get speed unit from hotspot configuration"""
#         hotspot_config = obj.access_methods.get('hotspot', {})
#         if hotspot_config.get('enabled', False):
#             download_speed = hotspot_config.get('downloadSpeed', {})
#             return download_speed.get('unit', 'Mbps')
#         return "Mbps"
    
#     def get_max_devices(self, obj):
#         """Get maximum devices from hotspot configuration"""
#         hotspot_config = obj.access_methods.get('hotspot', {})
#         if hotspot_config.get('enabled', False):
#             return hotspot_config.get('maxDevices', 1)
#         return 1
    
#     def get_payment_required(self, obj):
#         return obj.plan_type == 'Paid' and obj.price > 0
    
#     def get_free_trial_available(self, obj):
#         return obj.plan_type == 'Free Trial' or obj.price == 0







"""
Internet Plans - Client Serializers
Serializers for client-facing operations
"""

from rest_framework import serializers
from internet_plans.models.plan_models import InternetPlan
import logging

logger = logging.getLogger(__name__)


class ClientPlanSerializer(serializers.ModelSerializer):
    """Serializer for plans in client-facing API"""
    
    # Basic information
    planId = serializers.UUIDField(
        source='id',
        read_only=True
    )
    planName = serializers.CharField(
        source='name',
        read_only=True
    )
    planType = serializers.CharField(
        source='plan_type',
        read_only=True
    )
    price = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        read_only=True
    )
    category = serializers.CharField(
        read_only=True
    )
    description = serializers.CharField(
        read_only=True
    )
    
    # Access methods
    accessMethods = serializers.SerializerMethodField(
        read_only=True
    )
    enabledAccessMethods = serializers.SerializerMethodField(
        read_only=True
    )
    
    # Plan details
    downloadSpeed = serializers.SerializerMethodField(
        read_only=True
    )
    uploadSpeed = serializers.SerializerMethodField(
        read_only=True
    )
    dataLimit = serializers.SerializerMethodField(
        read_only=True
    )
    usageLimit = serializers.SerializerMethodField(
        read_only=True
    )
    maxDevices = serializers.SerializerMethodField(
        read_only=True
    )
    validityPeriod = serializers.SerializerMethodField(
        read_only=True
    )
    
    # Payment information
    paymentRequired = serializers.SerializerMethodField(
        read_only=True
    )
    freeTrialAvailable = serializers.SerializerMethodField(
        read_only=True
    )
    
    # FUP information
    FUPPolicy = serializers.CharField(
        source='FUP_policy',
        read_only=True
    )
    FUPThreshold = serializers.IntegerField(
        source='FUP_threshold',
        read_only=True
    )
    
    class Meta:
        model = InternetPlan
        fields = [
            'planId', 'planName', 'planType', 'price', 'category', 'description',
            'accessMethods', 'enabledAccessMethods', 'downloadSpeed', 'uploadSpeed',
            'dataLimit', 'usageLimit', 'maxDevices', 'validityPeriod',
            'paymentRequired', 'freeTrialAvailable', 'FUPPolicy', 'FUPThreshold'
        ]
    
    def get_accessMethods(self, obj):
        """Get access methods summary"""
        return {
            'hotspot': obj.access_methods.get('hotspot', {}).get('enabled', False),
            'pppoe': obj.access_methods.get('pppoe', {}).get('enabled', False)
        }
    
    def get_enabledAccessMethods(self, obj):
        """Get enabled access methods"""
        return obj.get_enabled_access_methods()
    
    def get_downloadSpeed(self, obj):
        """Get download speed for hotspot"""
        hotspot_config = obj.access_methods.get('hotspot', {})
        if hotspot_config.get('enabled', False):
            download_speed = hotspot_config.get('downloadSpeed', {})
            return {
                'value': download_speed.get('value', ''),
                'unit': download_speed.get('unit', 'Mbps')
            }
        return None
    
    def get_uploadSpeed(self, obj):
        """Get upload speed for hotspot"""
        hotspot_config = obj.access_methods.get('hotspot', {})
        if hotspot_config.get('enabled', False):
            upload_speed = hotspot_config.get('uploadSpeed', {})
            return {
                'value': upload_speed.get('value', ''),
                'unit': upload_speed.get('unit', 'Mbps')
            }
        return None
    
    def get_dataLimit(self, obj):
        """Get data limit for hotspot"""
        hotspot_config = obj.access_methods.get('hotspot', {})
        if hotspot_config.get('enabled', False):
            data_limit = hotspot_config.get('dataLimit', {})
            return {
                'value': data_limit.get('value', ''),
                'unit': data_limit.get('unit', 'GB')
            }
        return None
    
    def get_usageLimit(self, obj):
        """Get usage limit for hotspot"""
        hotspot_config = obj.access_methods.get('hotspot', {})
        if hotspot_config.get('enabled', False):
            usage_limit = hotspot_config.get('usageLimit', {})
            return {
                'value': usage_limit.get('value', ''),
                'unit': usage_limit.get('unit', 'Hours')
            }
        return None
    
    def get_maxDevices(self, obj):
        """Get maximum devices for hotspot"""
        hotspot_config = obj.access_methods.get('hotspot', {})
        if hotspot_config.get('enabled', False):
            return hotspot_config.get('maxDevices', 1)
        return None
    
    def get_validityPeriod(self, obj):
        """Get validity period for hotspot"""
        hotspot_config = obj.access_methods.get('hotspot', {})
        if hotspot_config.get('enabled', False):
            validity_period = hotspot_config.get('validityPeriod', {})
            return {
                'value': validity_period.get('value', ''),
                'unit': validity_period.get('unit', 'Days')
            }
        return None
    
    def get_paymentRequired(self, obj):
        """Check if payment is required"""
        return obj.plan_type == 'paid' and obj.price > 0
    
    def get_freeTrialAvailable(self, obj):
        """Check if free trial is available"""
        return obj.plan_type == 'free_trial' or obj.price == 0


class ClientPurchaseRequestSerializer(serializers.Serializer):
    """Serializer for client purchase requests"""
    
    # Required fields
    planId = serializers.UUIDField(
        required=True,
        help_text="Plan ID to purchase"
    )
    phoneNumber = serializers.CharField(
        required=True,
        max_length=20,
        help_text="Client phone number"
    )
    accessMethod = serializers.ChoiceField(
        choices=[('hotspot', 'Hotspot'), ('pppoe', 'PPPoE')],
        required=True,
        help_text="Access method"
    )
    
    # Optional fields
    macAddress = serializers.CharField(
        required=False,
        allow_null=True,
        allow_blank=True,
        max_length=17,
        help_text="MAC address (for hotspot)"
    )
    routerId = serializers.IntegerField(
        required=False,
        allow_null=True,
        help_text="Router ID (optional)"
    )
    durationHours = serializers.IntegerField(
        required=False,
        min_value=1,
        max_value=744,
        default=24,
        help_text="Duration in hours"
    )
    
    class Meta:
        fields = [
            'planId', 'phoneNumber', 'accessMethod',
            'macAddress', 'routerId', 'durationHours'
        ]
    
    def validate_phoneNumber(self, value):
        """Validate phone number"""
        try:
            from authentication.models.validators import PhoneValidation
            if not PhoneValidation.is_valid_kenyan_phone(value):
                raise serializers.ValidationError('Invalid phone number format')
            
            return PhoneValidation.normalize_kenyan_phone(value)
        except ImportError:
            # Basic validation if authentication app not available
            if len(value) < 10:
                raise serializers.ValidationError('Invalid phone number')
            return value
    
    def validate_macAddress(self, value):
        """Validate MAC address"""
        if value:
            import re
            mac_pattern = re.compile(r'^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$')
            if not mac_pattern.match(value):
                raise serializers.ValidationError('Invalid MAC address format')
        return value


class PaymentCallbackSerializer(serializers.Serializer):
    """Serializer for payment callbacks"""
    
    # Required fields
    reference = serializers.CharField(
        required=True,
        max_length=100,
        help_text="Payment reference"
    )
    status = serializers.ChoiceField(
        choices=[('completed', 'Completed'), ('failed', 'Failed'), ('pending', 'Pending')],
        required=True,
        help_text="Payment status"
    )
    subscriptionId = serializers.UUIDField(
        required=True,
        help_text="Subscription ID"
    )
    
    # Optional fields
    amount = serializers.DecimalField(
        required=False,
        max_digits=10,
        decimal_places=2,
        help_text="Amount paid"
    )
    currency = serializers.CharField(
        required=False,
        default='KES',
        help_text="Currency"
    )
    paymentMethod = serializers.CharField(
        required=False,
        help_text="Payment method"
    )
    
    class Meta:
        fields = [
            'reference', 'status', 'subscriptionId',
            'amount', 'currency', 'paymentMethod'
        ]