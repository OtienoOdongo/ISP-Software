// import React, { useEffect, useCallback, useRef } from 'react';
// import { Wifi, WifiOff, RefreshCw, AlertCircle } from 'lucide-react';

// const WebSocketManager = ({ onMessage, theme }) => {
//   const wsRef = useRef(null);
//   const reconnectTimeoutRef = useRef(null);
//   const heartbeatIntervalRef = useRef(null);
//   const reconnectAttemptsRef = useRef(0);
  
//   const MAX_RECONNECT_ATTEMPTS = 10;
//   const RECONNECT_INTERVAL = 5000;
//   const HEARTBEAT_INTERVAL = 30000;

//   const connect = useCallback(() => {
//     // Close existing connection
//     if (wsRef.current) {
//       wsRef.current.close();
//     }
    
//     // Clear existing timeouts
//     if (reconnectTimeoutRef.current) {
//       clearTimeout(reconnectTimeoutRef.current);
//     }
//     if (heartbeatIntervalRef.current) {
//       clearInterval(heartbeatIntervalRef.current);
//     }
    
//     // Create new WebSocket connection
//     const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:8000/ws/sms/';
//     wsRef.current = new WebSocket(wsUrl);
    
//     wsRef.current.onopen = () => {
//       console.log('WebSocket connected');
//       reconnectAttemptsRef.current = 0;
      
//       // Start heartbeat
//       heartbeatIntervalRef.current = setInterval(() => {
//         if (wsRef.current?.readyState === WebSocket.OPEN) {
//           wsRef.current.send(JSON.stringify({ type: 'ping' }));
//         }
//       }, HEARTBEAT_INTERVAL);
      
//       // Notify parent
//       onMessage?.({ type: 'connection', status: 'connected' });
//     };
    
//     wsRef.current.onmessage = (event) => {
//       try {
//         const data = JSON.parse(event.data);
        
//         // Handle pong response
//         if (data.type === 'pong') {
//           return;
//         }
        
//         // Pass message to parent
//         onMessage?.(data);
        
//       } catch (error) {
//         console.error('Error parsing WebSocket message:', error);
//       }
//     };
    
//     wsRef.current.onclose = (event) => {
//       console.log('WebSocket disconnected:', event.code, event.reason);
      
//       // Clear heartbeat
//       if (heartbeatIntervalRef.current) {
//         clearInterval(heartbeatIntervalRef.current);
//       }
      
//       // Notify parent
//       onMessage?.({ type: 'connection', status: 'disconnected' });
      
//       // Attempt reconnection
//       if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
//         reconnectAttemptsRef.current++;
//         const delay = Math.min(
//           RECONNECT_INTERVAL * Math.pow(1.5, reconnectAttemptsRef.current),
//           30000
//         );
        
//         console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current})`);
        
//         reconnectTimeoutRef.current = setTimeout(() => {
//           connect();
//         }, delay);
//       } else {
//         console.error('Max reconnection attempts reached');
//         onMessage?.({ 
//           type: 'connection', 
//           status: 'failed',
//           message: 'Unable to reconnect to server'
//         });
//       }
//     };
    
//     wsRef.current.onerror = (error) => {
//       console.error('WebSocket error:', error);
//       onMessage?.({ type: 'connection', status: 'error' });
//     };
//   }, [onMessage]);

//   // Send message through WebSocket
//   const sendMessage = useCallback((message) => {
//     if (wsRef.current?.readyState === WebSocket.OPEN) {
//       wsRef.current.send(JSON.stringify(message));
//       return true;
//     }
//     return false;
//   }, []);

//   // Subscribe to specific message
//   const subscribeToMessage = useCallback((messageId) => {
//     return sendMessage({
//       type: 'subscribe_message',
//       message_id: messageId
//     });
//   }, [sendMessage]);

//   // Unsubscribe from message
//   const unsubscribeFromMessage = useCallback((messageId) => {
//     return sendMessage({
//       type: 'unsubscribe_message',
//       message_id: messageId
//     });
//   }, [sendMessage]);

//   // Get connection status
//   const getConnectionStatus = useCallback(() => {
//     if (!wsRef.current) return 'disconnected';
    
//     switch (wsRef.current.readyState) {
//       case WebSocket.CONNECTING:
//         return 'connecting';
//       case WebSocket.OPEN:
//         return 'connected';
//       case WebSocket.CLOSING:
//         return 'closing';
//       case WebSocket.CLOSED:
//         return 'disconnected';
//       default:
//         return 'unknown';
//     }
//   }, []);

//   // Cleanup on unmount
//   useEffect(() => {
//     connect();
    
//     return () => {
//       // Close WebSocket
//       if (wsRef.current) {
//         wsRef.current.close();
//       }
      
//       // Clear timeouts and intervals
//       if (reconnectTimeoutRef.current) {
//         clearTimeout(reconnectTimeoutRef.current);
//       }
//       if (heartbeatIntervalRef.current) {
//         clearInterval(heartbeatIntervalRef.current);
//       }
//     };
//   }, [connect]);

//   return {
//     sendMessage,
//     subscribeToMessage,
//     unsubscribeFromMessage,
//     getConnectionStatus,
//     reconnect: () => {
//       reconnectAttemptsRef.current = 0;
//       connect();
//     }
//   };
// };

// export default WebSocketManager;








import React, { useEffect, useCallback, useRef } from 'react';
import { Wifi, WifiOff, RefreshCw, AlertCircle } from 'lucide-react';

/**
 * WebSocket Manager for real-time SMS updates
 * Handles connection, reconnection, heartbeat, and message routing
 */
const WebSocketManager = ({ 
  onMessage, 
  onStatusChange,
  theme,
  autoConnect = true,
  url = null,
  reconnectInterval = 5000,
  maxReconnectAttempts = 10,
  heartbeatInterval = 30000
}) => {
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const heartbeatRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const mountedRef = useRef(true);
  const messageQueueRef = useRef([]);

  // Connection status
  const [status, setStatus] = React.useState('disconnected');
  const [error, setError] = React.useState(null);

  // Get WebSocket URL
  const getWebSocketUrl = useCallback(() => {
    if (url) return url;
    
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = process.env.NODE_ENV === 'production' 
      ? window.location.host
      : 'localhost:8000';
    
    // Add authentication token if available
    const token = localStorage.getItem('access_token');
    const baseUrl = `${protocol}//${host}/ws/sms/status/`;
    
    return token ? `${baseUrl}?token=${token}` : baseUrl;
  }, [url]);

  // Connect WebSocket
  const connect = useCallback(() => {
    if (!mountedRef.current || !autoConnect) return;

    // Clear existing connection and timeouts
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch (e) {
        console.error('Error closing existing connection:', e);
      }
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }

    setStatus('connecting');
    setError(null);
    onStatusChange?.('connecting');

    try {
      const wsUrl = getWebSocketUrl();
      console.log(`🌐 Connecting to WebSocket: ${wsUrl}`);
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        if (!mountedRef.current) return;

        console.log('✅ WebSocket connected');
        setStatus('connected');
        setError(null);
        reconnectAttemptsRef.current = 0;
        onStatusChange?.('connected');

        // Send queued messages
        while (messageQueueRef.current.length > 0) {
          const message = messageQueueRef.current.shift();
          try {
            wsRef.current.send(JSON.stringify(message));
          } catch (e) {
            console.error('Error sending queued message:', e);
          }
        }

        // Start heartbeat
        if (heartbeatInterval > 0) {
          heartbeatRef.current = setInterval(() => {
            if (wsRef.current?.readyState === WebSocket.OPEN) {
              try {
                wsRef.current.send(JSON.stringify({ type: 'ping' }));
              } catch (e) {
                console.error('Error sending heartbeat:', e);
              }
            }
          }, heartbeatInterval);
        }
      };

      wsRef.current.onmessage = (event) => {
        if (!mountedRef.current) return;

        try {
          const data = JSON.parse(event.data);

          // Handle system messages
          switch (data.type) {
            case 'pong':
              // Heartbeat response, ignore
              break;
            case 'connection_established':
              console.log('🔌 Connection established:', data.message);
              break;
            case 'error':
              console.error('❌ WebSocket error from server:', data.message);
              setError(data.message);
              onStatusChange?.('error', data.message);
              break;
            default:
              // Pass to parent handler
              onMessage?.(data);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      wsRef.current.onclose = (event) => {
        if (!mountedRef.current) return;

        console.log(`🔌 WebSocket disconnected: code=${event.code}, reason="${event.reason || 'No reason'}"`);

        setStatus('disconnected');
        onStatusChange?.('disconnected');

        if (heartbeatRef.current) {
          clearInterval(heartbeatRef.current);
          heartbeatRef.current = null;
        }

        // Don't reconnect if normal closure or unmounting
        if (!mountedRef.current || event.code === 1000) return;

        // Attempt reconnection
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          
          // Exponential backoff with jitter
          const baseDelay = reconnectInterval * Math.pow(1.5, reconnectAttemptsRef.current - 1);
          const jitter = Math.random() * 2000;
          const delay = Math.min(baseDelay + jitter, 30000);

          console.log(`🔄 Reconnecting in ${Math.round(delay)}ms (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);

          setStatus('reconnecting');
          onStatusChange?.('reconnecting', reconnectAttemptsRef.current);

          reconnectTimeoutRef.current = setTimeout(() => {
            if (mountedRef.current) {
              connect();
            }
          }, delay);
        } else {
          setError(`Connection failed after ${maxReconnectAttempts} attempts`);
          setStatus('failed');
          onStatusChange?.('failed');
        }
      };

      wsRef.current.onerror = (error) => {
        if (!mountedRef.current) return;

        console.error('❌ WebSocket error:', error);
        setError('WebSocket connection error');
        setStatus('error');
        onStatusChange?.('error');
      };

    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      setError('Failed to create WebSocket connection');
      setStatus('error');
      onStatusChange?.('error', error.message);
    }
  }, [autoConnect, getWebSocketUrl, heartbeatInterval, maxReconnectAttempts, onMessage, onStatusChange, reconnectInterval]);

  // Disconnect WebSocket
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }

    if (wsRef.current) {
      try {
        wsRef.current.close(1000, "Client disconnecting");
      } catch (e) {
        console.error('Error disconnecting:', e);
      }
    }

    setStatus('disconnected');
    onStatusChange?.('disconnected');
    messageQueueRef.current = [];
  }, [onStatusChange]);

  // Send message
  const sendMessage = useCallback((message) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify(message));
        return true;
      } catch (e) {
        console.error('Error sending message:', e);
        return false;
      }
    } else {
      messageQueueRef.current.push(message);
      return false;
    }
  }, []);

  // Reconnect manually
  const reconnect = useCallback(() => {
    reconnectAttemptsRef.current = 0;
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    connect();
  }, [connect]);

  // Get connection status
  const getConnectionStatus = useCallback(() => {
    return {
      status,
      isConnected: status === 'connected',
      isConnecting: status === 'connecting' || status === 'reconnecting',
      error,
      reconnectAttempts: reconnectAttemptsRef.current
    };
  }, [status, error]);

  // Subscribe to specific message updates
  const subscribeToMessage = useCallback((messageId) => {
    return sendMessage({
      type: 'subscribe_message',
      message_id: messageId
    });
  }, [sendMessage]);

  // Unsubscribe from message updates
  const unsubscribeFromMessage = useCallback((messageId) => {
    return sendMessage({
      type: 'unsubscribe_message',
      message_id: messageId
    });
  }, [sendMessage]);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;

    if (autoConnect) {
      // Small delay to ensure everything is ready
      setTimeout(connect, 100);
    }

    return () => {
      mountedRef.current = false;
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    status,
    isConnected: status === 'connected',
    isConnecting: status === 'connecting' || status === 'reconnecting',
    error,
    reconnectAttempts: reconnectAttemptsRef.current,
    sendMessage,
    disconnect,
    reconnect,
    getConnectionStatus,
    subscribeToMessage,
    unsubscribeFromMessage
  };
};

export default WebSocketManager;