// // src/Pages/NetworkManagement/hooks/useSessionRecovery.js
// import { useCallback } from "react";
// import { toast } from "react-toastify";
// import api from "../../../../api"


// export const useSessionRecovery = () => {
//   const recoverUserSession = useCallback(async (recoveryData) => {
//     try {
//       const response = await api.post("/api/network_management/recover-session/", recoveryData);
//       toast.success("Session recovered successfully");
//       return response.data;
//     } catch (error) {
//       toast.error("Failed to recover session");
//       console.error("Error recovering session:", error);
//       throw error;
//     }
//   }, []);

//   const bulkRecoverSessions = useCallback(async (sessionsData) => {
//     try {
//       const promises = sessionsData.map(sessionData =>
//         api.post("/api/network_management/recover-session/", sessionData)
//       );
      
//       const results = await Promise.allSettled(promises);
//       const successful = results.filter(result => result.status === 'fulfilled').length;
//       const failed = results.filter(result => result.status === 'rejected').length;
      
//       toast.success(`Successfully recovered ${successful} sessions. ${failed} failed.`);
//       return results;
//     } catch (error) {
//       toast.error("Failed to recover sessions in bulk");
//       console.error("Error in bulk recovery:", error);
//       throw error;
//     }
//   }, []);

//   const fetchRecoverableSessions = useCallback(async (routerId = null) => {
//     try {
//       const params = routerId ? { router_id: routerId } : {};
//       const response = await api.get("/api/network_management/recoverable-sessions/", { params });
//       return response.data;
//     } catch (error) {
//       console.error("Error fetching recoverable sessions:", error);
//       return [];
//     }
//   }, []);

//   return {
//     recoverUserSession,
//     bulkRecoverSessions,
//     fetchRecoverableSessions,
//   };
// };










// src/Pages/NetworkManagement/hooks/useSessionRecovery.js
import { useCallback } from "react";
import { toast } from "react-toastify";
import api from "../../../../api"

export const useSessionRecovery = () => {
  const recoverUserSession = useCallback(async (recoveryData) => {
    try {
      // FIXED: Use technician workflow endpoint for session recovery
      const response = await api.post("/api/network_management/technician-workflow/", {
        workflow_type: "troubleshooting",
        deployment_site: "session_recovery",
        router_config: recoveryData
      });
      
      toast.success("Session recovery workflow started successfully");
      return response.data;
    } catch (error) {
      toast.error("Failed to start session recovery");
      console.error("Error recovering session:", error);
      throw error;
    }
  }, []);

  const bulkRecoverSessions = useCallback(async (sessionsData) => {
    try {
      // FIXED: Use bulk operations endpoint
      const response = await api.post("/api/network_management/bulk-actions/", {
        action: "troubleshooting",
        router_ids: sessionsData.map(s => s.routerId),
        parameters: {
          operation_type: "session_recovery",
          sessions: sessionsData
        }
      });
      
      toast.success(`Bulk session recovery started for ${sessionsData.length} routers`);
      return response.data;
    } catch (error) {
      toast.error("Failed to start bulk session recovery");
      console.error("Error in bulk recovery:", error);
      throw error;
    }
  }, []);

  const fetchRecoverableSessions = useCallback(async (routerId = null) => {
    try {
      // FIXED: Use diagnostics endpoint to get session information
      const params = routerId ? { router_id: routerId } : {};
      const response = await api.get("/api/network_management/diagnostics/", { params });
      
      // Extract session information from diagnostics
      const sessions = response.data.issues?.filter(issue => 
        issue.type === 'session_issue'
      ) || [];
      
      return sessions;
    } catch (error) {
      console.error("Error fetching recoverable sessions:", error);
      return [];
    }
  }, []);

  const restoreRouterSessions = useCallback(async (routerId) => {
    try {
      // FIXED: Use configuration repair endpoint
      const response = await api.post(`/api/network_management/routers/${routerId}/script-configuration/`, {
        script_type: "basic_setup",
        parameters: { repair_sessions: true }
      });
      
      toast.success("Router sessions restored successfully");
      return response.data;
    } catch (error) {
      toast.error("Failed to restore router sessions");
      console.error("Error restoring router sessions:", error);
      throw error;
    }
  }, []);

  return {
    recoverUserSession,
    bulkRecoverSessions,
    fetchRecoverableSessions,
    restoreRouterSessions,
  };
};