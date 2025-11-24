




// // src/Pages/NetworkManagement/components/Monitoring/PerformanceMetrics.jsx
// import React, { useEffect, useState } from "react";
// import { TrendingUp, TrendingDown, Minus, Cpu, HardDrive, Network, Users, RefreshCw, AlertCircle, Database, Wifi, Shield } from "lucide-react";
// import { getThemeClasses } from "../../../../components/ServiceManagement/Shared/components";
// import { getHealthColor } from "../../utils/networkUtils";
// import { useNetworkData } from "../hooks/useNetworkData";
// import CustomButton from "../Common/CustomButton";

// const PerformanceMetrics = ({ 
//   activeRouter,
//   theme = "light" 
// }) => {
//   const themeClasses = getThemeClasses(theme);
//   const { 
//     routerStats, 
//     historicalData, 
//     isLoading, 
//     error, 
//     refreshData,
//     webSocketConnected 
//   } = useNetworkData([], activeRouter?.id);

//   const [localLoading, setLocalLoading] = useState(false);

//   const calculateTrend = (current, previous, isPositiveMetric = false) => {
//     if (!previous || previous === 0 || !current) 
//       return { direction: 'neutral', value: '0%', change: 0 };
    
//     const change = ((current - previous) / previous) * 100;
    
//     // For positive metrics (throughput, clients), up is good
//     // For negative metrics (CPU, memory), up is bad
//     let direction = 'neutral';
//     if (Math.abs(change) > 5) {
//       if (isPositiveMetric) {
//         direction = change > 0 ? 'up' : 'down';
//       } else {
//         direction = change > 0 ? 'down' : 'up';
//       }
//     }
    
//     return {
//       direction,
//       value: `${change > 0 ? '+' : ''}${change.toFixed(1)}%`,
//       change: change,
//       icon: direction === 'up' ? <TrendingUp className="w-4 h-4" /> : 
//              direction === 'down' ? <TrendingDown className="w-4 h-4" /> : 
//              <Minus className="w-4 h-4" />
//     };
//   };

//   const getTrendColor = (direction) => {
//     switch (direction) {
//       case 'up':
//         return 'text-green-500';
//       case 'down':
//         return 'text-red-500';
//       default:
//         return 'text-gray-500';
//     }
//   };

//   // Extract current and historical data from backend response
//   const currentStats = routerStats?.latest || {};
//   const history = routerStats?.history || {};
  
//   // Calculate previous values from historical data
//   const getPreviousValue = (metricKey) => {
//     if (!history[metricKey] || history[metricKey].length < 2) return 0;
//     return history[metricKey][history[metricKey].length - 2] || 0;
//   };

//   // Enhanced metrics from backend
//   const metrics = [
//     {
//       name: "CPU Usage",
//       key: "cpu",
//       current: currentStats.cpu || currentStats.cpu_load || 0,
//       previous: getPreviousValue("cpu") || getPreviousValue("cpu_load") || 0,
//       icon: <Cpu className="w-5 h-5" />,
//       color: "blue",
//       unit: "%",
//       isPositiveMetric: false // Lower is better
//     },
//     {
//       name: "Memory Usage",
//       key: "memory",
//       current: currentStats.memory || currentStats.memory_usage || 0,
//       previous: getPreviousValue("memory") || getPreviousValue("memory_usage") || 0,
//       icon: <HardDrive className="w-5 h-5" />,
//       color: "purple",
//       unit: "%",
//       isPositiveMetric: false // Lower is better
//     },
//     {
//       name: "Connected Clients",
//       key: "clients",
//       current: currentStats.clients || currentStats.total_sessions || 0,
//       previous: getPreviousValue("clients") || getPreviousValue("total_sessions") || 0,
//       icon: <Users className="w-5 h-5" />,
//       color: "green",
//       unit: "",
//       isPositiveMetric: true // Higher is better (more clients)
//     },
//     {
//       name: "Throughput",
//       key: "throughput",
//       current: currentStats.throughput || 0,
//       previous: getPreviousValue("throughput") || 0,
//       icon: <Network className="w-5 h-5" />,
//       color: "orange",
//       unit: "Mbps",
//       isPositiveMetric: true // Higher is better
//     },
//     {
//       name: "Hotspot Users",
//       key: "hotspot_users",
//       current: currentStats.hotspot_sessions || 0,
//       previous: getPreviousValue("hotspot_sessions") || 0,
//       icon: <Wifi className="w-5 h-5" />,
//       color: "blue",
//       unit: "",
//       isPositiveMetric: true // Higher is better
//     },
//     {
//       name: "PPPoE Users",
//       key: "pppoe_users",
//       current: currentStats.pppoe_sessions || 0,
//       previous: getPreviousValue("pppoe_sessions") || 0,
//       icon: <Shield className="w-5 h-5" />,
//       color: "green",
//       unit: "",
//       isPositiveMetric: true // Higher is better
//     }
//   ];

//   const handleRefresh = async () => {
//     setLocalLoading(true);
//     try {
//       await refreshData();
//     } catch (err) {
//       console.error('Error refreshing performance metrics:', err);
//     } finally {
//       setLocalLoading(false);
//     }
//   };

//   if (error && !activeRouter) {
//     return (
//       <div className={`p-6 rounded-xl border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//         <div className="text-center py-8">
//           <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
//           <h3 className={`text-lg font-semibold mb-2 ${themeClasses.text.primary}`}>
//             Connection Error
//           </h3>
//           <p className={`text-sm ${themeClasses.text.tertiary} mb-4`}>
//             {error}
//           </p>
//           <CustomButton
//             onClick={handleRefresh}
//             icon={<RefreshCw className="w-4 h-4" />}
//             label="Retry"
//             variant="primary"
//             size="sm"
//             theme={theme}
//           />
//         </div>
//       </div>
//     );
//   }

//   if (!activeRouter) {
//     return (
//       <div className={`p-6 rounded-xl border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//         <div className="text-center py-8">
//           <Network className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//           <h3 className={`text-lg font-semibold mb-2 ${themeClasses.text.primary}`}>
//             Select a Router
//           </h3>
//           <p className={`text-sm ${themeClasses.text.tertiary}`}>
//             Choose a router from the list to view performance metrics
//           </p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className={`p-6 rounded-xl shadow-lg backdrop-blur-md transition-all duration-300 border ${
//       themeClasses.bg.card
//     } ${themeClasses.border.light}`}>
      
//       {/* Header */}
//       <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 gap-4">
//         <div>
//           <h3 className={`text-lg font-semibold flex items-center ${themeClasses.text.primary}`}>
//             <TrendingUp className="w-5 h-5 mr-2" />
//             Performance Trends
//             {activeRouter && (
//               <span className={`text-sm font-normal ml-2 ${themeClasses.text.tertiary}`}>
//                 - {activeRouter.name}
//               </span>
//             )}
//           </h3>
//           <div className="flex items-center space-x-2 mt-1">
//             <div className={`w-2 h-2 rounded-full ${
//               webSocketConnected ? 'bg-green-500' : 'bg-yellow-500'
//             }`}></div>
//             <p className={`text-sm ${themeClasses.text.tertiary}`}>
//               {webSocketConnected ? 'Live Updates' : 'Connecting...'}
//             </p>
//             {currentStats.timestamp && (
//               <span className={`text-xs ${themeClasses.text.tertiary}`}>
//                 • {new Date(currentStats.timestamp).toLocaleTimeString()}
//               </span>
//             )}
//           </div>
//         </div>
        
//         <CustomButton
//           onClick={handleRefresh}
//           icon={<RefreshCw className={`w-4 h-4 ${isLoading || localLoading ? 'animate-spin' : ''}`} />}
//           label="Refresh"
//           variant="secondary"
//           size="sm"
//           disabled={isLoading || localLoading}
//           theme={theme}
//         />
//       </div>

//       {error ? (
//         <div className={`p-4 rounded-lg border ${
//           theme === "dark" ? "bg-red-900/20 border-red-800" : "bg-red-50 border-red-200"
//         }`}>
//           <div className="flex items-center space-x-2">
//             <AlertCircle className="w-4 h-4 text-red-500" />
//             <p className={`text-sm ${themeClasses.text.primary}`}>
//               Error loading performance data: {error}
//             </p>
//           </div>
//         </div>
//       ) : (
//         <>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//             {metrics.map((metric, index) => {
//               const trend = calculateTrend(metric.current, metric.previous, metric.isPositiveMetric);
//               const trendColor = getTrendColor(trend.direction);
              
//               return (
//                 <div key={index} className={`p-4 rounded-lg ${
//                   theme === "dark" ? "bg-gray-700/50" : "bg-gray-50"
//                 }`}>
//                   <div className="flex items-center justify-between mb-2">
//                     <div className="flex items-center space-x-3">
//                       <div className={`p-2 rounded-full ${
//                         metric.color === 'blue' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
//                         metric.color === 'purple' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' :
//                         metric.color === 'green' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
//                         'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
//                       }`}>
//                         {metric.icon}
//                       </div>
//                       <div>
//                         <p className={`font-medium text-sm ${themeClasses.text.primary}`}>
//                           {metric.name}
//                         </p>
//                         <p className={`text-2xl font-bold ${
//                           metric.isPositiveMetric 
//                             ? getHealthColor(metric.current) 
//                             : getHealthColor(100 - metric.current)
//                         }`}>
//                           {metric.current || 0}{metric.unit ? ` ${metric.unit}` : ''}
//                         </p>
//                       </div>
//                     </div>
//                     <div className={`flex items-center space-x-1 ${trendColor}`}>
//                       {trend.icon}
//                       <span className="text-sm font-medium">{trend.value}</span>
//                     </div>
//                   </div>
                  
//                   {/* Progress Bar */}
//                   <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
//                     <div 
//                       className={`h-2 rounded-full ${
//                         metric.color === 'blue' ? 'bg-blue-500' :
//                         metric.color === 'purple' ? 'bg-purple-500' :
//                         metric.color === 'green' ? 'bg-green-500' :
//                         'bg-orange-500'
//                       }`}
//                       style={{ 
//                         width: `${Math.min(
//                           metric.key === 'throughput' ? (metric.current / 1000) * 100 : metric.current, 
//                           100
//                         )}%` 
//                       }}
//                     ></div>
//                   </div>

//                   {/* Historical context */}
//                   {metric.previous > 0 && (
//                     <p className={`text-xs mt-2 ${themeClasses.text.tertiary}`}>
//                       Previous: {metric.previous}{metric.unit ? ` ${metric.unit}` : ''}
//                     </p>
//                   )}
//                 </div>
//               );
//             })}
//           </div>

//           {/* Performance Summary */}
//           <div className={`mt-4 p-3 rounded-lg ${
//             theme === "dark" ? "bg-gray-700/50" : "bg-gray-100"
//           }`}>
//             <div className="flex items-center justify-between text-sm">
//               <span className={themeClasses.text.tertiary}>Overall Performance</span>
//               <span className={`font-medium ${
//                 metrics.filter(m => !m.isPositiveMetric).every(m => m.current < 80) && 
//                 metrics.filter(m => m.isPositiveMetric).every(m => m.current > 0)
//                   ? 'text-green-500' :
//                 metrics.filter(m => !m.isPositiveMetric).some(m => m.current >= 90) 
//                   ? 'text-red-500' : 'text-yellow-500'
//               }`}>
//                 {metrics.filter(m => !m.isPositiveMetric).every(m => m.current < 80) && 
//                  metrics.filter(m => m.isPositiveMetric).every(m => m.current > 0)
//                   ? 'Excellent' :
//                  metrics.filter(m => !m.isPositiveMetric).some(m => m.current >= 90) 
//                   ? 'Critical' : 'Good'}
//               </span>
//             </div>
//           </div>

//           {/* Configuration Status */}
//           {activeRouter.configuration_status && (
//             <div className={`mt-3 p-3 rounded-lg border ${
//               activeRouter.configuration_status === 'configured' 
//                 ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
//                 : activeRouter.configuration_status === 'partially_configured'
//                 ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'
//                 : 'bg-gray-50 border-gray-200 dark:bg-gray-700/50 dark:border-gray-600'
//             }`}>
//               <div className="flex items-center justify-between text-sm">
//                 <span className={themeClasses.text.primary}>Configuration Status</span>
//                 <span className={`font-medium ${
//                   activeRouter.configuration_status === 'configured' ? 'text-green-600' :
//                   activeRouter.configuration_status === 'partially_configured' ? 'text-yellow-600' :
//                   'text-gray-600'
//                 }`}>
//                   {activeRouter.configuration_status.charAt(0).toUpperCase() + activeRouter.configuration_status.slice(1)}
//                   {activeRouter.configuration_type && ` (${activeRouter.configuration_type.toUpperCase()})`}
//                 </span>
//               </div>
//             </div>
//           )}

//           {/* Data Source Info */}
//           <div className={`mt-3 text-xs ${themeClasses.text.tertiary}`}>
//             <p>
//               Data from: {activeRouter.type === "mikrotik" ? "RouterOS API" : 
//                          activeRouter.type === "ubiquiti" ? "UniFi Controller" : 
//                          "Router Management System"}
//             </p>
//             {routerStats?.latest?.timestamp && (
//               <p>Last updated: {new Date(routerStats.latest.timestamp).toLocaleTimeString()}</p>
//             )}
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default PerformanceMetrics;








// src/Pages/NetworkManagement/components/Monitoring/PerformanceMetrics.jsx
import React, { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Minus, Cpu, HardDrive, Network, Users, RefreshCw, AlertCircle, Database, Wifi, Shield } from "lucide-react";
import { getThemeClasses } from "../../../../components/ServiceManagement/Shared/components";
import { getHealthColor } from "../../utils/networkUtils";
import { useNetworkData } from "../hooks/useNetworkData";
import CustomButton from "../Common/CustomButton";

const PerformanceMetrics = ({ 
  activeRouter,
  theme = "light" 
}) => {
  const themeClasses = getThemeClasses(theme);
  const { 
    routerStats, 
    historicalData, 
    isLoading, 
    error, 
    refreshData,
    webSocketConnected 
  } = useNetworkData([], activeRouter?.id);

  const [localLoading, setLocalLoading] = useState(false);

  const calculateTrend = (current, previous, isPositiveMetric = false) => {
    if (!previous || previous === 0 || !current) 
      return { direction: 'neutral', value: '0%', change: 0 };
    
    const change = ((current - previous) / previous) * 100;
    
    // For positive metrics (throughput, clients), up is good
    // For negative metrics (CPU, memory), up is bad
    let direction = 'neutral';
    if (Math.abs(change) > 5) {
      if (isPositiveMetric) {
        direction = change > 0 ? 'up' : 'down';
      } else {
        direction = change > 0 ? 'down' : 'up';
      }
    }
    
    return {
      direction,
      value: `${change > 0 ? '+' : ''}${change.toFixed(1)}%`,
      change: change,
      icon: direction === 'up' ? <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" /> : 
             direction === 'down' ? <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4" /> : 
             <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
    };
  };

  const getTrendColor = (direction) => {
    switch (direction) {
      case 'up':
        return 'text-green-500';
      case 'down':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  // Extract current and historical data from backend response
  const currentStats = routerStats?.latest || {};
  const history = routerStats?.history || {};
  
  // Calculate previous values from historical data
  const getPreviousValue = (metricKey) => {
    if (!history[metricKey] || history[metricKey].length < 2) return 0;
    return history[metricKey][history[metricKey].length - 2] || 0;
  };

  // Enhanced metrics from backend
  const metrics = [
    {
      name: "CPU Usage",
      key: "cpu",
      current: currentStats.cpu || currentStats.cpu_load || 0,
      previous: getPreviousValue("cpu") || getPreviousValue("cpu_load") || 0,
      icon: <Cpu className="w-4 h-4 sm:w-5 sm:h-5" />,
      color: "blue",
      unit: "%",
      isPositiveMetric: false // Lower is better
    },
    {
      name: "Memory Usage",
      key: "memory",
      current: currentStats.memory || currentStats.memory_usage || 0,
      previous: getPreviousValue("memory") || getPreviousValue("memory_usage") || 0,
      icon: <HardDrive className="w-4 h-4 sm:w-5 sm:h-5" />,
      color: "purple",
      unit: "%",
      isPositiveMetric: false // Lower is better
    },
    {
      name: "Connected Clients",
      key: "clients",
      current: currentStats.clients || currentStats.total_sessions || 0,
      previous: getPreviousValue("clients") || getPreviousValue("total_sessions") || 0,
      icon: <Users className="w-4 h-4 sm:w-5 sm:h-5" />,
      color: "green",
      unit: "",
      isPositiveMetric: true // Higher is better (more clients)
    },
    {
      name: "Throughput",
      key: "throughput",
      current: currentStats.throughput || 0,
      previous: getPreviousValue("throughput") || 0,
      icon: <Network className="w-4 h-4 sm:w-5 sm:h-5" />,
      color: "orange",
      unit: "Mbps",
      isPositiveMetric: true // Higher is better
    },
    {
      name: "Hotspot Users",
      key: "hotspot_users",
      current: currentStats.hotspot_sessions || 0,
      previous: getPreviousValue("hotspot_sessions") || 0,
      icon: <Wifi className="w-4 h-4 sm:w-5 sm:h-5" />,
      color: "blue",
      unit: "",
      isPositiveMetric: true // Higher is better
    },
    {
      name: "PPPoE Users",
      key: "pppoe_users",
      current: currentStats.pppoe_sessions || 0,
      previous: getPreviousValue("pppoe_sessions") || 0,
      icon: <Shield className="w-4 h-4 sm:w-5 sm:h-5" />,
      color: "green",
      unit: "",
      isPositiveMetric: true // Higher is better
    }
  ];

  const handleRefresh = async () => {
    setLocalLoading(true);
    try {
      await refreshData();
    } catch (err) {
      console.error('Error refreshing performance metrics:', err);
    } finally {
      setLocalLoading(false);
    }
  };

  if (error && !activeRouter) {
    return (
      <div className={`p-4 sm:p-6 rounded-xl border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
        <div className="text-center py-6 sm:py-8">
          <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-red-500 mx-auto mb-3 sm:mb-4" />
          <h3 className={`text-base sm:text-lg font-semibold mb-2 ${themeClasses.text.primary}`}>
            Connection Error
          </h3>
          <p className={`text-xs sm:text-sm ${themeClasses.text.tertiary} mb-4`}>
            {error}
          </p>
          <CustomButton
            onClick={handleRefresh}
            icon={<RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />}
            label="Retry"
            variant="primary"
            size="sm"
            theme={theme}
          />
        </div>
      </div>
    );
  }

  if (!activeRouter) {
    return (
      <div className={`p-4 sm:p-6 rounded-xl border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
        <div className="text-center py-6 sm:py-8">
          <Network className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
          <h3 className={`text-base sm:text-lg font-semibold mb-2 ${themeClasses.text.primary}`}>
            Select a Router
          </h3>
          <p className={`text-xs sm:text-sm ${themeClasses.text.tertiary}`}>
            Choose a router from the list to view performance metrics
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 sm:p-6 rounded-xl shadow-lg backdrop-blur-md transition-all duration-300 border ${
      themeClasses.bg.card
    } ${themeClasses.border.light}`}>
      
      {/* Header - Improved responsive layout */}
      <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center mb-4 gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <h3 className={`text-lg sm:text-xl font-semibold flex items-center ${themeClasses.text.primary} truncate`}>
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 mr-2 flex-shrink-0" />
            Performance Trends
            {activeRouter && (
              <span className={`text-sm font-normal ml-2 ${themeClasses.text.tertiary} hidden sm:inline truncate`}>
                - {activeRouter.name}
              </span>
            )}
          </h3>
          {activeRouter && (
            <p className={`text-xs sm:text-sm ${themeClasses.text.tertiary} sm:hidden truncate mt-1`}>
              {activeRouter.name}
            </p>
          )}
          <div className="flex items-center space-x-2 mt-1 sm:mt-2">
            <div className={`w-2 h-2 rounded-full ${
              webSocketConnected ? 'bg-green-500' : 'bg-yellow-500'
            }`}></div>
            <p className={`text-xs sm:text-sm ${themeClasses.text.tertiary}`}>
              {webSocketConnected ? 'Live Updates' : 'Connecting...'}
            </p>
            {currentStats.timestamp && (
              <span className={`text-xs ${themeClasses.text.tertiary} hidden xs:inline`}>
                • {new Date(currentStats.timestamp).toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
        
        <CustomButton
          onClick={handleRefresh}
          icon={<RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 ${isLoading || localLoading ? 'animate-spin' : ''}`} />}
          label="Refresh"
          variant="secondary"
          size="sm"
          disabled={isLoading || localLoading}
          theme={theme}
          className="flex-shrink-0 w-full xs:w-auto mt-2 xs:mt-0"
        />
      </div>

      {error ? (
        <div className={`p-3 sm:p-4 rounded-lg border ${
          theme === "dark" ? "bg-red-900/20 border-red-800" : "bg-red-50 border-red-200"
        }`}>
          <div className="flex items-center space-x-2 sm:space-x-3">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0" />
            <p className={`text-xs sm:text-sm ${themeClasses.text.primary} break-words`}>
              Error loading performance data: {error}
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Metrics Grid - Improved responsive layout */}
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {metrics.map((metric, index) => {
              const trend = calculateTrend(metric.current, metric.previous, metric.isPositiveMetric);
              const trendColor = getTrendColor(trend.direction);
              
              return (
                <div key={index} className={`p-3 sm:p-4 rounded-lg ${
                  theme === "dark" ? "bg-gray-700/50" : "bg-gray-50"
                } min-h-[120px] sm:min-h-[140px]`}>
                  <div className="flex items-start justify-between mb-2 sm:mb-3">
                    <div className="flex items-start space-x-2 sm:space-x-3 min-w-0 flex-1">
                      <div className={`p-1.5 sm:p-2 rounded-full flex-shrink-0 ${
                        metric.color === 'blue' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                        metric.color === 'purple' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' :
                        metric.color === 'green' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
                        'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
                      }`}>
                        {metric.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`font-medium text-xs sm:text-sm ${themeClasses.text.primary} truncate`}>
                          {metric.name}
                        </p>
                        <p className={`text-xl sm:text-2xl font-bold ${
                          metric.isPositiveMetric 
                            ? getHealthColor(metric.current) 
                            : getHealthColor(100 - metric.current)
                        }`}>
                          {metric.current || 0}{metric.unit ? ` ${metric.unit}` : ''}
                        </p>
                      </div>
                    </div>
                    <div className={`flex items-center space-x-1 ${trendColor} flex-shrink-0`}>
                      {trend.icon}
                      <span className="text-xs sm:text-sm font-medium hidden xs:block">{trend.value}</span>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 sm:h-2 mb-2">
                    <div 
                      className={`h-1.5 sm:h-2 rounded-full ${
                        metric.color === 'blue' ? 'bg-blue-500' :
                        metric.color === 'purple' ? 'bg-purple-500' :
                        metric.color === 'green' ? 'bg-green-500' :
                        'bg-orange-500'
                      }`}
                      style={{ 
                        width: `${Math.min(
                          metric.key === 'throughput' ? (metric.current / 1000) * 100 : metric.current, 
                          100
                        )}%` 
                      }}
                    ></div>
                  </div>

                  {/* Historical context */}
                  {metric.previous > 0 && (
                    <p className={`text-xs ${themeClasses.text.tertiary} truncate`}>
                      Previous: {metric.previous}{metric.unit ? ` ${metric.unit}` : ''}
                    </p>
                  )}
                  
                  {/* Mobile trend indicator */}
                  <div className={`xs:hidden flex items-center space-x-1 ${trendColor} mt-1`}>
                    {trend.icon}
                    <span className="text-xs font-medium">{trend.value}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Performance Summary */}
          <div className={`mt-4 p-3 rounded-lg ${
            theme === "dark" ? "bg-gray-700/50" : "bg-gray-100"
          }`}>
            <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 xs:gap-4 text-sm">
              <span className={themeClasses.text.tertiary}>Overall Performance</span>
              <span className={`font-medium ${
                metrics.filter(m => !m.isPositiveMetric).every(m => m.current < 80) && 
                metrics.filter(m => m.isPositiveMetric).every(m => m.current > 0)
                  ? 'text-green-500' :
                metrics.filter(m => !m.isPositiveMetric).some(m => m.current >= 90) 
                  ? 'text-red-500' : 'text-yellow-500'
              }`}>
                {metrics.filter(m => !m.isPositiveMetric).every(m => m.current < 80) && 
                 metrics.filter(m => m.isPositiveMetric).every(m => m.current > 0)
                  ? 'Excellent' :
                 metrics.filter(m => !m.isPositiveMetric).some(m => m.current >= 90) 
                  ? 'Critical' : 'Good'}
              </span>
            </div>
          </div>

          {/* Configuration Status */}
          {activeRouter.configuration_status && (
            <div className={`mt-3 p-3 rounded-lg border ${
              activeRouter.configuration_status === 'configured' 
                ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                : activeRouter.configuration_status === 'partially_configured'
                ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'
                : 'bg-gray-50 border-gray-200 dark:bg-gray-700/50 dark:border-gray-600'
            }`}>
              <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 xs:gap-4 text-sm">
                <span className={themeClasses.text.primary}>Configuration Status</span>
                <span className={`font-medium ${
                  activeRouter.configuration_status === 'configured' ? 'text-green-600' :
                  activeRouter.configuration_status === 'partially_configured' ? 'text-yellow-600' :
                  'text-gray-600'
                }`}>
                  {activeRouter.configuration_status.charAt(0).toUpperCase() + activeRouter.configuration_status.slice(1)}
                  {activeRouter.configuration_type && ` (${activeRouter.configuration_type.toUpperCase()})`}
                </span>
              </div>
            </div>
          )}

          {/* Data Source Info */}
          <div className={`mt-3 text-xs ${themeClasses.text.tertiary} space-y-1`}>
            <p className="break-words">
              Data from: {activeRouter.type === "mikrotik" ? "RouterOS API" : 
                         activeRouter.type === "ubiquiti" ? "UniFi Controller" : 
                         "Router Management System"}
            </p>
            {routerStats?.latest?.timestamp && (
              <p>Last updated: {new Date(routerStats.latest.timestamp).toLocaleTimeString()}</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default PerformanceMetrics;