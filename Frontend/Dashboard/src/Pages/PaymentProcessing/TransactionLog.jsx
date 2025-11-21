








import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Toaster } from 'react-hot-toast';
import { 
  FaSearch, FaDownload, FaSortAmountDown, FaSortAmountUp, 
  FaCalendarAlt, FaFilter, FaChartBar, FaHistory,
  FaWifi, FaNetworkWired
} from 'react-icons/fa';
import { GrTransaction } from 'react-icons/gr';
import { AiOutlineReload } from 'react-icons/ai';
import { FiEye, FiChevronDown, FiChevronUp, FiTrendingUp } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api';
import { useTheme } from '../../context/ThemeContext';
import { EnhancedSelect } from '../../components/ServiceManagement/Shared/components';

import TransactionAnalytics from '../../components/PaymentConfiguration/TransactionLog/TransactionAnalytics.jsx'
import HotspotTransactions from '../../components/PaymentConfiguration/TransactionLog/HotspotTransactions.jsx'
import PPPoETransactions from '../../components/PaymentConfiguration/TransactionLog/PPPoETransactions.jsx'
import TransactionFilters from '../../components/PaymentConfiguration/TransactionLog/TransactionFilters.jsx';
import TransactionStats from '../../components/PaymentConfiguration/TransactionLog/TransactionStats.jsx';
import TransactionDetailModal from '../../components/PaymentConfiguration/TransactionLog/TransactionDetailModal.jsx';

const TransactionLog = () => {
  const { theme } = useTheme();
  const [activeView, setActiveView] = useState('overview'); // overview, hotspot, pppoe, analytics
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [advancedStats, setAdvancedStats] = useState(null);
  const [refreshCount, setRefreshCount] = useState(0);

  // Filter states
  const [filters, setFilters] = useState({
    searchTerm: '',
    status: 'all',
    paymentMethod: 'all',
    accessType: 'all',
    startDate: new Date(new Date().setDate(new Date().getDate() - 7)),
    endDate: new Date(),
    sortBy: 'date_desc',
    page: 1,
    pageSize: 20
  });

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
    refunded: 0,
    totalAmount: 0,
    byAccessType: {}
  });

  // View options
  const viewOptions = useMemo(() => [
    { value: 'overview', label: 'Overview', icon: GrTransaction },
    { value: 'hotspot', label: 'Hotspot', icon: FaWifi },
    { value: 'pppoe', label: 'PPPoE', icon: FaNetworkWired },
    { value: 'analytics', label: 'Analytics', icon: FaChartBar }
  ], []);

  // Toast notification system
  const showToast = useCallback((message, type = 'success') => {
    const toastOptions = {
      duration: type === 'error' ? 5000 : 3000,
      position: 'top-center',
    };

    if (typeof toast !== 'undefined') {
      if (type === 'success') {
        toast.success(message, toastOptions);
      } else if (type === 'error') {
        toast.error(message, toastOptions);
      } else if (type === 'loading') {
        toast.loading(message, toastOptions);
      } else {
        toast(message, toastOptions);
      }
    }
  }, []);

  // Fetch transactions
  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        start_date: filters.startDate.toISOString().split('T')[0],
        end_date: filters.endDate.toISOString().split('T')[0],
        status: filters.status !== 'all' ? filters.status : undefined,
        payment_method: filters.paymentMethod !== 'all' ? filters.paymentMethod : undefined,
        access_type: filters.accessType !== 'all' ? filters.accessType : undefined,
        search: filters.searchTerm || undefined,
        sort_by: filters.sortBy,
        page: filters.page,
        page_size: filters.pageSize
      };

      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([_, value]) => value !== undefined)
      );

      const response = await api.get('/api/payments/transactions/', { params: cleanParams });

      const transactionsData = response.data.transactions || [];
      setTransactions(transactionsData);
      setFilteredTransactions(transactionsData);
      
      setPagination(response.data.pagination || {
        current_page: 1,
        total_pages: 1,
        total_items: transactionsData.length,
        page_size: filters.pageSize,
        has_next: false,
        has_previous: false
      });
      
      setStats(response.data.stats || {
        total: transactionsData.length,
        success: transactionsData.filter(t => t.status === 'success').length,
        pending: transactionsData.filter(t => t.status === 'pending').length,
        failed: transactionsData.filter(t => t.status === 'failed').length,
        refunded: transactionsData.filter(t => t.status === 'refunded').length,
        totalAmount: transactionsData.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0),
        byAccessType: {}
      });

      if (transactionsData.length === 0) {
        showToast('No transactions found for the selected criteria', 'info');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to load transactions';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      console.error('Fetch transactions error:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, showToast]);

  // Fetch advanced stats
  const fetchAdvancedStats = useCallback(async () => {
    try {
      const response = await api.get('/api/payments/transactions/stats/');
      setAdvancedStats(response.data);
    } catch (err) {
      console.error('Failed to fetch advanced stats:', err);
      showToast('Failed to load advanced statistics', 'error');
    }
  }, [showToast]);

  // Fetch access type comparison
  const fetchAccessTypeComparison = useCallback(async () => {
    try {
      const response = await api.get('/api/payments/transactions/analytics/access-type-comparison/');
      return response.data;
    } catch (err) {
      console.error('Failed to fetch access type comparison:', err);
      showToast('Failed to load access type comparison', 'error');
      return null;
    }
  }, [showToast]);

  // Combined refresh function
  const handleRefresh = useCallback(async () => {
    setRefreshCount(prev => prev + 1);
    showToast('Refreshing data...', 'loading');
    
    await Promise.all([
      fetchTransactions(),
      fetchAdvancedStats()
    ]);
    
    showToast('Data refreshed successfully', 'success');
  }, [fetchTransactions, fetchAdvancedStats, showToast]);

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  }, []);

  // Handle page change
  const handlePageChange = useCallback((newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  }, []);

  // Handle transaction selection
  const handleTransactionSelect = useCallback(async (transaction) => {
    try {
      const response = await api.get(`/api/payments/transactions/${transaction.transactionId}/`);
      setSelectedTransaction(response.data.transaction);
      setShowDetailModal(true);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to load transaction details';
      showToast(errorMessage, 'error');
    }
  }, [showToast]);

  // Load data on component mount and filter changes
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  useEffect(() => {
    if (activeView === 'analytics') {
      fetchAdvancedStats();
    }
  }, [activeView, fetchAdvancedStats]);

  useEffect(() => {
    if (refreshCount > 0) {
      fetchTransactions();
    }
  }, [refreshCount, fetchTransactions]);

  // Theme classes
  const themeClasses = {
    container: theme === 'dark' 
      ? 'bg-gradient-to-br from-gray-900 to-indigo-900 text-white' 
      : 'bg-gray-50 text-gray-800',
    card: theme === 'dark' 
      ? 'bg-gray-800/80 backdrop-blur-md border border-gray-700' 
      : 'bg-white border border-gray-200',
    input: theme === 'dark'
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
      : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500'
  };

  // Render active view
  const renderActiveView = () => {
    switch (activeView) {
      case 'overview':
        return (
          <div className="space-y-6">
            <TransactionStats 
              stats={stats}
              advancedStats={advancedStats}
              theme={theme}
            />
            <TransactionFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              onRefresh={handleRefresh}
              loading={loading}
              theme={theme}
            />
            <TransactionTable
              transactions={transactions}
              loading={loading}
              error={error}
              pagination={pagination}
              onPageChange={handlePageChange}
              onTransactionSelect={handleTransactionSelect}
              theme={theme}
            />
          </div>
        );
      
      case 'hotspot':
        return (
          <HotspotTransactions
            filters={filters}
            onFilterChange={handleFilterChange}
            onRefresh={handleRefresh}
            onTransactionSelect={handleTransactionSelect}
            loading={loading}
            error={error}
            theme={theme}
          />
        );
      
      case 'pppoe':
        return (
          <PPPoETransactions
            filters={filters}
            onFilterChange={handleFilterChange}
            onRefresh={handleRefresh}
            onTransactionSelect={handleTransactionSelect}
            loading={loading}
            error={error}
            theme={theme}
          />
        );
      
      case 'analytics':
        return (
          <TransactionAnalytics
            advancedStats={advancedStats}
            stats={stats}
            onRefresh={handleRefresh}
            loading={loading}
            theme={theme}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen p-6 transition-colors duration-300 ${themeClasses.container}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold flex items-center">
              <GrTransaction className="mr-3 text-blue-500" /> 
              Transaction Log
            </h1>
            <span className={`px-3 py-1 rounded-full text-sm ${
              theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
            }`}>
              {pagination.total_items} transactions
            </span>
          </div>
          
          <div className="flex items-center gap-3">
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
        </div>

        {/* View Navigation */}
        <div className={`mb-6 rounded-xl shadow-lg ${themeClasses.card}`}>
          <div className="flex flex-wrap gap-1 p-2">
            {viewOptions.map((view) => {
              const IconComponent = view.icon;
              return (
                <button
                  key={view.value}
                  onClick={() => setActiveView(view.value)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    activeView === view.value
                      ? 'bg-indigo-600 text-white shadow-lg'
                      : theme === 'dark'
                      ? 'text-gray-300 hover:bg-gray-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  {view.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active View Content */}
        {renderActiveView()}

        {/* Transaction Detail Modal */}
        <TransactionDetailModal
          transaction={selectedTransaction}
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          theme={theme}
        />
      </div>

      {/* React Hot Toast Container */}
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: theme === 'dark' ? '#374151' : '#fff',
            color: theme === 'dark' ? '#fff' : '#000',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10B981',
              secondary: theme === 'dark' ? '#374151' : '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#EF4444',
              secondary: theme === 'dark' ? '#374151' : '#fff',
            },
          },
        }}
      />
    </div>
  );
};

// Transaction Table Component
const TransactionTable = ({ 
  transactions, 
  loading, 
  error, 
  pagination, 
  onPageChange, 
  onTransactionSelect,
  theme 
}) => {
  const themeClasses = {
    tableHeader: theme === 'dark' ? 'bg-gray-700 text-gray-200' : 'bg-gray-50 text-gray-700',
    tableRow: theme === 'dark' ? 'border-gray-700 hover:bg-gray-700/50' : 'border-gray-200 hover:bg-gray-50',
    card: theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
  };

  const getStatusColor = (status) => {
    const baseColors = {
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
    
    return theme === 'dark' ? darkColors[status] : baseColors[status];
  };

  const getStatusBgColor = (status) => {
    const baseColors = {
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
    
    return theme === 'dark' ? darkColors[status] : baseColors[status];
  };

  const getAccessTypeColor = (accessType) => {
    const colors = {
      hotspot: theme === 'dark' ? 'text-blue-400' : 'text-blue-600',
      pppoe: theme === 'dark' ? 'text-green-400' : 'text-green-600',
      both: theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
    };
    return colors[accessType] || (theme === 'dark' ? 'text-gray-400' : 'text-gray-600');
  };

  const formatCurrency = (amount) => {
    return `KES ${(parseFloat(amount) || 0).toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className={`p-8 rounded-xl ${themeClasses.card} text-center`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4">Loading transactions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 rounded-xl ${themeClasses.card} text-center`}>
        <p className="text-red-500 text-lg">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className={`rounded-xl shadow-lg overflow-hidden ${themeClasses.card}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className={themeClasses.tableHeader}>
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                Transaction ID
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                Access Type
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
            {transactions.length === 0 ? (
              <tr>
                <td colSpan="9" className="px-6 py-8 text-center">
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
                <tr key={tx.id || index} className={`transition-colors ${themeClasses.tableRow}`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                    {tx.transactionId || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {tx.userName || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getAccessTypeColor(tx.accessType)}`}>
                      {tx.accessTypeDisplay || tx.accessType || 'N/A'}
                    </span>
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
      {transactions.length > 0 && (
        <div className="flex items-center justify-between mt-4 p-4 border-t border-gray-200 dark:border-gray-700">
          <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Showing {((pagination.current_page - 1) * pagination.page_size) + 1} to{' '}
            {Math.min(pagination.current_page * pagination.page_size, pagination.total_items)} of{' '}
            {pagination.total_items} entries
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => onPageChange(pagination.current_page - 1)}
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
              onClick={() => onPageChange(pagination.current_page + 1)}
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
  );
};

export default TransactionLog;











