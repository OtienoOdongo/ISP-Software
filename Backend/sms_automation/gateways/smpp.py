"""
SMPP Gateway Implementation
"""
import logging
import uuid
import time
from django.conf import settings
from django.utils import timezone
from sms_automation.models.sms_automation_model import SMSMessage
import json

logger = logging.getLogger(__name__)


class SMPPGateway:
    """SMPP SMS Gateway"""
    
    def __init__(self, config):
        self.config = config
        self.name = config.name
        self.gateway_type = config.gateway_type
        
        # SMPP connection parameters
        self.host = config.extra_data.get('host', '')
        self.port = config.extra_data.get('port', 2775)
        self.system_id = config.extra_data.get('system_id', '')
        self.password = config.extra_data.get('password', '')
        
        # SMPP client (placeholder - you'd use a real SMPP library)
        self.client = None
        self._is_connected = False
        
        # Initialize connection
        self._initialize_connection()
    
    def _initialize_connection(self):
        """Initialize SMPP connection"""
        try:
            # This is a placeholder for SMPP connection
            # In production, use a library like python-smpplib
            
            logger.info(f"Initializing SMPP connection to {self.host}:{self.port}")
            
            # Mock connection for now
            self._is_connected = True
            
            logger.info("SMPP connection initialized")
            
        except Exception as e:
            logger.error(f"Failed to initialize SMPP connection: {str(e)}")
            self._is_connected = False
    
    def format_phone_number(self, phone_number):
        """Format phone number for SMPP"""
        import re
        
        # Clean phone number
        cleaned = re.sub(r'\D', '', str(phone_number))
        
        # Standardize to international format
        if cleaned.startswith('0') and len(cleaned) == 10:
            # Kenyan numbers like 0712345678 -> 254712345678
            return f"254{cleaned[1:]}"
        elif len(cleaned) == 9:
            # Numbers without leading zero like 712345678
            return f"254{cleaned}"
        elif cleaned.startswith('254') and len(cleaned) == 12:
            # Already in international format
            return cleaned
        elif len(cleaned) < 9:
            # Too short, return as is
            logger.warning(f"Phone number {phone_number} seems invalid")
            return cleaned
        else:
            # Other international numbers
            return cleaned
    
    def _connect(self):
        """Connect to SMPP server if not connected"""
        try:
            if not self._is_connected:
                logger.info("Reconnecting to SMPP server...")
                
                # Mock reconnection
                # In production: self.client.connect()
                # self.client.bind_transceiver()
                
                time.sleep(0.5)  # Simulate connection delay
                self._is_connected = True
                
            return self._is_connected
            
        except Exception as e:
            logger.error(f"Failed to connect to SMPP: {str(e)}")
            self._is_connected = False
            return False
    
    def send_sms(self, phone_number, message, sender_id=None):
        """Send SMS via SMPP"""
        try:
            # Connect if not connected
            if not self._connect():
                return {
                    'success': False,
                    'message_id': None,
                    'response': None,
                    'error_code': 'CONNECTION_ERROR',
                    'error_message': 'SMPP connection failed'
                }
            
            # Format phone number
            formatted_number = self.format_phone_number(phone_number)
            
            # Get sender ID
            source_addr = sender_id or self.config.sender_id or self.config.extra_data.get('source_addr', '')
            
            if not source_addr:
                logger.warning("No sender ID configured for SMPP")
                source_addr = 'SMS'
            
            # Generate message ID
            message_id = str(uuid.uuid4())
            
            # In production, this would use actual SMPP bind_transmitter and submit_sm
            # Example with python-smpplib:
            # message_parts = self._split_message(message)
            # for part in message_parts:
            #     self.client.submit_sm(
            #         source_addr_ton=1,
            #         source_addr_npi=1,
            #         source_addr=source_addr,
            #         dest_addr_ton=1,
            #         dest_addr_npi=1,
            #         destination_addr=formatted_number,
            #         short_message=part.encode('utf-8'),
            #         registered_delivery=1
            #     )
            
            # For now, simulate sending
            logger.info(f"[SMPP SIM] Sending to {formatted_number}: {message[:50]}...")
            
            # Simulate different success rates
            success_rate = self.config.extra_data.get('simulated_success_rate', 95)
            import random
            is_successful = random.randint(1, 100) <= success_rate
            
            if is_successful:
                return {
                    'success': True,
                    'message_id': message_id,
                    'transaction_id': f"smpp_{int(time.time())}",
                    'status_code': '0',  # SMPP success code
                    'status_message': 'DELIVERED',
                    'cost': self.config.extra_data.get('cost_per_message', 0.5),
                    'response': {
                        'message_id': message_id,
                        'destination': formatted_number,
                        'source_addr': source_addr,
                        'message_parts': 1,
                        'sm_length': len(message)
                    },
                    'error_message': None
                }
            else:
                return {
                    'success': False,
                    'message_id': message_id,
                    'transaction_id': f"smpp_{int(time.time())}",
                    'status_code': '1',  # SMPP error code
                    'status_message': 'REJECTED',
                    'response': {
                        'message_id': message_id,
                        'error': 'Simulated failure'
                    },
                    'error_code': 'SMPP_ERROR',
                    'error_message': 'Message rejected by SMSC'
                }
                
        except Exception as e:
            logger.error(f"SMPP sending error: {str(e)}")
            return {
                'success': False,
                'message_id': None,
                'response': None,
                'error_code': 'SMPP_ERROR',
                'error_message': str(e)
            }
    
    def _split_message(self, message):
        """Split long messages for concatenated SMS (if needed)"""
        # SMPP max message length is typically 140 bytes for GSM charset
        max_length = 140
        message_bytes = message.encode('utf-8')
        
        if len(message_bytes) <= max_length:
            return [message]
        
        # Simple splitting for demo
        # In production, implement proper UCS2/GSM charset handling
        parts = []
        current_part = ""
        
        for char in message:
            if len((current_part + char).encode('utf-8')) <= max_length:
                current_part += char
            else:
                parts.append(current_part)
                current_part = char
        
        if current_part:
            parts.append(current_part)
        
        return parts
    
    def get_balance(self):
        """Get SMPP account balance"""
        try:
            # SMPP doesn't have a standard balance check
            # This depends on your SMSC provider
            
            # Return simulated balance
            return self.config.extra_data.get('simulated_balance', 100.0)
            
        except Exception as e:
            logger.error(f"Failed to get SMPP balance: {str(e)}")
            return 0.0
    
    def get_status(self):
        """Get gateway status"""
        try:
            # Check connection status
            is_connected = self._is_connected
            
            if not is_connected:
                # Try to reconnect
                is_connected = self._connect()
            
            balance = self.get_balance()
            
            return {
                'status': 'online' if is_connected else 'offline',
                'connected': is_connected,
                'balance': balance,
                'currency': self.config.extra_data.get('currency', 'KES'),
                'host': f"{self.host}:{self.port}",
                'system_id': self.system_id,
                'last_check': timezone.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Failed to get SMPP status: {str(e)}")
            return {
                'status': 'offline',
                'connected': False,
                'error': str(e),
                'last_check': timezone.now().isoformat()
            }
    
    def process_webhook(self, data, headers):
        """Process SMPP delivery reports"""
        try:
            updates = []
            
            # SMPP delivery reports typically come as separate messages
            # This is a placeholder implementation
            
            # Parse delivery report
            message_id = data.get('message_id')
            status = data.get('status')
            error_code = data.get('error_code')
            
            if message_id:
                # Find message by gateway message ID
                messages = SMSMessage.objects.filter(
                    gateway_message_id=message_id,
                    gateway=self.config
                )
                
                for message in messages:
                    if status == 'DELIVRD':  # SMPP delivery report status
                        message.mark_as_delivered({
                            'webhook_data': data,
                            'smpp_status': status,
                            'error_code': error_code,
                            'webhook_timestamp': timezone.now().isoformat()
                        })
                    elif status in ['UNDELIV', 'EXPIRED', 'DELETED', 'REJECTD']:
                        error_msg = f"SMPP delivery failed: {status}"
                        if error_code:
                            error_msg += f" (error: {error_code})"
                        
                        message.mark_as_failed(
                            error_msg,
                            {'webhook_data': data}
                        )
                    
                    updates.append({
                        'message_id': str(message.id),
                        'status': message.status,
                        'smpp_status': status,
                        'error_code': error_code
                    })
            
            return updates
            
        except Exception as e:
            logger.error(f"Failed to process SMPP webhook: {str(e)}")
            return []
    
    def disconnect(self):
        """Disconnect from SMPP server"""
        try:
            if self.client:
                # In production: self.client.unbind()
                # self.client.disconnect()
                pass
            
            self._is_connected = False
            logger.info("SMPP disconnected")
            
        except Exception as e:
            logger.error(f"Error disconnecting SMPP: {str(e)}")
    
    def __del__(self):
        """Cleanup on destruction"""
        try:
            self.disconnect()
        except:
            pass