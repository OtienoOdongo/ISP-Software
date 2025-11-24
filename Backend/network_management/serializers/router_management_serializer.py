



# """
# Enhanced Router Management Serializers

# This module provides comprehensive serializers for router management with
# connection testing, dynamic SSID support, and configuration status tracking.
# """

# from rest_framework import serializers
# from network_management.models.router_management_model import (
#     Router, RouterStats, HotspotUser, PPPoEUser, ActivationAttempt, 
#     RouterSessionHistory, RouterHealthCheck, RouterCallbackConfig,
#     RouterAuditLog, BulkOperation, HotspotConfiguration, PPPoEConfiguration,
#     RouterConnectionTest
# )
# from account.serializers.admin_serializer import ClientSerializer
# from payments.serializers.payment_config_serializer import TransactionSerializer
# from django.utils import timezone
# from datetime import timedelta
# from django.core.cache import cache
# import logging

# logger = logging.getLogger(__name__)


# # NEW: Router Connection Test Serializer
# class RouterConnectionTestSerializer(serializers.ModelSerializer):
#     """Serializer for router connection test results."""
    
#     router_name = serializers.CharField(source='router.name', read_only=True)
#     router_ip = serializers.CharField(source='router.ip', read_only=True)
#     tested_by_username = serializers.CharField(source='tested_by.username', read_only=True, allow_null=True)
#     tested_by_email = serializers.CharField(source='tested_by.email', read_only=True, allow_null=True)
    
#     # Computed fields
#     system_model = serializers.SerializerMethodField()
#     system_version = serializers.SerializerMethodField()
#     test_duration = serializers.SerializerMethodField()
#     error_summary = serializers.SerializerMethodField()

#     class Meta:
#         model = RouterConnectionTest
#         fields = [
#             "id", "router", "router_name", "router_ip", "success", "response_time",
#             "system_info", "system_model", "system_version", "error_messages", 
#             "error_summary", "tested_at", "tested_by", "tested_by_username", 
#             "tested_by_email", "test_duration"
#         ]
#         read_only_fields = ["id", "tested_at"]

#     def get_system_model(self, obj):
#         """Extract system model from system_info."""
#         return obj.system_info.get('board-name', 'Unknown') if obj.system_info else 'Unknown'

#     def get_system_version(self, obj):
#         """Extract system version from system_info."""
#         return obj.system_info.get('version', 'Unknown') if obj.system_info else 'Unknown'

#     def get_test_duration(self, obj):
#         """Calculate how long ago the test was performed."""
#         if not obj.tested_at:
#             return "Unknown"
        
#         duration = timezone.now() - obj.tested_at
#         if duration.days > 0:
#             return f"{duration.days} days ago"
#         elif duration.seconds > 3600:
#             return f"{duration.seconds // 3600} hours ago"
#         elif duration.seconds > 60:
#             return f"{duration.seconds // 60} minutes ago"
#         else:
#             return f"{duration.seconds} seconds ago"

#     def get_error_summary(self, obj):
#         """Create a summary of error messages."""
#         if not obj.error_messages or len(obj.error_messages) == 0:
#             return "No errors"
        
#         # Return the first error message as summary
#         first_error = obj.error_messages[0]
#         if len(first_error) > 100:
#             return first_error[:100] + "..."
#         return first_error


# # NEW: Router Configuration Template Serializer
# class RouterConfigurationTemplateSerializer(serializers.Serializer):
#     """Serializer for router configuration templates."""
    
#     name = serializers.CharField()
#     display_name = serializers.CharField()
#     description = serializers.CharField()
#     hotspot_config = serializers.DictField(required=False)
#     pppoe_config = serializers.DictField(required=False)
#     recommended_for = serializers.ListField(child=serializers.CharField())
    
#     def validate(self, data):
#         """Validate that at least one configuration type is provided."""
#         if not data.get('hotspot_config') and not data.get('pppoe_config'):
#             raise serializers.ValidationError(
#                 "At least one of hotspot_config or pppoe_config must be provided"
#             )
#         return data


# # Enhanced Hotspot Configuration Serializer
# class HotspotConfigurationSerializer(serializers.ModelSerializer):
#     router_name = serializers.CharField(source='router.name', read_only=True)
#     router_ip = serializers.CharField(source='router.ip', read_only=True)
#     router_connection_status = serializers.CharField(source='router.connection_status', read_only=True)
#     landing_page_url = serializers.SerializerMethodField()
#     auth_method_display = serializers.CharField(source='get_auth_method_display', read_only=True)
    
#     # NEW: Configuration status fields
#     configuration_status = serializers.SerializerMethodField()
#     can_apply_configuration = serializers.SerializerMethodField()
#     last_configuration_status = serializers.SerializerMethodField()
#     configuration_errors_summary = serializers.SerializerMethodField()
    
#     class Meta:
#         model = HotspotConfiguration
#         fields = [
#             'id', 'router', 'router_name', 'router_ip', 'router_connection_status', 'ssid', 'landing_page_file', 
#             'landing_page_url', 'redirect_url', 'bandwidth_limit', 'session_timeout',
#             'auth_method', 'auth_method_display', 'enable_splash_page', 'allow_social_login', 
#             'enable_bandwidth_shaping', 'log_user_activity', 'max_users',
#             'welcome_message', 'terms_conditions_url', 
#             # NEW: Configuration status fields
#             'configuration_applied', 'last_configuration_attempt', 'configuration_errors',
#             'configuration_status', 'can_apply_configuration', 'last_configuration_status',
#             'configuration_errors_summary', 'created_at', 'updated_at'
#         ]
#         read_only_fields = [
#             'id', 'created_at', 'updated_at', 'landing_page_url', 
#             'configuration_applied', 'last_configuration_attempt', 'configuration_errors'
#         ]
    
#     def get_landing_page_url(self, obj):
#         if obj.landing_page_file:
#             return obj.landing_page_file.url
#         return None

#     def get_configuration_status(self, obj):
#         """Get human-readable configuration status."""
#         if obj.configuration_applied:
#             return "Applied Successfully"
#         elif obj.last_configuration_attempt and not obj.configuration_applied:
#             return "Configuration Failed"
#         elif obj.last_configuration_attempt:
#             return "Configuration Attempted"
#         else:
#             return "Not Configured"

#     def get_can_apply_configuration(self, obj):
#         """Check if configuration can be applied to router."""
#         return obj.router.connection_status == 'connected'

#     def get_last_configuration_status(self, obj):
#         """Get details about last configuration attempt."""
#         if not obj.last_configuration_attempt:
#             return "No configuration attempts"
        
#         status = "Success" if obj.configuration_applied else "Failed"
#         time_ago = timezone.now() - obj.last_configuration_attempt
        
#         if time_ago.days > 0:
#             time_str = f"{time_ago.days} days ago"
#         elif time_ago.seconds > 3600:
#             time_str = f"{time_ago.seconds // 3600} hours ago"
#         else:
#             time_str = f"{time_ago.seconds // 60} minutes ago"
        
#         return f"{status} - {time_str}"

#     def get_configuration_errors_summary(self, obj):
#         """Get a summary of configuration errors."""
#         if not obj.configuration_errors:
#             return "No errors"
        
#         if len(obj.configuration_errors) == 1:
#             error = obj.configuration_errors[0]
#             if len(error) > 100:
#                 return error[:100] + "..."
#             return error
        
#         return f"{len(obj.configuration_errors)} errors"

#     def validate_ssid(self, value):
#         """Validate SSID format and uniqueness."""
#         if not value or value.strip() == "":
#             raise serializers.ValidationError("SSID cannot be empty")
        
#         # Check for basic SSID format validation
#         if len(value) > 32:
#             raise serializers.ValidationError("SSID cannot exceed 32 characters")
        
#         # Check for special characters that might cause issues
#         import re
#         if not re.match(r'^[a-zA-Z0-9\-_\.\s]+$', value):
#             raise serializers.ValidationError(
#                 "SSID can only contain letters, numbers, spaces, hyphens, underscores, and periods"
#             )
        
#         return value.strip()


# # Enhanced PPPoE Configuration Serializer
# class PPPoEConfigurationSerializer(serializers.ModelSerializer):
#     router_name = serializers.CharField(source='router.name', read_only=True)
#     router_ip = serializers.CharField(source='router.ip', read_only=True)
#     router_connection_status = serializers.CharField(source='router.connection_status', read_only=True)
#     auth_methods_display = serializers.SerializerMethodField()
#     service_type_display = serializers.SerializerMethodField()
    
#     # NEW: Configuration status fields
#     configuration_status = serializers.SerializerMethodField()
#     can_apply_configuration = serializers.SerializerMethodField()
#     last_configuration_status = serializers.SerializerMethodField()
#     configuration_errors_summary = serializers.SerializerMethodField()
    
#     class Meta:
#         model = PPPoEConfiguration
#         fields = [
#             'id', 'router', 'router_name', 'router_ip', 'router_connection_status', 'ip_pool_name', 'service_name',
#             'mtu', 'dns_servers', 'bandwidth_limit', 'auth_methods', 'auth_methods_display',
#             'enable_pap', 'enable_chap', 'enable_mschap', 'idle_timeout', 'session_timeout',
#             'default_profile', 'interface', 'ip_range_start', 'ip_range_end', 'service_type',
#             'service_type_display',
#             # NEW: Configuration status fields
#             'configuration_applied', 'last_configuration_attempt', 'configuration_errors',
#             'configuration_status', 'can_apply_configuration', 'last_configuration_status',
#             'configuration_errors_summary', 'created_at', 'updated_at'
#         ]
#         read_only_fields = [
#             'id', 'created_at', 'updated_at',
#             'configuration_applied', 'last_configuration_attempt', 'configuration_errors'
#         ]
    
#     def get_auth_methods_display(self, obj):
#         return dict(PPPoEConfiguration.AUTH_METHODS).get(obj.auth_methods, obj.auth_methods)
    
#     def get_service_type_display(self, obj):
#         return dict(PPPoEConfiguration.SERVICE_TYPES).get(obj.service_type, obj.service_type)

#     def get_configuration_status(self, obj):
#         """Get human-readable configuration status."""
#         if obj.configuration_applied:
#             return "Applied Successfully"
#         elif obj.last_configuration_attempt and not obj.configuration_applied:
#             return "Configuration Failed"
#         elif obj.last_configuration_attempt:
#             return "Configuration Attempted"
#         else:
#             return "Not Configured"

#     def get_can_apply_configuration(self, obj):
#         """Check if configuration can be applied to router."""
#         return obj.router.connection_status == 'connected'

#     def get_last_configuration_status(self, obj):
#         """Get details about last configuration attempt."""
#         if not obj.last_configuration_attempt:
#             return "No configuration attempts"
        
#         status = "Success" if obj.configuration_applied else "Failed"
#         time_ago = timezone.now() - obj.last_configuration_attempt
        
#         if time_ago.days > 0:
#             time_str = f"{time_ago.days} days ago"
#         elif time_ago.seconds > 3600:
#             time_str = f"{time_ago.seconds // 3600} hours ago"
#         else:
#             time_str = f"{time_ago.seconds // 60} minutes ago"
        
#         return f"{status} - {time_str}"

#     def get_configuration_errors_summary(self, obj):
#         """Get a summary of configuration errors."""
#         if not obj.configuration_errors:
#             return "No errors"
        
#         if len(obj.configuration_errors) == 1:
#             error = obj.configuration_errors[0]
#             if len(error) > 100:
#                 return error[:100] + "..."
#             return error
        
#         return f"{len(obj.configuration_errors)} errors"

#     def validate_service_name(self, value):
#         """Validate PPPoE service name."""
#         if value and len(value) > 64:
#             raise serializers.ValidationError("Service name cannot exceed 64 characters")
#         return value


# # Enhanced Router Callback Config Serializer
# class RouterCallbackConfigSerializer(serializers.ModelSerializer):
#     event_display = serializers.CharField(source='get_event_display', read_only=True)
#     security_level_display = serializers.CharField(source='get_security_level_display', read_only=True)
#     router_name = serializers.CharField(source='router.name', read_only=True)
#     router_connection_status = serializers.CharField(source='router.connection_status', read_only=True)

#     class Meta:
#         model = RouterCallbackConfig
#         fields = [
#             "id", "router", "router_name", "router_connection_status", "event", "event_display", "callback_url", 
#             "security_level", "security_level_display", "security_profile", "is_active", 
#             "retry_enabled", "max_retries", "timeout_seconds", "created_at", "updated_at"
#         ]
#         read_only_fields = ["id", "created_at", "updated_at"]


# # Enhanced Router Stats Serializer
# class RouterStatsSerializer(serializers.ModelSerializer):
#     router_name = serializers.CharField(source='router.name', read_only=True)
#     router_ip = serializers.CharField(source='router.ip', read_only=True)
#     router_status = serializers.CharField(source='router.status', read_only=True)
#     router_connection_status = serializers.CharField(source='router.connection_status', read_only=True)

#     class Meta:
#         model = RouterStats
#         fields = [
#             "id", "router", "router_name", "router_ip", "router_status", "router_connection_status",
#             "cpu", "memory", "connected_clients_count", "uptime", "signal", "temperature", 
#             "throughput", "disk", "timestamp", "upload_speed", "download_speed", 
#             "hotspot_clients", "pppoe_clients"
#         ]
#         read_only_fields = ["id", "router", "timestamp"]


# # Enhanced Router Health Check Serializer
# class RouterHealthCheckSerializer(serializers.ModelSerializer):
#     router_name = serializers.CharField(source='router.name', read_only=True)
#     router_ip = serializers.CharField(source='router.ip', read_only=True)
#     router_status = serializers.CharField(source='router.status', read_only=True)
#     router_connection_status = serializers.CharField(source='router.connection_status', read_only=True)
#     health_status = serializers.SerializerMethodField()

#     class Meta:
#         model = RouterHealthCheck
#         fields = [
#             "id", "router", "router_name", "router_ip", "router_status", "router_connection_status",
#             "timestamp", "is_online", "response_time", "error_message", "system_metrics", 
#             "health_score", "critical_alerts", "performance_metrics", "health_status"
#         ]
#         read_only_fields = ["id", "timestamp"]

#     def get_health_status(self, obj):
#         if obj.health_score >= 80:
#             return "Excellent"
#         elif obj.health_score >= 60:
#             return "Good"
#         elif obj.health_score >= 40:
#             return "Fair"
#         else:
#             return "Poor"


# # ENHANCED: Main Router Serializer with Connection Management
# class RouterSerializer(serializers.ModelSerializer):
#     callback_configs = RouterCallbackConfigSerializer(many=True, read_only=True)
#     stats = RouterStatsSerializer(many=True, read_only=True)
#     health_checks = RouterHealthCheckSerializer(many=True, read_only=True)
#     hotspot_configurations = HotspotConfigurationSerializer(many=True, read_only=True)
#     pppoe_configurations = PPPoEConfigurationSerializer(many=True, read_only=True)
    
#     # NEW: Connection test data
#     connection_tests = RouterConnectionTestSerializer(many=True, read_only=True)
#     latest_connection_test = serializers.SerializerMethodField()
    
#     active_users_count = serializers.SerializerMethodField()
#     health_score = serializers.SerializerMethodField()
#     system_metrics = serializers.SerializerMethodField()
#     type_display = serializers.CharField(source='get_type_display', read_only=True)
#     status_display = serializers.CharField(source='get_status_display', read_only=True)
    
#     # NEW: Connection status fields
#     connection_status_display = serializers.CharField(source='get_connection_status_display', read_only=True)
#     configuration_status_display = serializers.CharField(source='get_configuration_status_display', read_only=True)
#     connection_quality = serializers.SerializerMethodField()
#     can_configure_hotspot = serializers.SerializerMethodField()
#     can_configure_pppoe = serializers.SerializerMethodField()
    
#     # Related counts
#     hotspot_users_count = serializers.SerializerMethodField()
#     pppoe_users_count = serializers.SerializerMethodField()
#     audit_logs_count = serializers.SerializerMethodField()
    
#     # NEW: Connection test counts
#     connection_tests_count = serializers.SerializerMethodField()
#     successful_connection_tests = serializers.SerializerMethodField()
#     connection_test_success_rate = serializers.SerializerMethodField()

#     class Meta:
#         model = Router
#         fields = [
#             "id", "name", "ip", "port", "username", "password", "type", "type_display",
#             "location", "status", "status_display", 
#             # NEW: Enhanced connection fields
#             "connection_status", "connection_status_display", 
#             "configuration_status", "configuration_status_display",
#             "configuration_type", "configuration_template",
#             "last_connection_test", "last_configuration_update",
#             "average_response_time", "connection_success_rate",
#             # Original fields
#             "last_seen", "is_default", "captive_portal_enabled", "is_active", "callback_url", 
#             "max_clients", "description", "firmware_version", "ssid",
#             "created_at", "updated_at",
#             # Related objects
#             "callback_configs", "stats", "health_checks", "hotspot_configurations", "pppoe_configurations",
#             "connection_tests", "latest_connection_test",
#             # Computed fields
#             "active_users_count", "health_score", "system_metrics",
#             "hotspot_users_count", "pppoe_users_count", "audit_logs_count",
#             "connection_tests_count", "successful_connection_tests", "connection_test_success_rate",
#             "connection_quality", "can_configure_hotspot", "can_configure_pppoe"
#         ]
#         read_only_fields = [
#             "id", "last_seen", "created_at", "updated_at", "active_users_count", 
#             "health_score", "system_metrics", "hotspot_users_count", "pppoe_users_count", 
#             "audit_logs_count", "callback_configs", "stats", "health_checks",
#             "hotspot_configurations", "pppoe_configurations", "connection_tests",
#             "connection_tests_count", "successful_connection_tests", "connection_test_success_rate",
#             "connection_quality", "can_configure_hotspot", "can_configure_pppoe", "latest_connection_test",
#             "connection_status", "configuration_status", "last_connection_test",
#             "average_response_time", "connection_success_rate"
#         ]
#         extra_kwargs = {
#             'password': {'write_only': True}
#         }

#     def get_active_users_count(self, obj):
#         return obj.get_active_users_count()

#     def get_health_score(self, obj):
#         cache_key = f"router:{obj.id}:health"
#         cached_health = cache.get(cache_key)
        
#         if cached_health:
#             return cached_health.get('health_score', 0)
        
#         latest_health = obj.health_checks.order_by('-timestamp').first()
#         return latest_health.health_score if latest_health else 0

#     def get_system_metrics(self, obj):
#         latest_stats = obj.stats.order_by('-timestamp').first()
#         if latest_stats:
#             return {
#                 'cpu': latest_stats.cpu,
#                 'memory': latest_stats.memory,
#                 'clients': latest_stats.connected_clients_count,
#                 'throughput': latest_stats.throughput,
#                 'uptime': latest_stats.uptime,
#                 'upload_speed': latest_stats.upload_speed,
#                 'download_speed': latest_stats.download_speed,
#             }
#         return {}

#     def get_hotspot_users_count(self, obj):
#         return obj.hotspot_users.count()

#     def get_pppoe_users_count(self, obj):
#         return obj.pppoe_users.count()

#     def get_audit_logs_count(self, obj):
#         return obj.audit_logs.count()

#     # NEW: Connection management computed fields
#     def get_connection_tests_count(self, obj):
#         return obj.connection_tests.count()

#     def get_successful_connection_tests(self, obj):
#         return obj.connection_tests.filter(success=True).count()

#     def get_connection_test_success_rate(self, obj):
#         total_tests = self.get_connection_tests_count(obj)
#         successful_tests = self.get_successful_connection_tests(obj)
        
#         if total_tests == 0:
#             return 0
#         return round((successful_tests / total_tests) * 100, 2)

#     def get_latest_connection_test(self, obj):
#         latest_test = obj.connection_tests.order_by('-tested_at').first()
#         if latest_test:
#             return RouterConnectionTestSerializer(latest_test).data
#         return None

#     def get_connection_quality(self, obj):
#         return obj.get_connection_quality()

#     def get_can_configure_hotspot(self, obj):
#         return obj.can_configure_hotspot()

#     def get_can_configure_pppoe(self, obj):
#         return obj.can_configure_pppoe()

#     def validate(self, data):
#         """Validate router data with connection testing support."""
#         # Auto-generate SSID if not provided
#         if not data.get('ssid') and data.get('name'):
#             data['ssid'] = f"{data['name']}-WiFi"
        
#         return data

#     def create(self, validated_data):
#         """Create router and optionally test connection."""
#         # Extract password for potential connection test
#         password = validated_data.get('password')
        
#         # Create the router instance
#         router = super().create(validated_data)
        
#         # Test connection if auto_test is enabled (could be from context)
#         auto_test = self.context.get('auto_test_connection', False)
#         if auto_test and password:
#             try:
#                 # Perform connection test
#                 test_results = router.test_connection()
                
#                 # Update router status based on test results
#                 if test_results.get('system_access'):
#                     router.connection_status = 'connected'
#                     if test_results.get('system_info'):
#                         router.firmware_version = test_results['system_info'].get('version')
#                 else:
#                     router.connection_status = 'disconnected'
                
#                 router.save()
                
#             except Exception as e:
#                 # Log error but don't fail creation
#                 logger.error(f"Auto-connection test failed for new router {router.id}: {str(e)}")
        
#         return router


# # Enhanced Hotspot User Serializer
# class HotspotUserSerializer(serializers.ModelSerializer):
#     client = ClientSerializer(read_only=True)
#     plan = serializers.SerializerMethodField()
#     transaction = TransactionSerializer(read_only=True)
#     router_name = serializers.CharField(source='router.name', read_only=True)
#     router_ip = serializers.CharField(source='router.ip', read_only=True)
#     router_ssid = serializers.CharField(source='router.ssid', read_only=True)
#     router_connection_status = serializers.CharField(source='router.connection_status', read_only=True)
    
#     # Computed fields
#     remaining_time_formatted = serializers.SerializerMethodField()
#     session_duration = serializers.SerializerMethodField()
#     session_duration_seconds = serializers.SerializerMethodField()
#     bandwidth_usage = serializers.SerializerMethodField()
#     quality_of_service_display = serializers.SerializerMethodField()

#     class Meta:
#         model = HotspotUser
#         fields = [
#             "id", "router", "router_name", "router_ip", "router_ssid", "router_connection_status", "client", "plan", "transaction", 
#             "mac", "ip", "connected_at", "disconnected_at", "data_used", "active", 
#             "latitude", "longitude", "location_data", "session_id", 
#             "total_session_time", "remaining_time", "remaining_time_formatted",
#             "last_activity", "session_duration", "session_duration_seconds",
#             "bandwidth_used", "bandwidth_usage", "quality_of_service", "quality_of_service_display",
#             "device_info"
#         ]
#         read_only_fields = [
#             "id", "router", "connected_at", "disconnected_at", "session_id", 
#             "last_activity", "remaining_time_formatted", "session_duration", 
#             "session_duration_seconds", "bandwidth_usage", "quality_of_service_display"
#         ]

#     def get_plan(self, obj):
#         from internet_plans.serializers.create_plan_serializers import InternetPlanSerializer
#         if obj.plan:
#             return InternetPlanSerializer(obj.plan).data
#         return None

#     def get_remaining_time_formatted(self, obj):
#         if obj.remaining_time <= 0:
#             return "Expired"
        
#         hours = obj.remaining_time // 3600
#         minutes = (obj.remaining_time % 3600) // 60
#         seconds = obj.remaining_time % 60
        
#         if hours > 0:
#             return f"{hours}h {minutes}m {seconds}s"
#         elif minutes > 0:
#             return f"{minutes}m {seconds}s"
#         else:
#             return f"{seconds}s"

#     def get_session_duration(self, obj):
#         if obj.active:
#             duration = (timezone.now() - obj.connected_at).total_seconds()
#         else:
#             duration = obj.total_session_time
        
#         hours = int(duration // 3600)
#         minutes = int((duration % 3600) // 60)
#         return f"{hours}h {minutes}m"

#     def get_session_duration_seconds(self, obj):
#         if obj.active:
#             return int((timezone.now() - obj.connected_at).total_seconds())
#         else:
#             return obj.total_session_time

#     def get_bandwidth_usage(self, obj):
#         return {
#             'upload': obj.bandwidth_used.get('upload', 0),
#             'download': obj.bandwidth_used.get('download', 0),
#             'total': obj.data_used
#         }

#     def get_quality_of_service_display(self, obj):
#         quality_map = {
#             "Residential": "Residential",
#             "Business": "Business", 
#             "Promotional": "Promotional",
#             "Enterprise": "Enterprise"
#         }
#         return quality_map.get(obj.quality_of_service, obj.quality_of_service)


# # Enhanced PPPoE User Serializer
# class PPPoEUserSerializer(serializers.ModelSerializer):
#     client = ClientSerializer(read_only=True)
#     plan = serializers.SerializerMethodField()
#     transaction = TransactionSerializer(read_only=True)
#     router_name = serializers.CharField(source='router.name', read_only=True)
#     router_ip = serializers.CharField(source='router.ip', read_only=True)
#     router_service_name = serializers.CharField(source='router.pppoe_configurations.service_name', read_only=True)
#     router_connection_status = serializers.CharField(source='router.connection_status', read_only=True)
    
#     # Computed fields
#     remaining_time_formatted = serializers.SerializerMethodField()
#     session_duration = serializers.SerializerMethodField()
#     session_duration_seconds = serializers.SerializerMethodField()
#     bandwidth_usage = serializers.SerializerMethodField()
#     pppoe_service_type_display = serializers.SerializerMethodField()

#     class Meta:
#         model = PPPoEUser
#         fields = [
#             "id", "router", "router_name", "router_ip", "router_service_name", "router_connection_status", "client", "plan", "transaction", 
#             "username", "password", "service_name", "ip_address", "connected_at", 
#             "disconnected_at", "data_used", "active", "session_id", "total_session_time", 
#             "remaining_time", "remaining_time_formatted", "last_activity", "session_duration",
#             "session_duration_seconds", "bandwidth_used", "bandwidth_usage", 
#             "pppoe_service_type", "pppoe_service_type_display"
#         ]
#         read_only_fields = [
#             "id", "router", "connected_at", "disconnected_at", "session_id", 
#             "last_activity", "remaining_time_formatted", "session_duration",
#             "session_duration_seconds", "bandwidth_usage", "pppoe_service_type_display"
#         ]
#         extra_kwargs = {
#             'password': {'write_only': True}
#         }

#     def get_plan(self, obj):
#         from internet_plans.serializers.create_plan_serializers import InternetPlanSerializer
#         if obj.plan:
#             return InternetPlanSerializer(obj.plan).data
#         return None

#     def get_remaining_time_formatted(self, obj):
#         if obj.remaining_time <= 0:
#             return "Expired"
        
#         hours = obj.remaining_time // 3600
#         minutes = (obj.remaining_time % 3600) // 60
#         seconds = obj.remaining_time % 60
        
#         if hours > 0:
#             return f"{hours}h {minutes}m {seconds}s"
#         elif minutes > 0:
#             return f"{minutes}m {seconds}s"
#         else:
#             return f"{seconds}s"

#     def get_session_duration(self, obj):
#         if obj.active:
#             duration = (timezone.now() - obj.connected_at).total_seconds()
#         else:
#             duration = obj.total_session_time
        
#         hours = int(duration // 3600)
#         minutes = int((duration % 3600) // 60)
#         return f"{hours}h {minutes}m"

#     def get_session_duration_seconds(self, obj):
#         if obj.active:
#             return int((timezone.now() - obj.connected_at).total_seconds())
#         else:
#             return obj.total_session_time

#     def get_bandwidth_usage(self, obj):
#         return {
#             'upload': obj.bandwidth_used.get('upload', 0),
#             'download': obj.bandwidth_used.get('download', 0),
#             'total': obj.data_used
#         }

#     def get_pppoe_service_type_display(self, obj):
#         service_map = {
#             "standard": "Standard",
#             "business": "Business",
#             "premium": "Premium"
#         }
#         return service_map.get(obj.pppoe_service_type, obj.pppoe_service_type)


# # Enhanced Activation Attempt Serializer
# class ActivationAttemptSerializer(serializers.ModelSerializer):
#     router_name = serializers.CharField(source='router.name', read_only=True)
#     router_ip = serializers.CharField(source='router.ip', read_only=True)
#     router_connection_status = serializers.CharField(source='router.connection_status', read_only=True)
#     user_type_display = serializers.CharField(source='get_user_type_display', read_only=True)
#     verification_method_display = serializers.CharField(source='get_verification_method_display', read_only=True)
    
#     # NEW: Connection quality context
#     connection_quality = serializers.SerializerMethodField()
#     router_configuration_status = serializers.CharField(source='router.configuration_status', read_only=True)

#     class Meta:
#         model = ActivationAttempt
#         fields = [
#             "id", "subscription", "router", "router_name", "router_ip", "router_connection_status",
#             "attempted_at", "success", "error_message", "retry_count", "user_type", "user_type_display",
#             "payment_verified", "transaction_reference", "verification_method", "verification_method_display",
#             "connection_quality", "router_configuration_status"
#         ]
#         read_only_fields = ["id", "attempted_at"]

#     def get_connection_quality(self, obj):
#         return obj.router.get_connection_quality()


# # Enhanced Router Session History Serializer
# class RouterSessionHistorySerializer(serializers.ModelSerializer):
#     router_name = serializers.CharField(source='router.name', read_only=True)
#     router_ip = serializers.CharField(source='router.ip', read_only=True)
#     router_connection_status = serializers.CharField(source='router.connection_status', read_only=True)
#     disconnected_reason_display = serializers.CharField(source='get_disconnected_reason_display', read_only=True)
#     user_type_display = serializers.CharField(source='get_user_type_display', read_only=True)
    
#     # NEW: Session recovery context
#     can_recover = serializers.SerializerMethodField()
#     recovery_status = serializers.SerializerMethodField()

#     class Meta:
#         model = RouterSessionHistory
#         fields = [
#             "id", "hotspot_user", "pppoe_user", "router", "router_name", "router_ip", "router_connection_status",
#             "start_time", "end_time", "data_used", "duration", "disconnected_reason", "disconnected_reason_display",
#             "user_type", "user_type_display", "recoverable", "recovery_attempted", "recovered_at", "can_recover",
#             "recovery_status"
#         ]
#         read_only_fields = ["id", "start_time"]

#     def get_can_recover(self, obj):
#         return obj.recoverable and not obj.recovery_attempted

#     def get_recovery_status(self, obj):
#         if obj.recovered_at:
#             return "Recovered"
#         elif obj.recovery_attempted:
#             return "Recovery Failed"
#         elif obj.recoverable:
#             return "Recoverable"
#         else:
#             return "Not Recoverable"


# # Enhanced Router Audit Log Serializer
# class RouterAuditLogSerializer(serializers.ModelSerializer):
#     router_name = serializers.CharField(source='router.name', read_only=True)
#     router_ip = serializers.CharField(source='router.ip', read_only=True)
#     router_connection_status = serializers.CharField(source='router.connection_status', read_only=True)
#     user_username = serializers.CharField(source='user.username', read_only=True)
#     user_email = serializers.CharField(source='user.email', read_only=True)
#     action_display = serializers.CharField(source='get_action_display', read_only=True)
    
#     # NEW: Enhanced change tracking
#     changes_summary = serializers.SerializerMethodField()

#     class Meta:
#         model = RouterAuditLog
#         fields = [
#             "id", "router", "router_name", "router_ip", "router_connection_status", "action", "action_display",
#             "description", "user", "user_username", "user_email", "ip_address", "user_agent", "changes", "changes_summary", "timestamp"
#         ]
#         read_only_fields = ["id", "timestamp"]

#     def get_changes_summary(self, obj):
#         """Create a summary of changes made."""
#         if not obj.changes:
#             return "No changes"
        
#         changes_list = []
#         for field, values in obj.changes.items():
#             if isinstance(values, list) and len(values) == 2:
#                 old_val, new_val = values
#                 changes_list.append(f"{field}: {old_val} → {new_val}")
#             else:
#                 changes_list.append(f"{field}: {values}")
        
#         return "; ".join(changes_list[:3]) + ("..." if len(changes_list) > 3 else "")


# # Enhanced Bulk Operation Serializer
# class BulkOperationSerializer(serializers.ModelSerializer):
#     initiated_by_username = serializers.CharField(source='initiated_by.username', read_only=True)
#     initiated_by_email = serializers.CharField(source='initiated_by.email', read_only=True)
#     operation_type_display = serializers.CharField(source='get_operation_type_display', read_only=True)
#     status_display = serializers.CharField(source='get_status_display', read_only=True)
    
#     # NEW: Connection management operations
#     routers_count = serializers.SerializerMethodField()
#     success_rate = serializers.SerializerMethodField()
#     progress_percentage = serializers.SerializerMethodField()
#     estimated_completion = serializers.SerializerMethodField()

#     class Meta:
#         model = BulkOperation
#         fields = [
#             "id", "operation_id", "operation_type", "operation_type_display", "routers", 
#             "initiated_by", "initiated_by_username", "initiated_by_email", "status", "status_display",
#             "results", "started_at", "completed_at", "error_message", "routers_count", "success_rate",
#             "progress_percentage", "estimated_completion"
#         ]
#         read_only_fields = ["id", "operation_id", "started_at"]

#     def get_routers_count(self, obj):
#         return obj.routers.count()

#     def get_success_rate(self, obj):
#         if not obj.results or 'completed' not in obj.results:
#             return 0
        
#         completed = len(obj.results['completed'])
#         total = obj.routers.count()
        
#         if total == 0:
#             return 0
        
#         return round((completed / total) * 100, 2)

#     def get_progress_percentage(self, obj):
#         if not obj.results:
#             return 0
        
#         completed = len(obj.results.get('completed', []))
#         failed = len(obj.results.get('failed', []))
#         total = obj.routers.count()
        
#         if total == 0:
#             return 0
        
#         return round(((completed + failed) / total) * 100, 2)

#     def get_estimated_completion(self, obj):
#         if obj.status == 'completed' and obj.completed_at:
#             return obj.completed_at
        
#         if obj.status != 'running' or not obj.results:
#             return None
        
#         completed = len(obj.results.get('completed', []))
#         if completed == 0:
#             return None
        
#         # Estimate based on average time per operation
#         time_elapsed = (timezone.now() - obj.started_at).total_seconds()
#         avg_time_per_op = time_elapsed / completed if completed > 0 else 0
#         remaining_ops = obj.routers.count() - completed
        
#         if avg_time_per_op > 0 and remaining_ops > 0:
#             estimated_seconds = avg_time_per_op * remaining_ops
#             return timezone.now() + timedelta(seconds=estimated_seconds)
        
#         return None


# # Enhanced List Serializers with connection status
# class RouterListSerializer(serializers.ModelSerializer):
#     active_users_count = serializers.SerializerMethodField()
#     health_score = serializers.SerializerMethodField()
#     type_display = serializers.CharField(source='get_type_display', read_only=True)
#     status_display = serializers.CharField(source='get_status_display', read_only=True)
#     connection_status_display = serializers.CharField(source='get_connection_status_display', read_only=True)
#     configuration_status_display = serializers.CharField(source='get_configuration_status_display', read_only=True)
#     latest_stats = serializers.SerializerMethodField()
    
#     # NEW: Connection quality indicator
#     connection_quality = serializers.SerializerMethodField()
#     last_connection_test = serializers.SerializerMethodField()
#     connection_test_success_rate = serializers.SerializerMethodField()

#     class Meta:
#         model = Router
#         fields = [
#             'id', 'name', 'ip', 'type', 'type_display', 'location', 
#             'status', 'status_display', 'connection_status', 'connection_status_display',
#             'configuration_status', 'configuration_status_display', 'ssid',
#             'last_seen', 'last_connection_test', 'is_active', 'max_clients', 'firmware_version',
#             'active_users_count', 'health_score', 'latest_stats', 'connection_quality',
#             'connection_test_success_rate'
#         ]

#     def get_active_users_count(self, obj):
#         return obj.get_active_users_count()

#     def get_health_score(self, obj):
#         latest_health = obj.health_checks.order_by('-timestamp').first()
#         return latest_health.health_score if latest_health else 0

#     def get_latest_stats(self, obj):
#         latest_stats = obj.stats.order_by('-timestamp').first()
#         if latest_stats:
#             return {
#                 'cpu': latest_stats.cpu,
#                 'memory': latest_stats.memory,
#                 'clients': latest_stats.connected_clients_count,
#                 'uptime': latest_stats.uptime,
#             }
#         return None

#     def get_connection_quality(self, obj):
#         quality_data = obj.get_connection_quality()
#         return quality_data.get('quality', 'unknown')

#     def get_last_connection_test(self, obj):
#         if obj.last_connection_test:
#             time_ago = timezone.now() - obj.last_connection_test
#             if time_ago.days > 0:
#                 return f"{time_ago.days}d ago"
#             elif time_ago.seconds > 3600:
#                 return f"{time_ago.seconds // 3600}h ago"
#             else:
#                 return f"{time_ago.seconds // 60}m ago"
#         return "Never"

#     def get_connection_test_success_rate(self, obj):
#         total_tests = obj.connection_tests.count()
#         successful_tests = obj.connection_tests.filter(success=True).count()
        
#         if total_tests == 0:
#             return 0
#         return round((successful_tests / total_tests) * 100, 2)


# class HotspotUserListSerializer(serializers.ModelSerializer):
#     client_name = serializers.CharField(source='client.user.username', read_only=True)
#     client_phone = serializers.CharField(source='client.user.phone_number', read_only=True)
#     router_name = serializers.CharField(source='router.name', read_only=True)
#     router_ssid = serializers.CharField(source='router.ssid', read_only=True)
#     router_connection_status = serializers.CharField(source='router.connection_status', read_only=True)
#     plan_name = serializers.CharField(source='plan.name', read_only=True)
#     remaining_time_formatted = serializers.SerializerMethodField()
#     session_duration = serializers.SerializerMethodField()
#     quality_of_service_display = serializers.SerializerMethodField()

#     class Meta:
#         model = HotspotUser
#         fields = [
#             'id', 'mac', 'ip', 'client_name', 'client_phone', 'router_name', 'router_ssid', 'router_connection_status',
#             'plan_name', 'connected_at', 'data_used', 'active', 'remaining_time', 
#             'remaining_time_formatted', 'session_duration', 'quality_of_service', 'quality_of_service_display'
#         ]

#     def get_remaining_time_formatted(self, obj):
#         if obj.remaining_time <= 0:
#             return "Expired"
#         hours = obj.remaining_time // 3600
#         minutes = (obj.remaining_time % 3600) // 60
#         return f"{hours}h {minutes}m"

#     def get_session_duration(self, obj):
#         if obj.active:
#             duration = (timezone.now() - obj.connected_at).total_seconds()
#         else:
#             duration = obj.total_session_time
#         hours = int(duration // 3600)
#         minutes = int((duration % 3600) // 60)
#         return f"{hours}h {minutes}m"

#     def get_quality_of_service_display(self, obj):
#         quality_map = {
#             "Residential": "Residential",
#             "Business": "Business", 
#             "Promotional": "Promotional",
#             "Enterprise": "Enterprise"
#         }
#         return quality_map.get(obj.quality_of_service, obj.quality_of_service)


# class PPPoEUserListSerializer(serializers.ModelSerializer):
#     client_name = serializers.CharField(source='client.user.username', read_only=True)
#     client_phone = serializers.CharField(source='client.user.phone_number', read_only=True)
#     router_name = serializers.CharField(source='router.name', read_only=True)
#     router_service_name = serializers.CharField(source='router.pppoe_configurations.service_name', read_only=True)
#     router_connection_status = serializers.CharField(source='router.connection_status', read_only=True)
#     plan_name = serializers.CharField(source='plan.name', read_only=True)
#     remaining_time_formatted = serializers.SerializerMethodField()
#     session_duration = serializers.SerializerMethodField()
#     pppoe_service_type_display = serializers.SerializerMethodField()

#     class Meta:
#         model = PPPoEUser
#         fields = [
#             'id', 'username', 'ip_address', 'client_name', 'client_phone', 'router_name', 
#             'router_service_name', 'router_connection_status', 'plan_name', 'connected_at', 'data_used', 'active', 
#             'remaining_time', 'remaining_time_formatted', 'session_duration', 'pppoe_service_type', 'pppoe_service_type_display'
#         ]

#     def get_remaining_time_formatted(self, obj):
#         if obj.remaining_time <= 0:
#             return "Expired"
#         hours = obj.remaining_time // 3600
#         minutes = (obj.remaining_time % 3600) // 60
#         return f"{hours}h {minutes}m"

#     def get_session_duration(self, obj):
#         if obj.active:
#             duration = (timezone.now() - obj.connected_at).total_seconds()
#         else:
#             duration = obj.total_session_time
#         hours = int(duration // 3600)
#         minutes = int((duration % 3600) // 60)
#         return f"{hours}h {minutes}m"

#     def get_pppoe_service_type_display(self, obj):
#         service_map = {
#             "standard": "Standard",
#             "business": "Business",
#             "premium": "Premium"
#         }
#         return service_map.get(obj.pppoe_service_type, obj.pppoe_service_type)


# # NEW: Connection Test Request Serializer
# class ConnectionTestRequestSerializer(serializers.Serializer):
#     """Serializer for connection test requests."""
    
#     router_id = serializers.IntegerField(required=False)
#     ip = serializers.IPAddressField(required=False)
#     username = serializers.CharField(required=False)
#     password = serializers.CharField(required=False)
#     port = serializers.IntegerField(default=8728, min_value=1, max_value=65535)
#     test_type = serializers.ChoiceField(
#         choices=[('basic', 'Basic'), ('extended', 'Extended'), ('full', 'Full')],
#         default='basic'
#     )
    
#     def validate(self, data):
#         """Validate that either router_id or connection details are provided."""
#         if not data.get('router_id') and not all([data.get('ip'), data.get('username'), data.get('password')]):
#             raise serializers.ValidationError(
#                 "Either router_id or ip, username, and password must be provided"
#             )
#         return data


# # NEW: Auto Configuration Request Serializer  
# class AutoConfigurationRequestSerializer(serializers.Serializer):
#     """Serializer for auto-configuration requests."""
    
#     configuration_type = serializers.ChoiceField(choices=[('hotspot', 'Hotspot'), ('pppoe', 'PPPoE'), ('both', 'Both')])
#     ssid = serializers.CharField(required=False, max_length=32)
#     configuration_template = serializers.CharField(required=False)
#     auto_detect = serializers.BooleanField(default=True)
    
#     # Hotspot specific parameters
#     welcome_message = serializers.CharField(required=False, allow_blank=True)
#     bandwidth_limit = serializers.CharField(default="10M")
#     session_timeout = serializers.IntegerField(default=60, min_value=1, max_value=1440)
#     max_users = serializers.IntegerField(default=50, min_value=1, max_value=1000)
    
#     # PPPoE specific parameters
#     ip_pool_name = serializers.CharField(default="pppoe-pool")
#     service_name = serializers.CharField(required=False, max_length=64)
#     mtu = serializers.IntegerField(default=1492, min_value=576, max_value=1500)
#     dns_servers = serializers.CharField(default="8.8.8.8,1.1.1.1")
    
#     def validate(self, data):
#         """Validate configuration parameters based on type."""
#         config_type = data.get('configuration_type')
        
#         if config_type in ['hotspot', 'both'] and not data.get('ssid'):
#             # Auto-generate SSID if not provided
#             data['ssid'] = "Hotspot-WiFi"
            
#         if config_type in ['pppoe', 'both'] and not data.get('service_name'):
#             # Auto-generate service name if not provided
#             data['service_name'] = "PPPoE-Service"
            
#         return data


# # NEW: Configuration Apply Request Serializer
# class ConfigurationApplyRequestSerializer(serializers.Serializer):
#     """Serializer for applying configurations to routers."""
    
#     configuration_id = serializers.IntegerField(required=True)
#     configuration_type = serializers.ChoiceField(
#         choices=[('hotspot', 'Hotspot'), ('pppoe', 'PPPoE')],
#         required=True
#     )
#     force_apply = serializers.BooleanField(default=False)
#     test_connection_first = serializers.BooleanField(default=True)
    
#     def validate(self, data):
#         """Validate configuration application request."""
#         # Additional validation can be added here based on configuration type
#         return data


# # Dashboard and Utility Serializers with enhanced connection data
# class RouterDashboardStatsSerializer(serializers.Serializer):
#     total_routers = serializers.IntegerField()
#     online_routers = serializers.IntegerField()
#     offline_routers = serializers.IntegerField()
#     total_clients = serializers.IntegerField()
#     active_hotspot_users = serializers.IntegerField()
#     active_pppoe_users = serializers.IntegerField()
#     average_health_score = serializers.FloatField()
#     recent_alerts = serializers.ListField()
#     total_data_used = serializers.IntegerField()
#     system_health = serializers.DictField()
    
#     # NEW: Connection statistics
#     connected_routers = serializers.IntegerField()
#     connection_success_rate = serializers.FloatField()
#     average_response_time = serializers.FloatField()
#     configuration_status = serializers.DictField()
#     connection_quality_distribution = serializers.DictField()


# class RouterStatusUpdateSerializer(serializers.Serializer):
#     status = serializers.ChoiceField(choices=Router.STATUS_CHOICES)
#     connection_status = serializers.ChoiceField(choices=Router.CONNECTION_STATUS_CHOICES, required=False)
#     last_seen = serializers.DateTimeField(required=False)
#     firmware_version = serializers.CharField(required=False, allow_blank=True)


# class UserSessionSerializer(serializers.Serializer):
#     session_id = serializers.UUIDField()
#     remaining_time = serializers.IntegerField()
#     data_used = serializers.IntegerField()
#     connected_at = serializers.DateTimeField()
#     user_type = serializers.ChoiceField(choices=[('hotspot', 'Hotspot'), ('pppoe', 'PPPoE')])
#     client_info = serializers.DictField(required=False)
#     # NEW: Router information
#     router_ssid = serializers.CharField(required=False)
#     router_service_name = serializers.CharField(required=False)
#     router_connection_status = serializers.CharField(required=False)
#     router_configuration_status = serializers.CharField(required=False)


# class SessionRecoverySerializer(serializers.Serializer):
#     phone_number = serializers.CharField(required=True)
#     mac_address = serializers.CharField(required=False, allow_blank=True)
#     username = serializers.CharField(required=False, allow_blank=True)
#     recovery_method = serializers.ChoiceField(
#         choices=[('auto', 'Auto'), ('manual', 'Manual')],
#         default='auto'
#     )
#     router_id = serializers.IntegerField(required=False)

#     def validate(self, data):
#         if not data.get('mac_address') and not data.get('username'):
#             raise serializers.ValidationError("Either MAC address or username is required for recovery")
#         return data


# class BulkActionSerializer(serializers.Serializer):
#     router_ids = serializers.ListField(
#         child=serializers.IntegerField(),
#         required=True
#     )
#     action = serializers.ChoiceField(
#         choices=[
#             ('health_check', 'Health Check'),
#             ('restart', 'Restart'),
#             ('update_status', 'Update Status'),
#             ('backup', 'Backup Configuration'),
#             ('update_firmware', 'Update Firmware'),
#             # NEW: Connection management actions
#             ('test_connection', 'Test Connection'),
#             ('auto_configure', 'Auto Configure'),
#             ('apply_configuration', 'Apply Configuration')
#         ],
#         required=True
#     )
#     parameters = serializers.JSONField(required=False, default=dict)


# class PaymentVerificationSerializer(serializers.Serializer):
#     transaction_reference = serializers.CharField(required=True)
#     client_id = serializers.IntegerField(required=True)
#     plan_id = serializers.IntegerField(required=True)
#     verification_type = serializers.ChoiceField(
#         choices=[('automatic', 'Automatic'), ('manual', 'Manual')],
#         default='automatic'
#     )
#     router_id = serializers.IntegerField(required=False)






"""
Enhanced Router Management Serializers - COMPLETE

This module provides comprehensive serializers for router management with
connection testing, dynamic SSID support, VPN configuration, and technician workflow tracking.
"""

from rest_framework import serializers
from network_management.models.router_management_model import (
    Router, RouterStats, HotspotUser, PPPoEUser, ActivationAttempt, 
    RouterSessionHistory, RouterHealthCheck, RouterCallbackConfig,
    RouterAuditLog, BulkOperation, HotspotConfiguration, PPPoEConfiguration,
    RouterConnectionTest
)
from account.serializers.admin_serializer import ClientSerializer
from payments.serializers.payment_config_serializer import TransactionSerializer
from django.utils import timezone
from datetime import timedelta
from django.core.cache import cache
import logging

logger = logging.getLogger(__name__)


# NEW: Technician Workflow Serializers
class TechnicianWorkflowSerializer(serializers.Serializer):
    """Serializer for technician workflow requests."""
    
    workflow_type = serializers.ChoiceField(
        choices=[('new_router_deployment', 'New Router Deployment'), 
                ('vpn_enablement', 'VPN Enablement'),
                ('troubleshooting', 'Troubleshooting')],
        required=True
    )
    deployment_site = serializers.CharField(max_length=100, required=True)
    router_config = serializers.DictField(required=False)
    vpn_type = serializers.ChoiceField(
        choices=[('openvpn', 'OpenVPN'), ('wireguard', 'WireGuard'), ('sstp', 'SSTP')],
        default='openvpn',
        required=False
    )
    setup_type = serializers.ChoiceField(
        choices=[('hotspot', 'Hotspot'), ('pppoe', 'PPPoE'), ('both', 'Both')],
        default='hotspot',
        required=False
    )
    
    def validate(self, data):
        """Validate workflow parameters."""
        workflow_type = data.get('workflow_type')
        
        if workflow_type == 'new_router_deployment' and not data.get('router_config'):
            raise serializers.ValidationError(
                "router_config is required for new router deployment"
            )
        
        return data


class DeploymentRequestSerializer(serializers.Serializer):
    """Serializer for deployment requests."""
    
    site = serializers.CharField(max_length=100, required=True)
    workflow_type = serializers.ChoiceField(
        choices=[('new_router_deployment', 'New Router Deployment'), 
                ('vpn_enablement', 'VPN Enablement'),
                ('troubleshooting', 'Troubleshooting')],
        required=True
    )
    router_config = serializers.DictField(required=True)
    
    def validate_router_config(self, value):
        """Validate router configuration."""
        required_fields = ['host', 'username', 'password']
        for field in required_fields:
            if field not in value:
                raise serializers.ValidationError(
                    f"router_config must contain '{field}' field"
                )
        return value


# NEW: VPN Configuration Serializers
class VPNConfigurationSerializer(serializers.Serializer):
    """Serializer for VPN configuration requests."""
    
    vpn_type = serializers.ChoiceField(
        choices=[('openvpn', 'OpenVPN'), ('wireguard', 'WireGuard'), ('sstp', 'SSTP')],
        required=True
    )
    configuration = serializers.DictField(required=False)
    certificate_info = serializers.DictField(required=False)
    generate_certificates = serializers.BooleanField(default=True)
    
    def validate(self, data):
        """Validate VPN configuration."""
        vpn_type = data.get('vpn_type')
        
        if vpn_type == 'openvpn' and data.get('generate_certificates', True):
            # Ensure certificate info is provided or can be generated
            if not data.get('certificate_info'):
                # Auto-generate certificate info if not provided
                data['certificate_info'] = {
                    'auto_generate': True,
                    'validity_years': 5
                }
        
        return data


class CertificateInfoSerializer(serializers.Serializer):
    """Serializer for certificate information."""
    
    certificate_id = serializers.CharField(read_only=True)
    router_name = serializers.CharField(read_only=True)
    router_ip = serializers.CharField(read_only=True)
    certificate_path = serializers.CharField(read_only=True)
    private_key_path = serializers.CharField(read_only=True)
    ca_certificate_path = serializers.CharField(read_only=True)
    valid_until = serializers.CharField(read_only=True)
    generated_at = serializers.CharField(read_only=True)
    is_valid = serializers.BooleanField(read_only=True)
    days_remaining = serializers.IntegerField(read_only=True)


class VPNTestRequestSerializer(serializers.Serializer):
    """Serializer for VPN test requests."""
    
    vpn_type = serializers.ChoiceField(
        choices=[('openvpn', 'OpenVPN'), ('wireguard', 'WireGuard'), ('sstp', 'SSTP')],
        required=True
    )
    client_config = serializers.DictField(required=False)


# NEW: Router Connection Test Serializer
class RouterConnectionTestSerializer(serializers.ModelSerializer):
    """Serializer for router connection test results."""
    
    router_name = serializers.CharField(source='router.name', read_only=True)
    router_ip = serializers.CharField(source='router.ip', read_only=True)
    tested_by_username = serializers.CharField(source='tested_by.username', read_only=True, allow_null=True)
    tested_by_email = serializers.CharField(source='tested_by.email', read_only=True, allow_null=True)
    
    # Computed fields
    system_model = serializers.SerializerMethodField()
    system_version = serializers.SerializerMethodField()
    test_duration = serializers.SerializerMethodField()
    error_summary = serializers.SerializerMethodField()

    class Meta:
        model = RouterConnectionTest
        fields = [
            "id", "router", "router_name", "router_ip", "success", "response_time",
            "system_info", "system_model", "system_version", "error_messages", 
            "error_summary", "tested_at", "tested_by", "tested_by_username", 
            "tested_by_email", "test_duration"
        ]
        read_only_fields = ["id", "tested_at"]

    def get_system_model(self, obj):
        """Extract system model from system_info."""
        return obj.system_info.get('board-name', 'Unknown') if obj.system_info else 'Unknown'

    def get_system_version(self, obj):
        """Extract system version from system_info."""
        return obj.system_info.get('version', 'Unknown') if obj.system_info else 'Unknown'

    def get_test_duration(self, obj):
        """Calculate how long ago the test was performed."""
        if not obj.tested_at:
            return "Unknown"
        
        duration = timezone.now() - obj.tested_at
        if duration.days > 0:
            return f"{duration.days} days ago"
        elif duration.seconds > 3600:
            return f"{duration.seconds // 3600} hours ago"
        elif duration.seconds > 60:
            return f"{duration.seconds // 60} minutes ago"
        else:
            return f"{duration.seconds} seconds ago"

    def get_error_summary(self, obj):
        """Create a summary of error messages."""
        if not obj.error_messages or len(obj.error_messages) == 0:
            return "No errors"
        
        # Return the first error message as summary
        first_error = obj.error_messages[0]
        if len(first_error) > 100:
            return first_error[:100] + "..."
        return first_error


# NEW: Router Configuration Template Serializer
class RouterConfigurationTemplateSerializer(serializers.Serializer):
    """Serializer for router configuration templates."""
    
    name = serializers.CharField()
    display_name = serializers.CharField()
    description = serializers.CharField()
    hotspot_config = serializers.DictField(required=False)
    pppoe_config = serializers.DictField(required=False)
    vpn_config = serializers.DictField(required=False)
    recommended_for = serializers.ListField(child=serializers.CharField())
    
    def validate(self, data):
        """Validate that at least one configuration type is provided."""
        if not data.get('hotspot_config') and not data.get('pppoe_config') and not data.get('vpn_config'):
            raise serializers.ValidationError(
                "At least one of hotspot_config, pppoe_config, or vpn_config must be provided"
            )
        return data


# Enhanced Hotspot Configuration Serializer
class HotspotConfigurationSerializer(serializers.ModelSerializer):
    router_name = serializers.CharField(source='router.name', read_only=True)
    router_ip = serializers.CharField(source='router.ip', read_only=True)
    router_connection_status = serializers.CharField(source='router.connection_status', read_only=True)
    landing_page_url = serializers.SerializerMethodField()
    auth_method_display = serializers.CharField(source='get_auth_method_display', read_only=True)
    
    # NEW: Configuration status fields
    configuration_status = serializers.SerializerMethodField()
    can_apply_configuration = serializers.SerializerMethodField()
    last_configuration_status = serializers.SerializerMethodField()
    configuration_errors_summary = serializers.SerializerMethodField()
    
    class Meta:
        model = HotspotConfiguration
        fields = [
            'id', 'router', 'router_name', 'router_ip', 'router_connection_status', 'ssid', 'landing_page_file', 
            'landing_page_url', 'redirect_url', 'bandwidth_limit', 'session_timeout',
            'auth_method', 'auth_method_display', 'enable_splash_page', 'allow_social_login', 
            'enable_bandwidth_shaping', 'log_user_activity', 'max_users',
            'welcome_message', 'terms_conditions_url', 
            # NEW: Configuration status fields
            'configuration_applied', 'last_configuration_attempt', 'configuration_errors',
            'configuration_status', 'can_apply_configuration', 'last_configuration_status',
            'configuration_errors_summary', 
            # NEW: Advanced configuration options
            'ip_pool', 'dns_servers', 'rate_limit', 'idle_timeout',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'landing_page_url', 
            'configuration_applied', 'last_configuration_attempt', 'configuration_errors'
        ]
    
    def get_landing_page_url(self, obj):
        if obj.landing_page_file:
            return obj.landing_page_file.url
        return None

    def get_configuration_status(self, obj):
        """Get human-readable configuration status."""
        if obj.configuration_applied:
            return "Applied Successfully"
        elif obj.last_configuration_attempt and not obj.configuration_applied:
            return "Configuration Failed"
        elif obj.last_configuration_attempt:
            return "Configuration Attempted"
        else:
            return "Not Configured"

    def get_can_apply_configuration(self, obj):
        """Check if configuration can be applied to router."""
        return obj.router.connection_status == 'connected'

    def get_last_configuration_status(self, obj):
        """Get details about last configuration attempt."""
        if not obj.last_configuration_attempt:
            return "No configuration attempts"
        
        status = "Success" if obj.configuration_applied else "Failed"
        time_ago = timezone.now() - obj.last_configuration_attempt
        
        if time_ago.days > 0:
            time_str = f"{time_ago.days} days ago"
        elif time_ago.seconds > 3600:
            time_str = f"{time_ago.seconds // 3600} hours ago"
        else:
            time_str = f"{time_ago.seconds // 60} minutes ago"
        
        return f"{status} - {time_str}"

    def get_configuration_errors_summary(self, obj):
        """Get a summary of configuration errors."""
        if not obj.configuration_errors:
            return "No errors"
        
        if len(obj.configuration_errors) == 1:
            error = obj.configuration_errors[0]
            if len(error) > 100:
                return error[:100] + "..."
            return error
        
        return f"{len(obj.configuration_errors)} errors"

    def validate_ssid(self, value):
        """Validate SSID format and uniqueness."""
        if not value or value.strip() == "":
            raise serializers.ValidationError("SSID cannot be empty")
        
        # Check for basic SSID format validation
        if len(value) > 32:
            raise serializers.ValidationError("SSID cannot exceed 32 characters")
        
        # Check for special characters that might cause issues
        import re
        if not re.match(r'^[a-zA-Z0-9\-_\.\s]+$', value):
            raise serializers.ValidationError(
                "SSID can only contain letters, numbers, spaces, hyphens, underscores, and periods"
            )
        
        return value.strip()


# Enhanced PPPoE Configuration Serializer
class PPPoEConfigurationSerializer(serializers.ModelSerializer):
    router_name = serializers.CharField(source='router.name', read_only=True)
    router_ip = serializers.CharField(source='router.ip', read_only=True)
    router_connection_status = serializers.CharField(source='router.connection_status', read_only=True)
    auth_methods_display = serializers.SerializerMethodField()
    service_type_display = serializers.SerializerMethodField()
    
    # NEW: Configuration status fields
    configuration_status = serializers.SerializerMethodField()
    can_apply_configuration = serializers.SerializerMethodField()
    last_configuration_status = serializers.SerializerMethodField()
    configuration_errors_summary = serializers.SerializerMethodField()
    
    class Meta:
        model = PPPoEConfiguration
        fields = [
            'id', 'router', 'router_name', 'router_ip', 'router_connection_status', 'ip_pool_name', 'service_name',
            'mtu', 'dns_servers', 'bandwidth_limit', 'auth_methods', 'auth_methods_display',
            'enable_pap', 'enable_chap', 'enable_mschap', 'idle_timeout', 'session_timeout',
            'default_profile', 'interface', 'ip_range_start', 'ip_range_end', 'service_type',
            'service_type_display',
            # NEW: Configuration status fields
            'configuration_applied', 'last_configuration_attempt', 'configuration_errors',
            'configuration_status', 'can_apply_configuration', 'last_configuration_status',
            'configuration_errors_summary', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at',
            'configuration_applied', 'last_configuration_attempt', 'configuration_errors'
        ]
    
    def get_auth_methods_display(self, obj):
        return dict(PPPoEConfiguration.AUTH_METHODS).get(obj.auth_methods, obj.auth_methods)
    
    def get_service_type_display(self, obj):
        return dict(PPPoEConfiguration.SERVICE_TYPES).get(obj.service_type, obj.service_type)

    def get_configuration_status(self, obj):
        """Get human-readable configuration status."""
        if obj.configuration_applied:
            return "Applied Successfully"
        elif obj.last_configuration_attempt and not obj.configuration_applied:
            return "Configuration Failed"
        elif obj.last_configuration_attempt:
            return "Configuration Attempted"
        else:
            return "Not Configured"

    def get_can_apply_configuration(self, obj):
        """Check if configuration can be applied to router."""
        return obj.router.connection_status == 'connected'

    def get_last_configuration_status(self, obj):
        """Get details about last configuration attempt."""
        if not obj.last_configuration_attempt:
            return "No configuration attempts"
        
        status = "Success" if obj.configuration_applied else "Failed"
        time_ago = timezone.now() - obj.last_configuration_attempt
        
        if time_ago.days > 0:
            time_str = f"{time_ago.days} days ago"
        elif time_ago.seconds > 3600:
            time_str = f"{time_ago.seconds // 3600} hours ago"
        else:
            time_str = f"{time_ago.seconds // 60} minutes ago"
        
        return f"{status} - {time_str}"

    def get_configuration_errors_summary(self, obj):
        """Get a summary of configuration errors."""
        if not obj.configuration_errors:
            return "No errors"
        
        if len(obj.configuration_errors) == 1:
            error = obj.configuration_errors[0]
            if len(error) > 100:
                return error[:100] + "..."
            return error
        
        return f"{len(obj.configuration_errors)} errors"

    def validate_service_name(self, value):
        """Validate PPPoE service name."""
        if value and len(value) > 64:
            raise serializers.ValidationError("Service name cannot exceed 64 characters")
        return value


# Enhanced Router Callback Config Serializer
class RouterCallbackConfigSerializer(serializers.ModelSerializer):
    event_display = serializers.CharField(source='get_event_display', read_only=True)
    security_level_display = serializers.CharField(source='get_security_level_display', read_only=True)
    router_name = serializers.CharField(source='router.name', read_only=True)
    router_connection_status = serializers.CharField(source='router.connection_status', read_only=True)

    class Meta:
        model = RouterCallbackConfig
        fields = [
            "id", "router", "router_name", "router_connection_status", "event", "event_display", "callback_url", 
            "security_level", "security_level_display", "security_profile", "is_active", 
            "retry_enabled", "max_retries", "timeout_seconds", "created_at", "updated_at"
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


# Enhanced Router Stats Serializer
class RouterStatsSerializer(serializers.ModelSerializer):
    router_name = serializers.CharField(source='router.name', read_only=True)
    router_ip = serializers.CharField(source='router.ip', read_only=True)
    router_status = serializers.CharField(source='router.status', read_only=True)
    router_connection_status = serializers.CharField(source='router.connection_status', read_only=True)

    class Meta:
        model = RouterStats
        fields = [
            "id", "router", "router_name", "router_ip", "router_status", "router_connection_status",
            "cpu", "memory", "connected_clients_count", "uptime", "signal", "temperature", 
            "throughput", "disk", "timestamp", "upload_speed", "download_speed", 
            "hotspot_clients", "pppoe_clients", "vpn_connections", "vpn_throughput"
        ]
        read_only_fields = ["id", "router", "timestamp"]


# Enhanced Router Health Check Serializer
class RouterHealthCheckSerializer(serializers.ModelSerializer):
    router_name = serializers.CharField(source='router.name', read_only=True)
    router_ip = serializers.CharField(source='router.ip', read_only=True)
    router_status = serializers.CharField(source='router.status', read_only=True)
    router_connection_status = serializers.CharField(source='router.connection_status', read_only=True)
    health_status = serializers.SerializerMethodField()
    vpn_status_summary = serializers.SerializerMethodField()

    class Meta:
        model = RouterHealthCheck
        fields = [
            "id", "router", "router_name", "router_ip", "router_status", "router_connection_status",
            "timestamp", "is_online", "response_time", "error_message", "system_metrics", 
            "health_score", "critical_alerts", "performance_metrics", "vpn_status",
            "health_status", "vpn_status_summary"
        ]
        read_only_fields = ["id", "timestamp"]

    def get_health_status(self, obj):
        if obj.health_score >= 80:
            return "Excellent"
        elif obj.health_score >= 60:
            return "Good"
        elif obj.health_score >= 40:
            return "Fair"
        else:
            return "Poor"

    def get_vpn_status_summary(self, obj):
        """Get VPN status summary."""
        if not obj.vpn_status:
            return "Not Configured"
        
        vpn_status = obj.vpn_status
        if vpn_status.get('enabled', False):
            connections = vpn_status.get('active_connections', 0)
            return f"Enabled ({connections} connections)"
        else:
            return "Disabled"


# ENHANCED: Main Router Serializer with Connection Management and VPN Support
class RouterSerializer(serializers.ModelSerializer):
    callback_configs = RouterCallbackConfigSerializer(many=True, read_only=True)
    stats = RouterStatsSerializer(many=True, read_only=True)
    health_checks = RouterHealthCheckSerializer(many=True, read_only=True)
    hotspot_configurations = HotspotConfigurationSerializer(many=True, read_only=True)
    pppoe_configurations = PPPoEConfigurationSerializer(many=True, read_only=True)
    
    # NEW: Connection test data
    connection_tests = RouterConnectionTestSerializer(many=True, read_only=True)
    latest_connection_test = serializers.SerializerMethodField()
    
    active_users_count = serializers.SerializerMethodField()
    health_score = serializers.SerializerMethodField()
    system_metrics = serializers.SerializerMethodField()
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    # NEW: Connection status fields
    connection_status_display = serializers.CharField(source='get_connection_status_display', read_only=True)
    configuration_status_display = serializers.CharField(source='get_configuration_status_display', read_only=True)
    connection_quality = serializers.SerializerMethodField()
    can_configure_hotspot = serializers.SerializerMethodField()
    can_configure_pppoe = serializers.SerializerMethodField()
    can_configure_vpn = serializers.SerializerMethodField()
    
    # Related counts
    hotspot_users_count = serializers.SerializerMethodField()
    pppoe_users_count = serializers.SerializerMethodField()
    audit_logs_count = serializers.SerializerMethodField()
    
    # NEW: Connection test counts
    connection_tests_count = serializers.SerializerMethodField()
    successful_connection_tests = serializers.SerializerMethodField()
    connection_test_success_rate = serializers.SerializerMethodField()
    
    # NEW: VPN fields
    vpn_type_display = serializers.SerializerMethodField()
    vpn_status_summary = serializers.SerializerMethodField()
    technician_workflow_status = serializers.SerializerMethodField()

    class Meta:
        model = Router
        fields = [
            "id", "name", "ip", "port", "username", "password", "type", "type_display",
            "location", "status", "status_display", 
            # NEW: Enhanced connection fields
            "connection_status", "connection_status_display", 
            "configuration_status", "configuration_status_display",
            "configuration_type", "configuration_template",
            "last_connection_test", "last_configuration_update",
            "average_response_time", "connection_success_rate",
            # Original fields
            "last_seen", "is_default", "captive_portal_enabled", "is_active", "callback_url", 
            "max_clients", "description", "firmware_version", "ssid",
            # NEW: VPN configuration fields
            "vpn_enabled", "vpn_type", "vpn_type_display", "vpn_configuration", "vpn_status_summary",
            # NEW: Technician workflow tracking
            "last_technician_workflow", "workflow_status", "technician_workflow_status",
            "created_at", "updated_at",
            # Related objects
            "callback_configs", "stats", "health_checks", "hotspot_configurations", "pppoe_configurations",
            "connection_tests", "latest_connection_test",
            # Computed fields
            "active_users_count", "health_score", "system_metrics",
            "hotspot_users_count", "pppoe_users_count", "audit_logs_count",
            "connection_tests_count", "successful_connection_tests", "connection_test_success_rate",
            "connection_quality", "can_configure_hotspot", "can_configure_pppoe", "can_configure_vpn"
        ]
        read_only_fields = [
            "id", "last_seen", "created_at", "updated_at", "active_users_count", 
            "health_score", "system_metrics", "hotspot_users_count", "pppoe_users_count", 
            "audit_logs_count", "callback_configs", "stats", "health_checks",
            "hotspot_configurations", "pppoe_configurations", "connection_tests",
            "connection_tests_count", "successful_connection_tests", "connection_test_success_rate",
            "connection_quality", "can_configure_hotspot", "can_configure_pppoe", "can_configure_vpn", 
            "latest_connection_test", "connection_status", "configuration_status", "last_connection_test",
            "average_response_time", "connection_success_rate", "vpn_type_display", "vpn_status_summary",
            "technician_workflow_status"
        ]
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def get_active_users_count(self, obj):
        return obj.get_active_users_count()

    def get_health_score(self, obj):
        cache_key = f"router:{obj.id}:health"
        cached_health = cache.get(cache_key)
        
        if cached_health:
            return cached_health.get('health_score', 0)
        
        latest_health = obj.health_checks.order_by('-timestamp').first()
        return latest_health.health_score if latest_health else 0

    def get_system_metrics(self, obj):
        latest_stats = obj.stats.order_by('-timestamp').first()
        if latest_stats:
            return {
                'cpu': latest_stats.cpu,
                'memory': latest_stats.memory,
                'clients': latest_stats.connected_clients_count,
                'throughput': latest_stats.throughput,
                'uptime': latest_stats.uptime,
                'upload_speed': latest_stats.upload_speed,
                'download_speed': latest_stats.download_speed,
                'vpn_connections': latest_stats.vpn_connections,
            }
        return {}

    def get_hotspot_users_count(self, obj):
        return obj.hotspot_users.count()

    def get_pppoe_users_count(self, obj):
        return obj.pppoe_users.count()

    def get_audit_logs_count(self, obj):
        return obj.audit_logs.count()

    # NEW: Connection management computed fields
    def get_connection_tests_count(self, obj):
        return obj.connection_tests.count()

    def get_successful_connection_tests(self, obj):
        return obj.connection_tests.filter(success=True).count()

    def get_connection_test_success_rate(self, obj):
        total_tests = self.get_connection_tests_count(obj)
        successful_tests = self.get_successful_connection_tests(obj)
        
        if total_tests == 0:
            return 0
        return round((successful_tests / total_tests) * 100, 2)

    def get_latest_connection_test(self, obj):
        latest_test = obj.connection_tests.order_by('-tested_at').first()
        if latest_test:
            return RouterConnectionTestSerializer(latest_test).data
        return None

    def get_connection_quality(self, obj):
        return obj.get_connection_quality()

    def get_can_configure_hotspot(self, obj):
        return obj.can_configure_hotspot()

    def get_can_configure_pppoe(self, obj):
        return obj.can_configure_pppoe()

    def get_can_configure_vpn(self, obj):
        return obj.can_configure_vpn()

    def get_vpn_type_display(self, obj):
        """Get VPN type display name."""
        vpn_types = {
            "openvpn": "OpenVPN",
            "wireguard": "WireGuard", 
            "sstp": "SSTP"
        }
        return vpn_types.get(obj.vpn_type, obj.vpn_type)

    def get_vpn_status_summary(self, obj):
        """Get VPN status summary."""
        if not obj.vpn_enabled:
            return "Disabled"
        
        latest_health = obj.health_checks.order_by('-timestamp').first()
        if latest_health and latest_health.vpn_status:
            connections = latest_health.vpn_status.get('active_connections', 0)
            return f"Enabled ({connections} connections)"
        else:
            return "Enabled"

    def get_technician_workflow_status(self, obj):
        """Get technician workflow status summary."""
        if not obj.last_technician_workflow:
            return "No recent workflows"
        
        time_ago = timezone.now() - obj.last_technician_workflow
        if time_ago.days > 0:
            time_str = f"{time_ago.days} days ago"
        elif time_ago.seconds > 3600:
            time_str = f"{time_ago.seconds // 3600} hours ago"
        else:
            time_str = f"{time_ago.seconds // 60} minutes ago"
        
        return f"{obj.workflow_status or 'Unknown'} - {time_str}"

    def validate(self, data):
        """Validate router data with connection testing support."""
        # Auto-generate SSID if not provided
        if not data.get('ssid') and data.get('name'):
            data['ssid'] = f"{data['name']}-WiFi"
        
        # Auto-generate callback URL if not provided
        if not data.get('callback_url') and data.get('id'):
            from django.conf import settings
            base_url = getattr(settings, 'BASE_URL', 'http://localhost:8000')
            data['callback_url'] = f"{base_url}/api/payments/mpesa-callbacks/dispatch/{data['id']}/"
        
        return data

    def create(self, validated_data):
        """Create router and optionally test connection."""
        # Extract password for potential connection test
        password = validated_data.get('password')
        
        # Create the router instance
        router = super().create(validated_data)
        
        # Test connection if auto_test is enabled (could be from context)
        auto_test = self.context.get('auto_test_connection', False)
        if auto_test and password:
            try:
                # Perform connection test
                test_results = router.test_connection()
                
                # Update router status based on test results
                if test_results.get('system_access'):
                    router.connection_status = 'connected'
                    if test_results.get('system_info'):
                        router.firmware_version = test_results['system_info'].get('version')
                else:
                    router.connection_status = 'disconnected'
                
                router.save()
                
            except Exception as e:
                # Log error but don't fail creation
                logger.error(f"Auto-connection test failed for new router {router.id}: {str(e)}")
        
        return router


# Enhanced Hotspot User Serializer
class HotspotUserSerializer(serializers.ModelSerializer):
    client = ClientSerializer(read_only=True)
    plan = serializers.SerializerMethodField()
    transaction = TransactionSerializer(read_only=True)
    router_name = serializers.CharField(source='router.name', read_only=True)
    router_ip = serializers.CharField(source='router.ip', read_only=True)
    router_ssid = serializers.CharField(source='router.ssid', read_only=True)
    router_connection_status = serializers.CharField(source='router.connection_status', read_only=True)
    
    # Computed fields
    remaining_time_formatted = serializers.SerializerMethodField()
    session_duration = serializers.SerializerMethodField()
    session_duration_seconds = serializers.SerializerMethodField()
    bandwidth_usage = serializers.SerializerMethodField()
    quality_of_service_display = serializers.SerializerMethodField()
    connection_quality_display = serializers.SerializerMethodField()

    class Meta:
        model = HotspotUser
        fields = [
            "id", "router", "router_name", "router_ip", "router_ssid", "router_connection_status", "client", "plan", "transaction", 
            "mac", "ip", "connected_at", "disconnected_at", "data_used", "active", 
            "latitude", "longitude", "location_data", "session_id", 
            "total_session_time", "remaining_time", "remaining_time_formatted",
            "last_activity", "session_duration", "session_duration_seconds",
            "bandwidth_used", "bandwidth_usage", "quality_of_service", "quality_of_service_display",
            "connection_quality", "connection_quality_display", "average_signal_strength",
            "device_info"
        ]
        read_only_fields = [
            "id", "router", "connected_at", "disconnected_at", "session_id", 
            "last_activity", "remaining_time_formatted", "session_duration", 
            "session_duration_seconds", "bandwidth_usage", "quality_of_service_display",
            "connection_quality_display"
        ]

    def get_plan(self, obj):
        from internet_plans.serializers.create_plan_serializers import InternetPlanSerializer
        if obj.plan:
            return InternetPlanSerializer(obj.plan).data
        return None

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

    def get_session_duration(self, obj):
        if obj.active:
            duration = (timezone.now() - obj.connected_at).total_seconds()
        else:
            duration = obj.total_session_time
        
        hours = int(duration // 3600)
        minutes = int((duration % 3600) // 60)
        return f"{hours}h {minutes}m"

    def get_session_duration_seconds(self, obj):
        if obj.active:
            return int((timezone.now() - obj.connected_at).total_seconds())
        else:
            return obj.total_session_time

    def get_bandwidth_usage(self, obj):
        return {
            'upload': obj.bandwidth_used.get('upload', 0),
            'download': obj.bandwidth_used.get('download', 0),
            'total': obj.data_used
        }

    def get_quality_of_service_display(self, obj):
        quality_map = {
            "Residential": "Residential",
            "Business": "Business", 
            "Promotional": "Promotional",
            "Enterprise": "Enterprise"
        }
        return quality_map.get(obj.quality_of_service, obj.quality_of_service)

    def get_connection_quality_display(self, obj):
        quality_map = {
            "excellent": "Excellent",
            "good": "Good",
            "fair": "Fair",
            "poor": "Poor"
        }
        return quality_map.get(obj.connection_quality, obj.connection_quality)


# Enhanced PPPoE User Serializer
class PPPoEUserSerializer(serializers.ModelSerializer):
    client = ClientSerializer(read_only=True)
    plan = serializers.SerializerMethodField()
    transaction = TransactionSerializer(read_only=True)
    router_name = serializers.CharField(source='router.name', read_only=True)
    router_ip = serializers.CharField(source='router.ip', read_only=True)
    router_service_name = serializers.CharField(source='router.pppoe_configurations.service_name', read_only=True)
    router_connection_status = serializers.CharField(source='router.connection_status', read_only=True)
    
    # Computed fields
    remaining_time_formatted = serializers.SerializerMethodField()
    session_duration = serializers.SerializerMethodField()
    session_duration_seconds = serializers.SerializerMethodField()
    bandwidth_usage = serializers.SerializerMethodField()
    pppoe_service_type_display = serializers.SerializerMethodField()
    connection_quality_display = serializers.SerializerMethodField()

    class Meta:
        model = PPPoEUser
        fields = [
            "id", "router", "router_name", "router_ip", "router_service_name", "router_connection_status", "client", "plan", "transaction", 
            "username", "password", "service_name", "ip_address", "connected_at", 
            "disconnected_at", "data_used", "active", "session_id", "total_session_time", 
            "remaining_time", "remaining_time_formatted", "last_activity", "session_duration",
            "session_duration_seconds", "bandwidth_used", "bandwidth_usage", 
            "pppoe_service_type", "pppoe_service_type_display", "connection_uptime",
            "connection_quality", "connection_quality_display"
        ]
        read_only_fields = [
            "id", "router", "connected_at", "disconnected_at", "session_id", 
            "last_activity", "remaining_time_formatted", "session_duration",
            "session_duration_seconds", "bandwidth_usage", "pppoe_service_type_display",
            "connection_quality_display"
        ]
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def get_plan(self, obj):
        from internet_plans.serializers.create_plan_serializers import InternetPlanSerializer
        if obj.plan:
            return InternetPlanSerializer(obj.plan).data
        return None

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

    def get_session_duration(self, obj):
        if obj.active:
            duration = (timezone.now() - obj.connected_at).total_seconds()
        else:
            duration = obj.total_session_time
        
        hours = int(duration // 3600)
        minutes = int((duration % 3600) // 60)
        return f"{hours}h {minutes}m"

    def get_session_duration_seconds(self, obj):
        if obj.active:
            return int((timezone.now() - obj.connected_at).total_seconds())
        else:
            return obj.total_session_time

    def get_bandwidth_usage(self, obj):
        return {
            'upload': obj.bandwidth_used.get('upload', 0),
            'download': obj.bandwidth_used.get('download', 0),
            'total': obj.data_used
        }

    def get_pppoe_service_type_display(self, obj):
        service_map = {
            "standard": "Standard",
            "business": "Business",
            "premium": "Premium"
        }
        return service_map.get(obj.pppoe_service_type, obj.pppoe_service_type)

    def get_connection_quality_display(self, obj):
        quality_map = {
            "excellent": "Excellent",
            "good": "Good",
            "fair": "Fair",
            "poor": "Poor"
        }
        return quality_map.get(obj.connection_quality, obj.connection_quality)


# Enhanced Activation Attempt Serializer
class ActivationAttemptSerializer(serializers.ModelSerializer):
    router_name = serializers.CharField(source='router.name', read_only=True)
    router_ip = serializers.CharField(source='router.ip', read_only=True)
    router_connection_status = serializers.CharField(source='router.connection_status', read_only=True)
    user_type_display = serializers.CharField(source='get_user_type_display', read_only=True)
    verification_method_display = serializers.CharField(source='get_verification_method_display', read_only=True)
    
    # NEW: Connection quality context
    connection_quality = serializers.SerializerMethodField()
    router_configuration_status = serializers.CharField(source='router.configuration_status', read_only=True)
    
    # NEW: Technician workflow association
    technician_username = serializers.CharField(source='technician.username', read_only=True)

    class Meta:
        model = ActivationAttempt
        fields = [
            "id", "subscription", "router", "router_name", "router_ip", "router_connection_status",
            "attempted_at", "success", "error_message", "retry_count", "user_type", "user_type_display",
            "payment_verified", "transaction_reference", "verification_method", "verification_method_display",
            "connection_quality", "router_configuration_status", "technician", "technician_username", "workflow_type"
        ]
        read_only_fields = ["id", "attempted_at"]

    def get_connection_quality(self, obj):
        return obj.router.get_connection_quality()


# Enhanced Router Session History Serializer
class RouterSessionHistorySerializer(serializers.ModelSerializer):
    router_name = serializers.CharField(source='router.name', read_only=True)
    router_ip = serializers.CharField(source='router.ip', read_only=True)
    router_connection_status = serializers.CharField(source='router.connection_status', read_only=True)
    disconnected_reason_display = serializers.CharField(source='get_disconnected_reason_display', read_only=True)
    user_type_display = serializers.CharField(source='get_user_type_display', read_only=True)
    
    # NEW: Session recovery context
    can_recover = serializers.SerializerMethodField()
    recovery_status = serializers.SerializerMethodField()
    connection_quality_display = serializers.SerializerMethodField()

    class Meta:
        model = RouterSessionHistory
        fields = [
            "id", "hotspot_user", "pppoe_user", "router", "router_name", "router_ip", "router_connection_status",
            "start_time", "end_time", "data_used", "duration", "disconnected_reason", "disconnected_reason_display",
            "user_type", "user_type_display", "recoverable", "recovery_attempted", "recovered_at", "can_recover",
            "recovery_status", "average_signal_strength", "connection_quality", "connection_quality_display"
        ]
        read_only_fields = ["id", "start_time"]

    def get_can_recover(self, obj):
        return obj.recoverable and not obj.recovery_attempted

    def get_recovery_status(self, obj):
        if obj.recovered_at:
            return "Recovered"
        elif obj.recovery_attempted:
            return "Recovery Failed"
        elif obj.recoverable:
            return "Recoverable"
        else:
            return "Not Recoverable"

    def get_connection_quality_display(self, obj):
        quality_map = {
            "excellent": "Excellent",
            "good": "Good",
            "fair": "Fair",
            "poor": "Poor"
        }
        return quality_map.get(obj.connection_quality, obj.connection_quality)



class RouterAuditLogSerializer(serializers.ModelSerializer):
    router_name = serializers.SerializerMethodField()
    router_ip = serializers.SerializerMethodField()
    router_connection_status = serializers.SerializerMethodField()
    
    user_username = serializers.CharField(source='user.username', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    action_display = serializers.CharField(source='get_action_display', read_only=True)
    
    # NEW: Enhanced change tracking
    changes_summary = serializers.SerializerMethodField()
    
    # Status code field
    status_code_display = serializers.SerializerMethodField()

    class Meta:
        model = RouterAuditLog
        fields = [
            "id", "router", "router_name", "router_ip", "router_connection_status", "action", "action_display",
            "description", "user", "user_username", "user_email", "ip_address", "user_agent", "changes", "changes_summary", 
            "status_code", "status_code_display", "timestamp"
        ]
        read_only_fields = ["id", "timestamp"]

  
    def get_router_name(self, obj):
        return obj.router.name if obj.router else "System"

    def get_router_ip(self, obj):
        return obj.router.ip if obj.router else "N/A"

    def get_router_connection_status(self, obj):
        return obj.router.connection_status if obj.router else "N/A"

    def get_changes_summary(self, obj):
        """Create a summary of changes made."""
        if not obj.changes:
            return "No changes"
        
        changes_list = []
        for field, values in obj.changes.items():
            if isinstance(values, dict) and 'old' in values and 'new' in values:
                changes_list.append(f"{field}: {values['old']} → {values['new']}")
            elif isinstance(values, list) and len(values) == 2:
                old_val, new_val = values
                changes_list.append(f"{field}: {old_val} → {new_val}")
            else:
                changes_list.append(f"{field}: {values}")
        
        return "; ".join(changes_list[:3]) + ("..." if len(changes_list) > 3 else "")

    def get_status_code_display(self, obj):
        """Get human-readable status code description."""
        if not obj.status_code:
            return "N/A"
        
        status_codes = {
            200: "OK",
            201: "Created", 
            204: "No Content",
            400: "Bad Request",
            401: "Unauthorized",
            403: "Forbidden",
            404: "Not Found",
            500: "Internal Server Error"
        }
        return status_codes.get(obj.status_code, f"HTTP {obj.status_code}")


# Enhanced Bulk Operation Serializer
class BulkOperationSerializer(serializers.ModelSerializer):
    initiated_by_username = serializers.CharField(source='initiated_by.username', read_only=True)
    initiated_by_email = serializers.CharField(source='initiated_by.email', read_only=True)
    operation_type_display = serializers.CharField(source='get_operation_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    # NEW: Connection management operations
    routers_count = serializers.SerializerMethodField()
    success_rate = serializers.SerializerMethodField()
    progress_percentage = serializers.SerializerMethodField()
    estimated_completion = serializers.SerializerMethodField()

    class Meta:
        model = BulkOperation
        fields = [
            "id", "operation_id", "operation_type", "operation_type_display", "routers", 
            "initiated_by", "initiated_by_username", "initiated_by_email", "status", "status_display",
            "results", "started_at", "completed_at", "error_message", "parameters", "progress",
            "routers_count", "success_rate", "progress_percentage", "estimated_completion"
        ]
        read_only_fields = ["id", "operation_id", "started_at"]

    def get_routers_count(self, obj):
        return obj.routers.count()

    def get_success_rate(self, obj):
        if not obj.results or 'completed' not in obj.results:
            return 0
        
        completed = len(obj.results['completed'])
        total = obj.routers.count()
        
        if total == 0:
            return 0
        
        return round((completed / total) * 100, 2)

    def get_progress_percentage(self, obj):
        return obj.progress

    def get_estimated_completion(self, obj):
        if obj.status == 'completed' and obj.completed_at:
            return obj.completed_at
        
        if obj.status != 'running' or obj.progress == 0:
            return None
        
        # Estimate based on progress
        time_elapsed = (timezone.now() - obj.started_at).total_seconds()
        if obj.progress > 0:
            total_time_estimated = (time_elapsed / obj.progress) * 100
            remaining_time = total_time_estimated - time_elapsed
            
            if remaining_time > 0:
                return timezone.now() + timedelta(seconds=remaining_time)
        
        return None


# Enhanced List Serializers with connection status
class RouterListSerializer(serializers.ModelSerializer):
    active_users_count = serializers.SerializerMethodField()
    health_score = serializers.SerializerMethodField()
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    connection_status_display = serializers.CharField(source='get_connection_status_display', read_only=True)
    configuration_status_display = serializers.CharField(source='get_configuration_status_display', read_only=True)
    latest_stats = serializers.SerializerMethodField()
    
    # NEW: Connection quality indicator
    connection_quality = serializers.SerializerMethodField()
    last_connection_test = serializers.SerializerMethodField()
    connection_test_success_rate = serializers.SerializerMethodField()
    
    # NEW: VPN status
    vpn_enabled = serializers.BooleanField(read_only=True)
    vpn_type_display = serializers.SerializerMethodField()

    class Meta:
        model = Router
        fields = [
            'id', 'name', 'ip', 'type', 'type_display', 'location', 
            'status', 'status_display', 'connection_status', 'connection_status_display',
            'configuration_status', 'configuration_status_display', 'ssid',
            'last_seen', 'last_connection_test', 'is_active', 'max_clients', 'firmware_version',
            'active_users_count', 'health_score', 'latest_stats', 'connection_quality',
            'connection_test_success_rate', 'vpn_enabled', 'vpn_type_display'
        ]

    def get_active_users_count(self, obj):
        return obj.get_active_users_count()

    def get_health_score(self, obj):
        latest_health = obj.health_checks.order_by('-timestamp').first()
        return latest_health.health_score if latest_health else 0

    def get_latest_stats(self, obj):
        latest_stats = obj.stats.order_by('-timestamp').first()
        if latest_stats:
            return {
                'cpu': latest_stats.cpu,
                'memory': latest_stats.memory,
                'clients': latest_stats.connected_clients_count,
                'uptime': latest_stats.uptime,
                'vpn_connections': latest_stats.vpn_connections,
            }
        return None

    def get_connection_quality(self, obj):
        quality_data = obj.get_connection_quality()
        return quality_data.get('quality', 'unknown')

    def get_last_connection_test(self, obj):
        if obj.last_connection_test:
            time_ago = timezone.now() - obj.last_connection_test
            if time_ago.days > 0:
                return f"{time_ago.days}d ago"
            elif time_ago.seconds > 3600:
                return f"{time_ago.seconds // 3600}h ago"
            else:
                return f"{time_ago.seconds // 60}m ago"
        return "Never"

    def get_connection_test_success_rate(self, obj):
        total_tests = obj.connection_tests.count()
        successful_tests = obj.connection_tests.filter(success=True).count()
        
        if total_tests == 0:
            return 0
        return round((successful_tests / total_tests) * 100, 2)

    def get_vpn_type_display(self, obj):
        """Get VPN type display name."""
        vpn_types = {
            "openvpn": "OpenVPN",
            "wireguard": "WireGuard", 
            "sstp": "SSTP"
        }
        return vpn_types.get(obj.vpn_type, obj.vpn_type)


class HotspotUserListSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client.user.username', read_only=True)
    client_phone = serializers.CharField(source='client.user.phone_number', read_only=True)
    router_name = serializers.CharField(source='router.name', read_only=True)
    router_ssid = serializers.CharField(source='router.ssid', read_only=True)
    router_connection_status = serializers.CharField(source='router.connection_status', read_only=True)
    plan_name = serializers.CharField(source='plan.name', read_only=True)
    remaining_time_formatted = serializers.SerializerMethodField()
    session_duration = serializers.SerializerMethodField()
    quality_of_service_display = serializers.SerializerMethodField()
    connection_quality_display = serializers.SerializerMethodField()

    class Meta:
        model = HotspotUser
        fields = [
            'id', 'mac', 'ip', 'client_name', 'client_phone', 'router_name', 'router_ssid', 'router_connection_status',
            'plan_name', 'connected_at', 'data_used', 'active', 'remaining_time', 
            'remaining_time_formatted', 'session_duration', 'quality_of_service', 'quality_of_service_display',
            'connection_quality', 'connection_quality_display', 'average_signal_strength'
        ]

    def get_remaining_time_formatted(self, obj):
        if obj.remaining_time <= 0:
            return "Expired"
        hours = obj.remaining_time // 3600
        minutes = (obj.remaining_time % 3600) // 60
        return f"{hours}h {minutes}m"

    def get_session_duration(self, obj):
        if obj.active:
            duration = (timezone.now() - obj.connected_at).total_seconds()
        else:
            duration = obj.total_session_time
        hours = int(duration // 3600)
        minutes = int((duration % 3600) // 60)
        return f"{hours}h {minutes}m"

    def get_quality_of_service_display(self, obj):
        quality_map = {
            "Residential": "Residential",
            "Business": "Business", 
            "Promotional": "Promotional",
            "Enterprise": "Enterprise"
        }
        return quality_map.get(obj.quality_of_service, obj.quality_of_service)

    def get_connection_quality_display(self, obj):
        quality_map = {
            "excellent": "Excellent",
            "good": "Good",
            "fair": "Fair",
            "poor": "Poor"
        }
        return quality_map.get(obj.connection_quality, obj.connection_quality)


class PPPoEUserListSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client.user.username', read_only=True)
    client_phone = serializers.CharField(source='client.user.phone_number', read_only=True)
    router_name = serializers.CharField(source='router.name', read_only=True)
    router_service_name = serializers.CharField(source='router.pppoe_configurations.service_name', read_only=True)
    router_connection_status = serializers.CharField(source='router.connection_status', read_only=True)
    plan_name = serializers.CharField(source='plan.name', read_only=True)
    remaining_time_formatted = serializers.SerializerMethodField()
    session_duration = serializers.SerializerMethodField()
    pppoe_service_type_display = serializers.SerializerMethodField()
    connection_quality_display = serializers.SerializerMethodField()

    class Meta:
        model = PPPoEUser
        fields = [
            'id', 'username', 'ip_address', 'client_name', 'client_phone', 'router_name', 
            'router_service_name', 'router_connection_status', 'plan_name', 'connected_at', 'data_used', 'active', 
            'remaining_time', 'remaining_time_formatted', 'session_duration', 'pppoe_service_type', 'pppoe_service_type_display',
            'connection_quality', 'connection_quality_display', 'connection_uptime'
        ]

    def get_remaining_time_formatted(self, obj):
        if obj.remaining_time <= 0:
            return "Expired"
        hours = obj.remaining_time // 3600
        minutes = (obj.remaining_time % 3600) // 60
        return f"{hours}h {minutes}m"

    def get_session_duration(self, obj):
        if obj.active:
            duration = (timezone.now() - obj.connected_at).total_seconds()
        else:
            duration = obj.total_session_time
        hours = int(duration // 3600)
        minutes = int((duration % 3600) // 60)
        return f"{hours}h {minutes}m"

    def get_pppoe_service_type_display(self, obj):
        service_map = {
            "standard": "Standard",
            "business": "Business",
            "premium": "Premium"
        }
        return service_map.get(obj.pppoe_service_type, obj.pppoe_service_type)

    def get_connection_quality_display(self, obj):
        quality_map = {
            "excellent": "Excellent",
            "good": "Good",
            "fair": "Fair",
            "poor": "Poor"
        }
        return quality_map.get(obj.connection_quality, obj.connection_quality)


# NEW: Connection Test Request Serializer
class ConnectionTestRequestSerializer(serializers.Serializer):
    """Serializer for connection test requests."""
    
    router_id = serializers.IntegerField(required=False)
    ip = serializers.IPAddressField(required=False)
    username = serializers.CharField(required=False)
    password = serializers.CharField(required=False)
    port = serializers.IntegerField(default=8728, min_value=1, max_value=65535)
    test_type = serializers.ChoiceField(
        choices=[('basic', 'Basic'), ('extended', 'Extended'), ('full', 'Full')],
        default='basic'
    )
    
    def validate(self, data):
        """Validate that either router_id or connection details are provided."""
        if not data.get('router_id') and not all([data.get('ip'), data.get('username'), data.get('password')]):
            raise serializers.ValidationError(
                "Either router_id or ip, username, and password must be provided"
            )
        return data


# NEW: Auto Configuration Request Serializer  
class AutoConfigurationRequestSerializer(serializers.Serializer):
    """Serializer for auto-configuration requests."""
    
    configuration_type = serializers.ChoiceField(
        choices=[('hotspot', 'Hotspot'), ('pppoe', 'PPPoE'), ('both', 'Both')]
    )
    ssid = serializers.CharField(required=False, max_length=32)
    configuration_template = serializers.CharField(required=False)
    auto_detect = serializers.BooleanField(default=True)
    
    # Hotspot specific parameters
    welcome_message = serializers.CharField(required=False, allow_blank=True)
    bandwidth_limit = serializers.CharField(default="10M")
    session_timeout = serializers.IntegerField(default=60, min_value=1, max_value=1440)
    max_users = serializers.IntegerField(default=50, min_value=1, max_value=1000)
    
    # PPPoE specific parameters
    ip_pool_name = serializers.CharField(default="pppoe-pool")
    service_name = serializers.CharField(required=False, max_length=64)
    mtu = serializers.IntegerField(default=1492, min_value=576, max_value=1500)
    dns_servers = serializers.CharField(default="8.8.8.8,1.1.1.1")
    
    def validate(self, data):
        """Validate configuration parameters based on type."""
        config_type = data.get('configuration_type')
        
        if config_type in ['hotspot', 'both'] and not data.get('ssid'):
            # Auto-generate SSID if not provided
            data['ssid'] = "Hotspot-WiFi"
            
        if config_type in ['pppoe', 'both'] and not data.get('service_name'):
            # Auto-generate service name if not provided
            data['service_name'] = "PPPoE-Service"
            
        return data


# NEW: Configuration Apply Request Serializer
class ConfigurationApplyRequestSerializer(serializers.Serializer):
    """Serializer for applying configurations to routers."""
    
    configuration_id = serializers.IntegerField(required=True)
    configuration_type = serializers.ChoiceField(
        choices=[('hotspot', 'Hotspot'), ('pppoe', 'PPPoE')],
        required=True
    )
    force_apply = serializers.BooleanField(default=False)
    test_connection_first = serializers.BooleanField(default=True)
    
    def validate(self, data):
        """Validate configuration application request."""
        # Additional validation can be added here based on configuration type
        return data


# NEW: VPN Configuration Request Serializer
class VPNConfigurationRequestSerializer(serializers.Serializer):
    """Serializer for VPN configuration requests."""
    
    vpn_type = serializers.ChoiceField(
        choices=[('openvpn', 'OpenVPN'), ('wireguard', 'WireGuard'), ('sstp', 'SSTP')],
        required=True
    )
    configuration = serializers.DictField(required=False)
    enable_vpn = serializers.BooleanField(default=True)


# Dashboard and Utility Serializers with enhanced connection data
class RouterDashboardStatsSerializer(serializers.Serializer):
    total_routers = serializers.IntegerField()
    online_routers = serializers.IntegerField()
    offline_routers = serializers.IntegerField()
    total_clients = serializers.IntegerField()
    active_hotspot_users = serializers.IntegerField()
    active_pppoe_users = serializers.IntegerField()
    average_health_score = serializers.FloatField()
    recent_alerts = serializers.ListField()
    total_data_used = serializers.IntegerField()
    system_health = serializers.DictField()
    
    # NEW: Connection statistics
    connected_routers = serializers.IntegerField()
    connection_success_rate = serializers.FloatField()
    average_response_time = serializers.FloatField()
    configuration_status = serializers.DictField()
    connection_quality_distribution = serializers.DictField()
    
    # NEW: VPN statistics
    vpn_enabled_routers = serializers.IntegerField()
    vpn_connections = serializers.IntegerField()
    vpn_types_distribution = serializers.DictField()


class RouterStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Router.STATUS_CHOICES)
    connection_status = serializers.ChoiceField(choices=Router.CONNECTION_STATUS_CHOICES, required=False)
    last_seen = serializers.DateTimeField(required=False)
    firmware_version = serializers.CharField(required=False, allow_blank=True)


class UserSessionSerializer(serializers.Serializer):
    session_id = serializers.UUIDField()
    remaining_time = serializers.IntegerField()
    data_used = serializers.IntegerField()
    connected_at = serializers.DateTimeField()
    user_type = serializers.ChoiceField(choices=[('hotspot', 'Hotspot'), ('pppoe', 'PPPoE')])
    client_info = serializers.DictField(required=False)
    # NEW: Router information
    router_ssid = serializers.CharField(required=False)
    router_service_name = serializers.CharField(required=False)
    router_connection_status = serializers.CharField(required=False)
    router_configuration_status = serializers.CharField(required=False)


class SessionRecoverySerializer(serializers.Serializer):
    phone_number = serializers.CharField(required=True)
    mac_address = serializers.CharField(required=False, allow_blank=True)
    username = serializers.CharField(required=False, allow_blank=True)
    recovery_method = serializers.ChoiceField(
        choices=[('auto', 'Auto'), ('manual', 'Manual')],
        default='auto'
    )
    router_id = serializers.IntegerField(required=False)

    def validate(self, data):
        if not data.get('mac_address') and not data.get('username'):
            raise serializers.ValidationError("Either MAC address or username is required for recovery")
        return data


class BulkActionSerializer(serializers.Serializer):
    router_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=True
    )
    action = serializers.ChoiceField(
        choices=[
            ('health_check', 'Health Check'),
            ('restart', 'Restart'),
            ('update_status', 'Update Status'),
            ('backup', 'Backup Configuration'),
            ('update_firmware', 'Update Firmware'),
            # NEW: Connection management actions
            ('test_connection', 'Test Connection'),
            ('auto_configure', 'Auto Configure'),
            ('apply_configuration', 'Apply Configuration'),
            ('enable_vpn', 'Enable VPN'),
            ('disable_vpn', 'Disable VPN'),
            ('technician_workflow', 'Technician Workflow')
        ],
        required=True
    )
    parameters = serializers.JSONField(required=False, default=dict)


class PaymentVerificationSerializer(serializers.Serializer):
    transaction_reference = serializers.CharField(required=True)
    client_id = serializers.IntegerField(required=True)
    plan_id = serializers.IntegerField(required=True)
    verification_type = serializers.ChoiceField(
        choices=[('automatic', 'Automatic'), ('manual', 'Manual')],
        default='automatic'
    )
    router_id = serializers.IntegerField(required=False)