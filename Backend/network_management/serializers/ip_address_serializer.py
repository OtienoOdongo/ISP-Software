# # ip_management/serializers.py
# from rest_framework import serializers
# from network_management.models.ip_address_model import IPAddress, Subnet, DHCPLease
# from network_management.serializers.router_management_serializer import RouterSerializer
# from account.serializers.admin_serializer import ClientSerializer

# class SubnetSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Subnet
#         fields = '__all__'

# class DHCPLeaseSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = DHCPLease
#         fields = '__all__'

# class IPAddressSerializer(serializers.ModelSerializer):
#     router = RouterSerializer(read_only=True)
#     assigned_to = ClientSerializer(read_only=True)
#     dhcp_leases = DHCPLeaseSerializer(many=True, read_only=True)
    
#     class Meta:
#         model = IPAddress
#         fields = '__all__'
#         read_only_fields = ['created_at', 'updated_at']

# class IPAddressCreateSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = IPAddress
#         fields = '__all__'
#         extra_kwargs = {
#             'ip_address': {'required': True},
#             'router': {'required': True},
#         }

#     def validate(self, data):
#         # Validate IP address format
#         import ipaddress
#         try:
#             ipaddress.ip_address(data['ip_address'])
#         except ValueError:
#             raise serializers.ValidationError({"ip_address": "Invalid IP address format"})
        
#         # Validate subnet format
#         if 'subnet' in data:
#             try:
#                 network = ipaddress.ip_network(data['subnet'], strict=False)
#                 data['subnet'] = str(network)
#             except ValueError:
#                 raise serializers.ValidationError({"subnet": "Invalid subnet format"})
        
#         return data



# from rest_framework import serializers
# from network_management.models.ip_address_model import IPAddress, Subnet, DHCPLease
# from network_management.serializers.router_management_serializer import RouterSerializer
# from account.serializers.admin_serializer import ClientSerializer
# from django.utils import timezone
# from datetime import timedelta
# class SubnetSerializer(serializers.ModelSerializer):
#     router = RouterSerializer(read_only=True)

#     class Meta:
#         model = Subnet
#         fields = '__all__'
#         read_only_fields = ['created_at', 'updated_at']

#     def validate(self, data):
#         import ipaddress
#         try:
#             network = ipaddress.ip_network(f"{data['network_address']}/{data['netmask']}", strict=False)
#             data['network_address'] = str(network.network_address)
#             data['netmask'] = str(network.netmask)
#         except ValueError:
#             raise serializers.ValidationError({"network_address": "Invalid network address or netmask"})
#         return data

# class DHCPLeaseSerializer(serializers.ModelSerializer):
#     ip_address = IPAddressSerializer(read_only=True)
#     client = ClientSerializer(read_only=True)

#     class Meta:
#         model = DHCPLease
#         fields = '__all__'
#         read_only_fields = ['created_at', 'updated_at', 'expires_at']

#     def validate(self, data):
#         from django.core.validators import RegexValidator
#         mac_validator = RegexValidator(
#             regex=r'^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$',
#             message="Invalid MAC address format"
#         )
#         mac_validator(data['mac_address'])
#         data['expires_at'] = timezone.now() + timedelta(seconds=data.get('lease_time', 3600))
#         return data
# class IPAddressSerializer(serializers.ModelSerializer):
#     router = RouterSerializer(read_only=True)
#     assigned_to = ClientSerializer(read_only=True)
#     dhcp_leases = DHCPLeaseSerializer(many=True, read_only=True)
    
#     class Meta:
#         model = IPAddress
#         fields = '__all__'
#         read_only_fields = ['created_at', 'updated_at']

# class IPAddressCreateSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = IPAddress
#         fields = '__all__'
#         extra_kwargs = {
#             'ip_address': {'required': True},
#             'router': {'required': True},
#         }

#     def validate(self, data):
#         import ipaddress
#         try:
#             ipaddress.ip_address(data['ip_address'])
#         except ValueError:
#             raise serializers.ValidationError({"ip_address": "Invalid IP address format"})
        
#         if 'subnet' in data:
#             try:
#                 network = ipaddress.ip_network(data['subnet'], strict=False)
#                 data['subnet'] = str(network)
#             except ValueError:
#                 raise serializers.ValidationError({"subnet": "Invalid subnet format"})
        
#         return data






from rest_framework import serializers
from network_management.models.ip_address_model import IPAddress, Subnet, DHCPLease
from network_management.serializers.router_management_serializer import RouterSerializer
from account.serializers.admin_serializer import ClientSerializer
from django.utils import timezone
from datetime import timedelta

class IPAddressSerializer(serializers.ModelSerializer):
    router = RouterSerializer(read_only=True)
    assigned_to = ClientSerializer(read_only=True)
    
    class Meta:
        model = IPAddress
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']

class IPAddressCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = IPAddress
        fields = '__all__'
        extra_kwargs = {
            'ip_address': {'required': True},
            'router': {'required': True},
        }

    def validate(self, data):
        import ipaddress
        try:
            ipaddress.ip_address(data['ip_address'])
        except ValueError:
            raise serializers.ValidationError({"ip_address": "Invalid IP address format"})
        
        if 'subnet' in data:
            try:
                network = ipaddress.ip_network(data['subnet'], strict=False)
                data['subnet'] = str(network)
            except ValueError:
                raise serializers.ValidationError({"subnet": "Invalid subnet format"})
        
        return data

class SubnetSerializer(serializers.ModelSerializer):
    router = RouterSerializer(read_only=True)

    class Meta:
        model = Subnet
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']

    def validate(self, data):
        import ipaddress
        try:
            network = ipaddress.ip_network(f"{data['network_address']}/{data['netmask']}", strict=False)
            data['network_address'] = str(network.network_address)
            data['netmask'] = str(network.netmask)
        except ValueError:
            raise serializers.ValidationError({"network_address": "Invalid network address or netmask"})
        return data

class DHCPLeaseSerializer(serializers.ModelSerializer):
    ip_address = IPAddressSerializer(read_only=True)
    client = ClientSerializer(read_only=True)

    class Meta:
        model = DHCPLease
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'expires_at']

    def validate(self, data):
        from django.core.validators import RegexValidator
        mac_validator = RegexValidator(
            regex=r'^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$',
            message="Invalid MAC address format"
        )
        mac_validator(data['mac_address'])
        data['expires_at'] = timezone.now() + timedelta(seconds=data.get('lease_time', 3600))
        return data