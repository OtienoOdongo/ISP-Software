

// // src/Pages/NetworkManagement/components/Monitoring/RouterStats.jsx
// import React from "react";
// import { Cpu, HardDrive, Users, Thermometer, Download, Upload, Activity, Clock } from "lucide-react";
// import CustomModal from "../Common/CustomModal";
// import StatsCard from "../Common/StatsCard";
// import { getThemeClasses } from "../../../../components/ServiceManagement/Shared/components"


// const RouterStats = ({ 
//   isOpen, 
//   onClose, 
//   routerStats, 
//   statsLoading, 
//   theme = "light" 
// }) => {
//   const themeClasses = getThemeClasses(theme);

//   const formatBytes = (bytes) => {
//     if (!bytes) return "0 B";
//     const k = 1024;
//     const sizes = ["B", "KB", "MB", "GB", "TB"];
//     const i = Math.floor(Math.log(bytes) / Math.log(k));
//     return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
//   };

//   const formatUptime = (uptime) => {
//     if (!uptime || uptime === "N/A") return "N/A";
    
//     // Parse MikroTik uptime format (e.g., "5d3h2m15s")
//     const days = uptime.match(/(\d+)d/);
//     const hours = uptime.match(/(\d+)h/);
//     const minutes = uptime.match(/(\d+)m/);
//     const seconds = uptime.match(/(\d+)s/);
    
//     const d = days ? parseInt(days[1]) : 0;
//     const h = hours ? parseInt(hours[1]) : 0;
//     const m = minutes ? parseInt(minutes[1]) : 0;
//     const s = seconds ? parseInt(seconds[1]) : 0;
    
//     if (d > 0) return `${d}d ${h}h ${m}m`;
//     if (h > 0) return `${h}h ${m}m`;
//     if (m > 0) return `${m}m ${s}s`;
//     return `${s}s`;
//   };

//   const getPerformanceColor = (value, type = "usage") => {
//     if (!value) return "text-gray-500";
    
//     if (type === "usage") {
//       if (value >= 80) return "text-red-500";
//       if (value >= 60) return "text-yellow-500";
//       return "text-green-500";
//     } else if (type === "temperature") {
//       if (value >= 70) return "text-red-500";
//       if (value >= 50) return "text-yellow-500";
//       return "text-green-500";
//     }
//     return "text-blue-500";
//   };

//   const formatSpeed = (speed) => {
//     if (!speed) return "0 Mbps";
//     return `${(speed).toFixed(2)} Mbps`;
//   };

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

//   return (
//     <CustomModal 
//       isOpen={isOpen} 
//       title="Router Statistics" 
//       onClose={onClose}
//       size="lg"
//       theme={theme}
//     >
//       <div className="space-y-6">
//         {/* Key Metrics Grid */}
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//           <StatsCard 
//             title="CPU Usage" 
//             value={stats.cpu || 0} 
//             unit="%"
//             icon={<Cpu className="w-5 h-5" />} 
//             theme={theme} 
//             color="blue"
//             subtitle={getPerformanceColor(stats.cpu, "usage").includes("red") ? "High" : "Normal"}
//           />
          
//           <StatsCard 
//             title="Memory Usage" 
//             value={stats.memory || 0} 
//             unit="%"
//             icon={<HardDrive className="w-5 h-5" />} 
//             theme={theme} 
//             color="purple"
//           />
          
//           <StatsCard 
//             title="Connected Clients" 
//             value={stats.clients || 0}
//             icon={<Users className="w-5 h-5" />} 
//             theme={theme} 
//             color="green"
//           />
          
//           <StatsCard 
//             title="Temperature" 
//             value={stats.temperature || 0}
//             unit="°C"
//             icon={<Thermometer className="w-5 h-5" />} 
//             theme={theme} 
//             color="orange"
//             subtitle={getPerformanceColor(stats.temperature, "temperature").includes("red") ? "Hot" : "Normal"}
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
//                     {formatSpeed(stats.throughput)}
//                   </span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span className={`text-sm ${themeClasses.text.tertiary}`}>Upload Speed</span>
//                   <span className="font-medium flex items-center">
//                     <Upload className="w-4 h-4 mr-1 text-blue-500" />
//                     {formatSpeed(stats.upload_speed || stats.throughput * 0.3)}
//                   </span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span className={`text-sm ${themeClasses.text.tertiary}`}>Signal Strength</span>
//                   <span className={`font-medium ${stats.signal < -70 ? 'text-red-500' : stats.signal < -60 ? 'text-yellow-500' : 'text-green-500'}`}>
//                     {stats.signal || 0} dBm
//                   </span>
//                 </div>
//               </div>
//             </div>

//             {/* System Information */}
//             <div className="space-y-4">
//               <h5 className={`font-medium ${themeClasses.text.secondary}`}>System</h5>
//               <div className="space-y-3">
//                 <div className="flex justify-between items-center">
//                   <span className={`text-sm ${themeClasses.text.tertiary}`}>Uptime</span>
//                   <span className="font-medium flex items-center">
//                     <Clock className="w-4 h-4 mr-1" />
//                     {formatUptime(stats.uptime)}
//                   </span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span className={`text-sm ${themeClasses.text.tertiary}`}>Disk Usage</span>
//                   <span className={`font-medium ${getPerformanceColor(stats.disk)}`}>
//                     {stats.disk || 0}%
//                   </span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span className={`text-sm ${themeClasses.text.tertiary}`}>Hotspot Clients</span>
//                   <span className="font-medium text-blue-600 dark:text-blue-400">
//                     {stats.hotspot_clients || 0}
//                   </span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span className={`text-sm ${themeClasses.text.tertiary}`}>PPPoE Clients</span>
//                   <span className="font-medium text-green-600 dark:text-green-400">
//                     {stats.pppoe_clients || 0}
//                   </span>
//                 </div>
//               </div>
//             </div>

//             {/* Resource Usage */}
//             <div className="space-y-4">
//               <h5 className={`font-medium ${themeClasses.text.secondary}`}>Resource Usage</h5>
//               <div className="space-y-4">
//                 {/* CPU Usage Bar */}
//                 <div>
//                   <div className="flex justify-between text-sm mb-1">
//                     <span className={themeClasses.text.primary}>CPU</span>
//                     <span className={getPerformanceColor(stats.cpu)}>{stats.cpu || 0}%</span>
//                   </div>
//                   <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
//                     <div 
//                       className={`h-2 rounded-full ${
//                         getPerformanceColor(stats.cpu).includes("red") ? "bg-red-500" :
//                         getPerformanceColor(stats.cpu).includes("yellow") ? "bg-yellow-500" : "bg-green-500"
//                       }`}
//                       style={{ width: `${Math.min(stats.cpu || 0, 100)}%` }}
//                     ></div>
//                   </div>
//                 </div>

//                 {/* Memory Usage Bar */}
//                 <div>
//                   <div className="flex justify-between text-sm mb-1">
//                     <span className={themeClasses.text.primary}>Memory</span>
//                     <span className={getPerformanceColor(stats.memory)}>{stats.memory || 0}%</span>
//                   </div>
//                   <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
//                     <div 
//                       className={`h-2 rounded-full ${
//                         getPerformanceColor(stats.memory).includes("red") ? "bg-red-500" :
//                         getPerformanceColor(stats.memory).includes("yellow") ? "bg-yellow-500" : "bg-purple-500"
//                       }`}
//                       style={{ width: `${Math.min(stats.memory || 0, 100)}%` }}
//                     ></div>
//                   </div>
//                 </div>

//                 {/* Disk Usage Bar */}
//                 <div>
//                   <div className="flex justify-between text-sm mb-1">
//                     <span className={themeClasses.text.primary}>Disk</span>
//                     <span className={getPerformanceColor(stats.disk)}>{stats.disk || 0}%</span>
//                   </div>
//                   <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
//                     <div 
//                       className={`h-2 rounded-full ${
//                         getPerformanceColor(stats.disk).includes("red") ? "bg-red-500" :
//                         getPerformanceColor(stats.disk).includes("yellow") ? "bg-yellow-500" : "bg-blue-500"
//                       }`}
//                       style={{ width: `${Math.min(stats.disk || 0, 100)}%` }}
//                     ></div>
//                   </div>
//                 </div>
//               </div>
//             </div>
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
//                 (stats.cpu || 0) < 80 ? 'bg-green-500' : (stats.cpu || 0) < 90 ? 'bg-yellow-500' : 'bg-red-500'
//               }`}></div>
//               <p className={`text-sm ${themeClasses.text.tertiary}`}>CPU</p>
//               <p className={`text-lg font-semibold ${themeClasses.text.primary}`}>{
//                 (stats.cpu || 0) < 80 ? 'Good' : (stats.cpu || 0) < 90 ? 'Warning' : 'Critical'
//               }</p>
//             </div>
//             <div>
//               <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${
//                 (stats.memory || 0) < 80 ? 'bg-green-500' : (stats.memory || 0) < 90 ? 'bg-yellow-500' : 'bg-red-500'
//               }`}></div>
//               <p className={`text-sm ${themeClasses.text.tertiary}`}>Memory</p>
//               <p className={`text-lg font-semibold ${themeClasses.text.primary}`}>{
//                 (stats.memory || 0) < 80 ? 'Good' : (stats.memory || 0) < 90 ? 'Warning' : 'Critical'
//               }</p>
//             </div>
//             <div>
//               <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${
//                 (stats.temperature || 0) < 60 ? 'bg-green-500' : (stats.temperature || 0) < 70 ? 'bg-yellow-500' : 'bg-red-500'
//               }`}></div>
//               <p className={`text-sm ${themeClasses.text.tertiary}`}>Temperature</p>
//               <p className={`text-lg font-semibold ${themeClasses.text.primary}`}>{
//                 (stats.temperature || 0) < 60 ? 'Good' : (stats.temperature || 0) < 70 ? 'Warning' : 'Critical'
//               }</p>
//             </div>
//             <div>
//               <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${
//                 (stats.disk || 0) < 80 ? 'bg-green-500' : (stats.disk || 0) < 90 ? 'bg-yellow-500' : 'bg-red-500'
//               }`}></div>
//               <p className={`text-sm ${themeClasses.text.tertiary}`}>Disk</p>
//               <p className={`text-lg font-semibold ${themeClasses.text.primary}`}>{
//                 (stats.disk || 0) < 80 ? 'Good' : (stats.disk || 0) < 90 ? 'Warning' : 'Critical'
//               }</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </CustomModal>
//   );
// };

// export default RouterStats;






// // src/Pages/NetworkManagement/components/Monitoring/RouterStats.jsx
// import React from "react";
// import { Cpu, HardDrive, Users, Thermometer, Download, Upload, Activity, Clock } from "lucide-react";
// import CustomModal from "../Common/CustomModal";
// import StatsCard from "../Common/StatsCard";
// import { getThemeClasses } from "../../../../components/ServiceManagement/Shared/components";
// import { formatBytes, formatUptime, formatSpeed, getHealthColor } from "../../utils/networkUtils"

// const RouterStats = ({ 
//   isOpen, 
//   onClose, 
//   routerStats, 
//   statsLoading, 
//   theme = "light" 
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

//   return (
//     <CustomModal 
//       isOpen={isOpen} 
//       title="Router Statistics" 
//       onClose={onClose}
//       size="lg"
//       theme={theme}
//     >
//       <div className="space-y-6">
//         {/* Key Metrics Grid */}
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//           <StatsCard 
//             title="CPU Usage" 
//             value={stats.cpu || 0} 
//             unit="%"
//             icon={<Cpu className="w-5 h-5" />} 
//             theme={theme} 
//             color="blue"
//             subtitle={getHealthColor(stats.cpu).includes("red") ? "High" : "Normal"}
//           />
          
//           <StatsCard 
//             title="Memory Usage" 
//             value={stats.memory || 0} 
//             unit="%"
//             icon={<HardDrive className="w-5 h-5" />} 
//             theme={theme} 
//             color="purple"
//           />
          
//           <StatsCard 
//             title="Connected Clients" 
//             value={stats.clients || 0}
//             icon={<Users className="w-5 h-5" />} 
//             theme={theme} 
//             color="green"
//           />
          
//           <StatsCard 
//             title="Temperature" 
//             value={stats.temperature || 0}
//             unit="°C"
//             icon={<Thermometer className="w-5 h-5" />} 
//             theme={theme} 
//             color="orange"
//             subtitle={getHealthColor(stats.temperature, "temperature").includes("red") ? "Hot" : "Normal"}
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
//                     {formatSpeed(stats.throughput)}
//                   </span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span className={`text-sm ${themeClasses.text.tertiary}`}>Upload Speed</span>
//                   <span className="font-medium flex items-center">
//                     <Upload className="w-4 h-4 mr-1 text-blue-500" />
//                     {formatSpeed(stats.upload_speed || stats.throughput * 0.3)}
//                   </span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span className={`text-sm ${themeClasses.text.tertiary}`}>Signal Strength</span>
//                   <span className={`font-medium ${stats.signal < -70 ? 'text-red-500' : stats.signal < -60 ? 'text-yellow-500' : 'text-green-500'}`}>
//                     {stats.signal || 0} dBm
//                   </span>
//                 </div>
//               </div>
//             </div>

//             {/* System Information */}
//             <div className="space-y-4">
//               <h5 className={`font-medium ${themeClasses.text.secondary}`}>System</h5>
//               <div className="space-y-3">
//                 <div className="flex justify-between items-center">
//                   <span className={`text-sm ${themeClasses.text.tertiary}`}>Uptime</span>
//                   <span className="font-medium flex items-center">
//                     <Clock className="w-4 h-4 mr-1" />
//                     {formatUptime(stats.uptime)}
//                   </span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span className={`text-sm ${themeClasses.text.tertiary}`}>Disk Usage</span>
//                   <span className={`font-medium ${getHealthColor(stats.disk)}`}>
//                     {stats.disk || 0}%
//                   </span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span className={`text-sm ${themeClasses.text.tertiary}`}>Hotspot Clients</span>
//                   <span className="font-medium text-blue-600 dark:text-blue-400">
//                     {stats.hotspot_clients || 0}
//                   </span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span className={`text-sm ${themeClasses.text.tertiary}`}>PPPoE Clients</span>
//                   <span className="font-medium text-green-600 dark:text-green-400">
//                     {stats.pppoe_clients || 0}
//                   </span>
//                 </div>
//               </div>
//             </div>

//             {/* Resource Usage */}
//             <div className="space-y-4">
//               <h5 className={`font-medium ${themeClasses.text.secondary}`}>Resource Usage</h5>
//               <div className="space-y-4">
//                 {/* CPU Usage Bar */}
//                 <div>
//                   <div className="flex justify-between text-sm mb-1">
//                     <span className={themeClasses.text.primary}>CPU</span>
//                     <span className={getHealthColor(stats.cpu)}>{stats.cpu || 0}%</span>
//                   </div>
//                   <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
//                     <div 
//                       className={`h-2 rounded-full ${
//                         getHealthColor(stats.cpu).includes("red") ? "bg-red-500" :
//                         getHealthColor(stats.cpu).includes("yellow") ? "bg-yellow-500" : "bg-green-500"
//                       }`}
//                       style={{ width: `${Math.min(stats.cpu || 0, 100)}%` }}
//                     ></div>
//                   </div>
//                 </div>

//                 {/* Memory Usage Bar */}
//                 <div>
//                   <div className="flex justify-between text-sm mb-1">
//                     <span className={themeClasses.text.primary}>Memory</span>
//                     <span className={getHealthColor(stats.memory)}>{stats.memory || 0}%</span>
//                   </div>
//                   <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
//                     <div 
//                       className={`h-2 rounded-full ${
//                         getHealthColor(stats.memory).includes("red") ? "bg-red-500" :
//                         getHealthColor(stats.memory).includes("yellow") ? "bg-yellow-500" : "bg-purple-500"
//                       }`}
//                       style={{ width: `${Math.min(stats.memory || 0, 100)}%` }}
//                     ></div>
//                   </div>
//                 </div>

//                 {/* Disk Usage Bar */}
//                 <div>
//                   <div className="flex justify-between text-sm mb-1">
//                     <span className={themeClasses.text.primary}>Disk</span>
//                     <span className={getHealthColor(stats.disk)}>{stats.disk || 0}%</span>
//                   </div>
//                   <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
//                     <div 
//                       className={`h-2 rounded-full ${
//                         getHealthColor(stats.disk).includes("red") ? "bg-red-500" :
//                         getHealthColor(stats.disk).includes("yellow") ? "bg-yellow-500" : "bg-blue-500"
//                       }`}
//                       style={{ width: `${Math.min(stats.disk || 0, 100)}%` }}
//                     ></div>
//                   </div>
//                 </div>
//               </div>
//             </div>
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
//                 (stats.cpu || 0) < 80 ? 'bg-green-500' : (stats.cpu || 0) < 90 ? 'bg-yellow-500' : 'bg-red-500'
//               }`}></div>
//               <p className={`text-sm ${themeClasses.text.tertiary}`}>CPU</p>
//               <p className={`text-lg font-semibold ${themeClasses.text.primary}`}>{
//                 (stats.cpu || 0) < 80 ? 'Good' : (stats.cpu || 0) < 90 ? 'Warning' : 'Critical'
//               }</p>
//             </div>
//             <div>
//               <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${
//                 (stats.memory || 0) < 80 ? 'bg-green-500' : (stats.memory || 0) < 90 ? 'bg-yellow-500' : 'bg-red-500'
//               }`}></div>
//               <p className={`text-sm ${themeClasses.text.tertiary}`}>Memory</p>
//               <p className={`text-lg font-semibold ${themeClasses.text.primary}`}>{
//                 (stats.memory || 0) < 80 ? 'Good' : (stats.memory || 0) < 90 ? 'Warning' : 'Critical'
//               }</p>
//             </div>
//             <div>
//               <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${
//                 (stats.temperature || 0) < 60 ? 'bg-green-500' : (stats.temperature || 0) < 70 ? 'bg-yellow-500' : 'bg-red-500'
//               }`}></div>
//               <p className={`text-sm ${themeClasses.text.tertiary}`}>Temperature</p>
//               <p className={`text-lg font-semibold ${themeClasses.text.primary}`}>{
//                 (stats.temperature || 0) < 60 ? 'Good' : (stats.temperature || 0) < 70 ? 'Warning' : 'Critical'
//               }</p>
//             </div>
//             <div>
//               <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${
//                 (stats.disk || 0) < 80 ? 'bg-green-500' : (stats.disk || 0) < 90 ? 'bg-yellow-500' : 'bg-red-500'
//               }`}></div>
//               <p className={`text-sm ${themeClasses.text.tertiary}`}>Disk</p>
//               <p className={`text-lg font-semibold ${themeClasses.text.primary}`}>{
//                 (stats.disk || 0) < 80 ? 'Good' : (stats.disk || 0) < 90 ? 'Warning' : 'Critical'
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
import { Cpu, HardDrive, Users, Thermometer, Download, Upload, Activity, Clock } from "lucide-react";
import CustomModal from "../Common/CustomModal";
import StatsCard from "../Common/StatsCard";
import { getThemeClasses } from "../../../../components/ServiceManagement/Shared/components";
import { formatBytes, formatUptime, formatSpeed, getHealthColor } from "../../utils/networkUtils";

const RouterStats = ({ 
  isOpen, 
  onClose, 
  routerStats, 
  statsLoading, 
  theme = "light" 
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
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </CustomModal>
    );
  }

  const stats = routerStats.latest || {};

  return (
    <CustomModal 
      isOpen={isOpen} 
      title="Router Statistics" 
      onClose={onClose}
      size="lg"
      theme={theme}
    >
      <div className="space-y-6">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard 
            title="CPU Usage" 
            value={stats.cpu || 0} 
            unit="%"
            icon={<Cpu className="w-5 h-5" />} 
            theme={theme} 
            color="blue"
            subtitle={getHealthColor(stats.cpu).includes("red") ? "High" : "Normal"}
          />
          
          <StatsCard 
            title="Memory Usage" 
            value={stats.memory || 0} 
            unit="%"
            icon={<HardDrive className="w-5 h-5" />} 
            theme={theme} 
            color="purple"
          />
          
          <StatsCard 
            title="Connected Clients" 
            value={stats.clients || 0}
            icon={<Users className="w-5 h-5" />} 
            theme={theme} 
            color="green"
          />
          
          <StatsCard 
            title="Temperature" 
            value={stats.temperature || 0}
            unit="°C"
            icon={<Thermometer className="w-5 h-5" />} 
            theme={theme} 
            color="orange"
            subtitle={getHealthColor(stats.temperature, "temperature").includes("red") ? "Hot" : "Normal"}
          />
        </div>

        {/* Detailed Statistics */}
        <div className={`p-6 rounded-lg border ${
          themeClasses.bg.card
        } ${themeClasses.border.medium}`}>
          <h4 className={`text-lg font-medium mb-4 flex items-center ${themeClasses.text.primary}`}>
            <Activity className="w-5 h-5 mr-2" />
            Detailed Performance Metrics
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Network Statistics */}
            <div className="space-y-4">
              <h5 className={`font-medium ${themeClasses.text.secondary}`}>Network</h5>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${themeClasses.text.tertiary}`}>Download Speed</span>
                  <span className="font-medium flex items-center">
                    <Download className="w-4 h-4 mr-1 text-green-500" />
                    {formatSpeed(stats.throughput)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${themeClasses.text.tertiary}`}>Upload Speed</span>
                  <span className="font-medium flex items-center">
                    <Upload className="w-4 h-4 mr-1 text-blue-500" />
                    {formatSpeed(stats.upload_speed || stats.throughput * 0.3)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${themeClasses.text.tertiary}`}>Signal Strength</span>
                  <span className={`font-medium ${stats.signal < -70 ? 'text-red-500' : stats.signal < -60 ? 'text-yellow-500' : 'text-green-500'}`}>
                    {stats.signal || 0} dBm
                  </span>
                </div>
              </div>
            </div>

            {/* System Information */}
            <div className="space-y-4">
              <h5 className={`font-medium ${themeClasses.text.secondary}`}>System</h5>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${themeClasses.text.tertiary}`}>Uptime</span>
                  <span className="font-medium flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {formatUptime(stats.uptime)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${themeClasses.text.tertiary}`}>Disk Usage</span>
                  <span className={`font-medium ${getHealthColor(stats.disk)}`}>
                    {stats.disk || 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${themeClasses.text.tertiary}`}>Hotspot Clients</span>
                  <span className="font-medium text-blue-600 dark:text-blue-400">
                    {stats.hotspot_clients || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${themeClasses.text.tertiary}`}>PPPoE Clients</span>
                  <span className="font-medium text-green-600 dark:text-green-400">
                    {stats.pppoe_clients || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Resource Usage */}
            <div className="space-y-4">
              <h5 className={`font-medium ${themeClasses.text.secondary}`}>Resource Usage</h5>
              <div className="space-y-4">
                {/* CPU Usage Bar */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className={themeClasses.text.primary}>CPU</span>
                    <span className={getHealthColor(stats.cpu)}>{stats.cpu || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        getHealthColor(stats.cpu).includes("red") ? "bg-red-500" :
                        getHealthColor(stats.cpu).includes("yellow") ? "bg-yellow-500" : "bg-green-500"
                      }`}
                      style={{ width: `${Math.min(stats.cpu || 0, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Memory Usage Bar */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className={themeClasses.text.primary}>Memory</span>
                    <span className={getHealthColor(stats.memory)}>{stats.memory || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        getHealthColor(stats.memory).includes("red") ? "bg-red-500" :
                        getHealthColor(stats.memory).includes("yellow") ? "bg-yellow-500" : "bg-purple-500"
                      }`}
                      style={{ width: `${Math.min(stats.memory || 0, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Disk Usage Bar */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className={themeClasses.text.primary}>Disk</span>
                    <span className={getHealthColor(stats.disk)}>{stats.disk || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        getHealthColor(stats.disk).includes("red") ? "bg-red-500" :
                        getHealthColor(stats.disk).includes("yellow") ? "bg-yellow-500" : "bg-blue-500"
                      }`}
                      style={{ width: `${Math.min(stats.disk || 0, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Health Status */}
        <div className={`p-4 rounded-lg border ${
          theme === "dark" ? "bg-gray-800 border-gray-600" : "bg-gray-50 border-gray-300"
        }`}>
          <h4 className={`font-medium mb-3 ${themeClasses.text.primary}`}>System Health Status</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${
                (stats.cpu || 0) < 80 ? 'bg-green-500' : (stats.cpu || 0) < 90 ? 'bg-yellow-500' : 'bg-red-500'
              }`}></div>
              <p className={`text-sm ${themeClasses.text.tertiary}`}>CPU</p>
              <p className={`text-lg font-semibold ${themeClasses.text.primary}`}>{
                (stats.cpu || 0) < 80 ? 'Good' : (stats.cpu || 0) < 90 ? 'Warning' : 'Critical'
              }</p>
            </div>
            <div>
              <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${
                (stats.memory || 0) < 80 ? 'bg-green-500' : (stats.memory || 0) < 90 ? 'bg-yellow-500' : 'bg-red-500'
              }`}></div>
              <p className={`text-sm ${themeClasses.text.tertiary}`}>Memory</p>
              <p className={`text-lg font-semibold ${themeClasses.text.primary}`}>{
                (stats.memory || 0) < 80 ? 'Good' : (stats.memory || 0) < 90 ? 'Warning' : 'Critical'
              }</p>
            </div>
            <div>
              <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${
                (stats.temperature || 0) < 60 ? 'bg-green-500' : (stats.temperature || 0) < 70 ? 'bg-yellow-500' : 'bg-red-500'
              }`}></div>
              <p className={`text-sm ${themeClasses.text.tertiary}`}>Temperature</p>
              <p className={`text-lg font-semibold ${themeClasses.text.primary}`}>{
                (stats.temperature || 0) < 60 ? 'Good' : (stats.temperature || 0) < 70 ? 'Warning' : 'Critical'
              }</p>
            </div>
            <div>
              <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${
                (stats.disk || 0) < 80 ? 'bg-green-500' : (stats.disk || 0) < 90 ? 'bg-yellow-500' : 'bg-red-500'
              }`}></div>
              <p className={`text-sm ${themeClasses.text.tertiary}`}>Disk</p>
              <p className={`text-lg font-semibold ${themeClasses.text.primary}`}>{
                (stats.disk || 0) < 80 ? 'Good' : (stats.disk || 0) < 90 ? 'Warning' : 'Critical'
              }</p>
            </div>
          </div>
        </div>
      </div>
    </CustomModal>
  );
};

export default RouterStats;