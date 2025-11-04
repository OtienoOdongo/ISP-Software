


// // src/components/NetworkManagement/BandwidthAllocation.jsx
// import React, { useState, useEffect, useCallback, useMemo } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   Server, RefreshCw, BarChart2, AlertTriangle, Edit,
//   ChevronDown, ChevronUp, X, CheckCircle, Search, Eye, EyeOff, Terminal, Activity
// } from "lucide-react";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { ThreeDots } from "react-loader-spinner";
// import { Bar, Line } from "react-chartjs-2";
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend,
//   PointElement,
//   LineElement,
//   Filler
// } from "chart.js";
// import api from "../../api";
// import { useTheme } from "../../context/ThemeContext";

// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend,
//   PointElement,
//   LineElement,
//   Filler
// );

// const BandwidthAllocation = () => {
//   const { theme } = useTheme();
//   const [bandwidthData, setBandwidthData] = useState([]);
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [selectedDevice, setSelectedDevice] = useState(null);
//   const [newAllocation, setNewAllocation] = useState("");
//   const [newQos, setNewQos] = useState("");
//   const [isLoading, setIsLoading] = useState(true);
//   const [isUpdating, setIsUpdating] = useState(false);
//   const [error, setError] = useState("");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [chartType, setChartType] = useState("bar");
//   const [showChart, setShowChart] = useState(true);
//   const [filter, setFilter] = useState("all");
//   const [expandedUser, setExpandedUser] = useState(null);
//   const [chartStats, setChartStats] = useState({ top_users: [], stats: {} });
//   const [qosProfiles, setQosProfiles] = useState([]);
//   const [plans, setPlans] = useState([]);
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

//   // Theme-based styling variables
//   const containerClass = useMemo(() => 
//     theme === "dark" 
//       ? "bg-gradient-to-br from-gray-900 to-indigo-900 text-white min-h-screen" 
//       : "bg-gray-50 text-gray-800 min-h-screen",
//     [theme]
//   );

//   const cardClass = useMemo(() => 
//     theme === "dark"
//       ? "bg-gray-800/80 backdrop-blur-md border border-gray-700 rounded-xl shadow-md"
//       : "bg-white/80 backdrop-blur-md border border-gray-200 rounded-xl shadow-md",
//     [theme]
//   );

//   const inputClass = useMemo(() => 
//     theme === "dark"
//       ? "bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500"
//       : "bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:ring-indigo-500 focus:border-indigo-500",
//     [theme]
//   );

//   const textSecondaryClass = useMemo(() => 
//     theme === "dark" ? "text-gray-400" : "text-gray-500",
//     [theme]
//   );

//   const textTertiaryClass = useMemo(() => 
//     theme === "dark" ? "text-gray-500" : "text-gray-400",
//     [theme]
//   );

//   // Memoized data fetching functions
//   const fetchQosProfiles = useCallback(async () => {
//     try {
//       const response = await api.get("/api/network_management/qos-profiles/");
//       setQosProfiles(response.data);
//     } catch (error) {
//       console.error("Error fetching QoS profiles:", error);
//       toast.error("Failed to fetch QoS profiles");
//     }
//   }, []);

//   const fetchPlans = useCallback(async () => {
//     try {
//       const response = await api.get("/api/internet_plans/");
//       setPlans(response.data);
//     } catch (error) {
//       console.error("Error fetching plans:", error);
//       toast.error("Failed to fetch plans");
//     }
//   }, []);

//   const fetchData = useCallback(async () => {
//     setIsLoading(true);
//     try {
//       const response = await api.get("/api/network_management/allocations/", {
//         params: { 
//           status: filter !== "all" ? filter : undefined, 
//           search: searchTerm || undefined 
//         }
//       });
      
//       const formattedData = response.data.map(allocation => ({
//         id: allocation.id,
//         name: allocation.client?.full_name || "Unknown",
//         plan: {
//           name: allocation.plan?.name || "Unknown",
//           category: allocation.plan?.category || "Unknown"
//         },
//         status: allocation.status,
//         lastSeen: allocation.last_used,
//         devices: [
//           {
//             deviceId: allocation.id,
//             mac: allocation.mac_address,
//             allocated: allocation.allocated_bandwidth === "Unlimited" ? "Unlimited" : parseFloat(allocation.allocated_bandwidth.replace("GB", "")),
//             quota: allocation.quota === "Unlimited" ? "Unlimited" : parseFloat(allocation.quota.replace("GB", "")),
//             used: allocation.used_bandwidth,
//             qos: allocation.priority,
//             unlimited: allocation.allocated_bandwidth === "Unlimited",
//             ip: allocation.ip_address,
//             connectedAt: allocation.last_used
//           }
//         ]
//       }));
      
//       setBandwidthData(formattedData);
//     } catch (error) {
//       console.error("Error fetching bandwidth data:", error);
//       setError("Failed to fetch bandwidth data.");
//       toast.error(error.response?.data?.error || "Failed to fetch bandwidth data");
//     } finally {
//       setIsLoading(false);
//     }
//   }, [filter, searchTerm]);

//   const fetchStats = useCallback(async () => {
//     try {
//       const response = await api.get("/api/network_management/usage-stats/");
//       setChartStats(response.data);
//     } catch (error) {
//       console.error("Error fetching usage stats:", error);
//       toast.error("Failed to fetch usage stats");
//     }
//   }, []);

//   // Effect for initial data loading and periodic updates
//   useEffect(() => {
//     fetchData();
//     fetchStats();
//     fetchQosProfiles();
//     fetchPlans();
    
//     const interval = setInterval(fetchData, 30000);
//     return () => clearInterval(interval);
//   }, [fetchData, fetchStats, fetchQosProfiles, fetchPlans]);

//   // Algorithm for updating bandwidth allocation
//   const updateBandwidth = useCallback(async (userId, deviceId, newAllocation, newQos) => {
//     setIsUpdating(true);
//     try {
//       const qosProfile = qosProfiles.find(profile => profile.priority === newQos);
//       await api.put(`/api/network_management/allocations/${deviceId}/`, {
//         allocated_bandwidth: newAllocation === "Unlimited" ? "Unlimited" : `${newAllocation}GB`,
//         quota: newAllocation === "Unlimited" ? "Unlimited" : `${newAllocation}GB`,
//         priority: newQos,
//         qos_profile: qosProfile ? qosProfile.id : null
//       });

//       // Optimistic update algorithm
//       setBandwidthData(prevData =>
//         prevData.map(user =>
//           user.id === userId ? {
//             ...user,
//             devices: user.devices.map(device =>
//               device.deviceId === deviceId ? {
//                 ...device,
//                 allocated: newAllocation === "Unlimited" ? "Unlimited" : parseInt(newAllocation),
//                 quota: newAllocation === "Unlimited" ? "Unlimited" : parseInt(newAllocation),
//                 qos: newQos,
//                 unlimited: newAllocation === "Unlimited"
//               } : device
//             )
//           } : user
//         )
//       );
      
//       toast.success("Bandwidth updated successfully!");
//       await fetchStats();
//     } catch (error) {
//       console.error("Error updating bandwidth allocation:", error);
//       toast.error(error.response?.data?.error || "Failed to update bandwidth");
//     } finally {
//       setIsUpdating(false);
//     }
//   }, [fetchStats, qosProfiles]);

//   // Algorithm for checking bandwidth quota status
//   const checkBandwidthQuota = useCallback((device) => {
//     if (device.unlimited) {
//       return { status: "Unlimited", message: "Unlimited", color: theme === "dark" ? "text-blue-400" : "text-blue-600" };
//     }
    
//     const remaining = device.quota - device.used;
//     const usagePercentage = (device.used / device.quota) * 100;
    
//     if (usagePercentage >= 90) {
//       return { status: "Critical", message: `${remaining} GB left`, color: theme === "dark" ? "text-red-400" : "text-red-600" };
//     } else if (usagePercentage >= 75) {
//       return { status: "Warning", message: `${remaining} GB left`, color: theme === "dark" ? "text-yellow-400" : "text-yellow-600" };
//     } else {
//       return { status: "Normal", message: `${remaining} GB left`, color: theme === "dark" ? "text-green-400" : "text-green-600" };
//     }
//   }, [theme]);

//   // Algorithm for user status color coding
//   const getUserStatusColor = useCallback((status) => {
//     const baseStyles = "px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full";
    
//     switch (status) {
//       case "active": 
//         return `${baseStyles} ${theme === "dark" ? "bg-green-900 text-green-200" : "bg-green-100 text-green-800"}`;
//       case "inactive": 
//         return `${baseStyles} ${theme === "dark" ? "bg-red-900 text-red-200" : "bg-red-100 text-red-800"}`;
//       case "suspended": 
//         return `${baseStyles} ${theme === "dark" ? "bg-yellow-900 text-yellow-200" : "bg-yellow-100 text-yellow-800"}`;
//       default: 
//         return `${baseStyles} ${theme === "dark" ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-800"}`;
//     }
//   }, [theme]);

//   // Algorithm for time formatting
//   const timeSince = useCallback((dateString) => {
//     if (!dateString) return "N/A";
    
//     const date = new Date(dateString);
//     const seconds = Math.floor((new Date() - date) / 1000);
    
//     const intervals = [
//       { label: "year", seconds: 31536000 },
//       { label: "month", seconds: 2592000 },
//       { label: "day", seconds: 86400 },
//       { label: "hour", seconds: 3600 },
//       { label: "minute", seconds: 60 }
//     ];
    
//     for (const interval of intervals) {
//       const count = Math.floor(seconds / interval.seconds);
//       if (count >= 1) {
//         return `${count} ${interval.label}${count === 1 ? "" : "s"} ago`;
//       }
//     }
    
//     return `${Math.floor(seconds)} second${seconds === 1 ? "" : "s"} ago`;
//   }, []);

//   // Algorithm for data filtering with search optimization
//   const filterData = useCallback((data, term, statusFilter) => {
//     if (!term && statusFilter === "all") return data;
    
//     const termLower = term.toLowerCase();
//     return data.filter(user => {
//       const matchesStatus = statusFilter === "all" || user.status === statusFilter;
//       const matchesSearch = 
//         user.id.toString().includes(term) ||
//         user.name.toLowerCase().includes(termLower) ||
//         user.plan.name.toLowerCase().includes(termLower) ||
//         user.plan.category.toLowerCase().includes(termLower) ||
//         user.devices.some(device => 
//           device.mac.toLowerCase().includes(termLower) || 
//           device.ip.includes(term)
//         );
      
//       return matchesStatus && matchesSearch;
//     });
//   }, []);

//   // Memoized filtered data for performance
//   const filteredData = useMemo(() => 
//     filterData(bandwidthData, searchTerm, filter), 
//     [bandwidthData, searchTerm, filter, filterData]
//   );

//   // Algorithm for chart data generation
//   const chartData = useMemo(() => {
//     const labels = chartStats.top_users.map(user => user.client?.full_name || "Unknown");
    
//     return {
//       bar: {
//         labels,
//         datasets: [
//           {
//             label: "Allocated Bandwidth (GB)",
//             data: chartStats.top_users.map(user => 
//               user.allocated_bandwidth === "Unlimited" ? 150 : parseFloat(user.allocated_bandwidth.replace("GB", ""))
//             ),
//             backgroundColor: 'rgba(99, 102, 241, 0.7)',
//             borderColor: 'rgba(79, 70, 229, 1)',
//             borderWidth: 1
//           },
//           {
//             label: "Used Bandwidth (GB)",
//             data: chartStats.top_users.map(user => user.used_bandwidth),
//             backgroundColor: 'rgba(244, 63, 94, 0.7)',
//             borderColor: 'rgba(225, 29, 72, 1)',
//             borderWidth: 1
//           }
//         ]
//       },
//       line: {
//         labels,
//         datasets: [
//           {
//             label: "Allocated Bandwidth (GB)",
//             data: chartStats.top_users.map(user => 
//               user.allocated_bandwidth === "Unlimited" ? 150 : parseFloat(user.allocated_bandwidth.replace("GB", ""))
//             ),
//             borderColor: 'rgba(99, 102, 241, 1)',
//             backgroundColor: 'rgba(99, 102, 241, 0.1)',
//             fill: true,
//             tension: 0.4
//           },
//           {
//             label: "Used Bandwidth (GB)",
//             data: chartStats.top_users.map(user => user.used_bandwidth),
//             borderColor: 'rgba(244, 63, 94, 1)',
//             backgroundColor: 'rgba(244, 63, 94, 0.1)',
//             fill: true,
//             tension: 0.4
//           }
//         ]
//       }
//     };
//   }, [chartStats.top_users]);

//   // Algorithm for chart options with theme support
//   const chartOptions = useMemo(() => ({
//     responsive: true,
//     maintainAspectRatio: false,
//     plugins: {
//       legend: {
//         position: "bottom",
//         labels: {
//           color: theme === "dark" ? "#F9FAFB" : "#1F2937",
//           usePointStyle: true,
//           padding: 20
//         }
//       },
//       title: {
//         display: true,
//         text: "Bandwidth Allocation and Usage",
//         color: theme === "dark" ? "#F9FAFB" : "#1F2937",
//         font: { size: 16 }
//       },
//       tooltip: {
//         backgroundColor: theme === "dark" ? "#1f2937" : "#fff",
//         titleColor: theme === "dark" ? "#F9FAFB" : "#1F2937",
//         bodyColor: theme === "dark" ? "#F9FAFB" : "#1F2937",
//         usePointStyle: true,
//         borderColor: theme === "dark" ? "#374151" : "#e5e7eb",
//         borderWidth: 1
//       }
//     },
//     scales: {
//       y: {
//         beginAtZero: true,
//         title: {
//           display: true,
//           text: "Bandwidth (GB)",
//           color: theme === "dark" ? "#D1D5DB" : "#6B7280"
//         },
//         grid: { 
//           color: theme === "dark" ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' 
//         },
//         ticks: { 
//           color: theme === "dark" ? "#D1D5DB" : "#6B7280" 
//         }
//       },
//       x: {
//         grid: { 
//           color: theme === "dark" ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' 
//         },
//         ticks: { 
//           color: theme === "dark" ? "#D1D5DB" : "#6B7280",
//           maxRotation: 45,
//           minRotation: 45
//         }
//       }
//     }
//   }), [theme]);

//   // Algorithm for QoS options based on plan category
//   const getAllowedQosOptions = useCallback((category) => {
//     const allowedPriorities = {
//       Residential: ['medium', 'low'],
//       Business: ['high', 'medium'],
//       Promotional: ['medium'],
//       Enterprise: ['high', 'medium', 'low']
//     };
    
//     return qosProfiles
//       .filter(profile => allowedPriorities[category]?.includes(profile.priority))
//       .map(profile => profile.priority);
//   }, [qosProfiles]);

//   // Event handlers
//   const openEditModal = useCallback((user, device) => {
//     setSelectedUser(user);
//     setSelectedDevice(device);
//     setNewAllocation(device.allocated === "Unlimited" ? "Unlimited" : device.allocated.toString());
//     setNewQos(device.qos);
//     setIsMobileMenuOpen(false); // Close mobile menu when opening modal
//   }, []);

//   const handleSaveChanges = useCallback(() => {
//     if (selectedUser && selectedDevice && newAllocation && newQos) {
//       updateBandwidth(selectedUser.id, selectedDevice.deviceId, newAllocation, newQos);
//       setSelectedUser(null);
//       setSelectedDevice(null);
//       setNewAllocation("");
//       setNewQos("");
//     }
//   }, [selectedUser, selectedDevice, newAllocation, newQos, updateBandwidth]);

//   const toggleUserExpansion = useCallback((userId) => {
//     setExpandedUser(expandedUser === userId ? null : userId);
//   }, [expandedUser]);

//   // Responsive table headers for mobile
//   const tableHeaders = [
//     { key: 'user', label: 'User', mobile: true },
//     { key: 'planCategory', label: 'Plan Category', mobile: false },
//     { key: 'planName', label: 'Plan Name', mobile: false },
//     { key: 'status', label: 'Status', mobile: true },
//     { key: 'device', label: 'Device', mobile: false },
//     { key: 'allocated', label: 'Allocated', mobile: true },
//     { key: 'used', label: 'Used', mobile: true },
//     { key: 'qos', label: 'QoS', mobile: false },
//     { key: 'quotaStatus', label: 'Quota Status', mobile: true },
//     { key: 'actions', label: 'Actions', mobile: true }
//   ];

//   return (
//     <div className={`${containerClass} p-4 md:p-8 transition-colors duration-300`}>
//       <ToastContainer 
//         position="top-right" 
//         autoClose={3000} 
//         theme={theme} 
//         pauseOnHover 
//         newestOnTop 
//       />

//       {/* Header */}
//       <motion.header 
//         className={`${cardClass} p-6 mb-6 transition-colors duration-300`}
//         initial={{ opacity: 0, y: -20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.3 }}
//       >
//         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//           <div className="flex items-center space-x-3">
//             <Server className={`w-8 h-8 ${theme === "dark" ? "text-indigo-400" : "text-indigo-600"}`} />
//             <div>
//               <h1 className="text-xl sm:text-2xl font-bold">Bandwidth Allocation</h1>
//               <p className={`text-sm ${textTertiaryClass}`}>
//                 {bandwidthData.length} users • {bandwidthData.filter(u => u.status === "active").length} active
//               </p>
//             </div>
//           </div>
          
//           <div className="flex flex-wrap gap-2 w-full sm:w-auto">
//             <Button
//               onClick={fetchData}
//               icon={<RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />}
//               label="Refresh"
//               variant="secondary"
//               size="sm"
//               ariaLabel="Refresh bandwidth data"
//             />
//           </div>
//         </div>
//       </motion.header>

//       {/* Search and Filter Section */}
//       <motion.section 
//         className="mb-6 transition-colors duration-300"
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.3, delay: 0.1 }}
//       >
//         <div className={`p-4 ${cardClass}`}>
//           <div className="flex flex-col lg:flex-row gap-4">
//             {/* Search Input */}
//             <div className="relative flex-1">
//               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                 <Search className={`h-5 w-5 ${textTertiaryClass}`} />
//               </div>
//               <input
//                 type="text"
//                 className={`w-full pl-10 pr-4 py-2 rounded-lg border ${inputClass} transition-colors duration-300`}
//                 placeholder="Search by name, ID, plan, category, MAC, or IP..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 aria-label="Search bandwidth allocations"
//               />
//             </div>

//             {/* Filter Dropdown */}
//             <div className="flex gap-2">
//               <select
//                 value={filter}
//                 onChange={(e) => setFilter(e.target.value)}
//                 className={`p-2 rounded-lg border text-sm ${inputClass} transition-colors duration-300`}
//                 aria-label="Filter by status"
//               >
//                 <option value="all">All Users</option>
//                 <option value="active">Active Only</option>
//                 <option value="inactive">Inactive</option>
//                 <option value="suspended">Suspended</option>
//               </select>

//               {/* Mobile Menu Toggle */}
//               <button
//                 onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
//                 className={`lg:hidden p-2 rounded-lg border ${inputClass} hover:opacity-80 transition-colors duration-300`}
//                 aria-label="Toggle mobile menu"
//               >
//                 <ChevronDown className={`w-4 h-4 transition-transform ${isMobileMenuOpen ? 'rotate-180' : ''}`} />
//               </button>
//             </div>
//           </div>
//         </div>
//       </motion.section>

//       {/* Chart Section */}
//       <motion.section
//         className={`${cardClass} p-6 mb-6 transition-colors duration-300`}
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.3, delay: 0.2 }}
//       >
//         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
//           <h2 className="text-lg font-semibold flex items-center">
//             <BarChart2 className={`w-5 h-5 mr-2 ${theme === "dark" ? "text-indigo-400" : "text-indigo-600"}`} />
//             Bandwidth Visualization
//           </h2>
          
//           <div className="flex flex-wrap gap-2">
//             <select
//               value={chartType}
//               onChange={(e) => setChartType(e.target.value)}
//               className={`p-2 rounded-lg border text-sm ${inputClass} transition-colors duration-300`}
//               aria-label="Select chart type"
//             >
//               <option value="bar">Bar Chart</option>
//               <option value="line">Line Chart</option>
//             </select>
            
//             <Button
//               onClick={() => setShowChart(!showChart)}
//               label={showChart ? "Hide Chart" : "Show Chart"}
//               icon={showChart ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
//               variant="secondary"
//               size="sm"
//               ariaLabel={showChart ? "Hide chart" : "Show chart"}
//             />
//           </div>
//         </div>
        
//         {showChart && (
//           <motion.div
//             initial={{ opacity: 0, height: 0 }}
//             animate={{ opacity: 1, height: "auto" }}
//             className="h-64 sm:h-80"
//           >
//             {chartType === "bar" ? (
//               <Bar data={chartData.bar} options={chartOptions} />
//             ) : (
//               <Line data={chartData.line} options={chartOptions} />
//             )}
//           </motion.div>
//         )}
//       </motion.section>

//       {/* Users Table Section */}
//       <motion.section 
//         className={`${cardClass} p-6 transition-colors duration-300`}
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.3, delay: 0.3 }}
//       >
//         {isLoading ? (
//           <div className="flex justify-center py-8">
//             <ThreeDots 
//               color={theme === "dark" ? "#6366F1" : "#4F46E5"} 
//               height={50} 
//               width={50} 
//               aria-label="Loading bandwidth data" 
//             />
//           </div>
//         ) : filteredData.length === 0 ? (
//           <div className={`text-center py-8 flex flex-col items-center ${textSecondaryClass}`}>
//             <AlertTriangle className="w-8 h-8 mb-2" />
//             <p>No users found matching your criteria</p>
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             {/* Desktop Table */}
//             <div className="hidden lg:block">
//               <table className="min-w-full divide-y">
//                 <thead className={theme === "dark" ? "bg-gray-800/60" : "bg-white/80"}>
//                   <tr>
//                     {tableHeaders.map(header => (
//                       <th 
//                         key={header.key}
//                         className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === "dark" ? "text-gray-300" : "text-gray-500"}`}
//                       >
//                         {header.label}
//                       </th>
//                     ))}
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y">
//                   {filteredData.map(user => (
//                     <React.Fragment key={user.id}>
//                       <tr 
//                         className={`hover:opacity-80 cursor-pointer transition-colors duration-300 ${
//                           theme === "dark" 
//                             ? "hover:bg-gray-700" 
//                             : "hover:bg-gray-50"
//                         }`}
//                         onClick={() => toggleUserExpansion(user.id)}
//                       >
//                         {/* User Cell */}
//                         <td className="px-4 py-4 whitespace-nowrap">
//                           <div className="flex items-center">
//                             <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
//                               theme === "dark" ? "bg-indigo-900" : "bg-indigo-100"
//                             }`}>
//                               <span className={theme === "dark" ? "text-indigo-300" : "text-indigo-600"}>
//                                 {user.name.charAt(0)}
//                               </span>
//                             </div>
//                             <div className="ml-4">
//                               <div className="text-sm font-medium">{user.name}</div>
//                               <div className={`text-xs ${textTertiaryClass}`}>
//                                 ID: {user.id}
//                               </div>
//                             </div>
//                           </div>
//                         </td>

//                         {/* Other cells */}
//                         <td className="px-4 py-4 whitespace-nowrap">
//                           <span className={getUserStatusColor(user.plan.category)}>
//                             {user.plan.category}
//                           </span>
//                         </td>
//                         <td className="px-4 py-4 whitespace-nowrap text-sm">{user.plan.name}</td>
//                         <td className="px-4 py-4 whitespace-nowrap">
//                           <span className={getUserStatusColor(user.status)}>
//                             {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
//                           </span>
//                         </td>
//                         <td className="px-4 py-4 whitespace-nowrap text-sm">{user.devices[0].mac}</td>
//                         <td className="px-4 py-4 whitespace-nowrap text-sm">
//                           {user.devices[0].allocated === "Unlimited" ? "Unlimited" : `${user.devices[0].allocated} GB`}
//                         </td>
//                         <td className="px-4 py-4 whitespace-nowrap text-sm">{user.devices[0].used} GB</td>
//                         <td className="px-4 py-4 whitespace-nowrap text-sm">{user.devices[0].qos}</td>
//                         <td className="px-4 py-4 whitespace-nowrap text-sm">
//                           <span className={checkBandwidthQuota(user.devices[0]).color}>
//                             {checkBandwidthQuota(user.devices[0]).message}
//                           </span>
//                         </td>
//                         <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
//                           <button
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               openEditModal(user, user.devices[0]);
//                             }}
//                             className={`mr-3 hover:opacity-70 transition-colors duration-300 ${
//                               theme === "dark" ? "text-indigo-400" : "text-indigo-600"
//                             }`}
//                             aria-label={`Edit bandwidth for ${user.name}`}
//                           >
//                             <Edit className="w-5 h-5" />
//                           </button>
//                           <button
//                             className={`hover:opacity-70 transition-colors duration-300 ${
//                               theme === "dark" ? textTertiaryClass : textTertiaryClass
//                             }`}
//                             aria-label={expandedUser === user.id ? "Collapse details" : "Expand details"}
//                           >
//                             {expandedUser === user.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
//                           </button>
//                         </td>
//                       </tr>

//                       {/* Expanded Details */}
//                       {expandedUser === user.id && (
//                         <tr>
//                           <td colSpan={tableHeaders.length} className="px-4 py-4">
//                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
//                               <div>
//                                 <h4 className="font-medium mb-3 flex items-center">
//                                   <Terminal className="w-4 h-4 mr-2" />
//                                   Device Details
//                                 </h4>
//                                 <div className="grid grid-cols-2 gap-3">
//                                   {[
//                                     { label: "MAC Address", value: user.devices[0].mac },
//                                     { label: "IP Address", value: user.devices[0].ip },
//                                     { label: "Connected", value: timeSince(user.devices[0].connectedAt) },
//                                     { label: "Quota", value: user.devices[0].quota === "Unlimited" ? "Unlimited" : `${user.devices[0].quota} GB` }
//                                   ].map((item, index) => (
//                                     <React.Fragment key={index}>
//                                       <div className={`font-medium ${textSecondaryClass}`}>
//                                         {item.label}:
//                                       </div>
//                                       <div>{item.value}</div>
//                                     </React.Fragment>
//                                   ))}
//                                 </div>
//                               </div>
                              
//                               <div>
//                                 <h4 className="font-medium mb-3 flex items-center">
//                                   <Activity className="w-4 h-4 mr-2" />
//                                   Usage Statistics
//                                 </h4>
//                                 <div className="grid grid-cols-2 gap-3">
//                                   {[
//                                     { 
//                                       label: "Bandwidth Used", 
//                                       value: `${user.devices[0].used} GB (${
//                                         user.devices[0].allocated === "Unlimited" 
//                                           ? "∞" 
//                                           : `${Math.round((user.devices[0].used / user.devices[0].allocated) * 100)}%`
//                                       } of allocated)` 
//                                     },
//                                     { 
//                                       label: "Remaining", 
//                                       value: user.devices[0].quota === "Unlimited" 
//                                         ? "Unlimited" 
//                                         : `${user.devices[0].quota - user.devices[0].used} GB` 
//                                     },
//                                     { label: "Last Seen", value: timeSince(user.lastSeen) },
//                                     { 
//                                       label: "Status", 
//                                       value: checkBandwidthQuota(user.devices[0]).message 
//                                     }
//                                   ].map((item, index) => (
//                                     <React.Fragment key={index}>
//                                       <div className={`font-medium ${textSecondaryClass}`}>
//                                         {item.label}:
//                                       </div>
//                                       <div className={index === 3 ? checkBandwidthQuota(user.devices[0]).color : ''}>
//                                         {item.value}
//                                       </div>
//                                     </React.Fragment>
//                                   ))}
//                                 </div>
//                               </div>
//                             </div>
//                           </td>
//                         </tr>
//                       )}
//                     </React.Fragment>
//                   ))}
//                 </tbody>
//               </table>
//             </div>

//             {/* Mobile Cards */}
//             <div className="lg:hidden space-y-4">
//               {filteredData.map(user => (
//                 <div
//                   key={user.id}
//                   className={`${cardClass} p-4 transition-colors duration-300`}
//                 >
//                   {/* Main Card Content */}
//                   <div 
//                     className="cursor-pointer transition-colors duration-300 hover:opacity-80"
//                     onClick={() => toggleUserExpansion(user.id)}
//                   >
//                     <div className="flex items-center justify-between mb-3">
//                       <div className="flex items-center space-x-3">
//                         <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
//                           theme === "dark" ? "bg-indigo-900" : "bg-indigo-100"
//                         }`}>
//                           <span className={`font-semibold ${
//                             theme === "dark" ? "text-indigo-300" : "text-indigo-600"
//                           }`}>
//                             {user.name.charAt(0)}
//                           </span>
//                         </div>
//                         <div>
//                           <h3 className="font-semibold">{user.name}</h3>
//                           <p className={`text-sm ${textTertiaryClass}`}>
//                             ID: {user.id}
//                           </p>
//                         </div>
//                       </div>
//                       <button
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           openEditModal(user, user.devices[0]);
//                         }}
//                         className={`p-2 rounded-lg ${theme === "dark" ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-100 hover:bg-gray-200"} transition-colors duration-300`}
//                       >
//                         <Edit className="w-4 h-4" />
//                       </button>
//                     </div>

//                     <div className="grid grid-cols-2 gap-3 text-sm">
//                       <div>
//                         <span className={`font-medium ${textSecondaryClass}`}>
//                           Status:
//                         </span>
//                         <div className={getUserStatusColor(user.status)}>
//                           {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
//                         </div>
//                       </div>
//                       <div>
//                         <span className={`font-medium ${textSecondaryClass}`}>
//                           Allocated:
//                         </span>
//                         <div>
//                           {user.devices[0].allocated === "Unlimited" ? "Unlimited" : `${user.devices[0].allocated} GB`}
//                         </div>
//                       </div>
//                       <div>
//                         <span className={`font-medium ${textSecondaryClass}`}>
//                           Used:
//                         </span>
//                         <div>{user.devices[0].used} GB</div>
//                       </div>
//                       <div>
//                         <span className={`font-medium ${textSecondaryClass}`}>
//                           Quota:
//                         </span>
//                         <div className={checkBandwidthQuota(user.devices[0]).color}>
//                           {checkBandwidthQuota(user.devices[0]).message}
//                         </div>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Expanded Details */}
//                   {expandedUser === user.id && (
//                     <motion.div
//                       initial={{ opacity: 0, height: 0 }}
//                       animate={{ opacity: 1, height: 'auto' }}
//                       exit={{ opacity: 0, height: 0 }}
//                       className="mt-4 pt-4 border-t border-gray-700 transition-colors duration-300"
//                     >
//                       <div className="space-y-4 text-sm">
//                         <div>
//                           <h4 className="font-medium mb-2 flex items-center">
//                             <Terminal className="w-4 h-4 mr-2" />
//                             Device Details
//                           </h4>
//                           <div className="grid grid-cols-2 gap-2">
//                             {[
//                               { label: "MAC", value: user.devices[0].mac },
//                               { label: "IP", value: user.devices[0].ip },
//                               { label: "Connected", value: timeSince(user.devices[0].connectedAt) },
//                               { label: "QoS", value: user.devices[0].qos }
//                             ].map((item, index) => (
//                               <React.Fragment key={index}>
//                                 <div className={`font-medium ${textSecondaryClass}`}>
//                                   {item.label}:
//                                 </div>
//                                 <div>{item.value}</div>
//                               </React.Fragment>
//                             ))}
//                           </div>
//                         </div>
//                       </div>
//                     </motion.div>
//                   )}
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}
//       </motion.section>

//       {/* Edit Modal */}
//       <AnimatePresence>
//         {selectedUser && selectedDevice && (
//           <Modal
//             isOpen={!!selectedUser}
//             title={`Edit Bandwidth for ${selectedUser.name}'s Device`}
//             onClose={() => {
//               setSelectedUser(null);
//               setSelectedDevice(null);
//               setNewAllocation("");
//               setNewQos("");
//             }}
//             theme={theme}
//           >
//             <div className="space-y-4">
//               <div>
//                 <label className={`block text-sm mb-1 ${textSecondaryClass}`}>
//                   MAC Address
//                 </label>
//                 <div className={`p-2 rounded-lg ${theme === "dark" ? "bg-gray-700/50" : "bg-gray-100"}`}>
//                   {selectedDevice.mac}
//                 </div>
//               </div>
              
//               <div>
//                 <label className={`block text-sm mb-1 ${textSecondaryClass}`}>
//                   Allocated Bandwidth
//                 </label>
//                 <div className="flex">
//                   <input
//                     type="text"
//                     className={`flex-1 p-2 border rounded-l-lg ${inputClass} transition-colors duration-300`}
//                     value={newAllocation}
//                     onChange={(e) => setNewAllocation(e.target.value)}
//                     placeholder="Enter bandwidth in GB"
//                     aria-label="Allocated bandwidth"
//                     disabled={isUpdating}
//                   />
//                   <select
//                     className={`p-2 border rounded-r-lg ${inputClass} transition-colors duration-300`}
//                     value={newAllocation === "Unlimited" ? "Unlimited" : ""}
//                     onChange={(e) => setNewAllocation(e.target.value === "Unlimited" ? "Unlimited" : newAllocation)}
//                     aria-label="Bandwidth type"
//                     disabled={isUpdating}
//                   >
//                     <option value="">Custom</option>
//                     <option value="Unlimited">Unlimited</option>
//                   </select>
//                 </div>
//                 <p className={`text-xs mt-1 ${textTertiaryClass}`}>
//                   Max for {selectedUser.plan.name} ({selectedUser.plan.category}):{" "}
//                   {plans.find(p => p.name === selectedUser.plan.name)?.dataLimit.value || "N/A"}{" "}
//                   {plans.find(p => p.name === selectedUser.plan.name)?.dataLimit.unit || ""}
//                 </p>
//               </div>
              
//               <div>
//                 <label className={`block text-sm mb-1 ${textSecondaryClass}`}>
//                   Quality of Service (QoS)
//                 </label>
//                 <select
//                   className={`w-full p-2 border rounded-lg ${inputClass} transition-colors duration-300`}
//                   value={newQos}
//                   onChange={(e) => setNewQos(e.target.value)}
//                   aria-label="Quality of Service"
//                   disabled={isUpdating}
//                 >
//                   {getAllowedQosOptions(selectedUser.plan.category).map(priority => (
//                     <option key={priority} value={priority}>
//                       {priority.charAt(0).toUpperCase() + priority.slice(1)}
//                     </option>
//                   ))}
//                 </select>
//               </div>
              
//               <div className="flex justify-end space-x-2 pt-4">
//                 <Button
//                   onClick={() => {
//                     setSelectedUser(null);
//                     setSelectedDevice(null);
//                     setNewAllocation("");
//                     setNewQos("");
//                   }}
//                   label="Cancel"
//                   variant="secondary"
//                   disabled={isUpdating}
//                   ariaLabel="Cancel editing"
//                 />
//                 <Button
//                   onClick={handleSaveChanges}
//                   label={isUpdating ? "Saving..." : "Save Changes"}
//                   icon={isUpdating && <ThreeDots color="#fff" height={20} width={40} />}
//                   variant="primary"
//                   disabled={isUpdating || !newAllocation || !newQos}
//                   ariaLabel="Save bandwidth changes"
//                 />
//               </div>
//             </div>
//           </Modal>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// };

// // Reusable Button Component
// const Button = ({ 
//   onClick, 
//   label, 
//   icon, 
//   variant = "primary", 
//   size = "md", 
//   disabled = false, 
//   fullWidth = false,
//   ariaLabel 
// }) => {
//   const { theme } = useTheme();
  
//   const baseStyles = "flex items-center justify-center font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
  
//   const variants = {
//     primary: theme === "dark" 
//       ? "bg-indigo-600 hover:bg-indigo-700 text-white" 
//       : "bg-indigo-600 hover:bg-indigo-700 text-white",
//     secondary: theme === "dark"
//       ? "bg-gray-700 hover:bg-gray-600 text-white border border-gray-600"
//       : "bg-gray-200 hover:bg-gray-300 text-gray-800 border border-gray-300"
//   };
  
//   const sizes = {
//     sm: "px-3 py-1.5 text-sm",
//     md: "px-4 py-2 text-sm",
//     lg: "px-6 py-3 text-base"
//   };
  
//   return (
//     <motion.button
//       whileHover={{ scale: disabled ? 1 : 1.02 }}
//       whileTap={{ scale: disabled ? 1 : 0.98 }}
//       onClick={onClick}
//       disabled={disabled}
//       className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? "w-full" : ""}`}
//       aria-label={ariaLabel}
//     >
//       {icon && React.cloneElement(icon, { className: `w-4 h-4 ${label ? "mr-2" : ""}` })}
//       {label}
//     </motion.button>
//   );
// };

// // Reusable Modal Component
// const Modal = ({ isOpen, title, onClose, children, theme }) => {
//   const { theme: currentTheme } = useTheme();
//   const themeToUse = theme || currentTheme;

//   return (
//     <AnimatePresence>
//       {isOpen && (
//         <div 
//           className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 transition-colors duration-300"
//           role="dialog" 
//           aria-modal="true"
//           onClick={onClose}
//         >
//           <motion.div
//             initial={{ scale: 0.9, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             exit={{ scale: 0.9, opacity: 0 }}
//             className={`max-w-md w-full max-h-[90vh] overflow-y-auto rounded-xl shadow-xl ${
//               themeToUse === "dark" 
//                 ? "bg-gray-800/80 backdrop-blur-md text-white border border-gray-700" 
//                 : "bg-white/80 backdrop-blur-md text-gray-800 border border-gray-200"
//             } transition-colors duration-300`}
//             onClick={(e) => e.stopPropagation()}
//           >
//             <div className="flex justify-between items-center p-6 border-b border-gray-700">
//               <h3 className="text-lg font-semibold">{title}</h3>
//               <button 
//                 onClick={onClose} 
//                 className={`p-1 rounded-full hover:opacity-70 transition-colors duration-300 ${
//                   themeToUse === "dark" 
//                     ? "hover:bg-gray-700" 
//                     : "hover:bg-gray-200"
//                 }`}
//                 aria-label="Close modal"
//               >
//                 <X className="w-5 h-5" />
//               </button>
//             </div>
//             <div className="p-6">
//               {children}
//             </div>
//           </motion.div>
//         </div>
//       )}
//     </AnimatePresence>
//   );
// };

// export default BandwidthAllocation;





// src/components/NetworkManagement/BandwidthAllocation.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Server, RefreshCw, BarChart2, AlertTriangle, Edit,
  ChevronDown, ChevronUp, X, CheckCircle, Search, Eye, EyeOff, Terminal, Activity
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ThreeDots } from "react-loader-spinner";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  Filler
} from "chart.js";
import api from "../../api";
import { useTheme } from "../../context/ThemeContext";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  Filler
);

const BandwidthAllocation = () => {
  const { theme } = useTheme();
  const [bandwidthData, setBandwidthData] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [newAllocation, setNewAllocation] = useState("");
  const [newQos, setNewQos] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [chartType, setChartType] = useState("bar");
  const [showChart, setShowChart] = useState(true);
  const [filter, setFilter] = useState("all");
  const [expandedUser, setExpandedUser] = useState(null);
  const [chartStats, setChartStats] = useState({ top_users: [], stats: {} });
  const [qosProfiles, setQosProfiles] = useState([]);
  const [plans, setPlans] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Theme-based styling variables
  const containerClass = useMemo(() => 
    theme === "dark" 
      ? "bg-gradient-to-br from-gray-900 to-indigo-900 text-white min-h-screen" 
      : "bg-gray-50 text-gray-800 min-h-screen",
    [theme]
  );

  const cardClass = useMemo(() => 
    theme === "dark"
      ? "bg-gray-800/80 backdrop-blur-md border border-gray-700 rounded-xl shadow-md"
      : "bg-white/80 backdrop-blur-md border border-gray-200 rounded-xl shadow-md",
    [theme]
  );

  const inputClass = useMemo(() => 
    theme === "dark"
      ? "bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500"
      : "bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:ring-indigo-500 focus:border-indigo-500",
    [theme]
  );

  const textSecondaryClass = useMemo(() => 
    theme === "dark" ? "text-gray-400" : "text-gray-500",
    [theme]
  );

  const textTertiaryClass = useMemo(() => 
    theme === "dark" ? "text-gray-500" : "text-gray-400",
    [theme]
  );

  // Memoized data fetching functions
  const fetchQosProfiles = useCallback(async () => {
    try {
      const response = await api.get("/api/network_management/qos-profiles/");
      setQosProfiles(response.data);
    } catch (error) {
      console.error("Error fetching QoS profiles:", error);
      toast.error("Failed to fetch QoS profiles");
    }
  }, []);

  const fetchPlans = useCallback(async () => {
    try {
      const response = await api.get("/api/internet_plans/");
      setPlans(response.data);
    } catch (error) {
      console.error("Error fetching plans:", error);
      toast.error("Failed to fetch plans");
    }
  }, []);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/api/network_management/allocations/", {
        params: { 
          status: filter !== "all" ? filter : undefined, 
          search: searchTerm || undefined 
        }
      });
      
      const formattedData = response.data.map(allocation => ({
        id: allocation.id,
        name: allocation.client?.full_name || "Unknown",
        plan: {
          name: allocation.plan?.name || "Unknown",
          category: allocation.plan?.category || "Unknown"
        },
        status: allocation.status,
        lastSeen: allocation.last_used,
        devices: [
          {
            deviceId: allocation.id,
            mac: allocation.mac_address,
            allocated: allocation.allocated_bandwidth === "Unlimited" ? "Unlimited" : parseFloat(allocation.allocated_bandwidth.replace("GB", "")),
            quota: allocation.quota === "Unlimited" ? "Unlimited" : parseFloat(allocation.quota.replace("GB", "")),
            used: allocation.used_bandwidth,
            qos: allocation.priority,
            unlimited: allocation.allocated_bandwidth === "Unlimited",
            ip: allocation.ip_address,
            connectedAt: allocation.last_used
          }
        ]
      }));
      
      setBandwidthData(formattedData);
    } catch (error) {
      console.error("Error fetching bandwidth data:", error);
      setError("Failed to fetch bandwidth data.");
      toast.error(error.response?.data?.error || "Failed to fetch bandwidth data");
    } finally {
      setIsLoading(false);
    }
  }, [filter, searchTerm]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await api.get("/api/network_management/usage-stats/");
      setChartStats(response.data);
    } catch (error) {
      console.error("Error fetching usage stats:", error);
      toast.error("Failed to fetch usage stats");
    }
  }, []);

  // Effect for initial data loading and periodic updates
  useEffect(() => {
    fetchData();
    fetchStats();
    fetchQosProfiles();
    fetchPlans();
    
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData, fetchStats, fetchQosProfiles, fetchPlans]);

  // Algorithm for updating bandwidth allocation
  const updateBandwidth = useCallback(async (userId, deviceId, newAllocation, newQos) => {
    setIsUpdating(true);
    try {
      const qosProfile = qosProfiles.find(profile => profile.priority === newQos);
      await api.put(`/api/network_management/allocations/${deviceId}/`, {
        allocated_bandwidth: newAllocation === "Unlimited" ? "Unlimited" : `${newAllocation}GB`,
        quota: newAllocation === "Unlimited" ? "Unlimited" : `${newAllocation}GB`,
        priority: newQos,
        qos_profile: qosProfile ? qosProfile.id : null
      });

      // Optimistic update algorithm
      setBandwidthData(prevData =>
        prevData.map(user =>
          user.id === userId ? {
            ...user,
            devices: user.devices.map(device =>
              device.deviceId === deviceId ? {
                ...device,
                allocated: newAllocation === "Unlimited" ? "Unlimited" : parseInt(newAllocation),
                quota: newAllocation === "Unlimited" ? "Unlimited" : parseInt(newAllocation),
                qos: newQos,
                unlimited: newAllocation === "Unlimited"
              } : device
            )
          } : user
        )
      );
      
      toast.success("Bandwidth updated successfully!");
      await fetchStats();
    } catch (error) {
      console.error("Error updating bandwidth allocation:", error);
      toast.error(error.response?.data?.error || "Failed to update bandwidth");
    } finally {
      setIsUpdating(false);
    }
  }, [fetchStats, qosProfiles]);

  // Algorithm for checking bandwidth quota status
  const checkBandwidthQuota = useCallback((device) => {
    if (device.unlimited) {
      return { status: "Unlimited", message: "Unlimited", color: theme === "dark" ? "text-blue-400" : "text-blue-600" };
    }
    
    const remaining = device.quota - device.used;
    const usagePercentage = (device.used / device.quota) * 100;
    
    if (usagePercentage >= 90) {
      return { status: "Critical", message: `${remaining} GB left`, color: theme === "dark" ? "text-red-400" : "text-red-600" };
    } else if (usagePercentage >= 75) {
      return { status: "Warning", message: `${remaining} GB left`, color: theme === "dark" ? "text-yellow-400" : "text-yellow-600" };
    } else {
      return { status: "Normal", message: `${remaining} GB left`, color: theme === "dark" ? "text-green-400" : "text-green-600" };
    }
  }, [theme]);

  // Algorithm for user status color coding
  const getUserStatusColor = useCallback((status) => {
    const baseStyles = "px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full";
    
    switch (status) {
      case "active": 
        return `${baseStyles} ${theme === "dark" ? "bg-green-900 text-green-200" : "bg-green-100 text-green-800"}`;
      case "inactive": 
        return `${baseStyles} ${theme === "dark" ? "bg-red-900 text-red-200" : "bg-red-100 text-red-800"}`;
      case "suspended": 
        return `${baseStyles} ${theme === "dark" ? "bg-yellow-900 text-yellow-200" : "bg-yellow-100 text-yellow-800"}`;
      default: 
        return `${baseStyles} ${theme === "dark" ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-800"}`;
    }
  }, [theme]);

  // Algorithm for time formatting
  const timeSince = useCallback((dateString) => {
    if (!dateString) return "N/A";
    
    const date = new Date(dateString);
    const seconds = Math.floor((new Date() - date) / 1000);
    
    const intervals = [
      { label: "year", seconds: 31536000 },
      { label: "month", seconds: 2592000 },
      { label: "day", seconds: 86400 },
      { label: "hour", seconds: 3600 },
      { label: "minute", seconds: 60 }
    ];
    
    for (const interval of intervals) {
      const count = Math.floor(seconds / interval.seconds);
      if (count >= 1) {
        return `${count} ${interval.label}${count === 1 ? "" : "s"} ago`;
      }
    }
    
    return `${Math.floor(seconds)} second${seconds === 1 ? "" : "s"} ago`;
  }, []);

  // Algorithm for data filtering with search optimization
  const filterData = useCallback((data, term, statusFilter) => {
    if (!term && statusFilter === "all") return data;
    
    const termLower = term.toLowerCase();
    return data.filter(user => {
      const matchesStatus = statusFilter === "all" || user.status === statusFilter;
      const matchesSearch = 
        user.id.toString().includes(term) ||
        user.name.toLowerCase().includes(termLower) ||
        user.plan.name.toLowerCase().includes(termLower) ||
        user.plan.category.toLowerCase().includes(termLower) ||
        user.devices.some(device => 
          device.mac.toLowerCase().includes(termLower) || 
          device.ip.includes(term)
        );
      
      return matchesStatus && matchesSearch;
    });
  }, []);

  // Memoized filtered data for performance
  const filteredData = useMemo(() => 
    filterData(bandwidthData, searchTerm, filter), 
    [bandwidthData, searchTerm, filter, filterData]
  );

  // Algorithm for chart data generation
  const chartData = useMemo(() => {
    const labels = chartStats.top_users.map(user => user.client?.full_name || "Unknown");
    
    return {
      bar: {
        labels,
        datasets: [
          {
            label: "Allocated Bandwidth (GB)",
            data: chartStats.top_users.map(user => 
              user.allocated_bandwidth === "Unlimited" ? 150 : parseFloat(user.allocated_bandwidth.replace("GB", ""))
            ),
            backgroundColor: 'rgba(99, 102, 241, 0.7)',
            borderColor: 'rgba(79, 70, 229, 1)',
            borderWidth: 1
          },
          {
            label: "Used Bandwidth (GB)",
            data: chartStats.top_users.map(user => user.used_bandwidth),
            backgroundColor: 'rgba(244, 63, 94, 0.7)',
            borderColor: 'rgba(225, 29, 72, 1)',
            borderWidth: 1
          }
        ]
      },
      line: {
        labels,
        datasets: [
          {
            label: "Allocated Bandwidth (GB)",
            data: chartStats.top_users.map(user => 
              user.allocated_bandwidth === "Unlimited" ? 150 : parseFloat(user.allocated_bandwidth.replace("GB", ""))
            ),
            borderColor: 'rgba(99, 102, 241, 1)',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            fill: true,
            tension: 0.4
          },
          {
            label: "Used Bandwidth (GB)",
            data: chartStats.top_users.map(user => user.used_bandwidth),
            borderColor: 'rgba(244, 63, 94, 1)',
            backgroundColor: 'rgba(244, 63, 94, 0.1)',
            fill: true,
            tension: 0.4
          }
        ]
      }
    };
  }, [chartStats.top_users]);

  // Algorithm for chart options with theme support
  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: theme === "dark" ? "#F9FAFB" : "#1F2937",
          usePointStyle: true,
          padding: 20
        }
      },
      title: {
        display: true,
        text: "Bandwidth Allocation and Usage",
        color: theme === "dark" ? "#F9FAFB" : "#1F2937",
        font: { size: 16 }
      },
      tooltip: {
        backgroundColor: theme === "dark" ? "#1f2937" : "#fff",
        titleColor: theme === "dark" ? "#F9FAFB" : "#1F2937",
        bodyColor: theme === "dark" ? "#F9FAFB" : "#1F2937",
        usePointStyle: true,
        borderColor: theme === "dark" ? "#374151" : "#e5e7eb",
        borderWidth: 1
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Bandwidth (GB)",
          color: theme === "dark" ? "#D1D5DB" : "#6B7280"
        },
        grid: { 
          color: theme === "dark" ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' 
        },
        ticks: { 
          color: theme === "dark" ? "#D1D5DB" : "#6B7280" 
        }
      },
      x: {
        grid: { 
          color: theme === "dark" ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' 
        },
        ticks: { 
          color: theme === "dark" ? "#D1D5DB" : "#6B7280",
          maxRotation: 45,
          minRotation: 45
        }
      }
    }
  }), [theme]);

  // Algorithm for QoS options based on plan category
  const getAllowedQosOptions = useCallback((category) => {
    const allowedPriorities = {
      Residential: ['medium', 'low'],
      Business: ['high', 'medium'],
      Promotional: ['medium'],
      Enterprise: ['high', 'medium', 'low']
    };
    
    return qosProfiles
      .filter(profile => allowedPriorities[category]?.includes(profile.priority))
      .map(profile => profile.priority);
  }, [qosProfiles]);

  // Event handlers
  const openEditModal = useCallback((user, device) => {
    setSelectedUser(user);
    setSelectedDevice(device);
    setNewAllocation(device.allocated === "Unlimited" ? "Unlimited" : device.allocated.toString());
    setNewQos(device.qos);
    setIsMobileMenuOpen(false); // Close mobile menu when opening modal
  }, []);

  const handleSaveChanges = useCallback(() => {
    if (selectedUser && selectedDevice && newAllocation && newQos) {
      updateBandwidth(selectedUser.id, selectedDevice.deviceId, newAllocation, newQos);
      setSelectedUser(null);
      setSelectedDevice(null);
      setNewAllocation("");
      setNewQos("");
    }
  }, [selectedUser, selectedDevice, newAllocation, newQos, updateBandwidth]);

  const toggleUserExpansion = useCallback((userId) => {
    setExpandedUser(expandedUser === userId ? null : userId);
  }, [expandedUser]);

  // Responsive table headers for mobile
  const tableHeaders = [
    { key: 'user', label: 'User', mobile: true },
    { key: 'planCategory', label: 'Plan Category', mobile: false },
    { key: 'planName', label: 'Plan Name', mobile: false },
    { key: 'status', label: 'Status', mobile: true },
    { key: 'device', label: 'Device', mobile: false },
    { key: 'allocated', label: 'Allocated', mobile: true },
    { key: 'used', label: 'Used', mobile: true },
    { key: 'qos', label: 'QoS', mobile: false },
    { key: 'quotaStatus', label: 'Quota Status', mobile: true },
    { key: 'actions', label: 'Actions', mobile: true }
  ];

  return (
    <div className={`${containerClass} p-4 md:p-8 transition-colors duration-300`}>
      <ToastContainer 
        position="top-right" 
        autoClose={3000} 
        theme={theme} 
        pauseOnHover 
        newestOnTop 
      />

      {/* Header */}
      <motion.header 
        className={`${cardClass} p-6 mb-6 transition-colors duration-300`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-3">
            <Server className={`w-8 h-8 ${theme === "dark" ? "text-indigo-400" : "text-indigo-600"}`} />
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Bandwidth Allocation</h1>
              <p className={`text-sm ${textTertiaryClass}`}>
                {bandwidthData.length} users • {bandwidthData.filter(u => u.status === "active").length} active
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <Button
              onClick={fetchData}
              icon={<RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />}
              label="Refresh"
              variant="secondary"
              size="sm"
              ariaLabel="Refresh bandwidth data"
            />
          </div>
        </div>
      </motion.header>

      {/* Search and Filter Section */}
      <motion.section 
        className="mb-6 transition-colors duration-300"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className={`p-4 ${cardClass}`}>
          <div className="flex flex-col lg:flex-row gap-4 items-end">
            {/* Search Input */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className={`h-5 w-5 ${textTertiaryClass}`} />
              </div>
              <input
                type="text"
                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${inputClass} transition-colors duration-300`}
                placeholder="Search by name, ID, plan, category, MAC, or IP..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search bandwidth allocations"
              />
            </div>

            {/* Filter Dropdown */}
            <div className="flex gap-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className={`p-2 rounded-lg border text-sm ${inputClass} transition-colors duration-300`}
                aria-label="Filter by status"
              >
                <option value="all">All Users</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`lg:hidden p-2 rounded-lg border ${inputClass} hover:opacity-80 transition-colors duration-300`}
                aria-label="Toggle mobile menu"
              >
                <ChevronDown className={`w-4 h-4 transition-transform ${isMobileMenuOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Chart Section */}
      <motion.section
        className={`${cardClass} p-6 mb-6 transition-colors duration-300`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <h2 className="text-lg font-semibold flex items-center">
            <BarChart2 className={`w-5 h-5 mr-2 ${theme === "dark" ? "text-indigo-400" : "text-indigo-600"}`} />
            Bandwidth Visualization
          </h2>
          
          <div className="flex flex-wrap gap-2">
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              className={`p-2 rounded-lg border text-sm ${inputClass} transition-colors duration-300`}
              aria-label="Select chart type"
            >
              <option value="bar">Bar Chart</option>
              <option value="line">Line Chart</option>
            </select>
            
            <Button
              onClick={() => setShowChart(!showChart)}
              label={showChart ? "Hide Chart" : "Show Chart"}
              icon={showChart ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              variant="secondary"
              size="sm"
              ariaLabel={showChart ? "Hide chart" : "Show chart"}
            />
          </div>
        </div>
        
        {showChart && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="h-64 sm:h-80"
          >
            {chartType === "bar" ? (
              <Bar data={chartData.bar} options={chartOptions} />
            ) : (
              <Line data={chartData.line} options={chartOptions} />
            )}
          </motion.div>
        )}
      </motion.section>

      {/* Users Table Section */}
      <motion.section 
        className={`${cardClass} p-6 transition-colors duration-300`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        {isLoading ? (
          <div className="flex justify-center py-8">
            <ThreeDots 
              color={theme === "dark" ? "#6366F1" : "#4F46E5"} 
              height={50} 
              width={50} 
              aria-label="Loading bandwidth data" 
            />
          </div>
        ) : filteredData.length === 0 ? (
          <div className={`text-center py-8 flex flex-col items-center ${textSecondaryClass}`}>
            <AlertTriangle className="w-8 h-8 mb-2" />
            <p>No users found matching your criteria</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {/* Desktop Table */}
            <div className="hidden lg:block">
              <table className="min-w-full divide-y">
                <thead className={theme === "dark" ? "bg-gray-800/60" : "bg-white/80"}>
                  <tr>
                    {tableHeaders.map(header => (
                      <th 
                        key={header.key}
                        className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === "dark" ? "text-gray-300" : "text-gray-500"}`}
                      >
                        {header.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredData.map(user => (
                    <React.Fragment key={user.id}>
                      <tr 
                        className={`hover:opacity-80 cursor-pointer transition-colors duration-300 ${
                          theme === "dark" 
                            ? "hover:bg-gray-700" 
                            : "hover:bg-gray-50"
                        }`}
                        onClick={() => toggleUserExpansion(user.id)}
                      >
                        {/* User Cell */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                              theme === "dark" ? "bg-indigo-900" : "bg-indigo-100"
                            }`}>
                              <span className={theme === "dark" ? "text-indigo-300" : "text-indigo-600"}>
                                {user.name.charAt(0)}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium">{user.name}</div>
                              <div className={`text-xs ${textTertiaryClass}`}>
                                ID: {user.id}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Other cells */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={getUserStatusColor(user.plan.category)}>
                            {user.plan.category}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">{user.plan.name}</td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={getUserStatusColor(user.status)}>
                            {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">{user.devices[0].mac}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          {user.devices[0].allocated === "Unlimited" ? "Unlimited" : `${user.devices[0].allocated} GB`}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">{user.devices[0].used} GB</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">{user.devices[0].qos}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          <span className={checkBandwidthQuota(user.devices[0]).color}>
                            {checkBandwidthQuota(user.devices[0]).message}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditModal(user, user.devices[0]);
                            }}
                            className={`mr-3 hover:opacity-70 transition-colors duration-300 ${
                              theme === "dark" ? "text-indigo-400" : "text-indigo-600"
                            }`}
                            aria-label={`Edit bandwidth for ${user.name}`}
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            className={`hover:opacity-70 transition-colors duration-300 ${
                              theme === "dark" ? textTertiaryClass : textTertiaryClass
                            }`}
                            aria-label={expandedUser === user.id ? "Collapse details" : "Expand details"}
                          >
                            {expandedUser === user.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                          </button>
                        </td>
                      </tr>

                      {/* Expanded Details */}
                      {expandedUser === user.id && (
                        <tr>
                          <td colSpan={tableHeaders.length} className="px-4 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                              <div>
                                <h4 className="font-medium mb-3 flex items-center">
                                  <Terminal className="w-4 h-4 mr-2" />
                                  Device Details
                                </h4>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <span className={`font-medium ${textSecondaryClass}`}>
                                      MAC Address:
                                    </span>
                                    <div>{user.devices[0].mac}</div>
                                  </div>
                                  <div>
                                    <span className={`font-medium ${textSecondaryClass}`}>
                                      IP Address:
                                    </span>
                                    <div>{user.devices[0].ip}</div>
                                  </div>
                                  <div>
                                    <span className={`font-medium ${textSecondaryClass}`}>
                                      Connected:
                                    </span>
                                    <div>{timeSince(user.devices[0].connectedAt)}</div>
                                  </div>
                                  <div>
                                    <span className={`font-medium ${textSecondaryClass}`}>
                                      Quota:
                                    </span>
                                    <div>{user.devices[0].quota === "Unlimited" ? "Unlimited" : `${user.devices[0].quota} GB`}</div>
                                  </div>
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="font-medium mb-3 flex items-center">
                                  <Activity className="w-4 h-4 mr-2" />
                                  Usage Statistics
                                </h4>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <span className={`font-medium ${textSecondaryClass}`}>
                                      Bandwidth Used:
                                    </span>
                                    <div>{`${user.devices[0].used} GB (${
                                      user.devices[0].allocated === "Unlimited" 
                                        ? "∞" 
                                        : `${Math.round((user.devices[0].used / user.devices[0].allocated) * 100)}%`
                                    } of allocated)`}</div>
                                  </div>
                                  <div>
                                    <span className={`font-medium ${textSecondaryClass}`}>
                                      Remaining:
                                    </span>
                                    <div>{user.devices[0].quota === "Unlimited" 
                                      ? "Unlimited" 
                                      : `${user.devices[0].quota - user.devices[0].used} GB`}</div>
                                  </div>
                                  <div>
                                    <span className={`font-medium ${textSecondaryClass}`}>
                                      Last Seen:
                                    </span>
                                    <div>{timeSince(user.lastSeen)}</div>
                                  </div>
                                  <div>
                                    <span className={`font-medium ${textSecondaryClass}`}>
                                      Status:
                                    </span>
                                    <div className={checkBandwidthQuota(user.devices[0]).color}>
                                      {checkBandwidthQuota(user.devices[0]).message}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-4">
              {filteredData.map(user => (
                <div
                  key={user.id}
                  className={`${cardClass} p-4 transition-colors duration-300`}
                >
                  {/* Main Card Content */}
                  <div 
                    className="cursor-pointer transition-colors duration-300 hover:opacity-80"
                    onClick={() => toggleUserExpansion(user.id)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          theme === "dark" ? "bg-indigo-900" : "bg-indigo-100"
                        }`}>
                          <span className={`font-semibold ${
                            theme === "dark" ? "text-indigo-300" : "text-indigo-600"
                          }`}>
                            {user.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold">{user.name}</h3>
                          <p className={`text-sm ${textTertiaryClass}`}>
                            ID: {user.id}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(user, user.devices[0]);
                        }}
                        className={`p-2 rounded-lg ${theme === "dark" ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-100 hover:bg-gray-200"} transition-colors duration-300`}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className={`font-medium ${textSecondaryClass}`}>
                          Status:
                        </span>
                        <div className={getUserStatusColor(user.status)}>
                          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        </div>
                      </div>
                      <div>
                        <span className={`font-medium ${textSecondaryClass}`}>
                          Allocated:
                        </span>
                        <div>
                          {user.devices[0].allocated === "Unlimited" ? "Unlimited" : `${user.devices[0].allocated} GB`}
                        </div>
                      </div>
                      <div>
                        <span className={`font-medium ${textSecondaryClass}`}>
                          Used:
                        </span>
                        <div>{user.devices[0].used} GB</div>
                      </div>
                      <div>
                        <span className={`font-medium ${textSecondaryClass}`}>
                          Quota:
                        </span>
                        <div className={checkBandwidthQuota(user.devices[0]).color}>
                          {checkBandwidthQuota(user.devices[0]).message}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedUser === user.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t border-gray-700 transition-colors duration-300"
                    >
                      <div className="space-y-4 text-sm">
                        <div>
                          <h4 className="font-medium mb-2 flex items-center">
                            <Terminal className="w-4 h-4 mr-2" />
                            Device Details
                          </h4>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { label: "MAC", value: user.devices[0].mac },
                              { label: "IP", value: user.devices[0].ip },
                              { label: "Connected", value: timeSince(user.devices[0].connectedAt) },
                              { label: "QoS", value: user.devices[0].qos }
                            ].map((item, index) => (
                              <React.Fragment key={index}>
                                <div className={`font-medium ${textSecondaryClass}`}>
                                  {item.label}:
                                </div>
                                <div>{item.value}</div>
                              </React.Fragment>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.section>

      {/* Edit Modal */}
      <AnimatePresence>
        {selectedUser && selectedDevice && (
          <Modal
            isOpen={!!selectedUser}
            title={`Edit Bandwidth for ${selectedUser.name}'s Device`}
            onClose={() => {
              setSelectedUser(null);
              setSelectedDevice(null);
              setNewAllocation("");
              setNewQos("");
            }}
          >
            <div className="space-y-4">
              <div>
                <label className={`block text-sm mb-1 ${textSecondaryClass}`}>
                  MAC Address
                </label>
                <div className={`p-2 rounded-lg ${theme === "dark" ? "bg-gray-700/50" : "bg-gray-100"}`}>
                  {selectedDevice.mac}
                </div>
              </div>
              
              <div>
                <label className={`block text-sm mb-1 ${textSecondaryClass}`}>
                  Allocated Bandwidth
                </label>
                <div className="flex">
                  <input
                    type="text"
                    className={`flex-1 p-2 border rounded-l-lg ${inputClass} transition-colors duration-300`}
                    value={newAllocation}
                    onChange={(e) => setNewAllocation(e.target.value)}
                    placeholder="Enter bandwidth in GB"
                    aria-label="Allocated bandwidth"
                    disabled={isUpdating}
                  />
                  <select
                    className={`p-2 border rounded-r-lg ${inputClass} transition-colors duration-300`}
                    value={newAllocation === "Unlimited" ? "Unlimited" : ""}
                    onChange={(e) => setNewAllocation(e.target.value === "Unlimited" ? "Unlimited" : newAllocation)}
                    aria-label="Bandwidth type"
                    disabled={isUpdating}
                  >
                    <option value="">Custom</option>
                    <option value="Unlimited">Unlimited</option>
                  </select>
                </div>
                <p className={`text-xs mt-1 ${textTertiaryClass}`}>
                  Max for {selectedUser.plan.name} ({selectedUser.plan.category}):{" "}
                  {plans.find(p => p.name === selectedUser.plan.name)?.dataLimit.value || "N/A"}{" "}
                  {plans.find(p => p.name === selectedUser.plan.name)?.dataLimit.unit || ""}
                </p>
              </div>
              
              <div>
                <label className={`block text-sm mb-1 ${textSecondaryClass}`}>
                  Quality of Service (QoS)
                </label>
                <select
                  className={`w-full p-2 border rounded-lg ${inputClass} transition-colors duration-300`}
                  value={newQos}
                  onChange={(e) => setNewQos(e.target.value)}
                  aria-label="Quality of Service"
                  disabled={isUpdating}
                >
                  {getAllowedQosOptions(selectedUser.plan.category).map(priority => (
                    <option key={priority} value={priority}>
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  onClick={() => {
                    setSelectedUser(null);
                    setSelectedDevice(null);
                    setNewAllocation("");
                    setNewQos("");
                  }}
                  label="Cancel"
                  variant="secondary"
                  disabled={isUpdating}
                  ariaLabel="Cancel editing"
                />
                <Button
                  onClick={handleSaveChanges}
                  label={isUpdating ? "Saving..." : "Save Changes"}
                  icon={isUpdating && <ThreeDots color="#fff" height={20} width={40} />}
                  variant="primary"
                  disabled={isUpdating || !newAllocation || !newQos}
                  ariaLabel="Save bandwidth changes"
                />
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

// Reusable Button Component
const Button = ({ 
  onClick, 
  label, 
  icon, 
  variant = "primary", 
  size = "md", 
  disabled = false, 
  fullWidth = false,
  ariaLabel 
}) => {
  const { theme } = useTheme();
  
  const baseStyles = "flex items-center justify-center font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: theme === "dark" 
      ? "bg-indigo-600 hover:bg-indigo-700 text-white" 
      : "bg-indigo-600 hover:bg-indigo-700 text-white",
    secondary: theme === "dark"
      ? "bg-gray-700 hover:bg-gray-600 text-white border border-gray-600"
      : "bg-gray-200 hover:bg-gray-300 text-gray-800 border border-gray-300"
  };
  
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };
  
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? "w-full" : ""}`}
      aria-label={ariaLabel}
    >
      {icon && React.cloneElement(icon, { className: `w-4 h-4 ${label ? "mr-2" : ""}` })}
      {label}
    </motion.button>
  );
};

// Reusable Modal Component
const Modal = ({ isOpen, title, onClose, children }) => {
  const { theme } = useTheme();
  
  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 transition-colors duration-300"
          role="dialog" 
          aria-modal="true"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className={`max-w-md w-full max-h-[90vh] overflow-y-auto rounded-xl shadow-xl ${
              theme === "dark" 
                ? "bg-gray-800/80 backdrop-blur-md text-white border border-gray-700" 
                : "bg-white/80 backdrop-blur-md text-gray-800 border border-gray-200"
            } transition-colors duration-300`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-700">
              <h3 className="text-lg font-semibold">{title}</h3>
              <button 
                onClick={onClose} 
                className={`p-1 rounded-full hover:opacity-70 transition-colors duration-300 ${
                  theme === "dark" 
                    ? "hover:bg-gray-700" 
                    : "hover:bg-gray-200"
                }`}
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default BandwidthAllocation;