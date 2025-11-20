// import React, { useState, useMemo, useCallback } from 'react';
// import { FaWifi, FaNetworkWired, FaUsers, FaChartBar, FaDownload } from 'react-icons/fa';
// import { TrendingUp, TrendingDown, BarChart3, PieChart, LineChart } from 'lucide-react';
// import { toast } from 'react-hot-toast';
// import api from '../../../api'
// import { EnhancedSelect, AccessTypeBadge } from '../../ServiceManagement/Shared/components'

// const AccessTypeAnalytics = ({ analyticsData, reconciliationData, theme, cardClass }) => {
//   const [timeRange, setTimeRange] = useState('30d');
//   const [chartType, setChartType] = useState('line');
//   const [loading, setLoading] = useState(false);

//   const timeRangeOptions = [
//     { value: '7d', label: 'Last 7 Days' },
//     { value: '30d', label: 'Last 30 Days' },
//     { value: '90d', label: 'Last 90 Days' },
//     { value: '1y', label: 'Last Year' }
//   ];

//   const chartTypeOptions = [
//     { value: 'line', label: 'Line Chart', icon: LineChart },
//     { value: 'bar', label: 'Bar Chart', icon: BarChart3 },
//     { value: 'pie', label: 'Pie Chart', icon: PieChart }
//   ];

//   const { access_type_breakdown, overall_summary } = reconciliationData;

//   const fetchAnalyticsData = useCallback(async (range) => {
//     setLoading(true);
//     try {
//       const response = await api.get('/api/payments/reconciliation/analytics/access-type/', {
//         params: { days: range === '7d' ? 7 : range === '90d' ? 90 : range === '1y' ? 365 : 30 }
//       });
//       // In a real app, you'd set this to state
//       console.log('Analytics data:', response.data);
//       toast.success(`Analytics data loaded for ${range}`);
//     } catch (error) {
//       toast.error('Failed to load analytics data');
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   const analyticsCards = useMemo(() => [
//     {
//       title: 'Hotspot Performance',
//       value: access_type_breakdown.hotspot.revenue,
//       change: '+12.5%',
//       trend: 'up',
//       icon: FaWifi,
//       color: 'blue',
//       description: `${access_type_breakdown.hotspot.count} transactions`
//     },
//     {
//       title: 'PPPoE Performance',
//       value: access_type_breakdown.pppoe.revenue,
//       change: '+8.3%',
//       trend: 'up',
//       icon: FaNetworkWired,
//       color: 'green',
//       description: `${access_type_breakdown.pppoe.count} transactions`
//     },
//     {
//       title: 'Both Access Types',
//       value: access_type_breakdown.both.revenue,
//       change: '+15.2%',
//       trend: 'up',
//       icon: FaUsers,
//       color: 'purple',
//       description: `${access_type_breakdown.both.count} transactions`
//     },
//     {
//       title: 'Total Growth',
//       value: overall_summary.combined_revenue,
//       change: '+11.7%',
//       trend: 'up',
//       icon: FaChartBar,
//       color: 'indigo',
//       description: 'Combined performance'
//     }
//   ], [access_type_breakdown, overall_summary]);

//   const getColorClasses = (color) => {
//     const colors = {
//       blue: {
//         bg: theme === "dark" ? "bg-blue-900/20" : "bg-blue-50",
//         border: theme === "dark" ? "border-blue-700" : "border-blue-200",
//         text: theme === "dark" ? "text-blue-300" : "text-blue-700",
//         icon: theme === "dark" ? "text-blue-400" : "text-blue-600"
//       },
//       green: {
//         bg: theme === "dark" ? "bg-green-900/20" : "bg-green-50",
//         border: theme === "dark" ? "border-green-700" : "border-green-200",
//         text: theme === "dark" ? "text-green-300" : "text-green-700",
//         icon: theme === "dark" ? "text-green-400" : "text-green-600"
//       },
//       purple: {
//         bg: theme === "dark" ? "bg-purple-900/20" : "bg-purple-50",
//         border: theme === "dark" ? "border-purple-700" : "border-purple-200",
//         text: theme === "dark" ? "text-purple-300" : "text-purple-700",
//         icon: theme === "dark" ? "text-purple-400" : "text-purple-600"
//       },
//       indigo: {
//         bg: theme === "dark" ? "bg-indigo-900/20" : "bg-indigo-50",
//         border: theme === "dark" ? "border-indigo-700" : "border-indigo-200",
//         text: theme === "dark" ? "text-indigo-300" : "text-indigo-700",
//         icon: theme === "dark" ? "text-indigo-400" : "text-indigo-600"
//       }
//     };
//     return colors[color] || colors.blue;
//   };

//   const ChartPlaceholder = () => (
//     <div className={`h-64 rounded-lg border-2 border-dashed flex items-center justify-center ${
//       theme === "dark" ? "border-gray-600" : "border-gray-300"
//     }`}>
//       <div className="text-center">
//         <BarChart3 className={`w-12 h-12 mx-auto mb-2 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`} />
//         <p className={theme === "dark" ? "text-gray-400" : "text-gray-500"}>
//           {chartType === 'line' ? 'Line Chart' : chartType === 'bar' ? 'Bar Chart' : 'Pie Chart'} Visualization
//         </p>
//         <p className={`text-sm mt-1 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
//           Analytics data would be displayed here
//         </p>
//       </div>
//     </div>
//   );

//   const ProfitabilityTable = () => (
//     <div className="overflow-x-auto">
//       <table className={`min-w-full divide-y ${theme === "dark" ? "divide-gray-700" : "divide-gray-200"}`}>
//         <thead>
//           <tr>
//             <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
//               theme === "dark" ? "text-gray-300" : "text-gray-500"
//             }`}>
//               Access Type
//             </th>
//             <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
//               theme === "dark" ? "text-gray-300" : "text-gray-500"
//             }`}>
//               Revenue
//             </th>
//             <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
//               theme === "dark" ? "text-gray-300" : "text-gray-500"
//             }`}>
//               Expenses
//             </th>
//             <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
//               theme === "dark" ? "text-gray-300" : "text-gray-500"
//             }`}>
//               Profit
//             </th>
//             <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
//               theme === "dark" ? "text-gray-300" : "text-gray-500"
//             }`}>
//               Margin
//             </th>
//           </tr>
//         </thead>
//         <tbody className={`divide-y ${theme === "dark" ? "divide-gray-700" : "divide-gray-200"}`}>
//           {Object.entries(access_type_breakdown).map(([accessType, data]) => {
//             if (accessType === 'combined') return null;
//             const margin = data.revenue > 0 ? (data.profit / data.revenue) * 100 : 0;
//             const isProfitable = margin >= 0;
            
//             return (
//               <tr 
//                 key={accessType}
//                 className={`transition-colors duration-200 ${
//                   theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-50"
//                 }`}
//               >
//                 <td className="px-6 py-4 whitespace-nowrap">
//                   <AccessTypeBadge accessType={accessType} theme={theme} />
//                 </td>
//                 <td className={`px-6 py-4 whitespace-nowrap font-medium ${
//                   theme === "dark" ? "text-white" : "text-gray-900"
//                 }`}>
//                   KES {data.revenue.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
//                 </td>
//                 <td className={`px-6 py-4 whitespace-nowrap ${
//                   theme === "dark" ? "text-gray-300" : "text-gray-600"
//                 }`}>
//                   KES {data.expenses.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
//                 </td>
//                 <td className={`px-6 py-4 whitespace-nowrap font-semibold ${
//                   isProfitable 
//                     ? (theme === "dark" ? "text-green-400" : "text-green-600")
//                     : (theme === "dark" ? "text-red-400" : "text-red-600")
//                 }`}>
//                   KES {data.profit.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap">
//                   <div className="flex items-center space-x-2">
//                     <span className={`font-semibold ${
//                       isProfitable 
//                         ? (theme === "dark" ? "text-green-400" : "text-green-600")
//                         : (theme === "dark" ? "text-red-400" : "text-red-600")
//                     }`}>
//                       {margin.toFixed(1)}%
//                     </span>
//                     {isProfitable ? (
//                       <TrendingUp className="w-4 h-4 text-green-500" />
//                     ) : (
//                       <TrendingDown className="w-4 h-4 text-red-500" />
//                     )}
//                   </div>
//                 </td>
//               </tr>
//             );
//           })}
//         </tbody>
//       </table>
//     </div>
//   );

//   return (
//     <div className="space-y-6">
//       {/* Controls */}
//       <div className={`${cardClass} p-6 transition-colors duration-300`}>
//         <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
//           <h2 className={`text-xl font-semibold ${theme === "dark" ? "text-white" : "text-gray-800"} flex items-center`}>
//             <FaChartBar className="mr-2" /> Access Type Analytics
//           </h2>
          
//           <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
//             <EnhancedSelect
//               value={timeRange}
//               onChange={(value) => {
//                 setTimeRange(value);
//                 fetchAnalyticsData(value);
//               }}
//               options={timeRangeOptions}
//               placeholder="Time Range"
//               theme={theme}
//               className="w-40"
//             />
            
//             <EnhancedSelect
//               value={chartType}
//               onChange={setChartType}
//               options={chartTypeOptions}
//               placeholder="Chart Type"
//               theme={theme}
//               className="w-40"
//             />
            
//             <button
//               onClick={() => toast.success('Export feature would be implemented here')}
//               className={`flex items-center px-4 py-2 rounded-lg transition-colors duration-300 ${
//                 theme === "dark" 
//                   ? "bg-gray-700 hover:bg-gray-600 text-white" 
//                   : "bg-gray-200 hover:bg-gray-300 text-gray-800"
//               }`}
//             >
//               <FaDownload className="mr-2" />
//               Export
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Analytics Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         {analyticsCards.map((card, index) => {
//           const IconComponent = card.icon;
//           const colorClasses = getColorClasses(card.color);
          
//           return (
//             <div 
//               key={index}
//               className={`${cardClass} p-6 border-l-4 ${colorClasses.border} transition-all duration-300 hover:shadow-lg`}
//             >
//               <div className="flex items-center justify-between mb-4">
//                 <div className={`p-2 rounded-lg ${colorClasses.bg}`}>
//                   <IconComponent className={`text-xl ${colorClasses.icon}`} />
//                 </div>
//                 <div className="flex items-center space-x-1">
//                   {card.trend === 'up' ? (
//                     <TrendingUp className="w-4 h-4 text-green-500" />
//                   ) : (
//                     <TrendingDown className="w-4 h-4 text-red-500" />
//                   )}
//                   <span className={`text-sm font-medium ${
//                     card.trend === 'up' ? 'text-green-500' : 'text-red-500'
//                   }`}>
//                     {card.change}
//                   </span>
//                 </div>
//               </div>
              
//               <h3 className={`text-sm font-medium ${colorClasses.text} mb-1`}>
//                 {card.title}
//               </h3>
//               <p className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-800"} mb-1`}>
//                 KES {card.value.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
//               </p>
//               <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
//                 {card.description}
//               </p>
//             </div>
//           );
//         })}
//       </div>

//       {/* Chart Section */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         <div className={`${cardClass} p-6 lg:col-span-2 transition-colors duration-300`}>
//           <h3 className={`text-lg font-semibold mb-4 ${theme === "dark" ? "text-white" : "text-gray-800"} flex items-center`}>
//             <LineChart className="mr-2" /> Revenue Trends
//           </h3>
//           <ChartPlaceholder />
//         </div>

//         <div className={`${cardClass} p-6 transition-colors duration-300`}>
//           <h3 className={`text-lg font-semibold mb-4 ${theme === "dark" ? "text-white" : "text-gray-800"} flex items-center`}>
//             <PieChart className="mr-2" /> Distribution
//           </h3>
//           <div className="space-y-4">
//             {Object.entries(access_type_breakdown).map(([accessType, data]) => {
//               if (accessType === 'combined') return null;
//               const percentage = overall_summary.combined_revenue > 0 
//                 ? (data.revenue / overall_summary.combined_revenue) * 100 
//                 : 0;
              
//               return (
//                 <div key={accessType} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-600">
//                   <div className="flex items-center space-x-3">
//                     <AccessTypeBadge accessType={accessType} theme={theme} size="sm" />
//                     <span className="font-medium text-sm">
//                       {percentage.toFixed(1)}%
//                     </span>
//                   </div>
//                   <span className="text-sm font-semibold">
//                     KES {data.revenue.toLocaleString('en-KE')}
//                   </span>
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       </div>

//       {/* Profitability Table */}
//       <div className={`${cardClass} p-6 transition-colors duration-300`}>
//         <h3 className={`text-lg font-semibold mb-4 ${theme === "dark" ? "text-white" : "text-gray-800"} flex items-center`}>
//           <BarChart3 className="mr-2" /> Profitability Analysis
//         </h3>
//         <ProfitabilityTable />
//       </div>

//       {/* Insights Section */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <div className={`${cardClass} p-6 transition-colors duration-300`}>
//           <h3 className={`text-lg font-semibold mb-4 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
//             Key Insights
//           </h3>
//           <div className="space-y-3">
//             <div className={`p-3 rounded-lg border ${
//               theme === "dark" ? "border-green-700 bg-green-900/20" : "border-green-200 bg-green-50"
//             }`}>
//               <h4 className={`font-semibold mb-1 ${theme === "dark" ? "text-green-300" : "text-green-700"}`}>
//                 Hotspot Dominance
//               </h4>
//               <p className={`text-sm ${theme === "dark" ? "text-green-200" : "text-green-600"}`}>
//                 Hotspot accounts for {((access_type_breakdown.hotspot.revenue / overall_summary.combined_revenue) * 100).toFixed(1)}% of total revenue with strong growth trends.
//               </p>
//             </div>
            
//             <div className={`p-3 rounded-lg border ${
//               theme === "dark" ? "border-blue-700 bg-blue-900/20" : "border-blue-200 bg-blue-50"
//             }`}>
//               <h4 className={`font-semibold mb-1 ${theme === "dark" ? "text-blue-300" : "text-blue-700"}`}>
//                 PPPoE Efficiency
//               </h4>
//               <p className={`text-sm ${theme === "dark" ? "text-blue-200" : "text-blue-600"}`}>
//                 PPPoE shows the highest profit margin at {((access_type_breakdown.pppoe.profit / access_type_breakdown.pppoe.revenue) * 100).toFixed(1)}% despite lower volume.
//               </p>
//             </div>
//           </div>
//         </div>

//         <div className={`${cardClass} p-6 transition-colors duration-300`}>
//           <h3 className={`text-lg font-semibold mb-4 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
//             Recommendations
//           </h3>
//           <div className="space-y-3">
//             <div className={`p-3 rounded-lg border ${
//               theme === "dark" ? "border-purple-700 bg-purple-900/20" : "border-purple-200 bg-purple-50"
//             }`}>
//               <h4 className={`font-semibold mb-1 ${theme === "dark" ? "text-purple-300" : "text-purple-700"}`}>
//                 Growth Strategy
//               </h4>
//               <ul className={`text-sm space-y-1 ${theme === "dark" ? "text-purple-200" : "text-purple-600"}`}>
//                 <li>• Increase marketing for PPPoE services</li>
//                 <li>• Bundle hotspot and PPPoE offerings</li>
//                 <li>• Optimize pricing for combined access</li>
//               </ul>
//             </div>
            
//             <div className={`p-3 rounded-lg border ${
//               theme === "dark" ? "border-yellow-700 bg-yellow-900/20" : "border-yellow-200 bg-yellow-50"
//             }`}>
//               <h4 className={`font-semibold mb-1 ${theme === "dark" ? "text-yellow-300" : "text-yellow-700"}`}>
//                 Optimization
//               </h4>
//               <ul className={`text-sm space-y-1 ${theme === "dark" ? "text-yellow-200" : "text-yellow-600"}`}>
//                 <li>• Monitor hotspot capacity during peak hours</li>
//                 <li>• Enhance PPPoE reliability features</li>
//                 <li>• Develop cross-selling strategies</li>
//               </ul>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AccessTypeAnalytics;










import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { FaWifi, FaNetworkWired, FaUsers, FaChartBar, FaDownload, FaSpinner } from 'react-icons/fa';
import { TrendingUp, TrendingDown, BarChart3, PieChart, LineChart, Calendar } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../../api'
import { EnhancedSelect, AccessTypeBadge, RevenueDistributionChart } from '../../ServiceManagement/Shared/components'

// Algorithm: Calculate growth rate between current and previous period
const calculateGrowthRate = (currentData, previousData, accessType) => {
  if (!previousData || !currentData) return 0;
  
  const currentRevenue = currentData.summary?.revenue?.[accessType]?.total || 0;
  const previousRevenue = previousData.summary?.revenue?.[accessType]?.total || 0;
  
  if (previousRevenue === 0) return currentRevenue > 0 ? 100 : 0;
  return ((currentRevenue - previousRevenue) / previousRevenue) * 100;
};

// Algorithm: Determine trend direction based on growth rate
const getTrend = (growthRate) => growthRate >= 0 ? 'up' : 'down';

// Algorithm: Format growth rate for display
const formatGrowthRate = (rate) => {
  const sign = rate >= 0 ? '+' : '';
  return `${sign}${rate.toFixed(1)}%`;
};

const AccessTypeAnalytics = ({ reconciliationData, theme, cardClass }) => {
  const [timeRange, setTimeRange] = useState('30d');
  const [chartType, setChartType] = useState('line');
  const [loading, setLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [previousPeriodData, setPreviousPeriodData] = useState(null);

  const timeRangeOptions = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: '1y', label: 'Last Year' }
  ];

  const chartTypeOptions = [
    { value: 'line', label: 'Line Chart', icon: LineChart },
    { value: 'bar', label: 'Bar Chart', icon: BarChart3 },
    { value: 'pie', label: 'Pie Chart', icon: PieChart }
  ];

  const { access_type_breakdown, overall_summary } = reconciliationData;

  // Data Structure: Efficient analytics data fetching with caching
  const fetchAnalyticsData = useCallback(async (range) => {
    setLoading(true);
    try {
      const days = range === '7d' ? 7 : range === '90d' ? 90 : range === '1y' ? 365 : 30;
      
      const response = await api.get('/api/payments/reconciliation/analytics/access-type/', {
        params: { days }
      });
      
      setAnalyticsData(response.data);
      
      // Fetch previous period for comparison
      const previousResponse = await api.get('/api/payments/reconciliation/analytics/access-type/', {
        params: { days, compare: true }
      });
      setPreviousPeriodData(previousResponse.data);
      
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalyticsData(timeRange);
  }, [timeRange, fetchAnalyticsData]);

  // Algorithm: Dynamic analytics cards with real data
  const analyticsCards = useMemo(() => {
    if (!analyticsData?.summary) {
      // Fallback to reconciliation data while loading
      return [
        {
          title: 'Hotspot Performance',
          value: access_type_breakdown.hotspot.revenue,
          change: '0%',
          trend: 'up',
          icon: FaWifi,
          color: 'blue',
          description: `${access_type_breakdown.hotspot.count} transactions`
        },
        {
          title: 'PPPoE Performance',
          value: access_type_breakdown.pppoe.revenue,
          change: '0%',
          trend: 'up',
          icon: FaNetworkWired,
          color: 'green',
          description: `${access_type_breakdown.pppoe.count} transactions`
        },
        {
          title: 'Both Access Types',
          value: access_type_breakdown.both.revenue,
          change: '0%',
          trend: 'up',
          icon: FaUsers,
          color: 'purple',
          description: `${access_type_breakdown.both.count} transactions`
        },
        {
          title: 'Total Growth',
          value: overall_summary.combined_revenue,
          change: '0%',
          trend: 'up',
          icon: FaChartBar,
          color: 'indigo',
          description: 'Combined performance'
        }
      ];
    }

    const { summary } = analyticsData;
    
    return [
      {
        title: 'Hotspot Performance',
        value: summary.revenue?.hotspot?.total || 0,
        change: formatGrowthRate(calculateGrowthRate(analyticsData, previousPeriodData, 'hotspot')),
        trend: getTrend(calculateGrowthRate(analyticsData, previousPeriodData, 'hotspot')),
        icon: FaWifi,
        color: 'blue',
        description: `${summary.revenue?.hotspot?.count || 0} transactions`
      },
      {
        title: 'PPPoE Performance',
        value: summary.revenue?.pppoe?.total || 0,
        change: formatGrowthRate(calculateGrowthRate(analyticsData, previousPeriodData, 'pppoe')),
        trend: getTrend(calculateGrowthRate(analyticsData, previousPeriodData, 'pppoe')),
        icon: FaNetworkWired,
        color: 'green',
        description: `${summary.revenue?.pppoe?.count || 0} transactions`
      },
      {
        title: 'Both Access Types',
        value: summary.revenue?.both?.total || 0,
        change: formatGrowthRate(calculateGrowthRate(analyticsData, previousPeriodData, 'both')),
        trend: getTrend(calculateGrowthRate(analyticsData, previousPeriodData, 'both')),
        icon: FaUsers,
        color: 'purple',
        description: `${summary.revenue?.both?.count || 0} transactions`
      },
      {
        title: 'Total Growth',
        value: (summary.revenue?.hotspot?.total || 0) + (summary.revenue?.pppoe?.total || 0) + (summary.revenue?.both?.total || 0),
        change: formatGrowthRate(calculateGrowthRate(analyticsData, previousPeriodData, 'combined')),
        trend: getTrend(calculateGrowthRate(analyticsData, previousPeriodData, 'combined')),
        icon: FaChartBar,
        color: 'indigo',
        description: 'Combined performance'
      }
    ];
  }, [analyticsData, previousPeriodData, access_type_breakdown, overall_summary]);

  const getColorClasses = (color) => {
    const colors = {
      blue: {
        bg: theme === "dark" ? "bg-blue-900/20" : "bg-blue-50",
        border: theme === "dark" ? "border-blue-700" : "border-blue-200",
        text: theme === "dark" ? "text-blue-300" : "text-blue-700",
        icon: theme === "dark" ? "text-blue-400" : "text-blue-600"
      },
      green: {
        bg: theme === "dark" ? "bg-green-900/20" : "bg-green-50",
        border: theme === "dark" ? "border-green-700" : "border-green-200",
        text: theme === "dark" ? "text-green-300" : "text-green-700",
        icon: theme === "dark" ? "text-green-400" : "text-green-600"
      },
      purple: {
        bg: theme === "dark" ? "bg-purple-900/20" : "bg-purple-50",
        border: theme === "dark" ? "border-purple-700" : "border-purple-200",
        text: theme === "dark" ? "text-purple-300" : "text-purple-700",
        icon: theme === "dark" ? "text-purple-400" : "text-purple-600"
      },
      indigo: {
        bg: theme === "dark" ? "bg-indigo-900/20" : "bg-indigo-50",
        border: theme === "dark" ? "border-indigo-700" : "border-indigo-200",
        text: theme === "dark" ? "text-indigo-300" : "text-indigo-700",
        icon: theme === "dark" ? "text-indigo-400" : "text-indigo-600"
      }
    };
    return colors[color] || colors.blue;
  };

  // Algorithm: Real chart data processing
  const RevenueTrendChart = () => {
    if (!analyticsData?.revenue_trends || loading) {
      return (
        <div className={`h-64 rounded-lg border-2 border-dashed flex items-center justify-center ${
          theme === "dark" ? "border-gray-600" : "border-gray-300"
        }`}>
          <div className="text-center">
            <FaSpinner className={`animate-spin w-12 h-12 mx-auto mb-2 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`} />
            <p className={theme === "dark" ? "text-gray-400" : "text-gray-500"}>
              Loading chart data...
            </p>
          </div>
        </div>
      );
    }

    const { dates, hotspot, pppoe, both } = analyticsData.revenue_trends;
    
    return (
      <div className="h-64">
        {/* Simple SVG-based chart implementation */}
        <svg width="100%" height="100%" viewBox="0 0 400 200" className="overflow-visible">
          {/* Grid lines */}
          {[0, 50, 100, 150, 200].map((y) => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="400"
              y2={y}
              stroke={theme === "dark" ? "#374151" : "#e5e7eb"}
              strokeWidth="1"
            />
          ))}
          
          {/* Hotspot line */}
          {hotspot.map((value, index) => {
            const x = (index / (hotspot.length - 1)) * 380 + 20;
            const y = 200 - (value / Math.max(...hotspot, ...pppoe, ...both)) * 180;
            const nextX = ((index + 1) / (hotspot.length - 1)) * 380 + 20;
            const nextY = 200 - (hotspot[index + 1] / Math.max(...hotspot, ...pppoe, ...both)) * 180;
            
            return (
              <g key={index}>
                <circle cx={x} cy={y} r="3" fill="#3b82f6" />
                {index < hotspot.length - 1 && (
                  <line
                    x1={x}
                    y1={y}
                    x2={nextX}
                    y2={nextY}
                    stroke="#3b82f6"
                    strokeWidth="2"
                  />
                )}
              </g>
            );
          })}
          
          {/* PPPoE line */}
          {pppoe.map((value, index) => {
            const x = (index / (pppoe.length - 1)) * 380 + 20;
            const y = 200 - (value / Math.max(...hotspot, ...pppoe, ...both)) * 180;
            const nextX = ((index + 1) / (pppoe.length - 1)) * 380 + 20;
            const nextY = 200 - (pppoe[index + 1] / Math.max(...hotspot, ...pppoe, ...both)) * 180;
            
            return (
              <g key={index}>
                <circle cx={x} cy={y} r="3" fill="#10b981" />
                {index < pppoe.length - 1 && (
                  <line
                    x1={x}
                    y1={y}
                    x2={nextX}
                    y2={nextY}
                    stroke="#10b981"
                    strokeWidth="2"
                  />
                )}
              </g>
            );
          })}
          
          {/* Both line */}
          {both.map((value, index) => {
            const x = (index / (both.length - 1)) * 380 + 20;
            const y = 200 - (value / Math.max(...hotspot, ...pppoe, ...both)) * 180;
            const nextX = ((index + 1) / (both.length - 1)) * 380 + 20;
            const nextY = 200 - (both[index + 1] / Math.max(...hotspot, ...pppoe, ...both)) * 180;
            
            return (
              <g key={index}>
                <circle cx={x} cy={y} r="3" fill="#8b5cf6" />
                {index < both.length - 1 && (
                  <line
                    x1={x}
                    y1={y}
                    x2={nextX}
                    y2={nextY}
                    stroke="#8b5cf6"
                    strokeWidth="2"
                  />
                )}
              </g>
            );
          })}
        </svg>
        
        <div className="flex justify-between text-xs mt-2 px-4">
          {dates && dates.length > 0 && (
            <>
              <span className={theme === "dark" ? "text-gray-400" : "text-gray-500"}>
                {dates[0]}
              </span>
              <span className={theme === "dark" ? "text-gray-400" : "text-gray-500"}>
                {dates[dates.length - 1]}
              </span>
            </>
          )}
        </div>
        
        <div className="flex justify-center space-x-4 mt-2">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded mr-1"></div>
            <span className="text-xs">Hotspot</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded mr-1"></div>
            <span className="text-xs">PPPoE</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-purple-500 rounded mr-1"></div>
            <span className="text-xs">Both</span>
          </div>
        </div>
      </div>
    );
  };

  const ProfitabilityTable = () => {
    if (!analyticsData?.summary) {
      return (
        <div className="text-center py-8">
          <FaSpinner className={`animate-spin w-8 h-8 mx-auto mb-2 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`} />
          <p className={theme === "dark" ? "text-gray-400" : "text-gray-500"}>Loading profitability data...</p>
        </div>
      );
    }

    const { summary } = analyticsData;
    
    return (
      <div className="overflow-x-auto">
        <table className={`min-w-full divide-y ${theme === "dark" ? "divide-gray-700" : "divide-gray-200"}`}>
          <thead>
            <tr>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                theme === "dark" ? "text-gray-300" : "text-gray-500"
              }`}>
                Access Type
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                theme === "dark" ? "text-gray-300" : "text-gray-500"
              }`}>
                Revenue
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                theme === "dark" ? "text-gray-300" : "text-gray-500"
              }`}>
                Expenses
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                theme === "dark" ? "text-gray-300" : "text-gray-500"
              }`}>
                Profit
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                theme === "dark" ? "text-gray-300" : "text-gray-500"
              }`}>
                Margin
              </th>
            </tr>
          </thead>
          <tbody className={`divide-y ${theme === "dark" ? "divide-gray-700" : "divide-gray-200"}`}>
            {Object.entries(summary.profitability || {}).map(([accessType, data]) => {
              const margin = data.revenue > 0 ? (data.profit / data.revenue) * 100 : 0;
              const isProfitable = margin >= 0;
              
              return (
                <tr 
                  key={accessType}
                  className={`transition-colors duration-200 ${
                    theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-50"
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <AccessTypeBadge accessType={accessType} theme={theme} />
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap font-medium ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}>
                    KES {data.revenue.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap ${
                    theme === "dark" ? "text-gray-300" : "text-gray-600"
                  }`}>
                    KES {data.expenses.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap font-semibold ${
                    isProfitable 
                      ? (theme === "dark" ? "text-green-400" : "text-green-600")
                      : (theme === "dark" ? "text-red-400" : "text-red-600")
                  }`}>
                    KES {data.profit.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className={`font-semibold ${
                        isProfitable 
                          ? (theme === "dark" ? "text-green-400" : "text-green-600")
                          : (theme === "dark" ? "text-red-400" : "text-red-600")
                      }`}>
                        {margin.toFixed(1)}%
                      </span>
                      {isProfitable ? (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className={`${cardClass} p-6 transition-colors duration-300`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <h2 className={`text-xl font-semibold ${theme === "dark" ? "text-white" : "text-gray-800"} flex items-center`}>
            <FaChartBar className="mr-2" /> Access Type Analytics
          </h2>
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <EnhancedSelect
              value={timeRange}
              onChange={(value) => {
                setTimeRange(value);
                fetchAnalyticsData(value);
              }}
              options={timeRangeOptions}
              placeholder="Time Range"
              theme={theme}
              className="w-40"
              disabled={loading}
            />
            
            <EnhancedSelect
              value={chartType}
              onChange={setChartType}
              options={chartTypeOptions}
              placeholder="Chart Type"
              theme={theme}
              className="w-40"
            />
            
            <button
              onClick={() => toast.success('Export feature would be implemented here')}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors duration-300 ${
                theme === "dark" 
                  ? "bg-gray-700 hover:bg-gray-600 text-white" 
                  : "bg-gray-200 hover:bg-gray-300 text-gray-800"
              }`}
            >
              <FaDownload className="mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {analyticsCards.map((card, index) => {
          const IconComponent = card.icon;
          const colorClasses = getColorClasses(card.color);
          
          return (
            <div 
              key={index}
              className={`${cardClass} p-6 border-l-4 ${colorClasses.border} transition-all duration-300 hover:shadow-lg`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${colorClasses.bg}`}>
                  <IconComponent className={`text-xl ${colorClasses.icon}`} />
                </div>
                <div className="flex items-center space-x-1">
                  {card.trend === 'up' ? (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  )}
                  <span className={`text-sm font-medium ${
                    card.trend === 'up' ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {card.change}
                  </span>
                </div>
              </div>
              
              <h3 className={`text-sm font-medium ${colorClasses.text} mb-1`}>
                {card.title}
              </h3>
              <p className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-800"} mb-1`}>
                KES {card.value.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
              </p>
              <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                {card.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`${cardClass} p-6 lg:col-span-2 transition-colors duration-300`}>
          <h3 className={`text-lg font-semibold mb-4 ${theme === "dark" ? "text-white" : "text-gray-800"} flex items-center`}>
            <LineChart className="mr-2" /> Revenue Trends
          </h3>
          <RevenueTrendChart />
        </div>

        <div className={`${cardClass} p-6 transition-colors duration-300`}>
          <h3 className={`text-lg font-semibold mb-4 ${theme === "dark" ? "text-white" : "text-gray-800"} flex items-center`}>
            <PieChart className="mr-2" /> Distribution
          </h3>
          {analyticsData?.summary ? (
            <div className="space-y-4">
              {Object.entries(analyticsData.summary.revenue || {}).map(([accessType, data]) => {
                const totalRevenue = analyticsCards[3]?.value || 1;
                const percentage = totalRevenue > 0 ? (data.total / totalRevenue) * 100 : 0;
                
                return (
                  <div key={accessType} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center space-x-3">
                      <AccessTypeBadge accessType={accessType} theme={theme} size="sm" />
                      <span className="font-medium text-sm">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                    <span className="text-sm font-semibold">
                      KES {data.total.toLocaleString('en-KE')}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <FaSpinner className={`animate-spin w-8 h-8 mx-auto mb-2 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`} />
              <p className={theme === "dark" ? "text-gray-400" : "text-gray-500"}>Loading distribution data...</p>
            </div>
          )}
        </div>
      </div>

      {/* Profitability Table */}
      <div className={`${cardClass} p-6 transition-colors duration-300`}>
        <h3 className={`text-lg font-semibold mb-4 ${theme === "dark" ? "text-white" : "text-gray-800"} flex items-center`}>
          <BarChart3 className="mr-2" /> Profitability Analysis
        </h3>
        <ProfitabilityTable />
      </div>

      {/* Insights Section */}
      {analyticsData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`${cardClass} p-6 transition-colors duration-300`}>
            <h3 className={`text-lg font-semibold mb-4 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
              Key Insights
            </h3>
            <div className="space-y-3">
              {analyticsCards.map((card, index) => {
                const isPositive = card.trend === 'up';
                const insightColor = isPositive ? 'green' : 'red';
                
                return (
                  <div key={index} className={`p-3 rounded-lg border ${
                    theme === "dark" 
                      ? `border-${insightColor}-700 bg-${insightColor}-900/20` 
                      : `border-${insightColor}-200 bg-${insightColor}-50`
                  }`}>
                    <h4 className={`font-semibold mb-1 ${
                      theme === "dark" ? `text-${insightColor}-300` : `text-${insightColor}-700`
                    }`}>
                      {card.title}
                    </h4>
                    <p className={`text-sm ${
                      theme === "dark" ? `text-${insightColor}-200` : `text-${insightColor}-600`
                    }`}>
                      {card.title} {isPositive ? 'increased' : 'decreased'} by {card.change} compared to previous period.
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className={`${cardClass} p-6 transition-colors duration-300`}>
            <h3 className={`text-lg font-semibold mb-4 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
              Recommendations
            </h3>
            <div className="space-y-3">
              <div className={`p-3 rounded-lg border ${
                theme === "dark" ? "border-purple-700 bg-purple-900/20" : "border-purple-200 bg-purple-50"
              }`}>
                <h4 className={`font-semibold mb-1 ${theme === "dark" ? "text-purple-300" : "text-purple-700"}`}>
                  Growth Strategy
                </h4>
                <ul className={`text-sm space-y-1 ${theme === "dark" ? "text-purple-200" : "text-purple-600"}`}>
                  <li>• Increase marketing for high-performing access types</li>
                  <li>• Bundle hotspot and PPPoE offerings</li>
                  <li>• Optimize pricing for combined access</li>
                </ul>
              </div>
              
              <div className={`p-3 rounded-lg border ${
                theme === "dark" ? "border-yellow-700 bg-yellow-900/20" : "border-yellow-200 bg-yellow-50"
              }`}>
                <h4 className={`font-semibold mb-1 ${theme === "dark" ? "text-yellow-300" : "text-yellow-700"}`}>
                  Optimization
                </h4>
                <ul className={`text-sm space-y-1 ${theme === "dark" ? "text-yellow-200" : "text-yellow-600"}`}>
                  <li>• Monitor hotspot capacity during peak hours</li>
                  <li>• Enhance PPPoE reliability features</li>
                  <li>• Develop cross-selling strategies</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccessTypeAnalytics;