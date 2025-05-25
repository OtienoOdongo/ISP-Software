// import React, { useState, useEffect } from 'react';
// import { toast, ToastContainer } from 'react-toastify';
// import { FaSearch, FaDownload, FaFilter, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';
// import { GrTransaction } from 'react-icons/gr';
// import { AiOutlineCheckCircle, AiOutlineCloseCircle } from 'react-icons/ai';
// import jsPDF from 'jspdf';
// import 'react-toastify/dist/ReactToastify.css';

// const MpesaLog = () => {
//   const [transactions, setTransactions] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [filterStatus, setFilterStatus] = useState('all');
//   const [sortDirection, setSortDirection] = useState('desc');
//   const [timeRange, setTimeRange] = useState('Daily');

//   // Mock data for M-Pesa transactions
//   const mockTransactions = [
//     { id: 1, transactionId: 'MPESA123', amount: 'KES 1000', status: 'Success', date: '2023-10-05', user: 'Alice Johnson' },
//     { id: 2, transactionId: 'MPESA456', amount: 'KES 500', status: 'Pending', date: '2023-10-06', user: 'Bob Smith' },
//     { id: 3, transactionId: 'MPESA789', amount: 'KES 2000', status: 'Failed', date: '2023-10-07', user: 'Charlie Brown' },
//   ];

//   useEffect(() => {
//     // Simulate fetching data from an API
//     setTimeout(() => {
//       try {
//         setTransactions(mockTransactions);
//       } catch (error) {
//         setError('Failed to load transactions');
//       } finally {
//         setLoading(false);
//       }
//     }, 1000);
//   }, []);

//   const filteredTransactions = transactions.filter(
//     transaction =>
//       transaction.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) &&
//       (filterStatus === 'all' || transaction.status.toLowerCase() === filterStatus) &&
//       (transaction.user.toLowerCase().includes(searchTerm.toLowerCase()))
//   );

//   const sortedTransactions = [...filteredTransactions].sort((a, b) => {
//     const dateA = new Date(a.date);
//     const dateB = new Date(b.date);
//     return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
//   });

//   const toggleSort = () => {
//     setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
//   };

//   const handleTransactionStatusChange = (transactionId, newStatus) => {
//     const updatedTransactions = transactions.map(transaction =>
//       transaction.id === transactionId ? { ...transaction, status: newStatus } : transaction
//     );
//     setTransactions(updatedTransactions);
//     toast.success(`Transaction ${transactionId} status updated to ${newStatus}`);
//   };

//   const generateReport = (user, period) => {
//     const doc = new jsPDF();
//     doc.setFontSize(12);
//     doc.text(`M-Pesa Transaction Report for ${user} (${period} period)`, 20, 20);

//     const filteredData = sortedTransactions.filter(
//       (transaction) => (user === 'All Users' || transaction.user === user) &&
//         (period === 'Daily' || period === 'Weekly' || period === 'Monthly')
//     );

//     filteredData.forEach((transaction, index) => {
//       doc.text(`Transaction ID: ${transaction.transactionId} | Amount: ${transaction.amount} | Status: ${transaction.status} | Date: ${transaction.date}`, 20, 30 + (index * 10));
//     });

//     doc.save(`${user}_Mpesa_Transaction_Report_${period}.pdf`);
//     toast.success(`Report for ${user} generated successfully`);
//   };

//   return (
//     <div className="p-6 bg-gray-100 min-h-screen">
//       <h1 className="text-2xl font-semibold mb-6 flex items-center">
//         <GrTransaction className="mr-2 text-blue-500" /> M-Pesa Transaction Log
//       </h1>

//       <div className="mb-4 flex flex-wrap items-center">
//         <input
//           type="text"
//           className="p-2 border rounded-lg w-full md:w-1/2 mr-2 mb-2 md:mb-0"
//           placeholder="Search transactions by ID or User..."
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//         />
//         <select
//           className="p-2 border rounded-lg mb-2 md:mb-0 md:mr-2"
//           value={filterStatus}
//           onChange={(e) => setFilterStatus(e.target.value)}
//         >
//           <option value="all">All</option>
//           <option value="success">Success</option>
//           <option value="pending">Pending</option>
//           <option value="failed">Failed</option>
//         </select>
//         <button
//           className="py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-700 transition flex items-center mb-2 md:mb-0"
//           onClick={toggleSort}
//         >
//           {sortDirection === 'asc' ? <FaSortAmountUp className="mr-1" /> : <FaSortAmountDown className="mr-1" />}
//           Sort
//         </button>
//         <div className="flex ml-auto">
//           <select
//             className="p-2 border rounded-lg mb-2 md:mb-0 md:mr-2"
//             value={timeRange}
//             onChange={(e) => setTimeRange(e.target.value)}
//           >
//             <option value="Daily">Daily</option>
//             <option value="Weekly">Weekly</option>
//             <option value="Monthly">Monthly</option>
//           </select>
//           <button
//             className="py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-700 transition flex items-center mb-2 md:mb-0"
//             onClick={() => generateReport('All Users', timeRange)}
//           >
//             <FaDownload className="mr-1" /> Generate Report
//           </button>
//         </div>
//       </div>

//       {loading ? (
//         <div className="text-center">Loading transactions...</div>
//       ) : error ? (
//         <div className="text-red-500">{error}</div>
//       ) : (
//         <div className="bg-white rounded-lg shadow-md">
//           <table className="w-full">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="py-3 px-6 text-left">Transaction ID</th>
//                 <th className="py-3 px-6 text-left">User</th>
//                 <th className="py-3 px-6 text-left">Amount</th>
//                 <th className="py-3 px-6 text-left">Status</th>
//                 <th className="py-3 px-6 text-left">Date</th>
//                 <th className="py-3 px-6 text-left">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {sortedTransactions.map(transaction => (
//                 <tr key={transaction.id} className="border-b hover:bg-gray-50">
//                   <td className="py-4 px-6">{transaction.transactionId}</td>
//                   <td className="py-4 px-6">{transaction.user}</td>
//                   <td className="py-4 px-6">{transaction.amount}</td>
//                   <td className="py-4 px-6">
//                     <span className={`inline-block py-1 px-3 rounded-full text-sm ${transaction.status === 'Success' ? 'bg-green-100 text-green-600' :
//                         transaction.status === 'Pending' ? 'bg-yellow-100 text-yellow-600' :
//                           'bg-red-100 text-red-600'
//                       }`}>
//                       {transaction.status}
//                     </span>
//                   </td>
//                   <td className="py-4 px-6">{transaction.date}</td>
//                   <td className="py-4 px-6">
//                     {transaction.status === 'Pending' && (
//                       <>
//                         <button
//                           onClick={() => handleTransactionStatusChange(transaction.id, 'Success')}
//                           className="bg-green-500 text-white py-1 px-4 rounded-lg hover:bg-green-600 transition mr-2"
//                         >
//                           <AiOutlineCheckCircle className="inline-block mr-2" />
//                           Mark as Successful
//                         </button>
//                         <button
//                           onClick={() => handleTransactionStatusChange(transaction.id, 'Failed')}
//                           className="bg-red-500 text-white py-1 px-4 rounded-lg hover:bg-red-600 transition"
//                         >
//                           <AiOutlineCloseCircle className="inline-block mr-2" />
//                           Mark as Failed
//                         </button>
//                       </>
//                     )}
//                     {transaction.status === 'Success' && (
//                       <button
//                         className="bg-green-300 text-white py-1 px-4 rounded-lg cursor-not-allowed opacity-50"
//                         disabled
//                       >
//                         <AiOutlineCheckCircle className="inline-block mr-2" />
//                         Already Successful
//                       </button>
//                     )}
//                     {transaction.status === 'Failed' && (
//                       <button
//                         className="bg-red-300 text-white py-1 px-4 rounded-lg cursor-not-allowed opacity-50"
//                         disabled
//                       >
//                         <AiOutlineCloseCircle className="inline-block mr-2" />
//                         Already Failed
//                       </button>
//                     )}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}

//       {filteredTransactions.length === 0 && !loading && !error && (
//         <p className="text-center mt-4 text-gray-500">No transactions found.</p>
//       )}
//       <ToastContainer />
//     </div>
//   );
// };

// export default MpesaLog;







// import React, { useState, useEffect } from 'react';
// import { toast, ToastContainer } from 'react-toastify';
// import { FaSearch, FaDownload, FaFilter, FaSortAmountDown, FaSortAmountUp, FaUser, FaCalendarAlt } from 'react-icons/fa';
// import { GrTransaction } from 'react-icons/gr';
// import { AiOutlineCheckCircle, AiOutlineCloseCircle, AiOutlineReload } from 'react-icons/ai';
// import jsPDF from 'jspdf';
// import 'jspdf-autotable';
// import { CSVLink } from 'react-csv';
// import 'react-toastify/dist/ReactToastify.css';
// import DatePicker from 'react-datepicker';
// import 'react-datepicker/dist/react-datepicker.css';

// const MpesaLog = () => {
//   const [transactions, setTransactions] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [filterStatus, setFilterStatus] = useState('all');
//   const [sortDirection, setSortDirection] = useState('desc');
//   const [timeRange, setTimeRange] = useState('daily');
//   const [startDate, setStartDate] = useState(new Date());
//   const [endDate, setEndDate] = useState(new Date());
//   const [selectedUser, setSelectedUser] = useState('all');
//   const [refreshCount, setRefreshCount] = useState(0);

//   // Enhanced mock data with more realistic transactions
//   const mockTransactions = [
//     { id: 1, transactionId: 'MPE231005123456', amount: 1000, status: 'Success', date: '2023-10-05T09:23:45', user: 'Alice Johnson', phone: '254712345678', account: 'Business Account' },
//     { id: 2, transactionId: 'MPE231006654321', amount: 500, status: 'Pending', date: '2023-10-06T14:45:22', user: 'Bob Smith', phone: '254723456789', account: 'Personal Account' },
//     { id: 3, transactionId: 'MPE231007987654', amount: 2000, status: 'Failed', date: '2023-10-07T11:12:33', user: 'Charlie Brown', phone: '254734567890', account: 'Merchant Account' },
//     { id: 4, transactionId: 'MPE231008456789', amount: 1500, status: 'Success', date: '2023-10-08T16:30:15', user: 'David Wilson', phone: '254745678901', account: 'Business Account' },
//     { id: 5, transactionId: 'MPE231009321654', amount: 750, status: 'Pending', date: '2023-10-09T08:15:42', user: 'Alice Johnson', phone: '254712345678', account: 'Personal Account' },
//   ];

//   // Simulate API call with error handling
//   const fetchTransactions = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       // In a real app, this would be an API call
//       await new Promise(resolve => setTimeout(resolve, 800));
      
//       // Apply date filtering to mock data to simulate real behavior
//       const filteredData = mockTransactions.filter(tx => {
//         const txDate = new Date(tx.date);
//         return txDate >= new Date(startDate.setHours(0, 0, 0, 0)) && 
//                txDate <= new Date(endDate.setHours(23, 59, 59, 999));
//       });
      
//       setTransactions(filteredData);
//     } catch (err) {
//       setError('Failed to load transactions. Please try again.');
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
//     toast.info('Refreshing transaction data...');
//   };

//   // Enhanced filtering with multiple criteria
//   const filteredTransactions = transactions.filter(
//     transaction =>
//       (transaction.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       (transaction.user.toLowerCase().includes(searchTerm.toLowerCase())) ||
//       (transaction.phone.includes(searchTerm))) &&
//       (filterStatus === 'all' || transaction.status.toLowerCase() === filterStatus) &&
//       (selectedUser === 'all' || transaction.user === selectedUser)
//   );

//   // Enhanced sorting with multiple columns
//   const sortedTransactions = [...filteredTransactions].sort((a, b) => {
//     const dateA = new Date(a.date);
//     const dateB = new Date(b.date);
    
//     if (sortDirection === 'amount_asc') return a.amount - b.amount;
//     if (sortDirection === 'amount_desc') return b.amount - a.amount;
//     if (sortDirection === 'date_asc') return dateA - dateB;
//     return dateB - dateA; // Default: date_desc
//   });

//   const toggleSort = (type) => {
//     if (type === 'amount') {
//       setSortDirection(prev => prev === 'amount_asc' ? 'amount_desc' : 'amount_asc');
//     } else {
//       setSortDirection(prev => prev === 'date_asc' ? 'date_desc' : 'date_asc');
//     }
//   };

//   const handleTransactionStatusChange = async (transactionId, newStatus) => {
//     try {
//       // Simulate API call
//       await new Promise(resolve => setTimeout(resolve, 500));
      
//       const updatedTransactions = transactions.map(transaction =>
//         transaction.id === transactionId ? { ...transaction, status: newStatus } : transaction
//       );
//       setTransactions(updatedTransactions);
//       toast.success(`Transaction ${transactionId} status updated to ${newStatus}`);
//     } catch (err) {
//       toast.error(`Failed to update transaction status: ${err.message}`);
//     }
//   };

//   // Enhanced report generation with more details and better formatting
//   const generateReport = (type) => {
//     try {
//       if (sortedTransactions.length === 0) {
//         toast.warning('No transactions to generate report');
//         return;
//       }

//       if (type === 'pdf') {
//         const doc = new jsPDF();
        
//         // Title
//         doc.setFontSize(16);
//         doc.setTextColor(40, 53, 147);
//         doc.text('M-PESA TRANSACTION REPORT', 105, 15, null, null, 'center');
        
//         // Filters info
//         doc.setFontSize(10);
//         doc.setTextColor(100, 100, 100);
//         doc.text(`Date Range: ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`, 14, 25);
//         doc.text(`Status: ${filterStatus === 'all' ? 'All' : filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}`, 14, 30);
//         doc.text(`User: ${selectedUser === 'all' ? 'All Users' : selectedUser}`, 14, 35);
        
//         // Table data
//         const headers = [['ID', 'Date', 'User', 'Phone', 'Amount (KES)', 'Status', 'Account']];
//         const data = sortedTransactions.map(tx => [
//           tx.transactionId,
//           new Date(tx.date).toLocaleString(),
//           tx.user,
//           tx.phone,
//           tx.amount.toLocaleString(),
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
//             0: { cellWidth: 25 },
//             1: { cellWidth: 30 },
//             2: { cellWidth: 25 },
//             3: { cellWidth: 25 },
//             4: { cellWidth: 20 },
//             5: { cellWidth: 20 },
//             6: { cellWidth: 25 }
//           }
//         });
        
//         // Footer
//         const totalAmount = sortedTransactions.reduce((sum, tx) => sum + tx.amount, 0);
//         doc.setFontSize(10);
//         doc.setTextColor(40, 53, 147);
//         doc.text(`Total Transactions: ${sortedTransactions.length}`, 14, doc.lastAutoTable.finalY + 10);
//         doc.text(`Total Amount: KES ${totalAmount.toLocaleString()}`, 14, doc.lastAutoTable.finalY + 15);
//         doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, doc.lastAutoTable.finalY + 20);
        
//         doc.save(`Mpesa_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
//         toast.success('PDF report generated successfully');
//       } else if (type === 'csv') {
//         toast.info('Preparing CSV download...');
//       }
//     } catch (err) {
//       toast.error(`Failed to generate report: ${err.message}`);
//     }
//   };

//   // Get unique users for filter dropdown
//   const uniqueUsers = ['all', ...new Set(transactions.map(tx => tx.user))];

//   // Calculate statistics for dashboard
//   const stats = {
//     total: transactions.length,
//     success: transactions.filter(tx => tx.status === 'Success').length,
//     pending: transactions.filter(tx => tx.status === 'Pending').length,
//     failed: transactions.filter(tx => tx.status === 'Failed').length,
//     totalAmount: transactions.reduce((sum, tx) => sum + tx.amount, 0)
//   };

//   return (
//     <div className="p-6 bg-gray-50 min-h-screen">
//       <div className="max-w-7xl mx-auto">
//         <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
//           <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 flex items-center">
//             <GrTransaction className="mr-2 text-blue-600" /> M-Pesa Transaction Log
//           </h1>
//           <div className="flex items-center space-x-2 mt-2 md:mt-0">
//             <button
//               onClick={handleRefresh}
//               className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
//             >
//               <AiOutlineReload className="mr-1" /> Refresh
//             </button>
//             <div className="relative">
//               <DatePicker
//                 selected={startDate}
//                 onChange={date => setStartDate(date)}
//                 selectsStart
//                 startDate={startDate}
//                 endDate={endDate}
//                 maxDate={new Date()}
//                 className="p-2 border rounded-lg w-32 focus:ring-blue-500 focus:border-blue-500"
//                 dateFormat="dd/MM/yyyy"
//               />
//               <FaCalendarAlt className="absolute right-3 top-3 text-gray-400" />
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
//                 className="p-2 border rounded-lg w-32 focus:ring-blue-500 focus:border-blue-500"
//                 dateFormat="dd/MM/yyyy"
//               />
//               <FaCalendarAlt className="absolute right-3 top-3 text-gray-400" />
//             </div>
//           </div>
//         </div>

//         {/* Stats Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
//           <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
//             <h3 className="text-gray-500 text-sm">Total Transactions</h3>
//             <p className="text-2xl font-bold">{stats.total}</p>
//           </div>
//           <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
//             <h3 className="text-gray-500 text-sm">Successful</h3>
//             <p className="text-2xl font-bold text-green-600">{stats.success}</p>
//           </div>
//           <div className="bg-white p-4 rounded-lg shadow border-l-4 border-yellow-500">
//             <h3 className="text-gray-500 text-sm">Pending</h3>
//             <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
//           </div>
//           <div className="bg-white p-4 rounded-lg shadow border-l-4 border-red-500">
//             <h3 className="text-gray-500 text-sm">Total Amount</h3>
//             <p className="text-2xl font-bold">KES {stats.totalAmount.toLocaleString()}</p>
//           </div>
//         </div>

//         {/* Filters and Actions */}
//         <div className="bg-white p-4 rounded-lg shadow mb-6">
//           <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
//             <div className="relative flex-grow">
//               <FaSearch className="absolute left-3 top-3 text-gray-400" />
//               <input
//                 type="text"
//                 className="pl-10 pr-4 py-2 border rounded-lg w-full focus:ring-blue-500 focus:border-blue-500"
//                 placeholder="Search by ID, user, or phone..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//               />
//             </div>
            
//             <div className="flex space-x-2">
//               <select
//                 className="p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
//                 value={filterStatus}
//                 onChange={(e) => setFilterStatus(e.target.value)}
//               >
//                 <option value="all">All Status</option>
//                 <option value="success">Success</option>
//                 <option value="pending">Pending</option>
//                 <option value="failed">Failed</option>
//               </select>
              
//               <select
//                 className="p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
//                 value={selectedUser}
//                 onChange={(e) => setSelectedUser(e.target.value)}
//               >
//                 {uniqueUsers.map(user => (
//                   <option key={user} value={user}>
//                     {user === 'all' ? 'All Users' : user}
//                   </option>
//                 ))}
//               </select>
              
//               <button
//                 className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50"
//                 onClick={() => toggleSort('date')}
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
//               >
//                 <FaDownload className="mr-2" /> PDF
//               </button>
              
//               <CSVLink
//                 data={sortedTransactions}
//                 filename={`mpesa_transactions_${new Date().toISOString().slice(0, 10)}.csv`}
//                 className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
//               >
//                 <FaDownload className="mr-2" /> CSV
//               </CSVLink>
//             </div>
//           </div>
//         </div>

//         {/* Transaction Table */}
//         {loading ? (
//           <div className="text-center py-8">
//             <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
//             <p>Loading transactions...</p>
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
//                       Transaction ID
//                     </th>
//                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       User
//                     </th>
//                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Phone
//                     </th>
//                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Amount (KES)
//                     </th>
//                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Status
//                     </th>
//                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Date & Time
//                     </th>
//                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Account
//                     </th>
//                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Actions
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-200">
//                   {sortedTransactions.length > 0 ? (
//                     sortedTransactions.map((transaction) => (
//                       <tr key={transaction.id} className="hover:bg-gray-50">
//                         <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
//                           {transaction.transactionId}
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                           <div className="flex items-center">
//                             <FaUser className="flex-shrink-0 h-4 w-4 text-gray-400 mr-2" />
//                             {transaction.user}
//                           </div>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                           {transaction.phone}
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
//                           {transaction.amount.toLocaleString()}
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
//                             transaction.status === 'Success' 
//                               ? 'bg-green-100 text-green-800' 
//                               : transaction.status === 'Pending' 
//                                 ? 'bg-yellow-100 text-yellow-800' 
//                                 : 'bg-red-100 text-red-800'
//                           }`}>
//                             {transaction.status}
//                           </span>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                           {new Date(transaction.date).toLocaleString()}
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                           {transaction.account}
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                           {transaction.status === 'Pending' && (
//                             <div className="flex space-x-2">
//                               <button
//                                 onClick={() => handleTransactionStatusChange(transaction.id, 'Success')}
//                                 className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 px-3 py-1 rounded-md text-xs font-medium"
//                               >
//                                 Approve
//                               </button>
//                               <button
//                                 onClick={() => handleTransactionStatusChange(transaction.id, 'Failed')}
//                                 className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md text-xs font-medium"
//                               >
//                                 Reject
//                               </button>
//                             </div>
//                           )}
//                           {transaction.status === 'Success' && (
//                             <span className="text-green-800 bg-green-50 px-2 py-1 rounded-md text-xs">
//                               Completed
//                             </span>
//                           )}
//                           {transaction.status === 'Failed' && (
//                             <span className="text-red-800 bg-red-50 px-2 py-1 rounded-md text-xs">
//                               Declined
//                             </span>
//                           )}
//                         </td>
//                       </tr>
//                     ))
//                   ) : (
//                     <tr>
//                       <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">
//                         No transactions found matching your criteria
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

// export default MpesaLog;








import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { FaSearch, FaDownload, FaSortAmountDown, FaSortAmountUp, FaUser, FaCalendarAlt } from 'react-icons/fa';
import { GrTransaction } from 'react-icons/gr';
import { AiOutlineReload } from 'react-icons/ai';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { CSVLink } from 'react-csv';
import 'react-toastify/dist/ReactToastify.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const TransactionLog = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortDirection, setSortDirection] = useState('date_desc');
  const [startDate, setStartDate] = useState(() => new Date(new Date().setDate(new Date().getDate() - 7)));
  const [endDate, setEndDate] = useState(new Date());
  const [refreshCount, setRefreshCount] = useState(0);
  const [transactions, setTransactions] = useState([]);

  const mockTransactions = useMemo(() => [
    { id: 1, transactionId: 'TX100523456', userName: 'John Doe', amount: 1000, status: 'Success', date: new Date().toISOString(), phone: '254712345678' },
    { id: 2, transactionId: 'TX100665432', userName: 'Jane Smith', amount: 500, status: 'Pending', date: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(), phone: '254723456789' },
    { id: 3, transactionId: 'TX100798765', userName: 'Bob Johnson', amount: 2000, status: 'Failed', date: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(), phone: '254734567890' },
    { id: 4, transactionId: 'TX100845678', userName: 'Alice Brown', amount: 1500, status: 'Success', date: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(), phone: '254745678901' },
    { id: 5, transactionId: 'TX100932165', userName: 'Mike Wilson', amount: 750, status: 'Pending', date: new Date(new Date().setDate(new Date().getDate() - 4)).toISOString(), phone: '254712345678' },
    { id: 6, transactionId: 'TX101012345', userName: 'Sarah Davis', amount: 3000, status: 'Success', date: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(), phone: '254756789012' },
    { id: 7, transactionId: 'TX101154321', userName: 'Tom Clark', amount: 1200, status: 'Success', date: new Date(new Date().setDate(new Date().getDate() - 6)).toISOString(), phone: '254767890123' },
  ], []);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      const filteredData = mockTransactions.filter(tx => {
        const txDate = new Date(tx.date);
        return txDate >= new Date(start.setHours(0, 0, 0, 0)) && 
               txDate <= new Date(end.setHours(23, 59, 59, 999));
      });
      
      setTransactions(filteredData);
      
      if (filteredData.length === 0) {
        toast.info('No transactions found for the selected date range', { autoClose: 3000 });
      }
    } catch (err) {
      setError('Failed to load transactions. Please try again.');
      console.error('Error fetching transactions:', err);
      toast.error('Failed to load transactions. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, refreshCount]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleRefresh = useCallback(() => {
    setRefreshCount(prev => prev + 1);
    toast.info('Refreshing transaction data...', { autoClose: 2000 });
  }, []);

  const filteredTransactions = useMemo(() => transactions.filter(
    transaction =>
      (transaction.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.phone.includes(searchTerm) ||
      transaction.userName.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterStatus === 'all' || transaction.status.toLowerCase() === filterStatus)
  ), [transactions, searchTerm, filterStatus]);

  const sortedTransactions = useMemo(() => [...filteredTransactions].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    
    if (sortDirection === 'amount_asc') return a.amount - b.amount;
    if (sortDirection === 'amount_desc') return b.amount - a.amount;
    if (sortDirection === 'date_asc') return dateA.getTime() - dateB.getTime();
    return dateB.getTime() - dateA.getTime();
  }), [filteredTransactions, sortDirection]);

  const toggleSort = useCallback((type) => {
    if (type === 'amount') {
      setSortDirection(prev => prev === 'amount_asc' ? 'amount_desc' : 'amount_asc');
    } else {
      setSortDirection(prev => prev === 'date_asc' ? 'date_desc' : 'date_asc');
    }
  }, []);

  const generateReport = useCallback((type) => {
    try {
      if (sortedTransactions.length === 0) {
        toast.warning('No transactions to generate report', { autoClose: 3000 });
        return;
      }

      if (type === 'pdf') {
        const doc = new jsPDF();
        
        doc.setFontSize(16);
        doc.setTextColor(40, 53, 147);
        doc.text('TRANSACTION LOG REPORT', 105, 15, { align: 'center' });
        
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Date Range: ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`, 14, 25);
        doc.text(`Status: ${filterStatus === 'all' ? 'All' : filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}`, 14, 30);
        
        const headers = [['Transaction ID', 'User', 'Phone', 'Amount (KES)', 'Status', 'Date & Time']];
        const data = sortedTransactions.map(tx => [
          tx.transactionId,
          tx.userName,
          tx.phone,
          tx.amount.toLocaleString(),
          tx.status,
          new Date(tx.date).toLocaleString()
        ]);
        
        doc.autoTable({
          head: headers,
          body: data,
          startY: 40,
          styles: { fontSize: 8 },
          headStyles: { fillColor: [40, 53, 147], textColor: 255 },
          alternateRowStyles: { fillColor: [240, 240, 240] }
        });
        
        const totalAmount = sortedTransactions.reduce((sum, tx) => sum + tx.amount, 0);
        doc.setFontSize(10);
        doc.setTextColor(40, 53, 147);
        doc.text(`Total Transactions: ${sortedTransactions.length}`, 14, doc.lastAutoTable.finalY + 10);
        doc.text(`Total Amount: KES ${totalAmount.toLocaleString()}`, 14, doc.lastAutoTable.finalY + 15);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, doc.lastAutoTable.finalY + 20);
        
        doc.save(`Transaction_Log_${new Date().toISOString().slice(0, 10)}.pdf`);
        toast.success('PDF report generated successfully');
      } else if (type === 'csv') {
        toast.info('Preparing CSV download...', { autoClose: 2000 });
      }
    } catch (err) {
      console.error('Report generation error:', err);
      toast.error(`Failed to generate report: ${err.message}`);
    }
  }, [sortedTransactions, startDate, endDate, filterStatus]);

  const stats = useMemo(() => ({
    total: transactions.length,
    success: transactions.filter(tx => tx.status === 'Success').length,
    pending: transactions.filter(tx => tx.status === 'Pending').length,
    failed: transactions.filter(tx => tx.status === 'Failed').length,
    totalAmount: transactions.reduce((sum, tx) => sum + tx.amount, 0)
  }), [transactions]);

  const csvData = useMemo(() => sortedTransactions.map(tx => ({
    'Transaction ID': tx.transactionId,
    'User': tx.userName,
    'Phone': tx.phone,
    'Amount (KES)': tx.amount,
    'Status': tx.status,
    'Date & Time': new Date(tx.date).toLocaleString()
  })), [sortedTransactions]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 flex items-center">
            <GrTransaction className="mr-2 text-blue-600" /> Transaction Log
          </h1>
          <div className="flex items-center space-x-2 mt-2 md:mt-0">
            <button
              onClick={handleRefresh}
              className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Refresh transactions"
            >
              <AiOutlineReload className="mr-1" /> Refresh
            </button>
            <div className="relative">
              <DatePicker
                selected={startDate}
                onChange={date => date && setStartDate(date)}
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
                onChange={date => date && setEndDate(date)}
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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
            <h3 className="text-gray-500 text-sm">Total Transactions</h3>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
            <h3 className="text-gray-500 text-sm">Successful</h3>
            <p className="text-2xl font-bold text-green-600">{stats.success}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-yellow-500">
            <h3 className="text-gray-500 text-sm">Pending</h3>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-red-500">
            <h3 className="text-gray-500 text-sm">Total Amount</h3>
            <p className="text-2xl font-bold">KES {stats.totalAmount.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
            <div className="relative flex-grow">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                className="pl-10 pr-4 py-2 border rounded-lg w-full focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search by ID, phone, or user..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search transactions"
              />
            </div>
            
            <div className="flex space-x-2">
              <select
                className="p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                aria-label="Filter by status"
              >
                <option value="all">All Status</option>
                <option value="success">Success</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
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
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Generate PDF report"
              >
                <FaDownload className="mr-2" /> PDF
              </button>
              
              <CSVLink
                data={csvData}
                filename={`transaction_log_${new Date().toISOString().slice(0, 10)}.csv`}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                aria-label="Download CSV"
              >
                <FaDownload className="mr-2" /> CSV
              </CSVLink>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8" aria-live="polite">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
            <p>Loading transactions...</p>
          </div>
        ) : error ? (
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
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transaction ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount (KES)
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedTransactions.length > 0 ? (
                    sortedTransactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                          {transaction.transactionId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {transaction.userName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transaction.phone}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                          {transaction.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            transaction.status === 'Success' 
                              ? 'bg-green-100 text-green-800' 
                              : transaction.status === 'Pending' 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : 'bg-red-100 text-red-800'
                          }`}>
                            {transaction.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(transaction.date).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                        No transactions found matching your criteria
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      <ToastContainer position="top-right" autoClose={5000} />
    </div>
  );
};

export default TransactionLog;