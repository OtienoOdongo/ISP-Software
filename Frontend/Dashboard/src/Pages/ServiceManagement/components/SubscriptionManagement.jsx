









// import React, { useState, useMemo, useCallback } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   Users, Eye, Play, Pause, Trash2, Filter, Search,
//   Check, X, Clock, AlertTriangle, Wifi, Cable, Download, Upload, RefreshCw, MoreVertical
// } from "lucide-react";
// import { getThemeClasses, EnhancedSelect, ConfirmationModal } from "../../../components/ServiceManagement/Shared/components";
// import { formatNumber, formatTime, formatBytes } from "../../../components/ServiceManagement/Shared/utils";
// import api from "../../../api";

// const SubscriptionManagement = ({ subscriptions, plans, routers, onRefresh, theme }) => {
//   const themeClasses = getThemeClasses(theme);
//   const [filterStatus, setFilterStatus] = useState("all");
//   const [filterPlan, setFilterPlan] = useState("all");
//   const [filterRouter, setFilterRouter] = useState("all");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedSubscription, setSelectedSubscription] = useState(null);
//   const [showDetails, setShowDetails] = useState(false);
//   const [actionLoading, setActionLoading] = useState(new Set());
//   const [sortConfig, setSortConfig] = useState({ key: 'start_date', direction: 'desc' });

//   const filteredSubscriptions = useMemo(() => {
//     let filtered = subscriptions.filter(sub => {
//       const matchesStatus = filterStatus === "all" || sub.status === filterStatus;
//       const matchesPlan = filterPlan === "all" || sub.internet_plan?.id?.toString() === filterPlan;
//       const matchesRouter = filterRouter === "all" || sub.router?.id?.toString() === filterRouter;
//       const matchesSearch = searchTerm === "" || 
//         sub.client?.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         sub.transaction_reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         sub.mac_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         sub.client?.user?.phonenumber?.includes(searchTerm);
      
//       return matchesStatus && matchesPlan && matchesRouter && matchesSearch;
//     });

//     // Apply sorting
//     if (sortConfig.key) {
//       filtered.sort((a, b) => {
//         let aValue = a[sortConfig.key];
//         let bValue = b[sortConfig.key];

//         // Handle nested properties
//         if (sortConfig.key === 'client') {
//           aValue = a.client?.user?.username;
//           bValue = b.client?.user?.username;
//         } else if (sortConfig.key === 'internet_plan') {
//           aValue = a.internet_plan?.name;
//           bValue = b.internet_plan?.name;
//         }

//         if (aValue < bValue) {
//           return sortConfig.direction === 'asc' ? -1 : 1;
//         }
//         if (aValue > bValue) {
//           return sortConfig.direction === 'asc' ? 1 : -1;
//         }
//         return 0;
//       });
//     }

//     return filtered;
//   }, [subscriptions, filterStatus, filterPlan, filterRouter, searchTerm, sortConfig]);

//   const handleSort = useCallback((key) => {
//     setSortConfig(current => ({
//       key,
//       direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
//     }));
//   }, []);

//   const handleActivation = useCallback(async (subscriptionId) => {
//     setActionLoading(prev => new Set(prev).add(subscriptionId));
//     try {
//       await api.post(`/api/internet_plans/subscriptions/${subscriptionId}/activate/`);
//       onRefresh();
//     } catch (error) {
//       console.error("Activation failed:", error);
//     } finally {
//       setActionLoading(prev => {
//         const newSet = new Set(prev);
//         newSet.delete(subscriptionId);
//         return newSet;
//       });
//     }
//   }, [onRefresh]);

//   const handleStatusChange = useCallback(async (subscriptionId, newStatus) => {
//     setActionLoading(prev => new Set(prev).add(subscriptionId));
//     try {
//       await api.patch(`/api/internet_plans/subscriptions/${subscriptionId}/`, {
//         status: newStatus
//       });
//       onRefresh();
//     } catch (error) {
//       console.error("Status update failed:", error);
//     } finally {
//       setActionLoading(prev => {
//         const newSet = new Set(prev);
//         newSet.delete(subscriptionId);
//         return newSet;
//       });
//     }
//   }, [onRefresh]);

//   const handleRefreshStatus = useCallback(async (subscriptionId) => {
//     setActionLoading(prev => new Set(prev).add(subscriptionId));
//     try {
//       await api.post(`/api/internet_plans/subscriptions/${subscriptionId}/refresh/`);
//       onRefresh();
//     } catch (error) {
//       console.error("Status refresh failed:", error);
//     } finally {
//       setActionLoading(prev => {
//         const newSet = new Set(prev);
//         newSet.delete(subscriptionId);
//         return newSet;
//       });
//     }
//   }, [onRefresh]);

//   const getSortIcon = (key) => {
//     if (sortConfig.key !== key) return null;
//     return sortConfig.direction === 'asc' ? '↑' : '↓';
//   };

//   return (
//     <div className="space-y-6">
//       {/* Enhanced Filters */}
//       <EnhancedFilters
//         searchTerm={searchTerm}
//         filterStatus={filterStatus}
//         filterPlan={filterPlan}
//         filterRouter={filterRouter}
//         plans={plans}
//         routers={routers}
//         onSearchChange={setSearchTerm}
//         onStatusChange={setFilterStatus}
//         onPlanChange={setFilterPlan}
//         onRouterChange={setFilterRouter}
//         resultCount={filteredSubscriptions.length}
//         theme={theme}
//       />

//       {/* Subscriptions Table */}
//       <div className={`rounded-xl shadow-lg border overflow-hidden ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//         <div className="overflow-x-auto">
//           <SubscriptionTable
//             subscriptions={filteredSubscriptions}
//             sortConfig={sortConfig}
//             actionLoading={actionLoading}
//             onSort={handleSort}
//             onShowDetails={(sub) => {
//               setSelectedSubscription(sub);
//               setShowDetails(true);
//             }}
//             onActivate={handleActivation}
//             onStatusChange={handleStatusChange}
//             onRefreshStatus={handleRefreshStatus}
//             getSortIcon={getSortIcon}
//             theme={theme}
//           />
//         </div>
        
//         {filteredSubscriptions.length === 0 && (
//           <EmptySubscriptionState theme={theme} />
//         )}
//       </div>

//       {/* Subscription Details Modal */}
//       <AnimatePresence>
//         {showDetails && selectedSubscription && (
//           <SubscriptionDetails
//             subscription={selectedSubscription}
//             onClose={() => {
//               setShowDetails(false);
//               setSelectedSubscription(null);
//             }}
//             theme={theme}
//           />
//         )}
//       </AnimatePresence>
//     </div>
//   );
// };

// // Enhanced Filters Component
// const EnhancedFilters = ({
//   searchTerm,
//   filterStatus,
//   filterPlan,
//   filterRouter,
//   plans,
//   routers,
//   onSearchChange,
//   onStatusChange,
//   onPlanChange,
//   onRouterChange,
//   resultCount,
//   theme
// }) => {
//   const themeClasses = getThemeClasses(theme);

//   return (
//     <div className={`p-4 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//       <div className="flex flex-col lg:flex-row gap-4 items-end">
//         <div className="flex-1">
//           <div className="relative">
//             <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${themeClasses.text.tertiary}`} />
//             <input
//               type="text"
//               placeholder="Search by client, phone, reference, or MAC address..."
//               value={searchTerm}
//               onChange={(e) => onSearchChange(e.target.value)}
//               className={`w-full pl-10 pr-4 py-2 rounded-lg border text-sm ${themeClasses.input}`}
//             />
//           </div>
//         </div>
        
//         <div className="flex flex-wrap gap-4">
//           <div className="w-40">
//             <EnhancedSelect
//               value={filterStatus}
//               onChange={onStatusChange}
//               options={[
//                 { value: "all", label: "All Status" },
//                 { value: "active", label: "Active" },
//                 { value: "pending", label: "Pending" },
//                 { value: "suspended", label: "Suspended" },
//                 { value: "expired", label: "Expired" },
//                 { value: "cancelled", label: "Cancelled" },
//               ]}
//               theme={theme}
//             />
//           </div>
          
//           <div className="w-48">
//             <EnhancedSelect
//               value={filterPlan}
//               onChange={onPlanChange}
//               options={[
//                 { value: "all", label: "All Plans" },
//                 ...plans.map(plan => ({ value: plan.id.toString(), label: plan.name }))
//               ]}
//               theme={theme}
//             />
//           </div>

//           <div className="w-48">
//             <EnhancedSelect
//               value={filterRouter}
//               onChange={onRouterChange}
//               options={[
//                 { value: "all", label: "All Routers" },
//                 ...routers.map(router => ({ value: router.id.toString(), label: router.name }))
//               ]}
//               theme={theme}
//             />
//           </div>
//         </div>

//         <div className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
//           {resultCount} subscription(s) found
//         </div>
//       </div>
//     </div>
//   );
// };

// // Subscription Table Component
// const SubscriptionTable = ({
//   subscriptions,
//   sortConfig,
//   actionLoading,
//   onSort,
//   onShowDetails,
//   onActivate,
//   onStatusChange,
//   onRefreshStatus,
//   getSortIcon,
//   theme
// }) => {
//   const themeClasses = getThemeClasses(theme);
//   const columns = [
//     { key: 'client', label: 'Client', sortable: true },
//     { key: 'internet_plan', label: 'Plan', sortable: true },
//     { key: 'access_method', label: 'Access', sortable: false },
//     { key: 'status', label: 'Status', sortable: true },
//     { key: 'activation', label: 'Activation', sortable: false },
//     { key: 'remaining', label: 'Remaining', sortable: false },
//     { key: 'actions', label: 'Actions', sortable: false }
//   ];

//   return (
//     <table className="min-w-full divide-y text-sm">
//       <thead className={theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}>
//         <tr>
//           {columns.map((column) => (
//             <th 
//               key={column.key}
//               className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${themeClasses.text.secondary} ${
//                 column.sortable ? 'cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600' : ''
//               }`}
//               onClick={() => column.sortable && onSort(column.key)}
//             >
//               <div className="flex items-center gap-1">
//                 {column.label}
//                 {column.sortable && (
//                   <span className="text-xs">{getSortIcon(column.key)}</span>
//                 )}
//               </div>
//             </th>
//           ))}
//         </tr>
//       </thead>
//       <tbody className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
//         {subscriptions.map((subscription) => (
//           <SubscriptionRow
//             key={subscription.id}
//             subscription={subscription}
//             actionLoading={actionLoading}
//             onShowDetails={onShowDetails}
//             onActivate={onActivate}
//             onStatusChange={onStatusChange}
//             onRefreshStatus={onRefreshStatus}
//             theme={theme}
//           />
//         ))}
//       </tbody>
//     </table>
//   );
// };

// // Subscription Row Component
// const SubscriptionRow = ({
//   subscription,
//   actionLoading,
//   onShowDetails,
//   onActivate,
//   onStatusChange,
//   onRefreshStatus,
//   theme
// }) => {
//   const themeClasses = getThemeClasses(theme);
//   const activationStatus = getActivationStatus(subscription);
//   const ActivationIcon = activationStatus.icon;
//   const isLoading = actionLoading.has(subscription.id);

//   return (
//     <tr className={`hover:${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'} transition-colors`}>
//       <td className="px-4 py-4 whitespace-nowrap">
//         <div>
//           <div className="font-medium text-gray-900 dark:text-white">
//             {subscription.client?.user?.username || 'Unknown'}
//           </div>
//           <div className="text-xs text-gray-500 space-y-1">
//             {subscription.client?.user?.phonenumber && (
//               <div>{subscription.client.user.phonenumber}</div>
//             )}
//             {subscription.mac_address && (
//               <div className="font-mono">{subscription.mac_address}</div>
//             )}
//           </div>
//         </div>
//       </td>
      
//       <td className="px-4 py-4 whitespace-nowrap">
//         <div className="text-sm font-medium text-gray-900 dark:text-white">
//           {subscription.internet_plan?.name || 'No Plan'}
//         </div>
//         <div className="text-xs text-gray-500 flex items-center gap-1">
//           {subscription.access_method === 'hotspot' ? (
//             <Wifi className="w-3 h-3 text-blue-500" />
//           ) : (
//             <Cable className="w-3 h-3 text-green-500" />
//           )}
//           {subscription.access_method}
//         </div>
//       </td>
      
//       <td className="px-4 py-4 whitespace-nowrap">
//         {subscription.access_method === 'hotspot' ? (
//           <Wifi className="w-5 h-5 text-blue-600" title="Hotspot" />
//         ) : (
//           <Cable className="w-5 h-5 text-green-600" title="PPPoE" />
//         )}
//       </td>
      
//       <td className="px-4 py-4 whitespace-nowrap">
//         <StatusBadge status={subscription.status} />
//       </td>
      
//       <td className="px-4 py-4 whitespace-nowrap">
//         <div className={`flex items-center text-xs ${activationStatus.color}`}>
//           <ActivationIcon className="w-3 h-3 mr-1" />
//           {activationStatus.text}
//         </div>
//         {subscription.activation_error && (
//           <div className="text-xs text-red-600 mt-1 truncate max-w-xs" title={subscription.activation_error}>
//             {subscription.activation_error}
//           </div>
//         )}
//       </td>
      
//       <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
//         <div>Data: {subscription.remaining_data_display || subscription.get_remaining_data_display?.() || 'N/A'}</div>
//         <div>Time: {subscription.remaining_time_display || subscription.get_remaining_time_display?.() || 'N/A'}</div>
//       </td>
      
//       <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
//         <SubscriptionActions
//           subscription={subscription}
//           isLoading={isLoading}
//           onShowDetails={onShowDetails}
//           onActivate={onActivate}
//           onStatusChange={onStatusChange}
//           onRefreshStatus={onRefreshStatus}
//         />
//       </td>
//     </tr>
//   );
// };

// // Status Badge Component
// const StatusBadge = ({ status }) => {
//   const statusConfig = {
//     active: { color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200", icon: Check },
//     pending: { color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200", icon: Clock },
//     suspended: { color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200", icon: Pause },
//     expired: { color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200", icon: X },
//     cancelled: { color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200", icon: X }
//   };
  
//   const config = statusConfig[status] || statusConfig.pending;
//   const IconComponent = config.icon;
  
//   return (
//     <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${config.color}`}>
//       <IconComponent className="w-3 h-3" />
//       {status.charAt(0).toUpperCase() + status.slice(1)}
//     </span>
//   );
// };

// // Subscription Actions Component
// const SubscriptionActions = ({
//   subscription,
//   isLoading,
//   onShowDetails,
//   onActivate,
//   onStatusChange,
//   onRefreshStatus
// }) => {
//   const [showMenu, setShowMenu] = useState(false);

//   return (
//     <div className="flex items-center space-x-1 relative">
//       <motion.button
//         onClick={() => onShowDetails(subscription)}
//         className="text-indigo-600 hover:text-indigo-900 p-1 rounded"
//         whileHover={{ scale: 1.1 }}
//         whileTap={{ scale: 0.9 }}
//         title="View Details"
//       >
//         <Eye className="w-4 h-4" />
//       </motion.button>
      
//       {subscription.status === 'active' && !subscription.activation_requested && (
//         <motion.button
//           onClick={() => onActivate(subscription.id)}
//           disabled={isLoading}
//           className="text-green-600 hover:text-green-900 p-1 rounded disabled:opacity-50"
//           whileHover={{ scale: 1.1 }}
//           whileTap={{ scale: 0.9 }}
//           title="Activate Service"
//         >
//           <Play className="w-4 h-4" />
//         </motion.button>
//       )}
      
//       <div className="relative">
//         <motion.button
//           onClick={() => setShowMenu(!showMenu)}
//           className="text-gray-600 hover:text-gray-900 p-1 rounded"
//           whileHover={{ scale: 1.1 }}
//           whileTap={{ scale: 0.9 }}
//           title="More Actions"
//         >
//           <MoreVertical className="w-4 h-4" />
//         </motion.button>
        
//         {showMenu && (
//           <div className="absolute right-0 top-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 min-w-32">
//             <div className="py-1">
//               <button
//                 onClick={() => {
//                   onRefreshStatus(subscription.id);
//                   setShowMenu(false);
//                 }}
//                 disabled={isLoading}
//                 className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 flex items-center gap-2"
//               >
//                 <RefreshCw className="w-3 h-3" />
//                 Refresh Status
//               </button>
              
//               {subscription.status === 'active' && (
//                 <button
//                   onClick={() => {
//                     onStatusChange(subscription.id, 'suspended');
//                     setShowMenu(false);
//                   }}
//                   disabled={isLoading}
//                   className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 flex items-center gap-2"
//                 >
//                   <Pause className="w-3 h-3" />
//                   Suspend
//                 </button>
//               )}
              
//               {subscription.status === 'suspended' && (
//                 <button
//                   onClick={() => {
//                     onStatusChange(subscription.id, 'active');
//                     setShowMenu(false);
//                   }}
//                   disabled={isLoading}
//                   className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 flex items-center gap-2"
//                 >
//                   <Play className="w-3 h-3" />
//                   Resume
//                 </button>
//               )}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// // Empty State Component
// const EmptySubscriptionState = ({ theme }) => {
//   const themeClasses = getThemeClasses(theme);

//   return (
//     <div className="text-center py-12 text-gray-500 dark:text-gray-400">
//       <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
//       <p className="text-lg font-medium mb-2">No subscriptions found</p>
//       <p className="text-sm">Try adjusting your search or filters</p>
//     </div>
//   );
// };

// // Helper function for activation status
// const getActivationStatus = (subscription) => {
//   if (subscription.activation_successful) {
//     return { color: "text-green-600", text: "Activated", icon: Check };
//   }
//   if (subscription.activation_error) {
//     return { color: "text-red-600", text: "Failed", icon: AlertTriangle };
//   }
//   if (subscription.activation_requested) {
//     return { color: "text-yellow-600", text: "Processing", icon: Clock };
//   }
//   return { color: "text-gray-600", text: "Not Requested", icon: Clock };
// };

// // Subscription Details Component (keep your existing one, it's good)
// const SubscriptionDetails = ({ subscription, onClose, theme }) => {
//   const themeClasses = getThemeClasses(theme);
  
//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
//       <motion.div
//         initial={{ opacity: 0, scale: 0.9 }}
//         animate={{ opacity: 1, scale: 1 }}
//         exit={{ opacity: 0, scale: 0.9 }}
//         className={`w-full max-w-2xl rounded-xl shadow-lg ${themeClasses.bg.card} ${themeClasses.border.light} border p-6 max-h-[90vh] overflow-y-auto`}
//       >
//         <div className="flex items-center justify-between mb-4">
//           <h3 className="text-lg font-semibold">Subscription Details</h3>
//           <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
//             <X className="w-5 h-5" />
//           </button>
//         </div>
        
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div>
//             <h4 className="font-semibold mb-2">Client Information</h4>
//             <div className="space-y-2 text-sm">
//               <div><strong>Username:</strong> {subscription.client?.user?.username || 'N/A'}</div>
//               <div><strong>Phone:</strong> {subscription.client?.user?.phonenumber || 'N/A'}</div>
//               <div><strong>MAC Address:</strong> {subscription.mac_address || 'Not set'}</div>
//             </div>
//           </div>
          
//           <div>
//             <h4 className="font-semibold mb-2">Plan Information</h4>
//             <div className="space-y-2 text-sm">
//               <div><strong>Plan:</strong> {subscription.internet_plan?.name || 'N/A'}</div>
//               <div><strong>Access Method:</strong> {subscription.access_method}</div>
//               <div><strong>Router:</strong> {subscription.router?.name || 'Not assigned'}</div>
//             </div>
//           </div>
          
//           <div>
//             <h4 className="font-semibold mb-2">Status Information</h4>
//             <div className="space-y-2 text-sm">
//               <div><strong>Status:</strong> {subscription.status}</div>
//               <div><strong>Start Date:</strong> {new Date(subscription.start_date).toLocaleDateString()}</div>
//               <div><strong>End Date:</strong> {new Date(subscription.end_date).toLocaleDateString()}</div>
//             </div>
//           </div>
          
//           <div>
//             <h4 className="font-semibold mb-2">Usage Information</h4>
//             <div className="space-y-2 text-sm">
//               <div><strong>Data Used:</strong> {formatBytes(subscription.data_used || 0)}</div>
//               <div><strong>Time Used:</strong> {formatTime(subscription.time_used || 0)}</div>
//               <div><strong>Remaining Data:</strong> {subscription.remaining_data_display || subscription.get_remaining_data_display?.() || 'N/A'}</div>
//               <div><strong>Remaining Time:</strong> {subscription.remaining_time_display || subscription.get_remaining_time_display?.() || 'N/A'}</div>
//             </div>
//           </div>
//         </div>
        
//         {subscription.activation_error && (
//           <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
//             <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">Activation Error</h4>
//             <p className="text-sm text-red-700 dark:text-red-300">{subscription.activation_error}</p>
//           </div>
//         )}
//       </motion.div>
//     </div>
//   );
// };

// export default SubscriptionManagement;





// src/pages/ServiceOperations/components/SubscriptionManagement.jsx
import React, { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, Pause, RefreshCw, Eye, Trash2, Check, X, AlertTriangle,
  Wifi, Cable, Clock, Star as StarIcon, Search, Filter,
  ChevronDown, ChevronUp, Download, MoreVertical, Edit, Copy
} from "lucide-react";
import api from "../../../api";
import { getThemeClasses } from "../../Shared/components";

const Star = ({ filled, onClick, className }) => (
  <svg
    className={className}
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    viewBox="0 0 20 20"
    onClick={onClick}
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const SubscriptionManagement = ({ subscriptions, onRefresh, theme }) => {
  const themeClasses = getThemeClasses(theme);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selected, setSelected] = useState(new Set());
  const [loadingActions, setLoadingActions] = useState(new Set());
  const [ratingLoading, setRatingLoading] = useState({});

  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter(sub => {
      const matchesSearch = searchTerm === "" ||
        (sub.client_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (sub.plan_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (sub.client?.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = filterStatus === "all" || sub.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [subscriptions, searchTerm, filterStatus]);

  const handleAction = async (id, action) => {
    const key = `${action}-${id}`;
    setLoadingActions(prev => new Set(prev).add(key));
    try {
      let endpoint = "";
      switch (action) {
        case "activate": endpoint = `/api/service_operations/subscriptions/${id}/activate/`; break;
        case "deactivate": endpoint = `/api/service_operations/subscriptions/${id}/deactivate/`; break;
        case "refresh": endpoint = `/api/service_operations/subscriptions/${id}/refresh/`; break;
        case "delete": endpoint = `/api/service_operations/subscriptions/${id}/`; break;
        default: return;
      }
      if (action === "delete") {
        await api.delete(endpoint);
      } else {
        await api.post(endpoint);
      }
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingActions(prev => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  };

  const handleRating = async (id, rating) => {
    setRatingLoading(prev => ({ ...prev, [id]: true }));
    try {
      await api.patch(`/api/service_operations/subscriptions/${id}/`, { rating });
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setRatingLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const toggleSelect = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === filteredSubscriptions.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filteredSubscriptions.map(s => s.id)));
    }
  };

  const renderStars = (rating = 0, id) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <motion.div
          key={star}
          whileHover={{ scale: 1.2 }}
          className="cursor-pointer"
          onClick={() => handleRating(id, star)}
        >
          <Star
            className={`w-5 h-5 ${star <= rating ? "text-yellow-500" : "text-gray-400"}`}
            filled={star <= rating}
          />
        </motion.div>
      ))}
      {ratingLoading[id] && <span className="text-xs ml-2">Saving...</span>}
    </div>
  );

  return (
    <div className={`space-y-6 ${themeClasses.bg.primary}`}>
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search clients or plans..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`pl-10 pr-4 py-3 rounded-lg border ${themeClasses.input} w-full sm:w-80`}
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={`px-4 py-3 rounded-lg border ${themeClasses.input}`}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <button
          onClick={onRefresh}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
        >
          <RefreshCw className="w-5 h-5" />
          Refresh
        </button>
      </div>

      {/* Table */}
      <div className={`rounded-xl overflow-hidden shadow-lg ${themeClasses.bg.card} border ${themeClasses.border.light}`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${themeClasses.bg.secondary}`}>
              <tr>
                <th className="p-4 text-left">
                  <button onClick={toggleSelectAll} className="flex items-center gap-2">
                    {selected.size === filteredSubscriptions.length && filteredSubscriptions.length > 0 ? (
                      <Check className="w-5 h-5 text-indigo-600" />
                    ) : (
                      <div className="w-5 h-5 border-2 border-gray-400 rounded" />
                    )}
                    <span className="text-sm">Select All</span>
                  </button>
                </th>
                <th className="p-4 text-left">Client</th>
                <th className="p-4 text-left">Plan</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Rating</th>
                <th className="p-4 text-left">Created</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubscriptions.map(sub => (
                <tr key={sub.id} className="border-t hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="p-4">
                    <button onClick={() => toggleSelect(sub.id)}>
                      {selected.has(sub.id) ? (
                        <Check className="w-5 h-5 text-indigo-600" />
                      ) : (
                        <div className="w-5 h-5 border-2 border-gray-400 rounded" />
                      )}
                    </button>
                  </td>
                  <td className="p-4">{sub.client_name || sub.client || "N/A"}</td>
                  <td className="p-4 font-medium">{sub.plan_name}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      sub.status === "active" ? "bg-green-100 text-green-800" :
                      sub.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                      "bg-gray-100 text-gray-800"
                    }`}>
                      {sub.status}
                    </span>
                  </td>
                  <td className="p-4">{renderStars(sub.rating, sub.id)}</td>
                  <td className="p-4 text-sm text-gray-600">
                    {new Date(sub.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => handleAction(sub.id, "activate")} disabled={loadingActions.has(`activate-${sub.id}`)}>
                        <Play className="w-5 h-5 text-green-600" />
                      </button>
                      <button onClick={() => handleAction(sub.id, "deactivate")} disabled={loadingActions.has(`deactivate-${sub.id}`)}>
                        <Pause className="w-5 h-5 text-orange-600" />
                      </button>
                      <button onClick={() => handleAction(sub.id, "refresh")} disabled={loadingActions.has(`refresh-${sub.id}`)}>
                        <RefreshCw className="w-5 h-5 text-blue-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredSubscriptions.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No subscriptions found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionManagement;