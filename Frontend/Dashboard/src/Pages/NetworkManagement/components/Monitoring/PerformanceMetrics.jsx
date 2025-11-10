

// // src/Pages/NetworkManagement/components/Monitoring/PerformanceMetrics.jsx
// import React from "react";
// import { TrendingUp, TrendingDown, Minus, Cpu, HardDrive, Network, Users } from "lucide-react";
// import { getThemeClasses } from "../../../../components/ServiceManagement/Shared/components"


// const PerformanceMetrics = ({ 
//   routerStats, 
//   theme = "light" 
// }) => {
//   const themeClasses = getThemeClasses(theme);

//   const calculateTrend = (current, previous) => {
//     if (!previous || previous === 0) return { direction: 'neutral', value: '0%' };
    
//     const change = ((current - previous) / previous) * 100;
//     const direction = change > 0 ? 'up' : change < 0 ? 'down' : 'neutral';
    
//     return {
//       direction,
//       value: `${Math.abs(change).toFixed(1)}%`,
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

//   // Mock historical data - in real app, this would come from API
//   const historicalData = {
//     cpu: [45, 52, 48, 55, 60, 58, 65],
//     memory: [60, 62, 65, 68, 70, 72, 75],
//     clients: [25, 28, 30, 32, 35, 38, 40],
//     throughput: [85, 90, 95, 100, 105, 110, 115]
//   };

//   const currentStats = routerStats?.latest || {};
//   const previousStats = {
//     cpu: historicalData.cpu[historicalData.cpu.length - 2] || 0,
//     memory: historicalData.memory[historicalData.memory.length - 2] || 0,
//     clients: historicalData.clients[historicalData.clients.length - 2] || 0,
//     throughput: historicalData.throughput[historicalData.throughput.length - 2] || 0
//   };

//   const metrics = [
//     {
//       name: "CPU Usage",
//       current: currentStats.cpu || 0,
//       previous: previousStats.cpu,
//       icon: <Cpu className="w-5 h-5" />,
//       color: "blue"
//     },
//     {
//       name: "Memory Usage",
//       current: currentStats.memory || 0,
//       previous: previousStats.memory,
//       icon: <HardDrive className="w-5 h-5" />,
//       color: "purple"
//     },
//     {
//       name: "Connected Clients",
//       current: currentStats.clients || 0,
//       previous: previousStats.clients,
//       icon: <Users className="w-5 h-5" />,
//       color: "green"
//     },
//     {
//       name: "Throughput",
//       current: currentStats.throughput || 0,
//       previous: previousStats.throughput,
//       icon: <Network className="w-5 h-5" />,
//       color: "orange",
//       unit: "Mbps"
//     }
//   ];

//   return (
//     <div className={`p-6 rounded-xl shadow-lg backdrop-blur-md transition-all duration-300 border ${
//       themeClasses.bg.card
//     } ${themeClasses.border.light}`}>
//       <h3 className={`text-lg font-semibold mb-4 flex items-center ${themeClasses.text.primary}`}>
//         <TrendingUp className="w-5 h-5 mr-2" />
//         Performance Trends
//       </h3>

//       <div className="space-y-4">
//         {metrics.map((metric, index) => {
//           const trend = calculateTrend(metric.current, metric.previous);
          
//           return (
//             <div key={index} className={`p-4 rounded-lg ${
//               theme === "dark" ? "bg-gray-700/50" : "bg-gray-50"
//             }`}>
//               <div className="flex items-center justify-between mb-2">
//                 <div className="flex items-center space-x-3">
//                   <div className={`p-2 rounded-full ${
//                     metric.color === 'blue' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
//                     metric.color === 'purple' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' :
//                     metric.color === 'green' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
//                     'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
//                   }`}>
//                     {metric.icon}
//                   </div>
//                   <div>
//                     <p className={`font-medium text-sm ${themeClasses.text.primary}`}>{metric.name}</p>
//                     <p className={`text-2xl font-bold ${themeClasses.text.primary}`}>
//                       {metric.current}{metric.unit ? ` ${metric.unit}` : '%'}
//                     </p>
//                   </div>
//                 </div>
//                 <div className={`flex items-center space-x-1 ${getTrendColor(trend.direction)}`}>
//                   {trend.icon}
//                   <span className="text-sm font-medium">{trend.value}</span>
//                 </div>
//               </div>
              
//               {/* Progress Bar */}
//               <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
//                 <div 
//                   className={`h-2 rounded-full ${
//                     metric.color === 'blue' ? 'bg-blue-500' :
//                     metric.color === 'purple' ? 'bg-purple-500' :
//                     metric.color === 'green' ? 'bg-green-500' :
//                     'bg-orange-500'
//                   }`}
//                   style={{ width: `${Math.min(metric.current, 100)}%` }}
//                 ></div>
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       {/* Performance Summary */}
//       <div className={`mt-4 p-3 rounded-lg ${
//         theme === "dark" ? "bg-gray-700/50" : "bg-gray-100"
//       }`}>
//         <div className="flex items-center justify-between text-sm">
//           <span className={themeClasses.text.tertiary}>Overall Performance</span>
//           <span className={`font-medium ${
//             metrics.every(m => m.current < 80) ? 'text-green-500' :
//             metrics.some(m => m.current >= 90) ? 'text-red-500' : 'text-yellow-500'
//           }`}>
//             {metrics.every(m => m.current < 80) ? 'Excellent' :
//              metrics.some(m => m.current >= 90) ? 'Critical' : 'Good'}
//           </span>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PerformanceMetrics;







// // src/Pages/NetworkManagement/components/Monitoring/PerformanceMetrics.jsx
// import React, { useEffect, useState } from "react";
// import { TrendingUp, TrendingDown, Minus, Cpu, HardDrive, Network, Users, RefreshCw, AlertCircle } from "lucide-react";
// import { getThemeClasses } from "../../../../components/ServiceManagement/Shared/components";
// import { getHealthColor } from "../../utils/networkUtils"
// import { useNetworkData } from "../hooks/useNetworkData"
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

//   const metrics = [
//     {
//       name: "CPU Usage",
//       key: "cpu",
//       current: currentStats.cpu || 0,
//       previous: getPreviousValue("cpu"),
//       icon: <Cpu className="w-5 h-5" />,
//       color: "blue",
//       unit: "%",
//       isPositiveMetric: false // Lower is better
//     },
//     {
//       name: "Memory Usage",
//       key: "memory",
//       current: currentStats.memory || 0,
//       previous: getPreviousValue("memory"),
//       icon: <HardDrive className="w-5 h-5" />,
//       color: "purple",
//       unit: "%",
//       isPositiveMetric: false // Lower is better
//     },
//     {
//       name: "Connected Clients",
//       key: "clients",
//       current: currentStats.clients || 0,
//       previous: getPreviousValue("clients"),
//       icon: <Users className="w-5 h-5" />,
//       color: "green",
//       unit: "",
//       isPositiveMetric: true // Higher is better (more clients)
//     },
//     {
//       name: "Throughput",
//       key: "throughput",
//       current: currentStats.throughput || 0,
//       previous: getPreviousValue("throughput"),
//       icon: <Network className="w-5 h-5" />,
//       color: "orange",
//       unit: "Mbps",
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
//           <div className="space-y-4">
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
import { TrendingUp, TrendingDown, Minus, Cpu, HardDrive, Network, Users, RefreshCw, AlertCircle } from "lucide-react";
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
      icon: direction === 'up' ? <TrendingUp className="w-4 h-4" /> : 
             direction === 'down' ? <TrendingDown className="w-4 h-4" /> : 
             <Minus className="w-4 h-4" />
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

  const metrics = [
    {
      name: "CPU Usage",
      key: "cpu",
      current: currentStats.cpu || 0,
      previous: getPreviousValue("cpu"),
      icon: <Cpu className="w-5 h-5" />,
      color: "blue",
      unit: "%",
      isPositiveMetric: false // Lower is better
    },
    {
      name: "Memory Usage",
      key: "memory",
      current: currentStats.memory || 0,
      previous: getPreviousValue("memory"),
      icon: <HardDrive className="w-5 h-5" />,
      color: "purple",
      unit: "%",
      isPositiveMetric: false // Lower is better
    },
    {
      name: "Connected Clients",
      key: "clients",
      current: currentStats.clients || 0,
      previous: getPreviousValue("clients"),
      icon: <Users className="w-5 h-5" />,
      color: "green",
      unit: "",
      isPositiveMetric: true // Higher is better (more clients)
    },
    {
      name: "Throughput",
      key: "throughput",
      current: currentStats.throughput || 0,
      previous: getPreviousValue("throughput"),
      icon: <Network className="w-5 h-5" />,
      color: "orange",
      unit: "Mbps",
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
      <div className={`p-6 rounded-xl border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className={`text-lg font-semibold mb-2 ${themeClasses.text.primary}`}>
            Connection Error
          </h3>
          <p className={`text-sm ${themeClasses.text.tertiary} mb-4`}>
            {error}
          </p>
          <CustomButton
            onClick={handleRefresh}
            icon={<RefreshCw className="w-4 h-4" />}
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
      <div className={`p-6 rounded-xl border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
        <div className="text-center py-8">
          <Network className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className={`text-lg font-semibold mb-2 ${themeClasses.text.primary}`}>
            Select a Router
          </h3>
          <p className={`text-sm ${themeClasses.text.tertiary}`}>
            Choose a router from the list to view performance metrics
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 rounded-xl shadow-lg backdrop-blur-md transition-all duration-300 border ${
      themeClasses.bg.card
    } ${themeClasses.border.light}`}>
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 gap-4">
        <div>
          <h3 className={`text-lg font-semibold flex items-center ${themeClasses.text.primary}`}>
            <TrendingUp className="w-5 h-5 mr-2" />
            Performance Trends
            {activeRouter && (
              <span className={`text-sm font-normal ml-2 ${themeClasses.text.tertiary}`}>
                - {activeRouter.name}
              </span>
            )}
          </h3>
          <div className="flex items-center space-x-2 mt-1">
            <div className={`w-2 h-2 rounded-full ${
              webSocketConnected ? 'bg-green-500' : 'bg-yellow-500'
            }`}></div>
            <p className={`text-sm ${themeClasses.text.tertiary}`}>
              {webSocketConnected ? 'Live Updates' : 'Connecting...'}
            </p>
          </div>
        </div>
        
        <CustomButton
          onClick={handleRefresh}
          icon={<RefreshCw className={`w-4 h-4 ${isLoading || localLoading ? 'animate-spin' : ''}`} />}
          label="Refresh"
          variant="secondary"
          size="sm"
          disabled={isLoading || localLoading}
          theme={theme}
        />
      </div>

      {error ? (
        <div className={`p-4 rounded-lg border ${
          theme === "dark" ? "bg-red-900/20 border-red-800" : "bg-red-50 border-red-200"
        }`}>
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <p className={`text-sm ${themeClasses.text.primary}`}>
              Error loading performance data: {error}
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {metrics.map((metric, index) => {
              const trend = calculateTrend(metric.current, metric.previous, metric.isPositiveMetric);
              const trendColor = getTrendColor(trend.direction);
              
              return (
                <div key={index} className={`p-4 rounded-lg ${
                  theme === "dark" ? "bg-gray-700/50" : "bg-gray-50"
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${
                        metric.color === 'blue' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                        metric.color === 'purple' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' :
                        metric.color === 'green' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
                        'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
                      }`}>
                        {metric.icon}
                      </div>
                      <div>
                        <p className={`font-medium text-sm ${themeClasses.text.primary}`}>
                          {metric.name}
                        </p>
                        <p className={`text-2xl font-bold ${
                          metric.isPositiveMetric 
                            ? getHealthColor(metric.current) 
                            : getHealthColor(100 - metric.current)
                        }`}>
                          {metric.current || 0}{metric.unit ? ` ${metric.unit}` : ''}
                        </p>
                      </div>
                    </div>
                    <div className={`flex items-center space-x-1 ${trendColor}`}>
                      {trend.icon}
                      <span className="text-sm font-medium">{trend.value}</span>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
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
                    <p className={`text-xs mt-2 ${themeClasses.text.tertiary}`}>
                      Previous: {metric.previous}{metric.unit ? ` ${metric.unit}` : ''}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Performance Summary */}
          <div className={`mt-4 p-3 rounded-lg ${
            theme === "dark" ? "bg-gray-700/50" : "bg-gray-100"
          }`}>
            <div className="flex items-center justify-between text-sm">
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

          {/* Data Source Info */}
          <div className={`mt-3 text-xs ${themeClasses.text.tertiary}`}>
            <p>
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