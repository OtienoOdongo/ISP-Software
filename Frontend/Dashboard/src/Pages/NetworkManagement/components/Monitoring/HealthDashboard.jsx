





// // src/Pages/NetworkManagement/components/Monitoring/HealthDashboard.jsx
// import React, { useState, useEffect } from "react";
// import { Activity, Wifi, Cable, Server, Clock, Users, RefreshCw, AlertTriangle } from "lucide-react";
// import StatCard from "../Monitoring/StatCard";
// import { getThemeClasses } from "../../../../components/ServiceManagement/Shared/components";
// import { formatTimeSince, getHealthColor } from "../../utils/networkUtils";
// import { getHealthIcon } from "../../utils/iconUtils";
// import CustomButton from "../Common/CustomButton";

// const HealthDashboard = ({ 
//   healthStats, 
//   systemMetrics, 
//   activeRouter, 
//   theme = "light",
//   onRefresh 
// }) => {
//   const themeClasses = getThemeClasses(theme);
//   const [isRefreshing, setIsRefreshing] = useState(false);

//   // Filter health stats for active router
//   const routerHealthStats = activeRouter 
//     ? healthStats.filter(stat => stat.router === activeRouter.id)
//     : [];

//   const latestHealth = routerHealthStats[0] || {};
//   const metrics = systemMetrics[activeRouter?.id] || {};

//   // Enhanced metrics from backend
//   const enhancedMetrics = {
//     ...metrics,
//     // Add calculated metrics
//     memory_usage: metrics.total_memory && metrics.free_memory 
//       ? Math.round(((metrics.total_memory - metrics.free_memory) / metrics.total_memory) * 100)
//       : 0,
//     total_sessions: (metrics.hotspot_sessions || 0) + (metrics.pppoe_sessions || 0),
//     health_score: latestHealth.health_score || 0
//   };

//   const getStatusColor = (status) => {
//     switch (status) {
//       case "connected":
//         return "text-green-500";
//       case "disconnected":
//         return "text-red-500";
//       case "partially_configured":
//         return "text-yellow-500";
//       default:
//         return "text-gray-500";
//     }
//   };

//   const handleRefresh = async () => {
//     if (!activeRouter) return;
    
//     setIsRefreshing(true);
//     try {
//       await onRefresh?.(activeRouter.id);
//     } catch (error) {
//       console.error('Error refreshing health data:', error);
//     } finally {
//       setIsRefreshing(false);
//     }
//   };

//   const getConfigurationStatus = () => {
//     if (!activeRouter) return 'Unknown';
    
//     const status = activeRouter.configuration_status;
//     const type = activeRouter.configuration_type;
    
//     if (status === 'configured' && type) {
//       return `Configured (${type.toUpperCase()})`;
//     }
//     return status?.charAt(0).toUpperCase() + status?.slice(1) || 'Not Configured';
//   };

//   return (
//     <div className={`p-6 rounded-xl shadow-lg backdrop-blur-md transition-all duration-300 border ${
//       themeClasses.bg.card
//     } ${themeClasses.border.light}`}>
      
//       {/* Header */}
//       <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 gap-4">
//         <h3 className={`text-lg font-semibold flex items-center ${themeClasses.text.primary}`}>
//           <Activity className="w-5 h-5 mr-2" />
//           Health Dashboard
//           {activeRouter && (
//             <span className={`text-sm font-normal ml-2 ${themeClasses.text.tertiary}`}>
//               - {activeRouter.name}
//             </span>
//           )}
//         </h3>
        
//         {activeRouter && (
//           <CustomButton
//             onClick={handleRefresh}
//             icon={<RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />}
//             label="Refresh"
//             variant="secondary"
//             size="sm"
//             disabled={isRefreshing}
//             theme={theme}
//           />
//         )}
//       </div>
      
//       <div className="space-y-4">
//         {/* Overall Health Status */}
//         <div className={`p-4 rounded-lg border ${
//           latestHealth.status === "connected" 
//             ? theme === "dark" ? "bg-green-900/20 border-green-800" : "bg-green-50 border-green-200"
//             : latestHealth.status === "disconnected"
//             ? theme === "dark" ? "bg-red-900/20 border-red-800" : "bg-red-50 border-red-200"
//             : theme === "dark" ? "bg-yellow-900/20 border-yellow-800" : "bg-yellow-50 border-yellow-200"
//         }`}>
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-3">
//               {getHealthIcon(latestHealth.status, "status")}
//               <div>
//                 <p className={`font-medium ${themeClasses.text.primary}`}>Router Status</p>
//                 <p className={`text-sm ${getStatusColor(latestHealth.status)}`}>
//                   {latestHealth.status ? latestHealth.status.charAt(0).toUpperCase() + latestHealth.status.slice(1) : "Unknown"}
//                 </p>
//                 <p className={`text-xs ${themeClasses.text.tertiary} mt-1`}>
//                   {getConfigurationStatus()}
//                 </p>
//               </div>
//             </div>
//             <div className="text-right">
//               {latestHealth.response_time && (
//                 <>
//                   <p className={`text-sm ${themeClasses.text.tertiary}`}>Response Time</p>
//                   <p className={`font-medium ${getHealthColor(latestHealth.response_time, "response")}`}>
//                     {latestHealth.response_time}s
//                   </p>
//                 </>
//               )}
//               {enhancedMetrics.health_score > 0 && (
//                 <p className={`text-sm mt-1 ${getHealthColor(enhancedMetrics.health_score)}`}>
//                   Health Score: {enhancedMetrics.health_score}%
//                 </p>
//               )}
//             </div>
//           </div>
//           {latestHealth.timestamp && (
//             <p className={`text-xs ${themeClasses.text.tertiary} mt-2`}>
//               Last checked: {formatTimeSince(latestHealth.timestamp)}
//             </p>
//           )}
//         </div>

//         {/* Critical Alerts */}
//         {latestHealth.critical_alerts && latestHealth.critical_alerts.length > 0 && (
//           <div className={`p-3 rounded-lg border ${
//             theme === "dark" ? "bg-red-900/20 border-red-800" : "bg-red-50 border-red-200"
//           }`}>
//             <div className="flex items-center space-x-2 mb-2">
//               <AlertTriangle className="w-4 h-4 text-red-500" />
//               <p className={`text-sm font-medium ${themeClasses.text.primary}`}>Critical Alerts</p>
//             </div>
//             <div className="space-y-1">
//               {latestHealth.critical_alerts.map((alert, index) => (
//                 <p key={index} className={`text-xs ${themeClasses.text.primary}`}>
//                   • {alert}
//                 </p>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* System Metrics */}
//         {enhancedMetrics && Object.keys(enhancedMetrics).length > 0 && (
//           <div className="space-y-3">
//             <h4 className={`font-medium text-sm ${themeClasses.text.secondary}`}>System Metrics</h4>
            
//             <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
//               <StatCard
//                 title="CPU Load"
//                 value={`${enhancedMetrics.cpu_load || 0}%`}
//                 icon={<Server className="w-4 h-4" />}
//                 color={enhancedMetrics.cpu_load > 80 ? "red" : enhancedMetrics.cpu_load > 60 ? "yellow" : "blue"}
//                 theme={theme}
//                 subtitle="Current usage"
//               />

//               <StatCard
//                 title="Memory Usage"
//                 value={`${enhancedMetrics.memory_usage || 0}%`}
//                 icon={<Activity className="w-4 h-4" />}
//                 color={enhancedMetrics.memory_usage > 80 ? "red" : enhancedMetrics.memory_usage > 60 ? "yellow" : "purple"}
//                 theme={theme}
//                 subtitle="Used memory"
//               />

//               <StatCard
//                 title="Hotspot Sessions"
//                 value={enhancedMetrics.hotspot_sessions || 0}
//                 icon={<Wifi className="w-4 h-4" />}
//                 color="blue"
//                 theme={theme}
//                 subtitle="Active"
//               />

//               <StatCard
//                 title="PPPoE Sessions"
//                 value={enhancedMetrics.pppoe_sessions || 0}
//                 icon={<Cable className="w-4 h-4" />}
//                 color="green"
//                 theme={theme}
//                 subtitle="Active"
//               />
//             </div>

//             {/* Total Sessions */}
//             <StatCard
//               title="Total Active Sessions"
//               value={enhancedMetrics.total_sessions || 0}
//               icon={<Users className="w-4 h-4" />}
//               color="purple"
//               theme={theme}
//               subtitle="All connections"
//             />
//           </div>
//         )}

//         {/* Uptime and Firmware Information */}
//         {(enhancedMetrics.uptime || activeRouter?.firmware_version) && (
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             {enhancedMetrics.uptime && enhancedMetrics.uptime !== "0" && (
//               <div className={`p-3 rounded-lg ${
//                 theme === "dark" ? "bg-gray-700/50" : "bg-gray-100"
//               }`}>
//                 <div className="flex items-center space-x-2">
//                   <Clock className="w-4 h-4 text-green-500" />
//                   <div>
//                     <p className={`text-sm font-medium ${themeClasses.text.secondary}`}>System Uptime</p>
//                     <p className={`text-sm ${themeClasses.text.tertiary}`}>{enhancedMetrics.uptime}</p>
//                   </div>
//                 </div>
//               </div>
//             )}
            
//             {activeRouter?.firmware_version && (
//               <div className={`p-3 rounded-lg ${
//                 theme === "dark" ? "bg-gray-700/50" : "bg-gray-100"
//               }`}>
//                 <div className="flex items-center space-x-2">
//                   <Server className="w-4 h-4 text-blue-500" />
//                   <div>
//                     <p className={`text-sm font-medium ${themeClasses.text.secondary}`}>Firmware Version</p>
//                     <p className={`text-sm ${themeClasses.text.tertiary}`}>{activeRouter.firmware_version}</p>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         )}

//         {!activeRouter && (
//           <div className="text-center py-4">
//             <Activity className="w-8 h-8 text-gray-400 mx-auto mb-2" />
//             <p className={`text-sm ${themeClasses.text.tertiary}`}>Select a router to view health metrics</p>
//           </div>
//         )}

//         {activeRouter && routerHealthStats.length === 0 && (
//           <div className="text-center py-4">
//             <Activity className="w-8 h-8 text-gray-400 mx-auto mb-2" />
//             <p className={`text-sm ${themeClasses.text.tertiary}`}>No health data available</p>
//             <p className={`text-xs ${themeClasses.text.tertiary} mt-1`}>
//               Health checks run automatically every 30 seconds
//             </p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default HealthDashboard;









// src/Pages/NetworkManagement/components/Monitoring/HealthDashboard.jsx
import React, { useState, useEffect } from "react";
import { Activity, Wifi, Cable, Server, Clock, Users, RefreshCw, AlertTriangle } from "lucide-react";
import StatCard from "../Monitoring/StatCard";
import { getThemeClasses } from "../../../../components/ServiceManagement/Shared/components";
import { formatTimeSince, getHealthColor } from "../../utils/networkUtils";
import { getHealthIcon } from "../../utils/iconUtils";
import CustomButton from "../Common/CustomButton";

const HealthDashboard = ({ 
  healthStats, 
  systemMetrics, 
  activeRouter, 
  theme = "light",
  onRefresh 
}) => {
  const themeClasses = getThemeClasses(theme);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter health stats for active router
  const routerHealthStats = activeRouter 
    ? healthStats.filter(stat => stat.router === activeRouter.id)
    : [];

  const latestHealth = routerHealthStats[0] || {};
  const metrics = systemMetrics[activeRouter?.id] || {};

  // Enhanced metrics from backend
  const enhancedMetrics = {
    ...metrics,
    // Add calculated metrics
    memory_usage: metrics.total_memory && metrics.free_memory 
      ? Math.round(((metrics.total_memory - metrics.free_memory) / metrics.total_memory) * 100)
      : 0,
    total_sessions: (metrics.hotspot_sessions || 0) + (metrics.pppoe_sessions || 0),
    health_score: latestHealth.health_score || 0
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "connected":
        return "text-green-500";
      case "disconnected":
        return "text-red-500";
      case "partially_configured":
        return "text-yellow-500";
      default:
        return "text-gray-500";
    }
  };

  const handleRefresh = async () => {
    if (!activeRouter) return;
    
    setIsRefreshing(true);
    try {
      await onRefresh?.(activeRouter.id);
    } catch (error) {
      console.error('Error refreshing health data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const getConfigurationStatus = () => {
    if (!activeRouter) return 'Unknown';
    
    const status = activeRouter.configuration_status;
    const type = activeRouter.configuration_type;
    
    if (status === 'configured' && type) {
      return `Configured (${type.toUpperCase()})`;
    }
    return status?.charAt(0).toUpperCase() + status?.slice(1) || 'Not Configured';
  };

  return (
    <div className={`p-4 sm:p-6 rounded-xl shadow-lg backdrop-blur-md transition-all duration-300 border ${
      themeClasses.bg.card
    } ${themeClasses.border.light}`}>
      
      {/* Header - Improved responsive layout */}
      <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center mb-4 gap-3 sm:gap-4">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <Activity className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
          <div className="min-w-0">
            <h3 className={`text-lg sm:text-xl font-semibold ${themeClasses.text.primary} truncate`}>
              Health Dashboard
            </h3>
            {activeRouter && (
              <p className={`text-sm ${themeClasses.text.tertiary} truncate`}>
                {activeRouter.name}
              </p>
            )}
          </div>
        </div>
        
        {activeRouter && (
          <CustomButton
            onClick={handleRefresh}
            icon={<RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 ${isRefreshing ? 'animate-spin' : ''}`} />}
            label="Refresh"
            variant="secondary"
            size="sm"
            disabled={isRefreshing}
            theme={theme}
            className="flex-shrink-0 w-full xs:w-auto mt-2 xs:mt-0"
          />
        )}
      </div>
      
      <div className="space-y-3 sm:space-y-4">
        {/* Overall Health Status - Improved responsive layout */}
        <div className={`p-3 sm:p-4 rounded-lg border ${
          latestHealth.status === "connected" 
            ? theme === "dark" ? "bg-green-900/20 border-green-800" : "bg-green-50 border-green-200"
            : latestHealth.status === "disconnected"
            ? theme === "dark" ? "bg-red-900/20 border-red-800" : "bg-red-50 border-red-200"
            : theme === "dark" ? "bg-yellow-900/20 border-yellow-800" : "bg-yellow-50 border-yellow-200"
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center space-x-2 sm:space-x-3">
              {getHealthIcon(latestHealth.status, "status")}
              <div className="min-w-0 flex-1">
                <p className={`font-medium text-sm sm:text-base ${themeClasses.text.primary} truncate`}>
                  Router Status
                </p>
                <p className={`text-sm ${getStatusColor(latestHealth.status)} truncate`}>
                  {latestHealth.status ? latestHealth.status.charAt(0).toUpperCase() + latestHealth.status.slice(1) : "Unknown"}
                </p>
                <p className={`text-xs ${themeClasses.text.tertiary} mt-1 truncate`}>
                  {getConfigurationStatus()}
                </p>
              </div>
            </div>
            <div className="flex flex-col xs:flex-row sm:flex-col lg:flex-row gap-2 sm:gap-1 lg:gap-3 text-left sm:text-right">
              {latestHealth.response_time && (
                <div className="flex xs:flex-col sm:flex-row lg:flex-col xl:flex-row items-start xs:items-end sm:items-start lg:items-end xl:items-start gap-1">
                  <p className={`text-xs ${themeClasses.text.tertiary} whitespace-nowrap`}>
                    Response Time
                  </p>
                  <p className={`font-medium text-sm ${getHealthColor(latestHealth.response_time, "response")} whitespace-nowrap`}>
                    {latestHealth.response_time}s
                  </p>
                </div>
              )}
              {enhancedMetrics.health_score > 0 && (
                <div className="flex xs:flex-col sm:flex-row lg:flex-col xl:flex-row items-start xs:items-end sm:items-start lg:items-end xl:items-start gap-1">
                  <p className={`text-xs ${getHealthColor(enhancedMetrics.health_score)} whitespace-nowrap`}>
                    Health Score: {enhancedMetrics.health_score}%
                  </p>
                </div>
              )}
            </div>
          </div>
          {latestHealth.timestamp && (
            <p className={`text-xs ${themeClasses.text.tertiary} mt-2 sm:mt-3 text-center sm:text-left`}>
              Last checked: {formatTimeSince(latestHealth.timestamp)}
            </p>
          )}
        </div>

        {/* Critical Alerts - Improved responsive layout */}
        {latestHealth.critical_alerts && latestHealth.critical_alerts.length > 0 && (
          <div className={`p-3 rounded-lg border ${
            theme === "dark" ? "bg-red-900/20 border-red-800" : "bg-red-50 border-red-200"
          }`}>
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className={`text-sm font-medium ${themeClasses.text.primary}`}>
                Critical Alerts
              </p>
            </div>
            <div className="space-y-1 max-h-20 overflow-y-auto">
              {latestHealth.critical_alerts.map((alert, index) => (
                <p key={index} className={`text-xs ${themeClasses.text.primary} break-words`}>
                  • {alert}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* System Metrics - Improved responsive grid */}
        {enhancedMetrics && Object.keys(enhancedMetrics).length > 0 && (
          <div className="space-y-3">
            <h4 className={`font-medium text-sm ${themeClasses.text.secondary}`}>
              System Metrics
            </h4>
            
            {/* Metrics Grid - Responsive columns */}
            <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
              <StatCard
                title="CPU Load"
                value={`${enhancedMetrics.cpu_load || 0}%`}
                icon={<Server className="w-3 h-3 sm:w-4 sm:h-4" />}
                color={enhancedMetrics.cpu_load > 80 ? "red" : enhancedMetrics.cpu_load > 60 ? "yellow" : "blue"}
                theme={theme}
                subtitle="Current usage"
                className="min-h-[80px] sm:min-h-[90px]"
              />

              <StatCard
                title="Memory Usage"
                value={`${enhancedMetrics.memory_usage || 0}%`}
                icon={<Activity className="w-3 h-3 sm:w-4 sm:h-4" />}
                color={enhancedMetrics.memory_usage > 80 ? "red" : enhancedMetrics.memory_usage > 60 ? "yellow" : "purple"}
                theme={theme}
                subtitle="Used memory"
                className="min-h-[80px] sm:min-h-[90px]"
              />

              <StatCard
                title="Hotspot Sessions"
                value={enhancedMetrics.hotspot_sessions || 0}
                icon={<Wifi className="w-3 h-3 sm:w-4 sm:h-4" />}
                color="blue"
                theme={theme}
                subtitle="Active"
                className="min-h-[80px] sm:min-h-[90px]"
              />

              <StatCard
                title="PPPoE Sessions"
                value={enhancedMetrics.pppoe_sessions || 0}
                icon={<Cable className="w-3 h-3 sm:w-4 sm:h-4" />}
                color="green"
                theme={theme}
                subtitle="Active"
                className="min-h-[80px] sm:min-h-[90px]"
              />
            </div>

            {/* Total Sessions - Full width on mobile, auto on larger screens */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
              <div className="lg:col-span-2 xl:col-span-1">
                <StatCard
                  title="Total Active Sessions"
                  value={enhancedMetrics.total_sessions || 0}
                  icon={<Users className="w-4 h-4 sm:w-5 sm:h-5" />}
                  color="purple"
                  theme={theme}
                  subtitle="All connections"
                  className="h-full"
                />
              </div>
              
              {/* Additional metrics that might be available */}
              {enhancedMetrics.temperature && (
                <StatCard
                  title="Temperature"
                  value={`${enhancedMetrics.temperature}°C`}
                  icon={<Activity className="w-3 h-3 sm:w-4 sm:h-4" />}
                  color={enhancedMetrics.temperature > 70 ? "red" : enhancedMetrics.temperature > 60 ? "yellow" : "green"}
                  theme={theme}
                  subtitle="CPU temp"
                  className="min-h-[80px] sm:min-h-[90px]"
                />
              )}
              
              {enhancedMetrics.disk_usage && (
                <StatCard
                  title="Disk Usage"
                  value={`${enhancedMetrics.disk_usage}%`}
                  icon={<Server className="w-3 h-3 sm:w-4 sm:h-4" />}
                  color={enhancedMetrics.disk_usage > 90 ? "red" : enhancedMetrics.disk_usage > 80 ? "yellow" : "blue"}
                  theme={theme}
                  subtitle="Storage"
                  className="min-h-[80px] sm:min-h-[90px]"
                />
              )}
            </div>
          </div>
        )}

        {/* Uptime and Firmware Information - Improved responsive grid */}
        {(enhancedMetrics.uptime || activeRouter?.firmware_version) && (
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
            {enhancedMetrics.uptime && enhancedMetrics.uptime !== "0" && (
              <div className={`p-3 rounded-lg ${
                theme === "dark" ? "bg-gray-700/50" : "bg-gray-100"
              }`}>
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-medium ${themeClasses.text.secondary} truncate`}>
                      System Uptime
                    </p>
                    <p className={`text-xs sm:text-sm ${themeClasses.text.tertiary} break-words`}>
                      {enhancedMetrics.uptime}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {activeRouter?.firmware_version && (
              <div className={`p-3 rounded-lg ${
                theme === "dark" ? "bg-gray-700/50" : "bg-gray-100"
              }`}>
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <Server className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-medium ${themeClasses.text.secondary} truncate`}>
                      Firmware Version
                    </p>
                    <p className={`text-xs sm:text-sm ${themeClasses.text.tertiary} break-words`}>
                      {activeRouter.firmware_version}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty States */}
        {!activeRouter && (
          <div className="text-center py-6 sm:py-8">
            <Activity className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
            <p className={`text-sm sm:text-base ${themeClasses.text.tertiary}`}>
              Select a router to view health metrics
            </p>
          </div>
        )}

        {activeRouter && routerHealthStats.length === 0 && (
          <div className="text-center py-6 sm:py-8">
            <Activity className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
            <p className={`text-sm sm:text-base ${themeClasses.text.tertiary}`}>
              No health data available
            </p>
            <p className={`text-xs sm:text-sm ${themeClasses.text.tertiary} mt-1 sm:mt-2`}>
              Health checks run automatically every 30 seconds
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthDashboard;