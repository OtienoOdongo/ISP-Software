









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

// // Theme-based background classes
// const getContainerClass = (theme) => theme === "dark" 
//   ? "bg-gradient-to-br from-gray-900 to-indigo-900 text-white min-h-screen" 
//   : "bg-gray-50 text-gray-800 min-h-screen";

// const getCardClass = (theme) => theme === "dark"
//   ? "bg-gray-800/60 backdrop-blur-md border-gray-700"
//   : "bg-white border-gray-200";

// const getInputClass = (theme) => theme === "dark"
//   ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
//   : "bg-white border-gray-300 text-gray-800 placeholder-gray-500";

// // Memoized components to prevent unnecessary re-renders
// const DataUsageBar = React.memo(({ used, total, isUnlimited, theme }) => {
//   if (isUnlimited) {
//     return (
//       <div className={`w-full bg-gradient-to-r from-purple-100 to-blue-100 rounded-full h-3 relative overflow-hidden ${
//         theme === "dark" ? "from-purple-900 to-blue-900" : ""
//       }`}>
//         <div className={`absolute inset-0 bg-gradient-to-r from-purple-400 via-blue-500 to-teal-400 opacity-70 animate-pulse rounded-full ${
//           theme === "dark" ? "from-purple-600 via-blue-600 to-teal-600" : ""
//         }`}></div>
//       </div>
//     );
//   }

//   const percentage = Math.min((used / parseFloat(total || 1)) * 100, 100);
//   let colorClass = "bg-green-500";
//   if (percentage > 80) colorClass = "bg-yellow-500";
//   if (percentage > 95) colorClass = "bg-red-500";

//   if (theme === "dark") {
//     if (percentage > 80) colorClass = "bg-yellow-600";
//     if (percentage > 95) colorClass = "bg-red-600";
//   }

//   return (
//     <div className={`w-full rounded-full h-3 overflow-hidden ${
//       theme === "dark" ? "bg-gray-700" : "bg-gray-200"
//     }`}>
//       <div
//         className={`${colorClass} h-3 rounded-full transition-all duration-500`}
//         style={{ width: `${percentage}%` }}
//       ></div>
//     </div>
//   );
// });

// const DataUsageIcon = React.memo(({ used, total, isUnlimited }) => {
//   if (isUnlimited) return <Zap className="text-purple-500" size={18} />;
//   const percentage = used / parseFloat(total || 1);
//   if (percentage < 0.3) return <BatteryFull className="text-green-500" size={18} />;
//   if (percentage < 0.7) return <BatteryMedium className="text-yellow-500" size={18} />;
//   return <BatteryLow className="text-red-500" size={18} />;
// });

// const PaymentStatusIcon = React.memo(({ status }) => {
//   switch (status) {
//     case "Paid":
//       return <BadgeCheck className="text-green-500" size={18} />;
//     case "Due":
//       return <Clock className="text-yellow-500" size={18} />;
//     case "Expired":
//       return <AlertTriangle className="text-red-500" size={18} />;
//     default:
//       return <CreditCard className="text-gray-500" size={18} />;
//   }
// });

// const MessageTypeIcon = React.memo(({ type }) => {
//   switch (type) {
//     case "sms":
//       return <MessageSquare className="text-blue-500" size={16} />;
//     case "email":
//       return <Mail className="text-green-500" size={16} />;
//     case "system":
//       return <Bell className="text-purple-500" size={16} />;
//     default:
//       return <MessageSquare className="text-gray-500" size={16} />;
//   }
// });

// const StatusBadge = React.memo(({ status, theme }) => {
//   let bgColor = theme === "dark" ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-700";
//   if (status === "delivered") bgColor = theme === "dark" ? "bg-green-900 text-green-300" : "bg-green-100 text-green-700";
//   if (status === "failed") bgColor = theme === "dark" ? "bg-red-900 text-red-300" : "bg-red-100 text-red-700";
  
//   return (
//     <span className={`px-2 py-1 rounded-full text-xs ${bgColor}`}>
//       {status.charAt(0).toUpperCase() + status.slice(1)}
//     </span>
//   );
// });

// const Subscribers = () => {
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

//   // Theme classes
//   const containerClass = useMemo(() => getContainerClass(theme), [theme]);
//   const cardClass = useMemo(() => getCardClass(theme), [theme]);
//   const inputClass = useMemo(() => getInputClass(theme), [theme]);

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
//       <div className={`flex justify-center items-center min-h-screen transition-colors duration-300 ${containerClass}`}>
//         <FaSpinner className="animate-spin text-4xl text-blue-600" />
//       </div>
//     );
//   }

//   if (!isAuthenticated) {
//     return (
//       <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${containerClass}`}>
//         <p className="text-red-500">Please log in to access client profiles.</p>
//       </div>
//     );
//   }

//   return (
//     <div className={`min-h-screen transition-colors duration-300 ${containerClass}`}>
//       <div className="p-4 md:p-8 max-w-7xl mx-auto">
//         {error && (
//           <div className={`mb-4 p-4 rounded-lg ${
//             theme === "dark" ? "bg-red-900/20 text-red-300" : "bg-red-100 text-red-700"
//           }`}>
//             {error}
//           </div>
//         )}
        
//         <div className="flex items-center justify-between mb-8">
//           <div>
//             <h1 className={`text-xl md:text-3xl font-bold ${
//               theme === "dark" ? "text-white" : "text-gray-800"
//             }`}>
//               Client Dashboard
//             </h1>
//             <p className={`${theme === "dark" ? "text-gray-300" : "text-gray-500"}`}>
//               Monitor and manage client profiles, subscriptions, and communications
//             </p>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* User List */}
//           <div className={`lg:col-span-1 rounded-xl shadow-sm border overflow-hidden transition-colors duration-300 ${cardClass}`}>
//             <div className={`p-4 border-b ${
//               theme === "dark" ? "border-gray-700" : "border-gray-100"
//             }`}>
//               <h2 className={`font-semibold flex items-center gap-2 ${
//                 theme === "dark" ? "text-gray-300" : "text-gray-700"
//               }`}>
//                 <UserIcon className="text-blue-500" size={18} />
//                 Clients ({filteredUsers.filter((u) => u.active).length}/{filteredUsers.length})
//               </h2>
//               <div className="flex space-x-1 mt-2">
//                 <button
//                   onClick={() => setActiveFilter('all')}
//                   className={`px-2 py-1 text-xs rounded-md ${
//                     activeFilter === 'all' 
//                       ? 'bg-blue-500 text-white' 
//                       : theme === "dark" 
//                         ? 'bg-gray-700 text-gray-300' 
//                         : 'bg-gray-100 text-gray-700'
//                   }`}
//                 >
//                   All
//                 </button>
//                 <button
//                   onClick={() => setActiveFilter('active')}
//                   className={`px-2 py-1 text-xs rounded-md ${
//                     activeFilter === 'active' 
//                       ? 'bg-green-500 text-white' 
//                       : theme === "dark" 
//                         ? 'bg-gray-700 text-gray-300' 
//                         : 'bg-gray-100 text-gray-700'
//                   }`}
//                 >
//                   Active
//                 </button>
//                 <button
//                   onClick={() => setActiveFilter('inactive')}
//                   className={`px-2 py-1 text-xs rounded-md ${
//                     activeFilter === 'inactive' 
//                       ? 'bg-red-500 text-white' 
//                       : theme === "dark" 
//                         ? 'bg-gray-700 text-gray-300' 
//                         : 'bg-gray-100 text-gray-700'
//                   }`}
//                 >
//                   Inactive
//                 </button>
//               </div>
//             </div>
            
//             <div className={`divide-y ${
//               theme === "dark" ? "divide-gray-700" : "divide-gray-100"
//             }`}>
//               {currentUsers.length > 0 ? (
//                 currentUsers.map((user) => (
//                   <div
//                     key={user.id}
//                     className={`p-4 hover:bg-opacity-50 cursor-pointer transition-colors ${
//                       theme === "dark" 
//                         ? "hover:bg-gray-700" 
//                         : "hover:bg-gray-50"
//                     } ${
//                       selectedUser?.id === user.id 
//                         ? theme === "dark" 
//                           ? "bg-blue-900/20" 
//                           : "bg-blue-50"
//                         : ""
//                     }`}
//                     onClick={() => handleView(user)}
//                   >
//                     <div className="flex items-center justify-between">
//                       <div className="flex items-center gap-3">
//                         <div
//                           className={`w-10 h-10 rounded-full flex items-center justify-center ${
//                             user.active 
//                               ? theme === "dark"
//                                 ? "bg-green-900/20 text-green-400"
//                                 : "bg-green-100 text-green-600"
//                               : theme === "dark"
//                                 ? "bg-gray-700 text-gray-400"
//                                 : "bg-gray-100 text-gray-500"
//                           }`}
//                         >
//                           <User size={20} />
//                         </div>
//                         <div>
//                           <h3 className={`font-medium ${
//                             theme === "dark" ? "text-white" : "text-gray-800"
//                           }`}>
//                             {user.username}
//                           </h3>
//                           <p className={`text-sm ${
//                             theme === "dark" ? "text-gray-400" : "text-gray-500"
//                           }`}>
//                             {user.hasPlan ? `${user.subscription?.plan?.name || 'No Plan'} Plan` : 'No Plan'}
//                           </p>
//                         </div>
//                       </div>
//                       <ChevronRight className={theme === "dark" ? "text-gray-500" : "text-gray-400"} size={18} />
//                     </div>
                    
//                     <div className="mt-3 flex items-center justify-between text-sm">
//                       <span
//                         className={`px-2 py-1 rounded-full text-xs ${
//                           user.active 
//                             ? theme === "dark"
//                               ? "bg-green-900/20 text-green-400"
//                               : "bg-green-100 text-green-700"
//                             : theme === "dark"
//                               ? "bg-red-900/20 text-red-400"
//                               : "bg-red-100 text-red-700"
//                         }`}
//                       >
//                         {user.active ? "Active" : "Inactive"}
//                       </span>
//                       <span className={theme === "dark" ? "text-gray-400" : "text-gray-500"}>
//                         {user.phonenumber}
//                       </span>
//                     </div>
                    
//                     {!user.hasPlan && (
//                       <div className="mt-2 flex items-center text-xs text-yellow-600">
//                         <AlertTriangle size={14} className="mr-1" />
//                         <span>No active subscription</span>
//                       </div>
//                     )}
//                   </div>
//                 ))
//               ) : (
//                 <div className={`p-4 text-center ${
//                   theme === "dark" ? "text-gray-400" : "text-gray-500"
//                 }`}>
//                   No clients found
//                 </div>
//               )}
//             </div>
            
//             {filteredUsers.length > usersPerPage && (
//               <div className={`p-4 border-t ${
//                 theme === "dark" ? "border-gray-700" : "border-gray-100"
//               } flex items-center justify-between`}>
//                 <button
//                   onClick={() => paginate(currentPage - 1)}
//                   disabled={currentPage === 1}
//                   className={`p-2 rounded-md ${
//                     currentPage === 1 
//                       ? theme === "dark" 
//                         ? "text-gray-600 cursor-not-allowed" 
//                         : "text-gray-400 cursor-not-allowed"
//                       : theme === "dark"
//                         ? "text-gray-300 hover:bg-gray-700"
//                         : "text-gray-700 hover:bg-gray-100"
//                   }`}
//                 >
//                   <ChevronLeft size={18} />
//                 </button>
//                 <span className={`text-sm ${
//                   theme === "dark" ? "text-gray-400" : "text-gray-600"
//                 }`}>
//                   Page {currentPage} of {totalPages}
//                 </span>
//                 <button
//                   onClick={() => paginate(currentPage + 1)}
//                   disabled={currentPage === totalPages}
//                   className={`p-2 rounded-md ${
//                     currentPage === totalPages 
//                       ? theme === "dark" 
//                         ? "text-gray-600 cursor-not-allowed" 
//                         : "text-gray-400 cursor-not-allowed"
//                       : theme === "dark"
//                         ? "text-gray-300 hover:bg-gray-700"
//                         : "text-gray-700 hover:bg-gray-100"
//                   }`}
//                 >
//                   <ChevronRight size={18} />
//                 </button>
//               </div>
//             )}
//           </div>

//           {/* User Details */}
//           {selectedUser && (
//             <div className="lg:col-span-2 space-y-6">
//               {/* Profile Card */}
//               <div className={`rounded-xl shadow-sm border p-6 transition-colors duration-300 ${cardClass}`}>
//                 <div className="flex items-start justify-between">
//                   <div className="flex items-center gap-4">
//                     <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
//                       selectedUser.active 
//                         ? "bg-gradient-to-br from-green-100 to-teal-100"
//                         : "bg-gradient-to-br from-gray-100 to-gray-200"
//                     } ${
//                       theme === "dark" 
//                         ? selectedUser.active 
//                           ? "from-green-900/20 to-teal-900/20" 
//                           : "from-gray-700 to-gray-800"
//                         : ""
//                     }`}>
//                       <User className={
//                         selectedUser.active 
//                           ? "text-green-600" 
//                           : "text-gray-500"
//                       } size={28} />
//                     </div>
//                     <div>
//                       <h2 className={`text-xl font-bold ${
//                         theme === "dark" ? "text-white" : "text-gray-800"
//                       }`}>
//                         {selectedUser.username}
//                       </h2>
//                       <div className="flex items-center gap-2 mt-1">
//                         <span
//                           className={`px-2 py-1 rounded-full text-xs ${
//                             selectedUser.active 
//                               ? theme === "dark"
//                                 ? "bg-green-900/20 text-green-400"
//                                 : "bg-green-100 text-green-700"
//                               : theme === "dark"
//                                 ? "bg-red-900/20 text-red-400"
//                                 : "bg-red-100 text-red-700"
//                           }`}
//                         >
//                           {selectedUser.active ? "Active" : "Inactive"}
//                         </span>
//                         {selectedUser.hasPlan ? (
//                           <span className={`px-2 py-1 rounded-full text-xs ${
//                             theme === "dark" 
//                               ? "bg-blue-900/20 text-blue-400" 
//                               : "bg-blue-100 text-blue-700"
//                           }`}>
//                             {selectedUser.subscription?.plan?.name} Plan
//                           </span>
//                         ) : (
//                           <span className={`px-2 py-1 rounded-full text-xs ${
//                             theme === "dark" 
//                               ? "bg-yellow-900/20 text-yellow-400" 
//                               : "bg-yellow-100 text-yellow-700"
//                           }`}>
//                             No Active Plan
//                           </span>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     {selectedUser.active && selectedUser.router && (
//                       <button
//                         onClick={handleDisconnectHotspot}
//                         disabled={isDisconnecting}
//                         className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm hover:bg-red-600 disabled:opacity-50 ${
//                           theme === "dark" 
//                             ? "bg-red-600 text-white hover:bg-red-700" 
//                             : "bg-red-500 text-white hover:bg-red-600"
//                         }`}
//                       >
//                         {isDisconnecting ? (
//                           <FaSpinner className="animate-spin" />
//                         ) : (
//                           <Power size={16} />
//                         )}
//                         Disconnect
//                       </button>
//                     )}
//                     <button
//                       className={theme === "dark" ? "text-gray-400 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"}
//                       onClick={handleEditToggle}
//                     >
//                       <MoreVertical size={18} />
//                     </button>
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6">
//                   {[
//                     { label: "Username", value: selectedUser.username, icon: User },
//                     { label: "Phone", value: selectedUser.phonenumber, icon: Phone },
//                     { label: "Device", value: selectedUser.device, icon: HardDrive },
//                     { label: "Location", value: selectedUser.location, icon: Shield }
//                   ].map((item, index) => (
//                     <div key={index} className={`p-3 rounded-lg ${
//                       theme === "dark" ? "bg-gray-700" : "bg-gray-50"
//                     }`}>
//                       <div className={`flex items-center gap-2 ${
//                         theme === "dark" ? "text-gray-400" : "text-gray-500"
//                       }`}>
//                         <item.icon size={16} />
//                         <span className="text-xs">{item.label}</span>
//                       </div>
//                       <p className={`font-medium mt-1 ${
//                         theme === "dark" ? "text-white" : "text-gray-800"
//                       }`}>
//                         {item.value}
//                       </p>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               {/* Tab Navigation */}
//               <div className={`rounded-xl shadow-sm border overflow-hidden transition-colors duration-300 ${cardClass}`}>
//                 <div className={`flex border-b overflow-x-auto ${
//                   theme === "dark" ? "border-gray-700" : "border-gray-100"
//                 }`}>
//                   {["overview", "subscription", "history", "communication"].map((tab) => (
//                     <button
//                       key={tab}
//                       className={`flex-shrink-0 px-6 py-3 font-medium text-sm ${
//                         activeTab === tab 
//                           ? theme === "dark"
//                             ? "text-blue-400 border-b-2 border-blue-400"
//                             : "text-blue-600 border-b-2 border-blue-600"
//                           : theme === "dark"
//                             ? "text-gray-400 hover:text-gray-300"
//                             : "text-gray-500 hover:text-gray-700"
//                       }`}
//                       onClick={() => setActiveTab(tab)}
//                     >
//                       {tab.charAt(0).toUpperCase() + tab.slice(1)}
//                     </button>
//                   ))}
//                 </div>

//                 <div className="p-6">
//                   {/* Overview Tab */}
//                   {activeTab === 'overview' && (
//                     <div className="space-y-6">
//                       {/* Current Plan Summary */}
//                       {selectedUser.hasPlan ? (
//                         <div className={`p-6 rounded-lg ${
//                           theme === "dark" 
//                             ? "bg-blue-900/20" 
//                             : "bg-gradient-to-r from-blue-50 to-purple-50"
//                         }`}>
//                           <h3 className={`text-lg font-semibold mb-4 ${
//                             theme === "dark" ? "text-white" : "text-gray-800"
//                           }`}>
//                             Current Plan Summary
//                           </h3>
//                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                             <div className="space-y-4">
//                               {[
//                                 { label: "Plan Type", value: selectedUser.subscription.plan?.name, icon: CreditCard, color: "blue" },
//                                 { label: "Payment Status", value: selectedUser.paymentStatus, icon: PaymentStatusIcon, color: "purple" }
//                               ].map((item, index) => (
//                                 <div key={index} className="flex items-center gap-3">
//                                   <div className={`p-2 rounded-lg ${
//                                     theme === "dark" 
//                                       ? `bg-${item.color}-900/20 text-${item.color}-400`
//                                       : `bg-${item.color}-100 text-${item.color}-600`
//                                   }`}>
//                                     {typeof item.icon === 'function' ? <item.icon status={item.value} /> : <item.icon size={18} />}
//                                   </div>
//                                   <div>
//                                     <p className={`text-xs ${
//                                       theme === "dark" ? "text-gray-400" : "text-gray-500"
//                                     }`}>
//                                       {item.label}
//                                     </p>
//                                     <p className={`font-medium capitalize ${
//                                       theme === "dark" ? "text-white" : "text-gray-800"
//                                     }`}>
//                                       {item.value}
//                                     </p>
//                                   </div>
//                                 </div>
//                               ))}
//                             </div>
//                             <div className="space-y-4">
//                               {[
//                                 { label: "Start Date", value: formatDate(selectedUser.subscription.start_date), icon: CalendarDays, color: "green" },
//                                 { label: "Expiry Date", value: formatDate(selectedUser.subscription.expiry_date), icon: CalendarDays, color: "orange" }
//                               ].map((item, index) => (
//                                 <div key={index} className="flex items-center gap-3">
//                                   <div className={`p-2 rounded-lg ${
//                                     theme === "dark" 
//                                       ? `bg-${item.color}-900/20 text-${item.color}-400`
//                                       : `bg-${item.color}-100 text-${item.color}-600`
//                                   }`}>
//                                     <item.icon size={18} />
//                                   </div>
//                                   <div>
//                                     <p className={`text-xs ${
//                                       theme === "dark" ? "text-gray-400" : "text-gray-500"
//                                     }`}>
//                                       {item.label}
//                                     </p>
//                                     <p className={`font-medium ${
//                                       theme === "dark" ? "text-white" : "text-gray-800"
//                                     }`}>
//                                       {item.value}
//                                     </p>
//                                   </div>
//                                 </div>
//                               ))}
//                             </div>
//                           </div>
                          
//                           <div className="mt-6">
//                             <div className="flex items-center justify-between mb-3">
//                               <div className="flex items-center gap-2">
//                                 <DataUsageIcon
//                                   used={selectedUser.data_usage?.used || 0}
//                                   total={selectedUser.data_usage?.total || 1}
//                                   isUnlimited={selectedUser.isUnlimited}
//                                 />
//                                 <span className={`font-medium ${
//                                   theme === "dark" ? "text-white" : "text-gray-800"
//                                 }`}>
//                                   Data Consumption
//                                 </span>
//                               </div>
//                               <span className={`text-sm font-medium ${
//                                 theme === "dark" ? "text-white" : "text-gray-800"
//                               }`}>
//                                 {selectedUser.isUnlimited
//                                   ? "Unlimited"
//                                   : `${selectedUser.data_usage?.used || 0} ${selectedUser.data_usage?.unit || 'GB'} of ${selectedUser.data_usage?.total || 0} ${selectedUser.data_usage?.unit || 'GB'}`}
//                               </span>
//                             </div>
                            
//                             <div className="mb-2">
//                               <DataUsageBar
//                                 used={selectedUser.data_usage?.used || 0}
//                                 total={selectedUser.data_usage?.total || 1}
//                                 isUnlimited={selectedUser.isUnlimited}
//                                 theme={theme}
//                               />
//                             </div>
                            
//                             <div className={`flex items-center justify-between text-xs ${
//                               theme === "dark" ? "text-gray-400" : "text-gray-500"
//                             }`}>
//                               <span>0 {selectedUser.data_usage?.unit || 'GB'}</span>
//                               <span>{selectedUser.isUnlimited ? "∞" : `${selectedUser.data_usage?.total || 0} ${selectedUser.data_usage?.unit || 'GB'}`}</span>
//                             </div>
//                           </div>
//                         </div>
//                       ) : (
//                         <div className={`p-6 rounded-lg ${
//                           theme === "dark" ? "bg-yellow-900/20" : "bg-yellow-50"
//                         }`}>
//                           <div className="flex items-center justify-between">
//                             <div className="flex items-center gap-3">
//                               <div className={`p-2 rounded-lg ${
//                                 theme === "dark" ? "bg-yellow-900/20 text-yellow-400" : "bg-yellow-100 text-yellow-600"
//                               }`}>
//                                 <AlertTriangle size={18} />
//                               </div>
//                               <div>
//                                 <h3 className={`font-medium ${
//                                   theme === "dark" ? "text-white" : "text-gray-800"
//                                 }`}>
//                                   No Active Plan
//                                 </h3>
//                                 <p className={`text-sm ${
//                                   theme === "dark" ? "text-gray-400" : "text-gray-500"
//                                 }`}>
//                                   This client doesn't have an active subscription
//                                 </p>
//                               </div>
//                             </div>
//                             <button className={`px-3 py-1 rounded-lg text-sm ${
//                               theme === "dark" 
//                                 ? "bg-blue-600 text-white hover:bg-blue-700" 
//                                 : "bg-blue-500 text-white hover:bg-blue-600"
//                             }`}>
//                               Assign Plan
//                             </button>
//                           </div>
//                         </div>
//                       )}

//                       {/* Customer Summary */}
//                       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
//                         {[
//                           { label: "Total Revenue", value: formatCurrency(selectedUser.totalRevenue) },
//                           { label: "Avg. Monthly Spend", value: formatCurrency(selectedUser.avgMonthlySpend) },
//                           { label: "Renewal Frequency", value: selectedUser.renewalFrequency },
//                           { label: "Loyalty Duration", value: `${selectedUser.loyaltyDuration} months` }
//                         ].map((stat, index) => (
//                           <div key={index} className={`p-4 rounded-lg shadow-sm border transition-colors duration-300 ${cardClass}`}>
//                             <p className={`text-xs ${
//                               theme === "dark" ? "text-gray-400" : "text-gray-500"
//                             }`}>
//                               {stat.label}
//                             </p>
//                             <p className={`font-medium text-lg ${
//                               theme === "dark" ? "text-white" : "text-gray-800"
//                             }`}>
//                               {stat.value}
//                             </p>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   )}

//                   {/* Subscription Tab */}
//                   {activeTab === 'subscription' && (
//                     <>
//                       {selectedUser.hasPlan ? (
//                         <div className="space-y-6">
//                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//                             <div className="space-y-4">
//                               {[
//                                 { label: "Plan Type", value: selectedUser.subscription.plan?.name, icon: CreditCard, color: "blue" },
//                                 { label: "Payment Status", value: selectedUser.paymentStatus, icon: PaymentStatusIcon, color: "purple" }
//                               ].map((item, index) => (
//                                 <div key={index} className="flex items-center gap-3">
//                                   <div className={`p-2 rounded-lg ${
//                                     theme === "dark" 
//                                       ? `bg-${item.color}-900/20 text-${item.color}-400`
//                                       : `bg-${item.color}-100 text-${item.color}-600`
//                                   }`}>
//                                     {typeof item.icon === 'function' ? <item.icon status={item.value} /> : <item.icon size={18} />}
//                                   </div>
//                                   <div>
//                                     <p className={`text-xs ${
//                                       theme === "dark" ? "text-gray-400" : "text-gray-500"
//                                     }`}>
//                                       {item.label}
//                                     </p>
//                                     <p className={`font-medium capitalize ${
//                                       theme === "dark" ? "text-white" : "text-gray-800"
//                                     }`}>
//                                       {item.value}
//                                     </p>
//                                   </div>
//                                 </div>
//                               ))}
//                             </div>
//                             <div className="space-y-4">
//                               {[
//                                 { label: "Start Date", value: formatDate(selectedUser.subscription.start_date), icon: CalendarDays, color: "green" },
//                                 { label: "Expiry Date", value: formatDate(selectedUser.subscription.expiry_date), icon: CalendarDays, color: "orange" }
//                               ].map((item, index) => (
//                                 <div key={index} className="flex items-center gap-3">
//                                   <div className={`p-2 rounded-lg ${
//                                     theme === "dark" 
//                                       ? `bg-${item.color}-900/20 text-${item.color}-400`
//                                       : `bg-${item.color}-100 text-${item.color}-600`
//                                   }`}>
//                                     <item.icon size={18} />
//                                   </div>
//                                   <div>
//                                     <p className={`text-xs ${
//                                       theme === "dark" ? "text-gray-400" : "text-gray-500"
//                                     }`}>
//                                       {item.label}
//                                     </p>
//                                     <p className={`font-medium ${
//                                       theme === "dark" ? "text-white" : "text-gray-800"
//                                     }`}>
//                                       {item.value}
//                                     </p>
//                                   </div>
//                                 </div>
//                               ))}
//                             </div>
//                           </div>
                          
//                           <div className="flex items-center justify-between mb-3">
//                             <div className="flex items-center gap-2">
//                               <DataUsageIcon
//                                 used={selectedUser.data_usage?.used || 0}
//                                 total={selectedUser.data_usage?.total || 1}
//                                 isUnlimited={selectedUser.isUnlimited}
//                               />
//                               <span className={`font-medium ${
//                                 theme === "dark" ? "text-white" : "text-gray-800"
//                               }`}>
//                                 Data Consumption
//                               </span>
//                             </div>
//                             <span className={`text-sm font-medium ${
//                               theme === "dark" ? "text-white" : "text-gray-800"
//                             }`}>
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
//                               theme={theme}
//                             />
//                           </div>
                          
//                           <div className={`flex items-center justify-between text-xs ${
//                             theme === "dark" ? "text-gray-400" : "text-gray-500"
//                           }`}>
//                             <span>0 {selectedUser.data_usage?.unit || 'GB'}</span>
//                             <span>{selectedUser.isUnlimited ? "∞" : `${selectedUser.data_usage?.total || 0} ${selectedUser.data_usage?.unit || 'GB'}`}</span>
//                           </div>
//                         </div>
//                       ) : (
//                         <div className={`text-center py-8 ${
//                           theme === "dark" ? "text-gray-400" : "text-gray-500"
//                         }`}>
//                           <CreditCard size={24} className="mx-auto mb-2 opacity-50" />
//                           <p>No active subscription found</p>
//                         </div>
//                       )}
//                     </>
//                   )}

//                   {/* History Tab */}
//                   {activeTab === 'history' && (
//                     <div className="space-y-8">
//                       {selectedUser.history?.purchaseHistory?.length > 0 || selectedUser.history?.visitedSites?.length > 0 ? (
//                         <>
//                           {/* Plan Purchase Trends */}
//                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                             <div>
//                               <h4 className={`font-medium mb-3 flex items-center gap-2 ${
//                                 theme === "dark" ? "text-gray-300" : "text-gray-700"
//                               }`}>
//                                 <BarChart2 size={16} />
//                                 Annual Revenue Trend
//                               </h4>
//                               <div className={`h-64 p-3 rounded-lg ${
//                                 theme === "dark" ? "bg-gray-700" : "bg-gray-50"
//                               }`}>
//                                 <ResponsiveContainer width="100%" height="100%">
//                                   <LineChart data={getChartData}>
//                                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === "dark" ? "#374151" : "#E5E7EB"} />
//                                     <XAxis dataKey="year" stroke={theme === "dark" ? "#9CA3AF" : "#6B7280"} />
//                                     <YAxis stroke={theme === "dark" ? "#9CA3AF" : "#6B7280"} />
//                                     <Tooltip 
//                                       formatter={(value) => [formatCurrency(value), "Revenue"]}
//                                       contentStyle={{
//                                         backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
//                                         borderColor: theme === 'dark' ? '#374151' : '#E5E7EB',
//                                         color: theme === 'dark' ? '#F9FAFB' : '#1F2937'
//                                       }}
//                                     />
//                                     <Line
//                                       type="monotone"
//                                       dataKey="revenue"
//                                       stroke="#3B82F6"
//                                       strokeWidth={2}
//                                       dot={{ r: 4 }}
//                                       activeDot={{ r: 6 }}
//                                     />
//                                   </LineChart>
//                                 </ResponsiveContainer>
//                               </div>
//                             </div>
                            
//                             <div>
//                               <h4 className={`font-medium mb-3 flex items-center gap-2 ${
//                                 theme === "dark" ? "text-gray-300" : "text-gray-700"
//                               }`}>
//                                 <BarChart2 size={16} />
//                                 Monthly Revenue Breakdown
//                               </h4>
//                               <div className={`h-64 p-3 rounded-lg ${
//                                 theme === "dark" ? "bg-gray-700" : "bg-gray-50"
//                               }`}>
//                                 <ResponsiveContainer width="100%" height="100%">
//                                   <BarChart data={getMonthlyChartData}>
//                                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === "dark" ? "#374151" : "#E5E7EB"} />
//                                     <XAxis dataKey="month" stroke={theme === "dark" ? "#9CA3AF" : "#6B7280"} />
//                                     <YAxis stroke={theme === "dark" ? "#9CA3AF" : "#6B7280"} />
//                                     <Tooltip 
//                                       formatter={(value) => [formatCurrency(value), "Revenue"]}
//                                       contentStyle={{
//                                         backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
//                                         borderColor: theme === 'dark' ? '#374151' : '#E5E7EB',
//                                         color: theme === 'dark' ? '#F9FAFB' : '#1F2937'
//                                       }}
//                                     />
//                                     <Bar dataKey="revenue" fill="#8884d8" radius={[4, 4, 0, 0]} />
//                                   </BarChart>
//                                 </ResponsiveContainer>
//                               </div>
//                             </div>
//                           </div>

//                           {/* Plan Distribution */}
//                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                             <div>
//                               <h4 className={`font-medium mb-3 flex items-center gap-2 ${
//                                 theme === "dark" ? "text-gray-300" : "text-gray-700"
//                               }`}>
//                                 <Package size={16} />
//                                 Plan Distribution
//                               </h4>
//                               <div className={`h-64 p-3 rounded-lg ${
//                                 theme === "dark" ? "bg-gray-700" : "bg-gray-50"
//                               }`}>
//                                 <ResponsiveContainer width="100%" height="100%">
//                                   <PieChart>
//                                     <Pie
//                                       data={getPlanDistributionData}
//                                       cx="50%"
//                                       cy="50%"
//                                       labelLine={false}
//                                       outerRadius={80}
//                                       fill="#8884d8"
//                                       dataKey="value"
//                                       label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
//                                     >
//                                       {getPlanDistributionData.map((entry, index) => (
//                                         <Cell key={`cell-${index}`} fill={entry.color} />
//                                       ))}
//                                     </Pie>
//                                     <Tooltip 
//                                       formatter={(value, name) => [`${value} purchases`, name]}
//                                       contentStyle={{
//                                         backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
//                                         borderColor: theme === 'dark' ? '#374151' : '#E5E7EB',
//                                         color: theme === 'dark' ? '#F9FAFB' : '#1F2937'
//                                       }}
//                                     />
//                                   </PieChart>
//                                 </ResponsiveContainer>
//                               </div>
//                             </div>
                            
//                             <div>
//                               <h4 className={`font-medium mb-3 flex items-center gap-2 ${
//                                 theme === "dark" ? "text-gray-300" : "text-gray-700"
//                               }`}>
//                                 <CreditCard size={16} />
//                                 Payment Methods
//                               </h4>
//                               <div className={`h-64 p-3 rounded-lg ${
//                                 theme === "dark" ? "bg-gray-700" : "bg-gray-50"
//                               }`}>
//                                 <ResponsiveContainer width="100%" height="100%">
//                                   <PieChart>
//                                     <Pie
//                                       data={getPaymentMethodData}
//                                       cx="50%"
//                                       cy="50%"
//                                       labelLine={false}
//                                       outerRadius={80}
//                                       fill="#8884d8"
//                                       dataKey="value"
//                                       label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
//                                     >
//                                       {getPaymentMethodData.map((entry, index) => (
//                                         <Cell
//                                           key={`cell-${index}`}
//                                           fill={["#6366F1", "#3B82F6", "#10B981", "#F59E0B"][index % 4]}
//                                         />
//                                       ))}
//                                     </Pie>
//                                     <Tooltip 
//                                       formatter={(value, name) => [`${value} purchases`, name]}
//                                       contentStyle={{
//                                         backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
//                                         borderColor: theme === 'dark' ? '#374151' : '#E5E7EB',
//                                         color: theme === 'dark' ? '#F9FAFB' : '#1F2937'
//                                       }}
//                                     />
//                                   </PieChart>
//                                 </ResponsiveContainer>
//                               </div>
//                             </div>
//                           </div>

//                           {/* Plan Behavior Insights */}
//                           <div>
//                             <h4 className={`font-medium mb-3 flex items-center gap-2 ${
//                               theme === "dark" ? "text-gray-300" : "text-gray-700"
//                             }`}>
//                               <TrendingUp size={16} />
//                               Plan Behavior Insights
//                             </h4>
//                             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
//                               {[
//                                 { label: "Favorite Plan", value: getPlanBehavior.favoritePlan },
//                                 { label: "Number of Upgrades", value: getPlanBehavior.upgrades },
//                                 { label: "Plan Changes", value: getPlanBehavior.planChanges },
//                                 { label: "Avg. Plan Duration", value: `${getPlanBehavior.avgDuration.toFixed(1)} months` }
//                               ].map((stat, index) => (
//                                 <div key={index} className={`p-3 rounded-lg ${
//                                   theme === "dark" ? "bg-gray-700" : "bg-gray-50"
//                                 }`}>
//                                   <p className={`text-xs ${
//                                     theme === "dark" ? "text-gray-400" : "text-gray-500"
//                                   }`}>
//                                     {stat.label}
//                                   </p>
//                                   <p className={`font-medium ${
//                                     theme === "dark" ? "text-white" : "text-gray-800"
//                                   }`}>
//                                     {stat.value}
//                                   </p>
//                                 </div>
//                               ))}
//                             </div>
                            
//                             <div className={`mt-4 p-3 rounded-lg ${
//                               theme === "dark" ? "bg-gray-700" : "bg-gray-50"
//                             }`}>
//                               <div className="flex items-center gap-2">
//                                 <p className={`text-xs ${
//                                   theme === "dark" ? "text-gray-400" : "text-gray-500"
//                                 }`}>
//                                   Spending Trend:
//                                 </p>
//                                 {getSpendingTrend === "up" ? (
//                                   <div className="flex items-center text-green-500">
//                                     <TrendingUp size={16} />
//                                     <span className="ml-1">Increasing</span>
//                                   </div>
//                                 ) : getSpendingTrend === "down" ? (
//                                   <div className="flex items-center text-red-500">
//                                     <TrendingDown size={16} />
//                                     <span className="ml-1">Decreasing</span>
//                                   </div>
//                                 ) : (
//                                   <div className="flex items-center text-gray-500">
//                                     <Circle size={16} />
//                                     <span className="ml-1">Stable</span>
//                                   </div>
//                                 )}
//                               </div>
//                             </div>
//                           </div>

//                           {/* Browsing History */}
//                           <div>
//                             <div className="flex items-center justify-between mb-3">
//                               <h4 className={`font-medium flex items-center gap-2 ${
//                                 theme === "dark" ? "text-gray-300" : "text-gray-700"
//                               }`}>
//                                 <Globe size={16} />
//                                 Browsing History
//                               </h4>
//                               <button
//                                 className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm ${
//                                   theme === "dark" 
//                                     ? "bg-blue-600 text-white hover:bg-blue-700" 
//                                     : "bg-blue-500 text-white hover:bg-blue-600"
//                                 }`}
//                                 onClick={() => exportBrowsingHistoryToCSV(selectedUser.history.visitedSites)}
//                               >
//                                 <Download size={14} />
//                                 Export
//                               </button>
//                             </div>
                            
//                             <div className="overflow-x-auto">
//                               <table className="w-full text-sm">
//                                 <thead>
//                                   <tr className={theme === "dark" ? "bg-gray-700" : "bg-gray-100"}>
//                                     {["URL", "Data Used", "Frequency", "Timestamp", "Router", "Device"].map((header) => (
//                                       <th key={header} className={`p-2 text-left ${
//                                         theme === "dark" ? "text-gray-300" : "text-gray-600"
//                                       }`}>
//                                         {header}
//                                       </th>
//                                     ))}
//                                   </tr>
//                                 </thead>
//                                 <tbody>
//                                   {selectedUser.history.visitedSites && selectedUser.history.visitedSites.length > 0 ? (
//                                     selectedUser.history.visitedSites.map((site, index) => (
//                                       <tr key={index} className={`border-b ${
//                                         theme === "dark" 
//                                           ? "border-gray-700 hover:bg-gray-700" 
//                                           : "border-gray-200 hover:bg-gray-50"
//                                       }`}>
//                                         <td className="p-2">
//                                           <a
//                                             href={site.url}
//                                             target="_blank"
//                                             rel="noopener noreferrer"
//                                             className="text-blue-500 hover:underline"
//                                           >
//                                             {site.url.length > 30 ? `${site.url.substring(0, 27)}...` : site.url}
//                                           </a>
//                                         </td>
//                                         <td className={`p-2 ${
//                                           theme === "dark" ? "text-gray-300" : "text-gray-700"
//                                         }`}>
//                                           {site.data_used || "0GB"}
//                                         </td>
//                                         <td className={`p-2 ${
//                                           theme === "dark" ? "text-gray-300" : "text-gray-700"
//                                         }`}>
//                                           {site.frequency || "N/A"}
//                                         </td>
//                                         <td className={`p-2 ${
//                                           theme === "dark" ? "text-gray-300" : "text-gray-700"
//                                         }`}>
//                                           {formatDate(site.timestamp)}
//                                         </td>
//                                         <td className={`p-2 ${
//                                           theme === "dark" ? "text-gray-300" : "text-gray-700"
//                                         }`}>
//                                           {site.router?.name || "Unknown"}
//                                         </td>
//                                         <td className={`p-2 ${
//                                           theme === "dark" ? "text-gray-300" : "text-gray-700"
//                                         }`}>
//                                           {site.hotspot_user?.mac || "Unknown"}
//                                         </td>
//                                       </tr>
//                                     ))
//                                   ) : (
//                                     <tr>
//                                       <td colSpan={6} className={`p-4 text-center ${
//                                         theme === "dark" ? "text-gray-400" : "text-gray-500"
//                                       }`}>
//                                         No browsing history found
//                                       </td>
//                                     </tr>
//                                   )}
//                                 </tbody>
//                               </table>
//                             </div>
//                           </div>

//                           {/* Purchase History */}
//                           <div>
//                             <div className="flex items-center justify-between mb-3">
//                               <h4 className={`font-medium flex items-center gap-2 ${
//                                 theme === "dark" ? "text-gray-300" : "text-gray-700"
//                               }`}>
//                                 <History size={16} />
//                                 Detailed Purchase History
//                               </h4>
//                               <div className="flex items-center gap-2">
//                                 <select
//                                   className={`border rounded-lg px-2 py-1 text-sm ${
//                                     theme === "dark" 
//                                       ? "bg-gray-700 border-gray-600 text-white" 
//                                       : "border-gray-200"
//                                   }`}
//                                   value={filterYear}
//                                   onChange={(e) => setFilterYear(e.target.value)}
//                                 >
//                                   <option value="All">All Years</option>
//                                   {[
//                                     ...new Set(
//                                       selectedUser.history.purchaseHistory.map((p) =>
//                                         new Date(p.purchase_date).getFullYear()
//                                       )
//                                     ),
//                                   ]
//                                     .sort((a, b) => b - a)
//                                     .map((year) => (
//                                       <option key={year} value={year}>
//                                         {year}
//                                       </option>
//                                     ))}
//                                 </select>
//                                 <button
//                                   className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm ${
//                                     theme === "dark" 
//                                       ? "bg-blue-600 text-white hover:bg-blue-700" 
//                                       : "bg-blue-500 text-white hover:bg-blue-600"
//                                   }`}
//                                   onClick={() => exportToCSV(selectedUser.history)}
//                                 >
//                                   <Download size={14} />
//                                   Export
//                                 </button>
//                               </div>
//                             </div>
                            
//                             <div className="overflow-x-auto">
//                               <table className="w-full text-sm">
//                                 <thead>
//                                   <tr className={theme === "dark" ? "bg-gray-700" : "bg-gray-100"}>
//                                     {["Plan", "Purchase Date", "Duration", "Price", "Status", "Details"].map((header) => (
//                                       <th key={header} className={`p-2 text-left ${
//                                         theme === "dark" ? "text-gray-300" : "text-gray-600"
//                                       }`}>
//                                         {header}
//                                       </th>
//                                     ))}
//                                   </tr>
//                                 </thead>
//                                 <tbody>
//                                   {getFilteredPurchaseHistory.map((purchase, index) => (
//                                     <tr
//                                       key={index}
//                                       className={`border-b cursor-pointer ${
//                                         theme === "dark" 
//                                           ? "border-gray-700 hover:bg-gray-700" 
//                                           : "border-gray-200 hover:bg-gray-50"
//                                       }`}
//                                       onClick={() => viewPurchaseDetails(purchase)}
//                                     >
//                                       <td className="p-2">
//                                         <div className="flex items-center gap-2">
//                                           <div
//                                             className="w-2 h-2 rounded-full"
//                                             style={{ backgroundColor: getPlanColor(purchase.plan?.name) }}
//                                           ></div>
//                                           <span className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>
//                                             {purchase.plan?.name || "N/A"}
//                                           </span>
//                                         </div>
//                                       </td>
//                                       <td className={`p-2 ${
//                                         theme === "dark" ? "text-gray-300" : "text-gray-700"
//                                       }`}>
//                                         {formatDate(purchase.purchase_date)}
//                                       </td>
//                                       <td className={`p-2 ${
//                                         theme === "dark" ? "text-gray-300" : "text-gray-700"
//                                       }`}>
//                                         {purchase.duration || "N/A"}
//                                       </td>
//                                       <td className={`p-2 font-medium ${
//                                         theme === "dark" ? "text-white" : "text-gray-800"
//                                       }`}>
//                                         {formatCurrency(purchase.amount)}
//                                       </td>
//                                       <td className="p-2">
//                                         <span
//                                           className={`px-2 py-1 rounded-full text-xs ${
//                                             purchase.status === "Active"
//                                               ? theme === "dark"
//                                                 ? "bg-green-900/20 text-green-400"
//                                                 : "bg-green-100 text-green-700"
//                                               : theme === "dark"
//                                                 ? "bg-red-900/20 text-red-400"
//                                                 : "bg-red-100 text-red-700"
//                                           }`}
//                                         >
//                                           {purchase.status || "N/A"}
//                                         </span>
//                                       </td>
//                                       <td className="p-2">
//                                         <button className="text-blue-500 hover:text-blue-700">
//                                           <ArrowUpRight size={16} />
//                                         </button>
//                                       </td>
//                                     </tr>
//                                   ))}
//                                 </tbody>
//                               </table>
//                             </div>
//                           </div>
//                         </>
//                       ) : (
//                         <div className={`text-center py-8 ${
//                           theme === "dark" ? "text-gray-400" : "text-gray-500"
//                         }`}>
//                           <Package size={24} className="mx-auto mb-2 opacity-50" />
//                           <p>No history found</p>
//                         </div>
//                       )}
//                     </div>
//                   )}

//                   {/* Communication Log Tab */}
//                   {activeTab === 'communication' && (
//                     <div className="space-y-6">
//                       {/* Send Message Form */}
//                       <div className={`p-4 rounded-lg ${
//                         theme === "dark" ? "bg-gray-700" : "bg-gray-50"
//                       }`}>
//                         <h4 className={`font-medium mb-3 ${
//                           theme === "dark" ? "text-gray-300" : "text-gray-700"
//                         }`}>
//                           Send Message
//                         </h4>
//                         <form onSubmit={handleSendMessage} className="space-y-3">
//                           <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
//                             <div>
//                               <label className={`block text-sm mb-1 ${
//                                 theme === "dark" ? "text-gray-400" : "text-gray-600"
//                               }`}>
//                                 Message Type
//                               </label>
//                               <select
//                                 name="message_type"
//                                 value={messageForm.message_type}
//                                 onChange={handleMessageChange}
//                                 className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${inputClass}`}
//                               >
//                                 <option value="sms">SMS</option>
//                                 <option value="email">Email</option>
//                                 <option value="system">System Notification</option>
//                               </select>
//                             </div>
//                             {messageForm.message_type === 'email' && (
//                               <div className="md:col-span-2">
//                                 <label className={`block text-sm mb-1 ${
//                                   theme === "dark" ? "text-gray-400" : "text-gray-600"
//                                 }`}>
//                                   Subject
//                                 </label>
//                                 <input
//                                   type="text"
//                                   name="subject"
//                                   value={messageForm.subject}
//                                   onChange={handleMessageChange}
//                                   className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${inputClass}`}
//                                   placeholder="Email subject"
//                                 />
//                               </div>
//                             )}
//                           </div>
//                           <div>
//                             <label className={`block text-sm mb-1 ${
//                               theme === "dark" ? "text-gray-400" : "text-gray-600"
//                             }`}>
//                               Message
//                             </label>
//                             <textarea
//                               name="message"
//                               value={messageForm.message}
//                               onChange={handleMessageChange}
//                               rows={3}
//                               className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${inputClass}`}
//                               placeholder="Type your message here..."
//                               required
//                             />
//                           </div>
//                           <div className="flex justify-end">
//                             <button
//                               type="submit"
//                               disabled={isSendingMessage}
//                               className={`flex items-center gap-2 px-4 py-2 rounded-lg disabled:opacity-50 ${
//                                 theme === "dark" 
//                                   ? "bg-blue-600 text-white hover:bg-blue-700" 
//                                   : "bg-blue-500 text-white hover:bg-blue-600"
//                               }`}
//                             >
//                               {isSendingMessage ? (
//                                 <FaSpinner className="animate-spin" />
//                               ) : (
//                                 <Send size={16} />
//                               )}
//                               Send Message
//                             </button>
//                           </div>
//                         </form>
//                       </div>

//                       {/* Communication Log */}
//                       <div>
//                         <h4 className={`font-medium mb-3 ${
//                           theme === "dark" ? "text-gray-300" : "text-gray-700"
//                         }`}>
//                           Communication History
//                         </h4>
//                         {selectedUser.communication_logs && selectedUser.communication_logs.length > 0 ? (
//                           <div className="space-y-3">
//                             {selectedUser.communication_logs.map((log) => (
//                               <div key={log.id} className={`p-4 rounded-lg border transition-colors duration-300 ${cardClass}`}>
//                                 <div className="flex items-start gap-3">
//                                   <MessageTypeIcon type={log.message_type} />
//                                   <div className="flex-1">
//                                     <p className={`font-medium ${
//                                       theme === "dark" ? "text-white" : "text-gray-800"
//                                     }`}>
//                                       {log.subject || log.trigger_display}
//                                     </p>
//                                     <p className={`text-sm ${
//                                       theme === "dark" ? "text-gray-400" : "text-gray-500"
//                                     }`}>
//                                       {formatDate(log.formatted_timestamp)}
//                                     </p>
//                                     <div className="mt-1">
//                                       <StatusBadge status={log.status} theme={theme} />
//                                     </div>
//                                     <p className={`mt-2 ${
//                                       theme === "dark" ? "text-gray-300" : "text-gray-700"
//                                     }`}>
//                                       {log.message}
//                                     </p>
//                                     {log.router && (
//                                       <p className={`text-sm ${
//                                         theme === "dark" ? "text-gray-400" : "text-gray-500"
//                                       } mt-1`}>
//                                         Router: {log.router.name}
//                                       </p>
//                                     )}
//                                   </div>
//                                 </div>
//                               </div>
//                             ))}
//                           </div>
//                         ) : (
//                           <div className={`text-center py-8 ${
//                             theme === "dark" ? "text-gray-400" : "text-gray-500"
//                           }`}>
//                             <MessageSquare size={24} className="mx-auto mb-2 opacity-50" />
//                             <p>No communication history</p>
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   )}
//                 </div>
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
//                         This plan expired on {formatDate(selectedUser.subscription?.expiry_date)}
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

// export default Subscribers;























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

// // Theme-based background classes
// const getContainerClass = (theme) => theme === "dark" 
//   ? "bg-gradient-to-br from-gray-900 to-indigo-900 text-white min-h-screen" 
//   : "bg-gray-50 text-gray-800 min-h-screen";

// const getCardClass = (theme) => theme === "dark"
//   ? "bg-gray-800/60 backdrop-blur-md border-gray-700"
//   : "bg-white border-gray-200";

// const getInputClass = (theme) => theme === "dark"
//   ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
//   : "bg-white border-gray-300 text-gray-800 placeholder-gray-500";

// // Memoized components to prevent unnecessary re-renders
// const DataUsageBar = React.memo(({ used, total, isUnlimited, theme }) => {
//   if (isUnlimited) {
//     return (
//       <div className={`w-full bg-gradient-to-r from-purple-100 to-blue-100 rounded-full h-3 relative overflow-hidden ${
//         theme === "dark" ? "from-purple-900 to-blue-900" : ""
//       }`}>
//         <div className={`absolute inset-0 bg-gradient-to-r from-purple-400 via-blue-500 to-teal-400 opacity-70 animate-pulse rounded-full ${
//           theme === "dark" ? "from-purple-600 via-blue-600 to-teal-600" : ""
//         }`}></div>
//       </div>
//     );
//   }

//   const percentage = Math.min((used / parseFloat(total || 1)) * 100, 100);
//   let colorClass = "bg-green-500";
//   if (percentage > 80) colorClass = "bg-yellow-500";
//   if (percentage > 95) colorClass = "bg-red-500";

//   if (theme === "dark") {
//     if (percentage > 80) colorClass = "bg-yellow-600";
//     if (percentage > 95) colorClass = "bg-red-600";
//   }

//   return (
//     <div className={`w-full rounded-full h-3 overflow-hidden ${
//       theme === "dark" ? "bg-gray-700" : "bg-gray-200"
//     }`}>
//       <div
//         className={`${colorClass} h-3 rounded-full transition-all duration-500`}
//         style={{ width: `${percentage}%` }}
//       ></div>
//     </div>
//   );
// });

// const DataUsageIcon = React.memo(({ used, total, isUnlimited }) => {
//   if (isUnlimited) return <Zap className="text-purple-500" size={18} />;
//   const percentage = used / parseFloat(total || 1);
//   if (percentage < 0.3) return <BatteryFull className="text-green-500" size={18} />;
//   if (percentage < 0.7) return <BatteryMedium className="text-yellow-500" size={18} />;
//   return <BatteryLow className="text-red-500" size={18} />;
// });

// const PaymentStatusIcon = React.memo(({ status }) => {
//   switch (status) {
//     case "Paid":
//       return <BadgeCheck className="text-green-500" size={18} />;
//     case "Due":
//       return <Clock className="text-yellow-500" size={18} />;
//     case "Expired":
//       return <AlertTriangle className="text-red-500" size={18} />;
//     default:
//       return <CreditCard className="text-gray-500" size={18} />;
//   }
// });

// const MessageTypeIcon = React.memo(({ type }) => {
//   switch (type) {
//     case "sms":
//       return <MessageSquare className="text-blue-500" size={16} />;
//     case "email":
//       return <Mail className="text-green-500" size={16} />;
//     case "system":
//       return <Bell className="text-purple-500" size={16} />;
//     default:
//       return <MessageSquare className="text-gray-500" size={16} />;
//   }
// });

// const StatusBadge = React.memo(({ status, theme }) => {
//   let bgColor = theme === "dark" ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-700";
//   if (status === "delivered") bgColor = theme === "dark" ? "bg-green-900 text-green-300" : "bg-green-100 text-green-700";
//   if (status === "failed") bgColor = theme === "dark" ? "bg-red-900 text-red-300" : "bg-red-100 text-red-700";
  
//   return (
//     <span className={`px-2 py-1 rounded-full text-xs ${bgColor}`}>
//       {status.charAt(0).toUpperCase() + status.slice(1)}
//     </span>
//   );
// });

// const Subscribers = () => {
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
//   const [connectionFilter, setConnectionFilter] = useState("all"); // "all", "hotspot", "pppoe"
//   const [activeTab, setActiveTab] = useState("overview");
//   const [messageForm, setMessageForm] = useState({ message_type: "sms", subject: "", message: "" });
//   const [isSendingMessage, setIsSendingMessage] = useState(false);
//   const [isDisconnecting, setIsDisconnecting] = useState(false);

//   // Theme classes
//   const containerClass = useMemo(() => getContainerClass(theme), [theme]);
//   const cardClass = useMemo(() => getCardClass(theme), [theme]);
//   const inputClass = useMemo(() => getInputClass(theme), [theme]);

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

//   // Filter users based on active status and connection type
//   useEffect(() => {
//     let filtered = users;
    
//     // Active status filter
//     if (activeFilter === 'active') {
//       filtered = users.filter(user => user.active);
//     } else if (activeFilter === 'inactive') {
//       filtered = users.filter(user => !user.active);
//     }
    
//     // Connection type filter
//     if (connectionFilter === 'hotspot') {
//       filtered = filtered.filter(user => user.connection_type === 'hotspot');
//     } else if (connectionFilter === 'pppoe') {
//       filtered = filtered.filter(user => user.connection_type === 'pppoe');
//     }
    
//     setFilteredUsers(filtered);
//     setCurrentPage(1);
//   }, [users, activeFilter, connectionFilter]);

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
//       <div className={`flex justify-center items-center min-h-screen transition-colors duration-300 ${containerClass}`}>
//         <FaSpinner className="animate-spin text-4xl text-blue-600" />
//       </div>
//     );
//   }

//   if (!isAuthenticated) {
//     return (
//       <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${containerClass}`}>
//         <p className="text-red-500">Please log in to access client profiles.</p>
//       </div>
//     );
//   }

//   return (
//     <div className={`min-h-screen transition-colors duration-300 ${containerClass}`}>
//       <div className="p-4 md:p-8 max-w-7xl mx-auto">
//         {error && (
//           <div className={`mb-4 p-4 rounded-lg ${
//             theme === "dark" ? "bg-red-900/20 text-red-300" : "bg-red-100 text-red-700"
//           }`}>
//             {error}
//           </div>
//         )}
        
//         <div className="flex items-center justify-between mb-8">
//           <div>
//             <h1 className={`text-xl md:text-3xl font-bold ${
//               theme === "dark" ? "text-white" : "text-gray-800"
//             }`}>
//               Client Dashboard
//             </h1>
//             <p className={`${theme === "dark" ? "text-gray-300" : "text-gray-500"}`}>
//               Monitor and manage client profiles, subscriptions, and communications
//             </p>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* User List */}
//           <div className={`lg:col-span-1 rounded-xl shadow-sm border overflow-hidden transition-colors duration-300 ${cardClass}`}>
//             <div className={`p-4 border-b ${
//               theme === "dark" ? "border-gray-700" : "border-gray-100"
//             }`}>
//               <h2 className={`font-semibold flex items-center gap-2 ${
//                 theme === "dark" ? "text-gray-300" : "text-gray-700"
//               }`}>
//                 <UserIcon className="text-blue-500" size={18} />
//                 Clients ({filteredUsers.filter((u) => u.active).length}/{filteredUsers.length})
//               </h2>
              
//               {/* Status Filter Buttons */}
//               <div className="flex space-x-1 mt-2">
//                 <button
//                   onClick={() => setActiveFilter('all')}
//                   className={`px-2 py-1 text-xs rounded-md ${
//                     activeFilter === 'all' 
//                       ? 'bg-blue-500 text-white' 
//                       : theme === "dark" 
//                         ? 'bg-gray-700 text-gray-300' 
//                         : 'bg-gray-100 text-gray-700'
//                   }`}
//                 >
//                   All
//                 </button>
//                 <button
//                   onClick={() => setActiveFilter('active')}
//                   className={`px-2 py-1 text-xs rounded-md ${
//                     activeFilter === 'active' 
//                       ? 'bg-green-500 text-white' 
//                       : theme === "dark" 
//                         ? 'bg-gray-700 text-gray-300' 
//                         : 'bg-gray-100 text-gray-700'
//                   }`}
//                 >
//                   Active
//                 </button>
//                 <button
//                   onClick={() => setActiveFilter('inactive')}
//                   className={`px-2 py-1 text-xs rounded-md ${
//                     activeFilter === 'inactive' 
//                       ? 'bg-red-500 text-white' 
//                       : theme === "dark" 
//                         ? 'bg-gray-700 text-gray-300' 
//                         : 'bg-gray-100 text-gray-700'
//                   }`}
//                 >
//                   Inactive
//                 </button>
//               </div>

//               {/* Connection Type Filter Buttons */}
//               <div className="flex space-x-1 mt-2">
//                 <button
//                   onClick={() => setConnectionFilter("all")}
//                   className={`px-2 py-1 text-xs rounded-md ${
//                     connectionFilter === "all"
//                       ? "bg-purple-500 text-white"
//                       : theme === "dark"
//                       ? "bg-gray-700 text-gray-300"
//                       : "bg-gray-100 text-gray-700"
//                   }`}
//                 >
//                   All Connections
//                 </button>
//                 <button
//                   onClick={() => setConnectionFilter("hotspot")}
//                   className={`px-2 py-1 text-xs rounded-md ${
//                     connectionFilter === "hotspot"
//                       ? "bg-orange-500 text-white"
//                       : theme === "dark"
//                       ? "bg-gray-700 text-gray-300"
//                       : "bg-gray-100 text-gray-700"
//                   }`}
//                 >
//                   Hotspot Only
//                 </button>
//                 <button
//                   onClick={() => setConnectionFilter("pppoe")}
//                   className={`px-2 py-1 text-xs rounded-md ${
//                     connectionFilter === "pppoe"
//                       ? "bg-indigo-500 text-white"
//                       : theme === "dark"
//                       ? "bg-gray-700 text-gray-300"
//                       : "bg-gray-100 text-gray-700"
//                   }`}
//                 >
//                   PPPoE Only
//                 </button>
//               </div>
//             </div>
            
//             <div className={`divide-y ${
//               theme === "dark" ? "divide-gray-700" : "divide-gray-100"
//             }`}>
//               {currentUsers.length > 0 ? (
//                 currentUsers.map((user) => (
//                   <div
//                     key={user.id}
//                     className={`p-4 hover:bg-opacity-50 cursor-pointer transition-colors ${
//                       theme === "dark" 
//                         ? "hover:bg-gray-700" 
//                         : "hover:bg-gray-50"
//                     } ${
//                       selectedUser?.id === user.id 
//                         ? theme === "dark" 
//                           ? "bg-blue-900/20" 
//                           : "bg-blue-50"
//                         : ""
//                     }`}
//                     onClick={() => handleView(user)}
//                   >
//                     <div className="flex items-center justify-between">
//                       <div className="flex items-center gap-3">
//                         <div
//                           className={`w-10 h-10 rounded-full flex items-center justify-center ${
//                             user.active 
//                               ? theme === "dark"
//                                 ? "bg-green-900/20 text-green-400"
//                                 : "bg-green-100 text-green-600"
//                               : theme === "dark"
//                                 ? "bg-gray-700 text-gray-400"
//                                 : "bg-gray-100 text-gray-500"
//                           }`}
//                         >
//                           <User size={20} />
//                         </div>
//                         <div>
//                           <h3 className={`font-medium ${
//                             theme === "dark" ? "text-white" : "text-gray-800"
//                           }`}>
//                             {user.username}
//                           </h3>
//                           <p className={`text-sm ${
//                             theme === "dark" ? "text-gray-400" : "text-gray-500"
//                           }`}>
//                             {user.hasPlan ? `${user.subscription?.plan?.name || 'No Plan'} Plan` : 'No Plan'}
//                           </p>
//                         </div>
//                       </div>
//                       <ChevronRight className={theme === "dark" ? "text-gray-500" : "text-gray-400"} size={18} />
//                     </div>
                    
//                     <div className="mt-3 flex items-center justify-between text-sm">
//                       <div className="flex items-center gap-2">
//                         <span
//                           className={`px-2 py-1 rounded-full text-xs ${
//                             user.active 
//                               ? theme === "dark"
//                                 ? "bg-green-900/20 text-green-400"
//                                 : "bg-green-100 text-green-700"
//                               : theme === "dark"
//                                 ? "bg-red-900/20 text-red-400"
//                                 : "bg-red-100 text-red-700"
//                           }`}
//                         >
//                           {user.active ? "Active" : "Inactive"}
//                         </span>
                        
//                         {/* Connection Type Badge */}
//                         {user.connection_type && user.connection_type !== "none" && (
//                           <span
//                             className={`px-2 py-1 rounded-full text-xs ${
//                               user.connection_type === "hotspot"
//                                 ? theme === "dark"
//                                   ? "bg-orange-900/20 text-orange-400"
//                                   : "bg-orange-100 text-orange-700"
//                                 : theme === "dark"
//                                 ? "bg-indigo-900/20 text-indigo-400"
//                                 : "bg-indigo-100 text-indigo-700"
//                             }`}
//                           >
//                             {user.connection_type.toUpperCase()}
//                           </span>
//                         )}
//                       </div>
                      
//                       <div className="flex flex-col items-end">
//                         <span className={theme === "dark" ? "text-gray-400" : "text-gray-500"}>
//                           {user.phonenumber}
//                         </span>
//                         {/* Device/MAC Display */}
//                         <span className={`text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
//                           {user.device && user.device !== "Unknown" ? user.device : "No device"}
//                         </span>
//                       </div>
//                     </div>
                    
//                     {!user.hasPlan && (
//                       <div className="mt-2 flex items-center text-xs text-yellow-600">
//                         <AlertTriangle size={14} className="mr-1" />
//                         <span>No active subscription</span>
//                       </div>
//                     )}

//                     {/* Connection Specific Info */}
//                     {user.active && user.connection_type && (
//                       <div className={`mt-1 text-xs ${
//                         theme === "dark" ? "text-gray-400" : "text-gray-500"
//                       }`}>
//                         {user.connection_type === "hotspot" ? (
//                           <span>MAC: {user.device || "Unknown"}</span>
//                         ) : (
//                           <span>User: {user.device || "Unknown"}</span>
//                         )}
//                         {user.router && (
//                           <span> • Router: {user.router.name}</span>
//                         )}
//                       </div>
//                     )}
//                   </div>
//                 ))
//               ) : (
//                 <div className={`p-4 text-center ${
//                   theme === "dark" ? "text-gray-400" : "text-gray-500"
//                 }`}>
//                   No clients found
//                 </div>
//               )}
//             </div>
            
//             {filteredUsers.length > usersPerPage && (
//               <div className={`p-4 border-t ${
//                 theme === "dark" ? "border-gray-700" : "border-gray-100"
//               } flex items-center justify-between`}>
//                 <button
//                   onClick={() => paginate(currentPage - 1)}
//                   disabled={currentPage === 1}
//                   className={`p-2 rounded-md ${
//                     currentPage === 1 
//                       ? theme === "dark" 
//                         ? "text-gray-600 cursor-not-allowed" 
//                         : "text-gray-400 cursor-not-allowed"
//                       : theme === "dark"
//                         ? "text-gray-300 hover:bg-gray-700"
//                         : "text-gray-700 hover:bg-gray-100"
//                   }`}
//                 >
//                   <ChevronLeft size={18} />
//                 </button>
//                 <span className={`text-sm ${
//                   theme === "dark" ? "text-gray-400" : "text-gray-600"
//                 }`}>
//                   Page {currentPage} of {totalPages}
//                 </span>
//                 <button
//                   onClick={() => paginate(currentPage + 1)}
//                   disabled={currentPage === totalPages}
//                   className={`p-2 rounded-md ${
//                     currentPage === totalPages 
//                       ? theme === "dark" 
//                         ? "text-gray-600 cursor-not-allowed" 
//                         : "text-gray-400 cursor-not-allowed"
//                       : theme === "dark"
//                         ? "text-gray-300 hover:bg-gray-700"
//                         : "text-gray-700 hover:bg-gray-100"
//                   }`}
//                 >
//                   <ChevronRight size={18} />
//                 </button>
//               </div>
//             )}
//           </div>

//           {/* User Details */}
//           {selectedUser && (
//             <div className="lg:col-span-2 space-y-6">
//               {/* Profile Card */}
//               <div className={`rounded-xl shadow-sm border p-6 transition-colors duration-300 ${cardClass}`}>
//                 <div className="flex items-start justify-between">
//                   <div className="flex items-center gap-4">
//                     <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
//                       selectedUser.active 
//                         ? "bg-gradient-to-br from-green-100 to-teal-100"
//                         : "bg-gradient-to-br from-gray-100 to-gray-200"
//                     } ${
//                       theme === "dark" 
//                         ? selectedUser.active 
//                           ? "from-green-900/20 to-teal-900/20" 
//                           : "from-gray-700 to-gray-800"
//                         : ""
//                     }`}>
//                       <User className={
//                         selectedUser.active 
//                           ? "text-green-600" 
//                           : "text-gray-500"
//                       } size={28} />
//                     </div>
//                     <div>
//                       <h2 className={`text-xl font-bold ${
//                         theme === "dark" ? "text-white" : "text-gray-800"
//                       }`}>
//                         {selectedUser.username}
//                       </h2>
//                       <div className="flex items-center gap-2 mt-1">
//                         <span
//                           className={`px-2 py-1 rounded-full text-xs ${
//                             selectedUser.active 
//                               ? theme === "dark"
//                                 ? "bg-green-900/20 text-green-400"
//                                 : "bg-green-100 text-green-700"
//                               : theme === "dark"
//                                 ? "bg-red-900/20 text-red-400"
//                                 : "bg-red-100 text-red-700"
//                           }`}
//                         >
//                           {selectedUser.active ? "Active" : "Inactive"}
//                         </span>
//                         {selectedUser.hasPlan ? (
//                           <span className={`px-2 py-1 rounded-full text-xs ${
//                             theme === "dark" 
//                               ? "bg-blue-900/20 text-blue-400" 
//                               : "bg-blue-100 text-blue-700"
//                           }`}>
//                             {selectedUser.subscription?.plan?.name} Plan
//                           </span>
//                         ) : (
//                           <span className={`px-2 py-1 rounded-full text-xs ${
//                             theme === "dark" 
//                               ? "bg-yellow-900/20 text-yellow-400" 
//                               : "bg-yellow-100 text-yellow-700"
//                           }`}>
//                             No Active Plan
//                           </span>
//                         )}
//                         {selectedUser.connection_type && selectedUser.connection_type !== "none" && (
//                           <span className={`px-2 py-1 rounded-full text-xs ${
//                             selectedUser.connection_type === "hotspot"
//                               ? theme === "dark"
//                                 ? "bg-orange-900/20 text-orange-400"
//                                 : "bg-orange-100 text-orange-700"
//                               : theme === "dark"
//                               ? "bg-indigo-900/20 text-indigo-400"
//                               : "bg-indigo-100 text-indigo-700"
//                           }`}>
//                             {selectedUser.connection_type.toUpperCase()}
//                           </span>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     {selectedUser.active && selectedUser.router && selectedUser.connection_type === "hotspot" && (
//                       <button
//                         onClick={handleDisconnectHotspot}
//                         disabled={isDisconnecting}
//                         className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm hover:bg-red-600 disabled:opacity-50 ${
//                           theme === "dark" 
//                             ? "bg-red-600 text-white hover:bg-red-700" 
//                             : "bg-red-500 text-white hover:bg-red-600"
//                         }`}
//                       >
//                         {isDisconnecting ? (
//                           <FaSpinner className="animate-spin" />
//                         ) : (
//                           <Power size={16} />
//                         )}
//                         Disconnect
//                       </button>
//                     )}
//                     <button
//                       className={theme === "dark" ? "text-gray-400 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"}
//                       onClick={handleEditToggle}
//                     >
//                       <MoreVertical size={18} />
//                     </button>
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6">
//                   {[
//                     { label: "Username", value: selectedUser.username, icon: User },
//                     { label: "Phone", value: selectedUser.phonenumber, icon: Phone },
//                     { 
//                       label: selectedUser.connection_type === "pppoe" ? "PPPoE Username" : "Device MAC", 
//                       value: selectedUser.device, 
//                       icon: HardDrive 
//                     },
//                     { label: "Location", value: selectedUser.location, icon: Shield },
//                     // Connection Type Field
//                     { 
//                       label: "Connection Type", 
//                       value: selectedUser.connection_type ? selectedUser.connection_type.toUpperCase() : "None", 
//                       icon: Wifi 
//                     },
//                     // Router Field if available
//                     ...(selectedUser.router ? [
//                       { label: "Router", value: selectedUser.router.name, icon: Globe }
//                     ] : [])
//                   ].map((item, index) => (
//                     <div key={index} className={`p-3 rounded-lg ${
//                       theme === "dark" ? "bg-gray-700" : "bg-gray-50"
//                     }`}>
//                       <div className={`flex items-center gap-2 ${
//                         theme === "dark" ? "text-gray-400" : "text-gray-500"
//                       }`}>
//                         <item.icon size={16} />
//                         <span className="text-xs">{item.label}</span>
//                       </div>
//                       <p className={`font-medium mt-1 ${
//                         theme === "dark" ? "text-white" : "text-gray-800"
//                       }`}>
//                         {item.value}
//                       </p>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               {/* Tab Navigation */}
//               <div className={`rounded-xl shadow-sm border overflow-hidden transition-colors duration-300 ${cardClass}`}>
//                 <div className={`flex border-b overflow-x-auto ${
//                   theme === "dark" ? "border-gray-700" : "border-gray-100"
//                 }`}>
//                   {["overview", "subscription", "history", "communication"].map((tab) => (
//                     <button
//                       key={tab}
//                       className={`flex-shrink-0 px-6 py-3 font-medium text-sm ${
//                         activeTab === tab 
//                           ? theme === "dark"
//                             ? "text-blue-400 border-b-2 border-blue-400"
//                             : "text-blue-600 border-b-2 border-blue-600"
//                           : theme === "dark"
//                             ? "text-gray-400 hover:text-gray-300"
//                             : "text-gray-500 hover:text-gray-700"
//                       }`}
//                       onClick={() => setActiveTab(tab)}
//                     >
//                       {tab.charAt(0).toUpperCase() + tab.slice(1)}
//                     </button>
//                   ))}
//                 </div>

//                 <div className="p-6">
//                   {/* Overview Tab */}
//                   {activeTab === 'overview' && (
//                     <div className="space-y-6">
//                       {/* Current Plan Summary */}
//                       {selectedUser.hasPlan ? (
//                         <div className={`p-6 rounded-lg ${
//                           theme === "dark" 
//                             ? "bg-blue-900/20" 
//                             : "bg-gradient-to-r from-blue-50 to-purple-50"
//                         }`}>
//                           <h3 className={`text-lg font-semibold mb-4 ${
//                             theme === "dark" ? "text-white" : "text-gray-800"
//                           }`}>
//                             Current Plan Summary
//                           </h3>
//                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                             <div className="space-y-4">
//                               {[
//                                 { label: "Plan Type", value: selectedUser.subscription.plan?.name, icon: CreditCard, color: "blue" },
//                                 { label: "Payment Status", value: selectedUser.paymentStatus, icon: PaymentStatusIcon, color: "purple" }
//                               ].map((item, index) => (
//                                 <div key={index} className="flex items-center gap-3">
//                                   <div className={`p-2 rounded-lg ${
//                                     theme === "dark" 
//                                       ? `bg-${item.color}-900/20 text-${item.color}-400`
//                                       : `bg-${item.color}-100 text-${item.color}-600`
//                                   }`}>
//                                     {typeof item.icon === 'function' ? <item.icon status={item.value} /> : <item.icon size={18} />}
//                                   </div>
//                                   <div>
//                                     <p className={`text-xs ${
//                                       theme === "dark" ? "text-gray-400" : "text-gray-500"
//                                     }`}>
//                                       {item.label}
//                                     </p>
//                                     <p className={`font-medium capitalize ${
//                                       theme === "dark" ? "text-white" : "text-gray-800"
//                                     }`}>
//                                       {item.value}
//                                     </p>
//                                   </div>
//                                 </div>
//                               ))}
//                             </div>
//                             <div className="space-y-4">
//                               {[
//                                 { label: "Start Date", value: formatDate(selectedUser.subscription.start_date), icon: CalendarDays, color: "green" },
//                                 { label: "Expiry Date", value: formatDate(selectedUser.subscription.expiry_date), icon: CalendarDays, color: "orange" }
//                               ].map((item, index) => (
//                                 <div key={index} className="flex items-center gap-3">
//                                   <div className={`p-2 rounded-lg ${
//                                     theme === "dark" 
//                                       ? `bg-${item.color}-900/20 text-${item.color}-400`
//                                       : `bg-${item.color}-100 text-${item.color}-600`
//                                   }`}>
//                                     <item.icon size={18} />
//                                   </div>
//                                   <div>
//                                     <p className={`text-xs ${
//                                       theme === "dark" ? "text-gray-400" : "text-gray-500"
//                                     }`}>
//                                       {item.label}
//                                     </p>
//                                     <p className={`font-medium ${
//                                       theme === "dark" ? "text-white" : "text-gray-800"
//                                     }`}>
//                                       {item.value}
//                                     </p>
//                                   </div>
//                                 </div>
//                               ))}
//                             </div>
//                           </div>
                          
//                           <div className="mt-6">
//                             <div className="flex items-center justify-between mb-3">
//                               <div className="flex items-center gap-2">
//                                 <DataUsageIcon
//                                   used={selectedUser.data_usage?.used || 0}
//                                   total={selectedUser.data_usage?.total || 1}
//                                   isUnlimited={selectedUser.isUnlimited}
//                                 />
//                                 <span className={`font-medium ${
//                                   theme === "dark" ? "text-white" : "text-gray-800"
//                                 }`}>
//                                   Data Consumption
//                                 </span>
//                               </div>
//                               <span className={`text-sm font-medium ${
//                                 theme === "dark" ? "text-white" : "text-gray-800"
//                               }`}>
//                                 {selectedUser.isUnlimited
//                                   ? "Unlimited"
//                                   : `${selectedUser.data_usage?.used || 0} ${selectedUser.data_usage?.unit || 'GB'} of ${selectedUser.data_usage?.total || 0} ${selectedUser.data_usage?.unit || 'GB'}`}
//                               </span>
//                             </div>
                            
//                             <div className="mb-2">
//                               <DataUsageBar
//                                 used={selectedUser.data_usage?.used || 0}
//                                 total={selectedUser.data_usage?.total || 1}
//                                 isUnlimited={selectedUser.isUnlimited}
//                                 theme={theme}
//                               />
//                             </div>
                            
//                             <div className={`flex items-center justify-between text-xs ${
//                               theme === "dark" ? "text-gray-400" : "text-gray-500"
//                             }`}>
//                               <span>0 {selectedUser.data_usage?.unit || 'GB'}</span>
//                               <span>{selectedUser.isUnlimited ? "∞" : `${selectedUser.data_usage?.total || 0} ${selectedUser.data_usage?.unit || 'GB'}`}</span>
//                             </div>
//                           </div>
//                         </div>
//                       ) : (
//                         <div className={`p-6 rounded-lg ${
//                           theme === "dark" ? "bg-yellow-900/20" : "bg-yellow-50"
//                         }`}>
//                           <div className="flex items-center justify-between">
//                             <div className="flex items-center gap-3">
//                               <div className={`p-2 rounded-lg ${
//                                 theme === "dark" ? "bg-yellow-900/20 text-yellow-400" : "bg-yellow-100 text-yellow-600"
//                               }`}>
//                                 <AlertTriangle size={18} />
//                               </div>
//                               <div>
//                                 <h3 className={`font-medium ${
//                                   theme === "dark" ? "text-white" : "text-gray-800"
//                                 }`}>
//                                   No Active Plan
//                                 </h3>
//                                 <p className={`text-sm ${
//                                   theme === "dark" ? "text-gray-400" : "text-gray-500"
//                                 }`}>
//                                   This client doesn't have an active subscription
//                                 </p>
//                               </div>
//                             </div>
//                             <button className={`px-3 py-1 rounded-lg text-sm ${
//                               theme === "dark" 
//                                 ? "bg-blue-600 text-white hover:bg-blue-700" 
//                                 : "bg-blue-500 text-white hover:bg-blue-600"
//                             }`}>
//                               Assign Plan
//                             </button>
//                           </div>
//                         </div>
//                       )}

//                       {/* Customer Summary */}
//                       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
//                         {[
//                           { label: "Total Revenue", value: formatCurrency(selectedUser.totalRevenue) },
//                           { label: "Avg. Monthly Spend", value: formatCurrency(selectedUser.avgMonthlySpend) },
//                           { label: "Renewal Frequency", value: selectedUser.renewalFrequency },
//                           { label: "Loyalty Duration", value: `${selectedUser.loyaltyDuration} months` },
//                           // Connection Type Stat
//                           { 
//                             label: "Connection Type", 
//                             value: selectedUser.connection_type ? selectedUser.connection_type.toUpperCase() : "None" 
//                           },
//                           // Current Router if available
//                           ...(selectedUser.router ? [
//                             { label: "Current Router", value: selectedUser.router.name }
//                           ] : [])
//                         ].map((stat, index) => (
//                           <div key={index} className={`p-4 rounded-lg shadow-sm border transition-colors duration-300 ${cardClass}`}>
//                             <p className={`text-xs ${
//                               theme === "dark" ? "text-gray-400" : "text-gray-500"
//                             }`}>
//                               {stat.label}
//                             </p>
//                             <p className={`font-medium text-lg ${
//                               theme === "dark" ? "text-white" : "text-gray-800"
//                             }`}>
//                               {stat.value}
//                             </p>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   )}

//                   {/* Subscription Tab */}
//                   {activeTab === 'subscription' && (
//                     <>
//                       {selectedUser.hasPlan ? (
//                         <div className="space-y-6">
//                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//                             <div className="space-y-4">
//                               {[
//                                 { label: "Plan Type", value: selectedUser.subscription.plan?.name, icon: CreditCard, color: "blue" },
//                                 { label: "Payment Status", value: selectedUser.paymentStatus, icon: PaymentStatusIcon, color: "purple" }
//                               ].map((item, index) => (
//                                 <div key={index} className="flex items-center gap-3">
//                                   <div className={`p-2 rounded-lg ${
//                                     theme === "dark" 
//                                       ? `bg-${item.color}-900/20 text-${item.color}-400`
//                                       : `bg-${item.color}-100 text-${item.color}-600`
//                                   }`}>
//                                     {typeof item.icon === 'function' ? <item.icon status={item.value} /> : <item.icon size={18} />}
//                                   </div>
//                                   <div>
//                                     <p className={`text-xs ${
//                                       theme === "dark" ? "text-gray-400" : "text-gray-500"
//                                     }`}>
//                                       {item.label}
//                                     </p>
//                                     <p className={`font-medium capitalize ${
//                                       theme === "dark" ? "text-white" : "text-gray-800"
//                                     }`}>
//                                       {item.value}
//                                     </p>
//                                   </div>
//                                 </div>
//                               ))}
//                             </div>
//                             <div className="space-y-4">
//                               {[
//                                 { label: "Start Date", value: formatDate(selectedUser.subscription.start_date), icon: CalendarDays, color: "green" },
//                                 { label: "Expiry Date", value: formatDate(selectedUser.subscription.expiry_date), icon: CalendarDays, color: "orange" }
//                               ].map((item, index) => (
//                                 <div key={index} className="flex items-center gap-3">
//                                   <div className={`p-2 rounded-lg ${
//                                     theme === "dark" 
//                                       ? `bg-${item.color}-900/20 text-${item.color}-400`
//                                       : `bg-${item.color}-100 text-${item.color}-600`
//                                   }`}>
//                                     <item.icon size={18} />
//                                   </div>
//                                   <div>
//                                     <p className={`text-xs ${
//                                       theme === "dark" ? "text-gray-400" : "text-gray-500"
//                                     }`}>
//                                       {item.label}
//                                     </p>
//                                     <p className={`font-medium ${
//                                       theme === "dark" ? "text-white" : "text-gray-800"
//                                     }`}>
//                                       {item.value}
//                                     </p>
//                                   </div>
//                                 </div>
//                               ))}
//                             </div>
//                           </div>
                          
//                           <div className="flex items-center justify-between mb-3">
//                             <div className="flex items-center gap-2">
//                               <DataUsageIcon
//                                 used={selectedUser.data_usage?.used || 0}
//                                 total={selectedUser.data_usage?.total || 1}
//                                 isUnlimited={selectedUser.isUnlimited}
//                               />
//                               <span className={`font-medium ${
//                                 theme === "dark" ? "text-white" : "text-gray-800"
//                               }`}>
//                                 Data Consumption
//                               </span>
//                             </div>
//                             <span className={`text-sm font-medium ${
//                               theme === "dark" ? "text-white" : "text-gray-800"
//                             }`}>
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
//                               theme={theme}
//                             />
//                           </div>
                          
//                           <div className={`flex items-center justify-between text-xs ${
//                             theme === "dark" ? "text-gray-400" : "text-gray-500"
//                           }`}>
//                             <span>0 {selectedUser.data_usage?.unit || 'GB'}</span>
//                             <span>{selectedUser.isUnlimited ? "∞" : `${selectedUser.data_usage?.total || 0} ${selectedUser.data_usage?.unit || 'GB'}`}</span>
//                           </div>
//                         </div>
//                       ) : (
//                         <div className={`text-center py-8 ${
//                           theme === "dark" ? "text-gray-400" : "text-gray-500"
//                         }`}>
//                           <CreditCard size={24} className="mx-auto mb-2 opacity-50" />
//                           <p>No active subscription found</p>
//                         </div>
//                       )}
//                     </>
//                   )}

//                   {/* History Tab */}
//                   {activeTab === 'history' && (
//                     <div className="space-y-8">
//                       {selectedUser.history?.purchaseHistory?.length > 0 || selectedUser.history?.visitedSites?.length > 0 ? (
//                         <>
//                           {/* Plan Purchase Trends */}
//                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                             <div>
//                               <h4 className={`font-medium mb-3 flex items-center gap-2 ${
//                                 theme === "dark" ? "text-gray-300" : "text-gray-700"
//                               }`}>
//                                 <BarChart2 size={16} />
//                                 Annual Revenue Trend
//                               </h4>
//                               <div className={`h-64 p-3 rounded-lg ${
//                                 theme === "dark" ? "bg-gray-700" : "bg-gray-50"
//                               }`}>
//                                 <ResponsiveContainer width="100%" height="100%">
//                                   <LineChart data={getChartData}>
//                                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === "dark" ? "#374151" : "#E5E7EB"} />
//                                     <XAxis dataKey="year" stroke={theme === "dark" ? "#9CA3AF" : "#6B7280"} />
//                                     <YAxis stroke={theme === "dark" ? "#9CA3AF" : "#6B7280"} />
//                                     <Tooltip 
//                                       formatter={(value) => [formatCurrency(value), "Revenue"]}
//                                       contentStyle={{
//                                         backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
//                                         borderColor: theme === 'dark' ? '#374151' : '#E5E7EB',
//                                         color: theme === 'dark' ? '#F9FAFB' : '#1F2937'
//                                       }}
//                                     />
//                                     <Line
//                                       type="monotone"
//                                       dataKey="revenue"
//                                       stroke="#3B82F6"
//                                       strokeWidth={2}
//                                       dot={{ r: 4 }}
//                                       activeDot={{ r: 6 }}
//                                     />
//                                   </LineChart>
//                                 </ResponsiveContainer>
//                               </div>
//                             </div>
                            
//                             <div>
//                               <h4 className={`font-medium mb-3 flex items-center gap-2 ${
//                                 theme === "dark" ? "text-gray-300" : "text-gray-700"
//                               }`}>
//                                 <BarChart2 size={16} />
//                                 Monthly Revenue Breakdown
//                               </h4>
//                               <div className={`h-64 p-3 rounded-lg ${
//                                 theme === "dark" ? "bg-gray-700" : "bg-gray-50"
//                               }`}>
//                                 <ResponsiveContainer width="100%" height="100%">
//                                   <BarChart data={getMonthlyChartData}>
//                                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === "dark" ? "#374151" : "#E5E7EB"} />
//                                     <XAxis dataKey="month" stroke={theme === "dark" ? "#9CA3AF" : "#6B7280"} />
//                                     <YAxis stroke={theme === "dark" ? "#9CA3AF" : "#6B7280"} />
//                                     <Tooltip 
//                                       formatter={(value) => [formatCurrency(value), "Revenue"]}
//                                       contentStyle={{
//                                         backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
//                                         borderColor: theme === 'dark' ? '#374151' : '#E5E7EB',
//                                         color: theme === 'dark' ? '#F9FAFB' : '#1F2937'
//                                       }}
//                                     />
//                                     <Bar dataKey="revenue" fill="#8884d8" radius={[4, 4, 0, 0]} />
//                                   </BarChart>
//                                 </ResponsiveContainer>
//                               </div>
//                             </div>
//                           </div>

//                           {/* Plan Distribution */}
//                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                             <div>
//                               <h4 className={`font-medium mb-3 flex items-center gap-2 ${
//                                 theme === "dark" ? "text-gray-300" : "text-gray-700"
//                               }`}>
//                                 <Package size={16} />
//                                 Plan Distribution
//                               </h4>
//                               <div className={`h-64 p-3 rounded-lg ${
//                                 theme === "dark" ? "bg-gray-700" : "bg-gray-50"
//                               }`}>
//                                 <ResponsiveContainer width="100%" height="100%">
//                                   <PieChart>
//                                     <Pie
//                                       data={getPlanDistributionData}
//                                       cx="50%"
//                                       cy="50%"
//                                       labelLine={false}
//                                       outerRadius={80}
//                                       fill="#8884d8"
//                                       dataKey="value"
//                                       label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
//                                     >
//                                       {getPlanDistributionData.map((entry, index) => (
//                                         <Cell key={`cell-${index}`} fill={entry.color} />
//                                       ))}
//                                     </Pie>
//                                     <Tooltip 
//                                       formatter={(value, name) => [`${value} purchases`, name]}
//                                       contentStyle={{
//                                         backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
//                                         borderColor: theme === 'dark' ? '#374151' : '#E5E7EB',
//                                         color: theme === 'dark' ? '#F9FAFB' : '#1F2937'
//                                       }}
//                                     />
//                                   </PieChart>
//                                 </ResponsiveContainer>
//                               </div>
//                             </div>
                            
//                             <div>
//                               <h4 className={`font-medium mb-3 flex items-center gap-2 ${
//                                 theme === "dark" ? "text-gray-300" : "text-gray-700"
//                               }`}>
//                                 <CreditCard size={16} />
//                                 Payment Methods
//                               </h4>
//                               <div className={`h-64 p-3 rounded-lg ${
//                                 theme === "dark" ? "bg-gray-700" : "bg-gray-50"
//                               }`}>
//                                 <ResponsiveContainer width="100%" height="100%">
//                                   <PieChart>
//                                     <Pie
//                                       data={getPaymentMethodData}
//                                       cx="50%"
//                                       cy="50%"
//                                       labelLine={false}
//                                       outerRadius={80}
//                                       fill="#8884d8"
//                                       dataKey="value"
//                                       label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
//                                     >
//                                       {getPaymentMethodData.map((entry, index) => (
//                                         <Cell
//                                           key={`cell-${index}`}
//                                           fill={["#6366F1", "#3B82F6", "#10B981", "#F59E0B"][index % 4]}
//                                         />
//                                       ))}
//                                     </Pie>
//                                     <Tooltip 
//                                       formatter={(value, name) => [`${value} purchases`, name]}
//                                       contentStyle={{
//                                         backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
//                                         borderColor: theme === 'dark' ? '#374151' : '#E5E7EB',
//                                         color: theme === 'dark' ? '#F9FAFB' : '#1F2937'
//                                       }}
//                                     />
//                                   </PieChart>
//                                 </ResponsiveContainer>
//                               </div>
//                             </div>
//                           </div>

//                           {/* Plan Behavior Insights */}
//                           <div>
//                             <h4 className={`font-medium mb-3 flex items-center gap-2 ${
//                               theme === "dark" ? "text-gray-300" : "text-gray-700"
//                             }`}>
//                               <TrendingUp size={16} />
//                               Plan Behavior Insights
//                             </h4>
//                             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
//                               {[
//                                 { label: "Favorite Plan", value: getPlanBehavior.favoritePlan },
//                                 { label: "Number of Upgrades", value: getPlanBehavior.upgrades },
//                                 { label: "Plan Changes", value: getPlanBehavior.planChanges },
//                                 { label: "Avg. Plan Duration", value: `${getPlanBehavior.avgDuration.toFixed(1)} months` }
//                               ].map((stat, index) => (
//                                 <div key={index} className={`p-3 rounded-lg ${
//                                   theme === "dark" ? "bg-gray-700" : "bg-gray-50"
//                                 }`}>
//                                   <p className={`text-xs ${
//                                     theme === "dark" ? "text-gray-400" : "text-gray-500"
//                                   }`}>
//                                     {stat.label}
//                                   </p>
//                                   <p className={`font-medium ${
//                                     theme === "dark" ? "text-white" : "text-gray-800"
//                                   }`}>
//                                     {stat.value}
//                                   </p>
//                                 </div>
//                               ))}
//                             </div>
                            
//                             <div className={`mt-4 p-3 rounded-lg ${
//                               theme === "dark" ? "bg-gray-700" : "bg-gray-50"
//                             }`}>
//                               <div className="flex items-center gap-2">
//                                 <p className={`text-xs ${
//                                   theme === "dark" ? "text-gray-400" : "text-gray-500"
//                                 }`}>
//                                   Spending Trend:
//                                 </p>
//                                 {getSpendingTrend === "up" ? (
//                                   <div className="flex items-center text-green-500">
//                                     <TrendingUp size={16} />
//                                     <span className="ml-1">Increasing</span>
//                                   </div>
//                                 ) : getSpendingTrend === "down" ? (
//                                   <div className="flex items-center text-red-500">
//                                     <TrendingDown size={16} />
//                                     <span className="ml-1">Decreasing</span>
//                                   </div>
//                                 ) : (
//                                   <div className="flex items-center text-gray-500">
//                                     <Circle size={16} />
//                                     <span className="ml-1">Stable</span>
//                                   </div>
//                                 )}
//                               </div>
//                             </div>
//                           </div>

//                           {/* Browsing History */}
//                           <div>
//                             <div className="flex items-center justify-between mb-3">
//                               <h4 className={`font-medium flex items-center gap-2 ${
//                                 theme === "dark" ? "text-gray-300" : "text-gray-700"
//                               }`}>
//                                 <Globe size={16} />
//                                 Browsing History
//                               </h4>
//                               <button
//                                 className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm ${
//                                   theme === "dark" 
//                                     ? "bg-blue-600 text-white hover:bg-blue-700" 
//                                     : "bg-blue-500 text-white hover:bg-blue-600"
//                                 }`}
//                                 onClick={() => exportBrowsingHistoryToCSV(selectedUser.history.visitedSites)}
//                               >
//                                 <Download size={14} />
//                                 Export
//                               </button>
//                             </div>
                            
//                             <div className="overflow-x-auto">
//                               <table className="w-full text-sm">
//                                 <thead>
//                                   <tr className={theme === "dark" ? "bg-gray-700" : "bg-gray-100"}>
//                                     {["URL", "Data Used", "Frequency", "Timestamp", "Router", "Device"].map((header) => (
//                                       <th key={header} className={`p-2 text-left ${
//                                         theme === "dark" ? "text-gray-300" : "text-gray-600"
//                                       }`}>
//                                         {header}
//                                       </th>
//                                     ))}
//                                   </tr>
//                                 </thead>
//                                 <tbody>
//                                   {selectedUser.history.visitedSites && selectedUser.history.visitedSites.length > 0 ? (
//                                     selectedUser.history.visitedSites.map((site, index) => (
//                                       <tr key={index} className={`border-b ${
//                                         theme === "dark" 
//                                           ? "border-gray-700 hover:bg-gray-700" 
//                                           : "border-gray-200 hover:bg-gray-50"
//                                       }`}>
//                                         <td className="p-2">
//                                           <a
//                                             href={site.url}
//                                             target="_blank"
//                                             rel="noopener noreferrer"
//                                             className="text-blue-500 hover:underline"
//                                           >
//                                             {site.url.length > 30 ? `${site.url.substring(0, 27)}...` : site.url}
//                                           </a>
//                                         </td>
//                                         <td className={`p-2 ${
//                                           theme === "dark" ? "text-gray-300" : "text-gray-700"
//                                         }`}>
//                                           {site.data_used || "0GB"}
//                                         </td>
//                                         <td className={`p-2 ${
//                                           theme === "dark" ? "text-gray-300" : "text-gray-700"
//                                         }`}>
//                                           {site.frequency || "N/A"}
//                                         </td>
//                                         <td className={`p-2 ${
//                                           theme === "dark" ? "text-gray-300" : "text-gray-700"
//                                         }`}>
//                                           {formatDate(site.timestamp)}
//                                         </td>
//                                         <td className={`p-2 ${
//                                           theme === "dark" ? "text-gray-300" : "text-gray-700"
//                                         }`}>
//                                           {site.router?.name || "Unknown"}
//                                         </td>
//                                         <td className={`p-2 ${
//                                           theme === "dark" ? "text-gray-300" : "text-gray-700"
//                                         }`}>
//                                           {site.hotspot_user?.mac || "Unknown"}
//                                         </td>
//                                       </tr>
//                                     ))
//                                   ) : (
//                                     <tr>
//                                       <td colSpan={6} className={`p-4 text-center ${
//                                         theme === "dark" ? "text-gray-400" : "text-gray-500"
//                                       }`}>
//                                         No browsing history found
//                                       </td>
//                                     </tr>
//                                   )}
//                                 </tbody>
//                               </table>
//                             </div>
//                           </div>

//                           {/* Purchase History */}
//                           <div>
//                             <div className="flex items-center justify-between mb-3">
//                               <h4 className={`font-medium flex items-center gap-2 ${
//                                 theme === "dark" ? "text-gray-300" : "text-gray-700"
//                               }`}>
//                                 <History size={16} />
//                                 Detailed Purchase History
//                               </h4>
//                               <div className="flex items-center gap-2">
//                                 <select
//                                   className={`border rounded-lg px-2 py-1 text-sm ${
//                                     theme === "dark" 
//                                       ? "bg-gray-700 border-gray-600 text-white" 
//                                       : "border-gray-200"
//                                   }`}
//                                   value={filterYear}
//                                   onChange={(e) => setFilterYear(e.target.value)}
//                                 >
//                                   <option value="All">All Years</option>
//                                   {[
//                                     ...new Set(
//                                       selectedUser.history.purchaseHistory.map((p) =>
//                                         new Date(p.purchase_date).getFullYear()
//                                       )
//                                     ),
//                                   ]
//                                     .sort((a, b) => b - a)
//                                     .map((year) => (
//                                       <option key={year} value={year}>
//                                         {year}
//                                       </option>
//                                     ))}
//                                 </select>
//                                 <button
//                                   className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm ${
//                                     theme === "dark" 
//                                       ? "bg-blue-600 text-white hover:bg-blue-700" 
//                                       : "bg-blue-500 text-white hover:bg-blue-600"
//                                   }`}
//                                   onClick={() => exportToCSV(selectedUser.history)}
//                                 >
//                                   <Download size={14} />
//                                   Export
//                                 </button>
//                               </div>
//                             </div>
                            
//                             <div className="overflow-x-auto">
//                               <table className="w-full text-sm">
//                                 <thead>
//                                   <tr className={theme === "dark" ? "bg-gray-700" : "bg-gray-100"}>
//                                     {["Plan", "Purchase Date", "Duration", "Price", "Status", "Details"].map((header) => (
//                                       <th key={header} className={`p-2 text-left ${
//                                         theme === "dark" ? "text-gray-300" : "text-gray-600"
//                                       }`}>
//                                         {header}
//                                       </th>
//                                     ))}
//                                   </tr>
//                                 </thead>
//                                 <tbody>
//                                   {getFilteredPurchaseHistory.map((purchase, index) => (
//                                     <tr
//                                       key={index}
//                                       className={`border-b cursor-pointer ${
//                                         theme === "dark" 
//                                           ? "border-gray-700 hover:bg-gray-700" 
//                                           : "border-gray-200 hover:bg-gray-50"
//                                       }`}
//                                       onClick={() => viewPurchaseDetails(purchase)}
//                                     >
//                                       <td className="p-2">
//                                         <div className="flex items-center gap-2">
//                                           <div
//                                             className="w-2 h-2 rounded-full"
//                                             style={{ backgroundColor: getPlanColor(purchase.plan?.name) }}
//                                           ></div>
//                                           <span className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>
//                                             {purchase.plan?.name || "N/A"}
//                                           </span>
//                                         </div>
//                                       </td>
//                                       <td className={`p-2 ${
//                                         theme === "dark" ? "text-gray-300" : "text-gray-700"
//                                       }`}>
//                                         {formatDate(purchase.purchase_date)}
//                                       </td>
//                                       <td className={`p-2 ${
//                                         theme === "dark" ? "text-gray-300" : "text-gray-700"
//                                       }`}>
//                                         {purchase.duration || "N/A"}
//                                       </td>
//                                       <td className={`p-2 font-medium ${
//                                         theme === "dark" ? "text-white" : "text-gray-800"
//                                       }`}>
//                                         {formatCurrency(purchase.amount)}
//                                       </td>
//                                       <td className="p-2">
//                                         <span
//                                           className={`px-2 py-1 rounded-full text-xs ${
//                                             purchase.status === "Active"
//                                               ? theme === "dark"
//                                                 ? "bg-green-900/20 text-green-400"
//                                                 : "bg-green-100 text-green-700"
//                                               : theme === "dark"
//                                                 ? "bg-red-900/20 text-red-400"
//                                                 : "bg-red-100 text-red-700"
//                                           }`}
//                                         >
//                                           {purchase.status || "N/A"}
//                                         </span>
//                                       </td>
//                                       <td className="p-2">
//                                         <button className="text-blue-500 hover:text-blue-700">
//                                           <ArrowUpRight size={16} />
//                                         </button>
//                                       </td>
//                                     </tr>
//                                   ))}
//                                 </tbody>
//                               </table>
//                             </div>
//                           </div>
//                         </>
//                       ) : (
//                         <div className={`text-center py-8 ${
//                           theme === "dark" ? "text-gray-400" : "text-gray-500"
//                         }`}>
//                           <Package size={24} className="mx-auto mb-2 opacity-50" />
//                           <p>No history found</p>
//                         </div>
//                       )}
//                     </div>
//                   )}

//                   {/* Communication Log Tab */}
//                   {activeTab === 'communication' && (
//                     <div className="space-y-6">
//                       {/* Send Message Form */}
//                       <div className={`p-4 rounded-lg ${
//                         theme === "dark" ? "bg-gray-700" : "bg-gray-50"
//                       }`}>
//                         <h4 className={`font-medium mb-3 ${
//                           theme === "dark" ? "text-gray-300" : "text-gray-700"
//                         }`}>
//                           Send Message
//                         </h4>
//                         <form onSubmit={handleSendMessage} className="space-y-3">
//                           <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
//                             <div>
//                               <label className={`block text-sm mb-1 ${
//                                 theme === "dark" ? "text-gray-400" : "text-gray-600"
//                               }`}>
//                                 Message Type
//                               </label>
//                               <select
//                                 name="message_type"
//                                 value={messageForm.message_type}
//                                 onChange={handleMessageChange}
//                                 className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${inputClass}`}
//                               >
//                                 <option value="sms">SMS</option>
//                                 <option value="email">Email</option>
//                                 <option value="system">System Notification</option>
//                               </select>
//                             </div>
//                             {messageForm.message_type === 'email' && (
//                               <div className="md:col-span-2">
//                                 <label className={`block text-sm mb-1 ${
//                                   theme === "dark" ? "text-gray-400" : "text-gray-600"
//                                 }`}>
//                                   Subject
//                                 </label>
//                                 <input
//                                   type="text"
//                                   name="subject"
//                                   value={messageForm.subject}
//                                   onChange={handleMessageChange}
//                                   className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${inputClass}`}
//                                   placeholder="Email subject"
//                                 />
//                               </div>
//                             )}
//                           </div>
//                           <div>
//                             <label className={`block text-sm mb-1 ${
//                               theme === "dark" ? "text-gray-400" : "text-gray-600"
//                             }`}>
//                               Message
//                             </label>
//                             <textarea
//                               name="message"
//                               value={messageForm.message}
//                               onChange={handleMessageChange}
//                               rows={3}
//                               className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${inputClass}`}
//                               placeholder="Type your message here..."
//                               required
//                             />
//                           </div>
//                           <div className="flex justify-end">
//                             <button
//                               type="submit"
//                               disabled={isSendingMessage}
//                               className={`flex items-center gap-2 px-4 py-2 rounded-lg disabled:opacity-50 ${
//                                 theme === "dark" 
//                                   ? "bg-blue-600 text-white hover:bg-blue-700" 
//                                   : "bg-blue-500 text-white hover:bg-blue-600"
//                               }`}
//                             >
//                               {isSendingMessage ? (
//                                 <FaSpinner className="animate-spin" />
//                               ) : (
//                                 <Send size={16} />
//                               )}
//                               Send Message
//                             </button>
//                           </div>
//                         </form>
//                       </div>

//                       {/* Communication Log */}
//                       <div>
//                         <h4 className={`font-medium mb-3 ${
//                           theme === "dark" ? "text-gray-300" : "text-gray-700"
//                         }`}>
//                           Communication History
//                         </h4>
//                         {selectedUser.communication_logs && selectedUser.communication_logs.length > 0 ? (
//                           <div className="space-y-3">
//                             {selectedUser.communication_logs.map((log) => (
//                               <div key={log.id} className={`p-4 rounded-lg border transition-colors duration-300 ${cardClass}`}>
//                                 <div className="flex items-start gap-3">
//                                   <MessageTypeIcon type={log.message_type} />
//                                   <div className="flex-1">
//                                     <p className={`font-medium ${
//                                       theme === "dark" ? "text-white" : "text-gray-800"
//                                     }`}>
//                                       {log.subject || log.trigger_display}
//                                     </p>
//                                     <p className={`text-sm ${
//                                       theme === "dark" ? "text-gray-400" : "text-gray-500"
//                                     }`}>
//                                       {formatDate(log.formatted_timestamp)}
//                                     </p>
//                                     <div className="mt-1">
//                                       <StatusBadge status={log.status} theme={theme} />
//                                     </div>
//                                     <p className={`mt-2 ${
//                                       theme === "dark" ? "text-gray-300" : "text-gray-700"
//                                     }`}>
//                                       {log.message}
//                                     </p>
//                                     {log.router && (
//                                       <p className={`text-sm ${
//                                         theme === "dark" ? "text-gray-400" : "text-gray-500"
//                                       } mt-1`}>
//                                         Router: {log.router.name}
//                                       </p>
//                                     )}
//                                   </div>
//                                 </div>
//                               </div>
//                             ))}
//                           </div>
//                         ) : (
//                           <div className={`text-center py-8 ${
//                             theme === "dark" ? "text-gray-400" : "text-gray-500"
//                           }`}>
//                             <MessageSquare size={24} className="mx-auto mb-2 opacity-50" />
//                             <p>No communication history</p>
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   )}
//                 </div>
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
//                         This plan expired on {formatDate(selectedUser.subscription?.expiry_date)}
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

// export default Subscribers;






import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext"
import { FaSpinner } from "react-icons/fa";
import { 
  FiDownload, 
  FiFilter, 
  FiRefreshCw, 
  FiUsers,
  FiX 
} from "react-icons/fi";
import api from "../../api"

// Import new components
import ConnectionStats from "../UserManagement/components/ConnectionStats"
import AdvancedFilters from "../UserManagement/components/AdvancedFilters"
import ClientList from "../UserManagement/components/ClientList"
import ClientProfile from "../UserManagement/components/ClientProfile"

// Import utility functions
import { formatClientData } from "../UserManagement/components/utils/clientDataFormatter"

// Import shared components
import { 
  DataUsageBar, 
  DataUsageIcon, 
  PaymentStatusIcon, 
  StatusBadge, 
  MessageTypeIcon 
} from "../UserManagement/components/SharedComponents"

const getContainerClass = (theme) => theme === "dark" 
  ? "bg-gradient-to-br from-gray-900 to-indigo-900 text-white min-h-screen" 
  : "bg-gray-50 text-gray-800 min-h-screen";

const Subscribers = () => {
  const { isAuthenticated, authLoading } = useAuth();
  const { theme } = useTheme();
  
  // Enhanced state management
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [stats, setStats] = useState(null);
  const [showFilters, setShowFilters] = useState(true);

  // Enhanced filtering state
  const [activeFilter, setActiveFilter] = useState("all");
  const [connectionFilter, setConnectionFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [routerFilter, setRouterFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("overview");
  const [lastRefresh, setLastRefresh] = useState(null);

  // Theme classes
  const containerClass = useMemo(() => getContainerClass(theme), [theme]);

  // Enhanced fetch function with query parameters
  const fetchUsers = useCallback(async () => {
    if (!isAuthenticated) {
      setError("Please log in to view client profiles.");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      if (activeFilter === 'active') params.append('active', 'true');
      if (activeFilter === 'inactive') params.append('active', 'false');
      if (connectionFilter !== 'all') params.append('connection_type', connectionFilter);
      if (routerFilter !== 'all') params.append('router_id', routerFilter);
      if (searchQuery) params.append('search', searchQuery);
      params.append('page_size', '100');

      const [usersResponse, statsResponse] = await Promise.all([
        api.get(`/api/user_management/profiles/?${params}`),
        api.get('/api/user_management/connection-stats/')
      ]);

      const usersData = usersResponse.data.results || usersResponse.data;
      const enrichedUsers = usersData.map(formatClientData);
      
      setUsers(enrichedUsers);
      setFilteredUsers(enrichedUsers);
      setStats(statsResponse.data);
      
      if (enrichedUsers.length > 0 && !selectedUser) {
        setSelectedUser(enrichedUsers[0]);
      }
      
      setLastRefresh(new Date());
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load clients.");
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, activeFilter, connectionFilter, routerFilter, searchQuery, selectedUser]);

  // Fetch users when filters change or on mount
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchUsers();
    }
  }, [authLoading, isAuthenticated, fetchUsers]);

  // Enhanced user selection with detailed data fetch
  const handleViewUser = useCallback(async (user) => {
    try {
      const response = await api.get(`/api/user_management/profiles/${user.id}/`);
      const enrichedUser = formatClientData(response.data);
      setSelectedUser(enrichedUser);
      setActiveTab("overview");
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load client profile.");
    }
  }, []);

  // Refresh data
  const handleRefresh = useCallback(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Export users to CSV
  const exportToCSV = useCallback(() => {
    const headers = ["Username", "Phone", "Connection Type", "Status", "Plan", "Total Revenue", "Location", "Device"];
    const rows = filteredUsers.map(user => [
      user.username,
      user.phonenumber,
      user.connection_type || 'none',
      user.active ? 'Active' : 'Inactive',
      user.subscription?.plan?.name || 'No Plan',
      `KES ${user.total_revenue || 0}`,
      user.location || 'Unknown',
      user.device || 'Unknown'
    ].join(","));
    
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute("download", `clients_export_${new Date().toISOString().split('T')[0]}.csv`);
    a.click();
  }, [filteredUsers]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setActiveFilter("all");
    setConnectionFilter("all");
    setSearchQuery("");
    setRouterFilter("all");
    setCurrentPage(1);
  }, []);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return activeFilter !== "all" || 
           connectionFilter !== "all" || 
           searchQuery || 
           routerFilter !== "all";
  }, [activeFilter, connectionFilter, searchQuery, routerFilter]);

  // Format last refresh time
  const formatLastRefresh = useMemo(() => {
    if (!lastRefresh) return "Never";
    return lastRefresh.toLocaleTimeString();
  }, [lastRefresh]);

  if (authLoading) {
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
            <div className="flex items-center justify-between">
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                className={`ml-4 px-2 py-1 rounded ${
                  theme === "dark" ? "hover:bg-red-800" : "hover:bg-red-200"
                }`}
              >
                <FiX size={16} />
              </button>
            </div>
          </div>
        )}
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
          <div className="flex-1">
            <h1 className={`text-xl md:text-3xl font-bold ${
              theme === "dark" ? "text-white" : "text-gray-800"
            }`}>
              Client Management Dashboard
            </h1>
            <p className={`${theme === "dark" ? "text-gray-300" : "text-gray-500"}`}>
              Monitor and manage client profiles, connections, and subscriptions
              {lastRefresh && (
                <span className={`text-xs ml-2 ${theme === "dark" ? "text-gray-400" : "text-gray-400"}`}>
                  Last updated: {formatLastRefresh}
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportToCSV}
              disabled={filteredUsers.length === 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                theme === "dark" 
                  ? "bg-green-600 text-white hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed" 
                  : "bg-green-500 text-white hover:bg-green-600 disabled:bg-green-400 disabled:cursor-not-allowed"
              }`}
            >
              <FiDownload size={16} />
              Export CSV
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                theme === "dark" 
                  ? "bg-gray-700 text-white hover:bg-gray-600" 
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              <FiFilter size={16} />
              {showFilters ? 'Hide' : 'Show'} Filters
            </button>
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                theme === "dark" 
                  ? "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed" 
                  : "bg-blue-500 text-white hover:bg-blue-600 disabled:bg-blue-400 disabled:cursor-not-allowed"
              }`}
            >
              {isLoading ? (
                <FaSpinner className="animate-spin" size={16} />
              ) : (
                <FiRefreshCw size={16} />
              )}
              Refresh
            </button>
          </div>
        </div>

        {/* Connection Statistics */}
        <div className="mb-6">
          <ConnectionStats stats={stats} isLoading={isLoading} />
        </div>

        {/* Quick Stats Bar */}
        {stats && (
          <div className={`mb-6 p-4 rounded-xl border ${
            theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          }`}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className={`text-2xl font-bold ${
                  theme === "dark" ? "text-white" : "text-gray-800"
                }`}>
                  {stats.total_clients}
                </div>
                <div className={`text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}>
                  Total Clients
                </div>
              </div>
              <div>
                <div className={`text-2xl font-bold text-green-500`}>
                  {stats.active_connections}
                </div>
                <div className={`text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}>
                  Active Connections
                </div>
              </div>
              <div>
                <div className={`text-2xl font-bold text-orange-500`}>
                  {stats.hotspot_users?.active || 0}
                </div>
                <div className={`text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}>
                  Hotspot Users
                </div>
              </div>
              <div>
                <div className={`text-2xl font-bold text-purple-500`}>
                  {stats.pppoe_users?.active || 0}
                </div>
                <div className={`text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}>
                  PPPoE Users
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Left Sidebar - Filters and Client List */}
          {showFilters && (
            <div className="xl:col-span-1 space-y-6">
              {/* Advanced Filters */}
              <AdvancedFilters
                activeFilter={activeFilter}
                setActiveFilter={setActiveFilter}
                connectionFilter={connectionFilter}
                setConnectionFilter={setConnectionFilter}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                routerFilter={routerFilter}
                setRouterFilter={setRouterFilter}
                hasActiveFilters={hasActiveFilters}
                onClearFilters={clearFilters}
              />

              {/* Client List */}
              <ClientList
                users={filteredUsers}
                selectedUser={selectedUser}
                onUserSelect={handleViewUser}
                isLoading={isLoading}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                usersPerPage={usersPerPage}
                totalUsers={filteredUsers.length}
                activeUsers={filteredUsers.filter(u => u.active).length}
              />
            </div>
          )}

          {/* Right Panel - Client Details */}
          <div className={showFilters ? "xl:col-span-3" : "xl:col-span-4"}>
            {selectedUser ? (
              <ClientProfile
                user={selectedUser}
                onUserUpdate={setSelectedUser}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onRefresh={handleRefresh}
                onUserListRefresh={fetchUsers}
              />
            ) : (
              <div className={`rounded-xl shadow-sm border p-8 text-center ${
                theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              }`}>
                <FiUsers size={48} className={`mx-auto mb-4 ${
                  theme === "dark" ? "text-gray-600" : "text-gray-400"
                }`} />
                <h3 className={`text-lg font-semibold mb-2 ${
                  theme === "dark" ? "text-white" : "text-gray-800"
                }`}>
                  No Client Selected
                </h3>
                <p className={theme === "dark" ? "text-gray-400" : "text-gray-500"}>
                  Select a client from the list to view detailed information
                </p>
                {filteredUsers.length === 0 && !isLoading && (
                  <button
                    onClick={clearFilters}
                    className={`mt-4 px-4 py-2 rounded-lg transition-colors ${
                      theme === "dark" 
                        ? "bg-blue-600 text-white hover:bg-blue-700" 
                        : "bg-blue-500 text-white hover:bg-blue-600"
                    }`}
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`p-6 rounded-xl ${
              theme === "dark" ? "bg-gray-800" : "bg-white"
            }`}>
              <div className="flex items-center gap-3">
                <FaSpinner className="animate-spin text-blue-600" size={24} />
                <span className={theme === "dark" ? "text-white" : "text-gray-800"}>
                  Loading client data...
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Subscribers;

// Export shared components for use in other files
export {
  DataUsageBar,
  DataUsageIcon,
  PaymentStatusIcon,
  StatusBadge,
  MessageTypeIcon
};