


// import React, { useState, useMemo } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import {
//   MessageSquare, Search, Filter, Download, RefreshCw,
//   ChevronDown, ChevronUp, User, Clock, CheckCircle,
//   XCircle, AlertCircle, Loader, Eye, Trash2,
//   Send, Calendar, Phone, DollarSign, Activity,
//   Archive, Flag, Grid, List, Copy, Edit,
//   ChevronLeft, ChevronRight
// } from 'lucide-react';
// import { EnhancedSelect, ConfirmationModal, EmptyState, getThemeClasses } from '../../../components/ServiceManagement/Shared/components';
// import {
//   formatPhoneNumber, formatDate, formatTimeAgo,
//   formatCurrency, getStatusBadge, getPriorityBadge,
//   formatMessagePreview, formatMessageParts
// } from '../utils/formatters';

// const MessageManager = ({
//   messages = [],
//   gateways = [],
//   templates = [],
//   pagination = {},
//   loading,
//   theme,
//   themeClasses,
//   onRefresh,
//   onLoadMore,
//   onSendMessage,
//   onRetry,
//   onCancel,
//   onDelete,
//   viewMode = 'grid',
//   searchTerm = '',
//   statusFilter = 'all',
//   dateRange = { start: null, end: null }
// }) => {
//   const [expandedMessage, setExpandedMessage] = useState(null);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [messageToDelete, setMessageToDelete] = useState(null);
//   const [selectedMessages, setSelectedMessages] = useState(new Set());
//   const [retrying, setRetrying] = useState(new Set());
//   const [currentPage, setCurrentPage] = useState(1);

//   // Filter messages
//   const filteredMessages = useMemo(() => {
//     let filtered = messages;

//     if (searchTerm) {
//       const term = searchTerm.toLowerCase();
//       filtered = filtered.filter(msg =>
//         msg.phone_number?.toLowerCase().includes(term) ||
//         msg.recipient_name?.toLowerCase().includes(term) ||
//         msg.message?.toLowerCase().includes(term)
//       );
//     }

//     if (statusFilter !== 'all') {
//       filtered = filtered.filter(msg => msg.status === statusFilter);
//     }

//     if (dateRange.start) {
//       const start = new Date(dateRange.start);
//       filtered = filtered.filter(msg => new Date(msg.created_at) >= start);
//     }
//     if (dateRange.end) {
//       const end = new Date(dateRange.end);
//       end.setHours(23, 59, 59);
//       filtered = filtered.filter(msg => new Date(msg.created_at) <= end);
//     }

//     return filtered;
//   }, [messages, searchTerm, statusFilter, dateRange]);

//   // Statistics
//   const stats = useMemo(() => {
//     const total = filteredMessages.length;
//     const delivered = filteredMessages.filter(m => m.status === 'delivered').length;
//     const failed = filteredMessages.filter(m => m.status === 'failed').length;
//     const pending = filteredMessages.filter(m => ['pending', 'queued', 'sending'].includes(m.status)).length;
//     const totalCost = filteredMessages.reduce((sum, m) => sum + (parseFloat(m.cost) || 0), 0);
    
//     return { total, delivered, failed, pending, totalCost };
//   }, [filteredMessages]);

//   // Pagination
//   const paginatedMessages = useMemo(() => {
//     const pageSize = pagination.pageSize || 50;
//     const start = (currentPage - 1) * pageSize;
//     return filteredMessages.slice(start, start + pageSize);
//   }, [filteredMessages, currentPage, pagination.pageSize]);

//   const totalPages = Math.ceil(filteredMessages.length / (pagination.pageSize || 50));

//   const handleRetry = async (messageId) => {
//     setRetrying(prev => new Set(prev).add(messageId));
//     try {
//       await onRetry(messageId);
//       onRefresh();
//     } catch (error) {
//       console.error('Retry failed:', error);
//     } finally {
//       setRetrying(prev => {
//         const newSet = new Set(prev);
//         newSet.delete(messageId);
//         return newSet;
//       });
//     }
//   };

//   const handleCancel = async (messageId) => {
//     try {
//       await onCancel(messageId);
//       onRefresh();
//     } catch (error) {
//       console.error('Cancel failed:', error);
//     }
//   };

//   const handleDelete = async () => {
//     if (!messageToDelete) return;
//     try {
//       await onDelete(messageToDelete);
//       onRefresh();
//       setShowDeleteModal(false);
//       setMessageToDelete(null);
//     } catch (error) {
//       console.error('Delete failed:', error);
//     }
//   };

//   const handleSelectAll = () => {
//     if (selectedMessages.size === paginatedMessages.length) {
//       setSelectedMessages(new Set());
//     } else {
//       setSelectedMessages(new Set(paginatedMessages.map(m => m.id)));
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center py-12">
//         <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
//         <span className={`ml-3 ${themeClasses.text.secondary}`}>Loading messages...</span>
//       </div>
//     );
//   }

//   if (filteredMessages.length === 0) {
//     return (
//       <EmptyState
//         icon={MessageSquare}
//         title="No messages found"
//         description={searchTerm || statusFilter !== 'all' || dateRange.start
//           ? "No messages match your filters"
//           : "Send your first SMS message to get started"
//         }
//         actionLabel="Send Message"
//         onAction={() => { }}
//         theme={theme}
//       />
//     );
//   }

//   return (
//     <div className="space-y-4">
//       {/* Statistics */}
//       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//         <div className={`p-3 rounded-lg ${themeClasses.bg.secondary}`}>
//           <p className={`text-xs ${themeClasses.text.secondary}`}>Total</p>
//           <p className={`text-xl font-bold ${themeClasses.text.primary}`}>{stats.total}</p>
//         </div>
//         <div className={`p-3 rounded-lg ${themeClasses.bg.secondary}`}>
//           <p className={`text-xs ${themeClasses.text.secondary}`}>Delivered</p>
//           <p className={`text-xl font-bold text-green-500`}>{stats.delivered}</p>
//         </div>
//         <div className={`p-3 rounded-lg ${themeClasses.bg.secondary}`}>
//           <p className={`text-xs ${themeClasses.text.secondary}`}>Failed</p>
//           <p className={`text-xl font-bold text-red-500`}>{stats.failed}</p>
//         </div>
//         <div className={`p-3 rounded-lg ${themeClasses.bg.secondary}`}>
//           <p className={`text-xs ${themeClasses.text.secondary}`}>Cost</p>
//           <p className={`text-xl font-bold ${themeClasses.text.primary}`}>{formatCurrency(stats.totalCost)}</p>
//         </div>
//       </div>

//       {/* Bulk Actions */}
//       {selectedMessages.size > 0 && (
//         <div className={`p-4 rounded-lg border ${themeClasses.bg.info} ${themeClasses.border.info}`}>
//           <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
//             <span className={themeClasses.text.primary}>
//               {selectedMessages.size} messages selected
//             </span>
//             <div className="flex flex-wrap gap-2">
//               <button
//                 onClick={() => Promise.all(Array.from(selectedMessages).map(id => handleRetry(id)))}
//                 className={`px-3 py-1.5 text-sm rounded flex items-center gap-1 ${themeClasses.button.primary}`}
//               >
//                 <RefreshCw className="w-3 h-3" />
//                 Retry Selected
//               </button>
//               <button
//                 onClick={() => {
//                   Array.from(selectedMessages).forEach(id => handleCancel(id));
//                   setSelectedMessages(new Set());
//                 }}
//                 className={`px-3 py-1.5 text-sm rounded flex items-center gap-1 ${themeClasses.button.warning}`}
//               >
//                 <XCircle className="w-3 h-3" />
//                 Cancel Selected
//               </button>
//               <button
//                 onClick={() => setSelectedMessages(new Set())}
//                 className={`px-3 py-1.5 text-sm rounded ${themeClasses.button.secondary}`}
//               >
//                 Clear Selection
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Messages Grid/List */}
//       {viewMode === 'grid' ? (
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           {paginatedMessages.map((message) => {
//             const statusBadge = getStatusBadge(message.status, theme);
//             const priorityBadge = getPriorityBadge(message.priority, theme);
//             const StatusIcon = statusBadge.icon;
//             const PriorityIcon = priorityBadge.icon;

//             return (
//               <motion.div
//                 key={message.id}
//                 layout
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 exit={{ opacity: 0 }}
//                 className={`p-4 rounded-lg border transition-all hover:shadow-lg ${
//                   themeClasses.bg.card
//                 } ${themeClasses.border.light} ${
//                   expandedMessage === message.id ? 'ring-2 ring-indigo-500' : ''
//                 } ${selectedMessages.has(message.id) ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}`}
//               >
//                 <div className="flex items-start justify-between mb-3">
//                   <div className="flex items-center gap-2">
//                     <input
//                       type="checkbox"
//                       checked={selectedMessages.has(message.id)}
//                       onChange={(e) => {
//                         const newSelected = new Set(selectedMessages);
//                         if (e.target.checked) {
//                           newSelected.add(message.id);
//                         } else {
//                           newSelected.delete(message.id);
//                         }
//                         setSelectedMessages(newSelected);
//                       }}
//                       className="rounded border-gray-300"
//                     />
//                     <div className={`p-2 rounded-lg ${themeClasses.bg.secondary}`}>
//                       <User className="w-4 h-4" />
//                     </div>
//                     <div>
//                       <h3 className={`font-medium ${themeClasses.text.primary}`}>
//                         {message.recipient_name || 'Unknown'}
//                       </h3>
//                       <p className={`text-xs ${themeClasses.text.secondary}`}>
//                         {formatPhoneNumber(message.phone_number)}
//                       </p>
//                     </div>
//                   </div>

//                   <div className="flex items-center gap-1">
//                     <button
//                       onClick={() => setExpandedMessage(expandedMessage === message.id ? null : message.id)}
//                       className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
//                     >
//                       {expandedMessage === message.id ? (
//                         <ChevronUp className="w-4 h-4" />
//                       ) : (
//                         <ChevronDown className="w-4 h-4" />
//                       )}
//                     </button>
//                   </div>
//                 </div>

//                 <div className={`mb-3 p-2 rounded text-sm ${themeClasses.bg.secondary}`}>
//                   <p className="line-clamp-2">{message.message}</p>
//                 </div>

//                 <div className="flex items-center justify-between text-xs mb-2">
//                   <div className="flex items-center gap-2">
//                     <StatusIcon className={`w-3 h-3 ${statusBadge.color}`} />
//                     <span className={statusBadge.color}>{statusBadge.label}</span>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <PriorityIcon className={`w-3 h-3 ${priorityBadge.color}`} />
//                     <span className={priorityBadge.color}>{priorityBadge.label}</span>
//                   </div>
//                 </div>

//                 <div className="flex items-center justify-between text-xs">
//                   <span className={themeClasses.text.secondary}>
//                     {formatTimeAgo(message.created_at)}
//                   </span>
//                   {message.cost && (
//                     <span className={`font-mono ${themeClasses.text.primary}`}>
//                       {formatCurrency(message.cost)}
//                     </span>
//                   )}
//                 </div>

//                 {expandedMessage === message.id && (
//                   <motion.div
//                     initial={{ opacity: 0, height: 0 }}
//                     animate={{ opacity: 1, height: 'auto' }}
//                     exit={{ opacity: 0, height: 0 }}
//                     className={`mt-4 pt-4 border-t ${themeClasses.border.light}`}
//                   >
//                     <div className="space-y-2 text-sm">
//                       {message.gateway_name && (
//                         <div className="flex justify-between">
//                           <span className={themeClasses.text.secondary}>Gateway:</span>
//                           <span className={themeClasses.text.primary}>{message.gateway_name}</span>
//                         </div>
//                       )}

//                       {message.template_name && (
//                         <div className="flex justify-between">
//                           <span className={themeClasses.text.secondary}>Template:</span>
//                           <span className={themeClasses.text.primary}>{message.template_name}</span>
//                         </div>
//                       )}

//                       <div className="flex justify-between">
//                         <span className={themeClasses.text.secondary}>Parts:</span>
//                         <span className={themeClasses.text.primary}>
//                           {formatMessageParts(message.message_parts, message.character_count)}
//                         </span>
//                       </div>

//                       {message.sent_at && (
//                         <div className="flex justify-between">
//                           <span className={themeClasses.text.secondary}>Sent:</span>
//                           <span className={themeClasses.text.primary}>{formatDate(message.sent_at)}</span>
//                         </div>
//                       )}

//                       {message.delivered_at && (
//                         <div className="flex justify-between">
//                           <span className={themeClasses.text.secondary}>Delivered:</span>
//                           <span className={themeClasses.text.primary}>{formatDate(message.delivered_at)}</span>
//                         </div>
//                       )}

//                       {message.reference_id && (
//                         <div className="flex justify-between">
//                           <span className={themeClasses.text.secondary}>Reference:</span>
//                           <span className={`font-mono text-xs ${themeClasses.text.primary}`}>
//                             {message.reference_id}
//                           </span>
//                         </div>
//                       )}

//                       <div className="flex gap-2 pt-2">
//                         {message.status === 'failed' && (
//                           <button
//                             onClick={() => handleRetry(message.id)}
//                             disabled={retrying.has(message.id)}
//                             className={`flex-1 px-2 py-1.5 text-xs rounded flex items-center justify-center gap-1 ${
//                               themeClasses.button.primary
//                             }`}
//                           >
//                             {retrying.has(message.id) ? (
//                               <Loader className="w-3 h-3 animate-spin" />
//                             ) : (
//                               <RefreshCw className="w-3 h-3" />
//                             )}
//                             Retry
//                           </button>
//                         )}

//                         {['pending', 'queued', 'scheduled'].includes(message.status) && (
//                           <button
//                             onClick={() => handleCancel(message.id)}
//                             className={`flex-1 px-2 py-1.5 text-xs rounded flex items-center justify-center gap-1 ${
//                               themeClasses.button.warning
//                             }`}
//                           >
//                             <XCircle className="w-3 h-3" />
//                             Cancel
//                           </button>
//                         )}

//                         <button
//                           onClick={() => {
//                             setMessageToDelete(message.id);
//                             setShowDeleteModal(true);
//                           }}
//                           className={`flex-1 px-2 py-1.5 text-xs rounded flex items-center justify-center gap-1 ${
//                             themeClasses.button.danger
//                           }`}
//                         >
//                           <Trash2 className="w-3 h-3" />
//                           Delete
//                         </button>
//                       </div>
//                     </div>
//                   </motion.div>
//                 )}
//               </motion.div>
//             );
//           })}
//         </div>
//       ) : (
//         <div className={`rounded-lg border overflow-hidden ${themeClasses.border.light}`}>
//           <table className="w-full">
//             <thead className={themeClasses.bg.secondary}>
//               <tr>
//                 <th className="p-3 text-left">
//                   <input
//                     type="checkbox"
//                     checked={selectedMessages.size === paginatedMessages.length && paginatedMessages.length > 0}
//                     onChange={handleSelectAll}
//                     className="rounded border-gray-300"
//                   />
//                 </th>
//                 <th className="p-3 text-left text-xs font-medium">Recipient</th>
//                 <th className="p-3 text-left text-xs font-medium">Message</th>
//                 <th className="p-3 text-left text-xs font-medium">Status</th>
//                 <th className="p-3 text-left text-xs font-medium">Priority</th>
//                 <th className="p-3 text-left text-xs font-medium">Created</th>
//                 <th className="p-3 text-right text-xs font-medium">Cost</th>
//                 <th className="p-3 text-center text-xs font-medium">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
//               {paginatedMessages.map((message) => {
//                 const statusBadge = getStatusBadge(message.status, theme);
//                 const priorityBadge = getPriorityBadge(message.priority, theme);
//                 const StatusIcon = statusBadge.icon;
//                 const PriorityIcon = priorityBadge.icon;

//                 return (
//                   <tr
//                     key={message.id}
//                     className={`hover:${themeClasses.bg.secondary} ${
//                       selectedMessages.has(message.id) ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''
//                     }`}
//                   >
//                     <td className="p-3">
//                       <input
//                         type="checkbox"
//                         checked={selectedMessages.has(message.id)}
//                         onChange={(e) => {
//                           const newSelected = new Set(selectedMessages);
//                           if (e.target.checked) {
//                             newSelected.add(message.id);
//                           } else {
//                             newSelected.delete(message.id);
//                           }
//                           setSelectedMessages(newSelected);
//                         }}
//                         className="rounded border-gray-300"
//                       />
//                     </td>
//                     <td className="p-3">
//                       <div className="flex items-center gap-2">
//                         <div className={`p-1.5 rounded-full ${themeClasses.bg.secondary}`}>
//                           <User className="w-3 h-3" />
//                         </div>
//                         <div>
//                           <div className={`text-sm font-medium ${themeClasses.text.primary}`}>
//                             {message.recipient_name || 'Unknown'}
//                           </div>
//                           <div className={`text-xs ${themeClasses.text.secondary}`}>
//                             {formatPhoneNumber(message.phone_number)}
//                           </div>
//                         </div>
//                       </div>
//                     </td>
//                     <td className="p-3 max-w-xs">
//                       <p className="text-sm truncate">{formatMessagePreview(message.message)}</p>
//                     </td>
//                     <td className="p-3">
//                       <div className="flex items-center gap-1">
//                         <StatusIcon className={`w-3 h-3 ${statusBadge.color}`} />
//                         <span className={`text-xs ${statusBadge.color}`}>
//                           {statusBadge.label}
//                         </span>
//                       </div>
//                     </td>
//                     <td className="p-3">
//                       <div className="flex items-center gap-1">
//                         <PriorityIcon className={`w-3 h-3 ${priorityBadge.color}`} />
//                         <span className={`text-xs ${priorityBadge.color}`}>
//                           {priorityBadge.label}
//                         </span>
//                       </div>
//                     </td>
//                     <td className="p-3 whitespace-nowrap">
//                       <div className="text-sm">{formatDate(message.created_at, { dateStyle: 'short' })}</div>
//                       <div className={`text-xs ${themeClasses.text.secondary}`}>
//                         {formatTimeAgo(message.created_at)}
//                       </div>
//                     </td>
//                     <td className="p-3 text-right text-sm font-mono">
//                       {message.cost ? formatCurrency(message.cost) : '-'}
//                     </td>
//                     <td className="p-3">
//                       <div className="flex items-center justify-center gap-1">
//                         {message.status === 'failed' && (
//                           <button
//                             onClick={() => handleRetry(message.id)}
//                             className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
//                           >
//                             <RefreshCw className="w-3 h-3" />
//                           </button>
//                         )}
//                         {['pending', 'queued', 'scheduled'].includes(message.status) && (
//                           <button
//                             onClick={() => handleCancel(message.id)}
//                             className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
//                           >
//                             <XCircle className="w-3 h-3" />
//                           </button>
//                         )}
//                         <button
//                           onClick={() => {
//                             setMessageToDelete(message.id);
//                             setShowDeleteModal(true);
//                           }}
//                           className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500"
//                         >
//                           <Trash2 className="w-3 h-3" />
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>
//       )}

//       {/* Pagination */}
//       {totalPages > 1 && (
//         <div className="flex items-center justify-between">
//           <p className={`text-sm ${themeClasses.text.secondary}`}>
//             Page {currentPage} of {totalPages}
//           </p>
//           <div className="flex gap-2">
//             <button
//               onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
//               disabled={currentPage === 1}
//               className={`px-3 py-1 rounded ${
//                 currentPage === 1 ? 'opacity-50 cursor-not-allowed' : themeClasses.button.secondary
//               }`}
//             >
//               <ChevronLeft className="w-4 h-4" />
//             </button>
//             <button
//               onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
//               disabled={currentPage === totalPages}
//               className={`px-3 py-1 rounded ${
//                 currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : themeClasses.button.secondary
//               }`}
//             >
//               <ChevronRight className="w-4 h-4" />
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Load More */}
//       {pagination.next && (
//         <button
//           onClick={onLoadMore}
//           className={`w-full py-2 rounded-lg border ${themeClasses.button.secondary}`}
//         >
//           Load More
//         </button>
//       )}

//       {/* Delete Confirmation Modal */}
//       <AnimatePresence>
//         {showDeleteModal && (
//           <ConfirmationModal
//             isOpen={showDeleteModal}
//             onClose={() => {
//               setShowDeleteModal(false);
//               setMessageToDelete(null);
//             }}
//             onConfirm={handleDelete}
//             title="Delete Message"
//             message="Are you sure you want to delete this message? This action cannot be undone."
//             type="danger"
//             theme={theme}
//           />
//         )}
//       </AnimatePresence>
//     </div>
//   );
// };

// export default MessageManager;










import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, Search, Filter, Download, RefreshCw,
  ChevronDown, ChevronUp, User, Clock, CheckCircle,
  XCircle, AlertCircle, Loader, Eye, Trash2,
  Send, Calendar, Phone, DollarSign, Activity,
  Archive, Flag, Grid, List, Copy, Edit,
  ChevronLeft, ChevronRight, FileText
} from 'lucide-react';
import { EnhancedSelect, ConfirmationModal, EmptyState, getThemeClasses } from '../../../components/ServiceManagement/Shared/components';
import {
  formatPhoneNumber, formatDate, formatTimeAgo,
  formatCurrency, getStatusBadge, getPriorityBadge,
  formatMessagePreview, formatMessageParts
} from '../utils/formatters';

const MessageManager = ({
  messages = [],
  gateways = [],
  templates = [],
  pagination = {},
  loading,
  theme,
  themeClasses,
  onRefresh,
  onLoadMore,
  onSendMessage,
  onRetry,
  onCancel,
  onDelete,
  viewMode = 'grid',
  searchTerm = '',
  statusFilter = 'all',
  dateRange = { start: null, end: null }
}) => {
  const [expandedMessage, setExpandedMessage] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [selectedMessages, setSelectedMessages] = useState(new Set());
  const [retrying, setRetrying] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);

  // Filter messages
  const filteredMessages = useMemo(() => {
    const messagesArray = Array.isArray(messages) ? messages : [];
    let filtered = messagesArray;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(msg =>
        msg?.phone_number?.toLowerCase().includes(term) ||
        msg?.recipient_name?.toLowerCase().includes(term) ||
        msg?.message?.toLowerCase().includes(term)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(msg => msg?.status === statusFilter);
    }

    if (dateRange.start) {
      const start = new Date(dateRange.start);
      filtered = filtered.filter(msg => msg?.created_at && new Date(msg.created_at) >= start);
    }
    if (dateRange.end) {
      const end = new Date(dateRange.end);
      end.setHours(23, 59, 59);
      filtered = filtered.filter(msg => msg?.created_at && new Date(msg.created_at) <= end);
    }

    return filtered;
  }, [messages, searchTerm, statusFilter, dateRange]);

  // Statistics
  const stats = useMemo(() => {
    const messagesArray = Array.isArray(filteredMessages) ? filteredMessages : [];
    const total = messagesArray.length;
    const delivered = messagesArray.filter(m => m?.status === 'delivered').length;
    const failed = messagesArray.filter(m => m?.status === 'failed').length;
    const pending = messagesArray.filter(m => ['pending', 'queued', 'sending'].includes(m?.status)).length;
    const totalCost = messagesArray.reduce((sum, m) => sum + (parseFloat(m?.cost) || 0), 0);
    
    return { total, delivered, failed, pending, totalCost };
  }, [filteredMessages]);

  // Pagination
  const paginatedMessages = useMemo(() => {
    const messagesArray = Array.isArray(filteredMessages) ? filteredMessages : [];
    const pageSize = pagination?.pageSize || 50;
    const start = (currentPage - 1) * pageSize;
    return messagesArray.slice(start, start + pageSize);
  }, [filteredMessages, currentPage, pagination?.pageSize]);

  const totalPages = Math.ceil((filteredMessages?.length || 0) / (pagination?.pageSize || 50));

  const handleRetry = async (messageId) => {
    if (!messageId) return;
    setRetrying(prev => new Set(prev).add(messageId));
    try {
      await onRetry(messageId);
      onRefresh();
    } catch (error) {
      console.error('Retry failed:', error);
    } finally {
      setRetrying(prev => {
        const newSet = new Set(prev);
        newSet.delete(messageId);
        return newSet;
      });
    }
  };

  const handleCancel = async (messageId) => {
    if (!messageId) return;
    try {
      await onCancel(messageId);
      onRefresh();
    } catch (error) {
      console.error('Cancel failed:', error);
    }
  };

  const handleDelete = async () => {
    if (!messageToDelete) return;
    try {
      await onDelete(messageToDelete);
      onRefresh();
      setShowDeleteModal(false);
      setMessageToDelete(null);
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleSelectAll = () => {
    if (selectedMessages.size === paginatedMessages.length) {
      setSelectedMessages(new Set());
    } else {
      setSelectedMessages(new Set(paginatedMessages.map(m => m?.id).filter(Boolean)));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 animate-spin text-indigo-500" />
        <span className={`ml-3 ${themeClasses.text.secondary}`}>Loading messages...</span>
      </div>
    );
  }

  if (!filteredMessages || filteredMessages.length === 0) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="No messages found"
        description={searchTerm || statusFilter !== 'all' || dateRange.start
          ? "No messages match your filters"
          : "Send your first SMS message to get started"
        }
        actionLabel="Send Message"
        onAction={() => { }}
        theme={theme}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={`p-3 rounded-lg ${themeClasses.bg.secondary}`}>
          <p className={`text-xs ${themeClasses.text.secondary}`}>Total</p>
          <p className={`text-xl font-bold ${themeClasses.text.primary}`}>{stats.total}</p>
        </div>
        <div className={`p-3 rounded-lg ${themeClasses.bg.secondary}`}>
          <p className={`text-xs ${themeClasses.text.secondary}`}>Delivered</p>
          <p className={`text-xl font-bold text-green-500`}>{stats.delivered}</p>
        </div>
        <div className={`p-3 rounded-lg ${themeClasses.bg.secondary}`}>
          <p className={`text-xs ${themeClasses.text.secondary}`}>Failed</p>
          <p className={`text-xl font-bold text-red-500`}>{stats.failed}</p>
        </div>
        <div className={`p-3 rounded-lg ${themeClasses.bg.secondary}`}>
          <p className={`text-xs ${themeClasses.text.secondary}`}>Cost</p>
          <p className={`text-xl font-bold ${themeClasses.text.primary}`}>{formatCurrency(stats.totalCost)}</p>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedMessages.size > 0 && (
        <div className={`p-4 rounded-lg border ${themeClasses.bg.info} ${themeClasses.border.info}`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <span className={themeClasses.text.primary}>
              {selectedMessages.size} messages selected
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => Promise.all(Array.from(selectedMessages).map(id => handleRetry(id)))}
                className={`px-3 py-1.5 text-sm rounded flex items-center gap-1 ${themeClasses.button.primary}`}
              >
                <RefreshCw className="w-3 h-3" />
                Retry Selected
              </button>
              <button
                onClick={() => {
                  Array.from(selectedMessages).forEach(id => handleCancel(id));
                  setSelectedMessages(new Set());
                }}
                className={`px-3 py-1.5 text-sm rounded flex items-center gap-1 ${themeClasses.button.warning}`}
              >
                <XCircle className="w-3 h-3" />
                Cancel Selected
              </button>
              <button
                onClick={() => setSelectedMessages(new Set())}
                className={`px-3 py-1.5 text-sm rounded ${themeClasses.button.secondary}`}
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paginatedMessages.map((message) => {
            if (!message) return null;
            
            const statusBadge = getStatusBadge(message.status, theme);
            const priorityBadge = getPriorityBadge(message.priority, theme);
            const StatusIcon = statusBadge.icon;
            const PriorityIcon = priorityBadge.icon;

            return (
              <motion.div
                key={message.id || Math.random()}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`p-4 rounded-lg border transition-all hover:shadow-lg ${
                  themeClasses.bg.card
                } ${themeClasses.border.light} ${
                  expandedMessage === message.id ? 'ring-2 ring-indigo-500' : ''
                } ${selectedMessages.has(message.id) ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedMessages.has(message.id)}
                      onChange={(e) => {
                        if (!message.id) return;
                        const newSelected = new Set(selectedMessages);
                        if (e.target.checked) {
                          newSelected.add(message.id);
                        } else {
                          newSelected.delete(message.id);
                        }
                        setSelectedMessages(newSelected);
                      }}
                      className="rounded border-gray-300"
                    />
                    <div className={`p-2 rounded-lg ${themeClasses.bg.secondary}`}>
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className={`font-medium ${themeClasses.text.primary}`}>
                        {message.recipient_name || 'Unknown'}
                      </h3>
                      <p className={`text-xs ${themeClasses.text.secondary}`}>
                        {formatPhoneNumber(message.phone_number)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setExpandedMessage(expandedMessage === message.id ? null : message.id)}
                      className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      {expandedMessage === message.id ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className={`mb-3 p-2 rounded text-sm ${themeClasses.bg.secondary}`}>
                  <p className="line-clamp-2">{message.message || ''}</p>
                </div>

                <div className="flex items-center justify-between text-xs mb-2">
                  <div className="flex items-center gap-2">
                    <StatusIcon className={`w-3 h-3 ${statusBadge.color}`} />
                    <span className={statusBadge.color}>{statusBadge.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <PriorityIcon className={`w-3 h-3 ${priorityBadge.color}`} />
                    <span className={priorityBadge.color}>{priorityBadge.label}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className={themeClasses.text.secondary}>
                    {message.created_at ? formatTimeAgo(message.created_at) : 'Unknown'}
                  </span>
                  {message.cost && (
                    <span className={`font-mono ${themeClasses.text.primary}`}>
                      {formatCurrency(message.cost)}
                    </span>
                  )}
                </div>

                {expandedMessage === message.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`mt-4 pt-4 border-t ${themeClasses.border.light}`}
                  >
                    <div className="space-y-2 text-sm">
                      {message.gateway_name && (
                        <div className="flex justify-between">
                          <span className={themeClasses.text.secondary}>Gateway:</span>
                          <span className={themeClasses.text.primary}>{message.gateway_name}</span>
                        </div>
                      )}

                      {message.template_name && (
                        <div className="flex justify-between">
                          <span className={themeClasses.text.secondary}>Template:</span>
                          <span className={themeClasses.text.primary}>{message.template_name}</span>
                        </div>
                      )}

                      <div className="flex justify-between">
                        <span className={themeClasses.text.secondary}>Parts:</span>
                        <span className={themeClasses.text.primary}>
                          {formatMessageParts(message.message_parts, message.character_count)}
                        </span>
                      </div>

                      {message.sent_at && (
                        <div className="flex justify-between">
                          <span className={themeClasses.text.secondary}>Sent:</span>
                          <span className={themeClasses.text.primary}>{formatDate(message.sent_at)}</span>
                        </div>
                      )}

                      {message.delivered_at && (
                        <div className="flex justify-between">
                          <span className={themeClasses.text.secondary}>Delivered:</span>
                          <span className={themeClasses.text.primary}>{formatDate(message.delivered_at)}</span>
                        </div>
                      )}

                      {message.reference_id && (
                        <div className="flex justify-between">
                          <span className={themeClasses.text.secondary}>Reference:</span>
                          <span className={`font-mono text-xs ${themeClasses.text.primary}`}>
                            {message.reference_id}
                          </span>
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        {message.status === 'failed' && (
                          <button
                            onClick={() => handleRetry(message.id)}
                            disabled={retrying.has(message.id)}
                            className={`flex-1 px-2 py-1.5 text-xs rounded flex items-center justify-center gap-1 ${
                              themeClasses.button.primary
                            }`}
                          >
                            {retrying.has(message.id) ? (
                              <Loader className="w-3 h-3 animate-spin" />
                            ) : (
                              <RefreshCw className="w-3 h-3" />
                            )}
                            Retry
                          </button>
                        )}

                        {['pending', 'queued', 'scheduled'].includes(message.status) && (
                          <button
                            onClick={() => handleCancel(message.id)}
                            className={`flex-1 px-2 py-1.5 text-xs rounded flex items-center justify-center gap-1 ${
                              themeClasses.button.warning
                            }`}
                          >
                            <XCircle className="w-3 h-3" />
                            Cancel
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setMessageToDelete(message.id);
                            setShowDeleteModal(true);
                          }}
                          className={`flex-1 px-2 py-1.5 text-xs rounded flex items-center justify-center gap-1 ${
                            themeClasses.button.danger
                          }`}
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className={`rounded-lg border overflow-hidden ${themeClasses.border.light}`}>
          <table className="w-full">
            <thead className={themeClasses.bg.secondary}>
              <tr>
                <th className="p-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedMessages.size === paginatedMessages.length && paginatedMessages.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="p-3 text-left text-xs font-medium">Recipient</th>
                <th className="p-3 text-left text-xs font-medium">Message</th>
                <th className="p-3 text-left text-xs font-medium">Status</th>
                <th className="p-3 text-left text-xs font-medium">Priority</th>
                <th className="p-3 text-left text-xs font-medium">Created</th>
                <th className="p-3 text-right text-xs font-medium">Cost</th>
                <th className="p-3 text-center text-xs font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedMessages.map((message) => {
                if (!message) return null;
                
                const statusBadge = getStatusBadge(message.status, theme);
                const priorityBadge = getPriorityBadge(message.priority, theme);
                const StatusIcon = statusBadge.icon;
                const PriorityIcon = priorityBadge.icon;

                return (
                  <tr
                    key={message.id || Math.random()}
                    className={`hover:${themeClasses.bg.secondary} ${
                      selectedMessages.has(message.id) ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''
                    }`}
                  >
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={selectedMessages.has(message.id)}
                        onChange={(e) => {
                          if (!message.id) return;
                          const newSelected = new Set(selectedMessages);
                          if (e.target.checked) {
                            newSelected.add(message.id);
                          } else {
                            newSelected.delete(message.id);
                          }
                          setSelectedMessages(newSelected);
                        }}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-full ${themeClasses.bg.secondary}`}>
                          <User className="w-3 h-3" />
                        </div>
                        <div>
                          <div className={`text-sm font-medium ${themeClasses.text.primary}`}>
                            {message.recipient_name || 'Unknown'}
                          </div>
                          <div className={`text-xs ${themeClasses.text.secondary}`}>
                            {formatPhoneNumber(message.phone_number)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 max-w-xs">
                      <p className="text-sm truncate">{formatMessagePreview(message.message)}</p>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <StatusIcon className={`w-3 h-3 ${statusBadge.color}`} />
                        <span className={`text-xs ${statusBadge.color}`}>
                          {statusBadge.label}
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <PriorityIcon className={`w-3 h-3 ${priorityBadge.color}`} />
                        <span className={`text-xs ${priorityBadge.color}`}>
                          {priorityBadge.label}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <div className="text-sm">{message.created_at ? formatDate(message.created_at, { dateStyle: 'short' }) : 'Unknown'}</div>
                      <div className={`text-xs ${themeClasses.text.secondary}`}>
                        {message.created_at ? formatTimeAgo(message.created_at) : ''}
                      </div>
                    </td>
                    <td className="p-3 text-right text-sm font-mono">
                      {message.cost ? formatCurrency(message.cost) : '-'}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-1">
                        {message.status === 'failed' && (
                          <button
                            onClick={() => handleRetry(message.id)}
                            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <RefreshCw className="w-3 h-3" />
                          </button>
                        )}
                        {['pending', 'queued', 'scheduled'].includes(message.status) && (
                          <button
                            onClick={() => handleCancel(message.id)}
                            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <XCircle className="w-3 h-3" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setMessageToDelete(message.id);
                            setShowDeleteModal(true);
                          }}
                          className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className={`text-sm ${themeClasses.text.secondary}`}>
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded ${
                currentPage === 1 ? 'opacity-50 cursor-not-allowed' : themeClasses.button.secondary
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded ${
                currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : themeClasses.button.secondary
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Load More */}
      {pagination?.next && (
        <button
          onClick={onLoadMore}
          className={`w-full py-2 rounded-lg border ${themeClasses.button.secondary}`}
        >
          Load More
        </button>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <ConfirmationModal
            isOpen={showDeleteModal}
            onClose={() => {
              setShowDeleteModal(false);
              setMessageToDelete(null);
            }}
            onConfirm={handleDelete}
            title="Delete Message"
            message="Are you sure you want to delete this message? This action cannot be undone."
            type="danger"
            theme={theme}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default MessageManager;