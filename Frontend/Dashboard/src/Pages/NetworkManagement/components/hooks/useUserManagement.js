// src/Pages/NetworkManagement/hooks/useUserManagement.js
import { useCallback } from "react";
import { toast } from "react-toastify";
import api from "../../../api";

export const useUserManagement = () => {
  const activateUser = useCallback(async (activationData) => {
    try {
      const response = await api.post(
        `/api/network_management/routers/${activationData.routerId}/activate-user/`,
        activationData
      );
      
      toast.success("User activated successfully");
      return response.data;
    } catch (error) {
      toast.error("Failed to activate user");
      console.error("Error activating user:", error);
      throw error;
    }
  }, []);

  const bulkActivateUsers = useCallback(async (usersData) => {
    try {
      const promises = usersData.map(userData =>
        api.post(`/api/network_management/routers/${userData.routerId}/activate-user/`, userData)
      );
      
      const results = await Promise.allSettled(promises);
      const successful = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.filter(result => result.status === 'rejected').length;
      
      toast.success(`Successfully activated ${successful} users. ${failed} failed.`);
      return results;
    } catch (error) {
      toast.error("Failed to activate users in bulk");
      console.error("Error in bulk activation:", error);
      throw error;
    }
  }, []);

  const fetchAvailableClients = useCallback(async () => {
    try {
      const response = await api.get("/api/account/clients/");
      return response.data;
    } catch (error) {
      console.error("Error fetching clients:", error);
      return [];
    }
  }, []);

  const fetchAvailablePlans = useCallback(async () => {
    try {
      const response = await api.get("/api/internet_plans/plans/");
      return response.data;
    } catch (error) {
      console.error("Error fetching plans:", error);
      return [];
    }
  }, []);

  const getMACAddress = useCallback(async () => {
    try {
      const response = await api.get("/api/network_management/get-mac/");
      return response.data.mac;
    } catch (error) {
      console.error("Error fetching MAC address:", error);
      return null;
    }
  }, []);

  return {
    activateUser,
    bulkActivateUsers,
    fetchAvailableClients,
    fetchAvailablePlans,
    getMACAddress,
  };
};