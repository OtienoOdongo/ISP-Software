

# from rest_framework import serializers
# from decimal import Decimal
# from network_management.models.network_diagnostics_model import DiagnosticTest, SpeedTestHistory
# from network_management.models.ip_address_model import IPAddress
# from network_management.serializers.ip_address_serializer import IPAddressSerializer
# from network_management.serializers.router_management_serializer import RouterSerializer
# from network_management.models.router_management_model import Router

# class DiagnosticTestSerializer(serializers.ModelSerializer):
#     router = RouterSerializer(read_only=True)
#     client_ip = IPAddressSerializer(read_only=True)

#     class Meta:
#         model = DiagnosticTest
#         fields = '__all__'
#         read_only_fields = ['created_at', 'updated_at', 'status', 'result']

# class DiagnosticTestCreateSerializer(serializers.ModelSerializer):
#     router_id = serializers.IntegerField(write_only=True)
#     client_ip_id = serializers.IntegerField(write_only=True, allow_null=True, required=False)

#     class Meta:
#         model = DiagnosticTest
#         fields = ['router_id', 'test_type', 'target', 'client_ip_id']
#         extra_kwargs = {
#             'router_id': {'required': True},
#             'test_type': {'required': True},
#         }

#     def validate(self, data):
#         import ipaddress
#         from django.core.validators import URLValidator
#         from urllib.parse import urlparse

#         # Validate router_id
#         router_id = data.get('router_id')
#         if not Router.objects.filter(id=router_id).exists():
#             raise serializers.ValidationError({"router_id": "Router does not exist."})

#         # Validate client_ip_id
#         client_ip_id = data.get('client_ip_id')
#         if client_ip_id and not IPAddress.objects.filter(id=client_ip_id).exists():
#             raise serializers.ValidationError({"client_ip_id": "Client IP does not exist."})

#         # Validate target
#         target = data.get('target')
#         if target:
#             try:
#                 ipaddress.ip_address(target)
#             except ValueError:
#                 parsed = urlparse(target if target.startswith('http') else f'http://{target}')
#                 domain = parsed.netloc or target
#                 try:
#                     URLValidator()(f'http://{domain}')
#                 except:
#                     raise serializers.ValidationError({"target": "Invalid target domain or IP."})

#         return data

#     def create(self, validated_data):
#         router_id = validated_data.pop('router_id')
#         client_ip_id = validated_data.pop('client_ip_id', None)
#         router = Router.objects.get(id=router_id)
#         client_ip = IPAddress.objects.get(id=client_ip_id) if client_ip_id else None
#         return DiagnosticTest.objects.create(
#             router=router, client_ip=client_ip, **validated_data
#         )

# class SpeedTestHistorySerializer(serializers.ModelSerializer):
#     router = RouterSerializer(read_only=True)
#     client_ip = IPAddressSerializer(read_only=True)
#     download = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=Decimal('0'), required=False)
#     upload = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=Decimal('0'), required=False)
#     client_download = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=Decimal('0'), required=False)
#     client_upload = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=Decimal('0'), required=False)
#     latency = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=Decimal('0'), required=False)
#     jitter = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=Decimal('0'), required=False)

#     class Meta:
#         model = SpeedTestHistory
#         fields = '__all__'
#         read_only_fields = ['timestamp']









from rest_framework import serializers
from decimal import Decimal
from network_management.models.network_diagnostics_model import (
    DiagnosticTest, SpeedTestHistory, NetworkAlert
)
from network_management.models.ip_address_model import IPAddress
from network_management.serializers.ip_address_serializer import IPAddressSerializer
from network_management.serializers.router_management_serializer import RouterSerializer
from network_management.models.router_management_model import Router
import ipaddress
from urllib.parse import urlparse

class DiagnosticTestSerializer(serializers.ModelSerializer):
    router = RouterSerializer(read_only=True)
    client_ip = IPAddressSerializer(read_only=True)
    test_description = serializers.SerializerMethodField()
    formatted_duration = serializers.SerializerMethodField()

    class Meta:
        model = DiagnosticTest
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'status', 'result', 'error_message', 'duration']

    def get_test_description(self, obj):
        return obj.get_test_description()

    def get_formatted_duration(self, obj):
        if obj.duration:
            return f"{obj.duration:.3f}s"
        return None

class DiagnosticTestCreateSerializer(serializers.ModelSerializer):
    router_id = serializers.IntegerField(write_only=True)
    client_ip_id = serializers.IntegerField(write_only=True, allow_null=True, required=False)
    test_mode = serializers.CharField(max_length=20, required=False, default='standard')

    class Meta:
        model = DiagnosticTest
        fields = ['router_id', 'test_type', 'target', 'client_ip_id', 'test_mode']
        extra_kwargs = {
            'router_id': {'required': True},
            'test_type': {'required': True},
        }

    def validate(self, data):
        from django.core.validators import URLValidator

        # Validate router_id
        router_id = data.get('router_id')
        if not Router.objects.filter(id=router_id).exists():
            raise serializers.ValidationError({"router_id": "Router does not exist."})

        # Validate client_ip_id
        client_ip_id = data.get('client_ip_id')
        if client_ip_id and not IPAddress.objects.filter(id=client_ip_id).exists():
            raise serializers.ValidationError({"client_ip_id": "Client IP does not exist."})

        # Validate target based on test type
        target = data.get('target')
        test_type = data.get('test_type')

        if test_type in ['ping', 'traceroute', 'dns', 'packet_loss', 'port_scan'] and not target:
            raise serializers.ValidationError({"target": "Target is required for this test type."})

        if target:
            # Validate target format
            try:
                ipaddress.ip_address(target)
            except ValueError:
                # Try to parse as URL/domain
                try:
                    parsed = urlparse(target if target.startswith(('http://', 'https://')) else f'http://{target}')
                    domain = parsed.netloc or target
                    URLValidator()(f'http://{domain}')
                except:
                    raise serializers.ValidationError({"target": "Invalid target domain or IP address."})

        # Validate test mode
        test_mode = data.get('test_mode')
        if test_mode and test_mode not in ['quick', 'standard', 'comprehensive']:
            raise serializers.ValidationError({"test_mode": "Invalid test mode."})

        return data

    def create(self, validated_data):
        router_id = validated_data.pop('router_id')
        client_ip_id = validated_data.pop('client_ip_id', None)
        test_mode = validated_data.pop('test_mode', 'standard')
        
        router = Router.objects.get(id=router_id)
        client_ip = IPAddress.objects.get(id=client_ip_id) if client_ip_id else None
        
        return DiagnosticTest.objects.create(
            router=router, 
            client_ip=client_ip,
            **validated_data
        )

class SpeedTestHistorySerializer(serializers.ModelSerializer):
    router = RouterSerializer(read_only=True)
    client_ip = IPAddressSerializer(read_only=True)
    download_efficiency = serializers.SerializerMethodField()
    upload_efficiency = serializers.SerializerMethodField()
    formatted_timestamp = serializers.SerializerMethodField()

    class Meta:
        model = SpeedTestHistory
        fields = '__all__'
        read_only_fields = ['timestamp']

    def get_download_efficiency(self, obj):
        return obj.download_efficiency

    def get_upload_efficiency(self, obj):
        return obj.upload_efficiency

    def get_formatted_timestamp(self, obj):
        return obj.timestamp.strftime('%Y-%m-%d %H:%M:%S')

    def validate_download(self, value):
        if value and value < 0:
            raise serializers.ValidationError("Download speed cannot be negative.")
        return value

    def validate_upload(self, value):
        if value and value < 0:
            raise serializers.ValidationError("Upload speed cannot be negative.")
        return value

    def validate_latency(self, value):
        if value and value < 0:
            raise serializers.ValidationError("Latency cannot be negative.")
        return value

    def validate_jitter(self, value):
        if value and value < 0:
            raise serializers.ValidationError("Jitter cannot be negative.")
        return value

    def validate_packet_loss(self, value):
        if value and (value < 0 or value > 100):
            raise serializers.ValidationError("Packet loss must be between 0 and 100.")
        return value

class NetworkAlertSerializer(serializers.ModelSerializer):
    router = RouterSerializer(read_only=True)
    related_test = DiagnosticTestSerializer(read_only=True)
    formatted_created_at = serializers.SerializerMethodField()
    formatted_resolved_at = serializers.SerializerMethodField()

    class Meta:
        model = NetworkAlert
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']

    def get_formatted_created_at(self, obj):
        return obj.created_at.strftime('%Y-%m-%d %H:%M:%S')

    def get_formatted_resolved_at(self, obj):
        return obj.resolved_at.strftime('%Y-%m-%d %H:%M:%S') if obj.resolved_at else None

class BulkTestRequestSerializer(serializers.Serializer):
    router_id = serializers.IntegerField(required=True)
    target = serializers.CharField(required=True)
    client_ip_id = serializers.IntegerField(required=False, allow_null=True)
    test_types = serializers.ListField(
        child=serializers.ChoiceField(choices=DiagnosticTest.TEST_TYPES),
        required=True
    )
    test_mode = serializers.CharField(max_length=20, required=False, default='standard')

    def validate(self, data):
        # Validate router exists
        if not Router.objects.filter(id=data['router_id']).exists():
            raise serializers.ValidationError({"router_id": "Router does not exist."})

        # Validate client IP exists if provided
        client_ip_id = data.get('client_ip_id')
        if client_ip_id and not IPAddress.objects.filter(id=client_ip_id).exists():
            raise serializers.ValidationError({"client_ip_id": "Client IP does not exist."})

        # Validate target
        target = data['target']
        try:
            ipaddress.ip_address(target)
        except ValueError:
            try:
                from django.core.validators import URLValidator
                parsed = urlparse(target if target.startswith(('http://', 'https://')) else f'http://{target}')
                domain = parsed.netloc or target
                URLValidator()(f'http://{domain}')
            except:
                raise serializers.ValidationError({"target": "Invalid target domain or IP address."})

        return data