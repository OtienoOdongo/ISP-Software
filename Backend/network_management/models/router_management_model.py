

from django.db import models
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid
from django.conf import settings
from django.core.cache import cache  
import json
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

# Try to import MikroTik connector with fallback
try:
    from network_management.utils.mikrotik_connector import MikroTikConnector
    MIKROTIK_AVAILABLE = True
except ImportError as e:
    logger.warning(f"MikroTik connector not available: {e}")
    MIKROTIK_AVAILABLE = False
    # Create a dummy class for fallback
    class MikroTikConnector:
        def __init__(self, *args, **kwargs):
            raise ImportError("MikroTik connector not available. Please install routeros-api.")


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
    
    # Enhanced Connection status fields
    CONNECTION_STATUS_CHOICES = (
        ("connected", "Connected"),
        ("disconnected", "Disconnected"), 
        ("testing", "Testing"),
        ("authentication_failed", "Authentication Failed"),
        ("connection_failed", "Connection Failed"),
    )
    
    CONFIGURATION_STATUS_CHOICES = (
        ("not_configured", "Not Configured"),
        ("configured", "Configured"),
        ("partially_configured", "Partially Configured"),
        ("configuration_failed", "Configuration Failed"),
    )

    name = models.CharField(max_length=100)
    ip = models.GenericIPAddressField()
    port = models.PositiveIntegerField(default=8728)
    username = models.CharField(max_length=100, default="admin")
    password = models.CharField(max_length=100, blank=True)
    type = models.CharField(max_length=20, choices=ROUTER_TYPES, default="mikrotik")
    location = models.CharField(max_length=100, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="disconnected")
    
    # Enhanced connection management fields
    connection_status = models.CharField(
        max_length=25, 
        choices=CONNECTION_STATUS_CHOICES, 
        default="disconnected"
    )
    last_connection_test = models.DateTimeField(null=True, blank=True)
    configuration_status = models.CharField(
        max_length=25,
        choices=CONFIGURATION_STATUS_CHOICES,
        default="not_configured"
    )
    configuration_type = models.CharField(
        max_length=20, 
        choices=[("hotspot", "Hotspot"), ("pppoe", "PPPoE"), ("both", "Both"), ("vpn", "VPN")],
        blank=True, 
        null=True
    )
    configuration_template = models.JSONField(default=dict, blank=True)
    last_configuration_update = models.DateTimeField(null=True, blank=True)
    
    # Connection quality metrics
    average_response_time = models.FloatField(null=True, blank=True)
    connection_success_rate = models.FloatField(
        validators=[MinValueValidator(0), MaxValueValidator(100)], 
        default=0
    )
    
    last_seen = models.DateTimeField(default=timezone.now)
    is_default = models.BooleanField(default=False)
    captive_portal_enabled = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)
    callback_url = models.URLField(max_length=500, blank=True, null=True)
    max_clients = models.PositiveIntegerField(default=50, validators=[MinValueValidator(1), MaxValueValidator(1000)])
    description = models.TextField(blank=True, null=True)
    firmware_version = models.CharField(max_length=50, blank=True, null=True)
    
    # Enhanced SSID field with dynamic naming support
    ssid = models.CharField(
        max_length=100, 
        blank=True, 
        null=True, 
        default="SurfZone-WiFi",
        help_text="Dynamic SSID for hotspot configuration. Leave blank for auto-generation."
    )
    
    # NEW: VPN configuration fields
    vpn_enabled = models.BooleanField(default=False)
    vpn_type = models.CharField(
        max_length=20,
        choices=[("openvpn", "OpenVPN"), ("wireguard", "WireGuard"), ("sstp", "SSTP")],
        blank=True,
        null=True
    )
    vpn_configuration = models.JSONField(default=dict, blank=True)
    
    # NEW: Technician workflow tracking
    last_technician_workflow = models.DateTimeField(null=True, blank=True)
    workflow_status = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        help_text="Status of last technician workflow"
    )
    
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.ip}) - {self.type}"

    class Meta:
        ordering = ["-is_default", "name"]
        indexes = [
            models.Index(fields=['status', 'is_active']),
            models.Index(fields=['type']),
            models.Index(fields=['ssid']),
            # Enhanced indexes for connection management
            models.Index(fields=['connection_status']),
            models.Index(fields=['configuration_status']),
            models.Index(fields=['last_connection_test']),
            models.Index(fields=['vpn_enabled', 'vpn_type']),
        ]

    def save(self, *args, **kwargs):
        # Auto-generate SSID if not provided and name is available
        if not self.ssid and self.name:
            self.ssid = f"{self.name}-WiFi"
            
        # Auto-generate callback URL if not provided
        if not self.callback_url and self.id:
            from django.conf import settings
            base_url = getattr(settings, 'BASE_URL', 'http://localhost:8000')
            self.callback_url = f"{base_url}/api/payments/mpesa-callbacks/dispatch/{self.id}/"
            
        super().save(*args, **kwargs)
        self.cache_router_data()

    def cache_router_data(self):
        """Enhanced caching with VPN and connection data."""
        cache_key = f"router:{self.id}:data"
        router_data = {
            'id': self.id,
            'name': self.name,
            'ip': self.ip,
            'status': self.status,
            'connection_status': self.connection_status,
            'configuration_status': self.configuration_status,
            'configuration_type': self.configuration_type,
            'type': self.type,
            'max_clients': self.max_clients,
            'ssid': self.ssid,
            'vpn_enabled': self.vpn_enabled,
            'vpn_type': self.vpn_type,
            'last_seen': self.last_seen.isoformat(),
            'last_connection_test': self.last_connection_test.isoformat() if self.last_connection_test else None,
            'firmware_version': self.firmware_version,
        }
        cache.set(cache_key, router_data, 300)

    def get_active_users_count(self):
        """Enhanced active users count with caching."""
        cache_key = f"router:{self.id}:active_users"
        cached_count = cache.get(cache_key)
        
        if cached_count is not None:
            return int(cached_count)
        
        hotspot_count = self.hotspot_users.filter(active=True).count()
        pppoe_count = self.pppoe_users.filter(active=True).count()
        total_count = hotspot_count + pppoe_count
        
        cache.set(cache_key, total_count, 60)
        return total_count

    # Enhanced Connection management methods
    def test_connection(self):
        """Enhanced connection testing with proper error handling."""
        if not MIKROTIK_AVAILABLE:
            # Create a mock response when connector is not available
            test_results = {
                'system_access': False,
                'response_time': None,
                'system_info': {},
                'error_messages': ['MikroTik connector not available. Install routeros-api package.']
            }
            
            # Update connection status
            self.connection_status = 'disconnected'
            self.last_connection_test = timezone.now()
            self.save()
            
            # Save test results
            RouterConnectionTest.objects.create(
                router=self,
                success=False,
                response_time=None,
                system_info={},
                error_messages=test_results['error_messages']
            )
            
            return test_results
        
        try:
            connector = MikroTikConnector(
                ip=self.ip,
                username=self.username,
                password=self.password,
                port=self.port
            )
            
            test_results = connector.test_connection()
            
            # Update connection status based on test results
            if test_results.get('system_access'):
                self.connection_status = 'connected'
                # Update system info if available
                if test_results.get('system_info'):
                    self.firmware_version = test_results['system_info'].get('version', self.firmware_version)
            else:
                self.connection_status = 'disconnected'
                
            self.last_connection_test = timezone.now()
            self.save()
            
            # Save detailed test results
            RouterConnectionTest.objects.create(
                router=self,
                success=test_results.get('system_access', False),
                response_time=test_results.get('response_time'),
                system_info=test_results.get('system_info', {}),
                error_messages=test_results.get('error_messages', [])
            )
            
            return test_results
            
        except Exception as e:
            logger.error(f"Connection test failed for router {self.id}: {str(e)}")
            
            # Save failed test
            RouterConnectionTest.objects.create(
                router=self,
                success=False,
                response_time=None,
                system_info={},
                error_messages=[f"Connection test failed: {str(e)}"]
            )
            
            self.connection_status = 'disconnected'
            self.last_connection_test = timezone.now()
            self.save()
            
            return {
                'system_access': False,
                'response_time': None,
                'system_info': {},
                'error_messages': [f"Connection test failed: {str(e)}"]
            }

    def get_connection_quality(self):
        """Calculate connection quality based on recent tests."""
        recent_tests = RouterConnectionTest.objects.filter(
            router=self,
            tested_at__gte=timezone.now() - timedelta(days=7)
        )
        
        if not recent_tests.exists():
            return {
                'quality': 'unknown',
                'success_rate': 0,
                'average_response_time': 0,
                'total_tests': 0
            }
        
        total_tests = recent_tests.count()
        successful_tests = recent_tests.filter(success=True).count()
        success_rate = (successful_tests / total_tests) * 100
        
        # Calculate average response time from successful tests only
        successful_response_times = recent_tests.filter(
            success=True, 
            response_time__isnull=False
        ).values_list('response_time', flat=True)
        
        avg_response_time = sum(successful_response_times) / len(successful_response_times) if successful_response_times else 0
        
        # Determine quality level
        if success_rate >= 95 and avg_response_time < 1.0:
            quality = 'excellent'
        elif success_rate >= 85 and avg_response_time < 2.0:
            quality = 'good'
        elif success_rate >= 70:
            quality = 'fair'
        else:
            quality = 'poor'
            
        # Update router metrics
        self.average_response_time = avg_response_time
        self.connection_success_rate = success_rate
        self.save(update_fields=['average_response_time', 'connection_success_rate'])
            
        return {
            'quality': quality,
            'success_rate': round(success_rate, 2),
            'average_response_time': round(avg_response_time, 3),
            'total_tests': total_tests
        }

    def can_configure_hotspot(self):
        """Check if router can be configured for hotspot."""
        return (self.connection_status == 'connected' and 
                self.type == 'mikrotik' and
                self.configuration_status in ['not_configured', 'partially_configured'])

    def can_configure_pppoe(self):
        """Check if router can be configured for PPPoE."""
        return (self.connection_status == 'connected' and
                self.type == 'mikrotik' and
                self.configuration_status in ['not_configured', 'partially_configured'])

    def can_configure_vpn(self):
        """Check if router can be configured for VPN."""
        return (self.connection_status == 'connected' and
                self.type == 'mikrotik' and
                self.configuration_status in ['not_configured', 'partially_configured', 'configured'])

    # NEW: Technician workflow methods
    def start_technician_workflow(self, workflow_type, technician):
        """Start a technician workflow on this router."""
        from network_management.scripts.technician_workflow import TechnicianWorkflowManager
        
        workflow_manager = TechnicianWorkflowManager(technician, self.location or "Unknown Site")
        success, message, workflow_details = workflow_manager.start_workflow(workflow_type, {
            'host': self.ip,
            'username': self.username,
            'password': self.password,
            'port': self.port,
            'name': self.name,
            'vpn_type': 'openvpn',
            'setup_type': 'hotspot'
        })
        
        # Update router with workflow results
        self.last_technician_workflow = timezone.now()
        self.workflow_status = f"{workflow_type}: {'Success' if success else 'Failed'}"
        self.save()
        
        return success, message, workflow_details

    # NEW: VPN management methods
    def enable_vpn(self, vpn_type="openvpn", configuration=None):
        """Enable VPN on the router."""
        try:
            if not MIKROTIK_AVAILABLE:
                return False, "MikroTik connector not available"
                
            connector = MikroTikConnector(
                ip=self.ip,
                username=self.username,
                password=self.password,
                port=self.port
            )
            
            # Test connection first
            test_results = connector.test_connection()
            if not test_results.get('system_access'):
                return False, "Router is not accessible"
            
            # Configure VPN based on type
            if vpn_type == "openvpn":
                success, message, config_details = connector.configure_openvpn_server()
            elif vpn_type == "wireguard":
                success, message, config_details = connector.configure_wireguard_server()
            elif vpn_type == "sstp":
                success, message, config_details = connector.configure_sstp_server()
            else:
                return False, f"Unsupported VPN type: {vpn_type}"
            
            if success:
                self.vpn_enabled = True
                self.vpn_type = vpn_type
                self.vpn_configuration = config_details or {}
                self.configuration_status = 'configured'
                if not self.configuration_type:
                    self.configuration_type = 'vpn'
                elif 'vpn' not in self.configuration_type:
                    self.configuration_type = f"{self.configuration_type},vpn"
                self.save()
                
            return success, message
            
        except Exception as e:
            logger.error(f"VPN enablement failed for router {self.id}: {str(e)}")
            return False, f"VPN enablement failed: {str(e)}"

    def disable_vpn(self):
        """Disable VPN on the router."""
        self.vpn_enabled = False
        self.vpn_type = None
        self.vpn_configuration = {}
        self.save()
        return True, "VPN disabled successfully"

    # NEW: Bulk operation support
    @classmethod
    def bulk_test_connections(cls, router_ids):
        """Test connections for multiple routers."""
        results = {
            'total': len(router_ids),
            'successful': 0,
            'failed': 0,
            'details': {}
        }
        
        for router_id in router_ids:
            try:
                router = cls.objects.get(id=router_id)
                test_results = router.test_connection()
                
                if test_results.get('system_access'):
                    results['successful'] += 1
                    results['details'][router_id] = {
                        'status': 'success',
                        'message': 'Connection test successful',
                        'response_time': test_results.get('response_time')
                    }
                else:
                    results['failed'] += 1
                    results['details'][router_id] = {
                        'status': 'failed',
                        'message': test_results.get('error_messages', ['Unknown error'])[0],
                        'response_time': test_results.get('response_time')
                    }
                    
            except Exception as e:
                results['failed'] += 1
                results['details'][router_id] = {
                    'status': 'error',
                    'message': str(e)
                }
        
        return results


class RouterConnectionTest(models.Model):
    """
    Enhanced: Model to store detailed connection test results for routers.
    """
    router = models.ForeignKey(Router, on_delete=models.CASCADE, related_name="connection_tests")
    success = models.BooleanField(default=False)
    response_time = models.FloatField(null=True, blank=True, help_text="Response time in seconds")
    system_info = models.JSONField(default=dict, blank=True, help_text="System information from router")
    error_messages = models.JSONField(default=list, blank=True, help_text="List of error messages")
    tested_at = models.DateTimeField(default=timezone.now)
    tested_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        ordering = ["-tested_at"]
        indexes = [
            models.Index(fields=['router', 'tested_at']),
            models.Index(fields=['success', 'tested_at']),
            models.Index(fields=['tested_by', 'tested_at']),
        ]

    def __str__(self):
        status = "Success" if self.success else "Failed"
        return f"Connection test for {self.router.name} - {status} at {self.tested_at}"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.cache_test_results()

    def cache_test_results(self):
        """Cache test results for quick access."""
        cache_key = f"router:{self.router.id}:latest_test"
        test_data = {
            'success': self.success,
            'response_time': self.response_time,
            'tested_at': self.tested_at.isoformat(),
            'error_messages': self.error_messages
        }
        cache.set(cache_key, test_data, 3600)  # Cache for 1 hour


class HotspotConfiguration(models.Model):
    AUTH_METHODS = (
        ('universal', 'Universal'),
        ('mac', 'MAC Address'),
        ('voucher', 'Voucher'),
        ('social', 'Social Login'),
    )
    
    router = models.ForeignKey(Router, on_delete=models.CASCADE, related_name="hotspot_configurations")
    
    # Enhanced SSID field with dynamic support
    ssid = models.CharField(
        max_length=100, 
        default="SurfZone-WiFi",
        help_text="Dynamic SSID for the hotspot. Can be customized per router."
    )
    
    landing_page_file = models.FileField(upload_to='hotspot_pages/', null=True, blank=True)
    redirect_url = models.URLField(default="http://captive.surfzone.local")
    bandwidth_limit = models.CharField(max_length=20, default="10M")
    session_timeout = models.IntegerField(default=60, help_text="Session timeout in minutes")
    auth_method = models.CharField(max_length=20, choices=AUTH_METHODS, default='universal')
    enable_splash_page = models.BooleanField(default=True)
    allow_social_login = models.BooleanField(default=False)
    enable_bandwidth_shaping = models.BooleanField(default=True)
    log_user_activity = models.BooleanField(default=True)
    max_users = models.IntegerField(default=50, validators=[MinValueValidator(1), MaxValueValidator(1000)])
    welcome_message = models.TextField(blank=True, null=True)
    terms_conditions_url = models.URLField(blank=True, null=True)
    
    # Enhanced Configuration status fields
    configuration_applied = models.BooleanField(default=False)
    last_configuration_attempt = models.DateTimeField(null=True, blank=True)
    configuration_errors = models.JSONField(default=list, blank=True)
    
    # NEW: Advanced configuration options
    ip_pool = models.CharField(max_length=100, default="192.168.100.10-192.168.100.200")
    dns_servers = models.CharField(max_length=100, default="8.8.8.8,1.1.1.1")
    rate_limit = models.CharField(max_length=50, default="10M/10M")
    idle_timeout = models.IntegerField(default=300, help_text="Idle timeout in seconds")
    
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Hotspot Config for {self.router.name} (SSID: {self.ssid})"

    class Meta:
        verbose_name = "Hotspot Configuration"
        verbose_name_plural = "Hotspot Configurations"
        indexes = [
            models.Index(fields=['router', 'ssid']),
            models.Index(fields=['configuration_applied']),
        ]

    def apply_configuration(self):
        """Enhanced configuration application with error handling."""
        if not MIKROTIK_AVAILABLE:
            self.configuration_errors.append("MikroTik connector not available")
            self.configuration_applied = False
            self.save()
            return False, "MikroTik connector not available. Please install routeros-api."
        
        if not self.router.connection_status == 'connected':
            self.configuration_errors.append("Router is not connected")
            self.configuration_applied = False
            self.save()
            return False, "Router is not connected"
        
        try:
            connector = MikroTikConnector(
                ip=self.router.ip,
                username=self.router.username,
                password=self.router.password,
                port=self.router.port
            )
            
            success, message, configuration = connector.configure_hotspot(
                ssid=self.ssid,
                welcome_message=self.welcome_message,
                bandwidth_limit=self.bandwidth_limit,
                session_timeout=self.session_timeout,
                max_users=self.max_users,
                redirect_url=self.redirect_url,
                ip_pool=self.ip_pool
            )
            
            self.configuration_applied = success
            self.last_configuration_attempt = timezone.now()
            if not success:
                self.configuration_errors.append(message)
            
            # Update router configuration status
            if success:
                self.router.configuration_status = 'configured'
                self.router.configuration_type = 'hotspot'
                self.router.ssid = self.ssid
                self.router.save()
            
            self.save()
            return success, message
            
        except Exception as e:
            error_msg = f"Configuration failed: {str(e)}"
            logger.error(f"Hotspot configuration failed for router {self.router.id}: {error_msg}")
            self.configuration_errors.append(error_msg)
            self.configuration_applied = False
            self.last_configuration_attempt = timezone.now()
            self.save()
            return False, error_msg


class PPPoEConfiguration(models.Model):
    AUTH_METHODS = (
        ('all', 'All Methods'),
        ('pap', 'PAP Only'),
        ('chap', 'CHAP Only'),
        ('mschap', 'MS-CHAP Only'),
    )
    
    SERVICE_TYPES = (
        ('standard', 'Standard'),
        ('business', 'Business'),
        ('premium', 'Premium'),
    )
    
    router = models.ForeignKey(Router, on_delete=models.CASCADE, related_name="pppoe_configurations")
    ip_pool_name = models.CharField(max_length=50, default="pppoe-pool-1")
    
    # Enhanced service name with dynamic support
    service_name = models.CharField(
        max_length=100, 
        blank=True, 
        null=True,
        help_text="PPPoE service name. Leave blank for auto-generation."
    )
    
    mtu = models.IntegerField(default=1492, validators=[MinValueValidator(576), MaxValueValidator(1500)])
    dns_servers = models.CharField(max_length=100, default="8.8.8.8,1.1.1.1")
    bandwidth_limit = models.CharField(max_length=20, default="10M")
    auth_methods = models.CharField(max_length=20, choices=AUTH_METHODS, default='all')
    enable_pap = models.BooleanField(default=True)
    enable_chap = models.BooleanField(default=True)
    enable_mschap = models.BooleanField(default=True)
    idle_timeout = models.IntegerField(default=300, help_text="Idle timeout in seconds")
    session_timeout = models.IntegerField(default=0, help_text="Session timeout in seconds (0 = unlimited)")
    default_profile = models.CharField(max_length=50, default="default")
    interface = models.CharField(max_length=50, default="bridge")
    ip_range_start = models.GenericIPAddressField(default="192.168.100.10")
    ip_range_end = models.GenericIPAddressField(default="192.168.100.200")
    service_type = models.CharField(max_length=20, choices=SERVICE_TYPES, default='standard')
    
    # Enhanced Configuration status fields
    configuration_applied = models.BooleanField(default=False)
    last_configuration_attempt = models.DateTimeField(null=True, blank=True)
    configuration_errors = models.JSONField(default=list, blank=True)
    
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        service_name = self.service_name or f"PPPoE-{self.router.name}"
        return f"PPPoE Config for {self.router.name} (Service: {service_name})"

    class Meta:
        verbose_name = "PPPoE Configuration"
        verbose_name_plural = "PPPoE Configurations"
        indexes = [
            models.Index(fields=['router', 'service_name']),
            models.Index(fields=['configuration_applied']),
        ]

    def save(self, *args, **kwargs):
        # Auto-generate service name if not provided
        if not self.service_name and self.router.name:
            self.service_name = f"{self.router.name}-PPPoE"
        super().save(*args, **kwargs)

    def apply_configuration(self):
        """Enhanced PPPoE configuration with error handling."""
        if not MIKROTIK_AVAILABLE:
            self.configuration_errors.append("MikroTik connector not available")
            self.configuration_applied = False
            self.save()
            return False, "MikroTik connector not available. Please install routeros-api."
        
        if not self.router.connection_status == 'connected':
            self.configuration_errors.append("Router is not connected")
            self.configuration_applied = False
            self.save()
            return False, "Router is not connected"
        
        try:
            connector = MikroTikConnector(
                ip=self.router.ip,
                username=self.router.username,
                password=self.router.password,
                port=self.router.port
            )
            
            success, message, configuration = connector.configure_pppoe(
                ip_pool_name=self.ip_pool_name,
                service_name=self.service_name,
                bandwidth_limit=self.bandwidth_limit,
                mtu=self.mtu,
                dns_servers=self.dns_servers
            )
            
            self.configuration_applied = success
            self.last_configuration_attempt = timezone.now()
            if not success:
                self.configuration_errors.append(message)
            
            # Update router configuration status
            if success:
                self.router.configuration_status = 'configured'
                self.router.configuration_type = 'pppoe'
                self.router.save()
            
            self.save()
            return success, message
            
        except Exception as e:
            error_msg = f"Configuration failed: {str(e)}"
            logger.error(f"PPPoE configuration failed for router {self.router.id}: {error_msg}")
            self.configuration_errors.append(error_msg)
            self.configuration_applied = False
            self.last_configuration_attempt = timezone.now()
            self.save()
            return False, error_msg


class RouterStats(models.Model):
    router = models.ForeignKey(Router, on_delete=models.CASCADE, related_name="stats")
    cpu = models.FloatField(validators=[MinValueValidator(0), MaxValueValidator(100)])
    memory = models.FloatField(validators=[MinValueValidator(0), MaxValueValidator(100)])
    connected_clients_count = models.IntegerField(validators=[MinValueValidator(0)])
    uptime = models.CharField(max_length=50)
    signal = models.IntegerField(null=True, blank=True)
    temperature = models.FloatField(help_text="in °C", null=True, blank=True)
    throughput = models.FloatField(help_text="in Mbps", validators=[MinValueValidator(0)])
    disk = models.FloatField(validators=[MinValueValidator(0), MaxValueValidator(100)])
    timestamp = models.DateTimeField(default=timezone.now)
    upload_speed = models.FloatField(help_text="in Mbps", default=0, validators=[MinValueValidator(0)])
    download_speed = models.FloatField(help_text="in Mbps", default=0, validators=[MinValueValidator(0)])
    hotspot_clients = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    pppoe_clients = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    
    # NEW: VPN-specific metrics
    vpn_connections = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    vpn_throughput = models.FloatField(help_text="VPN throughput in Mbps", default=0)

    def __str__(self):
        return f"Stats for {self.router.name} at {self.timestamp}"

    class Meta:
        ordering = ["-timestamp"]
        indexes = [
            models.Index(fields=['router', 'timestamp']),
            models.Index(fields=['timestamp']),
        ]

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.cache_latest_stats()

    def cache_latest_stats(self):
        cache_key = f"router:{self.router.id}:latest_stats"
        stats_data = {
            'cpu': self.cpu,
            'memory': self.memory,
            'clients': self.connected_clients_count,
            'hotspot_clients': self.hotspot_clients,
            'pppoe_clients': self.pppoe_clients,
            'vpn_connections': self.vpn_connections,
            'uptime': self.uptime,
            'signal': self.signal,
            'temperature': self.temperature,
            'throughput': self.throughput,
            'upload_speed': self.upload_speed,
            'download_speed': self.download_speed,
            'disk': self.disk,
            'timestamp': self.timestamp.isoformat(),
        }
        cache.set(cache_key, stats_data, 120)


class HotspotUser(models.Model):
    QUALITY_OF_SERVICE_CHOICES = (
        ('Residential', 'Residential'),
        ('Business', 'Business'),
        ('Promotional', 'Promotional'), 
        ('Enterprise', 'Enterprise'),
    )
    
    router = models.ForeignKey(Router, on_delete=models.CASCADE, related_name="hotspot_users")
    client = models.ForeignKey(
        "authentication.UserAccount", 
        on_delete=models.CASCADE, 
        related_name="hotspot_user",
        limit_choices_to={'user_type': 'client'},  
    )
    # plan = models.ForeignKey("internet_plans.InternetPlan", on_delete=models.SET_NULL, null=True)
    # transaction = models.ForeignKey("payments.Transaction", on_delete=models.SET_NULL, null=True)
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
    bandwidth_used = models.JSONField(default=dict, help_text="Upload/download usage in bytes")
    quality_of_service = models.CharField(
        max_length=20, 
        default="standard", 
        choices=QUALITY_OF_SERVICE_CHOICES
    )
    device_info = models.JSONField(default=dict, help_text="Device type, OS, browser info")
    
    # NEW: Connection quality tracking
    connection_quality = models.CharField(max_length=20, default="good", choices=[
        ('excellent', 'Excellent'),
        ('good', 'Good'), 
        ('fair', 'Fair'),
        ('poor', 'Poor')
    ])
    average_signal_strength = models.IntegerField(null=True, blank=True, help_text="Average signal strength in dBm")

    def __str__(self):
        return f"{self.client.user.username if self.client else 'Guest'} on {self.router.name}"

    def save(self, *args, **kwargs):
        if self.active:
            self.last_activity = timezone.now()
            self.cache_active_session()
        else:
            self.clear_cached_session()
        super().save(*args, **kwargs)

    def cache_active_session(self):
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
            'connection_quality': self.connection_quality,
        }
        cache.set(cache_key, session_data, 300)

    def clear_cached_session(self):
        cache_key = f"hotspot_session:{self.session_id}"
        cache.delete(cache_key)

    class Meta:
        ordering = ["-connected_at"]
        indexes = [
            models.Index(fields=["mac"]),
            models.Index(fields=["session_id"]),
            models.Index(fields=["active"]),
            models.Index(fields=["client", "active"]),
            models.Index(fields=["router", "active"]),
            models.Index(fields=["quality_of_service"]),
        ]


class PPPoEUser(models.Model):
    SERVICE_TYPE_CHOICES = (
        ("standard", "Standard"), 
        ("business", "Business"), 
        ("premium", "Premium")
    )
    
    router = models.ForeignKey(Router, on_delete=models.CASCADE, related_name="pppoe_users")
    client = models.ForeignKey(
        "authentication.UserAccount", 
        on_delete=models.CASCADE, 
        related_name="pppoe_user",
        limit_choices_to={'user_type': 'client'},  
    )
    # plan = models.ForeignKey("internet_plans.InternetPlan", on_delete=models.SET_NULL, null=True)
    # transaction = models.ForeignKey("payments.Transaction", on_delete=models.SET_NULL, null=True)
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
    bandwidth_used = models.JSONField(default=dict, help_text="Upload/download usage in bytes")
    pppoe_service_type = models.CharField(
        max_length=50, 
        default="standard",
        choices=SERVICE_TYPE_CHOICES
    )
    
    # NEW: Connection metrics
    connection_uptime = models.IntegerField(default=0, help_text="Connection uptime in seconds")
    connection_quality = models.CharField(max_length=20, default="good", choices=[
        ('excellent', 'Excellent'),
        ('good', 'Good'),
        ('fair', 'Fair'), 
        ('poor', 'Poor')
    ])

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
            'connection_quality': self.connection_quality,
        }
        cache.set(cache_key, session_data, 300)

    def clear_cached_session(self):
        cache_key = f"pppoe_session:{self.session_id}"
        cache.delete(cache_key)

    class Meta:
        ordering = ["-connected_at"]
        indexes = [
            models.Index(fields=["username"]),
            models.Index(fields=["session_id"]),
            models.Index(fields=["active"]),
            models.Index(fields=["client", "active"]),
            models.Index(fields=["router", "active"]),
            models.Index(fields=["pppoe_service_type"]),
        ]


class ActivationAttempt(models.Model):
    VERIFICATION_METHOD_CHOICES = (
        ("automatic", "Automatic"), 
        ("manual", "Manual")
    )
    
    subscription = models.ForeignKey("service_operations.Subscription", on_delete=models.CASCADE, null=True, blank=True)
    router = models.ForeignKey(Router, on_delete=models.CASCADE)
    attempted_at = models.DateTimeField(auto_now_add=True)
    success = models.BooleanField(default=False)
    error_message = models.TextField(blank=True)
    retry_count = models.IntegerField(default=0)
    user_type = models.CharField(max_length=10, choices=[('hotspot', 'Hotspot'), ('pppoe', 'PPPoE')], default='hotspot')
    payment_verified = models.BooleanField(default=False)
    transaction_reference = models.CharField(max_length=100, blank=True, null=True)
    verification_method = models.CharField(
        max_length=20, 
        default="automatic", 
        choices=VERIFICATION_METHOD_CHOICES
    )
    
    # NEW: Technician workflow association
    technician = models.ForeignKey(
        'authentication.UserAccount', 
        limit_choices_to={'user_type__in': ['staff', 'admin']}, 
        on_delete=models.SET_NULL, 
        null=True,
        blank=True
    )
    workflow_type = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        ordering = ["-attempted_at"]
        indexes = [
            models.Index(fields=['payment_verified', 'success']),
            models.Index(fields=['router', 'attempted_at']),
            models.Index(fields=['technician', 'attempted_at']),
        ]


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
        ("vpn_reconnect", "VPN Reconnect"),
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
    recoverable = models.BooleanField(default=False)
    recovery_attempted = models.BooleanField(default=False)
    recovered_at = models.DateTimeField(null=True, blank=True)
    
    # NEW: Session quality metrics
    average_signal_strength = models.IntegerField(null=True, blank=True)
    connection_quality = models.CharField(max_length=20, default="good", choices=[
        ('excellent', 'Excellent'),
        ('good', 'Good'),
        ('fair', 'Fair'),
        ('poor', 'Poor')
    ])

    class Meta:
        ordering = ["-start_time"]
        indexes = [
            models.Index(fields=['recoverable', 'user_type']),
            models.Index(fields=['start_time', 'end_time']),
            models.Index(fields=['router', 'start_time']),
        ]


class RouterHealthCheck(models.Model):
    router = models.ForeignKey(Router, on_delete=models.CASCADE, related_name="health_checks")
    timestamp = models.DateTimeField(default=timezone.now)
    is_online = models.BooleanField(default=False)
    response_time = models.FloatField(null=True, blank=True)
    error_message = models.TextField(blank=True, null=True)
    system_metrics = models.JSONField(default=dict, blank=True)
    health_score = models.IntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])
    critical_alerts = models.JSONField(default=list, blank=True)
    performance_metrics = models.JSONField(default=dict, blank=True)
    
    # NEW: VPN health metrics
    vpn_status = models.JSONField(default=dict, blank=True, help_text="VPN connection status and metrics")

    class Meta:
        ordering = ["-timestamp"]
        indexes = [
            models.Index(fields=['router', 'timestamp']),
            models.Index(fields=['health_score']),
            models.Index(fields=['is_online', 'timestamp']),
        ]

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.cache_health_status()

    def cache_health_status(self):
        cache_key = f"router:{self.router.id}:health"
        health_data = {
            'is_online': self.is_online,
            'health_score': self.health_score,
            'response_time': self.response_time,
            'timestamp': self.timestamp.isoformat(),
            'critical_alerts': self.critical_alerts,
            'vpn_status': self.vpn_status,
        }
        cache.set(cache_key, health_data, 180)


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
        ('vpn_status_change', 'VPN Status Change'),
        ('technician_workflow_completed', 'Technician Workflow Completed'),
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
            models.Index(fields=['router', 'event', 'is_active']),
            models.Index(fields=['is_active', 'event']),
        ]


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
        ('connection_test', 'Connection Test'),
        ('technician_workflow', 'Technician Workflow'),
        ('vpn_configuration', 'VPN Configuration'),
        ('bulk_operation', 'Bulk Operation'),
        ('audit_cleanup', 'Audit Cleanup'),  
        ('audit_export', 'Audit Export'),    
    )
    
    router = models.ForeignKey(Router, on_delete=models.CASCADE, related_name="audit_logs", null=True, blank=True  )
    action = models.CharField(max_length=20, choices=ACTION_TYPES)
    description = models.TextField()
    user = models.ForeignKey(
        'authentication.UserAccount',
        on_delete=models.SET_NULL,
        limit_choices_to={'user_type': 'client'},  
        null=True, 
        blank=True
    )
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    changes = models.JSONField(default=dict, blank=True)
    status_code = models.IntegerField(
        null=True, 
        blank=True, 
        help_text="HTTP status code for API operations"
    )
    timestamp = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ["-timestamp"]
        indexes = [
            models.Index(fields=['router', 'action']),
            models.Index(fields=['timestamp']),
            models.Index(fields=['user']),
            models.Index(fields=['action', 'timestamp']),
            models.Index(fields=['status_code']),
        ]

    def __str__(self):
        user_display = self.user.username if self.user else "System"
        return f"{self.action} on {self.router.name} by {user_display} at {self.timestamp}"


class BulkOperation(models.Model):
    OPERATION_TYPES = (
        ('health_check', 'Health Check'),
        ('restart', 'Restart'),
        ('update_firmware', 'Update Firmware'),
        ('backup_config', 'Backup Configuration'),
        ('restore_config', 'Restore Configuration'),
        ('test_connection', 'Test Connection'),
        ('auto_configure', 'Auto Configure'),
        ('technician_workflow', 'Technician Workflow'),
        ('vpn_configuration', 'VPN Configuration'),
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
    initiated_by = models.ForeignKey(
        'authentication.UserAccount', 
        on_delete=models.CASCADE,
        null=True,
        limit_choices_to={'user_type__in': ['staff', 'admin']}
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    results = models.JSONField(default=dict, blank=True)
    started_at = models.DateTimeField(default=timezone.now)
    completed_at = models.DateTimeField(null=True, blank=True)
    error_message = models.TextField(blank=True)
    
    # NEW: Enhanced operation tracking
    parameters = models.JSONField(default=dict, blank=True, help_text="Operation parameters")
    progress = models.IntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])

    class Meta:
        ordering = ["-started_at"]
        indexes = [
            models.Index(fields=['operation_id']),
            models.Index(fields=['operation_type', 'status']),
            models.Index(fields=['initiated_by', 'started_at']),
        ]

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.cache_operation_status()

    def cache_operation_status(self):
        cache_key = f"bulk_operation:{self.operation_id}"
        operation_data = {
            'operation_type': self.operation_type,
            'status': self.status,
            'progress': self.progress,
            'total': self.routers.count(),
            'started_at': self.started_at.isoformat(),
            'initiated_by': self.initiated_by.username if self.initiated_by else "Unknown",
        }
        cache.set(cache_key, operation_data, 3600)

    def __str__(self):
        return f"{self.operation_type} - {self.status} - {self.initiated_by.username}"





class ServiceOperationActivation(models.Model):
    """
    Track activations initiated by Service Operations
    """
    service_operation_id = models.UUIDField(default=uuid.uuid4, unique=True)
    subscription_id = models.CharField(max_length=100)
    router_id = models.IntegerField( null=True, blank=True, db_index=True,help_text="Router ID from Network Management app")
    client_id = models.UUIDField(db_index=True, help_text="Client ID from Authentication app")
    internet_plan_id = models.UUIDField(db_index=True, help_text="Plan ID from Internet Plans app")
    activation_data = models.JSONField(default=dict)
    status = models.CharField(
        max_length=20,
        choices=[
            ('queued', 'Queued'),
            ('processing', 'Processing'),
            ('completed', 'Completed'),
            ('failed', 'Failed'),
            ('cancelled', 'Cancelled')
        ],
        default='queued'
    )
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    error_message = models.TextField(blank=True, null=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['service_operation_id']),
            models.Index(fields=['subscription_id']),
            models.Index(fields=['status', 'created_at']),
        ]
    
    def __str__(self):
        return f"Service Op: {self.subscription_id} - {self.status}"