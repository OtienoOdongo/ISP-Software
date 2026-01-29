







// import React, { useState, useMemo, useCallback } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   Download, Upload, RefreshCw, Play, Pause, Trash2,
//   Check, AlertTriangle, Filter, Users, Settings, Loader
// } from "lucide-react";
// import { getThemeClasses, EnhancedSelect, ConfirmationModal } from "../../../components/ServiceManagement/Shared/components";
// import api from "../../../api";

// const BulkOperations = ({ subscriptions, plans, onRefresh, theme }) => {
//   const themeClasses = getThemeClasses(theme);
//   const [selectedAction, setSelectedAction] = useState("");
//   const [selectedPlans, setSelectedPlans] = useState([]);
//   const [selectedStatus, setSelectedStatus] = useState("active");
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [results, setResults] = useState(null);
//   const [progress, setProgress] = useState(0);

//   const eligibleSubscriptions = useMemo(() => {
//     return subscriptions.filter(sub => {
//       const matchesPlan = selectedPlans.length === 0 || selectedPlans.includes(sub.internet_plan?.id?.toString());
//       const matchesStatus = selectedStatus === "all" || sub.status === selectedStatus;
//       return matchesPlan && matchesStatus;
//     });
//   }, [subscriptions, selectedPlans, selectedStatus]);

//   const handleBulkAction = useCallback(async () => {
//     if (!selectedAction || eligibleSubscriptions.length === 0) return;

//     setIsProcessing(true);
//     setProgress(0);
//     setResults(null);

//     try {
//       const results = [];
//       const total = eligibleSubscriptions.length;

//       for (let i = 0; i < eligibleSubscriptions.length; i++) {
//         const sub = eligibleSubscriptions[i];
        
//         try {
//           let response;
//           switch (selectedAction) {
//             case "activate":
//               response = await api.post(`/api/internet_plans/subscriptions/${sub.id}/activate/`);
//               break;
//             case "suspend":
//               response = await api.patch(`/api/internet_plans/subscriptions/${sub.id}/`, {
//                 status: "suspended"
//               });
//               break;
//             case "resume":
//               response = await api.patch(`/api/internet_plans/subscriptions/${sub.id}/`, {
//                 status: "active"
//               });
//               break;
//             case "refresh":
//               response = await api.post(`/api/internet_plans/subscriptions/${sub.id}/refresh/`);
//               break;
//             default:
//               response = { status: 'skipped' };
//           }
          
//           results.push({ status: 'fulfilled', value: response });
//         } catch (error) {
//           results.push({ status: 'rejected', reason: error });
//         }
        
//         setProgress(Math.round(((i + 1) / total) * 100));
//       }

//       const successCount = results.filter(r => r.status === 'fulfilled').length;
//       const failureCount = results.filter(r => r.status === 'rejected').length;

//       setResults({
//         total,
//         success: successCount,
//         failed: failureCount,
//         action: selectedAction,
//         details: results
//       });

//       onRefresh();
//     } catch (error) {
//       console.error("Bulk operation failed:", error);
//       setResults({
//         total: eligibleSubscriptions.length,
//         success: 0,
//         failed: eligibleSubscriptions.length,
//         action: selectedAction,
//         error: error.message
//       });
//     } finally {
//       setIsProcessing(false);
//       setProgress(0);
//     }
//   }, [selectedAction, eligibleSubscriptions, onRefresh]);

//   const actionOptions = [
//     { value: "", label: "Select action...", disabled: true },
//     { value: "activate", label: "Activate Services", description: "Activate selected subscriptions on network" },
//     { value: "suspend", label: "Suspend Services", description: "Temporarily suspend selected subscriptions" },
//     { value: "resume", label: "Resume Services", description: "Resume suspended subscriptions" },
//     { value: "refresh", label: "Refresh Status", description: "Refresh subscription status from network" },
//   ];

//   const statusOptions = [
//     { value: "all", label: "All Statuses" },
//     { value: "active", label: "Active" },
//     { value: "pending", label: "Pending" },
//     { value: "suspended", label: "Suspended" },
//     { value: "expired", label: "Expired" },
//   ];

//   const canExecute = selectedAction && eligibleSubscriptions.length > 0 && !isProcessing;

//   return (
//     <div className="space-y-6">
//       {/* Operation Configuration */}
//       <OperationConfig
//         selectedAction={selectedAction}
//         selectedPlans={selectedPlans}
//         selectedStatus={selectedStatus}
//         eligibleCount={eligibleSubscriptions.length}
//         isProcessing={isProcessing}
//         progress={progress}
//         actionOptions={actionOptions}
//         statusOptions={statusOptions}
//         plans={plans}
//         onActionChange={setSelectedAction}
//         onPlansChange={setSelectedPlans}
//         onStatusChange={setSelectedStatus}
//         onExecute={handleBulkAction}
//         canExecute={canExecute}
//         theme={theme}
//       />

//       {/* Results Display */}
//       <AnimatePresence>
//         {results && (
//           <OperationResults results={results} onDismiss={() => setResults(null)} theme={theme} />
//         )}
//       </AnimatePresence>

//       {/* Preview of Affected Subscriptions */}
//       {eligibleSubscriptions.length > 0 && (
//         <SubscriptionsPreview 
//           subscriptions={eligibleSubscriptions} 
//           theme={theme}
//         />
//       )}
//     </div>
//   );
// };

// // Operation Configuration Component
// const OperationConfig = ({
//   selectedAction,
//   selectedPlans,
//   selectedStatus,
//   eligibleCount,
//   isProcessing,
//   progress,
//   actionOptions,
//   statusOptions,
//   plans,
//   onActionChange,
//   onPlansChange,
//   onStatusChange,
//   onExecute,
//   canExecute,
//   theme
// }) => {
//   const themeClasses = getThemeClasses(theme);
//   const selectedActionConfig = actionOptions.find(opt => opt.value === selectedAction);

//   return (
//     <div className={`p-6 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//       <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
//         <Settings className="w-5 h-5 mr-2 text-indigo-600" />
//         Bulk Operation Configuration
//       </h4>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
//         {/* Action Selection */}
//         <div>
//           <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
//             Action to Perform *
//           </label>
//           <EnhancedSelect
//             value={selectedAction}
//             onChange={onActionChange}
//             options={actionOptions}
//             theme={theme}
//           />
//           {selectedActionConfig?.description && (
//             <p className="text-xs text-gray-500 mt-1">{selectedActionConfig.description}</p>
//           )}
//         </div>

//         {/* Plan Filter */}
//         <div>
//           <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
//             Filter by Plan
//           </label>
//           <EnhancedSelect
//             value={selectedPlans}
//             onChange={onPlansChange}
//             options={[
//               { value: [], label: "All Plans" },
//               ...plans.map(plan => ({ 
//                 value: [plan.id.toString()], 
//                 label: plan.name 
//               }))
//             ]}
//             multiple
//             theme={theme}
//           />
//         </div>

//         {/* Status Filter */}
//         <div>
//           <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
//             Filter by Status
//           </label>
//           <EnhancedSelect
//             value={selectedStatus}
//             onChange={onStatusChange}
//             options={statusOptions}
//             theme={theme}
//           />
//         </div>
//       </div>

//       {/* Progress Bar */}
//       {isProcessing && (
//         <div className="mb-6">
//           <div className="flex justify-between text-sm mb-2">
//             <span>Processing...</span>
//             <span>{progress}%</span>
//           </div>
//           <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
//             <motion.div
//               className="bg-indigo-600 h-2 rounded-full"
//               initial={{ width: 0 }}
//               animate={{ width: `${progress}%` }}
//               transition={{ duration: 0.3 }}
//             />
//           </div>
//         </div>
//       )}

//       {/* Affected Subscriptions */}
//       <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
//         <div className="flex items-center justify-between">
//           <div>
//             <h5 className="font-semibold text-blue-900 dark:text-blue-100">
//               Affected Subscriptions
//             </h5>
//             <p className="text-sm text-blue-700 dark:text-blue-300">
//               This operation will affect {eligibleCount} subscription(s)
//             </p>
//           </div>
//           <div className="text-2xl font-bold text-blue-600">
//             {eligibleCount}
//           </div>
//         </div>
//       </div>

//       {/* Execute Button */}
//       <div className="flex justify-end">
//         <motion.button
//           onClick={onExecute}
//           disabled={!canExecute}
//           className={`px-6 py-3 rounded-lg flex items-center gap-2 ${
//             !canExecute
//               ? 'bg-gray-400 cursor-not-allowed'
//               : 'bg-indigo-600 hover:bg-indigo-700 text-white'
//           }`}
//           whileHover={{ scale: !canExecute ? 1 : 1.05 }}
//           whileTap={{ scale: !canExecute ? 1 : 0.95 }}
//         >
//           {isProcessing ? (
//             <Loader className="w-4 h-4 animate-spin" />
//           ) : (
//             <Play className="w-4 h-4" />
//           )}
//           {isProcessing ? 'Processing...' : `Execute Bulk ${selectedAction ? actionOptions.find(a => a.value === selectedAction)?.label : 'Action'}`}
//         </motion.button>
//       </div>
//     </div>
//   );
// };

// // Operation Results Component
// const OperationResults = ({ results, onDismiss, theme }) => {
//   const themeClasses = getThemeClasses(theme);
//   const isSuccess = results.failed === 0;

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       exit={{ opacity: 0, y: -20 }}
//       className={`p-6 rounded-xl shadow-lg border ${
//         isSuccess 
//           ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
//           : 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20'
//       }`}
//     >
//       <div className="flex items-center justify-between mb-4">
//         <div className="flex items-center gap-3">
//           {isSuccess ? (
//             <Check className="w-6 h-6 text-green-600" />
//           ) : (
//             <AlertTriangle className="w-6 h-6 text-yellow-600" />
//           )}
//           <div>
//             <h4 className="font-semibold text-gray-900 dark:text-white">
//               Bulk Operation Completed
//             </h4>
//             <p className="text-sm text-gray-600 dark:text-gray-400">
//               {results.action} operation completed
//             </p>
//           </div>
//         </div>
//         <button
//           onClick={onDismiss}
//           className="text-gray-500 hover:text-gray-700 transition-colors"
//         >
//           <Trash2 className="w-4 h-4" />
//         </button>
//       </div>

//       <div className="grid grid-cols-3 gap-4 text-center mb-4">
//         <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
//           <div className="text-2xl font-bold text-gray-900 dark:text-white">{results.total}</div>
//           <div className="text-sm text-gray-500">Total</div>
//         </div>
//         <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
//           <div className="text-2xl font-bold text-green-600">{results.success}</div>
//           <div className="text-sm text-green-600">Successful</div>
//         </div>
//         <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
//           <div className="text-2xl font-bold text-red-600">{results.failed}</div>
//           <div className="text-sm text-red-600">Failed</div>
//         </div>
//       </div>

//       {results.error && (
//         <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
//           <p className="text-sm text-red-700 dark:text-red-300">{results.error}</p>
//         </div>
//       )}
//     </motion.div>
//   );
// };

// // Subscriptions Preview Component
// const SubscriptionsPreview = ({ subscriptions, theme }) => {
//   const themeClasses = getThemeClasses(theme);

//   return (
//     <div className={`rounded-xl shadow-lg border overflow-hidden ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//       <div className="p-4 border-b border-gray-200 dark:border-gray-700">
//         <h5 className="font-semibold flex items-center">
//           <Users className="w-4 h-4 mr-2 text-indigo-600" />
//           Affected Subscriptions Preview ({subscriptions.length})
//         </h5>
//       </div>
//       <div className="max-h-64 overflow-y-auto">
//         <table className="min-w-full divide-y text-sm">
//           <thead className={theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}>
//             <tr>
//               <th className="px-4 py-2 text-left text-xs font-medium">Client</th>
//               <th className="px-4 py-2 text-left text-xs font-medium">Plan</th>
//               <th className="px-4 py-2 text-left text-xs font-medium">Status</th>
//               <th className="px-4 py-2 text-left text-xs font-medium">Activation</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
//             {subscriptions.slice(0, 10).map((sub) => (
//               <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
//                 <td className="px-4 py-2 text-sm">{sub.client?.user?.username || 'Unknown'}</td>
//                 <td className="px-4 py-2 text-sm">{sub.internet_plan?.name || 'No Plan'}</td>
//                 <td className="px-4 py-2 text-sm">
//                   <span className={`px-2 py-1 rounded-full text-xs ${
//                     sub.status === 'active' ? 'bg-green-100 text-green-800' :
//                     sub.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
//                     'bg-gray-100 text-gray-800'
//                   }`}>
//                     {sub.status}
//                   </span>
//                 </td>
//                 <td className="px-4 py-2 text-sm">
//                   {sub.activation_successful ? 'Active' : 'Inactive'}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//         {subscriptions.length > 10 && (
//           <div className="p-3 text-center text-sm text-gray-500 border-t">
//             ... and {subscriptions.length - 10} more subscriptions
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default BulkOperations;




// src/pages/ServiceOperations/components/BulkOperations.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Play, Pause, RefreshCw, Trash2, CheckSquare, Square } from "lucide-react";
import api from "../../../api";
import { getThemeClasses } from "../../../components/ServiceManagement/Shared/components"

const BulkOperations = ({ subscriptions, onRefresh, theme }) => {
  const themeClasses = getThemeClasses(theme);
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(false);

  const toggleSelect = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === subscriptions.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(subscriptions.map(s => s.id)));
    }
  };

  const handleBulkAction = async (action) => {
    if (selected.size === 0) return;
    setLoading(true);
    try {
      const payload = { ids: Array.from(selected) };
      let endpoint = "";
      switch (action) {
        case "activate": endpoint = "/api/service_operations/bulk-activate/"; break;
        case "deactivate": endpoint = "/api/service_operations/bulk-deactivate/"; break;
        case "refresh": endpoint = "/api/service_operations/bulk-refresh/"; break;
        case "delete": endpoint = "/api/service_operations/bulk-delete/"; break;
        default: return;
      }
      await api.post(endpoint, payload);
      onRefresh();
      setSelected(new Set());
    } catch (err) {
      console.error(`Bulk ${action} failed`, err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`space-y-6 ${themeClasses.bg.primary}`}>
      <h2 className="text-2xl font-bold">Bulk Operations</h2>

      <div className="flex flex-wrap gap-4">
        <motion.button
          onClick={() => handleBulkAction("activate")}
          disabled={loading || selected.size === 0}
          className={`px-6 py-3 rounded-lg flex items-center gap-3 font-medium ${
            loading || selected.size === 0
              ? "bg-gray-400 cursor-not-allowed text-white"
              : "bg-green-600 hover:bg-green-700 text-white"
          }`}
          whileHover={selected.size > 0 && !loading ? { scale: 1.05 } : {}}
        >
          <Play className="w-5 h-5" />
          Activate ({selected.size})
        </motion.button>

        <motion.button
          onClick={() => handleBulkAction("deactivate")}
          disabled={loading || selected.size === 0}
          className={`px-6 py-3 rounded-lg flex items-center gap-3 font-medium ${
            loading || selected.size === 0
              ? "bg-gray-400 cursor-not-allowed text-white"
              : "bg-orange-600 hover:bg-orange-700 text-white"
          }`}
          whileHover={selected.size > 0 && !loading ? { scale: 1.05 } : {}}
        >
          <Pause className="w-5 h-5" />
          Deactivate ({selected.size})
        </motion.button>

        <motion.button
          onClick={() => handleBulkAction("refresh")}
          disabled={loading || selected.size === 0}
          className={`px-6 py-3 rounded-lg flex items-center gap-3 font-medium ${
            loading || selected.size === 0
              ? "bg-gray-400 cursor-not-allowed text-white"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
          whileHover={selected.size > 0 && !loading ? { scale: 1.05 } : {}}
        >
          <RefreshCw className="w-5 h-5" />
          Refresh ({selected.size})
        </motion.button>

        <motion.button
          onClick={() => handleBulkAction("delete")}
          disabled={loading || selected.size === 0}
          className={`px-6 py-3 rounded-lg flex items-center gap-3 font-medium ${
            loading || selected.size === 0
              ? "bg-gray-400 cursor-not-allowed text-white"
              : "bg-red-600 hover:bg-red-700 text-white"
          }`}
          whileHover={selected.size > 0 && !loading ? { scale: 1.05 } : {}}
        >
          <Trash2 className="w-5 h-5" />
          Delete ({selected.size})
        </motion.button>
      </div>

      <div className={`rounded-xl overflow-hidden shadow-lg ${themeClasses.bg.card} border ${themeClasses.border.light}`}>
        <table className="w-full">
          <thead className={`${themeClasses.bg.secondary}`}>
            <tr>
              <th className="p-4 text-left">
                <button onClick={toggleSelectAll} className="flex items-center gap-2">
                  {selected.size === subscriptions.length && subscriptions.length > 0 ? (
                    <CheckSquare className="w-5 h-5 text-indigo-600" />
                  ) : (
                    <Square className="w-5 h-5 text-gray-500" />
                  )}
                  Select All
                </button>
              </th>
              <th className="p-4 text-left">Client</th>
              <th className="p-4 text-left">Plan</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Created</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.map(sub => (
              <tr key={sub.id} className="border-t hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="p-4">
                  <button onClick={() => toggleSelect(sub.id)}>
                    {selected.has(sub.id) ? (
                      <CheckSquare className="w-5 h-5 text-indigo-600" />
                    ) : (
                      <Square className="w-5 h-5 text-gray-500" />
                    )}
                  </button>
                </td>
                <td className="p-4">{sub.client_name || sub.client || "N/A"}</td>
                <td className="p-4 font-medium">{sub.plan_name}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    sub.status === "active" ? "bg-green-100 text-green-800" :
                    sub.status === "inactive" ? "bg-gray-100 text-gray-800" :
                    "bg-yellow-100 text-yellow-800"
                  }`}>
                    {sub.status}
                  </span>
                </td>
                <td className="p-4 text-sm text-gray-600">
                  {new Date(sub.created_at || sub.start_date).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {subscriptions.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No subscriptions available
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkOperations;