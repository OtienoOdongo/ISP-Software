// import React, { useState, useEffect, useMemo } from "react";
// import { motion } from "framer-motion";
// import {
//   Users, Activity, RefreshCw, Play, Pause, Eye, Filter,
//   BarChart3, Shield, Wifi, Cable, Clock, Check, X, AlertTriangle,
//   Download, Upload, Search, Plus, Settings, Server, Network
// } from "lucide-react";
// import { useTheme } from "../../../context/ThemeContext";
// import { getThemeClasses, EnhancedSelect, ConfirmationModal } from "../../components/ServiceManagement/Shared/components"
// import { formatNumber, formatTime, formatBytes } from "../../components/ServiceManagement/Shared/utils"
// import api from "../../api"

// // Sub-components
// import SubscriptionManagement from "./components/SubscriptionManagement"
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
//   const [stats, setStats] = useState({
//     totalSubscriptions: 0,
//     activeSubscriptions: 0,
//     pendingActivations: 0,
//     failedActivations: 0
//   });

//   // Fetch data on component mount
//   useEffect(() => {
//     fetchSubscriptions();
//     fetchPlans();
//     fetchRouters();
//   }, []);

//   const fetchSubscriptions = async () => {
//     setIsLoading(true);
//     try {
//       const response = await api.get("/api/internet_plans/subscriptions/");
//       setSubscriptions(response.data);
//       calculateStats(response.data);
//     } catch (error) {
//       console.error("Error fetching subscriptions:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const fetchPlans = async () => {
//     try {
//       const response = await api.get("/api/internet_plans/");
//       setPlans(response.data.results || response.data);
//     } catch (error) {
//       console.error("Error fetching plans:", error);
//     }
//   };

//   const fetchRouters = async () => {
//     try {
//       const response = await api.get("/api/network_management/routers/");
//       setRouters(response.data);
//     } catch (error) {
//       console.error("Error fetching routers:", error);
//     }
//   };

//   const calculateStats = (subscriptionsData) => {
//     const total = subscriptionsData.length;
//     const active = subscriptionsData.filter(sub => sub.status === 'active').length;
//     const pending = subscriptionsData.filter(sub => 
//       sub.status === 'active' && !sub.activation_successful && !sub.activation_requested
//     ).length;
//     const failed = subscriptionsData.filter(sub => 
//       sub.activation_error && !sub.activation_successful
//     ).length;

//     setStats({
//       totalSubscriptions: total,
//       activeSubscriptions: active,
//       pendingActivations: pending,
//       failedActivations: failed
//     });
//   };

//   const tabs = [
//     { id: "subscriptions", label: "Subscriptions", icon: Users, description: "Manage client subscriptions" },
//     { id: "activation", label: "Activation Service", icon: Play, description: "Activate and manage services" },
//     { id: "compatibility", label: "Router Compatibility", icon: Network, description: "Check plan-router compatibility" },
//     { id: "bulk", label: "Bulk Operations", icon: RefreshCw, description: "Perform bulk actions" },
//   ];

//   const renderStatsCards = () => (
//     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
//       <div className={`p-4 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//         <div className="flex items-center">
//           <Users className="w-8 h-8 text-blue-600 mr-3" />
//           <div>
//             <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalSubscriptions}</h3>
//             <p className={`text-sm ${themeClasses.text.secondary}`}>Total Subscriptions</p>
//           </div>
//         </div>
//       </div>
      
//       <div className={`p-4 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//         <div className="flex items-center">
//           <Activity className="w-8 h-8 text-green-600 mr-3" />
//           <div>
//             <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeSubscriptions}</h3>
//             <p className={`text-sm ${themeClasses.text.secondary}`}>Active</p>
//           </div>
//         </div>
//       </div>
      
//       <div className={`p-4 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//         <div className="flex items-center">
//           <Clock className="w-8 h-8 text-yellow-600 mr-3" />
//           <div>
//             <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pendingActivations}</h3>
//             <p className={`text-sm ${themeClasses.text.secondary}`}>Pending Activation</p>
//           </div>
//         </div>
//       </div>
      
//       <div className={`p-4 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//         <div className="flex items-center">
//           <AlertTriangle className="w-8 h-8 text-red-600 mr-3" />
//           <div>
//             <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.failedActivations}</h3>
//             <p className={`text-sm ${themeClasses.text.secondary}`}>Failed Activations</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );

//   const renderTabs = () => (
//     <div className={`p-2 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light} mb-6`}>
//       <div className="flex flex-wrap gap-1 lg:gap-2">
//         {tabs.map((tab) => {
//           const IconComponent = tab.icon;
//           return (
//             <button
//               key={tab.id}
//               onClick={() => setActiveTab(tab.id)}
//               className={`px-3 py-2 lg:px-4 lg:py-2 rounded-lg text-xs lg:text-sm font-medium transition-colors flex items-center gap-2 ${
//                 activeTab === tab.id 
//                   ? "bg-indigo-600 text-white" 
//                   : `${themeClasses.text.secondary} hover:${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`
//               }`}
//             >
//               <IconComponent className="w-3 h-3 lg:w-4 lg:h-4" />
//               <span>{tab.label}</span>
//             </button>
//           );
//         })}
//       </div>
//     </div>
//   );

//   const renderActiveTab = () => {
//     switch (activeTab) {
//       case "subscriptions":
//         return (
//           <SubscriptionManagement
//             subscriptions={subscriptions}
//             plans={plans}
//             routers={routers}
//             onRefresh={fetchSubscriptions}
//             theme={theme}
//           />
//         );
//       case "activation":
//         return (
//           <ActivationService
//             subscriptions={subscriptions}
//             onRefresh={fetchSubscriptions}
//             theme={theme}
//           />
//         );
//       case "compatibility":
//         return (
//           <RouterCompatibility
//             plans={plans}
//             routers={routers}
//             theme={theme}
//           />
//         );
//       case "bulk":
//         return (
//           <BulkOperations
//             subscriptions={subscriptions}
//             plans={plans}
//             onRefresh={fetchSubscriptions}
//             theme={theme}
//           />
//         );
//       default:
//         return null;
//     }
//   };

//   return (
//     <div className={`min-h-screen p-3 sm:p-6 lg:p-8 transition-colors duration-300 ${themeClasses.bg.primary}`}>
//       <main className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
//         {/* Header */}
//         <div className="flex items-center justify-between">
//           <div className="flex-1 min-w-0">
//             <h1 className="text-lg sm:text-xl lg:text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
//               Service Operations
//             </h1>
//             <p className={`mt-1 lg:mt-2 text-sm lg:text-lg ${themeClasses.text.secondary}`}>
//               Manage subscriptions, activations, and service operations
//             </p>
//           </div>
          
//           <div className="flex items-center space-x-3">
//             <motion.button
//               onClick={fetchSubscriptions}
//               disabled={isLoading}
//               className={`px-4 py-2 rounded-lg flex items-center ${themeClasses.button.secondary}`}
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//             >
//               <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
//               Refresh
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

// export default ServiceOperations;









import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Users, Activity, RefreshCw, Play, Pause, Eye, Filter,
  BarChart3, Shield, Wifi, Cable, Clock, Check, X, AlertTriangle,
  Download, Upload, Search, Plus, Settings, Server, Network
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext"
import { getThemeClasses, EnhancedSelect, ConfirmationModal } from "../../components/ServiceManagement/Shared/components";
import { formatNumber, formatTime, formatBytes } from "../../components/ServiceManagement/Shared/utils";
import api from "../../api";

// Sub-components
import SubscriptionManagement from "./components/SubscriptionManagement";
import ActivationService from "./components/ActivationService";
import RouterCompatibility from "./components/RouterCompatibility";
import BulkOperations from "./components/BulkOperations";

const ServiceOperations = () => {
  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);
  const [activeTab, setActiveTab] = useState("subscriptions");
  const [subscriptions, setSubscriptions] = useState([]);
  const [plans, setPlans] = useState([]);
  const [routers, setRouters] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const stats = useMemo(() => {
    const total = subscriptions.length;
    const active = subscriptions.filter(sub => sub.status === 'active').length;
    const pending = subscriptions.filter(sub => 
      sub.status === 'active' && !sub.activation_successful && !sub.activation_requested
    ).length;
    const failed = subscriptions.filter(sub => 
      sub.activation_error && !sub.activation_successful
    ).length;

    return {
      totalSubscriptions: total,
      activeSubscriptions: active,
      pendingActivations: pending,
      failedActivations: failed
    };
  }, [subscriptions]);

  // Fetch data with error handling
  const fetchSubscriptions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get("/api/internet_plans/subscriptions/");
      setSubscriptions(response.data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      setError("Failed to load subscriptions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchPlans = useCallback(async () => {
    try {
      const response = await api.get("/api/internet_plans/");
      setPlans(response.data.results || response.data);
    } catch (error) {
      console.error("Error fetching plans:", error);
    }
  }, []);

  const fetchRouters = useCallback(async () => {
    try {
      const response = await api.get("/api/network_management/routers/");
      setRouters(response.data);
    } catch (error) {
      console.error("Error fetching routers:", error);
    }
  }, []);

  // Initial data load
  useEffect(() => {
    fetchSubscriptions();
    fetchPlans();
    fetchRouters();
  }, [fetchSubscriptions, fetchPlans, fetchRouters]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchSubscriptions();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchSubscriptions]);

  const tabs = [
    { id: "subscriptions", label: "Subscriptions", icon: Users, description: "Manage client subscriptions" },
    { id: "activation", label: "Activation Service", icon: Play, description: "Activate and manage services" },
    { id: "compatibility", label: "Router Compatibility", icon: Network, description: "Check plan-router compatibility" },
    { id: "bulk", label: "Bulk Operations", icon: RefreshCw, description: "Perform bulk actions" },
  ];

  const renderStatsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatsCard
        icon={Users}
        value={stats.totalSubscriptions}
        label="Total Subscriptions"
        color="blue"
        theme={theme}
      />
      <StatsCard
        icon={Activity}
        value={stats.activeSubscriptions}
        label="Active"
        color="green"
        theme={theme}
      />
      <StatsCard
        icon={Clock}
        value={stats.pendingActivations}
        label="Pending Activation"
        color="yellow"
        theme={theme}
      />
      <StatsCard
        icon={AlertTriangle}
        value={stats.failedActivations}
        label="Failed Activations"
        color="red"
        theme={theme}
      />
    </div>
  );

  const renderTabs = () => (
    <div className={`p-2 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light} mb-6`}>
      <div className="flex flex-wrap gap-1 lg:gap-2">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          return (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 lg:px-4 lg:py-2 rounded-lg text-xs lg:text-sm font-medium transition-colors flex items-center gap-2 ${
                activeTab === tab.id 
                  ? "bg-indigo-600 text-white shadow-md" 
                  : `${themeClasses.text.secondary} hover:${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <IconComponent className="w-3 h-3 lg:w-4 lg:h-4" />
              <span>{tab.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );

  const renderActiveTab = () => {
    const tabProps = {
      subscriptions,
      plans,
      routers,
      onRefresh: fetchSubscriptions,
      theme,
    };

    const components = {
      subscriptions: <SubscriptionManagement {...tabProps} />,
      activation: <ActivationService {...tabProps} />,
      compatibility: <RouterCompatibility {...tabProps} />,
      bulk: <BulkOperations {...tabProps} />,
    };

    return components[activeTab] || null;
  };

  return (
    <div className={`min-h-screen p-3 sm:p-6 lg:p-8 transition-colors duration-300 ${themeClasses.bg.primary}`}>
      <main className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
              Service Operations
            </h1>
            <p className={`mt-1 lg:mt-2 text-sm lg:text-lg ${themeClasses.text.secondary}`}>
              Manage subscriptions, activations, and service operations
            </p>
            {lastUpdated && (
              <p className={`text-xs mt-1 ${themeClasses.text.tertiary}`}>
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            {error && (
              <div className="text-red-600 text-sm bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-lg">
                {error}
              </div>
            )}
            <motion.button
              onClick={fetchSubscriptions}
              disabled={isLoading}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                isLoading ? 'bg-gray-400 cursor-not-allowed' : themeClasses.button.secondary
              }`}
              whileHover={{ scale: isLoading ? 1 : 1.05 }}
              whileTap={{ scale: isLoading ? 1 : 0.95 }}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </motion.button>
          </div>
        </div>

        {/* Stats Cards */}
        {renderStatsCards()}

        {/* Tabs */}
        {renderTabs()}

        {/* Active Tab Content */}
        {renderActiveTab()}
      </main>
    </div>
  );
};

// Stats Card Component
const StatsCard = ({ icon: Icon, value, label, color, theme }) => {
  const colorClasses = {
    blue: { icon: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
    green: { icon: "text-green-600", bg: "bg-green-50 dark:bg-green-900/20" },
    yellow: { icon: "text-yellow-600", bg: "bg-yellow-50 dark:bg-yellow-900/20" },
    red: { icon: "text-red-600", bg: "bg-red-50 dark:bg-red-900/20" },
  };

  const themeClasses = getThemeClasses(theme);
  const colorConfig = colorClasses[color] || colorClasses.blue;

  return (
    <motion.div
      className={`p-4 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light} ${colorConfig.bg}`}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
    >
      <div className="flex items-center">
        <div className={`p-2 rounded-lg ${colorConfig.bg}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="ml-3">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{value}</h3>
          <p className={`text-sm ${themeClasses.text.secondary}`}>{label}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default ServiceOperations;