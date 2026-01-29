// import React, { useState, useEffect, useCallback } from 'react';
// import { motion } from 'framer-motion';
// import { FaWifi, FaSearch, FaDownload } from 'react-icons/fa';
// import { FiEye, FiTrendingUp } from 'react-icons/fi';
// import { CSVLink } from 'react-csv';
// import jsPDF from 'jspdf';
// import 'jspdf-autotable';
// import api from '../../../api'
// import { EnhancedSelect, EnhancedDatePicker } from '../../ServiceManagement/Shared/components'

// const HotspotTransactions = ({ filters, onFilterChange, onRefresh, onTransactionSelect, loading, error, theme }) => {
//   const [hotspotTransactions, setHotspotTransactions] = useState([]);
//   const [hotspotStats, setHotspotStats] = useState({
//     total: 0,
//     success: 0,
//     pending: 0,
//     failed: 0,
//     totalAmount: 0
//   });
//   const [pagination, setPagination] = useState({
//     current_page: 1,
//     total_pages: 1,
//     total_items: 0,
//     page_size: 20,
//     has_next: false,
//     has_previous: false
//   });

//   const themeClasses = {
//     container: theme === 'dark' 
//       ? 'bg-gradient-to-br from-blue-900/20 to-indigo-900/20' 
//       : 'bg-blue-50',
//     card: theme === 'dark' 
//       ? 'bg-gray-800/80 backdrop-blur-md border border-gray-700' 
//       : 'bg-white border border-gray-200',
//     input: theme === 'dark'
//       ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
//       : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500'
//   };

//   // Fetch hotspot-specific transactions
//   const fetchHotspotTransactions = useCallback(async () => {
//     const params = {
//       start_date: filters.startDate.toISOString().split('T')[0],
//       end_date: filters.endDate.toISOString().split('T')[0],
//       status: filters.status !== 'all' ? filters.status : undefined,
//       payment_method: filters.paymentMethod !== 'all' ? filters.paymentMethod : undefined,
//       access_type: 'hotspot', // Always filter by hotspot
//       search: filters.searchTerm || undefined,
//       sort_by: filters.sortBy,
//       page: filters.page,
//       page_size: filters.pageSize
//     };

//     const cleanParams = Object.fromEntries(
//       Object.entries(params).filter(([_, value]) => value !== undefined)
//     );

//     try {
//       const response = await api.get('/api/payments/transactions/', { params: cleanParams });
//       const transactionsData = response.data.transactions || [];
      
//       setHotspotTransactions(transactionsData);
//       setPagination(response.data.pagination || {
//         current_page: 1,
//         total_pages: 1,
//         total_items: transactionsData.length,
//         page_size: filters.pageSize,
//         has_next: false,
//         has_previous: false
//       });

//       // Calculate hotspot-specific stats
//       const stats = response.data.stats || {};
//       const hotspotStatsData = stats.byAccessType?.hotspot || {};
      
//       setHotspotStats({
//         total: hotspotStatsData.count || transactionsData.length,
//         success: hotspotStatsData.success_count || transactionsData.filter(t => t.status === 'success').length,
//         pending: hotspotStatsData.pending_count || transactionsData.filter(t => t.status === 'pending').length,
//         failed: hotspotStatsData.failed_count || transactionsData.filter(t => t.status === 'failed').length,
//         totalAmount: hotspotStatsData.total_amount || transactionsData.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0)
//       });

//     } catch (err) {
//       console.error('Failed to fetch hotspot transactions:', err);
//     }
//   }, [filters]);

//   useEffect(() => {
//     fetchHotspotTransactions();
//   }, [fetchHotspotTransactions]);

//   const handlePageChange = useCallback((newPage) => {
//     onFilterChange({ page: newPage });
//   }, [onFilterChange]);

//   const handleSearchChange = useCallback((value) => {
//     onFilterChange({ searchTerm: value });
//   }, [onFilterChange]);

//   const handleStatusChange = useCallback((value) => {
//     onFilterChange({ status: value });
//   }, [onFilterChange]);

//   const formatCurrency = (amount) => {
//     return `KES ${(parseFloat(amount) || 0).toLocaleString()}`;
//   };

//   const getStatusColor = (status) => {
//     const colors = {
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
    
//     return theme === 'dark' ? darkColors[status] : colors[status];
//   };

//   const getStatusBgColor = (status) => {
//     const colors = {
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
    
//     return theme === 'dark' ? darkColors[status] : colors[status];
//   };

//   const generateHotspotReport = async () => {
//     try {
//       const params = {
//         start_date: filters.startDate.toISOString().split('T')[0],
//         end_date: filters.endDate.toISOString().split('T')[0],
//         access_type: 'hotspot',
//         page_size: 1000
//       };

//       const response = await api.get('/api/payments/transactions/', { params });
//       const data = response.data.transactions || [];

//       if (data.length === 0) {
//         alert('No hotspot transactions available for report generation');
//         return;
//       }

//       const doc = new jsPDF();
//       doc.setFontSize(16);
//       doc.text('HOTSPOT TRANSACTIONS REPORT', 105, 15, { align: 'center' });

//       const headers = [[
//         'Transaction ID', 'User', 'Amount (KES)', 'Status', 
//         'Payment Method', 'Plan', 'Reference', 'Date & Time'
//       ]];
      
//       const rows = data.map(tx => [
//         tx.transactionId || 'N/A',
//         tx.userName || 'N/A',
//         (parseFloat(tx.amount) || 0).toLocaleString(),
//         tx.status?.toUpperCase() || 'N/A',
//         tx.paymentMethod ? tx.paymentMethod.replace('_', ' ').toUpperCase() : 'N/A',
//         tx.planName || 'N/A',
//         tx.referenceNumber || 'N/A',
//         new Date(tx.date || tx.created_at).toLocaleString()
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
//           2: { cellWidth: 15 },
//           3: { cellWidth: 15 },
//           4: { cellWidth: 20 },
//           5: { cellWidth: 20 },
//           6: { cellWidth: 20 },
//           7: { cellWidth: 25 }
//         }
//       });

//       doc.save(`Hotspot_Transactions_${new Date().toISOString().slice(0, 10)}.pdf`);
//     } catch (err) {
//       console.error('Hotspot PDF generation error:', err);
//       alert('Failed to generate hotspot report');
//     }
//   };

//   const fetchHotspotExportData = async () => {
//     try {
//       const params = {
//         start_date: filters.startDate.toISOString().split('T')[0],
//         end_date: filters.endDate.toISOString().split('T')[0],
//         access_type: 'hotspot',
//         page_size: 1000
//       };

//       const response = await api.get('/api/payments/transactions/', { params });
//       return response.data.transactions || [];
//     } catch (err) {
//       console.error('Hotspot export data error:', err);
//       return [];
//     }
//   };

//   const hotspotStatsCards = [
//     {
//       label: 'Total Hotspot Transactions',
//       value: hotspotStats.total,
//       icon: FaWifi,
//       color: 'blue',
//       border: 'border-l-blue-500'
//     },
//     {
//       label: 'Successful',
//       value: hotspotStats.success,
//       icon: FiTrendingUp,
//       color: 'green',
//       border: 'border-l-green-500'
//     },
//     {
//       label: 'Pending',
//       value: hotspotStats.pending,
//       icon: FaSearch,
//       color: 'yellow',
//       border: 'border-l-yellow-500'
//     },
//     {
//       label: 'Failed',
//       value: hotspotStats.failed,
//       icon: FiEye,
//       color: 'red',
//       border: 'border-l-red-500'
//     },
//     {
//       label: 'Total Revenue',
//       value: formatCurrency(hotspotStats.totalAmount),
//       icon: FaDownload,
//       color: 'indigo',
//       border: 'border-l-indigo-500'
//     },
//     {
//       label: 'Success Rate',
//       value: hotspotStats.total > 0 ? `${((hotspotStats.success / hotspotStats.total) * 100).toFixed(1)}%` : '0%',
//       icon: FiTrendingUp,
//       color: 'purple',
//       border: 'border-l-purple-500'
//     }
//   ];

//   return (
//     <div className="space-y-6">
//       {/* Hotspot Stats Header */}
//       <div className={`p-6 rounded-xl shadow-lg ${themeClasses.card}`}>
//         <div className="flex items-center gap-4 mb-4">
//           <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
//             <FaWifi className="w-8 h-8" />
//           </div>
//           <div>
//             <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
//               Hotspot Transactions
//             </h2>
//             <p className={`mt-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
//               Wireless network access transactions and analytics
//             </p>
//           </div>
//         </div>

//         {/* Hotspot Stats Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
//           {hotspotStatsCards.map((stat, index) => {
//             const IconComponent = stat.icon;
//             return (
//               <motion.div
//                 key={index}
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: index * 0.1 }}
//                 className={`p-4 rounded-xl border-l-4 ${themeClasses.card} ${stat.border}`}
//               >
//                 <div className="flex items-center gap-3">
//                   <div className={`p-2 rounded-lg ${
//                     theme === 'dark' 
//                       ? `bg-${stat.color}-900/30 text-${stat.color}-400`
//                       : `bg-${stat.color}-100 text-${stat.color}-600`
//                   }`}>
//                     <IconComponent className="w-4 h-4" />
//                   </div>
//                   <div>
//                     <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
//                       {stat.label}
//                     </p>
//                     <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
//                       {stat.value}
//                     </p>
//                   </div>
//                 </div>
//               </motion.div>
//             );
//           })}
//         </div>
//       </div>

//       {/* Filters */}
//       <div className={`p-6 rounded-xl shadow-lg ${themeClasses.card}`}>
//         <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
//           <div className="relative flex-grow w-full lg:w-auto">
//             <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//             <input
//               type="text"
//               placeholder="Search hotspot transactions..."
//               className={`pl-10 pr-4 py-3 border rounded-lg w-full transition-colors ${themeClasses.input}`}
//               value={filters.searchTerm}
//               onChange={(e) => handleSearchChange(e.target.value)}
//             />
//           </div>

//           <EnhancedSelect
//             value={filters.status}
//             onChange={handleStatusChange}
//             options={[
//               { value: 'all', label: 'All Status' },
//               { value: 'success', label: 'Success' },
//               { value: 'pending', label: 'Pending' },
//               { value: 'failed', label: 'Failed' }
//             ]}
//             placeholder="Status"
//             theme={theme}
//             className="w-full lg:w-40"
//           />

//           <div className="flex gap-2 w-full lg:w-auto">
//             <button 
//               onClick={generateHotspotReport}
//               disabled={loading}
//               className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
//             >
//               <FaDownload />
//               Export PDF
//             </button>
//             <CSVLink
//               data={async () => {
//                 const data = await fetchHotspotExportData();
//                 return data.map(tx => ({
//                   'Transaction ID': tx.transactionId,
//                   'User': tx.userName,
//                   'Amount (KES)': parseFloat(tx.amount) || 0,
//                   'Status': tx.status,
//                   'Payment Method': tx.paymentMethod,
//                   'Plan': tx.planName || 'N/A',
//                   'Reference Number': tx.referenceNumber,
//                   'Date & Time': new Date(tx.date || tx.created_at).toLocaleString()
//                 }));
//               }}
//               filename={`hotspot_transactions_${new Date().toISOString().slice(0, 10)}.csv`}
//               className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-center"
//             >
//               <FaDownload />
//               Export CSV
//             </CSVLink>
//           </div>
//         </div>
//       </div>

//       {/* Hotspot Transactions Table */}
//       <div className={`rounded-xl shadow-lg overflow-hidden ${themeClasses.card}`}>
//         <div className="overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
//             <thead className={theme === 'dark' ? 'bg-gray-700 text-gray-200' : 'bg-gray-50 text-gray-700'}>
//               <tr>
//                 <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
//                   Transaction ID
//                 </th>
//                 <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
//                   User
//                 </th>
//                 <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
//                   Amount
//                 </th>
//                 <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
//                   Status
//                 </th>
//                 <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
//                   Payment Method
//                 </th>
//                 <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
//                   Plan
//                 </th>
//                 <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
//                   Date & Time
//                 </th>
//                 <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
//                   Actions
//                 </th>
//               </tr>
//             </thead>
//             <tbody className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
//               {hotspotTransactions.length === 0 ? (
//                 <tr>
//                   <td colSpan="8" className="px-6 py-8 text-center">
//                     <div className="flex flex-col items-center justify-center">
//                       <FaWifi className="text-4xl text-gray-400 mb-2" />
//                       <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
//                         No hotspot transactions found
//                       </p>
//                     </div>
//                   </td>
//                 </tr>
//               ) : (
//                 hotspotTransactions.map((tx, index) => (
//                   <tr key={tx.id || index} className={`transition-colors ${
//                     theme === 'dark' ? 'border-gray-700 hover:bg-gray-700/50' : 'border-gray-200 hover:bg-gray-50'
//                   }`}>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
//                       {tx.transactionId || 'N/A'}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm">
//                       {tx.userName || 'N/A'}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
//                       {formatCurrency(tx.amount)}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBgColor(tx.status)} ${getStatusColor(tx.status)}`}>
//                         {tx.status?.charAt(0).toUpperCase() + tx.status?.slice(1) || 'Unknown'}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm">
//                       {tx.paymentMethod ? tx.paymentMethod.replace('_', ' ').toUpperCase() : 'N/A'}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm">
//                       {tx.planName || 'N/A'}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm">
//                       {new Date(tx.date || tx.created_at).toLocaleString()}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm">
//                       <button
//                         onClick={() => onTransactionSelect(tx)}
//                         className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
//                           theme === 'dark' 
//                             ? 'bg-gray-700 hover:bg-gray-600 text-white' 
//                             : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
//                         }`}
//                       >
//                         <FiEye className="w-4 h-4" />
//                         View
//                       </button>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>

//         {/* Pagination */}
//         {hotspotTransactions.length > 0 && (
//           <div className="flex items-center justify-between mt-4 p-4 border-t border-gray-200 dark:border-gray-700">
//             <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
//               Showing {((pagination.current_page - 1) * pagination.page_size) + 1} to{' '}
//               {Math.min(pagination.current_page * pagination.page_size, pagination.total_items)} of{' '}
//               {pagination.total_items} hotspot transactions
//             </div>
//             <div className="flex space-x-2">
//               <button
//                 onClick={() => handlePageChange(pagination.current_page - 1)}
//                 disabled={!pagination.has_previous}
//                 className={`px-4 py-2 rounded-lg transition-all ${
//                   theme === 'dark' 
//                     ? 'bg-gray-700 text-white hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500' 
//                     : 'bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400'
//                 } disabled:cursor-not-allowed`}
//               >
//                 Previous
//               </button>
//               <button
//                 onClick={() => handlePageChange(pagination.current_page + 1)}
//                 disabled={!pagination.has_next}
//                 className={`px-4 py-2 rounded-lg transition-all ${
//                   theme === 'dark' 
//                     ? 'bg-gray-700 text-white hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500' 
//                     : 'bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400'
//                 } disabled:cursor-not-allowed`}
//               >
//                 Next
//               </button>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default HotspotTransactions;












import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FaWifi, FaSearch, FaDownload } from 'react-icons/fa';
import { FiEye, FiTrendingUp } from 'react-icons/fi';
import { CSVLink } from 'react-csv';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import api from '../../../api';
import { EnhancedSelect, DateRangePicker } from '../../ServiceManagement/Shared/components';

const HotspotTransactions = ({ filters, onFilterChange, onRefresh, onTransactionSelect, loading, error, theme }) => {
  const [hotspotTransactions, setHotspotTransactions] = useState([]);
  const [hotspotStats, setHotspotStats] = useState({
    total: 0,
    success: 0,
    pending: 0,
    failed: 0,
    totalAmount: 0
  });
  const [csvData, setCsvData] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_items: 0,
    page_size: 20,
    has_next: false,
    has_previous: false
  });

  const themeClasses = {
    container: theme === 'dark' 
      ? 'bg-gradient-to-br from-blue-900/20 to-indigo-900/20' 
      : 'bg-blue-50',
    card: theme === 'dark' 
      ? 'bg-gray-800/80 backdrop-blur-md border border-gray-700' 
      : 'bg-white border border-gray-200',
    input: theme === 'dark'
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
      : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500'
  };

  // Fetch hotspot-specific transactions
  const fetchHotspotTransactions = useCallback(async () => {
    const params = {
      start_date: filters.startDate.toISOString().split('T')[0],
      end_date: filters.endDate.toISOString().split('T')[0],
      status: filters.status !== 'all' ? filters.status : undefined,
      payment_method: filters.paymentMethod !== 'all' ? filters.paymentMethod : undefined,
      access_type: 'hotspot', // Always filter by hotspot
      search: filters.searchTerm || undefined,
      sort_by: filters.sortBy,
      page: filters.page,
      page_size: filters.pageSize
    };

    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value !== undefined)
    );

    try {
      const response = await api.get('/api/payments/transactions/', { params: cleanParams });
      const transactionsData = response.data.transactions || [];
      
      setHotspotTransactions(transactionsData);
      setPagination(response.data.pagination || {
        current_page: 1,
        total_pages: 1,
        total_items: transactionsData.length,
        page_size: filters.pageSize,
        has_next: false,
        has_previous: false
      });

      // Calculate hotspot-specific stats
      const stats = response.data.stats || {};
      const hotspotStatsData = stats.byAccessType?.hotspot || {};
      
      setHotspotStats({
        total: hotspotStatsData.count || transactionsData.length,
        success: hotspotStatsData.success_count || transactionsData.filter(t => t.status === 'success').length,
        pending: hotspotStatsData.pending_count || transactionsData.filter(t => t.status === 'pending').length,
        failed: hotspotStatsData.failed_count || transactionsData.filter(t => t.status === 'failed').length,
        totalAmount: hotspotStatsData.total_amount || transactionsData.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0)
      });

    } catch (err) {
      console.error('Failed to fetch hotspot transactions:', err);
    }
  }, [filters]);

  const fetchHotspotExportData = async () => {
    try {
      const params = {
        start_date: filters.startDate.toISOString().split('T')[0],
        end_date: filters.endDate.toISOString().split('T')[0],
        access_type: 'hotspot',
        page_size: 1000
      };

      const response = await api.get('/api/payments/transactions/', { params });
      return response.data.transactions || [];
    } catch (err) {
      console.error('Hotspot export data error:', err);
      return [];
    }
  };

  // Update CSV data when filters change
  useEffect(() => {
    const updateCSVData = async () => {
      const data = await fetchHotspotExportData();
      const formattedData = data.map(tx => ({
        'Transaction ID': tx.transactionId,
        'User': tx.userName,
        'Amount (KES)': parseFloat(tx.amount) || 0,
        'Status': tx.status,
        'Payment Method': tx.paymentMethod,
        'Plan': tx.planName || 'N/A',
        'Reference Number': tx.referenceNumber,
        'Date & Time': new Date(tx.date || tx.created_at).toLocaleString()
      }));
      setCsvData(formattedData);
    };

    updateCSVData();
  }, [filters]);

  useEffect(() => {
    fetchHotspotTransactions();
  }, [fetchHotspotTransactions]);

  const handlePageChange = useCallback((newPage) => {
    onFilterChange({ page: newPage });
  }, [onFilterChange]);

  const handleSearchChange = useCallback((value) => {
    onFilterChange({ searchTerm: value });
  }, [onFilterChange]);

  const handleStatusChange = useCallback((value) => {
    onFilterChange({ status: value });
  }, [onFilterChange]);

  const formatCurrency = (amount) => {
    return `KES ${(parseFloat(amount) || 0).toLocaleString()}`;
  };

  const getStatusColor = (status) => {
    const colors = {
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
    
    return theme === 'dark' ? darkColors[status] : colors[status];
  };

  const getStatusBgColor = (status) => {
    const colors = {
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
    
    return theme === 'dark' ? darkColors[status] : colors[status];
  };

  const generateHotspotReport = async () => {
    try {
      const data = await fetchHotspotExportData();

      if (data.length === 0) {
        alert('No hotspot transactions available for report generation');
        return;
      }

      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text('HOTSPOT TRANSACTIONS REPORT', 105, 15, { align: 'center' });

      const headers = [[
        'Transaction ID', 'User', 'Amount (KES)', 'Status', 
        'Payment Method', 'Plan', 'Reference', 'Date & Time'
      ]];
      
      const rows = data.map(tx => [
        tx.transactionId || 'N/A',
        tx.userName || 'N/A',
        (parseFloat(tx.amount) || 0).toLocaleString(),
        tx.status?.toUpperCase() || 'N/A',
        tx.paymentMethod ? tx.paymentMethod.replace('_', ' ').toUpperCase() : 'N/A',
        tx.planName || 'N/A',
        tx.referenceNumber || 'N/A',
        new Date(tx.date || tx.created_at).toLocaleString()
      ]);

      doc.autoTable({
        head: headers,
        body: rows,
        startY: 30,
        styles: { fontSize: 7 },
        headStyles: { fillColor: [59, 130, 246] },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 20 },
          2: { cellWidth: 15 },
          3: { cellWidth: 15 },
          4: { cellWidth: 20 },
          5: { cellWidth: 20 },
          6: { cellWidth: 20 },
          7: { cellWidth: 25 }
        }
      });

      doc.save(`Hotspot_Transactions_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error('Hotspot PDF generation error:', err);
      alert('Failed to generate hotspot report');
    }
  };

  const hotspotStatsCards = [
    {
      label: 'Total Hotspot Transactions',
      value: hotspotStats.total,
      icon: FaWifi,
      color: 'blue',
      border: 'border-l-blue-500'
    },
    {
      label: 'Successful',
      value: hotspotStats.success,
      icon: FiTrendingUp,
      color: 'green',
      border: 'border-l-green-500'
    },
    {
      label: 'Pending',
      value: hotspotStats.pending,
      icon: FaSearch,
      color: 'yellow',
      border: 'border-l-yellow-500'
    },
    {
      label: 'Failed',
      value: hotspotStats.failed,
      icon: FiEye,
      color: 'red',
      border: 'border-l-red-500'
    },
    {
      label: 'Total Revenue',
      value: formatCurrency(hotspotStats.totalAmount),
      icon: FaDownload,
      color: 'indigo',
      border: 'border-l-indigo-500'
    },
    {
      label: 'Success Rate',
      value: hotspotStats.total > 0 ? `${((hotspotStats.success / hotspotStats.total) * 100).toFixed(1)}%` : '0%',
      icon: FiTrendingUp,
      color: 'purple',
      border: 'border-l-purple-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Hotspot Stats Header */}
      <div className={`p-6 rounded-xl shadow-lg ${themeClasses.card}`}>
        <div className="flex items-center gap-4 mb-4">
          <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
            <FaWifi className="w-8 h-8" />
          </div>
          <div>
            <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
              Hotspot Transactions
            </h2>
            <p className={`mt-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              Wireless network access transactions and analytics
            </p>
          </div>
        </div>

        {/* Hotspot Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {hotspotStatsCards.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-xl border-l-4 ${themeClasses.card} ${stat.border}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    theme === 'dark' 
                      ? `bg-${stat.color}-900/30 text-${stat.color}-400`
                      : `bg-${stat.color}-100 text-${stat.color}-600`
                  }`}>
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      {stat.label}
                    </p>
                    <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                      {stat.value}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className={`p-6 rounded-xl shadow-lg ${themeClasses.card}`}>
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          <div className="relative flex-grow w-full lg:w-auto">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search hotspot transactions..."
              className={`pl-10 pr-4 py-3 border rounded-lg w-full transition-colors ${themeClasses.input}`}
              value={filters.searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>

          <EnhancedSelect
            value={filters.status}
            onChange={handleStatusChange}
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'success', label: 'Success' },
              { value: 'pending', label: 'Pending' },
              { value: 'failed', label: 'Failed' }
            ]}
            placeholder="Status"
            theme={theme}
            className="w-full lg:w-40"
          />

          <div className="flex gap-2 w-full lg:w-auto">
            <button 
              onClick={generateHotspotReport}
              disabled={loading}
              className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <FaDownload />
              Export PDF
            </button>
            <CSVLink
              data={csvData}
              filename={`hotspot_transactions_${new Date().toISOString().slice(0, 10)}.csv`}
              className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-center"
            >
              <FaDownload />
              Export CSV
            </CSVLink>
          </div>
        </div>
      </div>

      {/* Hotspot Transactions Table */}
      <div className={`rounded-xl shadow-lg overflow-hidden ${themeClasses.card}`}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className={theme === 'dark' ? 'bg-gray-700 text-gray-200' : 'bg-gray-50 text-gray-700'}>
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                  Transaction ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                  User
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
              {hotspotTransactions.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <FaWifi className="text-4xl text-gray-400 mb-2" />
                      <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                        No hotspot transactions found
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                hotspotTransactions.map((tx, index) => (
                  <tr key={tx.id || index} className={`transition-colors ${
                    theme === 'dark' ? 'border-gray-700 hover:bg-gray-700/50' : 'border-gray-200 hover:bg-gray-50'
                  }`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                      {tx.transactionId || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {tx.userName || 'N/A'}
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
        {hotspotTransactions.length > 0 && (
          <div className="flex items-center justify-between mt-4 p-4 border-t border-gray-200 dark:border-gray-700">
            <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Showing {((pagination.current_page - 1) * pagination.page_size) + 1} to{' '}
              {Math.min(pagination.current_page * pagination.page_size, pagination.total_items)} of{' '}
              {pagination.total_items} hotspot transactions
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(pagination.current_page - 1)}
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
                onClick={() => handlePageChange(pagination.current_page + 1)}
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
    </div>
  );
};

export default HotspotTransactions;