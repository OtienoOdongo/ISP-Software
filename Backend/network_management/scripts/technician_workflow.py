"""
SIMPLIFIED Technician Workflow Manager for SurfZone

Enhanced with simplified technician deployment workflows using authenticated users,
VPN setup automation, and production-ready reliability.
"""

import os
import sys
import logging
import json
from datetime import datetime
from typing import Dict, Tuple, Optional, Any, List

# Add the project root to Python path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath__file__)))

try:
    from network_management.scripts.mikrotik_auto_config import MikroTikAutoConfig
    from network_management.scripts.mikrotik_vpn_manager import MikroTikVPNManager
    from network_management.utils.mikrotik_connector import MikroTikConnector
    from network_management.models.router_management_model import Router, RouterAuditLog
except ImportError as e:
    print(f"Error: Required dependencies not installed: {e}")
    sys.exit(1)

logger = logging.getLogger(__name__)


class TechnicianWorkflowManager:
    """
    SIMPLIFIED technician workflow manager using authenticated users.
    Supports complete field deployment workflows with VPN integration.
    """
    
    def __init__(self, user, deployment_site: str):
        self.user = user  # Use Django user directly
        self.deployment_site = deployment_site
        self.workflow_steps = []
        
        # Simplified workflow templates
        self.workflow_templates = {
            'new_router_deployment': {
                'name': 'New Router Deployment',
                'description': 'Complete deployment of new MikroTik router',
                'steps': ['pre_deployment_check', 'basic_router_setup', 'service_configuration', 'verification']
            },
            'vpn_enablement': {
                'name': 'VPN Enablement', 
                'description': 'Add VPN configuration to existing router',
                'steps': ['pre_deployment_check', 'vpn_configuration', 'verification']
            },
            'troubleshooting': {
                'name': 'Router Troubleshooting',
                'description': 'Diagnose and fix router issues',
                'steps': ['connectivity_testing', 'diagnostics', 'configuration_repair', 'verification']
            }
        }
    
    def start_workflow(self, workflow_type: str, router_config: Dict) -> Tuple[bool, str, Dict]:
        """
        Start a technician workflow for router deployment.
        
        Returns:
            tuple: (success, message, workflow_details)
        """
        workflow_details = {
            'workflow_type': workflow_type,
            'technician': self.user.username,
            'deployment_site': self.deployment_site,
            'start_time': datetime.now().isoformat(),
            'steps_completed': [],
            'router_config': router_config
        }
        
        try:
            if workflow_type not in self.workflow_templates:
                return False, f"Unknown workflow type: {workflow_type}", workflow_details
            
            template = self.workflow_templates[workflow_type]
            workflow_details['workflow_name'] = template['name']
            
            logger.info(f"Starting {workflow_type} workflow for {self.user.username} at {self.deployment_site}")
            
            # Execute workflow steps
            for step in template['steps']:
                step_result = self.execute_workflow_step(step, router_config, workflow_details)
                
                if not step_result['success']:
                    workflow_details['failed_step'] = step
                    workflow_details['error_message'] = step_result['message']
                    return False, f"Workflow failed at step '{step}': {step_result['message']}", workflow_details
                
                workflow_details['steps_completed'].append({
                    'step': step,
                    'success': True,
                    'message': step_result['message'],
                    'details': step_result.get('details', {})
                })
            
            workflow_details['end_time'] = datetime.now().isoformat()
            workflow_details['status'] = 'completed'
            
            # Log successful workflow completion
            self.log_workflow_completion(workflow_details)
            
            return True, f"{workflow_type} workflow completed successfully", workflow_details
            
        except Exception as e:
            logger.error(f"Workflow failed: {str(e)}")
            workflow_details['end_time'] = datetime.now().isoformat()
            workflow_details['status'] = 'failed'
            workflow_details['error'] = str(e)
            return False, f"Workflow failed: {str(e)}", workflow_details
    
    def execute_workflow_step(self, step: str, router_config: Dict, workflow_details: Dict) -> Dict:
        """
        Execute a specific workflow step.
        
        Returns:
            dict: Step execution results
        """
        try:
            if step == 'pre_deployment_check':
                return self.pre_deployment_check(router_config)
            elif step == 'basic_router_setup':
                return self.basic_router_setup(router_config)
            elif step == 'vpn_configuration':
                return self.vpn_configuration(router_config)
            elif step == 'service_configuration':
                return self.service_configuration(router_config)
            elif step == 'connectivity_testing':
                return self.connectivity_testing(router_config)
            elif step == 'diagnostics':
                return self.run_diagnostics(router_config)
            elif step == 'configuration_repair':
                return self.configuration_repair(router_config)
            elif step == 'verification':
                return self.verification(router_config)
            else:
                return {
                    'success': False,
                    'message': f"Unknown workflow step: {step}"
                }
            
        except Exception as e:
            logger.error(f"Workflow step '{step}' failed: {str(e)}")
            return {
                'success': False,
                'message': f"Step execution failed: {str(e)}"
            }
    
    def pre_deployment_check(self, router_config: Dict) -> Dict:
        """Perform pre-deployment checks and validation."""
        check_results = {
            'success': True,
            'message': 'Pre-deployment checks passed',
            'details': {'checks_performed': [], 'warnings': [], 'errors': []}
        }
        
        try:
            # Validate required fields
            required_fields = ['host', 'username', 'password']
            for field in required_fields:
                if field not in router_config or not router_config[field]:
                    check_results['details']['errors'].append(f"Missing required field: {field}")
            
            if check_results['details']['errors']:
                check_results['success'] = False
                check_results['message'] = 'Configuration validation failed'
                return check_results
            
            # Test basic connectivity
            connector = MikroTikConnector(
                router_config['host'],
                router_config['username'], 
                router_config['password'],
                router_config.get('port', 8728)
            )
            
            test_results = connector.test_connection()
            check_results['details']['connectivity_test'] = test_results
            
            if not test_results.get('system_access'):
                check_results['details']['errors'].append('Router connectivity test failed')
                check_results['success'] = False
                check_results['message'] = 'Router is not accessible'
            else:
                check_results['details']['checks_performed'].append('connectivity_test_passed')
            
            return check_results
            
        except Exception as e:
            logger.error(f"Pre-deployment check failed: {str(e)}")
            return {
                'success': False,
                'message': f'Pre-deployment check failed: {str(e)}',
                'details': {'errors': [str(e)]}
            }
    
    def basic_router_setup(self, router_config: Dict) -> Dict:
        """Perform basic router setup and configuration."""
        try:
            auto_config = MikroTikAutoConfig(
                router_config['host'],
                router_config['username'],
                router_config['password'],
                router_config.get('port', 8728)
            )
            
            router_name = router_config.get('name', f"{self.deployment_site}-Router")
            success, message, details = auto_config.basic_router_setup(router_name)
            
            return {
                'success': success,
                'message': message,
                'details': details
            }
            
        except Exception as e:
            logger.error(f"Basic router setup failed: {str(e)}")
            return {
                'success': False,
                'message': f'Basic router setup failed: {str(e)}'
            }
    
    def vpn_configuration(self, router_config: Dict) -> Dict:
        """Configure VPN on the router."""
        try:
            vpn_manager = MikroTikVPNManager(
                router_config['host'],
                router_config['username'],
                router_config['password'],
                router_config.get('port', 8728)
            )
            
            vpn_type = router_config.get('vpn_type', 'openvpn')
            
            if vpn_type == 'openvpn':
                success, message, details = vpn_manager.configure_openvpn_server()
            elif vpn_type == 'wireguard':
                success, message, details = vpn_manager.configure_wireguard_server()
            elif vpn_type == 'sstp':
                success, message, details = vpn_manager.configure_sstp_server()
            else:
                return {
                    'success': False,
                    'message': f'Unsupported VPN type: {vpn_type}'
                }
            
            return {
                'success': success,
                'message': message,
                'details': details
            }
            
        except Exception as e:
            logger.error(f"VPN configuration failed: {str(e)}")
            return {
                'success': False,
                'message': f'VPN configuration failed: {str(e)}'
            }
    
    def service_configuration(self, router_config: Dict) -> Dict:
        """Configure hotspot and/or PPPoE services."""
        try:
            auto_config = MikroTikAutoConfig(
                router_config['host'],
                router_config['username'],
                router_config['password'],
                router_config.get('port', 8728)
            )
            
            setup_type = router_config.get('setup_type', 'hotspot')
            success, message, details = auto_config.auto_setup_router(setup_type)
            
            return {
                'success': success,
                'message': message,
                'details': details
            }
            
        except Exception as e:
            logger.error(f"Service configuration failed: {str(e)}")
            return {
                'success': False,
                'message': f'Service configuration failed: {str(e)}'
            }
    
    def connectivity_testing(self, router_config: Dict) -> Dict:
        """Perform comprehensive connectivity testing."""
        try:
            auto_config = MikroTikAutoConfig(
                router_config['host'],
                router_config['username'],
                router_config['password'],
                router_config.get('port', 8728)
            )
            
            connection_results = auto_config.test_connection()
            diagnostics = auto_config.run_diagnostics()
            
            test_results = {
                'basic_connectivity': connection_results,
                'diagnostics': diagnostics
            }
            
            all_tests_passed = connection_results.get('api_connection', False)
            
            return {
                'success': all_tests_passed,
                'message': 'Connectivity testing completed',
                'details': test_results
            }
            
        except Exception as e:
            logger.error(f"Connectivity testing failed: {str(e)}")
            return {
                'success': False,
                'message': f'Connectivity testing failed: {str(e)}'
            }
    
    def run_diagnostics(self, router_config: Dict) -> Dict:
        """Run comprehensive router diagnostics."""
        try:
            auto_config = MikroTikAutoConfig(
                router_config['host'],
                router_config['username'],
                router_config['password'],
                router_config.get('port', 8728)
            )
            
            diagnostics = auto_config.run_diagnostics()
            
            return {
                'success': True,
                'message': 'Diagnostics completed',
                'details': diagnostics
            }
            
        except Exception as e:
            logger.error(f"Diagnostics failed: {str(e)}")
            return {
                'success': False,
                'message': f'Diagnostics failed: {str(e)}'
            }
    
    def configuration_repair(self, router_config: Dict) -> Dict:
        """Repair router configuration issues."""
        try:
            auto_config = MikroTikAutoConfig(
                router_config['host'],
                router_config['username'],
                router_config['password'],
                router_config.get('port', 8728)
            )
            
            success, message, details = auto_config.basic_router_setup()
            
            return {
                'success': success,
                'message': message,
                'details': details
            }
            
        except Exception as e:
            logger.error(f"Configuration repair failed: {str(e)}")
            return {
                'success': False,
                'message': f'Configuration repair failed: {str(e)}'
            }
    
    def verification(self, router_config: Dict) -> Dict:
        """Verify router configuration and functionality."""
        try:
            connectivity_results = self.connectivity_testing(router_config)
            
            return {
                'success': connectivity_results['success'],
                'message': 'Verification completed',
                'details': connectivity_results['details']
            }
            
        except Exception as e:
            logger.error(f"Verification failed: {str(e)}")
            return {
                'success': False,
                'message': f'Verification failed: {str(e)}'
            }
    
    def log_workflow_completion(self, workflow_details: Dict):
        """Log workflow completion for audit purposes."""
        try:
            log_entry = {
                'timestamp': datetime.now().isoformat(),
                'technician': self.user.username,
                'deployment_site': self.deployment_site,
                'workflow_type': workflow_details['workflow_type'],
                'status': workflow_details['status'],
                'steps_completed': len(workflow_details['steps_completed']),
                'router_host': workflow_details['router_config']['host']
            }
            
            # Log to file
            log_file = '/var/log/technician_workflows.log'
            with open(log_file, 'a') as f:
                f.write(json.dumps(log_entry) + '\n')
            
            logger.info(f"Workflow completed: {workflow_details['workflow_type']} for {workflow_details['router_config']['host']}")
            
        except Exception as e:
            logger.warning(f"Failed to log workflow completion: {e}")


# Standalone script for testing
def main():
    """Standalone script for technician workflow testing."""
    import argparse
    
    parser = argparse.ArgumentParser(description='Technician Workflow Manager')
    parser.add_argument('--username', required=True, help='Technician username')
    parser.add_argument('--site', required=True, help='Deployment site name')
    parser.add_argument('--workflow-type', choices=['new_router_deployment', 'vpn_enablement', 'troubleshooting'], required=True)
    parser.add_argument('--router-host', required=True, help='Router IP address')
    parser.add_argument('--router-username', required=True, help='Router username')
    parser.add_argument('--router-password', required=True, help='Router password')
    parser.add_argument('--router-port', type=int, default=8728, help='Router API port')
    parser.add_argument('--verbose', action='store_true', help='Enable verbose logging')
    
    args = parser.parse_args()
    
    # Configure logging
    log_level = logging.DEBUG if args.verbose else logging.INFO
    logging.basicConfig(level=log_level, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    
    # Create a mock user object
    class MockUser:
        def __init__(self, username):
            self.username = username
    
    mock_user = MockUser(args.username)
    
    router_config = {
        'host': args.router_host,
        'username': args.router_username,
        'password': args.router_password,
        'port': args.router_port,
        'vpn_type': 'openvpn',
        'setup_type': 'hotspot'
    }
    
    workflow_manager = TechnicianWorkflowManager(mock_user, args.site)
    success, message, details = workflow_manager.start_workflow(args.workflow_type, router_config)
    
    print(f"Workflow: {'✅ COMPLETED' if success else '❌ FAILED'}")
    print(f"Message: {message}")
    print(f"Steps Completed: {len(details.get('steps_completed', []))}")
    
    if args.verbose:
        print(f"Details: {json.dumps(details, indent=2)}")


if __name__ == "__main__":
    main()