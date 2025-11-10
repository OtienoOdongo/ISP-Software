// // src/Pages/NetworkManagement/hooks/useRouterManagement.js
// import { useReducer, useCallback, useRef } from "react";
// import { toast } from "react-toastify";
// import api from "../../../../api";

// // Initial State
// const initialState = {
//   routers: [],
//   activeRouter: null,
//   isLoading: false,
//   modals: {
//     addRouter: false,
//     editRouter: false,
//     hotspotConfig: false,
//     pppoeConfig: false,
//     users: false,
//     sessionHistory: false,
//     healthStats: false,
//     callbackConfig: false,
//     routerStats: false,
//     userActivation: false,
//     sessionRecovery: false,
//     bulkActions: false,
//   },
//   confirmModal: {
//     show: false,
//     title: "",
//     message: "",
//     action: null,
//   },
//   routerForm: {
//     name: "",
//     ip: "",
//     model: "",
//     type: "mikrotik",
//     port: "8728",
//     username: "admin",
//     password: "",
//     location: "",
//     status: "disconnected",
//     is_default: false,
//     captive_portal_enabled: true,
//     is_active: true,
//     max_clients: 50,
//     description: "",
//   },
//   touchedFields: {
//     name: false,
//     ip: false,
//     type: false,
//   },
//   hotspotForm: {
//     ssid: "SurfZone-WiFi",
//     landingPage: null,
//     redirectUrl: "http://captive.surfzone.local",
//     bandwidthLimit: "10M",
//     sessionTimeout: "60",
//     authMethod: "universal",
//   },
//   pppoeForm: {
//     ip_pool: "pppoe-pool-1",
//     service_name: "",
//     mtu: 1492,
//     dns_servers: "8.8.8.8,1.1.1.1",
//     bandwidth_limit: "10M",
//   },
//   callbackForm: {
//     event: "",
//     callback_url: "",
//     security_level: "medium",
//     security_profile: "",
//     is_active: true,
//     retry_enabled: true,
//     max_retries: 3,
//     timeout_seconds: 30,
//   },
//   hotspotUsers: [],
//   pppoeUsers: [],
//   sessionHistory: [],
//   healthStats: [],
//   expandedRouter: null,
//   selectedUser: null,
//   statsData: {},
//   searchTerm: "",
//   filter: "all",
//   statsLoading: false,
//   routerStats: {},
//   callbackConfigs: [],
//   systemMetrics: {},
// };

// // Reducer
// const reducer = (state, action) => {
//   switch (action.type) {
//     case "SET_ROUTERS":
//       return { ...state, routers: action.payload };
//     case "SET_ACTIVE_ROUTER":
//       return { ...state, activeRouter: action.payload };
//     case "SET_LOADING":
//       return { ...state, isLoading: action.payload };
//     case "TOGGLE_MODAL":
//       return { 
//         ...state, 
//         modals: { ...state.modals, [action.modal]: !state.modals[action.modal] },
//         ...(action.modal === "addRouter" && !state.modals[action.modal] && {
//           touchedFields: initialState.touchedFields
//         })
//       };
//     case "SET_CONFIRM_MODAL":
//       return { 
//         ...state, 
//         confirmModal: { ...state.confirmModal, ...action.payload } 
//       };
//     case "UPDATE_ROUTER_FORM":
//       return { ...state, routerForm: { ...state.routerForm, ...action.payload } };
//     case "UPDATE_HOTSPOT_FORM":
//       return { ...state, hotspotForm: { ...state.hotspotForm, ...action.payload } };
//     case "UPDATE_PPPOE_FORM":
//       return { ...state, pppoeForm: { ...state.pppoeForm, ...action.payload } };
//     case "UPDATE_CALLBACK_FORM":
//       return { ...state, callbackForm: { ...state.callbackForm, ...action.payload } };
//     case "SET_TOUCHED_FIELD":
//       return { 
//         ...state, 
//         touchedFields: { ...state.touchedFields, [action.field]: true } 
//       };
//     case "RESET_TOUCHED_FIELDS":
//       return { ...state, touchedFields: initialState.touchedFields };
//     case "SET_HOTSPOT_USERS":
//       return { ...state, hotspotUsers: action.payload };
//     case "SET_PPPOE_USERS":
//       return { ...state, pppoeUsers: action.payload };
//     case "SET_SESSION_HISTORY":
//       return { ...state, sessionHistory: action.payload };
//     case "SET_HEALTH_STATS":
//       return { ...state, healthStats: action.payload };
//     case "RESET_ROUTER_FORM":
//       return { 
//         ...state, 
//         routerForm: initialState.routerForm,
//         touchedFields: initialState.touchedFields
//       };
//     case "RESET_CALLBACK_FORM":
//       return { ...state, callbackForm: initialState.callbackForm };
//     case "TOGGLE_ROUTER_EXPANDED":
//       return { ...state, expandedRouter: state.expandedRouter === action.id ? null : action.id };
//     case "UPDATE_ROUTER":
//       return {
//         ...state,
//         routers: state.routers.map((r) => (r.id === action.payload.id ? { ...r, ...action.payload.data } : r)),
//         activeRouter: state.activeRouter?.id === action.payload.id ? { ...state.activeRouter, ...action.payload.data } : state.activeRouter,
//       };
//     case "DELETE_ROUTER":
//       return {
//         ...state,
//         routers: state.routers.filter((r) => r.id !== action.id),
//         activeRouter: state.activeRouter?.id === action.id ? null : state.activeRouter,
//       };
//     case "SET_STATS_DATA":
//       return { ...state, statsData: action.payload };
//     case "SET_SELECTED_USER":
//       return { ...state, selectedUser: action.payload };
//     case "SET_SEARCH_TERM":
//       return { ...state, searchTerm: action.payload };
//     case "SET_FILTER":
//       return { ...state, filter: action.payload };
//     case "SET_STATS_LOADING":
//       return { ...state, statsLoading: action.payload };
//     case "SET_ROUTER_STATS":
//       return { 
//         ...state, 
//         routerStats: { ...state.routerStats, [action.payload.routerId]: action.payload.stats } 
//       };
//     case "SET_CALLBACK_CONFIGS":
//       return { ...state, callbackConfigs: action.payload };
//     case "SET_SYSTEM_METRICS":
//       return { 
//         ...state, 
//         systemMetrics: { ...state.systemMetrics, [action.payload.routerId]: action.payload.metrics } 
//       };
//     default:
//       return state;
//   }
// };

// export const useRouterManagement = () => {
//   const [state, dispatch] = useReducer(reducer, initialState);
//   const activeRouterRef = useRef(state.activeRouter);

//   // Update active router ref
//   if (state.activeRouter !== activeRouterRef.current) {
//     activeRouterRef.current = state.activeRouter;
//   }

//   // Helper functions
//   const showConfirm = useCallback((title, message, action) => {
//     dispatch({ 
//       type: "SET_CONFIRM_MODAL", 
//       payload: { show: true, title, message, action } 
//     });
//   }, []);

//   const hideConfirm = useCallback(() => {
//     dispatch({ type: "SET_CONFIRM_MODAL", payload: { show: false } });
//   }, []);

//   const handleConfirm = useCallback(() => {
//     if (state.confirmModal.action) {
//       state.confirmModal.action();
//     }
//     hideConfirm();
//   }, [state.confirmModal.action, hideConfirm]);

//   // API Functions
//   const fetchRouters = useCallback(async () => {
//     dispatch({ type: "SET_LOADING", payload: true });
//     try {
//       const response = await api.get("/api/network_management/routers/", {
//         params: { 
//           status: state.filter !== "all" ? state.filter : undefined, 
//           search: state.searchTerm || undefined 
//         }
//       });
//       dispatch({ type: "SET_ROUTERS", payload: response.data });
//       if (!state.activeRouter && response.data.length > 0) {
//         dispatch({ type: "SET_ACTIVE_ROUTER", payload: response.data[0] });
//       }
//     } catch (error) {
//       toast.error("Failed to fetch routers");
//       console.error("Error fetching routers:", error);
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   }, [state.filter, state.searchTerm, state.activeRouter]);

//   const fetchHotspotUsers = useCallback(async (routerId) => {
//     if (!routerId) return;
//     try {
//       const response = await api.get(`/api/network_management/routers/${routerId}/hotspot-users/`);
//       dispatch({ type: "SET_HOTSPOT_USERS", payload: response.data });
//     } catch (error) {
//       console.error("Error fetching hotspot users:", error);
//     }
//   }, []);

//   const fetchPPPoEUsers = useCallback(async (routerId) => {
//     if (!routerId) return;
//     try {
//       const response = await api.get(`/api/network_management/routers/${routerId}/pppoe-users/`);
//       dispatch({ type: "SET_PPPOE_USERS", payload: response.data });
//     } catch (error) {
//       console.error("Error fetching PPPoE users:", error);
//     }
//   }, []);

//   const fetchSessionHistory = useCallback(async (userId, userType = "hotspot") => {
//     if (!userId) return;
//     try {
//       const endpoint = userType === "hotspot" 
//         ? `/api/network_management/hotspot-users/${userId}/session-history/`
//         : `/api/network_management/pppoe-users/${userId}/session-history/`;
      
//       const response = await api.get(endpoint);
//       dispatch({ type: "SET_SESSION_HISTORY", payload: response.data });
//     } catch (error) {
//       console.error("Error fetching session history:", error);
//     }
//   }, []);

//   const fetchCallbackConfigs = useCallback(async (routerId) => {
//     if (!routerId) return;
//     try {
//       const response = await api.get(`/api/network_management/routers/${routerId}/callback-configs/`);
//       dispatch({ type: "SET_CALLBACK_CONFIGS", payload: response.data });
//     } catch (error) {
//       console.error("Error fetching callback configs:", error);
//     }
//   }, []);

//   const addRouter = useCallback(async () => {
//     // Validate required fields
//     const requiredFields = ["name", "ip", "type"];
//     const missingFields = requiredFields.filter(field => !state.routerForm[field]);
    
//     if (missingFields.length > 0) {
//       missingFields.forEach(field => {
//         dispatch({ type: "SET_TOUCHED_FIELD", field });
//       });
//       toast.warn("Please fill in all required fields");
//       return;
//     }

//     dispatch({ type: "SET_LOADING", payload: true });
//     try {
//       const response = await api.post("/api/network_management/routers/", state.routerForm);
//       dispatch({ type: "SET_ROUTERS", payload: [...state.routers, response.data] });
//       dispatch({ type: "SET_ACTIVE_ROUTER", payload: response.data });
//       dispatch({ type: "TOGGLE_MODAL", modal: "addRouter" });
//       dispatch({ type: "RESET_ROUTER_FORM" });
//       toast.success("Router added successfully");
//     } catch (error) {
//       toast.error("Failed to add router");
//       console.error("Error adding router:", error);
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   }, [state.routerForm, state.routers]);

//   const updateRouter = useCallback(async (id) => {
//     dispatch({ type: "SET_LOADING", payload: true });
//     try {
//       const response = await api.put(`/api/network_management/routers/${id}/`, state.routerForm);
//       dispatch({ type: "UPDATE_ROUTER", payload: { id, data: response.data } });
//       dispatch({ type: "TOGGLE_MODAL", modal: "editRouter" });
//       toast.success("Router updated successfully");
//     } catch (error) {
//       toast.error("Failed to update router");
//       console.error("Error updating router:", error);
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   }, [state.routerForm]);

//   const deleteRouter = useCallback(async (id) => {
//     dispatch({ type: "SET_LOADING", payload: true });
//     try {
//       await api.delete(`/api/network_management/routers/${id}/`);
//       dispatch({ type: "DELETE_ROUTER", id });
//       toast.success("Router deleted successfully");
//     } catch (error) {
//       toast.error("Failed to delete router");
//       console.error("Error deleting router:", error);
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   }, []);

//   const updateRouterStatus = useCallback(async (routerId, newStatus) => {
//     dispatch({ type: "SET_LOADING", payload: true });
//     try {
//       await api.put(`/api/network_management/routers/${routerId}/`, {
//         status: newStatus
//       });

//       // Optimistic update
//       dispatch({ type: "UPDATE_ROUTER", payload: { 
//         id: routerId, 
//         data: { status: newStatus } 
//       }});
      
//       toast.success(`Router ${newStatus === 'connected' ? 'activated' : 'deactivated'} successfully!`);
//     } catch (error) {
//       toast.error("Failed to update router status");
//       console.error("Error updating router status:", error);
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   }, []);

//   const restartRouter = useCallback(async (routerId) => {
//     dispatch({ type: "SET_LOADING", payload: true });
//     try {
//       await api.post(`/api/network_management/routers/${routerId}/reboot/`);
//       dispatch({ type: "UPDATE_ROUTER", payload: { 
//         id: routerId, 
//         data: { status: "updating" } 
//       }});
//       toast.success("Router restart initiated");
//     } catch (error) {
//       toast.error("Failed to restart router");
//       console.error("Error restarting router:", error);
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   }, []);

//   const fetchRouterStats = useCallback(async (routerId) => {
//     if (!routerId) return;
//     dispatch({ type: "SET_STATS_LOADING", payload: true });
//     try {
//       const response = await api.get(`/api/network_management/routers/${routerId}/stats/`);
//       dispatch({ 
//         type: "SET_ROUTER_STATS", 
//         payload: { routerId, stats: response.data } 
//       });
//       dispatch({ type: "TOGGLE_MODAL", modal: "routerStats" });
//     } catch (error) {
//       toast.error("Failed to fetch router stats");
//       console.error("Error fetching router stats:", error);
//     } finally {
//       dispatch({ type: "SET_STATS_LOADING", payload: false });
//     }
//   }, []);

//   const configureHotspot = useCallback(async () => {
//     if (!state.hotspotForm.landingPage) {
//       toast.warn("Please upload the landing page");
//       return;
//     }
    
//     if (!state.activeRouter) {
//       toast.warn("No active router selected");
//       return;
//     }

//     dispatch({ type: "SET_LOADING", payload: true });
//     try {
//       const formData = new FormData();
//       Object.entries(state.hotspotForm).forEach(([key, value]) => {
//         if (key === "landingPage" && value) {
//           formData.append("landingPage", value);
//         } else if (value) {
//           formData.append(key, value);
//         }
//       });
      
//       await api.post(`/api/network_management/routers/${state.activeRouter.id}/hotspot-config/`, formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });
      
//       dispatch({ type: "TOGGLE_MODAL", modal: "hotspotConfig" });
//       toast.success("Hotspot configured successfully");
//     } catch (error) {
//       toast.error("Failed to configure hotspot");
//       console.error("Error configuring hotspot:", error);
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   }, [state.hotspotForm, state.activeRouter]);

//   const configurePPPoE = useCallback(async () => {
//     if (!state.activeRouter) {
//       toast.warn("No active router selected");
//       return;
//     }

//     dispatch({ type: "SET_LOADING", payload: true });
//     try {
//       const formData = new FormData();
//       Object.entries(state.pppoeForm).forEach(([key, value]) => {
//         if (value) formData.append(key, value);
//       });
      
//       await api.post(`/api/network_management/routers/${state.activeRouter.id}/pppoe-config/`, formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });
      
//       dispatch({ type: "TOGGLE_MODAL", modal: "pppoeConfig" });
//       toast.success("PPPoE configured successfully");
//     } catch (error) {
//       toast.error("Failed to configure PPPoE");
//       console.error("Error configuring PPPoE:", error);
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   }, [state.pppoeForm, state.activeRouter]);

//   const disconnectHotspotUser = useCallback(async (userId) => {
//     dispatch({ type: "SET_LOADING", payload: true });
//     try {
//       await api.delete(`/api/network_management/hotspot-users/${userId}/`);
//       dispatch({ type: "SET_HOTSPOT_USERS", payload: state.hotspotUsers.filter((u) => u.id !== userId) });
//       toast.success("Hotspot user disconnected");
//     } catch (error) {
//       toast.error("Failed to disconnect hotspot user");
//       console.error("Error disconnecting hotspot user:", error);
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   }, [state.hotspotUsers]);

//   const disconnectPPPoEUser = useCallback(async (userId) => {
//     dispatch({ type: "SET_LOADING", payload: true });
//     try {
//       await api.delete(`/api/network_management/pppoe-users/${userId}/`);
//       dispatch({ type: "SET_PPPOE_USERS", payload: state.pppoeUsers.filter((u) => u.id !== userId) });
//       toast.success("PPPoE user disconnected");
//     } catch (error) {
//       toast.error("Failed to disconnect PPPoE user");
//       console.error("Error disconnecting PPPoE user:", error);
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   }, [state.pppoeUsers]);

//   const addCallbackConfig = useCallback(async () => {
//     if (!state.activeRouter) {
//       toast.warn("No active router selected");
//       return;
//     }

//     dispatch({ type: "SET_LOADING", payload: true });
//     try {
//       const response = await api.post(`/api/network_management/routers/${state.activeRouter.id}/callback-configs/`, state.callbackForm);
//       dispatch({ type: "SET_CALLBACK_CONFIGS", payload: [...state.callbackConfigs, response.data] });
//       dispatch({ type: "TOGGLE_MODAL", modal: "callbackConfig" });
//       dispatch({ type: "RESET_CALLBACK_FORM" });
//       toast.success("Callback config added");
//     } catch (error) {
//       toast.error("Failed to add callback config");
//       console.error("Error adding callback config:", error);
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   }, [state.callbackForm, state.callbackConfigs, state.activeRouter]);

//   const deleteCallbackConfig = useCallback(async (id) => {
//     if (!state.activeRouter) return;
    
//     dispatch({ type: "SET_LOADING", payload: true });
//     try {
//       await api.delete(`/api/network_management/routers/${state.activeRouter.id}/callback-configs/${id}/`);
//       dispatch({ type: "SET_CALLBACK_CONFIGS", payload: state.callbackConfigs.filter((cb) => cb.id !== id) });
//       toast.success("Callback config deleted");
//     } catch (error) {
//       toast.error("Failed to delete callback config");
//       console.error("Error deleting callback config:", error);
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   }, [state.callbackConfigs, state.activeRouter]);

//   const restoreSessions = useCallback(async (routerId) => {
//     dispatch({ type: "SET_LOADING", payload: true });
//     try {
//       const response = await api.post(`/api/network_management/routers/${routerId}/restore-sessions/`);
//       toast.success(response.data.message);
//       // Refresh user lists
//       fetchHotspotUsers(routerId);
//       fetchPPPoEUsers(routerId);
//     } catch (error) {
//       toast.error("Failed to restore sessions");
//       console.error("Error restoring sessions:", error);
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   }, [fetchHotspotUsers, fetchPPPoEUsers]);

//   return {
//     state,
//     dispatch,
//     fetchRouters,
//     addRouter,
//     updateRouter,
//     deleteRouter,
//     updateRouterStatus,
//     restartRouter,
//     fetchRouterStats,
//     configureHotspot,
//     configurePPPoE,
//     fetchHotspotUsers,
//     fetchPPPoEUsers,
//     disconnectHotspotUser,
//     disconnectPPPoEUser,
//     fetchSessionHistory,
//     fetchCallbackConfigs,
//     addCallbackConfig,
//     deleteCallbackConfig,
//     restoreSessions,
//     showConfirm,
//     hideConfirm,
//     handleConfirm,
//   };
// };










// src/Pages/NetworkManagement/hooks/useRouterManagement.js
import { useReducer, useCallback, useRef } from "react";
import { toast } from "react-toastify";
import api from "../../../../api";

// Initial State
const initialState = {
  routers: [],
  activeRouter: null,
  isLoading: false,
  modals: {
    addRouter: false,
    editRouter: false,
    hotspotConfig: false,
    pppoeConfig: false,
    users: false,
    sessionHistory: false,
    healthStats: false,
    callbackConfig: false,
    routerStats: false,
    userActivation: false,
    sessionRecovery: false,
    bulkActions: false,
  },
  confirmModal: {
    show: false,
    title: "",
    message: "",
    action: null,
  },
  routerForm: {
    name: "",
    ip: "",
    model: "",
    type: "mikrotik",
    port: "8728",
    username: "admin",
    password: "",
    location: "",
    status: "disconnected",
    is_default: false,
    captive_portal_enabled: true,
    is_active: true,
    max_clients: 50,
    description: "",
  },
  touchedFields: {
    name: false,
    ip: false,
    type: false,
  },
  hotspotForm: {
    ssid: "SurfZone-WiFi",
    landingPage: null,
    redirectUrl: "http://captive.surfzone.local",
    bandwidthLimit: "10M",
    sessionTimeout: "60",
    authMethod: "universal",
  },
  pppoeForm: {
    ip_pool: "pppoe-pool-1",
    service_name: "",
    mtu: 1492,
    dns_servers: "8.8.8.8,1.1.1.1",
    bandwidth_limit: "10M",
  },
  callbackForm: {
    event: "",
    callback_url: "",
    security_level: "medium",
    security_profile: "",
    is_active: true,
    retry_enabled: true,
    max_retries: 3,
    timeout_seconds: 30,
  },
  hotspotUsers: [],
  pppoeUsers: [],
  sessionHistory: [],
  healthStats: [],
  expandedRouter: null,
  selectedUser: null,
  statsData: {},
  searchTerm: "",
  filter: "all",
  statsLoading: false,
  routerStats: {},
  callbackConfigs: [],
  systemMetrics: {},
  // NEW STATE VARIABLES ADDED
  bulkOperations: [],
  auditLogs: [],
  realTimeData: {
    connectedRouters: 0,
    activeSessions: 0,
    systemHealth: 100,
    recentAlerts: []
  },
  webSocketConnected: false
};

// Reducer
const reducer = (state, action) => {
  switch (action.type) {
    case "SET_ROUTERS":
      return { ...state, routers: action.payload };
    case "SET_ACTIVE_ROUTER":
      return { ...state, activeRouter: action.payload };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "TOGGLE_MODAL":
      return { 
        ...state, 
        modals: { ...state.modals, [action.modal]: !state.modals[action.modal] },
        ...(action.modal === "addRouter" && !state.modals[action.modal] && {
          touchedFields: initialState.touchedFields
        })
      };
    case "SET_CONFIRM_MODAL":
      return { 
        ...state, 
        confirmModal: { ...state.confirmModal, ...action.payload } 
      };
    case "UPDATE_ROUTER_FORM":
      return { ...state, routerForm: { ...state.routerForm, ...action.payload } };
    case "UPDATE_HOTSPOT_FORM":
      return { ...state, hotspotForm: { ...state.hotspotForm, ...action.payload } };
    case "UPDATE_PPPOE_FORM":
      return { ...state, pppoeForm: { ...state.pppoeForm, ...action.payload } };
    case "UPDATE_CALLBACK_FORM":
      return { ...state, callbackForm: { ...state.callbackForm, ...action.payload } };
    case "SET_TOUCHED_FIELD":
      return { 
        ...state, 
        touchedFields: { ...state.touchedFields, [action.field]: true } 
      };
    case "RESET_TOUCHED_FIELDS":
      return { ...state, touchedFields: initialState.touchedFields };
    case "SET_HOTSPOT_USERS":
      return { ...state, hotspotUsers: action.payload };
    case "SET_PPPOE_USERS":
      return { ...state, pppoeUsers: action.payload };
    case "SET_SESSION_HISTORY":
      return { ...state, sessionHistory: action.payload };
    case "SET_HEALTH_STATS":
      return { ...state, healthStats: action.payload };
    case "RESET_ROUTER_FORM":
      return { 
        ...state, 
        routerForm: initialState.routerForm,
        touchedFields: initialState.touchedFields
      };
    case "RESET_CALLBACK_FORM":
      return { ...state, callbackForm: initialState.callbackForm };
    case "TOGGLE_ROUTER_EXPANDED":
      return { ...state, expandedRouter: state.expandedRouter === action.id ? null : action.id };
    case "UPDATE_ROUTER":
      return {
        ...state,
        routers: state.routers.map((r) => (r.id === action.payload.id ? { ...r, ...action.payload.data } : r)),
        activeRouter: state.activeRouter?.id === action.payload.id ? { ...state.activeRouter, ...action.payload.data } : state.activeRouter,
      };
    case "DELETE_ROUTER":
      return {
        ...state,
        routers: state.routers.filter((r) => r.id !== action.id),
        activeRouter: state.activeRouter?.id === action.id ? null : state.activeRouter,
      };
    case "SET_STATS_DATA":
      return { ...state, statsData: action.payload };
    case "SET_SELECTED_USER":
      return { ...state, selectedUser: action.payload };
    case "SET_SEARCH_TERM":
      return { ...state, searchTerm: action.payload };
    case "SET_FILTER":
      return { ...state, filter: action.payload };
    case "SET_STATS_LOADING":
      return { ...state, statsLoading: action.payload };
    case "SET_ROUTER_STATS":
      return { 
        ...state, 
        routerStats: { ...state.routerStats, [action.payload.routerId]: action.payload.stats } 
      };
    case "SET_CALLBACK_CONFIGS":
      return { ...state, callbackConfigs: action.payload };
    case "SET_SYSTEM_METRICS":
      return { 
        ...state, 
        systemMetrics: { ...state.systemMetrics, [action.payload.routerId]: action.payload.metrics } 
      };
    
    // NEW REDUCER CASES ADDED
    case "SET_BULK_OPERATIONS":
      return { ...state, bulkOperations: action.payload };
    case "SET_AUDIT_LOGS":
      return { ...state, auditLogs: action.payload };
    case "SET_WEBSOCKET_CONNECTED":
      return { ...state, webSocketConnected: action.payload };
    case "UPDATE_BULK_OPERATION":
      return {
        ...state,
        bulkOperations: state.bulkOperations.map(op =>
          op.operation_id === action.payload.operation_id
            ? { ...op, ...action.payload }
            : op
        )
      };
    case "SET_REAL_TIME_DATA":
      return {
        ...state,
        realTimeData: { ...state.realTimeData, ...action.payload }
      };
    case "UPDATE_HEALTH_STATS":
      return {
        ...state,
        routerStats: {
          ...state.routerStats,
          [action.payload.routerId]: {
            ...state.routerStats[action.payload.routerId],
            ...action.payload.stats
          }
        }
      };
    default:
      return state;
  }
};

export const useRouterManagement = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const activeRouterRef = useRef(state.activeRouter);

  // Update active router ref
  if (state.activeRouter !== activeRouterRef.current) {
    activeRouterRef.current = state.activeRouter;
  }

  // Helper functions
  const showConfirm = useCallback((title, message, action) => {
    dispatch({ 
      type: "SET_CONFIRM_MODAL", 
      payload: { show: true, title, message, action } 
    });
  }, []);

  const hideConfirm = useCallback(() => {
    dispatch({ type: "SET_CONFIRM_MODAL", payload: { show: false } });
  }, []);

  const handleConfirm = useCallback(() => {
    if (state.confirmModal.action) {
      state.confirmModal.action();
    }
    hideConfirm();
  }, [state.confirmModal.action, hideConfirm]);

  // API Functions
  const fetchRouters = useCallback(async () => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const response = await api.get("/api/network_management/routers/", {
        params: { 
          status: state.filter !== "all" ? state.filter : undefined, 
          search: state.searchTerm || undefined 
        }
      });
      dispatch({ type: "SET_ROUTERS", payload: response.data });
      if (!state.activeRouter && response.data.length > 0) {
        dispatch({ type: "SET_ACTIVE_ROUTER", payload: response.data[0] });
      }
    } catch (error) {
      toast.error("Failed to fetch routers");
      console.error("Error fetching routers:", error);
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [state.filter, state.searchTerm, state.activeRouter]);

  const fetchHotspotUsers = useCallback(async (routerId) => {
    if (!routerId) return;
    try {
      const response = await api.get(`/api/network_management/routers/${routerId}/hotspot-users/`);
      dispatch({ type: "SET_HOTSPOT_USERS", payload: response.data });
    } catch (error) {
      console.error("Error fetching hotspot users:", error);
    }
  }, []);

  const fetchPPPoEUsers = useCallback(async (routerId) => {
    if (!routerId) return;
    try {
      const response = await api.get(`/api/network_management/routers/${routerId}/pppoe-users/`);
      dispatch({ type: "SET_PPPOE_USERS", payload: response.data });
    } catch (error) {
      console.error("Error fetching PPPoE users:", error);
    }
  }, []);

  const fetchSessionHistory = useCallback(async (userId, userType = "hotspot") => {
    if (!userId) return;
    try {
      const endpoint = userType === "hotspot" 
        ? `/api/network_management/hotspot-users/${userId}/session-history/`
        : `/api/network_management/pppoe-users/${userId}/session-history/`;
      
      const response = await api.get(endpoint);
      dispatch({ type: "SET_SESSION_HISTORY", payload: response.data });
    } catch (error) {
      console.error("Error fetching session history:", error);
    }
  }, []);

  const fetchCallbackConfigs = useCallback(async (routerId) => {
    if (!routerId) return;
    try {
      const response = await api.get(`/api/network_management/routers/${routerId}/callback-configs/`);
      dispatch({ type: "SET_CALLBACK_CONFIGS", payload: response.data });
    } catch (error) {
      console.error("Error fetching callback configs:", error);
    }
  }, []);

  // NEW API FUNCTIONS ADDED
  const fetchBulkOperations = useCallback(async () => {
    try {
      const response = await api.get("/api/network_management/bulk-operations/history/");
      dispatch({ type: "SET_BULK_OPERATIONS", payload: response.data });
    } catch (error) {
      console.error("Error fetching bulk operations:", error);
    }
  }, []);

  const fetchAuditLogs = useCallback(async (filters = {}) => {
    try {
      const response = await api.get("/api/network_management/audit-logs/", { params: filters });
      dispatch({ type: "SET_AUDIT_LOGS", payload: response.data });
    } catch (error) {
      console.error("Error fetching audit logs:", error);
    }
  }, []);

  const performBulkAction = useCallback(async (actionData) => {
    try {
      const response = await api.post("/api/network_management/bulk-operations/", actionData);
      toast.success("Bulk operation started successfully");
      return response.data;
    } catch (error) {
      toast.error("Failed to start bulk operation");
      console.error("Bulk operation error:", error);
      throw error;
    }
  }, []);

  const addRouter = useCallback(async () => {
    // Validate required fields
    const requiredFields = ["name", "ip", "type"];
    const missingFields = requiredFields.filter(field => !state.routerForm[field]);
    
    if (missingFields.length > 0) {
      missingFields.forEach(field => {
        dispatch({ type: "SET_TOUCHED_FIELD", field });
      });
      toast.warn("Please fill in all required fields");
      return;
    }

    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const response = await api.post("/api/network_management/routers/", state.routerForm);
      dispatch({ type: "SET_ROUTERS", payload: [...state.routers, response.data] });
      dispatch({ type: "SET_ACTIVE_ROUTER", payload: response.data });
      dispatch({ type: "TOGGLE_MODAL", modal: "addRouter" });
      dispatch({ type: "RESET_ROUTER_FORM" });
      toast.success("Router added successfully");
    } catch (error) {
      toast.error("Failed to add router");
      console.error("Error adding router:", error);
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [state.routerForm, state.routers]);

  const updateRouter = useCallback(async (id) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const response = await api.put(`/api/network_management/routers/${id}/`, state.routerForm);
      dispatch({ type: "UPDATE_ROUTER", payload: { id, data: response.data } });
      dispatch({ type: "TOGGLE_MODAL", modal: "editRouter" });
      toast.success("Router updated successfully");
    } catch (error) {
      toast.error("Failed to update router");
      console.error("Error updating router:", error);
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [state.routerForm]);

  const deleteRouter = useCallback(async (id) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      await api.delete(`/api/network_management/routers/${id}/`);
      dispatch({ type: "DELETE_ROUTER", id });
      toast.success("Router deleted successfully");
    } catch (error) {
      toast.error("Failed to delete router");
      console.error("Error deleting router:", error);
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  const updateRouterStatus = useCallback(async (routerId, newStatus) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      await api.put(`/api/network_management/routers/${routerId}/`, {
        status: newStatus
      });

      // Optimistic update
      dispatch({ type: "UPDATE_ROUTER", payload: { 
        id: routerId, 
        data: { status: newStatus } 
      }});
      
      toast.success(`Router ${newStatus === 'connected' ? 'activated' : 'deactivated'} successfully!`);
    } catch (error) {
      toast.error("Failed to update router status");
      console.error("Error updating router status:", error);
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  const restartRouter = useCallback(async (routerId) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      await api.post(`/api/network_management/routers/${routerId}/reboot/`);
      dispatch({ type: "UPDATE_ROUTER", payload: { 
        id: routerId, 
        data: { status: "updating" } 
      }});
      toast.success("Router restart initiated");
    } catch (error) {
      toast.error("Failed to restart router");
      console.error("Error restarting router:", error);
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  const fetchRouterStats = useCallback(async (routerId) => {
    if (!routerId) return;
    dispatch({ type: "SET_STATS_LOADING", payload: true });
    try {
      const response = await api.get(`/api/network_management/routers/${routerId}/stats/`);
      dispatch({ 
        type: "SET_ROUTER_STATS", 
        payload: { routerId, stats: response.data } 
      });
      dispatch({ type: "TOGGLE_MODAL", modal: "routerStats" });
    } catch (error) {
      toast.error("Failed to fetch router stats");
      console.error("Error fetching router stats:", error);
    } finally {
      dispatch({ type: "SET_STATS_LOADING", payload: false });
    }
  }, []);

  const configureHotspot = useCallback(async () => {
    if (!state.hotspotForm.landingPage) {
      toast.warn("Please upload the landing page");
      return;
    }
    
    if (!state.activeRouter) {
      toast.warn("No active router selected");
      return;
    }

    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const formData = new FormData();
      Object.entries(state.hotspotForm).forEach(([key, value]) => {
        if (key === "landingPage" && value) {
          formData.append("landingPage", value);
        } else if (value) {
          formData.append(key, value);
        }
      });
      
      await api.post(`/api/network_management/routers/${state.activeRouter.id}/hotspot-config/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      dispatch({ type: "TOGGLE_MODAL", modal: "hotspotConfig" });
      toast.success("Hotspot configured successfully");
    } catch (error) {
      toast.error("Failed to configure hotspot");
      console.error("Error configuring hotspot:", error);
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [state.hotspotForm, state.activeRouter]);

  const configurePPPoE = useCallback(async () => {
    if (!state.activeRouter) {
      toast.warn("No active router selected");
      return;
    }

    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const formData = new FormData();
      Object.entries(state.pppoeForm).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });
      
      await api.post(`/api/network_management/routers/${state.activeRouter.id}/pppoe-config/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      dispatch({ type: "TOGGLE_MODAL", modal: "pppoeConfig" });
      toast.success("PPPoE configured successfully");
    } catch (error) {
      toast.error("Failed to configure PPPoE");
      console.error("Error configuring PPPoE:", error);
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [state.pppoeForm, state.activeRouter]);

  const disconnectHotspotUser = useCallback(async (userId) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      await api.delete(`/api/network_management/hotspot-users/${userId}/`);
      dispatch({ type: "SET_HOTSPOT_USERS", payload: state.hotspotUsers.filter((u) => u.id !== userId) });
      toast.success("Hotspot user disconnected");
    } catch (error) {
      toast.error("Failed to disconnect hotspot user");
      console.error("Error disconnecting hotspot user:", error);
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [state.hotspotUsers]);

  const disconnectPPPoEUser = useCallback(async (userId) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      await api.delete(`/api/network_management/pppoe-users/${userId}/`);
      dispatch({ type: "SET_PPPOE_USERS", payload: state.pppoeUsers.filter((u) => u.id !== userId) });
      toast.success("PPPoE user disconnected");
    } catch (error) {
      toast.error("Failed to disconnect PPPoE user");
      console.error("Error disconnecting PPPoE user:", error);
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [state.pppoeUsers]);

  const addCallbackConfig = useCallback(async () => {
    if (!state.activeRouter) {
      toast.warn("No active router selected");
      return;
    }

    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const response = await api.post(`/api/network_management/routers/${state.activeRouter.id}/callback-configs/`, state.callbackForm);
      dispatch({ type: "SET_CALLBACK_CONFIGS", payload: [...state.callbackConfigs, response.data] });
      dispatch({ type: "TOGGLE_MODAL", modal: "callbackConfig" });
      dispatch({ type: "RESET_CALLBACK_FORM" });
      toast.success("Callback config added");
    } catch (error) {
      toast.error("Failed to add callback config");
      console.error("Error adding callback config:", error);
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [state.callbackForm, state.callbackConfigs, state.activeRouter]);

  const deleteCallbackConfig = useCallback(async (id) => {
    if (!state.activeRouter) return;
    
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      await api.delete(`/api/network_management/routers/${state.activeRouter.id}/callback-configs/${id}/`);
      dispatch({ type: "SET_CALLBACK_CONFIGS", payload: state.callbackConfigs.filter((cb) => cb.id !== id) });
      toast.success("Callback config deleted");
    } catch (error) {
      toast.error("Failed to delete callback config");
      console.error("Error deleting callback config:", error);
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [state.callbackConfigs, state.activeRouter]);

  const restoreSessions = useCallback(async (routerId) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const response = await api.post(`/api/network_management/routers/${routerId}/restore-sessions/`);
      toast.success(response.data.message);
      // Refresh user lists
      fetchHotspotUsers(routerId);
      fetchPPPoEUsers(routerId);
    } catch (error) {
      toast.error("Failed to restore sessions");
      console.error("Error restoring sessions:", error);
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [fetchHotspotUsers, fetchPPPoEUsers]);

  return {
    state,
    dispatch,
    fetchRouters,
    addRouter,
    updateRouter,
    deleteRouter,
    updateRouterStatus,
    restartRouter,
    fetchRouterStats,
    configureHotspot,
    configurePPPoE,
    fetchHotspotUsers,
    fetchPPPoEUsers,
    disconnectHotspotUser,
    disconnectPPPoEUser,
    fetchSessionHistory,
    fetchCallbackConfigs,
    addCallbackConfig,
    deleteCallbackConfig,
    restoreSessions,
    showConfirm,
    hideConfirm,
    handleConfirm,
    // NEW FUNCTIONS ADDED TO RETURN STATEMENT
    fetchBulkOperations,
    fetchAuditLogs,
    performBulkAction,
  };
};