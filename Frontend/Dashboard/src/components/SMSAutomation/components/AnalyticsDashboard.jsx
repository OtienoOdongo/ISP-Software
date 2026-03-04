





// import React, { useState, useEffect, useMemo, useCallback } from 'react';
// import {
//   BarChart3, TrendingUp, TrendingDown, PieChart, Calendar,
//   Filter, Download, RefreshCw, Users, MessageSquare, DollarSign,
//   Activity, Clock, CheckCircle, XCircle, AlertCircle, Globe,
//   Server, Smartphone, Zap, Target, Award, TrendingUp as TrendUp
// } from 'lucide-react';
// import api from '../../../api';
// import { 
//   formatCurrency, formatNumber, formatPercentage,
//   formatDate, formatDeliveryTime
// } from '../utils/formatters';

// // Chart components would be imported from a charting library like recharts
// // For now, we'll use placeholder divs

// const AnalyticsDashboard = ({ 
//   stats = {}, 
//   analytics = {}, 
//   loading, 
//   theme, 
//   detailed = false,
//   performanceData = {}
// }) => {
//   const [dateRange, setDateRange] = useState({
//     startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
//     endDate: new Date()
//   });
//   const [granularity, setGranularity] = useState('day');
//   const [chartData, setChartData] = useState([]);
//   const [selectedMetric, setSelectedMetric] = useState('volume');
//   const [exporting, setExporting] = useState(false);

//   // Fetch analytics data
//   const fetchAnalyticsData = useCallback(async () => {
//     try {
//       const response = await api.get('/api/sms/analytics/', {
//         params: {
//           start_date: dateRange.startDate.toISOString().split('T')[0],
//           end_date: dateRange.endDate.toISOString().split('T')[0],
//           group_by: granularity
//         }
//       });
      
//       setChartData(response.data.analytics || []);
//     } catch (error) {
//       console.error('Failed to fetch analytics:', error);
//     }
//   }, [dateRange, granularity]);

//   useEffect(() => {
//     fetchAnalyticsData();
//   }, [fetchAnalyticsData]);

//   // Process chart data
//   const processedData = useMemo(() => {
//     return chartData.map(item => ({
//       date: item.date,
//       messages: item.total_messages || 0,
//       delivered: item.delivered_messages || 0,
//       failed: item.failed_messages || 0,
//       successRate: item.delivery_rate || 0,
//       cost: item.total_cost || 0,
//       avgTime: item.avg_delivery_time_seconds || 0
//     }));
//   }, [chartData]);

//   // Gateway performance data
//   const gatewayData = useMemo(() => {
//     if (!analytics.gateway_metrics) return [];
    
//     return Object.entries(analytics.gateway_metrics).map(([name, metrics]) => ({
//       name,
//       messages: metrics.total || 0,
//       successRate: metrics.success_rate || 0,
//       cost: metrics.cost || 0,
//       delivered: metrics.delivered || 0,
//       failed: metrics.failed || 0
//     })).sort((a, b) => b.messages - a.messages);
//   }, [analytics]);

//   // Template performance data
//   const templateData = useMemo(() => {
//     if (!analytics.template_metrics) return [];
    
//     return Object.entries(analytics.template_metrics)
//       .map(([name, count]) => ({
//         name: name.length > 20 ? name.substring(0, 20) + '...' : name,
//         count
//       }))
//       .sort((a, b) => b.count - a.count)
//       .slice(0, 10);
//   }, [analytics]);

//   // Calculate key metrics
//   const keyMetrics = useMemo(() => {
//     const today = stats.today || { total: 0, delivered: 0, failed: 0, cost: 0 };
//     const month = stats.month || { total: 0, delivered: 0, failed: 0, cost: 0 };
    
//     return {
//       todayDeliveryRate: today.total > 0 ? (today.delivered / today.total) * 100 : 0,
//       monthDeliveryRate: month.total > 0 ? (month.delivered / month.total) * 100 : 0,
//       totalCost: month.cost || 0,
//       avgCostPerMessage: month.total > 0 ? (month.cost / month.total) : 0,
//       successTrend: month.delivered - (stats.yesterday?.delivered || 0),
//       failureTrend: month.failed - (stats.yesterday?.failed || 0)
//     };
//   }, [stats]);

//   // Handle export
//   const handleExport = useCallback(async (format = 'csv') => {
//     try {
//       setExporting(true);
//       const response = await api.get('/api/sms/analytics/export/', {
//         params: {
//           start_date: dateRange.startDate.toISOString().split('T')[0],
//           end_date: dateRange.endDate.toISOString().split('T')[0],
//           granularity,
//           format
//         },
//         responseType: 'blob'
//       });
      
//       const url = window.URL.createObjectURL(new Blob([response.data]));
//       const link = document.createElement('a');
//       link.href = url;
//       link.setAttribute('download', `sms_analytics_${new Date().toISOString().split('T')[0]}.${format}`);
//       document.body.appendChild(link);
//       link.click();
//       link.remove();
//       setExporting(false);
//     } catch (error) {
//       console.error('Export failed:', error);
//       setExporting(false);
//     }
//   }, [dateRange, granularity]);

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center py-12">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
//         <span className="ml-3">Loading analytics...</span>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//         <div>
//           <h2 className="text-lg font-semibold flex items-center gap-2">
//             <BarChart3 className="w-5 h-5 text-blue-500" />
//             Analytics Dashboard
//           </h2>
//           <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
//             Comprehensive SMS performance metrics and insights
//           </p>
//         </div>
        
//         <div className="flex items-center gap-2">
//           <div className="flex items-center gap-2">
//             <input
//               type="date"
//               value={dateRange.startDate.toISOString().split('T')[0]}
//               onChange={(e) => setDateRange(prev => ({ 
//                 ...prev, 
//                 startDate: new Date(e.target.value) 
//               }))}
//               className={`px-3 py-2 text-sm border rounded-lg ${
//                 theme === 'dark' 
//                   ? 'bg-gray-700 border-gray-600 text-white' 
//                   : 'bg-white border-gray-300'
//               }`}
//             />
//             <span>to</span>
//             <input
//               type="date"
//               value={dateRange.endDate.toISOString().split('T')[0]}
//               onChange={(e) => setDateRange(prev => ({ 
//                 ...prev, 
//                 endDate: new Date(e.target.value) 
//               }))}
//               className={`px-3 py-2 text-sm border rounded-lg ${
//                 theme === 'dark' 
//                   ? 'bg-gray-700 border-gray-600 text-white' 
//                   : 'bg-white border-gray-300'
//               }`}
//             />
//           </div>
          
//           <select
//             value={granularity}
//             onChange={(e) => setGranularity(e.target.value)}
//             className={`px-3 py-2 text-sm border rounded-lg ${
//               theme === 'dark' 
//                 ? 'bg-gray-700 border-gray-600 text-white' 
//                 : 'bg-white border-gray-300'
//             }`}
//           >
//             <option value="day">Daily</option>
//             <option value="week">Weekly</option>
//             <option value="month">Monthly</option>
//           </select>
          
//           <button
//             onClick={fetchAnalyticsData}
//             className={`p-2 rounded-lg ${
//               theme === 'dark' 
//                 ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
//                 : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
//             }`}
//             title="Refresh"
//           >
//             <RefreshCw className="w-4 h-4" />
//           </button>
          
//           <button
//             onClick={() => handleExport('csv')}
//             disabled={exporting}
//             className={`p-2 rounded-lg ${
//               theme === 'dark' 
//                 ? 'bg-blue-600 hover:bg-blue-700 text-white' 
//                 : 'bg-blue-500 hover:bg-blue-600 text-white'
//             }`}
//             title="Export"
//           >
//             {exporting ? (
//               <Loader className="w-4 h-4 animate-spin" />
//             ) : (
//               <Download className="w-4 h-4" />
//             )}
//           </button>
//         </div>
//       </div>

//       {/* Key Metrics Cards */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//         <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
//           <div className="flex items-center justify-between mb-2">
//             <span className="text-sm text-gray-500">Today's Messages</span>
//             <MessageSquare className="w-4 h-4 text-blue-500" />
//           </div>
//           <div className="text-2xl font-bold">{formatNumber(stats.today?.total || 0)}</div>
//           <div className="flex items-center gap-2 mt-2 text-xs">
//             <span className="text-green-500">{formatNumber(stats.today?.delivered || 0)} delivered</span>
//             <span className="text-gray-400">•</span>
//             <span className="text-red-500">{formatNumber(stats.today?.failed || 0)} failed</span>
//           </div>
//         </div>

//         <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
//           <div className="flex items-center justify-between mb-2">
//             <span className="text-sm text-gray-500">Delivery Rate</span>
//             <Target className="w-4 h-4 text-green-500" />
//           </div>
//           <div className="text-2xl font-bold">{formatPercentage(keyMetrics.todayDeliveryRate)}</div>
//           <div className="flex items-center gap-1 mt-2 text-xs">
//             {keyMetrics.successTrend > 0 ? (
//               <TrendingUp className="w-3 h-3 text-green-500" />
//             ) : (
//               <TrendingDown className="w-3 h-3 text-red-500" />
//             )}
//             <span className={keyMetrics.successTrend > 0 ? 'text-green-500' : 'text-red-500'}>
//               {Math.abs(keyMetrics.successTrend).toFixed(1)}% vs yesterday
//             </span>
//           </div>
//         </div>

//         <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
//           <div className="flex items-center justify-between mb-2">
//             <span className="text-sm text-gray-500">Monthly Cost</span>
//             <DollarSign className="w-4 h-4 text-yellow-500" />
//           </div>
//           <div className="text-2xl font-bold">{formatCurrency(keyMetrics.totalCost)}</div>
//           <div className="text-xs mt-2 text-gray-500">
//             Avg {formatCurrency(keyMetrics.avgCostPerMessage)} per message
//           </div>
//         </div>

//         <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
//           <div className="flex items-center justify-between mb-2">
//             <span className="text-sm text-gray-500">Active Gateways</span>
//             <Server className="w-4 h-4 text-purple-500" />
//           </div>
//           <div className="text-2xl font-bold">
//             {stats.gateways?.online || 0}/{stats.gateways?.total || 0}
//           </div>
//           <div className="text-xs mt-2 text-gray-500">
//             {stats.gateways?.healthy || 0} healthy • {performanceData.gatewayHealth || 0}% health score
//           </div>
//         </div>
//       </div>

//       {/* Metric Selector */}
//       <div className="flex gap-2 overflow-x-auto pb-2">
//         {['volume', 'delivery', 'cost', 'performance'].map((metric) => (
//           <button
//             key={metric}
//             onClick={() => setSelectedMetric(metric)}
//             className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
//               selectedMetric === metric
//                 ? theme === 'dark'
//                   ? 'bg-blue-600 text-white'
//                   : 'bg-blue-500 text-white'
//                 : theme === 'dark'
//                 ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
//                 : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//             }`}
//           >
//             {metric.charAt(0).toUpperCase() + metric.slice(1)} Trend
//           </button>
//         ))}
//       </div>

//       {/* Chart Area - Placeholder for actual charts */}
//       <div className={`p-6 rounded-lg border ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
//         <div className="flex items-center justify-between mb-4">
//           <h3 className="font-medium">
//             {selectedMetric === 'volume' && 'Message Volume Over Time'}
//             {selectedMetric === 'delivery' && 'Delivery Rate Trend'}
//             {selectedMetric === 'cost' && 'Cost Analysis'}
//             {selectedMetric === 'performance' && 'Performance Metrics'}
//           </h3>
//           <div className="flex items-center gap-2">
//             <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
//               {granularity} data
//             </span>
//           </div>
//         </div>
        
//         <div className="h-64 flex items-center justify-center border-2 border-dashed rounded-lg border-gray-300 dark:border-gray-600">
//           <div className="text-center">
//             <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-400" />
//             <p className="text-sm text-gray-500">Chart visualization would appear here</p>
//             <p className="text-xs text-gray-400 mt-1">
//               {processedData.length} data points from {formatDate(dateRange.startDate)} to {formatDate(dateRange.endDate)}
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Detailed Analytics */}
//       {detailed && (
//         <>
//           {/* Gateway Performance Table */}
//           <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
//             <h3 className="font-medium mb-4 flex items-center gap-2">
//               <Globe className="w-4 h-4 text-orange-500" />
//               Gateway Performance
//             </h3>
            
//             <div className="overflow-x-auto">
//               <table className="min-w-full">
//                 <thead>
//                   <tr className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
//                     <th className="text-left py-2">Gateway</th>
//                     <th className="text-right py-2">Messages</th>
//                     <th className="text-right py-2">Delivered</th>
//                     <th className="text-right py-2">Failed</th>
//                     <th className="text-right py-2">Success Rate</th>
//                     <th className="text-right py-2">Cost</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
//                   {gatewayData.map((gateway, index) => (
//                     <tr key={index} className="text-sm">
//                       <td className="py-2 font-medium">{gateway.name}</td>
//                       <td className="py-2 text-right">{formatNumber(gateway.messages)}</td>
//                       <td className="py-2 text-right text-green-500">{formatNumber(gateway.delivered)}</td>
//                       <td className="py-2 text-right text-red-500">{formatNumber(gateway.failed)}</td>
//                       <td className="py-2 text-right">
//                         <span className={gateway.successRate >= 80 ? 'text-green-500' : gateway.successRate >= 60 ? 'text-yellow-500' : 'text-red-500'}>
//                           {formatPercentage(gateway.successRate)}
//                         </span>
//                       </td>
//                       <td className="py-2 text-right">{formatCurrency(gateway.cost)}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>

//           {/* Template Usage */}
//           <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
//             <h3 className="font-medium mb-4 flex items-center gap-2">
//               <PieChart className="w-4 h-4 text-purple-500" />
//               Top Templates
//             </h3>
            
//             <div className="space-y-3">
//               {templateData.map((template, index) => {
//                 const percentage = (template.count / (analytics.total_messages || 1)) * 100;
//                 return (
//                   <div key={index} className="flex items-center gap-3">
//                     <span className="text-sm w-6 text-right">{index + 1}.</span>
//                     <span className="text-sm flex-1 truncate" title={template.name}>
//                       {template.name}
//                     </span>
//                     <div className="flex items-center gap-2">
//                       <div className={`w-24 h-2 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
//                         <div 
//                           className="h-2 rounded-full bg-purple-500"
//                           style={{ width: `${percentage}%` }}
//                         />
//                       </div>
//                       <span className="text-sm w-16 text-right">{formatNumber(template.count)}</span>
//                       <span className="text-xs text-gray-500 w-12 text-right">
//                         {percentage.toFixed(1)}%
//                       </span>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>

//           {/* Peak Hours Analysis */}
//           <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
//             <h3 className="font-medium mb-4 flex items-center gap-2">
//               <Clock className="w-4 h-4 text-blue-500" />
//               Peak Hours Analysis
//             </h3>
            
//             <div className="space-y-2">
//               {analytics.peak_hour && (
//                 <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
//                   <div>
//                     <p className="text-sm font-medium">Peak Hour</p>
//                     <p className="text-xs text-gray-500">Highest message volume</p>
//                   </div>
//                   <div className="text-right">
//                     <p className="text-lg font-bold">{analytics.peak_hour}:00 - {analytics.peak_hour + 1}:00</p>
//                     <p className="text-sm text-blue-500">{formatNumber(analytics.messages_at_peak)} messages</p>
//                   </div>
//                 </div>
//               )}
              
//               <div className="grid grid-cols-2 gap-4 mt-4">
//                 <div className="text-center">
//                   <p className="text-sm text-gray-500">Best Performance</p>
//                   <p className="font-medium">{formatTimeAgo(analytics.best_day?.date)}</p>
//                   <p className="text-xs text-green-500">{formatPercentage(analytics.best_day?.delivery_rate)}</p>
//                 </div>
//                 <div className="text-center">
//                   <p className="text-sm text-gray-500">Worst Performance</p>
//                   <p className="font-medium">{formatTimeAgo(analytics.worst_day?.date)}</p>
//                   <p className="text-xs text-red-500">{formatPercentage(analytics.worst_day?.delivery_rate)}</p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </>
//       )}

//       {/* Summary Cards */}
//       <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           <div>
//             <h4 className="text-sm font-medium mb-2">Period Summary</h4>
//             <div className="space-y-1 text-sm">
//               <div className="flex justify-between">
//                 <span className="text-gray-500">Total Messages:</span>
//                 <span className="font-medium">{formatNumber(analytics.total_messages || 0)}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-gray-500">Delivered:</span>
//                 <span className="text-green-500">{formatNumber(analytics.delivered_messages || 0)}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-gray-500">Failed:</span>
//                 <span className="text-red-500">{formatNumber(analytics.failed_messages || 0)}</span>
//               </div>
//             </div>
//           </div>
          
//           <div>
//             <h4 className="text-sm font-medium mb-2">Performance</h4>
//             <div className="space-y-1 text-sm">
//               <div className="flex justify-between">
//                 <span className="text-gray-500">Delivery Rate:</span>
//                 <span className="font-medium">{formatPercentage(analytics.delivery_rate || 0)}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-gray-500">Success Rate:</span>
//                 <span className="font-medium">{formatPercentage(analytics.success_rate || 0)}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-gray-500">Avg Delivery:</span>
//                 <span className="font-medium">{formatDeliveryTime(analytics.avg_delivery_time_seconds)}</span>
//               </div>
//             </div>
//           </div>
          
//           <div>
//             <h4 className="text-sm font-medium mb-2">Cost Analysis</h4>
//             <div className="space-y-1 text-sm">
//               <div className="flex justify-between">
//                 <span className="text-gray-500">Total Cost:</span>
//                 <span className="font-medium">{formatCurrency(analytics.total_cost || 0)}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-gray-500">Avg Cost/Message:</span>
//                 <span className="font-medium">{formatCurrency(analytics.avg_cost_per_message || 0)}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-gray-500">Most Expensive:</span>
//                 <span className="font-medium">{analytics.highest_cost_gateway || 'N/A'}</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AnalyticsDashboard;










import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3, TrendingUp, TrendingDown, PieChart, Calendar,
  Download, RefreshCw, Users, MessageSquare, DollarSign,
  Activity, Clock, CheckCircle, XCircle, AlertCircle, Globe,
  Server, Zap, Target, Award, Cpu, Database, HardDrive
} from 'lucide-react';
import { EnhancedSelect, StatisticsCard, getThemeClasses } from '../../../components/ServiceManagement/Shared/components';
import {
  formatCurrency, formatNumber, formatPercentage,
  formatDate, formatTimeAgo, formatDeliveryTime
} from '../utils/formatters';

const AnalyticsDashboard = ({
  stats = {},
  analytics = {},
  gateways = [],
  messages = [],
  templates = [],
  queue = [],
  performanceData = {},
  detailed = false,
  loading,
  theme,
  themeClasses,
  onRefresh,
  onExport
}) => {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate: new Date()
  });
  const [granularity, setGranularity] = useState('day');
  const [selectedMetric, setSelectedMetric] = useState('volume');

  // Calculate real-time metrics
  const metrics = useMemo(() => {
    const today = stats.today || { total: 0, delivered: 0, failed: 0, cost: 0 };
    const month = stats.month || { total: 0, delivered: 0, failed: 0, cost: 0 };
    
    const totalSent = today.sent + today.delivered;
    const deliveryRate = totalSent > 0 ? (today.delivered / totalSent) * 100 : 0;
    
    const queueStats = {
      pending: queue.filter(q => q.status === 'pending').length,
      processing: queue.filter(q => q.status === 'processing').length,
      failed: queue.filter(q => q.status === 'failed').length
    };

    return {
      todayTotal: today.total || 0,
      todayDelivered: today.delivered || 0,
      todayFailed: today.failed || 0,
      todayCost: today.cost || 0,
      monthTotal: month.total || 0,
      monthDelivered: month.delivered || 0,
      monthFailed: month.failed || 0,
      monthCost: month.cost || 0,
      deliveryRate,
      queuePending: queueStats.pending,
      avgDeliveryTime: performanceData.avgDeliveryTime || 0,
      successRate: performanceData.successRate || 0,
      gatewaysOnline: gateways.filter(g => g.is_online).length,
      gatewaysTotal: gateways.length
    };
  }, [stats, gateways, queue, performanceData]);

  // Gateway performance data
  const gatewayPerformance = useMemo(() => {
    return gateways.map(gateway => ({
      name: gateway.name,
      type: gateway.gateway_type,
      messages: gateway.total_messages_sent || 0,
      successRate: gateway.success_rate || 0,
      balance: gateway.balance || 0,
      isOnline: gateway.is_online,
      costPerMessage: gateway.cost_per_message || 0
    }));
  }, [gateways]);

  // Template usage data
  const templateUsage = useMemo(() => {
    return templates
      .map(template => ({
        name: template.name,
        usage: template.usage_count || 0,
        type: template.template_type
      }))
      .sort((a, b) => b.usage - a.usage)
      .slice(0, 10);
  }, [templates]);

  // Chart data (simplified for demo)
  const chartData = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return {
        date: date.toLocaleDateString(),
        messages: Math.floor(Math.random() * 100) + 50,
        delivered: Math.floor(Math.random() * 80) + 40,
        failed: Math.floor(Math.random() * 10) + 5
      };
    }).reverse();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <span className={`ml-3 ${themeClasses.text.secondary}`}>Loading analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className={`text-lg font-semibold flex items-center gap-2 ${themeClasses.text.primary}`}>
            <BarChart3 className="w-5 h-5 text-indigo-500" />
            Analytics Dashboard
          </h2>
          <p className={`text-sm mt-1 ${themeClasses.text.secondary}`}>
            Comprehensive SMS performance metrics and insights
          </p>
        </div>

        <div className="flex items-center gap-2">
          <EnhancedSelect
            value={granularity}
            onChange={setGranularity}
            options={[
              { value: 'day', label: 'Daily' },
              { value: 'week', label: 'Weekly' },
              { value: 'month', label: 'Monthly' }
            ]}
            theme={theme}
            className="w-32"
          />

          <button
            onClick={onRefresh}
            className={`p-2 rounded-lg ${themeClasses.button.secondary}`}
            title="Refresh"
          >
            <RefreshCw size={18} />
          </button>

          <button
            onClick={() => onExport?.('csv')}
            className={`p-2 rounded-lg ${themeClasses.button.primary}`}
            title="Export"
          >
            <Download size={18} />
          </button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatisticsCard
          title="Today's Messages"
          value={metrics.todayTotal}
          icon={MessageSquare}
          theme={theme}
          format="number"
        />

        <StatisticsCard
          title="Delivery Rate"
          value={metrics.deliveryRate}
          icon={Target}
          theme={theme}
          format="percentage"
          trend={metrics.deliveryRate > 95 ? 'up' : metrics.deliveryRate > 80 ? 'neutral' : 'down'}
          change={5.2}
        />

        <StatisticsCard
          title="Monthly Cost"
          value={metrics.monthCost}
          icon={DollarSign}
          theme={theme}
          format="currency"
        />

        <StatisticsCard
          title="Gateway Health"
          value={gateways.length > 0 ? (metrics.gatewaysOnline / gateways.length) * 100 : 0}
          icon={Server}
          theme={theme}
          format="percentage"
        />
      </div>

      {/* Second Row Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={`p-3 rounded-lg ${themeClasses.bg.secondary}`}>
          <p className={`text-xs ${themeClasses.text.secondary}`}>Queue Pending</p>
          <p className={`text-xl font-bold ${metrics.queuePending > 0 ? 'text-yellow-500' : themeClasses.text.primary}`}>
            {metrics.queuePending}
          </p>
        </div>

        <div className={`p-3 rounded-lg ${themeClasses.bg.secondary}`}>
          <p className={`text-xs ${themeClasses.text.secondary}`}>Avg Delivery</p>
          <p className={`text-xl font-bold ${themeClasses.text.primary}`}>
            {formatDeliveryTime(metrics.avgDeliveryTime)}
          </p>
        </div>

        <div className={`p-3 rounded-lg ${themeClasses.bg.secondary}`}>
          <p className={`text-xs ${themeClasses.text.secondary}`}>Success Rate</p>
          <p className={`text-xl font-bold ${themeClasses.text.primary}`}>
            {formatPercentage(metrics.successRate)}
          </p>
        </div>

        <div className={`p-3 rounded-lg ${themeClasses.bg.secondary}`}>
          <p className={`text-xs ${themeClasses.text.secondary}`}>Gateways Online</p>
          <p className={`text-xl font-bold ${themeClasses.text.primary}`}>
            {metrics.gatewaysOnline}/{metrics.gatewaysTotal}
          </p>
        </div>
      </div>

      {/* Metric Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['volume', 'delivery', 'cost', 'performance'].map((metric) => (
          <button
            key={metric}
            onClick={() => setSelectedMetric(metric)}
            className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
              selectedMetric === metric
                ? themeClasses.button.primary
                : themeClasses.button.secondary
            }`}
          >
            {metric.charAt(0).toUpperCase() + metric.slice(1)} Trend
          </button>
        ))}
      </div>

      {/* Chart Area */}
      <div className={`p-6 rounded-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`font-medium ${themeClasses.text.primary}`}>
            {selectedMetric === 'volume' && 'Message Volume Over Time'}
            {selectedMetric === 'delivery' && 'Delivery Rate Trend'}
            {selectedMetric === 'cost' && 'Cost Analysis'}
            {selectedMetric === 'performance' && 'Performance Metrics'}
          </h3>
          <span className={`text-xs px-2 py-1 rounded ${themeClasses.bg.secondary} ${themeClasses.text.secondary}`}>
            {granularity} data
          </span>
        </div>

        {/* Simple Chart Visualization */}
        <div className="space-y-2">
          {chartData.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className={`text-xs w-20 ${themeClasses.text.secondary}`}>{item.date}</span>
              <div className="flex-1 h-8 flex gap-1">
                <div
                  className="h-full bg-green-500 rounded"
                  style={{ width: `${(item.delivered / item.messages) * 100}%` }}
                />
                <div
                  className="h-full bg-red-500 rounded"
                  style={{ width: `${(item.failed / item.messages) * 10}%` }}
                />
              </div>
              <span className={`text-xs w-16 text-right ${themeClasses.text.primary}`}>
                {item.messages}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Analytics */}
      {detailed && (
        <>
          {/* Gateway Performance */}
          <div className={`p-6 rounded-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
            <h3 className={`font-medium mb-4 flex items-center gap-2 ${themeClasses.text.primary}`}>
              <Globe className="w-4 h-4 text-orange-500" />
              Gateway Performance
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={themeClasses.bg.secondary}>
                  <tr>
                    <th className="p-2 text-left text-xs font-medium">Gateway</th>
                    <th className="p-2 text-right text-xs font-medium">Messages</th>
                    <th className="p-2 text-right text-xs font-medium">Success Rate</th>
                    <th className="p-2 text-right text-xs font-medium">Balance</th>
                    <th className="p-2 text-right text-xs font-medium">Cost/Message</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {gatewayPerformance.map((gateway, index) => (
                    <tr key={index}>
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${gateway.isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
                          <span className={`text-sm ${themeClasses.text.primary}`}>{gateway.name}</span>
                        </div>
                      </td>
                      <td className="p-2 text-right text-sm">{formatNumber(gateway.messages)}</td>
                      <td className="p-2 text-right text-sm">
                        <span className={
                          gateway.successRate >= 80 ? 'text-green-500' :
                          gateway.successRate >= 60 ? 'text-yellow-500' : 'text-red-500'
                        }>
                          {formatPercentage(gateway.successRate)}
                        </span>
                      </td>
                      <td className="p-2 text-right text-sm">{formatCurrency(gateway.balance)}</td>
                      <td className="p-2 text-right text-sm">{formatCurrency(gateway.costPerMessage)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Template Usage */}
          <div className={`p-6 rounded-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
            <h3 className={`font-medium mb-4 flex items-center gap-2 ${themeClasses.text.primary}`}>
              <PieChart className="w-4 h-4 text-purple-500" />
              Top Templates
            </h3>

            <div className="space-y-3">
              {templateUsage.map((template, index) => {
                const percentage = (template.usage / (stats.month?.total || 1)) * 100;
                return (
                  <div key={index} className="flex items-center gap-3">
                    <span className={`text-sm w-6 text-right ${themeClasses.text.secondary}`}>{index + 1}.</span>
                    <span className={`text-sm flex-1 truncate ${themeClasses.text.primary}`}>
                      {template.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className={`w-24 h-2 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        <div
                          className="h-2 rounded-full bg-purple-500"
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                      <span className={`text-sm w-16 text-right ${themeClasses.text.primary}`}>
                        {formatNumber(template.usage)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Performance Summary */}
          <div className={`p-6 rounded-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
            <h3 className={`font-medium mb-4 flex items-center gap-2 ${themeClasses.text.primary}`}>
              <Activity className="w-4 h-4 text-blue-500" />
              Performance Summary
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h4 className={`text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>Today's Summary</h4>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className={themeClasses.text.secondary}>Total:</span>
                    <span className={themeClasses.text.primary}>{formatNumber(metrics.todayTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={themeClasses.text.secondary}>Delivered:</span>
                    <span className="text-green-500">{formatNumber(metrics.todayDelivered)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={themeClasses.text.secondary}>Failed:</span>
                    <span className="text-red-500">{formatNumber(metrics.todayFailed)}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className={`text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>Monthly Summary</h4>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className={themeClasses.text.secondary}>Total:</span>
                    <span className={themeClasses.text.primary}>{formatNumber(metrics.monthTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={themeClasses.text.secondary}>Delivered:</span>
                    <span className="text-green-500">{formatNumber(metrics.monthDelivered)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={themeClasses.text.secondary}>Failed:</span>
                    <span className="text-red-500">{formatNumber(metrics.monthFailed)}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className={`text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>Cost Summary</h4>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className={themeClasses.text.secondary}>Today:</span>
                    <span className={themeClasses.text.primary}>{formatCurrency(metrics.todayCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={themeClasses.text.secondary}>Month:</span>
                    <span className={themeClasses.text.primary}>{formatCurrency(metrics.monthCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={themeClasses.text.secondary}>Avg/Message:</span>
                    <span className={themeClasses.text.primary}>
                      {metrics.monthTotal > 0 ? formatCurrency(metrics.monthCost / metrics.monthTotal) : formatCurrency(0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AnalyticsDashboard;