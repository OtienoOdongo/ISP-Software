

// import React, { useState, useEffect } from 'react';
// import { FaSearch, FaFileDownload, FaTimes, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
// import { toast, ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import { CSVLink } from 'react-csv';

// const PaymentReconciliation = () => {
//   const [transactions, setTransactions] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [startDate, setStartDate] = useState('');
//   const [endDate, setEndDate] = useState('');
//   const [statusFilter, setStatusFilter] = useState('all');
//   const [sortColumn, setSortColumn] = useState('date');
//   const [sortDirection, setSortDirection] = useState('asc');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const mockTransactions = [
//     { id: 1, date: '2023-10-01', amount: '1000.00', status: 'Matched', type: 'Payment', reference: 'MPESA123' },
//     { id: 2, date: '2023-10-02', amount: '500.00', status: 'Pending', type: 'Payment', reference: 'MPESA456' },
//     { id: 3, date: '2023-10-03', amount: '1500.00', status: 'Discrepancy', type: 'Payment', reference: 'MPESA789' },
//   ];

//   useEffect(() => {
//     setLoading(true);
//     setError(null);
//     setTimeout(() => {
//       try {
//         setTransactions(mockTransactions);
//       } catch (err) {
//         setError('Failed to fetch transactions');
//       } finally {
//         setLoading(false);
//       }
//     }, 1000);
//   }, []);

//   const filteredTransactions = transactions.filter(transaction =>
//     transaction.reference.toLowerCase().includes(searchTerm.toLowerCase()) &&
//     (!startDate || new Date(transaction.date) >= new Date(startDate)) &&
//     (!endDate || new Date(transaction.date) <= new Date(endDate)) &&
//     (statusFilter === 'all' || transaction.status.toLowerCase() === statusFilter)
//   ).sort((a, b) => {
//     if (a[sortColumn] < b[sortColumn]) return sortDirection === 'asc' ? -1 : 1;
//     if (a[sortColumn] > b[sortColumn]) return sortDirection === 'asc' ? 1 : -1;
//     return 0;
//   });

//   const totalAmount = filteredTransactions.reduce((sum, transaction) => sum + parseFloat(transaction.amount), 0);

//   const downloadCSV = () => {
//     if (filteredTransactions.length === 0) {
//       toast.error('No data to download.');
//       return;
//     }
//     toast.success('Report download initiated!');
//   };

//   const handleSort = (column) => {
//     if (column === sortColumn) {
//       setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
//     } else {
//       setSortColumn(column);
//       setSortDirection('asc');
//     }
//   };

//   const statusIcons = {
//     'Matched': <FaCheck className="text-green-500 inline-block mr-1" />,
//     'Pending': <FaExclamationTriangle className="text-yellow-500 inline-block mr-1" />,
//     'Discrepancy': <FaTimes className="text-red-500 inline-block mr-1" />
//   };

//   return (
//     <div className="p-6 bg-gray-100 min-h-screen">
//       <h1 className="text-3xl font-bold text-indigo-800 mb-6">Payment Reconciliation</h1>

//       <div className="mb-4 flex flex-wrap items-center space-y-4 md:space-y-0 md:space-x-4">
//         <input
//           type="text"
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           placeholder="Search by reference..."
//           className="p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring focus:border-indigo-300 w-full md:w-1/4"
//         />
//         <div className="flex items-center space-x-2">
//           <input
//             type="date"
//             value={startDate}
//             onChange={(e) => setStartDate(e.target.value)}
//             className="p-2 border rounded-lg focus:outline-none focus:ring focus:border-indigo-300"
//           />
//           <span className="text-gray-600">to</span>
//           <input
//             type="date"
//             value={endDate}
//             onChange={(e) => setEndDate(e.target.value)}
//             className="p-2 border rounded-lg focus:outline-none focus:ring focus:border-indigo-300"
//           />
//         </div>
//         <select
//           value={statusFilter}
//           onChange={(e) => setStatusFilter(e.target.value)}
//           className="p-2 border rounded-lg focus:outline-none focus:ring focus:border-indigo-300"
//         >
//           <option value="all">All Statuses</option>
//           <option value="matched">Matched</option>
//           <option value="pending">Pending</option>
//           <option value="discrepancy">Discrepancy</option>
//         </select>
//         <CSVLink
//           data={filteredTransactions}
//           filename={"reconciliation_report.csv"}
//           className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
//           onClick={downloadCSV}
//         >
//           <FaFileDownload className="inline-block mr-2" /> Download Report
//         </CSVLink>
//       </div>

//       {loading ? (
//         <div className="text-center text-gray-500">Loading transactions...</div>
//       ) : error ? (
//         <div className="text-center text-red-500">{error}</div>
//       ) : (
//         <div className="bg-white shadow-lg rounded-lg overflow-hidden">
//           <table className="w-full text-left">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="py-3 px-4 text-sm font-medium text-gray-600 cursor-pointer" onClick={() => handleSort('id')}>
//                   ID {sortColumn === 'id' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
//                 </th>
//                 <th className="py-3 px-4 text-sm font-medium text-gray-600 cursor-pointer" onClick={() => handleSort('date')}>
//                   Date {sortColumn === 'date' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
//                 </th>
//                 <th className="py-3 px-4 text-sm font-medium text-gray-600 cursor-pointer" onClick={() => handleSort('amount')}>
//                   Amount {sortColumn === 'amount' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
//                 </th>
//                 <th className="py-3 px-4 text-sm font-medium text-gray-600">Status</th>
//                 <th className="py-3 px-4 text-sm font-medium text-gray-600">Type</th>
//                 <th className="py-3 px-4 text-sm font-medium text-gray-600">Reference</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filteredTransactions.map(transaction => (
//                 <tr key={transaction.id} className="border-t">
//                   <td className="py-3 px-4">{transaction.id}</td>
//                   <td className="py-3 px-4">{transaction.date}</td>
//                   <td className="py-3 px-4">KES {transaction.amount}</td>
//                   <td className="py-3 px-4">
//                     {statusIcons[transaction.status] || ''}
//                     <span className={`inline-block px-2 text-xs leading-5 font-semibold rounded-full 
//                       ${transaction.status === 'Matched' ? 'bg-green-100 text-green-800' :
//                         transaction.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
//                           'bg-red-100 text-red-800'}`}
//                     >
//                       {transaction.status}
//                     </span>
//                   </td>
//                   <td className="py-3 px-4">{transaction.type}</td>
//                   <td className="py-3 px-4">{transaction.reference}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//           {filteredTransactions.length === 0 &&
//             <div className="p-4 text-center text-gray-500">No transactions found.</div>
//           }
//         </div>
//       )}

//       <div className="mt-4 text-right font-bold text-indigo-800">
//         Total Earnings: KES {totalAmount.toFixed(2)}
//       </div>

//       <ToastContainer />
//     </div>
//   );
// };

// export default PaymentReconciliation;






// import React, { useState, useEffect } from 'react';
// import { FaSearch, FaFileDownload, FaTimes, FaCheck, FaExclamationTriangle, FaFilter, FaSync, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
// import { toast, ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import { CSVLink } from 'react-csv';
// import DatePicker from 'react-datepicker';
// import 'react-datepicker/dist/react-datepicker.css';
// import jsPDF from 'jspdf';
// import 'jspdf-autotable';

// const PaymentReconciliation = () => {
//   const [transactions, setTransactions] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 7)));
//   const [endDate, setEndDate] = useState(new Date());
//   const [statusFilter, setStatusFilter] = useState('all');
//   const [typeFilter, setTypeFilter] = useState('all');
//   const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [refreshCount, setRefreshCount] = useState(0);
//   const [selectedRows, setSelectedRows] = useState([]);

//   // Enhanced mock data with more fields
//   const mockTransactions = [
//     { id: 1, date: '2023-10-01T09:15:00', amount: 1000.00, status: 'Matched', type: 'Payment', reference: 'MPESA123', account: 'Business', description: 'Service Payment', reconciledBy: 'Admin' },
//     { id: 2, date: '2023-10-02T14:30:00', amount: 500.00, status: 'Pending', type: 'Payment', reference: 'MPESA456', account: 'Personal', description: 'Product Purchase', reconciledBy: '' },
//     { id: 3, date: '2023-10-03T11:45:00', amount: 1500.00, status: 'Discrepancy', type: 'Withdrawal', reference: 'MPESA789', account: 'Merchant', description: 'Cash Withdrawal', reconciledBy: '' },
//     { id: 4, date: '2023-10-04T16:20:00', amount: 2000.00, status: 'Matched', type: 'Payment', reference: 'MPESA101', account: 'Business', description: 'Invoice Payment', reconciledBy: 'Admin' },
//     { id: 5, date: '2023-10-05T10:05:00', amount: 750.00, status: 'Pending', type: 'Deposit', reference: 'MPESA112', account: 'Personal', description: 'Funds Deposit', reconciledBy: '' },
//   ];

//   const fetchTransactions = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       // Simulate API call
//       await new Promise(resolve => setTimeout(resolve, 800));
      
//       // Apply date filtering to mock data
//       const filteredData = mockTransactions.filter(tx => {
//         const txDate = new Date(tx.date);
//         return txDate >= new Date(startDate.setHours(0, 0, 0, 0)) && 
//                txDate <= new Date(endDate.setHours(23, 59, 59, 999));
//       });
      
//       setTransactions(filteredData);
//     } catch (err) {
//       setError('Failed to load reconciliation data. Please try again.');
//       console.error('Error fetching transactions:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchTransactions();
//   }, [refreshCount, startDate, endDate]);

//   const handleRefresh = () => {
//     setRefreshCount(prev => prev + 1);
//     toast.info('Refreshing reconciliation data...');
//   };

//   const handleSort = (key) => {
//     let direction = 'asc';
//     if (sortConfig.key === key && sortConfig.direction === 'asc') {
//       direction = 'desc';
//     }
//     setSortConfig({ key, direction });
//   };

//   const sortedTransactions = [...transactions].sort((a, b) => {
//     if (a[sortConfig.key] < b[sortConfig.key]) {
//       return sortConfig.direction === 'asc' ? -1 : 1;
//     }
//     if (a[sortConfig.key] > b[sortConfig.key]) {
//       return sortConfig.direction === 'asc' ? 1 : -1;
//     }
//     return 0;
//   });

//   const filteredTransactions = sortedTransactions.filter(transaction =>
//     (transaction.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     (transaction.description.toLowerCase().includes(searchTerm.toLowerCase()))) &&
//     (statusFilter === 'all' || transaction.status.toLowerCase() === statusFilter) &&
//     (typeFilter === 'all' || transaction.type.toLowerCase() === typeFilter)
//   );

//   const totalAmount = filteredTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);

//   const handleRowSelect = (id) => {
//     setSelectedRows(prev => 
//       prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
//     );
//   };

//   const bulkReconcile = (status) => {
//     if (selectedRows.length === 0) {
//       toast.warning('Please select at least one transaction');
//       return;
//     }
    
//     const updatedTransactions = transactions.map(tx => 
//       selectedRows.includes(tx.id) ? { ...tx, status, reconciledBy: 'Admin' } : tx
//     );
    
//     setTransactions(updatedTransactions);
//     setSelectedRows([]);
//     toast.success(`${selectedRows.length} transaction(s) marked as ${status}`);
//   };

//   const generateReport = (format) => {
//     try {
//       if (filteredTransactions.length === 0) {
//         toast.warning('No transactions to generate report');
//         return;
//       }

//       if (format === 'pdf') {
//         const doc = new jsPDF();
        
//         // Title
//         doc.setFontSize(16);
//         doc.setTextColor(40, 53, 147);
//         doc.text('PAYMENT RECONCILIATION REPORT', 105, 15, null, null, 'center');
        
//         // Filters info
//         doc.setFontSize(10);
//         doc.setTextColor(100, 100, 100);
//         doc.text(`Date Range: ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`, 14, 25);
//         doc.text(`Status: ${statusFilter === 'all' ? 'All' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}`, 14, 30);
//         doc.text(`Type: ${typeFilter === 'all' ? 'All' : typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1)}`, 14, 35);
        
//         // Table data
//         const headers = [['ID', 'Date', 'Reference', 'Description', 'Type', 'Amount (KES)', 'Status', 'Account']];
//         const data = filteredTransactions.map(tx => [
//           tx.id,
//           new Date(tx.date).toLocaleString(),
//           tx.reference,
//           tx.description,
//           tx.type,
//           tx.amount.toFixed(2),
//           tx.status,
//           tx.account
//         ]);
        
//         // Generate table
//         doc.autoTable({
//           head: headers,
//           body: data,
//           startY: 40,
//           styles: { fontSize: 8 },
//           headStyles: { fillColor: [40, 53, 147], textColor: 255 },
//           alternateRowStyles: { fillColor: [240, 240, 240] },
//           columnStyles: {
//             0: { cellWidth: 10 },
//             1: { cellWidth: 25 },
//             2: { cellWidth: 25 },
//             3: { cellWidth: 30 },
//             4: { cellWidth: 20 },
//             5: { cellWidth: 20 },
//             6: { cellWidth: 20 },
//             7: { cellWidth: 20 }
//           }
//         });
        
//         // Footer
//         doc.setFontSize(10);
//         doc.setTextColor(40, 53, 147);
//         doc.text(`Total Transactions: ${filteredTransactions.length}`, 14, doc.lastAutoTable.finalY + 10);
//         doc.text(`Total Amount: KES ${totalAmount.toFixed(2)}`, 14, doc.lastAutoTable.finalY + 15);
//         doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, doc.lastAutoTable.finalY + 20);
        
//         doc.save(`Reconciliation_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
//         toast.success('PDF report generated successfully');
//       } else if (format === 'csv') {
//         toast.info('Preparing CSV download...');
//       }
//     } catch (err) {
//       toast.error(`Failed to generate report: ${err.message}`);
//     }
//   };

//   // Calculate statistics
//   const stats = {
//     total: filteredTransactions.length,
//     matched: filteredTransactions.filter(tx => tx.status === 'Matched').length,
//     pending: filteredTransactions.filter(tx => tx.status === 'Pending').length,
//     discrepancy: filteredTransactions.filter(tx => tx.status === 'Discrepancy').length,
//     totalAmount: totalAmount
//   };

//   const statusIcons = {
//     'Matched': <FaCheck className="text-green-500 inline-block mr-1" />,
//     'Pending': <FaExclamationTriangle className="text-yellow-500 inline-block mr-1" />,
//     'Discrepancy': <FaTimes className="text-red-500 inline-block mr-1" />
//   };

//   return (
//     <div className="p-6 bg-gray-50 min-h-screen">
//       <div className="max-w-7xl mx-auto">
//         <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
//           <h1 className="text-2xl md:text-3xl font-semibold text-indigo-800 mb-2 md:mb-0">Payment Reconciliation</h1>
//           <div className="flex items-center space-x-2">
//             <button
//               onClick={handleRefresh}
//               className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//             >
//               <FaSync className="mr-1" /> Refresh
//             </button>
//             <div className="relative">
//               <DatePicker
//                 selected={startDate}
//                 onChange={date => setStartDate(date)}
//                 selectsStart
//                 startDate={startDate}
//                 endDate={endDate}
//                 maxDate={new Date()}
//                 className="p-2 border rounded-lg w-32 focus:ring-indigo-500 focus:border-indigo-500"
//                 dateFormat="dd/MM/yyyy"
//               />
//             </div>
//             <span className="text-gray-500">to</span>
//             <div className="relative">
//               <DatePicker
//                 selected={endDate}
//                 onChange={date => setEndDate(date)}
//                 selectsEnd
//                 startDate={startDate}
//                 endDate={endDate}
//                 minDate={startDate}
//                 maxDate={new Date()}
//                 className="p-2 border rounded-lg w-32 focus:ring-indigo-500 focus:border-indigo-500"
//                 dateFormat="dd/MM/yyyy"
//               />
//             </div>
//           </div>
//         </div>

//         {/* Stats Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
//           <div className="bg-white p-4 rounded-lg shadow border-l-4 border-indigo-500">
//             <h3 className="text-gray-500 text-sm">Total Transactions</h3>
//             <p className="text-2xl font-bold">{stats.total}</p>
//           </div>
//           <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
//             <h3 className="text-gray-500 text-sm">Matched</h3>
//             <p className="text-2xl font-bold text-green-600">{stats.matched}</p>
//           </div>
//           <div className="bg-white p-4 rounded-lg shadow border-l-4 border-yellow-500">
//             <h3 className="text-gray-500 text-sm">Pending</h3>
//             <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
//           </div>
//           <div className="bg-white p-4 rounded-lg shadow border-l-4 border-red-500">
//             <h3 className="text-gray-500 text-sm">Total Amount</h3>
//             <p className="text-2xl font-bold">KES {stats.totalAmount.toFixed(2)}</p>
//           </div>
//         </div>

//         {/* Filters and Actions */}
//         <div className="bg-white p-4 rounded-lg shadow mb-6">
//           <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
//             <div className="relative flex-grow">
//               <FaSearch className="absolute left-3 top-3 text-gray-400" />
//               <input
//                 type="text"
//                 className="pl-10 pr-4 py-2 border rounded-lg w-full focus:ring-indigo-500 focus:border-indigo-500"
//                 placeholder="Search by reference or description..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//               />
//             </div>
            
//             <div className="flex space-x-2">
//               <select
//                 className="p-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
//                 value={statusFilter}
//                 onChange={(e) => setStatusFilter(e.target.value)}
//               >
//                 <option value="all">All Statuses</option>
//                 <option value="matched">Matched</option>
//                 <option value="pending">Pending</option>
//                 <option value="discrepancy">Discrepancy</option>
//               </select>
              
//               <select
//                 className="p-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
//                 value={typeFilter}
//                 onChange={(e) => setTypeFilter(e.target.value)}
//               >
//                 <option value="all">All Types</option>
//                 <option value="payment">Payment</option>
//                 <option value="withdrawal">Withdrawal</option>
//                 <option value="deposit">Deposit</option>
//               </select>
//             </div>
            
//             <div className="flex space-x-2">
//               <button
//                 onClick={() => bulkReconcile('Matched')}
//                 className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
//               >
//                 <FaCheck className="mr-1" /> Mark as Matched
//               </button>
//               <button
//                 onClick={() => bulkReconcile('Discrepancy')}
//                 className="flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
//               >
//                 <FaTimes className="mr-1" /> Flag Discrepancy
//               </button>
//             </div>
            
//             <div className="flex space-x-2">
//               <button
//                 onClick={() => generateReport('pdf')}
//                 className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//               >
//                 <FaFileDownload className="mr-2" /> PDF
//               </button>
              
//               <CSVLink
//                 data={filteredTransactions}
//                 filename={`reconciliation_report_${new Date().toISOString().slice(0, 10)}.csv`}
//                 className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
//               >
//                 <FaFileDownload className="mr-2" /> CSV
//               </CSVLink>
//             </div>
//           </div>
//         </div>

//         {/* Transaction Table */}
//         {loading ? (
//           <div className="text-center py-8">
//             <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mb-2"></div>
//             <p>Loading reconciliation data...</p>
//           </div>
//         ) : error ? (
//           <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
//             <div className="flex">
//               <div className="flex-shrink-0">
//                 <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
//                   <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
//                 </svg>
//               </div>
//               <div className="ml-3">
//                 <p className="text-sm text-red-700">{error}</p>
//               </div>
//             </div>
//           </div>
//         ) : (
//           <div className="bg-white rounded-lg shadow overflow-hidden">
//             <div className="overflow-x-auto">
//               <table className="min-w-full divide-y divide-gray-200">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       <input 
//                         type="checkbox" 
//                         className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
//                         checked={selectedRows.length === filteredTransactions.length && filteredTransactions.length > 0}
//                         onChange={() => {
//                           if (selectedRows.length === filteredTransactions.length) {
//                             setSelectedRows([]);
//                           } else {
//                             setSelectedRows(filteredTransactions.map(tx => tx.id));
//                           }
//                         }}
//                       />
//                     </th>
//                     <th 
//                       scope="col" 
//                       className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
//                       onClick={() => handleSort('id')}
//                     >
//                       <div className="flex items-center">
//                         ID
//                         {sortConfig.key === 'id' && (
//                           sortConfig.direction === 'asc' ? <FaSortUp className="ml-1" /> : <FaSortDown className="ml-1" />
//                         )}
//                         {sortConfig.key !== 'id' && <FaSort className="ml-1 text-gray-300" />}
//                       </div>
//                     </th>
//                     <th 
//                       scope="col" 
//                       className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
//                       onClick={() => handleSort('date')}
//                     >
//                       <div className="flex items-center">
//                         Date
//                         {sortConfig.key === 'date' && (
//                           sortConfig.direction === 'asc' ? <FaSortUp className="ml-1" /> : <FaSortDown className="ml-1" />
//                         )}
//                         {sortConfig.key !== 'date' && <FaSort className="ml-1 text-gray-300" />}
//                       </div>
//                     </th>
//                     <th 
//                       scope="col" 
//                       className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
//                       onClick={() => handleSort('reference')}
//                     >
//                       <div className="flex items-center">
//                         Reference
//                         {sortConfig.key === 'reference' && (
//                           sortConfig.direction === 'asc' ? <FaSortUp className="ml-1" /> : <FaSortDown className="ml-1" />
//                         )}
//                         {sortConfig.key !== 'reference' && <FaSort className="ml-1 text-gray-300" />}
//                       </div>
//                     </th>
//                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Description
//                     </th>
//                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Type
//                     </th>
//                     <th 
//                       scope="col" 
//                       className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
//                       onClick={() => handleSort('amount')}
//                     >
//                       <div className="flex items-center">
//                         Amount (KES)
//                         {sortConfig.key === 'amount' && (
//                           sortConfig.direction === 'asc' ? <FaSortUp className="ml-1" /> : <FaSortDown className="ml-1" />
//                         )}
//                         {sortConfig.key !== 'amount' && <FaSort className="ml-1 text-gray-300" />}
//                       </div>
//                     </th>
//                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Status
//                     </th>
//                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Account
//                     </th>
//                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Reconciled By
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-200">
//                   {filteredTransactions.length > 0 ? (
//                     filteredTransactions.map((transaction) => (
//                       <tr key={transaction.id} className={selectedRows.includes(transaction.id) ? 'bg-indigo-50' : 'hover:bg-gray-50'}>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <input
//                             type="checkbox"
//                             className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
//                             checked={selectedRows.includes(transaction.id)}
//                             onChange={() => handleRowSelect(transaction.id)}
//                           />
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                           {transaction.id}
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                           {new Date(transaction.date).toLocaleString()}
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
//                           {transaction.reference}
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                           {transaction.description}
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                           {transaction.type}
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
//                           {transaction.amount.toFixed(2)}
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
//                             transaction.status === 'Matched' 
//                               ? 'bg-green-100 text-green-800' 
//                               : transaction.status === 'Pending' 
//                                 ? 'bg-yellow-100 text-yellow-800' 
//                                 : 'bg-red-100 text-red-800'
//                           }`}>
//                             {statusIcons[transaction.status]}
//                             {transaction.status}
//                           </span>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                           {transaction.account}
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                           {transaction.reconciledBy || '-'}
//                         </td>
//                       </tr>
//                     ))
//                   ) : (
//                     <tr>
//                       <td colSpan="10" className="px-6 py-4 text-center text-sm text-gray-500">
//                         No reconciliation records found matching your criteria
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         )}
//       </div>
//       <ToastContainer position="top-right" autoClose={5000} />
//     </div>
//   );
// };

// export default PaymentReconciliation;








// import React, { useState, useEffect, useMemo, useCallback } from 'react';
// import { toast, ToastContainer } from 'react-toastify';
// import { FaSearch, FaDownload, FaSortAmountDown, FaSortAmountUp, FaCalendarAlt, FaMoneyBillWave, FaReceipt } from 'react-icons/fa';
// import { AiOutlineReload } from 'react-icons/ai';
// import jsPDF from 'jspdf';
// import 'jspdf-autotable';
// import { CSVLink } from 'react-csv';
// import 'react-toastify/dist/ReactToastify.css';
// import DatePicker from 'react-datepicker';
// import 'react-datepicker/dist/react-datepicker.css';

// const PaymentReconciliation = () => {
//   const [searchTerm, setSearchTerm] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [sortDirection, setSortDirection] = useState('date_desc');
//   const [startDate, setStartDate] = useState(() => new Date(new Date().setDate(new Date().getDate() - 7)));
//   const [endDate, setEndDate] = useState(new Date());
//   const [refreshCount, setRefreshCount] = useState(0);
//   const [viewMode, setViewMode] = useState('all');
//   const [payments, setPayments] = useState([]);
//   const [expenses, setExpenses] = useState([]);

//   const mockPayments = useMemo(() => [
//     { id: 1, paymentId: 'PY100523456', userName: 'John Doe', amount: 1000, date: new Date().toISOString(), source: 'WiFi Sales', category: 'Revenue' },
//     { id: 2, paymentId: 'PY100665432', userName: 'Jane Smith', amount: 500, date: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(), source: 'WiFi Sales', category: 'Revenue' },
//     { id: 3, paymentId: 'PY100798765', userName: 'Bob Johnson', amount: 2000, date: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(), source: 'WiFi Sales', category: 'Revenue' },
//     { id: 4, paymentId: 'PY100845678', userName: 'Alice Brown', amount: 1500, date: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(), source: 'WiFi Sales', category: 'Revenue' },
//     { id: 5, paymentId: 'PY100932165', userName: 'Mike Wilson', amount: 750, date: new Date(new Date().setDate(new Date().getDate() - 4)).toISOString(), source: 'WiFi Sales', category: 'Revenue' },
//   ], []);

//   const mockExpenses = useMemo(() => [
//     { id: 1, expenseId: 'EX100523456', amount: 300, date: new Date().toISOString(), description: 'Office Supplies', category: 'Operations' },
//     { id: 2, expenseId: 'EX100665432', amount: 200, date: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(), description: 'Internet Bill', category: 'Utilities' },
//     { id: 3, expenseId: 'EX100798765', amount: 500, date: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(), description: 'Salaries', category: 'Payroll' },
//     { id: 4, expenseId: 'EX100845678', amount: 150, date: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(), description: 'Marketing', category: 'Advertising' },
//     { id: 5, expenseId: 'EX100932165', amount: 100, date: new Date(new Date().setDate(new Date().getDate() - 4)).toISOString(), description: 'Transport', category: 'Logistics' },
//   ], []);

//   const fetchData = useCallback(async () => {
//     setLoading(true);
//     setError(null);
    
//     try {
//       await new Promise(resolve => setTimeout(resolve, 800));
      
//       const start = new Date(startDate);
//       const end = new Date(endDate);
      
//       const filteredPayments = mockPayments.filter(payment => {
//         const paymentDate = new Date(payment.date);
//         return paymentDate >= new Date(start.setHours(0, 0, 0, 0)) && 
//                paymentDate <= new Date(end.setHours(23, 59, 59, 999));
//       });
      
//       const filteredExpenses = mockExpenses.filter(expense => {
//         const expenseDate = new Date(expense.date);
//         return expenseDate >= new Date(start.setHours(0, 0, 0, 0)) && 
//                expenseDate <= new Date(end.setHours(23, 59, 59, 999));
//       });
      
//       setPayments(filteredPayments);
//       setExpenses(filteredExpenses);
      
//       if (filteredPayments.length === 0 && filteredExpenses.length === 0) {
//         toast.info('No records found for the selected date range', { autoClose: 3000 });
//       }
//     } catch (err) {
//       setError('Failed to load data. Please try again.');
//       console.error('Error fetching data:', err);
//       toast.error('Failed to load data. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   }, [startDate, endDate, refreshCount]);

//   useEffect(() => {
//     fetchData();
//   }, [fetchData]);

//   const handleRefresh = useCallback(() => {
//     setRefreshCount(prev => prev + 1);
//     toast.info('Refreshing data...', { autoClose: 2000 });
//   }, []);

//   const filteredPayments = useMemo(() => payments.filter(
//     payment =>
//       payment.paymentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       payment.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       payment.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       payment.userName.toLowerCase().includes(searchTerm.toLowerCase())
//   ), [payments, searchTerm]);

//   const filteredExpenses = useMemo(() => expenses.filter(
//     expense =>
//       expense.expenseId.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       expense.category.toLowerCase().includes(searchTerm.toLowerCase())
//   ), [expenses, searchTerm]);

//   const sortedPayments = useMemo(() => [...filteredPayments].sort((a, b) => {
//     const dateA = new Date(a.date);
//     const dateB = new Date(b.date);
    
//     if (sortDirection === 'amount_asc') return a.amount - b.amount;
//     if (sortDirection === 'amount_desc') return b.amount - a.amount;
//     if (sortDirection === 'date_asc') return dateA.getTime() - dateB.getTime();
//     return dateB.getTime() - dateA.getTime();
//   }), [filteredPayments, sortDirection]);

//   const sortedExpenses = useMemo(() => [...filteredExpenses].sort((a, b) => {
//     const dateA = new Date(a.date);
//     const dateB = new Date(b.date);
    
//     if (sortDirection === 'amount_asc') return a.amount - b.amount;
//     if (sortDirection === 'amount_desc') return b.amount - a.amount;
//     if (sortDirection === 'date_asc') return dateA.getTime() - dateB.getTime();
//     return dateB.getTime() - dateA.getTime();
//   }), [filteredExpenses, sortDirection]);

//   const toggleSort = useCallback((type) => {
//     if (type === 'amount') {
//       setSortDirection(prev => prev === 'amount_asc' ? 'amount_desc' : 'amount_asc');
//     } else {
//       setSortDirection(prev => prev === 'date_asc' ? 'date_desc' : 'date_asc');
//     }
//   }, []);

//   const generateReport = useCallback((type) => {
//     try {
//       if ((viewMode === 'all' || viewMode === 'revenue') && sortedPayments.length === 0 && 
//           (viewMode === 'all' || viewMode === 'expenses') && sortedExpenses.length === 0) {
//         toast.warning('No data to generate report', { autoClose: 3000 });
//         return;
//       }

//       if (type === 'pdf') {
//         const doc = new jsPDF();
        
//         doc.setFontSize(16);
//         doc.setTextColor(40, 53, 147);
//         doc.text('PAYMENT RECONCILIATION REPORT', 105, 15, { align: 'center' });
        
//         doc.setFontSize(10);
//         doc.setTextColor(100, 100, 100);
//         doc.text(`Date Range: ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`, 14, 25);
//         doc.text(`View Mode: ${viewMode === 'all' ? 'All' : viewMode.charAt(0).toUpperCase() + viewMode.slice(1)}`, 14, 30);
        
//         let startY = 40;
        
//         if ((viewMode === 'all' || viewMode === 'revenue') && sortedPayments.length > 0) {
//           doc.setFontSize(12);
//           doc.setTextColor(40, 53, 147);
//           doc.text('REVENUE', 14, startY);
//           startY += 10;
          
//           const revenueHeaders = [['Payment ID', 'User', 'Source', 'Category', 'Amount (KES)', 'Date']];
//           const revenueData = sortedPayments.map(payment => [
//             payment.paymentId,
//             payment.userName,
//             payment.source,
//             payment.category,
//             payment.amount.toLocaleString(),
//             new Date(payment.date).toLocaleDateString()
//           ]);
          
//           doc.autoTable({
//             head: revenueHeaders,
//             body: revenueData,
//             startY,
//             styles: { fontSize: 8 },
//             headStyles: { fillColor: [40, 53, 147], textColor: 255 },
//             alternateRowStyles: { fillColor: [240, 240, 240] }
//           });
          
//           startY = doc.lastAutoTable.finalY + 10;
//         }
        
//         if ((viewMode === 'all' || viewMode === 'expenses') && sortedExpenses.length > 0) {
//           doc.setFontSize(12);
//           doc.setTextColor(40, 53, 147);
//           doc.text('EXPENSES', 14, startY);
//           startY += 10;
          
//           const expenseHeaders = [['Expense ID', 'Description', 'Category', 'Amount (KES)', 'Date']];
//           const expenseData = sortedExpenses.map(expense => [
//             expense.expenseId,
//             expense.description,
//             expense.category,
//             expense.amount.toLocaleString(),
//             new Date(expense.date).toLocaleDateString()
//           ]);
          
//           doc.autoTable({
//             head: expenseHeaders,
//             body: expenseData,
//             startY,
//             styles: { fontSize: 8 },
//             headStyles: { fillColor: [153, 0, 0], textColor: 255 },
//             alternateRowStyles: { fillColor: [255, 240, 240] }
//           });
          
//           startY = doc.lastAutoTable.finalY + 10;
//         }
        
//         const totalRevenue = sortedPayments.reduce((sum, payment) => sum + payment.amount, 0);
//         const totalExpenses = sortedExpenses.reduce((sum, expense) => sum + expense.amount, 0);
//         const profit = totalRevenue - totalExpenses;
        
//         doc.setFontSize(10);
//         doc.setTextColor(40, 53, 147);
        
//         if (viewMode === 'all' || viewMode === 'revenue') {
//           doc.text(`Total Revenue: KES ${totalRevenue.toLocaleString()}`, 14, startY);
//           startY += 5;
//         }
        
//         if (viewMode === 'all' || viewMode === 'expenses') {
//           doc.text(`Total Expenses: KES ${totalExpenses.toLocaleString()}`, 14, startY);
//           startY += 5;
//         }
        
//         if (viewMode === 'all') {
//           doc.text(`Profit: KES ${profit.toLocaleString()}`, 14, startY);
//           startY += 5;
//         }
        
//         doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, startY);
        
//         doc.save(`Payment_Reconciliation_${new Date().toISOString().slice(0, 10)}.pdf`);
//         toast.success('PDF report generated successfully');
//       } else if (type === 'csv') {
//         toast.info('Preparing CSV download...', { autoClose: 2000 });
//       }
//     } catch (err) {
//       console.error('Report generation error:', err);
//       toast.error(`Failed to generate report: ${err.message}`);
//     }
//   }, [sortedPayments, sortedExpenses, viewMode, startDate, endDate]);

//   const { totalRevenue, totalExpenses, profit } = useMemo(() => {
//     const rev = payments.reduce((sum, payment) => sum + payment.amount, 0);
//     const exp = expenses.reduce((sum, expense) => sum + expense.amount, 0);
//     return {
//       totalRevenue: rev,
//       totalExpenses: exp,
//       profit: rev - exp
//     };
//   }, [payments, expenses]);

//   const csvData = useMemo(() => {
//     if (viewMode === 'all') {
//       return [
//         ...sortedPayments.map(p => ({
//           'Type': 'Revenue',
//           'ID': p.paymentId,
//           'User': p.userName,
//           'Source': p.source,
//           'Category': p.category,
//           'Amount (KES)': p.amount,
//           'Date': new Date(p.date).toLocaleDateString()
//         })),
//         ...sortedExpenses.map(e => ({
//           'Type': 'Expense',
//           'ID': e.expenseId,
//           'Description': e.description,
//           'Category': e.category,
//           'Amount (KES)': e.amount,
//           'Date': new Date(e.date).toLocaleDateString()
//         }))
//       ];
//     } else if (viewMode === 'revenue') {
//       return sortedPayments.map(p => ({
//         'Type': 'Revenue',
//         'ID': p.paymentId,
//         'User': p.userName,
//         'Source': p.source,
//         'Category': p.category,
//         'Amount (KES)': p.amount,
//         'Date': new Date(p.date).toLocaleDateString()
//       }));
//     } else {
//       return sortedExpenses.map(e => ({
//         'Type': 'Expense',
//         'ID': e.expenseId,
//         'Description': e.description,
//         'Category': e.category,
//         'Amount (KES)': e.amount,
//         'Date': new Date(e.date).toLocaleDateString()
//       }));
//     }
//   }, [sortedPayments, sortedExpenses, viewMode]);

//   return (
//     <div className="p-6 bg-gray-50 min-h-screen">
//       <div className="max-w-7xl mx-auto">
//         <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
//           <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 flex items-center">
//             <FaMoneyBillWave className="mr-2 text-blue-600" /> Payment Reconciliation
//           </h1>
//           <div className="flex items-center space-x-2 mt-2 md:mt-0">
//             <button
//               onClick={handleRefresh}
//               className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               aria-label="Refresh data"
//             >
//               <AiOutlineReload className="mr-1" /> Refresh
//             </button>
//             <div className="relative">
//               <DatePicker
//                 selected={startDate}
//                 onChange={date => date && setStartDate(date)}
//                 selectsStart
//                 startDate={startDate}
//                 endDate={endDate}
//                 maxDate={new Date()}
//                 className="p-2 border rounded-lg w-32 focus:ring-blue-500 focus:border-blue-500"
//                 dateFormat="dd/MM/yyyy"
//                 aria-label="Start date"
//               />
//               <FaCalendarAlt className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
//             </div>
//             <span className="text-gray-500">to</span>
//             <div className="relative">
//               <DatePicker
//                 selected={endDate}
//                 onChange={date => date && setEndDate(date)}
//                 selectsEnd
//                 startDate={startDate}
//                 endDate={endDate}
//                 minDate={startDate}
//                 maxDate={new Date()}
//                 className="p-2 border rounded-lg w-32 focus:ring-blue-500 focus:border-blue-500"
//                 dateFormat="dd/MM/yyyy"
//                 aria-label="End date"
//               />
//               <FaCalendarAlt className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
//             </div>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//           <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
//             <h3 className="text-gray-500 text-sm">Total Revenue</h3>
//             <p className="text-2xl font-bold text-green-600">KES {totalRevenue.toLocaleString()}</p>
//           </div>
//           <div className="bg-white p-4 rounded-lg shadow border-l-4 border-red-500">
//             <h3 className="text-gray-500 text-sm">Total Expenses</h3>
//             <p className="text-2xl font-bold text-red-600">KES {totalExpenses.toLocaleString()}</p>
//           </div>
//           <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
//             <h3 className="text-gray-500 text-sm">Profit</h3>
//             <p className={`text-2xl font-bold ${profit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
//               KES {profit.toLocaleString()}
//             </p>
//           </div>
//         </div>

//         <div className="bg-white p-4 rounded-lg shadow mb-6">
//           <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
//             <div className="relative flex-grow">
//               <FaSearch className="absolute left-3 top-3 text-gray-400" />
//               <input
//                 type="text"
//                 className="pl-10 pr-4 py-2 border rounded-lg w-full focus:ring-blue-500 focus:border-blue-500"
//                 placeholder="Search by ID, source, user, or category..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 aria-label="Search payments and expenses"
//               />
//             </div>
            
//             <div className="flex space-x-2">
//               <select
//                 className="p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
//                 value={viewMode}
//                 onChange={(e) => setViewMode(e.target.value)}
//                 aria-label="View mode"
//               >
//                 <option value="all">All</option>
//                 <option value="revenue">Revenue</option>
//                 <option value="expenses">Expenses</option>
//               </select>
              
//               <button
//                 className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50"
//                 onClick={() => toggleSort('date')}
//                 aria-label="Sort by date"
//               >
//                 {sortDirection.includes('date') ? (
//                   sortDirection === 'date_asc' ? <FaSortAmountUp className="mr-1" /> : <FaSortAmountDown className="mr-1" />
//                 ) : (
//                   <FaSortAmountDown className="mr-1" />
//                 )}
//                 Date
//               </button>
              
//               <button
//                 className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50"
//                 onClick={() => toggleSort('amount')}
//                 aria-label="Sort by amount"
//               >
//                 {sortDirection.includes('amount') ? (
//                   sortDirection === 'amount_asc' ? <FaSortAmountUp className="mr-1" /> : <FaSortAmountDown className="mr-1" />
//                 ) : (
//                   <FaSortAmountDown className="mr-1" />
//                 )}
//                 Amount
//               </button>
//             </div>
            
//             <div className="flex space-x-2">
//               <button
//                 onClick={() => generateReport('pdf')}
//                 className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 aria-label="Generate PDF report"
//               >
//                 <FaDownload className="mr-2" /> PDF
//               </button>
              
//               <CSVLink
//                 data={csvData}
//                 filename={`payment_reconciliation_${new Date().toISOString().slice(0, 10)}.csv`}
//                 className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
//                 aria-label="Download CSV"
//               >
//                 <FaDownload className="mr-2" /> CSV
//               </CSVLink>
//             </div>
//           </div>
//         </div>

//         {error && (
//           <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6" role="alert">
//             <div className="flex">
//               <div className="flex-shrink-0">
//                 <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
//                   <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
//                 </svg>
//               </div>
//               <div className="ml-3">
//                 <p className="text-sm text-red-700">{error}</p>
//               </div>
//             </div>
//           </div>
//         )}

//         {loading ? (
//           <div className="text-center py-8" aria-live="polite">
//             <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
//             <p>Loading data...</p>
//           </div>
//         ) : (
//           <div className="space-y-6">
//             {(viewMode === 'all' || viewMode === 'revenue') && (
//               <div className="bg-white rounded-lg shadow overflow-hidden">
//                 <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
//                   <h2 className="text-lg font-medium text-gray-900 flex items-center">
//                     <FaMoneyBillWave className="mr-2 text-green-600" /> Revenue
//                   </h2>
//                   <span className="text-sm text-gray-500">
//                     {sortedPayments.length} records
//                   </span>
//                 </div>
//                 <div className="overflow-x-auto">
//                   <table className="min-w-full divide-y divide-gray-200">
//                     <thead className="bg-gray-50">
//                       <tr>
//                         <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Payment ID
//                         </th>
//                         <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           User
//                         </th>
//                         <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Source
//                         </th>
//                         <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Category
//                         </th>
//                         <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Amount (KES)
//                         </th>
//                         <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Date
//                         </th>
//                       </tr>
//                     </thead>
//                     <tbody className="bg-white divide-y divide-gray-200">
//                       {sortedPayments.length > 0 ? (
//                         sortedPayments.map((payment) => (
//                           <tr key={payment.id} className="hover:bg-gray-50">
//                             <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
//                               {payment.paymentId}
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                               {payment.userName}
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                               {payment.source}
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                               {payment.category}
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
//                               {payment.amount.toLocaleString()}
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                               {new Date(payment.date).toLocaleDateString()}
//                             </td>
//                           </tr>
//                         ))
//                       ) : (
//                         <tr>
//                           <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
//                             No revenue records found
//                           </td>
//                         </tr>
//                       )}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             )}

//             {(viewMode === 'all' || viewMode === 'expenses') && (
//               <div className="bg-white rounded-lg shadow overflow-hidden">
//                 <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
//                   <h2 className="text-lg font-medium text-gray-900 flex items-center">
//                     <FaReceipt className="mr-2 text-red-600" /> Expenses
//                   </h2>
//                   <span className="text-sm text-gray-500">
//                     {sortedExpenses.length} records
//                   </span>
//                 </div>
//                 <div className="overflow-x-auto">
//                   <table className="min-w-full divide-y divide-gray-200">
//                     <thead className="bg-gray-50">
//                       <tr>
//                         <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Expense ID
//                         </th>
//                         <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Description
//                         </th>
//                         <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Category
//                         </th>
//                         <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Amount (KES)
//                         </th>
//                         <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Date
//                         </th>
//                       </tr>
//                     </thead>
//                     <tbody className="bg-white divide-y divide-gray-200">
//                       {sortedExpenses.length > 0 ? (
//                         sortedExpenses.map((expense) => (
//                           <tr key={expense.id} className="hover:bg-gray-50">
//                             <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
//                               {expense.expenseId}
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                               {expense.description}
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                               {expense.category}
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
//                               {expense.amount.toLocaleString()}
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                               {new Date(expense.date).toLocaleDateString()}
//                             </td>
//                           </tr>
//                         ))
//                       ) : (
//                         <tr>
//                           <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
//                             No expense records found
//                           </td>
//                         </tr>
//                       )}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//       <ToastContainer position="top-right" autoClose={5000} />
//     </div>
//   );
// };

// export default PaymentReconciliation;












// import React, { useState, useEffect, useMemo, useCallback } from 'react';
// import { toast, ToastContainer } from 'react-toastify';
// import { FaSearch, FaDownload, FaSortAmountDown, FaSortAmountUp, FaCalendarAlt, FaMoneyBillWave, FaReceipt, FaPlus } from 'react-icons/fa';
// import { AiOutlineReload } from 'react-icons/ai';
// import jsPDF from 'jspdf';
// import 'jspdf-autotable';
// import { CSVLink } from 'react-csv';
// import 'react-toastify/dist/ReactToastify.css';
// import DatePicker from 'react-datepicker';
// import 'react-datepicker/dist/react-datepicker.css';

// const PaymentReconciliation = () => {
//   const [searchTerm, setSearchTerm] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [sortDirection, setSortDirection] = useState('date_desc');
//   const [startDate, setStartDate] = useState(() => new Date(new Date().setDate(new Date().getDate() - 7)));
//   const [endDate, setEndDate] = useState(new Date());
//   const [refreshCount, setRefreshCount] = useState(0);
//   const [viewMode, setViewMode] = useState('all');
//   const [payments, setPayments] = useState([]);
//   const [expenses, setExpenses] = useState([]);
//   const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
//   const [newExpense, setNewExpense] = useState({
//     description: '',
//     amount: '',
//     category: 'Operations',
//     date: new Date().toISOString()
//   });

//   const mockPayments = useMemo(() => [
//     { id: 1, paymentId: 'PY100523456', userName: 'John Doe', amount: 1000, date: new Date().toISOString(), source: 'WiFi Sales', category: 'Revenue' },
//     { id: 2, paymentId: 'PY100665432', userName: 'Jane Smith', amount: 500, date: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(), source: 'WiFi Sales', category: 'Revenue' },
//     { id: 3, paymentId: 'PY100798765', userName: 'Bob Johnson', amount: 2000, date: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(), source: 'WiFi Sales', category: 'Revenue' },
//     { id: 4, paymentId: 'PY100845678', userName: 'Alice Brown', amount: 1500, date: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(), source: 'WiFi Sales', category: 'Revenue' },
//     { id: 5, paymentId: 'PY100932165', userName: 'Mike Wilson', amount: 750, date: new Date(new Date().setDate(new Date().getDate() - 4)).toISOString(), source: 'WiFi Sales', category: 'Revenue' },
//   ], []);

//   const mockExpenses = useMemo(() => [
//     { id: 1, expenseId: 'EX100523456', amount: 300, date: new Date().toISOString(), description: 'Office Supplies', category: 'Operations' },
//     { id: 2, expenseId: 'EX100665432', amount: 200, date: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(), description: 'Internet Bill', category: 'Utilities' },
//     { id: 3, expenseId: 'EX100798765', amount: 500, date: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(), description: 'Salaries', category: 'Payroll' },
//     { id: 4, expenseId: 'EX100845678', amount: 150, date: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(), description: 'Marketing', category: 'Advertising' },
//     { id: 5, expenseId: 'EX100932165', amount: 100, date: new Date(new Date().setDate(new Date().getDate() - 4)).toISOString(), description: 'Transport', category: 'Logistics' },
//   ], []);

//   const expenseCategories = [
//     'Operations', 'Utilities', 'Payroll', 'Advertising', 'Logistics', 
//     'Maintenance', 'Office Supplies', 'Travel', 'Training', 'Other'
//   ];

//   const fetchData = useCallback(async () => {
//     setLoading(true);
//     setError(null);
    
//     try {
//       await new Promise(resolve => setTimeout(resolve, 800));
      
//       const start = new Date(startDate);
//       const end = new Date(endDate);
      
//       const filteredPayments = mockPayments.filter(payment => {
//         const paymentDate = new Date(payment.date);
//         return paymentDate >= new Date(start.setHours(0, 0, 0, 0)) && 
//                paymentDate <= new Date(end.setHours(23, 59, 59, 999));
//       });
      
//       const filteredExpenses = mockExpenses.filter(expense => {
//         const expenseDate = new Date(expense.date);
//         return expenseDate >= new Date(start.setHours(0, 0, 0, 0)) && 
//                expenseDate <= new Date(end.setHours(23, 59, 59, 999));
//       });
      
//       setPayments(filteredPayments);
//       setExpenses(filteredExpenses);
      
//       if (filteredPayments.length === 0 && filteredExpenses.length === 0) {
//         toast.info('No records found for the selected date range', { autoClose: 3000 });
//       }
//     } catch (err) {
//       setError('Failed to load data. Please try again.');
//       console.error('Error fetching data:', err);
//       toast.error('Failed to load data. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   }, [startDate, endDate, refreshCount]);

//   useEffect(() => {
//     fetchData();
//   }, [fetchData]);

//   const handleRefresh = useCallback(() => {
//     setRefreshCount(prev => prev + 1);
//     toast.info('Refreshing data...', { autoClose: 2000 });
//   }, []);

//   const filteredPayments = useMemo(() => payments.filter(
//     payment =>
//       payment.paymentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       payment.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       payment.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       payment.userName.toLowerCase().includes(searchTerm.toLowerCase())
//   ), [payments, searchTerm]);

//   const filteredExpenses = useMemo(() => expenses.filter(
//     expense =>
//       expense.expenseId.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       expense.category.toLowerCase().includes(searchTerm.toLowerCase())
//   ), [expenses, searchTerm]);

//   const sortedPayments = useMemo(() => [...filteredPayments].sort((a, b) => {
//     const dateA = new Date(a.date);
//     const dateB = new Date(b.date);
    
//     if (sortDirection === 'amount_asc') return a.amount - b.amount;
//     if (sortDirection === 'amount_desc') return b.amount - a.amount;
//     if (sortDirection === 'date_asc') return dateA.getTime() - dateB.getTime();
//     return dateB.getTime() - dateA.getTime();
//   }), [filteredPayments, sortDirection]);

//   const sortedExpenses = useMemo(() => [...filteredExpenses].sort((a, b) => {
//     const dateA = new Date(a.date);
//     const dateB = new Date(b.date);
    
//     if (sortDirection === 'amount_asc') return a.amount - b.amount;
//     if (sortDirection === 'amount_desc') return b.amount - a.amount;
//     if (sortDirection === 'date_asc') return dateA.getTime() - dateB.getTime();
//     return dateB.getTime() - dateA.getTime();
//   }), [filteredExpenses, sortDirection]);

//   const toggleSort = useCallback((type) => {
//     if (type === 'amount') {
//       setSortDirection(prev => prev === 'amount_asc' ? 'amount_desc' : 'amount_asc');
//     } else {
//       setSortDirection(prev => prev === 'date_asc' ? 'date_desc' : 'date_asc');
//     }
//   }, []);

//   const generateReport = useCallback((type) => {
//     try {
//       if ((viewMode === 'all' || viewMode === 'revenue') && sortedPayments.length === 0 && 
//           (viewMode === 'all' || viewMode === 'expenses') && sortedExpenses.length === 0) {
//         toast.warning('No data to generate report', { autoClose: 3000 });
//         return;
//       }

//       if (type === 'pdf') {
//         const doc = new jsPDF();
        
//         doc.setFontSize(16);
//         doc.setTextColor(40, 53, 147);
//         doc.text('PAYMENT RECONCILIATION REPORT', 105, 15, { align: 'center' });
        
//         doc.setFontSize(10);
//         doc.setTextColor(100, 100, 100);
//         doc.text(`Date Range: ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`, 14, 25);
//         doc.text(`View Mode: ${viewMode === 'all' ? 'All' : viewMode.charAt(0).toUpperCase() + viewMode.slice(1)}`, 14, 30);
        
//         let startY = 40;
        
//         if ((viewMode === 'all' || viewMode === 'revenue') && sortedPayments.length > 0) {
//           doc.setFontSize(12);
//           doc.setTextColor(40, 53, 147);
//           doc.text('REVENUE', 14, startY);
//           startY += 10;
          
//           const revenueHeaders = [['Payment ID', 'User', 'Source', 'Category', 'Amount (KES)', 'Date']];
//           const revenueData = sortedPayments.map(payment => [
//             payment.paymentId,
//             payment.userName,
//             payment.source,
//             payment.category,
//             payment.amount.toLocaleString(),
//             new Date(payment.date).toLocaleDateString()
//           ]);
          
//           doc.autoTable({
//             head: revenueHeaders,
//             body: revenueData,
//             startY,
//             styles: { fontSize: 8 },
//             headStyles: { fillColor: [40, 53, 147], textColor: 255 },
//             alternateRowStyles: { fillColor: [240, 240, 240] }
//           });
          
//           startY = doc.lastAutoTable.finalY + 10;
//         }
        
//         if ((viewMode === 'all' || viewMode === 'expenses') && sortedExpenses.length > 0) {
//           doc.setFontSize(12);
//           doc.setTextColor(40, 53, 147);
//           doc.text('EXPENSES', 14, startY);
//           startY += 10;
          
//           const expenseHeaders = [['Expense ID', 'Description', 'Category', 'Amount (KES)', 'Date']];
//           const expenseData = sortedExpenses.map(expense => [
//             expense.expenseId,
//             expense.description,
//             expense.category,
//             expense.amount.toLocaleString(),
//             new Date(expense.date).toLocaleDateString()
//           ]);
          
//           doc.autoTable({
//             head: expenseHeaders,
//             body: expenseData,
//             startY,
//             styles: { fontSize: 8 },
//             headStyles: { fillColor: [153, 0, 0], textColor: 255 },
//             alternateRowStyles: { fillColor: [255, 240, 240] }
//           });
          
//           startY = doc.lastAutoTable.finalY + 10;
//         }
        
//         const totalRevenue = sortedPayments.reduce((sum, payment) => sum + payment.amount, 0);
//         const totalExpenses = sortedExpenses.reduce((sum, expense) => sum + expense.amount, 0);
//         const profit = totalRevenue - totalExpenses;
        
//         doc.setFontSize(10);
//         doc.setTextColor(40, 53, 147);
        
//         if (viewMode === 'all' || viewMode === 'revenue') {
//           doc.text(`Total Revenue: KES ${totalRevenue.toLocaleString()}`, 14, startY);
//           startY += 5;
//         }
        
//         if (viewMode === 'all' || viewMode === 'expenses') {
//           doc.text(`Total Expenses: KES ${totalExpenses.toLocaleString()}`, 14, startY);
//           startY += 5;
//         }
        
//         if (viewMode === 'all') {
//           doc.text(`Profit: KES ${profit.toLocaleString()}`, 14, startY);
//           startY += 5;
//         }
        
//         doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, startY);
        
//         doc.save(`Payment_Reconciliation_${new Date().toISOString().slice(0, 10)}.pdf`);
//         toast.success('PDF report generated successfully');
//       } else if (type === 'csv') {
//         toast.info('Preparing CSV download...', { autoClose: 2000 });
//       }
//     } catch (err) {
//       console.error('Report generation error:', err);
//       toast.error(`Failed to generate report: ${err.message}`);
//     }
//   }, [sortedPayments, sortedExpenses, viewMode, startDate, endDate]);

//   const { totalRevenue, totalExpenses, profit } = useMemo(() => {
//     const rev = payments.reduce((sum, payment) => sum + payment.amount, 0);
//     const exp = expenses.reduce((sum, expense) => sum + expense.amount, 0);
//     return {
//       totalRevenue: rev,
//       totalExpenses: exp,
//       profit: rev - exp
//     };
//   }, [payments, expenses]);

//   const csvData = useMemo(() => {
//     if (viewMode === 'all') {
//       return [
//         ...sortedPayments.map(p => ({
//           'Type': 'Revenue',
//           'ID': p.paymentId,
//           'User': p.userName,
//           'Source': p.source,
//           'Category': p.category,
//           'Amount (KES)': p.amount,
//           'Date': new Date(p.date).toLocaleDateString()
//         })),
//         ...sortedExpenses.map(e => ({
//           'Type': 'Expense',
//           'ID': e.expenseId,
//           'Description': e.description,
//           'Category': e.category,
//           'Amount (KES)': e.amount,
//           'Date': new Date(e.date).toLocaleDateString()
//         }))
//       ];
//     } else if (viewMode === 'revenue') {
//       return sortedPayments.map(p => ({
//         'Type': 'Revenue',
//         'ID': p.paymentId,
//         'User': p.userName,
//         'Source': p.source,
//         'Category': p.category,
//         'Amount (KES)': p.amount,
//         'Date': new Date(p.date).toLocaleDateString()
//       }));
//     } else {
//       return sortedExpenses.map(e => ({
//         'Type': 'Expense',
//         'ID': e.expenseId,
//         'Description': e.description,
//         'Category': e.category,
//         'Amount (KES)': e.amount,
//         'Date': new Date(e.date).toLocaleDateString()
//       }));
//     }
//   }, [sortedPayments, sortedExpenses, viewMode]);

//   const openAddExpenseModal = () => {
//     setShowAddExpenseModal(true);
//   };

//   const closeAddExpenseModal = () => {
//     setShowAddExpenseModal(false);
//     setNewExpense({
//       description: '',
//       amount: '',
//       category: 'Operations',
//       date: new Date().toISOString()
//     });
//   };

//   const handleExpenseInputChange = (e) => {
//     const { name, value } = e.target;
//     setNewExpense(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const handleDateChange = (date) => {
//     setNewExpense(prev => ({
//       ...prev,
//       date: date.toISOString()
//     }));
//   };

//   const handleAddExpense = () => {
//     if (!newExpense.description || !newExpense.amount || isNaN(newExpense.amount)) {
//       toast.error('Please enter valid description and amount');
//       return;
//     }

//     const newExpenseRecord = {
//       id: expenses.length + 1,
//       expenseId: `EX${new Date().getTime().toString().slice(-6)}`,
//       description: newExpense.description,
//       amount: Number(newExpense.amount),
//       category: newExpense.category,
//       date: newExpense.date
//     };

//     setExpenses(prev => [...prev, newExpenseRecord]);
//     toast.success('Expense added successfully!');
//     closeAddExpenseModal();
//   };

//   return (
//     <div className="p-6 bg-gray-50 min-h-screen">
//       <div className="max-w-7xl mx-auto">
//         <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
//           <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 flex items-center">
//             <FaMoneyBillWave className="mr-2 text-blue-600" /> Payment Reconciliation
//           </h1>
//           <div className="flex items-center space-x-2 mt-2 md:mt-0">
//             <button
//               onClick={handleRefresh}
//               className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               aria-label="Refresh data"
//             >
//               <AiOutlineReload className="mr-1" /> Refresh
//             </button>
//             <div className="relative">
//               <DatePicker
//                 selected={startDate}
//                 onChange={date => date && setStartDate(date)}
//                 selectsStart
//                 startDate={startDate}
//                 endDate={endDate}
//                 maxDate={new Date()}
//                 className="p-2 border rounded-lg w-32 focus:ring-blue-500 focus:border-blue-500"
//                 dateFormat="dd/MM/yyyy"
//                 aria-label="Start date"
//               />
//               <FaCalendarAlt className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
//             </div>
//             <span className="text-gray-500">to</span>
//             <div className="relative">
//               <DatePicker
//                 selected={endDate}
//                 onChange={date => date && setEndDate(date)}
//                 selectsEnd
//                 startDate={startDate}
//                 endDate={endDate}
//                 minDate={startDate}
//                 maxDate={new Date()}
//                 className="p-2 border rounded-lg w-32 focus:ring-blue-500 focus:border-blue-500"
//                 dateFormat="dd/MM/yyyy"
//                 aria-label="End date"
//               />
//               <FaCalendarAlt className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
//             </div>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//           <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500 hover:shadow-md transition-shadow">
//             <h3 className="text-gray-500 text-sm">Total Revenue</h3>
//             <p className="text-2xl font-bold text-green-600">KES {totalRevenue.toLocaleString()}</p>
//           </div>
//           <div className="bg-white p-4 rounded-lg shadow border-l-4 border-red-500 hover:shadow-md transition-shadow">
//             <h3 className="text-gray-500 text-sm">Total Expenses</h3>
//             <p className="text-2xl font-bold text-red-600">KES {totalExpenses.toLocaleString()}</p>
//           </div>
//           <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500 hover:shadow-md transition-shadow">
//             <h3 className="text-gray-500 text-sm">Profit</h3>
//             <p className={`text-2xl font-bold ${profit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
//               KES {profit.toLocaleString()}
//             </p>
//           </div>
//         </div>

//         <div className="bg-white p-4 rounded-lg shadow mb-6">
//           <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
//             <div className="relative flex-grow">
//               <FaSearch className="absolute left-3 top-3 text-gray-400" />
//               <input
//                 type="text"
//                 className="pl-10 pr-4 py-2 border rounded-lg w-full focus:ring-blue-500 focus:border-blue-500"
//                 placeholder="Search by ID, source, user, or category..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 aria-label="Search payments and expenses"
//               />
//             </div>
            
//             <div className="flex space-x-2">
//               <select
//                 className="p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white"
//                 value={viewMode}
//                 onChange={(e) => setViewMode(e.target.value)}
//                 aria-label="View mode"
//               >
//                 <option value="all">All</option>
//                 <option value="revenue">Revenue</option>
//                 <option value="expenses">Expenses</option>
//               </select>
              
//               <button
//                 className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50"
//                 onClick={() => toggleSort('date')}
//                 aria-label="Sort by date"
//               >
//                 {sortDirection.includes('date') ? (
//                   sortDirection === 'date_asc' ? <FaSortAmountUp className="mr-1" /> : <FaSortAmountDown className="mr-1" />
//                 ) : (
//                   <FaSortAmountDown className="mr-1" />
//                 )}
//                 Date
//               </button>
              
//               <button
//                 className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50"
//                 onClick={() => toggleSort('amount')}
//                 aria-label="Sort by amount"
//               >
//                 {sortDirection.includes('amount') ? (
//                   sortDirection === 'amount_asc' ? <FaSortAmountUp className="mr-1" /> : <FaSortAmountDown className="mr-1" />
//                 ) : (
//                   <FaSortAmountDown className="mr-1" />
//                 )}
//                 Amount
//               </button>
//             </div>
            
//             <div className="flex space-x-2">
//               <button
//                 onClick={() => generateReport('pdf')}
//                 className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
//                 aria-label="Generate PDF report"
//               >
//                 <FaDownload className="mr-2" /> PDF
//               </button>
              
//               <CSVLink
//                 data={csvData}
//                 filename={`payment_reconciliation_${new Date().toISOString().slice(0, 10)}.csv`}
//                 className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
//                 aria-label="Download CSV"
//               >
//                 <FaDownload className="mr-2" /> CSV
//               </CSVLink>
//             </div>
//           </div>
//         </div>

//         {error && (
//           <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6" role="alert">
//             <div className="flex">
//               <div className="flex-shrink-0">
//                 <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
//                   <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
//                 </svg>
//               </div>
//               <div className="ml-3">
//                 <p className="text-sm text-red-700">{error}</p>
//               </div>
//             </div>
//           </div>
//         )}

//         {loading ? (
//           <div className="text-center py-8" aria-live="polite">
//             <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
//             <p>Loading data...</p>
//           </div>
//         ) : (
//           <div className="space-y-6">
//             {(viewMode === 'all' || viewMode === 'revenue') && (
//               <div className="bg-white rounded-lg shadow overflow-hidden transition-all hover:shadow-md">
//                 <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
//                   <h2 className="text-lg font-medium text-gray-900 flex items-center">
//                     <FaMoneyBillWave className="mr-2 text-green-600" /> Revenue
//                   </h2>
//                   <span className="text-sm text-gray-500">
//                     {sortedPayments.length} records
//                   </span>
//                 </div>
//                 <div className="overflow-x-auto">
//                   <table className="min-w-full divide-y divide-gray-200">
//                     <thead className="bg-gray-50">
//                       <tr>
//                         <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Payment ID
//                         </th>
//                         <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           User
//                         </th>
//                         <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Source
//                         </th>
//                         <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Category
//                         </th>
//                         <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Amount (KES)
//                         </th>
//                         <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Date
//                         </th>
//                       </tr>
//                     </thead>
//                     <tbody className="bg-white divide-y divide-gray-200">
//                       {sortedPayments.length > 0 ? (
//                         sortedPayments.map((payment) => (
//                           <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
//                             <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
//                               {payment.paymentId}
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                               {payment.userName}
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                               {payment.source}
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                               {payment.category}
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
//                               {payment.amount.toLocaleString()}
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                               {new Date(payment.date).toLocaleDateString()}
//                             </td>
//                           </tr>
//                         ))
//                       ) : (
//                         <tr>
//                           <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
//                             No revenue records found
//                           </td>
//                         </tr>
//                       )}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             )}

//             {(viewMode === 'all' || viewMode === 'expenses') && (
//               <div className="bg-white rounded-lg shadow overflow-hidden transition-all hover:shadow-md">
//                 <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
//                   <div className="flex items-center">
//                     <h2 className="text-lg font-medium text-gray-900 flex items-center">
//                       <FaReceipt className="mr-2 text-red-600" /> Expenses
//                     </h2>
//                     <button
//                       onClick={openAddExpenseModal}
//                       className="ml-4 flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
//                       aria-label="Add new expense"
//                     >
//                       <FaPlus className="mr-1" /> Add Expense
//                     </button>
//                   </div>
//                   <span className="text-sm text-gray-500">
//                     {sortedExpenses.length} records
//                   </span>
//                 </div>
//                 <div className="overflow-x-auto">
//                   <table className="min-w-full divide-y divide-gray-200">
//                     <thead className="bg-gray-50">
//                       <tr>
//                         <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Expense ID
//                         </th>
//                         <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Description
//                         </th>
//                         <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Category
//                         </th>
//                         <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Amount (KES)
//                         </th>
//                         <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Date
//                         </th>
//                       </tr>
//                     </thead>
//                     <tbody className="bg-white divide-y divide-gray-200">
//                       {sortedExpenses.length > 0 ? (
//                         sortedExpenses.map((expense) => (
//                           <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
//                             <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
//                               {expense.expenseId}
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                               {expense.description}
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                               {expense.category}
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
//                               {expense.amount.toLocaleString()}
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                               {new Date(expense.date).toLocaleDateString()}
//                             </td>
//                           </tr>
//                         ))
//                       ) : (
//                         <tr>
//                           <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
//                             No expense records found
//                           </td>
//                         </tr>
//                       )}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             )}
//           </div>
//         )}
//       </div>

//       {/* Add Expense Modal */}
//       {showAddExpenseModal && (
//         <div className="fixed inset-0 z-50 overflow-y-auto">
//           <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
//             <div className="fixed inset-0 transition-opacity" aria-hidden="true">
//               <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={closeAddExpenseModal}></div>
//             </div>
            
//             <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
//             <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
//               <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
//                 <div className="flex justify-between items-center mb-4">
//                   <h2 className="text-xl font-semibold text-gray-800">Add New Expense</h2>
//                   <button
//                     onClick={closeAddExpenseModal}
//                     className="text-gray-500 hover:text-gray-700 focus:outline-none"
//                     aria-label="Close modal"
//                   >
//                     <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                     </svg>
//                   </button>
//                 </div>

//                 <div className="space-y-4">
//                   <div>
//                     <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
//                       Description
//                     </label>
//                     <input
//                       type="text"
//                       id="description"
//                       name="description"
//                       value={newExpense.description}
//                       onChange={handleExpenseInputChange}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
//                       placeholder="What was this expense for?"
//                     />
//                   </div>

//                   <div>
//                     <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
//                       Amount (KES)
//                     </label>
//                     <input
//                       type="number"
//                       id="amount"
//                       name="amount"
//                       value={newExpense.amount}
//                       onChange={handleExpenseInputChange}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
//                       placeholder="0.00"
//                     />
//                   </div>

//                   <div>
//                     <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
//                       Category
//                     </label>
//                     <select
//                       id="category"
//                       name="category"
//                       value={newExpense.category}
//                       onChange={handleExpenseInputChange}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white"
//                     >
//                       {expenseCategories.map(category => (
//                         <option key={category} value={category}>{category}</option>
//                       ))}
//                     </select>
//                   </div>

//                   <div>
//                     <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
//                       Date
//                     </label>
//                     <DatePicker
//                       selected={new Date(newExpense.date)}
//                       onChange={handleDateChange}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
//                       dateFormat="dd/MM/yyyy"
//                     />
//                   </div>
//                 </div>
//               </div>
//               <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
//                 <button
//                   onClick={handleAddExpense}
//                   className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
//                 >
//                   Add Expense
//                 </button>
//                 <button
//                   onClick={closeAddExpenseModal}
//                   className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       <ToastContainer position="top-right" autoClose={5000} />
//     </div>
//   );
// };

// export default PaymentReconciliation;







// import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
// import { toast, ToastContainer } from 'react-toastify';
// import { FaSearch, FaDownload, FaSortAmountDown, FaSortAmountUp, FaCalendarAlt, FaMoneyBillWave, FaReceipt, FaPlus, FaEdit, FaSave } from 'react-icons/fa';
// import { AiOutlineReload } from 'react-icons/ai';
// import jsPDF from 'jspdf';
// import 'jspdf-autotable';
// import { CSVLink } from 'react-csv';
// import 'react-toastify/dist/ReactToastify.css';
// import DatePicker from 'react-datepicker';
// import 'react-datepicker/dist/react-datepicker.css';
// import { format, parseISO } from 'date-fns';
// import PropTypes from 'prop-types';
// import debounce from 'lodash.debounce';

// const PaymentReconciliation = () => {
//   const [searchTerm, setSearchTerm] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [sortDirection, setSortDirection] = useState('date_desc');
//   const [startDate, setStartDate] = useState(() => new Date(new Date().setDate(new Date().getDate() - 7)));
//   const [endDate, setEndDate] = useState(new Date());
//   const [refreshCount, setRefreshCount] = useState(0);
//   const [viewMode, setViewMode] = useState('all');
//   const [payments, setPayments] = useState([]);
//   const [expenses, setExpenses] = useState([]);
//   const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
//   const [newExpense, setNewExpense] = useState({
//     description: '',
//     amount: '',
//     category: 'Operations',
//     date: new Date().toISOString(),
//   });
//   const [editingCategories, setEditingCategories] = useState(false);
//   const [customCategories, setCustomCategories] = useState([
//     'Operations', 'Utilities', 'Payroll', 'Advertising', 'Logistics',
//     'Maintenance', 'Office Supplies', 'Travel', 'Training', 'Other',
//   ]);
//   const [newCategory, setNewCategory] = useState('');
//   const [enableTax, setEnableTax] = useState(false);
//   const [taxRate, setTaxRate] = useState(16);
//   const [isGeneratingReport, setIsGeneratingReport] = useState(false);

//   const modalRef = useRef(null);
//   const searchInputRef = useRef(null);

//   const mockPayments = useMemo(() => [
//     { id: 1, paymentId: 'PY100523456', userName: 'John Doe', amount: 1000, date: new Date().toISOString(), source: 'WiFi Sales', category: 'Revenue' },
//     { id: 2, paymentId: 'PY100665432', userName: 'Jane Smith', amount: 500, date: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(), source: 'WiFi Sales', category: 'Revenue' },
//     { id: 3, paymentId: 'PY100798765', userName: 'Bob Johnson', amount: 2000, date: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(), source: 'WiFi Sales', category: 'Revenue' },
//     { id: 4, paymentId: 'PY100845678', userName: 'Alice Brown', amount: 1500, date: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(), source: 'WiFi Sales', category: 'Revenue' },
//     { id: 5, paymentId: 'PY100932165', userName: 'Mike Wilson', amount: 750, date: new Date(new Date().setDate(new Date().getDate() - 4)).toISOString(), source: 'WiFi Sales', category: 'Revenue' },
//   ], []);

//   const mockExpenses = useMemo(() => [
//     { id: 1, expenseId: 'EX100523456', amount: 300, date: new Date().toISOString(), description: 'Office Supplies', category: 'Operations' },
//     { id: 2, expenseId: 'EX100665432', amount: 200, date: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(), description: 'Internet Bill', category: 'Utilities' },
//     { id: 3, expenseId: 'EX100798765', amount: 500, date: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(), description: 'Payroll', category: 'Payroll' },
//     { id: 4, expenseId: 'EX100845678', amount: 150, date: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(), description: 'Marketing', category: 'Advertising' },
//     { id: 5, expenseId: 'EX100932165', amount: 100, date: new Date(new Date().setDate(new Date().getDate() - 4)).toISOString(), description: 'Transport', category: 'Logistics' },
//   ], []);

//   const debouncedSetSearchTerm = useCallback(
//     debounce((value) => {
//       setSearchTerm(value);
//     }, 300),
//     []
//   );

//   const fetchData = useCallback(async () => {
//     setLoading(true);
//     setError(null);

//     try {
//       await new Promise((resolve) => setTimeout(resolve, 800));

//       const start = new Date(startDate);
//       const end = new Date(endDate);

//       const filteredPayments = mockPayments.filter((payment) => {
//         const paymentDate = new Date(payment.date);
//         return paymentDate >= new Date(start.setHours(0, 0, 0, 0)) &&
//                paymentDate <= new Date(end.setHours(23, 59, 59, 999));
//       });

//       const filteredExpenses = mockExpenses.filter((expense) => {
//         const expenseDate = new Date(expense.date);
//         return expenseDate >= new Date(start.setHours(0, 0, 0, 0)) &&
//                expenseDate <= new Date(end.setHours(23, 59, 59, 999));
//       });

//       setPayments(filteredPayments);
//       setExpenses(filteredExpenses);

//       if (filteredPayments.length === 0 && filteredExpenses.length === 0) {
//         toast.info('No records found for the selected date range', { autoClose: 3000 });
//       }
//     } catch (err) {
//       setError('Failed to load data. Please try again.');
//       console.error('Error fetching data:', err);
//       toast.error('Failed to load data. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   }, [startDate, endDate, mockPayments, mockExpenses]);

//   useEffect(() => {
//     fetchData();
//   }, [fetchData, refreshCount]);

//   const handleRefresh = useCallback(() => {
//     setRefreshCount((prev) => prev + 1);
//     toast.info('Refreshing data...', { autoClose: 2000 });
//   }, []);

//   const handleResetFilters = useCallback(() => {
//     setSearchTerm('');
//     setStartDate(new Date(new Date().setDate(new Date().getDate() - 7)));
//     setEndDate(new Date());
//     setViewMode('all');
//     setSortDirection('date_desc');
//     setEnableTax(false);
//     setTaxRate(16);
//     toast.info('Filters reset', { autoClose: 2000 });
//   }, []);

//   const filteredPayments = useMemo(() => payments.filter(
//     (payment) =>
//       payment.paymentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       payment.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       payment.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       payment.userName.toLowerCase().includes(searchTerm.toLowerCase())
//   ), [payments, searchTerm]);

//   const filteredExpenses = useMemo(() => expenses.filter(
//     (expense) =>
//       expense.expenseId.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       (expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
//       expense.category.toLowerCase().includes(searchTerm.toLowerCase())
//   ), [expenses, searchTerm]);

//   const sortedPayments = useMemo(() => [...filteredPayments].sort((a, b) => {
//     const dateA = new Date(a.date);
//     const dateB = new Date(b.date);

//     if (sortDirection === 'amount_asc') return a.amount - b.amount;
//     if (sortDirection === 'amount_desc') return b.amount - a.amount;
//     if (sortDirection === 'date_asc') return dateA.getTime() - dateB.getTime();
//     return dateB.getTime() - dateA.getTime();
//   }), [filteredPayments, sortDirection]);

//   const sortedExpenses = useMemo(() => [...filteredExpenses].sort((a, b) => {
//     const dateA = new Date(a.date);
//     const dateB = new Date(b.date);

//     if (sortDirection === 'amount_asc') return a.amount - b.amount;
//     if (sortDirection === 'amount_desc') return b.amount - a.amount;
//     if (sortDirection === 'date_asc') return dateA.getTime() - dateB.getTime();
//     return dateB.getTime() - dateA.getTime();
//   }), [filteredExpenses, sortDirection]);

//   const toggleSort = useCallback((type) => {
//     if (type === 'amount') {
//       setSortDirection((prev) => (prev === 'amount_asc' ? 'amount_desc' : 'amount_asc'));
//     } else {
//       setSortDirection((prev) => (prev === 'date_asc' ? 'date_desc' : 'date_asc'));
//     }
//   }, []);

//   const calculateTax = useCallback((amount) => {
//     return enableTax ? amount * (taxRate / 100) : 0;
//   }, [enableTax, taxRate]);

//   const calculateNetAmount = useCallback((amount) => {
//     return enableTax ? amount / (1 + (taxRate / 100)) : amount;
//   }, [enableTax, taxRate]);

//   const generateReport = useCallback(async (type) => {
//     setIsGeneratingReport(true);
//     try {
//       if ((viewMode === 'all' || viewMode === 'revenue') && sortedPayments.length === 0 &&
//           (viewMode === 'all' || viewMode === 'expenses') && sortedExpenses.length === 0) {
//         toast.warning('No data to generate report', { autoClose: 3000 });
//         return;
//       }

//       if (type === 'pdf') {
//         const doc = new jsPDF();

//         doc.setFontSize(16);
//         doc.setTextColor(40, 53, 147);
//         doc.text('PAYMENT RECONCILIATION REPORT', 105, 15, { align: 'center' });

//         doc.setFontSize(10);
//         doc.setTextColor(100);
//         doc.text(`Date Range: ${format(startDate, 'dd/MM/yyyy')} to ${format(endDate, 'dd/MM/yyyy')}`, 14, 25);
//         doc.text(`View Mode: ${viewMode.charAt(0).toUpperCase() + viewMode.slice(1)}`, 14, 30);
//         doc.text(`Tax Calculation: ${enableTax ? `Enabled (${taxRate}% VAT)` : 'Disabled'}`, 14, 35);

//         let startY = 45;

//         if ((viewMode === 'all' || viewMode === 'revenue') && sortedPayments.length > 0) {
//           doc.setFontSize(12);
//           doc.setTextColor(40, 53, 147);
//           doc.text('REVENUE', 14, startY);
//           startY += 10;

//           const revenueHeaders = enableTax
//             ? [['Payment ID', 'User', 'Source', 'Category', 'Net Amount (KES)', `Tax (${taxRate}%)`, 'Gross Amount (KES)', 'Date']]
//             : [['Payment ID', 'User', 'Source', 'Category', 'Amount (KES)', 'Date']];

//           const revenueData = sortedPayments.map((payment) => {
//             if (enableTax) {
//               const netAmount = calculateNetAmount(payment.amount);
//               const taxAmount = calculateTax(netAmount);
//               return [
//                 payment.paymentId,
//                 payment.userName,
//                 payment.source,
//                 payment.category,
//                 netAmount.toLocaleString('en-KE', { minimumFractionDigits: 2 }),
//                 taxAmount.toLocaleString('en-KE', { minimumFractionDigits: 2 }),
//                 payment.amount.toLocaleString('en-KE', { minimumFractionDigits: 2 }),
//                 format(parseISO(payment.date), 'dd/MM/yyyy'),
//               ];
//             }
//             return [
//               payment.paymentId,
//               payment.userName,
//               payment.source,
//               payment.category,
//               payment.amount.toLocaleString('en-KE', { minimumFractionDigits: 2 }),
//               format(parseISO(payment.date), 'dd/MM/yyyy'),
//             ];
//           });

//           doc.autoTable({
//             head: revenueHeaders,
//             body: revenueData,
//             startY,
//             styles: { fontSize: 8 },
//             headStyles: { fillColor: [40, 53, 147], textColor: 255 },
//             alternateRowStyles: { fillColor: [240, 240, 240] },
//           });

//           startY = doc.lastAutoTable.finalY + 10;
//         }

//         if ((viewMode === 'all' || viewMode === 'expenses') && sortedExpenses.length > 0) {
//           doc.setFontSize(12);
//           doc.setTextColor(40, 53, 147);
//           doc.text('EXPENSES', 14, startY);
//           startY += 10;

//           const expenseHeaders = [['Expense ID', 'Description', 'Category', 'Amount (KES)', 'Date']];
//           const expenseData = sortedExpenses.map((expense) => [
//             expense.expenseId,
//             expense.description || 'N/A',
//             expense.category,
//             expense.amount.toLocaleString('en-KE', { minimumFractionDigits: 2 }),
//             format(parseISO(expense.date), 'dd/MM/yyyy'),
//           ]);

//           doc.autoTable({
//             head: expenseHeaders,
//             body: expenseData,
//             startY,
//             styles: { fontSize: 8 },
//             headStyles: { fillColor: [153, 0, 0], textColor: 255 },
//             alternateRowStyles: { fillColor: [255, 240, 240] },
//           });

//           startY = doc.lastAutoTable.finalY + 10;
//         }

//         const totalRevenue = sortedPayments.reduce((sum, payment) => sum + payment.amount, 0);
//         const totalExpenses = sortedExpenses.reduce((sum, expense) => sum + expense.amount, 0);
//         const totalTax = enableTax ? calculateTax(calculateNetAmount(totalRevenue)) : 0;
//         const profit = totalRevenue - totalExpenses;

//         doc.setFontSize(10);
//         doc.setTextColor(40, 53, 147);

//         if (viewMode === 'all' || viewMode === 'revenue') {
//           if (enableTax) {
//             const netRevenue = calculateNetAmount(totalRevenue);
//             doc.text(`Net Revenue (Before Tax): KES ${netRevenue.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`, 14, startY);
//             startY += 5;
//             doc.text(`Tax (${taxRate}%): KES ${totalTax.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`, 14, startY);
//             startY += 5;
//           }
//           doc.text(`Total Revenue: KES ${totalRevenue.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`, 14, startY);
//           startY += 5;
//         }

//         if (viewMode === 'all' || viewMode === 'expenses') {
//           doc.text(`Total Expenses: KES ${totalExpenses.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`, 14, startY);
//           startY += 5;
//         }

//         if (viewMode === 'all') {
//           doc.text(`Profit: KES ${profit.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`, 14, startY);
//           startY += 5;
//         }

//         doc.text(`Generated on: ${format(new Date(), 'dd/MM/yyyy HH:mm:ss')}`, 14, startY);

//         doc.save(`Payment_Reconciliation_${new Date().toISOString().slice(0, 10)}.pdf`);
//         toast.success('PDF report generated successfully');
//       } else if (type === 'csv') {
//         toast.info('Preparing CSV download...', { autoClose: 2000 });
//       }
//     } catch (err) {
//       console.error('Report generation error:', err);
//       toast.error(`Failed to generate report: ${err.message}`);
//     } finally {
//       setIsGeneratingReport(false);
//     }
//   }, [sortedPayments, sortedExpenses, viewMode, startDate, endDate, enableTax, taxRate, calculateNetAmount, calculateTax]);

//   const { totalRevenue, totalExpenses, profit, totalTax } = useMemo(() => {
//     const rev = payments.reduce((sum, payment) => sum + payment.amount, 0);
//     const exp = expenses.reduce((sum, expense) => sum + expense.amount, 0);
//     const tax = enableTax ? calculateTax(calculateNetAmount(rev)) : 0;
//     return {
//       totalRevenue: rev,
//       totalExpenses: exp,
//       profit: rev - exp,
//       totalTax: tax,
//     };
//   }, [payments, expenses, enableTax, calculateNetAmount, calculateTax]);

//   const csvData = useMemo(() => {
//     if (viewMode === 'all') {
//       return [
//         ...sortedPayments.map((p) => ({
//           Type: 'Revenue',
//           ID: p.paymentId,
//           User: p.userName,
//           Source: p.source,
//           Category: p.category,
//           ...(enableTax ? {
//             'Net Amount (KES)': calculateNetAmount(p.amount).toFixed(2),
//             [`Tax (${taxRate}%)`]: calculateTax(calculateNetAmount(p.amount)).toFixed(2),
//             'Gross Amount (KES)': p.amount.toFixed(2),
//           } : {
//             'Amount (KES)': p.amount.toFixed(2),
//           }),
//           Date: format(parseISO(p.date), 'dd/MM/yyyy'),
//         })),
//         ...sortedExpenses.map((e) => ({
//           Type: 'Expense',
//           ID: e.expenseId,
//           Description: e.description || 'N/A',
//           Category: e.category,
//           'Amount (KES)': e.amount.toFixed(2),
//           Date: format(parseISO(e.date), 'dd/MM/yyyy'),
//         })),
//       ];
//     } else if (viewMode === 'revenue') {
//       return sortedPayments.map((p) => ({
//         Type: 'Revenue',
//         ID: p.paymentId,
//         User: p.userName,
//         Source: p.source,
//         Category: p.category,
//         ...(enableTax ? {
//           'Net Amount (KES)': calculateNetAmount(p.amount).toFixed(2),
//           [`Tax (${taxRate}%)`]: calculateTax(calculateNetAmount(p.amount)).toFixed(2),
//           'Gross Amount (KES)': p.amount.toFixed(2),
//         } : {
//           'Amount (KES)': p.amount.toFixed(2),
//         }),
//         Date: format(parseISO(p.date), 'dd/MM/yyyy'),
//       }));
//     } else {
//       return sortedExpenses.map((e) => ({
//         Type: 'Expense',
//         ID: e.expenseId,
//         Description: e.description || 'N/A',
//         Category: e.category,
//         'Amount (KES)': e.amount.toFixed(2),
//         Date: format(parseISO(e.date), 'dd/MM/yyyy'),
//       }));
//     }
//   }, [sortedPayments, sortedExpenses, viewMode, enableTax, taxRate, calculateNetAmount, calculateTax]);

//   const openAddExpenseModal = useCallback(() => {
//     setShowAddExpenseModal(true);
//   }, []);

//   const closeAddExpenseModal = useCallback(() => {
//     setShowAddExpenseModal(false);
//     setNewExpense({
//       description: '',
//       amount: '',
//       category: customCategories[0] || 'Operations',
//       date: new Date().toISOString(),
//     });
//     setEditingCategories(false);
//     setNewCategory('');
//   }, [customCategories]);

//   const handleExpenseInputChange = useCallback((e) => {
//     const { name, value } = e.target;
//     setNewExpense((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   }, []);

//   const handleDateChange = useCallback((date) => {
//     if (date) {
//       setNewExpense((prev) => ({
//         ...prev,
//         date: date.toISOString(),
//       }));
//     }
//   }, []);

//   const handleAddExpense = useCallback(() => {
//     if (!newExpense.description.trim()) {
//       toast.error('Description is required');
//       return;
//     }
//     if (!newExpense.amount || isNaN(newExpense.amount) || Number(newExpense.amount) <= 0) {
//       toast.error('Please enter a valid amount');
//       return;
//     }
//     if (!customCategories.includes(newExpense.category)) {
//       toast.error('Please select a valid category');
//       return;
//     }

//     const newExpenseRecord = {
//       id: expenses.length + 1,
//       expenseId: `EX${new Date().getTime().toString().slice(-6)}`,
//       description: newExpense.description.trim(),
//       amount: Number(newExpense.amount),
//       category: newExpense.category,
//       date: newExpense.date,
//     };

//     setExpenses((prev) => [...prev, newExpenseRecord]);
//     toast.success('Expense added successfully!');
//     closeAddExpenseModal();
//   }, [newExpense, expenses, customCategories, closeAddExpenseModal]);

//   const toggleCategoryEditing = useCallback(() => {
//     setEditingCategories((prev) => !prev);
//   }, []);

//   const handleAddCategory = useCallback(() => {
//     const trimmedCategory = newCategory.trim();
//     if (!trimmedCategory) {
//       toast.error('Category name cannot be empty');
//       return;
//     }
//     if (customCategories.includes(trimmedCategory)) {
//       toast.error('Category already exists');
//       return;
//     }
//     setCustomCategories((prev) => [...prev, trimmedCategory]);
//     setNewCategory('');
//     toast.success('Category added successfully!');
//   }, [newCategory, customCategories]);

//   const handleRemoveCategory = useCallback((categoryToRemove) => {
//     if (customCategories.length <= 1) {
//       toast.error('You must have at least one category');
//       return;
//     }
//     setCustomCategories((prev) => prev.filter((cat) => cat !== categoryToRemove));
//     if (newExpense.category === categoryToRemove) {
//       setNewExpense((prev) => ({
//         ...prev,
//         category: customCategories[0] || 'Operations',
//       }));
//     }
//     toast.success('Category removed successfully!');
//   }, [customCategories, newExpense.category]);

//   useEffect(() => {
//     if (showAddExpenseModal && modalRef.current) {
//       const focusableElements = modalRef.current.querySelectorAll(
//         'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
//       );
//       const firstElement = focusableElements[0];
//       const lastElement = focusableElements[focusableElements.length - 1];

//       const handleKeyDown = (e) => {
//         if (e.key === 'Tab') {
//           if (e.shiftKey && document.activeElement === firstElement) {
//             e.preventDefault();
//             lastElement.focus();
//           } else if (!e.shiftKey && document.activeElement === lastElement) {
//             e.preventDefault();
//             firstElement.focus();
//           }
//         }
//         if (e.key === 'Escape') {
//           closeAddExpenseModal();
//         }
//       };

//       document.addEventListener('keydown', handleKeyDown);
//       firstElement?.focus();

//       return () => {
//         document.removeEventListener('keydown', handleKeyDown);
//       };
//     }
//   }, [showAddExpenseModal, closeAddExpenseModal]);

//   return (
//     <div className="p-6 bg-gray-50 min-h-screen">
//       <div className="max-w-7xl mx-auto">
//         <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
//           <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 flex items-center">
//             <FaMoneyBillWave className="mr-2 text-blue-600" /> Payment Reconciliation
//           </h1>
//           <div className="flex items-center space-x-2 mt-2 md:mt-0">
//             <button
//               onClick={handleRefresh}
//               className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               aria-label="Refresh data"
//             >
//               <AiOutlineReload className="mr-1" /> Refresh
//             </button>
//             <button
//               onClick={handleResetFilters}
//               className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               aria-label="Reset filters"
//             >
//               Reset Filters
//             </button>
//             <div className="relative">
//               <DatePicker
//                 selected={startDate}
//                 onChange={(date) => date && setStartDate(date)}
//                 selectsStart
//                 startDate={startDate}
//                 endDate={endDate}
//                 maxDate={new Date()}
//                 className="p-2 border rounded-lg w-32 focus:ring-blue-500 focus:border-blue-500"
//                 dateFormat="dd/MM/yyyy"
//                 aria-label="Start date"
//               />
//               <FaCalendarAlt className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
//             </div>
//             <span className="text-gray-500">to</span>
//             <div className="relative">
//               <DatePicker
//                 selected={endDate}
//                 onChange={(date) => date && setEndDate(date)}
//                 selectsEnd
//                 startDate={startDate}
//                 endDate={endDate}
//                 minDate={startDate}
//                 maxDate={new Date()}
//                 className="p-2 border rounded-lg w-32 focus:ring-blue-500 focus:border-blue-500"
//                 dateFormat="dd/MM/yyyy"
//                 aria-label="End date"
//               />
//               <FaCalendarAlt className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
//             </div>
//           </div>
//         </div>

//         <div className="bg-white p-4 rounded-lg shadow mb-6 flex justify-between items-center">
//           <div className="flex items-center">
//             <label htmlFor="tax-toggle" className="mr-2 font-medium text-gray-700">
//               Enable Kenyan VAT (16%)
//             </label>
//             <div className="relative inline-block w-12 mr-2 align-middle select-none">
//               <input
//                 type="checkbox"
//                 id="tax-toggle"
//                 checked={enableTax}
//                 onChange={() => setEnableTax(!enableTax)}
//                 className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
//               />
//               <label
//                 htmlFor="tax-toggle"
//                 className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${enableTax ? 'bg-blue-600' : 'bg-gray-300'}`}
//               ></label>
//             </div>
//             {enableTax && (
//               <div className="flex items-center">
//                 <span className="mr-2 text-sm text-gray-600">Tax Rate:</span>
//                 <input
//                   type="number"
//                   value={taxRate}
//                   onChange={(e) => setTaxRate(Math.min(100, Math.max(0, Number(e.target.value))))}
//                   className="w-16 p-1 border rounded focus:ring-blue-500 focus:border-blue-500"
//                   min="0"
//                   max="100"
//                   step="0.1"
//                 />
//                 <span className="ml-1 text-sm text-gray-600">%</span>
//               </div>
//             )}
//           </div>
//           {enableTax && (
//             <div className="text-sm text-gray-700">
//               <span className="font-medium">Total Tax:</span> KES {totalTax.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
//             </div>
//           )}
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//           <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500 hover:shadow-md transition-shadow">
//             <h3 className="text-gray-500 text-sm">Total Revenue</h3>
//             <p className="text-2xl font-bold text-green-600">
//               KES {totalRevenue.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
//               {enableTax && (
//                 <span className="block text-sm font-normal text-gray-500">
//                   (Net: KES {calculateNetAmount(totalRevenue).toLocaleString('en-KE', { minimumFractionDigits: 2 })} + Tax: KES {totalTax.toLocaleString('en-KE', { minimumFractionDigits: 2 })})
//                 </span>
//               )}
//             </p>
//           </div>
//           <div className="bg-white p-4 rounded-lg shadow border-l-4 border-red-500 hover:shadow-md transition-shadow">
//             <h3 className="text-gray-500 text-sm">Total Expenses</h3>
//             <p className="text-2xl font-bold text-red-600">
//               KES {totalExpenses.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
//             </p>
//           </div>
//           <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500 hover:shadow-md transition-shadow">
//             <h3 className="text-gray-500 text-sm">Profit</h3>
//             <p className={`text-2xl font-bold ${profit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
//               KES {profit.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
//             </p>
//           </div>
//         </div>

//         <div className="bg-white p-4 rounded-lg shadow mb-6">
//           <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
//             <div className="relative flex-grow">
//               <FaSearch className="absolute left-3 top-3 text-gray-400" />
//               <input
//                 ref={searchInputRef}
//                 type="text"
//                 className="pl-10 pr-4 py-2 border rounded-lg w-full focus:ring-blue-500 focus:border-blue-500"
//                 placeholder="Search by ID, source, user, or category..."
//                 onChange={(e) => debouncedSetSearchTerm(e.target.value)}
//                 aria-label="Search payments and expenses"
//               />
//             </div>

//             <div className="flex space-x-2">
//               <select
//                 className="p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white"
//                 value={viewMode}
//                 onChange={(e) => setViewMode(e.target.value)}
//                 aria-label="View mode"
//               >
//                 <option value="all">All</option>
//                 <option value="revenue">Revenue</option>
//                 <option value="expenses">Expenses</option>
//               </select>

//               <button
//                 className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50"
//                 onClick={() => toggleSort('date')}
//                 aria-label="Sort by date"
//               >
//                 {sortDirection.includes('date') ? (
//                   sortDirection === 'date_asc' ? <FaSortAmountUp className="mr-1" /> : <FaSortAmountDown className="mr-1" />
//                 ) : (
//                   <FaSortAmountDown className="mr-1" />
//                 )}
//                 Date
//               </button>

//               <button
//                 className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50"
//                 onClick={() => toggleSort('amount')}
//                 aria-label="Sort by amount"
//               >
//                 {sortDirection.includes('amount') ? (
//                   sortDirection === 'amount_asc' ? <FaSortAmountUp className="mr-1" /> : <FaSortAmountDown className="mr-1" />
//                 ) : (
//                   <FaSortAmountDown className="mr-1" />
//                 )}
//                 Amount
//               </button>
//             </div>

//             <div className="flex space-x-2">
//               <button
//                 onClick={() => generateReport('pdf')}
//                 disabled={isGeneratingReport}
//                 className={`flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${isGeneratingReport ? 'opacity-50 cursor-not-allowed' : ''}`}
//                 aria-label="Generate PDF report"
//               >
//                 {isGeneratingReport ? (
//                   <div className="inline-block animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
//                 ) : (
//                   <FaDownload className="mr-2" />
//                 )}
//                 PDF
//               </button>

//               <CSVLink
//                 data={csvData}
//                 filename={`payment_reconciliation_${new Date().toISOString().slice(0, 10)}.csv`}
//                 className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
//                 aria-label="Download CSV"
//                 onClick={() => toast.success('CSV download started')}
//               >
//                 <FaDownload className="mr-2" /> CSV
//               </CSVLink>
//             </div>
//           </div>
//         </div>

//         {error && (
//           <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6" role="alert">
//             <div className="flex">
//               <div className="flex-shrink-0">
//                 <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
//                   <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
//                 </svg>
//               </div>
//               <div className="ml-3">
//                 <p className="text-sm text-red-700">{error}</p>
//               </div>
//             </div>
//           </div>
//         )}

//         {loading ? (
//           <div className="text-center py-8" aria-live="polite">
//             <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
//             <p>Loading data...</p>
//           </div>
//         ) : (
//           <div className="space-y-6">
//             {(viewMode === 'all' || viewMode === 'revenue') && (
//               <div className="bg-white rounded-lg shadow overflow-hidden transition-all hover:shadow-md">
//                 <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
//                   <h2 className="text-lg font-medium text-gray-900 flex items-center">
//                     <FaMoneyBillWave className="mr-2 text-green-600" /> Revenue
//                   </h2>
//                   <span className="text-sm text-gray-500">
//                     {sortedPayments.length} records
//                   </span>
//                 </div>
//                 <div className="overflow-x-auto">
//                   <table className="min-w-full divide-y divide-gray-200">
//                     <thead className="bg-gray-50">
//                       <tr>
//                         <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Payment ID
//                         </th>
//                         <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           User
//                         </th>
//                         <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Source
//                         </th>
//                         <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Category
//                         </th>
//                         {enableTax && (
//                           <>
//                             <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                               Net Amount (KES)
//                             </th>
//                             <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                               Tax ({taxRate}%)
//                             </th>
//                           </>
//                         )}
//                         <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           {enableTax ? 'Gross Amount (KES)' : 'Amount (KES)'}
//                         </th>
//                         <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Date
//                         </th>
//                       </tr>
//                     </thead>
//                     <tbody className="bg-white divide-y divide-gray-200">
//                       {sortedPayments.length > 0 ? (
//                         sortedPayments.map((payment) => {
//                           const netAmount = enableTax ? calculateNetAmount(payment.amount) : payment.amount;
//                           const taxAmount = enableTax ? calculateTax(netAmount) : 0;

//                           return (
//                             <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
//                               <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
//                                 {payment.paymentId}
//                               </td>
//                               <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                                 {payment.userName}
//                               </td>
//                               <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                                 {payment.source}
//                               </td>
//                               <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                                 {payment.category}
//                               </td>
//                               {enableTax && (
//                                 <>
//                                   <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
//                                     {netAmount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
//                                   </td>
//                                   <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600 font-medium">
//                                     {taxAmount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
//                                   </td>
//                                 </>
//                               )}
//                               <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
//                                 {payment.amount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
//                               </td>
//                               <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                                 {format(parseISO(payment.date), 'dd/MM/yyyy')}
//                               </td>
//                             </tr>
//                           );
//                         })
//                       ) : (
//                         <tr>
//                           <td colSpan={enableTax ? 8 : 6} className="px-6 py-4 text-center text-sm text-gray-500">
//                             No revenue records found
//                           </td>
//                         </tr>
//                       )}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             )}

//             {(viewMode === 'all' || viewMode === 'expenses') && (
//               <div className="bg-white rounded-lg shadow overflow-hidden transition-all hover:shadow-md">
//                 <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
//                   <div className="flex items-center">
//                     <h2 className="text-lg font-medium text-gray-900 flex items-center">
//                       <FaReceipt className="mr-2 text-red-600" /> Expenses
//                     </h2>
//                     <button
//                       onClick={openAddExpenseModal}
//                       className="ml-4 flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
//                       aria-label="Add new expense"
//                     >
//                       <FaPlus className="mr-1" /> Add Expense
//                     </button>
//                   </div>
//                   <span className="text-sm text-gray-500">
//                     {sortedExpenses.length} records
//                   </span>
//                 </div>
//                 <div className="overflow-x-auto">
//                   <table className="min-w-full divide-y divide-gray-200">
//                     <thead className="bg-gray-50">
//                       <tr>
//                         <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Expense ID
//                         </th>
//                         <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Description
//                         </th>
//                         <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Category
//                         </th>
//                         <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Amount (KES)
//                         </th>
//                         <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Date
//                         </th>
//                       </tr>
//                     </thead>
//                     <tbody className="bg-white divide-y divide-gray-200">
//                       {sortedExpenses.length > 0 ? (
//                         sortedExpenses.map((expense) => (
//                           <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
//                             <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
//                               {expense.expenseId}
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                               {expense.description || 'N/A'}
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                               {expense.category}
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
//                               {expense.amount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                               {format(parseISO(expense.date), 'dd/MM/yyyy')}
//                             </td>
//                           </tr>
//                         ))
//                       ) : (
//                         <tr>
//                           <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
//                             No expense records found
//                           </td>
//                         </tr>
//                       )}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             )}
//           </div>
//         )}
//       </div>

//       {showAddExpenseModal && (
//         <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
//           <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
//             <div className="fixed inset-0 transition-opacity" aria-hidden="true">
//               <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={closeAddExpenseModal}></div>
//             </div>

//             <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

//             <div
//               ref={modalRef}
//               className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
//             >
//               <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
//                 <div className="flex justify-between items-center mb-4">
//                   <h2 className="text-xl font-semibold text-gray-800">Add New Expense</h2>
//                   <button
//                     onClick={closeAddExpenseModal}
//                     className="text-gray-500 hover:text-gray-700 focus:outline-none"
//                     aria-label="Close modal"
//                   >
//                     <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                     </svg>
//                   </button>
//                 </div>

//                 <div className="space-y-4">
//                   <div>
//                     <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
//                       Description
//                     </label>
//                     <input
//                       type="text"
//                       id="description"
//                       name="description"
//                       value={newExpense.description}
//                       onChange={handleExpenseInputChange}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
//                       placeholder="What was this expense for?"
//                       required
//                     />
//                   </div>

//                   <div>
//                     <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
//                       Amount (KES)
//                     </label>
//                     <input
//                       type="number"
//                       id="amount"
//                       name="amount"
//                       value={newExpense.amount}
//                       onChange={handleExpenseInputChange}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
//                       placeholder="0.00"
//                       min="0"
//                       step="0.01"
//                       required
//                     />
//                   </div>

//                   <div>
//                     <div className="flex justify-between items-center mb-1">
//                       <label htmlFor="category" className="block text-sm font-medium text-gray-700">
//                         Category
//                       </label>
//                       <button
//                         onClick={toggleCategoryEditing}
//                         className="text-xs flex items-center text-blue-600 hover:text-blue-800"
//                       >
//                         {editingCategories ? <FaSave className="mr-1" /> : <FaEdit className="mr-1" />}
//                         {editingCategories ? 'Save Categories' : 'Edit Categories'}
//                       </button>
//                     </div>

//                     {editingCategories ? (
//                       <div className="mb-4">
//                         <div className="flex mb-2">
//                           <input
//                             type="text"
//                             value={newCategory}
//                             onChange={(e) => setNewCategory(e.target.value)}
//                             className="flex-grow px-3 py-2 border rounded-l-lg focus:ring-blue-500 focus:border-blue-500"
//                             placeholder="New category name"
//                           />
//                           <button
//                             onClick={handleAddCategory}
//                             className="px-3 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700"
//                           >
//                             Add
//                           </button>
//                         </div>
//                         <div className="flex flex-wrap gap-2">
//                           {customCategories.map((category) => (
//                             <div key={category} className="flex items-center bg-gray-100 rounded-full px-3 py-1">
//                               <span className="text-sm">{category}</span>
//                               <button
//                                 onClick={() => handleRemoveCategory(category)}
//                                 className="ml-1 text-red-500 hover:text-red-700"
//                                 aria-label={`Remove ${category} category`}
//                               >
//                                 ×
//                               </button>
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     ) : (
//                       <select
//                         id="category"
//                         name="category"
//                         value={newExpense.category}
//                         onChange={handleExpenseInputChange}
//                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white"
//                         required
//                       >
//                         {customCategories.map((category) => (
//                           <option key={category} value={category}>{category}</option>
//                         ))}
//                       </select>
//                     )}
//                   </div>

//                   <div>
//                     <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
//                       Date
//                     </label>
//                     <DatePicker
//                       selected={new Date(newExpense.date)}
//                       onChange={handleDateChange}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
//                       dateFormat="dd/MM/yyyy"
//                       maxDate={new Date()}
//                       required
//                     />
//                   </div>
//                 </div>
//               </div>
//               <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
//                 <button
//                   onClick={handleAddExpense}
//                   className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
//                 >
//                   Add Expense
//                 </button>
//                 <button
//                   onClick={closeAddExpenseModal}
//                   className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       <ToastContainer position="top-right" autoClose={5000} />
//     </div>
//   );
// };

// PaymentReconciliation.propTypes = {};

// export default PaymentReconciliation;














import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import {
  FaSearch,
  FaDownload,
  FaSortAmountDown,
  FaSortAmountUp,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaReceipt,
  FaPlus,
  FaEdit,
  FaSave,
  FaTrash,
} from 'react-icons/fa';
import { AiOutlineReload } from 'react-icons/ai';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { CSVLink } from 'react-csv';
import 'react-toastify/dist/ReactToastify.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format, parseISO } from 'date-fns';
import debounce from 'lodash.debounce';

// Default Kenyan tax configuration
const DEFAULT_TAXES = [
  {
    id: 'vat',
    name: 'VAT',
    rate: 16,
    description: 'Value Added Tax (Kenya standard rate)',
    appliesTo: 'revenue',
    isEnabled: true,
    isIncludedInPrice: true,
  },
  {
    id: 'withholding',
    name: 'Withholding Tax',
    rate: 5,
    description: 'Withholding Tax on services',
    appliesTo: 'expenses',
    isEnabled: false,
    isIncludedInPrice: false,
  },
];

// Mock data (moved outside component to avoid useMemo)
const MOCK_PAYMENTS = [
  { id: 1, paymentId: 'PY100523456', userName: 'John Doe', amount: 1000, date: new Date().toISOString(), source: 'WiFi Sales', category: 'Revenue' },
  { id: 2, paymentId: 'PY100665432', userName: 'Jane Smith', amount: 500, date: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(), source: 'WiFi Sales', category: 'Revenue' },
  { id: 3, paymentId: 'PY100798765', userName: 'Bob Johnson', amount: 2000, date: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(), source: 'WiFi Sales', category: 'Revenue' },
  { id: 4, paymentId: 'PY100845678', userName: 'Alice Brown', amount: 1500, date: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(), source: 'WiFi Sales', category: 'Revenue' },
  { id: 5, paymentId: 'PY100932165', userName: 'Mike Wilson', amount: 750, date: new Date(new Date().setDate(new Date().getDate() - 4)).toISOString(), source: 'WiFi Sales', category: 'Revenue' },
];

const MOCK_EXPENSES = [
  { id: 1, expenseId: 'EX100523456', amount: 300, date: new Date().toISOString(), description: 'Office Supplies', category: 'Operations' },
  { id: 2, expenseId: 'EX100665432', amount: 200, date: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(), description: 'Internet Bill', category: 'Utilities' },
  { id: 3, expenseId: 'EX100798765', amount: 500, date: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(), description: 'Payroll', category: 'Payroll' },
  { id: 4, expenseId: 'EX100845678', amount: 150, date: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(), description: 'Marketing', category: 'Advertising' },
  { id: 5, expenseId: 'EX100932165', amount: 100, date: new Date(new Date().setDate(new Date().getDate() - 4)).toISOString(), description: 'Transport', category: 'Logistics' },
];

const PaymentReconciliation = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortDirection, setSortDirection] = useState('date_desc');
  const [startDate, setStartDate] = useState(() => new Date(new Date().setDate(new Date().getDate() - 7)));
  const [endDate, setEndDate] = useState(new Date());
  const [refreshCount, setRefreshCount] = useState(0);
  const [viewMode, setViewMode] = useState('all');
  const [payments, setPayments] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    category: 'Operations',
    date: new Date().toISOString(),
  });
  const [editingCategories, setEditingCategories] = useState(false);
  const [customCategories, setCustomCategories] = useState([
    'Operations', 'Utilities', 'Payroll', 'Advertising', 'Logistics',
    'Maintenance', 'Office Supplies', 'Travel', 'Training', 'Other',
  ]);
  const [newCategory, setNewCategory] = useState('');
  const [taxes, setTaxes] = useState(DEFAULT_TAXES);
  const [showTaxConfig, setShowTaxConfig] = useState(false);
  const [newTax, setNewTax] = useState({
    name: '',
    rate: 0,
    description: '',
    appliesTo: 'revenue',
    isEnabled: true,
    isIncludedInPrice: false,
  });
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const modalRef = useRef(null);
  const taxModalRef = useRef(null);
  const searchInputRef = useRef(null);

  // Debounce search with cleanup
  const debouncedSetSearchTerm = useMemo(
    () => debounce((value) => setSearchTerm(value), 300),
    []
  );

  useEffect(() => {
    return () => debouncedSetSearchTerm.cancel();
  }, [debouncedSetSearchTerm]);

  // Fetch data with cleanup
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    let isMounted = true;

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      const start = new Date(startDate);
      const end = new Date(endDate);

      const filteredPayments = MOCK_PAYMENTS.filter((payment) => {
        const paymentDate = new Date(payment.date);
        return (
          paymentDate >= new Date(start.setHours(0, 0, 0, 0)) &&
          paymentDate <= new Date(end.setHours(23, 59, 59, 999))
        );
      });

      const filteredExpenses = MOCK_EXPENSES.filter((expense) => {
        const expenseDate = new Date(expense.date);
        return (
          expenseDate >= new Date(start.setHours(0, 0, 0, 0)) &&
          expenseDate <= new Date(end.setHours(23, 59, 59, 999))
        );
      });

      if (isMounted) {
        setPayments(filteredPayments);
        setExpenses(filteredExpenses);
        if (filteredPayments.length === 0 && filteredExpenses.length === 0) {
          toast.info('No records found for the selected date range', { autoClose: 3000 });
        }
      }
    } catch (err) {
      if (isMounted) {
        setError('Failed to load data. Please try again.');
        console.error('Error fetching data:', err);
        toast.error('Failed to load data. Please try again.');
      }
    } finally {
      if (isMounted) setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [startDate, endDate]);

  useEffect(() => {
    const cleanup = fetchData();
    return cleanup;
  }, [fetchData, refreshCount]);

  const handleRefresh = useCallback(() => {
    setRefreshCount((prev) => prev + 1);
    toast.info('Refreshing data...', { autoClose: 2000 });
  }, []);

  const handleResetFilters = useCallback(() => {
    setSearchTerm('');
    setStartDate(new Date(new Date().setDate(new Date().getDate() - 7)));
    setEndDate(new Date());
    setViewMode('all');
    setSortDirection('date_desc');
    setTaxes(DEFAULT_TAXES);
    toast.info('Filters reset', { autoClose: 2000 });
  }, []);

  const filteredPayments = useMemo(() =>
    payments.filter(
      (payment) =>
        payment.paymentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.userName.toLowerCase().includes(searchTerm.toLowerCase())
    ), [payments, searchTerm]);

  const filteredExpenses = useMemo(() =>
    expenses.filter(
      (expense) =>
        expense.expenseId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) || '')
    ), [expenses, searchTerm]);

  const sortedPayments = useMemo(() => [...filteredPayments].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    if (sortDirection === 'amount_asc') return a.amount - b.amount;
    if (sortDirection === 'amount_desc') return b.amount - a.amount;
    if (sortDirection === 'date_asc') return dateA.getTime() - dateB.getTime();
    return dateB.getTime() - dateA.getTime();
  }), [filteredPayments, sortDirection]);

  const sortedExpenses = useMemo(() => [...filteredExpenses].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    if (sortDirection === 'amount_asc') return a.amount - b.amount;
    if (sortDirection === 'amount_desc') return b.amount - a.amount;
    if (sortDirection === 'date_asc') return dateA.getTime() - dateB.getTime();
    return dateB.getTime() - dateA.getTime();
  }), [filteredExpenses, sortDirection]);

  const toggleSort = useCallback((type) => {
    setSortDirection((prev) =>
      type === 'amount'
        ? prev === 'amount_asc' ? 'amount_desc' : 'amount_asc'
        : prev === 'date_asc' ? 'date_desc' : 'date_asc'
    );
  }, []);

  // Enhanced tax calculations with validation
  const calculateTaxes = useCallback((amount, type) => {
    if (!Array.isArray(taxes) || isNaN(amount) || amount <= 0) return [];
    const applicableTaxes = taxes.filter(
      (tax) => tax.isEnabled && tax.appliesTo === type && !isNaN(tax.rate)
    );
    return applicableTaxes.map((tax) => {
      let taxableAmount = amount;
      if (tax.isIncludedInPrice) {
        taxableAmount = amount / (1 + tax.rate / 100);
      }
      const taxAmount = taxableAmount * (tax.rate / 100);
      return { ...tax, amount: taxAmount, taxableAmount };
    });
  }, [taxes]);

  const calculateNetAmount = useCallback((amount, type) => {
    if (!Array.isArray(taxes) || isNaN(amount) || amount <= 0) return amount;
    const applicableTaxes = taxes.filter(
      (tax) => tax.isEnabled && tax.appliesTo === type && tax.isIncludedInPrice && !isNaN(tax.rate)
    );
    if (applicableTaxes.length === 0) return amount;
    const totalTaxRate = applicableTaxes.reduce((sum, tax) => sum + tax.rate, 0);
    return amount / (1 + totalTaxRate / 100);
  }, [taxes]);

  const calculateGrossAmount = useCallback((amount, type) => {
    if (!Array.isArray(taxes) || isNaN(amount) || amount <= 0) return amount;
    const applicableTaxes = taxes.filter(
      (tax) => tax.isEnabled && tax.appliesTo === type && !tax.isIncludedInPrice && !isNaN(tax.rate)
    );
    if (applicableTaxes.length === 0) return amount;
    const totalTaxRate = applicableTaxes.reduce((sum, tax) => sum + tax.rate, 0);
    return amount * (1 + totalTaxRate / 100);
  }, [taxes]);

  const generateReport = useCallback(async (type) => {
    setIsGeneratingReport(true);
    try {
      const hasRevenueData = (viewMode === 'all' || viewMode === 'revenue') && sortedPayments.length > 0;
      const hasExpenseData = (viewMode === 'all' || viewMode === 'expenses') && sortedExpenses.length > 0;

      if (!hasRevenueData && !hasExpenseData) {
        toast.warning('No data to generate report', { autoClose: 3000 });
        return;
      }

      if (type === 'pdf') {
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.setTextColor(40, 53, 147);
        doc.text('PAYMENT RECONCILIATION REPORT', 105, 15, { align: 'center' });
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Date Range: ${format(startDate, 'dd/MM/yyyy')} to ${format(endDate, 'dd/MM/yyyy')}`, 14, 25);
        doc.text(`View Mode: ${viewMode.charAt(0).toUpperCase() + viewMode.slice(1)}`, 14, 30);

        const enabledTaxes = taxes.filter((tax) => tax.isEnabled);
        doc.text(
          enabledTaxes.length > 0
            ? `Taxes: ${enabledTaxes.map((tax) => `${tax.name} (${tax.rate}%)`).join(', ')}`
            : 'Tax Calculation: Disabled',
          14,
          35
        );

        let startY = 45;

        if (hasRevenueData) {
          doc.setFontSize(12);
          doc.setTextColor(40, 53, 147);
          doc.text('REVENUE', 14, startY);
          startY += 10;

          const revenueHeaders = [
            ['Payment ID', 'User', 'Source', 'Category', 'Net Amount (KES)'],
            ...taxes.filter((tax) => tax.isEnabled && tax.appliesTo === 'revenue').map((tax) => [`${tax.name} (${tax.rate}%)`]),
            ['Gross Amount (KES)', 'Date'],
          ].flat();

          const revenueData = sortedPayments.map((payment) => {
            const rowData = [
              payment.paymentId,
              payment.userName,
              payment.source,
              payment.category,
              calculateNetAmount(payment.amount, 'revenue').toLocaleString('en-KE', { minimumFractionDigits: 2 }),
            ];
            taxes.filter((tax) => tax.isEnabled && tax.appliesTo === 'revenue').forEach((tax) => {
              const taxObj = calculateTaxes(payment.amount, 'revenue').find((t) => t.id === tax.id);
              rowData.push(taxObj ? taxObj.amount.toLocaleString('en-KE', { minimumFractionDigits: 2 }) : '0.00');
            });
            rowData.push(
              payment.amount.toLocaleString('en-KE', { minimumFractionDigits: 2 }),
              format(parseISO(payment.date), 'dd/MM/yyyy')
            );
            return rowData;
          });

          doc.autoTable({
            head: [revenueHeaders],
            body: revenueData,
            startY,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [40, 53, 147], textColor: 255 },
            alternateRowStyles: { fillColor: [240, 240, 240] },
          });

          startY = doc.lastAutoTable.finalY + 10;
        }

        if (hasExpenseData) {
          doc.setFontSize(12);
          doc.setTextColor(40, 53, 147);
          doc.text('EXPENSES', 14, startY);
          startY += 10;

          const expenseHeaders = [
            ['Expense ID', 'Description', 'Category', 'Amount (KES)'],
            ...taxes.filter((tax) => tax.isEnabled && tax.appliesTo === 'expenses').map((tax) => [`${tax.name} (${tax.rate}%)`]),
            ['Net Amount (KES)', 'Date'],
          ].flat();

          const expenseData = sortedExpenses.map((expense) => {
            const rowData = [
              expense.expenseId,
              expense.description || 'N/A',
              expense.category,
              expense.amount.toLocaleString('en-KE', { minimumFractionDigits: 2 }),
            ];
            taxes.filter((tax) => tax.isEnabled && tax.appliesTo === 'expenses').forEach((tax) => {
              const taxObj = calculateTaxes(expense.amount, 'expenses').find((t) => t.id === tax.id);
              rowData.push(taxObj ? taxObj.amount.toLocaleString('en-KE', { minimumFractionDigits: 2 }) : '0.00');
            });
            rowData.push(
              calculateNetAmount(expense.amount, 'expenses').toLocaleString('en-KE', { minimumFractionDigits: 2 }),
              format(parseISO(expense.date), 'dd/MM/yyyy')
            );
            return rowData;
          });

          doc.autoTable({
            head: [expenseHeaders],
            body: expenseData,
            startY,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [153, 0, 0], textColor: 255 },
            alternateRowStyles: { fillColor: [255, 240, 240] },
          });

          startY = doc.lastAutoTable.finalY + 10;
        }

        const totalRevenue = sortedPayments.reduce((sum, payment) => sum + payment.amount, 0);
        const totalExpenses = sortedExpenses.reduce((sum, expense) => sum + expense.amount, 0);
        const revenueTaxes = calculateTaxes(totalRevenue, 'revenue');
        const expenseTaxes = calculateTaxes(totalExpenses, 'expenses');
        const totalRevenueTax = revenueTaxes.reduce((sum, tax) => sum + tax.amount, 0);
        const totalExpenseTax = expenseTaxes.reduce((sum, tax) => sum + tax.amount, 0);
        const netRevenue = calculateNetAmount(totalRevenue, 'revenue');
        const netExpenses = calculateNetAmount(totalExpenses, 'expenses');
        const profit = totalRevenue - totalExpenses - totalExpenseTax;

        doc.setFontSize(10);
        doc.setTextColor(40, 53, 147);

        if (viewMode === 'all' || viewMode === 'revenue') {
          doc.text(`Total Revenue (Gross): KES ${totalRevenue.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`, 14, startY);
          startY += 5;
          if (revenueTaxes.length > 0) {
            doc.text(`Net Revenue (Before Tax): KES ${netRevenue.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`, 14, startY);
            startY += 5;
            revenueTaxes.forEach((tax) => {
              doc.text(`${tax.name} (${tax.rate}%): KES ${tax.amount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`, 14, startY);
              startY += 5;
            });
          }
        }

        if (viewMode === 'all' || viewMode === 'expenses') {
          doc.text(`Total Expenses (Gross): KES ${totalExpenses.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`, 14, startY);
          startY += 5;
          if (expenseTaxes.length > 0) {
            doc.text(`Net Expenses (Before Tax): KES ${netExpenses.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`, 14, startY);
            startY += 5;
            expenseTaxes.forEach((tax) => {
              doc.text(`${tax.name} (${tax.rate}%): KES ${tax.amount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`, 14, startY);
              startY += 5;
            });
          }
        }

        if (viewMode === 'all') {
          doc.text(`Total Taxes: KES ${(totalRevenueTax + totalExpenseTax).toLocaleString('en-KE', { minimumFractionDigits: 2 })}`, 14, startY);
          startY += 5;
          doc.text(`Profit (After Tax): KES ${profit.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`, 14, startY);
          startY += 5;
        }

        doc.text(`Generated on: ${format(new Date(), 'dd/MM/yyyy HH:mm:ss')}`, 14, startY);
        doc.save(`Payment_Reconciliation_${new Date().toISOString().slice(0, 10)}.pdf`);
        toast.success('PDF report generated successfully');
      } else if (type === 'csv') {
        toast.info('Preparing CSV download...', { autoClose: 2000 });
      }
    } catch (err) {
      console.error('Report generation error:', err);
      toast.error(`Failed to generate report: ${err.message}`);
    } finally {
      setIsGeneratingReport(false);
    }
  }, [sortedPayments, sortedExpenses, viewMode, startDate, endDate, taxes, calculateTaxes, calculateNetAmount]);

  const { totalRevenue, totalExpenses, profit, totalRevenueTax, totalExpenseTax, netRevenue, netExpenses } = useMemo(() => {
    const rev = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const exp = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const revTaxes = calculateTaxes(rev, 'revenue');
    const expTaxes = calculateTaxes(exp, 'expenses');
    const revTax = revTaxes.reduce((sum, tax) => sum + tax.amount, 0);
    const expTax = expTaxes.reduce((sum, tax) => sum + tax.amount, 0);
    const netRev = calculateNetAmount(rev, 'revenue');
    const netExp = calculateNetAmount(exp, 'expenses');
    return {
      totalRevenue: rev,
      totalExpenses: exp,
      profit: rev - exp - expTax,
      totalRevenueTax: revTax,
      totalExpenseTax: expTax,
      netRevenue: netRev,
      netExpenses: netExp,
    };
  }, [payments, expenses, calculateTaxes, calculateNetAmount]);

  const csvData = useMemo(() => {
    const mapPayment = (p) => {
      const baseData = {
        Type: 'Revenue',
        ID: p.paymentId,
        User: p.userName,
        Source: p.source,
        Category: p.category,
        'Net Amount (KES)': calculateNetAmount(p.amount, 'revenue').toFixed(2),
      };
      calculateTaxes(p.amount, 'revenue').forEach((tax) => {
        baseData[`${tax.name} (${tax.rate}%)`] = tax.amount.toFixed(2);
      });
      baseData['Gross Amount (KES)'] = p.amount.toFixed(2);
      baseData['Date'] = format(parseISO(p.date), 'dd/MM/yyyy');
      return baseData;
    };

    const mapExpense = (e) => {
      const baseData = {
        Type: 'Expense',
        ID: e.expenseId,
        Description: e.description || 'N/A',
        Category: e.category,
        'Amount (KES)': e.amount.toFixed(2),
      };
      calculateTaxes(e.amount, 'expenses').forEach((tax) => {
        baseData[`${tax.name} (${tax.rate}%)`] = tax.amount.toFixed(2);
      });
      baseData['Net Amount (KES)'] = calculateNetAmount(e.amount, 'expenses').toFixed(2);
      baseData['Date'] = format(parseISO(e.date), 'dd/MM/yyyy');
      return baseData;
    };

    if (viewMode === 'all') {
      return [...sortedPayments.map(mapPayment), ...sortedExpenses.map(mapExpense)];
    } else if (viewMode === 'revenue') {
      return sortedPayments.map(mapPayment);
    } else {
      return sortedExpenses.map(mapExpense);
    }
  }, [sortedPayments, sortedExpenses, viewMode, calculateTaxes, calculateNetAmount]);

  const openAddExpenseModal = useCallback(() => setShowAddExpenseModal(true), []);

  const closeAddExpenseModal = useCallback(() => {
    setShowAddExpenseModal(false);
    setNewExpense({
      description: '',
      amount: '',
      category: customCategories[0] || 'Operations',
      date: new Date().toISOString(),
    });
    setEditingCategories(false);
    setNewCategory('');
  }, [customCategories]);

  const handleExpenseInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setNewExpense((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleDateChange = useCallback((date) => {
    setNewExpense((prev) => ({
      ...prev,
      date: date ? date.toISOString() : new Date().toISOString(),
    }));
  }, []);

  const handleAddExpense = useCallback(() => {
    if (!newExpense.description.trim()) {
      toast.error('Description is required');
      return;
    }
    if (!newExpense.amount || isNaN(newExpense.amount) || Number(newExpense.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (!customCategories.includes(newExpense.category)) {
      toast.error('Please select a valid category');
      return;
    }

    const newExpenseRecord = {
      id: expenses.length + 1,
      expenseId: `EX${new Date().getTime().toString().slice(-6)}`,
      description: newExpense.description.trim(),
      amount: Number(newExpense.amount),
      category: newExpense.category,
      date: newExpense.date,
    };

    setExpenses((prev) => [...prev, newExpenseRecord]);
    toast.success('Expense added successfully!');
    closeAddExpenseModal();
  }, [newExpense, expenses, customCategories, closeAddExpenseModal]);

  const toggleCategoryEditing = useCallback(() => setEditingCategories((prev) => !prev), []);

  const handleAddCategory = useCallback(() => {
    const trimmedCategory = newCategory.trim();
    if (!trimmedCategory) {
      toast.error('Category name cannot be empty');
      return;
    }
    if (customCategories.includes(trimmedCategory)) {
      toast.error('Category already exists');
      return;
    }
    setCustomCategories((prev) => [...prev, trimmedCategory]);
    setNewCategory('');
    toast.success('Category added successfully!');
  }, [newCategory, customCategories]);

  const handleRemoveCategory = useCallback((categoryToRemove) => {
    if (customCategories.length <= 1) {
      toast.error('You must have at least one category');
      return;
    }
    setCustomCategories((prev) => prev.filter((cat) => cat !== categoryToRemove));
    if (newExpense.category === categoryToRemove) {
      setNewExpense((prev) => ({ ...prev, category: customCategories[0] || 'Operations' }));
    }
    toast.success('Category removed successfully!');
  }, [customCategories, newExpense.category]);

  const toggleTaxConfig = useCallback(() => setShowTaxConfig((prev) => !prev), []);

  const handleTaxInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setNewTax((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }, []);

  const handleAddTax = useCallback(() => {
    if (!newTax.name.trim()) {
      toast.error('Tax name is required');
      return;
    }
    const rate = Number(newTax.rate);
    if (isNaN(rate) || rate < 0 || rate > 100) {
      toast.error('Tax rate must be a number between 0 and 100');
      return;
    }

    const taxId = newTax.name.toLowerCase().replace(/\s+/g, '-');
    if (taxes.some((tax) => tax.id === taxId)) {
      toast.error('A tax with a similar name already exists');
      return;
    }

    const taxToAdd = {
      id: taxId,
      name: newTax.name.trim(),
      rate,
      description: newTax.description.trim(),
      appliesTo: newTax.appliesTo,
      isEnabled: newTax.isEnabled,
      isIncludedInPrice: newTax.isIncludedInPrice,
    };

    setTaxes((prev) => [...prev, taxToAdd]);
    setNewTax({
      name: '',
      rate: 0,
      description: '',
      appliesTo: 'revenue',
      isEnabled: true,
      isIncludedInPrice: false,
    });
    toast.success('Tax added successfully!');
  }, [newTax, taxes]);

  const handleToggleTax = useCallback((taxId, isEnabled) => {
    setTaxes((prev) => prev.map((tax) => (tax.id === taxId ? { ...tax, isEnabled } : tax)));
  }, []);

  const handleRemoveTax = useCallback((taxId) => {
    if (taxes.length <= 1) {
      toast.error('You must have at least one tax configured');
      return;
    }
    setTaxes((prev) => prev.filter((tax) => tax.id !== taxId));
    toast.success('Tax removed successfully!');
  }, [taxes]);

  useEffect(() => {
    if ((showAddExpenseModal || showTaxConfig) && (modalRef.current || taxModalRef.current)) {
      const currentModalRef = showAddExpenseModal ? modalRef.current : taxModalRef.current;
      const focusableElements = currentModalRef.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      const handleKeyDown = (e) => {
        if (e.key === 'Tab') {
          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
        if (e.key === 'Escape') {
          showAddExpenseModal ? closeAddExpenseModal() : toggleTaxConfig();
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      firstElement?.focus();

      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [showAddExpenseModal, showTaxConfig, closeAddExpenseModal, toggleTaxConfig]);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 flex items-center">
            <FaMoneyBillWave className="mr-2 text-blue-600" /> Payment Reconciliation
          </h1>
          <div className="flex items-center space-x-2 mt-2 md:mt-0">
            <button
              onClick={handleRefresh}
              className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Refresh data"
            >
              <AiOutlineReload className="mr-1" /> Refresh
            </button>
            <button
              onClick={handleResetFilters}
              className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Reset filters"
            >
              Reset Filters
            </button>
            <div className="relative">
              <DatePicker
                selected={startDate}
                onChange={(date) => date && setStartDate(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                maxDate={new Date()}
                className="p-2 border rounded-lg w-32 focus:ring-blue-500 focus:border-blue-500"
                dateFormat="dd/MM/yyyy"
                aria-label="Start date"
              />
              <FaCalendarAlt className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
            </div>
            <span className="text-gray-500">to</span>
            <div className="relative">
              <DatePicker
                selected={endDate}
                onChange={(date) => date && setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate}
                maxDate={new Date()}
                className="p-2 border rounded-lg w-32 focus:ring-blue-500 focus:border-blue-500"
                dateFormat="dd/MM/yyyy"
                aria-label="End date"
              />
              <FaCalendarAlt className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-medium text-gray-800">Tax Configuration</h2>
            <button
              onClick={toggleTaxConfig}
              className="flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              aria-label="Configure taxes"
            >
              {showTaxConfig ? 'Hide Tax Settings' : 'Configure Taxes'}
            </button>
          </div>

          {showTaxConfig && (
            <div ref={taxModalRef} className="mt-4 p-4 border rounded-lg bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tax Name</label>
                  <input
                    type="text"
                    name="name"
                    value={newTax.name}
                    onChange={handleTaxInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g. VAT, Withholding Tax"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tax Rate (%)</label>
                  <input
                    type="number"
                    name="rate"
                    value={newTax.rate}
                    onChange={handleTaxInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g. 16 for 16%"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
 agon="description"
                    name="description"
                    value={newTax.description}
                    onChange={handleTaxInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Tax description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Applies To</label>
                  <select
                    name="appliesTo"
                    value={newTax.appliesTo}
                    onChange={handleTaxInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="revenue">Revenue</option>
                    <option value="expenses">Expenses</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isIncludedInPrice"
                    name="isIncludedInPrice"
                    checked={newTax.isIncludedInPrice}
                    onChange={handleTaxInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isIncludedInPrice" className="ml-2 block text-sm text-gray-700">
                    Tax is included in price
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isEnabled"
                    name="isEnabled"
                    checked={newTax.isEnabled}
                    onChange={handleTaxInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isEnabled" className="ml-2 block text-sm text-gray-700">
                    Enabled by default
                  </label>
                </div>
              </div>
              <button
                onClick={handleAddTax}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Add Tax
              </button>

              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Configured Taxes</h3>
                {taxes.length === 0 ? (
                  <p className="text-sm text-gray-500">No taxes configured</p>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {taxes.map((tax) => (
                      <li key={tax.id} className="py-3 flex justify-between items-center">
                        <div>
                          <div className="flex items-center">
                            <span className="font-medium">{tax.name} ({tax.rate}%)</span>
                            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {tax.appliesTo}
                            </span>
                            {tax.isIncludedInPrice && (
                              <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                Included
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">{tax.description}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="relative inline-block w-10">
                            <input
                              type="checkbox"
                              id={`toggle-${tax.id}`}
                              checked={tax.isEnabled}
                              onChange={(e) => handleToggleTax(tax.id, e.target.checked)}
                              className="sr-only"
                            />
                            <label
                              htmlFor={`toggle-${tax.id}`}
                              className={`relative inline-block w-10 h-6 rounded-full cursor-pointer ${
                                tax.isEnabled ? 'bg-green-500' : 'bg-gray-300'
                              }`}
                            >
                              <span
                                className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                                  tax.isEnabled ? 'translate-x-4' : ''
                                }`}
                              />
                            </label>
                          </div>
                          <button
                            onClick={() => handleRemoveTax(tax.id)}
                            className="text-red-500 hover:text-red-700"
                            aria-label={`Remove ${tax.name} tax`}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
              <h3 className="text-sm font-medium text-blue-800">Revenue Taxes</h3>
              {taxes.filter((tax) => tax.isEnabled && tax.appliesTo === 'revenue').length > 0 ? (
                <ul className="mt-1 space-y-1">
                  {taxes.filter((tax) => tax.isEnabled && tax.appliesTo === 'revenue').map((tax) => (
                    <li key={tax.id} className="flex justify-between text-sm">
                      <span>{tax.name} ({tax.rate}%)</span>
                      <span className="font-medium">
                        KES {calculateTaxes(totalRevenue, 'revenue').find((t) => t.id === tax.id)?.amount.toLocaleString('en-KE', { minimumFractionDigits: 2 }) || '0.00'}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-blue-600 mt-1">No taxes applied to revenue</p>
              )}
            </div>
            <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
              <h3 className="text-sm font-medium text-purple-800">Expense Taxes</h3>
              {taxes.filter((tax) => tax.isEnabled && tax.appliesTo === 'expenses').length > 0 ? (
                <ul className="mt-1 space-y-1">
                  {taxes.filter((tax) => tax.isEnabled && tax.appliesTo === 'expenses').map((tax) => (
                    <li key={tax.id} className="flex justify-between text-sm">
                      <span>{tax.name} ({tax.rate}%)</span>
                      <span className="font-medium">
                        KES {calculateTaxes(totalExpenses, 'expenses').find((t) => t.id === tax.id)?.amount.toLocaleString('en-KE', { minimumFractionDigits: 2 }) || '0.00'}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-purple-600 mt-1">No taxes applied to expenses</p>
              )}
            </div>
            <div className="bg-green-50 p-3 rounded-lg border border-green-100">
              <h3 className="text-sm font-medium text-green-800">Total Tax Liability</h3>
              <p className="text-lg font-bold text-green-700 mt-1">
                KES {(totalRevenueTax + totalExpenseTax).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500 hover:shadow-md transition-shadow">
            <h3 className="text-gray-500 text-sm">Total Revenue</h3>
            <p className="text-2xl font-bold text-green-600">
              KES {totalRevenue.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
              {taxes.some((tax) => tax.isEnabled && tax.appliesTo === 'revenue') && (
                <span className="block text-sm font-normal text-gray-500">
                  (Net: KES {netRevenue.toLocaleString('en-KE', { minimumFractionDigits: 2 })} + Tax: KES {totalRevenueTax.toLocaleString('en-KE', { minimumFractionDigits: 2 })})
                </span>
              )}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-red-500 hover:shadow-md transition-shadow">
            <h3 className="text-gray-500 text-sm">Total Expenses</h3>
            <p className="text-2xl font-bold text-red-600">
              KES {totalExpenses.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
              {taxes.some((tax) => tax.isEnabled && tax.appliesTo === 'expenses') && (
                <span className="block text-sm font-normal text-gray-500">
                  (Net: KES {netExpenses.toLocaleString('en-KE', { minimumFractionDigits: 2 })} + Tax: KES {totalExpenseTax.toLocaleString('en-KE', { minimumFractionDigits: 2 })})
                </span>
              )}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500 hover:shadow-md transition-shadow">
            <h3 className="text-gray-500 text-sm">Profit (After Tax)</h3>
            <p className={`text-2xl font-bold ${profit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              KES {profit.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
            <div className="relative flex-grow">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                className="pl-10 pr-4 py-2 border rounded-lg w-full focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search by ID, source, user, or category..."
                onChange={(e) => debouncedSetSearchTerm(e.target.value)}
                aria-label="Search payments and expenses"
              />
            </div>
            <div className="flex space-x-2">
              <select
                className="p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white"
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value)}
                aria-label="View mode"
              >
                <option value="all">All</option>
                <option value="revenue">Revenue</option>
                <option value="expenses">Expenses</option>
              </select>
              <button
                className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50"
                onClick={() => toggleSort('date')}
                aria-label="Sort by date"
              >
                {sortDirection.includes('date') ? (
                  sortDirection === 'date_asc' ? <FaSortAmountUp className="mr-1" /> : <FaSortAmountDown className="mr-1" />
                ) : (
                  <FaSortAmountDown className="mr-1" />
                )}
                Date
              </button>
              <button
                className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50"
                onClick={() => toggleSort('amount')}
                aria-label="Sort by amount"
              >
                {sortDirection.includes('amount') ? (
                  sortDirection === 'amount_asc' ? <FaSortAmountUp className="mr-1" /> : <FaSortAmountDown className="mr-1" />
                ) : (
                  <FaSortAmountDown className="mr-1" />
                )}
                Amount
              </button>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => generateReport('pdf')}
                disabled={isGeneratingReport}
                className={`flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  isGeneratingReport ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                aria-label="Generate PDF report"
              >
                {isGeneratingReport ? (
                  <div className="inline-block animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                ) : (
                  <FaDownload className="mr-2" />
                )}
                PDF
              </button>
              <CSVLink
                data={csvData}
                filename={`payment_reconciliation_${new Date().toISOString().slice(0, 10)}.csv`}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                aria-label="Download CSV"
                onClick={() => toast.success('CSV download started')}
              >
                <FaDownload className="mr-2" /> CSV
              </CSVLink>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6" role="alert">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-8" aria-live="polite">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
            <p>Loading data...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {(viewMode === 'all' || viewMode === 'revenue') && (
              <div className="bg-white rounded-lg shadow overflow-hidden transition-all hover:shadow-md">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-lg font-medium text-gray-900 flex items-center">
                    <FaMoneyBillWave className="mr-2 text-green-600" /> Revenue
                  </h2>
                  <span className="text-sm text-gray-500">{sortedPayments.length} records</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Payment ID
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Source
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Net Amount (KES)
                        </th>
                        {taxes.filter((tax) => tax.isEnabled && tax.appliesTo === 'revenue').map((tax) => (
                          <th key={tax.id} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {tax.name} ({tax.rate}%)
                          </th>
                        ))}
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Gross Amount (KES)
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sortedPayments.length > 0 ? (
                        sortedPayments.map((payment) => {
                          const netAmount = calculateNetAmount(payment.amount, 'revenue');
                          const paymentTaxes = calculateTaxes(payment.amount, 'revenue');
                          return (
                            <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">{payment.paymentId}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.userName}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.source}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.category}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                                {netAmount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                              </td>
                              {taxes.filter((tax) => tax.isEnabled && tax.appliesTo === 'revenue').map((tax) => (
                                <td key={tax.id} className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600 font-medium">
                                  {paymentTaxes.find((t) => t.id === tax.id)?.amount.toLocaleString('en-KE', { minimumFractionDigits: 2 }) || '0.00'}
                                </td>
                              ))}
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                                {payment.amount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{format(parseISO(payment.date), 'dd/MM/yyyy')}</td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={6 + taxes.filter((tax) => tax.isEnabled && tax.appliesTo === 'revenue').length} className="px-6 py-4 text-center text-sm text-gray-500">
                            No revenue records found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {(viewMode === 'all' || viewMode === 'expenses') && (
              <div className="bg-white rounded-lg shadow overflow-hidden transition-all hover:shadow-md">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <div className="flex items-center">
                    <h2 className="text-lg font-medium text-gray-900 flex items-center">
                      <FaReceipt className="mr-2 text-red-600" /> Expenses
                    </h2>
                    <button
                      onClick={openAddExpenseModal}
                      className="ml-4 flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                      aria-label="Add new expense"
                    >
                      <FaPlus className="mr-1" /> Add Expense
                    </button>
                  </div>
                  <span className="text-sm text-gray-500">{sortedExpenses.length} records</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Expense ID
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount (KES)
                        </th>
                        {taxes.filter((tax) => tax.isEnabled && tax.appliesTo === 'expenses').map((tax) => (
                          <th key={tax.id} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {tax.name} ({tax.rate}%)
                          </th>
                        ))}
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Net Amount (KES)
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sortedExpenses.length > 0 ? (
                        sortedExpenses.map((expense) => {
                          const expenseTaxes = calculateTaxes(expense.amount, 'expenses');
                          const netAmount = calculateNetAmount(expense.amount, 'expenses');
                          return (
                            <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">{expense.expenseId}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{expense.description || 'N/A'}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{expense.category}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                                {expense.amount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                              </td>
                              {taxes.filter((tax) => tax.isEnabled && tax.appliesTo === 'expenses').map((tax) => (
                                <td key={tax.id} className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600 font-medium">
                                  {expenseTaxes.find((t) => t.id === tax.id)?.amount.toLocaleString('en-KE', { minimumFractionDigits: 2 }) || '0.00'}
                                </td>
                              ))}
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                                {netAmount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{format(parseISO(expense.date), 'dd/MM/yyyy')}</td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={5 + taxes.filter((tax) => tax.isEnabled && tax.appliesTo === 'expenses').length} className="px-6 py-4 text-center text-sm text-gray-500">
                            No expense records found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {showAddExpenseModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={closeAddExpenseModal}></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div
              ref={modalRef}
              className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
            >
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">Add New Expense</h2>
                  <button
                    onClick={closeAddExpenseModal}
                    className="text-gray-500 hover:text-gray-700 focus:outline-none"
                    aria-label="Close modal"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      id="description"
                      name="description"
                      value={newExpense.description}
                      onChange={handleExpenseInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="What was this expense for?"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                      Amount (KES)
                    </label>
                    <input
                      type="number"
                      id="amount"
                      name="amount"
                      value={newExpense.amount}
                      onChange={handleExpenseInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                        Category
                      </label>
                      <button
                        onClick={toggleCategoryEditing}
                        className="text-xs flex items-center text-blue-600 hover:text-blue-800"
                      >
                        {editingCategories ? <FaSave className="mr-1" /> : <FaEdit className="mr-1" />}
                        {editingCategories ? 'Save Categories' : 'Edit Categories'}
                      </button>
                    </div>
                    {editingCategories ? (
                      <div className="mb-4">
                        <div className="flex mb-2">
                          <input
                            type="text"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            className="flex-grow px-3 py-2 border rounded-l-lg focus:ring-blue-500 focus:border-blue-500"
                            placeholder="New category name"
                          />
                          <button
                            onClick={handleAddCategory}
                            className="px-3 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700"
                          >
                            Add
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {customCategories.map((category) => (
                            <div key={category} className="flex items-center bg-gray-100 rounded-full px-3 py-1">
                              <span className="text-sm">{category}</span>
                              <button
                                onClick={() => handleRemoveCategory(category)}
                                className="ml-1 text-red-500 hover:text-red-700"
                                aria-label={`Remove ${category} category`}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <select
                        id="category"
                        name="category"
                        value={newExpense.category}
                        onChange={handleExpenseInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white"
                        required
                      >
                        {customCategories.map((category) => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    )}
                  </div>
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                      Date
                    </label>
                    <DatePicker
                      selected={new Date(newExpense.date)}
                      onChange={handleDateChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      dateFormat="dd/MM/yyyy"
                      maxDate={new Date()}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={handleAddExpense}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Add Expense
                </button>
                <button
                  onClick={closeAddExpenseModal}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={5000} />
    </div>
  );
};

export default PaymentReconciliation;