"""
WebSocket Utilities for Network Management System

This module provides comprehensive WebSocket management utilities for real-time updates.
"""

import logging
import json
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.utils import timezone

logger = logging.getLogger(__name__)


class WebSocketManager:
    """
    Comprehensive WebSocket management utility for real-time updates.
    """
    
    @staticmethod
    def send_router_update(router_id, action, data=None):
        """
        Send router update to all connected clients.
        
        Args:
            router_id: ID of the router
            action: Type of action (created, updated, deleted, rebooted, etc.)
            data: Additional data to include in the update
        """
        try:
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                "routers_global",
                {
                    "type": "router_update",
                    "action": action,
                    "router_id": router_id,
                    "timestamp": timezone.now().isoformat(),
                    "data": data or {}
                }
            )
            logger.debug(f"WebSocket update sent for router {router_id}: {action}")
        except Exception as e:
            logger.error(f"WebSocket router update failed: {str(e)}")

    @staticmethod
    def send_health_update(router_id, health_info):
        """
        Send health update to router-specific health group.
        
        Args:
            router_id: ID of the router
            health_info: Health information dictionary
        """
        try:
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f"router_{router_id}_health",
                {
                    "type": "health_update",
                    "router_id": router_id,
                    "health_info": health_info,
                    "timestamp": timezone.now().isoformat()
                }
            )
        except Exception as e:
            logger.error(f"WebSocket health update failed: {str(e)}")

    @staticmethod
    def send_user_activation_notification(router_id, user_type, user_data):
        """
        Send user activation notification.
        
        Args:
            router_id: ID of the router
            user_type: Type of user (hotspot, pppoe)
            user_data: User activation data
        """
        try:
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                "routers_global",
                {
                    "type": "user_activation",
                    "router_id": router_id,
                    "user_type": user_type,
                    "user_data": user_data,
                    "timestamp": timezone.now().isoformat()
                }
            )
        except Exception as e:
            logger.error(f"WebSocket user activation notification failed: {str(e)}")

    @staticmethod
    def send_session_recovery_notification(recovered_count, failed_count=0):
        """
        Send session recovery notification.
        
        Args:
            recovered_count: Number of sessions recovered
            failed_count: Number of sessions that failed to recover
        """
        try:
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                "notifications",
                {
                    "type": "session_recovery_update",
                    "recovered_count": recovered_count,
                    "failed_count": failed_count,
                    "timestamp": timezone.now().isoformat()
                }
            )
        except Exception as e:
            logger.error(f"WebSocket session recovery notification failed: {str(e)}")

    @staticmethod
    def send_bulk_operation_update(operation_id, status, progress=None, message=None):
        """
        Send bulk operation update.
        
        Args:
            operation_id: ID of the bulk operation
            status: Current status of the operation
            progress: Progress information dictionary
            message: Optional message
        """
        try:
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                "bulk_operations",
                {
                    "type": "bulk_operation_update",
                    "operation_id": operation_id,
                    "status": status,
                    "progress": progress,
                    "message": message,
                    "timestamp": timezone.now().isoformat()
                }
            )
        except Exception as e:
            logger.error(f"WebSocket bulk operation update failed: {str(e)}")

    @staticmethod
    def send_system_notification(title, message, level="info", data=None):
        """
        Send general system notification.
        
        Args:
            title: Notification title
            message: Notification message
            level: Notification level (info, success, warning, error)
            data: Additional data
        """
        try:
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                "notifications",
                {
                    "type": "system_notification",
                    "title": title,
                    "message": message,
                    "level": level,
                    "data": data or {},
                    "timestamp": timezone.now().isoformat()
                }
            )
        except Exception as e:
            logger.error(f"WebSocket system notification failed: {str(e)}")

    @staticmethod
    def send_connection_status(router_id, is_online, response_time=None, error_message=None):
        """
        Send router connection status update.
        
        Args:
            router_id: ID of the router
            is_online: Boolean indicating if router is online
            response_time: Response time in seconds (optional)
            error_message: Error message if offline (optional)
        """
        try:
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f"router_{router_id}_health",
                {
                    "type": "connection_status",
                    "router_id": router_id,
                    "is_online": is_online,
                    "response_time": response_time,
                    "error_message": error_message,
                    "timestamp": timezone.now().isoformat()
                }
            )
        except Exception as e:
            logger.error(f"WebSocket connection status update failed: {str(e)}")

    @staticmethod
    def send_statistics_update(router_id, stats_data):
        """
        Send router statistics update.
        
        Args:
            router_id: ID of the router
            stats_data: Statistics data dictionary
        """
        try:
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f"router_{router_id}_health",
                {
                    "type": "statistics_update",
                    "router_id": router_id,
                    "stats_data": stats_data,
                    "timestamp": timezone.now().isoformat()
                }
            )
        except Exception as e:
            logger.error(f"WebSocket statistics update failed: {str(e)}")

    @staticmethod
    def send_user_session_update(router_id, user_type, action, user_data):
        """
        Send user session update (connect/disconnect).
        
        Args:
            router_id: ID of the router
            user_type: Type of user (hotspot, pppoe)
            action: Action (connected, disconnected)
            user_data: User session data
        """
        try:
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                "routers_global",
                {
                    "type": "user_session_update",
                    "router_id": router_id,
                    "user_type": user_type,
                    "action": action,
                    "user_data": user_data,
                    "timestamp": timezone.now().isoformat()
                }
            )
        except Exception as e:
            logger.error(f"WebSocket user session update failed: {str(e)}")

    @staticmethod
    def check_connection_health():
        """
        Check WebSocket connection health and log statistics.
        
        Returns:
            dict: Connection health status
        """
        try:
            # This would typically interface with your channel layer backend
            # For Redis, you might check connection count, etc.
            logger.info("WebSocket connection health check performed")
            return {
                "status": "healthy", 
                "timestamp": timezone.now().isoformat(),
                "message": "WebSocket connections are functioning normally"
            }
        except Exception as e:
            logger.error(f"WebSocket health check failed: {str(e)}")
            return {
                "status": "unhealthy", 
                "error": str(e),
                "timestamp": timezone.now().isoformat()
            }

    @staticmethod
    def get_connection_stats():
        """
        Get WebSocket connection statistics.
        
        Returns:
            dict: Connection statistics
        """
        try:
            # This would need to be implemented based on your channel layer backend
            # For Redis, you might get connection counts per group
            return {
                "total_connections": "N/A",  # Would be actual count in implementation
                "router_groups": "N/A",
                "health_groups": "N/A",
                "bulk_operation_groups": "N/A",
                "notification_groups": "N/A",
                "timestamp": timezone.now().isoformat()
            }
        except Exception as e:
            logger.error(f"Failed to get WebSocket connection stats: {str(e)}")
            return {
                "error": "Failed to retrieve connection statistics",
                "timestamp": timezone.now().isoformat()
            }


class WebSocketMessageValidator:
    """
    Utility class for validating WebSocket messages.
    """
    
    @staticmethod
    def validate_router_update_message(data):
        """
        Validate router update WebSocket message.
        
        Args:
            data: Message data to validate
            
        Returns:
            tuple: (is_valid, error_message)
        """
        required_fields = ['action', 'router_id']
        
        for field in required_fields:
            if field not in data:
                return False, f"Missing required field: {field}"
        
        if not isinstance(data['router_id'], (int, str)):
            return False, "router_id must be integer or string"
        
        valid_actions = ['created', 'updated', 'deleted', 'rebooted', 'status_changed']
        if data['action'] not in valid_actions:
            return False, f"Invalid action. Must be one of: {valid_actions}"
        
        return True, None

    @staticmethod
    def validate_health_update_message(data):
        """
        Validate health update WebSocket message.
        
        Args:
            data: Message data to validate
            
        Returns:
            tuple: (is_valid, error_message)
        """
        required_fields = ['router_id', 'health_info']
        
        for field in required_fields:
            if field not in data:
                return False, f"Missing required field: {field}"
        
        if not isinstance(data['health_info'], dict):
            return False, "health_info must be a dictionary"
        
        return True, None

    @staticmethod
    def sanitize_websocket_data(data):
        """
        Sanitize WebSocket data to prevent injection attacks.
        
        Args:
            data: Data to sanitize
            
        Returns:
            dict: Sanitized data
        """
        if not isinstance(data, dict):
            return {}
        
        sanitized = {}
        for key, value in data.items():
            if isinstance(value, str):
                # Basic sanitization - remove script tags and other dangerous content
                import re
                value = re.sub(r'<script.*?</script>', '', value, flags=re.IGNORECASE | re.DOTALL)
                value = re.sub(r'javascript:', '', value, flags=re.IGNORECASE)
                value = re.sub(r'on\w+=', '', value, flags=re.IGNORECASE)
            sanitized[key] = value
        
        return sanitized


class WebSocketConnectionManager:
    """
    Manager for WebSocket connection lifecycle.
    """
    
    @staticmethod
    def handle_connection_established(consumer, user, connection_id):
        """
        Handle new WebSocket connection.
        
        Args:
            consumer: WebSocket consumer instance
            user: User object
            connection_id: Unique connection ID
        """
        try:
            logger.info(f"WebSocket connection established: {connection_id} for user {user.username}")
            
            # Send connection confirmation
            consumer.send(text_data=json.dumps({
                'type': 'connection_established',
                'message': 'WebSocket connection established successfully',
                'connection_id': connection_id,
                'user': user.username,
                'timestamp': timezone.now().isoformat()
            }))
            
        except Exception as e:
            logger.error(f"Error handling connection establishment: {str(e)}")

    @staticmethod
    def handle_connection_lost(consumer, connection_id, close_code):
        """
        Handle WebSocket connection loss.
        
        Args:
            consumer: WebSocket consumer instance
            connection_id: Unique connection ID
            close_code: WebSocket close code
        """
        try:
            logger.info(f"WebSocket connection lost: {connection_id}, close code: {close_code}")
            
            # Perform any cleanup operations
            # Remove from groups, update connection status, etc.
            
        except Exception as e:
            logger.error(f"Error handling connection loss: {str(e)}")

    @staticmethod
    def handle_message_received(consumer, message_data, user):
        """
        Handle incoming WebSocket message.
        
        Args:
            consumer: WebSocket consumer instance
            message_data: Parsed message data
            user: User object
            
        Returns:
            bool: True if message was handled successfully
        """
        try:
            message_type = message_data.get('type', '')
            
            # Validate message type
            valid_types = ['ping', 'subscribe', 'unsubscribe', 'get_status']
            if message_type not in valid_types:
                consumer.send(text_data=json.dumps({
                    'type': 'error',
                    'message': f'Invalid message type: {message_type}',
                    'timestamp': timezone.now().isoformat()
                }))
                return False
            
            # Handle different message types
            if message_type == 'ping':
                consumer.send(text_data=json.dumps({
                    'type': 'pong',
                    'timestamp': timezone.now().isoformat()
                }))
            
            elif message_type == 'subscribe':
                group_name = message_data.get('group_name')
                if group_name:
                    async_to_sync(consumer.channel_layer.group_add)(
                        group_name,
                        consumer.channel_name
                    )
            
            elif message_type == 'unsubscribe':
                group_name = message_data.get('group_name')
                if group_name:
                    async_to_sync(consumer.channel_layer.group_discard)(
                        group_name,
                        consumer.channel_name
                    )
            
            return True
            
        except Exception as e:
            logger.error(f"Error handling WebSocket message: {str(e)}")
            consumer.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Error processing message',
                'timestamp': timezone.now().isoformat()
            }))
            return False