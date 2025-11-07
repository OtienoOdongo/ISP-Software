# # network_management/consumers.py
# import json
# from channels.generic.websocket import AsyncWebsocketConsumer
# from channels.db import database_sync_to_async
# from django.utils import timezone
# import logging

# logger = logging.getLogger(__name__)

# class RouterConsumer(AsyncWebsocketConsumer):
#     """
#     WebSocket Consumer for router real-time updates.
#     """
#     async def connect(self):
#         self.router_group = "routers_global"
        
#         # Join router group
#         await self.channel_layer.group_add(
#             self.router_group,
#             self.channel_name
#         )
        
#         await self.accept()
#         logger.info(f"WebSocket connected for router updates: {self.channel_name}")

#     async def disconnect(self, close_code):
#         # Leave router group
#         await self.channel_layer.group_discard(
#             self.router_group,
#             self.channel_name
#         )
#         logger.info(f"WebSocket disconnected from router updates: {self.channel_name}")

#     async def receive(self, text_data):
#         try:
#             text_data_json = json.loads(text_data)
#             message = text_data_json.get('message', '')
            
#             # Send message to room group
#             await self.channel_layer.group_send(
#                 self.router_group,
#                 {
#                     'type': 'router_message',
#                     'message': message,
#                     'sender': self.channel_name
#                 }
#             )
#         except json.JSONDecodeError as e:
#             logger.error(f"Invalid JSON received: {text_data}")
#             await self.send(text_data=json.dumps({
#                 'error': 'Invalid JSON format',
#                 'timestamp': timezone.now().isoformat()
#             }))

#     # Receive message from room group
#     async def router_message(self, event):
#         message = event['message']
#         sender = event.get('sender', 'system')
        
#         # Send message to WebSocket
#         await self.send(text_data=json.dumps({
#             'type': 'router_message',
#             'message': message,
#             'sender': sender,
#             'timestamp': timezone.now().isoformat()
#         }))

#     async def router_update(self, event):
#         """Handle router update events"""
#         await self.send(text_data=json.dumps({
#             'type': 'router_update',
#             'action': event['action'],
#             'router_id': event['router_id'],
#             'timestamp': event['timestamp'],
#             'data': event.get('data', {})
#         }))

#     async def health_update(self, event):
#         """Handle health update events"""
#         await self.send(text_data=json.dumps({
#             'type': 'health_update',
#             'router_id': event['router_id'],
#             'health_info': event['health_info'],
#             'timestamp': event['timestamp']
#         }))

#     async def bulk_operation_complete(self, event):
#         """Handle bulk operation completion"""
#         await self.send(text_data=json.dumps({
#             'type': 'bulk_operation_complete',
#             'operation_id': event['operation_id'],
#             'status': event['status'],
#             'results': event['results'],
#             'timestamp': event['timestamp']
#         }))


# class RouterHealthConsumer(AsyncWebsocketConsumer):
#     """
#     WebSocket Consumer for router health monitoring.
#     """
#     async def connect(self):
#         self.router_id = self.scope['url_route']['kwargs']['router_id']
#         self.health_group = f"router_{self.router_id}_health"
        
#         await self.channel_layer.group_add(
#             self.health_group,
#             self.channel_name
#         )
        
#         await self.accept()
#         logger.info(f"WebSocket connected for router {self.router_id} health monitoring: {self.channel_name}")

#     async def disconnect(self, close_code):
#         await self.channel_layer.group_discard(
#             self.health_group,
#             self.channel_name
#         )
#         logger.info(f"WebSocket disconnected from router {self.router_id} health monitoring: {self.channel_name}")

#     async def health_update(self, event):
#         """Handle health update events"""
#         await self.send(text_data=json.dumps({
#             'type': 'health_update',
#             'router_id': event['router_id'],
#             'health_info': event['health_info'],
#             'timestamp': event['timestamp']
#         }))


# class BulkOperationsConsumer(AsyncWebsocketConsumer):
#     """
#     WebSocket Consumer for bulk operations.
#     """
#     async def connect(self):
#         self.bulk_group = "bulk_operations"
        
#         await self.channel_layer.group_add(
#             self.bulk_group,
#             self.channel_name
#         )
        
#         await self.accept()
#         logger.info(f"WebSocket connected for bulk operations: {self.channel_name}")

#     async def disconnect(self, close_code):
#         await self.channel_layer.group_discard(
#             self.bulk_group,
#             self.channel_name
#         )
#         logger.info(f"WebSocket disconnected from bulk operations: {self.channel_name}")

#     async def bulk_operation_complete(self, event):
#         """Handle bulk operation completion"""
#         await self.send(text_data=json.dumps({
#             'type': 'bulk_operation_complete',
#             'operation_id': event['operation_id'],
#             'status': event['status'],
#             'results': event['results'],
#             'timestamp': event['timestamp']
#         }))


# class NotificationConsumer(AsyncWebsocketConsumer):
#     """
#     WebSocket Consumer for general notifications.
#     """
#     async def connect(self):
#         self.notification_group = "notifications"
        
#         await self.channel_layer.group_add(
#             self.notification_group,
#             self.channel_name
#         )
        
#         await self.accept()
#         logger.info(f"WebSocket connected for notifications: {self.channel_name}")

#     async def disconnect(self, close_code):
#         await self.channel_layer.group_discard(
#             self.notification_group,
#             self.channel_name
#         )
#         logger.info(f"WebSocket disconnected from notifications: {self.channel_name}")

#     async def send_notification(self, event):
#         """Handle notification events"""
#         await self.send(text_data=json.dumps({
#             'type': 'notification',
#             'title': event['title'],
#             'message': event['message'],
#             'level': event['level'],
#             'timestamp': event['timestamp']
#         }))






"""
Enhanced WebSocket Consumers for Network Management System

This module provides comprehensive WebSocket consumers for real-time communication
with enhanced error handling, authentication, and connection management.
"""

import json
import uuid
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone
from django.contrib.auth.models import AnonymousUser

logger = logging.getLogger(__name__)


class RouterConsumer(AsyncWebsocketConsumer):
    """
    ENHANCED WebSocket Consumer for router real-time updates with comprehensive error handling.
    """
    
    async def connect(self):
        """Handle WebSocket connection with authentication and validation."""
        self.router_group = "routers_global"
        self.user = self.scope["user"]
        self.connection_id = str(uuid.uuid4())
        
        # Authentication check
        if isinstance(self.user, AnonymousUser) or not self.user.is_authenticated:
            await self.close(code=4401)  # Custom close code for unauthorized
            return

        try:
            # Join router group
            await self.channel_layer.group_add(
                self.router_group,
                self.channel_name
            )
            
            await self.accept()
            
            logger.info(f"WebSocket connected for router updates: {self.channel_name}, User: {self.user.username}")
            
            # Send connection confirmation with capabilities
            await self.send(text_data=json.dumps({
                'type': 'connection_established',
                'message': 'Connected to router updates',
                'connection_id': self.connection_id,
                'capabilities': ['router_updates', 'health_updates', 'user_activations'],
                'timestamp': timezone.now().isoformat()
            }))
            
            # Send initial router list
            await self.send_initial_router_list()

        except Exception as e:
            logger.error(f"WebSocket connection failed: {str(e)}")
            await self.close(code=4400)  # Custom close code for connection error

    async def disconnect(self, close_code):
        """Handle WebSocket disconnection."""
        try:
            # Leave router group
            await self.channel_layer.group_discard(
                self.router_group,
                self.channel_name
            )
            
            logger.info(f"WebSocket disconnected from router updates: {self.channel_name}, Close code: {close_code}")
            
        except Exception as e:
            logger.error(f"WebSocket disconnect error: {str(e)}")

    async def receive(self, text_data):
        """
        Handle messages from client with comprehensive error handling.
        """
        try:
            text_data_json = json.loads(text_data)
            message_type = text_data_json.get('type', '')
            
            if message_type == 'ping':
                await self.handle_ping()
                
            elif message_type == 'subscribe_router':
                router_id = text_data_json.get('router_id')
                await self.subscribe_to_router(router_id)
                
            elif message_type == 'unsubscribe_router':
                router_id = text_data_json.get('router_id')
                await self.unsubscribe_from_router(router_id)
                
            elif message_type == 'get_router_status':
                router_id = text_data_json.get('router_id')
                await self.send_router_status(router_id)
                
            else:
                await self.send_error('unknown_message_type', 'Unknown message type received')
                
        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON received: {text_data}")
            await self.send_error('invalid_json', 'Invalid JSON format')
            
        except Exception as e:
            logger.error(f"Error processing message: {str(e)}")
            await self.send_error('processing_error', 'Error processing message')

    async def handle_ping(self):
        """Handle ping messages for connection health checking."""
        await self.send(text_data=json.dumps({
            'type': 'pong',
            'timestamp': timezone.now().isoformat()
        }))

    async def subscribe_to_router(self, router_id):
        """Subscribe to specific router updates."""
        try:
            # Verify user has access to this router
            has_access = await database_sync_to_async(
                lambda: self.user.has_perm('network_management.view_router') or 
                self.user.is_superuser
            )()
            
            if has_access:
                router_group = f"router_{router_id}"
                await self.channel_layer.group_add(
                    router_group,
                    self.channel_name
                )
                
                await self.send(text_data=json.dumps({
                    'type': 'subscription_success',
                    'router_id': router_id,
                    'message': 'Subscribed to router updates',
                    'timestamp': timezone.now().isoformat()
                }))
            else:
                await self.send_error('subscription_error', 'Router not found or access denied')
                
        except Exception as e:
            logger.error(f"Router subscription failed: {str(e)}")
            await self.send_error('subscription_error', f'Subscription failed: {str(e)}')

    async def unsubscribe_from_router(self, router_id):
        """Unsubscribe from specific router updates."""
        router_group = f"router_{router_id}"
        await self.channel_layer.group_discard(
            router_group,
            self.channel_name
        )
        
        await self.send(text_data=json.dumps({
            'type': 'unsubscription_success',
            'router_id': router_id,
            'message': 'Unsubscribed from router updates',
            'timestamp': timezone.now().isoformat()
        }))

    async def send_initial_router_list(self):
        """Send initial router list upon connection."""
        try:
            from network_management.models.router_management_model import Router
            routers = await database_sync_to_async(
                lambda: list(Router.objects.filter(is_active=True).values('id', 'name', 'status', 'ip'))
            )()
            
            await self.send(text_data=json.dumps({
                'type': 'initial_router_list',
                'routers': routers,
                'timestamp': timezone.now().isoformat()
            }))
        except Exception as e:
            logger.error(f"Failed to send initial router list: {str(e)}")

    async def send_router_status(self, router_id):
        """Send current status of a specific router."""
        try:
            from network_management.models.router_management_model import Router
            router = await database_sync_to_async(
                lambda: Router.objects.filter(id=router_id).values('id', 'name', 'status', 'last_seen').first()
            )()
            
            if router:
                await self.send(text_data=json.dumps({
                    'type': 'router_status',
                    'router_id': router_id,
                    'status': router,
                    'timestamp': timezone.now().isoformat()
                }))
            else:
                await self.send_error('router_not_found', 'Router not found')
                
        except Exception as e:
            logger.error(f"Failed to send router status: {str(e)}")
            await self.send_error('status_error', 'Failed to get router status')

    async def send_error(self, error_type, message):
        """Send standardized error messages."""
        await self.send(text_data=json.dumps({
            'type': 'error',
            'error_type': error_type,
            'message': message,
            'timestamp': timezone.now().isoformat()
        }))

    # Event handlers for different message types
    async def router_update(self, event):
        """Handle router update events with error handling."""
        try:
            await self.send(text_data=json.dumps({
                'type': 'router_update',
                'action': event['action'],
                'router_id': event['router_id'],
                'timestamp': event['timestamp'],
                'data': event.get('data', {})
            }))
        except Exception as e:
            logger.error(f"Failed to send router update: {str(e)}")

    async def health_update(self, event):
        """Handle health update events with error handling."""
        try:
            await self.send(text_data=json.dumps({
                'type': 'health_update',
                'router_id': event['router_id'],
                'health_info': event['health_info'],
                'timestamp': event['timestamp']
            }))
        except Exception as e:
            logger.error(f"Failed to send health update: {str(e)}")

    async def user_activation(self, event):
        """Handle user activation events."""
        try:
            await self.send(text_data=json.dumps({
                'type': 'user_activation',
                'router_id': event['router_id'],
                'user_type': event['user_type'],
                'user_data': event['user_data'],
                'timestamp': event['timestamp']
            }))
        except Exception as e:
            logger.error(f"Failed to send user activation: {str(e)}")

    async def user_session_update(self, event):
        """Handle user session update events."""
        try:
            await self.send(text_data=json.dumps({
                'type': 'user_session_update',
                'router_id': event['router_id'],
                'user_type': event['user_type'],
                'action': event['action'],
                'user_data': event['user_data'],
                'timestamp': event['timestamp']
            }))
        except Exception as e:
            logger.error(f"Failed to send user session update: {str(e)}")

    async def connection_status(self, event):
        """Handle connection status updates."""
        try:
            await self.send(text_data=json.dumps({
                'type': 'connection_status',
                'router_id': event['router_id'],
                'is_online': event['is_online'],
                'response_time': event.get('response_time'),
                'error_message': event.get('error_message'),
                'timestamp': event['timestamp']
            }))
        except Exception as e:
            logger.error(f"Failed to send connection status: {str(e)}")

    async def statistics_update(self, event):
        """Handle statistics updates."""
        try:
            await self.send(text_data=json.dumps({
                'type': 'statistics_update',
                'router_id': event['router_id'],
                'stats_data': event['stats_data'],
                'timestamp': event['timestamp']
            }))
        except Exception as e:
            logger.error(f"Failed to send statistics update: {str(e)}")


class RouterHealthConsumer(AsyncWebsocketConsumer):
    """
    ENHANCED WebSocket Consumer for router health monitoring with authentication.
    """
    
    async def connect(self):
        """Handle WebSocket connection for health monitoring."""
        self.router_id = self.scope['url_route']['kwargs']['router_id']
        self.health_group = f"router_{self.router_id}_health"
        self.user = self.scope["user"]
        self.connection_id = str(uuid.uuid4())
        
        # Authentication check
        if isinstance(self.user, AnonymousUser) or not self.user.is_authenticated:
            await self.close(code=4401)
            return

        try:
            # Verify user has access to this router's health data
            has_access = await self.check_router_access(self.router_id)
            if not has_access:
                await self.close(code=4403)  # Custom close code for forbidden
                return

            await self.channel_layer.group_add(
                self.health_group,
                self.channel_name
            )
            
            await self.accept()
            
            logger.info(f"WebSocket connected for router {self.router_id} health monitoring: {self.channel_name}, User: {self.user.username}")
            
            # Send connection confirmation
            await self.send(text_data=json.dumps({
                'type': 'connection_established',
                'message': f'Connected to health monitoring for router {self.router_id}',
                'connection_id': self.connection_id,
                'router_id': self.router_id,
                'timestamp': timezone.now().isoformat()
            }))
            
            # Send current health status
            await self.send_current_health_status()

        except Exception as e:
            logger.error(f"Health WebSocket connection failed: {str(e)}")
            await self.close(code=4400)

    async def disconnect(self, close_code):
        """Handle WebSocket disconnection."""
        await self.channel_layer.group_discard(
            self.health_group,
            self.channel_name
        )
        logger.info(f"WebSocket disconnected from router {self.router_id} health monitoring: {self.channel_name}, Close code: {close_code}")

    async def receive(self, text_data):
        """Handle incoming messages."""
        try:
            text_data_json = json.loads(text_data)
            message_type = text_data_json.get('type', '')
            
            if message_type == 'ping':
                await self.send(text_data=json.dumps({
                    'type': 'pong',
                    'timestamp': timezone.now().isoformat()
                }))
            elif message_type == 'get_health_status':
                await self.send_current_health_status()
            else:
                await self.send(text_data=json.dumps({
                    'type': 'error',
                    'message': 'Unknown message type',
                    'timestamp': timezone.now().isoformat()
                }))
                
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Invalid JSON format',
                'timestamp': timezone.now().isoformat()
            }))

    async def send_current_health_status(self):
        """Send current health status of the router."""
        try:
            from network_management.models.router_management_model import RouterHealthCheck
            health_status = await database_sync_to_async(
                lambda: RouterHealthCheck.objects.filter(
                    router_id=self.router_id
                ).order_by('-timestamp').first()
            )()
            
            if health_status:
                await self.send(text_data=json.dumps({
                    'type': 'current_health_status',
                    'health_status': {
                        'is_online': health_status.is_online,
                        'response_time': health_status.response_time,
                        'health_score': health_status.health_score,
                        'timestamp': health_status.timestamp.isoformat(),
                        'system_metrics': health_status.system_metrics
                    },
                    'timestamp': timezone.now().isoformat()
                }))
        except Exception as e:
            logger.error(f"Failed to send current health status: {str(e)}")

    async def check_router_access(self, router_id):
        """Check if user has access to the router."""
        try:
            from network_management.models.router_management_model import Router
            has_access = await database_sync_to_async(
                lambda: Router.objects.filter(
                    id=router_id, 
                    is_active=True
                ).exists() and (
                    self.user.has_perm('network_management.view_router') or 
                    self.user.is_superuser
                )
            )()
            return has_access
        except Exception as e:
            logger.error(f"Router access check failed: {str(e)}")
            return False

    async def health_update(self, event):
        """Handle health update events."""
        try:
            await self.send(text_data=json.dumps({
                'type': 'health_update',
                'router_id': event['router_id'],
                'health_info': event['health_info'],
                'timestamp': event['timestamp']
            }))
        except Exception as e:
            logger.error(f"Failed to send health update: {str(e)}")

    async def connection_status(self, event):
        """Handle connection status updates."""
        try:
            await self.send(text_data=json.dumps({
                'type': 'connection_status',
                'router_id': event['router_id'],
                'is_online': event['is_online'],
                'response_time': event.get('response_time'),
                'error_message': event.get('error_message'),
                'timestamp': event['timestamp']
            }))
        except Exception as e:
            logger.error(f"Failed to send connection status: {str(e)}")

    async def statistics_update(self, event):
        """Handle statistics updates."""
        try:
            await self.send(text_data=json.dumps({
                'type': 'statistics_update',
                'router_id': event['router_id'],
                'stats_data': event['stats_data'],
                'timestamp': event['timestamp']
            }))
        except Exception as e:
            logger.error(f"Failed to send statistics update: {str(e)}")


class BulkOperationsConsumer(AsyncWebsocketConsumer):
    """
    COMPLETE WebSocket Consumer for bulk operations with progress tracking.
    """
    
    async def connect(self):
        """Handle WebSocket connection for bulk operations."""
        self.bulk_group = "bulk_operations"
        self.user = self.scope["user"]
        self.connection_id = str(uuid.uuid4())
        
        # Authentication check
        if isinstance(self.user, AnonymousUser) or not self.user.is_authenticated:
            await self.close(code=4401)
            return

        try:
            # Join bulk operations group
            await self.channel_layer.group_add(
                self.bulk_group,
                self.channel_name
            )
            
            await self.accept()
            logger.info(f"WebSocket connected for bulk operations: {self.channel_name}, User: {self.user.username}")

            # Send connection confirmation
            await self.send(text_data=json.dumps({
                'type': 'connection_established',
                'message': 'Connected to bulk operations',
                'connection_id': self.connection_id,
                'timestamp': timezone.now().isoformat()
            }))

        except Exception as e:
            logger.error(f"Bulk operations WebSocket connection failed: {str(e)}")
            await self.close(code=4400)

    async def disconnect(self, close_code):
        """Handle WebSocket disconnection."""
        await self.channel_layer.group_discard(
            self.bulk_group,
            self.channel_name
        )
        logger.info(f"WebSocket disconnected from bulk operations: {self.channel_name}, Close code: {close_code}")

    async def receive(self, text_data):
        """
        Handle messages from client for bulk operations.
        """
        try:
            text_data_json = json.loads(text_data)
            message_type = text_data_json.get('type', '')
            
            if message_type == 'subscribe_operation':
                operation_id = text_data_json.get('operation_id')
                await self.subscribe_to_operation(operation_id)
                
            elif message_type == 'unsubscribe_operation':
                operation_id = text_data_json.get('operation_id')
                await self.unsubscribe_from_operation(operation_id)
                
            elif message_type == 'ping':
                await self.send(text_data=json.dumps({
                    'type': 'pong',
                    'timestamp': timezone.now().isoformat()
                }))
                
            else:
                await self.send(text_data=json.dumps({
                    'type': 'error',
                    'message': 'Unknown message type',
                    'timestamp': timezone.now().isoformat()
                }))
                
        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON received: {text_data}")
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Invalid JSON format',
                'timestamp': timezone.now().isoformat()
            }))

    async def subscribe_to_operation(self, operation_id):
        """
        Subscribe to specific operation updates.
        """
        try:
            # Verify user has access to this operation
            operation = await database_sync_to_async(
                lambda: self.user.bulkoperation_set.filter(
                    operation_id=operation_id
                ).exists()
            )()
            
            if operation:
                operation_group = f"bulk_operation_{operation_id}"
                await self.channel_layer.group_add(
                    operation_group,
                    self.channel_name
                )
                
                await self.send(text_data=json.dumps({
                    'type': 'subscription_success',
                    'operation_id': operation_id,
                    'message': 'Subscribed to operation updates',
                    'timestamp': timezone.now().isoformat()
                }))
            else:
                await self.send(text_data=json.dumps({
                    'type': 'subscription_error',
                    'operation_id': operation_id,
                    'message': 'Operation not found or access denied',
                    'timestamp': timezone.now().isoformat()
                }))
                
        except Exception as e:
            logger.error(f"Subscription failed: {str(e)}")
            await self.send(text_data=json.dumps({
                'type': 'subscription_error',
                'message': f'Subscription failed: {str(e)}',
                'timestamp': timezone.now().isoformat()
            }))

    async def unsubscribe_from_operation(self, operation_id):
        """
        Unsubscribe from specific operation updates.
        """
        operation_group = f"bulk_operation_{operation_id}"
        await self.channel_layer.group_discard(
            operation_group,
            self.channel_name
        )
        
        await self.send(text_data=json.dumps({
            'type': 'unsubscription_success',
            'operation_id': operation_id,
            'message': 'Unsubscribed from operation updates',
            'timestamp': timezone.now().isoformat()
        }))

    async def bulk_operation_progress(self, event):
        """
        Handle bulk operation progress updates.
        """
        await self.send(text_data=json.dumps({
            'type': 'bulk_operation_progress',
            'operation_id': event['operation_id'],
            'status': event['status'],
            'progress': event['progress'],
            'message': event.get('message'),
            'timestamp': event['timestamp'],
            'details': event.get('details', {})
        }))

    async def bulk_operation_complete(self, event):
        """
        Handle bulk operation completion.
        """
        await self.send(text_data=json.dumps({
            'type': 'bulk_operation_complete',
            'operation_id': event['operation_id'],
            'status': event['status'],
            'results': event['results'],
            'timestamp': event['timestamp']
        }))

    async def bulk_operation_error(self, event):
        """
        Handle bulk operation errors.
        """
        await self.send(text_data=json.dumps({
            'type': 'bulk_operation_error',
            'operation_id': event['operation_id'],
            'error': event['error'],
            'timestamp': event['timestamp']
        }))

    async def bulk_operation_update(self, event):
        """
        Handle bulk operation general updates.
        """
        await self.send(text_data=json.dumps({
            'type': 'bulk_operation_update',
            'operation_id': event['operation_id'],
            'status': event['status'],
            'progress': event.get('progress'),
            'message': event.get('message'),
            'timestamp': event['timestamp']
        }))


class NotificationConsumer(AsyncWebsocketConsumer):
    """
    ENHANCED WebSocket Consumer for general notifications with authentication.
    """
    
    async def connect(self):
        """Handle WebSocket connection for notifications."""
        self.notification_group = "notifications"
        self.user = self.scope["user"]
        self.connection_id = str(uuid.uuid4())
        
        # Authentication check
        if isinstance(self.user, AnonymousUser) or not self.user.is_authenticated:
            await self.close(code=4401)
            return

        try:
            await self.channel_layer.group_add(
                self.notification_group,
                self.channel_name
            )
            
            await self.accept()
            logger.info(f"WebSocket connected for notifications: {self.channel_name}, User: {self.user.username}")

            # Send connection confirmation
            await self.send(text_data=json.dumps({
                'type': 'connection_established',
                'message': 'Connected to notifications',
                'connection_id': self.connection_id,
                'timestamp': timezone.now().isoformat()
            }))

        except Exception as e:
            logger.error(f"Notification WebSocket connection failed: {str(e)}")
            await self.close(code=4400)

    async def disconnect(self, close_code):
        """Handle WebSocket disconnection."""
        await self.channel_layer.group_discard(
            self.notification_group,
            self.channel_name
        )
        logger.info(f"WebSocket disconnected from notifications: {self.channel_name}, Close code: {close_code}")

    async def receive(self, text_data):
        """Handle incoming messages."""
        try:
            text_data_json = json.loads(text_data)
            message_type = text_data_json.get('type', '')
            
            if message_type == 'ping':
                await self.send(text_data=json.dumps({
                    'type': 'pong',
                    'timestamp': timezone.now().isoformat()
                }))
            else:
                await self.send(text_data=json.dumps({
                    'type': 'error',
                    'message': 'Unknown message type',
                    'timestamp': timezone.now().isoformat()
                }))
                
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Invalid JSON format',
                'timestamp': timezone.now().isoformat()
            }))

    async def send_notification(self, event):
        """Handle notification events."""
        try:
            await self.send(text_data=json.dumps({
                'type': 'notification',
                'title': event['title'],
                'message': event['message'],
                'level': event['level'],
                'timestamp': event['timestamp'],
                'data': event.get('data', {})
            }))
        except Exception as e:
            logger.error(f"Failed to send notification: {str(e)}")

    async def system_notification(self, event):
        """Handle system notification events."""
        try:
            await self.send(text_data=json.dumps({
                'type': 'system_notification',
                'title': event['title'],
                'message': event['message'],
                'level': event['level'],
                'data': event.get('data', {}),
                'timestamp': event['timestamp']
            }))
        except Exception as e:
            logger.error(f"Failed to send system notification: {str(e)}")

    async def session_recovery_update(self, event):
        """Handle session recovery updates."""
        try:
            await self.send(text_data=json.dumps({
                'type': 'session_recovery_update',
                'recovered_count': event['recovered_count'],
                'failed_count': event.get('failed_count', 0),
                'timestamp': event['timestamp']
            }))
        except Exception as e:
            logger.error(f"Failed to send session recovery update: {str(e)}")