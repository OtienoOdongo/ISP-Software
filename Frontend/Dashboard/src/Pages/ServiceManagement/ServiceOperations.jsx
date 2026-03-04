


// // src/Pages/ServiceManagement/ServiceOperations.jsx
// import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import {
//   Users, Activity, RefreshCw, Play, Clock, Check, AlertTriangle,
//   Network, Terminal, FileText, Zap, Star as StarIcon,
//   BarChart3, Sun, Moon
// } from 'lucide-react';
// import { useTheme } from '../../context/ThemeContext';
// import { getThemeClasses, EnhancedSelect } from '../../components/ServiceManagement/Shared/components';
// import { API_ENDPOINTS, REFRESH_INTERVALS } from './components/constants'
// import { useApi } from './components/hooks/useApi'
// import { useWebSocket } from './components/hooks/useWebSocket'
// import { useNotification } from './components/hooks/useNotification'
// import { ErrorBoundary } from './components/common/ErrorBoundary';
// import { LoadingSpinner } from './components/common/LoadingSpinner';
// import { NotificationToast } from './components/common/NotificationToast';

// // Lazy load components for better performance
// const SubscriptionManagement = lazy(() => import('./components/SubscriptionManagement'));
// const ActivationService = lazy(() => import('./components/ActivationService'));
// const ClientOperations = lazy(() => import('./components/ClientOperations'));
// const RouterCompatibility = lazy(() => import('./components/RouterCompatibility'));
// const BulkOperations = lazy(() => import('./components/BulkOperations'));
// const SystemMonitoring = lazy(() => import('./components/SystemMonitoring'));
// const OperationLogs = lazy(() => import('./components/OperationLogs'));

// const StatsCard = React.lazy(() => import('./components/StatsCard'));

// const ServiceOperations = () => {
//   const { theme, toggleTheme } = useTheme();
//   const themeClasses = getThemeClasses(theme);
//   const { addNotification, notifications, removeNotification } = useNotification();

//   const [activeTab, setActiveTab] = useState('subscriptions');
//   const [lastUpdated, setLastUpdated] = useState(null);

//   // API hooks with caching
//   const { 
//     data: subscriptions, 
//     loading: subsLoading, 
//     error: subsError,
//     fetchData: fetchSubscriptions,
//   } = useApi(API_ENDPOINTS.SUBSCRIPTIONS, { cacheKey: 'subscriptions' });

//   const { 
//     data: plans, 
//     fetchData: fetchPlans,
//   } = useApi(API_ENDPOINTS.INTERNET_PLANS, { cacheKey: 'plans' });

//   const { 
//     data: routers, 
//     fetchData: fetchRouters,
//   } = useApi(API_ENDPOINTS.NETWORK_ROUTERS, { cacheKey: 'routers' });

//   const { 
//     data: queueStats, 
//     fetchData: fetchQueueStats,
//   } = useApi(API_ENDPOINTS.ACTIVATION_STATS, { cacheKey: 'queueStats' });

//   const { 
//     data: operationStats, 
//     fetchData: fetchOperationStats,
//   } = useApi(API_ENDPOINTS.OPERATION_STATS, { cacheKey: 'operationStats' });

//   // WebSocket for real-time updates
//   const { lastMessage: wsMessage } = useWebSocket('ws://localhost:8000/ws/subscriptions/', {
//     onMessage: (data) => {
//       if (data.type === 'subscription_update') {
//         fetchSubscriptions();
//         addNotification({
//           type: 'info',
//           message: `Subscription ${data.subscription_id} updated`,
//         });
//       } else if (data.type === 'activation_update') {
//         fetchQueueStats();
//       }
//     },
//   });

//   // Computed stats with memoization
//   const stats = useMemo(() => {
//     const subs = subscriptions || [];
//     return {
//       total: subs.length,
//       active: subs.filter(s => s.status === 'active').length,
//       pending: subs.filter(s => ['pending', 'processing'].includes(s.status)).length,
//       failed: subs.filter(s => s.status === 'failed' || s.activation_failed).length,
//       processing: subs.filter(s => s.status === 'processing').length,
//       avgRating: subs.length > 0 
//         ? (subs.reduce((sum, s) => sum + (s.rating || 0), 0) / subs.length).toFixed(1)
//         : 0,
//     };
//   }, [subscriptions]);

//   // Refresh all data
//   const refreshAll = useCallback(async () => {
//     try {
//       await Promise.all([
//         fetchSubscriptions(),
//         fetchPlans(),
//         fetchRouters(),
//         fetchQueueStats(),
//         fetchOperationStats(),
//       ]);
//       setLastUpdated(new Date());
//       addNotification({ type: 'success', message: 'Data refreshed successfully' });
//     } catch (error) {
//       addNotification({ type: 'error', message: 'Failed to refresh data' });
//     }
//   }, [fetchSubscriptions, fetchPlans, fetchRouters, fetchQueueStats, fetchOperationStats, addNotification]);

//   // Initial load
//   useEffect(() => {
//     refreshAll();
//   }, []); // eslint-disable-line react-hooks/exhaustive-deps

//   // Auto-refresh
//   useEffect(() => {
//     const interval = setInterval(() => {
//       fetchSubscriptions();
//       fetchQueueStats();
//     }, REFRESH_INTERVALS.SUBSCRIPTIONS);

//     return () => clearInterval(interval);
//   }, [fetchSubscriptions, fetchQueueStats]);

//   const tabs = useMemo(() => [
//     { id: 'subscriptions', label: 'Subscriptions', icon: Users, component: SubscriptionManagement },
//     { id: 'activation', label: 'Activation', icon: Play, component: ActivationService },
//     { id: 'client_ops', label: 'Client Ops', icon: FileText, component: ClientOperations },
//     { id: 'compatibility', label: 'Compatibility', icon: Network, component: RouterCompatibility },
//     { id: 'bulk', label: 'Bulk Actions', icon: RefreshCw, component: BulkOperations },
//     { id: 'monitoring', label: 'Monitoring', icon: Activity, component: SystemMonitoring },
//     { id: 'logs', label: 'Logs', icon: Terminal, component: OperationLogs },
//     { id: 'stats', label: 'Statistics', icon: BarChart3, component: SystemMonitoring },
//   ], []);

//   // Options for EnhancedSelect in mobile view
//   const tabOptions = useMemo(() => tabs.map(tab => ({
//     value: tab.id,
//     label: tab.label
//   })), [tabs]);

//   const ActiveComponent = tabs.find(t => t.id === activeTab)?.component || tabs[0].component;

//   const commonProps = {
//     subscriptions: subscriptions || [],
//     plans: plans || [],
//     routers: routers || [],
//     onRefresh: fetchSubscriptions,
//     theme,
//     queueStats,
//     operationStats,
//     addNotification,
//   };

//   return (
//     <ErrorBoundary>
//       <div className={`min-h-screen ${themeClasses.bg.primary}`}>
//         {/* Notifications */}
//         <NotificationToast 
//           notifications={notifications} 
//           onRemove={removeNotification} 
//         />

//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
//           {/* Header */}
//           <div className={`rounded-xl ${themeClasses.bg.card} border ${themeClasses.border.light} p-4 sm:p-6 mb-6`}>
//             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//               <div className="flex-1">
//                 <h1 className={`text-2xl sm:text-3xl font-bold ${themeClasses.text.primary}`}>Service Operations</h1>
//                 <p className={`text-sm ${themeClasses.text.secondary} mt-1`}>
//                   Manage subscriptions, activations, and system operations
//                 </p>
//                 {lastUpdated && (
//                   <p className={`text-xs ${themeClasses.text.tertiary} mt-2`}>
//                     Last updated: {lastUpdated.toLocaleTimeString()}
//                   </p>
//                 )}
//               </div>

//               <div className="flex items-center gap-3 w-full sm:w-auto">
//                 {/* Refresh Button */}
//                 <motion.button
//                   onClick={refreshAll}
//                   disabled={subsLoading}
//                   className={`px-5 py-2 rounded-lg flex items-center justify-center gap-2 font-medium
//                     ${subsLoading 
//                       ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed' 
//                       : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow-md'}`}
//                   whileHover={!subsLoading ? { scale: 1.05 } : {}}
//                   whileTap={!subsLoading ? { scale: 0.95 } : {}}
//                 >
//                   <RefreshCw className={`w-4 h-4 ${subsLoading ? 'animate-spin' : ''}`} />
//                   <span className="hidden sm:inline">{subsLoading ? 'Refreshing...' : 'Refresh'}</span>
//                 </motion.button>

//                 {/* Theme Toggle */}
//                 <motion.button
//                   onClick={toggleTheme}
//                   className={`p-2 rounded-lg ${themeClasses.bg.secondary} border ${themeClasses.border.light} hover:shadow-md`}
//                   whileHover={{ scale: 1.05 }}
//                   whileTap={{ scale: 0.95 }}
//                 >
//                   {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
//                 </motion.button>
//               </div>
//             </div>
//           </div>

//           {/* Error Display */}
//           <AnimatePresence>
//             {subsError && (
//               <motion.div
//                 initial={{ opacity: 0, y: -20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 exit={{ opacity: 0, y: -20 }}
//                 className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl shadow-sm"
//               >
//                 <p className="text-red-600 dark:text-red-400">{subsError}</p>
//               </motion.div>
//             )}
//           </AnimatePresence>

//           {/* Stats Section */}
//           <div className={`rounded-xl ${themeClasses.bg.card} border ${themeClasses.border.light} p-4 sm:p-6 mb-6`}>
//             <h2 className={`text-xl font-semibold mb-4 ${themeClasses.text.primary}`}>Key Statistics</h2>
//             <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
//               <Suspense fallback={<div className="min-h-[120px] bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />}>
//                 <StatsCard icon={Users} value={stats.total} label="Total Subscriptions" color="blue" />
//                 <StatsCard icon={Check} value={stats.active} label="Active Subscriptions" color="green" />
//                 <StatsCard icon={Clock} value={stats.pending} label="Pending" color="yellow" />
//                 <StatsCard icon={AlertTriangle} value={stats.failed} label="Failed" color="red" />
//                 <StatsCard icon={Zap} value={stats.processing} label="Processing" color="orange" />
//                 <StatsCard icon={Play} value={queueStats?.statistics?.queue?.pending || 0} label="In Queue" color="purple" />
//                 <StatsCard icon={Activity} value={operationStats?.statistics?.recent_activity?.total || 0} label="Operations per Hour" color="indigo" />
//                 <StatsCard icon={StarIcon} value={`${stats.avgRating} ⭐`} label="Average Rating" color="amber" />
//               </Suspense>
//             </div>
//           </div>

//           {/* Tabs - Desktop */}
//           <div className={`hidden sm:block rounded-xl ${themeClasses.bg.card} border ${themeClasses.border.light} p-2 mb-6`}>
//             <div className="flex flex-wrap gap-2">
//               {tabs.map((tab) => {
//                 const Icon = tab.icon;
//                 const isActive = activeTab === tab.id;
                
//                 return (
//                   <motion.button
//                     key={tab.id}
//                     onClick={() => setActiveTab(tab.id)}
//                     className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all shadow-sm
//                       ${isActive
//                         ? 'bg-indigo-600 text-white shadow-md'
//                         : `${themeClasses.text.secondary} hover:bg-gray-100 dark:hover:bg-gray-800 hover:shadow-md`}`}
//                     whileHover={{ scale: 1.03 }}
//                     whileTap={{ scale: 0.98 }}
//                   >
//                     <Icon className="w-4 h-4" />
//                     {tab.label}
//                   </motion.button>
//                 );
//               })}
//             </div>
//           </div>

//           {/* Tabs - Mobile with EnhancedSelect */}
//           <div className="sm:hidden mb-6">
//             <EnhancedSelect
//               value={activeTab}
//               onChange={setActiveTab}
//               options={tabOptions}
//               placeholder="Select section"
//               theme={theme}
//             />
//           </div>

//           {/* Content */}
//           <div className={`rounded-xl ${themeClasses.bg.card} border ${themeClasses.border.light} p-4 sm:p-6`}>
//             {subsLoading && !subscriptions?.length ? (
//               <LoadingSpinner />
//             ) : (
//               <ErrorBoundary key={activeTab}>
//                 <Suspense fallback={<LoadingSpinner />}>
//                   <ActiveComponent {...commonProps} />
//                 </Suspense>
//               </ErrorBoundary>
//             )}
//           </div>
//         </div>
//       </div>
//     </ErrorBoundary>
//   );
// };

// export default ServiceOperations;






// src/Pages/ServiceManagement/ServiceOperations.jsx
import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Activity, RefreshCw, Play, Clock, Check, AlertTriangle,
  Network, Terminal, FileText, Zap, Star as StarIcon,
  BarChart3, Sun, Moon
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { getThemeClasses, EnhancedSelect } from '../../components/ServiceManagement/Shared/components';
import { API_ENDPOINTS, REFRESH_INTERVALS } from './components/constants'
import { useApi } from './components/hooks/useApi'
import { useWebSocket } from './components/hooks/useWebSocket'
import { useNotification } from './components/hooks/useNotification'
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { NotificationToast } from './components/common/NotificationToast';

// Lazy load components for better performance
const SubscriptionManagement = lazy(() => import('./components/SubscriptionManagement'));
const ActivationService = lazy(() => import('./components/ActivationService'));
const ClientOperations = lazy(() => import('./components/ClientOperations'));
const RouterCompatibility = lazy(() => import('./components/RouterCompatibility'));
const BulkOperations = lazy(() => import('./components/BulkOperations'));
const SystemMonitoring = lazy(() => import('./components/SystemMonitoring'));
const OperationLogs = lazy(() => import('./components/OperationLogs'));

const StatsCard = React.lazy(() => import('./components/StatsCard'));

const ServiceOperations = () => {
  const { theme, toggleTheme } = useTheme();
  const themeClasses = getThemeClasses(theme);
  const { addNotification, notifications, removeNotification } = useNotification();

  const [activeTab, setActiveTab] = useState('subscriptions');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // API hooks with caching
  const { 
    data: subscriptions, 
    loading: subsLoading, 
    error: subsError,
    fetchData: fetchSubscriptions,
  } = useApi(API_ENDPOINTS.SUBSCRIPTIONS, { cacheKey: 'subscriptions' });

  const { 
    data: plans, 
    fetchData: fetchPlans,
  } = useApi(API_ENDPOINTS.INTERNET_PLANS, { cacheKey: 'plans' });

  const { 
    data: routers, 
    fetchData: fetchRouters,
  } = useApi(API_ENDPOINTS.NETWORK_ROUTERS, { cacheKey: 'routers' });

  const { 
    data: queueStats, 
    fetchData: fetchQueueStats,
  } = useApi(API_ENDPOINTS.ACTIVATION_STATS, { cacheKey: 'queueStats' });

  const { 
    data: operationStats, 
    fetchData: fetchOperationStats,
  } = useApi(API_ENDPOINTS.OPERATION_STATS, { cacheKey: 'operationStats' });

  // WebSocket for real-time updates
  const { lastMessage: wsMessage } = useWebSocket('ws://localhost:8000/ws/subscriptions/', {
    onMessage: (data) => {
      if (data.type === 'subscription_update') {
        fetchSubscriptions();
        addNotification({
          type: 'info',
          message: `Subscription ${data.subscription_id} updated`,
        });
      } else if (data.type === 'activation_update') {
        fetchQueueStats();
      }
    },
  });

  // Computed stats with memoization
  const stats = useMemo(() => {
    const subs = subscriptions || [];
    return {
      total: subs.length,
      active: subs.filter(s => s.status === 'active').length,
      pending: subs.filter(s => ['pending', 'processing'].includes(s.status)).length,
      failed: subs.filter(s => s.status === 'failed' || s.activation_failed).length,
      processing: subs.filter(s => s.status === 'processing').length,
      avgRating: subs.length > 0 
        ? (subs.reduce((sum, s) => sum + (s.rating || 0), 0) / subs.length).toFixed(1)
        : 0,
    };
  }, [subscriptions]);

  // Refresh all data
  const refreshAll = useCallback(async () => {
    try {
      await Promise.all([
        fetchSubscriptions(),
        fetchPlans(),
        fetchRouters(),
        fetchQueueStats(),
        fetchOperationStats(),
      ]);
      setLastUpdated(new Date());
      addNotification({ type: 'success', message: 'Data refreshed successfully' });
    } catch (error) {
      addNotification({ type: 'error', message: 'Failed to refresh data' });
    }
  }, [fetchSubscriptions, fetchPlans, fetchRouters, fetchQueueStats, fetchOperationStats, addNotification]);

  // Initial load
  useEffect(() => {
    refreshAll();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-refresh
  useEffect(() => {
    const interval = setInterval(() => {
      fetchSubscriptions();
      fetchQueueStats();
    }, REFRESH_INTERVALS.SUBSCRIPTIONS);

    return () => clearInterval(interval);
  }, [fetchSubscriptions, fetchQueueStats]);

  const tabs = useMemo(() => [
    { id: 'subscriptions', label: 'Subscriptions', icon: Users, component: SubscriptionManagement },
    { id: 'activation', label: 'Activation', icon: Play, component: ActivationService },
    { id: 'client_ops', label: 'Client Ops', icon: FileText, component: ClientOperations },
    { id: 'compatibility', label: 'Compatibility', icon: Network, component: RouterCompatibility },
    { id: 'bulk', label: 'Bulk Actions', icon: RefreshCw, component: BulkOperations },
    { id: 'monitoring', label: 'Monitoring', icon: Activity, component: SystemMonitoring },
    { id: 'logs', label: 'Logs', icon: Terminal, component: OperationLogs },
    { id: 'stats', label: 'Statistics', icon: BarChart3, component: SystemMonitoring },
  ], []);

  // Options for EnhancedSelect in mobile view
  const tabOptions = useMemo(() => tabs.map(tab => ({
    value: tab.id,
    label: tab.label
  })), [tabs]);

  const ActiveComponent = tabs.find(t => t.id === activeTab)?.component || tabs[0].component;

  const commonProps = {
    subscriptions: subscriptions || [],
    plans: plans || [],
    routers: routers || [],
    onRefresh: fetchSubscriptions,
    theme,
    queueStats,
    operationStats,
    addNotification,
  };

  // Responsive grid classes for stats
  const statsGridClasses = "grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3 sm:gap-4";

  return (
    <ErrorBoundary>
      <div className={`min-h-screen ${themeClasses.bg.primary} overflow-x-hidden`}>
        {/* Notifications - Responsive positioning */}
        <NotificationToast 
          notifications={notifications} 
          onRemove={removeNotification} 
        />

        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6 lg:py-8">
          {/* Header - Responsive layout */}
          <div className={`rounded-xl ${themeClasses.bg.card} border ${themeClasses.border.light} p-3 sm:p-4 md:p-6 mb-4 sm:mb-6`}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
              <div className="w-full sm:w-auto flex-1 min-w-0">
                <h1 className={`text-xl sm:text-2xl md:text-3xl font-bold ${themeClasses.text.primary} truncate`}>
                  Service Operations
                </h1>
                <p className={`text-xs sm:text-sm ${themeClasses.text.secondary} mt-1 line-clamp-2 sm:line-clamp-1`}>
                  Manage subscriptions, activations, and system operations
                </p>
                {lastUpdated && (
                  <p className={`text-xs ${themeClasses.text.tertiary} mt-2`}>
                    Last updated: {lastUpdated.toLocaleTimeString()}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                {/* Refresh Button - Responsive sizing */}
                <motion.button
                  onClick={refreshAll}
                  disabled={subsLoading}
                  className={`flex-1 sm:flex-none px-3 sm:px-4 md:px-5 py-2 rounded-lg flex items-center justify-center gap-1 sm:gap-2 font-medium text-sm sm:text-base
                    ${subsLoading 
                      ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed' 
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow-md'}`}
                  whileHover={!subsLoading ? { scale: 1.02 } : {}}
                  whileTap={!subsLoading ? { scale: 0.98 } : {}}
                >
                  <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 ${subsLoading ? 'animate-spin' : ''}`} />
                  <span className="inline xs:hidden sm:inline">
                    {subsLoading ? '...' : 'Refresh'}
                  </span>
                  <span className="hidden sm:inline">
                    {subsLoading ? 'Refreshing...' : 'Refresh'}
                  </span>
                </motion.button>

                {/* Theme Toggle */}
                <motion.button
                  onClick={toggleTheme}
                  className={`p-1.5 sm:p-2 rounded-lg ${themeClasses.bg.secondary} border ${themeClasses.border.light} hover:shadow-md flex-shrink-0`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {theme === 'dark' ? 
                    <Sun className="w-4 h-4 sm:w-5 sm:h-5" /> : 
                    <Moon className="w-4 h-4 sm:w-5 sm:h-5" />
                  }
                </motion.button>
              </div>
            </div>
          </div>

          {/* Error Display */}
          <AnimatePresence>
            {subsError && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl shadow-sm"
              >
                <p className="text-sm sm:text-base text-red-600 dark:text-red-400 break-words">{subsError}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stats Section - Responsive grid */}
          <div className={`rounded-xl ${themeClasses.bg.card} border ${themeClasses.border.light} p-3 sm:p-4 md:p-6 mb-4 sm:mb-6`}>
            <h2 className={`text-lg sm:text-xl font-semibold mb-3 sm:mb-4 ${themeClasses.text.primary}`}>
              Key Statistics
            </h2>
            <div className={statsGridClasses}>
              <Suspense fallback={
                <div className="col-span-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="min-h-[100px] sm:min-h-[120px] bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
                  ))}
                </div>
              }>
                <StatsCard icon={Users} value={stats.total} label="Total" color="blue" />
                <StatsCard icon={Check} value={stats.active} label="Active" color="green" />
                <StatsCard icon={Clock} value={stats.pending} label="Pending" color="yellow" />
                <StatsCard icon={AlertTriangle} value={stats.failed} label="Failed" color="red" />
                <StatsCard icon={Zap} value={stats.processing} label="Processing" color="orange" />
                <StatsCard icon={Play} value={queueStats?.statistics?.queue?.pending || 0} label="In Queue" color="purple" />
                <StatsCard icon={Activity} value={operationStats?.statistics?.recent_activity?.total || 0} label="Ops/Hour" color="indigo" />
                <StatsCard icon={StarIcon} value={`${stats.avgRating} ⭐`} label="Avg Rating" color="amber" />
              </Suspense>
            </div>
          </div>

          {/* Tabs - Desktop/Tablet horizontal scroll */}
          <div className="hidden sm:block mb-6 overflow-x-auto">
            <div className={`inline-flex min-w-full rounded-xl ${themeClasses.bg.card} border ${themeClasses.border.light} p-1.5 sm:p-2`}>
              <div className="flex flex-nowrap gap-1 sm:gap-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  
                  return (
                    <motion.button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium whitespace-nowrap transition-all shadow-sm
                        ${isActive
                          ? 'bg-indigo-600 text-white shadow-md'
                          : `${themeClasses.text.secondary} hover:bg-gray-100 dark:hover:bg-gray-800 hover:shadow-md`}`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Icon className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span>{tab.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Tabs - Mobile with EnhancedSelect */}
          <div className="sm:hidden mb-4">
            <EnhancedSelect
              value={activeTab}
              onChange={(value) => {
                setActiveTab(value);
                setIsMobileMenuOpen(false);
              }}
              options={tabOptions}
              placeholder="Select section"
              theme={theme}
            />
          </div>

          {/* Content - Responsive padding */}
          <div className={`rounded-xl ${themeClasses.bg.card} border ${themeClasses.border.light} p-3 sm:p-4 md:p-6 overflow-x-auto`}>
            {subsLoading && !subscriptions?.length ? (
              <div className="flex items-center justify-center min-h-[300px] sm:min-h-[400px]">
                <LoadingSpinner />
              </div>
            ) : (
              <ErrorBoundary key={activeTab}>
                <Suspense fallback={
                  <div className="flex items-center justify-center min-h-[300px] sm:min-h-[400px]">
                    <LoadingSpinner />
                  </div>
                }>
                  <div className="w-full overflow-x-auto">
                    <ActiveComponent {...commonProps} />
                  </div>
                </Suspense>
              </ErrorBoundary>
            )}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default ServiceOperations;