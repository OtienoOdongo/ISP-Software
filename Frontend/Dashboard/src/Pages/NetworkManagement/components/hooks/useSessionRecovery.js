// src/Pages/NetworkManagement/hooks/useSessionRecovery.js
import { useCallback } from "react";
import { toast } from "react-toastify";
import api from "../../../../api"


export const useSessionRecovery = () => {
  const recoverUserSession = useCallback(async (recoveryData) => {
    try {
      const response = await api.post("/api/network_management/recover-session/", recoveryData);
      toast.success("Session recovered successfully");
      return response.data;
    } catch (error) {
      toast.error("Failed to recover session");
      console.error("Error recovering session:", error);
      throw error;
    }
  }, []);

  const bulkRecoverSessions = useCallback(async (sessionsData) => {
    try {
      const promises = sessionsData.map(sessionData =>
        api.post("/api/network_management/recover-session/", sessionData)
      );
      
      const results = await Promise.allSettled(promises);
      const successful = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.filter(result => result.status === 'rejected').length;
      
      toast.success(`Successfully recovered ${successful} sessions. ${failed} failed.`);
      return results;
    } catch (error) {
      toast.error("Failed to recover sessions in bulk");
      console.error("Error in bulk recovery:", error);
      throw error;
    }
  }, []);

  const fetchRecoverableSessions = useCallback(async (routerId = null) => {
    try {
      const params = routerId ? { router_id: routerId } : {};
      const response = await api.get("/api/network_management/recoverable-sessions/", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching recoverable sessions:", error);
      return [];
    }
  }, []);

  return {
    recoverUserSession,
    bulkRecoverSessions,
    fetchRecoverableSessions,
  };
};