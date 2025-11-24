// // src/hooks/useNetworkData.js
// import { useState, useEffect, useCallback } from 'react';
// import { calculatePerformanceMetrics } from '../../utils/networkUtils'

// // API service for network management
// const networkAPI = {
//   // Get router statistics
//   async getRouterStats(routerId) {
//     const response = await fetch(`/api/network_management/routers/${routerId}/stats/`, {
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

//   // Get health monitoring data
//   async getHealthMonitoring() {
//     const response = await fetch('/api/network_management/health-monitoring/', {
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

//   // Get router list
//   async getRouters() {
//     const response = await fetch('/api/network_management/routers/', {
//       headers: {
//         'Authorization': `Bearer ${localStorage.getItem('token')}`,
//         'Content-Type': 'application/json'
//       }
//     });
    
//     if (!response.ok) {
//       throw new Error(`Failed to fetch routers: ${response.statusText}`);
//     }
    
//     return await response.json();
//   },

//   // Get historical stats for trends
//   async getHistoricalStats(routerId, days = 7) {
//     const response = await fetch(`/api/network_management/routers/${routerId}/stats/?days=${days}`, {
//       headers: {
//         'Authorization': `Bearer ${localStorage.getItem('token')}`,
//         'Content-Type': 'application/json'
//       }
//     });
    
//     if (!response.ok) {
//       throw new Error(`Failed to fetch historical stats: ${response.statusText}`);
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

//   // Fetch initial data
//   const fetchInitialData = useCallback(async () => {
//     setIsLoading(true);
//     setError(null);
    
//     try {
//       // Fetch routers if not provided
//       let routersData = routers;
//       if (!routers.length) {
//         routersData = await networkAPI.getRouters();
//       }

//       // Fetch health monitoring data
//       const healthData = await networkAPI.getHealthMonitoring();
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
//         setRouterStats(stats);

//         // Fetch historical data for trends
//         const historical = await networkAPI.getHistoricalStats(activeRouterId);
//         setHistoricalData(historical);
//       }

//     } catch (err) {
//       console.error('Error fetching network data:', err);
//       setError(err.message);
//     } finally {
//       setIsLoading(false);
//     }
//   }, [routers, activeRouterId]);

//   // Refresh data function
//   const refreshData = useCallback(async () => {
//     await fetchInitialData();
//   }, [fetchInitialData]);

//   // WebSocket connection for real-time updates
//   useEffect(() => {
//     const connectWebSocket = () => {
//       console.log('🔌 Connecting to network WebSocket...');
//       setWebSocketConnected(true);
      
//       // In a real implementation, this would connect to your WebSocket endpoints
//       const ws = new WebSocket(`ws://${window.location.host}/ws/routers/`);
      
//       ws.onopen = () => {
//         console.log('WebSocket connected');
//         setWebSocketConnected(true);
//       };
      
//       ws.onmessage = (event) => {
//         try {
//           const data = JSON.parse(event.data);
          
//           // Handle different message types
//           switch (data.type) {
//             case 'router_update':
//               // Update specific router data
//               break;
//             case 'health_update':
//               // Update health data
//               setHealthData(prev => 
//                 prev.map(health => 
//                   health.router_id === data.router_id ? { ...health, ...data.data } : health
//                 )
//               );
//               break;
//             case 'stats_update':
//               // Update router stats
//               if (data.router_id === activeRouterId) {
//                 setRouterStats(prev => ({ ...prev, latest: data.data }));
//               }
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
        
//         // Attempt reconnection after 5 seconds
//         setTimeout(() => {
//           connectWebSocket();
//         }, 5000);
//       };
      
//       ws.onerror = (error) => {
//         console.error('WebSocket error:', error);
//         setWebSocketConnected(false);
//       };

//       return () => {
//         ws.close();
//       };
//     };

//     const cleanup = connectWebSocket();
//     return cleanup;
//   }, [activeRouterId]);

//   // Initial data fetch
//   useEffect(() => {
//     fetchInitialData();
//   }, [fetchInitialData]);

//   // Auto-refresh every 30 seconds
//   useEffect(() => {
//     const interval = setInterval(() => {
//       refreshData();
//     }, 30000);

//     return () => clearInterval(interval);
//   }, [refreshData]);

//   return {
//     networkData,
//     routerStats,
//     healthData,
//     historicalData,
//     webSocketConnected,
//     isLoading,
//     error,
//     refreshData,
//     setNetworkData
//   };
// };





// src/hooks/useNetworkData.js
import { useState, useEffect, useCallback } from 'react';
import { calculatePerformanceMetrics } from '../../utils/networkUtils'

// Enhanced API service for network management
const networkAPI = {
  // Get router statistics - FIXED endpoint
  async getRouterStats(routerId) {
    const response = await fetch(`/api/network_management/routers/${routerId}/status/`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch router stats: ${response.statusText}`);
    }
    
    return await response.json();
  },

  // Get health monitoring data - FIXED endpoint
  async getHealthMonitoring() {
    const response = await fetch('/api/network_management/health-monitoring/', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch health data: ${response.statusText}`);
    }
    
    return await response.json();
  },

  // Get router list - FIXED endpoint
  async getRouters() {
    const response = await fetch('/api/network_management/routers/', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch routers: ${response.statusText}`);
    }
    
    return await response.json();
  },

  // Get historical stats for trends - FIXED endpoint
  async getHistoricalStats(routerId, days = 7) {
    const response = await fetch(`/api/network_management/routers/${routerId}/connection-history/?days=${days}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch historical stats: ${response.statusText}`);
    }
    
    return await response.json();
  },

  // NEW: Get real-time metrics
  async getRealTimeMetrics() {
    const response = await fetch('/api/network_management/real-time-metrics/', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch real-time metrics: ${response.statusText}`);
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

  // Fetch initial data
  const fetchInitialData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch routers if not provided
      let routersData = routers;
      if (!routers.length) {
        routersData = await networkAPI.getRouters();
      }

      // Fetch health monitoring data
      const healthData = await networkAPI.getHealthMonitoring();
      setHealthData(healthData);

      // Calculate system-wide metrics
      const systemMetrics = calculatePerformanceMetrics(routersData);
      
      // Fetch real-time metrics
      const realTimeMetrics = await networkAPI.getRealTimeMetrics();
      
      setNetworkData(prev => ({ 
        ...prev, 
        ...systemMetrics,
        ...realTimeMetrics,
        lastUpdate: new Date()
      }));

      // Fetch stats for active router if specified
      if (activeRouterId) {
        const stats = await networkAPI.getRouterStats(activeRouterId);
        setRouterStats(prev => ({ ...prev, [activeRouterId]: stats }));

        // Fetch historical data for trends
        const historical = await networkAPI.getHistoricalStats(activeRouterId);
        setHistoricalData(prev => ({ ...prev, [activeRouterId]: historical }));
      }

    } catch (err) {
      console.error('Error fetching network data:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [routers, activeRouterId]);

  // Refresh data function
  const refreshData = useCallback(async () => {
    await fetchInitialData();
  }, [fetchInitialData]);

  // Enhanced WebSocket connection for real-time updates
  useEffect(() => {
    const connectWebSocket = () => {
      console.log('🔌 Connecting to network WebSocket...');
      
      // Use the correct WebSocket endpoint from backend
      const ws = new WebSocket(`ws://${window.location.host}/ws/routers/`);
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        setWebSocketConnected(true);
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Handle different message types from backend
          switch (data.type) {
            case 'router_update':
              // Update specific router data
              if (data.router_id) {
                setRouterStats(prev => ({
                  ...prev,
                  [data.router_id]: { ...prev[data.router_id], ...data.data }
                }));
              }
              break;
              
            case 'health_update':
              // Update health data
              setHealthData(prev => 
                prev.map(health => 
                  health.router_id === data.router_id ? { ...health, ...data.data } : health
                )
              );
              break;
              
            case 'connection_test_update':
              // Update connection test results
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
              // Update system-wide metrics
              setNetworkData(prev => ({
                ...prev,
                ...data.data,
                lastUpdate: new Date()
              }));
              break;
              
            default:
              console.log('Unknown WebSocket message type:', data.type);
          }
        } catch (err) {
          console.error('Error processing WebSocket message:', err);
        }
      };
      
      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setWebSocketConnected(false);
        
        // Attempt reconnection after 5 seconds
        setTimeout(() => {
          connectWebSocket();
        }, 5000);
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setWebSocketConnected(false);
      };

      return () => {
        ws.close();
      };
    };

    const cleanup = connectWebSocket();
    return cleanup;
  }, [activeRouterId]);

  // Initial data fetch
  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshData();
    }, 30000);

    return () => clearInterval(interval);
  }, [refreshData]);

  return {
    networkData,
    routerStats,
    healthData,
    historicalData,
    webSocketConnected,
    isLoading,
    error,
    refreshData,
    setNetworkData
  };
};