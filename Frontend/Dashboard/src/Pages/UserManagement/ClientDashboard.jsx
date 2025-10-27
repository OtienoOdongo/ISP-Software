

// import React, { useState, useEffect, useMemo, useCallback } from "react";
// import {
//   Eye,
//   Phone,
//   Wifi,
//   CalendarDays,
//   CheckCircle2,
//   AlertTriangle,
//   Clock,
//   User,
//   ChevronRight,
//   ChevronLeft,
//   HardDrive,
//   BatteryFull,
//   BatteryMedium,
//   BatteryLow,
//   CreditCard,
//   Shield,
//   Zap,
//   BarChart2,
//   ChevronDown,
//   ChevronUp,
//   MoreVertical,
//   BadgeCheck,
//   User as UserIcon,
//   History,
//   Globe,
//   Package,
//   Download,
//   ArrowUpRight,
//   ArrowDownRight,
//   TrendingUp,
//   TrendingDown,
//   Circle,
//   MessageSquare,
//   Send,
//   Mail,
//   Bell,
//   Power
// } from "lucide-react";
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
// import api from "../../api";
// import { useAuth } from "../../context/AuthContext";
// import { useTheme } from "../../context/ThemeContext";
// import { FaSpinner } from "react-icons/fa";

// // Memoized components to prevent unnecessary re-renders
// const DataUsageBar = React.memo(({ used, total, isUnlimited }) => {
//   if (isUnlimited) {
//     return (
//       <div className="w-full bg-gradient-to-r from-purple-100 to-blue-100 rounded-full h-3 relative overflow-hidden dark:from-purple-900 dark:to-blue-900">
//         <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-blue-500 to-teal-400 opacity-70 animate-pulse rounded-full dark:from-purple-600 dark:via-blue-600 dark:to-teal-600"></div>
//       </div>
//     );
//   }

//   const percentage = Math.min((used / parseFloat(total || 1)) * 100, 100);
//   let colorClass = "bg-green-500 dark:bg-green-600";
//   if (percentage > 80) colorClass = "bg-yellow-500 dark:bg-yellow-600";
//   if (percentage > 95) colorClass = "bg-red-500 dark:bg-red-600";

//   return (
//     <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden dark:bg-gray-700">
//       <div
//         className={`${colorClass} h-3 rounded-full transition-all duration-500`}
//         style={{ width: `${percentage}%` }}
//       ></div>
//     </div>
//   );
// });

// const DataUsageIcon = React.memo(({ used, total, isUnlimited }) => {
//   if (isUnlimited) return <Zap className="text-purple-500 dark:text-purple-400" size={18} />;
//   const percentage = used / parseFloat(total || 1);
//   if (percentage < 0.3) return <BatteryFull className="text-green-500 dark:text-green-400" size={18} />;
//   if (percentage < 0.7) return <BatteryMedium className="text-yellow-500 dark:text-yellow-400" size={18} />;
//   return <BatteryLow className="text-red-500 dark:text-red-400" size={18} />;
// });

// const PaymentStatusIcon = React.memo(({ status }) => {
//   switch (status) {
//     case "Paid":
//       return <BadgeCheck className="text-green-500 dark:text-green-400" size={18} />;
//     case "Due":
//       return <Clock className="text-yellow-500 dark:text-yellow-400" size={18} />;
//     case "Expired":
//       return <AlertTriangle className="text-red-500 dark:text-red-400" size={18} />;
//     default:
//       return <CreditCard className="text-gray-500 dark:text-gray-400" size={18} />;
//   }
// });

// const MessageTypeIcon = React.memo(({ type }) => {
//   switch (type) {
//     case "sms":
//       return <MessageSquare className="text-blue-500 dark:text-blue-400" size={16} />;
//     case "email":
//       return <Mail className="text-green-500 dark:text-green-400" size={16} />;
//     case "system":
//       return <Bell className="text-purple-500 dark:text-purple-400" size={16} />;
//     default:
//       return <MessageSquare className="text-gray-500 dark:text-gray-400" size={16} />;
//   }
// });

// const StatusBadge = React.memo(({ status }) => {
//   let bgColor = "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
//   if (status === "delivered") bgColor = "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
//   if (status === "failed") bgColor = "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
  
//   return (
//     <span className={`px-2 py-1 rounded-full text-xs ${bgColor}`}>
//       {status.charAt(0).toUpperCase() + status.slice(1)}
//     </span>
//   );
// });

// const ClientDashboard = () => {
//   const { isAuthenticated, authLoading } = useAuth();
//   const { theme } = useTheme();
//   const today = useMemo(() => new Date(), []);
  
//   // State management with useMemo for derived data
//   const [users, setUsers] = useState([]);
//   const [filteredUsers, setFilteredUsers] = useState([]);
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [expandedSection, setExpandedSection] = useState(null);
//   const [filterYear, setFilterYear] = useState("All");
//   const [selectedPurchase, setSelectedPurchase] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [isEditing, setIsEditing] = useState(false);
//   const [editForm, setEditForm] = useState({ username: "", phone: "" });
//   const [currentPage, setCurrentPage] = useState(1);
//   const [usersPerPage] = useState(3);
//   const [activeFilter, setActiveFilter] = useState("all");
//   const [activeTab, setActiveTab] = useState("overview");
//   const [messageForm, setMessageForm] = useState({ message_type: "sms", subject: "", message: "" });
//   const [isSendingMessage, setIsSendingMessage] = useState(false);
//   const [isDisconnecting, setIsDisconnecting] = useState(false);

//   // Memoized enriched user data
//   const enrichUser = useCallback((user) => {
//     const expiry = user.subscription?.expiry_date ? new Date(user.subscription.expiry_date) : null;
//     const paymentStatus = expiry ? 
//       (today < expiry ? "Paid" : today.toDateString() === expiry.toDateString() ? "Due" : "Expired") : 
//       "No Plan";

//     const isUnlimited = user.data_usage?.total === "unlimited";
//     const active = isUnlimited || (user.data_usage?.used < parseFloat(user.data_usage?.total || 0));

//     const totalRevenue = user.history?.purchaseHistory?.reduce(
//       (sum, purchase) => sum + purchase.amount,
//       0
//     ) || 0;

//     const renewalFrequency = user.history?.purchaseHistory?.length > 1 ?
//       `${user.history.purchaseHistory.length} renewals` : "No renewals";

//     const firstPurchase = user.history?.purchaseHistory?.length > 0 ?
//       new Date(user.history.purchaseHistory[user.history.purchaseHistory.length - 1]?.purchase_date) : null;
    
//     const monthsActive = firstPurchase ?
//       (today.getFullYear() - firstPurchase.getFullYear()) * 12 +
//       (today.getMonth() - firstPurchase.getMonth()) + 1 : 0;
    
//     const avgMonthlySpend = totalRevenue / Math.max(monthsActive, 1);

//     const loyaltyDuration = firstPurchase ? 
//       Math.floor((today - firstPurchase) / (1000 * 60 * 60 * 24 * 30)) : 0;

//     return {
//       ...user,
//       paymentStatus,
//       active,
//       isUnlimited,
//       totalRevenue,
//       renewalFrequency,
//       avgMonthlySpend,
//       loyaltyDuration,
//       hasPlan: !!user.subscription
//     };
//   }, [today]);

//   // Fetch users on mount
//   useEffect(() => {
//     const fetchUsers = async () => {
//       if (!isAuthenticated) {
//         setError("Please log in to view client profiles.");
//         setIsLoading(false);
//         return;
//       }

//       try {
//         setIsLoading(true);
//         let allUsers = [];
//         let nextUrl = "/api/user_management/profiles/?page_size=50";

//         while (nextUrl) {
//           const response = await api.get(nextUrl);
//           const usersData = response.data.results || response.data;
//           allUsers = [...allUsers, ...usersData];
//           nextUrl = response.data.next;
//         }

//         const enrichedUsers = allUsers.map(enrichUser);
//         setUsers(enrichedUsers);
//         setSelectedUser(enrichedUsers[0] || null);
//         setError(null);
//       } catch (err) {
//         setError(err.response?.data?.error || "Failed to load clients.");
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     if (!authLoading && isAuthenticated) {
//       fetchUsers();
//     }
//   }, [isAuthenticated, authLoading, enrichUser]);

//   // Filter users based on active status
//   useEffect(() => {
//     let filtered = users;
//     if (activeFilter === 'active') {
//       filtered = users.filter(user => user.active);
//     } else if (activeFilter === 'inactive') {
//       filtered = users.filter(user => !user.active);
//     }
//     setFilteredUsers(filtered);
//     setCurrentPage(1);
//   }, [users, activeFilter]);

//   // Pagination logic
//   const indexOfLastUser = currentPage * usersPerPage;
//   const indexOfFirstUser = indexOfLastUser - usersPerPage;
//   const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
//   const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

//   const paginate = (pageNumber) => setCurrentPage(pageNumber);

//   // Memoized handlers
//   const handleView = useCallback(async (user) => {
//     try {
//       const response = await api.get(`/api/user_management/profiles/${user.id}/`);
//       const enrichedUser = enrichUser(response.data);
//       setSelectedUser(enrichedUser);
//       setExpandedSection(null);
//       setFilterYear("All");
//       setSelectedPurchase(null);
//       setActiveTab("overview");
//       setError(null);
//     } catch (err) {
//       setError(err.response?.data?.error || "Failed to load client profile.");
//     }
//   }, [enrichUser]);

//   const handleEditToggle = useCallback(() => {
//     if (!isEditing) {
//       setEditForm({
//         username: selectedUser.username,
//         phone: selectedUser.phonenumber,
//       });
//     }
//     setIsEditing(!isEditing);
//   }, [isEditing, selectedUser]);

//   const handleEditChange = useCallback((e) => {
//     const { name, value } = e.target;
//     setEditForm((prev) => ({ ...prev, [name]: value }));
//   }, []);

//   const handleEditSubmit = useCallback(async (e) => {
//     e.preventDefault();
//     try {
//       const response = await api.patch(`/api/user_management/profiles/${selectedUser.id}/`, {
//         username: editForm.username,
//         phonenumber: editForm.phone,
//       });
//       const enrichedUser = enrichUser(response.data);
//       setUsers((prev) =>
//         prev.map((u) => (u.id === selectedUser.id ? enrichedUser : u))
//       );
//       setSelectedUser(enrichedUser);
//       setIsEditing(false);
//       setError(null);
//     } catch (err) {
//       setError(err.response?.data?.error || "Failed to update client profile.");
//     }
//   }, [selectedUser, editForm, enrichUser]);

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
//       const response = await api.post(`/api/user_management/profiles/${selectedUser.id}/send-message/`, {
//         ...messageForm,
//         trigger_type: "manual"
//       });
      
//       const userResponse = await api.get(`/api/user_management/profiles/${selectedUser.id}/`);
//       const enrichedUser = enrichUser(userResponse.data);
//       setSelectedUser(enrichedUser);
      
//       setMessageForm({ message_type: "sms", subject: "", message: "" });
//       setError(null);
//     } catch (err) {
//       setError(err.response?.data?.error || "Failed to send message.");
//     } finally {
//       setIsSendingMessage(false);
//     }
//   }, [selectedUser, messageForm, enrichUser]);

//   const handleDisconnectHotspot = useCallback(async () => {
//     if (!selectedUser.router || !selectedUser.device || !selectedUser.active) {
//       setError("No active hotspot connection to disconnect.");
//       return;
//     }

//     setIsDisconnecting(true);
//     try {
//       const response = await api.post(`/api/user_management/profiles/${selectedUser.id}/disconnect-hotspot/`);
//       const userResponse = await api.get(`/api/user_management/profiles/${selectedUser.id}/`);
//       const enrichedUser = enrichUser(userResponse.data);
//       setSelectedUser(enrichedUser);
//       setUsers((prev) =>
//         prev.map((u) => (u.id === selectedUser.id ? enrichedUser : u))
//       );
//       setError(null);
//     } catch (err) {
//       setError(err.response?.data?.error || "Failed to disconnect client from hotspot.");
//     } finally {
//       setIsDisconnecting(false);
//     }
//   }, [selectedUser, enrichUser]);

//   const toggleSection = useCallback((section) => {
//     setExpandedSection(expandedSection === section ? null : section);
//     setSelectedPurchase(null);
//   }, [expandedSection]);

//   // Memoized utility functions
//   const formatDate = useCallback((dateString) => {
//     if (!dateString) return "N/A";
//     const options = { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" };
//     return new Date(dateString).toLocaleDateString(undefined, options);
//   }, []);

//   const formatCurrency = useCallback((amount) => {
//     return new Intl.NumberFormat("en-US", {
//       style: "currency",
//       currency: "KES",
//       minimumFractionDigits: 0,
//       maximumFractionDigits: 0,
//     }).format(amount);
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
//     a.setAttribute("download", `${selectedUser.username}_subscription_history.csv`);
//     a.click();
//   }, [selectedUser, formatDate, formatCurrency]);

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
//     a.setAttribute("download", `${selectedUser.username}_browsing_history.csv`);
//     a.click();
//   }, [selectedUser, formatDate]);

//   // Memoized data processing functions
//   const getFilteredPurchaseHistory = useMemo(() => {
//     if (!selectedUser?.history?.purchaseHistory) return [];
//     if (filterYear === "All") return selectedUser.history.purchaseHistory;
//     return selectedUser.history.purchaseHistory.filter(
//       (purchase) => new Date(purchase.purchase_date).getFullYear().toString() === filterYear
//     );
//   }, [selectedUser, filterYear]);

//   const getChartData = useMemo(() => {
//     if (!selectedUser?.history?.purchaseHistory) return [];
//     const purchasesByYear = {};
//     selectedUser.history.purchaseHistory.forEach((purchase) => {
//       const year = new Date(purchase.purchase_date).getFullYear();
//       if (!purchasesByYear[year]) purchasesByYear[year] = 0;
//       purchasesByYear[year] += purchase.amount;
//     });
//     return Object.keys(purchasesByYear).sort((a, b) => a - b).map((year) => ({
//       year,
//       revenue: purchasesByYear[year],
//     }));
//   }, [selectedUser]);

//   const getMonthlyChartData = useMemo(() => {
//     if (!selectedUser?.history?.purchaseHistory) return [];
//     const monthlyData = {};
//     selectedUser.history.purchaseHistory.forEach((purchase) => {
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
//   }, [selectedUser]);

//   const getPlanDistributionData = useMemo(() => {
//     if (!selectedUser?.history?.purchaseHistory) return [];
//     const planCounts = {};
//     selectedUser.history.purchaseHistory.forEach((purchase) => {
//       const plan = purchase.plan?.name || "Unknown";
//       planCounts[plan] = (planCounts[plan] || 0) + 1;
//     });
//     return Object.keys(planCounts).map((plan) => ({
//       name: plan,
//       value: planCounts[plan],
//       color: getPlanColor(plan),
//     }));
//   }, [selectedUser]);

//   const getPaymentMethodData = useMemo(() => {
//     if (!selectedUser?.history?.purchaseHistory) return [];
//     const methodCounts = {};
//     selectedUser.history.purchaseHistory.forEach((purchase) => {
//       const method = purchase.payment_method || "Unknown";
//       methodCounts[method] = (methodCounts[method] || 0) + 1;
//     });
//     return Object.keys(methodCounts).map((method) => ({
//       name: method,
//       value: methodCounts[method],
//     }));
//   }, [selectedUser]);

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
//     if (!selectedUser?.history?.purchaseHistory) return { favoritePlan: "N/A", upgrades: 0, planChanges: 0, avgDuration: 0 };
//     const planCounts = {};
//     selectedUser.history.purchaseHistory.forEach((purchase) => {
//       const plan = purchase.plan?.name || "Unknown";
//       planCounts[plan] = (planCounts[plan] || 0) + 1;
//     });
//     const favoritePlan = Object.keys(planCounts).reduce(
//       (a, b) => (planCounts[a] > planCounts[b] ? a : b),
//       selectedUser.history.purchaseHistory[0]?.plan?.name || "N/A"
//     );
//     const upgrades = selectedUser.history.purchaseHistory.filter(
//       (purchase, index) =>
//         index > 0 &&
//         purchase.amount > selectedUser.history.purchaseHistory[index - 1].amount
//     ).length;

//     const planChanges = selectedUser.history.purchaseHistory.length - 1;

//     const durations = selectedUser.history.purchaseHistory.map((purchase) => {
//       if (purchase.duration?.includes("month")) {
//         return parseInt(purchase.duration) || 1;
//       }
//       return 1;
//     });
//     const avgDuration = durations.reduce((sum, dur) => sum + dur, 0) / durations.length;

//     return { favoritePlan, upgrades, planChanges, avgDuration };
//   }, [selectedUser]);

//   const getSpendingTrend = useMemo(() => {
//     if (!selectedUser?.history?.purchaseHistory || selectedUser.history.purchaseHistory.length < 2) return "stable";
//     const firstPrice = selectedUser.history.purchaseHistory[0].amount;
//     const lastPrice = selectedUser.history.purchaseHistory[selectedUser.history.purchaseHistory.length - 1].amount;
//     return lastPrice > firstPrice ? "up" : lastPrice < firstPrice ? "down" : "stable";
//   }, [selectedUser]);

//   const viewPurchaseDetails = useCallback((purchase) => {
//     setSelectedPurchase(purchase);
//   }, []);

//   const closePurchaseDetails = useCallback(() => {
//     setSelectedPurchase(null);
//   }, []);

//   if (authLoading || isLoading) {
//     return (
//       <div className="p-8 max-w-7xl mx-auto flex justify-center items-center min-h-screen">
//         <FaSpinner className="animate-spin text-4xl text-blue-600 dark:text-blue-400" />
//       </div>
//     );
//   }

//   if (!isAuthenticated) {
//     return (
//       <div className="p-8 max-w-7xl mx-auto">
//         <p className="text-center text-red-500 dark:text-red-400">Please log in to access client profiles.</p>
//       </div>
//     );
//   }

//   return (
//     <div className="p-4 md:p-8 max-w-7xl mx-auto theme-transition">
//       {error && (
//         <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg dark:bg-red-900 dark:text-red-300">{error}</div>
//       )}
//       <div className="flex items-center justify-between mb-8">
//         <div>
//           <h1 className="text-xl md:text-3xl font-bold text-gray-800 dark:text-white">Client Dashboard</h1>
//           <p className="text-gray-500 dark:text-gray-400">Monitor and manage client profiles, subscriptions, and communications</p>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* User List */}
//         <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden dark:bg-gray-800 dark:border-gray-700">
//           <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
//             <h2 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
//               <UserIcon className="text-blue-500 dark:text-blue-400" size={18} />
//               Clients ({filteredUsers.filter((u) => u.active).length}/{filteredUsers.length})
//             </h2>
//             <div className="flex space-x-1">
//               <button
//                 onClick={() => setActiveFilter('all')}
//                 className={`px-2 py-1 text-xs rounded-md ${activeFilter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}
//               >
//                 All
//               </button>
//               <button
//                 onClick={() => setActiveFilter('active')}
//                 className={`px-2 py-1 text-xs rounded-md ${activeFilter === 'active' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}
//               >
//                 Active
//               </button>
//               <button
//                 onClick={() => setActiveFilter('inactive')}
//                 className={`px-2 py-1 text-xs rounded-md ${activeFilter === 'inactive' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}
//               >
//                 Inactive
//               </button>
//             </div>
//           </div>
//           <div className="divide-y divide-gray-100 dark:divide-gray-700">
//             {currentUsers.length > 0 ? (
//               currentUsers.map((user) => (
//                 <div
//                   key={user.id}
//                   className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors dark:hover:bg-gray-700 ${
//                     selectedUser?.id === user.id ? "bg-blue-50 dark:bg-blue-900/20" : ""
//                   }`}
//                   onClick={() => handleView(user)}
//                 >
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center gap-3">
//                       <div
//                         className={`w-10 h-10 rounded-full flex items-center justify-center ${
//                           user.active ? "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400" : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
//                         }`}
//                       >
//                         <User size={20} />
//                       </div>
//                       <div>
//                         <h3 className="font-medium text-gray-800 dark:text-white">{user.username}</h3>
//                         <p className="text-sm text-gray-500 dark:text-gray-400">
//                           {user.hasPlan ? `${user.subscription?.plan?.name || 'No Plan'} Plan` : 'No Plan'}
//                         </p>
//                       </div>
//                     </div>
//                     <ChevronRight className="text-gray-400 dark:text-gray-500" size={18} />
//                   </div>
//                   <div className="mt-3 flex items-center justify-between text-sm">
//                     <span
//                       className={`px-2 py-1 rounded-full text-xs ${
//                         user.active ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
//                       }`}
//                     >
//                       {user.active ? "Active" : "Inactive"}
//                     </span>
//                     <span className="text-gray-500 dark:text-gray-400">{user.phonenumber}</span>
//                   </div>
//                   {!user.hasPlan && (
//                     <div className="mt-2 flex items-center text-xs text-yellow-700 dark:text-yellow-400">
//                       <AlertTriangle size={14} className="mr-1" />
//                       <span>No active subscription</span>
//                     </div>
//                   )}
//                 </div>
//               ))
//             ) : (
//               <div className="p-4 text-center text-gray-500 dark:text-gray-400">
//                 No clients found
//               </div>
//             )}
//           </div>
//           {filteredUsers.length > usersPerPage && (
//             <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
//               <button
//                 onClick={() => paginate(currentPage - 1)}
//                 disabled={currentPage === 1}
//                 className={`p-2 rounded-md ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed dark:text-gray-600' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}`}
//               >
//                 <ChevronLeft size={18} />
//               </button>
//               <span className="text-sm text-gray-600 dark:text-gray-400">
//                 Page {currentPage} of {totalPages}
//               </span>
//               <button
//                 onClick={() => paginate(currentPage + 1)}
//                 disabled={currentPage === totalPages}
//                 className={`p-2 rounded-md ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed dark:text-gray-600' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}`}
//               >
//                 <ChevronRight size={18} />
//               </button>
//             </div>
//           )}
//         </div>

//         {/* User Details */}
//         {selectedUser && (
//           <div className="lg:col-span-2 space-y-6">
//             {/* Profile Card */}
//             <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 dark:bg-gray-800 dark:border-gray-700">
//               <div className="flex items-start justify-between">
//                 <div className="flex items-center gap-4">
//                   <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
//                     selectedUser.active ? "bg-gradient-to-br from-green-100 to-teal-100 dark:from-green-900/20 dark:to-teal-900/20" : "bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800"
//                   }`}>
//                     <User className={selectedUser.active ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400"} size={28} />
//                   </div>
//                   <div>
//                     <h2 className="text-xl font-bold text-gray-800 dark:text-white">{selectedUser.username}</h2>
//                     <div className="flex items-center gap-2 mt-1">
//                       <span
//                         className={`px-2 py-1 rounded-full text-xs ${
//                           selectedUser.active ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
//                         }`}
//                       >
//                         {selectedUser.active ? "Active" : "Inactive"}
//                       </span>
//                       {selectedUser.hasPlan ? (
//                         <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
//                           {selectedUser.subscription?.plan?.name} Plan
//                         </span>
//                       ) : (
//                         <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400">
//                           No Active Plan
//                         </span>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   {selectedUser.active && selectedUser.router && (
//                     <button
//                       onClick={handleDisconnectHotspot}
//                       disabled={isDisconnecting}
//                       className="flex items-center gap-2 px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 disabled:opacity-50 dark:bg-red-600 dark:hover:bg-red-700"
//                     >
//                       {isDisconnecting ? (
//                         <FaSpinner className="animate-spin" />
//                       ) : (
//                         <Power size={16} />
//                       )}
//                       Disconnect
//                     </button>
//                   )}
//                   <button
//                     className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
//                     onClick={handleEditToggle}
//                   >
//                     <MoreVertical size={18} />
//                   </button>
//                 </div>
//               </div>

//               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6">
//                 <div className="bg-gray-50 p-3 rounded-lg dark:bg-gray-700">
//                   <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
//                     <User size={16} />
//                     <span className="text-xs">Username</span>
//                   </div>
//                   <p className="font-medium mt-1 dark:text-white">{selectedUser.username}</p>
//                 </div>
//                 <div className="bg-gray-50 p-3 rounded-lg dark:bg-gray-700">
//                   <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
//                     <Phone size={16} />
//                     <span className="text-xs">Phone</span>
//                   </div>
//                   <p className="font-medium mt-1 dark:text-white">{selectedUser.phonenumber}</p>
//                 </div>
//                 <div className="bg-gray-50 p-3 rounded-lg dark:bg-gray-700">
//                   <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
//                     <HardDrive size={16} />
//                     <span className="text-xs">Device</span>
//                   </div>
//                   <p className="font-medium mt-1 dark:text-white">{selectedUser.device}</p>
//                 </div>
//                 <div className="bg-gray-50 p-3 rounded-lg dark:bg-gray-700">
//                   <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
//                     <Shield size={16} />
//                     <span className="text-xs">Location</span>
//                   </div>
//                   <p className="font-medium mt-1 dark:text-white">{selectedUser.location}</p>
//                 </div>
//               </div>
//             </div>

//             {/* Tab Navigation */}
//             <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden dark:bg-gray-800 dark:border-gray-700">
//               <div className="flex border-b border-gray-100 dark:border-gray-700 overflow-x-auto">
//                 <button
//                   className={`flex-shrink-0 px-6 py-3 font-medium text-sm ${activeTab === 'overview' ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
//                   onClick={() => setActiveTab('overview')}
//                 >
//                   Overview
//                 </button>
//                 <button
//                   className={`flex-shrink-0 px-6 py-3 font-medium text-sm ${activeTab === 'subscription' ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
//                   onClick={() => setActiveTab('subscription')}
//                 >
//                   Subscription
//                 </button>
//                 <button
//                   className={`flex-shrink-0 px-6 py-3 font-medium text-sm ${activeTab === 'history' ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
//                   onClick={() => setActiveTab('history')}
//                 >
//                   History
//                 </button>
//                 <button
//                   className={`flex-shrink-0 px-6 py-3 font-medium text-sm ${activeTab === 'communication' ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
//                   onClick={() => setActiveTab('communication')}
//                 >
//                   Communication Log
//                 </button>
//               </div>

//               <div className="p-6">
//                 {/* Overview Tab */}
//                 {activeTab === 'overview' && (
//                   <div className="space-y-6">
//                     {/* Current Plan Summary */}
//                     {selectedUser.hasPlan ? (
//                       <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg dark:from-blue-900/20 dark:to-purple-900/20">
//                         <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Current Plan Summary</h3>
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                           <div className="space-y-4">
//                             <div className="flex items-center gap-3">
//                               <div className="p-2 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
//                                 <CreditCard size={18} />
//                               </div>
//                               <div>
//                                 <p className="text-xs text-gray-500 dark:text-gray-400">Plan Type</p>
//                                 <p className="font-medium dark:text-white">{selectedUser.subscription.plan?.name}</p>
//                               </div>
//                             </div>
//                             <div className="flex items-center gap-3">
//                               <div className="p-2 rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400">
//                                 <PaymentStatusIcon status={selectedUser.paymentStatus} />
//                               </div>
//                               <div>
//                                 <p className="text-xs text-gray-500 dark:text-gray-400">Payment Status</p>
//                                 <p className="font-medium capitalize dark:text-white">{selectedUser.paymentStatus}</p>
//                               </div>
//                             </div>
//                           </div>
//                           <div className="space-y-4">
//                             <div className="flex items-center gap-3">
//                               <div className="p-2 rounded-lg bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400">
//                                 <CalendarDays size={18} />
//                               </div>
//                               <div>
//                                 <p className="text-xs text-gray-500 dark:text-gray-400">Start Date</p>
//                                 <p className="font-medium dark:text-white">{formatDate(selectedUser.subscription.start_date)}</p>
//                               </div>
//                             </div>
//                             <div className="flex items-center gap-3">
//                               <div className="p-2 rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400">
//                                 <CalendarDays size={18} />
//                               </div>
//                               <div>
//                                 <p className="text-xs text-gray-500 dark:text-gray-400">Expiry Date</p>
//                                 <p className="font-medium dark:text-white">{formatDate(selectedUser.subscription.expiry_date)}</p>
//                               </div>
//                             </div>
//                           </div>
//                         </div>
//                         <div className="mt-6">
//                           <div className="flex items-center justify-between mb-3">
//                             <div className="flex items-center gap-2">
//                               <DataUsageIcon
//                                 used={selectedUser.data_usage?.used || 0}
//                                 total={selectedUser.data_usage?.total || 1}
//                                 isUnlimited={selectedUser.isUnlimited}
//                               />
//                               <span className="font-medium dark:text-white">Data Consumption</span>
//                             </div>
//                             <span className="text-sm font-medium dark:text-white">
//                               {selectedUser.isUnlimited
//                                 ? "Unlimited"
//                                 : `${selectedUser.data_usage?.used || 0} ${selectedUser.data_usage?.unit || 'GB'} of ${selectedUser.data_usage?.total || 0} ${selectedUser.data_usage?.unit || 'GB'}`}
//                             </span>
//                           </div>
//                           <div className="mb-2">
//                             <DataUsageBar
//                               used={selectedUser.data_usage?.used || 0}
//                               total={selectedUser.data_usage?.total || 1}
//                               isUnlimited={selectedUser.isUnlimited}
//                             />
//                           </div>
//                           <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
//                             <span>0 {selectedUser.data_usage?.unit || 'GB'}</span>
//                             <span>{selectedUser.isUnlimited ? "∞" : `${selectedUser.data_usage?.total || 0} ${selectedUser.data_usage?.unit || 'GB'}`}</span>
//                           </div>
//                         </div>
//                       </div>
//                     ) : (
//                       <div className="bg-yellow-50 p-6 rounded-lg dark:bg-yellow-900/20">
//                         <div className="flex items-center justify-between">
//                           <div className="flex items-center gap-3">
//                             <div className="p-2 rounded-lg bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400">
//                               <AlertTriangle size={18} />
//                             </div>
//                             <div>
//                               <h3 className="font-medium text-gray-800 dark:text-white">No Active Plan</h3>
//                               <p className="text-sm text-gray-500 dark:text-gray-400">This client doesn't have an active subscription</p>
//                             </div>
//                           </div>
//                           <button className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700">
//                             Assign Plan
//                           </button>
//                         </div>
//                       </div>
//                     )}

//                     {/* Customer Summary */}
//                     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
//                       <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
//                         <p className="text-xs text-gray-500 dark:text-gray-400">Total Revenue</p>
//                         <p className="font-medium text-lg dark:text-white">{formatCurrency(selectedUser.totalRevenue)}</p>
//                       </div>
//                       <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
//                         <p className="text-xs text-gray-500 dark:text-gray-400">Avg. Monthly Spend</p>
//                         <p className="font-medium text-lg dark:text-white">{formatCurrency(selectedUser.avgMonthlySpend)}</p>
//                       </div>
//                       <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
//                         <p className="text-xs text-gray-500 dark:text-gray-400">Renewal Frequency</p>
//                         <p className="font-medium text-lg dark:text-white">{selectedUser.renewalFrequency}</p>
//                       </div>
//                       <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
//                         <p className="text-xs text-gray-500 dark:text-gray-400">Loyalty Duration</p>
//                         <p className="font-medium text-lg dark:text-white">{selectedUser.loyaltyDuration} months</p>
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 {/* Subscription Tab */}
//                 {activeTab === 'subscription' && (
//                   <>
//                     {selectedUser.hasPlan ? (
//                       <div className="space-y-6">
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//                           <div className="space-y-4">
//                             <div className="flex items-center gap-3">
//                               <div className="p-2 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
//                                 <CreditCard size={18} />
//                               </div>
//                               <div>
//                                 <p className="text-xs text-gray-500 dark:text-gray-400">Plan Type</p>
//                                 <p className="font-medium dark:text-white">{selectedUser.subscription.plan?.name}</p>
//                               </div>
//                             </div>
//                             <div className="flex items-center gap-3">
//                               <div className="p-2 rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400">
//                                 <PaymentStatusIcon status={selectedUser.paymentStatus} />
//                               </div>
//                               <div>
//                                 <p className="text-xs text-gray-500 dark:text-gray-400">Payment Status</p>
//                                 <p className="font-medium capitalize dark:text-white">{selectedUser.paymentStatus}</p>
//                               </div>
//                             </div>
//                           </div>
//                           <div className="space-y-4">
//                             <div className="flex items-center gap-3">
//                               <div className="p-2 rounded-lg bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400">
//                                 <CalendarDays size={18} />
//                               </div>
//                               <div>
//                                 <p className="text-xs text-gray-500 dark:text-gray-400">Start Date</p>
//                                 <p className="font-medium dark:text-white">{formatDate(selectedUser.subscription.start_date)}</p>
//                               </div>
//                             </div>
//                             <div className="flex items-center gap-3">
//                               <div className="p-2 rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400">
//                                 <CalendarDays size={18} />
//                               </div>
//                               <div>
//                                 <p className="text-xs text-gray-500 dark:text-gray-400">Expiry Date</p>
//                                 <p className="font-medium dark:text-white">{formatDate(selectedUser.subscription.expiry_date)}</p>
//                               </div>
//                             </div>
//                           </div>
//                         </div>
//                         <div className="flex items-center justify-between mb-3">
//                           <div className="flex items-center gap-2">
//                             <DataUsageIcon
//                               used={selectedUser.data_usage?.used || 0}
//                               total={selectedUser.data_usage?.total || 1}
//                               isUnlimited={selectedUser.isUnlimited}
//                             />
//                             <span className="font-medium dark:text-white">Data Consumption</span>
//                           </div>
//                           <span className="text-sm font-medium dark:text-white">
//                             {selectedUser.isUnlimited
//                               ? "Unlimited"
//                               : `${selectedUser.data_usage?.used || 0} ${selectedUser.data_usage?.unit || 'GB'} of ${selectedUser.data_usage?.total || 0} ${selectedUser.data_usage?.unit || 'GB'}`}
//                           </span>
//                         </div>
//                         <div className="mb-2">
//                           <DataUsageBar
//                             used={selectedUser.data_usage?.used || 0}
//                             total={selectedUser.data_usage?.total || 1}
//                             isUnlimited={selectedUser.isUnlimited}
//                           />
//                         </div>
//                         <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
//                           <span>0 {selectedUser.data_usage?.unit || 'GB'}</span>
//                           <span>{selectedUser.isUnlimited ? "∞" : `${selectedUser.data_usage?.total || 0} ${selectedUser.data_usage?.unit || 'GB'}`}</span>
//                         </div>
//                       </div>
//                     ) : (
//                       <div className="text-center py-8 text-gray-500 dark:text-gray-400">
//                         <CreditCard size={24} className="mx-auto mb-2 text-gray-400 dark:text-gray-500" />
//                         <p>No active subscription found</p>
//                       </div>
//                     )}
//                   </>
//                 )}

//                 {/* History Tab */}
//                 {activeTab === 'history' && (
//                   <div className="space-y-8">
//                     {selectedUser.history?.purchaseHistory?.length > 0 || selectedUser.history?.visitedSites?.length > 0 ? (
//                       <>
//                         {/* Plan Purchase Trends */}
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                           <div>
//                             <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2 dark:text-gray-300">
//                               <BarChart2 size={16} />
//                               Annual Revenue Trend
//                             </h4>
//                             <div className="h-64 bg-gray-50 p-3 rounded-lg dark:bg-gray-700">
//                               <ResponsiveContainer width="100%" height="100%">
//                                 <LineChart data={getChartData}>
//                                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" />
//                                   <XAxis dataKey="year" stroke="#9CA3AF" />
//                                   <YAxis stroke="#9CA3AF" />
//                                   <Tooltip 
//                                     formatter={(value) => [formatCurrency(value), "Revenue"]}
//                                     contentStyle={{ backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF', borderColor: theme === 'dark' ? '#374151' : '#E5E7EB' }}
//                                   />
//                                   <Line
//                                     type="monotone"
//                                     dataKey="revenue"
//                                     stroke="#3B82F6"
//                                     strokeWidth={2}
//                                     dot={{ r: 4 }}
//                                     activeDot={{ r: 6 }}
//                                   />
//                                 </LineChart>
//                               </ResponsiveContainer>
//                             </div>
//                           </div>
//                           <div>
//                             <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2 dark:text-gray-300">
//                               <BarChart2 size={16} />
//                               Monthly Revenue Breakdown
//                             </h4>
//                             <div className="h-64 bg-gray-50 p-3 rounded-lg dark:bg-gray-700">
//                               <ResponsiveContainer width="100%" height="100%">
//                                 <BarChart data={getMonthlyChartData}>
//                                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" />
//                                   <XAxis dataKey="month" stroke="#9CA3AF" />
//                                   <YAxis stroke="#9CA3AF" />
//                                   <Tooltip 
//                                     formatter={(value) => [formatCurrency(value), "Revenue"]}
//                                     contentStyle={{ backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF', borderColor: theme === 'dark' ? '#374151' : '#E5E7EB' }}
//                                   />
//                                   <Bar dataKey="revenue" fill="#8884d8" radius={[4, 4, 0, 0]} />
//                                 </BarChart>
//                               </ResponsiveContainer>
//                             </div>
//                           </div>
//                         </div>

//                         {/* Plan Distribution */}
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                           <div>
//                             <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2 dark:text-gray-300">
//                               <Package size={16} />
//                               Plan Distribution
//                             </h4>
//                             <div className="h-64 bg-gray-50 p-3 rounded-lg dark:bg-gray-700">
//                               <ResponsiveContainer width="100%" height="100%">
//                                 <PieChart>
//                                   <Pie
//                                     data={getPlanDistributionData}
//                                     cx="50%"
//                                     cy="50%"
//                                     labelLine={false}
//                                     outerRadius={80}
//                                     fill="#8884d8"
//                                     dataKey="value"
//                                     label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
//                                   >
//                                     {getPlanDistributionData.map((entry, index) => (
//                                       <Cell key={`cell-${index}`} fill={entry.color} />
//                                     ))}
//                                   </Pie>
//                                   <Tooltip 
//                                     formatter={(value, name) => [`${value} purchases`, name]}
//                                     contentStyle={{ backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF', borderColor: theme === 'dark' ? '#374151' : '#E5E7EB' }}
//                                   />
//                                 </PieChart>
//                               </ResponsiveContainer>
//                             </div>
//                           </div>
//                           <div>
//                             <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2 dark:text-gray-300">
//                               <CreditCard size={16} />
//                               Payment Methods
//                             </h4>
//                             <div className="h-64 bg-gray-50 p-3 rounded-lg dark:bg-gray-700">
//                               <ResponsiveContainer width="100%" height="100%">
//                                 <PieChart>
//                                   <Pie
//                                     data={getPaymentMethodData}
//                                     cx="50%"
//                                     cy="50%"
//                                     labelLine={false}
//                                     outerRadius={80}
//                                     fill="#8884d8"
//                                     dataKey="value"
//                                     label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
//                                   >
//                                     {getPaymentMethodData.map((entry, index) => (
//                                       <Cell
//                                         key={`cell-${index}`}
//                                         fill={["#6366F1", "#3B82F6", "#10B981", "#F59E0B"][index % 4]}
//                                       />
//                                     ))}
//                                   </Pie>
//                                   <Tooltip 
//                                     formatter={(value, name) => [`${value} purchases`, name]}
//                                     contentStyle={{ backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF', borderColor: theme === 'dark' ? '#374151' : '#E5E7EB' }}
//                                   />
//                                 </PieChart>
//                               </ResponsiveContainer>
//                             </div>
//                           </div>
//                         </div>

//                         {/* Plan Behavior Insights */}
//                         <div>
//                           <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2 dark:text-gray-300">
//                             <TrendingUp size={16} />
//                             Plan Behavior Insights
//                           </h4>
//                           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
//                             <div className="bg-gray-50 p-3 rounded-lg dark:bg-gray-700">
//                               <p className="text-xs text-gray-500 dark:text-gray-400">Favorite Plan</p>
//                               <p className="font-medium dark:text-white">{getPlanBehavior.favoritePlan}</p>
//                             </div>
//                             <div className="bg-gray-50 p-3 rounded-lg dark:bg-gray-700">
//                               <p className="text-xs text-gray-500 dark:text-gray-400">Number of Upgrades</p>
//                               <p className="font-medium dark:text-white">{getPlanBehavior.upgrades}</p>
//                             </div>
//                             <div className="bg-gray-50 p-3 rounded-lg dark:bg-gray-700">
//                               <p className="text-xs text-gray-500 dark:text-gray-400">Plan Changes</p>
//                               <p className="font-medium dark:text-white">{getPlanBehavior.planChanges}</p>
//                             </div>
//                             <div className="bg-gray-50 p-3 rounded-lg dark:bg-gray-700">
//                               <p className="text-xs text-gray-500 dark:text-gray-400">Avg. Plan Duration</p>
//                               <p className="font-medium dark:text-white">{getPlanBehavior.avgDuration.toFixed(1)} months</p>
//                             </div>
//                           </div>
//                           <div className="mt-4 bg-gray-50 p-3 rounded-lg dark:bg-gray-700">
//                             <div className="flex items-center gap-2">
//                               <p className="text-xs text-gray-500 dark:text-gray-400">Spending Trend:</p>
//                               {getSpendingTrend === "up" ? (
//                                 <div className="flex items-center text-green-500 dark:text-green-400">
//                                   <TrendingUp size={16} />
//                                   <span className="ml-1">Increasing</span>
//                                 </div>
//                               ) : getSpendingTrend === "down" ? (
//                                 <div className="flex items-center text-red-500 dark:text-red-400">
//                                   <TrendingDown size={16} />
//                                   <span className="ml-1">Decreasing</span>
//                                 </div>
//                               ) : (
//                                 <div className="flex items-center text-gray-500 dark:text-gray-400">
//                                   <Circle size={16} />
//                                   <span className="ml-1">Stable</span>
//                                 </div>
//                               )}
//                             </div>
//                           </div>
//                         </div>

//                         {/* Browsing History */}
//                         <div>
//                           <div className="flex items-center justify-between mb-3">
//                             <h4 className="font-medium text-gray-700 flex items-center gap-2 dark:text-gray-300">
//                               <Globe size={16} />
//                               Browsing History
//                             </h4>
//                             <button
//                               className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
//                               onClick={() => exportBrowsingHistoryToCSV(selectedUser.history.visitedSites)}
//                             >
//                               <Download size={14} />
//                               Export
//                             </button>
//                           </div>
//                           <div className="overflow-x-auto">
//                             <table className="w-full text-sm">
//                               <thead>
//                                 <tr className="bg-gray-100 dark:bg-gray-700">
//                                   <th className="p-2 text-left text-gray-600 dark:text-gray-300">URL</th>
//                                   <th className="p-2 text-left text-gray-600 dark:text-gray-300">Data Used</th>
//                                   <th className="p-2 text-left text-gray-600 dark:text-gray-300">Frequency</th>
//                                   <th className="p-2 text-left text-gray-600 dark:text-gray-300">Timestamp</th>
//                                   <th className="p-2 text-left text-gray-600 dark:text-gray-300">Router</th>
//                                   <th className="p-2 text-left text-gray-600 dark:text-gray-300">Device</th>
//                                 </tr>
//                               </thead>
//                               <tbody>
//                                 {selectedUser.history.visitedSites && selectedUser.history.visitedSites.length > 0 ? (
//                                   selectedUser.history.visitedSites.map((site, index) => (
//                                     <tr key={index} className="border-b hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700">
//                                       <td className="p-2">
//                                         <a
//                                           href={site.url}
//                                           target="_blank"
//                                           rel="noopener noreferrer"
//                                           className="text-blue-500 hover:underline dark:text-blue-400"
//                                         >
//                                           {site.url.length > 30 ? `${site.url.substring(0, 27)}...` : site.url}
//                                         </a>
//                                       </td>
//                                       <td className="p-2 dark:text-gray-300">{site.data_used || "0GB"}</td>
//                                       <td className="p-2 dark:text-gray-300">{site.frequency || "N/A"}</td>
//                                       <td className="p-2 dark:text-gray-300">{formatDate(site.timestamp)}</td>
//                                       <td className="p-2 dark:text-gray-300">{site.router?.name || "Unknown"}</td>
//                                       <td className="p-2 dark:text-gray-300">{site.hotspot_user?.mac || "Unknown"}</td>
//                                     </tr>
//                                   ))
//                                 ) : (
//                                   <tr>
//                                     <td colSpan={6} className="p-4 text-center text-gray-500 dark:text-gray-400">
//                                       No browsing history found
//                                     </td>
//                                   </tr>
//                                 )}
//                               </tbody>
//                             </table>
//                           </div>
//                         </div>

//                         {/* Purchase History */}
//                         <div>
//                           <div className="flex items-center justify-between mb-3">
//                             <h4 className="font-medium text-gray-700 flex items-center gap-2 dark:text-gray-300">
//                               <History size={16} />
//                               Detailed Purchase History
//                             </h4>
//                             <div className="flex items-center gap-2">
//                               <select
//                                 className="border border-gray-200 rounded-lg px-2 py-1 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
//                                 value={filterYear}
//                                 onChange={(e) => setFilterYear(e.target.value)}
//                               >
//                                 <option value="All">All Years</option>
//                                 {[
//                                   ...new Set(
//                                     selectedUser.history.purchaseHistory.map((p) =>
//                                       new Date(p.purchase_date).getFullYear()
//                                     )
//                                   ),
//                                 ]
//                                   .sort((a, b) => b - a)
//                                   .map((year) => (
//                                     <option key={year} value={year}>
//                                       {year}
//                                     </option>
//                                   ))}
//                               </select>
//                               <button
//                                 className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
//                                 onClick={() => exportToCSV(selectedUser.history)}
//                               >
//                                 <Download size={14} />
//                                 Export
//                               </button>
//                             </div>
//                           </div>
//                           <div className="overflow-x-auto">
//                             <table className="w-full text-sm">
//                               <thead>
//                                 <tr className="bg-gray-100 dark:bg-gray-700">
//                                   <th className="p-2 text-left text-gray-600 dark:text-gray-300">Plan</th>
//                                   <th className="p-2 text-left text-gray-600 dark:text-gray-300">Purchase Date</th>
//                                   <th className="p-2 text-left text-gray-600 dark:text-gray-300">Duration</th>
//                                   <th className="p-2 text-left text-gray-600 dark:text-gray-300">Price</th>
//                                   <th className="p-2 text-left text-gray-600 dark:text-gray-300">Status</th>
//                                   <th className="p-2 text-left text-gray-600 dark:text-gray-300">Details</th>
//                                 </tr>
//                               </thead>
//                               <tbody>
//                                 {getFilteredPurchaseHistory.map((purchase, index) => (
//                                   <tr
//                                     key={index}
//                                     className="border-b hover:bg-gray-50 cursor-pointer dark:border-gray-700 dark:hover:bg-gray-700"
//                                     onClick={() => viewPurchaseDetails(purchase)}
//                                   >
//                                     <td className="p-2">
//                                       <div className="flex items-center gap-2">
//                                         <div
//                                           className="w-2 h-2 rounded-full"
//                                           style={{ backgroundColor: getPlanColor(purchase.plan?.name) }}
//                                         ></div>
//                                         <span className="dark:text-gray-300">{purchase.plan?.name || "N/A"}</span>
//                                       </div>
//                                     </td>
//                                     <td className="p-2 dark:text-gray-300">{formatDate(purchase.purchase_date)}</td>
//                                     <td className="p-2 dark:text-gray-300">{purchase.duration || "N/A"}</td>
//                                     <td className="p-2 font-medium dark:text-white">{formatCurrency(purchase.amount)}</td>
//                                     <td className="p-2">
//                                       <span
//                                         className={`px-2 py-1 rounded-full text-xs ${
//                                           purchase.status === "Active"
//                                             ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
//                                             : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
//                                         }`}
//                                       >
//                                         {purchase.status || "N/A"}
//                                       </span>
//                                     </td>
//                                     <td className="p-2">
//                                       <button className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
//                                         <ArrowUpRight size={16} />
//                                       </button>
//                                     </td>
//                                   </tr>
//                                 ))}
//                               </tbody>
//                             </table>
//                           </div>
//                         </div>
//                       </>
//                     ) : (
//                       <div className="text-center py-8 text-gray-500 dark:text-gray-400">
//                         <Package size={24} className="mx-auto mb-2 text-gray-400 dark:text-gray-500" />
//                         <p>No history found</p>
//                       </div>
//                     )}
//                   </div>
//                 )}

//                 {/* Communication Log Tab */}
//                 {activeTab === 'communication' && (
//                   <div className="space-y-6">
//                     {/* Send Message Form */}
//                     <div className="bg-gray-50 p-4 rounded-lg dark:bg-gray-700">
//                       <h4 className="font-medium text-gray-700 mb-3 dark:text-gray-300">Send Message</h4>
//                       <form onSubmit={handleSendMessage} className="space-y-3">
//                         <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
//                           <div>
//                             <label className="block text-sm text-gray-600 mb-1 dark:text-gray-400">Message Type</label>
//                             <select
//                               name="message_type"
//                               value={messageForm.message_type}
//                               onChange={handleMessageChange}
//                               className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
//                             >
//                               <option value="sms">SMS</option>
//                               <option value="email">Email</option>
//                               <option value="system">System Notification</option>
//                             </select>
//                           </div>
//                           {messageForm.message_type === 'email' && (
//                             <div className="md:col-span-2">
//                               <label className="block text-sm text-gray-600 mb-1 dark:text-gray-400">Subject</label>
//                               <input
//                                 type="text"
//                                 name="subject"
//                                 value={messageForm.subject}
//                                 onChange={handleMessageChange}
//                                 className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
//                                 placeholder="Email subject"
//                               />
//                             </div>
//                           )}
//                         </div>
//                         <div>
//                           <label className="block text-sm text-gray-600 mb-1 dark:text-gray-400">Message</label>
//                           <textarea
//                             name="message"
//                             value={messageForm.message}
//                             onChange={handleMessageChange}
//                             rows={3}
//                             className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
//                             placeholder="Type your message here..."
//                             required
//                           />
//                         </div>
//                         <div className="flex justify-end">
//                           <button
//                             type="submit"
//                             disabled={isSendingMessage}
//                             className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700"
//                           >
//                             {isSendingMessage ? (
//                               <FaSpinner className="animate-spin" />
//                             ) : (
//                               <Send size={16} />
//                             )}
//                             Send Message
//                           </button>
//                         </div>
//                       </form>
//                     </div>

//                     {/* Communication Log */}
//                     <div>
//                       <h4 className="font-medium text-gray-700 mb-3 dark:text-gray-300">Communication History</h4>
//                       {selectedUser.communication_logs && selectedUser.communication_logs.length > 0 ? (
//                         <div className="space-y-3">
//                           {selectedUser.communication_logs.map((log) => (
//                             <div key={log.id} className="bg-white p-4 rounded-lg border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
//                               <div className="flex items-start gap-3">
//                                 <MessageTypeIcon type={log.message_type} />
//                                 <div className="flex-1">
//                                   <p className="font-medium dark:text-white">{log.subject || log.trigger_display}</p>
//                                   <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(log.formatted_timestamp)}</p>
//                                   <div className="mt-1">
//                                     <StatusBadge status={log.status} />
//                                   </div>
//                                   <p className="mt-2 text-gray-700 dark:text-gray-300">{log.message}</p>
//                                   {log.router && (
//                                     <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Router: {log.router.name}</p>
//                                   )}
//                                 </div>
//                               </div>
//                             </div>
//                           ))}
//                         </div>
//                       ) : (
//                         <div className="text-center py-8 text-gray-500 dark:text-gray-400">
//                           <MessageSquare size={24} className="mx-auto mb-2 text-gray-400 dark:text-gray-500" />
//                           <p>No communication history</p>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Edit Profile Modal */}
//       {isEditing && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//           <div className="bg-white rounded-xl max-w-md w-full p-6 dark:bg-gray-800">
//             <div className="flex items-center justify-between mb-4">
//               <h3 className="text-lg font-bold text-gray-800 dark:text-white">Edit Client Profile</h3>
//               <button
//                 onClick={handleEditToggle}
//                 className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
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
//                 <label className="block text-sm text-gray-600 dark:text-gray-400">Username</label>
//                 <input
//                   type="text"
//                   name="username"
//                   value={editForm.username}
//                   onChange={handleEditChange}
//                   className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm text-gray-600 dark:text-gray-400">Phone Number</label>
//                 <input
//                   type="text"
//                   name="phone"
//                   value={editForm.phone}
//                   onChange={handleEditChange}
//                   className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
//                   pattern="(\+254|0)[0-9]{9}"
//                   title="Phone number must be in the format +254XXXXXXXXX or 07XXXXXXXX"
//                   required
//                 />
//               </div>
//               <div className="flex justify-end gap-2">
//                 <button
//                   type="button"
//                   onClick={handleEditToggle}
//                   className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
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
//           <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto dark:bg-gray-800">
//             <div className="p-6">
//               <div className="flex items-center justify-between mb-4">
//                 <h3 className="text-lg font-bold text-gray-800 dark:text-white">Purchase Details</h3>
//                 <button
//                   onClick={closePurchaseDetails}
//                   className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
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
//                   <p className="text-sm text-gray-500 dark:text-gray-400">Plan</p>
//                   <p className="font-medium dark:text-white">{selectedPurchase.plan?.name || "N/A"}</p>
//                 </div>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                   <div>
//                     <p className="text-sm text-gray-500 dark:text-gray-400">Purchase Date</p>
//                     <p className="font-medium dark:text-white">{formatDate(selectedPurchase.purchase_date)}</p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-500 dark:text-gray-400">Duration</p>
//                     <p className="font-medium dark:text-white">{selectedPurchase.duration || "N/A"}</p>
//                   </div>
//                 </div>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                   <div>
//                     <p className="text-sm text-gray-500 dark:text-gray-400">Price</p>
//                     <p className="font-medium dark:text-white">{formatCurrency(selectedPurchase.amount)}</p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
//                     <p className="font-medium">
//                       <span
//                         className={`px-2 py-1 rounded-full text-xs ${
//                           selectedPurchase.status === "Active"
//                             ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
//                             : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
//                         }`}
//                       >
//                         {selectedPurchase.status || "N/A"}
//                       </span>
//                     </p>
//                   </div>
//                 </div>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                   <div>
//                     <p className="text-sm text-gray-500 dark:text-gray-400">Payment Method</p>
//                     <p className="font-medium dark:text-white">{selectedPurchase.payment_method || "N/A"}</p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-500 dark:text-gray-400">Invoice Number</p>
//                     <p className="font-medium dark:text-white">{selectedPurchase.invoice_number || "N/A"}</p>
//                   </div>
//                 </div>
//                 {selectedPurchase.status === "Expired" && (
//                   <div className="mt-4 p-3 bg-yellow-50 rounded-lg dark:bg-yellow-900/20">
//                     <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
//                       <AlertTriangle size={16} />
//                       <p className="text-sm">
//                         This plan expired on {formatDate(selectedUser.subscription?.expiry_date)}
//                       </p>
//                     </div>
//                   </div>
//                 )}
//               </div>
//               <div className="mt-6 flex justify-end">
//                 <button
//                   onClick={closePurchaseDetails}
//                   className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
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

// export default ClientDashboard;










import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Eye,
  Phone,
  Wifi,
  CalendarDays,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  ChevronRight,
  ChevronLeft,
  HardDrive,
  BatteryFull,
  BatteryMedium,
  BatteryLow,
  CreditCard,
  Shield,
  Zap,
  BarChart2,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  BadgeCheck,
  User as UserIcon,
  History,
  Globe,
  Package,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  TrendingDown,
  Circle,
  MessageSquare,
  Send,
  Mail,
  Bell,
  Power
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import api from "../../api";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { FaSpinner } from "react-icons/fa";

// Theme-based background classes
const getContainerClass = (theme) => theme === "dark" 
  ? "bg-gradient-to-br from-gray-900 to-indigo-900 text-white min-h-screen" 
  : "bg-gray-50 text-gray-800 min-h-screen";

const getCardClass = (theme) => theme === "dark"
  ? "bg-gray-800/60 backdrop-blur-md border-gray-700"
  : "bg-white border-gray-200";

const getInputClass = (theme) => theme === "dark"
  ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
  : "bg-white border-gray-300 text-gray-800 placeholder-gray-500";

// Memoized components to prevent unnecessary re-renders
const DataUsageBar = React.memo(({ used, total, isUnlimited, theme }) => {
  if (isUnlimited) {
    return (
      <div className={`w-full bg-gradient-to-r from-purple-100 to-blue-100 rounded-full h-3 relative overflow-hidden ${
        theme === "dark" ? "from-purple-900 to-blue-900" : ""
      }`}>
        <div className={`absolute inset-0 bg-gradient-to-r from-purple-400 via-blue-500 to-teal-400 opacity-70 animate-pulse rounded-full ${
          theme === "dark" ? "from-purple-600 via-blue-600 to-teal-600" : ""
        }`}></div>
      </div>
    );
  }

  const percentage = Math.min((used / parseFloat(total || 1)) * 100, 100);
  let colorClass = "bg-green-500";
  if (percentage > 80) colorClass = "bg-yellow-500";
  if (percentage > 95) colorClass = "bg-red-500";

  if (theme === "dark") {
    if (percentage > 80) colorClass = "bg-yellow-600";
    if (percentage > 95) colorClass = "bg-red-600";
  }

  return (
    <div className={`w-full rounded-full h-3 overflow-hidden ${
      theme === "dark" ? "bg-gray-700" : "bg-gray-200"
    }`}>
      <div
        className={`${colorClass} h-3 rounded-full transition-all duration-500`}
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
});

const DataUsageIcon = React.memo(({ used, total, isUnlimited }) => {
  if (isUnlimited) return <Zap className="text-purple-500" size={18} />;
  const percentage = used / parseFloat(total || 1);
  if (percentage < 0.3) return <BatteryFull className="text-green-500" size={18} />;
  if (percentage < 0.7) return <BatteryMedium className="text-yellow-500" size={18} />;
  return <BatteryLow className="text-red-500" size={18} />;
});

const PaymentStatusIcon = React.memo(({ status }) => {
  switch (status) {
    case "Paid":
      return <BadgeCheck className="text-green-500" size={18} />;
    case "Due":
      return <Clock className="text-yellow-500" size={18} />;
    case "Expired":
      return <AlertTriangle className="text-red-500" size={18} />;
    default:
      return <CreditCard className="text-gray-500" size={18} />;
  }
});

const MessageTypeIcon = React.memo(({ type }) => {
  switch (type) {
    case "sms":
      return <MessageSquare className="text-blue-500" size={16} />;
    case "email":
      return <Mail className="text-green-500" size={16} />;
    case "system":
      return <Bell className="text-purple-500" size={16} />;
    default:
      return <MessageSquare className="text-gray-500" size={16} />;
  }
});

const StatusBadge = React.memo(({ status, theme }) => {
  let bgColor = theme === "dark" ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-700";
  if (status === "delivered") bgColor = theme === "dark" ? "bg-green-900 text-green-300" : "bg-green-100 text-green-700";
  if (status === "failed") bgColor = theme === "dark" ? "bg-red-900 text-red-300" : "bg-red-100 text-red-700";
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs ${bgColor}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
});

const ClientDashboard = () => {
  const { isAuthenticated, authLoading } = useAuth();
  const { theme } = useTheme();
  const today = useMemo(() => new Date(), []);
  
  // State management with useMemo for derived data
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [expandedSection, setExpandedSection] = useState(null);
  const [filterYear, setFilterYear] = useState("All");
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ username: "", phone: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(3);
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("overview");
  const [messageForm, setMessageForm] = useState({ message_type: "sms", subject: "", message: "" });
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  // Theme classes
  const containerClass = useMemo(() => getContainerClass(theme), [theme]);
  const cardClass = useMemo(() => getCardClass(theme), [theme]);
  const inputClass = useMemo(() => getInputClass(theme), [theme]);

  // Memoized enriched user data
  const enrichUser = useCallback((user) => {
    const expiry = user.subscription?.expiry_date ? new Date(user.subscription.expiry_date) : null;
    const paymentStatus = expiry ? 
      (today < expiry ? "Paid" : today.toDateString() === expiry.toDateString() ? "Due" : "Expired") : 
      "No Plan";

    const isUnlimited = user.data_usage?.total === "unlimited";
    const active = isUnlimited || (user.data_usage?.used < parseFloat(user.data_usage?.total || 0));

    const totalRevenue = user.history?.purchaseHistory?.reduce(
      (sum, purchase) => sum + purchase.amount,
      0
    ) || 0;

    const renewalFrequency = user.history?.purchaseHistory?.length > 1 ?
      `${user.history.purchaseHistory.length} renewals` : "No renewals";

    const firstPurchase = user.history?.purchaseHistory?.length > 0 ?
      new Date(user.history.purchaseHistory[user.history.purchaseHistory.length - 1]?.purchase_date) : null;
    
    const monthsActive = firstPurchase ?
      (today.getFullYear() - firstPurchase.getFullYear()) * 12 +
      (today.getMonth() - firstPurchase.getMonth()) + 1 : 0;
    
    const avgMonthlySpend = totalRevenue / Math.max(monthsActive, 1);

    const loyaltyDuration = firstPurchase ? 
      Math.floor((today - firstPurchase) / (1000 * 60 * 60 * 24 * 30)) : 0;

    return {
      ...user,
      paymentStatus,
      active,
      isUnlimited,
      totalRevenue,
      renewalFrequency,
      avgMonthlySpend,
      loyaltyDuration,
      hasPlan: !!user.subscription
    };
  }, [today]);

  // Fetch users on mount
  useEffect(() => {
    const fetchUsers = async () => {
      if (!isAuthenticated) {
        setError("Please log in to view client profiles.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        let allUsers = [];
        let nextUrl = "/api/user_management/profiles/?page_size=50";

        while (nextUrl) {
          const response = await api.get(nextUrl);
          const usersData = response.data.results || response.data;
          allUsers = [...allUsers, ...usersData];
          nextUrl = response.data.next;
        }

        const enrichedUsers = allUsers.map(enrichUser);
        setUsers(enrichedUsers);
        setSelectedUser(enrichedUsers[0] || null);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load clients.");
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading && isAuthenticated) {
      fetchUsers();
    }
  }, [isAuthenticated, authLoading, enrichUser]);

  // Filter users based on active status
  useEffect(() => {
    let filtered = users;
    if (activeFilter === 'active') {
      filtered = users.filter(user => user.active);
    } else if (activeFilter === 'inactive') {
      filtered = users.filter(user => !user.active);
    }
    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [users, activeFilter]);

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Memoized handlers
  const handleView = useCallback(async (user) => {
    try {
      const response = await api.get(`/api/user_management/profiles/${user.id}/`);
      const enrichedUser = enrichUser(response.data);
      setSelectedUser(enrichedUser);
      setExpandedSection(null);
      setFilterYear("All");
      setSelectedPurchase(null);
      setActiveTab("overview");
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load client profile.");
    }
  }, [enrichUser]);

  const handleEditToggle = useCallback(() => {
    if (!isEditing) {
      setEditForm({
        username: selectedUser.username,
        phone: selectedUser.phonenumber,
      });
    }
    setIsEditing(!isEditing);
  }, [isEditing, selectedUser]);

  const handleEditChange = useCallback((e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleEditSubmit = useCallback(async (e) => {
    e.preventDefault();
    try {
      const response = await api.patch(`/api/user_management/profiles/${selectedUser.id}/`, {
        username: editForm.username,
        phonenumber: editForm.phone,
      });
      const enrichedUser = enrichUser(response.data);
      setUsers((prev) =>
        prev.map((u) => (u.id === selectedUser.id ? enrichedUser : u))
      );
      setSelectedUser(enrichedUser);
      setIsEditing(false);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update client profile.");
    }
  }, [selectedUser, editForm, enrichUser]);

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
      const response = await api.post(`/api/user_management/profiles/${selectedUser.id}/send-message/`, {
        ...messageForm,
        trigger_type: "manual"
      });
      
      const userResponse = await api.get(`/api/user_management/profiles/${selectedUser.id}/`);
      const enrichedUser = enrichUser(userResponse.data);
      setSelectedUser(enrichedUser);
      
      setMessageForm({ message_type: "sms", subject: "", message: "" });
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send message.");
    } finally {
      setIsSendingMessage(false);
    }
  }, [selectedUser, messageForm, enrichUser]);

  const handleDisconnectHotspot = useCallback(async () => {
    if (!selectedUser.router || !selectedUser.device || !selectedUser.active) {
      setError("No active hotspot connection to disconnect.");
      return;
    }

    setIsDisconnecting(true);
    try {
      const response = await api.post(`/api/user_management/profiles/${selectedUser.id}/disconnect-hotspot/`);
      const userResponse = await api.get(`/api/user_management/profiles/${selectedUser.id}/`);
      const enrichedUser = enrichUser(userResponse.data);
      setSelectedUser(enrichedUser);
      setUsers((prev) =>
        prev.map((u) => (u.id === selectedUser.id ? enrichedUser : u))
      );
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to disconnect client from hotspot.");
    } finally {
      setIsDisconnecting(false);
    }
  }, [selectedUser, enrichUser]);

  const toggleSection = useCallback((section) => {
    setExpandedSection(expandedSection === section ? null : section);
    setSelectedPurchase(null);
  }, [expandedSection]);

  // Memoized utility functions
  const formatDate = useCallback((dateString) => {
    if (!dateString) return "N/A";
    const options = { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }, []);

  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
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
    a.setAttribute("download", `${selectedUser.username}_subscription_history.csv`);
    a.click();
  }, [selectedUser, formatDate, formatCurrency]);

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
    a.setAttribute("download", `${selectedUser.username}_browsing_history.csv`);
    a.click();
  }, [selectedUser, formatDate]);

  // Memoized data processing functions
  const getFilteredPurchaseHistory = useMemo(() => {
    if (!selectedUser?.history?.purchaseHistory) return [];
    if (filterYear === "All") return selectedUser.history.purchaseHistory;
    return selectedUser.history.purchaseHistory.filter(
      (purchase) => new Date(purchase.purchase_date).getFullYear().toString() === filterYear
    );
  }, [selectedUser, filterYear]);

  const getChartData = useMemo(() => {
    if (!selectedUser?.history?.purchaseHistory) return [];
    const purchasesByYear = {};
    selectedUser.history.purchaseHistory.forEach((purchase) => {
      const year = new Date(purchase.purchase_date).getFullYear();
      if (!purchasesByYear[year]) purchasesByYear[year] = 0;
      purchasesByYear[year] += purchase.amount;
    });
    return Object.keys(purchasesByYear).sort((a, b) => a - b).map((year) => ({
      year,
      revenue: purchasesByYear[year],
    }));
  }, [selectedUser]);

  const getMonthlyChartData = useMemo(() => {
    if (!selectedUser?.history?.purchaseHistory) return [];
    const monthlyData = {};
    selectedUser.history.purchaseHistory.forEach((purchase) => {
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
  }, [selectedUser]);

  const getPlanDistributionData = useMemo(() => {
    if (!selectedUser?.history?.purchaseHistory) return [];
    const planCounts = {};
    selectedUser.history.purchaseHistory.forEach((purchase) => {
      const plan = purchase.plan?.name || "Unknown";
      planCounts[plan] = (planCounts[plan] || 0) + 1;
    });
    return Object.keys(planCounts).map((plan) => ({
      name: plan,
      value: planCounts[plan],
      color: getPlanColor(plan),
    }));
  }, [selectedUser]);

  const getPaymentMethodData = useMemo(() => {
    if (!selectedUser?.history?.purchaseHistory) return [];
    const methodCounts = {};
    selectedUser.history.purchaseHistory.forEach((purchase) => {
      const method = purchase.payment_method || "Unknown";
      methodCounts[method] = (methodCounts[method] || 0) + 1;
    });
    return Object.keys(methodCounts).map((method) => ({
      name: method,
      value: methodCounts[method],
    }));
  }, [selectedUser]);

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
    if (!selectedUser?.history?.purchaseHistory) return { favoritePlan: "N/A", upgrades: 0, planChanges: 0, avgDuration: 0 };
    const planCounts = {};
    selectedUser.history.purchaseHistory.forEach((purchase) => {
      const plan = purchase.plan?.name || "Unknown";
      planCounts[plan] = (planCounts[plan] || 0) + 1;
    });
    const favoritePlan = Object.keys(planCounts).reduce(
      (a, b) => (planCounts[a] > planCounts[b] ? a : b),
      selectedUser.history.purchaseHistory[0]?.plan?.name || "N/A"
    );
    const upgrades = selectedUser.history.purchaseHistory.filter(
      (purchase, index) =>
        index > 0 &&
        purchase.amount > selectedUser.history.purchaseHistory[index - 1].amount
    ).length;

    const planChanges = selectedUser.history.purchaseHistory.length - 1;

    const durations = selectedUser.history.purchaseHistory.map((purchase) => {
      if (purchase.duration?.includes("month")) {
        return parseInt(purchase.duration) || 1;
      }
      return 1;
    });
    const avgDuration = durations.reduce((sum, dur) => sum + dur, 0) / durations.length;

    return { favoritePlan, upgrades, planChanges, avgDuration };
  }, [selectedUser]);

  const getSpendingTrend = useMemo(() => {
    if (!selectedUser?.history?.purchaseHistory || selectedUser.history.purchaseHistory.length < 2) return "stable";
    const firstPrice = selectedUser.history.purchaseHistory[0].amount;
    const lastPrice = selectedUser.history.purchaseHistory[selectedUser.history.purchaseHistory.length - 1].amount;
    return lastPrice > firstPrice ? "up" : lastPrice < firstPrice ? "down" : "stable";
  }, [selectedUser]);

  const viewPurchaseDetails = useCallback((purchase) => {
    setSelectedPurchase(purchase);
  }, []);

  const closePurchaseDetails = useCallback(() => {
    setSelectedPurchase(null);
  }, []);

  if (authLoading || isLoading) {
    return (
      <div className={`flex justify-center items-center min-h-screen transition-colors duration-300 ${containerClass}`}>
        <FaSpinner className="animate-spin text-4xl text-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${containerClass}`}>
        <p className="text-red-500">Please log in to access client profiles.</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${containerClass}`}>
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        {error && (
          <div className={`mb-4 p-4 rounded-lg ${
            theme === "dark" ? "bg-red-900/20 text-red-300" : "bg-red-100 text-red-700"
          }`}>
            {error}
          </div>
        )}
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className={`text-xl md:text-3xl font-bold ${
              theme === "dark" ? "text-white" : "text-gray-800"
            }`}>
              Client Dashboard
            </h1>
            <p className={`${theme === "dark" ? "text-gray-300" : "text-gray-500"}`}>
              Monitor and manage client profiles, subscriptions, and communications
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User List */}
          <div className={`lg:col-span-1 rounded-xl shadow-sm border overflow-hidden transition-colors duration-300 ${cardClass}`}>
            <div className={`p-4 border-b ${
              theme === "dark" ? "border-gray-700" : "border-gray-100"
            }`}>
              <h2 className={`font-semibold flex items-center gap-2 ${
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}>
                <UserIcon className="text-blue-500" size={18} />
                Clients ({filteredUsers.filter((u) => u.active).length}/{filteredUsers.length})
              </h2>
              <div className="flex space-x-1 mt-2">
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`px-2 py-1 text-xs rounded-md ${
                    activeFilter === 'all' 
                      ? 'bg-blue-500 text-white' 
                      : theme === "dark" 
                        ? 'bg-gray-700 text-gray-300' 
                        : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setActiveFilter('active')}
                  className={`px-2 py-1 text-xs rounded-md ${
                    activeFilter === 'active' 
                      ? 'bg-green-500 text-white' 
                      : theme === "dark" 
                        ? 'bg-gray-700 text-gray-300' 
                        : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() => setActiveFilter('inactive')}
                  className={`px-2 py-1 text-xs rounded-md ${
                    activeFilter === 'inactive' 
                      ? 'bg-red-500 text-white' 
                      : theme === "dark" 
                        ? 'bg-gray-700 text-gray-300' 
                        : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Inactive
                </button>
              </div>
            </div>
            
            <div className={`divide-y ${
              theme === "dark" ? "divide-gray-700" : "divide-gray-100"
            }`}>
              {currentUsers.length > 0 ? (
                currentUsers.map((user) => (
                  <div
                    key={user.id}
                    className={`p-4 hover:bg-opacity-50 cursor-pointer transition-colors ${
                      theme === "dark" 
                        ? "hover:bg-gray-700" 
                        : "hover:bg-gray-50"
                    } ${
                      selectedUser?.id === user.id 
                        ? theme === "dark" 
                          ? "bg-blue-900/20" 
                          : "bg-blue-50"
                        : ""
                    }`}
                    onClick={() => handleView(user)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            user.active 
                              ? theme === "dark"
                                ? "bg-green-900/20 text-green-400"
                                : "bg-green-100 text-green-600"
                              : theme === "dark"
                                ? "bg-gray-700 text-gray-400"
                                : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          <User size={20} />
                        </div>
                        <div>
                          <h3 className={`font-medium ${
                            theme === "dark" ? "text-white" : "text-gray-800"
                          }`}>
                            {user.username}
                          </h3>
                          <p className={`text-sm ${
                            theme === "dark" ? "text-gray-400" : "text-gray-500"
                          }`}>
                            {user.hasPlan ? `${user.subscription?.plan?.name || 'No Plan'} Plan` : 'No Plan'}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className={theme === "dark" ? "text-gray-500" : "text-gray-400"} size={18} />
                    </div>
                    
                    <div className="mt-3 flex items-center justify-between text-sm">
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
                      <span className={theme === "dark" ? "text-gray-400" : "text-gray-500"}>
                        {user.phonenumber}
                      </span>
                    </div>
                    
                    {!user.hasPlan && (
                      <div className="mt-2 flex items-center text-xs text-yellow-600">
                        <AlertTriangle size={14} className="mr-1" />
                        <span>No active subscription</span>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className={`p-4 text-center ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}>
                  No clients found
                </div>
              )}
            </div>
            
            {filteredUsers.length > usersPerPage && (
              <div className={`p-4 border-t ${
                theme === "dark" ? "border-gray-700" : "border-gray-100"
              } flex items-center justify-between`}>
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-md ${
                    currentPage === 1 
                      ? theme === "dark" 
                        ? "text-gray-600 cursor-not-allowed" 
                        : "text-gray-400 cursor-not-allowed"
                      : theme === "dark"
                        ? "text-gray-300 hover:bg-gray-700"
                        : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <ChevronLeft size={18} />
                </button>
                <span className={`text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-md ${
                    currentPage === totalPages 
                      ? theme === "dark" 
                        ? "text-gray-600 cursor-not-allowed" 
                        : "text-gray-400 cursor-not-allowed"
                      : theme === "dark"
                        ? "text-gray-300 hover:bg-gray-700"
                        : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>

          {/* User Details */}
          {selectedUser && (
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Card */}
              <div className={`rounded-xl shadow-sm border p-6 transition-colors duration-300 ${cardClass}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                      selectedUser.active 
                        ? "bg-gradient-to-br from-green-100 to-teal-100"
                        : "bg-gradient-to-br from-gray-100 to-gray-200"
                    } ${
                      theme === "dark" 
                        ? selectedUser.active 
                          ? "from-green-900/20 to-teal-900/20" 
                          : "from-gray-700 to-gray-800"
                        : ""
                    }`}>
                      <User className={
                        selectedUser.active 
                          ? "text-green-600" 
                          : "text-gray-500"
                      } size={28} />
                    </div>
                    <div>
                      <h2 className={`text-xl font-bold ${
                        theme === "dark" ? "text-white" : "text-gray-800"
                      }`}>
                        {selectedUser.username}
                      </h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            selectedUser.active 
                              ? theme === "dark"
                                ? "bg-green-900/20 text-green-400"
                                : "bg-green-100 text-green-700"
                              : theme === "dark"
                                ? "bg-red-900/20 text-red-400"
                                : "bg-red-100 text-red-700"
                          }`}
                        >
                          {selectedUser.active ? "Active" : "Inactive"}
                        </span>
                        {selectedUser.hasPlan ? (
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            theme === "dark" 
                              ? "bg-blue-900/20 text-blue-400" 
                              : "bg-blue-100 text-blue-700"
                          }`}>
                            {selectedUser.subscription?.plan?.name} Plan
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
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedUser.active && selectedUser.router && (
                      <button
                        onClick={handleDisconnectHotspot}
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
                          <Power size={16} />
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

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  {[
                    { label: "Username", value: selectedUser.username, icon: User },
                    { label: "Phone", value: selectedUser.phonenumber, icon: Phone },
                    { label: "Device", value: selectedUser.device, icon: HardDrive },
                    { label: "Location", value: selectedUser.location, icon: Shield }
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
                        {item.value}
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
                  {["overview", "subscription", "history", "communication"].map((tab) => (
                    <button
                      key={tab}
                      className={`flex-shrink-0 px-6 py-3 font-medium text-sm ${
                        activeTab === tab 
                          ? theme === "dark"
                            ? "text-blue-400 border-b-2 border-blue-400"
                            : "text-blue-600 border-b-2 border-blue-600"
                          : theme === "dark"
                            ? "text-gray-400 hover:text-gray-300"
                            : "text-gray-500 hover:text-gray-700"
                      }`}
                      onClick={() => setActiveTab(tab)}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>

                <div className="p-6">
                  {/* Overview Tab */}
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      {/* Current Plan Summary */}
                      {selectedUser.hasPlan ? (
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
                                { label: "Plan Type", value: selectedUser.subscription.plan?.name, icon: CreditCard, color: "blue" },
                                { label: "Payment Status", value: selectedUser.paymentStatus, icon: PaymentStatusIcon, color: "purple" }
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
                                { label: "Start Date", value: formatDate(selectedUser.subscription.start_date), icon: CalendarDays, color: "green" },
                                { label: "Expiry Date", value: formatDate(selectedUser.subscription.expiry_date), icon: CalendarDays, color: "orange" }
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
                          
                          <div className="mt-6">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <DataUsageIcon
                                  used={selectedUser.data_usage?.used || 0}
                                  total={selectedUser.data_usage?.total || 1}
                                  isUnlimited={selectedUser.isUnlimited}
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
                                {selectedUser.isUnlimited
                                  ? "Unlimited"
                                  : `${selectedUser.data_usage?.used || 0} ${selectedUser.data_usage?.unit || 'GB'} of ${selectedUser.data_usage?.total || 0} ${selectedUser.data_usage?.unit || 'GB'}`}
                              </span>
                            </div>
                            
                            <div className="mb-2">
                              <DataUsageBar
                                used={selectedUser.data_usage?.used || 0}
                                total={selectedUser.data_usage?.total || 1}
                                isUnlimited={selectedUser.isUnlimited}
                                theme={theme}
                              />
                            </div>
                            
                            <div className={`flex items-center justify-between text-xs ${
                              theme === "dark" ? "text-gray-400" : "text-gray-500"
                            }`}>
                              <span>0 {selectedUser.data_usage?.unit || 'GB'}</span>
                              <span>{selectedUser.isUnlimited ? "∞" : `${selectedUser.data_usage?.total || 0} ${selectedUser.data_usage?.unit || 'GB'}`}</span>
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
                                <AlertTriangle size={18} />
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

                      {/* Customer Summary */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                          { label: "Total Revenue", value: formatCurrency(selectedUser.totalRevenue) },
                          { label: "Avg. Monthly Spend", value: formatCurrency(selectedUser.avgMonthlySpend) },
                          { label: "Renewal Frequency", value: selectedUser.renewalFrequency },
                          { label: "Loyalty Duration", value: `${selectedUser.loyaltyDuration} months` }
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
                      {selectedUser.hasPlan ? (
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div className="space-y-4">
                              {[
                                { label: "Plan Type", value: selectedUser.subscription.plan?.name, icon: CreditCard, color: "blue" },
                                { label: "Payment Status", value: selectedUser.paymentStatus, icon: PaymentStatusIcon, color: "purple" }
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
                                { label: "Start Date", value: formatDate(selectedUser.subscription.start_date), icon: CalendarDays, color: "green" },
                                { label: "Expiry Date", value: formatDate(selectedUser.subscription.expiry_date), icon: CalendarDays, color: "orange" }
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
                                used={selectedUser.data_usage?.used || 0}
                                total={selectedUser.data_usage?.total || 1}
                                isUnlimited={selectedUser.isUnlimited}
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
                              {selectedUser.isUnlimited
                                ? "Unlimited"
                                : `${selectedUser.data_usage?.used || 0} ${selectedUser.data_usage?.unit || 'GB'} of ${selectedUser.data_usage?.total || 0} ${selectedUser.data_usage?.unit || 'GB'}`}
                            </span>
                          </div>
                          
                          <div className="mb-2">
                            <DataUsageBar
                              used={selectedUser.data_usage?.used || 0}
                              total={selectedUser.data_usage?.total || 1}
                              isUnlimited={selectedUser.isUnlimited}
                              theme={theme}
                            />
                          </div>
                          
                          <div className={`flex items-center justify-between text-xs ${
                            theme === "dark" ? "text-gray-400" : "text-gray-500"
                          }`}>
                            <span>0 {selectedUser.data_usage?.unit || 'GB'}</span>
                            <span>{selectedUser.isUnlimited ? "∞" : `${selectedUser.data_usage?.total || 0} ${selectedUser.data_usage?.unit || 'GB'}`}</span>
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
                      {selectedUser.history?.purchaseHistory?.length > 0 || selectedUser.history?.visitedSites?.length > 0 ? (
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
                                onClick={() => exportBrowsingHistoryToCSV(selectedUser.history.visitedSites)}
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
                                  {selectedUser.history.visitedSites && selectedUser.history.visitedSites.length > 0 ? (
                                    selectedUser.history.visitedSites.map((site, index) => (
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
                                      selectedUser.history.purchaseHistory.map((p) =>
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
                                  onClick={() => exportToCSV(selectedUser.history)}
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
                                          <ArrowUpRight size={16} />
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

                  {/* Communication Log Tab */}
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
                        {selectedUser.communication_logs && selectedUser.communication_logs.length > 0 ? (
                          <div className="space-y-3">
                            {selectedUser.communication_logs.map((log) => (
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
                        This plan expired on {formatDate(selectedUser.subscription?.expiry_date)}
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

export default ClientDashboard;