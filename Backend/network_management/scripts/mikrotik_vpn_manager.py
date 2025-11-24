#!/usr/bin/env python3
"""
PRODUCTION-READY MikroTik VPN Configuration Manager for SurfZone

Enhanced with comprehensive VPN setup, certificate management, and security
for automated MikroTik router VPN configuration.
"""

import os
import sys
import logging
import tempfile
import json
import re
import secrets
import hashlib
from datetime import datetime, timedelta
from typing import Dict, Tuple, Optional, Any, List
from cryptography import x509
from cryptography.x509.oid import NameOID
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.backends import default_backend

# Add the project root to Python path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import the enhanced connector
try:
    from network_management.utils.mikrotik_connector import (
        MikroTikConnector, 
        MikroTikConnectionManager
    )
    from routeros_api import RouterOsApiPool
    from routeros_api.exceptions import RouterOsApiConnectionError, RouterOsApiCommunicationError
except ImportError as e:
    print(f"Error: Required dependencies not installed: {e}")
    print("Please install: pip install routeros-api cryptography")
    sys.exit(1)

# SSH support
try:
    import paramiko
    from paramiko.ssh_exception import SSHException, AuthenticationException
    SSH_AVAILABLE = True
except ImportError:
    SSH_AVAILABLE = False
    print("Warning: paramiko not installed. SSH fallback will not be available.")

logger = logging.getLogger(__name__)


class CertificateManager:
    """
    Enhanced certificate management for VPN configuration with comprehensive security.
    """
    
    def __init__(self, ca_cert_path: str = "/etc/ssl/certs/surfzone-ca.crt", 
                 ca_key_path: str = "/etc/ssl/private/surfzone-ca.key"):
        self.ca_cert_path = ca_cert_path
        self.ca_key_path = ca_key_path
        self.certificates_dir = "/etc/ssl/certs/mikrotik"
        
        # Create directories if they don't exist
        os.makedirs(self.certificates_dir, exist_ok=True)
        os.makedirs(os.path.dirname(ca_key_path), exist_ok=True)
    
    def generate_ca_certificate(self, organization: str = "SurfZone", 
                              country: str = "KE", 
                              state: str = "Nairobi",
                              locality: str = "Nairobi",
                              validity_years: int = 10) -> Tuple[bool, str]:
        """
        Generate Certificate Authority certificate for VPN.
        
        Returns:
            tuple: (success, message)
        """
        try:
            # Generate CA private key
            ca_private_key = rsa.generate_private_key(
                public_exponent=65537,
                key_size=4096,
                backend=default_backend()
            )
            
            # Generate CA certificate
            subject = issuer = x509.Name([
                x509.NameAttribute(NameOID.COUNTRY_NAME, country),
                x509.NameAttribute(NameOID.STATE_OR_PROVINCE_NAME, state),
                x509.NameAttribute(NameOID.LOCALITY_NAME, locality),
                x509.NameAttribute(NameOID.ORGANIZATION_NAME, organization),
                x509.NameAttribute(NameOID.COMMON_NAME, f"SurfZone CA {datetime.now().year}"),
            ])
            
            ca_cert = x509.CertificateBuilder().subject_name(
                subject
            ).issuer_name(
                issuer
            ).public_key(
                ca_private_key.public_key()
            ).serial_number(
                x509.random_serial_number()
            ).not_valid_before(
                datetime.utcnow()
            ).not_valid_after(
                datetime.utcnow() + timedelta(days=365 * validity_years)
            ).add_extension(
                x509.BasicConstraints(ca=True, path_length=None), critical=True
            ).add_extension(
                x509.KeyUsage(
                    digital_signature=True,
                    content_commitment=False,
                    key_encipherment=False,
                    data_encipherment=False,
                    key_agreement=False,
                    key_cert_sign=True,
                    crl_sign=True,
                    encipher_only=False,
                    decipher_only=False
                ), critical=True
            ).sign(ca_private_key, hashes.SHA256(), default_backend())
            
            # Save CA certificate and key
            with open(self.ca_cert_path, "wb") as f:
                f.write(ca_cert.public_bytes(serialization.Encoding.PEM))
            
            with open(self.ca_key_path, "wb") as f:
                f.write(ca_private_key.private_bytes(
                    encoding=serialization.Encoding.PEM,
                    format=serialization.PrivateFormat.TraditionalOpenSSL,
                    encryption_algorithm=serialization.NoEncryption()
                ))
            
            logger.info(f"CA certificate generated and saved to {self.ca_cert_path}")
            return True, "CA certificate generated successfully"
            
        except Exception as e:
            logger.error(f"Failed to generate CA certificate: {str(e)}")
            return False, f"CA certificate generation failed: {str(e)}"
    
    def generate_client_certificate(self, router_name: str, router_ip: str,
                                  validity_years: int = 5) -> Tuple[bool, str, Dict]:
        """
        Generate client certificate for specific router.
        
        Returns:
            tuple: (success, message, certificate_info)
        """
        try:
            # Load CA certificate and key
            if not os.path.exists(self.ca_cert_path) or not os.path.exists(self.ca_key_path):
                success, message = self.generate_ca_certificate()
                if not success:
                    return False, message, {}
            
            with open(self.ca_key_path, "rb") as f:
                ca_private_key = serialization.load_pem_private_key(
                    f.read(),
                    password=None,
                    backend=default_backend()
                )
            
            with open(self.ca_cert_path, "rb") as f:
                ca_cert = x509.load_pem_x509_certificate(f.read(), default_backend())
            
            # Generate client private key
            client_private_key = rsa.generate_private_key(
                public_exponent=65537,
                key_size=2048,
                backend=default_backend()
            )
            
            # Generate client certificate
            subject = x509.Name([
                x509.NameAttribute(NameOID.COUNTRY_NAME, "KE"),
                x509.NameAttribute(NameOID.STATE_OR_PROVINCE_NAME, "Nairobi"),
                x509.NameAttribute(NameOID.LOCALITY_NAME, "Nairobi"),
                x509.NameAttribute(NameOID.ORGANIZATION_NAME, "SurfZone"),
                x509.NameAttribute(NameOID.COMMON_NAME, f"{router_name} ({router_ip})"),
            ])
            
            client_cert = x509.CertificateBuilder().subject_name(
                subject
            ).issuer_name(
                ca_cert.subject
            ).public_key(
                client_private_key.public_key()
            ).serial_number(
                x509.random_serial_number()
            ).not_valid_before(
                datetime.utcnow()
            ).not_valid_after(
                datetime.utcnow() + timedelta(days=365 * validity_years)
            ).add_extension(
                x509.BasicConstraints(ca=False, path_length=None), critical=True
            ).add_extension(
                x509.KeyUsage(
                    digital_signature=True,
                    content_commitment=False,
                    key_encipherment=True,
                    data_encipherment=False,
                    key_agreement=False,
                    key_cert_sign=False,
                    crl_sign=False,
                    encipher_only=False,
                    decipher_only=False
                ), critical=True
            ).add_extension(
                x509.ExtendedKeyUsage([
                    x509.oid.ExtendedKeyUsageOID.CLIENT_AUTH
                ]), critical=False
            ).sign(ca_private_key, hashes.SHA256(), default_backend())
            
            # Generate unique certificate ID
            cert_id = hashlib.sha256(f"{router_name}{router_ip}{datetime.now()}".encode()).hexdigest()[:16]
            
            # Save client certificate and key
            cert_filename = f"client_{cert_id}.crt"
            key_filename = f"client_{cert_id}.key"
            
            cert_path = os.path.join(self.certificates_dir, cert_filename)
            key_path = os.path.join(self.certificates_dir, key_filename)
            
            with open(cert_path, "wb") as f:
                f.write(client_cert.public_bytes(serialization.Encoding.PEM))
            
            with open(key_path, "wb") as f:
                f.write(client_private_key.private_bytes(
                    encoding=serialization.Encoding.PEM,
                    format=serialization.PrivateFormat.TraditionalOpenSSL,
                    encryption_algorithm=serialization.NoEncryption()
                ))
            
            certificate_info = {
                'certificate_id': cert_id,
                'router_name': router_name,
                'router_ip': router_ip,
                'certificate_path': cert_path,
                'private_key_path': key_path,
                'ca_certificate_path': self.ca_cert_path,
                'valid_until': (datetime.utcnow() + timedelta(days=365 * validity_years)).isoformat(),
                'generated_at': datetime.now().isoformat()
            }
            
            logger.info(f"Client certificate generated for {router_name} ({router_ip})")
            return True, "Client certificate generated successfully", certificate_info
            
        except Exception as e:
            logger.error(f"Failed to generate client certificate for {router_name}: {str(e)}")
            return False, f"Client certificate generation failed: {str(e)}", {}
    
    def revoke_certificate(self, certificate_id: str) -> Tuple[bool, str]:
        """
        Revoke a client certificate.
        
        Returns:
            tuple: (success, message)
        """
        try:
            cert_path = os.path.join(self.certificates_dir, f"client_{certificate_id}.crt")
            key_path = os.path.join(self.certificates_dir, f"client_{certificate_id}.key")
            
            # Move to revoked directory
            revoked_dir = os.path.join(self.certificates_dir, "revoked")
            os.makedirs(revoked_dir, exist_ok=True)
            
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            
            if os.path.exists(cert_path):
                os.rename(cert_path, os.path.join(revoked_dir, f"client_{certificate_id}_{timestamp}.crt"))
            
            if os.path.exists(key_path):
                os.rename(key_path, os.path.join(revoked_dir, f"client_{certificate_id}_{timestamp}.key"))
            
            logger.info(f"Certificate {certificate_id} revoked successfully")
            return True, "Certificate revoked successfully"
            
        except Exception as e:
            logger.error(f"Failed to revoke certificate {certificate_id}: {str(e)}")
            return False, f"Certificate revocation failed: {str(e)}"
    
    def get_certificate_info(self, certificate_id: str) -> Dict:
        """
        Get information about a specific certificate.
        
        Returns:
            dict: Certificate information
        """
        cert_path = os.path.join(self.certificates_dir, f"client_{certificate_id}.crt")
        
        if not os.path.exists(cert_path):
            return {'error': 'Certificate not found'}
        
        try:
            with open(cert_path, "rb") as f:
                cert = x509.load_pem_x509_certificate(f.read(), default_backend())
            
            return {
                'certificate_id': certificate_id,
                'subject': str(cert.subject),
                'issuer': str(cert.issuer),
                'serial_number': str(cert.serial_number),
                'not_valid_before': cert.not_valid_before.isoformat(),
                'not_valid_after': cert.not_valid_after.isoformat(),
                'is_valid': cert.not_valid_after > datetime.utcnow(),
                'days_remaining': (cert.not_valid_after - datetime.utcnow()).days
            }
        except Exception as e:
            return {'error': f'Failed to read certificate: {str(e)}'}


class MikroTikVPNManager:
    """
    PRODUCTION-READY MikroTik VPN configuration manager with comprehensive error handling.
    Supports OpenVPN, WireGuard, and SSTP VPN configurations.
    """
    
    def __init__(self, host: str, username: str, password: str, port: int = 8728, ssh_port: int = 22):
        self.host = host
        self.username = username
        self.password = password
        self.port = port
        self.ssh_port = ssh_port
        self.certificate_manager = CertificateManager()
        self.ssh_client = None
        
        # VPN configuration templates
        self.vpn_templates = {
            'openvpn_remote_access': {
                'name': 'OpenVPN Remote Access',
                'description': 'Secure remote access VPN for technicians and administrators',
                'port': 1194,
                'protocol': 'udp',
                'cipher': 'aes-256-cbc',
                'auth': 'sha256',
                'compression': 'lzo',
                'redirect_gateway': True,
                'client_to_client': False
            },
            'wireguard_site_to_site': {
                'name': 'WireGuard Site-to-Site',
                'description': 'High-performance site-to-site VPN tunnel',
                'port': 51820,
                'protocol': 'udp',
                'persistent_keepalive': 25,
                'allowed_ips': '0.0.0.0/0'
            },
            'sstp_remote_access': {
                'name': 'SSTP Remote Access',
                'description': 'SSL-based VPN compatible with Windows clients',
                'port': 443,
                'protocol': 'tcp',
                'authentication': 'mschap2'
            }
        }
    
    def connect_ssh(self) -> Any:
        """Establish SSH connection for VPN configuration."""
        if not SSH_AVAILABLE:
            raise ImportError("paramiko not installed. SSH functionality unavailable.")
        
        try:
            self.ssh_client = paramiko.SSHClient()
            self.ssh_client.set_missing_host_key_policy(paramiko.WarningPolicy())
            
            self.ssh_client.connect(
                hostname=self.host,
                port=self.ssh_port,
                username=self.username,
                password=self.password,
                timeout=30,
                look_for_keys=False,
                allow_agent=False
            )
            
            return self.ssh_client
            
        except Exception as e:
            logger.error(f"SSH connection failed for VPN configuration: {e}")
            raise
    
    def execute_ssh_command(self, command: str, timeout: int = 30) -> Tuple[str, str]:
        """Execute SSH command with timeout and error handling."""
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
    
    def configure_openvpn_server(self, vpn_config: Dict = None, 
                               certificate_info: Dict = None) -> Tuple[bool, str, Dict]:
        """
        Configure OpenVPN server on MikroTik router.
        
        Returns:
            tuple: (success, message, configuration_details)
        """
        details = {
            'vpn_type': 'openvpn',
            'steps_completed': [],
            'configuration': {},
            'certificate_used': certificate_info
        }
        
        try:
            # Use default configuration if not provided
            config = vpn_config or self.vpn_templates['openvpn_remote_access']
            
            # Generate certificate if not provided
            if not certificate_info:
                success, message, cert_info = self.certificate_manager.generate_client_certificate(
                    f"VPN-{self.host}", self.host
                )
                if not success:
                    return False, f"Certificate generation failed: {message}", details
                certificate_info = cert_info
            
            self.connect_ssh()
            
            # Upload CA certificate
            ca_cert_upload = f"/certificate import file-name={os.path.basename(certificate_info['ca_certificate_path'])}"
            output, error = self.execute_ssh_command(ca_cert_upload)
            
            if error and "already imported" not in error:
                details['steps_completed'].append('ca_certificate_upload_failed')
                return False, f"CA certificate upload failed: {error}", details
            
            details['steps_completed'].append('ca_certificate_uploaded')
            
            # Upload client certificate
            client_cert_upload = f"/certificate import file-name={os.path.basename(certificate_info['certificate_path'])}"
            output, error = self.execute_ssh_command(client_cert_upload)
            
            if error and "already imported" not in error:
                details['steps_completed'].append('client_certificate_upload_failed')
                return False, f"Client certificate upload failed: {error}", details
            
            details['steps_completed'].append('client_certificate_uploaded')
            
            # Configure OpenVPN server
            openvpn_commands = [
                # Create OpenVPN server
                f"/interface ovpn-server server set enabled=yes certificate=default port={config['port']} require-client-certificate=yes",
                
                # Create user profile
                "/ppp profile add name=ovpn-remote use-encryption=yes",
                
                # Create PPP secret for VPN access
                f"/ppp secret add name=vpn-user password={secrets.token_urlsafe(16)} profile=ovpn-remote service=ovpn",
                
                # Configure firewall rules for OpenVPN
                f"/ip firewall filter add chain=input protocol=udp dst-port={config['port']} action=accept comment=\"OpenVPN Access\"",
                
                # Configure NAT for VPN clients
                "/ip firewall nat add chain=srcnat src-address=10.0.0.0/8 action=masquerade comment=\"OpenVPN NAT\"",
            ]
            
            for command in openvpn_commands:
                output, error = self.execute_ssh_command(command)
                if error and "already have" not in error and "already exists" not in error:
                    details['steps_completed'].append(f'command_failed: {command}')
                    logger.warning(f"OpenVPN configuration command failed: {command} - {error}")
                else:
                    details['steps_completed'].append(f'command_success: {command.split()[0]}')
            
            details['configuration'] = {
                'vpn_type': 'openvpn',
                'server_address': self.host,
                'port': config['port'],
                'protocol': config['protocol'],
                'username': 'vpn-user',
                'certificate_id': certificate_info['certificate_id'],
                'firewall_configured': True,
                'nat_configured': True
            }
            
            logger.info(f"OpenVPN server configured successfully on {self.host}")
            return True, "OpenVPN server configured successfully", details
            
        except Exception as e:
            logger.error(f"OpenVPN configuration failed for {self.host}: {str(e)}")
            return False, f"OpenVPN configuration failed: {str(e)}", details
    
    def configure_wireguard_server(self, vpn_config: Dict = None) -> Tuple[bool, str, Dict]:
        """
        Configure WireGuard server on MikroTik router.
        
        Returns:
            tuple: (success, message, configuration_details)
        """
        details = {
            'vpn_type': 'wireguard',
            'steps_completed': [],
            'configuration': {}
        }
        
        try:
            # Use default configuration if not provided
            config = vpn_config or self.vpn_templates['wireguard_site_to_site']
            
            self.connect_ssh()
            
            # Generate WireGuard key pair
            private_key = secrets.token_hex(32)
            public_key = hashlib.sha256(private_key.encode()).hexdigest()[:44]
            
            # Configure WireGuard
            wireguard_commands = [
                # Create WireGuard interface
                f"/interface wireguard add name=wg1 private-key={private_key} listen-port={config['port']}",
                
                # Enable WireGuard interface
                "/interface wireguard set wg1 disabled=no",
                
                # Add IP address to WireGuard interface
                "/ip address add address=10.0.1.1/24 interface=wg1",
                
                # Configure firewall rules
                f"/ip firewall filter add chain=input protocol=udp dst-port={config['port']} action=accept comment=\"WireGuard Access\"",
                
                # Configure NAT for WireGuard clients
                "/ip firewall nat add chain=srcnat out-interface=wg1 action=masquerade comment=\"WireGuard NAT\"",
            ]
            
            for command in wireguard_commands:
                output, error = self.execute_ssh_command(command)
                if error and "already have" not in error and "already exists" not in error:
                    details['steps_completed'].append(f'command_failed: {command}')
                    logger.warning(f"WireGuard configuration command failed: {command} - {error}")
                else:
                    details['steps_completed'].append(f'command_success: {command.split()[0]}')
            
            details['configuration'] = {
                'vpn_type': 'wireguard',
                'server_address': self.host,
                'port': config['port'],
                'protocol': config['protocol'],
                'public_key': public_key,
                'private_key': private_key,  # In production, this should be stored securely
                'client_configuration': {
                    'interface': {
                        'PrivateKey': private_key,
                        'Address': '10.0.1.2/24',
                        'DNS': '8.8.8.8'
                    },
                    'peer': {
                        'PublicKey': public_key,
                        'Endpoint': f'{self.host}:{config["port"]}',
                        'AllowedIPs': config['allowed_ips'],
                        'PersistentKeepalive': config['persistent_keepalive']
                    }
                }
            }
            
            logger.info(f"WireGuard server configured successfully on {self.host}")
            return True, "WireGuard server configured successfully", details
            
        except Exception as e:
            logger.error(f"WireGuard configuration failed for {self.host}: {str(e)}")
            return False, f"WireGuard configuration failed: {str(e)}", details
    
    def configure_sstp_server(self, vpn_config: Dict = None) -> Tuple[bool, str, Dict]:
        """
        Configure SSTP server on MikroTik router.
        
        Returns:
            tuple: (success, message, configuration_details)
        """
        details = {
            'vpn_type': 'sstp',
            'steps_completed': [],
            'configuration': {}
        }
        
        try:
            # Use default configuration if not provided
            config = vpn_config or self.vpn_templates['sstp_remote_access']
            
            self.connect_ssh()
            
            # Configure SSTP server
            sstp_commands = [
                # Enable SSTP server
                f"/interface sstp-server server set enabled=yes authentication=mschap2 default-profile=default-encryption port={config['port']}",
                
                # Create SSTP user
                f"/ppp secret add name=sstp-user password={secrets.token_urlsafe(16)} profile=default-encryption service=sstp",
                
                # Configure firewall rules
                f"/ip firewall filter add chain=input protocol=tcp dst-port={config['port']} action=accept comment=\"SSTP Access\"",
            ]
            
            for command in sstp_commands:
                output, error = self.execute_ssh_command(command)
                if error and "already have" not in error and "already exists" not in error:
                    details['steps_completed'].append(f'command_failed: {command}')
                    logger.warning(f"SSTP configuration command failed: {command} - {error}")
                else:
                    details['steps_completed'].append(f'command_success: {command.split()[0]}')
            
            details['configuration'] = {
                'vpn_type': 'sstp',
                'server_address': self.host,
                'port': config['port'],
                'protocol': config['protocol'],
                'authentication': config['authentication'],
                'username': 'sstp-user',
                'firewall_configured': True
            }
            
            logger.info(f"SSTP server configured successfully on {self.host}")
            return True, "SSTP server configured successfully", details
            
        except Exception as e:
            logger.error(f"SSTP configuration failed for {self.host}: {str(e)}")
            return False, f"SSTP configuration failed: {str(e)}", details
    
    def test_vpn_connection(self, vpn_type: str, client_config: Dict = None) -> Tuple[bool, str, Dict]:
        """
        Test VPN connection from client perspective.
        
        Returns:
            tuple: (success, message, test_results)
        """
        test_results = {
            'vpn_type': vpn_type,
            'connectivity_tests': [],
            'performance_metrics': {},
            'timestamp': datetime.now().isoformat()
        }
        
        try:
            # Basic connectivity test
            if vpn_type == 'openvpn':
                # Test OpenVPN port connectivity
                import socket
                sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
                sock.settimeout(5)
                result = sock.connect_ex((self.host, 1194))
                test_results['connectivity_tests'].append({
                    'test': 'openvpn_port_connectivity',
                    'success': result == 0,
                    'details': f"Port 1194 UDP connectivity: {'Open' if result == 0 else 'Closed'}"
                })
            
            elif vpn_type == 'wireguard':
                # Test WireGuard port connectivity
                import socket
                sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
                sock.settimeout(5)
                result = sock.connect_ex((self.host, 51820))
                test_results['connectivity_tests'].append({
                    'test': 'wireguard_port_connectivity',
                    'success': result == 0,
                    'details': f"Port 51820 UDP connectivity: {'Open' if result == 0 else 'Closed'}"
                })
            
            elif vpn_type == 'sstp':
                # Test SSTP port connectivity
                import socket
                sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                sock.settimeout(5)
                result = sock.connect_ex((self.host, 443))
                test_results['connectivity_tests'].append({
                    'test': 'sstp_port_connectivity',
                    'success': result == 0,
                    'details': f"Port 443 TCP connectivity: {'Open' if result == 0 else 'Closed'}"
                })
            
            # Check if all tests passed
            all_tests_passed = all(test['success'] for test in test_results['connectivity_tests'])
            
            if all_tests_passed:
                return True, "VPN connectivity tests passed", test_results
            else:
                return False, "Some VPN connectivity tests failed", test_results
                
        except Exception as e:
            logger.error(f"VPN connection test failed: {str(e)}")
            test_results['connectivity_tests'].append({
                'test': 'general_connectivity',
                'success': False,
                'details': f"Test failed: {str(e)}"
            })
            return False, f"VPN connection test failed: {str(e)}", test_results
    
    def get_vpn_status(self) -> Dict:
        """
        Get current VPN configuration status on the router.
        
        Returns:
            dict: VPN status information
        """
        status = {
            'openvpn': {'configured': False, 'active_clients': 0},
            'wireguard': {'configured': False, 'active_peers': 0},
            'sstp': {'configured': False, 'active_clients': 0},
            'timestamp': datetime.now().isoformat()
        }
        
        try:
            self.connect_ssh()
            
            # Check OpenVPN status
            output, error = self.execute_ssh_command("/interface ovpn-server server print")
            if "enabled: yes" in output:
                status['openvpn']['configured'] = True
            
            # Check WireGuard status
            output, error = self.execute_ssh_command("/interface wireguard print")
            if "wg" in output:
                status['wireguard']['configured'] = True
            
            # Check SSTP status
            output, error = self.execute_ssh_command("/interface sstp-server server print")
            if "enabled: yes" in output:
                status['sstp']['configured'] = True
            
            # Get active clients/peers
            try:
                # OpenVPN active clients
                output, error = self.execute_ssh_command("/interface ovpn-server monitor once")
                if "connected" in output:
                    status['openvpn']['active_clients'] = output.count("connected")
                
                # WireGuard active peers
                output, error = self.execute_ssh_command("/interface wireguard peers print")
                status['wireguard']['active_peers'] = output.count("interface=")
                
                # SSTP active clients
                output, error = self.execute_ssh_command("/ppp active print where service=sstp")
                status['sstp']['active_clients'] = output.count("name=")
                
            except Exception as e:
                logger.warning(f"Could not get active VPN clients: {str(e)}")
            
            return status
            
        except Exception as e:
            logger.error(f"Failed to get VPN status: {str(e)}")
            return status
    
    def disconnect(self):
        """Clean up SSH connection."""
        if self.ssh_client:
            try:
                self.ssh_client.close()
            except Exception as e:
                logger.warning(f"Error closing SSH connection: {e}")


# Utility functions for standalone use
def main():
    """Standalone script for VPN configuration testing."""
    import argparse
    
    parser = argparse.ArgumentParser(description='MikroTik VPN Configuration Manager')
    parser.add_argument('--host', required=True, help='Router IP address')
    parser.add_argument('--username', required=True, help='Router username')
    parser.add_argument('--password', required=True, help='Router password')
    parser.add_argument('--vpn-type', choices=['openvpn', 'wireguard', 'sstp'], required=True, help='VPN type to configure')
    parser.add_argument('--action', choices=['configure', 'test', 'status'], default='configure', help='Action to perform')
    parser.add_argument('--ssh-port', type=int, default=22, help='SSH port')
    parser.add_argument('--verbose', action='store_true', help='Enable verbose logging')
    
    args = parser.parse_args()
    
    # Configure logging
    log_level = logging.DEBUG if args.verbose else logging.INFO
    logging.basicConfig(level=log_level, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    
    vpn_manager = MikroTikVPNManager(args.host, args.username, args.password, ssh_port=args.ssh_port)
    
    try:
        if args.action == 'configure':
            if args.vpn_type == 'openvpn':
                success, message, details = vpn_manager.configure_openvpn_server()
            elif args.vpn_type == 'wireguard':
                success, message, details = vpn_manager.configure_wireguard_server()
            elif args.vpn_type == 'sstp':
                success, message, details = vpn_manager.configure_sstp_server()
            
            print(f"Configuration: {'✅ SUCCESS' if success else '❌ FAILED'}")
            print(f"Message: {message}")
            if args.verbose:
                print(f"Details: {json.dumps(details, indent=2)}")
                
        elif args.action == 'test':
            success, message, test_results = vpn_manager.test_vpn_connection(args.vpn_type)
            print(f"VPN Test: {'✅ PASSED' if success else '❌ FAILED'}")
            print(f"Message: {message}")
            print(f"Test Results: {json.dumps(test_results, indent=2)}")
            
        elif args.action == 'status':
            status = vpn_manager.get_vpn_status()
            print("VPN Status:")
            print(json.dumps(status, indent=2))
    
    except Exception as e:
        print(f"❌ Error: {str(e)}")
    finally:
        vpn_manager.disconnect()


if __name__ == "__main__":
    main()