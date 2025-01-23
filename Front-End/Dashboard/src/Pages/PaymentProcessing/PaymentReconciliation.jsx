

import React, { useState, useEffect } from 'react';
import { FaSearch, FaFileDownload, FaTimes, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CSVLink } from 'react-csv';

const PaymentReconciliation = () => {
  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortColumn, setSortColumn] = useState('date');
  const [sortDirection, setSortDirection] = useState('asc');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mockTransactions = [
    { id: 1, date: '2023-10-01', amount: '1000.00', status: 'Matched', type: 'Payment', reference: 'MPESA123' },
    { id: 2, date: '2023-10-02', amount: '500.00', status: 'Pending', type: 'Payment', reference: 'MPESA456' },
    { id: 3, date: '2023-10-03', amount: '1500.00', status: 'Discrepancy', type: 'Payment', reference: 'MPESA789' },
  ];

  useEffect(() => {
    setLoading(true);
    setError(null);
    setTimeout(() => {
      try {
        setTransactions(mockTransactions);
      } catch (err) {
        setError('Failed to fetch transactions');
      } finally {
        setLoading(false);
      }
    }, 1000);
  }, []);

  const filteredTransactions = transactions.filter(transaction =>
    transaction.reference.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (!startDate || new Date(transaction.date) >= new Date(startDate)) &&
    (!endDate || new Date(transaction.date) <= new Date(endDate)) &&
    (statusFilter === 'all' || transaction.status.toLowerCase() === statusFilter)
  ).sort((a, b) => {
    if (a[sortColumn] < b[sortColumn]) return sortDirection === 'asc' ? -1 : 1;
    if (a[sortColumn] > b[sortColumn]) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const totalAmount = filteredTransactions.reduce((sum, transaction) => sum + parseFloat(transaction.amount), 0);

  const downloadCSV = () => {
    if (filteredTransactions.length === 0) {
      toast.error('No data to download.');
      return;
    }
    toast.success('Report download initiated!');
  };

  const handleSort = (column) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const statusIcons = {
    'Matched': <FaCheck className="text-green-500 inline-block mr-1" />,
    'Pending': <FaExclamationTriangle className="text-yellow-500 inline-block mr-1" />,
    'Discrepancy': <FaTimes className="text-red-500 inline-block mr-1" />
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-indigo-800 mb-6">Payment Reconciliation</h1>

      <div className="mb-4 flex flex-wrap items-center space-y-4 md:space-y-0 md:space-x-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by reference..."
          className="p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring focus:border-indigo-300 w-full md:w-1/4"
        />
        <div className="flex items-center space-x-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="p-2 border rounded-lg focus:outline-none focus:ring focus:border-indigo-300"
          />
          <span className="text-gray-600">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="p-2 border rounded-lg focus:outline-none focus:ring focus:border-indigo-300"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="p-2 border rounded-lg focus:outline-none focus:ring focus:border-indigo-300"
        >
          <option value="all">All Statuses</option>
          <option value="matched">Matched</option>
          <option value="pending">Pending</option>
          <option value="discrepancy">Discrepancy</option>
        </select>
        <CSVLink
          data={filteredTransactions}
          filename={"reconciliation_report.csv"}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
          onClick={downloadCSV}
        >
          <FaFileDownload className="inline-block mr-2" /> Download Report
        </CSVLink>
      </div>

      {loading ? (
        <div className="text-center text-gray-500">Loading transactions...</div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : (
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-sm font-medium text-gray-600 cursor-pointer" onClick={() => handleSort('id')}>
                  ID {sortColumn === 'id' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th className="py-3 px-4 text-sm font-medium text-gray-600 cursor-pointer" onClick={() => handleSort('date')}>
                  Date {sortColumn === 'date' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th className="py-3 px-4 text-sm font-medium text-gray-600 cursor-pointer" onClick={() => handleSort('amount')}>
                  Amount {sortColumn === 'amount' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th className="py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                <th className="py-3 px-4 text-sm font-medium text-gray-600">Type</th>
                <th className="py-3 px-4 text-sm font-medium text-gray-600">Reference</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map(transaction => (
                <tr key={transaction.id} className="border-t">
                  <td className="py-3 px-4">{transaction.id}</td>
                  <td className="py-3 px-4">{transaction.date}</td>
                  <td className="py-3 px-4">KES {transaction.amount}</td>
                  <td className="py-3 px-4">
                    {statusIcons[transaction.status] || ''}
                    <span className={`inline-block px-2 text-xs leading-5 font-semibold rounded-full 
                      ${transaction.status === 'Matched' ? 'bg-green-100 text-green-800' :
                        transaction.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'}`}
                    >
                      {transaction.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">{transaction.type}</td>
                  <td className="py-3 px-4">{transaction.reference}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredTransactions.length === 0 &&
            <div className="p-4 text-center text-gray-500">No transactions found.</div>
          }
        </div>
      )}

      <div className="mt-4 text-right font-bold text-indigo-800">
        Total Earnings: KES {totalAmount.toFixed(2)}
      </div>

      <ToastContainer />
    </div>
  );
};

export default PaymentReconciliation;



