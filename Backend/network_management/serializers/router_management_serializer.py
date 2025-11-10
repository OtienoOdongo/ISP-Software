




# from django.db import models
# from django.utils import timezone
# from django.core.validators import MinValueValidator, MaxValueValidator
# import uuid
# from django.conf import settings
# from django.core.cache import cache  
# import json
# from datetime import datetime, timedelta

# class Router(models.Model):
#     ROUTER_TYPES = (
#         ("mikrotik", "MikroTik"),
#         ("ubiquiti", "Ubiquiti"),
#         ("cisco", "Cisco"),
#         ("other", "Other"),
#     )
#     STATUS_CHOICES = (
#         ("connected", "Connected"),
#         ("disconnected", "Disconnected"),
#         ("updating", "Updating"),
#         ("error", "Error"),
#     )

#     name = models.CharField(max_length=100)
#     ip = models.GenericIPAddressField()
#     port = models.PositiveIntegerField(default=8728)
#     username = models.CharField(max_length=100, default="admin")
#     password = models.CharField(max_length=100, blank=True)
#     type = models.CharField(max_length=20, choices=ROUTER_TYPES, default="mikrotik")
#     location = models.CharField(max_length=100, blank=True, null=True)
#     status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="disconnected")
#     last_seen = models.DateTimeField(default=timezone.now)
#     hotspot_config = models.JSONField(blank=True, null=True)
#     pppoe_config = models.JSONField(blank=True, null=True)
#     is_default = models.BooleanField(default=False)
#     captive_portal_enabled = models.BooleanField(default=True)
#     is_active = models.BooleanField(default=True)
#     callback_url = models.URLField(max_length=500, blank=True, null=True)
    
#     max_clients = models.PositiveIntegerField(default=50, validators=[MinValueValidator(1), MaxValueValidator(1000)])
#     description = models.TextField(blank=True, null=True)
#     firmware_version = models.CharField(max_length=50, blank=True, null=True)
#     ssid = models.CharField(max_length=100, blank=True, null=True, default="SurfZone-WiFi")
    
#     created_at = models.DateTimeField(default=timezone.now)
#     updated_at = models.DateTimeField(auto_now=True)

#     def __str__(self):
#         return f"{self.name} ({self.ip}) - {self.type}"

#     class Meta:
#         ordering = ["-is_default", "name"]
#         indexes = [
#             models.Index(fields=['status', 'is_active']),
#             models.Index(fields=['type']),
#             models.Index(fields=['ssid']),  
#         ]

#     def save(self, *args, **kwargs):
#         # Cache router data for quick access
#         super().save(*args, **kwargs)
#         self.cache_router_data()

#     def cache_router_data(self):
#         """Cache router data for quick access using Django cache"""
#         cache_key = f"router:{self.id}:data"
#         router_data = {
#             'id': self.id,
#             'name': self.name,
#             'ip': self.ip,
#             'status': self.status,
#             'type': self.type,
#             'max_clients': self.max_clients,
#             'ssid': self.ssid,
#             'last_seen': self.last_seen.isoformat(),
#         }
#         #  Use Django cache instead of direct redis
#         cache.set(cache_key, router_data, 300)  # Cache for 5 minutes

#     def get_active_users_count(self):
#         """Get active users count using Django cache"""
#         cache_key = f"router:{self.id}:active_users"
#         cached_count = cache.get(cache_key)
        
#         if cached_count is not None:
#             return int(cached_count)
        
#         # Calculate and cache
#         hotspot_count = self.hotspot_users.filter(active=True).count()
#         pppoe_count = self.pppoe_users.filter(active=True).count()
#         total_count = hotspot_count + pppoe_count
        
        
#         cache.set(cache_key, total_count, 60)  # Cache for 1 minute
#         return total_count

# class HotspotConfiguration(models.Model):
#     """Enhanced Hotspot Configuration Model"""
#     AUTH_METHODS = (
#         ('universal', 'Universal (Payment-based)'),
#         ('voucher', 'Voucher-based'),
#         ('radius', 'RADIUS Authentication'),
#         ('mixed', 'Mixed Mode'),
#     )
    
#     router = models.OneToOneField(Router, on_delete=models.CASCADE, related_name="hotspot_configuration")
#     ssid = models.CharField(max_length=100, default="SurfZone-WiFi")
#     landing_page_file = models.FileField(upload_to='hotspot_landing_pages/', null=True, blank=True)
#     redirect_url = models.URLField(default="http://captive.surfzone.local")
#     bandwidth_limit = models.CharField(max_length=20, default="10M")
#     session_timeout = models.IntegerField(default=60)  # minutes
#     auth_method = models.CharField(max_length=20, choices=AUTH_METHODS, default='universal')
    
#     # Advanced settings
#     enable_splash_page = models.BooleanField(default=True)
#     allow_social_login = models.BooleanField(default=False)
#     enable_bandwidth_shaping = models.BooleanField(default=True)
#     log_user_activity = models.BooleanField(default=True)
    
#     # Additional settings
#     max_users = models.IntegerField(default=50)
#     welcome_message = models.TextField(blank=True)
#     terms_conditions_url = models.URLField(blank=True)
    
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)

#     def __str__(self):
#         return f"Hotspot Config - {self.router.name}"

# class PPPoEConfiguration(models.Model):
#     """Enhanced PPPoE Configuration Model"""
#     SERVICE_TYPES = (
#         ('standard', 'Standard'),
#         ('business', 'Business'),
#         ('premium', 'Premium'),
#     )
    
#     AUTH_METHODS = (
#         ('pap', 'PAP'),
#         ('chap', 'CHAP'),
#         ('mschap', 'MS-CHAP'),
#         ('all', 'All Methods'),
#     )
    
#     router = models.OneToOneField(Router, on_delete=models.CASCADE, related_name="pppoe_configuration")
#     ip_pool_name = models.CharField(max_length=100, default="pppoe-pool-1")
#     service_name = models.CharField(max_length=100, blank=True)
#     mtu = models.IntegerField(default=1492)
#     dns_servers = models.CharField(max_length=200, default="8.8.8.8,1.1.1.1")
#     bandwidth_limit = models.CharField(max_length=20, default="10M")
    
#     # Authentication settings
#     auth_methods = models.CharField(max_length=20, choices=AUTH_METHODS, default='all')
#     enable_pap = models.BooleanField(default=True)
#     enable_chap = models.BooleanField(default=True)
#     enable_mschap = models.BooleanField(default=True)
    
#     # Advanced settings
#     idle_timeout = models.IntegerField(default=300)  # seconds
#     session_timeout = models.IntegerField(default=0)  # 0 = unlimited
#     default_profile = models.CharField(max_length=50, default="default")
#     interface = models.CharField(max_length=50, default="bridge")
    
#     # IP Pool configuration
#     ip_range_start = models.GenericIPAddressField(default="192.168.100.10")
#     ip_range_end = models.GenericIPAddressField(default="192.168.100.200")
#     service_type = models.CharField(max_length=20, choices=SERVICE_TYPES, default='standard')
    
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)

#     def __str__(self):
#         return f"PPPoE Config - {self.router.name}"

# class RouterStats(models.Model):
#     router = models.ForeignKey(Router, on_delete=models.CASCADE, related_name="stats")
#     cpu = models.FloatField(validators=[MinValueValidator(0), MaxValueValidator(100)])
#     memory = models.FloatField(validators=[MinValueValidator(0), MaxValueValidator(100)])
#     connected_clients_count = models.IntegerField(validators=[MinValueValidator(0)])
#     uptime = models.CharField(max_length=50)  # Increased length for detailed uptime
#     signal = models.IntegerField(null=True, blank=True)  # Can be negative
#     temperature = models.FloatField(help_text="in °C", null=True, blank=True)
#     throughput = models.FloatField(help_text="in Mbps", validators=[MinValueValidator(0)])
#     disk = models.FloatField(validators=[MinValueValidator(0), MaxValueValidator(100)])
#     timestamp = models.DateTimeField(default=timezone.now)

#     # NEW FIELDS for enhanced monitoring
#     upload_speed = models.FloatField(help_text="in Mbps", default=0, validators=[MinValueValidator(0)])
#     download_speed = models.FloatField(help_text="in Mbps", default=0, validators=[MinValueValidator(0)])
#     hotspot_clients = models.IntegerField(default=0, validators=[MinValueValidator(0)])
#     pppoe_clients = models.IntegerField(default=0, validators=[MinValueValidator(0)])

#     def __str__(self):
#         return f"Stats for {self.router.name} at {self.timestamp}"

#     class Meta:
#         ordering = ["-timestamp"]
#         indexes = [
#             models.Index(fields=['router', 'timestamp']),
#         ]

#     def save(self, *args, **kwargs):
#         super().save(*args, **kwargs)
#         self.cache_latest_stats()

#     def cache_latest_stats(self):
#         """Cache latest stats for quick access using Django cache"""
#         cache_key = f"router:{self.router.id}:latest_stats"
#         stats_data = {
#             'cpu': self.cpu,
#             'memory': self.memory,
#             'clients': self.connected_clients_count,
#             'hotspot_clients': self.hotspot_clients,
#             'pppoe_clients': self.pppoe_clients,
#             'uptime': self.uptime,
#             'signal': self.signal,
#             'temperature': self.temperature,
#             'throughput': self.throughput,
#             'upload_speed': self.upload_speed,
#             'download_speed': self.download_speed,
#             'disk': self.disk,
#             'timestamp': self.timestamp.isoformat(),
#         }
        
#         cache.set(cache_key, stats_data, 120)  # Cache for 2 minutes

# # Enhanced User models with improved session management
# class HotspotUser(models.Model):
#     router = models.ForeignKey("network_management.Router", on_delete=models.CASCADE, related_name="hotspot_users")
#     client = models.ForeignKey("account.Client", on_delete=models.CASCADE, null=True)
#     plan = models.ForeignKey("internet_plans.InternetPlan", on_delete=models.SET_NULL, null=True)
#     transaction = models.ForeignKey("payments.Transaction", on_delete=models.SET_NULL, null=True)
#     mac = models.CharField(max_length=17)
#     ip = models.GenericIPAddressField()
#     connected_at = models.DateTimeField(default=timezone.now)
#     disconnected_at = models.DateTimeField(null=True, blank=True)
#     data_used = models.BigIntegerField(default=0)
#     active = models.BooleanField(default=False)
#     latitude = models.FloatField(null=True, blank=True)
#     longitude = models.FloatField(null=True, blank=True)
#     location_data = models.JSONField(default=dict)
#     session_id = models.UUIDField(default=uuid.uuid4, editable=False)
#     total_session_time = models.IntegerField(default=0, help_text="Total session time in seconds")
#     remaining_time = models.IntegerField(default=0, help_text="Remaining time in seconds")
#     last_activity = models.DateTimeField(default=timezone.now)

#     # NEW: Enhanced session management
#     bandwidth_used = models.JSONField(default=dict, help_text="Upload/download usage in bytes")
#     quality_of_service = models.CharField(max_length=20, default="standard", 
#                                          choices=[("standard", "Standard"), ("premium", "Premium"), ("basic", "Basic")])
#     device_info = models.JSONField(default=dict, help_text="Device type, OS, browser info")

#     def __str__(self):
#         return f"{self.client.user.username if self.client else 'Guest'} on {self.router.name}"

#     def save(self, *args, **kwargs):
#         if self.active:
#             self.last_activity = timezone.now()
#             # Cache active session
#             self.cache_active_session()
#         else:
#             self.clear_cached_session()
            
#         super().save(*args, **kwargs)

#     def cache_active_session(self):
#         """Cache active session data for quick access using Django cache"""
#         cache_key = f"hotspot_session:{self.session_id}"
#         session_data = {
#             'id': self.id,
#             'mac': self.mac,
#             'client_id': self.client.id if self.client else None,
#             'router_id': self.router.id,
#             'remaining_time': self.remaining_time,
#             'data_used': self.data_used,
#             'connected_at': self.connected_at.isoformat(),
#             'quality_of_service': self.quality_of_service,
#         }
#         # ✅ UPDATED: Use Django cache instead of direct redis
#         cache.set(cache_key, session_data, 300)  # Cache for 5 minutes

#     def clear_cached_session(self):
#         """Remove session from cache when disconnected using Django cache"""
#         cache_key = f"hotspot_session:{self.session_id}"
#         # ✅ UPDATED: Use Django cache instead of direct redis
#         cache.delete(cache_key)

#     class Meta:
#         ordering = ["-connected_at"]
#         indexes = [
#             models.Index(fields=["mac"]),
#             models.Index(fields=["session_id"]),
#             models.Index(fields=["active"]),
#             models.Index(fields=["client", "active"]),  # NEW
#         ]

# class PPPoEUser(models.Model):
#     router = models.ForeignKey("network_management.Router", on_delete=models.CASCADE, related_name="pppoe_users")
#     client = models.ForeignKey("account.Client", on_delete=models.CASCADE, null=True)
#     plan = models.ForeignKey("internet_plans.InternetPlan", on_delete=models.SET_NULL, null=True)
#     transaction = models.ForeignKey("payments.Transaction", on_delete=models.SET_NULL, null=True)
#     username = models.CharField(max_length=100)
#     password = models.CharField(max_length=100)
#     service_name = models.CharField(max_length=100, blank=True)
#     ip_address = models.GenericIPAddressField(null=True, blank=True)
#     connected_at = models.DateTimeField(default=timezone.now)
#     disconnected_at = models.DateTimeField(null=True, blank=True)
#     data_used = models.BigIntegerField(default=0)
#     active = models.BooleanField(default=False)
#     session_id = models.UUIDField(default=uuid.uuid4, editable=False)
#     total_session_time = models.IntegerField(default=0, help_text="Total session time in seconds")
#     remaining_time = models.IntegerField(default=0, help_text="Remaining time in seconds")
#     last_activity = models.DateTimeField(default=timezone.now)

#     # NEW: Enhanced PPPoE management
#     bandwidth_used = models.JSONField(default=dict, help_text="Upload/download usage in bytes")
#     pppoe_service_type = models.CharField(max_length=50, default="standard",
#                                          choices=[("standard", "Standard"), ("business", "Business"), ("premium", "Premium")])

#     def __str__(self):
#         return f"{self.username} on {self.router.name}"

#     def save(self, *args, **kwargs):
#         if self.active:
#             self.last_activity = timezone.now()
#             self.cache_active_session()
#         else:
#             self.clear_cached_session()
            
#         super().save(*args, **kwargs)

#     def cache_active_session(self):
#         """Cache active PPPoE session using Django cache"""
#         cache_key = f"pppoe_session:{self.session_id}"
#         session_data = {
#             'id': self.id,
#             'username': self.username,
#             'client_id': self.client.id if self.client else None,
#             'router_id': self.router.id,
#             'remaining_time': self.remaining_time,
#             'data_used': self.data_used,
#             'connected_at': self.connected_at.isoformat(),
#             'service_type': self.pppoe_service_type,
#         }
        
#         cache.set(cache_key, session_data, 300)  # Cache for 5 minutes

#     def clear_cached_session(self):
#         """Remove PPPoE session from cache using Django cache"""
#         cache_key = f"pppoe_session:{self.session_id}"
    
#         cache.delete(cache_key)

#     class Meta:
#         ordering = ["-connected_at"]
#         indexes = [
#             models.Index(fields=["username"]),
#             models.Index(fields=["session_id"]),
#             models.Index(fields=["active"]),
#             models.Index(fields=["client", "active"]),  # NEW
#         ]

# # Enhanced Activation Attempt with payment verification
# class ActivationAttempt(models.Model):
#     subscription = models.ForeignKey("internet_plans.Subscription", on_delete=models.CASCADE, null=True, blank=True)
#     router = models.ForeignKey(Router, on_delete=models.CASCADE)
#     attempted_at = models.DateTimeField(auto_now_add=True)
#     success = models.BooleanField(default=False)
#     error_message = models.TextField(blank=True)
#     retry_count = models.IntegerField(default=0)
#     user_type = models.CharField(max_length=10, choices=[('hotspot', 'Hotspot'), ('pppoe', 'PPPoE')], default='hotspot')
    
#     # NEW: Payment verification fields
#     payment_verified = models.BooleanField(default=False)
#     transaction_reference = models.CharField(max_length=100, blank=True, null=True)
#     verification_method = models.CharField(max_length=20, default="automatic", 
#                                           choices=[("automatic", "Automatic"), ("manual", "Manual")])

#     class Meta:
#         ordering = ["-attempted_at"]
#         indexes = [
#             models.Index(fields=['payment_verified', 'success']),  # NEW
#         ]

# # Enhanced Session History with recovery tracking
# class RouterSessionHistory(models.Model):
#     DISCONNECTION_REASONS = (
#         ("router_reboot", "Router Reboot"),
#         ("power_outage", "Power Outage"),
#         ("manual_disconnect", "Manual Disconnect"),
#         ("session_timeout", "Session Timeout"),
#         ("router_switch", "Router Switch"),
#         ("payment_expired", "Payment Expired"),
#         ("bandwidth_exceeded", "Bandwidth Exceeded"),
#         ("suspicious_activity", "Suspicious Activity"),
#     )

#     hotspot_user = models.ForeignKey(HotspotUser, on_delete=models.CASCADE, related_name="session_history", null=True, blank=True)
#     pppoe_user = models.ForeignKey(PPPoEUser, on_delete=models.CASCADE, related_name="session_history", null=True, blank=True)
#     router = models.ForeignKey(Router, on_delete=models.CASCADE)
#     start_time = models.DateTimeField(default=timezone.now)
#     end_time = models.DateTimeField(null=True, blank=True)
#     data_used = models.BigIntegerField(default=0)
#     duration = models.IntegerField(default=0, help_text="Session duration in seconds")
#     disconnected_reason = models.CharField(max_length=100, choices=DISCONNECTION_REASONS, blank=True, null=True)
#     user_type = models.CharField(max_length=10, choices=[('hotspot', 'Hotspot'), ('pppoe', 'PPPoE')], default='hotspot')
    
#     # NEW: Recovery tracking
#     recoverable = models.BooleanField(default=False)
#     recovery_attempted = models.BooleanField(default=False)
#     recovered_at = models.DateTimeField(null=True, blank=True)

#     class Meta:
#         ordering = ["-start_time"]
#         indexes = [
#             models.Index(fields=['recoverable', 'user_type']),  # NEW
#             models.Index(fields=['start_time', 'end_time']),    # NEW
#         ]

# # Enhanced Health Monitoring
# class RouterHealthCheck(models.Model):
#     router = models.ForeignKey(Router, on_delete=models.CASCADE, related_name="health_checks")
#     timestamp = models.DateTimeField(default=timezone.now)
#     is_online = models.BooleanField(default=False)
#     response_time = models.FloatField(null=True, blank=True)
#     error_message = models.TextField(blank=True, null=True)
#     system_metrics = models.JSONField(default=dict, blank=True)
    
#     # NEW: Enhanced health metrics
#     health_score = models.IntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])
#     critical_alerts = models.JSONField(default=list, blank=True)
#     performance_metrics = models.JSONField(default=dict, blank=True)

#     class Meta:
#         ordering = ["-timestamp"]
#         indexes = [
#             models.Index(fields=['router', 'timestamp']),
#             models.Index(fields=['health_score']),  # NEW
#         ]

#     def save(self, *args, **kwargs):
#         super().save(*args, **kwargs)
#         self.cache_health_status()

#     def cache_health_status(self):
#         """Cache router health status using Django cache"""
#         cache_key = f"router:{self.router.id}:health"
#         health_data = {
#             'is_online': self.is_online,
#             'health_score': self.health_score,
#             'response_time': self.response_time,
#             'timestamp': self.timestamp.isoformat(),
#             'critical_alerts': self.critical_alerts,
#         }
       
#         cache.set(cache_key, health_data, 180)  # Cache for 3 minutes

# # Enhanced Callback Configuration
# class RouterCallbackConfig(models.Model):
#     SECURITY_LEVELS = (
#         ('low', 'Low'),
#         ('medium', 'Medium'),
#         ('high', 'High'),
#         ('critical', 'Critical'),
#     )
    
#     EVENT_TYPES = (
#         ('payment_received', 'Payment Received'),
#         ('user_connected', 'User Connected'),
#         ('user_disconnected', 'User Disconnected'),
#         ('router_offline', 'Router Offline'),
#         ('router_online', 'Router Online'),
#         ('bandwidth_exceeded', 'Bandwidth Exceeded'),
#         ('session_expired', 'Session Expired'),
#         ('suspicious_activity', 'Suspicious Activity'),
#         ('health_alert', 'Health Alert'),
#     )
    
#     router = models.ForeignKey(Router, on_delete=models.CASCADE, related_name="callback_configs")
#     event = models.CharField(max_length=100, choices=EVENT_TYPES)
#     callback_url = models.URLField(max_length=500)
#     security_level = models.CharField(max_length=10, choices=SECURITY_LEVELS, default='medium')
#     security_profile = models.CharField(max_length=100, blank=True)
#     is_active = models.BooleanField(default=True)
#     retry_enabled = models.BooleanField(default=True)
#     max_retries = models.IntegerField(default=3)
#     timeout_seconds = models.IntegerField(default=30)
#     created_at = models.DateTimeField(default=timezone.now)
#     updated_at = models.DateTimeField(auto_now=True)

#     class Meta:
#         ordering = ["-created_at"]
#         unique_together = ['router', 'event']
#         indexes = [
#             models.Index(fields=['router', 'event', 'is_active']),  # NEW
#         ]

# # NEW: Audit Log Model
# class RouterAuditLog(models.Model):
#     ACTION_TYPES = (
#         ('create', 'Create'),
#         ('update', 'Update'),
#         ('delete', 'Delete'),
#         ('restart', 'Restart'),
#         ('configure', 'Configure'),
#         ('status_change', 'Status Change'),
#         ('user_activation', 'User Activation'),
#         ('user_deactivation', 'User Deactivation'),
#     )
    
#     router = models.ForeignKey(Router, on_delete=models.CASCADE, related_name="audit_logs")
#     action = models.CharField(max_length=20, choices=ACTION_TYPES)
#     description = models.TextField()
#     user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)  # ✅ FIXED
#     ip_address = models.GenericIPAddressField(null=True, blank=True)
#     user_agent = models.TextField(blank=True)
#     changes = models.JSONField(default=dict, blank=True)
#     timestamp = models.DateTimeField(default=timezone.now)

#     class Meta:
#         ordering = ["-timestamp"]
#         indexes = [
#             models.Index(fields=['router', 'action']),
#             models.Index(fields=['timestamp']),
#             models.Index(fields=['user']),
#         ]

#     def __str__(self):
#         user_display = self.user.username if self.user else "System"
#         return f"{self.action} on {self.router.name} by {user_display} at {self.timestamp}"

# # NEW: Bulk Operations Tracking
# class BulkOperation(models.Model):
#     OPERATION_TYPES = (
#         ('health_check', 'Health Check'),
#         ('restart', 'Restart'),
#         ('update_firmware', 'Update Firmware'),
#         ('backup_config', 'Backup Configuration'),
#         ('restore_config', 'Restore Configuration'),
#     )
    
#     STATUS_CHOICES = (
#         ('pending', 'Pending'),
#         ('running', 'Running'),
#         ('completed', 'Completed'),
#         ('failed', 'Failed'),
#         ('partial', 'Partial Success'),
#     )
    
#     operation_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
#     operation_type = models.CharField(max_length=20, choices=OPERATION_TYPES)
#     routers = models.ManyToManyField(Router, related_name="bulk_operations")
#     initiated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)  # ✅ FIXED
#     status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
#     results = models.JSONField(default=dict, blank=True)
#     started_at = models.DateTimeField(default=timezone.now)
#     completed_at = models.DateTimeField(null=True, blank=True)
#     error_message = models.TextField(blank=True)

#     class Meta:
#         ordering = ["-started_at"]
#         indexes = [
#             models.Index(fields=['operation_id']),
#             models.Index(fields=['operation_type', 'status']),
#         ]

#     def save(self, *args, **kwargs):
#         super().save(*args, **kwargs)
#         self.cache_operation_status()

#     def cache_operation_status(self):
#         """Cache bulk operation status using Django cache"""
#         cache_key = f"bulk_operation:{self.operation_id}"
#         operation_data = {
#             'operation_type': self.operation_type,
#             'status': self.status,
#             'progress': len(self.results.get('completed', [])),
#             'total': self.routers.count(),
#             'started_at': self.started_at.isoformat(),
#             'initiated_by': self.initiated_by.username if self.initiated_by else "Unknown",
#         }
       
#         cache.set(cache_key, operation_data, 3600)  # Cache for 1 hour

#     def __str__(self):
#         return f"{self.operation_type} - {self.status} - {self.initiated_by.username}"











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
#             "standard": "Standard",
#             "premium": "Premium", 
#             "basic": "Basic"
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
from internet_plans.serializers.create_plan_serializers import InternetPlanSerializer
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
    plan = InternetPlanSerializer(read_only=True)
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
    plan = InternetPlanSerializer(read_only=True)
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