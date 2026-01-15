

// import React, { useState, useEffect, useCallback } from 'react';
// import {
//   FiDollarSign,
//   FiTrendingUp,
//   FiUsers,
//   FiCheckCircle,
//   FiClock,
//   FiAlertCircle,
//   FiDownload,
//   FiFilter,
//   FiRefreshCw,
//   FiEye,
//   FiEdit,
//   FiX,
//   FiCalendar,
//   FiBarChart2
// } from 'react-icons/fi';
// import { FaSpinner } from 'react-icons/fa';
// import Card from '../../UI/Card';
// import Modal from '../../UI/Modal';
// import DataTable from '../../UI/DataTable';
// import StatsCard from '../../UI/StatsCard';
// import CommissionService from '../services/CommissionService';
// import { formatCurrency, formatDate, formatPercentage } from '../../utils/formatters';

// const CommissionTracker = ({ marketerId, theme }) => {
//   const [commissions, setCommissions] = useState([]);
//   const [summary, setSummary] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isRefreshing, setIsRefreshing] = useState(false);
//   const [error, setError] = useState('');
//   const [selectedTransaction, setSelectedTransaction] = useState(null);
//   const [showDetailsModal, setShowDetailsModal] = useState(false);
//   const [showPayoutModal, setShowPayoutModal] = useState(false);
//   const [payoutData, setPayoutData] = useState({
//     payment_method: 'mpesa',
//     payment_reference: '',
//     notes: ''
//   });
  
//   const [filters, setFilters] = useState({
//     status: 'all',
//     transaction_type: 'all',
//     date_from: '',
//     date_to: '',
//     marketer_id: marketerId || '',
//     sort_by: '-transaction_date'
//   });

//   const themeClasses = {
//     container: theme === 'dark' 
//       ? 'bg-gray-800 border-gray-700 text-gray-100' 
//       : 'bg-white border-gray-200 text-gray-900',
//     card: theme === 'dark'
//       ? 'bg-gray-900/50 border-gray-700'
//       : 'bg-gray-50 border-gray-200',
//     heading: theme === 'dark' ? 'text-white' : 'text-gray-800',
//     subheading: theme === 'dark' ? 'text-gray-300' : 'text-gray-600',
//     muted: theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
//   };

//   // Fetch commission data
//   const fetchCommissions = useCallback(async () => {
//     try {
//       setIsLoading(true);
//       setError('');

//       const [transactionsResponse, summaryResponse] = await Promise.all([
//         CommissionService.getTransactions(filters),
//         CommissionService.getCommissionSummary('month')
//       ]);

//       setCommissions(transactionsResponse.data?.results || transactionsResponse.data || []);
//       setSummary(summaryResponse.data || {
//         total_balance: 0,
//         total_earned: 0,
//         pending_approvals: 0,
//         total_marketers: 0,
//         pending_payouts: 0,
//         recent_transactions: []
//       });

//     } catch (error) {
//       console.error('Error fetching commission data:', error);
//       setError(error.response?.data?.error || 'Failed to load commission data');
      
//       // Set fallback data for development
//       setCommissions([]);
//       setSummary({
//         total_balance: 0,
//         total_earned: 0,
//         pending_approvals: 0,
//         total_marketers: 0,
//         pending_payouts: 0,
//         recent_transactions: []
//       });
//     } finally {
//       setIsLoading(false);
//       setIsRefreshing(false);
//     }
//   }, [filters]);

//   // Initial load
//   useEffect(() => {
//     fetchCommissions();
//   }, [fetchCommissions]);

//   // Handle transaction approval
//   const handleApproveTransaction = async (id) => {
//     try {
//       setIsLoading(true);
//       await CommissionService.approveTransaction(id, 'Approved by admin');
//       await fetchCommissions();
//     } catch (error) {
//       setError('Failed to approve transaction');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Handle mark as paid
//   const handleMarkAsPaid = async () => {
//     try {
//       setIsLoading(true);
//       await CommissionService.markAsPaid(selectedTransaction.id, payoutData);
//       await fetchCommissions();
//       setShowPayoutModal(false);
//       setPayoutData({
//         payment_method: 'mpesa',
//         payment_reference: '',
//         notes: ''
//       });
//     } catch (error) {
//       setError('Failed to mark as paid');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Handle filter change
//   const handleFilterChange = (filterName, value) => {
//     setFilters(prev => ({ ...prev, [filterName]: value }));
//   };

//   // Export commission report
//   const handleExportReport = async () => {
//     try {
//       setIsLoading(true);
//       await CommissionService.exportCommissionReport('csv', filters);
//     } catch (error) {
//       setError('Failed to export report');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Refresh data
//   const handleRefresh = async () => {
//     setIsRefreshing(true);
//     await fetchCommissions();
//   };

//   // Clear filters
//   const handleClearFilters = () => {
//     setFilters({
//       status: 'all',
//       transaction_type: 'all',
//       date_from: '',
//       date_to: '',
//       marketer_id: marketerId || '',
//       sort_by: '-transaction_date'
//     });
//   };

//   // Get status color
//   const getStatusColor = (status) => {
//     const colors = {
//       pending: 'text-yellow-500',
//       approved: 'text-blue-500',
//       paid: 'text-green-500',
//       rejected: 'text-red-500',
//       cancelled: 'text-gray-500',
//       hold: 'text-orange-500'
//     };
//     return colors[status] || 'text-gray-500';
//   };

//   // Get status icon
//   const getStatusIcon = (status) => {
//     switch (status) {
//       case 'pending': return <FiClock className="text-yellow-500" />;
//       case 'approved': return <FiCheckCircle className="text-blue-500" />;
//       case 'paid': return <FiCheckCircle className="text-green-500" />;
//       case 'rejected': return <FiX className="text-red-500" />;
//       default: return <FiAlertCircle className="text-gray-500" />;
//     }
//   };

//   // Calculate filtered stats
//   const filteredStats = useCallback(() => {
//     if (!commissions.length) return null;
    
//     const totalAmount = commissions.reduce((sum, t) => sum + (t.amount || 0), 0);
//     const pendingCount = commissions.filter(t => t.status === 'pending').length;
//     const paidCount = commissions.filter(t => t.status === 'paid').length;
//     const approvedCount = commissions.filter(t => t.status === 'approved').length;
    
//     return {
//       totalAmount,
//       pendingCount,
//       paidCount,
//       approvedCount,
//       averageAmount: totalAmount / commissions.length
//     };
//   }, [commissions]);

//   const stats = filteredStats();

//   // Table columns
//   const columns = [
//     {
//       header: 'ID',
//       accessor: 'reference_id',
//       cell: (value) => (
//         <span className="font-mono text-xs opacity-75">{value || 'N/A'}</span>
//       )
//     },
//     {
//       header: 'Marketer',
//       accessor: 'marketer_name',
//       cell: (value, row) => (
//         <div>
//           <p className="font-medium">{value || 'Unknown'}</p>
//           <p className="text-xs opacity-75">{row.marketer_tier || 'N/A'}</p>
//         </div>
//       )
//     },
//     {
//       header: 'Type',
//       accessor: 'transaction_type',
//       cell: (value) => (
//         <span className="capitalize">{value?.replace('_', ' ') || 'N/A'}</span>
//       )
//     },
//     {
//       header: 'Amount',
//       accessor: 'amount',
//       cell: (value) => (
//         <span className="font-medium">{formatCurrency(value || 0, 'KES', 0)}</span>
//       )
//     },
//     {
//       header: 'Status',
//       accessor: 'status',
//       cell: (value) => (
//         <div className="flex items-center gap-2">
//           {getStatusIcon(value)}
//           <span className={`capitalize ${getStatusColor(value)}`}>
//             {value || 'unknown'}
//           </span>
//         </div>
//       )
//     },
//     {
//       header: 'Date',
//       accessor: 'transaction_date',
//       cell: (value) => (
//         <span>{formatDate(value, 'short')}</span>
//       )
//     },
//     {
//       header: 'Actions',
//       cell: (value, row) => (
//         <div className="flex gap-2">
//           <button
//             onClick={() => {
//               setSelectedTransaction(row);
//               setShowDetailsModal(true);
//             }}
//             className={`p-1.5 rounded ${
//               theme === 'dark' 
//                 ? 'hover:bg-gray-700' 
//                 : 'hover:bg-gray-200'
//             }`}
//             title="View Details"
//           >
//             <FiEye size={14} />
//           </button>
//           {row.status === 'pending' && (
//             <button
//               onClick={() => handleApproveTransaction(row.id)}
//               className="p-1.5 rounded hover:bg-green-100 dark:hover:bg-green-900/30"
//               title="Approve"
//             >
//               <FiCheckCircle size={14} className="text-green-500" />
//             </button>
//           )}
//           {row.status === 'approved' && (
//             <button
//               onClick={() => {
//                 setSelectedTransaction(row);
//                 setShowPayoutModal(true);
//               }}
//               className="p-1.5 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30"
//               title="Mark as Paid"
//             >
//               <FiDollarSign size={14} className="text-blue-500" />
//             </button>
//           )}
//         </div>
//       )
//     }
//   ];

//   if (isLoading && !commissions.length) {
//     return (
//       <Card theme={theme} className="text-center p-8">
//         <FaSpinner className="animate-spin text-2xl mx-auto mb-4 text-blue-500" />
//         <p className={themeClasses.subheading}>Loading commission data...</p>
//       </Card>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {/* Error Display */}
//       {error && (
//         <Card theme={theme} className="border-red-200 dark:border-red-800">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-2">
//               <FiAlertCircle className="text-red-500" />
//               <span>{error}</span>
//             </div>
//             <button
//               onClick={() => setError('')}
//               className="p-1 rounded hover:bg-red-800/30 dark:hover:bg-red-800/30"
//             >
//               <FiX size={16} />
//             </button>
//           </div>
//         </Card>
//       )}

//       {/* Summary Cards */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//         <StatsCard
//           title="Total Balance"
//           value={formatCurrency(summary?.total_balance || 0, 'KES', 0)}
//           icon={FiDollarSign}
//           color="green"
//           theme={theme}
//         />
        
//         <StatsCard
//           title="Total Earned"
//           value={formatCurrency(summary?.total_earned || 0, 'KES', 0)}
//           icon={FiTrendingUp}
//           color="blue"
//           theme={theme}
//         />
        
//         <StatsCard
//           title="Pending Approvals"
//           value={summary?.pending_approvals || 0}
//           icon={FiClock}
//           color="yellow"
//           theme={theme}
//         />
        
//         <StatsCard
//           title="Active Marketers"
//           value={summary?.total_marketers || 0}
//           icon={FiUsers}
//           color="purple"
//           theme={theme}
//         />
//       </div>

//       {/* Filter and Controls */}
//       <Card theme={theme}>
//         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
//           <h3 className={`font-semibold ${themeClasses.heading}`}>
//             Commission Transactions
//           </h3>
//           <div className="flex items-center gap-2">
//             <button
//               onClick={handleExportReport}
//               disabled={isLoading}
//               className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
//                 theme === 'dark'
//                   ? 'bg-green-600 hover:bg-green-700 text-white disabled:opacity-50'
//                   : 'bg-green-500 hover:bg-green-600 text-white disabled:opacity-50'
//               }`}
//             >
//               <FiDownload size={14} />
//               Export
//             </button>
//             <button
//               onClick={handleRefresh}
//               disabled={isRefreshing}
//               className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
//                 theme === 'dark'
//                   ? 'bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50'
//                   : 'bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50'
//               }`}
//             >
//               {isRefreshing ? (
//                 <FaSpinner className="animate-spin" size={14} />
//               ) : (
//                 <FiRefreshCw size={14} />
//               )}
//               Refresh
//             </button>
//           </div>
//         </div>

//         {/* Filter Controls */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-4">
//           <div>
//             <label className={`block text-xs mb-1 ${themeClasses.muted}`}>Status</label>
//             <select
//               value={filters.status}
//               onChange={(e) => handleFilterChange('status', e.target.value)}
//               className={`w-full px-3 py-2 rounded-lg border text-sm ${
//                 theme === 'dark'
//                   ? 'bg-gray-700 border-gray-600 text-white'
//                   : 'bg-white border-gray-300 text-gray-900'
//               }`}
//             >
//               <option value="all">All Status</option>
//               <option value="pending">Pending</option>
//               <option value="approved">Approved</option>
//               <option value="paid">Paid</option>
//               <option value="rejected">Rejected</option>
//             </select>
//           </div>

//           <div>
//             <label className={`block text-xs mb-1 ${themeClasses.muted}`}>Type</label>
//             <select
//               value={filters.transaction_type}
//               onChange={(e) => handleFilterChange('transaction_type', e.target.value)}
//               className={`w-full px-3 py-2 rounded-lg border text-sm ${
//                 theme === 'dark'
//                   ? 'bg-gray-700 border-gray-600 text-white'
//                   : 'bg-white border-gray-300 text-gray-900'
//               }`}
//             >
//               <option value="all">All Types</option>
//               <option value="referral">Referral</option>
//               <option value="bonus">Bonus</option>
//               <option value="payout">Payout</option>
//             </select>
//           </div>

//           <div>
//             <label className={`block text-xs mb-1 ${themeClasses.muted}`}>From</label>
//             <input
//               type="date"
//               value={filters.date_from}
//               onChange={(e) => handleFilterChange('date_from', e.target.value)}
//               className={`w-full px-3 py-2 rounded-lg border text-sm ${
//                 theme === 'dark'
//                   ? 'bg-gray-700 border-gray-600 text-white'
//                   : 'bg-white border-gray-300 text-gray-900'
//               }`}
//             />
//           </div>

//           <div>
//             <label className={`block text-xs mb-1 ${themeClasses.muted}`}>To</label>
//             <input
//               type="date"
//               value={filters.date_to}
//               onChange={(e) => handleFilterChange('date_to', e.target.value)}
//               className={`w-full px-3 py-2 rounded-lg border text-sm ${
//                 theme === 'dark'
//                   ? 'bg-gray-700 border-gray-600 text-white'
//                   : 'bg-white border-gray-300 text-gray-900'
//               }`}
//             />
//           </div>
//         </div>

//         {/* Clear Filters Button */}
//         {(filters.status !== 'all' || filters.transaction_type !== 'all' || filters.date_from || filters.date_to) && (
//           <button
//             onClick={handleClearFilters}
//             className="mb-4 text-sm text-red-500 hover:text-red-600 flex items-center gap-1"
//           >
//             <FiX size={14} />
//             Clear Filters
//           </button>
//         )}

//         {/* Data Table */}
//         <DataTable
//           columns={columns}
//           data={commissions}
//           isLoading={isLoading}
//           emptyMessage="No commission transactions found"
//           theme={theme}
//           searchable={true}
//           pagination={true}
//           pageSize={10}
//         />

//         {/* Stats Summary */}
//         {stats && (
//           <div className="mt-4 pt-4 border-t border-gray-700 dark:border-gray-600">
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//               <div className="text-center">
//                 <p className={`text-xs ${themeClasses.muted}`}>Total Value</p>
//                 <p className="font-medium">{formatCurrency(stats.totalAmount, 'KES', 0)}</p>
//               </div>
//               <div className="text-center">
//                 <p className={`text-xs ${themeClasses.muted}`}>Pending</p>
//                 <p className="font-medium text-yellow-500">{stats.pendingCount}</p>
//               </div>
//               <div className="text-center">
//                 <p className={`text-xs ${themeClasses.muted}`}>Paid</p>
//                 <p className="font-medium text-green-500">{stats.paidCount}</p>
//               </div>
//               <div className="text-center">
//                 <p className={`text-xs ${themeClasses.muted}`}>Avg. Amount</p>
//                 <p className="font-medium">{formatCurrency(stats.averageAmount, 'KES', 0)}</p>
//               </div>
//             </div>
//           </div>
//         )}
//       </Card>

//       {/* Transaction Details Modal */}
//       <Modal
//         isOpen={showDetailsModal}
//         onClose={() => setShowDetailsModal(false)}
//         title="Transaction Details"
//         theme={theme}
//         size="lg"
//       >
//         {selectedTransaction && (
//           <div className="space-y-4">
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <p className={`text-sm ${themeClasses.muted}`}>Transaction ID</p>
//                 <p className="font-mono">{selectedTransaction.id}</p>
//               </div>
//               <div>
//                 <p className={`text-sm ${themeClasses.muted}`}>Reference</p>
//                 <p>{selectedTransaction.reference_id || 'N/A'}</p>
//               </div>
//               <div>
//                 <p className={`text-sm ${themeClasses.muted}`}>Type</p>
//                 <p className="capitalize">{selectedTransaction.transaction_type?.replace('_', ' ') || 'N/A'}</p>
//               </div>
//               <div>
//                 <p className={`text-sm ${themeClasses.muted}`}>Status</p>
//                 <p className={`capitalize ${getStatusColor(selectedTransaction.status)}`}>
//                   {selectedTransaction.status || 'unknown'}
//                 </p>
//               </div>
//               <div>
//                 <p className={`text-sm ${themeClasses.muted}`}>Amount</p>
//                 <p className="text-xl font-bold">
//                   {formatCurrency(selectedTransaction.amount || 0, 'KES', 0)}
//                 </p>
//               </div>
//               <div>
//                 <p className={`text-sm ${themeClasses.muted}`}>Date</p>
//                 <p>{formatDate(selectedTransaction.transaction_date, 'medium')}</p>
//               </div>
//             </div>

//             {selectedTransaction.description && (
//               <div>
//                 <p className={`text-sm ${themeClasses.muted}`}>Description</p>
//                 <p>{selectedTransaction.description}</p>
//               </div>
//             )}

//             {selectedTransaction.marketer_name && (
//               <div>
//                 <p className={`text-sm ${themeClasses.muted}`}>Marketer</p>
//                 <p>{selectedTransaction.marketer_name} ({selectedTransaction.marketer_tier})</p>
//               </div>
//             )}
//           </div>
//         )}
//       </Modal>

//       {/* Payout Modal */}
//       <Modal
//         isOpen={showPayoutModal}
//         onClose={() => {
//           setShowPayoutModal(false);
//           setPayoutData({
//             payment_method: 'mpesa',
//             payment_reference: '',
//             notes: ''
//           });
//         }}
//         title="Process Payout"
//         theme={theme}
//       >
//         {selectedTransaction && (
//           <div className="space-y-4">
//             <div className={`p-3 rounded-lg ${
//               theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-50'
//             }`}>
//               <p className="text-sm">
//                 Process payout for transaction: {selectedTransaction.reference_id}
//               </p>
//               <p className="font-medium mt-1">
//                 Amount: {formatCurrency(selectedTransaction.amount || 0, 'KES', 0)}
//               </p>
//             </div>

//             <div>
//               <label className={`block text-sm font-medium mb-2 ${themeClasses.muted}`}>
//                 Payment Method
//               </label>
//               <select
//                 value={payoutData.payment_method}
//                 onChange={(e) => setPayoutData(prev => ({ ...prev, payment_method: e.target.value }))}
//                 className={`w-full px-3 py-2 rounded-lg border ${
//                   theme === 'dark'
//                     ? 'bg-gray-700 border-gray-600 text-white'
//                     : 'bg-white border-gray-300 text-gray-900'
//                 }`}
//               >
//                 <option value="mpesa">M-Pesa</option>
//                 <option value="bank">Bank Transfer</option>
//                 <option value="cash">Cash</option>
//               </select>
//             </div>

//             <div>
//               <label className={`block text-sm font-medium mb-2 ${themeClasses.muted}`}>
//                 Payment Reference
//               </label>
//               <input
//                 type="text"
//                 value={payoutData.payment_reference}
//                 onChange={(e) => setPayoutData(prev => ({ ...prev, payment_reference: e.target.value }))}
//                 className={`w-full px-3 py-2 rounded-lg border ${
//                   theme === 'dark'
//                     ? 'bg-gray-700 border-gray-600 text-white'
//                     : 'bg-white border-gray-300 text-gray-900'
//                 }`}
//                 placeholder="Enter payment reference"
//               />
//             </div>

//             <div>
//               <label className={`block text-sm font-medium mb-2 ${themeClasses.muted}`}>
//                 Notes (Optional)
//               </label>
//               <textarea
//                 value={payoutData.notes}
//                 onChange={(e) => setPayoutData(prev => ({ ...prev, notes: e.target.value }))}
//                 className={`w-full px-3 py-2 rounded-lg border ${
//                   theme === 'dark'
//                     ? 'bg-gray-700 border-gray-600 text-white'
//                     : 'bg-white border-gray-300 text-gray-900'
//                 }`}
//                 rows="2"
//                 placeholder="Additional notes..."
//               />
//             </div>

//             <div className="flex justify-end gap-2">
//               <button
//                 onClick={() => {
//                   setShowPayoutModal(false);
//                   setPayoutData({
//                     payment_method: 'mpesa',
//                     payment_reference: '',
//                     notes: ''
//                   });
//                 }}
//                 className={`px-4 py-2 rounded-lg font-medium ${
//                   theme === 'dark'
//                     ? 'bg-gray-700 hover:bg-gray-600'
//                     : 'bg-gray-200 hover:bg-gray-300'
//                 }`}
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleMarkAsPaid}
//                 disabled={isLoading || !payoutData.payment_reference.trim()}
//                 className={`px-4 py-2 rounded-lg font-medium ${
//                   theme === 'dark'
//                     ? 'bg-green-600 hover:bg-green-700 disabled:bg-green-800'
//                     : 'bg-green-500 hover:bg-green-600 disabled:bg-green-400'
//                 } text-white`}
//               >
//                 {isLoading ? (
//                   <FaSpinner className="animate-spin inline mr-2" />
//                 ) : null}
//                 Confirm Payout
//               </button>
//             </div>
//           </div>
//         )}
//       </Modal>
//     </div>
//   );
// };

// export default CommissionTracker;









// components/ClientManagement/CommissionTracker.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  FiDollarSign,
  FiTrendingUp,
  FiUsers,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiDownload,
  FiFilter,
  FiRefreshCw,
  FiEye,
  FiEdit,
  FiX,
  FiCalendar,
  FiBarChart2
} from 'react-icons/fi';
import { FaSpinner } from 'react-icons/fa';
import Card from '../ClientManagement/UI/Card'
import Modal from '../ClientManagement/UI/Modal'
import DataTable from '../ClientManagement/UI/DataTable'
import StatsCard from '../ClientManagement/UI/StatsCard'
import CommissionService from '../ClientManagement/services/CommissionService'
import { formatCurrency, formatDate, formatPercentage } from '../ClientManagement/utils/formatters'
import { getThemeClasses, EnhancedSelect } from '../ServiceManagement/Shared/components'


const CommissionTracker = ({ marketerId, theme }) => {
  const [commissions, setCommissions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutData, setPayoutData] = useState({
    payment_method: 'mpesa',
    payment_reference: '',
    notes: ''
  });

  const [filters, setFilters] = useState({
    status: 'all',
    transaction_type: 'all',
    date_from: '',
    date_to: '',
    marketer_id: marketerId || '',
    sort_by: '-transaction_date'
  });

  const themeClasses = getThemeClasses(theme);

  // Fetch commission data
  const fetchCommissions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      const [transactionsResponse, summaryResponse] = await Promise.all([
        CommissionService.getTransactions(filters),
        CommissionService.getCommissionSummary('month')
      ]);
      setCommissions(transactionsResponse.data?.results || transactionsResponse.data || []);
      setSummary(summaryResponse.data || {
        total_balance: 0,
        total_earned: 0,
        pending_approvals: 0,
        total_marketers: 0,
        pending_payouts: 0,
        recent_transactions: []
      });
    } catch (error) {
      console.error('Error fetching commission data:', error);
      setError(error.response?.data?.error || 'Failed to load commission data');
      setCommissions([]);
      setSummary({
        total_balance: 0,
        total_earned: 0,
        pending_approvals: 0,
        total_marketers: 0,
        pending_payouts: 0,
        recent_transactions: []
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [filters]);

  // Initial load
  useEffect(() => {
    fetchCommissions();
  }, [fetchCommissions]);

  // Handle transaction approval
  const handleApproveTransaction = async (id) => {
    try {
      setIsLoading(true);
      await CommissionService.approveTransaction(id, 'Approved by admin');
      await fetchCommissions();
    } catch (error) {
      setError('Failed to approve transaction');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle mark as paid
  const handleMarkAsPaid = async () => {
    try {
      setIsLoading(true);
      await CommissionService.markAsPaid(selectedTransaction.id, payoutData);
      await fetchCommissions();
      setShowPayoutModal(false);
      setPayoutData({
        payment_method: 'mpesa',
        payment_reference: '',
        notes: ''
      });
    } catch (error) {
      setError('Failed to mark as paid');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle filter change
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  // Export commission report
  const handleExportReport = async () => {
    try {
      setIsLoading(true);
      await CommissionService.exportCommissionReport('csv', filters);
    } catch (error) {
      setError('Failed to export report');
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh data
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchCommissions();
  };

  // Clear filters
  const handleClearFilters = () => {
    setFilters({
      status: 'all',
      transaction_type: 'all',
      date_from: '',
      date_to: '',
      marketer_id: marketerId || '',
      sort_by: '-transaction_date'
    });
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      pending: themeClasses.text.warning,
      approved: themeClasses.text.info,
      paid: themeClasses.text.success,
      rejected: themeClasses.text.danger,
      cancelled: themeClasses.text.secondary,
      hold: 'text-orange-500'
    };
    return colors[status] || themeClasses.text.secondary;
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <FiClock className={themeClasses.text.warning} />;
      case 'approved': return <FiCheckCircle className={themeClasses.text.info} />;
      case 'paid': return <FiCheckCircle className={themeClasses.text.success} />;
      case 'rejected': return <FiX className={themeClasses.text.danger} />;
      default: return <FiAlertCircle className={themeClasses.text.secondary} />;
    }
  };

  // Calculate filtered stats
  const filteredStats = useCallback(() => {
    if (!commissions.length) return null;
    const totalAmount = commissions.reduce((sum, t) => sum + (t.amount || 0), 0);
    const pendingCount = commissions.filter(t => t.status === 'pending').length;
    const paidCount = commissions.filter(t => t.status === 'paid').length;
    const approvedCount = commissions.filter(t => t.status === 'approved').length;
    return {
      totalAmount,
      pendingCount,
      paidCount,
      approvedCount,
      averageAmount: totalAmount / commissions.length
    };
  }, [commissions]);

  const stats = filteredStats();

  // Table columns
  const columns = [
    {
      header: 'ID',
      accessor: 'reference_id',
      cell: (value) => (
        <span className="font-mono text-xs opacity-75">{value || 'N/A'}</span>
      )
    },
    {
      header: 'Marketer',
      accessor: 'marketer_name',
      cell: (value, row) => (
        <div>
          <p className={`font-medium ${themeClasses.text.primary}`}>{value || 'Unknown'}</p>
          <p className={`text-xs opacity-75 ${themeClasses.text.secondary}`}>{row.marketer_tier || 'N/A'}</p>
        </div>
      )
    },
    {
      header: 'Type',
      accessor: 'transaction_type',
      cell: (value) => (
        <span className={`capitalize ${themeClasses.text.secondary}`}>{value?.replace('_', ' ') || 'N/A'}</span>
      )
    },
    {
      header: 'Amount',
      accessor: 'amount',
      cell: (value) => (
        <span className={`font-medium ${themeClasses.text.primary}`}>{formatCurrency(value || 0, 'KES', 0)}</span>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (value) => (
        <div className="flex items-center gap-2">
          {getStatusIcon(value)}
          <span className={`capitalize ${getStatusColor(value)}`}>
            {value || 'unknown'}
          </span>
        </div>
      )
    },
    {
      header: 'Date',
      accessor: 'transaction_date',
      cell: (value) => (
        <span className={themeClasses.text.secondary}>{formatDate(value, 'short')}</span>
      )
    },
    {
      header: 'Actions',
      cell: (value, row) => (
        <div className="flex gap-2">
          <button
            onClick={() => {
              setSelectedTransaction(row);
              setShowDetailsModal(true);
            }}
            className={`p-1.5 rounded ${themeClasses.button.secondary}`}
            title="View Details"
          >
            <FiEye size={14} />
          </button>
          {row.status === 'pending' && (
            <button
              onClick={() => handleApproveTransaction(row.id)}
              className={`p-1.5 rounded ${themeClasses.button.success}`}
              title="Approve"
            >
              <FiCheckCircle size={14} className="text-green-500" />
            </button>
          )}
          {row.status === 'approved' && (
            <button
              onClick={() => {
                setSelectedTransaction(row);
                setShowPayoutModal(true);
              }}
              className={`p-1.5 rounded ${themeClasses.button.primary}`}
              title="Mark as Paid"
            >
              <FiDollarSign size={14} className="text-blue-500" />
            </button>
          )}
        </div>
      )
    }
  ];

  if (isLoading && !commissions.length) {
    return (
      <Card theme={theme} className="text-center p-8">
        <FaSpinner className="animate-spin text-2xl mx-auto mb-4 text-blue-500" />
        <p className={themeClasses.text.secondary}>Loading commission data...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <Card theme={theme} className={themeClasses.bg.danger}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiAlertCircle className="text-red-500" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError('')}
              className="p-1 rounded hover:bg-red-800/30 dark:hover:bg-red-800/30"
            >
              <FiX size={16} />
            </button>
          </div>
        </Card>
      )}
      {/* Summary Cards - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Balance"
          value={formatCurrency(summary?.total_balance || 0, 'KES', 0)}
          icon={FiDollarSign}
          color="green"
          theme={theme}
        />
        <StatsCard
          title="Total Earned"
          value={formatCurrency(summary?.total_earned || 0, 'KES', 0)}
          icon={FiTrendingUp}
          color="blue"
          theme={theme}
        />
        <StatsCard
          title="Pending Approvals"
          value={summary?.pending_approvals || 0}
          icon={FiClock}
          color="yellow"
          theme={theme}
        />
        <StatsCard
          title="Active Marketers"
          value={summary?.total_marketers || 0}
          icon={FiUsers}
          color="purple"
          theme={theme}
        />
      </div>
      {/* Filter and Controls */}
      <Card theme={theme}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <h3 className={`font-semibold ${themeClasses.text.primary}`}>
            Commission Transactions
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportReport}
              disabled={isLoading}
              className={`${themeClasses.button.success} flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium`}
            >
              <FiDownload size={14} />
              Export
            </button>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`${themeClasses.button.primary} flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium`}
            >
              {isRefreshing ? (
                <FaSpinner className="animate-spin" size={14} />
              ) : (
                <FiRefreshCw size={14} />
              )}
              Refresh
            </button>
          </div>
        </div>
        {/* Filter Controls - Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div>
            <label className={`block text-xs mb-1 ${themeClasses.text.secondary}`}>Status</label>
            <EnhancedSelect
              value={filters.status}
              onChange={(value) => handleFilterChange('status', value)}
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'pending', label: 'Pending' },
                { value: 'approved', label: 'Approved' },
                { value: 'paid', label: 'Paid' },
                { value: 'rejected', label: 'Rejected' }
              ]}
              theme={theme}
            />
          </div>
          <div>
            <label className={`block text-xs mb-1 ${themeClasses.text.secondary}`}>Type</label>
            <EnhancedSelect
              value={filters.transaction_type}
              onChange={(value) => handleFilterChange('transaction_type', value)}
              options={[
                { value: 'all', label: 'All Types' },
                { value: 'referral', label: 'Referral' },
                { value: 'bonus', label: 'Bonus' },
                { value: 'payout', label: 'Payout' }
              ]}
              theme={theme}
            />
          </div>
          <div>
            <label className={`block text-xs mb-1 ${themeClasses.text.secondary}`}>From</label>
            <input
              type="date"
              value={filters.date_from}
              onChange={(e) => handleFilterChange('date_from', e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border text-sm ${themeClasses.input}`}
            />
          </div>
          <div>
            <label className={`block text-xs mb-1 ${themeClasses.text.secondary}`}>To</label>
            <input
              type="date"
              value={filters.date_to}
              onChange={(e) => handleFilterChange('date_to', e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border text-sm ${themeClasses.input}`}
            />
          </div>
        </div>
        {/* Clear Filters Button */}
        {(filters.status !== 'all' || filters.transaction_type !== 'all' || filters.date_from || filters.date_to) && (
          <button
            onClick={handleClearFilters}
            className="mb-4 text-sm text-red-500 hover:text-red-600 flex items-center gap-1"
          >
            <FiX size={14} />
            Clear Filters
          </button>
        )}
        {/* Data Table - Responsive */}
        <DataTable
          columns={columns}
          data={commissions}
          isLoading={isLoading}
          emptyMessage="No commission transactions found"
          theme={theme}
          searchable={true}
          pagination={true}
          pageSize={10}
        />
        {/* Stats Summary */}
        {stats && (
          <div className="mt-4 pt-4 border-t border-gray-700 dark:border-gray-600">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className={`text-xs ${themeClasses.text.secondary}`}>Total Value</p>
                <p className={`font-medium ${themeClasses.text.primary}`}>{formatCurrency(stats.totalAmount, 'KES', 0)}</p>
              </div>
              <div className="text-center">
                <p className={`text-xs ${themeClasses.text.secondary}`}>Pending</p>
                <p className={`font-medium ${themeClasses.text.warning}`}>{stats.pendingCount}</p>
              </div>
              <div className="text-center">
                <p className={`text-xs ${themeClasses.text.secondary}`}>Paid</p>
                <p className={`font-medium ${themeClasses.text.success}`}>{stats.paidCount}</p>
              </div>
              <div className="text-center">
                <p className={`text-xs ${themeClasses.text.secondary}`}>Avg. Amount</p>
                <p className={`font-medium ${themeClasses.text.primary}`}>{formatCurrency(stats.averageAmount, 'KES', 0)}</p>
              </div>
            </div>
          </div>
        )}
      </Card>
      {/* Transaction Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Transaction Details"
        theme={theme}
        size="lg"
      >
        {selectedTransaction && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className={`text-sm ${themeClasses.text.secondary}`}>Transaction ID</p>
                <p className={`font-mono ${themeClasses.text.primary}`}>{selectedTransaction.id}</p>
              </div>
              <div>
                <p className={`text-sm ${themeClasses.text.secondary}`}>Reference</p>
                <p className={themeClasses.text.primary}>{selectedTransaction.reference_id || 'N/A'}</p>
              </div>
              <div>
                <p className={`text-sm ${themeClasses.text.secondary}`}>Type</p>
                <p className={`capitalize ${themeClasses.text.primary}`}>{selectedTransaction.transaction_type?.replace('_', ' ') || 'N/A'}</p>
              </div>
              <div>
                <p className={`text-sm ${themeClasses.text.secondary}`}>Status</p>
                <p className={`capitalize ${getStatusColor(selectedTransaction.status)}`}>
                  {selectedTransaction.status || 'unknown'}
                </p>
              </div>
              <div>
                <p className={`text-sm ${themeClasses.text.secondary}`}>Amount</p>
                <p className={`text-xl font-bold ${themeClasses.text.primary}`}>
                  {formatCurrency(selectedTransaction.amount || 0, 'KES', 0)}
                </p>
              </div>
              <div>
                <p className={`text-sm ${themeClasses.text.secondary}`}>Date</p>
                <p className={themeClasses.text.primary}>{formatDate(selectedTransaction.transaction_date, 'medium')}</p>
              </div>
            </div>
            {selectedTransaction.description && (
              <div>
                <p className={`text-sm ${themeClasses.text.secondary}`}>Description</p>
                <p className={themeClasses.text.primary}>{selectedTransaction.description}</p>
              </div>
            )}
            {selectedTransaction.marketer_name && (
              <div>
                <p className={`text-sm ${themeClasses.text.secondary}`}>Marketer</p>
                <p className={themeClasses.text.primary}>{selectedTransaction.marketer_name} ({selectedTransaction.marketer_tier})</p>
              </div>
            )}
            {selectedTransaction.payment_method && (
              <div>
                <p className={`text-sm ${themeClasses.text.secondary}`}>Payment Method</p>
                <p className={themeClasses.text.primary}>{selectedTransaction.payment_method}</p>
              </div>
            )}
            {selectedTransaction.payment_reference && (
              <div>
                <p className={`text-sm ${themeClasses.text.secondary}`}>Payment Reference</p>
                <p className={themeClasses.text.primary}>{selectedTransaction.payment_reference}</p>
              </div>
            )}
            {selectedTransaction.notes && (
              <div>
                <p className={`text-sm ${themeClasses.text.secondary}`}>Notes</p>
                <p className={themeClasses.text.primary}>{selectedTransaction.notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
      {/* Payout Modal */}
      <Modal
        isOpen={showPayoutModal}
        onClose={() => {
          setShowPayoutModal(false);
          setPayoutData({
            payment_method: 'mpesa',
            payment_reference: '',
            notes: ''
          });
        }}
        title="Process Payout"
        theme={theme}
      >
        {selectedTransaction && (
          <div className="space-y-4">
            <div className={`p-3 rounded-lg ${themeClasses.bg.info}`}>
              <p className="text-sm">
                Process payout for transaction: {selectedTransaction.reference_id}
              </p>
              <p className="font-medium mt-1">
                Amount: {formatCurrency(selectedTransaction.amount || 0, 'KES', 0)}
              </p>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
                Payment Method
              </label>
              <EnhancedSelect
                value={payoutData.payment_method}
                onChange={(value) => setPayoutData(prev => ({ ...prev, payment_method: value }))}
                options={[
                  { value: 'mpesa', label: 'M-Pesa' },
                  { value: 'bank', label: 'Bank Transfer' },
                  { value: 'cash', label: 'Cash' }
                ]}
                theme={theme}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
                Payment Reference
              </label>
              <input
                type="text"
                value={payoutData.payment_reference}
                onChange={(e) => setPayoutData(prev => ({ ...prev, payment_reference: e.target.value }))}
                className={`w-full px-3 py-2 rounded-lg border ${themeClasses.input}`}
                placeholder="Enter payment reference"
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
                Notes (Optional)
              </label>
              <textarea
                value={payoutData.notes}
                onChange={(e) => setPayoutData(prev => ({ ...prev, notes: e.target.value }))}
                className={`w-full px-3 py-2 rounded-lg border ${themeClasses.input}`}
                rows="2"
                placeholder="Additional notes..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowPayoutModal(false);
                  setPayoutData({
                    payment_method: 'mpesa',
                    payment_reference: '',
                    notes: ''
                  });
                }}
                className={`${themeClasses.button.secondary} px-4 py-2 rounded-lg font-medium`}
              >
                Cancel
              </button>
              <button
                onClick={handleMarkAsPaid}
                disabled={isLoading || !payoutData.payment_reference.trim()}
                className={`${themeClasses.button.success} px-4 py-2 rounded-lg font-medium`}
              >
                {isLoading ? (
                  <FaSpinner className="animate-spin inline mr-2" />
                ) : null}
                Confirm Payout
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CommissionTracker;