



# # network_management/serializers/router_management_serializer.py
# from rest_framework import serializers
# from network_management.models.router_management_model import Router, RouterStats, HotspotUser
# from account.serializers.admin_serializer import ClientSerializer
# from internet_plans.serializers.create_plan_serializers import InternetPlanSerializer
# from payments.serializers.payment_config_serializer import TransactionSerializer

# class RouterSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Router
#         fields = ["id", "name", "ip", "port", "username", "password", "type", "location", "status", "last_seen", "hotspot_config"]
#         read_only_fields = ["id", "last_seen"]

# class RouterStatsSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = RouterStats
#         fields = ["id", "router", "cpu", "memory", "clients", "uptime", "signal", "temperature", "throughput", "disk", "timestamp"]
#         read_only_fields = ["id", "router", "timestamp"]

# class HotspotUserSerializer(serializers.ModelSerializer):
#     client = ClientSerializer(read_only=True)
#     plan = InternetPlanSerializer(read_only=True)
#     transaction = TransactionSerializer(read_only=True)

#     class Meta:
#         model = HotspotUser
#         fields = ["id", "router", "client", "plan", "transaction", "mac", "ip", "connected_at", "data_used", "active"]
#         read_only_fields = ["id", "router", "connected_at"]





from rest_framework import serializers
from network_management.models.router_management_model import (
    Router, RouterStats, HotspotUser, ActivationAttempt, 
    RouterSessionHistory, RouterHealthCheck
)
from account.serializers.admin_serializer import ClientSerializer
from internet_plans.serializers.create_plan_serializers import InternetPlanSerializer
from payments.serializers.payment_config_serializer import TransactionSerializer

class RouterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Router
        fields = [
            "id", "name", "ip", "port", "username", "password", "type", 
            "location", "status", "last_seen", "hotspot_config", "is_default",
            "captive_portal_enabled", "is_active"
        ]
        read_only_fields = ["id", "last_seen"]
        extra_kwargs = {
            'password': {'write_only': True}
        }

class RouterStatsSerializer(serializers.ModelSerializer):
    class Meta:
        model = RouterStats
        fields = [
            "id", "router", "cpu", "memory", "clients", "uptime", "signal", 
            "temperature", "throughput", "disk", "timestamp"
        ]
        read_only_fields = ["id", "router", "timestamp"]

class HotspotUserSerializer(serializers.ModelSerializer):
    client = ClientSerializer(read_only=True)
    plan = InternetPlanSerializer(read_only=True)
    transaction = TransactionSerializer(read_only=True)
    remaining_time_formatted = serializers.SerializerMethodField()

    class Meta:
        model = HotspotUser
        fields = [
            "id", "router", "client", "plan", "transaction", "mac", "ip", 
            "connected_at", "disconnected_at", "data_used", "active", 
            "latitude", "longitude", "location_data", "session_id", 
            "total_session_time", "remaining_time", "remaining_time_formatted",
            "last_activity"
        ]
        read_only_fields = ["id", "router", "connected_at", "session_id"]

    def get_remaining_time_formatted(self, obj):
        if obj.remaining_time <= 0:
            return "Expired"
        
        hours = obj.remaining_time // 3600
        minutes = (obj.remaining_time % 3600) // 60
        seconds = obj.remaining_time % 60
        
        if hours > 0:
            return f"{hours}h {minutes}m {seconds}s"
        elif minutes > 0:
            return f"{minutes}m {seconds}s"
        else:
            return f"{seconds}s"

class ActivationAttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivationAttempt
        fields = [
            "id", "subscription", "router", "attempted_at", 
            "success", "error_message", "retry_count"
        ]
        read_only_fields = ["id", "attempted_at"]

class RouterSessionHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = RouterSessionHistory
        fields = [
            "id", "hotspot_user", "router", "start_time", "end_time",
            "data_used", "duration", "disconnected_reason"
        ]
        read_only_fields = ["id"]

class RouterHealthCheckSerializer(serializers.ModelSerializer):
    class Meta:
        model = RouterHealthCheck
        fields = [
            "id", "router", "timestamp", "is_online", 
            "response_time", "error_message"
        ]
        read_only_fields = ["id", "timestamp"]