"""
Custom HTTP/HTTPS Gateway Implementation
For REST API based SMS gateways
"""
import logging
import requests
import json
import uuid
import time
from urllib.parse import urlencode
from django.conf import settings
from django.utils import timezone
from sms_automation.models.sms_automation_model import SMSMessage

logger = logging.getLogger(__name__)


class CustomGateway:
    """Custom HTTP/HTTPS SMS Gateway"""
    
    def __init__(self, config):
        self.config = config
        self.name = config.name
        self.gateway_type = config.gateway_type
        
        # Custom gateway configuration
        self.endpoint = config.extra_data.get('endpoint', '')
        self.method = config.extra_data.get('method', 'POST').upper()
        self.auth_type = config.extra_data.get('auth_type', 'api_key')  # api_key, basic_auth, bearer_token, none
        self.auth_header = config.extra_data.get('auth_header', 'Authorization')
        self.api_key = config.api_key
        self.api_secret = config.api_secret
        
        # Request parameters mapping
        self.param_mapping = config.extra_data.get('param_mapping', {})
        self.response_mapping = config.extra_data.get('response_mapping', {})
        
        # Default values
        self.default_params = config.extra_data.get('default_params', {})
        
        # Headers
        self.headers = config.extra_data.get('headers', {})
        
        # HTTP client
        self.session = requests.Session()
        self.session.timeout = config.extra_data.get('timeout', 30)
        
        logger.info(f"Initialized custom gateway: {self.name}")
    
    def format_phone_number(self, phone_number):
        """Format phone number based on gateway requirements"""
        import re
        
        # Get formatting rules from config
        format_rules = self.config.extra_data.get('phone_format', {})
        
        # Clean phone number
        cleaned = re.sub(r'\D', '', str(phone_number))
        
        # Apply formatting rules
        if format_rules.get('remove_leading_zero', True) and cleaned.startswith('0'):
            cleaned = cleaned[1:]
        
        if format_rules.get('add_country_code', True):
            country_code = format_rules.get('country_code', '254')
            if not cleaned.startswith(country_code):
                # Check if number is already international
                if len(cleaned) == 9 or len(cleaned) == 10:
                    cleaned = f"{country_code}{cleaned[-9:]}"  # Take last 9 digits
        
        # Add plus sign if required
        if format_rules.get('add_plus', False):
            cleaned = f"+{cleaned}"
        
        return cleaned
    
    def _build_headers(self):
        """Build HTTP headers with authentication"""
        headers = self.headers.copy()
        
        # Add authentication
        if self.auth_type == 'api_key':
            if self.auth_header:
                headers[self.auth_header] = self.api_key
            else:
                headers['Authorization'] = f"API-Key {self.api_key}"
        
        elif self.auth_type == 'bearer_token':
            headers['Authorization'] = f"Bearer {self.api_key}"
        
        elif self.auth_type == 'basic_auth':
            import base64
            auth_string = f"{self.api_key}:{self.api_secret}"
            encoded = base64.b64encode(auth_string.encode()).decode()
            headers['Authorization'] = f"Basic {encoded}"
        
        # Add content type if not specified
        if 'Content-Type' not in headers:
            headers['Content-Type'] = 'application/json'
        
        return headers
    
    def _build_payload(self, phone_number, message, sender_id=None):
        """Build request payload based on parameter mapping"""
        payload = self.default_params.copy()
        
        # Get mapping or use defaults
        phone_param = self.param_mapping.get('phone', 'phone')
        message_param = self.param_mapping.get('message', 'message')
        sender_param = self.param_mapping.get('sender', 'sender')
        
        # Format phone number
        formatted_phone = self.format_phone_number(phone_number)
        
        # Add parameters
        payload[phone_param] = formatted_phone
        payload[message_param] = message
        
        # Add sender ID if available
        sender_to_use = sender_id or self.config.sender_id
        if sender_to_use and sender_param:
            payload[sender_param] = sender_to_use
        
        # Add any custom parameters
        custom_params = self.config.extra_data.get('custom_params', {})
        payload.update(custom_params)
        
        return payload
    
    def _parse_response(self, response):
        """Parse gateway response based on response mapping"""
        try:
            # Try to parse JSON
            response_data = response.json()
        except:
            # If not JSON, use text
            response_data = {'raw_response': response.text}
        
        # Extract values using response mapping
        mapping = self.response_mapping
        
        success = False
        message_id = None
        status_code = None
        status_message = None
        cost = None
        error_message = None
        
        # Extract using dot notation
        def get_nested_value(data, key):
            keys = key.split('.')
            current = data
            for k in keys:
                if isinstance(current, dict) and k in current:
                    current = current[k]
                else:
                    return None
            return current
        
        # Success flag
        success_key = mapping.get('success', 'success')
        if isinstance(success_key, str):
            success_val = get_nested_value(response_data, success_key)
        else:
            # Success can be a boolean expression
            success_val = bool(success_key)
        
        if success_val is not None:
            # Convert to boolean
            if isinstance(success_val, str):
                success = success_val.lower() in ['true', 'success', 'ok', '1']
            else:
                success = bool(success_val)
        
        # Message ID
        message_id_key = mapping.get('message_id', 'message_id')
        if message_id_key:
            message_id = get_nested_value(response_data, message_id_key)
        
        # Status code
        status_code_key = mapping.get('status_code', 'status_code')
        if status_code_key:
            status_code = get_nested_value(response_data, status_code_key)
        
        # Status message
        status_message_key = mapping.get('status_message', 'status_message')
        if status_message_key:
            status_message = get_nested_value(response_data, status_message_key)
        
        # Cost
        cost_key = mapping.get('cost', 'cost')
        if cost_key:
            cost_val = get_nested_value(response_data, cost_key)
            if cost_val:
                try:
                    cost = float(cost_val)
                except:
                    cost = None
        
        # Error message
        error_key = mapping.get('error_message', 'error_message')
        if error_key:
            error_message = get_nested_value(response_data, error_key)
        
        # If no explicit success flag, infer from status
        if success is None:
            if status_message:
                success = 'success' in status_message.lower()
            elif status_code:
                success = str(status_code).startswith('2')  # HTTP 2xx
        
        return {
            'success': success if success is not None else True,
            'message_id': message_id or str(uuid.uuid4()),
            'status_code': status_code or response.status_code,
            'status_message': status_message or ('Success' if success else 'Failed'),
            'cost': cost,
            'response': response_data,
            'error_message': error_message
        }
    
    def send_sms(self, phone_number, message, sender_id=None):
        """Send SMS via custom HTTP gateway"""
        try:
            # Build request
            endpoint = self.endpoint
            headers = self._build_headers()
            payload = self._build_payload(phone_number, message, sender_id)
            
            logger.debug(f"Sending to {endpoint} with payload: {payload}")
            
            # Make request
            start_time = time.time()
            
            if self.method == 'GET':
                # For GET requests, encode parameters in URL
                query_string = urlencode(payload)
                full_url = f"{endpoint}?{query_string}"
                response = self.session.get(full_url, headers=headers)
            else:
                # For POST, PUT, etc.
                if headers.get('Content-Type') == 'application/json':
                    response = self.session.post(endpoint, json=payload, headers=headers)
                else:
                    response = self.session.post(endpoint, data=payload, headers=headers)
            
            response_time = int((time.time() - start_time) * 1000)
            
            logger.debug(f"Response: {response.status_code} in {response_time}ms")
            
            # Parse response
            result = self._parse_response(response)
            
            # Add timing information
            result['response_time_ms'] = response_time
            
            if not result['success']:
                logger.error(f"Custom gateway error: {result.get('error_message', 'Unknown error')}")
            
            return result
            
        except requests.exceptions.Timeout:
            logger.error(f"Custom gateway timeout: {self.endpoint}")
            return {
                'success': False,
                'message_id': None,
                'status_code': 408,
                'status_message': 'Timeout',
                'error_message': f"Request timeout after {self.session.timeout}s"
            }
            
        except requests.exceptions.ConnectionError:
            logger.error(f"Custom gateway connection error: {self.endpoint}")
            return {
                'success': False,
                'message_id': None,
                'status_code': 503,
                'status_message': 'Connection Error',
                'error_message': 'Cannot connect to gateway'
            }
            
        except Exception as e:
            logger.error(f"Custom gateway error: {str(e)}")
            return {
                'success': False,
                'message_id': None,
                'status_code': 500,
                'status_message': 'Internal Error',
                'error_message': str(e)
            }
    
    def get_balance(self):
        """Get balance from custom gateway"""
        try:
            # Check if balance endpoint is configured
            balance_endpoint = self.config.extra_data.get('balance_endpoint')
            if not balance_endpoint:
                return self.config.extra_data.get('simulated_balance', 0.0)
            
            # Make balance request
            headers = self._build_headers()
            
            response = self.session.get(balance_endpoint, headers=headers)
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    
                    # Extract balance using mapping
                    balance_key = self.response_mapping.get('balance', 'balance')
                    if '.' in balance_key:
                        # Dot notation
                        keys = balance_key.split('.')
                        balance = data
                        for key in keys:
                            if isinstance(balance, dict) and key in balance:
                                balance = balance[key]
                            else:
                                return 0.0
                    else:
                        balance = data.get(balance_key, 0.0)
                    
                    # Convert to float
                    try:
                        return float(balance)
                    except:
                        return 0.0
                        
                except:
                    # Return raw text
                    return 0.0
            else:
                logger.warning(f"Balance check failed: {response.status_code}")
                return 0.0
                
        except Exception as e:
            logger.error(f"Failed to get custom gateway balance: {str(e)}")
            return 0.0
    
    def get_status(self):
        """Get gateway status"""
        try:
            # Check if status endpoint is configured
            status_endpoint = self.config.extra_data.get('status_endpoint')
            
            if status_endpoint:
                # Make status check request
                headers = self._build_headers()
                
                try:
                    response = self.session.get(status_endpoint, headers=headers, timeout=10)
                    
                    if response.status_code == 200:
                        return {
                            'status': 'online',
                            'balance': self.get_balance(),
                            'last_check': timezone.now().isoformat(),
                            'response_time': response.elapsed.total_seconds() * 1000
                        }
                    else:
                        return {
                            'status': 'offline',
                            'error': f"Status endpoint returned {response.status_code}",
                            'last_check': timezone.now().isoformat()
                        }
                        
                except requests.exceptions.Timeout:
                    return {
                        'status': 'offline',
                        'error': 'Status check timeout',
                        'last_check': timezone.now().isoformat()
                    }
                except Exception as e:
                    return {
                        'status': 'offline',
                        'error': str(e),
                        'last_check': timezone.now().isoformat()
                    }
            else:
                # No status endpoint, try a simple send test
                balance = self.get_balance()
                
                return {
                    'status': 'online' if balance > 0 else 'offline',
                    'balance': balance,
                    'last_check': timezone.now().isoformat()
                }
                
        except Exception as e:
            logger.error(f"Failed to get custom gateway status: {str(e)}")
            return {
                'status': 'offline',
                'error': str(e),
                'last_check': timezone.now().isoformat()
            }
    
    def process_webhook(self, data, headers):
        """Process custom webhook for delivery reports"""
        try:
            updates = []
            
            # Parse webhook data based on configuration
            webhook_config = self.config.extra_data.get('webhook_config', {})
            
            # Get message ID field
            message_id_field = webhook_config.get('message_id_field', 'message_id')
            
            # Get status field
            status_field = webhook_config.get('status_field', 'status')
            
            # Get status mapping
            status_mapping = webhook_config.get('status_mapping', {})
            
            # Extract data
            message_id = data.get(message_id_field) if isinstance(data, dict) else None
            status = data.get(status_field) if isinstance(data, dict) else None
            
            # If not dict, try to parse JSON from raw data
            if not isinstance(data, dict):
                try:
                    data = json.loads(data)
                    message_id = data.get(message_id_field)
                    status = data.get(status_field)
                except:
                    pass
            
            if message_id and status:
                # Find message by gateway message ID
                messages = SMSMessage.objects.filter(
                    gateway_message_id=message_id,
                    gateway=self.config
                )
                
                for message in messages:
                    # Map status using configuration
                    mapped_status = status_mapping.get(status, status)
                    
                    if mapped_status.lower() in ['delivered', 'success']:
                        message.mark_as_delivered({
                            'webhook_data': data,
                            'original_status': status,
                            'webhook_timestamp': timezone.now().isoformat()
                        })
                    elif mapped_status.lower() in ['failed', 'rejected', 'undelivered']:
                        message.mark_as_failed(
                            f"Custom gateway delivery failed: {status}",
                            {'webhook_data': data}
                        )
                    
                    updates.append({
                        'message_id': str(message.id),
                        'status': message.status,
                        'original_status': status,
                        'mapped_status': mapped_status
                    })
            
            return updates
            
        except Exception as e:
            logger.error(f"Failed to process custom webhook: {str(e)}")
            return []