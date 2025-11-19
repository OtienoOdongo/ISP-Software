





// import React, { useState, useEffect } from "react";
// import PropTypes from "prop-types";
// import {
//   FiWifi,
//   FiCpu,
//   FiServer,
//   FiRefreshCw,
//   FiAlertTriangle,
//   FiCheckCircle,
//   FiArrowUp,
//   FiArrowDown,
//   FiClock,
//   FiActivity,
// } from "react-icons/fi";
// import { FaMemory } from "react-icons/fa";
// import { IoMdAlert } from "react-icons/io";
// import { format } from "date-fns";
// import { motion } from "framer-motion";

// const SystemLoadMonitor = ({ data, theme, onLoad, onError }) => {
//   const [lastUpdated, setLastUpdated] = useState(new Date());
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setIsLoading(false);
//       if (onLoad) onLoad();
//     }, 700);

//     return () => clearTimeout(timer);
//   }, [onLoad]);

//   useEffect(() => {
//     const interval = setInterval(() => setLastUpdated(new Date()), 30000);
//     return () => clearInterval(interval);
//   }, []);

//   useEffect(() => {
//     if (!data || Object.keys(data).length === 0) {
//       if (onError) onError("No system load data available");
//     }
//   }, [data, onError]);

//   const renderGauge = (value, threshold = 80) => {
//     const percentage = Math.min(Math.max(value, 0), 100);
//     const isCritical = percentage > threshold;
//     const isWarning = percentage > (threshold * 0.8) && !isCritical;

//     return (
//       <div className="mt-3 sm:mt-4">
//         <div className={`w-full rounded-full h-2 sm:h-2.5 overflow-hidden ${
//           theme === "dark" ? "bg-gray-700" : "bg-gray-200"
//         }`}>
//           <div
//             className={`h-2 sm:h-2.5 rounded-full transition-all duration-500 ${
//               isCritical ? "bg-red-500" : isWarning ? "bg-amber-400" : "bg-blue-500"
//             }`}
//             style={{ width: `${percentage}%` }}
//           ></div>
//         </div>
//         <div className={`flex justify-between mt-1 text-xs ${
//           theme === "dark" ? "text-gray-400" : "text-gray-500"
//         }`}>
//           <span>0%</span>
//           <span
//             className={`font-medium ${
//               isCritical ? "text-red-500" : isWarning ? "text-amber-500" : "text-blue-500"
//             }`}
//           >
//             {percentage}%
//           </span>
//           <span>100%</span>
//         </div>
//       </div>
//     );
//   };

//   const renderResponseTimeGauge = (value) => {
//     const isCritical = value > 500;
//     const isWarning = value > 300 && !isCritical;

//     return (
//       <div className="mt-3 sm:mt-4">
//         <div className={`w-full rounded-full h-2 sm:h-2.5 overflow-hidden ${
//           theme === "dark" ? "bg-gray-700" : "bg-gray-200"
//         }`}>
//           <div
//             className={`h-2 sm:h-2.5 rounded-full transition-all duration-500 ${
//               isCritical ? "bg-red-500" : isWarning ? "bg-amber-400" : "bg-blue-500"
//             }`}
//             style={{ width: `${Math.min(value / 10, 100)}%` }}
//           ></div>
//         </div>
//         <div className={`flex justify-between mt-1 text-xs ${
//           theme === "dark" ? "text-gray-400" : "text-gray-500"
//         }`}>
//           <span>0ms</span>
//           <span
//             className={`font-medium ${
//               isCritical ? "text-red-500" : isWarning ? "text-amber-500" : "text-blue-500"
//             }`}
//           >
//             {value}ms
//           </span>
//           <span>1000ms</span>
//         </div>
//       </div>
//     );
//   };

//   const renderThroughputGauge = (upload, download, totalBandwidth) => {
//     const total = upload + download;
//     const percentage = Math.min((total / totalBandwidth) * 100, 100);
//     const isCritical = percentage > 80;
//     const isWarning = percentage > 60 && !isCritical;

//     return (
//       <div className="mt-3 sm:mt-4">
//         <div className={`w-full rounded-full h-2 sm:h-2.5 overflow-hidden ${
//           theme === "dark" ? "bg-gray-700" : "bg-gray-200"
//         }`}>
//           <div
//             className={`h-2 sm:h-2.5 rounded-full transition-all duration-500 ${
//               isCritical ? "bg-red-500" : isWarning ? "bg-amber-400" : "bg-blue-500"
//             }`}
//             style={{ width: `${percentage}%` }}
//           ></div>
//         </div>
//         <div className={`flex justify-between mt-1 text-xs ${
//           theme === "dark" ? "text-gray-400" : "text-gray-500"
//         }`}>
//           <span>0 Mbps</span>
//           <span
//             className={`font-medium ${
//               isCritical ? "text-red-500" : isWarning ? "text-amber-500" : "text-blue-500"
//             }`}
//           >
//             {total.toFixed(1)} Mbps
//           </span>
//           <span>{totalBandwidth} Mbps</span>
//         </div>
//         <div className={`mt-1 text-xs ${
//           theme === "dark" ? "text-gray-400" : "text-gray-500"
//         }`}>
//           <span className="text-blue-500">↑ {upload.toFixed(1)} Mbps</span>
//           <span className="mx-2">/</span>
//           <span className="text-green-500">↓ {download.toFixed(1)} Mbps</span>
//         </div>
//       </div>
//     );
//   };

//   const cardConfig = [
//     {
//       key: "api",
//       icon: <FiClock className="text-xl sm:text-2xl" />,
//       title: "API Response Time",
//       value: `${data.api_response_time || 0}ms`,
//       comparison: data.api_comparison || "No previous data",
//       bgColor: theme === "dark" ? "bg-indigo-900/50" : "bg-indigo-100",
//       iconColor: theme === "dark" ? "text-indigo-300" : "text-indigo-600",
//       borderColor: theme === "dark" ? "border-indigo-700" : "border-indigo-200",
//       trend: "down",
//       trendValue: "10.1%",
//       gauge: renderResponseTimeGauge(data.api_response_time || 0),
//       status: (data.api_response_time || 0) > 500 ? "critical" : (data.api_response_time || 0) > 300 ? "warning" : "normal",
//     },
//     {
//       key: "bandwidth",
//       icon: <FiWifi className="text-xl sm:text-2xl" />,
//       title: "Bandwidth Usage",
//       value: `${data.bandwidth_used || 0}/${data.bandwidth_total || 100} Mbps`,
//       comparison: data.bandwidth_comparison || "No previous data",
//       bgColor: theme === "dark" ? "bg-teal-900/50" : "bg-teal-100",
//       iconColor: theme === "dark" ? "text-teal-300" : "text-teal-600",
//       borderColor: theme === "dark" ? "border-teal-700" : "border-teal-200",
//       trend: "up",
//       trendValue: "7.1%",
//       gauge: renderGauge(((data.bandwidth_used || 0) / (data.bandwidth_total || 100)) * 100),
//       status: ((data.bandwidth_used || 0) / (data.bandwidth_total || 100)) > 0.85 ? "critical" : ((data.bandwidth_used || 0) / (data.bandwidth_total || 100)) > 0.75 ? "warning" : "normal",
//     },
//     {
//       key: "cpu",
//       icon: <FiCpu className="text-xl sm:text-2xl" />,
//       title: "CPU Load",
//       value: `${data.cpu_load || 0}%`,
//       comparison: data.cpu_comparison || "No previous data",
//       bgColor: theme === "dark" ? "bg-amber-900/50" : "bg-amber-100",
//       iconColor: theme === "dark" ? "text-amber-300" : "text-amber-600",
//       borderColor: theme === "dark" ? "border-amber-700" : "border-amber-200",
//       trend: "up",
//       trendValue: "7.1%",
//       gauge: renderGauge(data.cpu_load || 0),
//       status: (data.cpu_load || 0) > 80 ? "critical" : (data.cpu_load || 0) > 70 ? "warning" : "normal",
//     },
//     {
//       key: "memory",
//       icon: <FaMemory className="text-xl sm:text-2xl" />,
//       title: "Memory Usage",
//       value: `${data.memory_load || 0}%`,
//       comparison: data.memory_comparison || "No previous data",
//       bgColor: theme === "dark" ? "bg-purple-900/50" : "bg-purple-100",
//       iconColor: theme === "dark" ? "text-purple-300" : "text-purple-600",
//       borderColor: theme === "dark" ? "border-purple-700" : "border-purple-200",
//       trend: "up",
//       trendValue: "5.0%",
//       gauge: renderGauge(data.memory_load || 0),
//       status: (data.memory_load || 0) > 80 ? "critical" : (data.memory_load || 0) > 70 ? "warning" : "normal",
//     },
//     {
//       key: "router_status",
//       icon: <FiServer className="text-xl sm:text-2xl" />,
//       title: "Router Status",
//       value: (data.router_status === "online" ? "Online" : "Offline") || "Unknown",
//       comparison: data.router_uptime || "Uptime unknown",
//       bgColor: data.router_status === "online" 
//         ? theme === "dark" ? "bg-green-900/50" : "bg-green-100" 
//         : theme === "dark" ? "bg-red-900/50" : "bg-red-100",
//       iconColor: data.router_status === "online" 
//         ? theme === "dark" ? "text-green-300" : "text-green-600" 
//         : theme === "dark" ? "text-red-300" : "text-red-600",
//       borderColor: data.router_status === "online" 
//         ? theme === "dark" ? "border-green-700" : "border-green-200" 
//         : theme === "dark" ? "border-red-700" : "border-red-200",
//       status: data.router_status === "online" ? "normal" : "critical",
//       valueColor: data.router_status === "online" 
//         ? "text-green-500" : "text-red-500",
//     },
//     {
//       key: "throughput",
//       icon: <FiActivity className="text-xl sm:text-2xl" />,
//       title: "Network Throughput",
//       value: `${(data.upload_throughput || 0).toFixed(1)}↑ / ${(data.download_throughput || 0).toFixed(1)}↓ Mbps`,
//       comparison: data.throughput_comparison || "No previous data",
//       bgColor: theme === "dark" ? "bg-cyan-900/50" : "bg-cyan-100",
//       iconColor: theme === "dark" ? "text-cyan-300" : "text-cyan-600",
//       borderColor: theme === "dark" ? "border-cyan-700" : "border-cyan-200",
//       trend: "up",
//       trendValue: "15.2%",
//       gauge: renderThroughputGauge(data.upload_throughput || 0, data.download_throughput || 0, data.bandwidth_total || 100),
//       status: ((data.upload_throughput || 0) + (data.download_throughput || 0)) > ((data.bandwidth_total || 100) * 0.8) ? "critical" : ((data.upload_throughput || 0) + (data.download_throughput || 0)) > ((data.bandwidth_total || 100) * 0.6) ? "warning" : "normal",
//     },
//     {
//       key: "temperature",
//       icon: <FiCpu className="text-xl sm:text-2xl" />,
//       title: "Router Temperature",
//       value: `${data.router_temperature || 0}°C`,
//       comparison: data.temperature_comparison || "No previous data",
//       bgColor: theme === "dark" ? "bg-orange-900/50" : "bg-orange-100",
//       iconColor: theme === "dark" ? "text-orange-300" : "text-orange-600",
//       borderColor: theme === "dark" ? "border-orange-700" : "border-orange-200",
//       trend: "up",
//       trendValue: "7.3%",
//       gauge: renderGauge(data.router_temperature || 0, 70),
//       status: (data.router_temperature || 0) > 70 ? "critical" : (data.router_temperature || 0) > 60 ? "warning" : "normal",
//     },
//     {
//       key: "firmware",
//       icon: <FiServer className="text-xl sm:text-2xl" />,
//       title: "Firmware Version",
//       value: data.firmware_version || "Unknown",
//       comparison: data.firmware_comparison || "Version unknown",
//       bgColor: theme === "dark" ? "bg-blue-900/50" : "bg-blue-100",
//       iconColor: theme === "dark" ? "text-blue-300" : "text-blue-600",
//       borderColor: theme === "dark" ? "border-blue-700" : "border-blue-200",
//       status: "normal",
//     },
//   ];

//   if (isLoading) {
//     return (
//       <div className={`rounded-xl shadow-sm overflow-hidden ${
//         theme === "dark" 
//           ? "bg-gray-800/60 backdrop-blur-md border-gray-700" 
//           : "bg-white/80 backdrop-blur-md border-gray-200"
//       } border animate-pulse`}>
//         <div className={`px-4 sm:px-6 py-4 sm:py-5 border-b ${
//           theme === "dark" ? "border-gray-700" : "border-gray-200"
//         }`}>
//           <div className={`h-6 w-48 rounded ${
//             theme === "dark" ? "bg-gray-700" : "bg-gray-300"
//           }`} />
//           <div className={`h-4 w-64 rounded mt-2 ${
//             theme === "dark" ? "bg-gray-700" : "bg-gray-300"
//           }`} />
//         </div>
//         <div className="p-4 sm:p-6">
//           <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
//             {Array.from({ length: 8 }).map((_, index) => (
//               <div key={index} className={`rounded-xl border p-4 sm:p-5 ${
//                 theme === "dark" ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"
//               }`}>
//                 <div className={`h-10 w-10 rounded-lg ${
//                   theme === "dark" ? "bg-gray-700" : "bg-gray-300"
//                 }`} />
//                 <div className="mt-4 space-y-2">
//                   <div className={`h-4 w-3/4 rounded ${
//                     theme === "dark" ? "bg-gray-700" : "bg-gray-300"
//                   }`} />
//                   <div className={`h-6 w-1/2 rounded ${
//                     theme === "dark" ? "bg-gray-700" : "bg-gray-300"
//                   }`} />
//                   <div className={`h-3 w-full rounded ${
//                     theme === "dark" ? "bg-gray-700" : "bg-gray-300"
//                   }`} />
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (!data || Object.keys(data).length === 0) {
//     return (
//       <div className={`rounded-xl shadow-sm overflow-hidden ${
//         theme === "dark" 
//           ? "bg-gray-800/60 backdrop-blur-md border-gray-700" 
//           : "bg-white/80 backdrop-blur-md border-gray-200"
//       } border`}>
//         <div className={`px-4 sm:px-6 py-4 sm:py-5 border-b ${
//           theme === "dark" ? "border-gray-700" : "border-gray-200"
//         }`}>
//           <h3 className={`text-lg sm:text-xl font-bold ${
//             theme === "dark" ? "text-white" : "text-gray-900"
//           }`}>System Health Monitor</h3>
//           <p className={`mt-1 text-sm ${
//             theme === "dark" ? "text-gray-400" : "text-gray-500"
//           }`}>Real-time infrastructure metrics</p>
//         </div>
//         <div className="p-8 text-center">
//           <IoMdAlert className={`mx-auto text-3xl mb-3 ${
//             theme === "dark" ? "text-gray-500" : "text-gray-400"
//           }`} />
//           <p className={`text-sm ${
//             theme === "dark" ? "text-gray-400" : "text-gray-500"
//           }`}>No system load data available</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className={`rounded-xl shadow-sm overflow-hidden ${
//       theme === "dark" 
//         ? "bg-gray-800/60 backdrop-blur-md border-gray-700" 
//         : "bg-white/80 backdrop-blur-md border-gray-200"
//     } border`}>
//       <div className={`px-4 sm:px-6 py-4 sm:py-5 border-b ${
//         theme === "dark" ? "border-gray-700" : "border-gray-200"
//       }`}>
//         <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
//           <div>
//             <h3 className={`text-lg sm:text-xl font-bold ${
//               theme === "dark" ? "text-white" : "text-gray-900"
//             }`}>System Health Monitor</h3>
//             <p className={`mt-1 text-sm ${
//               theme === "dark" ? "text-gray-400" : "text-gray-500"
//             }`}>Real-time infrastructure metrics</p>
//           </div>
//           <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
//             <span
//               className={`inline-flex items-center px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs font-medium ${
//                 data.status === "operational" 
//                   ? theme === "dark" 
//                     ? "bg-green-900/50 text-green-300" 
//                     : "bg-green-100 text-green-800"
//                   : theme === "dark" 
//                     ? "bg-red-900/50 text-red-300" 
//                     : "bg-red-100 text-red-800"
//               }`}
//             >
//               {data.status === "operational" ? (
//                 <FiCheckCircle className="mr-1 w-3 h-3 sm:w-4 sm:h-4" />
//               ) : (
//                 <FiAlertTriangle className="mr-1 w-3 h-3 sm:w-4 sm:h-4" />
//               )}
//               <span className="hidden xs:inline">
//                 {data.status === "operational" ? "All Systems Normal" : "System Degraded"}
//               </span>
//               <span className="xs:hidden">
//                 {data.status === "operational" ? "Normal" : "Degraded"}
//               </span>
//             </span>
//             <span className={`text-xs sm:text-sm ${
//               theme === "dark" ? "text-gray-400" : "text-gray-500"
//             }`}>
//               Updated: {format(lastUpdated, "h:mm a")}
//             </span>
//           </div>
//         </div>
//       </div>
//       <div className="p-4 sm:p-6">
//         <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
//           {cardConfig.map((config) => (
//             <motion.div
//               key={config.key}
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.3 }}
//               className={`rounded-xl border p-4 sm:p-5 transition-all hover:shadow-sm ${
//                 config.status === "critical"
//                   ? theme === "dark" 
//                     ? "border-red-700" 
//                     : "border-red-200"
//                   : config.status === "warning"
//                   ? theme === "dark" 
//                     ? "border-amber-700" 
//                     : "border-amber-200"
//                   : theme === "dark" 
//                     ? "border-gray-700" 
//                     : "border-gray-200"
//               } ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}
//             >
//               <div className="flex items-start justify-between">
//                 <div className={`p-2 sm:p-3 rounded-lg ${config.bgColor} ${config.iconColor}`}>
//                   {config.icon}
//                 </div>
//                 {config.trend && (
//                   <div
//                     className={`flex items-center text-xs font-medium ${
//                       config.trend === "up" 
//                         ? theme === "dark" 
//                           ? "text-green-300" 
//                           : "text-green-600"
//                         : theme === "dark" 
//                           ? "text-red-300" 
//                           : "text-red-600"
//                     }`}
//                   >
//                     {config.trend === "up" ? (
//                       <FiArrowUp className="mr-1 w-3 h-3" />
//                     ) : (
//                       <FiArrowDown className="mr-1 w-3 h-3" />
//                     )}
//                     {config.trendValue}
//                   </div>
//                 )}
//               </div>
//               <div className="mt-3 sm:mt-4">
//                 <h3 className={`text-xs sm:text-sm font-medium ${
//                   theme === "dark" ? "text-gray-400" : "text-gray-500"
//                 }`}>{config.title}</h3>
//                 <p className={`mt-1 text-lg sm:text-2xl font-bold ${
//                   config.valueColor || (theme === "dark" ? "text-white" : "text-gray-900")
//                 }`}>
//                   {config.value}
//                 </p>
//                 <p className={`mt-1 text-xs ${
//                   theme === "dark" ? "text-gray-400" : "text-gray-500"
//                 }`}>{config.comparison}</p>
//                 {config.gauge && (
//                   <div className="mt-3 sm:mt-4">
//                     {config.gauge}
//                     {config.status !== "normal" && (
//                       <p
//                         className={`mt-1 sm:mt-2 text-xs font-medium ${
//                           config.status === "critical" 
//                             ? theme === "dark" 
//                               ? "text-red-300" 
//                               : "text-red-600"
//                             : theme === "dark" 
//                               ? "text-amber-300" 
//                               : "text-amber-600"
//                         }`}
//                       >
//                         {config.status === "critical" ? "Critical Level" : "Approaching Limit"}
//                       </p>
//                     )}
//                   </div>
//                 )}
//               </div>
//             </motion.div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// SystemLoadMonitor.propTypes = {
//   data: PropTypes.shape({
//     api_response_time: PropTypes.number,
//     api_comparison: PropTypes.string,
//     bandwidth_used: PropTypes.number,
//     bandwidth_total: PropTypes.number,
//     bandwidth_comparison: PropTypes.string,
//     cpu_load: PropTypes.number,
//     cpu_comparison: PropTypes.string,
//     memory_load: PropTypes.number,
//     memory_comparison: PropTypes.string,
//     router_status: PropTypes.string,
//     router_uptime: PropTypes.string,
//     upload_throughput: PropTypes.number,
//     download_throughput: PropTypes.number,
//     throughput_comparison: PropTypes.string,
//     router_temperature: PropTypes.number,
//     temperature_comparison: PropTypes.string,
//     firmware_version: PropTypes.string,
//     firmware_comparison: PropTypes.string,
//     status: PropTypes.string,
//   }),
//   theme: PropTypes.oneOf(["light", "dark"]).isRequired,
//   onLoad: PropTypes.func,
//   onError: PropTypes.func,
// };

// SystemLoadMonitor.defaultProps = {
//   data: {},
//   onLoad: () => {},
//   onError: () => {},
// };

// export default SystemLoadMonitor;





import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  FiWifi,
  FiCpu,
  FiServer,
  FiRefreshCw,
  FiAlertTriangle,
  FiCheckCircle,
  FiArrowUp,
  FiArrowDown,
  FiClock,
  FiActivity,
} from "react-icons/fi";
import { FaMemory } from "react-icons/fa";
import { IoMdAlert } from "react-icons/io";
import { format } from "date-fns";
import { motion } from "framer-motion";

const SystemLoadMonitor = ({ 
  data = {}, 
  theme = "light", 
  onLoad = () => {}, 
  onError = () => {} 
}) => {
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      if (onLoad) onLoad();
    }, 700);

    return () => clearTimeout(timer);
  }, [onLoad]);

  useEffect(() => {
    const interval = setInterval(() => setLastUpdated(new Date()), 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!data || Object.keys(data).length === 0) {
      if (onError) onError("No system load data available");
    }
  }, [data, onError]);

  const renderGauge = (value, threshold = 80) => {
    const percentage = Math.min(Math.max(value, 0), 100);
    const isCritical = percentage > threshold;
    const isWarning = percentage > (threshold * 0.8) && !isCritical;

    return (
      <div className="mt-3 sm:mt-4">
        <div className={`w-full rounded-full h-2 sm:h-2.5 overflow-hidden ${
          theme === "dark" ? "bg-gray-700" : "bg-gray-200"
        }`}>
          <div
            className={`h-2 sm:h-2.5 rounded-full transition-all duration-500 ${
              isCritical ? "bg-red-500" : isWarning ? "bg-amber-400" : "bg-blue-500"
            }`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <div className={`flex justify-between mt-1 text-xs ${
          theme === "dark" ? "text-gray-400" : "text-gray-500"
        }`}>
          <span>0%</span>
          <span
            className={`font-medium ${
              isCritical ? "text-red-500" : isWarning ? "text-amber-500" : "text-blue-500"
            }`}
          >
            {percentage}%
          </span>
          <span>100%</span>
        </div>
      </div>
    );
  };

  const renderResponseTimeGauge = (value) => {
    const isCritical = value > 500;
    const isWarning = value > 300 && !isCritical;

    return (
      <div className="mt-3 sm:mt-4">
        <div className={`w-full rounded-full h-2 sm:h-2.5 overflow-hidden ${
          theme === "dark" ? "bg-gray-700" : "bg-gray-200"
        }`}>
          <div
            className={`h-2 sm:h-2.5 rounded-full transition-all duration-500 ${
              isCritical ? "bg-red-500" : isWarning ? "bg-amber-400" : "bg-blue-500"
            }`}
            style={{ width: `${Math.min(value / 10, 100)}%` }}
          ></div>
        </div>
        <div className={`flex justify-between mt-1 text-xs ${
          theme === "dark" ? "text-gray-400" : "text-gray-500"
        }`}>
          <span>0ms</span>
          <span
            className={`font-medium ${
              isCritical ? "text-red-500" : isWarning ? "text-amber-500" : "text-blue-500"
            }`}
          >
            {value}ms
          </span>
          <span>1000ms</span>
        </div>
      </div>
    );
  };

  const renderThroughputGauge = (upload, download, totalBandwidth) => {
    const total = upload + download;
    const percentage = Math.min((total / totalBandwidth) * 100, 100);
    const isCritical = percentage > 80;
    const isWarning = percentage > 60 && !isCritical;

    return (
      <div className="mt-3 sm:mt-4">
        <div className={`w-full rounded-full h-2 sm:h-2.5 overflow-hidden ${
          theme === "dark" ? "bg-gray-700" : "bg-gray-200"
        }`}>
          <div
            className={`h-2 sm:h-2.5 rounded-full transition-all duration-500 ${
              isCritical ? "bg-red-500" : isWarning ? "bg-amber-400" : "bg-blue-500"
            }`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <div className={`flex justify-between mt-1 text-xs ${
          theme === "dark" ? "text-gray-400" : "text-gray-500"
        }`}>
          <span>0 Mbps</span>
          <span
            className={`font-medium ${
              isCritical ? "text-red-500" : isWarning ? "text-amber-500" : "text-blue-500"
            }`}
          >
            {total.toFixed(1)} Mbps
          </span>
          <span>{totalBandwidth} Mbps</span>
        </div>
        <div className={`mt-1 text-xs ${
          theme === "dark" ? "text-gray-400" : "text-gray-500"
        }`}>
          <span className="text-blue-500">↑ {upload.toFixed(1)} Mbps</span>
          <span className="mx-2">/</span>
          <span className="text-green-500">↓ {download.toFixed(1)} Mbps</span>
        </div>
      </div>
    );
  };

  const cardConfig = [
    {
      key: "api",
      icon: <FiClock className="text-xl sm:text-2xl" />,
      title: "API Response Time",
      value: `${data.api_response_time || 0}ms`,
      comparison: data.api_comparison || "No previous data",
      bgColor: theme === "dark" ? "bg-indigo-900/50" : "bg-indigo-100",
      iconColor: theme === "dark" ? "text-indigo-300" : "text-indigo-600",
      borderColor: theme === "dark" ? "border-indigo-700" : "border-indigo-200",
      trend: "down",
      trendValue: "10.1%",
      gauge: renderResponseTimeGauge(data.api_response_time || 0),
      status: (data.api_response_time || 0) > 500 ? "critical" : (data.api_response_time || 0) > 300 ? "warning" : "normal",
    },
    {
      key: "bandwidth",
      icon: <FiWifi className="text-xl sm:text-2xl" />,
      title: "Bandwidth Usage",
      value: `${data.bandwidth_used || 0}/${data.bandwidth_total || 100} Mbps`,
      comparison: data.bandwidth_comparison || "No previous data",
      bgColor: theme === "dark" ? "bg-teal-900/50" : "bg-teal-100",
      iconColor: theme === "dark" ? "text-teal-300" : "text-teal-600",
      borderColor: theme === "dark" ? "border-teal-700" : "border-teal-200",
      trend: "up",
      trendValue: "7.1%",
      gauge: renderGauge(((data.bandwidth_used || 0) / (data.bandwidth_total || 100)) * 100),
      status: ((data.bandwidth_used || 0) / (data.bandwidth_total || 100)) > 0.85 ? "critical" : ((data.bandwidth_used || 0) / (data.bandwidth_total || 100)) > 0.75 ? "warning" : "normal",
    },
    {
      key: "cpu",
      icon: <FiCpu className="text-xl sm:text-2xl" />,
      title: "CPU Load",
      value: `${data.cpu_load || 0}%`,
      comparison: data.cpu_comparison || "No previous data",
      bgColor: theme === "dark" ? "bg-amber-900/50" : "bg-amber-100",
      iconColor: theme === "dark" ? "text-amber-300" : "text-amber-600",
      borderColor: theme === "dark" ? "border-amber-700" : "border-amber-200",
      trend: "up",
      trendValue: "7.1%",
      gauge: renderGauge(data.cpu_load || 0),
      status: (data.cpu_load || 0) > 80 ? "critical" : (data.cpu_load || 0) > 70 ? "warning" : "normal",
    },
    {
      key: "memory",
      icon: <FaMemory className="text-xl sm:text-2xl" />,
      title: "Memory Usage",
      value: `${data.memory_load || 0}%`,
      comparison: data.memory_comparison || "No previous data",
      bgColor: theme === "dark" ? "bg-purple-900/50" : "bg-purple-100",
      iconColor: theme === "dark" ? "text-purple-300" : "text-purple-600",
      borderColor: theme === "dark" ? "border-purple-700" : "border-purple-200",
      trend: "up",
      trendValue: "5.0%",
      gauge: renderGauge(data.memory_load || 0),
      status: (data.memory_load || 0) > 80 ? "critical" : (data.memory_load || 0) > 70 ? "warning" : "normal",
    },
    {
      key: "router_status",
      icon: <FiServer className="text-xl sm:text-2xl" />,
      title: "Router Status",
      value: (data.router_status === "online" ? "Online" : "Offline") || "Unknown",
      comparison: data.router_uptime || "Uptime unknown",
      bgColor: data.router_status === "online" 
        ? theme === "dark" ? "bg-green-900/50" : "bg-green-100" 
        : theme === "dark" ? "bg-red-900/50" : "bg-red-100",
      iconColor: data.router_status === "online" 
        ? theme === "dark" ? "text-green-300" : "text-green-600" 
        : theme === "dark" ? "text-red-300" : "text-red-600",
      borderColor: data.router_status === "online" 
        ? theme === "dark" ? "border-green-700" : "border-green-200" 
        : theme === "dark" ? "border-red-700" : "border-red-200",
      status: data.router_status === "online" ? "normal" : "critical",
      valueColor: data.router_status === "online" 
        ? "text-green-500" : "text-red-500",
    },
    {
      key: "throughput",
      icon: <FiActivity className="text-xl sm:text-2xl" />,
      title: "Network Throughput",
      value: `${(data.upload_throughput || 0).toFixed(1)}↑ / ${(data.download_throughput || 0).toFixed(1)}↓ Mbps`,
      comparison: data.throughput_comparison || "No previous data",
      bgColor: theme === "dark" ? "bg-cyan-900/50" : "bg-cyan-100",
      iconColor: theme === "dark" ? "text-cyan-300" : "text-cyan-600",
      borderColor: theme === "dark" ? "border-cyan-700" : "border-cyan-200",
      trend: "up",
      trendValue: "15.2%",
      gauge: renderThroughputGauge(data.upload_throughput || 0, data.download_throughput || 0, data.bandwidth_total || 100),
      status: ((data.upload_throughput || 0) + (data.download_throughput || 0)) > ((data.bandwidth_total || 100) * 0.8) ? "critical" : ((data.upload_throughput || 0) + (data.download_throughput || 0)) > ((data.bandwidth_total || 100) * 0.6) ? "warning" : "normal",
    },
    {
      key: "temperature",
      icon: <FiCpu className="text-xl sm:text-2xl" />,
      title: "Router Temperature",
      value: `${data.router_temperature || 0}°C`,
      comparison: data.temperature_comparison || "No previous data",
      bgColor: theme === "dark" ? "bg-orange-900/50" : "bg-orange-100",
      iconColor: theme === "dark" ? "text-orange-300" : "text-orange-600",
      borderColor: theme === "dark" ? "border-orange-700" : "border-orange-200",
      trend: "up",
      trendValue: "7.3%",
      gauge: renderGauge(data.router_temperature || 0, 70),
      status: (data.router_temperature || 0) > 70 ? "critical" : (data.router_temperature || 0) > 60 ? "warning" : "normal",
    },
    {
      key: "firmware",
      icon: <FiServer className="text-xl sm:text-2xl" />,
      title: "Firmware Version",
      value: data.firmware_version || "Unknown",
      comparison: data.firmware_comparison || "Version unknown",
      bgColor: theme === "dark" ? "bg-blue-900/50" : "bg-blue-100",
      iconColor: theme === "dark" ? "text-blue-300" : "text-blue-600",
      borderColor: theme === "dark" ? "border-blue-700" : "border-blue-200",
      status: "normal",
    },
  ];

  if (isLoading) {
    return (
      <div className={`rounded-xl shadow-sm overflow-hidden ${
        theme === "dark" 
          ? "bg-gray-800/60 backdrop-blur-md border-gray-700" 
          : "bg-white/80 backdrop-blur-md border-gray-200"
      } border animate-pulse`}>
        <div className={`px-4 sm:px-6 py-4 sm:py-5 border-b ${
          theme === "dark" ? "border-gray-700" : "border-gray-200"
        }`}>
          <div className={`h-6 w-48 rounded ${
            theme === "dark" ? "bg-gray-700" : "bg-gray-300"
          }`} />
          <div className={`h-4 w-64 rounded mt-2 ${
            theme === "dark" ? "bg-gray-700" : "bg-gray-300"
          }`} />
        </div>
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className={`rounded-xl border p-4 sm:p-5 ${
                theme === "dark" ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"
              }`}>
                <div className={`h-10 w-10 rounded-lg ${
                  theme === "dark" ? "bg-gray-700" : "bg-gray-300"
                }`} />
                <div className="mt-4 space-y-2">
                  <div className={`h-4 w-3/4 rounded ${
                    theme === "dark" ? "bg-gray-700" : "bg-gray-300"
                  }`} />
                  <div className={`h-6 w-1/2 rounded ${
                    theme === "dark" ? "bg-gray-700" : "bg-gray-300"
                  }`} />
                  <div className={`h-3 w-full rounded ${
                    theme === "dark" ? "bg-gray-700" : "bg-gray-300"
                  }`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data || Object.keys(data).length === 0) {
    return (
      <div className={`rounded-xl shadow-sm overflow-hidden ${
        theme === "dark" 
          ? "bg-gray-800/60 backdrop-blur-md border-gray-700" 
          : "bg-white/80 backdrop-blur-md border-gray-200"
      } border`}>
        <div className={`px-4 sm:px-6 py-4 sm:py-5 border-b ${
          theme === "dark" ? "border-gray-700" : "border-gray-200"
        }`}>
          <h3 className={`text-lg sm:text-xl font-bold ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}>System Health Monitor</h3>
          <p className={`mt-1 text-sm ${
            theme === "dark" ? "text-gray-400" : "text-gray-500"
          }`}>Real-time infrastructure metrics</p>
        </div>
        <div className="p-8 text-center">
          <IoMdAlert className={`mx-auto text-3xl mb-3 ${
            theme === "dark" ? "text-gray-500" : "text-gray-400"
          }`} />
          <p className={`text-sm ${
            theme === "dark" ? "text-gray-400" : "text-gray-500"
          }`}>No system load data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-xl shadow-sm overflow-hidden ${
      theme === "dark" 
        ? "bg-gray-800/60 backdrop-blur-md border-gray-700" 
        : "bg-white/80 backdrop-blur-md border-gray-200"
    } border`}>
      <div className={`px-4 sm:px-6 py-4 sm:py-5 border-b ${
        theme === "dark" ? "border-gray-700" : "border-gray-200"
      }`}>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
          <div>
            <h3 className={`text-lg sm:text-xl font-bold ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}>System Health Monitor</h3>
            <p className={`mt-1 text-sm ${
              theme === "dark" ? "text-gray-400" : "text-gray-500"
            }`}>Real-time infrastructure metrics</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <span
              className={`inline-flex items-center px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs font-medium ${
                data.status === "operational" 
                  ? theme === "dark" 
                    ? "bg-green-900/50 text-green-300" 
                    : "bg-green-100 text-green-800"
                  : theme === "dark" 
                    ? "bg-red-900/50 text-red-300" 
                    : "bg-red-100 text-red-800"
              }`}
            >
              {data.status === "operational" ? (
                <FiCheckCircle className="mr-1 w-3 h-3 sm:w-4 sm:h-4" />
              ) : (
                <FiAlertTriangle className="mr-1 w-3 h-3 sm:w-4 sm:h-4" />
              )}
              <span className="hidden xs:inline">
                {data.status === "operational" ? "All Systems Normal" : "System Degraded"}
              </span>
              <span className="xs:hidden">
                {data.status === "operational" ? "Normal" : "Degraded"}
              </span>
            </span>
            <span className={`text-xs sm:text-sm ${
              theme === "dark" ? "text-gray-400" : "text-gray-500"
            }`}>
              Updated: {format(lastUpdated, "h:mm a")}
            </span>
          </div>
        </div>
      </div>
      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {cardConfig.map((config) => (
            <motion.div
              key={config.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`rounded-xl border p-4 sm:p-5 transition-all hover:shadow-sm ${
                config.status === "critical"
                  ? theme === "dark" 
                    ? "border-red-700" 
                    : "border-red-200"
                  : config.status === "warning"
                  ? theme === "dark" 
                    ? "border-amber-700" 
                    : "border-amber-200"
                  : theme === "dark" 
                    ? "border-gray-700" 
                    : "border-gray-200"
              } ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}
            >
              <div className="flex items-start justify-between">
                <div className={`p-2 sm:p-3 rounded-lg ${config.bgColor} ${config.iconColor}`}>
                  {config.icon}
                </div>
                {config.trend && (
                  <div
                    className={`flex items-center text-xs font-medium ${
                      config.trend === "up" 
                        ? theme === "dark" 
                          ? "text-green-300" 
                          : "text-green-600"
                        : theme === "dark" 
                          ? "text-red-300" 
                          : "text-red-600"
                    }`}
                  >
                    {config.trend === "up" ? (
                      <FiArrowUp className="mr-1 w-3 h-3" />
                    ) : (
                      <FiArrowDown className="mr-1 w-3 h-3" />
                    )}
                    {config.trendValue}
                  </div>
                )}
              </div>
              <div className="mt-3 sm:mt-4">
                <h3 className={`text-xs sm:text-sm font-medium ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}>{config.title}</h3>
                <p className={`mt-1 text-lg sm:text-2xl font-bold ${
                  config.valueColor || (theme === "dark" ? "text-white" : "text-gray-900")
                }`}>
                  {config.value}
                </p>
                <p className={`mt-1 text-xs ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}>{config.comparison}</p>
                {config.gauge && (
                  <div className="mt-3 sm:mt-4">
                    {config.gauge}
                    {config.status !== "normal" && (
                      <p
                        className={`mt-1 sm:mt-2 text-xs font-medium ${
                          config.status === "critical" 
                            ? theme === "dark" 
                              ? "text-red-300" 
                              : "text-red-600"
                            : theme === "dark" 
                              ? "text-amber-300" 
                              : "text-amber-600"
                        }`}
                      >
                        {config.status === "critical" ? "Critical Level" : "Approaching Limit"}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

SystemLoadMonitor.propTypes = {
  data: PropTypes.shape({
    api_response_time: PropTypes.number,
    api_comparison: PropTypes.string,
    bandwidth_used: PropTypes.number,
    bandwidth_total: PropTypes.number,
    bandwidth_comparison: PropTypes.string,
    cpu_load: PropTypes.number,
    cpu_comparison: PropTypes.string,
    memory_load: PropTypes.number,
    memory_comparison: PropTypes.string,
    router_status: PropTypes.string,
    router_uptime: PropTypes.string,
    upload_throughput: PropTypes.number,
    download_throughput: PropTypes.number,
    throughput_comparison: PropTypes.string,
    router_temperature: PropTypes.number,
    temperature_comparison: PropTypes.string,
    firmware_version: PropTypes.string,
    firmware_comparison: PropTypes.string,
    status: PropTypes.string,
  }),
  theme: PropTypes.oneOf(["light", "dark"]),
  onLoad: PropTypes.func,
  onError: PropTypes.func,
};

export default SystemLoadMonitor;