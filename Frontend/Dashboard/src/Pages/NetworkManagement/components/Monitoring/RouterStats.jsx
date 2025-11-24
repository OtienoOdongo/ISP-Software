

// // src/Pages/NetworkManagement/components/Monitoring/RouterStats.jsx
// import React from "react";
// import { Cpu, HardDrive, Users, Thermometer, Download, Upload, Activity, Clock, Wifi, Shield, Database } from "lucide-react";
// import CustomModal from "../Common/CustomModal";
// import StatsCard from "../Common/StatsCard";
// import { getThemeClasses } from "../../../../components/ServiceManagement/Shared/components";
// import { formatBytes, formatUptime, formatSpeed, getHealthColor } from "../../utils/networkUtils";

// const RouterStats = ({ 
//   isOpen, 
//   onClose, 
//   routerStats, 
//   statsLoading, 
//   theme = "light",
//   router 
// }) => {
//   const themeClasses = getThemeClasses(theme);

//   if (statsLoading || !routerStats) {
//     return (
//       <CustomModal 
//         isOpen={isOpen} 
//         title="Router Statistics" 
//         onClose={onClose}
//         size="lg"
//         theme={theme}
//       >
//         <div className="flex justify-center items-center py-12">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
//         </div>
//       </CustomModal>
//     );
//   }

//   const stats = routerStats.latest || {};
//   const systemInfo = stats.system_info || {};

//   // Enhanced metrics calculation
//   const enhancedStats = {
//     ...stats,
//     memory_usage: systemInfo.total_memory && systemInfo.free_memory 
//       ? Math.round(((systemInfo.total_memory - systemInfo.free_memory) / systemInfo.total_memory) * 100)
//       : stats.memory || 0,
//     total_sessions: (stats.hotspot_sessions || 0) + (stats.pppoe_sessions || 0),
//     model: systemInfo.model || router?.model || 'Unknown',
//     firmware: systemInfo.version || router?.firmware_version || 'Unknown'
//   };

//   return (
//     <CustomModal 
//       isOpen={isOpen} 
//       title={`Router Statistics - ${router?.name || 'Unknown'}`} 
//       onClose={onClose}
//       size="lg"
//       theme={theme}
//     >
//       <div className="space-y-6">
//         {/* Key Metrics Grid */}
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//           <StatsCard 
//             title="CPU Usage" 
//             value={enhancedStats.cpu || enhancedStats.cpu_load || 0} 
//             unit="%"
//             icon={<Cpu className="w-5 h-5" />} 
//             theme={theme} 
//             color="blue"
//             subtitle={getHealthColor(enhancedStats.cpu).includes("red") ? "High" : "Normal"}
//           />
          
//           <StatsCard 
//             title="Memory Usage" 
//             value={enhancedStats.memory_usage} 
//             unit="%"
//             icon={<HardDrive className="w-5 h-5" />} 
//             theme={theme} 
//             color="purple"
//           />
          
//           <StatsCard 
//             title="Connected Clients" 
//             value={enhancedStats.total_sessions}
//             icon={<Users className="w-5 h-5" />} 
//             theme={theme} 
//             color="green"
//           />
          
//           <StatsCard 
//             title="Temperature" 
//             value={enhancedStats.temperature || 0}
//             unit="°C"
//             icon={<Thermometer className="w-5 h-5" />} 
//             theme={theme} 
//             color="orange"
//             subtitle={getHealthColor(enhancedStats.temperature, "temperature").includes("red") ? "Hot" : "Normal"}
//           />
//         </div>

//         {/* Detailed Statistics */}
//         <div className={`p-6 rounded-lg border ${
//           themeClasses.bg.card
//         } ${themeClasses.border.medium}`}>
//           <h4 className={`text-lg font-medium mb-4 flex items-center ${themeClasses.text.primary}`}>
//             <Activity className="w-5 h-5 mr-2" />
//             Detailed Performance Metrics
//           </h4>
          
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {/* Network Statistics */}
//             <div className="space-y-4">
//               <h5 className={`font-medium ${themeClasses.text.secondary}`}>Network</h5>
//               <div className="space-y-3">
//                 <div className="flex justify-between items-center">
//                   <span className={`text-sm ${themeClasses.text.tertiary}`}>Download Speed</span>
//                   <span className="font-medium flex items-center">
//                     <Download className="w-4 h-4 mr-1 text-green-500" />
//                     {formatSpeed(enhancedStats.throughput)}
//                   </span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span className={`text-sm ${themeClasses.text.tertiary}`}>Upload Speed</span>
//                   <span className="font-medium flex items-center">
//                     <Upload className="w-4 h-4 mr-1 text-blue-500" />
//                     {formatSpeed(enhancedStats.upload_speed || enhancedStats.throughput * 0.3)}
//                   </span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span className={`text-sm ${themeClasses.text.tertiary}`}>Signal Strength</span>
//                   <span className={`font-medium ${enhancedStats.signal < -70 ? 'text-red-500' : enhancedStats.signal < -60 ? 'text-yellow-500' : 'text-green-500'}`}>
//                     {enhancedStats.signal || 0} dBm
//                   </span>
//                 </div>
//               </div>
//             </div>

//             {/* Service Information */}
//             <div className="space-y-4">
//               <h5 className={`font-medium ${themeClasses.text.secondary}`}>Services</h5>
//               <div className="space-y-3">
//                 <div className="flex justify-between items-center">
//                   <span className={`text-sm ${themeClasses.text.tertiary}`}>Hotspot Clients</span>
//                   <span className="font-medium flex items-center text-blue-600 dark:text-blue-400">
//                     <Wifi className="w-4 h-4 mr-1" />
//                     {enhancedStats.hotspot_sessions || 0}
//                   </span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span className={`text-sm ${themeClasses.text.tertiary}`}>PPPoE Clients</span>
//                   <span className="font-medium flex items-center text-green-600 dark:text-green-400">
//                     <Shield className="w-4 h-4 mr-1" />
//                     {enhancedStats.pppoe_sessions || 0}
//                   </span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span className={`text-sm ${themeClasses.text.tertiary}`}>Total Sessions</span>
//                   <span className="font-medium text-purple-600 dark:text-purple-400">
//                     {enhancedStats.total_sessions}
//                   </span>
//                 </div>
//               </div>
//             </div>

//             {/* System Information */}
//             <div className="space-y-4">
//               <h5 className={`font-medium ${themeClasses.text.secondary}`}>System Info</h5>
//               <div className="space-y-3">
//                 <div className="flex justify-between items-center">
//                   <span className={`text-sm ${themeClasses.text.tertiary}`}>Model</span>
//                   <span className="font-medium text-sm">{enhancedStats.model}</span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span className={`text-sm ${themeClasses.text.tertiary}`}>Firmware</span>
//                   <span className="font-medium text-sm">{enhancedStats.firmware}</span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span className={`text-sm ${themeClasses.text.tertiary}`}>Uptime</span>
//                   <span className="font-medium flex items-center">
//                     <Clock className="w-4 h-4 mr-1" />
//                     {formatUptime(enhancedStats.uptime || systemInfo.uptime)}
//                   </span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span className={`text-sm ${themeClasses.text.tertiary}`}>Free Memory</span>
//                   <span className={`font-medium ${getHealthColor(enhancedStats.memory_usage)}`}>
//                     {systemInfo.free_memory ? formatBytes(systemInfo.free_memory) : 'N/A'}
//                   </span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Resource Usage */}
//         <div className={`p-6 rounded-lg border ${themeClasses.bg.card} ${themeClasses.border.medium}`}>
//           <h4 className={`text-lg font-medium mb-4 ${themeClasses.text.primary}`}>Resource Usage</h4>
//           <div className="space-y-4">
//             {/* CPU Usage Bar */}
//             <div>
//               <div className="flex justify-between text-sm mb-1">
//                 <span className={themeClasses.text.primary}>CPU Usage</span>
//                 <span className={getHealthColor(enhancedStats.cpu)}>{enhancedStats.cpu || 0}%</span>
//               </div>
//               <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
//                 <div 
//                   className={`h-3 rounded-full ${
//                     getHealthColor(enhancedStats.cpu).includes("red") ? "bg-red-500" :
//                     getHealthColor(enhancedStats.cpu).includes("yellow") ? "bg-yellow-500" : "bg-blue-500"
//                   }`}
//                   style={{ width: `${Math.min(enhancedStats.cpu || 0, 100)}%` }}
//                 ></div>
//               </div>
//             </div>

//             {/* Memory Usage Bar */}
//             <div>
//               <div className="flex justify-between text-sm mb-1">
//                 <span className={themeClasses.text.primary}>Memory Usage</span>
//                 <span className={getHealthColor(enhancedStats.memory_usage)}>{enhancedStats.memory_usage}%</span>
//               </div>
//               <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
//                 <div 
//                   className={`h-3 rounded-full ${
//                     getHealthColor(enhancedStats.memory_usage).includes("red") ? "bg-red-500" :
//                     getHealthColor(enhancedStats.memory_usage).includes("yellow") ? "bg-yellow-500" : "bg-purple-500"
//                   }`}
//                   style={{ width: `${Math.min(enhancedStats.memory_usage, 100)}%` }}
//                 ></div>
//               </div>
//             </div>

//             {/* Session Distribution */}
//             {enhancedStats.total_sessions > 0 && (
//               <div>
//                 <div className="flex justify-between text-sm mb-1">
//                   <span className={themeClasses.text.primary}>Session Distribution</span>
//                   <span className={themeClasses.text.tertiary}>{enhancedStats.total_sessions} total</span>
//                 </div>
//                 <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
//                   <div 
//                     className="h-3 rounded-full bg-blue-500"
//                     style={{ width: `${(enhancedStats.hotspot_sessions / enhancedStats.total_sessions) * 100}%` }}
//                   ></div>
//                   <div 
//                     className="h-3 rounded-full bg-green-500 -mt-3"
//                     style={{ width: `${(enhancedStats.pppoe_sessions / enhancedStats.total_sessions) * 100}%`, marginLeft: `${(enhancedStats.hotspot_sessions / enhancedStats.total_sessions) * 100}%` }}
//                   ></div>
//                 </div>
//                 <div className="flex justify-between text-xs mt-1">
//                   <span className="text-blue-600 dark:text-blue-400">
//                     Hotspot: {enhancedStats.hotspot_sessions}
//                   </span>
//                   <span className="text-green-600 dark:text-green-400">
//                     PPPoE: {enhancedStats.pppoe_sessions}
//                   </span>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Health Status */}
//         <div className={`p-4 rounded-lg border ${
//           theme === "dark" ? "bg-gray-800 border-gray-600" : "bg-gray-50 border-gray-300"
//         }`}>
//           <h4 className={`font-medium mb-3 ${themeClasses.text.primary}`}>System Health Status</h4>
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
//             <div>
//               <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${
//                 (enhancedStats.cpu || 0) < 80 ? 'bg-green-500' : (enhancedStats.cpu || 0) < 90 ? 'bg-yellow-500' : 'bg-red-500'
//               }`}></div>
//               <p className={`text-sm ${themeClasses.text.tertiary}`}>CPU</p>
//               <p className={`text-lg font-semibold ${themeClasses.text.primary}`}>{
//                 (enhancedStats.cpu || 0) < 80 ? 'Good' : (enhancedStats.cpu || 0) < 90 ? 'Warning' : 'Critical'
//               }</p>
//             </div>
//             <div>
//               <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${
//                 enhancedStats.memory_usage < 80 ? 'bg-green-500' : enhancedStats.memory_usage < 90 ? 'bg-yellow-500' : 'bg-red-500'
//               }`}></div>
//               <p className={`text-sm ${themeClasses.text.tertiary}`}>Memory</p>
//               <p className={`text-lg font-semibold ${themeClasses.text.primary}`}>{
//                 enhancedStats.memory_usage < 80 ? 'Good' : enhancedStats.memory_usage < 90 ? 'Warning' : 'Critical'
//               }</p>
//             </div>
//             <div>
//               <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${
//                 (enhancedStats.temperature || 0) < 60 ? 'bg-green-500' : (enhancedStats.temperature || 0) < 70 ? 'bg-yellow-500' : 'bg-red-500'
//               }`}></div>
//               <p className={`text-sm ${themeClasses.text.tertiary}`}>Temperature</p>
//               <p className={`text-lg font-semibold ${themeClasses.text.primary}`}>{
//                 (enhancedStats.temperature || 0) < 60 ? 'Good' : (enhancedStats.temperature || 0) < 70 ? 'Warning' : 'Critical'
//               }</p>
//             </div>
//             <div>
//               <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${
//                 enhancedStats.total_sessions < 50 ? 'bg-green-500' : enhancedStats.total_sessions < 100 ? 'bg-yellow-500' : 'bg-red-500'
//               }`}></div>
//               <p className={`text-sm ${themeClasses.text.tertiary}`}>Sessions</p>
//               <p className={`text-lg font-semibold ${themeClasses.text.primary}`}>{
//                 enhancedStats.total_sessions < 50 ? 'Good' : enhancedStats.total_sessions < 100 ? 'Warning' : 'Critical'
//               }</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </CustomModal>
//   );
// };

// export default RouterStats;












// src/Pages/NetworkManagement/components/Monitoring/RouterStats.jsx
import React from "react";
import { Cpu, HardDrive, Users, Thermometer, Download, Upload, Activity, Clock, Wifi, Shield, Database } from "lucide-react";
import CustomModal from "../Common/CustomModal";
import StatsCard from "../Common/StatsCard";
import { getThemeClasses } from "../../../../components/ServiceManagement/Shared/components";
import { formatBytes, formatUptime, formatSpeed, getHealthColor } from "../../utils/networkUtils";

const RouterStats = ({ 
  isOpen, 
  onClose, 
  routerStats, 
  statsLoading, 
  theme = "light",
  router 
}) => {
  const themeClasses = getThemeClasses(theme);

  if (statsLoading || !routerStats) {
    return (
      <CustomModal 
        isOpen={isOpen} 
        title="Router Statistics" 
        onClose={onClose}
        size="lg"
        theme={theme}
      >
        <div className="flex justify-center items-center py-8 sm:py-12">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-500"></div>
        </div>
      </CustomModal>
    );
  }

  const stats = routerStats.latest || {};
  const systemInfo = stats.system_info || {};

  // Enhanced metrics calculation
  const enhancedStats = {
    ...stats,
    memory_usage: systemInfo.total_memory && systemInfo.free_memory 
      ? Math.round(((systemInfo.total_memory - systemInfo.free_memory) / systemInfo.total_memory) * 100)
      : stats.memory || 0,
    total_sessions: (stats.hotspot_sessions || 0) + (stats.pppoe_sessions || 0),
    model: systemInfo.model || router?.model || 'Unknown',
    firmware: systemInfo.version || router?.firmware_version || 'Unknown'
  };

  return (
    <CustomModal 
      isOpen={isOpen} 
      title={
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
          <span>Router Statistics</span>
          {router?.name && (
            <span className="text-sm font-normal text-gray-600 dark:text-gray-400 truncate">
              - {router.name}
            </span>
          )}
        </div>
      }
      onClose={onClose}
      size="lg"
      theme={theme}
    >
      <div className="space-y-4 sm:space-y-6 max-h-[70vh] sm:max-h-[80vh] overflow-y-auto">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          <StatsCard 
            title="CPU Usage" 
            value={enhancedStats.cpu || enhancedStats.cpu_load || 0} 
            unit="%"
            icon={<Cpu className="w-4 h-4 sm:w-5 sm:h-5" />} 
            theme={theme} 
            color="blue"
            subtitle={getHealthColor(enhancedStats.cpu).includes("red") ? "High" : "Normal"}
            className="min-h-[80px] sm:min-h-[90px]"
          />
          
          <StatsCard 
            title="Memory Usage" 
            value={enhancedStats.memory_usage} 
            unit="%"
            icon={<HardDrive className="w-4 h-4 sm:w-5 sm:h-5" />} 
            theme={theme} 
            color="purple"
            className="min-h-[80px] sm:min-h-[90px]"
          />
          
          <StatsCard 
            title="Connected Clients" 
            value={enhancedStats.total_sessions}
            icon={<Users className="w-4 h-4 sm:w-5 sm:h-5" />} 
            theme={theme} 
            color="green"
            className="min-h-[80px] sm:min-h-[90px]"
          />
          
          <StatsCard 
            title="Temperature" 
            value={enhancedStats.temperature || 0}
            unit="°C"
            icon={<Thermometer className="w-4 h-4 sm:w-5 sm:h-5" />} 
            theme={theme} 
            color="orange"
            subtitle={getHealthColor(enhancedStats.temperature, "temperature").includes("red") ? "Hot" : "Normal"}
            className="min-h-[80px] sm:min-h-[90px]"
          />
        </div>

        {/* Detailed Statistics */}
        <div className={`p-4 sm:p-6 rounded-lg border ${
          themeClasses.bg.card
        } ${themeClasses.border.medium}`}>
          <h4 className={`text-base sm:text-lg font-medium mb-3 sm:mb-4 flex items-center ${themeClasses.text.primary}`}>
            <Activity className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Detailed Performance Metrics
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Network Statistics */}
            <div className="space-y-3 sm:space-y-4">
              <h5 className={`font-medium text-sm sm:text-base ${themeClasses.text.secondary}`}>Network</h5>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex justify-between items-center">
                  <span className={`text-xs sm:text-sm ${themeClasses.text.tertiary}`}>Download Speed</span>
                  <span className="font-medium flex items-center text-sm sm:text-base">
                    <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-green-500" />
                    {formatSpeed(enhancedStats.throughput)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-xs sm:text-sm ${themeClasses.text.tertiary}`}>Upload Speed</span>
                  <span className="font-medium flex items-center text-sm sm:text-base">
                    <Upload className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-blue-500" />
                    {formatSpeed(enhancedStats.upload_speed || enhancedStats.throughput * 0.3)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-xs sm:text-sm ${themeClasses.text.tertiary}`}>Signal Strength</span>
                  <span className={`font-medium text-sm sm:text-base ${enhancedStats.signal < -70 ? 'text-red-500' : enhancedStats.signal < -60 ? 'text-yellow-500' : 'text-green-500'}`}>
                    {enhancedStats.signal || 0} dBm
                  </span>
                </div>
              </div>
            </div>

            {/* Service Information */}
            <div className="space-y-3 sm:space-y-4">
              <h5 className={`font-medium text-sm sm:text-base ${themeClasses.text.secondary}`}>Services</h5>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex justify-between items-center">
                  <span className={`text-xs sm:text-sm ${themeClasses.text.tertiary}`}>Hotspot Clients</span>
                  <span className="font-medium flex items-center text-sm sm:text-base text-blue-600 dark:text-blue-400">
                    <Wifi className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    {enhancedStats.hotspot_sessions || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-xs sm:text-sm ${themeClasses.text.tertiary}`}>PPPoE Clients</span>
                  <span className="font-medium flex items-center text-sm sm:text-base text-green-600 dark:text-green-400">
                    <Shield className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    {enhancedStats.pppoe_sessions || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-xs sm:text-sm ${themeClasses.text.tertiary}`}>Total Sessions</span>
                  <span className="font-medium text-sm sm:text-base text-purple-600 dark:text-purple-400">
                    {enhancedStats.total_sessions}
                  </span>
                </div>
              </div>
            </div>

            {/* System Information */}
            <div className="space-y-3 sm:space-y-4">
              <h5 className={`font-medium text-sm sm:text-base ${themeClasses.text.secondary}`}>System Info</h5>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex justify-between items-center">
                  <span className={`text-xs sm:text-sm ${themeClasses.text.tertiary}`}>Model</span>
                  <span className="font-medium text-xs sm:text-sm truncate ml-2">{enhancedStats.model}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-xs sm:text-sm ${themeClasses.text.tertiary}`}>Firmware</span>
                  <span className="font-medium text-xs sm:text-sm truncate ml-2">{enhancedStats.firmware}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-xs sm:text-sm ${themeClasses.text.tertiary}`}>Uptime</span>
                  <span className="font-medium flex items-center text-xs sm:text-sm">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    {formatUptime(enhancedStats.uptime || systemInfo.uptime)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-xs sm:text-sm ${themeClasses.text.tertiary}`}>Free Memory</span>
                  <span className={`font-medium text-xs sm:text-sm ${getHealthColor(enhancedStats.memory_usage)}`}>
                    {systemInfo.free_memory ? formatBytes(systemInfo.free_memory) : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Resource Usage */}
        <div className={`p-4 sm:p-6 rounded-lg border ${themeClasses.bg.card} ${themeClasses.border.medium}`}>
          <h4 className={`text-base sm:text-lg font-medium mb-3 sm:mb-4 ${themeClasses.text.primary}`}>Resource Usage</h4>
          <div className="space-y-3 sm:space-y-4">
            {/* CPU Usage Bar */}
            <div>
              <div className="flex justify-between text-xs sm:text-sm mb-1">
                <span className={themeClasses.text.primary}>CPU Usage</span>
                <span className={getHealthColor(enhancedStats.cpu)}>{enhancedStats.cpu || 0}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 sm:h-3">
                <div 
                  className={`h-2 sm:h-3 rounded-full ${
                    getHealthColor(enhancedStats.cpu).includes("red") ? "bg-red-500" :
                    getHealthColor(enhancedStats.cpu).includes("yellow") ? "bg-yellow-500" : "bg-blue-500"
                  }`}
                  style={{ width: `${Math.min(enhancedStats.cpu || 0, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Memory Usage Bar */}
            <div>
              <div className="flex justify-between text-xs sm:text-sm mb-1">
                <span className={themeClasses.text.primary}>Memory Usage</span>
                <span className={getHealthColor(enhancedStats.memory_usage)}>{enhancedStats.memory_usage}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 sm:h-3">
                <div 
                  className={`h-2 sm:h-3 rounded-full ${
                    getHealthColor(enhancedStats.memory_usage).includes("red") ? "bg-red-500" :
                    getHealthColor(enhancedStats.memory_usage).includes("yellow") ? "bg-yellow-500" : "bg-purple-500"
                  }`}
                  style={{ width: `${Math.min(enhancedStats.memory_usage, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Session Distribution */}
            {enhancedStats.total_sessions > 0 && (
              <div>
                <div className="flex justify-between text-xs sm:text-sm mb-1">
                  <span className={themeClasses.text.primary}>Session Distribution</span>
                  <span className={themeClasses.text.tertiary}>{enhancedStats.total_sessions} total</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 sm:h-3">
                  <div 
                    className="h-2 sm:h-3 rounded-full bg-blue-500"
                    style={{ width: `${(enhancedStats.hotspot_sessions / enhancedStats.total_sessions) * 100}%` }}
                  ></div>
                  <div 
                    className="h-2 sm:h-3 rounded-full bg-green-500 -mt-2 sm:-mt-3"
                    style={{ width: `${(enhancedStats.pppoe_sessions / enhancedStats.total_sessions) * 100}%`, marginLeft: `${(enhancedStats.hotspot_sessions / enhancedStats.total_sessions) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span className="text-blue-600 dark:text-blue-400">
                    Hotspot: {enhancedStats.hotspot_sessions}
                  </span>
                  <span className="text-green-600 dark:text-green-400">
                    PPPoE: {enhancedStats.pppoe_sessions}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Health Status */}
        <div className={`p-3 sm:p-4 rounded-lg border ${
          theme === "dark" ? "bg-gray-800 border-gray-600" : "bg-gray-50 border-gray-300"
        }`}>
          <h4 className={`font-medium mb-2 sm:mb-3 text-sm sm:text-base ${themeClasses.text.primary}`}>System Health Status</h4>
          <div className="grid grid-cols-2 xs:grid-cols-4 gap-3 sm:gap-4 text-center">
            <div>
              <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full mx-auto mb-1 sm:mb-2 ${
                (enhancedStats.cpu || 0) < 80 ? 'bg-green-500' : (enhancedStats.cpu || 0) < 90 ? 'bg-yellow-500' : 'bg-red-500'
              }`}></div>
              <p className={`text-xs ${themeClasses.text.tertiary}`}>CPU</p>
              <p className={`text-sm sm:text-lg font-semibold ${themeClasses.text.primary}`}>{
                (enhancedStats.cpu || 0) < 80 ? 'Good' : (enhancedStats.cpu || 0) < 90 ? 'Warning' : 'Critical'
              }</p>
            </div>
            <div>
              <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full mx-auto mb-1 sm:mb-2 ${
                enhancedStats.memory_usage < 80 ? 'bg-green-500' : enhancedStats.memory_usage < 90 ? 'bg-yellow-500' : 'bg-red-500'
              }`}></div>
              <p className={`text-xs ${themeClasses.text.tertiary}`}>Memory</p>
              <p className={`text-sm sm:text-lg font-semibold ${themeClasses.text.primary}`}>{
                enhancedStats.memory_usage < 80 ? 'Good' : enhancedStats.memory_usage < 90 ? 'Warning' : 'Critical'
              }</p>
            </div>
            <div>
              <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full mx-auto mb-1 sm:mb-2 ${
                (enhancedStats.temperature || 0) < 60 ? 'bg-green-500' : (enhancedStats.temperature || 0) < 70 ? 'bg-yellow-500' : 'bg-red-500'
              }`}></div>
              <p className={`text-xs ${themeClasses.text.tertiary}`}>Temperature</p>
              <p className={`text-sm sm:text-lg font-semibold ${themeClasses.text.primary}`}>{
                (enhancedStats.temperature || 0) < 60 ? 'Good' : (enhancedStats.temperature || 0) < 70 ? 'Warning' : 'Critical'
              }</p>
            </div>
            <div>
              <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full mx-auto mb-1 sm:mb-2 ${
                enhancedStats.total_sessions < 50 ? 'bg-green-500' : enhancedStats.total_sessions < 100 ? 'bg-yellow-500' : 'bg-red-500'
              }`}></div>
              <p className={`text-xs ${themeClasses.text.tertiary}`}>Sessions</p>
              <p className={`text-sm sm:text-lg font-semibold ${themeClasses.text.primary}`}>{
                enhancedStats.total_sessions < 50 ? 'Good' : enhancedStats.total_sessions < 100 ? 'Warning' : 'Critical'
              }</p>
            </div>
          </div>
        </div>
      </div>
    </CustomModal>
  );
};

export default RouterStats;


