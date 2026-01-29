





# """
# Production-ready Signal Data Validators
# Comprehensive validation for all signal data with proper error handling
# """

# import logging
# import re
# import uuid
# import ipaddress
# from typing import Dict, Any, Tuple, List, Optional, Set
# from enum import Enum
# from datetime import datetime

# from django.core.validators import validate_email, URLValidator
# from django.core.exceptions import ValidationError
# from django.contrib.auth.password_validation import validate_password

# from .core import SignalType

# logger = logging.getLogger(__name__)

# # ==================== VALIDATION RULES ====================

# class ValidationLevel(Enum):
#     """Validation strictness levels"""
#     STRICT = "strict"     # All validations must pass
#     NORMAL = "normal"     # Most validations required
#     LENIENT = "lenient"   # Only critical validations required

# class ValidationResult:
#     """Container for validation results"""
    
#     def __init__(self):
#         self.is_valid = True
#         self.errors = []
#         self.warnings = []
    
#     def add_error(self, field: str, message: str):
#         """Add validation error"""
#         self.is_valid = False
#         self.errors.append({'field': field, 'message': message})
    
#     def add_warning(self, field: str, message: str):
#         """Add validation warning"""
#         self.warnings.append({'field': field, 'message': message})
    
#     def to_dict(self) -> Dict[str, Any]:
#         """Convert to dictionary"""
#         return {
#             'is_valid': self.is_valid,
#             'errors': self.errors,
#             'warnings': self.warnings,
#             'error_count': len(self.errors),
#             'warning_count': len(self.warnings)
#         }

# # Signal validation schemas
# SIGNAL_SCHEMAS = {
#     SignalType.PPPOE_CREDENTIALS_GENERATED: {
#         'required_fields': {'user_id', 'username', 'pppoe_username', 'password', 'phone_number'},
#         'optional_fields': {'client_name', 'connection_type', 'timestamp', 'signal_id'},
#         'field_validators': {
#             'user_id': '_validate_uuid',
#             'username': '_validate_username',
#             'pppoe_username': '_validate_pppoe_username',
#             'password': '_validate_pppoe_password',
#             'phone_number': '_validate_phone_number',
#             'client_name': '_validate_client_name',
#             'connection_type': '_validate_connection_type',
#             'timestamp': '_validate_timestamp'
#         },
#         'cross_field_validators': [
#             '_validate_username_mismatch'
#         ]
#     },
    
#     SignalType.CLIENT_ACCOUNT_CREATED: {
#         'required_fields': {'user_id', 'username', 'phone_number', 'connection_type'},
#         'optional_fields': {'client_name', 'created_by_admin', 'timestamp', 'signal_id'},
#         'field_validators': {
#             'user_id': '_validate_uuid',
#             'username': '_validate_username',
#             'phone_number': '_validate_phone_number',
#             'connection_type': '_validate_connection_type',
#             'client_name': '_validate_client_name',
#             'created_by_admin': '_validate_boolean',
#             'timestamp': '_validate_timestamp'
#         }
#     },
    
#     SignalType.ACCOUNT_STATUS_CHANGED: {
#         'required_fields': {'user_id', 'username', 'is_active', 'reason'},
#         'optional_fields': {'changed_by_admin', 'admin_email', 'timestamp', 'signal_id'},
#         'field_validators': {
#             'user_id': '_validate_uuid',
#             'username': '_validate_username',
#             'is_active': '_validate_boolean',
#             'reason': '_validate_reason',
#             'admin_email': '_validate_email',
#             'changed_by_admin': '_validate_boolean',
#             'timestamp': '_validate_timestamp'
#         }
#     },
    
#     SignalType.PPPOE_CREDENTIALS_UPDATED: {
#         'required_fields': {'user_id', 'username'},
#         'optional_fields': {'username_updated', 'password_updated', 'updated_by_client', 'timestamp', 'signal_id'},
#         'field_validators': {
#             'user_id': '_validate_uuid',
#             'username': '_validate_username',
#             'username_updated': '_validate_boolean',
#             'password_updated': '_validate_boolean',
#             'updated_by_client': '_validate_boolean',
#             'timestamp': '_validate_timestamp'
#         }
#     },
    
#     SignalType.AUTHENTICATION_FAILED: {
#         'required_fields': {'username', 'ip_address', 'failure_type'},
#         'optional_fields': {'failure_reason', 'attempt_count', 'timestamp', 'signal_id'},
#         'field_validators': {
#             'username': '_validate_username_or_ip',
#             'ip_address': '_validate_ip_address',
#             'failure_type': '_validate_failure_type',
#             'failure_reason': '_validate_failure_reason',
#             'attempt_count': '_validate_attempt_count',
#             'timestamp': '_validate_timestamp'
#         }
#     },
    
#     SignalType.SEND_NOTIFICATION: {
#         'required_fields': {'user_id', 'notification_type', 'data'},
#         'optional_fields': {'priority', 'timestamp', 'signal_id'},
#         'field_validators': {
#             'user_id': '_validate_uuid',
#             'notification_type': '_validate_notification_type',
#             'priority': '_validate_priority',
#             'timestamp': '_validate_timestamp'
#         },
#         'cross_field_validators': [
#             '_validate_notification_data'
#         ]
#     }
# }

# # ==================== FIELD VALIDATORS ====================

# def _validate_uuid(value: Any, context: Dict[str, Any] = None) -> Tuple[bool, str]:
#     """Validate UUID format"""
#     try:
#         if not value:
#             return False, "UUID is required"
        
#         str_value = str(value).strip()
        
#         # Check if it's a valid UUID
#         try:
#             uuid.UUID(str_value)
#             return True, "Valid UUID"
#         except ValueError:
#             pass
        
#         # Check if it's a valid MongoDB/ObjectID format (24 hex chars)
#         if re.match(r'^[0-9a-fA-F]{24}$', str_value):
#             return True, "Valid ObjectID"
        
#         # Check if it's a numeric ID
#         if str_value.isdigit():
#             return True, "Valid numeric ID"
        
#         return False, "Invalid ID format"
        
#     except Exception as e:
#         return False, f"UUID validation error: {str(e)}"

# def _validate_username(value: Any, context: Dict[str, Any] = None) -> Tuple[bool, str]:
#     """Validate username"""
#     try:
#         if not value:
#             return False, "Username is required"
        
#         str_value = str(value).strip()
        
#         if len(str_value) < 3:
#             return False, "Username must be at least 3 characters"
        
#         if len(str_value) > 50:
#             return False, "Username must be 50 characters or less"
        
#         if not re.match(r'^[a-zA-Z0-9_.-]+$', str_value):
#             return False, "Username can only contain letters, numbers, dots, dashes, and underscores"
        
#         # Check for reserved names
#         reserved_names = {'admin', 'root', 'system', 'null', 'undefined', 'test'}
#         if str_value.lower() in reserved_names:
#             return False, f"Username '{str_value}' is reserved"
        
#         return True, "Valid username"
        
#     except Exception as e:
#         return False, f"Username validation error: {str(e)}"

# def _validate_pppoe_username(value: Any, context: Dict[str, Any] = None) -> Tuple[bool, str]:
#     """Validate PPPoE username"""
#     try:
#         if not value:
#             return False, "PPPoE username is required"
        
#         str_value = str(value).strip()
        
#         if len(str_value) < 3:
#             return False, "PPPoE username must be at least 3 characters"
        
#         if len(str_value) > 32:
#             return False, "PPPoE username must be 32 characters or less"
        
#         if not re.match(r'^[a-zA-Z0-9_.-]+$', str_value):
#             return False, "PPPoE username can only contain letters, numbers, dots, dashes, and underscores"
        
#         # Check for reserved names
#         reserved_names = {'admin', 'root', 'system', 'test', 'guest'}
#         if str_value.lower() in reserved_names:
#             return False, f"PPPoE username '{str_value}' is reserved"
        
#         return True, "Valid PPPoE username"
        
#     except Exception as e:
#         return False, f"PPPoE username validation error: {str(e)}"

# def _validate_pppoe_password(value: Any, context: Dict[str, Any] = None) -> Tuple[bool, str]:
#     """Validate PPPoE password"""
#     try:
#         if not value:
#             return False, "Password is required"
        
#         str_value = str(value)
        
#         if len(str_value) < 8:
#             return False, "Password must be at least 8 characters"
        
#         if len(str_value) > 64:
#             return False, "Password must be 64 characters or less"
        
#         # Check for uppercase
#         if not any(c.isupper() for c in str_value):
#             return False, "Password must contain at least one uppercase letter"
        
#         # Check for lowercase
#         if not any(c.islower() for c in str_value):
#             return False, "Password must contain at least one lowercase letter"
        
#         # Check for digit
#         if not any(c.isdigit() for c in str_value):
#             return False, "Password must contain at least one digit"
        
#         # Check for special character
#         if not re.search(r'[!@#$%^&*(),.?":{}|<>]', str_value):
#             return False, "Password must contain at least one special character"
        
#         # Check for common weak passwords
#         weak_passwords = {'password', '12345678', 'qwerty123', 'admin123', 'welcome123'}
#         if str_value.lower() in weak_passwords:
#             return False, "Password is too common, please choose a stronger one"
        
#         # Check for password in username (if username provided in context)
#         username = context.get('username') if context else None
#         if username and username.lower() in str_value.lower():
#             return False, "Password should not contain username"
        
#         return True, "Strong password"
        
#     except Exception as e:
#         return False, f"Password validation error: {str(e)}"

# def _validate_phone_number(value: Any, context: Dict[str, Any] = None) -> Tuple[bool, str]:
#     """Validate phone number"""
#     try:
#         if not value:
#             return False, "Phone number is required"
        
#         str_value = str(value).strip()
        
#         # Remove all non-digit characters except leading +
#         clean_number = re.sub(r'[^\d+]', '', str_value)
        
#         # Check Kenyan phone numbers
#         if clean_number.startswith('+254') and len(clean_number) == 13:
#             return True, "Valid Kenyan phone number (international format)"
#         if clean_number.startswith('254') and len(clean_number) == 12:
#             return True, "Valid Kenyan phone number"
#         if clean_number.startswith('0') and len(clean_number) == 10:
#             return True, "Valid Kenyan phone number"
#         if clean_number.startswith('7') and len(clean_number) == 9:
#             return True, "Valid Kenyan phone number"
        
#         # Check for other international formats
#         if clean_number.startswith('+') and 7 <= len(clean_number) <= 15:
#             return True, "Valid international phone number"
        
#         return False, "Invalid phone number format. Expected Kenyan format (e.g., +2547XXXXXXXX)"
        
#     except Exception as e:
#         return False, f"Phone number validation error: {str(e)}"

# def _validate_email(value: Any, context: Dict[str, Any] = None) -> Tuple[bool, str]:
#     """Validate email address"""
#     try:
#         if not value:
#             return True, "Email is optional"  # Email can be optional
        
#         str_value = str(value).strip()
        
#         if len(str_value) > 254:
#             return False, "Email must be 254 characters or less"
        
#         try:
#             validate_email(str_value)
#             return True, "Valid email"
#         except ValidationError:
#             return False, "Invalid email format"
        
#     except Exception as e:
#         return False, f"Email validation error: {str(e)}"

# def _validate_ip_address(value: Any, context: Dict[str, Any] = None) -> Tuple[bool, str]:
#     """Validate IP address"""
#     try:
#         if not value:
#             return False, "IP address is required"
        
#         str_value = str(value).strip()
        
#         # Check for localhost/loopback
#         if str_value.lower() in ['localhost', '127.0.0.1', '::1']:
#             return True, "Valid loopback address"
        
#         # Check for private IP ranges
#         if str_value.startswith('192.168.') or str_value.startswith('10.') or \
#            (str_value.startswith('172.') and 16 <= int(str_value.split('.')[1]) <= 31):
#             return True, "Valid private IP address"
        
#         # Try standard IP validation
#         try:
#             ipaddress.ip_address(str_value)
#             return True, "Valid IP address"
#         except ValueError:
#             return False, "Invalid IP address format"
        
#     except Exception as e:
#         return False, f"IP address validation error: {str(e)}"

# def _validate_connection_type(value: Any, context: Dict[str, Any] = None) -> Tuple[bool, str]:
#     """Validate connection type"""
#     try:
#         if not value:
#             return False, "Connection type is required"
        
#         str_value = str(value).strip().lower()
        
#         valid_types = {'hotspot', 'pppoe'}
#         if str_value in valid_types:
#             return True, f"Valid connection type: {str_value}"
        
#         return False, f"Invalid connection type. Must be one of: {', '.join(valid_types)}"
        
#     except Exception as e:
#         return False, f"Connection type validation error: {str(e)}"

# def _validate_client_name(value: Any, context: Dict[str, Any] = None) -> Tuple[bool, str]:
#     """Validate client name"""
#     try:
#         if not value:
#             return True, "Client name is optional"
        
#         str_value = str(value).strip()
        
#         if len(str_value) > 100:
#             return False, "Client name must be 100 characters or less"
        
#         # Check for invalid characters
#         if re.search(r'[<>{}[\]]', str_value):
#             return False, "Client name contains invalid characters"
        
#         return True, "Valid client name"
        
#     except Exception as e:
#         return False, f"Client name validation error: {str(e)}"

# def _validate_boolean(value: Any, context: Dict[str, Any] = None) -> Tuple[bool, str]:
#     """Validate boolean value"""
#     try:
#         if isinstance(value, bool):
#             return True, "Valid boolean"
        
#         if isinstance(value, str):
#             str_value = str(value).lower()
#             if str_value in {'true', 'false', '1', '0', 'yes', 'no'}:
#                 return True, "Valid boolean string"
        
#         if isinstance(value, int) and value in {0, 1}:
#             return True, "Valid boolean integer"
        
#         return False, "Invalid boolean value. Must be True/False, 1/0, or 'true'/'false'"
        
#     except Exception as e:
#         return False, f"Boolean validation error: {str(e)}"

# def _validate_reason(value: Any, context: Dict[str, Any] = None) -> Tuple[bool, str]:
#     """Validate reason text"""
#     try:
#         if not value:
#             return False, "Reason is required"
        
#         str_value = str(value).strip()
        
#         if len(str_value) < 3:
#             return False, "Reason must be at least 3 characters"
        
#         if len(str_value) > 500:
#             return False, "Reason must be 500 characters or less"
        
#         # Check for dangerous content
#         dangerous_patterns = [
#             r'<script.*?>.*?</script>',  # Script tags
#             r'on\w+\s*=',  # Event handlers
#             r'javascript:',  # JavaScript protocol
#             r'data:',  # Data URLs
#             r'vbscript:'  # VBScript
#         ]
        
#         for pattern in dangerous_patterns:
#             if re.search(pattern, str_value, re.IGNORECASE):
#                 return False, "Reason contains potentially dangerous content"
        
#         return True, "Valid reason"
        
#     except Exception as e:
#         return False, f"Reason validation error: {str(e)}"

# def _validate_failure_type(value: Any, context: Dict[str, Any] = None) -> Tuple[bool, str]:
#     """Validate authentication failure type"""
#     try:
#         if not value:
#             return False, "Failure type is required"
        
#         str_value = str(value).strip().lower()
        
#         valid_types = {'pppoe', 'phone', 'admin', 'hotspot', 'unknown'}
#         if str_value in valid_types:
#             return True, f"Valid failure type: {str_value}"
        
#         return False, f"Invalid failure type. Must be one of: {', '.join(valid_types)}"
        
#     except Exception as e:
#         return False, f"Failure type validation error: {str(e)}"

# def _validate_failure_reason(value: Any, context: Dict[str, Any] = None) -> Tuple[bool, str]:
#     """Validate failure reason"""
#     try:
#         if not value:
#             return True, "Failure reason is optional"
        
#         str_value = str(value).strip()
        
#         if len(str_value) > 200:
#             return False, "Failure reason must be 200 characters or less"
        
#         return True, "Valid failure reason"
        
#     except Exception as e:
#         return False, f"Failure reason validation error: {str(e)}"

# def _validate_attempt_count(value: Any, context: Dict[str, Any] = None) -> Tuple[bool, str]:
#     """Validate attempt count"""
#     try:
#         if value is None:
#             return True, "Attempt count is optional"
        
#         try:
#             int_value = int(value)
#             if int_value < 1:
#                 return False, "Attempt count must be at least 1"
#             if int_value > 100:
#                 return False, "Attempt count must be 100 or less"
#             return True, f"Valid attempt count: {int_value}"
#         except (ValueError, TypeError):
#             return False, "Attempt count must be an integer"
        
#     except Exception as e:
#         return False, f"Attempt count validation error: {str(e)}"

# def _validate_notification_type(value: Any, context: Dict[str, Any] = None) -> Tuple[bool, str]:
#     """Validate notification type"""
#     try:
#         if not value:
#             return False, "Notification type is required"
        
#         str_value = str(value).strip()
        
#         valid_types = {
#             'welcome', 'payment', 'expiry', 'usage', 'security',
#             'custom', 'promotional', 'system', 'maintenance'
#         }
        
#         if str_value.lower() in valid_types:
#             return True, f"Valid notification type: {str_value}"
        
#         return False, f"Invalid notification type. Must be one of: {', '.join(sorted(valid_types))}"
        
#     except Exception as e:
#         return False, f"Notification type validation error: {str(e)}"

# def _validate_priority(value: Any, context: Dict[str, Any] = None) -> Tuple[bool, str]:
#     """Validate notification priority"""
#     try:
#         if not value:
#             return True, "Priority is optional (default: normal)"
        
#         str_value = str(value).strip().lower()
        
#         valid_priorities = {'low', 'normal', 'high', 'critical'}
#         if str_value in valid_priorities:
#             return True, f"Valid priority: {str_value}"
        
#         return False, f"Invalid priority. Must be one of: {', '.join(valid_priorities)}"
        
#     except Exception as e:
#         return False, f"Priority validation error: {str(e)}"

# def _validate_timestamp(value: Any, context: Dict[str, Any] = None) -> Tuple[bool, str]:
#     """Validate timestamp"""
#     try:
#         if value is None:
#             return True, "Timestamp is optional"
        
#         # Try to convert to float
#         try:
#             float_value = float(value)
#             current_time = datetime.now().timestamp()
            
#             # Check if timestamp is in reasonable range (not in future by more than 5 minutes,
#             # and not older than 1 year)
#             if float_value > current_time + 300:  # 5 minutes in future
#                 return False, "Timestamp cannot be more than 5 minutes in the future"
            
#             if float_value < current_time - 31536000:  # 1 year in past
#                 return False, "Timestamp cannot be more than 1 year in the past"
            
#             return True, f"Valid timestamp: {float_value}"
            
#         except (ValueError, TypeError):
#             # Try to parse as ISO string
#             try:
#                 datetime.fromisoformat(str(value).replace('Z', '+00:00'))
#                 return True, "Valid ISO timestamp"
#             except (ValueError, TypeError):
#                 return False, "Timestamp must be a float or ISO datetime string"
        
#     except Exception as e:
#         return False, f"Timestamp validation error: {str(e)}"

# def _validate_username_or_ip(value: Any, context: Dict[str, Any] = None) -> Tuple[bool, str]:
#     """Validate username or IP for authentication failures"""
#     try:
#         if not value:
#             return False, "Username or IP is required"
        
#         str_value = str(value).strip()
        
#         # Check if it's an IP address
#         ip_valid, _ = _validate_ip_address(str_value, context)
#         if ip_valid:
#             return True, "Valid IP address"
        
#         # Check if it's a username
#         username_valid, _ = _validate_username(str_value, context)
#         if username_valid:
#             return True, "Valid username"
        
#         # Allow email as username
#         email_valid, _ = _validate_email(str_value, context)
#         if email_valid:
#             return True, "Valid email"
        
#         return False, "Must be a valid username, email, or IP address"
        
#     except Exception as e:
#         return False, f"Username/IP validation error: {str(e)}"

# # ==================== CROSS-FIELD VALIDATORS ====================

# def _validate_username_mismatch(data: Dict[str, Any], context: Dict[str, Any] = None) -> Tuple[bool, str]:
#     """Validate that username and PPPoE username don't mismatch significantly"""
#     username = data.get('username')
#     pppoe_username = data.get('pppoe_username')
    
#     if username and pppoe_username:
#         # Allow some differences but catch major mismatches
#         if username.lower() != pppoe_username.lower():
#             # Check if they're at least related (e.g., one contains the other)
#             if (username.lower() not in pppoe_username.lower() and 
#                 pppoe_username.lower() not in username.lower()):
#                 return True, "Username and PPPoE username differ"  # Warning, not error
    
#     return True, "Valid username match"

# def _validate_notification_data(data: Dict[str, Any], context: Dict[str, Any] = None) -> Tuple[bool, str]:
#     """Validate notification data structure"""
#     notification_data = data.get('data')
    
#     if not isinstance(notification_data, dict):
#         return False, "Notification data must be a dictionary"
    
#     if len(notification_data) == 0:
#         return False, "Notification data cannot be empty"
    
#     # Check for required notification data based on type
#     notification_type = data.get('notification_type', '').lower()
    
#     if notification_type == 'payment' and 'amount' not in notification_data:
#         return False, "Payment notifications must include 'amount'"
    
#     if notification_type == 'expiry' and 'days_remaining' not in notification_data:
#         return False, "Expiry notifications must include 'days_remaining'"
    
#     return True, "Valid notification data"

# def _perform_strict_validations(signal_type: SignalType, data: Dict[str, Any], result: ValidationResult):
#     """Perform additional strict validations"""
    
#     if signal_type == SignalType.PPPOE_CREDENTIALS_GENERATED:
#         # Check for password reuse patterns
#         password = data.get('password', '')
#         username = data.get('username', '')
        
#         if username and password:
#             # Password shouldn't be too similar to username
#             if username.lower() in password.lower():
#                 result.add_warning('password', 'Password is similar to username')
            
#             # Check for sequential characters
#             if re.search(r'(?:0123|1234|2345|3456|4567|5678|6789|7890|abcd|bcde|cdef|defg)', password.lower()):
#                 result.add_warning('password', 'Password contains sequential characters')

# # ==================== CORE VALIDATION FUNCTIONS ====================

# def validate_signal_data(
#     signal_type: SignalType,
#     data: Dict[str, Any],
#     level: ValidationLevel = ValidationLevel.NORMAL,
#     context: Optional[Dict[str, Any]] = None
# ) -> Tuple[bool, str]:
#     """
#     Validate signal data against schema
#     Returns (is_valid, error_message)
#     """
#     result = ValidationResult()
    
#     try:
#         if signal_type not in SIGNAL_SCHEMAS:
#             return False, f"Unknown signal type: {signal_type}"
        
#         schema = SIGNAL_SCHEMAS[signal_type]
#         context = context or {}
        
#         # Check required fields
#         missing_fields = schema['required_fields'] - set(data.keys())
#         if missing_fields:
#             return False, f"Missing required fields: {', '.join(missing_fields)}"
        
#         # Validate individual fields
#         for field, value in data.items():
#             # Skip unknown fields in lenient mode
#             if (field not in schema['required_fields'] and 
#                 field not in schema['optional_fields']):
#                 if level == ValidationLevel.STRICT:
#                     result.add_error(field, f"Unknown field for signal type {signal_type.value}")
#                 elif level == ValidationLevel.NORMAL:
#                     result.add_warning(field, f"Unknown field for signal type {signal_type.value}")
#                 continue
            
#             # Get validator
#             validator_name = schema['field_validators'].get(field)
#             if validator_name:
#                 validator = globals().get(validator_name)
#                 if validator:
#                     is_valid, message = validator(value, context)
#                     if not is_valid:
#                         result.add_error(field, message)
        
#         # Run cross-field validators
#         if 'cross_field_validators' in schema:
#             for validator_name in schema['cross_field_validators']:
#                 validator = globals().get(validator_name)
#                 if validator:
#                     is_valid, message = validator(data, context)
#                     if not is_valid:
#                         result.add_error('cross_field', message)
        
#         # Check for extra validation based on level
#         if level == ValidationLevel.STRICT:
#             _perform_strict_validations(signal_type, data, result)
        
#         # Return result
#         if not result.is_valid:
#             errors_summary = '; '.join([f"{e['field']}: {e['message']}" for e in result.errors[:3]])
#             if len(result.errors) > 3:
#                 errors_summary += f" and {len(result.errors) - 3} more errors"
#             return False, errors_summary
        
#         return True, "Valid"
        
#     except Exception as e:
#         logger.error(f"Validation error for {signal_type}: {e}", exc_info=True)
#         return False, f"Validation error: {str(e)}"

# def validate_batch_signal_data(
#     signal_type: SignalType,
#     data_list: List[Dict[str, Any]],
#     level: ValidationLevel = ValidationLevel.NORMAL
# ) -> Dict[str, Any]:
#     """
#     Validate batch of signal data
#     """
#     result = {
#         'total': len(data_list),
#         'valid': 0,
#         'invalid': 0,
#         'errors': [],
#         'warnings': [],
#         'timestamp': datetime.now().isoformat()
#     }
    
#     for index, data in enumerate(data_list):
#         is_valid, error_message = validate_signal_data(signal_type, data, level)
        
#         if is_valid:
#             result['valid'] += 1
#         else:
#             result['invalid'] += 1
#             result['errors'].append({
#                 'index': index,
#                 'data': {k: v for k, v in data.items() if k != 'password'},
#                 'error': error_message
#             })
    
#     # Calculate validation rate
#     if result['total'] > 0:
#         result['validation_rate'] = (result['valid'] / result['total']) * 100
#     else:
#         result['validation_rate'] = 100
    
#     return result

# # ==================== UTILITY FUNCTIONS ====================

# def sanitize_signal_data(data: Dict[str, Any]) -> Dict[str, Any]:
#     """Sanitize signal data by removing sensitive information"""
#     sanitized = data.copy()
    
#     # Remove passwords and tokens
#     sensitive_fields = {'password', 'token', 'secret', 'key', 'auth', 'credential'}
    
#     for field in list(sanitized.keys()):
#         field_lower = field.lower()
#         if any(sensitive in field_lower for sensitive in sensitive_fields):
#             sanitized[field] = '[REDACTED]'
    
#     # Truncate long values for logging
#     for field, value in sanitized.items():
#         if isinstance(value, str) and len(value) > 100:
#             sanitized[field] = value[:100] + '...'
    
#     return sanitized

# def get_validation_summary(results: List[ValidationResult]) -> Dict[str, Any]:
#     """Get summary of multiple validation results"""
#     summary = {
#         'total': len(results),
#         'valid': 0,
#         'invalid': 0,
#         'total_errors': 0,
#         'total_warnings': 0,
#         'common_errors': {},
#         'by_field': {}
#     }
    
#     for result in results:
#         if result.is_valid:
#             summary['valid'] += 1
#         else:
#             summary['invalid'] += 1
        
#         summary['total_errors'] += len(result.errors)
#         summary['total_warnings'] += len(result.warnings)
        
#         # Track common errors
#         for error in result.errors:
#             field = error['field']
#             message = error['message']
            
#             key = f"{field}:{message}"
#             summary['common_errors'][key] = summary['common_errors'].get(key, 0) + 1
            
#             # Track by field
#             if field not in summary['by_field']:
#                 summary['by_field'][field] = {'errors': 0, 'warnings': 0}
#             summary['by_field'][field]['errors'] += 1
    
#     return summary

# # ==================== PUBLIC VALIDATION FUNCTIONS ====================

# def validate_phone_number(value: str) -> Tuple[bool, str]:
#     """
#     Validate phone number format
#     """
#     if not value:
#         return False, "Phone number is required"
    
#     clean = re.sub(r'[^\d+]', '', str(value))

#     if clean.startswith('+254') and len(clean) == 13:
#         return True, "Valid Kenyan phone number"
#     if clean.startswith('254') and len(clean) == 12:
#         return True, "Valid Kenyan phone number"
#     if clean.startswith('0') and len(clean) == 10:
#         return True, "Valid Kenyan phone number"
#     if clean.startswith('7') and len(clean) == 9:
#         return True, "Valid Kenyan phone number"

#     return False, "Invalid phone number format"

# # Export the public validation functions
# __all__ = [
#     'validate_signal_data',
#     'validate_batch_signal_data',
#     'sanitize_signal_data',
#     'get_validation_summary',
#     'validate_phone_number',
#     'ValidationLevel',
#     'ValidationResult'
# ]



"""
Production-ready Signal Data Validators
Comprehensive validation for all signal data with proper error handling
"""

import ipaddress
import logging
import re
import uuid
from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional, Set, Tuple

from django.core.exceptions import ValidationError
from django.core.validators import validate_email

from .core import SignalType

logger = logging.getLogger(__name__)

# ==================== VALIDATION RULES ====================

class ValidationLevel(Enum):
    """Validation strictness levels"""
    STRICT = "strict"     # All validations must pass
    NORMAL = "normal"     # Most validations required
    LENIENT = "lenient"   # Only critical validations required

class ValidationResult:
    """Container for validation results"""
    
    def __init__(self):
        self.is_valid = True
        self.errors = []
        self.warnings = []
    
    def add_error(self, field: str, message: str):
        """Add validation error"""
        self.is_valid = False
        self.errors.append({'field': field, 'message': message})
    
    def add_warning(self, field: str, message: str):
        """Add validation warning"""
        self.warnings.append({'field': field, 'message': message})
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            'is_valid': self.is_valid,
            'errors': self.errors,
            'warnings': self.warnings,
            'error_count': len(self.errors),
            'warning_count': len(self.warnings)
        }

# Signal validation schemas
SIGNAL_SCHEMAS = {
    SignalType.PPPOE_CREDENTIALS_GENERATED: {
        'required_fields': {'user_id', 'username', 'pppoe_username', 'password', 'phone_number'},
        'optional_fields': {'client_name', 'connection_type', 'timestamp', 'signal_id'},
        'field_validators': {
            'user_id': '_validate_uuid',
            'username': '_validate_username',
            'pppoe_username': '_validate_pppoe_username',
            'password': '_validate_pppoe_password',
            'phone_number': '_validate_phone_number',
            'client_name': '_validate_client_name',
            'connection_type': '_validate_connection_type',
            'timestamp': '_validate_timestamp'
        },
        'cross_field_validators': [
            '_validate_username_mismatch'
        ]
    },
    
    SignalType.CLIENT_ACCOUNT_CREATED: {
        'required_fields': {'user_id', 'username', 'phone_number', 'connection_type'},
        'optional_fields': {'client_name', 'created_by_admin', 'timestamp', 'signal_id'},
        'field_validators': {
            'user_id': '_validate_uuid',
            'username': '_validate_username',
            'phone_number': '_validate_phone_number',
            'connection_type': '_validate_connection_type',
            'client_name': '_validate_client_name',
            'created_by_admin': '_validate_boolean',
            'timestamp': '_validate_timestamp'
        }
    },
    
    SignalType.ACCOUNT_STATUS_CHANGED: {
        'required_fields': {'user_id', 'username', 'is_active', 'reason'},
        'optional_fields': {'changed_by_admin', 'admin_email', 'timestamp', 'signal_id'},
        'field_validators': {
            'user_id': '_validate_uuid',
            'username': '_validate_username',
            'is_active': '_validate_boolean',
            'reason': '_validate_reason',
            'admin_email': '_validate_email',
            'changed_by_admin': '_validate_boolean',
            'timestamp': '_validate_timestamp'
        }
    },
    
    SignalType.PPPOE_CREDENTIALS_UPDATED: {
        'required_fields': {'user_id', 'username'},
        'optional_fields': {'username_updated', 'password_updated', 'updated_by_client', 'timestamp', 'signal_id'},
        'field_validators': {
            'user_id': '_validate_uuid',
            'username': '_validate_username',
            'username_updated': '_validate_boolean',
            'password_updated': '_validate_boolean',
            'updated_by_client': '_validate_boolean',
            'timestamp': '_validate_timestamp'
        }
    },
    
    SignalType.AUTHENTICATION_FAILED: {
        'required_fields': {'username', 'ip_address', 'failure_type'},
        'optional_fields': {'failure_reason', 'attempt_count', 'timestamp', 'signal_id'},
        'field_validators': {
            'username': '_validate_username_or_ip',
            'ip_address': '_validate_ip_address',
            'failure_type': '_validate_failure_type',
            'failure_reason': '_validate_failure_reason',
            'attempt_count': '_validate_attempt_count',
            'timestamp': '_validate_timestamp'
        }
    },
    
    SignalType.SEND_NOTIFICATION: {
        'required_fields': {'user_id', 'notification_type', 'data'},
        'optional_fields': {'priority', 'timestamp', 'signal_id'},
        'field_validators': {
            'user_id': '_validate_uuid',
            'notification_type': '_validate_notification_type',
            'priority': '_validate_priority',
            'timestamp': '_validate_timestamp'
        },
        'cross_field_validators': [
            '_validate_notification_data'
        ]
    }
}

# ==================== FIELD VALIDATORS ====================

def _validate_uuid(value: Any, context: Dict[str, Any] = None) -> Tuple[bool, str]:
    """Validate UUID format"""
    try:
        if not value:
            return False, "UUID is required"
        
        str_value = str(value).strip()
        
        # Check if it's a valid UUID
        try:
            uuid.UUID(str_value)
            return True, "Valid UUID"
        except ValueError:
            pass
        
        # Check if it's a valid MongoDB/ObjectID format (24 hex chars)
        if re.match(r'^[0-9a-fA-F]{24}$', str_value):
            return True, "Valid ObjectID"
        
        # Check if it's a numeric ID
        if str_value.isdigit():
            return True, "Valid numeric ID"
        
        return False, "Invalid ID format"
        
    except Exception as e:
        return False, f"UUID validation error: {str(e)}"

def _validate_username(value: Any, context: Dict[str, Any] = None) -> Tuple[bool, str]:
    """Validate username"""
    try:
        if not value:
            return False, "Username is required"
        
        str_value = str(value).strip()
        
        if len(str_value) < 3:
            return False, "Username must be at least 3 characters"
        
        if len(str_value) > 50:
            return False, "Username must be 50 characters or less"
        
        if not re.match(r'^[a-zA-Z0-9_.-]+$', str_value):
            return False, "Username can only contain letters, numbers, dots, dashes, and underscores"
        
        # Check for reserved names
        reserved_names = {'admin', 'root', 'system', 'null', 'undefined', 'test'}
        if str_value.lower() in reserved_names:
            return False, f"Username '{str_value}' is reserved"
        
        return True, "Valid username"
        
    except Exception as e:
        return False, f"Username validation error: {str(e)}"

def _validate_pppoe_username(value: Any, context: Dict[str, Any] = None) -> Tuple[bool, str]:
    """Validate PPPoE username"""
    try:
        if not value:
            return False, "PPPoE username is required"
        
        str_value = str(value).strip()
        
        if len(str_value) < 3:
            return False, "PPPoE username must be at least 3 characters"
        
        if len(str_value) > 32:
            return False, "PPPoE username must be 32 characters or less"
        
        if not re.match(r'^[a-zA-Z0-9_.-]+$', str_value):
            return False, "PPPoE username can only contain letters, numbers, dots, dashes, and underscores"
        
        # Check for reserved names
        reserved_names = {'admin', 'root', 'system', 'test', 'guest'}
        if str_value.lower() in reserved_names:
            return False, f"PPPoE username '{str_value}' is reserved"
        
        return True, "Valid PPPoE username"
        
    except Exception as e:
        return False, f"PPPoE username validation error: {str(e)}"

def _validate_pppoe_password(value: Any, context: Dict[str, Any] = None) -> Tuple[bool, str]:
    """Validate PPPoE password"""
    try:
        if not value:
            return False, "Password is required"
        
        str_value = str(value)
        
        if len(str_value) < 8:
            return False, "Password must be at least 8 characters"
        
        if len(str_value) > 64:
            return False, "Password must be 64 characters or less"
        
        # Check for uppercase
        if not any(c.isupper() for c in str_value):
            return False, "Password must contain at least one uppercase letter"
        
        # Check for lowercase
        if not any(c.islower() for c in str_value):
            return False, "Password must contain at least one lowercase letter"
        
        # Check for digit
        if not any(c.isdigit() for c in str_value):
            return False, "Password must contain at least one digit"
        
        # Check for special character
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', str_value):
            return False, "Password must contain at least one special character"
        
        # Check for common weak passwords
        weak_passwords = {'password', '12345678', 'qwerty123', 'admin123', 'welcome123'}
        if str_value.lower() in weak_passwords:
            return False, "Password is too common, please choose a stronger one"
        
        # Check for password in username (if username provided in context)
        username = context.get('username') if context else None
        if username and username.lower() in str_value.lower():
            return False, "Password should not contain username"
        
        return True, "Strong password"
        
    except Exception as e:
        return False, f"Password validation error: {str(e)}"

def _validate_phone_number(value: Any, context: Dict[str, Any] = None) -> Tuple[bool, str]:
    """Validate phone number"""
    try:
        if not value:
            return False, "Phone number is required"
        
        str_value = str(value).strip()
        
        # Remove all non-digit characters except leading +
        clean_number = re.sub(r'[^\d+]', '', str_value)
        
        # Check Kenyan phone numbers
        if clean_number.startswith('+254') and len(clean_number) == 13:
            return True, "Valid Kenyan phone number (international format)"
        if clean_number.startswith('254') and len(clean_number) == 12:
            return True, "Valid Kenyan phone number"
        if clean_number.startswith('0') and len(clean_number) == 10:
            return True, "Valid Kenyan phone number"
        if clean_number.startswith('7') and len(clean_number) == 9:
            return True, "Valid Kenyan phone number"
        
        # Check for other international formats
        if clean_number.startswith('+') and 7 <= len(clean_number) <= 15:
            return True, "Valid international phone number"
        
        return False, "Invalid phone number format. Expected Kenyan format (e.g., +2547XXXXXXXX)"
        
    except Exception as e:
        return False, f"Phone number validation error: {str(e)}"

def _validate_email(value: Any, context: Dict[str, Any] = None) -> Tuple[bool, str]:
    """Validate email address"""
    try:
        if not value:
            return True, "Email is optional"  # Email can be optional
        
        str_value = str(value).strip()
        
        if len(str_value) > 254:
            return False, "Email must be 254 characters or less"
        
        try:
            validate_email(str_value)
            return True, "Valid email"
        except ValidationError:
            return False, "Invalid email format"
        
    except Exception as e:
        return False, f"Email validation error: {str(e)}"

def _validate_ip_address(value: Any, context: Dict[str, Any] = None) -> Tuple[bool, str]:
    """Validate IP address"""
    try:
        if not value:
            return False, "IP address is required"
        
        str_value = str(value).strip()
        
        # Check for localhost/loopback
        if str_value.lower() in ['localhost', '127.0.0.1', '::1']:
            return True, "Valid loopback address"
        
        # Check for private IP ranges
        if str_value.startswith('192.168.') or str_value.startswith('10.') or \
           (str_value.startswith('172.') and 16 <= int(str_value.split('.')[1]) <= 31):
            return True, "Valid private IP address"
        
        # Try standard IP validation
        try:
            ipaddress.ip_address(str_value)
            return True, "Valid IP address"
        except ValueError:
            return False, "Invalid IP address format"
        
    except Exception as e:
        return False, f"IP address validation error: {str(e)}"

def _validate_connection_type(value: Any, context: Dict[str, Any] = None) -> Tuple[bool, str]:
    """Validate connection type"""
    try:
        if not value:
            return False, "Connection type is required"
        
        str_value = str(value).strip().lower()
        
        valid_types = {'hotspot', 'pppoe'}
        if str_value in valid_types:
            return True, f"Valid connection type: {str_value}"
        
        return False, f"Invalid connection type. Must be one of: {', '.join(valid_types)}"
        
    except Exception as e:
        return False, f"Connection type validation error: {str(e)}"

def _validate_client_name(value: Any, context: Dict[str, Any] = None) -> Tuple[bool, str]:
    """Validate client name"""
    try:
        if not value:
            return True, "Client name is optional"
        
        str_value = str(value).strip()
        
        if len(str_value) > 100:
            return False, "Client name must be 100 characters or less"
        
        # Check for invalid characters
        if re.search(r'[<>{}[\]]', str_value):
            return False, "Client name contains invalid characters"
        
        return True, "Valid client name"
        
    except Exception as e:
        return False, f"Client name validation error: {str(e)}"

def _validate_boolean(value: Any, context: Dict[str, Any] = None) -> Tuple[bool, str]:
    """Validate boolean value"""
    try:
        if isinstance(value, bool):
            return True, "Valid boolean"
        
        if isinstance(value, str):
            str_value = str(value).lower()
            if str_value in {'true', 'false', '1', '0', 'yes', 'no'}:
                return True, "Valid boolean string"
        
        if isinstance(value, int) and value in {0, 1}:
            return True, "Valid boolean integer"
        
        return False, "Invalid boolean value. Must be True/False, 1/0, or 'true'/'false'"
        
    except Exception as e:
        return False, f"Boolean validation error: {str(e)}"

def _validate_reason(value: Any, context: Dict[str, Any] = None) -> Tuple[bool, str]:
    """Validate reason text"""
    try:
        if not value:
            return False, "Reason is required"
        
        str_value = str(value).strip()
        
        if len(str_value) < 3:
            return False, "Reason must be at least 3 characters"
        
        if len(str_value) > 500:
            return False, "Reason must be 500 characters or less"
        
        # Check for dangerous content
        dangerous_patterns = [
            r'<script.*?>.*?</script>',  # Script tags
            r'on\w+\s*=',  # Event handlers
            r'javascript:',  # JavaScript protocol
            r'data:',  # Data URLs
            r'vbscript:'  # VBScript
        ]
        
        for pattern in dangerous_patterns:
            if re.search(pattern, str_value, re.IGNORECASE):
                return False, "Reason contains potentially dangerous content"
        
        return True, "Valid reason"
        
    except Exception as e:
        return False, f"Reason validation error: {str(e)}"

def _validate_failure_type(value: Any, context: Dict[str, Any] = None) -> Tuple[bool, str]:
    """Validate authentication failure type"""
    try:
        if not value:
            return False, "Failure type is required"
        
        str_value = str(value).strip().lower()
        
        valid_types = {'pppoe', 'phone', 'admin', 'hotspot', 'unknown'}
        if str_value in valid_types:
            return True, f"Valid failure type: {str_value}"
        
        return False, f"Invalid failure type. Must be one of: {', '.join(valid_types)}"
        
    except Exception as e:
        return False, f"Failure type validation error: {str(e)}"

def _validate_failure_reason(value: Any, context: Dict[str, Any] = None) -> Tuple[bool, str]:
    """Validate failure reason"""
    try:
        if not value:
            return True, "Failure reason is optional"
        
        str_value = str(value).strip()
        
        if len(str_value) > 200:
            return False, "Failure reason must be 200 characters or less"
        
        return True, "Valid failure reason"
        
    except Exception as e:
        return False, f"Failure reason validation error: {str(e)}"

def _validate_attempt_count(value: Any, context: Dict[str, Any] = None) -> Tuple[bool, str]:
    """Validate attempt count"""
    try:
        if value is None:
            return True, "Attempt count is optional"
        
        try:
            int_value = int(value)
            if int_value < 1:
                return False, "Attempt count must be at least 1"
            if int_value > 100:
                return False, "Attempt count must be 100 or less"
            return True, f"Valid attempt count: {int_value}"
        except (ValueError, TypeError):
            return False, "Attempt count must be an integer"
        
    except Exception as e:
        return False, f"Attempt count validation error: {str(e)}"

def _validate_notification_type(value: Any, context: Dict[str, Any] = None) -> Tuple[bool, str]:
    """Validate notification type"""
    try:
        if not value:
            return False, "Notification type is required"
        
        str_value = str(value).strip()
        
        valid_types = {
            'welcome', 'payment', 'expiry', 'usage', 'security',
            'custom', 'promotional', 'system', 'maintenance'
        }
        
        if str_value.lower() in valid_types:
            return True, f"Valid notification type: {str_value}"
        
        return False, f"Invalid notification type. Must be one of: {', '.join(sorted(valid_types))}"
        
    except Exception as e:
        return False, f"Notification type validation error: {str(e)}"

def _validate_priority(value: Any, context: Dict[str, Any] = None) -> Tuple[bool, str]:
    """Validate notification priority"""
    try:
        if not value:
            return True, "Priority is optional (default: normal)"
        
        str_value = str(value).strip().lower()
        
        valid_priorities = {'low', 'normal', 'high', 'critical'}
        if str_value in valid_priorities:
            return True, f"Valid priority: {str_value}"
        
        return False, f"Invalid priority. Must be one of: {', '.join(valid_priorities)}"
        
    except Exception as e:
        return False, f"Priority validation error: {str(e)}"

def _validate_timestamp(value: Any, context: Dict[str, Any] = None) -> Tuple[bool, str]:
    """Validate timestamp"""
    try:
        if value is None:
            return True, "Timestamp is optional"
        
        # Try to convert to float
        try:
            float_value = float(value)
            current_time = datetime.now().timestamp()
            
            # Check if timestamp is in reasonable range (not in future by more than 5 minutes,
            # and not older than 1 year)
            if float_value > current_time + 300:  # 5 minutes in future
                return False, "Timestamp cannot be more than 5 minutes in the future"
            
            if float_value < current_time - 31536000:  # 1 year in past
                return False, "Timestamp cannot be more than 1 year in the past"
            
            return True, f"Valid timestamp: {float_value}"
            
        except (ValueError, TypeError):
            # Try to parse as ISO string
            try:
                datetime.fromisoformat(str(value).replace('Z', '+00:00'))
                return True, "Valid ISO timestamp"
            except (ValueError, TypeError):
                return False, "Timestamp must be a float or ISO datetime string"
        
    except Exception as e:
        return False, f"Timestamp validation error: {str(e)}"

def _validate_username_or_ip(value: Any, context: Dict[str, Any] = None) -> Tuple[bool, str]:
    """Validate username or IP for authentication failures"""
    try:
        if not value:
            return False, "Username or IP is required"
        
        str_value = str(value).strip()
        
        # Check if it's an IP address
        ip_valid, _ = _validate_ip_address(str_value, context)
        if ip_valid:
            return True, "Valid IP address"
        
        # Check if it's a username
        username_valid, _ = _validate_username(str_value, context)
        if username_valid:
            return True, "Valid username"
        
        # Allow email as username
        email_valid, _ = _validate_email(str_value, context)
        if email_valid:
            return True, "Valid email"
        
        return False, "Must be a valid username, email, or IP address"
        
    except Exception as e:
        return False, f"Username/IP validation error: {str(e)}"

# ==================== CROSS-FIELD VALIDATORS ====================

def _validate_username_mismatch(data: Dict[str, Any], context: Dict[str, Any] = None) -> Tuple[bool, str]:
    """Validate that username and PPPoE username don't mismatch significantly"""
    username = data.get('username')
    pppoe_username = data.get('pppoe_username')
    
    if username and pppoe_username:
        # Allow some differences but catch major mismatches
        if username.lower() != pppoe_username.lower():
            # Check if they're at least related (e.g., one contains the other)
            if (username.lower() not in pppoe_username.lower() and 
                pppoe_username.lower() not in username.lower()):
                return True, "Username and PPPoE username differ"  # Warning, not error
    
    return True, "Valid username match"

def _validate_notification_data(data: Dict[str, Any], context: Dict[str, Any] = None) -> Tuple[bool, str]:
    """Validate notification data structure"""
    notification_data = data.get('data')
    
    if not isinstance(notification_data, dict):
        return False, "Notification data must be a dictionary"
    
    if len(notification_data) == 0:
        return False, "Notification data cannot be empty"
    
    # Check for required notification data based on type
    notification_type = data.get('notification_type', '').lower()
    
    if notification_type == 'payment' and 'amount' not in notification_data:
        return False, "Payment notifications must include 'amount'"
    
    if notification_type == 'expiry' and 'days_remaining' not in notification_data:
        return False, "Expiry notifications must include 'days_remaining'"
    
    return True, "Valid notification data"

def _perform_strict_validations(signal_type: SignalType, data: Dict[str, Any], result: ValidationResult):
    """Perform additional strict validations"""
    
    if signal_type == SignalType.PPPOE_CREDENTIALS_GENERATED:
        # Check for password reuse patterns
        password = data.get('password', '')
        username = data.get('username', '')
        
        if username and password:
            # Password shouldn't be too similar to username
            if username.lower() in password.lower():
                result.add_warning('password', 'Password is similar to username')
            
            # Check for sequential characters
            if re.search(r'(?:0123|1234|2345|3456|4567|5678|6789|7890|abcd|bcde|cdef|defg)', password.lower()):
                result.add_warning('password', 'Password contains sequential characters')

# ==================== CORE VALIDATION FUNCTIONS ====================

def validate_signal_data(
    signal_type: SignalType,
    data: Dict[str, Any],
    level: ValidationLevel = ValidationLevel.NORMAL,
    context: Optional[Dict[str, Any]] = None
) -> Tuple[bool, str]:
    """
    Validate signal data against schema
    Returns (is_valid, error_message)
    """
    result = ValidationResult()
    
    try:
        if signal_type not in SIGNAL_SCHEMAS:
            return False, f"Unknown signal type: {signal_type}"
        
        schema = SIGNAL_SCHEMAS[signal_type]
        context = context or {}
        
        # Check required fields
        missing_fields = schema['required_fields'] - set(data.keys())
        if missing_fields:
            return False, f"Missing required fields: {', '.join(missing_fields)}"
        
        # Validate individual fields
        for field, value in data.items():
            # Skip unknown fields in lenient mode
            if (field not in schema['required_fields'] and 
                field not in schema['optional_fields']):
                if level == ValidationLevel.STRICT:
                    result.add_error(field, f"Unknown field for signal type {signal_type.value}")
                elif level == ValidationLevel.NORMAL:
                    result.add_warning(field, f"Unknown field for signal type {signal_type.value}")
                continue
            
            # Get validator
            validator_name = schema['field_validators'].get(field)
            if validator_name:
                validator = globals().get(validator_name)
                if validator:
                    is_valid, message = validator(value, context)
                    if not is_valid:
                        result.add_error(field, message)
        
        # Run cross-field validators
        if 'cross_field_validators' in schema:
            for validator_name in schema['cross_field_validators']:
                validator = globals().get(validator_name)
                if validator:
                    is_valid, message = validator(data, context)
                    if not is_valid:
                        result.add_error('cross_field', message)
        
        # Check for extra validation based on level
        if level == ValidationLevel.STRICT:
            _perform_strict_validations(signal_type, data, result)
        
        # Return result
        if not result.is_valid:
            errors_summary = '; '.join([f"{e['field']}: {e['message']}" for e in result.errors[:3]])
            if len(result.errors) > 3:
                errors_summary += f" and {len(result.errors) - 3} more errors"
            return False, errors_summary
        
        return True, "Valid"
        
    except Exception as e:
        logger.error(f"Validation error for {signal_type}: {e}", exc_info=True)
        return False, f"Validation error: {str(e)}"

def validate_batch_signal_data(
    signal_type: SignalType,
    data_list: List[Dict[str, Any]],
    level: ValidationLevel = ValidationLevel.NORMAL
) -> Dict[str, Any]:
    """
    Validate batch of signal data
    """
    result = {
        'total': len(data_list),
        'valid': 0,
        'invalid': 0,
        'errors': [],
        'warnings': [],
        'timestamp': datetime.now().isoformat()
    }
    
    for index, data in enumerate(data_list):
        is_valid, error_message = validate_signal_data(signal_type, data, level)
        
        if is_valid:
            result['valid'] += 1
        else:
            result['invalid'] += 1
            result['errors'].append({
                'index': index,
                'data': {k: v for k, v in data.items() if k != 'password'},
                'error': error_message
            })
    
    # Calculate validation rate
    if result['total'] > 0:
        result['validation_rate'] = (result['valid'] / result['total']) * 100
    else:
        result['validation_rate'] = 100
    
    return result

# ==================== UTILITY FUNCTIONS ====================

def sanitize_signal_data(data: Dict[str, Any]) -> Dict[str, Any]:
    """Sanitize signal data by removing sensitive information"""
    sanitized = data.copy()
    
    # Remove passwords and tokens
    sensitive_fields = {'password', 'token', 'secret', 'key', 'auth', 'credential'}
    
    for field in list(sanitized.keys()):
        field_lower = field.lower()
        if any(sensitive in field_lower for sensitive in sensitive_fields):
            sanitized[field] = '[REDACTED]'
    
    # Truncate long values for logging
    for field, value in sanitized.items():
        if isinstance(value, str) and len(value) > 100:
            sanitized[field] = value[:100] + '...'
    
    return sanitized

def get_validation_summary(results: List[ValidationResult]) -> Dict[str, Any]:
    """Get summary of multiple validation results"""
    summary = {
        'total': len(results),
        'valid': 0,
        'invalid': 0,
        'total_errors': 0,
        'total_warnings': 0,
        'common_errors': {},
        'by_field': {}
    }
    
    for result in results:
        if result.is_valid:
            summary['valid'] += 1
        else:
            summary['invalid'] += 1
        
        summary['total_errors'] += len(result.errors)
        summary['total_warnings'] += len(result.warnings)
        
        # Track common errors
        for error in result.errors:
            field = error['field']
            message = error['message']
            
            key = f"{field}:{message}"
            summary['common_errors'][key] = summary['common_errors'].get(key, 0) + 1
            
            # Track by field
            if field not in summary['by_field']:
                summary['by_field'][field] = {'errors': 0, 'warnings': 0}
            summary['by_field'][field]['errors'] += 1
    
    return summary

# ==================== PUBLIC VALIDATION FUNCTIONS ====================

def validate_phone_number(value: str) -> Tuple[bool, str]:
    """
    Validate phone number format
    """
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

# Export the public validation functions
__all__ = [
    'validate_signal_data',
    'validate_batch_signal_data',
    'sanitize_signal_data',
    'get_validation_summary',
    'validate_phone_number',
    'ValidationLevel',
    'ValidationResult'
]