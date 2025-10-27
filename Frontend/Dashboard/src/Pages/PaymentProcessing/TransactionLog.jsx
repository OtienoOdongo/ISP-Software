
// // src/components/Payments/TransactionLog.js
// import React, { useState, useEffect, useMemo, useCallback } from 'react';
// import { toast, ToastContainer } from 'react-toastify';
// import { FaSearch, FaDownload, FaSortAmountDown, FaSortAmountUp, FaCalendarAlt } from 'react-icons/fa';
// import { GrTransaction } from 'react-icons/gr';
// import { AiOutlineReload } from 'react-icons/ai';
// import jsPDF from 'jspdf';
// import 'jspdf-autotable';
// import { CSVLink } from 'react-csv';
// import 'react-toastify/dist/ReactToastify.css';
// import DatePicker from 'react-datepicker';
// import 'react-datepicker/dist/react-datepicker.css';
// import api from '../../api';

// const TransactionLog = () => {
//   const [transactions, setTransactions] = useState([]);
//   const [exportData, setExportData] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filterStatus, setFilterStatus] = useState('all');
//   const [sortDirection, setSortDirection] = useState('date_desc');
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [refreshCount, setRefreshCount] = useState(0);

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
//     totalAmount: 0
//   });

//   /** 🔹 Fetch Transactions */
//   const fetchTransactions = useCallback(async () => {
//     setLoading(true);
//     setError(null);

//     try {
//       const formattedStartDate = startDate.toISOString().split('T')[0];
//       const formattedEndDate = endDate.toISOString().split('T')[0];

//       const params = {
//         start_date: formattedStartDate,
//         end_date: formattedEndDate,
//         status: filterStatus,
//         search: searchTerm,
//         sort_by: sortDirection,
//         page: pagination.current_page,
//         page_size: pagination.page_size
//       };

//       Object.keys(params).forEach(key => {
//         if (!params[key]) delete params[key];
//       });

//       const response = await api.get('/api/payments/transactions/', { params });

//       setTransactions(response.data.transactions || []);
//       setPagination(response.data.pagination || {});
//       setStats(response.data.stats || {});

//       if ((response.data.transactions || []).length === 0) {
//         toast.info('No transactions found for the selected criteria', { autoClose: 3000 });
//       }
//     } catch (err) {
//       const errorMessage = err.response?.data?.error || 'Failed to load transactions';
//       setError(errorMessage);
//       toast.error(errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   }, [startDate, endDate, filterStatus, searchTerm, sortDirection, pagination.current_page, pagination.page_size, refreshCount]);

//   /** 🔹 Fetch Export Data */
//   const fetchExportData = useCallback(async () => {
//     try {
//       const formattedStartDate = startDate.toISOString().split('T')[0];
//       const formattedEndDate = endDate.toISOString().split('T')[0];

//       const params = {
//         start_date: formattedStartDate,
//         end_date: formattedEndDate,
//         status: filterStatus,
//         search: searchTerm,
//         sort_by: sortDirection
//       };

//       Object.keys(params).forEach(key => {
//         if (!params[key]) delete params[key];
//       });

//       const response = await api.get('/api/payments/transactions/export/', { params });
//       setExportData(response.data.data || []);
//       return response.data.data || [];
//     } catch (err) {
//       toast.error('Failed to prepare export data');
//       return [];
//     }
//   }, [startDate, endDate, filterStatus, searchTerm, sortDirection]);

//   /** 🔹 Load Transactions */
//   useEffect(() => {
//     fetchTransactions();
//   }, [fetchTransactions]);

//   const handleRefresh = () => {
//     setRefreshCount(prev => prev + 1);
//     toast.info('Refreshing data...', { autoClose: 2000 });
//   };

//   const handlePageChange = (newPage) => {
//     setPagination(prev => ({ ...prev, current_page: newPage }));
//   };

//   const toggleSort = (type) => {
//     if (type === 'amount') {
//       setSortDirection(prev => (prev === 'amount_asc' ? 'amount_desc' : 'amount_asc'));
//     } else {
//       setSortDirection(prev => (prev === 'date_asc' ? 'date_desc' : 'date_asc'));
//     }
//     setPagination(prev => ({ ...prev, current_page: 1 }));
//   };

//   /** 🔹 PDF Report */
//   const generateReport = async () => {
//     const data = await fetchExportData();
//     if (data.length === 0) {
//       toast.warning('No data for report');
//       return;
//     }

//     const doc = new jsPDF();
//     doc.setFontSize(16);
//     doc.text('TRANSACTION LOG REPORT', 105, 15, { align: 'center' });

//     const headers = [['Transaction ID', 'User', 'Phone', 'Amount (KES)', 'Status', 'Subscription', 'Date & Time']];
//     const rows = data.map(tx => [
//       tx.transaction_id,
//       tx.user_name,
//       tx.phone,
//       tx.amount.toLocaleString(),
//       tx.status,
//       tx.subscription_plan || 'N/A', // ✅ NEW: Added subscription column
//       new Date(tx.date_time).toLocaleString()
//     ]);

//     doc.autoTable({
//       head: headers,
//       body: rows,
//       startY: 30
//     });

//     doc.save(`Transaction_Log_${new Date().toISOString().slice(0, 10)}.pdf`);
//     toast.success('PDF generated');
//   };

//   /** 🔹 CSV Data */
//   const csvData = useMemo(() => exportData.map(tx => ({
//     'Transaction ID': tx.transaction_id,
//     'User': tx.user_name,
//     'Phone': tx.phone,
//     'Amount (KES)': tx.amount,
//     'Status': tx.status,
//     'Subscription': tx.subscription_plan || 'N/A', // ✅ NEW: Added subscription column
//     'Payment Method': tx.payment_method,
//     'Date & Time': new Date(tx.date_time).toLocaleString()
//   })), [exportData]);

//   /** 🔹 Pagination Controls */
//   const PaginationControls = (
//     <div className="flex items-center justify-between mt-4">
//       <div className="text-sm text-gray-700">
//         Showing {((pagination.current_page - 1) * pagination.page_size) + 1} to{' '}
//         {Math.min(pagination.current_page * pagination.page_size, pagination.total_items)} of{' '}
//         {pagination.total_items} entries
//       </div>
//       <div className="flex space-x-2">
//         <button
//           onClick={() => handlePageChange(pagination.current_page - 1)}
//           disabled={!pagination.has_previous}
//           className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
//         >
//           Previous
//         </button>
//         <button
//           onClick={() => handlePageChange(pagination.current_page + 1)}
//           disabled={!pagination.has_next}
//           className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
//         >
//           Next
//         </button>
//       </div>
//     </div>
//   );

//   return (
//     <div className="p-6 bg-gray-50 min-h-screen">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="flex justify-between items-center mb-6">
//           <h1 className="text-2xl font-semibold flex items-center">
//             <GrTransaction className="mr-2 text-blue-600" /> Transaction Log
//           </h1>
//           <button onClick={handleRefresh} className="flex items-center px-3 py-2 bg-white border rounded shadow">
//             <AiOutlineReload className="mr-1" /> Refresh
//           </button>
//         </div>

//         {/* Stats */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
//           <div className="bg-white p-4 rounded shadow border-l-4 border-blue-500">
//             <h3>Total Transactions</h3>
//             <p className="text-xl font-bold">{stats.total}</p>
//           </div>
//           <div className="bg-white p-4 rounded shadow border-l-4 border-green-500">
//             <h3>Success</h3>
//             <p className="text-xl font-bold text-green-600">{stats.success}</p>
//           </div>
//           <div className="bg-white p-4 rounded shadow border-l-4 border-yellow-500">
//             <h3>Pending</h3>
//             <p className="text-xl font-bold text-yellow-600">{stats.pending}</p>
//           </div>
//           <div className="bg-white p-4 rounded shadow border-l-4 border-red-500">
//             <h3>Total Amount</h3>
//             <p className="text-xl font-bold">KES {stats.totalAmount?.toLocaleString()}</p>
//           </div>
//         </div>

//         {/* Filters */}
//         <div className="bg-white p-4 rounded shadow mb-6 flex flex-wrap gap-4">
//           <div className="relative flex-grow">
//             <FaSearch className="absolute left-3 top-3 text-gray-400" />
//             <input
//               type="text"
//               placeholder="Search..."
//               className="pl-10 pr-4 py-2 border rounded w-full"
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//             />
//           </div>
//           <select
//             className="p-2 border rounded"
//             value={filterStatus}
//             onChange={(e) => setFilterStatus(e.target.value)}
//           >
//             <option value="all">All</option>
//             <option value="success">Success</option>
//             <option value="pending">Pending</option>
//             <option value="failed">Failed</option>
//           </select>
//           <button onClick={() => toggleSort('date')} className="px-3 py-2 border rounded">Sort by Date</button>
//           <button onClick={() => toggleSort('amount')} className="px-3 py-2 border rounded">Sort by Amount</button>
//           <button onClick={generateReport} className="px-4 py-2 bg-blue-600 text-white rounded">PDF</button>
//           <CSVLink
//             data={csvData}
//             filename={`transaction_log_${new Date().toISOString().slice(0, 10)}.csv`}
//             onClick={fetchExportData}
//             className="px-4 py-2 bg-green-600 text-white rounded"
//           >
//             CSV
//           </CSVLink>
//         </div>

//         {/* Table */}
//         {loading ? (
//           <p>Loading...</p>
//         ) : error ? (
//           <p className="text-red-600">{error}</p>
//         ) : (
//           <div className="bg-white rounded shadow overflow-hidden">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead>
//                 <tr>
//                   <th>Transaction ID</th>
//                   <th>User</th>
//                   <th>Phone</th>
//                   <th>Amount</th>
//                   <th>Status</th>
//                   <th>Subscription</th> {/* ✅ NEW: Subscription column */}
//                   <th>Date & Time</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {transactions.map(tx => (
//                   <tr key={tx.id}>
//                     <td>{tx.transactionId}</td>
//                     <td>{tx.userName}</td>
//                     <td>{tx.phone}</td>
//                     <td>KES {tx.amount.toLocaleString()}</td>
//                     <td>{tx.status}</td>
//                     <td>{tx.subscriptionPlan || 'N/A'}</td> {/* ✅ NEW: Subscription data */}
//                     <td>{new Date(tx.date).toLocaleString()}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//             {transactions.length > 0 && PaginationControls}
//           </div>
//         )}
//       </div>
//       <ToastContainer />
//     </div>
//   );
// };

// export default TransactionLog;












// src/components/Payments/TransactionLog.js
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { FaSearch, FaDownload, FaSortAmountDown, FaSortAmountUp, FaCalendarAlt } from 'react-icons/fa';
import { GrTransaction } from 'react-icons/gr';
import { AiOutlineReload } from 'react-icons/ai';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { CSVLink } from 'react-csv';
import 'react-toastify/dist/ReactToastify.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import api from '../../api';
import { useTheme } from '../../context/ThemeContext'; // Import theme context

const TransactionLog = () => {
  const { theme } = useTheme(); // Get current theme
  const [transactions, setTransactions] = useState([]);
  const [exportData, setExportData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortDirection, setSortDirection] = useState('date_desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshCount, setRefreshCount] = useState(0);

  const [startDate, setStartDate] = useState(() => new Date(new Date().setDate(new Date().getDate() - 7)));
  const [endDate, setEndDate] = useState(new Date());

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
    totalAmount: 0
  });

  /** 🔹 Fetch Transactions */
  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const formattedStartDate = startDate.toISOString().split('T')[0];
      const formattedEndDate = endDate.toISOString().split('T')[0];

      const params = {
        start_date: formattedStartDate,
        end_date: formattedEndDate,
        status: filterStatus !== 'all' ? filterStatus : undefined,
        search: searchTerm || undefined,
        sort_by: sortDirection,
        page: pagination.current_page,
        page_size: pagination.page_size
      };

      // Remove undefined parameters
      Object.keys(params).forEach(key => {
        if (params[key] === undefined) delete params[key];
      });

      const response = await api.get('/api/payments/transactions/', { params });

      // Ensure we have consistent data structure
      const transactionsData = response.data.transactions || [];
      setTransactions(transactionsData);
      setPagination(response.data.pagination || {
        current_page: 1,
        total_pages: 1,
        total_items: transactionsData.length,
        page_size: pagination.page_size,
        has_next: false,
        has_previous: false
      });
      setStats(response.data.stats || {
        total: transactionsData.length,
        success: transactionsData.filter(t => t.status === 'success').length,
        pending: transactionsData.filter(t => t.status === 'pending').length,
        failed: transactionsData.filter(t => t.status === 'failed').length,
        totalAmount: transactionsData.reduce((sum, t) => sum + (t.amount || 0), 0)
      });

      if (transactionsData.length === 0) {
        toast.info('No transactions found for the selected criteria', { autoClose: 3000 });
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to load transactions';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Fetch transactions error:', err);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, filterStatus, searchTerm, sortDirection, pagination.current_page, pagination.page_size]);

  /** 🔹 Fetch Export Data */
  const fetchExportData = useCallback(async () => {
    try {
      const formattedStartDate = startDate.toISOString().split('T')[0];
      const formattedEndDate = endDate.toISOString().split('T')[0];

      const params = {
        start_date: formattedStartDate,
        end_date: formattedEndDate,
        status: filterStatus !== 'all' ? filterStatus : undefined,
        search: searchTerm || undefined,
        sort_by: sortDirection
      };

      // Remove undefined parameters
      Object.keys(params).forEach(key => {
        if (params[key] === undefined) delete params[key];
      });

      const response = await api.get('/api/payments/transactions/export/', { params });
      const data = response.data.data || [];
      setExportData(data);
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to prepare export data';
      toast.error(errorMessage);
      console.error('Export data error:', err);
      return [];
    }
  }, [startDate, endDate, filterStatus, searchTerm, sortDirection]);

  /** 🔹 Load Transactions */
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  /** 🔹 Refresh when refreshCount changes */
  useEffect(() => {
    if (refreshCount > 0) {
      fetchTransactions();
    }
  }, [refreshCount, fetchTransactions]);

  const handleRefresh = () => {
    setRefreshCount(prev => prev + 1);
    toast.info('Refreshing data...', { autoClose: 2000 });
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, current_page: newPage }));
  };

  const toggleSort = (type) => {
    if (type === 'amount') {
      setSortDirection(prev => (prev === 'amount_asc' ? 'amount_desc' : 'amount_asc'));
    } else {
      setSortDirection(prev => (prev === 'date_asc' ? 'date_desc' : 'date_asc'));
    }
    setPagination(prev => ({ ...prev, current_page: 1 }));
  };

  /** 🔹 Handle search with debounce */
  const handleSearch = (value) => {
    setSearchTerm(value);
    setPagination(prev => ({ ...prev, current_page: 1 }));
  };

  /** 🔹 Handle status filter change */
  const handleStatusChange = (value) => {
    setFilterStatus(value);
    setPagination(prev => ({ ...prev, current_page: 1 }));
  };

  /** 🔹 PDF Report */
  const generateReport = async () => {
    const data = await fetchExportData();
    if (data.length === 0) {
      toast.warning('No data available for report generation');
      return;
    }

    try {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text('TRANSACTION LOG REPORT', 105, 15, { align: 'center' });

      const headers = [['Transaction ID', 'User', 'Phone', 'Amount (KES)', 'Status', 'Subscription', 'Date & Time']];
      const rows = data.map(tx => [
        tx.transaction_id || tx.transactionId || 'N/A',
        tx.user_name || tx.userName || 'N/A',
        tx.phone || 'N/A',
        (tx.amount || 0).toLocaleString(),
        tx.status || 'N/A',
        tx.subscription_plan || tx.subscriptionPlan || 'N/A',
        new Date(tx.date_time || tx.date).toLocaleString()
      ]);

      doc.autoTable({
        head: headers,
        body: rows,
        startY: 30,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [59, 130, 246] }
      });

      doc.save(`Transaction_Log_${new Date().toISOString().slice(0, 10)}.pdf`);
      toast.success('PDF report generated successfully');
    } catch (err) {
      toast.error('Failed to generate PDF report');
      console.error('PDF generation error:', err);
    }
  };

  /** 🔹 CSV Data */
  const csvData = useMemo(() => {
    return exportData.map(tx => ({
      'Transaction ID': tx.transaction_id || tx.transactionId,
      'User': tx.user_name || tx.userName,
      'Phone': tx.phone,
      'Amount (KES)': tx.amount,
      'Status': tx.status,
      'Subscription': tx.subscription_plan || tx.subscriptionPlan || 'N/A',
      'Payment Method': tx.payment_method,
      'Date & Time': new Date(tx.date_time || tx.date).toLocaleString()
    }));
  }, [exportData]);

  /** 🔹 Get status color based on theme */
  const getStatusColor = (status) => {
    const baseColors = {
      success: 'text-green-600',
      pending: 'text-yellow-600',
      failed: 'text-red-600'
    };
    
    const darkColors = {
      success: 'text-green-400',
      pending: 'text-yellow-400',
      failed: 'text-red-400'
    };
    
    return theme === 'dark' ? darkColors[status] : baseColors[status];
  };

  /** 🔹 Get status background color */
  const getStatusBgColor = (status) => {
    const baseColors = {
      success: 'bg-green-100',
      pending: 'bg-yellow-100',
      failed: 'bg-red-100'
    };
    
    const darkColors = {
      success: 'bg-green-900/30',
      pending: 'bg-yellow-900/30',
      failed: 'bg-red-900/30'
    };
    
    return theme === 'dark' ? darkColors[status] : baseColors[status];
  };

  /** 🔹 Pagination Controls */
  const PaginationControls = (
    <div className="flex items-center justify-between mt-4 p-4">
      <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
        Showing {((pagination.current_page - 1) * pagination.page_size) + 1} to{' '}
        {Math.min(pagination.current_page * pagination.page_size, pagination.total_items)} of{' '}
        {pagination.total_items} entries
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
  );

  // Theme-based classes
  const containerClass = theme === 'dark' 
    ? 'bg-gradient-to-br from-gray-900 to-indigo-900 text-white min-h-screen' 
    : 'bg-gray-50 text-gray-800 min-h-screen';

  const cardClass = theme === 'dark' 
    ? 'bg-gray-800/80 backdrop-blur-md border border-gray-700' 
    : 'bg-white border border-gray-200';

  const inputClass = theme === 'dark'
    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
    : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500';

  const tableHeaderClass = theme === 'dark'
    ? 'bg-gray-700 text-gray-200'
    : 'bg-gray-50 text-gray-700';

  const tableRowClass = theme === 'dark'
    ? 'border-gray-700 hover:bg-gray-700/50'
    : 'border-gray-200 hover:bg-gray-50';

  return (
    <div className={`p-6 min-h-screen transition-colors duration-300 ${containerClass}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold flex items-center">
            <GrTransaction className="mr-3 text-blue-500" /> 
            Transaction Log
          </h1>
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

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Transactions', value: stats.total, border: 'border-l-blue-500' },
            { label: 'Success', value: stats.success, border: 'border-l-green-500', color: 'text-green-600' },
            { label: 'Pending', value: stats.pending, border: 'border-l-yellow-500', color: 'text-yellow-600' },
            { label: 'Total Amount', value: `KES ${stats.totalAmount?.toLocaleString() || '0'}`, border: 'border-l-purple-500' },
          ].map((stat, index) => (
            <div key={index} className={`p-6 rounded-xl shadow-lg ${cardClass} ${stat.border}`}>
              <h3 className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                {stat.label}
              </h3>
              <p className={`text-2xl font-bold mt-2 ${stat.color || (theme === 'dark' ? 'text-white' : 'text-gray-800')}`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className={`p-6 rounded-xl shadow-lg mb-6 ${cardClass}`}>
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            {/* Search */}
            <div className="relative flex-grow w-full lg:w-auto">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by transaction ID, user, or phone..."
                className={`pl-10 pr-4 py-3 border rounded-lg w-full transition-colors ${inputClass}`}
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <select
              className={`p-3 border rounded-lg transition-colors ${inputClass} w-full lg:w-40`}
              value={filterStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="success">Success</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>

            {/* Date Pickers */}
            <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
              <div className="flex items-center gap-2">
                <FaCalendarAlt className="text-gray-400" />
                <DatePicker
                  selected={startDate}
                  onChange={setStartDate}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  className={`p-2 border rounded-lg transition-colors ${inputClass} w-full`}
                />
              </div>
              <div className="flex items-center gap-2">
                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>to</span>
                <DatePicker
                  selected={endDate}
                  onChange={setEndDate}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate}
                  className={`p-2 border rounded-lg transition-colors ${inputClass} w-full`}
                />
              </div>
            </div>

            {/* Sort Buttons */}
            <div className="flex gap-2 w-full lg:w-auto">
              <button 
                onClick={() => toggleSort('date')}
                className={`px-4 py-3 border rounded-lg transition-all flex items-center gap-2 ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' 
                    : 'bg-white border-gray-300 hover:bg-gray-50'
                }`}
              >
                {sortDirection.includes('asc') ? <FaSortAmountUp /> : <FaSortAmountDown />}
                Date
              </button>
              <button 
                onClick={() => toggleSort('amount')}
                className={`px-4 py-3 border rounded-lg transition-all flex items-center gap-2 ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' 
                    : 'bg-white border-gray-300 hover:bg-gray-50'
                }`}
              >
                {sortDirection.includes('asc') ? <FaSortAmountUp /> : <FaSortAmountDown />}
                Amount
              </button>
            </div>

            {/* Export Buttons */}
            <div className="flex gap-2 w-full lg:w-auto">
              <button 
                onClick={generateReport}
                disabled={loading}
                className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <FaDownload />
                PDF
              </button>
              <CSVLink
                data={csvData}
                filename={`transaction_log_${new Date().toISOString().slice(0, 10)}.csv`}
                onClick={fetchExportData}
                className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-center"
              >
                <FaDownload />
                CSV
              </CSVLink>
            </div>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className={`p-8 rounded-xl ${cardClass} text-center`}>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4">Loading transactions...</p>
          </div>
        ) : error ? (
          <div className={`p-6 rounded-xl ${cardClass} text-center`}>
            <p className="text-red-500 text-lg">{error}</p>
            <button 
              onClick={handleRefresh}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className={`rounded-xl shadow-lg overflow-hidden ${cardClass}`}>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className={tableHeaderClass}>
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                      Transaction ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                      Subscription
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                      Date & Time
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center">
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
                      <tr key={tx.id || index} className={`transition-colors ${tableRowClass}`}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                          {tx.transaction_id || tx.transactionId || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {tx.user_name || tx.userName || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {tx.phone || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                          KES {(tx.amount || 0).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBgColor(tx.status)} ${getStatusColor(tx.status)}`}>
                            {tx.status?.charAt(0).toUpperCase() + tx.status?.slice(1) || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {tx.subscription_plan || tx.subscriptionPlan || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {new Date(tx.date_time || tx.date).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {transactions.length > 0 && PaginationControls}
          </div>
        )}
      </div>
      <ToastContainer 
        position="bottom-right"
        theme={theme}
        toastClassName={() => 
          `relative flex p-1 min-h-10 rounded-md justify-between overflow-hidden cursor-pointer ${
            theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
          }`
        }
      />
    </div>
  );
};

export default TransactionLog;