


# """
# Internet Plans - Validators
# Validation utilities for plans and pricing
# """

# import re
# from typing import Tuple, Dict, Any
# from decimal import Decimal


# def validate_access_methods(access_methods: Dict) -> Tuple[bool, str]:
#     """
#     Validate access methods configuration - SIMPLIFIED
#     ONLY validate technical specifications, NOT network/auth features
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
        
#         # Validate enabled methods - ONLY technical specs
#         if config.get('enabled', False):
#             # ONLY validate technical specifications:
#             required_fields = ['downloadSpeed', 'uploadSpeed', 'dataLimit', 'usageLimit']
#             for field in required_fields:
#                 if field not in config:
#                     return False, f'Missing {field} for enabled {method}'
                
#                 field_config = config[field]
#                 if not isinstance(field_config, dict):
#                     return False, f'{method}.{field} must be a dictionary'
                
#                 if 'value' not in field_config:
#                     return False, f'{method}.{field}.value is required'
                
#                 # Validate value - technical specs only
#                 value = field_config['value']
#                 if field in ['downloadSpeed', 'uploadSpeed']:
#                     if not validate_speed_value(value):
#                         return False, f'{method}.{field}.value must be a positive number or "unlimited"'
#                 elif field in ['dataLimit', 'usageLimit']:
#                     if not validate_limit_value(value):
#                         return False, f'{method}.{field}.value must be a positive number or "unlimited"'
    
#     # Check that at least one method is enabled
#     enabled_methods = [
#         method for method, config in access_methods.items() 
#         if config.get('enabled', False)
#     ]
    
#     if not enabled_methods:
#         return False, 'At least one access method must be enabled'
    
#     return True, 'Valid'


# def validate_speed_value(value: Any) -> bool:
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


# def validate_limit_value(value: Any) -> bool:
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
#     """
#     if not mac_address:
#         return True
    
#     mac_pattern = re.compile(r'^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$')
#     return bool(mac_pattern.match(mac_address))


# def validate_phone_number(phone_number: str) -> Tuple[bool, str]:
#     """
#     Validate phone number format
#     """
#     if not phone_number:
#         return False, ''
    
#     # Basic validation
#     phone_clean = ''.join(filter(str.isdigit, phone_number))
#     if len(phone_clean) >= 9 and len(phone_clean) <= 13:
#         return True, phone_clean
#     return False, phone_number


# def validate_duration_hours(duration_hours: int) -> bool:
#     """
#     Validate duration in hours
#     """
#     return 1 <= duration_hours <= 744  # Max 31 days


# def validate_price(price: Any) -> Tuple[bool, Decimal]:
#     """
#     Validate price value
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


# def validate_json_config(config: Dict, schema: Dict) -> Tuple[bool, str]:
#     """
#     Validate JSON configuration against schema
#     """
#     if not isinstance(config, dict):
#         return False, 'Configuration must be a dictionary'
    
#     for key, rules in schema.items():
#         if rules.get('required', False) and key not in config:
#             return False, f'Missing required field: {key}'
        
#         if key in config:
#             value = config[key]
#             value_type = rules.get('type')
            
#             if value_type and not isinstance(value, value_type):
#                 return False, f'Field {key} must be of type {value_type.__name__}'
            
#             # Check min/max for numeric values
#             if isinstance(value, (int, float, Decimal)):
#                 if 'min' in rules and value < rules['min']:
#                     return False, f'Field {key} must be at least {rules["min"]}'
#                 if 'max' in rules and value > rules['max']:
#                     return False, f'Field {key} must be at most {rules["max"]}'
            
#             # Check pattern for strings
#             if isinstance(value, str) and 'pattern' in rules:
#                 if not re.match(rules['pattern'], value):
#                     return False, f'Field {key} does not match required pattern'
    
#     return True, 'Valid'


# def validate_discount_code_format(code: str) -> bool:
#     """
#     Validate discount code format
#     """
#     if not code or len(code) < 4 or len(code) > 20:
#         return False
    
#     # Allow alphanumeric and hyphens
#     pattern = re.compile(r'^[A-Za-z0-9\-]+$')
#     return bool(pattern.match(code))







"""
Internet Plans - Validators
Validation utilities for plans and pricing
"""

import re
from typing import Tuple, Dict, Any
from decimal import Decimal
from datetime import datetime


def validate_access_methods(access_methods: Dict) -> Tuple[bool, str]:
    """
    Validate access methods configuration - SIMPLIFIED
    ONLY validate technical specifications, NOT network/auth features
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
        
        # Validate enabled methods - ONLY technical specs
        if config.get('enabled', False):
            # ONLY validate technical specifications:
            required_fields = ['downloadSpeed', 'uploadSpeed', 'dataLimit', 'usageLimit']
            for field in required_fields:
                if field not in config:
                    return False, f'Missing {field} for enabled {method}'
                
                field_config = config[field]
                if not isinstance(field_config, dict):
                    return False, f'{method}.{field} must be a dictionary'
                
                if 'value' not in field_config:
                    return False, f'{method}.{field}.value is required'
                
                # Validate value - technical specs only
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
    """Validate speed value"""
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
    """Validate limit value"""
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
    """
    if not mac_address:
        return True
    
    mac_pattern = re.compile(r'^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$')
    return bool(mac_pattern.match(mac_address))


def validate_phone_number(phone_number: str) -> Tuple[bool, str]:
    """
    Validate phone number format
    """
    if not phone_number:
        return False, ''
    
    # Basic validation
    phone_clean = ''.join(filter(str.isdigit, phone_number))
    if len(phone_clean) >= 9 and len(phone_clean) <= 13:
        return True, phone_clean
    return False, phone_number


def validate_duration_hours(duration_hours: int) -> bool:
    """
    Validate duration in hours
    """
    return 1 <= duration_hours <= 744  # Max 31 days


def validate_price(price: Any) -> Tuple[bool, Decimal]:
    """
    Validate price value
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


def validate_json_config(config: Dict, schema: Dict) -> Tuple[bool, str]:
    """
    Validate JSON configuration against schema
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
    """
    if not code or len(code) < 4 or len(code) > 20:
        return False
    
    # Allow alphanumeric and hyphens
    pattern = re.compile(r'^[A-Za-z0-9\-]+$')
    return bool(pattern.match(code))


def validate_date_format(date_string: str, format_string: str = None) -> Tuple[bool, datetime]:
    """
    Validate and parse date string format
    
    Args:
        date_string: Date string to validate
        format_string: Optional specific format to validate against
        
    Returns:
        Tuple of (is_valid, datetime_object or error_message)
    """
    if not date_string:
        return False, "Date string cannot be empty"
    
    # Common date formats
    common_formats = [
        '%Y-%m-%d',           # 2024-01-15
        '%Y-%m-%d %H:%M:%S',  # 2024-01-15 14:30:00
        '%d/%m/%Y',           # 15/01/2024
        '%m/%d/%Y',           # 01/15/2024
        '%Y%m%d',             # 20240115
        '%Y-%m-%dT%H:%M:%S',  # ISO format: 2024-01-15T14:30:00
        '%Y-%m-%dT%H:%M:%S%z', # ISO with timezone: 2024-01-15T14:30:00+03:00
        '%Y-%m-%d %H:%M',     # 2024-01-15 14:30
        '%d-%b-%Y',           # 15-Jan-2024
        '%d %B %Y',           # 15 January 2024
    ]
    
    if format_string:
        # Validate against specific format
        try:
            date_obj = datetime.strptime(date_string, format_string)
            return True, date_obj
        except ValueError:
            return False, f"Date '{date_string}' does not match format '{format_string}'"
    
    # Try all common formats
    for fmt in common_formats:
        try:
            date_obj = datetime.strptime(date_string, fmt)
            return True, date_obj
        except ValueError:
            continue
    
    # Try parsing as ISO format (more lenient)
    try:
        date_obj = datetime.fromisoformat(date_string.replace('Z', '+00:00'))
        return True, date_obj
    except ValueError:
        pass
    
    # If all parsing fails, return error
    return False, f"Date '{date_string}' is not in a recognized format"


def validate_date_range(start_date: str, end_date: str) -> Tuple[bool, str]:
    """
    Validate that end date is after start date
    
    Args:
        start_date: Start date string
        end_date: End date string
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    # Validate start date
    is_valid_start, parsed_start = validate_date_format(start_date)
    if not is_valid_start:
        return False, f"Invalid start date: {parsed_start}"
    
    # Validate end date
    is_valid_end, parsed_end = validate_date_format(end_date)
    if not is_valid_end:
        return False, f"Invalid end date: {parsed_end}"
    
    # Check if end date is after start date
    if parsed_end <= parsed_start:
        return False, "End date must be after start date"
    
    return True, "Valid date range"


def validate_future_date(date_string: str) -> Tuple[bool, str]:
    """
    Validate that date is in the future
    
    Args:
        date_string: Date string to validate
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    is_valid, parsed_date = validate_date_format(date_string)
    if not is_valid:
        return False, parsed_date
    
    if parsed_date <= datetime.now():
        return False, "Date must be in the future"
    
    return True, "Valid future date"


def validate_past_date(date_string: str) -> Tuple[bool, str]:
    """
    Validate that date is in the past
    
    Args:
        date_string: Date string to validate
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    is_valid, parsed_date = validate_date_format(date_string)
    if not is_valid:
        return False, parsed_date
    
    if parsed_date >= datetime.now():
        return False, "Date must be in the past"
    
    return True, "Valid past date"


def validate_date_not_expired(date_string: str) -> Tuple[bool, str]:
    """
    Validate that date has not expired (is not in the past)
    
    Args:
        date_string: Date string to validate
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    is_valid, parsed_date = validate_date_format(date_string)
    if not is_valid:
        return False, parsed_date
    
    if parsed_date < datetime.now():
        return False, "Date has expired"
    
    return True, "Date is valid and not expired"