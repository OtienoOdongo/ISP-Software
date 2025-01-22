# serializers.py
from rest_framework import serializers
from ..models import Router

class RouterSerializer(serializers.ModelSerializer):
    """
    Serializer for the Router model:
    
    - Converts Router model instances to and from native Python datatypes.
    - Includes specific fields from the Router model.
    - Can be extended to include custom fields or methods if needed.
    """
    class Meta:
        model = Router
        fields = ['name', 'ip_address', 'username', 'password', 'version',
                   'status', 'uptime', 'bandwidth']