# from rest_framework import serializers
# from user_management.models.plan_model import (
#     PlanAnalyticsSnapshot,
#     ClientAnalytics,
#     SMSNotification,
#     DataUsageThreshold
# )
# from account.serializers.admin_serializer import ClientSerializer
# from internet_plans.serializers.create_plan_serializers import InternetPlanSerializer
# from network_management.serializers.router_management_serializer import HotspotUserSerializer

# class DataUsageThresholdSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = DataUsageThreshold
#         fields = '__all__'
#         read_only_fields = ['created_at', 'updated_at']

# class PlanAnalyticsSnapshotSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = PlanAnalyticsSnapshot
#         fields = '__all__'
#         read_only_fields = ['timestamp']

# class ClientAnalyticsSerializer(serializers.ModelSerializer):
#     client = ClientSerializer(read_only=True)
#     plan = InternetPlanSerializer(read_only=True)
#     hotspot_user = HotspotUserSerializer(read_only=True)
    
#     class Meta:
#         model = ClientAnalytics
#         fields = '__all__'
#         read_only_fields = ['timestamp']

# class SMSNotificationSerializer(serializers.ModelSerializer):
#     client = ClientSerializer(read_only=True)
#     plan = InternetPlanSerializer(source='client.current_plan', read_only=True)
    
#     class Meta:
#         model = SMSNotification
#         fields = '__all__'
#         read_only_fields = ['created_at']

# class SMSSendSerializer(serializers.Serializer):
#     client_ids = serializers.ListField(
#         child=serializers.IntegerField(),
#         required=True
#     )
#     message_type = serializers.ChoiceField(
#         choices=SMSNotification.TRIGGER_CHOICES,
#         required=True
#     )
#     custom_message = serializers.CharField(
#         required=False,
#         allow_blank=True
#     )
#     threshold_percentage = serializers.FloatField(
#         required=False,
#         min_value=0,
#         max_value=100
#     )

#     def validate(self, data):
#         if data['message_type'] == 'MANUAL' and not data.get('custom_message'):
#             raise serializers.ValidationError(
#                 "Custom message is required for manual notifications"
#             )
#         if data['message_type'].startswith('DATA_USAGE_') and not data.get('threshold_percentage'):
#             raise serializers.ValidationError(
#                 "Threshold percentage is required for data usage notifications"
#             )
#         return data

# class ExportReportSerializer(serializers.Serializer):
#     category = serializers.CharField(required=False, allow_blank=True)
#     status = serializers.CharField(required=False, allow_blank=True)
#     usage_threshold = serializers.FloatField(
#         required=False,
#         min_value=0,
#         max_value=100,
#         default=75
#     )
#     date_from = serializers.DateField(required=False)
#     date_to = serializers.DateField(required=False)



# from rest_framework import serializers
# from user_management.models.plan_model import (
#     PlanAnalyticsSnapshot,
#     ClientAnalytics,
#     SMSNotification,
#     DataUsageThreshold,
#     ActionNotification
# )
# from account.serializers.admin_serializer import ClientSerializer
# from internet_plans.serializers.create_plan_serializers import InternetPlanSerializer
# from network_management.serializers.router_management_serializer import HotspotUserSerializer

# class DataUsageThresholdSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = DataUsageThreshold
#         fields = '__all__'
#         read_only_fields = ['created_at', 'updated_at']

# class PlanAnalyticsSnapshotSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = PlanAnalyticsSnapshot
#         fields = '__all__'
#         read_only_fields = ['timestamp']

# class ClientAnalyticsSerializer(serializers.ModelSerializer):
#     client = ClientSerializer(read_only=True)
#     plan = InternetPlanSerializer(read_only=True)
#     hotspot_user = HotspotUserSerializer(read_only=True)
    
#     class Meta:
#         model = ClientAnalytics
#         fields = '__all__'
#         read_only_fields = ['timestamp']

# class SMSNotificationSerializer(serializers.ModelSerializer):
#     client = ClientSerializer(read_only=True)
#     plan = InternetPlanSerializer(source='client.subscriptions__internet_plan', read_only=True)
    
#     class Meta:
#         model = SMSNotification
#         fields = '__all__'
#         read_only_fields = ['created_at', 'sent_at', 'status', 'delivery_status', 'error']

# class SMSSendSerializer(serializers.Serializer):
#     client_ids = serializers.ListField(
#         child=serializers.IntegerField(),
#         required=True
#     )
#     message_type = serializers.ChoiceField(
#         choices=SMSNotification.TRIGGER_CHOICES,
#         required=True
#     )
#     custom_message = serializers.CharField(
#         required=False,
#         allow_blank=True
#     )
#     threshold_percentage = serializers.FloatField(
#         required=False,
#         min_value=0,
#         max_value=100
#     )

#     def validate(self, data):
#         if data['message_type'] == 'MANUAL' and not data.get('custom_message'):
#             raise serializers.ValidationError(
#                 "Custom message is required for manual notifications"
#             )
#         if data['message_type'].startswith('DATA_USAGE_') and not data.get('threshold_percentage'):
#             raise serializers.ValidationError(
#                 "Threshold percentage is required for data usage notifications"
#             )
#         return data

# class ExportReportSerializer(serializers.Serializer):
#     category = serializers.CharField(required=False, allow_blank=True)
#     status = serializers.CharField(required=False, allow_blank=True)
#     usage_threshold = serializers.FloatField(
#         required=False,
#         min_value=0,
#         max_value=100,
#         default=75
#     )
#     date_from = serializers.DateField(required=False)
#     date_to = serializers.DateField(required=False)

# class ActionNotificationSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = ActionNotification
#         fields = ['id', 'message', 'type', 'created_at', 'is_read']
#         read_only_fields = ['created_at']





# from rest_framework import serializers
# from user_management.models.plan_model import (
#     PlanAnalyticsSnapshot,
#     ClientAnalytics,
#     SMSNotification,
#     DataUsageThreshold,
#     ActionNotification
# )
# from account.serializers.admin_serializer import ClientSerializer
# from internet_plans.serializers.create_plan_serializers import InternetPlanSerializer
# from network_management.serializers.router_management_serializer import HotspotUserSerializer

# class DataUsageThresholdSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = DataUsageThreshold
#         fields = '__all__'
#         read_only_fields = ['created_at', 'updated_at']

# class PlanAnalyticsSnapshotSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = PlanAnalyticsSnapshot
#         fields = '__all__'
#         read_only_fields = ['timestamp']

# class ClientAnalyticsSerializer(serializers.ModelSerializer):
#     client = ClientSerializer(read_only=True)
#     plan = InternetPlanSerializer(read_only=True)
#     hotspot_user = HotspotUserSerializer(read_only=True)
    
#     class Meta:
#         model = ClientAnalytics
#         fields = '__all__'
#         read_only_fields = ['timestamp']

# class SMSNotificationSerializer(serializers.ModelSerializer):
#     client = ClientSerializer(read_only=True)
#     plan = InternetPlanSerializer(source='client.current_plan', read_only=True)
    
#     class Meta:
#         model = SMSNotification
#         fields = '__all__'
#         read_only_fields = ['created_at', 'sent_at', 'status', 'delivery_status', 'error']

# class SMSSendSerializer(serializers.Serializer):
#     client_ids = serializers.ListField(
#         child=serializers.IntegerField(),
#         required=True
#     )
#     message_type = serializers.ChoiceField(
#         choices=SMSNotification.TRIGGER_CHOICES,
#         required=True
#     )
#     custom_message = serializers.CharField(
#         required=False,
#         allow_blank=True
#     )

#     def validate(self, data):
#         if data['message_type'] == 'MANUAL' and not data.get('custom_message'):
#             raise serializers.ValidationError(
#                 "Custom message is required for manual notifications"
#             )
#         return data

# class ExportReportSerializer(serializers.Serializer):
#     category = serializers.CharField(required=False, allow_blank=True)
#     status = serializers.CharField(required=False, allow_blank=True)
#     usage_threshold = serializers.FloatField(
#         required=False,
#         min_value=0,
#         max_value=100,
#         default=75
#     )
#     date_from = serializers.DateField(required=False)
#     date_to = serializers.DateField(required=False)

# class ActionNotificationSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = ActionNotification
#         fields = ['id', 'message', 'type', 'created_at', 'is_read', 'client']
#         read_only_fields = ['created_at']





from rest_framework import serializers
from user_management.models.plan_model import (
    PlanAnalyticsSnapshot,
    ClientAnalytics,
    SMSNotification,
    DataUsageThreshold,
    ActionNotification
)
from account.serializers.admin_serializer import ClientSerializer
from internet_plans.serializers.create_plan_serializers import InternetPlanSerializer
from network_management.serializers.router_management_serializer import HotspotUserSerializer

class DataUsageThresholdSerializer(serializers.ModelSerializer):
    class Meta:
        model = DataUsageThreshold
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']

class PlanAnalyticsSnapshotSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlanAnalyticsSnapshot
        fields = '__all__'
        read_only_fields = ['timestamp']

class ClientAnalyticsSerializer(serializers.ModelSerializer):
    client = ClientSerializer(read_only=True)
    plan = InternetPlanSerializer(read_only=True)
    hotspot_user = HotspotUserSerializer(read_only=True)
    
    class Meta:
        model = ClientAnalytics
        fields = '__all__'
        read_only_fields = ['timestamp']

class SMSNotificationSerializer(serializers.ModelSerializer):
    client = ClientSerializer(read_only=True)
    plan = InternetPlanSerializer(source='client.current_plan', read_only=True)
    
    class Meta:
        model = SMSNotification
        fields = '__all__'
        read_only_fields = ['created_at', 'sent_at', 'status', 'delivery_status', 'error']

class SMSSendSerializer(serializers.Serializer):
    client_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=True
    )
    message_type = serializers.ChoiceField(
        choices=SMSNotification.TRIGGER_CHOICES,
        required=True
    )
    custom_message = serializers.CharField(
        required=False,
        allow_blank=True
    )

    def validate(self, data):
        if data['message_type'] == 'MANUAL' and not data.get('custom_message'):
            raise serializers.ValidationError(
                "Custom message is required for manual notifications"
            )
        return data

class ExportReportSerializer(serializers.Serializer):
    category = serializers.CharField(required=False, allow_blank=True)
    status = serializers.CharField(required=False, allow_blank=True)
    usage_threshold = serializers.FloatField(
        required=False,
        min_value=0,
        max_value=100,
        default=75
    )
    date_from = serializers.DateField(required=False)
    date_to = serializers.DateField(required=False)

class ActionNotificationSerializer(serializers.ModelSerializer):
    client = ClientSerializer(read_only=True)
    
    class Meta:
        model = ActionNotification
        fields = ['id', 'message', 'type', 'created_at', 'is_read', 'client']
        read_only_fields = ['created_at']