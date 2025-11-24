

// // src/Pages/NetworkManagement/hooks/useUserManagement.js
// import { useCallback } from "react";
// import { toast } from "react-toastify";
// import api from "../../../../api"

// export const useUserManagement = () => {
//   const activateUser = useCallback(async (activationData) => {
//     try {
//       const response = await api.post(
//         `/api/network_management/routers/${activationData.routerId}/activate-user/`,
//         activationData
//       );
      
//       toast.success("User activated successfully");
//       return response.data;
//     } catch (error) {
//       toast.error("Failed to activate user");
//       console.error("Error activating user:", error);
//       throw error;
//     }
//   }, []);

//   const bulkActivateUsers = useCallback(async (usersData) => {
//     try {
//       const promises = usersData.map(userData =>
//         api.post(`/api/network_management/routers/${userData.routerId}/activate-user/`, userData)
//       );
      
//       const results = await Promise.allSettled(promises);
//       const successful = results.filter(result => result.status === 'fulfilled').length;
//       const failed = results.filter(result => result.status === 'rejected').length;
      
//       toast.success(`Successfully activated ${successful} users. ${failed} failed.`);
//       return results;
//     } catch (error) {
//       toast.error("Failed to activate users in bulk");
//       console.error("Error in bulk activation:", error);
//       throw error;
//     }
//   }, []);

//   const fetchAvailableClients = useCallback(async () => {
//     try {
//       const response = await api.get("/api/account/clients/");
//       return response.data;
//     } catch (error) {
//       console.error("Error fetching clients:", error);
//       return [];
//     }
//   }, []);

//   const fetchAvailablePlans = useCallback(async () => {
//     try {
//       // FIX: Update plans endpoint
//       const response = await api.get("/api/internet_plans/");
//       return response.data;
//     } catch (error) {
//       console.error("Error fetching plans:", error);
//       return [];
//     }
//   }, []);

//   // UPDATED: Enhanced MAC address detection with fallback
//   const detectMACClientSide = useCallback(async () => {
//     // Client-side MAC detection fallback
//     try {
//       const response = await fetch('/api/network_management/detect-mac/');
//       const data = await response.json();
//       return data.mac || null;
//     } catch (error) {
//       console.error('Client-side MAC detection failed:', error);
//       return null;
//     }
//   }, []);

//   const getMACAddress = useCallback(async () => {
//     try {
//       const response = await api.get("/api/network_management/get-mac/");
//       if (response.data.mac_address) {
//         return response.data.mac_address;
//       }
//       // Fallback to client-side detection
//       return await detectMACClientSide();
//     } catch (error) {
//       console.error("Error fetching MAC address:", error);
//       return await detectMACClientSide();
//     }
//   }, [detectMACClientSide]);

//   return {
//     activateUser,
//     bulkActivateUsers,
//     fetchAvailableClients,
//     fetchAvailablePlans,
//     getMACAddress,
//   };
// };






// src/Pages/NetworkManagement/hooks/useUserManagement.js
import { useCallback } from "react";
import { toast } from "react-toastify";
import api from "../../../../api"

export const useUserManagement = () => {
  const activateUser = useCallback(async (activationData) => {
    try {
      // FIXED: Use hotspot configuration endpoint for user activation
      const response = await api.post(
        `/api/network_management/routers/${activationData.routerId}/hotspot-config/`,
        {
          // Include user activation parameters in hotspot config
          auto_apply: true,
          max_users: activationData.maxUsers || 50,
          // Additional user activation parameters
          user_activation: {
            client_id: activationData.clientId,
            plan_id: activationData.planId,
            mac_address: activationData.macAddress,
            duration: activationData.duration
          }
        }
      );
      
      toast.success("User activation completed successfully");
      return response.data;
    } catch (error) {
      toast.error("Failed to activate user");
      console.error("Error activating user:", error);
      throw error;
    }
  }, []);

  const bulkActivateUsers = useCallback(async (usersData) => {
    try {
      // FIXED: Use bulk actions endpoint
      const response = await api.post("/api/network_management/bulk-actions/", {
        action: "configure_hotspot",
        router_ids: [...new Set(usersData.map(u => u.routerId))],
        config_data: {
          user_activations: usersData,
          auto_apply: true
        }
      });
      
      toast.success(`Bulk user activation started for ${usersData.length} users`);
      return response.data;
    } catch (error) {
      toast.error("Failed to activate users in bulk");
      console.error("Error in bulk activation:", error);
      throw error;
    }
  }, []);

  const fetchAvailableClients = useCallback(async () => {
    try {
      // FIXED: Use correct clients endpoint
      const response = await api.get("/api/account/clients/");
      return response.data;
    } catch (error) {
      console.error("Error fetching clients:", error);
      return [];
    }
  }, []);

  const fetchAvailablePlans = useCallback(async () => {
    try {
      // FIXED: Use correct internet plans endpoint
      const response = await api.get("/api/internet_plans/");
      return response.data;
    } catch (error) {
      console.error("Error fetching plans:", error);
      return [];
    }
  }, []);

  // UPDATED: Enhanced MAC address detection with proper backend endpoint
  const detectMACClientSide = useCallback(async () => {
    // Client-side MAC detection fallback
    try {
      const response = await fetch('/api/network_management/detect-mac/');
      const data = await response.json();
      return data.mac || null;
    } catch (error) {
      console.error('Client-side MAC detection failed:', error);
      return null;
    }
  }, []);

  const getMACAddress = useCallback(async () => {
    try {
      // FIXED: Use connection test endpoint to get router MAC info
      const response = await api.get("/api/network_management/test-connection/");
      if (response.data.system_info?.mac_address) {
        return response.data.system_info.mac_address;
      }
      // Fallback to client-side detection
      return await detectMACClientSide();
    } catch (error) {
      console.error("Error fetching MAC address:", error);
      return await detectMACClientSide();
    }
  }, [detectMACClientSide]);

  // NEW: Fetch hotspot users for a router
  const fetchHotspotUsers = useCallback(async (routerId) => {
    try {
      const response = await api.get(`/api/network_management/routers/${routerId}/hotspot-users/`);
      return response.data;
    } catch (error) {
      console.error("Error fetching hotspot users:", error);
      return [];
    }
  }, []);

  // NEW: Fetch PPPoE users for a router
  const fetchPPPoEUsers = useCallback(async (routerId) => {
    try {
      const response = await api.get(`/api/network_management/routers/${routerId}/pppoe-users/`);
      return response.data;
    } catch (error) {
      console.error("Error fetching PPPoE users:", error);
      return [];
    }
  }, []);

  return {
    activateUser,
    bulkActivateUsers,
    fetchAvailableClients,
    fetchAvailablePlans,
    getMACAddress,
    fetchHotspotUsers,
    fetchPPPoEUsers,
  };
};