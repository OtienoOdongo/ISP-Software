from rest_framework import serializers
from network_management.models.router_management_model import Router

class RouterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Router
        fields = ['id', 'name', 'host', 'user', 'ssh_key', 'ssh_pub_key', 'port', 'status', 'uptime', 'version', 'bandwidth', 'cpu_usage', 'active_clients', 'created_at', 'updated_at']
        read_only_fields = ['id', 'ssh_key', 'ssh_pub_key', 'status', 'uptime', 'version', 'bandwidth', 'cpu_usage', 'active_clients', 'created_at', 'updated_at']