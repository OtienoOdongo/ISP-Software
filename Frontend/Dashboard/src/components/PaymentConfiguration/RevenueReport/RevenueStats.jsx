// import React, { useMemo } from 'react';
// import { FaWifi, FaNetworkWired, FaUsers, FaChartLine, FaMoneyBillWave, FaReceipt } from 'react-icons/fa';
// import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
// import { RevenueDistributionChart, AccessTypeBadge } from '../../ServiceManagement/Shared/components'

// const RevenueStats = ({ reconciliationData, theme, cardClass, textSecondaryClass }) => {
//   const { overall_summary, access_type_breakdown } = reconciliationData;
  
//   const statsCards = useMemo(() => [
//     {
//       title: 'Combined Revenue',
//       value: overall_summary.combined_revenue,
//       icon: FaChartLine,
//       color: theme === "dark" ? "text-blue-400" : "text-blue-600",
//       border: theme === "dark" ? "border-blue-500" : "border-blue-500",
//       description: 'Total across all access types',
//       trend: 'up'
//     },
//     {
//       title: 'Hotspot Revenue',
//       value: access_type_breakdown.hotspot.revenue,
//       icon: FaWifi,
//       color: theme === "dark" ? "text-green-400" : "text-green-600",
//       border: theme === "dark" ? "border-green-500" : "border-green-500",
//       description: `${access_type_breakdown.hotspot.count} transactions`,
//       trend: 'up'
//     },
//     {
//       title: 'PPPoE Revenue',
//       value: access_type_breakdown.pppoe.revenue,
//       icon: FaNetworkWired,
//       color: theme === "dark" ? "text-purple-400" : "text-purple-600",
//       border: theme === "dark" ? "border-purple-500" : "border-purple-500",
//       description: `${access_type_breakdown.pppoe.count} transactions`,
//       trend: 'up'
//     },
//     {
//       title: 'Combined Profit',
//       value: overall_summary.combined_profit,
//       icon: FaUsers,
//       color: overall_summary.combined_profit >= 0 
//         ? (theme === "dark" ? "text-green-400" : "text-green-600")
//         : (theme === "dark" ? "text-red-400" : "text-red-600"),
//       border: overall_summary.combined_profit >= 0 
//         ? (theme === "dark" ? "border-green-500" : "border-green-500")
//         : (theme === "dark" ? "border-red-500" : "border-red-500"),
//       description: 'After expenses and taxes',
//       trend: overall_summary.combined_profit >= 0 ? 'up' : 'down'
//     }
//   ], [overall_summary, access_type_breakdown, theme]);

//   const performanceMetrics = useMemo(() => [
//     {
//       label: 'Total Transactions',
//       value: access_type_breakdown.combined.count,
//       format: 'number'
//     },
//     {
//       label: 'Average Transaction Value',
//       value: access_type_breakdown.combined.revenue / access_type_breakdown.combined.count || 0,
//       format: 'currency'
//     },
//     {
//       label: 'Revenue per Access Type',
//       value: access_type_breakdown.combined.revenue / 3,
//       format: 'currency'
//     },
//     {
//       label: 'Success Rate',
//       value: 95.2, // This would come from your analytics
//       format: 'percentage'
//     }
//   ], [access_type_breakdown]);

//   const getTrendIcon = (trend) => {
//     if (trend === 'up') {
//       return <TrendingUp className="w-4 h-4 text-green-500" />;
//     }
//     return <TrendingDown className="w-4 h-4 text-red-500" />;
//   };

//   const formatValue = (value, format) => {
//     switch (format) {
//       case 'currency':
//         return `KES ${value.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;
//       case 'percentage':
//         return `${value.toFixed(1)}%`;
//       case 'number':
//         return value.toLocaleString();
//       default:
//         return value;
//     }
//   };

//   return (
//     <div className="space-y-6">
//       {/* Revenue Distribution */}
//       <div className={`${cardClass} p-6 transition-colors duration-300`}>
//         <h2 className={`text-xl font-semibold mb-4 ${theme === "dark" ? "text-white" : "text-gray-800"} flex items-center`}>
//           <FaChartLine className="mr-2" /> Revenue Distribution by Access Type
//         </h2>
//         <RevenueDistributionChart 
//           distribution={overall_summary.revenue_distribution} 
//           theme={theme} 
//         />
        
//         {/* Quick Stats */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
//           <div className={`p-4 rounded-lg ${theme === "dark" ? "bg-blue-900/30" : "bg-blue-50"} border ${theme === "dark" ? "border-blue-700" : "border-blue-200"}`}>
//             <div className="flex items-center justify-between">
//               <span className={`text-sm ${theme === "dark" ? "text-blue-300" : "text-blue-700"}`}>Hotspot Share</span>
//               {getTrendIcon('up')}
//             </div>
//             <p className="text-lg font-bold mt-1">
//               {overall_summary.revenue_distribution?.hotspot?.toFixed(1) || 0}%
//             </p>
//           </div>
          
//           <div className={`p-4 rounded-lg ${theme === "dark" ? "bg-green-900/30" : "bg-green-50"} border ${theme === "dark" ? "border-green-700" : "border-green-200"}`}>
//             <div className="flex items-center justify-between">
//               <span className={`text-sm ${theme === "dark" ? "text-green-300" : "text-green-700"}`}>PPPoE Share</span>
//               {getTrendIcon('up')}
//             </div>
//             <p className="text-lg font-bold mt-1">
//               {overall_summary.revenue_distribution?.pppoe?.toFixed(1) || 0}%
//             </p>
//           </div>
          
//           <div className={`p-4 rounded-lg ${theme === "dark" ? "bg-purple-900/30" : "bg-purple-50"} border ${theme === "dark" ? "border-purple-700" : "border-purple-200"}`}>
//             <div className="flex items-center justify-between">
//               <span className={`text-sm ${theme === "dark" ? "text-purple-300" : "text-purple-700"}`}>Both Access Share</span>
//               {getTrendIcon('up')}
//             </div>
//             <p className="text-lg font-bold mt-1">
//               {overall_summary.revenue_distribution?.both?.toFixed(1) || 0}%
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Statistics Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         {statsCards.map((stat, index) => {
//           const IconComponent = stat.icon;
//           return (
//             <div 
//               key={index}
//               className={`${cardClass} p-6 border-l-4 ${stat.border} transition-all duration-300 hover:shadow-lg relative overflow-hidden`}
//             >
//               {/* Background pattern */}
//               <div className={`absolute top-0 right-0 w-20 h-20 opacity-10 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
//                 <IconComponent className="w-full h-full" />
//               </div>
              
//               <div className="flex items-center justify-between mb-2 relative z-10">
//                 <IconComponent className={`text-2xl ${stat.color}`} />
//                 <div className="flex items-center space-x-2">
//                   <AccessTypeBadge 
//                     accessType={stat.title.toLowerCase().includes('hotspot') ? 'hotspot' : 
//                                stat.title.toLowerCase().includes('pppoe') ? 'pppoe' : 
//                                stat.title.toLowerCase().includes('both') ? 'both' : 'general'}
//                     theme={theme}
//                     size="sm"
//                   />
//                   {getTrendIcon(stat.trend)}
//                 </div>
//               </div>
              
//               <h3 className={`text-sm ${textSecondaryClass} mb-1 relative z-10`}>{stat.title}</h3>
//               <p className={`text-2xl font-bold ${stat.color} mb-1 relative z-10`}>
//                 KES {stat.value.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
//               </p>
//               <p className={`text-xs ${textSecondaryClass} relative z-10`}>{stat.description}</p>
//             </div>
//           );
//         })}
//       </div>

//       {/* Detailed Breakdown */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* Profitability by Access Type */}
//         <div className={`${cardClass} p-6 transition-colors duration-300`}>
//           <h3 className={`text-lg font-semibold mb-4 ${theme === "dark" ? "text-white" : "text-gray-800"} flex items-center`}>
//             <FaMoneyBillWave className="mr-2" /> Profitability by Access Type
//           </h3>
//           <div className="space-y-4">
//             {Object.entries(access_type_breakdown).map(([accessType, data]) => {
//               if (accessType === 'combined') return null;
//               const margin = data.revenue > 0 ? (data.profit / data.revenue) * 100 : 0;
//               const isProfitable = margin >= 0;
              
//               return (
//                 <div 
//                   key={accessType} 
//                   className={`p-4 rounded-lg border transition-all duration-300 hover:scale-[1.02] ${
//                     theme === "dark" 
//                       ? "bg-gray-700/50 border-gray-600 hover:bg-gray-700" 
//                       : "bg-gray-50 border-gray-200 hover:bg-white"
//                   }`}
//                 >
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center space-x-3">
//                       <AccessTypeBadge accessType={accessType} theme={theme} size="sm" />
//                       <div>
//                         <p className="font-semibold text-sm">
//                           {data.count} transactions
//                         </p>
//                         <p className={`text-xs ${textSecondaryClass}`}>
//                           KES {data.revenue.toLocaleString('en-KE')} revenue
//                         </p>
//                       </div>
//                     </div>
//                     <div className="text-right">
//                       <p className={`font-bold text-lg ${isProfitable ? 'text-green-500' : 'text-red-500'}`}>
//                         KES {data.profit.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
//                       </p>
//                       <p className={`text-xs flex items-center justify-end ${isProfitable ? 'text-green-500' : 'text-red-500'}`}>
//                         {getTrendIcon(isProfitable ? 'up' : 'down')}
//                         <span className="ml-1">{margin.toFixed(1)}% margin</span>
//                       </p>
//                     </div>
//                   </div>
                  
//                   {/* Progress bar */}
//                   <div className="mt-3">
//                     <div className={`w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2`}>
//                       <div 
//                         className={`h-2 rounded-full ${isProfitable ? 'bg-green-500' : 'bg-red-500'} transition-all duration-500`}
//                         style={{ 
//                           width: `${Math.min(Math.abs(margin), 100)}%` 
//                         }}
//                       ></div>
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         </div>

//         {/* Performance Metrics */}
//         <div className={`${cardClass} p-6 transition-colors duration-300`}>
//           <h3 className={`text-lg font-semibold mb-4 ${theme === "dark" ? "text-white" : "text-gray-800"} flex items-center`}>
//             <FaChartLine className="mr-2" /> Performance Metrics
//           </h3>
//           <div className="space-y-4">
//             {performanceMetrics.map((metric, index) => (
//               <div 
//                 key={index}
//                 className={`flex justify-between items-center p-3 rounded-lg border transition-colors duration-300 ${
//                   theme === "dark" 
//                     ? "bg-gray-700/30 border-gray-600 hover:bg-gray-700/50" 
//                     : "bg-gray-50 border-gray-200 hover:bg-gray-100"
//                 }`}
//               >
//                 <div className="flex items-center">
//                   <DollarSign className={`w-4 h-4 mr-2 ${textSecondaryClass}`} />
//                   <span className={textSecondaryClass}>{metric.label}</span>
//                 </div>
//                 <span className={`font-semibold ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
//                   {formatValue(metric.value, metric.format)}
//                 </span>
//               </div>
//             ))}
            
//             {/* Additional insights */}
//             <div className={`mt-6 p-4 rounded-lg border ${theme === "dark" ? "bg-indigo-900/20 border-indigo-700" : "bg-indigo-50 border-indigo-200"}`}>
//               <h4 className={`font-semibold mb-2 ${theme === "dark" ? "text-indigo-300" : "text-indigo-700"}`}>
//                 Insights
//               </h4>
//               <ul className={`text-sm space-y-1 ${theme === "dark" ? "text-indigo-200" : "text-indigo-600"}`}>
//                 <li>• Hotspot leads in transaction volume</li>
//                 <li>• PPPoE shows highest average value</li>
//                 <li>• Combined access types growing steadily</li>
//                 <li>• Overall profitability trending positive</li>
//               </ul>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Summary Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         <div className={`${cardClass} p-6 border-l-4 ${theme === "dark" ? "border-blue-500" : "border-blue-500"}`}>
//           <div className="flex items-center justify-between mb-2">
//             <FaReceipt className={`text-xl ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`} />
//             <span className={`text-xs px-2 py-1 rounded-full ${theme === "dark" ? "bg-blue-900 text-blue-300" : "bg-blue-100 text-blue-800"}`}>
//               Revenue
//             </span>
//           </div>
//           <h3 className={`text-sm ${textSecondaryClass} mb-1`}>Total Revenue</h3>
//           <p className={`text-2xl font-bold ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}>
//             KES {overall_summary.total_revenue.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
//           </p>
//         </div>

//         <div className={`${cardClass} p-6 border-l-4 ${theme === "dark" ? "border-red-500" : "border-red-500"}`}>
//           <div className="flex items-center justify-between mb-2">
//             <FaReceipt className={`text-xl ${theme === "dark" ? "text-red-400" : "text-red-600"}`} />
//             <span className={`text-xs px-2 py-1 rounded-full ${theme === "dark" ? "bg-red-900 text-red-300" : "bg-red-100 text-red-800"}`}>
//               Expenses
//             </span>
//           </div>
//           <h3 className={`text-sm ${textSecondaryClass} mb-1`}>Total Expenses</h3>
//           <p className={`text-2xl font-bold ${theme === "dark" ? "text-red-400" : "text-red-600"}`}>
//             KES {overall_summary.total_expenses.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
//           </p>
//         </div>

//         <div className={`${cardClass} p-6 border-l-4 ${theme === "dark" ? "border-green-500" : "border-green-500"}`}>
//           <div className="flex items-center justify-between mb-2">
//             <FaMoneyBillWave className={`text-xl ${theme === "dark" ? "text-green-400" : "text-green-600"}`} />
//             <span className={`text-xs px-2 py-1 rounded-full ${theme === "dark" ? "bg-green-900 text-green-300" : "bg-green-100 text-green-800"}`}>
//               Net
//             </span>
//           </div>
//           <h3 className={`text-sm ${textSecondaryClass} mb-1`}>Net Profit</h3>
//           <p className={`text-2xl font-bold ${overall_summary.net_profit >= 0 ? (theme === "dark" ? "text-green-400" : "text-green-600") : (theme === "dark" ? "text-red-400" : "text-red-600")}`}>
//             KES {overall_summary.net_profit.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default RevenueStats;








import React, { useMemo } from 'react';
import { FaWifi, FaNetworkWired, FaUsers, FaChartLine, FaMoneyBillWave, FaReceipt } from 'react-icons/fa';
import { TrendingUp, TrendingDown, DollarSign, BarChart3 } from 'lucide-react';
import { RevenueDistributionChart, AccessTypeBadge } from '../../ServiceManagement/Shared/components'

// Algorithm: Calculate success rate from transaction data
const calculateSuccessRate = (reconciliationData) => {
  const transactions = reconciliationData?.revenue?.transactions || [];
  if (transactions.length === 0) return 0;
  
  const successfulTransactions = transactions.filter(t => 
    t.status === 'success' || t.status === 'completed' || !t.status // Assume success if no status
  ).length;
  
  return (successfulTransactions / transactions.length) * 100;
};

// Algorithm: Calculate average transaction value
const calculateAverageTransactionValue = (revenue, count) => {
  return count > 0 ? revenue / count : 0;
};

// Algorithm: Calculate revenue per access type (equal distribution for demo)
const calculateRevenuePerAccessType = (totalRevenue) => {
  return totalRevenue / 3; // Assuming 3 access types
};

const RevenueStats = ({ reconciliationData, theme, cardClass, textSecondaryClass }) => {
  const { overall_summary, access_type_breakdown, revenue, expenses } = reconciliationData;
  
  // Algorithm: Dynamic stats calculation with real data
  const statsCards = useMemo(() => [
    {
      title: 'Combined Revenue',
      value: overall_summary.combined_revenue,
      icon: FaChartLine,
      color: theme === "dark" ? "text-blue-400" : "text-blue-600",
      border: theme === "dark" ? "border-blue-500" : "border-blue-500",
      description: 'Total across all access types',
      trend: overall_summary.combined_revenue > 0 ? 'up' : 'down'
    },
    {
      title: 'Hotspot Revenue',
      value: access_type_breakdown.hotspot.revenue,
      icon: FaWifi,
      color: theme === "dark" ? "text-green-400" : "text-green-600",
      border: theme === "dark" ? "border-green-500" : "border-green-500",
      description: `${access_type_breakdown.hotspot.count} transactions`,
      trend: access_type_breakdown.hotspot.revenue > 0 ? 'up' : 'down'
    },
    {
      title: 'PPPoE Revenue',
      value: access_type_breakdown.pppoe.revenue,
      icon: FaNetworkWired,
      color: theme === "dark" ? "text-purple-400" : "text-purple-600",
      border: theme === "dark" ? "border-purple-500" : "border-purple-500",
      description: `${access_type_breakdown.pppoe.count} transactions`,
      trend: access_type_breakdown.pppoe.revenue > 0 ? 'up' : 'down'
    },
    {
      title: 'Combined Profit',
      value: overall_summary.combined_profit,
      icon: FaUsers,
      color: overall_summary.combined_profit >= 0 
        ? (theme === "dark" ? "text-green-400" : "text-green-600")
        : (theme === "dark" ? "text-red-400" : "text-red-600"),
      border: overall_summary.combined_profit >= 0 
        ? (theme === "dark" ? "border-green-500" : "border-green-500")
        : (theme === "dark" ? "border-red-500" : "border-red-500"),
      description: 'After expenses and taxes',
      trend: overall_summary.combined_profit >= 0 ? 'up' : 'down'
    }
  ], [overall_summary, access_type_breakdown, theme]);

  // Algorithm: Real-time performance metrics calculation
  const performanceMetrics = useMemo(() => {
    const totalRevenue = access_type_breakdown.combined.revenue;
    const totalCount = access_type_breakdown.combined.count;
    
    return [
      {
        label: 'Total Transactions',
        value: totalCount,
        format: 'number'
      },
      {
        label: 'Average Transaction Value',
        value: calculateAverageTransactionValue(totalRevenue, totalCount),
        format: 'currency'
      },
      {
        label: 'Revenue per Access Type',
        value: calculateRevenuePerAccessType(totalRevenue),
        format: 'currency'
      },
      {
        label: 'Success Rate',
        value: calculateSuccessRate(reconciliationData),
        format: 'percentage'
      }
    ];
  }, [access_type_breakdown, reconciliationData]);

  // Algorithm: Tax breakdown calculation
  const taxBreakdown = useMemo(() => {
    const revenueTaxes = revenue?.summary?.tax_breakdown || [];
    const expenseTaxes = expenses?.summary?.tax_breakdown || [];
    
    return {
      revenue: revenueTaxes,
      expenses: expenseTaxes,
      totalRevenueTax: revenueTaxes.reduce((sum, tax) => sum + (tax.tax_amount || 0), 0),
      totalExpenseTax: expenseTaxes.reduce((sum, tax) => sum + (tax.tax_amount || 0), 0)
    };
  }, [revenue, expenses]);

  const getTrendIcon = (trend) => {
    if (trend === 'up') {
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    }
    return <TrendingDown className="w-4 h-4 text-red-500" />;
  };

  const formatValue = (value, format) => {
    switch (format) {
      case 'currency':
        return `KES ${value.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'number':
        return value.toLocaleString();
      default:
        return value;
    }
  };

  // Tax Breakdown Component
  const TaxBreakdownSection = () => (
    <div className={`${cardClass} p-6 transition-colors duration-300`}>
      <h3 className={`text-lg font-semibold mb-4 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
        Tax Breakdown
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className={`font-medium mb-3 ${textSecondaryClass} flex items-center`}>
            <FaMoneyBillWave className="mr-2" /> Revenue Taxes
          </h4>
          {taxBreakdown.revenue.length > 0 ? (
            <div className="space-y-2">
              {taxBreakdown.revenue.map((tax, index) => (
                <div key={index} className="flex justify-between items-center p-2 rounded border border-gray-200 dark:border-gray-600">
                  <div>
                    <span className={`text-sm font-medium ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
                      {tax.tax_name}
                    </span>
                    <span className={`text-xs ml-2 ${textSecondaryClass}`}>
                      ({tax.tax_rate}%)
                    </span>
                  </div>
                  <span className={`text-sm font-semibold ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}>
                    KES {tax.tax_amount.toFixed(2)}
                  </span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-600">
                <span className={`text-sm font-semibold ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
                  Total Revenue Tax
                </span>
                <span className={`text-sm font-bold ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}>
                  KES {taxBreakdown.totalRevenueTax.toFixed(2)}
                </span>
              </div>
            </div>
          ) : (
            <p className={`text-sm ${textSecondaryClass}`}>No revenue taxes applied</p>
          )}
        </div>
        
        <div>
          <h4 className={`font-medium mb-3 ${textSecondaryClass} flex items-center`}>
            <FaReceipt className="mr-2" /> Expense Taxes
          </h4>
          {taxBreakdown.expenses.length > 0 ? (
            <div className="space-y-2">
              {taxBreakdown.expenses.map((tax, index) => (
                <div key={index} className="flex justify-between items-center p-2 rounded border border-gray-200 dark:border-gray-600">
                  <div>
                    <span className={`text-sm font-medium ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
                      {tax.tax_name}
                    </span>
                    <span className={`text-xs ml-2 ${textSecondaryClass}`}>
                      ({tax.tax_rate}%)
                    </span>
                  </div>
                  <span className={`text-sm font-semibold ${theme === "dark" ? "text-red-400" : "text-red-600"}`}>
                    KES {tax.tax_amount.toFixed(2)}
                  </span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-600">
                <span className={`text-sm font-semibold ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
                  Total Expense Tax
                </span>
                <span className={`text-sm font-bold ${theme === "dark" ? "text-red-400" : "text-red-600"}`}>
                  KES {taxBreakdown.totalExpenseTax.toFixed(2)}
                </span>
              </div>
            </div>
          ) : (
            <p className={`text-sm ${textSecondaryClass}`}>No expense taxes applied</p>
          )}
        </div>
      </div>
      
      {/* Total Tax Summary */}
      <div className={`mt-4 p-3 rounded-lg ${
        theme === "dark" ? "bg-gray-700/30 border-gray-600" : "bg-gray-50 border-gray-200"
      } border`}>
        <div className="flex justify-between items-center">
          <span className={`font-semibold ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
            Total Tax Impact
          </span>
          <span className={`text-lg font-bold ${
            theme === "dark" ? "text-yellow-400" : "text-yellow-600"
          }`}>
            KES {(taxBreakdown.totalRevenueTax + taxBreakdown.totalExpenseTax).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Revenue Distribution */}
      <div className={`${cardClass} p-6 transition-colors duration-300`}>
        <h2 className={`text-xl font-semibold mb-4 ${theme === "dark" ? "text-white" : "text-gray-800"} flex items-center`}>
          <FaChartLine className="mr-2" /> Revenue Distribution by Access Type
        </h2>
        <RevenueDistributionChart 
          distribution={overall_summary.revenue_distribution} 
          theme={theme} 
        />
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className={`p-4 rounded-lg ${theme === "dark" ? "bg-blue-900/30" : "bg-blue-50"} border ${theme === "dark" ? "border-blue-700" : "border-blue-200"}`}>
            <div className="flex items-center justify-between">
              <span className={`text-sm ${theme === "dark" ? "text-blue-300" : "text-blue-700"}`}>Hotspot Share</span>
              {getTrendIcon('up')}
            </div>
            <p className="text-lg font-bold mt-1">
              {overall_summary.revenue_distribution?.hotspot?.toFixed(1) || 0}%
            </p>
          </div>
          
          <div className={`p-4 rounded-lg ${theme === "dark" ? "bg-green-900/30" : "bg-green-50"} border ${theme === "dark" ? "border-green-700" : "border-green-200"}`}>
            <div className="flex items-center justify-between">
              <span className={`text-sm ${theme === "dark" ? "text-green-300" : "text-green-700"}`}>PPPoE Share</span>
              {getTrendIcon('up')}
            </div>
            <p className="text-lg font-bold mt-1">
              {overall_summary.revenue_distribution?.pppoe?.toFixed(1) || 0}%
            </p>
          </div>
          
          <div className={`p-4 rounded-lg ${theme === "dark" ? "bg-purple-900/30" : "bg-purple-50"} border ${theme === "dark" ? "border-purple-700" : "border-purple-200"}`}>
            <div className="flex items-center justify-between">
              <span className={`text-sm ${theme === "dark" ? "text-purple-300" : "text-purple-700"}`}>Both Access Share</span>
              {getTrendIcon('up')}
            </div>
            <p className="text-lg font-bold mt-1">
              {overall_summary.revenue_distribution?.both?.toFixed(1) || 0}%
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div 
              key={index}
              className={`${cardClass} p-6 border-l-4 ${stat.border} transition-all duration-300 hover:shadow-lg relative overflow-hidden`}
            >
              {/* Background pattern */}
              <div className={`absolute top-0 right-0 w-20 h-20 opacity-10 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
                <IconComponent className="w-full h-full" />
              </div>
              
              <div className="flex items-center justify-between mb-2 relative z-10">
                <IconComponent className={`text-2xl ${stat.color}`} />
                <div className="flex items-center space-x-2">
                  <AccessTypeBadge 
                    accessType={stat.title.toLowerCase().includes('hotspot') ? 'hotspot' : 
                               stat.title.toLowerCase().includes('pppoe') ? 'pppoe' : 
                               stat.title.toLowerCase().includes('both') ? 'both' : 'general'}
                    theme={theme}
                    size="sm"
                  />
                  {getTrendIcon(stat.trend)}
                </div>
              </div>
              
              <h3 className={`text-sm ${textSecondaryClass} mb-1 relative z-10`}>{stat.title}</h3>
              <p className={`text-2xl font-bold ${stat.color} mb-1 relative z-10`}>
                KES {stat.value.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
              </p>
              <p className={`text-xs ${textSecondaryClass} relative z-10`}>{stat.description}</p>
            </div>
          );
        })}
      </div>

      {/* Tax Breakdown */}
      <TaxBreakdownSection />

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profitability by Access Type */}
        <div className={`${cardClass} p-6 transition-colors duration-300`}>
          <h3 className={`text-lg font-semibold mb-4 ${theme === "dark" ? "text-white" : "text-gray-800"} flex items-center`}>
            <FaMoneyBillWave className="mr-2" /> Profitability by Access Type
          </h3>
          <div className="space-y-4">
            {Object.entries(access_type_breakdown).map(([accessType, data]) => {
              if (accessType === 'combined') return null;
              const margin = data.revenue > 0 ? (data.profit / data.revenue) * 100 : 0;
              const isProfitable = margin >= 0;
              
              return (
                <div 
                  key={accessType} 
                  className={`p-4 rounded-lg border transition-all duration-300 hover:scale-[1.02] ${
                    theme === "dark" 
                      ? "bg-gray-700/50 border-gray-600 hover:bg-gray-700" 
                      : "bg-gray-50 border-gray-200 hover:bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <AccessTypeBadge accessType={accessType} theme={theme} size="sm" />
                      <div>
                        <p className="font-semibold text-sm">
                          {data.count} transactions
                        </p>
                        <p className={`text-xs ${textSecondaryClass}`}>
                          KES {data.revenue.toLocaleString('en-KE')} revenue
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-lg ${isProfitable ? 'text-green-500' : 'text-red-500'}`}>
                        KES {data.profit.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                      </p>
                      <p className={`text-xs flex items-center justify-end ${isProfitable ? 'text-green-500' : 'text-red-500'}`}>
                        {getTrendIcon(isProfitable ? 'up' : 'down')}
                        <span className="ml-1">{margin.toFixed(1)}% margin</span>
                      </p>
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="mt-3">
                    <div className={`w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2`}>
                      <div 
                        className={`h-2 rounded-full ${isProfitable ? 'bg-green-500' : 'bg-red-500'} transition-all duration-500`}
                        style={{ 
                          width: `${Math.min(Math.abs(margin), 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className={`${cardClass} p-6 transition-colors duration-300`}>
          <h3 className={`text-lg font-semibold mb-4 ${theme === "dark" ? "text-white" : "text-gray-800"} flex items-center`}>
            <FaChartLine className="mr-2" /> Performance Metrics
          </h3>
          <div className="space-y-4">
            {performanceMetrics.map((metric, index) => (
              <div 
                key={index}
                className={`flex justify-between items-center p-3 rounded-lg border transition-colors duration-300 ${
                  theme === "dark" 
                    ? "bg-gray-700/30 border-gray-600 hover:bg-gray-700/50" 
                    : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center">
                  <DollarSign className={`w-4 h-4 mr-2 ${textSecondaryClass}`} />
                  <span className={textSecondaryClass}>{metric.label}</span>
                </div>
                <span className={`font-semibold ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
                  {formatValue(metric.value, metric.format)}
                </span>
              </div>
            ))}
            
            {/* Additional insights */}
            <div className={`mt-6 p-4 rounded-lg border ${theme === "dark" ? "bg-indigo-900/20 border-indigo-700" : "bg-indigo-50 border-indigo-200"}`}>
              <h4 className={`font-semibold mb-2 ${theme === "dark" ? "text-indigo-300" : "text-indigo-700"}`}>
                Performance Insights
              </h4>
              <ul className={`text-sm space-y-1 ${theme === "dark" ? "text-indigo-200" : "text-indigo-600"}`}>
                <li>• Hotspot leads in transaction volume</li>
                <li>• PPPoE shows highest average value</li>
                <li>• Combined access types growing steadily</li>
                <li>• Overall profitability trending positive</li>
                <li>• Success rate: {performanceMetrics[3]?.value.toFixed(1)}%</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`${cardClass} p-6 border-l-4 ${theme === "dark" ? "border-blue-500" : "border-blue-500"}`}>
          <div className="flex items-center justify-between mb-2">
            <FaReceipt className={`text-xl ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`} />
            <span className={`text-xs px-2 py-1 rounded-full ${theme === "dark" ? "bg-blue-900 text-blue-300" : "bg-blue-100 text-blue-800"}`}>
              Revenue
            </span>
          </div>
          <h3 className={`text-sm ${textSecondaryClass} mb-1`}>Total Revenue</h3>
          <p className={`text-2xl font-bold ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}>
            KES {overall_summary.total_revenue.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className={`${cardClass} p-6 border-l-4 ${theme === "dark" ? "border-red-500" : "border-red-500"}`}>
          <div className="flex items-center justify-between mb-2">
            <FaReceipt className={`text-xl ${theme === "dark" ? "text-red-400" : "text-red-600"}`} />
            <span className={`text-xs px-2 py-1 rounded-full ${theme === "dark" ? "bg-red-900 text-red-300" : "bg-red-100 text-red-800"}`}>
              Expenses
            </span>
          </div>
          <h3 className={`text-sm ${textSecondaryClass} mb-1`}>Total Expenses</h3>
          <p className={`text-2xl font-bold ${theme === "dark" ? "text-red-400" : "text-red-600"}`}>
            KES {overall_summary.total_expenses.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className={`${cardClass} p-6 border-l-4 ${theme === "dark" ? "border-green-500" : "border-green-500"}`}>
          <div className="flex items-center justify-between mb-2">
            <FaMoneyBillWave className={`text-xl ${theme === "dark" ? "text-green-400" : "text-green-600"}`} />
            <span className={`text-xs px-2 py-1 rounded-full ${theme === "dark" ? "bg-green-900 text-green-300" : "bg-green-100 text-green-800"}`}>
              Net
            </span>
          </div>
          <h3 className={`text-sm ${textSecondaryClass} mb-1`}>Net Profit</h3>
          <p className={`text-2xl font-bold ${overall_summary.net_profit >= 0 ? (theme === "dark" ? "text-green-400" : "text-green-600") : (theme === "dark" ? "text-red-400" : "text-red-600")}`}>
            KES {overall_summary.net_profit.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default RevenueStats;