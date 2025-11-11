// // components/ClientProfile.jsx
// import React, { useState, useMemo, useCallback } from 'react';
// import { 
//   User, Phone, Wifi, CalendarDays, CreditCard, 
//   HardDrive, Shield, Globe, BarChart2, History, 
//   MessageSquare, Zap, Users, Activity, Mail, 
//   Send, Download, AlertTriangle, CheckCircle2, 
//   Clock, MoreVertical, Edit, Trash2, Eye,
//   TrendingUp, TrendingDown, Circle, Package
// } from 'lucide-react';
// import { useTheme } from '../../../context/ThemeContext'
// import SessionHistory from '../components/SessionHistory'
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
// import api from '../../../api'
// import { FaSpinner } from 'react-icons/fa';

// // Import your existing memoized components
// import { DataUsageBar, DataUsageIcon, PaymentStatusIcon, StatusBadge, MessageTypeIcon } from '../../UserManagement/Subscribers'

// const ClientProfile = ({ user, onUserUpdate, activeTab, setActiveTab, onRefresh }) => {
//   const { theme } = useTheme();
//   const [isEditing, setIsEditing] = useState(false);
//   const [editForm, setEditForm] = useState({ username: user.username, phone: user.phonenumber });
//   const [messageForm, setMessageForm] = useState({ message_type: "sms", subject: "", message: "" });
//   const [isSendingMessage, setIsSendingMessage] = useState(false);
//   const [isDisconnecting, setIsDisconnecting] = useState(false);
//   const [filterYear, setFilterYear] = useState("All");
//   const [selectedPurchase, setSelectedPurchase] = useState(null);
//   const [error, setError] = useState(null);

//   const cardClass = theme === "dark" 
//     ? "bg-gray-800/60 backdrop-blur-md border-gray-700" 
//     : "bg-white border-gray-200";

//   const inputClass = theme === "dark"
//     ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
//     : "bg-white border-gray-300 text-gray-800 placeholder-gray-500";

//   const formatDate = (dateString) => {
//     if (!dateString) return "N/A";
//     const options = { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" };
//     return new Date(dateString).toLocaleDateString(undefined, options);
//   };

//   const formatCurrency = (amount) => {
//     return new Intl.NumberFormat("en-US", {
//       style: "currency",
//       currency: "KES",
//       minimumFractionDigits: 0,
//       maximumFractionDigits: 0,
//     }).format(amount);
//   };

//   // Memoized data processing functions
//   const getFilteredPurchaseHistory = useMemo(() => {
//     if (!user?.history?.purchaseHistory) return [];
//     if (filterYear === "All") return user.history.purchaseHistory;
//     return user.history.purchaseHistory.filter(
//       (purchase) => new Date(purchase.purchase_date).getFullYear().toString() === filterYear
//     );
//   }, [user, filterYear]);

//   const getChartData = useMemo(() => {
//     if (!user?.history?.purchaseHistory) return [];
//     const purchasesByYear = {};
//     user.history.purchaseHistory.forEach((purchase) => {
//       const year = new Date(purchase.purchase_date).getFullYear();
//       if (!purchasesByYear[year]) purchasesByYear[year] = 0;
//       purchasesByYear[year] += purchase.amount;
//     });
//     return Object.keys(purchasesByYear).sort((a, b) => a - b).map((year) => ({
//       year,
//       revenue: purchasesByYear[year],
//     }));
//   }, [user]);

//   const getMonthlyChartData = useMemo(() => {
//     if (!user?.history?.purchaseHistory) return [];
//     const monthlyData = {};
//     user.history.purchaseHistory.forEach((purchase) => {
//       const date = new Date(purchase.purchase_date);
//       const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
//       if (!monthlyData[monthYear]) monthlyData[monthYear] = 0;
//       monthlyData[monthYear] += purchase.amount;
//     });

//     return Object.keys(monthlyData).sort().map((key) => {
//       const [year, month] = key.split("-");
//       return {
//         month: `${new Date(year, month - 1).toLocaleString("default", { month: "short" })} ${year}`,
//         revenue: monthlyData[key],
//       };
//     });
//   }, [user]);

//   const getPlanDistributionData = useMemo(() => {
//     if (!user?.history?.purchaseHistory) return [];
//     const planCounts = {};
//     user.history.purchaseHistory.forEach((purchase) => {
//       const plan = purchase.plan?.name || "Unknown";
//       planCounts[plan] = (planCounts[plan] || 0) + 1;
//     });
//     return Object.keys(planCounts).map((plan) => ({
//       name: plan,
//       value: planCounts[plan],
//       color: getPlanColor(plan),
//     }));
//   }, [user]);

//   const getPaymentMethodData = useMemo(() => {
//     if (!user?.history?.purchaseHistory) return [];
//     const methodCounts = {};
//     user.history.purchaseHistory.forEach((purchase) => {
//       const method = purchase.payment_method || "Unknown";
//       methodCounts[method] = (methodCounts[method] || 0) + 1;
//     });
//     return Object.keys(methodCounts).map((method) => ({
//       name: method,
//       value: methodCounts[method],
//     }));
//   }, [user]);

//   const getPlanColor = useCallback((plan) => {
//     const colors = {
//       Enterprise: "#6366F1",
//       Business: "#3B82F6",
//       Residential: "#10B981",
//       Promotional: "#F59E0B",
//       Unknown: "#6B7280",
//     };
//     return colors[plan] || "#6B7280";
//   }, []);

//   const getPlanBehavior = useMemo(() => {
//     if (!user?.history?.purchaseHistory) return { favoritePlan: "N/A", upgrades: 0, planChanges: 0, avgDuration: 0 };
//     const planCounts = {};
//     user.history.purchaseHistory.forEach((purchase) => {
//       const plan = purchase.plan?.name || "Unknown";
//       planCounts[plan] = (planCounts[plan] || 0) + 1;
//     });
//     const favoritePlan = Object.keys(planCounts).reduce(
//       (a, b) => (planCounts[a] > planCounts[b] ? a : b),
//       user.history.purchaseHistory[0]?.plan?.name || "N/A"
//     );
//     const upgrades = user.history.purchaseHistory.filter(
//       (purchase, index) =>
//         index > 0 &&
//         purchase.amount > user.history.purchaseHistory[index - 1].amount
//     ).length;

//     const planChanges = user.history.purchaseHistory.length - 1;

//     const durations = user.history.purchaseHistory.map((purchase) => {
//       if (purchase.duration?.includes("month")) {
//         return parseInt(purchase.duration) || 1;
//       }
//       return 1;
//     });
//     const avgDuration = durations.reduce((sum, dur) => sum + dur, 0) / durations.length;

//     return { favoritePlan, upgrades, planChanges, avgDuration };
//   }, [user]);

//   const getSpendingTrend = useMemo(() => {
//     if (!user?.history?.purchaseHistory || user.history.purchaseHistory.length < 2) return "stable";
//     const firstPrice = user.history.purchaseHistory[0].amount;
//     const lastPrice = user.history.purchaseHistory[user.history.purchaseHistory.length - 1].amount;
//     return lastPrice > firstPrice ? "up" : lastPrice < firstPrice ? "down" : "stable";
//   }, [user]);

//   // Handlers
//   const handleEditToggle = useCallback(() => {
//     if (!isEditing) {
//       setEditForm({
//         username: user.username,
//         phone: user.phonenumber,
//       });
//     }
//     setIsEditing(!isEditing);
//   }, [isEditing, user]);

//   const handleEditChange = useCallback((e) => {
//     const { name, value } = e.target;
//     setEditForm((prev) => ({ ...prev, [name]: value }));
//   }, []);

//   const handleEditSubmit = useCallback(async (e) => {
//     e.preventDefault();
//     try {
//       const response = await api.patch(`/api/user_management/profiles/${user.id}/`, {
//         username: editForm.username,
//         phonenumber: editForm.phone,
//       });
//       onUserUpdate(response.data);
//       setIsEditing(false);
//       setError(null);
//     } catch (err) {
//       setError(err.response?.data?.error || "Failed to update client profile.");
//     }
//   }, [user, editForm, onUserUpdate]);

//   const handleMessageChange = useCallback((e) => {
//     const { name, value } = e.target;
//     setMessageForm((prev) => ({ ...prev, [name]: value }));
//   }, []);

//   const handleSendMessage = useCallback(async (e) => {
//     e.preventDefault();
//     if (!messageForm.message.trim()) {
//       setError("Message content is required.");
//       return;
//     }

//     setIsSendingMessage(true);
//     try {
//       await api.post(`/api/user_management/profiles/${user.id}/send-message/`, {
//         ...messageForm,
//         trigger_type: "manual"
//       });
      
//       // Refresh user data to get updated communication logs
//       onRefresh();
      
//       setMessageForm({ message_type: "sms", subject: "", message: "" });
//       setError(null);
//     } catch (err) {
//       setError(err.response?.data?.error || "Failed to send message.");
//     } finally {
//       setIsSendingMessage(false);
//     }
//   }, [user, messageForm, onRefresh]);

//   const handleDisconnect = useCallback(async () => {
//     if (!user.router || !user.device || !user.active) {
//       setError("No active connection to disconnect.");
//       return;
//     }

//     setIsDisconnecting(true);
//     try {
//       await api.post(`/api/user_management/profiles/${user.id}/disconnect/`);
//       onRefresh();
//       setError(null);
//     } catch (err) {
//       setError(err.response?.data?.error || "Failed to disconnect client.");
//     } finally {
//       setIsDisconnecting(false);
//     }
//   }, [user, onRefresh]);

//   const viewPurchaseDetails = useCallback((purchase) => {
//     setSelectedPurchase(purchase);
//   }, []);

//   const closePurchaseDetails = useCallback(() => {
//     setSelectedPurchase(null);
//   }, []);

//   const exportToCSV = useCallback((history) => {
//     if (!history?.purchaseHistory) return;
    
//     const headers = ["Plan,Purchase Date,Duration,Price,Status,Payment Method,Invoice Number"];
//     const rows = history.purchaseHistory.map((purchase) =>
//       [
//         purchase.plan?.name || "N/A",
//         formatDate(purchase.purchase_date),
//         purchase.duration || "N/A",
//         formatCurrency(purchase.amount),
//         purchase.status || "N/A",
//         purchase.payment_method || "N/A",
//         purchase.invoice_number || "N/A",
//       ].join(",")
//     );
//     const csv = [...headers, ...rows].join("\n");
//     const blob = new Blob([csv], { type: "text/csv" });
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.setAttribute("href", url);
//     a.setAttribute("download", `${user.username}_subscription_history.csv`);
//     a.click();
//   }, [user, formatDate, formatCurrency]);

//   const exportBrowsingHistoryToCSV = useCallback((visitedSites) => {
//     if (!visitedSites) return;
    
//     const headers = ["URL,Data Used,Frequency,Timestamp,Router,Device MAC"];
//     const rows = visitedSites.map((site) =>
//       [
//         site.url || "N/A",
//         site.data_used || "0GB",
//         site.frequency || "N/A",
//         formatDate(site.timestamp),
//         site.router?.name || "Unknown",
//         site.hotspot_user?.mac || "Unknown"
//       ].join(",")
//     );
//     const csv = [...headers, ...rows].join("\n");
//     const blob = new Blob([csv], { type: "text/csv" });
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.setAttribute("href", url);
//     a.setAttribute("download", `${user.username}_browsing_history.csv`);
//     a.click();
//   }, [user, formatDate]);

//   const tabs = [
//     { id: 'overview', label: 'Overview', icon: User },
//     { id: 'subscription', label: 'Subscription', icon: CreditCard },
//     { id: 'history', label: 'History', icon: History },
//     { id: 'sessions', label: 'Sessions', icon: Activity },
//     { id: 'communication', label: 'Communication', icon: MessageSquare }
//   ];

//   return (
//     <div className="space-y-6">
//       {error && (
//         <div className={`p-4 rounded-lg ${
//           theme === "dark" ? "bg-red-900/20 text-red-300" : "bg-red-100 text-red-700"
//         }`}>
//           {error}
//         </div>
//       )}

//       {/* Profile Header */}
//       <div className={`rounded-xl shadow-sm border p-6 transition-colors duration-300 ${cardClass}`}>
//         <div className="flex items-start justify-between">
//           <div className="flex items-center gap-4">
//             <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
//               user.active 
//                 ? "bg-gradient-to-br from-green-100 to-teal-100"
//                 : "bg-gradient-to-br from-gray-100 to-gray-200"
//             } ${
//               theme === "dark" 
//                 ? user.active 
//                   ? "from-green-900/20 to-teal-900/20" 
//                   : "from-gray-700 to-gray-800"
//                 : ""
//             }`}>
//               <User className={
//                 user.active 
//                   ? "text-green-600" 
//                   : "text-gray-500"
//               } size={28} />
//             </div>
//             <div>
//               <h2 className={`text-xl font-bold ${
//                 theme === "dark" ? "text-white" : "text-gray-800"
//               }`}>
//                 {user.username}
//               </h2>
//               <div className="flex items-center gap-2 mt-1">
//                 <span
//                   className={`px-2 py-1 rounded-full text-xs ${
//                     user.active 
//                       ? theme === "dark"
//                         ? "bg-green-900/20 text-green-400"
//                         : "bg-green-100 text-green-700"
//                       : theme === "dark"
//                         ? "bg-red-900/20 text-red-400"
//                         : "bg-red-100 text-red-700"
//                   }`}
//                 >
//                   {user.active ? "Active" : "Inactive"}
//                 </span>
//                 {user.subscription ? (
//                   <span className={`px-2 py-1 rounded-full text-xs ${
//                     theme === "dark" 
//                       ? "bg-blue-900/20 text-blue-400" 
//                       : "bg-blue-100 text-blue-700"
//                   }`}>
//                     {user.subscription.plan?.name} Plan
//                   </span>
//                 ) : (
//                   <span className={`px-2 py-1 rounded-full text-xs ${
//                     theme === "dark" 
//                       ? "bg-yellow-900/20 text-yellow-400" 
//                       : "bg-yellow-100 text-yellow-700"
//                   }`}>
//                     No Active Plan
//                   </span>
//                 )}
//                 {user.connection_type && user.connection_type !== "none" && (
//                   <span className={`px-2 py-1 rounded-full text-xs ${
//                     user.connection_type === "hotspot"
//                       ? theme === "dark"
//                         ? "bg-orange-900/20 text-orange-400"
//                         : "bg-orange-100 text-orange-700"
//                       : theme === "dark"
//                       ? "bg-indigo-900/20 text-indigo-400"
//                       : "bg-indigo-100 text-indigo-700"
//                   }`}>
//                     {user.connection_type.toUpperCase()}
//                   </span>
//                 )}
//               </div>
//             </div>
//           </div>
//           <div className="flex items-center gap-2">
//             {user.active && user.router && (
//               <button
//                 onClick={handleDisconnect}
//                 disabled={isDisconnecting}
//                 className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm hover:bg-red-600 disabled:opacity-50 ${
//                   theme === "dark" 
//                     ? "bg-red-600 text-white hover:bg-red-700" 
//                     : "bg-red-500 text-white hover:bg-red-600"
//                 }`}
//               >
//                 {isDisconnecting ? (
//                   <FaSpinner className="animate-spin" />
//                 ) : (
//                   <Trash2 size={16} />
//                 )}
//                 Disconnect
//               </button>
//             )}
//             <button
//               className={theme === "dark" ? "text-gray-400 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"}
//               onClick={handleEditToggle}
//             >
//               <MoreVertical size={18} />
//             </button>
//           </div>
//         </div>

//         {/* Enhanced Connection Info */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6">
//           {[
//             { label: "Username", value: user.username, icon: User },
//             { label: "Phone", value: user.phonenumber, icon: Phone },
//             { 
//               label: user.connection_type === "pppoe" ? "PPPoE Username" : "Device MAC", 
//               value: user.device, 
//               icon: HardDrive 
//             },
//             { label: "Location", value: user.location, icon: Shield },
//             { 
//               label: "Connection Type", 
//               value: user.connection_type ? user.connection_type.toUpperCase() : "None", 
//               icon: Wifi 
//             },
//             ...(user.router ? [
//               { label: "Router", value: user.router.name, icon: Globe }
//             ] : []),
//             // Session statistics
//             { label: "Total Sessions", value: user.totalSessions, icon: Activity },
//             { label: "Active Sessions", value: user.activeSessions, icon: Users }
//           ].map((item, index) => (
//             <div key={index} className={`p-3 rounded-lg ${
//               theme === "dark" ? "bg-gray-700" : "bg-gray-50"
//             }`}>
//               <div className={`flex items-center gap-2 ${
//                 theme === "dark" ? "text-gray-400" : "text-gray-500"
//               }`}>
//                 <item.icon size={16} />
//                 <span className="text-xs">{item.label}</span>
//               </div>
//               <p className={`font-medium mt-1 ${
//                 theme === "dark" ? "text-white" : "text-gray-800"
//               }`}>
//                 {item.value || "N/A"}
//               </p>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Tab Navigation */}
//       <div className={`rounded-xl shadow-sm border overflow-hidden transition-colors duration-300 ${cardClass}`}>
//         <div className={`flex border-b overflow-x-auto ${
//           theme === "dark" ? "border-gray-700" : "border-gray-100"
//         }`}>
//           {tabs.map((tab) => {
//             const TabIcon = tab.icon;
//             return (
//               <button
//                 key={tab.id}
//                 className={`flex-shrink-0 px-6 py-3 font-medium text-sm flex items-center gap-2 ${
//                   activeTab === tab.id 
//                     ? theme === "dark"
//                       ? "text-blue-400 border-b-2 border-blue-400"
//                       : "text-blue-600 border-b-2 border-blue-600"
//                     : theme === "dark"
//                       ? "text-gray-400 hover:text-gray-300"
//                       : "text-gray-500 hover:text-gray-700"
//                 }`}
//                 onClick={() => setActiveTab(tab.id)}
//               >
//                 <TabIcon size={16} />
//                 {tab.label}
//               </button>
//             );
//           })}
//         </div>

//         <div className="p-6">
//           {/* Overview Tab - Enhanced */}
//           {activeTab === 'overview' && (
//             <div className="space-y-6">
//               {/* Current Plan Summary */}
//               {user.subscription ? (
//                 <div className={`p-6 rounded-lg ${
//                   theme === "dark" 
//                     ? "bg-blue-900/20" 
//                     : "bg-gradient-to-r from-blue-50 to-purple-50"
//                 }`}>
//                   <h3 className={`text-lg font-semibold mb-4 ${
//                     theme === "dark" ? "text-white" : "text-gray-800"
//                   }`}>
//                     Current Plan Summary
//                   </h3>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     <div className="space-y-4">
//                       {[
//                         { label: "Plan Type", value: user.subscription.plan?.name, icon: CreditCard, color: "blue" },
//                         { label: "Payment Status", value: user.paymentStatus, icon: PaymentStatusIcon, color: "purple" }
//                       ].map((item, index) => (
//                         <div key={index} className="flex items-center gap-3">
//                           <div className={`p-2 rounded-lg ${
//                             theme === "dark" 
//                               ? `bg-${item.color}-900/20 text-${item.color}-400`
//                               : `bg-${item.color}-100 text-${item.color}-600`
//                           }`}>
//                             {typeof item.icon === 'function' ? <item.icon status={item.value} /> : <item.icon size={18} />}
//                           </div>
//                           <div>
//                             <p className={`text-xs ${
//                               theme === "dark" ? "text-gray-400" : "text-gray-500"
//                             }`}>
//                               {item.label}
//                             </p>
//                             <p className={`font-medium capitalize ${
//                               theme === "dark" ? "text-white" : "text-gray-800"
//                             }`}>
//                               {item.value}
//                             </p>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                     <div className="space-y-4">
//                       {[
//                         { label: "Start Date", value: formatDate(user.subscription.start_date), icon: CalendarDays, color: "green" },
//                         { label: "Expiry Date", value: formatDate(user.subscription.expiry_date), icon: CalendarDays, color: "orange" }
//                       ].map((item, index) => (
//                         <div key={index} className="flex items-center gap-3">
//                           <div className={`p-2 rounded-lg ${
//                             theme === "dark" 
//                               ? `bg-${item.color}-900/20 text-${item.color}-400`
//                               : `bg-${item.color}-100 text-${item.color}-600`
//                           }`}>
//                             <item.icon size={18} />
//                           </div>
//                           <div>
//                             <p className={`text-xs ${
//                               theme === "dark" ? "text-gray-400" : "text-gray-500"
//                             }`}>
//                               {item.label}
//                             </p>
//                             <p className={`font-medium ${
//                               theme === "dark" ? "text-white" : "text-gray-800"
//                             }`}>
//                               {item.value}
//                             </p>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
                  
//                   {/* Data Usage */}
//                   <div className="mt-6">
//                     <div className="flex items-center justify-between mb-3">
//                       <div className="flex items-center gap-2">
//                         <DataUsageIcon
//                           used={user.data_usage?.used || 0}
//                           total={user.data_usage?.total || 1}
//                           isUnlimited={user.is_unlimited}
//                         />
//                         <span className={`font-medium ${
//                           theme === "dark" ? "text-white" : "text-gray-800"
//                         }`}>
//                           Data Consumption
//                         </span>
//                       </div>
//                       <span className={`text-sm font-medium ${
//                         theme === "dark" ? "text-white" : "text-gray-800"
//                       }`}>
//                         {user.is_unlimited
//                           ? "Unlimited"
//                           : `${user.data_usage?.used || 0} ${user.data_usage?.unit || 'GB'} of ${user.data_usage?.total || 0} ${user.data_usage?.unit || 'GB'}`}
//                       </span>
//                     </div>
                    
//                     <div className="mb-2">
//                       <DataUsageBar
//                         used={user.data_usage?.used || 0}
//                         total={user.data_usage?.total || 1}
//                         isUnlimited={user.is_unlimited}
//                         theme={theme}
//                       />
//                     </div>
                    
//                     <div className={`flex items-center justify-between text-xs ${
//                       theme === "dark" ? "text-gray-400" : "text-gray-500"
//                     }`}>
//                       <span>0 {user.data_usage?.unit || 'GB'}</span>
//                       <span>{user.is_unlimited ? "∞" : `${user.data_usage?.total || 0} ${user.data_usage?.unit || 'GB'}`}</span>
//                     </div>
//                   </div>
//                 </div>
//               ) : (
//                 <div className={`p-6 rounded-lg ${
//                   theme === "dark" ? "bg-yellow-900/20" : "bg-yellow-50"
//                 }`}>
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center gap-3">
//                       <div className={`p-2 rounded-lg ${
//                         theme === "dark" ? "bg-yellow-900/20 text-yellow-400" : "bg-yellow-100 text-yellow-600"
//                       }`}>
//                         <Zap size={18} />
//                       </div>
//                       <div>
//                         <h3 className={`font-medium ${
//                           theme === "dark" ? "text-white" : "text-gray-800"
//                         }`}>
//                           No Active Plan
//                         </h3>
//                         <p className={`text-sm ${
//                           theme === "dark" ? "text-gray-400" : "text-gray-500"
//                         }`}>
//                           This client doesn't have an active subscription
//                         </p>
//                       </div>
//                     </div>
//                     <button className={`px-3 py-1 rounded-lg text-sm ${
//                       theme === "dark" 
//                         ? "bg-blue-600 text-white hover:bg-blue-700" 
//                         : "bg-blue-500 text-white hover:bg-blue-600"
//                     }`}>
//                       Assign Plan
//                     </button>
//                   </div>
//                 </div>
//               )}

//               {/* Enhanced Customer Summary */}
//               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
//                 {[
//                   { label: "Total Revenue", value: formatCurrency(user.total_revenue) },
//                   { label: "Avg. Monthly Spend", value: formatCurrency(user.avg_monthly_spend) },
//                   { label: "Renewal Frequency", value: user.renewal_frequency },
//                   { label: "Loyalty Duration", value: `${user.loyalty_duration} months` },
//                   { label: "Connection Type", value: user.connection_type ? user.connection_type.toUpperCase() : "None" },
//                   { label: "Total Sessions", value: user.totalSessions },
//                   { label: "Active Sessions", value: user.activeSessions },
//                   { label: "Total Data Used", value: `${user.totalDataUsedGB?.toFixed(1) || '0'} GB` }
//                 ].map((stat, index) => (
//                   <div key={index} className={`p-4 rounded-lg shadow-sm border transition-colors duration-300 ${cardClass}`}>
//                     <p className={`text-xs ${
//                       theme === "dark" ? "text-gray-400" : "text-gray-500"
//                     }`}>
//                       {stat.label}
//                     </p>
//                     <p className={`font-medium text-lg ${
//                       theme === "dark" ? "text-white" : "text-gray-800"
//                     }`}>
//                       {stat.value}
//                     </p>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* Subscription Tab */}
//           {activeTab === 'subscription' && (
//             <>
//               {user.subscription ? (
//                 <div className="space-y-6">
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//                     <div className="space-y-4">
//                       {[
//                         { label: "Plan Type", value: user.subscription.plan?.name, icon: CreditCard, color: "blue" },
//                         { label: "Payment Status", value: user.paymentStatus, icon: PaymentStatusIcon, color: "purple" }
//                       ].map((item, index) => (
//                         <div key={index} className="flex items-center gap-3">
//                           <div className={`p-2 rounded-lg ${
//                             theme === "dark" 
//                               ? `bg-${item.color}-900/20 text-${item.color}-400`
//                               : `bg-${item.color}-100 text-${item.color}-600`
//                           }`}>
//                             {typeof item.icon === 'function' ? <item.icon status={item.value} /> : <item.icon size={18} />}
//                           </div>
//                           <div>
//                             <p className={`text-xs ${
//                               theme === "dark" ? "text-gray-400" : "text-gray-500"
//                             }`}>
//                               {item.label}
//                             </p>
//                             <p className={`font-medium capitalize ${
//                               theme === "dark" ? "text-white" : "text-gray-800"
//                             }`}>
//                               {item.value}
//                             </p>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                     <div className="space-y-4">
//                       {[
//                         { label: "Start Date", value: formatDate(user.subscription.start_date), icon: CalendarDays, color: "green" },
//                         { label: "Expiry Date", value: formatDate(user.subscription.expiry_date), icon: CalendarDays, color: "orange" }
//                       ].map((item, index) => (
//                         <div key={index} className="flex items-center gap-3">
//                           <div className={`p-2 rounded-lg ${
//                             theme === "dark" 
//                               ? `bg-${item.color}-900/20 text-${item.color}-400`
//                               : `bg-${item.color}-100 text-${item.color}-600`
//                           }`}>
//                             <item.icon size={18} />
//                           </div>
//                           <div>
//                             <p className={`text-xs ${
//                               theme === "dark" ? "text-gray-400" : "text-gray-500"
//                             }`}>
//                               {item.label}
//                             </p>
//                             <p className={`font-medium ${
//                               theme === "dark" ? "text-white" : "text-gray-800"
//                             }`}>
//                               {item.value}
//                             </p>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
                  
//                   <div className="flex items-center justify-between mb-3">
//                     <div className="flex items-center gap-2">
//                       <DataUsageIcon
//                         used={user.data_usage?.used || 0}
//                         total={user.data_usage?.total || 1}
//                         isUnlimited={user.is_unlimited}
//                       />
//                       <span className={`font-medium ${
//                         theme === "dark" ? "text-white" : "text-gray-800"
//                       }`}>
//                         Data Consumption
//                       </span>
//                     </div>
//                     <span className={`text-sm font-medium ${
//                       theme === "dark" ? "text-white" : "text-gray-800"
//                     }`}>
//                       {user.is_unlimited
//                         ? "Unlimited"
//                         : `${user.data_usage?.used || 0} ${user.data_usage?.unit || 'GB'} of ${user.data_usage?.total || 0} ${user.data_usage?.unit || 'GB'}`}
//                     </span>
//                   </div>
                  
//                   <div className="mb-2">
//                     <DataUsageBar
//                       used={user.data_usage?.used || 0}
//                       total={user.data_usage?.total || 1}
//                       isUnlimited={user.is_unlimited}
//                       theme={theme}
//                     />
//                   </div>
                  
//                   <div className={`flex items-center justify-between text-xs ${
//                     theme === "dark" ? "text-gray-400" : "text-gray-500"
//                   }`}>
//                     <span>0 {user.data_usage?.unit || 'GB'}</span>
//                     <span>{user.is_unlimited ? "∞" : `${user.data_usage?.total || 0} ${user.data_usage?.unit || 'GB'}`}</span>
//                   </div>
//                 </div>
//               ) : (
//                 <div className={`text-center py-8 ${
//                   theme === "dark" ? "text-gray-400" : "text-gray-500"
//                 }`}>
//                   <CreditCard size={24} className="mx-auto mb-2 opacity-50" />
//                   <p>No active subscription found</p>
//                 </div>
//               )}
//             </>
//           )}

//           {/* History Tab */}
//           {activeTab === 'history' && (
//             <div className="space-y-8">
//               {user.history?.purchaseHistory?.length > 0 || user.history?.visitedSites?.length > 0 ? (
//                 <>
//                   {/* Plan Purchase Trends */}
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     <div>
//                       <h4 className={`font-medium mb-3 flex items-center gap-2 ${
//                         theme === "dark" ? "text-gray-300" : "text-gray-700"
//                       }`}>
//                         <BarChart2 size={16} />
//                         Annual Revenue Trend
//                       </h4>
//                       <div className={`h-64 p-3 rounded-lg ${
//                         theme === "dark" ? "bg-gray-700" : "bg-gray-50"
//                       }`}>
//                         <ResponsiveContainer width="100%" height="100%">
//                           <LineChart data={getChartData}>
//                             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === "dark" ? "#374151" : "#E5E7EB"} />
//                             <XAxis dataKey="year" stroke={theme === "dark" ? "#9CA3AF" : "#6B7280"} />
//                             <YAxis stroke={theme === "dark" ? "#9CA3AF" : "#6B7280"} />
//                             <Tooltip 
//                               formatter={(value) => [formatCurrency(value), "Revenue"]}
//                               contentStyle={{
//                                 backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
//                                 borderColor: theme === 'dark' ? '#374151' : '#E5E7EB',
//                                 color: theme === 'dark' ? '#F9FAFB' : '#1F2937'
//                               }}
//                             />
//                             <Line
//                               type="monotone"
//                               dataKey="revenue"
//                               stroke="#3B82F6"
//                               strokeWidth={2}
//                               dot={{ r: 4 }}
//                               activeDot={{ r: 6 }}
//                             />
//                           </LineChart>
//                         </ResponsiveContainer>
//                       </div>
//                     </div>
                    
//                     <div>
//                       <h4 className={`font-medium mb-3 flex items-center gap-2 ${
//                         theme === "dark" ? "text-gray-300" : "text-gray-700"
//                       }`}>
//                         <BarChart2 size={16} />
//                         Monthly Revenue Breakdown
//                       </h4>
//                       <div className={`h-64 p-3 rounded-lg ${
//                         theme === "dark" ? "bg-gray-700" : "bg-gray-50"
//                       }`}>
//                         <ResponsiveContainer width="100%" height="100%">
//                           <BarChart data={getMonthlyChartData}>
//                             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === "dark" ? "#374151" : "#E5E7EB"} />
//                             <XAxis dataKey="month" stroke={theme === "dark" ? "#9CA3AF" : "#6B7280"} />
//                             <YAxis stroke={theme === "dark" ? "#9CA3AF" : "#6B7280"} />
//                             <Tooltip 
//                               formatter={(value) => [formatCurrency(value), "Revenue"]}
//                               contentStyle={{
//                                 backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
//                                 borderColor: theme === 'dark' ? '#374151' : '#E5E7EB',
//                                 color: theme === 'dark' ? '#F9FAFB' : '#1F2937'
//                               }}
//                             />
//                             <Bar dataKey="revenue" fill="#8884d8" radius={[4, 4, 0, 0]} />
//                           </BarChart>
//                         </ResponsiveContainer>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Plan Distribution */}
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     <div>
//                       <h4 className={`font-medium mb-3 flex items-center gap-2 ${
//                         theme === "dark" ? "text-gray-300" : "text-gray-700"
//                       }`}>
//                         <Package size={16} />
//                         Plan Distribution
//                       </h4>
//                       <div className={`h-64 p-3 rounded-lg ${
//                         theme === "dark" ? "bg-gray-700" : "bg-gray-50"
//                       }`}>
//                         <ResponsiveContainer width="100%" height="100%">
//                           <PieChart>
//                             <Pie
//                               data={getPlanDistributionData}
//                               cx="50%"
//                               cy="50%"
//                               labelLine={false}
//                               outerRadius={80}
//                               fill="#8884d8"
//                               dataKey="value"
//                               label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
//                             >
//                               {getPlanDistributionData.map((entry, index) => (
//                                 <Cell key={`cell-${index}`} fill={entry.color} />
//                               ))}
//                             </Pie>
//                             <Tooltip 
//                               formatter={(value, name) => [`${value} purchases`, name]}
//                               contentStyle={{
//                                 backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
//                                 borderColor: theme === 'dark' ? '#374151' : '#E5E7EB',
//                                 color: theme === 'dark' ? '#F9FAFB' : '#1F2937'
//                               }}
//                             />
//                           </PieChart>
//                         </ResponsiveContainer>
//                       </div>
//                     </div>
                    
//                     <div>
//                       <h4 className={`font-medium mb-3 flex items-center gap-2 ${
//                         theme === "dark" ? "text-gray-300" : "text-gray-700"
//                       }`}>
//                         <CreditCard size={16} />
//                         Payment Methods
//                       </h4>
//                       <div className={`h-64 p-3 rounded-lg ${
//                         theme === "dark" ? "bg-gray-700" : "bg-gray-50"
//                       }`}>
//                         <ResponsiveContainer width="100%" height="100%">
//                           <PieChart>
//                             <Pie
//                               data={getPaymentMethodData}
//                               cx="50%"
//                               cy="50%"
//                               labelLine={false}
//                               outerRadius={80}
//                               fill="#8884d8"
//                               dataKey="value"
//                               label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
//                             >
//                               {getPaymentMethodData.map((entry, index) => (
//                                 <Cell
//                                   key={`cell-${index}`}
//                                   fill={["#6366F1", "#3B82F6", "#10B981", "#F59E0B"][index % 4]}
//                                 />
//                               ))}
//                             </Pie>
//                             <Tooltip 
//                               formatter={(value, name) => [`${value} purchases`, name]}
//                               contentStyle={{
//                                 backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
//                                 borderColor: theme === 'dark' ? '#374151' : '#E5E7EB',
//                                 color: theme === 'dark' ? '#F9FAFB' : '#1F2937'
//                               }}
//                             />
//                           </PieChart>
//                         </ResponsiveContainer>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Plan Behavior Insights */}
//                   <div>
//                     <h4 className={`font-medium mb-3 flex items-center gap-2 ${
//                       theme === "dark" ? "text-gray-300" : "text-gray-700"
//                     }`}>
//                       <TrendingUp size={16} />
//                       Plan Behavior Insights
//                     </h4>
//                     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
//                       {[
//                         { label: "Favorite Plan", value: getPlanBehavior.favoritePlan },
//                         { label: "Number of Upgrades", value: getPlanBehavior.upgrades },
//                         { label: "Plan Changes", value: getPlanBehavior.planChanges },
//                         { label: "Avg. Plan Duration", value: `${getPlanBehavior.avgDuration.toFixed(1)} months` }
//                       ].map((stat, index) => (
//                         <div key={index} className={`p-3 rounded-lg ${
//                           theme === "dark" ? "bg-gray-700" : "bg-gray-50"
//                         }`}>
//                           <p className={`text-xs ${
//                             theme === "dark" ? "text-gray-400" : "text-gray-500"
//                           }`}>
//                             {stat.label}
//                           </p>
//                           <p className={`font-medium ${
//                             theme === "dark" ? "text-white" : "text-gray-800"
//                           }`}>
//                             {stat.value}
//                           </p>
//                         </div>
//                       ))}
//                     </div>
                    
//                     <div className={`mt-4 p-3 rounded-lg ${
//                       theme === "dark" ? "bg-gray-700" : "bg-gray-50"
//                     }`}>
//                       <div className="flex items-center gap-2">
//                         <p className={`text-xs ${
//                           theme === "dark" ? "text-gray-400" : "text-gray-500"
//                         }`}>
//                           Spending Trend:
//                         </p>
//                         {getSpendingTrend === "up" ? (
//                           <div className="flex items-center text-green-500">
//                             <TrendingUp size={16} />
//                             <span className="ml-1">Increasing</span>
//                           </div>
//                         ) : getSpendingTrend === "down" ? (
//                           <div className="flex items-center text-red-500">
//                             <TrendingDown size={16} />
//                             <span className="ml-1">Decreasing</span>
//                           </div>
//                         ) : (
//                           <div className="flex items-center text-gray-500">
//                             <Circle size={16} />
//                             <span className="ml-1">Stable</span>
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   </div>

//                   {/* Browsing History */}
//                   <div>
//                     <div className="flex items-center justify-between mb-3">
//                       <h4 className={`font-medium flex items-center gap-2 ${
//                         theme === "dark" ? "text-gray-300" : "text-gray-700"
//                       }`}>
//                         <Globe size={16} />
//                         Browsing History
//                       </h4>
//                       <button
//                         className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm ${
//                           theme === "dark" 
//                             ? "bg-blue-600 text-white hover:bg-blue-700" 
//                             : "bg-blue-500 text-white hover:bg-blue-600"
//                         }`}
//                         onClick={() => exportBrowsingHistoryToCSV(user.history.visitedSites)}
//                       >
//                         <Download size={14} />
//                         Export
//                       </button>
//                     </div>
                    
//                     <div className="overflow-x-auto">
//                       <table className="w-full text-sm">
//                         <thead>
//                           <tr className={theme === "dark" ? "bg-gray-700" : "bg-gray-100"}>
//                             {["URL", "Data Used", "Frequency", "Timestamp", "Router", "Device"].map((header) => (
//                               <th key={header} className={`p-2 text-left ${
//                                 theme === "dark" ? "text-gray-300" : "text-gray-600"
//                               }`}>
//                                 {header}
//                               </th>
//                             ))}
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {user.history.visitedSites && user.history.visitedSites.length > 0 ? (
//                             user.history.visitedSites.map((site, index) => (
//                               <tr key={index} className={`border-b ${
//                                 theme === "dark" 
//                                   ? "border-gray-700 hover:bg-gray-700" 
//                                   : "border-gray-200 hover:bg-gray-50"
//                               }`}>
//                                 <td className="p-2">
//                                   <a
//                                     href={site.url}
//                                     target="_blank"
//                                     rel="noopener noreferrer"
//                                     className="text-blue-500 hover:underline"
//                                   >
//                                     {site.url.length > 30 ? `${site.url.substring(0, 27)}...` : site.url}
//                                   </a>
//                                 </td>
//                                 <td className={`p-2 ${
//                                   theme === "dark" ? "text-gray-300" : "text-gray-700"
//                                 }`}>
//                                   {site.data_used || "0GB"}
//                                 </td>
//                                 <td className={`p-2 ${
//                                   theme === "dark" ? "text-gray-300" : "text-gray-700"
//                                 }`}>
//                                   {site.frequency || "N/A"}
//                                 </td>
//                                 <td className={`p-2 ${
//                                   theme === "dark" ? "text-gray-300" : "text-gray-700"
//                                 }`}>
//                                   {formatDate(site.timestamp)}
//                                 </td>
//                                 <td className={`p-2 ${
//                                   theme === "dark" ? "text-gray-300" : "text-gray-700"
//                                 }`}>
//                                   {site.router?.name || "Unknown"}
//                                 </td>
//                                 <td className={`p-2 ${
//                                   theme === "dark" ? "text-gray-300" : "text-gray-700"
//                                 }`}>
//                                   {site.hotspot_user?.mac || "Unknown"}
//                                 </td>
//                               </tr>
//                             ))
//                           ) : (
//                             <tr>
//                               <td colSpan={6} className={`p-4 text-center ${
//                                 theme === "dark" ? "text-gray-400" : "text-gray-500"
//                               }`}>
//                                 No browsing history found
//                               </td>
//                             </tr>
//                           )}
//                         </tbody>
//                       </table>
//                     </div>
//                   </div>

//                   {/* Purchase History */}
//                   <div>
//                     <div className="flex items-center justify-between mb-3">
//                       <h4 className={`font-medium flex items-center gap-2 ${
//                         theme === "dark" ? "text-gray-300" : "text-gray-700"
//                       }`}>
//                         <History size={16} />
//                         Detailed Purchase History
//                       </h4>
//                       <div className="flex items-center gap-2">
//                         <select
//                           className={`border rounded-lg px-2 py-1 text-sm ${
//                             theme === "dark" 
//                               ? "bg-gray-700 border-gray-600 text-white" 
//                               : "border-gray-200"
//                           }`}
//                           value={filterYear}
//                           onChange={(e) => setFilterYear(e.target.value)}
//                         >
//                           <option value="All">All Years</option>
//                           {[
//                             ...new Set(
//                               user.history.purchaseHistory.map((p) =>
//                                 new Date(p.purchase_date).getFullYear()
//                               )
//                             ),
//                           ]
//                             .sort((a, b) => b - a)
//                             .map((year) => (
//                               <option key={year} value={year}>
//                                 {year}
//                               </option>
//                             ))}
//                         </select>
//                         <button
//                           className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm ${
//                             theme === "dark" 
//                               ? "bg-blue-600 text-white hover:bg-blue-700" 
//                               : "bg-blue-500 text-white hover:bg-blue-600"
//                           }`}
//                           onClick={() => exportToCSV(user.history)}
//                         >
//                           <Download size={14} />
//                           Export
//                         </button>
//                       </div>
//                     </div>
                    
//                     <div className="overflow-x-auto">
//                       <table className="w-full text-sm">
//                         <thead>
//                           <tr className={theme === "dark" ? "bg-gray-700" : "bg-gray-100"}>
//                             {["Plan", "Purchase Date", "Duration", "Price", "Status", "Details"].map((header) => (
//                               <th key={header} className={`p-2 text-left ${
//                                 theme === "dark" ? "text-gray-300" : "text-gray-600"
//                               }`}>
//                                 {header}
//                               </th>
//                             ))}
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {getFilteredPurchaseHistory.map((purchase, index) => (
//                             <tr
//                               key={index}
//                               className={`border-b cursor-pointer ${
//                                 theme === "dark" 
//                                   ? "border-gray-700 hover:bg-gray-700" 
//                                   : "border-gray-200 hover:bg-gray-50"
//                               }`}
//                               onClick={() => viewPurchaseDetails(purchase)}
//                             >
//                               <td className="p-2">
//                                 <div className="flex items-center gap-2">
//                                   <div
//                                     className="w-2 h-2 rounded-full"
//                                     style={{ backgroundColor: getPlanColor(purchase.plan?.name) }}
//                                   ></div>
//                                   <span className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>
//                                     {purchase.plan?.name || "N/A"}
//                                   </span>
//                                 </div>
//                               </td>
//                               <td className={`p-2 ${
//                                 theme === "dark" ? "text-gray-300" : "text-gray-700"
//                               }`}>
//                                 {formatDate(purchase.purchase_date)}
//                               </td>
//                               <td className={`p-2 ${
//                                 theme === "dark" ? "text-gray-300" : "text-gray-700"
//                               }`}>
//                                 {purchase.duration || "N/A"}
//                               </td>
//                               <td className={`p-2 font-medium ${
//                                 theme === "dark" ? "text-white" : "text-gray-800"
//                               }`}>
//                                 {formatCurrency(purchase.amount)}
//                               </td>
//                               <td className="p-2">
//                                 <span
//                                   className={`px-2 py-1 rounded-full text-xs ${
//                                     purchase.status === "Active"
//                                       ? theme === "dark"
//                                         ? "bg-green-900/20 text-green-400"
//                                         : "bg-green-100 text-green-700"
//                                       : theme === "dark"
//                                         ? "bg-red-900/20 text-red-400"
//                                         : "bg-red-100 text-red-700"
//                                   }`}
//                                 >
//                                   {purchase.status || "N/A"}
//                                 </span>
//                               </td>
//                               <td className="p-2">
//                                 <button className="text-blue-500 hover:text-blue-700">
//                                   <Eye size={16} />
//                                 </button>
//                               </td>
//                             </tr>
//                           ))}
//                         </tbody>
//                       </table>
//                     </div>
//                   </div>
//                 </>
//               ) : (
//                 <div className={`text-center py-8 ${
//                   theme === "dark" ? "text-gray-400" : "text-gray-500"
//                 }`}>
//                   <Package size={24} className="mx-auto mb-2 opacity-50" />
//                   <p>No history found</p>
//                 </div>
//               )}
//             </div>
//           )}

//           {/* Sessions Tab */}
//           {activeTab === 'sessions' && (
//             <SessionHistory 
//               sessions={user.sessionHistory} 
//               theme={theme} 
//             />
//           )}

//           {/* Communication Tab */}
//           {activeTab === 'communication' && (
//             <div className="space-y-6">
//               {/* Send Message Form */}
//               <div className={`p-4 rounded-lg ${
//                 theme === "dark" ? "bg-gray-700" : "bg-gray-50"
//               }`}>
//                 <h4 className={`font-medium mb-3 ${
//                   theme === "dark" ? "text-gray-300" : "text-gray-700"
//                 }`}>
//                   Send Message
//                 </h4>
//                 <form onSubmit={handleSendMessage} className="space-y-3">
//                   <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
//                     <div>
//                       <label className={`block text-sm mb-1 ${
//                         theme === "dark" ? "text-gray-400" : "text-gray-600"
//                       }`}>
//                         Message Type
//                       </label>
//                       <select
//                         name="message_type"
//                         value={messageForm.message_type}
//                         onChange={handleMessageChange}
//                         className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${inputClass}`}
//                       >
//                         <option value="sms">SMS</option>
//                         <option value="email">Email</option>
//                         <option value="system">System Notification</option>
//                       </select>
//                     </div>
//                     {messageForm.message_type === 'email' && (
//                       <div className="md:col-span-2">
//                         <label className={`block text-sm mb-1 ${
//                           theme === "dark" ? "text-gray-400" : "text-gray-600"
//                         }`}>
//                           Subject
//                         </label>
//                         <input
//                           type="text"
//                           name="subject"
//                           value={messageForm.subject}
//                           onChange={handleMessageChange}
//                           className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${inputClass}`}
//                           placeholder="Email subject"
//                         />
//                       </div>
//                     )}
//                   </div>
//                   <div>
//                     <label className={`block text-sm mb-1 ${
//                       theme === "dark" ? "text-gray-400" : "text-gray-600"
//                     }`}>
//                       Message
//                     </label>
//                     <textarea
//                       name="message"
//                       value={messageForm.message}
//                       onChange={handleMessageChange}
//                       rows={3}
//                       className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${inputClass}`}
//                       placeholder="Type your message here..."
//                       required
//                     />
//                   </div>
//                   <div className="flex justify-end">
//                     <button
//                       type="submit"
//                       disabled={isSendingMessage}
//                       className={`flex items-center gap-2 px-4 py-2 rounded-lg disabled:opacity-50 ${
//                         theme === "dark" 
//                           ? "bg-blue-600 text-white hover:bg-blue-700" 
//                           : "bg-blue-500 text-white hover:bg-blue-600"
//                       }`}
//                     >
//                       {isSendingMessage ? (
//                         <FaSpinner className="animate-spin" />
//                       ) : (
//                         <Send size={16} />
//                       )}
//                       Send Message
//                     </button>
//                   </div>
//                 </form>
//               </div>

//               {/* Communication Log */}
//               <div>
//                 <h4 className={`font-medium mb-3 ${
//                   theme === "dark" ? "text-gray-300" : "text-gray-700"
//                 }`}>
//                   Communication History
//                 </h4>
//                 {user.communication_logs && user.communication_logs.length > 0 ? (
//                   <div className="space-y-3">
//                     {user.communication_logs.map((log) => (
//                       <div key={log.id} className={`p-4 rounded-lg border transition-colors duration-300 ${cardClass}`}>
//                         <div className="flex items-start gap-3">
//                           <MessageTypeIcon type={log.message_type} />
//                           <div className="flex-1">
//                             <p className={`font-medium ${
//                               theme === "dark" ? "text-white" : "text-gray-800"
//                             }`}>
//                               {log.subject || log.trigger_display}
//                             </p>
//                             <p className={`text-sm ${
//                               theme === "dark" ? "text-gray-400" : "text-gray-500"
//                             }`}>
//                               {formatDate(log.formatted_timestamp)}
//                             </p>
//                             <div className="mt-1">
//                               <StatusBadge status={log.status} theme={theme} />
//                             </div>
//                             <p className={`mt-2 ${
//                               theme === "dark" ? "text-gray-300" : "text-gray-700"
//                             }`}>
//                               {log.message}
//                             </p>
//                             {log.router && (
//                               <p className={`text-sm ${
//                                 theme === "dark" ? "text-gray-400" : "text-gray-500"
//                               } mt-1`}>
//                                 Router: {log.router.name}
//                               </p>
//                             )}
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 ) : (
//                   <div className={`text-center py-8 ${
//                     theme === "dark" ? "text-gray-400" : "text-gray-500"
//                   }`}>
//                     <MessageSquare size={24} className="mx-auto mb-2 opacity-50" />
//                     <p>No communication history</p>
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Edit Profile Modal */}
//       {isEditing && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//           <div className={`rounded-xl max-w-md w-full p-6 ${
//             theme === "dark" ? "bg-gray-800" : "bg-white"
//           }`}>
//             <div className="flex items-center justify-between mb-4">
//               <h3 className={`text-lg font-bold ${
//                 theme === "dark" ? "text-white" : "text-gray-800"
//               }`}>
//                 Edit Client Profile
//               </h3>
//               <button
//                 onClick={handleEditToggle}
//                 className={theme === "dark" ? "text-gray-400 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"}
//               >
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   className="h-6 w-6"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                   stroke="currentColor"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M6 18L18 6M6 6l12 12"
//                   />
//                 </svg>
//               </button>
//             </div>
//             <form onSubmit={handleEditSubmit} className="space-y-4">
//               <div>
//                 <label className={`block text-sm ${
//                   theme === "dark" ? "text-gray-400" : "text-gray-600"
//                 }`}>
//                   Username
//                 </label>
//                 <input
//                   type="text"
//                   name="username"
//                   value={editForm.username}
//                   onChange={handleEditChange}
//                   className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${inputClass}`}
//                   required
//                 />
//               </div>
//               <div>
//                 <label className={`block text-sm ${
//                   theme === "dark" ? "text-gray-400" : "text-gray-600"
//                 }`}>
//                   Phone Number
//                 </label>
//                 <input
//                   type="text"
//                   name="phone"
//                   value={editForm.phone}
//                   onChange={handleEditChange}
//                   className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${inputClass}`}
//                   pattern="(\+254|0)[0-9]{9}"
//                   title="Phone number must be in the format +254XXXXXXXXX or 07XXXXXXXX"
//                   required
//                 />
//               </div>
//               <div className="flex justify-end gap-2">
//                 <button
//                   type="button"
//                   onClick={handleEditToggle}
//                   className={`px-4 py-2 rounded-lg ${
//                     theme === "dark" 
//                       ? "bg-gray-700 text-white hover:bg-gray-600" 
//                       : "bg-gray-200 text-gray-800 hover:bg-gray-300"
//                   }`}
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className={`px-4 py-2 rounded-lg ${
//                     theme === "dark" 
//                       ? "bg-blue-600 text-white hover:bg-blue-700" 
//                       : "bg-blue-500 text-white hover:bg-blue-600"
//                   }`}
//                 >
//                   Save
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* Purchase Details Modal */}
//       {selectedPurchase && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//           <div className={`rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto ${
//             theme === "dark" ? "bg-gray-800" : "bg-white"
//           }`}>
//             <div className="p-6">
//               <div className="flex items-center justify-between mb-4">
//                 <h3 className={`text-lg font-bold ${
//                   theme === "dark" ? "text-white" : "text-gray-800"
//                 }`}>
//                   Purchase Details
//                 </h3>
//                 <button
//                   onClick={closePurchaseDetails}
//                   className={theme === "dark" ? "text-gray-400 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"}
//                 >
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     className="h-6 w-6"
//                     fill="none"
//                     viewBox="0 0 24 24"
//                     stroke="currentColor"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M6 18L18 6M6 6l12 12"
//                     />
//                   </svg>
//                 </button>
//               </div>
//               <div className="space-y-4">
//                 <div>
//                   <p className={`text-sm ${
//                     theme === "dark" ? "text-gray-400" : "text-gray-500"
//                   }`}>
//                     Plan
//                   </p>
//                   <p className={`font-medium ${
//                     theme === "dark" ? "text-white" : "text-gray-800"
//                   }`}>
//                     {selectedPurchase.plan?.name || "N/A"}
//                   </p>
//                 </div>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                   <div>
//                     <p className={`text-sm ${
//                       theme === "dark" ? "text-gray-400" : "text-gray-500"
//                     }`}>
//                       Purchase Date
//                     </p>
//                     <p className={`font-medium ${
//                       theme === "dark" ? "text-white" : "text-gray-800"
//                     }`}>
//                       {formatDate(selectedPurchase.purchase_date)}
//                     </p>
//                   </div>
//                   <div>
//                     <p className={`text-sm ${
//                       theme === "dark" ? "text-gray-400" : "text-gray-500"
//                     }`}>
//                       Duration
//                     </p>
//                     <p className={`font-medium ${
//                       theme === "dark" ? "text-white" : "text-gray-800"
//                     }`}>
//                       {selectedPurchase.duration || "N/A"}
//                     </p>
//                   </div>
//                 </div>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                   <div>
//                     <p className={`text-sm ${
//                       theme === "dark" ? "text-gray-400" : "text-gray-500"
//                     }`}>
//                       Price
//                     </p>
//                     <p className={`font-medium ${
//                       theme === "dark" ? "text-white" : "text-gray-800"
//                     }`}>
//                       {formatCurrency(selectedPurchase.amount)}
//                     </p>
//                   </div>
//                   <div>
//                     <p className={`text-sm ${
//                       theme === "dark" ? "text-gray-400" : "text-gray-500"
//                     }`}>
//                       Status
//                     </p>
//                     <p className="font-medium">
//                       <span
//                         className={`px-2 py-1 rounded-full text-xs ${
//                           selectedPurchase.status === "Active"
//                             ? theme === "dark"
//                               ? "bg-green-900/20 text-green-400"
//                               : "bg-green-100 text-green-700"
//                             : theme === "dark"
//                               ? "bg-red-900/20 text-red-400"
//                               : "bg-red-100 text-red-700"
//                         }`}
//                       >
//                         {selectedPurchase.status || "N/A"}
//                       </span>
//                     </p>
//                   </div>
//                 </div>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                   <div>
//                     <p className={`text-sm ${
//                       theme === "dark" ? "text-gray-400" : "text-gray-500"
//                     }`}>
//                       Payment Method
//                     </p>
//                     <p className={`font-medium ${
//                       theme === "dark" ? "text-white" : "text-gray-800"
//                     }`}>
//                       {selectedPurchase.payment_method || "N/A"}
//                     </p>
//                   </div>
//                   <div>
//                     <p className={`text-sm ${
//                       theme === "dark" ? "text-gray-400" : "text-gray-500"
//                     }`}>
//                       Invoice Number
//                     </p>
//                     <p className={`font-medium ${
//                       theme === "dark" ? "text-white" : "text-gray-800"
//                     }`}>
//                       {selectedPurchase.invoice_number || "N/A"}
//                     </p>
//                   </div>
//                 </div>
//                 {selectedPurchase.status === "Expired" && (
//                   <div className={`mt-4 p-3 rounded-lg ${
//                     theme === "dark" ? "bg-yellow-900/20" : "bg-yellow-50"
//                   }`}>
//                     <div className="flex items-center gap-2 text-yellow-600">
//                       <AlertTriangle size={16} />
//                       <p className="text-sm">
//                         This plan expired on {formatDate(user.subscription?.expiry_date)}
//                       </p>
//                     </div>
//                   </div>
//                 )}
//               </div>
//               <div className="mt-6 flex justify-end">
//                 <button
//                   onClick={closePurchaseDetails}
//                   className={`px-4 py-2 rounded-lg ${
//                     theme === "dark" 
//                       ? "bg-blue-600 text-white hover:bg-blue-700" 
//                       : "bg-blue-500 text-white hover:bg-blue-600"
//                   }`}
//                 >
//                   Close
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ClientProfile;





// components/ClientProfile.jsx
import React, { useState, useMemo, useCallback } from 'react';
import { 
  User, Phone, Wifi, CalendarDays, CreditCard, 
  HardDrive, Shield, Globe, BarChart2, History, 
  MessageSquare, Zap, Users, Activity, Mail, 
  Send, Download, AlertTriangle, CheckCircle2, 
  Clock, MoreVertical, Edit, Trash2, Eye,
  TrendingUp, TrendingDown, Circle, Package
} from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext'
import SessionHistory from '../components/SessionHistory'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import api from '../../../api'
import { FaSpinner } from 'react-icons/fa';

// Import from the new SharedComponents file
import { 
  DataUsageBar, 
  DataUsageIcon, 
  PaymentStatusIcon, 
  StatusBadge, 
  MessageTypeIcon 
} from '../components/SharedComponents'

const ClientProfile = ({ user, onUserUpdate, activeTab, setActiveTab, onRefresh }) => {
  const { theme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ username: user.username, phone: user.phonenumber });
  const [messageForm, setMessageForm] = useState({ message_type: "sms", subject: "", message: "" });
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [filterYear, setFilterYear] = useState("All");
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [error, setError] = useState(null);

  const cardClass = theme === "dark" 
    ? "bg-gray-800/60 backdrop-blur-md border-gray-700" 
    : "bg-white border-gray-200";

  const inputClass = theme === "dark"
    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
    : "bg-white border-gray-300 text-gray-800 placeholder-gray-500";

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Memoized data processing functions
  const getFilteredPurchaseHistory = useMemo(() => {
    if (!user?.history?.purchaseHistory) return [];
    if (filterYear === "All") return user.history.purchaseHistory;
    return user.history.purchaseHistory.filter(
      (purchase) => new Date(purchase.purchase_date).getFullYear().toString() === filterYear
    );
  }, [user, filterYear]);

  const getChartData = useMemo(() => {
    if (!user?.history?.purchaseHistory) return [];
    const purchasesByYear = {};
    user.history.purchaseHistory.forEach((purchase) => {
      const year = new Date(purchase.purchase_date).getFullYear();
      if (!purchasesByYear[year]) purchasesByYear[year] = 0;
      purchasesByYear[year] += purchase.amount;
    });
    return Object.keys(purchasesByYear).sort((a, b) => a - b).map((year) => ({
      year,
      revenue: purchasesByYear[year],
    }));
  }, [user]);

  const getMonthlyChartData = useMemo(() => {
    if (!user?.history?.purchaseHistory) return [];
    const monthlyData = {};
    user.history.purchaseHistory.forEach((purchase) => {
      const date = new Date(purchase.purchase_date);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (!monthlyData[monthYear]) monthlyData[monthYear] = 0;
      monthlyData[monthYear] += purchase.amount;
    });

    return Object.keys(monthlyData).sort().map((key) => {
      const [year, month] = key.split("-");
      return {
        month: `${new Date(year, month - 1).toLocaleString("default", { month: "short" })} ${year}`,
        revenue: monthlyData[key],
      };
    });
  }, [user]);

  const getPlanDistributionData = useMemo(() => {
    if (!user?.history?.purchaseHistory) return [];
    const planCounts = {};
    user.history.purchaseHistory.forEach((purchase) => {
      const plan = purchase.plan?.name || "Unknown";
      planCounts[plan] = (planCounts[plan] || 0) + 1;
    });
    return Object.keys(planCounts).map((plan) => ({
      name: plan,
      value: planCounts[plan],
      color: getPlanColor(plan),
    }));
  }, [user]);

  const getPaymentMethodData = useMemo(() => {
    if (!user?.history?.purchaseHistory) return [];
    const methodCounts = {};
    user.history.purchaseHistory.forEach((purchase) => {
      const method = purchase.payment_method || "Unknown";
      methodCounts[method] = (methodCounts[method] || 0) + 1;
    });
    return Object.keys(methodCounts).map((method) => ({
      name: method,
      value: methodCounts[method],
    }));
  }, [user]);

  const getPlanColor = useCallback((plan) => {
    const colors = {
      Enterprise: "#6366F1",
      Business: "#3B82F6",
      Residential: "#10B981",
      Promotional: "#F59E0B",
      Unknown: "#6B7280",
    };
    return colors[plan] || "#6B7280";
  }, []);

  const getPlanBehavior = useMemo(() => {
    if (!user?.history?.purchaseHistory) return { favoritePlan: "N/A", upgrades: 0, planChanges: 0, avgDuration: 0 };
    const planCounts = {};
    user.history.purchaseHistory.forEach((purchase) => {
      const plan = purchase.plan?.name || "Unknown";
      planCounts[plan] = (planCounts[plan] || 0) + 1;
    });
    const favoritePlan = Object.keys(planCounts).reduce(
      (a, b) => (planCounts[a] > planCounts[b] ? a : b),
      user.history.purchaseHistory[0]?.plan?.name || "N/A"
    );
    const upgrades = user.history.purchaseHistory.filter(
      (purchase, index) =>
        index > 0 &&
        purchase.amount > user.history.purchaseHistory[index - 1].amount
    ).length;

    const planChanges = user.history.purchaseHistory.length - 1;

    const durations = user.history.purchaseHistory.map((purchase) => {
      if (purchase.duration?.includes("month")) {
        return parseInt(purchase.duration) || 1;
      }
      return 1;
    });
    const avgDuration = durations.reduce((sum, dur) => sum + dur, 0) / durations.length;

    return { favoritePlan, upgrades, planChanges, avgDuration };
  }, [user]);

  const getSpendingTrend = useMemo(() => {
    if (!user?.history?.purchaseHistory || user.history.purchaseHistory.length < 2) return "stable";
    const firstPrice = user.history.purchaseHistory[0].amount;
    const lastPrice = user.history.purchaseHistory[user.history.purchaseHistory.length - 1].amount;
    return lastPrice > firstPrice ? "up" : lastPrice < firstPrice ? "down" : "stable";
  }, [user]);

  // Handlers
  const handleEditToggle = useCallback(() => {
    if (!isEditing) {
      setEditForm({
        username: user.username,
        phone: user.phonenumber,
      });
    }
    setIsEditing(!isEditing);
  }, [isEditing, user]);

  const handleEditChange = useCallback((e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleEditSubmit = useCallback(async (e) => {
    e.preventDefault();
    try {
      const response = await api.patch(`/api/user_management/profiles/${user.id}/`, {
        username: editForm.username,
        phonenumber: editForm.phone,
      });
      onUserUpdate(response.data);
      setIsEditing(false);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update client profile.");
    }
  }, [user, editForm, onUserUpdate]);

  const handleMessageChange = useCallback((e) => {
    const { name, value } = e.target;
    setMessageForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSendMessage = useCallback(async (e) => {
    e.preventDefault();
    if (!messageForm.message.trim()) {
      setError("Message content is required.");
      return;
    }

    setIsSendingMessage(true);
    try {
      await api.post(`/api/user_management/profiles/${user.id}/send-message/`, {
        ...messageForm,
        trigger_type: "manual"
      });
      
      // Refresh user data to get updated communication logs
      onRefresh();
      
      setMessageForm({ message_type: "sms", subject: "", message: "" });
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send message.");
    } finally {
      setIsSendingMessage(false);
    }
  }, [user, messageForm, onRefresh]);

  const handleDisconnect = useCallback(async () => {
    if (!user.router || !user.device || !user.active) {
      setError("No active connection to disconnect.");
      return;
    }

    setIsDisconnecting(true);
    try {
      await api.post(`/api/user_management/profiles/${user.id}/disconnect/`);
      onRefresh();
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to disconnect client.");
    } finally {
      setIsDisconnecting(false);
    }
  }, [user, onRefresh]);

  const viewPurchaseDetails = useCallback((purchase) => {
    setSelectedPurchase(purchase);
  }, []);

  const closePurchaseDetails = useCallback(() => {
    setSelectedPurchase(null);
  }, []);

  const exportToCSV = useCallback((history) => {
    if (!history?.purchaseHistory) return;
    
    const headers = ["Plan,Purchase Date,Duration,Price,Status,Payment Method,Invoice Number"];
    const rows = history.purchaseHistory.map((purchase) =>
      [
        purchase.plan?.name || "N/A",
        formatDate(purchase.purchase_date),
        purchase.duration || "N/A",
        formatCurrency(purchase.amount),
        purchase.status || "N/A",
        purchase.payment_method || "N/A",
        purchase.invoice_number || "N/A",
      ].join(",")
    );
    const csv = [...headers, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute("download", `${user.username}_subscription_history.csv`);
    a.click();
  }, [user, formatDate, formatCurrency]);

  const exportBrowsingHistoryToCSV = useCallback((visitedSites) => {
    if (!visitedSites) return;
    
    const headers = ["URL,Data Used,Frequency,Timestamp,Router,Device MAC"];
    const rows = visitedSites.map((site) =>
      [
        site.url || "N/A",
        site.data_used || "0GB",
        site.frequency || "N/A",
        formatDate(site.timestamp),
        site.router?.name || "Unknown",
        site.hotspot_user?.mac || "Unknown"
      ].join(",")
    );
    const csv = [...headers, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute("download", `${user.username}_browsing_history.csv`);
    a.click();
  }, [user, formatDate]);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'subscription', label: 'Subscription', icon: CreditCard },
    { id: 'history', label: 'History', icon: History },
    { id: 'sessions', label: 'Sessions', icon: Activity },
    { id: 'communication', label: 'Communication', icon: MessageSquare }
  ];

  return (
    <div className="space-y-6">
      {error && (
        <div className={`p-4 rounded-lg ${
          theme === "dark" ? "bg-red-900/20 text-red-300" : "bg-red-100 text-red-700"
        }`}>
          {error}
        </div>
      )}

      {/* Profile Header */}
      <div className={`rounded-xl shadow-sm border p-6 transition-colors duration-300 ${cardClass}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
              user.active 
                ? "bg-gradient-to-br from-green-100 to-teal-100"
                : "bg-gradient-to-br from-gray-100 to-gray-200"
            } ${
              theme === "dark" 
                ? user.active 
                  ? "from-green-900/20 to-teal-900/20" 
                  : "from-gray-700 to-gray-800"
                : ""
            }`}>
              <User className={
                user.active 
                  ? "text-green-600" 
                  : "text-gray-500"
              } size={28} />
            </div>
            <div>
              <h2 className={`text-xl font-bold ${
                theme === "dark" ? "text-white" : "text-gray-800"
              }`}>
                {user.username}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    user.active 
                      ? theme === "dark"
                        ? "bg-green-900/20 text-green-400"
                        : "bg-green-100 text-green-700"
                      : theme === "dark"
                        ? "bg-red-900/20 text-red-400"
                        : "bg-red-100 text-red-700"
                  }`}
                >
                  {user.active ? "Active" : "Inactive"}
                </span>
                {user.subscription ? (
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    theme === "dark" 
                      ? "bg-blue-900/20 text-blue-400" 
                      : "bg-blue-100 text-blue-700"
                  }`}>
                    {user.subscription.plan?.name} Plan
                  </span>
                ) : (
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    theme === "dark" 
                      ? "bg-yellow-900/20 text-yellow-400" 
                      : "bg-yellow-100 text-yellow-700"
                  }`}>
                    No Active Plan
                  </span>
                )}
                {user.connection_type && user.connection_type !== "none" && (
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    user.connection_type === "hotspot"
                      ? theme === "dark"
                        ? "bg-orange-900/20 text-orange-400"
                        : "bg-orange-100 text-orange-700"
                      : theme === "dark"
                      ? "bg-indigo-900/20 text-indigo-400"
                      : "bg-indigo-100 text-indigo-700"
                  }`}>
                    {user.connection_type.toUpperCase()}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {user.active && user.router && (
              <button
                onClick={handleDisconnect}
                disabled={isDisconnecting}
                className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm hover:bg-red-600 disabled:opacity-50 ${
                  theme === "dark" 
                    ? "bg-red-600 text-white hover:bg-red-700" 
                    : "bg-red-500 text-white hover:bg-red-600"
                }`}
              >
                {isDisconnecting ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <Trash2 size={16} />
                )}
                Disconnect
              </button>
            )}
            <button
              className={theme === "dark" ? "text-gray-400 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"}
              onClick={handleEditToggle}
            >
              <MoreVertical size={18} />
            </button>
          </div>
        </div>

        {/* Enhanced Connection Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {[
            { label: "Username", value: user.username, icon: User },
            { label: "Phone", value: user.phonenumber, icon: Phone },
            { 
              label: user.connection_type === "pppoe" ? "PPPoE Username" : "Device MAC", 
              value: user.device, 
              icon: HardDrive 
            },
            { label: "Location", value: user.location, icon: Shield },
            { 
              label: "Connection Type", 
              value: user.connection_type ? user.connection_type.toUpperCase() : "None", 
              icon: Wifi 
            },
            ...(user.router ? [
              { label: "Router", value: user.router.name, icon: Globe }
            ] : []),
            // Session statistics
            { label: "Total Sessions", value: user.totalSessions, icon: Activity },
            { label: "Active Sessions", value: user.activeSessions, icon: Users }
          ].map((item, index) => (
            <div key={index} className={`p-3 rounded-lg ${
              theme === "dark" ? "bg-gray-700" : "bg-gray-50"
            }`}>
              <div className={`flex items-center gap-2 ${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}>
                <item.icon size={16} />
                <span className="text-xs">{item.label}</span>
              </div>
              <p className={`font-medium mt-1 ${
                theme === "dark" ? "text-white" : "text-gray-800"
              }`}>
                {item.value || "N/A"}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className={`rounded-xl shadow-sm border overflow-hidden transition-colors duration-300 ${cardClass}`}>
        <div className={`flex border-b overflow-x-auto ${
          theme === "dark" ? "border-gray-700" : "border-gray-100"
        }`}>
          {tabs.map((tab) => {
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`flex-shrink-0 px-6 py-3 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id 
                    ? theme === "dark"
                      ? "text-blue-400 border-b-2 border-blue-400"
                      : "text-blue-600 border-b-2 border-blue-600"
                    : theme === "dark"
                      ? "text-gray-400 hover:text-gray-300"
                      : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <TabIcon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {/* Overview Tab - Enhanced */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Current Plan Summary */}
              {user.subscription ? (
                <div className={`p-6 rounded-lg ${
                  theme === "dark" 
                    ? "bg-blue-900/20" 
                    : "bg-gradient-to-r from-blue-50 to-purple-50"
                }`}>
                  <h3 className={`text-lg font-semibold mb-4 ${
                    theme === "dark" ? "text-white" : "text-gray-800"
                  }`}>
                    Current Plan Summary
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      {[
                        { label: "Plan Type", value: user.subscription.plan?.name, icon: CreditCard, color: "blue" },
                        { label: "Payment Status", value: user.paymentStatus, icon: PaymentStatusIcon, color: "purple" }
                      ].map((item, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            theme === "dark" 
                              ? `bg-${item.color}-900/20 text-${item.color}-400`
                              : `bg-${item.color}-100 text-${item.color}-600`
                          }`}>
                            {typeof item.icon === 'function' ? <item.icon status={item.value} /> : <item.icon size={18} />}
                          </div>
                          <div>
                            <p className={`text-xs ${
                              theme === "dark" ? "text-gray-400" : "text-gray-500"
                            }`}>
                              {item.label}
                            </p>
                            <p className={`font-medium capitalize ${
                              theme === "dark" ? "text-white" : "text-gray-800"
                            }`}>
                              {item.value}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-4">
                      {[
                        { label: "Start Date", value: formatDate(user.subscription.start_date), icon: CalendarDays, color: "green" },
                        { label: "Expiry Date", value: formatDate(user.subscription.expiry_date), icon: CalendarDays, color: "orange" }
                      ].map((item, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            theme === "dark" 
                              ? `bg-${item.color}-900/20 text-${item.color}-400`
                              : `bg-${item.color}-100 text-${item.color}-600`
                          }`}>
                            <item.icon size={18} />
                          </div>
                          <div>
                            <p className={`text-xs ${
                              theme === "dark" ? "text-gray-400" : "text-gray-500"
                            }`}>
                              {item.label}
                            </p>
                            <p className={`font-medium ${
                              theme === "dark" ? "text-white" : "text-gray-800"
                            }`}>
                              {item.value}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Data Usage */}
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <DataUsageIcon
                          used={user.data_usage?.used || 0}
                          total={user.data_usage?.total || 1}
                          isUnlimited={user.is_unlimited}
                        />
                        <span className={`font-medium ${
                          theme === "dark" ? "text-white" : "text-gray-800"
                        }`}>
                          Data Consumption
                        </span>
                      </div>
                      <span className={`text-sm font-medium ${
                        theme === "dark" ? "text-white" : "text-gray-800"
                      }`}>
                        {user.is_unlimited
                          ? "Unlimited"
                          : `${user.data_usage?.used || 0} ${user.data_usage?.unit || 'GB'} of ${user.data_usage?.total || 0} ${user.data_usage?.unit || 'GB'}`}
                      </span>
                    </div>
                    
                    <div className="mb-2">
                      <DataUsageBar
                        used={user.data_usage?.used || 0}
                        total={user.data_usage?.total || 1}
                        isUnlimited={user.is_unlimited}
                        theme={theme}
                      />
                    </div>
                    
                    <div className={`flex items-center justify-between text-xs ${
                      theme === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}>
                      <span>0 {user.data_usage?.unit || 'GB'}</span>
                      <span>{user.is_unlimited ? "∞" : `${user.data_usage?.total || 0} ${user.data_usage?.unit || 'GB'}`}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className={`p-6 rounded-lg ${
                  theme === "dark" ? "bg-yellow-900/20" : "bg-yellow-50"
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        theme === "dark" ? "bg-yellow-900/20 text-yellow-400" : "bg-yellow-100 text-yellow-600"
                      }`}>
                        <Zap size={18} />
                      </div>
                      <div>
                        <h3 className={`font-medium ${
                          theme === "dark" ? "text-white" : "text-gray-800"
                        }`}>
                          No Active Plan
                        </h3>
                        <p className={`text-sm ${
                          theme === "dark" ? "text-gray-400" : "text-gray-500"
                        }`}>
                          This client doesn't have an active subscription
                        </p>
                      </div>
                    </div>
                    <button className={`px-3 py-1 rounded-lg text-sm ${
                      theme === "dark" 
                        ? "bg-blue-600 text-white hover:bg-blue-700" 
                        : "bg-blue-500 text-white hover:bg-blue-600"
                    }`}>
                      Assign Plan
                    </button>
                  </div>
                </div>
              )}

              {/* Enhanced Customer Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Total Revenue", value: formatCurrency(user.total_revenue) },
                  { label: "Avg. Monthly Spend", value: formatCurrency(user.avg_monthly_spend) },
                  { label: "Renewal Frequency", value: user.renewal_frequency },
                  { label: "Loyalty Duration", value: `${user.loyalty_duration} months` },
                  { label: "Connection Type", value: user.connection_type ? user.connection_type.toUpperCase() : "None" },
                  { label: "Total Sessions", value: user.totalSessions },
                  { label: "Active Sessions", value: user.activeSessions },
                  { label: "Total Data Used", value: `${user.totalDataUsedGB?.toFixed(1) || '0'} GB` }
                ].map((stat, index) => (
                  <div key={index} className={`p-4 rounded-lg shadow-sm border transition-colors duration-300 ${cardClass}`}>
                    <p className={`text-xs ${
                      theme === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}>
                      {stat.label}
                    </p>
                    <p className={`font-medium text-lg ${
                      theme === "dark" ? "text-white" : "text-gray-800"
                    }`}>
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Subscription Tab */}
          {activeTab === 'subscription' && (
            <>
              {user.subscription ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-4">
                      {[
                        { label: "Plan Type", value: user.subscription.plan?.name, icon: CreditCard, color: "blue" },
                        { label: "Payment Status", value: user.paymentStatus, icon: PaymentStatusIcon, color: "purple" }
                      ].map((item, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            theme === "dark" 
                              ? `bg-${item.color}-900/20 text-${item.color}-400`
                              : `bg-${item.color}-100 text-${item.color}-600`
                          }`}>
                            {typeof item.icon === 'function' ? <item.icon status={item.value} /> : <item.icon size={18} />}
                          </div>
                          <div>
                            <p className={`text-xs ${
                              theme === "dark" ? "text-gray-400" : "text-gray-500"
                            }`}>
                              {item.label}
                            </p>
                            <p className={`font-medium capitalize ${
                              theme === "dark" ? "text-white" : "text-gray-800"
                            }`}>
                              {item.value}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-4">
                      {[
                        { label: "Start Date", value: formatDate(user.subscription.start_date), icon: CalendarDays, color: "green" },
                        { label: "Expiry Date", value: formatDate(user.subscription.expiry_date), icon: CalendarDays, color: "orange" }
                      ].map((item, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            theme === "dark" 
                              ? `bg-${item.color}-900/20 text-${item.color}-400`
                              : `bg-${item.color}-100 text-${item.color}-600`
                          }`}>
                            <item.icon size={18} />
                          </div>
                          <div>
                            <p className={`text-xs ${
                              theme === "dark" ? "text-gray-400" : "text-gray-500"
                            }`}>
                              {item.label}
                            </p>
                            <p className={`font-medium ${
                              theme === "dark" ? "text-white" : "text-gray-800"
                            }`}>
                              {item.value}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <DataUsageIcon
                        used={user.data_usage?.used || 0}
                        total={user.data_usage?.total || 1}
                        isUnlimited={user.is_unlimited}
                      />
                      <span className={`font-medium ${
                        theme === "dark" ? "text-white" : "text-gray-800"
                      }`}>
                        Data Consumption
                      </span>
                    </div>
                    <span className={`text-sm font-medium ${
                      theme === "dark" ? "text-white" : "text-gray-800"
                    }`}>
                      {user.is_unlimited
                        ? "Unlimited"
                        : `${user.data_usage?.used || 0} ${user.data_usage?.unit || 'GB'} of ${user.data_usage?.total || 0} ${user.data_usage?.unit || 'GB'}`}
                    </span>
                  </div>
                  
                  <div className="mb-2">
                    <DataUsageBar
                      used={user.data_usage?.used || 0}
                      total={user.data_usage?.total || 1}
                      isUnlimited={user.is_unlimited}
                      theme={theme}
                    />
                  </div>
                  
                  <div className={`flex items-center justify-between text-xs ${
                    theme === "dark" ? "text-gray-400" : "text-gray-500"
                  }`}>
                    <span>0 {user.data_usage?.unit || 'GB'}</span>
                    <span>{user.is_unlimited ? "∞" : `${user.data_usage?.total || 0} ${user.data_usage?.unit || 'GB'}`}</span>
                  </div>
                </div>
              ) : (
                <div className={`text-center py-8 ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}>
                  <CreditCard size={24} className="mx-auto mb-2 opacity-50" />
                  <p>No active subscription found</p>
                </div>
              )}
            </>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="space-y-8">
              {user.history?.purchaseHistory?.length > 0 || user.history?.visitedSites?.length > 0 ? (
                <>
                  {/* Plan Purchase Trends */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className={`font-medium mb-3 flex items-center gap-2 ${
                        theme === "dark" ? "text-gray-300" : "text-gray-700"
                      }`}>
                        <BarChart2 size={16} />
                        Annual Revenue Trend
                      </h4>
                      <div className={`h-64 p-3 rounded-lg ${
                        theme === "dark" ? "bg-gray-700" : "bg-gray-50"
                      }`}>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={getChartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === "dark" ? "#374151" : "#E5E7EB"} />
                            <XAxis dataKey="year" stroke={theme === "dark" ? "#9CA3AF" : "#6B7280"} />
                            <YAxis stroke={theme === "dark" ? "#9CA3AF" : "#6B7280"} />
                            <Tooltip 
                              formatter={(value) => [formatCurrency(value), "Revenue"]}
                              contentStyle={{
                                backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                                borderColor: theme === 'dark' ? '#374151' : '#E5E7EB',
                                color: theme === 'dark' ? '#F9FAFB' : '#1F2937'
                              }}
                            />
                            <Line
                              type="monotone"
                              dataKey="revenue"
                              stroke="#3B82F6"
                              strokeWidth={2}
                              dot={{ r: 4 }}
                              activeDot={{ r: 6 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className={`font-medium mb-3 flex items-center gap-2 ${
                        theme === "dark" ? "text-gray-300" : "text-gray-700"
                      }`}>
                        <BarChart2 size={16} />
                        Monthly Revenue Breakdown
                      </h4>
                      <div className={`h-64 p-3 rounded-lg ${
                        theme === "dark" ? "bg-gray-700" : "bg-gray-50"
                      }`}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={getMonthlyChartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === "dark" ? "#374151" : "#E5E7EB"} />
                            <XAxis dataKey="month" stroke={theme === "dark" ? "#9CA3AF" : "#6B7280"} />
                            <YAxis stroke={theme === "dark" ? "#9CA3AF" : "#6B7280"} />
                            <Tooltip 
                              formatter={(value) => [formatCurrency(value), "Revenue"]}
                              contentStyle={{
                                backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                                borderColor: theme === 'dark' ? '#374151' : '#E5E7EB',
                                color: theme === 'dark' ? '#F9FAFB' : '#1F2937'
                              }}
                            />
                            <Bar dataKey="revenue" fill="#8884d8" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* Plan Distribution */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className={`font-medium mb-3 flex items-center gap-2 ${
                        theme === "dark" ? "text-gray-300" : "text-gray-700"
                      }`}>
                        <Package size={16} />
                        Plan Distribution
                      </h4>
                      <div className={`h-64 p-3 rounded-lg ${
                        theme === "dark" ? "bg-gray-700" : "bg-gray-50"
                      }`}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={getPlanDistributionData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                              {getPlanDistributionData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip 
                              formatter={(value, name) => [`${value} purchases`, name]}
                              contentStyle={{
                                backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                                borderColor: theme === 'dark' ? '#374151' : '#E5E7EB',
                                color: theme === 'dark' ? '#F9FAFB' : '#1F2937'
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className={`font-medium mb-3 flex items-center gap-2 ${
                        theme === "dark" ? "text-gray-300" : "text-gray-700"
                      }`}>
                        <CreditCard size={16} />
                        Payment Methods
                      </h4>
                      <div className={`h-64 p-3 rounded-lg ${
                        theme === "dark" ? "bg-gray-700" : "bg-gray-50"
                      }`}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={getPaymentMethodData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                              {getPaymentMethodData.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={["#6366F1", "#3B82F6", "#10B981", "#F59E0B"][index % 4]}
                                />
                              ))}
                            </Pie>
                            <Tooltip 
                              formatter={(value, name) => [`${value} purchases`, name]}
                              contentStyle={{
                                backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                                borderColor: theme === 'dark' ? '#374151' : '#E5E7EB',
                                color: theme === 'dark' ? '#F9FAFB' : '#1F2937'
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* Plan Behavior Insights */}
                  <div>
                    <h4 className={`font-medium mb-3 flex items-center gap-2 ${
                      theme === "dark" ? "text-gray-300" : "text-gray-700"
                    }`}>
                      <TrendingUp size={16} />
                      Plan Behavior Insights
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { label: "Favorite Plan", value: getPlanBehavior.favoritePlan },
                        { label: "Number of Upgrades", value: getPlanBehavior.upgrades },
                        { label: "Plan Changes", value: getPlanBehavior.planChanges },
                        { label: "Avg. Plan Duration", value: `${getPlanBehavior.avgDuration.toFixed(1)} months` }
                      ].map((stat, index) => (
                        <div key={index} className={`p-3 rounded-lg ${
                          theme === "dark" ? "bg-gray-700" : "bg-gray-50"
                        }`}>
                          <p className={`text-xs ${
                            theme === "dark" ? "text-gray-400" : "text-gray-500"
                          }`}>
                            {stat.label}
                          </p>
                          <p className={`font-medium ${
                            theme === "dark" ? "text-white" : "text-gray-800"
                          }`}>
                            {stat.value}
                          </p>
                        </div>
                      ))}
                    </div>
                    
                    <div className={`mt-4 p-3 rounded-lg ${
                      theme === "dark" ? "bg-gray-700" : "bg-gray-50"
                    }`}>
                      <div className="flex items-center gap-2">
                        <p className={`text-xs ${
                          theme === "dark" ? "text-gray-400" : "text-gray-500"
                        }`}>
                          Spending Trend:
                        </p>
                        {getSpendingTrend === "up" ? (
                          <div className="flex items-center text-green-500">
                            <TrendingUp size={16} />
                            <span className="ml-1">Increasing</span>
                          </div>
                        ) : getSpendingTrend === "down" ? (
                          <div className="flex items-center text-red-500">
                            <TrendingDown size={16} />
                            <span className="ml-1">Decreasing</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-gray-500">
                            <Circle size={16} />
                            <span className="ml-1">Stable</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Browsing History */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className={`font-medium flex items-center gap-2 ${
                        theme === "dark" ? "text-gray-300" : "text-gray-700"
                      }`}>
                        <Globe size={16} />
                        Browsing History
                      </h4>
                      <button
                        className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm ${
                          theme === "dark" 
                            ? "bg-blue-600 text-white hover:bg-blue-700" 
                            : "bg-blue-500 text-white hover:bg-blue-600"
                        }`}
                        onClick={() => exportBrowsingHistoryToCSV(user.history.visitedSites)}
                      >
                        <Download size={14} />
                        Export
                      </button>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className={theme === "dark" ? "bg-gray-700" : "bg-gray-100"}>
                            {["URL", "Data Used", "Frequency", "Timestamp", "Router", "Device"].map((header) => (
                              <th key={header} className={`p-2 text-left ${
                                theme === "dark" ? "text-gray-300" : "text-gray-600"
                              }`}>
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {user.history.visitedSites && user.history.visitedSites.length > 0 ? (
                            user.history.visitedSites.map((site, index) => (
                              <tr key={index} className={`border-b ${
                                theme === "dark" 
                                  ? "border-gray-700 hover:bg-gray-700" 
                                  : "border-gray-200 hover:bg-gray-50"
                              }`}>
                                <td className="p-2">
                                  <a
                                    href={site.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:underline"
                                  >
                                    {site.url.length > 30 ? `${site.url.substring(0, 27)}...` : site.url}
                                  </a>
                                </td>
                                <td className={`p-2 ${
                                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                                }`}>
                                  {site.data_used || "0GB"}
                                </td>
                                <td className={`p-2 ${
                                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                                }`}>
                                  {site.frequency || "N/A"}
                                </td>
                                <td className={`p-2 ${
                                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                                }`}>
                                  {formatDate(site.timestamp)}
                                </td>
                                <td className={`p-2 ${
                                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                                }`}>
                                  {site.router?.name || "Unknown"}
                                </td>
                                <td className={`p-2 ${
                                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                                }`}>
                                  {site.hotspot_user?.mac || "Unknown"}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={6} className={`p-4 text-center ${
                                theme === "dark" ? "text-gray-400" : "text-gray-500"
                              }`}>
                                No browsing history found
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Purchase History */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className={`font-medium flex items-center gap-2 ${
                        theme === "dark" ? "text-gray-300" : "text-gray-700"
                      }`}>
                        <History size={16} />
                        Detailed Purchase History
                      </h4>
                      <div className="flex items-center gap-2">
                        <select
                          className={`border rounded-lg px-2 py-1 text-sm ${
                            theme === "dark" 
                              ? "bg-gray-700 border-gray-600 text-white" 
                              : "border-gray-200"
                          }`}
                          value={filterYear}
                          onChange={(e) => setFilterYear(e.target.value)}
                        >
                          <option value="All">All Years</option>
                          {[
                            ...new Set(
                              user.history.purchaseHistory.map((p) =>
                                new Date(p.purchase_date).getFullYear()
                              )
                            ),
                          ]
                            .sort((a, b) => b - a)
                            .map((year) => (
                              <option key={year} value={year}>
                                {year}
                              </option>
                            ))}
                        </select>
                        <button
                          className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm ${
                            theme === "dark" 
                              ? "bg-blue-600 text-white hover:bg-blue-700" 
                              : "bg-blue-500 text-white hover:bg-blue-600"
                          }`}
                          onClick={() => exportToCSV(user.history)}
                        >
                          <Download size={14} />
                          Export
                        </button>
                      </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className={theme === "dark" ? "bg-gray-700" : "bg-gray-100"}>
                            {["Plan", "Purchase Date", "Duration", "Price", "Status", "Details"].map((header) => (
                              <th key={header} className={`p-2 text-left ${
                                theme === "dark" ? "text-gray-300" : "text-gray-600"
                              }`}>
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {getFilteredPurchaseHistory.map((purchase, index) => (
                            <tr
                              key={index}
                              className={`border-b cursor-pointer ${
                                theme === "dark" 
                                  ? "border-gray-700 hover:bg-gray-700" 
                                  : "border-gray-200 hover:bg-gray-50"
                              }`}
                              onClick={() => viewPurchaseDetails(purchase)}
                            >
                              <td className="p-2">
                                <div className="flex items-center gap-2">
                                  <div
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: getPlanColor(purchase.plan?.name) }}
                                  ></div>
                                  <span className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>
                                    {purchase.plan?.name || "N/A"}
                                  </span>
                                </div>
                              </td>
                              <td className={`p-2 ${
                                theme === "dark" ? "text-gray-300" : "text-gray-700"
                              }`}>
                                {formatDate(purchase.purchase_date)}
                              </td>
                              <td className={`p-2 ${
                                theme === "dark" ? "text-gray-300" : "text-gray-700"
                              }`}>
                                {purchase.duration || "N/A"}
                              </td>
                              <td className={`p-2 font-medium ${
                                theme === "dark" ? "text-white" : "text-gray-800"
                              }`}>
                                {formatCurrency(purchase.amount)}
                              </td>
                              <td className="p-2">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs ${
                                    purchase.status === "Active"
                                      ? theme === "dark"
                                        ? "bg-green-900/20 text-green-400"
                                        : "bg-green-100 text-green-700"
                                      : theme === "dark"
                                        ? "bg-red-900/20 text-red-400"
                                        : "bg-red-100 text-red-700"
                                  }`}
                                >
                                  {purchase.status || "N/A"}
                                </span>
                              </td>
                              <td className="p-2">
                                <button className="text-blue-500 hover:text-blue-700">
                                  <Eye size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : (
                <div className={`text-center py-8 ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}>
                  <Package size={24} className="mx-auto mb-2 opacity-50" />
                  <p>No history found</p>
                </div>
              )}
            </div>
          )}

          {/* Sessions Tab */}
          {activeTab === 'sessions' && (
            <SessionHistory 
              sessions={user.sessionHistory} 
              theme={theme} 
            />
          )}

          {/* Communication Tab */}
          {activeTab === 'communication' && (
            <div className="space-y-6">
              {/* Send Message Form */}
              <div className={`p-4 rounded-lg ${
                theme === "dark" ? "bg-gray-700" : "bg-gray-50"
              }`}>
                <h4 className={`font-medium mb-3 ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}>
                  Send Message
                </h4>
                <form onSubmit={handleSendMessage} className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className={`block text-sm mb-1 ${
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      }`}>
                        Message Type
                      </label>
                      <select
                        name="message_type"
                        value={messageForm.message_type}
                        onChange={handleMessageChange}
                        className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${inputClass}`}
                      >
                        <option value="sms">SMS</option>
                        <option value="email">Email</option>
                        <option value="system">System Notification</option>
                      </select>
                    </div>
                    {messageForm.message_type === 'email' && (
                      <div className="md:col-span-2">
                        <label className={`block text-sm mb-1 ${
                          theme === "dark" ? "text-gray-400" : "text-gray-600"
                        }`}>
                          Subject
                        </label>
                        <input
                          type="text"
                          name="subject"
                          value={messageForm.subject}
                          onChange={handleMessageChange}
                          className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${inputClass}`}
                          placeholder="Email subject"
                        />
                      </div>
                    )}
                  </div>
                  <div>
                    <label className={`block text-sm mb-1 ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}>
                      Message
                    </label>
                    <textarea
                      name="message"
                      value={messageForm.message}
                      onChange={handleMessageChange}
                      rows={3}
                      className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${inputClass}`}
                      placeholder="Type your message here..."
                      required
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSendingMessage}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg disabled:opacity-50 ${
                        theme === "dark" 
                          ? "bg-blue-600 text-white hover:bg-blue-700" 
                          : "bg-blue-500 text-white hover:bg-blue-600"
                      }`}
                    >
                      {isSendingMessage ? (
                        <FaSpinner className="animate-spin" />
                      ) : (
                        <Send size={16} />
                      )}
                      Send Message
                    </button>
                  </div>
                </form>
              </div>

              {/* Communication Log */}
              <div>
                <h4 className={`font-medium mb-3 ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}>
                  Communication History
                </h4>
                {user.communication_logs && user.communication_logs.length > 0 ? (
                  <div className="space-y-3">
                    {user.communication_logs.map((log) => (
                      <div key={log.id} className={`p-4 rounded-lg border transition-colors duration-300 ${cardClass}`}>
                        <div className="flex items-start gap-3">
                          <MessageTypeIcon type={log.message_type} />
                          <div className="flex-1">
                            <p className={`font-medium ${
                              theme === "dark" ? "text-white" : "text-gray-800"
                            }`}>
                              {log.subject || log.trigger_display}
                            </p>
                            <p className={`text-sm ${
                              theme === "dark" ? "text-gray-400" : "text-gray-500"
                            }`}>
                              {formatDate(log.formatted_timestamp)}
                            </p>
                            <div className="mt-1">
                              <StatusBadge status={log.status} theme={theme} />
                            </div>
                            <p className={`mt-2 ${
                              theme === "dark" ? "text-gray-300" : "text-gray-700"
                            }`}>
                              {log.message}
                            </p>
                            {log.router && (
                              <p className={`text-sm ${
                                theme === "dark" ? "text-gray-400" : "text-gray-500"
                              } mt-1`}>
                                Router: {log.router.name}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={`text-center py-8 ${
                    theme === "dark" ? "text-gray-400" : "text-gray-500"
                  }`}>
                    <MessageSquare size={24} className="mx-auto mb-2 opacity-50" />
                    <p>No communication history</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`rounded-xl max-w-md w-full p-6 ${
            theme === "dark" ? "bg-gray-800" : "bg-white"
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-bold ${
                theme === "dark" ? "text-white" : "text-gray-800"
              }`}>
                Edit Client Profile
              </h3>
              <button
                onClick={handleEditToggle}
                className={theme === "dark" ? "text-gray-400 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className={`block text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}>
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={editForm.username}
                  onChange={handleEditChange}
                  className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${inputClass}`}
                  required
                />
              </div>
              <div>
                <label className={`block text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}>
                  Phone Number
                </label>
                <input
                  type="text"
                  name="phone"
                  value={editForm.phone}
                  onChange={handleEditChange}
                  className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${inputClass}`}
                  pattern="(\+254|0)[0-9]{9}"
                  title="Phone number must be in the format +254XXXXXXXXX or 07XXXXXXXX"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleEditToggle}
                  className={`px-4 py-2 rounded-lg ${
                    theme === "dark" 
                      ? "bg-gray-700 text-white hover:bg-gray-600" 
                      : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 rounded-lg ${
                    theme === "dark" 
                      ? "bg-blue-600 text-white hover:bg-blue-700" 
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  }`}
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Purchase Details Modal */}
      {selectedPurchase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto ${
            theme === "dark" ? "bg-gray-800" : "bg-white"
          }`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-bold ${
                  theme === "dark" ? "text-white" : "text-gray-800"
                }`}>
                  Purchase Details
                </h3>
                <button
                  onClick={closePurchaseDetails}
                  className={theme === "dark" ? "text-gray-400 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <p className={`text-sm ${
                    theme === "dark" ? "text-gray-400" : "text-gray-500"
                  }`}>
                    Plan
                  </p>
                  <p className={`font-medium ${
                    theme === "dark" ? "text-white" : "text-gray-800"
                  }`}>
                    {selectedPurchase.plan?.name || "N/A"}
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className={`text-sm ${
                      theme === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}>
                      Purchase Date
                    </p>
                    <p className={`font-medium ${
                      theme === "dark" ? "text-white" : "text-gray-800"
                    }`}>
                      {formatDate(selectedPurchase.purchase_date)}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${
                      theme === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}>
                      Duration
                    </p>
                    <p className={`font-medium ${
                      theme === "dark" ? "text-white" : "text-gray-800"
                    }`}>
                      {selectedPurchase.duration || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className={`text-sm ${
                      theme === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}>
                      Price
                    </p>
                    <p className={`font-medium ${
                      theme === "dark" ? "text-white" : "text-gray-800"
                    }`}>
                      {formatCurrency(selectedPurchase.amount)}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${
                      theme === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}>
                      Status
                    </p>
                    <p className="font-medium">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          selectedPurchase.status === "Active"
                            ? theme === "dark"
                              ? "bg-green-900/20 text-green-400"
                              : "bg-green-100 text-green-700"
                            : theme === "dark"
                              ? "bg-red-900/20 text-red-400"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {selectedPurchase.status || "N/A"}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className={`text-sm ${
                      theme === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}>
                      Payment Method
                    </p>
                    <p className={`font-medium ${
                      theme === "dark" ? "text-white" : "text-gray-800"
                    }`}>
                      {selectedPurchase.payment_method || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${
                      theme === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}>
                      Invoice Number
                    </p>
                    <p className={`font-medium ${
                      theme === "dark" ? "text-white" : "text-gray-800"
                    }`}>
                      {selectedPurchase.invoice_number || "N/A"}
                    </p>
                  </div>
                </div>
                {selectedPurchase.status === "Expired" && (
                  <div className={`mt-4 p-3 rounded-lg ${
                    theme === "dark" ? "bg-yellow-900/20" : "bg-yellow-50"
                  }`}>
                    <div className="flex items-center gap-2 text-yellow-600">
                      <AlertTriangle size={16} />
                      <p className="text-sm">
                        This plan expired on {formatDate(user.subscription?.expiry_date)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={closePurchaseDetails}
                  className={`px-4 py-2 rounded-lg ${
                    theme === "dark" 
                      ? "bg-blue-600 text-white hover:bg-blue-700" 
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  }`}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientProfile;