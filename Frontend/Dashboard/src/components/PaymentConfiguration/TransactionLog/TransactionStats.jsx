import React from 'react';
import { motion } from 'framer-motion';
import { 
  FiTrendingUp, 
  FiDollarSign, 
  FiCreditCard, 
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiRefreshCw
} from 'react-icons/fi';
import { FaWifi, FaNetworkWired } from 'react-icons/fa';

const TransactionStats = ({ stats, advancedStats, theme }) => {
  const themeClasses = {
    card: theme === 'dark' 
      ? 'bg-gray-800 border-gray-700' 
      : 'bg-white border-gray-200',
    text: {
      primary: theme === 'dark' ? 'text-white' : 'text-gray-900',
      secondary: theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
    }
  };

  const formatCurrency = (amount) => {
    return `KES ${(parseFloat(amount) || 0).toLocaleString()}`;
  };

  const mainStats = [
    {
      label: 'Total Transactions',
      value: stats.total,
      icon: FiCreditCard,
      color: 'blue',
      border: 'border-l-blue-500'
    },
    {
      label: 'Success',
      value: stats.success,
      icon: FiCheckCircle,
      color: 'green',
      border: 'border-l-green-500'
    },
    {
      label: 'Pending',
      value: stats.pending,
      icon: FiClock,
      color: 'yellow',
      border: 'border-l-yellow-500'
    },
    {
      label: 'Failed',
      value: stats.failed,
      icon: FiXCircle,
      color: 'red',
      border: 'border-l-red-500'
    },
    {
      label: 'Total Amount',
      value: formatCurrency(stats.totalAmount),
      icon: FiDollarSign,
      color: 'indigo',
      border: 'border-l-indigo-500'
    },
    {
      label: 'Success Rate',
      value: stats.total > 0 ? `${((stats.success / stats.total) * 100).toFixed(1)}%` : '0%',
      icon: FiTrendingUp,
      color: 'purple',
      border: 'border-l-purple-500'
    }
  ];

  const accessTypeStats = [
    {
      type: 'hotspot',
      label: 'Hotspot',
      icon: FaWifi,
      color: 'blue',
      count: stats.byAccessType?.hotspot?.count || 0,
      amount: stats.byAccessType?.hotspot?.total_amount || 0,
      success: stats.byAccessType?.hotspot?.success_count || 0
    },
    {
      type: 'pppoe',
      label: 'PPPoE',
      icon: FaNetworkWired,
      color: 'green',
      count: stats.byAccessType?.pppoe?.count || 0,
      amount: stats.byAccessType?.pppoe?.total_amount || 0,
      success: stats.byAccessType?.pppoe?.success_count || 0
    },
    {
      type: 'both',
      label: 'Both',
      icon: FiRefreshCw,
      color: 'purple',
      count: stats.byAccessType?.both?.count || 0,
      amount: stats.byAccessType?.both?.total_amount || 0,
      success: stats.byAccessType?.both?.success_count || 0
    }
  ];

  const getColorClass = (color, type = 'text') => {
    const colors = {
      blue: type === 'text' ? 'text-blue-600' : 'bg-blue-100 text-blue-600',
      green: type === 'text' ? 'text-green-600' : 'bg-green-100 text-green-600',
      yellow: type === 'text' ? 'text-yellow-600' : 'bg-yellow-100 text-yellow-600',
      red: type === 'text' ? 'text-red-600' : 'bg-red-100 text-red-600',
      indigo: type === 'text' ? 'text-indigo-600' : 'bg-indigo-100 text-indigo-600',
      purple: type === 'text' ? 'text-purple-600' : 'bg-purple-100 text-purple-600'
    };
    
    const darkColors = {
      blue: type === 'text' ? 'text-blue-400' : 'bg-blue-900/30 text-blue-400',
      green: type === 'text' ? 'text-green-400' : 'bg-green-900/30 text-green-400',
      yellow: type === 'text' ? 'text-yellow-400' : 'bg-yellow-900/30 text-yellow-400',
      red: type === 'text' ? 'text-red-400' : 'bg-red-900/30 text-red-400',
      indigo: type === 'text' ? 'text-indigo-400' : 'bg-indigo-900/30 text-indigo-400',
      purple: type === 'text' ? 'text-purple-400' : 'bg-purple-900/30 text-purple-400'
    };
    
    return theme === 'dark' ? darkColors[color] : colors[color];
  };

  return (
    <div className="space-y-6">
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {mainStats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-6 rounded-xl shadow-lg border-l-4 ${themeClasses.card} ${stat.border}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${getColorClass(stat.color, 'bg')}`}>
                  <IconComponent className="w-5 h-5" />
                </div>
                <span className={`text-sm font-medium ${getColorClass(stat.color)}`}>
                  {stat.label}
                </span>
              </div>
              <h3 className={`text-2xl font-bold ${themeClasses.text.primary}`}>
                {stat.value}
              </h3>
            </motion.div>
          );
        })}
      </div>

      {/* Access Type Breakdown */}
      <div className={`p-6 rounded-xl shadow-lg ${themeClasses.card}`}>
        <h3 className={`text-lg font-semibold mb-4 ${themeClasses.text.primary}`}>
          Access Type Breakdown
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {accessTypeStats.map((stat, index) => {
            const IconComponent = stat.icon;
            const successRate = stat.count > 0 ? (stat.success / stat.count) * 100 : 0;
            
            return (
              <motion.div
                key={stat.type}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border ${themeClasses.card}`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${getColorClass(stat.color, 'bg')}`}>
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <span className={`font-medium ${themeClasses.text.primary}`}>
                    {stat.label}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className={themeClasses.text.secondary}>Transactions:</span>
                    <span className={themeClasses.text.primary}>{stat.count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={themeClasses.text.secondary}>Amount:</span>
                    <span className={themeClasses.text.primary}>
                      {formatCurrency(stat.amount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={themeClasses.text.secondary}>Success Rate:</span>
                    <span className={`font-medium ${successRate >= 80 ? 'text-green-500' : successRate >= 60 ? 'text-yellow-500' : 'text-red-500'}`}>
                      {successRate.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TransactionStats;