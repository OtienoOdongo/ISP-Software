# """
# Signal Data Validators
# Validate signal data before emission
# """

# import logging
# import re
# from typing import Dict, Any, Tuple, List
# from django.core.validators import validate_email
# from django.core.exceptions import ValidationError

# logger = logging.getLogger(__name__)

# # ==================== VALIDATION FUNCTIONS ====================

# def validate_signal_data(signal_name: str, data: Dict[str, Any]) -> Tuple[bool, str]:
#     """
#     Validate signal data before emitting
#     Returns (is_valid, error_message)
#     """
#     # Define validation rules for each signal
#     validation_rules = {
#         'pppoe_credentials_generated': {
#             'required': ['user_id', 'username', 'pppoe_username', 'password', 'phone_number'],
#             'validators': {
#                 'user_id': _validate_uuid_format,
#                 'username': _validate_username,
#                 'pppoe_username': _validate_pppoe_username,
#                 'password': _validate_password_strength,
#                 'phone_number': _validate_phone_number,
#             }
#         },
#         'client_account_created': {
#             'required': ['user_id', 'username', 'phone_number', 'connection_type'],
#             'validators': {
#                 'user_id': _validate_uuid_format,
#                 'username': _validate_username,
#                 'phone_number': _validate_phone_number,
#                 'connection_type': lambda x: x in ['hotspot', 'pppoe'],
#             }
#         },
#         'pppoe_credentials_updated': {
#             'required': ['user_id', 'username'],
#             'validators': {
#                 'user_id': _validate_uuid_format,
#                 'username': _validate_username,
#             }
#         },
#         'account_status_changed': {
#             'required': ['user_id', 'username', 'is_active', 'reason'],
#             'validators': {
#                 'user_id': _validate_uuid_format,
#                 'username': _validate_username,
#                 'is_active': lambda x: isinstance(x, bool),
#             }
#         },
#         'authentication_failed': {
#             'required': ['username', 'ip_address', 'failure_type'],
#             'validators': {
#                 'username': _validate_username,
#                 'ip_address': _validate_ip_address,
#                 'failure_type': lambda x: x in ['pppoe', 'phone', 'admin', 'unknown'],
#             }
#         },
#         'send_notification': {
#             'required': ['user_id', 'notification_type', 'data'],
#             'validators': {
#                 'user_id': _validate_uuid_format,
#                 'notification_type': _validate_notification_type,
#                 'data': lambda x: isinstance(x, dict),
#             }
#         }
#     }
    
#     if signal_name not in validation_rules:
#         return False, f"Unknown signal: {signal_name}"
    
#     rules = validation_rules[signal_name]
    
#     # Check required fields
#     for field in rules['required']:
#         if field not in data:
#             return False, f"Missing required field: {field}"
    
#     # Run field validators
#     for field, validator in rules.get('validators', {}).items():
#         if field in data:
#             try:
#                 is_valid, message = validator(data[field])
#                 if not is_valid:
#                     return False, f"Invalid {field}: {message}"
#             except Exception as e:
#                 return False, f"Validation error for {field}: {str(e)}"
    
#     return True, "Valid"

# # ==================== FIELD VALIDATORS ====================

# def _validate_uuid_format(value: str) -> Tuple[bool, str]:
#     """Validate UUID format"""
#     import uuid
#     try:
#         uuid.UUID(str(value))
#         return True, "Valid UUID"
#     except ValueError:
#         return False, "Invalid UUID format"

# def _validate_username(value: str) -> Tuple[bool, str]:
#     """Validate username format"""
#     if not value or len(value) < 3:
#         return False, "Username must be at least 3 characters"
#     if len(value) > 50:
#         return False, "Username must be 50 characters or less"
#     if not re.match(r'^[a-zA-Z0-9_.-]+$', value):
#         return False, "Username can only contain letters, numbers, dots, dashes, and underscores"
#     return True, "Valid username"

# def _validate_pppoe_username(value: str) -> Tuple[bool, str]:
#     """Validate PPPoE username format"""
#     if not value or len(value) < 3:
#         return False, "PPPoE username must be at least 3 characters"
#     if len(value) > 32:
#         return False, "PPPoE username must be 32 characters or less"
#     if not re.match(r'^[a-zA-Z0-9_.-]+$', value):
#         return False, "PPPoE username can only contain letters, numbers, dots, dashes, and underscores"
#     return True, "Valid PPPoE username"

# def _validate_password_strength(value: str) -> Tuple[bool, str]:
#     """Validate password strength"""
#     if not value or len(value) < 8:
#         return False, "Password must be at least 8 characters"
    
#     checks = {
#         'uppercase': any(c.isupper() for c in value),
#         'lowercase': any(c.islower() for c in value),
#         'digit': any(c.isdigit() for c in value),
#     }
    
#     if not all(checks.values()):
#         return False, "Password must contain uppercase, lowercase, and digit"
    
#     return True, "Strong password"

# def _validate_phone_number(value: str) -> Tuple[bool, str]:
#     """Validate phone number format"""
#     if not value:
#         return False, "Phone number is required"
    
#     # Basic validation - can be enhanced based on country
#     clean_number = re.sub(r'[^\d+]', '', str(value))
    
#     if clean_number.startswith('+254') and len(clean_number) == 13:
#         return True, "Valid Kenyan phone number"
#     elif clean_number.startswith('254') and len(clean_number) == 12:
#         return True, "Valid Kenyan phone number"
#     elif clean_number.startswith('0') and len(clean_number) == 10:
#         return True, "Valid Kenyan phone number"
#     elif clean_number.startswith('7') and len(clean_number) == 9:
#         return True, "Valid Kenyan phone number"
    
#     return False, "Invalid phone number format"

# def _validate_ip_address(value: str) -> Tuple[bool, str]:
#     """Validate IP address format"""
#     import ipaddress
#     try:
#         ipaddress.ip_address(value)
#         return True, "Valid IP address"
#     except ValueError:
#         return False, "Invalid IP address format"

# def _validate_notification_type(value: str) -> Tuple[bool, str]:
#     """Validate notification type"""
#     allowed_types = ['welcome', 'payment', 'expiry', 'usage', 'security', 'custom']
#     if value not in allowed_types:
#         return False, f"Notification type must be one of: {', '.join(allowed_types)}"
#     return True, "Valid notification type"

# def _validate_email(value: str) -> Tuple[bool, str]:
#     """Validate email format"""
#     try:
#         validate_email(value)
#         return True, "Valid email"
#     except ValidationError:
#         return False, "Invalid email format"

# # ==================== BATCH VALIDATION ====================

# def validate_batch_signal_data(signal_name: str, data_list: List[Dict]) -> Dict[str, Any]:
#     """
#     Validate a batch of signal data
#     Returns summary of validation results
#     """
#     results = {
#         'total': len(data_list),
#         'valid': 0,
#         'invalid': 0,
#         'errors': []
#     }
    
#     for i, data in enumerate(data_list):
#         is_valid, error = validate_signal_data(signal_name, data)
#         if is_valid:
#             results['valid'] += 1
#         else:
#             results['invalid'] += 1
#             results['errors'].append({
#                 'index': i,
#                 'data': {k: v for k, v in data.items() if k != 'password'},  # Hide password
#                 'error': error
#             })
    
#     return results




"""
Signal Data Validators
Validate signal data before emission
"""

import logging
import re
import uuid
import ipaddress
from typing import Dict, Any, Tuple, List

from django.core.validators import validate_email
from django.core.exceptions import ValidationError

logger = logging.getLogger(__name__)

# ==================== VALIDATION FUNCTIONS ====================

def validate_signal_data(signal_name: str, data: Dict[str, Any]) -> Tuple[bool, str]:
    """
    Validate signal data before emitting
    Returns (is_valid, error_message)
    """

    validation_rules = {
        'pppoe_credentials_generated': {
            'required': ['user_id', 'username', 'pppoe_username', 'password', 'phone_number'],
            'validators': {
                'user_id': _validate_uuid_format,
                'username': _validate_username,
                'pppoe_username': _validate_pppoe_username,
                'password': _validate_password_strength,
                'phone_number': _validate_phone_number,
            }
        },
        'client_account_created': {
            'required': ['user_id', 'username', 'phone_number', 'connection_type'],
            'validators': {
                'user_id': _validate_uuid_format,
                'username': _validate_username,
                'phone_number': _validate_phone_number,
                'connection_type': _validate_connection_type,
            }
        },
        'pppoe_credentials_updated': {
            'required': ['user_id', 'username'],
            'validators': {
                'user_id': _validate_uuid_format,
                'username': _validate_username,
            }
        },
        'account_status_changed': {
            'required': ['user_id', 'username', 'is_active', 'reason'],
            'validators': {
                'user_id': _validate_uuid_format,
                'username': _validate_username,
                'is_active': _validate_boolean,
            }
        },
        'authentication_failed': {
            'required': ['username', 'ip_address', 'failure_type'],
            'validators': {
                'username': _validate_username,
                'ip_address': _validate_ip_address,
                'failure_type': _validate_failure_type,
            }
        },
        'send_notification': {
            'required': ['user_id', 'notification_type', 'data'],
            'validators': {
                'user_id': _validate_uuid_format,
                'notification_type': _validate_notification_type,
                'data': _validate_dict,
            }
        }
    }

    if signal_name not in validation_rules:
        return False, f"Unknown signal: {signal_name}"

    rules = validation_rules[signal_name]

    for field in rules['required']:
        if field not in data:
            return False, f"Missing required field: {field}"

    for field, validator in rules.get('validators', {}).items():
        if field in data:
            try:
                is_valid, message = validator(data[field])
                if not is_valid:
                    return False, f"Invalid {field}: {message}"
            except Exception as e:
                logger.exception("Validation exception")
                return False, f"Validation error for {field}: {str(e)}"

    return True, "Valid"

# ==================== FIELD VALIDATORS ====================

def _validate_uuid_format(value: str) -> Tuple[bool, str]:
    try:
        uuid.UUID(str(value))
        return True, "Valid UUID"
    except ValueError:
        return False, "Invalid UUID format"

def _validate_username(value: str) -> Tuple[bool, str]:
    if not value or len(value) < 3:
        return False, "Username must be at least 3 characters"
    if len(value) > 50:
        return False, "Username must be 50 characters or less"
    if not re.match(r'^[a-zA-Z0-9_.-]+$', value):
        return False, "Username can only contain letters, numbers, dots, dashes, and underscores"
    return True, "Valid username"

def _validate_pppoe_username(value: str) -> Tuple[bool, str]:
    if not value or len(value) < 3:
        return False, "PPPoE username must be at least 3 characters"
    if len(value) > 32:
        return False, "PPPoE username must be 32 characters or less"
    if not re.match(r'^[a-zA-Z0-9_.-]+$', value):
        return False, "PPPoE username can only contain letters, numbers, dots, dashes, and underscores"
    return True, "Valid PPPoE username"

def _validate_password_strength(value: str) -> Tuple[bool, str]:
    if not value or len(value) < 8:
        return False, "Password must be at least 8 characters"

    if not any(c.isupper() for c in value):
        return False, "Password must contain an uppercase letter"
    if not any(c.islower() for c in value):
        return False, "Password must contain a lowercase letter"
    if not any(c.isdigit() for c in value):
        return False, "Password must contain a digit"

    return True, "Strong password"

def _validate_phone_number(value: str) -> Tuple[bool, str]:
    if not value:
        return False, "Phone number is required"

    clean = re.sub(r'[^\d+]', '', str(value))

    if clean.startswith('+254') and len(clean) == 13:
        return True, "Valid Kenyan phone number"
    if clean.startswith('254') and len(clean) == 12:
        return True, "Valid Kenyan phone number"
    if clean.startswith('0') and len(clean) == 10:
        return True, "Valid Kenyan phone number"
    if clean.startswith('7') and len(clean) == 9:
        return True, "Valid Kenyan phone number"

    return False, "Invalid phone number format"

def _validate_ip_address(value: str) -> Tuple[bool, str]:
    try:
        ipaddress.ip_address(value)
        return True, "Valid IP address"
    except ValueError:
        return False, "Invalid IP address format"

def _validate_notification_type(value: str) -> Tuple[bool, str]:
    allowed = ['welcome', 'payment', 'expiry', 'usage', 'security', 'custom']
    if value not in allowed:
        return False, f"Notification type must be one of: {', '.join(allowed)}"
    return True, "Valid notification type"

def _validate_email(value: str) -> Tuple[bool, str]:
    try:
        validate_email(value)
        return True, "Valid email"
    except ValidationError:
        return False, "Invalid email format"

def _validate_connection_type(value: str) -> Tuple[bool, str]:
    if value not in ['hotspot', 'pppoe']:
        return False, "Connection type must be 'hotspot' or 'pppoe'"
    return True, "Valid connection type"

def _validate_failure_type(value: str) -> Tuple[bool, str]:
    allowed = ['pppoe', 'phone', 'admin', 'unknown']
    if value not in allowed:
        return False, f"Failure type must be one of: {', '.join(allowed)}"
    return True, "Valid failure type"

def _validate_boolean(value: Any) -> Tuple[bool, str]:
    if not isinstance(value, bool):
        return False, "Value must be boolean"
    return True, "Valid boolean"

def _validate_dict(value: Any) -> Tuple[bool, str]:
    if not isinstance(value, dict):
        return False, "Value must be a dictionary"
    return True, "Valid dictionary"

# ==================== BATCH VALIDATION ====================

def validate_batch_signal_data(
    signal_name: str,
    data_list: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Validate a batch of signal data
    Returns summary of validation results
    """

    results = {
        'total': len(data_list),
        'valid': 0,
        'invalid': 0,
        'errors': []
    }

    for index, data in enumerate(data_list):
        is_valid, error = validate_signal_data(signal_name, data)
        if is_valid:
            results['valid'] += 1
        else:
            results['invalid'] += 1
            results['errors'].append({
                'index': index,
                'data': {k: v for k, v in data.items() if k != 'password'},
                'error': error
            })

    return results



