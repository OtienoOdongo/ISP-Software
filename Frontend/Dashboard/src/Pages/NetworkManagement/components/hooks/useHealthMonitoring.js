




// // src/Pages/NetworkManagement/hooks/useHealthMonitoring.js - ENHANCED VERSION
// import { useCallback } from "react";
// import { toast } from "react-toastify";
// import api from "../../../../api";

// export const useHealthMonitoring = () => {
//   const fetchHealthStats = useCallback(async (optimizeForMobile = false) => {
//     try {
//       // Add mobile optimization parameters
//       const params = optimizeForMobile ? '?basic=true' : '';
//       const response = await api.get(`/api/network_management/health-monitoring/${params}`);
//       return response.data;
//     } catch (error) {
//       console.error("Error fetching health stats:", error);
//       // Return basic fallback data for mobile
//       return optimizeForMobile ? [] : [];
//     }
//   }, []);

//   const performBulkHealthCheck = useCallback(async (routerIds, optimizeForMobile = false) => {
//     try {
//       // Optimize bulk operations for mobile
//       const payload = optimizeForMobile 
//         ? { 
//             router_ids: routerIds,
//             basic_check: true,
//             skip_detailed_metrics: true
//           }
//         : { router_ids: routerIds };
      
//       const response = await api.post("/api/network_management/bulk-connection-test/", payload);
      
//       const message = optimizeForMobile 
//         ? `Quick health check completed for ${routerIds.length} routers`
//         : `Health check completed for ${routerIds.length} routers`;
      
//       toast.success(message);
//       return response.data;
//     } catch (error) {
//       toast.error("Failed to perform health check");
//       console.error("Error in health check:", error);
//       throw error;
//     }
//   }, []);

//   const fetchSystemMetrics = useCallback(async (routerId, optimizeForMobile = false) => {
//     try {
//       // Optimize metrics fetching for mobile
//       const params = optimizeForMobile ? '?basic=true' : '';
//       const response = await api.get(`/api/network_management/routers/${routerId}/status/${params}`);
//       return response.data;
//     } catch (error) {
//       console.error("Error fetching system metrics:", error);
//       // Return basic metrics for mobile fallback
//       return optimizeForMobile ? { basic: true, status: 'unknown' } : null;
//     }
//   }, []);

//   const fetchConnectionHistory = useCallback(async (routerId, days = 7, optimizeForMobile = false) => {
//     try {
//       // Reduce data points for mobile
//       const optimizedDays = optimizeForMobile ? Math.min(days, 3) : days;
//       const response = await api.get(`/api/network_management/routers/${routerId}/connection-history/`, {
//         params: { 
//           days: optimizedDays,
//           limit: optimizeForMobile ? 10 : 50
//         }
//       });
//       return response.data;
//     } catch (error) {
//       console.error("Error fetching connection history:", error);
//       throw error;
//     }
//   }, []);

//   const runRouterDiagnostics = useCallback(async (routerId, optimizeForMobile = false) => {
//     try {
//       // Run basic diagnostics on mobile
//       const payload = optimizeForMobile ? { basic_diagnostics: true } : {};
//       const response = await api.post(`/api/network_management/routers/${routerId}/diagnostics/`, payload);
//       return response.data;
//     } catch (error) {
//       console.error("Error running diagnostics:", error);
//       throw error;
//     }
//   }, []);

//   // Mobile-optimized quick health check
//   const quickHealthCheck = useCallback(async (routerId) => {
//     try {
//       const response = await api.get(`/api/network_management/routers/${routerId}/quick-status/`);
//       return response.data;
//     } catch (error) {
//       console.error("Error in quick health check:", error);
//       return { status: 'unknown', basic: true };
//     }
//   }, []);

//   return {
//     fetchHealthStats,
//     performBulkHealthCheck,
//     fetchSystemMetrics,
//     fetchConnectionHistory,
//     runRouterDiagnostics,
//     quickHealthCheck, // New mobile-optimized method
//   };
// };









// src/Pages/NetworkManagement/components/hooks/useHealthMonitoring.js - ENHANCED VERSION
import { useCallback } from "react";
import { toast } from "react-toastify";
import api from "../../../../api";

export const useHealthMonitoring = () => {
  const fetchHealthStats = useCallback(async (optimizeForMobile = false) => {
    try {
      // Add timeout and mobile optimization parameters
      const params = optimizeForMobile ? '?basic=true' : '';
      const response = await api.get(`/api/network_management/health-monitoring/${params}`, {
        timeout: optimizeForMobile ? 10000 : 30000, // 10s for mobile, 30s for desktop
      });
      
      // Handle empty response
      if (!response.data) {
        console.warn("Empty response received for health stats");
        return optimizeForMobile ? getBasicFallbackData() : getDetailedFallbackData();
      }
      
      return response.data;
    } catch (error) {
      console.error("Error fetching health stats:", error);
      
      // Handle timeout specifically
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        toast.warning(optimizeForMobile ? 
          "Health check timed out - using cached data" : 
          "Health check taking longer than expected"
        );
      } else {
        toast.error("Failed to fetch health statistics");
      }
      
      // Return appropriate fallback data
      return optimizeForMobile ? getBasicFallbackData() : getDetailedFallbackData();
    }
  }, []);

  const performBulkHealthCheck = useCallback(async (routerIds, optimizeForMobile = false) => {
    // Validate input
    if (!routerIds || !Array.isArray(routerIds) || routerIds.length === 0) {
      toast.error("No routers selected for health check");
      return { success: false, results: [] };
    }

    try {
      // Optimize bulk operations for mobile with timeout
      const payload = optimizeForMobile 
        ? { 
            router_ids: routerIds,
            basic_check: true,
            skip_detailed_metrics: true
          }
        : { router_ids: routerIds };
      
      const timeout = optimizeForMobile ? 15000 : 45000; // 15s mobile, 45s desktop
      const response = await api.post("/api/network_management/bulk-connection-test/", payload, {
        timeout
      });

      // Validate response data
      if (!response.data) {
        throw new Error("Empty response from bulk health check");
      }

      const message = optimizeForMobile 
        ? `Quick health check completed for ${routerIds.length} routers`
        : `Health check completed for ${routerIds.length} routers`;
      
      toast.success(message);
      return response.data;
    } catch (error) {
      console.error("Error in health check:", error);
      
      // Handle different error types
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        toast.warning(`Health check timed out for ${routerIds.length} routers - partial results may be available`);
        // Return partial results structure
        return {
          success: false,
          timed_out: true,
          results: routerIds.map(id => ({
            router_id: id,
            status: 'timeout',
            message: 'Health check timed out'
          }))
        };
      } else {
        toast.error("Failed to perform health check");
        throw error;
      }
    }
  }, []);

  const fetchSystemMetrics = useCallback(async (routerId, optimizeForMobile = false) => {
    // Validate routerId
    if (!routerId) {
      console.error("No router ID provided for system metrics");
      return optimizeForMobile ? getBasicMetricsFallback() : getDetailedMetricsFallback();
    }

    try {
      // Optimize metrics fetching for mobile with timeout
      const params = optimizeForMobile ? '?basic=true' : '';
      const response = await api.get(`/api/network_management/routers/${routerId}/status/${params}`, {
        timeout: optimizeForMobile ? 8000 : 20000, // 8s mobile, 20s desktop
      });

      // Handle empty or invalid response
      if (!response.data) {
        console.warn(`Empty response for system metrics of router ${routerId}`);
        return optimizeForMobile ? getBasicMetricsFallback(routerId) : getDetailedMetricsFallback(routerId);
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching system metrics for router ${routerId}:`, error);
      
      // Handle timeout
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        toast.warning(`System metrics timeout for router ${routerId}`);
      }
      
      return optimizeForMobile ? getBasicMetricsFallback(routerId) : getDetailedMetricsFallback(routerId);
    }
  }, []);

  const fetchConnectionHistory = useCallback(async (routerId, days = 7, optimizeForMobile = false) => {
    // Validate routerId
    if (!routerId) {
      console.error("No router ID provided for connection history");
      return getConnectionHistoryFallback(days);
    }

    try {
      // Reduce data points for mobile with timeout
      const optimizedDays = optimizeForMobile ? Math.min(days, 3) : days;
      const response = await api.get(`/api/network_management/routers/${routerId}/connection-history/`, {
        params: { 
          days: optimizedDays,
          limit: optimizeForMobile ? 10 : 50
        },
        timeout: optimizeForMobile ? 10000 : 25000, // 10s mobile, 25s desktop
      });

      // Handle empty response
      if (!response.data) {
        console.warn(`Empty connection history for router ${routerId}`);
        return getConnectionHistoryFallback(optimizedDays, routerId);
      }

      // Ensure consistent response structure
      const data = response.data;
      if (!data.connection_tests) {
        data.connection_tests = [];
      }
      if (!data.statistics) {
        data.statistics = calculateBasicStatistics(data.connection_tests || []);
      }

      return data;
    } catch (error) {
      console.error(`Error fetching connection history for router ${routerId}:`, error);
      
      // Handle timeout
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        toast.warning(`Connection history timeout for router ${routerId}`);
      } else {
        toast.error("Failed to fetch connection history");
      }
      
      return getConnectionHistoryFallback(days, routerId);
    }
  }, []);

  const runRouterDiagnostics = useCallback(async (routerId, optimizeForMobile = false) => {
    // Validate routerId
    if (!routerId) {
      throw new Error("Router ID is required for diagnostics");
    }

    try {
      // Run basic diagnostics on mobile with timeout
      const payload = optimizeForMobile ? { basic_diagnostics: true } : {};
      const response = await api.post(`/api/network_management/routers/${routerId}/diagnostics/`, payload, {
        timeout: optimizeForMobile ? 15000 : 30000, // 15s mobile, 30s desktop
      });

      // Handle empty response
      if (!response.data) {
        throw new Error("Empty response from diagnostics");
      }

      return response.data;
    } catch (error) {
      console.error(`Error running diagnostics for router ${routerId}:`, error);
      
      // Handle timeout specifically
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        throw new Error(`Diagnostics timed out for router ${routerId}`);
      }
      
      throw error;
    }
  }, []);

  // Mobile-optimized quick health check
  const quickHealthCheck = useCallback(async (routerId) => {
    if (!routerId) {
      return getQuickHealthFallback();
    }

    try {
      const response = await api.get(`/api/network_management/routers/${routerId}/quick-status/`, {
        timeout: 5000, // Very short timeout for quick check
      });

      // Handle empty response
      if (!response.data) {
        return getQuickHealthFallback(routerId);
      }

      return response.data;
    } catch (error) {
      console.error("Error in quick health check:", error);
      
      // Don't show toast for quick checks to avoid spam
      return getQuickHealthFallback(routerId);
    }
  }, []);

  // Fallback data generators
  const getBasicFallbackData = () => {
    return {
      basic: true,
      fallback: true,
      total_routers: 0,
      online_routers: 0,
      offline_routers: 0,
      health_score: 0,
      timestamp: new Date().toISOString()
    };
  };

  const getDetailedFallbackData = () => {
    return {
      detailed: true,
      fallback: true,
      statistics: {
        total_routers: 0,
        online_routers: 0,
        offline_routers: 0,
        health_score: 0,
        average_response_time: 0
      },
      routers: [],
      timestamp: new Date().toISOString()
    };
  };

  const getBasicMetricsFallback = (routerId = 'unknown') => {
    return {
      basic: true,
      fallback: true,
      router: {
        id: routerId,
        name: 'Unknown Router',
        status: 'unknown',
        connection_status: 'disconnected'
      },
      system_info: {
        firmware_version: 'unknown',
        model: 'unknown'
      },
      timestamp: new Date().toISOString()
    };
  };

  const getDetailedMetricsFallback = (routerId = 'unknown') => {
    return {
      detailed: true,
      fallback: true,
      router: {
        id: routerId,
        name: 'Unknown Router',
        status: 'unknown',
        connection_status: 'disconnected'
      },
      system_info: {
        firmware_version: 'unknown',
        model: 'unknown',
        uptime: 0
      },
      performance_metrics: {
        cpu_usage: 0,
        memory_usage: 0,
        active_clients: 0
      },
      timestamp: new Date().toISOString()
    };
  };

  const getConnectionHistoryFallback = (days = 7, routerId = 'unknown') => {
    return {
      fallback: true,
      router: {
        id: routerId,
        name: 'Unknown Router'
      },
      connection_tests: [],
      statistics: {
        total_tests: 0,
        successful_tests: 0,
        success_rate: 0,
        average_response_time: 0,
        time_period_days: days
      },
      timestamp: new Date().toISOString()
    };
  };

  const getQuickHealthFallback = (routerId = 'unknown') => {
    return {
      fallback: true,
      status: 'unknown',
      basic: true,
      router_id: routerId,
      timestamp: new Date().toISOString()
    };
  };

  const calculateBasicStatistics = (connectionTests) => {
    const totalTests = connectionTests.length;
    const successfulTests = connectionTests.filter(test => test.success).length;
    const successRate = totalTests > 0 ? (successfulTests / totalTests) * 100 : 0;
    
    const responseTimes = connectionTests
      .filter(test => test.response_time && test.success)
      .map(test => test.response_time);
    
    const avgResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
      : 0;

    return {
      total_tests: totalTests,
      successful_tests: successfulTests,
      success_rate: Math.round(successRate * 100) / 100,
      average_response_time: Math.round(avgResponseTime * 1000) / 1000
    };
  };

  return {
    fetchHealthStats,
    performBulkHealthCheck,
    fetchSystemMetrics,
    fetchConnectionHistory,
    runRouterDiagnostics,
    quickHealthCheck,
  };
};