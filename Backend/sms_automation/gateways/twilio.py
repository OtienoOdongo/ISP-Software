"""
Twilio Gateway Implementation
"""
import logging
from twilio.rest import Client
from twilio.base.exceptions import TwilioRestException
from django.conf import settings
from django.utils import timezone
import requests

logger = logging.getLogger(__name__)


class TwilioGateway:
    """Twilio SMS Gateway"""
    
    def __init__(self, config):
        self.config = config
        self.name = config.name
        self.gateway_type = config.gateway_type
        
        # Initialize Twilio client
        self._initialize_client()
    
    def _initialize_client(self):
        """Initialize Twilio client"""
        try:
            account_sid = self.config.api_key or getattr(settings, 'TWILIO_ACCOUNT_SID', '')
            auth_token = self.config.api_secret or getattr(settings, 'TWILIO_AUTH_TOKEN', '')
            
            if not account_sid or not auth_token:
                raise ValueError("Twilio credentials not configured")
            
            self.client = Client(account_sid, auth_token)
            
        except Exception as e:
            logger.error(f"Failed to initialize Twilio client: {str(e)}")
            raise
    
    def format_phone_number(self, phone_number):
        """Format phone number for Twilio"""
        import re
        cleaned = re.sub(r'\D', '', str(phone_number))
        
        if cleaned.startswith('0') and len(cleaned) == 10:
            return f"+254{cleaned[1:]}"
        elif len(cleaned) == 9:
            return f"+254{cleaned}"
        elif cleaned.startswith('254') and len(cleaned) == 12:
            return f"+{cleaned}"
        else:
            return f"+{cleaned}"
    
    def send_sms(self, phone_number, message, sender_id=None):
        """Send SMS via Twilio"""
        try:
            # Format phone number
            formatted_number = self.format_phone_number(phone_number)
            
            # Get sender ID
            from_number = sender_id or self.config.sender_id or getattr(settings, 'TWILIO_PHONE_NUMBER', '')
            
            if not from_number:
                raise ValueError("Twilio phone number not configured")
            
            # Send SMS
            twilio_message = self.client.messages.create(
                body=message,
                from_=from_number,
                to=formatted_number
            )
            
            # Parse response
            success = twilio_message.status in ['sent', 'queued', 'delivered']
            
            return {
                'success': success,
                'message_id': twilio_message.sid,
                'transaction_id': twilio_message.sid,
                'status_code': twilio_message.status,
                'status_message': twilio_message.status,
                'cost': float(twilio_message.price) if twilio_message.price else None,
                'response': {
                    'sid': twilio_message.sid,
                    'status': twilio_message.status,
                    'price': twilio_message.price,
                    'price_unit': twilio_message.price_unit,
                    'uri': twilio_message.uri
                },
                'error_message': None if success else twilio_message.error_message
            }
            
        except TwilioRestException as e:
            logger.error(f"Twilio API error: {str(e)}")
            return {
                'success': False,
                'message_id': None,
                'response': None,
                'error_code': e.code,
                'error_message': e.msg
            }
        except Exception as e:
            logger.error(f"Twilio error: {str(e)}")
            return {
                'success': False,
                'message_id': None,
                'response': None,
                'error_code': 'UNKNOWN_ERROR',
                'error_message': str(e)
            }
    
    def get_balance(self):
        """Get Twilio account balance"""
        try:
            # Twilio doesn't provide balance via API directly
            # We need to use their pricing API or account API
            
            # This is a placeholder implementation
            # In production, implement proper balance check
            
            # For now, return cached balance
            if hasattr(self, '_cached_balance') and hasattr(self, '_balance_cache_time'):
                if (timezone.now() - self._balance_cache_time).total_seconds() < 300:
                    return self._cached_balance
            
            # Make API call to get balance
            account_sid = self.config.api_key
            auth_token = self.config.api_secret
            
            # Twilio balance check via their API
            # This is simplified - implement based on your needs
            
            # Cache the result
            balance = 0.0  # Placeholder
            self._cached_balance = balance
            self._balance_cache_time = timezone.now()
            
            return balance
            
        except Exception as e:
            logger.error(f"Failed to get Twilio balance: {str(e)}")
            return 0.0
    
    def get_status(self):
        """Get gateway status"""
        try:
            # Test connection by making a simple API call
            balance = self.get_balance()
            
            return {
                'status': 'online',
                'balance': balance,
                'currency': 'USD',  # Twilio uses USD
                'last_check': timezone.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Failed to get Twilio status: {str(e)}")
            return {
                'status': 'offline',
                'error': str(e),
                'last_check': timezone.now().isoformat()
            }
    
    def process_webhook(self, data, headers):
        """Process Twilio webhook for delivery reports"""
        try:
            updates = []
            
            # Parse webhook data
            message_sid = data.get('MessageSid')
            message_status = data.get('MessageStatus')
            
            if message_sid and message_status:
                # Find message by gateway message ID
                from sms_automation.models import SMSMessage
                messages = SMSMessage.objects.filter(
                    gateway_message_id=message_sid,
                    gateway=self.config
                )
                
                for message in messages:
                    if message_status.lower() == 'delivered':
                        message.mark_as_delivered({
                            'webhook_data': data,
                            'webhook_timestamp': timezone.now().isoformat()
                        })
                    elif message_status.lower() in ['failed', 'undelivered']:
                        message.mark_as_failed(
                            f"Delivery failed: {message_status}",
                            {'webhook_data': data}
                        )
                    
                    updates.append({
                        'message_id': str(message.id),
                        'status': message.status,
                        'gateway_status': message_status
                    })
            
            return updates
            
        except Exception as e:
            logger.error(f"Failed to process Twilio webhook: {str(e)}")
            return []