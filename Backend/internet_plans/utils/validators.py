




"""
Internet Plans - Validators
UPDATED: Production-ready validation utilities with snake_case throughout
FIXED: Better handling of None values, empty strings, and price validation
"""

import re
import json
from typing import Tuple, Dict, Any, Optional, Union, List
from decimal import Decimal, InvalidOperation
from datetime import datetime, date, time
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)


def validate_access_methods(access_methods: Dict[str, Any]) -> Tuple[bool, str]:
    """
    Validate access methods configuration
    Returns: (is_valid, error_message)
    """
    if not access_methods:
        return False, "Access methods configuration is required"
    
    if not isinstance(access_methods, dict):
        return False, "Access methods must be a dictionary"
    
    # Check for required methods
    required_methods = ['hotspot', 'pppoe']
    for method in required_methods:
        if method not in access_methods:
            return False, f"Missing {method} configuration"
    
    errors = []
    
    for method, config in access_methods.items():
        if not isinstance(config, dict):
            errors.append(f"{method}: Configuration must be a dictionary")
            continue
        
        # Validate enabled field
        enabled = config.get('enabled', False)
        if not isinstance(enabled, bool):
            errors.append(f"{method}.enabled: Must be a boolean")
        
        # Only validate if method is enabled
        if enabled:
            # Validate required fields for enabled methods
            required_fields = ['download_speed', 'upload_speed', 'data_limit', 'usage_limit']
            for field in required_fields:
                if field not in config:
                    errors.append(f"{method}.{field}: Required field missing")
                    continue
                
                field_config = config[field]
                if not isinstance(field_config, dict):
                    errors.append(f"{method}.{field}: Must be a dictionary")
                    continue
                
                # Validate value field
                value = field_config.get('value')
                if value is None or value == '':
                    errors.append(f"{method}.{field}.value: Value is required")
                else:
                    # Validate that value is a valid number or 'unlimited'
                    if isinstance(value, str) and value.lower() == 'unlimited':
                        pass  # 'unlimited' is valid
                    else:
                        try:
                            float_val = float(value)
                            if float_val < 0:
                                errors.append(f"{method}.{field}.value: Must be non-negative")
                        except (ValueError, TypeError):
                            errors.append(f"{method}.{field}.value: Must be a valid number or 'unlimited'")
                
                # Validate unit field
                unit = field_config.get('unit')
                if not unit:
                    errors.append(f"{method}.{field}.unit: Unit is required")
                elif not isinstance(unit, str):
                    errors.append(f"{method}.{field}.unit: Must be a string")
            
            # Validate numeric fields - Handle None values properly
            numeric_fields = ['bandwidth_limit', 'max_devices', 'session_timeout', 'idle_timeout', 'mtu']
            for field in numeric_fields:
                if field in config:
                    value = config[field]
                    # Skip validation if value is None (will use default later)
                    if value is None:
                        continue
                    
                    # Skip if value is empty string
                    if isinstance(value, str) and value.strip() == '':
                        continue
                    
                    try:
                        # Check if it's a valid number
                        if isinstance(value, (int, float)):
                            # Valid number - ensure non-negative if applicable
                            if field in ['max_devices', 'session_timeout', 'idle_timeout', 'mtu']:
                                if value < 0:
                                    errors.append(f"{method}.{field}: Must be non-negative")
                        elif isinstance(value, str):
                            # Try to convert to number
                            num_val = float(value)
                            if field in ['max_devices', 'session_timeout', 'idle_timeout', 'mtu']:
                                if num_val < 0:
                                    errors.append(f"{method}.{field}: Must be non-negative")
                        else:
                            errors.append(f"{method}.{field}: Must be a number")
                    except (ValueError, TypeError):
                        errors.append(f"{method}.{field}: Must be a valid number")
            
            # Validate string fields
            string_fields = ['ip_pool', 'service_name']
            for field in string_fields:
                if field in config and config[field] is not None:
                    value = config[field]
                    if not isinstance(value, str):
                        errors.append(f"{method}.{field}: Must be a string")
            
            # Validate boolean fields
            boolean_fields = ['mac_binding']
            for field in boolean_fields:
                if field in config and config[field] is not None:
                    if not isinstance(config[field], bool):
                        errors.append(f"{method}.{field}: Must be a boolean")
    
    # Check if at least one method is enabled
    enabled_methods = [
        method for method, config in access_methods.items()
        if config.get('enabled', False)
    ]
    if not enabled_methods:
        errors.append("At least one access method must be enabled")
    
    if errors:
        return False, "; ".join(errors)
    
    return True, "Valid"


def validate_speed_value(value: Any) -> bool:
    """Validate speed value"""
    if value is None:
        return False
    
    if isinstance(value, (int, float, Decimal)):
        return value > 0
    
    if isinstance(value, str):
        value = value.strip().lower()
        if value == 'unlimited':
            return True
        try:
            num_value = Decimal(value)
            return num_value > 0
        except (ValueError, InvalidOperation):
            return False
    
    return False


def validate_limit_value(value: Any) -> bool:
    """Validate limit value"""
    if value is None:
        return False
    
    if isinstance(value, (int, float, Decimal)):
        return value >= 0
    
    if isinstance(value, str):
        value = value.strip().lower()
        if value == 'unlimited':
            return True
        try:
            num_value = Decimal(value)
            return num_value >= 0
        except (ValueError, InvalidOperation):
            return False
    
    return False


def validate_mac_address(mac_address: str) -> Tuple[bool, str]:
    """
    Validate MAC address format
    Returns: (is_valid, normalized_mac)
    """
    if not mac_address:
        return True, ""
    
    # Remove separators and normalize
    mac_clean = mac_address.strip().upper().replace(':', '').replace('-', '').replace('.', '')
    
    # Validate length and characters
    if len(mac_clean) != 12:
        return False, mac_address
    
    if not re.match(r'^[0-9A-F]{12}$', mac_clean):
        return False, mac_address
    
    # Format as colon-separated
    normalized = ':'.join(mac_clean[i:i+2] for i in range(0, 12, 2))
    return True, normalized


def validate_phone_number(phone_number: str) -> Tuple[bool, str]:
    """
    Validate phone number format
    Returns: (is_valid, normalized_phone)
    """
    if not phone_number:
        return False, ""
    
    # Remove all non-digit characters except leading +
    phone_clean = re.sub(r'[^\d+]', '', phone_number.strip())
    
    # Check for valid Kenyan phone number patterns
    if phone_clean.startswith('+254'):
        # International format: +2547XXXXXXXX
        if len(phone_clean) == 13:
            return True, phone_clean
    elif phone_clean.startswith('254'):
        # Local international format: 2547XXXXXXXX
        if len(phone_clean) == 12:
            return True, '+' + phone_clean
    elif phone_clean.startswith('07'):
        # Local format: 07XXXXXXXX
        if len(phone_clean) == 10:
            return True, '+254' + phone_clean[1:]
    elif phone_clean.startswith('7'):
        # Short format: 7XXXXXXXX
        if len(phone_clean) == 9:
            return True, '+254' + phone_clean
    
    return False, phone_number


def validate_duration_hours(duration_hours: int) -> Tuple[bool, str]:
    """
    Validate duration in hours
    Returns: (is_valid, error_message)
    """
    if not isinstance(duration_hours, int):
        return False, "Duration must be an integer"
    
    if duration_hours < 1:
        return False, "Duration must be at least 1 hour"
    
    if duration_hours > 744:  # 31 days
        return False, "Duration cannot exceed 744 hours (31 days)"
    
    return True, "Valid"


def validate_price(price: Any, allow_zero: bool = True) -> Tuple[bool, Union[Decimal, str]]:
    """
    Validate price value
    Returns: (is_valid, price_decimal_or_error_message)
    """
    try:
        if price is None:
            return False, "Price cannot be None"
        
        if isinstance(price, (int, float, Decimal)):
            decimal_price = Decimal(str(price))
        elif isinstance(price, str):
            price = price.strip()
            if not price:
                return False, "Price cannot be empty"
            try:
                decimal_price = Decimal(price)
            except (ValueError, InvalidOperation):
                return False, f"Invalid price format: '{price}'"
        else:
            return False, f"Invalid price type: {type(price).__name__}"
        
        if decimal_price < 0:
            return False, f"Price cannot be negative: {decimal_price}"
        
        if not allow_zero and decimal_price == 0:
            return False, "Price must be greater than zero for paid plans"
        
        # Round to 2 decimal places
        decimal_price = decimal_price.quantize(Decimal('0.01'))
        
        return True, decimal_price
        
    except Exception as e:
        logger.error(f"Price validation error: {e}")
        return False, f"Price validation failed: {str(e)}"


def validate_json_config(config: Dict, schema: Dict) -> Tuple[bool, str]:
    """
    Validate JSON configuration against schema
    Returns: (is_valid, error_message)
    """
    if not isinstance(config, dict):
        return False, "Configuration must be a dictionary"
    
    errors = []
    
    for key, rules in schema.items():
        # Check required fields
        if rules.get('required', False) and key not in config:
            errors.append(f"Missing required field: {key}")
            continue
        
        # Skip validation if field not present and not required
        if key not in config:
            continue
        
        value = config[key]
        
        # Skip validation for None values
        if value is None:
            continue
        
        # Type validation
        expected_type = rules.get('type')
        if expected_type:
            if expected_type == 'number':
                if not isinstance(value, (int, float, Decimal)):
                    # Try to convert string to number
                    if isinstance(value, str) and value.strip():
                        try:
                            float(value)
                        except ValueError:
                            errors.append(f"{key}: Must be a number")
                    else:
                        errors.append(f"{key}: Must be a number")
            elif expected_type == 'string':
                if not isinstance(value, str):
                    errors.append(f"{key}: Must be a string")
            elif expected_type == 'boolean':
                if not isinstance(value, bool):
                    errors.append(f"{key}: Must be a boolean")
            elif expected_type == 'array':
                if not isinstance(value, list):
                    errors.append(f"{key}: Must be an array")
            elif expected_type == 'object':
                if not isinstance(value, dict):
                    errors.append(f"{key}: Must be an object")
            elif not isinstance(value, expected_type):
                errors.append(f"{key}: Must be of type {expected_type.__name__}")
        
        # Value validation for numbers
        if isinstance(value, (int, float, Decimal)):
            if 'min' in rules and value < rules['min']:
                errors.append(f"{key}: Must be at least {rules['min']}")
            if 'max' in rules and value > rules['max']:
                errors.append(f"{key}: Must be at most {rules['max']}")
        
        # String validation
        if isinstance(value, str):
            value = value.strip()
            if 'min_length' in rules and len(value) < rules['min_length']:
                errors.append(f"{key}: Must be at least {rules['min_length']} characters")
            if 'max_length' in rules and len(value) > rules['max_length']:
                errors.append(f"{key}: Must be at most {rules['max_length']} characters")
            if 'pattern' in rules and not re.match(rules['pattern'], value):
                errors.append(f"{key}: Does not match required pattern")
            if 'choices' in rules and value not in rules['choices']:
                errors.append(f"{key}: Must be one of {rules['choices']}")
    
    if errors:
        return False, "; ".join(errors)
    
    return True, "Valid"


def validate_discount_code_format(code: str) -> Tuple[bool, str]:
    """
    Validate discount code format
    Returns: (is_valid, error_message)
    """
    if not code:
        return False, "Discount code cannot be empty"
    
    code = code.strip()
    
    if len(code) < 4:
        return False, "Discount code must be at least 4 characters"
    
    if len(code) > 20:
        return False, "Discount code cannot exceed 20 characters"
    
    # Allow alphanumeric, hyphens, and underscores
    pattern = re.compile(r'^[A-Za-z0-9\-_]+$')
    if not pattern.match(code):
        return False, "Discount code can only contain letters, numbers, hyphens, and underscores"
    
    return True, "Valid"


def validate_date_format(date_string: str, format_string: str = None) -> Tuple[bool, Union[datetime, str]]:
    """
    Validate and parse date string format
    Returns: (is_valid, datetime_object_or_error_message)
    """
    if not date_string:
        return False, "Date string cannot be empty"
    
    date_string = str(date_string).strip()
    
    if format_string:
        try:
            date_obj = datetime.strptime(date_string, format_string)
            return True, date_obj
        except ValueError as e:
            return False, f"Date '{date_string}' does not match format '{format_string}': {str(e)}"
    
    # Common date formats to try
    common_formats = [
        '%Y-%m-%d',           # 2024-01-15
        '%Y-%m-%d %H:%M:%S',  # 2024-01-15 14:30:00
        '%Y-%m-%d %H:%M',     # 2024-01-15 14:30
        '%Y-%m-%dT%H:%M:%S',  # ISO format without timezone
        '%Y-%m-%dT%H:%M:%S%z', # ISO with timezone
        '%Y-%m-%dT%H:%M:%S.%f', # ISO with microseconds
        '%Y-%m-%dT%H:%M:%S.%f%z', # ISO with microseconds and timezone
        '%d/%m/%Y',           # 15/01/2024
        '%m/%d/%Y',           # 01/15/2024
        '%d-%m-%Y',           # 15-01-2024
        '%Y%m%d',             # 20240115
        '%d %B %Y',           # 15 January 2024
        '%d %b %Y',           # 15 Jan 2024
        '%B %d, %Y',          # January 15, 2024
        '%b %d, %Y',          # Jan 15, 2024
    ]
    
    for fmt in common_formats:
        try:
            date_obj = datetime.strptime(date_string, fmt)
            return True, date_obj
        except ValueError:
            continue
    
    # Try ISO format parsing
    try:
        # Handle 'Z' timezone
        if date_string.endswith('Z'):
            date_string = date_string[:-1] + '+00:00'
        
        date_obj = datetime.fromisoformat(date_string)
        return True, date_obj
    except ValueError:
        pass
    
    return False, f"Date '{date_string}' is not in a recognized format"


def validate_date_range(start_date: str, end_date: str) -> Tuple[bool, str]:
    """
    Validate that end date is after start date
    Returns: (is_valid, error_message)
    """
    # Validate start date
    is_valid_start, start_result = validate_date_format(start_date)
    if not is_valid_start:
        return False, f"Invalid start date: {start_result}"
    
    # Validate end date
    is_valid_end, end_result = validate_date_format(end_date)
    if not is_valid_end:
        return False, f"Invalid end date: {end_result}"
    
    # Ensure we have datetime objects
    if not isinstance(start_result, datetime) or not isinstance(end_result, datetime):
        return False, "Failed to parse dates"
    
    # Compare dates
    if end_result <= start_result:
        return False, "End date must be after start date"
    
    return True, "Valid date range"


def validate_future_date(date_string: str, include_now: bool = False) -> Tuple[bool, str]:
    """
    Validate that date is in the future
    Returns: (is_valid, error_message)
    """
    is_valid, date_result = validate_date_format(date_string)
    if not is_valid:
        return False, date_result
    
    if not isinstance(date_result, datetime):
        return False, "Failed to parse date"
    
    now = timezone.now()
    
    if include_now:
        if date_result < now:
            return False, "Date must be in the present or future"
    else:
        if date_result <= now:
            return False, "Date must be in the future"
    
    return True, "Valid future date"


def validate_past_date(date_string: str, include_now: bool = False) -> Tuple[bool, str]:
    """
    Validate that date is in the past
    Returns: (is_valid, error_message)
    """
    is_valid, date_result = validate_date_format(date_string)
    if not is_valid:
        return False, date_result
    
    if not isinstance(date_result, datetime):
        return False, "Failed to parse date"
    
    now = timezone.now()
    
    if include_now:
        if date_result > now:
            return False, "Date must be in the past or present"
    else:
        if date_result >= now:
            return False, "Date must be in the past"
    
    return True, "Valid past date"


def validate_date_not_expired(date_string: str) -> Tuple[bool, str]:
    """
    Validate that date has not expired (is not in the past)
    Returns: (is_valid, error_message)
    """
    is_valid, date_result = validate_date_format(date_string)
    if not is_valid:
        return False, date_result
    
    if not isinstance(date_result, datetime):
        return False, "Failed to parse date"
    
    if date_result < timezone.now():
        return False, "Date has expired"
    
    return True, "Date is valid and not expired"


def validate_time_variant(data: Dict[str, Any]) -> Dict[str, str]:
    """
    Validate time variant configuration
    Returns: Dictionary of field errors
    """
    errors = {}
    
    if not isinstance(data, dict):
        return {'general': 'Time variant data must be a dictionary'}
    
    # Check if time variant is active
    if not data.get('is_active', False):
        return errors  # No validation needed if not active
    
    # Validate time range
    start_time = data.get('start_time')
    end_time = data.get('end_time')
    
    if start_time and end_time:
        try:
            # Parse times
            start = None
            end = None
            
            if isinstance(start_time, str):
                start = datetime.strptime(start_time, '%H:%M').time()
            elif isinstance(start_time, time):
                start = start_time
            elif isinstance(start_time, dict) and 'hours' in start_time and 'minutes' in start_time:
                start = time(hour=start_time['hours'], minute=start_time['minutes'])
            
            if isinstance(end_time, str):
                end = datetime.strptime(end_time, '%H:%M').time()
            elif isinstance(end_time, time):
                end = end_time
            elif isinstance(end_time, dict) and 'hours' in end_time and 'minutes' in end_time:
                end = time(hour=end_time['hours'], minute=end_time['minutes'])
            
            if start and end:
                if start >= end:
                    errors['end_time'] = 'End time must be after start time'
            else:
                errors['time_format'] = 'Invalid time format'
                
        except (ValueError, TypeError, KeyError) as e:
            errors['time_format'] = f'Invalid time format: {str(e)}'
    
    # Validate available days
    available_days = data.get('available_days', [])
    if available_days:
        if not isinstance(available_days, list):
            errors['available_days'] = 'Available days must be a list'
        else:
            valid_days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
            invalid_days = []
            for day in available_days:
                if day not in valid_days:
                    invalid_days.append(day)
            if invalid_days:
                errors['available_days'] = f'Invalid day(s): {", ".join(invalid_days)}. Must be one of {valid_days}'
    
    # Validate schedule
    if data.get('schedule_active', False):
        schedule_start = data.get('schedule_start_date')
        schedule_end = data.get('schedule_end_date')
        
        if not schedule_start:
            errors['schedule_start_date'] = 'Schedule start date is required when schedule is active'
        if not schedule_end:
            errors['schedule_end_date'] = 'Schedule end date is required when schedule is active'
        
        if schedule_start and schedule_end:
            start_valid, start_result = validate_date_format(str(schedule_start))
            end_valid, end_result = validate_date_format(str(schedule_end))
            
            if not start_valid:
                errors['schedule_start_date'] = f'Invalid start date: {start_result}'
            if not end_valid:
                errors['schedule_end_date'] = f'Invalid end date: {end_result}'
            
            if start_valid and end_valid and isinstance(start_result, datetime) and isinstance(end_result, datetime):
                if start_result >= end_result:
                    errors['schedule_end_date'] = 'Schedule end date must be after start date'
    
    # Validate duration
    if data.get('duration_active', False):
        duration_value = data.get('duration_value', 0)
        duration_start = data.get('duration_start_date')
        
        if not duration_value or duration_value <= 0:
            errors['duration_value'] = 'Duration value must be greater than 0'
        
        if not duration_start:
            errors['duration_start_date'] = 'Duration start date is required when duration is active'
        else:
            start_valid, start_result = validate_date_format(str(duration_start))
            if not start_valid:
                errors['duration_start_date'] = f'Invalid start date: {start_result}'
    
    # Validate exclusion dates
    exclusion_dates = data.get('exclusion_dates', [])
    if exclusion_dates:
        if not isinstance(exclusion_dates, list):
            errors['exclusion_dates'] = 'Exclusion dates must be a list'
        else:
            for i, date_str in enumerate(exclusion_dates):
                is_valid, result = validate_date_format(date_str)
                if not is_valid:
                    errors[f'exclusion_dates_{i}'] = f'Invalid date format: {date_str}. Use YYYY-MM-DD'
    
    return errors


def validate_ip_address(ip_address: str) -> Tuple[bool, str]:
    """
    Validate IP address format
    Returns: (is_valid, error_message)
    """
    if not ip_address:
        return False, "IP address cannot be empty"
    
    ip_address = ip_address.strip()
    
    # IPv4 validation
    ipv4_pattern = re.compile(
        r'^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}'
        r'(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$'
    )
    
    # IPv6 validation (simplified)
    ipv6_pattern = re.compile(
        r'^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|'
        r'^::([0-9a-fA-F]{1,4}:){0,6}[0-9a-fA-F]{1,4}$|'
        r'^([0-9a-fA-F]{1,4}:){1,7}:$|'
        r'^([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}$|'
        r'^([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}$|'
        r'^([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}$|'
        r'^([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}$|'
        r'^([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}$|'
        r'^[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})$|'
        r'^:((:[0-9a-fA-F]{1,4}){1,7}|:)$'
    )
    
    if ipv4_pattern.match(ip_address):
        return True, "Valid IPv4 address"
    elif ipv6_pattern.match(ip_address):
        return True, "Valid IPv6 address"
    
    return False, "Invalid IP address format"


def validate_email(email: str) -> Tuple[bool, str]:
    """
    Validate email address format
    Returns: (is_valid, error_message)
    """
    if not email:
        return False, "Email cannot be empty"
    
    email = email.strip().lower()
    
    # Basic email pattern
    pattern = re.compile(
        r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    )
    
    if not pattern.match(email):
        return False, "Invalid email format"
    
    # Additional checks
    if '..' in email:
        return False, "Invalid email format"
    
    if email.startswith('.') or email.endswith('.'):
        return False, "Invalid email format"
    
    return True, "Valid email"


def validate_username(username: str) -> Tuple[bool, str]:
    """
    Validate username format
    Returns: (is_valid, error_message)
    """
    if not username:
        return False, "Username cannot be empty"
    
    username = username.strip()
    
    if len(username) < 3:
        return False, "Username must be at least 3 characters"
    
    if len(username) > 30:
        return False, "Username cannot exceed 30 characters"
    
    # Allow letters, numbers, underscores, and hyphens
    pattern = re.compile(r'^[a-zA-Z0-9_-]+$')
    if not pattern.match(username):
        return False, "Username can only contain letters, numbers, underscores, and hyphens"
    
    return True, "Valid username"


def validate_password(password: str) -> Tuple[bool, str]:
    """
    Validate password strength
    Returns: (is_valid, error_message)
    """
    if not password:
        return False, "Password cannot be empty"
    
    if len(password) < 8:
        return False, "Password must be at least 8 characters"
    
    if len(password) > 128:
        return False, "Password cannot exceed 128 characters"
    
    # Check for at least one uppercase letter
    if not re.search(r'[A-Z]', password):
        return False, "Password must contain at least one uppercase letter"
    
    # Check for at least one lowercase letter
    if not re.search(r'[a-z]', password):
        return False, "Password must contain at least one lowercase letter"
    
    # Check for at least one number
    if not re.search(r'[0-9]', password):
        return False, "Password must contain at least one number"
    
    # Check for at least one special character
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        return False, "Password must contain at least one special character"
    
    return True, "Valid password"


def validate_url(url: str) -> Tuple[bool, str]:
    """
    Validate URL format
    Returns: (is_valid, error_message)
    """
    if not url:
        return False, "URL cannot be empty"
    
    url = url.strip()
    
    # Basic URL pattern
    pattern = re.compile(
        r'^(https?://)?'  # http:// or https:// (optional)
        r'([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+'  # domain
        r'[a-zA-Z]{2,}'  # TLD
        r'(:\d+)?'  # port (optional)
        r'(/.*)?$'  # path (optional)
    )
    
    if not pattern.match(url):
        return False, "Invalid URL format"
    
    return True, "Valid URL"






