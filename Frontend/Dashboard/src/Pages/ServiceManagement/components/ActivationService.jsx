// import React, { useState, useMemo } from "react";
// import { motion } from "framer-motion";
// import {
//   Play, RefreshCw, Check, X, AlertTriangle, Filter,
//   Wifi, Cable, Server, Clock, Users, Download, Upload
// } from "lucide-react";
// import { getThemeClasses, EnhancedSelect } from "../../../components/ServiceManagement/Shared/components"
// import api from "../../../api"

// const ActivationService = ({ subscriptions, onRefresh, theme }) => {
//   const themeClasses = getThemeClasses(theme);
//   const [filterStatus, setFilterStatus] = useState("pending");
//   const [actionLoading, setActionLoading] = useState(null);
//   const [bulkAction, setBulkAction] = useState(null);

//   const pendingSubscriptions = useMemo(() => {
//     return subscriptions.filter(sub => 
//       sub.status === 'active' && 
//       !sub.activation_requested &&
//       !sub.activation_successful
//     );
//   }, [subscriptions]);

//   const failedSubscriptions = useMemo(() => {
//     return subscriptions.filter(sub => 
//       sub.activation_error && 
//       !sub.activation_successful
//     );
//   }, [subscriptions]);

//   const handleActivation = async (subscriptionId) => {
//     setActionLoading(subscriptionId);
//     try {
//       await api.post(`/api/internet_plans/subscriptions/${subscriptionId}/activate/`);
//       onRefresh();
//     } catch (error) {
//       console.error("Activation failed:", error);
//     } finally {
//       setActionLoading(null);
//     }
//   };

//   const handleBulkActivation = async () => {
//     setBulkAction('activating');
//     try {
//       const activationPromises = pendingSubscriptions.map(sub => 
//         api.post(`/api/internet_plans/subscriptions/${sub.id}/activate/`)
//       );
//       await Promise.all(activationPromises);
//       onRefresh();
//     } catch (error) {
//       console.error("Bulk activation failed:", error);
//     } finally {
//       setBulkAction(null);
//     }
//   };

//   const handleRetryFailed = async () => {
//     setBulkAction('retrying');
//     try {
//       const retryPromises = failedSubscriptions.map(sub => 
//         api.post(`/api/internet_plans/subscriptions/${sub.id}/activate/`)
//       );
//       await Promise.all(retryPromises);
//       onRefresh();
//     } catch (error) {
//       console.error("Retry failed:", error);
//     } finally {
//       setBulkAction(null);
//     }
//   };

//   const displaySubscriptions = filterStatus === 'pending' ? pendingSubscriptions : failedSubscriptions;

//   return (
//     <div className="space-y-6">
//       {/* Bulk Actions */}
//       <div className={`p-4 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//         <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
//           <div>
//             <h4 className="font-semibold text-gray-900 dark:text-white">Bulk Operations</h4>
//             <p className="text-sm text-gray-600 dark:text-gray-400">
//               Perform actions on multiple subscriptions at once
//             </p>
//           </div>
          
//           <div className="flex gap-3">
//             {pendingSubscriptions.length > 0 && (
//               <motion.button
//                 onClick={handleBulkActivation}
//                 disabled={bulkAction === 'activating'}
//                 className={`px-4 py-2 rounded-lg flex items-center ${
//                   bulkAction === 'activating' ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700 text-white'
//                 }`}
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//               >
//                 <Play className="w-4 h-4 mr-2" />
//                 {bulkAction === 'activating' ? 'Activating...' : `Activate All (${pendingSubscriptions.length})`}
//               </motion.button>
//             )}
            
//             {failedSubscriptions.length > 0 && (
//               <motion.button
//                 onClick={handleRetryFailed}
//                 disabled={bulkAction === 'retrying'}
//                 className={`px-4 py-2 rounded-lg flex items-center ${
//                   bulkAction === 'retrying' ? 'bg-gray-400' : 'bg-yellow-600 hover:bg-yellow-700 text-white'
//                 }`}
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//               >
//                 <RefreshCw className="w-4 h-4 mr-2" />
//                 {bulkAction === 'retrying' ? 'Retrying...' : `Retry Failed (${failedSubscriptions.length})`}
//               </motion.button>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Filters */}
//       <div className={`p-4 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//         <div className="flex flex-wrap gap-4 items-center">
//           <div className="w-48">
//             <EnhancedSelect
//               value={filterStatus}
//               onChange={setFilterStatus}
//               options={[
//                 { value: "pending", label: `Pending Activation (${pendingSubscriptions.length})` },
//                 { value: "failed", label: `Failed Activation (${failedSubscriptions.length})` },
//               ]}
//               theme={theme}
//             />
//           </div>
          
//           <div className="flex-1 text-sm text-gray-600 dark:text-gray-400">
//             {filterStatus === 'pending' 
//               ? 'Subscriptions that are active but not yet activated on the network'
//               : 'Subscriptions with failed activation attempts'
//             }
//           </div>
//         </div>
//       </div>

//       {/* Subscriptions List */}
//       <div className="space-y-4">
//         {displaySubscriptions.map((subscription) => (
//           <motion.div
//             key={subscription.id}
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             className={`p-4 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}
//           >
//             <div className="flex items-center justify-between">
//               <div className="flex items-center space-x-4">
//                 {subscription.access_method === 'hotspot' ? (
//                   <Wifi className="w-8 h-8 text-blue-600" />
//                 ) : (
//                   <Cable className="w-8 h-8 text-green-600" />
//                 )}
                
//                 <div>
//                   <h5 className="font-semibold text-gray-900 dark:text-white">
//                     {subscription.client?.user?.username || 'Unknown Client'}
//                   </h5>
//                   <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
//                     <div>Plan: {subscription.internet_plan?.name || 'No Plan'}</div>
//                     <div>Router: {subscription.router?.name || 'Not assigned'}</div>
//                     {subscription.mac_address && (
//                       <div>MAC: {subscription.mac_address}</div>
//                     )}
//                   </div>
//                 </div>
//               </div>
              
//               <div className="flex items-center space-x-3">
//                 {filterStatus === 'failed' && subscription.activation_error && (
//                   <div className="text-sm text-red-600 max-w-xs">
//                     {subscription.activation_error}
//                   </div>
//                 )}
                
//                 <motion.button
//                   onClick={() => handleActivation(subscription.id)}
//                   disabled={actionLoading === subscription.id}
//                   className={`px-4 py-2 rounded-lg flex items-center ${
//                     actionLoading === subscription.id 
//                       ? 'bg-gray-400 cursor-not-allowed' 
//                       : filterStatus === 'failed' ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'
//                   } text-white`}
//                   whileHover={{ scale: actionLoading === subscription.id ? 1 : 1.05 }}
//                   whileTap={{ scale: actionLoading === subscription.id ? 1 : 0.95 }}
//                 >
//                   {actionLoading === subscription.id ? (
//                     <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
//                   ) : filterStatus === 'failed' ? (
//                     <RefreshCw className="w-4 h-4 mr-2" />
//                   ) : (
//                     <Play className="w-4 h-4 mr-2" />
//                   )}
//                   {actionLoading === subscription.id ? 'Activating...' : 
//                    filterStatus === 'failed' ? 'Retry' : 'Activate'}
//                 </motion.button>
//               </div>
//             </div>
//           </motion.div>
//         ))}
        
//         {displaySubscriptions.length === 0 && (
//           <div className={`p-8 text-center rounded-xl ${themeClasses.bg.card}`}>
//             <Check className="w-12 h-12 text-green-600 mx-auto mb-3" />
//             <h4 className="text-lg font-semibold mb-2">
//               {filterStatus === 'pending' ? 'No Pending Activations' : 'No Failed Activations'}
//             </h4>
//             <p className="text-gray-600 dark:text-gray-400">
//               {filterStatus === 'pending' 
//                 ? 'All active subscriptions have been activated successfully.'
//                 : 'There are no subscriptions with failed activation attempts.'
//               }
//             </p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ActivationService;









import React, { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, RefreshCw, Check, X, AlertTriangle, Filter,
  Wifi, Cable, Server, Clock, Users, Download, Upload, Info
} from "lucide-react";
import { getThemeClasses, EnhancedSelect } from "../../../components/ServiceManagement/Shared/components";
import api from "../../../api";

const ActivationService = ({ subscriptions, onRefresh, theme }) => {
  const themeClasses = getThemeClasses(theme);
  const [filterStatus, setFilterStatus] = useState("pending");
  const [actionLoading, setActionLoading] = useState(new Set());
  const [bulkAction, setBulkAction] = useState(null);
  const [selectedItems, setSelectedItems] = useState(new Set());

  const { pendingSubscriptions, failedSubscriptions } = useMemo(() => {
    const pending = subscriptions.filter(sub => 
      sub.status === 'active' && 
      !sub.activation_requested &&
      !sub.activation_successful
    );
    
    const failed = subscriptions.filter(sub => 
      sub.activation_error && 
      !sub.activation_successful
    );

    return { pendingSubscriptions: pending, failedSubscriptions: failed };
  }, [subscriptions]);

  const displaySubscriptions = filterStatus === 'pending' ? pendingSubscriptions : failedSubscriptions;

  const handleActivation = useCallback(async (subscriptionId) => {
    setActionLoading(prev => new Set(prev).add(subscriptionId));
    try {
      await api.post(`/api/internet_plans/subscriptions/${subscriptionId}/activate/`);
      onRefresh();
    } catch (error) {
      console.error("Activation failed:", error);
    } finally {
      setActionLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(subscriptionId);
        return newSet;
      });
    }
  }, [onRefresh]);

  const handleBulkActivation = useCallback(async (subscriptionIds) => {
    setBulkAction('activating');
    try {
      const activationPromises = subscriptionIds.map(id => 
        api.post(`/api/internet_plans/subscriptions/${id}/activate/`)
      );
      await Promise.all(activationPromises);
      setSelectedItems(new Set());
      onRefresh();
    } catch (error) {
      console.error("Bulk activation failed:", error);
    } finally {
      setBulkAction(null);
    }
  }, [onRefresh]);

  const handleSelectAll = useCallback(() => {
    if (selectedItems.size === displaySubscriptions.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(displaySubscriptions.map(sub => sub.id)));
    }
  }, [displaySubscriptions, selectedItems.size]);

  const handleSelectItem = useCallback((subscriptionId) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(subscriptionId)) {
        newSet.delete(subscriptionId);
      } else {
        newSet.add(subscriptionId);
      }
      return newSet;
    });
  }, []);

  const handleBulkActionClick = useCallback(() => {
    if (selectedItems.size > 0) {
      handleBulkActivation(Array.from(selectedItems));
    }
  }, [selectedItems, handleBulkActivation]);

  return (
    <div className="space-y-6">
      {/* Bulk Actions */}
      <BulkActions 
        pendingCount={pendingSubscriptions.length}
        failedCount={failedSubscriptions.length}
        selectedCount={selectedItems.size}
        bulkAction={bulkAction}
        onBulkActivate={handleBulkActionClick}
        onSelectAll={handleSelectAll}
        isAllSelected={selectedItems.size === displaySubscriptions.length && displaySubscriptions.length > 0}
        theme={theme}
      />

      {/* Filters */}
      <div className={`p-4 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
        <div className="flex flex-wrap gap-4 items-center">
          <div className="w-48">
            <EnhancedSelect
              value={filterStatus}
              onChange={setFilterStatus}
              options={[
                { value: "pending", label: `Pending Activation (${pendingSubscriptions.length})` },
                { value: "failed", label: `Failed Activation (${failedSubscriptions.length})` },
              ]}
              theme={theme}
            />
          </div>
          
          <div className="flex-1">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {filterStatus === 'pending' 
                ? 'Subscriptions that are active but not yet activated on the network'
                : 'Subscriptions with failed activation attempts'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Subscriptions List */}
      <AnimatePresence mode="wait">
        <motion.div key={filterStatus} className="space-y-4">
          {displaySubscriptions.map((subscription) => (
            <SubscriptionActivationCard
              key={subscription.id}
              subscription={subscription}
              isSelected={selectedItems.has(subscription.id)}
              isLoading={actionLoading.has(subscription.id)}
              filterStatus={filterStatus}
              onSelect={() => handleSelectItem(subscription.id)}
              onActivate={() => handleActivation(subscription.id)}
              theme={theme}
            />
          ))}
          
          {displaySubscriptions.length === 0 && (
            <EmptyState filterStatus={filterStatus} theme={theme} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// Bulk Actions Component
const BulkActions = ({ 
  pendingCount, 
  failedCount, 
  selectedCount, 
  bulkAction, 
  onBulkActivate, 
  onSelectAll, 
  isAllSelected,
  theme 
}) => {
  const themeClasses = getThemeClasses(theme);

  if (pendingCount === 0 && failedCount === 0) return null;

  return (
    <div className={`p-4 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white">Bulk Operations</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {selectedCount > 0 
                ? `${selectedCount} subscription(s) selected`
                : 'Perform actions on multiple subscriptions'
              }
            </p>
          </div>
          
          {selectedCount > 0 && (
            <motion.button
              onClick={onSelectAll}
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isAllSelected ? 'Deselect All' : 'Select All'}
            </motion.button>
          )}
        </div>
        
        <div className="flex gap-3">
          {selectedCount > 0 && (
            <motion.button
              onClick={onBulkActivate}
              disabled={bulkAction === 'activating'}
              className={`px-4 py-2 rounded-lg flex items-center ${
                bulkAction === 'activating' 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
              whileHover={{ scale: bulkAction === 'activating' ? 1 : 1.05 }}
              whileTap={{ scale: bulkAction === 'activating' ? 1 : 0.95 }}
            >
              <Play className="w-4 h-4 mr-2" />
              {bulkAction === 'activating' 
                ? `Activating ${selectedCount}...` 
                : `Activate Selected (${selectedCount})`
              }
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
};

// Subscription Activation Card Component
const SubscriptionActivationCard = ({ 
  subscription, 
  isSelected, 
  isLoading, 
  filterStatus, 
  onSelect, 
  onActivate,
  theme 
}) => {
  const themeClasses = getThemeClasses(theme);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`p-4 rounded-xl shadow-lg border transition-all ${
        isSelected 
          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
          : `${themeClasses.bg.card} ${themeClasses.border.light}`
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onSelect}
            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
          />
          
          {subscription.access_method === 'hotspot' ? (
            <Wifi className="w-8 h-8 text-blue-600" />
          ) : (
            <Cable className="w-8 h-8 text-green-600" />
          )}
          
          <div className="flex-1">
            <h5 className="font-semibold text-gray-900 dark:text-white">
              {subscription.client?.user?.username || 'Unknown Client'}
            </h5>
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1 mt-1">
              <div className="flex flex-wrap gap-4">
                <span>Plan: {subscription.internet_plan?.name || 'No Plan'}</span>
                <span>Router: {subscription.router?.name || 'Not assigned'}</span>
                {subscription.mac_address && (
                  <span>MAC: {subscription.mac_address}</span>
                )}
              </div>
            </div>
            
            {filterStatus === 'failed' && subscription.activation_error && (
              <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p className="text-sm text-red-600 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  {subscription.activation_error}
                </p>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <motion.button
            onClick={onActivate}
            disabled={isLoading}
            className={`px-4 py-2 rounded-lg flex items-center ${
              isLoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : filterStatus === 'failed' 
                  ? 'bg-yellow-600 hover:bg-yellow-700' 
                  : 'bg-green-600 hover:bg-green-700'
            } text-white`}
            whileHover={{ scale: isLoading ? 1 : 1.05 }}
            whileTap={{ scale: isLoading ? 1 : 0.95 }}
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : filterStatus === 'failed' ? (
              <RefreshCw className="w-4 h-4 mr-2" />
            ) : (
              <Play className="w-4 h-4 mr-2" />
            )}
            {isLoading ? 'Activating...' : 
             filterStatus === 'failed' ? 'Retry' : 'Activate'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

// Empty State Component
const EmptyState = ({ filterStatus, theme }) => {
  const themeClasses = getThemeClasses(theme);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`p-8 text-center rounded-xl ${themeClasses.bg.card}`}
    >
      <Check className="w-12 h-12 text-green-600 mx-auto mb-3" />
      <h4 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
        {filterStatus === 'pending' ? 'No Pending Activations' : 'No Failed Activations'}
      </h4>
      <p className="text-gray-600 dark:text-gray-400">
        {filterStatus === 'pending' 
          ? 'All active subscriptions have been activated successfully.'
          : 'There are no subscriptions with failed activation attempts.'
        }
      </p>
    </motion.div>
  );
};

export default ActivationService;