import { useState, useEffect, useCallback, useRef } from 'react';
import { WEBSOCKET_CONFIG } from '../constants/apiEndpoints'

export const useWebSocket = (options = {}) => {
  const {
    url = WEBSOCKET_CONFIG.URL,
    reconnectInterval = WEBSOCKET_CONFIG.RECONNECT_INTERVAL,
    maxReconnectAttempts = WEBSOCKET_CONFIG.MAX_RECONNECT_ATTEMPTS,
    heartbeatInterval = WEBSOCKET_CONFIG.HEARTBEAT_INTERVAL,
    autoConnect = true
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [realTimeUpdates, setRealTimeUpdates] = useState(null);
  const [connectionError, setConnectionError] = useState(null);
  
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const heartbeatIntervalRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const messageListenersRef = useRef(new Map());

  // Connect to WebSocket
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
    try {
      wsRef.current = new WebSocket(url);
      
      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setConnectionError(null);
        reconnectAttemptsRef.current = 0;
        
        // Start heartbeat
        heartbeatIntervalRef.current = setInterval(() => {
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            sendMessage({ type: 'ping' });
          }
        }, heartbeatInterval);
        
        // Notify listeners
        notifyListeners({ type: 'connection', status: 'connected' });
      };
      
      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Handle pong response
          if (data.type === 'pong') {
            return;
          }
          
          // Update state for general updates
          setRealTimeUpdates(data);
          
          // Notify specific listeners
          notifyListeners(data);
          
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      wsRef.current.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        
        // Clear heartbeat
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
        }
        
        // Notify listeners
        notifyListeners({ type: 'connection', status: 'disconnected' });
        
        // Attempt reconnection
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          const delay = Math.min(
            reconnectInterval * Math.pow(1.5, reconnectAttemptsRef.current),
            30000
          );
          
          console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else {
          console.error('Max reconnection attempts reached');
          setConnectionError('Unable to reconnect to server');
          notifyListeners({ 
            type: 'connection', 
            status: 'failed',
            message: 'Unable to reconnect to server'
          });
        }
      };
      
      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionError('WebSocket connection error');
        notifyListeners({ type: 'connection', status: 'error' });
      };
      
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      setConnectionError('Failed to create WebSocket connection');
    }
  }, [url, reconnectInterval, maxReconnectAttempts, heartbeatInterval]);

  // Send message through WebSocket
  const sendMessage = useCallback((message) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      return true;
    }
    return false;
  }, []);

  // Subscribe to specific message type
  const subscribe = useCallback((messageType, callback) => {
    if (!messageType || typeof callback !== 'function') return;
    
    const listeners = messageListenersRef.current.get(messageType) || new Set();
    listeners.add(callback);
    messageListenersRef.current.set(messageType, listeners);
    
    // Return unsubscribe function
    return () => {
      const listeners = messageListenersRef.current.get(messageType);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          messageListenersRef.current.delete(messageType);
        }
      }
    };
  }, []);

  // Unsubscribe from message type
  const unsubscribe = useCallback((messageType, callback) => {
    const listeners = messageListenersRef.current.get(messageType);
    if (listeners) {
      listeners.delete(callback);
      if (listeners.size === 0) {
        messageListenersRef.current.delete(messageType);
      }
    }
  }, []);

  // Notify all listeners for a message type
  const notifyListeners = useCallback((message) => {
    // Notify all listeners for this message type
    const typeListeners = messageListenersRef.current.get(message.type);
    if (typeListeners) {
      typeListeners.forEach(callback => {
        try {
          callback(message);
        } catch (error) {
          console.error('Error in WebSocket listener:', error);
        }
      });
    }
    
    // Notify wildcard listeners
    const wildcardListeners = messageListenersRef.current.get('*');
    if (wildcardListeners) {
      wildcardListeners.forEach(callback => {
        try {
          callback(message);
        } catch (error) {
          console.error('Error in WebSocket wildcard listener:', error);
        }
      });
    }
  }, []);

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

  // Reconnect manually
  const reconnect = useCallback(() => {
    reconnectAttemptsRef.current = 0;
    connect();
  }, [connect]);

  // Disconnect manually
  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    setIsConnected(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    if (autoConnect) {
      connect();
    }
    
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
      
      // Clear all listeners
      messageListenersRef.current.clear();
    };
  }, [connect, autoConnect]);

  return {
    isConnected,
    realTimeUpdates,
    connectionError,
    sendMessage,
    subscribe,
    unsubscribe,
    getConnectionStatus,
    reconnect,
    disconnect,
    
    // Convenience methods for common subscriptions
    subscribeToGateway: (gatewayId, callback) => 
      subscribe(`gateway_${gatewayId}`, callback),
    
    unsubscribeFromGateway: (gatewayId, callback) => 
      unsubscribe(`gateway_${gatewayId}`, callback),
    
    subscribeToMessage: (messageId, callback) => 
      subscribe(`message_${messageId}`, callback),
    
    unsubscribeFromMessage: (messageId, callback) => 
      unsubscribe(`message_${messageId}`, callback)
  };
};