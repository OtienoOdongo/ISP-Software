

# from rest_framework import serializers
# from network_management.models.router_management_model import (
#     Router, RouterStats, HotspotUser, PPPoEUser, ActivationAttempt, 
#     RouterSessionHistory, RouterHealthCheck, RouterCallbackConfig
# )
# from account.serializers.admin_serializer import ClientSerializer
# from internet_plans.serializers.create_plan_serializers import InternetPlanSerializer
# from payments.serializers.payment_config_serializer import TransactionSerializer

# class RouterCallbackConfigSerializer(serializers.ModelSerializer):  # NEW
#     class Meta:
#         model = RouterCallbackConfig
#         fields = [
#             "id", "router", "event", "callback_url", "security_level", 
#             "security_profile", "is_active", "retry_enabled", "max_retries", 
#             "timeout_seconds", "created_at", "updated_at"
#         ]
#         read_only_fields = ["id", "router", "created_at", "updated_at"]

# class RouterSerializer(serializers.ModelSerializer):
#     callback_configs = RouterCallbackConfigSerializer(many=True, read_only=True)  # UPDATED

#     class Meta:
#         model = Router
#         fields = [
#             "id", "name", "ip", "port", "username", "password", "type", 
#             "location", "status", "last_seen", "hotspot_config", "pppoe_config",  # UPDATED
#             "is_default", "captive_portal_enabled", "is_active", "callback_url", 
#             "callback_configs", "created_at", "updated_at"  # UPDATED
#         ]
#         read_only_fields = ["id", "last_seen", "created_at", "updated_at"]
#         extra_kwargs = {
#             'password': {'write_only': True}
#         }

# class RouterStatsSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = RouterStats
#         fields = [
#             "id", "router", "cpu", "memory", "connected_clients_count", "uptime", "signal", 
#             "temperature", "throughput", "disk", "timestamp"
#         ]
#         read_only_fields = ["id", "router", "timestamp"]

# class HotspotUserSerializer(serializers.ModelSerializer):
#     client = ClientSerializer(read_only=True)
#     plan = InternetPlanSerializer(read_only=True)
#     transaction = TransactionSerializer(read_only=True)
#     remaining_time_formatted = serializers.SerializerMethodField()

#     class Meta:
#         model = HotspotUser
#         fields = [
#             "id", "router", "client", "plan", "transaction", "mac", "ip", 
#             "connected_at", "disconnected_at", "data_used", "active", 
#             "latitude", "longitude", "location_data", "session_id", 
#             "total_session_time", "remaining_time", "remaining_time_formatted",
#             "last_activity"
#         ]
#         read_only_fields = ["id", "router", "connected_at", "session_id"]

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

# class PPPoEUserSerializer(serializers.ModelSerializer):  # NEW
#     client = ClientSerializer(read_only=True)
#     plan = InternetPlanSerializer(read_only=True)
#     transaction = TransactionSerializer(read_only=True)
#     remaining_time_formatted = serializers.SerializerMethodField()

#     class Meta:
#         model = PPPoEUser
#         fields = [
#             "id", "router", "client", "plan", "transaction", "username", "password",
#             "service_name", "ip_address", "connected_at", "disconnected_at", 
#             "data_used", "active", "session_id", "total_session_time", 
#             "remaining_time", "remaining_time_formatted", "last_activity"
#         ]
#         read_only_fields = ["id", "router", "connected_at", "session_id"]
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

# class ActivationAttemptSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = ActivationAttempt
#         fields = [
#             "id", "subscription", "router", "attempted_at", 
#             "success", "error_message", "retry_count", "user_type"  # UPDATED
#         ]
#         read_only_fields = ["id", "attempted_at"]

# class RouterSessionHistorySerializer(serializers.ModelSerializer):
#     class Meta:
#         model = RouterSessionHistory
#         fields = [
#             "id", "hotspot_user", "pppoe_user", "router", "start_time", "end_time",  # UPDATED
#             "data_used", "duration", "disconnected_reason", "user_type"  # UPDATED
#         ]
#         read_only_fields = ["id"]

# class RouterHealthCheckSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = RouterHealthCheck
#         fields = [
#             "id", "router", "timestamp", "is_online", 
#             "response_time", "error_message", "system_metrics"  # UPDATED
#         ]
#         read_only_fields = ["id", "timestamp"]







from rest_framework import serializers
from network_management.models.router_management_model import (
    Router, RouterStats, HotspotUser, PPPoEUser, ActivationAttempt, 
    RouterSessionHistory, RouterHealthCheck, RouterCallbackConfig,
    RouterAuditLog, BulkOperation  # NEW
)
from account.serializers.admin_serializer import ClientSerializer
from internet_plans.serializers.create_plan_serializers import InternetPlanSerializer
from payments.serializers.payment_config_serializer import TransactionSerializer
from django.utils import timezone
from datetime import timedelta

class RouterCallbackConfigSerializer(serializers.ModelSerializer):
    event_display = serializers.CharField(source='get_event_display', read_only=True)
    security_level_display = serializers.CharField(source='get_security_level_display', read_only=True)

    class Meta:
        model = RouterCallbackConfig
        fields = [
            "id", "router", "event", "event_display", "callback_url", "security_level", 
            "security_level_display", "security_profile", "is_active", "retry_enabled", "max_retries", 
            "timeout_seconds", "created_at", "updated_at"
        ]
        read_only_fields = ["id", "router", "created_at", "updated_at"]

class RouterSerializer(serializers.ModelSerializer):
    callback_configs = RouterCallbackConfigSerializer(many=True, read_only=True)
    active_users_count = serializers.SerializerMethodField()
    health_score = serializers.SerializerMethodField()
    system_metrics = serializers.SerializerMethodField()

    class Meta:
        model = Router
        fields = [
            "id", "name", "ip", "port", "username", "password", "type", 
            "location", "status", "last_seen", "hotspot_config", "pppoe_config",
            "is_default", "captive_portal_enabled", "is_active", "callback_url", 
            "callback_configs", "created_at", "updated_at",
            # NEW FIELDS
            "max_clients", "description", "firmware_version", "ssid",
            "active_users_count", "health_score", "system_metrics"
        ]
        read_only_fields = ["id", "last_seen", "created_at", "updated_at", "active_users_count", "health_score", "system_metrics"]
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def get_active_users_count(self, obj):
        return obj.get_active_users_count()

    def get_health_score(self, obj):
        # Get latest health score from cache or database
        from django.core.cache import cache
        cache_key = f"router:{obj.id}:health"
        cached_health = cache.get(cache_key)
        
        if cached_health:
            return cached_health.get('health_score', 0)
        
        latest_health = obj.health_checks.order_by('-timestamp').first()
        return latest_health.health_score if latest_health else 0

    def get_system_metrics(self, obj):
        # Get system metrics from latest stats
        latest_stats = obj.stats.order_by('-timestamp').first()
        if latest_stats:
            return {
                'cpu': latest_stats.cpu,
                'memory': latest_stats.memory,
                'clients': latest_stats.connected_clients_count,
                'throughput': latest_stats.throughput,
                'uptime': latest_stats.uptime,
            }
        return {}

class RouterStatsSerializer(serializers.ModelSerializer):
    class Meta:
        model = RouterStats
        fields = [
            "id", "router", "cpu", "memory", "connected_clients_count", "uptime", "signal", 
            "temperature", "throughput", "disk", "timestamp",
            # NEW FIELDS
            "upload_speed", "download_speed", "hotspot_clients", "pppoe_clients"
        ]
        read_only_fields = ["id", "router", "timestamp"]

class HotspotUserSerializer(serializers.ModelSerializer):
    client = ClientSerializer(read_only=True)
    plan = InternetPlanSerializer(read_only=True)
    transaction = TransactionSerializer(read_only=True)
    remaining_time_formatted = serializers.SerializerMethodField()
    session_duration = serializers.SerializerMethodField()
    bandwidth_usage = serializers.SerializerMethodField()

    class Meta:
        model = HotspotUser
        fields = [
            "id", "router", "client", "plan", "transaction", "mac", "ip", 
            "connected_at", "disconnected_at", "data_used", "active", 
            "latitude", "longitude", "location_data", "session_id", 
            "total_session_time", "remaining_time", "remaining_time_formatted",
            "last_activity", "session_duration", "bandwidth_usage",
            # NEW FIELDS
            "bandwidth_used", "quality_of_service", "device_info"
        ]
        read_only_fields = ["id", "router", "connected_at", "session_id"]

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

    def get_bandwidth_usage(self, obj):
        return {
            'upload': obj.bandwidth_used.get('upload', 0),
            'download': obj.bandwidth_used.get('download', 0),
            'total': obj.data_used
        }

class PPPoEUserSerializer(serializers.ModelSerializer):
    client = ClientSerializer(read_only=True)
    plan = InternetPlanSerializer(read_only=True)
    transaction = TransactionSerializer(read_only=True)
    remaining_time_formatted = serializers.SerializerMethodField()
    session_duration = serializers.SerializerMethodField()
    bandwidth_usage = serializers.SerializerMethodField()

    class Meta:
        model = PPPoEUser
        fields = [
            "id", "router", "client", "plan", "transaction", "username", "password",
            "service_name", "ip_address", "connected_at", "disconnected_at", 
            "data_used", "active", "session_id", "total_session_time", 
            "remaining_time", "remaining_time_formatted", "last_activity",
            "session_duration", "bandwidth_usage",
            # NEW FIELDS
            "bandwidth_used", "pppoe_service_type"
        ]
        read_only_fields = ["id", "router", "connected_at", "session_id"]
        extra_kwargs = {
            'password': {'write_only': True}
        }

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

    def get_bandwidth_usage(self, obj):
        return {
            'upload': obj.bandwidth_used.get('upload', 0),
            'download': obj.bandwidth_used.get('download', 0),
            'total': obj.data_used
        }

class ActivationAttemptSerializer(serializers.ModelSerializer):
    payment_status = serializers.SerializerMethodField()

    class Meta:
        model = ActivationAttempt
        fields = [
            "id", "subscription", "router", "attempted_at", 
            "success", "error_message", "retry_count", "user_type",
            # NEW FIELDS
            "payment_verified", "transaction_reference", "verification_method", "payment_status"
        ]
        read_only_fields = ["id", "attempted_at"]

    def get_payment_status(self, obj):
        if obj.payment_verified:
            return "verified"
        elif obj.transaction_reference:
            return "pending_verification"
        else:
            return "not_verified"

class RouterSessionHistorySerializer(serializers.ModelSerializer):
    client_info = serializers.SerializerMethodField()
    recoverable_display = serializers.SerializerMethodField()

    class Meta:
        model = RouterSessionHistory
        fields = [
            "id", "hotspot_user", "pppoe_user", "router", "start_time", "end_time", 
            "data_used", "duration", "disconnected_reason", "user_type",
            # NEW FIELDS
            "recoverable", "recovery_attempted", "recovered_at", "client_info", "recoverable_display"
        ]
        read_only_fields = ["id"]

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

class RouterHealthCheckSerializer(serializers.ModelSerializer):
    health_status = serializers.SerializerMethodField()

    class Meta:
        model = RouterHealthCheck
        fields = [
            "id", "router", "timestamp", "is_online", 
            "response_time", "error_message", "system_metrics",
            # NEW FIELDS
            "health_score", "critical_alerts", "performance_metrics", "health_status"
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

# NEW: Audit Log Serializer
class RouterAuditLogSerializer(serializers.ModelSerializer):
    action_display = serializers.CharField(source='get_action_display', read_only=True)
    user_username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = RouterAuditLog
        fields = [
            "id", "router", "action", "action_display", "description", 
            "user", "user_username", "ip_address", "user_agent", 
            "changes", "timestamp"
        ]
        read_only_fields = fields

# NEW: Bulk Operation Serializer
class BulkOperationSerializer(serializers.ModelSerializer):
    operation_type_display = serializers.CharField(source='get_operation_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    initiated_by_username = serializers.CharField(source='initiated_by.username', read_only=True)
    router_count = serializers.SerializerMethodField()
    progress = serializers.SerializerMethodField()

    class Meta:
        model = BulkOperation
        fields = [
            "operation_id", "operation_type", "operation_type_display", 
            "routers", "initiated_by", "initiated_by_username", "status", 
            "status_display", "results", "started_at", "completed_at", 
            "error_message", "router_count", "progress"
        ]
        read_only_fields = ["operation_id", "started_at", "completed_at"]

    def get_router_count(self, obj):
        return obj.routers.count()

    def get_progress(self, obj):
        completed = len(obj.results.get('completed', []))
        total = obj.routers.count()
        return {
            'completed': completed,
            'total': total,
            'percentage': (completed / total * 100) if total > 0 else 0
        }

# NEW: Session Recovery Serializer
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

# NEW: Bulk Action Serializer
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
            ('backup', 'Backup Configuration')
        ],
        required=True
    )
    parameters = serializers.JSONField(required=False, default=dict)

# NEW: Payment Verification Serializer
class PaymentVerificationSerializer(serializers.Serializer):
    transaction_reference = serializers.CharField(required=True)
    client_id = serializers.IntegerField(required=True)
    plan_id = serializers.IntegerField(required=True)
    verification_type = serializers.ChoiceField(
        choices=[('automatic', 'Automatic'), ('manual', 'Manual')],
        default='automatic'
    )