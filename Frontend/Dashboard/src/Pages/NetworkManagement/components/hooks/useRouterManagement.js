



// // src/Pages/NetworkManagement/hooks/useRouterManagement.js
// import { useReducer, useCallback, useRef } from "react";
// import { toast } from "react-toastify";
// import api from "../../../../api";

// // Enhanced Initial State
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
// };

// // Enhanced Reducer
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
//         touchedFields: initialState.touchedFields
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

//   // Enhanced API Functions

//   const fetchRouters = useCallback(async () => {
//     dispatch({ type: "SET_LOADING", payload: true });
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

//   // NEW ENHANCED API FUNCTIONS

//   const testRouterConnection = useCallback(async (routerId = null, credentials = null) => {
//     dispatch({ type: "SET_LOADING", payload: true });
//     try {
//       let response;
//       if (routerId) {
//         // Test existing router
//         response = await api.post(`/api/network_management/routers/${routerId}/test-connection/`);
//       } else if (credentials) {
//         // Test new connection with provided credentials
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
//               connection_status: response.data.test_results.system_access ? 'connected' : 'disconnected',
//               last_connection_test: new Date().toISOString()
//             } 
//           } 
//         });
        
//         dispatch({ 
//           type: "SET_CONNECTION_TESTS", 
//           payload: { routerId, tests: response.data } 
//         });
//       }

//       toast.success(response.data.test_results.system_access ? "Connection test successful" : "Connection test failed");
//       return response.data;
//     } catch (error) {
//       toast.error("Connection test failed");
//       console.error("Error testing connection:", error);
//       throw error;
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   }, []);

//   const fetchConnectionHistory = useCallback(async (routerId, days = 7) => {
//     try {
//       const response = await api.get(`/api/network_management/routers/${routerId}/connection-history/`, {
//         params: { days }
//       });
//       dispatch({ 
//         type: "SET_CONNECTION_HISTORY", 
//         payload: { routerId, history: response.data } 
//       });
//       return response.data;
//     } catch (error) {
//       console.error("Error fetching connection history:", error);
//       throw error;
//     }
//   }, []);

//   const executeScriptConfiguration = useCallback(async (routerId, scriptData) => {
//     dispatch({ type: "SET_LOADING", payload: true });
//     try {
//       const response = await api.post(`/api/network_management/routers/${routerId}/script-configuration/`, scriptData);
      
//       if (response.data.success && !scriptData.dry_run) {
//         dispatch({ 
//           type: "UPDATE_ROUTER", 
//           payload: { 
//             id: routerId, 
//             data: { 
//               configuration_status: 'configured',
//               configuration_type: scriptData.script_type,
//               last_configuration_update: new Date().toISOString()
//             } 
//           } 
//         });
//       }
      
//       toast.success(response.data.success ? "Script execution completed" : "Script execution failed");
//       return response.data;
//     } catch (error) {
//       toast.error("Script execution failed");
//       console.error("Error executing script:", error);
//       throw error;
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   }, []);

//   const fetchAvailableScripts = useCallback(async (routerId) => {
//     try {
//       const response = await api.get(`/api/network_management/routers/${routerId}/script-configuration/`);
//       dispatch({ type: "SET_AVAILABLE_SCRIPTS", payload: response.data });
//       return response.data;
//     } catch (error) {
//       console.error("Error fetching available scripts:", error);
//       throw error;
//     }
//   }, []);

//   const configureVPN = useCallback(async (routerId, vpnData) => {
//     dispatch({ type: "SET_LOADING", payload: true });
//     try {
//       const response = await api.post(`/api/network_management/routers/${routerId}/vpn-configuration/`, vpnData);
      
//       if (response.data.success) {
//         dispatch({ 
//           type: "UPDATE_ROUTER", 
//           payload: { 
//             id: routerId, 
//             data: { 
//               configuration_status: 'configured',
//               configuration_type: `vpn_${vpnData.vpn_type}`,
//               last_configuration_update: new Date().toISOString()
//             } 
//           } 
//         });
//       }
      
//       toast.success(response.data.success ? "VPN configuration completed" : "VPN configuration failed");
//       return response.data;
//     } catch (error) {
//       toast.error("VPN configuration failed");
//       console.error("Error configuring VPN:", error);
//       throw error;
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   }, []);

//   const performBulkAction = useCallback(async (actionData) => {
//     dispatch({ type: "SET_LOADING", payload: true });
//     try {
//       const response = await api.post("/api/network_management/bulk-actions/", actionData);
      
//       // Start polling for bulk operation status
//       if (response.data.operation_id) {
//         pollBulkOperationStatus(response.data.operation_id);
//       }
      
//       toast.success("Bulk operation started successfully");
//       return response.data;
//     } catch (error) {
//       toast.error("Failed to start bulk operation");
//       console.error("Bulk operation error:", error);
//       throw error;
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   }, []);

//   const pollBulkOperationStatus = useCallback(async (operationId) => {
//     try {
//       const response = await api.get(`/api/network_management/bulk-operations/${operationId}/`);
//       dispatch({ type: "UPDATE_BULK_OPERATION", payload: response.data });
      
//       if (response.data.status === 'running') {
//         setTimeout(() => pollBulkOperationStatus(operationId), 2000);
//       }
//     } catch (error) {
//       console.error("Error polling bulk operation status:", error);
//     }
//   }, []);

//   const fetchBulkOperations = useCallback(async () => {
//     try {
//       const response = await api.get("/api/network_management/bulk-operations/history/");
//       dispatch({ type: "SET_BULK_OPERATIONS", payload: response.data });
//     } catch (error) {
//       console.error("Error fetching bulk operations:", error);
//     }
//   }, []);

//   const fetchAuditLogs = useCallback(async (filters = {}) => {
//     try {
//       const response = await api.get("/api/network_management/audit-logs/", { params: filters });
//       dispatch({ type: "SET_AUDIT_LOGS", payload: response.data });
//     } catch (error) {
//       console.error("Error fetching audit logs:", error);
//     }
//   }, []);

//   const fetchConfigurationTemplates = useCallback(async () => {
//     try {
//       const response = await api.get("/api/network_management/configuration-templates/");
//       dispatch({ type: "SET_CONFIGURATION_TEMPLATES", payload: response.data });
//     } catch (error) {
//       console.error("Error fetching configuration templates:", error);
//     }
//   }, []);

//   const runDiagnostics = useCallback(async (routerId) => {
//     dispatch({ type: "SET_LOADING", payload: true });
//     try {
//       const response = await api.get(`/api/network_management/routers/${routerId}/diagnostics/`);
//       dispatch({ 
//         type: "SET_DIAGNOSTICS_DATA", 
//         payload: { routerId, data: response.data } 
//       });
//       return response.data;
//     } catch (error) {
//       toast.error("Failed to run diagnostics");
//       console.error("Error running diagnostics:", error);
//       throw error;
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   }, []);

//   // Enhanced Router CRUD Operations

//   const addRouter = useCallback(async () => {
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
      
//       // Auto-test connection if requested
//       if (state.routerForm.auto_test_connection && response.data.connection_test) {
//         toast.info(`Connection test: ${response.data.connection_test.message}`);
//       }
      
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
      
//       // Show connection test results if performed
//       if (response.data.connection_test) {
//         toast.info(`Connection test: ${response.data.connection_test.message}`);
//       }
      
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

//   // Enhanced Configuration Functions

//   const configureHotspot = useCallback(async () => {
//     if (!state.activeRouter) {
//       toast.warn("No active router selected");
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
//       toast.success("PPPoE configured successfully");
//     } catch (error) {
//       toast.error("Failed to configure PPPoE");
//       console.error("Error configuring PPPoE:", error);
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   }, [state.pppoeForm, state.activeRouter]);

//   // Rest of the existing functions remain the same...
//   const updateRouterStatus = useCallback(async (routerId, newStatus) => {
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
//     // NEW ENHANCED FUNCTIONS
//     testRouterConnection,
//     fetchConnectionHistory,
//     executeScriptConfiguration,
//     fetchAvailableScripts,
//     configureVPN,
//     performBulkAction,
//     fetchBulkOperations,
//     fetchAuditLogs,
//     fetchConfigurationTemplates,
//     runDiagnostics,
//   };
// };








// src/Pages/NetworkManagement/hooks/useRouterManagement.js
import { useReducer, useCallback, useRef } from "react";
import { toast } from "react-hot-toast";
import api from "../../../../api";

// Enhanced Initial State with validation flags
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
    scriptConfiguration: false,
    diagnostics: false,
    connectionTest: false,
    vpnConfiguration: false,
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

// Enhanced Reducer with error handling
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
      return { ...state, activeRouter: action.payload };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
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

export const useRouterManagement = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const activeRouterRef = useRef(state.activeRouter);

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

  // Enhanced API Functions
  const fetchRouters = useCallback(async (options = {}) => {
    const { showToast = true, silent = false } = options;
    
    if (!silent) {
      dispatch({ type: "SET_LOADING", payload: true });
    }
    
    try {
      const response = await api.get("/api/network_management/routers/", {
        params: { 
          status: state.filter !== "all" ? state.filter : undefined,
          connection_status: state.filter !== "all" ? state.filter : undefined,
          configuration_status: state.filter !== "all" ? state.filter : undefined,
          search: state.searchTerm || undefined,
          type: state.filter !== "all" ? state.filter : undefined,
        }
      });
      
      const routers = Array.isArray(response.data) ? response.data : [];
      
      dispatch({ type: "SET_ROUTERS", payload: routers });
      dispatch({ type: "CLEAR_ERROR", payload: { field: 'fetchRouters' } });
      
      if (!state.activeRouter && routers.length > 0) {
        dispatch({ type: "SET_ACTIVE_ROUTER", payload: routers[0] });
      }
      
      if (showToast && routers.length === 0) {
        toast.success("No routers found. Add your first router to get started!");
      }
      
      return routers;
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || "Failed to fetch routers";
      
      dispatch({ 
        type: "SET_ERROR", 
        payload: { field: 'fetchRouters', message: errorMessage } 
      });
      
      if (showToast) {
        if (error.response?.status === 404) {
          toast.error("Routers endpoint not found. Please check backend configuration.");
        } else if (error.response?.status === 401) {
          toast.error("Authentication failed. Please log in again.");
        } else {
          toast.error(errorMessage);
        }
      }
      
      console.error("Error fetching routers:", error);
      dispatch({ type: "SET_ROUTERS", payload: [] });
      throw error;
    } finally {
      if (!silent) {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    }
  }, [state.filter, state.searchTerm, state.activeRouter]);

  const fetchHotspotUsers = useCallback(async (routerId, options = {}) => {
    if (!routerId) {
      toast.error("No router selected");
      return [];
    }
    
    const { showToast = true } = options;
    
    try {
      const response = await api.get(`/api/network_management/routers/${routerId}/hotspot-users/`);
      const users = Array.isArray(response.data) ? response.data : [];
      
      dispatch({ type: "SET_HOTSPOT_USERS", payload: users });
      
      if (showToast && users.length === 0) {
        toast("No hotspot users found", { icon: 'ℹ️' });
      }
      
      return users;
    } catch (error) {
      const errorMessage = error.response?.data?.error || `Failed to fetch hotspot users: ${error.message}`;
      
      if (showToast) {
        if (error.response?.status === 404) {
          toast.error("Hotspot users endpoint not found");
        } else {
          toast.error(errorMessage);
        }
      }
      
      console.error("Error fetching hotspot users:", error);
      dispatch({ type: "SET_HOTSPOT_USERS", payload: [] });
      throw error;
    }
  }, []);

  const fetchPPPoEUsers = useCallback(async (routerId, options = {}) => {
    if (!routerId) {
      toast.error("No router selected");
      return [];
    }
    
    const { showToast = true } = options;
    
    try {
      const response = await api.get(`/api/network_management/routers/${routerId}/pppoe-users/`);
      const users = Array.isArray(response.data) ? response.data : [];
      
      dispatch({ type: "SET_PPPOE_USERS", payload: users });
      
      if (showToast && users.length === 0) {
        toast("No PPPoE users found", { icon: 'ℹ️' });
      }
      
      return users;
    } catch (error) {
      const errorMessage = error.response?.data?.error || `Failed to fetch PPPoE users: ${error.message}`;
      
      if (showToast) {
        if (error.response?.status === 404) {
          toast.error("PPPoE users endpoint not found");
        } else {
          toast.error(errorMessage);
        }
      }
      
      console.error("Error fetching PPPoE users:", error);
      dispatch({ type: "SET_PPPOE_USERS", payload: [] });
      throw error;
    }
  }, []);

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
      
      const response = await api.get(endpoint);
      const history = Array.isArray(response.data) ? response.data : [];
      
      dispatch({ type: "SET_SESSION_HISTORY", payload: history });
      
      if (showToast && history.length === 0) {
        toast("No session history found", { icon: 'ℹ️' });
      }
      
      return history;
    } catch (error) {
      const errorMessage = error.response?.data?.error || `Failed to fetch session history: ${error.message}`;
      
      if (showToast && error.response?.status !== 404) {
        toast.error(errorMessage);
      }
      
      console.error("Error fetching session history:", error);
      dispatch({ type: "SET_SESSION_HISTORY", payload: [] });
      throw error;
    }
  }, []);

  const fetchCallbackConfigs = useCallback(async (routerId, options = {}) => {
    if (!routerId) {
      toast.error("No router selected");
      return [];
    }
    
    const { showToast = true } = options;
    
    try {
      const response = await api.get(`/api/network_management/routers/${routerId}/callback-configs/`);
      const configs = Array.isArray(response.data) ? response.data : [];
      
      dispatch({ type: "SET_CALLBACK_CONFIGS", payload: configs });
      
      if (showToast && configs.length === 0) {
        toast("No callback configurations found", { icon: 'ℹ️' });
      }
      
      return configs;
    } catch (error) {
      const errorMessage = error.response?.data?.error || `Failed to fetch callback configs: ${error.message}`;
      
      if (showToast && error.response?.status !== 404) {
        toast.error(errorMessage);
      }
      
      console.error("Error fetching callback configs:", error);
      dispatch({ type: "SET_CALLBACK_CONFIGS", payload: [] });
      throw error;
    }
  }, []);

  const fetchBulkOperations = useCallback(async (options = {}) => {
    const { showToast = true } = options;
    
    try {
      const response = await api.get("/api/network_management/bulk-operations/history/");
      const operations = Array.isArray(response.data) ? response.data : [];
      
      dispatch({ type: "SET_BULK_OPERATIONS", payload: operations });
      
      if (showToast && operations.length === 0) {
        toast("No bulk operations history found", { icon: 'ℹ️' });
      }
      
      return operations;
    } catch (error) {
      const errorMessage = error.response?.data?.error || `Failed to fetch bulk operations: ${error.message}`;
      
      if (showToast && error.response?.status !== 404) {
        toast.error(errorMessage);
      }
      
      console.error("Error fetching bulk operations:", error);
      dispatch({ type: "SET_BULK_OPERATIONS", payload: [] });
      throw error;
    }
  }, []);

  const fetchAuditLogs = useCallback(async (filters = {}, options = {}) => {
    const { showToast = true } = options;
    
    try {
      const response = await api.get("/api/network_management/audit-logs/", { params: filters });
      const logs = Array.isArray(response.data) ? response.data : [];
      
      dispatch({ type: "SET_AUDIT_LOGS", payload: logs });
      
      if (showToast && logs.length === 0) {
        toast("No audit logs found", { icon: 'ℹ️' });
      }
      
      return logs;
    } catch (error) {
      const errorMessage = error.response?.data?.error || `Failed to fetch audit logs: ${error.message}`;
      
      if (showToast && error.response?.status !== 404) {
        toast.error(errorMessage);
      }
      
      console.error("Error fetching audit logs:", error);
      dispatch({ type: "SET_AUDIT_LOGS", payload: [] });
      throw error;
    }
  }, []);

  const fetchConfigurationTemplates = useCallback(async (options = {}) => {
    const { showToast = true } = options;
    
    try {
      const response = await api.get("/api/network_management/configuration-templates/");
      const templates = Array.isArray(response.data) ? response.data : [];
      
      dispatch({ type: "SET_CONFIGURATION_TEMPLATES", payload: templates });
      
      if (showToast && templates.length === 0) {
        toast("No configuration templates found", { icon: 'ℹ️' });
      }
      
      return templates;
    } catch (error) {
      const errorMessage = error.response?.data?.error || `Failed to fetch configuration templates: ${error.message}`;
      
      if (showToast) {
        if (error.response?.status === 404) {
          toast.error("Configuration templates endpoint not found");
        } else {
          toast.error(errorMessage);
        }
      }
      
      console.error("Error fetching configuration templates:", error);
      dispatch({ type: "SET_CONFIGURATION_TEMPLATES", payload: [] });
      throw error;
    }
  }, []);

  // Enhanced Router CRUD Operations
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
    
    try {
      const response = await api.post("/api/network_management/routers/", state.routerForm);
      
      if (!response.data || !response.data.id) {
        throw new Error("Invalid response from server");
      }
      
      dispatch({ type: "SET_ROUTERS", payload: [...state.routers, response.data] });
      dispatch({ type: "SET_ACTIVE_ROUTER", payload: response.data });
      dispatch({ type: "TOGGLE_MODAL", modal: "addRouter" });
      dispatch({ type: "RESET_ROUTER_FORM" });
      dispatch({ type: "RESET_ERRORS" });
      
      if (state.routerForm.auto_test_connection && response.data.connection_test) {
        const testResult = response.data.connection_test;
        if (testResult.success) {
          toast.success(`Router added and connection test successful!`);
        } else {
          toast.success(`Router added but connection test failed: ${testResult.message}`);
        }
      } else {
        toast.success("Router added successfully!");
      }
      
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.response?.data?.detail || error.message || "Failed to add router";
      
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
        toast.error("Please fix the form errors");
      } else {
        toast.error(errorMessage);
      }
      
      console.error("Error adding router:", error);
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [state.routerForm, state.routers]);

  const updateRouter = useCallback(async (id) => {
    if (!id) {
      toast.error("No router selected for update");
      return;
    }

    dispatch({ type: "SET_LOADING", payload: true });
    
    try {
      const response = await api.put(`/api/network_management/routers/${id}/`, state.routerForm);
      
      if (!response.data || !response.data.id) {
        throw new Error("Invalid response from server");
      }
      
      dispatch({ type: "UPDATE_ROUTER", payload: { id, data: response.data } });
      dispatch({ type: "TOGGLE_MODAL", modal: "editRouter" });
      dispatch({ type: "RESET_ERRORS" });
      
      if (response.data.connection_test) {
        const testResult = response.data.connection_test;
        if (testResult.success) {
          toast.success("Router updated and connection test successful!");
        } else {
          toast.success(`Router updated but connection test failed: ${testResult.message}`);
        }
      } else {
        toast.success("Router updated successfully!");
      }
      
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.response?.data?.detail || error.message || "Failed to update router";
      
      if (error.response?.status === 404) {
        toast.error("Router not found. It may have been deleted.");
      } else {
        toast.error(errorMessage);
      }
      
      console.error("Error updating router:", error);
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [state.routerForm]);

  const deleteRouter = useCallback(async (id) => {
    if (!id) {
      toast.error("No router selected for deletion");
      return;
    }

    dispatch({ type: "SET_LOADING", payload: true });
    
    try {
      await api.delete(`/api/network_management/routers/${id}/`);
      
      dispatch({ type: "DELETE_ROUTER", id });
      toast.success("Router deleted successfully!");
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.response?.data?.detail || error.message || "Failed to delete router";
      
      if (error.response?.status === 404) {
        toast.error("Router not found. It may have already been deleted.");
      } else {
        toast.error(errorMessage);
      }
      
      console.error("Error deleting router:", error);
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  // Enhanced Configuration Functions
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
    
    try {
      const formData = new FormData();
      Object.entries(state.hotspotForm).forEach(([key, value]) => {
        if (key === "landing_page_file" && value) {
          formData.append("landing_page_file", value);
        } else if (value !== null && value !== undefined) {
          formData.append(key, value.toString());
        }
      });
      
      const response = await api.post(
        `/api/network_management/routers/${state.activeRouter.id}/hotspot-config/`, 
        formData, 
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      
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
      toast.success("Hotspot configured successfully!");
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.response?.data?.detail || error.message || "Failed to configure hotspot";
      toast.error(errorMessage);
      console.error("Error configuring hotspot:", error);
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [state.hotspotForm, state.activeRouter]);

  const configurePPPoE = useCallback(async () => {
    if (!state.activeRouter) {
      toast.error("No active router selected");
      return;
    }

    dispatch({ type: "SET_LOADING", payload: true });
    
    try {
      const response = await api.post(
        `/api/network_management/routers/${state.activeRouter.id}/pppoe-config/`, 
        state.pppoeForm
      );
      
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
      toast.success("PPPoE configured successfully!");
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.response?.data?.detail || error.message || "Failed to configure PPPoE";
      toast.error(errorMessage);
      console.error("Error configuring PPPoE:", error);
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [state.pppoeForm, state.activeRouter]);

  const updateRouterStatus = useCallback(async (routerId, newStatus) => {
    if (!routerId) {
      toast.error("No router selected");
      return;
    }

    dispatch({ type: "SET_LOADING", payload: true });
    try {
      await api.put(`/api/network_management/routers/${routerId}/`, {
        status: newStatus
      });

      dispatch({ type: "UPDATE_ROUTER", payload: { 
        id: routerId, 
        data: { status: newStatus } 
      }});
      
      toast.success(`Router ${newStatus === 'connected' ? 'activated' : 'deactivated'} successfully!`);
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.response?.data?.detail || error.message || "Failed to update router status";
      toast.error(errorMessage);
      console.error("Error updating router status:", error);
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  const restartRouter = useCallback(async (routerId) => {
    if (!routerId) {
      toast.error("No router selected");
      return;
    }

    dispatch({ type: "SET_LOADING", payload: true });
    try {
      await api.post(`/api/network_management/routers/${routerId}/reboot/`);
      dispatch({ type: "UPDATE_ROUTER", payload: { 
        id: routerId, 
        data: { status: "updating" } 
      }});
      toast.success("Router restart initiated");
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.response?.data?.detail || error.message || "Failed to restart router";
      toast.error(errorMessage);
      console.error("Error restarting router:", error);
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  const fetchRouterStats = useCallback(async (routerId, options = {}) => {
    if (!routerId) {
      toast.error("No router selected");
      return;
    }
    
    const { showToast = true } = options;
    
    dispatch({ type: "SET_STATS_LOADING", payload: true });
    try {
      const response = await api.get(`/api/network_management/routers/${routerId}/stats/`);
      const stats = response.data || {};
      
      dispatch({ 
        type: "SET_ROUTER_STATS", 
        payload: { routerId, stats } 
      });
      dispatch({ type: "TOGGLE_MODAL", modal: "routerStats" });
      
      return stats;
    } catch (error) {
      const errorMessage = error.response?.data?.error || `Failed to fetch router stats: ${error.message}`;
      
      if (showToast) {
        toast.error(errorMessage);
      }
      
      console.error("Error fetching router stats:", error);
      throw error;
    } finally {
      dispatch({ type: "SET_STATS_LOADING", payload: false });
    }
  }, []);

  const disconnectHotspotUser = useCallback(async (userId) => {
    if (!userId) {
      toast.error("No user selected");
      return;
    }

    dispatch({ type: "SET_LOADING", payload: true });
    try {
      await api.delete(`/api/network_management/hotspot-users/${userId}/`);
      dispatch({ type: "SET_HOTSPOT_USERS", payload: state.hotspotUsers.filter((u) => u.id !== userId) });
      toast.success("Hotspot user disconnected");
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.response?.data?.detail || error.message || "Failed to disconnect hotspot user";
      toast.error(errorMessage);
      console.error("Error disconnecting hotspot user:", error);
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [state.hotspotUsers]);

  const disconnectPPPoEUser = useCallback(async (userId) => {
    if (!userId) {
      toast.error("No user selected");
      return;
    }

    dispatch({ type: "SET_LOADING", payload: true });
    try {
      await api.delete(`/api/network_management/pppoe-users/${userId}/`);
      dispatch({ type: "SET_PPPOE_USERS", payload: state.pppoeUsers.filter((u) => u.id !== userId) });
      toast.success("PPPoE user disconnected");
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.response?.data?.detail || error.message || "Failed to disconnect PPPoE user";
      toast.error(errorMessage);
      console.error("Error disconnecting PPPoE user:", error);
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [state.pppoeUsers]);

  const addCallbackConfig = useCallback(async () => {
    if (!state.activeRouter) {
      toast.error("No active router selected");
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
      const errorMessage = error.response?.data?.error || error.response?.data?.detail || error.message || "Failed to add callback config";
      toast.error(errorMessage);
      console.error("Error adding callback config:", error);
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [state.callbackForm, state.callbackConfigs, state.activeRouter]);

  const deleteCallbackConfig = useCallback(async (id) => {
    if (!state.activeRouter) {
      toast.error("No active router selected");
      return;
    }
    
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      await api.delete(`/api/network_management/routers/${state.activeRouter.id}/callback-configs/${id}/`);
      dispatch({ type: "SET_CALLBACK_CONFIGS", payload: state.callbackConfigs.filter((cb) => cb.id !== id) });
      toast.success("Callback config deleted");
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.response?.data?.detail || error.message || "Failed to delete callback config";
      toast.error(errorMessage);
      console.error("Error deleting callback config:", error);
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [state.callbackConfigs, state.activeRouter]);

  const restoreSessions = useCallback(async (routerId) => {
    if (!routerId) {
      toast.error("No router selected");
      return;
    }

    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const response = await api.post(`/api/network_management/routers/${routerId}/restore-sessions/`);
      toast.success(response.data.message || "Sessions restored successfully");
      
      // Refresh user lists
      await fetchHotspotUsers(routerId, { showToast: false });
      await fetchPPPoEUsers(routerId, { showToast: false });
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.response?.data?.detail || error.message || "Failed to restore sessions";
      toast.error(errorMessage);
      console.error("Error restoring sessions:", error);
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [fetchHotspotUsers, fetchPPPoEUsers]);

  // Additional Enhanced Functions
  const testRouterConnection = useCallback(async (routerId = null, credentials = null) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      let response;
      if (routerId) {
        response = await api.post(`/api/network_management/routers/${routerId}/test-connection/`);
      } else if (credentials) {
        response = await api.post("/api/network_management/test-connection/", credentials);
      } else {
        throw new Error("Either routerId or credentials must be provided");
      }

      if (routerId) {
        dispatch({ 
          type: "UPDATE_ROUTER", 
          payload: { 
            id: routerId, 
            data: { 
              connection_status: response.data.test_results?.system_access ? 'connected' : 'disconnected',
              last_connection_test: new Date().toISOString()
            } 
          } 
        });
        
        dispatch({ 
          type: "SET_CONNECTION_TESTS", 
          payload: { routerId, tests: response.data } 
        });
      }

      const success = response.data.test_results?.system_access;
      toast.success(success ? "Connection test successful" : "Connection test failed");
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.response?.data?.detail || error.message || "Connection test failed";
      toast.error(errorMessage);
      console.error("Error testing connection:", error);
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  const fetchConnectionHistory = useCallback(async (routerId, days = 7, options = {}) => {
    if (!routerId) {
      toast.error("No router selected");
      return;
    }
    
    const { showToast = true } = options;
    
    try {
      const response = await api.get(`/api/network_management/routers/${routerId}/connection-history/`, {
        params: { days }
      });
      const history = response.data || {};
      
      dispatch({ 
        type: "SET_CONNECTION_HISTORY", 
        payload: { routerId, history } 
      });
      
      return history;
    } catch (error) {
      const errorMessage = error.response?.data?.error || `Failed to fetch connection history: ${error.message}`;
      
      if (showToast) {
        toast.error(errorMessage);
      }
      
      console.error("Error fetching connection history:", error);
      throw error;
    }
  }, []);

  // Utility function to refresh all data
  const refreshAllData = useCallback(async () => {
    const toastId = toast.loading("Refreshing data...");
    
    try {
      await Promise.all([
        fetchRouters({ showToast: false, silent: true }),
        state.activeRouter && fetchHotspotUsers(state.activeRouter.id, { showToast: false }),
        state.activeRouter && fetchPPPoEUsers(state.activeRouter.id, { showToast: false }),
        fetchBulkOperations({ showToast: false }),
        fetchAuditLogs({}, { showToast: false }),
      ]);
      
      toast.success("Data refreshed successfully!", { id: toastId });
    } catch (error) {
      toast.error("Failed to refresh some data", { id: toastId });
      console.error("Error refreshing data:", error);
    }
  }, [fetchRouters, fetchHotspotUsers, fetchPPPoEUsers, fetchBulkOperations, fetchAuditLogs, state.activeRouter]);

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
    testRouterConnection,
    fetchConnectionHistory,
    showConfirm,
    hideConfirm,
    handleConfirm,
    refreshAllData,
  };
};