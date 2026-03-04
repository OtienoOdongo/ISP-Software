
// // Custom hook for WebSocket connections
// import { useState, useEffect, useCallback, useRef } from 'react';

// export const useWebSocket = (url, options = {}) => {
//   const [isConnected, setIsConnected] = useState(false);
//   const [lastMessage, setLastMessage] = useState(null);
//   const [error, setError] = useState(null);
//   const wsRef = useRef(null);
//   const reconnectTimeoutRef = useRef(null);

//   const { onMessage, onOpen, onClose, onError, reconnectInterval = 5000 } = options;

//   const connect = useCallback(() => {
//     try {
//       wsRef.current = new WebSocket(url);

//       wsRef.current.onopen = (event) => {
//         setIsConnected(true);
//         setError(null);
//         if (onOpen) onOpen(event);
//       };

//       wsRef.current.onclose = (event) => {
//         setIsConnected(false);
//         if (onClose) onClose(event);
        
//         // Attempt to reconnect
//         if (!event.wasClean) {
//           reconnectTimeoutRef.current = setTimeout(connect, reconnectInterval);
//         }
//       };

//       wsRef.current.onerror = (event) => {
//         setError('WebSocket error');
//         if (onError) onError(event);
//       };

//       wsRef.current.onmessage = (event) => {
//         try {
//           const data = JSON.parse(event.data);
//           setLastMessage(data);
//           if (onMessage) onMessage(data);
//         } catch (e) {
//           console.error('Failed to parse WebSocket message:', e);
//         }
//       };
//     } catch (e) {
//       setError('Failed to connect');
//       reconnectTimeoutRef.current = setTimeout(connect, reconnectInterval);
//     }
//   }, [url, onMessage, onOpen, onClose, onError, reconnectInterval]);

//   const disconnect = useCallback(() => {
//     if (reconnectTimeoutRef.current) {
//       clearTimeout(reconnectTimeoutRef.current);
//     }
//     if (wsRef.current) {
//       wsRef.current.close();
//       wsRef.current = null;
//     }
//     setIsConnected(false);
//   }, []);

//   const sendMessage = useCallback((data) => {
//     if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
//       wsRef.current.send(JSON.stringify(data));
//       return true;
//     }
//     return false;
//   }, []);

//   useEffect(() => {
//     connect();
//     return () => disconnect();
//   }, [connect, disconnect]);

//   return {
//     isConnected,
//     lastMessage,
//     error,
//     sendMessage,
//     disconnect,
//   };
// };









// src/hooks/useWebSocket.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { WEBSOCKET_ENABLED } from '../constants'

export const useWebSocket = (url, options = {}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const [error, setError] = useState(null);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  const { onMessage, onOpen, onClose, onError, reconnectInterval = 5000 } = options;

  const connect = useCallback(() => {
    // Don't attempt connection if WebSockets are disabled
    if (!WEBSOCKET_ENABLED) {
      console.log('WebSockets are disabled. Set WEBSOCKET_ENABLED=true to enable.');
      return;
    }

    try {
      wsRef.current = new WebSocket(url);

      wsRef.current.onopen = (event) => {
        setIsConnected(true);
        setError(null);
        if (onOpen) onOpen(event);
      };

      wsRef.current.onclose = (event) => {
        setIsConnected(false);
        if (onClose) onClose(event);
        
        // Attempt to reconnect if not closed cleanly
        if (!event.wasClean && WEBSOCKET_ENABLED) {
          reconnectTimeoutRef.current = setTimeout(connect, reconnectInterval);
        }
      };

      wsRef.current.onerror = (event) => {
        setError('WebSocket error');
        if (onError) onError(event);
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastMessage(data);
          if (onMessage) onMessage(data);
        } catch (e) {
          console.error('Failed to parse WebSocket message:', e);
        }
      };
    } catch (e) {
      setError('Failed to connect');
      if (WEBSOCKET_ENABLED) {
        reconnectTimeoutRef.current = setTimeout(connect, reconnectInterval);
      }
    }
  }, [url, onMessage, onOpen, onClose, onError, reconnectInterval]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const sendMessage = useCallback((data) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
      return true;
    }
    return false;
  }, []);

  useEffect(() => {
    if (WEBSOCKET_ENABLED) {
      connect();
      return () => disconnect();
    }
  }, [connect, disconnect]);

  return {
    isConnected: WEBSOCKET_ENABLED ? isConnected : false,
    lastMessage,
    error,
    sendMessage,
    disconnect,
    enabled: WEBSOCKET_ENABLED,
  };
};