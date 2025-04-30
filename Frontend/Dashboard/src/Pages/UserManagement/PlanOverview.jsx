// import React, { useState, useMemo, useEffect } from "react";
// import {
//   Users, Wifi, CreditCard, BarChart2, Download, HardDrive, Shield,
//   FileText, Filter, AlertCircle, CheckCircle, Clock, Send, DollarSign,
//   ChevronDown, ChevronUp, User, MessageSquare, TrendingUp, TrendingDown,
//   AlertTriangle, History
// } from "lucide-react";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { motion, AnimatePresence } from "framer-motion";
// import PropTypes from "prop-types";

// // Mock Data
// const mockPlans = [
//   {
//     id: 1,
//     name: "Basic 20",
//     price: 500,
//     downloadSpeed: { value: 20, unit: "Mbps" },
//     uploadSpeed: { value: 10, unit: "Mbps" },
//     dataLimit: { value: 50, unit: "GB" },
//     expiry: { value: 30, unit: "Days" },
//     category: "Residential",
//     description: "Great for light browsing",
//   },
//   {
//     id: 2,
//     name: "Residential 50",
//     price: 1500,
//     downloadSpeed: { value: 50, unit: "Mbps" },
//     uploadSpeed: { value: 20, unit: "Mbps" },
//     dataLimit: { value: "Unlimited", unit: "GB" },
//     expiry: { value: 30, unit: "Days" },
//     category: "Residential",
//     description: "Perfect for streaming and browsing",
//   },
//   {
//     id: 3,
//     name: "Enterprise 100",
//     price: 5000,
//     downloadSpeed: { value: 100, unit: "Mbps" },
//     uploadSpeed: { value: 50, unit: "Mbps" },
//     dataLimit: { value: 100, unit: "GB" },
//     expiry: { value: 30, unit: "Days" },
//     category: "Enterprise",
//     description: "High-speed for business needs",
//   },
//   {
//     id: 4,
//     name: "Free Trial",
//     price: 0,
//     downloadSpeed: { value: 10, unit: "Mbps" },
//     uploadSpeed: { value: 5, unit: "Mbps" },
//     dataLimit: { value: 5, unit: "GB" },
//     expiry: { value: 7, unit: "Days" },
//     category: "Promotional",
//     description: "Free trial for new users",
//   },
// ];

// const mockClients = [
//   {
//     id: 1,
//     fullName: "Ken Opiyo",
//     phoneNumber: "+254701234567",
//     device: "iPhone 13 Pro",
//     deviceId: "AA:BB:CC:DD:EE:FF",
//     currentPlan: null,
//     assignedDate: null,
//     dataUsage: null,
//     paymentStatus: "Expired",
//   },
//   {
//     id: 2,
//     fullName: "Lenox Kamari",
//     phoneNumber: "+254712345678",
//     device: "Samsung Galaxy S22",
//     deviceId: "11:22:33:44:55:66",
//     currentPlan: mockPlans[1], // Residential 50
//     assignedDate: "2025-04-01T10:00:00Z",
//     dataUsage: { used: 15, total: "Unlimited", unit: "GB" },
//     paymentStatus: "Paid",
//   },
//   {
//     id: 3,
//     fullName: "Lucy Wange",
//     phoneNumber: "+254745678901",
//     device: "Google Pixel 6",
//     deviceId: "77:88:99:AA:BB:CC",
//     currentPlan: mockPlans[2], // Enterprise 100
//     assignedDate: "2025-04-05T08:00:00Z",
//     dataUsage: { used: 95, total: 100, unit: "GB" },
//     paymentStatus: "Due",
//   },
//   {
//     id: 4,
//     fullName: "Jane Doe",
//     phoneNumber: "+254723456789",
//     device: "OnePlus 9",
//     deviceId: "DD:EE:FF:11:22:33",
//     currentPlan: mockPlans[3], // Free Trial
//     assignedDate: "2025-04-15T09:00:00Z",
//     dataUsage: { used: 4, total: 5, unit: "GB" },
//     paymentStatus: "Paid",
//   },
// ];

// // Utility Functions
// const formatDate = (dateString) => {
//   if (!dateString) return "N/A";
//   const options = { year: "numeric", month: "short", day: "numeric" };
//   return new Date(dateString).toLocaleDateString(undefined, options);
// };

// const formatCurrency = (amount) => {
//   return new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" }).format(amount);
// };

// const formatPhoneNumber = (phone) => {
//   if (!phone) return "";
//   if (phone.startsWith("+254") && phone.length === 13) {
//     return `0${phone.slice(4)}`;
//   }
//   return phone;
// };

// const PaymentStatusIcon = ({ status }) => {
//   switch (status) {
//     case "Paid":
//       return <CheckCircle className="text-green-500" size={16} />;
//     case "Due":
//       return <Clock className="text-yellow-500" size={16} />;
//     case "Expired":
//       return <AlertCircle className="text-red-500" size={16} />;
//     default:
//       return <CreditCard className="text-gray-500" size={16} />;
//   }
// };

// const PlanOverview = () => {
//   const [users, setUsers] = useState(mockClients);
//   const [filterCategory, setFilterCategory] = useState("All");
//   const [filterStatus, setFilterStatus] = useState("All");
//   const [usageThreshold, setUsageThreshold] = useState(75);
//   const [selectedUsers, setSelectedUsers] = useState([]);
//   const [showFilters, setShowFilters] = useState(false);
//   const [showSMSHistory, setShowSMSHistory] = useState(false);
//   const [sentMessages, setSentMessages] = useState([]); // Store SMS history
//   const [filterPreset, setFilterPreset] = useState("All");

//   // Aggregate Statistics
//   const planStats = useMemo(() => {
//     const stats = {
//       totalUsers: users.length,
//       activeUsers: users.filter((u) => u.currentPlan).length,
//       highUsageUsers: 0,
//       collectedRevenue: 0,
//       activeDevices: new Set(users.map((u) => u.deviceId)).size,
//       congestedUsers: 0,
//     };

//     users.forEach((user) => {
//       if (user.currentPlan) {
//         if (
//           user.dataUsage &&
//           user.dataUsage.total !== "Unlimited" &&
//           (user.dataUsage.used / user.dataUsage.total) * 100 >= usageThreshold
//         ) {
//           stats.highUsageUsers += 1;
//           stats.congestedUsers += 1; // Assume high usage contributes to congestion
//         }
//         if (user.paymentStatus === "Paid") {
//           stats.collectedRevenue += user.currentPlan.price;
//         }
//       }
//     });

//     return stats;
//   }, [users, usageThreshold]);

//   // Filtered Users
//   const filteredUsers = useMemo(() => {
//     let filtered = users;
//     if (filterPreset === "High Usage") {
//       filtered = users.filter(
//         (user) =>
//           user.dataUsage &&
//           user.dataUsage.total !== "Unlimited" &&
//           (user.dataUsage.used / user.dataUsage.total) * 100 >= usageThreshold
//       );
//     } else if (filterPreset === "Expiring Soon") {
//       filtered = users.filter((user) => {
//         if (!user.assignedDate || !user.currentPlan?.expiry) return false;
//         const expiryDate = new Date(
//           new Date(user.assignedDate).getTime() +
//             user.currentPlan.expiry.value * 24 * 60 * 60 * 1000
//         );
//         return (
//           new Date() >= new Date(expiryDate.getTime() - 3 * 24 * 60 * 60 * 1000) ||
//           new Date() > expiryDate
//         );
//       });
//     } else {
//       filtered = users.filter((user) => {
//         const matchesCategory =
//           filterCategory === "All" ||
//           (user.currentPlan && user.currentPlan.category === filterCategory);
//         const matchesStatus =
//           filterStatus === "All" || user.paymentStatus === filterStatus;
//         return matchesCategory && matchesStatus;
//       });
//     }
//     return filtered;
//   }, [users, filterCategory, filterStatus, filterPreset, usageThreshold]);

//   // Mock SMS API
//   const sendSMS = async (phoneNumber, message) => {
//     return new Promise((resolve) => {
//       setTimeout(() => {
//         console.log(`SMS sent to ${phoneNumber}: ${message}`);
//         resolve(true);
//       }, 1000);
//     });
//   };

//   // Automatic SMS Notifications
//   useEffect(() => {
//     const checkUsersForSMS = async () => {
//       const now = new Date();
//       for (const user of users) {
//         const messageKey = `${user.id}-${user.dataUsage?.used || "none"}-${user.assignedDate || "none"}`;
//         if (sentMessages.some((msg) => msg.key === messageKey)) continue;

//         // Data Usage Alert (>=75%)
//         const isHighUsage =
//           user.dataUsage &&
//           user.dataUsage.total !== "Unlimited" &&
//           (user.dataUsage.used / user.dataUsage.total) * 100 >= usageThreshold;

//         // Expiry Alert (within 3 days or expired)
//         let expiryDate = null;
//         if (user.assignedDate && user.currentPlan?.expiry) {
//           expiryDate = new Date(
//             new Date(user.assignedDate).getTime() +
//               user.currentPlan.expiry.value * 24 * 60 * 60 * 1000
//           );
//         }
//         const isExpiringSoon =
//           expiryDate &&
//           (now >= new Date(expiryDate.getTime() - 3 * 24 * 60 * 60 * 1000) ||
//            now > expiryDate);

//         if (isHighUsage || isExpiringSoon) {
//           let message = "";
//           if (isHighUsage) {
//             const percentage = ((user.dataUsage.used / user.dataUsage.total) * 100).toFixed(0);
//             message = `Hi ${user.fullName}, your data is at ${percentage}% (${user.dataUsage.used}/${user.dataUsage.total} GB). Top up now! Contact +254700123456.`;
//           } else if (isExpiringSoon) {
//             const status = now > expiryDate ? "expired" : "expiring soon";
//             message = `Hi ${user.fullName}, your ${user.currentPlan.name} plan is ${status} on ${formatDate(expiryDate)}. Renew for ${formatCurrency(user.currentPlan.price)} to stay connected! Contact +254700123456.`;
//           }

//           try {
//             await sendSMS(user.phoneNumber, message);
//             setSentMessages((prev) => [
//               ...prev,
//               {
//                 key: messageKey,
//                 user: user.fullName,
//                 phone: formatPhoneNumber(user.phoneNumber),
//                 message,
//                 timestamp: new Date().toISOString(),
//               },
//             ]);
//             toast.info(`Automatic SMS sent to ${user.fullName}`);
//           } catch (error) {
//             toast.error(`Failed to send SMS to ${user.fullName}`);
//           }
//         }
//       }
//     };

//     checkUsersForSMS(); // Initial check
//     const interval = setInterval(checkUsersForSMS, 60000);
//     return () => clearInterval(interval);
//   }, [users, usageThreshold, sentMessages]);

//   // Manual Bulk SMS
//   const handleBulkSMS = async () => {
//     const usersToContact = filteredUsers.filter((user) =>
//       selectedUsers.includes(user.id)
//     );

//     if (usersToContact.length === 0) {
//       toast.warn("No users selected for SMS");
//       return;
//     }

//     try {
//       await Promise.all(
//         usersToContact.map((user) => {
//           const isHighUsage =
//             user.dataUsage &&
//             user.dataUsage.total !== "Unlimited" &&
//             (user.dataUsage.used / user.dataUsage.total) * 100 >= usageThreshold;
//           const expiryDate =
//             user.assignedDate && user.currentPlan?.expiry
//               ? new Date(
//                   new Date(user.assignedDate).getTime() +
//                     user.currentPlan.expiry.value * 24 * 60 * 60 * 1000
//                 )
//               : null;
//           const isExpiringSoon =
//             expiryDate &&
//             (new Date() >= new Date(expiryDate.getTime() - 3 * 24 * 60 * 60 * 1000) ||
//              new Date() > expiryDate);

//           const message = isHighUsage
//             ? `Hi ${user.fullName}, your data is at ${((user.dataUsage.used / user.dataUsage.total) * 100).toFixed(0)}% (${user.dataUsage.used}/${user.dataUsage.total} GB). Top up now! Contact +254700123456.`
//             : isExpiringSoon
//             ? `Hi ${user.fullName}, your ${user.currentPlan?.name} plan is ${new Date() > expiryDate ? "expired" : "expiring soon"} on ${formatDate(expiryDate)}. Renew for ${formatCurrency(user.currentPlan?.price)}! Contact +254700123456.`
//             : `Hi ${user.fullName}, stay connected with ${user.currentPlan?.name}! Contact +254700123456 for support.`;

//           return sendSMS(user.phoneNumber, message);
//         })
//       );
//       toast.success(`Manual SMS sent to ${usersToContact.length} users`);
//       setSelectedUsers([]);
//     } catch (error) {
//       toast.error("Failed to send bulk SMS");
//     }
//   };

//   // Update Payment Status
//   const handleStatusUpdate = (userId, newStatus) => {
//     setUsers((prev) =>
//       prev.map((user) =>
//         user.id === userId ? { ...user, paymentStatus: newStatus } : user
//       )
//     );
//     const user = users.find((u) => u.id === userId);
//     toast.success(`Status updated for ${user.fullName} to ${newStatus}`);
//   };

//   // Export Report
//   const handleExportReport = () => {
//     const csvContent = [
//       [
//         "ID", "Full Name", "Phone", "Device", "MAC Address", "Plan", "Category",
//         "Payment Status", "Data Usage", "Assigned Date", "Expiry Date"
//       ],
//       ...filteredUsers.map((user) => [
//         user.id,
//         user.fullName,
//         formatPhoneNumber(user.phoneNumber),
//         user.device || "N/A",
//         user.deviceId || "N/A",
//         user.currentPlan ? user.currentPlan.name : "None",
//         user.currentPlan ? user.currentPlan.category : "None",
//         user.paymentStatus,
//         user.dataUsage
//           ? user.dataUsage.total === "Unlimited"
//             ? "Unlimited"
//             : `${user.dataUsage.used}/${user.dataUsage.total} ${user.dataUsage.unit}`
//           : "N/A",
//         formatDate(user.assignedDate),
//         user.currentPlan && user.assignedDate
//           ? formatDate(
//               new Date(
//                 new Date(user.assignedDate).getTime() +
//                   user.currentPlan.expiry.value * 24 * 60 * 60 * 1000
//               )
//             )
//           : "N/A",
//       ]),
//     ]
//       .map((row) => row.join(","))
//       .join("\n");

//     const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
//     const link = document.createElement("a");
//     link.href = URL.createObjectURL(blob);
//     link.download = "plan_analytics_report.csv";
//     link.click();
//     toast.success("Report exported successfully");
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-gray-50 to-purple-50 p-4 md:p-8">
//       <ToastContainer position="top-right" autoClose={3000} />
//       <div className="max-w-7xl mx-auto">
//         <div className="flex items-center justify-between mb-8">
//           <div>
//             <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Plan Analytics Dashboard</h1>
//             <p className="text-gray-600 mt-2">Streamlined network management with automated client engagement</p>
//           </div>
//           <motion.button
//             onClick={handleExportReport}
//             className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center"
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
//             aria-label="Export report"
//           >
//             <FileText className="w-5 h-5 mr-2" /> Export Analytics
//           </motion.button>
//         </div>

//         {/* Stats Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//           <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-gray-100/50 p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-gray-600 flex items-center gap-2">
//                   <Users className="w-4 h-4" /> Total Users
//                 </p>
//                 <p className="text-2xl font-bold text-gray-900">{planStats.totalUsers}</p>
//                 <p className="text-sm text-green-600">
//                   Active: {planStats.activeUsers} ({((planStats.activeUsers / planStats.totalUsers) * 100).toFixed(1)}%)
//                 </p>
//               </div>
//               <div className="p-3 bg-blue-100/50 rounded-full">
//                 <Users className="w-8 h-8 text-blue-600" />
//               </div>
//             </div>
//           </div>
//           <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-gray-100/50 p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-gray-600 flex items-center gap-2">
//                   <AlertCircle className="w-4 h-4" /> High Usage Alerts
//                 </p>
//                 <p className="text-2xl font-bold text-gray-900">{planStats.highUsageUsers}</p>
//                 <p className="text-sm text-yellow-600">Above {usageThreshold}% data usage</p>
//               </div>
//               <div className="p-3 bg-yellow-100/50 rounded-full">
//                 <AlertCircle className="w-8 h-8 text-yellow-600" />
//               </div>
//             </div>
//           </div>
//           <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-gray-100/50 p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-gray-600 flex items-center gap-2">
//                   <DollarSign className="w-4 h-4" /> Collected Revenue
//                 </p>
//                 <p className="text-2xl font-bold text-gray-900">{formatCurrency(planStats.collectedRevenue)}</p>
//                 <p className="text-sm text-gray-600">From paid clients</p>
//               </div>
//               <div className="p-3 bg-green-100/50 rounded-full">
//                 <DollarSign className="w-8 h-8 text-green-600" />
//               </div>
//             </div>
//           </div>
//           <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-gray-100/50 p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-gray-600 flex items-center gap-2">
//                   <HardDrive className="w-4 h-4" /> Network Health
//                 </p>
//                 <p className="text-2xl font-bold text-gray-900">{planStats.activeDevices}</p>
//                 <p className="text-sm text-purple-600">
//                   Congested: {planStats.congestedUsers} users
//                 </p>
//               </div>
//               <div className="p-3 bg-purple-100/50 rounded-full">
//                 <HardDrive className="w-8 h-8 text-purple-600" />
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* User Plan Analytics */}
//         <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-100/50 p-6">
//           <div className="flex items-center justify-between mb-6">
//             <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
//               <BarChart2 className="text-indigo-600" size={20} />
//               User Plan Analytics
//             </h3>
//             <div className="flex items-center gap-4">
//               <motion.button
//                 onClick={() => setShowFilters(!showFilters)}
//                 className="px-3 py-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-lg hover:from-gray-200 hover:to-gray-300 flex items-center"
//                 whileHover={{ scale: 1.05 }}
//                 aria-label={showFilters ? "Hide filters" : "Show filters"}
//               >
//                 <Filter className="w-4 h-4 mr-2" /> Filters {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
//               </motion.button>
//               <motion.button
//                 onClick={() => setShowSMSHistory(!showSMSHistory)}
//                 className="px-3 py-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-lg hover:from-gray-200 hover:to-gray-300 flex items-center"
//                 whileHover={{ scale: 1.05 }}
//                 aria-label={showSMSHistory ? "Hide SMS history" : "Show SMS history"}
//               >
//                 <History className="w-4 h-4 mr-2" /> SMS Log {showSMSHistory ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
//               </motion.button>
//               <motion.button
//                 onClick={handleBulkSMS}
//                 className="px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center disabled:opacity-50"
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//                 disabled={selectedUsers.length === 0}
//                 aria-label="Send bulk SMS"
//               >
//                 <Send className="w-4 h-4 mr-2" /> Send Bulk SMS
//               </motion.button>
//             </div>
//           </div>

//           {/* Filters */}
//           <AnimatePresence>
//             {showFilters && (
//               <motion.div
//                 initial={{ height: 0, opacity: 0 }}
//                 animate={{ height: "auto", opacity: 1 }}
//                 exit={{ height: 0, opacity: 0 }}
//                 transition={{ duration: 0.3 }}
//                 className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4"
//               >
//                 <div>
//                   <label className="text-sm text-gray-600 flex items-center gap-2">
//                     <Filter className="w-4 h-4" /> Preset
//                   </label>
//                   <select
//                     value={filterPreset}
//                     onChange={(e) => setFilterPreset(e.target.value)}
//                     className="w-full px-3 py-2 mt-1 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white/50"
//                     aria-label="Filter preset"
//                   >
//                     <option value="All">All Users</option>
//                     <option value="High Usage">High Usage</option>
//                     <option value="Expiring Soon">Expiring Soon</option>
//                   </select>
//                 </div>
//                 <div>
//                   <label className="text-sm text-gray-600 flex items-center gap-2">
//                     <Filter className="w-4 h-4" /> Category
//                   </label>
//                   <select
//                     value={filterCategory}
//                     onChange={(e) => setFilterCategory(e.target.value)}
//                     className="w-full px-3 py-2 mt-1 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white/50"
//                     aria-label="Filter by plan category"
//                     disabled={filterPreset !== "All"}
//                   >
//                     <option value="All">All Categories</option>
//                     <option value="Residential">Residential</option>
//                     <option value="Enterprise">Enterprise</option>
//                     <option value="Promotional">Promotional</option>
//                   </select>
//                 </div>
//                 <div>
//                   <label className="text-sm text-gray-600 flex items-center gap-2">
//                     <Filter className="w-4 h-4" /> Status
//                   </label>
//                   <select
//                     value={filterStatus}
//                     onChange={(e) => setFilterStatus(e.target.value)}
//                     className="w-full px-3 py-2 mt-1 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white/50"
//                     aria-label="Filter by payment status"
//                     disabled={filterPreset !== "All"}
//                   >
//                     <option value="All">All Statuses</option>
//                     <option value="Paid">Paid</option>
//                     <option value="Due">Due</option>
//                     <option value="Expired">Expired</option>
//                   </select>
//                 </div>
//                 <div>
//                   <label className="text-sm text-gray-600 flex items-center gap-2">
//                     <Filter className="w-4 h-4" /> Usage Threshold (%)
//                   </label>
//                   <input
//                     type="number"
//                     value={usageThreshold}
//                     onChange={(e) => setUsageThreshold(Number(e.target.value))}
//                     min="0"
//                     max="100"
//                     className="w-full px-3 py-2 mt-1 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white/50"
//                     aria-label="Set usage threshold"
//                   />
//                 </div>
//               </motion.div>
//             )}
//           </AnimatePresence>

//           {/* SMS History */}
//           <AnimatePresence>
//             {showSMSHistory && (
//               <motion.div
//                 initial={{ height: 0, opacity: 0 }}
//                 animate={{ height: "auto", opacity: 1 }}
//                 exit={{ height: 0, opacity: 0 }}
//                 transition={{ duration: 0.3 }}
//                 className="mb-6 p-4 bg-gray-50/50 rounded-lg"
//               >
//                 <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
//                   <History className="w-4 h-4" /> SMS History
//                 </h4>
//                 {sentMessages.length === 0 ? (
//                   <p className="text-sm text-gray-500">No SMS sent yet</p>
//                 ) : (
//                   <div className="overflow-x-auto">
//                     <table className="w-full text-sm text-left text-gray-700">
//                       <thead className="text-xs text-gray-500 uppercase bg-gray-100">
//                         <tr>
//                           <th className="px-4 py-2">User</th>
//                           <th className="px-4 py-2">Phone</th>
//                           <th className="px-4 py-2">Message</th>
//                           <th className="px-4 py-2">Sent At</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {sentMessages.map((msg, index) => (
//                           <tr key={index} className="border-b">
//                             <td className="px-4 py-2">{msg.user}</td>
//                             <td className="px-4 py-2">{msg.phone}</td>
//                             <td className="px-4 py-2">{msg.message}</td>
//                             <td className="px-4 py-2">{formatDate(msg.timestamp)}</td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 )}
//               </motion.div>
//             )}
//           </AnimatePresence>

//           {/* Table */}
//           <div className="overflow-x-auto">
//             <table className="w-full text-sm text-left text-gray-900">
//               <thead className="text-xs text-gray-600 uppercase bg-gradient-to-r from-blue-100 to-indigo-100 sticky top-0 z-10">
//                 <tr>
//                   <th className="px-4 py-3">
//                     <input
//                       type="checkbox"
//                       checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
//                       onChange={(e) =>
//                         setSelectedUsers(
//                           e.target.checked ? filteredUsers.map((u) => u.id) : []
//                         )
//                       }
//                       className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
//                       aria-label="Select all users"
//                     />
//                   </th>
//                   <th className="px-4 py-3">User</th>
//                   <th className="px-4 py-3">Plan</th>
//                   <th className="px-4 py-3">Status</th>
//                   <th className="px-4 py-3">Data Usage</th>
//                   <th className="px-4 py-3">MAC Address</th>
//                   <th className="px-4 py-3">Expiry</th>
//                   <th className="px-4 py-3">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredUsers.length === 0 ? (
//                   <tr>
//                     <td colSpan="8" className="px-4 py-4 text-center text-gray-500">
//                       No users match the selected filters
//                     </td>
//                   </tr>
//                 ) : (
//                   filteredUsers.map((user) => {
//                     const isHighUsage =
//                       user.dataUsage &&
//                       user.dataUsage.total !== "Unlimited" &&
//                       (user.dataUsage.used / user.dataUsage.total) * 100 >= usageThreshold;
//                     // Mock trend: Assume increasing if high usage, else stable
//                     const usageTrend = isHighUsage ? "up" : "stable";
//                     return (
//                       <tr key={user.id} className="border-b hover:bg-gray-50/50 transition-all">
//                         <td className="px-4 py-3">
//                           <input
//                             type="checkbox"
//                             checked={selectedUsers.includes(user.id)}
//                             onChange={() =>
//                               setSelectedUsers((prev) =>
//                                 prev.includes(user.id)
//                                   ? prev.filter((id) => id !== user.id)
//                                   : [...prev, user.id]
//                               )
//                             }
//                             className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
//                             aria-label={`Select ${user.fullName}`}
//                           />
//                         </td>
//                         <td className="px-4 py-3">
//                           <div className="flex items-center gap-2">
//                             <User className="w-4 h-4 text-gray-600" />
//                             <div>
//                               <p className="font-medium">{user.fullName}</p>
//                               <p className="text-xs text-gray-500">{formatPhoneNumber(user.phoneNumber)}</p>
//                             </div>
//                           </div>
//                         </td>
//                         <td className="px-4 py-3">
//                           {user.currentPlan ? (
//                             <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs">
//                               {user.currentPlan.name}
//                             </span>
//                           ) : (
//                             "None"
//                           )}
//                         </td>
//                         <td className="px-4 py-3">
//                           <div className="flex items-center gap-2">
//                             <PaymentStatusIcon status={user.paymentStatus} />
//                             <select
//                               value={user.paymentStatus}
//                               onChange={(e) => handleStatusUpdate(user.id, e.target.value)}
//                               className={`text-xs border-none bg-transparent focus:ring-0 ${user.paymentStatus === "Due" ? "text-yellow-600" : user.paymentStatus === "Expired" ? "text-red-600" : "text-green-600"}`}
//                               aria-label={`Update status for ${user.fullName}`}
//                             >
//                               <option value="Paid">Paid</option>
//                               <option value="Due">Due</option>
//                               <option value="Expired">Expired</option>
//                             </select>
//                           </div>
//                         </td>
//                         <td className="px-4 py-3">
//                           {user.dataUsage ? (
//                             <div className="flex items-center gap-2">
//                               {isHighUsage && <AlertTriangle className="w-4 h-4 text-red-500" />}
//                               <span className={isHighUsage ? "text-red-600" : ""}>
//                                 {user.dataUsage.total === "Unlimited"
//                                   ? "Unlimited"
//                                   : `${user.dataUsage.used}/${user.dataUsage.total} ${user.dataUsage.unit}`}
//                               </span>
//                               {usageTrend === "up" ? (
//                                 <TrendingUp className="w-4 h-4 text-red-500" />
//                               ) : (
//                                 <TrendingDown className="w-4 h-4 text-green-500" />
//                               )}
//                             </div>
//                           ) : (
//                             "N/A"
//                           )}
//                         </td>
//                         <td className="px-4 py-3">
//                           <div className="flex items-center gap-2">
//                             <Shield className="w-4 h-4 text-gray-600" />
//                             {user.deviceId || "N/A"}
//                           </div>
//                         </td>
//                         <td className="px-4 py-3">
//                           {user.currentPlan && user.assignedDate
//                             ? formatDate(
//                                 new Date(
//                                   new Date(user.assignedDate).getTime() +
//                                     user.currentPlan.expiry.value * 24 * 60 * 60 * 1000
//                                 )
//                               )
//                             : "N/A"}
//                         </td>
//                         <td className="px-4 py-3">
//                           <motion.button
//                             onClick={() => {
//                               const isHighUsage =
//                                 user.dataUsage &&
//                                 user.dataUsage.total !== "Unlimited" &&
//                                 (user.dataUsage.used / user.dataUsage.total) * 100 >= usageThreshold;
//                               const expiryDate =
//                                 user.assignedDate && user.currentPlan?.expiry
//                                   ? new Date(
//                                       new Date(user.assignedDate).getTime() +
//                                         user.currentPlan.expiry.value * 24 * 60 * 60 * 1000
//                                     )
//                                   : null;
//                               const isExpiringSoon =
//                                 expiryDate &&
//                                 (new Date() >= new Date(expiryDate.getTime() - 3 * 24 * 60 * 60 * 1000) ||
//                                  new Date() > expiryDate);

//                               const message = isHighUsage
//                                 ? `Hi ${user.fullName}, your data is at ${((user.dataUsage.used / user.dataUsage.total) * 100).toFixed(0)}% (${user.dataUsage.used}/${user.dataUsage.total} GB). Top up now! Contact +254700123456.`
//                                 : isExpiringSoon
//                                 ? `Hi ${user.fullName}, your ${user.currentPlan?.name} plan is ${new Date() > expiryDate ? "expired" : "expiring soon"} on ${formatDate(expiryDate)}. Renew for ${formatCurrency(user.currentPlan?.price)}! Contact +254700123456.`
//                                 : `Hi ${user.fullName}, stay connected with ${user.currentPlan?.name}! Contact +254700123456 for support.`;

//                               sendSMS(user.phoneNumber, message)
//                                 .then(() => toast.success(`SMS sent to ${user.fullName}`))
//                                 .catch(() => toast.error(`Failed to send SMS to ${user.fullName}`));
//                             }}
//                             className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center text-xs"
//                             whileHover={{ scale: 1.05 }}
//                             whileTap={{ scale: 0.95 }}
//                             aria-label={`Send SMS to ${user.fullName}`}
//                           >
//                             <MessageSquare className="w-4 h-4 mr-1" /> Send SMS
//                           </motion.button>
//                         </td>
//                       </tr>
//                     );
//                   })
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// PlanOverview.propTypes = {
//   initialUsers: PropTypes.array,
//   initialPlans: PropTypes.array,
// };

// export default PlanOverview;







// import React, { useState, useEffect, useCallback, useMemo } from "react";
// import {
//   Users, Wifi, CreditCard, BarChart2, Download, HardDrive, FileText, Filter,
//   Clock, Send, DollarSign, ChevronDown, ChevronUp, MessageSquare, Bell,
//   User, Shield, CheckCircle, AlertCircle, History, AlertTriangle
// } from "lucide-react";
// import { motion, AnimatePresence } from "framer-motion";
// import api from "../../../api"
// import { useAuth } from "../../context/AuthContext"
// import { formatDate, formatCurrency, formatPhoneNumber } from "../../components/utils"
// import Skeleton from "react-loading-skeleton"; // For skeleton loaders
// import "react-loading-skeleton/dist/skeleton.css";

// // Utility Functions (Extracted to a separate file or kept inline)
// const PaymentStatusIcon = ({ status }) => {
//   switch (status) {
//     case "Paid":
//       return <CheckCircle className="text-green-500" size={16} />;
//     case "Due":
//       return <Clock className="text-yellow-500" size={16} />;
//     case "Expired":
//       return <AlertCircle className="text-red-500" size={16} />;
//     default:
//       return <CreditCard className="text-gray-500" size={16} />;
//   }
// };

// const PlanOverview = () => {
//   const { isAuthenticated, logout } = useAuth();
//   const [data, setData] = useState({
//     plans: [],
//     clients: [],
//     stats: { total_clients: 0, active_clients: 0, high_usage_clients: 0, collected_revenue: 0, active_devices: 0, congested_routers: 0 },
//     thresholds: [],
//     notifications: []
//   });
//   const [smsHistory, setSMSHistory] = useState([]);
//   const [filterCategory, setFilterCategory] = useState("All");
//   const [filterStatus, setFilterStatus] = useState("All");
//   const [usageThreshold, setUsageThreshold] = useState(75);
//   const [selectedUsers, setSelectedUsers] = useState([]);
//   const [showFilters, setShowFilters] = useState(false);
//   const [showSMSHistory, setShowSMSHistory] = useState(false);
//   const [filterPreset, setFilterPreset] = useState("All");
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Fetch Dashboard Data
//   const fetchDashboardData = useCallback(async () => {
//     if (!isAuthenticated) return;
//     setLoading(true);
//     setError(null);
//     try {
//       const response = await api.get("/api/user_management/dashboard/");
//       setData(response.data);
//     } catch (err) {
//       if (err.response?.status === 401) {
//         logout();
//       } else {
//         setError("Failed to fetch dashboard data. Please try again.");
//         setData(prev => ({ ...prev, notifications: [...prev.notifications, { id: Date.now(), message: "Failed to fetch dashboard data", type: "ERROR", created_at: new Date().toISOString(), is_read: false }] }));
//       }
//     } finally {
//       setLoading(false);
//     }
//   }, [isAuthenticated, logout]);

//   // Fetch SMS History
//   const fetchSMSHistory = useCallback(async () => {
//     if (!isAuthenticated) return;
//     try {
//       const response = await api.get("/api/user_management/sms-history/", { params: { limit: 100, offset: 0 } });
//       setSMSHistory(response.data.results);
//     } catch (err) {
//       if (err.response?.status === 401) {
//         logout();
//       } else {
//         setData(prev => ({
//           ...prev,
//           notifications: [...prev.notifications, { id: Date.now(), message: "Failed to fetch SMS history", type: "ERROR", created_at: new Date().toISOString(), is_read: false }]
//         }));
//       }
//     }
//   }, [isAuthenticated, logout]);

//   // Initial Data Fetch
//   useEffect(() => {
//     if (isAuthenticated) {
//       fetchDashboardData();
//       fetchSMSHistory();
//     }
//   }, [isAuthenticated, fetchDashboardData, fetchSMSHistory]);

//   // Filtered Clients
//   const filteredClients = useMemo(() => {
//     let filtered = data.clients;
//     if (filterPreset === "High Usage") {
//       filtered = data.clients.filter(client => client.is_high_usage);
//     } else if (filterPreset === "Expiring Soon") {
//       filtered = data.clients.filter(client => client.is_near_expiry);
//     } else {
//       filtered = data.clients.filter(client => {
//         const matchesCategory = filterCategory === "All" || (client.current_plan && client.current_plan.category === filterCategory);
//         const matchesStatus = filterStatus === "All" || client.payment_status === filterStatus;
//         return matchesCategory && matchesStatus;
//       });
//     }
//     return filtered;
//   }, [data.clients, filterCategory, filterStatus, filterPreset]);

//   // Send Bulk SMS
//   const handleBulkSMS = async () => {
//     if (selectedUsers.length === 0) {
//       setData(prev => ({
//         ...prev,
//         notifications: [...prev.notifications, { id: Date.now(), message: "No users selected for SMS", type: "WARNING", created_at: new Date().toISOString(), is_read: false }]
//       }));
//       return;
//     }
//     try {
//       const response = await api.post("/api/user_management/send-sms/", {
//         client_ids: selectedUsers,
//         message_type: "MANUAL",
//         custom_message: "Stay connected! Contact +254700123456 for support."
//       });
//       setData(prev => ({
//         ...prev,
//         notifications: [...prev.notifications, {
//           id: Date.now(),
//           message: `Bulk SMS sent: ${response.data.total_sent} succeeded, ${response.data.total_failed} failed`,
//           type: response.data.total_sent > 0 ? "SUCCESS" : "ERROR",
//           created_at: new Date().toISOString(),
//           is_read: false
//         }]
//       }));
//       setSelectedUsers([]);
//       fetchSMSHistory();
//     } catch (err) {
//       setData(prev => ({
//         ...prev,
//         notifications: [...prev.notifications, { id: Date.now(), message: "Failed to send bulk SMS", type: "ERROR", created_at: new Date().toISOString(), is_read: false }]
//       }));
//     }
//   };

//   // Send Individual SMS
//   const handleIndividualSMS = async (clientId, clientName) => {
//     try {
//       const response = await api.post("/api/user_management/send-sms/", {
//         client_ids: [clientId],
//         message_type: "MANUAL",
//         custom_message: "Stay connected! Contact +254700123456 for support."
//       });
//       setData(prev => ({
//         ...prev,
//         notifications: [...prev.notifications, {
//           id: Date.now(),
//           message: `SMS sent to ${clientName}`,
//           type: "SUCCESS",
//           created_at: new Date().toISOString(),
//           is_read: false
//         }]
//       }));
//       fetchSMSHistory();
//     } catch (err) {
//       setData(prev => ({
//         ...prev,
//         notifications: [...prev.notifications, { id: Date.now(), message: `Failed to send SMS to ${clientName}`, type: "ERROR", created_at: new Date().toISOString(), is_read: false }]
//       }));
//     }
//   };

//   // Update Payment Status
//   const handleStatusUpdate = async (clientId, newStatus, clientName) => {
//     try {
//       await api.post(`/api/user_management/update-payment-status/${clientId}/`, { status: newStatus });
//       setData(prev => ({
//         ...prev,
//         clients: prev.clients.map(client => client.id === clientId ? { ...client, payment_status: newStatus } : client),
//         notifications: [...prev.notifications, {
//           id: Date.now(),
//           message: `Payment status updated for ${clientName} to ${newStatus}`,
//           type: "SUCCESS",
//           created_at: new Date().toISOString(),
//           is_read: false
//         }]
//       }));
//     } catch (err) {
//       setData(prev => ({
//         ...prev,
//         notifications: [...prev.notifications, { id: Date.now(), message: `Failed to update status for ${clientName}`, type: "ERROR", created_at: new Date().toISOString(), is_read: false }]
//       }));
//     }
//   };

//   // Mark Notification as Read
//   const handleMarkNotificationRead = async (notificationId) => {
//     try {
//       await api.post(`/api/user_management/mark-notification-read/${notificationId}/`);
//       setData(prev => ({
//         ...prev,
//         notifications: prev.notifications.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
//       }));
//     } catch (err) {
//       setData(prev => ({
//         ...prev,
//         notifications: [...prev.notifications, { id: Date.now(), message: "Failed to mark notification as read", type: "ERROR", created_at: new Date().toISOString(), is_read: false }]
//       }));
//     }
//   };

//   // Export Report
//   const handleExportReport = async () => {
//     try {
//       const response = await api.post("/api/user_management/export-report/", {
//         category: filterCategory,
//         status: filterStatus,
//         usage_threshold: usageThreshold
//       });
//       const csvContent = [
//         ["ID", "Full Name", "Phone", "Device", "MAC Address", "Plan", "Category", "Payment Status", "Data Usage", "Assigned Date", "Expiry Date"],
//         ...response.data.map(user => [
//           user.id,
//           user.full_name,
//           formatPhoneNumber(user.phone_number),
//           user.device || "N/A",
//           user.mac_address || "N/A",
//           user.plan || "None",
//           user.category || "None",
//           user.payment_status,
//           user.data_usage || "N/A",
//           user.assigned_date || "N/A",
//           user.expiry_date || "N/A"
//         ])
//       ].map(row => row.join(",")).join("\n");
//       const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
//       const link = document.createElement("a");
//       link.href = URL.createObjectURL(blob);
//       link.download = "plan_analytics_report.csv";
//       link.click();
//       setData(prev => ({
//         ...prev,
//         notifications: [...prev.notifications, { id: Date.now(), message: "Report exported successfully", type: "SUCCESS", created_at: new Date().toISOString(), is_read: false }]
//       }));
//     } catch (err) {
//       setData(prev => ({
//         ...prev,
//         notifications: [...prev.notifications, { id: Date.now(), message: "Failed to export report", type: "ERROR", created_at: new Date().toISOString(), is_read: false }]
//       }));
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-gray-50 to-purple-50 p-4 md:p-8">
//       <div className="max-w-7xl mx-auto">
//         <div className="flex items-center justify-between mb-8">
//           <div>
//             <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Plan Analytics</h1>
//             <p className="text-gray-600 mt-2">Streamlined network management with automated client engagement</p>
//           </div>
//           <motion.button
//             onClick={handleExportReport}
//             className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center"
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
//             aria-label="Export report"
//             disabled={loading}
//           >
//             <FileText className="w-5 h-5 mr-2" /> Export Analytics
//           </motion.button>
//         </div>

//         {/* Notifications Panel */}
//         <div className="mb-8 bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-100/50 p-6">
//           <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
//             <Bell className="text-indigo-600" size={20} />
//             System Notifications
//           </h3>
//           {loading ? (
//             <Skeleton count={3} height={40} className="mb-2" />
//           ) : data.notifications.length === 0 ? (
//             <p className="text-gray-500">No new notifications</p>
//           ) : (
//             <ul className="space-y-2">
//               {data.notifications.map(notification => (
//                 <motion.li
//                   key={notification.id}
//                   initial={{ opacity: 0, y: 10 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   className={`p-3 rounded-lg flex justify-between items-center ${
//                     notification.type === "ERROR" ? "bg-red-50" :
//                     notification.type === "SUCCESS" ? "bg-green-50" :
//                     notification.type === "WARNING" ? "bg-yellow-50" : "bg-blue-50"
//                   } ${notification.is_read ? "opacity-60" : ""}`}
//                 >
//                   <span>{notification.message}</span>
//                   {!notification.is_read && (
//                     <button
//                       onClick={() => handleMarkNotificationRead(notification.id)}
//                       className="text-sm text-indigo-600 hover:underline"
//                       aria-label={`Mark notification as read: ${notification.message}`}
//                     >
//                       Mark as Read
//                     </button>
//                   )}
//                 </motion.li>
//               ))}
//             </ul>
//           )}
//         </div>

//         {/* Stats Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//           {loading ? (
//             <>
//               <Skeleton height={120} className="rounded-xl" />
//               <Skeleton height={120} className="rounded-xl" />
//               <Skeleton height={120} className="rounded-xl" />
//             </>
//           ) : (
//             <>
//               <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-gray-100/50 p-6">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-sm text-gray-600 flex items-center gap-2">
//                       <Users className="w-4 h-4" /> Total Users
//                     </p>
//                     <p className="text-2xl font-bold text-gray-900">{data.stats.total_clients}</p>
//                     <p className="text-sm text-green-600">
//                       Active: {data.stats.active_clients} ({((data.stats.active_clients / (data.stats.total_clients || 1)) * 100).toFixed(1)}%)
//                     </p>
//                   </div>
//                   <div className="p-3 bg-blue-100/50 rounded-full">
//                     <Users className="w-8 h-8 text-blue-600" />
//                   </div>
//                 </div>
//               </div>
//               <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-gray-100/50 p-6">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-sm text-gray-600 flex items-center gap-2">
//                       <AlertCircle className="w-4 h-4" /> High Usage Alerts
//                     </p>
//                     <p className="text-2xl font-bold text-gray-900">{data.stats.high_usage_clients}</p>
//                     <p className="text-sm text-yellow-600">Above {usageThreshold}% data usage</p>
//                   </div>
//                   <div className="p-3 bg-yellow-100/50 rounded-full">
//                     <AlertCircle className="w-8 h-8 text-yellow-600" />
//                   </div>
//                 </div>
//               </div>
//               <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-gray-100/50 p-6">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-sm text-gray-600 flex items-center gap-2">
//                       <DollarSign className="w-4 h-4" /> Collected Revenue
//                     </p>
//                     <p className="text-2xl font-bold text-gray-900">{formatCurrency(data.stats.collected_revenue)}</p>
//                     <p className="text-sm text-gray-600">From paid clients</p>
//                   </div>
//                   <div className="p-3 bg-green-100/50 rounded-full">
//                     <DollarSign className="w-8 h-8 text-green-600" />
//                   </div>
//                 </div>
//               </div>
//               <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-gray-100/50 p-6">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-sm text-gray-600 flex items-center gap-2">
//                       <HardDrive className="w-4 h-4" /> Network Health
//                     </p>
//                     <p className="text-2xl font-bold text-gray-900">{data.stats.active_devices}</p>
//                     <p className="text-sm text-purple-600">
//                       Congested Routers: {data.stats.congested_routers}
//                     </p>
//                   </div>
//                   <div className="p-3 bg-purple-100/50 rounded-full">
//                     <HardDrive className="w-8 h-8 text-purple-600" />
//                   </div>
//                 </div>
//               </div>
//             </>
//           )}
//         </div>

//         {/* User Plan Analytics */}
//         <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-100/50 p-6">
//           <div className="flex items-center justify-between mb-6">
//             <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
//               <BarChart2 className="text-indigo-600" size={20} />
//               User Plan Analytics
//             </h3>
//             <div className="flex items-center gap-4">
//               <motion.button
//                 onClick={() => setShowFilters(!showFilters)}
//                 className="px-3 py-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-lg hover:from-gray-200 hover:to-gray-300 flex items-center"
//                 whileHover={{ scale: 1.05 }}
//                 aria-label={showFilters ? "Hide filters" : "Show filters"}
//                 disabled={loading}
//               >
//                 <Filter className="w-4 h-4 mr-2" /> Filters {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
//               </motion.button>
//               <motion.button
//                 onClick={() => setShowSMSHistory(!showSMSHistory)}
//                 className="px-3 py-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-lg hover:from-gray-200 hover:to-gray-300 flex items-center"
//                 whileHover={{ scale: 1.05 }}
//                 aria-label={showSMSHistory ? "Hide SMS history" : "Show SMS history"}
//                 disabled={loading}
//               >
//                 <History className="w-4 h-4 mr-2" /> SMS Log {showSMSHistory ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
//               </motion.button>
//               <motion.button
//                 onClick={handleBulkSMS}
//                 className="px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center disabled:opacity-50"
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//                 disabled={selectedUsers.length === 0 || loading}
//                 aria-label="Send bulk SMS"
//               >
//                 <Send className="w-4 h-4 mr-2" /> Send Bulk SMS
//               </motion.button>
//             </div>
//           </div>

//           {/* Filters */}
//           <AnimatePresence>
//             {showFilters && (
//               <motion.div
//                 initial={{ height: 0, opacity: 0 }}
//                 animate={{ height: "auto", opacity: 1 }}
//                 exit={{ height: 0, opacity: 0 }}
//                 transition={{ duration: 0.3 }}
//                 className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4"
//               >
//                 <div>
//                   <label className="text-sm text-gray-600 flex items-center gap-2">
//                     <Filter className="w-4 h-4" /> Preset
//                   </label>
//                   <select
//                     value={filterPreset}
//                     onChange={(e) => setFilterPreset(e.target.value)}
//                     className="w-full px-3 py-2 mt-1 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white/50"
//                     aria-label="Filter preset"
//                     disabled={loading}
//                   >
//                     <option value="All">All Users</option>
//                     <option value="High Usage">High Usage</option>
//                     <option value="Expiring Soon">Expiring Soon</option>
//                   </select>
//                 </div>
//                 <div>
//                   <label className="text-sm text-gray-600 flex items-center gap-2">
//                     <Filter className="w-4 h-4" /> Category
//                   </label>
//                   <select
//                     value={filterCategory}
//                     onChange={(e) => setFilterCategory(e.target.value)}
//                     className="w-full px-3 py-2 mt-1 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white/50"
//                     aria-label="Filter by plan category"
//                     disabled={filterPreset !== "All" || loading}
//                   >
//                     <option value="All">All Categories</option>
//                     <option value="Residential">Residential</option>
//                     <option value="Enterprise">Enterprise</option>
//                     <option value="Promotional">Promotional</option>
//                     <option value="Business">Business</option>
//                   </select>
//                 </div>
//                 <div>
//                   <label className="text-sm text-gray-600 flex items-center gap-2">
//                     <Filter className="w-4 h-4" /> Status
//                   </label>
//                   <select
//                     value={filterStatus}
//                     onChange={(e) => setFilterStatus(e.target.value)}
//                     className="w-full px-3 py-2 mt-1 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white/50"
//                     aria-label="Filter by payment status"
//                     disabled={filterPreset !== "All" || loading}
//                   >
//                     <option value="All">All Statuses</option>
//                     <option value="Paid">Paid</option>
//                     <option value="Due">Due</option>
//                     <option value="Expired">Expired</option>
//                   </select>
//                 </div>
//                 <div>
//                   <label className="text-sm text-gray-600 flex items-center gap-2">
//                     <Filter className="w-4 h-4" /> Usage Threshold (%)
//                   </label>
//                   <input
//                     type="number"
//                     value={usageThreshold}
//                     onChange={(e) => setUsageThreshold(Number(e.target.value))}
//                     min="0"
//                     max="100"
//                     className="w-full px-3 py-2 mt-1 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white/50"
//                     aria-label="Set usage threshold"
//                     disabled={loading}
//                   />
//                 </div>
//               </motion.div>
//             )}
//           </AnimatePresence>

//           {/* SMS History */}
//           <AnimatePresence>
//             {showSMSHistory && (
//               <motion.div
//                 initial={{ height: 0, opacity: 0 }}
//                 animate={{ height: "auto", opacity: 1 }}
//                 exit={{ height: 0, opacity: 0 }}
//                 transition={{ duration: 0.3 }}
//                 className="mb-6 p-4 bg-gray-50/50 rounded-lg"
//               >
//                 <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
//                   <History className="w-4 h-4" /> SMS History
//                 </h4>
//                 {loading ? (
//                   <Skeleton count={3} height={40} className="mb-2" />
//                 ) : smsHistory.length === 0 ? (
//                   <p className="text-sm text-gray-500">No SMS sent yet</p>
//                 ) : (
//                   <div className="overflow-x-auto">
//                     <table className="w-full text-sm text-left text-gray-700">
//                       <thead className="text-xs text-gray-500 uppercase bg-gray-100">
//                         <tr>
//                           <th className="px-4 py-2">User</th>
//                           <th className="px-4 py-2">Phone</th>
//                           <th className="px-4 py-2">Message</th>
//                           <th className="px-4 py-2">Sent At</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {smsHistory.map((msg, index) => (
//                           <tr key={index} className="border-b">
//                             <td className="px-4 py-2">{msg.client?.full_name || "N/A"}</td>
//                             <td className="px-4 py-2">{formatPhoneNumber(msg.client?.phonenumber) || "N/A"}</td>
//                             <td className="px-4 py-2">{msg.message || "N/A"}</td>
//                             <td className="px-4 py-2">{formatDate(msg.sent_at)}</td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 )}
//               </motion.div>
//             )}
//           </AnimatePresence>

//           {/* Table */}
//           <div className="overflow-x-auto">
//             <table className="w-full text-sm text-left text-gray-900">
//               <thead className="text-xs text-gray-600 uppercase bg-gradient-to-r from-blue-100 to-indigo-100 sticky top-0 z-10">
//                 <tr>
//                   <th className="px-4 py-3">
//                     <input
//                       type="checkbox"
//                       checked={selectedUsers.length === filteredClients.length && filteredClients.length > 0}
//                       onChange={(e) => setSelectedUsers(e.target.checked ? filteredClients.map(c => c.id) : [])}
//                       className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
//                       aria-label="Select all users"
//                       disabled={loading}
//                     />
//                   </th>
//                   <th className="px-4 py-3">User</th>
//                   <th className="px-4 py-3">Plan</th>
//                   <th className="px-4 py-3">Status</th>
//                   <th className="px-4 py-3">Data Usage</th>
//                   <th className="px-4 py-3">MAC Address</th>
//                   <th className="px-4 py-3">Expiry</th>
//                   <th className="px-4 py-3">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {loading ? (
//                   Array(5).fill().map((_, index) => (
//                     <tr key={index} className="border-b">
//                       <td colSpan="8" className="px-4 py-3"><Skeleton height={40} /></td>
//                     </tr>
//                   ))
//                 ) : error ? (
//                   <tr>
//                     <td colSpan="8" className="px-4 py-4 text-center text-red-500">
//                       {error}
//                     </td>
//                   </tr>
//                 ) : filteredClients.length === 0 ? (
//                   <tr>
//                     <td colSpan="8" className="px-4 py-4 text-center text-gray-500">
//                       No users match the selected filters
//                     </td>
//                   </tr>
//                 ) : (
//                   filteredClients.map(client => (
//                     <tr key={client.id} className="border-b hover:bg-gray-50/50 transition-all">
//                       <td className="px-4 py-3">
//                         <input
//                           type="checkbox"
//                           checked={selectedUsers.includes(client.id)}
//                           onChange={() => setSelectedUsers(prev => prev.includes(client.id) ? prev.filter(id => id !== client.id) : [...prev, client.id])}
//                           className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
//                           aria-label={`Select ${client.full_name}`}
//                           disabled={loading}
//                         />
//                       </td>
//                       <td className="px-4 py-3">
//                         <div className="flex items-center gap-2">
//                           <User className="w-4 h-4 text-gray-600" />
//                           <div>
//                             <p className="font-medium">{client.full_name || "N/A"}</p>
//                             <p className="text-xs text-gray-500">{formatPhoneNumber(client.phone_number) || "N/A"}</p>
//                           </div>
//                         </div>
//                       </td>
//                       <td className="px-4 py-3">
//                         {client.current_plan ? (
//                           <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs">
//                             {client.current_plan.name}
//                           </span>
//                         ) : (
//                           "None"
//                         )}
//                       </td>
//                       <td className="px-4 py-3">
//                         <div className="flex items-center gap-2">
//                           <PaymentStatusIcon status={client.payment_status} />
//                           <select
//                             value={client.payment_status}
//                             onChange={(e) => handleStatusUpdate(client.id, e.target.value, client.full_name)}
//                             className={`text-xs border-none bg-transparent focus:ring-0 ${
//                               client.payment_status === "Due" ? "text-yellow-600" :
//                               client.payment_status === "Expired" ? "text-red-600" : "text-green-600"
//                             }`}
//                             aria-label={`Update status for ${client.full_name}`}
//                             disabled={loading}
//                           >
//                             <option value="Paid">Paid</option>
//                             <option value="Due">Due</option>
//                             <option value="Expired">Expired</option>
//                           </select>
//                         </div>
//                       </td>
//                       <td className="px-4 py-3">
//                         {client.data_usage ? (
//                           <div className="flex items-center gap-2">
//                             {client.is_high_usage && <AlertTriangle className="w-4 h-4 text-red-500" />}
//                             <span className={client.is_high_usage ? "text-red-600" : ""}>
//                               {client.data_usage.total === "Unlimited" ?
//                                 "Unlimited" :
//                                 `${client.data_usage.used}/${client.data_usage.total} ${client.data_usage.unit} (${client.data_usage.percentage?.toFixed(1)}%)`}
//                             </span>
//                           </div>
//                         ) : (
//                           "N/A"
//                         )}
//                       </td>
//                       <td className="px-4 py-3">
//                         <div className="flex items-center gap-2">
//                           <Shield className="w-4 h-4 text-gray-600" />
//                           {client.device_id || "N/A"}
//                         </div>
//                       </td>
//                       <td className="px-4 py-3">
//                         {client.expiry_date ? formatDate(client.expiry_date) : "N/A"}
//                       </td>
//                       <td className="px-4 py-3">
//                         <motion.button
//                           onClick={() => handleIndividualSMS(client.id, client.full_name)}
//                           className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center text-xs"
//                           whileHover={{ scale: 1.05 }}
//                           whileTap={{ scale: 0.95 }}
//                           aria-label={`Send SMS to ${client.full_name}`}
//                           disabled={loading}
//                         >
//                           <MessageSquare className="w-4 h-4 mr-1" /> Send SMS
//                         </motion.button>
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PlanOverview;






import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Users, Wifi, CreditCard, BarChart2, Download, HardDrive, FileText, Filter,
  Clock, Send, DollarSign, ChevronDown, ChevronUp, MessageSquare, Bell,
  User, Shield, CheckCircle, AlertCircle, History, AlertTriangle, Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../../api";
import { useAuth } from "../../context/AuthContext";
import { formatDate, formatCurrency, formatPhoneNumber } from "../../components/utils";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { toast } from "sonner";

const PaymentStatusIcon = ({ status }) => {
  switch (status) {
    case "Paid":
      return <CheckCircle className="text-green-500" size={16} />;
    case "Due":
      return <Clock className="text-yellow-500" size={16} />;
    case "Expired":
      return <AlertCircle className="text-red-500" size={16} />;
    default:
      return <CreditCard className="text-gray-500" size={16} />;
  }
};

const PlanOverview = () => {
  const { isAuthenticated, logout } = useAuth();
  const [data, setData] = useState({
    plans: [],
    clients: [],
    stats: { total_clients: 0, active_clients: 0, high_usage_clients: 0, collected_revenue: 0, active_devices: 0, congested_routers: 0 },
    thresholds: [],
    notifications: []
  });
  const [smsHistory, setSMSHistory] = useState([]);
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [usageThreshold, setUsageThreshold] = useState(75);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showSMSHistory, setShowSMSHistory] = useState(false);
  const [filterPreset, setFilterPreset] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSendingSMS, setIsSendingSMS] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/api/user_management/dashboard/");
      setData(response.data);
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
      } else {
        setError("Failed to fetch dashboard data. Please try again.");
        toast.error("Failed to fetch dashboard data");
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, logout]);

  const fetchSMSHistory = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const response = await api.get("/api/user_management/sms-history/", { params: { limit: 100, offset: 0 } });
      setSMSHistory(response.data.results);
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
      } else {
        toast.error("Failed to fetch SMS history");
      }
    }
  }, [isAuthenticated, logout]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
      fetchSMSHistory();
    }
  }, [isAuthenticated, fetchDashboardData, fetchSMSHistory]);

  const filteredClients = useMemo(() => {
    let filtered = data.clients;
    if (filterPreset === "High Usage") {
      filtered = data.clients.filter(client => client.is_high_usage);
    } else if (filterPreset === "Expiring Soon") {
      filtered = data.clients.filter(client => client.is_near_expiry);
    } else {
      filtered = data.clients.filter(client => {
        const matchesCategory = filterCategory === "All" || (client.current_plan && client.current_plan.category === filterCategory);
        const matchesStatus = filterStatus === "All" || client.payment_status === filterStatus;
        return matchesCategory && matchesStatus;
      });
    }
    return filtered;
  }, [data.clients, filterCategory, filterStatus, filterPreset]);

  const handleBulkSMS = async () => {
    if (selectedUsers.length === 0) {
      toast.warning("No users selected for SMS");
      return;
    }
    
    setIsSendingSMS(true);
    try {
      const response = await api.post("/api/user_management/send-sms/", {
        client_ids: selectedUsers,
        message_type: "MANUAL",
        custom_message: "Stay connected! Contact support for any assistance."
      });
      
      if (response.data.total_sent > 0) {
        toast.success(`Bulk SMS sent: ${response.data.total_sent} succeeded`);
      } else {
        toast.error("Failed to send any SMS messages");
      }
      
      setSelectedUsers([]);
      fetchSMSHistory();
    } catch (err) {
      toast.error("Failed to send bulk SMS");
    } finally {
      setIsSendingSMS(false);
    }
  };

  const handleIndividualSMS = async (clientId, clientName) => {
    try {
      await api.post("/api/user_management/send-sms/", {
        client_ids: [clientId],
        message_type: "MANUAL",
        custom_message: "Stay connected! Contact support for any assistance."
      });
      toast.success(`SMS sent to ${clientName}`);
      fetchSMSHistory();
    } catch (err) {
      toast.error(`Failed to send SMS to ${clientName}`);
    }
  };

  const handleStatusUpdate = async (clientId, newStatus, clientName) => {
    try {
      await api.post(`/api/user_management/update-payment-status/${clientId}/`, { status: newStatus });
      toast.success(`Payment status updated for ${clientName} to ${newStatus}`);
      fetchDashboardData();
    } catch (err) {
      toast.error(`Failed to update status for ${clientName}`);
    }
  };

  const handleMarkNotificationRead = async (notificationId) => {
    try {
      await api.post(`/api/user_management/mark-notification-read/${notificationId}/`);
      setData(prev => ({
        ...prev,
        notifications: prev.notifications.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      }));
    } catch (err) {
      toast.error("Failed to mark notification as read");
    }
  };

  const handleExportReport = async () => {
    try {
      const response = await api.post("/api/user_management/export-report/", {
        category: filterCategory,
        status: filterStatus,
        usage_threshold: usageThreshold
      }, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'plan_analytics_report.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success("Report exported successfully");
    } catch (err) {
      toast.error("Failed to export report");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-gray-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Plan Analytics</h1>
            <p className="text-gray-600 mt-2">Streamlined network management with automated client engagement</p>
          </div>
          <motion.button
            onClick={handleExportReport}
            className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Export report"
            disabled={loading}
          >
            <FileText className="w-5 h-5 mr-2" /> Export Analytics
          </motion.button>
        </div>

        {/* Notifications Panel */}
        <div className="mb-8 bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-100/50 p-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <Bell className="text-indigo-600" size={20} />
            System Notifications
          </h3>
          {loading ? (
            <Skeleton count={3} height={40} className="mb-2" />
          ) : data.notifications.length === 0 ? (
            <p className="text-gray-500">No new notifications</p>
          ) : (
            <ul className="space-y-2">
              {data.notifications.map(notification => (
                <motion.li
                  key={notification.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-3 rounded-lg flex justify-between items-center ${
                    notification.type === "ERROR" ? "bg-red-50" :
                    notification.type === "SUCCESS" ? "bg-green-50" :
                    notification.type === "WARNING" ? "bg-yellow-50" : "bg-blue-50"
                  } ${notification.is_read ? "opacity-60" : ""}`}
                >
                  <span>{notification.message}</span>
                  {!notification.is_read && (
                    <button
                      onClick={() => handleMarkNotificationRead(notification.id)}
                      className="text-sm text-indigo-600 hover:underline"
                      aria-label={`Mark notification as read: ${notification.message}`}
                    >
                      Mark as Read
                    </button>
                  )}
                </motion.li>
              ))}
            </ul>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {loading ? (
            <>
              <Skeleton height={120} className="rounded-xl" />
              <Skeleton height={120} className="rounded-xl" />
              <Skeleton height={120} className="rounded-xl" />
            </>
          ) : (
            <>
              <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-gray-100/50 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <Users className="w-4 h-4" /> Total Users
                    </p>
                    <p className="text-2xl font-bold text-gray-900">{data.stats.total_clients}</p>
                    <p className="text-sm text-green-600">
                      Active: {data.stats.active_clients} ({((data.stats.active_clients / (data.stats.total_clients || 1)) * 100).toFixed(1)}%)
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100/50 rounded-full">
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-gray-100/50 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" /> High Usage Alerts
                    </p>
                    <p className="text-2xl font-bold text-gray-900">{data.stats.high_usage_clients}</p>
                    <p className="text-sm text-yellow-600">Above {usageThreshold}% data usage</p>
                  </div>
                  <div className="p-3 bg-yellow-100/50 rounded-full">
                    <AlertCircle className="w-8 h-8 text-yellow-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-gray-100/50 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <DollarSign className="w-4 h-4" /> Collected Revenue
                    </p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(data.stats.collected_revenue)}</p>
                    <p className="text-sm text-gray-600">From paid clients</p>
                  </div>
                  <div className="p-3 bg-green-100/50 rounded-full">
                    <DollarSign className="w-8 h-8 text-green-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-gray-100/50 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <HardDrive className="w-4 h-4" /> Network Health
                    </p>
                    <p className="text-2xl font-bold text-gray-900">{data.stats.active_devices}</p>
                    <p className="text-sm text-purple-600">
                      Congested Routers: {data.stats.congested_routers}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100/50 rounded-full">
                    <HardDrive className="w-8 h-8 text-purple-600" />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Plan Analytics */}
        <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-100/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <BarChart2 className="text-indigo-600" size={20} />
              User Plan Analytics
            </h3>
            <div className="flex items-center gap-4">
              <motion.button
                onClick={() => setShowFilters(!showFilters)}
                className="px-3 py-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-lg hover:from-gray-200 hover:to-gray-300 flex items-center"
                whileHover={{ scale: 1.05 }}
                aria-label={showFilters ? "Hide filters" : "Show filters"}
                disabled={loading}
              >
                <Filter className="w-4 h-4 mr-2" /> Filters {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </motion.button>
              <motion.button
                onClick={() => setShowSMSHistory(!showSMSHistory)}
                className="px-3 py-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-lg hover:from-gray-200 hover:to-gray-300 flex items-center"
                whileHover={{ scale: 1.05 }}
                aria-label={showSMSHistory ? "Hide SMS history" : "Show SMS history"}
                disabled={loading}
              >
                <History className="w-4 h-4 mr-2" /> SMS Log {showSMSHistory ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </motion.button>
              <motion.button
                onClick={handleBulkSMS}
                className="px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center disabled:opacity-50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={selectedUsers.length === 0 || loading || isSendingSMS}
                aria-label="Send bulk SMS"
              >
                {isSendingSMS ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Send Bulk SMS
              </motion.button>
            </div>
          </div>

          {/* Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4"
              >
                <div>
                  <label className="text-sm text-gray-600 flex items-center gap-2">
                    <Filter className="w-4 h-4" /> Preset
                  </label>
                  <select
                    value={filterPreset}
                    onChange={(e) => setFilterPreset(e.target.value)}
                    className="w-full px-3 py-2 mt-1 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white/50"
                    aria-label="Filter preset"
                    disabled={loading}
                  >
                    <option value="All">All Users</option>
                    <option value="High Usage">High Usage</option>
                    <option value="Expiring Soon">Expiring Soon</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-600 flex items-center gap-2">
                    <Filter className="w-4 h-4" /> Category
                  </label>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full px-3 py-2 mt-1 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white/50"
                    aria-label="Filter by plan category"
                    disabled={filterPreset !== "All" || loading}
                  >
                    <option value="All">All Categories</option>
                    <option value="Residential">Residential</option>
                    <option value="Enterprise">Enterprise</option>
                    <option value="Promotional">Promotional</option>
                    <option value="Business">Business</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-600 flex items-center gap-2">
                    <Filter className="w-4 h-4" /> Status
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-3 py-2 mt-1 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white/50"
                    aria-label="Filter by payment status"
                    disabled={filterPreset !== "All" || loading}
                  >
                    <option value="All">All Statuses</option>
                    <option value="Paid">Paid</option>
                    <option value="Due">Due</option>
                    <option value="Expired">Expired</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-600 flex items-center gap-2">
                    <Filter className="w-4 h-4" /> Usage Threshold (%)
                  </label>
                  <input
                    type="number"
                    value={usageThreshold}
                    onChange={(e) => setUsageThreshold(Number(e.target.value))}
                    min="0"
                    max="100"
                    className="w-full px-3 py-2 mt-1 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white/50"
                    aria-label="Set usage threshold"
                    disabled={loading}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* SMS History */}
          <AnimatePresence>
            {showSMSHistory && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-6 p-4 bg-gray-50/50 rounded-lg"
              >
                <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <History className="w-4 h-4" /> SMS History
                </h4>
                {loading ? (
                  <Skeleton count={3} height={40} className="mb-2" />
                ) : smsHistory.length === 0 ? (
                  <p className="text-sm text-gray-500">No SMS sent yet</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-700">
                      <thead className="text-xs text-gray-500 uppercase bg-gray-100">
                        <tr>
                          <th className="px-4 py-2">User</th>
                          <th className="px-4 py-2">Phone</th>
                          <th className="px-4 py-2">Message</th>
                          <th className="px-4 py-2">Sent At</th>
                        </tr>
                      </thead>
                      <tbody>
                        {smsHistory.map((msg, index) => (
                          <tr key={index} className="border-b">
                            <td className="px-4 py-2">{msg.client?.full_name || "N/A"}</td>
                            <td className="px-4 py-2">{formatPhoneNumber(msg.client?.phonenumber) || "N/A"}</td>
                            <td className="px-4 py-2">{msg.message || "N/A"}</td>
                            <td className="px-4 py-2">{formatDate(msg.sent_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-900">
              <thead className="text-xs text-gray-600 uppercase bg-gradient-to-r from-blue-100 to-indigo-100 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === filteredClients.length && filteredClients.length > 0}
                      onChange={(e) => setSelectedUsers(e.target.checked ? filteredClients.map(c => c.id) : [])}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      aria-label="Select all users"
                      disabled={loading}
                    />
                  </th>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Plan</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Data Usage</th>
                  <th className="px-4 py-3">MAC Address</th>
                  <th className="px-4 py-3">Expiry</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array(5).fill().map((_, index) => (
                    <tr key={index} className="border-b">
                      <td colSpan="8" className="px-4 py-3"><Skeleton height={40} /></td>
                    </tr>
                  ))
                ) : error ? (
                  <tr>
                    <td colSpan="8" className="px-4 py-4 text-center text-red-500">
                      {error}
                    </td>
                  </tr>
                ) : filteredClients.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-4 py-4 text-center text-gray-500">
                      No users match the selected filters
                    </td>
                  </tr>
                ) : (
                  filteredClients.map(client => (
                    <tr key={client.id} className="border-b hover:bg-gray-50/50 transition-all">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(client.id)}
                          onChange={() => setSelectedUsers(prev => prev.includes(client.id) ? prev.filter(id => id !== client.id) : [...prev, client.id])}
                          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                          aria-label={`Select ${client.full_name}`}
                          disabled={loading}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-600" />
                          <div>
                            <p className="font-medium">{client.full_name || "N/A"}</p>
                            <p className="text-xs text-gray-500">{formatPhoneNumber(client.phone_number) || "N/A"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {client.current_plan ? (
                          <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs">
                            {client.current_plan.name}
                          </span>
                        ) : (
                          "None"
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <PaymentStatusIcon status={client.payment_status} />
                          <select
                            value={client.payment_status}
                            onChange={(e) => handleStatusUpdate(client.id, e.target.value, client.full_name)}
                            className={`text-xs border-none bg-transparent focus:ring-0 ${
                              client.payment_status === "Due" ? "text-yellow-600" :
                              client.payment_status === "Expired" ? "text-red-600" : "text-green-600"
                            }`}
                            aria-label={`Update status for ${client.full_name}`}
                            disabled={loading}
                          >
                            <option value="Paid">Paid</option>
                            <option value="Due">Due</option>
                            <option value="Expired">Expired</option>
                          </select>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {client.data_usage ? (
                          <div className="flex items-center gap-2">
                            {client.is_high_usage && <AlertTriangle className="w-4 h-4 text-red-500" />}
                            <span className={client.is_high_usage ? "text-red-600" : ""}>
                              {client.data_usage.total === "Unlimited" ?
                                "Unlimited" :
                                `${client.data_usage.used}/${client.data_usage.total} ${client.data_usage.unit} (${client.data_usage.percentage?.toFixed(1)}%)`}
                            </span>
                          </div>
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-gray-600" />
                          {client.device_id || "N/A"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {client.expiry_date ? formatDate(client.expiry_date) : "N/A"}
                      </td>
                      <td className="px-4 py-3">
                        <motion.button
                          onClick={() => handleIndividualSMS(client.id, client.full_name)}
                          className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center text-xs"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          aria-label={`Send SMS to ${client.full_name}`}
                          disabled={loading}
                        >
                          <MessageSquare className="w-4 h-4 mr-1" /> Send SMS
                        </motion.button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanOverview;