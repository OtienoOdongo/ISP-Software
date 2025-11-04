




# from rest_framework import serializers
# from network_management.models.ip_address_model import IPAddress, Subnet, DHCPLease
# from network_management.serializers.router_management_serializer import RouterSerializer
# from account.serializers.admin_serializer import ClientSerializer
# from django.utils import timezone
# from datetime import timedelta

# class IPAddressSerializer(serializers.ModelSerializer):
#     router = RouterSerializer(read_only=True)
#     assigned_to = ClientSerializer(read_only=True)
    
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













from rest_framework import serializers
from network_management.models.ip_address_model import IPAddress, Subnet, DHCPLease
from network_management.serializers.router_management_serializer import RouterSerializer
from account.serializers.admin_serializer import ClientSerializer
from django.utils import timezone
from datetime import timedelta
import ipaddress

class IPAddressSerializer(serializers.ModelSerializer):
    router = RouterSerializer(read_only=True)
    assigned_to = ClientSerializer(read_only=True)
    is_available = serializers.SerializerMethodField()
    
    class Meta:
        model = IPAddress
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'last_used']

    def get_is_available(self, obj):
        return obj.status == 'available'

class IPAddressCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = IPAddress
        fields = '__all__'
        extra_kwargs = {
            'ip_address': {'required': True},
            'router': {'required': True},
            'subnet': {'required': True},
        }

    def validate(self, data):
        # Validate IP address format
        try:
            ipaddress.ip_address(data['ip_address'])
        except ValueError:
            raise serializers.ValidationError({"ip_address": "Invalid IP address format"})
        
        # Validate subnet format
        if 'subnet' in data:
            try:
                network = ipaddress.ip_network(data['subnet'], strict=False)
                data['subnet'] = str(network)
                
                # Validate IP is within subnet
                ip = ipaddress.ip_address(data['ip_address'])
                if ip not in network:
                    raise serializers.ValidationError({
                        "ip_address": f"IP address {data['ip_address']} is not within subnet {data['subnet']}"
                    })
                    
            except ValueError:
                raise serializers.ValidationError({"subnet": "Invalid subnet format"})
        
        # Check for duplicate IP address
        if IPAddress.objects.filter(ip_address=data['ip_address']).exists():
            raise serializers.ValidationError({"ip_address": "IP address already exists"})
        
        return data

class IPAddressUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = IPAddress
        fields = ['status', 'assigned_to', 'description', 'bandwidth_limit', 'priority']
        
    def validate(self, data):
        if 'status' in data and data['status'] == 'assigned' and not self.instance.assigned_to:
            raise serializers.ValidationError({
                "assigned_to": "Client must be assigned when status is 'assigned'"
            })
        return data

class SubnetSerializer(serializers.ModelSerializer):
    router = RouterSerializer(read_only=True)
    available_ips_count = serializers.SerializerMethodField()
    used_ips_count = serializers.SerializerMethodField()

    class Meta:
        model = Subnet
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']

    def get_available_ips_count(self, obj):
        return len(obj.get_available_ips())

    def get_used_ips_count(self, obj):
        try:
            network = ipaddress.ip_network(f"{obj.network_address}/{obj.netmask}")
            return IPAddress.objects.filter(
                router=obj.router,
                subnet=str(network)
            ).count()
        except ValueError:
            return 0

    def validate(self, data):
        import ipaddress
        try:
            network = ipaddress.ip_network(f"{data['network_address']}/{data['netmask']}", strict=False)
            data['network_address'] = str(network.network_address)
            data['netmask'] = str(network.prefixlen)
        except ValueError:
            raise serializers.ValidationError({"network_address": "Invalid network address or netmask"})
        
        # Check for duplicate subnet on same router
        if Subnet.objects.filter(
            router=data['router'],
            network_address=data['network_address'],
            netmask=data['netmask']
        ).exists():
            raise serializers.ValidationError("Subnet already exists for this router")
            
        return data

class DHCPLeaseSerializer(serializers.ModelSerializer):
    ip_address = IPAddressSerializer(read_only=True)
    client = ClientSerializer(read_only=True)
    is_expired = serializers.SerializerMethodField()

    class Meta:
        model = DHCPLease
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'expires_at']

    def get_is_expired(self, obj):
        return obj.is_expired()

    def validate(self, data):
        from django.core.validators import RegexValidator
        mac_validator = RegexValidator(
            regex=r'^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$',
            message="Invalid MAC address format"
        )
        mac_validator(data['mac_address'])
        
        # Calculate expiration time
        data['expires_at'] = timezone.now() + timedelta(seconds=data.get('lease_time', 3600))
        
        return data