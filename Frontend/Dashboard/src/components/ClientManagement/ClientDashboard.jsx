// import React, { useMemo } from 'react';
// import {
//   FiUsers,
//   FiPhone,
//   FiDollarSign,
//   FiTrendingUp,
//   FiTrendingDown,
//   FiActivity,
//   FiAlertCircle,
//   FiCheckCircle,
//   FiBarChart2,
//   FiGlobe,
//   FiCreditCard,
//   FiRefreshCw
// } from 'react-icons/fi';

// const ClientDashboard = ({ data, theme, onFilterChange }) => {
//   const themeClasses = {
//     container: theme === 'dark' 
//       ? 'bg-gray-800 border-gray-700 text-gray-100' 
//       : 'bg-white border-gray-200 text-gray-900',
//     card: theme === 'dark'
//       ? 'bg-gray-900/50 border-gray-700'
//       : 'bg-gray-50 border-gray-200',
//     heading: theme === 'dark' ? 'text-white' : 'text-gray-800',
//     subheading: theme === 'dark' ? 'text-gray-300' : 'text-gray-600',
//     muted: theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
//   };

//   // Process dashboard data
//   const processedData = useMemo(() => {
//     if (!data) return null;

//     const {
//       summary = {},
//       financial = {},
//       usage = {},
//       client_analytics = {},
//       hotspot_analytics = {},
//       alerts = []
//     } = data;

//     // Calculate growth indicators
//     const calculateTrend = (current, previous) => {
//       if (!previous || previous === 0) return { direction: 'neutral', percentage: 0 };
//       const change = ((current - previous) / previous) * 100;
//       return {
//         direction: change >= 0 ? 'up' : 'down',
//         percentage: Math.abs(change).toFixed(1),
//         value: change
//       };
//     };

//     return {
//       summary: {
//         total_clients: summary.total_clients || 0,
//         active_clients: summary.active_clients || 0,
//         new_clients: summary.new_clients || 0,
//         at_risk_clients: summary.at_risk_clients || 0,
//         marketers_count: summary.marketers_count || 0,
//         revenue: summary.revenue || { total: 0, monthly_avg: 0, commission_pool: 0 },
//         growth_rate: summary.growth_rate || 0
//       },
//       financial: {
//         revenue_segments: financial.revenue_segments || [],
//         top_clients: financial.top_clients || [],
//         metrics: financial.metrics || {}
//       },
//       usage: {
//         usage_patterns: usage.usage_patterns || [],
//         top_users: usage.top_users || [],
//         metrics: usage.metrics || {}
//       },
//       client_analytics: {
//         connection_distribution: client_analytics.connection_distribution || [],
//         tier_distribution: client_analytics.tier_distribution || [],
//         client_type_distribution: client_analytics.client_type_distribution || [],
//         retention_metrics: client_analytics.retention_metrics || {}
//       },
//       hotspot_analytics: hotspot_analytics || {},
//       alerts: alerts || []
//     };
//   }, [data]);

//   if (!processedData) {
//     return (
//       <div className={`rounded-xl border p-8 text-center ${themeClasses.container}`}>
//         <FiRefreshCw className="animate-spin text-2xl mx-auto mb-4 text-blue-500" />
//         <p className={themeClasses.subheading}>Loading dashboard data...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {/* Quick Stats Grid */}
//       <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
//         {/* Total Clients */}
//         <div 
//           onClick={() => onFilterChange('status', 'all')}
//           className={`col-span-2 p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] ${themeClasses.card}`}
//         >
//           <div className="flex items-center justify-between">
//             <div>
//               <p className={`text-sm ${themeClasses.muted} mb-1`}>Total Clients</p>
//               <p className={`text-2xl font-bold ${themeClasses.heading}`}>
//                 {processedData.summary.total_clients.toLocaleString()}
//               </p>
//             </div>
//             <div className={`p-2 rounded-lg ${
//               theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-100'
//             }`}>
//               <FiUsers size={24} className="text-blue-500" />
//             </div>
//           </div>
//           <div className="flex items-center gap-2 mt-2">
//             <FiActivity size={14} className={themeClasses.muted} />
//             <span className={`text-xs ${themeClasses.muted}`}>
//               {processedData.summary.active_clients} active
//             </span>
//           </div>
//         </div>

//         {/* Active Clients */}
//         <div 
//           onClick={() => onFilterChange('status', 'active')}
//           className={`p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] ${themeClasses.card}`}
//         >
//           <div className="flex items-center justify-between">
//             <div>
//               <p className={`text-sm ${themeClasses.muted} mb-1`}>Active</p>
//               <p className={`text-xl font-bold text-green-500`}>
//                 {processedData.summary.active_clients.toLocaleString()}
//               </p>
//             </div>
//             <FiCheckCircle size={20} className="text-green-500" />
//           </div>
//         </div>

//         {/* At Risk */}
//         <div 
//           onClick={() => onFilterChange('at_risk', 'true')}
//           className={`p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] ${themeClasses.card}`}
//         >
//           <div className="flex items-center justify-between">
//             <div>
//               <p className={`text-sm ${themeClasses.muted} mb-1`}>At Risk</p>
//               <p className={`text-xl font-bold text-red-500`}>
//                 {processedData.summary.at_risk_clients.toLocaleString()}
//               </p>
//             </div>
//             <FiAlertCircle size={20} className="text-red-500" />
//           </div>
//         </div>

//         {/* New Today */}
//         <div 
//           onClick={() => onFilterChange('date_from', new Date().toISOString().split('T')[0])}
//           className={`p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] ${themeClasses.card}`}
//         >
//           <div className="flex items-center justify-between">
//             <div>
//               <p className={`text-sm ${themeClasses.muted} mb-1`}>New Today</p>
//               <p className={`text-xl font-bold text-blue-500`}>
//                 {processedData.summary.new_clients.toLocaleString()}
//               </p>
//             </div>
//             <FiTrendingUp size={20} className="text-blue-500" />
//           </div>
//         </div>

//         {/* Total Revenue */}
//         <div className={`col-span-2 p-4 rounded-xl border ${themeClasses.card}`}>
//           <div className="flex items-center justify-between">
//             <div>
//               <p className={`text-sm ${themeClasses.muted} mb-1`}>Total Revenue</p>
//               <p className={`text-2xl font-bold ${themeClasses.heading}`}>
//                 KES {Math.round(processedData.summary.revenue.total).toLocaleString()}
//               </p>
//             </div>
//             <div className={`p-2 rounded-lg ${
//               theme === 'dark' ? 'bg-green-900/30' : 'bg-green-100'
//             }`}>
//               <FiDollarSign size={24} className="text-green-500" />
//             </div>
//           </div>
//           <div className="flex items-center gap-2 mt-2">
//             <span className={`text-xs ${themeClasses.muted}`}>
//               Avg: KES {Math.round(processedData.summary.revenue.monthly_avg).toLocaleString()}/mo
//             </span>
//           </div>
//         </div>
//       </div>

//       {/* Distribution Stats */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {/* Connection Distribution */}
//         {processedData.client_analytics.connection_distribution.length > 0 && (
//           <div className={`p-5 rounded-xl border ${themeClasses.card}`}>
//             <h3 className={`font-semibold mb-4 flex items-center gap-2 ${themeClasses.heading}`}>
//               <FiGlobe />
//               Connection Types
//             </h3>
//             <div className="space-y-3">
//               {processedData.client_analytics.connection_distribution.map((item, index) => (
//                 <div key={index} className="flex items-center justify-between">
//                   <span className={`text-sm ${themeClasses.subheading}`}>
//                     {item.user__connection_type || 'Unknown'}
//                   </span>
//                   <div className="flex items-center gap-3">
//                     <span className={`font-medium ${themeClasses.heading}`}>
//                       {item.count}
//                     </span>
//                     <div className="w-20 bg-gray-700 rounded-full h-2">
//                       <div 
//                         className="h-full bg-blue-500 rounded-full"
//                         style={{ width: `${item.percentage || 0}%` }}
//                       />
//                     </div>
//                     <span className={`text-xs ${themeClasses.muted}`}>
//                       {item.percentage ? item.percentage.toFixed(1) : 0}%
//                     </span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Tier Distribution */}
//         {processedData.client_analytics.tier_distribution.length > 0 && (
//           <div className={`p-5 rounded-xl border ${themeClasses.card}`}>
//             <h3 className={`font-semibold mb-4 flex items-center gap-2 ${themeClasses.heading}`}>
//               <FiBarChart2 />
//               Tier Distribution
//             </h3>
//             <div className="space-y-3">
//               {processedData.client_analytics.tier_distribution.map((item, index) => {
//                 const colors = {
//                   vip: 'bg-purple-500',
//                   diamond: 'bg-blue-500',
//                   platinum: 'bg-emerald-500',
//                   gold: 'bg-yellow-500',
//                   silver: 'bg-gray-400',
//                   bronze: 'bg-orange-500',
//                   new: 'bg-gray-500'
//                 };
                
//                 return (
//                   <div key={index} className="flex items-center justify-between">
//                     <div className="flex items-center gap-2">
//                       <div className={`w-2 h-2 rounded-full ${colors[item.tier] || 'bg-gray-500'}`} />
//                       <span className={`text-sm capitalize ${themeClasses.subheading}`}>
//                         {item.tier}
//                       </span>
//                     </div>
//                     <div className="flex items-center gap-3">
//                       <span className={`font-medium ${themeClasses.heading}`}>
//                         {item.count}
//                       </span>
//                       <span className={`text-xs ${themeClasses.muted}`}>
//                         KES {Math.round(item.avg_revenue || 0).toLocaleString()} avg
//                       </span>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         )}

//         {/* Revenue Segments */}
//         {processedData.financial.revenue_segments.length > 0 && (
//           <div className={`p-5 rounded-xl border ${themeClasses.card}`}>
//             <h3 className={`font-semibold mb-4 flex items-center gap-2 ${themeClasses.heading}`}>
//               <FiCreditCard />
//               Revenue Segments
//             </h3>
//             <div className="space-y-3">
//               {processedData.financial.revenue_segments.map((segment, index) => {
//                 const colors = {
//                   premium: 'bg-yellow-500',
//                   high: 'bg-purple-500',
//                   medium: 'bg-blue-500',
//                   low: 'bg-gray-500'
//                 };
                
//                 return (
//                   <div key={index} className="flex items-center justify-between">
//                     <div className="flex items-center gap-2">
//                       <div className={`w-2 h-2 rounded-full ${colors[segment.revenue_segment] || 'bg-gray-500'}`} />
//                       <span className={`text-sm capitalize ${themeClasses.subheading}`}>
//                         {segment.revenue_segment}
//                       </span>
//                     </div>
//                     <div className="flex items-center gap-3">
//                       <span className={`font-medium ${themeClasses.heading}`}>
//                         {segment.count}
//                       </span>
//                       <span className={`text-xs ${themeClasses.muted}`}>
//                         KES {Math.round(segment.total_revenue || 0).toLocaleString()}
//                       </span>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Alerts */}
//       {processedData.alerts.length > 0 && (
//         <div className={`rounded-xl border p-5 ${themeClasses.card}`}>
//           <h3 className={`font-semibold mb-4 flex items-center gap-2 ${themeClasses.heading}`}>
//             <FiAlertCircle className="text-red-500" />
//             System Alerts
//           </h3>
//           <div className="space-y-3">
//             {processedData.alerts.map((alert, index) => (
//               <div
//                 key={index}
//                 className={`p-3 rounded-lg ${
//                   alert.severity === 'high'
//                     ? 'bg-red-900/20 border border-red-800/30'
//                     : 'bg-yellow-900/20 border border-yellow-800/30'
//                 }`}
//               >
//                 <div className="flex items-start justify-between">
//                   <div>
//                     <p className="font-medium text-sm mb-1">{alert.title}</p>
//                     <p className="text-xs opacity-80">{alert.description}</p>
//                   </div>
//                   <span className={`text-xs px-2 py-1 rounded ${
//                     alert.severity === 'high'
//                       ? 'bg-red-500 text-white'
//                       : 'bg-yellow-500 text-white'
//                   }`}>
//                     {alert.severity}
//                   </span>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ClientDashboard;








// components/ClientManagement/ClientDashboard.jsx
import React, { useMemo } from 'react';
import {
  FiUsers,
  FiPhone,
  FiDollarSign,
  FiTrendingUp,
  FiTrendingDown,
  FiActivity,
  FiAlertCircle,
  FiCheckCircle,
  FiBarChart2,
  FiGlobe,
  FiCreditCard,
  FiRefreshCw
} from 'react-icons/fi';
import { getThemeClasses } from '../ServiceManagement/Shared/components'

const ClientDashboard = ({ data, theme, onFilterChange }) => {
  const themeClasses = getThemeClasses(theme);

  // Process dashboard data with memoization
  const processedData = useMemo(() => {
    if (!data) return null;
    const {
      summary = {},
      financial = {},
      usage = {},
      client_analytics = {},
      hotspot_analytics = {},
      alerts = []
    } = data;

    // Calculate trend
    const calculateTrend = (current, previous) => {
      if (!previous || previous === 0) return { direction: 'neutral', percentage: 0 };
      const change = ((current - previous) / previous) * 100;
      return {
        direction: change >= 0 ? 'up' : 'down',
        percentage: Math.abs(change).toFixed(1),
        value: change
      };
    };

    return {
      summary: {
        total_clients: summary.total_clients || 0,
        active_clients: summary.active_clients || 0,
        new_clients: summary.new_clients || 0,
        at_risk_clients: summary.at_risk_clients || 0,
        marketers_count: summary.marketers_count || 0,
        revenue: summary.revenue || { total: 0, monthly_avg: 0, commission_pool: 0 },
        growth_rate: summary.growth_rate || 0
      },
      financial,
      usage,
      client_analytics,
      hotspot_analytics,
      alerts
    };
  }, [data]);

  if (!processedData) {
    return (
      <div className={`rounded-xl border p-8 text-center ${themeClasses.bg.card}`}>
        <FiRefreshCw className="animate-spin text-2xl mx-auto mb-4 text-blue-500" />
        <p className={themeClasses.text.secondary}>Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => onFilterChange('status', 'all')}
          className={`col-span-1 sm:col-span-2 lg:col-span-1 p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] ${themeClasses.bg.card}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${themeClasses.text.secondary} mb-1`}>Total Clients</p>
              <p className={`text-2xl font-bold ${themeClasses.text.primary}`}>
                {processedData.summary.total_clients.toLocaleString()}
              </p>
            </div>
            <div className={`${themeClasses.bg.info} p-2 rounded-lg`}>
              <FiUsers size={24} className="text-blue-500" />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <FiActivity size={14} className={themeClasses.text.secondary} />
            <span className={`text-xs ${themeClasses.text.secondary}`}>
              {processedData.summary.active_clients} active
            </span>
          </div>
        </div>
        <div
          onClick={() => onFilterChange('status', 'active')}
          className={`p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] ${themeClasses.bg.card}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${themeClasses.text.secondary} mb-1`}>Active</p>
              <p className={`text-xl font-bold text-green-500`}>
                {processedData.summary.active_clients.toLocaleString()}
              </p>
            </div>
            <FiCheckCircle size={20} className="text-green-500" />
          </div>
        </div>
        <div
          onClick={() => onFilterChange('at_risk', 'true')}
          className={`p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] ${themeClasses.bg.card}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${themeClasses.text.secondary} mb-1`}>At Risk</p>
              <p className={`text-xl font-bold text-red-500`}>
                {processedData.summary.at_risk_clients.toLocaleString()}
              </p>
            </div>
            <FiAlertCircle size={20} className="text-red-500" />
          </div>
        </div>
        <div
          onClick={() => onFilterChange('date_from', new Date().toISOString().split('T')[0])}
          className={`p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] ${themeClasses.bg.card}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${themeClasses.text.secondary} mb-1`}>New Today</p>
              <p className={`text-xl font-bold text-blue-500`}>
                {processedData.summary.new_clients.toLocaleString()}
              </p>
            </div>
            <FiTrendingUp size={20} className="text-blue-500" />
          </div>
        </div>
      </div>
      {/* Distribution Stats - Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Connection Distribution */}
        {processedData.client_analytics.connection_distribution.length > 0 && (
          <div className={`p-5 rounded-xl border ${themeClasses.bg.card}`}>
            <h3 className={`font-semibold mb-4 flex items-center gap-2 ${themeClasses.text.primary}`}>
              <FiGlobe />
              Connection Types
            </h3>
            <div className="space-y-3">
              {processedData.client_analytics.connection_distribution.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className={`text-sm ${themeClasses.text.secondary}`}>
                    {item.user__connection_type || 'Unknown'}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className={`font-medium ${themeClasses.text.primary}`}>
                      {item.count}
                    </span>
                    <div className="w-20 bg-gray-700 rounded-full h-2">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${item.percentage || 0}%` }}
                      />
                    </div>
                    <span className={`text-xs ${themeClasses.text.secondary}`}>
                      {item.percentage ? item.percentage.toFixed(1) : 0}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Tier Distribution */}
        {processedData.client_analytics.tier_distribution.length > 0 && (
          <div className={`p-5 rounded-xl border ${themeClasses.bg.card}`}>
            <h3 className={`font-semibold mb-4 flex items-center gap-2 ${themeClasses.text.primary}`}>
              <FiBarChart2 />
              Tier Distribution
            </h3>
            <div className="space-y-3">
              {processedData.client_analytics.tier_distribution.map((item, index) => {
                const colors = {
                  vip: 'bg-purple-500',
                  diamond: 'bg-blue-500',
                  platinum: 'bg-emerald-500',
                  gold: 'bg-yellow-500',
                  silver: 'bg-gray-400',
                  bronze: 'bg-orange-500',
                  new: 'bg-gray-500'
                };
                return (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${colors[item.tier] || 'bg-gray-500'}`} />
                      <span className={`text-sm capitalize ${themeClasses.text.secondary}`}>
                        {item.tier}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`font-medium ${themeClasses.text.primary}`}>
                        {item.count}
                      </span>
                      <span className={`text-xs ${themeClasses.text.secondary}`}>
                        KES {Math.round(item.avg_revenue || 0).toLocaleString()} avg
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {/* Revenue Segments */}
        {processedData.financial.revenue_segments.length > 0 && (
          <div className={`p-5 rounded-xl border ${themeClasses.bg.card}`}>
            <h3 className={`font-semibold mb-4 flex items-center gap-2 ${themeClasses.text.primary}`}>
              <FiCreditCard />
              Revenue Segments
            </h3>
            <div className="space-y-3">
              {processedData.financial.revenue_segments.map((segment, index) => {
                const colors = {
                  premium: 'bg-yellow-500',
                  high: 'bg-purple-500',
                  medium: 'bg-blue-500',
                  low: 'bg-gray-500'
                };
                return (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${colors[segment.revenue_segment] || 'bg-gray-500'}`} />
                      <span className={`text-sm capitalize ${themeClasses.text.secondary}`}>
                        {segment.revenue_segment}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`font-medium ${themeClasses.text.primary}`}>
                        {segment.count}
                      </span>
                      <span className={`text-xs ${themeClasses.text.secondary}`}>
                        KES {Math.round(segment.total_revenue || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      {/* Alerts */}
      {processedData.alerts.length > 0 && (
        <div className={`rounded-xl border p-5 ${themeClasses.bg.card}`}>
          <h3 className={`font-semibold mb-4 flex items-center gap-2 ${themeClasses.text.primary}`}>
            <FiAlertCircle className="text-red-500" />
            System Alerts
          </h3>
          <div className="space-y-3">
            {processedData.alerts.slice(0, 5).map((alert, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg ${
                  alert.severity === 'high' ? themeClasses.bg.danger : themeClasses.bg.warning
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-sm mb-1">{alert.title}</p>
                    <p className="text-xs opacity-80">{alert.description}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    alert.severity === 'high' ? themeClasses.text.danger : themeClasses.text.warning
                  }`}>
                    {alert.severity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDashboard;