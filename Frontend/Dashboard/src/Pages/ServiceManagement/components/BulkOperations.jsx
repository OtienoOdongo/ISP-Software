// // src/components/ServiceOperations/BulkOperations.jsx
// import React, { useState, useMemo, useCallback, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import {
//   Play, Pause, RefreshCw, Trash2, CheckSquare, Square,
//   AlertTriangle, Check, X, Clock, Filter, Search,
//   Download, Upload, Copy, Edit, Eye, ChevronDown, ChevronUp,
//   Zap, Shield, Users, Wifi, Cable, Calendar
// } from 'lucide-react';
// import { API_ENDPOINTS } from './constants';
// import { useApi } from './hooks/useApi';
// import { useBulkOperations } from './hooks/useBulkOperations';
// import { useDebounce } from './hooks/useDebounce';
// import { usePagination } from './hooks/usePagination';
// import { getThemeClasses } from '../../../components/ServiceManagement/Shared/components';
// import { TableSkeleton } from './common/TableSkeleton';
// import { ConfirmDialog } from './common/ConfirmDialog';
// import { ErrorBoundary } from './common/ErrorBoundary';

// const BulkOperations = ({ subscriptions, onRefresh, theme, addNotification }) => {
//   const themeClasses = getThemeClasses(theme);
  
//   // State
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filterStatus, setFilterStatus] = useState('all');
//   const [filterAccess, setFilterAccess] = useState('all');
//   const [filterPlan, setFilterPlan] = useState('all');
//   const [sortField, setSortField] = useState('created_at');
//   const [sortDirection, setSortDirection] = useState('desc');
//   const [confirmDialog, setConfirmDialog] = useState({ open: false, action: null });
//   const [actionPayload, setActionPayload] = useState({});
//   const [showPreview, setShowPreview] = useState(false);
  
//   // Debounced search
//   const debouncedSearch = useDebounce(searchTerm, 300);
  
//   // Pagination
//   const {
//     page,
//     pageSize,
//     total,
//     totalPages,
//     setTotal,
//     nextPage,
//     prevPage,
//     changePageSize,
//   } = usePagination(1, 20);
  
//   // Bulk operations hook
//   const {
//     selected,
//     loading: bulkLoading,
//     results: bulkResults,
//     toggleSelect,
//     toggleSelectAll,
//     clearSelection,
//     executeBulkAction,
//   } = useBulkOperations((result) => {
//     if (result.success) {
//       addNotification({
//         type: result.failed === 0 ? 'success' : 'warning',
//         message: `Bulk action: ${result.successful} successful, ${result.failed} failed`,
//       });
//       onRefresh();
//     } else {
//       addNotification({ type: 'error', message: result.error });
//     }
//   });
  
//   // Get unique plans for filter
//   const uniquePlans = useMemo(() => {
//     const plans = new Map();
//     subscriptions.forEach(sub => {
//       if (sub.plan_id && !plans.has(sub.plan_id)) {
//         plans.set(sub.plan_id, {
//           id: sub.plan_id,
//           name: sub.plan_name || 'Unknown Plan',
//         });
//       }
//     });
//     return Array.from(plans.values());
//   }, [subscriptions]);
  
//   // Filter subscriptions
//   const filteredSubscriptions = useMemo(() => {
//     return subscriptions.filter(sub => {
//       // Search filter
//       const matchesSearch = debouncedSearch === '' ||
//         (sub.client_name?.toLowerCase().includes(debouncedSearch.toLowerCase())) ||
//         (sub.client_phone?.includes(debouncedSearch)) ||
//         (sub.client_email?.toLowerCase().includes(debouncedSearch.toLowerCase())) ||
//         (sub.plan_name?.toLowerCase().includes(debouncedSearch.toLowerCase())) ||
//         (sub.id?.toLowerCase().includes(debouncedSearch.toLowerCase()));
      
//       // Status filter
//       const matchesStatus = filterStatus === 'all' || sub.status === filterStatus;
      
//       // Access method filter
//       const matchesAccess = filterAccess === 'all' || sub.access_method === filterAccess;
      
//       // Plan filter
//       const matchesPlan = filterPlan === 'all' || sub.plan_id === filterPlan;
      
//       return matchesSearch && matchesStatus && matchesAccess && matchesPlan;
//     });
//   }, [subscriptions, debouncedSearch, filterStatus, filterAccess, filterPlan]);
  
//   // Update total count
//   useEffect(() => {
//     setTotal(filteredSubscriptions.length);
//   }, [filteredSubscriptions.length, setTotal]);
  
//   // Paginate results
//   const paginatedSubscriptions = useMemo(() => {
//     const start = (page - 1) * pageSize;
//     const end = start + pageSize;
//     return filteredSubscriptions.slice(start, end);
//   }, [filteredSubscriptions, page, pageSize]);
  
//   // Handle sort
//   const handleSort = useCallback((field) => {
//     if (sortField === field) {
//       setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
//     } else {
//       setSortField(field);
//       setSortDirection('asc');
//     }
//   }, [sortField]);
  
//   // Handle bulk action confirmation
//   const handleBulkAction = useCallback((action) => {
//     if (selected.size === 0) {
//       addNotification({ type: 'warning', message: 'No items selected' });
//       return;
//     }
    
//     setConfirmDialog({ open: true, action });
//   }, [selected.size, addNotification]);
  
//   // Execute confirmed action
//   const executeConfirmedAction = useCallback(async () => {
//     const { action } = confirmDialog;
//     let endpoint = '';
//     let payload = {};
    
//     switch (action) {
//       case 'activate':
//         endpoint = API_ENDPOINTS.BULK_ACTIVATE;
//         payload = { action: 'activate' };
//         break;
//       case 'deactivate':
//         endpoint = API_ENDPOINTS.BULK_DEACTIVATE;
//         payload = { action: 'deactivate' };
//         break;
//       case 'refresh':
//         endpoint = API_ENDPOINTS.BULK_REFRESH;
//         payload = { action: 'refresh' };
//         break;
//       case 'delete':
//         endpoint = API_ENDPOINTS.BULK_DELETE;
//         payload = { action: 'delete' };
//         break;
//       case 'extend':
//         endpoint = '/api/service_operations/bulk-extend/';
//         payload = { action: 'extend', days: actionPayload.days || 30 };
//         break;
//       case 'change_plan':
//         endpoint = '/api/service_operations/bulk-change-plan/';
//         payload = { action: 'change_plan', plan_id: actionPayload.plan_id };
//         break;
//       default:
//         return;
//     }
    
//     await executeBulkAction(endpoint, action, payload);
//     setConfirmDialog({ open: false, action: null });
//     setActionPayload({});
//   }, [confirmDialog, actionPayload, executeBulkAction]);
  
//   // Get status badge
//   const getStatusBadge = useCallback((status) => {
//     const statusMap = {
//       active: { bg: 'bg-green-100', text: 'text-green-800', icon: Check },
//       pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
//       inactive: { bg: 'bg-gray-100', text: 'text-gray-800', icon: X },
//       failed: { bg: 'bg-red-100', text: 'text-red-800', icon: AlertTriangle },
//       processing: { bg: 'bg-blue-100', text: 'text-blue-800', icon: RefreshCw },
//     };
    
//     const { bg, text, icon: Icon } = statusMap[status] || statusMap.inactive;
    
//     return (
//       <span className={`px-3 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1 ${bg} ${text}`}>
//         <Icon className="w-3 h-3" />
//         {status}
//       </span>
//     );
//   }, []);
  
//   // Get access icon
//   const getAccessIcon = useCallback((method) => {
//     if (method === 'hotspot') {
//       return <Wifi className="w-4 h-4 text-blue-600" />;
//     } else if (method === 'pppoe') {
//       return <Cable className="w-4 h-4 text-green-600" />;
//     }
//     return null;
//   }, []);
  
//   // Preview selected items
//   const selectedPreview = useMemo(() => {
//     return Array.from(selected).map(id => 
//       subscriptions.find(s => s.id === id)
//     ).filter(Boolean);
//   }, [selected, subscriptions]);
  
//   if (!subscriptions.length) {
//     return (
//       <div className={`p-12 text-center rounded-xl ${themeClasses.bg.card} border ${themeClasses.border.light}`}>
//         <RefreshCw className="w-16 h-16 text-gray-400 mx-auto mb-4 animate-spin" />
//         <p className="text-lg">Loading subscriptions...</p>
//       </div>
//     );
//   }
  
//   return (
//     <ErrorBoundary>
//       <div className={`space-y-6 ${themeClasses.bg.primary}`}>
//         {/* Confirm Dialog */}
//         <ConfirmDialog
//           isOpen={confirmDialog.open}
//           onClose={() => setConfirmDialog({ open: false, action: null })}
//           onConfirm={executeConfirmedAction}
//           title={`Confirm Bulk ${confirmDialog.action}`}
//           message={`Are you sure you want to ${confirmDialog.action} ${selected.size} selected subscription(s)?`}
//           confirmText={confirmDialog.action}
//           cancelText="Cancel"
//         />
        
//         {/* Header */}
//         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//           <div>
//             <h2 className="text-2xl font-bold">Bulk Operations</h2>
//             <p className="text-sm text-gray-600 mt-1">
//               Perform actions on multiple subscriptions at once
//             </p>
//           </div>
          
//           <div className="flex gap-3">
//             <button
//               onClick={clearSelection}
//               className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
//               disabled={selected.size === 0}
//             >
//               <X className="w-4 h-4" />
//               Clear ({selected.size})
//             </button>
//             <button
//               onClick={() => setShowPreview(!showPreview)}
//               className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
//             >
//               <Eye className="w-4 h-4" />
//               {showPreview ? 'Hide' : 'Show'} Preview
//             </button>
//           </div>
//         </div>
        
//         {/* Action Buttons */}
//         <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
//           <motion.button
//             whileHover={{ scale: 1.02 }}
//             whileTap={{ scale: 0.98 }}
//             onClick={() => handleBulkAction('activate')}
//             disabled={bulkLoading || selected.size === 0}
//             className={`p-4 rounded-lg flex flex-col items-center gap-2 font-medium
//               ${bulkLoading || selected.size === 0
//                 ? 'bg-gray-300 cursor-not-allowed text-gray-600'
//                 : 'bg-green-600 hover:bg-green-700 text-white'}`}
//           >
//             <Play className="w-6 h-6" />
//             <span>Activate</span>
//             {selected.size > 0 && <span className="text-xs">({selected.size})</span>}
//           </motion.button>
          
//           <motion.button
//             whileHover={{ scale: 1.02 }}
//             whileTap={{ scale: 0.98 }}
//             onClick={() => handleBulkAction('deactivate')}
//             disabled={bulkLoading || selected.size === 0}
//             className={`p-4 rounded-lg flex flex-col items-center gap-2 font-medium
//               ${bulkLoading || selected.size === 0
//                 ? 'bg-gray-300 cursor-not-allowed text-gray-600'
//                 : 'bg-orange-600 hover:bg-orange-700 text-white'}`}
//           >
//             <Pause className="w-6 h-6" />
//             <span>Deactivate</span>
//             {selected.size > 0 && <span className="text-xs">({selected.size})</span>}
//           </motion.button>
          
//           <motion.button
//             whileHover={{ scale: 1.02 }}
//             whileTap={{ scale: 0.98 }}
//             onClick={() => handleBulkAction('refresh')}
//             disabled={bulkLoading || selected.size === 0}
//             className={`p-4 rounded-lg flex flex-col items-center gap-2 font-medium
//               ${bulkLoading || selected.size === 0
//                 ? 'bg-gray-300 cursor-not-allowed text-gray-600'
//                 : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
//           >
//             <RefreshCw className="w-6 h-6" />
//             <span>Refresh</span>
//             {selected.size > 0 && <span className="text-xs">({selected.size})</span>}
//           </motion.button>
          
//           <motion.button
//             whileHover={{ scale: 1.02 }}
//             whileTap={{ scale: 0.98 }}
//             onClick={() => handleBulkAction('delete')}
//             disabled={bulkLoading || selected.size === 0}
//             className={`p-4 rounded-lg flex flex-col items-center gap-2 font-medium
//               ${bulkLoading || selected.size === 0
//                 ? 'bg-gray-300 cursor-not-allowed text-gray-600'
//                 : 'bg-red-600 hover:bg-red-700 text-white'}`}
//           >
//             <Trash2 className="w-6 h-6" />
//             <span>Delete</span>
//             {selected.size > 0 && <span className="text-xs">({selected.size})</span>}
//           </motion.button>
          
//           <motion.button
//             whileHover={{ scale: 1.02 }}
//             whileTap={{ scale: 0.98 }}
//             onClick={() => {
//               const days = prompt('Enter number of days to extend:', '30');
//               if (days && !isNaN(days)) {
//                 setActionPayload({ days: parseInt(days) });
//                 handleBulkAction('extend');
//               }
//             }}
//             disabled={bulkLoading || selected.size === 0}
//             className={`p-4 rounded-lg flex flex-col items-center gap-2 font-medium
//               ${bulkLoading || selected.size === 0
//                 ? 'bg-gray-300 cursor-not-allowed text-gray-600'
//                 : 'bg-purple-600 hover:bg-purple-700 text-white'}`}
//           >
//             <Calendar className="w-6 h-6" />
//             <span>Extend</span>
//             {selected.size > 0 && <span className="text-xs">({selected.size})</span>}
//           </motion.button>
          
//           <motion.button
//             whileHover={{ scale: 1.02 }}
//             whileTap={{ scale: 0.98 }}
//             onClick={() => {
//               const planId = prompt('Enter plan ID to change to:');
//               if (planId) {
//                 setActionPayload({ plan_id: planId });
//                 handleBulkAction('change_plan');
//               }
//             }}
//             disabled={bulkLoading || selected.size === 0}
//             className={`p-4 rounded-lg flex flex-col items-center gap-2 font-medium
//               ${bulkLoading || selected.size === 0
//                 ? 'bg-gray-300 cursor-not-allowed text-gray-600'
//                 : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
//           >
//             <Copy className="w-6 h-6" />
//             <span>Change Plan</span>
//             {selected.size > 0 && <span className="text-xs">({selected.size})</span>}
//           </motion.button>
//         </div>
        
//         {/* Selected Preview */}
//         <AnimatePresence>
//           {showPreview && selected.size > 0 && (
//             <motion.div
//               initial={{ opacity: 0, height: 0 }}
//               animate={{ opacity: 1, height: 'auto' }}
//               exit={{ opacity: 0, height: 0 }}
//               className={`p-4 rounded-lg ${themeClasses.bg.card} border ${themeClasses.border.light} overflow-hidden`}
//             >
//               <h3 className="font-medium mb-3 flex items-center gap-2">
//                 <Eye className="w-4 h-4" />
//                 Selected Items ({selected.size})
//               </h3>
//               <div className="max-h-60 overflow-y-auto space-y-2">
//                 {selectedPreview.map(sub => (
//                   <div key={sub.id} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
//                     <div className="flex-1">
//                       <div className="font-medium">{sub.client_name || 'N/A'}</div>
//                       <div className="text-sm text-gray-600">{sub.plan_name}</div>
//                     </div>
//                     {getAccessIcon(sub.access_method)}
//                     {getStatusBadge(sub.status)}
//                   </div>
//                 ))}
//               </div>
//             </motion.div>
//           )}
//         </AnimatePresence>
        
//         {/* Filters */}
//         <div className="flex flex-col lg:flex-row gap-4">
//           {/* Search */}
//           <div className="relative flex-1">
//             <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
//             <input
//               type="text"
//               placeholder="Search by client, plan, or ID..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className={`pl-10 pr-4 py-3 rounded-lg border ${themeClasses.input} w-full`}
//             />
//           </div>
          
//           {/* Status Filter */}
//           <select
//             value={filterStatus}
//             onChange={(e) => setFilterStatus(e.target.value)}
//             className={`px-4 py-3 rounded-lg border ${themeClasses.input} min-w-40`}
//           >
//             <option value="all">All Status</option>
//             <option value="active">Active</option>
//             <option value="pending">Pending</option>
//             <option value="inactive">Inactive</option>
//             <option value="failed">Failed</option>
//             <option value="processing">Processing</option>
//           </select>
          
//           {/* Access Filter */}
//           <select
//             value={filterAccess}
//             onChange={(e) => setFilterAccess(e.target.value)}
//             className={`px-4 py-3 rounded-lg border ${themeClasses.input} min-w-40`}
//           >
//             <option value="all">All Access</option>
//             <option value="hotspot">Hotspot</option>
//             <option value="pppoe">PPPoE</option>
//           </select>
          
//           {/* Plan Filter */}
//           <select
//             value={filterPlan}
//             onChange={(e) => setFilterPlan(e.target.value)}
//             className={`px-4 py-3 rounded-lg border ${themeClasses.input} min-w-40`}
//           >
//             <option value="all">All Plans</option>
//             {uniquePlans.map(plan => (
//               <option key={plan.id} value={plan.id}>{plan.name}</option>
//             ))}
//           </select>
          
//           {/* Page Size */}
//           <select
//             value={pageSize}
//             onChange={(e) => changePageSize(Number(e.target.value))}
//             className={`px-4 py-3 rounded-lg border ${themeClasses.input} min-w-20`}
//           >
//             <option value={10}>10</option>
//             <option value={20}>20</option>
//             <option value={50}>50</option>
//             <option value={100}>100</option>
//           </select>
//         </div>
        
//         {/* Results count */}
//         <div className="text-sm text-gray-600">
//           Showing {paginatedSubscriptions.length} of {filteredSubscriptions.length} subscriptions
//         </div>
        
//         {/* Selection Controls */}
//         <div className="flex items-center gap-4">
//           <button
//             onClick={() => toggleSelectAll(filteredSubscriptions)}
//             className="flex items-center gap-2 text-sm font-medium hover:text-indigo-600"
//           >
//             {selected.size === filteredSubscriptions.length && filteredSubscriptions.length > 0 ? (
//               <CheckSquare className="w-5 h-5 text-indigo-600" />
//             ) : (
//               <Square className="w-5 h-5" />
//             )}
//             {selected.size === filteredSubscriptions.length ? 'Deselect All' : 'Select All'}
//           </button>
//           <span className="text-sm text-gray-600">
//             {selected.size} selected
//           </span>
//         </div>
        
//         {/* Table */}
//         <div className={`rounded-xl overflow-hidden shadow-lg ${themeClasses.bg.card} border ${themeClasses.border.light}`}>
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead className={`${themeClasses.bg.secondary}`}>
//                 <tr>
//                   <th className="p-4 text-left w-12">
//                     <button onClick={() => toggleSelectAll(paginatedSubscriptions)}>
//                       {selected.size === filteredSubscriptions.length && filteredSubscriptions.length > 0 ? (
//                         <CheckSquare className="w-5 h-5 text-indigo-600" />
//                       ) : (
//                         <Square className="w-5 h-5 text-gray-500" />
//                       )}
//                     </button>
//                   </th>
//                   <th className="p-4 text-left cursor-pointer" onClick={() => handleSort('client_name')}>
//                     <div className="flex items-center gap-2">
//                       Client
//                       {sortField === 'client_name' && (
//                         sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
//                       )}
//                     </div>
//                   </th>
//                   <th className="p-4 text-left cursor-pointer" onClick={() => handleSort('plan_name')}>
//                     <div className="flex items-center gap-2">
//                       Plan
//                       {sortField === 'plan_name' && (
//                         sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
//                       )}
//                     </div>
//                   </th>
//                   <th className="p-4 text-left">Access</th>
//                   <th className="p-4 text-left cursor-pointer" onClick={() => handleSort('status')}>
//                     <div className="flex items-center gap-2">
//                       Status
//                       {sortField === 'status' && (
//                         sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
//                       )}
//                     </div>
//                   </th>
//                   <th className="p-4 text-left cursor-pointer" onClick={() => handleSort('created_at')}>
//                     <div className="flex items-center gap-2">
//                       Created
//                       {sortField === 'created_at' && (
//                         sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
//                       )}
//                     </div>
//                   </th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {paginatedSubscriptions.map(sub => (
//                   <tr key={sub.id} className="border-t hover:bg-gray-50 dark:hover:bg-gray-800">
//                     <td className="p-4">
//                       <button onClick={() => toggleSelect(sub.id)}>
//                         {selected.has(sub.id) ? (
//                           <CheckSquare className="w-5 h-5 text-indigo-600" />
//                         ) : (
//                           <Square className="w-5 h-5 text-gray-500" />
//                         )}
//                       </button>
//                     </td>
//                     <td className="p-4">
//                       <div className="font-medium">{sub.client_name || 'N/A'}</div>
//                       <div className="text-xs text-gray-500">{sub.client_phone || ''}</div>
//                     </td>
//                     <td className="p-4">
//                       <div className="font-medium">{sub.plan_name}</div>
//                       <div className="text-xs text-gray-500">{sub.plan_category || ''}</div>
//                     </td>
//                     <td className="p-4">{getAccessIcon(sub.access_method)}</td>
//                     <td className="p-4">{getStatusBadge(sub.status)}</td>
//                     <td className="p-4 text-sm text-gray-600">
//                       {new Date(sub.created_at).toLocaleDateString()}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
            
//             {paginatedSubscriptions.length === 0 && (
//               <div className="text-center py-12">
//                 <Filter className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//                 <p className="text-gray-600">No subscriptions match your filters</p>
//               </div>
//             )}
//           </div>
//         </div>
        
//         {/* Pagination */}
//         {totalPages > 1 && (
//           <div className="flex items-center justify-between">
//             <div className="text-sm text-gray-600">
//               Page {page} of {totalPages}
//             </div>
//             <div className="flex gap-2">
//               <button
//                 onClick={prevPage}
//                 disabled={page === 1}
//                 className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 disabled:opacity-50"
//               >
//                 Previous
//               </button>
//               <button
//                 onClick={nextPage}
//                 disabled={page === totalPages}
//                 className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 disabled:opacity-50"
//               >
//                 Next
//               </button>
//             </div>
//           </div>
//         )}
        
//         {/* Bulk Results */}
//         <AnimatePresence>
//           {bulkResults && (
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, y: -20 }}
//               className={`p-6 rounded-xl ${
//                 bulkResults.success
//                   ? bulkResults.failed === 0
//                     ? 'bg-green-50 dark:bg-green-900/30 border-green-200'
//                     : 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200'
//                   : 'bg-red-50 dark:bg-red-900/30 border-red-200'
//               } border`}
//             >
//               <h3 className="font-bold mb-4 flex items-center gap-2">
//                 {bulkResults.success ? (
//                   bulkResults.failed === 0 ? (
//                     <Check className="w-5 h-5 text-green-600" />
//                   ) : (
//                     <AlertTriangle className="w-5 h-5 text-yellow-600" />
//                   )
//                 ) : (
//                   <X className="w-5 h-5 text-red-600" />
//                 )}
//                 Bulk Operation Results
//               </h3>
              
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
//                 <div className="text-center">
//                   <div className="text-3xl font-bold">{bulkResults.total}</div>
//                   <div className="text-sm text-gray-600">Total</div>
//                 </div>
//                 <div className="text-center">
//                   <div className="text-3xl font-bold text-green-600">{bulkResults.successful}</div>
//                   <div className="text-sm text-gray-600">Successful</div>
//                 </div>
//                 <div className="text-center">
//                   <div className="text-3xl font-bold text-red-600">{bulkResults.failed}</div>
//                   <div className="text-sm text-gray-600">Failed</div>
//                 </div>
//               </div>
              
//               {bulkResults.errors?.length > 0 && (
//                 <div className="mt-4">
//                   <h4 className="font-medium mb-2">Error Details:</h4>
//                   <div className="max-h-40 overflow-y-auto space-y-2">
//                     {bulkResults.errors.map((err, i) => (
//                       <div key={i} className="text-sm text-red-600 bg-red-50 dark:bg-red-900/30 p-2 rounded">
//                         {err}
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </div>
//     </ErrorBoundary>
//   );
// };

// export default BulkOperations;







// src/Pages/ServiceManagement/components/BulkOperations.jsx
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, RefreshCw, Trash2, CheckSquare, Square,
  AlertTriangle, Check, X, Clock, Filter, Search,
  Download, Upload, Copy, Edit, Eye, ChevronDown, ChevronUp,
  Zap, Shield, Users, Wifi, Cable, Calendar
} from 'lucide-react';
import { API_ENDPOINTS, PAGINATION } from './constants';
import { useApi } from './hooks/useApi';
import { useBulkOperations } from './hooks/useBulkOperations';
import { useDebounce } from './hooks/useDebounce';
import { usePagination } from './hooks/usePagination';
import { getThemeClasses, EnhancedSelect } from '../../../components/ServiceManagement/Shared/components';
import { TableSkeleton } from './common/TableSkeleton';
import { ConfirmDialog } from './common/ConfirmDialog';
import { ErrorBoundary } from './common/ErrorBoundary';

const BulkOperations = ({ subscriptions = [], onRefresh, theme, addNotification }) => {
  const themeClasses = getThemeClasses(theme);
  
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterAccess, setFilterAccess] = useState('all');
  const [filterPlan, setFilterPlan] = useState('all');
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [confirmDialog, setConfirmDialog] = useState({ open: false, action: null });
  const [actionPayload, setActionPayload] = useState({});
  const [showPreview, setShowPreview] = useState(false);
  
  // Debounced search
  const debouncedSearch = useDebounce(searchTerm, 300);
  
  // Pagination
  const {
    page,
    pageSize,
    total,
    totalPages,
    setTotal,
    nextPage,
    prevPage,
    goToPage,
    changePageSize,
  } = usePagination(1, PAGINATION.DEFAULT_PAGE_SIZE);
  
  // Bulk operations hook
  const {
    selected,
    loading: bulkLoading,
    results: bulkResults,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
    executeBulkAction,
  } = useBulkOperations((result) => {
    if (result.success) {
      addNotification({
        type: result.failed === 0 ? 'success' : 'warning',
        message: `Bulk action: ${result.successful} successful, ${result.failed} failed`,
      });
      onRefresh();
    } else {
      addNotification({ type: 'error', message: result.error });
    }
  });
  
  // Get unique plans for filter
  const uniquePlans = useMemo(() => {
    const plans = new Map();
    subscriptions.forEach(sub => {
      if (sub.plan_id && !plans.has(sub.plan_id)) {
        plans.set(sub.plan_id, {
          id: sub.plan_id,
          name: sub.plan_name || 'Unknown Plan',
        });
      }
    });
    return Array.from(plans.values());
  }, [subscriptions]);
  
  // Filter subscriptions
  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter(sub => {
      // Search filter
      const matchesSearch = debouncedSearch === '' ||
        (sub.client_name?.toLowerCase().includes(debouncedSearch.toLowerCase())) ||
        (sub.client_phone?.includes(debouncedSearch)) ||
        (sub.client_email?.toLowerCase().includes(debouncedSearch.toLowerCase())) ||
        (sub.plan_name?.toLowerCase().includes(debouncedSearch.toLowerCase())) ||
        (sub.id?.toLowerCase().includes(debouncedSearch.toLowerCase()));
      
      // Status filter
      const matchesStatus = filterStatus === 'all' || sub.status === filterStatus;
      
      // Access method filter
      const matchesAccess = filterAccess === 'all' || 
        (filterAccess === 'hotspot' && sub.access_method === 'hotspot') ||
        (filterAccess === 'pppoe' && sub.access_method === 'pppoe');
      
      // Plan filter
      const matchesPlan = filterPlan === 'all' || sub.plan_id === filterPlan;
      
      return matchesSearch && matchesStatus && matchesAccess && matchesPlan;
    }).sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      
      // Handle dates
      if (sortField === 'created_at' || sortField === 'updated_at') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }
      
      // Handle strings
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (aVal === bVal) return 0;
      
      const comparison = aVal < bVal ? -1 : 1;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [subscriptions, debouncedSearch, filterStatus, filterAccess, filterPlan, sortField, sortDirection]);
  
  // Update total count
  useEffect(() => {
    setTotal(filteredSubscriptions.length);
  }, [filteredSubscriptions.length, setTotal]);
  
  // Paginate results
  const paginatedSubscriptions = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return filteredSubscriptions.slice(start, end);
  }, [filteredSubscriptions, page, pageSize]);
  
  // Handle sort
  const handleSort = useCallback((field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  }, [sortField]);
  
  // Handle bulk action confirmation
  const handleBulkAction = useCallback((action) => {
    if (selected.size === 0) {
      addNotification({ type: 'warning', message: 'No items selected' });
      return;
    }
    
    setConfirmDialog({ open: true, action });
  }, [selected.size, addNotification]);
  
  // Execute confirmed action
  const executeConfirmedAction = useCallback(async () => {
    const { action } = confirmDialog;
    let endpoint = '';
    let payload = {};
    
    switch (action) {
      case 'activate':
        endpoint = API_ENDPOINTS.BULK_ACTIVATE;
        payload = { action: 'activate' };
        break;
      case 'deactivate':
        endpoint = API_ENDPOINTS.BULK_DEACTIVATE;
        payload = { action: 'deactivate' };
        break;
      case 'refresh':
        endpoint = API_ENDPOINTS.BULK_REFRESH;
        payload = { action: 'refresh' };
        break;
      case 'delete':
        endpoint = API_ENDPOINTS.BULK_DELETE;
        payload = { action: 'delete' };
        break;
      case 'extend':
        endpoint = '/api/service_operations/bulk-extend/';
        payload = { action: 'extend', days: actionPayload.days || 30 };
        break;
      case 'change_plan':
        endpoint = '/api/service_operations/bulk-change-plan/';
        payload = { action: 'change_plan', plan_id: actionPayload.plan_id };
        break;
      default:
        return;
    }
    
    await executeBulkAction(endpoint, action, payload);
    setConfirmDialog({ open: false, action: null });
    setActionPayload({});
  }, [confirmDialog, actionPayload, executeBulkAction]);
  
  // Get status badge
  const getStatusBadge = useCallback((status) => {
    const statusMap = {
      active: { bg: 'bg-green-100', text: 'text-green-800', icon: Check },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
      inactive: { bg: 'bg-gray-100', text: 'text-gray-800', icon: X },
      failed: { bg: 'bg-red-100', text: 'text-red-800', icon: AlertTriangle },
      processing: { bg: 'bg-blue-100', text: 'text-blue-800', icon: RefreshCw },
    };
    
    const { bg, text, icon: Icon } = statusMap[status] || statusMap.inactive;
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1 ${bg} ${text}`}>
        <Icon className="w-3 h-3" />
        {status}
      </span>
    );
  }, []);
  
  // Get access icon
  const getAccessIcon = useCallback((method) => {
    if (method === 'hotspot') {
      return <Wifi className="w-5 h-5 text-blue-600" title="Hotspot" />;
    } else if (method === 'pppoe') {
      return <Cable className="w-5 h-5 text-green-600" title="PPPoE" />;
    }
    return null;
  }, []);
  
  // Preview selected items
  const selectedPreview = useMemo(() => {
    return Array.from(selected).map(id => 
      subscriptions.find(s => s.id === id)
    ).filter(Boolean);
  }, [selected, subscriptions]);
  
  // Options for EnhancedSelect
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'failed', label: 'Failed' }
  ];
  
  const accessOptions = [
    { value: 'all', label: 'All Access' },
    { value: 'hotspot', label: 'Hotspot' },
    { value: 'pppoe', label: 'PPPoE' }
  ];
  
  const planOptions = [
    { value: 'all', label: 'All Plans' },
    ...uniquePlans.map(plan => ({
      value: plan.id,
      label: plan.name
    }))
  ];
  
  const pageSizeOptions = PAGINATION.PAGE_SIZE_OPTIONS.map(size => ({
    value: size,
    label: `${size} / page`
  }));
  
  if (!subscriptions.length) {
    return (
      <div className={`p-12 text-center rounded-xl ${themeClasses.bg.card} border ${themeClasses.border.light}`}>
        <RefreshCw className="w-16 h-16 text-gray-400 mx-auto mb-4 animate-spin" />
        <p className={`text-lg ${themeClasses.text.primary}`}>Loading subscriptions...</p>
      </div>
    );
  }
  
  return (
    <ErrorBoundary>
      <div className={`space-y-6 ${themeClasses.bg.primary}`}>
        {/* Confirm Dialog */}
        <ConfirmDialog
          isOpen={confirmDialog.open}
          onClose={() => setConfirmDialog({ open: false, action: null })}
          onConfirm={executeConfirmedAction}
          title={`Confirm Bulk ${confirmDialog.action}`}
          message={`Are you sure you want to ${confirmDialog.action} ${selected.size} selected subscription(s)?`}
          confirmText={confirmDialog.action}
          cancelText="Cancel"
          theme={theme}
        />
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className={`text-2xl font-bold ${themeClasses.text.primary}`}>Bulk Operations</h2>
            <p className={`text-sm ${themeClasses.text.secondary} mt-1`}>
              Perform actions on multiple subscriptions at once
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={clearSelection}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2 disabled:opacity-50"
              disabled={selected.size === 0}
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">Clear ({selected.size})</span>
            </button>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">{showPreview ? 'Hide' : 'Show'} Preview</span>
            </button>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleBulkAction('activate')}
            disabled={bulkLoading || selected.size === 0}
            className={`p-4 rounded-lg flex flex-col items-center gap-2 font-medium
              ${bulkLoading || selected.size === 0
                ? 'bg-gray-300 cursor-not-allowed text-gray-600'
                : 'bg-green-600 hover:bg-green-700 text-white'}`}
          >
            <Play className="w-6 h-6" />
            <span>Activate</span>
            {selected.size > 0 && <span className="text-xs">({selected.size})</span>}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleBulkAction('deactivate')}
            disabled={bulkLoading || selected.size === 0}
            className={`p-4 rounded-lg flex flex-col items-center gap-2 font-medium
              ${bulkLoading || selected.size === 0
                ? 'bg-gray-300 cursor-not-allowed text-gray-600'
                : 'bg-orange-600 hover:bg-orange-700 text-white'}`}
          >
            <Pause className="w-6 h-6" />
            <span>Deactivate</span>
            {selected.size > 0 && <span className="text-xs">({selected.size})</span>}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleBulkAction('refresh')}
            disabled={bulkLoading || selected.size === 0}
            className={`p-4 rounded-lg flex flex-col items-center gap-2 font-medium
              ${bulkLoading || selected.size === 0
                ? 'bg-gray-300 cursor-not-allowed text-gray-600'
                : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
          >
            <RefreshCw className="w-6 h-6" />
            <span>Refresh</span>
            {selected.size > 0 && <span className="text-xs">({selected.size})</span>}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleBulkAction('delete')}
            disabled={bulkLoading || selected.size === 0}
            className={`p-4 rounded-lg flex flex-col items-center gap-2 font-medium
              ${bulkLoading || selected.size === 0
                ? 'bg-gray-300 cursor-not-allowed text-gray-600'
                : 'bg-red-600 hover:bg-red-700 text-white'}`}
          >
            <Trash2 className="w-6 h-6" />
            <span>Delete</span>
            {selected.size > 0 && <span className="text-xs">({selected.size})</span>}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              const days = prompt('Enter number of days to extend:', '30');
              if (days && !isNaN(days) && parseInt(days) > 0) {
                setActionPayload({ days: parseInt(days) });
                handleBulkAction('extend');
              }
            }}
            disabled={bulkLoading || selected.size === 0}
            className={`p-4 rounded-lg flex flex-col items-center gap-2 font-medium
              ${bulkLoading || selected.size === 0
                ? 'bg-gray-300 cursor-not-allowed text-gray-600'
                : 'bg-purple-600 hover:bg-purple-700 text-white'}`}
          >
            <Calendar className="w-6 h-6" />
            <span>Extend</span>
            {selected.size > 0 && <span className="text-xs">({selected.size})</span>}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              const planId = prompt('Enter plan ID to change to:');
              if (planId) {
                setActionPayload({ plan_id: planId });
                handleBulkAction('change_plan');
              }
            }}
            disabled={bulkLoading || selected.size === 0}
            className={`p-4 rounded-lg flex flex-col items-center gap-2 font-medium
              ${bulkLoading || selected.size === 0
                ? 'bg-gray-300 cursor-not-allowed text-gray-600'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
          >
            <Copy className="w-6 h-6" />
            <span>Change Plan</span>
            {selected.size > 0 && <span className="text-xs">({selected.size})</span>}
          </motion.button>
        </div>
        
        {/* Selected Preview */}
        <AnimatePresence>
          {showPreview && selected.size > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`p-4 rounded-lg ${themeClasses.bg.card} border ${themeClasses.border.light} overflow-hidden`}
            >
              <h3 className={`font-medium mb-3 flex items-center gap-2 ${themeClasses.text.primary}`}>
                <Eye className="w-4 h-4" />
                Selected Items ({selected.size})
              </h3>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {selectedPreview.map(sub => (
                  <div key={sub.id} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="flex-1">
                      <div className={`font-medium ${themeClasses.text.primary}`}>{sub.client_name || 'N/A'}</div>
                      <div className={`text-sm ${themeClasses.text.secondary}`}>{sub.plan_name}</div>
                    </div>
                    {getAccessIcon(sub.access_method)}
                    {getStatusBadge(sub.status)}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by client, plan, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`pl-10 pr-4 py-3 rounded-lg border ${themeClasses.input} w-full`}
            />
          </div>
          
          {/* Status Filter - EnhancedSelect */}
          <div className="min-w-40">
            <EnhancedSelect
              value={filterStatus}
              onChange={setFilterStatus}
              options={statusOptions}
              placeholder="Filter by status"
              theme={theme}
            />
          </div>
          
          {/* Access Filter - EnhancedSelect */}
          <div className="min-w-40">
            <EnhancedSelect
              value={filterAccess}
              onChange={setFilterAccess}
              options={accessOptions}
              placeholder="Filter by access"
              theme={theme}
            />
          </div>
          
          {/* Plan Filter - EnhancedSelect */}
          <div className="min-w-40">
            <EnhancedSelect
              value={filterPlan}
              onChange={setFilterPlan}
              options={planOptions}
              placeholder="Filter by plan"
              theme={theme}
            />
          </div>
          
          {/* Page Size - EnhancedSelect */}
          <div className="min-w-28">
            <EnhancedSelect
              value={pageSize}
              onChange={(value) => changePageSize(Number(value))}
              options={pageSizeOptions}
              placeholder="Page size"
              theme={theme}
            />
          </div>
        </div>
        
        {/* Results count */}
        <div className={`text-sm ${themeClasses.text.tertiary}`}>
          Showing {paginatedSubscriptions.length} of {filteredSubscriptions.length} subscriptions
          {selected.size > 0 && ` • ${selected.size} selected`}
        </div>
        
        {/* Selection Controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => toggleSelectAll(filteredSubscriptions)}
            className="flex items-center gap-2 text-sm font-medium hover:text-indigo-600"
          >
            {selected.size === filteredSubscriptions.length && filteredSubscriptions.length > 0 ? (
              <CheckSquare className="w-5 h-5 text-indigo-600" />
            ) : (
              <Square className="w-5 h-5" />
            )}
            {selected.size === filteredSubscriptions.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>
        
        {/* Table */}
        <div className={`rounded-xl overflow-hidden shadow-lg ${themeClasses.bg.card} border ${themeClasses.border.light}`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${themeClasses.bg.secondary}`}>
                <tr>
                  <th className="p-4 text-left w-12">
                    <button 
                      onClick={() => toggleSelectAll(paginatedSubscriptions)}
                      className="flex items-center gap-2"
                    >
                      {selected.size === filteredSubscriptions.length && filteredSubscriptions.length > 0 ? (
                        <CheckSquare className="w-5 h-5 text-indigo-600" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                  </th>
                  <th className="p-4 text-left cursor-pointer" onClick={() => handleSort('client_name')}>
                    <div className="flex items-center gap-2">
                      Client
                      {sortField === 'client_name' && (
                        sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </th>
                  <th className="p-4 text-left cursor-pointer" onClick={() => handleSort('plan_name')}>
                    <div className="flex items-center gap-2">
                      Plan
                      {sortField === 'plan_name' && (
                        sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </th>
                  <th className="p-4 text-left">Access</th>
                  <th className="p-4 text-left cursor-pointer" onClick={() => handleSort('status')}>
                    <div className="flex items-center gap-2">
                      Status
                      {sortField === 'status' && (
                        sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </th>
                  <th className="p-4 text-left cursor-pointer" onClick={() => handleSort('created_at')}>
                    <div className="flex items-center gap-2">
                      Created
                      {sortField === 'created_at' && (
                        sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedSubscriptions.length === 0 ? (
                  <tr>
                    <td colSpan="6" className={`p-8 text-center ${themeClasses.text.secondary}`}>
                      <Filter className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No subscriptions match your filters</p>
                    </td>
                  </tr>
                ) : (
                  paginatedSubscriptions.map(sub => (
                    <tr key={sub.id} className={`border-t hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${themeClasses.border.light}`}>
                      <td className="p-4">
                        <button onClick={() => toggleSelect(sub.id)}>
                          {selected.has(sub.id) ? (
                            <CheckSquare className="w-5 h-5 text-indigo-600" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-500" />
                          )}
                        </button>
                      </td>
                      <td className="p-4">
                        <div className={`font-medium ${themeClasses.text.primary}`}>{sub.client_name || 'N/A'}</div>
                        <div className={`text-xs ${themeClasses.text.tertiary}`}>{sub.client_phone || ''}</div>
                      </td>
                      <td className="p-4">
                        <div className={`font-medium ${themeClasses.text.primary}`}>{sub.plan_name}</div>
                        <div className={`text-xs ${themeClasses.text.tertiary}`}>{sub.plan_category || ''}</div>
                      </td>
                      <td className="p-4">{getAccessIcon(sub.access_method)}</td>
                      <td className="p-4">{getStatusBadge(sub.status)}</td>
                      <td className={`p-4 text-sm ${themeClasses.text.secondary}`}>
                        {new Date(sub.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className={`flex items-center justify-between px-4 py-3 border-t ${themeClasses.border.light}`}>
            <div className={`text-sm ${themeClasses.text.tertiary}`}>
              Page {page} of {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={prevPage}
                disabled={page === 1}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 disabled:opacity-50"
              >
                <ChevronDown className="w-5 h-5 rotate-90" />
              </button>
              <button
                onClick={nextPage}
                disabled={page === totalPages}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 disabled:opacity-50"
              >
                <ChevronDown className="w-5 h-5 -rotate-90" />
              </button>
            </div>
          </div>
        )}
        
        {/* Bulk Results */}
        <AnimatePresence>
          {bulkResults && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`p-6 rounded-xl ${
                bulkResults.success
                  ? bulkResults.failed === 0
                    ? 'bg-green-50 dark:bg-green-900/30 border-green-200'
                    : 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200'
                  : 'bg-red-50 dark:bg-red-900/30 border-red-200'
              } border`}
            >
              <h3 className={`font-bold mb-4 flex items-center gap-2 ${themeClasses.text.primary}`}>
                {bulkResults.success ? (
                  bulkResults.failed === 0 ? (
                    <Check className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  )
                ) : (
                  <X className="w-5 h-5 text-red-600" />
                )}
                Bulk Operation Results
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-3xl font-bold">{bulkResults.total}</div>
                  <div className={`text-sm ${themeClasses.text.secondary}`}>Total</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{bulkResults.successful}</div>
                  <div className={`text-sm ${themeClasses.text.secondary}`}>Successful</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">{bulkResults.failed}</div>
                  <div className={`text-sm ${themeClasses.text.secondary}`}>Failed</div>
                </div>
              </div>
              
              {bulkResults.errors?.length > 0 && (
                <div className="mt-4">
                  <h4 className={`font-medium mb-2 ${themeClasses.text.primary}`}>Error Details:</h4>
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {bulkResults.errors.map((err, i) => (
                      <div key={i} className="text-sm text-red-600 bg-red-50 dark:bg-red-900/30 p-2 rounded">
                        {err}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ErrorBoundary>
  );
};

export default BulkOperations;