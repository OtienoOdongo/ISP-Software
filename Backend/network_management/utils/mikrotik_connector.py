# """
# Enhanced MikroTik Router Connector Utility - PRODUCTION READY

# This module provides comprehensive MikroTik router connection management,
# configuration automation, and connection testing with enhanced error handling,
# connection pooling, and production-ready reliability.
# """

# import logging
# import socket
# import time
# from typing import Dict, Tuple, Optional, Any
# from django.utils import timezone
# from django.core.cache import cache
# from routeros_api import RouterOsApiPool
# from routeros_api.exceptions import RouterOsApiConnectionError, RouterOsApiCommunicationError

# logger = logging.getLogger(__name__)


# class ConnectionPoolManager:
#     """
#     Manages connection pooling for MikroTik routers to prevent connection exhaustion.
#     """
    
#     _pools = {}
    
#     @classmethod
#     def get_pool(cls, ip: str, username: str, password: str, port: int = 8728, timeout: int = 10):
#         """Get or create a connection pool for a router."""
#         pool_key = f"{ip}:{port}:{username}"
        
#         if pool_key not in cls._pools:
#             try:
#                 pool = RouterOsApiPool(
#                     ip,
#                     username=username,
#                     password=password,
#                     port=port,
#                     plaintext_login=True,
#                     timeout=timeout
#                 )
#                 cls._pools[pool_key] = {
#                     'pool': pool,
#                     'last_used': time.time(),
#                     'use_count': 0
#                 }
#             except Exception as e:
#                 logger.error(f"Failed to create connection pool for {ip}: {str(e)}")
#                 raise
        
#         cls._pools[pool_key]['last_used'] = time.time()
#         cls._pools[pool_key]['use_count'] += 1
        
#         return cls._pools[pool_key]['pool']
    
#     @classmethod
#     def cleanup_old_pools(cls, max_age: int = 300):
#         """Clean up pools that haven't been used recently."""
#         current_time = time.time()
#         pools_to_remove = []
        
#         for pool_key, pool_info in cls._pools.items():
#             if current_time - pool_info['last_used'] > max_age:
#                 try:
#                     pool_info['pool'].disconnect()
#                     pools_to_remove.append(pool_key)
#                 except Exception as e:
#                     logger.warning(f"Error cleaning up pool {pool_key}: {str(e)}")
        
#         for pool_key in pools_to_remove:
#             del cls._pools[pool_key]


# class MikroTikConnector:
#     """
#     Production-ready MikroTik router connection and configuration manager.
#     Enhanced with connection pooling, comprehensive error handling, and retry mechanisms.
#     """
    
#     def __init__(self, ip: str, username: str, password: str, port: int = 8728, timeout: int = 10, max_retries: int = 3):
#         self.ip = ip
#         self.username = username
#         self.password = password
#         self.port = port
#         self.timeout = timeout
#         self.max_retries = max_retries
#         self.api_pool = None
#         self.api = None
        
#     def connect(self) -> Tuple[bool, str, Any]:
#         """
#         Establish connection to MikroTik router with comprehensive error handling and retries.
        
#         Returns:
#             tuple: (success: bool, message: str, api_instance: object)
#         """
#         cache_key = f"router_connection:{self.ip}:{self.port}"
#         cached_result = cache.get(cache_key)
        
#         if cached_result and cached_result.get('status') == 'connected':
#             if timezone.now().timestamp() - cached_result.get('timestamp', 0) < 300:  # 5 minutes cache
#                 return True, "Connection verified from cache", cached_result.get('api_data')
        
#         for attempt in range(self.max_retries):
#             try:
#                 # Test basic connectivity first
#                 if not self._test_connectivity():
#                     if attempt == self.max_retries - 1:
#                         return False, "Network connectivity test failed after retries", None
#                     time.sleep(1)
#                     continue
                
#                 # Use connection pool
#                 self.api_pool = ConnectionPoolManager.get_pool(
#                     self.ip, self.username, self.password, self.port, self.timeout
#                 )
                
#                 self.api = self.api_pool.get_api()
                
#                 # Verify connection by fetching system info
#                 system_info = self.api.get_resource('/system/resource').get()
                
#                 if not system_info:
#                     if attempt == self.max_retries - 1:
#                         return False, "Failed to retrieve system information after retries", None
#                     continue
                
#                 # Cache successful connection
#                 connection_data = {
#                     'status': 'connected',
#                     'system_info': system_info[0],
#                     'timestamp': timezone.now().timestamp(),
#                     'api_data': self.api
#                 }
#                 cache.set(cache_key, connection_data, 300)  # Cache for 5 minutes
                
#                 logger.info(f"Successfully connected to MikroTik router at {self.ip} (attempt {attempt + 1})")
#                 return True, "Connection established successfully", self.api
                
#             except RouterOsApiConnectionError as e:
#                 error_msg = f"Connection failed (attempt {attempt + 1}): {str(e)}"
#                 logger.warning(f"MikroTik connection error for {self.ip}: {error_msg}")
#                 if attempt == self.max_retries - 1:
#                     return False, error_msg, None
#                 time.sleep(2 ** attempt)  # Exponential backoff
                
#             except RouterOsApiCommunicationError as e:
#                 error_msg = f"Authentication failed (attempt {attempt + 1}): {str(e)}"
#                 logger.error(f"MikroTik authentication error for {self.ip}: {error_msg}")
#                 return False, error_msg, None  # Don't retry auth errors
                
#             except Exception as e:
#                 error_msg = f"Unexpected error (attempt {attempt + 1}): {str(e)}"
#                 logger.error(f"MikroTik unexpected error for {self.ip}: {error_msg}")
#                 if attempt == self.max_retries - 1:
#                     return False, error_msg, None
#                 time.sleep(2 ** attempt)  # Exponential backoff
        
#         return False, "All connection attempts failed", None
    
#     def _test_connectivity(self) -> bool:
#         """Test basic network connectivity to router with timeout."""
#         try:
#             sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
#             sock.settimeout(self.timeout)
#             result = sock.connect_ex((self.ip, self.port))
#             sock.close()
#             return result == 0
#         except Exception as e:
#             logger.error(f"Connectivity test failed for {self.ip}:{self.port}: {str(e)}")
#             return False
    
#     def test_connection(self) -> Dict[str, Any]:
#         """
#         Comprehensive connection test with detailed diagnostics and retry logic.
        
#         Returns:
#             dict: Connection test results with detailed information
#         """
#         start_time = timezone.now()
        
#         test_results = {
#             'ip': self.ip,
#             'port': self.port,
#             'timestamp': start_time.isoformat(),
#             'basic_connectivity': False,
#             'api_connection': False,
#             'authentication': False,
#             'system_access': False,
#             'response_time': None,
#             'system_info': {},
#             'error_messages': [],
#             'attempts_made': 0
#         }
        
#         for attempt in range(self.max_retries):
#             test_results['attempts_made'] = attempt + 1
            
#             try:
#                 # Test 1: Basic network connectivity
#                 test_results['basic_connectivity'] = self._test_connectivity()
#                 if not test_results['basic_connectivity']:
#                     test_results['error_messages'].append(f"Attempt {attempt + 1}: Network connectivity test failed")
#                     if attempt < self.max_retries - 1:
#                         time.sleep(1)
#                         continue
#                     break
                
#                 # Test 2: API Connection and Authentication
#                 success, message, api = self.connect()
                
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
#                         test_results['system_info'] = {
#                             'model': system_info[0].get('board-name', 'Unknown'),
#                             'version': system_info[0].get('version', 'Unknown'),
#                             'architecture': system_info[0].get('architecture', 'Unknown'),
#                             'cpu_load': system_info[0].get('cpu-load', 'Unknown'),
#                             'uptime': system_info[0].get('uptime', 'Unknown'),
#                             'free_memory': system_info[0].get('free-memory', 'Unknown'),
#                             'total_memory': system_info[0].get('total-memory', 'Unknown')
#                         }
                    
#                     # Calculate response time
#                     end_time = timezone.now()
#                     test_results['response_time'] = (end_time - start_time).total_seconds()
                    
#                     break  # Success, exit retry loop
                    
#                 except Exception as e:
#                     test_results['error_messages'].append(f"Attempt {attempt + 1}: System access failed: {str(e)}")
#                     if attempt < self.max_retries - 1:
#                         time.sleep(2 ** attempt)
#                         continue
                
#             except Exception as e:
#                 test_results['error_messages'].append(f"Attempt {attempt + 1}: Unexpected error: {str(e)}")
#                 if attempt < self.max_retries - 1:
#                     time.sleep(2 ** attempt)
#                     continue
        
#         # Cleanup
#         if self.api_pool:
#             try:
#                 self.api_pool.disconnect()
#             except Exception as e:
#                 logger.warning(f"Error disconnecting pool during test: {str(e)}")
        
#         return test_results
    
#     def configure_hotspot(self, ssid: str, welcome_message: str = None, bandwidth_limit: str = "10M", 
#                          session_timeout: int = 60, max_users: int = 50, redirect_url: str = None) -> Tuple[bool, str, Dict]:
#         """
#         Configure MikroTik hotspot with comprehensive error handling and validation.
#         """
#         try:
#             success, message, api = self.connect()
#             if not success:
#                 return False, message, {}
            
#             configuration_steps = []
            
#             # Validate parameters
#             validation_errors = self._validate_hotspot_parameters(ssid, bandwidth_limit, session_timeout, max_users)
#             if validation_errors:
#                 return False, f"Parameter validation failed: {', '.join(validation_errors)}", {}
            
#             try:
#                 # Step 1: Configure wireless interface
#                 wireless_config = self._configure_wireless_interface(api, ssid)
#                 configuration_steps.append(wireless_config)
                
#                 # Step 2: Configure hotspot server
#                 hotspot_config = self._configure_hotspot_server(api, ssid, redirect_url)
#                 configuration_steps.append(hotspot_config)
                
#                 # Step 3: Configure hotspot profile
#                 profile_config = self._configure_hotspot_profile(
#                     api, bandwidth_limit, session_timeout, welcome_message
#                 )
#                 configuration_steps.append(profile_config)
                
#                 # Step 4: Configure user profiles and limits
#                 user_config = self._configure_user_profiles(api, max_users, bandwidth_limit)
#                 configuration_steps.append(user_config)
                
#                 # Step 5: Configure IP pool and DHCP
#                 network_config = self._configure_network_settings(api)
#                 configuration_steps.append(network_config)
                
#             except Exception as e:
#                 logger.error(f"Hotspot configuration steps failed: {str(e)}")
#                 return False, f"Configuration steps failed: {str(e)}", {}
            
#             finally:
#                 # Always attempt to cleanup connection
#                 try:
#                     if self.api_pool:
#                         self.api_pool.disconnect()
#                 except Exception as e:
#                     logger.warning(f"Error during connection cleanup: {str(e)}")
            
#             config_summary = {
#                 'ssid': ssid,
#                 'steps_completed': [step['step'] for step in configuration_steps if step['success']],
#                 'failed_steps': [step['step'] for step in configuration_steps if not step['success']],
#                 'details': configuration_steps
#             }
            
#             failed_steps = len(config_summary['failed_steps'])
#             if failed_steps == 0:
#                 return True, "Hotspot configuration completed successfully", config_summary
#             else:
#                 return False, f"Hotspot configuration partially completed ({failed_steps} failures)", config_summary
                
#         except Exception as e:
#             logger.error(f"Hotspot configuration failed for {self.ip}: {str(e)}")
#             return False, f"Configuration failed: {str(e)}", {}
    
#     def _validate_hotspot_parameters(self, ssid: str, bandwidth_limit: str, session_timeout: int, max_users: int) -> list:
#         """Validate hotspot configuration parameters."""
#         errors = []
        
#         if not ssid or len(ssid.strip()) == 0:
#             errors.append("SSID cannot be empty")
#         elif len(ssid) > 32:
#             errors.append("SSID cannot exceed 32 characters")
        
#         if not bandwidth_limit:
#             errors.append("Bandwidth limit cannot be empty")
        
#         if session_timeout < 1 or session_timeout > 1440:
#             errors.append("Session timeout must be between 1 and 1440 minutes")
        
#         if max_users < 1 or max_users > 1000:
#             errors.append("Max users must be between 1 and 1000")
        
#         return errors
    
#     def _configure_wireless_interface(self, api, ssid: str) -> Dict:
#         """Configure wireless interface with error handling."""
#         try:
#             wireless = api.get_resource('/interface/wireless')
#             interfaces = wireless.get()
            
#             if interfaces:
#                 # Update existing wireless interface
#                 wireless.set(
#                     id=interfaces[0].get('.id'),
#                     ssid=ssid,
#                     disabled='no'
#                 )
#                 return {'step': 'wireless_interface', 'success': True, 'action': 'updated'}
#             else:
#                 # Create new wireless interface
#                 wireless.add(
#                     name="wlan1",
#                     ssid=ssid,
#                     mode="ap-bridge",
#                     band="2ghz-b/g/n",
#                     disabled='no'
#                 )
#                 return {'step': 'wireless_interface', 'success': True, 'action': 'created'}
                
#         except Exception as e:
#             logger.error(f"Wireless interface configuration failed: {str(e)}")
#             return {'step': 'wireless_interface', 'success': False, 'error': str(e)}
    
#     def _configure_hotspot_server(self, api, ssid: str, redirect_url: str = None) -> Dict:
#         """Configure hotspot server with error handling."""
#         try:
#             hotspot = api.get_resource('/ip/hotspot')
#             servers = hotspot.get()
            
#             hotspot_server_config = {
#                 'name': ssid,
#                 'interface': 'bridge',
#                 'address-pool': 'hotspot-pool',
#                 'profile': 'default'
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
#         """Configure hotspot profile with error handling."""
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
#         """Configure user profiles with error handling."""
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
    
#     def _configure_network_settings(self, api) -> Dict:
#         """Configure IP pool and network settings with error handling."""
#         try:
#             ip_pool = api.get_resource('/ip/pool')
#             pools = ip_pool.get(name='hotspot-pool')
            
#             if not pools:
#                 ip_pool.add(
#                     name='hotspot-pool',
#                     ranges='192.168.100.10-192.168.100.200'
#                 )
            
#             return {'step': 'network_settings', 'success': True, 'action': 'configured'}
            
#         except Exception as e:
#             logger.error(f"Network settings configuration failed: {str(e)}")
#             return {'step': 'network_settings', 'success': False, 'error': str(e)}


# class MikroTikConnectionManager:
#     """
#     Manager class for handling multiple MikroTik router connections with utility functions.
#     """
    
#     @staticmethod
#     def test_router_connection(ip: str, username: str, password: str, port: int = 8728, timeout: int = 10) -> Dict:
#         """
#         Static method to test router connection without creating instance.
        
#         Returns:
#             dict: Connection test results
#         """
#         connector = MikroTikConnector(ip, username, password, port, timeout)
#         return connector.test_connection()
    
#     @staticmethod
#     def validate_router_credentials(ip: str, username: str, password: str, port: int = 8728) -> Dict:
#         """
#         Validate router credentials and return capabilities.
        
#         Returns:
#             dict: Validation results and router capabilities
#         """
#         connector = MikroTikConnector(ip, username, password, port)
#         test_results = connector.test_connection()
        
#         if not test_results.get('system_access'):
#             return {
#                 'valid': False,
#                 'message': 'Invalid credentials or router not accessible',
#                 'capabilities': {}
#             }
        
#         # Determine router capabilities
#         capabilities = {
#             'hotspot_support': True,
#             'pppoe_support': True,
#             'wireless_support': False,
#             'advanced_qos': False
#         }
        
#         # Check for wireless support
#         system_info = test_results.get('system_info', {})
#         model = system_info.get('model', '').lower()
        
#         if any(wireless_indicator in model for wireless_indicator in ['rb', 'sxt', 'lhg', 'wif', 'audience', 'cap']):
#             capabilities['wireless_support'] = True
        
#         # Check for advanced features
#         if any(advanced_indicator in model for advanced_indicator in ['ccr', 'rb4011', 'rb5009', 'chateau', 'ltap']):
#             capabilities['advanced_qos'] = True
#             capabilities['advanced_routing'] = True
        
#         return {
#             'valid': True,
#             'message': 'Credentials validated successfully',
#             'capabilities': capabilities,
#             'system_info': system_info
#         }
    
#     @staticmethod
#     def get_connection_templates() -> Dict:
#         """
#         Get predefined configuration templates for different use cases.
        
#         Returns:
#             dict: Configuration templates
#         """
#         return {
#             'public_wifi': {
#                 'name': 'Public WiFi Hotspot',
#                 'description': 'Standard configuration for public WiFi access',
#                 'hotspot_config': {
#                     'bandwidth_limit': '5M/5M',
#                     'session_timeout': 120,
#                     'max_users': 100,
#                     'welcome_message': 'Welcome to our WiFi service'
#                 },
#                 'recommended_for': ['cafes', 'restaurants', 'public spaces']
#             },
#             'enterprise_hotspot': {
#                 'name': 'Enterprise Hotspot',
#                 'description': 'Advanced configuration for enterprise environments',
#                 'hotspot_config': {
#                     'bandwidth_limit': '20M/20M',
#                     'session_timeout': 480,
#                     'max_users': 50,
#                     'welcome_message': 'Enterprise WiFi Access'
#                 },
#                 'pppoe_config': {
#                     'bandwidth_limit': '50M/50M',
#                     'mtu': 1500
#                 },
#                 'recommended_for': ['offices', 'business centers', 'corporate environments']
#             },
#             'isp_pppoe': {
#                 'name': 'ISP PPPoE Service',
#                 'description': 'Configuration for ISP-style PPPoE services',
#                 'pppoe_config': {
#                     'bandwidth_limit': '100M/50M',
#                     'mtu': 1492,
#                     'dns_servers': '8.8.8.8,1.1.1.1,208.67.222.222'
#                 },
#                 'recommended_for': ['internet service providers', 'wisp operations']
#             }
#         }








"""
PRODUCTION-READY MikroTik Router Connector Utility

Enhanced with comprehensive error handling, connection pooling, retry mechanisms,
and production-ready reliability for MikroTik RouterOS integration.
"""

import logging
import socket
import time
import re
import sys  # Added missing import
from typing import Dict, Tuple, Optional, Any, List

# Import Django components conditionally
try:
    from django.utils import timezone
    from django.core.cache import cache
    DJANGO_AVAILABLE = True
except ImportError:
    DJANGO_AVAILABLE = False
    # Fallback for timezone if Django not available
    import datetime
    timezone = datetime.datetime
    # Simple cache fallback
    class SimpleCache:
        def get(self, key, default=None):
            return default
        def set(self, key, value, timeout=None):
            pass
    cache = SimpleCache()

# RouterOS API imports
try:
    from routeros_api import RouterOsApiPool
    from routeros_api.exceptions import RouterOsApiConnectionError, RouterOsApiCommunicationError
    ROUTEROS_AVAILABLE = True
except ImportError:
    ROUTEROS_AVAILABLE = False
    logger = logging.getLogger(__name__)
    logger.warning("routeros-api package not installed. MikroTik functionality will be limited.")

logger = logging.getLogger(__name__)


class ConnectionPoolManager:
    """
    Enhanced connection pooling manager to prevent connection exhaustion and improve performance.
    """
    
    _pools = {}
    _cleanup_interval = 300  # 5 minutes
    
    @classmethod
    def get_pool(cls, ip: str, username: str, password: str, port: int = 8728, timeout: int = 10, use_ssl: bool = False):
        """Get or create a connection pool for a router with enhanced validation."""
        if not ROUTEROS_AVAILABLE:
            raise ImportError("routeros-api package is required for MikroTik connections")
            
        pool_key = f"{ip}:{port}:{username}:{use_ssl}"
        
        # Clean up old pools periodically
        cls._cleanup_old_pools()
        
        if pool_key not in cls._pools:
            try:
                pool = RouterOsApiPool(
                    host=ip,
                    username=username,
                    password=password,
                    port=port,
                    plaintext_login=True,
                    use_ssl=use_ssl,
                    ssl_verify=False,  # For self-signed certificates
                    timeout=timeout,
                    max_connections=5  # Limit connections per router
                )
                cls._pools[pool_key] = {
                    'pool': pool,
                    'last_used': time.time(),
                    'use_count': 0,
                    'created_at': time.time()
                }
                logger.info(f"Created new connection pool for {ip}:{port}")
            except Exception as e:
                logger.error(f"Failed to create connection pool for {ip}:{port}: {str(e)}")
                raise
        
        cls._pools[pool_key]['last_used'] = time.time()
        cls._pools[pool_key]['use_count'] += 1
        
        return cls._pools[pool_key]['pool']
    
    @classmethod
    def _cleanup_old_pools(cls):
        """Clean up pools that haven't been used recently."""
        current_time = time.time()
        pools_to_remove = []
        
        for pool_key, pool_info in cls._pools.items():
            if current_time - pool_info['last_used'] > cls._cleanup_interval:
                try:
                    pool_info['pool'].disconnect()
                    pools_to_remove.append(pool_key)
                    logger.info(f"Cleaned up unused connection pool: {pool_key}")
                except Exception as e:
                    logger.warning(f"Error cleaning up pool {pool_key}: {str(e)}")
        
        for pool_key in pools_to_remove:
            del cls._pools[pool_key]
    
    @classmethod
    def get_pool_stats(cls):
        """Get statistics about connection pools."""
        return {
            'total_pools': len(cls._pools),
            'pools': {
                key: {
                    'use_count': info['use_count'],
                    'last_used': info['last_used'],
                    'created_at': info['created_at']
                } for key, info in cls._pools.items()
            }
        }


class MikroTikConnector:
    """
    PRODUCTION-READY MikroTik router connection and configuration manager.
    Enhanced with comprehensive error handling, retry mechanisms, and connection pooling.
    """
    
    def __init__(self, ip: str, username: str, password: str, port: int = 8728, 
                 timeout: int = 10, max_retries: int = 3, use_ssl: bool = False):
        self.ip = ip
        self.username = username
        self.password = password
        self.port = port
        self.timeout = timeout
        self.max_retries = max_retries
        self.use_ssl = use_ssl
        self.api_pool = None
        self.api = None
        
        # Validate parameters
        self._validate_parameters()
    
    def _validate_parameters(self):
        """Validate connection parameters."""
        if not self.ip or not self.username:
            raise ValueError("IP address and username are required")
        
        if not re.match(r'^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$', self.ip):
            raise ValueError("Invalid IP address format")
        
        if not (1 <= self.port <= 65535):
            raise ValueError("Port must be between 1 and 65535")
    
    def connect(self) -> Tuple[bool, str, Any]:
        """
        Enhanced connection establishment with comprehensive error handling and retries.
        
        Returns:
            tuple: (success: bool, message: str, api_instance: object)
        """
        cache_key = f"router_connection:{self.ip}:{self.port}"
        cached_result = cache.get(cache_key)
        
        # Check cached connection
        if cached_result and cached_result.get('status') == 'connected':
            cache_age = time.time() - cached_result.get('timestamp', 0)  # Use time.time() instead of timezone
            if cache_age < 300:  # 5 minutes cache
                logger.debug(f"Using cached connection for {self.ip}")
                return True, "Connection verified from cache", cached_result.get('api_data')
        
        # Attempt connection with retries
        for attempt in range(self.max_retries):
            try:
                # Test basic connectivity first
                if not self._test_connectivity():
                    wait_time = 2 ** attempt  # Exponential backoff
                    logger.warning(f"Connectivity test failed for {self.ip}, attempt {attempt + 1}. Retrying in {wait_time}s")
                    time.sleep(wait_time)
                    continue
                
                # Use connection pool
                self.api_pool = ConnectionPoolManager.get_pool(
                    self.ip, self.username, self.password, self.port, self.timeout, self.use_ssl
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
                    'timestamp': time.time(),  # Use time.time() instead of timezone
                    'api_data': self.api
                }
                cache.set(cache_key, connection_data, 300)  # Cache for 5 minutes
                
                logger.info(f"Successfully connected to MikroTik router at {self.ip} (attempt {attempt + 1})")
                return True, "Connection established successfully", self.api
                
            except RouterOsApiConnectionError as e:
                error_msg = f"Connection failed (attempt {attempt + 1}): {str(e)}"
                logger.warning(f"MikroTik connection error for {self.ip}: {error_msg}")
                if attempt == self.max_retries - 1:
                    return False, error_msg, None
                time.sleep(2 ** attempt)  # Exponential backoff
                
            except RouterOsApiCommunicationError as e:
                error_msg = f"Authentication failed (attempt {attempt + 1}): {str(e)}"
                logger.error(f"MikroTik authentication error for {self.ip}: {error_msg}")
                return False, error_msg, None  # Don't retry auth errors
                
            except Exception as e:
                error_msg = f"Unexpected error (attempt {attempt + 1}): {str(e)}"
                logger.error(f"MikroTik unexpected error for {self.ip}: {error_msg}")
                if attempt == self.max_retries - 1:
                    return False, error_msg, None
                time.sleep(2 ** attempt)
        
        return False, "All connection attempts failed", None
    
    def _test_connectivity(self) -> bool:
        """Enhanced network connectivity test with timeout and port verification."""
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
    
    def test_connection(self) -> Dict[str, Any]:
        """
        Comprehensive connection test with detailed diagnostics and enhanced retry logic.
        
        Returns:
            dict: Connection test results with detailed information
        """
        if not ROUTEROS_AVAILABLE:
            return {
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
                success, message, api = self.connect()
                
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
        
        return test_results

    def _get_current_timestamp(self):
        """Get current timestamp in ISO format."""
        if DJANGO_AVAILABLE:
            return timezone.now().isoformat()
        else:
            return datetime.datetime.now().isoformat()
    
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
            'hotspot_support': True,  # Most MikroTik routers support hotspot
            'pppoe_support': True,    # Most support PPPoE server
            'wireless_support': False,
            'advanced_qos': False,
            'vlan_support': True,
            'bridge_support': True,
            'advanced_routing': False
        }
        
        model = system_info.get('board-name', '').lower()
        architecture = system_info.get('architecture', '').lower()
        
        # Check for wireless capabilities
        wireless_indicators = ['rb', 'sxt', 'lhg', 'wif', 'audience', 'cap', 'wap']
        if any(indicator in model for indicator in wireless_indicators):
            capabilities['wireless_support'] = True
        
        # Check for advanced features
        advanced_indicators = ['ccr', 'rb4011', 'rb5009', 'chateau', 'ltap', 'rb1100']
        if any(indicator in model for indicator in advanced_indicators):
            capabilities['advanced_qos'] = True
            capabilities['advanced_routing'] = True
        
        # Check memory for capability assessment
        try:
            total_memory = int(system_info.get('total-memory', 0))
            if total_memory > 134217728:  # 128MB
                capabilities['high_performance'] = True
        except (ValueError, TypeError):
            pass
        
        return capabilities
    
    def _get_additional_router_info(self, api, test_results: Dict):
        """Get additional router information and configuration status."""
        try:
            # Get interface information
            interfaces = api.get_resource('/interface')
            interface_list = interfaces.get()
            test_results['interface_count'] = len(interface_list)
            
            # Get wireless information if available
            try:
                wireless = api.get_resource('/interface/wireless')
                wireless_list = wireless.get()
                test_results['wireless_interfaces'] = len(wireless_list)
            except:
                test_results['wireless_interfaces'] = 0
            
            # Check existing configurations
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
                
            # Get license information
            try:
                license_info = api.get_resource('/system/license')
                license_data = license_info.get()
                if license_data:
                    test_results['license'] = {
                        'level': license_data[0].get('nlevel', 'unknown'),
                        'software_id': license_data[0].get('software-id', 'unknown')
                    }
            except:
                test_results['license'] = {}
                
        except Exception as e:
            logger.warning(f"Could not get additional router info: {str(e)}")
    
    def _generate_recommendations(self, test_results: Dict):
        """Generate recommendations based on test results and capabilities."""
        if not test_results['system_access']:
            return
        
        capabilities = test_results.get('capabilities', {})
        system_info = test_results.get('system_info', {})
        
        # Memory recommendations
        try:
            free_memory = int(system_info.get('free_memory', 0))
            if free_memory < 33554432:  # 32MB
                test_results['recommendations'].append("Consider upgrading router memory for better performance")
        except (ValueError, TypeError):
            pass
        
        # Configuration recommendations based on capabilities
        if capabilities.get('wireless_support') and not test_results.get('hotspot_configured'):
            test_results['recommendations'].append("Router supports wireless - consider configuring hotspot")
        
        if capabilities.get('pppoe_support') and not test_results.get('pppoe_configured'):
            test_results['recommendations'].append("Router supports PPPoE - consider configuring PPPoE server")
        
        # Performance recommendations
        if test_results.get('response_time', 0) > 2.0:
            test_results['recommendations'].append("High response time detected - check network latency")
        
        # Security recommendations
        test_results['recommendations'].append("Change default admin password for security")
        test_results['recommendations'].append("Enable firewall rules to restrict unnecessary access")
    
    def configure_hotspot(self, ssid: str, welcome_message: str = None, bandwidth_limit: str = "10M/10M", 
                         session_timeout: int = 60, max_users: int = 50, redirect_url: str = None,
                         ip_pool: str = "192.168.100.10-192.168.100.200") -> Tuple[bool, str, Dict]:
        """
        Enhanced hotspot configuration with comprehensive error handling and validation.
        
        Returns:
            tuple: (success: bool, message: str, configuration_details: dict)
        """
        try:
            success, message, api = self.connect()
            if not success:
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
            if failed_count == 0:
                return True, "Hotspot configuration completed successfully", config_details
            elif failed_count < len(configuration_steps):
                return False, f"Hotspot configuration partially completed ({failed_count} failures)", config_details
            else:
                return False, "Hotspot configuration failed completely", config_details
                
        except Exception as e:
            logger.error(f"Hotspot configuration failed for {self.ip}: {str(e)}")
            return False, f"Configuration failed: {str(e)}", {}
    
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
    
    def _configure_ip_pool(self, api, pool_name: str, ip_range: str) -> Dict:
        """Configure IP pool for hotspot."""
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
        """Configure wireless interface with enhanced error handling."""
        try:
            wireless = api.get_resource('/interface/wireless')
            interfaces = wireless.get()
            
            if interfaces:
                # Update first wireless interface found
                wireless.set(
                    id=interfaces[0].get('.id'),
                    ssid=ssid,
                    disabled='no'
                )
                return {'step': 'wireless_interface', 'success': True, 'action': 'updated', 'ssid': ssid}
            else:
                # Create new wireless interface
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
        """Configure hotspot server with enhanced error handling."""
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
        """Configure hotspot profile with enhanced error handling."""
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
        """Configure user profiles with enhanced error handling."""
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
            
            # Add basic hotspot firewall rules
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
    
    def configure_pppoe(self, service_name: str = "PPPoE-Service", bandwidth_limit: str = "10M/10M", 
                       mtu: int = 1492, ip_pool_name: str = "pppoe-pool", 
                       ip_range: str = "192.168.101.10-192.168.101.200") -> Tuple[bool, str, Dict]:
        """
        Enhanced PPPoE server configuration with comprehensive error handling.
        
        Returns:
            tuple: (success: bool, message: str, configuration_details: dict)
        """
        try:
            success, message, api = self.connect()
            if not success:
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
            if failed_count == 0:
                return True, "PPPoE configuration completed successfully", config_details
            elif failed_count < len(configuration_steps):
                return False, f"PPPoE configuration partially completed ({failed_count} failures)", config_details
            else:
                return False, "PPPoE configuration failed completely", config_details
                
        except Exception as e:
            logger.error(f"PPPoE configuration failed for {self.ip}: {str(e)}")
            return False, f"Configuration failed: {str(e)}", {}
    
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
            
            # Add example user - FIXED: Use keyword arguments instead of positional
            ppp_secret.add(
                name='testuser',
                password='testpass123',
                service='pppoe',
                profile='default',
                remote_address='192.168.101.10'  # Fixed: use underscore instead of hyphen
            )
            
            return {'step': 'pppoe_secrets', 'success': True, 'action': 'created'}
            
        except Exception as e:
            logger.error(f"PPPoE secrets configuration failed: {str(e)}")
            return {'step': 'pppoe_secrets', 'success': False, 'error': str(e)}
    
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


class MikroTikConnectionManager:
    """
    Enhanced manager class for handling multiple MikroTik router connections with utility functions.
    """
    
    @staticmethod
    def test_router_connection(ip: str, username: str, password: str, port: int = 8728, timeout: int = 10) -> Dict:
        """
        Static method to test router connection without creating instance.
        
        Returns:
            dict: Connection test results
        """
        connector = MikroTikConnector(ip, username, password, port, timeout)
        return connector.test_connection()
    
    @staticmethod
    def validate_router_credentials(ip: str, username: str, password: str, port: int = 8728) -> Dict:
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
        return {
            'public_wifi': {
                'name': 'Public WiFi Hotspot',
                'description': 'Standard configuration for public WiFi access',
                'hotspot_config': {
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
            'python_version': {
                'current': '.'.join(map(str, sys.version_info[:3])),
                'required': '3.7+',
                'compatible': sys.version_info >= (3, 7)
            },
            'dependencies': {
                'routeros-api': ROUTEROS_AVAILABLE,
                'paramiko': 'paramiko' in sys.modules,
                'channels': 'channels' in sys.modules
            },
            'recommendations': [
                'Install routeros-api: pip install routeros-api',
                'For SSH functionality: pip install paramiko',
                'For WebSocket support: pip install channels channels-redis'
            ] if not ROUTEROS_AVAILABLE else []
        }


# Utility functions for common operations
def quick_connection_test(ip: str, username: str, password: str, port: int = 8728) -> Tuple[bool, str]:
    """
    Quick connection test for basic validation.
    
    Returns:
        tuple: (success: bool, message: str)
    """
    try:
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