


// // src/components/ServiceOperations/ClientOperations.jsx
// import React, { useState, useEffect, useMemo, useCallback } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import {
//   FileText, Clock, Check, X, AlertTriangle, Search, Filter,
//   User, Phone, Mail, Calendar, Activity, RefreshCw,
//   ChevronDown, ChevronUp, Eye, Download, Printer,
//   TrendingUp, TrendingDown, Minus, Smartphone, Laptop
// } from 'lucide-react';
// import { API_ENDPOINTS } from './constants';
// import { useApi } from './hooks/useApi'
// import { useDebounce } from './hooks/useDebounce';
// import { usePagination } from './hooks/usePagination';
// import { getThemeClasses } from '../../../components/ServiceManagement/Shared/components';
// import { TableSkeleton } from './common/TableSkeleton'
// import { ErrorBoundary } from './common/ErrorBoundary';

// const ClientOperations = ({ theme, addNotification }) => {
//   const themeClasses = getThemeClasses(theme);
  
//   // State
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filterType, setFilterType] = useState('all');
//   const [filterStatus, setFilterStatus] = useState('all');
//   const [filterPriority, setFilterPriority] = useState('all');
//   const [sortField, setSortField] = useState('created_at');
//   const [sortDirection, setSortDirection] = useState('desc');
//   const [selectedOperation, setSelectedOperation] = useState(null);
//   const [expandedId, setExpandedId] = useState(null);
  
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
//     goToPage,
//     changePageSize,
//   } = usePagination(1, 20);
  
//   // Fetch operations
//   const { data: operationsData, loading, error, fetchData } = useApi(
//     API_ENDPOINTS.CLIENT_OPERATIONS,
//     { cacheKey: 'clientOperations' }
//   );
  
//   // Ensure operations is always an array
//   const operations = useMemo(() => {
//     return Array.isArray(operationsData) ? operationsData : [];
//   }, [operationsData]);
  
//   // Initial fetch
//   useEffect(() => {
//     fetchData({ page, page_size: pageSize });
//   }, [fetchData, page, pageSize]);
  
//   // Filter and sort operations
//   const filteredOperations = useMemo(() => {
//     return operations
//       .filter(op => {
//         // Search filter
//         const matchesSearch = debouncedSearch === '' ||
//           (op.client_name?.toLowerCase().includes(debouncedSearch.toLowerCase())) ||
//           (op.client_phone?.includes(debouncedSearch)) ||
//           (op.client_email?.toLowerCase().includes(debouncedSearch.toLowerCase())) ||
//           (op.operation_type?.toLowerCase().includes(debouncedSearch.toLowerCase())) ||
//           (op.title?.toLowerCase().includes(debouncedSearch.toLowerCase())) ||
//           (op.description?.toLowerCase().includes(debouncedSearch.toLowerCase()));
        
//         // Type filter
//         const matchesType = filterType === 'all' || op.operation_type === filterType;
        
//         // Status filter
//         const matchesStatus = filterStatus === 'all' || op.status === filterStatus;
        
//         // Priority filter
//         const matchesPriority = filterPriority === 'all' || 
//           (filterPriority === 'high' && op.priority >= 4) ||
//           (filterPriority === 'medium' && op.priority === 3) ||
//           (filterPriority === 'low' && op.priority <= 2);
        
//         return matchesSearch && matchesType && matchesStatus && matchesPriority;
//       })
//       .sort((a, b) => {
//         let aVal = a[sortField];
//         let bVal = b[sortField];
        
//         // Handle dates
//         if (sortField === 'created_at' || sortField === 'requested_at' || sortField === 'completed_at') {
//           aVal = new Date(aVal).getTime();
//           bVal = new Date(bVal).getTime();
//         }
        
//         // Handle numbers
//         if (typeof aVal === 'number' && typeof bVal === 'number') {
//           const comparison = aVal < bVal ? -1 : 1;
//           return sortDirection === 'asc' ? comparison : -comparison;
//         }
        
//         // Handle strings
//         if (typeof aVal === 'string' && typeof bVal === 'string') {
//           aVal = aVal.toLowerCase();
//           bVal = bVal.toLowerCase();
//           const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
//           return sortDirection === 'asc' ? comparison : -comparison;
//         }
        
//         return 0;
//       });
//   }, [operations, debouncedSearch, filterType, filterStatus, filterPriority, sortField, sortDirection]);
  
//   // Update total count
//   useEffect(() => {
//     setTotal(filteredOperations.length);
//   }, [filteredOperations.length, setTotal]);
  
//   // Paginate results
//   const paginatedOperations = useMemo(() => {
//     const start = (page - 1) * pageSize;
//     const end = start + pageSize;
//     return filteredOperations.slice(start, end);
//   }, [filteredOperations, page, pageSize]);
  
//   // Handle sort
//   const handleSort = useCallback((field) => {
//     if (sortField === field) {
//       setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
//     } else {
//       setSortField(field);
//       setSortDirection('asc');
//     }
//   }, [sortField]);
  
//   // Get unique operation types for filter
//   const operationTypes = useMemo(() => {
//     const types = new Set(operations.map(op => op.operation_type).filter(Boolean));
//     return Array.from(types).sort();
//   }, [operations]);
  
//   // Get status icon and color
//   const getStatusInfo = useCallback((status) => {
//     const statusMap = {
//       completed: { icon: Check, color: 'text-green-600', bg: 'bg-green-100', border: 'border-green-200' },
//       failed: { icon: X, color: 'text-red-600', bg: 'bg-red-100', border: 'border-red-200' },
//       pending: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100', border: 'border-yellow-200' },
//       in_progress: { icon: Activity, color: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-200' },
//       cancelled: { icon: X, color: 'text-gray-600', bg: 'bg-gray-100', border: 'border-gray-200' },
//     };
    
//     return statusMap[status] || { icon: AlertTriangle, color: 'text-gray-600', bg: 'bg-gray-100', border: 'border-gray-200' };
//   }, []);
  
//   // Get priority badge
//   const getPriorityBadge = useCallback((priority) => {
//     const priorityMap = {
//       1: { label: 'Low', color: 'bg-blue-100 text-blue-800' },
//       2: { label: 'Medium', color: 'bg-green-100 text-green-800' },
//       3: { label: 'High', color: 'bg-yellow-100 text-yellow-800' },
//       4: { label: 'Urgent', color: 'bg-orange-100 text-orange-800' },
//       5: { label: 'Critical', color: 'bg-red-100 text-red-800' },
//     };
    
//     return priorityMap[priority] || { label: 'Unknown', color: 'bg-gray-100 text-gray-800' };
//   }, []);
  
//   // Get device icon based on client type
//   const getDeviceIcon = useCallback((clientType) => {
//     if (clientType === 'hotspot_client') {
//       return <Smartphone className="w-4 h-4 text-blue-600" />;
//     } else if (clientType === 'pppoe_client') {
//       return <Laptop className="w-4 h-4 text-green-600" />;
//     }
//     return <User className="w-4 h-4 text-gray-600" />;
//   }, []);
  
//   // Format duration
//   const formatDuration = useCallback((seconds) => {
//     if (!seconds) return 'N/A';
    
//     const hours = Math.floor(seconds / 3600);
//     const minutes = Math.floor((seconds % 3600) / 60);
//     const secs = seconds % 60;
    
//     if (hours > 0) return `${hours}h ${minutes}m`;
//     if (minutes > 0) return `${minutes}m ${secs}s`;
//     return `${secs}s`;
//   }, []);
  
//   // Calculate SLA status
//   const getSLAStatus = useCallback((operation) => {
//     if (!operation.sla_due_at) return null;
    
//     const now = new Date();
//     const dueDate = new Date(operation.sla_due_at);
//     const diffHours = (dueDate - now) / (1000 * 60 * 60);
    
//     if (operation.sla_breached) {
//       return { label: 'Breached', color: 'text-red-600', bg: 'bg-red-100' };
//     } else if (diffHours < 0) {
//       return { label: 'Overdue', color: 'text-orange-600', bg: 'bg-orange-100' };
//     } else if (diffHours < 1) {
//       return { label: 'Urgent', color: 'text-yellow-600', bg: 'bg-yellow-100' };
//     } else if (diffHours < 4) {
//       return { label: 'Warning', color: 'text-blue-600', bg: 'bg-blue-100' };
//     }
    
//     return { label: 'On Track', color: 'text-green-600', bg: 'bg-green-100' };
//   }, []);
  
//   // Export to CSV
//   const exportToCSV = useCallback(() => {
//     const headers = ['ID', 'Client', 'Phone', 'Type', 'Status', 'Priority', 'Created', 'Completed', 'Duration'];
//     const rows = filteredOperations.map(op => [
//       op.id,
//       op.client_name || 'N/A',
//       op.client_phone || 'N/A',
//       op.operation_type,
//       op.status,
//       op.priority,
//       new Date(op.created_at).toLocaleString(),
//       op.completed_at ? new Date(op.completed_at).toLocaleString() : 'N/A',
//       op.duration_seconds ? formatDuration(op.duration_seconds) : 'N/A',
//     ]);
    
//     const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
//     const blob = new Blob([csvContent], { type: 'text/csv' });
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = `client-operations-${new Date().toISOString().split('T')[0]}.csv`;
//     a.click();
//     window.URL.revokeObjectURL(url);
    
//     addNotification({ type: 'success', message: 'Export completed successfully' });
//   }, [filteredOperations, formatDuration, addNotification]);
  
//   if (loading && !operations.length) {
//     return <TableSkeleton rows={10} columns={7} />;
//   }
  
//   if (error) {
//     return (
//       <div className={`p-8 text-center rounded-xl ${themeClasses.bg.card} border ${themeClasses.border.light}`}>
//         <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
//         <h3 className="text-xl font-bold mb-2">Failed to Load Operations</h3>
//         <p className="text-gray-600 mb-4">{error}</p>
//         <button
//           onClick={() => fetchData()}
//           className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
//         >
//           Try Again
//         </button>
//       </div>
//     );
//   }
  
//   return (
//     <ErrorBoundary>
//       <div className={`space-y-6 ${themeClasses.bg.primary}`}>
//         {/* Header */}
//         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//           <div>
//             <h2 className="text-2xl font-bold">Client Operations Log</h2>
//             <p className="text-sm text-gray-600 mt-1">
//               Track and monitor all client-initiated operations
//             </p>
//           </div>
          
//           <div className="flex gap-3">
//             <button
//               onClick={exportToCSV}
//               className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
//             >
//               <Download className="w-4 h-4" />
//               Export CSV
//             </button>
//             <button
//               onClick={() => fetchData()}
//               className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
//             >
//               <RefreshCw className="w-4 h-4" />
//               Refresh
//             </button>
//           </div>
//         </div>
        
//         {/* Stats Cards */}
//         <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
//           <div className={`p-4 rounded-xl ${themeClasses.bg.card} border ${themeClasses.border.light}`}>
//             <div className="text-2xl font-bold text-blue-600">
//               {operations.filter(op => op.status === 'pending').length}
//             </div>
//             <div className="text-sm text-gray-600">Pending</div>
//           </div>
//           <div className={`p-4 rounded-xl ${themeClasses.bg.card} border ${themeClasses.border.light}`}>
//             <div className="text-2xl font-bold text-green-600">
//               {operations.filter(op => op.status === 'completed').length}
//             </div>
//             <div className="text-sm text-gray-600">Completed</div>
//           </div>
//           <div className={`p-4 rounded-xl ${themeClasses.bg.card} border ${themeClasses.border.light}`}>
//             <div className="text-2xl font-bold text-red-600">
//               {operations.filter(op => op.status === 'failed').length}
//             </div>
//             <div className="text-sm text-gray-600">Failed</div>
//           </div>
//           <div className={`p-4 rounded-xl ${themeClasses.bg.card} border ${themeClasses.border.light}`}>
//             <div className="text-2xl font-bold text-purple-600">
//               {operations.filter(op => op.priority >= 4).length}
//             </div>
//             <div className="text-sm text-gray-600">High Priority</div>
//           </div>
//         </div>
        
//         {/* Filters */}
//         <div className="flex flex-col lg:flex-row gap-4">
//           {/* Search */}
//           <div className="relative flex-1">
//             <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
//             <input
//               type="text"
//               placeholder="Search by client, phone, type, or description..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className={`pl-10 pr-4 py-3 rounded-lg border ${themeClasses.input} w-full`}
//             />
//           </div>
          
//           {/* Type Filter */}
//           <select
//             value={filterType}
//             onChange={(e) => setFilterType(e.target.value)}
//             className={`px-4 py-3 rounded-lg border ${themeClasses.input} min-w-40`}
//           >
//             <option value="all">All Types</option>
//             {operationTypes.map(type => (
//               <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
//             ))}
//           </select>
          
//           {/* Status Filter */}
//           <select
//             value={filterStatus}
//             onChange={(e) => setFilterStatus(e.target.value)}
//             className={`px-4 py-3 rounded-lg border ${themeClasses.input} min-w-40`}
//           >
//             <option value="all">All Status</option>
//             <option value="pending">Pending</option>
//             <option value="in_progress">In Progress</option>
//             <option value="completed">Completed</option>
//             <option value="failed">Failed</option>
//             <option value="cancelled">Cancelled</option>
//           </select>
          
//           {/* Priority Filter */}
//           <select
//             value={filterPriority}
//             onChange={(e) => setFilterPriority(e.target.value)}
//             className={`px-4 py-3 rounded-lg border ${themeClasses.input} min-w-40`}
//           >
//             <option value="all">All Priorities</option>
//             <option value="high">High (4-5)</option>
//             <option value="medium">Medium (3)</option>
//             <option value="low">Low (1-2)</option>
//           </select>
//         </div>
        
//         {/* Results count */}
//         <div className="text-sm text-gray-600">
//           Showing {paginatedOperations.length} of {filteredOperations.length} operations
//         </div>
        
//         {/* Operations List */}
//         <div className={`rounded-xl overflow-hidden shadow-lg ${themeClasses.bg.card} border ${themeClasses.border.light}`}>
//           <div className="divide-y">
//             {paginatedOperations.length === 0 ? (
//               <div className="p-12 text-center">
//                 <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
//                 <p className="text-lg font-medium">No operations found</p>
//                 <p className="text-sm text-gray-600 mt-2">Try adjusting your filters</p>
//               </div>
//             ) : (
//               paginatedOperations.map(op => {
//                 const StatusIcon = getStatusInfo(op.status).icon;
//                 const statusColor = getStatusInfo(op.status).color;
//                 const statusBg = getStatusInfo(op.status).bg;
//                 const priority = getPriorityBadge(op.priority);
//                 const slaStatus = getSLAStatus(op);
                
//                 return (
//                   <motion.div
//                     key={op.id}
//                     initial={{ opacity: 0 }}
//                     animate={{ opacity: 1 }}
//                     exit={{ opacity: 0 }}
//                     className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
//                   >
//                     {/* Main Row */}
//                     <div className="flex flex-col lg:flex-row lg:items-center gap-4">
//                       {/* Client Info */}
//                       <div className="flex-1 min-w-0">
//                         <div className="flex items-center gap-2">
//                           {getDeviceIcon(op.client_type)}
//                           <span className="font-medium truncate">
//                             {op.client_name || 'Anonymous Client'}
//                           </span>
//                         </div>
//                         <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
//                           {op.client_phone && (
//                             <span className="flex items-center gap-1">
//                               <Phone className="w-3 h-3" />
//                               {op.client_phone}
//                             </span>
//                           )}
//                           {op.client_email && (
//                             <span className="flex items-center gap-1">
//                               <Mail className="w-3 h-3" />
//                               {op.client_email}
//                             </span>
//                           )}
//                         </div>
//                       </div>
                      
//                       {/* Operation Type */}
//                       <div className="lg:w-48">
//                         <div className="text-sm font-medium capitalize">
//                           {op.operation_type?.replace(/_/g, ' ')}
//                         </div>
//                         <div className="text-xs text-gray-600 mt-1">{op.title}</div>
//                       </div>
                      
//                       {/* Status & Priority */}
//                       <div className="flex items-center gap-3">
//                         <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs ${statusBg}`}>
//                           <StatusIcon className={`w-3 h-3 ${statusColor}`} />
//                           <span className="capitalize">{op.status?.replace(/_/g, ' ')}</span>
//                         </div>
//                         <div className={`px-3 py-1 rounded-full text-xs ${priority.color}`}>
//                           {priority.label}
//                         </div>
//                       </div>
                      
//                       {/* SLA Status */}
//                       {slaStatus && (
//                         <div className={`px-3 py-1 rounded-full text-xs ${slaStatus.bg} ${slaStatus.color}`}>
//                           {slaStatus.label}
//                         </div>
//                       )}
                      
//                       {/* Timestamps */}
//                       <div className="lg:w-48 text-sm text-gray-600">
//                         <div className="flex items-center gap-1">
//                           <Calendar className="w-3 h-3" />
//                           {new Date(op.created_at).toLocaleString()}
//                         </div>
//                         {op.duration_seconds > 0 && (
//                           <div className="flex items-center gap-1 mt-1 text-xs">
//                             <Clock className="w-3 h-3" />
//                             {formatDuration(op.duration_seconds)}
//                           </div>
//                         )}
//                       </div>
                      
//                       {/* Expand Button */}
//                       <button
//                         onClick={() => setExpandedId(expandedId === op.id ? null : op.id)}
//                         className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
//                       >
//                         {expandedId === op.id ? (
//                           <ChevronUp className="w-5 h-5" />
//                         ) : (
//                           <ChevronDown className="w-5 h-5" />
//                         )}
//                       </button>
//                     </div>
                    
//                     {/* Expanded Details */}
//                     <AnimatePresence>
//                       {expandedId === op.id && (
//                         <motion.div
//                           initial={{ opacity: 0, height: 0 }}
//                           animate={{ opacity: 1, height: 'auto' }}
//                           exit={{ opacity: 0, height: 0 }}
//                           className="mt-4 pt-4 border-t overflow-hidden"
//                         >
//                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                             {/* Description */}
//                             <div>
//                               <h4 className="font-medium mb-2">Description</h4>
//                               <p className="text-sm text-gray-600 bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
//                                 {op.description || 'No description provided'}
//                               </p>
//                             </div>
                            
//                             {/* Error Details */}
//                             {op.error_message && (
//                               <div>
//                                 <h4 className="font-medium mb-2 text-red-600">Error</h4>
//                                 <div className="bg-red-50 dark:bg-red-900/30 p-3 rounded-lg">
//                                   <p className="text-sm text-red-800 dark:text-red-400">
//                                     {op.error_message}
//                                   </p>
//                                   {op.error_details && (
//                                     <pre className="mt-2 text-xs bg-red-100 dark:bg-red-900/50 p-2 rounded overflow-x-auto">
//                                       {JSON.stringify(op.error_details, null, 2)}
//                                     </pre>
//                                   )}
//                                 </div>
//                               </div>
//                             )}
                            
//                             {/* Result Data */}
//                             {op.result_data && Object.keys(op.result_data).length > 0 && (
//                               <div>
//                                 <h4 className="font-medium mb-2">Result Data</h4>
//                                 <pre className="text-xs bg-gray-50 dark:bg-gray-900 p-3 rounded-lg overflow-x-auto">
//                                   {JSON.stringify(op.result_data, null, 2)}
//                                 </pre>
//                               </div>
//                             )}
                            
//                             {/* Metadata */}
//                             {op.metadata && Object.keys(op.metadata).length > 0 && (
//                               <div>
//                                 <h4 className="font-medium mb-2">Metadata</h4>
//                                 <pre className="text-xs bg-gray-50 dark:bg-gray-900 p-3 rounded-lg overflow-x-auto">
//                                   {JSON.stringify(op.metadata, null, 2)}
//                                 </pre>
//                               </div>
//                             )}
                            
//                             {/* Timeline */}
//                             <div>
//                               <h4 className="font-medium mb-2">Timeline</h4>
//                               <div className="space-y-2 text-sm">
//                                 <div className="flex justify-between">
//                                   <span className="text-gray-600">Requested:</span>
//                                   <span>{new Date(op.requested_at).toLocaleString()}</span>
//                                 </div>
//                                 {op.started_at && (
//                                   <div className="flex justify-between">
//                                     <span className="text-gray-600">Started:</span>
//                                     <span>{new Date(op.started_at).toLocaleString()}</span>
//                                   </div>
//                                 )}
//                                 {op.completed_at && (
//                                   <div className="flex justify-between">
//                                     <span className="text-gray-600">Completed:</span>
//                                     <span>{new Date(op.completed_at).toLocaleString()}</span>
//                                   </div>
//                                 )}
//                               </div>
//                             </div>
                            
//                             {/* Progress */}
//                             {op.total_steps > 0 && (
//                               <div>
//                                 <h4 className="font-medium mb-2">Progress</h4>
//                                 <div className="space-y-2">
//                                   <div className="flex justify-between text-sm">
//                                     <span>Step {op.current_step} of {op.total_steps}</span>
//                                     <span>{Math.round((op.current_step / op.total_steps) * 100)}%</span>
//                                   </div>
//                                   <div className="w-full bg-gray-200 rounded-full h-2">
//                                     <div
//                                       className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
//                                       style={{ width: `${(op.current_step / op.total_steps) * 100}%` }}
//                                     />
//                                   </div>
//                                 </div>
//                               </div>
//                             )}
//                           </div>
                          
//                           {/* Tags */}
//                           {op.tags && op.tags.length > 0 && (
//                             <div className="mt-4">
//                               <h4 className="font-medium mb-2">Tags</h4>
//                               <div className="flex flex-wrap gap-2">
//                                 {op.tags.map((tag, i) => (
//                                   <span
//                                     key={i}
//                                     className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs"
//                                   >
//                                     {tag}
//                                   </span>
//                                 ))}
//                               </div>
//                             </div>
//                           )}
//                         </motion.div>
//                       )}
//                     </AnimatePresence>
//                   </motion.div>
//                 );
//               })
//             )}
//           </div>
//         </div>
        
//         {/* Pagination */}
//         {totalPages > 1 && (
//           <div className={`flex items-center justify-between px-4 py-3 border-t ${themeClasses.border.light}`}>
//             <div className="text-sm text-gray-600">
//               Page {page} of {totalPages}
//             </div>
//             <div className="flex gap-2">
//               <button
//                 onClick={prevPage}
//                 disabled={page === 1}
//                 className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 disabled:opacity-50"
//               >
//                 <ChevronDown className="w-5 h-5 rotate-90" />
//               </button>
//               <button
//                 onClick={nextPage}
//                 disabled={page === totalPages}
//                 className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 disabled:opacity-50"
//               >
//                 <ChevronDown className="w-5 h-5 -rotate-90" />
//               </button>
//             </div>
//           </div>
//         )}
//       </div>
//     </ErrorBoundary>
//   );
// };

// export default ClientOperations;









// src/Pages/ServiceManagement/components/ClientOperations.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Clock, Check, X, AlertTriangle, Search, Filter,
  User, Phone, Mail, Calendar, Activity, RefreshCw,
  ChevronDown, ChevronUp, Eye, Download, Printer,
  TrendingUp, TrendingDown, Minus, Smartphone, Laptop
} from 'lucide-react';
import { API_ENDPOINTS, PAGINATION } from './constants';
import { useApi } from './hooks/useApi';
import { useDebounce } from './hooks/useDebounce';
import { usePagination } from './hooks/usePagination';
import { getThemeClasses, EnhancedSelect } from '../../../components/ServiceManagement/Shared/components';
import { TableSkeleton } from './common/TableSkeleton';
import { ErrorBoundary } from './common/ErrorBoundary';

const ClientOperations = ({ theme, addNotification }) => {
  const themeClasses = getThemeClasses(theme);
  
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [expandedId, setExpandedId] = useState(null);
  
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
    changePageSize,
  } = usePagination(1, PAGINATION.DEFAULT_PAGE_SIZE);
  
  // Fetch operations
  const { data: operationsData, loading, error, fetchData } = useApi(
    API_ENDPOINTS.CLIENT_OPERATIONS,
    { cacheKey: 'clientOperations' }
  );
  
  // Ensure operations is always an array
  const operations = useMemo(() => {
    return Array.isArray(operationsData) ? operationsData : [];
  }, [operationsData]);
  
  // Initial fetch
  useEffect(() => {
    fetchData({ page, page_size: pageSize });
  }, [fetchData, page, pageSize]);
  
  // Get unique operation types for filter
  const operationTypes = useMemo(() => {
    const types = new Set(operations.map(op => op.operation_type).filter(Boolean));
    return Array.from(types).sort();
  }, [operations]);
  
  // Filter and sort operations
  const filteredOperations = useMemo(() => {
    return operations
      .filter(op => {
        // Search filter
        const matchesSearch = debouncedSearch === '' ||
          (op.client_name?.toLowerCase().includes(debouncedSearch.toLowerCase())) ||
          (op.client_phone?.includes(debouncedSearch)) ||
          (op.client_email?.toLowerCase().includes(debouncedSearch.toLowerCase())) ||
          (op.operation_type?.toLowerCase().includes(debouncedSearch.toLowerCase())) ||
          (op.title?.toLowerCase().includes(debouncedSearch.toLowerCase())) ||
          (op.description?.toLowerCase().includes(debouncedSearch.toLowerCase()));
        
        // Type filter
        const matchesType = filterType === 'all' || op.operation_type === filterType;
        
        // Status filter
        const matchesStatus = filterStatus === 'all' || op.status === filterStatus;
        
        // Priority filter
        const matchesPriority = filterPriority === 'all' || 
          (filterPriority === 'high' && op.priority >= 4) ||
          (filterPriority === 'medium' && op.priority === 3) ||
          (filterPriority === 'low' && op.priority <= 2);
        
        return matchesSearch && matchesType && matchesStatus && matchesPriority;
      })
      .sort((a, b) => {
        let aVal = a[sortField];
        let bVal = b[sortField];
        
        // Handle dates
        if (sortField === 'created_at' || sortField === 'requested_at' || sortField === 'completed_at') {
          aVal = new Date(aVal).getTime();
          bVal = new Date(bVal).getTime();
        }
        
        // Handle numbers
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        }
        
        // Handle strings
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          aVal = aVal.toLowerCase();
          bVal = bVal.toLowerCase();
          const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
          return sortDirection === 'asc' ? comparison : -comparison;
        }
        
        return 0;
      });
  }, [operations, debouncedSearch, filterType, filterStatus, filterPriority, sortField, sortDirection]);
  
  // Update total count
  useEffect(() => {
    setTotal(filteredOperations.length);
  }, [filteredOperations.length, setTotal]);
  
  // Paginate results
  const paginatedOperations = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return filteredOperations.slice(start, end);
  }, [filteredOperations, page, pageSize]);
  
  // Handle sort
  const handleSort = useCallback((field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  }, [sortField]);
  
  // Get status icon and color
  const getStatusInfo = useCallback((status) => {
    const statusMap = {
      completed: { icon: Check, color: 'text-green-600', bg: 'bg-green-100' },
      failed: { icon: X, color: 'text-red-600', bg: 'bg-red-100' },
      pending: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100' },
      in_progress: { icon: Activity, color: 'text-blue-600', bg: 'bg-blue-100' },
      cancelled: { icon: X, color: 'text-gray-600', bg: 'bg-gray-100' },
    };
    
    return statusMap[status] || { icon: AlertTriangle, color: 'text-gray-600', bg: 'bg-gray-100' };
  }, []);
  
  // Get priority badge
  const getPriorityBadge = useCallback((priority) => {
    const priorityMap = {
      1: { label: 'Low', color: 'bg-blue-100 text-blue-800' },
      2: { label: 'Medium', color: 'bg-green-100 text-green-800' },
      3: { label: 'High', color: 'bg-yellow-100 text-yellow-800' },
      4: { label: 'Urgent', color: 'bg-orange-100 text-orange-800' },
      5: { label: 'Critical', color: 'bg-red-100 text-red-800' },
    };
    
    return priorityMap[priority] || { label: 'Unknown', color: 'bg-gray-100 text-gray-800' };
  }, []);
  
  // Get device icon based on client type
  const getDeviceIcon = useCallback((clientType) => {
    if (clientType === 'hotspot_client') {
      return <Smartphone className="w-5 h-5 text-blue-600" title="Hotspot Client" />;
    } else if (clientType === 'pppoe_client') {
      return <Laptop className="w-5 h-5 text-green-600" title="PPPoE Client" />;
    }
    return <User className="w-5 h-5 text-gray-600" title="Client" />;
  }, []);
  
  // Format duration
  const formatDuration = useCallback((seconds) => {
    if (!seconds || seconds < 0) return 'N/A';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  }, []);
  
  // Calculate SLA status
  const getSLAStatus = useCallback((operation) => {
    if (!operation.sla_due_at) return null;
    
    const now = new Date();
    const dueDate = new Date(operation.sla_due_at);
    const diffHours = (dueDate - now) / (1000 * 60 * 60);
    
    if (operation.sla_breached) {
      return { label: 'Breached', color: 'text-red-600', bg: 'bg-red-100' };
    } else if (diffHours < 0) {
      return { label: 'Overdue', color: 'text-orange-600', bg: 'bg-orange-100' };
    } else if (diffHours < 1) {
      return { label: 'Urgent', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    } else if (diffHours < 4) {
      return { label: 'Warning', color: 'text-blue-600', bg: 'bg-blue-100' };
    }
    
    return { label: 'On Track', color: 'text-green-600', bg: 'bg-green-100' };
  }, []);
  
  // Export to CSV
  const exportToCSV = useCallback(() => {
    const headers = ['ID', 'Client', 'Phone', 'Type', 'Status', 'Priority', 'Created', 'Completed', 'Duration'];
    const rows = filteredOperations.map(op => [
      op.id,
      op.client_name || 'N/A',
      op.client_phone || 'N/A',
      op.operation_type,
      op.status,
      op.priority,
      new Date(op.created_at).toLocaleString(),
      op.completed_at ? new Date(op.completed_at).toLocaleString() : 'N/A',
      op.duration_seconds ? formatDuration(op.duration_seconds) : 'N/A',
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `client-operations-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    addNotification({ type: 'success', message: 'Export completed successfully' });
  }, [filteredOperations, formatDuration, addNotification]);
  
  // Options for EnhancedSelect
  const typeOptions = [
    { value: 'all', label: 'All Types' },
    ...operationTypes.map(type => ({
      value: type,
      label: type.replace(/_/g, ' ')
    }))
  ];
  
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'failed', label: 'Failed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];
  
  const priorityOptions = [
    { value: 'all', label: 'All Priorities' },
    { value: 'high', label: 'High (4-5)' },
    { value: 'medium', label: 'Medium (3)' },
    { value: 'low', label: 'Low (1-2)' }
  ];
  
  const pageSizeOptions = PAGINATION.PAGE_SIZE_OPTIONS.map(size => ({
    value: size,
    label: `${size} / page`
  }));
  
  if (loading && !operations.length) {
    return <TableSkeleton rows={10} columns={7} theme={theme} />;
  }
  
  if (error) {
    return (
      <div className={`p-8 text-center rounded-xl ${themeClasses.bg.card} border ${themeClasses.border.light}`}>
        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className={`text-xl font-bold mb-2 ${themeClasses.text.primary}`}>Failed to Load Operations</h3>
        <p className={`text-sm ${themeClasses.text.secondary} mb-4`}>{error}</p>
        <button
          onClick={() => fetchData()}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Try Again
        </button>
      </div>
    );
  }
  
  return (
    <ErrorBoundary>
      <div className={`space-y-6`}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className={`text-2xl font-bold ${themeClasses.text.primary}`}>Client Operations Log</h2>
            <p className={`text-sm ${themeClasses.text.secondary} mt-1`}>
              Track and monitor all client-initiated operations
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
            <button
              onClick={() => fetchData()}
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className={`p-4 rounded-xl ${themeClasses.bg.card} border ${themeClasses.border.light}`}>
            <div className="text-2xl font-bold text-blue-600">
              {operations.filter(op => op.status === 'pending').length}
            </div>
            <div className={`text-sm ${themeClasses.text.secondary}`}>Pending</div>
          </div>
          <div className={`p-4 rounded-xl ${themeClasses.bg.card} border ${themeClasses.border.light}`}>
            <div className="text-2xl font-bold text-green-600">
              {operations.filter(op => op.status === 'completed').length}
            </div>
            <div className={`text-sm ${themeClasses.text.secondary}`}>Completed</div>
          </div>
          <div className={`p-4 rounded-xl ${themeClasses.bg.card} border ${themeClasses.border.light}`}>
            <div className="text-2xl font-bold text-red-600">
              {operations.filter(op => op.status === 'failed').length}
            </div>
            <div className={`text-sm ${themeClasses.text.secondary}`}>Failed</div>
          </div>
          <div className={`p-4 rounded-xl ${themeClasses.bg.card} border ${themeClasses.border.light}`}>
            <div className="text-2xl font-bold text-purple-600">
              {operations.filter(op => op.priority >= 4).length}
            </div>
            <div className={`text-sm ${themeClasses.text.secondary}`}>High Priority</div>
          </div>
        </div>
        
        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by client, phone, type, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`pl-10 pr-4 py-3 rounded-lg border ${themeClasses.input} w-full`}
            />
          </div>
          
          {/* Type Filter - EnhancedSelect */}
          <div className="min-w-40">
            <EnhancedSelect
              value={filterType}
              onChange={setFilterType}
              options={typeOptions}
              placeholder="Filter by type"
              theme={theme}
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
          
          {/* Priority Filter - EnhancedSelect */}
          <div className="min-w-40">
            <EnhancedSelect
              value={filterPriority}
              onChange={setFilterPriority}
              options={priorityOptions}
              placeholder="Filter by priority"
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
          Showing {paginatedOperations.length} of {filteredOperations.length} operations
        </div>
        
        {/* Operations List */}
        <div className={`rounded-xl overflow-hidden shadow-lg ${themeClasses.bg.card} border ${themeClasses.border.light}`}>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {paginatedOperations.length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className={`text-lg font-medium ${themeClasses.text.primary}`}>No operations found</p>
                <p className={`text-sm ${themeClasses.text.secondary} mt-2`}>Try adjusting your filters</p>
              </div>
            ) : (
              paginatedOperations.map(op => {
                const StatusIcon = getStatusInfo(op.status).icon;
                const statusColor = getStatusInfo(op.status).color;
                const statusBg = getStatusInfo(op.status).bg;
                const priority = getPriorityBadge(op.priority);
                const slaStatus = getSLAStatus(op);
                
                return (
                  <motion.div
                    key={op.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    {/* Main Row */}
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      {/* Client Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {getDeviceIcon(op.client_type)}
                          <span className={`font-medium truncate ${themeClasses.text.primary}`}>
                            {op.client_name || 'Anonymous Client'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          {op.client_phone && (
                            <span className={`flex items-center gap-1 text-xs ${themeClasses.text.tertiary}`}>
                              <Phone className="w-3 h-3" />
                              {op.client_phone}
                            </span>
                          )}
                          {op.client_email && (
                            <span className={`flex items-center gap-1 text-xs ${themeClasses.text.tertiary}`}>
                              <Mail className="w-3 h-3" />
                              {op.client_email}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Operation Type */}
                      <div className="lg:w-48">
                        <div className={`text-sm font-medium capitalize ${themeClasses.text.primary}`}>
                          {op.operation_type?.replace(/_/g, ' ')}
                        </div>
                        <div className={`text-xs ${themeClasses.text.tertiary} mt-1`}>{op.title}</div>
                      </div>
                      
                      {/* Status & Priority */}
                      <div className="flex items-center gap-3">
                        <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs ${statusBg}`}>
                          <StatusIcon className={`w-3 h-3 ${statusColor}`} />
                          <span className="capitalize">{op.status?.replace(/_/g, ' ')}</span>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs ${priority.color}`}>
                          {priority.label}
                        </div>
                      </div>
                      
                      {/* SLA Status */}
                      {slaStatus && (
                        <div className={`px-3 py-1 rounded-full text-xs ${slaStatus.bg} ${slaStatus.color}`}>
                          {slaStatus.label}
                        </div>
                      )}
                      
                      {/* Timestamps */}
                      <div className="lg:w-48">
                        <div className={`flex items-center gap-1 text-sm ${themeClasses.text.secondary}`}>
                          <Calendar className="w-3 h-3" />
                          {new Date(op.created_at).toLocaleString()}
                        </div>
                        {op.duration_seconds > 0 && (
                          <div className={`flex items-center gap-1 mt-1 text-xs ${themeClasses.text.tertiary}`}>
                            <Clock className="w-3 h-3" />
                            {formatDuration(op.duration_seconds)}
                          </div>
                        )}
                      </div>
                      
                      {/* Expand Button */}
                      <button
                        onClick={() => setExpandedId(expandedId === op.id ? null : op.id)}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        {expandedId === op.id ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    
                    {/* Expanded Details */}
                    <AnimatePresence>
                      {expandedId === op.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 pt-4 border-t overflow-hidden"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Description */}
                            <div>
                              <h4 className={`font-medium mb-2 ${themeClasses.text.primary}`}>Description</h4>
                              <p className={`text-sm ${themeClasses.text.secondary} bg-gray-50 dark:bg-gray-900 p-3 rounded-lg`}>
                                {op.description || 'No description provided'}
                              </p>
                            </div>
                            
                            {/* Error Details */}
                            {op.error_message && (
                              <div>
                                <h4 className={`font-medium mb-2 text-red-600`}>Error</h4>
                                <div className="bg-red-50 dark:bg-red-900/30 p-3 rounded-lg">
                                  <p className="text-sm text-red-800 dark:text-red-400">
                                    {op.error_message}
                                  </p>
                                  {op.error_details && (
                                    <pre className="mt-2 text-xs bg-red-100 dark:bg-red-900/50 p-2 rounded overflow-x-auto">
                                      {JSON.stringify(op.error_details, null, 2)}
                                    </pre>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            {/* Result Data */}
                            {op.result_data && Object.keys(op.result_data).length > 0 && (
                              <div>
                                <h4 className={`font-medium mb-2 ${themeClasses.text.primary}`}>Result Data</h4>
                                <pre className={`text-xs ${themeClasses.bg.secondary} p-3 rounded-lg overflow-x-auto`}>
                                  {JSON.stringify(op.result_data, null, 2)}
                                </pre>
                              </div>
                            )}
                            
                            {/* Metadata */}
                            {op.metadata && Object.keys(op.metadata).length > 0 && (
                              <div>
                                <h4 className={`font-medium mb-2 ${themeClasses.text.primary}`}>Metadata</h4>
                                <pre className={`text-xs ${themeClasses.bg.secondary} p-3 rounded-lg overflow-x-auto`}>
                                  {JSON.stringify(op.metadata, null, 2)}
                                </pre>
                              </div>
                            )}
                            
                            {/* Timeline */}
                            <div>
                              <h4 className={`font-medium mb-2 ${themeClasses.text.primary}`}>Timeline</h4>
                              <div className={`space-y-2 text-sm ${themeClasses.text.secondary}`}>
                                <div className="flex justify-between">
                                  <span>Requested:</span>
                                  <span className={themeClasses.text.primary}>
                                    {new Date(op.requested_at).toLocaleString()}
                                  </span>
                                </div>
                                {op.started_at && (
                                  <div className="flex justify-between">
                                    <span>Started:</span>
                                    <span className={themeClasses.text.primary}>
                                      {new Date(op.started_at).toLocaleString()}
                                    </span>
                                  </div>
                                )}
                                {op.completed_at && (
                                  <div className="flex justify-between">
                                    <span>Completed:</span>
                                    <span className={themeClasses.text.primary}>
                                      {new Date(op.completed_at).toLocaleString()}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {/* Progress */}
                            {op.total_steps > 0 && (
                              <div>
                                <h4 className={`font-medium mb-2 ${themeClasses.text.primary}`}>Progress</h4>
                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span className={themeClasses.text.secondary}>
                                      Step {op.current_step} of {op.total_steps}
                                    </span>
                                    <span className={themeClasses.text.primary}>
                                      {Math.round((op.current_step / op.total_steps) * 100)}%
                                    </span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                      className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                                      style={{ width: `${(op.current_step / op.total_steps) * 100}%` }}
                                    />
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {/* Tags */}
                          {op.tags && op.tags.length > 0 && (
                            <div className="mt-4">
                              <h4 className={`font-medium mb-2 ${themeClasses.text.primary}`}>Tags</h4>
                              <div className="flex flex-wrap gap-2">
                                {op.tags.map((tag, i) => (
                                  <span
                                    key={i}
                                    className={`px-3 py-1 ${themeClasses.bg.secondary} rounded-full text-xs`}
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })
            )}
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
      </div>
    </ErrorBoundary>
  );
};

export default ClientOperations;