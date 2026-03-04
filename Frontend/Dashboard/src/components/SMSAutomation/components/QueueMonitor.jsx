

// import React, { useState, useMemo } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import {
//   Clock, Play, Pause, AlertCircle, CheckCircle, XCircle,
//   Filter, Search, RefreshCw, Loader, Trash2, ChevronDown,
//   ChevronUp, BarChart3, Zap, Users, Calendar, Activity,
//   MessageSquare, Eye, EyeOff, Cpu, Database, Server, CheckSquare,
//   PlayCircle, StopCircle, FastForward, Rewind
// } from 'lucide-react';
// import { EnhancedSelect, ConfirmationModal, EmptyState, getThemeClasses } from '../../../components/ServiceManagement/Shared/components';
// import { formatTimeAgo, formatNumber, formatMessagePreview, getStatusBadge } from '../utils/formatters';

// const QueueMonitor = ({
//   queue = [],
//   loading,
//   theme,
//   themeClasses,
//   onRefresh,
//   onProcessBatch,
//   onClearFailed,
//   onRetryAll,
//   realTimeUpdates,
//   viewMode = 'grid',
//   searchTerm = '',
//   statusFilter = 'all'
// }) => {
//   const [expandedItem, setExpandedItem] = useState(null);
//   const [showClearModal, setShowClearModal] = useState(false);
//   const [processingBatch, setProcessingBatch] = useState(false);
//   const [selectedItems, setSelectedItems] = useState(new Set());
//   const [batchSize, setBatchSize] = useState(100);
//   const [processingSpeed, setProcessingSpeed] = useState('normal');
//   const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

//   // Queue statistics
//   const stats = useMemo(() => {
//     const total = queue.length;
//     const pending = queue.filter(q => q.status === 'pending').length;
//     const processing = queue.filter(q => q.status === 'processing').length;
//     const completed = queue.filter(q => q.status === 'completed').length;
//     const failed = queue.filter(q => q.status === 'failed').length;

//     // Calculate average processing time
//     const completedItems = queue.filter(q => q.status === 'completed');
//     let avgProcessingTime = 0;
//     if (completedItems.length > 0) {
//       const totalTime = completedItems.reduce((sum, item) => {
//         if (item.processing_started && item.processing_ended) {
//           const start = new Date(item.processing_started);
//           const end = new Date(item.processing_ended);
//           return sum + (end - start);
//         }
//         return sum;
//       }, 0);
//       avgProcessingTime = totalTime / completedItems.length / 1000;
//     }

//     // Calculate throughput
//     const lastHour = new Date(Date.now() - 60 * 60 * 1000);
//     const recentProcessed = queue.filter(q =>
//       q.status === 'completed' &&
//       new Date(q.processing_ended) > lastHour
//     ).length;
//     const throughput = recentProcessed / 60;

//     return { total, pending, processing, completed, failed, avgProcessingTime, throughput };
//   }, [queue]);

//   // Filter queue
//   const filteredQueue = useMemo(() => {
//     let filtered = queue;

//     if (searchTerm) {
//       const term = searchTerm.toLowerCase();
//       filtered = filtered.filter(item =>
//         item.message_phone?.toLowerCase().includes(term) ||
//         item.message_preview?.toLowerCase().includes(term) ||
//         item.error_message?.toLowerCase().includes(term)
//       );
//     }

//     if (statusFilter !== 'all') {
//       filtered = filtered.filter(item => item.status === statusFilter);
//     }

//     return filtered;
//   }, [queue, searchTerm, statusFilter]);

//   // Sort queue (pending first, then by priority)
//   const sortedQueue = useMemo(() => {
//     return [...filteredQueue].sort((a, b) => {
//       const statusOrder = { pending: 0, processing: 1, failed: 2, completed: 3 };
//       const statusDiff = (statusOrder[a.status] || 999) - (statusOrder[b.status] || 999);
//       if (statusDiff !== 0) return statusDiff;

//       const priorityDiff = (b.priority || 0) - (a.priority || 0);
//       if (priorityDiff !== 0) return priorityDiff;

//       return new Date(a.queued_at) - new Date(b.queued_at);
//     });
//   }, [filteredQueue]);

//   const handleProcessBatch = async () => {
//     setProcessingBatch(true);
//     try {
//       const speedConfig = { slow: 50, normal: 100, fast: 200 };
//       await onProcessBatch({
//         batch_size: speedConfig[processingSpeed] || 100
//       });
//       onRefresh();
//     } catch (error) {
//       console.error('Process batch failed:', error);
//     } finally {
//       setProcessingBatch(false);
//     }
//   };

//   const handleClearFailed = async () => {
//     try {
//       await onClearFailed({ age_hours: 24 });
//       onRefresh();
//       setShowClearModal(false);
//     } catch (error) {
//       console.error('Clear failed failed:', error);
//     }
//   };

//   const handleSelectAll = () => {
//     if (selectedItems.size === sortedQueue.length) {
//       setSelectedItems(new Set());
//     } else {
//       setSelectedItems(new Set(sortedQueue.map(item => item.id)));
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center py-12">
//         <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
//         <span className={`ml-3 ${themeClasses.text.secondary}`}>Loading queue...</span>
//       </div>
//     );
//   }

//   if (sortedQueue.length === 0) {
//     return (
//       <EmptyState
//         icon={Clock}
//         title="Queue is empty"
//         description="No messages are currently in the queue"
//         theme={theme}
//       />
//     );
//   }

//   return (
//     <div className="space-y-4">
//       {/* Queue Statistics */}
//       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//         <div className={`p-3 rounded-lg ${themeClasses.bg.secondary}`}>
//           <p className={`text-xs ${themeClasses.text.secondary}`}>Total</p>
//           <p className={`text-xl font-bold ${themeClasses.text.primary}`}>{stats.total}</p>
//         </div>
//         <div className={`p-3 rounded-lg ${themeClasses.bg.secondary}`}>
//           <p className={`text-xs ${themeClasses.text.secondary}`}>Pending</p>
//           <p className={`text-xl font-bold text-yellow-500`}>{stats.pending}</p>
//         </div>
//         <div className={`p-3 rounded-lg ${themeClasses.bg.secondary}`}>
//           <p className={`text-xs ${themeClasses.text.secondary}`}>Processing</p>
//           <p className={`text-xl font-bold text-blue-500`}>{stats.processing}</p>
//         </div>
//         <div className={`p-3 rounded-lg ${themeClasses.bg.secondary}`}>
//           <p className={`text-xs ${themeClasses.text.secondary}`}>Failed</p>
//           <p className={`text-xl font-bold text-red-500`}>{stats.failed}</p>
//         </div>
//       </div>

//       {/* Second Row Stats */}
//       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//         <div className={`p-3 rounded-lg ${themeClasses.bg.secondary}`}>
//           <p className={`text-xs ${themeClasses.text.secondary}`}>Completed</p>
//           <p className={`text-xl font-bold text-green-500`}>{stats.completed}</p>
//         </div>
//         <div className={`p-3 rounded-lg ${themeClasses.bg.secondary}`}>
//           <p className={`text-xs ${themeClasses.text.secondary}`}>Avg Time</p>
//           <p className={`text-xl font-bold ${themeClasses.text.primary}`}>
//             {stats.avgProcessingTime.toFixed(1)}s
//           </p>
//         </div>
//         <div className={`p-3 rounded-lg ${themeClasses.bg.secondary}`}>
//           <p className={`text-xs ${themeClasses.text.secondary}`}>Throughput</p>
//           <p className={`text-xl font-bold ${themeClasses.text.primary}`}>
//             {stats.throughput.toFixed(1)}/min
//           </p>
//         </div>
//         <div className={`p-3 rounded-lg ${themeClasses.bg.secondary}`}>
//           <p className={`text-xs ${themeClasses.text.secondary}`}>Est. Clear</p>
//           <p className={`text-xl font-bold ${themeClasses.text.primary}`}>
//             {stats.throughput > 0 ? Math.ceil(stats.pending / stats.throughput) : 0} min
//           </p>
//         </div>
//       </div>

//       {/* Actions */}
//       <div className="flex flex-wrap gap-2">
//         <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800">
//           <select
//             value={processingSpeed}
//             onChange={(e) => setProcessingSpeed(e.target.value)}
//             className={`bg-transparent border-0 text-sm focus:ring-0 ${themeClasses.text.primary}`}
//           >
//             <option value="slow">Slow (50/min)</option>
//             <option value="normal">Normal (100/min)</option>
//             <option value="fast">Fast (200/min)</option>
//           </select>
//         </div>

//         <button
//           onClick={handleProcessBatch}
//           disabled={processingBatch || stats.pending === 0}
//           className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm ${
//             processingBatch || stats.pending === 0
//               ? 'opacity-50 cursor-not-allowed'
//               : themeClasses.button.primary
//           }`}
//         >
//           {processingBatch ? (
//             <Loader className="w-4 h-4 animate-spin" />
//           ) : (
//             <Zap className="w-4 h-4" />
//           )}
//           Process ({stats.pending})
//         </button>

//         <button
//           onClick={() => setShowClearModal(true)}
//           disabled={stats.failed === 0}
//           className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm ${
//             stats.failed === 0
//               ? 'opacity-50 cursor-not-allowed'
//               : themeClasses.button.danger
//           }`}
//         >
//           <Trash2 className="w-4 h-4" />
//           Clear Failed ({stats.failed})
//         </button>

//         <button
//           onClick={onRetryAll}
//           disabled={stats.failed === 0}
//           className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm ${
//             stats.failed === 0
//               ? 'opacity-50 cursor-not-allowed'
//               : themeClasses.button.success
//           }`}
//         >
//           <RefreshCw className="w-4 h-4" />
//           Retry All Failed
//         </button>
//       </div>

//       {/* Bulk Actions */}
//       {selectedItems.size > 0 && (
//         <div className={`p-4 rounded-lg border ${themeClasses.bg.info} ${themeClasses.border.info}`}>
//           <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
//             <span className={themeClasses.text.primary}>
//               {selectedItems.size} items selected
//             </span>
//             <div className="flex flex-wrap gap-2">
//               <button
//                 onClick={() => {
//                   // Handle retry selected
//                   setSelectedItems(new Set());
//                 }}
//                 className={`px-3 py-1.5 text-sm rounded flex items-center gap-1 ${themeClasses.button.primary}`}
//               >
//                 <RefreshCw className="w-3 h-3" />
//                 Retry Selected
//               </button>
//               <button
//                 onClick={() => {
//                   // Handle delete selected
//                   setSelectedItems(new Set());
//                 }}
//                 className={`px-3 py-1.5 text-sm rounded flex items-center gap-1 ${themeClasses.button.danger}`}
//               >
//                 <Trash2 className="w-3 h-3" />
//                 Delete Selected
//               </button>
//               <button
//                 onClick={() => setSelectedItems(new Set())}
//                 className={`px-3 py-1.5 text-sm rounded ${themeClasses.button.secondary}`}
//               >
//                 Clear Selection
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Queue Table/List */}
//       <div className={`rounded-lg border overflow-hidden ${themeClasses.border.light}`}>
//         <table className="w-full">
//           <thead className={themeClasses.bg.secondary}>
//             <tr>
//               <th className="p-3 text-left">
//                 <input
//                   type="checkbox"
//                   checked={selectedItems.size === sortedQueue.length && sortedQueue.length > 0}
//                   onChange={handleSelectAll}
//                   className="rounded border-gray-300"
//                 />
//               </th>
//               <th className="p-3 text-left text-xs font-medium">Status</th>
//               <th className="p-3 text-left text-xs font-medium">Message</th>
//               <th className="p-3 text-left text-xs font-medium">Priority</th>
//               <th className="p-3 text-left text-xs font-medium">Age</th>
//               <th className="p-3 text-right text-xs font-medium">Attempts</th>
//               <th className="p-3 text-center text-xs font-medium">Actions</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
//             {sortedQueue.slice(0, 100).map((item) => {
//               const statusBadge = getStatusBadge(item.status, theme);
//               const StatusIcon = statusBadge.icon;

//               return (
//                 <tr
//                   key={item.id}
//                   className={`hover:${themeClasses.bg.secondary} ${
//                     selectedItems.has(item.id) ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''
//                   }`}
//                 >
//                   <td className="p-3">
//                     <input
//                       type="checkbox"
//                       checked={selectedItems.has(item.id)}
//                       onChange={(e) => {
//                         const newSelected = new Set(selectedItems);
//                         if (e.target.checked) {
//                           newSelected.add(item.id);
//                         } else {
//                           newSelected.delete(item.id);
//                         }
//                         setSelectedItems(newSelected);
//                       }}
//                       className="rounded border-gray-300"
//                     />
//                   </td>
//                   <td className="p-3">
//                     <div className="flex items-center gap-1">
//                       <StatusIcon className={`w-3 h-3 ${statusBadge.color}`} />
//                       <span className={`text-xs ${statusBadge.color}`}>
//                         {statusBadge.label}
//                       </span>
//                     </div>
//                   </td>
//                   <td className="p-3">
//                     <div className="text-sm">{item.message_phone || 'Unknown'}</div>
//                     <div className={`text-xs ${themeClasses.text.secondary}`}>
//                       {formatMessagePreview(item.message_preview)}
//                     </div>
//                     {item.error_message && (
//                       <div className="text-xs text-red-500 mt-1">
//                         <AlertCircle className="w-3 h-3 inline mr-1" />
//                         {item.error_message}
//                       </div>
//                     )}
//                   </td>
//                   <td className="p-3">
//                     <span className={`px-2 py-1 text-xs rounded-full ${
//                       item.priority >= 50 ? 'bg-red-100 text-red-800' :
//                       item.priority >= 10 ? 'bg-yellow-100 text-yellow-800' :
//                       'bg-gray-100 text-gray-800'
//                     }`}>
//                       {item.priority || 0}
//                     </span>
//                   </td>
//                   <td className="p-3 text-sm">
//                     {formatTimeAgo(item.queued_at)}
//                   </td>
//                   <td className="p-3 text-right text-sm">
//                     {item.processing_attempts || 0}
//                   </td>
//                   <td className="p-3">
//                     <div className="flex items-center justify-center gap-1">
//                       <button
//                         onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
//                         className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
//                       >
//                         {expandedItem === item.id ? (
//                           <ChevronUp className="w-4 h-4" />
//                         ) : (
//                           <ChevronDown className="w-4 h-4" />
//                         )}
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               );
//             })}
//           </tbody>
//         </table>
//       </div>

//       {/* Expanded Item Details */}
//       {expandedItem && (
//         <div className={`p-4 rounded-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//           {(() => {
//             const item = sortedQueue.find(q => q.id === expandedItem);
//             if (!item) return null;

//             return (
//               <div className="space-y-4">
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <h4 className={`font-medium mb-2 text-sm ${themeClasses.text.primary}`}>Message Details</h4>
//                     <div className="space-y-1 text-sm">
//                       <div className="flex justify-between">
//                         <span className={themeClasses.text.secondary}>Message ID:</span>
//                         <span className={`font-mono ${themeClasses.text.primary}`}>{item.message_id}</span>
//                       </div>
//                       <div className="flex justify-between">
//                         <span className={themeClasses.text.secondary}>Phone:</span>
//                         <span className={themeClasses.text.primary}>{item.message_phone}</span>
//                       </div>
//                       {item.error_message && (
//                         <div className="mt-2">
//                           <span className={themeClasses.text.secondary}>Error:</span>
//                           <p className="text-red-500 mt-1">{item.error_message}</p>
//                         </div>
//                       )}
//                     </div>
//                   </div>

//                   <div>
//                     <h4 className={`font-medium mb-2 text-sm ${themeClasses.text.primary}`}>Processing Info</h4>
//                     <div className="space-y-1 text-sm">
//                       <div className="flex justify-between">
//                         <span className={themeClasses.text.secondary}>Queued:</span>
//                         <span className={themeClasses.text.primary}>
//                           {new Date(item.queued_at).toLocaleString()}
//                         </span>
//                       </div>
//                       {item.processing_started && (
//                         <div className="flex justify-between">
//                           <span className={themeClasses.text.secondary}>Started:</span>
//                           <span className={themeClasses.text.primary}>
//                             {new Date(item.processing_started).toLocaleString()}
//                           </span>
//                         </div>
//                       )}
//                       {item.processing_ended && (
//                         <div className="flex justify-between">
//                           <span className={themeClasses.text.secondary}>Ended:</span>
//                           <span className={themeClasses.text.primary}>
//                             {new Date(item.processing_ended).toLocaleString()}
//                           </span>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             );
//           })()}
//         </div>
//       )}

//       {/* Clear Failed Confirmation Modal */}
//       <AnimatePresence>
//         {showClearModal && (
//           <ConfirmationModal
//             isOpen={showClearModal}
//             onClose={() => setShowClearModal(false)}
//             onConfirm={handleClearFailed}
//             title="Clear Failed Queue Items"
//             message={`Are you sure you want to clear ${stats.failed} failed queue items? This action cannot be undone.`}
//             type="danger"
//             theme={theme}
//           />
//         )}
//       </AnimatePresence>
//     </div>
//   );
// };

// export default QueueMonitor;








import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, Play, Pause, AlertCircle, CheckCircle, XCircle,
  Filter, Search, RefreshCw, Loader, Trash2, ChevronDown,
  ChevronUp, BarChart3, Zap, Activity,
  MessageSquare, Eye, EyeOff, Cpu, Database, Server, CheckSquare,
  PlayCircle, StopCircle, FastForward, Rewind, Hourglass
} from 'lucide-react';
import { EnhancedSelect, ConfirmationModal, EmptyState, getThemeClasses } from '../../../components/ServiceManagement/Shared/components';
import { formatTimeAgo, formatNumber, formatMessagePreview, getStatusBadge } from '../utils/formatters';

const QueueMonitor = ({
  queue = [],
  loading,
  theme,
  themeClasses,
  onRefresh,
  onProcessBatch,
  onClearFailed,
  onRetryAll,
  realTimeUpdates,
  viewMode = 'grid',
  searchTerm = '',
  statusFilter = 'all'
}) => {
  const [expandedItem, setExpandedItem] = useState(null);
  const [showClearModal, setShowClearModal] = useState(false);
  const [processingBatch, setProcessingBatch] = useState(false);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [batchSize, setBatchSize] = useState(100);
  const [processingSpeed, setProcessingSpeed] = useState('normal');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Queue statistics
  const stats = useMemo(() => {
    const queueArray = Array.isArray(queue) ? queue : [];
    const total = queueArray.length;
    const pending = queueArray.filter(q => q?.status === 'pending').length;
    const processing = queueArray.filter(q => q?.status === 'processing').length;
    const completed = queueArray.filter(q => q?.status === 'completed').length;
    const failed = queueArray.filter(q => q?.status === 'failed').length;

    // Calculate average processing time
    const completedItems = queueArray.filter(q => q?.status === 'completed');
    let avgProcessingTime = 0;
    if (completedItems.length > 0) {
      const totalTime = completedItems.reduce((sum, item) => {
        if (item?.processing_started && item?.processing_ended) {
          const start = new Date(item.processing_started);
          const end = new Date(item.processing_ended);
          return sum + (end - start);
        }
        return sum;
      }, 0);
      avgProcessingTime = totalTime / completedItems.length / 1000;
    }

    // Calculate throughput
    const lastHour = new Date(Date.now() - 60 * 60 * 1000);
    const recentProcessed = queueArray.filter(q =>
      q?.status === 'completed' &&
      q?.processing_ended &&
      new Date(q.processing_ended) > lastHour
    ).length;
    const throughput = recentProcessed / 60;

    return { total, pending, processing, completed, failed, avgProcessingTime, throughput };
  }, [queue]);

  // Filter queue
  const filteredQueue = useMemo(() => {
    const queueArray = Array.isArray(queue) ? queue : [];
    let filtered = queueArray;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item?.message_phone?.toLowerCase().includes(term) ||
        item?.message_preview?.toLowerCase().includes(term) ||
        item?.error_message?.toLowerCase().includes(term)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item?.status === statusFilter);
    }

    return filtered;
  }, [queue, searchTerm, statusFilter]);

  // Sort queue (pending first, then by priority)
  const sortedQueue = useMemo(() => {
    return [...filteredQueue].sort((a, b) => {
      const statusOrder = { pending: 0, processing: 1, failed: 2, completed: 3 };
      const statusDiff = (statusOrder[a?.status] || 999) - (statusOrder[b?.status] || 999);
      if (statusDiff !== 0) return statusDiff;

      const priorityDiff = (b?.priority || 0) - (a?.priority || 0);
      if (priorityDiff !== 0) return priorityDiff;

      return new Date(a?.queued_at || 0) - new Date(b?.queued_at || 0);
    });
  }, [filteredQueue]);

  const handleProcessBatch = async () => {
    setProcessingBatch(true);
    try {
      const speedConfig = { slow: 50, normal: 100, fast: 200 };
      await onProcessBatch({
        batch_size: speedConfig[processingSpeed] || 100
      });
      onRefresh();
    } catch (error) {
      console.error('Process batch failed:', error);
    } finally {
      setProcessingBatch(false);
    }
  };

  const handleClearFailed = async () => {
    try {
      await onClearFailed({ age_hours: 24 });
      onRefresh();
      setShowClearModal(false);
    } catch (error) {
      console.error('Clear failed failed:', error);
    }
  };

  const handleSelectAll = () => {
    if (selectedItems.size === sortedQueue.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(sortedQueue.map(item => item?.id).filter(Boolean)));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 animate-spin text-indigo-500" />
        <span className={`ml-3 ${themeClasses.text.secondary}`}>Loading queue...</span>
      </div>
    );
  }

  if (sortedQueue.length === 0) {
    return (
      <EmptyState
        icon={Clock}
        title="Queue is empty"
        description="No messages are currently in the queue"
        theme={theme}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Queue Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={`p-3 rounded-lg ${themeClasses.bg.secondary}`}>
          <p className={`text-xs ${themeClasses.text.secondary}`}>Total</p>
          <p className={`text-xl font-bold ${themeClasses.text.primary}`}>{stats.total}</p>
        </div>
        <div className={`p-3 rounded-lg ${themeClasses.bg.secondary}`}>
          <p className={`text-xs ${themeClasses.text.secondary}`}>Pending</p>
          <p className={`text-xl font-bold text-yellow-500`}>{stats.pending}</p>
        </div>
        <div className={`p-3 rounded-lg ${themeClasses.bg.secondary}`}>
          <p className={`text-xs ${themeClasses.text.secondary}`}>Processing</p>
          <p className={`text-xl font-bold text-blue-500`}>{stats.processing}</p>
        </div>
        <div className={`p-3 rounded-lg ${themeClasses.bg.secondary}`}>
          <p className={`text-xs ${themeClasses.text.secondary}`}>Failed</p>
          <p className={`text-xl font-bold text-red-500`}>{stats.failed}</p>
        </div>
      </div>

      {/* Second Row Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={`p-3 rounded-lg ${themeClasses.bg.secondary}`}>
          <p className={`text-xs ${themeClasses.text.secondary}`}>Completed</p>
          <p className={`text-xl font-bold text-green-500`}>{stats.completed}</p>
        </div>
        <div className={`p-3 rounded-lg ${themeClasses.bg.secondary}`}>
          <p className={`text-xs ${themeClasses.text.secondary}`}>Avg Time</p>
          <p className={`text-xl font-bold ${themeClasses.text.primary}`}>
            {stats.avgProcessingTime ? stats.avgProcessingTime.toFixed(1) : '0'}s
          </p>
        </div>
        <div className={`p-3 rounded-lg ${themeClasses.bg.secondary}`}>
          <p className={`text-xs ${themeClasses.text.secondary}`}>Throughput</p>
          <p className={`text-xl font-bold ${themeClasses.text.primary}`}>
            {stats.throughput ? stats.throughput.toFixed(1) : '0'}/min
          </p>
        </div>
        <div className={`p-3 rounded-lg ${themeClasses.bg.secondary}`}>
          <p className={`text-xs ${themeClasses.text.secondary}`}>Est. Clear</p>
          <p className={`text-xl font-bold ${themeClasses.text.primary}`}>
            {stats.throughput > 0 ? Math.ceil(stats.pending / stats.throughput) : 0} min
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800">
          <select
            value={processingSpeed}
            onChange={(e) => setProcessingSpeed(e.target.value)}
            className={`bg-transparent border-0 text-sm focus:ring-0 ${themeClasses.text.primary}`}
          >
            <option value="slow">Slow (50/min)</option>
            <option value="normal">Normal (100/min)</option>
            <option value="fast">Fast (200/min)</option>
          </select>
        </div>

        <button
          onClick={handleProcessBatch}
          disabled={processingBatch || stats.pending === 0}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm ${
            processingBatch || stats.pending === 0
              ? 'opacity-50 cursor-not-allowed'
              : themeClasses.button.primary
          }`}
        >
          {processingBatch ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            <Zap className="w-4 h-4" />
          )}
          Process ({stats.pending})
        </button>

        <button
          onClick={() => setShowClearModal(true)}
          disabled={stats.failed === 0}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm ${
            stats.failed === 0
              ? 'opacity-50 cursor-not-allowed'
              : themeClasses.button.danger
          }`}
        >
          <Trash2 className="w-4 h-4" />
          Clear Failed ({stats.failed})
        </button>

        <button
          onClick={onRetryAll}
          disabled={stats.failed === 0}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm ${
            stats.failed === 0
              ? 'opacity-50 cursor-not-allowed'
              : themeClasses.button.success
          }`}
        >
          <RefreshCw className="w-4 h-4" />
          Retry All Failed
        </button>
      </div>

      {/* Bulk Actions */}
      {selectedItems.size > 0 && (
        <div className={`p-4 rounded-lg border ${themeClasses.bg.info} ${themeClasses.border.info}`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <span className={themeClasses.text.primary}>
              {selectedItems.size} items selected
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  // Handle retry selected
                  setSelectedItems(new Set());
                }}
                className={`px-3 py-1.5 text-sm rounded flex items-center gap-1 ${themeClasses.button.primary}`}
              >
                <RefreshCw className="w-3 h-3" />
                Retry Selected
              </button>
              <button
                onClick={() => {
                  // Handle delete selected
                  setSelectedItems(new Set());
                }}
                className={`px-3 py-1.5 text-sm rounded flex items-center gap-1 ${themeClasses.button.danger}`}
              >
                <Trash2 className="w-3 h-3" />
                Delete Selected
              </button>
              <button
                onClick={() => setSelectedItems(new Set())}
                className={`px-3 py-1.5 text-sm rounded ${themeClasses.button.secondary}`}
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Queue Table/List */}
      <div className={`rounded-lg border overflow-hidden ${themeClasses.border.light}`}>
        <table className="w-full">
          <thead className={themeClasses.bg.secondary}>
            <tr>
              <th className="p-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedItems.size === sortedQueue.length && sortedQueue.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300"
                />
              </th>
              <th className="p-3 text-left text-xs font-medium">Status</th>
              <th className="p-3 text-left text-xs font-medium">Message</th>
              <th className="p-3 text-left text-xs font-medium">Priority</th>
              <th className="p-3 text-left text-xs font-medium">Age</th>
              <th className="p-3 text-right text-xs font-medium">Attempts</th>
              <th className="p-3 text-center text-xs font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {sortedQueue.slice(0, 100).map((item) => {
              const statusBadge = item?.status ? getStatusBadge(item.status, theme) : null;
              const StatusIcon = statusBadge?.icon || Clock;

              return (
                <tr
                  key={item?.id || Math.random()}
                  className={`hover:${themeClasses.bg.secondary} ${
                    selectedItems.has(item?.id) ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''
                  }`}
                >
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selectedItems.has(item?.id)}
                      onChange={(e) => {
                        if (!item?.id) return;
                        const newSelected = new Set(selectedItems);
                        if (e.target.checked) {
                          newSelected.add(item.id);
                        } else {
                          newSelected.delete(item.id);
                        }
                        setSelectedItems(newSelected);
                      }}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="p-3">
                    {item?.status ? (
                      <div className="flex items-center gap-1">
                        <StatusIcon className={`w-3 h-3 ${statusBadge?.color}`} />
                        <span className={`text-xs ${statusBadge?.color}`}>
                          {statusBadge?.label}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">Unknown</span>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="text-sm">{item?.message_phone || 'Unknown'}</div>
                    <div className={`text-xs ${themeClasses.text.secondary}`}>
                      {formatMessagePreview(item?.message_preview)}
                    </div>
                    {item?.error_message && (
                      <div className="text-xs text-red-500 mt-1">
                        <AlertCircle className="w-3 h-3 inline mr-1" />
                        {item.error_message}
                      </div>
                    )}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      (item?.priority || 0) >= 50 ? 'bg-red-100 text-red-800' :
                      (item?.priority || 0) >= 10 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {item?.priority || 0}
                    </span>
                  </td>
                  <td className="p-3 text-sm">
                    {item?.queued_at ? formatTimeAgo(item.queued_at) : 'Unknown'}
                  </td>
                  <td className="p-3 text-right text-sm">
                    {item?.processing_attempts || 0}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => setExpandedItem(expandedItem === item?.id ? null : item?.id)}
                        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        {expandedItem === item?.id ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Expanded Item Details */}
      {expandedItem && (
        <div className={`p-4 rounded-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
          {(() => {
            const item = sortedQueue.find(q => q?.id === expandedItem);
            if (!item) return null;

            return (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className={`font-medium mb-2 text-sm ${themeClasses.text.primary}`}>Message Details</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className={themeClasses.text.secondary}>Message ID:</span>
                        <span className={`font-mono ${themeClasses.text.primary}`}>{item.message_id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={themeClasses.text.secondary}>Phone:</span>
                        <span className={themeClasses.text.primary}>{item.message_phone}</span>
                      </div>
                      {item.error_message && (
                        <div className="mt-2">
                          <span className={themeClasses.text.secondary}>Error:</span>
                          <p className="text-red-500 mt-1">{item.error_message}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className={`font-medium mb-2 text-sm ${themeClasses.text.primary}`}>Processing Info</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className={themeClasses.text.secondary}>Queued:</span>
                        <span className={themeClasses.text.primary}>
                          {item.queued_at ? new Date(item.queued_at).toLocaleString() : 'Unknown'}
                        </span>
                      </div>
                      {item.processing_started && (
                        <div className="flex justify-between">
                          <span className={themeClasses.text.secondary}>Started:</span>
                          <span className={themeClasses.text.primary}>
                            {new Date(item.processing_started).toLocaleString()}
                          </span>
                        </div>
                      )}
                      {item.processing_ended && (
                        <div className="flex justify-between">
                          <span className={themeClasses.text.secondary}>Ended:</span>
                          <span className={themeClasses.text.primary}>
                            {new Date(item.processing_ended).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Clear Failed Confirmation Modal */}
      <AnimatePresence>
        {showClearModal && (
          <ConfirmationModal
            isOpen={showClearModal}
            onClose={() => setShowClearModal(false)}
            onConfirm={handleClearFailed}
            title="Clear Failed Queue Items"
            message={`Are you sure you want to clear ${stats.failed} failed queue items? This action cannot be undone.`}
            type="danger"
            theme={theme}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default QueueMonitor;