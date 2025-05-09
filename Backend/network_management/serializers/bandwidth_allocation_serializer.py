# from rest_framework import serializers
# from network_management.models.bandwidth_allocation_model import BandwidthAllocation, BandwidthUsageHistory, QoSProfile
# from account.serializers.admin_serializer import ClientSerializer
# from internet_plans.serializers.create_plan_serializers import InternetPlanSerializer
# from payments.serializers.mpesa_config_serializer import TransactionSerializer

# class QoSProfileSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = QoSProfile
#         fields = '__all__'

# class BandwidthUsageHistorySerializer(serializers.ModelSerializer):
#     class Meta:
#         model = BandwidthUsageHistory
#         fields = '__all__'

# class BandwidthAllocationSerializer(serializers.ModelSerializer):
#     client = ClientSerializer(read_only=True)
#     plan = InternetPlanSerializer(read_only=True)
#     transaction = TransactionSerializer(read_only=True)
#     usage_history = BandwidthUsageHistorySerializer(many=True, read_only=True)
#     qos_profile = QoSProfileSerializer(read_only=True)
    
#     class Meta:
#         model = BandwidthAllocation
#         fields = '__all__'
#         read_only_fields = ['used_bandwidth', 'last_used', 'created_at', 'updated_at']

# class BandwidthAllocationCreateSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = BandwidthAllocation
#         fields = '__all__'
#         extra_kwargs = {
#             'client': {'required': True},
#             'ip_address': {'required': True},
#             'mac_address': {'required': True},
#         }

#     def validate(self, data):
#         # Validate MAC address format
#         import re
#         if not re.match("[0-9a-f]{2}([-:]?)[0-9a-f]{2}(\\1[0-9a-f]{2}){4}$", data['mac_address'].lower()):
#             raise serializers.ValidationError({"mac_address": "Invalid MAC address format"})
#         return data





from rest_framework import serializers
from network_management.models.bandwidth_allocation_model import BandwidthAllocation, BandwidthUsageHistory, QoSProfile
from account.serializers.admin_serializer import ClientSerializer
from internet_plans.serializers.create_plan_serializers import InternetPlanSerializer
from payments.serializers.mpesa_config_serializer import TransactionSerializer


class QoSProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = QoSProfile
        fields = ['id', 'name', 'priority', 'max_bandwidth', 'min_bandwidth', 'burst_limit', 'description']


class BandwidthUsageHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = BandwidthUsageHistory
        fields = ['id', 'timestamp', 'bytes_used', 'duration']


class BandwidthAllocationSerializer(serializers.ModelSerializer):
    client = ClientSerializer(read_only=True)
    plan = InternetPlanSerializer(read_only=True)
    transaction = TransactionSerializer(read_only=True)
    usage_history = BandwidthUsageHistorySerializer(many=True, read_only=True)
    qos_profile = QoSProfileSerializer(read_only=True)

    class Meta:
        model = BandwidthAllocation
        fields = [
            'id', 'client', 'plan', 'transaction', 'qos_profile', 'ip_address',
            'mac_address', 'allocated_bandwidth', 'quota', 'used_bandwidth',
            'priority', 'status', 'last_used', 'created_at', 'updated_at'
        ]
        read_only_fields = ['used_bandwidth', 'last_used', 'created_at', 'updated_at']


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
        if not re.match(r"[0-9a-f]{2}([-:]?)[0-9a-f]{2}(\1[0-9a-f]{2}){4}$", data['mac_address'].lower()):
            raise serializers.ValidationError({"mac_address": "Invalid MAC address format"})

        # Validate plan-specific limits
        plan = data.get('plan')
        if plan:
            # Assume data_limit_value is the max bandwidth (e.g., "50" or "Unlimited")
            max_bandwidth = plan.data_limit_value if plan.data_limit_value.lower() != 'unlimited' else float('inf')
            try:
                allocated = data.get('allocated_bandwidth')
                quota = data.get('quota')
                if allocated != 'Unlimited':
                    allocated_value = float(allocated.replace('GB', '').strip())
                    if allocated_value > float(max_bandwidth):
                        raise serializers.ValidationError({
                            'allocated_bandwidth': f"Exceeds plan limit of {max_bandwidth}GB"
                        })
                if quota != 'Unlimited':
                    quota_value = float(quota.replace('GB', '').strip())
                    if quota_value > float(max_bandwidth):
                        raise serializers.ValidationError({
                            'quota': f"Exceeds plan limit of {max_bandwidth}GB"
                        })
            except (ValueError, AttributeError):
                raise serializers.ValidationError({
                    'allocated_bandwidth': "Invalid format (must be 'Unlimited' or '<number>GB')",
                    'quota': "Invalid format (must be 'Unlimited' or '<number>GB')"
                })

        # Validate QoS priority against plan restrictions
        priority = data.get('priority')
        qos_profile = data.get('qos_profile')
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
        if plan and priority not in allowed_priorities.get(plan.category, ['medium']):
            raise serializers.ValidationError({
                'priority': f"Invalid QoS priority for {plan.category} plan"
            })

        return data