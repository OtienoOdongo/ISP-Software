



// import React, { useState, useEffect, useMemo, useCallback } from "react";
// import { motion } from "framer-motion";
// import {
//   Users, Activity, RefreshCw, Play, Pause, Eye, Filter,
//   BarChart3, Shield, Wifi, Cable, Clock, Check, X, AlertTriangle,
//   Download, Upload, Search, Plus, Settings, Server, Network
// } from "lucide-react";
// import { useTheme } from "../../context/ThemeContext"
// import { getThemeClasses, EnhancedSelect, ConfirmationModal } from "../../components/ServiceManagement/Shared/components";
// import { formatNumber, formatTime, formatBytes } from "../../components/ServiceManagement/Shared/utils";
// import api from "../../api";

// // Sub-components
// import SubscriptionManagement from "./components/SubscriptionManagement";
// import ActivationService from "./components/ActivationService";
// import RouterCompatibility from "./components/RouterCompatibility";
// import BulkOperations from "./components/BulkOperations";

// const ServiceOperations = () => {
//   const { theme } = useTheme();
//   const themeClasses = getThemeClasses(theme);
//   const [activeTab, setActiveTab] = useState("subscriptions");
//   const [subscriptions, setSubscriptions] = useState([]);
//   const [plans, setPlans] = useState([]);
//   const [routers, setRouters] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [lastUpdated, setLastUpdated] = useState(null);

//   const stats = useMemo(() => {
//     const total = subscriptions.length;
//     const active = subscriptions.filter(sub => sub.status === 'active').length;
//     const pending = subscriptions.filter(sub => 
//       sub.status === 'active' && !sub.activation_successful && !sub.activation_requested
//     ).length;
//     const failed = subscriptions.filter(sub => 
//       sub.activation_error && !sub.activation_successful
//     ).length;

//     return {
//       totalSubscriptions: total,
//       activeSubscriptions: active,
//       pendingActivations: pending,
//       failedActivations: failed
//     };
//   }, [subscriptions]);

//   // Fetch data with error handling
//   const fetchSubscriptions = useCallback(async () => {
//     setIsLoading(true);
//     setError(null);
//     try {
//       const response = await api.get("/api/internet_plans/subscriptions/");
//       setSubscriptions(response.data);
//       setLastUpdated(new Date());
//     } catch (error) {
//       console.error("Error fetching subscriptions:", error);
//       setError("Failed to load subscriptions. Please try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   }, []);

//   const fetchPlans = useCallback(async () => {
//     try {
//       const response = await api.get("/api/internet_plans/");
//       setPlans(response.data.results || response.data);
//     } catch (error) {
//       console.error("Error fetching plans:", error);
//     }
//   }, []);

//   const fetchRouters = useCallback(async () => {
//     try {
//       const response = await api.get("/api/network_management/routers/");
//       setRouters(response.data);
//     } catch (error) {
//       console.error("Error fetching routers:", error);
//     }
//   }, []);

//   // Initial data load
//   useEffect(() => {
//     fetchSubscriptions();
//     fetchPlans();
//     fetchRouters();
//   }, [fetchSubscriptions, fetchPlans, fetchRouters]);

//   // Auto-refresh every 30 seconds
//   useEffect(() => {
//     const interval = setInterval(() => {
//       fetchSubscriptions();
//     }, 30000);

//     return () => clearInterval(interval);
//   }, [fetchSubscriptions]);

//   const tabs = [
//     { id: "subscriptions", label: "Subscriptions", icon: Users, description: "Manage client subscriptions" },
//     { id: "activation", label: "Activation Service", icon: Play, description: "Activate and manage services" },
//     { id: "compatibility", label: "Router Compatibility", icon: Network, description: "Check plan-router compatibility" },
//     { id: "bulk", label: "Bulk Operations", icon: RefreshCw, description: "Perform bulk actions" },
//   ];

//   const renderStatsCards = () => (
//     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
//       <StatsCard
//         icon={Users}
//         value={stats.totalSubscriptions}
//         label="Total Subscriptions"
//         color="blue"
//         theme={theme}
//       />
//       <StatsCard
//         icon={Activity}
//         value={stats.activeSubscriptions}
//         label="Active"
//         color="green"
//         theme={theme}
//       />
//       <StatsCard
//         icon={Clock}
//         value={stats.pendingActivations}
//         label="Pending Activation"
//         color="yellow"
//         theme={theme}
//       />
//       <StatsCard
//         icon={AlertTriangle}
//         value={stats.failedActivations}
//         label="Failed Activations"
//         color="red"
//         theme={theme}
//       />
//     </div>
//   );

//   const renderTabs = () => (
//     <div className={`p-2 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light} mb-6`}>
//       <div className="flex flex-wrap gap-1 lg:gap-2">
//         {tabs.map((tab) => {
//           const IconComponent = tab.icon;
//           return (
//             <motion.button
//               key={tab.id}
//               onClick={() => setActiveTab(tab.id)}
//               className={`px-3 py-2 lg:px-4 lg:py-2 rounded-lg text-xs lg:text-sm font-medium transition-colors flex items-center gap-2 ${
//                 activeTab === tab.id 
//                   ? "bg-indigo-600 text-white shadow-md" 
//                   : `${themeClasses.text.secondary} hover:${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`
//               }`}
//               whileHover={{ scale: 1.02 }}
//               whileTap={{ scale: 0.98 }}
//             >
//               <IconComponent className="w-3 h-3 lg:w-4 lg:h-4" />
//               <span>{tab.label}</span>
//             </motion.button>
//           );
//         })}
//       </div>
//     </div>
//   );

//   const renderActiveTab = () => {
//     const tabProps = {
//       subscriptions,
//       plans,
//       routers,
//       onRefresh: fetchSubscriptions,
//       theme,
//     };

//     const components = {
//       subscriptions: <SubscriptionManagement {...tabProps} />,
//       activation: <ActivationService {...tabProps} />,
//       compatibility: <RouterCompatibility {...tabProps} />,
//       bulk: <BulkOperations {...tabProps} />,
//     };

//     return components[activeTab] || null;
//   };

//   return (
//     <div className={`min-h-screen p-3 sm:p-6 lg:p-8 transition-colors duration-300 ${themeClasses.bg.primary}`}>
//       <main className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
//         {/* Header */}
//         <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
//           <div className="flex-1 min-w-0">
//             <h1 className="text-lg sm:text-xl lg:text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
//               Service Operations
//             </h1>
//             <p className={`mt-1 lg:mt-2 text-sm lg:text-lg ${themeClasses.text.secondary}`}>
//               Manage subscriptions, activations, and service operations
//             </p>
//             {lastUpdated && (
//               <p className={`text-xs mt-1 ${themeClasses.text.tertiary}`}>
//                 Last updated: {lastUpdated.toLocaleTimeString()}
//               </p>
//             )}
//           </div>
          
//           <div className="flex items-center space-x-3">
//             {error && (
//               <div className="text-red-600 text-sm bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-lg">
//                 {error}
//               </div>
//             )}
//             <motion.button
//               onClick={fetchSubscriptions}
//               disabled={isLoading}
//               className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
//                 isLoading ? 'bg-gray-400 cursor-not-allowed' : themeClasses.button.secondary
//               }`}
//               whileHover={{ scale: isLoading ? 1 : 1.05 }}
//               whileTap={{ scale: isLoading ? 1 : 0.95 }}
//             >
//               <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
//               {isLoading ? 'Refreshing...' : 'Refresh'}
//             </motion.button>
//           </div>
//         </div>

//         {/* Stats Cards */}
//         {renderStatsCards()}

//         {/* Tabs */}
//         {renderTabs()}

//         {/* Active Tab Content */}
//         {renderActiveTab()}
//       </main>
//     </div>
//   );
// };

// // Stats Card Component
// const StatsCard = ({ icon: Icon, value, label, color, theme }) => {
//   const colorClasses = {
//     blue: { icon: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
//     green: { icon: "text-green-600", bg: "bg-green-50 dark:bg-green-900/20" },
//     yellow: { icon: "text-yellow-600", bg: "bg-yellow-50 dark:bg-yellow-900/20" },
//     red: { icon: "text-red-600", bg: "bg-red-50 dark:bg-red-900/20" },
//   };

//   const themeClasses = getThemeClasses(theme);
//   const colorConfig = colorClasses[color] || colorClasses.blue;

//   return (
//     <motion.div
//       className={`p-4 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light} ${colorConfig.bg}`}
//       whileHover={{ y: -2, transition: { duration: 0.2 } }}
//     >
//       <div className="flex items-center">
//         <div className={`p-2 rounded-lg ${colorConfig.bg}`}>
//           <Icon className="w-6 h-6" />
//         </div>
//         <div className="ml-3">
//           <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{value}</h3>
//           <p className={`text-sm ${themeClasses.text.secondary}`}>{label}</p>
//         </div>
//       </div>
//     </motion.div>
//   );
// };

// export default ServiceOperations;








// src/pages/ServiceOperations/ServiceOperations.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Users, Activity, RefreshCw, Play, Clock, Check, X, AlertTriangle,
  Network, Terminal, FileText, Heart, Zap, Star as StarIcon
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { getThemeClasses } from "../../components/ServiceManagement/Shared/components";
import api from "../../api";

// Components
import SubscriptionManagement from "./components/SubscriptionManagement";
import ActivationService from "./components/ActivationService";
import RouterCompatibility from "./components/RouterCompatibility";
import BulkOperations from "./components/BulkOperations";
import ClientOperations from "./components/ClientOperations";
import SystemMonitoring from "./components/SystemMonitoring";
import OperationLogs from "./components/OperationLogs";

const ServiceOperations = () => {
  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);

  const [activeTab, setActiveTab] = useState("subscriptions");
  const [subscriptions, setSubscriptions] = useState([]);
  const [plans, setPlans] = useState([]);
  const [routers, setRouters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [healthStatus, setHealthStatus] = useState(null);
  const [queueStats, setQueueStats] = useState(null);
  const [operationStats, setOperationStats] = useState(null);

  const stats = useMemo(() => {
    const total = subscriptions.length;
    const active = subscriptions.filter(s => s.status === 'active').length;
    const pending = subscriptions.filter(s => ['pending', 'processing'].includes(s.status)).length;
    const failed = subscriptions.filter(s => s.status === 'failed' || s.activation_failed).length;
    const processing = subscriptions.filter(s => s.status === 'processing').length;

    const ratings = subscriptions.filter(s => s.rating > 0);
    const avgRating = ratings.length > 0
      ? (ratings.reduce((sum, s) => sum + s.rating, 0) / ratings.length).toFixed(1)
      : 0;

    return { total, active, pending, failed, processing, avgRating };
  }, [subscriptions]);

  const fetchSubscriptions = useCallback(async () => {
    try {
      const response = await api.get("/api/service_operations/subscriptions/");
      setSubscriptions(response.data.results || response.data || []);
      setLastUpdated(new Date());
    } catch (err) {
      setError("Failed to load subscriptions");
      console.error(err);
    }
  }, []);

  const fetchPlans = useCallback(async () => {
    try {
      const response = await api.get("/api/internet_plans/plans/");
      setPlans(response.data.results || response.data || []);
    } catch (err) {
      console.error("Failed to load plans", err);
    }
  }, []);

  const fetchRouters = useCallback(async () => {
    try {
      const response = await api.get("/api/network_management/routers/");
      setRouters(response.data || []);
    } catch (err) {
      console.error("Failed to load routers", err);
    }
  }, []);

  const fetchHealthStatus = useCallback(async () => {
    try {
      const response = await api.get("/api/service_operations/health/");
      setHealthStatus(response.data);
    } catch (err) {
      console.error("Health check failed", err);
    }
  }, []);

  const fetchQueueStats = useCallback(async () => {
    try {
      const response = await api.get("/api/service_operations/activations/statistics/");
      setQueueStats(response.data);
    } catch (err) {
      console.error("Queue stats failed", err);
    }
  }, []);

  const fetchOperationStats = useCallback(async () => {
    try {
      const response = await api.get("/api/service_operations/operations/statistics/");
      setOperationStats(response.data);
    } catch (err) {
      console.error("Operation stats failed", err);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    await Promise.all([
      fetchSubscriptions(),
      fetchPlans(),
      fetchRouters(),
      fetchHealthStatus(),
      fetchQueueStats(),
      fetchOperationStats()
    ]);
    setIsLoading(false);
  }, [
    fetchSubscriptions, fetchPlans, fetchRouters,
    fetchHealthStatus, fetchQueueStats, fetchOperationStats
  ]);

  useEffect(() => {
    refreshAll();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const interval = setInterval(() => {
      fetchSubscriptions();
      fetchHealthStatus();
      fetchQueueStats();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchSubscriptions, fetchHealthStatus, fetchQueueStats]);

  const tabs = [
    { id: "subscriptions", label: "Subscriptions", icon: Users },
    { id: "activation", label: "Activation", icon: Play },
    { id: "client_ops", label: "Client Ops", icon: FileText },
    { id: "compatibility", label: "Compatibility", icon: Network },
    { id: "bulk", label: "Bulk Actions", icon: RefreshCw },
    { id: "monitoring", label: "Monitoring", icon: Activity },
    { id: "logs", label: "Logs", icon: Terminal },
  ];

  const getHealthColor = () => {
    if (!healthStatus) return "gray";
    return healthStatus.status === "healthy" ? "green" :
           healthStatus.status === "degraded" ? "yellow" : "red";
  };

  const health = getHealthColor();

  const commonProps = {
    subscriptions,
    plans,
    routers,
    onRefresh: fetchSubscriptions,
    theme,
    healthStatus,
    queueStats,
    operationStats,
  };

  const renderContent = () => {
    switch (activeTab) {
      case "subscriptions": return <SubscriptionManagement {...commonProps} />;
      case "activation": return <ActivationService {...commonProps} />;
      case "client_ops": return <ClientOperations {...commonProps} />;
      case "compatibility": return <RouterCompatibility plans={plans} routers={routers} theme={theme} />;
      case "bulk": return <BulkOperations {...commonProps} />;
      case "monitoring": return <SystemMonitoring {...commonProps} />;
      case "logs": return <OperationLogs {...commonProps} />;
      default: return <div className="text-center py-10">Feature coming soon</div>;
    }
  };

  return (
    <div className={`min-h-screen ${themeClasses.bg.primary} p-4 sm:p-6 lg:p-8`}>
      <main className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Service Operations</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Manage subscriptions, activations, and system health
            </p>
            {lastUpdated && (
              <p className="text-xs text-gray-500 mt-2">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className={`px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium
              ${health === 'green' ? 'bg-green-100 text-green-800' :
                health === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'}`}>
              <Heart className="w-4 h-4" />
              {healthStatus?.status?.charAt(0).toUpperCase() + healthStatus?.status?.slice(1) || "Unknown"}
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/30 px-3 py-2 rounded-lg">
                {error}
              </div>
            )}

            <motion.button
              onClick={refreshAll}
              disabled={isLoading}
              className={`px-5 py-2 rounded-lg flex items-center gap-2 font-medium
                ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
              whileHover={{ scale: isLoading ? 1 : 1.05 }}
              whileTap={{ scale: isLoading ? 1 : 0.95 }}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Refreshing...' : 'Refresh All'}
            </motion.button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          <StatsCard icon={Users} value={stats.total} label="Total" color="blue" />
          <StatsCard icon={Check} value={stats.active} label="Active" color="green" />
          <StatsCard icon={Clock} value={stats.pending} label="Pending" color="yellow" />
          <StatsCard icon={AlertTriangle} value={stats.failed} label="Failed" color="red" />
          <StatsCard icon={Zap} value={stats.processing} label="Processing" color="orange" />
          <StatsCard icon={Play} value={queueStats?.statistics?.queue?.pending || 0} label="In Queue" color="purple" />
          <StatsCard icon={Activity} value={operationStats?.statistics?.recent_activity?.total || 0} label="Ops/hr" color="indigo" />
          <StatsCard icon={StarIcon} value={`${stats.avgRating} ⭐`} label="Rating" color="amber" />
        </div>

        {/* Tabs */}
        <div className={`rounded-xl ${themeClasses.bg.card} border ${themeClasses.border.light} p-2`}>
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all
                    ${activeTab === tab.id
                      ? 'bg-indigo-600 text-white shadow-md'
                      : `${themeClasses.text.secondary} hover:bg-gray-100 dark:hover:bg-gray-800`}`}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        {isLoading && !subscriptions.length ? (
          <div className="text-center py-12">
            <RefreshCw className="w-12 h-12 mx-auto text-indigo-600 animate-spin" />
            <p className="mt-4 text-gray-600">Loading data...</p>
          </div>
        ) : (
          renderContent()
        )}
      </main>
    </div>
  );
};

const StatsCard = ({ icon: Icon, value, label, color }) => {
  const colors = {
    blue: "text-blue-600 bg-blue-50 dark:bg-blue-900/20",
    green: "text-green-600 bg-green-50 dark:bg-green-900/20",
    yellow: "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20",
    red: "text-red-600 bg-red-50 dark:bg-red-900/20",
    orange: "text-orange-600 bg-orange-50 dark:bg-orange-900/20",
    purple: "text-purple-600 bg-purple-50 dark:bg-purple-900/20",
    indigo: "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20",
    amber: "text-amber-600 bg-amber-50 dark:bg-amber-900/20",
  };

  return (
    <div className={`p-4 rounded-xl ${colors[color]} border border-gray-200 dark:border-gray-700`}>
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-white dark:bg-gray-800">
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <div className="text-2xl font-bold">{value}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">{label}</div>
        </div>
      </div>
    </div>
  );
};

export default ServiceOperations;
