import React, { useMemo, useState } from 'react';
import { FaSort, FaSortUp, FaSortDown, FaMoneyBillWave, FaReceipt } from 'react-icons/fa';
import { format, parseISO } from 'date-fns';
import { AccessTypeBadge } from '../../ServiceManagement/Shared/components'

const TransactionTable = ({ reconciliationData, viewMode, theme, cardClass, textSecondaryClass, inputClass }) => {
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');

  const { revenue } = reconciliationData;

  const sortedTransactions = useMemo(() => {
    if (!revenue.transactions) return [];
    
    return [...revenue.transactions].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortField) {
        case 'date':
          aValue = new Date(a.date);
          bValue = new Date(b.date);
          break;
        case 'amount':
          aValue = parseFloat(a.amount);
          bValue = parseFloat(b.amount);
          break;
        case 'access_type':
          aValue = a.access_type;
          bValue = b.access_type;
          break;
        case 'user':
          aValue = a.user_name.toLowerCase();
          bValue = b.user_name.toLowerCase();
          break;
        default:
          aValue = a[sortField];
          bValue = b[sortField];
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [revenue.transactions, sortField, sortDirection]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) {
      return <FaSort className="w-3 h-3 text-gray-400" />;
    }
    return sortDirection === 'asc' ? 
      <FaSortUp className="w-3 h-3 text-indigo-500" /> : 
      <FaSortDown className="w-3 h-3 text-indigo-500" />;
  };

  const formatCurrency = (amount) => {
    return `KES ${parseFloat(amount).toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;
  };

  const StatCard = ({ title, value, color, icon: Icon }) => (
    <div className={`p-4 rounded-lg border-l-4 ${color.border} ${color.bg}`}>
      <div className="flex items-center justify-between mb-2">
        <Icon className={`text-xl ${color.icon}`} />
        <span className={`text-xs px-2 py-1 rounded-full ${color.badge}`}>
          {title}
        </span>
      </div>
      <h3 className={`text-sm ${textSecondaryClass} mb-1`}>{title}</h3>
      <p className={`text-2xl font-bold ${color.text}`}>{value}</p>
    </div>
  );

  if (viewMode === 'expenses') {
    return (
      <div className={`${cardClass} p-6 transition-colors duration-300`}>
        <div className="text-center py-8">
          <FaReceipt className={`w-12 h-12 mx-auto mb-4 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`} />
          <h3 className={`text-lg font-semibold mb-2 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
            Viewing Expenses Only
          </h3>
          <p className={textSecondaryClass}>
            Switch to "All Data" or "Revenue Only" to view transactions
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(revenue.summary?.total_amount || 0)}
          color={{
            border: theme === "dark" ? "border-green-500" : "border-green-500",
            bg: theme === "dark" ? "bg-green-900/20" : "bg-green-50",
            icon: theme === "dark" ? "text-green-400" : "text-green-600",
            badge: theme === "dark" ? "bg-green-900 text-green-300" : "bg-green-100 text-green-800",
            text: theme === "dark" ? "text-green-400" : "text-green-600"
          }}
          icon={FaMoneyBillWave}
        />
        
        <StatCard
          title="Transaction Count"
          value={revenue.transactions?.length || 0}
          color={{
            border: theme === "dark" ? "border-blue-500" : "border-blue-500",
            bg: theme === "dark" ? "bg-blue-900/20" : "bg-blue-50",
            icon: theme === "dark" ? "text-blue-400" : "text-blue-600",
            badge: theme === "dark" ? "bg-blue-900 text-blue-300" : "bg-blue-100 text-blue-800",
            text: theme === "dark" ? "text-blue-400" : "text-blue-600"
          }}
          icon={FaReceipt}
        />
        
        <StatCard
          title="Average Value"
          value={formatCurrency(revenue.transactions?.length ? 
            (revenue.summary?.total_amount / revenue.transactions.length) : 0
          )}
          color={{
            border: theme === "dark" ? "border-purple-500" : "border-purple-500",
            bg: theme === "dark" ? "bg-purple-900/20" : "bg-purple-50",
            icon: theme === "dark" ? "text-purple-400" : "text-purple-600",
            badge: theme === "dark" ? "bg-purple-900 text-purple-300" : "bg-purple-100 text-purple-800",
            text: theme === "dark" ? "text-purple-400" : "text-purple-600"
          }}
          icon={FaMoneyBillWave}
        />
        
        <StatCard
          title="Net Revenue"
          value={formatCurrency(revenue.summary?.net_amount || 0)}
          color={{
            border: theme === "dark" ? "border-indigo-500" : "border-indigo-500",
            bg: theme === "dark" ? "bg-indigo-900/20" : "bg-indigo-50",
            icon: theme === "dark" ? "text-indigo-400" : "text-indigo-600",
            badge: theme === "dark" ? "bg-indigo-900 text-indigo-300" : "bg-indigo-100 text-indigo-800",
            text: theme === "dark" ? "text-indigo-400" : "text-indigo-600"
          }}
          icon={FaMoneyBillWave}
        />
      </div>

      {/* Transactions Table */}
      <div className={`${cardClass} rounded-xl overflow-hidden transition-all duration-300`}>
        <div className={`px-6 py-4 ${theme === "dark" ? "border-b border-gray-700 bg-gray-800/60" : "border-b border-gray-200 bg-white/80"} flex justify-between items-center`}>
          <h2 className={`text-lg font-medium ${theme === "dark" ? "text-white" : "text-gray-900"} flex items-center`}>
            <FaMoneyBillWave className={`mr-2 ${theme === "dark" ? "text-green-400" : "text-green-600"}`} /> 
            Revenue Transactions
          </h2>
          <span className={`text-sm ${textSecondaryClass}`}>
            {revenue.transactions?.length || 0} records
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className={`min-w-full divide-y ${theme === "dark" ? "divide-gray-700" : "divide-gray-200"}`}>
            <thead className={theme === "dark" ? "bg-gray-800/60" : "bg-gray-50/80"}>
              <tr>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('transaction_id')}
                >
                  <div className="flex items-center space-x-1">
                    <span className={textSecondaryClass}>Transaction ID</span>
                    {getSortIcon('transaction_id')}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('user')}
                >
                  <div className="flex items-center space-x-1">
                    <span className={textSecondaryClass}>User</span>
                    {getSortIcon('user')}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('source')}
                >
                  <div className="flex items-center space-x-1">
                    <span className={textSecondaryClass}>Source</span>
                    {getSortIcon('source')}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('access_type')}
                >
                  <div className="flex items-center space-x-1">
                    <span className={textSecondaryClass}>Access Type</span>
                    {getSortIcon('access_type')}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('amount')}
                >
                  <div className="flex items-center space-x-1">
                    <span className={textSecondaryClass}>Amount</span>
                    {getSortIcon('amount')}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center space-x-1">
                    <span className={textSecondaryClass}>Date</span>
                    {getSortIcon('date')}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className={theme === "dark" ? "bg-gray-800/60 divide-gray-700" : "bg-white divide-gray-200"}>
              {sortedTransactions.length > 0 ? (
                sortedTransactions.map((transaction) => (
                  <tr 
                    key={transaction.transaction_id} 
                    className={`transition-colors duration-300 ${
                      theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-50"
                    }`}
                  >
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-mono ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}>
                      {transaction.transaction_id}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}>
                      {transaction.user_name}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}>
                      {transaction.source}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <AccessTypeBadge 
                        accessType={transaction.access_type} 
                        theme={theme}
                        size="sm"
                      />
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                      theme === "dark" ? "text-green-400" : "text-green-600"
                    }`}>
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${textSecondaryClass}`}>
                      {format(parseISO(transaction.date), 'dd/MM/yyyy HH:mm')}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className={`px-6 py-4 text-center text-sm ${textSecondaryClass}`}>
                    No revenue transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Access Type Breakdown */}
      <div className={`${cardClass} p-6 transition-colors duration-300`}>
        <h3 className={`text-lg font-semibold mb-4 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
          Revenue by Access Type
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {['hotspot', 'pppoe', 'both'].map((accessType) => {
            const transactions = revenue.transactions?.filter(t => t.access_type === accessType) || [];
            const total = transactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
            const percentage = revenue.summary?.total_amount ? 
              (total / revenue.summary.total_amount) * 100 : 0;
            
            return (
              <div 
                key={accessType}
                className={`p-4 rounded-lg border ${
                  theme === "dark" 
                    ? "bg-gray-700/30 border-gray-600" 
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <AccessTypeBadge accessType={accessType} theme={theme} />
                  <span className={`text-sm font-semibold ${
                    theme === "dark" ? "text-green-400" : "text-green-600"
                  }`}>
                    {percentage.toFixed(1)}%
                  </span>
                </div>
                <p className={`text-2xl font-bold mb-1 ${
                  theme === "dark" ? "text-white" : "text-gray-800"
                }`}>
                  {formatCurrency(total)}
                </p>
                <p className={`text-sm ${textSecondaryClass}`}>
                  {transactions.length} transactions
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TransactionTable;