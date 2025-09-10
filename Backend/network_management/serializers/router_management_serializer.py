




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





# network_management/serializers/router_management_serializer.py
from rest_framework import serializers
from network_management.models.router_management_model import Router, RouterStats, HotspotUser
from account.serializers.admin_serializer import ClientSerializer
from internet_plans.serializers.create_plan_serializers import InternetPlanSerializer
from payments.serializers.payment_config_serializer import TransactionSerializer

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

