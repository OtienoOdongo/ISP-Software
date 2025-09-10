from rest_framework import serializers
from user_management.models.bulk_actions_model import MessageTemplate, BulkActionLog, UserImportFile
from user_management.models.user_model import Client
from user_management.serializers.user_serializer import ClientProfileSerializer
from django.contrib.auth.models import User

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
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    plan_name = serializers.CharField(source='subscription.internet_plan.name', read_only=True)
    location = serializers.CharField(source='get_location', read_only=True)

    class Meta:
        model = Client
        fields = ['id', 'username', 'phone_number', 'plan_name', 'status', 'status_display', 'location']


class UserImportFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserImportFile
        fields = ['id', 'file', 'original_filename', 'uploaded_at', 'processed']