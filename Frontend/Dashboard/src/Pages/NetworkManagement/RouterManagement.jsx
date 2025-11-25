








// // src/Pages/NetworkManagement/RouterManagement.jsx
// import React, { useReducer, useEffect, useCallback, useMemo, useRef, useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { 
//   Router, Users, RefreshCw, Plus, Search, Filter,
//   BarChart3, Activity, Wifi, Server, Network, Monitor,
//   Settings, Shield, Zap, Menu, X
// } from "lucide-react";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// // Custom Hooks
// import { useRouterManagement } from "./components/hooks/useRouterManagement"
// import { useUserManagement } from "./components/hooks/useUserManagement";
// import { useSessionRecovery } from "./components/hooks/useSessionRecovery";
// import { useHealthMonitoring } from "./components/hooks/useHealthMonitoring";

// // Components
// import CustomButton from "./components/Common/CustomButton"
// import CustomModal from "./components/Common/CustomModal";
// import StatsCard from "./components/Common/StatsCard";
// import ConfirmationModal from "./components/Common/ConfirmationModal";
// import RouterList from "./components/Layout/RouterList";
// import ActiveRouterPanel from "./components/Layout/ActiveRouterPanel";
// import AddRouterForm from "./components/RouterForms/AddRouterForm";
// import EditRouterForm from "./components/RouterForms/EditRouterForm";
// import UserActivationForm from "./components/UserManagement/UserActivationForm";
// import SessionRecovery from "./components/UserManagement/SessionRecovery";
// import HotspotConfig from "./components/Configuration/HotspotConfig";
// import PPPoEConfig from "./components/Configuration/PPPoEConfig";
// import CallbackConfig from "./components/Configuration/CallbackConfig";
// import RouterStats from "./components/Monitoring/RouterStats";
// import HealthDashboard from "./components/Monitoring/HealthDashboard";

// // New Components Added
// import BulkOperationsPanel from "./components/BulkOperations/BulkOperationsPanel";
// import AuditLogViewer from "./components/Audit/AuditLogViewer";
// import RealTimeDashboard from "./components/Monitoring/RealTimeDashboard";
// import PerformanceMetrics from "./components/Monitoring/PerformanceMetrics";
// import DiagnosticsPanel from "./components/Monitoring/DiagnosticsPanel";
// import ScriptConfigurationModal from "./components/Configuration/ScriptConfigurationModal";

// // Context and Theme
// import { useTheme } from "../../context/ThemeContext";
// import { getThemeClasses, EnhancedSelect } from "../../components/ServiceManagement/Shared/components"

// const RouterManagement = () => {
//   const { theme } = useTheme();
//   const themeClasses = getThemeClasses(theme);
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
//   // Custom Hooks for state management
//   const {
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
//     // Enhanced functions
//     testRouterConnection,
//     fetchConnectionHistory,
//     executeScriptConfiguration,
//     fetchAvailableScripts,
//     configureVPN,
//     performBulkAction,
//     fetchBulkOperations,
//     fetchAuditLogs,
//     fetchConfigurationTemplates,
//     runDiagnostics
//   } = useRouterManagement();

//   const {
//     activateUser,
//     bulkActivateUsers,
//     fetchAvailableClients,
//     fetchAvailablePlans,
//     getMACAddress,
//     fetchHotspotUsers: fetchUserHotspotUsers,
//     fetchPPPoEUsers: fetchUserPPPoEUsers
//   } = useUserManagement();

//   const {
//     recoverUserSession,
//     bulkRecoverSessions,
//     fetchRecoverableSessions,
//     restoreRouterSessions
//   } = useSessionRecovery();

//   const {
//     fetchHealthStats,
//     performBulkHealthCheck,
//     fetchSystemMetrics
//   } = useHealthMonitoring();

//   // Destructure state with all required variables
//   const {
//     routers = [],
//     activeRouter,
//     isLoading,
//     modals = {},
//     confirmModal,
//     routerForm,
//     touchedFields,
//     hotspotForm,
//     pppoeForm,
//     callbackForm,
//     scriptForm,
//     vpnForm,
//     hotspotUsers = [],
//     pppoeUsers = [],
//     sessionHistory = [],
//     healthStats = {},
//     expandedRouter,
//     selectedUser,
//     statsData,
//     searchTerm = "",
//     filter = "all",
//     statsLoading,
//     routerStats = {},
//     availableClients = [],
//     availablePlans = [],
//     recoverableSessions = [],
//     systemMetrics = {},
//     // New state variables added
//     bulkOperations = [],
//     auditLogs = [],
//     realTimeData = {
//       connectedRouters: 0,
//       activeSessions: 0,
//       systemHealth: 100,
//       recentAlerts: []
//     },
//     webSocketConnected = false,
//     // New state for monitoring views
//     monitoringView = "overview", // overview, realtime, performance, health
//     connectionHistory = {},
//     configurationTemplates = [],
//     availableScripts = [],
//     diagnosticsData = {},
//     callbackConfigs = []
//   } = state;

//   // Filter options for EnhancedSelect
//   const filterOptions = [
//     { value: "all", label: "All Routers" },
//     { value: "connected", label: "Connected" },
//     { value: "disconnected", label: "Disconnected" },
//     { value: "configured", label: "Configured" },
//     { value: "not_configured", label: "Not Configured" },
//     { value: "partially_configured", label: "Partially Configured" },
//     { value: "hotspot", label: "Hotspot" },
//     { value: "pppoe", label: "PPPoE" },
//     { value: "vpn", label: "VPN" }
//   ];

//   // Monitoring view options
//   const monitoringViewOptions = [
//     { value: "overview", label: "Overview", icon: <BarChart3 className="w-4 h-4" /> },
//     { value: "realtime", label: "Real-Time", icon: <Activity className="w-4 h-4" /> },
//     { value: "performance", label: "Performance", icon: <Monitor className="w-4 h-4" /> },
//     { value: "health", label: "Health", icon: <Server className="w-4 h-4" /> }
//   ];

//   // Theme-based styling using themeClasses
//   const containerClass = themeClasses.bg.primary;
//   const cardClass = `${themeClasses.bg.card} backdrop-blur-md border ${themeClasses.border.light} rounded-xl shadow-md`;
//   const textSecondaryClass = themeClasses.text.secondary;

//   // WebSocket connection for real-time updates
//   useEffect(() => {
//     const connectWebSocket = () => {
//       try {
//         console.log('🔌 Connecting to network WebSocket...');
//         const ws = new WebSocket(`ws://${window.location.host}/ws/routers/`);
        
//         ws.onopen = () => {
//           console.log('WebSocket connected');
//           dispatch({ type: 'SET_WEBSOCKET_CONNECTED', payload: true });
//         };
        
//         ws.onmessage = (event) => {
//           try {
//             const data = JSON.parse(event.data);
//             handleWebSocketMessage(data);
//           } catch (err) {
//             console.error('Error processing WebSocket message:', err);
//           }
//         };
        
//         ws.onclose = (event) => {
//           console.log('WebSocket disconnected:', event.code, event.reason);
//           dispatch({ type: 'SET_WEBSOCKET_CONNECTED', payload: false });
          
//           // Attempt reconnection after 5 seconds with exponential backoff
//           setTimeout(() => {
//             connectWebSocket();
//           }, 5000);
//         };
        
//         ws.onerror = (error) => {
//           console.error('WebSocket error:', error);
//           dispatch({ type: 'SET_WEBSOCKET_CONNECTED', payload: false });
//         };

//         return ws;
//       } catch (error) {
//         console.error('WebSocket connection failed:', error);
//         // Retry after 10 seconds if initial connection fails
//         setTimeout(() => {
//           connectWebSocket();
//         }, 10000);
//       }
//     };

//     const ws = connectWebSocket();
//     return () => {
//       if (ws && ws.readyState === WebSocket.OPEN) {
//         ws.close();
//       }
//     };
//   }, []);

//   const handleWebSocketMessage = (data) => {
//     switch (data.type) {
//       case 'router_update':
//         // Update specific router
//         dispatch({ 
//           type: 'UPDATE_ROUTER', 
//           payload: { id: data.router_id, data: data.data } 
//         });
//         break;
//       case 'health_update':
//         // Update health stats
//         dispatch({ 
//           type: 'UPDATE_HEALTH_STATS', 
//           payload: { routerId: data.router_id, stats: data.health_info } 
//         });
//         break;
//       case 'bulk_operation_update':
//         // Update bulk operation progress
//         dispatch({ 
//           type: 'UPDATE_BULK_OPERATION', 
//           payload: data 
//         });
//         break;
//       case 'real_time_update':
//         // Update real-time dashboard data
//         dispatch({ 
//           type: 'UPDATE_REAL_TIME_DATA', 
//           payload: data.data 
//         });
//         break;
//       case 'user_activity':
//         // Update user activity
//         if (data.router_id === activeRouter?.id) {
//           fetchHotspotUsers(activeRouter.id);
//           fetchPPPoEUsers(activeRouter.id);
//         }
//         break;
//       default:
//         console.log('Unknown WebSocket message:', data);
//     }
//   };

//   // Initial data loading
//   useEffect(() => {
//     fetchRouters();
//     fetchHealthStats();
//     fetchAvailableClients();
//     fetchAvailablePlans();
//     fetchBulkOperations();
//     fetchAuditLogs();
//     fetchConfigurationTemplates();
    
//     const interval = setInterval(() => {
//       fetchRouters();
//       fetchHealthStats();
//     }, 30000);
    
//     return () => clearInterval(interval);
//   }, [fetchRouters, fetchHealthStats, fetchAvailableClients, fetchAvailablePlans, fetchBulkOperations, fetchAuditLogs, fetchConfigurationTemplates]);

//   // Active router data refresh
//   useEffect(() => {
//     if (activeRouter?.id) {
//       fetchHotspotUsers(activeRouter.id);
//       fetchPPPoEUsers(activeRouter.id);
//       fetchCallbackConfigs(activeRouter.id);
//       fetchSystemMetrics(activeRouter.id);
//       fetchRouterStats(activeRouter.id);
//       fetchAvailableScripts(activeRouter.id);
      
//       const interval = setInterval(() => {
//         if (activeRouter?.id) {
//           fetchHotspotUsers(activeRouter.id);
//           fetchPPPoEUsers(activeRouter.id);
//           fetchCallbackConfigs(activeRouter.id);
//           fetchSystemMetrics(activeRouter.id);
//           fetchRouterStats(activeRouter.id);
//         }
//       }, 15000);
      
//       return () => clearInterval(interval);
//     }
//   }, [activeRouter, fetchHotspotUsers, fetchPPPoEUsers, fetchCallbackConfigs, fetchSystemMetrics, fetchRouterStats, fetchAvailableScripts]);

//   // Enhanced handlers for new functionality
//   const handleTestConnection = useCallback(async (routerId) => {
//     try {
//       await testRouterConnection(routerId);
//     } catch (error) {
//       console.error('Connection test failed:', error);
//     }
//   }, [testRouterConnection]);

//   const handleRunDiagnostics = useCallback(async (routerId) => {
//     try {
//       await runDiagnostics(routerId);
//     } catch (error) {
//       console.error('Diagnostics failed:', error);
//     }
//   }, [runDiagnostics]);

//   const handleConfigureScript = useCallback(async (router) => {
//     dispatch({ type: "SET_ACTIVE_ROUTER", payload: router });
//     dispatch({ type: "TOGGLE_MODAL", modal: "scriptConfiguration" });
//   }, []);

//   const handleConfigureVPN = useCallback(async (router) => {
//     dispatch({ type: "SET_ACTIVE_ROUTER", payload: router });
//     dispatch({ type: "TOGGLE_MODAL", modal: "vpnConfiguration" });
//   }, []);

//   const handleExecuteScript = useCallback(async (routerId, scriptData) => {
//     try {
//       await executeScriptConfiguration(routerId, scriptData);
//       dispatch({ type: "TOGGLE_MODAL", modal: "scriptConfiguration" });
//     } catch (error) {
//       console.error('Script execution failed:', error);
//     }
//   }, [executeScriptConfiguration]);

//   const handleConfigureVPNSubmit = useCallback(async (routerId, vpnData) => {
//     try {
//       await configureVPN(routerId, vpnData);
//       dispatch({ type: "TOGGLE_MODAL", modal: "vpnConfiguration" });
//     } catch (error) {
//       console.error('VPN configuration failed:', error);
//     }
//   }, [configureVPN]);

//   // Calculate statistics for real-time dashboard
//   const statistics = useMemo(() => {
//     const totalRouters = routers?.length || 0;
//     const activeRouters = routers?.filter(r => r.connection_status === "connected")?.length || 0;
//     const totalClients = routers?.reduce((acc, router) => 
//       acc + (router.connected_clients_count || 0), 0
//     ) || 0;
//     const avgUsage = totalRouters > 0 
//       ? Math.round(routers.reduce((acc, router) => {
//           const stats = routerStats[router.id];
//           return acc + (stats?.cpu || 0);
//         }, 0) / totalRouters)
//       : 0;

//     return { totalRouters, activeRouters, totalClients, avgUsage };
//   }, [routers, routerStats]);

//   // Render monitoring content based on selected view
//   const renderMonitoringContent = () => {
//     switch (monitoringView) {
//       case "realtime":
//         return (
//           <RealTimeDashboard
//             theme={theme}
//             routers={routers}
//           />
//         );
//       case "performance":
//         return (
//           <PerformanceMetrics
//             activeRouter={activeRouter}
//             theme={theme}
//           />
//         );
//       case "health":
//         return (
//           <HealthDashboard
//             healthStats={healthStats}
//             systemMetrics={systemMetrics}
//             activeRouter={activeRouter}
//             theme={theme}
//           />
//         );
//       case "overview":
//       default:
//         return (
//           <>
//             {/* Statistics Overview - Improved responsive grid */}
//             <motion.section
//               className="mb-6 transition-colors duration-300"
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.3, delay: 0.15 }}
//             >
//               <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
//                 <StatsCard 
//                   title="Total Routers" 
//                   value={statistics.totalRouters} 
//                   icon={<Router className="w-4 h-4 sm:w-5 sm:h-5" />} 
//                   theme={theme} 
//                   color="blue" 
//                 />
//                 <StatsCard 
//                   title="Active Routers" 
//                   value={statistics.activeRouters} 
//                   icon={<Network className="w-4 h-4 sm:w-5 sm:h-5" />} 
//                   theme={theme} 
//                   color="green" 
//                 />
//                 <StatsCard 
//                   title="Total Clients" 
//                   value={statistics.totalClients}
//                   icon={<Users className="w-4 h-4 sm:w-5 sm:h-5" />} 
//                   theme={theme} 
//                   color="purple" 
//                 />
//                 <StatsCard 
//                   title="Avg. CPU Usage" 
//                   value={statistics.avgUsage}
//                   unit="%"
//                   icon={<Activity className="w-4 h-4 sm:w-5 sm:h-5" />} 
//                   theme={theme} 
//                   color="orange" 
//                 />
//               </div>
//             </motion.section>

//             {/* Router List */}
//             <RouterList
//               routers={routers}
//               isLoading={isLoading}
//               expandedRouter={expandedRouter}
//               routerStats={routerStats}
//               theme={theme}
//               onToggleExpand={(routerId) => dispatch({ type: "TOGGLE_ROUTER_EXPANDED", id: routerId })}
//               onViewStats={fetchRouterStats}
//               onRestart={restartRouter}
//               onStatusChange={updateRouterStatus}
//               onEdit={(router) => {
//                 dispatch({ type: "UPDATE_ROUTER_FORM", payload: router });
//                 dispatch({ type: "TOGGLE_MODAL", modal: "editRouter" });
//               }}
//               onDelete={(router) => showConfirm(
//                 "Delete Router",
//                 `Are you sure you want to delete router "${router.name}"? This action cannot be undone.`,
//                 () => deleteRouter(router.id)
//               )}
//               onAddRouter={() => {
//                 dispatch({ type: "RESET_ROUTER_FORM" });
//                 dispatch({ type: "TOGGLE_MODAL", modal: "addRouter" });
//               }}
//               onTestConnection={handleTestConnection}
//               onRunDiagnostics={handleRunDiagnostics}
//               onConfigureScript={handleConfigureScript}
//               onConfigureVPN={handleConfigureVPN}
//               searchTerm={searchTerm}
//               filter={filter}
//               dispatch={dispatch}
//             />

//             {/* Bulk Operations Panel */}
//             <BulkOperationsPanel
//               theme={theme}
//               routers={routers}
//               onOperationComplete={(operationId, result) => {
//                 console.log('Bulk operation completed:', operationId, result);
//                 fetchRouters(); // Refresh router list
//               }}
//             />

//             {/* Audit Log Viewer */}
//             <AuditLogViewer 
//               theme={theme} 
//               routerId={activeRouter?.id}
//             />
//           </>
//         );
//     }
//   };

//   // Mobile sidebar toggle
//   const toggleSidebar = () => {
//     setIsSidebarOpen(!isSidebarOpen);
//   };

//   return (
//     <div className={`${containerClass} p-3 sm:p-4 md:p-6 lg:p-8 transition-colors duration-300 min-h-screen`}>
//       <ToastContainer 
//         position="top-right" 
//         autoClose={5000} 
//         theme={theme} 
//         pauseOnHover 
//         newestOnTop 
//       />

//       {/* Mobile Header with Menu Button */}
//       <div className="lg:hidden mb-4">
//         <div className={`${cardClass} p-4 transition-colors duration-300`}>
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-3">
//               <button
//                 onClick={toggleSidebar}
//                 className={`p-2 rounded-lg ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"}`}
//               >
//                 <Menu className="w-5 h-5" />
//               </button>
//               <div>
//                 <h1 className={`text-xl font-bold ${themeClasses.text.primary}`}>Router Management</h1>
//                 <p className={`text-xs ${textSecondaryClass}`}>
//                   {statistics.totalRouters} routers • {statistics.activeRouters} active
//                 </p>
//               </div>
//             </div>
//             <CustomButton
//               onClick={fetchRouters}
//               icon={<RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />}
//               label=""
//               variant="secondary"
//               size="sm"
//               disabled={isLoading}
//               theme={theme}
//             />
//           </div>
//         </div>
//       </div>

//       {/* Header Section - Improved responsive layout */}
//       <motion.header 
//         className={`${cardClass} p-4 sm:p-6 mb-4 sm:mb-6 transition-colors duration-300 hidden lg:block`}
//         initial={{ opacity: 0, y: -20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.3 }}
//       >
//         <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
//           <div className="flex items-center space-x-3 sm:space-x-4">
//             <div className={`p-2 sm:p-3 rounded-xl ${
//               theme === "dark" ? "bg-blue-600/20" : "bg-blue-100"
//             }`}>
//               <Router className={`w-6 h-6 sm:w-8 sm:h-8 ${
//                 theme === "dark" ? "text-blue-400" : "text-blue-600"
//               }`} />
//             </div>
//             <div>
//               <h1 className={`text-xl sm:text-2xl font-bold ${themeClasses.text.primary}`}>Router Management</h1>
//               <p className={`text-xs sm:text-sm ${textSecondaryClass}`}>
//                 {statistics.totalRouters} routers • {statistics.activeRouters} active •{" "}
//                 {statistics.totalClients} total clients
//               </p>
//             </div>
//           </div>
          
//           <div className="flex flex-wrap gap-2 sm:gap-3 w-full xl:w-auto">
//             <CustomButton
//               onClick={() => dispatch({ type: "TOGGLE_MODAL", modal: "userActivation" })}
//               icon={<Users className="w-4 h-4" />}
//               label="Activate User"
//               variant="primary"
//               size="sm"
//               theme={theme}
//               className="flex-1 xl:flex-none min-w-[120px]"
//             />
//             <CustomButton
//               onClick={() => dispatch({ type: "TOGGLE_MODAL", modal: "sessionRecovery" })}
//               icon={<RefreshCw className="w-4 h-4" />}
//               label="Recover"
//               variant="success"
//               size="sm"
//               theme={theme}
//               className="flex-1 xl:flex-none min-w-[100px]"
//             />
//             <CustomButton
//               onClick={() => {
//                 dispatch({ type: "RESET_ROUTER_FORM" });
//                 dispatch({ type: "TOGGLE_MODAL", modal: "addRouter" });
//               }}
//               icon={<Plus className="w-4 h-4" />}
//               label="Add Router"
//               variant="primary"
//               size="sm"
//               theme={theme}
//               className="flex-1 xl:flex-none min-w-[120px]"
//             />
//             <CustomButton
//               onClick={fetchRouters}
//               icon={<RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />}
//               label="Refresh"
//               variant="secondary"
//               size="sm"
//               disabled={isLoading}
//               theme={theme}
//               className="flex-1 xl:flex-none min-w-[100px]"
//             />
//           </div>
//         </div>
//       </motion.header>

//       {/* Search and Filter Section - Improved responsive layout */}
//       <motion.section 
//         className="mb-4 sm:mb-6 transition-colors duration-300"
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.3, delay: 0.1 }}
//       >
//         <div className={`p-3 sm:p-4 ${cardClass}`}>
//           <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 items-start lg:items-end">
//             {/* Search Input */}
//             <div className="flex-1 w-full">
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <Search className={`h-4 w-4 sm:h-5 sm:w-5 ${textSecondaryClass}`} />
//                 </div>
//                 <input
//                   type="text"
//                   className={`w-full pl-10 pr-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg border transition-colors duration-300 ${themeClasses.input}`}
//                   placeholder="Search routers..."
//                   value={searchTerm}
//                   onChange={(e) => dispatch({ type: "SET_SEARCH_TERM", payload: e.target.value })}
//                 />
//               </div>
//             </div>

//             {/* Filter Controls */}
//             <div className="flex gap-2 sm:gap-3 w-full lg:w-auto">
//               <EnhancedSelect
//                 value={filter}
//                 onChange={(value) => dispatch({ type: "SET_FILTER", payload: value })}
//                 options={filterOptions}
//                 placeholder="Filter"
//                 className="w-full lg:w-48"
//                 theme={theme}
//               />
              
//               <CustomButton
//                 onClick={() => performBulkHealthCheck(routers.map(r => r.id))}
//                 icon={<Activity className="w-4 h-4" />}
//                 label="Health"
//                 variant="secondary"
//                 size="sm"
//                 theme={theme}
//                 className="whitespace-nowrap"
//               />
//             </div>
//           </div>

//           {/* Monitoring View Toggle - Improved for mobile */}
//           <div className="mt-3 sm:mt-4 flex flex-wrap gap-1 sm:gap-2">
//             {monitoringViewOptions.map((option) => (
//               <CustomButton
//                 key={option.value}
//                 onClick={() => dispatch({ type: "SET_MONITORING_VIEW", payload: option.value })}
//                 icon={option.icon}
//                 label={option.label}
//                 variant={monitoringView === option.value ? "primary" : "secondary"}
//                 size="sm"
//                 theme={theme}
//                 className="flex-1 sm:flex-none min-w-0 text-xs sm:text-sm"
//               />
//             ))}
//           </div>
//         </div>
//       </motion.section>

//       {/* IMPROVED: Main Content Grid with Dynamic Layout */}
//       <div className="relative">
//         {/* Mobile Sidebar Overlay */}
//         {isSidebarOpen && (
//           <div 
//             className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
//             onClick={toggleSidebar}
//           />
//         )}

//         <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
//           {/* Main Content - Responsive columns */}
//           <div className={`lg:col-span-3 space-y-4 sm:space-y-6 ${
//             isSidebarOpen ? 'lg:col-span-4' : 'lg:col-span-3'
//           }`}>
//             {renderMonitoringContent()}
//           </div>

//           {/* Sidebar - Improved responsive behavior */}
//           <div className={`space-y-4 sm:space-y-6 ${
//             isSidebarOpen 
//               ? 'fixed right-0 top-0 h-full w-80 sm:w-96 bg-white dark:bg-gray-800 z-50 p-4 overflow-y-auto shadow-2xl lg:static lg:w-auto lg:shadow-none lg:z-0 lg:col-span-1' 
//               : 'hidden lg:block lg:col-span-1'
//           }`}>
//             {/* Close button for mobile sidebar */}
//             {isSidebarOpen && (
//               <div className="flex justify-between items-center mb-4 lg:hidden">
//                 <h3 className={`font-semibold ${themeClasses.text.primary}`}>Quick Actions</h3>
//                 <button
//                   onClick={toggleSidebar}
//                   className={`p-2 rounded-lg ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"}`}
//                 >
//                   <X className="w-5 h-5" />
//                 </button>
//               </div>
//             )}

//             {/* Active Router Panel */}
//             {activeRouter && (
//               <ActiveRouterPanel
//                 activeRouter={activeRouter}
//                 hotspotUsers={hotspotUsers}
//                 pppoeUsers={pppoeUsers}
//                 routerStats={routerStats}
//                 theme={theme}
//                 onConfigureHotspot={() => dispatch({ type: "TOGGLE_MODAL", modal: "hotspotConfig" })}
//                 onConfigurePPPoE={() => dispatch({ type: "TOGGLE_MODAL", modal: "pppoeConfig" })}
//                 onManageUsers={() => dispatch({ type: "TOGGLE_MODAL", modal: "users" })}
//                 onCallbackSettings={() => dispatch({ type: "TOGGLE_MODAL", modal: "callbackConfig" })}
//                 onRestoreSessions={() => restoreSessions(activeRouter.id)}
//                 onRunDiagnostics={() => handleRunDiagnostics(activeRouter.id)}
//                 onConfigureScript={() => handleConfigureScript(activeRouter)}
//                 onConfigureVPN={() => handleConfigureVPN(activeRouter)}
//                 onViewDetailedStats={() => fetchRouterStats(activeRouter.id)}
//               />
//             )}

//             {/* Show Health Dashboard only in overview mode */}
//             {monitoringView === "overview" && (
//               <HealthDashboard
//                 healthStats={healthStats}
//                 systemMetrics={systemMetrics}
//                 activeRouter={activeRouter}
//                 theme={theme}
//               />
//             )}

//             {/* Show Performance Metrics in sidebar when in realtime view */}
//             {monitoringView === "realtime" && activeRouter && (
//               <PerformanceMetrics
//                 activeRouter={activeRouter}
//                 theme={theme}
//               />
//             )}

//             {/* Diagnostics Panel */}
//             {activeRouter && monitoringView === "health" && (
//               <DiagnosticsPanel
//                 router={activeRouter}
//                 theme={theme}
//                 diagnosticsData={diagnosticsData}
//                 onRunDiagnostics={handleRunDiagnostics}
//                 isLoading={isLoading}
//               />
//             )}

//             {/* Show Real-time Status Indicator */}
//             <div className={`p-3 sm:p-4 rounded-lg border text-sm ${
//               webSocketConnected 
//                 ? 'bg-green-100 border-green-200 dark:bg-green-900/20 dark:border-green-800'
//                 : 'bg-yellow-100 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'
//             }`}>
//               <div className="flex items-center space-x-2">
//                 <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${
//                   webSocketConnected ? 'bg-green-500' : 'bg-yellow-500'
//                 }`}></div>
//                 <span className="font-medium">
//                   {webSocketConnected ? 'Real-time Connected' : 'Connecting...'}
//                 </span>
//               </div>
//               <p className="text-xs text-gray-500 mt-1">
//                 {webSocketConnected 
//                   ? 'Live updates active' 
//                   : 'Real-time features temporarily unavailable'
//                 }
//               </p>
//             </div>

//             {/* Quick Stats Summary */}
//             <div className={`p-3 sm:p-4 rounded-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//               <h4 className={`font-medium mb-2 sm:mb-3 text-sm sm:text-base ${themeClasses.text.primary}`}>Quick Stats</h4>
//               <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
//                 <div className="flex justify-between">
//                   <span className={themeClasses.text.tertiary}>Connected:</span>
//                   <span className={themeClasses.text.primary}>{statistics.activeRouters}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className={themeClasses.text.tertiary}>Sessions:</span>
//                   <span className={themeClasses.text.primary}>{statistics.totalClients}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className={themeClasses.text.tertiary}>Health:</span>
//                   <span className={`${
//                     realTimeData.systemHealth >= 80 ? 'text-green-500' :
//                     realTimeData.systemHealth >= 60 ? 'text-yellow-500' : 'text-red-500'
//                   }`}>
//                     {realTimeData.systemHealth}%
//                   </span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* All Modals */}
//       <ConfirmationModal
//         isOpen={confirmModal?.show || false}
//         title={confirmModal?.title || ""}
//         message={confirmModal?.message || ""}
//         onConfirm={handleConfirm}
//         onCancel={hideConfirm}
//         theme={theme}
//       />

//       {/* Router Management Modals */}
//       <AddRouterForm
//         isOpen={modals?.addRouter || false}
//         onClose={() => {
//           dispatch({ type: "TOGGLE_MODAL", modal: "addRouter" });
//           dispatch({ type: "RESET_ROUTER_FORM" });
//         }}
//         routerForm={routerForm}
//         touchedFields={touchedFields}
//         isLoading={isLoading}
//         theme={theme}
//         onFormUpdate={(updates) => dispatch({ type: "UPDATE_ROUTER_FORM", payload: updates })}
//         onFieldBlur={(field) => dispatch({ type: "SET_TOUCHED_FIELD", field })}
//         onSubmit={addRouter}
//         dispatch={dispatch}
//       />

//       <EditRouterForm
//         isOpen={modals?.editRouter || false}
//         onClose={() => {
//           dispatch({ type: "TOGGLE_MODAL", modal: "editRouter" });
//           dispatch({ type: "RESET_ROUTER_FORM" });
//         }}
//         routerForm={routerForm}
//         touchedFields={touchedFields}
//         isLoading={isLoading}
//         theme={theme}
//         onFormUpdate={(updates) => dispatch({ type: "UPDATE_ROUTER_FORM", payload: updates })}
//         onFieldBlur={(field) => dispatch({ type: "SET_TOUCHED_FIELD", field })}
//         onSubmit={() => updateRouter(activeRouter?.id)}
//         activeRouter={activeRouter}
//         onTestConnection={handleTestConnection}
//       />

//       {/* User Management Modals */}
//       <UserActivationForm
//         isOpen={modals?.userActivation || false}
//         onClose={() => dispatch({ type: "TOGGLE_MODAL", modal: "userActivation" })}
//         availableClients={availableClients}
//         availablePlans={availablePlans}
//         availableRouters={routers}
//         activeRouter={activeRouter}
//         theme={theme}
//         onActivateUser={activateUser}
//         onTestRouterConnection={handleTestConnection}
//         onAutoConfigureRouter={handleConfigureScript}
//         isLoading={isLoading}
//       />

//       <SessionRecovery
//         isOpen={modals?.sessionRecovery || false}
//         onClose={() => dispatch({ type: "TOGGLE_MODAL", modal: "sessionRecovery" })}
//         recoverableSessions={recoverableSessions}
//         availableRouters={routers}
//         theme={theme}
//         onRecoverSession={recoverUserSession}
//         onBulkRecover={bulkRecoverSessions}
//         onTestRouterConnection={handleTestConnection}
//         isLoading={isLoading}
//       />

//       {/* Configuration Modals */}
//       <HotspotConfig
//         isOpen={modals?.hotspotConfig || false}
//         onClose={() => dispatch({ type: "TOGGLE_MODAL", modal: "hotspotConfig" })}
//         hotspotForm={hotspotForm}
//         activeRouter={activeRouter}
//         theme={theme}
//         onFormUpdate={(updates) => dispatch({ type: "UPDATE_HOTSPOT_FORM", payload: updates })}
//         onSubmit={configureHotspot}
//         isLoading={isLoading}
//       />

//       <PPPoEConfig
//         isOpen={modals?.pppoeConfig || false}
//         onClose={() => dispatch({ type: "TOGGLE_MODAL", modal: "pppoeConfig" })}
//         pppoeForm={pppoeForm}
//         activeRouter={activeRouter}
//         theme={theme}
//         onFormUpdate={(updates) => dispatch({ type: "UPDATE_PPPOE_FORM", payload: updates })}
//         onSubmit={configurePPPoE}
//         isLoading={isLoading}
//       />

//       <CallbackConfig
//         isOpen={modals?.callbackConfig || false}
//         onClose={() => {
//           dispatch({ type: "TOGGLE_MODAL", modal: "callbackConfig" });
//           dispatch({ type: "RESET_CALLBACK_FORM" });
//         }}
//         callbackForm={callbackForm}
//         callbackConfigs={callbackConfigs}
//         activeRouter={activeRouter}
//         theme={theme}
//         onFormUpdate={(updates) => dispatch({ type: "UPDATE_CALLBACK_FORM", payload: updates })}
//         onAddCallback={addCallbackConfig}
//         onDeleteCallback={deleteCallbackConfig}
//         isLoading={isLoading}
//       />

//       {/* Enhanced Configuration Modals */}
//       <ScriptConfigurationModal
//         isOpen={modals?.scriptConfiguration || false}
//         onClose={() => {
//           dispatch({ type: "TOGGLE_MODAL", modal: "scriptConfiguration" });
//           dispatch({ type: "RESET_SCRIPT_FORM" });
//         }}
//         router={activeRouter}
//         theme={theme}
//         scriptForm={scriptForm}
//         onFormUpdate={(updates) => dispatch({ type: "UPDATE_SCRIPT_FORM", payload: updates })}
//         onExecuteScript={handleExecuteScript}
//         isLoading={isLoading}
//         availableScripts={availableScripts}
//       />

//       {/* VPN Configuration Modal */}
//       <CustomModal
//         isOpen={modals?.vpnConfiguration || false}
//         title="VPN Configuration"
//         onClose={() => {
//           dispatch({ type: "TOGGLE_MODAL", modal: "vpnConfiguration" });
//           dispatch({ type: "RESET_VPN_FORM" });
//         }}
//         size="lg"
//         theme={theme}
//       >
//         <div className="p-6">
//           <div className="text-center py-8">
//             <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
//             <h3 className="text-lg font-semibold mb-2">VPN Configuration</h3>
//             <p className="text-gray-600 dark:text-gray-400">
//               VPN configuration feature coming soon. This will allow you to configure OpenVPN, WireGuard, and other VPN protocols.
//             </p>
//             <div className="mt-6">
//               <CustomButton
//                 onClick={() => {
//                   dispatch({ type: "TOGGLE_MODAL", modal: "vpnConfiguration" });
//                   dispatch({ type: "RESET_VPN_FORM" });
//                 }}
//                 label="Close"
//                 variant="primary"
//                 theme={theme}
//               />
//             </div>
//           </div>
//         </div>
//       </CustomModal>

//       {/* Monitoring Modals */}
//       <RouterStats
//         isOpen={modals?.routerStats || false}
//         onClose={() => dispatch({ type: "TOGGLE_MODAL", modal: "routerStats" })}
//         routerStats={routerStats}
//         statsLoading={statsLoading}
//         theme={theme}
//         router={activeRouter}
//       />
//     </div>
//   );
// };

// export default RouterManagement;








// src/Pages/NetworkManagement/RouterManagement.jsx
import React, { useReducer, useEffect, useCallback, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Router, Users, RefreshCw, Plus, Search, Filter,
  BarChart3, Activity, Wifi, Server, Network, Monitor,
  Settings, Shield, Zap, Menu, X
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Custom Hooks
import { useRouterManagement } from "./components/hooks/useRouterManagement"
import { useUserManagement } from "./components/hooks/useUserManagement";
import { useSessionRecovery } from "./components/hooks/useSessionRecovery";
import { useHealthMonitoring } from "./components/hooks/useHealthMonitoring";

// Components
import CustomButton from "./components/Common/CustomButton"
import CustomModal from "./components/Common/CustomModal";
import StatsCard from "./components/Common/StatsCard";
import ConfirmationModal from "./components/Common/ConfirmationModal";
import RouterList from "./components/Layout/RouterList";
import ActiveRouterPanel from "./components/Layout/ActiveRouterPanel";
import AddRouterForm from "./components/RouterForms/AddRouterForm";
import EditRouterForm from "./components/RouterForms/EditRouterForm";
import UserActivationForm from "./components/UserManagement/UserActivationForm";
import SessionRecovery from "./components/UserManagement/SessionRecovery";
import HotspotConfig from "./components/Configuration/HotspotConfig";
import PPPoEConfig from "./components/Configuration/PPPoEConfig";
import CallbackConfig from "./components/Configuration/CallbackConfig";
import RouterStats from "./components/Monitoring/RouterStats";
import HealthDashboard from "./components/Monitoring/HealthDashboard";

// New Components Added
import BulkOperationsPanel from "./components/BulkOperations/BulkOperationsPanel";
import AuditLogViewer from "./components/Audit/AuditLogViewer";
import RealTimeDashboard from "./components/Monitoring/RealTimeDashboard";
import PerformanceMetrics from "./components/Monitoring/PerformanceMetrics";
import DiagnosticsPanel from "./components/Monitoring/DiagnosticsPanel";
import ScriptConfigurationModal from "./components/Configuration/ScriptConfigurationModal";

// Context and Theme
import { useTheme } from "../../context/ThemeContext";
import { getThemeClasses, EnhancedSelect } from "../../components/ServiceManagement/Shared/components"

const RouterManagement = () => {
  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Custom Hooks for state management
  const {
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
    // Enhanced functions
    testRouterConnection,
    fetchConnectionHistory,
    executeScriptConfiguration,
    fetchAvailableScripts,
    configureVPN,
    performBulkAction,
    fetchBulkOperations,
    fetchAuditLogs,
    fetchConfigurationTemplates,
    runDiagnostics
  } = useRouterManagement();

  const {
    activateUser,
    bulkActivateUsers,
    fetchAvailableClients,
    fetchAvailablePlans,
    getMACAddress,
    fetchHotspotUsers: fetchUserHotspotUsers,
    fetchPPPoEUsers: fetchUserPPPoEUsers
  } = useUserManagement();

  const {
    recoverUserSession,
    bulkRecoverSessions,
    fetchRecoverableSessions,
    restoreRouterSessions
  } = useSessionRecovery();

  const {
    fetchHealthStats,
    performBulkHealthCheck,
    fetchSystemMetrics
  } = useHealthMonitoring();

  // Destructure state with all required variables
  const {
    routers = [],
    activeRouter,
    isLoading,
    modals = {},
    confirmModal,
    routerForm,
    touchedFields,
    hotspotForm,
    pppoeForm,
    callbackForm,
    scriptForm,
    vpnForm,
    hotspotUsers = [],
    pppoeUsers = [],
    sessionHistory = [],
    healthStats = {},
    expandedRouter,
    selectedUser,
    statsData,
    searchTerm = "",
    filter = "all",
    statsLoading,
    routerStats = {},
    availableClients = [],
    availablePlans = [],
    recoverableSessions = [],
    systemMetrics = {},
    // New state variables added
    bulkOperations = [],
    auditLogs = [],
    realTimeData = {
      connectedRouters: 0,
      activeSessions: 0,
      systemHealth: 100,
      recentAlerts: []
    },
    webSocketConnected = false,
    // New state for monitoring views
    monitoringView = "overview", // overview, realtime, performance, health
    connectionHistory = {},
    configurationTemplates = [],
    availableScripts = [],
    diagnosticsData = {},
    callbackConfigs = []
  } = state;

  // Filter options for EnhancedSelect
  const filterOptions = [
    { value: "all", label: "All Routers" },
    { value: "connected", label: "Connected" },
    { value: "disconnected", label: "Disconnected" },
    { value: "configured", label: "Configured" },
    { value: "not_configured", label: "Not Configured" },
    { value: "partially_configured", label: "Partially Configured" },
    { value: "hotspot", label: "Hotspot" },
    { value: "pppoe", label: "PPPoE" },
    { value: "vpn", label: "VPN" }
  ];

  // Monitoring view options
  const monitoringViewOptions = [
    { 
      value: "overview", 
      label: "Overview", 
      icon: <BarChart3 className="w-4 h-4" />,
      mobileIcon: <BarChart3 className="w-4 h-4" />
    },
    { 
      value: "realtime", 
      label: "Real-Time", 
      icon: <Activity className="w-4 h-4" />,
      mobileIcon: <Activity className="w-4 h-4" />
    },
    { 
      value: "performance", 
      label: "Performance", 
      icon: <Monitor className="w-4 h-4" />,
      mobileIcon: <Monitor className="w-4 h-4" />
    },
    { 
      value: "health", 
      label: "Health", 
      icon: <Server className="w-4 h-4" />,
      mobileIcon: <Server className="w-4 h-4" />
    }
  ];

  // Theme-based styling using themeClasses
  const containerClass = themeClasses.bg.primary;
  const cardClass = `${themeClasses.bg.card} backdrop-blur-md border ${themeClasses.border.light} rounded-xl shadow-md`;
  const textSecondaryClass = themeClasses.text.secondary;

  // WebSocket connection for real-time updates
  useEffect(() => {
    const connectWebSocket = () => {
      try {
        console.log('🔌 Connecting to network WebSocket...');
        const ws = new WebSocket(`ws://${window.location.host}/ws/routers/`);
        
        ws.onopen = () => {
          console.log('WebSocket connected');
          dispatch({ type: 'SET_WEBSOCKET_CONNECTED', payload: true });
        };
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            handleWebSocketMessage(data);
          } catch (err) {
            console.error('Error processing WebSocket message:', err);
          }
        };
        
        ws.onclose = (event) => {
          console.log('WebSocket disconnected:', event.code, event.reason);
          dispatch({ type: 'SET_WEBSOCKET_CONNECTED', payload: false });
          
          // Attempt reconnection after 5 seconds with exponential backoff
          setTimeout(() => {
            connectWebSocket();
          }, 5000);
        };
        
        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          dispatch({ type: 'SET_WEBSOCKET_CONNECTED', payload: false });
        };

        return ws;
      } catch (error) {
        console.error('WebSocket connection failed:', error);
        // Retry after 10 seconds if initial connection fails
        setTimeout(() => {
          connectWebSocket();
        }, 10000);
      }
    };

    const ws = connectWebSocket();
    return () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);

  const handleWebSocketMessage = (data) => {
    switch (data.type) {
      case 'router_update':
        // Update specific router
        dispatch({ 
          type: 'UPDATE_ROUTER', 
          payload: { id: data.router_id, data: data.data } 
        });
        break;
      case 'health_update':
        // Update health stats
        dispatch({ 
          type: 'UPDATE_HEALTH_STATS', 
          payload: { routerId: data.router_id, stats: data.health_info } 
        });
        break;
      case 'bulk_operation_update':
        // Update bulk operation progress
        dispatch({ 
          type: 'UPDATE_BULK_OPERATION', 
          payload: data 
        });
        break;
      case 'real_time_update':
        // Update real-time dashboard data
        dispatch({ 
          type: 'UPDATE_REAL_TIME_DATA', 
          payload: data.data 
        });
        break;
      case 'user_activity':
        // Update user activity
        if (data.router_id === activeRouter?.id) {
          fetchHotspotUsers(activeRouter.id);
          fetchPPPoEUsers(activeRouter.id);
        }
        break;
      default:
        console.log('Unknown WebSocket message:', data);
    }
  };

  // Initial data loading
  useEffect(() => {
    fetchRouters();
    fetchHealthStats();
    fetchAvailableClients();
    fetchAvailablePlans();
    fetchBulkOperations();
    fetchAuditLogs();
    fetchConfigurationTemplates();
    
    const interval = setInterval(() => {
      fetchRouters();
      fetchHealthStats();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [fetchRouters, fetchHealthStats, fetchAvailableClients, fetchAvailablePlans, fetchBulkOperations, fetchAuditLogs, fetchConfigurationTemplates]);

  // Active router data refresh
  useEffect(() => {
    if (activeRouter?.id) {
      fetchHotspotUsers(activeRouter.id);
      fetchPPPoEUsers(activeRouter.id);
      fetchCallbackConfigs(activeRouter.id);
      fetchSystemMetrics(activeRouter.id);
      fetchRouterStats(activeRouter.id);
      fetchAvailableScripts(activeRouter.id);
      
      const interval = setInterval(() => {
        if (activeRouter?.id) {
          fetchHotspotUsers(activeRouter.id);
          fetchPPPoEUsers(activeRouter.id);
          fetchCallbackConfigs(activeRouter.id);
          fetchSystemMetrics(activeRouter.id);
          fetchRouterStats(activeRouter.id);
        }
      }, 15000);
      
      return () => clearInterval(interval);
    }
  }, [activeRouter, fetchHotspotUsers, fetchPPPoEUsers, fetchCallbackConfigs, fetchSystemMetrics, fetchRouterStats, fetchAvailableScripts]);

  // Enhanced handlers for new functionality
  const handleTestConnection = useCallback(async (routerId) => {
    try {
      await testRouterConnection(routerId);
    } catch (error) {
      console.error('Connection test failed:', error);
    }
  }, [testRouterConnection]);

  const handleRunDiagnostics = useCallback(async (routerId) => {
    try {
      await runDiagnostics(routerId);
    } catch (error) {
      console.error('Diagnostics failed:', error);
    }
  }, [runDiagnostics]);

  const handleConfigureScript = useCallback(async (router) => {
    dispatch({ type: "SET_ACTIVE_ROUTER", payload: router });
    dispatch({ type: "TOGGLE_MODAL", modal: "scriptConfiguration" });
  }, []);

  const handleConfigureVPN = useCallback(async (router) => {
    dispatch({ type: "SET_ACTIVE_ROUTER", payload: router });
    dispatch({ type: "TOGGLE_MODAL", modal: "vpnConfiguration" });
  }, []);

  const handleExecuteScript = useCallback(async (routerId, scriptData) => {
    try {
      await executeScriptConfiguration(routerId, scriptData);
      dispatch({ type: "TOGGLE_MODAL", modal: "scriptConfiguration" });
    } catch (error) {
      console.error('Script execution failed:', error);
    }
  }, [executeScriptConfiguration]);

  const handleConfigureVPNSubmit = useCallback(async (routerId, vpnData) => {
    try {
      await configureVPN(routerId, vpnData);
      dispatch({ type: "TOGGLE_MODAL", modal: "vpnConfiguration" });
    } catch (error) {
      console.error('VPN configuration failed:', error);
    }
  }, [configureVPN]);

  // Calculate statistics for real-time dashboard
  const statistics = useMemo(() => {
    const totalRouters = routers?.length || 0;
    const activeRouters = routers?.filter(r => r.connection_status === "connected")?.length || 0;
    const totalClients = routers?.reduce((acc, router) => 
      acc + (router.connected_clients_count || 0), 0
    ) || 0;
    const avgUsage = totalRouters > 0 
      ? Math.round(routers.reduce((acc, router) => {
          const stats = routerStats[router.id];
          return acc + (stats?.cpu || 0);
        }, 0) / totalRouters)
      : 0;

    return { totalRouters, activeRouters, totalClients, avgUsage };
  }, [routers, routerStats]);

  // Render monitoring content based on selected view
  const renderMonitoringContent = () => {
    switch (monitoringView) {
      case "realtime":
        return (
          <RealTimeDashboard
            theme={theme}
            routers={routers}
          />
        );
      case "performance":
        return (
          <PerformanceMetrics
            activeRouter={activeRouter}
            theme={theme}
          />
        );
      case "health":
        return (
          <HealthDashboard
            healthStats={healthStats}
            systemMetrics={systemMetrics}
            activeRouter={activeRouter}
            theme={theme}
          />
        );
      case "overview":
      default:
        return (
          <>
            {/* Statistics Overview - Improved responsive grid */}
            <motion.section
              className="mb-6 transition-colors duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.15 }}
            >
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                <StatsCard 
                  title="Total Routers" 
                  value={statistics.totalRouters} 
                  icon={<Router className="w-4 h-4 sm:w-5 sm:h-5" />} 
                  theme={theme} 
                  color="blue" 
                />
                <StatsCard 
                  title="Active Routers" 
                  value={statistics.activeRouters} 
                  icon={<Network className="w-4 h-4 sm:w-5 sm:h-5" />} 
                  theme={theme} 
                  color="green" 
                />
                <StatsCard 
                  title="Total Clients" 
                  value={statistics.totalClients}
                  icon={<Users className="w-4 h-4 sm:w-5 sm:h-5" />} 
                  theme={theme} 
                  color="purple" 
                />
                <StatsCard 
                  title="Avg. CPU Usage" 
                  value={statistics.avgUsage}
                  unit="%"
                  icon={<Activity className="w-4 h-4 sm:w-5 sm:h-5" />} 
                  theme={theme} 
                  color="orange" 
                />
              </div>
            </motion.section>

            {/* Router List */}
            <RouterList
              routers={routers}
              isLoading={isLoading}
              expandedRouter={expandedRouter}
              routerStats={routerStats}
              theme={theme}
              onToggleExpand={(routerId) => dispatch({ type: "TOGGLE_ROUTER_EXPANDED", id: routerId })}
              onViewStats={fetchRouterStats}
              onRestart={restartRouter}
              onStatusChange={updateRouterStatus}
              onEdit={(router) => {
                dispatch({ type: "UPDATE_ROUTER_FORM", payload: router });
                dispatch({ type: "TOGGLE_MODAL", modal: "editRouter" });
              }}
              onDelete={(router) => showConfirm(
                "Delete Router",
                `Are you sure you want to delete router "${router.name}"? This action cannot be undone.`,
                () => deleteRouter(router.id)
              )}
              onAddRouter={() => {
                dispatch({ type: "RESET_ROUTER_FORM" });
                dispatch({ type: "TOGGLE_MODAL", modal: "addRouter" });
              }}
              onTestConnection={handleTestConnection}
              onRunDiagnostics={handleRunDiagnostics}
              onConfigureScript={handleConfigureScript}
              onConfigureVPN={handleConfigureVPN}
              searchTerm={searchTerm}
              filter={filter}
              dispatch={dispatch}
            />

            {/* Bulk Operations Panel */}
            <BulkOperationsPanel
              theme={theme}
              routers={routers}
              onOperationComplete={(operationId, result) => {
                console.log('Bulk operation completed:', operationId, result);
                fetchRouters(); // Refresh router list
              }}
            />

            {/* Audit Log Viewer */}
            <AuditLogViewer 
              theme={theme} 
              routerId={activeRouter?.id}
            />
          </>
        );
    }
  };

  // Mobile sidebar toggle
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className={`${containerClass} p-3 sm:p-4 md:p-6 lg:p-8 transition-colors duration-300 min-h-screen`}>
      <ToastContainer 
        position="top-right" 
        autoClose={5000} 
        theme={theme} 
        pauseOnHover 
        newestOnTop 
      />

      {/* Mobile Header with Menu Button */}
      <div className="lg:hidden mb-4">
        <div className={`${cardClass} p-4 transition-colors duration-300`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={toggleSidebar}
                className={`p-2 rounded-lg ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"}`}
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h1 className={`text-xl font-bold ${themeClasses.text.primary}`}>Router Management</h1>
                <p className={`text-xs ${textSecondaryClass}`}>
                  {statistics.totalRouters} routers • {statistics.activeRouters} active
                </p>
              </div>
            </div>
            <CustomButton
              onClick={fetchRouters}
              icon={<RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />}
              label=""
              variant="secondary"
              size="sm"
              disabled={isLoading}
              theme={theme}
            />
          </div>
        </div>
      </div>

      {/* Header Section - Improved responsive layout */}
      <motion.header 
        className={`${cardClass} p-4 sm:p-6 mb-4 sm:mb-6 transition-colors duration-300 hidden lg:block`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className={`p-2 sm:p-3 rounded-xl ${
              theme === "dark" ? "bg-blue-600/20" : "bg-blue-100"
            }`}>
              <Router className={`w-6 h-6 sm:w-8 sm:h-8 ${
                theme === "dark" ? "text-blue-400" : "text-blue-600"
              }`} />
            </div>
            <div>
              <h1 className={`text-xl sm:text-2xl font-bold ${themeClasses.text.primary}`}>Router Management</h1>
              <p className={`text-xs sm:text-sm ${textSecondaryClass}`}>
                {statistics.totalRouters} routers • {statistics.activeRouters} active •{" "}
                {statistics.totalClients} total clients
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 sm:gap-3 w-full xl:w-auto">
            <CustomButton
              onClick={() => dispatch({ type: "TOGGLE_MODAL", modal: "userActivation" })}
              icon={<Users className="w-4 h-4" />}
              label="Activate User"
              variant="primary"
              size="sm"
              theme={theme}
              className="flex-1 xl:flex-none min-w-[120px]"
            />
            <CustomButton
              onClick={() => dispatch({ type: "TOGGLE_MODAL", modal: "sessionRecovery" })}
              icon={<RefreshCw className="w-4 h-4" />}
              label="Recover"
              variant="success"
              size="sm"
              theme={theme}
              className="flex-1 xl:flex-none min-w-[100px]"
            />
            <CustomButton
              onClick={() => {
                dispatch({ type: "RESET_ROUTER_FORM" });
                dispatch({ type: "TOGGLE_MODAL", modal: "addRouter" });
              }}
              icon={<Plus className="w-4 h-4" />}
              label="Add Router"
              variant="primary"
              size="sm"
              theme={theme}
              className="flex-1 xl:flex-none min-w-[120px]"
            />
            <CustomButton
              onClick={fetchRouters}
              icon={<RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />}
              label="Refresh"
              variant="secondary"
              size="sm"
              disabled={isLoading}
              theme={theme}
              className="flex-1 xl:flex-none min-w-[100px]"
            />
          </div>
        </div>
      </motion.header>

      {/* Search and Filter Section - Improved responsive layout */}
      <motion.section 
        className="mb-4 sm:mb-6 transition-colors duration-300"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className={`p-3 sm:p-4 ${cardClass}`}>
          <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 items-start lg:items-end">
            {/* Search Input */}
            <div className="flex-1 w-full">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className={`h-4 w-4 sm:h-5 sm:w-5 ${textSecondaryClass}`} />
                </div>
                <input
                  type="text"
                  className={`w-full pl-10 pr-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg border transition-colors duration-300 ${themeClasses.input}`}
                  placeholder="Search routers..."
                  value={searchTerm}
                  onChange={(e) => dispatch({ type: "SET_SEARCH_TERM", payload: e.target.value })}
                />
              </div>
            </div>

            {/* Filter Controls */}
            <div className="flex gap-2 sm:gap-3 w-full lg:w-auto">
              <EnhancedSelect
                value={filter}
                onChange={(value) => dispatch({ type: "SET_FILTER", payload: value })}
                options={filterOptions}
                placeholder="Filter"
                className="w-full lg:w-48"
                theme={theme}
              />
              
              <CustomButton
                onClick={() => performBulkHealthCheck(routers.map(r => r.id))}
                icon={<Activity className="w-4 h-4" />}
                label="Health"
                variant="secondary"
                size="sm"
                theme={theme}
                className="whitespace-nowrap"
              />
            </div>
          </div>

          {/* FIXED: Monitoring View Toggle - Completely redesigned for mobile */}
          <div className="mt-3 sm:mt-4">
            {/* Desktop View - Full buttons with labels */}
            <div className="hidden sm:flex flex-wrap gap-2">
              {monitoringViewOptions.map((option) => (
                <CustomButton
                  key={option.value}
                  onClick={() => dispatch({ type: "SET_MONITORING_VIEW", payload: option.value })}
                  icon={option.icon}
                  label={option.label}
                  variant={monitoringView === option.value ? "primary" : "secondary"}
                  size="sm"
                  theme={theme}
                  className="flex-1 sm:flex-none min-w-[120px]"
                />
              ))}
            </div>

            {/* Mobile View - Icons only in grid layout */}
            <div className="sm:hidden">
              <div className="grid grid-cols-4 gap-1">
                {monitoringViewOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => dispatch({ type: "SET_MONITORING_VIEW", payload: option.value })}
                    className={`
                      flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200
                      ${monitoringView === option.value 
                        ? theme === 'dark' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-blue-500 text-white'
                        : theme === 'dark'
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }
                    `}
                    title={option.label}
                  >
                    {option.mobileIcon || option.icon}
                    <span className="text-xs mt-1 font-medium truncate w-full text-center">
                      {option.label.split('-').map(word => word.charAt(0)).join('')}
                    </span>
                  </button>
                ))}
              </div>
              
              {/* Current View Indicator for Mobile */}
              <div className="mt-2 text-center">
                <span className={`text-xs font-medium ${themeClasses.text.primary}`}>
                  {monitoringViewOptions.find(opt => opt.value === monitoringView)?.label}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* IMPROVED: Main Content Grid with Dynamic Layout */}
      <div className="relative">
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={toggleSidebar}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Main Content - Responsive columns */}
          <div className={`lg:col-span-3 space-y-4 sm:space-y-6 ${
            isSidebarOpen ? 'lg:col-span-4' : 'lg:col-span-3'
          }`}>
            {renderMonitoringContent()}
          </div>

          {/* Sidebar - IMPROVED responsive behavior */}
          <div className={`space-y-4 sm:space-y-6 ${
            isSidebarOpen 
              ? 'fixed right-0 top-0 h-full w-80 sm:w-96 bg-white dark:bg-gray-800 z-50 p-4 overflow-y-auto shadow-2xl lg:static lg:w-auto lg:shadow-none lg:z-0 lg:col-span-1' 
              : 'hidden lg:block lg:col-span-1'
          }`}>
            {/* Close button for mobile sidebar */}
            {isSidebarOpen && (
              <div className="flex justify-between items-center mb-4 lg:hidden">
                <h3 className={`font-semibold ${themeClasses.text.primary}`}>Quick Actions</h3>
                <button
                  onClick={toggleSidebar}
                  className={`p-2 rounded-lg ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Active Router Panel */}
            {activeRouter && (
              <ActiveRouterPanel
                activeRouter={activeRouter}
                hotspotUsers={hotspotUsers}
                pppoeUsers={pppoeUsers}
                routerStats={routerStats}
                theme={theme}
                onConfigureHotspot={() => dispatch({ type: "TOGGLE_MODAL", modal: "hotspotConfig" })}
                onConfigurePPPoE={() => dispatch({ type: "TOGGLE_MODAL", modal: "pppoeConfig" })}
                onManageUsers={() => dispatch({ type: "TOGGLE_MODAL", modal: "users" })}
                onCallbackSettings={() => dispatch({ type: "TOGGLE_MODAL", modal: "callbackConfig" })}
                onRestoreSessions={() => restoreSessions(activeRouter.id)}
                onRunDiagnostics={() => handleRunDiagnostics(activeRouter.id)}
                onConfigureScript={() => handleConfigureScript(activeRouter)}
                onConfigureVPN={() => handleConfigureVPN(activeRouter)}
                onViewDetailedStats={() => fetchRouterStats(activeRouter.id)}
              />
            )}

            {/* REMOVED: Health Dashboard from overview mode since it's already in health section */}

            {/* Show Performance Metrics in sidebar when in realtime view */}
            {monitoringView === "realtime" && activeRouter && (
              <PerformanceMetrics
                activeRouter={activeRouter}
                theme={theme}
              />
            )}

            {/* Diagnostics Panel */}
            {activeRouter && monitoringView === "health" && (
              <DiagnosticsPanel
                router={activeRouter}
                theme={theme}
                diagnosticsData={diagnosticsData}
                onRunDiagnostics={handleRunDiagnostics}
                isLoading={isLoading}
              />
            )}

            {/* Show Real-time Status Indicator */}
            <div className={`p-3 sm:p-4 rounded-lg border text-sm ${
              webSocketConnected 
                ? 'bg-green-100 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                : 'bg-yellow-100 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'
            }`}>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${
                  webSocketConnected ? 'bg-green-500' : 'bg-yellow-500'
                }`}></div>
                <span className="font-medium">
                  {webSocketConnected ? 'Real-time Connected' : 'Connecting...'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {webSocketConnected 
                  ? 'Live updates active' 
                  : 'Real-time features temporarily unavailable'
                }
              </p>
            </div>

            {/* Quick Stats Summary - IMPROVED mobile layout */}
            <div className={`p-3 sm:p-4 rounded-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
              <h4 className={`font-medium mb-2 sm:mb-3 text-sm sm:text-base ${themeClasses.text.primary}`}>Quick Stats</h4>
              <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                <div className="flex flex-col">
                  <span className={themeClasses.text.tertiary}>Connected:</span>
                  <span className={themeClasses.text.primary}>{statistics.activeRouters}</span>
                </div>
                <div className="flex flex-col">
                  <span className={themeClasses.text.tertiary}>Sessions:</span>
                  <span className={themeClasses.text.primary}>{statistics.totalClients}</span>
                </div>
                <div className="flex flex-col">
                  <span className={themeClasses.text.tertiary}>Health:</span>
                  <span className={`${
                    realTimeData.systemHealth >= 80 ? 'text-green-500' :
                    realTimeData.systemHealth >= 60 ? 'text-yellow-500' : 'text-red-500'
                  }`}>
                    {realTimeData.systemHealth}%
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className={themeClasses.text.tertiary}>Avg CPU:</span>
                  <span className={themeClasses.text.primary}>{statistics.avgUsage}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* All Modals */}
      <ConfirmationModal
        isOpen={confirmModal?.show || false}
        title={confirmModal?.title || ""}
        message={confirmModal?.message || ""}
        onConfirm={handleConfirm}
        onCancel={hideConfirm}
        theme={theme}
      />

      {/* Router Management Modals */}
      <AddRouterForm
        isOpen={modals?.addRouter || false}
        onClose={() => {
          dispatch({ type: "TOGGLE_MODAL", modal: "addRouter" });
          dispatch({ type: "RESET_ROUTER_FORM" });
        }}
        routerForm={routerForm}
        touchedFields={touchedFields}
        isLoading={isLoading}
        theme={theme}
        onFormUpdate={(updates) => dispatch({ type: "UPDATE_ROUTER_FORM", payload: updates })}
        onFieldBlur={(field) => dispatch({ type: "SET_TOUCHED_FIELD", field })}
        onSubmit={addRouter}
        dispatch={dispatch}
      />

      <EditRouterForm
        isOpen={modals?.editRouter || false}
        onClose={() => {
          dispatch({ type: "TOGGLE_MODAL", modal: "editRouter" });
          dispatch({ type: "RESET_ROUTER_FORM" });
        }}
        routerForm={routerForm}
        touchedFields={touchedFields}
        isLoading={isLoading}
        theme={theme}
        onFormUpdate={(updates) => dispatch({ type: "UPDATE_ROUTER_FORM", payload: updates })}
        onFieldBlur={(field) => dispatch({ type: "SET_TOUCHED_FIELD", field })}
        onSubmit={() => updateRouter(activeRouter?.id)}
        activeRouter={activeRouter}
        onTestConnection={handleTestConnection}
      />

      {/* User Management Modals */}
      <UserActivationForm
        isOpen={modals?.userActivation || false}
        onClose={() => dispatch({ type: "TOGGLE_MODAL", modal: "userActivation" })}
        availableClients={availableClients}
        availablePlans={availablePlans}
        availableRouters={routers}
        activeRouter={activeRouter}
        theme={theme}
        onActivateUser={activateUser}
        onTestRouterConnection={handleTestConnection}
        onAutoConfigureRouter={handleConfigureScript}
        isLoading={isLoading}
      />

      <SessionRecovery
        isOpen={modals?.sessionRecovery || false}
        onClose={() => dispatch({ type: "TOGGLE_MODAL", modal: "sessionRecovery" })}
        recoverableSessions={recoverableSessions}
        availableRouters={routers}
        theme={theme}
        onRecoverSession={recoverUserSession}
        onBulkRecover={bulkRecoverSessions}
        onTestRouterConnection={handleTestConnection}
        isLoading={isLoading}
      />

      {/* Configuration Modals */}
      <HotspotConfig
        isOpen={modals?.hotspotConfig || false}
        onClose={() => dispatch({ type: "TOGGLE_MODAL", modal: "hotspotConfig" })}
        hotspotForm={hotspotForm}
        activeRouter={activeRouter}
        theme={theme}
        onFormUpdate={(updates) => dispatch({ type: "UPDATE_HOTSPOT_FORM", payload: updates })}
        onSubmit={configureHotspot}
        isLoading={isLoading}
      />

      <PPPoEConfig
        isOpen={modals?.pppoeConfig || false}
        onClose={() => dispatch({ type: "TOGGLE_MODAL", modal: "pppoeConfig" })}
        pppoeForm={pppoeForm}
        activeRouter={activeRouter}
        theme={theme}
        onFormUpdate={(updates) => dispatch({ type: "UPDATE_PPPOE_FORM", payload: updates })}
        onSubmit={configurePPPoE}
        isLoading={isLoading}
      />

      <CallbackConfig
        isOpen={modals?.callbackConfig || false}
        onClose={() => {
          dispatch({ type: "TOGGLE_MODAL", modal: "callbackConfig" });
          dispatch({ type: "RESET_CALLBACK_FORM" });
        }}
        callbackForm={callbackForm}
        callbackConfigs={callbackConfigs}
        activeRouter={activeRouter}
        theme={theme}
        onFormUpdate={(updates) => dispatch({ type: "UPDATE_CALLBACK_FORM", payload: updates })}
        onAddCallback={addCallbackConfig}
        onDeleteCallback={deleteCallbackConfig}
        isLoading={isLoading}
      />

      {/* Enhanced Configuration Modals */}
      <ScriptConfigurationModal
        isOpen={modals?.scriptConfiguration || false}
        onClose={() => {
          dispatch({ type: "TOGGLE_MODAL", modal: "scriptConfiguration" });
          dispatch({ type: "RESET_SCRIPT_FORM" });
        }}
        router={activeRouter}
        theme={theme}
        scriptForm={scriptForm}
        onFormUpdate={(updates) => dispatch({ type: "UPDATE_SCRIPT_FORM", payload: updates })}
        onExecuteScript={handleExecuteScript}
        isLoading={isLoading}
        availableScripts={availableScripts}
      />

      {/* VPN Configuration Modal */}
      <CustomModal
        isOpen={modals?.vpnConfiguration || false}
        title="VPN Configuration"
        onClose={() => {
          dispatch({ type: "TOGGLE_MODAL", modal: "vpnConfiguration" });
          dispatch({ type: "RESET_VPN_FORM" });
        }}
        size="lg"
        theme={theme}
      >
        <div className="p-6">
          <div className="text-center py-8">
            <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">VPN Configuration</h3>
            <p className="text-gray-600 dark:text-gray-400">
              VPN configuration feature coming soon. This will allow you to configure OpenVPN, WireGuard, and other VPN protocols.
            </p>
            <div className="mt-6">
              <CustomButton
                onClick={() => {
                  dispatch({ type: "TOGGLE_MODAL", modal: "vpnConfiguration" });
                  dispatch({ type: "RESET_VPN_FORM" });
                }}
                label="Close"
                variant="primary"
                theme={theme}
              />
            </div>
          </div>
        </div>
      </CustomModal>

      {/* Monitoring Modals */}
      <RouterStats
        isOpen={modals?.routerStats || false}
        onClose={() => dispatch({ type: "TOGGLE_MODAL", modal: "routerStats" })}
        routerStats={routerStats}
        statsLoading={statsLoading}
        theme={theme}
        router={activeRouter}
      />
    </div>
  );
};

export default RouterManagement;