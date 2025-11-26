





// // src/Pages/NetworkManagement/hooks/useRouterManagement.js
// import { useReducer, useCallback, useRef } from "react";
// import { toast } from "react-hot-toast";
// import api from "../../../../api";

// // Enhanced Initial State with validation flags
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
//     scriptConfiguration: false,
//     diagnostics: false,
//     connectionTest: false,
//     vpnConfiguration: false,
//     technicianWorkflow: false,
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
//     connection_status: "disconnected",
//     configuration_status: "not_configured",
//     configuration_type: "",
//     is_default: false,
//     captive_portal_enabled: true,
//     is_active: true,
//     max_clients: 50,
//     description: "",
//     ssid: "",
//     firmware_version: "",
//     auto_test_connection: true,
//   },
//   touchedFields: {
//     name: false,
//     ip: false,
//     type: false,
//   },
//   hotspotForm: {
//     ssid: "SurfZone-WiFi",
//     landing_page_file: null,
//     redirect_url: "http://captive.surfzone.local",
//     bandwidth_limit: "10M",
//     session_timeout: 60,
//     auth_method: "universal",
//     enable_splash_page: true,
//     allow_social_login: false,
//     enable_bandwidth_shaping: true,
//     log_user_activity: true,
//     max_users: 50,
//     auto_apply: true,
//   },
//   pppoeForm: {
//     ip_pool_name: "pppoe-pool-1",
//     service_name: "",
//     mtu: 1492,
//     dns_servers: "8.8.8.8,1.1.1.1",
//     bandwidth_limit: "10M",
//     auth_methods: "all",
//     enable_pap: true,
//     enable_chap: true,
//     enable_mschap: true,
//     idle_timeout: 300,
//     session_timeout: 0,
//     default_profile: "default",
//     interface: "bridge",
//     ip_range_start: "192.168.100.10",
//     ip_range_end: "192.168.100.200",
//     service_type: "standard",
//     auto_apply: true,
//   },
//   scriptForm: {
//     script_type: "basic_setup",
//     parameters: {},
//     dry_run: false,
//   },
//   vpnForm: {
//     vpn_type: "openvpn",
//     configuration: {},
//     generate_certificates: true,
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
//   healthStats: {},
//   expandedRouter: null,
//   selectedUser: null,
//   statsData: {},
//   searchTerm: "",
//   filter: "all",
//   statsLoading: false,
//   routerStats: {},
//   callbackConfigs: [],
//   systemMetrics: {},
//   connectionTests: {},
//   bulkOperations: [],
//   auditLogs: [],
//   realTimeData: {
//     connectedRouters: 0,
//     activeSessions: 0,
//     systemHealth: 100,
//     recentAlerts: []
//   },
//   webSocketConnected: false,
//   monitoringView: "overview",
//   connectionHistory: {},
//   configurationTemplates: [],
//   availableScripts: [],
//   diagnosticsData: {},
//   errors: {
//     fetchRouters: null,
//     form: {},
//     connection: null
//   },
//   hasData: false,
//   lastUpdated: null,
// };

// // Enhanced Reducer with error handling
// const reducer = (state, action) => {
//   switch (action.type) {
//     case "SET_ROUTERS":
//       return { 
//         ...state, 
//         routers: action.payload,
//         hasData: action.payload.length > 0,
//         lastUpdated: new Date().toISOString()
//       };
//     case "SET_ACTIVE_ROUTER":
//       return { ...state, activeRouter: action.payload };
//     case "SET_LOADING":
//       return { ...state, isLoading: action.payload };
//     case "TOGGLE_MODAL":
//       return { 
//         ...state, 
//         modals: { ...state.modals, [action.modal]: !state.modals[action.modal] },
//         ...(action.modal === "addRouter" && !state.modals[action.modal] && {
//           touchedFields: initialState.touchedFields,
//           errors: { ...state.errors, form: {} }
//         })
//       };
//     case "SET_CONFIRM_MODAL":
//       return { 
//         ...state, 
//         confirmModal: { ...state.confirmModal, ...action.payload } 
//       };
//     case "UPDATE_ROUTER_FORM":
//       return { 
//         ...state, 
//         routerForm: { ...state.routerForm, ...action.payload },
//         errors: { ...state.errors, form: {} }
//       };
//     case "UPDATE_HOTSPOT_FORM":
//       return { ...state, hotspotForm: { ...state.hotspotForm, ...action.payload } };
//     case "UPDATE_PPPOE_FORM":
//       return { ...state, pppoeForm: { ...state.pppoeForm, ...action.payload } };
//     case "UPDATE_SCRIPT_FORM":
//       return { ...state, scriptForm: { ...state.scriptForm, ...action.payload } };
//     case "UPDATE_VPN_FORM":
//       return { ...state, vpnForm: { ...state.vpnForm, ...action.payload } };
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
//         touchedFields: initialState.touchedFields,
//         errors: { ...state.errors, form: {} }
//       };
//     case "RESET_CALLBACK_FORM":
//       return { ...state, callbackForm: initialState.callbackForm };
//     case "RESET_SCRIPT_FORM":
//       return { ...state, scriptForm: initialState.scriptForm };
//     case "RESET_VPN_FORM":
//       return { ...state, vpnForm: initialState.vpnForm };
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
//     case "SET_CONNECTION_TESTS":
//       return { 
//         ...state, 
//         connectionTests: { ...state.connectionTests, [action.payload.routerId]: action.payload.tests } 
//       };
//     case "SET_BULK_OPERATIONS":
//       return { ...state, bulkOperations: action.payload };
//     case "SET_AUDIT_LOGS":
//       return { ...state, auditLogs: action.payload };
//     case "SET_WEBSOCKET_CONNECTED":
//       return { ...state, webSocketConnected: action.payload };
//     case "UPDATE_BULK_OPERATION":
//       return {
//         ...state,
//         bulkOperations: state.bulkOperations.map(op =>
//           op.operation_id === action.payload.operation_id
//             ? { ...op, ...action.payload }
//             : op
//         )
//       };
//     case "SET_REAL_TIME_DATA":
//       return {
//         ...state,
//         realTimeData: { ...state.realTimeData, ...action.payload }
//       };
//     case "UPDATE_HEALTH_STATS":
//       return {
//         ...state,
//         routerStats: {
//           ...state.routerStats,
//           [action.payload.routerId]: {
//             ...state.routerStats[action.payload.routerId],
//             ...action.payload.stats
//           }
//         }
//       };
//     case "SET_MONITORING_VIEW":
//       return { ...state, monitoringView: action.payload };
//     case "SET_CONNECTION_HISTORY":
//       return { 
//         ...state, 
//         connectionHistory: { ...state.connectionHistory, [action.payload.routerId]: action.payload.history } 
//       };
//     case "SET_CONFIGURATION_TEMPLATES":
//       return { ...state, configurationTemplates: action.payload };
//     case "SET_AVAILABLE_SCRIPTS":
//       return { ...state, availableScripts: action.payload };
//     case "SET_DIAGNOSTICS_DATA":
//       return { 
//         ...state, 
//         diagnosticsData: { ...state.diagnosticsData, [action.payload.routerId]: action.payload.data } 
//       };
//     case "SET_ERROR":
//       return {
//         ...state,
//         errors: { ...state.errors, [action.payload.field]: action.payload.message }
//       };
//     case "CLEAR_ERROR":
//       return {
//         ...state,
//         errors: { ...state.errors, [action.payload.field]: null }
//       };
//     case "RESET_ERRORS":
//       return {
//         ...state,
//         errors: initialState.errors
//       };
//     default:
//       return state;
//   }
// };

// // Validation utilities
// const validateRouterForm = (formData) => {
//   const errors = {};
  
//   if (!formData.name?.trim()) {
//     errors.name = "Router name is required";
//   }
  
//   if (!formData.ip?.trim()) {
//     errors.ip = "IP address is required";
//   } else {
//     const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
//     if (!ipRegex.test(formData.ip)) {
//       errors.ip = "Invalid IP address format";
//     }
//   }
  
//   if (!formData.type) {
//     errors.type = "Router type is required";
//   }
  
//   if (!formData.username?.trim()) {
//     errors.username = "Username is required";
//   }
  
//   return errors;
// };

// const validateHotspotForm = (formData) => {
//   const errors = {};
  
//   if (!formData.ssid?.trim()) {
//     errors.ssid = "SSID is required";
//   }
  
//   if (!formData.bandwidth_limit?.trim()) {
//     errors.bandwidth_limit = "Bandwidth limit is required";
//   }
  
//   if (!formData.session_timeout || formData.session_timeout < 1) {
//     errors.session_timeout = "Session timeout must be at least 1 minute";
//   }
  
//   return errors;
// };

// export const useRouterManagement = () => {
//   const [state, dispatch] = useReducer(reducer, initialState);
//   const activeRouterRef = useRef(state.activeRouter);

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

//   // Enhanced API Functions
//   const fetchRouters = useCallback(async (options = {}) => {
//     const { showToast = true, silent = false } = options;
    
//     if (!silent) {
//       dispatch({ type: "SET_LOADING", payload: true });
//     }
    
//     try {
//       const response = await api.get("/api/network_management/routers/", {
//         params: { 
//           status: state.filter !== "all" ? state.filter : undefined,
//           connection_status: state.filter !== "all" ? state.filter : undefined,
//           configuration_status: state.filter !== "all" ? state.filter : undefined,
//           search: state.searchTerm || undefined,
//           type: state.filter !== "all" ? state.filter : undefined,
//         }
//       });
      
//       const routers = Array.isArray(response.data) ? response.data : [];
      
//       dispatch({ type: "SET_ROUTERS", payload: routers });
//       dispatch({ type: "CLEAR_ERROR", payload: { field: 'fetchRouters' } });
      
//       if (!state.activeRouter && routers.length > 0) {
//         dispatch({ type: "SET_ACTIVE_ROUTER", payload: routers[0] });
//       }
      
//       if (showToast && routers.length === 0) {
//         toast.success("No routers found. Add your first router to get started!");
//       }
      
//       return routers;
//     } catch (error) {
//       const errorMessage = error.response?.data?.error || error.message || "Failed to fetch routers";
      
//       dispatch({ 
//         type: "SET_ERROR", 
//         payload: { field: 'fetchRouters', message: errorMessage } 
//       });
      
//       if (showToast) {
//         if (error.response?.status === 404) {
//           toast.error("Routers endpoint not found. Please check backend configuration.");
//         } else if (error.response?.status === 401) {
//           toast.error("Authentication failed. Please log in again.");
//         } else {
//           toast.error(errorMessage);
//         }
//       }
      
//       console.error("Error fetching routers:", error);
//       dispatch({ type: "SET_ROUTERS", payload: [] });
//       throw error;
//     } finally {
//       if (!silent) {
//         dispatch({ type: "SET_LOADING", payload: false });
//       }
//     }
//   }, [state.filter, state.searchTerm, state.activeRouter]);

//   const fetchHotspotUsers = useCallback(async (routerId, options = {}) => {
//     if (!routerId) {
//       toast.error("No router selected");
//       return [];
//     }
    
//     const { showToast = true } = options;
    
//     try {
//       const response = await api.get(`/api/network_management/routers/${routerId}/hotspot-users/`);
//       const users = Array.isArray(response.data) ? response.data : [];
      
//       dispatch({ type: "SET_HOTSPOT_USERS", payload: users });
      
//       if (showToast && users.length === 0) {
//         toast("No hotspot users found", { icon: 'ℹ️' });
//       }
      
//       return users;
//     } catch (error) {
//       const errorMessage = error.response?.data?.error || `Failed to fetch hotspot users: ${error.message}`;
      
//       if (showToast) {
//         if (error.response?.status === 404) {
//           toast.error("Hotspot users endpoint not found");
//         } else {
//           toast.error(errorMessage);
//         }
//       }
      
//       console.error("Error fetching hotspot users:", error);
//       dispatch({ type: "SET_HOTSPOT_USERS", payload: [] });
//       throw error;
//     }
//   }, []);

//   const fetchPPPoEUsers = useCallback(async (routerId, options = {}) => {
//     if (!routerId) {
//       toast.error("No router selected");
//       return [];
//     }
    
//     const { showToast = true } = options;
    
//     try {
//       const response = await api.get(`/api/network_management/routers/${routerId}/pppoe-users/`);
//       const users = Array.isArray(response.data) ? response.data : [];
      
//       dispatch({ type: "SET_PPPOE_USERS", payload: users });
      
//       if (showToast && users.length === 0) {
//         toast("No PPPoE users found", { icon: 'ℹ️' });
//       }
      
//       return users;
//     } catch (error) {
//       const errorMessage = error.response?.data?.error || `Failed to fetch PPPoE users: ${error.message}`;
      
//       if (showToast) {
//         if (error.response?.status === 404) {
//           toast.error("PPPoE users endpoint not found");
//         } else {
//           toast.error(errorMessage);
//         }
//       }
      
//       console.error("Error fetching PPPoE users:", error);
//       dispatch({ type: "SET_PPPOE_USERS", payload: [] });
//       throw error;
//     }
//   }, []);

//   const fetchSessionHistory = useCallback(async (userId, userType = "hotspot", options = {}) => {
//     if (!userId) {
//       toast.error("No user selected");
//       return [];
//     }
    
//     const { showToast = true } = options;
    
//     try {
//       const endpoint = userType === "hotspot" 
//         ? `/api/network_management/hotspot-users/${userId}/session-history/`
//         : `/api/network_management/pppoe-users/${userId}/session-history/`;
      
//       const response = await api.get(endpoint);
//       const history = Array.isArray(response.data) ? response.data : [];
      
//       dispatch({ type: "SET_SESSION_HISTORY", payload: history });
      
//       if (showToast && history.length === 0) {
//         toast("No session history found", { icon: 'ℹ️' });
//       }
      
//       return history;
//     } catch (error) {
//       const errorMessage = error.response?.data?.error || `Failed to fetch session history: ${error.message}`;
      
//       if (showToast && error.response?.status !== 404) {
//         toast.error(errorMessage);
//       }
      
//       console.error("Error fetching session history:", error);
//       dispatch({ type: "SET_SESSION_HISTORY", payload: [] });
//       throw error;
//     }
//   }, []);

//   const fetchCallbackConfigs = useCallback(async (routerId, options = {}) => {
//     if (!routerId) {
//       toast.error("No router selected");
//       return [];
//     }
    
//     const { showToast = true } = options;
    
//     try {
//       const response = await api.get(`/api/network_management/routers/${routerId}/callback-configs/`);
//       const configs = Array.isArray(response.data) ? response.data : [];
      
//       dispatch({ type: "SET_CALLBACK_CONFIGS", payload: configs });
      
//       if (showToast && configs.length === 0) {
//         toast("No callback configurations found", { icon: 'ℹ️' });
//       }
      
//       return configs;
//     } catch (error) {
//       const errorMessage = error.response?.data?.error || `Failed to fetch callback configs: ${error.message}`;
      
//       if (showToast && error.response?.status !== 404) {
//         toast.error(errorMessage);
//       }
      
//       console.error("Error fetching callback configs:", error);
//       dispatch({ type: "SET_CALLBACK_CONFIGS", payload: [] });
//       throw error;
//     }
//   }, []);

//   const fetchBulkOperations = useCallback(async (options = {}) => {
//     const { showToast = true } = options;
    
//     try {
//       const response = await api.get("/api/network_management/bulk-operations/history/");
//       const operations = Array.isArray(response.data) ? response.data : [];
      
//       dispatch({ type: "SET_BULK_OPERATIONS", payload: operations });
      
//       if (showToast && operations.length === 0) {
//         toast("No bulk operations history found", { icon: 'ℹ️' });
//       }
      
//       return operations;
//     } catch (error) {
//       const errorMessage = error.response?.data?.error || `Failed to fetch bulk operations: ${error.message}`;
      
//       if (showToast && error.response?.status !== 404) {
//         toast.error(errorMessage);
//       }
      
//       console.error("Error fetching bulk operations:", error);
//       dispatch({ type: "SET_BULK_OPERATIONS", payload: [] });
//       throw error;
//     }
//   }, []);

//   const fetchAuditLogs = useCallback(async (filters = {}, options = {}) => {
//     const { showToast = true } = options;
    
//     try {
//       const response = await api.get("/api/network_management/audit-logs/", { params: filters });
//       const logs = Array.isArray(response.data) ? response.data : [];
      
//       dispatch({ type: "SET_AUDIT_LOGS", payload: logs });
      
//       if (showToast && logs.length === 0) {
//         toast("No audit logs found", { icon: 'ℹ️' });
//       }
      
//       return logs;
//     } catch (error) {
//       const errorMessage = error.response?.data?.error || `Failed to fetch audit logs: ${error.message}`;
      
//       if (showToast && error.response?.status !== 404) {
//         toast.error(errorMessage);
//       }
      
//       console.error("Error fetching audit logs:", error);
//       dispatch({ type: "SET_AUDIT_LOGS", payload: [] });
//       throw error;
//     }
//   }, []);

//   const fetchConfigurationTemplates = useCallback(async (options = {}) => {
//     const { showToast = true } = options;
    
//     try {
//       const response = await api.get("/api/network_management/configuration-templates/");
//       const templates = Array.isArray(response.data) ? response.data : [];
      
//       dispatch({ type: "SET_CONFIGURATION_TEMPLATES", payload: templates });
      
//       if (showToast && templates.length === 0) {
//         toast("No configuration templates found", { icon: 'ℹ️' });
//       }
      
//       return templates;
//     } catch (error) {
//       const errorMessage = error.response?.data?.error || `Failed to fetch configuration templates: ${error.message}`;
      
//       if (showToast) {
//         if (error.response?.status === 404) {
//           toast.error("Configuration templates endpoint not found");
//         } else {
//           toast.error(errorMessage);
//         }
//       }
      
//       console.error("Error fetching configuration templates:", error);
//       dispatch({ type: "SET_CONFIGURATION_TEMPLATES", payload: [] });
//       throw error;
//     }
//   }, []);

//   // Enhanced Router CRUD Operations
//   const addRouter = useCallback(async () => {
//     const formErrors = validateRouterForm(state.routerForm);
    
//     if (Object.keys(formErrors).length > 0) {
//       Object.keys(formErrors).forEach(field => {
//         dispatch({ type: "SET_TOUCHED_FIELD", field });
//       });
      
//       Object.entries(formErrors).forEach(([field, message]) => {
//         dispatch({ 
//           type: "SET_ERROR", 
//           payload: { field: `form.${field}`, message } 
//         });
//       });
      
//       toast.error("Please fix the form errors before submitting");
//       return;
//     }

//     dispatch({ type: "SET_LOADING", payload: true });
    
//     try {
//       const response = await api.post("/api/network_management/routers/", state.routerForm);
      
//       if (!response.data || !response.data.id) {
//         throw new Error("Invalid response from server");
//       }
      
//       dispatch({ type: "SET_ROUTERS", payload: [...state.routers, response.data] });
//       dispatch({ type: "SET_ACTIVE_ROUTER", payload: response.data });
//       dispatch({ type: "TOGGLE_MODAL", modal: "addRouter" });
//       dispatch({ type: "RESET_ROUTER_FORM" });
//       dispatch({ type: "RESET_ERRORS" });
      
//       if (state.routerForm.auto_test_connection && response.data.connection_test) {
//         const testResult = response.data.connection_test;
//         if (testResult.success) {
//           toast.success(`Router added and connection test successful!`);
//         } else {
//           toast.success(`Router added but connection test failed: ${testResult.message}`);
//         }
//       } else {
//         toast.success("Router added successfully!");
//       }
      
//       return response.data;
//     } catch (error) {
//       const errorMessage = error.response?.data?.error || error.response?.data?.detail || error.message || "Failed to add router";
      
//       if (error.response?.status === 400) {
//         const backendErrors = error.response.data;
//         Object.entries(backendErrors).forEach(([field, messages]) => {
//           if (Array.isArray(messages)) {
//             dispatch({ 
//               type: "SET_ERROR", 
//               payload: { field: `form.${field}`, message: messages[0] } 
//             });
//           }
//         });
//         toast.error("Please fix the form errors");
//       } else {
//         toast.error(errorMessage);
//       }
      
//       console.error("Error adding router:", error);
//       throw error;
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   }, [state.routerForm, state.routers]);

//   const updateRouter = useCallback(async (id) => {
//     if (!id) {
//       toast.error("No router selected for update");
//       return;
//     }

//     dispatch({ type: "SET_LOADING", payload: true });
    
//     try {
//       const response = await api.put(`/api/network_management/routers/${id}/`, state.routerForm);
      
//       if (!response.data || !response.data.id) {
//         throw new Error("Invalid response from server");
//       }
      
//       dispatch({ type: "UPDATE_ROUTER", payload: { id, data: response.data } });
//       dispatch({ type: "TOGGLE_MODAL", modal: "editRouter" });
//       dispatch({ type: "RESET_ERRORS" });
      
//       if (response.data.connection_test) {
//         const testResult = response.data.connection_test;
//         if (testResult.success) {
//           toast.success("Router updated and connection test successful!");
//         } else {
//           toast.success(`Router updated but connection test failed: ${testResult.message}`);
//         }
//       } else {
//         toast.success("Router updated successfully!");
//       }
      
//       return response.data;
//     } catch (error) {
//       const errorMessage = error.response?.data?.error || error.response?.data?.detail || error.message || "Failed to update router";
      
//       if (error.response?.status === 404) {
//         toast.error("Router not found. It may have been deleted.");
//       } else {
//         toast.error(errorMessage);
//       }
      
//       console.error("Error updating router:", error);
//       throw error;
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   }, [state.routerForm]);

//   const deleteRouter = useCallback(async (id) => {
//     if (!id) {
//       toast.error("No router selected for deletion");
//       return;
//     }

//     dispatch({ type: "SET_LOADING", payload: true });
    
//     try {
//       await api.delete(`/api/network_management/routers/${id}/`);
      
//       dispatch({ type: "DELETE_ROUTER", id });
//       toast.success("Router deleted successfully!");
//     } catch (error) {
//       const errorMessage = error.response?.data?.error || error.response?.data?.detail || error.message || "Failed to delete router";
      
//       if (error.response?.status === 404) {
//         toast.error("Router not found. It may have already been deleted.");
//       } else {
//         toast.error(errorMessage);
//       }
      
//       console.error("Error deleting router:", error);
//       throw error;
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   }, []);

//   // Enhanced Configuration Functions
//   const configureHotspot = useCallback(async () => {
//     if (!state.activeRouter) {
//       toast.error("No active router selected");
//       return;
//     }

//     const formErrors = validateHotspotForm(state.hotspotForm);
//     if (Object.keys(formErrors).length > 0) {
//       toast.error("Please fix the hotspot configuration errors");
//       return;
//     }

//     dispatch({ type: "SET_LOADING", payload: true });
    
//     try {
//       const formData = new FormData();
//       Object.entries(state.hotspotForm).forEach(([key, value]) => {
//         if (key === "landing_page_file" && value) {
//           formData.append("landing_page_file", value);
//         } else if (value !== null && value !== undefined) {
//           formData.append(key, value.toString());
//         }
//       });
      
//       const response = await api.post(
//         `/api/network_management/routers/${state.activeRouter.id}/hotspot-config/`, 
//         formData, 
//         {
//           headers: { "Content-Type": "multipart/form-data" },
//         }
//       );
      
//       if (response.data) {
//         dispatch({ 
//           type: "UPDATE_ROUTER", 
//           payload: { 
//             id: state.activeRouter.id, 
//             data: { 
//               configuration_status: 'configured',
//               configuration_type: 'hotspot',
//               ssid: state.hotspotForm.ssid,
//               last_configuration_update: new Date().toISOString()
//             } 
//           } 
//         });
//       }
      
//       dispatch({ type: "TOGGLE_MODAL", modal: "hotspotConfig" });
//       toast.success("Hotspot configured successfully!");
//     } catch (error) {
//       const errorMessage = error.response?.data?.error || error.response?.data?.detail || error.message || "Failed to configure hotspot";
//       toast.error(errorMessage);
//       console.error("Error configuring hotspot:", error);
//       throw error;
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   }, [state.hotspotForm, state.activeRouter]);

//   const configurePPPoE = useCallback(async () => {
//     if (!state.activeRouter) {
//       toast.error("No active router selected");
//       return;
//     }

//     dispatch({ type: "SET_LOADING", payload: true });
    
//     try {
//       const response = await api.post(
//         `/api/network_management/routers/${state.activeRouter.id}/pppoe-config/`, 
//         state.pppoeForm
//       );
      
//       if (response.data) {
//         dispatch({ 
//           type: "UPDATE_ROUTER", 
//           payload: { 
//             id: state.activeRouter.id, 
//             data: { 
//               configuration_status: 'configured',
//               configuration_type: 'pppoe',
//               last_configuration_update: new Date().toISOString()
//             } 
//           } 
//         });
//       }
      
//       dispatch({ type: "TOGGLE_MODAL", modal: "pppoeConfig" });
//       toast.success("PPPoE configured successfully!");
//     } catch (error) {
//       const errorMessage = error.response?.data?.error || error.response?.data?.detail || error.message || "Failed to configure PPPoE";
//       toast.error(errorMessage);
//       console.error("Error configuring PPPoE:", error);
//       throw error;
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   }, [state.pppoeForm, state.activeRouter]);

//   const updateRouterStatus = useCallback(async (routerId, newStatus) => {
//     if (!routerId) {
//       toast.error("No router selected");
//       return;
//     }

//     dispatch({ type: "SET_LOADING", payload: true });
//     try {
//       await api.put(`/api/network_management/routers/${routerId}/`, {
//         status: newStatus
//       });

//       dispatch({ type: "UPDATE_ROUTER", payload: { 
//         id: routerId, 
//         data: { status: newStatus } 
//       }});
      
//       toast.success(`Router ${newStatus === 'connected' ? 'activated' : 'deactivated'} successfully!`);
//     } catch (error) {
//       const errorMessage = error.response?.data?.error || error.response?.data?.detail || error.message || "Failed to update router status";
//       toast.error(errorMessage);
//       console.error("Error updating router status:", error);
//       throw error;
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   }, []);

//   const restartRouter = useCallback(async (routerId) => {
//     if (!routerId) {
//       toast.error("No router selected");
//       return;
//     }

//     dispatch({ type: "SET_LOADING", payload: true });
//     try {
//       await api.post(`/api/network_management/routers/${routerId}/reboot/`);
//       dispatch({ type: "UPDATE_ROUTER", payload: { 
//         id: routerId, 
//         data: { status: "updating" } 
//       }});
//       toast.success("Router restart initiated");
//     } catch (error) {
//       const errorMessage = error.response?.data?.error || error.response?.data?.detail || error.message || "Failed to restart router";
//       toast.error(errorMessage);
//       console.error("Error restarting router:", error);
//       throw error;
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   }, []);

//   const fetchRouterStats = useCallback(async (routerId, options = {}) => {
//     if (!routerId) {
//       toast.error("No router selected");
//       return;
//     }
    
//     const { showToast = true } = options;
    
//     dispatch({ type: "SET_STATS_LOADING", payload: true });
//     try {
//       const response = await api.get(`/api/network_management/routers/${routerId}/stats/`);
//       const stats = response.data || {};
      
//       dispatch({ 
//         type: "SET_ROUTER_STATS", 
//         payload: { routerId, stats } 
//       });
//       dispatch({ type: "TOGGLE_MODAL", modal: "routerStats" });
      
//       return stats;
//     } catch (error) {
//       const errorMessage = error.response?.data?.error || `Failed to fetch router stats: ${error.message}`;
      
//       if (showToast) {
//         toast.error(errorMessage);
//       }
      
//       console.error("Error fetching router stats:", error);
//       throw error;
//     } finally {
//       dispatch({ type: "SET_STATS_LOADING", payload: false });
//     }
//   }, []);

//   const disconnectHotspotUser = useCallback(async (userId) => {
//     if (!userId) {
//       toast.error("No user selected");
//       return;
//     }

//     dispatch({ type: "SET_LOADING", payload: true });
//     try {
//       await api.delete(`/api/network_management/hotspot-users/${userId}/`);
//       dispatch({ type: "SET_HOTSPOT_USERS", payload: state.hotspotUsers.filter((u) => u.id !== userId) });
//       toast.success("Hotspot user disconnected");
//     } catch (error) {
//       const errorMessage = error.response?.data?.error || error.response?.data?.detail || error.message || "Failed to disconnect hotspot user";
//       toast.error(errorMessage);
//       console.error("Error disconnecting hotspot user:", error);
//       throw error;
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   }, [state.hotspotUsers]);

//   const disconnectPPPoEUser = useCallback(async (userId) => {
//     if (!userId) {
//       toast.error("No user selected");
//       return;
//     }

//     dispatch({ type: "SET_LOADING", payload: true });
//     try {
//       await api.delete(`/api/network_management/pppoe-users/${userId}/`);
//       dispatch({ type: "SET_PPPOE_USERS", payload: state.pppoeUsers.filter((u) => u.id !== userId) });
//       toast.success("PPPoE user disconnected");
//     } catch (error) {
//       const errorMessage = error.response?.data?.error || error.response?.data?.detail || error.message || "Failed to disconnect PPPoE user";
//       toast.error(errorMessage);
//       console.error("Error disconnecting PPPoE user:", error);
//       throw error;
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   }, [state.pppoeUsers]);

//   const addCallbackConfig = useCallback(async () => {
//     if (!state.activeRouter) {
//       toast.error("No active router selected");
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
//       const errorMessage = error.response?.data?.error || error.response?.data?.detail || error.message || "Failed to add callback config";
//       toast.error(errorMessage);
//       console.error("Error adding callback config:", error);
//       throw error;
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   }, [state.callbackForm, state.callbackConfigs, state.activeRouter]);

//   const deleteCallbackConfig = useCallback(async (id) => {
//     if (!state.activeRouter) {
//       toast.error("No active router selected");
//       return;
//     }
    
//     dispatch({ type: "SET_LOADING", payload: true });
//     try {
//       await api.delete(`/api/network_management/routers/${state.activeRouter.id}/callback-configs/${id}/`);
//       dispatch({ type: "SET_CALLBACK_CONFIGS", payload: state.callbackConfigs.filter((cb) => cb.id !== id) });
//       toast.success("Callback config deleted");
//     } catch (error) {
//       const errorMessage = error.response?.data?.error || error.response?.data?.detail || error.message || "Failed to delete callback config";
//       toast.error(errorMessage);
//       console.error("Error deleting callback config:", error);
//       throw error;
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   }, [state.callbackConfigs, state.activeRouter]);

//   const restoreSessions = useCallback(async (routerId) => {
//     if (!routerId) {
//       toast.error("No router selected");
//       return;
//     }

//     dispatch({ type: "SET_LOADING", payload: true });
//     try {
//       const response = await api.post(`/api/network_management/routers/${routerId}/restore-sessions/`);
//       toast.success(response.data.message || "Sessions restored successfully");
      
//       // Refresh user lists
//       await fetchHotspotUsers(routerId, { showToast: false });
//       await fetchPPPoEUsers(routerId, { showToast: false });
//     } catch (error) {
//       const errorMessage = error.response?.data?.error || error.response?.data?.detail || error.message || "Failed to restore sessions";
//       toast.error(errorMessage);
//       console.error("Error restoring sessions:", error);
//       throw error;
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   }, [fetchHotspotUsers, fetchPPPoEUsers]);

//   // Additional Enhanced Functions
//   const testRouterConnection = useCallback(async (routerId = null, credentials = null) => {
//     dispatch({ type: "SET_LOADING", payload: true });
//     try {
//       let response;
//       if (routerId) {
//         response = await api.post(`/api/network_management/routers/${routerId}/test-connection/`);
//       } else if (credentials) {
//         response = await api.post("/api/network_management/test-connection/", credentials);
//       } else {
//         throw new Error("Either routerId or credentials must be provided");
//       }

//       if (routerId) {
//         dispatch({ 
//           type: "UPDATE_ROUTER", 
//           payload: { 
//             id: routerId, 
//             data: { 
//               connection_status: response.data.test_results?.system_access ? 'connected' : 'disconnected',
//               last_connection_test: new Date().toISOString()
//             } 
//           } 
//         });
        
//         dispatch({ 
//           type: "SET_CONNECTION_TESTS", 
//           payload: { routerId, tests: response.data } 
//         });
//       }

//       const success = response.data.test_results?.system_access;
//       toast.success(success ? "Connection test successful" : "Connection test failed");
//       return response.data;
//     } catch (error) {
//       const errorMessage = error.response?.data?.error || error.response?.data?.detail || error.message || "Connection test failed";
//       toast.error(errorMessage);
//       console.error("Error testing connection:", error);
//       throw error;
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   }, []);

//   const fetchConnectionHistory = useCallback(async (routerId, days = 7, options = {}) => {
//     if (!routerId) {
//       toast.error("No router selected");
//       return;
//     }
    
//     const { showToast = true } = options;
    
//     try {
//       const response = await api.get(`/api/network_management/routers/${routerId}/connection-history/`, {
//         params: { days }
//       });
//       const history = response.data || {};
      
//       dispatch({ 
//         type: "SET_CONNECTION_HISTORY", 
//         payload: { routerId, history } 
//       });
      
//       return history;
//     } catch (error) {
//       const errorMessage = error.response?.data?.error || `Failed to fetch connection history: ${error.message}`;
      
//       if (showToast) {
//         toast.error(errorMessage);
//       }
      
//       console.error("Error fetching connection history:", error);
//       throw error;
//     }
//   }, []);

//   // NEW: Technician Workflow Methods
//   const startTechnicianWorkflow = useCallback(async (workflowData) => {
//     dispatch({ type: "SET_LOADING", payload: true });
//     try {
//       const response = await api.post("/api/network_management/technician-workflow/", workflowData);
//       toast.success("Technician workflow started successfully");
//       return response.data;
//     } catch (error) {
//       const errorMessage = error.response?.data?.error || error.message || "Failed to start workflow";
//       toast.error(errorMessage);
//       throw error;
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   }, []);

//   const startBulkTechnicianWorkflow = useCallback(async (bulkData) => {
//     dispatch({ type: "SET_LOADING", payload: true });
//     try {
//       const response = await api.post("/api/network_management/bulk-technician-workflow/", bulkData);
//       toast.success(`Bulk workflow started for ${bulkData.router_ids.length} routers`);
//       return response.data;
//     } catch (error) {
//       const errorMessage = error.response?.data?.error || error.message || "Failed to start bulk workflow";
//       toast.error(errorMessage);
//       throw error;
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   }, []);

//   const configureVPN = useCallback(async (routerId, vpnConfig) => {
//     dispatch({ type: "SET_LOADING", payload: true });
//     try {
//       const response = await api.post(`/api/network_management/routers/${routerId}/configure-vpn/`, vpnConfig);
//       toast.success("VPN configured successfully");
      
//       // Update router state
//       dispatch({ 
//         type: "UPDATE_ROUTER", 
//         payload: { 
//           id: routerId, 
//           data: { 
//             vpn_enabled: true,
//             vpn_type: vpnConfig.vpn_type,
//             configuration_status: 'configured'
//           } 
//         } 
//       });
      
//       return response.data;
//     } catch (error) {
//       const errorMessage = error.response?.data?.error || error.message || "Failed to configure VPN";
//       toast.error(errorMessage);
//       throw error;
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   }, []);

//   const disableVPN = useCallback(async (routerId) => {
//     dispatch({ type: "SET_LOADING", payload: true });
//     try {
//       const response = await api.post(`/api/network_management/routers/${routerId}/disable-vpn/`);
//       toast.success("VPN disabled successfully");
      
//       // Update router state
//       dispatch({ 
//         type: "UPDATE_ROUTER", 
//         payload: { 
//           id: routerId, 
//           data: { 
//             vpn_enabled: false,
//             vpn_type: null
//           } 
//         } 
//       });
      
//       return response.data;
//     } catch (error) {
//       const errorMessage = error.response?.data?.error || error.message || "Failed to disable VPN";
//       toast.error(errorMessage);
//       throw error;
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   }, []);

//   // Utility function to refresh all data
//   const refreshAllData = useCallback(async () => {
//     const toastId = toast.loading("Refreshing data...");
    
//     try {
//       await Promise.all([
//         fetchRouters({ showToast: false, silent: true }),
//         state.activeRouter && fetchHotspotUsers(state.activeRouter.id, { showToast: false }),
//         state.activeRouter && fetchPPPoEUsers(state.activeRouter.id, { showToast: false }),
//         fetchBulkOperations({ showToast: false }),
//         fetchAuditLogs({}, { showToast: false }),
//       ]);
      
//       toast.success("Data refreshed successfully!", { id: toastId });
//     } catch (error) {
//       toast.error("Failed to refresh some data", { id: toastId });
//       console.error("Error refreshing data:", error);
//     }
//   }, [fetchRouters, fetchHotspotUsers, fetchPPPoEUsers, fetchBulkOperations, fetchAuditLogs, state.activeRouter]);

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
//     fetchBulkOperations,
//     fetchAuditLogs,
//     fetchConfigurationTemplates,
//     testRouterConnection,
//     fetchConnectionHistory,
//     // New methods
//     startTechnicianWorkflow,
//     startBulkTechnicianWorkflow,
//     configureVPN,
//     disableVPN,
//     showConfirm,
//     hideConfirm,
//     handleConfirm,
//     refreshAllData,
//   };
// };






















// // src/Pages/NetworkManagement/hooks/useRouterManagement.js - COMPLETELY REWRITTEN
// import { useReducer, useCallback, useRef } from "react";
// import { toast } from "react-hot-toast";
// import api from "../../../../api";

// // Enhanced Initial State with loading states for each section
// const initialState = {
//   routers: [],
//   activeRouter: null,
//   isLoading: false,
//   sectionLoading: {
//     routers: false,
//     health: false,
//     bulkOps: false,
//     auditLogs: false,
//     hotspotUsers: false,
//     pppoeUsers: false
//   },
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
//     scriptConfiguration: false,
//     diagnostics: false,
//     connectionTest: false,
//     vpnConfiguration: false,
//     technicianWorkflow: false,
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
//     connection_status: "disconnected",
//     configuration_status: "not_configured",
//     configuration_type: "",
//     is_default: false,
//     captive_portal_enabled: true,
//     is_active: true,
//     max_clients: 50,
//     description: "",
//     ssid: "",
//     firmware_version: "",
//     auto_test_connection: true,
//   },
//   touchedFields: {
//     name: false,
//     ip: false,
//     type: false,
//   },
//   hotspotForm: {
//     ssid: "SurfZone-WiFi",
//     landing_page_file: null,
//     redirect_url: "http://captive.surfzone.local",
//     bandwidth_limit: "10M",
//     session_timeout: 60,
//     auth_method: "universal",
//     enable_splash_page: true,
//     allow_social_login: false,
//     enable_bandwidth_shaping: true,
//     log_user_activity: true,
//     max_users: 50,
//     auto_apply: true,
//   },
//   pppoeForm: {
//     ip_pool_name: "pppoe-pool-1",
//     service_name: "",
//     mtu: 1492,
//     dns_servers: "8.8.8.8,1.1.1.1",
//     bandwidth_limit: "10M",
//     auth_methods: "all",
//     enable_pap: true,
//     enable_chap: true,
//     enable_mschap: true,
//     idle_timeout: 300,
//     session_timeout: 0,
//     default_profile: "default",
//     interface: "bridge",
//     ip_range_start: "192.168.100.10",
//     ip_range_end: "192.168.100.200",
//     service_type: "standard",
//     auto_apply: true,
//   },
//   scriptForm: {
//     script_type: "basic_setup",
//     parameters: {},
//     dry_run: false,
//   },
//   vpnForm: {
//     vpn_type: "openvpn",
//     configuration: {},
//     generate_certificates: true,
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
//   healthStats: {},
//   expandedRouter: null,
//   selectedUser: null,
//   statsData: {},
//   searchTerm: "",
//   filter: "all",
//   statsLoading: false,
//   routerStats: {},
//   callbackConfigs: [],
//   systemMetrics: {},
//   connectionTests: {},
//   bulkOperations: [],
//   auditLogs: [],
//   realTimeData: {
//     connectedRouters: 0,
//     activeSessions: 0,
//     systemHealth: 100,
//     recentAlerts: []
//   },
//   webSocketConnected: false,
//   monitoringView: "overview",
//   connectionHistory: {},
//   configurationTemplates: [],
//   availableScripts: [],
//   diagnosticsData: {},
//   errors: {
//     fetchRouters: null,
//     form: {},
//     connection: null
//   },
//   hasData: false,
//   lastUpdated: null,
// };

// // Enhanced Reducer with section loading states
// const reducer = (state, action) => {
//   switch (action.type) {
//     case "SET_ROUTERS":
//       return { 
//         ...state, 
//         routers: action.payload,
//         hasData: action.payload.length > 0,
//         lastUpdated: new Date().toISOString()
//       };
    
//     case "SET_SECTION_LOADING":
//       return {
//         ...state,
//         sectionLoading: {
//           ...state.sectionLoading,
//           [action.payload.section]: action.payload.loading
//         }
//       };
    
//     case "SET_LOADING":
//       return { ...state, isLoading: action.payload };
    
//     case "TOGGLE_MODAL":
//       return { 
//         ...state, 
//         modals: { ...state.modals, [action.modal]: !state.modals[action.modal] },
//         ...(action.modal === "addRouter" && !state.modals[action.modal] && {
//           touchedFields: initialState.touchedFields,
//           errors: { ...state.errors, form: {} }
//         })
//       };
    
//     case "SET_CONFIRM_MODAL":
//       return { 
//         ...state, 
//         confirmModal: { ...state.confirmModal, ...action.payload } 
//       };
    
//     case "UPDATE_ROUTER_FORM":
//       return { 
//         ...state, 
//         routerForm: { ...state.routerForm, ...action.payload },
//         errors: { ...state.errors, form: {} }
//       };
    
//     case "UPDATE_HOTSPOT_FORM":
//       return { ...state, hotspotForm: { ...state.hotspotForm, ...action.payload } };
    
//     case "UPDATE_PPPOE_FORM":
//       return { ...state, pppoeForm: { ...state.pppoeForm, ...action.payload } };
    
//     case "UPDATE_SCRIPT_FORM":
//       return { ...state, scriptForm: { ...state.scriptForm, ...action.payload } };
    
//     case "UPDATE_VPN_FORM":
//       return { ...state, vpnForm: { ...state.vpnForm, ...action.payload } };
    
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
//         touchedFields: initialState.touchedFields,
//         errors: { ...state.errors, form: {} }
//       };
    
//     case "RESET_CALLBACK_FORM":
//       return { ...state, callbackForm: initialState.callbackForm };
    
//     case "RESET_SCRIPT_FORM":
//       return { ...state, scriptForm: initialState.scriptForm };
    
//     case "RESET_VPN_FORM":
//       return { ...state, vpnForm: initialState.vpnForm };
    
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
    
//     case "SET_CONNECTION_TESTS":
//       return { 
//         ...state, 
//         connectionTests: { ...state.connectionTests, [action.payload.routerId]: action.payload.tests } 
//       };
    
//     case "SET_BULK_OPERATIONS":
//       return { ...state, bulkOperations: action.payload };
    
//     case "SET_AUDIT_LOGS":
//       return { ...state, auditLogs: action.payload };
    
//     case "SET_WEBSOCKET_CONNECTED":
//       return { ...state, webSocketConnected: action.payload };
    
//     case "UPDATE_BULK_OPERATION":
//       return {
//         ...state,
//         bulkOperations: state.bulkOperations.map(op =>
//           op.operation_id === action.payload.operation_id
//             ? { ...op, ...action.payload }
//             : op
//         )
//       };
    
//     case "SET_REAL_TIME_DATA":
//       return {
//         ...state,
//         realTimeData: { ...state.realTimeData, ...action.payload }
//       };
    
//     case "UPDATE_HEALTH_STATS":
//       return {
//         ...state,
//         routerStats: {
//           ...state.routerStats,
//           [action.payload.routerId]: {
//             ...state.routerStats[action.payload.routerId],
//             ...action.payload.stats
//           }
//         }
//       };
    
//     case "SET_MONITORING_VIEW":
//       return { ...state, monitoringView: action.payload };
    
//     case "SET_CONNECTION_HISTORY":
//       return { 
//         ...state, 
//         connectionHistory: { ...state.connectionHistory, [action.payload.routerId]: action.payload.history } 
//       };
    
//     case "SET_CONFIGURATION_TEMPLATES":
//       return { ...state, configurationTemplates: action.payload };
    
//     case "SET_AVAILABLE_SCRIPTS":
//       return { ...state, availableScripts: action.payload };
    
//     case "SET_DIAGNOSTICS_DATA":
//       return { 
//         ...state, 
//         diagnosticsData: { ...state.diagnosticsData, [action.payload.routerId]: action.payload.data } 
//       };
    
//     case "SET_ERROR":
//       return {
//         ...state,
//         errors: { ...state.errors, [action.payload.field]: action.payload.message }
//       };
    
//     case "CLEAR_ERROR":
//       return {
//         ...state,
//         errors: { ...state.errors, [action.payload.field]: null }
//       };
    
//     case "RESET_ERRORS":
//       return {
//         ...state,
//         errors: initialState.errors
//       };
    
//     default:
//       return state;
//   }
// };

// // Validation utilities
// const validateRouterForm = (formData) => {
//   const errors = {};
  
//   if (!formData.name?.trim()) {
//     errors.name = "Router name is required";
//   }
  
//   if (!formData.ip?.trim()) {
//     errors.ip = "IP address is required";
//   } else {
//     const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
//     if (!ipRegex.test(formData.ip)) {
//       errors.ip = "Invalid IP address format";
//     }
//   }
  
//   if (!formData.type) {
//     errors.type = "Router type is required";
//   }
  
//   if (!formData.username?.trim()) {
//     errors.username = "Username is required";
//   }
  
//   return errors;
// };

// const validateHotspotForm = (formData) => {
//   const errors = {};
  
//   if (!formData.ssid?.trim()) {
//     errors.ssid = "SSID is required";
//   }
  
//   if (!formData.bandwidth_limit?.trim()) {
//     errors.bandwidth_limit = "Bandwidth limit is required";
//   }
  
//   if (!formData.session_timeout || formData.session_timeout < 1) {
//     errors.session_timeout = "Session timeout must be at least 1 minute";
//   }
  
//   return errors;
// };

// // Enhanced API Functions with better error handling
// export const useRouterManagement = () => {
//   const [state, dispatch] = useReducer(reducer, initialState);
//   const activeRouterRef = useRef(state.activeRouter);

//   if (state.activeRouter !== activeRouterRef.current) {
//     activeRouterRef.current = state.activeRouter;
//   }

//   // Helper to set section loading state
//   const setSectionLoading = useCallback((section, loading) => {
//     dispatch({ 
//       type: "SET_SECTION_LOADING", 
//       payload: { section, loading } 
//     });
//   }, []);

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

//   // Enhanced fetchRouters with better error handling
//   const fetchRouters = useCallback(async (options = {}) => {
//     const { showToast = true, silent = false } = options;
    
//     if (!silent) {
//       setSectionLoading('routers', true);
//     }
    
//     try {
//       const routers = await api.smartFetch({
//         method: 'get',
//         url: '/api/network_management/routers/',
//         params: { 
//           status: state.filter !== "all" ? state.filter : undefined,
//           connection_status: state.filter !== "all" ? state.filter : undefined,
//           configuration_status: state.filter !== "all" ? state.filter : undefined,
//           search: state.searchTerm || undefined,
//           type: state.filter !== "all" ? state.filter : undefined,
//         }
//       }, {
//         retries: 2,
//         fallbackData: [],
//         showToast: false // Don't show toast for background refreshes
//       });
      
//       const safeRouters = Array.isArray(routers) ? routers : [];
      
//       dispatch({ type: "SET_ROUTERS", payload: safeRouters });
//       dispatch({ type: "CLEAR_ERROR", payload: { field: 'fetchRouters' } });
      
//       if (!state.activeRouter && safeRouters.length > 0) {
//         dispatch({ type: "SET_ACTIVE_ROUTER", payload: safeRouters[0] });
//       }
      
//       if (showToast && safeRouters.length === 0) {
//         toast.success("No routers found. Add your first router to get started!");
//       }
      
//       return safeRouters;
//     } catch (error) {
//       const errorMessage = "Unable to load routers at this time";
      
//       dispatch({ 
//         type: "SET_ERROR", 
//         payload: { field: 'fetchRouters', message: errorMessage } 
//       });
      
//       if (showToast && !silent) {
//         if (error.response?.status === 404) {
//           toast.error("Routers service is currently unavailable");
//         } else if (error.response?.status === 401) {
//           toast.error("Please log in again to continue");
//         } else {
//           toast.error(errorMessage);
//         }
//       }
      
//       console.error("Error fetching routers:", error);
//       dispatch({ type: "SET_ROUTERS", payload: [] });
//       return [];
//     } finally {
//       if (!silent) {
//         setSectionLoading('routers', false);
//       }
//     }
//   }, [state.filter, state.searchTerm, state.activeRouter, setSectionLoading]);

//   // Enhanced fetchHotspotUsers with better error handling
//   const fetchHotspotUsers = useCallback(async (routerId, options = {}) => {
//     if (!routerId) {
//       toast.error("No router selected");
//       return [];
//     }
    
//     const { showToast = true } = options;
    
//     setSectionLoading('hotspotUsers', true);
    
//     try {
//       const users = await api.smartFetch({
//         method: 'get',
//         url: `/api/network_management/routers/${routerId}/hotspot-users/`
//       }, {
//         retries: 1,
//         fallbackData: [],
//         showToast: false
//       });
      
//       const safeUsers = Array.isArray(users) ? users : [];
      
//       dispatch({ type: "SET_HOTSPOT_USERS", payload: safeUsers });
      
//       if (showToast && safeUsers.length === 0) {
//         toast("No hotspot users found", { icon: 'ℹ️' });
//       }
      
//       return safeUsers;
//     } catch (error) {
//       const errorMessage = "Unable to load hotspot users";
      
//       if (showToast) {
//         if (error.response?.status === 404) {
//           toast.error("Hotspot users endpoint not found");
//         } else {
//           toast.error(errorMessage);
//         }
//       }
      
//       console.error("Error fetching hotspot users:", error);
//       dispatch({ type: "SET_HOTSPOT_USERS", payload: [] });
//       return [];
//     } finally {
//       setSectionLoading('hotspotUsers', false);
//     }
//   }, [setSectionLoading]);

//   // Enhanced fetchPPPoEUsers with better error handling
//   const fetchPPPoEUsers = useCallback(async (routerId, options = {}) => {
//     if (!routerId) {
//       toast.error("No router selected");
//       return [];
//     }
    
//     const { showToast = true } = options;
    
//     setSectionLoading('pppoeUsers', true);
    
//     try {
//       const users = await api.smartFetch({
//         method: 'get',
//         url: `/api/network_management/routers/${routerId}/pppoe-users/`
//       }, {
//         retries: 1,
//         fallbackData: [],
//         showToast: false
//       });
      
//       const safeUsers = Array.isArray(users) ? users : [];
      
//       dispatch({ type: "SET_PPPOE_USERS", payload: safeUsers });
      
//       if (showToast && safeUsers.length === 0) {
//         toast("No PPPoE users found", { icon: 'ℹ️' });
//       }
      
//       return safeUsers;
//     } catch (error) {
//       const errorMessage = "Unable to load PPPoE users";
      
//       if (showToast) {
//         if (error.response?.status === 404) {
//           toast.error("PPPoE users endpoint not found");
//         } else {
//           toast.error(errorMessage);
//         }
//       }
      
//       console.error("Error fetching PPPoE users:", error);
//       dispatch({ type: "SET_PPPOE_USERS", payload: [] });
//       return [];
//     } finally {
//       setSectionLoading('pppoeUsers', false);
//     }
//   }, [setSectionLoading]);

//   // Enhanced fetchSessionHistory with better error handling
//   const fetchSessionHistory = useCallback(async (userId, userType = "hotspot", options = {}) => {
//     if (!userId) {
//       toast.error("No user selected");
//       return [];
//     }
    
//     const { showToast = true } = options;
    
//     try {
//       const endpoint = userType === "hotspot" 
//         ? `/api/network_management/hotspot-users/${userId}/session-history/`
//         : `/api/network_management/pppoe-users/${userId}/session-history/`;
      
//       const history = await api.smartFetch({
//         method: 'get',
//         url: endpoint
//       }, {
//         retries: 1,
//         fallbackData: [],
//         showToast: false
//       });
      
//       const safeHistory = Array.isArray(history) ? history : [];
      
//       dispatch({ type: "SET_SESSION_HISTORY", payload: safeHistory });
      
//       if (showToast && safeHistory.length === 0) {
//         toast("No session history found", { icon: 'ℹ️' });
//       }
      
//       return safeHistory;
//     } catch (error) {
//       const errorMessage = "Unable to load session history";
      
//       if (showToast && error.response?.status !== 404) {
//         toast.error(errorMessage);
//       }
      
//       console.error("Error fetching session history:", error);
//       dispatch({ type: "SET_SESSION_HISTORY", payload: [] });
//       return [];
//     }
//   }, []);

//   // Enhanced fetchCallbackConfigs with better error handling
//   const fetchCallbackConfigs = useCallback(async (routerId, options = {}) => {
//     if (!routerId) {
//       toast.error("No router selected");
//       return [];
//     }
    
//     const { showToast = true } = options;
    
//     try {
//       const configs = await api.smartFetch({
//         method: 'get',
//         url: `/api/network_management/routers/${routerId}/callback-configs/`
//       }, {
//         retries: 1,
//         fallbackData: [],
//         showToast: false
//       });
      
//       const safeConfigs = Array.isArray(configs) ? configs : [];
      
//       dispatch({ type: "SET_CALLBACK_CONFIGS", payload: safeConfigs });
      
//       if (showToast && safeConfigs.length === 0) {
//         toast("No callback configurations found", { icon: 'ℹ️' });
//       }
      
//       return safeConfigs;
//     } catch (error) {
//       const errorMessage = "Unable to load callback configurations";
      
//       if (showToast && error.response?.status !== 404) {
//         toast.error(errorMessage);
//       }
      
//       console.error("Error fetching callback configs:", error);
//       dispatch({ type: "SET_CALLBACK_CONFIGS", payload: [] });
//       return [];
//     }
//   }, []);

//   // Enhanced fetchBulkOperations with timeout handling
//   const fetchBulkOperations = useCallback(async (options = {}) => {
//     const { showToast = true } = options;
    
//     setSectionLoading('bulkOps', true);
    
//     try {
//       const operations = await api.smartFetch({
//         method: 'get',
//         url: '/api/network_management/bulk-operations/history/'
//       }, {
//         retries: 1,
//         fallbackData: [],
//         showToast: false // Don't show toast for this background operation
//       });
      
//       const safeOperations = Array.isArray(operations) ? operations : [];
      
//       dispatch({ type: "SET_BULK_OPERATIONS", payload: safeOperations });
      
//       if (showToast && safeOperations.length === 0) {
//         // Don't show toast for empty results to reduce noise
//       }
      
//       return safeOperations;
//     } catch (error) {
//       console.error("Error fetching bulk operations:", error);
      
//       if (showToast && error.response?.status !== 404) {
//         // Don't show toast for this background operation
//       }
      
//       dispatch({ type: "SET_BULK_OPERATIONS", payload: [] });
//       return [];
//     } finally {
//       setSectionLoading('bulkOps', false);
//     }
//   }, [setSectionLoading]);

//   // Enhanced fetchAuditLogs with better error handling
//   const fetchAuditLogs = useCallback(async (filters = {}, options = {}) => {
//     const { showToast = true } = options;
    
//     setSectionLoading('auditLogs', true);
    
//     try {
//       const logs = await api.smartFetch({
//         method: 'get',
//         url: '/api/network_management/audit-logs/',
//         params: filters
//       }, {
//         retries: 1,
//         fallbackData: [],
//         showToast: false // Background operation
//       });
      
//       const safeLogs = Array.isArray(logs) ? logs : [];
      
//       dispatch({ type: "SET_AUDIT_LOGS", payload: safeLogs });
      
//       if (showToast && safeLogs.length === 0) {
//         // No toast for empty results
//       }
      
//       return safeLogs;
//     } catch (error) {
//       console.error("Error fetching audit logs:", error);
      
//       if (showToast && error.response?.status !== 404) {
//         // No toast for background errors
//       }
      
//       dispatch({ type: "SET_AUDIT_LOGS", payload: [] });
//       return [];
//     } finally {
//       setSectionLoading('auditLogs', false);
//     }
//   }, [setSectionLoading]);

//   // Enhanced fetchHealthStats
//   const fetchHealthStats = useCallback(async (options = {}) => {
//     const { showToast = true } = options;
    
//     setSectionLoading('health', true);
    
//     try {
//       const stats = await api.smartFetch({
//         method: 'get',
//         url: '/api/network_management/health-monitoring/'
//       }, {
//         retries: 1,
//         fallbackData: {
//           total_routers: 0,
//           online_routers: 0,
//           offline_routers: 0,
//           health_score: 0
//         },
//         showToast: false
//       });
      
//       dispatch({ type: "SET_HEALTH_STATS", payload: stats });
//       return stats;
//     } catch (error) {
//       console.error("Error fetching health stats:", error);
      
//       // Use fallback data
//       const fallbackStats = {
//         total_routers: state.routers.length,
//         online_routers: state.routers.filter(r => r.connection_status === 'connected').length,
//         offline_routers: state.routers.filter(r => r.connection_status === 'disconnected').length,
//         health_score: 0,
//         fallback: true
//       };
      
//       dispatch({ type: "SET_HEALTH_STATS", payload: fallbackStats });
//       return fallbackStats;
//     } finally {
//       setSectionLoading('health', false);
//     }
//   }, [state.routers, setSectionLoading]);

//   // Enhanced fetchConfigurationTemplates with better error handling
//   const fetchConfigurationTemplates = useCallback(async (options = {}) => {
//     const { showToast = true } = options;
    
//     try {
//       const templates = await api.smartFetch({
//         method: 'get',
//         url: '/api/network_management/configuration-templates/'
//       }, {
//         retries: 1,
//         fallbackData: [],
//         showToast: false
//       });
      
//       const safeTemplates = Array.isArray(templates) ? templates : [];
      
//       dispatch({ type: "SET_CONFIGURATION_TEMPLATES", payload: safeTemplates });
      
//       if (showToast && safeTemplates.length === 0) {
//         toast("No configuration templates found", { icon: 'ℹ️' });
//       }
      
//       return safeTemplates;
//     } catch (error) {
//       const errorMessage = "Unable to load configuration templates";
      
//       if (showToast) {
//         if (error.response?.status === 404) {
//           toast.error("Configuration templates endpoint not found");
//         } else {
//           toast.error(errorMessage);
//         }
//       }
      
//       console.error("Error fetching configuration templates:", error);
//       dispatch({ type: "SET_CONFIGURATION_TEMPLATES", payload: [] });
//       return [];
//     }
//   }, []);

//   // Enhanced addRouter with better error handling
//   const addRouter = useCallback(async () => {
//     const formErrors = validateRouterForm(state.routerForm);
    
//     if (Object.keys(formErrors).length > 0) {
//       Object.keys(formErrors).forEach(field => {
//         dispatch({ type: "SET_TOUCHED_FIELD", field });
//       });
      
//       Object.entries(formErrors).forEach(([field, message]) => {
//         dispatch({ 
//           type: "SET_ERROR", 
//           payload: { field: `form.${field}`, message } 
//         });
//       });
      
//       toast.error("Please fix the form errors before submitting");
//       return;
//     }

//     dispatch({ type: "SET_LOADING", payload: true });
//     const toastId = toast.loading('Adding router...');
    
//     try {
//       const response = await api.smartFetch({
//         method: 'post',
//         url: '/api/network_management/routers/',
//         data: state.routerForm
//       }, {
//         retries: 1,
//         showToast: true
//       });
      
//       if (!response || !response.id) {
//         throw new Error("Invalid response from server");
//       }
      
//       dispatch({ type: "SET_ROUTERS", payload: [...state.routers, response] });
//       dispatch({ type: "SET_ACTIVE_ROUTER", payload: response });
//       dispatch({ type: "TOGGLE_MODAL", modal: "addRouter" });
//       dispatch({ type: "RESET_ROUTER_FORM" });
//       dispatch({ type: "RESET_ERRORS" });
      
//       if (state.routerForm.auto_test_connection && response.connection_test) {
//         const testResult = response.connection_test;
//         if (testResult.success) {
//           toast.success(`Router added successfully!`, { id: toastId });
//         } else {
//           toast.success(`Router added! Connection test: ${testResult.message}`, { id: toastId });
//         }
//       } else {
//         toast.success("Router added successfully!", { id: toastId });
//       }
      
//       return response;
//     } catch (error) {
//       console.error("Error adding router:", error);
      
//       let errorMessage = "Failed to add router. Please try again.";
      
//       if (error.response?.status === 400) {
//         const backendErrors = error.response.data;
//         Object.entries(backendErrors).forEach(([field, messages]) => {
//           if (Array.isArray(messages)) {
//             dispatch({ 
//               type: "SET_ERROR", 
//               payload: { field: `form.${field}`, message: messages[0] } 
//             });
//           }
//         });
//         errorMessage = "Please fix the form errors";
//       }
      
//       toast.error(errorMessage, { id: toastId });
//       throw error;
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   }, [state.routerForm, state.routers]);

//   // Enhanced updateRouter with better error handling
//   const updateRouter = useCallback(async (id) => {
//     if (!id) {
//       toast.error("No router selected for update");
//       return;
//     }

//     dispatch({ type: "SET_LOADING", payload: true });
//     const toastId = toast.loading('Updating router...');
    
//     try {
//       const response = await api.smartFetch({
//         method: 'put',
//         url: `/api/network_management/routers/${id}/`,
//         data: state.routerForm
//       }, {
//         retries: 1,
//         showToast: true
//       });
      
//       if (!response || !response.id) {
//         throw new Error("Invalid response from server");
//       }
      
//       dispatch({ type: "UPDATE_ROUTER", payload: { id, data: response } });
//       dispatch({ type: "TOGGLE_MODAL", modal: "editRouter" });
//       dispatch({ type: "RESET_ERRORS" });
      
//       if (response.connection_test) {
//         const testResult = response.connection_test;
//         if (testResult.success) {
//           toast.success("Router updated and connection test successful!", { id: toastId });
//         } else {
//           toast.success(`Router updated! Connection test: ${testResult.message}`, { id: toastId });
//         }
//       } else {
//         toast.success("Router updated successfully!", { id: toastId });
//       }
      
//       return response;
//     } catch (error) {
//       console.error("Error updating router:", error);
      
//       let errorMessage = "Failed to update router. Please try again.";
      
//       if (error.response?.status === 404) {
//         errorMessage = "Router not found. It may have been deleted.";
//       }
      
//       toast.error(errorMessage, { id: toastId });
//       throw error;
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   }, [state.routerForm]);

//   // Enhanced deleteRouter with better error handling
//   const deleteRouter = useCallback(async (id) => {
//     if (!id) {
//       toast.error("No router selected for deletion");
//       return;
//     }

//     dispatch({ type: "SET_LOADING", payload: true });
//     const toastId = toast.loading('Deleting router...');
    
//     try {
//       await api.smartFetch({
//         method: 'delete',
//         url: `/api/network_management/routers/${id}/`
//       }, {
//         retries: 1,
//         showToast: true
//       });
      
//       dispatch({ type: "DELETE_ROUTER", id });
//       toast.success("Router deleted successfully!", { id: toastId });
//     } catch (error) {
//       console.error("Error deleting router:", error);
      
//       let errorMessage = "Failed to delete router. Please try again.";
      
//       if (error.response?.status === 404) {
//         errorMessage = "Router not found. It may have already been deleted.";
//       }
      
//       toast.error(errorMessage, { id: toastId });
//       throw error;
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   }, []);

//   // Enhanced configureHotspot with better error handling
//   const configureHotspot = useCallback(async () => {
//     if (!state.activeRouter) {
//       toast.error("No active router selected");
//       return;
//     }

//     const formErrors = validateHotspotForm(state.hotspotForm);
//     if (Object.keys(formErrors).length > 0) {
//       toast.error("Please fix the hotspot configuration errors");
//       return;
//     }

//     dispatch({ type: "SET_LOADING", payload: true });
//     const toastId = toast.loading('Configuring hotspot...');
    
//     try {
//       const formData = new FormData();
//       Object.entries(state.hotspotForm).forEach(([key, value]) => {
//         if (key === "landing_page_file" && value) {
//           formData.append("landing_page_file", value);
//         } else if (value !== null && value !== undefined) {
//           formData.append(key, value.toString());
//         }
//       });
      
//       const response = await api.smartFetch({
//         method: 'post',
//         url: `/api/network_management/routers/${state.activeRouter.id}/hotspot-config/`,
//         data: formData,
//         headers: { "Content-Type": "multipart/form-data" }
//       }, {
//         retries: 1,
//         showToast: true
//       });
      
//       if (response.data) {
//         dispatch({ 
//           type: "UPDATE_ROUTER", 
//           payload: { 
//             id: state.activeRouter.id, 
//             data: { 
//               configuration_status: 'configured',
//               configuration_type: 'hotspot',
//               ssid: state.hotspotForm.ssid,
//               last_configuration_update: new Date().toISOString()
//             } 
//           } 
//         });
//       }
      
//       dispatch({ type: "TOGGLE_MODAL", modal: "hotspotConfig" });
//       toast.success("Hotspot configured successfully!", { id: toastId });
//     } catch (error) {
//       console.error("Error configuring hotspot:", error);
      
//       let errorMessage = "Failed to configure hotspot. Please try again.";
      
//       toast.error(errorMessage, { id: toastId });
//       throw error;
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   }, [state.hotspotForm, state.activeRouter]);

//   // Enhanced configurePPPoE with better error handling
//   const configurePPPoE = useCallback(async () => {
//     if (!state.activeRouter) {
//       toast.error("No active router selected");
//       return;
//     }

//     dispatch({ type: "SET_LOADING", payload: true });
//     const toastId = toast.loading('Configuring PPPoE...');
    
//     try {
//       const response = await api.smartFetch({
//         method: 'post',
//         url: `/api/network_management/routers/${state.activeRouter.id}/pppoe-config/`,
//         data: state.pppoeForm
//       }, {
//         retries: 1,
//         showToast: true
//       });
      
//       if (response.data) {
//         dispatch({ 
//           type: "UPDATE_ROUTER", 
//           payload: { 
//             id: state.activeRouter.id, 
//             data: { 
//               configuration_status: 'configured',
//               configuration_type: 'pppoe',
//               last_configuration_update: new Date().toISOString()
//             } 
//           } 
//         });
//       }
      
//       dispatch({ type: "TOGGLE_MODAL", modal: "pppoeConfig" });
//       toast.success("PPPoE configured successfully!", { id: toastId });
//     } catch (error) {
//       console.error("Error configuring PPPoE:", error);
      
//       let errorMessage = "Failed to configure PPPoE. Please try again.";
      
//       toast.error(errorMessage, { id: toastId });
//       throw error;
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   }, [state.pppoeForm, state.activeRouter]);

//   // Enhanced updateRouterStatus with better error handling
//   const updateRouterStatus = useCallback(async (routerId, newStatus) => {
//     if (!routerId) {
//       toast.error("No router selected");
//       return;
//     }

//     dispatch({ type: "SET_LOADING", payload: true });
//     const toastId = toast.loading('Updating router status...');
    
//     try {
//       await api.smartFetch({
//         method: 'put',
//         url: `/api/network_management/routers/${routerId}/`,
//         data: { status: newStatus }
//       }, {
//         retries: 1,
//         showToast: true
//       });

//       dispatch({ type: "UPDATE_ROUTER", payload: { 
//         id: routerId, 
//         data: { status: newStatus } 
//       }});
      
//       toast.success(`Router ${newStatus === 'connected' ? 'activated' : 'deactivated'} successfully!`, { id: toastId });
//     } catch (error) {
//       console.error("Error updating router status:", error);
      
//       let errorMessage = "Failed to update router status. Please try again.";
      
//       toast.error(errorMessage, { id: toastId });
//       throw error;
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   }, []);

//   // Enhanced restartRouter with better error handling
//   const restartRouter = useCallback(async (routerId) => {
//     if (!routerId) {
//       toast.error("No router selected");
//       return;
//     }

//     dispatch({ type: "SET_LOADING", payload: true });
//     const toastId = toast.loading('Restarting router...');
    
//     try {
//       await api.smartFetch({
//         method: 'post',
//         url: `/api/network_management/routers/${routerId}/reboot/`
//       }, {
//         retries: 1,
//         showToast: true
//       });
      
//       dispatch({ type: "UPDATE_ROUTER", payload: { 
//         id: routerId, 
//         data: { status: "updating" } 
//       }});
      
//       toast.success("Router restart initiated", { id: toastId });
//     } catch (error) {
//       console.error("Error restarting router:", error);
      
//       let errorMessage = "Failed to restart router. Please try again.";
      
//       toast.error(errorMessage, { id: toastId });
//       throw error;
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   }, []);

//   // Enhanced fetchRouterStats with better error handling
//   const fetchRouterStats = useCallback(async (routerId, options = {}) => {
//     if (!routerId) {
//       toast.error("No router selected");
//       return;
//     }
    
//     const { showToast = true } = options;
    
//     dispatch({ type: "SET_STATS_LOADING", payload: true });
//     const toastId = showToast ? toast.loading('Loading router stats...') : null;
    
//     try {
//       const stats = await api.smartFetch({
//         method: 'get',
//         url: `/api/network_management/routers/${routerId}/stats/`
//       }, {
//         retries: 1,
//         fallbackData: {},
//         showToast: false
//       });
      
//       dispatch({ 
//         type: "SET_ROUTER_STATS", 
//         payload: { routerId, stats } 
//       });
      
//       if (showToast) {
//         toast.success("Router stats loaded", { id: toastId });
//       }
      
//       return stats;
//     } catch (error) {
//       console.error("Error fetching router stats:", error);
      
//       if (showToast) {
//         toast.error("Unable to load router stats", { id: toastId });
//       }
      
//       throw error;
//     } finally {
//       dispatch({ type: "SET_STATS_LOADING", payload: false });
//     }
//   }, []);

//   // Enhanced disconnectHotspotUser with better error handling
//   const disconnectHotspotUser = useCallback(async (userId) => {
//     if (!userId) {
//       toast.error("No user selected");
//       return;
//     }

//     dispatch({ type: "SET_LOADING", payload: true });
//     const toastId = toast.loading('Disconnecting user...');
    
//     try {
//       await api.smartFetch({
//         method: 'delete',
//         url: `/api/network_management/hotspot-users/${userId}/`
//       }, {
//         retries: 1,
//         showToast: true
//       });
      
//       dispatch({ type: "SET_HOTSPOT_USERS", payload: state.hotspotUsers.filter((u) => u.id !== userId) });
//       toast.success("Hotspot user disconnected", { id: toastId });
//     } catch (error) {
//       console.error("Error disconnecting hotspot user:", error);
      
//       let errorMessage = "Failed to disconnect hotspot user. Please try again.";
      
//       toast.error(errorMessage, { id: toastId });
//       throw error;
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   }, [state.hotspotUsers]);

//   // Enhanced disconnectPPPoEUser with better error handling
//   const disconnectPPPoEUser = useCallback(async (userId) => {
//     if (!userId) {
//       toast.error("No user selected");
//       return;
//     }

//     dispatch({ type: "SET_LOADING", payload: true });
//     const toastId = toast.loading('Disconnecting user...');
    
//     try {
//       await api.smartFetch({
//         method: 'delete',
//         url: `/api/network_management/pppoe-users/${userId}/`
//       }, {
//         retries: 1,
//         showToast: true
//       });
      
//       dispatch({ type: "SET_PPPOE_USERS", payload: state.pppoeUsers.filter((u) => u.id !== userId) });
//       toast.success("PPPoE user disconnected", { id: toastId });
//     } catch (error) {
//       console.error("Error disconnecting PPPoE user:", error);
      
//       let errorMessage = "Failed to disconnect PPPoE user. Please try again.";
      
//       toast.error(errorMessage, { id: toastId });
//       throw error;
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   }, [state.pppoeUsers]);

//   // Enhanced addCallbackConfig with better error handling
//   const addCallbackConfig = useCallback(async () => {
//     if (!state.activeRouter) {
//       toast.error("No active router selected");
//       return;
//     }

//     dispatch({ type: "SET_LOADING", payload: true });
//     const toastId = toast.loading('Adding callback configuration...');
    
//     try {
//       const response = await api.smartFetch({
//         method: 'post',
//         url: `/api/network_management/routers/${state.activeRouter.id}/callback-configs/`,
//         data: state.callbackForm
//       }, {
//         retries: 1,
//         showToast: true
//       });
      
//       dispatch({ type: "SET_CALLBACK_CONFIGS", payload: [...state.callbackConfigs, response] });
//       dispatch({ type: "TOGGLE_MODAL", modal: "callbackConfig" });
//       dispatch({ type: "RESET_CALLBACK_FORM" });
//       toast.success("Callback configuration added", { id: toastId });
//     } catch (error) {
//       console.error("Error adding callback config:", error);
      
//       let errorMessage = "Failed to add callback configuration. Please try again.";
      
//       toast.error(errorMessage, { id: toastId });
//       throw error;
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   }, [state.callbackForm, state.callbackConfigs, state.activeRouter]);

//   // Enhanced deleteCallbackConfig with better error handling
//   const deleteCallbackConfig = useCallback(async (id) => {
//     if (!state.activeRouter) {
//       toast.error("No active router selected");
//       return;
//     }
    
//     dispatch({ type: "SET_LOADING", payload: true });
//     const toastId = toast.loading('Deleting callback configuration...');
    
//     try {
//       await api.smartFetch({
//         method: 'delete',
//         url: `/api/network_management/routers/${state.activeRouter.id}/callback-configs/${id}/`
//       }, {
//         retries: 1,
//         showToast: true
//       });
      
//       dispatch({ type: "SET_CALLBACK_CONFIGS", payload: state.callbackConfigs.filter((cb) => cb.id !== id) });
//       toast.success("Callback configuration deleted", { id: toastId });
//     } catch (error) {
//       console.error("Error deleting callback config:", error);
      
//       let errorMessage = "Failed to delete callback configuration. Please try again.";
      
//       toast.error(errorMessage, { id: toastId });
//       throw error;
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   }, [state.callbackConfigs, state.activeRouter]);

//   // Enhanced restoreSessions with better error handling
//   const restoreSessions = useCallback(async (routerId) => {
//     if (!routerId) {
//       toast.error("No router selected");
//       return;
//     }

//     dispatch({ type: "SET_LOADING", payload: true });
//     const toastId = toast.loading('Restoring sessions...');
    
//     try {
//       const response = await api.smartFetch({
//         method: 'post',
//         url: `/api/network_management/routers/${routerId}/restore-sessions/`
//       }, {
//         retries: 1,
//         showToast: true
//       });
      
//       toast.success(response.data?.message || "Sessions restored successfully", { id: toastId });
      
//       // Refresh user lists
//       await fetchHotspotUsers(routerId, { showToast: false });
//       await fetchPPPoEUsers(routerId, { showToast: false });
//     } catch (error) {
//       console.error("Error restoring sessions:", error);
      
//       let errorMessage = "Failed to restore sessions. Please try again.";
      
//       toast.error(errorMessage, { id: toastId });
//       throw error;
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   }, [fetchHotspotUsers, fetchPPPoEUsers]);

//   // Enhanced testRouterConnection with better error handling
//   const testRouterConnection = useCallback(async (routerId = null, credentials = null) => {
//     dispatch({ type: "SET_LOADING", payload: true });
//     const toastId = toast.loading('Testing connection...');
    
//     try {
//       let response;
//       if (routerId) {
//         response = await api.smartFetch({
//           method: 'post',
//           url: `/api/network_management/routers/${routerId}/test-connection/`
//         }, {
//           retries: 1,
//           showToast: true
//         });
//       } else if (credentials) {
//         response = await api.smartFetch({
//           method: 'post',
//           url: '/api/network_management/test-connection/',
//           data: credentials
//         }, {
//           retries: 1,
//           showToast: true
//         });
//       } else {
//         throw new Error("Either routerId or credentials must be provided");
//       }

//       if (routerId) {
//         dispatch({ 
//           type: "UPDATE_ROUTER", 
//           payload: { 
//             id: routerId, 
//             data: { 
//               connection_status: response.data?.test_results?.system_access ? 'connected' : 'disconnected',
//               last_connection_test: new Date().toISOString()
//             } 
//           } 
//         });
        
//         dispatch({ 
//           type: "SET_CONNECTION_TESTS", 
//           payload: { routerId, tests: response.data } 
//         });
//       }

//       const success = response.data?.test_results?.system_access;
//       toast.success(success ? "Connection test successful" : "Connection test failed", { id: toastId });
//       return response.data;
//     } catch (error) {
//       console.error("Error testing connection:", error);
      
//       let errorMessage = "Connection test failed. Please try again.";
      
//       toast.error(errorMessage, { id: toastId });
//       throw error;
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   }, []);

//   // Enhanced fetchConnectionHistory with better error handling
//   const fetchConnectionHistory = useCallback(async (routerId, days = 7, options = {}) => {
//     if (!routerId) {
//       toast.error("No router selected");
//       return;
//     }
    
//     const { showToast = true } = options;
    
//     try {
//       const history = await api.smartFetch({
//         method: 'get',
//         url: `/api/network_management/routers/${routerId}/connection-history/`,
//         params: { days }
//       }, {
//         retries: 1,
//         fallbackData: {},
//         showToast: false
//       });
      
//       dispatch({ 
//         type: "SET_CONNECTION_HISTORY", 
//         payload: { routerId, history } 
//       });
      
//       return history;
//     } catch (error) {
//       console.error("Error fetching connection history:", error);
      
//       if (showToast) {
//         toast.error("Unable to load connection history");
//       }
      
//       throw error;
//     }
//   }, []);

//   // Enhanced refresh function
//   const refreshAllData = useCallback(async () => {
//     const toastId = toast.loading("Refreshing data...");
    
//     try {
//       await Promise.allSettled([
//         fetchRouters({ showToast: false, silent: true }),
//         state.activeRouter && fetchHotspotUsers(state.activeRouter.id, { showToast: false }),
//         state.activeRouter && fetchPPPoEUsers(state.activeRouter.id, { showToast: false }),
//         fetchBulkOperations({ showToast: false }),
//         fetchAuditLogs({}, { showToast: false }),
//         fetchHealthStats({ showToast: false }),
//       ]);
      
//       toast.success("Data refreshed successfully!", { id: toastId });
//     } catch (error) {
//       toast.success("Data refreshed with some updates", { id: toastId });
//       console.error("Error refreshing data:", error);
//     }
//   }, [fetchRouters, fetchHotspotUsers, fetchPPPoEUsers, fetchBulkOperations, fetchAuditLogs, fetchHealthStats, state.activeRouter]);

//   // Return all functions and state
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
//     fetchBulkOperations,
//     fetchAuditLogs,
//     fetchConfigurationTemplates,
//     testRouterConnection,
//     fetchConnectionHistory,
//     fetchHealthStats,
//     showConfirm,
//     hideConfirm,
//     handleConfirm,
//     refreshAllData,
//   };
// };










// src/Pages/NetworkManagement/hooks/useRouterManagement.js - FIXED VERSION
import { useReducer, useCallback, useRef } from "react";
import { toast } from "react-hot-toast";
import api from "../../../../api";

// Enhanced Initial State with notification tracking
const initialState = {
  routers: [],
  activeRouter: null,
  isLoading: false,
  sectionLoading: {
    routers: false,
    health: false,
    bulkOps: false,
    auditLogs: false,
    hotspotUsers: false,
    pppoeUsers: false
  },
  // Track which notifications have been shown
  notificationsShown: {
    noRouters: false,
    initialLoad: false
  },
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
    scriptConfiguration: false,
    diagnostics: false,
    connectionTest: false,
    vpnConfiguration: false,
    technicianWorkflow: false,
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
    connection_status: "disconnected",
    configuration_status: "not_configured",
    configuration_type: "",
    is_default: false,
    captive_portal_enabled: true,
    is_active: true,
    max_clients: 50,
    description: "",
    ssid: "",
    firmware_version: "",
    auto_test_connection: true,
  },
  touchedFields: {
    name: false,
    ip: false,
    type: false,
  },
  hotspotForm: {
    ssid: "SurfZone-WiFi",
    landing_page_file: null,
    redirect_url: "http://captive.surfzone.local",
    bandwidth_limit: "10M",
    session_timeout: 60,
    auth_method: "universal",
    enable_splash_page: true,
    allow_social_login: false,
    enable_bandwidth_shaping: true,
    log_user_activity: true,
    max_users: 50,
    auto_apply: true,
  },
  pppoeForm: {
    ip_pool_name: "pppoe-pool-1",
    service_name: "",
    mtu: 1492,
    dns_servers: "8.8.8.8,1.1.1.1",
    bandwidth_limit: "10M",
    auth_methods: "all",
    enable_pap: true,
    enable_chap: true,
    enable_mschap: true,
    idle_timeout: 300,
    session_timeout: 0,
    default_profile: "default",
    interface: "bridge",
    ip_range_start: "192.168.100.10",
    ip_range_end: "192.168.100.200",
    service_type: "standard",
    auto_apply: true,
  },
  scriptForm: {
    script_type: "basic_setup",
    parameters: {},
    dry_run: false,
  },
  vpnForm: {
    vpn_type: "openvpn",
    configuration: {},
    generate_certificates: true,
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
  healthStats: {},
  expandedRouter: null,
  selectedUser: null,
  statsData: {},
  searchTerm: "",
  filter: "all",
  statsLoading: false,
  routerStats: {},
  callbackConfigs: [],
  systemMetrics: {},
  connectionTests: {},
  bulkOperations: [],
  auditLogs: [],
  realTimeData: {
    connectedRouters: 0,
    activeSessions: 0,
    systemHealth: 100,
    recentAlerts: []
  },
  webSocketConnected: false,
  monitoringView: "overview",
  connectionHistory: {},
  configurationTemplates: [],
  availableScripts: [],
  diagnosticsData: {},
  errors: {
    fetchRouters: null,
    form: {},
    connection: null
  },
  hasData: false,
  lastUpdated: null,
};

// Enhanced Reducer with notification tracking
const reducer = (state, action) => {
  switch (action.type) {
    case "SET_ROUTERS":
      return { 
        ...state, 
        routers: action.payload,
        hasData: action.payload.length > 0,
        lastUpdated: new Date().toISOString()
      };
    
    case "SET_ACTIVE_ROUTER":
      return {
        ...state,
        activeRouter: action.payload
      };
    
    case "SET_SECTION_LOADING":
      return {
        ...state,
        sectionLoading: {
          ...state.sectionLoading,
          [action.payload.section]: action.payload.loading
        }
      };
    
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    
    case "MARK_NOTIFICATION_SHOWN":
      return {
        ...state,
        notificationsShown: {
          ...state.notificationsShown,
          [action.payload]: true
        }
      };
    
    case "RESET_NOTIFICATIONS":
      return {
        ...state,
        notificationsShown: initialState.notificationsShown
      };
    
    case "TOGGLE_MODAL":
      return { 
        ...state, 
        modals: { ...state.modals, [action.modal]: !state.modals[action.modal] },
        ...(action.modal === "addRouter" && !state.modals[action.modal] && {
          touchedFields: initialState.touchedFields,
          errors: { ...state.errors, form: {} }
        })
      };
    
    case "SET_CONFIRM_MODAL":
      return { 
        ...state, 
        confirmModal: { ...state.confirmModal, ...action.payload } 
      };
    
    case "UPDATE_ROUTER_FORM":
      return { 
        ...state, 
        routerForm: { ...state.routerForm, ...action.payload },
        errors: { ...state.errors, form: {} }
      };
    
    case "UPDATE_HOTSPOT_FORM":
      return { ...state, hotspotForm: { ...state.hotspotForm, ...action.payload } };
    
    case "UPDATE_PPPOE_FORM":
      return { ...state, pppoeForm: { ...state.pppoeForm, ...action.payload } };
    
    case "UPDATE_SCRIPT_FORM":
      return { ...state, scriptForm: { ...state.scriptForm, ...action.payload } };
    
    case "UPDATE_VPN_FORM":
      return { ...state, vpnForm: { ...state.vpnForm, ...action.payload } };
    
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
        touchedFields: initialState.touchedFields,
        errors: { ...state.errors, form: {} }
      };
    
    case "RESET_CALLBACK_FORM":
      return { ...state, callbackForm: initialState.callbackForm };
    
    case "RESET_SCRIPT_FORM":
      return { ...state, scriptForm: initialState.scriptForm };
    
    case "RESET_VPN_FORM":
      return { ...state, vpnForm: initialState.vpnForm };
    
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
    
    case "SET_CONNECTION_TESTS":
      return { 
        ...state, 
        connectionTests: { ...state.connectionTests, [action.payload.routerId]: action.payload.tests } 
      };
    
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
    
    case "SET_MONITORING_VIEW":
      return { ...state, monitoringView: action.payload };
    
    case "SET_CONNECTION_HISTORY":
      return { 
        ...state, 
        connectionHistory: { ...state.connectionHistory, [action.payload.routerId]: action.payload.history } 
      };
    
    case "SET_CONFIGURATION_TEMPLATES":
      return { ...state, configurationTemplates: action.payload };
    
    case "SET_AVAILABLE_SCRIPTS":
      return { ...state, availableScripts: action.payload };
    
    case "SET_DIAGNOSTICS_DATA":
      return { 
        ...state, 
        diagnosticsData: { ...state.diagnosticsData, [action.payload.routerId]: action.payload.data } 
      };
    
    case "SET_ERROR":
      return {
        ...state,
        errors: { ...state.errors, [action.payload.field]: action.payload.message }
      };
    
    case "CLEAR_ERROR":
      return {
        ...state,
        errors: { ...state.errors, [action.payload.field]: null }
      };
    
    case "RESET_ERRORS":
      return {
        ...state,
        errors: initialState.errors
      };
    
    default:
      return state;
  }
};

// Validation utilities
const validateRouterForm = (formData) => {
  const errors = {};
  
  if (!formData.name?.trim()) {
    errors.name = "Router name is required";
  }
  
  if (!formData.ip?.trim()) {
    errors.ip = "IP address is required";
  } else {
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(formData.ip)) {
      errors.ip = "Invalid IP address format";
    }
  }
  
  if (!formData.type) {
    errors.type = "Router type is required";
  }
  
  if (!formData.username?.trim()) {
    errors.username = "Username is required";
  }
  
  return errors;
};

const validateHotspotForm = (formData) => {
  const errors = {};
  
  if (!formData.ssid?.trim()) {
    errors.ssid = "SSID is required";
  }
  
  if (!formData.bandwidth_limit?.trim()) {
    errors.bandwidth_limit = "Bandwidth limit is required";
  }
  
  if (!formData.session_timeout || formData.session_timeout < 1) {
    errors.session_timeout = "Session timeout must be at least 1 minute";
  }
  
  return errors;
};

// Enhanced API Functions with proper notification control
export const useRouterManagement = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const activeRouterRef = useRef(state.activeRouter);
  const hasShownInitialNoRoutersMessage = useRef(false);

  if (state.activeRouter !== activeRouterRef.current) {
    activeRouterRef.current = state.activeRouter;
  }

  // Helper to set section loading state
  const setSectionLoading = useCallback((section, loading) => {
    dispatch({ 
      type: "SET_SECTION_LOADING", 
      payload: { section, loading } 
    });
  }, []);

  // Mark notification as shown
  const markNotificationShown = useCallback((notificationType) => {
    dispatch({
      type: "MARK_NOTIFICATION_SHOWN",
      payload: notificationType
    });
  }, []);

  // Reset notifications (useful when user adds their first router)
  const resetNotifications = useCallback(() => {
    dispatch({ type: "RESET_NOTIFICATIONS" });
    hasShownInitialNoRoutersMessage.current = false;
  }, []);

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

  // Enhanced fetchRouters with intelligent notification handling
  const fetchRouters = useCallback(async (options = {}) => {
    const { 
      showToast = true, 
      silent = false,
      isBackgroundRefresh = false // New parameter to distinguish background refreshes
    } = options;
    
    if (!silent) {
      setSectionLoading('routers', true);
    }
    
    try {
      const routers = await api.smartFetch({
        method: 'get',
        url: '/api/network_management/routers/',
        params: { 
          status: state.filter !== "all" ? state.filter : undefined,
          connection_status: state.filter !== "all" ? state.filter : undefined,
          configuration_status: state.filter !== "all" ? state.filter : undefined,
          search: state.searchTerm || undefined,
          type: state.filter !== "all" ? state.filter : undefined,
        }
      }, {
        retries: 2,
        fallbackData: [],
        showToast: false // Never show toast for fetch operations
      });
      
      const safeRouters = Array.isArray(routers) ? routers : [];
      
      dispatch({ type: "SET_ROUTERS", payload: safeRouters });
      dispatch({ type: "CLEAR_ERROR", payload: { field: 'fetchRouters' } });
      
      if (!state.activeRouter && safeRouters.length > 0) {
        dispatch({ type: "SET_ACTIVE_ROUTER", payload: safeRouters[0] });
      }
      
      // INTELLIGENT NOTIFICATION HANDLING:
      // Only show "no routers" message under specific conditions
      if (showToast && safeRouters.length === 0) {
        const shouldShowNoRoutersMessage = 
          !isBackgroundRefresh && // Don't show for background refreshes
          !state.notificationsShown.noRouters && // Only show once
          !hasShownInitialNoRoutersMessage.current; // Additional safety check
        
        if (shouldShowNoRoutersMessage) {
          toast.success("No routers found. Add your first router to get started!");
          markNotificationShown('noRouters');
          hasShownInitialNoRoutersMessage.current = true;
        }
      }
      
      return safeRouters;
    } catch (error) {
      const errorMessage = "Unable to load routers at this time";
      
      dispatch({ 
        type: "SET_ERROR", 
        payload: { field: 'fetchRouters', message: errorMessage } 
      });
      
      // Only show error toast for user-initiated actions, not background refreshes
      if (showToast && !silent && !options.isBackgroundRefresh) {
        if (error.response?.status === 404) {
          toast.error("Routers service is currently unavailable");
        } else if (error.response?.status === 401) {
          toast.error("Please log in again to continue");
        } else {
          toast.error(errorMessage);
        }
      }
      
      console.error("Error fetching routers:", error);
      dispatch({ type: "SET_ROUTERS", payload: [] });
      return [];
    } finally {
      if (!silent) {
        setSectionLoading('routers', false);
      }
    }
  }, [state.filter, state.searchTerm, state.activeRouter, state.notificationsShown.noRouters, setSectionLoading, markNotificationShown]);

  // Enhanced fetchHotspotUsers with better error handling
  const fetchHotspotUsers = useCallback(async (routerId, options = {}) => {
    if (!routerId) {
      if (!options.silent) {
        toast.error("No router selected");
      }
      return [];
    }
    
    const { showToast = true, silent = false } = options;
    
    if (!silent) {
      setSectionLoading('hotspotUsers', true);
    }
    
    try {
      const users = await api.smartFetch({
        method: 'get',
        url: `/api/network_management/routers/${routerId}/hotspot-users/`
      }, {
        retries: 1,
        fallbackData: [],
        showToast: false
      });
      
      const safeUsers = Array.isArray(users) ? users : [];
      
      dispatch({ type: "SET_HOTSPOT_USERS", payload: safeUsers });
      
      // Don't show empty state toasts for user lists
      return safeUsers;
    } catch (error) {
      const errorMessage = "Unable to load hotspot users";
      
      if (showToast && !silent) {
        if (error.response?.status === 404) {
          toast.error("Hotspot users endpoint not found");
        } else {
          toast.error(errorMessage);
        }
      }
      
      console.error("Error fetching hotspot users:", error);
      dispatch({ type: "SET_HOTSPOT_USERS", payload: [] });
      return [];
    } finally {
      if (!silent) {
        setSectionLoading('hotspotUsers', false);
      }
    }
  }, [setSectionLoading]);

  // Enhanced fetchPPPoEUsers with better error handling
  const fetchPPPoEUsers = useCallback(async (routerId, options = {}) => {
    if (!routerId) {
      if (!options.silent) {
        toast.error("No router selected");
      }
      return [];
    }
    
    const { showToast = true, silent = false } = options;
    
    if (!silent) {
      setSectionLoading('pppoeUsers', true);
    }
    
    try {
      const users = await api.smartFetch({
        method: 'get',
        url: `/api/network_management/routers/${routerId}/pppoe-users/`
      }, {
        retries: 1,
        fallbackData: [],
        showToast: false
      });
      
      const safeUsers = Array.isArray(users) ? users : [];
      
      dispatch({ type: "SET_PPPOE_USERS", payload: safeUsers });
      
      // Don't show empty state toasts for user lists
      return safeUsers;
    } catch (error) {
      const errorMessage = "Unable to load PPPoE users";
      
      if (showToast && !silent) {
        if (error.response?.status === 404) {
          toast.error("PPPoE users endpoint not found");
        } else {
          toast.error(errorMessage);
        }
      }
      
      console.error("Error fetching PPPoE users:", error);
      dispatch({ type: "SET_PPPOE_USERS", payload: [] });
      return [];
    } finally {
      if (!silent) {
        setSectionLoading('pppoeUsers', false);
      }
    }
  }, [setSectionLoading]);

  // Enhanced fetchSessionHistory with better error handling
  const fetchSessionHistory = useCallback(async (userId, userType = "hotspot", options = {}) => {
    if (!userId) {
      toast.error("No user selected");
      return [];
    }
    
    const { showToast = true } = options;
    
    try {
      const endpoint = userType === "hotspot" 
        ? `/api/network_management/hotspot-users/${userId}/session-history/`
        : `/api/network_management/pppoe-users/${userId}/session-history/`;
      
      const history = await api.smartFetch({
        method: 'get',
        url: endpoint
      }, {
        retries: 1,
        fallbackData: [],
        showToast: false
      });
      
      const safeHistory = Array.isArray(history) ? history : [];
      
      dispatch({ type: "SET_SESSION_HISTORY", payload: safeHistory });
      
      if (showToast && safeHistory.length === 0) {
        toast("No session history found", { icon: 'ℹ️' });
      }
      
      return safeHistory;
    } catch (error) {
      const errorMessage = "Unable to load session history";
      
      if (showToast && error.response?.status !== 404) {
        toast.error(errorMessage);
      }
      
      console.error("Error fetching session history:", error);
      dispatch({ type: "SET_SESSION_HISTORY", payload: [] });
      return [];
    }
  }, []);

  // Enhanced fetchCallbackConfigs with better error handling
  const fetchCallbackConfigs = useCallback(async (routerId, options = {}) => {
    if (!routerId) {
      toast.error("No router selected");
      return [];
    }
    
    const { showToast = true } = options;
    
    try {
      const configs = await api.smartFetch({
        method: 'get',
        url: `/api/network_management/routers/${routerId}/callback-configs/`
      }, {
        retries: 1,
        fallbackData: [],
        showToast: false
      });
      
      const safeConfigs = Array.isArray(configs) ? configs : [];
      
      dispatch({ type: "SET_CALLBACK_CONFIGS", payload: safeConfigs });
      
      if (showToast && safeConfigs.length === 0) {
        toast("No callback configurations found", { icon: 'ℹ️' });
      }
      
      return safeConfigs;
    } catch (error) {
      const errorMessage = "Unable to load callback configurations";
      
      if (showToast && error.response?.status !== 404) {
        toast.error(errorMessage);
      }
      
      console.error("Error fetching callback configs:", error);
      dispatch({ type: "SET_CALLBACK_CONFIGS", payload: [] });
      return [];
    }
  }, []);

  // Enhanced fetchBulkOperations with timeout handling
  const fetchBulkOperations = useCallback(async (options = {}) => {
    const { showToast = true } = options;
    
    setSectionLoading('bulkOps', true);
    
    try {
      const operations = await api.smartFetch({
        method: 'get',
        url: '/api/network_management/bulk-operations/history/'
      }, {
        retries: 1,
        fallbackData: [],
        showToast: false // Don't show toast for this background operation
      });
      
      const safeOperations = Array.isArray(operations) ? operations : [];
      
      dispatch({ type: "SET_BULK_OPERATIONS", payload: safeOperations });
      
      if (showToast && safeOperations.length === 0) {
        // Don't show toast for empty results to reduce noise
      }
      
      return safeOperations;
    } catch (error) {
      console.error("Error fetching bulk operations:", error);
      
      if (showToast && error.response?.status !== 404) {
        // Don't show toast for this background operation
      }
      
      dispatch({ type: "SET_BULK_OPERATIONS", payload: [] });
      return [];
    } finally {
      setSectionLoading('bulkOps', false);
    }
  }, [setSectionLoading]);

  // Enhanced fetchAuditLogs with better error handling
  const fetchAuditLogs = useCallback(async (filters = {}, options = {}) => {
    const { showToast = true } = options;
    
    setSectionLoading('auditLogs', true);
    
    try {
      const logs = await api.smartFetch({
        method: 'get',
        url: '/api/network_management/audit-logs/',
        params: filters
      }, {
        retries: 1,
        fallbackData: [],
        showToast: false // Background operation
      });
      
      const safeLogs = Array.isArray(logs) ? logs : [];
      
      dispatch({ type: "SET_AUDIT_LOGS", payload: safeLogs });
      
      if (showToast && safeLogs.length === 0) {
        // No toast for empty results
      }
      
      return safeLogs;
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      
      if (showToast && error.response?.status !== 404) {
        // No toast for background errors
      }
      
      dispatch({ type: "SET_AUDIT_LOGS", payload: [] });
      return [];
    } finally {
      setSectionLoading('auditLogs', false);
    }
  }, [setSectionLoading]);

  // Enhanced fetchHealthStats
  const fetchHealthStats = useCallback(async (options = {}) => {
    const { showToast = true } = options;
    
    setSectionLoading('health', true);
    
    try {
      const stats = await api.smartFetch({
        method: 'get',
        url: '/api/network_management/health-monitoring/'
      }, {
        retries: 1,
        fallbackData: {
          total_routers: 0,
          online_routers: 0,
          offline_routers: 0,
          health_score: 0
        },
        showToast: false
      });
      
      dispatch({ type: "SET_HEALTH_STATS", payload: stats });
      return stats;
    } catch (error) {
      console.error("Error fetching health stats:", error);
      
      // Use fallback data
      const fallbackStats = {
        total_routers: state.routers.length,
        online_routers: state.routers.filter(r => r.connection_status === 'connected').length,
        offline_routers: state.routers.filter(r => r.connection_status === 'disconnected').length,
        health_score: 0,
        fallback: true
      };
      
      dispatch({ type: "SET_HEALTH_STATS", payload: fallbackStats });
      return fallbackStats;
    } finally {
      setSectionLoading('health', false);
    }
  }, [state.routers, setSectionLoading]);

  // Enhanced fetchConfigurationTemplates with better error handling
  const fetchConfigurationTemplates = useCallback(async (options = {}) => {
    const { showToast = true } = options;
    
    try {
      const templates = await api.smartFetch({
        method: 'get',
        url: '/api/network_management/configuration-templates/'
      }, {
        retries: 1,
        fallbackData: [],
        showToast: false
      });
      
      const safeTemplates = Array.isArray(templates) ? templates : [];
      
      dispatch({ type: "SET_CONFIGURATION_TEMPLATES", payload: safeTemplates });
      
      if (showToast && safeTemplates.length === 0) {
        toast("No configuration templates found", { icon: 'ℹ️' });
      }
      
      return safeTemplates;
    } catch (error) {
      const errorMessage = "Unable to load configuration templates";
      
      if (showToast) {
        if (error.response?.status === 404) {
          toast.error("Configuration templates endpoint not found");
        } else {
          toast.error(errorMessage);
        }
      }
      
      console.error("Error fetching configuration templates:", error);
      dispatch({ type: "SET_CONFIGURATION_TEMPLATES", payload: [] });
      return [];
    }
  }, []);

  // Enhanced fetchAvailableScripts with better error handling
  const fetchAvailableScripts = useCallback(async (options = {}) => {
    const { showToast = true } = options;
    
    try {
      const scripts = await api.smartFetch({
        method: 'get',
        url: '/api/network_management/available-scripts/'
      }, {
        retries: 1,
        fallbackData: [],
        showToast: false
      });
      
      const safeScripts = Array.isArray(scripts) ? scripts : [];
      
      dispatch({ type: "SET_AVAILABLE_SCRIPTS", payload: safeScripts });
      
      if (showToast && safeScripts.length === 0) {
        toast("No scripts available", { icon: 'ℹ️' });
      }
      
      return safeScripts;
    } catch (error) {
      const errorMessage = "Unable to load available scripts";
      
      if (showToast) {
        if (error.response?.status === 404) {
          toast.error("Scripts endpoint not found");
        } else {
          toast.error(errorMessage);
        }
      }
      
      console.error("Error fetching available scripts:", error);
      dispatch({ type: "SET_AVAILABLE_SCRIPTS", payload: [] });
      return [];
    }
  }, []);

  // Enhanced addRouter that resets notifications when successful
  const addRouter = useCallback(async () => {
    const formErrors = validateRouterForm(state.routerForm);
    
    if (Object.keys(formErrors).length > 0) {
      Object.keys(formErrors).forEach(field => {
        dispatch({ type: "SET_TOUCHED_FIELD", field });
      });
      
      Object.entries(formErrors).forEach(([field, message]) => {
        dispatch({ 
          type: "SET_ERROR", 
          payload: { field: `form.${field}`, message } 
        });
      });
      
      toast.error("Please fix the form errors before submitting");
      return;
    }

    dispatch({ type: "SET_LOADING", payload: true });
    const toastId = toast.loading('Adding router...');
    
    try {
      const response = await api.smartFetch({
        method: 'post',
        url: '/api/network_management/routers/',
        data: state.routerForm
      }, {
        retries: 1,
        showToast: true
      });
      
      if (!response || !response.id) {
        throw new Error("Invalid response from server");
      }
      
      dispatch({ type: "SET_ROUTERS", payload: [...state.routers, response] });
      dispatch({ type: "SET_ACTIVE_ROUTER", payload: response });
      dispatch({ type: "TOGGLE_MODAL", modal: "addRouter" });
      dispatch({ type: "RESET_ROUTER_FORM" });
      dispatch({ type: "RESET_ERRORS" });
      
      // Reset notifications since user now has at least one router
      resetNotifications();
      
      if (state.routerForm.auto_test_connection && response.connection_test) {
        const testResult = response.connection_test;
        if (testResult.success) {
          toast.success(`Router added successfully!`, { id: toastId });
        } else {
          toast.success(`Router added! Connection test: ${testResult.message}`, { id: toastId });
        }
      } else {
        toast.success("Router added successfully!", { id: toastId });
      }
      
      return response;
    } catch (error) {
      console.error("Error adding router:", error);
      
      let errorMessage = "Failed to add router. Please try again.";
      
      if (error.response?.status === 400) {
        const backendErrors = error.response.data;
        Object.entries(backendErrors).forEach(([field, messages]) => {
          if (Array.isArray(messages)) {
            dispatch({ 
              type: "SET_ERROR", 
              payload: { field: `form.${field}`, message: messages[0] } 
            });
          }
        });
        errorMessage = "Please fix the form errors";
      }
      
      toast.error(errorMessage, { id: toastId });
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [state.routerForm, state.routers, resetNotifications]);

  // Enhanced updateRouter with better error handling
  const updateRouter = useCallback(async (id) => {
    if (!id) {
      toast.error("No router selected for update");
      return;
    }

    dispatch({ type: "SET_LOADING", payload: true });
    const toastId = toast.loading('Updating router...');
    
    try {
      const response = await api.smartFetch({
        method: 'put',
        url: `/api/network_management/routers/${id}/`,
        data: state.routerForm
      }, {
        retries: 1,
        showToast: true
      });
      
      if (!response || !response.id) {
        throw new Error("Invalid response from server");
      }
      
      dispatch({ type: "UPDATE_ROUTER", payload: { id, data: response } });
      dispatch({ type: "TOGGLE_MODAL", modal: "editRouter" });
      dispatch({ type: "RESET_ERRORS" });
      
      if (response.connection_test) {
        const testResult = response.connection_test;
        if (testResult.success) {
          toast.success("Router updated and connection test successful!", { id: toastId });
        } else {
          toast.success(`Router updated! Connection test: ${testResult.message}`, { id: toastId });
        }
      } else {
        toast.success("Router updated successfully!", { id: toastId });
      }
      
      return response;
    } catch (error) {
      console.error("Error updating router:", error);
      
      let errorMessage = "Failed to update router. Please try again.";
      
      if (error.response?.status === 404) {
        errorMessage = "Router not found. It may have been deleted.";
      }
      
      toast.error(errorMessage, { id: toastId });
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [state.routerForm]);

  // Enhanced deleteRouter with better error handling
  const deleteRouter = useCallback(async (id) => {
    if (!id) {
      toast.error("No router selected for deletion");
      return;
    }

    dispatch({ type: "SET_LOADING", payload: true });
    const toastId = toast.loading('Deleting router...');
    
    try {
      await api.smartFetch({
        method: 'delete',
        url: `/api/network_management/routers/${id}/`
      }, {
        retries: 1,
        showToast: true
      });
      
      dispatch({ type: "DELETE_ROUTER", id });
      toast.success("Router deleted successfully!", { id: toastId });
    } catch (error) {
      console.error("Error deleting router:", error);
      
      let errorMessage = "Failed to delete router. Please try again.";
      
      if (error.response?.status === 404) {
        errorMessage = "Router not found. It may have already been deleted.";
      }
      
      toast.error(errorMessage, { id: toastId });
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  // Enhanced configureHotspot with better error handling
  const configureHotspot = useCallback(async () => {
    if (!state.activeRouter) {
      toast.error("No active router selected");
      return;
    }

    const formErrors = validateHotspotForm(state.hotspotForm);
    if (Object.keys(formErrors).length > 0) {
      toast.error("Please fix the hotspot configuration errors");
      return;
    }

    dispatch({ type: "SET_LOADING", payload: true });
    const toastId = toast.loading('Configuring hotspot...');
    
    try {
      const formData = new FormData();
      Object.entries(state.hotspotForm).forEach(([key, value]) => {
        if (key === "landing_page_file" && value) {
          formData.append("landing_page_file", value);
        } else if (value !== null && value !== undefined) {
          formData.append(key, value.toString());
        }
      });
      
      const response = await api.smartFetch({
        method: 'post',
        url: `/api/network_management/routers/${state.activeRouter.id}/hotspot-config/`,
        data: formData,
        headers: { "Content-Type": "multipart/form-data" }
      }, {
        retries: 1,
        showToast: true
      });
      
      if (response.data) {
        dispatch({ 
          type: "UPDATE_ROUTER", 
          payload: { 
            id: state.activeRouter.id, 
            data: { 
              configuration_status: 'configured',
              configuration_type: 'hotspot',
              ssid: state.hotspotForm.ssid,
              last_configuration_update: new Date().toISOString()
            } 
          } 
        });
      }
      
      dispatch({ type: "TOGGLE_MODAL", modal: "hotspotConfig" });
      toast.success("Hotspot configured successfully!", { id: toastId });
    } catch (error) {
      console.error("Error configuring hotspot:", error);
      
      let errorMessage = "Failed to configure hotspot. Please try again.";
      
      toast.error(errorMessage, { id: toastId });
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [state.hotspotForm, state.activeRouter]);

  // Enhanced configurePPPoE with better error handling
  const configurePPPoE = useCallback(async () => {
    if (!state.activeRouter) {
      toast.error("No active router selected");
      return;
    }

    dispatch({ type: "SET_LOADING", payload: true });
    const toastId = toast.loading('Configuring PPPoE...');
    
    try {
      const response = await api.smartFetch({
        method: 'post',
        url: `/api/network_management/routers/${state.activeRouter.id}/pppoe-config/`,
        data: state.pppoeForm
      }, {
        retries: 1,
        showToast: true
      });
      
      if (response.data) {
        dispatch({ 
          type: "UPDATE_ROUTER", 
          payload: { 
            id: state.activeRouter.id, 
            data: { 
              configuration_status: 'configured',
              configuration_type: 'pppoe',
              last_configuration_update: new Date().toISOString()
            } 
          } 
        });
      }
      
      dispatch({ type: "TOGGLE_MODAL", modal: "pppoeConfig" });
      toast.success("PPPoE configured successfully!", { id: toastId });
    } catch (error) {
      console.error("Error configuring PPPoE:", error);
      
      let errorMessage = "Failed to configure PPPoE. Please try again.";
      
      toast.error(errorMessage, { id: toastId });
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [state.pppoeForm, state.activeRouter]);

  // Enhanced updateRouterStatus with better error handling
  const updateRouterStatus = useCallback(async (routerId, newStatus) => {
    if (!routerId) {
      toast.error("No router selected");
      return;
    }

    dispatch({ type: "SET_LOADING", payload: true });
    const toastId = toast.loading('Updating router status...');
    
    try {
      await api.smartFetch({
        method: 'put',
        url: `/api/network_management/routers/${routerId}/`,
        data: { status: newStatus }
      }, {
        retries: 1,
        showToast: true
      });

      dispatch({ type: "UPDATE_ROUTER", payload: { 
        id: routerId, 
        data: { status: newStatus } 
      }});
      
      toast.success(`Router ${newStatus === 'connected' ? 'activated' : 'deactivated'} successfully!`, { id: toastId });
    } catch (error) {
      console.error("Error updating router status:", error);
      
      let errorMessage = "Failed to update router status. Please try again.";
      
      toast.error(errorMessage, { id: toastId });
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  // Enhanced restartRouter with better error handling
  const restartRouter = useCallback(async (routerId) => {
    if (!routerId) {
      toast.error("No router selected");
      return;
    }

    dispatch({ type: "SET_LOADING", payload: true });
    const toastId = toast.loading('Restarting router...');
    
    try {
      await api.smartFetch({
        method: 'post',
        url: `/api/network_management/routers/${routerId}/reboot/`
      }, {
        retries: 1,
        showToast: true
      });
      
      dispatch({ type: "UPDATE_ROUTER", payload: { 
        id: routerId, 
        data: { status: "updating" } 
      }});
      
      toast.success("Router restart initiated", { id: toastId });
    } catch (error) {
      console.error("Error restarting router:", error);
      
      let errorMessage = "Failed to restart router. Please try again.";
      
      toast.error(errorMessage, { id: toastId });
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  // Enhanced fetchRouterStats with better error handling
  const fetchRouterStats = useCallback(async (routerId, options = {}) => {
    if (!routerId) {
      toast.error("No router selected");
      return;
    }
    
    const { showToast = true } = options;
    
    dispatch({ type: "SET_STATS_LOADING", payload: true });
    const toastId = showToast ? toast.loading('Loading router stats...') : null;
    
    try {
      const stats = await api.smartFetch({
        method: 'get',
        url: `/api/network_management/routers/${routerId}/stats/`
      }, {
        retries: 1,
        fallbackData: {},
        showToast: false
      });
      
      dispatch({ 
        type: "SET_ROUTER_STATS", 
        payload: { routerId, stats } 
      });
      
      if (showToast) {
        toast.success("Router stats loaded", { id: toastId });
      }
      
      return stats;
    } catch (error) {
      console.error("Error fetching router stats:", error);
      
      if (showToast) {
        toast.error("Unable to load router stats", { id: toastId });
      }
      
      throw error;
    } finally {
      dispatch({ type: "SET_STATS_LOADING", payload: false });
    }
  }, []);

  // Enhanced disconnectHotspotUser with better error handling
  const disconnectHotspotUser = useCallback(async (userId) => {
    if (!userId) {
      toast.error("No user selected");
      return;
    }

    dispatch({ type: "SET_LOADING", payload: true });
    const toastId = toast.loading('Disconnecting user...');
    
    try {
      await api.smartFetch({
        method: 'delete',
        url: `/api/network_management/hotspot-users/${userId}/`
      }, {
        retries: 1,
        showToast: true
      });
      
      dispatch({ type: "SET_HOTSPOT_USERS", payload: state.hotspotUsers.filter((u) => u.id !== userId) });
      toast.success("Hotspot user disconnected", { id: toastId });
    } catch (error) {
      console.error("Error disconnecting hotspot user:", error);
      
      let errorMessage = "Failed to disconnect hotspot user. Please try again.";
      
      toast.error(errorMessage, { id: toastId });
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [state.hotspotUsers]);

  // Enhanced disconnectPPPoEUser with better error handling
  const disconnectPPPoEUser = useCallback(async (userId) => {
    if (!userId) {
      toast.error("No user selected");
      return;
    }

    dispatch({ type: "SET_LOADING", payload: true });
    const toastId = toast.loading('Disconnecting user...');
    
    try {
      await api.smartFetch({
        method: 'delete',
        url: `/api/network_management/pppoe-users/${userId}/`
      }, {
        retries: 1,
        showToast: true
      });
      
      dispatch({ type: "SET_PPPOE_USERS", payload: state.pppoeUsers.filter((u) => u.id !== userId) });
      toast.success("PPPoE user disconnected", { id: toastId });
    } catch (error) {
      console.error("Error disconnecting PPPoE user:", error);
      
      let errorMessage = "Failed to disconnect PPPoE user. Please try again.";
      
      toast.error(errorMessage, { id: toastId });
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [state.pppoeUsers]);

  // Enhanced addCallbackConfig with better error handling
  const addCallbackConfig = useCallback(async () => {
    if (!state.activeRouter) {
      toast.error("No active router selected");
      return;
    }

    dispatch({ type: "SET_LOADING", payload: true });
    const toastId = toast.loading('Adding callback configuration...');
    
    try {
      const response = await api.smartFetch({
        method: 'post',
        url: `/api/network_management/routers/${state.activeRouter.id}/callback-configs/`,
        data: state.callbackForm
      }, {
        retries: 1,
        showToast: true
      });
      
      dispatch({ type: "SET_CALLBACK_CONFIGS", payload: [...state.callbackConfigs, response] });
      dispatch({ type: "TOGGLE_MODAL", modal: "callbackConfig" });
      dispatch({ type: "RESET_CALLBACK_FORM" });
      toast.success("Callback configuration added", { id: toastId });
    } catch (error) {
      console.error("Error adding callback config:", error);
      
      let errorMessage = "Failed to add callback configuration. Please try again.";
      
      toast.error(errorMessage, { id: toastId });
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [state.callbackForm, state.callbackConfigs, state.activeRouter]);

  // Enhanced deleteCallbackConfig with better error handling
  const deleteCallbackConfig = useCallback(async (id) => {
    if (!state.activeRouter) {
      toast.error("No active router selected");
      return;
    }
    
    dispatch({ type: "SET_LOADING", payload: true });
    const toastId = toast.loading('Deleting callback configuration...');
    
    try {
      await api.smartFetch({
        method: 'delete',
        url: `/api/network_management/routers/${state.activeRouter.id}/callback-configs/${id}/`
      }, {
        retries: 1,
        showToast: true
      });
      
      dispatch({ type: "SET_CALLBACK_CONFIGS", payload: state.callbackConfigs.filter((cb) => cb.id !== id) });
      toast.success("Callback configuration deleted", { id: toastId });
    } catch (error) {
      console.error("Error deleting callback config:", error);
      
      let errorMessage = "Failed to delete callback configuration. Please try again.";
      
      toast.error(errorMessage, { id: toastId });
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [state.callbackConfigs, state.activeRouter]);

  // Enhanced restoreSessions with better error handling
  const restoreSessions = useCallback(async (routerId) => {
    if (!routerId) {
      toast.error("No router selected");
      return;
    }

    dispatch({ type: "SET_LOADING", payload: true });
    const toastId = toast.loading('Restoring sessions...');
    
    try {
      const response = await api.smartFetch({
        method: 'post',
        url: `/api/network_management/routers/${routerId}/restore-sessions/`
      }, {
        retries: 1,
        showToast: true
      });
      
      toast.success(response.data?.message || "Sessions restored successfully", { id: toastId });
      
      // Refresh user lists
      await fetchHotspotUsers(routerId, { showToast: false });
      await fetchPPPoEUsers(routerId, { showToast: false });
    } catch (error) {
      console.error("Error restoring sessions:", error);
      
      let errorMessage = "Failed to restore sessions. Please try again.";
      
      toast.error(errorMessage, { id: toastId });
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [fetchHotspotUsers, fetchPPPoEUsers]);

  // Enhanced testRouterConnection with better error handling
  const testRouterConnection = useCallback(async (routerId = null, credentials = null) => {
    dispatch({ type: "SET_LOADING", payload: true });
    const toastId = toast.loading('Testing connection...');
    
    try {
      let response;
      if (routerId) {
        response = await api.smartFetch({
          method: 'post',
          url: `/api/network_management/routers/${routerId}/test-connection/`
        }, {
          retries: 1,
          showToast: true
        });
      } else if (credentials) {
        response = await api.smartFetch({
          method: 'post',
          url: '/api/network_management/test-connection/',
          data: credentials
        }, {
          retries: 1,
          showToast: true
        });
      } else {
        throw new Error("Either routerId or credentials must be provided");
      }

      if (routerId) {
        dispatch({ 
          type: "UPDATE_ROUTER", 
          payload: { 
            id: routerId, 
            data: { 
              connection_status: response.data?.test_results?.system_access ? 'connected' : 'disconnected',
              last_connection_test: new Date().toISOString()
            } 
          } 
        });
        
        dispatch({ 
          type: "SET_CONNECTION_TESTS", 
          payload: { routerId, tests: response.data } 
        });
      }

      const success = response.data?.test_results?.system_access;
      toast.success(success ? "Connection test successful" : "Connection test failed", { id: toastId });
      return response.data;
    } catch (error) {
      console.error("Error testing connection:", error);
      
      let errorMessage = "Connection test failed. Please try again.";
      
      toast.error(errorMessage, { id: toastId });
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  // Enhanced fetchConnectionHistory with better error handling
  const fetchConnectionHistory = useCallback(async (routerId, days = 7, options = {}) => {
    if (!routerId) {
      toast.error("No router selected");
      return;
    }
    
    const { showToast = true } = options;
    
    try {
      const history = await api.smartFetch({
        method: 'get',
        url: `/api/network_management/routers/${routerId}/connection-history/`,
        params: { days }
      }, {
        retries: 1,
        fallbackData: {},
        showToast: false
      });
      
      dispatch({ 
        type: "SET_CONNECTION_HISTORY", 
        payload: { routerId, history } 
      });
      
      return history;
    } catch (error) {
      console.error("Error fetching connection history:", error);
      
      if (showToast) {
        toast.error("Unable to load connection history");
      }
      
      throw error;
    }
  }, []);

  // Enhanced refreshAllData that doesn't spam notifications
  const refreshAllData = useCallback(async (options = {}) => {
    const { showToast = true } = options;
    const toastId = showToast ? toast.loading("Refreshing data...") : null;
    
    try {
      await Promise.allSettled([
        fetchRouters({ showToast: false, silent: true, isBackgroundRefresh: true }),
        state.activeRouter && fetchHotspotUsers(state.activeRouter.id, { showToast: false, silent: true }),
        state.activeRouter && fetchPPPoEUsers(state.activeRouter.id, { showToast: false, silent: true }),
        fetchBulkOperations({ showToast: false }),
        fetchAuditLogs({}, { showToast: false }),
        fetchHealthStats({ showToast: false }),
      ]);
      
      if (showToast) {
        toast.success("Data refreshed successfully!", { id: toastId });
      }
    } catch (error) {
      if (showToast) {
        toast.success("Data refreshed with some updates", { id: toastId });
      }
      console.error("Error refreshing data:", error);
    }
  }, [fetchRouters, fetchHotspotUsers, fetchPPPoEUsers, fetchBulkOperations, fetchAuditLogs, fetchHealthStats, state.activeRouter]);

  // Return all functions and state
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
    fetchBulkOperations,
    fetchAuditLogs,
    fetchConfigurationTemplates,
    fetchAvailableScripts,
    testRouterConnection,
    fetchConnectionHistory,
    fetchHealthStats,
    showConfirm,
    hideConfirm,
    handleConfirm,
    refreshAllData,
    resetNotifications, // Export the reset function
    markNotificationShown, // Export the mark function
  };
};