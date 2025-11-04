// src/Pages/NetworkManagement/hooks/useHealthMonitoring.js
import { useCallback } from "react";
import { toast } from "react-toastify";
import api from "../../../api";

export const useHealthMonitoring = () => {
  const fetchHealthStats = useCallback(async () => {
    try {
      const response = await api.get("/api/network_management/health-check/");
      return response.data;
    } catch (error) {
      console.error("Error fetching health stats:", error);
      return [];
    }
  }, []);

  const performBulkHealthCheck = useCallback(async (routerIds) => {
    try {
      const promises = routerIds.map(routerId =>
        api.get(`/api/network_management/routers/${routerId}/health-check/`)
      );
      
      const results = await Promise.allSettled(promises);
      const healthData = results.map((result, index) => ({
        routerId: routerIds[index],
        data: result.status === 'fulfilled' ? result.value.data : { error: result.reason }
      }));
      
      toast.success(`Health check completed for ${routerIds.length} routers`);
      return healthData;
    } catch (error) {
      toast.error("Failed to perform bulk health check");
      console.error("Error in bulk health check:", error);
      throw error;
    }
  }, []);

  const fetchSystemMetrics = useCallback(async (routerId) => {
    try {
      const response = await api.get(`/api/network_management/routers/${routerId}/system-metrics/`);
      return response.data;
    } catch (error) {
      console.error("Error fetching system metrics:", error);
      return null;
    }
  }, []);

  return {
    fetchHealthStats,
    performBulkHealthCheck,
    fetchSystemMetrics,
  };
};