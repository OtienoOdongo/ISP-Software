


// import React, { useMemo } from 'react';
// import {
//   Users, Activity, AlertCircle, CheckCircle,
//   TrendingUp, TrendingDown, DollarSign, Globe,
//   BarChart3, CreditCard, Clock, Zap,
//   Wifi, Shield, Target, PieChart
// } from 'lucide-react';
// import Card from './UI/Card';
// import StatsCard from './UI/StatsCard';
// import AnalyticsChart from './AnalyticsChart';
// import { getThemeClasses } from '../ServiceManagement/Shared/components';
// import { formatCurrency } from './utils/formatters'

// const ClientDashboard = ({ data, theme, onFilterChange, loading = false }) => {
//   const themeClasses = getThemeClasses(theme);

//   // Process dashboard data
//   const processedData = useMemo(() => {
//     if (!data) return null;

//     const {
//       summary = {},
//       financial = {},
//       usage = {},
//       client_analytics = {},
//       hotspot_analytics = {},
//       plan_analytics = {},
//       alerts = []
//     } = data;

//     return {
//       summary: {
//         totalClients: summary.total_clients || 0,
//         activeClients: summary.active_clients || 0,
//         newClients: summary.new_clients || 0,
//         atRiskClients: summary.at_risk_clients || 0,
//         marketersCount: summary.marketers_count || 0,
//         clientsWithPlans: summary.clients_with_plans || 0,
//         clientsWithoutPlans: summary.clients_without_plans || 0,
//         planCoverage: summary.plan_coverage || 0,
//         growthRate: summary.growth_rate || 0,
//         revenue: summary.revenue || { total: 0, monthly_avg: 0, commission_pool: 0 }
//       },
//       financial,
//       usage,
//       clientAnalytics: client_analytics,
//       hotspotAnalytics: hotspot_analytics,
//       planAnalytics: plan_analytics,
//       alerts
//     };
//   }, [data]);

//   if (loading) {
//     return (
//       <div className="space-y-6">
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//           {[1, 2, 3, 4].map(i => (
//             <div key={i} className={`h-32 rounded-xl animate-pulse ${themeClasses.bg.card}`} />
//           ))}
//         </div>
//         <div className={`h-96 rounded-xl animate-pulse ${themeClasses.bg.card}`} />
//       </div>
//     );
//   }

//   if (!processedData) {
//     return (
//       <Card theme={theme} className="text-center py-12">
//         <Activity size={48} className="mx-auto mb-4 opacity-50" />
//         <h3 className={`text-lg font-medium mb-2 ${themeClasses.text.primary}`}>
//           No Dashboard Data
//         </h3>
//         <p className={themeClasses.text.secondary}>
//           Unable to load dashboard data. Please try refreshing.
//         </p>
//       </Card>
//     );
//   }

//   const { summary, financial, usage, clientAnalytics, planAnalytics, alerts } = processedData;

//   // Calculate active percentage
//   const activePercentage = summary.totalClients > 0
//     ? ((summary.activeClients / summary.totalClients) * 100).toFixed(1)
//     : 0;

//   // Calculate at risk percentage
//   const atRiskPercentage = summary.totalClients > 0
//     ? ((summary.atRiskClients / summary.totalClients) * 100).toFixed(1)
//     : 0;

//   return (
//     <div className="space-y-6">
//       {/* Quick Stats Row 1 */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//         <StatsCard
//           title="Total Clients"
//           value={summary.totalClients.toLocaleString()}
//           icon={Users}
//           color="blue"
//           theme={theme}
//           onClick={() => onFilterChange?.('status', 'all')}
//           trend={{
//             value: `${summary.growthRate > 0 ? '+' : ''}${summary.growthRate}%`,
//             direction: summary.growthRate > 0 ? 'up' : 'down',
//             label: 'vs last month'
//           }}
//         />
//         <StatsCard
//           title="Active Clients"
//           value={summary.activeClients.toLocaleString()}
//           icon={CheckCircle}
//           color="green"
//           theme={theme}
//           onClick={() => onFilterChange?.('status', 'active')}
//           trend={{
//             value: `${activePercentage}%`,
//             direction: 'up',
//             label: 'of total'
//           }}
//         />
//         <StatsCard
//           title="At Risk"
//           value={summary.atRiskClients.toLocaleString()}
//           icon={AlertCircle}
//           color="red"
//           theme={theme}
//           onClick={() => onFilterChange?.('at_risk', 'true')}
//           trend={{
//             value: `${atRiskPercentage}%`,
//             direction: atRiskPercentage > 10 ? 'up' : 'down',
//             label: 'of total'
//           }}
//         />
//         <StatsCard
//           title="New This Month"
//           value={summary.newClients.toLocaleString()}
//           icon={TrendingUp}
//           color="purple"
//           theme={theme}
//           onClick={() => onFilterChange?.('date_from', new Date(new Date().setDate(1)).toISOString().split('T')[0])}
//         />
//       </div>

//       {/* Quick Stats Row 2 */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//         <StatsCard
//           title="Total Revenue"
//           value={formatCurrency(summary.revenue.total)}
//           icon={DollarSign}
//           color="green"
//           theme={theme}
//         />
//         <StatsCard
//           title="Monthly Revenue"
//           value={formatCurrency(summary.revenue.monthly_avg)}
//           icon={TrendingUp}
//           color="blue"
//           theme={theme}
//         />
//         <StatsCard
//           title="Clients with Plans"
//           value={summary.clientsWithPlans.toLocaleString()}
//           icon={Shield}
//           color="indigo"
//           theme={theme}
//           trend={{
//             value: `${summary.planCoverage}%`,
//             direction: summary.planCoverage > 50 ? 'up' : 'down',
//             label: 'coverage'
//           }}
//         />
//         <StatsCard
//           title="Marketers"
//           value={summary.marketersCount.toLocaleString()}
//           icon={Users}
//           color="yellow"
//           theme={theme}
//         />
//       </div>

//       {/* Charts Section */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* Revenue Trend Chart */}
//         <Card title="Revenue Trend" theme={theme}>
//           <AnalyticsChart
//             data={{
//               labels: financial.revenue_trends?.daily?.map(d => d.date) || [],
//               datasets: [{
//                 label: 'Revenue',
//                 data: financial.revenue_trends?.daily?.map(d => d.revenue) || [],
//                 borderColor: '#3b82f6',
//                 backgroundColor: 'rgba(59, 130, 246, 0.1)',
//                 tension: 0.4,
//                 fill: true
//               }]
//             }}
//             type="line"
//             height={300}
//             theme={theme}
//           />
//         </Card>

//         {/* Usage Trend Chart */}
//         <Card title="Data Usage Trend" theme={theme}>
//           <AnalyticsChart
//             data={{
//               labels: usage.bandwidth_trends?.periods || [],
//               datasets: [{
//                 label: 'Data Usage (GB)',
//                 data: usage.bandwidth_trends?.total_data_gb || [],
//                 borderColor: '#10b981',
//                 backgroundColor: 'rgba(16, 185, 129, 0.1)',
//                 tension: 0.4,
//                 fill: true
//               }]
//             }}
//             type="line"
//             height={300}
//             theme={theme}
//           />
//         </Card>
//       </div>

//       {/* Distribution Section */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Connection Distribution */}
//         <Card title="Connection Types" theme={theme}>
//           <div className="space-y-4">
//             {clientAnalytics.connection_distribution?.map((item, index) => {
//               const percentage = ((item.count / summary.totalClients) * 100).toFixed(1);
//               return (
//                 <div key={index} className="space-y-2">
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center gap-2">
//                       {item.connection_type === 'pppoe' ? (
//                         <Wifi size={16} className="text-blue-500" />
//                       ) : (
//                         <Zap size={16} className="text-yellow-500" />
//                       )}
//                       <span className={themeClasses.text.primary}>
//                         {item.connection_type || 'Unknown'}
//                       </span>
//                     </div>
//                     <span className={themeClasses.text.secondary}>
//                       {item.count} ({percentage}%)
//                     </span>
//                   </div>
//                   <div className={`h-2 rounded-full ${themeClasses.bg.secondary}`}>
//                     <div
//                       className="h-full rounded-full bg-blue-500"
//                       style={{ width: `${percentage}%` }}
//                     />
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         </Card>

//         {/* Tier Distribution */}
//         <Card title="Client Tiers" theme={theme}>
//           <div className="space-y-4">
//             {clientAnalytics.tier_distribution?.map((item, index) => {
//               const percentage = ((item.count / summary.totalClients) * 100).toFixed(1);
//               const colors = {
//                 vip: 'bg-purple-500',
//                 diamond: 'bg-blue-500',
//                 platinum: 'bg-emerald-500',
//                 gold: 'bg-yellow-500',
//                 silver: 'bg-gray-400',
//                 bronze: 'bg-orange-500',
//                 new: 'bg-gray-500'
//               };
//               return (
//                 <div key={index} className="space-y-2">
//                   <div className="flex items-center justify-between">
//                     <span className="capitalize">{item.tier}</span>
//                     <span className={themeClasses.text.secondary}>
//                       {item.count} ({percentage}%)
//                     </span>
//                   </div>
//                   <div className={`h-2 rounded-full ${themeClasses.bg.secondary}`}>
//                     <div
//                       className={`h-full rounded-full ${colors[item.tier] || 'bg-gray-500'}`}
//                       style={{ width: `${percentage}%` }}
//                     />
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         </Card>

//         {/* Revenue Segments */}
//         <Card title="Revenue Segments" theme={theme}>
//           <div className="space-y-4">
//             {financial.revenue_segments?.map((segment, index) => {
//               const totalRevenue = financial.revenue_segments.reduce((sum, s) => sum + s.total_revenue, 0);
//               const percentage = ((segment.total_revenue / totalRevenue) * 100).toFixed(1);
//               const colors = {
//                 premium: 'bg-yellow-500',
//                 high: 'bg-purple-500',
//                 medium: 'bg-blue-500',
//                 low: 'bg-gray-500'
//               };
//               return (
//                 <div key={index} className="space-y-2">
//                   <div className="flex items-center justify-between">
//                     <span className="capitalize">{segment.revenue_segment}</span>
//                     <div>
//                       <span className={themeClasses.text.primary}>
//                         {formatCurrency(segment.total_revenue)}
//                       </span>
//                       <span className={`ml-2 text-sm ${themeClasses.text.secondary}`}>
//                         ({percentage}%)
//                       </span>
//                     </div>
//                   </div>
//                   <div className={`h-2 rounded-full ${themeClasses.bg.secondary}`}>
//                     <div
//                       className={`h-full rounded-full ${colors[segment.revenue_segment] || 'bg-blue-500'}`}
//                       style={{ width: `${percentage}%` }}
//                     />
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         </Card>
//       </div>

//       {/* Plan Analytics Section */}
//       {planAnalytics && Object.keys(planAnalytics).length > 0 && (
//         <Card title="Plan Analytics" theme={theme}>
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//             <div className={`p-4 rounded-lg ${themeClasses.bg.secondary}`}>
//               <p className={`text-sm ${themeClasses.text.secondary}`}>Active Subscriptions</p>
//               <p className={`text-2xl font-bold ${themeClasses.text.primary}`}>
//                 {planAnalytics.active_subscriptions || 0}
//               </p>
//             </div>
//             <div className={`p-4 rounded-lg ${themeClasses.bg.secondary}`}>
//               <p className={`text-sm ${themeClasses.text.secondary}`}>Expiring Soon</p>
//               <p className={`text-2xl font-bold text-yellow-500`}>
//                 {planAnalytics.expiring_soon || 0}
//               </p>
//             </div>
//             <div className={`p-4 rounded-lg ${themeClasses.bg.secondary}`}>
//               <p className={`text-sm ${themeClasses.text.secondary}`}>Exceeded Limits</p>
//               <p className={`text-2xl font-bold text-red-500`}>
//                 {planAnalytics.exceeded_limits || 0}
//               </p>
//             </div>
//             <div className={`p-4 rounded-lg ${themeClasses.bg.secondary}`}>
//               <p className={`text-sm ${themeClasses.text.secondary}`}>Popular Plans</p>
//               <p className={`text-sm ${themeClasses.text.primary}`}>
//                 {planAnalytics.popular_plans?.map(p => p.plan_name).join(', ') || 'N/A'}
//               </p>
//             </div>
//           </div>
//         </Card>
//       )}

//       {/* Alerts Section */}
//       {alerts && alerts.length > 0 && (
//         <Card title="System Alerts" theme={theme}>
//           <div className="space-y-3">
//             {alerts.slice(0, 5).map((alert, index) => (
//               <div
//                 key={index}
//                 className={`p-3 rounded-lg ${
//                   alert.severity === 'high' ? themeClasses.bg.danger :
//                   alert.severity === 'medium' ? themeClasses.bg.warning :
//                   themeClasses.bg.info
//                 }`}
//               >
//                 <div className="flex items-start justify-between">
//                   <div>
//                     <p className="font-medium text-sm mb-1">{alert.title}</p>
//                     <p className="text-xs opacity-80">{alert.description}</p>
//                   </div>
//                   <span className={`text-xs px-2 py-1 rounded ${
//                     alert.severity === 'high' ? themeClasses.text.danger :
//                     alert.severity === 'medium' ? themeClasses.text.warning :
//                     themeClasses.text.info
//                   }`}>
//                     {alert.severity}
//                   </span>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </Card>
//       )}

//       {/* Hotspot Analytics (if available) */}
//       {hotspotAnalytics && Object.keys(hotspotAnalytics).length > 0 && (
//         <Card title="Hotspot Analytics" theme={theme}>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <div className={`p-4 rounded-lg ${themeClasses.bg.secondary}`}>
//               <p className={`text-sm ${themeClasses.text.secondary}`}>Total Hotspot Clients</p>
//               <p className={`text-2xl font-bold ${themeClasses.text.primary}`}>
//                 {hotspotAnalytics.total_hotspot_clients || 0}
//               </p>
//             </div>
//             <div className={`p-4 rounded-lg ${themeClasses.bg.secondary}`}>
//               <p className={`text-sm ${themeClasses.text.secondary}`}>Active Sessions</p>
//               <p className={`text-2xl font-bold text-green-500`}>
//                 {hotspotAnalytics.active_hotspot_clients || 0}
//               </p>
//             </div>
//             <div className={`p-4 rounded-lg ${themeClasses.bg.secondary}`}>
//               <p className={`text-sm ${themeClasses.text.secondary}`}>Conversion Rate</p>
//               <p className={`text-2xl font-bold text-blue-500`}>
//                 {hotspotAnalytics.conversion_rate?.toFixed(1) || 0}%
//               </p>
//             </div>
//           </div>
//         </Card>
//       )}
//     </div>
//   );
// };

// export default ClientDashboard;










import React, { useMemo } from 'react';
import {
  Users, Activity, AlertCircle, CheckCircle,
  TrendingUp, TrendingDown, DollarSign, Globe,
  BarChart3, CreditCard, Clock, Zap,
  Wifi, Shield, Target, PieChart
} from 'lucide-react';
import { getThemeClasses } from '../ServiceManagement/Shared/components';
import AnalyticsChart from './AnalyticsChart';
import { formatCurrency } from './utils/formatters';

// Card component
const Card = ({ title, children, theme, className = '' }) => {
  const themeClasses = getThemeClasses(theme);
  return (
    <div className={`p-6 rounded-xl border ${themeClasses.bg.card} ${themeClasses.border.light} ${className}`}>
      {title && (
        <h3 className={`text-lg font-semibold mb-4 ${themeClasses.text.primary}`}>{title}</h3>
      )}
      {children}
    </div>
  );
};

// Stats Card component
const StatsCard = ({ title, value, icon: Icon, color, theme, onClick, trend }) => {
  const themeClasses = getThemeClasses(theme);
  
  const colorClasses = {
    blue: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30',
    green: 'text-green-500 bg-green-100 dark:bg-green-900/30',
    red: 'text-red-500 bg-red-100 dark:bg-red-900/30',
    yellow: 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30',
    purple: 'text-purple-500 bg-purple-100 dark:bg-purple-900/30',
    indigo: 'text-indigo-500 bg-indigo-100 dark:bg-indigo-900/30'
  };

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-lg ${themeClasses.bg.card} ${themeClasses.border.light} ${onClick ? 'hover:scale-105' : ''}`}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className={`text-sm font-medium ${themeClasses.text.secondary}`}>{title}</h3>
        <div className={`p-2 rounded-lg ${colorClasses[color] || colorClasses.blue}`}>
          <Icon size={18} className={colorClasses[color]?.split(' ')[0] || 'text-blue-500'} />
        </div>
      </div>
      <p className={`text-2xl font-bold ${themeClasses.text.primary}`}>{value}</p>
      {trend && (
        <div className="flex items-center gap-1 mt-2">
          {trend.direction === 'up' ? (
            <TrendingUp size={14} className="text-green-500" />
          ) : (
            <TrendingDown size={14} className="text-red-500" />
          )}
          <span className={`text-xs ${trend.direction === 'up' ? 'text-green-500' : 'text-red-500'}`}>
            {trend.value}
          </span>
          <span className={`text-xs ${themeClasses.text.secondary}`}>{trend.label}</span>
        </div>
      )}
    </div>
  );
};

const ClientDashboard = ({ data, theme, onFilterChange, loading = false }) => {
  const themeClasses = getThemeClasses(theme);

  // Process dashboard data
  const processedData = useMemo(() => {
    if (!data) return null;

    const {
      summary = {},
      financial = {},
      usage = {},
      client_analytics = {},
      hotspot_analytics = {},
      plan_analytics = {},
      alerts = []
    } = data;

    return {
      summary: {
        totalClients: summary.total_clients || 0,
        activeClients: summary.active_clients || 0,
        newClients: summary.new_clients || 0,
        atRiskClients: summary.at_risk_clients || 0,
        marketersCount: summary.marketers_count || 0,
        clientsWithPlans: summary.clients_with_plans || 0,
        clientsWithoutPlans: summary.clients_without_plans || 0,
        planCoverage: summary.plan_coverage || 0,
        growthRate: summary.growth_rate || 0,
        revenue: summary.revenue || { total: 0, monthly_avg: 0, commission_pool: 0 }
      },
      financial,
      usage,
      clientAnalytics: client_analytics,
      hotspotAnalytics: hotspot_analytics,
      planAnalytics: plan_analytics,
      alerts
    };
  }, [data]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={`h-32 rounded-xl animate-pulse ${themeClasses.bg.card}`} />
          ))}
        </div>
        <div className={`h-96 rounded-xl animate-pulse ${themeClasses.bg.card}`} />
      </div>
    );
  }

  if (!processedData) {
    return (
      <Card theme={theme} className="text-center py-12">
        <Activity size={48} className="mx-auto mb-4 opacity-50" />
        <h3 className={`text-lg font-medium mb-2 ${themeClasses.text.primary}`}>
          No Dashboard Data
        </h3>
        <p className={themeClasses.text.secondary}>
          Unable to load dashboard data. Please try refreshing.
        </p>
      </Card>
    );
  }

  const { summary, financial, usage, clientAnalytics, planAnalytics, alerts } = processedData;

  // Calculate percentages
  const activePercentage = summary.totalClients > 0
    ? ((summary.activeClients / summary.totalClients) * 100).toFixed(1)
    : 0;

  const atRiskPercentage = summary.totalClients > 0
    ? ((summary.atRiskClients / summary.totalClients) * 100).toFixed(1)
    : 0;

  const planCoveragePercentage = summary.totalClients > 0
    ? ((summary.clientsWithPlans / summary.totalClients) * 100).toFixed(1)
    : 0;

  return (
    <div className="space-y-6">
      {/* Quick Stats Row 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Clients"
          value={summary.totalClients.toLocaleString()}
          icon={Users}
          color="blue"
          theme={theme}
          onClick={() => onFilterChange?.('status', 'all')}
          trend={{
            value: `${summary.growthRate > 0 ? '+' : ''}${summary.growthRate}%`,
            direction: summary.growthRate > 0 ? 'up' : 'down',
            label: 'vs last month'
          }}
        />
        <StatsCard
          title="Active Clients"
          value={summary.activeClients.toLocaleString()}
          icon={CheckCircle}
          color="green"
          theme={theme}
          onClick={() => onFilterChange?.('status', 'active')}
          trend={{
            value: `${activePercentage}%`,
            direction: 'up',
            label: 'of total'
          }}
        />
        <StatsCard
          title="At Risk"
          value={summary.atRiskClients.toLocaleString()}
          icon={AlertCircle}
          color="red"
          theme={theme}
          onClick={() => onFilterChange?.('at_risk', 'true')}
          trend={{
            value: `${atRiskPercentage}%`,
            direction: atRiskPercentage > 10 ? 'up' : 'down',
            label: 'of total'
          }}
        />
        <StatsCard
          title="New This Month"
          value={summary.newClients.toLocaleString()}
          icon={TrendingUp}
          color="purple"
          theme={theme}
          onClick={() => onFilterChange?.('date_from', new Date(new Date().setDate(1)).toISOString().split('T')[0])}
        />
      </div>

      {/* Quick Stats Row 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Revenue"
          value={formatCurrency(summary.revenue.total)}
          icon={DollarSign}
          color="green"
          theme={theme}
        />
        <StatsCard
          title="Monthly Revenue"
          value={formatCurrency(summary.revenue.monthly_avg)}
          icon={TrendingUp}
          color="blue"
          theme={theme}
        />
        <StatsCard
          title="Clients with Plans"
          value={summary.clientsWithPlans.toLocaleString()}
          icon={Shield}
          color="indigo"
          theme={theme}
          trend={{
            value: `${planCoveragePercentage}%`,
            direction: planCoveragePercentage > 50 ? 'up' : 'down',
            label: 'coverage'
          }}
        />
        <StatsCard
          title="Marketers"
          value={summary.marketersCount.toLocaleString()}
          icon={Users}
          color="yellow"
          theme={theme}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend Chart */}
        <Card title="Revenue Trend" theme={theme}>
          <AnalyticsChart
            data={{
              labels: financial.revenue_trends?.daily?.map(d => d.date) || 
                      ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
              datasets: [{
                label: 'Revenue',
                data: financial.revenue_trends?.daily?.map(d => d.revenue) || 
                       [65000, 59000, 80000, 81000, 56000, 55000],
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                fill: true
              }]
            }}
            type="line"
            height={300}
            theme={theme}
          />
        </Card>

        {/* Usage Trend Chart */}
        <Card title="Data Usage Trend" theme={theme}>
          <AnalyticsChart
            data={{
              labels: usage.bandwidth_trends?.periods || 
                      ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
              datasets: [{
                label: 'Data Usage (GB)',
                data: usage.bandwidth_trends?.total_data_gb || 
                       [450, 520, 480, 610, 580, 630],
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.4,
                fill: true
              }]
            }}
            type="line"
            height={300}
            theme={theme}
          />
        </Card>
      </div>

      {/* Distribution Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Connection Distribution */}
        <Card title="Connection Types" theme={theme}>
          <div className="space-y-4">
            {(clientAnalytics.connection_distribution?.length > 0 ? 
              clientAnalytics.connection_distribution : 
              [
                { connection_type: 'pppoe', count: 65 },
                { connection_type: 'hotspot', count: 35 }
              ]
            ).map((item, index) => {
              const total = clientAnalytics.connection_distribution 
                ? clientAnalytics.connection_distribution.reduce((sum, i) => sum + i.count, 0)
                : 100;
              const percentage = ((item.count / total) * 100).toFixed(1);
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {item.connection_type === 'pppoe' ? (
                        <Wifi size={16} className="text-blue-500" />
                      ) : (
                        <Zap size={16} className="text-yellow-500" />
                      )}
                      <span className={themeClasses.text.primary}>
                        {item.connection_type === 'pppoe' ? 'PPPoE' : 
                         item.connection_type === 'hotspot' ? 'Hotspot' : 
                         item.connection_type || 'Unknown'}
                      </span>
                    </div>
                    <span className={themeClasses.text.secondary}>
                      {item.count} ({percentage}%)
                    </span>
                  </div>
                  <div className={`h-2 rounded-full ${themeClasses.bg.secondary}`}>
                    <div
                      className="h-full rounded-full bg-blue-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Tier Distribution */}
        <Card title="Client Tiers" theme={theme}>
          <div className="space-y-4">
            {(clientAnalytics.tier_distribution?.length > 0 ? 
              clientAnalytics.tier_distribution : 
              [
                { tier: 'new', count: 25 },
                { tier: 'bronze', count: 40 },
                { tier: 'silver', count: 20 },
                { tier: 'gold', count: 15 }
              ]
            ).map((item, index) => {
              const total = clientAnalytics.tier_distribution
                ? clientAnalytics.tier_distribution.reduce((sum, i) => sum + i.count, 0)
                : 100;
              const percentage = ((item.count / total) * 100).toFixed(1);
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
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="capitalize">{item.tier?.replace('_', ' ') || 'Unknown'}</span>
                    <span className={themeClasses.text.secondary}>
                      {item.count} ({percentage}%)
                    </span>
                  </div>
                  <div className={`h-2 rounded-full ${themeClasses.bg.secondary}`}>
                    <div
                      className={`h-full rounded-full ${colors[item.tier] || 'bg-gray-500'}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Revenue Segments */}
        <Card title="Revenue Segments" theme={theme}>
          <div className="space-y-4">
            {(financial.revenue_segments?.length > 0 ? 
              financial.revenue_segments : 
              [
                { revenue_segment: 'premium', total_revenue: 450000, count: 15 },
                { revenue_segment: 'high', total_revenue: 380000, count: 25 },
                { revenue_segment: 'medium', total_revenue: 320000, count: 35 },
                { revenue_segment: 'low', total_revenue: 150000, count: 25 }
              ]
            ).map((segment, index) => {
              const totalRevenue = financial.revenue_segments
                ? financial.revenue_segments.reduce((sum, s) => sum + s.total_revenue, 0)
                : 1300000;
              const percentage = ((segment.total_revenue / totalRevenue) * 100).toFixed(1);
              const colors = {
                premium: 'bg-yellow-500',
                high: 'bg-purple-500',
                medium: 'bg-blue-500',
                low: 'bg-gray-500'
              };
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="capitalize">{segment.revenue_segment?.replace('_', ' ') || 'Unknown'}</span>
                    <div>
                      <span className={themeClasses.text.primary}>
                        {formatCurrency(segment.total_revenue)}
                      </span>
                      <span className={`ml-2 text-sm ${themeClasses.text.secondary}`}>
                        ({percentage}%)
                      </span>
                    </div>
                  </div>
                  <div className={`h-2 rounded-full ${themeClasses.bg.secondary}`}>
                    <div
                      className={`h-full rounded-full ${colors[segment.revenue_segment] || 'bg-blue-500'}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Plan Analytics Section */}
      {planAnalytics && Object.keys(planAnalytics).length > 0 && (
        <Card title="Plan Analytics" theme={theme}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className={`p-4 rounded-lg ${themeClasses.bg.secondary}`}>
              <p className={`text-sm ${themeClasses.text.secondary}`}>Active Subscriptions</p>
              <p className={`text-2xl font-bold ${themeClasses.text.primary}`}>
                {planAnalytics.active_subscriptions || 0}
              </p>
            </div>
            <div className={`p-4 rounded-lg ${themeClasses.bg.secondary}`}>
              <p className={`text-sm ${themeClasses.text.secondary}`}>Expiring Soon</p>
              <p className={`text-2xl font-bold text-yellow-500`}>
                {planAnalytics.expiring_soon || 0}
              </p>
            </div>
            <div className={`p-4 rounded-lg ${themeClasses.bg.secondary}`}>
              <p className={`text-sm ${themeClasses.text.secondary}`}>Exceeded Limits</p>
              <p className={`text-2xl font-bold text-red-500`}>
                {planAnalytics.exceeded_limits || 0}
              </p>
            </div>
            <div className={`p-4 rounded-lg ${themeClasses.bg.secondary}`}>
              <p className={`text-sm ${themeClasses.text.secondary}`}>Popular Plans</p>
              <p className={`text-sm ${themeClasses.text.primary}`}>
                {planAnalytics.popular_plans?.map(p => p.plan_name).join(', ') || 'N/A'}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Alerts Section */}
      {alerts && alerts.length > 0 && (
        <Card title="System Alerts" theme={theme}>
          <div className="space-y-3">
            {alerts.slice(0, 5).map((alert, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg ${
                  alert.severity === 'high' ? themeClasses.bg.danger :
                  alert.severity === 'medium' ? themeClasses.bg.warning :
                  themeClasses.bg.info
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-sm mb-1">{alert.title}</p>
                    <p className="text-xs opacity-80">{alert.description}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    alert.severity === 'high' ? 'bg-red-200 text-red-700 dark:bg-red-900/50 dark:text-red-300' :
                    alert.severity === 'medium' ? 'bg-yellow-200 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300' :
                    'bg-blue-200 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                  }`}>
                    {alert.severity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Hotspot Analytics (if available) */}
      {hotspotAnalytics && Object.keys(hotspotAnalytics).length > 0 && (
        <Card title="Hotspot Analytics" theme={theme}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg ${themeClasses.bg.secondary}`}>
              <p className={`text-sm ${themeClasses.text.secondary}`}>Total Hotspot Clients</p>
              <p className={`text-2xl font-bold ${themeClasses.text.primary}`}>
                {hotspotAnalytics.total_hotspot_clients || 0}
              </p>
            </div>
            <div className={`p-4 rounded-lg ${themeClasses.bg.secondary}`}>
              <p className={`text-sm ${themeClasses.text.secondary}`}>Active Sessions</p>
              <p className={`text-2xl font-bold text-green-500`}>
                {hotspotAnalytics.active_hotspot_clients || 0}
              </p>
            </div>
            <div className={`p-4 rounded-lg ${themeClasses.bg.secondary}`}>
              <p className={`text-sm ${themeClasses.text.secondary}`}>Conversion Rate</p>
              <p className={`text-2xl font-bold text-blue-500`}>
                {hotspotAnalytics.conversion_rate?.toFixed(1) || 0}%
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ClientDashboard;