





// // src/hooks/useNetworkData.js - FIXED VERSION
// import { useState, useEffect, useCallback } from 'react';
// import { calculatePerformanceMetrics } from '../../utils/networkUtils';

// // Enhanced API service with proper error handling
// const networkAPI = {
//   async getRouterStats(routerId) {
//     const response = await fetch(`/api/network_management/routers/${routerId}/status/`, {
//       headers: {
//         'Authorization': `Bearer ${localStorage.getItem('token')}`,
//         'Content-Type': 'application/json'
//       },
//       timeout: 10000 // 10 second timeout
//     });
    
//     if (!response.ok) {
//       throw new Error(`Failed to fetch router stats: ${response.statusText}`);
//     }
    
//     return await response.json();
//   },

//   async getHealthMonitoring(optimizeForMobile = false) {
//     const params = optimizeForMobile ? '?fields=basic' : '';
//     const response = await fetch(`/api/network_management/health-monitoring/${params}`, {
//       headers: {
//         'Authorization': `Bearer ${localStorage.getItem('token')}`,
//         'Content-Type': 'application/json'
//       },
//       timeout: 15000
//     });
    
//     if (!response.ok) {
//       throw new Error(`Failed to fetch health data: ${response.statusText}`);
//     }
    
//     return await response.json();
//   },

//   async getRouters(optimizeForMobile = false) {
//     const params = optimizeForMobile ? '?fields=id,name,ip,connection_status' : '';
//     const response = await fetch(`/api/network_management/routers/${params}`, {
//       headers: {
//         'Authorization': `Bearer ${localStorage.getItem('token')}`,
//         'Content-Type': 'application/json'
//       },
//       timeout: 10000
//     });
    
//     if (!response.ok) {
//       throw new Error(`Failed to fetch routers: ${response.statusText}`);
//     }
    
//     return await response.json();
//   }
// };

// export const useNetworkData = (routers = [], activeRouterId = null) => {
//   const [networkData, setNetworkData] = useState({
//     connectedRouters: 0,
//     activeSessions: 0,
//     systemHealth: 100,
//     performanceMetrics: {
//       avgCpu: 0,
//       avgMemory: 0,
//       totalThroughput: 0,
//       activeConnections: 0
//     },
//     lastUpdate: new Date()
//   });
  
//   const [routerStats, setRouterStats] = useState({});
//   const [healthData, setHealthData] = useState([]);
//   const [historicalData, setHistoricalData] = useState({});
//   const [webSocketConnected, setWebSocketConnected] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [screenSize, setScreenSize] = useState('desktop');
//   const [reconnectAttempts, setReconnectAttempts] = useState(0);
//   const maxReconnectAttempts = 5;

//   // Detect screen size for responsive data loading
//   useEffect(() => {
//     const checkScreenSize = () => {
//       const width = window.innerWidth;
//       if (width < 640) setScreenSize('mobile');
//       else if (width < 1024) setScreenSize('tablet');
//       else setScreenSize('desktop');
//     };

//     checkScreenSize();
//     window.addEventListener('resize', checkScreenSize);
//     return () => window.removeEventListener('resize', checkScreenSize);
//   }, []);

//   // Optimize data loading based on screen size
//   const fetchInitialData = useCallback(async () => {
//     setIsLoading(true);
//     setError(null);
    
//     try {
//       const optimizeForMobile = screenSize === 'mobile';
      
//       // Fetch routers with optimized fields for mobile
//       let routersData = routers;
//       if (!routers.length) {
//         routersData = await networkAPI.getRouters(optimizeForMobile);
//       }

//       // Fetch health monitoring data with optimization
//       const healthData = await networkAPI.getHealthMonitoring(optimizeForMobile);
//       setHealthData(healthData);

//       // Calculate system-wide metrics
//       const systemMetrics = calculatePerformanceMetrics(routersData);
      
//       setNetworkData(prev => ({ 
//         ...prev, 
//         ...systemMetrics,
//         lastUpdate: new Date()
//       }));

//       // Fetch stats for active router if specified
//       if (activeRouterId) {
//         const stats = await networkAPI.getRouterStats(activeRouterId);
//         setRouterStats(prev => ({ ...prev, [activeRouterId]: stats }));
//       }

//     } catch (err) {
//       console.error('Error fetching network data:', err);
//       setError(err.message);
      
//       // Don't show error toast for timeouts, just log
//       if (!err.message.includes('timeout')) {
//         console.error('Network data fetch error:', err);
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   }, [routers, activeRouterId, screenSize]);

//   // Refresh data function with screen size awareness
//   const refreshData = useCallback(async () => {
//     await fetchInitialData();
//   }, [fetchInitialData]);

//   // FIXED WebSocket connection with proper URL and error handling
//   useEffect(() => {
//     let ws = null;
//     let reconnectTimeout = null;

//     const connectWebSocket = () => {
//       // FIX: Use the correct WebSocket URL - connect to backend port (8000), not frontend (5173)
//       const isProduction = import.meta.env.PROD;
//       const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      
//       // FIX: Always connect to backend on port 8000 in development
//       let wsUrl;
//       if (isProduction) {
//         wsUrl = `${protocol}//${window.location.host}/ws/routers/`;
//       } else {
//         // In development, frontend runs on 5173, backend on 8000
//         wsUrl = 'ws://localhost:8000/ws/routers/';
//       }

//       console.log('🔌 Connecting to WebSocket:', wsUrl);
      
//       try {
//         ws = new WebSocket(wsUrl);
        
//         ws.onopen = () => {
//           console.log('✅ WebSocket connected successfully');
//           setWebSocketConnected(true);
//           setReconnectAttempts(0); // Reset reconnect attempts on successful connection
//         };
        
//         ws.onmessage = (event) => {
//           try {
//             const data = JSON.parse(event.data);
//             console.log('📨 WebSocket message received:', data.type);
            
//             // Handle different message types from backend
//             switch (data.type) {
//               case 'router_update':
//                 if (data.router_id) {
//                   setRouterStats(prev => ({
//                     ...prev,
//                     [data.router_id]: { ...prev[data.router_id], ...data.data }
//                   }));
//                 }
//                 break;
                
//               case 'health_update':
//                 setHealthData(prev => 
//                   prev.map(health => 
//                     health.router_id === data.router_id ? { ...health, ...data.data } : health
//                   )
//                 );
//                 break;
                
//               case 'connection_test_update':
//                 if (data.router_id === activeRouterId) {
//                   setRouterStats(prev => ({
//                     ...prev,
//                     [data.router_id]: { 
//                       ...prev[data.router_id], 
//                       connection_test: data.data 
//                     }
//                   }));
//                 }
//                 break;
                
//               case 'system_metrics_update':
//                 setNetworkData(prev => ({
//                   ...prev,
//                   ...data.data,
//                   lastUpdate: new Date()
//                 }));
//                 break;
                
//               case 'connection_established':
//                 console.log('✅ WebSocket connection confirmed by server');
//                 break;
                
//               default:
//                 console.log('Unknown WebSocket message type:', data.type);
//             }
//           } catch (err) {
//             console.error('❌ Error processing WebSocket message:', err);
//           }
//         };
        
//         ws.onclose = (event) => {
//           console.log('🔌 WebSocket disconnected:', event.code, event.reason);
//           setWebSocketConnected(false);
          
//           // Only attempt reconnection if we haven't exceeded max attempts
//           if (reconnectAttempts < maxReconnectAttempts) {
//             const reconnectDelay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
//             console.log(`🔄 Attempting reconnection in ${reconnectDelay}ms (attempt ${reconnectAttempts + 1}/${maxReconnectAttempts})`);
            
//             reconnectTimeout = setTimeout(() => {
//               setReconnectAttempts(prev => prev + 1);
//               connectWebSocket();
//             }, reconnectDelay);
//           } else {
//             console.error('❌ Max reconnection attempts reached. WebSocket connection failed.');
//           }
//         };
        
//         ws.onerror = (error) => {
//           console.error('❌ WebSocket error:', error);
//           setWebSocketConnected(false);
//         };

//       } catch (error) {
//         console.error('❌ Failed to create WebSocket connection:', error);
//         setWebSocketConnected(false);
//       }
//     };

//     // Only connect WebSocket on larger screens or when specifically needed
//     if (screenSize !== 'mobile' || activeRouterId) {
//       connectWebSocket();
//     }

//     // Cleanup function
//     return () => {
//       if (reconnectTimeout) {
//         clearTimeout(reconnectTimeout);
//       }
//       if (ws) {
//         ws.close(1000, 'Component unmounting');
//       }
//     };
//   }, [activeRouterId, screenSize, reconnectAttempts]);

//   // Initial data fetch
//   useEffect(() => {
//     fetchInitialData();
//   }, [fetchInitialData]);

//   // Auto-refresh with different intervals based on screen size
//   useEffect(() => {
//     const refreshInterval = screenSize === 'mobile' ? 60000 : 30000;
    
//     const interval = setInterval(() => {
//       if (!isLoading) {
//         refreshData();
//       }
//     }, refreshInterval);

//     return () => clearInterval(interval);
//   }, [refreshData, screenSize, isLoading]);

//   return {
//     networkData,
//     routerStats,
//     healthData,
//     historicalData,
//     webSocketConnected,
//     isLoading,
//     error,
//     refreshData,
//     setNetworkData,
//     screenSize,
//     reconnectAttempts,
//     maxReconnectAttempts
//   };
// };












// src/hooks/useNetworkData.js 
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../../../context/AuthContext'
import api from '../../../../api'
import { calculatePerformanceMetrics } from '../../utils/networkUtils';

class WebSocketManager {
  constructor(url, onMessage, onOpen, onClose) {
    this.url = url;
    this.onMessage = onMessage;
    this.onOpen = onOpen;
    this.onClose = onClose;
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxAttempts = 8;
    this.baseDelay = 1000;
    this.timer = null;
  }

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN || this.ws?.readyState === WebSocket.CONNECTING) {
      return;
    }

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log('WebSocket connected:', this.url);
        this.reconnectAttempts = 0;
        this.onOpen?.();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.onMessage(data);
        } catch (err) {
          console.error('WebSocket message parse error:', err);
        }
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason || 'unknown reason');
        this.onClose?.();

        // Only reconnect on abnormal closure
        if (event.code !== 1000 && this.reconnectAttempts < this.maxAttempts) {
          const delay = Math.min(this.baseDelay * Math.pow(2, this.reconnectAttempts), 30000);
          this.reconnectAttempts++;
          console.log(`WebSocket reconnecting in ${delay}ms... (${this.reconnectAttempts}/${this.maxAttempts})`);
          this.timer = setTimeout(() => this.connect(), delay);
        }
      };

      this.ws.onerror = (err) => {
        console.error('WebSocket error event:', err);
      };
    } catch (err) {
      console.error('Failed to create WebSocket:', err);
    }
  }

  disconnect() {
    if (this.timer) clearTimeout(this.timer);
    if (this.ws) {
      this.ws.onclose = null;
      this.ws.close(1000, 'Component unmount');
      this.ws = null;
    }
  }
}

export const useNetworkData = (initialRouters = [], activeRouterId = null) => {
  const { isAuthenticated, logout } = useAuth();

  const [networkData, setNetworkData] = useState({
    connectedRouters: 0,
    activeSessions: 0,
    systemHealth: 100,
    performanceMetrics: {
      avgCpu: 0,
      avgMemory: 0,
      totalThroughput: 0,
      activeConnections: 0,
    },
    lastUpdate: null,
  });

  const [routerStats, setRouterStats] = useState({});
  const [healthData, setHealthData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [webSocketConnected, setWebSocketConnected] = useState(false);

  const wsManagerRef = useRef(null);

  // Correct WebSocket URL — works in dev + prod
  const getWebSocketUrl = useCallback(() => {
    if (import.meta.env.PROD) {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      return `${protocol}//${window.location.host}/ws/routers/`;
    }
    // Dev: backend on 8000, frontend on 5173
    return 'ws://localhost:8000/ws/routers/';
  }, []);

  // Fetch initial data using your centralized api.js (handles auth, 401, retries, cache)
  const fetchInitialData = useCallback(async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [routersRes, healthRes] = await Promise.allSettled([
        initialRouters.length > 0
          ? Promise.resolve(initialRouters)
          : api.safeGet('/api/network_management/routers/'),
        api.safeGet('/api/network_management/health-monitoring/'),
      ]);

      const routers = routersRes.status === 'fulfilled' ? routersRes.value : initialRouters;
      const health = healthRes.status === 'fulfilled' ? healthRes.value : [];

      setHealthData(health || []);

      const metrics = calculatePerformanceMetrics(routers);
      setNetworkData(prev => ({
        ...prev,
        ...metrics,
        lastUpdate: new Date(),
      }));

      // Optional: fetch active router detailed stats
      if (activeRouterId) {
        try {
          const stats = await api.safeGet(`/api/network_management/routers/${activeRouterId}/status/`);
          setRouterStats(prev => ({ ...prev, [activeRouterId]: stats }));
        } catch (err) {
          console.warn('Failed to load active router stats (non-critical)');
        }
      }
    } catch (err) {
      // api.js already handles 401 → logout + redirect
      // We just show user-friendly message
      console.error('Failed to load network data:', err);
      setError(err.message || 'Failed to load network data');
    } finally {
      setIsLoading(false);
    }
  }, [initialRouters, activeRouterId, isAuthenticated]);

  // WebSocket real-time updates
  useEffect(() => {
    if (!isAuthenticated) {
      setWebSocketConnected(false);
      return;
    }

    const wsUrl = getWebSocketUrl();

    const handleMessage = (data) => {
      switch (data.type) {
        case 'router_update':
          setRouterStats(prev => ({
            ...prev,
            [data.router_id]: { ...prev[data.router_id], ...data.payload }
          }));
          break;

        case 'health_update':
          setHealthData(prev =>
            prev.map(h => (h.router_id === data.router_id ? { ...h, ...data.payload } : h))
          );
          break;

        case 'system_metrics_update':
          setNetworkData(prev => ({
            ...prev,
            ...data.payload,
            lastUpdate: new Date()
          }));
          break;

        case 'connection_test_update':
          if (data.router_id === activeRouterId) {
            setRouterStats(prev => ({
              ...prev,
              [data.router_id]: {
                ...prev[data.router_id],
                connection_test: data.payload
              }
            }));
          }
          break;

        default:
          console.log('Unhandled WS message type:', data.type);
      }
    };

    wsManagerRef.current = new WebSocketManager(
      wsUrl,
      handleMessage,
      () => setWebSocketConnected(true),
      () => setWebSocketConnected(false)
    );

    wsManagerRef.current.connect();

    return () => {
      if (wsManagerRef.current) {
        wsManagerRef.current.disconnect();
        wsManagerRef.current = null;
      }
    };
  }, [isAuthenticated, activeRouterId, getWebSocketUrl]);

  // Initial load
  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Fallback polling if WebSocket fails
  useEffect(() => {
    if (!webSocketConnected && isAuthenticated) {
      const interval = setInterval(fetchInitialData, 45000);
      return () => clearInterval(interval);
    }
  }, [webSocketConnected, isAuthenticated, fetchInitialData]);

  const refresh = useCallback(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  return {
    networkData,
    routerStats,
    healthData,
    isLoading,
    error,
    webSocketConnected,
    refresh,
  };
};