# from rest_framework import serializers
# from user_management.models.sms_automation_model import SMSTrigger, SMSAutomationSettings, SMSAnalytics
# from user_management.models.user_model import CommunicationLog
# from django.db.models import Count, Q, Avg
# from django.utils import timezone
# from datetime import timedelta

# class SMSTriggerSerializer(serializers.ModelSerializer):
#     success_rate = serializers.ReadOnlyField()
#     trigger_type_display = serializers.CharField(source='get_trigger_type_display', read_only=True)
#     event_display = serializers.CharField(source='get_event_display', read_only=True, allow_null=True)
#     last_triggered_formatted = serializers.SerializerMethodField()

#     class Meta:
#         model = SMSTrigger
#         fields = [
#             'id', 'name', 'trigger_type', 'trigger_type_display', 'threshold', 'days_before',
#             'event', 'event_display', 'message', 'enabled', 'created_at', 'last_triggered',
#             'last_triggered_formatted', 'sent_count', 'success_count', 'success_rate'
#         ]

#     def get_last_triggered_formatted(self, obj):
#         return obj.last_triggered.strftime('%Y-%m-%d %H:%M') if obj.last_triggered else 'Never'


# class SMSAutomationSettingsSerializer(serializers.ModelSerializer):
#     sms_gateway_display = serializers.CharField(source='get_sms_gateway_display', read_only=True)

#     class Meta:
#         model = SMSAutomationSettings
#         fields = [
#             'id', 'enabled', 'sms_gateway', 'sms_gateway_display', 'api_key', 'username',
#             'sender_id', 'send_time_start', 'send_time_end', 'max_messages_per_day',
#             'low_balance_alert', 'balance_threshold', 'sms_balance', 'last_updated'
#         ]


# class SMSAnalyticsSerializer(serializers.ModelSerializer):
#     success_rate = serializers.ReadOnlyField()

#     class Meta:
#         model = SMSAnalytics
#         fields = ['date', 'total_messages', 'successful_messages', 'failed_messages', 'active_triggers', 'success_rate']


# class TriggerPerformanceSerializer(serializers.Serializer):
#     id = serializers.IntegerField()
#     name = serializers.CharField()
#     type = serializers.CharField()
#     sent = serializers.IntegerField()
#     success_rate = serializers.FloatField()
#     last_triggered = serializers.DateTimeField(allow_null=True)


# class MessageTypeAnalyticsSerializer(serializers.Serializer):
#     message_type = serializers.CharField()
#     count = serializers.IntegerField()
#     success_rate = serializers.FloatField()








from rest_framework import serializers
from user_management.models.sms_automation_model import SMSTrigger, SMSAutomationSettings, SMSAnalytics
from user_management.models.user_model import CommunicationLog
from django.db.models import Count, Q, Avg, Case, When, FloatField, F, ExpressionWrapper
from django.utils import timezone
from datetime import timedelta

class SMSTriggerSerializer(serializers.ModelSerializer):
    success_rate = serializers.ReadOnlyField()
    trigger_type_display = serializers.CharField(source='get_trigger_type_display', read_only=True)
    event_display = serializers.CharField(source='get_event_display', read_only=True, allow_null=True)
    last_triggered_formatted = serializers.SerializerMethodField()

    class Meta:
        model = SMSTrigger
        fields = [
            'id', 'name', 'trigger_type', 'trigger_type_display', 'threshold', 'days_before',
            'event', 'event_display', 'message', 'enabled', 'created_at', 'last_triggered',
            'last_triggered_formatted', 'sent_count', 'success_count', 'success_rate'
        ]

    def get_last_triggered_formatted(self, obj):
        return obj.last_triggered.strftime('%Y-%m-%d %H:%M') if obj.last_triggered else 'Never'


class SMSAutomationSettingsSerializer(serializers.ModelSerializer):
    sms_gateway_display = serializers.CharField(source='get_sms_gateway_display', read_only=True)

    class Meta:
        model = SMSAutomationSettings
        fields = [
            'id', 'enabled', 'sms_gateway', 'sms_gateway_display', 'api_key', 'username',
            'sender_id', 'send_time_start', 'send_time_end', 'max_messages_per_day',
            'low_balance_alert', 'balance_threshold', 'sms_balance', 'last_updated'
        ]


class SMSAnalyticsSerializer(serializers.ModelSerializer):
    success_rate = serializers.ReadOnlyField()

    class Meta:
        model = SMSAnalytics
        fields = ['date', 'total_messages', 'successful_messages', 'failed_messages', 'active_triggers', 'success_rate']


class TriggerPerformanceSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    type = serializers.CharField()
    sent = serializers.IntegerField()
    success_rate = serializers.FloatField()
    last_triggered = serializers.DateTimeField(allow_null=True)


class MessageTypeAnalyticsSerializer(serializers.Serializer):
    message_type = serializers.CharField()
    count = serializers.IntegerField()
    success_rate = serializers.FloatField()