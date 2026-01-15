"""
SMS Automation WebSocket Consumers
Real-time updates for SMS operations
"""
import json
import logging
from django.db import models
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone
from datetime import timedelta

logger = logging.getLogger(__name__)


class SMSStatusConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for real-time SMS status updates"""
    
    async def connect(self):
        """Handle WebSocket connection"""
        self.user = self.scope['user']
        self.group_name = f'sms_status_{self.user.id}'
        
        if not self.user.is_authenticated:
            await self.close()
            return
        
        # Join user group
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        
        await self.accept()
        logger.info(f"User {self.user.id} connected to SMS status WebSocket")
        
        # Send initial status
        await self.send_initial_status()
    
    async def disconnect(self, close_code):
        """Handle WebSocket disconnection"""
        if hasattr(self, 'group_name') and self.user.is_authenticated:
            await self.channel_layer.group_discard(
                self.group_name,
                self.channel_name
            )
        logger.info(f"User {self.user.id} disconnected from SMS status WebSocket")
    
    async def receive(self, text_data):
        """Handle incoming WebSocket messages"""
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            if message_type == 'subscribe_message':
                # Subscribe to specific message updates
                message_id = data.get('message_id')
                if message_id:
                    await self.subscribe_to_message(message_id)
            
            elif message_type == 'unsubscribe_message':
                # Unsubscribe from message updates
                message_id = data.get('message_id')
                if message_id:
                    await self.unsubscribe_from_message(message_id)
            
            elif message_type == 'get_queue_status':
                # Get current queue status
                await self.send_queue_status()
            
            elif message_type == 'get_gateway_status':
                # Get gateway status
                await self.send_gateway_status()
            
        except json.JSONDecodeError:
            await self.send_error("Invalid JSON")
        except Exception as e:
            logger.error(f"WebSocket receive error: {str(e)}")
            await self.send_error(str(e))
    
    async def send_initial_status(self):
        """Send initial status to client"""
        try:
            # Get dashboard data
            dashboard_data = await self.get_dashboard_data()
            
            await self.send(text_data=json.dumps({
                'type': 'initial_status',
                'data': dashboard_data,
                'timestamp': timezone.now().isoformat()
            }))
            
        except Exception as e:
            logger.error(f"Failed to send initial status: {str(e)}")
    
    async def subscribe_to_message(self, message_id):
        """Subscribe to updates for specific message"""
        try:
            # Check if message exists and user has permission
            message = await self.get_message(message_id)
            if not message:
                await self.send_error(f"Message {message_id} not found")
                return
            
            # Join message group
            message_group = f'message_{message_id}'
            await self.channel_layer.group_add(
                message_group,
                self.channel_name
            )
            
            # Send current message status
            await self.send(text_data=json.dumps({
                'type': 'message_subscribed',
                'message_id': message_id,
                'status': message.status,
                'timestamp': timezone.now().isoformat()
            }))
            
        except Exception as e:
            logger.error(f"Failed to subscribe to message: {str(e)}")
            await self.send_error(str(e))
    
    async def unsubscribe_from_message(self, message_id):
        """Unsubscribe from message updates"""
        try:
            message_group = f'message_{message_id}'
            await self.channel_layer.group_discard(
                message_group,
                self.channel_name
            )
            
            await self.send(text_data=json.dumps({
                'type': 'message_unsubscribed',
                'message_id': message_id,
                'timestamp': timezone.now().isoformat()
            }))
            
        except Exception as e:
            logger.error(f"Failed to unsubscribe from message: {str(e)}")
    
    async def send_queue_status(self):
        """Send current queue status"""
        try:
            queue_data = await self.get_queue_data()
            
            await self.send(text_data=json.dumps({
                'type': 'queue_status',
                'data': queue_data,
                'timestamp': timezone.now().isoformat()
            }))
            
        except Exception as e:
            logger.error(f"Failed to send queue status: {str(e)}")
    
    async def send_gateway_status(self):
        """Send gateway status"""
        try:
            gateway_data = await self.get_gateway_data()
            
            await self.send(text_data=json.dumps({
                'type': 'gateway_status',
                'data': gateway_data,
                'timestamp': timezone.now().isoformat()
            }))
            
        except Exception as e:
            logger.error(f"Failed to send gateway status: {str(e)}")
    
    async def sms_status_update(self, event):
        """Handle SMS status update broadcast"""
        try:
            await self.send(text_data=json.dumps({
                'type': 'status_update',
                'message_id': event['message_id'],
                'status': event['status'],
                'old_status': event.get('old_status'),
                'timestamp': event.get('timestamp'),
                'message': event.get('message', '')
            }))
        except Exception as e:
            logger.error(f"Failed to send status update: {str(e)}")
    
    async def sms_sent(self, event):
        """Handle SMS sent broadcast"""
        try:
            await self.send(text_data=json.dumps({
                'type': 'sms_sent',
                'message_id': event['message_id'],
                'gateway': event.get('gateway'),
                'timestamp': event.get('timestamp')
            }))
        except Exception as e:
            logger.error(f"Failed to send SMS sent notification: {str(e)}")
    
    async def sms_delivered(self, event):
        """Handle SMS delivered broadcast"""
        try:
            await self.send(text_data=json.dumps({
                'type': 'sms_delivered',
                'message_id': event['message_id'],
                'delivery_time': event.get('delivery_time'),
                'timestamp': event.get('timestamp')
            }))
        except Exception as e:
            logger.error(f"Failed to send SMS delivered notification: {str(e)}")
    
    async def sms_failed(self, event):
        """Handle SMS failed broadcast"""
        try:
            await self.send(text_data=json.dumps({
                'type': 'sms_failed',
                'message_id': event['message_id'],
                'error': event.get('error'),
                'retry_count': event.get('retry_count'),
                'timestamp': event.get('timestamp')
            }))
        except Exception as e:
            logger.error(f"Failed to send SMS failed notification: {str(e)}")
    
    async def queue_update(self, event):
        """Handle queue update broadcast"""
        try:
            await self.send(text_data=json.dumps({
                'type': 'queue_update',
                'total_pending': event.get('total_pending'),
                'total_processing': event.get('total_processing'),
                'processed': event.get('processed'),
                'failed': event.get('failed'),
                'timestamp': event.get('timestamp')
            }))
        except Exception as e:
            logger.error(f"Failed to send queue update: {str(e)}")
    
    async def gateway_update(self, event):
        """Handle gateway update broadcast"""
        try:
            await self.send(text_data=json.dumps({
                'type': 'gateway_update',
                'gateway_id': event.get('gateway_id'),
                'gateway_name': event.get('gateway_name'),
                'status': event.get('status'),
                'balance': event.get('balance'),
                'timestamp': event.get('timestamp')
            }))
        except Exception as e:
            logger.error(f"Failed to send gateway update: {str(e)}")
    
    async def send_error(self, error_message):
        """Send error message to client"""
        await self.send(text_data=json.dumps({
            'type': 'error',
            'message': error_message,
            'timestamp': timezone.now().isoformat()
        }))
    
    @database_sync_to_async
    def get_message(self, message_id):
        """Get message from database"""
        from .models import SMSMessage
        try:
            return SMSMessage.objects.get(id=message_id)
        except SMSMessage.DoesNotExist:
            return None
    
    @database_sync_to_async
    def get_dashboard_data(self):
        """Get dashboard data"""
        from .services import SMSService
        from .models import SMSMessage, SMSQueue, SMSGatewayConfig
        
        today = timezone.now().date()
        
        # Today's statistics
        today_stats = SMSMessage.objects.filter(
            created_at__date=today
        ).aggregate(
            total=models.Count('id'),
            sent=models.Count('id', filter=models.Q(status='sent')),
            delivered=models.Count('id', filter=models.Q(status='delivered')),
            failed=models.Count('id', filter=models.Q(status='failed'))
        )
        
        # Queue statistics
        queue_stats = SMSQueue.objects.aggregate(
            pending=models.Count('id', filter=models.Q(status='pending')),
            processing=models.Count('id', filter=models.Q(status='processing')),
            failed=models.Count('id', filter=models.Q(status='failed'))
        )
        
        # Gateway status
        gateways = SMSGatewayConfig.objects.filter(is_active=True)
        gateway_status = []
        
        for gateway in gateways:
            gateway_status.append({
                'id': gateway.id,
                'name': gateway.name,
                'status': gateway.get_health_status(),
                'balance': float(gateway.balance),
                'is_online': gateway.is_online
            })
        
        return {
            'today': today_stats,
            'queue': queue_stats,
            'gateways': gateway_status,
            'timestamp': timezone.now().isoformat()
        }
    
    @database_sync_to_async
    def get_queue_data(self):
        """Get queue data"""
        from .models import SMSQueue
        
        queue_stats = SMSQueue.objects.aggregate(
            total=models.Count('id'),
            pending=models.Count('id', filter=models.Q(status='pending')),
            processing=models.Count('id', filter=models.Q(status='processing')),
            completed=models.Count('id', filter=models.Q(status='completed')),
            failed=models.Count('id', filter=models.Q(status='failed'))
        )
        
        # Recent queue entries
        recent_entries = SMSQueue.objects.select_related('message').order_by('-queued_at')[:10]
        
        entries = []
        for entry in recent_entries:
            entries.append({
                'id': entry.id,
                'message_id': str(entry.message.id),
                'phone': entry.message.phone_number,
                'priority': entry.priority,
                'status': entry.status,
                'queued_at': entry.queued_at.isoformat() if entry.queued_at else None,
                'processing_time': (entry.processing_ended - entry.processing_started).total_seconds() 
                    if entry.processing_started and entry.processing_ended else None
            })
        
        return {
            'stats': queue_stats,
            'recent_entries': entries,
            'timestamp': timezone.now().isoformat()
        }
    
    @database_sync_to_async
    def get_gateway_data(self):
        """Get gateway data"""
        from .models import SMSGatewayConfig
        from .services import SMSService
        
        sms_service = SMSService()
        gateways = SMSGatewayConfig.objects.filter(is_active=True)
        
        gateway_data = []
        for gateway in gateways:
            status = sms_service.get_gateway_status(gateway)
            
            gateway_data.append({
                'id': gateway.id,
                'name': gateway.name,
                'type': gateway.gateway_type,
                'status': status.get('status', 'unknown'),
                'balance': status.get('balance', 0),
                'is_online': gateway.is_online,
                'success_rate': gateway.success_rate,
                'messages_today': status.get('messages_today', 0),
                'estimated_capacity': status.get('estimated_capacity', 0),
                'last_check': gateway.last_online_check.isoformat() if gateway.last_online_check else None
            })
        
        return {
            'gateways': gateway_data,
            'total': len(gateway_data),
            'online': len([g for g in gateway_data if g['is_online']]),
            'healthy': len([g for g in gateway_data if g['status'] == 'healthy']),
            'timestamp': timezone.now().isoformat()
        }


class SMSBroadcastConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for broadcasting SMS events to all users"""
    
    async def connect(self):
        """Handle WebSocket connection"""
        self.user = self.scope['user']
        
        if not self.user.is_authenticated:
            await self.close()
            return
        
        # Join broadcast group
        await self.channel_layer.group_add(
            'sms_broadcast',
            self.channel_name
        )
        
        await self.accept()
        logger.info(f"User {self.user.id} connected to SMS broadcast")
    
    async def disconnect(self, close_code):
        """Handle WebSocket disconnection"""
        await self.channel_layer.group_discard(
            'sms_broadcast',
            self.channel_name
        )
        logger.info(f"User {self.user.id} disconnected from SMS broadcast")
    
    async def receive(self, text_data):
        """Handle incoming WebSocket messages"""
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            if message_type == 'ping':
                await self.send(text_data=json.dumps({
                    'type': 'pong',
                    'timestamp': timezone.now().isoformat()
                }))
            
        except json.JSONDecodeError:
            await self.send_error("Invalid JSON")
        except Exception as e:
            logger.error(f"Broadcast WebSocket error: {str(e)}")
    
    async def system_alert(self, event):
        """Handle system alert broadcast"""
        try:
            await self.send(text_data=json.dumps({
                'type': 'system_alert',
                'alert_type': event.get('alert_type'),
                'title': event.get('title'),
                'message': event.get('message'),
                'severity': event.get('severity'),
                'timestamp': event.get('timestamp')
            }))
        except Exception as e:
            logger.error(f"Failed to send system alert: {str(e)}")
    
    async def gateway_alert(self, event):
        """Handle gateway alert broadcast"""
        try:
            await self.send(text_data=json.dumps({
                'type': 'gateway_alert',
                'gateway_id': event.get('gateway_id'),
                'gateway_name': event.get('gateway_name'),
                'alert_type': event.get('alert_type'),
                'message': event.get('message'),
                'severity': event.get('severity'),
                'timestamp': event.get('timestamp')
            }))
        except Exception as e:
            logger.error(f"Failed to send gateway alert: {str(e)}")
    
    async def bulk_operation_complete(self, event):
        """Handle bulk operation completion broadcast"""
        try:
            await self.send(text_data=json.dumps({
                'type': 'bulk_operation_complete',
                'operation_id': event.get('operation_id'),
                'operation_type': event.get('operation_type'),
                'total': event.get('total'),
                'successful': event.get('successful'),
                'failed': event.get('failed'),
                'timestamp': event.get('timestamp')
            }))
        except Exception as e:
            logger.error(f"Failed to send bulk operation notification: {str(e)}")
    
    async def automation_rule_executed(self, event):
        """Handle automation rule execution broadcast"""
        try:
            await self.send(text_data=json.dumps({
                'type': 'automation_rule_executed',
                'rule_id': event.get('rule_id'),
                'rule_name': event.get('rule_name'),
                'sms_count': event.get('sms_count'),
                'timestamp': event.get('timestamp')
            }))
        except Exception as e:
            logger.error(f"Failed to send automation rule notification: {str(e)}")
    
    async def send_error(self, error_message):
        """Send error message to client"""
        await self.send(text_data=json.dumps({
            'type': 'error',
            'message': error_message,
            'timestamp': timezone.now().isoformat()
        }))