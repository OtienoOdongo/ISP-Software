import React, { useEffect, useCallback, useRef } from 'react';
import { Wifi, WifiOff, RefreshCw, AlertCircle } from 'lucide-react';

const WebSocketManager = ({ onMessage, theme }) => {
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const heartbeatIntervalRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  
  const MAX_RECONNECT_ATTEMPTS = 10;
  const RECONNECT_INTERVAL = 5000;
  const HEARTBEAT_INTERVAL = 30000;

  const connect = useCallback(() => {
    // Close existing connection
    if (wsRef.current) {
      wsRef.current.close();
    }
    
    // Clear existing timeouts
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }
    
    // Create new WebSocket connection
    const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:8000/ws/sms/';
    wsRef.current = new WebSocket(wsUrl);
    
    wsRef.current.onopen = () => {
      console.log('WebSocket connected');
      reconnectAttemptsRef.current = 0;
      
      // Start heartbeat
      heartbeatIntervalRef.current = setInterval(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: 'ping' }));
        }
      }, HEARTBEAT_INTERVAL);
      
      // Notify parent
      onMessage?.({ type: 'connection', status: 'connected' });
    };
    
    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Handle pong response
        if (data.type === 'pong') {
          return;
        }
        
        // Pass message to parent
        onMessage?.(data);
        
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    wsRef.current.onclose = (event) => {
      console.log('WebSocket disconnected:', event.code, event.reason);
      
      // Clear heartbeat
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
      
      // Notify parent
      onMessage?.({ type: 'connection', status: 'disconnected' });
      
      // Attempt reconnection
      if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttemptsRef.current++;
        const delay = Math.min(
          RECONNECT_INTERVAL * Math.pow(1.5, reconnectAttemptsRef.current),
          30000
        );
        
        console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current})`);
        
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, delay);
      } else {
        console.error('Max reconnection attempts reached');
        onMessage?.({ 
          type: 'connection', 
          status: 'failed',
          message: 'Unable to reconnect to server'
        });
      }
    };
    
    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      onMessage?.({ type: 'connection', status: 'error' });
    };
  }, [onMessage]);

  // Send message through WebSocket
  const sendMessage = useCallback((message) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      return true;
    }
    return false;
  }, []);

  // Subscribe to specific message
  const subscribeToMessage = useCallback((messageId) => {
    return sendMessage({
      type: 'subscribe_message',
      message_id: messageId
    });
  }, [sendMessage]);

  // Unsubscribe from message
  const unsubscribeFromMessage = useCallback((messageId) => {
    return sendMessage({
      type: 'unsubscribe_message',
      message_id: messageId
    });
  }, [sendMessage]);

  // Get connection status
  const getConnectionStatus = useCallback(() => {
    if (!wsRef.current) return 'disconnected';
    
    switch (wsRef.current.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting';
      case WebSocket.OPEN:
        return 'connected';
      case WebSocket.CLOSING:
        return 'closing';
      case WebSocket.CLOSED:
        return 'disconnected';
      default:
        return 'unknown';
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    connect();
    
    return () => {
      // Close WebSocket
      if (wsRef.current) {
        wsRef.current.close();
      }
      
      // Clear timeouts and intervals
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
    };
  }, [connect]);

  return {
    sendMessage,
    subscribeToMessage,
    unsubscribeFromMessage,
    getConnectionStatus,
    reconnect: () => {
      reconnectAttemptsRef.current = 0;
      connect();
    }
  };
};

export default WebSocketManager;