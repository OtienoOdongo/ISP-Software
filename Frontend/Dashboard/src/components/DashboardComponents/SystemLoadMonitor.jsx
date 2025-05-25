// import React, { useState, useEffect } from "react";
// import { FaSpinner } from "react-icons/fa";
// import { HiUsers, HiOutlineWifi, HiOutlineDesktopComputer } from "react-icons/hi";

// const SystemLoadMonitor = () => {
//   const [systemLoad, setSystemLoad] = useState({
//     users_online: 0,
//     bandwidth_used: 0,
//     bandwidth_total: 100,
//     cpu_load: 0,
//     memory_load: 0,
//   });
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     // Mock data for system load
//     const mockData = {
//       users_online: 1234,
//       bandwidth_used: 84,
//       bandwidth_total: 100,
//       cpu_load: 65,
//       memory_load: 70,
//     };

//     setSystemLoad(mockData);
//     setLoading(false);
//   }, []);

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <FaSpinner className="animate-spin text-3xl text-blue-600" />
//         <span className="ml-2 text-gray-600 font-medium">Monitoring System Load...</span>
//       </div>
//     );
//   }

//   if (error) {
//     return <p className="text-center text-red-600 font-medium">{error}</p>;
//   }

//   return (
//     <div>
//       <h2 className="text-xl font-semibold text-gray-800 text-center mb-4">Real-Time System Load</h2>
//       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//         <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
//           <HiUsers className="text-3xl text-blue-500 mb-2" />
//           <p className="text-lg font-semibold text-gray-700">Users Online</p>
//           <p className="text-2xl font-bold text-gray-800">{systemLoad.users_online}</p>
//         </div>
//         <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
//           <HiOutlineWifi className="text-3xl text-green-500 mb-2" />
//           <p className="text-lg font-semibold text-gray-700">Bandwidth Usage</p>
//           <p className="text-2xl font-bold text-gray-800">
//             {systemLoad.bandwidth_used} / {systemLoad.bandwidth_total} Mbps
//           </p>
//         </div>
//         <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
//           <HiOutlineDesktopComputer className="text-3xl text-purple-500 mb-2" />
//           <p className="text-lg font-semibold text-gray-700">CPU Load</p>
//           <p className="text-2xl font-bold text-gray-800">{systemLoad.cpu_load}%</p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SystemLoadMonitor;



// import React, { useState, useEffect } from "react";
// import { 
//   FiUsers, 
//   FiWifi, 
//   FiCpu,
//   FiServer,
//   FiAlertTriangle,
//   FiRefreshCw
// } from "react-icons/fi";
// import { FaSpinner } from "react-icons/fa";
// import { IoMdAlert } from "react-icons/io";

// const SystemLoadMonitor = () => {
//   const [systemLoad, setSystemLoad] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [lastUpdated, setLastUpdated] = useState(null);

//   const fetchData = async () => {
//     try {
//       setLoading(true);
//       // Simulate API call with delay
//       await new Promise(resolve => setTimeout(resolve, 800));
      
//       const mockData = {
//         users_online: 1234,
//         users_comparison: "vs 1,102 yesterday",
//         bandwidth_used: 84,
//         bandwidth_total: 100,
//         bandwidth_comparison: "vs 78 Mbps yesterday",
//         cpu_load: 65,
//         cpu_comparison: "vs 58% last week",
//         memory_load: 70,
//         memory_comparison: "vs 65% last week",
//         status: "operational"
//       };

//       setSystemLoad(mockData);
//       setLastUpdated(new Date().toLocaleTimeString());
//       setLoading(false);
//     } catch (err) {
//       setError("Failed to load system metrics");
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchData();
    
//     // Set up polling in a real application
//     const interval = setInterval(fetchData, 30000);
//     return () => clearInterval(interval);
//   }, []);

//   const renderGauge = (value, threshold = 80) => {
//     const percentage = Math.min(Math.max(value, 0), 100);
//     const isCritical = percentage > threshold;
    
//     return (
//       <div className="mt-2">
//         <div className="w-full bg-gray-200 rounded-full h-2.5">
//           <div 
//             className={`h-2.5 rounded-full ${
//               isCritical ? "bg-red-500" : "bg-blue-500"
//             }`} 
//             style={{ width: `${percentage}%` }}
//           ></div>
//         </div>
//         <div className="flex justify-between mt-1 text-xs text-gray-500">
//           <span>0%</span>
//           <span className={`font-medium ${
//             isCritical ? "text-red-600" : "text-blue-600"
//           }`}>
//             {percentage}%
//           </span>
//           <span>100%</span>
//         </div>
//       </div>
//     );
//   };

//   const renderStatCard = (metric) => {
//     const cardConfig = {
//       users: {
//         icon: <FiUsers className="text-xl" />,
//         title: "Active Users",
//         value: metric.users_online,
//         comparison: metric.users_comparison,
//         bgColor: "bg-indigo-50",
//         iconColor: "text-indigo-600",
//         status: "normal"
//       },
//       bandwidth: {
//         icon: <FiWifi className="text-xl" />,
//         title: "Bandwidth Usage",
//         value: `${metric.bandwidth_used}/${metric.bandwidth_total} Mbps`,
//         comparison: metric.bandwidth_comparison,
//         bgColor: "bg-teal-50",
//         iconColor: "text-teal-600",
//         status: metric.bandwidth_used / metric.bandwidth_total > 0.8 ? "warning" : "normal",
//         gauge: renderGauge((metric.bandwidth_used / metric.bandwidth_total) * 100)
//       },
//       cpu: {
//         icon: <FiCpu className="text-xl" />,
//         title: "CPU Load",
//         value: `${metric.cpu_load}%`,
//         comparison: metric.cpu_comparison,
//         bgColor: "bg-amber-50",
//         iconColor: "text-amber-600",
//         status: metric.cpu_load > 80 ? "critical" : "normal",
//         gauge: renderGauge(metric.cpu_load)
//       },
//       memory: {
//         icon: <FiServer className="text-xl" />,
//         title: "Memory Usage",
//         value: `${metric.memory_load}%`,
//         comparison: metric.memory_comparison,
//         bgColor: "bg-purple-50",
//         iconColor: "text-purple-600",
//         status: metric.memory_load > 80 ? "critical" : "normal",
//         gauge: renderGauge(metric.memory_load)
//       }
//     };

//     return (
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//         {Object.entries(cardConfig).map(([key, config]) => (
//           <div 
//             key={key} 
//             className={`bg-white rounded-lg border ${
//               config.status === "critical" ? "border-red-200" : 
//               config.status === "warning" ? "border-amber-200" : "border-gray-200"
//             } p-4 transition-all hover:shadow-sm`}
//           >
//             <div className="flex items-start space-x-3">
//               <div className={`p-2 rounded-lg ${config.bgColor} ${config.iconColor}`}>
//                 {config.icon}
//               </div>
//               <div className="flex-1">
//                 <h3 className="text-sm font-medium text-gray-500">{config.title}</h3>
//                 <p className="mt-1 text-xl font-bold text-gray-900">{config.value}</p>
//                 <p className="mt-1 text-xs text-gray-500">{config.comparison}</p>
//                 {config.gauge && config.gauge}
//                 {config.status !== "normal" && (
//                   <p className={`mt-2 text-xs font-medium ${
//                     config.status === "critical" ? "text-red-600" : "text-amber-600"
//                   }`}>
//                     {config.status === "critical" ? "Critical level" : "Approaching limit"}
//                   </p>
//                 )}
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     );
//   };

//   return (
//     <div className="h-full flex flex-col">
//       <div className="px-5 pt-5 pb-3 border-b border-gray-200">
//         <div className="flex justify-between items-center">
//           <div>
//             <h3 className="text-lg font-semibold text-gray-900">System Health Monitor</h3>
//             <p className="mt-1 text-sm text-gray-500">
//               Real-time infrastructure metrics and status
//             </p>
//           </div>
//           {systemLoad && (
//             <div className="flex items-center">
//               <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
//                 systemLoad.status === "operational" 
//                   ? "bg-green-100 text-green-800" 
//                   : "bg-red-100 text-red-800"
//               }`}>
//                 {systemLoad.status === "operational" ? "Operational" : "Degraded"}
//               </span>
//             </div>
//           )}
//         </div>
//       </div>
      
//       <div className="flex-1 p-5">
//         {loading ? (
//           <div className="h-full flex flex-col items-center justify-center space-y-3">
//             <FaSpinner className="animate-spin text-3xl text-blue-600" />
//             <p className="text-gray-600 font-medium">Loading system metrics...</p>
//             <p className="text-sm text-gray-400">Monitoring infrastructure health</p>
//           </div>
//         ) : error ? (
//           <div className="h-full flex flex-col items-center justify-center text-center p-6">
//             <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
//               <IoMdAlert className="h-6 w-6 text-red-600" />
//             </div>
//             <h3 className="text-lg font-semibold text-gray-900">Monitoring Error</h3>
//             <p className="mt-2 text-sm text-gray-600">{error}</p>
//             <button
//               onClick={fetchData}
//               className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
//             >
//               <FiRefreshCw className="mr-2" />
//               Retry
//             </button>
//           </div>
//         ) : systemLoad ? (
//           renderStatCard(systemLoad)
//         ) : (
//           <div className="h-full flex items-center justify-center text-gray-500">
//             No system data available
//           </div>
//         )}
//       </div>
      
//       {lastUpdated && (
//         <div className="px-5 py-3 border-t border-gray-200 text-xs text-gray-500 flex justify-between items-center">
//           <span>Last updated: {lastUpdated}</span>
//           <button 
//             onClick={fetchData}
//             className="text-blue-600 hover:text-blue-800 flex items-center"
//           >
//             <FiRefreshCw className="mr-1" />
//             Refresh
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default SystemLoadMonitor;









// import React, { useState, useEffect, useCallback, useMemo } from "react";
// import {
//   FiUsers,
//   FiWifi,
//   FiCpu,
//   FiServer,
//   FiRefreshCw,
//   FiAlertTriangle,
//   FiCheckCircle,
// } from "react-icons/fi";
// import { FaSpinner } from "react-icons/fa";
// import { IoMdAlert } from "react-icons/io";
// import { format } from "date-fns";

// // Mock API for development
// const mockApi = async () => {
//   await new Promise((resolve) => setTimeout(resolve, 800));
//   return {
//     users_online: 1234,
//     users_comparison: "vs 1,102 yesterday",
//     bandwidth_used: 84,
//     bandwidth_total: 100,
//     bandwidth_comparison: "vs 78 Mbps yesterday",
//     cpu_load: 65,
//     cpu_comparison: "vs 58% last week",
//     memory_load: 70,
//     memory_comparison: "vs 65% last week",
//     status: "operational",
//   };
// };

// const SystemLoadMonitor = () => {
//   const [systemLoad, setSystemLoad] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [lastUpdated, setLastUpdated] = useState(null);
//   const [expandedCard, setExpandedCard] = useState(null);

//   const fetchData = useCallback(async () => {
//     try {
//       setLoading(true);
//       let data;
//       try {
//         // Replace with real API endpoint or WebSocket
//         const response = await fetch("/api/system-metrics");
//         if (!response.ok) throw new Error("Failed to fetch system metrics");
//         data = await response.json();
//       } catch (apiError) {
//         // Fallback to mock data
//         data = await mockApi();
//       }
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
//     // Simulate WebSocket for real-time updates
//     const interval = setInterval(fetchData, 30000);
//     return () => clearInterval(interval);
//   }, [fetchData]);

//   const renderGauge = (value, threshold = 80) => {
//     const percentage = Math.min(Math.max(value, 0), 100);
//     const isCritical = percentage > threshold;
//     return (
//       <div className="mt-3">
//         <div className="w-full bg-gray-200 rounded-full h-3">
//           <div
//             className={`h-3 rounded-full transition-all duration-500 ${
//               isCritical ? "bg-red-500" : "bg-blue-500"
//             }`}
//             style={{ width: `${percentage}%` }}
//           ></div>
//         </div>
//         <div className="flex justify-between mt-2 text-xs text-gray-500">
//           <span>0%</span>
//           <span className={`font-semibold ${isCritical ? "text-red-600" : "text-blue-600"}`}>
//             {percentage}%
//           </span>
//           <span>100%</span>
//         </div>
//       </div>
//     );
//   };

//   const cardConfig = useMemo(
//     () =>
//       systemLoad
//         ? [
//             {
//               key: "users",
//               icon: <FiUsers className="text-2xl" />,
//               title: "Active Users",
//               value: systemLoad.users_online.toLocaleString(),
//               comparison: systemLoad.users_comparison,
//               bgColor: "bg-indigo-50",
//               iconColor: "text-indigo-600",
//               status: "normal",
//             },
//             {
//               key: "bandwidth",
//               icon: <FiWifi className="text-2xl" />,
//               title: "Bandwidth Usage",
//               value: `${systemLoad.bandwidth_used}/${systemLoad.bandwidth_total} Mbps`,
//               comparison: systemLoad.bandwidth_comparison,
//               bgColor: "bg-teal-50",
//               iconColor: "text-teal-600",
//               status:
//                 systemLoad.bandwidth_used / systemLoad.bandwidth_total > 0.8 ? "warning" : "normal",
//               gauge: renderGauge((systemLoad.bandwidth_used / systemLoad.bandwidth_total) * 100),
//             },
//             {
//               key: "cpu",
//               icon: <FiCpu className="text-2xl" />,
//               title: "CPU Load",
//               value: `${systemLoad.cpu_load}%`,
//               comparison: systemLoad.cpu_comparison,
//               bgColor: "bg-amber-50",
//               iconColor: "text-amber-600",
//               status: systemLoad.cpu_load > 80 ? "critical" : "normal",
//               gauge: renderGauge(systemLoad.cpu_load),
//             },
//             {
//               key: "memory",
//               icon: <FiServer className="text-2xl" />,
//               title: "Memory Usage",
//               value: `${systemLoad.memory_load}%`,
//               comparison: systemLoad.memory_comparison,
//               bgColor: "bg-purple-50",
//               iconColor: "text-purple-600",
//               status: systemLoad.memory_load > 80 ? "critical" : "normal",
//               gauge: renderGauge(systemLoad.memory_load),
//             },
//           ]
//         : [],
//     [systemLoad]
//   );

//   const toggleCard = (key) => {
//     setExpandedCard(expandedCard === key ? null : key);
//   };

//   return (
//     <div className="flex flex-col h-full bg-gray-50 rounded-2xl">
//       <div className="px-6 pt-6 pb-4 border-b border-gray-200">
//         <div className="flex justify-between items-center">
//           <div>
//             <h3 className="text-xl font-bold text-gray-900">System Health Monitor</h3>
//             <p className="mt-1 text-sm text-gray-500">Real-time infrastructure metrics and status</p>
//           </div>
//           {systemLoad && (
//             <span
//               className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
//                 systemLoad.status === "operational"
//                   ? "bg-green-100 text-green-800"
//                   : "bg-red-100 text-red-800"
//               }`}
//             >
//               {systemLoad.status === "operational" ? (
//                 <FiCheckCircle className="mr-1" />
//               ) : (
//                 <FiAlertTriangle className="mr-1" />
//               )}
//               {systemLoad.status === "operational" ? "Operational" : "Degraded"}
//             </span>
//           )}
//         </div>
//       </div>

//       <div className="flex-1 p-6">
//         {loading ? (
//           <div className="h-full flex flex-col items-center justify-center space-y-4">
//             <FaSpinner className="animate-spin text-4xl text-blue-600" />
//             <p className="text-gray-600 font-semibold">Loading system metrics...</p>
//             <p className="text-sm text-gray-400">Monitoring infrastructure health</p>
//           </div>
//         ) : error ? (
//           <div className="h-full flex flex-col items-center justify-center text-center p-6">
//             <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
//               <IoMdAlert className="h-6 w-6 text-red-600" />
//             </div>
//             <h3 className="text-xl font-bold text-gray-900">Monitoring Error</h3>
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
//                 className={`bg-white rounded-2xl border ${
//                   config.status === "critical"
//                     ? "border-red-200"
//                     : config.status === "warning"
//                     ? "border-amber-200"
//                     : "border-gray-200"
//                 } p-6 transition-all hover:shadow-lg cursor-pointer`}
//                 onClick={() => toggleCard(config.key)}
//                 role="button"
//                 tabIndex={0}
//                 aria-expanded={expandedCard === config.key}
//               >
//                 <div className="flex items-start space-x-4">
//                   <div
//                     className={`p-3 rounded-xl ${config.bgColor} ${config.iconColor}`}
//                     aria-hidden="true"
//                   >
//                     {config.icon}
//                   </div>
//                   <div className="flex-1">
//                     <h3 className="text-sm font-semibold text-gray-600">{config.title}</h3>
//                     <p className="mt-1 text-xl font-bold text-gray-900">{config.value}</p>
//                     <p className="mt-1 text-xs text-gray-500">{config.comparison}</p>
//                     {config.gauge && (
//                       <div className={expandedCard === config.key ? "block" : "hidden sm:block"}>
//                         {config.gauge}
//                       </div>
//                     )}
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

//       {lastUpdated && (
//         <div className="px-6 py-4 border-t border-gray-200 text-xs text-gray-500 flex justify-between items-center">
//           <span>Last updated: {format(lastUpdated, "PPp")}</span>
//           <button
//             onClick={fetchData}
//             className="text-blue-600 hover:text-blue-800 flex items-center text-sm font-medium"
//           >
//             <FiRefreshCw className="mr-1" />
//             Refresh
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default SystemLoadMonitor;





// import React, { useState, useEffect, useCallback, useMemo } from "react";
// import {
//   FiUsers,
//   FiWifi,
//   FiCpu,
//   FiServer,
//   FiRefreshCw,
//   FiAlertTriangle,
//   FiCheckCircle,
//   FiArrowUp,
//   FiArrowDown,
// } from "react-icons/fi";
// import { FaSpinner } from "react-icons/fa";
// import { IoMdAlert } from "react-icons/io";
// import { format } from "date-fns";

// const mockApi = async () => {
//   await new Promise((resolve) => setTimeout(resolve, 800));
//   return {
//     users_online: 1234,
//     users_comparison: "vs 1,102 yesterday",
//     bandwidth_used: 84,
//     bandwidth_total: 100,
//     bandwidth_comparison: "vs 78 Mbps yesterday",
//     cpu_load: 65,
//     cpu_comparison: "vs 58% last week",
//     memory_load: 70,
//     memory_comparison: "vs 65% last week",
//     status: "operational",
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

//   const cardConfig = useMemo(
//     () =>
//       systemLoad
//         ? [
//             {
//               key: "users",
//               icon: <FiUsers className="text-2xl" />,
//               title: "Active Users",
//               value: systemLoad.users_online.toLocaleString(),
//               comparison: systemLoad.users_comparison,
//               bgColor: "bg-indigo-100",
//               iconColor: "text-indigo-600",
//               borderColor: "border-indigo-200",
//               trend: "up",
//               trendValue: "5.2%",
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
//               trendValue: "4.2%",
//               gauge: renderGauge((systemLoad.bandwidth_used / systemLoad.bandwidth_total) * 100),
//               status:
//                 systemLoad.bandwidth_used / systemLoad.bandwidth_total > 0.8 ? "warning" : "normal",
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
//               status: systemLoad.cpu_load > 80 ? "critical" : systemLoad.cpu_load > 70 ? "warning" : "normal",
//             },
//             {
//               key: "memory",
//               icon: <FiServer className="text-2xl" />,
//               title: "Memory Usage",
//               value: `${systemLoad.memory_load}%`,
//               comparison: systemLoad.memory_comparison,
//               bgColor: "bg-purple-100",
//               iconColor: "text-purple-600",
//               borderColor: "border-purple-200",
//               trend: "up",
//               trendValue: "5.0%",
//               gauge: renderGauge(systemLoad.memory_load),
//               status: systemLoad.memory_load > 80 ? "critical" : systemLoad.memory_load > 70 ? "warning" : "normal",
//             },
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
//                   <p className="mt-1 text-2xl font-bold text-gray-900">{config.value}</p>
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






// import React, { useState, useEffect, useCallback, useMemo } from "react";
// import {
//   FiUsers,
//   FiWifi,
//   FiCpu,
//   FiServer,
//   FiRefreshCw,
//   FiAlertTriangle,
//   FiCheckCircle,
//   FiArrowUp,
//   FiArrowDown,
// } from "react-icons/fi";
// import { FaSpinner } from "react-icons/fa";
// import { IoMdAlert } from "react-icons/io";
// import { format } from "date-fns";

// const mockApi = async () => {
//   await new Promise((resolve) => setTimeout(resolve, 800));
//   return {
//     users_online: 1234,
//     users_comparison: "vs 1,102 yesterday",
//     bandwidth_used: 84,
//     bandwidth_total: 100,
//     bandwidth_comparison: "vs 78 Mbps yesterday",
//     cpu_load: 65,
//     cpu_comparison: "vs 58% last week",
//     memory_load: 70,
//     memory_comparison: "vs 65% last week",
//     status: "operational",
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

//   const cardConfig = useMemo(
//     () =>
//       systemLoad
//         ? [
//             {
//               key: "users",
//               icon: <FiUsers className="text-2xl" />,
//               title: "Active Users",
//               value: systemLoad.users_online.toLocaleString(),
//               comparison: systemLoad.users_comparison,
//               bgColor: "bg-indigo-100",
//               iconColor: "text-indigo-600",
//               borderColor: "border-indigo-200",
//               trend: "up",
//               trendValue: "5.2%",
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
//               trendValue: "4.2%",
//               gauge: renderGauge((systemLoad.bandwidth_used / systemLoad.bandwidth_total) * 100),
//               status:
//                 systemLoad.bandwidth_used / systemLoad.bandwidth_total > 0.8 ? "warning" : "normal",
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
//               status: systemLoad.cpu_load > 80 ? "critical" : systemLoad.cpu_load > 70 ? "warning" : "normal",
//             },
//             {
//               key: "memory",
//               icon: <FiServer className="text-2xl" />,
//               title: "Memory Usage",
//               value: `${systemLoad.memory_load}%`,
//               comparison: systemLoad.memory_comparison,
//               bgColor: "bg-purple-100",
//               iconColor: "text-purple-600",
//               borderColor: "border-purple-200",
//               trend: "up",
//               trendValue: "5.0%",
//               gauge: renderGauge(systemLoad.memory_load),
//               status: systemLoad.memory_load > 80 ? "critical" : systemLoad.memory_load > 70 ? "warning" : "normal",
//             },
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
//                   <p className="mt-1 text-2xl font-bold text-gray-900">{config.value}</p>
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
//   FiClock
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
//                   <p className="mt-1 text-2xl font-bold text-gray-900">{config.value}</p>
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










import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  FiActivity
} from "react-icons/fi";
import { FaSpinner, FaMemory } from "react-icons/fa";
import { IoMdAlert } from "react-icons/io";
import { format } from "date-fns";

const mockApi = async () => {
  await new Promise((resolve) => setTimeout(resolve, 800));
  return {
    api_response_time: 142,
    api_comparison: "vs 158ms yesterday",
    bandwidth_used: 84,
    bandwidth_total: 100,
    bandwidth_comparison: "vs 78 Mbps yesterday",
    cpu_load: 65,
    cpu_comparison: "vs 58% last week",
    memory_load: 70,
    memory_comparison: "vs 65% last week",
    status: "operational",
    // New router-related metrics
    router_status: "online",
    router_uptime: "3 days 12:45:23",
    upload_throughput: 15.2,
    download_throughput: 28.7,
    throughput_comparison: "vs 12.4/22.1 Mbps yesterday",
    router_temperature: 48.5,
    temperature_comparison: "vs 45.2°C last week",
    firmware_version: "v6.49.6",
    firmware_comparison: "Latest stable"
  };
};

const SystemLoadMonitor = () => {
  const [systemLoad, setSystemLoad] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await mockApi();
      setSystemLoad(data);
      setLastUpdated(new Date());
      setLoading(false);
    } catch (err) {
      setError(err.message || "Failed to load system metrics");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const renderGauge = (value, threshold = 80) => {
    const percentage = Math.min(Math.max(value, 0), 100);
    const isCritical = percentage > threshold;
    const isWarning = percentage > threshold * 0.8 && !isCritical;
    
    return (
      <div className="mt-4">
        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
          <div
            className={`h-2.5 rounded-full transition-all duration-500 ${
              isCritical ? "bg-red-500" : isWarning ? "bg-amber-400" : "bg-blue-500"
            }`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-1 text-xs text-gray-500">
          <span>0%</span>
          <span className={`font-medium ${
            isCritical ? "text-red-600" : isWarning ? "text-amber-600" : "text-blue-600"
          }`}>
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
      <div className="mt-4">
        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
          <div
            className={`h-2.5 rounded-full transition-all duration-500 ${
              isCritical ? "bg-red-500" : isWarning ? "bg-amber-400" : "bg-blue-500"
            }`}
            style={{ width: `${Math.min(value / 10, 100)}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-1 text-xs text-gray-500">
          <span>0ms</span>
          <span className={`font-medium ${
            isCritical ? "text-red-600" : isWarning ? "text-amber-600" : "text-blue-600"
          }`}>
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
      <div className="mt-4">
        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
          <div
            className={`h-2.5 rounded-full transition-all duration-500 ${
              isCritical ? "bg-red-500" : isWarning ? "bg-amber-400" : "bg-blue-500"
            }`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-1 text-xs text-gray-500">
          <span>0 Mbps</span>
          <span className={`font-medium ${
            isCritical ? "text-red-600" : isWarning ? "text-amber-600" : "text-blue-600"
          }`}>
            {total.toFixed(1)} Mbps
          </span>
          <span>{totalBandwidth} Mbps</span>
        </div>
        <div className="mt-1 text-xs text-gray-500">
          <span className="text-blue-600">↑ {upload.toFixed(1)} Mbps</span>
          <span className="mx-2">/</span>
          <span className="text-green-600">↓ {download.toFixed(1)} Mbps</span>
        </div>
      </div>
    );
  };

  const cardConfig = useMemo(
    () =>
      systemLoad
        ? [
            {
              key: "api",
              icon: <FiClock className="text-2xl" />,
              title: "API Response Time",
              value: `${systemLoad.api_response_time}ms`,
              comparison: systemLoad.api_comparison,
              bgColor: "bg-indigo-100",
              iconColor: "text-indigo-600",
              borderColor: "border-indigo-200",
              trend: "down",
              trendValue: "10.1%",
              gauge: renderResponseTimeGauge(systemLoad.api_response_time),
              status: systemLoad.api_response_time > 500 ? "critical" : 
                     systemLoad.api_response_time > 300 ? "warning" : "normal",
            },
            {
              key: "bandwidth",
              icon: <FiWifi className="text-2xl" />,
              title: "Bandwidth Usage",
              value: `${systemLoad.bandwidth_used}/${systemLoad.bandwidth_total} Mbps`,
              comparison: systemLoad.bandwidth_comparison,
              bgColor: "bg-teal-100",
              iconColor: "text-teal-600",
              borderColor: "border-teal-200",
              trend: "up",
              trendValue: "7.1%",
              gauge: renderGauge((systemLoad.bandwidth_used / systemLoad.bandwidth_total) * 100),
              status: systemLoad.bandwidth_used / systemLoad.bandwidth_total > 0.85 ? "critical" : 
                     systemLoad.bandwidth_used / systemLoad.bandwidth_total > 0.75 ? "warning" : "normal",
            },
            {
              key: "cpu",
              icon: <FiCpu className="text-2xl" />,
              title: "CPU Load",
              value: `${systemLoad.cpu_load}%`,
              comparison: systemLoad.cpu_comparison,
              bgColor: "bg-amber-100",
              iconColor: "text-amber-600",
              borderColor: "border-amber-200",
              trend: "up",
              trendValue: "7.1%",
              gauge: renderGauge(systemLoad.cpu_load),
              status: systemLoad.cpu_load > 80 ? "critical" : 
                     systemLoad.cpu_load > 70 ? "warning" : "normal",
            },
            {
              key: "memory",
              icon: <FaMemory className="text-2xl" />,
              title: "Memory Usage",
              value: `${systemLoad.memory_load}%`,
              comparison: systemLoad.memory_comparison,
              bgColor: "bg-purple-100",
              iconColor: "text-purple-600",
              borderColor: "border-purple-200",
              trend: "up",
              trendValue: "5.0%",
              gauge: renderGauge(systemLoad.memory_load),
              status: systemLoad.memory_load > 80 ? "critical" : 
                     systemLoad.memory_load > 70 ? "warning" : "normal",
            },
            // New router-related cards (exactly 4 as requested)
            {
              key: "router_status",
              icon: <FiServer className="text-2xl" />,
              title: "Router Status",
              value: systemLoad.router_status === "online" ? "Online" : "Offline",
              comparison: systemLoad.router_uptime,
              bgColor: systemLoad.router_status === "online" ? "bg-green-100" : "bg-red-100",
              iconColor: systemLoad.router_status === "online" ? "text-green-600" : "text-red-600",
              borderColor: systemLoad.router_status === "online" ? "border-green-200" : "border-red-200",
              status: systemLoad.router_status === "online" ? "normal" : "critical",
              valueColor: systemLoad.router_status === "online" ? "text-green-600" : "text-red-600"
            },
            {
              key: "throughput",
              icon: <FiActivity className="text-2xl" />,
              title: "Network Throughput",
              value: `${systemLoad.upload_throughput.toFixed(1)}↑ / ${systemLoad.download_throughput.toFixed(1)}↓ Mbps`,
              comparison: systemLoad.throughput_comparison,
              bgColor: "bg-cyan-100",
              iconColor: "text-cyan-600",
              borderColor: "border-cyan-200",
              trend: "up",
              trendValue: "15.2%",
              gauge: renderThroughputGauge(systemLoad.upload_throughput, systemLoad.download_throughput, systemLoad.bandwidth_total),
              status: (systemLoad.upload_throughput + systemLoad.download_throughput) > (systemLoad.bandwidth_total * 0.8) ? "critical" : 
                     (systemLoad.upload_throughput + systemLoad.download_throughput) > (systemLoad.bandwidth_total * 0.6) ? "warning" : "normal",
            },
            {
              key: "temperature",
              icon: <FiCpu className="text-2xl" />,
              title: "Router Temperature",
              value: `${systemLoad.router_temperature}°C`,
              comparison: systemLoad.temperature_comparison,
              bgColor: "bg-orange-100",
              iconColor: "text-orange-600",
              borderColor: "border-orange-200",
              trend: "up",
              trendValue: "7.3%",
              gauge: renderGauge(systemLoad.router_temperature, 70), // Critical above 70°C
              status: systemLoad.router_temperature > 70 ? "critical" : 
                     systemLoad.router_temperature > 60 ? "warning" : "normal",
            },
            {
              key: "firmware",
              icon: <FiServer className="text-2xl" />,
              title: "Firmware Version",
              value: systemLoad.firmware_version,
              comparison: systemLoad.firmware_comparison,
              bgColor: "bg-blue-100",
              iconColor: "text-blue-600",
              borderColor: "border-blue-200",
              status: "normal" // Assuming firmware is up-to-date
            }
          ]
        : [],
    [systemLoad]
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">System Health Monitor</h3>
            <p className="mt-1 text-sm text-gray-500">Real-time infrastructure metrics</p>
          </div>
          
          <div className="flex items-center gap-3">
            {systemLoad && (
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  systemLoad.status === "operational"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {systemLoad.status === "operational" ? (
                  <FiCheckCircle className="mr-1.5" />
                ) : (
                  <FiAlertTriangle className="mr-1.5" />
                )}
                {systemLoad.status === "operational" ? "All Systems Normal" : "System Degraded"}
              </span>
            )}
            
            {lastUpdated && (
              <span className="text-sm text-gray-500">
                Updated: {format(lastUpdated, "h:mm a")}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center space-y-4 py-12">
            <FaSpinner className="animate-spin text-4xl text-blue-600" />
            <p className="text-gray-600 font-semibold">Loading system metrics...</p>
          </div>
        ) : error ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
              <IoMdAlert className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Monitoring Error</h3>
            <p className="mt-2 text-sm text-gray-600">{error}</p>
            <button
              onClick={fetchData}
              className="mt-6 inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              <FiRefreshCw className="mr-2" />
              Retry
            </button>
          </div>
        ) : systemLoad ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {cardConfig.map((config) => (
              <div
                key={config.key}
                className={`bg-white rounded-xl border ${
                  config.status === "critical"
                    ? "border-red-200"
                    : config.status === "warning"
                    ? "border-amber-200"
                    : config.borderColor
                } p-5 transition-all hover:shadow-sm`}
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`p-3 rounded-lg ${config.bgColor} ${config.iconColor}`}
                  >
                    {config.icon}
                  </div>
                  
                  {config.trend && (
                    <div className={`flex items-center text-xs font-medium ${
                      config.trend === "up" ? "text-green-600" : "text-red-600"
                    }`}>
                      {config.trend === "up" ? (
                        <FiArrowUp className="mr-1" />
                      ) : (
                        <FiArrowDown className="mr-1" />
                      )}
                      {config.trendValue}
                    </div>
                  )}
                </div>
                
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-500">{config.title}</h3>
                  <p className={`mt-1 text-2xl font-bold ${config.valueColor || "text-gray-900"}`}>{config.value}</p>
                  <p className="mt-1 text-xs text-gray-500">{config.comparison}</p>
                  
                  {config.gauge && (
                    <div className="mt-4">
                      {config.gauge}
                      {config.status !== "normal" && (
                        <p className={`mt-2 text-xs font-medium ${
                          config.status === "critical" ? "text-red-600" : "text-amber-600"
                        }`}>
                          {config.status === "critical" ? "Critical Level" : "Approaching Limit"}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            No system data available
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemLoadMonitor;