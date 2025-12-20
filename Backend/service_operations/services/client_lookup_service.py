"""
Service Operations - Client Lookup Service
Resolves client identifiers between Authentication app and Service Operations
Handles phone number ↔ UUID mapping and user type validation
"""

import logging
import requests
from typing import Optional, Dict, Any, Tuple, List
from django.conf import settings
from django.core.cache import cache
import uuid
from django.utils import timezone

logger = logging.getLogger(__name__)


class ClientLookupService:
    """
    Service to resolve client identifiers between Service Operations and Authentication app
    """
    
    CACHE_TIMEOUT = 300  # 5 minutes
    
    @classmethod
    def get_client_by_phone(cls, phone_number: str) -> Optional[Dict[str, Any]]:
        """
        Get client details from Authentication app by phone number
        Returns None if client not found
        """
        try:
            # Cache key
            cache_key = f"client:phone:{phone_number}"
            cached_client = cache.get(cache_key)
            
            if cached_client:
                return cached_client
            
            # Call Authentication API
            auth_url = getattr(settings, 'AUTHENTICATION_BASE_URL', 'http://localhost:8000')
            token = getattr(settings, 'INTERNAL_API_TOKEN', '')
            
            response = requests.get(
                f"{auth_url}/api/auth/clients/lookup/",
                params={'phone': phone_number},
                headers={'Authorization': f'Bearer {token}'} if token else {},
                timeout=10,
                verify=False  # Set to True in production with proper SSL
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and data.get('client'):
                    client_data = data['client']
                    # Add lookup timestamp
                    client_data['_lookup_timestamp'] = timezone.now().isoformat()
                    cache.set(cache_key, client_data, cls.CACHE_TIMEOUT)
                    return client_data
            
            logger.warning(f"Client not found for phone: {phone_number}")
            return None
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Authentication API request failed for phone {phone_number}: {e}")
            return None
        except Exception as e:
            logger.error(f"Failed to lookup client by phone {phone_number}: {e}")
            return None
    
    @classmethod
    def get_client_by_uuid(cls, client_uuid: str) -> Optional[Dict[str, Any]]:
        """
        Get client details from Authentication app by UUID
        """
        try:
            # Cache key
            cache_key = f"client:uuid:{client_uuid}"
            cached_client = cache.get(cache_key)
            
            if cached_client:
                return cached_client
            
            # Call Authentication API (check UUID endpoint)
            auth_url = getattr(settings, 'AUTHENTICATION_BASE_URL', 'http://localhost:8000')
            token = getattr(settings, 'INTERNAL_API_TOKEN', '')
            
            response = requests.get(
                f"{auth_url}/api/auth/check/uuid/",
                params={'uuid': client_uuid},
                headers={'Authorization': f'Bearer {token}'} if token else {},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and data.get('user'):
                    client_data = data['user']
                    cache.set(cache_key, client_data, cls.CACHE_TIMEOUT)
                    return client_data
            
            return None
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Authentication API request failed for UUID {client_uuid}: {e}")
            return None
    
    @classmethod
    def get_client_id_by_phone(cls, phone_number: str) -> Optional[str]:
        """
        Get client UUID from phone number
        """
        client_data = cls.get_client_by_phone(phone_number)
        if client_data:
            return client_data.get('id')
        return None
    
    @classmethod
    def get_client_connection_type(cls, identifier: str) -> Optional[str]:
        """
        Get client connection type (hotspot/pppoe) from identifier (phone or UUID)
        """
        is_valid, id_type = cls.is_valid_client_identifier(identifier)
        
        if not is_valid:
            return None
        
        if id_type == 'uuid':
            client_data = cls.get_client_by_uuid(identifier)
        else:
            client_data = cls.get_client_by_phone(identifier)
        
        if client_data:
            return client_data.get('connection_type')
        return None
    
    @classmethod
    def is_pppoe_client(cls, identifier: str) -> bool:
        """
        Check if client is PPPoE user
        """
        connection_type = cls.get_client_connection_type(identifier)
        return connection_type == 'pppoe'
    
    @classmethod
    def is_hotspot_client(cls, identifier: str) -> bool:
        """
        Check if client is hotspot user
        """
        connection_type = cls.get_client_connection_type(identifier)
        return connection_type == 'hotspot'
    
    @classmethod
    def validate_client_access(cls, request, client_identifier: str) -> bool:
        """
        Validate that the authenticated user can access this client
        Rules:
        - Admins/staff can access any client
        - Client users can only access themselves (by phone or UUID)
        """
        try:
            # Check if request has authenticated user
            if not hasattr(request, 'user') or not request.user.is_authenticated:
                return False
            
            # Check user type from token (depends on your authentication system)
            # For JWT tokens, you might need to decode or check attributes
            
            # If using Django user model with is_staff
            if hasattr(request.user, 'is_staff') and request.user.is_staff:
                return True
            
            # If using custom user type attribute
            user_type = getattr(request.user, 'user_type', 'client')
            
            # Admins and staff can access any client
            if user_type in ['admin', 'staff']:
                return True
            
            # Client users can only access their own data
            if user_type == 'client':
                # Get client's own identifier
                user_uuid = getattr(request.user, 'id', None)
                user_phone = getattr(request.user, 'phone_number', None)
                
                # Check by UUID
                if user_uuid:
                    try:
                        client_uuid = uuid.UUID(client_identifier)
                        return str(user_uuid) == str(client_uuid)
                    except ValueError:
                        # Not a UUID, check by phone
                        pass
                
                # Check by phone
                if user_phone and user_phone == client_identifier:
                    return True
            
            return False
            
        except Exception as e:
            logger.error(f"Client access validation failed: {e}")
            return False
    
    @classmethod
    def is_valid_client_identifier(cls, identifier: str) -> Tuple[bool, Optional[str]]:
        """
        Check if identifier is a valid UUID or phone number
        Returns (is_valid, type)
        """
        if not identifier:
            return False, None
        
        # Check if it's a UUID
        try:
            uuid.UUID(str(identifier))
            return True, 'uuid'
        except (ValueError, AttributeError):
            # Not a UUID, check if it's a valid phone number
            from service_operations.utils.validators import validate_phone_number
            is_valid, normalized = validate_phone_number(identifier)
            if is_valid:
                return True, 'phone'
            return False, None
    
    @classmethod
    def resolve_client_identifier(cls, identifier: str) -> Dict[str, Any]:
        """
        Resolve client identifier to get complete client information
        Returns client data with both UUID and phone
        """
        is_valid, id_type = cls.is_valid_client_identifier(identifier)
        
        if not is_valid:
            return {
                'success': False,
                'valid': False,
                'error': 'Invalid client identifier',
                'identifier': identifier
            }
        
        if id_type == 'uuid':
            client_data = cls.get_client_by_uuid(identifier)
            if client_data:
                return {
                    'success': True,
                    'valid': True,
                    'type': 'uuid',
                    'identifier': identifier,
                    'client_id': identifier,
                    'client_phone': client_data.get('phone_number'),
                    'client_username': client_data.get('username'),
                    'connection_type': client_data.get('connection_type'),
                    'client_data': client_data
                }
            else:
                return {
                    'success': False,
                    'valid': False,
                    'type': 'uuid',
                    'error': 'Client not found',
                    'identifier': identifier
                }
        else:
            # Phone lookup
            client_data = cls.get_client_by_phone(identifier)
            if client_data:
                return {
                    'success': True,
                    'valid': True,
                    'type': 'phone',
                    'identifier': identifier,
                    'client_id': client_data.get('id'),
                    'client_phone': identifier,
                    'client_username': client_data.get('username'),
                    'connection_type': client_data.get('connection_type'),
                    'client_data': client_data
                }
            else:
                # Phone not registered as client
                return {
                    'success': False,
                    'valid': True,
                    'type': 'phone_unregistered',
                    'identifier': identifier,
                    'client_id': None,
                    'client_phone': identifier,
                    'message': 'Phone number not registered as client'
                }
    
    @classmethod
    def create_or_get_client(cls, phone_number: str, name: str = None, connection_type: str = 'hotspot') -> Dict[str, Any]:
        """
        Create a new client or get existing client by phone
        Used for hotspot portal registrations
        """
        try:
            # Validate phone number
            from service_operations.utils.validators import validate_phone_number
            is_valid, normalized_phone = validate_phone_number(phone_number)
            
            if not is_valid:
                return {
                    'success': False,
                    'error': 'Invalid phone number',
                    'phone_number': phone_number
                }
            
            # First check if client exists
            client_data = cls.get_client_by_phone(normalized_phone)
            
            if client_data:
                return {
                    'success': True,
                    'action': 'found',
                    'client': client_data
                }
            
            # Client doesn't exist, create via Authentication API
            auth_url = getattr(settings, 'AUTHENTICATION_BASE_URL', 'http://localhost:8000')
            token = getattr(settings, 'INTERNAL_API_TOKEN', '')
            
            # Prepare creation data based on connection type
            create_data = {
                'phone_number': normalized_phone,
                'connection_type': connection_type
            }
            
            if connection_type == 'pppoe' and name:
                create_data['client_name'] = name
            
            # Determine which endpoint to use
            if connection_type == 'pppoe':
                endpoint = f"{auth_url}/api/auth/clients/pppoe/create/"
            else:
                endpoint = f"{auth_url}/api/auth/clients/hotspot/create/"
            
            headers = {
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {token}' if token else ''
            }
            
            response = requests.post(
                endpoint,
                json=create_data,
                headers=headers,
                timeout=15,
                verify=False
            )
            
            if response.status_code in [200, 201]:
                result = response.json()
                if result.get('success'):
                    # Clear cache for this phone
                    cache_key = f"client:phone:{normalized_phone}"
                    cache.delete(cache_key)
                    
                    # Get fresh client data
                    client_data = cls.get_client_by_phone(normalized_phone)
                    
                    return {
                        'success': True,
                        'action': 'created',
                        'client': client_data,
                        'credentials': result.get('credentials'),
                        'sms_data': result.get('sms_data')
                    }
            
            logger.error(f"Failed to create client: {response.status_code} - {response.text}")
            return {
                'success': False,
                'action': 'failed',
                'error': f'Failed to create client: {response.text}'
            }
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Authentication API request failed: {e}")
            return {
                'success': False,
                'error': 'Authentication service unavailable',
                'details': str(e) if settings.DEBUG else None
            }
        except Exception as e:
            logger.error(f"Failed to create/get client: {e}", exc_info=True)
            return {
                'success': False,
                'error': 'Failed to process client request',
                'details': str(e) if settings.DEBUG else None
            }
    
    @classmethod
    def get_pppoe_credentials(cls, client_id: str) -> Optional[Dict[str, Any]]:
        """
        Get PPPoE credentials for a client
        Only works for PPPoE clients
        """
        client_data = cls.get_client_by_uuid(client_id)
        
        if not client_data:
            return None
        
        if client_data.get('connection_type') != 'pppoe':
            return None
        
        return {
            'pppoe_username': client_data.get('pppoe_username'),
            'pppoe_credentials_generated': client_data.get('pppoe_credentials_generated'),
            'pppoe_active': client_data.get('pppoe_active')
        }
    
    @classmethod
    def bulk_resolve_clients(cls, identifiers: List[str]) -> Dict[str, Dict[str, Any]]:
        """
        Resolve multiple client identifiers in batch
        Returns dict mapping identifier -> client data
        """
        results = {}
        
        for identifier in identifiers:
            try:
                result = cls.resolve_client_identifier(identifier)
                results[identifier] = result
            except Exception as e:
                logger.error(f"Failed to resolve identifier {identifier}: {e}")
                results[identifier] = {
                    'success': False,
                    'error': str(e),
                    'identifier': identifier
                }
        
        return results
    
    @classmethod
    def health_check(cls) -> Dict[str, Any]:
        """
        Check connectivity to Authentication app
        """
        try:
            auth_url = getattr(settings, 'AUTHENTICATION_BASE_URL', 'http://localhost:8000')
            
            response = requests.get(
                f"{auth_url}/api/auth/health/",  # Assuming health endpoint exists
                timeout=5
            )
            
            is_healthy = response.status_code == 200
            
            return {
                'success': True,
                'healthy': is_healthy,
                'service': 'client_lookup',
                'authentication_app_healthy': is_healthy,
                'status_code': response.status_code,
                'timestamp': timezone.now().isoformat()
            }
            
        except requests.exceptions.RequestException as e:
            return {
                'success': False,
                'healthy': False,
                'service': 'client_lookup',
                'authentication_app_healthy': False,
                'error': str(e),
                'timestamp': timezone.now().isoformat()
            }