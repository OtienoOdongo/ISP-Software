







// import { useState, useEffect, useCallback, useRef } from 'react';

// export const useWebSocket = (options = {}) => {
//   const {
//     url = 'ws://localhost:8000/ws/sms/status/', // Changed to status endpoint
//     autoConnect = true,
//     reconnectInterval = 5000,
//     maxReconnectAttempts = 10,
//     heartbeatInterval = 30000,
//     onOpen,
//     onClose,
//     onMessage,
//     onError
//   } = options;

//   const [isConnected, setIsConnected] = useState(false);
//   const [lastMessage, setLastMessage] = useState(null);
//   const [connectionError, setConnectionError] = useState(null);
//   const [reconnectAttempts, setReconnectAttempts] = useState(0);
//   const [connectionState, setConnectionState] = useState('disconnected');
  
//   const wsRef = useRef(null);
//   const reconnectTimeoutRef = useRef(null);
//   const heartbeatRef = useRef(null);
//   const mountedRef = useRef(true);
//   const messageQueueRef = useRef([]);

//   const connect = useCallback(() => {
//     if (!mountedRef.current) return;
    
//     if (wsRef.current) {
//       try {
//         wsRef.current.close();
//       } catch (e) {
//         console.error('Error closing existing connection:', e);
//       }
//     }

//     setConnectionState('connecting');
//     setConnectionError(null);

//     try {
//       // Add authentication token if available
//       const token = localStorage.getItem('access_token');
//       const wsUrl = token ? `${url}?token=${token}` : url;
      
//       wsRef.current = new WebSocket(wsUrl);
      
//       wsRef.current.onopen = () => {
//         if (!mountedRef.current) return;
        
//         console.log('WebSocket connected to', url);
//         setIsConnected(true);
//         setConnectionError(null);
//         setReconnectAttempts(0);
//         setConnectionState('connected');
        
//         // Send queued messages
//         while (messageQueueRef.current.length > 0) {
//           const message = messageQueueRef.current.shift();
//           wsRef.current.send(JSON.stringify(message));
//         }
        
//         // Start heartbeat
//         if (heartbeatInterval > 0) {
//           heartbeatRef.current = setInterval(() => {
//             if (wsRef.current?.readyState === WebSocket.OPEN) {
//               wsRef.current.send(JSON.stringify({ type: 'ping' }));
//             }
//           }, heartbeatInterval);
//         }
        
//         onOpen?.();
//       };
      
//       wsRef.current.onmessage = (event) => {
//         if (!mountedRef.current) return;
        
//         try {
//           const data = JSON.parse(event.data);
          
//           // Handle different message types
//           switch (data.type) {
//             case 'pong':
//               // Ignore pong messages
//               break;
//             case 'connection_established':
//               console.log('Connection established:', data.message);
//               break;
//             case 'error':
//               console.error('WebSocket error from server:', data.message);
//               setConnectionError(data.message);
//               break;
//             default:
//               setLastMessage(data);
//               onMessage?.(data);
//           }
//         } catch (error) {
//           console.error('Error parsing WebSocket message:', error);
//         }
//       };
      
//       wsRef.current.onclose = (event) => {
//         if (!mountedRef.current) return;
        
//         console.log('WebSocket disconnected:', event.code, event.reason);
//         setIsConnected(false);
//         setConnectionState('disconnected');
        
//         if (heartbeatRef.current) {
//           clearInterval(heartbeatRef.current);
//           heartbeatRef.current = null;
//         }
        
//         onClose?.(event);
        
//         // Attempt reconnection
//         if (reconnectAttempts < maxReconnectAttempts) {
//           const nextAttempts = reconnectAttempts + 1;
//           setReconnectAttempts(nextAttempts);
          
//           const delay = Math.min(
//             reconnectInterval * Math.pow(1.5, nextAttempts - 1),
//             30000
//           );
          
//           console.log(`Reconnecting in ${delay}ms (attempt ${nextAttempts}/${maxReconnectAttempts})`);
          
//           reconnectTimeoutRef.current = setTimeout(connect, delay);
//         } else {
//           setConnectionError('Max reconnection attempts reached');
//           setConnectionState('error');
//         }
//       };
      
//       wsRef.current.onerror = (error) => {
//         if (!mountedRef.current) return;
        
//         console.error('WebSocket error:', error);
//         setConnectionError('WebSocket connection error');
//         setConnectionState('error');
//         onError?.(error);
//       };
      
//     } catch (error) {
//       console.error('Failed to create WebSocket:', error);
//       setConnectionError('Failed to create WebSocket connection');
//       setConnectionState('error');
//       onError?.(error);
//     }
//   }, [url, reconnectInterval, maxReconnectAttempts, heartbeatInterval, onOpen, onClose, onMessage, onError]);

//   const sendMessage = useCallback((message) => {
//     if (wsRef.current?.readyState === WebSocket.OPEN) {
//       try {
//         wsRef.current.send(JSON.stringify(message));
//         return true;
//       } catch (e) {
//         console.error('Error sending message:', e);
//         return false;
//       }
//     } else {
//       messageQueueRef.current.push(message);
//       return false;
//     }
//   }, []);

//   const disconnect = useCallback(() => {
//     if (wsRef.current) {
//       try {
//         wsRef.current.close();
//       } catch (e) {
//         console.error('Error disconnecting:', e);
//       }
//     }
//     setConnectionState('disconnected');
//   }, []);

//   const reconnect = useCallback(() => {
//     setReconnectAttempts(0);
//     if (reconnectTimeoutRef.current) {
//       clearTimeout(reconnectTimeoutRef.current);
//       reconnectTimeoutRef.current = null;
//     }
//     connect();
//   }, [connect]);

//   useEffect(() => {
//     mountedRef.current = true;
    
//     if (autoConnect) {
//       connect();
//     }
    
//     return () => {
//       mountedRef.current = false;
      
//       if (wsRef.current) {
//         try {
//           wsRef.current.close();
//         } catch (e) {
//           console.error('Error closing WebSocket:', e);
//         }
//       }
      
//       if (reconnectTimeoutRef.current) {
//         clearTimeout(reconnectTimeoutRef.current);
//       }
      
//       if (heartbeatRef.current) {
//         clearInterval(heartbeatRef.current);
//       }
      
//       messageQueueRef.current = [];
//     };
//   }, [autoConnect, connect]);

//   return {
//     isConnected,
//     lastMessage,
//     connectionError,
//     connectionState,
//     reconnectAttempts,
//     sendMessage,
//     disconnect,
//     reconnect
//   };
// };









// import { useState, useEffect, useCallback, useRef } from 'react';

// export const useWebSocket = (options = {}) => {
//   const {
//     url = 'ws://localhost:8000/ws/sms/status/',
//     autoConnect = true,
//     reconnectInterval = 5000,
//     maxReconnectAttempts = 10,
//     heartbeatInterval = 30000,
//     onOpen,
//     onClose,
//     onMessage,
//     onError
//   } = options;

//   const [isConnected, setIsConnected] = useState(false);
//   const [lastMessage, setLastMessage] = useState(null);
//   const [connectionError, setConnectionError] = useState(null);
//   const [reconnectAttempts, setReconnectAttempts] = useState(0);
//   const [connectionState, setConnectionState] = useState('disconnected');
  
//   const wsRef = useRef(null);
//   const reconnectTimeoutRef = useRef(null);
//   const heartbeatRef = useRef(null);
//   const mountedRef = useRef(true);
//   const messageQueueRef = useRef([]);

//   const connect = useCallback(() => {
//     if (!mountedRef.current) return;
    
//     // Clear any existing reconnect timeout
//     if (reconnectTimeoutRef.current) {
//       clearTimeout(reconnectTimeoutRef.current);
//       reconnectTimeoutRef.current = null;
//     }
    
//     // Close existing connection
//     if (wsRef.current) {
//       try {
//         wsRef.current.close();
//       } catch (e) {
//         console.error('Error closing existing connection:', e);
//       }
//     }

//     setConnectionState('connecting');
//     setConnectionError(null);

//     try {
//       // Add authentication token if available
//       const token = localStorage.getItem('access_token');
//       const wsUrl = token ? `${url}?token=${token}` : url;
      
//       console.log(`Attempting WebSocket connection to: ${wsUrl}`);
//       wsRef.current = new WebSocket(wsUrl);
      
//       wsRef.current.onopen = () => {
//         if (!mountedRef.current) return;
        
//         console.log('✅ WebSocket connected successfully to', url);
//         setIsConnected(true);
//         setConnectionError(null);
//         setReconnectAttempts(0);
//         setConnectionState('connected');
        
//         // Send queued messages
//         while (messageQueueRef.current.length > 0) {
//           const message = messageQueueRef.current.shift();
//           try {
//             wsRef.current.send(JSON.stringify(message));
//           } catch (e) {
//             console.error('Error sending queued message:', e);
//           }
//         }
        
//         // Start heartbeat
//         if (heartbeatInterval > 0) {
//           heartbeatRef.current = setInterval(() => {
//             if (wsRef.current?.readyState === WebSocket.OPEN) {
//               try {
//                 wsRef.current.send(JSON.stringify({ type: 'ping' }));
//               } catch (e) {
//                 console.error('Error sending heartbeat:', e);
//               }
//             }
//           }, heartbeatInterval);
//         }
        
//         onOpen?.();
//       };
      
//       wsRef.current.onmessage = (event) => {
//         if (!mountedRef.current) return;
        
//         try {
//           const data = JSON.parse(event.data);
          
//           // Handle different message types
//           switch (data.type) {
//             case 'pong':
//               // Ignore pong messages
//               break;
//             case 'connection_established':
//               console.log('🔌 Connection established:', data.message);
//               break;
//             case 'error':
//               console.error('❌ WebSocket error from server:', data.message);
//               setConnectionError(data.message);
//               break;
//             default:
//               setLastMessage(data);
//               onMessage?.(data);
//           }
//         } catch (error) {
//           console.error('Error parsing WebSocket message:', error);
//         }
//       };
      
//       wsRef.current.onclose = (event) => {
//         if (!mountedRef.current) return;
        
//         console.log(`🔌 WebSocket disconnected: code=${event.code}, reason="${event.reason}"`);
        
//         // Common WebSocket close codes:
//         // 1000: Normal closure
//         // 1001: Going away
//         // 1002: Protocol error
//         // 1003: Unsupported data
//         // 1004: Reserved
//         // 1005: No status received
//         // 1006: Abnormal closure (most common error)
//         // 1007: Invalid frame payload data
//         // 1008: Policy violation
//         // 1009: Message too big
//         // 1010: Missing extension
//         // 1011: Internal error
//         // 1012: Service restart
//         // 1013: Try again later
//         // 1014: Bad gateway
//         // 1015: TLS handshake fail
        
//         setIsConnected(false);
//         setConnectionState('disconnected');
        
//         if (heartbeatRef.current) {
//           clearInterval(heartbeatRef.current);
//           heartbeatRef.current = null;
//         }
        
//         onClose?.(event);
        
//         // Attempt reconnection if not a normal closure
//         if (event.code !== 1000 && reconnectAttempts < maxReconnectAttempts) {
//           const nextAttempts = reconnectAttempts + 1;
//           setReconnectAttempts(nextAttempts);
          
//           // Exponential backoff with jitter
//           const baseDelay = reconnectInterval * Math.pow(1.5, nextAttempts - 1);
//           const jitter = Math.random() * 1000;
//           const delay = Math.min(baseDelay + jitter, 30000);
          
//           console.log(`🔄 Reconnecting in ${Math.round(delay)}ms (attempt ${nextAttempts}/${maxReconnectAttempts})`);
          
//           reconnectTimeoutRef.current = setTimeout(() => {
//             if (mountedRef.current) {
//               connect();
//             }
//           }, delay);
//         } else if (event.code !== 1000) {
//           setConnectionError(`Connection failed after ${maxReconnectAttempts} attempts`);
//           setConnectionState('error');
//         }
//       };
      
//       wsRef.current.onerror = (error) => {
//         if (!mountedRef.current) return;
        
//         console.error('❌ WebSocket error:', error);
//         setConnectionError('WebSocket connection error');
//         setConnectionState('error');
//         onError?.(error);
//       };
      
//     } catch (error) {
//       console.error('Failed to create WebSocket:', error);
//       setConnectionError('Failed to create WebSocket connection');
//       setConnectionState('error');
//       onError?.(error);
//     }
//   }, [url, reconnectInterval, maxReconnectAttempts, heartbeatInterval, onOpen, onClose, onMessage, onError]);

//   const sendMessage = useCallback((message) => {
//     if (wsRef.current?.readyState === WebSocket.OPEN) {
//       try {
//         wsRef.current.send(JSON.stringify(message));
//         return true;
//       } catch (e) {
//         console.error('Error sending message:', e);
//         return false;
//       }
//     } else {
//       messageQueueRef.current.push(message);
//       return false;
//     }
//   }, []);

//   const disconnect = useCallback(() => {
//     if (wsRef.current) {
//       try {
//         wsRef.current.close(1000, "Client disconnecting");
//       } catch (e) {
//         console.error('Error disconnecting:', e);
//       }
//     }
//     setConnectionState('disconnected');
//   }, []);

//   const reconnect = useCallback(() => {
//     setReconnectAttempts(0);
//     if (reconnectTimeoutRef.current) {
//       clearTimeout(reconnectTimeoutRef.current);
//       reconnectTimeoutRef.current = null;
//     }
//     connect();
//   }, [connect]);

//   useEffect(() => {
//     mountedRef.current = true;
    
//     if (autoConnect) {
//       // Small delay to ensure everything is ready
//       setTimeout(connect, 100);
//     }
    
//     return () => {
//       mountedRef.current = false;
      
//       if (wsRef.current) {
//         try {
//           wsRef.current.close(1000, "Component unmounting");
//         } catch (e) {
//           console.error('Error closing WebSocket:', e);
//         }
//       }
      
//       if (reconnectTimeoutRef.current) {
//         clearTimeout(reconnectTimeoutRef.current);
//       }
      
//       if (heartbeatRef.current) {
//         clearInterval(heartbeatRef.current);
//       }
      
//       messageQueueRef.current = [];
//     };
//   }, [autoConnect, connect]);

//   return {
//     isConnected,
//     lastMessage,
//     connectionError,
//     connectionState,
//     reconnectAttempts,
//     sendMessage,
//     disconnect,
//     reconnect
//   };
// };















import { useState, useEffect, useCallback, useRef } from 'react';

export const useWebSocket = (options = {}) => {
  const {
    url = 'ws://localhost:8000/ws/sms/status/',
    autoConnect = true,
    reconnectInterval = 5000,
    maxReconnectAttempts = 10,
    heartbeatInterval = 30000,
    onOpen,
    onClose,
    onMessage,
    onError
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const [connectionError, setConnectionError] = useState(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [connectionState, setConnectionState] = useState('disconnected');
  
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const heartbeatRef = useRef(null);
  const mountedRef = useRef(true);
  const messageQueueRef = useRef([]);
  const reconnectAttemptsRef = useRef(0);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      try {
        wsRef.current.close(1000, "Client disconnecting");
      } catch (e) {
        console.error('Error disconnecting:', e);
      }
    }
    setConnectionState('disconnected');
  }, []);

  const connect = useCallback(() => {
    if (!mountedRef.current) return;
    
    // Clear any existing reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    // Close existing connection
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch (e) {
        console.error('Error closing existing connection:', e);
      }
    }

    setConnectionState('connecting');
    setConnectionError(null);

    try {
      // Get authentication token
      const token = localStorage.getItem('access_token');
      
      // Build WebSocket URL with token
      const wsUrl = new URL(url, window.location.origin);
      if (token) {
        wsUrl.searchParams.append('token', token);
      }
      
      console.log(`Attempting WebSocket connection to: ${wsUrl.toString()}`);
      wsRef.current = new WebSocket(wsUrl.toString());
      
      wsRef.current.onopen = () => {
        if (!mountedRef.current) return;
        
        console.log('✅ WebSocket connected successfully');
        setIsConnected(true);
        setConnectionError(null);
        setReconnectAttempts(0);
        reconnectAttemptsRef.current = 0;
        setConnectionState('connected');
        
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
        
        onOpen?.();
      };
      
      wsRef.current.onmessage = (event) => {
        if (!mountedRef.current) return;
        
        try {
          const data = JSON.parse(event.data);
          
          switch (data.type) {
            case 'pong':
              break;
            case 'connection_established':
              console.log('🔌 Connection established:', data.message);
              break;
            case 'error':
              console.error('❌ WebSocket error from server:', data.message);
              setConnectionError(data.message);
              break;
            default:
              setLastMessage(data);
              onMessage?.(data);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      wsRef.current.onclose = (event) => {
        if (!mountedRef.current) return;
        
        console.log(`🔌 WebSocket disconnected: code=${event.code}, reason="${event.reason || 'No reason'}"`);
        
        setIsConnected(false);
        setConnectionState('disconnected');
        
        if (heartbeatRef.current) {
          clearInterval(heartbeatRef.current);
          heartbeatRef.current = null;
        }
        
        onClose?.(event);
        
        // Don't reconnect if component unmounting or normal closure
        if (!mountedRef.current || event.code === 1000) return;
        
        // Attempt reconnection
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current += 1;
          setReconnectAttempts(reconnectAttemptsRef.current);
          
          // Exponential backoff with jitter
          const baseDelay = reconnectInterval * Math.pow(1.5, reconnectAttemptsRef.current - 1);
          const jitter = Math.random() * 2000;
          const delay = Math.min(baseDelay + jitter, 30000);
          
          console.log(`🔄 Reconnecting in ${Math.round(delay)}ms (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            if (mountedRef.current) {
              connect();
            }
          }, delay);
        } else {
          setConnectionError(`Connection failed after ${maxReconnectAttempts} attempts`);
          setConnectionState('error');
        }
      };
      
      wsRef.current.onerror = (error) => {
        if (!mountedRef.current) return;
        
        console.error('❌ WebSocket error:', error);
        setConnectionError('WebSocket connection error');
        setConnectionState('error');
        onError?.(error);
      };
      
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      setConnectionError('Failed to create WebSocket connection');
      setConnectionState('error');
      onError?.(error);
    }
  }, [url, reconnectInterval, maxReconnectAttempts, heartbeatInterval, onOpen, onClose, onMessage, onError]);

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

  const reconnect = useCallback(() => {
    reconnectAttemptsRef.current = 0;
    setReconnectAttempts(0);
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    connect();
  }, [connect]);

  useEffect(() => {
    mountedRef.current = true;
    reconnectAttemptsRef.current = 0;
    
    if (autoConnect) {
      // Small delay to ensure everything is ready
      setTimeout(connect, 100);
    }
    
    return () => {
      mountedRef.current = false;
      
      if (wsRef.current) {
        try {
          wsRef.current.close(1000, "Component unmounting");
        } catch (e) {
          console.error('Error closing WebSocket:', e);
        }
      }
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
      }
      
      messageQueueRef.current = [];
    };
  }, [autoConnect, connect]);

  return {
    isConnected,
    lastMessage,
    connectionError,
    connectionState,
    reconnectAttempts,
    sendMessage,
    disconnect,
    reconnect
  };
};