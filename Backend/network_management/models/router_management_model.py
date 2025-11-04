

# from django.db import models
# from django.utils import timezone
# from django.core.validators import MinValueValidator
# import uuid


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
#     pppoe_config = models.JSONField(blank=True, null=True)  # NEW: PPPoE configuration
#     is_default = models.BooleanField(default=False)
#     captive_portal_enabled = models.BooleanField(default=True)
#     is_active = models.BooleanField(default=True)
#     callback_url = models.URLField(
#         max_length=500, blank=True, null=True,
#         help_text="Conforms to M-Pesa dispatch URL"
#     )
#     created_at = models.DateTimeField(default=timezone.now)
#     updated_at = models.DateTimeField(auto_now=True)

#     def __str__(self):
#         return f"{self.name} ({self.ip}) - {self.type}"

#     class Meta:
#         ordering = ["-is_default", "name"]
#         indexes = [
#             models.Index(fields=['status', 'is_active']),
#             models.Index(fields=['type']),
#         ]


# class RouterStats(models.Model):
#     router = models.ForeignKey(Router, on_delete=models.CASCADE, related_name="stats")
#     cpu = models.FloatField()
#     memory = models.FloatField()
#     connected_clients_count = models.IntegerField()
#     uptime = models.CharField(max_length=10)
#     signal = models.IntegerField()
#     temperature = models.FloatField(help_text="in °C")
#     throughput = models.FloatField(help_text="in Mbps")
#     disk = models.FloatField()
#     timestamp = models.DateTimeField(default=timezone.now)

#     def __str__(self):
#         return f"Stats for {self.router.name} at {self.timestamp}"

#     class Meta:
#         ordering = ["-timestamp"]


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

#     def __str__(self):
#         return f"{self.client.user.username if self.client else 'Guest'} on {self.router.name}"

#     def save(self, *args, **kwargs):
#         if self.active:
#             self.last_activity = timezone.now()
#         super().save(*args, **kwargs)

#     class Meta:
#         ordering = ["-connected_at"]
#         indexes = [
#             models.Index(fields=["mac"]),
#             models.Index(fields=["session_id"]),
#             models.Index(fields=["active"]),
#         ]


# class PPPoEUser(models.Model):  # NEW: PPPoE User model
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

#     def __str__(self):
#         return f"{self.username} on {self.router.name}"

#     def save(self, *args, **kwargs):
#         if self.active:
#             self.last_activity = timezone.now()
#         super().save(*args, **kwargs)

#     class Meta:
#         ordering = ["-connected_at"]
#         indexes = [
#             models.Index(fields=["username"]),
#             models.Index(fields=["session_id"]),
#             models.Index(fields=["active"]),
#         ]


# class ActivationAttempt(models.Model):
#     subscription = models.ForeignKey(
#         "internet_plans.Subscription", 
#         on_delete=models.CASCADE, 
#         null=True,  
#         blank=True  
#     )
#     router = models.ForeignKey(Router, on_delete=models.CASCADE)
#     attempted_at = models.DateTimeField(auto_now_add=True)
#     success = models.BooleanField(default=False)
#     error_message = models.TextField(blank=True)
#     retry_count = models.IntegerField(default=0)
#     user_type = models.CharField(max_length=10, choices=[('hotspot', 'Hotspot'), ('pppoe', 'PPPoE')], default='hotspot')  # NEW

#     class Meta:
#         ordering = ["-attempted_at"]


# class RouterSessionHistory(models.Model):
#     hotspot_user = models.ForeignKey(HotspotUser, on_delete=models.CASCADE, related_name="session_history", null=True, blank=True)
#     pppoe_user = models.ForeignKey(PPPoEUser, on_delete=models.CASCADE, related_name="session_history", null=True, blank=True)  # NEW
#     router = models.ForeignKey(Router, on_delete=models.CASCADE)
#     start_time = models.DateTimeField(default=timezone.now)
#     end_time = models.DateTimeField(null=True, blank=True)
#     data_used = models.BigIntegerField(default=0)
#     duration = models.IntegerField(default=0, help_text="Session duration in seconds")
#     disconnected_reason = models.CharField(max_length=100, blank=True, null=True)
#     user_type = models.CharField(
#         max_length=10,
#         choices=[('hotspot', 'Hotspot'), ('pppoe', 'PPPoE')],
#         default='hotspot'  
#     )
   

#     class Meta:
#         ordering = ["-start_time"]


# class RouterHealthCheck(models.Model):
#     router = models.ForeignKey(Router, on_delete=models.CASCADE, related_name="health_checks")
#     timestamp = models.DateTimeField(default=timezone.now)
#     is_online = models.BooleanField(default=False)
#     response_time = models.FloatField(null=True, blank=True)
#     error_message = models.TextField(blank=True, null=True)
#     system_metrics = models.JSONField(default=dict, blank=True)  # NEW: Store system metrics

#     class Meta:
#         ordering = ["-timestamp"]


# class RouterCallbackConfig(models.Model):  # NEW: Dedicated callback config model
#     SECURITY_LEVELS = (
#         ('low', 'Low'),
#         ('medium', 'Medium'),
#         ('high', 'High'),
#         ('critical', 'Critical'),
#     )
    
#     router = models.ForeignKey(Router, on_delete=models.CASCADE, related_name="callback_configs")
#     event = models.CharField(max_length=100)
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














from django.db import models
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid
import redis
from django.conf import settings
from django.core.cache import cache
import json
from datetime import datetime, timedelta

# Redis connection pool
redis_client = redis.Redis(
    host=settings.REDIS_HOST,
    port=settings.REDIS_PORT,
    db=settings.REDIS_DB,
    password=settings.REDIS_PASSWORD,
    decode_responses=True
)

class Router(models.Model):
    ROUTER_TYPES = (
        ("mikrotik", "MikroTik"),
        ("ubiquiti", "Ubiquiti"),
        ("cisco", "Cisco"),
        ("other", "Other"),
    )
    STATUS_CHOICES = (
        ("connected", "Connected"),
        ("disconnected", "Disconnected"),
        ("updating", "Updating"),
        ("error", "Error"),
    )

    name = models.CharField(max_length=100)
    ip = models.GenericIPAddressField()
    port = models.PositiveIntegerField(default=8728)
    username = models.CharField(max_length=100, default="admin")
    password = models.CharField(max_length=100, blank=True)
    type = models.CharField(max_length=20, choices=ROUTER_TYPES, default="mikrotik")
    location = models.CharField(max_length=100, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="disconnected")
    last_seen = models.DateTimeField(default=timezone.now)
    hotspot_config = models.JSONField(blank=True, null=True)
    pppoe_config = models.JSONField(blank=True, null=True)
    is_default = models.BooleanField(default=False)
    captive_portal_enabled = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)
    callback_url = models.URLField(max_length=500, blank=True, null=True)
    
    # NEW FIELDS
    max_clients = models.PositiveIntegerField(default=50, validators=[MinValueValidator(1), MaxValueValidator(1000)])
    description = models.TextField(blank=True, null=True)
    firmware_version = models.CharField(max_length=50, blank=True, null=True)
    ssid = models.CharField(max_length=100, blank=True, null=True, default="SurfZone-WiFi")
    
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.ip}) - {self.type}"

    class Meta:
        ordering = ["-is_default", "name"]
        indexes = [
            models.Index(fields=['status', 'is_active']),
            models.Index(fields=['type']),
            models.Index(fields=['ssid']),  # NEW
        ]

    def save(self, *args, **kwargs):
        # Cache router data for quick access
        super().save(*args, **kwargs)
        self.cache_router_data()

    def cache_router_data(self):
        """Cache router data for quick access"""
        cache_key = f"router:{self.id}:data"
        router_data = {
            'id': self.id,
            'name': self.name,
            'ip': self.ip,
            'status': self.status,
            'type': self.type,
            'max_clients': self.max_clients,
            'ssid': self.ssid,
            'last_seen': self.last_seen.isoformat(),
        }
        redis_client.setex(cache_key, 300, json.dumps(router_data))  # Cache for 5 minutes

    def get_active_users_count(self):
        """Get active users count using Redis cache"""
        cache_key = f"router:{self.id}:active_users"
        cached_count = redis_client.get(cache_key)
        
        if cached_count:
            return int(cached_count)
        
        # Calculate and cache
        hotspot_count = self.hotspot_users.filter(active=True).count()
        pppoe_count = self.pppoe_users.filter(active=True).count()
        total_count = hotspot_count + pppoe_count
        
        redis_client.setex(cache_key, 60, total_count)  # Cache for 1 minute
        return total_count

class RouterStats(models.Model):
    router = models.ForeignKey(Router, on_delete=models.CASCADE, related_name="stats")
    cpu = models.FloatField(validators=[MinValueValidator(0), MaxValueValidator(100)])
    memory = models.FloatField(validators=[MinValueValidator(0), MaxValueValidator(100)])
    connected_clients_count = models.IntegerField(validators=[MinValueValidator(0)])
    uptime = models.CharField(max_length=50)  # Increased length for detailed uptime
    signal = models.IntegerField(null=True, blank=True)  # Can be negative
    temperature = models.FloatField(help_text="in °C", null=True, blank=True)
    throughput = models.FloatField(help_text="in Mbps", validators=[MinValueValidator(0)])
    disk = models.FloatField(validators=[MinValueValidator(0), MaxValueValidator(100)])
    timestamp = models.DateTimeField(default=timezone.now)

    # NEW FIELDS for enhanced monitoring
    upload_speed = models.FloatField(help_text="in Mbps", default=0, validators=[MinValueValidator(0)])
    download_speed = models.FloatField(help_text="in Mbps", default=0, validators=[MinValueValidator(0)])
    hotspot_clients = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    pppoe_clients = models.IntegerField(default=0, validators=[MinValueValidator(0)])

    def __str__(self):
        return f"Stats for {self.router.name} at {self.timestamp}"

    class Meta:
        ordering = ["-timestamp"]
        indexes = [
            models.Index(fields=['router', 'timestamp']),
        ]

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.cache_latest_stats()

    def cache_latest_stats(self):
        """Cache latest stats for quick access"""
        cache_key = f"router:{self.router.id}:latest_stats"
        stats_data = {
            'cpu': self.cpu,
            'memory': self.memory,
            'clients': self.connected_clients_count,
            'hotspot_clients': self.hotspot_clients,
            'pppoe_clients': self.pppoe_clients,
            'uptime': self.uptime,
            'signal': self.signal,
            'temperature': self.temperature,
            'throughput': self.throughput,
            'upload_speed': self.upload_speed,
            'download_speed': self.download_speed,
            'disk': self.disk,
            'timestamp': self.timestamp.isoformat(),
        }
        redis_client.setex(cache_key, 120, json.dumps(stats_data))  # Cache for 2 minutes

# Enhanced User models with improved session management
class HotspotUser(models.Model):
    router = models.ForeignKey("network_management.Router", on_delete=models.CASCADE, related_name="hotspot_users")
    client = models.ForeignKey("account.Client", on_delete=models.CASCADE, null=True)
    plan = models.ForeignKey("internet_plans.InternetPlan", on_delete=models.SET_NULL, null=True)
    transaction = models.ForeignKey("payments.Transaction", on_delete=models.SET_NULL, null=True)
    mac = models.CharField(max_length=17)
    ip = models.GenericIPAddressField()
    connected_at = models.DateTimeField(default=timezone.now)
    disconnected_at = models.DateTimeField(null=True, blank=True)
    data_used = models.BigIntegerField(default=0)
    active = models.BooleanField(default=False)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    location_data = models.JSONField(default=dict)
    session_id = models.UUIDField(default=uuid.uuid4, editable=False)
    total_session_time = models.IntegerField(default=0, help_text="Total session time in seconds")
    remaining_time = models.IntegerField(default=0, help_text="Remaining time in seconds")
    last_activity = models.DateTimeField(default=timezone.now)

    # NEW: Enhanced session management
    bandwidth_used = models.JSONField(default=dict, help_text="Upload/download usage in bytes")
    quality_of_service = models.CharField(max_length=20, default="standard", 
                                         choices=[("standard", "Standard"), ("premium", "Premium"), ("basic", "Basic")])
    device_info = models.JSONField(default=dict, help_text="Device type, OS, browser info")

    def __str__(self):
        return f"{self.client.user.username if self.client else 'Guest'} on {self.router.name}"

    def save(self, *args, **kwargs):
        if self.active:
            self.last_activity = timezone.now()
            # Cache active session
            self.cache_active_session()
        else:
            self.clear_cached_session()
            
        super().save(*args, **kwargs)

    def cache_active_session(self):
        """Cache active session data for quick access"""
        cache_key = f"hotspot_session:{self.session_id}"
        session_data = {
            'id': self.id,
            'mac': self.mac,
            'client_id': self.client.id if self.client else None,
            'router_id': self.router.id,
            'remaining_time': self.remaining_time,
            'data_used': self.data_used,
            'connected_at': self.connected_at.isoformat(),
            'quality_of_service': self.quality_of_service,
        }
        redis_client.setex(cache_key, 300, json.dumps(session_data))

    def clear_cached_session(self):
        """Remove session from cache when disconnected"""
        cache_key = f"hotspot_session:{self.session_id}"
        redis_client.delete(cache_key)

    class Meta:
        ordering = ["-connected_at"]
        indexes = [
            models.Index(fields=["mac"]),
            models.Index(fields=["session_id"]),
            models.Index(fields=["active"]),
            models.Index(fields=["client", "active"]),  # NEW
        ]

class PPPoEUser(models.Model):
    router = models.ForeignKey("network_management.Router", on_delete=models.CASCADE, related_name="pppoe_users")
    client = models.ForeignKey("account.Client", on_delete=models.CASCADE, null=True)
    plan = models.ForeignKey("internet_plans.InternetPlan", on_delete=models.SET_NULL, null=True)
    transaction = models.ForeignKey("payments.Transaction", on_delete=models.SET_NULL, null=True)
    username = models.CharField(max_length=100)
    password = models.CharField(max_length=100)
    service_name = models.CharField(max_length=100, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    connected_at = models.DateTimeField(default=timezone.now)
    disconnected_at = models.DateTimeField(null=True, blank=True)
    data_used = models.BigIntegerField(default=0)
    active = models.BooleanField(default=False)
    session_id = models.UUIDField(default=uuid.uuid4, editable=False)
    total_session_time = models.IntegerField(default=0, help_text="Total session time in seconds")
    remaining_time = models.IntegerField(default=0, help_text="Remaining time in seconds")
    last_activity = models.DateTimeField(default=timezone.now)

    # NEW: Enhanced PPPoE management
    bandwidth_used = models.JSONField(default=dict, help_text="Upload/download usage in bytes")
    pppoe_service_type = models.CharField(max_length=50, default="standard",
                                         choices=[("standard", "Standard"), ("business", "Business"), ("premium", "Premium")])

    def __str__(self):
        return f"{self.username} on {self.router.name}"

    def save(self, *args, **kwargs):
        if self.active:
            self.last_activity = timezone.now()
            self.cache_active_session()
        else:
            self.clear_cached_session()
            
        super().save(*args, **kwargs)

    def cache_active_session(self):
        """Cache active PPPoE session"""
        cache_key = f"pppoe_session:{self.session_id}"
        session_data = {
            'id': self.id,
            'username': self.username,
            'client_id': self.client.id if self.client else None,
            'router_id': self.router.id,
            'remaining_time': self.remaining_time,
            'data_used': self.data_used,
            'connected_at': self.connected_at.isoformat(),
            'service_type': self.pppoe_service_type,
        }
        redis_client.setex(cache_key, 300, json.dumps(session_data))

    def clear_cached_session(self):
        """Remove PPPoE session from cache"""
        cache_key = f"pppoe_session:{self.session_id}"
        redis_client.delete(cache_key)

    class Meta:
        ordering = ["-connected_at"]
        indexes = [
            models.Index(fields=["username"]),
            models.Index(fields=["session_id"]),
            models.Index(fields=["active"]),
            models.Index(fields=["client", "active"]),  # NEW
        ]

# Enhanced Activation Attempt with payment verification
class ActivationAttempt(models.Model):
    subscription = models.ForeignKey("internet_plans.Subscription", on_delete=models.CASCADE, null=True, blank=True)
    router = models.ForeignKey(Router, on_delete=models.CASCADE)
    attempted_at = models.DateTimeField(auto_now_add=True)
    success = models.BooleanField(default=False)
    error_message = models.TextField(blank=True)
    retry_count = models.IntegerField(default=0)
    user_type = models.CharField(max_length=10, choices=[('hotspot', 'Hotspot'), ('pppoe', 'PPPoE')], default='hotspot')
    
    # NEW: Payment verification fields
    payment_verified = models.BooleanField(default=False)
    transaction_reference = models.CharField(max_length=100, blank=True, null=True)
    verification_method = models.CharField(max_length=20, default="automatic", 
                                          choices=[("automatic", "Automatic"), ("manual", "Manual")])

    class Meta:
        ordering = ["-attempted_at"]
        indexes = [
            models.Index(fields=['payment_verified', 'success']),  # NEW
        ]

# Enhanced Session History with recovery tracking
class RouterSessionHistory(models.Model):
    DISCONNECTION_REASONS = (
        ("router_reboot", "Router Reboot"),
        ("power_outage", "Power Outage"),
        ("manual_disconnect", "Manual Disconnect"),
        ("session_timeout", "Session Timeout"),
        ("router_switch", "Router Switch"),
        ("payment_expired", "Payment Expired"),
        ("bandwidth_exceeded", "Bandwidth Exceeded"),
        ("suspicious_activity", "Suspicious Activity"),
    )

    hotspot_user = models.ForeignKey(HotspotUser, on_delete=models.CASCADE, related_name="session_history", null=True, blank=True)
    pppoe_user = models.ForeignKey(PPPoEUser, on_delete=models.CASCADE, related_name="session_history", null=True, blank=True)
    router = models.ForeignKey(Router, on_delete=models.CASCADE)
    start_time = models.DateTimeField(default=timezone.now)
    end_time = models.DateTimeField(null=True, blank=True)
    data_used = models.BigIntegerField(default=0)
    duration = models.IntegerField(default=0, help_text="Session duration in seconds")
    disconnected_reason = models.CharField(max_length=100, choices=DISCONNECTION_REASONS, blank=True, null=True)
    user_type = models.CharField(max_length=10, choices=[('hotspot', 'Hotspot'), ('pppoe', 'PPPoE')], default='hotspot')
    
    # NEW: Recovery tracking
    recoverable = models.BooleanField(default=False)
    recovery_attempted = models.BooleanField(default=False)
    recovered_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-start_time"]
        indexes = [
            models.Index(fields=['recoverable', 'user_type']),  # NEW
            models.Index(fields=['start_time', 'end_time']),    # NEW
        ]

# Enhanced Health Monitoring
class RouterHealthCheck(models.Model):
    router = models.ForeignKey(Router, on_delete=models.CASCADE, related_name="health_checks")
    timestamp = models.DateTimeField(default=timezone.now)
    is_online = models.BooleanField(default=False)
    response_time = models.FloatField(null=True, blank=True)
    error_message = models.TextField(blank=True, null=True)
    system_metrics = models.JSONField(default=dict, blank=True)
    
    # NEW: Enhanced health metrics
    health_score = models.IntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])
    critical_alerts = models.JSONField(default=list, blank=True)
    performance_metrics = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ["-timestamp"]
        indexes = [
            models.Index(fields=['router', 'timestamp']),
            models.Index(fields=['health_score']),  # NEW
        ]

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.cache_health_status()

    def cache_health_status(self):
        """Cache router health status"""
        cache_key = f"router:{self.router.id}:health"
        health_data = {
            'is_online': self.is_online,
            'health_score': self.health_score,
            'response_time': self.response_time,
            'timestamp': self.timestamp.isoformat(),
            'critical_alerts': self.critical_alerts,
        }
        redis_client.setex(cache_key, 180, json.dumps(health_data))  # Cache for 3 minutes

# Enhanced Callback Configuration
class RouterCallbackConfig(models.Model):
    SECURITY_LEVELS = (
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    )
    
    EVENT_TYPES = (
        ('payment_received', 'Payment Received'),
        ('user_connected', 'User Connected'),
        ('user_disconnected', 'User Disconnected'),
        ('router_offline', 'Router Offline'),
        ('router_online', 'Router Online'),
        ('bandwidth_exceeded', 'Bandwidth Exceeded'),
        ('session_expired', 'Session Expired'),
        ('suspicious_activity', 'Suspicious Activity'),
        ('health_alert', 'Health Alert'),
    )
    
    router = models.ForeignKey(Router, on_delete=models.CASCADE, related_name="callback_configs")
    event = models.CharField(max_length=100, choices=EVENT_TYPES)
    callback_url = models.URLField(max_length=500)
    security_level = models.CharField(max_length=10, choices=SECURITY_LEVELS, default='medium')
    security_profile = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True)
    retry_enabled = models.BooleanField(default=True)
    max_retries = models.IntegerField(default=3)
    timeout_seconds = models.IntegerField(default=30)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        unique_together = ['router', 'event']
        indexes = [
            models.Index(fields=['router', 'event', 'is_active']),  # NEW
        ]

# NEW: Audit Log Model
class RouterAuditLog(models.Model):
    ACTION_TYPES = (
        ('create', 'Create'),
        ('update', 'Update'),
        ('delete', 'Delete'),
        ('restart', 'Restart'),
        ('configure', 'Configure'),
        ('status_change', 'Status Change'),
        ('user_activation', 'User Activation'),
        ('user_deactivation', 'User Deactivation'),
    )
    
    router = models.ForeignKey(Router, on_delete=models.CASCADE, related_name="audit_logs")
    action = models.CharField(max_length=20, choices=ACTION_TYPES)
    description = models.TextField()
    user = models.ForeignKey("auth.User", on_delete=models.SET_NULL, null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    changes = models.JSONField(default=dict, blank=True)
    timestamp = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ["-timestamp"]
        indexes = [
            models.Index(fields=['router', 'action']),
            models.Index(fields=['timestamp']),
            models.Index(fields=['user']),
        ]

    def __str__(self):
        return f"{self.action} on {self.router.name} by {self.user} at {self.timestamp}"

# NEW: Bulk Operations Tracking
class BulkOperation(models.Model):
    OPERATION_TYPES = (
        ('health_check', 'Health Check'),
        ('restart', 'Restart'),
        ('update_firmware', 'Update Firmware'),
        ('backup_config', 'Backup Configuration'),
        ('restore_config', 'Restore Configuration'),
    )
    
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('running', 'Running'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('partial', 'Partial Success'),
    )
    
    operation_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    operation_type = models.CharField(max_length=20, choices=OPERATION_TYPES)
    routers = models.ManyToManyField(Router, related_name="bulk_operations")
    initiated_by = models.ForeignKey("auth.User", on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    results = models.JSONField(default=dict, blank=True)
    started_at = models.DateTimeField(default=timezone.now)
    completed_at = models.DateTimeField(null=True, blank=True)
    error_message = models.TextField(blank=True)

    class Meta:
        ordering = ["-started_at"]
        indexes = [
            models.Index(fields=['operation_id']),
            models.Index(fields=['operation_type', 'status']),
        ]

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.cache_operation_status()

    def cache_operation_status(self):
        """Cache bulk operation status"""
        cache_key = f"bulk_operation:{self.operation_id}"
        operation_data = {
            'operation_type': self.operation_type,
            'status': self.status,
            'progress': len(self.results.get('completed', [])),
            'total': self.routers.count(),
            'started_at': self.started_at.isoformat(),
        }
        redis_client.setex(cache_key, 3600, json.dumps(operation_data))  # Cache for 1 hour