


# """
# SMS Automation WebSocket Consumers
# Real-time updates for SMS operations
# """
# import json
# import logging
# import asyncio
# from datetime import timedelta
# from channels.generic.websocket import AsyncWebsocketConsumer
# from channels.db import database_sync_to_async
# from django.utils import timezone
# from django.core.cache import cache

# logger = logging.getLogger(__name__)


# class SMSStatusConsumer(AsyncWebsocketConsumer):
#     """WebSocket consumer for real-time SMS status updates"""
    
#     async def connect(self):
#         """Handle WebSocket connection"""
#         self.user = self.scope['user']
        
#         # Check authentication
#         if not self.user or not self.user.is_authenticated:
#             logger.warning(f"Unauthenticated WebSocket connection attempt")
#             await self.close(code=4001)
#             return
        
#         self.group_name = f'sms_status_{self.user.id}'
#         self.message_subscriptions = set()
#         self.gateway_subscriptions = set()
#         self.connection_healthy = True
#         self.ping_interval = 30
#         self.ping_task = None
        
#         try:
#             # Join user group
#             await self.channel_layer.group_add(
#                 self.group_name,
#                 self.channel_name
#             )
            
#             await self.accept()
#             logger.info(f"User {self.user.id} connected to SMS status WebSocket")
            
#             # Start ping task
#             self.ping_task = asyncio.create_task(self._send_ping())
            
#             # Send initial status
#             await self._send_initial_status()
            
#         except Exception as e:
#             logger.error(f"Error in WebSocket connection: {str(e)}")
#             await self.close(code=4002)
    
#     async def disconnect(self, close_code):
#         """Handle WebSocket disconnection"""
#         self.connection_healthy = False
        
#         # Cancel ping task
#         if self.ping_task:
#             self.ping_task.cancel()
#             try:
#                 await self.ping_task
#             except asyncio.CancelledError:
#                 pass
        
#         # Leave user group
#         if hasattr(self, 'group_name') and self.user.is_authenticated:
#             try:
#                 await self.channel_layer.group_discard(
#                     self.group_name,
#                     self.channel_name
#                 )
#             except Exception as e:
#                 logger.error(f"Error leaving group: {str(e)}")
        
#         # Leave message subscriptions
#         for message_id in self.message_subscriptions:
#             try:
#                 message_group = f'message_{message_id}'
#                 await self.channel_layer.group_discard(
#                     message_group,
#                     self.channel_name
#                 )
#             except Exception as e:
#                 logger.error(f"Error leaving message group {message_id}: {str(e)}")
        
#         logger.info(f"User {self.user.id} disconnected from SMS status WebSocket")
    
#     async def _send_ping(self):
#         """Send periodic pings to keep connection alive"""
#         while self.connection_healthy:
#             try:
#                 await asyncio.sleep(self.ping_interval)
#                 if self.connection_healthy:
#                     await self.send(text_data=json.dumps({
#                         'type': 'ping',
#                         'timestamp': timezone.now().isoformat()
#                     }))
#             except asyncio.CancelledError:
#                 break
#             except Exception as e:
#                 logger.error(f"Error sending ping: {str(e)}")
#                 break
    
#     async def _send_initial_status(self):
#         """Send initial status to client"""
#         try:
#             dashboard_data = await self._get_dashboard_data()
            
#             await self.send(text_data=json.dumps({
#                 'type': 'initial_status',
#                 'data': dashboard_data,
#                 'timestamp': timezone.now().isoformat()
#             }))
#         except Exception as e:
#             logger.error(f"Failed to send initial status: {str(e)}")
    
#     async def receive(self, text_data):
#         """Handle incoming WebSocket messages"""
#         try:
#             data = json.loads(text_data)
#             message_type = data.get('type')
            
#             handlers = {
#                 'pong': self._handle_pong,
#                 'subscribe_message': self._handle_subscribe_message,
#                 'unsubscribe_message': self._handle_unsubscribe_message,
#                 'subscribe_gateway': self._handle_subscribe_gateway,
#                 'unsubscribe_gateway': self._handle_unsubscribe_gateway,
#                 'get_queue_status': self._handle_queue_status,
#                 'get_gateway_status': self._handle_gateway_status,
#                 'refresh_dashboard': self._handle_refresh_dashboard
#             }
            
#             handler = handlers.get(message_type)
#             if handler:
#                 await handler(data)
#             else:
#                 logger.warning(f"Unknown message type: {message_type}")
                
#         except json.JSONDecodeError:
#             await self._send_error("Invalid JSON format")
#         except Exception as e:
#             logger.error(f"WebSocket receive error: {str(e)}")
#             await self._send_error(f"Error processing request: {str(e)}")
    
#     async def _handle_pong(self, data):
#         """Handle pong response"""
#         pass
    
#     async def _handle_subscribe_message(self, data):
#         """Subscribe to message updates"""
#         message_id = data.get('message_id')
#         if message_id:
#             await self._subscribe_to_message(message_id)
    
#     async def _handle_unsubscribe_message(self, data):
#         """Unsubscribe from message updates"""
#         message_id = data.get('message_id')
#         if message_id:
#             await self._unsubscribe_from_message(message_id)
    
#     async def _handle_subscribe_gateway(self, data):
#         """Subscribe to gateway updates"""
#         gateway_id = data.get('gateway_id')
#         if gateway_id:
#             await self._subscribe_to_gateway(gateway_id)
    
#     async def _handle_unsubscribe_gateway(self, data):
#         """Unsubscribe from gateway updates"""
#         gateway_id = data.get('gateway_id')
#         if gateway_id:
#             await self._unsubscribe_from_gateway(gateway_id)
    
#     async def _handle_queue_status(self, data):
#         """Send queue status"""
#         queue_data = await self._get_queue_data()
#         await self.send(text_data=json.dumps({
#             'type': 'queue_status',
#             'data': queue_data,
#             'timestamp': timezone.now().isoformat()
#         }))
    
#     async def _handle_gateway_status(self, data):
#         """Send gateway status"""
#         gateway_data = await self._get_gateway_data()
#         await self.send(text_data=json.dumps({
#             'type': 'gateway_status',
#             'data': gateway_data,
#             'timestamp': timezone.now().isoformat()
#         }))
    
#     async def _handle_refresh_dashboard(self, data):
#         """Refresh dashboard data"""
#         await self._send_initial_status()
    
#     async def _subscribe_to_message(self, message_id):
#         """Subscribe to specific message updates"""
#         try:
#             # Check permissions
#             has_permission = await self._check_message_permission(message_id)
#             if not has_permission:
#                 await self._send_error(f"Permission denied for message {message_id}")
#                 return
            
#             # Join message group
#             message_group = f'message_{message_id}'
#             await self.channel_layer.group_add(
#                 message_group,
#                 self.channel_name
#             )
            
#             self.message_subscriptions.add(message_id)
            
#             # Send confirmation
#             await self.send(text_data=json.dumps({
#                 'type': 'message_subscribed',
#                 'message_id': message_id,
#                 'timestamp': timezone.now().isoformat()
#             }))
            
#         except Exception as e:
#             logger.error(f"Failed to subscribe to message: {str(e)}")
#             await self._send_error(str(e))
    
#     async def _unsubscribe_from_message(self, message_id):
#         """Unsubscribe from message updates"""
#         try:
#             message_group = f'message_{message_id}'
#             await self.channel_layer.group_discard(
#                 message_group,
#                 self.channel_name
#             )
            
#             self.message_subscriptions.discard(message_id)
            
#             await self.send(text_data=json.dumps({
#                 'type': 'message_unsubscribed',
#                 'message_id': message_id,
#                 'timestamp': timezone.now().isoformat()
#             }))
            
#         except Exception as e:
#             logger.error(f"Failed to unsubscribe from message: {str(e)}")
    
#     async def _subscribe_to_gateway(self, gateway_id):
#         """Subscribe to gateway updates"""
#         try:
#             gateway_group = f'gateway_{gateway_id}'
#             await self.channel_layer.group_add(
#                 gateway_group,
#                 self.channel_name
#             )
            
#             self.gateway_subscriptions.add(gateway_id)
            
#             await self.send(text_data=json.dumps({
#                 'type': 'gateway_subscribed',
#                 'gateway_id': gateway_id,
#                 'timestamp': timezone.now().isoformat()
#             }))
            
#         except Exception as e:
#             logger.error(f"Failed to subscribe to gateway: {str(e)}")
    
#     async def _unsubscribe_from_gateway(self, gateway_id):
#         """Unsubscribe from gateway updates"""
#         try:
#             gateway_group = f'gateway_{gateway_id}'
#             await self.channel_layer.group_discard(
#                 gateway_group,
#                 self.channel_name
#             )
            
#             self.gateway_subscriptions.discard(gateway_id)
            
#             await self.send(text_data=json.dumps({
#                 'type': 'gateway_unsubscribed',
#                 'gateway_id': gateway_id,
#                 'timestamp': timezone.now().isoformat()
#             }))
            
#         except Exception as e:
#             logger.error(f"Failed to unsubscribe from gateway: {str(e)}")
    
#     async def _send_error(self, error_message):
#         """Send error message to client"""
#         try:
#             await self.send(text_data=json.dumps({
#                 'type': 'error',
#                 'message': error_message,
#                 'timestamp': timezone.now().isoformat()
#             }))
#         except Exception as e:
#             logger.error(f"Failed to send error message: {str(e)}")
    
#     # Message handlers for broadcast events
#     async def sms_status_update(self, event):
#         """Handle SMS status update"""
#         await self.send(text_data=json.dumps({
#             'type': 'status_update',
#             'message_id': event['message_id'],
#             'status': event['status'],
#             'old_status': event.get('old_status'),
#             'timestamp': event.get('timestamp', timezone.now().isoformat())
#         }))
    
#     async def sms_sent(self, event):
#         """Handle SMS sent event"""
#         await self.send(text_data=json.dumps({
#             'type': 'sms_sent',
#             'message_id': event['message_id'],
#             'gateway': event.get('gateway'),
#             'timestamp': event.get('timestamp', timezone.now().isoformat())
#         }))
    
#     async def sms_delivered(self, event):
#         """Handle SMS delivered event"""
#         await self.send(text_data=json.dumps({
#             'type': 'sms_delivered',
#             'message_id': event['message_id'],
#             'delivery_time': event.get('delivery_time'),
#             'timestamp': event.get('timestamp', timezone.now().isoformat())
#         }))
    
#     async def sms_failed(self, event):
#         """Handle SMS failed event"""
#         await self.send(text_data=json.dumps({
#             'type': 'sms_failed',
#             'message_id': event['message_id'],
#             'error': event.get('error'),
#             'retry_count': event.get('retry_count'),
#             'will_retry': event.get('will_retry', False),
#             'timestamp': event.get('timestamp', timezone.now().isoformat())
#         }))
    
#     async def queue_update(self, event):
#         """Handle queue update"""
#         await self.send(text_data=json.dumps({
#             'type': 'queue_update',
#             'data': event.get('data', {}),
#             'timestamp': event.get('timestamp', timezone.now().isoformat())
#         }))
    
#     async def gateway_update(self, event):
#         """Handle gateway update"""
#         await self.send(text_data=json.dumps({
#             'type': 'gateway_update',
#             'data': event.get('data', {}),
#             'timestamp': event.get('timestamp', timezone.now().isoformat())
#         }))
    
#     # Database operations
#     @database_sync_to_async
#     def _check_message_permission(self, message_id):
#         """Check if user has permission to view message"""
#         from .models import SMSMessage
        
#         try:
#             message = SMSMessage.objects.get(id=message_id)
            
#             if self.user.is_staff or self.user.is_superuser:
#                 return True
            
#             if message.client and message.client.user == self.user:
#                 return True
            
#             if message.created_by == self.user:
#                 return True
            
#             return False
#         except SMSMessage.DoesNotExist:
#             return False
    
#     @database_sync_to_async
#     def _get_dashboard_data(self):
#         """Get dashboard data"""
#         from .models import SMSMessage, SMSQueue, SMSGatewayConfig
#         from django.db.models import Count, Q, Sum
        
#         today = timezone.now().date()
        
#         # Try cache first
#         cache_key = f'dashboard_data_{self.user.id}_{today}'
#         cached_data = cache.get(cache_key)
#         if cached_data:
#             return cached_data
        
#         # Today's statistics
#         today_stats = SMSMessage.objects.filter(
#             created_at__date=today
#         ).aggregate(
#             total=Count('id'),
#             sent=Count('id', filter=Q(status='sent')),
#             delivered=Count('id', filter=Q(status='delivered')),
#             failed=Count('id', filter=Q(status='failed')),
#             pending=Count('id', filter=Q(status__in=['pending', 'queued'])),
#             total_cost=Sum('cost')
#         )
        
#         # Queue statistics
#         queue_stats = SMSQueue.objects.aggregate(
#             pending=Count('id', filter=Q(status='pending')),
#             processing=Count('id', filter=Q(status='processing')),
#             completed=Count('id', filter=Q(status='completed')),
#             failed=Count('id', filter=Q(status='failed'))
#         )
        
#         # Gateway status
#         gateways = SMSGatewayConfig.objects.filter(is_active=True)
#         gateway_data = []
        
#         for gateway in gateways:
#             gateway_messages = SMSMessage.objects.filter(
#                 gateway=gateway,
#                 created_at__date=today
#             ).count()
            
#             gateway_data.append({
#                 'id': str(gateway.id),
#                 'name': gateway.name,
#                 'type': gateway.gateway_type,
#                 'is_online': gateway.is_online,
#                 'balance': float(gateway.balance) if gateway.balance else 0,
#                 'success_rate': float(gateway.success_rate) if gateway.success_rate else 0,
#                 'messages_today': gateway_messages,
#                 'is_default': gateway.is_default
#             })
        
#         data = {
#             'today': {
#                 'total': today_stats['total'] or 0,
#                 'sent': today_stats['sent'] or 0,
#                 'delivered': today_stats['delivered'] or 0,
#                 'failed': today_stats['failed'] or 0,
#                 'pending': today_stats['pending'] or 0,
#                 'total_cost': float(today_stats['total_cost'] or 0)
#             },
#             'queue': {
#                 'pending': queue_stats['pending'] or 0,
#                 'processing': queue_stats['processing'] or 0,
#                 'completed': queue_stats['completed'] or 0,
#                 'failed': queue_stats['failed'] or 0
#             },
#             'gateways': {
#                 'total': len(gateway_data),
#                 'online': sum(1 for g in gateway_data if g['is_online']),
#                 'list': gateway_data
#             }
#         }
        
#         # Cache for 30 seconds
#         cache.set(cache_key, data, timeout=30)
        
#         return data
    
#     @database_sync_to_async
#     def _get_queue_data(self):
#         """Get queue data"""
#         from .models import SMSQueue
#         from django.db.models import Count, Q
        
#         cache_key = f'queue_data_{timezone.now().strftime("%Y%m%d%H%M")}'
#         cached_data = cache.get(cache_key)
#         if cached_data:
#             return cached_data
        
#         stats = SMSQueue.objects.aggregate(
#             total=Count('id'),
#             pending=Count('id', filter=Q(status='pending')),
#             processing=Count('id', filter=Q(status='processing')),
#             completed=Count('id', filter=Q(status='completed')),
#             failed=Count('id', filter=Q(status='failed'))
#         )
        
#         # Recent entries
#         recent = SMSQueue.objects.select_related('message').order_by('-queued_at')[:10]
        
#         entries = []
#         for entry in recent:
#             entries.append({
#                 'id': str(entry.id),
#                 'message_id': str(entry.message.id) if entry.message else None,
#                 'phone': entry.message.phone_number if entry.message else None,
#                 'priority': entry.priority,
#                 'status': entry.status,
#                 'queued_at': entry.queued_at.isoformat() if entry.queued_at else None,
#                 'attempts': entry.processing_attempts
#             })
        
#         data = {
#             'stats': stats,
#             'recent_entries': entries
#         }
        
#         cache.set(cache_key, data, timeout=10)
#         return data
    
#     @database_sync_to_async
#     def _get_gateway_data(self):
#         """Get gateway data"""
#         from .models import SMSGatewayConfig, SMSMessage
        
#         gateways = SMSGatewayConfig.objects.filter(is_active=True)
#         today = timezone.now().date()
        
#         gateway_data = []
#         for gateway in gateways:
#             messages_today = SMSMessage.objects.filter(
#                 gateway=gateway,
#                 created_at__date=today
#             ).count()
            
#             gateway_data.append({
#                 'id': str(gateway.id),
#                 'name': gateway.name,
#                 'type': gateway.gateway_type,
#                 'is_online': gateway.is_online,
#                 'balance': float(gateway.balance) if gateway.balance else 0,
#                 'success_rate': float(gateway.success_rate) if gateway.success_rate else 0,
#                 'messages_today': messages_today,
#                 'is_default': gateway.is_default
#             })
        
#         return {
#             'gateways': gateway_data,
#             'total': len(gateway_data),
#             'online': sum(1 for g in gateway_data if g['is_online'])
#         }


# class SMSBroadcastConsumer(AsyncWebsocketConsumer):
#     """WebSocket consumer for broadcasting SMS events to staff users"""
    
#     async def connect(self):
#         """Handle WebSocket connection"""
#         self.user = self.scope['user']
        
#         if not self.user or not self.user.is_authenticated:
#             await self.close(code=4001)
#             return
        
#         # Only staff and superusers can access broadcasts
#         if not (self.user.is_staff or self.user.is_superuser):
#             await self.close(code=4003)
#             return
        
#         self.connection_healthy = True
#         self.ping_task = None
        
#         try:
#             # Join broadcast group
#             await self.channel_layer.group_add(
#                 'sms_broadcast',
#                 self.channel_name
#             )
            
#             await self.accept()
#             logger.info(f"User {self.user.id} connected to SMS broadcast")
            
#             # Start ping task
#             self.ping_task = asyncio.create_task(self._send_ping())
            
#         except Exception as e:
#             logger.error(f"Error in broadcast connection: {str(e)}")
#             await self.close(code=4002)
    
#     async def disconnect(self, close_code):
#         """Handle WebSocket disconnection"""
#         self.connection_healthy = False
        
#         if self.ping_task:
#             self.ping_task.cancel()
#             try:
#                 await self.ping_task
#             except asyncio.CancelledError:
#                 pass
        
#         try:
#             await self.channel_layer.group_discard(
#                 'sms_broadcast',
#                 self.channel_name
#             )
#         except Exception as e:
#             logger.error(f"Error leaving broadcast group: {str(e)}")
        
#         logger.info(f"User {self.user.id} disconnected from SMS broadcast")
    
#     async def _send_ping(self):
#         """Send periodic pings"""
#         while self.connection_healthy:
#             try:
#                 await asyncio.sleep(30)
#                 if self.connection_healthy:
#                     await self.send(text_data=json.dumps({
#                         'type': 'ping',
#                         'timestamp': timezone.now().isoformat()
#                     }))
#             except asyncio.CancelledError:
#                 break
#             except Exception as e:
#                 logger.error(f"Error sending broadcast ping: {str(e)}")
#                 break
    
#     async def receive(self, text_data):
#         """Handle incoming messages"""
#         try:
#             data = json.loads(text_data)
#             if data.get('type') == 'pong':
#                 pass
#         except Exception as e:
#             logger.error(f"Broadcast receive error: {str(e)}")
    
#     # Broadcast message handlers
#     async def system_alert(self, event):
#         """Handle system alert broadcast"""
#         await self.send(text_data=json.dumps({
#             'type': 'system_alert',
#             **event
#         }))
    
#     async def gateway_alert(self, event):
#         """Handle gateway alert broadcast"""
#         await self.send(text_data=json.dumps({
#             'type': 'gateway_alert',
#             **event
#         }))
    
#     async def bulk_operation_complete(self, event):
#         """Handle bulk operation completion"""
#         await self.send(text_data=json.dumps({
#             'type': 'bulk_operation_complete',
#             **event
#         }))


# class SMSRootConsumer(AsyncWebsocketConsumer):
#     """Root WebSocket consumer for backward compatibility"""
    
#     async def connect(self):
#         """Handle root WebSocket connection"""
#         self.user = self.scope['user']
        
#         if not self.user or not self.user.is_authenticated:
#             await self.close(code=4001)
#             return
        
#         await self.accept()
        
#         # Send welcome message with correct endpoints
#         await self.send(text_data=json.dumps({
#             'type': 'connection_established',
#             'message': 'Connected to SMS WebSocket root',
#             'available_endpoints': [
#                 '/ws/sms/status/',
#                 '/ws/sms/broadcast/'
#             ],
#             'recommended_endpoint': '/ws/sms/status/',
#             'timestamp': timezone.now().isoformat()
#         }))
        
#         logger.info(f"User {self.user.id} connected to SMS root WebSocket")
        
#         # Close connection after sending info (this is just a redirector)
#         await self.close(code=1000, reason="Please connect to /ws/sms/status/ for real-time updates")
    
#     async def disconnect(self, close_code):
#         logger.info(f"User disconnected from SMS root WebSocket")
    
#     async def receive(self, text_data):
#         """Handle incoming messages"""
#         # Just ignore messages to root endpoint
#         pass













"""
SMS Automation WebSocket Consumers - COMPLETE FIX
Real-time updates for SMS operations
"""
import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import AccessToken
from urllib.parse import parse_qs

logger = logging.getLogger(__name__)


class SMSStatusConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for real-time SMS status updates - FIXED VERSION"""
    
    async def connect(self):
        """Handle WebSocket connection with proper authentication"""
        self.user = AnonymousUser()
        self.group_name = None
        self.message_subscriptions = set()
        self.gateway_subscriptions = set()
        
        try:
            # Authenticate user
            self.user = await self.authenticate_user()
            
            if not self.user or not self.user.is_authenticated:
                logger.warning(f"Unauthenticated WebSocket connection attempt rejected")
                await self.close(code=4001)
                return
            
            # Set group name
            self.group_name = f'sms_status_{self.user.id}'
            
            # Join user group
            await self.channel_layer.group_add(
                self.group_name,
                self.channel_name
            )
            
            # Accept the connection
            await self.accept()
            logger.info(f"User {self.user.id} connected to SMS status WebSocket")
            
            # Send initial connection confirmation
            await self.send(text_data=json.dumps({
                'type': 'connection_established',
                'message': 'Connected to SMS status WebSocket',
                'user_id': str(self.user.id),
                'timestamp': timezone.now().isoformat()
            }))
            
        except Exception as e:
            logger.error(f"Error in WebSocket connection: {str(e)}")
            await self.close(code=4002)
    
    async def authenticate_user(self):
        """Authenticate user from query string token"""
        try:
            # Parse query string
            query_string = self.scope['query_string'].decode()
            query_params = parse_qs(query_string)
            
            # Get token from query params
            token = query_params.get('token', [None])[0]
            
            if not token:
                logger.debug("No token provided in WebSocket connection")
                return AnonymousUser()
            
            # Import User model
            from django.contrib.auth import get_user_model
            User = get_user_model()
            
            # Try to decode token
            try:
                access_token = AccessToken(token)
                user = await database_sync_to_async(User.objects.get)(id=access_token['user_id'])
                logger.debug(f"User {user.id} authenticated via token")
                return user
            except Exception as e:
                logger.debug(f"Token authentication failed: {e}")
                return AnonymousUser()
                
        except Exception as e:
            logger.error(f"Authentication error: {str(e)}")
            return AnonymousUser()
    
    async def disconnect(self, close_code):
        """Handle WebSocket disconnection"""
        # Leave user group
        if hasattr(self, 'group_name') and self.group_name:
            try:
                await self.channel_layer.group_discard(
                    self.group_name,
                    self.channel_name
                )
            except Exception as e:
                logger.error(f"Error leaving group: {str(e)}")
        
        logger.info(f"User {getattr(self.user, 'id', 'unknown')} disconnected (code: {close_code})")
    
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
            logger.error("Invalid JSON received")
        except Exception as e:
            logger.error(f"Error processing message: {e}")
    
    # Message handlers for broadcast events
    async def sms_status_update(self, event):
        """Handle SMS status update"""
        await self.send(text_data=json.dumps({
            'type': 'status_update',
            'message_id': event['message_id'],
            'status': event['status'],
            'old_status': event.get('old_status'),
            'timestamp': event.get('timestamp', timezone.now().isoformat())
        }))
    
    async def sms_sent(self, event):
        """Handle SMS sent event"""
        await self.send(text_data=json.dumps({
            'type': 'sms_sent',
            'message_id': event['message_id'],
            'gateway': event.get('gateway'),
            'timestamp': event.get('timestamp', timezone.now().isoformat())
        }))
    
    async def sms_delivered(self, event):
        """Handle SMS delivered event"""
        await self.send(text_data=json.dumps({
            'type': 'sms_delivered',
            'message_id': event['message_id'],
            'delivery_time': event.get('delivery_time'),
            'timestamp': event.get('timestamp', timezone.now().isoformat())
        }))
    
    async def sms_failed(self, event):
        """Handle SMS failed event"""
        await self.send(text_data=json.dumps({
            'type': 'sms_failed',
            'message_id': event['message_id'],
            'error': event.get('error'),
            'retry_count': event.get('retry_count'),
            'will_retry': event.get('will_retry', False),
            'timestamp': event.get('timestamp', timezone.now().isoformat())
        }))
    
    async def queue_update(self, event):
        """Handle queue update"""
        await self.send(text_data=json.dumps({
            'type': 'queue_update',
            'data': event.get('data', {}),
            'timestamp': event.get('timestamp', timezone.now().isoformat())
        }))
    
    async def gateway_update(self, event):
        """Handle gateway update"""
        await self.send(text_data=json.dumps({
            'type': 'gateway_update',
            'data': event.get('data', {}),
            'timestamp': event.get('timestamp', timezone.now().isoformat())
        }))


class SMSBroadcastConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for broadcasting SMS events to staff users"""
    
    async def connect(self):
        """Handle WebSocket connection"""
        self.user = await self.authenticate_user()
        
        if not self.user or not self.user.is_authenticated:
            await self.close(code=4001)
            return
        
        # Only staff and superusers can access broadcasts
        if not (self.user.is_staff or self.user.is_superuser):
            await self.close(code=4003)
            return
        
        try:
            # Join broadcast group
            await self.channel_layer.group_add(
                'sms_broadcast',
                self.channel_name
            )
            
            await self.accept()
            logger.info(f"User {self.user.id} connected to SMS broadcast")
            
        except Exception as e:
            logger.error(f"Error in broadcast connection: {str(e)}")
            await self.close(code=4002)
    
    async def authenticate_user(self):
        """Authenticate user from query string token"""
        try:
            query_string = self.scope['query_string'].decode()
            query_params = parse_qs(query_string)
            token = query_params.get('token', [None])[0]
            
            if not token:
                return AnonymousUser()
            
            from django.contrib.auth import get_user_model
            User = get_user_model()
            
            access_token = AccessToken(token)
            user = await database_sync_to_async(User.objects.get)(id=access_token['user_id'])
            return user
            
        except Exception:
            return AnonymousUser()
    
    async def disconnect(self, close_code):
        """Handle WebSocket disconnection"""
        try:
            await self.channel_layer.group_discard(
                'sms_broadcast',
                self.channel_name
            )
        except Exception:
            pass
        
        logger.info(f"User {getattr(self.user, 'id', 'unknown')} disconnected from broadcast")
    
    async def receive(self, text_data):
        """Handle incoming messages"""
        try:
            data = json.loads(text_data)
            if data.get('type') == 'ping':
                await self.send(text_data=json.dumps({'type': 'pong'}))
        except Exception:
            pass
    
    # Broadcast message handlers
    async def system_alert(self, event):
        """Handle system alert broadcast"""
        await self.send(text_data=json.dumps({
            'type': 'system_alert',
            **event
        }))
    
    async def gateway_alert(self, event):
        """Handle gateway alert broadcast"""
        await self.send(text_data=json.dumps({
            'type': 'gateway_alert',
            **event
        }))


class SMSRootConsumer(AsyncWebsocketConsumer):
    """Root WebSocket consumer for backward compatibility"""
    
    async def connect(self):
        """Handle root WebSocket connection"""
        await self.accept()
        
        await self.send(text_data=json.dumps({
            'type': 'connection_established',
            'message': 'Connected to SMS WebSocket root',
            'available_endpoints': [
                '/ws/sms/status/',
                '/ws/sms/broadcast/'
            ],
            'timestamp': timezone.now().isoformat()
        }))
        
        logger.info("User connected to SMS root WebSocket")
        await self.close(code=1000)