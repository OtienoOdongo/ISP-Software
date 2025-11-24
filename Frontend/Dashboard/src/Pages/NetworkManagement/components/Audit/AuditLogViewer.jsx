




// // src/Pages/NetworkManagement/components/Audit/AuditLogViewer.jsx
// import React, { useState, useCallback, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { 
//   Search, Filter, Download, Calendar, User, Server, 
//   RefreshCw, FileText, Trash2, Eye, ChevronDown, ChevronUp,
//   AlertCircle, CheckCircle, XCircle, Info, Clock, MoreVertical,
//   Settings, Wifi, Shield, Network // Added missing imports
// } from 'lucide-react';
// import CustomButton from '../Common/CustomButton';
// import InputField from '../Common/InputField';
// import { getThemeClasses } from '../../../../components/ServiceManagement/Shared/components';
// import { toast } from 'react-toastify';

// const AuditLogViewer = ({ theme = "light", routerId = null, showFilters = true }) => {
//   const themeClasses = getThemeClasses(theme);
//   const [logs, setLogs] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [exporting, setExporting] = useState(false);
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

//   // Fixed action types with proper icons
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

//   const fetchAuditLogs = useCallback(async (page = 1) => {
//     setLoading(true);
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

//       const response = await fetch(`/api/network_management/audit-logs/?${params}`, {
//         headers: {
//           'Authorization': `Bearer ${localStorage.getItem('token')}`
//         }
//       });
      
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
      
//       const data = await response.json();
      
//       // Handle different response formats
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
//       }
      
//       setLogs(logsArray);
//       setPagination(prev => ({
//         ...prev,
//         page,
//         total_count: totalCount,
//         total_pages: Math.ceil(totalCount / prev.page_size)
//       }));
      
//     } catch (error) {
//       console.error('Error fetching audit logs:', error);
//       toast.error('Failed to fetch audit logs');
//       setLogs([]);
//     } finally {
//       setLoading(false);
//     }
//   }, [filters, pagination.page_size]);

//   const exportLogs = async (format = 'json') => {
//     setExporting(true);
//     try {
//       const params = new URLSearchParams({ format });
//       if (filters.action) params.append('action', filters.action);
//       if (filters.router_id) params.append('router_id', filters.router_id);
//       if (filters.days) params.append('days', filters.days);

//       const response = await fetch(`/api/network_management/audit-logs/export/?${params}`, {
//         headers: {
//           'Authorization': `Bearer ${localStorage.getItem('token')}`
//         }
//       });
      
//       if (!response.ok) {
//         throw new Error(`Export failed with status ${response.status}`);
//       }
      
//       const blob = await response.blob();
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       a.href = url;
//       a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.${format}`;
//       document.body.appendChild(a);
//       a.click();
//       window.URL.revokeObjectURL(url);
//       document.body.removeChild(a);
      
//       toast.success(`Audit logs exported as ${format.toUpperCase()}`);
//     } catch (error) {
//       console.error('Export error:', error);
//       toast.error('Failed to export audit logs');
//     } finally {
//       setExporting(false);
//     }
//   };

//   const clearLogs = async () => {
//     if (!window.confirm('Are you sure you want to clear all audit logs? This action cannot be undone.')) {
//       return;
//     }

//     try {
//       const response = await fetch('/api/network_management/audit-logs/clear/', {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${localStorage.getItem('token')}`
//         }
//       });

//       if (response.ok) {
//         toast.success('Audit logs cleared successfully');
//         fetchAuditLogs(1);
//       } else {
//         throw new Error('Failed to clear logs');
//       }
//     } catch (error) {
//       console.error('Clear logs error:', error);
//       toast.error('Failed to clear audit logs');
//     }
//   };

//   useEffect(() => {
//     fetchAuditLogs(1);
//   }, [fetchAuditLogs]);

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

//   // Simple select component since EnhancedSelect might not be available
//   const SimpleSelect = ({ label, value, onChange, options, placeholder, theme }) => (
//     <div>
//       {label && (
//         <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
//           {label}
//         </label>
//       )}
//       <select
//         value={value}
//         onChange={(e) => onChange(e.target.value)}
//         className={`w-full p-2 border rounded-lg ${
//           theme === 'dark' 
//             ? 'bg-gray-700 border-gray-600 text-white' 
//             : 'bg-white border-gray-300 text-gray-900'
//         }`}
//       >
//         <option value="">{placeholder || 'Select...'}</option>
//         {options.map(option => (
//           <option key={option.value} value={option.value}>
//             {option.label}
//           </option>
//         ))}
//       </select>
//     </div>
//   );

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
//             {pagination.total_count} total logs • Tracking system activities and changes
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
//             theme={theme}
//           />
//           <CustomButton
//             onClick={() => exportLogs('json')}
//             icon={<Download className="w-4 h-4" />}
//             label="JSON"
//             variant="secondary"
//             size="sm"
//             loading={exporting}
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

//       {/* Filters */}
//       {showFilters && (
//         <motion.div 
//           initial={{ opacity: 0, y: -10 }}
//           animate={{ opacity: 1, y: 0 }}
//           className={`p-4 rounded-lg border mb-6 ${themeClasses.bg.card} ${themeClasses.border.medium}`}
//         >
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
//             <SimpleSelect
//               label="Action Type"
//               value={filters.action}
//               onChange={(value) => setFilters(prev => ({ ...prev, action: value }))}
//               options={actionTypes.map(a => ({ value: a.value, label: a.label }))}
//               placeholder="All Actions"
//               theme={theme}
//             />
            
//             <SimpleSelect
//               label="Time Range"
//               value={filters.days}
//               onChange={(value) => setFilters(prev => ({ ...prev, days: value }))}
//               options={timeRanges}
//               theme={theme}
//             />

//             <SimpleSelect
//               label="Status"
//               value={filters.status}
//               onChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
//               options={statusTypes}
//               placeholder="All Status"
//               theme={theme}
//             />

//             <InputField
//               label="Search"
//               value={filters.search}
//               onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
//               placeholder="Search logs..."
//               icon={<Search className="w-4 h-4" />}
//               theme={theme}
//             />

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
//           <div className="flex justify-center items-center py-12">
//             <div className="text-center">
//               <RefreshCw className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-4" />
//               <p className={themeClasses.text.tertiary}>Loading audit logs...</p>
//             </div>
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
                        
//                         {log.status && (
//                           <div className="flex items-center">
//                             {getStatusIcon(log.status)}
//                             <span className="ml-1 text-xs capitalize">{log.status}</span>
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
//             <p className={themeClasses.text.tertiary}>Invalid data format received from server</p>
//           </div>
//         )}
//       </div>

//       {/* Pagination */}
//       {pagination.total_pages > 1 && (
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
//               disabled={pagination.page <= 1}
//               theme={theme}
//             />
//             <CustomButton
//               onClick={() => fetchAuditLogs(pagination.page + 1)}
//               label="Next"
//               variant="secondary"
//               size="sm"
//               disabled={pagination.page >= pagination.total_pages}
//               theme={theme}
//             />
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AuditLogViewer;










// src/Pages/NetworkManagement/components/Audit/AuditLogViewer.jsx
import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, Download, Calendar, User, Server, 
  RefreshCw, FileText, Trash2, Eye, ChevronDown, ChevronUp,
  AlertCircle, CheckCircle, XCircle, Info, Clock, MoreVertical,
  Settings, Wifi, Shield, Network
} from 'lucide-react';
import CustomButton from '../Common/CustomButton';
import InputField from '../Common/InputField';
import { getThemeClasses } from '../../../../components/ServiceManagement/Shared/components';
import { toast } from 'react-toastify';
import { useAuth } from '../../../../context/AuthContext'
import api from '../../../../api'

const AuditLogViewer = ({ theme = "light", routerId = null, showFilters = true }) => {
  const themeClasses = getThemeClasses(theme);
  const { isAuthenticated, logout } = useAuth(); // Get auth state
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
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

  // Fixed action types with proper icons
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

  const fetchAuditLogs = useCallback(async (page = 1) => {
    if (!isAuthenticated) {
      toast.error('Please log in to view audit logs');
      return;
    }

    setLoading(true);
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

      // Use your api instance instead of fetch
      const response = await api.get(`/api/network_management/audit-logs/?${params}`);
      
      const data = response.data;
      
      // Handle different response formats
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
      }
      
      setLogs(logsArray);
      setPagination(prev => ({
        ...prev,
        page,
        total_count: totalCount,
        total_pages: Math.ceil(totalCount / prev.page_size)
      }));
      
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
        logout();
      } else {
        toast.error('Failed to fetch audit logs');
      }
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page_size, isAuthenticated, logout]);

  const exportLogs = async (format = 'json') => {
    if (!isAuthenticated) {
      toast.error('Please log in to export audit logs');
      return;
    }

    setExporting(true);
    try {
      const params = new URLSearchParams({ format });
      if (filters.action) params.append('action', filters.action);
      if (filters.router_id) params.append('router_id', filters.router_id);
      if (filters.days) params.append('days', filters.days);

      const response = await api.get(`/api/network_management/audit-logs/export/?${params}`, {
        responseType: 'blob' // Important for file downloads
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
      
      toast.success(`Audit logs exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export error:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
        logout();
      } else {
        toast.error('Failed to export audit logs');
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

    try {
      await api.post('/api/network_management/audit-logs/cleanup/', {
        dry_run: false,
        retention_days: 0 // This will trigger complete cleanup
      });

      toast.success('Audit logs cleared successfully');
      fetchAuditLogs(1);
    } catch (error) {
      console.error('Clear logs error:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
        logout();
      } else {
        toast.error('Failed to clear audit logs');
      }
    }
  };

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

  // Simple select component
  const SimpleSelect = ({ label, value, onChange, options, placeholder, theme }) => (
    <div>
      {label && (
        <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full p-2 border rounded-lg ${
          theme === 'dark' 
            ? 'bg-gray-700 border-gray-600 text-white' 
            : 'bg-white border-gray-300 text-gray-900'
        }`}
      >
        <option value="">{placeholder || 'Select...'}</option>
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
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
            {pagination.total_count} total logs • Tracking system activities and changes
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
            theme={theme}
          />
          <CustomButton
            onClick={() => exportLogs('json')}
            icon={<Download className="w-4 h-4" />}
            label="JSON"
            variant="secondary"
            size="sm"
            loading={exporting}
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

      {/* Filters */}
      {showFilters && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg border mb-6 ${themeClasses.bg.card} ${themeClasses.border.medium}`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <SimpleSelect
              label="Action Type"
              value={filters.action}
              onChange={(value) => setFilters(prev => ({ ...prev, action: value }))}
              options={actionTypes.map(a => ({ value: a.value, label: a.label }))}
              placeholder="All Actions"
              theme={theme}
            />
            
            <SimpleSelect
              label="Time Range"
              value={filters.days}
              onChange={(value) => setFilters(prev => ({ ...prev, days: value }))}
              options={timeRanges}
              theme={theme}
            />

            <SimpleSelect
              label="Status"
              value={filters.status}
              onChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
              options={statusTypes}
              placeholder="All Status"
              theme={theme}
            />

            <InputField
              label="Search"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              placeholder="Search logs..."
              icon={<Search className="w-4 h-4" />}
              theme={theme}
            />

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
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-4" />
              <p className={themeClasses.text.tertiary}>Loading audit logs...</p>
            </div>
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
            <p className={themeClasses.text.tertiary}>Invalid data format received from server</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.total_pages > 1 && (
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
              disabled={pagination.page <= 1}
              theme={theme}
            />
            <CustomButton
              onClick={() => fetchAuditLogs(pagination.page + 1)}
              label="Next"
              variant="secondary"
              size="sm"
              disabled={pagination.page >= pagination.total_pages}
              theme={theme}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogViewer;