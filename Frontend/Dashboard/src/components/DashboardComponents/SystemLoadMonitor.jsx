// import React, { useState, useEffect, useCallback, useMemo } from "react";
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
//   FiActivity
// } from "react-icons/fi";
// import { FaSpinner, FaMemory } from "react-icons/fa";
// import { IoMdAlert } from "react-icons/io";
// import { format } from "date-fns";

// const mockApi = async () => {
//   await new Promise((resolve) => setTimeout(resolve, 800));
//   return {
//     api_response_time: 142,
//     api_comparison: "vs 158ms yesterday",
//     bandwidth_used: 84,
//     bandwidth_total: 100,
//     bandwidth_comparison: "vs 78 Mbps yesterday",
//     cpu_load: 65,
//     cpu_comparison: "vs 58% last week",
//     memory_load: 70,
//     memory_comparison: "vs 65% last week",
//     status: "operational",
//     // New router-related metrics
//     router_status: "online",
//     router_uptime: "3 days 12:45:23",
//     upload_throughput: 15.2,
//     download_throughput: 28.7,
//     throughput_comparison: "vs 12.4/22.1 Mbps yesterday",
//     router_temperature: 48.5,
//     temperature_comparison: "vs 45.2°C last week",
//     firmware_version: "v6.49.6",
//     firmware_comparison: "Latest stable"
//   };
// };

// const SystemLoadMonitor = () => {
//   const [systemLoad, setSystemLoad] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [lastUpdated, setLastUpdated] = useState(null);

//   const fetchData = useCallback(async () => {
//     try {
//       setLoading(true);
//       const data = await mockApi();
//       setSystemLoad(data);
//       setLastUpdated(new Date());
//       setLoading(false);
//     } catch (err) {
//       setError(err.message || "Failed to load system metrics");
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchData();
//     const interval = setInterval(fetchData, 30000);
//     return () => clearInterval(interval);
//   }, [fetchData]);

//   const renderGauge = (value, threshold = 80) => {
//     const percentage = Math.min(Math.max(value, 0), 100);
//     const isCritical = percentage > threshold;
//     const isWarning = percentage > threshold * 0.8 && !isCritical;
    
//     return (
//       <div className="mt-4">
//         <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
//           <div
//             className={`h-2.5 rounded-full transition-all duration-500 ${
//               isCritical ? "bg-red-500" : isWarning ? "bg-amber-400" : "bg-blue-500"
//             }`}
//             style={{ width: `${percentage}%` }}
//           ></div>
//         </div>
//         <div className="flex justify-between mt-1 text-xs text-gray-500">
//           <span>0%</span>
//           <span className={`font-medium ${
//             isCritical ? "text-red-600" : isWarning ? "text-amber-600" : "text-blue-600"
//           }`}>
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
//       <div className="mt-4">
//         <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
//           <div
//             className={`h-2.5 rounded-full transition-all duration-500 ${
//               isCritical ? "bg-red-500" : isWarning ? "bg-amber-400" : "bg-blue-500"
//             }`}
//             style={{ width: `${Math.min(value / 10, 100)}%` }}
//           ></div>
//         </div>
//         <div className="flex justify-between mt-1 text-xs text-gray-500">
//           <span>0ms</span>
//           <span className={`font-medium ${
//             isCritical ? "text-red-600" : isWarning ? "text-amber-600" : "text-blue-600"
//           }`}>
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
//       <div className="mt-4">
//         <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
//           <div
//             className={`h-2.5 rounded-full transition-all duration-500 ${
//               isCritical ? "bg-red-500" : isWarning ? "bg-amber-400" : "bg-blue-500"
//             }`}
//             style={{ width: `${percentage}%` }}
//           ></div>
//         </div>
//         <div className="flex justify-between mt-1 text-xs text-gray-500">
//           <span>0 Mbps</span>
//           <span className={`font-medium ${
//             isCritical ? "text-red-600" : isWarning ? "text-amber-600" : "text-blue-600"
//           }`}>
//             {total.toFixed(1)} Mbps
//           </span>
//           <span>{totalBandwidth} Mbps</span>
//         </div>
//         <div className="mt-1 text-xs text-gray-500">
//           <span className="text-blue-600">↑ {upload.toFixed(1)} Mbps</span>
//           <span className="mx-2">/</span>
//           <span className="text-green-600">↓ {download.toFixed(1)} Mbps</span>
//         </div>
//       </div>
//     );
//   };

//   const cardConfig = useMemo(
//     () =>
//       systemLoad
//         ? [
//             {
//               key: "api",
//               icon: <FiClock className="text-2xl" />,
//               title: "API Response Time",
//               value: `${systemLoad.api_response_time}ms`,
//               comparison: systemLoad.api_comparison,
//               bgColor: "bg-indigo-100",
//               iconColor: "text-indigo-600",
//               borderColor: "border-indigo-200",
//               trend: "down",
//               trendValue: "10.1%",
//               gauge: renderResponseTimeGauge(systemLoad.api_response_time),
//               status: systemLoad.api_response_time > 500 ? "critical" : 
//                      systemLoad.api_response_time > 300 ? "warning" : "normal",
//             },
//             {
//               key: "bandwidth",
//               icon: <FiWifi className="text-2xl" />,
//               title: "Bandwidth Usage",
//               value: `${systemLoad.bandwidth_used}/${systemLoad.bandwidth_total} Mbps`,
//               comparison: systemLoad.bandwidth_comparison,
//               bgColor: "bg-teal-100",
//               iconColor: "text-teal-600",
//               borderColor: "border-teal-200",
//               trend: "up",
//               trendValue: "7.1%",
//               gauge: renderGauge((systemLoad.bandwidth_used / systemLoad.bandwidth_total) * 100),
//               status: systemLoad.bandwidth_used / systemLoad.bandwidth_total > 0.85 ? "critical" : 
//                      systemLoad.bandwidth_used / systemLoad.bandwidth_total > 0.75 ? "warning" : "normal",
//             },
//             {
//               key: "cpu",
//               icon: <FiCpu className="text-2xl" />,
//               title: "CPU Load",
//               value: `${systemLoad.cpu_load}%`,
//               comparison: systemLoad.cpu_comparison,
//               bgColor: "bg-amber-100",
//               iconColor: "text-amber-600",
//               borderColor: "border-amber-200",
//               trend: "up",
//               trendValue: "7.1%",
//               gauge: renderGauge(systemLoad.cpu_load),
//               status: systemLoad.cpu_load > 80 ? "critical" : 
//                      systemLoad.cpu_load > 70 ? "warning" : "normal",
//             },
//             {
//               key: "memory",
//               icon: <FaMemory className="text-2xl" />,
//               title: "Memory Usage",
//               value: `${systemLoad.memory_load}%`,
//               comparison: systemLoad.memory_comparison,
//               bgColor: "bg-purple-100",
//               iconColor: "text-purple-600",
//               borderColor: "border-purple-200",
//               trend: "up",
//               trendValue: "5.0%",
//               gauge: renderGauge(systemLoad.memory_load),
//               status: systemLoad.memory_load > 80 ? "critical" : 
//                      systemLoad.memory_load > 70 ? "warning" : "normal",
//             },
//             // New router-related cards (exactly 4 as requested)
//             {
//               key: "router_status",
//               icon: <FiServer className="text-2xl" />,
//               title: "Router Status",
//               value: systemLoad.router_status === "online" ? "Online" : "Offline",
//               comparison: systemLoad.router_uptime,
//               bgColor: systemLoad.router_status === "online" ? "bg-green-100" : "bg-red-100",
//               iconColor: systemLoad.router_status === "online" ? "text-green-600" : "text-red-600",
//               borderColor: systemLoad.router_status === "online" ? "border-green-200" : "border-red-200",
//               status: systemLoad.router_status === "online" ? "normal" : "critical",
//               valueColor: systemLoad.router_status === "online" ? "text-green-600" : "text-red-600"
//             },
//             {
//               key: "throughput",
//               icon: <FiActivity className="text-2xl" />,
//               title: "Network Throughput",
//               value: `${systemLoad.upload_throughput.toFixed(1)}↑ / ${systemLoad.download_throughput.toFixed(1)}↓ Mbps`,
//               comparison: systemLoad.throughput_comparison,
//               bgColor: "bg-cyan-100",
//               iconColor: "text-cyan-600",
//               borderColor: "border-cyan-200",
//               trend: "up",
//               trendValue: "15.2%",
//               gauge: renderThroughputGauge(systemLoad.upload_throughput, systemLoad.download_throughput, systemLoad.bandwidth_total),
//               status: (systemLoad.upload_throughput + systemLoad.download_throughput) > (systemLoad.bandwidth_total * 0.8) ? "critical" : 
//                      (systemLoad.upload_throughput + systemLoad.download_throughput) > (systemLoad.bandwidth_total * 0.6) ? "warning" : "normal",
//             },
//             {
//               key: "temperature",
//               icon: <FiCpu className="text-2xl" />,
//               title: "Router Temperature",
//               value: `${systemLoad.router_temperature}°C`,
//               comparison: systemLoad.temperature_comparison,
//               bgColor: "bg-orange-100",
//               iconColor: "text-orange-600",
//               borderColor: "border-orange-200",
//               trend: "up",
//               trendValue: "7.3%",
//               gauge: renderGauge(systemLoad.router_temperature, 70), // Critical above 70°C
//               status: systemLoad.router_temperature > 70 ? "critical" : 
//                      systemLoad.router_temperature > 60 ? "warning" : "normal",
//             },
//             {
//               key: "firmware",
//               icon: <FiServer className="text-2xl" />,
//               title: "Firmware Version",
//               value: systemLoad.firmware_version,
//               comparison: systemLoad.firmware_comparison,
//               bgColor: "bg-blue-100",
//               iconColor: "text-blue-600",
//               borderColor: "border-blue-200",
//               status: "normal" // Assuming firmware is up-to-date
//             }
//           ]
//         : [],
//     [systemLoad]
//   );

//   return (
//     <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//       <div className="px-6 py-5 border-b border-gray-200">
//         <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
//           <div>
//             <h3 className="text-xl font-bold text-gray-900">System Health Monitor</h3>
//             <p className="mt-1 text-sm text-gray-500">Real-time infrastructure metrics</p>
//           </div>
          
//           <div className="flex items-center gap-3">
//             {systemLoad && (
//               <span
//                 className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
//                   systemLoad.status === "operational"
//                     ? "bg-green-100 text-green-800"
//                     : "bg-red-100 text-red-800"
//                 }`}
//               >
//                 {systemLoad.status === "operational" ? (
//                   <FiCheckCircle className="mr-1.5" />
//                 ) : (
//                   <FiAlertTriangle className="mr-1.5" />
//                 )}
//                 {systemLoad.status === "operational" ? "All Systems Normal" : "System Degraded"}
//               </span>
//             )}
            
//             {lastUpdated && (
//               <span className="text-sm text-gray-500">
//                 Updated: {format(lastUpdated, "h:mm a")}
//               </span>
//             )}
//           </div>
//         </div>
//       </div>

//       <div className="p-6">
//         {loading ? (
//           <div className="h-full flex flex-col items-center justify-center space-y-4 py-12">
//             <FaSpinner className="animate-spin text-4xl text-blue-600" />
//             <p className="text-gray-600 font-semibold">Loading system metrics...</p>
//           </div>
//         ) : error ? (
//           <div className="h-full flex flex-col items-center justify-center text-center p-6">
//             <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
//               <IoMdAlert className="h-6 w-6 text-red-600" />
//             </div>
//             <h3 className="text-lg font-bold text-gray-900">Monitoring Error</h3>
//             <p className="mt-2 text-sm text-gray-600">{error}</p>
//             <button
//               onClick={fetchData}
//               className="mt-6 inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
//             >
//               <FiRefreshCw className="mr-2" />
//               Retry
//             </button>
//           </div>
//         ) : systemLoad ? (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//             {cardConfig.map((config) => (
//               <div
//                 key={config.key}
//                 className={`bg-white rounded-xl border ${
//                   config.status === "critical"
//                     ? "border-red-200"
//                     : config.status === "warning"
//                     ? "border-amber-200"
//                     : config.borderColor
//                 } p-5 transition-all hover:shadow-sm`}
//               >
//                 <div className="flex items-start justify-between">
//                   <div
//                     className={`p-3 rounded-lg ${config.bgColor} ${config.iconColor}`}
//                   >
//                     {config.icon}
//                   </div>
                  
//                   {config.trend && (
//                     <div className={`flex items-center text-xs font-medium ${
//                       config.trend === "up" ? "text-green-600" : "text-red-600"
//                     }`}>
//                       {config.trend === "up" ? (
//                         <FiArrowUp className="mr-1" />
//                       ) : (
//                         <FiArrowDown className="mr-1" />
//                       )}
//                       {config.trendValue}
//                     </div>
//                   )}
//                 </div>
                
//                 <div className="mt-4">
//                   <h3 className="text-sm font-medium text-gray-500">{config.title}</h3>
//                   <p className={`mt-1 text-2xl font-bold ${config.valueColor || "text-gray-900"}`}>{config.value}</p>
//                   <p className="mt-1 text-xs text-gray-500">{config.comparison}</p>
                  
//                   {config.gauge && (
//                     <div className="mt-4">
//                       {config.gauge}
//                       {config.status !== "normal" && (
//                         <p className={`mt-2 text-xs font-medium ${
//                           config.status === "critical" ? "text-red-600" : "text-amber-600"
//                         }`}>
//                           {config.status === "critical" ? "Critical Level" : "Approaching Limit"}
//                         </p>
//                       )}
//                     </div>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <div className="h-full flex items-center justify-center text-gray-500">
//             No system data available
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default SystemLoadMonitor;









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
// import api from "../../api";

// const SystemLoadMonitor = ({ data }) => {
//   const [lastUpdated, setLastUpdated] = useState(new Date());

//   useEffect(() => {
//     const interval = setInterval(() => setLastUpdated(new Date()), 30000);
//     return () => clearInterval(interval);
//   }, []);

//   const renderGauge = (value, threshold = 80) => {
//     const percentage = Math.min(Math.max(value, 0), 100);
//     const isCritical = percentage > threshold;
//     const isWarning = percentage > (threshold * 0.8) && !isCritical;

//     return (
//       <div className="mt-4">
//         <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
//           <div
//             className={`h-2.5 rounded-full transition-all duration-500 ${
//               isCritical ? "bg-red-500" : isWarning ? "bg-amber-400" : "bg-blue-500"
//             }`}
//             style={{ width: `${percentage}%` }}
//           ></div>
//         </div>
//         <div className="flex justify-between mt-1 text-xs text-gray-500">
//           <span>0%</span>
//           <span
//             className={`font-medium ${
//               isCritical ? "text-red-600" : isWarning ? "text-amber-600" : "text-blue-600"
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
//       <div className="mt-4">
//         <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
//           <div
//             className={`h-2.5 rounded-full transition-all duration-500 ${
//               isCritical ? "bg-red-500" : isWarning ? "bg-amber-400" : "bg-blue-500"
//             }`}
//             style={{ width: `${Math.min(value / 10, 100)}%` }}
//           ></div>
//         </div>
//         <div className="flex justify-between mt-1 text-xs text-gray-500">
//           <span>0ms</span>
//           <span
//             className={`font-medium ${
//               isCritical ? "text-red-600" : isWarning ? "text-amber-600" : "text-blue-600"
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
//       <div className="mt-4">
//         <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
//           <div
//             className={`h-2.5 rounded-full transition-all duration-500 ${
//               isCritical ? "bg-red-500" : isWarning ? "bg-amber-400" : "bg-blue-500"
//             }`}
//             style={{ width: `${percentage}%` }}
//           ></div>
//         </div>
//         <div className="flex justify-between mt-1 text-xs text-gray-500">
//           <span>0 Mbps</span>
//           <span
//             className={`font-medium ${
//               isCritical ? "text-red-600" : isWarning ? "text-amber-600" : "text-blue-600"
//             }`}
//           >
//             {total.toFixed(1)} Mbps
//           </span>
//           <span>{totalBandwidth} Mbps</span>
//         </div>
//         <div className="mt-1 text-xs text-gray-500">
//           <span className="text-blue-600">↑ {upload.toFixed(1)} Mbps</span>
//           <span className="mx-2">/</span>
//           <span className="text-green-600">↓ {download.toFixed(1)} Mbps</span>
//         </div>
//       </div>
//     );
//   };

//   const cardConfig = [
//     {
//       key: "api",
//       icon: <FiClock className="text-2xl" />,
//       title: "API Response Time",
//       value: `${data.api_response_time}ms`,
//       comparison: data.api_comparison,
//       bgColor: "bg-indigo-100",
//       iconColor: "text-indigo-600",
//       borderColor: "border-indigo-200",
//       trend: "down",
//       trendValue: "10.1%",
//       gauge: renderResponseTimeGauge(data.api_response_time),
//       status: data.api_response_time > 500 ? "critical" : data.api_response_time > 300 ? "warning" : "normal",
//     },
//     {
//       key: "bandwidth",
//       icon: <FiWifi className="text-2xl" />,
//       title: "Bandwidth Usage",
//       value: `${data.bandwidth_used}/${data.bandwidth_total} Mbps`,
//       comparison: data.bandwidth_comparison,
//       bgColor: "bg-teal-100",
//       iconColor: "text-teal-600",
//       borderColor: "border-teal-200",
//       trend: "up",
//       trendValue: "7.1%",
//       gauge: renderGauge((data.bandwidth_used / data.bandwidth_total) * 100),
//       status: (data.bandwidth_used / data.bandwidth_total) > 0.85 ? "critical" : (data.bandwidth_used / data.bandwidth_total) > 0.75 ? "warning" : "normal",
//     },
//     {
//       key: "cpu",
//       icon: <FiCpu className="text-2xl" />,
//       title: "CPU Load",
//       value: `${data.cpu_load}%`,
//       comparison: data.cpu_comparison,
//       bgColor: "bg-amber-100",
//       iconColor: "text-amber-600",
//       borderColor: "border-amber-200",
//       trend: "up",
//       trendValue: "7.1%",
//       gauge: renderGauge(data.cpu_load),
//       status: data.cpu_load > 80 ? "critical" : data.cpu_load > 70 ? "warning" : "normal",
//     },
//     {
//       key: "memory",
//       icon: <FaMemory className="text-2xl" />,
//       title: "Memory Usage",
//       value: `${data.memory_load}%`,
//       comparison: data.memory_comparison,
//       bgColor: "bg-purple-100",
//       iconColor: "text-purple-600",
//       borderColor: "border-purple-200",
//       trend: "up",
//       trendValue: "5.0%",
//       gauge: renderGauge(data.memory_load),
//       status: data.memory_load > 80 ? "critical" : data.memory_load > 70 ? "warning" : "normal",
//     },
//     {
//       key: "router_status",
//       icon: <FiServer className="text-2xl" />,
//       title: "Router Status",
//       value: data.router_status === "online" ? "Online" : "Offline",
//       comparison: data.router_uptime,
//       bgColor: data.router_status === "online" ? "bg-green-100" : "bg-red-100",
//       iconColor: data.router_status === "online" ? "text-green-600" : "text-red-600",
//       borderColor: data.router_status === "online" ? "border-green-200" : "border-red-200",
//       status: data.router_status === "online" ? "normal" : "critical",
//       valueColor: data.router_status === "online" ? "text-green-600" : "text-red-600",
//     },
//     {
//       key: "throughput",
//       icon: <FiActivity className="text-2xl" />,
//       title: "Network Throughput",
//       value: `${data.upload_throughput.toFixed(1)}↑ / ${data.download_throughput.toFixed(1)}↓ Mbps`,
//       comparison: data.throughput_comparison,
//       bgColor: "bg-cyan-100",
//       iconColor: "text-cyan-600",
//       borderColor: "border-cyan-200",
//       trend: "up",
//       trendValue: "15.2%",
//       gauge: renderThroughputGauge(data.upload_throughput, data.download_throughput, data.bandwidth_total),
//       status: (data.upload_throughput + data.download_throughput) > (data.bandwidth_total * 0.8) ? "critical" : (data.upload_throughput + data.download_throughput) > (data.bandwidth_total * 0.6) ? "warning" : "normal",
//     },
//     {
//       key: "temperature",
//       icon: <FiCpu className="text-2xl" />,
//       title: "Router Temperature",
//       value: `${data.router_temperature}°C`,
//       comparison: data.temperature_comparison,
//       bgColor: "bg-orange-100",
//       iconColor: "text-orange-600",
//       borderColor: "border-orange-200",
//       trend: "up",
//       trendValue: "7.3%",
//       gauge: renderGauge(data.router_temperature, 70),
//       status: data.router_temperature > 70 ? "critical" : data.router_temperature > 60 ? "warning" : "normal",
//     },
//     {
//       key: "firmware",
//       icon: <FiServer className="text-2xl" />,
//       title: "Firmware Version",
//       value: data.firmware_version,
//       comparison: data.firmware_comparison,
//       bgColor: "bg-blue-100",
//       iconColor: "text-blue-600",
//       borderColor: "border-blue-200",
//       status: "normal",
//     },
//   ];

//   return (
//     <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//       <div className="px-6 py-5 border-b border-gray-200">
//         <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
//           <div>
//             <h3 className="text-xl font-bold text-gray-900">System Health Monitor</h3>
//             <p className="mt-1 text-sm text-gray-500">Real-time infrastructure metrics</p>
//           </div>
//           <div className="flex items-center gap-3">
//             <span
//               className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
//                 data.status === "operational" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
//               }`}
//             >
//               {data.status === "operational" ? (
//                 <FiCheckCircle className="mr-1.5" />
//               ) : (
//                 <FiAlertTriangle className="mr-1.5" />
//               )}
//               {data.status === "operational" ? "All Systems Normal" : "System Degraded"}
//             </span>
//             <span className="text-sm text-gray-500">
//               Updated: {format(lastUpdated, "h:mm a")}
//             </span>
//           </div>
//         </div>
//       </div>
//       <div className="p-6">
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//           {cardConfig.map((config) => (
//             <div
//               key={config.key}
//               className={`bg-white rounded-xl border ${
//                 config.status === "critical"
//                   ? "border-red-200"
//                   : config.status === "warning"
//                   ? "border-amber-200"
//                   : config.borderColor
//               } p-5 transition-all hover:shadow-sm`}
//             >
//               <div className="flex items-start justify-between">
//                 <div className={`p-3 rounded-lg ${config.bgColor} ${config.iconColor}`}>
//                   {config.icon}
//                 </div>
//                 {config.trend && (
//                   <div
//                     className={`flex items-center text-xs font-medium ${
//                       config.trend === "up" ? "text-green-600" : "text-red-600"
//                     }`}
//                   >
//                     {config.trend === "up" ? (
//                       <FiArrowUp className="mr-1" />
//                     ) : (
//                       <FiArrowDown className="mr-1" />
//                     )}
//                     {config.trendValue}
//                   </div>
//                 )}
//               </div>
//               <div className="mt-4">
//                 <h3 className="text-sm font-medium text-gray-500">{config.title}</h3>
//                 <p className={`mt-1 text-2xl font-bold ${config.valueColor || "text-gray-900"}`}>
//                   {config.value}
//                 </p>
//                 <p className="mt-1 text-xs text-gray-500">{config.comparison}</p>
//                 {config.gauge && (
//                   <div className="mt-4">
//                     {config.gauge}
//                     {config.status !== "normal" && (
//                       <p
//                         className={`mt-2 text-xs font-medium ${
//                           config.status === "critical" ? "text-red-600" : "text-amber-600"
//                         }`}
//                       >
//                         {config.status === "critical" ? "Critical Level" : "Approaching Limit"}
//                       </p>
//                     )}
//                   </div>
//                 )}
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// SystemLoadMonitor.propTypes = {
//   data: PropTypes.shape({
//     api_response_time: PropTypes.number.isRequired,
//     api_comparison: PropTypes.string.isRequired,
//     bandwidth_used: PropTypes.number.isRequired,
//     bandwidth_total: PropTypes.number.isRequired,
//     bandwidth_comparison: PropTypes.string.isRequired,
//     cpu_load: PropTypes.number.isRequired,
//     cpu_comparison: PropTypes.string.isRequired,
//     memory_load: PropTypes.number.isRequired,
//     memory_comparison: PropTypes.string.isRequired,
//     router_status: PropTypes.string.isRequired,
//     router_uptime: PropTypes.string.isRequired,
//     upload_throughput: PropTypes.number.isRequired,
//     download_throughput: PropTypes.number.isRequired,
//     throughput_comparison: PropTypes.string.isRequired,
//     router_temperature: PropTypes.number.isRequired,
//     temperature_comparison: PropTypes.string.isRequired,
//     firmware_version: PropTypes.string.isRequired,
//     firmware_comparison: PropTypes.string.isRequired,
//     status: PropTypes.string.isRequired,
//   }).isRequired,
// };

// export default SystemLoadMonitor;





// // SystemLoadMonitor.jsx
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

// const SystemLoadMonitor = ({ data, theme }) => {
//   const [lastUpdated, setLastUpdated] = useState(new Date());

//   useEffect(() => {
//     const interval = setInterval(() => setLastUpdated(new Date()), 30000);
//     return () => clearInterval(interval);
//   }, []);

//   const renderGauge = (value, threshold = 80) => {
//     const percentage = Math.min(Math.max(value, 0), 100);
//     const isCritical = percentage > threshold;
//     const isWarning = percentage > (threshold * 0.8) && !isCritical;

//     return (
//       <div className="mt-4">
//         <div className={`w-full rounded-full h-2.5 overflow-hidden ${
//           theme === "dark" ? "bg-gray-700" : "bg-gray-200"
//         }`}>
//           <div
//             className={`h-2.5 rounded-full transition-all duration-500 ${
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
//       <div className="mt-4">
//         <div className={`w-full rounded-full h-2.5 overflow-hidden ${
//           theme === "dark" ? "bg-gray-700" : "bg-gray-200"
//         }`}>
//           <div
//             className={`h-2.5 rounded-full transition-all duration-500 ${
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
//       <div className="mt-4">
//         <div className={`w-full rounded-full h-2.5 overflow-hidden ${
//           theme === "dark" ? "bg-gray-700" : "bg-gray-200"
//         }`}>
//           <div
//             className={`h-2.5 rounded-full transition-all duration-500 ${
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
//       icon: <FiClock className="text-2xl" />,
//       title: "API Response Time",
//       value: `${data.api_response_time}ms`,
//       comparison: data.api_comparison,
//       bgColor: theme === "dark" ? "bg-indigo-900/50" : "bg-indigo-100",
//       iconColor: theme === "dark" ? "text-indigo-300" : "text-indigo-600",
//       borderColor: theme === "dark" ? "border-indigo-700" : "border-indigo-200",
//       trend: "down",
//       trendValue: "10.1%",
//       gauge: renderResponseTimeGauge(data.api_response_time),
//       status: data.api_response_time > 500 ? "critical" : data.api_response_time > 300 ? "warning" : "normal",
//     },
//     {
//       key: "bandwidth",
//       icon: <FiWifi className="text-2xl" />,
//       title: "Bandwidth Usage",
//       value: `${data.bandwidth_used}/${data.bandwidth_total} Mbps`,
//       comparison: data.bandwidth_comparison,
//       bgColor: theme === "dark" ? "bg-teal-900/50" : "bg-teal-100",
//       iconColor: theme === "dark" ? "text-teal-300" : "text-teal-600",
//       borderColor: theme === "dark" ? "border-teal-700" : "border-teal-200",
//       trend: "up",
//       trendValue: "7.1%",
//       gauge: renderGauge((data.bandwidth_used / data.bandwidth_total) * 100),
//       status: (data.bandwidth_used / data.bandwidth_total) > 0.85 ? "critical" : (data.bandwidth_used / data.bandwidth_total) > 0.75 ? "warning" : "normal",
//     },
//     {
//       key: "cpu",
//       icon: <FiCpu className="text-2xl" />,
//       title: "CPU Load",
//       value: `${data.cpu_load}%`,
//       comparison: data.cpu_comparison,
//       bgColor: theme === "dark" ? "bg-amber-900/50" : "bg-amber-100",
//       iconColor: theme === "dark" ? "text-amber-300" : "text-amber-600",
//       borderColor: theme === "dark" ? "border-amber-700" : "border-amber-200",
//       trend: "up",
//       trendValue: "7.1%",
//       gauge: renderGauge(data.cpu_load),
//       status: data.cpu_load > 80 ? "critical" : data.cpu_load > 70 ? "warning" : "normal",
//     },
//     {
//       key: "memory",
//       icon: <FaMemory className="text-2xl" />,
//       title: "Memory Usage",
//       value: `${data.memory_load}%`,
//       comparison: data.memory_comparison,
//       bgColor: theme === "dark" ? "bg-purple-900/50" : "bg-purple-100",
//       iconColor: theme === "dark" ? "text-purple-300" : "text-purple-600",
//       borderColor: theme === "dark" ? "border-purple-700" : "border-purple-200",
//       trend: "up",
//       trendValue: "5.0%",
//       gauge: renderGauge(data.memory_load),
//       status: data.memory_load > 80 ? "critical" : data.memory_load > 70 ? "warning" : "normal",
//     },
//     {
//       key: "router_status",
//       icon: <FiServer className="text-2xl" />,
//       title: "Router Status",
//       value: data.router_status === "online" ? "Online" : "Offline",
//       comparison: data.router_uptime,
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
//       icon: <FiActivity className="text-2xl" />,
//       title: "Network Throughput",
//       value: `${data.upload_throughput.toFixed(1)}↑ / ${data.download_throughput.toFixed(1)}↓ Mbps`,
//       comparison: data.throughput_comparison,
//       bgColor: theme === "dark" ? "bg-cyan-900/50" : "bg-cyan-100",
//       iconColor: theme === "dark" ? "text-cyan-300" : "text-cyan-600",
//       borderColor: theme === "dark" ? "border-cyan-700" : "border-cyan-200",
//       trend: "up",
//       trendValue: "15.2%",
//       gauge: renderThroughputGauge(data.upload_throughput, data.download_throughput, data.bandwidth_total),
//       status: (data.upload_throughput + data.download_throughput) > (data.bandwidth_total * 0.8) ? "critical" : (data.upload_throughput + data.download_throughput) > (data.bandwidth_total * 0.6) ? "warning" : "normal",
//     },
//     {
//       key: "temperature",
//       icon: <FiCpu className="text-2xl" />,
//       title: "Router Temperature",
//       value: `${data.router_temperature}°C`,
//       comparison: data.temperature_comparison,
//       bgColor: theme === "dark" ? "bg-orange-900/50" : "bg-orange-100",
//       iconColor: theme === "dark" ? "text-orange-300" : "text-orange-600",
//       borderColor: theme === "dark" ? "border-orange-700" : "border-orange-200",
//       trend: "up",
//       trendValue: "7.3%",
//       gauge: renderGauge(data.router_temperature, 70),
//       status: data.router_temperature > 70 ? "critical" : data.router_temperature > 60 ? "warning" : "normal",
//     },
//     {
//       key: "firmware",
//       icon: <FiServer className="text-2xl" />,
//       title: "Firmware Version",
//       value: data.firmware_version,
//       comparison: data.firmware_comparison,
//       bgColor: theme === "dark" ? "bg-blue-900/50" : "bg-blue-100",
//       iconColor: theme === "dark" ? "text-blue-300" : "text-blue-600",
//       borderColor: theme === "dark" ? "border-blue-700" : "border-blue-200",
//       status: "normal",
//     },
//   ];

//   return (
//     <div className={`rounded-xl shadow-sm overflow-hidden ${
//       theme === "dark" 
//         ? "bg-gray-800/60 backdrop-blur-md border-gray-700" 
//         : "bg-white/80 backdrop-blur-md border-gray-200"
//     } border`}>
//       <div className={`px-6 py-5 border-b ${
//         theme === "dark" ? "border-gray-700" : "border-gray-200"
//       }`}>
//         <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
//           <div>
//             <h3 className={`text-xl font-bold ${
//               theme === "dark" ? "text-white" : "text-gray-900"
//             }`}>System Health Monitor</h3>
//             <p className={`mt-1 text-sm ${
//               theme === "dark" ? "text-gray-400" : "text-gray-500"
//             }`}>Real-time infrastructure metrics</p>
//           </div>
//           <div className="flex items-center gap-3">
//             <span
//               className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
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
//                 <FiCheckCircle className="mr-1.5" />
//               ) : (
//                 <FiAlertTriangle className="mr-1.5" />
//               )}
//               {data.status === "operational" ? "All Systems Normal" : "System Degraded"}
//             </span>
//             <span className={`text-sm ${
//               theme === "dark" ? "text-gray-400" : "text-gray-500"
//             }`}>
//               Updated: {format(lastUpdated, "h:mm a")}
//             </span>
//           </div>
//         </div>
//       </div>
//       <div className="p-6">
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//           {cardConfig.map((config) => (
//             <motion.div
//               key={config.key}
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.3 }}
//               className={`rounded-xl border p-5 transition-all hover:shadow-sm ${
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
//                 <div className={`p-3 rounded-lg ${config.bgColor} ${config.iconColor}`}>
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
//                       <FiArrowUp className="mr-1" />
//                     ) : (
//                       <FiArrowDown className="mr-1" />
//                     )}
//                     {config.trendValue}
//                   </div>
//                 )}
//               </div>
//               <div className="mt-4">
//                 <h3 className={`text-sm font-medium ${
//                   theme === "dark" ? "text-gray-400" : "text-gray-500"
//                 }`}>{config.title}</h3>
//                 <p className={`mt-1 text-2xl font-bold ${
//                   config.valueColor || (theme === "dark" ? "text-white" : "text-gray-900")
//                 }`}>
//                   {config.value}
//                 </p>
//                 <p className={`mt-1 text-xs ${
//                   theme === "dark" ? "text-gray-400" : "text-gray-500"
//                 }`}>{config.comparison}</p>
//                 {config.gauge && (
//                   <div className="mt-4">
//                     {config.gauge}
//                     {config.status !== "normal" && (
//                       <p
//                         className={`mt-2 text-xs font-medium ${
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
//     api_response_time: PropTypes.number.isRequired,
//     api_comparison: PropTypes.string.isRequired,
//     bandwidth_used: PropTypes.number.isRequired,
//     bandwidth_total: PropTypes.number.isRequired,
//     bandwidth_comparison: PropTypes.string.isRequired,
//     cpu_load: PropTypes.number.isRequired,
//     cpu_comparison: PropTypes.string.isRequired,
//     memory_load: PropTypes.number.isRequired,
//     memory_comparison: PropTypes.string.isRequired,
//     router_status: PropTypes.string.isRequired,
//     router_uptime: PropTypes.string.isRequired,
//     upload_throughput: PropTypes.number.isRequired,
//     download_throughput: PropTypes.number.isRequired,
//     throughput_comparison: PropTypes.string.isRequired,
//     router_temperature: PropTypes.number.isRequired,
//     temperature_comparison: PropTypes.string.isRequired,
//     firmware_version: PropTypes.string.isRequired,
//     firmware_comparison: PropTypes.string.isRequired,
//     status: PropTypes.string.isRequired,
//   }).isRequired,
//   theme: PropTypes.oneOf(["light", "dark"]).isRequired,
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

const SystemLoadMonitor = ({ data, theme }) => {
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setLastUpdated(new Date()), 30000);
    return () => clearInterval(interval);
  }, []);

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
      value: `${data.api_response_time}ms`,
      comparison: data.api_comparison,
      bgColor: theme === "dark" ? "bg-indigo-900/50" : "bg-indigo-100",
      iconColor: theme === "dark" ? "text-indigo-300" : "text-indigo-600",
      borderColor: theme === "dark" ? "border-indigo-700" : "border-indigo-200",
      trend: "down",
      trendValue: "10.1%",
      gauge: renderResponseTimeGauge(data.api_response_time),
      status: data.api_response_time > 500 ? "critical" : data.api_response_time > 300 ? "warning" : "normal",
    },
    {
      key: "bandwidth",
      icon: <FiWifi className="text-xl sm:text-2xl" />,
      title: "Bandwidth Usage",
      value: `${data.bandwidth_used}/${data.bandwidth_total} Mbps`,
      comparison: data.bandwidth_comparison,
      bgColor: theme === "dark" ? "bg-teal-900/50" : "bg-teal-100",
      iconColor: theme === "dark" ? "text-teal-300" : "text-teal-600",
      borderColor: theme === "dark" ? "border-teal-700" : "border-teal-200",
      trend: "up",
      trendValue: "7.1%",
      gauge: renderGauge((data.bandwidth_used / data.bandwidth_total) * 100),
      status: (data.bandwidth_used / data.bandwidth_total) > 0.85 ? "critical" : (data.bandwidth_used / data.bandwidth_total) > 0.75 ? "warning" : "normal",
    },
    {
      key: "cpu",
      icon: <FiCpu className="text-xl sm:text-2xl" />,
      title: "CPU Load",
      value: `${data.cpu_load}%`,
      comparison: data.cpu_comparison,
      bgColor: theme === "dark" ? "bg-amber-900/50" : "bg-amber-100",
      iconColor: theme === "dark" ? "text-amber-300" : "text-amber-600",
      borderColor: theme === "dark" ? "border-amber-700" : "border-amber-200",
      trend: "up",
      trendValue: "7.1%",
      gauge: renderGauge(data.cpu_load),
      status: data.cpu_load > 80 ? "critical" : data.cpu_load > 70 ? "warning" : "normal",
    },
    {
      key: "memory",
      icon: <FaMemory className="text-xl sm:text-2xl" />,
      title: "Memory Usage",
      value: `${data.memory_load}%`,
      comparison: data.memory_comparison,
      bgColor: theme === "dark" ? "bg-purple-900/50" : "bg-purple-100",
      iconColor: theme === "dark" ? "text-purple-300" : "text-purple-600",
      borderColor: theme === "dark" ? "border-purple-700" : "border-purple-200",
      trend: "up",
      trendValue: "5.0%",
      gauge: renderGauge(data.memory_load),
      status: data.memory_load > 80 ? "critical" : data.memory_load > 70 ? "warning" : "normal",
    },
    {
      key: "router_status",
      icon: <FiServer className="text-xl sm:text-2xl" />,
      title: "Router Status",
      value: data.router_status === "online" ? "Online" : "Offline",
      comparison: data.router_uptime,
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
      value: `${data.upload_throughput.toFixed(1)}↑ / ${data.download_throughput.toFixed(1)}↓ Mbps`,
      comparison: data.throughput_comparison,
      bgColor: theme === "dark" ? "bg-cyan-900/50" : "bg-cyan-100",
      iconColor: theme === "dark" ? "text-cyan-300" : "text-cyan-600",
      borderColor: theme === "dark" ? "border-cyan-700" : "border-cyan-200",
      trend: "up",
      trendValue: "15.2%",
      gauge: renderThroughputGauge(data.upload_throughput, data.download_throughput, data.bandwidth_total),
      status: (data.upload_throughput + data.download_throughput) > (data.bandwidth_total * 0.8) ? "critical" : (data.upload_throughput + data.download_throughput) > (data.bandwidth_total * 0.6) ? "warning" : "normal",
    },
    {
      key: "temperature",
      icon: <FiCpu className="text-xl sm:text-2xl" />,
      title: "Router Temperature",
      value: `${data.router_temperature}°C`,
      comparison: data.temperature_comparison,
      bgColor: theme === "dark" ? "bg-orange-900/50" : "bg-orange-100",
      iconColor: theme === "dark" ? "text-orange-300" : "text-orange-600",
      borderColor: theme === "dark" ? "border-orange-700" : "border-orange-200",
      trend: "up",
      trendValue: "7.3%",
      gauge: renderGauge(data.router_temperature, 70),
      status: data.router_temperature > 70 ? "critical" : data.router_temperature > 60 ? "warning" : "normal",
    },
    {
      key: "firmware",
      icon: <FiServer className="text-xl sm:text-2xl" />,
      title: "Firmware Version",
      value: data.firmware_version,
      comparison: data.firmware_comparison,
      bgColor: theme === "dark" ? "bg-blue-900/50" : "bg-blue-100",
      iconColor: theme === "dark" ? "text-blue-300" : "text-blue-600",
      borderColor: theme === "dark" ? "border-blue-700" : "border-blue-200",
      status: "normal",
    },
  ];

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
    api_response_time: PropTypes.number.isRequired,
    api_comparison: PropTypes.string.isRequired,
    bandwidth_used: PropTypes.number.isRequired,
    bandwidth_total: PropTypes.number.isRequired,
    bandwidth_comparison: PropTypes.string.isRequired,
    cpu_load: PropTypes.number.isRequired,
    cpu_comparison: PropTypes.string.isRequired,
    memory_load: PropTypes.number.isRequired,
    memory_comparison: PropTypes.string.isRequired,
    router_status: PropTypes.string.isRequired,
    router_uptime: PropTypes.string.isRequired,
    upload_throughput: PropTypes.number.isRequired,
    download_throughput: PropTypes.number.isRequired,
    throughput_comparison: PropTypes.string.isRequired,
    router_temperature: PropTypes.number.isRequired,
    temperature_comparison: PropTypes.string.isRequired,
    firmware_version: PropTypes.string.isRequired,
    firmware_comparison: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
  }).isRequired,
  theme: PropTypes.oneOf(["light", "dark"]).isRequired,
};

export default SystemLoadMonitor;