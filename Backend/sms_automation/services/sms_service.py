"""
SMS Automation Services - Production Ready
Main service orchestrator for SMS operations
"""
import logging
import requests
import time
import hashlib
import json
from django.conf import settings
from django.utils import timezone
from django.db import transaction, models
from django.core.cache import cache
from datetime import datetime, timedelta
import threading
import queue
from concurrent.futures import ThreadPoolExecutor, as_completed

from sms_automation.models.sms_automation_model import (
    SMSGatewayConfig, SMSMessage, SMSDeliveryLog, SMSTemplate,
    SMSQueue, SMSAutomationRule, SMSAnalytics
)
from user_management.models.client_model import ClientProfile
from sms_automation.gateways.africastalking import AfricaTalkingGateway
from sms_automation.gateways.twilio import TwilioGateway
from sms_automation.gateways.custom import CustomGateway
from sms_automation.gateways.smpp import SMPPGateway


logger = logging.getLogger(__name__)


class SMSService:
    """Main SMS service orchestrator"""
    
    def __init__(self):
        self.gateways = {}
        self.load_gateways()
        self.executor = ThreadPoolExecutor(max_workers=10)
        self._lock = threading.Lock()
    
    def load_gateways(self):
        """Load configured gateways"""
        try:
            with self._lock:
                self.gateways = {}
                gateway_configs = SMSGatewayConfig.objects.filter(is_active=True)
                
                for config in gateway_configs:
                    gateway = self._create_gateway_instance(config)
                    if gateway:
                        self.gateways[config.id] = gateway
                        logger.info(f"Loaded gateway: {config.name} ({config.gateway_type})")
                
                # Cache gateways
                cache.set('sms_gateways', list(self.gateways.keys()), timeout=300)
                
        except Exception as e:
            logger.error(f"Failed to load gateways: {str(e)}")
    
    def _create_gateway_instance(self, config):
        """Create gateway instance based on type"""
        try:
            if config.gateway_type == 'africas_talking':
                return AfricaTalkingGateway(config)
            elif config.gateway_type == 'twilio':
                return TwilioGateway(config)
            elif config.gateway_type == 'smpp':
                return SMPPGateway(config)
            elif config.gateway_type == 'custom':
                return CustomGateway(config)
            else:
                logger.error(f"Unknown gateway type: {config.gateway_type}")
                return None
        except Exception as e:
            logger.error(f"Failed to create gateway instance {config.name}: {str(e)}")
            return None
    
    def get_default_gateway(self):
        """Get default gateway"""
        try:
            # Try to get from cache first
            default_gateway = cache.get('default_sms_gateway')
            if default_gateway and default_gateway.id in self.gateways:
                return self.gateways[default_gateway.id]
            
            # Get from database
            default_config = SMSGatewayConfig.objects.filter(
                is_default=True,
                is_active=True,
                is_online=True,
                balance__gt=0
            ).first()
            
            if default_config and default_config.id in self.gateways:
                cache.set('default_sms_gateway', default_config, timeout=300)
                return self.gateways[default_config.id]
            
            # Fallback to first available gateway
            for gateway in self.gateways.values():
                if gateway.config.is_online and gateway.config.balance > 0:
                    return gateway
            
            return None
            
        except Exception as e:
            logger.error(f"Failed to get default gateway: {str(e)}")
            return None
    
    def get_best_gateway(self, priority='normal'):
        """Get best available gateway based on priority and availability"""
        try:
            # Get all available gateways
            available_gateways = []
            for gateway in self.gateways.values():
                if (gateway.config.is_active and 
                    gateway.config.is_online and 
                    gateway.config.balance > 0 and
                    gateway.config.success_rate >= 80):
                    
                    available_gateways.append(gateway)
            
            if not available_gateways:
                return None
            
            # Sort by weight, success rate, and balance
            if priority in ['high', 'urgent']:
                # For high priority, prefer high success rate
                available_gateways.sort(
                    key=lambda g: (
                        g.config.weight,
                        g.config.success_rate,
                        g.config.balance
                    ),
                    reverse=True
                )
            else:
                # For normal priority, consider rate limits
                available_gateways.sort(
                    key=lambda g: (
                        g.config.weight,
                        self._get_gateway_capacity(g),
                        g.config.success_rate
                    ),
                    reverse=True
                )
            
            return available_gateways[0]
            
        except Exception as e:
            logger.error(f"Failed to get best gateway: {str(e)}")
            return self.get_default_gateway()
    
    def _get_gateway_capacity(self, gateway):
        """Calculate gateway capacity for today"""
        today = timezone.now().date()
        messages_today = SMSMessage.objects.filter(
            gateway=gateway.config,
            created_at__date=today
        ).count()
        
        return gateway.config.max_messages_per_day - messages_today
    
    def create_sms_message(self, **kwargs):
        """Create a new SMS message"""
        try:
            with transaction.atomic():
                # Get gateway if not specified
                if 'gateway' not in kwargs:
                    priority = kwargs.get('priority', 'normal')
                    gateway = self.get_best_gateway(priority)
                    if gateway:
                        kwargs['gateway'] = gateway.config
                
                # Create message
                message = SMSMessage.objects.create(**kwargs)
                
                # Create queue entry if not scheduled
                if not message.scheduled_for or message.scheduled_for <= timezone.now():
                    self.queue_message(message)
                
                logger.info(f"Created SMS message {message.id} for {message.phone_number}")
                return message
                
        except Exception as e:
            logger.error(f"Failed to create SMS message: {str(e)}")
            raise
    
    def queue_message(self, message):
        """Add message to processing queue"""
        try:
            # Calculate priority score
            priority_score = self._calculate_priority_score(message)
            
            # Create queue entry
            queue_entry, created = SMSQueue.objects.get_or_create(
                message=message,
                defaults={
                    'priority': priority_score,
                    'queue_position': self._get_next_queue_position()
                }
            )
            
            if created:
                logger.info(f"Queued SMS {message.id} with priority {priority_score}")
            else:
                queue_entry.priority = priority_score
                queue_entry.status = 'pending'
                queue_entry.save()
            
            return queue_entry
            
        except Exception as e:
            logger.error(f"Failed to queue message {message.id}: {str(e)}")
            raise
    
    def _calculate_priority_score(self, message):
        """Calculate priority score for queue"""
        score = 0
        
        # Base priority
        priority_map = {
            'low': 1,
            'normal': 10,
            'high': 50,
            'urgent': 100
        }
        score += priority_map.get(message.priority, 10)
        
        # Age bonus (older messages get higher priority)
        age_hours = (timezone.now() - message.created_at).total_seconds() / 3600
        if age_hours > 1:
            score += min(int(age_hours), 20)  # Max 20 points for age
        
        # Retry bonus (retry messages get higher priority)
        if message.retry_count > 0:
            score += message.retry_count * 5
        
        # Template bonus (certain templates get higher priority)
        if message.template and message.template.template_type in [
            'pppoe_credentials', 'payment_reminder', 'system'
        ]:
            score += 10
        
        return min(score, 100)  # Cap at 100
    
    def _get_next_queue_position(self):
        """Get next available queue position"""
        last_position = SMSQueue.objects.aggregate(
            max_position=models.Max('queue_position')
        )['max_position'] or 0
        return last_position + 1
    
    def send_sms(self, sms_message, gateway=None):
        """Send SMS message via gateway"""
        try:
            # Get gateway
            if not gateway:
                gateway = self.get_best_gateway(sms_message.priority)
                if not gateway:
                    raise ValueError("No available gateway")
            
            # Check if message can be sent
            if not sms_message.can_send():
                logger.warning(f"SMS {sms_message.id} cannot be sent")
                return False
            
            # Check gateway rate limits
            if not self._check_gateway_rate_limit(gateway.config):
                logger.warning(f"Gateway {gateway.config.name} rate limit exceeded")
                return False
            
            # Format phone number
            formatted_phone = gateway.format_phone_number(sms_message.phone_number)
            
            # Send SMS
            start_time = time.time()
            result = gateway.send_sms(
                phone_number=formatted_phone,
                message=sms_message.message,
                sender_id=sms_message.gateway.sender_id if sms_message.gateway else None
            )
            response_time_ms = int((time.time() - start_time) * 1000)
            
            # Create delivery log
            SMSDeliveryLog.log_status_change(
                message=sms_message,
                old_status=sms_message.status,
                new_status='sent' if result['success'] else 'failed',
                gateway_data={
                    'response': result.get('response', {}),
                    'status_code': result.get('status_code', ''),
                    'status_message': result.get('message', ''),
                    'transaction_id': result.get('transaction_id', ''),
                    'response_time_ms': response_time_ms,
                    'cost': result.get('cost')
                },
                error={
                    'type': 'gateway_error' if not result['success'] else '',
                    'code': result.get('error_code', ''),
                    'message': result.get('error_message', ''),
                    'details': result.get('error_details', {})
                } if not result['success'] else None
            )
            
            # Update message status
            if result['success']:
                sms_message.mark_as_sent(
                    gateway_message_id=result.get('message_id'),
                    gateway_data=result
                )
                
                # Update gateway stats
                gateway.config.update_performance_metrics(
                    success=True,
                    delivery_time=None  # Will be updated when delivered
                )
                gateway.config.last_used = timezone.now()
                gateway.config.save()
                
                logger.info(f"SMS {sms_message.id} sent successfully via {gateway.config.name}")
                return True
            else:
                error_msg = result.get('error_message', 'Unknown error')
                sms_message.mark_as_failed(
                    error_message=error_msg,
                    gateway_data=result,
                    retry=True
                )
                
                # Update gateway stats
                gateway.config.update_performance_metrics(success=False)
                
                logger.error(f"Failed to send SMS {sms_message.id}: {error_msg}")
                return False
                
        except Exception as e:
            logger.error(f"Error sending SMS {sms_message.id}: {str(e)}")
            sms_message.mark_as_failed(str(e), retry=True)
            return False
    
    def _check_gateway_rate_limit(self, gateway_config):
        """Check if gateway is within rate limits"""
        now = timezone.now()
        
        # Check per-minute limit
        minute_ago = now - timedelta(minutes=1)
        minute_count = SMSMessage.objects.filter(
            gateway=gateway_config,
            sent_at__gte=minute_ago,
            status__in=['sent', 'delivered']
        ).count()
        
        if minute_count >= gateway_config.max_messages_per_minute:
            return False
        
        # Check per-hour limit
        hour_ago = now - timedelta(hours=1)
        hour_count = SMSMessage.objects.filter(
            gateway=gateway_config,
            sent_at__gte=hour_ago,
            status__in=['sent', 'delivered']
        ).count()
        
        if hour_count >= gateway_config.max_messages_per_hour:
            return False
        
        # Check per-day limit
        today = now.date()
        day_count = SMSMessage.objects.filter(
            gateway=gateway_config,
            sent_at__date=today,
            status__in=['sent', 'delivered']
        ).count()
        
        if day_count >= gateway_config.max_messages_per_day:
            return False
        
        return True
    
    def process_queue_batch(self, batch_size=100):
        """Process a batch of queued messages"""
        try:
            # Get pending queue entries
            queue_entries = SMSQueue.objects.filter(
                status='pending',
                processing_attempts__lt=models.F('max_processing_attempts')
            ).select_related('message', 'message__gateway')[:batch_size]
            
            processed = []
            failed = []
            
            for queue_entry in queue_entries:
                try:
                    # Mark as processing
                    queue_entry.mark_as_processing()
                    
                    # Get gateway
                    message = queue_entry.message
                    gateway = None
                    if message.gateway and message.gateway.id in self.gateways:
                        gateway = self.gateways[message.gateway.id]
                    else:
                        gateway = self.get_best_gateway(message.priority)
                    
                    if not gateway:
                        raise ValueError("No available gateway")
                    
                    # Send SMS
                    success = self.send_sms(message, gateway)
                    
                    if success:
                        queue_entry.mark_as_completed()
                        processed.append(str(message.id))
                    else:
                        queue_entry.mark_as_failed(f"Failed to send via {gateway.config.name}")
                        failed.append(str(message.id))
                        
                except Exception as e:
                    logger.error(f"Failed to process queue entry {queue_entry.id}: {str(e)}")
                    queue_entry.mark_as_failed(str(e))
                    failed.append(str(queue_entry.message.id))
            
            return {
                'processed': len(processed),
                'failed': len(failed),
                'total': len(queue_entries),
                'processed_ids': processed,
                'failed_ids': failed
            }
            
        except Exception as e:
            logger.error(f"Failed to process queue batch: {str(e)}")
            return {'processed': 0, 'failed': 0, 'total': 0}
    
    def process_scheduled_messages(self, limit=100):
        """Process scheduled messages that are due"""
        try:
            now = timezone.now()
            
            # Get scheduled messages that are due
            scheduled_messages = SMSMessage.objects.filter(
                status='pending',
                scheduled_for__lte=now,
                scheduled_for__isnull=False
            )[:limit]
            
            processed = 0
            
            for message in scheduled_messages:
                try:
                    # Queue for sending
                    self.queue_message(message)
                    processed += 1
                    logger.info(f"Queued scheduled message {message.id}")
                    
                except Exception as e:
                    logger.error(f"Failed to queue scheduled message {message.id}: {str(e)}")
            
            return {
                'processed': processed,
                'total': len(scheduled_messages)
            }
            
        except Exception as e:
            logger.error(f"Failed to process scheduled messages: {str(e)}")
            return {'processed': 0, 'total': 0}
    
    def process_retry_messages(self, limit=100):
        """Process messages that need retrying"""
        try:
            now = timezone.now()
            
            # Get messages that need retrying
            retry_messages = SMSMessage.objects.filter(
                status='failed',
                retry_count__lt=models.F('max_retries'),
                next_retry_at__lte=now,
                next_retry_at__isnull=False
            )[:limit]
            
            processed = 0
            
            for message in retry_messages:
                try:
                    # Reset status and queue for retry
                    message.status = 'pending'
                    message.save()
                    
                    self.queue_message(message)
                    processed += 1
                    logger.info(f"Queued retry message {message.id}")
                    
                except Exception as e:
                    logger.error(f"Failed to queue retry message {message.id}: {str(e)}")
            
            return {
                'processed': processed,
                'total': len(retry_messages)
            }
            
        except Exception as e:
            logger.error(f"Failed to process retry messages: {str(e)}")
            return {'processed': 0, 'total': 0}
    
    def send_pppoe_credentials(self, phone_number, client_name, pppoe_username, password, **kwargs):
        """Send PPPoE credentials via SMS"""
        try:
            # Get PPPoE template
            template = SMSTemplate.objects.filter(
                template_type='pppoe_credentials',
                is_active=True
            ).first()
            
            # Create context
            context = {
                'client_name': client_name,
                'username': pppoe_username,
                'password': password,
                'phone_number': phone_number,
                'support_contact': kwargs.get('support_contact', settings.DEFAULT_SUPPORT_CONTACT),
                'company_name': kwargs.get('company_name', settings.COMPANY_NAME)
            }
            
            # Render message
            if template:
                message = template.render(context, strict=True)
            else:
                # Default message
                message = f"Hello {client_name}! Your PPPoE credentials: Username: {pppoe_username}, Password: {password}. Use these to connect."
            
            # Create SMS message
            sms_data = {
                'phone_number': phone_number,
                'message': message,
                'recipient_name': client_name,
                'template': template,
                'priority': 'high',
                'source': 'pppoe_credentials',
                'reference_id': f"pppoe_{pppoe_username}",
                'context_data': context,
                'metadata': {
                    'type': 'pppoe_credentials',
                    'username': pppoe_username,
                    'client_name': client_name
                }
            }
            
            # Add optional parameters
            if 'client_id' in kwargs:
                try:
                    client = ClientProfile.objects.get(id=kwargs['client_id'])
                    sms_data['client'] = client
                except ClientProfile.DoesNotExist:
                    pass
            
            if 'gateway_id' in kwargs:
                try:
                    gateway = SMSGatewayConfig.objects.get(id=kwargs['gateway_id'])
                    sms_data['gateway'] = gateway
                except SMSGatewayConfig.DoesNotExist:
                    pass
            
            if 'user' in kwargs:
                sms_data['created_by'] = kwargs['user']
            
            # Create and send
            sms = self.create_sms_message(**sms_data)
            
            # Send immediately
            if not sms.scheduled_for:
                gateway = self.get_best_gateway('high')
                if gateway:
                    self.send_sms(sms, gateway)
            
            return sms
            
        except Exception as e:
            logger.error(f"Failed to send PPPoE credentials: {str(e)}")
            raise
    
    def test_gateway_connection(self, gateway_config):
        """Test gateway connection and get balance"""
        try:
            gateway = self._create_gateway_instance(gateway_config)
            if not gateway:
                return {'success': False, 'error': 'Failed to create gateway instance'}
            
            # Test connection by getting balance
            balance = gateway.get_balance()
            
            return {
                'success': True,
                'balance': balance,
                'gateway_type': gateway_config.gateway_type,
                'timestamp': timezone.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Gateway connection test failed: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def get_gateway_status(self, gateway_config):
        """Get gateway status with detailed information"""
        try:
            gateway = self._create_gateway_instance(gateway_config)
            if not gateway:
                return {'status': 'error', 'message': 'Gateway not initialized'}
            
            # Get status from gateway
            status = gateway.get_status()
            
            # Add additional metrics
            today = timezone.now().date()
            today_messages = SMSMessage.objects.filter(
                gateway=gateway_config,
                created_at__date=today
            )
            
            status.update({
                'messages_today': today_messages.count(),
                'success_rate_today': self._calculate_success_rate(today_messages),
                'estimated_capacity': gateway_config.max_messages_per_day - today_messages.count(),
                'last_message': gateway_config.last_used.isoformat() if gateway_config.last_used else None
            })
            
            return status
            
        except Exception as e:
            logger.error(f"Failed to get gateway status: {str(e)}")
            return {'status': 'error', 'message': str(e)}
    
    def _calculate_success_rate(self, queryset):
        """Calculate success rate from queryset"""
        if not queryset.exists():
            return 0
        
        successful = queryset.filter(status__in=['sent', 'delivered']).count()
        return (successful / queryset.count()) * 100
    
    def execute_automation_rule(self, rule, context, client=None, trigger_event='system'):
        """Execute automation rule"""
        try:
            return rule.execute(context, client, trigger_event)
        except Exception as e:
            logger.error(f"Failed to execute automation rule {rule.id}: {str(e)}")
            return None
    
    def process_webhook(self, gateway_type, data, headers):
        """Process incoming webhook from gateway"""
        try:
            # Find gateway
            gateway_config = SMSGatewayConfig.objects.filter(
                gateway_type=gateway_type,
                is_active=True
            ).first()
            
            if not gateway_config:
                return {'success': False, 'error': 'Gateway not found'}
            
            # Create gateway instance
            gateway = self._create_gateway_instance(gateway_config)
            if not gateway:
                return {'success': False, 'error': 'Failed to create gateway'}
            
            # Process webhook
            updates = gateway.process_webhook(data, headers)
            
            return {
                'success': True,
                'updates': updates
            }
            
        except Exception as e:
            logger.error(f"Failed to process webhook: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def retry_message(self, message):
        """Retry sending a failed message"""
        try:
            # Reset message for retry
            message.status = 'pending'
            message.retry_count += 1
            
            # Calculate next retry time
            if message.retry_count < message.max_retries:
                backoff = min(3600, (2 ** message.retry_count) * 300)
                message.next_retry_at = timezone.now() + timedelta(seconds=backoff)
            
            message.save()
            
            # Queue for sending
            self.queue_message(message)
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to retry message {message.id}: {str(e)}")
            return False
    
    def cancel_message(self, message):
        """Cancel a scheduled message"""
        try:
            if message.status not in ['pending', 'scheduled']:
                return False
            
            # Cancel message
            message.status = 'cancelled'
            message.save()
            
            # Remove from queue if exists
            SMSQueue.objects.filter(message=message).delete()
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to cancel message {message.id}: {str(e)}")
            return False
    
    def create_test_message(self, phone_number, message, **kwargs):
        """Create a test SMS message"""
        try:
            gateway = None
            if 'gateway_id' in kwargs:
                try:
                    gateway_config = SMSGatewayConfig.objects.get(
                        id=kwargs['gateway_id'],
                        is_active=True
                    )
                    gateway = self._create_gateway_instance(gateway_config)
                except SMSGatewayConfig.DoesNotExist:
                    pass
            
            if not gateway:
                gateway = self.get_default_gateway()
            
            message_data = {
                'phone_number': phone_number,
                'message': message,
                'recipient_name': kwargs.get('recipient_name', 'Test Recipient'),
                'source': 'test',
                'reference_id': f"test_{timezone.now().timestamp()}",
                'metadata': {
                    'test': True,
                    'sender_id': kwargs.get('sender_id')
                }
            }
            
            if gateway:
                message_data['gateway'] = gateway.config
            
            if 'user' in kwargs:
                message_data['created_by'] = kwargs['user']
            
            return self.create_sms_message(**message_data)
            
        except Exception as e:
            logger.error(f"Failed to create test message: {str(e)}")
            raise