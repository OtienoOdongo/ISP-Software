



// // src/components/Payments/TransactionLog.js
// import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
// import { Toaster } from 'react-hot-toast';
// import { 
//   FaSearch, FaDownload, FaSortAmountDown, FaSortAmountUp, 
//   FaCalendarAlt, FaFilter, FaChartBar, FaHistory 
// } from 'react-icons/fa';
// import { GrTransaction } from 'react-icons/gr';
// import { AiOutlineReload } from 'react-icons/ai';
// import { FiEye, FiChevronDown, FiChevronUp, FiTrendingUp } from 'react-icons/fi';
// import jsPDF from 'jspdf';
// import 'jspdf-autotable';
// import { CSVLink } from 'react-csv';
// import ReactDOM from 'react-dom';
// import { motion, AnimatePresence } from 'framer-motion';
// import DatePicker from 'react-datepicker';
// import 'react-datepicker/dist/react-datepicker.css';
// import api from '../../api';
// import { useTheme } from '../../context/ThemeContext';
// import { EnhancedSelect, ConfirmationModal } from '../../components/ServiceManagement/Shared/components'
// import TransactionAnalytics from '../../components/PaymentConfiguration/TransactionLog/TransactionAnalytics'

// // Enhanced DatePicker Component using Portal (same logic as EnhancedSelect)
// const EnhancedDatePicker = ({
//   selected,
//   onChange,
//   selectsStart,
//   selectsEnd,
//   startDate,
//   endDate,
//   minDate,
//   placeholderText = "Select date",
//   className = "",
//   theme = "light",
// }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
//   const buttonRef = useRef(null);
//   const calendarRef = useRef(null);

//   // Update calendar position when opened
//   useEffect(() => {
//     if (isOpen && buttonRef.current) {
//       const rect = buttonRef.current.getBoundingClientRect();
//       setPosition({
//         top: rect.bottom + window.scrollY + 4,
//         left: rect.left + window.scrollX,
//         width: rect.width,
//       });
//     }
//   }, [isOpen]);

//   // Close calendar when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (e) => {
//       if (
//         calendarRef.current &&
//         !calendarRef.current.contains(e.target) &&
//         !buttonRef.current.contains(e.target)
//       ) {
//         setIsOpen(false);
//       }
//     };
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   const themeClasses = {
//     input: theme === "dark"
//       ? "bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
//       : "bg-white border-gray-300 text-gray-800 placeholder-gray-500",
//     calendar: theme === "dark" 
//       ? "bg-gray-800 border-gray-700 text-white" 
//       : "bg-white border-gray-200 text-gray-800"
//   };

//   return (
//     <div className={`relative ${className}`}>
//       {/* Trigger Button */}
//       <button
//         ref={buttonRef}
//         type="button"
//         onClick={() => setIsOpen(!isOpen)}
//         className={`
//           flex items-center justify-between w-full px-3 py-2 rounded-lg border text-sm
//           transition-all duration-200 ease-in-out cursor-pointer
//           ${themeClasses.input}
//           focus:outline-none focus:ring-2 focus:ring-indigo-500
//         `}
//       >
//         <span className="truncate text-left text-sm">
//           {selected ? selected.toLocaleDateString() : placeholderText}
//         </span>
//         <FaCalendarAlt className={`w-4 h-4 ml-2 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`} />
//       </button>

//       {/* Calendar rendered via Portal for proper stacking */}
//       {typeof window !== 'undefined' && ReactDOM.createPortal(
//         <AnimatePresence>
//           {isOpen && (
//             <>
//               {/* Backdrop */}
//               <motion.div
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 exit={{ opacity: 0 }}
//                 className="fixed inset-0 bg-black/10 z-[9998]"
//                 onClick={() => setIsOpen(false)}
//               />

//               {/* Calendar */}
//               <motion.div
//                 ref={calendarRef}
//                 initial={{ opacity: 0, scale: 0.95, y: -10 }}
//                 animate={{ opacity: 1, scale: 1, y: 0 }}
//                 exit={{ opacity: 0, scale: 0.95, y: -10 }}
//                 transition={{ duration: 0.2 }}
//                 className={`fixed z-[9999] shadow-xl border rounded-lg overflow-hidden ${themeClasses.calendar}`}
//                 style={{
//                   top: position.top,
//                   left: position.left,
//                 }}
//               >
//                 <DatePicker
//                   selected={selected}
//                   onChange={(date) => {
//                     onChange(date);
//                     setIsOpen(false);
//                   }}
//                   selectsStart={selectsStart}
//                   selectsEnd={selectsEnd}
//                   startDate={startDate}
//                   endDate={endDate}
//                   minDate={minDate}
//                   inline
//                   className="border-0"
//                   calendarClassName={`border-0 ${themeClasses.calendar}`}
//                   dayClassName={(date) => 
//                     theme === 'dark' 
//                       ? 'text-white hover:bg-indigo-600' 
//                       : 'text-gray-800 hover:bg-indigo-100'
//                   }
//                 />
//               </motion.div>
//             </>
//           )}
//         </AnimatePresence>,
//         document.body
//       )}
//     </div>
//   );
// };

// const TransactionLog = () => {
//   const { theme } = useTheme();
//   const [transactions, setTransactions] = useState([]);
//   const [exportData, setExportData] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filterStatus, setFilterStatus] = useState('all');
//   const [filterPaymentMethod, setFilterPaymentMethod] = useState('all');
//   const [sortDirection, setSortDirection] = useState('date_desc');
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [refreshCount, setRefreshCount] = useState(0);
//   const [selectedTransaction, setSelectedTransaction] = useState(null);
//   const [showDetailModal, setShowDetailModal] = useState(false);
//   const [transactionHistory, setTransactionHistory] = useState([]);
//   const [advancedStats, setAdvancedStats] = useState(null);
//   const [showAdvancedStats, setShowAdvancedStats] = useState(false);

//   const [startDate, setStartDate] = useState(() => new Date(new Date().setDate(new Date().getDate() - 7)));
//   const [endDate, setEndDate] = useState(new Date());

//   const [pagination, setPagination] = useState({
//     current_page: 1,
//     total_pages: 1,
//     total_items: 0,
//     page_size: 20,
//     has_next: false,
//     has_previous: false
//   });

//   const [stats, setStats] = useState({
//     total: 0,
//     success: 0,
//     pending: 0,
//     failed: 0,
//     refunded: 0,
//     totalAmount: 0
//   });

//   // Data structures for efficient filtering
//   const statusOptions = useMemo(() => [
//     { value: 'all', label: 'All Status' },
//     { value: 'success', label: 'Success' },
//     { value: 'pending', label: 'Pending' },
//     { value: 'failed', label: 'Failed' },
//     { value: 'refunded', label: 'Refunded' }
//   ], []);

//   const paymentMethodOptions = useMemo(() => [
//     { value: 'all', label: 'All Methods' },
//     { value: 'mpesa', label: 'M-Pesa' },
//     { value: 'paypal', label: 'PayPal' },
//     { value: 'bank_transfer', label: 'Bank Transfer' }
//   ], []);

//   const sortOptions = useMemo(() => [
//     { value: 'date_desc', label: 'Date (Newest First)' },
//     { value: 'date_asc', label: 'Date (Oldest First)' },
//     { value: 'amount_desc', label: 'Amount (High to Low)' },
//     { value: 'amount_asc', label: 'Amount (Low to High)' }
//   ], []);

//   // Toast notification system
//   const showToast = useCallback((message, type = 'success') => {
//     const toastOptions = {
//       duration: type === 'error' ? 5000 : 3000,
//       position: 'top-center',
//     };

//     if (typeof toast !== 'undefined') {
//       if (type === 'success') {
//         toast.success(message, toastOptions);
//       } else if (type === 'error') {
//         toast.error(message, toastOptions);
//       } else if (type === 'loading') {
//         toast.loading(message, toastOptions);
//       } else {
//         toast(message, toastOptions);
//       }
//     }
//   }, []);

//   /** 🔹 Algorithm: Debounced search */
//   const useDebounce = (value, delay) => {
//     const [debouncedValue, setDebouncedValue] = useState(value);

//     useEffect(() => {
//       const handler = setTimeout(() => {
//         setDebouncedValue(value);
//       }, delay);

//       return () => {
//         clearTimeout(handler);
//       };
//     }, [value, delay]);

//     return debouncedValue;
//   };

//   const debouncedSearchTerm = useDebounce(searchTerm, 300);

//   /** 🔹 Fetch Transactions with enhanced filtering */
//   const fetchTransactions = useCallback(async () => {
//     setLoading(true);
//     setError(null);

//     try {
//       const formattedStartDate = startDate.toISOString().split('T')[0];
//       const formattedEndDate = endDate.toISOString().split('T')[0];

//       const params = {
//         start_date: formattedStartDate,
//         end_date: formattedEndDate,
//         status: filterStatus !== 'all' ? filterStatus : undefined,
//         payment_method: filterPaymentMethod !== 'all' ? filterPaymentMethod : undefined,
//         search: debouncedSearchTerm || undefined,
//         sort_by: sortDirection,
//         page: pagination.current_page,
//         page_size: pagination.page_size
//       };

//       const cleanParams = Object.fromEntries(
//         Object.entries(params).filter(([_, value]) => value !== undefined)
//       );

//       const response = await api.get('/api/payments/transactions/', { params: cleanParams });

//       const transactionsData = response.data.transactions || [];
//       setTransactions(transactionsData);
//       setPagination(response.data.pagination || {
//         current_page: 1,
//         total_pages: 1,
//         total_items: transactionsData.length,
//         page_size: pagination.page_size,
//         has_next: false,
//         has_previous: false
//       });
      
//       setStats(response.data.stats || {
//         total: transactionsData.length,
//         success: transactionsData.filter(t => t.status === 'success').length,
//         pending: transactionsData.filter(t => t.status === 'pending').length,
//         failed: transactionsData.filter(t => t.status === 'failed').length,
//         refunded: transactionsData.filter(t => t.status === 'refunded').length,
//         totalAmount: transactionsData.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0)
//       });

//       if (transactionsData.length === 0) {
//         showToast('No transactions found for the selected criteria', 'info');
//       }
//     } catch (err) {
//       const errorMessage = err.response?.data?.error || err.message || 'Failed to load transactions';
//       setError(errorMessage);
//       showToast(errorMessage, 'error');
//       console.error('Fetch transactions error:', err);
//     } finally {
//       setLoading(false);
//     }
//   }, [
//     startDate, endDate, filterStatus, filterPaymentMethod, debouncedSearchTerm, 
//     sortDirection, pagination.current_page, pagination.page_size, showToast
//   ]);

//   /** 🔹 Fetch Advanced Statistics */
//   const fetchAdvancedStats = useCallback(async () => {
//     try {
//       setLoading(true);
//       const response = await api.get('/api/payments/transactions/stats/');
//       setAdvancedStats(response.data);
//     } catch (err) {
//       console.error('Failed to fetch advanced stats:', err);
//       showToast('Failed to load advanced statistics', 'error');
//     } finally {
//       setLoading(false);
//     }
//   }, [showToast]);

//   /** 🔹 Combined refresh function */
//   const handleAnalyticsRefresh = useCallback(async () => {
//     await fetchAdvancedStats();
//     showToast('Analytics data refreshed', 'success');
//   }, [fetchAdvancedStats, showToast]);

//   /** 🔹 Fetch Transaction Details with History */
//   const fetchTransactionDetails = useCallback(async (transactionId) => {
//     try {
//       const response = await api.get(`/api/payments/transactions/${transactionId}/`);
//       setSelectedTransaction(response.data.transaction);
//       setTransactionHistory(response.data.history || []);
//       setShowDetailModal(true);
//     } catch (err) {
//       const errorMessage = err.response?.data?.error || 'Failed to load transaction details';
//       showToast(errorMessage, 'error');
//       console.error('Fetch transaction details error:', err);
//     }
//   }, [showToast]);

//   /** 🔹 Enhanced Export Data with all backend fields */
//   const fetchExportData = useCallback(async () => {
//     try {
//       const formattedStartDate = startDate.toISOString().split('T')[0];
//       const formattedEndDate = endDate.toISOString().split('T')[0];

//       const params = {
//         start_date: formattedStartDate,
//         end_date: formattedEndDate,
//         status: filterStatus !== 'all' ? filterStatus : undefined,
//         payment_method: filterPaymentMethod !== 'all' ? filterPaymentMethod : undefined,
//         search: debouncedSearchTerm || undefined,
//         sort_by: sortDirection
//       };

//       const cleanParams = Object.fromEntries(
//         Object.entries(params).filter(([_, value]) => value !== undefined)
//       );

//       const response = await api.get('/api/payments/transactions/', { 
//         params: { ...cleanParams, page_size: 1000 } 
//       });
      
//       const data = response.data.transactions || [];
//       setExportData(data);
//       return data;
//     } catch (err) {
//       const errorMessage = err.response?.data?.error || 'Failed to prepare export data';
//       showToast(errorMessage, 'error');
//       console.error('Export data error:', err);
//       return [];
//     }
//   }, [startDate, endDate, filterStatus, filterPaymentMethod, debouncedSearchTerm, sortDirection, showToast]);

//   /** 🔹 Load Transactions */
//   useEffect(() => {
//     fetchTransactions();
//   }, [fetchTransactions]);

//   /** 🔹 Refresh when refreshCount changes */
//   useEffect(() => {
//     if (refreshCount > 0) {
//       fetchTransactions();
//     }
//   }, [refreshCount, fetchTransactions]);

//   /** 🔹 Load advanced stats when showing advanced view */
//   useEffect(() => {
//     if (showAdvancedStats) {
//       fetchAdvancedStats();
//     }
//   }, [showAdvancedStats, fetchAdvancedStats]);

//   const handleRefresh = () => {
//     setRefreshCount(prev => prev + 1);
//     showToast('Refreshing data...', 'loading');
//   };

//   const handlePageChange = (newPage) => {
//     setPagination(prev => ({ ...prev, current_page: newPage }));
//   };

//   const handleSortChange = (value) => {
//     setSortDirection(value);
//     setPagination(prev => ({ ...prev, current_page: 1 }));
//   };

//   /** 🔹 Handle search with debounce */
//   const handleSearch = (value) => {
//     setSearchTerm(value);
//     setPagination(prev => ({ ...prev, current_page: 1 }));
//   };

//   /** 🔹 Handle status filter change */
//   const handleStatusChange = (value) => {
//     setFilterStatus(value);
//     setPagination(prev => ({ ...prev, current_page: 1 }));
//   };

//   /** 🔹 Handle payment method filter change */
//   const handlePaymentMethodChange = (value) => {
//     setFilterPaymentMethod(value);
//     setPagination(prev => ({ ...prev, current_page: 1 }));
//   };

//   /** 🔹 Enhanced PDF Report */
//   const generateReport = async () => {
//     const data = await fetchExportData();
//     if (data.length === 0) {
//       showToast('No data available for report generation', 'warning');
//       return;
//     }

//     try {
//       const doc = new jsPDF();
//       doc.setFontSize(16);
//       doc.text('TRANSACTION LOG REPORT', 105, 15, { align: 'center' });

//       const headers = [[
//         'Transaction ID', 'User', 'Phone', 'Amount (KES)', 'Status', 
//         'Payment Method', 'Subscription', 'Reference', 'Date & Time'
//       ]];
      
//       const rows = data.map(tx => [
//         tx.transaction_id || tx.transactionId || 'N/A',
//         tx.user_name || tx.userName || 'N/A',
//         tx.phone || 'N/A',
//         (parseFloat(tx.amount) || 0).toLocaleString(),
//         tx.status?.toUpperCase() || 'N/A',
//         tx.payment_method ? tx.payment_method.replace('_', ' ').toUpperCase() : 'N/A',
//         tx.subscription_plan || tx.subscriptionPlan || 'N/A',
//         tx.reference_number || 'N/A',
//         new Date(tx.date_time || tx.date || tx.created_at).toLocaleString()
//       ]);

//       doc.autoTable({
//         head: headers,
//         body: rows,
//         startY: 30,
//         styles: { fontSize: 7 },
//         headStyles: { fillColor: [59, 130, 246] },
//         columnStyles: {
//           0: { cellWidth: 25 },
//           1: { cellWidth: 20 },
//           2: { cellWidth: 20 },
//           3: { cellWidth: 15 },
//           4: { cellWidth: 15 },
//           5: { cellWidth: 20 },
//           6: { cellWidth: 20 },
//           7: { cellWidth: 20 },
//           8: { cellWidth: 25 }
//         }
//       });

//       doc.save(`Transaction_Log_${new Date().toISOString().slice(0, 10)}.pdf`);
//       showToast('PDF report generated successfully');
//     } catch (err) {
//       showToast('Failed to generate PDF report', 'error');
//       console.error('PDF generation error:', err);
//     }
//   };

//   /** 🔹 Enhanced CSV Data */
//   const csvData = useMemo(() => {
//     return exportData.map(tx => ({
//       'Transaction ID': tx.transaction_id || tx.transactionId,
//       'User': tx.user_name || tx.userName,
//       'Phone': tx.phone,
//       'Amount (KES)': parseFloat(tx.amount) || 0,
//       'Status': tx.status,
//       'Payment Method': tx.payment_method,
//       'Subscription': tx.subscription_plan || tx.subscriptionPlan || 'N/A',
//       'Reference Number': tx.reference_number,
//       'Description': tx.description,
//       'Date & Time': new Date(tx.date_time || tx.date || tx.created_at).toLocaleString()
//     }));
//   }, [exportData]);

//   /** 🔹 Get status color based on theme */
//   const getStatusColor = (status) => {
//     const baseColors = {
//       success: 'text-green-600',
//       pending: 'text-yellow-600',
//       failed: 'text-red-600',
//       refunded: 'text-purple-600'
//     };
    
//     const darkColors = {
//       success: 'text-green-400',
//       pending: 'text-yellow-400',
//       failed: 'text-red-400',
//       refunded: 'text-purple-400'
//     };
    
//     return theme === 'dark' ? darkColors[status] : baseColors[status];
//   };

//   /** 🔹 Get status background color */
//   const getStatusBgColor = (status) => {
//     const baseColors = {
//       success: 'bg-green-100',
//       pending: 'bg-yellow-100',
//       failed: 'bg-red-100',
//       refunded: 'bg-purple-100'
//     };
    
//     const darkColors = {
//       success: 'bg-green-900/30',
//       pending: 'bg-yellow-900/30',
//       failed: 'bg-red-900/30',
//       refunded: 'bg-purple-900/30'
//     };
    
//     return theme === 'dark' ? darkColors[status] : baseColors[status];
//   };

//   /** 🔹 Format currency */
//   const formatCurrency = (amount) => {
//     return `KES ${(parseFloat(amount) || 0).toLocaleString()}`;
//   };

//   /** 🔹 Pagination Controls */
//   const PaginationControls = (
//     <div className="flex items-center justify-between mt-4 p-4">
//       <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
//         Showing {((pagination.current_page - 1) * pagination.page_size) + 1} to{' '}
//         {Math.min(pagination.current_page * pagination.page_size, pagination.total_items)} of{' '}
//         {pagination.total_items} entries
//       </div>
//       <div className="flex space-x-2">
//         <button
//           onClick={() => handlePageChange(pagination.current_page - 1)}
//           disabled={!pagination.has_previous}
//           className={`px-4 py-2 rounded-lg transition-all ${
//             theme === 'dark' 
//               ? 'bg-gray-700 text-white hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500' 
//               : 'bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400'
//           } disabled:cursor-not-allowed`}
//         >
//           Previous
//         </button>
//         <button
//           onClick={() => handlePageChange(pagination.current_page + 1)}
//           disabled={!pagination.has_next}
//           className={`px-4 py-2 rounded-lg transition-all ${
//             theme === 'dark' 
//               ? 'bg-gray-700 text-white hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500' 
//               : 'bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400'
//           } disabled:cursor-not-allowed`}
//         >
//           Next
//         </button>
//       </div>
//     </div>
//   );

//   /** 🔹 Transaction Detail Modal */
//   const TransactionDetailModal = () => {
//     if (!showDetailModal || !selectedTransaction) return null;

//     return (
//       <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
//         <div className={`w-full max-w-4xl rounded-xl shadow-lg border p-6 ${
//           theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
//         }`}>
//           <div className="flex justify-between items-center mb-6">
//             <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
//               Transaction Details
//             </h2>
//             <button
//               onClick={() => setShowDetailModal(false)}
//               className={`p-2 rounded-lg ${
//                 theme === 'dark' ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
//               }`}
//             >
//               <FiEye className="w-5 h-5" />
//             </button>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//             <div>
//               <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
//                 Basic Information
//               </h3>
//               <div className="space-y-3">
//                 <DetailRow label="Transaction ID" value={selectedTransaction.transaction_id} />
//                 <DetailRow label="User" value={selectedTransaction.user_name} />
//                 <DetailRow label="Phone" value={selectedTransaction.phone} />
//                 <DetailRow label="Amount" value={formatCurrency(selectedTransaction.amount)} />
//                 <DetailRow label="Status" value={
//                   <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getStatusBgColor(selectedTransaction.status)} ${getStatusColor(selectedTransaction.status)}`}>
//                     {selectedTransaction.status?.charAt(0).toUpperCase() + selectedTransaction.status?.slice(1)}
//                   </span>
//                 } />
//               </div>
//             </div>

//             <div>
//               <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
//                 Additional Details
//               </h3>
//               <div className="space-y-3">
//                 <DetailRow label="Payment Method" value={selectedTransaction.payment_method} />
//                 <DetailRow label="Subscription" value={selectedTransaction.subscription_plan} />
//                 <DetailRow label="Reference" value={selectedTransaction.reference_number} />
//                 <DetailRow label="Description" value={selectedTransaction.description} />
//                 <DetailRow label="Date" value={new Date(selectedTransaction.created_at).toLocaleString()} />
//               </div>
//             </div>
//           </div>

//           {transactionHistory.length > 0 && (
//             <div>
//               <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
//                 Transaction History
//               </h3>
//               <div className={`rounded-lg border ${
//                 theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
//               }`}>
//                 {transactionHistory.map((history, index) => (
//                   <div key={history.id} className={`p-4 ${
//                     index !== transactionHistory.length - 1 ? 'border-b' : ''
//                   } ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
//                     <div className="flex justify-between items-start">
//                       <div>
//                         <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
//                           {history.action.replace('_', ' ').toUpperCase()}
//                         </p>
//                         <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
//                           {history.performed_by_name || 'System'}
//                         </p>
//                       </div>
//                       <div className="text-right">
//                         <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
//                           {new Date(history.timestamp).toLocaleString()}
//                         </p>
//                         {history.old_status && history.new_status && (
//                           <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
//                             {history.old_status} → {history.new_status}
//                           </p>
//                         )}
//                       </div>
//                     </div>
//                     {history.notes && (
//                       <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
//                         {history.notes}
//                       </p>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     );
//   };

//   const DetailRow = ({ label, value }) => (
//     <div className="flex justify-between">
//       <span className={`font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
//         {label}:
//       </span>
//       <span className={`text-right ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
//         {value || 'N/A'}
//       </span>
//     </div>
//   );

//   // Theme-based classes
//   const containerClass = theme === 'dark' 
//     ? 'bg-gradient-to-br from-gray-900 to-indigo-900 text-white min-h-screen' 
//     : 'bg-gray-50 text-gray-800 min-h-screen';

//   const cardClass = theme === 'dark' 
//     ? 'bg-gray-800/80 backdrop-blur-md border border-gray-700' 
//     : 'bg-white border border-gray-200';

//   const inputClass = theme === 'dark'
//     ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
//     : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500';

//   const tableHeaderClass = theme === 'dark'
//     ? 'bg-gray-700 text-gray-200'
//     : 'bg-gray-50 text-gray-700';

//   const tableRowClass = theme === 'dark'
//     ? 'border-gray-700 hover:bg-gray-700/50'
//     : 'border-gray-200 hover:bg-gray-50';

//   return (
//     <div className={`p-6 min-h-screen transition-colors duration-300 ${containerClass}`}>
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
//           <div className="flex items-center gap-4">
//             <h1 className="text-2xl font-bold flex items-center">
//               <GrTransaction className="mr-3 text-blue-500" /> 
//               Transaction Log
//             </h1>
//             <button
//               onClick={() => setShowAdvancedStats(!showAdvancedStats)}
//               className={`flex items-center px-4 py-2 rounded-lg transition-all ${
//                 theme === 'dark'
//                   ? 'bg-gray-700 hover:bg-gray-600 text-white'
//                   : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-300'
//               }`}
//             >
//               <FiTrendingUp className="mr-2" />
//               {showAdvancedStats ? 'Hide Analytics' : 'Show Analytics'}
//             </button>
//           </div>
//           <button 
//             onClick={handleRefresh} 
//             disabled={loading}
//             className={`flex items-center px-4 py-2 rounded-lg transition-all ${
//               theme === 'dark'
//                 ? 'bg-gray-700 hover:bg-gray-600 text-white'
//                 : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-300'
//             } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
//           >
//             <AiOutlineReload className={`mr-2 ${loading ? 'animate-spin' : ''}`} /> 
//             {loading ? 'Refreshing...' : 'Refresh'}
//           </button>
//         </div>

//         {/* Advanced Analytics Component */}
//         {showAdvancedStats && (
//           <TransactionAnalytics 
//             advancedStats={advancedStats}
//             onRefresh={handleAnalyticsRefresh}
//             loading={loading}
//           />
//         )}

//         {/* Stats Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
//           {[
//             { label: 'Total Transactions', value: stats.total, border: 'border-l-blue-500' },
//             { label: 'Success', value: stats.success, border: 'border-l-green-500', color: 'text-green-600' },
//             { label: 'Pending', value: stats.pending, border: 'border-l-yellow-500', color: 'text-yellow-600' },
//             { label: 'Failed', value: stats.failed, border: 'border-l-red-500', color: 'text-red-600' },
//             { label: 'Refunded', value: stats.refunded, border: 'border-l-purple-500', color: 'text-purple-600' },
//             { label: 'Total Amount', value: formatCurrency(stats.totalAmount), border: 'border-l-indigo-500' },
//           ].map((stat, index) => (
//             <div key={index} className={`p-6 rounded-xl shadow-lg ${cardClass} ${stat.border}`}>
//               <h3 className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
//                 {stat.label}
//               </h3>
//               <p className={`text-2xl font-bold mt-2 ${stat.color || (theme === 'dark' ? 'text-white' : 'text-gray-800')}`}>
//                 {stat.value}
//               </p>
//             </div>
//           ))}
//         </div>

//         {/* Filters Section */}
//         <div className={`p-6 rounded-xl shadow-lg mb-6 ${cardClass}`}>
//           <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
//             {/* Search */}
//             <div className="relative flex-grow w-full lg:w-auto">
//               <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//               <input
//                 type="text"
//                 placeholder="Search by transaction ID, user, phone, or reference..."
//                 className={`pl-10 pr-4 py-3 border rounded-lg w-full transition-colors ${inputClass}`}
//                 value={searchTerm}
//                 onChange={(e) => handleSearch(e.target.value)}
//               />
//             </div>

//             {/* Status Filter */}
//             <EnhancedSelect
//               value={filterStatus}
//               onChange={handleStatusChange}
//               options={statusOptions}
//               placeholder="All Status"
//               theme={theme}
//               className="w-full lg:w-40"
//             />

//             {/* Payment Method Filter */}
//             <EnhancedSelect
//               value={filterPaymentMethod}
//               onChange={handlePaymentMethodChange}
//               options={paymentMethodOptions}
//               placeholder="All Methods"
//               theme={theme}
//               className="w-full lg:w-40"
//             />

//             {/* Sort Select */}
//             <EnhancedSelect
//               value={sortDirection}
//               onChange={handleSortChange}
//               options={sortOptions}
//               placeholder="Sort by"
//               theme={theme}
//               className="w-full lg:w-48"
//             />

//             {/* Enhanced Date Pickers - Using Portal Solution */}
//             <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
//               <EnhancedDatePicker
//                 selected={startDate}
//                 onChange={setStartDate}
//                 selectsStart
//                 startDate={startDate}
//                 endDate={endDate}
//                 placeholderText="Start Date"
//                 theme={theme}
//                 className="w-full sm:w-40"
//               />
//               <EnhancedDatePicker
//                 selected={endDate}
//                 onChange={setEndDate}
//                 selectsEnd
//                 startDate={startDate}
//                 endDate={endDate}
//                 minDate={startDate}
//                 placeholderText="End Date"
//                 theme={theme}
//                 className="w-full sm:w-40"
//               />
//             </div>

//             {/* Export Buttons */}
//             <div className="flex gap-2 w-full lg:w-auto">
//               <button 
//                 onClick={generateReport}
//                 disabled={loading}
//                 className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
//               >
//                 <FaDownload />
//                 PDF
//               </button>
//               <CSVLink
//                 data={csvData}
//                 filename={`transaction_log_${new Date().toISOString().slice(0, 10)}.csv`}
//                 onClick={fetchExportData}
//                 className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-center"
//               >
//                 <FaDownload />
//                 CSV
//               </CSVLink>
//             </div>
//           </div>
//         </div>

//         {/* Transactions Table */}
//         {loading ? (
//           <div className={`p-8 rounded-xl ${cardClass} text-center`}>
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
//             <p className="mt-4">Loading transactions...</p>
//           </div>
//         ) : error ? (
//           <div className={`p-6 rounded-xl ${cardClass} text-center`}>
//             <p className="text-red-500 text-lg">{error}</p>
//             <button 
//               onClick={handleRefresh}
//               className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//             >
//               Try Again
//             </button>
//           </div>
//         ) : (
//           <div className={`rounded-xl shadow-lg overflow-hidden ${cardClass}`}>
//             <div className="overflow-x-auto">
//               <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
//                 <thead className={tableHeaderClass}>
//                   <tr>
//                     <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
//                       Transaction ID
//                     </th>
//                     <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
//                       User
//                     </th>
//                     <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
//                       Phone
//                     </th>
//                     <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
//                       Amount
//                     </th>
//                     <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
//                       Status
//                     </th>
//                     <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
//                       Payment Method
//                     </th>
//                     <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
//                       Subscription
//                     </th>
//                     <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
//                       Date & Time
//                     </th>
//                     <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
//                       Actions
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
//                   {transactions.length === 0 ? (
//                     <tr>
//                       <td colSpan="9" className="px-6 py-8 text-center">
//                         <div className="flex flex-col items-center justify-center">
//                           <GrTransaction className="text-4xl text-gray-400 mb-2" />
//                           <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
//                             No transactions found
//                           </p>
//                         </div>
//                       </td>
//                     </tr>
//                   ) : (
//                     transactions.map((tx, index) => (
//                       <tr key={tx.id || index} className={`transition-colors ${tableRowClass}`}>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
//                           {tx.transaction_id || tx.transactionId || 'N/A'}
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm">
//                           {tx.user_name || tx.userName || 'N/A'}
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm">
//                           {tx.phone || 'N/A'}
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
//                           {formatCurrency(tx.amount)}
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBgColor(tx.status)} ${getStatusColor(tx.status)}`}>
//                             {tx.status?.charAt(0).toUpperCase() + tx.status?.slice(1) || 'Unknown'}
//                           </span>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm">
//                           {tx.payment_method ? tx.payment_method.replace('_', ' ').toUpperCase() : 'N/A'}
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm">
//                           {tx.subscription_plan || tx.subscriptionPlan || 'N/A'}
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm">
//                           {new Date(tx.date_time || tx.date || tx.created_at).toLocaleString()}
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm">
//                           <button
//                             onClick={() => fetchTransactionDetails(tx.transaction_id || tx.transactionId)}
//                             className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
//                               theme === 'dark' 
//                                 ? 'bg-gray-700 hover:bg-gray-600 text-white' 
//                                 : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
//                             }`}
//                           >
//                             <FiEye className="w-4 h-4" />
//                             View
//                           </button>
//                         </td>
//                       </tr>
//                     ))
//                   )}
//                 </tbody>
//               </table>
//             </div>
//             {transactions.length > 0 && PaginationControls}
//           </div>
//         )}
//       </div>

//       {/* Transaction Detail Modal */}
//       <TransactionDetailModal />

//       {/* React Hot Toast Container */}
//       <Toaster 
//         position="top-center"
//         toastOptions={{
//           duration: 4000,
//           style: {
//             background: theme === 'dark' ? '#374151' : '#fff',
//             color: theme === 'dark' ? '#fff' : '#000',
//           },
//           success: {
//             duration: 3000,
//             iconTheme: {
//               primary: '#10B981',
//               secondary: theme === 'dark' ? '#374151' : '#fff',
//             },
//           },
//           error: {
//             duration: 5000,
//             iconTheme: {
//               primary: '#EF4444',
//               secondary: theme === 'dark' ? '#374151' : '#fff',
//             },
//           },
//         }}
//       />
//     </div>
//   );
// };

// export default TransactionLog;








import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Toaster } from 'react-hot-toast';
import { 
  FaSearch, FaDownload, FaSortAmountDown, FaSortAmountUp, 
  FaCalendarAlt, FaFilter, FaChartBar, FaHistory,
  FaWifi, FaNetworkWired
} from 'react-icons/fa';
import { GrTransaction } from 'react-icons/gr';
import { AiOutlineReload } from 'react-icons/ai';
import { FiEye, FiChevronDown, FiChevronUp, FiTrendingUp } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api';
import { useTheme } from '../../context/ThemeContext';
import { EnhancedSelect } from '../../components/ServiceManagement/Shared/components';

import TransactionAnalytics from '../../components/PaymentConfiguration/TransactionLog/TransactionAnalytics.jsx'
import HotspotTransactions from '../../components/PaymentConfiguration/TransactionLog/HotspotTransactions.jsx'
import PPPoETransactions from '../../components/PaymentConfiguration/TransactionLog/PPPoETransactions.jsx'
import TransactionFilters from '../../components/PaymentConfiguration/TransactionLog/TransactionFilters.jsx';
import TransactionStats from '../../components/PaymentConfiguration/TransactionLog/TransactionStats.jsx';
import TransactionDetailModal from '../../components/PaymentConfiguration/TransactionLog/TransactionDetailModal.jsx';

const TransactionLog = () => {
  const { theme } = useTheme();
  const [activeView, setActiveView] = useState('overview'); // overview, hotspot, pppoe, analytics
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [advancedStats, setAdvancedStats] = useState(null);
  const [refreshCount, setRefreshCount] = useState(0);

  // Filter states
  const [filters, setFilters] = useState({
    searchTerm: '',
    status: 'all',
    paymentMethod: 'all',
    accessType: 'all',
    startDate: new Date(new Date().setDate(new Date().getDate() - 7)),
    endDate: new Date(),
    sortBy: 'date_desc',
    page: 1,
    pageSize: 20
  });

  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_items: 0,
    page_size: 20,
    has_next: false,
    has_previous: false
  });

  const [stats, setStats] = useState({
    total: 0,
    success: 0,
    pending: 0,
    failed: 0,
    refunded: 0,
    totalAmount: 0,
    byAccessType: {}
  });

  // View options
  const viewOptions = useMemo(() => [
    { value: 'overview', label: 'Overview', icon: GrTransaction },
    { value: 'hotspot', label: 'Hotspot', icon: FaWifi },
    { value: 'pppoe', label: 'PPPoE', icon: FaNetworkWired },
    { value: 'analytics', label: 'Analytics', icon: FaChartBar }
  ], []);

  // Toast notification system
  const showToast = useCallback((message, type = 'success') => {
    const toastOptions = {
      duration: type === 'error' ? 5000 : 3000,
      position: 'top-center',
    };

    if (typeof toast !== 'undefined') {
      if (type === 'success') {
        toast.success(message, toastOptions);
      } else if (type === 'error') {
        toast.error(message, toastOptions);
      } else if (type === 'loading') {
        toast.loading(message, toastOptions);
      } else {
        toast(message, toastOptions);
      }
    }
  }, []);

  // Fetch transactions
  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        start_date: filters.startDate.toISOString().split('T')[0],
        end_date: filters.endDate.toISOString().split('T')[0],
        status: filters.status !== 'all' ? filters.status : undefined,
        payment_method: filters.paymentMethod !== 'all' ? filters.paymentMethod : undefined,
        access_type: filters.accessType !== 'all' ? filters.accessType : undefined,
        search: filters.searchTerm || undefined,
        sort_by: filters.sortBy,
        page: filters.page,
        page_size: filters.pageSize
      };

      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([_, value]) => value !== undefined)
      );

      const response = await api.get('/api/payments/transactions/', { params: cleanParams });

      const transactionsData = response.data.transactions || [];
      setTransactions(transactionsData);
      setFilteredTransactions(transactionsData);
      
      setPagination(response.data.pagination || {
        current_page: 1,
        total_pages: 1,
        total_items: transactionsData.length,
        page_size: filters.pageSize,
        has_next: false,
        has_previous: false
      });
      
      setStats(response.data.stats || {
        total: transactionsData.length,
        success: transactionsData.filter(t => t.status === 'success').length,
        pending: transactionsData.filter(t => t.status === 'pending').length,
        failed: transactionsData.filter(t => t.status === 'failed').length,
        refunded: transactionsData.filter(t => t.status === 'refunded').length,
        totalAmount: transactionsData.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0),
        byAccessType: {}
      });

      if (transactionsData.length === 0) {
        showToast('No transactions found for the selected criteria', 'info');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to load transactions';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      console.error('Fetch transactions error:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, showToast]);

  // Fetch advanced stats
  const fetchAdvancedStats = useCallback(async () => {
    try {
      const response = await api.get('/api/payments/transactions/stats/');
      setAdvancedStats(response.data);
    } catch (err) {
      console.error('Failed to fetch advanced stats:', err);
      showToast('Failed to load advanced statistics', 'error');
    }
  }, [showToast]);

  // Fetch access type comparison
  const fetchAccessTypeComparison = useCallback(async () => {
    try {
      const response = await api.get('/api/payments/transactions/analytics/access-type-comparison/');
      return response.data;
    } catch (err) {
      console.error('Failed to fetch access type comparison:', err);
      showToast('Failed to load access type comparison', 'error');
      return null;
    }
  }, [showToast]);

  // Combined refresh function
  const handleRefresh = useCallback(async () => {
    setRefreshCount(prev => prev + 1);
    showToast('Refreshing data...', 'loading');
    
    await Promise.all([
      fetchTransactions(),
      fetchAdvancedStats()
    ]);
    
    showToast('Data refreshed successfully', 'success');
  }, [fetchTransactions, fetchAdvancedStats, showToast]);

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  }, []);

  // Handle page change
  const handlePageChange = useCallback((newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  }, []);

  // Handle transaction selection
  const handleTransactionSelect = useCallback(async (transaction) => {
    try {
      const response = await api.get(`/api/payments/transactions/${transaction.transactionId}/`);
      setSelectedTransaction(response.data.transaction);
      setShowDetailModal(true);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to load transaction details';
      showToast(errorMessage, 'error');
    }
  }, [showToast]);

  // Load data on component mount and filter changes
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  useEffect(() => {
    if (activeView === 'analytics') {
      fetchAdvancedStats();
    }
  }, [activeView, fetchAdvancedStats]);

  useEffect(() => {
    if (refreshCount > 0) {
      fetchTransactions();
    }
  }, [refreshCount, fetchTransactions]);

  // Theme classes
  const themeClasses = {
    container: theme === 'dark' 
      ? 'bg-gradient-to-br from-gray-900 to-indigo-900 text-white' 
      : 'bg-gray-50 text-gray-800',
    card: theme === 'dark' 
      ? 'bg-gray-800/80 backdrop-blur-md border border-gray-700' 
      : 'bg-white border border-gray-200',
    input: theme === 'dark'
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
      : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500'
  };

  // Render active view
  const renderActiveView = () => {
    switch (activeView) {
      case 'overview':
        return (
          <div className="space-y-6">
            <TransactionStats 
              stats={stats}
              advancedStats={advancedStats}
              theme={theme}
            />
            <TransactionFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              onRefresh={handleRefresh}
              loading={loading}
              theme={theme}
            />
            <TransactionTable
              transactions={transactions}
              loading={loading}
              error={error}
              pagination={pagination}
              onPageChange={handlePageChange}
              onTransactionSelect={handleTransactionSelect}
              theme={theme}
            />
          </div>
        );
      
      case 'hotspot':
        return (
          <HotspotTransactions
            filters={filters}
            onFilterChange={handleFilterChange}
            onRefresh={handleRefresh}
            onTransactionSelect={handleTransactionSelect}
            loading={loading}
            error={error}
            theme={theme}
          />
        );
      
      case 'pppoe':
        return (
          <PPPoETransactions
            filters={filters}
            onFilterChange={handleFilterChange}
            onRefresh={handleRefresh}
            onTransactionSelect={handleTransactionSelect}
            loading={loading}
            error={error}
            theme={theme}
          />
        );
      
      case 'analytics':
        return (
          <TransactionAnalytics
            advancedStats={advancedStats}
            stats={stats}
            onRefresh={handleRefresh}
            loading={loading}
            theme={theme}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen p-6 transition-colors duration-300 ${themeClasses.container}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold flex items-center">
              <GrTransaction className="mr-3 text-blue-500" /> 
              Transaction Log
            </h1>
            <span className={`px-3 py-1 rounded-full text-sm ${
              theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
            }`}>
              {pagination.total_items} transactions
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className={`flex items-center px-4 py-2 rounded-lg transition-all ${
                theme === 'dark'
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-300'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <AiOutlineReload className={`mr-2 ${loading ? 'animate-spin' : ''}`} /> 
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* View Navigation */}
        <div className={`mb-6 rounded-xl shadow-lg ${themeClasses.card}`}>
          <div className="flex flex-wrap gap-1 p-2">
            {viewOptions.map((view) => {
              const IconComponent = view.icon;
              return (
                <button
                  key={view.value}
                  onClick={() => setActiveView(view.value)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    activeView === view.value
                      ? 'bg-indigo-600 text-white shadow-lg'
                      : theme === 'dark'
                      ? 'text-gray-300 hover:bg-gray-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  {view.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active View Content */}
        {renderActiveView()}

        {/* Transaction Detail Modal */}
        <TransactionDetailModal
          transaction={selectedTransaction}
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          theme={theme}
        />
      </div>

      {/* React Hot Toast Container */}
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: theme === 'dark' ? '#374151' : '#fff',
            color: theme === 'dark' ? '#fff' : '#000',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10B981',
              secondary: theme === 'dark' ? '#374151' : '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#EF4444',
              secondary: theme === 'dark' ? '#374151' : '#fff',
            },
          },
        }}
      />
    </div>
  );
};

// Transaction Table Component
const TransactionTable = ({ 
  transactions, 
  loading, 
  error, 
  pagination, 
  onPageChange, 
  onTransactionSelect,
  theme 
}) => {
  const themeClasses = {
    tableHeader: theme === 'dark' ? 'bg-gray-700 text-gray-200' : 'bg-gray-50 text-gray-700',
    tableRow: theme === 'dark' ? 'border-gray-700 hover:bg-gray-700/50' : 'border-gray-200 hover:bg-gray-50',
    card: theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
  };

  const getStatusColor = (status) => {
    const baseColors = {
      success: 'text-green-600',
      pending: 'text-yellow-600',
      failed: 'text-red-600',
      refunded: 'text-purple-600'
    };
    
    const darkColors = {
      success: 'text-green-400',
      pending: 'text-yellow-400',
      failed: 'text-red-400',
      refunded: 'text-purple-400'
    };
    
    return theme === 'dark' ? darkColors[status] : baseColors[status];
  };

  const getStatusBgColor = (status) => {
    const baseColors = {
      success: 'bg-green-100',
      pending: 'bg-yellow-100',
      failed: 'bg-red-100',
      refunded: 'bg-purple-100'
    };
    
    const darkColors = {
      success: 'bg-green-900/30',
      pending: 'bg-yellow-900/30',
      failed: 'bg-red-900/30',
      refunded: 'bg-purple-900/30'
    };
    
    return theme === 'dark' ? darkColors[status] : baseColors[status];
  };

  const getAccessTypeColor = (accessType) => {
    const colors = {
      hotspot: theme === 'dark' ? 'text-blue-400' : 'text-blue-600',
      pppoe: theme === 'dark' ? 'text-green-400' : 'text-green-600',
      both: theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
    };
    return colors[accessType] || (theme === 'dark' ? 'text-gray-400' : 'text-gray-600');
  };

  const formatCurrency = (amount) => {
    return `KES ${(parseFloat(amount) || 0).toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className={`p-8 rounded-xl ${themeClasses.card} text-center`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4">Loading transactions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 rounded-xl ${themeClasses.card} text-center`}>
        <p className="text-red-500 text-lg">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className={`rounded-xl shadow-lg overflow-hidden ${themeClasses.card}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className={themeClasses.tableHeader}>
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                Transaction ID
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                Access Type
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                Payment Method
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                Plan
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                Date & Time
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan="9" className="px-6 py-8 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <GrTransaction className="text-4xl text-gray-400 mb-2" />
                    <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                      No transactions found
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              transactions.map((tx, index) => (
                <tr key={tx.id || index} className={`transition-colors ${themeClasses.tableRow}`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                    {tx.transactionId || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {tx.userName || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getAccessTypeColor(tx.accessType)}`}>
                      {tx.accessTypeDisplay || tx.accessType || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                    {formatCurrency(tx.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBgColor(tx.status)} ${getStatusColor(tx.status)}`}>
                      {tx.status?.charAt(0).toUpperCase() + tx.status?.slice(1) || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {tx.paymentMethod ? tx.paymentMethod.replace('_', ' ').toUpperCase() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {tx.planName || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {new Date(tx.date || tx.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => onTransactionSelect(tx)}
                      className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
                        theme === 'dark' 
                          ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                      }`}
                    >
                      <FiEye className="w-4 h-4" />
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {transactions.length > 0 && (
        <div className="flex items-center justify-between mt-4 p-4 border-t border-gray-200 dark:border-gray-700">
          <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Showing {((pagination.current_page - 1) * pagination.page_size) + 1} to{' '}
            {Math.min(pagination.current_page * pagination.page_size, pagination.total_items)} of{' '}
            {pagination.total_items} entries
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => onPageChange(pagination.current_page - 1)}
              disabled={!pagination.has_previous}
              className={`px-4 py-2 rounded-lg transition-all ${
                theme === 'dark' 
                  ? 'bg-gray-700 text-white hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400'
              } disabled:cursor-not-allowed`}
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange(pagination.current_page + 1)}
              disabled={!pagination.has_next}
              className={`px-4 py-2 rounded-lg transition-all ${
                theme === 'dark' 
                  ? 'bg-gray-700 text-white hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400'
              } disabled:cursor-not-allowed`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionLog;