



# from rest_framework import serializers
# from network_management.models.bandwidth_allocation_model import BandwidthAllocation, BandwidthUsageHistory, QoSProfile
# from account.serializers.admin_serializer import ClientSerializer
# from internet_plans.serializers.create_plan_serializers import InternetPlanSerializer
# from payments.serializers.payment_config_serializer import TransactionSerializer


# class QoSProfileSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = QoSProfile
#         fields = ['id', 'name', 'priority', 'max_bandwidth', 'min_bandwidth', 'burst_limit', 'description']


# class BandwidthUsageHistorySerializer(serializers.ModelSerializer):
#     class Meta:
#         model = BandwidthUsageHistory
#         fields = ['id', 'timestamp', 'bytes_used', 'duration']


# class BandwidthAllocationSerializer(serializers.ModelSerializer):
#     client = ClientSerializer(read_only=True)
#     plan = InternetPlanSerializer(read_only=True)
#     transaction = TransactionSerializer(read_only=True)
#     usage_history = BandwidthUsageHistorySerializer(many=True, read_only=True)
#     qos_profile = QoSProfileSerializer(read_only=True)

#     class Meta:
#         model = BandwidthAllocation
#         fields = [
#             'id', 'client', 'plan', 'transaction', 'qos_profile', 'ip_address',
#             'mac_address', 'allocated_bandwidth', 'quota', 'used_bandwidth',
#             'priority', 'status', 'last_used', 'created_at', 'updated_at'
#         ]
#         read_only_fields = ['used_bandwidth', 'last_used', 'created_at', 'updated_at']


# class BandwidthAllocationCreateSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = BandwidthAllocation
#         fields = [
#             'client', 'plan', 'transaction', 'qos_profile', 'ip_address',
#             'mac_address', 'allocated_bandwidth', 'quota', 'priority', 'status'
#         ]
#         extra_kwargs = {
#             'client': {'required': True},
#             'ip_address': {'required': True},
#             'mac_address': {'required': True},
#             'allocated_bandwidth': {'required': True},
#             'quota': {'required': True}
#         }

#     def validate(self, data):
#         """
#         Validate MAC address, bandwidth, quota, and plan-specific constraints.
#         """
#         import re
#         # Validate MAC address format
#         if not re.match(r"[0-9a-f]{2}([-:]?)[0-9a-f]{2}(\1[0-9a-f]{2}){4}$", data['mac_address'].lower()):
#             raise serializers.ValidationError({"mac_address": "Invalid MAC address format"})

#         # Validate plan-specific limits
#         plan = data.get('plan')
#         if plan:
#             # Assume data_limit_value is the max bandwidth (e.g., "50" or "Unlimited")
#             max_bandwidth = plan.data_limit_value if plan.data_limit_value.lower() != 'unlimited' else float('inf')
#             try:
#                 allocated = data.get('allocated_bandwidth')
#                 quota = data.get('quota')
#                 if allocated != 'Unlimited':
#                     allocated_value = float(allocated.replace('GB', '').strip())
#                     if allocated_value > float(max_bandwidth):
#                         raise serializers.ValidationError({
#                             'allocated_bandwidth': f"Exceeds plan limit of {max_bandwidth}GB"
#                         })
#                 if quota != 'Unlimited':
#                     quota_value = float(quota.replace('GB', '').strip())
#                     if quota_value > float(max_bandwidth):
#                         raise serializers.ValidationError({
#                             'quota': f"Exceeds plan limit of {max_bandwidth}GB"
#                         })
#             except (ValueError, AttributeError):
#                 raise serializers.ValidationError({
#                     'allocated_bandwidth': "Invalid format (must be 'Unlimited' or '<number>GB')",
#                     'quota': "Invalid format (must be 'Unlimited' or '<number>GB')"
#                 })

#         # Validate QoS priority against plan restrictions
#         priority = data.get('priority')
#         qos_profile = data.get('qos_profile')
#         if qos_profile and qos_profile.priority != priority:
#             raise serializers.ValidationError({
#                 'priority': f"Must match QoS profile priority ({qos_profile.priority})"
#             })

#         # Define allowed priorities per plan category
#         allowed_priorities = {
#             'Residential': ['medium', 'low'],
#             'Business': ['high', 'medium'],
#             'Promotional': ['medium'],
#             'Enterprise': ['high', 'medium', 'low']
#         }
#         if plan and priority not in allowed_priorities.get(plan.category, ['medium']):
#             raise serializers.ValidationError({
#                 'priority': f"Invalid QoS priority for {plan.category} plan"
#             })

#         return data









from rest_framework import serializers
from network_management.models.bandwidth_allocation_model import (
    BandwidthAllocation, BandwidthUsageHistory, QoSProfile
)
from account.serializers.admin_serializer import ClientSerializer
from internet_plans.serializers.plan_serializers import InternetPlanSerializer
from payments.serializers.payment_config_serializer import TransactionSerializer
import re

class QoSProfileSerializer(serializers.ModelSerializer):
    max_bandwidth_mbps = serializers.SerializerMethodField()
    min_bandwidth_mbps = serializers.SerializerMethodField()
    
    class Meta:
        model = QoSProfile
        fields = [
            'id', 'name', 'priority', 'max_bandwidth', 'min_bandwidth', 
            'burst_limit', 'description', 'is_active', 'max_bandwidth_mbps',
            'min_bandwidth_mbps', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_max_bandwidth_mbps(self, obj):
        return obj.get_max_bandwidth_mbps()

    def get_min_bandwidth_mbps(self, obj):
        return obj.get_min_bandwidth_mbps()

    def validate_name(self, value):
        """Validate QoS profile name uniqueness"""
        if self.instance and self.instance.name == value:
            return value
            
        if QoSProfile.objects.filter(name=value).exists():
            raise serializers.ValidationError("QoS profile with this name already exists")
        return value

class BandwidthUsageHistorySerializer(serializers.ModelSerializer):
    usage_gb = serializers.SerializerMethodField()
    
    class Meta:
        model = BandwidthUsageHistory
        fields = [
            'id', 'timestamp', 'bytes_used', 'duration', 'peak_bandwidth',
            'average_bandwidth', 'usage_gb'
        ]
        read_only_fields = ['timestamp']

    def get_usage_gb(self, obj):
        return obj.get_usage_gb()

class BandwidthAllocationSerializer(serializers.ModelSerializer):
    client = ClientSerializer(read_only=True)
    plan = InternetPlanSerializer(read_only=True)
    transaction = TransactionSerializer(read_only=True)
    qos_profile = QoSProfileSerializer(read_only=True)
    usage_history = BandwidthUsageHistorySerializer(many=True, read_only=True)
    usage_percentage = serializers.SerializerMethodField()
    remaining_quota = serializers.SerializerMethodField()
    is_over_quota = serializers.SerializerMethodField()
    allocated_gb = serializers.SerializerMethodField()
    quota_gb = serializers.SerializerMethodField()

    class Meta:
        model = BandwidthAllocation
        fields = [
            'id', 'client', 'plan', 'transaction', 'qos_profile', 'ip_address',
            'mac_address', 'allocated_bandwidth', 'quota', 'used_bandwidth',
            'priority', 'status', 'last_used', 'created_at', 'updated_at',
            'usage_history', 'usage_percentage', 'remaining_quota', 
            'is_over_quota', 'allocated_gb', 'quota_gb'
        ]
        read_only_fields = [
            'used_bandwidth', 'last_used', 'created_at', 'updated_at',
            'usage_percentage', 'remaining_quota', 'is_over_quota'
        ]

    def get_usage_percentage(self, obj):
        return obj.get_usage_percentage()

    def get_remaining_quota(self, obj):
        return obj.get_remaining_quota()

    def get_is_over_quota(self, obj):
        return obj.is_over_quota()

    def get_allocated_gb(self, obj):
        return obj.get_allocated_gb()

    def get_quota_gb(self, obj):
        return obj.get_quota_gb()

class BandwidthAllocationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = BandwidthAllocation
        fields = [
            'client', 'plan', 'transaction', 'qos_profile', 'ip_address',
            'mac_address', 'allocated_bandwidth', 'quota', 'priority', 'status'
        ]
        extra_kwargs = {
            'client': {'required': True},
            'ip_address': {'required': True},
            'mac_address': {'required': True},
            'allocated_bandwidth': {'required': True},
            'quota': {'required': True}
        }

    def validate(self, data):
        """
        Validate MAC address, bandwidth, quota, and plan-specific constraints.
        """
        import re
        
        # Validate MAC address format
        if not re.match(r'^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$', data['mac_address'].lower()):
            raise serializers.ValidationError({"mac_address": "Invalid MAC address format"})

        # Validate bandwidth formats
        if not self._is_valid_bandwidth_format(data['allocated_bandwidth']):
            raise serializers.ValidationError({
                'allocated_bandwidth': "Invalid format (must be 'Unlimited' or '<number>GB')"
            })
            
        if not self._is_valid_bandwidth_format(data['quota']):
            raise serializers.ValidationError({
                'quota': "Invalid format (must be 'Unlimited' or '<number>GB')"
            })

        # Validate plan-specific limits
        plan = data.get('plan')
        if plan:
            self._validate_plan_limits(data, plan)

        # Validate QoS priority constraints
        self._validate_qos_priority(data)

        return data

    def _is_valid_bandwidth_format(self, bandwidth_str):
        """Validate bandwidth format"""
        if bandwidth_str.lower() == 'unlimited':
            return True
            
        try:
            if bandwidth_str.upper().endswith('GB'):
                float(bandwidth_str.upper().replace('GB', '').strip())
                return True
        except (ValueError, AttributeError):
            pass
            
        return False

    def _validate_plan_limits(self, data, plan):
        """Validate allocation against plan limits"""
        # Get plan data limit
        plan_limit = self._get_plan_data_limit(plan)
        
        # Check allocated bandwidth against plan limit
        allocated = data.get('allocated_bandwidth')
        if allocated != 'Unlimited':
            try:
                allocated_value = float(allocated.replace('GB', '').strip())
                if allocated_value > plan_limit:
                    raise serializers.ValidationError({
                        'allocated_bandwidth': f"Exceeds plan limit of {plan_limit}GB"
                    })
            except (ValueError, AttributeError):
                pass

        # Check quota against plan limit
        quota = data.get('quota')
        if quota != 'Unlimited':
            try:
                quota_value = float(quota.replace('GB', '').strip())
                if quota_value > plan_limit:
                    raise serializers.ValidationError({
                        'quota': f"Exceeds plan limit of {plan_limit}GB"
                    })
            except (ValueError, AttributeError):
                pass

    def _get_plan_data_limit(self, plan):
        """Extract data limit from plan"""
        try:
            if hasattr(plan, 'data_limit') and plan.data_limit:
                if plan.data_limit.value.lower() == 'unlimited':
                    return float('inf')
                return float(plan.data_limit.value)
        except (AttributeError, ValueError):
            pass
        return float('inf')

    def _validate_qos_priority(self, data):
        """Validate QoS priority constraints"""
        priority = data.get('priority')
        qos_profile = data.get('qos_profile')
        
        # Validate QoS profile priority match
        if qos_profile and qos_profile.priority != priority:
            raise serializers.ValidationError({
                'priority': f"Must match QoS profile priority ({qos_profile.priority})"
            })

        # Define allowed priorities per plan category
        allowed_priorities = {
            'Residential': ['medium', 'low'],
            'Business': ['high', 'medium'],
            'Promotional': ['medium'],
            'Enterprise': ['high', 'medium', 'low']
        }
        
        plan = data.get('plan')
        if plan and plan.category in allowed_priorities:
            if priority not in allowed_priorities[plan.category]:
                raise serializers.ValidationError({
                    'priority': f"Invalid QoS priority for {plan.category} plan"
                })

class BandwidthAllocationUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = BandwidthAllocation
        fields = [
            'allocated_bandwidth', 'quota', 'priority', 'status', 'qos_profile'
        ]

    def validate(self, data):
        """Validate update constraints"""
        # Prevent setting inactive status if over quota
        if 'status' in data and data['status'] == 'inactive':
            if self.instance and self.instance.is_over_quota():
                raise serializers.ValidationError({
                    'status': "Cannot set to inactive while over quota"
                })
        return data