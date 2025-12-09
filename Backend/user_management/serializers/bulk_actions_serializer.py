


from rest_framework import serializers
from user_management.models.bulk_actions_model import MessageTemplate, BulkActionLog, UserImportFile
from user_management.models.sms_automation_model import SMSAutomationSettings
from Backend.user_management.models.client_model import Client, CommunicationLog
from account.models.admin_model import Client
from django.contrib.auth import get_user_model

User = get_user_model()

class MessageTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = MessageTemplate
        fields = ['id', 'name', 'message', 'created_at']


class BulkActionLogSerializer(serializers.ModelSerializer):
    action_type_display = serializers.CharField(source='get_action_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    duration = serializers.SerializerMethodField()

    class Meta:
        model = BulkActionLog
        fields = ['id', 'action_type', 'action_type_display', 'message_type', 'total_users', 
                  'success_count', 'failed_count', 'status', 'status_display', 'created_at', 
                  'completed_at', 'duration', 'errors', 'scheduled_for']

    def get_duration(self, obj):
        if obj.completed_at and obj.created_at:
            return (obj.completed_at - obj.created_at).total_seconds()
        return None


class BulkUserSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    phone_number = serializers.CharField(source='user.phone_number', read_only=True)
    status = serializers.SerializerMethodField()
    status_display = serializers.SerializerMethodField()
    plan_name = serializers.SerializerMethodField()

    class Meta:
        model = Client
        fields = ['id', 'username', 'phone_number', 'plan_name', 'status', 'status_display']

    def get_status(self, obj):
        return 'active' if obj.user.is_active else 'inactive'

    def get_status_display(self, obj):
        return 'Active' if obj.user.is_active else 'Inactive'

    def get_plan_name(self, obj):
        try:
            active_subscription = obj.subscriptions.filter(is_active=True).first()
            return active_subscription.internet_plan.name if active_subscription and active_subscription.internet_plan else 'No Plan'
        except AttributeError:
            return 'No Plan'


class UserImportFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserImportFile
        fields = ['id', 'file', 'original_filename', 'uploaded_at', 'processed']