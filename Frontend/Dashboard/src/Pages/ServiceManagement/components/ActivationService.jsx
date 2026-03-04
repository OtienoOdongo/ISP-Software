// // src/components/ServiceOperations/ActivationService.jsx
// import React, { useState, useCallback, useMemo } from 'react';
// import { motion } from 'framer-motion';
// import { Play, RefreshCw, CheckCircle, AlertCircle, Clock, Zap } from 'lucide-react';
// import { API_ENDPOINTS } from './constants'
// import { useApi } from './hooks/useApi'
// import { getThemeClasses } from '../../../components/ServiceManagement/Shared/components';
// import { ConfirmDialog } from './common/ConfirmDialog'

// const ActivationService = ({ subscriptions, onRefresh, theme, addNotification }) => {
//   const themeClasses = getThemeClasses(theme);
//   const [activating, setActivating] = useState(new Set());
//   const [bulkActivating, setBulkActivating] = useState(false);
//   const [confirmDialog, setConfirmDialog] = useState({ open: false, id: null });
  
//   // Pending subscriptions with memoization
//   const pending = useMemo(() => 
//     subscriptions.filter(sub => 
//       sub.status === "pending" || 
//       sub.activation_failed || 
//       !sub.activated
//     ).sort((a, b) => {
//       // Priority: failed first, then by creation date
//       if (a.activation_failed && !b.activation_failed) return -1;
//       if (!a.activation_failed && b.activation_failed) return 1;
//       return new Date(b.created_at) - new Date(a.created_at);
//     }), [subscriptions]);
  
//   // Group by status
//   const grouped = useMemo(() => ({
//     failed: pending.filter(p => p.activation_failed),
//     pending: pending.filter(p => !p.activation_failed && p.status === 'pending'),
//     processing: pending.filter(p => p.status === 'processing'),
//   }), [pending]);
  
//   const handleActivate = useCallback(async (id) => {
//     setActivating(prev => new Set(prev).add(id));
    
//     try {
//       const { fetchData } = useApi(API_ENDPOINTS.SUBSCRIPTION_ACTIVATE(id));
//       await fetchData({}, 'POST');
//       addNotification({ type: 'success', message: 'Activation requested successfully' });
//       onRefresh();
//     } catch (err) {
//       addNotification({ type: 'error', message: 'Failed to request activation' });
//     } finally {
//       setActivating(prev => {
//         const next = new Set(prev);
//         next.delete(id);
//         return next;
//       });
//     }
//   }, [onRefresh, addNotification]);
  
//   const handleBulkActivate = useCallback(async () => {
//     if (pending.length === 0) return;
//     setBulkActivating(true);
    
//     try {
//       // Process in batches of 5 to avoid overwhelming the server
//       const batchSize = 5;
//       const batches = [];
      
//       for (let i = 0; i < pending.length; i += batchSize) {
//         batches.push(pending.slice(i, i + batchSize));
//       }
      
//       let successCount = 0;
//       let failCount = 0;
      
//       for (const batch of batches) {
//         await Promise.all(
//           batch.map(async (sub) => {
//             try {
//               const { fetchData } = useApi(API_ENDPOINTS.SUBSCRIPTION_ACTIVATE(sub.id));
//               await fetchData({}, 'POST');
//               successCount++;
//             } catch {
//               failCount++;
//             }
//           })
//         );
//       }
      
//       addNotification({ 
//         type: successCount > 0 ? 'success' : 'error',
//         message: `Bulk activation: ${successCount} successful, ${failCount} failed`,
//       });
      
//       onRefresh();
//     } catch (err) {
//       addNotification({ type: 'error', message: 'Bulk activation failed' });
//     } finally {
//       setBulkActivating(false);
//     }
//   }, [pending, onRefresh, addNotification]);
  
//   return (
//     <div className={`space-y-6 ${themeClasses.bg.primary}`}>
//       {/* Confirm Dialog */}
//       <ConfirmDialog
//         isOpen={confirmDialog.open}
//         onClose={() => setConfirmDialog({ open: false, id: null })}
//         onConfirm={() => {
//           handleActivate(confirmDialog.id);
//           setConfirmDialog({ open: false, id: null });
//         }}
//         title="Confirm Activation"
//         message="Are you sure you want to activate this subscription?"
//         confirmText="Activate"
//         cancelText="Cancel"
//       />
      
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//         <div>
//           <h2 className="text-2xl font-bold">Activation Service</h2>
//           <p className="text-sm text-gray-600 mt-1">
//             {pending.length} subscription(s) awaiting activation
//           </p>
//         </div>
        
//         {pending.length > 0 && (
//           <div className="flex gap-3 w-full sm:w-auto">
//             <motion.button
//               onClick={handleBulkActivate}
//               disabled={bulkActivating}
//               className={`flex-1 sm:flex-none px-6 py-3 rounded-lg flex items-center justify-center gap-3 font-medium
//                 ${bulkActivating 
//                   ? 'bg-gray-400 cursor-not-allowed' 
//                   : 'bg-green-600 hover:bg-green-700 text-white'}`}
//               whileHover={!bulkActivating ? { scale: 1.05 } : {}}
//               whileTap={!bulkActivating ? { scale: 0.95 } : {}}
//             >
//               {bulkActivating ? (
//                 <RefreshCw className="w-5 h-5 animate-spin" />
//               ) : (
//                 <Zap className="w-5 h-5" />
//               )}
//               {bulkActivating ? 'Activating...' : `Activate All (${pending.length})`}
//             </motion.button>
//           </div>
//         )}
//       </div>
      
//       {pending.length === 0 ? (
//         <div className={`p-12 text-center rounded-xl ${themeClasses.bg.card} border ${themeClasses.border.light}`}>
//           <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
//           <p className="text-lg font-medium">All Subscriptions Activated</p>
//           <p className="text-sm text-gray-600 mt-2">No pending activations at this time</p>
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* Failed Section */}
//           {grouped.failed.length > 0 && (
//             <div className={`p-4 rounded-xl ${themeClasses.bg.card} border ${themeClasses.border.light}`}>
//               <h3 className="font-semibold flex items-center gap-2 text-red-600 mb-4">
//                 <AlertCircle className="w-5 h-5" />
//                 Failed ({grouped.failed.length})
//               </h3>
//               <div className="space-y-3 max-h-96 overflow-y-auto">
//                 {grouped.failed.map(sub => (
//                   <motion.div
//                     key={sub.id}
//                     initial={{ opacity: 0, x: -20 }}
//                     animate={{ opacity: 1, x: 0 }}
//                     className="p-3 border rounded-lg hover:shadow-md transition-shadow"
//                   >
//                     <div className="flex justify-between items-start">
//                       <div>
//                         <div className="font-medium">{sub.client_name || 'N/A'}</div>
//                         <div className="text-sm text-gray-600">{sub.plan_name}</div>
//                         <div className="text-xs text-red-600 mt-1">{sub.activation_error}</div>
//                       </div>
//                       <motion.button
//                         whileHover={{ scale: 1.1 }}
//                         whileTap={{ scale: 0.9 }}
//                         onClick={() => setConfirmDialog({ open: true, id: sub.id })}
//                         disabled={activating.has(sub.id)}
//                         className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 disabled:opacity-50"
//                       >
//                         {activating.has(sub.id) ? (
//                           <RefreshCw className="w-4 h-4 animate-spin" />
//                         ) : (
//                           <Play className="w-4 h-4" />
//                         )}
//                       </motion.button>
//                     </div>
//                   </motion.div>
//                 ))}
//               </div>
//             </div>
//           )}
          
//           {/* Pending Section */}
//           {grouped.pending.length > 0 && (
//             <div className={`p-4 rounded-xl ${themeClasses.bg.card} border ${themeClasses.border.light}`}>
//               <h3 className="font-semibold flex items-center gap-2 text-yellow-600 mb-4">
//                 <Clock className="w-5 h-5" />
//                 Pending ({grouped.pending.length})
//               </h3>
//               <div className="space-y-3 max-h-96 overflow-y-auto">
//                 {grouped.pending.map(sub => (
//                   <motion.div
//                     key={sub.id}
//                     initial={{ opacity: 0, x: -20 }}
//                     animate={{ opacity: 1, x: 0 }}
//                     className="p-3 border rounded-lg hover:shadow-md transition-shadow"
//                   >
//                     <div className="flex justify-between items-start">
//                       <div>
//                         <div className="font-medium">{sub.client_name || 'N/A'}</div>
//                         <div className="text-sm text-gray-600">{sub.plan_name}</div>
//                         <div className="text-xs text-gray-500 mt-1">
//                           Created: {new Date(sub.created_at).toLocaleString()}
//                         </div>
//                       </div>
//                       <motion.button
//                         whileHover={{ scale: 1.1 }}
//                         whileTap={{ scale: 0.9 }}
//                         onClick={() => setConfirmDialog({ open: true, id: sub.id })}
//                         disabled={activating.has(sub.id)}
//                         className="p-2 bg-yellow-100 text-yellow-600 rounded-lg hover:bg-yellow-200 disabled:opacity-50"
//                       >
//                         {activating.has(sub.id) ? (
//                           <RefreshCw className="w-4 h-4 animate-spin" />
//                         ) : (
//                           <Play className="w-4 h-4" />
//                         )}
//                       </motion.button>
//                     </div>
//                   </motion.div>
//                 ))}
//               </div>
//             </div>
//           )}
          
//           {/* Processing Section */}
//           {grouped.processing.length > 0 && (
//             <div className={`p-4 rounded-xl ${themeClasses.bg.card} border ${themeClasses.border.light}`}>
//               <h3 className="font-semibold flex items-center gap-2 text-blue-600 mb-4">
//                 <RefreshCw className="w-5 h-5 animate-spin" />
//                 Processing ({grouped.processing.length})
//               </h3>
//               <div className="space-y-3 max-h-96 overflow-y-auto">
//                 {grouped.processing.map(sub => (
//                   <div
//                     key={sub.id}
//                     className="p-3 border rounded-lg opacity-75"
//                   >
//                     <div className="font-medium">{sub.client_name || 'N/A'}</div>
//                     <div className="text-sm text-gray-600">{sub.plan_name}</div>
//                     <div className="flex items-center gap-2 mt-2 text-xs text-blue-600">
//                       <RefreshCw className="w-3 h-3 animate-spin" />
//                       Activation in progress...
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>
//       )}
      
//       {/* Summary Stats */}
//       {pending.length > 0 && (
//         <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
//           <div className={`p-4 rounded-lg ${themeClasses.bg.card} border ${themeClasses.border.light}`}>
//             <div className="text-2xl font-bold text-red-600">{grouped.failed.length}</div>
//             <div className="text-sm text-gray-600">Failed</div>
//           </div>
//           <div className={`p-4 rounded-lg ${themeClasses.bg.card} border ${themeClasses.border.light}`}>
//             <div className="text-2xl font-bold text-yellow-600">{grouped.pending.length}</div>
//             <div className="text-sm text-gray-600">Pending</div>
//           </div>
//           <div className={`p-4 rounded-lg ${themeClasses.bg.card} border ${themeClasses.border.light}`}>
//             <div className="text-2xl font-bold text-blue-600">{grouped.processing.length}</div>
//             <div className="text-sm text-gray-600">Processing</div>
//           </div>
//           <div className={`p-4 rounded-lg ${themeClasses.bg.card} border ${themeClasses.border.light}`}>
//             <div className="text-2xl font-bold">{pending.length}</div>
//             <div className="text-sm text-gray-600">Total</div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ActivationService;










// src/Pages/ServiceManagement/components/ActivationService.jsx
import React, { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Play, RefreshCw, CheckCircle, AlertCircle, Clock, Zap, Filter } from 'lucide-react';
import { API_ENDPOINTS } from './constants';
import { useApi } from './hooks/useApi';
import { getThemeClasses, EnhancedSelect } from '../../../components/ServiceManagement/Shared/components';
import { ConfirmDialog } from './common/ConfirmDialog';
import { LoadingSpinner } from './common/LoadingSpinner';

const ActivationService = ({ subscriptions, onRefresh, theme, addNotification }) => {
  const themeClasses = getThemeClasses(theme);
  const [activating, setActivating] = useState(new Set());
  const [bulkActivating, setBulkActivating] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, id: null });
  const [filterType, setFilterType] = useState('all');
  
  // Filter options for EnhancedSelect
  const filterOptions = [
    { value: 'all', label: 'All Pending' },
    { value: 'failed', label: 'Failed Only' },
    { value: 'pending', label: 'Pending Only' },
    { value: 'processing', label: 'Processing Only' }
  ];
  
  // Pending subscriptions with memoization
  const pending = useMemo(() => 
    subscriptions.filter(sub => 
      sub.status === "pending" || 
      sub.activation_failed || 
      !sub.activated
    ).sort((a, b) => {
      // Priority: failed first, then by creation date
      if (a.activation_failed && !b.activation_failed) return -1;
      if (!a.activation_failed && b.activation_failed) return 1;
      return new Date(b.created_at) - new Date(a.created_at);
    }), [subscriptions]);
  
  // Filter pending by type
  const filteredPending = useMemo(() => {
    if (filterType === 'all') return pending;
    if (filterType === 'failed') return pending.filter(p => p.activation_failed);
    if (filterType === 'pending') return pending.filter(p => !p.activation_failed && p.status === 'pending');
    if (filterType === 'processing') return pending.filter(p => p.status === 'processing');
    return pending;
  }, [pending, filterType]);
  
  // Group by status
  const grouped = useMemo(() => ({
    failed: filteredPending.filter(p => p.activation_failed),
    pending: filteredPending.filter(p => !p.activation_failed && p.status === 'pending'),
    processing: filteredPending.filter(p => p.status === 'processing'),
  }), [filteredPending]);
  
  const handleActivate = useCallback(async (id) => {
    setActivating(prev => new Set(prev).add(id));
    
    try {
      const { fetchData } = useApi(API_ENDPOINTS.SUBSCRIPTION_ACTIVATE(id));
      await fetchData({}, 'POST');
      addNotification({ type: 'success', message: 'Activation requested successfully' });
      onRefresh();
    } catch (err) {
      addNotification({ type: 'error', message: 'Failed to request activation' });
    } finally {
      setActivating(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }, [onRefresh, addNotification]);
  
  const handleBulkActivate = useCallback(async () => {
    if (filteredPending.length === 0) return;
    setBulkActivating(true);
    
    try {
      // Process in batches of 5 to avoid overwhelming the server
      const batchSize = 5;
      const batches = [];
      
      for (let i = 0; i < filteredPending.length; i += batchSize) {
        batches.push(filteredPending.slice(i, i + batchSize));
      }
      
      let successCount = 0;
      let failCount = 0;
      
      for (const batch of batches) {
        await Promise.all(
          batch.map(async (sub) => {
            try {
              const { fetchData } = useApi(API_ENDPOINTS.SUBSCRIPTION_ACTIVATE(sub.id));
              await fetchData({}, 'POST');
              successCount++;
            } catch {
              failCount++;
            }
          })
        );
      }
      
      addNotification({ 
        type: successCount > 0 ? 'success' : 'error',
        message: `Bulk activation: ${successCount} successful, ${failCount} failed`,
      });
      
      onRefresh();
    } catch (err) {
      addNotification({ type: 'error', message: 'Bulk activation failed' });
    } finally {
      setBulkActivating(false);
    }
  }, [filteredPending, onRefresh, addNotification]);
  
  return (
    <div className={`space-y-6 ${themeClasses.bg.primary}`}>
      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, id: null })}
        onConfirm={() => {
          handleActivate(confirmDialog.id);
          setConfirmDialog({ open: false, id: null });
        }}
        title="Confirm Activation"
        message="Are you sure you want to activate this subscription?"
        confirmText="Activate"
        cancelText="Cancel"
        theme={theme}
      />
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${themeClasses.text.primary}`}>Activation Service</h2>
          <p className={`text-sm ${themeClasses.text.secondary} mt-1`}>
            {filteredPending.length} of {pending.length} subscription(s) awaiting activation
          </p>
        </div>
        
        <div className="flex gap-3 w-full sm:w-auto">
          {/* Filter Dropdown - Using EnhancedSelect */}
          <div className="w-40">
            <EnhancedSelect
              value={filterType}
              onChange={setFilterType}
              options={filterOptions}
              placeholder="Filter by"
              theme={theme}
            />
          </div>
          
          {filteredPending.length > 0 && (
            <motion.button
              onClick={handleBulkActivate}
              disabled={bulkActivating}
              className={`flex-1 sm:flex-none px-6 py-2 rounded-lg flex items-center justify-center gap-2 font-medium
                ${bulkActivating 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700 text-white'}`}
              whileHover={!bulkActivating ? { scale: 1.05 } : {}}
              whileTap={!bulkActivating ? { scale: 0.95 } : {}}
            >
              {bulkActivating ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Zap className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">
                {bulkActivating ? 'Activating...' : `Activate (${filteredPending.length})`}
              </span>
            </motion.button>
          )}
        </div>
      </div>
      
      {filteredPending.length === 0 ? (
        <div className={`p-12 text-center rounded-xl ${themeClasses.bg.card} border ${themeClasses.border.light}`}>
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <p className={`text-lg font-medium ${themeClasses.text.primary}`}>No Pending Activations</p>
          <p className={`text-sm ${themeClasses.text.secondary} mt-2`}>
            {filterType === 'all' 
              ? 'All subscriptions are activated' 
              : `No ${filterType} subscriptions found`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Failed Section */}
          {grouped.failed.length > 0 && (
            <div className={`p-4 rounded-xl ${themeClasses.bg.card} border ${themeClasses.border.light}`}>
              <h3 className={`font-semibold flex items-center gap-2 text-red-600 mb-4`}>
                <AlertCircle className="w-5 h-5" />
                Failed ({grouped.failed.length})
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {grouped.failed.map(sub => (
                  <motion.div
                    key={sub.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-3 border rounded-lg hover:shadow-md transition-shadow ${themeClasses.border.light}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className={`font-medium ${themeClasses.text.primary}`}>
                          {sub.client_name || 'N/A'}
                        </div>
                        <div className={`text-sm ${themeClasses.text.secondary}`}>{sub.plan_name}</div>
                        <div className="text-xs text-red-600 mt-1">{sub.activation_error || 'Unknown error'}</div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setConfirmDialog({ open: true, id: sub.id })}
                        disabled={activating.has(sub.id)}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 disabled:opacity-50 ml-2"
                      >
                        {activating.has(sub.id) ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
          
          {/* Pending Section */}
          {grouped.pending.length > 0 && (
            <div className={`p-4 rounded-xl ${themeClasses.bg.card} border ${themeClasses.border.light}`}>
              <h3 className={`font-semibold flex items-center gap-2 text-yellow-600 mb-4`}>
                <Clock className="w-5 h-5" />
                Pending ({grouped.pending.length})
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {grouped.pending.map(sub => (
                  <motion.div
                    key={sub.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-3 border rounded-lg hover:shadow-md transition-shadow ${themeClasses.border.light}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className={`font-medium ${themeClasses.text.primary}`}>
                          {sub.client_name || 'N/A'}
                        </div>
                        <div className={`text-sm ${themeClasses.text.secondary}`}>{sub.plan_name}</div>
                        <div className={`text-xs ${themeClasses.text.tertiary} mt-1`}>
                          Created: {new Date(sub.created_at).toLocaleString()}
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setConfirmDialog({ open: true, id: sub.id })}
                        disabled={activating.has(sub.id)}
                        className="p-2 bg-yellow-100 text-yellow-600 rounded-lg hover:bg-yellow-200 disabled:opacity-50 ml-2"
                      >
                        {activating.has(sub.id) ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
          
          {/* Processing Section */}
          {grouped.processing.length > 0 && (
            <div className={`p-4 rounded-xl ${themeClasses.bg.card} border ${themeClasses.border.light}`}>
              <h3 className={`font-semibold flex items-center gap-2 text-blue-600 mb-4`}>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Processing ({grouped.processing.length})
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {grouped.processing.map(sub => (
                  <div
                    key={sub.id}
                    className={`p-3 border rounded-lg opacity-75 ${themeClasses.border.light}`}
                  >
                    <div className={`font-medium ${themeClasses.text.primary}`}>
                      {sub.client_name || 'N/A'}
                    </div>
                    <div className={`text-sm ${themeClasses.text.secondary}`}>{sub.plan_name}</div>
                    <div className="flex items-center gap-2 mt-2 text-xs text-blue-600">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      Activation in progress...
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Summary Stats */}
      {filteredPending.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div className={`p-4 rounded-lg ${themeClasses.bg.card} border ${themeClasses.border.light}`}>
            <div className="text-2xl font-bold text-red-600">{grouped.failed.length}</div>
            <div className={`text-sm ${themeClasses.text.secondary}`}>Failed</div>
          </div>
          <div className={`p-4 rounded-lg ${themeClasses.bg.card} border ${themeClasses.border.light}`}>
            <div className="text-2xl font-bold text-yellow-600">{grouped.pending.length}</div>
            <div className={`text-sm ${themeClasses.text.secondary}`}>Pending</div>
          </div>
          <div className={`p-4 rounded-lg ${themeClasses.bg.card} border ${themeClasses.border.light}`}>
            <div className="text-2xl font-bold text-blue-600">{grouped.processing.length}</div>
            <div className={`text-sm ${themeClasses.text.secondary}`}>Processing</div>
          </div>
          <div className={`p-4 rounded-lg ${themeClasses.bg.card} border ${themeClasses.border.light}`}>
            <div className="text-2xl font-bold">{filteredPending.length}</div>
            <div className={`text-sm ${themeClasses.text.secondary}`}>Total</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivationService;