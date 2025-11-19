import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCalendar, FiUser, FiDollarSign, FiCreditCard, FiWifi } from 'react-icons/fi';
import { FaNetworkWired } from 'react-icons/fa';

const TransactionDetailModal = ({ transaction, isOpen, onClose, theme }) => {
  const themeClasses = {
    bg: theme === 'dark' ? 'bg-black/50' : 'bg-black/30',
    modal: theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
    text: {
      primary: theme === 'dark' ? 'text-white' : 'text-gray-800',
      secondary: theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
    }
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

  const formatCurrency = (amount) => {
    return `KES ${(parseFloat(amount) || 0).toLocaleString()}`;
  };

  const getAccessTypeIcon = (accessType) => {
    switch (accessType) {
      case 'hotspot':
        return <FiWifi className="w-5 h-5 text-blue-500" />;
      case 'pppoe':
        return <FaNetworkWired className="w-5 h-5 text-green-500" />;
      default:
        return <FiCreditCard className="w-5 h-5 text-purple-500" />;
    }
  };

  if (!transaction) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${themeClasses.bg}`}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`w-full max-w-4xl rounded-xl shadow-lg border p-6 ${themeClasses.modal}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className={`text-xl font-bold ${themeClasses.text.primary}`}>
                  Transaction Details
                </h2>
                <p className={`mt-1 ${themeClasses.text.secondary}`}>
                  Complete information for {transaction.transactionId}
                </p>
              </div>
              <button
                onClick={onClose}
                className={`p-2 rounded-lg ${
                  theme === 'dark' ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                }`}
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className={`font-semibold flex items-center gap-2 ${themeClasses.text.primary}`}>
                  <FiUser className="w-4 h-4" />
                  Basic Information
                </h3>
                
                <DetailRow label="Transaction ID" value={transaction.transactionId} theme={theme} />
                <DetailRow label="User" value={transaction.userName} theme={theme} />
                <DetailRow label="Phone" value={transaction.phone} theme={theme} />
                <DetailRow 
                  label="Access Type" 
                  value={
                    <div className="flex items-center gap-2">
                      {getAccessTypeIcon(transaction.accessType)}
                      <span>{transaction.accessTypeDisplay || transaction.accessType}</span>
                    </div>
                  } 
                  theme={theme} 
                />
                <DetailRow label="Amount" value={formatCurrency(transaction.amount)} theme={theme} />
                <DetailRow 
                  label="Status" 
                  value={
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBgColor(transaction.status)} ${getStatusColor(transaction.status)}`}>
                      {transaction.status?.charAt(0).toUpperCase() + transaction.status?.slice(1)}
                    </span>
                  } 
                  theme={theme} 
                />
              </div>

              {/* Payment Details */}
              <div className="space-y-4">
                <h3 className={`font-semibold flex items-center gap-2 ${themeClasses.text.primary}`}>
                  <FiCreditCard className="w-4 h-4" />
                  Payment Details
                </h3>
                
                <DetailRow label="Payment Method" value={transaction.paymentMethod?.replace('_', ' ').toUpperCase()} theme={theme} />
                <DetailRow label="Reference Number" value={transaction.referenceNumber} theme={theme} />
                <DetailRow label="Plan" value={transaction.planName} theme={theme} />
                <DetailRow 
                  label="Date & Time" 
                  value={new Date(transaction.date || transaction.created_at).toLocaleString()} 
                  theme={theme} 
                />
                {transaction.description && (
                  <DetailRow label="Description" value={transaction.description} theme={theme} />
                )}
              </div>
            </div>

            {/* Metadata */}
            {transaction.metadata && Object.keys(transaction.metadata).length > 0 && (
              <div className="mt-6">
                <h3 className={`font-semibold mb-3 ${themeClasses.text.primary}`}>
                  Additional Information
                </h3>
                <div className={`p-4 rounded-lg border ${
                  theme === 'dark' ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'
                }`}>
                  <pre className={`text-sm whitespace-pre-wrap ${themeClasses.text.secondary}`}>
                    {JSON.stringify(transaction.metadata, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const DetailRow = ({ label, value, theme }) => (
  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
    <span className={`font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
      {label}:
    </span>
    <span className={`text-right ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
      {value || 'N/A'}
    </span>
  </div>
);

export default TransactionDetailModal;