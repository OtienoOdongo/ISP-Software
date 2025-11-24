"""
PRODUCTION-READY Certificate Manager for VPN Configuration

Enhanced certificate management for MikroTik VPN with comprehensive security,
certificate generation, and lifecycle management.
"""

import os
import logging
import hashlib
import secrets
from datetime import datetime, timedelta
from typing import Dict, Tuple, Optional, Any, List
from cryptography import x509
from cryptography.x509.oid import NameOID
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives.serialization import pkcs12

logger = logging.getLogger(__name__)


class CertificateManager:
    """
    Enhanced certificate management for VPN configuration with comprehensive security.
    """
    
    def __init__(self, ca_cert_path: str = None, ca_key_path: str = None):
        # Use Django settings if available, otherwise defaults
        try:
            from django.conf import settings
            self.ca_cert_path = ca_cert_path or getattr(settings, 'VPN_CA_CERT_PATH', '/etc/ssl/certs/surfzone-ca.crt')
            self.ca_key_path = ca_key_path or getattr(settings, 'VPN_CA_KEY_PATH', '/etc/ssl/private/surfzone-ca.key')
            self.certificates_dir = getattr(settings, 'VPN_CERTIFICATES_DIR', '/etc/ssl/certs/mikrotik')
        except ImportError:
            # Fallback for standalone use
            self.ca_cert_path = ca_cert_path or '/etc/ssl/certs/surfzone-ca.crt'
            self.ca_key_path = ca_key_path or '/etc/ssl/private/surfzone-ca.key'
            self.certificates_dir = '/etc/ssl/certs/mikrotik'
        
        # Create directories if they don't exist
        os.makedirs(self.certificates_dir, exist_ok=True)
        os.makedirs(os.path.dirname(self.ca_key_path), exist_ok=True)
        os.makedirs(os.path.dirname(self.ca_cert_path), exist_ok=True)
    
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
    
    def list_certificates(self) -> List[Dict]:
        """
        List all generated certificates.
        
        Returns:
            list: Certificate information list
        """
        certificates = []
        
        try:
            for filename in os.listdir(self.certificates_dir):
                if filename.startswith('client_') and filename.endswith('.crt'):
                    cert_id = filename.replace('client_', '').replace('.crt', '')
                    cert_info = self.get_certificate_info(cert_id)
                    if 'error' not in cert_info:
                        certificates.append(cert_info)
            
            return certificates
            
        except Exception as e:
            logger.error(f"Failed to list certificates: {str(e)}")
            return []
    
    def create_pkcs12_bundle(self, certificate_id: str, password: str = None) -> Tuple[bool, str, str]:
        """
        Create PKCS12 bundle for client certificate.
        
        Returns:
            tuple: (success, message, bundle_path)
        """
        try:
            cert_info = self.get_certificate_info(certificate_id)
            if 'error' in cert_info:
                return False, cert_info['error'], ""
            
            # Load certificate and key
            with open(cert_info['certificate_path'], "rb") as f:
                certificate = x509.load_pem_x509_certificate(f.read(), default_backend())
            
            with open(cert_info['private_key_path'], "rb") as f:
                private_key = serialization.load_pem_private_key(f.read(), password=None, backend=default_backend())
            
            with open(self.ca_cert_path, "rb") as f:
                ca_cert = x509.load_pem_x509_certificate(f.read(), default_backend())
            
            # Generate password if not provided
            if not password:
                password = secrets.token_urlsafe(16)
            
            # Create PKCS12 bundle
            pkcs12_bundle = pkcs12.serialize_key_and_certificates(
                name=certificate_id.encode(),
                key=private_key,
                cert=certificate,
                cas=[ca_cert],
                encryption_algorithm=serialization.BestAvailableEncryption(password.encode())
            )
            
            # Save PKCS12 bundle
            bundle_path = os.path.join(self.certificates_dir, f"client_{certificate_id}.p12")
            with open(bundle_path, "wb") as f:
                f.write(pkcs12_bundle)
            
            return True, "PKCS12 bundle created successfully", bundle_path
            
        except Exception as e:
            logger.error(f"Failed to create PKCS12 bundle for {certificate_id}: {str(e)}")
            return False, f"PKCS12 bundle creation failed: {str(e)}", ""
    
    def cleanup_expired_certificates(self) -> Tuple[int, int]:
        """
        Clean up expired certificates.
        
        Returns:
            tuple: (cleaned_count, total_expired)
        """
        try:
            certificates = self.list_certificates()
            expired_certs = [cert for cert in certificates if not cert.get('is_valid', True)]
            cleaned_count = 0
            
            for cert in expired_certs:
                cert_id = cert['certificate_id']
                success, message = self.revoke_certificate(cert_id)
                if success:
                    cleaned_count += 1
                    logger.info(f"Cleaned up expired certificate: {cert_id}")
                else:
                    logger.warning(f"Failed to clean up expired certificate {cert_id}: {message}")
            
            return cleaned_count, len(expired_certs)
            
        except Exception as e:
            logger.error(f"Failed to clean up expired certificates: {str(e)}")
            return 0, 0


# Utility function for standalone use
def main():
    """Standalone certificate management utility."""
    import argparse
    
    parser = argparse.ArgumentParser(description='Certificate Management Utility')
    parser.add_argument('--action', choices=['generate-ca', 'generate-client', 'list', 'info', 'revoke', 'cleanup'], required=True)
    parser.add_argument('--router-name', help='Router name for client certificate')
    parser.add_argument('--router-ip', help='Router IP for client certificate')
    parser.add_argument('--certificate-id', help='Certificate ID for info/revoke actions')
    parser.add_argument('--ca-cert-path', help='Custom CA certificate path')
    parser.add_argument('--ca-key-path', help='Custom CA key path')
    
    args = parser.parse_args()
    
    cert_manager = CertificateManager(args.ca_cert_path, args.ca_key_path)
    
    if args.action == 'generate-ca':
        success, message = cert_manager.generate_ca_certificate()
        print(f"CA Generation: {'✅ SUCCESS' if success else '❌ FAILED'}")
        print(f"Message: {message}")
        
    elif args.action == 'generate-client':
        if not args.router_name or not args.router_ip:
            print("❌ Error: --router-name and --router-ip are required for client certificate generation")
            return
        
        success, message, cert_info = cert_manager.generate_client_certificate(args.router_name, args.router_ip)
        print(f"Client Certificate: {'✅ SUCCESS' if success else '❌ FAILED'}")
        print(f"Message: {message}")
        if success:
            print(f"Certificate ID: {cert_info['certificate_id']}")
            print(f"Certificate Path: {cert_info['certificate_path']}")
            
    elif args.action == 'list':
        certificates = cert_manager.list_certificates()
        print(f"Found {len(certificates)} certificates:")
        for cert in certificates:
            status = "✅ VALID" if cert['is_valid'] else "❌ EXPIRED"
            print(f"  {cert['certificate_id']}: {cert['subject']} - {status}")
            
    elif args.action == 'info':
        if not args.certificate_id:
            print("❌ Error: --certificate-id is required for info action")
            return
        
        cert_info = cert_manager.get_certificate_info(args.certificate_id)
        if 'error' in cert_info:
            print(f"❌ Error: {cert_info['error']}")
        else:
            print(f"Certificate ID: {cert_info['certificate_id']}")
            print(f"Subject: {cert_info['subject']}")
            print(f"Issuer: {cert_info['issuer']}")
            print(f"Valid Until: {cert_info['not_valid_after']}")
            print(f"Status: {'✅ VALID' if cert_info['is_valid'] else '❌ EXPIRED'}")
            print(f"Days Remaining: {cert_info['days_remaining']}")
            
    elif args.action == 'revoke':
        if not args.certificate_id:
            print("❌ Error: --certificate-id is required for revoke action")
            return
        
        success, message = cert_manager.revoke_certificate(args.certificate_id)
        print(f"Revocation: {'✅ SUCCESS' if success else '❌ FAILED'}")
        print(f"Message: {message}")
        
    elif args.action == 'cleanup':
        cleaned, total = cert_manager.cleanup_expired_certificates()
        print(f"Cleaned up {cleaned} out of {total} expired certificates")


if __name__ == "__main__":
    main()