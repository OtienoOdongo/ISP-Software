from rest_framework import serializers
from .models import AutomatedAlert, ScheduledMaintenance, TaskAutomation

class AutomatedAlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = AutomatedAlert
        fields = ['id', 'type', 'message', 'status', 'phone', 'timestamp']


class ScheduledMaintenanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScheduledMaintenance
        fields = ['id', 'title', 'description', 'date', 'status', 'notified']


class TaskAutomationSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskAutomation
        fields = ['id', 'name', 'description', 'status']
