


// import React, { useState } from 'react';
// import {
//   DollarSign, TrendingUp, Users, CheckCircle,
//   Clock, AlertCircle, Download, Filter,
//   RefreshCw, Eye, Check, X, Calendar
// } from 'lucide-react';
// import { FaSpinner } from 'react-icons/fa';
// import Card from './UI/Card'
// import Modal from './UI/Modal';
// import DataTable from './UI/DataTable';
// import StatsCard from './UI/StatsCard';
// import { EnhancedSelect, getThemeClasses } from '../ServiceManagement/Shared/components';
// import useCommission from './hooks/useCommission'
// import { formatCurrency, formatDate } from './utils/formatters';
// import { COMMISSION_STATUS, COMMISSION_TYPES, PAYMENT_METHODS } from './constants/clientConstants';

// const CommissionTracker = ({ marketerId, theme }) => {
//   const {
//     transactions,
//     summary,
//     payouts,
//     marketerPerformance,
//     isLoading,
//     isRefreshing,
//     error,
//     filters,
//     pagination,
//     stats,
//     handleFilterChange,
//     handlePageChange,
//     handlePageSizeChange,
//     handleRefresh,
//     approveTransaction,
//     markAsPaid,
//     processPayout
//   } = useCommission(marketerId);

//   const [selectedTransaction, setSelectedTransaction] = useState(null);
//   const [showDetailsModal, setShowDetailsModal] = useState(false);
//   const [showPayoutModal, setShowPayoutModal] = useState(false);
//   const [showApproveModal, setShowApproveModal] = useState(false);
//   const [payoutData, setPayoutData] = useState({
//     payment_method: 'mpesa',
//     payment_reference: '',
//     notes: ''
//   });
//   const [approveNotes, setApproveNotes] = useState('');

//   const themeClasses = getThemeClasses(theme);

//   // Status options for EnhancedSelect
//   const statusOptions = [
//     { value: 'all', label: 'All Status' },
//     ...Object.entries(COMMISSION_STATUS).map(([value, { label }]) => ({
//       value,
//       label
//     }))
//   ];

//   // Type options for EnhancedSelect
//   const typeOptions = [
//     { value: 'all', label: 'All Types' },
//     ...Object.entries(COMMISSION_TYPES).map(([value, { label }]) => ({
//       value,
//       label
//     }))
//   ];

//   // Payment method options for EnhancedSelect
//   const paymentMethodOptions = Object.entries(PAYMENT_METHODS).map(([value, label]) => ({
//     value,
//     label
//   }));

//   // Page size options
//   const pageSizeOptions = [10, 20, 50, 100].map(size => ({
//     value: size,
//     label: `${size} per page`
//   }));

//   // Get status color and icon
//   const getStatusConfig = (status) => {
//     const config = {
//       pending: { color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/30', icon: Clock },
//       approved: { color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30', icon: CheckCircle },
//       paid: { color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30', icon: DollarSign },
//       rejected: { color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30', icon: X },
//       cancelled: { color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-800', icon: X },
//       hold: { color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/30', icon: AlertCircle }
//     };
//     return config[status] || config.pending;
//   };

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
//           <p className={`font-medium ${themeClasses.text.primary}`}>{value || 'Unknown'}</p>
//           <p className={`text-xs opacity-75 ${themeClasses.text.secondary}`}>
//             {row.marketer_tier || 'N/A'}
//           </p>
//         </div>
//       ),
//       sortable: true
//     },
//     {
//       header: 'Type',
//       accessor: 'transaction_type',
//       cell: (value) => {
//         const config = COMMISSION_TYPES[value] || { label: value };
//         return (
//           <span className={`capitalize ${themeClasses.text.secondary}`}>
//             {config.label}
//           </span>
//         );
//       },
//       sortable: true
//     },
//     {
//       header: 'Amount',
//       accessor: 'amount',
//       cell: (value) => (
//         <span className={`font-medium ${themeClasses.text.primary}`}>
//           {formatCurrency(value || 0)}
//         </span>
//       ),
//       sortable: true
//     },
//     {
//       header: 'Status',
//       accessor: 'status',
//       cell: (value) => {
//         const config = getStatusConfig(value);
//         const Icon = config.icon;
//         return (
//           <div className="flex items-center gap-2">
//             <Icon size={14} className={config.color} />
//             <span className={`capitalize ${config.color}`}>
//               {value || 'unknown'}
//             </span>
//           </div>
//         );
//       },
//       sortable: true
//     },
//     {
//       header: 'Date',
//       accessor: 'transaction_date',
//       cell: (value) => (
//         <span className={themeClasses.text.secondary}>
//           {formatDate(value, 'short')}
//         </span>
//       ),
//       sortable: true
//     },
//     {
//       header: 'Actions',
//       cell: (value, row) => {
//         const statusConfig = getStatusConfig(row.status);
//         const StatusIcon = statusConfig.icon;
        
//         return (
//           <div className="flex gap-2">
//             <button
//               onClick={() => {
//                 setSelectedTransaction(row);
//                 setShowDetailsModal(true);
//               }}
//               className={`p-1.5 rounded ${themeClasses.button.secondary}`}
//               title="View Details"
//             >
//               <Eye size={14} />
//             </button>
            
//             {row.status === 'pending' && (
//               <button
//                 onClick={() => {
//                   setSelectedTransaction(row);
//                   setShowApproveModal(true);
//                 }}
//                 className={`p-1.5 rounded ${themeClasses.button.success}`}
//                 title="Approve"
//               >
//                 <Check size={14} className="text-green-500" />
//               </button>
//             )}
            
//             {row.status === 'approved' && (
//               <button
//                 onClick={() => {
//                   setSelectedTransaction(row);
//                   setShowPayoutModal(true);
//                 }}
//                 className={`p-1.5 rounded ${themeClasses.button.primary}`}
//                 title="Mark as Paid"
//               >
//                 <DollarSign size={14} className="text-blue-500" />
//               </button>
//             )}
//           </div>
//         );
//       }
//     }
//   ];

//   // Handle approve
//   const handleApprove = async () => {
//     const result = await approveTransaction(selectedTransaction.id, approveNotes);
//     if (result.success) {
//       setShowApproveModal(false);
//       setApproveNotes('');
//       setSelectedTransaction(null);
//     }
//   };

//   // Handle mark as paid
//   const handleMarkAsPaid = async () => {
//     const result = await markAsPaid(selectedTransaction.id, payoutData);
//     if (result.success) {
//       setShowPayoutModal(false);
//       setPayoutData({
//         payment_method: 'mpesa',
//         payment_reference: '',
//         notes: ''
//       });
//       setSelectedTransaction(null);
//     }
//   };

//   if (isLoading && !transactions.length) {
//     return (
//       <Card theme={theme} className="text-center p-8">
//         <FaSpinner className="animate-spin text-2xl mx-auto mb-4 text-blue-500" />
//         <p className={themeClasses.text.secondary}>Loading commission data...</p>
//       </Card>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {/* Summary Cards */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//         <StatsCard
//           title="Total Balance"
//           value={formatCurrency(summary?.total_balance || 0)}
//           icon={DollarSign}
//           color="green"
//           theme={theme}
//         />
//         <StatsCard
//           title="Total Earned"
//           value={formatCurrency(summary?.total_earned || 0)}
//           icon={TrendingUp}
//           color="blue"
//           theme={theme}
//         />
//         <StatsCard
//           title="Pending Approvals"
//           value={summary?.pending_approvals || 0}
//           icon={Clock}
//           color="yellow"
//           theme={theme}
//         />
//         <StatsCard
//           title="Active Marketers"
//           value={summary?.total_marketers || 0}
//           icon={Users}
//           color="purple"
//           theme={theme}
//         />
//       </div>

//       {/* Filters and Controls */}
//       <Card theme={theme}>
//         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
//           <h3 className={`font-semibold ${themeClasses.text.primary}`}>
//             Commission Transactions
//           </h3>
//           <div className="flex items-center gap-2">
//             <button
//               onClick={handleRefresh}
//               disabled={isRefreshing}
//               className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${themeClasses.button.primary}`}
//             >
//               {isRefreshing ? (
//                 <FaSpinner className="animate-spin" size={14} />
//               ) : (
//                 <RefreshCw size={14} />
//               )}
//               Refresh
//             </button>
//           </div>
//         </div>

//         {/* Filter Controls */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
//           <div>
//             <label className={`block text-xs mb-1 ${themeClasses.text.secondary}`}>Status</label>
//             <EnhancedSelect
//               value={filters.status || 'all'}
//               onChange={(value) => handleFilterChange('status', value)}
//               options={statusOptions}
//               theme={theme}
//             />
//           </div>
//           <div>
//             <label className={`block text-xs mb-1 ${themeClasses.text.secondary}`}>Type</label>
//             <EnhancedSelect
//               value={filters.transaction_type || 'all'}
//               onChange={(value) => handleFilterChange('transaction_type', value)}
//               options={typeOptions}
//               theme={theme}
//             />
//           </div>
//           <div>
//             <label className={`block text-xs mb-1 ${themeClasses.text.secondary}`}>From</label>
//             <input
//               type="date"
//               value={filters.date_from || ''}
//               onChange={(e) => handleFilterChange('date_from', e.target.value)}
//               className={`w-full px-3 py-2 rounded-lg border text-sm ${themeClasses.input}`}
//             />
//           </div>
//           <div>
//             <label className={`block text-xs mb-1 ${themeClasses.text.secondary}`}>To</label>
//             <input
//               type="date"
//               value={filters.date_to || ''}
//               onChange={(e) => handleFilterChange('date_to', e.target.value)}
//               className={`w-full px-3 py-2 rounded-lg border text-sm ${themeClasses.input}`}
//             />
//           </div>
//         </div>

//         {/* Page Size Selector */}
//         <div className="flex justify-end mb-4">
//           <div className="w-48">
//             <EnhancedSelect
//               value={pagination.pageSize}
//               onChange={handlePageSizeChange}
//               options={pageSizeOptions}
//               theme={theme}
//             />
//           </div>
//         </div>

//         {/* Data Table */}
//         <DataTable
//           columns={columns}
//           data={transactions}
//           isLoading={isLoading}
//           pagination={true}
//           searchable={true}
//           pageSize={pagination.pageSize}
//           currentPage={pagination.currentPage}
//           totalPages={pagination.totalPages}
//           onPageChange={handlePageChange}
//           emptyMessage="No commission transactions found"
//           theme={theme}
//         />

//         {/* Stats Summary */}
//         {stats && (
//           <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//               <div className="text-center">
//                 <p className={`text-xs ${themeClasses.text.secondary}`}>Total Value</p>
//                 <p className={`font-medium ${themeClasses.text.primary}`}>
//                   {formatCurrency(stats.totalAmount)}
//                 </p>
//               </div>
//               <div className="text-center">
//                 <p className={`text-xs ${themeClasses.text.secondary}`}>Pending</p>
//                 <p className={`font-medium text-yellow-500`}>{stats.pendingCount}</p>
//               </div>
//               <div className="text-center">
//                 <p className={`text-xs ${themeClasses.text.secondary}`}>Paid</p>
//                 <p className={`font-medium text-green-500`}>{stats.paidCount}</p>
//               </div>
//               <div className="text-center">
//                 <p className={`text-xs ${themeClasses.text.secondary}`}>Avg Amount</p>
//                 <p className={`font-medium ${themeClasses.text.primary}`}>
//                   {formatCurrency(stats.averageAmount)}
//                 </p>
//               </div>
//             </div>
//           </div>
//         )}
//       </Card>

//       {/* Details Modal */}
//       <Modal
//         isOpen={showDetailsModal}
//         onClose={() => {
//           setShowDetailsModal(false);
//           setSelectedTransaction(null);
//         }}
//         title="Transaction Details"
//         theme={theme}
//         size="lg"
//       >
//         {selectedTransaction && (
//           <div className="space-y-4">
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <p className={`text-sm ${themeClasses.text.secondary}`}>Transaction ID</p>
//                 <p className="font-mono">{selectedTransaction.id}</p>
//               </div>
//               <div>
//                 <p className={`text-sm ${themeClasses.text.secondary}`}>Reference</p>
//                 <p>{selectedTransaction.reference_id || 'N/A'}</p>
//               </div>
//               <div>
//                 <p className={`text-sm ${themeClasses.text.secondary}`}>Type</p>
//                 <p className="capitalize">{selectedTransaction.transaction_type}</p>
//               </div>
//               <div>
//                 <p className={`text-sm ${themeClasses.text.secondary}`}>Status</p>
//                 <p className={`capitalize ${getStatusConfig(selectedTransaction.status).color}`}>
//                   {selectedTransaction.status}
//                 </p>
//               </div>
//               <div>
//                 <p className={`text-sm ${themeClasses.text.secondary}`}>Amount</p>
//                 <p className="text-xl font-bold">{formatCurrency(selectedTransaction.amount)}</p>
//               </div>
//               <div>
//                 <p className={`text-sm ${themeClasses.text.secondary}`}>Date</p>
//                 <p>{formatDate(selectedTransaction.transaction_date, 'medium')}</p>
//               </div>
//             </div>

//             {selectedTransaction.description && (
//               <div>
//                 <p className={`text-sm ${themeClasses.text.secondary}`}>Description</p>
//                 <p>{selectedTransaction.description}</p>
//               </div>
//             )}

//             {selectedTransaction.marketer_name && (
//               <div>
//                 <p className={`text-sm ${themeClasses.text.secondary}`}>Marketer</p>
//                 <p>{selectedTransaction.marketer_name} ({selectedTransaction.marketer_tier})</p>
//               </div>
//             )}

//             {selectedTransaction.payment_method && (
//               <div>
//                 <p className={`text-sm ${themeClasses.text.secondary}`}>Payment Method</p>
//                 <p className="capitalize">{selectedTransaction.payment_method}</p>
//               </div>
//             )}

//             {selectedTransaction.payment_reference && (
//               <div>
//                 <p className={`text-sm ${themeClasses.text.secondary}`}>Payment Reference</p>
//                 <p>{selectedTransaction.payment_reference}</p>
//               </div>
//             )}

//             {selectedTransaction.notes && selectedTransaction.notes.length > 0 && (
//               <div>
//                 <p className={`text-sm ${themeClasses.text.secondary}`}>Notes</p>
//                 <div className="space-y-2">
//                   {selectedTransaction.notes.map((note, index) => (
//                     <div key={index} className={`p-2 rounded ${themeClasses.bg.secondary}`}>
//                       <p className="text-xs opacity-75">
//                         {note.timestamp && formatDate(note.timestamp, 'datetime')}
//                       </p>
//                       <p className="text-sm">{note.note || note}</p>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </div>
//         )}
//       </Modal>

//       {/* Approve Modal */}
//       <Modal
//         isOpen={showApproveModal}
//         onClose={() => {
//           setShowApproveModal(false);
//           setApproveNotes('');
//           setSelectedTransaction(null);
//         }}
//         title="Approve Transaction"
//         theme={theme}
//       >
//         {selectedTransaction && (
//           <div className="space-y-4">
//             <div className={`p-3 rounded-lg ${themeClasses.bg.info}`}>
//               <p className="text-sm">
//                 Approve transaction for {selectedTransaction.marketer_name}
//               </p>
//               <p className="font-medium mt-1">
//                 Amount: {formatCurrency(selectedTransaction.amount)}
//               </p>
//             </div>
//             <div>
//               <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
//                 Notes (Optional)
//               </label>
//               <textarea
//                 value={approveNotes}
//                 onChange={(e) => setApproveNotes(e.target.value)}
//                 className={`w-full px-3 py-2 rounded-lg border ${themeClasses.input}`}
//                 rows="3"
//                 placeholder="Add approval notes..."
//               />
//             </div>
//             <div className="flex justify-end gap-2">
//               <button
//                 onClick={() => {
//                   setShowApproveModal(false);
//                   setApproveNotes('');
//                 }}
//                 className={`px-4 py-2 rounded-lg font-medium ${themeClasses.button.secondary}`}
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleApprove}
//                 className={`px-4 py-2 rounded-lg font-medium ${themeClasses.button.success}`}
//               >
//                 Approve Transaction
//               </button>
//             </div>
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
//           setSelectedTransaction(null);
//         }}
//         title="Process Payout"
//         theme={theme}
//       >
//         {selectedTransaction && (
//           <div className="space-y-4">
//             <div className={`p-3 rounded-lg ${themeClasses.bg.info}`}>
//               <p className="text-sm">
//                 Process payout for {selectedTransaction.marketer_name}
//               </p>
//               <p className="font-medium mt-1">
//                 Amount: {formatCurrency(selectedTransaction.amount)}
//               </p>
//             </div>
//             <div>
//               <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
//                 Payment Method
//               </label>
//               <EnhancedSelect
//                 value={payoutData.payment_method}
//                 onChange={(value) => setPayoutData(prev => ({ ...prev, payment_method: value }))}
//                 options={paymentMethodOptions}
//                 theme={theme}
//               />
//             </div>
//             <div>
//               <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
//                 Payment Reference
//               </label>
//               <input
//                 type="text"
//                 value={payoutData.payment_reference}
//                 onChange={(e) => setPayoutData(prev => ({ ...prev, payment_reference: e.target.value }))}
//                 className={`w-full px-3 py-2 rounded-lg border ${themeClasses.input}`}
//                 placeholder="Enter M-Pesa transaction ID or reference"
//               />
//             </div>
//             <div>
//               <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
//                 Notes (Optional)
//               </label>
//               <textarea
//                 value={payoutData.notes}
//                 onChange={(e) => setPayoutData(prev => ({ ...prev, notes: e.target.value }))}
//                 className={`w-full px-3 py-2 rounded-lg border ${themeClasses.input}`}
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
//                 className={`px-4 py-2 rounded-lg font-medium ${themeClasses.button.secondary}`}
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleMarkAsPaid}
//                 disabled={!payoutData.payment_reference.trim()}
//                 className={`px-4 py-2 rounded-lg font-medium ${themeClasses.button.success} ${
//                   !payoutData.payment_reference.trim() ? 'opacity-50 cursor-not-allowed' : ''
//                 }`}
//               >
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









import React, { useState } from 'react';
import {
  DollarSign, TrendingUp, Users, CheckCircle,
  Clock, AlertCircle, Download, RefreshCw,
  Eye, Check, X, Calendar
} from 'lucide-react';
import { FaSpinner } from 'react-icons/fa';
import { EnhancedSelect, getThemeClasses } from '../ServiceManagement/Shared/components'
import useCommission from './hooks/useCommission'
import { formatCurrency, formatDate } from './utils/formatters'
import { COMMISSION_STATUS, COMMISSION_TYPES, PAYMENT_METHODS } from './constants/clientConstants'

const CommissionTracker = ({ marketerId, theme }) => {
  const {
    transactions,
    summary,
    payouts,
    marketerPerformance,
    isLoading,
    isRefreshing,
    error,
    filters,
    pagination,
    stats,
    handleFilterChange,
    handlePageChange,
    handlePageSizeChange,
    handleRefresh,
    approveTransaction,
    markAsPaid,
    processPayout
  } = useCommission(marketerId);

  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [payoutData, setPayoutData] = useState({
    payment_method: 'mpesa',
    payment_reference: '',
    notes: ''
  });
  const [approveNotes, setApproveNotes] = useState('');

  const themeClasses = getThemeClasses(theme);

  // Modal component
  const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div className={`w-full max-w-md rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
          <div className={`p-4 border-b flex justify-between items-center ${themeClasses.border.light}`}>
            <h3 className={`font-semibold ${themeClasses.text.primary}`}>{title}</h3>
            <button onClick={onClose} className={`p-1 rounded ${themeClasses.button.secondary}`}>
              <X size={18} />
            </button>
          </div>
          <div className="p-4 max-h-[80vh] overflow-y-auto">{children}</div>
        </div>
      </div>
    );
  };

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    ...Object.entries(COMMISSION_STATUS).map(([value, { label }]) => ({
      value,
      label
    }))
  ];

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    ...Object.entries(COMMISSION_TYPES).map(([value, { label }]) => ({
      value,
      label
    }))
  ];

  const paymentMethodOptions = Object.entries(PAYMENT_METHODS).map(([value, label]) => ({
    value,
    label
  }));

  const pageSizeOptions = [10, 20, 50, 100].map(size => ({
    value: size,
    label: `${size} per page`
  }));

  const getStatusConfig = (status) => {
    const config = {
      pending: { color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/30', icon: Clock },
      approved: { color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30', icon: CheckCircle },
      paid: { color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30', icon: DollarSign },
      rejected: { color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30', icon: X },
      cancelled: { color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-800', icon: X },
      hold: { color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/30', icon: AlertCircle }
    };
    return config[status] || config.pending;
  };

  const handleApprove = async () => {
    const result = await approveTransaction(selectedTransaction.id, approveNotes);
    if (result.success) {
      setShowApproveModal(false);
      setApproveNotes('');
      setSelectedTransaction(null);
    }
  };

  const handleMarkAsPaid = async () => {
    const result = await markAsPaid(selectedTransaction.id, payoutData);
    if (result.success) {
      setShowPayoutModal(false);
      setPayoutData({
        payment_method: 'mpesa',
        payment_reference: '',
        notes: ''
      });
      setSelectedTransaction(null);
    }
  };

  if (isLoading && !transactions.length) {
    return (
      <div className={`rounded-xl border p-8 text-center ${themeClasses.bg.card}`}>
        <FaSpinner className="animate-spin text-2xl mx-auto mb-4 text-blue-500" />
        <p className={themeClasses.text.secondary}>Loading commission data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-4 rounded-xl border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className={`text-sm font-medium ${themeClasses.text.secondary}`}>Total Balance</h3>
            <DollarSign size={18} className="text-green-500" />
          </div>
          <p className={`text-2xl font-bold ${themeClasses.text.primary}`}>
            {formatCurrency(summary?.total_balance || 0)}
          </p>
        </div>

        <div className={`p-4 rounded-xl border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className={`text-sm font-medium ${themeClasses.text.secondary}`}>Total Earned</h3>
            <TrendingUp size={18} className="text-blue-500" />
          </div>
          <p className={`text-2xl font-bold ${themeClasses.text.primary}`}>
            {formatCurrency(summary?.total_earned || 0)}
          </p>
        </div>

        <div className={`p-4 rounded-xl border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className={`text-sm font-medium ${themeClasses.text.secondary}`}>Pending Approvals</h3>
            <Clock size={18} className="text-yellow-500" />
          </div>
          <p className={`text-2xl font-bold ${themeClasses.text.primary}`}>
            {summary?.pending_approvals || 0}
          </p>
        </div>

        <div className={`p-4 rounded-xl border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className={`text-sm font-medium ${themeClasses.text.secondary}`}>Active Marketers</h3>
            <Users size={18} className="text-purple-500" />
          </div>
          <p className={`text-2xl font-bold ${themeClasses.text.primary}`}>
            {summary?.total_marketers || 0}
          </p>
        </div>
      </div>

      <div className={`p-6 rounded-xl border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <h3 className={`font-semibold ${themeClasses.text.primary}`}>
            Commission Transactions
          </h3>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${themeClasses.button.primary}`}
          >
            {isRefreshing ? (
              <FaSpinner className="animate-spin" size={14} />
            ) : (
              <RefreshCw size={14} />
            )}
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
          <div>
            <label className={`block text-xs mb-1 ${themeClasses.text.secondary}`}>Status</label>
            <EnhancedSelect
              value={filters.status || 'all'}
              onChange={(value) => handleFilterChange('status', value)}
              options={statusOptions}
              theme={theme}
            />
          </div>
          <div>
            <label className={`block text-xs mb-1 ${themeClasses.text.secondary}`}>Type</label>
            <EnhancedSelect
              value={filters.transaction_type || 'all'}
              onChange={(value) => handleFilterChange('transaction_type', value)}
              options={typeOptions}
              theme={theme}
            />
          </div>
          <div>
            <label className={`block text-xs mb-1 ${themeClasses.text.secondary}`}>From</label>
            <input
              type="date"
              value={filters.date_from || ''}
              onChange={(e) => handleFilterChange('date_from', e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border text-sm ${themeClasses.input}`}
            />
          </div>
          <div>
            <label className={`block text-xs mb-1 ${themeClasses.text.secondary}`}>To</label>
            <input
              type="date"
              value={filters.date_to || ''}
              onChange={(e) => handleFilterChange('date_to', e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border text-sm ${themeClasses.input}`}
            />
          </div>
        </div>

        <div className="flex justify-end mb-4">
          <div className="w-48">
            <EnhancedSelect
              value={pagination.pageSize}
              onChange={handlePageSizeChange}
              options={pageSizeOptions}
              theme={theme}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={themeClasses.bg.secondary}>
              <tr>
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">Marketer</th>
                <th className="p-3 text-left">Type</th>
                <th className="p-3 text-left">Amount</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {transactions.slice(
                (pagination.currentPage - 1) * pagination.pageSize,
                pagination.currentPage * pagination.pageSize
              ).map((transaction) => {
                const statusConfig = getStatusConfig(transaction.status);
                const StatusIcon = statusConfig.icon;
                
                return (
                  <tr key={transaction.id} className={themeClasses.row}>
                    <td className="p-3">
                      <span className="font-mono text-xs">{transaction.reference_id || 'N/A'}</span>
                    </td>
                    <td className="p-3">
                      <div>
                        <p className={`font-medium ${themeClasses.text.primary}`}>
                          {transaction.marketer_name || 'Unknown'}
                        </p>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="capitalize">
                        {COMMISSION_TYPES[transaction.transaction_type]?.label || transaction.transaction_type}
                      </span>
                    </td>
                    <td className="p-3 font-medium">
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <StatusIcon size={14} className={statusConfig.color} />
                        <span className={`capitalize ${statusConfig.color}`}>
                          {transaction.status}
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      {formatDate(transaction.transaction_date, 'short')}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedTransaction(transaction);
                            setShowDetailsModal(true);
                          }}
                          className={`p-1.5 rounded ${themeClasses.button.secondary}`}
                          title="View Details"
                        >
                          <Eye size={14} />
                        </button>
                        
                        {transaction.status === 'pending' && (
                          <button
                            onClick={() => {
                              setSelectedTransaction(transaction);
                              setShowApproveModal(true);
                            }}
                            className={`p-1.5 rounded ${themeClasses.button.success}`}
                            title="Approve"
                          >
                            <Check size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {pagination.totalPages > 1 && (
          <div className="flex justify-center mt-4 gap-2">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className={`px-3 py-1 rounded ${
                pagination.currentPage === 1
                  ? 'opacity-50 cursor-not-allowed'
                  : themeClasses.button.secondary
              }`}
            >
              Previous
            </button>
            <span className={`px-3 py-1 ${themeClasses.text.primary}`}>
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className={`px-3 py-1 rounded ${
                pagination.currentPage === pagination.totalPages
                  ? 'opacity-50 cursor-not-allowed'
                  : themeClasses.button.secondary
              }`}
            >
              Next
            </button>
          </div>
        )}

        {stats && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className={`text-xs ${themeClasses.text.secondary}`}>Total Value</p>
                <p className={`font-medium ${themeClasses.text.primary}`}>
                  {formatCurrency(stats.totalAmount)}
                </p>
              </div>
              <div className="text-center">
                <p className={`text-xs ${themeClasses.text.secondary}`}>Pending</p>
                <p className={`font-medium text-yellow-500`}>{stats.pendingCount}</p>
              </div>
              <div className="text-center">
                <p className={`text-xs ${themeClasses.text.secondary}`}>Paid</p>
                <p className={`font-medium text-green-500`}>{stats.paidCount}</p>
              </div>
              <div className="text-center">
                <p className={`text-xs ${themeClasses.text.secondary}`}>Avg Amount</p>
                <p className={`font-medium ${themeClasses.text.primary}`}>
                  {formatCurrency(stats.averageAmount)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedTransaction(null);
        }}
        title="Transaction Details"
      >
        {selectedTransaction && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className={`text-sm ${themeClasses.text.secondary}`}>Transaction ID</p>
                <p className="font-mono">{selectedTransaction.id}</p>
              </div>
              <div>
                <p className={`text-sm ${themeClasses.text.secondary}`}>Reference</p>
                <p>{selectedTransaction.reference_id || 'N/A'}</p>
              </div>
              <div>
                <p className={`text-sm ${themeClasses.text.secondary}`}>Type</p>
                <p className="capitalize">{selectedTransaction.transaction_type}</p>
              </div>
              <div>
                <p className={`text-sm ${themeClasses.text.secondary}`}>Status</p>
                <p className={`capitalize ${getStatusConfig(selectedTransaction.status).color}`}>
                  {selectedTransaction.status}
                </p>
              </div>
              <div>
                <p className={`text-sm ${themeClasses.text.secondary}`}>Amount</p>
                <p className="text-xl font-bold">{formatCurrency(selectedTransaction.amount)}</p>
              </div>
              <div>
                <p className={`text-sm ${themeClasses.text.secondary}`}>Date</p>
                <p>{formatDate(selectedTransaction.transaction_date, 'medium')}</p>
              </div>
            </div>

            {selectedTransaction.description && (
              <div>
                <p className={`text-sm ${themeClasses.text.secondary}`}>Description</p>
                <p>{selectedTransaction.description}</p>
              </div>
            )}

            {selectedTransaction.marketer_name && (
              <div>
                <p className={`text-sm ${themeClasses.text.secondary}`}>Marketer</p>
                <p>{selectedTransaction.marketer_name}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Approve Modal */}
      <Modal
        isOpen={showApproveModal}
        onClose={() => {
          setShowApproveModal(false);
          setApproveNotes('');
          setSelectedTransaction(null);
        }}
        title="Approve Transaction"
      >
        {selectedTransaction && (
          <div className="space-y-4">
            <div className={`p-3 rounded-lg ${themeClasses.bg.info}`}>
              <p className="text-sm">
                Approve transaction for {selectedTransaction.marketer_name}
              </p>
              <p className="font-medium mt-1">
                Amount: {formatCurrency(selectedTransaction.amount)}
              </p>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
                Notes (Optional)
              </label>
              <textarea
                value={approveNotes}
                onChange={(e) => setApproveNotes(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border ${themeClasses.input}`}
                rows="3"
                placeholder="Add approval notes..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowApproveModal(false);
                  setApproveNotes('');
                }}
                className={`px-4 py-2 rounded-lg font-medium ${themeClasses.button.secondary}`}
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                className={`px-4 py-2 rounded-lg font-medium ${themeClasses.button.success}`}
              >
                Approve Transaction
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CommissionTracker;