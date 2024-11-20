import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { AiOutlineCheckCircle, AiOutlineCloseCircle, AiOutlineReload, AiOutlineDownload } from 'react-icons/ai';
import jsPDF from 'jspdf';
import 'react-toastify/dist/ReactToastify.css';

// Mock data for demonstration
const mockTransactions = [
  { id: 1, amount: 1000, status: 'Successful', date: '2024-11-19 10:30 AM', user: 'Alice Johnson' },
  { id: 2, amount: 2000, status: 'Pending', date: '2024-11-18 04:00 PM', user: 'Bob Smith' },
  { id: 3, amount: 1500, status: 'Failed', date: '2024-11-17 02:15 PM', user: 'Charlie Brown' },
  { id: 4, amount: 500, status: 'Successful', date: '2024-11-16 11:45 AM', user: 'David Clark' },
  { id: 5, amount: 1200, status: 'Successful', date: '2024-11-15 09:30 AM', user: 'Eva Davis' },
];

const TransactionMonitoring = () => {
  const [transactions, setTransactions] = useState(mockTransactions);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTransactions, setFilteredTransactions] = useState(mockTransactions);
  const [timeRange, setTimeRange] = useState('Daily');  // For report generation

  useEffect(() => {
    // Filter transactions based on search query (user's name or transaction ID)
    setFilteredTransactions(
      transactions.filter(transaction =>
        transaction.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.id.toString().includes(searchQuery)
      )
    );
  }, [searchQuery, transactions]);

  const handleTransactionStatusChange = (transactionId, newStatus) => {
    // Find the transaction to update and change its status
    const updatedTransactions = transactions.map(transaction => 
      transaction.id === transactionId ? { ...transaction, status: newStatus } : transaction
    );
    setTransactions(updatedTransactions);
    toast.success(`Transaction ${transactionId} status updated to ${newStatus}`);
  };

  const generateReport = (user, period) => {
    const doc = new jsPDF();
    doc.setFontSize(12);
    doc.text(`Transaction Report for ${user} (${period} period)`, 20, 20);

    const filteredData = transactions.filter(
      (transaction) => (user === 'All Users' || transaction.user === user) && 
                        (period === 'Daily' || period === 'Weekly' || period === 'Monthly')
    );

    filteredData.forEach((transaction, index) => {
      doc.text(`Transaction ID: ${transaction.id} | Amount: $${transaction.amount} | Status: ${transaction.status} | Date: ${transaction.date}`, 20, 30 + (index * 10));
    });

    doc.save(`${user}_Transaction_Report_${period}.pdf`);
    toast.success(`Report for ${user} generated successfully`);
  };

  const downloadUserReport = (user) => {
    const doc = new jsPDF();
    doc.setFontSize(12);
    doc.text(`Transaction Report for ${user}`, 20, 20);

    const userTransactions = transactions.filter(transaction => transaction.user === user);
    userTransactions.forEach((transaction, index) => {
      doc.text(`Transaction ID: ${transaction.id} | Amount: KES ${transaction.amount} | Status: ${transaction.status} | Date: ${transaction.date}`, 20, 30 + (index * 10));
    });

    doc.save(`${user}_Transaction_Report.pdf`);
    toast.success(`Report for ${user} downloaded successfully`);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">Transaction Monitoring</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <input
          type="text"
          className="w-full p-3 border border-gray-300 rounded-lg mb-4"
          placeholder="Search by Transaction ID or User"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-4">
            <button 
              onClick={() => generateReport('All Users', timeRange)}
              className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition"
            >
              Generate Cumulative Report
            </button>
          </div>
          <select
            className="border rounded-lg p-2"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="Daily">Daily</option>
            <option value="Weekly">Weekly</option>
            <option value="Monthly">Monthly</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left table-auto">
            <thead>
              <tr className="border-b">
                <th className="py-2 px-4 text-sm font-medium text-gray-600">Transaction ID</th>
                <th className="py-2 px-4 text-sm font-medium text-gray-600">User</th>
                <th className="py-2 px-4 text-sm font-medium text-gray-600">Amount</th>
                <th className="py-2 px-4 text-sm font-medium text-gray-600">Status</th>
                <th className="py-2 px-4 text-sm font-medium text-gray-600">Date</th>
                <th className="py-2 px-4 text-sm font-medium text-gray-600">Actions</th>
                <th className="py-2 px-4 text-sm font-medium text-gray-600">Download Report</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map(transaction => (
                <tr key={transaction.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4">{transaction.id}</td>
                  <td className="py-2 px-4">{transaction.user}</td>
                  <td className="py-2 px-4">KES {transaction.amount}</td>
                  <td className="py-2 px-4">
                    <span
                      className={`inline-block py-1 px-3 rounded-full text-sm ${
                        transaction.status === 'Successful' ? 'bg-green-100 text-green-600' :
                        transaction.status === 'Pending' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-red-100 text-red-600'
                      }`}
                    >
                      {transaction.status}
                    </span>
                  </td>
                  <td className="py-2 px-4">{transaction.date}</td>
                  <td className="py-2 px-4">
                    {transaction.status === 'Pending' && (
                      <button 
                        onClick={() => handleTransactionStatusChange(transaction.id, 'Successful')}
                        className="bg-green-500 text-white py-1 px-4 rounded-lg hover:bg-green-600 transition mr-2"
                      >
                        <AiOutlineCheckCircle className="inline-block mr-2" />
                        Mark as Successful
                      </button>
                    )}
                    {transaction.status === 'Pending' && (
                      <button 
                        onClick={() => handleTransactionStatusChange(transaction.id, 'Failed')}
                        className="bg-red-500 text-white py-1 px-4 rounded-lg hover:bg-red-600 transition"
                      >
                        <AiOutlineCloseCircle className="inline-block mr-2" />
                        Mark as Failed
                      </button>
                    )}
                    {transaction.status === 'Successful' && (
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
                  <td className="py-2 px-4">
                    <button 
                      onClick={() => downloadUserReport(transaction.user)}
                      className="bg-blue-500 text-white py-1 px-4 rounded-lg hover:bg-blue-600 transition"
                    >
                      <AiOutlineDownload className="inline-block mr-2" />
                      Download Report
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TransactionMonitoring;
