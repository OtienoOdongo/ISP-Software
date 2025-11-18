


# from rest_framework import serializers
# from network_management.models.router_management_model import (
#     Router, RouterStats, HotspotUser, PPPoEUser, ActivationAttempt, 
#     RouterSessionHistory, RouterHealthCheck, RouterCallbackConfig,
#     RouterAuditLog, BulkOperation, HotspotConfiguration, PPPoEConfiguration
# )
# from account.serializers.admin_serializer import ClientSerializer
# from internet_plans.serializers.create_plan_serializers import InternetPlanSerializer
# from payments.serializers.payment_config_serializer import TransactionSerializer
# from django.utils import timezone
# from datetime import timedelta
# from django.core.cache import cache

# class HotspotConfigurationSerializer(serializers.ModelSerializer):
#     router_name = serializers.CharField(source='router.name', read_only=True)
#     router_ip = serializers.CharField(source='router.ip', read_only=True)
#     landing_page_url = serializers.SerializerMethodField()
#     auth_method_display = serializers.CharField(source='get_auth_method_display', read_only=True)
    
#     class Meta:
#         model = HotspotConfiguration
#         fields = [
#             'id', 'router', 'router_name', 'router_ip', 'ssid', 'landing_page_file', 
#             'landing_page_url', 'redirect_url', 'bandwidth_limit', 'session_timeout',
#             'auth_method', 'auth_method_display', 'enable_splash_page', 'allow_social_login', 
#             'enable_bandwidth_shaping', 'log_user_activity', 'max_users',
#             'welcome_message', 'terms_conditions_url', 'created_at', 'updated_at'
#         ]
#         read_only_fields = ['id', 'created_at', 'updated_at', 'landing_page_url']
    
#     def get_landing_page_url(self, obj):
#         if obj.landing_page_file:
#             return obj.landing_page_file.url
#         return None

# class PPPoEConfigurationSerializer(serializers.ModelSerializer):
#     router_name = serializers.CharField(source='router.name', read_only=True)
#     router_ip = serializers.CharField(source='router.ip', read_only=True)
#     auth_methods_display = serializers.SerializerMethodField()
#     service_type_display = serializers.SerializerMethodField()
    
#     class Meta:
#         model = PPPoEConfiguration
#         fields = [
#             'id', 'router', 'router_name', 'router_ip', 'ip_pool_name', 'service_name',
#             'mtu', 'dns_servers', 'bandwidth_limit', 'auth_methods', 'auth_methods_display',
#             'enable_pap', 'enable_chap', 'enable_mschap', 'idle_timeout', 'session_timeout',
#             'default_profile', 'interface', 'ip_range_start', 'ip_range_end', 'service_type',
#             'service_type_display', 'created_at', 'updated_at'
#         ]
#         read_only_fields = ['id', 'created_at', 'updated_at']
    
#     def get_auth_methods_display(self, obj):
#         return dict(PPPoEConfiguration.AUTH_METHODS).get(obj.auth_methods, obj.auth_methods)
    
#     def get_service_type_display(self, obj):
#         return dict(PPPoEConfiguration.SERVICE_TYPES).get(obj.service_type, obj.service_type)

# class RouterCallbackConfigSerializer(serializers.ModelSerializer):
#     event_display = serializers.CharField(source='get_event_display', read_only=True)
#     security_level_display = serializers.CharField(source='get_security_level_display', read_only=True)
#     router_name = serializers.CharField(source='router.name', read_only=True)

#     class Meta:
#         model = RouterCallbackConfig
#         fields = [
#             "id", "router", "router_name", "event", "event_display", "callback_url", 
#             "security_level", "security_level_display", "security_profile", "is_active", 
#             "retry_enabled", "max_retries", "timeout_seconds", "created_at", "updated_at"
#         ]
#         read_only_fields = ["id", "created_at", "updated_at"]

# class RouterStatsSerializer(serializers.ModelSerializer):
#     router_name = serializers.CharField(source='router.name', read_only=True)
#     router_ip = serializers.CharField(source='router.ip', read_only=True)
#     router_status = serializers.CharField(source='router.status', read_only=True)

#     class Meta:
#         model = RouterStats
#         fields = [
#             "id", "router", "router_name", "router_ip", "router_status", "cpu", "memory", 
#             "connected_clients_count", "uptime", "signal", "temperature", "throughput", 
#             "disk", "timestamp", "upload_speed", "download_speed", "hotspot_clients", "pppoe_clients"
#         ]
#         read_only_fields = ["id", "router", "timestamp"]

# class RouterHealthCheckSerializer(serializers.ModelSerializer):
#     router_name = serializers.CharField(source='router.name', read_only=True)
#     router_ip = serializers.CharField(source='router.ip', read_only=True)
#     router_status = serializers.CharField(source='router.status', read_only=True)
#     health_status = serializers.SerializerMethodField()

#     class Meta:
#         model = RouterHealthCheck
#         fields = [
#             "id", "router", "router_name", "router_ip", "router_status", "timestamp", 
#             "is_online", "response_time", "error_message", "system_metrics", "health_score", 
#             "critical_alerts", "performance_metrics", "health_status"
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

# class RouterSerializer(serializers.ModelSerializer):
#     callback_configs = RouterCallbackConfigSerializer(many=True, read_only=True)
#     stats = RouterStatsSerializer(many=True, read_only=True)
#     health_checks = RouterHealthCheckSerializer(many=True, read_only=True)
#     hotspot_configuration = HotspotConfigurationSerializer(read_only=True)
#     pppoe_configuration = PPPoEConfigurationSerializer(read_only=True)
    
#     active_users_count = serializers.SerializerMethodField()
#     health_score = serializers.SerializerMethodField()
#     system_metrics = serializers.SerializerMethodField()
#     type_display = serializers.CharField(source='get_type_display', read_only=True)
#     status_display = serializers.CharField(source='get_status_display', read_only=True)
    
#     # Related counts
#     hotspot_users_count = serializers.SerializerMethodField()
#     pppoe_users_count = serializers.SerializerMethodField()
#     audit_logs_count = serializers.SerializerMethodField()

#     class Meta:
#         model = Router
#         fields = [
#             "id", "name", "ip", "port", "username", "password", "type", "type_display",
#             "location", "status", "status_display", "last_seen", "hotspot_config", "pppoe_config",
#             "is_default", "captive_portal_enabled", "is_active", "callback_url", 
#             "max_clients", "description", "firmware_version", "ssid",
#             "created_at", "updated_at",
#             # Related objects
#             "callback_configs", "stats", "health_checks", "hotspot_configuration", "pppoe_configuration",
#             # Computed fields
#             "active_users_count", "health_score", "system_metrics",
#             "hotspot_users_count", "pppoe_users_count", "audit_logs_count"
#         ]
#         read_only_fields = [
#             "id", "last_seen", "created_at", "updated_at", "active_users_count", 
#             "health_score", "system_metrics", "hotspot_users_count", "pppoe_users_count", 
#             "audit_logs_count", "callback_configs", "stats", "health_checks",
#             "hotspot_configuration", "pppoe_configuration"
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

# class HotspotUserSerializer(serializers.ModelSerializer):
#     client = ClientSerializer(read_only=True)
#     plan = InternetPlanSerializer(read_only=True)
#     transaction = TransactionSerializer(read_only=True)
#     router_name = serializers.CharField(source='router.name', read_only=True)
#     router_ip = serializers.CharField(source='router.ip', read_only=True)
    
#     # Computed fields
#     remaining_time_formatted = serializers.SerializerMethodField()
#     session_duration = serializers.SerializerMethodField()
#     session_duration_seconds = serializers.SerializerMethodField()
#     bandwidth_usage = serializers.SerializerMethodField()
#     quality_of_service_display = serializers.SerializerMethodField()

#     class Meta:
#         model = HotspotUser
#         fields = [
#             "id", "router", "router_name", "router_ip", "client", "plan", "transaction", 
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

# class PPPoEUserSerializer(serializers.ModelSerializer):
#     client = ClientSerializer(read_only=True)
#     plan = InternetPlanSerializer(read_only=True)
#     transaction = TransactionSerializer(read_only=True)
#     router_name = serializers.CharField(source='router.name', read_only=True)
#     router_ip = serializers.CharField(source='router.ip', read_only=True)
    
#     # Computed fields
#     remaining_time_formatted = serializers.SerializerMethodField()
#     session_duration = serializers.SerializerMethodField()
#     session_duration_seconds = serializers.SerializerMethodField()
#     bandwidth_usage = serializers.SerializerMethodField()
#     pppoe_service_type_display = serializers.SerializerMethodField()

#     class Meta:
#         model = PPPoEUser
#         fields = [
#             "id", "router", "router_name", "router_ip", "client", "plan", "transaction", 
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

# class ActivationAttemptSerializer(serializers.ModelSerializer):
#     router_name = serializers.CharField(source='router.name', read_only=True)
#     router_ip = serializers.CharField(source='router.ip', read_only=True)
#     subscription_details = serializers.CharField(source='subscription.plan.name', read_only=True, allow_null=True)
#     payment_status = serializers.SerializerMethodField()
#     verification_method_display = serializers.SerializerMethodField()
#     user_type_display = serializers.SerializerMethodField()

#     class Meta:
#         model = ActivationAttempt
#         fields = [
#             "id", "subscription", "subscription_details", "router", "router_name", "router_ip",
#             "attempted_at", "success", "error_message", "retry_count", "user_type", "user_type_display",
#             "payment_verified", "transaction_reference", "verification_method", "verification_method_display", "payment_status"
#         ]
#         read_only_fields = ["id", "attempted_at"]

#     def get_payment_status(self, obj):
#         if obj.payment_verified:
#             return "verified"
#         elif obj.transaction_reference:
#             return "pending_verification"
#         else:
#             return "not_verified"

#     def get_verification_method_display(self, obj):
#         method_map = {
#             "automatic": "Automatic",
#             "manual": "Manual"
#         }
#         return method_map.get(obj.verification_method, obj.verification_method)

#     def get_user_type_display(self, obj):
#         type_map = {
#             "hotspot": "Hotspot",
#             "pppoe": "PPPoE"
#         }
#         return type_map.get(obj.user_type, obj.user_type)

# class RouterSessionHistorySerializer(serializers.ModelSerializer):
#     router_name = serializers.CharField(source='router.name', read_only=True)
#     router_ip = serializers.CharField(source='router.ip', read_only=True)
#     hotspot_user_mac = serializers.CharField(source='hotspot_user.mac', read_only=True, allow_null=True)
#     pppoe_user_username = serializers.CharField(source='pppoe_user.username', read_only=True, allow_null=True)
#     client_info = serializers.SerializerMethodField()
#     recoverable_display = serializers.SerializerMethodField()
#     disconnected_reason_display = serializers.SerializerMethodField()
#     user_type_display = serializers.SerializerMethodField()
#     session_duration_formatted = serializers.SerializerMethodField()

#     class Meta:
#         model = RouterSessionHistory
#         fields = [
#             "id", "hotspot_user", "hotspot_user_mac", "pppoe_user", "pppoe_user_username",
#             "router", "router_name", "router_ip", "start_time", "end_time", "data_used", 
#             "duration", "session_duration_formatted", "disconnected_reason", "disconnected_reason_display",
#             "user_type", "user_type_display", "recoverable", "recovery_attempted", 
#             "recovered_at", "client_info", "recoverable_display"
#         ]
#         read_only_fields = ["id", "start_time", "end_time"]

#     def get_client_info(self, obj):
#         if obj.hotspot_user and obj.hotspot_user.client:
#             return {
#                 'username': obj.hotspot_user.client.user.username,
#                 'phone': obj.hotspot_user.client.user.phone_number
#             }
#         elif obj.pppoe_user and obj.pppoe_user.client:
#             return {
#                 'username': obj.pppoe_user.client.user.username,
#                 'phone': obj.pppoe_user.client.user.phone_number
#             }
#         return None

#     def get_recoverable_display(self, obj):
#         if obj.recoverable and not obj.recovery_attempted:
#             return "Recoverable"
#         elif obj.recovery_attempted and obj.recovered_at:
#             return "Recovered"
#         elif obj.recovery_attempted:
#             return "Recovery Failed"
#         else:
#             return "Not Recoverable"

#     def get_disconnected_reason_display(self, obj):
#         reason_map = {
#             "router_reboot": "Router Reboot",
#             "power_outage": "Power Outage", 
#             "manual_disconnect": "Manual Disconnect",
#             "session_timeout": "Session Timeout",
#             "router_switch": "Router Switch",
#             "payment_expired": "Payment Expired",
#             "bandwidth_exceeded": "Bandwidth Exceeded",
#             "suspicious_activity": "Suspicious Activity",
#         }
#         return reason_map.get(obj.disconnected_reason, obj.disconnected_reason)

#     def get_user_type_display(self, obj):
#         type_map = {
#             "hotspot": "Hotspot",
#             "pppoe": "PPPoE"
#         }
#         return type_map.get(obj.user_type, obj.user_type)

#     def get_session_duration_formatted(self, obj):
#         hours = obj.duration // 3600
#         minutes = (obj.duration % 3600) // 60
#         seconds = obj.duration % 60
#         return f"{hours}h {minutes}m {seconds}s"

# class RouterAuditLogSerializer(serializers.ModelSerializer):
#     action_display = serializers.CharField(source='get_action_display', read_only=True)
#     user_username = serializers.CharField(source='user.username', read_only=True)
#     user_email = serializers.CharField(source='user.email', read_only=True)
#     router_name = serializers.CharField(source='router.name', read_only=True)
#     router_ip = serializers.CharField(source='router.ip', read_only=True)

#     class Meta:
#         model = RouterAuditLog
#         fields = [
#             "id", "router", "router_name", "router_ip", "action", "action_display", "description", 
#             "user", "user_username", "user_email", "ip_address", "user_agent", 
#             "changes", "timestamp"
#         ]
#         read_only_fields = fields

# class BulkOperationSerializer(serializers.ModelSerializer):
#     operation_type_display = serializers.CharField(source='get_operation_type_display', read_only=True)
#     status_display = serializers.CharField(source='get_status_display', read_only=True)
#     initiated_by_username = serializers.CharField(source='initiated_by.username', read_only=True)
#     initiated_by_email = serializers.CharField(source='initiated_by.email', read_only=True)
#     router_count = serializers.SerializerMethodField()
#     progress = serializers.SerializerMethodField()
#     routers_info = serializers.SerializerMethodField()

#     class Meta:
#         model = BulkOperation
#         fields = [
#             "operation_id", "operation_type", "operation_type_display", 
#             "routers", "routers_info", "initiated_by", "initiated_by_username", "initiated_by_email", 
#             "status", "status_display", "results", "started_at", "completed_at", 
#             "error_message", "router_count", "progress"
#         ]
#         read_only_fields = ["operation_id", "started_at", "completed_at", "results"]

#     def get_router_count(self, obj):
#         return obj.routers.count()

#     def get_progress(self, obj):
#         completed = len(obj.results.get('completed', []))
#         total = obj.routers.count()
#         percentage = (completed / total * 100) if total > 0 else 0
#         return {
#             'completed': completed,
#             'total': total,
#             'percentage': round(percentage, 2)
#         }

#     def get_routers_info(self, obj):
#         return [
#             {
#                 'id': router.id,
#                 'name': router.name,
#                 'ip': router.ip,
#                 'status': router.status
#             }
#             for router in obj.routers.all()
#         ]

# # Simplified List Serializers
# class RouterListSerializer(serializers.ModelSerializer):
#     active_users_count = serializers.SerializerMethodField()
#     health_score = serializers.SerializerMethodField()
#     type_display = serializers.CharField(source='get_type_display', read_only=True)
#     status_display = serializers.CharField(source='get_status_display', read_only=True)
#     latest_stats = serializers.SerializerMethodField()

#     class Meta:
#         model = Router
#         fields = [
#             'id', 'name', 'ip', 'type', 'type_display', 'location', 'status', 'status_display',
#             'last_seen', 'is_active', 'max_clients', 'ssid', 'firmware_version',
#             'active_users_count', 'health_score', 'latest_stats'
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

# class HotspotUserListSerializer(serializers.ModelSerializer):
#     client_name = serializers.CharField(source='client.user.username', read_only=True)
#     client_phone = serializers.CharField(source='client.user.phone_number', read_only=True)
#     router_name = serializers.CharField(source='router.name', read_only=True)
#     plan_name = serializers.CharField(source='plan.name', read_only=True)
#     remaining_time_formatted = serializers.SerializerMethodField()
#     session_duration = serializers.SerializerMethodField()

#     class Meta:
#         model = HotspotUser
#         fields = [
#             'id', 'mac', 'ip', 'client_name', 'client_phone', 'router_name', 'plan_name',
#             'connected_at', 'data_used', 'active', 'remaining_time', 'remaining_time_formatted',
#             'session_duration', 'quality_of_service'
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

# class PPPoEUserListSerializer(serializers.ModelSerializer):
#     client_name = serializers.CharField(source='client.user.username', read_only=True)
#     client_phone = serializers.CharField(source='client.user.phone_number', read_only=True)
#     router_name = serializers.CharField(source='router.name', read_only=True)
#     plan_name = serializers.CharField(source='plan.name', read_only=True)
#     remaining_time_formatted = serializers.SerializerMethodField()
#     session_duration = serializers.SerializerMethodField()

#     class Meta:
#         model = PPPoEUser
#         fields = [
#             'id', 'username', 'ip_address', 'client_name', 'client_phone', 'router_name', 'plan_name',
#             'connected_at', 'data_used', 'active', 'remaining_time', 'remaining_time_formatted',
#             'session_duration', 'pppoe_service_type'
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

# # Dashboard and Utility Serializers
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

# class RouterStatusUpdateSerializer(serializers.Serializer):
#     status = serializers.ChoiceField(choices=Router.STATUS_CHOICES)
#     last_seen = serializers.DateTimeField(required=False)

# class UserSessionSerializer(serializers.Serializer):
#     session_id = serializers.UUIDField()
#     remaining_time = serializers.IntegerField()
#     data_used = serializers.IntegerField()
#     connected_at = serializers.DateTimeField()
#     user_type = serializers.ChoiceField(choices=[('hotspot', 'Hotspot'), ('pppoe', 'PPPoE')])
#     client_info = serializers.DictField(required=False)

# class SessionRecoverySerializer(serializers.Serializer):
#     phone_number = serializers.CharField(required=True)
#     mac_address = serializers.CharField(required=False, allow_blank=True)
#     username = serializers.CharField(required=False, allow_blank=True)
#     recovery_method = serializers.ChoiceField(
#         choices=[('auto', 'Auto'), ('manual', 'Manual')],
#         default='auto'
#     )

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
#             ('update_firmware', 'Update Firmware')
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















from rest_framework import serializers
from network_management.models.router_management_model import (
    Router, RouterStats, HotspotUser, PPPoEUser, ActivationAttempt, 
    RouterSessionHistory, RouterHealthCheck, RouterCallbackConfig,
    RouterAuditLog, BulkOperation, HotspotConfiguration, PPPoEConfiguration
)
from account.serializers.admin_serializer import ClientSerializer
from payments.serializers.payment_config_serializer import TransactionSerializer
from django.utils import timezone
from datetime import timedelta
from django.core.cache import cache

class HotspotConfigurationSerializer(serializers.ModelSerializer):
    router_name = serializers.CharField(source='router.name', read_only=True)
    router_ip = serializers.CharField(source='router.ip', read_only=True)
    landing_page_url = serializers.SerializerMethodField()
    auth_method_display = serializers.CharField(source='get_auth_method_display', read_only=True)
    
    class Meta:
        model = HotspotConfiguration
        fields = [
            'id', 'router', 'router_name', 'router_ip', 'ssid', 'landing_page_file', 
            'landing_page_url', 'redirect_url', 'bandwidth_limit', 'session_timeout',
            'auth_method', 'auth_method_display', 'enable_splash_page', 'allow_social_login', 
            'enable_bandwidth_shaping', 'log_user_activity', 'max_users',
            'welcome_message', 'terms_conditions_url', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'landing_page_url']
    
    def get_landing_page_url(self, obj):
        if obj.landing_page_file:
            return obj.landing_page_file.url
        return None

class PPPoEConfigurationSerializer(serializers.ModelSerializer):
    router_name = serializers.CharField(source='router.name', read_only=True)
    router_ip = serializers.CharField(source='router.ip', read_only=True)
    auth_methods_display = serializers.SerializerMethodField()
    service_type_display = serializers.SerializerMethodField()
    
    class Meta:
        model = PPPoEConfiguration
        fields = [
            'id', 'router', 'router_name', 'router_ip', 'ip_pool_name', 'service_name',
            'mtu', 'dns_servers', 'bandwidth_limit', 'auth_methods', 'auth_methods_display',
            'enable_pap', 'enable_chap', 'enable_mschap', 'idle_timeout', 'session_timeout',
            'default_profile', 'interface', 'ip_range_start', 'ip_range_end', 'service_type',
            'service_type_display', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_auth_methods_display(self, obj):
        return dict(PPPoEConfiguration.AUTH_METHODS).get(obj.auth_methods, obj.auth_methods)
    
    def get_service_type_display(self, obj):
        return dict(PPPoEConfiguration.SERVICE_TYPES).get(obj.service_type, obj.service_type)

class RouterCallbackConfigSerializer(serializers.ModelSerializer):
    event_display = serializers.CharField(source='get_event_display', read_only=True)
    security_level_display = serializers.CharField(source='get_security_level_display', read_only=True)
    router_name = serializers.CharField(source='router.name', read_only=True)

    class Meta:
        model = RouterCallbackConfig
        fields = [
            "id", "router", "router_name", "event", "event_display", "callback_url", 
            "security_level", "security_level_display", "security_profile", "is_active", 
            "retry_enabled", "max_retries", "timeout_seconds", "created_at", "updated_at"
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

class RouterStatsSerializer(serializers.ModelSerializer):
    router_name = serializers.CharField(source='router.name', read_only=True)
    router_ip = serializers.CharField(source='router.ip', read_only=True)
    router_status = serializers.CharField(source='router.status', read_only=True)

    class Meta:
        model = RouterStats
        fields = [
            "id", "router", "router_name", "router_ip", "router_status", "cpu", "memory", 
            "connected_clients_count", "uptime", "signal", "temperature", "throughput", 
            "disk", "timestamp", "upload_speed", "download_speed", "hotspot_clients", "pppoe_clients"
        ]
        read_only_fields = ["id", "router", "timestamp"]

class RouterHealthCheckSerializer(serializers.ModelSerializer):
    router_name = serializers.CharField(source='router.name', read_only=True)
    router_ip = serializers.CharField(source='router.ip', read_only=True)
    router_status = serializers.CharField(source='router.status', read_only=True)
    health_status = serializers.SerializerMethodField()

    class Meta:
        model = RouterHealthCheck
        fields = [
            "id", "router", "router_name", "router_ip", "router_status", "timestamp", 
            "is_online", "response_time", "error_message", "system_metrics", "health_score", 
            "critical_alerts", "performance_metrics", "health_status"
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

class RouterSerializer(serializers.ModelSerializer):
    callback_configs = RouterCallbackConfigSerializer(many=True, read_only=True)
    stats = RouterStatsSerializer(many=True, read_only=True)
    health_checks = RouterHealthCheckSerializer(many=True, read_only=True)
    hotspot_configuration = HotspotConfigurationSerializer(read_only=True)
    pppoe_configuration = PPPoEConfigurationSerializer(read_only=True)
    
    active_users_count = serializers.SerializerMethodField()
    health_score = serializers.SerializerMethodField()
    system_metrics = serializers.SerializerMethodField()
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    # Related counts
    hotspot_users_count = serializers.SerializerMethodField()
    pppoe_users_count = serializers.SerializerMethodField()
    audit_logs_count = serializers.SerializerMethodField()

    class Meta:
        model = Router
        fields = [
            "id", "name", "ip", "port", "username", "password", "type", "type_display",
            "location", "status", "status_display", "last_seen", "hotspot_config", "pppoe_config",
            "is_default", "captive_portal_enabled", "is_active", "callback_url", 
            "max_clients", "description", "firmware_version", "ssid",
            "created_at", "updated_at",
            # Related objects
            "callback_configs", "stats", "health_checks", "hotspot_configuration", "pppoe_configuration",
            # Computed fields
            "active_users_count", "health_score", "system_metrics",
            "hotspot_users_count", "pppoe_users_count", "audit_logs_count"
        ]
        read_only_fields = [
            "id", "last_seen", "created_at", "updated_at", "active_users_count", 
            "health_score", "system_metrics", "hotspot_users_count", "pppoe_users_count", 
            "audit_logs_count", "callback_configs", "stats", "health_checks",
            "hotspot_configuration", "pppoe_configuration"
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
            }
        return {}

    def get_hotspot_users_count(self, obj):
        return obj.hotspot_users.count()

    def get_pppoe_users_count(self, obj):
        return obj.pppoe_users.count()

    def get_audit_logs_count(self, obj):
        return obj.audit_logs.count()

class HotspotUserSerializer(serializers.ModelSerializer):
    client = ClientSerializer(read_only=True)
    plan = serializers.SerializerMethodField()  # Changed from direct import
    transaction = TransactionSerializer(read_only=True)
    router_name = serializers.CharField(source='router.name', read_only=True)
    router_ip = serializers.CharField(source='router.ip', read_only=True)
    
    # Computed fields
    remaining_time_formatted = serializers.SerializerMethodField()
    session_duration = serializers.SerializerMethodField()
    session_duration_seconds = serializers.SerializerMethodField()
    bandwidth_usage = serializers.SerializerMethodField()
    quality_of_service_display = serializers.SerializerMethodField()

    class Meta:
        model = HotspotUser
        fields = [
            "id", "router", "router_name", "router_ip", "client", "plan", "transaction", 
            "mac", "ip", "connected_at", "disconnected_at", "data_used", "active", 
            "latitude", "longitude", "location_data", "session_id", 
            "total_session_time", "remaining_time", "remaining_time_formatted",
            "last_activity", "session_duration", "session_duration_seconds",
            "bandwidth_used", "bandwidth_usage", "quality_of_service", "quality_of_service_display",
            "device_info"
        ]
        read_only_fields = [
            "id", "router", "connected_at", "disconnected_at", "session_id", 
            "last_activity", "remaining_time_formatted", "session_duration", 
            "session_duration_seconds", "bandwidth_usage", "quality_of_service_display"
        ]

    def get_plan(self, obj):
        # Lazy import to avoid circular dependency
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

class PPPoEUserSerializer(serializers.ModelSerializer):
    client = ClientSerializer(read_only=True)
    plan = serializers.SerializerMethodField()  # Changed from direct import
    transaction = TransactionSerializer(read_only=True)
    router_name = serializers.CharField(source='router.name', read_only=True)
    router_ip = serializers.CharField(source='router.ip', read_only=True)
    
    # Computed fields
    remaining_time_formatted = serializers.SerializerMethodField()
    session_duration = serializers.SerializerMethodField()
    session_duration_seconds = serializers.SerializerMethodField()
    bandwidth_usage = serializers.SerializerMethodField()
    pppoe_service_type_display = serializers.SerializerMethodField()

    class Meta:
        model = PPPoEUser
        fields = [
            "id", "router", "router_name", "router_ip", "client", "plan", "transaction", 
            "username", "password", "service_name", "ip_address", "connected_at", 
            "disconnected_at", "data_used", "active", "session_id", "total_session_time", 
            "remaining_time", "remaining_time_formatted", "last_activity", "session_duration",
            "session_duration_seconds", "bandwidth_used", "bandwidth_usage", 
            "pppoe_service_type", "pppoe_service_type_display"
        ]
        read_only_fields = [
            "id", "router", "connected_at", "disconnected_at", "session_id", 
            "last_activity", "remaining_time_formatted", "session_duration",
            "session_duration_seconds", "bandwidth_usage", "pppoe_service_type_display"
        ]
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def get_plan(self, obj):
        # Lazy import to avoid circular dependency
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

class ActivationAttemptSerializer(serializers.ModelSerializer):
    router_name = serializers.CharField(source='router.name', read_only=True)
    router_ip = serializers.CharField(source='router.ip', read_only=True)
    subscription_details = serializers.CharField(source='subscription.plan.name', read_only=True, allow_null=True)
    payment_status = serializers.SerializerMethodField()
    verification_method_display = serializers.SerializerMethodField()
    user_type_display = serializers.SerializerMethodField()

    class Meta:
        model = ActivationAttempt
        fields = [
            "id", "subscription", "subscription_details", "router", "router_name", "router_ip",
            "attempted_at", "success", "error_message", "retry_count", "user_type", "user_type_display",
            "payment_verified", "transaction_reference", "verification_method", "verification_method_display", "payment_status"
        ]
        read_only_fields = ["id", "attempted_at"]

    def get_payment_status(self, obj):
        if obj.payment_verified:
            return "verified"
        elif obj.transaction_reference:
            return "pending_verification"
        else:
            return "not_verified"

    def get_verification_method_display(self, obj):
        method_map = {
            "automatic": "Automatic",
            "manual": "Manual"
        }
        return method_map.get(obj.verification_method, obj.verification_method)

    def get_user_type_display(self, obj):
        type_map = {
            "hotspot": "Hotspot",
            "pppoe": "PPPoE"
        }
        return type_map.get(obj.user_type, obj.user_type)

class RouterSessionHistorySerializer(serializers.ModelSerializer):
    router_name = serializers.CharField(source='router.name', read_only=True)
    router_ip = serializers.CharField(source='router.ip', read_only=True)
    hotspot_user_mac = serializers.CharField(source='hotspot_user.mac', read_only=True, allow_null=True)
    pppoe_user_username = serializers.CharField(source='pppoe_user.username', read_only=True, allow_null=True)
    client_info = serializers.SerializerMethodField()
    recoverable_display = serializers.SerializerMethodField()
    disconnected_reason_display = serializers.SerializerMethodField()
    user_type_display = serializers.SerializerMethodField()
    session_duration_formatted = serializers.SerializerMethodField()

    class Meta:
        model = RouterSessionHistory
        fields = [
            "id", "hotspot_user", "hotspot_user_mac", "pppoe_user", "pppoe_user_username",
            "router", "router_name", "router_ip", "start_time", "end_time", "data_used", 
            "duration", "session_duration_formatted", "disconnected_reason", "disconnected_reason_display",
            "user_type", "user_type_display", "recoverable", "recovery_attempted", 
            "recovered_at", "client_info", "recoverable_display"
        ]
        read_only_fields = ["id", "start_time", "end_time"]

    def get_client_info(self, obj):
        if obj.hotspot_user and obj.hotspot_user.client:
            return {
                'username': obj.hotspot_user.client.user.username,
                'phone': obj.hotspot_user.client.user.phone_number
            }
        elif obj.pppoe_user and obj.pppoe_user.client:
            return {
                'username': obj.pppoe_user.client.user.username,
                'phone': obj.pppoe_user.client.user.phone_number
            }
        return None

    def get_recoverable_display(self, obj):
        if obj.recoverable and not obj.recovery_attempted:
            return "Recoverable"
        elif obj.recovery_attempted and obj.recovered_at:
            return "Recovered"
        elif obj.recovery_attempted:
            return "Recovery Failed"
        else:
            return "Not Recoverable"

    def get_disconnected_reason_display(self, obj):
        reason_map = {
            "router_reboot": "Router Reboot",
            "power_outage": "Power Outage", 
            "manual_disconnect": "Manual Disconnect",
            "session_timeout": "Session Timeout",
            "router_switch": "Router Switch",
            "payment_expired": "Payment Expired",
            "bandwidth_exceeded": "Bandwidth Exceeded",
            "suspicious_activity": "Suspicious Activity",
        }
        return reason_map.get(obj.disconnected_reason, obj.disconnected_reason)

    def get_user_type_display(self, obj):
        type_map = {
            "hotspot": "Hotspot",
            "pppoe": "PPPoE"
        }
        return type_map.get(obj.user_type, obj.user_type)

    def get_session_duration_formatted(self, obj):
        hours = obj.duration // 3600
        minutes = (obj.duration % 3600) // 60
        seconds = obj.duration % 60
        return f"{hours}h {minutes}m {seconds}s"

class RouterAuditLogSerializer(serializers.ModelSerializer):
    action_display = serializers.CharField(source='get_action_display', read_only=True)
    user_username = serializers.CharField(source='user.username', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    router_name = serializers.CharField(source='router.name', read_only=True)
    router_ip = serializers.CharField(source='router.ip', read_only=True)

    class Meta:
        model = RouterAuditLog
        fields = [
            "id", "router", "router_name", "router_ip", "action", "action_display", "description", 
            "user", "user_username", "user_email", "ip_address", "user_agent", 
            "changes", "timestamp"
        ]
        read_only_fields = fields

class BulkOperationSerializer(serializers.ModelSerializer):
    operation_type_display = serializers.CharField(source='get_operation_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    initiated_by_username = serializers.CharField(source='initiated_by.username', read_only=True)
    initiated_by_email = serializers.CharField(source='initiated_by.email', read_only=True)
    router_count = serializers.SerializerMethodField()
    progress = serializers.SerializerMethodField()
    routers_info = serializers.SerializerMethodField()

    class Meta:
        model = BulkOperation
        fields = [
            "operation_id", "operation_type", "operation_type_display", 
            "routers", "routers_info", "initiated_by", "initiated_by_username", "initiated_by_email", 
            "status", "status_display", "results", "started_at", "completed_at", 
            "error_message", "router_count", "progress"
        ]
        read_only_fields = ["operation_id", "started_at", "completed_at", "results"]

    def get_router_count(self, obj):
        return obj.routers.count()

    def get_progress(self, obj):
        completed = len(obj.results.get('completed', []))
        total = obj.routers.count()
        percentage = (completed / total * 100) if total > 0 else 0
        return {
            'completed': completed,
            'total': total,
            'percentage': round(percentage, 2)
        }

    def get_routers_info(self, obj):
        return [
            {
                'id': router.id,
                'name': router.name,
                'ip': router.ip,
                'status': router.status
            }
            for router in obj.routers.all()
        ]

# Simplified List Serializers
class RouterListSerializer(serializers.ModelSerializer):
    active_users_count = serializers.SerializerMethodField()
    health_score = serializers.SerializerMethodField()
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    latest_stats = serializers.SerializerMethodField()

    class Meta:
        model = Router
        fields = [
            'id', 'name', 'ip', 'type', 'type_display', 'location', 'status', 'status_display',
            'last_seen', 'is_active', 'max_clients', 'ssid', 'firmware_version',
            'active_users_count', 'health_score', 'latest_stats'
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
            }
        return None

class HotspotUserListSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client.user.username', read_only=True)
    client_phone = serializers.CharField(source='client.user.phone_number', read_only=True)
    router_name = serializers.CharField(source='router.name', read_only=True)
    plan_name = serializers.CharField(source='plan.name', read_only=True)
    remaining_time_formatted = serializers.SerializerMethodField()
    session_duration = serializers.SerializerMethodField()

    class Meta:
        model = HotspotUser
        fields = [
            'id', 'mac', 'ip', 'client_name', 'client_phone', 'router_name', 'plan_name',
            'connected_at', 'data_used', 'active', 'remaining_time', 'remaining_time_formatted',
            'session_duration', 'quality_of_service'
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

class PPPoEUserListSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client.user.username', read_only=True)
    client_phone = serializers.CharField(source='client.user.phone_number', read_only=True)
    router_name = serializers.CharField(source='router.name', read_only=True)
    plan_name = serializers.CharField(source='plan.name', read_only=True)
    remaining_time_formatted = serializers.SerializerMethodField()
    session_duration = serializers.SerializerMethodField()

    class Meta:
        model = PPPoEUser
        fields = [
            'id', 'username', 'ip_address', 'client_name', 'client_phone', 'router_name', 'plan_name',
            'connected_at', 'data_used', 'active', 'remaining_time', 'remaining_time_formatted',
            'session_duration', 'pppoe_service_type'
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

# Dashboard and Utility Serializers
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

class RouterStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Router.STATUS_CHOICES)
    last_seen = serializers.DateTimeField(required=False)

class UserSessionSerializer(serializers.Serializer):
    session_id = serializers.UUIDField()
    remaining_time = serializers.IntegerField()
    data_used = serializers.IntegerField()
    connected_at = serializers.DateTimeField()
    user_type = serializers.ChoiceField(choices=[('hotspot', 'Hotspot'), ('pppoe', 'PPPoE')])
    client_info = serializers.DictField(required=False)

class SessionRecoverySerializer(serializers.Serializer):
    phone_number = serializers.CharField(required=True)
    mac_address = serializers.CharField(required=False, allow_blank=True)
    username = serializers.CharField(required=False, allow_blank=True)
    recovery_method = serializers.ChoiceField(
        choices=[('auto', 'Auto'), ('manual', 'Manual')],
        default='auto'
    )

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
            ('update_firmware', 'Update Firmware')
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