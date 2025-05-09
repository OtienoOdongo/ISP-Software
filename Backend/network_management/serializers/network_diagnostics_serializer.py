# # diagnostics/serializers.py
# from rest_framework import serializers
# from network_management.models.network_diagnostics_model import DiagnosticTest, SpeedTestResult, HealthCheckResult
# from network_management.serializers.router_management_serializer import RouterSerializer

# class SpeedTestResultSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = SpeedTestResult
#         fields = '__all__'

# class HealthCheckResultSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = HealthCheckResult
#         fields = '__all__'

# class DiagnosticTestSerializer(serializers.ModelSerializer):
#     router = RouterSerializer(read_only=True)
#     speed_test = SpeedTestResultSerializer(read_only=True)
#     health_check = HealthCheckResultSerializer(read_only=True)
    
#     class Meta:
#         model = DiagnosticTest
#         fields = '__all__'
#         read_only_fields = ['started_at', 'completed_at']

# class DiagnosticTestCreateSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = DiagnosticTest
#         fields = '__all__'
#         extra_kwargs = {
#             'router': {'required': True},
#             'test_type': {'required': True},
#         }

#     def validate(self, data):
#         # Validate target for certain test types
#         if data['test_type'] in ['ping', 'traceroute', 'dns', 'packet_loss'] and not data.get('target'):
#             raise serializers.ValidationError({"target": "This field is required for the selected test type"})
#         return data




# from rest_framework import serializers
# from network_management.models.network_diagnostics_model import DiagnosticTest, SpeedTestHistory
# from network_management.models.ip_address_model import IPAddress
# from network_management.serializers.ip_address_serializer import IPAddressSerializer
# from network_management.serializers.router_management_serializer import RouterSerializer
# from account.serializers.admin_serializer import ClientSerializer

# class DiagnosticTestSerializer(serializers.ModelSerializer):
#     router = RouterSerializer(read_only=True)
#     client_ip = IPAddressSerializer(read_only=True)

#     class Meta:
#         model = DiagnosticTest
#         fields = '__all__'
#         read_only_fields = ['created_at', 'updated_at', 'status', 'result']

# class DiagnosticTestCreateSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = DiagnosticTest
#         fields = ['router', 'test_type', 'target', 'client_ip']
#         extra_kwargs = {
#             'router': {'required': True},
#             'test_type': {'required': True},
#         }

#     def validate(self, data):
#         import ipaddress
#         if data.get('target'):
#             try:
#                 ipaddress.ip_address(data['target'])
#             except ValueError:
#                 # Validate as domain if not IP
#                 from django.core.validators import URLValidator
#                 from urllib.parse import urlparse
#                 parsed = urlparse(data['target'] if data['target'].startswith('http') else f'http://{data["target"]}')
#                 domain = parsed.netloc or data['target']
#                 domain_validator = URLValidator()
#                 domain_validator(f'http://{domain}')
#         return data

# class SpeedTestHistorySerializer(serializers.ModelSerializer):
#     router = RouterSerializer(read_only=True)
#     client_ip = IPAddressSerializer(read_only=True)

#     class Meta:
#         model = SpeedTestHistory
#         fields = '__all__'
#         read_only_fields = ['timestamp']





# from rest_framework import serializers
# from network_management.models.network_diagnostics_model import DiagnosticTest, SpeedTestHistory
# from network_management.models.ip_address_model import IPAddress
# from network_management.serializers.ip_address_serializer import IPAddressSerializer
# from network_management.serializers.router_management_serializer import RouterSerializer

# class DiagnosticTestSerializer(serializers.ModelSerializer):
#     router = RouterSerializer(read_only=True)
#     client_ip = IPAddressSerializer(read_only=True)

#     class Meta:
#         model = DiagnosticTest
#         fields = '__all__'
#         read_only_fields = ['created_at', 'updated_at', 'status', 'result']

# class DiagnosticTestCreateSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = DiagnosticTest
#         fields = ['router', 'test_type', 'target', 'client_ip']
#         extra_kwargs = {
#             'router': {'required': True},
#             'test_type': {'required': True},
#         }

#     def validate(self, data):
#         import ipaddress
#         if data.get('target'):
#             try:
#                 ipaddress.ip_address(data['target'])
#             except ValueError:
#                 from django.core.validators import URLValidator
#                 from urllib.parse import urlparse
#                 parsed = urlparse(data['target'] if data['target'].startswith('http') else f'http://{data["target"]}')
#                 domain = parsed.netloc or data['target']
#                 domain_validator = URLValidator()
#                 domain_validator(f'http://{domain}')
#         return data

# class SpeedTestHistorySerializer(serializers.ModelSerializer):
#     router = RouterSerializer(read_only=True)
#     client_ip = IPAddressSerializer(read_only=True)

#     class Meta:
#         model = SpeedTestHistory
#         fields = '__all__'
#         read_only_fields = ['timestamp']









from rest_framework import serializers
from decimal import Decimal
from network_management.models.network_diagnostics_model import DiagnosticTest, SpeedTestHistory
from network_management.models.ip_address_model import IPAddress
from network_management.serializers.ip_address_serializer import IPAddressSerializer
from network_management.serializers.router_management_serializer import RouterSerializer
from network_management.models.router_management_model import Router

class DiagnosticTestSerializer(serializers.ModelSerializer):
    router = RouterSerializer(read_only=True)
    client_ip = IPAddressSerializer(read_only=True)

    class Meta:
        model = DiagnosticTest
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'status', 'result']

class DiagnosticTestCreateSerializer(serializers.ModelSerializer):
    router_id = serializers.IntegerField(write_only=True)
    client_ip_id = serializers.IntegerField(write_only=True, allow_null=True, required=False)

    class Meta:
        model = DiagnosticTest
        fields = ['router_id', 'test_type', 'target', 'client_ip_id']
        extra_kwargs = {
            'router_id': {'required': True},
            'test_type': {'required': True},
        }

    def validate(self, data):
        import ipaddress
        from django.core.validators import URLValidator
        from urllib.parse import urlparse

        # Validate router_id
        router_id = data.get('router_id')
        if not Router.objects.filter(id=router_id).exists():
            raise serializers.ValidationError({"router_id": "Router does not exist."})

        # Validate client_ip_id
        client_ip_id = data.get('client_ip_id')
        if client_ip_id and not IPAddress.objects.filter(id=client_ip_id).exists():
            raise serializers.ValidationError({"client_ip_id": "Client IP does not exist."})

        # Validate target
        target = data.get('target')
        if target:
            try:
                ipaddress.ip_address(target)
            except ValueError:
                parsed = urlparse(target if target.startswith('http') else f'http://{target}')
                domain = parsed.netloc or target
                try:
                    URLValidator()(f'http://{domain}')
                except:
                    raise serializers.ValidationError({"target": "Invalid target domain or IP."})

        return data

    def create(self, validated_data):
        router_id = validated_data.pop('router_id')
        client_ip_id = validated_data.pop('client_ip_id', None)
        router = Router.objects.get(id=router_id)
        client_ip = IPAddress.objects.get(id=client_ip_id) if client_ip_id else None
        return DiagnosticTest.objects.create(
            router=router, client_ip=client_ip, **validated_data
        )

class SpeedTestHistorySerializer(serializers.ModelSerializer):
    router = RouterSerializer(read_only=True)
    client_ip = IPAddressSerializer(read_only=True)
    download = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=Decimal('0'), required=False)
    upload = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=Decimal('0'), required=False)
    client_download = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=Decimal('0'), required=False)
    client_upload = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=Decimal('0'), required=False)
    latency = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=Decimal('0'), required=False)
    jitter = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=Decimal('0'), required=False)

    class Meta:
        model = SpeedTestHistory
        fields = '__all__'
        read_only_fields = ['timestamp']