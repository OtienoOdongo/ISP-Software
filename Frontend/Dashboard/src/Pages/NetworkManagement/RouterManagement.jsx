






// src/Pages/NetworkManagement/RouterManagement.jsx
import React, { useReducer, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Router, Users, RefreshCw, Plus, Search, Filter,
  BarChart3, Activity, Wifi, Server, Network
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

// Context and Theme
import { useTheme } from "../../context/ThemeContext";
import { getThemeClasses, EnhancedSelect } from "../../components/ServiceManagement/Shared/components"

const RouterManagement = () => {
  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);
  
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
    handleConfirm
  } = useRouterManagement();

  const {
    activateUser,
    bulkActivateUsers,
    fetchAvailableClients,
    fetchAvailablePlans
  } = useUserManagement();

  const {
    recoverUserSession,
    bulkRecoverSessions,
    fetchRecoverableSessions
  } = useSessionRecovery();

  const {
    fetchHealthStats,
    performBulkHealthCheck,
    fetchSystemMetrics
  } = useHealthMonitoring();

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
    systemMetrics = {}
  } = state;

  // Filter options for EnhancedSelect
  const filterOptions = [
    { value: "all", label: "All Routers" },
    { value: "connected", label: "Connected" },
    { value: "disconnected", label: "Disconnected" },
    { value: "updating", label: "Updating" },
    { value: "error", label: "Error" }
  ];

  // Theme-based styling using themeClasses
  const containerClass = themeClasses.bg.primary;
  const cardClass = `${themeClasses.bg.card} backdrop-blur-md border ${themeClasses.border.light} rounded-xl shadow-md`;
  const textSecondaryClass = themeClasses.text.secondary;

  // Initial data loading
  useEffect(() => {
    fetchRouters();
    fetchHealthStats();
    fetchAvailableClients();
    fetchAvailablePlans();
    
    const interval = setInterval(() => {
      fetchRouters();
      fetchHealthStats();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [fetchRouters, fetchHealthStats, fetchAvailableClients, fetchAvailablePlans]);

  // Active router data refresh
  useEffect(() => {
    if (activeRouter?.id) {
      fetchHotspotUsers(activeRouter.id);
      fetchPPPoEUsers(activeRouter.id);
      fetchCallbackConfigs(activeRouter.id);
      fetchSystemMetrics(activeRouter.id);
      
      const interval = setInterval(() => {
        if (activeRouter?.id) {
          fetchHotspotUsers(activeRouter.id);
          fetchPPPoEUsers(activeRouter.id);
          fetchCallbackConfigs(activeRouter.id);
          fetchSystemMetrics(activeRouter.id);
        }
      }, 15000);
      
      return () => clearInterval(interval);
    }
  }, [activeRouter, fetchHotspotUsers, fetchPPPoEUsers, fetchCallbackConfigs, fetchSystemMetrics]);

  // Calculate statistics
  const statistics = useMemo(() => {
    const totalRouters = routers?.length || 0;
    const activeRouters = routers?.filter(r => r.status === "connected")?.length || 0;
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

  return (
    <div className={`${containerClass} p-4 md:p-8 transition-colors duration-300 min-h-screen`}>
      <ToastContainer 
        position="top-right" 
        autoClose={5000} 
        theme={theme} 
        pauseOnHover 
        newestOnTop 
      />

      {/* Header Section */}
      <motion.header 
        className={`${cardClass} p-6 mb-6 transition-colors duration-300`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-xl ${
              theme === "dark" ? "bg-blue-600/20" : "bg-blue-100"
            }`}>
              <Router className={`w-8 h-8 ${
                theme === "dark" ? "text-blue-400" : "text-blue-600"
              }`} />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${themeClasses.text.primary}`}>Router Management</h1>
              <p className={`text-sm ${textSecondaryClass}`}>
                {statistics.totalRouters} routers • {statistics.activeRouters} active •{" "}
                {statistics.totalClients} total clients
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <CustomButton
              onClick={() => dispatch({ type: "TOGGLE_MODAL", modal: "userActivation" })}
              icon={<Users className="w-4 h-4" />}
              label="Activate User"
              variant="primary"
              size="sm"
              theme={theme}
            />
            <CustomButton
              onClick={() => dispatch({ type: "TOGGLE_MODAL", modal: "sessionRecovery" })}
              icon={<RefreshCw className="w-4 h-4" />}
              label="Recover Sessions"
              variant="success"
              size="sm"
              theme={theme}
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
            />
            <CustomButton
              onClick={fetchRouters}
              icon={<RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />}
              label="Refresh"
              variant="secondary"
              size="sm"
              disabled={isLoading}
              theme={theme}
            />
          </div>
        </div>
      </motion.header>

      {/* Search and Filter Section */}
      <motion.section 
        className="mb-6 transition-colors duration-300"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className={`p-4 ${cardClass}`}>
          <div className="flex flex-col lg:flex-row gap-4 items-end">
            {/* Search Input */}
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className={`h-5 w-5 ${textSecondaryClass}`} />
                </div>
                <input
                  type="text"
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-colors duration-300 ${themeClasses.input}`}
                  placeholder="Search routers by name, IP, location, or SSID..."
                  value={searchTerm}
                  onChange={(e) => dispatch({ type: "SET_SEARCH_TERM", payload: e.target.value })}
                />
              </div>
            </div>

            {/* Filter Controls */}
            <div className="flex gap-3 w-full lg:w-auto">
              <EnhancedSelect
                value={filter}
                onChange={(value) => dispatch({ type: "SET_FILTER", payload: value })}
                options={filterOptions}
                placeholder="Filter by status"
                className="w-full lg:w-48"
                theme={theme}
              />
              
              <CustomButton
                onClick={() => performBulkHealthCheck(routers.map(r => r.id))}
                icon={<Activity className="w-4 h-4" />}
                label="Health Check"
                variant="secondary"
                size="sm"
                theme={theme}
              />
            </div>
          </div>
        </div>
      </motion.section>

      {/* Statistics Overview */}
      <motion.section
        className="mb-6 transition-colors duration-300"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard 
            title="Total Routers" 
            value={statistics.totalRouters} 
            icon={<Router className="w-5 h-5" />} 
            theme={theme} 
            color="blue" 
          />
          <StatsCard 
            title="Active Routers" 
            value={statistics.activeRouters} 
            icon={<Network className="w-5 h-5" />} 
            theme={theme} 
            color="green" 
          />
          <StatsCard 
            title="Total Clients" 
            value={statistics.totalClients}
            icon={<Users className="w-5 h-5" />} 
            theme={theme} 
            color="purple" 
          />
          <StatsCard 
            title="Avg. CPU Usage" 
            value={statistics.avgUsage}
            unit="%"
            icon={<Activity className="w-5 h-5" />} 
            theme={theme} 
            color="orange" 
          />
        </div>
      </motion.section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Routers List - 3 columns on xl screens */}
        <div className="xl:col-span-3">
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
            searchTerm={searchTerm}
            filter={filter}
          />
        </div>

        {/* Sidebar - 1 column on xl screens */}
        <div className="xl:col-span-1 space-y-6">
          {/* Active Router Panel */}
          {activeRouter && (
            <ActiveRouterPanel
              activeRouter={activeRouter}
              hotspotUsers={hotspotUsers}
              pppoeUsers={pppoeUsers}
              theme={theme}
              onConfigureHotspot={() => dispatch({ type: "TOGGLE_MODAL", modal: "hotspotConfig" })}
              onConfigurePPPoE={() => dispatch({ type: "TOGGLE_MODAL", modal: "pppoeConfig" })}
              onManageUsers={() => dispatch({ type: "TOGGLE_MODAL", modal: "users" })}
              onCallbackSettings={() => dispatch({ type: "TOGGLE_MODAL", modal: "callbackConfig" })}
              onRestoreSessions={() => restoreSessions(activeRouter.id)}
            />
          )}

          {/* Health Dashboard */}
          <HealthDashboard
            healthStats={healthStats}
            systemMetrics={systemMetrics}
            activeRouter={activeRouter}
            theme={theme}
          />
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
      />

      {/* User Management Modals */}
      <UserActivationForm
        isOpen={modals?.userActivation || false}
        onClose={() => dispatch({ type: "TOGGLE_MODAL", modal: "userActivation" })}
        availableClients={availableClients}
        availablePlans={availablePlans}
        activeRouter={activeRouter}
        theme={theme}
        onActivateUser={activateUser}
        isLoading={isLoading}
      />

      <SessionRecovery
        isOpen={modals?.sessionRecovery || false}
        onClose={() => dispatch({ type: "TOGGLE_MODAL", modal: "sessionRecovery" })}
        recoverableSessions={recoverableSessions}
        theme={theme}
        onRecoverSession={recoverUserSession}
        onBulkRecover={bulkRecoverSessions}
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
        callbackConfigs={state.callbackConfigs || []}
        theme={theme}
        onFormUpdate={(updates) => dispatch({ type: "UPDATE_CALLBACK_FORM", payload: updates })}
        onAddCallback={addCallbackConfig}
        onDeleteCallback={deleteCallbackConfig}
        isLoading={isLoading}
      />

      {/* Monitoring Modals */}
      <RouterStats
        isOpen={modals?.routerStats || false}
        onClose={() => dispatch({ type: "TOGGLE_MODAL", modal: "routerStats" })}
        routerStats={routerStats}
        statsLoading={statsLoading}
        theme={theme}
      />
    </div>
  );
};

export default RouterManagement;