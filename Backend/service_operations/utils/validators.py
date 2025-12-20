"""
Service Operations - Validators
Production-ready validation utilities for service operations
Comprehensive validation with detailed error messages and logging
"""

import re
import logging
import ipaddress
from typing import Tuple, Dict, Any, Optional, Union, List
from django.utils import timezone
from django.core.exceptions import ValidationError
from decimal import Decimal, InvalidOperation
import json

logger = logging.getLogger(__name__)


def validate_subscription_data(data: Dict[str, Any]) -> Tuple[bool, Optional[str], Optional[Dict]]:
    """
    Comprehensive subscription data validation.
    
    Args:
        data: Subscription data to validate
    
    Returns:
        (is_valid, error_message, validated_data)
    """
    try:
        errors = {}
        validated_data = {}
        
        # Required fields
        required_fields = ['client_id', 'internet_plan_id', 'access_method']
        for field in required_fields:
            if field not in data:
                errors[field] = f'Missing required field: {field}'
            else:
                validated_data[field] = data[field]
        
        # Validate access method
        access_method = data.get('access_method')
        if access_method:
            valid_methods = ['hotspot', 'pppoe', 'wifi']
            if access_method not in valid_methods:
                errors['access_method'] = f'Invalid access method. Must be one of: {", ".join(valid_methods)}'
        
        # Validate duration
        duration_hours = data.get('duration_hours', 24)
        if not isinstance(duration_hours, (int, float)):
            errors['duration_hours'] = 'Duration must be a number'
        elif duration_hours < 1 or duration_hours > 744:  # Max 31 days
            errors['duration_hours'] = 'Duration must be between 1 and 744 hours'
        else:
            validated_data['duration_hours'] = int(duration_hours)
        
        # Validate MAC address for hotspot
        if access_method == 'hotspot' and data.get('mac_address'):
            mac_address = data['mac_address']
            if not validate_mac_address(mac_address):
                errors['mac_address'] = 'Invalid MAC address format for hotspot'
            else:
                validated_data['mac_address'] = mac_address
        elif data.get('mac_address'):
            # MAC address is optional for non-hotspot methods
            validated_data['mac_address'] = data['mac_address']
        
        # Validate router_id if provided
        if 'router_id' in data and data['router_id'] is not None:
            try:
                router_id = int(data['router_id'])
                if router_id < 0:
                    errors['router_id'] = 'Router ID must be positive'
                else:
                    validated_data['router_id'] = router_id
            except (ValueError, TypeError):
                errors['router_id'] = 'Router ID must be an integer'
        
        # Validate auto_renew
        if 'auto_renew' in data:
            auto_renew = data['auto_renew']
            if not isinstance(auto_renew, bool):
                errors['auto_renew'] = 'Auto-renew must be true or false'
            else:
                validated_data['auto_renew'] = auto_renew
        
        # Validate start date if provided
        if 'start_date' in data and data['start_date']:
            try:
                if isinstance(data['start_date'], str):
                    start_date = timezone.datetime.fromisoformat(data['start_date'].replace('Z', '+00:00'))
                else:
                    start_date = data['start_date']
                
                if start_date < timezone.now():
                    errors['start_date'] = 'Start date cannot be in the past'
                else:
                    validated_data['start_date'] = start_date
            except (ValueError, TypeError):
                errors['start_date'] = 'Invalid date format. Use ISO format'
        
        # Validate metadata if provided
        if 'metadata' in data and data['metadata']:
            try:
                if isinstance(data['metadata'], str):
                    metadata = json.loads(data['metadata'])
                else:
                    metadata = data['metadata']
                
                if not isinstance(metadata, dict):
                    errors['metadata'] = 'Metadata must be a JSON object'
                else:
                    validated_data['metadata'] = metadata
            except (json.JSONDecodeError, TypeError):
                errors['metadata'] = 'Invalid metadata format'
        
        if errors:
            error_message = '; '.join([f'{k}: {v}' for k, v in errors.items()])
            return False, error_message, None
        
        return True, None, validated_data
        
    except Exception as e:
        logger.error(f"Subscription data validation error: {e}", exc_info=True)
        return False, f'Validation error: {str(e)}', None


def validate_activation_data(data: Dict[str, Any]) -> Tuple[bool, Optional[str], Optional[Dict]]:
    """
    Validate activation request data.
    
    Args:
        data: Activation data to validate
    
    Returns:
        (is_valid, error_message, validated_data)
    """
    try:
        errors = {}
        validated_data = {}
        
        # Required fields
        required_fields = ['subscription_id', 'transaction_reference']
        for field in required_fields:
            if field not in data:
                errors[field] = f'Missing required field: {field}'
            else:
                validated_data[field] = data[field]
        
        # Validate subscription_id format
        subscription_id = data.get('subscription_id')
        if subscription_id:
            uuid_pattern = re.compile(
                r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
                re.IGNORECASE
            )
            if not uuid_pattern.match(str(subscription_id)):
                errors['subscription_id'] = 'Invalid subscription ID format'
        
        # Validate transaction reference
        transaction_ref = data.get('transaction_reference', '')
        if not transaction_ref or len(transaction_ref) < 5:
            errors['transaction_reference'] = 'Transaction reference must be at least 5 characters'
        elif len(transaction_ref) > 100:
            errors['transaction_reference'] = 'Transaction reference cannot exceed 100 characters'
        
        # Validate activate_immediately
        if 'activate_immediately' in data:
            activate_immediately = data['activate_immediately']
            if not isinstance(activate_immediately, bool):
                errors['activate_immediately'] = 'Activate immediately must be true or false'
            else:
                validated_data['activate_immediately'] = activate_immediately
        
        if errors:
            error_message = '; '.join([f'{k}: {v}' for k, v in errors.items()])
            return False, error_message, None
        
        return True, None, validated_data
        
    except Exception as e:
        logger.error(f"Activation data validation error: {e}", exc_info=True)
        return False, f'Validation error: {str(e)}', None


def validate_client_operation(data: Dict[str, Any]) -> Tuple[bool, Optional[str], Optional[Dict]]:
    """
    Validate client operation data.
    
    Args:
        data: Client operation data to validate
    
    Returns:
        (is_valid, error_message, validated_data)
    """
    try:
        errors = {}
        validated_data = {}
        
        # Required fields
        required_fields = ['client_id', 'operation_type']
        for field in required_fields:
            if field not in data:
                errors[field] = f'Missing required field: {field}'
            else:
                validated_data[field] = data[field]
        
        # Validate operation type
        valid_operations = [
            'purchase', 'renewal', 'upgrade', 'downgrade', 'cancellation',
            'activation', 'deactivation', 'refund', 'complaint', 'support',
            'verification', 'profile_update', 'technical_support', 'billing'
        ]
        
        operation_type = data.get('operation_type')
        if operation_type and operation_type not in valid_operations:
            errors['operation_type'] = (
                f'Invalid operation type. Must be one of: {", ".join(valid_operations)}'
            )
        
        # Validate title
        title = data.get('title', '')
        if not title or len(title.strip()) < 5:
            errors['title'] = 'Title must be at least 5 characters'
        elif len(title) > 200:
            errors['title'] = 'Title cannot exceed 200 characters'
        else:
            validated_data['title'] = title.strip()
        
        # Validate description
        description = data.get('description', '')
        if description and len(description) > 5000:
            errors['description'] = 'Description cannot exceed 5000 characters'
        elif description:
            validated_data['description'] = description.strip()
        
        # Validate priority
        if 'priority' in data:
            priority = data['priority']
            if not isinstance(priority, int):
                errors['priority'] = 'Priority must be an integer'
            elif not 1 <= priority <= 5:
                errors['priority'] = 'Priority must be between 1 and 5'
            else:
                validated_data['priority'] = priority
        
        # Validate requested_via
        valid_request_methods = ['web', 'mobile', 'api', 'sms', 'phone', 'in_person', 'agent']
        if 'requested_via' in data:
            requested_via = data['requested_via']
            if requested_via not in valid_request_methods:
                errors['requested_via'] = (
                    f'Invalid request method. Must be one of: {", ".join(valid_request_methods)}'
                )
            else:
                validated_data['requested_via'] = requested_via
        
        # Validate subscription_id if provided
        if 'subscription_id' in data and data['subscription_id']:
            subscription_id = data['subscription_id']
            uuid_pattern = re.compile(
                r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
                re.IGNORECASE
            )
            if not uuid_pattern.match(str(subscription_id)):
                errors['subscription_id'] = 'Invalid subscription ID format'
            else:
                validated_data['subscription_id'] = subscription_id
        
        if errors:
            error_message = '; '.join([f'{k}: {v}' for k, v in errors.items()])
            return False, error_message, None
        
        return True, None, validated_data
        
    except Exception as e:
        logger.error(f"Client operation validation error: {e}", exc_info=True)
        return False, f'Validation error: {str(e)}', None


def validate_phone_number(phone_number: str) -> Tuple[bool, Optional[str]]:
    """
    Validate and normalize phone number.
    
    Args:
        phone_number: Phone number to validate
    
    Returns:
        (is_valid, normalized_number)
    """
    if not phone_number:
        return False, None
    
    try:
        # Remove any non-digit characters
        digits = re.sub(r'\D', '', phone_number)
        
        # Check length
        if len(digits) < 9 or len(digits) > 15:
            return False, None
        
        # Kenyan phone number validation
        if digits.startswith('254') and len(digits) == 12:
            # Already in international format
            return True, f"+{digits}"
        elif digits.startswith('07') and len(digits) == 10:
            # Local format
            return True, f"+254{digits[1:]}"
        elif digits.startswith('7') and len(digits) == 9:
            # Without leading zero
            return True, f"+254{digits}"
        elif len(digits) == 9:
            # Assume Kenyan number without country code
            return True, f"+254{digits}"
        else:
            # Try to normalize
            if digits.startswith('0'):
                digits = digits[1:]
            if len(digits) == 9:
                return True, f"+254{digits}"
        
        return False, None
        
    except Exception as e:
        logger.error(f"Phone number validation error: {e}")
        return False, None


def validate_mac_address(mac_address: str) -> bool:
    """
    Validate MAC address format.
    
    Args:
        mac_address: MAC address to validate
    
    Returns:
        True if valid, False otherwise
    """
    if not mac_address:
        return False
    
    # Common MAC address patterns
    patterns = [
        r'^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$',  # 00:11:22:33:44:55 or 00-11-22-33-44-55
        r'^([0-9A-Fa-f]{4}\.){2}([0-9A-Fa-f]{4})$',     # 0011.2233.4455 (Cisco format)
        r'^([0-9A-Fa-f]{12})$',                         # 001122334455 (no separators)
    ]
    
    for pattern in patterns:
        if re.match(pattern, mac_address):
            return True
    
    return False


def validate_duration_hours(duration_hours: int) -> bool:
    """
    Validate duration in hours.
    
    Args:
        duration_hours: Duration in hours
    
    Returns:
        True if valid, False otherwise
    """
    return 1 <= duration_hours <= 744  # Max 31 days


def validate_payment_data(payment_data: Dict[str, Any]) -> Tuple[bool, Optional[str], Optional[Dict]]:
    """
    Validate payment data.
    
    Args:
        payment_data: Payment data to validate
    
    Returns:
        (is_valid, error_message, validated_data)
    """
    try:
        errors = {}
        validated_data = {}
        
        # Required fields
        required_fields = ['amount', 'currency', 'reference']
        for field in required_fields:
            if field not in payment_data:
                errors[field] = f'Missing required field: {field}'
        
        # Validate amount
        if 'amount' in payment_data:
            try:
                amount = Decimal(str(payment_data['amount']))
                if amount <= 0:
                    errors['amount'] = 'Amount must be positive'
                else:
                    validated_data['amount'] = amount
            except (ValueError, InvalidOperation, TypeError):
                errors['amount'] = 'Invalid amount format'
        
        # Validate currency
        if 'currency' in payment_data:
            currency = payment_data['currency']
            if not isinstance(currency, str) or len(currency) != 3:
                errors['currency'] = 'Currency must be 3-letter ISO code'
            else:
                validated_data['currency'] = currency.upper()
        
        # Validate reference
        if 'reference' in payment_data:
            reference = payment_data['reference']
            if not reference or len(reference) < 5:
                errors['reference'] = 'Reference must be at least 5 characters'
            elif len(reference) > 100:
                errors['reference'] = 'Reference cannot exceed 100 characters'
            else:
                validated_data['reference'] = reference
        
        # Validate payment method if provided
        valid_methods = ['mpesa', 'card', 'bank', 'cash', 'mobile_money']
        if 'payment_method' in payment_data:
            method = payment_data['payment_method']
            if method not in valid_methods:
                errors['payment_method'] = f'Invalid payment method. Must be one of: {", ".join(valid_methods)}'
            else:
                validated_data['payment_method'] = method
        
        # Validate metadata if provided
        if 'metadata' in payment_data and payment_data['metadata']:
            try:
                if isinstance(payment_data['metadata'], str):
                    metadata = json.loads(payment_data['metadata'])
                else:
                    metadata = payment_data['metadata']
                
                if not isinstance(metadata, dict):
                    errors['metadata'] = 'Metadata must be a JSON object'
                else:
                    validated_data['metadata'] = metadata
            except (json.JSONDecodeError, TypeError):
                errors['metadata'] = 'Invalid metadata format'
        
        if errors:
            error_message = '; '.join([f'{k}: {v}' for k, v in errors.items()])
            return False, error_message, None
        
        return True, None, validated_data
        
    except Exception as e:
        logger.error(f"Payment data validation error: {e}", exc_info=True)
        return False, f'Validation error: {str(e)}', None


def validate_network_config(config: Dict[str, Any]) -> Tuple[bool, Optional[str], Optional[Dict]]:
    """
    Validate network configuration.
    
    Args:
        config: Network configuration to validate
    
    Returns:
        (is_valid, error_message, validated_config)
    """
    try:
        errors = {}
        validated_config = {}
        
        if not isinstance(config, dict):
            return False, 'Network configuration must be a dictionary', None
        
        # Validate access method
        access_method = config.get('access_method')
        if not access_method:
            errors['access_method'] = 'Missing access method'
        elif access_method not in ['hotspot', 'pppoe', 'wifi']:
            errors['access_method'] = 'Invalid access method'
        else:
            validated_config['access_method'] = access_method
        
        # Validate based on access method
        if access_method == 'hotspot':
            # Required for hotspot
            required_fields = ['download_speed', 'upload_speed']
            for field in required_fields:
                if field not in config:
                    errors[field] = f'Missing required field for hotspot: {field}'
                else:
                    try:
                        speed = int(config[field])
                        if speed <= 0:
                            errors[field] = f'{field} must be positive'
                        else:
                            validated_config[field] = speed
                    except (ValueError, TypeError):
                        errors[field] = f'{field} must be an integer'
            
            # Optional fields
            if 'max_devices' in config:
                try:
                    max_devices = int(config['max_devices'])
                    if max_devices < 1:
                        errors['max_devices'] = 'Max devices must be at least 1'
                    else:
                        validated_config['max_devices'] = max_devices
                except (ValueError, TypeError):
                    errors['max_devices'] = 'Max devices must be an integer'
        
        elif access_method == 'pppoe':
            # Required for PPPoE
            required_fields = ['ip_pool', 'service_name']
            for field in required_fields:
                if field not in config:
                    errors[field] = f'Missing required field for PPPoE: {field}'
                else:
                    value = config[field]
                    if not value or not isinstance(value, str):
                        errors[field] = f'{field} must be a non-empty string'
                    else:
                        validated_config[field] = value
            
            # Validate MTU if provided
            if 'mtu' in config:
                try:
                    mtu = int(config['mtu'])
                    if not 576 <= mtu <= 1500:  # Standard MTU range
                        errors['mtu'] = 'MTU must be between 576 and 1500'
                    else:
                        validated_config['mtu'] = mtu
                except (ValueError, TypeError):
                    errors['mtu'] = 'MTU must be an integer'
            
            # Validate DNS servers if provided
            if 'dns_servers' in config:
                dns_servers = config['dns_servers']
                if not isinstance(dns_servers, list):
                    errors['dns_servers'] = 'DNS servers must be a list'
                else:
                    validated_dns = []
                    for dns in dns_servers:
                        try:
                            ipaddress.ip_address(dns)
                            validated_dns.append(dns)
                        except ValueError:
                            errors['dns_servers'] = f'Invalid IP address: {dns}'
                            break
                    if not errors.get('dns_servers'):
                        validated_config['dns_servers'] = validated_dns
        
        # Validate common fields
        if 'vlan_id' in config:
            try:
                vlan_id = int(config['vlan_id'])
                if not 1 <= vlan_id <= 4095:  # Standard VLAN range
                    errors['vlan_id'] = 'VLAN ID must be between 1 and 4095'
                else:
                    validated_config['vlan_id'] = vlan_id
            except (ValueError, TypeError):
                errors['vlan_id'] = 'VLAN ID must be an integer'
        
        if 'qos_profile' in config:
            qos_profile = config['qos_profile']
            if not isinstance(qos_profile, str):
                errors['qos_profile'] = 'QoS profile must be a string'
            else:
                validated_config['qos_profile'] = qos_profile
        
        if errors:
            error_message = '; '.join([f'{k}: {v}' for k, v in errors.items()])
            return False, error_message, None
        
        return True, None, validated_config
        
    except Exception as e:
        logger.error(f"Network config validation error: {e}", exc_info=True)
        return False, f'Validation error: {str(e)}', None


def validate_ip_address(ip_address: str) -> bool:
    """
    Validate IP address.
    
    Args:
        ip_address: IP address to validate
    
    Returns:
        True if valid, False otherwise
    """
    try:
        ipaddress.ip_address(ip_address)
        return True
    except ValueError:
        return False




def validate_json_string(json_string: str) -> bool:
    """
    Validate JSON string.
    
    Args:
        json_string: JSON string to validate
    
    Returns:
        True if valid, False otherwise
    """
    try:
        json.loads(json_string)
        return True
    except (json.JSONDecodeError, TypeError):
        return False


def validate_positive_integer(value: Any, field_name: str = "value") -> Tuple[bool, Optional[str]]:
    """
    Validate positive integer.
    
    Args:
        value: Value to validate
        field_name: Name of the field for error message
    
    Returns:
        (is_valid, error_message)
    """
    try:
        int_value = int(value)
        if int_value < 0:
            return False, f"{field_name} must be positive"
        return True, None
    except (ValueError, TypeError):
        return False, f"{field_name} must be an integer"


def validate_positive_decimal(value: Any, field_name: str = "value") -> Tuple[bool, Optional[str]]:
    """
    Validate positive decimal.
    
    Args:
        value: Value to validate
        field_name: Name of the field for error message
    
    Returns:
        (is_valid, error_message)
    """
    try:
        decimal_value = Decimal(str(value))
        if decimal_value < 0:
            return False, f"{field_name} must be positive"
        return True, None
    except (ValueError, InvalidOperation, TypeError):
        return False, f"{field_name} must be a decimal number"

