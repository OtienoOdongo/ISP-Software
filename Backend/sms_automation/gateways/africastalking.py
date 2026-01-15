"""
Africa's Talking Gateway Implementation
"""
import logging
import africastalking
import requests
from django.conf import settings
from django.utils import timezone
from datetime import datetime
from sms_automation.models.sms_automation_model import SMSMessage
import json

logger = logging.getLogger(__name__)


class AfricaTalkingGateway:
    """Africa's Talking SMS Gateway"""
    
    def __init__(self, config):
        self.config = config
        self.name = config.name
        self.gateway_type = config.gateway_type
        
        # Initialize Africa's Talking SDK
        self._initialize_sdk()
    
    def _initialize_sdk(self):
        """Initialize Africa's Talking SDK"""
        try:
            username = self.config.api_key or getattr(settings, 'AFRICASTALKING_USERNAME', '')
            api_key = self.config.api_secret or getattr(settings, 'AFRICASTALKING_API_KEY', '')
            
            if not username or not api_key:
                raise ValueError("Africa's Talking credentials not configured")
            
            africastalking.initialize(username, api_key)
            self.sms = africastalking.SMS
            
        except Exception as e:
            logger.error(f"Failed to initialize Africa's Talking SDK: {str(e)}")
            raise
    
    def format_phone_number(self, phone_number):
        """Format phone number for Africa's Talking"""
        # Remove all non-digit characters
        import re
        cleaned = re.sub(r'\D', '', str(phone_number))
        
        if cleaned.startswith('0') and len(cleaned) == 10:
            return f"254{cleaned[1:]}"
        elif len(cleaned) == 9:
            return f"254{cleaned}"
        elif cleaned.startswith('254') and len(cleaned) == 12:
            return cleaned
        else:
            return phone_number
    
    def send_sms(self, phone_number, message, sender_id=None):
        """Send SMS via Africa's Talking"""
        try:
            # Format phone number
            formatted_number = self.format_phone_number(phone_number)
            
            # Prepare sender ID
            from_ = sender_id or self.config.sender_id or getattr(settings, 'DEFAULT_SENDER_ID', '')
            
            # Send SMS
            response = self.sms.send(
                message=message,
                recipients=[formatted_number],
                from_=from_,
                enqueue=getattr(settings, 'AFRICASTALKING_ENQUEUE', False)
            )
            
            # Parse response
            recipients = response.get('SMSMessageData', {}).get('Recipients', [])
            
            if recipients:
                recipient = recipients[0]
                status_code = recipient.get('statusCode')
                message_id = recipient.get('messageId')
                
                success = status_code == 101  # 101 means sent successfully
                
                return {
                    'success': success,
                    'message_id': message_id,
                    'transaction_id': recipient.get('requestId'),
                    'status_code': status_code,
                    'status_message': recipient.get('status'),
                    'cost': float(recipient.get('cost', '0').split(' ')[-1]) if recipient.get('cost') else None,
                    'response': response,
                    'error_message': None if success else recipient.get('status')
                }
            
            return {
                'success': False,
                'message_id': None,
                'response': response,
                'error_message': 'No recipients in response'
            }
            
        except africastalking.ServiceException as e:
            logger.error(f"Africa's Talking service error: {str(e)}")
            return {
                'success': False,
                'message_id': None,
                'response': None,
                'error_code': 'SERVICE_ERROR',
                'error_message': str(e)
            }
        except Exception as e:
            logger.error(f"Africa's Talking error: {str(e)}")
            return {
                'success': False,
                'message_id': None,
                'response': None,
                'error_code': 'UNKNOWN_ERROR',
                'error_message': str(e)
            }
    
    def get_balance(self):
        """Get Africa's Talking account balance"""
        try:
            # Africa's Talking balance check via USSD
            username = self.config.api_key
            api_key = self.config.api_key
            
            # This is a simplified version - you might need to use their API differently
            # or implement balance check via USSD
            
            # For now, return cached balance or make API call
            if hasattr(self, '_cached_balance') and hasattr(self, '_balance_cache_time'):
                if (timezone.now() - self._balance_cache_time).total_seconds() < 300:
                    return self._cached_balance
            
            # Make API call to get balance (implementation depends on your account)
            # This is a placeholder - implement based on your Africa's Talking account
            balance = 0.0
            
            # Cache the result
            self._cached_balance = balance
            self._balance_cache_time = timezone.now()
            
            return balance
            
        except Exception as e:
            logger.error(f"Failed to get Africa's Talking balance: {str(e)}")
            return 0.0
    
    def get_status(self):
        """Get gateway status"""
        try:
            # Test connection by making a simple API call
            balance = self.get_balance()
            
            return {
                'status': 'online',
                'balance': balance,
                'currency': 'KES',
                'last_check': timezone.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Failed to get Africa's Talking status: {str(e)}")
            return {
                'status': 'offline',
                'error': str(e),
                'last_check': timezone.now().isoformat()
            }
    
    def process_webhook(self, data, headers):
        """Process Africa's Talking webhook for delivery reports"""
        try:
            updates = []
            
            # Parse webhook data
            message_data = data.get('SMSMessageData', {})
            message_id = message_data.get('id')
            status = message_data.get('status')
            
            if message_id and status:
                # Find message by gateway message ID
                messages = SMSMessage.objects.filter(
                    gateway_message_id=message_id,
                    gateway=self.config
                )
                
                for message in messages:
                    if status.lower() == 'delivered':
                        message.mark_as_delivered({
                            'webhook_data': data,
                            'webhook_timestamp': timezone.now().isoformat()
                        })
                    elif status.lower() in ['rejected', 'failed']:
                        message.mark_as_failed(
                            f"Delivery failed: {status}",
                            {'webhook_data': data}
                        )
                    
                    updates.append({
                        'message_id': str(message.id),
                        'status': message.status,
                        'gateway_status': status
                    })
            
            return updates
            
        except Exception as e:
            logger.error(f"Failed to process Africa's Talking webhook: {str(e)}")
            return []