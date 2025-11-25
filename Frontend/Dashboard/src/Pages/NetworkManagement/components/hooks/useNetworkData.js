









// // src/hooks/useNetworkData.js - ENHANCED VERSION
// import { useState, useEffect, useCallback } from 'react';
// import { calculatePerformanceMetrics } from '../../utils/networkUtils'

// // Enhanced API service with responsive data loading
// const networkAPI = {
//   async getRouterStats(routerId) {
//     const response = await fetch(`/api/network_management/routers/${routerId}/status/`, {
//       headers: {
//         'Authorization': `Bearer ${localStorage.getItem('token')}`,
//         'Content-Type': 'application/json'
//       }
//     });
    
//     if (!response.ok) {
//       throw new Error(`Failed to fetch router stats: ${response.statusText}`);
//     }
    
//     return await response.json();
//   },

//   // Optimized health monitoring with reduced data on mobile
//   async getHealthMonitoring(optimizeForMobile = false) {
//     const params = optimizeForMobile ? '?fields=basic' : '';
//     const response = await fetch(`/api/network_management/health-monitoring/${params}`, {
//       headers: {
//         'Authorization': `Bearer ${localStorage.getItem('token')}`,
//         'Content-Type': 'application/json'
//       }
//     });
    
//     if (!response.ok) {
//       throw new Error(`Failed to fetch health data: ${response.statusText}`);
//     }
    
//     return await response.json();
//   },

//   // Optimized router list for different screen sizes
//   async getRouters(optimizeForMobile = false) {
//     const params = optimizeForMobile ? '?fields=id,name,ip,connection_status' : '';
//     const response = await fetch(`/api/network_management/routers/${params}`, {
//       headers: {
//         'Authorization': `Bearer ${localStorage.getItem('token')}`,
//         'Content-Type': 'application/json'
//       }
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
      
//       // Only fetch detailed metrics on larger screens or when needed
//       let realTimeMetrics = {};
//       if (screenSize !== 'mobile' || activeRouterId) {
//         realTimeMetrics = await networkAPI.getRealTimeMetrics();
//       }
      
//       setNetworkData(prev => ({ 
//         ...prev, 
//         ...systemMetrics,
//         ...realTimeMetrics,
//         lastUpdate: new Date()
//       }));

//       // Fetch stats for active router if specified (always fetch for active router)
//       if (activeRouterId) {
//         const stats = await networkAPI.getRouterStats(activeRouterId);
//         setRouterStats(prev => ({ ...prev, [activeRouterId]: stats }));

//         // Only fetch historical data on larger screens
//         if (screenSize !== 'mobile') {
//           const historical = await networkAPI.getHistoricalStats(activeRouterId);
//           setHistoricalData(prev => ({ ...prev, [activeRouterId]: historical }));
//         }
//       }

//     } catch (err) {
//       console.error('Error fetching network data:', err);
//       setError(err.message);
//     } finally {
//       setIsLoading(false);
//     }
//   }, [routers, activeRouterId, screenSize]);

//   // Refresh data function with screen size awareness
//   const refreshData = useCallback(async () => {
//     await fetchInitialData();
//   }, [fetchInitialData]);

//   // Enhanced WebSocket connection with mobile optimization
//   useEffect(() => {
//     const connectWebSocket = () => {
//       console.log('🔌 Connecting to network WebSocket...');
      
//       // Use the correct WebSocket endpoint from backend
//       const ws = new WebSocket(`ws://${window.location.host}/ws/routers/`);
      
//       ws.onopen = () => {
//         console.log('WebSocket connected');
//         setWebSocketConnected(true);
//       };
      
//       ws.onmessage = (event) => {
//         try {
//           const data = JSON.parse(event.data);
          
//           // Handle different message types from backend
//           switch (data.type) {
//             case 'router_update':
//               // Update specific router data
//               if (data.router_id) {
//                 setRouterStats(prev => ({
//                   ...prev,
//                   [data.router_id]: { ...prev[data.router_id], ...data.data }
//                 }));
//               }
//               break;
              
//             case 'health_update':
//               // Update health data
//               setHealthData(prev => 
//                 prev.map(health => 
//                   health.router_id === data.router_id ? { ...health, ...data.data } : health
//                 )
//               );
//               break;
              
//             case 'connection_test_update':
//               // Update connection test results
//               if (data.router_id === activeRouterId) {
//                 setRouterStats(prev => ({
//                   ...prev,
//                   [data.router_id]: { 
//                     ...prev[data.router_id], 
//                     connection_test: data.data 
//                   }
//                 }));
//               }
//               break;
              
//             case 'system_metrics_update':
//               // Update system-wide metrics
//               setNetworkData(prev => ({
//                 ...prev,
//                 ...data.data,
//                 lastUpdate: new Date()
//               }));
//               break;
              
//             default:
//               console.log('Unknown WebSocket message type:', data.type);
//           }
//         } catch (err) {
//           console.error('Error processing WebSocket message:', err);
//         }
//       };
      
//       ws.onclose = () => {
//         console.log('WebSocket disconnected');
//         setWebSocketConnected(false);
        
//         // Attempt reconnection with longer delay on mobile
//         const reconnectDelay = screenSize === 'mobile' ? 10000 : 5000;
//         setTimeout(() => {
//           connectWebSocket();
//         }, reconnectDelay);
//       };
      
//       ws.onerror = (error) => {
//         console.error('WebSocket error:', error);
//         setWebSocketConnected(false);
//       };

//       return () => {
//         ws.close();
//       };
//     };

//     // Only connect WebSocket on larger screens or when specifically needed
//     if (screenSize !== 'mobile' || activeRouterId) {
//       const cleanup = connectWebSocket();
//       return cleanup;
//     }
//   }, [activeRouterId, screenSize]);

//   // Initial data fetch
//   useEffect(() => {
//     fetchInitialData();
//   }, [fetchInitialData]);

//   // Auto-refresh with different intervals based on screen size
//   useEffect(() => {
//     const refreshInterval = screenSize === 'mobile' ? 60000 : 30000; // 60s on mobile, 30s on larger screens
    
//     const interval = setInterval(() => {
//       refreshData();
//     }, refreshInterval);

//     return () => clearInterval(interval);
//   }, [refreshData, screenSize]);

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
//     screenSize // Export screen size for components to use
//   };
// };





// src/hooks/useNetworkData.js - FIXED VERSION
import { useState, useEffect, useCallback } from 'react';
import { calculatePerformanceMetrics } from '../../utils/networkUtils';

// Enhanced API service with proper error handling
const networkAPI = {
  async getRouterStats(routerId) {
    const response = await fetch(`/api/network_management/routers/${routerId}/status/`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000 // 10 second timeout
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch router stats: ${response.statusText}`);
    }
    
    return await response.json();
  },

  async getHealthMonitoring(optimizeForMobile = false) {
    const params = optimizeForMobile ? '?fields=basic' : '';
    const response = await fetch(`/api/network_management/health-monitoring/${params}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch health data: ${response.statusText}`);
    }
    
    return await response.json();
  },

  async getRouters(optimizeForMobile = false) {
    const params = optimizeForMobile ? '?fields=id,name,ip,connection_status' : '';
    const response = await fetch(`/api/network_management/routers/${params}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch routers: ${response.statusText}`);
    }
    
    return await response.json();
  }
};

export const useNetworkData = (routers = [], activeRouterId = null) => {
  const [networkData, setNetworkData] = useState({
    connectedRouters: 0,
    activeSessions: 0,
    systemHealth: 100,
    performanceMetrics: {
      avgCpu: 0,
      avgMemory: 0,
      totalThroughput: 0,
      activeConnections: 0
    },
    lastUpdate: new Date()
  });
  
  const [routerStats, setRouterStats] = useState({});
  const [healthData, setHealthData] = useState([]);
  const [historicalData, setHistoricalData] = useState({});
  const [webSocketConnected, setWebSocketConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [screenSize, setScreenSize] = useState('desktop');
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const maxReconnectAttempts = 5;

  // Detect screen size for responsive data loading
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      if (width < 640) setScreenSize('mobile');
      else if (width < 1024) setScreenSize('tablet');
      else setScreenSize('desktop');
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Optimize data loading based on screen size
  const fetchInitialData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const optimizeForMobile = screenSize === 'mobile';
      
      // Fetch routers with optimized fields for mobile
      let routersData = routers;
      if (!routers.length) {
        routersData = await networkAPI.getRouters(optimizeForMobile);
      }

      // Fetch health monitoring data with optimization
      const healthData = await networkAPI.getHealthMonitoring(optimizeForMobile);
      setHealthData(healthData);

      // Calculate system-wide metrics
      const systemMetrics = calculatePerformanceMetrics(routersData);
      
      setNetworkData(prev => ({ 
        ...prev, 
        ...systemMetrics,
        lastUpdate: new Date()
      }));

      // Fetch stats for active router if specified
      if (activeRouterId) {
        const stats = await networkAPI.getRouterStats(activeRouterId);
        setRouterStats(prev => ({ ...prev, [activeRouterId]: stats }));
      }

    } catch (err) {
      console.error('Error fetching network data:', err);
      setError(err.message);
      
      // Don't show error toast for timeouts, just log
      if (!err.message.includes('timeout')) {
        console.error('Network data fetch error:', err);
      }
    } finally {
      setIsLoading(false);
    }
  }, [routers, activeRouterId, screenSize]);

  // Refresh data function with screen size awareness
  const refreshData = useCallback(async () => {
    await fetchInitialData();
  }, [fetchInitialData]);

  // FIXED WebSocket connection with proper URL and error handling
  useEffect(() => {
    let ws = null;
    let reconnectTimeout = null;

    const connectWebSocket = () => {
      // FIX: Use the correct WebSocket URL - connect to backend port (8000), not frontend (5173)
      const isProduction = import.meta.env.PROD;
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      
      // FIX: Always connect to backend on port 8000 in development
      let wsUrl;
      if (isProduction) {
        wsUrl = `${protocol}//${window.location.host}/ws/routers/`;
      } else {
        // In development, frontend runs on 5173, backend on 8000
        wsUrl = 'ws://localhost:8000/ws/routers/';
      }

      console.log('🔌 Connecting to WebSocket:', wsUrl);
      
      try {
        ws = new WebSocket(wsUrl);
        
        ws.onopen = () => {
          console.log('✅ WebSocket connected successfully');
          setWebSocketConnected(true);
          setReconnectAttempts(0); // Reset reconnect attempts on successful connection
        };
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('📨 WebSocket message received:', data.type);
            
            // Handle different message types from backend
            switch (data.type) {
              case 'router_update':
                if (data.router_id) {
                  setRouterStats(prev => ({
                    ...prev,
                    [data.router_id]: { ...prev[data.router_id], ...data.data }
                  }));
                }
                break;
                
              case 'health_update':
                setHealthData(prev => 
                  prev.map(health => 
                    health.router_id === data.router_id ? { ...health, ...data.data } : health
                  )
                );
                break;
                
              case 'connection_test_update':
                if (data.router_id === activeRouterId) {
                  setRouterStats(prev => ({
                    ...prev,
                    [data.router_id]: { 
                      ...prev[data.router_id], 
                      connection_test: data.data 
                    }
                  }));
                }
                break;
                
              case 'system_metrics_update':
                setNetworkData(prev => ({
                  ...prev,
                  ...data.data,
                  lastUpdate: new Date()
                }));
                break;
                
              case 'connection_established':
                console.log('✅ WebSocket connection confirmed by server');
                break;
                
              default:
                console.log('Unknown WebSocket message type:', data.type);
            }
          } catch (err) {
            console.error('❌ Error processing WebSocket message:', err);
          }
        };
        
        ws.onclose = (event) => {
          console.log('🔌 WebSocket disconnected:', event.code, event.reason);
          setWebSocketConnected(false);
          
          // Only attempt reconnection if we haven't exceeded max attempts
          if (reconnectAttempts < maxReconnectAttempts) {
            const reconnectDelay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
            console.log(`🔄 Attempting reconnection in ${reconnectDelay}ms (attempt ${reconnectAttempts + 1}/${maxReconnectAttempts})`);
            
            reconnectTimeout = setTimeout(() => {
              setReconnectAttempts(prev => prev + 1);
              connectWebSocket();
            }, reconnectDelay);
          } else {
            console.error('❌ Max reconnection attempts reached. WebSocket connection failed.');
          }
        };
        
        ws.onerror = (error) => {
          console.error('❌ WebSocket error:', error);
          setWebSocketConnected(false);
        };

      } catch (error) {
        console.error('❌ Failed to create WebSocket connection:', error);
        setWebSocketConnected(false);
      }
    };

    // Only connect WebSocket on larger screens or when specifically needed
    if (screenSize !== 'mobile' || activeRouterId) {
      connectWebSocket();
    }

    // Cleanup function
    return () => {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      if (ws) {
        ws.close(1000, 'Component unmounting');
      }
    };
  }, [activeRouterId, screenSize, reconnectAttempts]);

  // Initial data fetch
  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Auto-refresh with different intervals based on screen size
  useEffect(() => {
    const refreshInterval = screenSize === 'mobile' ? 60000 : 30000;
    
    const interval = setInterval(() => {
      if (!isLoading) {
        refreshData();
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshData, screenSize, isLoading]);

  return {
    networkData,
    routerStats,
    healthData,
    historicalData,
    webSocketConnected,
    isLoading,
    error,
    refreshData,
    setNetworkData,
    screenSize,
    reconnectAttempts,
    maxReconnectAttempts
  };
};