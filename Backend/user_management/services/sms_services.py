# """
# SMS Automation Services
# Handles SMS sending and gateway integration
# """
# import logging
# import time
# import requests
# from django.conf import settings
# from django.db import models
# from django.utils import timezone
# from datetime import timedelta
# from typing import Optional, Dict, Any, List

# from user_management.models.sms_automation_model import (
#     SMSGatewayConfig,
#     SMSMessage,
#     SMSDeliveryLog,
#     SMSTemplate
# )

# logger = logging.getLogger(__name__)


# class BaseSMSGateway:
#     """Base class for SMS gateways"""
    
#     def __init__(self, config: SMSGatewayConfig):
#         self.config = config
#         self.name = config.name
#         self.gateway_type = config.gateway_type
    
#     def send_sms(self, phone_number: str, message: str, sender_id: str = None) -> Dict[str, Any]:
#         """
#         Send SMS via gateway
#         Returns: {'success': bool, 'message_id': str, 'response': dict, 'error': str}
#         """
#         raise NotImplementedError("Subclasses must implement send_sms")
    
#     def get_balance(self) -> float:
#         """Get account balance"""
#         raise NotImplementedError("Subclasses must implement get_balance")
    
#     def validate_phone_number(self, phone_number: str) -> bool:
#         """Validate phone number format"""
#         # Basic validation - can be extended per gateway
#         if not phone_number:
#             return False
        
#         # Remove non-digits
#         cleaned = ''.join(filter(str.isdigit, phone_number))
        
#         # Kenyan phone numbers: 12 digits with 254, 10 digits with 0
#         if cleaned.startswith('254') and len(cleaned) == 12:
#             return True
#         elif cleaned.startswith('0') and len(cleaned) == 10:
#             return True
#         elif len(cleaned) == 9:  # 712345678
#             return True
        
#         return False
    
#     def format_phone_number(self, phone_number: str) -> str:
#         """Format phone number for gateway"""
#         cleaned = ''.join(filter(str.isdigit, phone_number))
        
#         if cleaned.startswith('0') and len(cleaned) == 10:
#             # Convert 0712345678 to 254712345678
#             return f"254{cleaned[1:]}"
#         elif len(cleaned) == 9:
#             # Convert 712345678 to 254712345678
#             return f"254{cleaned}"
#         elif cleaned.startswith('254') and len(cleaned) == 12:
#             return cleaned
        
#         return phone_number


# class AfricasTalkingGateway(BaseSMSGateway):
#     """Africa's Talking SMS Gateway"""
    
#     def __init__(self, config: SMSGatewayConfig):
#         super().__init__(config)
#         import africastalking
        
#         # Initialize Africa's Talking
#         africastalking.initialize(
#             username=config.api_key or settings.AFRICAS_TALKING_USERNAME,
#             api_key=config.api_secret or settings.AFRICAS_TALKING_API_KEY
#         )
#         self.sms = africastalking.SMS
    
#     def send_sms(self, phone_number: str, message: str, sender_id: str = None) -> Dict[str, Any]:
#         try:
#             # Format phone number
#             formatted_number = self.format_phone_number(phone_number)
            
#             # Prepare parameters
#             params = {
#                 'message': message,
#                 'recipients': [formatted_number],
#                 'from_': sender_id or self.config.sender_id or settings.DEFAULT_SENDER_ID
#             }
            
#             # Send SMS
#             response = self.sms.send(**params)
            
#             # Parse response
#             recipients = response.get('SMSMessageData', {}).get('Recipients', [])
#             if recipients:
#                 recipient = recipients[0]
#                 success = recipient.get('statusCode') == 101
#                 message_id = recipient.get('messageId')
                
#                 return {
#                     'success': success,
#                     'message_id': message_id,
#                     'response': response,
#                     'error': None if success else recipient.get('status')
#                 }
            
#             return {
#                 'success': False,
#                 'message_id': None,
#                 'response': response,
#                 'error': 'No recipients in response'
#             }
            
#         except Exception as e:
#             logger.error(f"Africa's Talking error for {phone_number}: {str(e)}")
#             return {
#                 'success': False,
#                 'message_id': None,
#                 'response': None,
#                 'error': str(e)
#             }
    
#     def get_balance(self) -> float:
#         try:
#             import africastalking
#             # Africa's Talking doesn't have a direct balance API in free tier
#             # You would need to implement based on your account type
#             return 0.0
#         except Exception as e:
#             logger.error(f"Failed to get balance from Africa's Talking: {str(e)}")
#             return 0.0


# class TwilioGateway(BaseSMSGateway):
#     """Twilio SMS Gateway"""
    
#     def send_sms(self, phone_number: str, message: str, sender_id: str = None) -> Dict[str, Any]:
#         try:
#             import twilio
#             from twilio.rest import Client
            
#             # Initialize Twilio client
#             client = Client(
#                 self.config.api_key or settings.TWILIO_ACCOUNT_SID,
#                 self.config.api_secret or settings.TWILIO_AUTH_TOKEN
#             )
            
#             # Format phone number
#             formatted_number = self.format_phone_number(phone_number)
            
#             # Send SMS
#             message_obj = client.messages.create(
#                 body=message,
#                 from_=sender_id or self.config.sender_id or settings.TWILIO_PHONE_NUMBER,
#                 to=formatted_number
#             )
            
#             return {
#                 'success': True,
#                 'message_id': message_obj.sid,
#                 'response': {
#                     'sid': message_obj.sid,
#                     'status': message_obj.status,
#                     'price': message_obj.price,
#                     'price_unit': message_obj.price_unit
#                 },
#                 'error': None
#             }
            
#         except Exception as e:
#             logger.error(f"Twilio error for {phone_number}: {str(e)}")
#             return {
#                 'success': False,
#                 'message_id': None,
#                 'response': None,
#                 'error': str(e)
#             }
    
#     def get_balance(self) -> float:
#         try:
#             import twilio
#             from twilio.rest import Client
            
#             client = Client(
#                 self.config.api_key or settings.TWILIO_ACCOUNT_SID,
#                 self.config.api_secret or settings.TWILIO_AUTH_TOKEN
#             )
            
#             # Get balance (Twilio doesn't have direct balance API)
#             # You might need to use the usage API
#             return 0.0
            
#         except Exception as e:
#             logger.error(f"Failed to get balance from Twilio: {str(e)}")
#             return 0.0


# class CustomAPIGateway(BaseSMSGateway):
#     """Custom API SMS Gateway"""
    
#     def send_sms(self, phone_number: str, message: str, sender_id: str = None) -> Dict[str, Any]:
#         try:
#             # Prepare request
#             headers = {
#                 'Content-Type': 'application/json',
#                 'Authorization': f"Bearer {self.config.api_secret}"
#             }
            
#             payload = {
#                 'phone': phone_number,
#                 'message': message,
#                 'sender_id': sender_id or self.config.sender_id
#             }
            
#             # Make request
#             response = requests.post(
#                 self.config.api_url,
#                 json=payload,
#                 headers=headers,
#                 timeout=30
#             )
            
#             if response.status_code == 200:
#                 data = response.json()
#                 return {
#                     'success': data.get('success', False),
#                     'message_id': data.get('message_id'),
#                     'response': data,
#                     'error': data.get('error')
#                 }
#             else:
#                 return {
#                     'success': False,
#                     'message_id': None,
#                     'response': response.text,
#                     'error': f"HTTP {response.status_code}"
#                 }
                
#         except Exception as e:
#             logger.error(f"Custom API error for {phone_number}: {str(e)}")
#             return {
#                 'success': False,
#                 'message_id': None,
#                 'response': None,
#                 'error': str(e)
#             }
    
#     def get_balance(self) -> float:
#         try:
#             headers = {
#                 'Authorization': f"Bearer {self.config.api_secret}"
#             }
            
#             response = requests.get(
#                 f"{self.config.api_url}/balance",
#                 headers=headers,
#                 timeout=10
#             )
            
#             if response.status_code == 200:
#                 data = response.json()
#                 return float(data.get('balance', 0))
#             return 0.0
            
#         except Exception as e:
#             logger.error(f"Failed to get balance from custom API: {str(e)}")
#             return 0.0


# class SMSService:
#     """Main SMS service that handles all SMS operations"""
    
#     def __init__(self):
#         self.gateways = {}
#         self._load_gateways()
    
#     def _load_gateways(self):
#         """Load configured gateways"""
#         try:
#             gateways = SMSGatewayConfig.objects.filter(is_active=True)
#             for gateway in gateways:
#                 if gateway.gateway_type == 'africas_talking':
#                     self.gateways[gateway.id] = AfricasTalkingGateway(gateway)
#                 elif gateway.gateway_type == 'twilio':
#                     self.gateways[gateway.id] = TwilioGateway(gateway)
#                 elif gateway.gateway_type == 'custom':
#                     self.gateways[gateway.id] = CustomAPIGateway(gateway)
#                 # Add more gateway types as needed
            
#             logger.info(f"Loaded {len(self.gateways)} SMS gateways")
#         except Exception as e:
#             logger.error(f"Failed to load gateways: {str(e)}")
    
#     def get_default_gateway(self) -> Optional[BaseSMSGateway]:
#         """Get default gateway"""
#         try:
#             default_config = SMSGatewayConfig.objects.filter(
#                 is_default=True,
#                 is_active=True
#             ).first()
            
#             if default_config and default_config.id in self.gateways:
#                 return self.gateways[default_config.id]
            
#             # Fallback to first active gateway
#             for gateway in self.gateways.values():
#                 return gateway
            
#             return None
#         except Exception as e:
#             logger.error(f"Failed to get default gateway: {str(e)}")
#             return None
    
#     def create_sms_message(
#         self,
#         phone_number: str,
#         message: str,
#         recipient_name: str = '',
#         template: SMSTemplate = None,
#         priority: str = 'normal',
#         scheduled_for: timezone.datetime = None,
#         source: str = 'system',
#         reference_id: str = '',
#         metadata: Dict = None
#     ) -> SMSMessage:
#         """Create a new SMS message"""
#         try:
#             # Get default gateway
#             default_config = SMSGatewayConfig.objects.filter(
#                 is_default=True,
#                 is_active=True
#             ).first()
            
#             if not default_config:
#                 # Get any active gateway
#                 default_config = SMSGatewayConfig.objects.filter(
#                     is_active=True
#                 ).first()
            
#             if not default_config:
#                 raise ValueError("No active SMS gateway configured")
            
#             # Create SMS message
#             sms = SMSMessage.objects.create(
#                 phone_number=phone_number,
#                 recipient_name=recipient_name,
#                 template=template,
#                 message=message,
#                 original_message=message if template else '',
#                 gateway=default_config,
#                 priority=priority,
#                 scheduled_for=scheduled_for,
#                 source=source,
#                 reference_id=reference_id,
#                 metadata=metadata or {}
#             )
            
#             logger.info(f"Created SMS message {sms.id} for {phone_number}")
#             return sms
            
#         except Exception as e:
#             logger.error(f"Failed to create SMS message: {str(e)}")
#             raise
    
#     def send_sms(self, sms: SMSMessage) -> bool:
#         """Send an SMS message"""
#         try:
#             # Check if message can be sent
#             if not sms.can_send():
#                 logger.warning(f"SMS {sms.id} cannot be sent (status: {sms.status})")
#                 return False
            
#             # Get gateway
#             if not sms.gateway or sms.gateway.id not in self.gateways:
#                 logger.error(f"No gateway configured for SMS {sms.id}")
#                 sms.mark_as_failed("No gateway configured")
#                 return False
            
#             gateway = self.gateways[sms.gateway.id]
            
#             # Validate phone number
#             if not gateway.validate_phone_number(sms.phone_number):
#                 logger.error(f"Invalid phone number: {sms.phone_number}")
#                 sms.mark_as_failed("Invalid phone number")
#                 return False
            
#             # Send SMS
#             result = gateway.send_sms(
#                 phone_number=sms.phone_number,
#                 message=sms.message,
#                 sender_id=sms.gateway.sender_id
#             )
            
#             # Log delivery attempt
#             SMSDeliveryLog.objects.create(
#                 message=sms,
#                 old_status=sms.status,
#                 new_status='sent' if result['success'] else 'failed',
#                 gateway_response=result.get('response', {}),
#                 error_message=result.get('error', '')
#             )
            
#             # Update SMS status
#             if result['success']:
#                 sms.mark_as_sent(result['message_id'])
                
#                 # Update gateway last used
#                 sms.gateway.last_used = timezone.now()
#                 sms.gateway.save(update_fields=['last_used'])
                
#                 logger.info(f"SMS {sms.id} sent successfully to {sms.phone_number}")
#                 return True
#             else:
#                 sms.mark_as_failed(result.get('error', 'Unknown error'))
#                 logger.error(f"Failed to send SMS {sms.id}: {result.get('error')}")
#                 return False
                
#         except Exception as e:
#             logger.error(f"Error sending SMS {sms.id}: {str(e)}")
#             sms.mark_as_failed(str(e))
#             return False
    
#     def send_pppoe_credentials(
#         self,
#         phone_number: str,
#         client_name: str,
#         pppoe_username: str,
#         password: str,
#         reference_id: str = ''
#     ) -> SMSMessage:
#         """Send PPPoE credentials via SMS"""
#         try:
#             # Get PPPoE credentials template
#             template = SMSTemplate.objects.filter(
#                 template_type='pppoe_credentials',
#                 is_active=True
#             ).first()
            
#             if template:
#                 # Render template
#                 context = {
#                     'client_name': client_name,
#                     'username': pppoe_username,
#                     'password': password,
#                     'phone': phone_number
#                 }
#                 message = template.render(context)
#             else:
#                 # Default message
#                 message = (
#                     f"Hello {client_name}!\n"
#                     f"Your PPPoE credentials:\n"
#                     f"Username: {pppoe_username}\n"
#                     f"Password: {password}\n"
#                     f"Use these to connect to the internet."
#                 )
            
#             # Create and send SMS
#             sms = self.create_sms_message(
#                 phone_number=phone_number,
#                 message=message,
#                 recipient_name=client_name,
#                 template=template,
#                 priority='high',
#                 source='pppoe_creation',
#                 reference_id=reference_id,
#                 metadata={
#                     'type': 'pppoe_credentials',
#                     'username': pppoe_username,
#                     'client_name': client_name
#                 }
#             )
            
#             # Send immediately
#             self.send_sms(sms)
            
#             return sms
            
#         except Exception as e:
#             logger.error(f"Failed to send PPPoE credentials: {str(e)}")
#             raise
    
#     def process_pending_messages(self, limit: int = 100) -> Dict[str, int]:
#         """Process pending SMS messages"""
#         try:
#             now = timezone.now()
            
#             # Get pending messages that are ready to send
#             pending_messages = SMSMessage.objects.filter(
#                 status='pending',
#                 scheduled_for__lte=now
#             ).order_by('priority', 'created_at')[:limit]
            
#             results = {
#                 'total': len(pending_messages),
#                 'sent': 0,
#                 'failed': 0,
#                 'skipped': 0
#             }
            
#             for sms in pending_messages:
#                 try:
#                     success = self.send_sms(sms)
#                     if success:
#                         results['sent'] += 1
#                     else:
#                         results['failed'] += 1
#                 except Exception as e:
#                     logger.error(f"Error processing SMS {sms.id}: {str(e)}")
#                     results['failed'] += 1
            
#             logger.info(f"Processed {results['total']} SMS messages: "
#                        f"{results['sent']} sent, {results['failed']} failed")
            
#             return results
            
#         except Exception as e:
#             logger.error(f"Error processing pending messages: {str(e)}")
#             return {'total': 0, 'sent': 0, 'failed': 0, 'skipped': 0}
    
#     def retry_failed_messages(self, limit: int = 50) -> Dict[str, int]:
#         """Retry failed messages that can be retried"""
#         try:
#             now = timezone.now()
            
#             # Get failed messages that can be retried
#             failed_messages = SMSMessage.objects.filter(
#                 status='failed',
#                 retry_count__lt=models.F('max_retries'),
#                 next_retry_at__lte=now
#             ).order_by('created_at')[:limit]
            
#             results = {
#                 'total': len(failed_messages),
#                 'retried': 0,
#                 'successful': 0,
#                 'failed': 0
#             }
            
#             for sms in failed_messages:
#                 try:
#                     # Reset status to pending for retry
#                     sms.status = 'pending'
#                     sms.save(update_fields=['status', 'updated_at'])
                    
#                     # Try to send again
#                     success = self.send_sms(sms)
                    
#                     results['retried'] += 1
#                     if success:
#                         results['successful'] += 1
#                     else:
#                         results['failed'] += 1
                        
#                 except Exception as e:
#                     logger.error(f"Error retrying SMS {sms.id}: {str(e)}")
#                     results['failed'] += 1
            
#             logger.info(f"Retried {results['total']} failed SMS messages")
            
#             return results
            
#         except Exception as e:
#             logger.error(f"Error retrying failed messages: {str(e)}")
#             return {'total': 0, 'retried': 0, 'successful': 0, 'failed': 0}




"""
SMS Automation Services - Integrated with User Management
Handles SMS sending and gateway integration
"""
import logging
import requests
from django.conf import settings
from django.utils import timezone

from user_management.models.sms_automation_model import (
    SMSGatewayConfig, SMSMessage, SMSDeliveryLog, SMSTemplate
)

logger = logging.getLogger(__name__)


class BaseSMSGateway:
    """Base class for SMS gateways"""
    
    def __init__(self, config):
        self.config = config
        self.name = config.name
        self.gateway_type = config.gateway_type
    
    def send_sms(self, phone_number, message, sender_id=None):
        """Send SMS via gateway"""
        raise NotImplementedError("Subclasses must implement send_sms")
    
    def get_balance(self):
        """Get account balance"""
        raise NotImplementedError("Subclasses must implement get_balance")
    
    def format_phone_number(self, phone_number):
        """Format phone number for gateway"""
        # Remove non-digits
        cleaned = ''.join(filter(str.isdigit, phone_number))
        
        if cleaned.startswith('0') and len(cleaned) == 10:
            return f"254{cleaned[1:]}"
        elif len(cleaned) == 9:
            return f"254{cleaned}"
        elif cleaned.startswith('254') and len(cleaned) == 12:
            return cleaned
        
        return phone_number


class AfricasTalkingGateway(BaseSMSGateway):
    """Africa's Talking SMS Gateway"""
    
    def send_sms(self, phone_number, message, sender_id=None):
        try:
            import africastalking
            
            # Initialize
            africastalking.initialize(
                username=self.config.api_key or settings.AFRICAS_TALKING_USERNAME,
                api_key=self.config.api_secret or settings.AFRICAS_TALKING_API_KEY
            )
            sms = africastalking.SMS
            
            # Format phone number
            formatted_number = self.format_phone_number(phone_number)
            
            # Send SMS
            response = sms.send(
                message=message,
                recipients=[formatted_number],
                from_=sender_id or self.config.sender_id or settings.DEFAULT_SENDER_ID
            )
            
            # Parse response
            recipients = response.get('SMSMessageData', {}).get('Recipients', [])
            if recipients:
                recipient = recipients[0]
                success = recipient.get('statusCode') == 101
                message_id = recipient.get('messageId')
                
                return {
                    'success': success,
                    'message_id': message_id,
                    'response': response,
                    'error': None if success else recipient.get('status')
                }
            
            return {
                'success': False,
                'message_id': None,
                'response': response,
                'error': 'No recipients in response'
            }
            
        except Exception as e:
            logger.error(f"Africa's Talking error: {str(e)}")
            return {
                'success': False,
                'message_id': None,
                'response': None,
                'error': str(e)
            }
    
    def get_balance(self):
        # Implementation depends on your Africa's Talking account
        return 0.0


class SMSService:
    """Main SMS service for User Management integration"""
    
    def __init__(self):
        self.gateways = self._load_gateways()
    
    def _load_gateways(self):
        """Load configured gateways"""
        gateways = {}
        try:
            gateway_configs = SMSGatewayConfig.objects.filter(is_active=True)
            
            for config in gateway_configs:
                if config.gateway_type == 'africas_talking':
                    gateways[config.id] = AfricasTalkingGateway(config)
                # Add more gateway types as needed
            
            logger.info(f"Loaded {len(gateways)} SMS gateways")
        except Exception as e:
            logger.error(f"Failed to load gateways: {str(e)}")
        
        return gateways
    
    def get_default_gateway(self):
        """Get default gateway"""
        try:
            default_config = SMSGatewayConfig.objects.filter(
                is_default=True,
                is_active=True
            ).first()
            
            if default_config and default_config.id in self.gateways:
                return self.gateways[default_config.id]
            
            # Fallback to first gateway
            for gateway in self.gateways.values():
                return gateway
            
            return None
        except Exception as e:
            logger.error(f"Failed to get default gateway: {str(e)}")
            return None
    
    def create_sms_message(self, phone_number, message, **kwargs):
        """Create a new SMS message"""
        try:
            # Get default gateway
            default_config = SMSGatewayConfig.objects.filter(
                is_default=True,
                is_active=True
            ).first()
            
            if not default_config:
                default_config = SMSGatewayConfig.objects.filter(is_active=True).first()
            
            if not default_config:
                raise ValueError("No active SMS gateway configured")
            
            # Create SMS message
            sms = SMSMessage.objects.create(
                phone_number=phone_number,
                message=message,
                gateway=default_config,
                **kwargs
            )
            
            logger.info(f"Created SMS message {sms.id} for {phone_number}")
            return sms
            
        except Exception as e:
            logger.error(f"Failed to create SMS message: {str(e)}")
            raise
    
    def send_sms(self, sms):
        """Send an SMS message"""
        try:
            if not sms.can_send():
                logger.warning(f"SMS {sms.id} cannot be sent")
                return False
            
            if not sms.gateway or sms.gateway.id not in self.gateways:
                logger.error(f"No gateway configured for SMS {sms.id}")
                sms.mark_as_failed("No gateway configured")
                return False
            
            gateway = self.gateways[sms.gateway.id]
            
            # Send SMS
            result = gateway.send_sms(
                phone_number=sms.phone_number,
                message=sms.message,
                sender_id=sms.gateway.sender_id
            )
            
            # Log delivery attempt
            SMSDeliveryLog.objects.create(
                message=sms,
                old_status=sms.status,
                new_status='sent' if result['success'] else 'failed',
                gateway_response=result.get('response', {}),
                error_message=result.get('error', '')
            )
            
            # Update SMS status
            if result['success']:
                sms.mark_as_sent(result['message_id'])
                sms.gateway.last_used = timezone.now()
                sms.gateway.save()
                logger.info(f"SMS {sms.id} sent successfully")
                return True
            else:
                sms.mark_as_failed(result.get('error', 'Unknown error'))
                logger.error(f"Failed to send SMS {sms.id}")
                return False
                
        except Exception as e:
            logger.error(f"Error sending SMS {sms.id}: {str(e)}")
            sms.mark_as_failed(str(e))
            return False
    
    def send_pppoe_credentials(self, phone_number, client_name, pppoe_username, password, **kwargs):
        """Send PPPoE credentials via SMS"""
        try:
            # Get PPPoE credentials template
            template = SMSTemplate.objects.filter(
                template_type='pppoe_credentials',
                is_active=True
            ).first()
            
            if template:
                context = {
                    'client_name': client_name,
                    'username': pppoe_username,
                    'password': password,
                    'phone': phone_number
                }
                message = template.render(context)
            else:
                # Default message
                message = (
                    f"Hello {client_name}!\n"
                    f"Your PPPoE credentials:\n"
                    f"Username: {pppoe_username}\n"
                    f"Password: {password}\n"
                    f"Use these to connect to the internet."
                )
            
            # Create and send SMS
            sms = self.create_sms_message(
                phone_number=phone_number,
                message=message,
                recipient_name=client_name,
                template=template,
                priority='high',
                source='pppoe_creation',
                metadata={
                    'type': 'pppoe_credentials',
                    'username': pppoe_username,
                    'client_name': client_name
                },
                **kwargs
            )
            
            # Send immediately
            self.send_sms(sms)
            
            return sms
            
        except Exception as e:
            logger.error(f"Failed to send PPPoE credentials: {str(e)}")
            raise