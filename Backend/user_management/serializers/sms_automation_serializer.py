

# from rest_framework import serializers
# from user_management.models.sms_automation_model import SMSTrigger, SMSAutomationSettings, SMSAnalytics
# from user_management.models.user_model import CommunicationLog
# from django.db.models import Count, Q, Avg, Case, When, FloatField, F, ExpressionWrapper
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












# sms_automation_serializers.py
from rest_framework import serializers
from user_management.models.sms_automation_model import (
    SMSTrigger, 
    SMSAutomationSettings, 
    SMSAnalytics, 
    ScheduledMessage
)
from user_management.models.user_model import CommunicationLog
from account.models.admin_model import Client
from internet_plans.models.create_plan_models import Subscription
from payments.models.payment_config_model import Transaction
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
    can_send_now = serializers.SerializerMethodField()

    class Meta:
        model = SMSAutomationSettings
        fields = [
            'id', 'enabled', 'sms_gateway', 'sms_gateway_display', 'api_key', 'username',
            'sender_id', 'send_time_start', 'send_time_end', 'max_messages_per_day',
            'low_balance_alert', 'balance_threshold', 'sms_balance', 'last_updated', 'can_send_now'
        ]
        extra_kwargs = {
            'api_key': {'write_only': True},
            'username': {'write_only': True},
        }

    def get_can_send_now(self, obj):
        return obj.can_send_message()


class SMSAnalyticsSerializer(serializers.ModelSerializer):
    success_rate = serializers.ReadOnlyField()
    date_formatted = serializers.SerializerMethodField()

    class Meta:
        model = SMSAnalytics
        fields = [
            'id', 'date', 'date_formatted', 'total_messages', 'successful_messages', 
            'failed_messages', 'active_triggers', 'success_rate'
        ]

    def get_date_formatted(self, obj):
        return obj.date.strftime('%Y-%m-%d') if obj.date else None


class ScheduledMessageSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    client_name = serializers.CharField(source='client.user.username', read_only=True)
    client_email = serializers.CharField(source='client.user.email', read_only=True)
    trigger_name = serializers.CharField(source='trigger.name', read_only=True)
    scheduled_for_formatted = serializers.SerializerMethodField()
    sent_at_formatted = serializers.SerializerMethodField()
    created_at_formatted = serializers.SerializerMethodField()

    class Meta:
        model = ScheduledMessage
        fields = [
            'id', 'trigger', 'trigger_name', 'client', 'client_name', 'client_email',
            'message', 'scheduled_for', 'scheduled_for_formatted', 'status', 'status_display',
            'created_at', 'created_at_formatted', 'sent_at', 'sent_at_formatted'
        ]

    def get_scheduled_for_formatted(self, obj):
        return obj.scheduled_for.strftime('%Y-%m-%d %H:%M') if obj.scheduled_for else None

    def get_sent_at_formatted(self, obj):
        return obj.sent_at.strftime('%Y-%m-%d %H:%M') if obj.sent_at else None

    def get_created_at_formatted(self, obj):
        return obj.created_at.strftime('%Y-%m-%d %H:%M') if obj.created_at else None


class ScheduledMessageCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScheduledMessage
        fields = ['trigger', 'client', 'message', 'scheduled_for', 'status']
        read_only_fields = ['status']

    def validate_scheduled_for(self, value):
        if value <= timezone.now():
            raise serializers.ValidationError("Scheduled time must be in the future.")
        return value


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


class SMSTriggerCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SMSTrigger
        fields = [
            'name', 'trigger_type', 'threshold', 'days_before', 'event', 
            'message', 'enabled'
        ]

    def validate(self, data):
        trigger_type = data.get('trigger_type')
        threshold = data.get('threshold')
        days_before = data.get('days_before')
        event = data.get('event')

        # Validate data usage trigger
        if trigger_type == 'data_usage' and not threshold:
            raise serializers.ValidationError({
                'threshold': 'Threshold is required for data usage alerts.'
            })

        # Validate plan expiry trigger
        if trigger_type == 'plan_expiry' and not days_before:
            raise serializers.ValidationError({
                'days_before': 'Days before is required for plan expiry warnings.'
            })

        # Validate onboarding trigger
        if trigger_type == 'onboarding' and not event:
            raise serializers.ValidationError({
                'event': 'Event is required for onboarding messages.'
            })

        return data


class SMSAutomationSettingsUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SMSAutomationSettings
        fields = [
            'enabled', 'sms_gateway', 'api_key', 'username', 'sender_id',
            'send_time_start', 'send_time_end', 'max_messages_per_day',
            'low_balance_alert', 'balance_threshold', 'sms_balance'
        ]
        extra_kwargs = {
            'api_key': {'write_only': True},
            'username': {'write_only': True},
        }


class SMSDashboardSerializer(serializers.Serializer):
    total_messages_today = serializers.IntegerField()
    success_rate_today = serializers.FloatField()
    active_triggers = serializers.IntegerField()
    pending_scheduled_messages = serializers.IntegerField()
    sms_balance = serializers.IntegerField()
    gateway_status = serializers.CharField()


class ClientSMSSummarySerializer(serializers.Serializer):
    client_id = serializers.IntegerField()
    client_name = serializers.CharField()
    total_messages_received = serializers.IntegerField()
    last_message_date = serializers.DateTimeField(allow_null=True)
    message_types = serializers.DictField()