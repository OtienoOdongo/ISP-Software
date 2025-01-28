from rest_framework import serializers
from reporting.models.usage_report import UsageReport

class UsageReportSerializer(serializers.ModelSerializer):
    """
    Serializer for the UsageReport model to convert model 
    instances to/from native Python datatypes.
    """
    class Meta:
        model = UsageReport
        fields = ['month', 'used_data', 'remaining_data', 'active_users',
                   'inactive_users', 'network_performance']