#!/usr/bin/env python3
"""
MikroTik Router Connection Tester Script

Standalone script for testing MikroTik router connections and basic functionality.
Can be used independently or integrated with the main application.
"""

import sys
import json
import argparse
import logging
from routeros_api import RouterOsApiPool
from routeros_api.exceptions import RouterOsApiConnectionError, RouterOsApiCommunicationError

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class RouterConnectionTester:
    """
    Comprehensive MikroTik router connection tester with detailed diagnostics.
    """
    
    def __init__(self, host, username, password, port=8728, timeout=10):
        self.host = host
        self.username = username
        self.password = password
        self.port = port
        self.timeout = timeout
        self.api_pool = None
        self.api = None
    
    def test_connection(self):
        """
        Perform comprehensive connection test with detailed diagnostics.
        
        Returns:
            dict: Comprehensive test results
        """
        results = {
            'host': self.host,
            'port': self.port,
            'timestamp': self._get_timestamp(),
            'basic_connectivity': False,
            'api_connection': False,
            'authentication': False,
            'system_access': False,
            'response_time': None,
            'system_info': {},
            'capabilities': {},
            'error_messages': [],
            'recommendations': []
        }
        
        import time
        start_time = time.time()
        
        # Test 1: Basic network connectivity
        try:
            import socket
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(self.timeout)
            result = sock.connect_ex((self.host, self.port))
            sock.close()
            results['basic_connectivity'] = (result == 0)
            
            if not results['basic_connectivity']:
                results['error_messages'].append("Network connectivity test failed")
                results['recommendations'].append("Check network connectivity and firewall rules")
                return results
                
        except Exception as e:
            results['error_messages'].append(f"Connectivity test error: {str(e)}")
            return results
        
        # Test 2: API Connection
        try:
            self.api_pool = RouterOsApiPool(
                self.host,
                username=self.username,
                password=self.password,
                port=self.port,
                plaintext_login=True,
                timeout=self.timeout
            )
            self.api = self.api_pool.get_api()
            results['api_connection'] = True
            results['authentication'] = True
            
        except RouterOsApiConnectionError as e:
            results['error_messages'].append(f"API Connection failed: {str(e)}")
            results['recommendations'].append("Check if API service is enabled on the router")
            return results
        except RouterOsApiCommunicationError as e:
            results['error_messages'].append(f"Authentication failed: {str(e)}")
            results['api_connection'] = True  # Connection worked, auth failed
            results['recommendations'].append("Verify username and password")
            return results
        except Exception as e:
            results['error_messages'].append(f"Unexpected connection error: {str(e)}")
            return results
        
        # Test 3: System Access and Information
        try:
            # Get system resource information
            system_resource = self.api.get_resource('/system/resource')
            system_info = system_resource.get()
            
            if system_info:
                results['system_access'] = True
                results['system_info'] = system_info[0]
                
                # Determine capabilities
                results['capabilities'] = self._determine_capabilities(system_info[0])
                
                # Get additional system information
                self._get_additional_info(results)
            
            # Calculate response time
            results['response_time'] = time.time() - start_time
            
            # Generate recommendations based on findings
            self._generate_recommendations(results)
            
        except Exception as e:
            results['error_messages'].append(f"System access failed: {str(e)}")
        finally:
            if self.api_pool:
                try:
                    self.api_pool.disconnect()
                except:
                    pass
        
        return results
    
    def _determine_capabilities(self, system_info):
        """Determine router capabilities based on system information."""
        capabilities = {
            'hotspot_support': True,  # Most MikroTik routers support hotspot
            'pppoe_support': True,    # Most support PPPoE server
            'wireless_support': False,
            'advanced_qos': False,
            'vlan_support': True,
            'bridge_support': True
        }
        
        model = system_info.get('board-name', '').lower()
        architecture = system_info.get('architecture', '').lower()
        
        # Check for wireless capabilities
        if any(wireless_indicator in model for wireless_indicator in 
               ['rb', 'sxt', 'lhg', 'wif', 'audience', 'cap']):
            capabilities['wireless_support'] = True
        
        # Check for advanced features
        if any(advanced_indicator in model for advanced_indicator in
               ['ccr', 'rb4011', 'rb5009', 'chateau', 'ltap']):
            capabilities['advanced_qos'] = True
            capabilities['advanced_routing'] = True
        
        return capabilities
    
    def _get_additional_info(self, results):
        """Get additional router information."""
        try:
            # Get interface information
            interfaces = self.api.get_resource('/interface')
            interface_list = interfaces.get()
            results['interface_count'] = len(interface_list)
            
            # Get wireless information if available
            try:
                wireless = self.api.get_resource('/interface/wireless')
                wireless_list = wireless.get()
                results['wireless_interfaces'] = len(wireless_list)
            except:
                results['wireless_interfaces'] = 0
            
            # Check existing configurations
            try:
                hotspot_servers = self.api.get_resource('/ip/hotspot')
                results['hotspot_configured'] = len(hotspot_servers.get()) > 0
            except:
                results['hotspot_configured'] = False
            
            try:
                pppoe_servers = self.api.get_resource('/interface/pppoe-server/server')
                results['pppoe_configured'] = len(pppoe_servers.get()) > 0
            except:
                results['pppoe_configured'] = False
                
        except Exception as e:
            logger.warning(f"Could not get additional info: {str(e)}")
    
    def _generate_recommendations(self, results):
        """Generate recommendations based on test results."""
        if not results['system_access']:
            return
        
        # Memory recommendations
        free_memory = int(results['system_info'].get('free-memory', 0))
        if free_memory < 33554432:  # 32MB
            results['recommendations'].append("Consider upgrading router memory for better performance")
        
        # Configuration recommendations based on capabilities
        if results['capabilities']['wireless_support'] and not results['hotspot_configured']:
            results['recommendations'].append("Router supports wireless - consider configuring hotspot")
        
        if results['capabilities']['pppoe_support'] and not results['pppoe_configured']:
            results['recommendations'].append("Router supports PPPoE - consider configuring PPPoE server")
        
        # Performance recommendations
        if results['response_time'] > 2.0:
            results['recommendations'].append("High response time detected - check network latency")
    
    def _get_timestamp(self):
        """Get current timestamp in ISO format."""
        from datetime import datetime
        return datetime.now().isoformat()
    
    def quick_test(self):
        """
        Perform quick connection test for basic validation.
        
        Returns:
            tuple: (success: bool, message: str)
        """
        try:
            self.api_pool = RouterOsApiPool(
                self.host,
                username=self.username,
                password=self.password,
                port=self.port,
                plaintext_login=True,
                timeout=5
            )
            self.api = self.api_pool.get_api()
            
            # Quick system resource check
            system_resource = self.api.get_resource('/system/resource')
            system_info = system_resource.get()
            
            self.api_pool.disconnect()
            
            if system_info:
                return True, "Connection successful"
            else:
                return False, "No system information received"
                
        except RouterOsApiConnectionError as e:
            return False, f"Connection failed: {str(e)}"
        except RouterOsApiCommunicationError as e:
            return False, f"Authentication failed: {str(e)}"
        except Exception as e:
            return False, f"Unexpected error: {str(e)}"


def main():
    """Standalone script execution."""
    parser = argparse.ArgumentParser(description='MikroTik Router Connection Tester')
    parser.add_argument('--host', required=True, help='Router IP address')
    parser.add_argument('--username', required=True, help='Router username')
    parser.add_argument('--password', required=True, help='Router password')
    parser.add_argument('--port', type=int, default=8728, help='API port')
    parser.add_argument('--timeout', type=int, default=10, help='Connection timeout')
    parser.add_argument('--quick', action='store_true', help='Perform quick test only')
    parser.add_argument('--output', choices=['json', 'text'], default='text', help='Output format')
    
    args = parser.parse_args()
    
    # Create tester instance
    tester = RouterConnectionTester(
        args.host,
        args.username,
        args.password,
        args.port,
        args.timeout
    )
    
    try:
        if args.quick:
            success, message = tester.quick_test()
            if args.output == 'json':
                print(json.dumps({'success': success, 'message': message}, indent=2))
            else:
                status = "✅ SUCCESS" if success else "❌ FAILED"
                print(f"{status}: {message}")
        else:
            results = tester.test_connection()
            if args.output == 'json':
                print(json.dumps(results, indent=2))
            else:
                print("\n" + "="*50)
                print("MIKROTIK ROUTER CONNECTION TEST RESULTS")
                print("="*50)
                
                print(f"\n📡 Basic Information:")
                print(f"  Host: {results['host']}:{results['port']}")
                print(f"  Timestamp: {results['timestamp']}")
                
                print(f"\n🔌 Connection Tests:")
                print(f"  Network Connectivity: {'✅' if results['basic_connectivity'] else '❌'}")
                print(f"  API Connection: {'✅' if results['api_connection'] else '❌'}")
                print(f"  Authentication: {'✅' if results['authentication'] else '❌'}")
                print(f"  System Access: {'✅' if results['system_access'] else '❌'}")
                print(f"  Response Time: {results['response_time']:.3f}s" if results['response_time'] else 'N/A')
                
                if results['system_info']:
                    print(f"\n💻 System Information:")
                    print(f"  Model: {results['system_info'].get('board-name', 'Unknown')}")
                    print(f"  Version: {results['system_info'].get('version', 'Unknown')}")
                    print(f"  Architecture: {results['system_info'].get('architecture', 'Unknown')}")
                    print(f"  CPU Load: {results['system_info'].get('cpu-load', 'Unknown')}%")
                    print(f"  Uptime: {results['system_info'].get('uptime', 'Unknown')}")
                
                if results['capabilities']:
                    print(f"\n🎯 Router Capabilities:")
                    for capability, supported in results['capabilities'].items():
                        status = '✅' if supported else '❌'
                        print(f"  {capability.replace('_', ' ').title()}: {status}")
                
                if results['error_messages']:
                    print(f"\n❌ Errors:")
                    for error in results['error_messages']:
                        print(f"  - {error}")
                
                if results['recommendations']:
                    print(f"\n💡 Recommendations:")
                    for recommendation in results['recommendations']:
                        print(f"  - {recommendation}")
                
                print("\n" + "="*50)
    
    except KeyboardInterrupt:
        print("\n⚠️  Test interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Script error: {str(e)}")
        sys.exit(1)


if __name__ == "__main__":
    main()