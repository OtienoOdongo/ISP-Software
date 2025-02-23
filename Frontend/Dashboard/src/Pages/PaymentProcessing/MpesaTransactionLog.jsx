import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { FaSearch, FaDownload, FaFilter, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';
import { GrTransaction } from 'react-icons/gr';
import { AiOutlineCheckCircle, AiOutlineCloseCircle } from 'react-icons/ai';
import jsPDF from 'jspdf';
import 'react-toastify/dist/ReactToastify.css';

const MpesaLog = () => {
  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortDirection, setSortDirection] = useState('desc');
  const [timeRange, setTimeRange] = useState('Daily');

  // Mock data for M-Pesa transactions
  const mockTransactions = [
    { id: 1, transactionId: 'MPESA123', amount: 'KES 1000', status: 'Success', date: '2023-10-05', user: 'Alice Johnson' },
    { id: 2, transactionId: 'MPESA456', amount: 'KES 500', status: 'Pending', date: '2023-10-06', user: 'Bob Smith' },
    { id: 3, transactionId: 'MPESA789', amount: 'KES 2000', status: 'Failed', date: '2023-10-07', user: 'Charlie Brown' },
  ];

  useEffect(() => {
    // Simulate fetching data from an API
    setTimeout(() => {
      try {
        setTransactions(mockTransactions);
      } catch (error) {
        setError('Failed to load transactions');
      } finally {
        setLoading(false);
      }
    }, 1000);
  }, []);

  const filteredTransactions = transactions.filter(
    transaction =>
      transaction.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterStatus === 'all' || transaction.status.toLowerCase() === filterStatus) &&
      (transaction.user.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
  });

  const toggleSort = () => {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };

  const handleTransactionStatusChange = (transactionId, newStatus) => {
    const updatedTransactions = transactions.map(transaction =>
      transaction.id === transactionId ? { ...transaction, status: newStatus } : transaction
    );
    setTransactions(updatedTransactions);
    toast.success(`Transaction ${transactionId} status updated to ${newStatus}`);
  };

  const generateReport = (user, period) => {
    const doc = new jsPDF();
    doc.setFontSize(12);
    doc.text(`M-Pesa Transaction Report for ${user} (${period} period)`, 20, 20);

    const filteredData = sortedTransactions.filter(
      (transaction) => (user === 'All Users' || transaction.user === user) &&
        (period === 'Daily' || period === 'Weekly' || period === 'Monthly')
    );

    filteredData.forEach((transaction, index) => {
      doc.text(`Transaction ID: ${transaction.transactionId} | Amount: ${transaction.amount} | Status: ${transaction.status} | Date: ${transaction.date}`, 20, 30 + (index * 10));
    });

    doc.save(`${user}_Mpesa_Transaction_Report_${period}.pdf`);
    toast.success(`Report for ${user} generated successfully`);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-semibold mb-6 flex items-center">
        <GrTransaction className="mr-2 text-blue-500" /> M-Pesa Transaction Log
      </h1>

      <div className="mb-4 flex flex-wrap items-center">
        <input
          type="text"
          className="p-2 border rounded-lg w-full md:w-1/2 mr-2 mb-2 md:mb-0"
          placeholder="Search transactions by ID or User..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="p-2 border rounded-lg mb-2 md:mb-0 md:mr-2"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All</option>
          <option value="success">Success</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
        <button
          className="py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-700 transition flex items-center mb-2 md:mb-0"
          onClick={toggleSort}
        >
          {sortDirection === 'asc' ? <FaSortAmountUp className="mr-1" /> : <FaSortAmountDown className="mr-1" />}
          Sort
        </button>
        <div className="flex ml-auto">
          <select
            className="p-2 border rounded-lg mb-2 md:mb-0 md:mr-2"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="Daily">Daily</option>
            <option value="Weekly">Weekly</option>
            <option value="Monthly">Monthly</option>
          </select>
          <button
            className="py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-700 transition flex items-center mb-2 md:mb-0"
            onClick={() => generateReport('All Users', timeRange)}
          >
            <FaDownload className="mr-1" /> Generate Report
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center">Loading transactions...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div className="bg-white rounded-lg shadow-md">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-6 text-left">Transaction ID</th>
                <th className="py-3 px-6 text-left">User</th>
                <th className="py-3 px-6 text-left">Amount</th>
                <th className="py-3 px-6 text-left">Status</th>
                <th className="py-3 px-6 text-left">Date</th>
                <th className="py-3 px-6 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedTransactions.map(transaction => (
                <tr key={transaction.id} className="border-b hover:bg-gray-50">
                  <td className="py-4 px-6">{transaction.transactionId}</td>
                  <td className="py-4 px-6">{transaction.user}</td>
                  <td className="py-4 px-6">{transaction.amount}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-block py-1 px-3 rounded-full text-sm ${transaction.status === 'Success' ? 'bg-green-100 text-green-600' :
                        transaction.status === 'Pending' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-red-100 text-red-600'
                      }`}>
                      {transaction.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">{transaction.date}</td>
                  <td className="py-4 px-6">
                    {transaction.status === 'Pending' && (
                      <>
                        <button
                          onClick={() => handleTransactionStatusChange(transaction.id, 'Success')}
                          className="bg-green-500 text-white py-1 px-4 rounded-lg hover:bg-green-600 transition mr-2"
                        >
                          <AiOutlineCheckCircle className="inline-block mr-2" />
                          Mark as Successful
                        </button>
                        <button
                          onClick={() => handleTransactionStatusChange(transaction.id, 'Failed')}
                          className="bg-red-500 text-white py-1 px-4 rounded-lg hover:bg-red-600 transition"
                        >
                          <AiOutlineCloseCircle className="inline-block mr-2" />
                          Mark as Failed
                        </button>
                      </>
                    )}
                    {transaction.status === 'Success' && (
                      <button
                        className="bg-green-300 text-white py-1 px-4 rounded-lg cursor-not-allowed opacity-50"
                        disabled
                      >
                        <AiOutlineCheckCircle className="inline-block mr-2" />
                        Already Successful
                      </button>
                    )}
                    {transaction.status === 'Failed' && (
                      <button
                        className="bg-red-300 text-white py-1 px-4 rounded-lg cursor-not-allowed opacity-50"
                        disabled
                      >
                        <AiOutlineCloseCircle className="inline-block mr-2" />
                        Already Failed
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredTransactions.length === 0 && !loading && !error && (
        <p className="text-center mt-4 text-gray-500">No transactions found.</p>
      )}
      <ToastContainer />
    </div>
  );
};

export default MpesaLog;