





// // src/Pages/NetworkManagement/hooks/useHealthMonitoring.js
// import { useCallback } from "react";
// import { toast } from "react-toastify";
// import api from "../../../../api";

// export const useHealthMonitoring = () => {
//   const fetchHealthStats = useCallback(async () => {
//     try {
//       // FIX: Update health check endpoint
//       const response = await api.get("/api/network_management/health-monitoring/");
//       return response.data;
//     } catch (error) {
//       console.error("Error fetching health stats:", error);
//       return [];
//     }
//   }, []);

//   const performBulkHealthCheck = useCallback(async (routerIds) => {
//     try {
//       const promises = routerIds.map(routerId =>
//         // FIX: Update individual router health check
//         api.get(`/api/network_management/routers/${routerId}/stats/`)
//       );
      
//       const results = await Promise.allSettled(promises);
//       const healthData = results.map((result, index) => ({
//         routerId: routerIds[index],
//         data: result.status === 'fulfilled' ? result.value.data : { error: result.reason }
//       }));
      
//       toast.success(`Health check completed for ${routerIds.length} routers`);
//       return healthData;
//     } catch (error) {
//       toast.error("Failed to perform bulk health check");
//       console.error("Error in bulk health check:", error);
//       throw error;
//     }
//   }, []);

//   const fetchSystemMetrics = useCallback(async (routerId) => {
//     try {
//       const response = await api.get(`/api/network_management/routers/${routerId}/system-metrics/`);
//       return response.data;
//     } catch (error) {
//       console.error("Error fetching system metrics:", error);
//       return null;
//     }
//   }, []);

//   return {
//     fetchHealthStats,
//     performBulkHealthCheck,
//     fetchSystemMetrics,
//   };
// };





// src/Pages/NetworkManagement/hooks/useHealthMonitoring.js
import { useCallback } from "react";
import { toast } from "react-toastify";
import api from "../../../../api";

export const useHealthMonitoring = () => {
  const fetchHealthStats = useCallback(async () => {
    try {
      // FIXED: Updated to match backend router connection endpoints
      const response = await api.get("/api/network_management/health-monitoring/");
      return response.data;
    } catch (error) {
      console.error("Error fetching health stats:", error);
      return [];
    }
  }, []);

  const performBulkHealthCheck = useCallback(async (routerIds) => {
    try {
      // FIXED: Use bulk connection test endpoint
      const response = await api.post("/api/network_management/bulk-connection-test/", {
        router_ids: routerIds
      });
      
      toast.success(`Health check completed for ${routerIds.length} routers`);
      return response.data;
    } catch (error) {
      toast.error("Failed to perform bulk health check");
      console.error("Error in bulk health check:", error);
      throw error;
    }
  }, []);

  const fetchSystemMetrics = useCallback(async (routerId) => {
    try {
      // FIXED: Use router status endpoint from connector
      const response = await api.get(`/api/network_management/routers/${routerId}/status/`);
      return response.data;
    } catch (error) {
      console.error("Error fetching system metrics:", error);
      return null;
    }
  }, []);

  const fetchConnectionHistory = useCallback(async (routerId, days = 7) => {
    try {
      const response = await api.get(`/api/network_management/routers/${routerId}/connection-history/`, {
        params: { days }
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching connection history:", error);
      throw error;
    }
  }, []);

  const runRouterDiagnostics = useCallback(async (routerId) => {
    try {
      const response = await api.get(`/api/network_management/routers/${routerId}/diagnostics/`);
      return response.data;
    } catch (error) {
      console.error("Error running diagnostics:", error);
      throw error;
    }
  }, []);

  return {
    fetchHealthStats,
    performBulkHealthCheck,
    fetchSystemMetrics,
    fetchConnectionHistory,
    runRouterDiagnostics,
  };
};