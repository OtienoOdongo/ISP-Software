



// // src/Pages/NetworkManagement/components/Audit/AuditLogViewer.jsx - COMPLETELY REWRITTEN
// import React, { useState, useCallback, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { 
//   Search, Filter, Download, Calendar, User, Server, 
//   RefreshCw, FileText, Trash2, Eye, ChevronDown, ChevronUp,
//   AlertCircle, CheckCircle, XCircle, Info, Clock, MoreVertical,
//   Settings, Wifi, Shield, Network, AlertTriangle
// } from 'lucide-react';
// import CustomButton from '../Common/CustomButton';
// import InputField from '../Common/InputField';
// import { getThemeClasses, EnhancedSelect } from '../../../../components/ServiceManagement/Shared/components';
// import { toast } from 'react-hot-toast';
// import { useAuth } from '../../../../context/AuthContext'
// import api from '../../../../api'

// const AuditLogViewer = ({ theme = "light", routerId = null, showFilters = true }) => {
//   const themeClasses = getThemeClasses(theme);
//   const { isAuthenticated, logout } = useAuth();
  
//   // Enhanced state with loading and error states
//   const [logs, setLogs] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [exporting, setExporting] = useState(false);
//   const [hasError, setHasError] = useState(false);
//   const [retryCount, setRetryCount] = useState(0);
  
//   const [filters, setFilters] = useState({
//     action: '',
//     router_id: routerId || '',
//     user_id: '',
//     days: 7,
//     search: '',
//     status: ''
//   });
  
//   const [expandedLog, setExpandedLog] = useState(null);
//   const [pagination, setPagination] = useState({
//     page: 1,
//     page_size: 20,
//     total_count: 0,
//     total_pages: 1
//   });

//   // Action types with proper icons
//   const actionTypes = [
//     { value: 'create', label: 'Create', icon: CheckCircle, color: 'green' },
//     { value: 'update', label: 'Update', icon: RefreshCw, color: 'blue' },
//     { value: 'delete', label: 'Delete', icon: Trash2, color: 'red' },
//     { value: 'user_activation', label: 'User Activation', icon: User, color: 'purple' },
//     { value: 'user_deactivation', label: 'User Deactivation', icon: User, color: 'orange' },
//     { value: 'bulk_operation', label: 'Bulk Operation', icon: Server, color: 'indigo' },
//     { value: 'configure', label: 'Configure', icon: Settings, color: 'blue' },
//     { value: 'connection_test', label: 'Connection Test', icon: Wifi, color: 'green' },
//     { value: 'script_configuration', label: 'Script Configuration', icon: FileText, color: 'purple' },
//     { value: 'vpn_configuration', label: 'VPN Configuration', icon: Shield, color: 'red' },
//     { value: 'hotspot_config', label: 'Hotspot Config', icon: Wifi, color: 'green' },
//     { value: 'pppoe_config', label: 'PPPoE Config', icon: Network, color: 'blue' }
//   ];

//   const statusTypes = [
//     { value: 'success', label: 'Success' },
//     { value: 'failed', label: 'Failed' },
//     { value: 'warning', label: 'Warning' }
//   ];

//   const timeRanges = [
//     { value: 1, label: 'Last 24 hours' },
//     { value: 7, label: 'Last 7 days' },
//     { value: 30, label: 'Last 30 days' },
//     { value: 90, label: 'Last 90 days' }
//   ];

//   // Enhanced fetch with error handling and retry logic
//   const fetchAuditLogs = useCallback(async (page = 1, isRetry = false) => {
//     if (!isAuthenticated) {
//       toast.error('Please log in to view audit logs');
//       return;
//     }

//     // Don't show loading toast for retries
//     if (!isRetry) {
//       setLoading(true);
//       setHasError(false);
//     }

//     try {
//       const params = new URLSearchParams({
//         page: page.toString(),
//         page_size: pagination.page_size.toString()
//       });
      
//       if (filters.action) params.append('action', filters.action);
//       if (filters.router_id) params.append('router_id', filters.router_id);
//       if (filters.user_id) params.append('user_id', filters.user_id);
//       if (filters.days) params.append('days', filters.days);
//       if (filters.search) params.append('search', filters.search);
//       if (filters.status) params.append('status', filters.status);

//       // Use smart fetch with fallback
//       const response = await api.smartFetch({
//         method: 'get',
//         url: `/api/network_management/audit-logs/?${params}`
//       }, {
//         retries: 2,
//         fallbackData: { logs: [], total_count: 0 },
//         showToast: !isRetry
//       });
      
//       const data = response;
      
//       // Handle different response formats gracefully
//       let logsArray = [];
//       let totalCount = 0;
      
//       if (Array.isArray(data)) {
//         logsArray = data;
//         totalCount = data.length;
//       } else if (data && Array.isArray(data.logs)) {
//         logsArray = data.logs;
//         totalCount = data.total_count || data.logs.length;
//       } else if (data && data.results && Array.isArray(data.results)) {
//         logsArray = data.results;
//         totalCount = data.count || data.results.length;
//       } else if (data && typeof data === 'object') {
//         // Try to find any array in the response
//         const possibleArrays = Object.values(data).filter(item => Array.isArray(item));
//         logsArray = possibleArrays.length > 0 ? possibleArrays[0] : [];
//         totalCount = data.total_count || logsArray.length;
//       } else {
//         // Fallback to empty array
//         logsArray = [];
//         totalCount = 0;
//       }
      
//       setLogs(logsArray);
//       setPagination(prev => ({
//         ...prev,
//         page,
//         total_count: totalCount,
//         total_pages: Math.ceil(totalCount / prev.page_size)
//       }));
      
//       setRetryCount(0);
      
//       // Show success message only for first load or after retry
//       if (isRetry && logsArray.length > 0) {
//         toast.success('Audit logs loaded successfully');
//       }
      
//     } catch (error) {
//       console.error('Error fetching audit logs:', error);
      
//       if (!isRetry) {
//         setHasError(true);
//         setRetryCount(prev => prev + 1);
//       }
      
//       // Don't show duplicate toasts (interceptor already shows them)
//       if (error.response?.status === 401) {
//         toast.error('Session expired. Please log in again.');
//         logout();
//       }
      
//       setLogs([]);
//     } finally {
//       if (!isRetry) {
//         setLoading(false);
//       }
//     }
//   }, [filters, pagination.page_size, isAuthenticated, logout]);

//   const exportLogs = async (format = 'json') => {
//     if (!isAuthenticated) {
//       toast.error('Please log in to export audit logs');
//       return;
//     }

//     setExporting(true);
//     const toastId = toast.loading(`Exporting audit logs as ${format.toUpperCase()}...`);
    
//     try {
//       const params = new URLSearchParams({ format });
//       if (filters.action) params.append('action', filters.action);
//       if (filters.router_id) params.append('router_id', filters.router_id);
//       if (filters.days) params.append('days', filters.days);

//       const response = await api.get(`/api/network_management/audit-logs/export/?${params}`, {
//         responseType: 'blob',
//         timeout: 45000 // Longer timeout for exports
//       });
      
//       const blob = new Blob([response.data]);
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       a.href = url;
//       a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.${format}`;
//       document.body.appendChild(a);
//       a.click();
//       window.URL.revokeObjectURL(url);
//       document.body.removeChild(a);
      
//       toast.success(`Audit logs exported as ${format.toUpperCase()}`, { id: toastId });
//     } catch (error) {
//       console.error('Export error:', error);
      
//       if (error.response?.status === 401) {
//         toast.error('Session expired. Please log in again.', { id: toastId });
//         logout();
//       } else {
//         toast.error('Failed to export audit logs', { id: toastId });
//       }
//     } finally {
//       setExporting(false);
//     }
//   };

//   const clearLogs = async () => {
//     if (!isAuthenticated) {
//       toast.error('Please log in to clear audit logs');
//       return;
//     }

//     if (!window.confirm('Are you sure you want to clear all audit logs? This action cannot be undone.')) {
//       return;
//     }

//     const toastId = toast.loading('Clearing audit logs...');
    
//     try {
//       await api.post('/api/network_management/audit-logs/cleanup/', {
//         dry_run: false,
//         retention_days: 0
//       });

//       toast.success('Audit logs cleared successfully', { id: toastId });
//       fetchAuditLogs(1);
//     } catch (error) {
//       console.error('Clear logs error:', error);
      
//       if (error.response?.status === 401) {
//         toast.error('Session expired. Please log in again.', { id: toastId });
//         logout();
//       } else {
//         toast.error('Failed to clear audit logs', { id: toastId });
//       }
//     }
//   };

//   // Auto-retry on error
//   useEffect(() => {
//     if (hasError && retryCount < 3) {
//       const timer = setTimeout(() => {
//         toast.loading('Retrying to load audit logs...');
//         fetchAuditLogs(pagination.page, true);
//       }, 3000 * retryCount); // Exponential backoff
      
//       return () => clearTimeout(timer);
//     }
//   }, [hasError, retryCount, pagination.page, fetchAuditLogs]);

//   useEffect(() => {
//     if (isAuthenticated) {
//       fetchAuditLogs(1);
//     }
//   }, [fetchAuditLogs, isAuthenticated]);

//   const getActionConfig = (action) => {
//     return actionTypes.find(a => a.value === action) || { label: action, color: 'gray', icon: FileText };
//   };

//   const getStatusIcon = (status) => {
//     switch (status) {
//       case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
//       case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
//       case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
//       default: return <Info className="w-4 h-4 text-gray-500" />;
//     }
//   };

//   const formatChanges = (changes) => {
//     if (!changes || typeof changes !== 'object') return null;
    
//     if (Array.isArray(changes)) {
//       return changes.map((change, index) => (
//         <div key={index} className="text-sm">
//           {JSON.stringify(change)}
//         </div>
//       ));
//     }
    
//     return Object.entries(changes).map(([key, value]) => (
//       <div key={key} className="flex justify-between text-sm py-1 border-b border-gray-200 dark:border-gray-600 last:border-b-0">
//         <span className="font-medium text-gray-700 dark:text-gray-300">{key}:</span>
//         <span className="text-gray-600 dark:text-gray-400">
//           {typeof value === 'object' ? JSON.stringify(value) : String(value)}
//         </span>
//       </div>
//     ));
//   };

//   const LogDetailView = ({ log }) => (
//     <motion.div
//       initial={{ opacity: 0, height: 0 }}
//       animate={{ opacity: 1, height: 'auto' }}
//       exit={{ opacity: 0, height: 0 }}
//       className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600"
//     >
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
//         <div>
//           <h5 className="font-medium mb-2 text-gray-700 dark:text-gray-300">Details</h5>
//           <div className="space-y-2">
//             {log.user && (
//               <div className="flex justify-between">
//                 <span className="text-gray-600 dark:text-gray-400">User:</span>
//                 <span className="font-medium">{log.user.username}</span>
//               </div>
//             )}
//             {log.ip_address && (
//               <div className="flex justify-between">
//                 <span className="text-gray-600 dark:text-gray-400">IP Address:</span>
//                 <span className="font-medium">{log.ip_address}</span>
//               </div>
//             )}
//             {log.user_agent && (
//               <div className="flex justify-between">
//                 <span className="text-gray-600 dark:text-gray-400">User Agent:</span>
//                 <span className="font-medium text-xs truncate">{log.user_agent}</span>
//               </div>
//             )}
//             {log.status_code && (
//               <div className="flex justify-between">
//                 <span className="text-gray-600 dark:text-gray-400">Status Code:</span>
//                 <span className="font-medium">{log.status_code}</span>
//               </div>
//             )}
//           </div>
//         </div>
        
//         <div>
//           <h5 className="font-medium mb-2 text-gray-700 dark:text-gray-300">Changes</h5>
//           <div className="max-h-32 overflow-y-auto">
//             {log.changes && Object.keys(log.changes).length > 0 ? (
//               formatChanges(log.changes)
//             ) : (
//               <p className="text-gray-500 dark:text-gray-400 text-sm">No changes recorded</p>
//             )}
//           </div>
//         </div>
//       </div>
//     </motion.div>
//   );

//   // Skeleton loader for better UX
//   const SkeletonLoader = () => (
//     <div className="space-y-3">
//       {[...Array(5)].map((_, index) => (
//         <div key={index} className={`p-4 rounded-lg border ${themeClasses.bg.card} ${themeClasses.border.medium} animate-pulse`}>
//           <div className="flex items-start justify-between">
//             <div className="flex items-start space-x-3 flex-1">
//               <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
//               <div className="flex-1 space-y-2">
//                 <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
//                 <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
//                 <div className="flex space-x-4">
//                   <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
//                   <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
//                 </div>
//               </div>
//             </div>
//             <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
//           </div>
//         </div>
//       ))}
//     </div>
//   );

//   if (!isAuthenticated) {
//     return (
//       <div className={`p-6 rounded-xl border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//         <div className="text-center py-12">
//           <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
//           <h3 className={`text-lg font-semibold mb-2 ${themeClasses.text.primary}`}>
//             Authentication Required
//           </h3>
//           <p className={themeClasses.text.tertiary}>
//             Please log in to view audit logs
//           </p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className={`p-6 rounded-xl border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//       {/* Header */}
//       <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
//         <div>
//           <h3 className={`text-lg font-semibold flex items-center ${themeClasses.text.primary}`}>
//             <FileText className="w-5 h-5 mr-2" />
//             Audit Logs
//           </h3>
//           <p className={`text-sm ${themeClasses.text.tertiary} mt-1`}>
//             {loading ? 'Loading...' : `${pagination.total_count} total logs`} • Tracking system activities and changes
//           </p>
//         </div>
        
//         <div className="flex flex-wrap gap-2">
//           <CustomButton
//             onClick={() => exportLogs('csv')}
//             icon={<Download className="w-4 h-4" />}
//             label="CSV"
//             variant="secondary"
//             size="sm"
//             loading={exporting}
//             disabled={logs.length === 0}
//             theme={theme}
//           />
//           <CustomButton
//             onClick={() => exportLogs('json')}
//             icon={<Download className="w-4 h-4" />}
//             label="JSON"
//             variant="secondary"
//             size="sm"
//             loading={exporting}
//             disabled={logs.length === 0}
//             theme={theme}
//           />
//           <CustomButton
//             onClick={clearLogs}
//             icon={<Trash2 className="w-4 h-4" />}
//             label="Clear Logs"
//             variant="danger"
//             size="sm"
//             theme={theme}
//           />
//           <CustomButton
//             onClick={() => fetchAuditLogs(1)}
//             icon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
//             label="Refresh"
//             variant="secondary"
//             size="sm"
//             disabled={loading}
//             theme={theme}
//           />
//         </div>
//       </div>

//       {/* Error State */}
//       {hasError && retryCount >= 3 && (
//         <div className={`mb-6 p-4 rounded-lg border ${
//           theme === 'dark' ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'
//         }`}>
//           <div className="flex items-center">
//             <AlertTriangle className="w-5 h-5 text-red-500 mr-3" />
//             <div>
//               <h4 className={`font-medium ${theme === 'dark' ? 'text-red-300' : 'text-red-800'}`}>
//                 Unable to load audit logs
//               </h4>
//               <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>
//                 Please check your connection and try again.
//               </p>
//               <button
//                 onClick={() => {
//                   setHasError(false);
//                   setRetryCount(0);
//                   fetchAuditLogs(1);
//                 }}
//                 className={`mt-2 px-4 py-2 rounded text-sm ${
//                   theme === 'dark' 
//                     ? 'bg-red-700 hover:bg-red-600 text-white' 
//                     : 'bg-red-100 hover:bg-red-200 text-red-700'
//                 }`}
//               >
//                 Try Again
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Filters */}
//       {showFilters && !hasError && (
//         <motion.div 
//           initial={{ opacity: 0, y: -10 }}
//           animate={{ opacity: 1, y: 0 }}
//           className={`p-4 rounded-lg border mb-6 ${themeClasses.bg.card} ${themeClasses.border.medium}`}
//         >
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
//             <div>
//               <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
//                 Action Type
//               </label>
//               <EnhancedSelect
//                 value={filters.action}
//                 onChange={(value) => setFilters(prev => ({ ...prev, action: value }))}
//                 options={actionTypes.map(a => ({ value: a.value, label: a.label }))}
//                 placeholder="All Actions"
//                 theme={theme}
//                 className="w-full"
//               />
//             </div>
            
//             <div>
//               <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
//                 Time Range
//               </label>
//               <EnhancedSelect
//                 value={filters.days}
//                 onChange={(value) => setFilters(prev => ({ ...prev, days: value }))}
//                 options={timeRanges}
//                 placeholder="Select time range"
//                 theme={theme}
//                 className="w-full"
//               />
//             </div>

//             <div>
//               <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
//                 Status
//               </label>
//               <EnhancedSelect
//                 value={filters.status}
//                 onChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
//                 options={statusTypes}
//                 placeholder="All Status"
//                 theme={theme}
//                 className="w-full"
//               />
//             </div>

//             <div>
//               <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
//                 Search
//               </label>
//               <InputField
//                 value={filters.search}
//                 onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
//                 placeholder="Search logs..."
//                 icon={<Search className="w-4 h-4" />}
//                 theme={theme}
//               />
//             </div>

//             <div className="flex items-end">
//               <CustomButton
//                 onClick={() => setFilters({
//                   action: '',
//                   router_id: routerId || '',
//                   user_id: '',
//                   days: 7,
//                   search: '',
//                   status: ''
//                 })}
//                 label="Clear Filters"
//                 variant="secondary"
//                 size="sm"
//                 fullWidth
//                 theme={theme}
//               />
//             </div>
//           </div>
//         </motion.div>
//       )}

//       {/* Logs List */}
//       <div className="space-y-3 max-h-96 overflow-y-auto">
//         {loading ? (
//           <SkeletonLoader />
//         ) : hasError ? (
//           <div className="text-center py-12">
//             <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
//             <h4 className={`font-medium mb-2 ${themeClasses.text.primary}`}>Temporary Issue</h4>
//             <p className={themeClasses.text.tertiary}>
//               We're having trouble loading audit logs. Please try refreshing.
//             </p>
//           </div>
//         ) : (Array.isArray(logs) && logs.length === 0) ? (
//           <div className="text-center py-12">
//             <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
//             <h4 className={`font-medium mb-2 ${themeClasses.text.primary}`}>No audit logs found</h4>
//             <p className={themeClasses.text.tertiary}>
//               {Object.values(filters).some(v => v) 
//                 ? 'Try adjusting your filters to see more results' 
//                 : 'System activities will appear here as they occur'
//               }
//             </p>
//           </div>
//         ) : Array.isArray(logs) ? (
//           logs.map((log) => {
//             const actionConfig = getActionConfig(log.action);
//             const ActionIcon = actionConfig.icon;
            
//             return (
//               <motion.div
//                 key={log.id}
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 className={`p-4 rounded-lg border cursor-pointer transition-colors ${
//                   themeClasses.border.medium
//                 } hover:${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}
//                 onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
//               >
//                 <div className="flex items-start justify-between mb-3">
//                   <div className="flex items-start space-x-3 flex-1">
//                     <div className={`p-2 rounded-full ${
//                       actionConfig.color === 'green' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
//                       actionConfig.color === 'red' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
//                       actionConfig.color === 'blue' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
//                       actionConfig.color === 'purple' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' :
//                       actionConfig.color === 'orange' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' :
//                       actionConfig.color === 'indigo' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' :
//                       'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
//                     }`}>
//                       <ActionIcon className="w-4 h-4" />
//                     </div>
                    
//                     <div className="flex-1 min-w-0">
//                       <div className="flex items-center flex-wrap gap-2 mb-2">
//                         <span className={`px-2 py-1 rounded-full text-xs font-medium ${
//                           actionConfig.color === 'green' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
//                           actionConfig.color === 'red' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
//                           actionConfig.color === 'blue' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
//                           actionConfig.color === 'purple' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' :
//                           actionConfig.color === 'orange' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' :
//                           actionConfig.color === 'indigo' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300' :
//                           'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
//                         }`}>
//                           {actionConfig.label}
//                         </span>
                        
//                         {log.status_code && (
//                           <div className="flex items-center">
//                             {log.status_code >= 200 && log.status_code < 300 ? 
//                               <CheckCircle className="w-3 h-3 text-green-500 mr-1" /> :
//                               log.status_code >= 400 && log.status_code < 500 ?
//                               <AlertCircle className="w-3 h-3 text-yellow-500 mr-1" /> :
//                               <XCircle className="w-3 h-3 text-red-500 mr-1" />
//                             }
//                             <span className="text-xs">HTTP {log.status_code}</span>
//                           </div>
//                         )}
//                       </div>
                      
//                       <p className={`text-sm mb-2 ${themeClasses.text.primary}`}>
//                         {log.description}
//                       </p>

//                       <div className="flex items-center space-x-4 text-xs">
//                         {log.user && (
//                           <div className="flex items-center">
//                             <User className="w-3 h-3 mr-1" />
//                             <span className={themeClasses.text.secondary}>{log.user.username}</span>
//                           </div>
//                         )}
//                         {log.router && (
//                           <div className="flex items-center">
//                             <Server className="w-3 h-3 mr-1" />
//                             <span className={themeClasses.text.secondary}>{log.router.name}</span>
//                           </div>
//                         )}
//                         {log.ip_address && (
//                           <span className={themeClasses.text.tertiary}>IP: {log.ip_address}</span>
//                         )}
//                       </div>
//                     </div>
//                   </div>
                  
//                   <div className="flex items-center space-x-2">
//                     <span className={`text-sm ${themeClasses.text.tertiary}`}>
//                       {new Date(log.timestamp).toLocaleString()}
//                     </span>
//                     {expandedLog === log.id ? 
//                       <ChevronUp className="w-4 h-4" /> : 
//                       <ChevronDown className="w-4 h-4" />
//                     }
//                   </div>
//                 </div>

//                 <AnimatePresence>
//                   {expandedLog === log.id && (
//                     <LogDetailView log={log} />
//                   )}
//                 </AnimatePresence>
//               </motion.div>
//             );
//           })
//         ) : (
//           <div className="text-center py-8">
//             <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
//             <p className={themeClasses.text.tertiary}>Unable to display audit logs at this time</p>
//           </div>
//         )}
//       </div>

//       {/* Pagination */}
//       {pagination.total_pages > 1 && !hasError && (
//         <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
//           <p className={`text-sm ${themeClasses.text.tertiary}`}>
//             Showing page {pagination.page} of {pagination.total_pages}
//           </p>
//           <div className="flex space-x-2">
//             <CustomButton
//               onClick={() => fetchAuditLogs(pagination.page - 1)}
//               label="Previous"
//               variant="secondary"
//               size="sm"
//               disabled={pagination.page <= 1 || loading}
//               theme={theme}
//             />
//             <CustomButton
//               onClick={() => fetchAuditLogs(pagination.page + 1)}
//               label="Next"
//               variant="secondary"
//               size="sm"
//               disabled={pagination.page >= pagination.total_pages || loading}
//               theme={theme}
//             />
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AuditLogViewer;








// src/Pages/NetworkManagement/components/Audit/AuditLogViewer.jsx - FIXED VERSION WITH TIMEOUT HANDLING
import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, Download, Calendar, User, Server, 
  RefreshCw, FileText, Trash2, Eye, ChevronDown, ChevronUp,
  AlertCircle, CheckCircle, XCircle, Info, Clock, MoreVertical,
  Settings, Wifi, Shield, Network, AlertTriangle
} from 'lucide-react';
import CustomButton from '../Common/CustomButton';
import InputField from '../Common/InputField';
import { getThemeClasses, EnhancedSelect } from '../../../../components/ServiceManagement/Shared/components';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../../../context/AuthContext'
import api from '../../../../api'

const AuditLogViewer = ({ theme = "light", routerId = null, showFilters = true }) => {
  const themeClasses = getThemeClasses(theme);
  const { isAuthenticated, logout } = useAuth();
  
  // Enhanced state with loading and error states
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  const [filters, setFilters] = useState({
    action: '',
    router_id: routerId || '',
    user_id: '',
    days: 7,
    search: '',
    status: ''
  });
  
  const [expandedLog, setExpandedLog] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 20,
    total_count: 0,
    total_pages: 1
  });

  // Action types with proper icons
  const actionTypes = [
    { value: 'create', label: 'Create', icon: CheckCircle, color: 'green' },
    { value: 'update', label: 'Update', icon: RefreshCw, color: 'blue' },
    { value: 'delete', label: 'Delete', icon: Trash2, color: 'red' },
    { value: 'user_activation', label: 'User Activation', icon: User, color: 'purple' },
    { value: 'user_deactivation', label: 'User Deactivation', icon: User, color: 'orange' },
    { value: 'bulk_operation', label: 'Bulk Operation', icon: Server, color: 'indigo' },
    { value: 'configure', label: 'Configure', icon: Settings, color: 'blue' },
    { value: 'connection_test', label: 'Connection Test', icon: Wifi, color: 'green' },
    { value: 'script_configuration', label: 'Script Configuration', icon: FileText, color: 'purple' },
    { value: 'vpn_configuration', label: 'VPN Configuration', icon: Shield, color: 'red' },
    { value: 'hotspot_config', label: 'Hotspot Config', icon: Wifi, color: 'green' },
    { value: 'pppoe_config', label: 'PPPoE Config', icon: Network, color: 'blue' }
  ];

  const statusTypes = [
    { value: 'success', label: 'Success' },
    { value: 'failed', label: 'Failed' },
    { value: 'warning', label: 'Warning' }
  ];

  const timeRanges = [
    { value: 1, label: 'Last 24 hours' },
    { value: 7, label: 'Last 7 days' },
    { value: 30, label: 'Last 30 days' },
    { value: 90, label: 'Last 90 days' }
  ];

  // FIXED: Enhanced fetch with error handling and retry logic - Added specific handling for NETWORK_ERROR
  const fetchAuditLogs = useCallback(async (page = 1, isRetry = false) => {
    if (!isAuthenticated) {
      toast.error('Please log in to view audit logs');
      return;
    }

    // Don't show loading toast for retries
    if (!isRetry) {
      setLoading(true);
      setHasError(false);
    }

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pagination.page_size.toString()
      });
      
      if (filters.action) params.append('action', filters.action);
      if (filters.router_id) params.append('router_id', filters.router_id);
      if (filters.user_id) params.append('user_id', filters.user_id);
      if (filters.days) params.append('days', filters.days);
      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);

      const response = await api.safeGet(`/api/network_management/audit-logs/?${params}`, { timeout: 120000 });
      
      const data = response;
      
      // Handle different response formats gracefully
      let logsArray = [];
      let totalCount = 0;
      
      if (Array.isArray(data)) {
        logsArray = data;
        totalCount = data.length;
      } else if (data && Array.isArray(data.logs)) {
        logsArray = data.logs;
        totalCount = data.total_count || data.logs.length;
      } else if (data && data.results && Array.isArray(data.results)) {
        logsArray = data.results;
        totalCount = data.count || data.results.length;
      } else if (data && typeof data === 'object') {
        // Try to find any array in the response
        const possibleArrays = Object.values(data).filter(item => Array.isArray(item));
        logsArray = possibleArrays.length > 0 ? possibleArrays[0] : [];
        totalCount = data.total_count || logsArray.length;
      } else {
        // Fallback to empty array
        logsArray = [];
        totalCount = 0;
      }
      
      setLogs(logsArray);
      setPagination(prev => ({
        ...prev,
        page,
        total_count: totalCount,
        total_pages: Math.ceil(totalCount / prev.page_size)
      }));
      
      setRetryCount(0);
      
      // Show success message only for first load or after retry
      if (isRetry && logsArray.length > 0) {
        toast.success('Audit logs loaded successfully');
      }
      
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      
      // FIXED: Treat NETWORK_ERROR as no logs available
      if (error.code === 'NETWORK_ERROR') {
        setLogs([]);
        toast.error('There aren\'t any audit logs available');
      } else if (!isRetry) {
        setHasError(true);
        setRetryCount(prev => prev + 1);
      }
      
      // Don't show duplicate toasts (interceptor already shows them)
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
        logout();
      }
      
      setLogs([]);
    } finally {
      if (!isRetry) {
        setLoading(false);
      }
    }
  }, [filters, pagination.page_size, isAuthenticated, logout]);

  const exportLogs = async (format = 'json') => {
    if (!isAuthenticated) {
      toast.error('Please log in to export audit logs');
      return;
    }

    setExporting(true);
    const toastId = toast.loading(`Exporting audit logs as ${format.toUpperCase()}...`);
    
    try {
      const params = new URLSearchParams({ format });
      if (filters.action) params.append('action', filters.action);
      if (filters.router_id) params.append('router_id', filters.router_id);
      if (filters.days) params.append('days', filters.days);

      const response = await api.get(`/api/network_management/audit-logs/export/?${params}`, {
        responseType: 'blob',
        timeout: 45000 // Longer timeout for exports
      });
      
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success(`Audit logs exported as ${format.toUpperCase()}`, { id: toastId });
    } catch (error) {
      console.error('Export error:', error);
      
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.', { id: toastId });
        logout();
      } else {
        toast.error('Failed to export audit logs', { id: toastId });
      }
    } finally {
      setExporting(false);
    }
  };

  const clearLogs = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to clear audit logs');
      return;
    }

    if (!window.confirm('Are you sure you want to clear all audit logs? This action cannot be undone.')) {
      return;
    }

    const toastId = toast.loading('Clearing audit logs...');
    
    try {
      await api.safePost('/api/network_management/audit-logs/cleanup/', {
        dry_run: false,
        retention_days: 0
      }, { timeout: 120000 }); // FIXED: Added longer timeout for clear operation

      toast.success('Audit logs cleared successfully', { id: toastId });
      fetchAuditLogs(1);
    } catch (error) {
      console.error('Clear logs error:', error);
      
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.', { id: toastId });
        logout();
      } else {
        toast.error('Failed to clear audit logs', { id: toastId });
      }
    }
  };

  // Auto-retry on error
  useEffect(() => {
    if (hasError && retryCount < 3) {
      const timer = setTimeout(() => {
        toast.loading('Retrying to load audit logs...');
        fetchAuditLogs(pagination.page, true);
      }, 3000 * retryCount); // Exponential backoff
      
      return () => clearTimeout(timer);
    }
  }, [hasError, retryCount, pagination.page, fetchAuditLogs]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAuditLogs(1);
    }
  }, [fetchAuditLogs, isAuthenticated]);

  const getActionConfig = (action) => {
    return actionTypes.find(a => a.value === action) || { label: action, color: 'gray', icon: FileText };
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default: return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatChanges = (changes) => {
    if (!changes || typeof changes !== 'object') return null;
    
    if (Array.isArray(changes)) {
      return changes.map((change, index) => (
        <div key={index} className="text-sm">
          {JSON.stringify(change)}
        </div>
      ));
    }
    
    return Object.entries(changes).map(([key, value]) => (
      <div key={key} className="flex justify-between text-sm py-1 border-b border-gray-200 dark:border-gray-600 last:border-b-0">
        <span className="font-medium text-gray-700 dark:text-gray-300">{key}:</span>
        <span className="text-gray-600 dark:text-gray-400">
          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
        </span>
      </div>
    ));
  };

  const LogDetailView = ({ log }) => (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <h5 className="font-medium mb-2 text-gray-700 dark:text-gray-300">Details</h5>
          <div className="space-y-2">
            {log.user && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">User:</span>
                <span className="font-medium">{log.user.username}</span>
              </div>
            )}
            {log.ip_address && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">IP Address:</span>
                <span className="font-medium">{log.ip_address}</span>
              </div>
            )}
            {log.user_agent && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">User Agent:</span>
                <span className="font-medium text-xs truncate">{log.user_agent}</span>
              </div>
            )}
            {log.status_code && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Status Code:</span>
                <span className="font-medium">{log.status_code}</span>
              </div>
            )}
          </div>
        </div>
        
        <div>
          <h5 className="font-medium mb-2 text-gray-700 dark:text-gray-300">Changes</h5>
          <div className="max-h-32 overflow-y-auto">
            {log.changes && Object.keys(log.changes).length > 0 ? (
              formatChanges(log.changes)
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm">No changes recorded</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );

  // Skeleton loader for better UX
  const SkeletonLoader = () => (
    <div className="space-y-3">
      {[...Array(5)].map((_, index) => (
        <div key={index} className={`p-4 rounded-lg border ${themeClasses.bg.card} ${themeClasses.border.medium} animate-pulse`}>
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                <div className="flex space-x-4">
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
                </div>
              </div>
            </div>
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
          </div>
        </div>
      ))}
    </div>
  );

  if (!isAuthenticated) {
    return (
      <div className={`p-6 rounded-xl border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h3 className={`text-lg font-semibold mb-2 ${themeClasses.text.primary}`}>
            Authentication Required
          </h3>
          <p className={themeClasses.text.tertiary}>
            Please log in to view audit logs
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 rounded-xl border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div>
          <h3 className={`text-lg font-semibold flex items-center ${themeClasses.text.primary}`}>
            <FileText className="w-5 h-5 mr-2" />
            Audit Logs
          </h3>
          <p className={`text-sm ${themeClasses.text.tertiary} mt-1`}>
            {loading ? 'Loading...' : `${pagination.total_count} total logs`} • Tracking system activities and changes
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <CustomButton
            onClick={() => exportLogs('csv')}
            icon={<Download className="w-4 h-4" />}
            label="CSV"
            variant="secondary"
            size="sm"
            loading={exporting}
            disabled={logs.length === 0}
            theme={theme}
          />
          <CustomButton
            onClick={() => exportLogs('json')}
            icon={<Download className="w-4 h-4" />}
            label="JSON"
            variant="secondary"
            size="sm"
            loading={exporting}
            disabled={logs.length === 0}
            theme={theme}
          />
          <CustomButton
            onClick={clearLogs}
            icon={<Trash2 className="w-4 h-4" />}
            label="Clear Logs"
            variant="danger"
            size="sm"
            theme={theme}
          />
          <CustomButton
            onClick={() => fetchAuditLogs(1)}
            icon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
            label="Refresh"
            variant="secondary"
            size="sm"
            disabled={loading}
            theme={theme}
          />
        </div>
      </div>

      {/* Error State */}
      {hasError && retryCount >= 3 && (
        <div className={`mb-6 p-4 rounded-lg border ${
          theme === 'dark' ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-500 mr-3" />
            <div>
              <h4 className={`font-medium ${theme === 'dark' ? 'text-red-300' : 'text-red-800'}`}>
                Unable to load audit logs
              </h4>
              <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>
                Please check your connection and try again.
              </p>
              <button
                onClick={() => {
                  setHasError(false);
                  setRetryCount(0);
                  fetchAuditLogs(1);
                }}
                className={`mt-2 px-4 py-2 rounded text-sm ${
                  theme === 'dark' 
                    ? 'bg-red-700 hover:bg-red-600 text-white' 
                    : 'bg-red-100 hover:bg-red-200 text-red-700'
                }`}
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      {showFilters && !hasError && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg border mb-6 ${themeClasses.bg.card} ${themeClasses.border.medium}`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
                Action Type
              </label>
              <EnhancedSelect
                value={filters.action}
                onChange={(value) => setFilters(prev => ({ ...prev, action: value }))}
                options={actionTypes.map(a => ({ value: a.value, label: a.label }))}
                placeholder="All Actions"
                theme={theme}
                className="w-full"
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
                Time Range
              </label>
              <EnhancedSelect
                value={filters.days}
                onChange={(value) => setFilters(prev => ({ ...prev, days: value }))}
                options={timeRanges}
                placeholder="Select time range"
                theme={theme}
                className="w-full"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
                Status
              </label>
              <EnhancedSelect
                value={filters.status}
                onChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                options={statusTypes}
                placeholder="All Status"
                theme={theme}
                className="w-full"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
                Search
              </label>
              <InputField
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                placeholder="Search logs..."
                icon={<Search className="w-4 h-4" />}
                theme={theme}
              />
            </div>

            <div className="flex items-end">
              <CustomButton
                onClick={() => setFilters({
                  action: '',
                  router_id: routerId || '',
                  user_id: '',
                  days: 7,
                  search: '',
                  status: ''
                })}
                label="Clear Filters"
                variant="secondary"
                size="sm"
                fullWidth
                theme={theme}
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Logs List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {loading ? (
          <SkeletonLoader />
        ) : hasError ? (
          <div className="text-center py-12">
            <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h4 className={`font-medium mb-2 ${themeClasses.text.primary}`}>Temporary Issue</h4>
            <p className={themeClasses.text.tertiary}>
              We're having trouble loading audit logs. Please try refreshing.
            </p>
          </div>
        ) : (Array.isArray(logs) && logs.length === 0) ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h4 className={`font-medium mb-2 ${themeClasses.text.primary}`}>No audit logs found</h4>
            <p className={themeClasses.text.tertiary}>
              {Object.values(filters).some(v => v) 
                ? 'Try adjusting your filters to see more results' 
                : 'System activities will appear here as they occur'
              }
            </p>
          </div>
        ) : Array.isArray(logs) ? (
          logs.map((log) => {
            const actionConfig = getActionConfig(log.action);
            const ActionIcon = actionConfig.icon;
            
            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  themeClasses.border.medium
                } hover:${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}
                onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className={`p-2 rounded-full ${
                      actionConfig.color === 'green' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
                      actionConfig.color === 'red' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                      actionConfig.color === 'blue' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                      actionConfig.color === 'purple' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' :
                      actionConfig.color === 'orange' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' :
                      actionConfig.color === 'indigo' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' :
                      'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                    }`}>
                      <ActionIcon className="w-4 h-4" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center flex-wrap gap-2 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          actionConfig.color === 'green' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                          actionConfig.color === 'red' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                          actionConfig.color === 'blue' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                          actionConfig.color === 'purple' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' :
                          actionConfig.color === 'orange' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' :
                          actionConfig.color === 'indigo' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {actionConfig.label}
                        </span>
                        
                        {log.status_code && (
                          <div className="flex items-center">
                            {log.status_code >= 200 && log.status_code < 300 ? 
                              <CheckCircle className="w-3 h-3 text-green-500 mr-1" /> :
                              log.status_code >= 400 && log.status_code < 500 ?
                              <AlertCircle className="w-3 h-3 text-yellow-500 mr-1" /> :
                              <XCircle className="w-3 h-3 text-red-500 mr-1" />
                            }
                            <span className="text-xs">HTTP {log.status_code}</span>
                          </div>
                        )}
                      </div>
                      
                      <p className={`text-sm mb-2 ${themeClasses.text.primary}`}>
                        {log.description}
                      </p>

                      <div className="flex items-center space-x-4 text-xs">
                        {log.user && (
                          <div className="flex items-center">
                            <User className="w-3 h-3 mr-1" />
                            <span className={themeClasses.text.secondary}>{log.user.username}</span>
                          </div>
                        )}
                        {log.router && (
                          <div className="flex items-center">
                            <Server className="w-3 h-3 mr-1" />
                            <span className={themeClasses.text.secondary}>{log.router.name}</span>
                          </div>
                        )}
                        {log.ip_address && (
                          <span className={themeClasses.text.tertiary}>IP: {log.ip_address}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm ${themeClasses.text.tertiary}`}>
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                    {expandedLog === log.id ? 
                      <ChevronUp className="w-4 h-4" /> : 
                      <ChevronDown className="w-4 h-4" />
                    }
                  </div>
                </div>

                <AnimatePresence>
                  {expandedLog === log.id && (
                    <LogDetailView log={log} />
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        ) : (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <p className={themeClasses.text.tertiary}>Unable to display audit logs at this time</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.total_pages > 1 && !hasError && (
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
          <p className={`text-sm ${themeClasses.text.tertiary}`}>
            Showing page {pagination.page} of {pagination.total_pages}
          </p>
          <div className="flex space-x-2">
            <CustomButton
              onClick={() => fetchAuditLogs(pagination.page - 1)}
              label="Previous"
              variant="secondary"
              size="sm"
              disabled={pagination.page <= 1 || loading}
              theme={theme}
            />
            <CustomButton
              onClick={() => fetchAuditLogs(pagination.page + 1)}
              label="Next"
              variant="secondary"
              size="sm"
              disabled={pagination.page >= pagination.total_pages || loading}
              theme={theme}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogViewer;