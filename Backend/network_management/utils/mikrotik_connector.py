
# """
# PRODUCTION-READY MikroTik Router Connector Utility
# Enhanced with security, external configuration, monitoring, and MySQL integration.
# """

# import os
# import logging
# import socket
# import time
# import re
# import sys
# import ssl
# import datetime
# from typing import Dict, Tuple, Optional, Any, List

# # Django imports
# try:
#     from django.conf import settings
#     from django.core.cache import cache
#     from django.db import transaction
#     from django.utils import timezone
#     DJANGO_AVAILABLE = True
# except ImportError:
#     DJANGO_AVAILABLE = False
#     # Fallback implementations
#     timezone = datetime.datetime
#     class SimpleCache:
#         def get(self, key, default=None): return default
#         def set(self, key, value, timeout=None): pass
#         def delete(self, key): pass
#     cache = SimpleCache()
#     settings = type('Settings', (), {})()
#     transaction = type('Transaction', (), {'atomic': lambda: type('Context', (), {'__enter__': lambda self: None, '__exit__': lambda self, *args: None})()})()

# # RouterOS API imports
# try:
#     from routeros_api import RouterOsApiPool
#     from routeros_api.exceptions import RouterOsApiConnectionError, RouterOsApiCommunicationError
#     ROUTEROS_AVAILABLE = True
# except ImportError:
#     ROUTEROS_AVAILABLE = False
#     class RouterOsApiPool:
#         def __init__(self, *args, **kwargs):
#             raise ImportError("routeros-api package not installed")
#         def get_api(self): pass
#         def disconnect(self): pass
#         @property
#         def active_count(self): return 0
#     RouterOsApiConnectionError = RouterOsApiCommunicationError = Exception

# logger = logging.getLogger(__name__)


# class SecurityConfig:
#     """Security configuration management with proper certificate handling."""
    
#     @staticmethod
#     def get_ssl_context():
#         """Create SSL context with proper certificate verification."""
#         context = ssl.create_default_context()
        
#         # Get SSL configuration from settings
#         ssl_verify = settings.MIKROTIK_CONFIG['CONNECTION'].get('SSL_VERIFY', True)
        
#         if ssl_verify:
#             # Production: Verify certificates
#             ca_cert_path = settings.MIKROTIK_CONFIG['CONNECTION'].get('SSL_CA_CERT_PATH')
                
#             if ca_cert_path and os.path.exists(ca_cert_path):
#                 context.load_verify_locations(ca_cert_path)
#             context.verify_mode = ssl.CERT_REQUIRED
#         else:
#             # Development: Allow self-signed certificates with warning
#             logger.warning("SSL verification disabled - not recommended for production")
#             context.check_hostname = False
#             context.verify_mode = ssl.CERT_NONE
            
#         return context
    
#     @staticmethod
#     def validate_credentials(ip: str, username: str, password: str) -> Tuple[bool, List[str]]:
#         """Validate credentials before connection attempts."""
#         errors = []
        
#         # Security validation from settings
#         security_config = settings.MIKROTIK_CONFIG.get('SECURITY', {})
#         validate_credentials = security_config.get('VALIDATE_CREDENTIALS', True)
#         reject_default_passwords = security_config.get('REJECT_DEFAULT_PASSWORDS', True)
        
#         if not validate_credentials:
#             return True, errors
            
#         # Check for default credentials
#         if reject_default_passwords and username == 'admin' and password in ['', 'admin']:
#             errors.append("Default credentials detected - change for security")
            
#         # Check password strength
#         if len(password) < 8:
#             errors.append("Password too short - minimum 8 characters required")
            
#         # Check IP format
#         if not re.match(r'^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$', ip):
#             errors.append("Invalid IP address format")
            
#         return len(errors) == 0, errors


# class MikroTikConfig:
#     """Externalized configuration management using Django settings."""
    
#     @classmethod
#     def get_connection_config(cls) -> Dict:
#         """Get connection configuration from settings."""
#         return settings.MIKROTIK_CONFIG['CONNECTION']
    
#     @classmethod
#     def get_pool_config(cls) -> Dict:
#         """Get pool configuration from settings."""
#         return settings.MIKROTIK_CONFIG['POOL']
    
#     @classmethod
#     def get_monitoring_config(cls) -> Dict:
#         """Get monitoring configuration from settings."""
#         return settings.MIKROTIK_CONFIG.get('MONITORING', {})
    
#     @classmethod
#     def get_logging_config(cls) -> Dict:
#         """Get logging configuration from settings."""
#         return settings.MIKROTIK_CONFIG.get('LOGGING', {})
    
#     @classmethod
#     def get_hotspot_defaults(cls):
#         """Get hotspot configuration defaults from settings."""
#         hotspot_config = settings.MIKROTIK_CONFIG['HOTSPOT']
#         return {
#             'ip_pool': hotspot_config.get('IP_POOL', '192.168.100.10-192.168.100.200'),
#             'bandwidth_limit': hotspot_config.get('BANDWIDTH_LIMIT', '10M/10M'),
#             'session_timeout': hotspot_config.get('SESSION_TIMEOUT', 60),
#             'max_users': hotspot_config.get('MAX_USERS', 50),
#             'default_ssid': hotspot_config.get('DEFAULT_SSID', 'SurfZone-WiFi'),
#         }
    
#     @classmethod
#     def get_pppoe_defaults(cls):
#         """Get PPPoE configuration defaults from settings."""
#         pppoe_config = settings.MIKROTIK_CONFIG['PPPOE']
#         return {
#             'ip_pool_name': pppoe_config.get('IP_POOL_NAME', 'pppoe-pool'),
#             'ip_range': pppoe_config.get('IP_RANGE', '192.168.101.10-192.168.101.200'),
#             'bandwidth_limit': pppoe_config.get('BANDWIDTH_LIMIT', '10M/10M'),
#             'mtu': pppoe_config.get('MTU', 1492),
#             'service_name': pppoe_config.get('SERVICE_NAME', 'PPPoE-Service'),
#         }


# class MonitoringManager:
#     """Monitoring and alerting management."""
    
#     @staticmethod
#     def record_connection_attempt(router_ip: str, success: bool):
#         """Record connection attempt metrics."""
#         monitoring_config = MikroTikConfig.get_monitoring_config()
#         if not monitoring_config.get('ENABLED', True):
#             return
            
#         status = 'success' if success else 'failure'
#         logger.info(f"Connection attempt to {router_ip}: {status}")
    
#     @staticmethod
#     def record_configuration_attempt(router_ip: str, config_type: str, success: bool):
#         """Record configuration attempt metrics."""
#         monitoring_config = MikroTikConfig.get_monitoring_config()
#         if not monitoring_config.get('ENABLED', True):
#             return
            
#         status = 'success' if success else 'failure'
#         logger.info(f"Configuration attempt {config_type} on {router_ip}: {status}")
    
#     @staticmethod
#     def record_response_time(router_ip: str, operation: str, duration: float):
#         """Record response time metrics."""
#         monitoring_config = MikroTikConfig.get_monitoring_config()
#         if not monitoring_config.get('ENABLED', True):
#             return
            
#         max_response_time = monitoring_config.get('MAX_RESPONSE_TIME_ALERT', 5.0)
#         if duration > max_response_time:
#             logger.warning(f"High response time for {operation} on {router_ip}: {duration:.2f}s")
    
#     @staticmethod
#     def check_performance_thresholds(router, response_time: float, success: bool):
#         """Check performance thresholds and create alerts."""
#         if not DJANGO_AVAILABLE:
#             return
            
#         monitoring_config = MikroTikConfig.get_monitoring_config()
#         max_response_time = monitoring_config.get('MAX_RESPONSE_TIME_ALERT', 5.0)
        
#         if response_time > max_response_time:
#             MonitoringManager._create_performance_alert(
#                 router, 
#                 f"High response time: {response_time:.2f}s (threshold: {max_response_time}s)"
#             )
        
#         if not success:
#             MonitoringManager._create_connection_alert(router, "Connection failed")
    
#     @staticmethod
#     def _create_performance_alert(router, message: str):
#         """Create performance alert in database."""
#         try:
#             # Import models here to avoid circular imports
#             from network_management.models.router_management_model import RouterHealthCheck
#             RouterHealthCheck.objects.create(
#                 router=router,
#                 is_online=True,
#                 response_time=None,
#                 error_message=message,
#                 health_score=60,
#                 critical_alerts=[message],
#                 performance_metrics={'high_response_time': True}
#             )
#             logger.warning(f"Performance alert for {router.ip}: {message}")
#         except Exception as e:
#             logger.error(f"Failed to create performance alert: {str(e)}")
    
#     @staticmethod
#     def _create_connection_alert(router, message: str):
#         """Create connection alert in database."""
#         try:
#             # Import models here to avoid circular imports
#             from network_management.models.router_management_model import RouterHealthCheck
#             RouterHealthCheck.objects.create(
#                 router=router,
#                 is_online=False,
#                 response_time=None,
#                 error_message=message,
#                 health_score=0,
#                 critical_alerts=[message],
#                 performance_metrics={}
#             )
#             logger.warning(f"Connection alert for {router.ip}: {message}")
#         except Exception as e:
#             logger.error(f"Failed to create connection alert: {str(e)}")


# class ConnectionPoolManager:
#     """
#     Enhanced connection pooling manager with security and monitoring.
#     """
    
#     _pools = {}
    
#     @classmethod
#     def get_pool(cls, ip: str, username: str, password: str, port: int = None, 
#                  router_id: int = None) -> Any:
#         """Get or create a secure connection pool for a router."""
#         if not ROUTEROS_AVAILABLE:
#             raise ImportError("routeros-api package is required for MikroTik connections")
        
#         # Security validation
#         is_valid, errors = SecurityConfig.validate_credentials(ip, username, password)
#         if not is_valid:
#             logger.warning(f"Security validation failed for {ip}: {', '.join(errors)}")
        
#         connection_config = MikroTikConfig.get_connection_config()
#         pool_config = MikroTikConfig.get_pool_config()
        
#         port = port or connection_config.get('PORT', 8728)
#         pool_key = f"{ip}:{port}:{username}"
        
#         # Clean up old pools periodically
#         cls._cleanup_old_pools()
        
#         if pool_key not in cls._pools:
#             try:
#                 use_ssl = connection_config.get('USE_SSL', False)
#                 ssl_verify = connection_config.get('SSL_VERIFY', True)
                
#                 pool = RouterOsApiPool(
#                     host=ip,
#                     username=username,
#                     password=password,
#                     port=port,
#                     plaintext_login=True,
#                     use_ssl=use_ssl,
#                     ssl_verify=ssl_verify,
#                     timeout=connection_config.get('TIMEOUT', 10),
#                     max_connections=pool_config.get('MAX_CONNECTIONS', 5)
#                 )
                
#                 cls._pools[pool_key] = {
#                     'pool': pool,
#                     'last_used': time.time(),
#                     'use_count': 0,
#                     'created_at': time.time(),
#                     'router_id': router_id
#                 }
                
#                 logger.info(f"Created new secure connection pool for {ip}:{port}")
                
#             except Exception as e:
#                 logger.error(f"Failed to create connection pool for {ip}:{port}: {str(e)}")
#                 MonitoringManager.record_connection_attempt(ip, False)
#                 raise
        
#         cls._pools[pool_key]['last_used'] = time.time()
#         cls._pools[pool_key]['use_count'] += 1
        
#         return cls._pools[pool_key]['pool']
    
#     @classmethod
#     def _cleanup_old_pools(cls):
#         """Clean up pools that haven't been used recently."""
#         current_time = time.time()
#         pool_config = MikroTikConfig.get_pool_config()
#         cleanup_interval = pool_config.get('CLEANUP_INTERVAL', 300)
#         pools_to_remove = []
        
#         for pool_key, pool_info in cls._pools.items():
#             if current_time - pool_info['last_used'] > cleanup_interval:
#                 try:
#                     pool_info['pool'].disconnect()
#                     pools_to_remove.append(pool_key)
#                     logger.info(f"Cleaned up unused connection pool: {pool_key}")
#                 except Exception as e:
#                     logger.warning(f"Error cleaning up pool {pool_key}: {str(e)}")
        
#         for pool_key in pools_to_remove:
#             del cls._pools[pool_key]
    
#     @classmethod
#     def get_pool_stats(cls) -> Dict:
#         """Get statistics about connection pools."""
#         return {
#             'total_pools': len(cls._pools),
#             'pools': {
#                 key: {
#                     'use_count': info['use_count'],
#                     'last_used': info['last_used'],
#                     'created_at': info['created_at'],
#                     'router_id': info.get('router_id')
#                 } for key, info in cls._pools.items()
#             }
#         }
    
#     @classmethod
#     def disconnect_pool(cls, ip: str, port: int = None, username: str = None):
#         """Disconnect specific pool."""
#         connection_config = MikroTikConfig.get_connection_config()
#         port = port or connection_config.get('PORT', 8728)
        
#         if username:
#             pool_key = f"{ip}:{port}:{username}"
#         else:
#             # Find by IP and port only
#             pool_key = next((k for k in cls._pools.keys() if k.startswith(f"{ip}:{port}:")), None)
        
#         if pool_key and pool_key in cls._pools:
#             try:
#                 cls._pools[pool_key]['pool'].disconnect()
#                 del cls._pools[pool_key]
#                 logger.info(f"Disconnected pool: {pool_key}")
#             except Exception as e:
#                 logger.error(f"Error disconnecting pool {pool_key}: {str(e)}")
    
#     @classmethod
#     def disconnect_all_pools(cls):
#         """Disconnect all connection pools."""
#         pools_to_remove = list(cls._pools.keys())
#         for pool_key in pools_to_remove:
#             try:
#                 cls._pools[pool_key]['pool'].disconnect()
#                 del cls._pools[pool_key]
#                 logger.info(f"Disconnected pool: {pool_key}")
#             except Exception as e:
#                 logger.error(f"Error disconnecting pool {pool_key}: {str(e)}")
        
#         logger.info("All connection pools disconnected")


# class DatabaseManager:
#     """MySQL database operations manager."""
    
#     @staticmethod
#     def save_connection_test(router, test_results: Dict, user=None):
#         """Save connection test results to database."""
#         if not DJANGO_AVAILABLE:
#             return None
            
#         logging_config = MikroTikConfig.get_logging_config()
#         if not logging_config.get('SAVE_CONNECTION_TESTS', True):
#             return None
            
#         try:
#             # Import models here to avoid circular imports
#             from network_management.models.router_management_model import RouterConnectionTest
            
#             with transaction.atomic():
#                 connection_test = RouterConnectionTest.objects.create(
#                     router=router,
#                     success=test_results.get('system_access', False),
#                     response_time=test_results.get('response_time'),
#                     system_info=test_results.get('system_info', {}),
#                     error_messages=test_results.get('error_messages', []),
#                     tested_by=user
#                 )
                
#                 # Update router status
#                 router.connection_status = 'connected' if test_results.get('system_access') else 'disconnected'
#                 router.last_connection_test = timezone.now()
                
#                 if test_results.get('system_info'):
#                     router.firmware_version = test_results['system_info'].get('version', router.firmware_version)
                
#                 router.save()
                
#                 return connection_test
                
#         except Exception as e:
#             logger.error(f"Failed to save connection test for router {router.id}: {str(e)}")
#             return None
    
#     @staticmethod
#     def create_audit_log(router, action: str, description: str, 
#                         user=None, ip_address: str = None, changes: Dict = None):
#         """Create audit log entry."""
#         if not DJANGO_AVAILABLE:
#             return
            
#         try:
#             # Import models here to avoid circular imports
#             from network_management.models.router_management_model import RouterAuditLog
#             RouterAuditLog.objects.create(
#                 router=router,
#                 action=action,
#                 description=description,
#                 user=user,
#                 ip_address=ip_address,
#                 changes=changes or {}
#             )
#         except Exception as e:
#             logger.error(f"Failed to create audit log: {str(e)}")
    
#     @staticmethod
#     def update_router_configuration_status(router, config_type: str, success: bool, 
#                                          errors: List[str] = None):
#         """Update router configuration status."""
#         if not DJANGO_AVAILABLE:
#             return
            
#         try:
#             if success:
#                 if router.configuration_status == 'not_configured':
#                     router.configuration_status = 'configured'
#                 elif router.configuration_status == 'partially_configured':
#                     router.configuration_status = 'configured'
#                 router.configuration_type = config_type
#             else:
#                 if router.configuration_status == 'configured':
#                     router.configuration_status = 'partially_configured'
#                 else:
#                     router.configuration_status = 'configuration_failed'
            
#             router.last_configuration_update = timezone.now()
#             router.save()
            
#         except Exception as e:
#             logger.error(f"Failed to update router configuration status: {str(e)}")


# class MikroTikConnector:
#     """
#     PRODUCTION-READY MikroTik router connection and configuration manager.
#     Enhanced with security, monitoring, and database integration.
#     """
    
#     def __init__(self, ip: str, username: str, password: str, port: int = None, 
#                  timeout: int = None, max_retries: int = None, use_ssl: bool = None,
#                  router_id: int = None):
#         self.ip = ip
#         self.username = username
#         self.password = password
        
#         # Get configuration from settings
#         connection_config = MikroTikConfig.get_connection_config()
#         self.port = port or connection_config.get('PORT', 8728)
#         self.timeout = timeout or connection_config.get('TIMEOUT', 10)
#         self.max_retries = max_retries or connection_config.get('MAX_RETRIES', 3)
#         self.use_ssl = use_ssl if use_ssl is not None else connection_config.get('USE_SSL', False)
#         self.router_id = router_id
        
#         self.api_pool = None
#         self.api = None
        
#         # Validate parameters
#         self._validate_parameters()
    
#     def _validate_parameters(self):
#         """Validate connection parameters with security checks."""
#         if not self.ip or not self.username:
#             raise ValueError("IP address and username are required")
        
#         if not re.match(r'^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$', self.ip):
#             raise ValueError("Invalid IP address format")
        
#         if not (1 <= self.port <= 65535):
#             raise ValueError("Port must be between 1 and 65535")
        
#         # Security validation
#         is_valid, errors = SecurityConfig.validate_credentials(self.ip, self.username, self.password)
#         if not is_valid:
#             logger.warning(f"Security issues detected: {', '.join(errors)}")
    
#     def connect(self, user=None) -> Tuple[bool, str, Any]:
#         """
#         Enhanced secure connection establishment with monitoring and database logging.
#         """
#         pool_config = MikroTikConfig.get_pool_config()
#         cache_key = f"router_connection:{self.ip}:{self.port}"
#         cached_result = cache.get(cache_key)
        
#         # Check cached connection
#         if cached_result and cached_result.get('status') == 'connected':
#             cache_age = time.time() - cached_result.get('timestamp', 0)
#             cache_timeout = pool_config.get('CACHE_TIMEOUT', 300)
#             if cache_age < cache_timeout:
#                 logger.debug(f"Using cached connection for {self.ip}")
#                 return True, "Connection verified from cache", cached_result.get('api_data')
        
#         start_time = time.time()
        
#         # Attempt connection with retries
#         for attempt in range(self.max_retries):
#             try:
#                 # Test basic connectivity first
#                 if not self._test_connectivity():
#                     wait_time = 2 ** attempt  # Exponential backoff
#                     logger.warning(f"Connectivity test failed for {self.ip}, attempt {attempt + 1}. Retrying in {wait_time}s")
#                     time.sleep(wait_time)
#                     continue
                
#                 # Use secure connection pool
#                 self.api_pool = ConnectionPoolManager.get_pool(
#                     self.ip, self.username, self.password, self.port, self.router_id
#                 )
                
#                 self.api = self.api_pool.get_api()
                
#                 # Verify connection by fetching system info
#                 system_resource = self.api.get_resource('/system/resource')
#                 system_info = system_resource.get()
                
#                 if not system_info:
#                     logger.warning(f"No system info received from {self.ip}, attempt {attempt + 1}")
#                     continue
                
#                 # Cache successful connection
#                 connection_data = {
#                     'status': 'connected',
#                     'system_info': system_info[0],
#                     'timestamp': time.time(),
#                     'api_data': self.api
#                 }
#                 cache.set(cache_key, connection_data, pool_config.get('CACHE_TIMEOUT', 300))
                
#                 response_time = time.time() - start_time
                
#                 # Record metrics
#                 MonitoringManager.record_connection_attempt(self.ip, True)
#                 MonitoringManager.record_response_time(self.ip, 'connect', response_time)
                
#                 logger.info(f"Successfully connected to MikroTik router at {self.ip} (attempt {attempt + 1}, response time: {response_time:.2f}s)")
#                 return True, "Connection established successfully", self.api
                
#             except RouterOsApiConnectionError as e:
#                 error_msg = f"Connection failed (attempt {attempt + 1}): {str(e)}"
#                 logger.warning(f"MikroTik connection error for {self.ip}: {error_msg}")
#                 MonitoringManager.record_connection_attempt(self.ip, False)
                
#                 if attempt == self.max_retries - 1:
#                     return False, error_msg, None
#                 time.sleep(2 ** attempt)
                
#             except RouterOsApiCommunicationError as e:
#                 error_msg = f"Authentication failed (attempt {attempt + 1}): {str(e)}"
#                 logger.error(f"MikroTik authentication error for {self.ip}: {error_msg}")
#                 MonitoringManager.record_connection_attempt(self.ip, False)
#                 return False, error_msg, None
                
#             except Exception as e:
#                 error_msg = f"Unexpected error (attempt {attempt + 1}): {str(e)}"
#                 logger.error(f"MikroTik unexpected error for {self.ip}: {error_msg}")
#                 MonitoringManager.record_connection_attempt(self.ip, False)
                
#                 if attempt == self.max_retries - 1:
#                     return False, error_msg, None
#                 time.sleep(2 ** attempt)
        
#         return False, "All connection attempts failed", None
    
#     def _test_connectivity(self) -> bool:
#         """Enhanced network connectivity test with timeout."""
#         try:
#             sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
#             sock.settimeout(self.timeout)
#             result = sock.connect_ex((self.ip, self.port))
#             sock.close()
            
#             if result == 0:
#                 logger.debug(f"Connectivity test passed for {self.ip}:{self.port}")
#                 return True
#             else:
#                 logger.warning(f"Connectivity test failed for {self.ip}:{self.port} (error code: {result})")
#                 return False
                
#         except Exception as e:
#             logger.error(f"Connectivity test exception for {self.ip}:{self.port}: {str(e)}")
#             return False
    
#     def test_connection(self, user=None) -> Dict[str, Any]:
#         """
#         Comprehensive connection test with monitoring and database storage.
#         """
#         if not ROUTEROS_AVAILABLE:
#             test_results = {
#                 'ip': self.ip,
#                 'port': self.port,
#                 'timestamp': self._get_current_timestamp(),
#                 'basic_connectivity': False,
#                 'api_connection': False,
#                 'authentication': False,
#                 'system_access': False,
#                 'response_time': None,
#                 'system_info': {},
#                 'error_messages': ['routeros-api package not installed'],
#                 'attempts_made': 0,
#                 'capabilities': {}
#             }
            
#             # Still save to database even if connector not available
#             if self.router_id and DJANGO_AVAILABLE:
#                 try:
#                     # Import models here to avoid circular imports
#                     from network_management.models.router_management_model import Router
#                     router = Router.objects.get(id=self.router_id)
#                     DatabaseManager.save_connection_test(router, test_results, user)
#                 except Exception as e:
#                     logger.warning(f"Failed to save connection test for router {self.router_id}: {str(e)}")
                    
#             return test_results
        
#         start_time = time.time()
        
#         test_results = {
#             'ip': self.ip,
#             'port': self.port,
#             'timestamp': self._get_current_timestamp(),
#             'basic_connectivity': False,
#             'api_connection': False,
#             'authentication': False,
#             'system_access': False,
#             'response_time': None,
#             'system_info': {},
#             'capabilities': {},
#             'error_messages': [],
#             'attempts_made': 0,
#             'recommendations': []
#         }
        
#         for attempt in range(self.max_retries):
#             test_results['attempts_made'] = attempt + 1
            
#             try:
#                 # Test 1: Basic network connectivity
#                 test_results['basic_connectivity'] = self._test_connectivity()
#                 if not test_results['basic_connectivity']:
#                     error_msg = f"Attempt {attempt + 1}: Network connectivity test failed"
#                     test_results['error_messages'].append(error_msg)
#                     test_results['recommendations'].append("Check network connectivity and firewall rules")
#                     if attempt < self.max_retries - 1:
#                         time.sleep(1)
#                         continue
#                     break
                
#                 # Test 2: API Connection and Authentication
#                 success, message, api = self.connect(user)
                
#                 if not success:
#                     test_results['error_messages'].append(f"Attempt {attempt + 1}: {message}")
#                     if attempt < self.max_retries - 1:
#                         time.sleep(2 ** attempt)
#                         continue
#                     break
                
#                 test_results['api_connection'] = True
#                 test_results['authentication'] = True
                
#                 # Test 3: System access and information retrieval
#                 try:
#                     system_resource = api.get_resource('/system/resource')
#                     system_info = system_resource.get()
                    
#                     if system_info:
#                         test_results['system_access'] = True
#                         test_results['system_info'] = self._extract_system_info(system_info[0])
#                         test_results['capabilities'] = self._determine_capabilities(system_info[0])
                        
#                         # Get additional router information
#                         self._get_additional_router_info(api, test_results)
                    
#                     # Calculate response time
#                     end_time = time.time()
#                     test_results['response_time'] = end_time - start_time
                    
#                     # Generate recommendations
#                     self._generate_recommendations(test_results)
                    
#                     break  # Success, exit retry loop
                    
#                 except Exception as e:
#                     error_msg = f"Attempt {attempt + 1}: System access failed: {str(e)}"
#                     test_results['error_messages'].append(error_msg)
#                     if attempt < self.max_retries - 1:
#                         time.sleep(2 ** attempt)
#                         continue
                
#             except Exception as e:
#                 error_msg = f"Attempt {attempt + 1}: Unexpected error: {str(e)}"
#                 test_results['error_messages'].append(error_msg)
#                 if attempt < self.max_retries - 1:
#                     time.sleep(2 ** attempt)
#                     continue
        
#         # Cleanup
#         if self.api_pool:
#             try:
#                 self.api_pool.disconnect()
#             except Exception as e:
#                 logger.warning(f"Error disconnecting pool during test: {str(e)}")
        
#         # Save to database
#         if self.router_id and DJANGO_AVAILABLE:
#             try:
#                 # Import models here to avoid circular imports
#                 from network_management.models.router_management_model import Router
#                 router = Router.objects.get(id=self.router_id)
#                 DatabaseManager.save_connection_test(router, test_results, user)
                
#                 # Performance monitoring
#                 MonitoringManager.check_performance_thresholds(
#                     router, 
#                     test_results.get('response_time', 0),
#                     test_results.get('system_access', False)
#                 )
                
#             except Exception as e:
#                 logger.warning(f"Router with ID {self.router_id} not found for connection test: {str(e)}")
        
#         return test_results

#     def _get_current_timestamp(self):
#         """Get current timestamp in ISO format."""
#         if DJANGO_AVAILABLE:
#             return timezone.now().isoformat()
#         else:
#             return datetime.datetime.now().isoformat()
    
#     def configure_hotspot(self, ssid: str = None, welcome_message: str = None, bandwidth_limit: str = None, 
#                          session_timeout: int = None, max_users: int = None, redirect_url: str = None,
#                          ip_pool: str = None, user=None) -> Tuple[bool, str, Dict]:
#         """
#         Enhanced hotspot configuration with security, monitoring, and database integration.
#         """
#         start_time = time.time()
        
#         # Use configured defaults
#         defaults = MikroTikConfig.get_hotspot_defaults()
#         ssid = ssid or defaults['default_ssid']
#         bandwidth_limit = bandwidth_limit or defaults['bandwidth_limit']
#         session_timeout = session_timeout or defaults['session_timeout']
#         max_users = max_users or defaults['max_users']
#         ip_pool = ip_pool or defaults['ip_pool']
        
#         try:
#             success, message, api = self.connect(user)
#             if not success:
#                 MonitoringManager.record_configuration_attempt(self.ip, 'hotspot', False)
#                 return False, message, {}
            
#             configuration_steps = []
#             config_details = {
#                 'ssid': ssid,
#                 'bandwidth_limit': bandwidth_limit,
#                 'session_timeout': session_timeout,
#                 'max_users': max_users,
#                 'steps_completed': [],
#                 'failed_steps': []
#             }
            
#             # Validate parameters
#             validation_errors = self._validate_hotspot_parameters(ssid, bandwidth_limit, session_timeout, max_users)
#             if validation_errors:
#                 MonitoringManager.record_configuration_attempt(self.ip, 'hotspot', False)
#                 return False, f"Parameter validation failed: {', '.join(validation_errors)}", config_details
            
#             try:
#                 # Step 1: Configure IP pool
#                 pool_step = self._configure_ip_pool(api, 'hotspot-pool', ip_pool)
#                 configuration_steps.append(pool_step)
                
#                 # Step 2: Configure wireless interface
#                 wireless_step = self._configure_wireless_interface(api, ssid)
#                 configuration_steps.append(wireless_step)
                
#                 # Step 3: Configure hotspot server
#                 hotspot_step = self._configure_hotspot_server(api, ssid, redirect_url)
#                 configuration_steps.append(hotspot_step)
                
#                 # Step 4: Configure hotspot profile
#                 profile_step = self._configure_hotspot_profile(
#                     api, bandwidth_limit, session_timeout, welcome_message
#                 )
#                 configuration_steps.append(profile_step)
                
#                 # Step 5: Configure user profiles
#                 user_step = self._configure_user_profiles(api, max_users, bandwidth_limit)
#                 configuration_steps.append(user_step)
                
#                 # Step 6: Configure firewall rules
#                 firewall_step = self._configure_hotspot_firewall(api)
#                 configuration_steps.append(firewall_step)
                
#             except Exception as e:
#                 logger.error(f"Hotspot configuration steps failed: {str(e)}")
#                 MonitoringManager.record_configuration_attempt(self.ip, 'hotspot', False)
#                 return False, f"Configuration steps failed: {str(e)}", config_details
            
#             finally:
#                 # Always attempt to cleanup connection
#                 try:
#                     if self.api_pool:
#                         self.api_pool.disconnect()
#                 except Exception as e:
#                     logger.warning(f"Error during connection cleanup: {str(e)}")
            
#             # Compile results
#             for step in configuration_steps:
#                 if step['success']:
#                     config_details['steps_completed'].append(step['step'])
#                 else:
#                     config_details['failed_steps'].append({
#                         'step': step['step'],
#                         'error': step.get('error', 'Unknown error')
#                     })
            
#             config_details['configuration_steps'] = configuration_steps
            
#             failed_count = len(config_details['failed_steps'])
#             overall_success = failed_count == 0
            
#             # Record metrics
#             response_time = time.time() - start_time
#             MonitoringManager.record_configuration_attempt(self.ip, 'hotspot', overall_success)
#             MonitoringManager.record_response_time(self.ip, 'configure_hotspot', response_time)
            
#             # Update database
#             if self.router_id and DJANGO_AVAILABLE:
#                 try:
#                     # Import models here to avoid circular imports
#                     from network_management.models.router_management_model import Router
#                     router = Router.objects.get(id=self.router_id)
#                     DatabaseManager.update_router_configuration_status(
#                         router, 'hotspot', overall_success, 
#                         [step['error'] for step in config_details['failed_steps']]
#                     )
                    
#                     # Create audit log
#                     DatabaseManager.create_audit_log(
#                         router=router,
#                         action='configure',
#                         description=f"Hotspot configuration {'completed successfully' if overall_success else 'partially failed'}",
#                         user=user,
#                         changes=config_details
#                     )
                    
#                 except Exception as e:
#                     logger.warning(f"Router with ID {self.router_id} not found for configuration update: {str(e)}")
            
#             if overall_success:
#                 return True, "Hotspot configuration completed successfully", config_details
#             elif failed_count < len(configuration_steps):
#                 return False, f"Hotspot configuration partially completed ({failed_count} failures)", config_details
#             else:
#                 return False, "Hotspot configuration failed completely", config_details
                
#         except Exception as e:
#             logger.error(f"Hotspot configuration failed for {self.ip}: {str(e)}")
#             MonitoringManager.record_configuration_attempt(self.ip, 'hotspot', False)
#             return False, f"Configuration failed: {str(e)}", {}
    
#     def configure_pppoe(self, service_name: str = None, bandwidth_limit: str = None, 
#                        mtu: int = None, ip_pool_name: str = None, 
#                        ip_range: str = None, user=None) -> Tuple[bool, str, Dict]:
#         """
#         Enhanced PPPoE configuration with security, monitoring, and database integration.
#         """
#         start_time = time.time()
        
#         # Use configured defaults
#         defaults = MikroTikConfig.get_pppoe_defaults()
#         service_name = service_name or defaults.get('service_name', 'PPPoE-Service')
#         bandwidth_limit = bandwidth_limit or defaults['bandwidth_limit']
#         mtu = mtu or defaults['mtu']
#         ip_pool_name = ip_pool_name or defaults['ip_pool_name']
#         ip_range = ip_range or defaults['ip_range']
        
#         try:
#             success, message, api = self.connect(user)
#             if not success:
#                 MonitoringManager.record_configuration_attempt(self.ip, 'pppoe', False)
#                 return False, message, {}
            
#             configuration_steps = []
#             config_details = {
#                 'service_name': service_name,
#                 'bandwidth_limit': bandwidth_limit,
#                 'mtu': mtu,
#                 'ip_pool_name': ip_pool_name,
#                 'steps_completed': [],
#                 'failed_steps': []
#             }
            
#             try:
#                 # Step 1: Configure IP pool for PPPoE
#                 pool_step = self._configure_ip_pool(api, ip_pool_name, ip_range)
#                 configuration_steps.append(pool_step)
                
#                 # Step 2: Configure PPPoE server
#                 pppoe_step = self._configure_pppoe_server(api, service_name, mtu)
#                 configuration_steps.append(pppoe_step)
                
#                 # Step 3: Configure PPP profiles
#                 profile_step = self._configure_ppp_profiles(api, bandwidth_limit, ip_pool_name)
#                 configuration_steps.append(profile_step)
                
#                 # Step 4: Configure PPPoE secrets (example user)
#                 secret_step = self._configure_pppoe_secrets(api)
#                 configuration_steps.append(secret_step)
                
#             except Exception as e:
#                 logger.error(f"PPPoE configuration steps failed: {str(e)}")
#                 MonitoringManager.record_configuration_attempt(self.ip, 'pppoe', False)
#                 return False, f"Configuration steps failed: {str(e)}", config_details
            
#             finally:
#                 try:
#                     if self.api_pool:
#                         self.api_pool.disconnect()
#                 except Exception as e:
#                     logger.warning(f"Error during connection cleanup: {str(e)}")
            
#             # Compile results
#             for step in configuration_steps:
#                 if step['success']:
#                     config_details['steps_completed'].append(step['step'])
#                 else:
#                     config_details['failed_steps'].append({
#                         'step': step['step'],
#                         'error': step.get('error', 'Unknown error')
#                     })
            
#             config_details['configuration_steps'] = configuration_steps
            
#             failed_count = len(config_details['failed_steps'])
#             overall_success = failed_count == 0
            
#             # Record metrics
#             response_time = time.time() - start_time
#             MonitoringManager.record_configuration_attempt(self.ip, 'pppoe', overall_success)
#             MonitoringManager.record_response_time(self.ip, 'configure_pppoe', response_time)
            
#             # Update database
#             if self.router_id and DJANGO_AVAILABLE:
#                 try:
#                     # Import models here to avoid circular imports
#                     from network_management.models.router_management_model import Router
#                     router = Router.objects.get(id=self.router_id)
#                     DatabaseManager.update_router_configuration_status(
#                         router, 'pppoe', overall_success,
#                         [step['error'] for step in config_details['failed_steps']]
#                     )
                    
#                     # Create audit log
#                     DatabaseManager.create_audit_log(
#                         router=router,
#                         action='configure',
#                         description=f"PPPoE configuration {'completed successfully' if overall_success else 'partially failed'}",
#                         user=user,
#                         changes=config_details
#                     )
                    
#                 except Exception as e:
#                     logger.warning(f"Router with ID {self.router_id} not found for configuration update: {str(e)}")
            
#             if overall_success:
#                 return True, "PPPoE configuration completed successfully", config_details
#             elif failed_count < len(configuration_steps):
#                 return False, f"PPPoE configuration partially completed ({failed_count} failures)", config_details
#             else:
#                 return False, "PPPoE configuration failed completely", config_details
                
#         except Exception as e:
#             logger.error(f"PPPoE configuration failed for {self.ip}: {str(e)}")
#             MonitoringManager.record_configuration_attempt(self.ip, 'pppoe', False)
#             return False, f"Configuration failed: {str(e)}", {}
    
#     # Configuration helper methods (these remain the same as in original)
#     def _configure_ip_pool(self, api, pool_name: str, ip_range: str) -> Dict:
#         """Configure IP pool."""
#         try:
#             ip_pool = api.get_resource('/ip/pool')
#             existing_pools = ip_pool.get(name=pool_name)
            
#             if existing_pools:
#                 ip_pool.set(id=existing_pools[0].get('.id'), ranges=ip_range)
#                 return {'step': 'ip_pool', 'success': True, 'action': 'updated', 'pool_name': pool_name}
#             else:
#                 ip_pool.add(name=pool_name, ranges=ip_range)
#                 return {'step': 'ip_pool', 'success': True, 'action': 'created', 'pool_name': pool_name}
                
#         except Exception as e:
#             logger.error(f"IP pool configuration failed: {str(e)}")
#             return {'step': 'ip_pool', 'success': False, 'error': str(e)}
    
#     def _configure_wireless_interface(self, api, ssid: str) -> Dict:
#         """Configure wireless interface."""
#         try:
#             wireless = api.get_resource('/interface/wireless')
#             interfaces = wireless.get()
            
#             if interfaces:
#                 wireless.set(
#                     id=interfaces[0].get('.id'),
#                     ssid=ssid,
#                     disabled='no'
#                 )
#                 return {'step': 'wireless_interface', 'success': True, 'action': 'updated', 'ssid': ssid}
#             else:
#                 wireless.add(
#                     name="wlan1",
#                     ssid=ssid,
#                     mode="ap-bridge",
#                     band="2ghz-b/g/n",
#                     disabled='no'
#                 )
#                 return {'step': 'wireless_interface', 'success': True, 'action': 'created', 'ssid': ssid}
                
#         except Exception as e:
#             logger.error(f"Wireless interface configuration failed: {str(e)}")
#             return {'step': 'wireless_interface', 'success': False, 'error': str(e)}
    
#     def _configure_hotspot_server(self, api, ssid: str, redirect_url: str = None) -> Dict:
#         """Configure hotspot server."""
#         try:
#             hotspot = api.get_resource('/ip/hotspot')
#             servers = hotspot.get()
            
#             hotspot_server_config = {
#                 'name': ssid,
#                 'interface': 'bridge',
#                 'address-pool': 'hotspot-pool',
#                 'profile': 'default',
#                 'disabled': 'no'
#             }
            
#             if redirect_url:
#                 hotspot_server_config['login-by'] = 'http-chap'
            
#             if servers:
#                 hotspot.set(id=servers[0].get('.id'), **hotspot_server_config)
#                 return {'step': 'hotspot_server', 'success': True, 'action': 'updated'}
#             else:
#                 hotspot.add(**hotspot_server_config)
#                 return {'step': 'hotspot_server', 'success': True, 'action': 'created'}
                
#         except Exception as e:
#             logger.error(f"Hotspot server configuration failed: {str(e)}")
#             return {'step': 'hotspot_server', 'success': False, 'error': str(e)}
    
#     def _configure_hotspot_profile(self, api, bandwidth_limit: str, session_timeout: int, welcome_message: str = None) -> Dict:
#         """Configure hotspot profile."""
#         try:
#             profile = api.get_resource('/ip/hotspot/profile')
#             profiles = profile.get(name='default')
            
#             profile_config = {
#                 'name': 'default',
#                 'login-by': 'mac,http-chap,trial',
#                 'rate-limit': bandwidth_limit,
#                 'session-timeout': f'{session_timeout}m'
#             }
            
#             if welcome_message:
#                 profile_config['html-directory'] = 'hotspot'
            
#             if profiles:
#                 profile.set(id=profiles[0].get('.id'), **profile_config)
#                 return {'step': 'hotspot_profile', 'success': True, 'action': 'updated'}
#             else:
#                 profile.add(**profile_config)
#                 return {'step': 'hotspot_profile', 'success': True, 'action': 'created'}
                
#         except Exception as e:
#             logger.error(f"Hotspot profile configuration failed: {str(e)}")
#             return {'step': 'hotspot_profile', 'success': False, 'error': str(e)}
    
#     def _configure_user_profiles(self, api, max_users: int, bandwidth_limit: str) -> Dict:
#         """Configure user profiles."""
#         try:
#             user_profile = api.get_resource('/ip/hotspot/user/profile')
#             default_profile = user_profile.get(name='default')
            
#             profile_config = {
#                 'name': 'default',
#                 'rate-limit': bandwidth_limit,
#                 'shared-users': str(max_users)
#             }
            
#             if default_profile:
#                 user_profile.set(id=default_profile[0].get('.id'), **profile_config)
#             else:
#                 user_profile.add(**profile_config)
                
#             return {'step': 'user_profiles', 'success': True, 'action': 'configured'}
            
#         except Exception as e:
#             logger.error(f"User profiles configuration failed: {str(e)}")
#             return {'step': 'user_profiles', 'success': False, 'error': str(e)}
    
#     def _configure_hotspot_firewall(self, api) -> Dict:
#         """Configure basic firewall rules for hotspot."""
#         try:
#             firewall = api.get_resource('/ip/firewall/filter')
            
#             rules = [
#                 {
#                     'chain': 'input',
#                     'protocol': 'tcp',
#                     'dst-port': '80,443',
#                     'action': 'accept',
#                     'comment': 'Hotspot HTTP/HTTPS'
#                 },
#                 {
#                     'chain': 'input', 
#                     'protocol': 'udp',
#                     'dst-port': '53',
#                     'action': 'accept',
#                     'comment': 'Hotspot DNS'
#                 }
#             ]
            
#             for rule in rules:
#                 firewall.add(**rule)
            
#             return {'step': 'hotspot_firewall', 'success': True, 'action': 'configured'}
            
#         except Exception as e:
#             logger.error(f"Hotspot firewall configuration failed: {str(e)}")
#             return {'step': 'hotspot_firewall', 'success': False, 'error': str(e)}
    
#     def _configure_pppoe_server(self, api, service_name: str, mtu: int) -> Dict:
#         """Configure PPPoE server."""
#         try:
#             pppoe_server = api.get_resource('/interface/pppoe-server/server')
#             servers = pppoe_server.get()
            
#             server_config = {
#                 'service-name': service_name,
#                 'interface': 'bridge',
#                 'max-mtu': str(mtu),
#                 'max-mru': str(mtu),
#                 'disabled': 'no'
#             }
            
#             if servers:
#                 pppoe_server.set(id=servers[0].get('.id'), **server_config)
#                 return {'step': 'pppoe_server', 'success': True, 'action': 'updated'}
#             else:
#                 pppoe_server.add(**server_config)
#                 return {'step': 'pppoe_server', 'success': True, 'action': 'created'}
                
#         except Exception as e:
#             logger.error(f"PPPoE server configuration failed: {str(e)}")
#             return {'step': 'pppoe_server', 'success': False, 'error': str(e)}
    
#     def _configure_ppp_profiles(self, api, bandwidth_limit: str, ip_pool_name: str) -> Dict:
#         """Configure PPP profiles for PPPoE."""
#         try:
#             ppp_profile = api.get_resource('/ppp/profile')
#             default_profile = ppp_profile.get(name='default')
            
#             profile_config = {
#                 'name': 'default',
#                 'local-address': '192.168.101.1',
#                 'remote-address': ip_pool_name,
#                 'rate-limit': bandwidth_limit,
#                 'change-tcp-mss': 'yes'
#             }
            
#             if default_profile:
#                 ppp_profile.set(id=default_profile[0].get('.id'), **profile_config)
#             else:
#                 ppp_profile.add(**profile_config)
            
#             return {'step': 'ppp_profiles', 'success': True, 'action': 'configured'}
            
#         except Exception as e:
#             logger.error(f"PPP profiles configuration failed: {str(e)}")
#             return {'step': 'ppp_profiles', 'success': False, 'error': str(e)}
    
#     def _configure_pppoe_secrets(self, api) -> Dict:
#         """Configure example PPPoE user secrets."""
#         try:
#             ppp_secret = api.get_resource('/ppp/secret')
            
#             # Use keyword arguments to avoid positional argument error
#             ppp_secret.add(
#                 name='testuser',
#                 password='testpass123',
#                 service='pppoe',
#                 profile='default',
#                 remote_address='192.168.101.10'
#             )
            
#             return {'step': 'pppoe_secrets', 'success': True, 'action': 'created'}
            
#         except Exception as e:
#             logger.error(f"PPPoE secrets configuration failed: {str(e)}")
#             return {'step': 'pppoe_secrets', 'success': False, 'error': str(e)}
    
#     def _validate_hotspot_parameters(self, ssid: str, bandwidth_limit: str, session_timeout: int, max_users: int) -> list:
#         """Validate hotspot configuration parameters."""
#         errors = []
        
#         if not ssid or len(ssid.strip()) == 0:
#             errors.append("SSID cannot be empty")
#         elif len(ssid) > 32:
#             errors.append("SSID cannot exceed 32 characters")
        
#         if not bandwidth_limit:
#             errors.append("Bandwidth limit cannot be empty")
#         elif not re.match(r'^\d+[KM]/\d+[KM]$', bandwidth_limit):
#             errors.append("Bandwidth limit must be in format like '10M/10M'")
        
#         if session_timeout < 1 or session_timeout > 1440:
#             errors.append("Session timeout must be between 1 and 1440 minutes")
        
#         if max_users < 1 or max_users > 1000:
#             errors.append("Max users must be between 1 and 1000")
        
#         return errors
    
#     def _extract_system_info(self, system_info: Dict) -> Dict:
#         """Extract and format system information."""
#         return {
#             'model': system_info.get('board-name', 'Unknown'),
#             'version': system_info.get('version', 'Unknown'),
#             'architecture': system_info.get('architecture', 'Unknown'),
#             'cpu_load': system_info.get('cpu-load', 'Unknown'),
#             'uptime': system_info.get('uptime', 'Unknown'),
#             'free_memory': system_info.get('free-memory', 'Unknown'),
#             'total_memory': system_info.get('total-memory', 'Unknown'),
#             'cpu_count': system_info.get('cpu-count', '1'),
#             'platform': system_info.get('platform', 'Unknown')
#         }
    
#     def _determine_capabilities(self, system_info: Dict) -> Dict:
#         """Determine router capabilities based on system information."""
#         capabilities = {
#             'hotspot_support': True,
#             'pppoe_support': True,
#             'wireless_support': False,
#             'advanced_qos': False,
#             'vlan_support': True,
#             'bridge_support': True,
#             'advanced_routing': False
#         }
        
#         model = system_info.get('board-name', '').lower()
        
#         # Check for wireless capabilities
#         wireless_indicators = ['rb', 'sxt', 'lhg', 'wif', 'audience', 'cap', 'wap']
#         if any(indicator in model for indicator in wireless_indicators):
#             capabilities['wireless_support'] = True
        
#         # Check for advanced features
#         advanced_indicators = ['ccr', 'rb4011', 'rb5009', 'chateau', 'ltap', 'rb1100']
#         if any(indicator in model for indicator in advanced_indicators):
#             capabilities['advanced_qos'] = True
#             capabilities['advanced_routing'] = True
        
#         return capabilities
    
#     def _get_additional_router_info(self, api, test_results: Dict):
#         """Get additional router information."""
#         try:
#             interfaces = api.get_resource('/interface')
#             interface_list = interfaces.get()
#             test_results['interface_count'] = len(interface_list)
            
#             try:
#                 wireless = api.get_resource('/interface/wireless')
#                 wireless_list = wireless.get()
#                 test_results['wireless_interfaces'] = len(wireless_list)
#             except:
#                 test_results['wireless_interfaces'] = 0
            
#             try:
#                 hotspot_servers = api.get_resource('/ip/hotspot')
#                 test_results['hotspot_configured'] = len(hotspot_servers.get()) > 0
#             except:
#                 test_results['hotspot_configured'] = False
            
#             try:
#                 pppoe_servers = api.get_resource('/interface/pppoe-server/server')
#                 test_results['pppoe_configured'] = len(pppoe_servers.get()) > 0
#             except:
#                 test_results['pppoe_configured'] = False
                
#         except Exception as e:
#             logger.warning(f"Could not get additional router info: {str(e)}")
    
#     def _generate_recommendations(self, test_results: Dict):
#         """Generate recommendations based on test results."""
#         if not test_results['system_access']:
#             return
        
#         capabilities = test_results.get('capabilities', {})
        
#         if capabilities.get('wireless_support') and not test_results.get('hotspot_configured'):
#             test_results['recommendations'].append("Router supports wireless - consider configuring hotspot")
        
#         if capabilities.get('pppoe_support') and not test_results.get('pppoe_configured'):
#             test_results['recommendations'].append("Router supports PPPoE - consider configuring PPPoE server")
        
#         if test_results.get('response_time', 0) > 2.0:
#             test_results['recommendations'].append("High response time detected - check network latency")
    
#     def get_router_status(self) -> Dict:
#         """
#         Get comprehensive router status and statistics.
        
#         Returns:
#             dict: Router status information
#         """
#         try:
#             success, message, api = self.connect()
#             if not success:
#                 return {
#                     'online': False,
#                     'error': message,
#                     'timestamp': self._get_current_timestamp()
#                 }
            
#             status_info = {
#                 'online': True,
#                 'timestamp': self._get_current_timestamp(),
#                 'system': {},
#                 'interfaces': [],
#                 'resources': {},
#                 'services': {}
#             }
            
#             # Get system resource information
#             system_resource = api.get_resource('/system/resource')
#             system_info = system_resource.get()
#             if system_info:
#                 status_info['system'] = self._extract_system_info(system_info[0])
            
#             # Get interface information
#             interfaces = api.get_resource('/interface')
#             interface_list = interfaces.get()
#             for interface in interface_list[:10]:  # Limit to first 10 interfaces
#                 status_info['interfaces'].append({
#                     'name': interface.get('name'),
#                     'type': interface.get('type'),
#                     'running': interface.get('running') == 'true',
#                     'rx_bytes': interface.get('rx-byte'),
#                     'tx_bytes': interface.get('tx-byte')
#                 })
            
#             # Get resource usage
#             status_info['resources'] = {
#                 'cpu_load': system_info[0].get('cpu-load') if system_info else 'Unknown',
#                 'memory_usage': self._calculate_memory_usage(system_info[0]) if system_info else 'Unknown',
#                 'uptime': system_info[0].get('uptime') if system_info else 'Unknown'
#             }
            
#             # Get active services count
#             try:
#                 hotspot_active = api.get_resource('/ip/hotspot/active')
#                 status_info['services']['hotspot_users'] = len(hotspot_active.get())
#             except:
#                 status_info['services']['hotspot_users'] = 0
            
#             try:
#                 pppoe_active = api.get_resource('/ppp/active')
#                 status_info['services']['pppoe_users'] = len(pppoe_active.get())
#             except:
#                 status_info['services']['pppoe_users'] = 0
            
#             return status_info
            
#         except Exception as e:
#             logger.error(f"Failed to get router status for {self.ip}: {str(e)}")
#             return {
#                 'online': False,
#                 'error': str(e),
#                 'timestamp': self._get_current_timestamp()
#             }
#         finally:
#             if self.api_pool:
#                 try:
#                     self.api_pool.disconnect()
#                 except:
#                     pass
    
#     def _calculate_memory_usage(self, system_info: Dict) -> str:
#         """Calculate memory usage percentage."""
#         try:
#             free_memory = int(system_info.get('free-memory', 0))
#             total_memory = int(system_info.get('total-memory', 1))
#             usage_percent = ((total_memory - free_memory) / total_memory) * 100
#             return f"{usage_percent:.1f}%"
#         except (ValueError, ZeroDivisionError):
#             return "Unknown"
    
#     def disconnect(self):
#         """Clean up connections."""
#         if self.api_pool:
#             try:
#                 self.api_pool.disconnect()
#                 logger.debug(f"Disconnected from router {self.ip}")
#             except Exception as e:
#                 logger.warning(f"Error disconnecting from router {self.ip}: {str(e)}")
    
#     def __enter__(self):
#         """Context manager entry."""
#         return self
    
#     def __exit__(self, exc_type, exc_val, exc_tb):
#         """Context manager exit with proper cleanup."""
#         self.disconnect()


# class MikroTikConnectionManager:
#     """
#     Enhanced manager class for handling multiple MikroTik router connections with utility functions.
#     """
    
#     @staticmethod
#     def test_router_connection(ip: str, username: str, password: str, port: int = None, timeout: int = None) -> Dict:
#         """
#         Static method to test router connection without creating instance.
        
#         Returns:
#             dict: Connection test results
#         """
#         connection_config = MikroTikConfig.get_connection_config()
#         port = port or connection_config.get('PORT', 8728)
#         timeout = timeout or connection_config.get('TIMEOUT', 10)
        
#         connector = MikroTikConnector(ip, username, password, port, timeout)
#         return connector.test_connection()
    
#     @staticmethod
#     def validate_router_credentials(ip: str, username: str, password: str, port: int = None) -> Dict:
#         """
#         Validate router credentials and return capabilities.
        
#         Returns:
#             dict: Validation results and router capabilities
#         """
#         if not ROUTEROS_AVAILABLE:
#             return {
#                 'valid': False,
#                 'message': 'routeros-api package not installed',
#                 'capabilities': {}
#             }
        
#         connection_config = MikroTikConfig.get_connection_config()
#         port = port or connection_config.get('PORT', 8728)
        
#         connector = MikroTikConnector(ip, username, password, port)
#         test_results = connector.test_connection()
        
#         if not test_results.get('system_access'):
#             return {
#                 'valid': False,
#                 'message': 'Invalid credentials or router not accessible',
#                 'capabilities': {},
#                 'error_messages': test_results.get('error_messages', [])
#             }
        
#         return {
#             'valid': True,
#             'message': 'Credentials validated successfully',
#             'capabilities': test_results.get('capabilities', {}),
#             'system_info': test_results.get('system_info', {}),
#             'connection_info': {
#                 'response_time': test_results.get('response_time'),
#                 'basic_connectivity': test_results.get('basic_connectivity'),
#                 'api_connection': test_results.get('api_connection')
#             }
#         }
    
#     @staticmethod
#     def get_connection_templates() -> Dict:
#         """
#         Get predefined configuration templates for different use cases.
        
#         Returns:
#             dict: Configuration templates
#         """
#         hotspot_defaults = MikroTikConfig.get_hotspot_defaults()
#         pppoe_defaults = MikroTikConfig.get_pppoe_defaults()
        
#         return {
#             'public_wifi': {
#                 'name': 'Public WiFi Hotspot',
#                 'description': 'Standard configuration for public WiFi access',
#                 'hotspot_config': {
#                     'ssid': hotspot_defaults['default_ssid'],
#                     'bandwidth_limit': '5M/5M',
#                     'session_timeout': 120,
#                     'max_users': 100,
#                     'welcome_message': 'Welcome to our WiFi service',
#                     'ip_pool': '192.168.100.10-192.168.100.200'
#                 },
#                 'recommended_for': ['cafes', 'restaurants', 'public spaces']
#             },
#             'enterprise_hotspot': {
#                 'name': 'Enterprise Hotspot',
#                 'description': 'Advanced configuration for enterprise environments',
#                 'hotspot_config': {
#                     'ssid': f"{hotspot_defaults['default_ssid']}-Enterprise",
#                     'bandwidth_limit': '20M/20M',
#                     'session_timeout': 480,
#                     'max_users': 50,
#                     'welcome_message': 'Enterprise WiFi Access',
#                     'ip_pool': '192.168.200.10-192.168.200.100'
#                 },
#                 'pppoe_config': {
#                     'bandwidth_limit': '50M/50M',
#                     'mtu': 1500,
#                     'ip_pool_name': 'enterprise-pppoe-pool',
#                     'ip_range': '192.168.201.10-192.168.201.100'
#                 },
#                 'recommended_for': ['offices', 'business centers', 'corporate environments']
#             },
#             'isp_pppoe': {
#                 'name': 'ISP PPPoE Service',
#                 'description': 'Configuration for ISP-style PPPoE services',
#                 'pppoe_config': {
#                     'bandwidth_limit': '100M/50M',
#                     'mtu': 1492,
#                     'ip_pool_name': 'isp-pppoe-pool',
#                     'ip_range': '192.168.1.10-192.168.1.254',
#                     'service_name': 'ISP-PPPoE'
#                 },
#                 'recommended_for': ['internet service providers', 'wisp operations']
#             },
#             'basic_router': {
#                 'name': 'Basic Router Setup',
#                 'description': 'Minimal configuration for basic routing',
#                 'basic_config': {
#                     'enable_api': True,
#                     'enable_ssh': True,
#                     'enable_www': True
#                 },
#                 'recommended_for': ['basic routing', 'network gateways']
#             }
#         }
    
#     @staticmethod
#     def get_supported_models() -> Dict:
#         """
#         Get information about supported MikroTik models and their capabilities.
        
#         Returns:
#             dict: Supported models information
#         """
#         return {
#             'beginner_series': {
#                 'models': ['hAP lite', 'hAP ac', 'hAP ac²', 'hAP ax²'],
#                 'capabilities': ['hotspot', 'pppoe', 'basic_qos', 'wireless'],
#                 'max_users': 50,
#                 'description': 'Entry-level devices for small deployments'
#             },
#             'home_series': {
#                 'models': ['hEX', 'hEX S', 'hEX PoE'],
#                 'capabilities': ['hotspot', 'pppoe', 'advanced_qos', 'vlan'],
#                 'max_users': 100,
#                 'description': 'Home and small office routers'
#             },
#             'business_series': {
#                 'models': ['RB4011', 'RB5009', 'CCR1009'],
#                 'capabilities': ['hotspot', 'pppoe', 'advanced_qos', 'vlan', 'advanced_routing'],
#                 'max_users': 500,
#                 'description': 'Business-grade routers for larger deployments'
#             },
#             'service_provider': {
#                 'models': ['CCR2004', 'CCR2116', 'CCR2216'],
#                 'capabilities': ['hotspot', 'pppoe', 'advanced_qos', 'vlan', 'advanced_routing', 'high_performance'],
#                 'max_users': 1000,
#                 'description': 'Carrier-grade routers for service providers'
#             }
#         }
    
#     @staticmethod
#     def check_requirements() -> Dict:
#         """
#         Check system requirements and dependencies for MikroTik integration.
        
#         Returns:
#             dict: Requirements check results
#         """
#         return {
#             'routeros_api_available': ROUTEROS_AVAILABLE,
#             'django_available': DJANGO_AVAILABLE,
#             'python_version': {
#                 'current': '.'.join(map(str, sys.version_info[:3])),
#                 'required': '3.7+',
#                 'compatible': sys.version_info >= (3, 7)
#             },
#             'dependencies': {
#                 'routeros-api': ROUTEROS_AVAILABLE,
#                 'django': DJANGO_AVAILABLE,
#             },
#             'recommendations': [
#                 'Install routeros-api: pip install routeros-api',
#                 'For Django integration: ensure Django is properly configured',
#             ] if not ROUTEROS_AVAILABLE else []
#         }
    
#     @staticmethod
#     def cleanup_all_connections():
#         """Clean up all connection pools."""
#         ConnectionPoolManager.disconnect_all_pools()


# # Utility functions for common operations
# def quick_connection_test(ip: str, username: str, password: str, port: int = None) -> Tuple[bool, str]:
#     """
#     Quick connection test for basic validation.
    
#     Returns:
#         tuple: (success: bool, message: str)
#     """
#     try:
#         connection_config = MikroTikConfig.get_connection_config()
#         port = port or connection_config.get('PORT', 8728)
        
#         connector = MikroTikConnector(ip, username, password, port, timeout=5, max_retries=1)
#         test_results = connector.test_connection()
        
#         if test_results.get('system_access'):
#             return True, "Connection successful"
#         else:
#             errors = test_results.get('error_messages', ['Unknown error'])
#             return False, f"Connection failed: {errors[0]}"
            
#     except Exception as e:
#         return False, f"Connection test error: {str(e)}"


# def validate_mikrotik_configuration(config: Dict) -> Tuple[bool, List[str]]:
#     """
#     Validate MikroTik configuration parameters.
    
#     Returns:
#         tuple: (is_valid: bool, error_messages: list)
#     """
#     errors = []
    
#     required_fields = ['ip', 'username', 'password']
#     for field in required_fields:
#         if field not in config or not config[field]:
#             errors.append(f"Missing required field: {field}")
    
#     if 'ip' in config:
#         ip_pattern = r'^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$'
#         if not re.match(ip_pattern, config['ip']):
#             errors.append("Invalid IP address format")
    
#     if 'port' in config:
#         try:
#             port = int(config['port'])
#             if not (1 <= port <= 65535):
#                 errors.append("Port must be between 1 and 65535")
#         except (ValueError, TypeError):
#             errors.append("Port must be a valid number")
    
#     return len(errors) == 0, errors


# def get_connector_version() -> Dict[str, str]:
#     """
#     Get the version information for the MikroTik connector.
    
#     Returns:
#         dict: Version information
#     """
#     return {
#         'version': '2.1.0',
#         'compatibility': 'MikroTik RouterOS 6.0+',
#         'dependencies': {
#             'routeros_api': '2.3.0+',
#             'python': '3.7+',
#             'django': '3.2+'
#         },
#         'features': [
#             'Enhanced security with SSL/TLS support',
#             'Connection pooling with monitoring',
#             'Database integration with MySQL',
#             'Environment-aware configuration',
#             'Hotspot and PPPoE configuration',
#             'Comprehensive error handling'
#         ]
#     }


# # Export main classes and functions
# __all__ = [
#     'MikroTikConnector',
#     'MikroTikConnectionManager',
#     'ConnectionPoolManager',
#     'SecurityConfig',
#     'MikroTikConfig',
#     'MonitoringManager',
#     'DatabaseManager',
#     'quick_connection_test',
#     'validate_mikrotik_configuration',
#     'get_connector_version'
# ]







"""
PRODUCTION-READY MikroTik Router Connector Utility - ENHANCED

Enhanced with better settings integration, security, and database compatibility.
"""

import os
import logging
import socket
import time
import re
import sys
import ssl
import datetime
from typing import Dict, Tuple, Optional, Any, List

# Django imports with better fallbacks
try:
    from django.conf import settings
    from django.core.cache import cache
    from django.db import transaction
    from django.utils import timezone
    from django.db import models
    DJANGO_AVAILABLE = True
except ImportError:
    DJANGO_AVAILABLE = False
    # Enhanced fallback implementations
    timezone = datetime.datetime
    class SimpleCache:
        def get(self, key, default=None): return default
        def set(self, key, value, timeout=None): pass
        def delete(self, key): pass
    cache = SimpleCache()
    settings = type('Settings', (), {})()
    transaction = type('Transaction', (), {'atomic': lambda: type('Context', (), {'__enter__': lambda self: None, '__exit__': lambda self, *args: None})()})()
    models = type('Models', (), {'Avg': lambda x: x})()

# RouterOS API imports
try:
    from routeros_api import RouterOsApiPool
    from routeros_api.exceptions import RouterOsApiConnectionError, RouterOsApiCommunicationError
    ROUTEROS_AVAILABLE = True
except ImportError:
    ROUTEROS_AVAILABLE = False
    class RouterOsApiPool:
        def __init__(self, *args, **kwargs):
            raise ImportError("routeros-api package not installed")
        def get_api(self): pass
        def disconnect(self): pass
        @property
        def active_count(self): return 0
    RouterOsApiConnectionError = RouterOsApiCommunicationError = Exception

logger = logging.getLogger(__name__)


class SecurityConfig:
    """Security configuration management with proper certificate handling."""
    
    @staticmethod
    def get_ssl_context():
        """Create SSL context with proper certificate verification."""
        context = ssl.create_default_context()
        
        try:
            # Get SSL configuration from Django settings
            ssl_verify = getattr(settings, 'MIKROTIK_CONFIG', {}).get('CONNECTION', {}).get('SSL_VERIFY', True)
        except:
            ssl_verify = True
        
        if ssl_verify:
            # Production: Verify certificates
            try:
                ca_cert_path = getattr(settings, 'MIKROTIK_CONFIG', {}).get('CONNECTION', {}).get('SSL_CA_CERT_PATH')
            except:
                ca_cert_path = None
                
            if ca_cert_path and os.path.exists(ca_cert_path):
                context.load_verify_locations(ca_cert_path)
            context.verify_mode = ssl.CERT_REQUIRED
        else:
            # Development: Allow self-signed certificates with warning
            logger.warning("SSL verification disabled - not recommended for production")
            context.check_hostname = False
            context.verify_mode = ssl.CERT_NONE
            
        return context
    
    @staticmethod
    def validate_credentials(ip: str, username: str, password: str) -> Tuple[bool, List[str]]:
        """Validate credentials before connection attempts."""
        errors = []
        
        try:
            # Security validation from settings
            security_config = getattr(settings, 'MIKROTIK_CONFIG', {}).get('SECURITY', {})
            validate_credentials = security_config.get('VALIDATE_CREDENTIALS', True)
            reject_default_passwords = security_config.get('REJECT_DEFAULT_PASSWORDS', True)
        except:
            validate_credentials = True
            reject_default_passwords = True
        
        if not validate_credentials:
            return True, errors
            
        # Check for default credentials
        if reject_default_passwords and username == 'admin' and password in ['', 'admin']:
            errors.append("Default credentials detected - change for security")
            
        # Check password strength
        if len(password) < 8:
            errors.append("Password too short - minimum 8 characters required")
            
        # Check IP format
        if not re.match(r'^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$', ip):
            errors.append("Invalid IP address format")
            
        return len(errors) == 0, errors


class MikroTikConfig:
    """Externalized configuration management using Django settings."""
    
    @classmethod
    def get_connection_config(cls) -> Dict:
        """Get connection configuration from settings."""
        try:
            return getattr(settings, 'MIKROTIK_CONFIG', {}).get('CONNECTION', {})
        except:
            return {
                'TIMEOUT': 10,
                'MAX_RETRIES': 3,
                'PORT': 8728,
                'USE_SSL': False,
                'SSL_VERIFY': True
            }
    
    @classmethod
    def get_pool_config(cls) -> Dict:
        """Get pool configuration from settings."""
        try:
            return getattr(settings, 'MIKROTIK_CONFIG', {}).get('POOL', {})
        except:
            return {
                'MAX_CONNECTIONS': 5,
                'CLEANUP_INTERVAL': 300,
                'CACHE_TIMEOUT': 300
            }
    
    @classmethod
    def get_monitoring_config(cls) -> Dict:
        """Get monitoring configuration from settings."""
        try:
            return getattr(settings, 'MIKROTIK_CONFIG', {}).get('MONITORING', {})
        except:
            return {
                'ENABLED': True,
                'MAX_RESPONSE_TIME_ALERT': 5.0
            }
    
    @classmethod
    def get_logging_config(cls) -> Dict:
        """Get logging configuration from settings."""
        try:
            return getattr(settings, 'MIKROTIK_CONFIG', {}).get('LOGGING', {})
        except:
            return {
                'SAVE_CONNECTION_TESTS': True
            }
    
    @classmethod
    def get_hotspot_defaults(cls):
        """Get hotspot configuration defaults from settings."""
        try:
            hotspot_config = getattr(settings, 'MIKROTIK_CONFIG', {}).get('HOTSPOT', {})
            return {
                'ip_pool': hotspot_config.get('IP_POOL', '192.168.100.10-192.168.100.200'),
                'bandwidth_limit': hotspot_config.get('BANDWIDTH_LIMIT', '10M/10M'),
                'session_timeout': hotspot_config.get('SESSION_TIMEOUT', 60),
                'max_users': hotspot_config.get('MAX_USERS', 50),
                'default_ssid': hotspot_config.get('DEFAULT_SSID', 'SurfZone-WiFi'),
            }
        except:
            return {
                'ip_pool': '192.168.100.10-192.168.100.200',
                'bandwidth_limit': '10M/10M',
                'session_timeout': 60,
                'max_users': 50,
                'default_ssid': 'SurfZone-WiFi',
            }
    
    @classmethod
    def get_pppoe_defaults(cls):
        """Get PPPoE configuration defaults from settings."""
        try:
            pppoe_config = getattr(settings, 'MIKROTIK_CONFIG', {}).get('PPPOE', {})
            return {
                'ip_pool_name': pppoe_config.get('IP_POOL_NAME', 'pppoe-pool'),
                'ip_range': pppoe_config.get('IP_RANGE', '192.168.101.10-192.168.101.200'),
                'bandwidth_limit': pppoe_config.get('BANDWIDTH_LIMIT', '10M/10M'),
                'mtu': pppoe_config.get('MTU', 1492),
                'service_name': pppoe_config.get('SERVICE_NAME', 'PPPoE-Service'),
            }
        except:
            return {
                'ip_pool_name': 'pppoe-pool',
                'ip_range': '192.168.101.10-192.168.101.200',
                'bandwidth_limit': '10M/10M',
                'mtu': 1492,
                'service_name': 'PPPoE-Service',
            }


class MonitoringManager:
    """Monitoring and alerting management."""
    
    @staticmethod
    def record_connection_attempt(router_ip: str, success: bool):
        """Record connection attempt metrics."""
        monitoring_config = MikroTikConfig.get_monitoring_config()
        if not monitoring_config.get('ENABLED', True):
            return
            
        status = 'success' if success else 'failure'
        logger.info(f"Connection attempt to {router_ip}: {status}")
    
    @staticmethod
    def record_configuration_attempt(router_ip: str, config_type: str, success: bool):
        """Record configuration attempt metrics."""
        monitoring_config = MikroTikConfig.get_monitoring_config()
        if not monitoring_config.get('ENABLED', True):
            return
            
        status = 'success' if success else 'failure'
        logger.info(f"Configuration attempt {config_type} on {router_ip}: {status}")
    
    @staticmethod
    def record_response_time(router_ip: str, operation: str, duration: float):
        """Record response time metrics."""
        monitoring_config = MikroTikConfig.get_monitoring_config()
        if not monitoring_config.get('ENABLED', True):
            return
            
        max_response_time = monitoring_config.get('MAX_RESPONSE_TIME_ALERT', 5.0)
        if duration > max_response_time:
            logger.warning(f"High response time for {operation} on {router_ip}: {duration:.2f}s")
    
    @staticmethod
    def check_performance_thresholds(router, response_time: float, success: bool):
        """Check performance thresholds and create alerts."""
        if not DJANGO_AVAILABLE:
            return
            
        monitoring_config = MikroTikConfig.get_monitoring_config()
        max_response_time = monitoring_config.get('MAX_RESPONSE_TIME_ALERT', 5.0)
        
        if response_time > max_response_time:
            MonitoringManager._create_performance_alert(
                router, 
                f"High response time: {response_time:.2f}s (threshold: {max_response_time}s)"
            )
        
        if not success:
            MonitoringManager._create_connection_alert(router, "Connection failed")
    
    @staticmethod
    def _create_performance_alert(router, message: str):
        """Create performance alert in database."""
        try:
            # Import models here to avoid circular imports
            from network_management.models.router_management_model import RouterHealthCheck
            RouterHealthCheck.objects.create(
                router=router,
                is_online=True,
                response_time=None,
                error_message=message,
                health_score=60,
                critical_alerts=[message],
                performance_metrics={'high_response_time': True}
            )
            logger.warning(f"Performance alert for {router.ip}: {message}")
        except Exception as e:
            logger.error(f"Failed to create performance alert: {str(e)}")
    
    @staticmethod
    def _create_connection_alert(router, message: str):
        """Create connection alert in database."""
        try:
            # Import models here to avoid circular imports
            from network_management.models.router_management_model import RouterHealthCheck
            RouterHealthCheck.objects.create(
                router=router,
                is_online=False,
                response_time=None,
                error_message=message,
                health_score=0,
                critical_alerts=[message],
                performance_metrics={}
            )
            logger.warning(f"Connection alert for {router.ip}: {message}")
        except Exception as e:
            logger.error(f"Failed to create connection alert: {str(e)}")


class ConnectionPoolManager:
    """
    Enhanced connection pooling manager with security and monitoring.
    """
    
    _pools = {}
    
    @classmethod
    def get_pool(cls, ip: str, username: str, password: str, port: int = None, 
                 router_id: int = None) -> Any:
        """Get or create a secure connection pool for a router."""
        if not ROUTEROS_AVAILABLE:
            raise ImportError("routeros-api package is required for MikroTik connections")
        
        # Security validation
        is_valid, errors = SecurityConfig.validate_credentials(ip, username, password)
        if not is_valid:
            logger.warning(f"Security validation failed for {ip}: {', '.join(errors)}")
        
        connection_config = MikroTikConfig.get_connection_config()
        pool_config = MikroTikConfig.get_pool_config()
        
        port = port or connection_config.get('PORT', 8728)
        pool_key = f"{ip}:{port}:{username}"
        
        # Clean up old pools periodically
        cls._cleanup_old_pools()
        
        if pool_key not in cls._pools:
            try:
                use_ssl = connection_config.get('USE_SSL', False)
                ssl_verify = connection_config.get('SSL_VERIFY', True)
                
                pool = RouterOsApiPool(
                    host=ip,
                    username=username,
                    password=password,
                    port=port,
                    plaintext_login=True,
                    use_ssl=use_ssl,
                    ssl_verify=ssl_verify,
                    timeout=connection_config.get('TIMEOUT', 10),
                    max_connections=pool_config.get('MAX_CONNECTIONS', 5)
                )
                
                cls._pools[pool_key] = {
                    'pool': pool,
                    'last_used': time.time(),
                    'use_count': 0,
                    'created_at': time.time(),
                    'router_id': router_id
                }
                
                logger.info(f"Created new secure connection pool for {ip}:{port}")
                
            except Exception as e:
                logger.error(f"Failed to create connection pool for {ip}:{port}: {str(e)}")
                MonitoringManager.record_connection_attempt(ip, False)
                raise
        
        cls._pools[pool_key]['last_used'] = time.time()
        cls._pools[pool_key]['use_count'] += 1
        
        return cls._pools[pool_key]['pool']
    
    @classmethod
    def _cleanup_old_pools(cls):
        """Clean up pools that haven't been used recently."""
        current_time = time.time()
        pool_config = MikroTikConfig.get_pool_config()
        cleanup_interval = pool_config.get('CLEANUP_INTERVAL', 300)
        pools_to_remove = []
        
        for pool_key, pool_info in cls._pools.items():
            if current_time - pool_info['last_used'] > cleanup_interval:
                try:
                    pool_info['pool'].disconnect()
                    pools_to_remove.append(pool_key)
                    logger.info(f"Cleaned up unused connection pool: {pool_key}")
                except Exception as e:
                    logger.warning(f"Error cleaning up pool {pool_key}: {str(e)}")
        
        for pool_key in pools_to_remove:
            del cls._pools[pool_key]
    
    @classmethod
    def get_pool_stats(cls) -> Dict:
        """Get statistics about connection pools."""
        return {
            'total_pools': len(cls._pools),
            'pools': {
                key: {
                    'use_count': info['use_count'],
                    'last_used': info['last_used'],
                    'created_at': info['created_at'],
                    'router_id': info.get('router_id')
                } for key, info in cls._pools.items()
            }
        }
    
    @classmethod
    def disconnect_pool(cls, ip: str, port: int = None, username: str = None):
        """Disconnect specific pool."""
        connection_config = MikroTikConfig.get_connection_config()
        port = port or connection_config.get('PORT', 8728)
        
        if username:
            pool_key = f"{ip}:{port}:{username}"
        else:
            # Find by IP and port only
            pool_key = next((k for k in cls._pools.keys() if k.startswith(f"{ip}:{port}:")), None)
        
        if pool_key and pool_key in cls._pools:
            try:
                cls._pools[pool_key]['pool'].disconnect()
                del cls._pools[pool_key]
                logger.info(f"Disconnected pool: {pool_key}")
            except Exception as e:
                logger.error(f"Error disconnecting pool {pool_key}: {str(e)}")
    
    @classmethod
    def disconnect_all_pools(cls):
        """Disconnect all connection pools."""
        pools_to_remove = list(cls._pools.keys())
        for pool_key in pools_to_remove:
            try:
                cls._pools[pool_key]['pool'].disconnect()
                del cls._pools[pool_key]
                logger.info(f"Disconnected pool: {pool_key}")
            except Exception as e:
                logger.error(f"Error disconnecting pool {pool_key}: {str(e)}")
        
        logger.info("All connection pools disconnected")


class DatabaseManager:
    """MySQL database operations manager."""
    
    @staticmethod
    def save_connection_test(router, test_results: Dict, user=None):
        """Save connection test results to database."""
        if not DJANGO_AVAILABLE:
            return None
            
        logging_config = MikroTikConfig.get_logging_config()
        if not logging_config.get('SAVE_CONNECTION_TESTS', True):
            return None
            
        try:
            # Import models here to avoid circular imports
            from network_management.models.router_management_model import RouterConnectionTest
            
            with transaction.atomic():
                connection_test = RouterConnectionTest.objects.create(
                    router=router,
                    success=test_results.get('system_access', False),
                    response_time=test_results.get('response_time'),
                    system_info=test_results.get('system_info', {}),
                    error_messages=test_results.get('error_messages', []),
                    tested_by=user
                )
                
                # Update router status
                router.connection_status = 'connected' if test_results.get('system_access') else 'disconnected'
                router.last_connection_test = timezone.now()
                
                if test_results.get('system_info'):
                    router.firmware_version = test_results['system_info'].get('version', router.firmware_version)
                
                router.save()
                
                return connection_test
                
        except Exception as e:
            logger.error(f"Failed to save connection test for router {router.id}: {str(e)}")
            return None
    
    @staticmethod
    def create_audit_log(router, action: str, description: str, 
                        user=None, ip_address: str = None, changes: Dict = None):
        """Create audit log entry."""
        if not DJANGO_AVAILABLE:
            return
            
        try:
            # Import models here to avoid circular imports
            from network_management.models.router_management_model import RouterAuditLog
            RouterAuditLog.objects.create(
                router=router,
                action=action,
                description=description,
                user=user,
                ip_address=ip_address,
                changes=changes or {}
            )
        except Exception as e:
            logger.error(f"Failed to create audit log: {str(e)}")
    
    @staticmethod
    def update_router_configuration_status(router, config_type: str, success: bool, 
                                         errors: List[str] = None):
        """Update router configuration status."""
        if not DJANGO_AVAILABLE:
            return
            
        try:
            if success:
                if router.configuration_status == 'not_configured':
                    router.configuration_status = 'configured'
                elif router.configuration_status == 'partially_configured':
                    router.configuration_status = 'configured'
                router.configuration_type = config_type
            else:
                if router.configuration_status == 'configured':
                    router.configuration_status = 'partially_configured'
                else:
                    router.configuration_status = 'configuration_failed'
            
            router.last_configuration_update = timezone.now()
            router.save()
            
        except Exception as e:
            logger.error(f"Failed to update router configuration status: {str(e)}")


class MikroTikConnector:
    """
    PRODUCTION-READY MikroTik router connection and configuration manager.
    Enhanced with security, monitoring, and database integration.
    """
    
    def __init__(self, ip: str, username: str, password: str, port: int = None, 
                 timeout: int = None, max_retries: int = None, use_ssl: bool = None,
                 router_id: int = None):
        self.ip = ip
        self.username = username
        self.password = password
        
        # Get configuration from settings
        connection_config = MikroTikConfig.get_connection_config()
        self.port = port or connection_config.get('PORT', 8728)
        self.timeout = timeout or connection_config.get('TIMEOUT', 10)
        self.max_retries = max_retries or connection_config.get('MAX_RETRIES', 3)
        self.use_ssl = use_ssl if use_ssl is not None else connection_config.get('USE_SSL', False)
        self.router_id = router_id
        
        self.api_pool = None
        self.api = None
        
        # Validate parameters
        self._validate_parameters()
    
    def _validate_parameters(self):
        """Validate connection parameters with security checks."""
        if not self.ip or not self.username:
            raise ValueError("IP address and username are required")
        
        if not re.match(r'^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$', self.ip):
            raise ValueError("Invalid IP address format")
        
        if not (1 <= self.port <= 65535):
            raise ValueError("Port must be between 1 and 65535")
        
        # Security validation
        is_valid, errors = SecurityConfig.validate_credentials(self.ip, self.username, self.password)
        if not is_valid:
            logger.warning(f"Security issues detected: {', '.join(errors)}")
    
    def connect(self, user=None) -> Tuple[bool, str, Any]:
        """
        Enhanced secure connection establishment with monitoring and database logging.
        """
        pool_config = MikroTikConfig.get_pool_config()
        cache_key = f"router_connection:{self.ip}:{self.port}"
        cached_result = cache.get(cache_key)
        
        # Check cached connection
        if cached_result and cached_result.get('status') == 'connected':
            cache_age = time.time() - cached_result.get('timestamp', 0)
            cache_timeout = pool_config.get('CACHE_TIMEOUT', 300)
            if cache_age < cache_timeout:
                logger.debug(f"Using cached connection for {self.ip}")
                return True, "Connection verified from cache", cached_result.get('api_data')
        
        start_time = time.time()
        
        # Attempt connection with retries
        for attempt in range(self.max_retries):
            try:
                # Test basic connectivity first
                if not self._test_connectivity():
                    wait_time = 2 ** attempt  # Exponential backoff
                    logger.warning(f"Connectivity test failed for {self.ip}, attempt {attempt + 1}. Retrying in {wait_time}s")
                    time.sleep(wait_time)
                    continue
                
                # Use secure connection pool
                self.api_pool = ConnectionPoolManager.get_pool(
                    self.ip, self.username, self.password, self.port, self.router_id
                )
                
                self.api = self.api_pool.get_api()
                
                # Verify connection by fetching system info
                system_resource = self.api.get_resource('/system/resource')
                system_info = system_resource.get()
                
                if not system_info:
                    logger.warning(f"No system info received from {self.ip}, attempt {attempt + 1}")
                    continue
                
                # Cache successful connection
                connection_data = {
                    'status': 'connected',
                    'system_info': system_info[0],
                    'timestamp': time.time(),
                    'api_data': self.api
                }
                cache.set(cache_key, connection_data, pool_config.get('CACHE_TIMEOUT', 300))
                
                response_time = time.time() - start_time
                
                # Record metrics
                MonitoringManager.record_connection_attempt(self.ip, True)
                MonitoringManager.record_response_time(self.ip, 'connect', response_time)
                
                logger.info(f"Successfully connected to MikroTik router at {self.ip} (attempt {attempt + 1}, response time: {response_time:.2f}s)")
                return True, "Connection established successfully", self.api
                
            except RouterOsApiConnectionError as e:
                error_msg = f"Connection failed (attempt {attempt + 1}): {str(e)}"
                logger.warning(f"MikroTik connection error for {self.ip}: {error_msg}")
                MonitoringManager.record_connection_attempt(self.ip, False)
                
                if attempt == self.max_retries - 1:
                    return False, error_msg, None
                time.sleep(2 ** attempt)
                
            except RouterOsApiCommunicationError as e:
                error_msg = f"Authentication failed (attempt {attempt + 1}): {str(e)}"
                logger.error(f"MikroTik authentication error for {self.ip}: {error_msg}")
                MonitoringManager.record_connection_attempt(self.ip, False)
                return False, error_msg, None
                
            except Exception as e:
                error_msg = f"Unexpected error (attempt {attempt + 1}): {str(e)}"
                logger.error(f"MikroTik unexpected error for {self.ip}: {error_msg}")
                MonitoringManager.record_connection_attempt(self.ip, False)
                
                if attempt == self.max_retries - 1:
                    return False, error_msg, None
                time.sleep(2 ** attempt)
        
        return False, "All connection attempts failed", None
    
    def _test_connectivity(self) -> bool:
        """Enhanced network connectivity test with timeout."""
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(self.timeout)
            result = sock.connect_ex((self.ip, self.port))
            sock.close()
            
            if result == 0:
                logger.debug(f"Connectivity test passed for {self.ip}:{self.port}")
                return True
            else:
                logger.warning(f"Connectivity test failed for {self.ip}:{self.port} (error code: {result})")
                return False
                
        except Exception as e:
            logger.error(f"Connectivity test exception for {self.ip}:{self.port}: {str(e)}")
            return False
    
    def test_connection(self, user=None) -> Dict[str, Any]:
        """
        Comprehensive connection test with monitoring and database storage.
        """
        if not ROUTEROS_AVAILABLE:
            test_results = {
                'ip': self.ip,
                'port': self.port,
                'timestamp': self._get_current_timestamp(),
                'basic_connectivity': False,
                'api_connection': False,
                'authentication': False,
                'system_access': False,
                'response_time': None,
                'system_info': {},
                'error_messages': ['routeros-api package not installed'],
                'attempts_made': 0,
                'capabilities': {}
            }
            
            # Still save to database even if connector not available
            if self.router_id and DJANGO_AVAILABLE:
                try:
                    # Import models here to avoid circular imports
                    from network_management.models.router_management_model import Router
                    router = Router.objects.get(id=self.router_id)
                    DatabaseManager.save_connection_test(router, test_results, user)
                except Exception as e:
                    logger.warning(f"Failed to save connection test for router {self.router_id}: {str(e)}")
                    
            return test_results
        
        start_time = time.time()
        
        test_results = {
            'ip': self.ip,
            'port': self.port,
            'timestamp': self._get_current_timestamp(),
            'basic_connectivity': False,
            'api_connection': False,
            'authentication': False,
            'system_access': False,
            'response_time': None,
            'system_info': {},
            'capabilities': {},
            'error_messages': [],
            'attempts_made': 0,
            'recommendations': []
        }
        
        for attempt in range(self.max_retries):
            test_results['attempts_made'] = attempt + 1
            
            try:
                # Test 1: Basic network connectivity
                test_results['basic_connectivity'] = self._test_connectivity()
                if not test_results['basic_connectivity']:
                    error_msg = f"Attempt {attempt + 1}: Network connectivity test failed"
                    test_results['error_messages'].append(error_msg)
                    test_results['recommendations'].append("Check network connectivity and firewall rules")
                    if attempt < self.max_retries - 1:
                        time.sleep(1)
                        continue
                    break
                
                # Test 2: API Connection and Authentication
                success, message, api = self.connect(user)
                
                if not success:
                    test_results['error_messages'].append(f"Attempt {attempt + 1}: {message}")
                    if attempt < self.max_retries - 1:
                        time.sleep(2 ** attempt)
                        continue
                    break
                
                test_results['api_connection'] = True
                test_results['authentication'] = True
                
                # Test 3: System access and information retrieval
                try:
                    system_resource = api.get_resource('/system/resource')
                    system_info = system_resource.get()
                    
                    if system_info:
                        test_results['system_access'] = True
                        test_results['system_info'] = self._extract_system_info(system_info[0])
                        test_results['capabilities'] = self._determine_capabilities(system_info[0])
                        
                        # Get additional router information
                        self._get_additional_router_info(api, test_results)
                    
                    # Calculate response time
                    end_time = time.time()
                    test_results['response_time'] = end_time - start_time
                    
                    # Generate recommendations
                    self._generate_recommendations(test_results)
                    
                    break  # Success, exit retry loop
                    
                except Exception as e:
                    error_msg = f"Attempt {attempt + 1}: System access failed: {str(e)}"
                    test_results['error_messages'].append(error_msg)
                    if attempt < self.max_retries - 1:
                        time.sleep(2 ** attempt)
                        continue
                
            except Exception as e:
                error_msg = f"Attempt {attempt + 1}: Unexpected error: {str(e)}"
                test_results['error_messages'].append(error_msg)
                if attempt < self.max_retries - 1:
                    time.sleep(2 ** attempt)
                    continue
        
        # Cleanup
        if self.api_pool:
            try:
                self.api_pool.disconnect()
            except Exception as e:
                logger.warning(f"Error disconnecting pool during test: {str(e)}")
        
        # Save to database
        if self.router_id and DJANGO_AVAILABLE:
            try:
                # Import models here to avoid circular imports
                from network_management.models.router_management_model import Router
                router = Router.objects.get(id=self.router_id)
                DatabaseManager.save_connection_test(router, test_results, user)
                
                # Performance monitoring
                MonitoringManager.check_performance_thresholds(
                    router, 
                    test_results.get('response_time', 0),
                    test_results.get('system_access', False)
                )
                
            except Exception as e:
                logger.warning(f"Router with ID {self.router_id} not found for connection test: {str(e)}")
        
        return test_results

    def _get_current_timestamp(self):
        """Get current timestamp in ISO format."""
        if DJANGO_AVAILABLE:
            return timezone.now().isoformat()
        else:
            return datetime.datetime.now().isoformat()
    
    def configure_hotspot(self, ssid: str = None, welcome_message: str = None, bandwidth_limit: str = None, 
                         session_timeout: int = None, max_users: int = None, redirect_url: str = None,
                         ip_pool: str = None, user=None) -> Tuple[bool, str, Dict]:
        """
        Enhanced hotspot configuration with security, monitoring, and database integration.
        """
        start_time = time.time()
        
        # Use configured defaults
        defaults = MikroTikConfig.get_hotspot_defaults()
        ssid = ssid or defaults['default_ssid']
        bandwidth_limit = bandwidth_limit or defaults['bandwidth_limit']
        session_timeout = session_timeout or defaults['session_timeout']
        max_users = max_users or defaults['max_users']
        ip_pool = ip_pool or defaults['ip_pool']
        
        try:
            success, message, api = self.connect(user)
            if not success:
                MonitoringManager.record_configuration_attempt(self.ip, 'hotspot', False)
                return False, message, {}
            
            configuration_steps = []
            config_details = {
                'ssid': ssid,
                'bandwidth_limit': bandwidth_limit,
                'session_timeout': session_timeout,
                'max_users': max_users,
                'steps_completed': [],
                'failed_steps': []
            }
            
            # Validate parameters
            validation_errors = self._validate_hotspot_parameters(ssid, bandwidth_limit, session_timeout, max_users)
            if validation_errors:
                MonitoringManager.record_configuration_attempt(self.ip, 'hotspot', False)
                return False, f"Parameter validation failed: {', '.join(validation_errors)}", config_details
            
            try:
                # Step 1: Configure IP pool
                pool_step = self._configure_ip_pool(api, 'hotspot-pool', ip_pool)
                configuration_steps.append(pool_step)
                
                # Step 2: Configure wireless interface
                wireless_step = self._configure_wireless_interface(api, ssid)
                configuration_steps.append(wireless_step)
                
                # Step 3: Configure hotspot server
                hotspot_step = self._configure_hotspot_server(api, ssid, redirect_url)
                configuration_steps.append(hotspot_step)
                
                # Step 4: Configure hotspot profile
                profile_step = self._configure_hotspot_profile(
                    api, bandwidth_limit, session_timeout, welcome_message
                )
                configuration_steps.append(profile_step)
                
                # Step 5: Configure user profiles
                user_step = self._configure_user_profiles(api, max_users, bandwidth_limit)
                configuration_steps.append(user_step)
                
                # Step 6: Configure firewall rules
                firewall_step = self._configure_hotspot_firewall(api)
                configuration_steps.append(firewall_step)
                
            except Exception as e:
                logger.error(f"Hotspot configuration steps failed: {str(e)}")
                MonitoringManager.record_configuration_attempt(self.ip, 'hotspot', False)
                return False, f"Configuration steps failed: {str(e)}", config_details
            
            finally:
                # Always attempt to cleanup connection
                try:
                    if self.api_pool:
                        self.api_pool.disconnect()
                except Exception as e:
                    logger.warning(f"Error during connection cleanup: {str(e)}")
            
            # Compile results
            for step in configuration_steps:
                if step['success']:
                    config_details['steps_completed'].append(step['step'])
                else:
                    config_details['failed_steps'].append({
                        'step': step['step'],
                        'error': step.get('error', 'Unknown error')
                    })
            
            config_details['configuration_steps'] = configuration_steps
            
            failed_count = len(config_details['failed_steps'])
            overall_success = failed_count == 0
            
            # Record metrics
            response_time = time.time() - start_time
            MonitoringManager.record_configuration_attempt(self.ip, 'hotspot', overall_success)
            MonitoringManager.record_response_time(self.ip, 'configure_hotspot', response_time)
            
            # Update database
            if self.router_id and DJANGO_AVAILABLE:
                try:
                    # Import models here to avoid circular imports
                    from network_management.models.router_management_model import Router
                    router = Router.objects.get(id=self.router_id)
                    DatabaseManager.update_router_configuration_status(
                        router, 'hotspot', overall_success, 
                        [step['error'] for step in config_details['failed_steps']]
                    )
                    
                    # Create audit log
                    DatabaseManager.create_audit_log(
                        router=router,
                        action='configure',
                        description=f"Hotspot configuration {'completed successfully' if overall_success else 'partially failed'}",
                        user=user,
                        changes=config_details
                    )
                    
                except Exception as e:
                    logger.warning(f"Router with ID {self.router_id} not found for configuration update: {str(e)}")
            
            if overall_success:
                return True, "Hotspot configuration completed successfully", config_details
            elif failed_count < len(configuration_steps):
                return False, f"Hotspot configuration partially completed ({failed_count} failures)", config_details
            else:
                return False, "Hotspot configuration failed completely", config_details
                
        except Exception as e:
            logger.error(f"Hotspot configuration failed for {self.ip}: {str(e)}")
            MonitoringManager.record_configuration_attempt(self.ip, 'hotspot', False)
            return False, f"Configuration failed: {str(e)}", {}
    
    def configure_pppoe(self, service_name: str = None, bandwidth_limit: str = None, 
                       mtu: int = None, ip_pool_name: str = None, 
                       ip_range: str = None, user=None) -> Tuple[bool, str, Dict]:
        """
        Enhanced PPPoE configuration with security, monitoring, and database integration.
        """
        start_time = time.time()
        
        # Use configured defaults
        defaults = MikroTikConfig.get_pppoe_defaults()
        service_name = service_name or defaults.get('service_name', 'PPPoE-Service')
        bandwidth_limit = bandwidth_limit or defaults['bandwidth_limit']
        mtu = mtu or defaults['mtu']
        ip_pool_name = ip_pool_name or defaults['ip_pool_name']
        ip_range = ip_range or defaults['ip_range']
        
        try:
            success, message, api = self.connect(user)
            if not success:
                MonitoringManager.record_configuration_attempt(self.ip, 'pppoe', False)
                return False, message, {}
            
            configuration_steps = []
            config_details = {
                'service_name': service_name,
                'bandwidth_limit': bandwidth_limit,
                'mtu': mtu,
                'ip_pool_name': ip_pool_name,
                'steps_completed': [],
                'failed_steps': []
            }
            
            try:
                # Step 1: Configure IP pool for PPPoE
                pool_step = self._configure_ip_pool(api, ip_pool_name, ip_range)
                configuration_steps.append(pool_step)
                
                # Step 2: Configure PPPoE server
                pppoe_step = self._configure_pppoe_server(api, service_name, mtu)
                configuration_steps.append(pppoe_step)
                
                # Step 3: Configure PPP profiles
                profile_step = self._configure_ppp_profiles(api, bandwidth_limit, ip_pool_name)
                configuration_steps.append(profile_step)
                
                # Step 4: Configure PPPoE secrets (example user)
                secret_step = self._configure_pppoe_secrets(api)
                configuration_steps.append(secret_step)
                
            except Exception as e:
                logger.error(f"PPPoE configuration steps failed: {str(e)}")
                MonitoringManager.record_configuration_attempt(self.ip, 'pppoe', False)
                return False, f"Configuration steps failed: {str(e)}", config_details
            
            finally:
                try:
                    if self.api_pool:
                        self.api_pool.disconnect()
                except Exception as e:
                    logger.warning(f"Error during connection cleanup: {str(e)}")
            
            # Compile results
            for step in configuration_steps:
                if step['success']:
                    config_details['steps_completed'].append(step['step'])
                else:
                    config_details['failed_steps'].append({
                        'step': step['step'],
                        'error': step.get('error', 'Unknown error')
                    })
            
            config_details['configuration_steps'] = configuration_steps
            
            failed_count = len(config_details['failed_steps'])
            overall_success = failed_count == 0
            
            # Record metrics
            response_time = time.time() - start_time
            MonitoringManager.record_configuration_attempt(self.ip, 'pppoe', overall_success)
            MonitoringManager.record_response_time(self.ip, 'configure_pppoe', response_time)
            
            # Update database
            if self.router_id and DJANGO_AVAILABLE:
                try:
                    # Import models here to avoid circular imports
                    from network_management.models.router_management_model import Router
                    router = Router.objects.get(id=self.router_id)
                    DatabaseManager.update_router_configuration_status(
                        router, 'pppoe', overall_success,
                        [step['error'] for step in config_details['failed_steps']]
                    )
                    
                    # Create audit log
                    DatabaseManager.create_audit_log(
                        router=router,
                        action='configure',
                        description=f"PPPoE configuration {'completed successfully' if overall_success else 'partially failed'}",
                        user=user,
                        changes=config_details
                    )
                    
                except Exception as e:
                    logger.warning(f"Router with ID {self.router_id} not found for configuration update: {str(e)}")
            
            if overall_success:
                return True, "PPPoE configuration completed successfully", config_details
            elif failed_count < len(configuration_steps):
                return False, f"PPPoE configuration partially completed ({failed_count} failures)", config_details
            else:
                return False, "PPPoE configuration failed completely", config_details
                
        except Exception as e:
            logger.error(f"PPPoE configuration failed for {self.ip}: {str(e)}")
            MonitoringManager.record_configuration_attempt(self.ip, 'pppoe', False)
            return False, f"Configuration failed: {str(e)}", {}
    
    # Configuration helper methods
    def _configure_ip_pool(self, api, pool_name: str, ip_range: str) -> Dict:
        """Configure IP pool."""
        try:
            ip_pool = api.get_resource('/ip/pool')
            existing_pools = ip_pool.get(name=pool_name)
            
            if existing_pools:
                ip_pool.set(id=existing_pools[0].get('.id'), ranges=ip_range)
                return {'step': 'ip_pool', 'success': True, 'action': 'updated', 'pool_name': pool_name}
            else:
                ip_pool.add(name=pool_name, ranges=ip_range)
                return {'step': 'ip_pool', 'success': True, 'action': 'created', 'pool_name': pool_name}
                
        except Exception as e:
            logger.error(f"IP pool configuration failed: {str(e)}")
            return {'step': 'ip_pool', 'success': False, 'error': str(e)}
    
    def _configure_wireless_interface(self, api, ssid: str) -> Dict:
        """Configure wireless interface."""
        try:
            wireless = api.get_resource('/interface/wireless')
            interfaces = wireless.get()
            
            if interfaces:
                wireless.set(
                    id=interfaces[0].get('.id'),
                    ssid=ssid,
                    disabled='no'
                )
                return {'step': 'wireless_interface', 'success': True, 'action': 'updated', 'ssid': ssid}
            else:
                wireless.add(
                    name="wlan1",
                    ssid=ssid,
                    mode="ap-bridge",
                    band="2ghz-b/g/n",
                    disabled='no'
                )
                return {'step': 'wireless_interface', 'success': True, 'action': 'created', 'ssid': ssid}
                
        except Exception as e:
            logger.error(f"Wireless interface configuration failed: {str(e)}")
            return {'step': 'wireless_interface', 'success': False, 'error': str(e)}
    
    def _configure_hotspot_server(self, api, ssid: str, redirect_url: str = None) -> Dict:
        """Configure hotspot server."""
        try:
            hotspot = api.get_resource('/ip/hotspot')
            servers = hotspot.get()
            
            hotspot_server_config = {
                'name': ssid,
                'interface': 'bridge',
                'address-pool': 'hotspot-pool',
                'profile': 'default',
                'disabled': 'no'
            }
            
            if redirect_url:
                hotspot_server_config['login-by'] = 'http-chap'
            
            if servers:
                hotspot.set(id=servers[0].get('.id'), **hotspot_server_config)
                return {'step': 'hotspot_server', 'success': True, 'action': 'updated'}
            else:
                hotspot.add(**hotspot_server_config)
                return {'step': 'hotspot_server', 'success': True, 'action': 'created'}
                
        except Exception as e:
            logger.error(f"Hotspot server configuration failed: {str(e)}")
            return {'step': 'hotspot_server', 'success': False, 'error': str(e)}
    
    def _configure_hotspot_profile(self, api, bandwidth_limit: str, session_timeout: int, welcome_message: str = None) -> Dict:
        """Configure hotspot profile."""
        try:
            profile = api.get_resource('/ip/hotspot/profile')
            profiles = profile.get(name='default')
            
            profile_config = {
                'name': 'default',
                'login-by': 'mac,http-chap,trial',
                'rate-limit': bandwidth_limit,
                'session-timeout': f'{session_timeout}m'
            }
            
            if welcome_message:
                profile_config['html-directory'] = 'hotspot'
            
            if profiles:
                profile.set(id=profiles[0].get('.id'), **profile_config)
                return {'step': 'hotspot_profile', 'success': True, 'action': 'updated'}
            else:
                profile.add(**profile_config)
                return {'step': 'hotspot_profile', 'success': True, 'action': 'created'}
                
        except Exception as e:
            logger.error(f"Hotspot profile configuration failed: {str(e)}")
            return {'step': 'hotspot_profile', 'success': False, 'error': str(e)}
    
    def _configure_user_profiles(self, api, max_users: int, bandwidth_limit: str) -> Dict:
        """Configure user profiles."""
        try:
            user_profile = api.get_resource('/ip/hotspot/user/profile')
            default_profile = user_profile.get(name='default')
            
            profile_config = {
                'name': 'default',
                'rate-limit': bandwidth_limit,
                'shared-users': str(max_users)
            }
            
            if default_profile:
                user_profile.set(id=default_profile[0].get('.id'), **profile_config)
            else:
                user_profile.add(**profile_config)
                
            return {'step': 'user_profiles', 'success': True, 'action': 'configured'}
            
        except Exception as e:
            logger.error(f"User profiles configuration failed: {str(e)}")
            return {'step': 'user_profiles', 'success': False, 'error': str(e)}
    
    def _configure_hotspot_firewall(self, api) -> Dict:
        """Configure basic firewall rules for hotspot."""
        try:
            firewall = api.get_resource('/ip/firewall/filter')
            
            rules = [
                {
                    'chain': 'input',
                    'protocol': 'tcp',
                    'dst-port': '80,443',
                    'action': 'accept',
                    'comment': 'Hotspot HTTP/HTTPS'
                },
                {
                    'chain': 'input', 
                    'protocol': 'udp',
                    'dst-port': '53',
                    'action': 'accept',
                    'comment': 'Hotspot DNS'
                }
            ]
            
            for rule in rules:
                firewall.add(**rule)
            
            return {'step': 'hotspot_firewall', 'success': True, 'action': 'configured'}
            
        except Exception as e:
            logger.error(f"Hotspot firewall configuration failed: {str(e)}")
            return {'step': 'hotspot_firewall', 'success': False, 'error': str(e)}
    
    def _configure_pppoe_server(self, api, service_name: str, mtu: int) -> Dict:
        """Configure PPPoE server."""
        try:
            pppoe_server = api.get_resource('/interface/pppoe-server/server')
            servers = pppoe_server.get()
            
            server_config = {
                'service-name': service_name,
                'interface': 'bridge',
                'max-mtu': str(mtu),
                'max-mru': str(mtu),
                'disabled': 'no'
            }
            
            if servers:
                pppoe_server.set(id=servers[0].get('.id'), **server_config)
                return {'step': 'pppoe_server', 'success': True, 'action': 'updated'}
            else:
                pppoe_server.add(**server_config)
                return {'step': 'pppoe_server', 'success': True, 'action': 'created'}
                
        except Exception as e:
            logger.error(f"PPPoE server configuration failed: {str(e)}")
            return {'step': 'pppoe_server', 'success': False, 'error': str(e)}
    
    def _configure_ppp_profiles(self, api, bandwidth_limit: str, ip_pool_name: str) -> Dict:
        """Configure PPP profiles for PPPoE."""
        try:
            ppp_profile = api.get_resource('/ppp/profile')
            default_profile = ppp_profile.get(name='default')
            
            profile_config = {
                'name': 'default',
                'local-address': '192.168.101.1',
                'remote-address': ip_pool_name,
                'rate-limit': bandwidth_limit,
                'change-tcp-mss': 'yes'
            }
            
            if default_profile:
                ppp_profile.set(id=default_profile[0].get('.id'), **profile_config)
            else:
                ppp_profile.add(**profile_config)
            
            return {'step': 'ppp_profiles', 'success': True, 'action': 'configured'}
            
        except Exception as e:
            logger.error(f"PPP profiles configuration failed: {str(e)}")
            return {'step': 'ppp_profiles', 'success': False, 'error': str(e)}
    
    def _configure_pppoe_secrets(self, api) -> Dict:
        """Configure example PPPoE user secrets."""
        try:
            ppp_secret = api.get_resource('/ppp/secret')
            
            # Use keyword arguments to avoid positional argument error
            ppp_secret.add(
                name='testuser',
                password='testpass123',
                service='pppoe',
                profile='default',
                remote_address='192.168.101.10'
            )
            
            return {'step': 'pppoe_secrets', 'success': True, 'action': 'created'}
            
        except Exception as e:
            logger.error(f"PPPoE secrets configuration failed: {str(e)}")
            return {'step': 'pppoe_secrets', 'success': False, 'error': str(e)}
    
    def _validate_hotspot_parameters(self, ssid: str, bandwidth_limit: str, session_timeout: int, max_users: int) -> list:
        """Validate hotspot configuration parameters."""
        errors = []
        
        if not ssid or len(ssid.strip()) == 0:
            errors.append("SSID cannot be empty")
        elif len(ssid) > 32:
            errors.append("SSID cannot exceed 32 characters")
        
        if not bandwidth_limit:
            errors.append("Bandwidth limit cannot be empty")
        elif not re.match(r'^\d+[KM]/\d+[KM]$', bandwidth_limit):
            errors.append("Bandwidth limit must be in format like '10M/10M'")
        
        if session_timeout < 1 or session_timeout > 1440:
            errors.append("Session timeout must be between 1 and 1440 minutes")
        
        if max_users < 1 or max_users > 1000:
            errors.append("Max users must be between 1 and 1000")
        
        return errors
    
    def _extract_system_info(self, system_info: Dict) -> Dict:
        """Extract and format system information."""
        return {
            'model': system_info.get('board-name', 'Unknown'),
            'version': system_info.get('version', 'Unknown'),
            'architecture': system_info.get('architecture', 'Unknown'),
            'cpu_load': system_info.get('cpu-load', 'Unknown'),
            'uptime': system_info.get('uptime', 'Unknown'),
            'free_memory': system_info.get('free-memory', 'Unknown'),
            'total_memory': system_info.get('total-memory', 'Unknown'),
            'cpu_count': system_info.get('cpu-count', '1'),
            'platform': system_info.get('platform', 'Unknown')
        }
    
    def _determine_capabilities(self, system_info: Dict) -> Dict:
        """Determine router capabilities based on system information."""
        capabilities = {
            'hotspot_support': True,
            'pppoe_support': True,
            'wireless_support': False,
            'advanced_qos': False,
            'vlan_support': True,
            'bridge_support': True,
            'advanced_routing': False
        }
        
        model = system_info.get('board-name', '').lower()
        
        # Check for wireless capabilities
        wireless_indicators = ['rb', 'sxt', 'lhg', 'wif', 'audience', 'cap', 'wap']
        if any(indicator in model for indicator in wireless_indicators):
            capabilities['wireless_support'] = True
        
        # Check for advanced features
        advanced_indicators = ['ccr', 'rb4011', 'rb5009', 'chateau', 'ltap', 'rb1100']
        if any(indicator in model for indicator in advanced_indicators):
            capabilities['advanced_qos'] = True
            capabilities['advanced_routing'] = True
        
        return capabilities
    
    def _get_additional_router_info(self, api, test_results: Dict):
        """Get additional router information."""
        try:
            interfaces = api.get_resource('/interface')
            interface_list = interfaces.get()
            test_results['interface_count'] = len(interface_list)
            
            try:
                wireless = api.get_resource('/interface/wireless')
                wireless_list = wireless.get()
                test_results['wireless_interfaces'] = len(wireless_list)
            except:
                test_results['wireless_interfaces'] = 0
            
            try:
                hotspot_servers = api.get_resource('/ip/hotspot')
                test_results['hotspot_configured'] = len(hotspot_servers.get()) > 0
            except:
                test_results['hotspot_configured'] = False
            
            try:
                pppoe_servers = api.get_resource('/interface/pppoe-server/server')
                test_results['pppoe_configured'] = len(pppoe_servers.get()) > 0
            except:
                test_results['pppoe_configured'] = False
                
        except Exception as e:
            logger.warning(f"Could not get additional router info: {str(e)}")
    
    def _generate_recommendations(self, test_results: Dict):
        """Generate recommendations based on test results."""
        if not test_results['system_access']:
            return
        
        capabilities = test_results.get('capabilities', {})
        
        if capabilities.get('wireless_support') and not test_results.get('hotspot_configured'):
            test_results['recommendations'].append("Router supports wireless - consider configuring hotspot")
        
        if capabilities.get('pppoe_support') and not test_results.get('pppoe_configured'):
            test_results['recommendations'].append("Router supports PPPoE - consider configuring PPPoE server")
        
        if test_results.get('response_time', 0) > 2.0:
            test_results['recommendations'].append("High response time detected - check network latency")
    
    def get_router_status(self) -> Dict:
        """
        Get comprehensive router status and statistics.
        
        Returns:
            dict: Router status information
        """
        try:
            success, message, api = self.connect()
            if not success:
                return {
                    'online': False,
                    'error': message,
                    'timestamp': self._get_current_timestamp()
                }
            
            status_info = {
                'online': True,
                'timestamp': self._get_current_timestamp(),
                'system': {},
                'interfaces': [],
                'resources': {},
                'services': {}
            }
            
            # Get system resource information
            system_resource = api.get_resource('/system/resource')
            system_info = system_resource.get()
            if system_info:
                status_info['system'] = self._extract_system_info(system_info[0])
            
            # Get interface information
            interfaces = api.get_resource('/interface')
            interface_list = interfaces.get()
            for interface in interface_list[:10]:  # Limit to first 10 interfaces
                status_info['interfaces'].append({
                    'name': interface.get('name'),
                    'type': interface.get('type'),
                    'running': interface.get('running') == 'true',
                    'rx_bytes': interface.get('rx-byte'),
                    'tx_bytes': interface.get('tx-byte')
                })
            
            # Get resource usage
            status_info['resources'] = {
                'cpu_load': system_info[0].get('cpu-load') if system_info else 'Unknown',
                'memory_usage': self._calculate_memory_usage(system_info[0]) if system_info else 'Unknown',
                'uptime': system_info[0].get('uptime') if system_info else 'Unknown'
            }
            
            # Get active services count
            try:
                hotspot_active = api.get_resource('/ip/hotspot/active')
                status_info['services']['hotspot_users'] = len(hotspot_active.get())
            except:
                status_info['services']['hotspot_users'] = 0
            
            try:
                pppoe_active = api.get_resource('/ppp/active')
                status_info['services']['pppoe_users'] = len(pppoe_active.get())
            except:
                status_info['services']['pppoe_users'] = 0
            
            return status_info
            
        except Exception as e:
            logger.error(f"Failed to get router status for {self.ip}: {str(e)}")
            return {
                'online': False,
                'error': str(e),
                'timestamp': self._get_current_timestamp()
            }
        finally:
            if self.api_pool:
                try:
                    self.api_pool.disconnect()
                except:
                    pass
    
    def _calculate_memory_usage(self, system_info: Dict) -> str:
        """Calculate memory usage percentage."""
        try:
            free_memory = int(system_info.get('free-memory', 0))
            total_memory = int(system_info.get('total-memory', 1))
            usage_percent = ((total_memory - free_memory) / total_memory) * 100
            return f"{usage_percent:.1f}%"
        except (ValueError, ZeroDivisionError):
            return "Unknown"
    
    def disconnect(self):
        """Clean up connections."""
        if self.api_pool:
            try:
                self.api_pool.disconnect()
                logger.debug(f"Disconnected from router {self.ip}")
            except Exception as e:
                logger.warning(f"Error disconnecting from router {self.ip}: {str(e)}")
    
    def __enter__(self):
        """Context manager entry."""
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit with proper cleanup."""
        self.disconnect()


class MikroTikConnectionManager:
    """
    Enhanced manager class for handling multiple MikroTik router connections with utility functions.
    """
    
    @staticmethod
    def test_router_connection(ip: str, username: str, password: str, port: int = None, timeout: int = None) -> Dict:
        """
        Static method to test router connection without creating instance.
        
        Returns:
            dict: Connection test results
        """
        connection_config = MikroTikConfig.get_connection_config()
        port = port or connection_config.get('PORT', 8728)
        timeout = timeout or connection_config.get('TIMEOUT', 10)
        
        connector = MikroTikConnector(ip, username, password, port, timeout)
        return connector.test_connection()
    
    @staticmethod
    def validate_router_credentials(ip: str, username: str, password: str, port: int = None) -> Dict:
        """
        Validate router credentials and return capabilities.
        
        Returns:
            dict: Validation results and router capabilities
        """
        if not ROUTEROS_AVAILABLE:
            return {
                'valid': False,
                'message': 'routeros-api package not installed',
                'capabilities': {}
            }
        
        connection_config = MikroTikConfig.get_connection_config()
        port = port or connection_config.get('PORT', 8728)
        
        connector = MikroTikConnector(ip, username, password, port)
        test_results = connector.test_connection()
        
        if not test_results.get('system_access'):
            return {
                'valid': False,
                'message': 'Invalid credentials or router not accessible',
                'capabilities': {},
                'error_messages': test_results.get('error_messages', [])
            }
        
        return {
            'valid': True,
            'message': 'Credentials validated successfully',
            'capabilities': test_results.get('capabilities', {}),
            'system_info': test_results.get('system_info', {}),
            'connection_info': {
                'response_time': test_results.get('response_time'),
                'basic_connectivity': test_results.get('basic_connectivity'),
                'api_connection': test_results.get('api_connection')
            }
        }
    
    @staticmethod
    def get_connection_templates() -> Dict:
        """
        Get predefined configuration templates for different use cases.
        
        Returns:
            dict: Configuration templates
        """
        hotspot_defaults = MikroTikConfig.get_hotspot_defaults()
        pppoe_defaults = MikroTikConfig.get_pppoe_defaults()
        
        return {
            'public_wifi': {
                'name': 'Public WiFi Hotspot',
                'description': 'Standard configuration for public WiFi access',
                'hotspot_config': {
                    'ssid': hotspot_defaults['default_ssid'],
                    'bandwidth_limit': '5M/5M',
                    'session_timeout': 120,
                    'max_users': 100,
                    'welcome_message': 'Welcome to our WiFi service',
                    'ip_pool': '192.168.100.10-192.168.100.200'
                },
                'recommended_for': ['cafes', 'restaurants', 'public spaces']
            },
            'enterprise_hotspot': {
                'name': 'Enterprise Hotspot',
                'description': 'Advanced configuration for enterprise environments',
                'hotspot_config': {
                    'ssid': f"{hotspot_defaults['default_ssid']}-Enterprise",
                    'bandwidth_limit': '20M/20M',
                    'session_timeout': 480,
                    'max_users': 50,
                    'welcome_message': 'Enterprise WiFi Access',
                    'ip_pool': '192.168.200.10-192.168.200.100'
                },
                'pppoe_config': {
                    'bandwidth_limit': '50M/50M',
                    'mtu': 1500,
                    'ip_pool_name': 'enterprise-pppoe-pool',
                    'ip_range': '192.168.201.10-192.168.201.100'
                },
                'recommended_for': ['offices', 'business centers', 'corporate environments']
            },
            'isp_pppoe': {
                'name': 'ISP PPPoE Service',
                'description': 'Configuration for ISP-style PPPoE services',
                'pppoe_config': {
                    'bandwidth_limit': '100M/50M',
                    'mtu': 1492,
                    'ip_pool_name': 'isp-pppoe-pool',
                    'ip_range': '192.168.1.10-192.168.1.254',
                    'service_name': 'ISP-PPPoE'
                },
                'recommended_for': ['internet service providers', 'wisp operations']
            },
            'basic_router': {
                'name': 'Basic Router Setup',
                'description': 'Minimal configuration for basic routing',
                'basic_config': {
                    'enable_api': True,
                    'enable_ssh': True,
                    'enable_www': True
                },
                'recommended_for': ['basic routing', 'network gateways']
            }
        }
    
    @staticmethod
    def get_supported_models() -> Dict:
        """
        Get information about supported MikroTik models and their capabilities.
        
        Returns:
            dict: Supported models information
        """
        return {
            'beginner_series': {
                'models': ['hAP lite', 'hAP ac', 'hAP ac²', 'hAP ax²'],
                'capabilities': ['hotspot', 'pppoe', 'basic_qos', 'wireless'],
                'max_users': 50,
                'description': 'Entry-level devices for small deployments'
            },
            'home_series': {
                'models': ['hEX', 'hEX S', 'hEX PoE'],
                'capabilities': ['hotspot', 'pppoe', 'advanced_qos', 'vlan'],
                'max_users': 100,
                'description': 'Home and small office routers'
            },
            'business_series': {
                'models': ['RB4011', 'RB5009', 'CCR1009'],
                'capabilities': ['hotspot', 'pppoe', 'advanced_qos', 'vlan', 'advanced_routing'],
                'max_users': 500,
                'description': 'Business-grade routers for larger deployments'
            },
            'service_provider': {
                'models': ['CCR2004', 'CCR2116', 'CCR2216'],
                'capabilities': ['hotspot', 'pppoe', 'advanced_qos', 'vlan', 'advanced_routing', 'high_performance'],
                'max_users': 1000,
                'description': 'Carrier-grade routers for service providers'
            }
        }
    
    @staticmethod
    def check_requirements() -> Dict:
        """
        Check system requirements and dependencies for MikroTik integration.
        
        Returns:
            dict: Requirements check results
        """
        return {
            'routeros_api_available': ROUTEROS_AVAILABLE,
            'django_available': DJANGO_AVAILABLE,
            'python_version': {
                'current': '.'.join(map(str, sys.version_info[:3])),
                'required': '3.7+',
                'compatible': sys.version_info >= (3, 7)
            },
            'dependencies': {
                'routeros-api': ROUTEROS_AVAILABLE,
                'django': DJANGO_AVAILABLE,
            },
            'recommendations': [
                'Install routeros-api: pip install routeros-api',
                'For Django integration: ensure Django is properly configured',
            ] if not ROUTEROS_AVAILABLE else []
        }
    
    @staticmethod
    def cleanup_all_connections():
        """Clean up all connection pools."""
        ConnectionPoolManager.disconnect_all_pools()


# Utility functions for common operations
def quick_connection_test(ip: str, username: str, password: str, port: int = None) -> Tuple[bool, str]:
    """
    Quick connection test for basic validation.
    
    Returns:
        tuple: (success: bool, message: str)
    """
    try:
        connection_config = MikroTikConfig.get_connection_config()
        port = port or connection_config.get('PORT', 8728)
        
        connector = MikroTikConnector(ip, username, password, port, timeout=5, max_retries=1)
        test_results = connector.test_connection()
        
        if test_results.get('system_access'):
            return True, "Connection successful"
        else:
            errors = test_results.get('error_messages', ['Unknown error'])
            return False, f"Connection failed: {errors[0]}"
            
    except Exception as e:
        return False, f"Connection test error: {str(e)}"


def validate_mikrotik_configuration(config: Dict) -> Tuple[bool, List[str]]:
    """
    Validate MikroTik configuration parameters.
    
    Returns:
        tuple: (is_valid: bool, error_messages: list)
    """
    errors = []
    
    required_fields = ['ip', 'username', 'password']
    for field in required_fields:
        if field not in config or not config[field]:
            errors.append(f"Missing required field: {field}")
    
    if 'ip' in config:
        ip_pattern = r'^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$'
        if not re.match(ip_pattern, config['ip']):
            errors.append("Invalid IP address format")
    
    if 'port' in config:
        try:
            port = int(config['port'])
            if not (1 <= port <= 65535):
                errors.append("Port must be between 1 and 65535")
        except (ValueError, TypeError):
            errors.append("Port must be a valid number")
    
    return len(errors) == 0, errors


def get_connector_version() -> Dict[str, str]:
    """
    Get the version information for the MikroTik connector.
    
    Returns:
        dict: Version information
    """
    return {
        'version': '2.1.0',
        'compatibility': 'MikroTik RouterOS 6.0+',
        'dependencies': {
            'routeros_api': '2.3.0+',
            'python': '3.7+',
            'django': '3.2+'
        },
        'features': [
            'Enhanced security with SSL/TLS support',
            'Connection pooling with monitoring',
            'Database integration with MySQL',
            'Environment-aware configuration',
            'Hotspot and PPPoE configuration',
            'Comprehensive error handling'
        ]
    }


# Export main classes and functions
__all__ = [
    'MikroTikConnector',
    'MikroTikConnectionManager',
    'ConnectionPoolManager',
    'SecurityConfig',
    'MikroTikConfig',
    'MonitoringManager',
    'DatabaseManager',
    'quick_connection_test',
    'validate_mikrotik_configuration',
    'get_connector_version'
]