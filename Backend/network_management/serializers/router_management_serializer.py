# from rest_framework import serializers
# from network_management.models.router_management_model import Router, RouterStats, HotspotUser

# class RouterSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Router
#         fields = ["id", "name", "ip", "port", "username", "password", "type", "location", "status", "last_seen", "hotspot_config"]
#         read_only_fields = ["id", "last_seen"]  # Prevent modification of these fields via API

#     def validate_ip(self, value):
#         """Ensure the IP address is valid."""
#         if not value:
#             raise serializers.ValidationError("IP address is required.")
#         return value

#     def validate_port(self, value):
#         """Ensure the port is within a valid range."""
#         if not (1 <= value <= 65535):
#             raise serializers.ValidationError("Port must be between 1 and 65535.")
#         return value

# class RouterStatsSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = RouterStats
#         fields = ["id", "router", "cpu", "memory", "clients", "uptime", "signal", "temperature", "throughput", "disk", "timestamp"]
#         read_only_fields = ["id", "router", "timestamp"]  # Prevent modification of these fields via API

# class HotspotUserSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = HotspotUser
#         fields = ["id", "router", "name", "mac", "ip", "plan", "connected_at", "data_used"]
#         read_only_fields = ["id", "router", "connected_at"]  # Prevent modification of these fields via API

#     def validate_mac(self, value):
#         """Ensure the MAC address is in a valid format."""
#         import re
#         if not re.match(r"^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$", value):
#             raise serializers.ValidationError("Invalid MAC address format. Use XX:XX:XX:XX:XX:XX or XX-XX-XX-XX-XX-XX.")
#         return value






from rest_framework import serializers
from network_management.models.router_management_model import Router, RouterStats, HotspotUser
from account.serializers.admin_serializer import ClientSerializer
from internet_plans.serializers.create_plan_serializers import InternetPlanSerializer
from payments.serializers.mpesa_config_serializer import TransactionSerializer

class RouterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Router
        fields = ["id", "name", "ip", "port", "username", "password", "type", "location", "status", "last_seen", "hotspot_config"]
        read_only_fields = ["id", "last_seen"]

class RouterStatsSerializer(serializers.ModelSerializer):
    class Meta:
        model = RouterStats
        fields = ["id", "router", "cpu", "memory", "clients", "uptime", "signal", "temperature", "throughput", "disk", "timestamp"]
        read_only_fields = ["id", "router", "timestamp"]

class HotspotUserSerializer(serializers.ModelSerializer):
    client = ClientSerializer(read_only=True)
    plan = InternetPlanSerializer(read_only=True)
    transaction = TransactionSerializer(read_only=True)

    class Meta:
        model = HotspotUser
        fields = ["id", "router", "client", "plan", "transaction", "mac", "ip", "connected_at", "data_used", "active"]
        read_only_fields = ["id", "router", "connected_at"]