# """
# Internet Plans - Validators
# Validation utilities for plans and subscriptions
# """

# import re
# from typing import Tuple, Dict, Any
# from decimal import Decimal


# def validate_access_methods(access_methods: Dict) -> Tuple[bool, str]:
#     """
#     Validate access methods configuration
    
#     Args:
#         access_methods: Dictionary with hotspot and pppoe configurations
        
#     Returns:
#         Tuple of (is_valid, error_message)
#     """
#     if not isinstance(access_methods, dict):
#         return False, 'Access methods must be a dictionary'
    
#     # Check for required methods
#     required_methods = ['hotspot', 'pppoe']
#     for method in required_methods:
#         if method not in access_methods:
#             return False, f'Missing {method} configuration'
    
#     # Validate each method
#     for method, config in access_methods.items():
#         if not isinstance(config, dict):
#             return False, f'{method} configuration must be a dictionary'
        
#         # Check enabled status
#         if not isinstance(config.get('enabled', False), bool):
#             return False, f'{method}.enabled must be a boolean'
        
#         # Validate enabled methods
#         if config.get('enabled', False):
#             required_fields = ['downloadSpeed', 'uploadSpeed', 'dataLimit', 'usageLimit']
#             for field in required_fields:
#                 if field not in config:
#                     return False, f'Missing {field} for enabled {method}'
                
#                 field_config = config[field]
#                 if not isinstance(field_config, dict):
#                     return False, f'{method}.{field} must be a dictionary'
                
#                 if 'value' not in field_config:
#                     return False, f'{method}.{field}.value is required'
                
#                 # Validate value
#                 value = field_config['value']
#                 if field in ['downloadSpeed', 'uploadSpeed']:
#                     if not _validate_speed_value(value):
#                         return False, f'{method}.{field}.value must be a positive number or "unlimited"'
#                 elif field in ['dataLimit', 'usageLimit']:
#                     if not _validate_limit_value(value):
#                         return False, f'{method}.{field}.value must be a positive number or "unlimited"'
    
#     # Check that at least one method is enabled
#     enabled_methods = [
#         method for method, config in access_methods.items() 
#         if config.get('enabled', False)
#     ]
    
#     if not enabled_methods:
#         return False, 'At least one access method must be enabled'
    
#     return True, 'Valid'


# def _validate_speed_value(value: Any) -> bool:
#     """Validate speed value"""
#     if isinstance(value, (int, float, Decimal)):
#         return value > 0
#     elif isinstance(value, str):
#         if value.lower() == 'unlimited':
#             return True
#         try:
#             return float(value) > 0
#         except (ValueError, TypeError):
#             return False
#     return False


# def _validate_limit_value(value: Any) -> bool:
#     """Validate limit value"""
#     if isinstance(value, (int, float, Decimal)):
#         return value >= 0
#     elif isinstance(value, str):
#         if value.lower() == 'unlimited':
#             return True
#         try:
#             return float(value) >= 0
#         except (ValueError, TypeError):
#             return False
#     return False


# def validate_mac_address(mac_address: str) -> bool:
#     """
#     Validate MAC address format
    
#     Args:
#         mac_address: MAC address string
        
#     Returns:
#         True if valid, False otherwise
#     """
#     if not mac_address:
#         return True
    
#     mac_pattern = re.compile(r'^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$')
#     return bool(mac_pattern.match(mac_address))


# def validate_phone_number(phone_number: str) -> Tuple[bool, str]:
#     """
#     Validate phone number format
    
#     Args:
#         phone_number: Phone number string
        
#     Returns:
#         Tuple of (is_valid, normalized_phone)
#     """
#     if not phone_number:
#         return False, ''
    
#     try:
#         from authentication.models.validators import PhoneValidation
#         if PhoneValidation.is_valid_kenyan_phone(phone_number):
#             normalized = PhoneValidation.normalize_kenyan_phone(phone_number)
#             return True, normalized
#         else:
#             return False, phone_number
#     except ImportError:
#         # Basic validation if authentication app not available
#         phone_clean = ''.join(filter(str.isdigit, phone_number))
#         if len(phone_clean) >= 9 and len(phone_clean) <= 13:
#             return True, phone_clean
#         return False, phone_number


# def validate_duration_hours(duration_hours: int) -> bool:
#     """
#     Validate duration in hours
    
#     Args:
#         duration_hours: Duration in hours
        
#     Returns:
#         True if valid, False otherwise
#     """
#     return 1 <= duration_hours <= 744  # Max 31 days


# def validate_price(price: Any) -> Tuple[bool, Decimal]:
#     """
#     Validate price value
    
#     Args:
#         price: Price value
        
#     Returns:
#         Tuple of (is_valid, decimal_price)
#     """
#     try:
#         if isinstance(price, (int, float, Decimal)):
#             decimal_price = Decimal(str(price))
#         elif isinstance(price, str):
#             decimal_price = Decimal(price)
#         else:
#             return False, Decimal('0')
        
#         if decimal_price < 0:
#             return False, decimal_price
        
#         return True, decimal_price
#     except Exception:
#         return False, Decimal('0')







"""
Internet Plans - Validators
Validation utilities for plans and pricing
ORIGINAL LOGIC MAINTAINED with improvements
"""

import re
from typing import Tuple, Dict, Any
from decimal import Decimal


def validate_access_methods(access_methods: Dict) -> Tuple[bool, str]:
    """
    Validate access methods configuration
    ORIGINAL LOGIC MAINTAINED from your code
    """
    if not isinstance(access_methods, dict):
        return False, 'Access methods must be a dictionary'
    
    # Check for required methods
    required_methods = ['hotspot', 'pppoe']
    for method in required_methods:
        if method not in access_methods:
            return False, f'Missing {method} configuration'
    
    # Validate each method
    for method, config in access_methods.items():
        if not isinstance(config, dict):
            return False, f'{method} configuration must be a dictionary'
        
        # Check enabled status
        if not isinstance(config.get('enabled', False), bool):
            return False, f'{method}.enabled must be a boolean'
        
        # Validate enabled methods
        if config.get('enabled', False):
            required_fields = ['downloadSpeed', 'uploadSpeed', 'dataLimit', 'usageLimit']
            for field in required_fields:
                if field not in config:
                    return False, f'Missing {field} for enabled {method}'
                
                field_config = config[field]
                if not isinstance(field_config, dict):
                    return False, f'{method}.{field} must be a dictionary'
                
                if 'value' not in field_config:
                    return False, f'{method}.{field}.value is required'
                
                # Validate value
                value = field_config['value']
                if field in ['downloadSpeed', 'uploadSpeed']:
                    if not validate_speed_value(value):
                        return False, f'{method}.{field}.value must be a positive number or "unlimited"'
                elif field in ['dataLimit', 'usageLimit']:
                    if not validate_limit_value(value):
                        return False, f'{method}.{field}.value must be a positive number or "unlimited"'
    
    # Check that at least one method is enabled
    enabled_methods = [
        method for method, config in access_methods.items() 
        if config.get('enabled', False)
    ]
    
    if not enabled_methods:
        return False, 'At least one access method must be enabled'
    
    return True, 'Valid'


def validate_speed_value(value: Any) -> bool:
    """Validate speed value - ORIGINAL LOGIC MAINTAINED"""
    if isinstance(value, (int, float, Decimal)):
        return value > 0
    elif isinstance(value, str):
        if value.lower() == 'unlimited':
            return True
        try:
            return float(value) > 0
        except (ValueError, TypeError):
            return False
    return False


def validate_limit_value(value: Any) -> bool:
    """Validate limit value - ORIGINAL LOGIC MAINTAINED"""
    if isinstance(value, (int, float, Decimal)):
        return value >= 0
    elif isinstance(value, str):
        if value.lower() == 'unlimited':
            return True
        try:
            return float(value) >= 0
        except (ValueError, TypeError):
            return False
    return False


def validate_mac_address(mac_address: str) -> bool:
    """
    Validate MAC address format
    ORIGINAL LOGIC MAINTAINED
    """
    if not mac_address:
        return True
    
    mac_pattern = re.compile(r'^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$')
    return bool(mac_pattern.match(mac_address))


def validate_phone_number(phone_number: str) -> Tuple[bool, str]:
    """
    Validate phone number format
    UPDATED: Abstracted Authentication app dependency
    """
    if not phone_number:
        return False, ''
    
    try:
        # Try to use Authentication app if available
        from authentication.models.validators import PhoneValidation
        if PhoneValidation.is_valid_kenyan_phone(phone_number):
            normalized = PhoneValidation.normalize_kenyan_phone(phone_number)
            return True, normalized
        else:
            return False, phone_number
    except ImportError:
        # Basic validation if authentication app not available
        phone_clean = ''.join(filter(str.isdigit, phone_number))
        if len(phone_clean) >= 9 and len(phone_clean) <= 13:
            return True, phone_clean
        return False, phone_number


def validate_duration_hours(duration_hours: int) -> bool:
    """
    Validate duration in hours
    ORIGINAL LOGIC MAINTAINED
    """
    return 1 <= duration_hours <= 744  # Max 31 days


def validate_price(price: Any) -> Tuple[bool, Decimal]:
    """
    Validate price value
    ORIGINAL LOGIC MAINTAINED
    """
    try:
        if isinstance(price, (int, float, Decimal)):
            decimal_price = Decimal(str(price))
        elif isinstance(price, str):
            decimal_price = Decimal(price)
        else:
            return False, Decimal('0')
        
        if decimal_price < 0:
            return False, decimal_price
        
        return True, decimal_price
    except Exception:
        return False, Decimal('0')


# NEW: Additional validators
def validate_json_config(config: Dict, schema: Dict) -> Tuple[bool, str]:
    """
    Validate JSON configuration against schema
    NEW: For flexible configuration validation
    """
    if not isinstance(config, dict):
        return False, 'Configuration must be a dictionary'
    
    for key, rules in schema.items():
        if rules.get('required', False) and key not in config:
            return False, f'Missing required field: {key}'
        
        if key in config:
            value = config[key]
            value_type = rules.get('type')
            
            if value_type and not isinstance(value, value_type):
                return False, f'Field {key} must be of type {value_type.__name__}'
            
            # Check min/max for numeric values
            if isinstance(value, (int, float, Decimal)):
                if 'min' in rules and value < rules['min']:
                    return False, f'Field {key} must be at least {rules["min"]}'
                if 'max' in rules and value > rules['max']:
                    return False, f'Field {key} must be at most {rules["max"]}'
            
            # Check pattern for strings
            if isinstance(value, str) and 'pattern' in rules:
                if not re.match(rules['pattern'], value):
                    return False, f'Field {key} does not match required pattern'
    
    return True, 'Valid'


def validate_discount_code_format(code: str) -> bool:
    """
    Validate discount code format
    NEW: For discount code validation
    """
    if not code or len(code) < 4 or len(code) > 20:
        return False
    
    # Allow alphanumeric and hyphens
    pattern = re.compile(r'^[A-Za-z0-9\-]+$')
    return bool(pattern.match(code))