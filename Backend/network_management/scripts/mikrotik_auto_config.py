







#!/usr/bin/env python3
"""
PRODUCTION-READY MikroTik Automated Configuration Script for SurfZone

Enhanced with comprehensive error handling, SSH fallback, configuration templates,
and production-ready reliability for automated MikroTik router setup.
"""

import os
import sys
import logging
import tempfile
import json
from datetime import datetime
from typing import Dict, Tuple, Optional, Any, List

# Add the project root to Python path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import the enhanced connector
try:
    from network_management.utils.mikrotik_connector import MikroTikConnector, MikroTikConnectionManager
    from routeros_api import RouterOsApiPool
    from routeros_api.exceptions import RouterOsApiConnectionError, RouterOsApiCommunicationError
except ImportError as e:
    print(f"Error: Required dependencies not installed: {e}")
    print("Please install: pip install routeros-api")
    sys.exit(1)

# SSH support (optional)
try:
    import paramiko
    SSH_AVAILABLE = True
except ImportError:
    SSH_AVAILABLE = False
    print("Warning: paramiko not installed. SSH fallback will not be available.")

logger = logging.getLogger(__name__)


class MikroTikAutoConfig:
    """
    PRODUCTION-READY automated MikroTik router configuration using both API and SSH.
    Enhanced with comprehensive error handling, configuration templates, and fallback mechanisms.
    """
    
    def __init__(self, host: str, username: str, password: str, port: int = 8728, ssh_port: int = 22):
        self.host = host
        self.username = username
        self.password = password
        self.port = port
        self.ssh_port = ssh_port
        self.api_connection = None
        self.ssh_client = None
        self.connector = MikroTikConnector(host, username, password, port)
        
        # Configuration templates
        self.templates = MikroTikConnectionManager.get_connection_templates()
        
    def connect_api(self) -> Any:
        """Enhanced API connection with comprehensive error handling."""
        try:
            success, message, api = self.connector.connect()
            if success:
                self.api_connection = api
                return api
            else:
                raise RouterOsApiConnectionError(message)
        except Exception as e:
            logger.error(f"API connection failed: {e}")
            raise
    
    def connect_ssh(self) -> Any:
        """Enhanced SSH connection with comprehensive error handling."""
        if not SSH_AVAILABLE:
            raise ImportError("paramiko not installed. SSH functionality unavailable.")
            
        try:
            self.ssh_client = paramiko.SSHClient()
            self.ssh_client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            self.ssh_client.connect(
                self.host,
                port=self.ssh_port,
                username=self.username,
                password=self.password,
                timeout=30,
                look_for_keys=False,
                allow_agent=False
            )
            logger.info(f"SSH connection established to {self.host}:{self.ssh_port}")
            return self.ssh_client
        except Exception as e:
            logger.error(f"SSH connection failed: {e}")
            raise
    
    def disconnect(self):
        """Enhanced connection cleanup with error handling."""
        if self.api_connection and hasattr(self.connector, 'api_pool'):
            try:
                self.connector.api_pool.disconnect()
            except Exception as e:
                logger.warning(f"Error disconnecting API pool: {e}")
        
        if self.ssh_client:
            try:
                self.ssh_client.close()
            except Exception as e:
                logger.warning(f"Error closing SSH connection: {e}")
    
    def execute_ssh_command(self, command: str, timeout: int = 30) -> Tuple[str, str]:
        """Enhanced SSH command execution with timeout and error handling."""
        if not self.ssh_client:
            self.connect_ssh()
        
        try:
            stdin, stdout, stderr = self.ssh_client.exec_command(command, timeout=timeout)
            output = stdout.read().decode('utf-8', errors='ignore').strip()
            error = stderr.read().decode('utf-8', errors='ignore').strip()
            
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
                
        except Exception as e:
            results['errors'].append(f"API connection test failed: {str(e)}")
        
        # Test SSH connection
        if SSH_AVAILABLE:
            try:
                self.connect_ssh()
                results['ssh_connection'] = True
                # Test basic SSH command
                output, error = self.execute_ssh_command("/system resource print")
                if "board-name" in output:
                    results['ssh_test'] = "Successful"
                else:
                    results['warnings'].append("SSH connection established but command execution may be limited")
            except Exception as e:
                results['warnings'].append(f"SSH connection failed: {str(e)}")
        else:
            results['warnings'].append("SSH not available (paramiko not installed)")
        
        return results
    
    def basic_router_setup(self, router_name: str = "SurfZone-Router", dry_run: bool = False) -> Tuple[bool, str, Dict]:
        """
        Enhanced basic router setup with comprehensive configuration.
        
        Returns:
            tuple: (success, message, details)
        """
        details = {
            'steps': [],
            'commands_executed': [],
            'router_name': router_name,
            'dry_run': dry_run
        }
        
        try:
            # Use SSH for initial setup (more reliable for basic configuration)
            if not dry_run:
                self.connect_ssh()
            
            setup_commands = [
                # Basic system configuration
                f"/system identity set name={router_name}",
                
                # Enable essential services
                "/ip service set api disabled=no port=8728",
                "/ip service set www disabled=no port=80",
                "/ip service set ssh disabled=no port=22",
                "/ip service set winbox disabled=no port=8291",
                
                # Create dedicated API user for security
                f"/user add name=surfzone_api group=full password={self.password}",
                "/user disable admin",  # Disable default admin for security
                
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
                
                # Enable logging
                "/system logging action set memory memory-lines=1000",
                "/system logging add topics=info action=memory",
                "/system logging add topics=error action=memory",
                
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
            ]
            
            if dry_run:
                details['commands'] = setup_commands
                return True, "Dry run completed successfully", details
            
            # Execute setup commands via SSH
            for command in setup_commands:
                output, error = self.execute_ssh_command(command)
                details['commands_executed'].append({
                    'command': command,
                    'output': output,
                    'error': error
                })
                
                if error and "already have" not in error and "already exists" not in error:
                    details['steps'].append(f"Failed: {command} - {error}")
                    return False, f"Setup failed at: {command} - {error}", details
                else:
                    details['steps'].append(f"Success: {command}")
            
            # Verify setup via API
            try:
                api = self.connect_api()
                system_resource = api.get_resource('/system/resource')
                system_info = system_resource.get()
                if system_info:
                    details['system_info'] = system_info[0]
            except Exception as e:
                details['warnings'].append(f"API verification failed: {str(e)}")
            
            self.disconnect()
            return True, "Basic router setup completed successfully", details
            
        except Exception as e:
            logger.error(f"Basic setup failed: {e}")
            return False, f"Basic setup failed: {str(e)}", details
    
    def configure_hotspot(self, ssid: str = "SurfZone-WiFi", bandwidth_limit: str = "10M/10M", 
                         session_timeout: int = 60, max_users: int = 50, welcome_message: str = None,
                         template: str = None, dry_run: bool = False) -> Tuple[bool, str, Dict]:
        """
        Enhanced hotspot configuration with template support.
        
        Returns:
            tuple: (success, message, details)
        """
        details = {
            'steps': [],
            'configuration': {},
            'template_used': template,
            'dry_run': dry_run
        }
        
        # Apply template if specified
        if template and template in self.templates:
            template_config = self.templates[template].get('hotspot_config', {})
            ssid = template_config.get('ssid', ssid)
            bandwidth_limit = template_config.get('bandwidth_limit', bandwidth_limit)
            session_timeout = template_config.get('session_timeout', session_timeout)
            max_users = template_config.get('max_users', max_users)
            welcome_message = template_config.get('welcome_message', welcome_message)
            details['template_applied'] = True
        
        try:
            if dry_run:
                details['configuration'] = {
                    'ssid': ssid,
                    'bandwidth_limit': bandwidth_limit,
                    'session_timeout': session_timeout,
                    'max_users': max_users,
                    'welcome_message': welcome_message
                }
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
            
            return success, message, details
            
        except Exception as e:
            logger.error(f"Hotspot configuration failed: {e}")
            return False, f"Hotspot configuration failed: {str(e)}", details
    
    def configure_pppoe(self, service_name: str = "SurfZone-PPPoE", bandwidth_limit: str = "10M/10M", 
                       mtu: int = 1492, template: str = None, dry_run: bool = False) -> Tuple[bool, str, Dict]:
        """
        Enhanced PPPoE configuration with template support.
        
        Returns:
            tuple: (success, message, details)
        """
        details = {
            'steps': [],
            'configuration': {},
            'template_used': template,
            'dry_run': dry_run
        }
        
        # Apply template if specified
        if template and template in self.templates:
            template_config = self.templates[template].get('pppoe_config', {})
            service_name = template_config.get('service_name', service_name)
            bandwidth_limit = template_config.get('bandwidth_limit', bandwidth_limit)
            mtu = template_config.get('mtu', mtu)
            details['template_applied'] = True
        
        try:
            if dry_run:
                details['configuration'] = {
                    'service_name': service_name,
                    'bandwidth_limit': bandwidth_limit,
                    'mtu': mtu
                }
                return True, "PPPoE configuration dry run completed", details
            
            # Use the enhanced connector for PPPoE configuration
            success, message, config_details = self.connector.configure_pppoe(
                service_name=service_name,
                bandwidth_limit=bandwidth_limit,
                mtu=mtu
            )
            
            details['configuration'] = config_details
            details['steps'] = config_details.get('configuration_steps', [])
            
            return success, message, details
            
        except Exception as e:
            logger.error(f"PPPoE configuration failed: {e}")
            return False, f"PPPoE configuration failed: {str(e)}", details
    
    def auto_setup_router(self, setup_type: str = "hotspot", router_name: str = "SurfZone-Router", 
                         template: str = None, dry_run: bool = False) -> Tuple[bool, str, Dict]:
        """
        Complete automated router setup based on specified type and template.
        
        Returns:
            tuple: (success, message, details)
        """
        details = {
            'setup_type': setup_type,
            'router_name': router_name,
            'template_used': template,
            'steps_completed': [],
            'dry_run': dry_run
        }
        
        try:
            # Step 1: Basic router setup
            success, message, basic_details = self.basic_router_setup(router_name, dry_run)
            if not success:
                return False, f"Basic setup failed: {message}", details
            
            details['basic_setup'] = basic_details
            details['steps_completed'].append('basic_setup')
            
            # Step 2: Service-specific setup
            if setup_type in ['hotspot', 'both']:
                ssid = f"{router_name}-WiFi"
                success, message, hotspot_details = self.configure_hotspot(ssid, template=template, dry_run=dry_run)
                if success:
                    details['hotspot_setup'] = hotspot_details
                    details['steps_completed'].append('hotspot_setup')
                elif setup_type == 'hotspot':
                    return False, f"Hotspot setup failed: {message}", details
            
            if setup_type in ['pppoe', 'both']:
                service_name = f"{router_name}-PPPoE"
                success, message, pppoe_details = self.configure_pppoe(service_name, template=template, dry_run=dry_run)
                if success:
                    details['pppoe_setup'] = pppoe_details
                    details['steps_completed'].append('pppoe_setup')
                elif setup_type == 'pppoe':
                    return False, f"PPPoE setup failed: {message}", details
            
            # Step 3: Final verification
            if not dry_run:
                verification = self.test_connection()
                details['final_verification'] = verification
                if verification.get('api_connection'):
                    details['steps_completed'].append('verification')
            
            return True, f"Auto setup completed for {setup_type}", details
            
        except Exception as e:
            logger.error(f"Auto setup failed: {e}")
            return False, f"Auto setup failed: {str(e)}", details
    
    def setup_hotspot_only(self, ssid: str = "SurfZone-WiFi", template: str = None, dry_run: bool = False):
        """Convenience method for hotspot-only setup."""
        return self.auto_setup_router("hotspot", ssid.replace('-WiFi', ''), template, dry_run)
    
    def setup_pppoe_only(self, service_name: str = "SurfZone-PPPoE", template: str = None, dry_run: bool = False):
        """Convenience method for PPPoE-only setup."""
        return self.auto_setup_router("pppoe", service_name.replace('-PPPoE', ''), template, dry_run)
    
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
                    'total_memory': system_info[0].get('total-memory', 'Unknown')
                }
            
            # Check services
            services = api.get_resource('/ip/service')
            service_list = services.get()
            diagnostics['services'] = {
                'api': any(s.get('name') == 'api' and s.get('disabled') == 'false' for s in service_list),
                'www': any(s.get('name') == 'www' and s.get('disabled') == 'false' for s in service_list),
                'ssh': any(s.get('name') == 'ssh' and s.get('disabled') == 'false' for s in service_list),
                'winbox': any(s.get('name') == 'winbox' and s.get('disabled') == 'false' for s in service_list)
            }
            
            # Check interfaces
            interfaces = api.get_resource('/interface')
            interface_list = interfaces.get()
            diagnostics['interfaces'] = {
                'total': len(interface_list),
                'wireless': len([i for i in interface_list if i.get('type') == 'wireless']),
                'ethernet': len([i for i in interface_list if i.get('type') == 'ether']),
                'bridge': len([i for i in interface_list if i.get('type') == 'bridge'])
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
        free_memory = int(diagnostics['system_health'].get('free_memory', 0))
        if free_memory < 16777216:  # 16MB
            diagnostics['recommendations'].append("Low memory detected - consider optimizing configurations")
        
        # Service recommendations
        if not diagnostics['services']['api']:
            diagnostics['recommendations'].append("Enable API service for remote management")
        
        if not diagnostics['services']['ssh']:
            diagnostics['recommendations'].append("Enable SSH service for secure command-line access")
        
        # Security recommendations
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
        try:
            if not backup_name:
                backup_name = f"backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            
            self.connect_ssh()
            command = f"/system backup save name={backup_name}"
            output, error = self.execute_ssh_command(command)
            
            if error and "already executing" not in error:
                return False, f"Backup failed: {error}"
            
            # Verify backup was created
            list_command = "/file print where name=~\"*.backup\""
            output, error = self.execute_ssh_command(list_command)
            
            if backup_name in output:
                return True, f"Backup created successfully: {backup_name}"
            else:
                return False, "Backup verification failed"
            
        except Exception as e:
            return False, f"Backup failed: {str(e)}"
        finally:
            self.disconnect()
    
    def restore_configuration(self, backup_name: str) -> Tuple[bool, str]:
        """Restore router configuration from backup."""
        try:
            self.connect_ssh()
            command = f"/system backup load name={backup_name}"
            output, error = self.execute_ssh_command(command)
            
            if error:
                return False, f"Restore failed: {error}"
            
            return True, f"Configuration restored from: {backup_name}"
            
        except Exception as e:
            return False, f"Restore failed: {str(e)}"
        finally:
            self.disconnect()
    
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
    parser.add_argument('--port', type=int, default=8728, help='API port')
    parser.add_argument('--ssh-port', type=int, default=22, help='SSH port')
    parser.add_argument('--action', 
                       choices=['test', 'setup', 'hotspot', 'pppoe', 'diagnose', 'backup', 'templates'], 
                       default='test', help='Action to perform')
    parser.add_argument('--setup-type', choices=['hotspot', 'pppoe', 'both'], 
                       default='hotspot', help='Setup type for auto setup')
    parser.add_argument('--router-name', default='SurfZone-Router', help='Router name')
    parser.add_argument('--template', help='Configuration template name')
    parser.add_argument('--ssid', help='WiFi SSID for hotspot setup')
    parser.add_argument('--service-name', help='PPPoE service name')
    parser.add_argument('--backup-name', help='Backup file name')
    parser.add_argument('--dry-run', action='store_true', help='Simulate without applying')
    parser.add_argument('--verbose', action='store_true', help='Enable verbose logging')
    
    args = parser.parse_args()
    
    # Configure logging
    log_level = logging.DEBUG if args.verbose else logging.INFO
    logging.basicConfig(level=log_level, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    
    # Create configurator instance
    configurator = MikroTikAutoConfig(
        args.host,
        args.username,
        args.password,
        args.port,
        args.ssh_port
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
            if results['errors']:
                print("Errors:", results['errors'])
            if results['warnings']:
                print("Warnings:", results['warnings'])
            
        elif args.action == 'setup':
            success, message, details = configurator.auto_setup_router(
                args.setup_type,
                args.router_name,
                args.template,
                args.dry_run
            )
            print(f"Success: {success}")
            print(f"Message: {message}")
            if args.verbose:
                print(f"Details: {json.dumps(details, indent=2)}")
            
        elif args.action == 'hotspot':
            ssid = args.ssid or f"{args.router_name}-WiFi"
            success, message, details = configurator.setup_hotspot_only(ssid, args.template, args.dry_run)
            print(f"Success: {success}")
            print(f"Message: {message}")
            if args.verbose:
                print(f"Details: {json.dumps(details, indent=2)}")
            
        elif args.action == 'pppoe':
            service_name = args.service_name or f"{args.router_name}-PPPoE"
            success, message, details = configurator.setup_pppoe_only(service_name, args.template, args.dry_run)
            print(f"Success: {success}")
            print(f"Message: {message}")
            if args.verbose:
                print(f"Details: {json.dumps(details, indent=2)}")
            
        elif args.action == 'diagnose':
            diagnostics = configurator.run_diagnostics()
            print("=== DIAGNOSTIC RESULTS ===")
            print(f"System Health: {diagnostics['system_health']}")
            print(f"Services: {diagnostics['services']}")
            print(f"Interfaces: {diagnostics['interfaces']}")
            if diagnostics['issues']:
                print(f"Issues: {diagnostics['issues']}")
            if diagnostics['recommendations']:
                print(f"Recommendations: {diagnostics['recommendations']}")
            
        elif args.action == 'backup':
            success, message = configurator.backup_configuration(args.backup_name)
            print(f"Backup: {'✅ SUCCESS' if success else '❌ FAILED'}")
            print(f"Message: {message}")
            
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