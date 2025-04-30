
// import React, { useState } from "react";
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
//   Clock4,
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
// } from "lucide-react";
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

// const mockUsers = [
//   {
//     id: 1,
//     fullName: "Ken Opiyo",
//     email: "ken.opiyo@example.com",
//     phone: "+254701234567",
//     lastLogin: "2025-01-12T14:30:00Z",
//     dataUsage: { used: 20, total: 100, unit: "GB" },
//     subscription: {
//       plan: "Business",
//       startDate: "2025-01-01",
//       expiryDate: "2025-02-01",
//     },
//     location: "Nairobi, Kenya",
//     device: "iPhone 13 Pro",
//     history: {
//       dataUsage: [
//         { month: "Dec 2024", used: 18, total: 100, unit: "GB" },
//         { month: "Nov 2024", used: 22, total: 100, unit: "GB" },
//       ],
//       visitedSites: [
//         { url: "netflix.com", frequency: "daily", dataUsed: "8GB" },
//         { url: "youtube.com", frequency: "weekly", dataUsed: "5GB" },
//       ],
//       preferredPlans: ["Business", "Enterprise"],
//       lastUpgrade: "2024-12-01",
//       averageMonthlyUsage: "20GB",
//       purchaseHistory: [
//         {
//           plan: "Business",
//           purchaseDate: "2025-01-01",
//           duration: "1 month",
//           price: 50,
//           status: "Active",
//           paymentMethod: "Credit Card",
//           invoiceNumber: "INV-2025-001",
//         },
//         {
//           plan: "Enterprise",
//           purchaseDate: "2024-10-01",
//           duration: "3 months",
//           price: 120,
//           status: "Expired",
//           paymentMethod: "M-Pesa",
//           invoiceNumber: "INV-2024-120",
//         },
//         {
//           plan: "Business",
//           purchaseDate: "2024-07-01",
//           duration: "1 month",
//           price: 45,
//           status: "Expired",
//           paymentMethod: "PayPal",
//           invoiceNumber: "INV-2024-078",
//         },
//         {
//           plan: "Basic",
//           purchaseDate: "2024-04-01",
//           duration: "1 month",
//           price: 25,
//           status: "Expired",
//           paymentMethod: "M-Pesa",
//           invoiceNumber: "INV-2024-045",
//         },
//       ],
//     },
//   },
//   {
//     id: 2,
//     fullName: "Lenox Kamari",
//     email: "lenox.kamari@example.com",
//     phone: "+254712345678",
//     lastLogin: "2025-01-11T12:00:00Z",
//     dataUsage: { used: 15, total: "unlimited", unit: "GB" },
//     subscription: {
//       plan: "Residential",
//       startDate: "2025-01-05",
//       expiryDate: "2025-01-25",
//     },
//     location: "Mombasa, Kenya",
//     device: "Samsung Galaxy S22",
//     history: {
//       dataUsage: [
//         { month: "Dec 2024", used: 12, total: "unlimited", unit: "GB" },
//         { month: "Nov 2024", used: 14, total: "unlimited", unit: "GB" },
//       ],
//       visitedSites: [
//         { url: "facebook.com", frequency: "daily", dataUsed: "3GB" },
//         { url: "twitter.com", frequency: "daily", dataUsed: "2GB" },
//       ],
//       preferredPlans: ["Residential", "Basic"],
//       lastUpgrade: "2024-11-15",
//       averageMonthlyUsage: "13GB",
//       purchaseHistory: [
//         {
//           plan: "Residential",
//           purchaseDate: "2025-01-05",
//           duration: "1 month",
//           price: 30,
//           status: "Active",
//           paymentMethod: "M-Pesa",
//           invoiceNumber: "INV-2025-005",
//         },
//         {
//           plan: "Residential",
//           purchaseDate: "2024-12-05",
//           duration: "1 month",
//           price: 30,
//           status: "Expired",
//           paymentMethod: "M-Pesa",
//           invoiceNumber: "INV-2024-125",
//         },
//         {
//           plan: "Basic",
//           purchaseDate: "2024-09-01",
//           duration: "1 month",
//           price: 20,
//           status: "Expired",
//           paymentMethod: "Credit Card",
//           invoiceNumber: "INV-2024-091",
//         },
//       ],
//     },
//   },
//   {
//     id: 3,
//     fullName: "Lucy Wange",
//     email: "lucy.wange@example.com",
//     phone: "+25474567890",
//     lastLogin: "2025-01-11T12:00:00Z",
//     dataUsage: { used: 9.9, total: 10, unit: "GB" },
//     subscription: {
//       plan: "Enterprise",
//       startDate: "2025-01-05",
//       expiryDate: "2025-01-15",
//     },
//     location: "Kisumu, Kenya",
//     device: "Google Pixel 6",
//     history: {
//       dataUsage: [
//         { month: "Dec 2024", used: 8, total: 10, unit: "GB" },
//         { month: "Nov 2024", used: 9, total: 10, unit: "GB" },
//       ],
//       visitedSites: [
//         { url: "linkedin.com", frequency: "daily", dataUsed: "2GB" },
//         { url: "zoom.us", frequency: "weekly", dataUsed: "3GB" },
//       ],
//       preferredPlans: ["Enterprise", "Business"],
//       lastUpgrade: "2024-12-15",
//       averageMonthlyUsage: "8.5GB",
//       purchaseHistory: [
//         {
//           plan: "Enterprise",
//           purchaseDate: "2025-01-05",
//           duration: "1 month",
//           price: 80,
//           status: "Active",
//           paymentMethod: "Credit Card",
//           invoiceNumber: "INV-2025-008",
//         },
//         {
//           plan: "Business",
//           purchaseDate: "2024-11-01",
//           duration: "2 months",
//           price: 90,
//           status: "Expired",
//           paymentMethod: "PayPal",
//           invoiceNumber: "INV-2024-110",
//         },
//         {
//           plan: "Enterprise",
//           purchaseDate: "2024-08-01",
//           duration: "3 months",
//           price: 200,
//           status: "Expired",
//           paymentMethod: "Bank Transfer",
//           invoiceNumber: "INV-2024-080",
//         },
//         {
//           plan: "Business",
//           purchaseDate: "2024-05-01",
//           duration: "1 month",
//           price: 45,
//           status: "Expired",
//           paymentMethod: "M-Pesa",
//           invoiceNumber: "INV-2024-051",
//         },
//         {
//           plan: "Basic",
//           purchaseDate: "2024-02-01",
//           duration: "1 month",
//           price: 20,
//           status: "Expired",
//           paymentMethod: "M-Pesa",
//           invoiceNumber: "INV-2024-021",
//         },
//       ],
//     },
//   },
// ];

// const UserProfilePage = () => {
//   const today = new Date();

//   const enrichUsers = mockUsers.map((user) => {
//     const expiry = new Date(user.subscription.expiryDate);
//     const paymentStatus =
//       today < expiry
//         ? "Paid"
//         : today.toDateString() === expiry.toDateString()
//         ? "Due"
//         : "Expired";

//     const isUnlimited = user.dataUsage.total === "unlimited";
//     const active = isUnlimited || user.dataUsage.used < user.dataUsage.total;

//     // Calculate total revenue and renewal frequency
//     const totalRevenue = user.history.purchaseHistory.reduce(
//       (sum, purchase) => sum + purchase.price,
//       0
//     );
    
//     const renewalFrequency =
//       user.history.purchaseHistory.length > 1
//         ? `${user.history.purchaseHistory.length} renewals`
//         : "No renewals";

//     // Calculate average spending per month
//     const firstPurchase = new Date(user.history.purchaseHistory[user.history.purchaseHistory.length - 1].purchaseDate);
//     const monthsActive = (today.getFullYear() - firstPurchase.getFullYear()) * 12 + 
//                          (today.getMonth() - firstPurchase.getMonth()) + 1;
//     const avgMonthlySpend = totalRevenue / Math.max(monthsActive, 1);

//     // Calculate loyalty duration
//     const loyaltyDuration = Math.floor((today - firstPurchase) / (1000 * 60 * 60 * 24 * 30));

//     return {
//       ...user,
//       paymentStatus,
//       active,
//       isUnlimited,
//       totalRevenue,
//       renewalFrequency,
//       avgMonthlySpend,
//       loyaltyDuration,
//     };
//   });

//   const defaultUser = enrichUsers.reduce((latest, user) => {
//     return new Date(user.subscription.expiryDate) >
//       new Date(latest.subscription.expiryDate)
//       ? user
//       : latest;
//   }, enrichUsers[0]);

//   const [users] = useState(enrichUsers);
//   const [selectedUser, setSelectedUser] = useState(defaultUser);
//   const [expandedSection, setExpandedSection] = useState(null);
//   const [filterYear, setFilterYear] = useState("All");
//   const [selectedPurchase, setSelectedPurchase] = useState(null);

//   const handleView = (user) => {
//     setSelectedUser(user);
//     setExpandedSection(null);
//     setFilterYear("All");
//     setSelectedPurchase(null);
//   };

//   const toggleSection = (section) => {
//     setExpandedSection(expandedSection === section ? null : section);
//     setSelectedPurchase(null);
//   };

//   const DataUsageBar = ({ used, total, isUnlimited }) => {
//     if (isUnlimited) {
//       return (
//         <div className="w-full bg-gradient-to-r from-purple-100 to-blue-100 rounded-full h-3 relative overflow-hidden">
//           <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-blue-500 to-teal-400 opacity-70 animate-pulse rounded-full"></div>
//         </div>
//       );
//     }

//     const percentage = Math.min((used / total) * 100, 100);
//     let colorClass = "bg-green-500";
//     if (percentage > 80) colorClass = "bg-yellow-500";
//     if (percentage > 95) colorClass = "bg-red-500";

//     return (
//       <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
//         <div
//           className={`${colorClass} h-3 rounded-full transition-all duration-500`}
//           style={{ width: `${percentage}%` }}
//         ></div>
//       </div>
//     );
//   };

//   const DataUsageIcon = ({ used, total, isUnlimited }) => {
//     if (isUnlimited) return <Zap className="text-purple-500" size={18} />;
//     const percentage = used / total;
//     if (percentage < 0.3) return <BatteryFull className="text-green-500" size={18} />;
//     if (percentage < 0.7) return <BatteryMedium className="text-yellow-500" size={18} />;
//     return <BatteryLow className="text-red-500" size={18} />;
//   };

//   const PaymentStatusIcon = ({ status }) => {
//     switch (status) {
//       case "Paid":
//         return <BadgeCheck className="text-green-500" size={18} />;
//       case "Due":
//         return <Clock className="text-yellow-500" size={18} />;
//       case "Expired":
//         return <AlertTriangle className="text-red-500" size={18} />;
//       default:
//         return <CreditCard className="text-gray-500" size={18} />;
//     }
//   };

//   const formatDate = (dateString) => {
//     const options = { year: "numeric", month: "short", day: "numeric" };
//     return new Date(dateString).toLocaleDateString(undefined, options);
//   };

//   const formatCurrency = (amount) => {
//     return new Intl.NumberFormat('en-US', {
//       style: 'currency',
//       currency: 'USD',
//       minimumFractionDigits: 0,
//       maximumFractionDigits: 0
//     }).format(amount);
//   };

//   const exportToCSV = (history) => {
//     const headers = ["Plan,Purchase Date,Duration,Price,Status,Payment Method,Invoice Number"];
//     const rows = history.purchaseHistory.map((purchase) =>
//       [
//         purchase.plan,
//         formatDate(purchase.purchaseDate),
//         purchase.duration,
//         `$${purchase.price}`,
//         purchase.status,
//         purchase.paymentMethod,
//         purchase.invoiceNumber
//       ].join(",")
//     );
//     const csv = [...headers, ...rows].join("\n");
//     const blob = new Blob([csv], { type: "text/csv" });
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.setAttribute("href", url);
//     a.setAttribute("download", `${selectedUser.fullName}_subscription_history.csv`);
//     a.click();
//   };

//   const getFilteredPurchaseHistory = () => {
//     if (filterYear === "All") return selectedUser.history.purchaseHistory;
//     return selectedUser.history.purchaseHistory.filter(
//       (purchase) => new Date(purchase.purchaseDate).getFullYear().toString() === filterYear
//     );
//   };

//   const getChartData = () => {
//     const purchasesByYear = {};
//     selectedUser.history.purchaseHistory.forEach((purchase) => {
//       const year = new Date(purchase.purchaseDate).getFullYear();
//       if (!purchasesByYear[year]) purchasesByYear[year] = 0;
//       purchasesByYear[year] += purchase.price;
//     });
//     return Object.keys(purchasesByYear).map((year) => ({
//       year,
//       revenue: purchasesByYear[year],
//     }));
//   };

//   const getMonthlyChartData = () => {
//     const monthlyData = {};
//     selectedUser.history.purchaseHistory.forEach((purchase) => {
//       const date = new Date(purchase.purchaseDate);
//       const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
//       if (!monthlyData[monthYear]) monthlyData[monthYear] = 0;
//       monthlyData[monthYear] += purchase.price;
//     });
    
//     return Object.keys(monthlyData).map(key => {
//       const [year, month] = key.split('-');
//       return {
//         month: `${new Date(year, month - 1).toLocaleString('default', { month: 'short' })} ${year}`,
//         revenue: monthlyData[key]
//       };
//     });
//   };

//   const getPlanDistributionData = () => {
//     const planCounts = {};
//     selectedUser.history.purchaseHistory.forEach((purchase) => {
//       planCounts[purchase.plan] = (planCounts[purchase.plan] || 0) + 1;
//     });
//     return Object.keys(planCounts).map(plan => ({
//       name: plan,
//       value: planCounts[plan],
//       color: getPlanColor(plan)
//     }));
//   };

//   const getPaymentMethodData = () => {
//     const methodCounts = {};
//     selectedUser.history.purchaseHistory.forEach((purchase) => {
//       methodCounts[purchase.paymentMethod] = (methodCounts[purchase.paymentMethod] || 0) + 1;
//     });
//     return Object.keys(methodCounts).map(method => ({
//       name: method,
//       value: methodCounts[method]
//     }));
//   };

//   const getPlanColor = (plan) => {
//     const colors = {
//       'Enterprise': '#6366F1',
//       'Business': '#3B82F6',
//       'Residential': '#10B981',
//       'Basic': '#F59E0B'
//     };
//     return colors[plan] || '#6B7280';
//   };

//   const getPlanBehavior = () => {
//     const planCounts = {};
//     selectedUser.history.purchaseHistory.forEach((purchase) => {
//       planCounts[purchase.plan] = (planCounts[purchase.plan] || 0) + 1;
//     });
//     const favoritePlan = Object.keys(planCounts).reduce(
//       (a, b) => (planCounts[a] > planCounts[b] ? a : b),
//       selectedUser.history.purchaseHistory[0]?.plan
//     );
//     const upgrades = selectedUser.history.purchaseHistory.filter(
//       (purchase, index) =>
//         index > 0 &&
//         purchase.price >
//         selectedUser.history.purchaseHistory[index - 1].price
//     ).length;
    
//     // Calculate plan changes
//     const planChanges = selectedUser.history.purchaseHistory.length - 1;
    
//     // Calculate average plan duration
//     const durations = selectedUser.history.purchaseHistory.map(purchase => {
//       if (purchase.duration.includes('month')) {
//         return parseInt(purchase.duration);
//       }
//       return 1; // default to 1 month if format is unexpected
//     });
//     const avgDuration = durations.reduce((sum, dur) => sum + dur, 0) / durations.length;
    
//     return { favoritePlan, upgrades, planChanges, avgDuration };
//   };

//   const getSpendingTrend = () => {
//     if (selectedUser.history.purchaseHistory.length < 2) return 'stable';
//     const firstPrice = selectedUser.history.purchaseHistory[0].price;
//     const lastPrice = selectedUser.history.purchaseHistory[selectedUser.history.purchaseHistory.length - 1].price;
//     return lastPrice > firstPrice ? 'up' : lastPrice < firstPrice ? 'down' : 'stable';
//   };

//   const viewPurchaseDetails = (purchase) => {
//     setSelectedPurchase(purchase);
//   };

//   const closePurchaseDetails = () => {
//     setSelectedPurchase(null);
//   };

//   return (
//     <div className="p-4 md:p-8 max-w-7xl mx-auto">
//       <div className="flex items-center justify-between mb-8">
//         <div>
//           <h1 className="text-2xl md:text-3xl font-bold text-gray-800">User Management</h1>
//           <p className="text-gray-500">Manage and view user details and subscriptions</p>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* User List */}
//         <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
//           <div className="p-4 border-b border-gray-100">
//             <h2 className="font-semibold text-gray-700 flex items-center gap-2">
//               <UserIcon className="text-blue-500" size={18} />
//               Active Users ({users.filter((u) => u.active).length}/{users.length})
//             </h2>
//           </div>
//           <div className="divide-y divide-gray-100">
//             {users.map((user) => (
//               <div
//                 key={user.id}
//                 className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
//                   selectedUser.id === user.id ? "bg-blue-50" : ""
//                 }`}
//                 onClick={() => handleView(user)}
//               >
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center gap-3">
//                     <div
//                       className={`w-10 h-10 rounded-full flex items-center justify-center ${
//                         user.active ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"
//                       }`}
//                     >
//                       <User size={20} />
//                     </div>
//                     <div>
//                       <h3 className="font-medium text-gray-800">{user.fullName}</h3>
//                       <p className="text-sm text-gray-500">{user.subscription.plan} Plan</p>
//                     </div>
//                   </div>
//                   <ChevronRight className="text-gray-400" size={18} />
//                 </div>
//                 <div className="mt-3 flex items-center justify-between text-sm">
//                   <span
//                     className={`px-2 py-1 rounded-full text-xs ${
//                       user.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
//                     }`}
//                   >
//                     {user.active ? "Active" : "Inactive"}
//                   </span>
//                   <span className="text-gray-500">{user.phone}</span>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* User Details */}
//         {selectedUser && (
//           <div className="lg:col-span-2 space-y-6">
//             {/* Profile Card */}
//             <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
//               <div className="flex items-start justify-between">
//                 <div className="flex items-center gap-4">
//                   <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
//                     <User className="text-blue-600" size={28} />
//                   </div>
//                   <div>
//                     <h2 className="text-xl font-bold text-gray-800">{selectedUser.fullName}</h2>
//                     <p className="text-gray-500">{selectedUser.email}</p>
//                     <div className="flex items-center gap-2 mt-1">
//                       <span
//                         className={`px-2 py-1 rounded-full text-xs ${
//                           selectedUser.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
//                         }`}
//                       >
//                         {selectedUser.active ? "Active" : "Inactive"}
//                       </span>
//                       <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
//                         {selectedUser.subscription.plan} Plan
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//                 <button className="text-gray-400 hover:text-gray-600">
//                   <MoreVertical size={18} />
//                 </button>
//               </div>

//               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
//                 <div className="bg-gray-50 p-3 rounded-lg">
//                   <div className="flex items-center gap-2 text-gray-500">
//                     <Phone size={16} />
//                     <span className="text-xs">Phone</span>
//                   </div>
//                   <p className="font-medium mt-1">{selectedUser.phone}</p>
//                 </div>
//                 <div className="bg-gray-50 p-3 rounded-lg">
//                   <div className="flex items-center gap-2 text-gray-500">
//                     <HardDrive size={16} />
//                     <span className="text-xs">Device</span>
//                   </div>
//                   <p className="font-medium mt-1">{selectedUser.device}</p>
//                 </div>
//                 <div className="bg-gray-50 p-3 rounded-lg">
//                   <div className="flex items-center gap-2 text-gray-500">
//                     <Shield size={16} />
//                     <span className="text-xs">Location</span>
//                   </div>
//                   <p className="font-medium mt-1">{selectedUser.location}</p>
//                 </div>
//                 <div className="bg-gray-50 p-3 rounded-lg">
//                   <div className="flex items-center gap-2 text-gray-500">
//                     <Clock size={16} />
//                     <span className="text-xs">Last Login</span>
//                   </div>
//                   <p className="font-medium mt-1">{new Date(selectedUser.lastLogin).toLocaleString()}</p>
//                 </div>
//               </div>
//             </div>

//             {/* Current Plan Card */}
//             <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
//               <div
//                 className="p-4 border-b border-gray-100 flex items-center justify-between cursor-pointer"
//                 onClick={() => toggleSection("plan")}
//               >
//                 <h3 className="font-semibold text-gray-700 flex items-center gap-2">
//                   <BarChart2 className="text-blue-500" size={18} />
//                   Current Plan
//                 </h3>
//                 {expandedSection === "plan" ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
//               </div>
//               {expandedSection === "plan" && (
//                 <div className="p-6">
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//                     <div className="space-y-4">
//                       <div className="flex items-center gap-3">
//                         <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
//                           <CreditCard size={18} />
//                         </div>
//                         <div>
//                           <p className="text-xs text-gray-500">Plan Type</p>
//                           <p className="font-medium">{selectedUser.subscription.plan}</p>
//                         </div>
//                       </div>
//                       <div className="flex items-center gap-3">
//                         <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
//                           <PaymentStatusIcon status={selectedUser.paymentStatus} />
//                         </div>
//                         <div>
//                           <p className="text-xs text-gray-500">Payment Status</p>
//                           <p className="font-medium capitalize">{selectedUser.paymentStatus}</p>
//                         </div>
//                       </div>
//                     </div>
//                     <div className="space-y-4">
//                       <div className="flex items-center gap-3">
//                         <div className="p-2 rounded-lg bg-green-100 text-green-600">
//                           <CalendarDays size={18} />
//                         </div>
//                         <div>
//                           <p className="text-xs text-gray-500">Start Date</p>
//                           <p className="font-medium">{formatDate(selectedUser.subscription.startDate)}</p>
//                         </div>
//                       </div>
//                       <div className="flex items-center gap-3">
//                         <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
//                           <CalendarDays size={18} />
//                         </div>
//                         <div>
//                           <p className="text-xs text-gray-500">Expiry Date</p>
//                           <p className="font-medium">{formatDate(selectedUser.subscription.expiryDate)}</p>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="flex items-center justify-between mb-3">
//                     <div className="flex items-center gap-2">
//                       <DataUsageIcon
//                         used={selectedUser.dataUsage.used}
//                         total={selectedUser.dataUsage.total}
//                         isUnlimited={selectedUser.isUnlimited}
//                       />
//                       <span className="font-medium">Data Consumption</span>
//                     </div>
//                     <span className="text-sm font-medium">
//                       {selectedUser.isUnlimited
//                         ? "Unlimited"
//                         : `${selectedUser.dataUsage.used} ${selectedUser.dataUsage.unit} of ${selectedUser.dataUsage.total} ${selectedUser.dataUsage.unit}`}
//                     </span>
//                   </div>
//                   <div className="mb-2">
//                     <DataUsageBar
//                       used={selectedUser.dataUsage.used}
//                       total={selectedUser.dataUsage.total}
//                       isUnlimited={selectedUser.isUnlimited}
//                     />
//                   </div>
//                   <div className="flex items-center justify-between text-xs text-gray-500">
//                     <span>0 {selectedUser.dataUsage.unit}</span>
//                     <span>{selectedUser.isUnlimited ? "∞" : `${selectedUser.dataUsage.total} ${selectedUser.dataUsage.unit}`}</span>
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Subscription History Card */}
//             <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
//               <div
//                 className="p-4 border-b border-gray-100 flex items-center justify-between cursor-pointer"
//                 onClick={() => toggleSection("history")}
//               >
//                 <h3 className="font-semibold text-gray-700 flex items-center gap-2">
//                   <History className="text-blue-500" size={18} />
//                   Subscription History
//                 </h3>
//                 {expandedSection === "history" ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
//               </div>
//               {expandedSection === "history" && (
//                 <div className="p-6">
//                   <div className="space-y-8">
//                     {/* Customer Lifetime Value */}
//                     <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
//                       <h4 className="font-medium text-gray-700 mb-4 flex items-center gap-2">
//                         <CreditCard size={16} />
//                         Customer Lifetime Value
//                       </h4>
//                       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//                         <div className="bg-white p-3 rounded-lg shadow-sm">
//                           <p className="text-xs text-gray-500">Total Revenue</p>
//                           <p className="font-medium text-lg">{formatCurrency(selectedUser.totalRevenue)}</p>
//                         </div>
//                         <div className="bg-white p-3 rounded-lg shadow-sm">
//                           <p className="text-xs text-gray-500">Avg. Monthly Spend</p>
//                           <p className="font-medium text-lg">{formatCurrency(selectedUser.avgMonthlySpend)}</p>
//                         </div>
//                         <div className="bg-white p-3 rounded-lg shadow-sm">
//                           <p className="text-xs text-gray-500">Renewal Frequency</p>
//                           <p className="font-medium text-lg">{selectedUser.renewalFrequency}</p>
//                         </div>
//                         <div className="bg-white p-3 rounded-lg shadow-sm">
//                           <p className="text-xs text-gray-500">Loyalty Duration</p>
//                           <p className="font-medium text-lg">{selectedUser.loyaltyDuration} months</p>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Plan Purchase Trends */}
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                       {/* Annual Revenue Trend */}
//                       <div>
//                         <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
//                           <BarChart2 size={16} />
//                           Annual Revenue Trend
//                         </h4>
//                         <div className="h-64 bg-gray-50 p-3 rounded-lg">
//                           <ResponsiveContainer width="100%" height="100%">
//                             <LineChart data={getChartData()}>
//                               <CartesianGrid strokeDasharray="3 3" vertical={false} />
//                               <XAxis dataKey="year" />
//                               <YAxis />
//                               <Tooltip 
//                                 formatter={(value) => [formatCurrency(value), 'Revenue']}
//                               />
//                               <Line 
//                                 type="monotone" 
//                                 dataKey="revenue" 
//                                 stroke="#3B82F6" 
//                                 strokeWidth={2} 
//                                 dot={{ r: 4 }}
//                                 activeDot={{ r: 6 }}
//                               />
//                             </LineChart>
//                           </ResponsiveContainer>
//                         </div>
//                       </div>
                      
//                       {/* Monthly Revenue Breakdown */}
//                       <div>
//                         <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
//                           <BarChart2 size={16} />
//                           Monthly Revenue Breakdown
//                         </h4>
//                         <div className="h-64 bg-gray-50 p-3 rounded-lg">
//                           <ResponsiveContainer width="100%" height="100%">
//                             <BarChart data={getMonthlyChartData()}>
//                               <CartesianGrid strokeDasharray="3 3" vertical={false} />
//                               <XAxis dataKey="month" />
//                               <YAxis />
//                               <Tooltip 
//                                 formatter={(value) => [formatCurrency(value), 'Revenue']}
//                               />
//                               <Bar 
//                                 dataKey="revenue" 
//                                 fill="#8884d8" 
//                                 radius={[4, 4, 0, 0]}
//                               />
//                             </BarChart>
//                           </ResponsiveContainer>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Plan Distribution */}
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                       <div>
//                         <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
//                           <Package size={16} />
//                           Plan Distribution
//                         </h4>
//                         <div className="h-64 bg-gray-50 p-3 rounded-lg">
//                           <ResponsiveContainer width="100%" height="100%">
//                             <PieChart>
//                               <Pie
//                                 data={getPlanDistributionData()}
//                                 cx="50%"
//                                 cy="50%"
//                                 labelLine={false}
//                                 outerRadius={80}
//                                 fill="#8884d8"
//                                 dataKey="value"
//                                 label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
//                               >
//                                 {getPlanDistributionData().map((entry, index) => (
//                                   <Cell key={`cell-${index}`} fill={entry.color} />
//                                 ))}
//                               </Pie>
//                               <Tooltip 
//                                 formatter={(value, name, props) => [
//                                   `${value} purchases`,
//                                   name
//                                 ]}
//                               />
//                             </PieChart>
//                           </ResponsiveContainer>
//                         </div>
//                       </div>
                      
//                       {/* Payment Method Distribution */}
//                       <div>
//                         <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
//                           <CreditCard size={16} />
//                           Payment Methods
//                         </h4>
//                         <div className="h-64 bg-gray-50 p-3 rounded-lg">
//                           <ResponsiveContainer width="100%" height="100%">
//                             <PieChart>
//                               <Pie
//                                 data={getPaymentMethodData()}
//                                 cx="50%"
//                                 cy="50%"
//                                 labelLine={false}
//                                 outerRadius={80}
//                                 fill="#8884d8"
//                                 dataKey="value"
//                                 label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
//                               >
//                                 {getPaymentMethodData().map((entry, index) => (
//                                   <Cell 
//                                     key={`cell-${index}`} 
//                                     fill={['#6366F1', '#3B82F6', '#10B981', '#F59E0B'][index % 4]} 
//                                   />
//                                 ))}
//                               </Pie>
//                               <Tooltip 
//                                 formatter={(value, name, props) => [
//                                   `${value} purchases`,
//                                   name
//                                 ]}
//                               />
//                             </PieChart>
//                           </ResponsiveContainer>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Plan Behavior Insights */}
//                     <div>
//                       <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
//                         <TrendingUp size={16} />
//                         Plan Behavior Insights
//                       </h4>
//                       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//                         <div className="bg-gray-50 p-3 rounded-lg">
//                           <p className="text-xs text-gray-500">Favorite Plan</p>
//                           <p className="font-medium">{getPlanBehavior().favoritePlan}</p>
//                         </div>
//                         <div className="bg-gray-50 p-3 rounded-lg">
//                           <p className="text-xs text-gray-500">Number of Upgrades</p>
//                           <p className="font-medium">{getPlanBehavior().upgrades}</p>
//                         </div>
//                         <div className="bg-gray-50 p-3 rounded-lg">
//                           <p className="text-xs text-gray-500">Plan Changes</p>
//                           <p className="font-medium">{getPlanBehavior().planChanges}</p>
//                         </div>
//                         <div className="bg-gray-50 p-3 rounded-lg">
//                           <p className="text-xs text-gray-500">Avg. Plan Duration</p>
//                           <p className="font-medium">{getPlanBehavior().avgDuration.toFixed(1)} months</p>
//                         </div>
//                       </div>
//                       <div className="mt-4 bg-gray-50 p-3 rounded-lg">
//                         <div className="flex items-center gap-2">
//                           <p className="text-xs text-gray-500">Spending Trend:</p>
//                           {getSpendingTrend() === 'up' ? (
//                             <div className="flex items-center text-green-500">
//                               <TrendingUp size={16} />
//                               <span className="ml-1">Increasing</span>
//                             </div>
//                           ) : getSpendingTrend() === 'down' ? (
//                             <div className="flex items-center text-red-500">
//                               <TrendingDown size={16} />
//                               <span className="ml-1">Decreasing</span>
//                             </div>
//                           ) : (
//                             <div className="flex items-center text-gray-500">
//                               <Circle size={16} />
//                               <span className="ml-1">Stable</span>
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     </div>

//                     {/* Purchase History */}
//                     <div>
//                       <div className="flex items-center justify-between mb-3">
//                         <h4 className="font-medium text-gray-700 flex items-center gap-2">
//                           <History size={16} />
//                           Detailed Purchase History
//                         </h4>
//                         <div className="flex items-center gap-2">
//                           <select
//                             className="border border-gray-200 rounded-lg px-2 py-1 text-sm"
//                             value={filterYear}
//                             onChange={(e) => setFilterYear(e.target.value)}
//                           >
//                             <option value="All">All Years</option>
//                             {[
//                               ...new Set(
//                                 selectedUser.history.purchaseHistory.map((p) =>
//                                   new Date(p.purchaseDate).getFullYear()
//                                 )
//                               ),
//                             ].sort((a, b) => b - a).map((year) => (
//                               <option key={year} value={year}>
//                                 {year}
//                               </option>
//                             ))}
//                           </select>
//                           <button
//                             className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
//                             onClick={() => exportToCSV(selectedUser.history)}
//                           >
//                             <Download size={14} />
//                             Export
//                           </button>
//                         </div>
//                       </div>
//                       <div className="overflow-x-auto">
//                         <table className="w-full text-sm">
//                           <thead>
//                             <tr className="bg-gray-100">
//                               <th className="p-2 text-left">Plan</th>
//                               <th className="p-2 text-left">Purchase Date</th>
//                               <th className="p-2 text-left">Duration</th>
//                               <th className="p-2 text-left">Price</th>
//                               <th className="p-2 text-left">Status</th>
//                               <th className="p-2 text-left">Details</th>
//                             </tr>
//                           </thead>
//                           <tbody>
//                             {getFilteredPurchaseHistory().map((purchase, index) => (
//                               <tr 
//                                 key={index} 
//                                 className="border-b hover:bg-gray-50 cursor-pointer"
//                                 onClick={() => viewPurchaseDetails(purchase)}
//                               >
//                                 <td className="p-2">
//                                   <div className="flex items-center gap-2">
//                                     <div 
//                                       className="w-2 h-2 rounded-full" 
//                                       style={{ backgroundColor: getPlanColor(purchase.plan) }}
//                                     ></div>
//                                     {purchase.plan}
//                                   </div>
//                                 </td>
//                                 <td className="p-2">{formatDate(purchase.purchaseDate)}</td>
//                                 <td className="p-2">{purchase.duration}</td>
//                                 <td className="p-2 font-medium">${purchase.price}</td>
//                                 <td className="p-2">
//                                   <span
//                                     className={`px-2 py-1 rounded-full text-xs ${
//                                       purchase.status === "Active"
//                                         ? "bg-green-100 text-green-700"
//                                         : "bg-red-100 text-red-700"
//                                     }`}
//                                   >
//                                     {purchase.status}
//                                   </span>
//                                 </td>
//                                 <td className="p-2">
//                                   <button className="text-blue-500 hover:text-blue-700">
//                                     <ArrowUpRight size={16} />
//                                   </button>
//                                 </td>
//                               </tr>
//                             ))}
//                           </tbody>
//                         </table>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Purchase Details Modal */}
//       {selectedPurchase && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//           <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
//             <div className="p-6">
//               <div className="flex items-center justify-between mb-4">
//                 <h3 className="text-lg font-bold text-gray-800">Purchase Details</h3>
//                 <button 
//                   onClick={closePurchaseDetails}
//                   className="text-gray-400 hover:text-gray-600"
//                 >
//                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                   </svg>
//                 </button>
//               </div>
              
//               <div className="space-y-4">
//                 <div>
//                   <p className="text-sm text-gray-500">Plan</p>
//                   <p className="font-medium">{selectedPurchase.plan}</p>
//                 </div>
                
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <p className="text-sm text-gray-500">Purchase Date</p>
//                     <p className="font-medium">{formatDate(selectedPurchase.purchaseDate)}</p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-500">Duration</p>
//                     <p className="font-medium">{selectedPurchase.duration}</p>
//                   </div>
//                 </div>
                
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <p className="text-sm text-gray-500">Price</p>
//                     <p className="font-medium">${selectedPurchase.price}</p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-500">Status</p>
//                     <p className="font-medium">
//                       <span
//                         className={`px-2 py-1 rounded-full text-xs ${
//                           selectedPurchase.status === "Active"
//                             ? "bg-green-100 text-green-700"
//                             : "bg-red-100 text-red-700"
//                         }`}
//                       >
//                         {selectedPurchase.status}
//                       </span>
//                     </p>
//                   </div>
//                 </div>
                
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <p className="text-sm text-gray-500">Payment Method</p>
//                     <p className="font-medium">{selectedPurchase.paymentMethod}</p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-500">Invoice Number</p>
//                     <p className="font-medium">{selectedPurchase.invoiceNumber}</p>
//                   </div>
//                 </div>
                
//                 {selectedPurchase.status === "Expired" && (
//                   <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
//                     <div className="flex items-center gap-2 text-yellow-700">
//                       <AlertTriangle size={16} />
//                       <p className="text-sm">This plan expired on {formatDate(selectedUser.subscription.expiryDate)}</p>
//                     </div>
//                   </div>
//                 )}
//               </div>
              
//               <div className="mt-6 flex justify-end">
//                 <button
//                   onClick={closePurchaseDetails}
//                   className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
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

// export default UserProfilePage;









// import React, { useState, useEffect } from "react";
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
// } from "lucide-react";
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
// import api from "../../../api"
// import { useAuth } from "../../context/AuthContext"
// import { FaSpinner } from "react-icons/fa";

// const UserProfilePage = () => {
//   const { isAuthenticated, authLoading } = useAuth();
//   const today = new Date();
//   const [users, setUsers] = useState([]);
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [expandedSection, setExpandedSection] = useState(null);
//   const [filterYear, setFilterYear] = useState("All");
//   const [selectedPurchase, setSelectedPurchase] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [isEditing, setIsEditing] = useState(false);
//   const [editForm, setEditForm] = useState({ fullName: "", phone: "" });

//   // Fetch users on mount
//   useEffect(() => {
//     const fetchUsers = async () => {
//       if (!isAuthenticated) {
//         setError("Please log in to view user profiles.");
//         setIsLoading(false);
//         return;
//       }

//       try {
//         setIsLoading(true);
//         const response = await api.get("/api/user_management/profiles/");
//         const enrichedUsers = response.data.results.map(enrichUser);
//         setUsers(enrichedUsers);
//         setSelectedUser(enrichedUsers[0] || null);
//         setError(null);
//       } catch (err) {
//         setError(err.response?.data?.error || "Failed to load users.");
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     if (!authLoading && isAuthenticated) {
//       fetchUsers();
//     }
//   }, [isAuthenticated, authLoading]);

//   // Enrich user data
//   const enrichUser = (user) => {
//     const expiry = new Date(user.subscription?.expiryDate);
//     const paymentStatus =
//       today < expiry
//         ? "Paid"
//         : today.toDateString() === expiry.toDateString()
//         ? "Due"
//         : "Expired";

//     const isUnlimited = user.data_usage.total === "unlimited";
//     const active = isUnlimited || user.data_usage.used < parseFloat(user.data_usage.total || 0);

//     const totalRevenue = user.history.purchaseHistory.reduce(
//       (sum, purchase) => sum + purchase.amount,
//       0
//     );

//     const renewalFrequency =
//       user.history.purchaseHistory.length > 1
//         ? `${user.history.purchaseHistory.length} renewals`
//         : "No renewals";

//     const firstPurchase = new Date(
//       user.history.purchaseHistory[user.history.purchaseHistory.length - 1]?.purchase_date
//     );
//     const monthsActive =
//       (today.getFullYear() - firstPurchase.getFullYear()) * 12 +
//       (today.getMonth() - firstPurchase.getMonth()) + 1;
//     const avgMonthlySpend = totalRevenue / Math.max(monthsActive, 1);

//     const loyaltyDuration = Math.floor(
//       (today - firstPurchase) / (1000 * 60 * 60 * 24 * 30)
//     );

//     return {
//       ...user,
//       paymentStatus,
//       active,
//       isUnlimited,
//       totalRevenue,
//       renewalFrequency,
//       avgMonthlySpend,
//       loyaltyDuration,
//     };
//   };

//   const handleView = async (user) => {
//     try {
//       const response = await api.get(`/api/user_management/profiles/${user.id}/`);
//       const enrichedUser = enrichUser(response.data);
//       setSelectedUser(enrichedUser);
//       setExpandedSection(null);
//       setFilterYear("All");
//       setSelectedPurchase(null);
//       setError(null);
//     } catch (err) {
//       setError(err.response?.data?.error || "Failed to load user profile.");
//     }
//   };

//   const handleEditToggle = () => {
//     if (!isEditing) {
//       setEditForm({
//         fullName: selectedUser.full_name,
//         phone: selectedUser.phonenumber,
//       });
//     }
//     setIsEditing(!isEditing);
//   };

//   const handleEditChange = (e) => {
//     const { name, value } = e.target;
//     setEditForm((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleEditSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await api.patch(`/api/user_management/profiles/${selectedUser.id}/`, {
//         full_name: editForm.fullName,
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
//       setError(err.response?.data?.error || "Failed to update user profile.");
//     }
//   };

//   const toggleSection = (section) => {
//     setExpandedSection(expandedSection === section ? null : section);
//     setSelectedPurchase(null);
//   };

//   const DataUsageBar = ({ used, total, isUnlimited }) => {
//     if (isUnlimited) {
//       return (
//         <div className="w-full bg-gradient-to-r from-purple-100 to-blue-100 rounded-full h-3 relative overflow-hidden">
//           <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-blue-500 to-teal-400 opacity-70 animate-pulse rounded-full"></div>
//         </div>
//       );
//     }

//     const percentage = Math.min((used / parseFloat(total || 1)) * 100, 100);
//     let colorClass = "bg-green-500";
//     if (percentage > 80) colorClass = "bg-yellow-500";
//     if (percentage > 95) colorClass = "bg-red-500";

//     return (
//       <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
//         <div
//           className={`${colorClass} h-3 rounded-full transition-all duration-500`}
//           style={{ width: `${percentage}%` }}
//         ></div>
//       </div>
//     );
//   };

//   const DataUsageIcon = ({ used, total, isUnlimited }) => {
//     if (isUnlimited) return <Zap className="text-purple-500" size={18} />;
//     const percentage = used / parseFloat(total || 1);
//     if (percentage < 0.3) return <BatteryFull className="text-green-500" size={18} />;
//     if (percentage < 0.7) return <BatteryMedium className="text-yellow-500" size={18} />;
//     return <BatteryLow className="text-red-500" size={18} />;
//   };

//   const PaymentStatusIcon = ({ status }) => {
//     switch (status) {
//       case "Paid":
//         return <BadgeCheck className="text-green-500" size={18} />;
//       case "Due":
//         return <Clock className="text-yellow-500" size={18} />;
//       case "Expired":
//         return <AlertTriangle className="text-red-500" size={18} />;
//       default:
//         return <CreditCard className="text-gray-500" size={18} />;
//     }
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return "N/A";
//     const options = { year: "numeric", month: "short", day: "numeric" };
//     return new Date(dateString).toLocaleDateString(undefined, options);
//   };

//   const formatCurrency = (amount) => {
//     return new Intl.NumberFormat("en-US", {
//       style: "currency",
//       currency: "USD",
//       minimumFractionDigits: 0,
//       maximumFractionDigits: 0,
//     }).format(amount);
//   };

//   const exportToCSV = (history) => {
//     const headers = ["Plan,Purchase Date,Duration,Price,Status,Payment Method,Invoice Number"];
//     const rows = history.purchaseHistory.map((purchase) =>
//       [
//         purchase.plan?.name || "N/A",
//         formatDate(purchase.purchase_date),
//         purchase.duration || "N/A",
//         `$${purchase.amount}`,
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
//     a.setAttribute("download", `${selectedUser.full_name}_subscription_history.csv`);
//     a.click();
//   };

//   const getFilteredPurchaseHistory = () => {
//     if (!selectedUser?.history?.purchaseHistory) return [];
//     if (filterYear === "All") return selectedUser.history.purchaseHistory;
//     return selectedUser.history.purchaseHistory.filter(
//       (purchase) => new Date(purchase.purchase_date).getFullYear().toString() === filterYear
//     );
//   };

//   const getChartData = () => {
//     if (!selectedUser?.history?.purchaseHistory) return [];
//     const purchasesByYear = {};
//     selectedUser.history.purchaseHistory.forEach((purchase) => {
//       const year = new Date(purchase.purchase_date).getFullYear();
//       if (!purchasesByYear[year]) purchasesByYear[year] = 0;
//       purchasesByYear[year] += purchase.amount;
//     });
//     return Object.keys(purchasesByYear).map((year) => ({
//       year,
//       revenue: purchasesByYear[year],
//     }));
//   };

//   const getMonthlyChartData = () => {
//     if (!selectedUser?.history?.purchaseHistory) return [];
//     const monthlyData = {};
//     selectedUser.history.purchaseHistory.forEach((purchase) => {
//       const date = new Date(purchase.purchase_date);
//       const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
//       if (!monthlyData[monthYear]) monthlyData[monthYear] = 0;
//       monthlyData[monthYear] += purchase.amount;
//     });

//     return Object.keys(monthlyData).map((key) => {
//       const [year, month] = key.split("-");
//       return {
//         month: `${new Date(year, month - 1).toLocaleString("default", { month: "short" })} ${year}`,
//         revenue: monthlyData[key],
//       };
//     });
//   };

//   const getPlanDistributionData = () => {
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
//   };

//   const getPaymentMethodData = () => {
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
//   };

//   const getPlanColor = (plan) => {
//     const colors = {
//       Enterprise: "#6366F1",
//       Business: "#3B82F6",
//       Residential: "#10B981",
//       Basic: "#F59E0B",
//       Unknown: "#6B7280",
//     };
//     return colors[plan] || "#6B7280";
//   };

//   const getPlanBehavior = () => {
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
//   };

//   const getSpendingTrend = () => {
//     if (!selectedUser?.history?.purchaseHistory || selectedUser.history.purchaseHistory.length < 2) return "stable";
//     const firstPrice = selectedUser.history.purchaseHistory[0].amount;
//     const lastPrice = selectedUser.history.purchaseHistory[selectedUser.history.purchaseHistory.length - 1].amount;
//     return lastPrice > firstPrice ? "up" : lastPrice < firstPrice ? "down" : "stable";
//   };

//   const viewPurchaseDetails = (purchase) => {
//     setSelectedPurchase(purchase);
//   };

//   const closePurchaseDetails = () => {
//     setSelectedPurchase(null);
//   };

//   if (authLoading || isLoading) {
//     return (
//       <div className="p-8 max-w-7xl mx-auto flex justify-center items-center min-h-screen">
//         <FaSpinner className="animate-spin text-4xl text-blue-600" />
//       </div>
//     );
//   }

//   if (!isAuthenticated) {
//     return (
//       <div className="p-8 max-w-7xl mx-auto">
//         <p className="text-center text-red-500">Please log in to access user profiles.</p>
//       </div>
//     );
//   }

//   return (
//     <div className="p-4 md:p-8 max-w-7xl mx-auto">
//       {error && (
//         <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>
//       )}
//       <div className="flex items-center justify-between mb-8">
//         <div>
//           <h1 className="text-2xl md:text-3xl font-bold text-gray-800">User Management</h1>
//           <p className="text-gray-500">Manage and view user details and subscriptions</p>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* User List */}
//         <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
//           <div className="p-4 border-b border-gray-100">
//             <h2 className="font-semibold text-gray-700 flex items-center gap-2">
//               <UserIcon className="text-blue-500" size={18} />
//               Active Users ({users.filter((u) => u.active).length}/{users.length})
//             </h2>
//           </div>
//           <div className="divide-y divide-gray-100">
//             {users.map((user) => (
//               <div
//                 key={user.id}
//                 className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
//                   selectedUser?.id === user.id ? "bg-blue-50" : ""
//                 }`}
//                 onClick={() => handleView(user)}
//               >
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center gap-3">
//                     <div
//                       className={`w-10 h-10 rounded-full flex items-center justify-center ${
//                         user.active ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"
//                       }`}
//                     >
//                       <User size={20} />
//                     </div>
//                     <div>
//                       <h3 className="font-medium text-gray-800">{user.full_name}</h3>
//                       <p className="text-sm text-gray-500">{user.subscription?.plan || "No Plan"} Plan</p>
//                     </div>
//                   </div>
//                   <ChevronRight className="text-gray-400" size={18} />
//                 </div>
//                 <div className="mt-3 flex items-center justify-between text-sm">
//                   <span
//                     className={`px-2 py-1 rounded-full text-xs ${
//                       user.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
//                     }`}
//                   >
//                     {user.active ? "Active" : "Inactive"}
//                   </span>
//                   <span className="text-gray-500">{user.phonenumber}</span>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* User Details */}
//         {selectedUser && (
//           <div className="lg:col-span-2 space-y-6">
//             {/* Profile Card */}
//             <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
//               <div className="flex items-start justify-between">
//                 <div className="flex items-center gap-4">
//                   <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
//                     <User className="text-blue-600" size={28} />
//                   </div>
//                   <div>
//                     <h2 className="text-xl font-bold text-gray-800">{selectedUser.full_name}</h2>
//                     <div className="flex items-center gap-2 mt-1">
//                       <span
//                         className={`px-2 py-1 rounded-full text-xs ${
//                           selectedUser.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
//                         }`}
//                       >
//                         {selectedUser.active ? "Active" : "Inactive"}
//                       </span>
//                       <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
//                         {selectedUser.subscription?.plan || "No Plan"} Plan
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//                 <button
//                   className="text-gray-400 hover:text-gray-600"
//                   onClick={handleEditToggle}
//                 >
//                   <MoreVertical size={18} />
//                 </button>
//               </div>

//               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
//                 <div className="bg-gray-50 p-3 rounded-lg">
//                   <div className="flex items-center gap-2 text-gray-500">
//                     <Phone size={16} />
//                     <span className="text-xs">Phone</span>
//                   </div>
//                   <p className="font-medium mt-1">{selectedUser.phonenumber}</p>
//                 </div>
//                 <div className="bg-gray-50 p-3 rounded-lg">
//                   <div className="flex items-center gap-2 text-gray-500">
//                     <HardDrive size={16} />
//                     <span className="text-xs">Device</span>
//                   </div>
//                   <p className="font-medium mt-1">{selectedUser.device}</p>
//                 </div>
//                 <div className="bg-gray-50 p-3 rounded-lg">
//                   <div className="flex items-center gap-2 text-gray-500">
//                     <Shield size={16} />
//                     <span className="text-xs">Location</span>
//                   </div>
//                   <p className="font-medium mt-1">{selectedUser.location}</p>
//                 </div>
//                 <div className="bg-gray-50 p-3 rounded-lg">
//                   <div className="flex items-center gap-2 text-gray-500">
//                     <Clock size={16} />
//                     <span className="text-xs">Last Login</span>
//                   </div>
//                   <p className="font-medium mt-1">
//                     {selectedUser.last_login ? new Date(selectedUser.last_login).toLocaleString() : "N/A"}
//                   </p>
//                 </div>
//               </div>
//             </div>

//             {/* Current Plan Card */}
//             <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
//               <div
//                 className="p-4 border-b border-gray-100 flex items-center justify-between cursor-pointer"
//                 onClick={() => toggleSection("plan")}
//               >
//                 <h3 className="font-semibold text-gray-700 flex items-center gap-2">
//                   <BarChart2 className="text-blue-500" size={18} />
//                   Current Plan
//                 </h3>
//                 {expandedSection === "plan" ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
//               </div>
//               {expandedSection === "plan" && selectedUser.subscription && (
//                 <div className="p-6">
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//                     <div className="space-y-4">
//                       <div className="flex items-center gap-3">
//                         <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
//                           <CreditCard size={18} />
//                         </div>
//                         <div>
//                           <p className="text-xs text-gray-500">Plan Type</p>
//                           <p className="font-medium">{selectedUser.subscription.plan}</p>
//                         </div>
//                       </div>
//                       <div className="flex items-center gap-3">
//                         <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
//                           <PaymentStatusIcon status={selectedUser.paymentStatus} />
//                         </div>
//                         <div>
//                           <p className="text-xs text-gray-500">Payment Status</p>
//                           <p className="font-medium capitalize">{selectedUser.paymentStatus}</p>
//                         </div>
//                       </div>
//                     </div>
//                     <div className="space-y-4">
//                       <div className="flex items-center gap-3">
//                         <div className="p-2 rounded-lg bg-green-100 text-green-600">
//                           <CalendarDays size={18} />
//                         </div>
//                         <div>
//                           <p className="text-xs text-gray-500">Start Date</p>
//                           <p className="font-medium">{formatDate(selectedUser.subscription.startDate)}</p>
//                         </div>
//                       </div>
//                       <div className="flex items-center gap-3">
//                         <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
//                           <CalendarDays size={18} />
//                         </div>
//                         <div>
//                           <p className="text-xs text-gray-500">Expiry Date</p>
//                           <p className="font-medium">{formatDate(selectedUser.subscription.expiryDate)}</p>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="flex items-center justify-between mb-3">
//                     <div className="flex items-center gap-2">
//                       <DataUsageIcon
//                         used={selectedUser.data_usage.used}
//                         total={selectedUser.data_usage.total}
//                         isUnlimited={selectedUser.isUnlimited}
//                       />
//                       <span className="font-medium">Data Consumption</span>
//                     </div>
//                     <span className="text-sm font-medium">
//                       {selectedUser.isUnlimited
//                         ? "Unlimited"
//                         : `${selectedUser.data_usage.used} ${selectedUser.data_usage.unit} of ${selectedUser.data_usage.total} ${selectedUser.data_usage.unit}`}
//                     </span>
//                   </div>
//                   <div className="mb-2">
//                     <DataUsageBar
//                       used={selectedUser.data_usage.used}
//                       total={selectedUser.data_usage.total}
//                       isUnlimited={selectedUser.isUnlimited}
//                     />
//                   </div>
//                   <div className="flex items-center justify-between text-xs text-gray-500">
//                     <span>0 {selectedUser.data_usage.unit}</span>
//                     <span>{selectedUser.isUnlimited ? "∞" : `${selectedUser.data_usage.total} ${selectedUser.data_usage.unit}`}</span>
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Subscription History Card */}
//             <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
//               <div
//                 className="p-4 border-b border-gray-100 flex items-center justify-between cursor-pointer"
//                 onClick={() => toggleSection("history")}
//               >
//                 <h3 className="font-semibold text-gray-700 flex items-center gap-2">
//                   <History className="text-blue-500" size={18} />
//                   Subscription History
//                 </h3>
//                 {expandedSection === "history" ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
//               </div>
//               {expandedSection === "history" && (
//                 <div className="p-6">
//                   <div className="space-y-8">
//                     {/* Customer Lifetime Value */}
//                     <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
//                       <h4 className="font-medium text-gray-700 mb-4 flex items-center gap-2">
//                         <CreditCard size={16} />
//                         Customer Lifetime Value
//                       </h4>
//                       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//                         <div className="bg-white p-3 rounded-lg shadow-sm">
//                           <p className="text-xs text-gray-500">Total Revenue</p>
//                           <p className="font-medium text-lg">{formatCurrency(selectedUser.totalRevenue)}</p>
//                         </div>
//                         <div className="bg-white p-3 rounded-lg shadow-sm">
//                           <p className="text-xs text-gray-500">Avg. Monthly Spend</p>
//                           <p className="font-medium text-lg">{formatCurrency(selectedUser.avgMonthlySpend)}</p>
//                         </div>
//                         <div className="bg-white p-3 rounded-lg shadow-sm">
//                           <p className="text-xs text-gray-500">Renewal Frequency</p>
//                           <p className="font-medium text-lg">{selectedUser.renewalFrequency}</p>
//                         </div>
//                         <div className="bg-white p-3 rounded-lg shadow-sm">
//                           <p className="text-xs text-gray-500">Loyalty Duration</p>
//                           <p className="font-medium text-lg">{selectedUser.loyaltyDuration} months</p>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Plan Purchase Trends */}
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                       <div>
//                         <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
//                           <BarChart2 size={16} />
//                           Annual Revenue Trend
//                         </h4>
//                         <div className="h-64 bg-gray-50 p-3 rounded-lg">
//                           <ResponsiveContainer width="100%" height="100%">
//                             <LineChart data={getChartData()}>
//                               <CartesianGrid strokeDasharray="3 3" vertical={false} />
//                               <XAxis dataKey="year" />
//                               <YAxis />
//                               <Tooltip formatter={(value) => [formatCurrency(value), "Revenue"]} />
//                               <Line
//                                 type="monotone"
//                                 dataKey="revenue"
//                                 stroke="#3B82F6"
//                                 strokeWidth={2}
//                                 dot={{ r: 4 }}
//                                 activeDot={{ r: 6 }}
//                               />
//                             </LineChart>
//                           </ResponsiveContainer>
//                         </div>
//                       </div>
//                       <div>
//                         <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
//                           <BarChart2 size={16} />
//                           Monthly Revenue Breakdown
//                         </h4>
//                         <div className="h-64 bg-gray-50 p-3 rounded-lg">
//                           <ResponsiveContainer width="100%" height="100%">
//                             <BarChart data={getMonthlyChartData()}>
//                               <CartesianGrid strokeDasharray="3 3" vertical={false} />
//                               <XAxis dataKey="month" />
//                               <YAxis />
//                               <Tooltip formatter={(value) => [formatCurrency(value), "Revenue"]} />
//                               <Bar dataKey="revenue" fill="#8884d8" radius={[4, 4, 0, 0]} />
//                             </BarChart>
//                           </ResponsiveContainer>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Plan Distribution */}
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                       <div>
//                         <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
//                           <Package size={16} />
//                           Plan Distribution
//                         </h4>
//                         <div className="h-64 bg-gray-50 p-3 rounded-lg">
//                           <ResponsiveContainer width="100%" height="100%">
//                             <PieChart>
//                               <Pie
//                                 data={getPlanDistributionData()}
//                                 cx="50%"
//                                 cy="50%"
//                                 labelLine={false}
//                                 outerRadius={80}
//                                 fill="#8884d8"
//                                 dataKey="value"
//                                 label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
//                               >
//                                 {getPlanDistributionData().map((entry, index) => (
//                                   <Cell key={`cell-${index}`} fill={entry.color} />
//                                 ))}
//                               </Pie>
//                               <Tooltip formatter={(value, name) => [`${value} purchases`, name]} />
//                             </PieChart>
//                           </ResponsiveContainer>
//                         </div>
//                       </div>
//                       <div>
//                         <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
//                           <CreditCard size={16} />
//                           Payment Methods
//                         </h4>
//                         <div className="h-64 bg-gray-50 p-3 rounded-lg">
//                           <ResponsiveContainer width="100%" height="100%">
//                             <PieChart>
//                               <Pie
//                                 data={getPaymentMethodData()}
//                                 cx="50%"
//                                 cy="50%"
//                                 labelLine={false}
//                                 outerRadius={80}
//                                 fill="#8884d8"
//                                 dataKey="value"
//                                 label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
//                               >
//                                 {getPaymentMethodData().map((entry, index) => (
//                                   <Cell
//                                     key={`cell-${index}`}
//                                     fill={["#6366F1", "#3B82F6", "#10B981", "#F59E0B"][index % 4]}
//                                   />
//                                 ))}
//                               </Pie>
//                               <Tooltip formatter={(value, name) => [`${value} purchases`, name]} />
//                             </PieChart>
//                           </ResponsiveContainer>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Plan Behavior Insights */}
//                     <div>
//                       <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
//                         <TrendingUp size={16} />
//                         Plan Behavior Insights
//                       </h4>
//                       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//                         <div className="bg-gray-50 p-3 rounded-lg">
//                           <p className="text-xs text-gray-500">Favorite Plan</p>
//                           <p className="font-medium">{getPlanBehavior().favoritePlan}</p>
//                         </div>
//                         <div className="bg-gray-50 p-3 rounded-lg">
//                           <p className="text-xs text-gray-500">Number of Upgrades</p>
//                           <p className="font-medium">{getPlanBehavior().upgrades}</p>
//                         </div>
//                         <div className="bg-gray-50 p-3 rounded-lg">
//                           <p className="text-xs text-gray-500">Plan Changes</p>
//                           <p className="font-medium">{getPlanBehavior().planChanges}</p>
//                         </div>
//                         <div className="bg-gray-50 p-3 rounded-lg">
//                           <p className="text-xs text-gray-500">Avg. Plan Duration</p>
//                           <p className="font-medium">{getPlanBehavior().avgDuration.toFixed(1)} months</p>
//                         </div>
//                       </div>
//                       <div className="mt-4 bg-gray-50 p-3 rounded-lg">
//                         <div className="flex items-center gap-2">
//                           <p className="text-xs text-gray-500">Spending Trend:</p>
//                           {getSpendingTrend() === "up" ? (
//                             <div className="flex items-center text-green-500">
//                               <TrendingUp size={16} />
//                               <span className="ml-1">Increasing</span>
//                             </div>
//                           ) : getSpendingTrend() === "down" ? (
//                             <div className="flex items-center text-red-500">
//                               <TrendingDown size={16} />
//                               <span className="ml-1">Decreasing</span>
//                             </div>
//                           ) : (
//                             <div className="flex items-center text-gray-500">
//                               <Circle size={16} />
//                               <span className="ml-1">Stable</span>
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     </div>

//                     {/* Purchase History */}
//                     <div>
//                       <div className="flex items-center justify-between mb-3">
//                         <h4 className="font-medium text-gray-700 flex items-center gap-2">
//                           <History size={16} />
//                           Detailed Purchase History
//                         </h4>
//                         <div className="flex items-center gap-2">
//                           <select
//                             className="border border-gray-200 rounded-lg px-2 py-1 text-sm"
//                             value={filterYear}
//                             onChange={(e) => setFilterYear(e.target.value)}
//                           >
//                             <option value="All">All Years</option>
//                             {[
//                               ...new Set(
//                                 selectedUser.history.purchaseHistory.map((p) =>
//                                   new Date(p.purchase_date).getFullYear()
//                                 )
//                               ),
//                             ]
//                               .sort((a, b) => b - a)
//                               .map((year) => (
//                                 <option key={year} value={year}>
//                                   {year}
//                                 </option>
//                               ))}
//                           </select>
//                           <button
//                             className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
//                             onClick={() => exportToCSV(selectedUser.history)}
//                           >
//                             <Download size={14} />
//                             Export
//                           </button>
//                         </div>
//                       </div>
//                       <div className="overflow-x-auto">
//                         <table className="w-full text-sm">
//                           <thead>
//                             <tr className="bg-gray-100">
//                               <th className="p-2 text-left">Plan</th>
//                               <th className="p-2 text-left">Purchase Date</th>
//                               <th className="p-2 text-left">Duration</th>
//                               <th className="p-2 text-left">Price</th>
//                               <th className="p-2 text-left">Status</th>
//                               <th className="p-2 text-left">Details</th>
//                             </tr>
//                           </thead>
//                           <tbody>
//                             {getFilteredPurchaseHistory().map((purchase, index) => (
//                               <tr
//                                 key={index}
//                                 className="border-b hover:bg-gray-50 cursor-pointer"
//                                 onClick={() => viewPurchaseDetails(purchase)}
//                               >
//                                 <td className="p-2">
//                                   <div className="flex items-center gap-2">
//                                     <div
//                                       className="w-2 h-2 rounded-full"
//                                       style={{ backgroundColor: getPlanColor(purchase.plan?.name) }}
//                                     ></div>
//                                     {purchase.plan?.name || "N/A"}
//                                   </div>
//                                 </td>
//                                 <td className="p-2">{formatDate(purchase.purchase_date)}</td>
//                                 <td className="p-2">{purchase.duration || "N/A"}</td>
//                                 <td className="p-2 font-medium">${purchase.amount}</td>
//                                 <td className="p-2">
//                                   <span
//                                     className={`px-2 py-1 rounded-full text-xs ${
//                                       purchase.status === "Active"
//                                         ? "bg-green-100 text-green-700"
//                                         : "bg-red-100 text-red-700"
//                                     }`}
//                                   >
//                                     {purchase.status || "N/A"}
//                                   </span>
//                                 </td>
//                                 <td className="p-2">
//                                   <button className="text-blue-500 hover:text-blue-700">
//                                     <ArrowUpRight size={16} />
//                                   </button>
//                                 </td>
//                               </tr>
//                             ))}
//                           </tbody>
//                         </table>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Edit Profile Modal */}
//       {isEditing && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//           <div className="bg-white rounded-xl max-w-md w-full p-6">
//             <div className="flex items-center justify-between mb-4">
//               <h3 className="text-lg font-bold text-gray-800">Edit User Profile</h3>
//               <button
//                 onClick={handleEditToggle}
//                 className="text-gray-400 hover:text-gray-600"
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
//                 <label className="block text-sm text-gray-600">Full Name</label>
//                 <input
//                   type="text"
//                   name="fullName"
//                   value={editForm.fullName}
//                   onChange={handleEditChange}
//                   className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm text-gray-600">Phone Number</label>
//                 <input
//                   type="text"
//                   name="phone"
//                   value={editForm.phone}
//                   onChange={handleEditChange}
//                   className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//                   pattern="(\+254|0)[0-9]{9}"
//                   title="Phone number must be in the format +254XXXXXXXXX or 07XXXXXXXX"
//                   required
//                 />
//               </div>
//               <div className="flex justify-end gap-2">
//                 <button
//                   type="button"
//                   onClick={handleEditToggle}
//                   className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
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
//           <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
//             <div className="p-6">
//               <div className="flex items-center justify-between mb-4">
//                 <h3 className="text-lg font-bold text-gray-800">Purchase Details</h3>
//                 <button
//                   onClick={closePurchaseDetails}
//                   className="text-gray-400 hover:text-gray-600"
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
//                   <p className="text-sm text-gray-500">Plan</p>
//                   <p className="font-medium">{selectedPurchase.plan?.name || "N/A"}</p>
//                 </div>
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <p className="text-sm text-gray-500">Purchase Date</p>
//                     <p className="font-medium">{formatDate(selectedPurchase.purchase_date)}</p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-500">Duration</p>
//                     <p className="font-medium">{selectedPurchase.duration || "N/A"}</p>
//                   </div>
//                 </div>
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <p className="text-sm text-gray-500">Price</p>
//                     <p className="font-medium">${selectedPurchase.amount}</p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-500">Status</p>
//                     <p className="font-medium">
//                       <span
//                         className={`px-2 py-1 rounded-full text-xs ${
//                           selectedPurchase.status === "Active"
//                             ? "bg-green-100 text-green-700"
//                             : "bg-red-100 text-red-700"
//                         }`}
//                       >
//                         {selectedPurchase.status || "N/A"}
//                       </span>
//                     </p>
//                   </div>
//                 </div>
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <p className="text-sm text-gray-500">Payment Method</p>
//                     <p className="font-medium">{selectedPurchase.payment_method || "N/A"}</p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-500">Invoice Number</p>
//                     <p className="font-medium">{selectedPurchase.invoice_number || "N/A"}</p>
//                   </div>
//                 </div>
//                 {selectedPurchase.status === "Expired" && (
//                   <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
//                     <div className="flex items-center gap-2 text-yellow-700">
//                       <AlertTriangle size={16} />
//                       <p className="text-sm">
//                         This plan expired on {formatDate(selectedUser.subscription?.expiryDate)}
//                       </p>
//                     </div>
//                   </div>
//                 )}
//               </div>
//               <div className="mt-6 flex justify-end">
//                 <button
//                   onClick={closePurchaseDetails}
//                   className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
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

// export default UserProfilePage;




// import React, { useState, useEffect } from "react";
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
//   ChevronLeft,
//   ChevronRight as ChevronRightPagination,
// } from "lucide-react";
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
// import api from "../../../api";
// import { useAuth } from "../../context/AuthContext";
// import { FaSpinner } from "react-icons/fa";

// const UserProfilePage = () => {
//   const { isAuthenticated, authLoading } = useAuth();
//   const today = new Date();
//   const [users, setUsers] = useState([]);
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [expandedSection, setExpandedSection] = useState(null);
//   const [filterYear, setFilterYear] = useState("All");
//   const [selectedPurchase, setSelectedPurchase] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [isEditing, setIsEditing] = useState(false);
//   const [editForm, setEditForm] = useState({ fullName: "", phone: "" });
//   const [currentPage, setCurrentPage] = useState(1);
//   const [filterStatus, setFilterStatus] = useState("All");
//   const usersPerPage = 3;

//   // Fetch users on mount
//   useEffect(() => {
//     const fetchUsers = async () => {
//       if (!isAuthenticated) {
//         setError("Please log in to view user profiles.");
//         setIsLoading(false);
//         return;
//       }

//       try {
//         setIsLoading(true);
//         const response = await api.get("/api/user_management/profiles/");
//         const enrichedUsers = response.data.results.map(enrichUser);
//         setUsers(enrichedUsers);
//         setSelectedUser(enrichedUsers[0] || null);
//         setError(null);
//       } catch (err) {
//         setError(err.response?.data?.error || "Failed to load users.");
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     if (!authLoading && isAuthenticated) {
//       fetchUsers();
//     }
//   }, [isAuthenticated, authLoading]);

//   // Enrich user data
//   const enrichUser = (user) => {
//     const expiry = user.subscription?.expiryDate ? new Date(user.subscription.expiryDate) : null;
//     const paymentStatus = expiry
//       ? today < expiry
//         ? "Paid"
//         : today.toDateString() === expiry.toDateString()
//         ? "Due"
//         : "Expired"
//       : "No Plan";

//     const isUnlimited = user.data_usage.total === "unlimited";
//     const active = isUnlimited || user.data_usage.used < parseFloat(user.data_usage.total || 0);

//     const totalRevenue = user.history.purchaseHistory.reduce(
//       (sum, purchase) => sum + purchase.amount,
//       0
//     );

//     const renewalFrequency =
//       user.history.purchaseHistory.length > 1
//         ? `${user.history.purchaseHistory.length} renewals`
//         : "No renewals";

//     const firstPurchase = new Date(
//       user.history.purchaseHistory[user.history.purchaseHistory.length - 1]?.purchase_date
//     );
//     const monthsActive =
//       (today.getFullYear() - firstPurchase.getFullYear()) * 12 +
//       (today.getMonth() - firstPurchase.getMonth()) + 1;
//     const avgMonthlySpend = totalRevenue / Math.max(monthsActive, 1);

//     const loyaltyDuration = Math.floor(
//       (today - firstPurchase) / (1000 * 60 * 60 * 24 * 30)
//     );

//     return {
//       ...user,
//       paymentStatus,
//       active,
//       isUnlimited,
//       totalRevenue,
//       renewalFrequency,
//       avgMonthlySpend,
//       loyaltyDuration,
//     };
//   };

//   const handleView = async (user) => {
//     try {
//       const response = await api.get(`/api/user_management/profiles/${user.id}/`);
//       const enrichedUser = enrichUser(response.data);
//       setSelectedUser(enrichedUser);
//       setExpandedSection(null);
//       setFilterYear("All");
//       setSelectedPurchase(null);
//       setError(null);
//     } catch (err) {
//       setError(err.response?.data?.error || "Failed to load user profile.");
//     }
//   };

//   const handleEditToggle = () => {
//     if (!isEditing) {
//       setEditForm({
//         fullName: selectedUser.full_name,
//         phone: selectedUser.phonenumber,
//       });
//     }
//     setIsEditing(!isEditing);
//   };

//   const handleEditChange = (e) => {
//     const { name, value } = e.target;
//     setEditForm((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleEditSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await api.patch(`/api/user_management/profiles/${selectedUser.id}/`, {
//         full_name: editForm.fullName,
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
//       setError(err.response?.data?.error || "Failed to update user profile.");
//     }
//   };

//   const toggleSection = (section) => {
//     setExpandedSection(expandedSection === section ? null : section);
//     setSelectedPurchase(null);
//   };

//   const DataUsageBar = ({ used, total, isUnlimited }) => {
//     if (isUnlimited) {
//       return (
//         <div className="w-full bg-gradient-to-r from-purple-200 to-blue-200 rounded-full h-4 relative overflow-hidden">
//           <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-blue-600 to-teal-500 opacity-80 animate-pulse rounded-full"></div>
//         </div>
//       );
//     }

//     const percentage = Math.min((used / parseFloat(total || 1)) * 100, 100);
//     let colorClass = "bg-green-600";
//     if (percentage > 80) colorClass = "bg-yellow-600";
//     if (percentage > 95) colorClass = "bg-red-600";

//     return (
//       <div className="w-full bg-gray-300 rounded-full h-4 overflow-hidden">
//         <div
//           className={`${colorClass} h-4 rounded-full transition-all duration-500 ease-in-out`}
//           style={{ width: `${percentage}%` }}
//         ></div>
//       </div>
//     );
//   };

//   const DataUsageIcon = ({ used, total, isUnlimited }) => {
//     if (isUnlimited) return <Zap className="text-purple-600" size={20} />;
//     const percentage = used / parseFloat(total || 1);
//     if (percentage < 0.3) return <BatteryFull className="text-green-600" size={20} />;
//     if (percentage < 0.7) return <BatteryMedium className="text-yellow-600" size={20} />;
//     return <BatteryLow className="text-red-600" size={20} />;
//   };

//   const PaymentStatusIcon = ({ status }) => {
//     switch (status) {
//       case "Paid":
//         return <BadgeCheck className="text-green-600" size={20} />;
//       case "Due":
//         return <Clock className="text-yellow-600" size={20} />;
//       case "Expired":
//         return <AlertTriangle className="text-red-600" size={20} />;
//       case "No Plan":
//         return <AlertTriangle className="text-orange-600" size={20} />;
//       default:
//         return <CreditCard className="text-gray-600" size={20} />;
//     }
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return "N/A";
//     const options = { year: "numeric", month: "short", day: "numeric" };
//     return new Date(dateString).toLocaleDateString(undefined, options);
//   };

//   const formatCurrency = (amount) => {
//     return new Intl.NumberFormat("en-US", {
//       style: "currency",
//       currency: "USD",
//       minimumFractionDigits: 0,
//       maximumFractionDigits: 0,
//     }).format(amount);
//   };

//   const exportToCSV = (history) => {
//     const headers = ["Plan,Purchase Date,Duration,Price,Status,Payment Method,Invoice Number"];
//     const rows = history.purchaseHistory.map((purchase) =>
//       [
//         purchase.plan?.name || "N/A",
//         formatDate(purchase.purchase_date),
//         purchase.duration || "N/A",
//         `$${purchase.amount}`,
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
//     a.setAttribute("download", `${selectedUser.full_name}_subscription_history.csv`);
//     a.click();
//   };

//   const getFilteredPurchaseHistory = () => {
//     if (!selectedUser?.history?.purchaseHistory) return [];
//     if (filterYear === "All") return selectedUser.history.purchaseHistory;
//     return selectedUser.history.purchaseHistory.filter(
//       (purchase) => new Date(purchase.purchase_date).getFullYear().toString() === filterYear
//     );
//   };

//   const getChartData = () => {
//     if (!selectedUser?.history?.purchaseHistory) return [];
//     const purchasesByYear = {};
//     selectedUser.history.purchaseHistory.forEach((purchase) => {
//       const year = new Date(purchase.purchase_date).getFullYear();
//       if (!purchasesByYear[year]) purchasesByYear[year] = 0;
//       purchasesByYear[year] += purchase.amount;
//     });
//     return Object.keys(purchasesByYear).map((year) => ({
//       year,
//       revenue: purchasesByYear[year],
//     }));
//   };

//   const getMonthlyChartData = () => {
//     if (!selectedUser?.history?.purchaseHistory) return [];
//     const monthlyData = {};
//     selectedUser.history.purchaseHistory.forEach((purchase) => {
//       const date = new Date(purchase.purchase_date);
//       const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
//       if (!monthlyData[monthYear]) monthlyData[monthYear] = 0;
//       monthlyData[monthYear] += purchase.amount;
//     });

//     return Object.keys(monthlyData).map((key) => {
//       const [year, month] = key.split("-");
//       return {
//         month: `${new Date(year, month - 1).toLocaleString("default", { month: "short" })} ${year}`,
//         revenue: monthlyData[key],
//       };
//     });
//   };

//   const getPlanDistributionData = () => {
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
//   };

//   const getPaymentMethodData = () => {
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
//   };

//   const getPlanColor = (plan) => {
//     const colors = {
//       Enterprise: "#4F46E5",
//       Business: "#2563EB",
//       Residential: "#059669",
//       Basic: "#D97706",
//       Unknown: "#4B5563",
//     };
//     return colors[plan] || "#4B5563";
//   };

//   const getPlanBehavior = () => {
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
//   };

//   const getSpendingTrend = () => {
//     if (!selectedUser?.history?.purchaseHistory || selectedUser.history.purchaseHistory.length < 2) return "stable";
//     const firstPrice = selectedUser.history.purchaseHistory[0].amount;
//     const lastPrice = selectedUser.history.purchaseHistory[selectedUser.history.purchaseHistory.length - 1].amount;
//     return lastPrice > firstPrice ? "up" : lastPrice < firstPrice ? "down" : "stable";
//   };

//   const viewPurchaseDetails = (purchase) => {
//     setSelectedPurchase(purchase);
//   };

//   const closePurchaseDetails = () => {
//     setSelectedPurchase(null);
//   };

//   // Pagination and filtering
//   const filteredUsers = users.filter((user) => {
//     if (filterStatus === "Active") return user.active;
//     if (filterStatus === "Inactive") return !user.active;
//     return true;
//   });

//   const indexOfLastUser = currentPage * usersPerPage;
//   const indexOfFirstUser = indexOfLastUser - usersPerPage;
//   const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
//   const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

//   const paginate = (pageNumber) => {
//     setCurrentPage(pageNumber);
//     if (pageNumber === 1 && filteredUsers.length > 0) {
//       handleView(filteredUsers[0]);
//     }
//   };

//   if (authLoading || isLoading) {
//     return (
//       <div className="p-8 max-w-7xl mx-auto flex justify-center items-center min-h-screen">
//         <FaSpinner className="animate-spin text-4xl text-blue-600" />
//       </div>
//     );
//   }

//   if (!isAuthenticated) {
//     return (
//       <div className="p-8 max-w-7xl mx-auto">
//         <p className="text-center text-red-600 font-semibold">Please log in to access user profiles.</p>
//       </div>
//     );
//   }

//   return (
//     <div className="p-4 md:p-8 max-w-7xl mx-auto font-sans">
//       {error && (
//         <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg shadow-sm">{error}</div>
//       )}
//       <div className="flex items-center justify-between mb-8">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
//           <p className="text-gray-600 mt-1">Monitor and manage user subscriptions with ease</p>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* User List */}
//         <div className="lg:col-span-1 bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
//           <div className="p-4 border-b border-gray-200 flex items-center justify-between">
//             <h2 className="font-semibold text-gray-800 flex items-center gap-2">
//               <UserIcon className="text-blue-600" size={20} />
//               Users ({filteredUsers.length}/{users.length})
//             </h2>
//             <select
//               className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500"
//               value={filterStatus}
//               onChange={(e) => {
//                 setFilterStatus(e.target.value);
//                 setCurrentPage(1);
//               }}
//             >
//               <option value="All">All</option>
//               <option value="Active">Active</option>
//               <option value="Inactive">Inactive</option>
//             </select>
//           </div>
//           <div className="divide-y divide-gray-200">
//             {currentUsers.map((user) => (
//               <div
//                 key={user.id}
//                 className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-200 ${
//                   selectedUser?.id === user.id ? "bg-blue-50" : ""
//                 } ${!user.subscription?.plan ? "bg-orange-50" : ""}`}
//                 onClick={() => handleView(user)}
//               >
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center gap-3">
//                     <div
//                       className={`w-12 h-12 rounded-full flex items-center justify-center ${
//                         user.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
//                       }`}
//                     >
//                       <User size={24} />
//                     </div>
//                     <div>
//                       <h3 className="font-semibold text-gray-900">{user.full_name}</h3>
//                       <p className="text-sm text-gray-600">
//                         {user.subscription?.plan || (
//                           <span className="text-orange-600 font-medium">No Plan</span>
//                         )}{" "}
//                         Plan
//                       </p>
//                     </div>
//                   </div>
//                   <ChevronRight className="text-gray-500" size={20} />
//                 </div>
//                 <div className="mt-3 flex items-center justify-between text-sm">
//                   <span
//                     className={`px-3 py-1 rounded-full text-xs font-medium animate-pulse-short ${
//                       user.active
//                         ? "bg-green-200 text-green-800"
//                         : "bg-red-200 text-red-800"
//                     }`}
//                   >
//                     {user.active ? "Active" : "Inactive"}
//                   </span>
//                   <span className="text-gray-600">{user.phonenumber}</span>
//                 </div>
//               </div>
//             ))}
//           </div>
//           {filteredUsers.length > usersPerPage && (
//             <div className="p-4 border-t border-gray-200 flex items-center justify-between">
//               <button
//                 onClick={() => paginate(currentPage - 1)}
//                 disabled={currentPage === 1}
//                 className={`p-2 rounded-lg flex items-center gap-2 ${
//                   currentPage === 1
//                     ? "text-gray-400 cursor-not-allowed"
//                     : "text-blue-600 hover:bg-blue-50"
//                 }`}
//                 aria-label="Previous page"
//               >
//                 <ChevronLeft size={20} />
//                 <span>Previous</span>
//               </button>
//               <span className="text-sm text-gray-600">
//                 Page {currentPage} of {totalPages}
//               </span>
//               <button
//                 onClick={() => paginate(currentPage + 1)}
//                 disabled={currentPage === totalPages}
//                 className={`p-2 rounded-lg flex items-center gap-2 ${
//                   currentPage === totalPages
//                     ? "text-gray-400 cursor-not-allowed"
//                     : "text-blue-600 hover:bg-blue-50"
//                 }`}
//                 aria-label="Next page"
//               >
//                 <span>Next</span>
//                 <ChevronRightPagination size={20} />
//               </button>
//             </div>
//           )}
//         </div>

//         {/* User Details */}
//         {selectedUser && (
//           <div className="lg:col-span-2 space-y-6">
//             {/* Profile Card */}
//             <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
//               <div className="flex items-start justify-between">
//                 <div className="flex items-center gap-4">
//                   <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-200 to-purple-200 flex items-center justify-center">
//                     <User className="text-blue-700" size={32} />
//                   </div>
//                   <div>
//                     <h2 className="text-2xl font-bold text-gray-900">{selectedUser.full_name}</h2>
//                     <div className="flex items-center gap-2 mt-2">
//                       <span
//                         className={`px-3 py-1 rounded-full text-xs font-medium animate-pulse-short ${
//                           selectedUser.active
//                             ? "bg-green-200 text-green-800"
//                             : "bg-red-200 text-red-800"
//                         }`}
//                       >
//                         {selectedUser.active ? "Active" : "Inactive"}
//                       </span>
//                       <span
//                         className={`px-3 py-1 rounded-full text-xs font-medium ${
//                           selectedUser.subscription?.plan
//                             ? "bg-blue-200 text-blue-800"
//                             : "bg-orange-200 text-orange-800"
//                         }`}
//                       >
//                         {selectedUser.subscription?.plan || "No Plan"}
//                       </span>
//                     </div>
//                     {!selectedUser.subscription?.plan && (
//                       <button
//                         className="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
//                         onClick={() => alert("Assign a plan to this user")} // Replace with actual plan assignment logic
//                       >
//                         <Package size={16} />
//                         Assign Plan
//                       </button>
//                     )}
//                   </div>
//                 </div>
//                 <button
//                   className="text-gray-500 hover:text-gray-700 transition-colors"
//                   onClick={handleEditToggle}
//                 >
//                   <MoreVertical size={20} />
//                 </button>
//               </div>

//               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
//                 <div className="bg-gray-100 p-4 rounded-lg hover:shadow-sm transition-shadow">
//                   <div className="flex items-center gap-2 text-gray-600">
//                     <Phone size={18} />
//                     <span className="text-sm">Phone</span>
//                   </div>
//                   <p className="font-semibold text-gray-900 mt-1">{selectedUser.phonenumber}</p>
//                 </div>
//                 <div className="bg-gray-100 p-4 rounded-lg hover:shadow-sm transition-shadow">
//                   <div className="flex items-center gap-2 text-gray-600">
//                     <HardDrive size={18} />
//                     <span className="text-sm">Device</span>
//                   </div>
//                   <p className="font-semibold text-gray-900 mt-1">{selectedUser.device}</p>
//                 </div>
//                 <div className="bg-gray-100 p-4 rounded-lg hover:shadow-sm transition-shadow">
//                   <div className="flex items-center gap-2 text-gray-600">
//                     <Shield size={18} />
//                     <span className="text-sm">Location</span>
//                   </div honoured
//                   <p className="font-semibold text-gray-900 mt-1">{selectedUser.location}</p>
//                 </div>
//                 <div className="bg-gray-100 p-4 rounded-lg hover:shadow-sm transition-shadow">
//                   <div className="flex items-center gap-2 text-gray-600">
//                     <Clock size={18} />
//                     <span className="text-sm">Last Login</span>
//                   </div>
//                   <p className="font-semibold text-gray-900 mt-1">
//                     {selectedUser.last_login ? new Date(selectedUser.last_login).toLocaleString() : "N/A"}
//                   </p>
//                 </div>
//               </div>
//             </div>

//             {/* Current Plan Card */}
//             <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
//               <div
//                 className="p-4 border-b border-gray-200 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
//                 onClick={() => toggleSection("plan")}
//               >
//                 <h3 className="font-semibold text-gray-800 flex items-center gap-2">
//                   <BarChart2 className="text-blue-600" size={20} />
//                   Current Plan
//                 </h3>
//                 {expandedSection === "plan" ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
//               </div>
//               {expandedSection === "plan" && selectedUser.subscription ? (
//                 <div className="p-6">
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//                     <div className="space-y-4">
//                       <div className="flex items-center gap-3">
//                         <div className="p-2 rounded-lg bg-blue-200 text-blue-700">
//                           <CreditCard size={20} />
//                         </div>
//                         <div>
//                           <p className="text-sm text-gray-600">Plan Type</p>
//                           <p className="font-semibold text-gray-900">{selectedUser.subscription.plan}</p>
//                         </div>
//                       </div>
//                       <div className="flex items-center gap-3">
//                         <div className="p-2 rounded-lg bg-purple-200 text-purple-700">
//                           <PaymentStatusIcon status={selectedUser.paymentStatus} />
//                         </div>
//                         <div>
//                           <p className="text-sm text-gray-600">Payment Status</p>
//                           <p className="font-semibold text-gray-900 capitalize">{selectedUser.paymentStatus}</p>
//                         </div>
//                       </div>
//                     </div>
//                     <div className="space-y-4">
//                       <div className="flex items-center gap-3">
//                         <div className="p-2 rounded-lg bg-green-200 text-green-700">
//                           <CalendarDays size={20} />
//                         </div>
//                         <div>
//                           <p className="text-sm text-gray-600">Start Date</p>
//                           <p className="font-semibold text-gray-900">{formatDate(selectedUser.subscription.startDate)}</p>
//                         </div>
//                       </div>
//                       <div className="flex items-center gap-3">
//                         <div className="p-2 rounded-lg bg-orange-200 text-orange-700">
//                           <CalendarDays size={20} />
//                         </div>
//                         <div>
//                           <p className="text-sm text-gray-600">Expiry Date</p>
//                           <p className="font-semibold text-gray-900">{formatDate(selectedUser.subscription.expiryDate)}</p>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="flex items-center justify-between mb-3">
//                     <div className="flex items-center gap-2">
//                       <DataUsageIcon
//                         used={selectedUser.data_usage.used}
//                         total={selectedUser.data_usage.total}
//                         isUnlimited={selectedUser.isUnlimited}
//                       />
//                       <span className="font-semibold text-gray-900">Data Consumption</span>
//                     </div>
//                     <span className="text-sm font-semibold text-gray-900">
//                       {selectedUser.isUnlimited
//                         ? "Unlimited"
//                         : `${selectedUser.data_usage.used} ${selectedUser.data_usage.unit} of ${selectedUser.data_usage.total} ${selectedUser.data_usage.unit}`}
//                     </span>
//                   </div>
//                   <div className="mb-2">
//                     <DataUsageBar
//                       used={selectedUser.data_usage.used}
//                       total={selectedUser.data_usage.total}
//                       isUnlimited={selectedUser.isUnlimited}
//                     />
//                   </div>
//                   <div className="flex items-center justify-between text-sm text-gray-600">
//                     <span>0 {selectedUser.data_usage.unit}</span>
//                     <span>{selectedUser.isUnlimited ? "∞" : `${selectedUser.data_usage.total} ${selectedUser.data_usage.unit}`}</span>
//                   </div>
//                 </div>
//               ) : (
//                 expandedSection === "plan" && (
//                   <div className="p-6 bg-orange-50 rounded-b-xl">
//                     <div className="flex items-center gap-2 text-orange-700">
//                       <AlertTriangle size={20} />
//                       <p className="font-semibold">No Active Plan</p>
//                     </div>
//                     <p className="text-sm text-orange-600 mt-2">
//                       This user has no active subscription plan. Assign a plan to activate their account.
//                     </p>
//                     <button
//                       className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//                       onClick={() => alert("Assign a plan to this user")} // Replace with actual plan assignment logic
//                     >
//                       Assign Plan
//                     </button>
//                   </div>
//                 )
//               )}
//             </div>

//             {/* Subscription History Card */}
//             <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
//               <div
//                 className="p-4 border-b border-gray-200 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
//                 onClick={() => toggleSection("history")}
//               >
//                 <h3 className="font-semibold text-gray-800 flex items-center gap-2">
//                   <History className="text-blue-600" size={20} />
//                   Subscription History
//                 </h3>
//                 {expandedSection === "history" ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
//               </div>
//               {expandedSection === "history" && (
//                 <div className="p-6">
//                   <div className="space-y-8">
//                     {/* Customer Lifetime Value */}
//                     <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-4 rounded-lg">
//                       <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
//                         <CreditCard size={18} />
//                         Customer Lifetime Value
//                       </h4>
//                       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//                         <div className="bg-white p-4 rounded-lg shadow-sm">
//                           <p className="text-sm text-gray-600">Total Revenue</p>
//                           <p className="font-semibold text-lg text-gray-900">{formatCurrency(selectedUser.totalRevenue)}</p>
//                         </div>
//                         <div className="bg-white p-4 rounded-lg shadow-sm">
//                           <p className="text-sm text-gray-600">Avg. Monthly Spend</p>
//                           <p className="font-semibold text-lg text-gray-900">{formatCurrency(selectedUser.avgMonthlySpend)}</p>
//                         </div>
//                         <div className="bg-white p-4 rounded-lg shadow-sm">
//                           <p className="text-sm text-gray-600">Renewal Frequency</p>
//                           <p className="font-semibold text-lg text-gray-900">{selectedUser.renewalFrequency}</p>
//                         </div>
//                         <div className="bg-white p-4 rounded-lg shadow-sm">
//                           <p className="text-sm text-gray-600">Loyalty Duration</p>
//                           <p className="font-semibold text-lg text-gray-900">{selectedUser.loyaltyDuration} months</p>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Plan Purchase Trends */}
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                       <div>
//                         <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
//                           <BarChart2 size={18} />
//                           Annual Revenue Trend
//                         </h4>
//                         <div className="h-64 bg-gray-100 p-3 rounded-lg">
//                           <ResponsiveContainer width="100%" height="100%">
//                             <LineChart data={getChartData()}>
//                               <CartesianGrid strokeDasharray="3 3" vertical={false} />
//                               <XAxis dataKey="year" />
//                               <YAxis />
//                               <Tooltip formatter={(value) => [formatCurrency(value), "Revenue"]} />
//                               <Line
//                                 type="monotone"
//                                 dataKey="revenue"
//                                 stroke="#2563EB"
//                                 strokeWidth={2}
//                                 dot={{ r: 4 }}
//                                 activeDot={{ r: 6 }}
//                               />
//                             </LineChart>
//                           </ResponsiveContainer>
//                         </div>
//                       </div>
//                       <div>
//                         <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
//                           <BarChart2 size={18} />
//                           Monthly Revenue Breakdown
//                         </h4>
//                         <div className="h-64 bg-gray-100 p-3 rounded-lg">
//                           <ResponsiveContainer width="100%" height="100%">
//                             <BarChart data={getMonthlyChartData()}>
//                               <CartesianGrid strokeDasharray="3 3" vertical={false} />
//                               <XAxis dataKey="month" />
//                               <YAxis />
//                               <Tooltip formatter={(value) => [formatCurrency(value), "Revenue"]} />
//                               <Bar dataKey="revenue" fill="#7C3AED" radius={[4, 4, 0, 0]} />
//                             </BarChart>
//                           </ResponsiveContainer>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Plan Distribution */}
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                       <div>
//                         <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
//                           <Package size={18} />
//                           Plan Distribution
//                         </h4>
//                         <div className="h-64 bg-gray-100 p-3 rounded-lg">
//                           <ResponsiveContainer width="100%" height="100%">
//                             <PieChart>
//                               <Pie
//                                 data={getPlanDistributionData()}
//                                 cx="50%"
//                                 cy="50%"
//                                 labelLine={false}
//                                 outerRadius={80}
//                                 fill="#8884d8"
//                                 dataKey="value"
//                                 label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
//                               >
//                                 {getPlanDistributionData().map((entry, index) => (
//                                   <Cell key={`cell-${index}`} fill={entry.color} />
//                                 ))}
//                               </Pie>
//                               <Tooltip formatter={(value, name) => [`${value} purchases`, name]} />
//                             </PieChart>
//                           </ResponsiveContainer>
//                         </div>
//                       </div>
//                       <div>
//                         <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
//                           <CreditCard size={18} />
//                           Payment Methods
//                         </h4>
//                         <div className="h-64 bg-gray-100 p-3 rounded-lg">
//                           <ResponsiveContainer width="100%" height="100%">
//                             <PieChart>
//                               <Pie
//                                 data={getPaymentMethodData()}
//                                 cx="50%"
//                                 cy="50%"
//                                 labelLine={false}
//                                 outerRadius={80}
//                                 fill="#8884d8"
//                                 dataKey="value"
//                                 label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
//                               >
//                                 {getPaymentMethodData().map((entry, index) => (
//                                   <Cell
//                                     key={`cell-${index}`}
//                                     fill={["#4F46E5", "#2563EB", "#059669", "#D97706"][index % 4]}
//                                   />
//                                 ))}
//                               </Pie>
//                               <Tooltip formatter={(value, name) => [`${value} purchases`, name]} />
//                             </PieChart>
//                           </ResponsiveContainer>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Plan Behavior Insights */}
//                     <div>
//                       <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
//                         <TrendingUp size={18} />
//                         Plan Behavior Insights
//                       </h4>
//                       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//                         <div className="bg-gray-100 p-4 rounded-lg">
//                           <p className="text-sm text-gray-600">Favorite Plan</p>
//                           <p className="font-semibold text-gray-900">{getPlanBehavior().favoritePlan}</p>
//                         </div>
//                         <div className="bg-gray-100 p-4 rounded-lg">
//                           <p className="text-sm text-gray-600">Number of Upgrades</p>
//                           <p className="font-semibold text-gray-900">{getPlanBehavior().upgrades}</p>
//                         </div>
//                         <div className="bg-gray-100 p-4 rounded-lg">
//                           <p className="text-sm text-gray-600">Plan Changes</p>
//                           <p className="font-semibold text-gray-900">{getPlanBehavior().planChanges}</p>
//                         </div>
//                         <div className="bg-gray-100 p-4 rounded-lg">
//                           <p className="text-sm text-gray-600">Avg. Plan Duration</p>
//                           <p className="font-semibold text-gray-900">{getPlanBehavior().avgDuration.toFixed(1)} months</p>
//                         </div>
//                       </div>
//                       <div className="mt-4 bg-gray-100 p-4 rounded-lg">
//                         <div className="flex items-center gap-2">
//                           <p className="text-sm text-gray-600">Spending Trend:</p>
//                           {getSpendingTrend() === "up" ? (
//                             <div className="flex items-center text-green-600">
//                               <TrendingUp size={18} />
//                               <span className="ml-1 font-semibold">Increasing</span>
//                             </div>
//                           ) : getSpendingTrend() === "down" ? (
//                             <div className="flex items-center text-red-600">
//                               <TrendingDown size={18} />
//                               <span className="ml-1 font-semibold">Decreasing</span>
//                             </div>
//                           ) : (
//                             <div className="flex items-center text-gray-600">
//                               <Circle size={18} />
//                               <span className="ml-1 font-semibold">Stable</span>
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     </div>

//                     {/* Purchase History */}
//                     <div>
//                       <div className="flex items-center justify-between mb-3">
//                         <h4 className="font-semibold text-gray-800 flex items-center gap-2">
//                           <History size={18} />
//                           Detailed Purchase History
//                         </h4>
//                         <div className="flex items-center gap-2">
//                           <select
//                             className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500"
//                             value={filterYear}
//                             onChange={(e) => setFilterYear(e.target.value)}
//                           >
//                             <option value="All">All Years</option>
//                             {[
//                               ...new Set(
//                                 selectedUser.history.purchaseHistory.map((p) =>
//                                   new Date(p.purchase_date).getFullYear()
//                                 )
//                               ),
//                             ]
//                               .sort((a, b) => b - a)
//                               .map((year) => (
//                                 <option key={year} value={year}>
//                                   {year}
//                                 </option>
//                               ))}
//                           </select>
//                           <button
//                             className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
//                             onClick={() => exportToCSV(selectedUser.history)}
//                           >
//                             <Download size={16} />
//                             Export
//                           </button>
//                         </div>
//                       </div>
//                       <div className="overflow-x-auto">
//                         <table className="w-full text-sm">
//                           <thead>
//                             <tr className="bg-gray-100">
//                               <th className="p-3 text-left font-semibold text-gray-800">Plan</th>
//                               <th className="p-3 text-left font-semibold text-gray-800">Purchase Date</th>
//                               <th className="p-3 text-left font-semibold text-gray-800">Duration</th>
//                               <th className="p-3 text-left font-semibold text-gray-800">Price</th>
//                               <th className="p-3 text-left font-semibold text-gray-800">Status</th>
//                               <th className="p-3 text-left font-semibold text-gray-800">Details</th>
//                             </tr>
//                           </thead>
//                           <tbody>
//                             {getFilteredPurchaseHistory().map((purchase, index) => (
//                               <tr
//                                 key={index}
//                                 className="border-b hover:bg-gray-50 cursor-pointer transition-colors"
//                                 onClick={() => viewPurchaseDetails(purchase)}
//                               >
//                                 <td className="p-3">
//                                   <div className="flex items-center gap-2">
//                                     <div
//                                       className="w-3 h-3 rounded-full"
//                                       style={{ backgroundColor: getPlanColor(purchase.plan?.name) }}
//                                     ></div>
//                                     {purchase.plan?.name || "N/A"}
//                                   </div>
//                                 </td>
//                                 <td className="p-3">{formatDate(purchase.purchase_date)}</td>
//                                 <td className="p-3">{purchase.duration || "N/A"}</td>
//                                 <td className="p-3 font-semibold">${purchase.amount}</td>
//                                 <td className="p-3">
//                                   <span
//                                     className={`px-3 py-1 rounded-full text-xs font-medium ${
//                                       purchase.status === "Active"
//                                         ? "bg-green-200 text-green-800"
//                                         : "bg-red-200 text-red-800"
//                                     }`}
//                                   >
//                                     {purchase.status || "N/A"}
//                                   </span>
//                                 </td>
//                                 <td className="p-3">
//                                   <button className="text-blue-600 hover:text-blue-800 transition-colors">
//                                     <ArrowUpRight size={18} />
//                                   </button>
//                                 </td>
//                               </tr>
//                             ))}
//                           </tbody>
//                         </table>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Edit Profile Modal */}
//       {isEditing && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//           <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-lg">
//             <div className="flex items-center justify-between mb-4">
//               <h3 className="text-lg font-bold text-gray-900">Edit User Profile</h3>
//               <button
//                 onClick={handleEditToggle}
//                 className="text-gray-500 hover:text-gray-700"
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
//                 <label className="block text-sm text-gray-600 font-medium">Full Name</label>
//                 <input
//                   type="text"
//                   name="fullName"
//                   value={editForm.fullName}
//                   onChange={handleEditChange}
//                   className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm text-gray-600 font-medium">Phone Number</label>
//                 <input
//                   type="text"
//                   name="phone"
//                   value={editForm.phone}
//                   onChange={handleEditChange}
//                   className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   pattern="(\+254|0)[0-9]{9}"
//                   title="Phone number must be in the format +254XXXXXXXXX or 07XXXXXXXX"
//                   required
//                 />
//               </div>
//               <div className="flex justify-end gap-2">
//                 <button
//                   type="button"
//                   onClick={handleEditToggle}
//                   className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
//           <div classNameocarbon-neutral rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-lg">
//             <div className="p-6">
//               <div className="flex items-center justify-between mb-4">
//                 <h3 className="text-lg font-bold text-gray-900">Purchase Details</h3>
//                 <button
//                   onClick={closePurchaseDetails}
//                   className="text-gray-500 hover:text-gray-700"
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
//                   <p className="text-sm text-gray-600">Plan</p>
//                   <p className="font-semibold text-gray-900">{selectedPurchase.plan?.name || "N/A"}</p>
//                 </div>
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <p className="text-sm text-gray-600">Purchase Date</p>
//                     <p className="font-semibold text-gray-900">{formatDate(selectedPurchase.purchase_date)}</p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-600">Duration</p>
//                     <p className="font-semibold text-gray-900">{selectedPurchase.duration || "N/A"}</p>
//                   </div>
//                 </div>
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <p className="text-sm text-gray-600">Price</p>
//                     <p className="font-semibold text-gray-900">${selectedPurchase.amount}</p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-600">Status</p>
//                     <p className="font-semibold">
//                       <span
//                         className={`px-3 py-1 rounded-full text-xs font-medium ${
//                           selectedPurchase.status === "Active"
//                             ? "bg-green-200 text-green-800"
//                             : "bg-red-200 text-red-800"
//                         }`}
//                       >
//                         {selectedPurchase.status || "N/A"}
//                       </span>
//                     </p>
//                   </div>
//                 </div>
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <p className="text-sm text-gray-600">Payment Method</p>
//                     <p className="font-semibold text-gray-900">{selectedPurchase.payment_method || "N/A"}</p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-600">Invoice Number</p>
//                     <p className="font-semibold text-gray-900">{selectedPurchase.invoice_number || "N/A"}</p>
//                   </div>
//                 </div>
//                 {selectedPurchase.status === "Expired" && (
//                   <div className="mt-4 p-3 bg-yellow-100 rounded-lg">
//                     <div className="flex items-center gap-2 text-yellow-700">
//                       <AlertTriangle size={18} />
//                       <p className="text-sm">
//                         This plan expired on {formatDate(selectedUser.subscription?.expiryDate)}
//                       </p>
//                     </div>
//                   </div>
//                 )}
//               </div>
//               <div className="mt-6 flex justify-end">
//                 <button
//                   onClick={closePurchaseDetails}
//                   className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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

// export default UserProfilePage;








// import React, { useState, useEffect } from "react";
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
// } from "lucide-react";
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
// import api from "../../../api"
// import { useAuth } from "../../context/AuthContext"
// import { FaSpinner } from "react-icons/fa";

// const UserProfilePage = () => {
//   const { isAuthenticated, authLoading } = useAuth();
//   const today = new Date();
//   const [users, setUsers] = useState([]);
//   const [filteredUsers, setFilteredUsers] = useState([]);
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [expandedSection, setExpandedSection] = useState(null);
//   const [filterYear, setFilterYear] = useState("All");
//   const [selectedPurchase, setSelectedPurchase] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [isEditing, setIsEditing] = useState(false);
//   const [editForm, setEditForm] = useState({ fullName: "", phone: "" });
//   const [currentPage, setCurrentPage] = useState(1);
//   const [usersPerPage] = useState(3);
//   const [activeFilter, setActiveFilter] = useState("all"); // 'all', 'active', 'inactive'

//   // Fetch users on mount
//   useEffect(() => {
//     const fetchUsers = async () => {
//       if (!isAuthenticated) {
//         setError("Please log in to view user profiles.");
//         setIsLoading(false);
//         return;
//       }

//       try {
//         setIsLoading(true);
//         const response = await api.get("/api/user_management/profiles/");
//         const enrichedUsers = response.data.results.map(enrichUser);
//         setUsers(enrichedUsers);
//         setSelectedUser(enrichedUsers[0] || null);
//         setError(null);
//       } catch (err) {
//         setError(err.response?.data?.error || "Failed to load users.");
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     if (!authLoading && isAuthenticated) {
//       fetchUsers();
//     }
//   }, [isAuthenticated, authLoading]);

//   // Filter users based on active status
//   useEffect(() => {
//     let filtered = users;
//     if (activeFilter === 'active') {
//       filtered = users.filter(user => user.active);
//     } else if (activeFilter === 'inactive') {
//       filtered = users.filter(user => !user.active);
//     }
//     setFilteredUsers(filtered);
//     setCurrentPage(1); // Reset to first page when filter changes
//   }, [users, activeFilter]);

//   // Pagination logic
//   const indexOfLastUser = currentPage * usersPerPage;
//   const indexOfFirstUser = indexOfLastUser - usersPerPage;
//   const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
//   const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

//   const paginate = (pageNumber) => setCurrentPage(pageNumber);

//   // Enrich user data
//   const enrichUser = (user) => {
//     const expiry = user.subscription?.expiryDate ? new Date(user.subscription.expiryDate) : null;
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
//   };

//   const handleView = async (user) => {
//     try {
//       const response = await api.get(`/api/user_management/profiles/${user.id}/`);
//       const enrichedUser = enrichUser(response.data);
//       setSelectedUser(enrichedUser);
//       setExpandedSection(null);
//       setFilterYear("All");
//       setSelectedPurchase(null);
//       setError(null);
//     } catch (err) {
//       setError(err.response?.data?.error || "Failed to load user profile.");
//     }
//   };

//   const handleEditToggle = () => {
//     if (!isEditing) {
//       setEditForm({
//         fullName: selectedUser.full_name,
//         phone: selectedUser.phonenumber,
//       });
//     }
//     setIsEditing(!isEditing);
//   };

//   const handleEditChange = (e) => {
//     const { name, value } = e.target;
//     setEditForm((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleEditSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await api.patch(`/api/user_management/profiles/${selectedUser.id}/`, {
//         full_name: editForm.fullName,
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
//       setError(err.response?.data?.error || "Failed to update user profile.");
//     }
//   };

//   const toggleSection = (section) => {
//     setExpandedSection(expandedSection === section ? null : section);
//     setSelectedPurchase(null);
//   };

//   const DataUsageBar = ({ used, total, isUnlimited }) => {
//     if (isUnlimited) {
//       return (
//         <div className="w-full bg-gradient-to-r from-purple-100 to-blue-100 rounded-full h-3 relative overflow-hidden">
//           <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-blue-500 to-teal-400 opacity-70 animate-pulse rounded-full"></div>
//         </div>
//       );
//     }

//     const percentage = Math.min((used / parseFloat(total || 1)) * 100, 100);
//     let colorClass = "bg-green-500";
//     if (percentage > 80) colorClass = "bg-yellow-500";
//     if (percentage > 95) colorClass = "bg-red-500";

//     return (
//       <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
//         <div
//           className={`${colorClass} h-3 rounded-full transition-all duration-500`}
//           style={{ width: `${percentage}%` }}
//         ></div>
//       </div>
//     );
//   };

//   const DataUsageIcon = ({ used, total, isUnlimited }) => {
//     if (isUnlimited) return <Zap className="text-purple-500" size={18} />;
//     const percentage = used / parseFloat(total || 1);
//     if (percentage < 0.3) return <BatteryFull className="text-green-500" size={18} />;
//     if (percentage < 0.7) return <BatteryMedium className="text-yellow-500" size={18} />;
//     return <BatteryLow className="text-red-500" size={18} />;
//   };

//   const PaymentStatusIcon = ({ status }) => {
//     switch (status) {
//       case "Paid":
//         return <BadgeCheck className="text-green-500" size={18} />;
//       case "Due":
//         return <Clock className="text-yellow-500" size={18} />;
//       case "Expired":
//         return <AlertTriangle className="text-red-500" size={18} />;
//       default:
//         return <CreditCard className="text-gray-500" size={18} />;
//     }
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return "N/A";
//     const options = { year: "numeric", month: "short", day: "numeric" };
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

//   const exportToCSV = (history) => {
//     if (!history?.purchaseHistory) return;
    
//     const headers = ["Plan,Purchase Date,Duration,Price,Status,Payment Method,Invoice Number"];
//     const rows = history.purchaseHistory.map((purchase) =>
//       [
//         purchase.plan?.name || "N/A",
//         formatDate(purchase.purchase_date),
//         purchase.duration || "N/A",
//         `$${purchase.amount}`,
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
//     a.setAttribute("download", `${selectedUser.full_name}_subscription_history.csv`);
//     a.click();
//   };

//   const getFilteredPurchaseHistory = () => {
//     if (!selectedUser?.history?.purchaseHistory) return [];
//     if (filterYear === "All") return selectedUser.history.purchaseHistory;
//     return selectedUser.history.purchaseHistory.filter(
//       (purchase) => new Date(purchase.purchase_date).getFullYear().toString() === filterYear
//     );
//   };

//   const getChartData = () => {
//     if (!selectedUser?.history?.purchaseHistory) return [];
//     const purchasesByYear = {};
//     selectedUser.history.purchaseHistory.forEach((purchase) => {
//       const year = new Date(purchase.purchase_date).getFullYear();
//       if (!purchasesByYear[year]) purchasesByYear[year] = 0;
//       purchasesByYear[year] += purchase.amount;
//     });
//     return Object.keys(purchasesByYear).map((year) => ({
//       year,
//       revenue: purchasesByYear[year],
//     }));
//   };

//   const getMonthlyChartData = () => {
//     if (!selectedUser?.history?.purchaseHistory) return [];
//     const monthlyData = {};
//     selectedUser.history.purchaseHistory.forEach((purchase) => {
//       const date = new Date(purchase.purchase_date);
//       const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
//       if (!monthlyData[monthYear]) monthlyData[monthYear] = 0;
//       monthlyData[monthYear] += purchase.amount;
//     });

//     return Object.keys(monthlyData).map((key) => {
//       const [year, month] = key.split("-");
//       return {
//         month: `${new Date(year, month - 1).toLocaleString("default", { month: "short" })} ${year}`,
//         revenue: monthlyData[key],
//       };
//     });
//   };

//   const getPlanDistributionData = () => {
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
//   };

//   const getPaymentMethodData = () => {
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
//   };

//   const getPlanColor = (plan) => {
//     const colors = {
//       Enterprise: "#6366F1",
//       Business: "#3B82F6",
//       Residential: "#10B981",
//       Promotional: "#F59E0B",
//       Unknown: "#6B7280",
//     };
//     return colors[plan] || "#6B7280";
//   };

//   const getPlanBehavior = () => {
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
//   };

//   const getSpendingTrend = () => {
//     if (!selectedUser?.history?.purchaseHistory || selectedUser.history.purchaseHistory.length < 2) return "stable";
//     const firstPrice = selectedUser.history.purchaseHistory[0].amount;
//     const lastPrice = selectedUser.history.purchaseHistory[selectedUser.history.purchaseHistory.length - 1].amount;
//     return lastPrice > firstPrice ? "up" : lastPrice < firstPrice ? "down" : "stable";
//   };

//   const viewPurchaseDetails = (purchase) => {
//     setSelectedPurchase(purchase);
//   };

//   const closePurchaseDetails = () => {
//     setSelectedPurchase(null);
//   };

//   if (authLoading || isLoading) {
//     return (
//       <div className="p-8 max-w-7xl mx-auto flex justify-center items-center min-h-screen">
//         <FaSpinner className="animate-spin text-4xl text-blue-600" />
//       </div>
//     );
//   }

//   if (!isAuthenticated) {
//     return (
//       <div className="p-8 max-w-7xl mx-auto">
//         <p className="text-center text-red-500">Please log in to access user profiles.</p>
//       </div>
//     );
//   }

//   return (
//     <div className="p-4 md:p-8 max-w-7xl mx-auto">
//       {error && (
//         <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>
//       )}
//       <div className="flex items-center justify-between mb-8">
//         <div>
//           <h1 className="text-2xl md:text-3xl font-bold text-gray-800">User Management</h1>
//           <p className="text-gray-500">Manage and view user details and subscriptions</p>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* User List */}
//         <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
//           <div className="p-4 border-b border-gray-100 flex justify-between items-center">
//             <h2 className="font-semibold text-gray-700 flex items-center gap-2">
//               <UserIcon className="text-blue-500" size={18} />
//               Users ({filteredUsers.filter((u) => u.active).length}/{filteredUsers.length})
//             </h2>
//             <div className="flex space-x-1">
//               <button
//                 onClick={() => setActiveFilter('all')}
//                 className={`px-2 py-1 text-xs rounded-md ${activeFilter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
//               >
//                 All
//               </button>
//               <button
//                 onClick={() => setActiveFilter('active')}
//                 className={`px-2 py-1 text-xs rounded-md ${activeFilter === 'active' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700'}`}
//               >
//                 Active
//               </button>
//               <button
//                 onClick={() => setActiveFilter('inactive')}
//                 className={`px-2 py-1 text-xs rounded-md ${activeFilter === 'inactive' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700'}`}
//               >
//                 Inactive
//               </button>
//             </div>
//           </div>
//           <div className="divide-y divide-gray-100">
//             {currentUsers.length > 0 ? (
//               currentUsers.map((user) => (
//                 <div
//                   key={user.id}
//                   className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
//                     selectedUser?.id === user.id ? "bg-blue-50" : ""
//                   }`}
//                   onClick={() => handleView(user)}
//                 >
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center gap-3">
//                       <div
//                         className={`w-10 h-10 rounded-full flex items-center justify-center ${
//                           user.active ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"
//                         }`}
//                       >
//                         <User size={20} />
//                       </div>
//                       <div>
//                         <h3 className="font-medium text-gray-800">{user.full_name}</h3>
//                         <p className="text-sm text-gray-500">
//                           {user.hasPlan ? `${user.subscription?.plan || 'No Plan'} Plan` : 'No Plan'}
//                         </p>
//                       </div>
//                     </div>
//                     <ChevronRight className="text-gray-400" size={18} />
//                   </div>
//                   <div className="mt-3 flex items-center justify-between text-sm">
//                     <span
//                       className={`px-2 py-1 rounded-full text-xs ${
//                         user.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
//                       }`}
//                     >
//                       {user.active ? "Active" : "Inactive"}
//                     </span>
//                     <span className="text-gray-500">{user.phonenumber}</span>
//                   </div>
//                   {!user.hasPlan && (
//                     <div className="mt-2 flex items-center text-xs text-yellow-700">
//                       <AlertTriangle size={14} className="mr-1" />
//                       <span>No active subscription</span>
//                     </div>
//                   )}
//                 </div>
//               ))
//             ) : (
//               <div className="p-4 text-center text-gray-500">
//                 No users found
//               </div>
//             )}
//           </div>
//           {filteredUsers.length > usersPerPage && (
//             <div className="p-4 border-t border-gray-100 flex items-center justify-between">
//               <button
//                 onClick={() => paginate(currentPage - 1)}
//                 disabled={currentPage === 1}
//                 className={`p-2 rounded-md ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
//               >
//                 <ChevronLeft size={18} />
//               </button>
//               <span className="text-sm text-gray-600">
//                 Page {currentPage} of {totalPages}
//               </span>
//               <button
//                 onClick={() => paginate(currentPage + 1)}
//                 disabled={currentPage === totalPages}
//                 className={`p-2 rounded-md ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
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
//             <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
//               <div className="flex items-start justify-between">
//                 <div className="flex items-center gap-4">
//                   <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
//                     selectedUser.active ? "bg-gradient-to-br from-green-100 to-teal-100" : "bg-gradient-to-br from-gray-100 to-gray-200"
//                   }`}>
//                     <User className={selectedUser.active ? "text-green-600" : "text-gray-500"} size={28} />
//                   </div>
//                   <div>
//                     <h2 className="text-xl font-bold text-gray-800">{selectedUser.full_name}</h2>
//                     <div className="flex items-center gap-2 mt-1">
//                       <span
//                         className={`px-2 py-1 rounded-full text-xs ${
//                           selectedUser.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
//                         }`}
//                       >
//                         {selectedUser.active ? "Active" : "Inactive"}
//                       </span>
//                       {selectedUser.hasPlan ? (
//                         <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
//                           {selectedUser.subscription?.plan} Plan
//                         </span>
//                       ) : (
//                         <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700">
//                           No Active Plan
//                         </span>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//                 <button
//                   className="text-gray-400 hover:text-gray-600"
//                   onClick={handleEditToggle}
//                 >
//                   <MoreVertical size={18} />
//                 </button>
//               </div>

//               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
//                 <div className="bg-gray-50 p-3 rounded-lg">
//                   <div className="flex items-center gap-2 text-gray-500">
//                     <Phone size={16} />
//                     <span className="text-xs">Phone</span>
//                   </div>
//                   <p className="font-medium mt-1">{selectedUser.phonenumber}</p>
//                 </div>
//                 <div className="bg-gray-50 p-3 rounded-lg">
//                   <div className="flex items-center gap-2 text-gray-500">
//                     <HardDrive size={16} />
//                     <span className="text-xs">Device</span>
//                   </div>
//                   <p className="font-medium mt-1">{selectedUser.device}</p>
//                 </div>
//                 <div className="bg-gray-50 p-3 rounded-lg">
//                   <div className="flex items-center gap-2 text-gray-500">
//                     <Shield size={16} />
//                     <span className="text-xs">Location</span>
//                   </div>
//                   <p className="font-medium mt-1">{selectedUser.location}</p>
//                 </div>
//                 <div className="bg-gray-50 p-3 rounded-lg">
//                   <div className="flex items-center gap-2 text-gray-500">
//                     <Clock size={16} />
//                     <span className="text-xs">Last Login</span>
//                   </div>
//                   <p className="font-medium mt-1">
//                     {selectedUser.last_login ? new Date(selectedUser.last_login).toLocaleString() : "N/A"}
//                   </p>
//                 </div>
//               </div>
//             </div>

//             {/* Current Plan Card */}
//             {selectedUser.hasPlan ? (
//               <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
//                 <div
//                   className="p-4 border-b border-gray-100 flex items-center justify-between cursor-pointer"
//                   onClick={() => toggleSection("plan")}
//                 >
//                   <h3 className="font-semibold text-gray-700 flex items-center gap-2">
//                     <BarChart2 className="text-blue-500" size={18} />
//                     Current Plan
//                   </h3>
//                   {expandedSection === "plan" ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
//                 </div>
//                 {expandedSection === "plan" && selectedUser.subscription && (
//                   <div className="p-6">
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//                       <div className="space-y-4">
//                         <div className="flex items-center gap-3">
//                           <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
//                             <CreditCard size={18} />
//                           </div>
//                           <div>
//                             <p className="text-xs text-gray-500">Plan Type</p>
//                             <p className="font-medium">{selectedUser.subscription.plan}</p>
//                           </div>
//                         </div>
//                         <div className="flex items-center gap-3">
//                           <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
//                             <PaymentStatusIcon status={selectedUser.paymentStatus} />
//                           </div>
//                           <div>
//                             <p className="text-xs text-gray-500">Payment Status</p>
//                             <p className="font-medium capitalize">{selectedUser.paymentStatus}</p>
//                           </div>
//                         </div>
//                       </div>
//                       <div className="space-y-4">
//                         <div className="flex items-center gap-3">
//                           <div className="p-2 rounded-lg bg-green-100 text-green-600">
//                             <CalendarDays size={18} />
//                           </div>
//                           <div>
//                             <p className="text-xs text-gray-500">Start Date</p>
//                             <p className="font-medium">{formatDate(selectedUser.subscription.startDate)}</p>
//                           </div>
//                         </div>
//                         <div className="flex items-center gap-3">
//                           <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
//                             <CalendarDays size={18} />
//                           </div>
//                           <div>
//                             <p className="text-xs text-gray-500">Expiry Date</p>
//                             <p className="font-medium">{formatDate(selectedUser.subscription.expiryDate)}</p>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                     <div className="flex items-center justify-between mb-3">
//                       <div className="flex items-center gap-2">
//                         <DataUsageIcon
//                           used={selectedUser.data_usage?.used || 0}
//                           total={selectedUser.data_usage?.total || 1}
//                           isUnlimited={selectedUser.isUnlimited}
//                         />
//                         <span className="font-medium">Data Consumption</span>
//                       </div>
//                       <span className="text-sm font-medium">
//                         {selectedUser.isUnlimited
//                           ? "Unlimited"
//                           : `${selectedUser.data_usage?.used || 0} ${selectedUser.data_usage?.unit || 'GB'} of ${selectedUser.data_usage?.total || 0} ${selectedUser.data_usage?.unit || 'GB'}`}
//                       </span>
//                     </div>
//                     <div className="mb-2">
//                       <DataUsageBar
//                         used={selectedUser.data_usage?.used || 0}
//                         total={selectedUser.data_usage?.total || 1}
//                         isUnlimited={selectedUser.isUnlimited}
//                       />
//                     </div>
//                     <div className="flex items-center justify-between text-xs text-gray-500">
//                       <span>0 {selectedUser.data_usage?.unit || 'GB'}</span>
//                       <span>{selectedUser.isUnlimited ? "∞" : `${selectedUser.data_usage?.total || 0} ${selectedUser.data_usage?.unit || 'GB'}`}</span>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             ) : (
//               <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center gap-3">
//                     <div className="p-2 rounded-lg bg-yellow-100 text-yellow-600">
//                       <AlertTriangle size={18} />
//                     </div>
//                     <div>
//                       <h3 className="font-medium text-gray-800">No Active Plan</h3>
//                       <p className="text-sm text-gray-500">This user doesn't have an active subscription</p>
//                     </div>
//                   </div>
//                   <button className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600">
//                     Assign Plan
//                   </button>
//                 </div>
//               </div>
//             )}

//             {/* Subscription History Card */}
//             <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
//               <div
//                 className="p-4 border-b border-gray-100 flex items-center justify-between cursor-pointer"
//                 onClick={() => toggleSection("history")}
//               >
//                 <h3 className="font-semibold text-gray-700 flex items-center gap-2">
//                   <History className="text-blue-500" size={18} />
//                   Subscription History
//                 </h3>
//                 {expandedSection === "history" ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
//               </div>
//               {expandedSection === "history" && (
//                 <div className="p-6">
//                   {selectedUser.history?.purchaseHistory?.length > 0 ? (
//                     <div className="space-y-8">
//                       {/* Customer Lifetime Value */}
//                       <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
//                         <h4 className="font-medium text-gray-700 mb-4 flex items-center gap-2">
//                           <CreditCard size={16} />
//                           Customer Lifetime Value
//                         </h4>
//                         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//                           <div className="bg-white p-3 rounded-lg shadow-sm">
//                             <p className="text-xs text-gray-500">Total Revenue</p>
//                             <p className="font-medium text-lg">{formatCurrency(selectedUser.totalRevenue)}</p>
//                           </div>
//                           <div className="bg-white p-3 rounded-lg shadow-sm">
//                             <p className="text-xs text-gray-500">Avg. Monthly Spend</p>
//                             <p className="font-medium text-lg">{formatCurrency(selectedUser.avgMonthlySpend)}</p>
//                           </div>
//                           <div className="bg-white p-3 rounded-lg shadow-sm">
//                             <p className="text-xs text-gray-500">Renewal Frequency</p>
//                             <p className="font-medium text-lg">{selectedUser.renewalFrequency}</p>
//                           </div>
//                           <div className="bg-white p-3 rounded-lg shadow-sm">
//                             <p className="text-xs text-gray-500">Loyalty Duration</p>
//                             <p className="font-medium text-lg">{selectedUser.loyaltyDuration} months</p>
//                           </div>
//                         </div>
//                       </div>

//                       {/* Plan Purchase Trends */}
//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                         <div>
//                           <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
//                             <BarChart2 size={16} />
//                             Annual Revenue Trend
//                           </h4>
//                           <div className="h-64 bg-gray-50 p-3 rounded-lg">
//                             <ResponsiveContainer width="100%" height="100%">
//                               <LineChart data={getChartData()}>
//                                 <CartesianGrid strokeDasharray="3 3" vertical={false} />
//                                 <XAxis dataKey="year" />
//                                 <YAxis />
//                                 <Tooltip formatter={(value) => [formatCurrency(value), "Revenue"]} />
//                                 <Line
//                                   type="monotone"
//                                   dataKey="revenue"
//                                   stroke="#3B82F6"
//                                   strokeWidth={2}
//                                   dot={{ r: 4 }}
//                                   activeDot={{ r: 6 }}
//                                 />
//                               </LineChart>
//                             </ResponsiveContainer>
//                           </div>
//                         </div>
//                         <div>
//                           <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
//                             <BarChart2 size={16} />
//                             Monthly Revenue Breakdown
//                           </h4>
//                           <div className="h-64 bg-gray-50 p-3 rounded-lg">
//                             <ResponsiveContainer width="100%" height="100%">
//                               <BarChart data={getMonthlyChartData()}>
//                                 <CartesianGrid strokeDasharray="3 3" vertical={false} />
//                                 <XAxis dataKey="month" />
//                                 <YAxis />
//                                 <Tooltip formatter={(value) => [formatCurrency(value), "Revenue"]} />
//                                 <Bar dataKey="revenue" fill="#8884d8" radius={[4, 4, 0, 0]} />
//                               </BarChart>
//                             </ResponsiveContainer>
//                           </div>
//                         </div>
//                       </div>

//                       {/* Plan Distribution */}
//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                         <div>
//                           <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
//                             <Package size={16} />
//                             Plan Distribution
//                           </h4>
//                           <div className="h-64 bg-gray-50 p-3 rounded-lg">
//                             <ResponsiveContainer width="100%" height="100%">
//                               <PieChart>
//                                 <Pie
//                                   data={getPlanDistributionData()}
//                                   cx="50%"
//                                   cy="50%"
//                                   labelLine={false}
//                                   outerRadius={80}
//                                   fill="#8884d8"
//                                   dataKey="value"
//                                   label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
//                                 >
//                                   {getPlanDistributionData().map((entry, index) => (
//                                     <Cell key={`cell-${index}`} fill={entry.color} />
//                                   ))}
//                                 </Pie>
//                                 <Tooltip formatter={(value, name) => [`${value} purchases`, name]} />
//                               </PieChart>
//                             </ResponsiveContainer>
//                           </div>
//                         </div>
//                         <div>
//                           <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
//                             <CreditCard size={16} />
//                             Payment Methods
//                           </h4>
//                           <div className="h-64 bg-gray-50 p-3 rounded-lg">
//                             <ResponsiveContainer width="100%" height="100%">
//                               <PieChart>
//                                 <Pie
//                                   data={getPaymentMethodData()}
//                                   cx="50%"
//                                   cy="50%"
//                                   labelLine={false}
//                                   outerRadius={80}
//                                   fill="#8884d8"
//                                   dataKey="value"
//                                   label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
//                                 >
//                                   {getPaymentMethodData().map((entry, index) => (
//                                     <Cell
//                                       key={`cell-${index}`}
//                                       fill={["#6366F1", "#3B82F6", "#10B981", "#F59E0B"][index % 4]}
//                                     />
//                                   ))}
//                                 </Pie>
//                                 <Tooltip formatter={(value, name) => [`${value} purchases`, name]} />
//                               </PieChart>
//                             </ResponsiveContainer>
//                           </div>
//                         </div>
//                       </div>

//                       {/* Plan Behavior Insights */}
//                       <div>
//                         <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
//                           <TrendingUp size={16} />
//                           Plan Behavior Insights
//                         </h4>
//                         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//                           <div className="bg-gray-50 p-3 rounded-lg">
//                             <p className="text-xs text-gray-500">Favorite Plan</p>
//                             <p className="font-medium">{getPlanBehavior().favoritePlan}</p>
//                           </div>
//                           <div className="bg-gray-50 p-3 rounded-lg">
//                             <p className="text-xs text-gray-500">Number of Upgrades</p>
//                             <p className="font-medium">{getPlanBehavior().upgrades}</p>
//                           </div>
//                           <div className="bg-gray-50 p-3 rounded-lg">
//                             <p className="text-xs text-gray-500">Plan Changes</p>
//                             <p className="font-medium">{getPlanBehavior().planChanges}</p>
//                           </div>
//                           <div className="bg-gray-50 p-3 rounded-lg">
//                             <p className="text-xs text-gray-500">Avg. Plan Duration</p>
//                             <p className="font-medium">{getPlanBehavior().avgDuration.toFixed(1)} months</p>
//                           </div>
//                         </div>
//                         <div className="mt-4 bg-gray-50 p-3 rounded-lg">
//                           <div className="flex items-center gap-2">
//                             <p className="text-xs text-gray-500">Spending Trend:</p>
//                             {getSpendingTrend() === "up" ? (
//                               <div className="flex items-center text-green-500">
//                                 <TrendingUp size={16} />
//                                 <span className="ml-1">Increasing</span>
//                               </div>
//                             ) : getSpendingTrend() === "down" ? (
//                               <div className="flex items-center text-red-500">
//                                 <TrendingDown size={16} />
//                                 <span className="ml-1">Decreasing</span>
//                               </div>
//                             ) : (
//                               <div className="flex items-center text-gray-500">
//                                 <Circle size={16} />
//                                 <span className="ml-1">Stable</span>
//                               </div>
//                             )}
//                           </div>
//                         </div>
//                       </div>

//                       {/* Purchase History */}
//                       <div>
//                         <div className="flex items-center justify-between mb-3">
//                           <h4 className="font-medium text-gray-700 flex items-center gap-2">
//                             <History size={16} />
//                             Detailed Purchase History
//                           </h4>
//                           <div className="flex items-center gap-2">
//                             <select
//                               className="border border-gray-200 rounded-lg px-2 py-1 text-sm"
//                               value={filterYear}
//                               onChange={(e) => setFilterYear(e.target.value)}
//                             >
//                               <option value="All">All Years</option>
//                               {[
//                                 ...new Set(
//                                   selectedUser.history.purchaseHistory.map((p) =>
//                                     new Date(p.purchase_date).getFullYear()
//                                   )
//                                 ),
//                               ]
//                                 .sort((a, b) => b - a)
//                                 .map((year) => (
//                                   <option key={year} value={year}>
//                                     {year}
//                                   </option>
//                                 ))}
//                             </select>
//                             <button
//                               className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
//                               onClick={() => exportToCSV(selectedUser.history)}
//                             >
//                               <Download size={14} />
//                               Export
//                             </button>
//                           </div>
//                         </div>
//                         <div className="overflow-x-auto">
//                           <table className="w-full text-sm">
//                             <thead>
//                               <tr className="bg-gray-100">
//                                 <th className="p-2 text-left">Plan</th>
//                                 <th className="p-2 text-left">Purchase Date</th>
//                                 <th className="p-2 text-left">Duration</th>
//                                 <th className="p-2 text-left">Price</th>
//                                 <th className="p-2 text-left">Status</th>
//                                 <th className="p-2 text-left">Details</th>
//                               </tr>
//                             </thead>
//                             <tbody>
//                               {getFilteredPurchaseHistory().map((purchase, index) => (
//                                 <tr
//                                   key={index}
//                                   className="border-b hover:bg-gray-50 cursor-pointer"
//                                   onClick={() => viewPurchaseDetails(purchase)}
//                                 >
//                                   <td className="p-2">
//                                     <div className="flex items-center gap-2">
//                                       <div
//                                         className="w-2 h-2 rounded-full"
//                                         style={{ backgroundColor: getPlanColor(purchase.plan?.name) }}
//                                       ></div>
//                                       {purchase.plan?.name || "N/A"}
//                                     </div>
//                                   </td>
//                                   <td className="p-2">{formatDate(purchase.purchase_date)}</td>
//                                   <td className="p-2">{purchase.duration || "N/A"}</td>
//                                   <td className="p-2 font-medium">${purchase.amount}</td>
//                                   <td className="p-2">
//                                     <span
//                                       className={`px-2 py-1 rounded-full text-xs ${
//                                         purchase.status === "Active"
//                                           ? "bg-green-100 text-green-700"
//                                           : "bg-red-100 text-red-700"
//                                       }`}
//                                     >
//                                       {purchase.status || "N/A"}
//                                     </span>
//                                   </td>
//                                   <td className="p-2">
//                                     <button className="text-blue-500 hover:text-blue-700">
//                                       <ArrowUpRight size={16} />
//                                     </button>
//                                   </td>
//                                 </tr>
//                               ))}
//                             </tbody>
//                           </table>
//                         </div>
//                       </div>
//                     </div>
//                   ) : (
//                     <div className="text-center py-8 text-gray-500">
//                       <Package size={24} className="mx-auto mb-2 text-gray-400" />
//                       <p>No subscription history found</p>
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Edit Profile Modal */}
//       {isEditing && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//           <div className="bg-white rounded-xl max-w-md w-full p-6">
//             <div className="flex items-center justify-between mb-4">
//               <h3 className="text-lg font-bold text-gray-800">Edit User Profile</h3>
//               <button
//                 onClick={handleEditToggle}
//                 className="text-gray-400 hover:text-gray-600"
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
//                 <label className="block text-sm text-gray-600">Full Name</label>
//                 <input
//                   type="text"
//                   name="fullName"
//                   value={editForm.fullName}
//                   onChange={handleEditChange}
//                   className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm text-gray-600">Phone Number</label>
//                 <input
//                   type="text"
//                   name="phone"
//                   value={editForm.phone}
//                   onChange={handleEditChange}
//                   className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//                   pattern="(\+254|0)[0-9]{9}"
//                   title="Phone number must be in the format +254XXXXXXXXX or 07XXXXXXXX"
//                   required
//                 />
//               </div>
//               <div className="flex justify-end gap-2">
//                 <button
//                   type="button"
//                   onClick={handleEditToggle}
//                   className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
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
//           <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
//             <div className="p-6">
//               <div className="flex items-center justify-between mb-4">
//                 <h3 className="text-lg font-bold text-gray-800">Purchase Details</h3>
//                 <button
//                   onClick={closePurchaseDetails}
//                   className="text-gray-400 hover:text-gray-600"
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
//                   <p className="text-sm text-gray-500">Plan</p>
//                   <p className="font-medium">{selectedPurchase.plan?.name || "N/A"}</p>
//                 </div>
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <p className="text-sm text-gray-500">Purchase Date</p>
//                     <p className="font-medium">{formatDate(selectedPurchase.purchase_date)}</p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-500">Duration</p>
//                     <p className="font-medium">{selectedPurchase.duration || "N/A"}</p>
//                   </div>
//                 </div>
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <p className="text-sm text-gray-500">Price</p>
//                     <p className="font-medium">${selectedPurchase.amount}</p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-500">Status</p>
//                     <p className="font-medium">
//                       <span
//                         className={`px-2 py-1 rounded-full text-xs ${
//                           selectedPurchase.status === "Active"
//                             ? "bg-green-100 text-green-700"
//                             : "bg-red-100 text-red-700"
//                         }`}
//                       >
//                         {selectedPurchase.status || "N/A"}
//                       </span>
//                     </p>
//                   </div>
//                 </div>
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <p className="text-sm text-gray-500">Payment Method</p>
//                     <p className="font-medium">{selectedPurchase.payment_method || "N/A"}</p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-500">Invoice Number</p>
//                     <p className="font-medium">{selectedPurchase.invoice_number || "N/A"}</p>
//                   </div>
//                 </div>
//                 {selectedPurchase.status === "Expired" && (
//                   <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
//                     <div className="flex items-center gap-2 text-yellow-700">
//                       <AlertTriangle size={16} />
//                       <p className="text-sm">
//                         This plan expired on {formatDate(selectedUser.subscription?.expiryDate)}
//                       </p>
//                     </div>
//                   </div>
//                 )}
//               </div>
//               <div className="mt-6 flex justify-end">
//                 <button
//                   onClick={closePurchaseDetails}
//                   className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
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

// export default UserProfilePage;









import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import api from "../../../api";
import { useAuth } from "../../context/AuthContext";
import { FaSpinner } from "react-icons/fa";

const UserProfilePage = () => {
  const { isAuthenticated, authLoading } = useAuth();
  const today = new Date();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [expandedSection, setExpandedSection] = useState(null);
  const [filterYear, setFilterYear] = useState("All");
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ fullName: "", phone: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(3); // Keep 3 users per page for UI
  const [activeFilter, setActiveFilter] = useState("all"); // 'all', 'active', 'inactive'

  // Fetch users on mount
  useEffect(() => {
    const fetchUsers = async () => {
      if (!isAuthenticated) {
        setError("Please log in to view user profiles.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        let allUsers = [];
        let nextUrl = "/api/user_management/profiles/?page_size=50"; // Request 50 users per page for efficiency

        // Fetch all pages of users
        while (nextUrl) {
          const response = await api.get(nextUrl);
          const usersData = response.data.results || response.data;
          allUsers = [...allUsers, ...usersData];
          nextUrl = response.data.next; // Update to next page URL or null
        }

        const enrichedUsers = allUsers.map(enrichUser);
        setUsers(enrichedUsers);
        setSelectedUser(enrichedUsers[0] || null);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load users.");
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading && isAuthenticated) {
      fetchUsers();
    }
  }, [isAuthenticated, authLoading]);

  // Filter users based on active status
  useEffect(() => {
    let filtered = users;
    if (activeFilter === 'active') {
      filtered = users.filter(user => user.active);
    } else if (activeFilter === 'inactive') {
      filtered = users.filter(user => !user.active);
    }
    setFilteredUsers(filtered);
    setCurrentPage(1); // Reset to first page when filter changes
  }, [users, activeFilter]);

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Enrich user data
  const enrichUser = (user) => {
    const expiry = user.subscription?.expiryDate ? new Date(user.subscription.expiryDate) : null;
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
      Math.floor((today - firstPurchase) / ( organizar1000 * 60 * 60 * 24 * 30)) : 0;

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
  };

  const handleView = async (user) => {
    try {
      const response = await api.get(`/api/user_management/profiles/${user.id}/`);
      const enrichedUser = enrichUser(response.data);
      setSelectedUser(enrichedUser);
      setExpandedSection(null);
      setFilterYear("All");
      setSelectedPurchase(null);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load user profile.");
    }
  };

  const handleEditToggle = () => {
    if (!isEditing) {
      setEditForm({
        fullName: selectedUser.full_name,
        phone: selectedUser.phonenumber,
      });
    }
    setIsEditing(!isEditing);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.patch(`/api/user_management/profiles/${selectedUser.id}/`, {
        full_name: editForm.fullName,
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
      setError(err.response?.data?.error || "Failed to update user profile.");
    }
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
    setSelectedPurchase(null);
  };

  const DataUsageBar = ({ used, total, isUnlimited }) => {
    if (isUnlimited) {
      return (
        <div className="w-full bg-gradient-to-r from-purple-100 to-blue-100 rounded-full h-3 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-blue-500 to-teal-400 opacity-70 animate-pulse rounded-full"></div>
        </div>
      );
    }

    const percentage = Math.min((used / parseFloat(total || 1)) * 100, 100);
    let colorClass = "bg-green-500";
    if (percentage > 80) colorClass = "bg-yellow-500";
    if (percentage > 95) colorClass = "bg-red-500";

    return (
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className={`${colorClass} h-3 rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    );
  };

  const DataUsageIcon = ({ used, total, isUnlimited }) => {
    if (isUnlimited) return <Zap className="text-purple-500" size={18} />;
    const percentage = used / parseFloat(total || 1);
    if (percentage < 0.3) return <BatteryFull className="text-green-500" size={18} />;
    if (percentage < 0.7) return <BatteryMedium className="text-yellow-500" size={18} />;
    return <BatteryLow className="text-red-500" size={18} />;
  };

  const PaymentStatusIcon = ({ status }) => {
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
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: "numeric", month: "short", day: "numeric" };
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

  const exportToCSV = (history) => {
    if (!history?.purchaseHistory) return;
    
    const headers = ["Plan,Purchase Date,Duration,Price,Status,Payment Method,Invoice Number"];
    const rows = history.purchaseHistory.map((purchase) =>
      [
        purchase.plan?.name || "N/A",
        formatDate(purchase.purchase_date),
        purchase.duration || "N/A",
        `$${purchase.amount}`,
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
    a.setAttribute("download", `${selectedUser.full_name}_subscription_history.csv`);
    a.click();
  };

  const getFilteredPurchaseHistory = () => {
    if (!selectedUser?.history?.purchaseHistory) return [];
    if (filterYear === "All") return selectedUser.history.purchaseHistory;
    return selectedUser.history.purchaseHistory.filter(
      (purchase) => new Date(purchase.purchase_date).getFullYear().toString() === filterYear
    );
  };

  const getChartData = () => {
    if (!selectedUser?.history?.purchaseHistory) return [];
    const purchasesByYear = {};
    selectedUser.history.purchaseHistory.forEach((purchase) => {
      const year = new Date(purchase.purchase_date).getFullYear();
      if (!purchasesByYear[year]) purchasesByYear[year] = 0;
      purchasesByYear[year] += purchase.amount;
    });
    return Object.keys(purchasesByYear).map((year) => ({
      year,
      revenue: purchasesByYear[year],
    }));
  };

  const getMonthlyChartData = () => {
    if (!selectedUser?.history?.purchaseHistory) return [];
    const monthlyData = {};
    selectedUser.history.purchaseHistory.forEach((purchase) => {
      const date = new Date(purchase.purchase_date);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (!monthlyData[monthYear]) monthlyData[monthYear] = 0;
      monthlyData[monthYear] += purchase.amount;
    });

    return Object.keys(monthlyData).map((key) => {
      const [year, month] = key.split("-");
      return {
        month: `${new Date(year, month - 1).toLocaleString("default", { month: "short" })} ${year}`,
        revenue: monthlyData[key],
      };
    });
  };

  const getPlanDistributionData = () => {
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
  };

  const getPaymentMethodData = () => {
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
  };

  const getPlanColor = (plan) => {
    const colors = {
      Enterprise: "#6366F1",
      Business: "#3B82F6",
      Residential: "#10B981",
      Promotional: "#F59E0B",
      Unknown: "#6B7280",
    };
    return colors[plan] || "#6B7280";
  };

  const getPlanBehavior = () => {
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
  };

  const getSpendingTrend = () => {
    if (!selectedUser?.history?.purchaseHistory || selectedUser.history.purchaseHistory.length < 2) return "stable";
    const firstPrice = selectedUser.history.purchaseHistory[0].amount;
    const lastPrice = selectedUser.history.purchaseHistory[selectedUser.history.purchaseHistory.length - 1].amount;
    return lastPrice > firstPrice ? "up" : lastPrice < firstPrice ? "down" : "stable";
  };

  const viewPurchaseDetails = (purchase) => {
    setSelectedPurchase(purchase);
  };

  const closePurchaseDetails = () => {
    setSelectedPurchase(null);
  };

  if (authLoading || isLoading) {
    return (
      <div className="p-8 max-w-7xl mx-auto flex justify-center items-center min-h-screen">
        <FaSpinner className="animate-spin text-4xl text-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <p className="text-center text-red-500">Please log in to access user profiles.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>
      )}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">User Management</h1>
          <p className="text-gray-500">Manage and view user details and subscriptions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User List */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="font-semibold text-gray-700 flex items-center gap-2">
              <UserIcon className="text-blue-500" size={18} />
              Users ({filteredUsers.filter((u) => u.active).length}/{filteredUsers.length})
            </h2>
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-2 py-1 text-xs rounded-md ${activeFilter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                All
              </button>
              <button
                onClick={() => setActiveFilter('active')}
                className={`px-2 py-1 text-xs rounded-md ${activeFilter === 'active' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                Active
              </button>
              <button
                onClick={() => setActiveFilter('inactive')}
                className={`px-2 py-1 text-xs rounded-md ${activeFilter === 'inactive' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                Inactive
              </button>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {currentUsers.length > 0 ? (
              currentUsers.map((user) => (
                <div
                  key={user.id}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                    selectedUser?.id === user.id ? "bg-blue-50" : ""
                  }`}
                  onClick={() => handleView(user)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          user.active ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        <User size={20} />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800">{user.full_name}</h3>
                        <p className="text-sm text-gray-500">
                          {user.hasPlan ? `${user.subscription?.plan || 'No Plan'} Plan` : 'No Plan'}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="text-gray-400" size={18} />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        user.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}
                    >
                      {user.active ? "Active" : "Inactive"}
                    </span>
                    <span className="text-gray-500">{user.phonenumber}</span>
                  </div>
                  {!user.hasPlan && (
                    <div className="mt-2 flex items-center text-xs text-yellow-700">
                      <AlertTriangle size={14} className="mr-1" />
                      <span>No active subscription</span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">
                No users found
              </div>
            )}
          </div>
          {filteredUsers.length > usersPerPage && (
            <div className="p-4 border-t border-gray-100 flex items-center justify-between">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-2 rounded-md ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-md ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                    selectedUser.active ? "bg-gradient-to-br from-green-100 to-teal-100" : "bg-gradient-to-br from-gray-100 to-gray-200"
                  }`}>
                    <User className={selectedUser.active ? "text-green-600" : "text-gray-500"} size={28} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">{selectedUser.full_name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          selectedUser.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}
                      >
                        {selectedUser.active ? "Active" : "Inactive"}
                      </span>
                      {selectedUser.hasPlan ? (
                        <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                          {selectedUser.subscription?.plan} Plan
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700">
                          No Active Plan
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  className="text-gray-400 hover:text-gray-600"
                  onClick={handleEditToggle}
                >
                  <MoreVertical size={18} />
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Phone size={16} />
                    <span className="text-xs">Phone</span>
                  </div>
                  <p className="font-medium mt-1">{selectedUser.phonenumber}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-500">
                    <HardDrive size={16} />
                    <span className="text-xs">Device</span>
                  </div>
                  <p className="font-medium mt-1">{selectedUser.device}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Shield size={16} />
                    <span className="text-xs">Location</span>
                  </div>
                  <p className="font-medium mt-1">{selectedUser.location}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Clock size={16} />
                    <span className="text-xs">Last Login</span>
                  </div>
                  <p className="font-medium mt-1">
                    {selectedUser.last_login ? new Date(selectedUser.last_login).toLocaleString() : "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Current Plan Card */}
            {selectedUser.hasPlan ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div
                  className="p-4 border-b border-gray-100 flex items-center justify-between cursor-pointer"
                  onClick={() => toggleSection("plan")}
                >
                  <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                    <BarChart2 className="text-blue-500" size={18} />
                    Current Plan
                  </h3>
                  {expandedSection === "plan" ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
                {expandedSection === "plan" && selectedUser.subscription && (
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                            <CreditCard size={18} />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Plan Type</p>
                            <p className="font-medium">{selectedUser.subscription.plan}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                            <PaymentStatusIcon status={selectedUser.paymentStatus} />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Payment Status</p>
                            <p className="font-medium capitalize">{selectedUser.paymentStatus}</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-green-100 text-green-600">
                            <CalendarDays size={18} />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Start Date</p>
                            <p className="font-medium">{formatDate(selectedUser.subscription.startDate)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
                            <CalendarDays size={18} />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Expiry Date</p>
                            <p className="font-medium">{formatDate(selectedUser.subscription.expiryDate)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <DataUsageIcon
                          used={selectedUser.data_usage?.used || 0}
                          total={selectedUser.data_usage?.total || 1}
                          isUnlimited={selectedUser.isUnlimited}
                        />
                        <span className="font-medium">Data Consumption</span>
                      </div>
                      <span className="text-sm font-medium">
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
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>0 {selectedUser.data_usage?.unit || 'GB'}</span>
                      <span>{selectedUser.isUnlimited ? "∞" : `${selectedUser.data_usage?.total || 0} ${selectedUser.data_usage?.unit || 'GB'}`}</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-yellow-100 text-yellow-600">
                      <AlertTriangle size={18} />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">No Active Plan</h3>
                      <p className="text-sm text-gray-500">This user doesn't have an active subscription</p>
                    </div>
                  </div>
                  <button className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600">
                    Assign Plan
                  </button>
                </div>
              </div>
            )}

            {/* Subscription History Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div
                className="p-4 border-b border-gray-100 flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection("history")}
              >
                <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                  <History className="text-blue-500" size={18} />
                  Subscription History
                </h3>
                {expandedSection === "history" ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>
              {expandedSection === "history" && (
                <div className="p-6">
                  {selectedUser.history?.purchaseHistory?.length > 0 ? (
                    <div className="space-y-8">
                      {/* Customer Lifetime Value */}
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-700 mb-4 flex items-center gap-2">
                          <CreditCard size={16} />
                          Customer Lifetime Value
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="bg-white p-3 rounded-lg shadow-sm">
                            <p className="text-xs text-gray-500">Total Revenue</p>
                            <p className="font-medium text-lg">{formatCurrency(selectedUser.totalRevenue)}</p>
                          </div>
                          <div className="bg-white p-3 rounded-lg shadow-sm">
                            <p className="text-xs text-gray-500">Avg. Monthly Spend</p>
                            <p className="font-medium text-lg">{formatCurrency(selectedUser.avgMonthlySpend)}</p>
                          </div>
                          <div className="bg-white p-3 rounded-lg shadow-sm">
                            <p className="text-xs text-gray-500">Renewal Frequency</p>
                            <p className="font-medium text-lg">{selectedUser.renewalFrequency}</p>
                          </div>
                          <div className="bg-white p-3 rounded-lg shadow-sm">
                            <p className="text-xs text-gray-500">Loyalty Duration</p>
                            <p className="font-medium text-lg">{selectedUser.loyaltyDuration} months</p>
                          </div>
                        </div>
                      </div>

                      {/* Plan Purchase Trends */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                            <BarChart2 size={16} />
                            Annual Revenue Trend
                          </h4>
                          <div className="h-64 bg-gray-50 p-3 rounded-lg">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={getChartData()}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="year" />
                                <YAxis />
                                <Tooltip formatter={(value) => [formatCurrency(value), "Revenue"]} />
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
                          <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                            <BarChart2 size={16} />
                            Monthly Revenue Breakdown
                          </h4>
                          <div className="h-64 bg-gray-50 p-3 rounded-lg">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={getMonthlyChartData()}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip formatter={(value) => [formatCurrency(value), "Revenue"]} />
                                <Bar dataKey="revenue" fill="#8884d8" radius={[4, 4, 0, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>

                      {/* Plan Distribution */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                            <Package size={16} />
                            Plan Distribution
                          </h4>
                          <div className="h-64 bg-gray-50 p-3 rounded-lg">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={getPlanDistributionData()}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={false}
                                  outerRadius={80}
                                  fill="#8884d8"
                                  dataKey="value"
                                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                  {getPlanDistributionData().map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                                </Pie>
                                <Tooltip formatter={(value, name) => [`${value} purchases`, name]} />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                            <CreditCard size={16} />
                            Payment Methods
                          </h4>
                          <div className="h-64 bg-gray-50 p-3 rounded-lg">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={getPaymentMethodData()}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={false}
                                  outerRadius={80}
                                  fill="#8884d8"
                                  dataKey="value"
                                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                  {getPaymentMethodData().map((entry, index) => (
                                    <Cell
                                      key={`cell-${index}`}
                                      fill={["#6366F1", "#3B82F6", "#10B981", "#F59E0B"][index % 4]}
                                    />
                                  ))}
                                </Pie>
                                <Tooltip formatter={(value, name) => [`${value} purchases`, name]} />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>

                      {/* Plan Behavior Insights */}
                      <div>
                        <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                          <TrendingUp size={16} />
                          Plan Behavior Insights
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-500">Favorite Plan</p>
                            <p className="font-medium">{getPlanBehavior().favoritePlan}</p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-500">Number of Upgrades</p>
                            <p className="font-medium">{getPlanBehavior().upgrades}</p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-500">Plan Changes</p>
                            <p className="font-medium">{getPlanBehavior().planChanges}</p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-500">Avg. Plan Duration</p>
                            <p className="font-medium">{getPlanBehavior().avgDuration.toFixed(1)} months</p>
                          </div>
                        </div>
                        <div className="mt-4 bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-gray-500">Spending Trend:</p>
                            {getSpendingTrend() === "up" ? (
                              <div className="flex items-center text-green-500">
                                <TrendingUp size={16} />
                                <span className="ml-1">Increasing</span>
                              </div>
                            ) : getSpendingTrend() === "down" ? (
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

                      {/* Purchase History */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-700 flex items-center gap-2">
                            <History size={16} />
                            Detailed Purchase History
                          </h4>
                          <div className="flex items-center gap-2">
                            <select
                              className="border border-gray-200 rounded-lg px-2 py-1 text-sm"
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
                              className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
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
                              <tr className="bg-gray-100">
                                <th className="p-2 text-left">Plan</th>
                                <th className="p-2 text-left">Purchase Date</th>
                                <th className="p-2 text-left">Duration</th>
                                <th className="p-2 text-left">Price</th>
                                <th className="p-2 text-left">Status</th>
                                <th className="p-2 text-left">Details</th>
                              </tr>
                            </thead>
                            <tbody>
                              {getFilteredPurchaseHistory().map((purchase, index) => (
                                <tr
                                  key={index}
                                  className="border-b hover:bg-gray-50 cursor-pointer"
                                  onClick={() => viewPurchaseDetails(purchase)}
                                >
                                  <td className="p-2">
                                    <div className="flex items-center gap-2">
                                      <div
                                        className="w-2 h-2 rounded-full"
                                        style={{ backgroundColor: getPlanColor(purchase.plan?.name) }}
                                      ></div>
                                      {purchase.plan?.name || "N/A"}
                                    </div>
                                  </td>
                                  <td className="p-2">{formatDate(purchase.purchase_date)}</td>
                                  <td className="p-2">{purchase.duration || "N/A"}</td>
                                  <td className="p-2 font-medium">${purchase.amount}</td>
                                  <td className="p-2">
                                    <span
                                      className={`px-2 py-1 rounded-full text-xs ${
                                        purchase.status === "Active"
                                          ? "bg-green-100 text-green-700"
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
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Package size={24} className="mx-auto mb-2 text-gray-400" />
                      <p>No subscription history found</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Edit User Profile</h3>
              <button
                onClick={handleEditToggle}
                className="text-gray-400 hover:text-gray-600"
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
                <label className="block text-sm text-gray-600">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={editForm.fullName}
                  onChange={handleEditChange}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  value={editForm.phone}
                  onChange={handleEditChange}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  pattern="(\+254|0)[0-9]{9}"
                  title="Phone number must be in the format +254XXXXXXXXX or 07XXXXXXXX"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleEditToggle}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
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
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">Purchase Details</h3>
                <button
                  onClick={closePurchaseDetails}
                  className="text-gray-400 hover:text-gray-600"
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
                  <p className="text-sm text-gray-500">Plan</p>
                  <p className="font-medium">{selectedPurchase.plan?.name || "N/A"}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Purchase Date</p>
                    <p className="font-medium">{formatDate(selectedPurchase.purchase_date)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Duration</p>
                    <p className="font-medium">{selectedPurchase.duration || "N/A"}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Price</p>
                    <p className="font-medium">${selectedPurchase.amount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p className="font-medium">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          selectedPurchase.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {selectedPurchase.status || "N/A"}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Payment Method</p>
                    <p className="font-medium">{selectedPurchase.payment_method || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Invoice Number</p>
                    <p className="font-medium">{selectedPurchase.invoice_number || "N/A"}</p>
                  </div>
                </div>
                {selectedPurchase.status === "Expired" && (
                  <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-2 text-yellow-700">
                      <AlertTriangle size={16} />
                      <p className="text-sm">
                        This plan expired on {formatDate(selectedUser.subscription?.expiryDate)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={closePurchaseDetails}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
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

export default UserProfilePage;