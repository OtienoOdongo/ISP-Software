import React, { useState, useEffect } from 'react';
import { FaSearch, FaFileDownload } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PaymentReconciliation = () => {
  // State for managing reconciliation data, search, and date range
  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Mock data for reconciliation. In a real app, this would be fetched from an API.
  const mockTransactions = [
    { id: 1, date: '2023-10-01', amount: '1000', status: 'Matched', type: 'Payment', reference: 'MPESA123' },
    { id: 2, date: '2023-10-02', amount: '500', status: 'Unmatched', type: 'Refund', reference: 'MPESA456' },
    { id: 3, date: '2023-10-03', amount: '1500', status: 'Discrepancy', type: 'Payment', reference: 'MPESA789' },
  ];

  // Effect for fetching transactions. Here we're using mock data for demonstration.
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

  // Filter transactions based on search term and date range
  const filteredTransactions = transactions.filter(transaction =>
    transaction.reference.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (!startDate || new Date(transaction.date) >= new Date(startDate)) &&
    (!endDate || new Date(transaction.date) <= new Date(endDate))
  );

  // Function to download reconciliation report as CSV
  const downloadCSV = () => {
    if (filteredTransactions.length === 0) {
      toast.error('No data to download.');
      return;
    }

    const csvContent = [
      ["ID", "Date", "Amount", "Status", "Type", "Reference"],
      ...filteredTransactions.map(transaction => [
        transaction.id,
        transaction.date,
        transaction.amount,
        transaction.status,
        transaction.type,
        transaction.reference
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "reconciliation_report.csv");
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    toast.success('Report downloaded successfully!');
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-indigo-800 mb-6">Payment Reconciliation</h1>

      <div className="mb-4 flex flex-wrap items-center">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by reference..."
          className="p-2 rounded-l-lg border-t border-b border-l border-gray-300 focus:outline-none focus:ring focus:border-indigo-300 w-full md:w-1/3 mr-4 mb-2 md:mb-0"
        />
        <div className="flex items-center">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="p-2 border rounded-lg mr-2 focus:outline-none focus:ring focus:border-indigo-300"
          />
          <span className="mr-2">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="p-2 border rounded-lg focus:outline-none focus:ring focus:border-indigo-300"
          />
        </div>
        <button
          onClick={downloadCSV}
          className="ml-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
        >
          <FaFileDownload className="inline-block mr-2" /> Download Report
        </button>
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
                <th className="py-3 px-4 text-sm font-medium text-gray-600">ID</th>
                <th className="py-3 px-4 text-sm font-medium text-gray-600">Date</th>
                <th className="py-3 px-4 text-sm font-medium text-gray-600">Amount</th>
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
                  <td className="py-3 px-4">{transaction.amount}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${transaction.status === 'Matched' ? 'bg-green-100 text-green-800' :
                        transaction.status === 'Unmatched' ? 'bg-yellow-100 text-yellow-800' :
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
      <ToastContainer />
    </div>
  );
};

export default PaymentReconciliation;