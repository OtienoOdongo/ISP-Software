




// // src/components/Payments/TransactionAnalytics.jsx
// import React, { useState, useEffect, useMemo } from 'react';
// import { 
//   FiTrendingUp, 
//   FiDollarSign, 
//   FiCreditCard, 
//   FiCalendar,
//   FiPieChart,
//   FiBarChart2,
//   FiRefreshCw,
//   FiDownload
// } from 'react-icons/fi';
// import { motion, AnimatePresence } from 'framer-motion';
// import { useTheme } from '../../../context/ThemeContext'
// import { EnhancedSelect } from '../../../components/ServiceManagement/Shared/components'

// const TransactionAnalytics = ({ advancedStats, onRefresh, loading }) => {
//   const { theme } = useTheme();
//   const [activeTab, setActiveTab] = useState('overview');
//   const [timeRange, setTimeRange] = useState('7d');
//   const [comparisonData, setComparisonData] = useState(null);

//   const themeClasses = {
//     bg: {
//       primary: theme === 'dark' ? 'bg-gray-800' : 'bg-white',
//       secondary: theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50',
//       accent: theme === 'dark' ? 'bg-indigo-900/30' : 'bg-indigo-50'
//     },
//     text: {
//       primary: theme === 'dark' ? 'text-white' : 'text-gray-900',
//       secondary: theme === 'dark' ? 'text-gray-300' : 'text-gray-600',
//       accent: theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'
//     },
//     border: {
//       light: theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
//     }
//   };

//   // Time range options
//   const timeRangeOptions = useMemo(() => [
//     { value: '7d', label: 'Last 7 days' },
//     { value: '30d', label: 'Last 30 days' },
//     { value: '90d', label: 'Last 90 days' }
//   ], []);

//   // Calculate dynamic metrics based on comparison data
//   const calculateMetrics = useMemo(() => {
//     if (!advancedStats?.daily || advancedStats.daily.length < 2) {
//       return {
//         totalRevenue: { value: 0, change: 0, trend: 'neutral' },
//         successRate: { value: 0, change: 0, trend: 'neutral' },
//         totalTransactions: { value: 0, change: 0, trend: 'neutral' },
//         avgTransaction: { value: 0, change: 0, trend: 'neutral' }
//       };
//     }

//     const currentPeriod = advancedStats.daily;
//     const previousPeriod = [...currentPeriod].slice(0, -currentPeriod.length / 2); // Simple comparison logic

//     // Calculate current period totals
//     const currentTotalRevenue = currentPeriod.reduce((sum, day) => sum + (parseFloat(day.stats.total_amount) || 0), 0);
//     const currentTotalTransactions = currentPeriod.reduce((sum, day) => sum + (day.stats.total || 0), 0);
//     const currentSuccessTransactions = currentPeriod.reduce((sum, day) => sum + (day.stats.success || 0), 0);
//     const currentAvgTransaction = currentTotalTransactions > 0 ? currentTotalRevenue / currentTotalTransactions : 0;
//     const currentSuccessRate = currentTotalTransactions > 0 ? (currentSuccessTransactions / currentTotalTransactions) * 100 : 0;

//     // Calculate previous period totals (for comparison)
//     const previousTotalRevenue = previousPeriod.reduce((sum, day) => sum + (parseFloat(day.stats.total_amount) || 0), 0);
//     const previousTotalTransactions = previousPeriod.reduce((sum, day) => sum + (day.stats.total || 0), 0);
//     const previousSuccessTransactions = previousPeriod.reduce((sum, day) => sum + (day.stats.success || 0), 0);
//     const previousAvgTransaction = previousTotalTransactions > 0 ? previousTotalRevenue / previousTotalTransactions : 0;
//     const previousSuccessRate = previousTotalTransactions > 0 ? (previousSuccessTransactions / previousTotalTransactions) * 100 : 0;

//     // Calculate percentage changes
//     const revenueChange = previousTotalRevenue > 0 ? ((currentTotalRevenue - previousTotalRevenue) / previousTotalRevenue) * 100 : 0;
//     const transactionChange = previousTotalTransactions > 0 ? ((currentTotalTransactions - previousTotalTransactions) / previousTotalTransactions) * 100 : 0;
//     const successRateChange = previousSuccessRate > 0 ? (currentSuccessRate - previousSuccessRate) : 0;
//     const avgTransactionChange = previousAvgTransaction > 0 ? ((currentAvgTransaction - previousAvgTransaction) / previousAvgTransaction) * 100 : 0;

//     return {
//       totalRevenue: {
//         value: currentTotalRevenue,
//         change: revenueChange,
//         trend: revenueChange >= 0 ? 'up' : 'down'
//       },
//       successRate: {
//         value: currentSuccessRate,
//         change: successRateChange,
//         trend: successRateChange >= 0 ? 'up' : 'down'
//       },
//       totalTransactions: {
//         value: currentTotalTransactions,
//         change: transactionChange,
//         trend: transactionChange >= 0 ? 'up' : 'down'
//       },
//       avgTransaction: {
//         value: currentAvgTransaction,
//         change: avgTransactionChange,
//         trend: avgTransactionChange >= 0 ? 'up' : 'down'
//       }
//     };
//   }, [advancedStats]);

//   // Format currency
//   const formatCurrency = (amount) => {
//     return `KES ${(parseFloat(amount) || 0).toLocaleString()}`;
//   };

//   // Format percentage change
//   const formatChange = (change) => {
//     if (change === 0) return '0%';
//     const sign = change > 0 ? '+' : '';
//     return `${sign}${change.toFixed(1)}%`;
//   };

//   // Get payment method colors
//   const getMethodColor = (method) => {
//     const colors = {
//       mpesa: theme === 'dark' ? 'text-green-400' : 'text-green-600',
//       paypal: theme === 'dark' ? 'text-blue-400' : 'text-blue-600',
//       bank_transfer: theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
//     };
//     return colors[method] || (theme === 'dark' ? 'text-gray-400' : 'text-gray-600');
//   };

//   // Get method background color
//   const getMethodBgColor = (method) => {
//     const colors = {
//       mpesa: theme === 'dark' ? 'bg-green-900/30' : 'bg-green-100',
//       paypal: theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-100',
//       bank_transfer: theme === 'dark' ? 'bg-purple-900/30' : 'bg-purple-100'
//     };
//     return colors[method] || (theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100');
//   };

//   // Calculate daily trend for revenue
//   const calculateDailyTrend = (dailyData) => {
//     if (!dailyData || dailyData.length < 2) return [];
    
//     return dailyData.map((day, index) => {
//       if (index === 0) return { ...day, trend: 'neutral' };
      
//       const prevDay = dailyData[index - 1];
//       const currentAmount = parseFloat(day.stats.total_amount) || 0;
//       const prevAmount = parseFloat(prevDay.stats.total_amount) || 0;
//       const change = prevAmount > 0 ? ((currentAmount - prevAmount) / prevAmount) * 100 : 0;
      
//       return {
//         ...day,
//         trend: change >= 0 ? 'up' : 'down',
//         change: change
//       };
//     });
//   };

//   // Overview Tab Content
//   const OverviewTab = () => {
//     const dailyWithTrend = calculateDailyTrend(advancedStats?.daily?.slice(-7));
    
//     return (
//       <div className="space-y-6">
//         {/* Key Metrics */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//           <MetricCard
//             icon={<FiTrendingUp className="w-6 h-6" />}
//             title="Total Revenue"
//             value={formatCurrency(calculateMetrics.totalRevenue.value)}
//             change={formatChange(calculateMetrics.totalRevenue.change)}
//             trend={calculateMetrics.totalRevenue.trend}
//             theme={theme}
//           />
//           <MetricCard
//             icon={<FiPieChart className="w-6 h-6" />}
//             title="Success Rate"
//             value={`${calculateMetrics.successRate.value.toFixed(1)}%`}
//             change={formatChange(calculateMetrics.successRate.change)}
//             trend={calculateMetrics.successRate.trend}
//             theme={theme}
//           />
//           <MetricCard
//             icon={<FiCreditCard className="w-6 h-6" />}
//             title="Total Transactions"
//             value={calculateMetrics.totalTransactions.value.toLocaleString()}
//             change={formatChange(calculateMetrics.totalTransactions.change)}
//             trend={calculateMetrics.totalTransactions.trend}
//             theme={theme}
//           />
//           <MetricCard
//             icon={<FiDollarSign className="w-6 h-6" />}
//             title="Avg. Transaction"
//             value={formatCurrency(calculateMetrics.avgTransaction.value)}
//             change={formatChange(calculateMetrics.avgTransaction.change)}
//             trend={calculateMetrics.avgTransaction.trend}
//             theme={theme}
//           />
//         </div>

//         {/* Charts Row */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//           {/* Daily Transactions Chart */}
//           <div className={`rounded-xl p-6 ${themeClasses.bg.primary} border ${themeClasses.border.light}`}>
//             <div className="flex justify-between items-center mb-6">
//               <h3 className={`font-semibold ${themeClasses.text.primary}`}>Daily Transactions</h3>
//               <FiBarChart2 className={`w-5 h-5 ${themeClasses.text.accent}`} />
//             </div>
//             <div className="space-y-3">
//               {advancedStats?.daily?.slice(-7).map((day, index) => (
//                 <div key={index} className="flex items-center justify-between">
//                   <span className={`text-sm ${themeClasses.text.secondary}`}>
//                     {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
//                   </span>
//                   <div className="flex items-center gap-3 flex-1 mx-4">
//                     <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
//                       <div 
//                         className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
//                         style={{ 
//                           width: `${(day.stats.total / Math.max(...advancedStats.daily.slice(-7).map(d => d.stats.total || 1))) * 100}%` 
//                         }}
//                       />
//                     </div>
//                   </div>
//                   <span className={`text-sm font-medium ${themeClasses.text.primary}`}>
//                     {day.stats.total || 0}
//                   </span>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Payment Methods Distribution */}
//           <div className={`rounded-xl p-6 ${themeClasses.bg.primary} border ${themeClasses.border.light}`}>
//             <div className="flex justify-between items-center mb-6">
//               <h3 className={`font-semibold ${themeClasses.text.primary}`}>Payment Methods</h3>
//               <FiPieChart className={`w-5 h-5 ${themeClasses.text.accent}`} />
//             </div>
//             <div className="space-y-4">
//               {advancedStats?.by_method?.map((method, index) => (
//                 <div key={index} className="flex items-center justify-between">
//                   <div className="flex items-center gap-3">
//                     <div className={`w-3 h-3 rounded-full ${getMethodBgColor(method.payment_method)} ${getMethodColor(method.payment_method)}`} />
//                     <span className={`text-sm capitalize ${themeClasses.text.primary}`}>
//                       {method.payment_method?.replace('_', ' ') || 'Unknown'}
//                     </span>
//                   </div>
//                   <div className="text-right">
//                     <div className={`font-semibold ${themeClasses.text.primary}`}>
//                       {method.count || 0}
//                     </div>
//                     <div className={`text-xs ${themeClasses.text.secondary}`}>
//                       {formatCurrency(method.total_amount || 0)}
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   // Performance Tab Content
//   const PerformanceTab = () => {
//     const dailyWithTrend = calculateDailyTrend(advancedStats?.daily?.slice(-5));
    
//     return (
//       <div className="space-y-6">
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           {/* Status Distribution */}
//           <div className={`rounded-xl p-6 ${themeClasses.bg.primary} border ${themeClasses.border.light}`}>
//             <h3 className={`font-semibold mb-6 ${themeClasses.text.primary}`}>Transaction Status</h3>
//             <div className="space-y-4">
//               {[
//                 { status: 'success', label: 'Successful', count: advancedStats?.overall?.success || 0, color: 'bg-green-500' },
//                 { status: 'pending', label: 'Pending', count: advancedStats?.overall?.pending || 0, color: 'bg-yellow-500' },
//                 { status: 'failed', label: 'Failed', count: advancedStats?.overall?.failed || 0, color: 'bg-red-500' },
//               ].map((item, index) => (
//                 <div key={index} className="space-y-2">
//                   <div className="flex justify-between text-sm">
//                     <span className={themeClasses.text.secondary}>{item.label}</span>
//                     <span className={themeClasses.text.primary}>{item.count}</span>
//                   </div>
//                   <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
//                     <div 
//                       className={`h-2 rounded-full transition-all duration-500 ${item.color}`}
//                       style={{ 
//                         width: `${(item.count / (advancedStats?.overall?.total || 1)) * 100}%` 
//                       }}
//                     />
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Revenue Trends */}
//           <div className={`rounded-xl p-6 ${themeClasses.bg.primary} border ${themeClasses.border.light}`}>
//             <h3 className={`font-semibold mb-6 ${themeClasses.text.primary}`}>Revenue Trend</h3>
//             <div className="space-y-4">
//               {dailyWithTrend.map((day, index) => (
//                 <div key={index} className="flex items-center justify-between">
//                   <span className={`text-sm ${themeClasses.text.secondary}`}>
//                     {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
//                   </span>
//                   <div className="flex items-center gap-3">
//                     <div className={`text-sm font-semibold ${themeClasses.text.primary}`}>
//                       {formatCurrency(day.stats.total_amount || 0)}
//                     </div>
//                     <div className={`text-xs px-2 py-1 rounded-full ${
//                       day.trend === 'up' 
//                         ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
//                         : day.trend === 'down'
//                         ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
//                         : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
//                     }`}>
//                       {index > 0 ? formatChange(day.change) : '—'}
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   // Metric Card Component
//   const MetricCard = ({ icon, title, value, change, trend, theme }) => (
//     <motion.div
//       whileHover={{ scale: 1.02 }}
//       className={`rounded-xl p-6 border transition-all duration-300 ${
//         theme === 'dark' 
//           ? 'bg-gray-800 border-gray-700 hover:border-indigo-500' 
//           : 'bg-white border-gray-200 hover:border-indigo-300'
//       }`}
//     >
//       <div className="flex items-center justify-between mb-4">
//         <div className={`p-2 rounded-lg ${
//           theme === 'dark' ? 'bg-indigo-900/30 text-indigo-400' : 'bg-indigo-100 text-indigo-600'
//         }`}>
//           {icon}
//         </div>
//         <span className={`text-sm font-medium ${
//           trend === 'up' 
//             ? 'text-green-600 dark:text-green-400' 
//             : trend === 'down'
//             ? 'text-red-600 dark:text-red-400'
//             : 'text-gray-600 dark:text-gray-400'
//         }`}>
//           {change}
//         </span>
//       </div>
//       <h3 className={`text-lg font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
//         {value}
//       </h3>
//       <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
//         {title}
//       </p>
//     </motion.div>
//   );

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       exit={{ opacity: 0, y: -20 }}
//       className={`rounded-xl shadow-lg border ${themeClasses.bg.primary} ${themeClasses.border.light} mb-6`}
//     >
//       {/* Header */}
//       <div className="flex flex-col lg:flex-row lg:items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
//         <div>
//           <h2 className={`text-xl font-bold flex items-center gap-2 ${themeClasses.text.primary}`}>
//             <FiTrendingUp className="text-indigo-500" />
//             Transaction Analytics
//           </h2>
//           <p className={`mt-1 ${themeClasses.text.secondary}`}>
//             Comprehensive insights into your transaction performance
//           </p>
//         </div>
        
//         <div className="flex items-center gap-3 mt-4 lg:mt-0">
//           {/* Time Range Selector - Using EnhancedSelect */}
//           <EnhancedSelect
//             value={timeRange}
//             onChange={setTimeRange}
//             options={timeRangeOptions}
//             placeholder="Select time range"
//             theme={theme}
//             className="w-40"
//           />

//           {/* Refresh Button */}
//           <button
//             onClick={onRefresh}
//             disabled={loading}
//             className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
//               theme === 'dark'
//                 ? 'bg-gray-700 hover:bg-gray-600 text-white disabled:bg-gray-800'
//                 : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 disabled:bg-gray-100'
//             } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
//           >
//             <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
//             Refresh
//           </button>
//         </div>
//       </div>

//       {/* Tabs */}
//       <div className="border-b border-gray-200 dark:border-gray-700">
//         <div className="flex space-x-8 px-6">
//           {[
//             { id: 'overview', label: 'Overview', icon: FiBarChart2 },
//             { id: 'performance', label: 'Performance', icon: FiTrendingUp },
//           ].map((tab) => (
//             <button
//               key={tab.id}
//               onClick={() => setActiveTab(tab.id)}
//               className={`flex items-center gap-2 py-4 border-b-2 transition-all duration-300 ${
//                 activeTab === tab.id
//                   ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
//                   : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
//               }`}
//             >
//               <tab.icon className="w-4 h-4" />
//               {tab.label}
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Tab Content */}
//       <div className="p-6">
//         <AnimatePresence mode="wait">
//           <motion.div
//             key={activeTab}
//             initial={{ opacity: 0, x: 20 }}
//             animate={{ opacity: 1, x: 0 }}
//             exit={{ opacity: 0, x: -20 }}
//             transition={{ duration: 0.2 }}
//           >
//             {activeTab === 'overview' && <OverviewTab />}
//             {activeTab === 'performance' && <PerformanceTab />}
//           </motion.div>
//         </AnimatePresence>
//       </div>
//     </motion.div>
//   );
// };

// export default TransactionAnalytics;








import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiTrendingUp, 
  FiDollarSign, 
  FiCreditCard, 
  FiCalendar,
  FiPieChart,
  FiBarChart2,
  FiRefreshCw,
  FiDownload,
  FiWifi,
  FiServer
} from 'react-icons/fi';
import { FaWifi, FaNetworkWired } from 'react-icons/fa';
import { EnhancedSelect } from '../../ServiceManagement/Shared/components'
import api from '../../../api'

const TransactionAnalytics = ({ advancedStats, stats, onRefresh, loading, theme }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('7d');
  const [accessTypeComparison, setAccessTypeComparison] = useState(null);
  const [chartData, setChartData] = useState(null);

  const themeClasses = {
    bg: {
      primary: theme === 'dark' ? 'bg-gray-800' : 'bg-white',
      secondary: theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50',
      accent: theme === 'dark' ? 'bg-indigo-900/30' : 'bg-indigo-50'
    },
    text: {
      primary: theme === 'dark' ? 'text-white' : 'text-gray-900',
      secondary: theme === 'dark' ? 'text-gray-300' : 'text-gray-600',
      accent: theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'
    },
    border: {
      light: theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
    }
  };

  // Time range options
  const timeRangeOptions = useMemo(() => [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' }
  ], []);

  // Fetch access type comparison data
  const fetchAccessTypeComparison = useCallback(async () => {
    try {
      const response = await api.get('/api/payments/transactions/analytics/access-type-comparison/');
      setAccessTypeComparison(response.data);
    } catch (err) {
      console.error('Failed to fetch access type comparison:', err);
    }
  }, []);

  // Process chart data
  const processChartData = useCallback(() => {
    if (!advancedStats?.daily) return null;

    const dailyData = advancedStats.daily.slice(-7); // Last 7 days
    return {
      labels: dailyData.map(day => new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })),
      datasets: [
        {
          label: 'Hotspot',
          data: dailyData.map(day => {
            const hotspotData = day.access_types?.find(access => access.access_type === 'hotspot');
            return hotspotData?.count || 0;
          }),
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4
        },
        {
          label: 'PPPoE',
          data: dailyData.map(day => {
            const pppoeData = day.access_types?.find(access => access.access_type === 'pppoe');
            return pppoeData?.count || 0;
          }),
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4
        }
      ]
    };
  }, [advancedStats]);

  // Calculate metrics
  const metrics = useMemo(() => {
    if (!advancedStats?.access_types) {
      return {
        totalRevenue: { value: 0, change: 0 },
        successRate: { value: 0, change: 0 },
        avgTransaction: { value: 0, change: 0 },
        totalTransactions: { value: 0, change: 0 }
      };
    }

    const hotspotStats = advancedStats.access_types.find(stat => stat.access_type === 'hotspot') || {};
    const pppoeStats = advancedStats.access_types.find(stat => stat.access_type === 'pppoe') || {};

    return {
      totalRevenue: {
        value: (hotspotStats.total_amount || 0) + (pppoeStats.total_amount || 0),
        change: 12.5 // Mock data - would be calculated from previous period
      },
      successRate: {
        value: advancedStats.overall?.success && advancedStats.overall?.total 
          ? (advancedStats.overall.success / advancedStats.overall.total) * 100 
          : 0,
        change: 2.3
      },
      avgTransaction: {
        value: advancedStats.overall?.total_amount && advancedStats.overall?.total
          ? advancedStats.overall.total_amount / advancedStats.overall.total
          : 0,
        change: -1.2
      },
      totalTransactions: {
        value: advancedStats.overall?.total || 0,
        change: 8.7
      }
    };
  }, [advancedStats]);

  useEffect(() => {
    fetchAccessTypeComparison();
    setChartData(processChartData());
  }, [fetchAccessTypeComparison, processChartData]);

  const formatCurrency = (amount) => {
    return `KES ${(parseFloat(amount) || 0).toLocaleString()}`;
  };

  const formatPercentage = (value) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getTrendColor = (value) => {
    return value >= 0 
      ? (theme === 'dark' ? 'text-green-400' : 'text-green-600')
      : (theme === 'dark' ? 'text-red-400' : 'text-red-600');
  };

  // Metric Card Component
  const MetricCard = ({ icon, title, value, change, trend }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`rounded-xl p-6 border transition-all duration-300 ${
        theme === 'dark' 
          ? 'bg-gray-800 border-gray-700 hover:border-indigo-500' 
          : 'bg-white border-gray-200 hover:border-indigo-300'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg ${
          theme === 'dark' ? 'bg-indigo-900/30 text-indigo-400' : 'bg-indigo-100 text-indigo-600'
        }`}>
          {icon}
        </div>
        <span className={`text-sm font-medium ${getTrendColor(change)}`}>
          {formatPercentage(change)}
        </span>
      </div>
      <h3 className={`text-lg font-bold mb-1 ${themeClasses.text.primary}`}>
        {typeof value === 'number' ? formatCurrency(value) : value}
      </h3>
      <p className={`text-sm ${themeClasses.text.secondary}`}>
        {title}
      </p>
    </motion.div>
  );

  // Access Type Comparison Component
  const AccessTypeComparison = () => {
    if (!accessTypeComparison) return null;

    const { hotspot, pppoe, both, comparison } = accessTypeComparison;

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ComparisonCard
          type="hotspot"
          label="Hotspot"
          icon={FaWifi}
          stats={hotspot}
          percentage={comparison?.hotspot_percentage}
          theme={theme}
        />
        <ComparisonCard
          type="pppoe"
          label="PPPoE"
          icon={FaNetworkWired}
          stats={pppoe}
          percentage={comparison?.pppoe_percentage}
          theme={theme}
        />
        <ComparisonCard
          type="both"
          label="Both"
          icon={FiServer}
          stats={both}
          percentage={comparison?.both_percentage}
          theme={theme}
        />
      </div>
    );
  };

  const ComparisonCard = ({ type, label, icon: Icon, stats, percentage, theme }) => {
    const getTypeColor = (type) => {
      const colors = {
        hotspot: theme === 'dark' ? 'text-blue-400' : 'text-blue-600',
        pppoe: theme === 'dark' ? 'text-green-400' : 'text-green-600',
        both: theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
      };
      return colors[type];
    };

    const getTypeBgColor = (type) => {
      const colors = {
        hotspot: theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-100',
        pppoe: theme === 'dark' ? 'bg-green-900/30' : 'bg-green-100',
        both: theme === 'dark' ? 'bg-purple-900/30' : 'bg-purple-100'
      };
      return colors[type];
    };

    return (
      <div className={`p-6 rounded-xl border ${themeClasses.border.light} ${themeClasses.bg.primary}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-3 rounded-lg ${getTypeBgColor(type)} ${getTypeColor(type)}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h3 className={`font-semibold ${themeClasses.text.primary}`}>{label}</h3>
            <p className={`text-sm ${themeClasses.text.secondary}`}>{percentage?.toFixed(1)}% of total</p>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className={themeClasses.text.secondary}>Transactions:</span>
            <span className={themeClasses.text.primary}>{stats?.total || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className={themeClasses.text.secondary}>Success Rate:</span>
            <span className={themeClasses.text.primary}>
              {stats?.success_rate ? `${stats.success_rate.toFixed(1)}%` : '0%'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className={themeClasses.text.secondary}>Avg. Amount:</span>
            <span className={themeClasses.text.primary}>
              {formatCurrency(stats?.avg_amount || 0)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className={themeClasses.text.secondary}>Total Revenue:</span>
            <span className={themeClasses.text.primary}>
              {formatCurrency(stats?.total_amount || 0)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Daily Trends Component
  const DailyTrends = () => {
    if (!advancedStats?.daily) return null;

    const dailyData = advancedStats.daily.slice(-7);

    return (
      <div className={`rounded-xl p-6 ${themeClasses.bg.primary} border ${themeClasses.border.light}`}>
        <h3 className={`font-semibold mb-6 ${themeClasses.text.primary}`}>Daily Transaction Trends</h3>
        <div className="space-y-4">
          {dailyData.map((day, index) => {
            const hotspotData = day.access_types?.find(access => access.access_type === 'hotspot');
            const pppoeData = day.access_types?.find(access => access.access_type === 'pppoe');
            
            const maxTransactions = Math.max(
              ...dailyData.map(d => d.stats?.total || 0)
            );

            return (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className={`text-sm font-medium ${themeClasses.text.primary}`}>
                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>
                  <span className={`text-sm ${themeClasses.text.secondary}`}>
                    {day.stats?.total || 0} transactions
                  </span>
                </div>
                
                <div className="flex gap-2">
                  {/* Hotspot Bar */}
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span className={themeClasses.text.secondary}>Hotspot</span>
                      <span className={themeClasses.text.primary}>{hotspotData?.count || 0}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${((hotspotData?.count || 0) / (maxTransactions || 1)) * 100}%` 
                        }}
                      />
                    </div>
                  </div>

                  {/* PPPoE Bar */}
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span className={themeClasses.text.secondary}>PPPoE</span>
                      <span className={themeClasses.text.primary}>{pppoeData?.count || 0}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${((pppoeData?.count || 0) / (maxTransactions || 1)) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Payment Method Distribution
  const PaymentMethodDistribution = () => {
    if (!advancedStats?.by_method) return null;

    return (
      <div className={`rounded-xl p-6 ${themeClasses.bg.primary} border ${themeClasses.border.light}`}>
        <h3 className={`font-semibold mb-6 ${themeClasses.text.primary}`}>Payment Methods</h3>
        <div className="space-y-4">
          {advancedStats.by_method.map((method, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  method.payment_method === 'mpesa' 
                    ? 'bg-green-500' 
                    : method.payment_method === 'paypal'
                    ? 'bg-blue-500'
                    : 'bg-purple-500'
                }`} />
                <span className={`text-sm capitalize ${themeClasses.text.primary}`}>
                  {method.payment_method?.replace('_', ' ') || 'Unknown'}
                </span>
              </div>
              <div className="text-right">
                <div className={`font-semibold ${themeClasses.text.primary}`}>
                  {method.count || 0}
                </div>
                <div className={`text-xs ${themeClasses.text.secondary}`}>
                  {formatCurrency(method.total_amount || 0)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`rounded-xl shadow-lg border ${themeClasses.bg.primary} ${themeClasses.border.light} mb-6`}
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h2 className={`text-xl font-bold flex items-center gap-2 ${themeClasses.text.primary}`}>
            <FiTrendingUp className="text-indigo-500" />
            Transaction Analytics
          </h2>
          <p className={`mt-1 ${themeClasses.text.secondary}`}>
            Comprehensive insights into your transaction performance
          </p>
        </div>
        
        <div className="flex items-center gap-3 mt-4 lg:mt-0">
          <EnhancedSelect
            value={timeRange}
            onChange={setTimeRange}
            options={timeRangeOptions}
            placeholder="Select time range"
            theme={theme}
            className="w-40"
          />

          <button
            onClick={onRefresh}
            disabled={loading}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              theme === 'dark'
                ? 'bg-gray-700 hover:bg-gray-600 text-white disabled:bg-gray-800'
                : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 disabled:bg-gray-100'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex space-x-8 px-6">
          {[
            { id: 'overview', label: 'Overview', icon: FiBarChart2 },
            { id: 'comparison', label: 'Access Type Comparison', icon: FiPieChart },
            { id: 'trends', label: 'Daily Trends', icon: FiTrendingUp },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-4 border-b-2 transition-all duration-300 ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <MetricCard
                    icon={<FiTrendingUp className="w-6 h-6" />}
                    title="Total Revenue"
                    value={metrics.totalRevenue.value}
                    change={metrics.totalRevenue.change}
                  />
                  <MetricCard
                    icon={<FiPieChart className="w-6 h-6" />}
                    title="Success Rate"
                    value={`${metrics.successRate.value.toFixed(1)}%`}
                    change={metrics.successRate.change}
                  />
                  <MetricCard
                    icon={<FiCreditCard className="w-6 h-6" />}
                    title="Total Transactions"
                    value={metrics.totalTransactions.value}
                    change={metrics.totalTransactions.change}
                  />
                  <MetricCard
                    icon={<FiDollarSign className="w-6 h-6" />}
                    title="Avg. Transaction"
                    value={metrics.avgTransaction.value}
                    change={metrics.avgTransaction.change}
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <DailyTrends />
                  <PaymentMethodDistribution />
                </div>
              </div>
            )}

            {activeTab === 'comparison' && <AccessTypeComparison />}
            
            {activeTab === 'trends' && (
              <div className="space-y-6">
                <DailyTrends />
                <AccessTypeComparison />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default TransactionAnalytics;