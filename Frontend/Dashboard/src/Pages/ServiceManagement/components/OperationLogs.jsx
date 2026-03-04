





// // src/components/ServiceOperations/OperationLogs.jsx
// import React, { useState, useEffect, useMemo, useCallback } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import {
//   Terminal, AlertCircle, CheckCircle, Info, AlertTriangle,
//   Search, Filter, Calendar, Clock, User, Tag,
//   ChevronDown, ChevronUp, Download, RefreshCw,
//   X, Eye, Copy, Code, Server, Database, Wifi
// } from 'lucide-react';
// import { API_ENDPOINTS } from './constants';
// import { useApi } from './hooks/useApi';
// import { useDebounce } from './hooks/useDebounce';
// import { usePagination } from './hooks/usePagination';
// import { getThemeClasses } from '../../../components/ServiceManagement/Shared/components';
// import { TableSkeleton } from './common/TableSkeleton';
// import { ErrorBoundary } from './common/ErrorBoundary';

// const OperationLogs = ({ theme, addNotification }) => {
//   const themeClasses = getThemeClasses(theme);
  
//   // State
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filterLevel, setFilterLevel] = useState('all');
//   const [filterType, setFilterType] = useState('all');
//   const [filterSource, setFilterSource] = useState('all');
//   const [timeRange, setTimeRange] = useState('24h');
//   const [expandedLog, setExpandedLog] = useState(null);
//   const [showJson, setShowJson] = useState(false);
  
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
//   } = usePagination(1, 50);
  
//   // Fetch logs
//   const { data: logsData, loading, error, fetchData } = useApi(
//     API_ENDPOINTS.OPERATION_LOGS,
//     { cacheKey: 'operationLogs' }
//   );
  
//   // Ensure logs is always an array
//   const logs = useMemo(() => {
//     return Array.isArray(logsData) ? logsData : [];
//   }, [logsData]);
  
//   // Initial fetch
//   useEffect(() => {
//     fetchData({ page, page_size: pageSize });
//   }, [fetchData, page, pageSize]);
  
//   // Filter logs
//   const filteredLogs = useMemo(() => {
//     const now = new Date();
//     const timeFilters = {
//       '1h': new Date(now - 60 * 60 * 1000),
//       '6h': new Date(now - 6 * 60 * 60 * 1000),
//       '24h': new Date(now - 24 * 60 * 60 * 1000),
//       '7d': new Date(now - 7 * 24 * 60 * 60 * 1000),
//       '30d': new Date(now - 30 * 24 * 60 * 60 * 1000),
//     };
    
//     return logs
//       .filter(log => {
//         // Search filter
//         const matchesSearch = debouncedSearch === '' ||
//           (log.message?.toLowerCase().includes(debouncedSearch.toLowerCase())) ||
//           (log.description?.toLowerCase().includes(debouncedSearch.toLowerCase())) ||
//           (log.source_module?.toLowerCase().includes(debouncedSearch.toLowerCase())) ||
//           (log.source_function?.toLowerCase().includes(debouncedSearch.toLowerCase())) ||
//           (log.error_message?.toLowerCase().includes(debouncedSearch.toLowerCase()));
        
//         // Level filter
//         const matchesLevel = filterLevel === 'all' || log.severity === filterLevel;
        
//         // Type filter
//         const matchesType = filterType === 'all' || log.operation_type === filterType;
        
//         // Source filter
//         const matchesSource = filterSource === 'all' || log.source_module === filterSource;
        
//         // Time range filter
//         const logTime = new Date(log.timestamp || log.created_at);
//         const matchesTime = timeRange === 'all' || !timeFilters[timeRange] || logTime >= timeFilters[timeRange];
        
//         return matchesSearch && matchesLevel && matchesType && matchesSource && matchesTime;
//       })
//       .sort((a, b) => new Date(b.timestamp || b.created_at) - new Date(a.timestamp || a.created_at));
//   }, [logs, debouncedSearch, filterLevel, filterType, filterSource, timeRange]);
  
//   // Update total count
//   useEffect(() => {
//     setTotal(filteredLogs.length);
//   }, [filteredLogs.length, setTotal]);
  
//   // Paginate results
//   const paginatedLogs = useMemo(() => {
//     const start = (page - 1) * pageSize;
//     const end = start + pageSize;
//     return filteredLogs.slice(start, end);
//   }, [filteredLogs, page, pageSize]);
  
//   // Get unique sources for filter
//   const uniqueSources = useMemo(() => {
//     const sources = new Set(logs.map(log => log.source_module).filter(Boolean));
//     return Array.from(sources).sort();
//   }, [logs]);
  
//   // Get unique types for filter
//   const uniqueTypes = useMemo(() => {
//     const types = new Set(logs.map(log => log.operation_type).filter(Boolean));
//     return Array.from(types).sort();
//   }, [logs]);
  
//   // Get level icon and color
//   const getLevelInfo = useCallback((level) => {
//     const levelMap = {
//       error: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100', border: 'border-red-200' },
//       critical: { icon: AlertTriangle, color: 'text-red-700', bg: 'bg-red-200', border: 'border-red-300' },
//       warning: { icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-100', border: 'border-yellow-200' },
//       info: { icon: Info, color: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-200' },
//       debug: { icon: Terminal, color: 'text-gray-600', bg: 'bg-gray-100', border: 'border-gray-200' },
//       success: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', border: 'border-green-200' },
//     };
//     return levelMap[level] || levelMap.info;
//   }, []);
  
//   // Copy to clipboard
//   const copyToClipboard = useCallback((text) => {
//     navigator.clipboard.writeText(text).then(() => {
//       addNotification({ type: 'success', message: 'Copied to clipboard' });
//     }).catch(() => {
//       addNotification({ type: 'error', message: 'Failed to copy' });
//     });
//   }, [addNotification]);
  
//   // Export logs
//   const exportLogs = useCallback(() => {
//     const headers = ['Timestamp', 'Level', 'Type', 'Message', 'Source', 'Function', 'Duration'];
//     const rows = filteredLogs.map(log => [
//       new Date(log.timestamp || log.created_at).toLocaleString(),
//       log.severity,
//       log.operation_type,
//       (log.message || log.description || '').replace(/,/g, ';'),
//       log.source_module || '',
//       log.source_function || '',
//       log.duration_ms ? `${log.duration_ms}ms` : '',
//     ]);
    
//     const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
//     const blob = new Blob([csvContent], { type: 'text/csv' });
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = `operation-logs-${new Date().toISOString().split('T')[0]}.csv`;
//     a.click();
//     window.URL.revokeObjectURL(url);
    
//     addNotification({ type: 'success', message: 'Logs exported successfully' });
//   }, [filteredLogs, addNotification]);
  
//   if (loading && !logs.length) {
//     return <TableSkeleton rows={20} columns={6} />;
//   }
  
//   if (error) {
//     return (
//       <div className={`p-8 text-center rounded-xl ${themeClasses.bg.card} border ${themeClasses.border.light}`}>
//         <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
//         <h3 className="text-xl font-bold mb-2">Failed to Load Logs</h3>
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
//             <h2 className="text-2xl font-bold">Operation Logs</h2>
//             <p className="text-sm text-gray-600 mt-1">
//               System-wide operation logs with detailed information
//             </p>
//           </div>
          
//           <div className="flex gap-3">
//             <button
//               onClick={exportLogs}
//               className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
//             >
//               <Download className="w-4 h-4" />
//               Export
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
//             <div className="text-2xl font-bold text-blue-600">{filteredLogs.length}</div>
//             <div className="text-sm text-gray-600">Total Logs</div>
//           </div>
//           <div className={`p-4 rounded-xl ${themeClasses.bg.card} border ${themeClasses.border.light}`}>
//             <div className="text-2xl font-bold text-red-600">
//               {filteredLogs.filter(l => l.severity === 'error' || l.severity === 'critical').length}
//             </div>
//             <div className="text-sm text-gray-600">Errors</div>
//           </div>
//           <div className={`p-4 rounded-xl ${themeClasses.bg.card} border ${themeClasses.border.light}`}>
//             <div className="text-2xl font-bold text-yellow-600">
//               {filteredLogs.filter(l => l.severity === 'warning').length}
//             </div>
//             <div className="text-sm text-gray-600">Warnings</div>
//           </div>
//           <div className={`p-4 rounded-xl ${themeClasses.bg.card} border ${themeClasses.border.light}`}>
//             <div className="text-2xl font-bold text-green-600">
//               {filteredLogs.filter(l => l.severity === 'info').length}
//             </div>
//             <div className="text-sm text-gray-600">Info</div>
//           </div>
//         </div>
        
//         {/* Filters */}
//         <div className="flex flex-col lg:flex-row gap-4">
//           {/* Search */}
//           <div className="relative flex-1">
//             <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
//             <input
//               type="text"
//               placeholder="Search by message, source, or error..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className={`pl-10 pr-4 py-3 rounded-lg border ${themeClasses.input} w-full`}
//             />
//           </div>
          
//           {/* Level Filter */}
//           <select
//             value={filterLevel}
//             onChange={(e) => setFilterLevel(e.target.value)}
//             className={`px-4 py-3 rounded-lg border ${themeClasses.input} min-w-40`}
//           >
//             <option value="all">All Levels</option>
//             <option value="critical">Critical</option>
//             <option value="error">Error</option>
//             <option value="warning">Warning</option>
//             <option value="info">Info</option>
//             <option value="debug">Debug</option>
//             <option value="success">Success</option>
//           </select>
          
//           {/* Type Filter */}
//           <select
//             value={filterType}
//             onChange={(e) => setFilterType(e.target.value)}
//             className={`px-4 py-3 rounded-lg border ${themeClasses.input} min-w-40`}
//           >
//             <option value="all">All Types</option>
//             {uniqueTypes.map(type => (
//               <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
//             ))}
//           </select>
          
//           {/* Source Filter */}
//           <select
//             value={filterSource}
//             onChange={(e) => setFilterSource(e.target.value)}
//             className={`px-4 py-3 rounded-lg border ${themeClasses.input} min-w-40`}
//           >
//             <option value="all">All Sources</option>
//             {uniqueSources.map(source => (
//               <option key={source} value={source}>{source}</option>
//             ))}
//           </select>
          
//           {/* Time Range Filter */}
//           <select
//             value={timeRange}
//             onChange={(e) => setTimeRange(e.target.value)}
//             className={`px-4 py-3 rounded-lg border ${themeClasses.input} min-w-40`}
//           >
//             <option value="1h">Last Hour</option>
//             <option value="6h">Last 6 Hours</option>
//             <option value="24h">Last 24 Hours</option>
//             <option value="7d">Last 7 Days</option>
//             <option value="30d">Last 30 Days</option>
//             <option value="all">All Time</option>
//           </select>
          
//           {/* Page Size */}
//           <select
//             value={pageSize}
//             onChange={(e) => changePageSize(Number(e.target.value))}
//             className={`px-4 py-3 rounded-lg border ${themeClasses.input} min-w-20`}
//           >
//             <option value={20}>20</option>
//             <option value={50}>50</option>
//             <option value={100}>100</option>
//             <option value={200}>200</option>
//           </select>
//         </div>
        
//         {/* Results count */}
//         <div className="text-sm text-gray-600">
//           Showing {paginatedLogs.length} of {filteredLogs.length} logs
//         </div>
        
//         {/* Logs Display */}
//         <div className={`rounded-xl overflow-hidden shadow-lg ${themeClasses.bg.card} border ${themeClasses.border.light}`}>
//           <div className="divide-y max-h-[600px] overflow-y-auto">
//             {paginatedLogs.length === 0 ? (
//               <div className="p-12 text-center">
//                 <Terminal className="w-16 h-16 text-gray-400 mx-auto mb-4" />
//                 <p className="text-lg font-medium">No logs found</p>
//                 <p className="text-sm text-gray-600 mt-2">Try adjusting your filters</p>
//               </div>
//             ) : (
//               paginatedLogs.map((log, index) => {
//                 const LevelIcon = getLevelInfo(log.severity).icon;
//                 const levelColor = getLevelInfo(log.severity).color;
//                 const levelBg = getLevelInfo(log.severity).bg;
                
//                 return (
//                   <motion.div
//                     key={log.id || index}
//                     initial={{ opacity: 0 }}
//                     animate={{ opacity: 1 }}
//                     exit={{ opacity: 0 }}
//                     className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
//                   >
//                     {/* Main Row */}
//                     <div className="flex flex-col lg:flex-row lg:items-center gap-4">
//                       {/* Level Icon */}
//                       <div className={`p-2 rounded-lg ${levelBg}`}>
//                         <LevelIcon className={`w-5 h-5 ${levelColor}`} />
//                       </div>
                      
//                       {/* Timestamp */}
//                       <div className="lg:w-48 text-sm">
//                         <div className="font-medium">
//                           {new Date(log.timestamp || log.created_at).toLocaleString()}
//                         </div>
//                         <div className="text-xs text-gray-500 mt-1">
//                           {log.duration_ms ? `${log.duration_ms}ms` : ''}
//                         </div>
//                       </div>
                      
//                       {/* Message */}
//                       <div className="flex-1 min-w-0">
//                         <div className="font-medium truncate">
//                           {log.message || log.description || 'No message'}
//                         </div>
//                         {log.error_message && (
//                           <div className="text-xs text-red-600 mt-1 truncate">
//                             Error: {log.error_message}
//                           </div>
//                         )}
//                       </div>
                      
//                       {/* Source */}
//                       <div className="lg:w-48">
//                         <div className="flex items-center gap-1 text-sm">
//                           <Code className="w-3 h-3" />
//                           <span className="truncate">{log.source_module || 'unknown'}</span>
//                         </div>
//                         <div className="text-xs text-gray-500 mt-1 truncate">
//                           {log.source_function || ''}
//                         </div>
//                       </div>
                      
//                       {/* Expand Button */}
//                       <button
//                         onClick={() => setExpandedLog(expandedLog === index ? null : index)}
//                         className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
//                       >
//                         {expandedLog === index ? (
//                           <ChevronUp className="w-5 h-5" />
//                         ) : (
//                           <ChevronDown className="w-5 h-5" />
//                         )}
//                       </button>
//                     </div>
                    
//                     {/* Expanded Details */}
//                     <AnimatePresence>
//                       {expandedLog === index && (
//                         <motion.div
//                           initial={{ opacity: 0, height: 0 }}
//                           animate={{ opacity: 1, height: 'auto' }}
//                           exit={{ opacity: 0, height: 0 }}
//                           className="mt-4 pt-4 border-t overflow-hidden"
//                         >
//                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                             {/* Details */}
//                             {log.details && Object.keys(log.details).length > 0 && (
//                               <div>
//                                 <h4 className="font-medium mb-2 flex items-center gap-2">
//                                   <Info className="w-4 h-4" />
//                                   Details
//                                 </h4>
//                                 <pre className="text-xs bg-gray-50 dark:bg-gray-900 p-3 rounded-lg overflow-x-auto max-h-40">
//                                   {JSON.stringify(log.details, null, 2)}
//                                 </pre>
//                               </div>
//                             )}
                            
//                             {/* Metadata */}
//                             {log.metadata && Object.keys(log.metadata).length > 0 && (
//                               <div>
//                                 <h4 className="font-medium mb-2 flex items-center gap-2">
//                                   <Tag className="w-4 h-4" />
//                                   Metadata
//                                 </h4>
//                                 <pre className="text-xs bg-gray-50 dark:bg-gray-900 p-3 rounded-lg overflow-x-auto max-h-40">
//                                   {JSON.stringify(log.metadata, null, 2)}
//                                 </pre>
//                               </div>
//                             )}
                            
//                             {/* Error Traceback */}
//                             {log.error_traceback && (
//                               <div className="md:col-span-2">
//                                 <h4 className="font-medium mb-2 text-red-600">Stack Trace</h4>
//                                 <pre className="text-xs bg-red-50 dark:bg-red-900/30 p-3 rounded-lg overflow-x-auto">
//                                   {log.error_traceback}
//                                 </pre>
//                               </div>
//                             )}
                            
//                             {/* Request/Correlation IDs */}
//                             {(log.request_id || log.correlation_id) && (
//                               <div className="md:col-span-2">
//                                 <h4 className="font-medium mb-2">Tracking</h4>
//                                 <div className="flex flex-wrap gap-4 text-sm">
//                                   {log.request_id && (
//                                     <div className="flex items-center gap-2">
//                                       <span className="text-gray-600">Request ID:</span>
//                                       <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
//                                         {log.request_id}
//                                       </code>
//                                       <button
//                                         onClick={() => copyToClipboard(log.request_id)}
//                                         className="p-1 hover:bg-gray-200 rounded"
//                                       >
//                                         <Copy className="w-3 h-3" />
//                                       </button>
//                                     </div>
//                                   )}
//                                   {log.correlation_id && (
//                                     <div className="flex items-center gap-2">
//                                       <span className="text-gray-600">Correlation ID:</span>
//                                       <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
//                                         {log.correlation_id}
//                                       </code>
//                                       <button
//                                         onClick={() => copyToClipboard(log.correlation_id)}
//                                         className="p-1 hover:bg-gray-200 rounded"
//                                       >
//                                         <Copy className="w-3 h-3" />
//                                       </button>
//                                     </div>
//                                   )}
//                                 </div>
//                               </div>
//                             )}
//                           </div>
                          
//                           {/* View Toggle */}
//                           <div className="mt-4 flex gap-2">
//                             <button
//                               onClick={() => setShowJson(!showJson)}
//                               className="text-xs px-3 py-1 bg-gray-200 dark:bg-gray-800 rounded-lg"
//                             >
//                               {showJson ? 'Hide Raw JSON' : 'View Raw JSON'}
//                             </button>
//                           </div>
                          
//                           {/* Raw JSON */}
//                           {showJson && (
//                             <pre className="mt-2 text-xs bg-gray-900 text-white p-3 rounded-lg overflow-x-auto">
//                               {JSON.stringify(log, null, 2)}
//                             </pre>
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
//       </div>
//     </ErrorBoundary>
//   );
// };

// export default OperationLogs;



// src/Pages/ServiceManagement/components/OperationLogs.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Terminal, AlertCircle, CheckCircle, Info, AlertTriangle,
  Search, Filter, Calendar, Clock, User, Tag,
  ChevronDown, ChevronUp, Download, RefreshCw,
  X, Eye, Copy, Code, Server, Database, Wifi
} from 'lucide-react';
import { API_ENDPOINTS, PAGINATION } from './constants';
import { useApi } from './hooks/useApi';
import { useDebounce } from './hooks/useDebounce';
import { usePagination } from './hooks/usePagination';
import { getThemeClasses, EnhancedSelect } from '../../../components/ServiceManagement/Shared/components';
import { TableSkeleton } from './common/TableSkeleton';
import { ErrorBoundary } from './common/ErrorBoundary';

const OperationLogs = ({ theme, addNotification }) => {
  const themeClasses = getThemeClasses(theme);
  
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterSource, setFilterSource] = useState('all');
  const [timeRange, setTimeRange] = useState('24h');
  const [expandedLog, setExpandedLog] = useState(null);
  const [showJson, setShowJson] = useState(false);
  
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
  } = usePagination(1, 50);
  
  // Fetch logs
  const { data: logsData, loading, error, fetchData } = useApi(
    API_ENDPOINTS.OPERATION_LOGS,
    { cacheKey: 'operationLogs' }
  );
  
  // Ensure logs is always an array
  const logs = useMemo(() => {
    return Array.isArray(logsData) ? logsData : [];
  }, [logsData]);
  
  // Initial fetch
  useEffect(() => {
    fetchData({ page, page_size: pageSize });
  }, [fetchData, page, pageSize]);
  
  // Get unique sources for filter
  const uniqueSources = useMemo(() => {
    const sources = new Set(logs.map(log => log.source_module).filter(Boolean));
    return Array.from(sources).sort();
  }, [logs]);
  
  // Get unique types for filter
  const uniqueTypes = useMemo(() => {
    const types = new Set(logs.map(log => log.operation_type).filter(Boolean));
    return Array.from(types).sort();
  }, [logs]);
  
  // Filter logs
  const filteredLogs = useMemo(() => {
    const now = new Date();
    const timeFilters = {
      '1h': new Date(now - 60 * 60 * 1000),
      '6h': new Date(now - 6 * 60 * 60 * 1000),
      '24h': new Date(now - 24 * 60 * 60 * 1000),
      '7d': new Date(now - 7 * 24 * 60 * 60 * 1000),
      '30d': new Date(now - 30 * 24 * 60 * 60 * 1000),
      'all': new Date(0)
    };
    
    return logs
      .filter(log => {
        // Search filter
        const matchesSearch = debouncedSearch === '' ||
          (log.message?.toLowerCase().includes(debouncedSearch.toLowerCase())) ||
          (log.description?.toLowerCase().includes(debouncedSearch.toLowerCase())) ||
          (log.source_module?.toLowerCase().includes(debouncedSearch.toLowerCase())) ||
          (log.source_function?.toLowerCase().includes(debouncedSearch.toLowerCase())) ||
          (log.error_message?.toLowerCase().includes(debouncedSearch.toLowerCase()));
        
        // Level filter
        const matchesLevel = filterLevel === 'all' || log.severity === filterLevel;
        
        // Type filter
        const matchesType = filterType === 'all' || log.operation_type === filterType;
        
        // Source filter
        const matchesSource = filterSource === 'all' || log.source_module === filterSource;
        
        // Time range filter
        const logTime = new Date(log.timestamp || log.created_at);
        const matchesTime = !timeFilters[timeRange] || logTime >= timeFilters[timeRange];
        
        return matchesSearch && matchesLevel && matchesType && matchesSource && matchesTime;
      })
      .sort((a, b) => new Date(b.timestamp || b.created_at) - new Date(a.timestamp || a.created_at));
  }, [logs, debouncedSearch, filterLevel, filterType, filterSource, timeRange]);
  
  // Update total count
  useEffect(() => {
    setTotal(filteredLogs.length);
  }, [filteredLogs.length, setTotal]);
  
  // Paginate results
  const paginatedLogs = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return filteredLogs.slice(start, end);
  }, [filteredLogs, page, pageSize]);
  
  // Get level icon and color
  const getLevelInfo = useCallback((level) => {
    const levelMap = {
      error: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100', border: 'border-red-200' },
      critical: { icon: AlertTriangle, color: 'text-red-700', bg: 'bg-red-200', border: 'border-red-300' },
      warning: { icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-100', border: 'border-yellow-200' },
      info: { icon: Info, color: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-200' },
      debug: { icon: Terminal, color: 'text-gray-600', bg: 'bg-gray-100', border: 'border-gray-200' },
      success: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', border: 'border-green-200' },
    };
    return levelMap[level] || levelMap.info;
  }, []);
  
  // Copy to clipboard
  const copyToClipboard = useCallback((text) => {
    navigator.clipboard.writeText(text).then(() => {
      addNotification({ type: 'success', message: 'Copied to clipboard' });
    }).catch(() => {
      addNotification({ type: 'error', message: 'Failed to copy' });
    });
  }, [addNotification]);
  
  // Export logs
  const exportLogs = useCallback(() => {
    const headers = ['Timestamp', 'Level', 'Type', 'Message', 'Source', 'Function', 'Duration', 'Request ID'];
    const rows = filteredLogs.map(log => [
      new Date(log.timestamp || log.created_at).toLocaleString(),
      log.severity,
      log.operation_type || '',
      (log.message || log.description || '').replace(/,/g, ';'),
      log.source_module || '',
      log.source_function || '',
      log.duration_ms ? `${log.duration_ms}ms` : '',
      log.request_id || ''
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `operation-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    addNotification({ type: 'success', message: 'Logs exported successfully' });
  }, [filteredLogs, addNotification]);
  
  // Options for EnhancedSelect
  const levelOptions = [
    { value: 'all', label: 'All Levels' },
    { value: 'critical', label: 'Critical' },
    { value: 'error', label: 'Error' },
    { value: 'warning', label: 'Warning' },
    { value: 'info', label: 'Info' },
    { value: 'debug', label: 'Debug' },
    { value: 'success', label: 'Success' }
  ];
  
  const typeOptions = [
    { value: 'all', label: 'All Types' },
    ...uniqueTypes.map(type => ({
      value: type,
      label: type.replace(/_/g, ' ')
    }))
  ];
  
  const sourceOptions = [
    { value: 'all', label: 'All Sources' },
    ...uniqueSources.map(source => ({
      value: source,
      label: source
    }))
  ];
  
  const timeRangeOptions = [
    { value: '1h', label: 'Last Hour' },
    { value: '6h', label: 'Last 6 Hours' },
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: 'all', label: 'All Time' }
  ];
  
  const pageSizeOptions = [20, 50, 100, 200].map(size => ({
    value: size,
    label: `${size} / page`
  }));
  
  if (loading && !logs.length) {
    return <TableSkeleton rows={20} columns={6} theme={theme} />;
  }
  
  if (error) {
    return (
      <div className={`p-8 text-center rounded-xl ${themeClasses.bg.card} border ${themeClasses.border.light}`}>
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className={`text-xl font-bold mb-2 ${themeClasses.text.primary}`}>Failed to Load Logs</h3>
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
            <h2 className={`text-2xl font-bold ${themeClasses.text.primary}`}>Operation Logs</h2>
            <p className={`text-sm ${themeClasses.text.secondary} mt-1`}>
              System-wide operation logs with detailed information
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={exportLogs}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
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
            <div className="text-2xl font-bold text-blue-600">{filteredLogs.length}</div>
            <div className={`text-sm ${themeClasses.text.secondary}`}>Total Logs</div>
          </div>
          <div className={`p-4 rounded-xl ${themeClasses.bg.card} border ${themeClasses.border.light}`}>
            <div className="text-2xl font-bold text-red-600">
              {filteredLogs.filter(l => l.severity === 'error' || l.severity === 'critical').length}
            </div>
            <div className={`text-sm ${themeClasses.text.secondary}`}>Errors</div>
          </div>
          <div className={`p-4 rounded-xl ${themeClasses.bg.card} border ${themeClasses.border.light}`}>
            <div className="text-2xl font-bold text-yellow-600">
              {filteredLogs.filter(l => l.severity === 'warning').length}
            </div>
            <div className={`text-sm ${themeClasses.text.secondary}`}>Warnings</div>
          </div>
          <div className={`p-4 rounded-xl ${themeClasses.bg.card} border ${themeClasses.border.light}`}>
            <div className="text-2xl font-bold text-green-600">
              {filteredLogs.filter(l => l.severity === 'info' || l.severity === 'success').length}
            </div>
            <div className={`text-sm ${themeClasses.text.secondary}`}>Info/Success</div>
          </div>
        </div>
        
        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by message, source, or error..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`pl-10 pr-4 py-3 rounded-lg border ${themeClasses.input} w-full`}
            />
          </div>
          
          {/* Level Filter - EnhancedSelect */}
          <div className="min-w-40">
            <EnhancedSelect
              value={filterLevel}
              onChange={setFilterLevel}
              options={levelOptions}
              placeholder="Filter by level"
              theme={theme}
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
          
          {/* Source Filter - EnhancedSelect */}
          <div className="min-w-40">
            <EnhancedSelect
              value={filterSource}
              onChange={setFilterSource}
              options={sourceOptions}
              placeholder="Filter by source"
              theme={theme}
            />
          </div>
          
          {/* Time Range Filter - EnhancedSelect */}
          <div className="min-w-40">
            <EnhancedSelect
              value={timeRange}
              onChange={setTimeRange}
              options={timeRangeOptions}
              placeholder="Time range"
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
          Showing {paginatedLogs.length} of {filteredLogs.length} logs
        </div>
        
        {/* Logs Display */}
        <div className={`rounded-xl overflow-hidden shadow-lg ${themeClasses.bg.card} border ${themeClasses.border.light}`}>
          <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[600px] overflow-y-auto">
            {paginatedLogs.length === 0 ? (
              <div className="p-12 text-center">
                <Terminal className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className={`text-lg font-medium ${themeClasses.text.primary}`}>No logs found</p>
                <p className={`text-sm ${themeClasses.text.secondary} mt-2`}>Try adjusting your filters</p>
              </div>
            ) : (
              paginatedLogs.map((log, index) => {
                const LevelIcon = getLevelInfo(log.severity).icon;
                const levelColor = getLevelInfo(log.severity).color;
                const levelBg = getLevelInfo(log.severity).bg;
                
                return (
                  <motion.div
                    key={log.id || index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    {/* Main Row */}
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      {/* Level Icon */}
                      <div className={`p-2 rounded-lg ${levelBg}`}>
                        <LevelIcon className={`w-5 h-5 ${levelColor}`} />
                      </div>
                      
                      {/* Timestamp */}
                      <div className="lg:w-48">
                        <div className={`font-medium ${themeClasses.text.primary}`}>
                          {new Date(log.timestamp || log.created_at).toLocaleString()}
                        </div>
                        <div className={`text-xs ${themeClasses.text.tertiary} mt-1`}>
                          {log.duration_ms ? `${log.duration_ms}ms` : ''}
                        </div>
                      </div>
                      
                      {/* Message */}
                      <div className="flex-1 min-w-0">
                        <div className={`font-medium truncate ${themeClasses.text.primary}`}>
                          {log.message || log.description || 'No message'}
                        </div>
                        {log.error_message && (
                          <div className="text-xs text-red-600 mt-1 truncate">
                            Error: {log.error_message}
                          </div>
                        )}
                      </div>
                      
                      {/* Source */}
                      <div className="lg:w-48">
                        <div className={`flex items-center gap-1 text-sm ${themeClasses.text.primary}`}>
                          <Code className="w-3 h-3" />
                          <span className="truncate">{log.source_module || 'unknown'}</span>
                        </div>
                        <div className={`text-xs ${themeClasses.text.tertiary} mt-1 truncate`}>
                          {log.source_function || ''}
                        </div>
                      </div>
                      
                      {/* Expand Button */}
                      <button
                        onClick={() => setExpandedLog(expandedLog === index ? null : index)}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
                      >
                        {expandedLog === index ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    
                    {/* Expanded Details */}
                    <AnimatePresence>
                      {expandedLog === index && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 pt-4 border-t overflow-hidden"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Details */}
                            {log.details && Object.keys(log.details).length > 0 && (
                              <div>
                                <h4 className={`font-medium mb-2 flex items-center gap-2 ${themeClasses.text.primary}`}>
                                  <Info className="w-4 h-4" />
                                  Details
                                </h4>
                                <pre className={`text-xs ${themeClasses.bg.secondary} p-3 rounded-lg overflow-x-auto max-h-40`}>
                                  {JSON.stringify(log.details, null, 2)}
                                </pre>
                              </div>
                            )}
                            
                            {/* Metadata */}
                            {log.metadata && Object.keys(log.metadata).length > 0 && (
                              <div>
                                <h4 className={`font-medium mb-2 flex items-center gap-2 ${themeClasses.text.primary}`}>
                                  <Tag className="w-4 h-4" />
                                  Metadata
                                </h4>
                                <pre className={`text-xs ${themeClasses.bg.secondary} p-3 rounded-lg overflow-x-auto max-h-40`}>
                                  {JSON.stringify(log.metadata, null, 2)}
                                </pre>
                              </div>
                            )}
                            
                            {/* Error Traceback */}
                            {log.error_traceback && (
                              <div className="md:col-span-2">
                                <h4 className={`font-medium mb-2 text-red-600`}>Stack Trace</h4>
                                <pre className="text-xs bg-red-50 dark:bg-red-900/30 p-3 rounded-lg overflow-x-auto">
                                  {log.error_traceback}
                                </pre>
                              </div>
                            )}
                            
                            {/* Request/Correlation IDs */}
                            {(log.request_id || log.correlation_id) && (
                              <div className="md:col-span-2">
                                <h4 className={`font-medium mb-2 ${themeClasses.text.primary}`}>Tracking</h4>
                                <div className="flex flex-wrap gap-4">
                                  {log.request_id && (
                                    <div className="flex items-center gap-2">
                                      <span className={`text-sm ${themeClasses.text.secondary}`}>Request ID:</span>
                                      <code className={`${themeClasses.bg.secondary} px-2 py-1 rounded text-sm`}>
                                        {log.request_id}
                                      </code>
                                      <button
                                        onClick={() => copyToClipboard(log.request_id)}
                                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                                      >
                                        <Copy className="w-3 h-3" />
                                      </button>
                                    </div>
                                  )}
                                  {log.correlation_id && (
                                    <div className="flex items-center gap-2">
                                      <span className={`text-sm ${themeClasses.text.secondary}`}>Correlation ID:</span>
                                      <code className={`${themeClasses.bg.secondary} px-2 py-1 rounded text-sm`}>
                                        {log.correlation_id}
                                      </code>
                                      <button
                                        onClick={() => copyToClipboard(log.correlation_id)}
                                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                                      >
                                        <Copy className="w-3 h-3" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {/* View Toggle */}
                          <div className="mt-4 flex gap-2">
                            <button
                              onClick={() => setShowJson(!showJson)}
                              className={`text-xs px-3 py-1 ${themeClasses.bg.secondary} rounded-lg`}
                            >
                              {showJson ? 'Hide Raw JSON' : 'View Raw JSON'}
                            </button>
                          </div>
                          
                          {/* Raw JSON */}
                          {showJson && (
                            <pre className="mt-2 text-xs bg-gray-900 text-white p-3 rounded-lg overflow-x-auto">
                              {JSON.stringify(log, null, 2)}
                            </pre>
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

export default OperationLogs;