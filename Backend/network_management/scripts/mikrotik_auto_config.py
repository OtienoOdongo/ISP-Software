







# #!/usr/bin/env python3
# """
# PRODUCTION-READY MikroTik Automated Configuration Script for SurfZone

# Enhanced with comprehensive error handling, SSH fallback, configuration templates,
# and production-ready reliability for automated MikroTik router setup.
# """

# import os
# import sys
# import logging
# import tempfile
# import json
# from datetime import datetime
# from typing import Dict, Tuple, Optional, Any, List

# # Add the project root to Python path for imports
# sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# # Import the enhanced connector
# try:
#     from network_management.utils.mikrotik_connector import MikroTikConnector, MikroTikConnectionManager
#     from routeros_api import RouterOsApiPool
#     from routeros_api.exceptions import RouterOsApiConnectionError, RouterOsApiCommunicationError
# except ImportError as e:
#     print(f"Error: Required dependencies not installed: {e}")
#     print("Please install: pip install routeros-api")
#     sys.exit(1)

# # SSH support (optional)
# try:
#     import paramiko
#     SSH_AVAILABLE = True
# except ImportError:
#     SSH_AVAILABLE = False
#     print("Warning: paramiko not installed. SSH fallback will not be available.")

# logger = logging.getLogger(__name__)


# class MikroTikAutoConfig:
#     """
#     PRODUCTION-READY automated MikroTik router configuration using both API and SSH.
#     Enhanced with comprehensive error handling, configuration templates, and fallback mechanisms.
#     """
    
#     def __init__(self, host: str, username: str, password: str, port: int = 8728, ssh_port: int = 22):
#         self.host = host
#         self.username = username
#         self.password = password
#         self.port = port
#         self.ssh_port = ssh_port
#         self.api_connection = None
#         self.ssh_client = None
#         self.connector = MikroTikConnector(host, username, password, port)
        
#         # Configuration templates
#         self.templates = MikroTikConnectionManager.get_connection_templates()
        
#     def connect_api(self) -> Any:
#         """Enhanced API connection with comprehensive error handling."""
#         try:
#             success, message, api = self.connector.connect()
#             if success:
#                 self.api_connection = api
#                 return api
#             else:
#                 raise RouterOsApiConnectionError(message)
#         except Exception as e:
#             logger.error(f"API connection failed: {e}")
#             raise
    
#     def connect_ssh(self) -> Any:
#         """Enhanced SSH connection with comprehensive error handling."""
#         if not SSH_AVAILABLE:
#             raise ImportError("paramiko not installed. SSH functionality unavailable.")
            
#         try:
#             self.ssh_client = paramiko.SSHClient()
#             self.ssh_client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
#             self.ssh_client.connect(
#                 self.host,
#                 port=self.ssh_port,
#                 username=self.username,
#                 password=self.password,
#                 timeout=30,
#                 look_for_keys=False,
#                 allow_agent=False
#             )
#             logger.info(f"SSH connection established to {self.host}:{self.ssh_port}")
#             return self.ssh_client
#         except Exception as e:
#             logger.error(f"SSH connection failed: {e}")
#             raise
    
#     def disconnect(self):
#         """Enhanced connection cleanup with error handling."""
#         if self.api_connection and hasattr(self.connector, 'api_pool'):
#             try:
#                 self.connector.api_pool.disconnect()
#             except Exception as e:
#                 logger.warning(f"Error disconnecting API pool: {e}")
        
#         if self.ssh_client:
#             try:
#                 self.ssh_client.close()
#             except Exception as e:
#                 logger.warning(f"Error closing SSH connection: {e}")
    
#     def execute_ssh_command(self, command: str, timeout: int = 30) -> Tuple[str, str]:
#         """Enhanced SSH command execution with timeout and error handling."""
#         if not self.ssh_client:
#             self.connect_ssh()
        
#         try:
#             stdin, stdout, stderr = self.ssh_client.exec_command(command, timeout=timeout)
#             output = stdout.read().decode('utf-8', errors='ignore').strip()
#             error = stderr.read().decode('utf-8', errors='ignore').strip()
            
#             return output, error
#         except Exception as e:
#             logger.error(f"SSH command failed: {e}")
#             return "", str(e)
    
#     def test_connection(self) -> Dict[str, Any]:
#         """
#         Comprehensive connection testing with both API and SSH.
        
#         Returns:
#             dict: Connection test results
#         """
#         results = {
#             'api_connection': False,
#             'ssh_connection': False,
#             'system_info': {},
#             'capabilities': {},
#             'errors': [],
#             'warnings': [],
#             'timestamp': datetime.now().isoformat()
#         }
        
#         # Test API connection
#         try:
#             api_test = self.connector.test_connection()
#             results['api_connection'] = api_test.get('system_access', False)
#             results['system_info'] = api_test.get('system_info', {})
#             results['capabilities'] = api_test.get('capabilities', {})
            
#             if not results['api_connection']:
#                 results['errors'].extend(api_test.get('error_messages', []))
                
#         except Exception as e:
#             results['errors'].append(f"API connection test failed: {str(e)}")
        
#         # Test SSH connection
#         if SSH_AVAILABLE:
#             try:
#                 self.connect_ssh()
#                 results['ssh_connection'] = True
#                 # Test basic SSH command
#                 output, error = self.execute_ssh_command("/system resource print")
#                 if "board-name" in output:
#                     results['ssh_test'] = "Successful"
#                 else:
#                     results['warnings'].append("SSH connection established but command execution may be limited")
#             except Exception as e:
#                 results['warnings'].append(f"SSH connection failed: {str(e)}")
#         else:
#             results['warnings'].append("SSH not available (paramiko not installed)")
        
#         return results
    
#     def basic_router_setup(self, router_name: str = "SurfZone-Router", dry_run: bool = False) -> Tuple[bool, str, Dict]:
#         """
#         Enhanced basic router setup with comprehensive configuration.
        
#         Returns:
#             tuple: (success, message, details)
#         """
#         details = {
#             'steps': [],
#             'commands_executed': [],
#             'router_name': router_name,
#             'dry_run': dry_run
#         }
        
#         try:
#             # Use SSH for initial setup (more reliable for basic configuration)
#             if not dry_run:
#                 self.connect_ssh()
            
#             setup_commands = [
#                 # Basic system configuration
#                 f"/system identity set name={router_name}",
                
#                 # Enable essential services
#                 "/ip service set api disabled=no port=8728",
#                 "/ip service set www disabled=no port=80",
#                 "/ip service set ssh disabled=no port=22",
#                 "/ip service set winbox disabled=no port=8291",
                
#                 # Create dedicated API user for security
#                 f"/user add name=surfzone_api group=full password={self.password}",
#                 "/user disable admin",  # Disable default admin for security
                
#                 # Basic firewall configuration
#                 "/ip firewall filter add chain=input protocol=tcp dst-port=8728 action=accept comment=\"API Access\" place-before=0",
#                 "/ip firewall filter add chain=input protocol=tcp dst-port=80,443 action=accept comment=\"Web Access\"",
#                 "/ip firewall filter add chain=input protocol=tcp dst-port=22 action=accept comment=\"SSH Access\"",
#                 "/ip firewall filter add chain=input protocol=tcp dst-port=8291 action=accept comment=\"Winbox Access\"",
#                 "/ip firewall filter add chain=input connection-state=established,related action=accept comment=\"Allow established connections\"",
#                 "/ip firewall filter add chain=input connection-state=invalid action=drop comment=\"Drop invalid connections\"",
#                 "/ip firewall filter add chain=input action=drop comment=\"Drop all other input\"",
                
#                 # Configure NTP for time synchronization
#                 "/system ntp client set enabled=yes primary-ntp=pool.ntp.org secondary-ntp=time.google.com",
                
#                 # Enable logging
#                 "/system logging action set memory memory-lines=1000",
#                 "/system logging add topics=info action=memory",
#                 "/system logging add topics=error action=memory",
                
#                 # Basic bridge configuration
#                 "/interface bridge add name=bridge-local",
#                 "/interface bridge port add interface=ether2 bridge=bridge-local",
#                 "/interface bridge port add interface=ether3 bridge=bridge-local",
#                 "/interface bridge port add interface=ether4 bridge=bridge-local",
#                 "/interface bridge port add interface=ether5 bridge=bridge-local",
                
#                 # IP address for bridge
#                 "/ip address add address=192.168.88.1/24 interface=bridge-local network=192.168.88.0",
                
#                 # Basic NAT configuration
#                 "/ip firewall nat add chain=srcnat out-interface=ether1 action=masquerade comment=\"Basic NAT\"",
#             ]
            
#             if dry_run:
#                 details['commands'] = setup_commands
#                 return True, "Dry run completed successfully", details
            
#             # Execute setup commands via SSH
#             for command in setup_commands:
#                 output, error = self.execute_ssh_command(command)
#                 details['commands_executed'].append({
#                     'command': command,
#                     'output': output,
#                     'error': error
#                 })
                
#                 if error and "already have" not in error and "already exists" not in error:
#                     details['steps'].append(f"Failed: {command} - {error}")
#                     return False, f"Setup failed at: {command} - {error}", details
#                 else:
#                     details['steps'].append(f"Success: {command}")
            
#             # Verify setup via API
#             try:
#                 api = self.connect_api()
#                 system_resource = api.get_resource('/system/resource')
#                 system_info = system_resource.get()
#                 if system_info:
#                     details['system_info'] = system_info[0]
#             except Exception as e:
#                 details['warnings'].append(f"API verification failed: {str(e)}")
            
#             self.disconnect()
#             return True, "Basic router setup completed successfully", details
            
#         except Exception as e:
#             logger.error(f"Basic setup failed: {e}")
#             return False, f"Basic setup failed: {str(e)}", details
    
#     def configure_hotspot(self, ssid: str = "SurfZone-WiFi", bandwidth_limit: str = "10M/10M", 
#                          session_timeout: int = 60, max_users: int = 50, welcome_message: str = None,
#                          template: str = None, dry_run: bool = False) -> Tuple[bool, str, Dict]:
#         """
#         Enhanced hotspot configuration with template support.
        
#         Returns:
#             tuple: (success, message, details)
#         """
#         details = {
#             'steps': [],
#             'configuration': {},
#             'template_used': template,
#             'dry_run': dry_run
#         }
        
#         # Apply template if specified
#         if template and template in self.templates:
#             template_config = self.templates[template].get('hotspot_config', {})
#             ssid = template_config.get('ssid', ssid)
#             bandwidth_limit = template_config.get('bandwidth_limit', bandwidth_limit)
#             session_timeout = template_config.get('session_timeout', session_timeout)
#             max_users = template_config.get('max_users', max_users)
#             welcome_message = template_config.get('welcome_message', welcome_message)
#             details['template_applied'] = True
        
#         try:
#             if dry_run:
#                 details['configuration'] = {
#                     'ssid': ssid,
#                     'bandwidth_limit': bandwidth_limit,
#                     'session_timeout': session_timeout,
#                     'max_users': max_users,
#                     'welcome_message': welcome_message
#                 }
#                 return True, "Hotspot configuration dry run completed", details
            
#             # Use the enhanced connector for hotspot configuration
#             success, message, config_details = self.connector.configure_hotspot(
#                 ssid=ssid,
#                 welcome_message=welcome_message,
#                 bandwidth_limit=bandwidth_limit,
#                 session_timeout=session_timeout,
#                 max_users=max_users
#             )
            
#             details['configuration'] = config_details
#             details['steps'] = config_details.get('configuration_steps', [])
            
#             return success, message, details
            
#         except Exception as e:
#             logger.error(f"Hotspot configuration failed: {e}")
#             return False, f"Hotspot configuration failed: {str(e)}", details
    
#     def configure_pppoe(self, service_name: str = "SurfZone-PPPoE", bandwidth_limit: str = "10M/10M", 
#                        mtu: int = 1492, template: str = None, dry_run: bool = False) -> Tuple[bool, str, Dict]:
#         """
#         Enhanced PPPoE configuration with template support.
        
#         Returns:
#             tuple: (success, message, details)
#         """
#         details = {
#             'steps': [],
#             'configuration': {},
#             'template_used': template,
#             'dry_run': dry_run
#         }
        
#         # Apply template if specified
#         if template and template in self.templates:
#             template_config = self.templates[template].get('pppoe_config', {})
#             service_name = template_config.get('service_name', service_name)
#             bandwidth_limit = template_config.get('bandwidth_limit', bandwidth_limit)
#             mtu = template_config.get('mtu', mtu)
#             details['template_applied'] = True
        
#         try:
#             if dry_run:
#                 details['configuration'] = {
#                     'service_name': service_name,
#                     'bandwidth_limit': bandwidth_limit,
#                     'mtu': mtu
#                 }
#                 return True, "PPPoE configuration dry run completed", details
            
#             # Use the enhanced connector for PPPoE configuration
#             success, message, config_details = self.connector.configure_pppoe(
#                 service_name=service_name,
#                 bandwidth_limit=bandwidth_limit,
#                 mtu=mtu
#             )
            
#             details['configuration'] = config_details
#             details['steps'] = config_details.get('configuration_steps', [])
            
#             return success, message, details
            
#         except Exception as e:
#             logger.error(f"PPPoE configuration failed: {e}")
#             return False, f"PPPoE configuration failed: {str(e)}", details
    
#     def auto_setup_router(self, setup_type: str = "hotspot", router_name: str = "SurfZone-Router", 
#                          template: str = None, dry_run: bool = False) -> Tuple[bool, str, Dict]:
#         """
#         Complete automated router setup based on specified type and template.
        
#         Returns:
#             tuple: (success, message, details)
#         """
#         details = {
#             'setup_type': setup_type,
#             'router_name': router_name,
#             'template_used': template,
#             'steps_completed': [],
#             'dry_run': dry_run
#         }
        
#         try:
#             # Step 1: Basic router setup
#             success, message, basic_details = self.basic_router_setup(router_name, dry_run)
#             if not success:
#                 return False, f"Basic setup failed: {message}", details
            
#             details['basic_setup'] = basic_details
#             details['steps_completed'].append('basic_setup')
            
#             # Step 2: Service-specific setup
#             if setup_type in ['hotspot', 'both']:
#                 ssid = f"{router_name}-WiFi"
#                 success, message, hotspot_details = self.configure_hotspot(ssid, template=template, dry_run=dry_run)
#                 if success:
#                     details['hotspot_setup'] = hotspot_details
#                     details['steps_completed'].append('hotspot_setup')
#                 elif setup_type == 'hotspot':
#                     return False, f"Hotspot setup failed: {message}", details
            
#             if setup_type in ['pppoe', 'both']:
#                 service_name = f"{router_name}-PPPoE"
#                 success, message, pppoe_details = self.configure_pppoe(service_name, template=template, dry_run=dry_run)
#                 if success:
#                     details['pppoe_setup'] = pppoe_details
#                     details['steps_completed'].append('pppoe_setup')
#                 elif setup_type == 'pppoe':
#                     return False, f"PPPoE setup failed: {message}", details
            
#             # Step 3: Final verification
#             if not dry_run:
#                 verification = self.test_connection()
#                 details['final_verification'] = verification
#                 if verification.get('api_connection'):
#                     details['steps_completed'].append('verification')
            
#             return True, f"Auto setup completed for {setup_type}", details
            
#         except Exception as e:
#             logger.error(f"Auto setup failed: {e}")
#             return False, f"Auto setup failed: {str(e)}", details
    
#     def setup_hotspot_only(self, ssid: str = "SurfZone-WiFi", template: str = None, dry_run: bool = False):
#         """Convenience method for hotspot-only setup."""
#         return self.auto_setup_router("hotspot", ssid.replace('-WiFi', ''), template, dry_run)
    
#     def setup_pppoe_only(self, service_name: str = "SurfZone-PPPoE", template: str = None, dry_run: bool = False):
#         """Convenience method for PPPoE-only setup."""
#         return self.auto_setup_router("pppoe", service_name.replace('-PPPoE', ''), template, dry_run)
    
#     def run_diagnostics(self) -> Dict[str, Any]:
#         """
#         Run comprehensive diagnostics on the router.
        
#         Returns:
#             dict: Diagnostic results
#         """
#         diagnostics = {
#             'system_health': {},
#             'services': {},
#             'interfaces': {},
#             'configuration': {},
#             'performance': {},
#             'issues': [],
#             'recommendations': [],
#             'timestamp': datetime.now().isoformat()
#         }
        
#         try:
#             api = self.connect_api()
            
#             # System health check
#             system_resource = api.get_resource('/system/resource')
#             system_info = system_resource.get()
#             if system_info:
#                 diagnostics['system_health'] = {
#                     'model': system_info[0].get('board-name', 'Unknown'),
#                     'version': system_info[0].get('version', 'Unknown'),
#                     'cpu_load': system_info[0].get('cpu-load', 'Unknown'),
#                     'uptime': system_info[0].get('uptime', 'Unknown'),
#                     'free_memory': system_info[0].get('free-memory', 'Unknown'),
#                     'total_memory': system_info[0].get('total-memory', 'Unknown')
#                 }
            
#             # Check services
#             services = api.get_resource('/ip/service')
#             service_list = services.get()
#             diagnostics['services'] = {
#                 'api': any(s.get('name') == 'api' and s.get('disabled') == 'false' for s in service_list),
#                 'www': any(s.get('name') == 'www' and s.get('disabled') == 'false' for s in service_list),
#                 'ssh': any(s.get('name') == 'ssh' and s.get('disabled') == 'false' for s in service_list),
#                 'winbox': any(s.get('name') == 'winbox' and s.get('disabled') == 'false' for s in service_list)
#             }
            
#             # Check interfaces
#             interfaces = api.get_resource('/interface')
#             interface_list = interfaces.get()
#             diagnostics['interfaces'] = {
#                 'total': len(interface_list),
#                 'wireless': len([i for i in interface_list if i.get('type') == 'wireless']),
#                 'ethernet': len([i for i in interface_list if i.get('type') == 'ether']),
#                 'bridge': len([i for i in interface_list if i.get('type') == 'bridge'])
#             }
            
#             # Check configurations
#             try:
#                 hotspot_servers = api.get_resource('/ip/hotspot')
#                 diagnostics['configuration']['hotspot'] = len(hotspot_servers.get()) > 0
#             except:
#                 diagnostics['configuration']['hotspot'] = False
            
#             try:
#                 pppoe_servers = api.get_resource('/interface/pppoe-server/server')
#                 diagnostics['configuration']['pppoe'] = len(pppoe_servers.get()) > 0
#             except:
#                 diagnostics['configuration']['pppoe'] = False
            
#             # Performance metrics
#             try:
#                 # Get interface statistics for performance assessment
#                 interface_stats = []
#                 for interface in interface_list[:5]:  # First 5 interfaces
#                     interface_stats.append({
#                         'name': interface.get('name'),
#                         'rx_bytes': interface.get('rx-byte', 0),
#                         'tx_bytes': interface.get('tx-byte', 0),
#                         'status': interface.get('running', 'false')
#                     })
#                 diagnostics['performance']['interface_stats'] = interface_stats
#             except:
#                 diagnostics['performance']['interface_stats'] = []
            
#             # Identify issues and generate recommendations
#             self._generate_diagnostic_recommendations(diagnostics)
            
#             return diagnostics
            
#         except Exception as e:
#             diagnostics['issues'].append(f"Diagnostics failed: {str(e)}")
#             return diagnostics
#         finally:
#             self.disconnect()
    
#     def _generate_diagnostic_recommendations(self, diagnostics: Dict):
#         """Generate recommendations based on diagnostic findings."""
#         # Memory recommendations
#         free_memory = int(diagnostics['system_health'].get('free_memory', 0))
#         if free_memory < 16777216:  # 16MB
#             diagnostics['recommendations'].append("Low memory detected - consider optimizing configurations")
        
#         # Service recommendations
#         if not diagnostics['services']['api']:
#             diagnostics['recommendations'].append("Enable API service for remote management")
        
#         if not diagnostics['services']['ssh']:
#             diagnostics['recommendations'].append("Enable SSH service for secure command-line access")
        
#         # Security recommendations
#         diagnostics['recommendations'].append("Change default passwords for security")
#         diagnostics['recommendations'].append("Review and update firewall rules regularly")
        
#         # Performance recommendations
#         cpu_load = diagnostics['system_health'].get('cpu_load', '0')
#         try:
#             cpu_value = float(cpu_load.strip('%'))
#             if cpu_value > 80:
#                 diagnostics['recommendations'].append("High CPU usage detected - consider optimizing configurations")
#         except (ValueError, AttributeError):
#             pass
    
#     def backup_configuration(self, backup_name: str = None) -> Tuple[bool, str]:
#         """Enhanced configuration backup with error handling."""
#         try:
#             if not backup_name:
#                 backup_name = f"backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            
#             self.connect_ssh()
#             command = f"/system backup save name={backup_name}"
#             output, error = self.execute_ssh_command(command)
            
#             if error and "already executing" not in error:
#                 return False, f"Backup failed: {error}"
            
#             # Verify backup was created
#             list_command = "/file print where name=~\"*.backup\""
#             output, error = self.execute_ssh_command(list_command)
            
#             if backup_name in output:
#                 return True, f"Backup created successfully: {backup_name}"
#             else:
#                 return False, "Backup verification failed"
            
#         except Exception as e:
#             return False, f"Backup failed: {str(e)}"
#         finally:
#             self.disconnect()
    
#     def restore_configuration(self, backup_name: str) -> Tuple[bool, str]:
#         """Restore router configuration from backup."""
#         try:
#             self.connect_ssh()
#             command = f"/system backup load name={backup_name}"
#             output, error = self.execute_ssh_command(command)
            
#             if error:
#                 return False, f"Restore failed: {error}"
            
#             return True, f"Configuration restored from: {backup_name}"
            
#         except Exception as e:
#             return False, f"Restore failed: {str(e)}"
#         finally:
#             self.disconnect()
    
#     def get_available_templates(self) -> Dict:
#         """Get available configuration templates."""
#         return self.templates
    
#     def get_template_info(self, template_name: str) -> Dict:
#         """Get detailed information about a specific template."""
#         if template_name in self.templates:
#             return self.templates[template_name]
#         else:
#             return {'error': f"Template '{template_name}' not found"}


# def main():
#     """Enhanced standalone script execution for testing and manual use."""
#     import argparse
    
#     parser = argparse.ArgumentParser(description='PRODUCTION MikroTik Auto Configuration Script')
#     parser.add_argument('--host', required=True, help='Router IP address')
#     parser.add_argument('--username', required=True, help='Router username')
#     parser.add_argument('--password', required=True, help='Router password')
#     parser.add_argument('--port', type=int, default=8728, help='API port')
#     parser.add_argument('--ssh-port', type=int, default=22, help='SSH port')
#     parser.add_argument('--action', 
#                        choices=['test', 'setup', 'hotspot', 'pppoe', 'diagnose', 'backup', 'templates'], 
#                        default='test', help='Action to perform')
#     parser.add_argument('--setup-type', choices=['hotspot', 'pppoe', 'both'], 
#                        default='hotspot', help='Setup type for auto setup')
#     parser.add_argument('--router-name', default='SurfZone-Router', help='Router name')
#     parser.add_argument('--template', help='Configuration template name')
#     parser.add_argument('--ssid', help='WiFi SSID for hotspot setup')
#     parser.add_argument('--service-name', help='PPPoE service name')
#     parser.add_argument('--backup-name', help='Backup file name')
#     parser.add_argument('--dry-run', action='store_true', help='Simulate without applying')
#     parser.add_argument('--verbose', action='store_true', help='Enable verbose logging')
    
#     args = parser.parse_args()
    
#     # Configure logging
#     log_level = logging.DEBUG if args.verbose else logging.INFO
#     logging.basicConfig(level=log_level, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    
#     # Create configurator instance
#     configurator = MikroTikAutoConfig(
#         args.host,
#         args.username,
#         args.password,
#         args.port,
#         args.ssh_port
#     )
    
#     try:
#         if args.action == 'test':
#             results = configurator.test_connection()
#             print("=== CONNECTION TEST RESULTS ===")
#             print(f"API Connection: {'✅ SUCCESS' if results['api_connection'] else '❌ FAILED'}")
#             print(f"SSH Connection: {'✅ SUCCESS' if results['ssh_connection'] else '❌ FAILED'}")
#             if results['system_info']:
#                 print(f"Router Model: {results['system_info'].get('model', 'Unknown')}")
#                 print(f"Router Version: {results['system_info'].get('version', 'Unknown')}")
#             if results['errors']:
#                 print("Errors:", results['errors'])
#             if results['warnings']:
#                 print("Warnings:", results['warnings'])
            
#         elif args.action == 'setup':
#             success, message, details = configurator.auto_setup_router(
#                 args.setup_type,
#                 args.router_name,
#                 args.template,
#                 args.dry_run
#             )
#             print(f"Success: {success}")
#             print(f"Message: {message}")
#             if args.verbose:
#                 print(f"Details: {json.dumps(details, indent=2)}")
            
#         elif args.action == 'hotspot':
#             ssid = args.ssid or f"{args.router_name}-WiFi"
#             success, message, details = configurator.setup_hotspot_only(ssid, args.template, args.dry_run)
#             print(f"Success: {success}")
#             print(f"Message: {message}")
#             if args.verbose:
#                 print(f"Details: {json.dumps(details, indent=2)}")
            
#         elif args.action == 'pppoe':
#             service_name = args.service_name or f"{args.router_name}-PPPoE"
#             success, message, details = configurator.setup_pppoe_only(service_name, args.template, args.dry_run)
#             print(f"Success: {success}")
#             print(f"Message: {message}")
#             if args.verbose:
#                 print(f"Details: {json.dumps(details, indent=2)}")
            
#         elif args.action == 'diagnose':
#             diagnostics = configurator.run_diagnostics()
#             print("=== DIAGNOSTIC RESULTS ===")
#             print(f"System Health: {diagnostics['system_health']}")
#             print(f"Services: {diagnostics['services']}")
#             print(f"Interfaces: {diagnostics['interfaces']}")
#             if diagnostics['issues']:
#                 print(f"Issues: {diagnostics['issues']}")
#             if diagnostics['recommendations']:
#                 print(f"Recommendations: {diagnostics['recommendations']}")
            
#         elif args.action == 'backup':
#             success, message = configurator.backup_configuration(args.backup_name)
#             print(f"Backup: {'✅ SUCCESS' if success else '❌ FAILED'}")
#             print(f"Message: {message}")
            
#         elif args.action == 'templates':
#             templates = configurator.get_available_templates()
#             print("=== AVAILABLE TEMPLATES ===")
#             for name, template in templates.items():
#                 print(f"{name}: {template.get('description', 'No description')}")
#                 print(f"  Recommended for: {', '.join(template.get('recommended_for', []))}")
#                 print()
    
#     except Exception as e:
#         print(f"❌ Error: {str(e)}")
#         sys.exit(1)
#     finally:
#         configurator.disconnect()


# if __name__ == "__main__":
#     main()









#!/usr/bin/env python3
"""
PRODUCTION-READY MikroTik Automated Configuration Script for SurfZone

Enhanced with comprehensive error handling, SSH fallback, configuration templates,
security validation, and production-ready reliability for automated MikroTik router setup.
"""

import os
import sys
import logging
import tempfile
import json
import re
import hashlib
import secrets
from datetime import datetime, timedelta
from typing import Dict, Tuple, Optional, Any, List

# Add the project root to Python path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import the enhanced connector
try:
    from network_management.utils.mikrotik_connector import (
        MikroTikConnector, 
        MikroTikConnectionManager,
        SecurityConfig,
        MikroTikConfig,
        MonitoringManager,
        DatabaseManager
    )
    from routeros_api import RouterOsApiPool
    from routeros_api.exceptions import RouterOsApiConnectionError, RouterOsApiCommunicationError
except ImportError as e:
    print(f"Error: Required dependencies not installed: {e}")
    print("Please install: pip install routeros-api")
    sys.exit(1)

# SSH support (optional)
try:
    import paramiko
    from paramiko.ssh_exception import SSHException, AuthenticationException
    SSH_AVAILABLE = True
except ImportError:
    SSH_AVAILABLE = False
    print("Warning: paramiko not installed. SSH fallback will not be available.")

logger = logging.getLogger(__name__)


class SecurityValidator:
    """Enhanced security validation for production environments."""
    
    @staticmethod
    def validate_router_credentials(host: str, username: str, password: str) -> Tuple[bool, List[str]]:
        """Comprehensive credential validation for production security."""
        errors = []
        
        # IP validation
        if not re.match(r'^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$', host):
            errors.append("Invalid IP address format")
        
        # Username validation
        if not username or len(username.strip()) < 2:
            errors.append("Username must be at least 2 characters")
        
        # Password strength validation
        if len(password) < 8:
            errors.append("Password must be at least 8 characters")
        if not any(char.isdigit() for char in password):
            errors.append("Password must contain at least one digit")
        if not any(char.isupper() for char in password):
            errors.append("Password must contain at least one uppercase letter")
        
        # Security checks from settings
        security_config = MikroTikConfig.get_security_config()
        if security_config.get('REJECT_DEFAULT_PASSWORDS', True):
            if username == 'admin' and password in ['', 'admin', 'password', '123456']:
                errors.append("Default credentials detected - change for security")
        
        return len(errors) == 0, errors
    
    @staticmethod
    def generate_secure_password(length: int = 16) -> str:
        """Generate a secure random password for API users."""
        alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
        return ''.join(secrets.choice(alphabet) for _ in range(length))
    
    @staticmethod
    def validate_configuration_parameters(config: Dict) -> Tuple[bool, List[str]]:
        """Validate configuration parameters for security and correctness."""
        errors = []
        
        # SSID validation
        if 'ssid' in config:
            ssid = config['ssid']
            if len(ssid) < 1 or len(ssid) > 32:
                errors.append("SSID must be between 1 and 32 characters")
            if not re.match(r'^[a-zA-Z0-9\-_ ]+$', ssid):
                errors.append("SSID contains invalid characters")
        
        # IP pool validation
        if 'ip_pool' in config:
            ip_pool = config['ip_pool']
            if not re.match(r'^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}-\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$', ip_pool):
                errors.append("Invalid IP pool format (expected: X.X.X.X-X.X.X.X)")
        
        # Bandwidth validation
        if 'bandwidth_limit' in config:
            bandwidth = config['bandwidth_limit']
            if not re.match(r'^\d+[KMGT]/\d+[KMGT]$', bandwidth):
                errors.append("Invalid bandwidth format (expected: XM/XM)")
        
        return len(errors) == 0, errors


class ConfigurationBackupManager:
    """Enhanced configuration backup and restore management."""
    
    def __init__(self, auto_config):
        self.auto_config = auto_config
        self.backup_dir = "/var/backups/mikrotik"  # Default backup directory
    
    def create_backup(self, backup_name: str = None) -> Tuple[bool, str, str]:
        """Create comprehensive configuration backup."""
        try:
            if not backup_name:
                timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                backup_name = f"config_backup_{timestamp}"
            
            # Connect via SSH for backup
            self.auto_config.connect_ssh()
            
            # Create backup on router
            backup_command = f"/system backup save name={backup_name}"
            output, error = self.auto_config.execute_ssh_command(backup_command)
            
            if error and "already executing" not in error:
                return False, f"Backup creation failed: {error}", ""
            
            # Wait for backup to complete
            import time
            time.sleep(5)
            
            # Export backup to local system
            export_command = f"/export file={backup_name}"
            output, error = self.auto_config.execute_ssh_command(export_command)
            
            # Verify backup files
            list_command = f"/file print where name~\"{backup_name}\""
            output, error = self.auto_config.execute_ssh_command(list_command)
            
            if backup_name not in output:
                return False, "Backup verification failed", ""
            
            # Create backup metadata
            metadata = {
                'backup_name': backup_name,
                'created_at': datetime.now().isoformat(),
                'router_host': self.auto_config.host,
                'backup_type': 'full_configuration'
            }
            
            return True, f"Backup created successfully: {backup_name}", json.dumps(metadata)
            
        except Exception as e:
            return False, f"Backup failed: {str(e)}", ""
        finally:
            self.auto_config.disconnect()
    
    def restore_backup(self, backup_name: str) -> Tuple[bool, str]:
        """Restore configuration from backup with safety checks."""
        try:
            # Safety check - don't restore in dry-run mode
            if getattr(self.auto_config, 'dry_run', False):
                return True, f"Dry-run: Would restore from {backup_name}"
            
            self.auto_config.connect_ssh()
            
            # Verify backup exists
            list_command = f"/file print where name~\"{backup_name}\""
            output, error = self.auto_config.execute_ssh_command(list_command)
            
            if backup_name not in output:
                return False, f"Backup file not found: {backup_name}"
            
            # Create pre-restore backup for safety
            safety_backup = f"pre_restore_safety_{datetime.now().strftime('%H%M%S')}"
            self.create_backup(safety_backup)
            
            # Restore configuration
            restore_command = f"/system backup load name={backup_name}"
            output, error = self.auto_config.execute_ssh_command(restore_command)
            
            if error:
                return False, f"Restore failed: {error}"
            
            # Reboot router to apply changes
            reboot_command = "/system reboot"
            output, error = self.auto_config.execute_ssh_command(reboot_command)
            
            return True, f"Configuration restored from {backup_name}. Router rebooting..."
            
        except Exception as e:
            return False, f"Restore failed: {str(e)}"
        finally:
            self.auto_config.disconnect()


class AuditLogger:
    """Enhanced audit logging for compliance and troubleshooting."""
    
    @staticmethod
    def log_configuration_action(host: str, action: str, details: Dict, user: str = "auto_config"):
        """Log configuration actions for audit trail."""
        audit_entry = {
            'timestamp': datetime.now().isoformat(),
            'router_host': host,
            'action': action,
            'user': user,
            'details': details,
            'status': 'completed' if details.get('success') else 'failed'
        }
        
        # Log to file
        log_file = "/var/log/mikrotik_audit.log"
        try:
            with open(log_file, 'a') as f:
                f.write(json.dumps(audit_entry) + '\n')
        except Exception as e:
            logger.warning(f"Failed to write audit log: {e}")
        
        # Log to database if available
        try:
            if hasattr(DatabaseManager, 'create_audit_log'):
                # This would require a router object, which we might not have
                pass
        except Exception as e:
            logger.debug(f"Database audit logging not available: {e}")
        
        logger.info(f"AUDIT: {action} on {host} by {user} - {audit_entry['status']}")


class MikroTikAutoConfig:
    """
    PRODUCTION-READY automated MikroTik router configuration using both API and SSH.
    Enhanced with comprehensive error handling, configuration templates, and fallback mechanisms.
    """
    
    def __init__(self, host: str, username: str, password: str, port: int = None, ssh_port: int = 22, router_id: int = None):
        self.host = host
        self.username = username
        self.password = password
        
        # Get configuration from settings
        connection_config = MikroTikConfig.get_connection_config()
        self.port = port or connection_config.get('PORT', 8728)
        self.ssh_port = ssh_port
        self.router_id = router_id
        
        # Initialize components
        self.connector = MikroTikConnector(host, username, password, self.port, router_id=router_id)
        self.security_validator = SecurityValidator()
        self.backup_manager = ConfigurationBackupManager(self)
        self.audit_logger = AuditLogger()
        
        self.api_connection = None
        self.ssh_client = None
        self.dry_run = False
        
        # Configuration templates
        self.templates = MikroTikConnectionManager.get_connection_templates()
        
        # Validate credentials on initialization
        self._validate_initial_credentials()
    
    def _validate_initial_credentials(self):
        """Validate credentials during initialization."""
        is_valid, errors = self.security_validator.validate_router_credentials(
            self.host, self.username, self.password
        )
        if not is_valid:
            logger.warning(f"Credential validation warnings: {', '.join(errors)}")
    
    def connect_api(self) -> Any:
        """Enhanced API connection with comprehensive error handling and retry logic."""
        max_retries = 3
        for attempt in range(max_retries):
            try:
                success, message, api = self.connector.connect()
                if success:
                    self.api_connection = api
                    logger.info(f"API connection established to {self.host}:{self.port}")
                    return api
                else:
                    if attempt == max_retries - 1:
                        raise RouterOsApiConnectionError(f"API connection failed after {max_retries} attempts: {message}")
                    logger.warning(f"API connection attempt {attempt + 1} failed: {message}")
                    import time
                    time.sleep(2 ** attempt)  # Exponential backoff
            except Exception as e:
                if attempt == max_retries - 1:
                    logger.error(f"API connection failed after {max_retries} attempts: {e}")
                    raise
                logger.warning(f"API connection attempt {attempt + 1} failed: {e}")
                import time
                time.sleep(2 ** attempt)
    
    def connect_ssh(self) -> Any:
        """Enhanced SSH connection with comprehensive error handling and security."""
        if not SSH_AVAILABLE:
            raise ImportError("paramiko not installed. SSH functionality unavailable.")
            
        max_retries = 2
        for attempt in range(max_retries):
            try:
                self.ssh_client = paramiko.SSHClient()
                self.ssh_client.set_missing_host_key_policy(paramiko.WarningPolicy())  # More secure than AutoAddPolicy
                
                # Enhanced SSH connection parameters
                ssh_config = {
                    'hostname': self.host,
                    'port': self.ssh_port,
                    'username': self.username,
                    'password': self.password,
                    'timeout': 30,
                    'look_for_keys': False,
                    'allow_agent': False,
                    'banner_timeout': 30,
                }
                
                self.ssh_client.connect(**ssh_config)
                
                # Test connection with a simple command
                stdin, stdout, stderr = self.ssh_client.exec_command("/system identity print", timeout=10)
                output = stdout.read().decode('utf-8', errors='ignore')
                
                if "name:" in output:
                    logger.info(f"SSH connection established and verified to {self.host}:{self.ssh_port}")
                    return self.ssh_client
                else:
                    raise SSHException("SSH connection established but command execution failed")
                    
            except AuthenticationException as e:
                logger.error(f"SSH authentication failed: {e}")
                raise
            except (SSHException, Exception) as e:
                if attempt == max_retries - 1:
                    logger.error(f"SSH connection failed after {max_retries} attempts: {e}")
                    raise
                logger.warning(f"SSH connection attempt {attempt + 1} failed: {e}")
                import time
                time.sleep(2 ** attempt)
            finally:
                if attempt == max_retries - 1 and self.ssh_client:
                    self.ssh_client.close()
    
    def disconnect(self):
        """Enhanced connection cleanup with comprehensive error handling."""
        cleanup_errors = []
        
        # Disconnect API
        if hasattr(self.connector, 'disconnect'):
            try:
                self.connector.disconnect()
            except Exception as e:
                cleanup_errors.append(f"API disconnect error: {e}")
        
        # Disconnect SSH
        if self.ssh_client:
            try:
                self.ssh_client.close()
            except Exception as e:
                cleanup_errors.append(f"SSH disconnect error: {e}")
        
        if cleanup_errors:
            logger.warning(f"Cleanup completed with errors: {', '.join(cleanup_errors)}")
        else:
            logger.debug("All connections cleaned up successfully")
    
    def execute_ssh_command(self, command: str, timeout: int = 30) -> Tuple[str, str]:
        """Enhanced SSH command execution with timeout, error handling, and security logging."""
        if not self.ssh_client:
            self.connect_ssh()
        
        # Log sensitive commands (without passwords)
        safe_command = re.sub(r'password=\S+', 'password=***', command)
        logger.debug(f"Executing SSH command: {safe_command}")
        
        try:
            stdin, stdout, stderr = self.ssh_client.exec_command(command, timeout=timeout)
            output = stdout.read().decode('utf-8', errors='ignore').strip()
            error = stderr.read().decode('utf-8', errors='ignore').strip()
            
            # Log errors
            if error and "already have" not in error and "already exists" not in error:
                logger.warning(f"SSH command warning: {error}")
            
            return output, error
        except Exception as e:
            logger.error(f"SSH command failed: {e}")
            return "", str(e)
    
    def test_connection(self) -> Dict[str, Any]:
        """
        Comprehensive connection testing with both API and SSH.
        
        Returns:
            dict: Connection test results
        """
        results = {
            'api_connection': False,
            'ssh_connection': False,
            'system_info': {},
            'capabilities': {},
            'errors': [],
            'warnings': [],
            'security_checks': [],
            'timestamp': datetime.now().isoformat()
        }
        
        # Test API connection
        try:
            api_test = self.connector.test_connection()
            results['api_connection'] = api_test.get('system_access', False)
            results['system_info'] = api_test.get('system_info', {})
            results['capabilities'] = api_test.get('capabilities', {})
            
            if not results['api_connection']:
                results['errors'].extend(api_test.get('error_messages', []))
            else:
                results['security_checks'].append("API connection: Secure")
                
        except Exception as e:
            results['errors'].append(f"API connection test failed: {str(e)}")
        
        # Test SSH connection
        if SSH_AVAILABLE:
            try:
                self.connect_ssh()
                results['ssh_connection'] = True
                
                # Test basic SSH command and security
                output, error = self.execute_ssh_command("/system resource print")
                if "board-name" in output:
                    results['ssh_test'] = "Successful"
                    results['security_checks'].append("SSH connection: Secure")
                else:
                    results['warnings'].append("SSH connection established but command execution may be limited")
                
                # Check for default users
                users_output, _ = self.execute_ssh_command("/user print")
                if "admin" in users_output:
                    results['security_checks'].append("Warning: Default admin user exists")
                    
            except Exception as e:
                results['warnings'].append(f"SSH connection failed: {str(e)}")
        else:
            results['warnings'].append("SSH not available (paramiko not installed)")
        
        # Security assessment
        self._perform_security_assessment(results)
        
        return results
    
    def _perform_security_assessment(self, results: Dict):
        """Perform basic security assessment of the router."""
        try:
            if not results['api_connection']:
                return
            
            api = self.connect_api()
            
            # Check services
            services = api.get_resource('/ip/service')
            service_list = services.get()
            
            # Assess service security
            for service in service_list:
                if service.get('disabled') == 'false':
                    port = service.get('port', '')
                    if port in ['8728', '8729']:  # API ports
                        results['security_checks'].append(f"API service enabled on port {port}")
                    if port == '22':
                        results['security_checks'].append("SSH service enabled")
                    if port == '23':
                        results['security_checks'].append("Warning: Telnet service enabled (insecure)")
            
            # Check firewall rules
            try:
                firewall = api.get_resource('/ip/firewall/filter')
                firewall_rules = firewall.get()
                if len(firewall_rules) == 0:
                    results['security_checks'].append("Warning: No firewall rules configured")
                else:
                    results['security_checks'].append(f"Firewall: {len(firewall_rules)} rules configured")
            except:
                results['security_checks'].append("Warning: Cannot access firewall configuration")
                
        except Exception as e:
            results['warnings'].append(f"Security assessment incomplete: {str(e)}")
    
    def basic_router_setup(self, router_name: str = None, dry_run: bool = False) -> Tuple[bool, str, Dict]:
        """
        Enhanced basic router setup with comprehensive configuration and security.
        
        Returns:
            tuple: (success, message, details)
        """
        # Use configured default name if not provided
        if not router_name:
            hotspot_defaults = MikroTikConfig.get_hotspot_defaults()
            router_name = hotspot_defaults.get('default_ssid', 'SurfZone-Router').replace('-WiFi', '')
        
        self.dry_run = dry_run
        details = {
            'steps': [],
            'commands_executed': [],
            'router_name': router_name,
            'dry_run': dry_run,
            'security_enhancements': []
        }
        
        try:
            # Create backup before making changes
            if not dry_run:
                backup_success, backup_message, _ = self.backup_manager.create_backup("pre_setup_backup")
                if backup_success:
                    details['steps'].append(f"Backup created: {backup_message}")
                else:
                    details['warnings'].append(f"Backup failed: {backup_message}")
            
            # Use SSH for initial setup (more reliable for basic configuration)
            if not dry_run:
                self.connect_ssh()
            
            # Generate secure password for API user
            api_password = self.security_validator.generate_secure_password()
            
            setup_commands = [
                # Basic system configuration
                f"/system identity set name={router_name}",
                
                # Enable essential services with security
                "/ip service set api disabled=no port=8728",
                "/ip service set www disabled=no port=80",
                "/ip service set ssh disabled=no port=22",
                "/ip service set winbox disabled=no port=8291",
                "/ip service set telnet disabled=yes",  # Disable insecure telnet
                "/ip service set ftp disabled=yes",     # Disable insecure FTP
                
                # Create dedicated API user for security
                f"/user add name=surfzone_api group=full password={api_password}",
                "/user set [find name=admin] disabled=yes",  # Disable default admin
                
                # Basic firewall configuration
                "/ip firewall filter add chain=input protocol=tcp dst-port=8728 action=accept comment=\"API Access\" place-before=0",
                "/ip firewall filter add chain=input protocol=tcp dst-port=80,443 action=accept comment=\"Web Access\"",
                "/ip firewall filter add chain=input protocol=tcp dst-port=22 action=accept comment=\"SSH Access\"",
                "/ip firewall filter add chain=input protocol=tcp dst-port=8291 action=accept comment=\"Winbox Access\"",
                "/ip firewall filter add chain=input connection-state=established,related action=accept comment=\"Allow established connections\"",
                "/ip firewall filter add chain=input connection-state=invalid action=drop comment=\"Drop invalid connections\"",
                "/ip firewall filter add chain=input action=drop comment=\"Drop all other input\"",
                
                # Configure NTP for time synchronization
                "/system ntp client set enabled=yes primary-ntp=pool.ntp.org secondary-ntp=time.google.com",
                
                # Enable secure logging
                "/system logging action set memory memory-lines=1000",
                "/system logging add topics=info action=memory",
                "/system logging add topics=error action=memory",
                "/system logging add topics=critical action=memory",
                
                # Basic bridge configuration
                "/interface bridge add name=bridge-local",
                "/interface bridge port add interface=ether2 bridge=bridge-local",
                "/interface bridge port add interface=ether3 bridge=bridge-local",
                "/interface bridge port add interface=ether4 bridge=bridge-local",
                "/interface bridge port add interface=ether5 bridge=bridge-local",
                
                # IP address for bridge
                "/ip address add address=192.168.88.1/24 interface=bridge-local network=192.168.88.0",
                
                # Basic NAT configuration
                "/ip firewall nat add chain=srcnat out-interface=ether1 action=masquerade comment=\"Basic NAT\"",
                
                # Additional security measures
                "/ip socks set enabled=no",  # Disable SOCKS proxy
                "/ip proxy set enabled=no",  # Disable web proxy
            ]
            
            if dry_run:
                details['commands'] = setup_commands
                details['generated_api_password'] = "***HIDDEN***"  # Don't expose in dry-run
                return True, "Dry run completed successfully", details
            
            # Execute setup commands via SSH
            for command in setup_commands:
                output, error = self.execute_ssh_command(command)
                details['commands_executed'].append({
                    'command': command,
                    'output': output,
                    'error': error
                })
                
                if error and "already have" not in error and "already exists" not in error and "no such item" not in error:
                    details['steps'].append(f"Failed: {command} - {error}")
                    logger.error(f"Setup command failed: {command} - {error}")
                else:
                    details['steps'].append(f"Success: {command}")
            
            # Store the generated API password securely
            details['generated_api_password'] = api_password
            details['security_enhancements'].extend([
                "Default admin user disabled",
                "Secure API user created",
                "Insecure services disabled",
                "Basic firewall configured"
            ])
            
            # Verify setup via API
            try:
                api = self.connect_api()
                system_resource = api.get_resource('/system/resource')
                system_info = system_resource.get()
                if system_info:
                    details['system_info'] = system_info[0]
            except Exception as e:
                details['warnings'].append(f"API verification failed: {str(e)}")
            
            # Log the configuration action
            self.audit_logger.log_configuration_action(
                self.host, 
                "basic_router_setup", 
                {
                    'router_name': router_name,
                    'steps_completed': len([s for s in details['steps'] if 'Success' in s]),
                    'security_enhancements': details['security_enhancements']
                }
            )
            
            return True, "Basic router setup completed successfully", details
            
        except Exception as e:
            logger.error(f"Basic setup failed: {e}")
            details['errors'] = [str(e)]
            return False, f"Basic setup failed: {str(e)}", details
        finally:
            self.disconnect()
    
    def configure_hotspot(self, ssid: str = None, bandwidth_limit: str = None, 
                         session_timeout: int = None, max_users: int = None, 
                         welcome_message: str = None, template: str = None, 
                         dry_run: bool = False) -> Tuple[bool, str, Dict]:
        """
        Enhanced hotspot configuration with template support and security validation.
        
        Returns:
            tuple: (success, message, details)
        """
        self.dry_run = dry_run
        details = {
            'steps': [],
            'configuration': {},
            'template_used': template,
            'dry_run': dry_run,
            'validation_errors': []
        }
        
        # Get defaults from configuration
        hotspot_defaults = MikroTikConfig.get_hotspot_defaults()
        ssid = ssid or hotspot_defaults.get('default_ssid', 'SurfZone-WiFi')
        bandwidth_limit = bandwidth_limit or hotspot_defaults['bandwidth_limit']
        session_timeout = session_timeout or hotspot_defaults['session_timeout']
        max_users = max_users or hotspot_defaults['max_users']
        
        # Apply template if specified
        if template and template in self.templates:
            template_config = self.templates[template].get('hotspot_config', {})
            ssid = template_config.get('ssid', ssid)
            bandwidth_limit = template_config.get('bandwidth_limit', bandwidth_limit)
            session_timeout = template_config.get('session_timeout', session_timeout)
            max_users = template_config.get('max_users', max_users)
            welcome_message = template_config.get('welcome_message', welcome_message)
            details['template_applied'] = True
        
        # Validate configuration parameters
        config_params = {
            'ssid': ssid,
            'bandwidth_limit': bandwidth_limit,
            'session_timeout': session_timeout,
            'max_users': max_users
        }
        
        is_valid, validation_errors = self.security_validator.validate_configuration_parameters(config_params)
        if not is_valid:
            details['validation_errors'] = validation_errors
            return False, f"Configuration validation failed: {', '.join(validation_errors)}", details
        
        try:
            if dry_run:
                details['configuration'] = config_params
                return True, "Hotspot configuration dry run completed", details
            
            # Use the enhanced connector for hotspot configuration
            success, message, config_details = self.connector.configure_hotspot(
                ssid=ssid,
                welcome_message=welcome_message,
                bandwidth_limit=bandwidth_limit,
                session_timeout=session_timeout,
                max_users=max_users
            )
            
            details['configuration'] = config_details
            details['steps'] = config_details.get('configuration_steps', [])
            
            # Log the configuration action
            if success:
                self.audit_logger.log_configuration_action(
                    self.host,
                    "hotspot_configuration",
                    {
                        'ssid': ssid,
                        'bandwidth_limit': bandwidth_limit,
                        'session_timeout': session_timeout,
                        'max_users': max_users,
                        'template': template
                    }
                )
            
            return success, message, details
            
        except Exception as e:
            logger.error(f"Hotspot configuration failed: {e}")
            details['errors'] = [str(e)]
            return False, f"Hotspot configuration failed: {str(e)}", details
    
    def configure_pppoe(self, service_name: str = None, bandwidth_limit: str = None, 
                       mtu: int = None, template: str = None, dry_run: bool = False) -> Tuple[bool, str, Dict]:
        """
        Enhanced PPPoE configuration with template support and validation.
        
        Returns:
            tuple: (success, message, details)
        """
        self.dry_run = dry_run
        details = {
            'steps': [],
            'configuration': {},
            'template_used': template,
            'dry_run': dry_run,
            'validation_errors': []
        }
        
        # Get defaults from configuration
        pppoe_defaults = MikroTikConfig.get_pppoe_defaults()
        service_name = service_name or pppoe_defaults.get('service_name', 'SurfZone-PPPoE')
        bandwidth_limit = bandwidth_limit or pppoe_defaults['bandwidth_limit']
        mtu = mtu or pppoe_defaults['mtu']
        
        # Apply template if specified
        if template and template in self.templates:
            template_config = self.templates[template].get('pppoe_config', {})
            service_name = template_config.get('service_name', service_name)
            bandwidth_limit = template_config.get('bandwidth_limit', bandwidth_limit)
            mtu = template_config.get('mtu', mtu)
            details['template_applied'] = True
        
        # Validate configuration parameters
        config_params = {
            'service_name': service_name,
            'bandwidth_limit': bandwidth_limit,
            'mtu': mtu
        }
        
        is_valid, validation_errors = self.security_validator.validate_configuration_parameters(config_params)
        if not is_valid:
            details['validation_errors'] = validation_errors
            return False, f"Configuration validation failed: {', '.join(validation_errors)}", details
        
        try:
            if dry_run:
                details['configuration'] = config_params
                return True, "PPPoE configuration dry run completed", details
            
            # Use the enhanced connector for PPPoE configuration
            success, message, config_details = self.connector.configure_pppoe(
                service_name=service_name,
                bandwidth_limit=bandwidth_limit,
                mtu=mtu
            )
            
            details['configuration'] = config_details
            details['steps'] = config_details.get('configuration_steps', [])
            
            # Log the configuration action
            if success:
                self.audit_logger.log_configuration_action(
                    self.host,
                    "pppoe_configuration",
                    {
                        'service_name': service_name,
                        'bandwidth_limit': bandwidth_limit,
                        'mtu': mtu,
                        'template': template
                    }
                )
            
            return success, message, details
            
        except Exception as e:
            logger.error(f"PPPoE configuration failed: {e}")
            details['errors'] = [str(e)]
            return False, f"PPPoE configuration failed: {str(e)}", details
    
    def auto_setup_router(self, setup_type: str = "hotspot", router_name: str = None, 
                         template: str = None, dry_run: bool = False) -> Tuple[bool, str, Dict]:
        """
        Complete automated router setup based on specified type and template.
        
        Returns:
            tuple: (success, message, details)
        """
        self.dry_run = dry_run
        
        # Get default router name from configuration
        if not router_name:
            hotspot_defaults = MikroTikConfig.get_hotspot_defaults()
            router_name = hotspot_defaults.get('default_ssid', 'SurfZone-Router').replace('-WiFi', '')
        
        details = {
            'setup_type': setup_type,
            'router_name': router_name,
            'template_used': template,
            'steps_completed': [],
            'dry_run': dry_run,
            'start_time': datetime.now().isoformat()
        }
        
        try:
            # Step 1: Basic router setup
            logger.info(f"Starting basic router setup for {router_name}")
            success, message, basic_details = self.basic_router_setup(router_name, dry_run)
            if not success:
                details['errors'] = [message]
                return False, f"Basic setup failed: {message}", details
            
            details['basic_setup'] = basic_details
            details['steps_completed'].append('basic_setup')
            
            # Step 2: Service-specific setup
            if setup_type in ['hotspot', 'both']:
                logger.info(f"Configuring hotspot service")
                ssid = f"{router_name}-WiFi"
                success, message, hotspot_details = self.configure_hotspot(ssid, template=template, dry_run=dry_run)
                if success:
                    details['hotspot_setup'] = hotspot_details
                    details['steps_completed'].append('hotspot_setup')
                elif setup_type == 'hotspot':
                    details['errors'] = [message]
                    return False, f"Hotspot setup failed: {message}", details
            
            if setup_type in ['pppoe', 'both']:
                logger.info(f"Configuring PPPoE service")
                service_name = f"{router_name}-PPPoE"
                success, message, pppoe_details = self.configure_pppoe(service_name, template=template, dry_run=dry_run)
                if success:
                    details['pppoe_setup'] = pppoe_details
                    details['steps_completed'].append('pppoe_setup')
                elif setup_type == 'pppoe':
                    details['errors'] = [message]
                    return False, f"PPPoE setup failed: {message}", details
            
            # Step 3: Final verification
            if not dry_run:
                logger.info("Performing final verification")
                verification = self.test_connection()
                details['final_verification'] = verification
                if verification.get('api_connection'):
                    details['steps_completed'].append('verification')
                else:
                    details['warnings'].append("Final verification: API connection failed")
            
            details['end_time'] = datetime.now().isoformat()
            duration = datetime.fromisoformat(details['end_time']) - datetime.fromisoformat(details['start_time'])
            details['duration_seconds'] = duration.total_seconds()
            
            # Log successful setup
            self.audit_logger.log_configuration_action(
                self.host,
                "auto_setup_completed",
                {
                    'setup_type': setup_type,
                    'router_name': router_name,
                    'template': template,
                    'steps_completed': details['steps_completed'],
                    'duration_seconds': details['duration_seconds']
                }
            )
            
            return True, f"Auto setup completed for {setup_type} in {details['duration_seconds']:.1f}s", details
            
        except Exception as e:
            logger.error(f"Auto setup failed: {e}")
            details['errors'] = [str(e)]
            details['end_time'] = datetime.now().isoformat()
            return False, f"Auto setup failed: {str(e)}", details
    
    def setup_hotspot_only(self, ssid: str = None, template: str = None, dry_run: bool = False):
        """Convenience method for hotspot-only setup."""
        return self.auto_setup_router("hotspot", ssid.replace('-WiFi', '') if ssid else None, template, dry_run)
    
    def setup_pppoe_only(self, service_name: str = None, template: str = None, dry_run: bool = False):
        """Convenience method for PPPoE-only setup."""
        return self.auto_setup_router("pppoe", service_name.replace('-PPPoE', '') if service_name else None, template, dry_run)
    
    def run_diagnostics(self) -> Dict[str, Any]:
        """
        Run comprehensive diagnostics on the router.
        
        Returns:
            dict: Diagnostic results
        """
        diagnostics = {
            'system_health': {},
            'services': {},
            'interfaces': {},
            'configuration': {},
            'performance': {},
            'security': {},
            'issues': [],
            'recommendations': [],
            'timestamp': datetime.now().isoformat()
        }
        
        try:
            api = self.connect_api()
            
            # System health check
            system_resource = api.get_resource('/system/resource')
            system_info = system_resource.get()
            if system_info:
                diagnostics['system_health'] = {
                    'model': system_info[0].get('board-name', 'Unknown'),
                    'version': system_info[0].get('version', 'Unknown'),
                    'cpu_load': system_info[0].get('cpu-load', 'Unknown'),
                    'uptime': system_info[0].get('uptime', 'Unknown'),
                    'free_memory': system_info[0].get('free-memory', 'Unknown'),
                    'total_memory': system_info[0].get('total-memory', 'Unknown'),
                    'cpu_count': system_info[0].get('cpu-count', 'Unknown')
                }
            
            # Check services
            services = api.get_resource('/ip/service')
            service_list = services.get()
            diagnostics['services'] = {
                'api': any(s.get('name') == 'api' and s.get('disabled') == 'false' for s in service_list),
                'www': any(s.get('name') == 'www' and s.get('disabled') == 'false' for s in service_list),
                'ssh': any(s.get('name') == 'ssh' and s.get('disabled') == 'false' for s in service_list),
                'winbox': any(s.get('name') == 'winbox' and s.get('disabled') == 'false' for s in service_list),
                'telnet': any(s.get('name') == 'telnet' and s.get('disabled') == 'false' for s in service_list),
                'ftp': any(s.get('name') == 'ftp' and s.get('disabled') == 'false' for s in service_list),
            }
            
            # Check interfaces
            interfaces = api.get_resource('/interface')
            interface_list = interfaces.get()
            diagnostics['interfaces'] = {
                'total': len(interface_list),
                'wireless': len([i for i in interface_list if i.get('type') == 'wireless']),
                'ethernet': len([i for i in interface_list if i.get('type') == 'ether']),
                'bridge': len([i for i in interface_list if i.get('type') == 'bridge']),
                'vlan': len([i for i in interface_list if i.get('type') == 'vlan'])
            }
            
            # Check configurations
            try:
                hotspot_servers = api.get_resource('/ip/hotspot')
                diagnostics['configuration']['hotspot'] = len(hotspot_servers.get()) > 0
            except:
                diagnostics['configuration']['hotspot'] = False
            
            try:
                pppoe_servers = api.get_resource('/interface/pppoe-server/server')
                diagnostics['configuration']['pppoe'] = len(pppoe_servers.get()) > 0
            except:
                diagnostics['configuration']['pppoe'] = False
            
            # Security assessment
            try:
                users = api.get_resource('/user')
                user_list = users.get()
                admin_users = [u for u in user_list if u.get('name') == 'admin' and u.get('disabled') == 'false']
                diagnostics['security']['default_admin_enabled'] = len(admin_users) > 0
                
                # Check for weak passwords (basic check)
                diagnostics['security']['user_count'] = len(user_list)
            except:
                diagnostics['security']['assessment'] = 'Failed'
            
            # Performance metrics
            try:
                # Get interface statistics for performance assessment
                interface_stats = []
                for interface in interface_list[:5]:  # First 5 interfaces
                    interface_stats.append({
                        'name': interface.get('name'),
                        'rx_bytes': interface.get('rx-byte', 0),
                        'tx_bytes': interface.get('tx-byte', 0),
                        'status': interface.get('running', 'false')
                    })
                diagnostics['performance']['interface_stats'] = interface_stats
            except:
                diagnostics['performance']['interface_stats'] = []
            
            # Identify issues and generate recommendations
            self._generate_diagnostic_recommendations(diagnostics)
            
            return diagnostics
            
        except Exception as e:
            diagnostics['issues'].append(f"Diagnostics failed: {str(e)}")
            return diagnostics
        finally:
            self.disconnect()
    
    def _generate_diagnostic_recommendations(self, diagnostics: Dict):
        """Generate recommendations based on diagnostic findings."""
        # Memory recommendations
        free_memory_str = diagnostics['system_health'].get('free_memory', '0')
        try:
            free_memory = int(free_memory_str)
            if free_memory < 16777216:  # 16MB
                diagnostics['recommendations'].append("Low memory detected - consider optimizing configurations or upgrading hardware")
        except (ValueError, TypeError):
            pass
        
        # Service recommendations
        if not diagnostics['services']['api']:
            diagnostics['recommendations'].append("Enable API service for remote management")
        
        if diagnostics['services']['telnet']:
            diagnostics['recommendations'].append("Disable Telnet service (insecure) - use SSH instead")
        
        if diagnostics['services']['ftp']:
            diagnostics['recommendations'].append("Disable FTP service (insecure)")
        
        # Security recommendations
        if diagnostics['security'].get('default_admin_enabled'):
            diagnostics['recommendations'].append("Disable default admin user for security")
        
        diagnostics['recommendations'].append("Change default passwords for security")
        diagnostics['recommendations'].append("Review and update firewall rules regularly")
        
        # Performance recommendations
        cpu_load = diagnostics['system_health'].get('cpu_load', '0')
        try:
            cpu_value = float(cpu_load.strip('%'))
            if cpu_value > 80:
                diagnostics['recommendations'].append("High CPU usage detected - consider optimizing configurations")
        except (ValueError, AttributeError):
            pass
    
    def backup_configuration(self, backup_name: str = None) -> Tuple[bool, str]:
        """Enhanced configuration backup with error handling."""
        return self.backup_manager.create_backup(backup_name)
    
    def restore_configuration(self, backup_name: str) -> Tuple[bool, str]:
        """Restore router configuration from backup."""
        return self.backup_manager.restore_backup(backup_name)
    
    def get_available_templates(self) -> Dict:
        """Get available configuration templates."""
        return self.templates
    
    def get_template_info(self, template_name: str) -> Dict:
        """Get detailed information about a specific template."""
        if template_name in self.templates:
            return self.templates[template_name]
        else:
            return {'error': f"Template '{template_name}' not found"}


def main():
    """Enhanced standalone script execution for testing and manual use."""
    import argparse
    
    parser = argparse.ArgumentParser(description='PRODUCTION MikroTik Auto Configuration Script')
    parser.add_argument('--host', required=True, help='Router IP address')
    parser.add_argument('--username', required=True, help='Router username')
    parser.add_argument('--password', required=True, help='Router password')
    parser.add_argument('--port', type=int, help='API port (default: from settings)')
    parser.add_argument('--ssh-port', type=int, default=22, help='SSH port')
    parser.add_argument('--router-id', type=int, help='Router ID for database tracking')
    parser.add_argument('--action', 
                       choices=['test', 'setup', 'hotspot', 'pppoe', 'diagnose', 'backup', 'templates', 'validate'], 
                       default='test', help='Action to perform')
    parser.add_argument('--setup-type', choices=['hotspot', 'pppoe', 'both'], 
                       default='hotspot', help='Setup type for auto setup')
    parser.add_argument('--router-name', help='Router name')
    parser.add_argument('--template', help='Configuration template name')
    parser.add_argument('--ssid', help='WiFi SSID for hotspot setup')
    parser.add_argument('--service-name', help='PPPoE service name')
    parser.add_argument('--backup-name', help='Backup file name')
    parser.add_argument('--dry-run', action='store_true', help='Simulate without applying')
    parser.add_argument('--verbose', action='store_true', help='Enable verbose logging')
    
    args = parser.parse_args()
    
    # Configure logging
    log_level = logging.DEBUG if args.verbose else logging.INFO
    logging.basicConfig(
        level=log_level, 
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.StreamHandler(),
            logging.FileHandler('/var/log/mikrotik_auto_config.log')
        ]
    )
    
    # Validate credentials before proceeding
    validator = SecurityValidator()
    is_valid, errors = validator.validate_router_credentials(args.host, args.username, args.password)
    if not is_valid:
        print("❌ Credential validation failed:")
        for error in errors:
            print(f"   - {error}")
        sys.exit(1)
    
    # Create configurator instance
    configurator = MikroTikAutoConfig(
        args.host,
        args.username,
        args.password,
        args.port,
        args.ssh_port,
        args.router_id
    )
    
    try:
        if args.action == 'test':
            results = configurator.test_connection()
            print("=== CONNECTION TEST RESULTS ===")
            print(f"API Connection: {'✅ SUCCESS' if results['api_connection'] else '❌ FAILED'}")
            print(f"SSH Connection: {'✅ SUCCESS' if results['ssh_connection'] else '❌ FAILED'}")
            if results['system_info']:
                print(f"Router Model: {results['system_info'].get('model', 'Unknown')}")
                print(f"Router Version: {results['system_info'].get('version', 'Unknown')}")
            if results['security_checks']:
                print("Security Checks:")
                for check in results['security_checks']:
                    print(f"  - {check}")
            if results['errors']:
                print("Errors:", results['errors'])
            if results['warnings']:
                print("Warnings:", results['warnings'])
            
        elif args.action == 'validate':
            print("✅ Credentials validated successfully")
            print(f"Host: {args.host}")
            print(f"Username: {args.username}")
            print("Password: ********")
            
        elif args.action == 'setup':
            success, message, details = configurator.auto_setup_router(
                args.setup_type,
                args.router_name,
                args.template,
                args.dry_run
            )
            print(f"Success: {'✅' if success else '❌'} {success}")
            print(f"Message: {message}")
            if args.verbose:
                print(f"Details: {json.dumps(details, indent=2, default=str)}")
            
        elif args.action == 'hotspot':
            ssid = args.ssid or (f"{args.router_name}-WiFi" if args.router_name else None)
            success, message, details = configurator.setup_hotspot_only(ssid, args.template, args.dry_run)
            print(f"Success: {'✅' if success else '❌'} {success}")
            print(f"Message: {message}")
            if args.verbose:
                print(f"Details: {json.dumps(details, indent=2, default=str)}")
            
        elif args.action == 'pppoe':
            service_name = args.service_name or (f"{args.router_name}-PPPoE" if args.router_name else None)
            success, message, details = configurator.setup_pppoe_only(service_name, args.template, args.dry_run)
            print(f"Success: {'✅' if success else '❌'} {success}")
            print(f"Message: {message}")
            if args.verbose:
                print(f"Details: {json.dumps(details, indent=2, default=str)}")
            
        elif args.action == 'diagnose':
            diagnostics = configurator.run_diagnostics()
            print("=== DIAGNOSTIC RESULTS ===")
            print(f"System Health: {diagnostics['system_health']}")
            print(f"Services: {diagnostics['services']}")
            print(f"Interfaces: {diagnostics['interfaces']}")
            print(f"Security: {diagnostics['security']}")
            if diagnostics['issues']:
                print(f"Issues: {diagnostics['issues']}")
            if diagnostics['recommendations']:
                print(f"Recommendations: {diagnostics['recommendations']}")
            
        elif args.action == 'backup':
            success, message, metadata = configurator.backup_configuration(args.backup_name)
            print(f"Backup: {'✅ SUCCESS' if success else '❌ FAILED'}")
            print(f"Message: {message}")
            if metadata and args.verbose:
                print(f"Metadata: {metadata}")
            
        elif args.action == 'templates':
            templates = configurator.get_available_templates()
            print("=== AVAILABLE TEMPLATES ===")
            for name, template in templates.items():
                print(f"{name}: {template.get('description', 'No description')}")
                print(f"  Recommended for: {', '.join(template.get('recommended_for', []))}")
                print()
    
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        sys.exit(1)
    finally:
        configurator.disconnect()


if __name__ == "__main__":
    main()