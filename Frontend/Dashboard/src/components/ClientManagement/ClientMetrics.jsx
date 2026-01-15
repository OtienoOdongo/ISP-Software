// import React, { useMemo } from 'react';
// import {
//   FiTrendingUp,
//   FiTrendingDown,
//   FiActivity,
//   FiBarChart2,
//   FiPieChart,
//   FiTarget,
//   FiShield,
//   FiDollarSign
// } from 'react-icons/fi';
// import { calculateMetrics } from '../ClientManagement/utils/dataTransformers'

// const ClientMetrics = ({ client, theme }) => {
//   const themeClasses = {
//     container: theme === 'dark' 
//       ? 'bg-gray-800 text-gray-100' 
//       : 'bg-white text-gray-900',
//     card: theme === 'dark'
//       ? 'bg-gray-900/50 border-gray-700'
//       : 'bg-gray-50 border-gray-200',
//     heading: theme === 'dark' ? 'text-white' : 'text-gray-800',
//     subheading: theme === 'dark' ? 'text-gray-300' : 'text-gray-600',
//     muted: theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
//   };

//   // Calculate metrics
//   const metrics = useMemo(() => calculateMetrics(client), [client]);

//   // Performance indicators
//   const performanceIndicators = useMemo(() => {
//     const indicators = [];

//     // Financial Health
//     if (metrics.financial_health >= 80) {
//       indicators.push({ 
//         label: 'Financial Health', 
//         value: 'Excellent', 
//         color: 'green',
//         icon: FiDollarSign 
//       });
//     } else if (metrics.financial_health >= 60) {
//       indicators.push({ 
//         label: 'Financial Health', 
//         value: 'Good', 
//         color: 'blue',
//         icon: FiDollarSign 
//       });
//     } else {
//       indicators.push({ 
//         label: 'Financial Health', 
//         value: 'Needs Attention', 
//         color: 'yellow',
//         icon: FiDollarSign 
//       });
//     }

//     // Engagement Level
//     if (metrics.engagement_score >= 70) {
//       indicators.push({ 
//         label: 'Engagement', 
//         value: 'High', 
//         color: 'green',
//         icon: FiActivity 
//       });
//     } else if (metrics.engagement_score >= 40) {
//       indicators.push({ 
//         label: 'Engagement', 
//         value: 'Medium', 
//         color: 'blue',
//         icon: FiActivity 
//       });
//     } else {
//       indicators.push({ 
//         label: 'Engagement', 
//         value: 'Low', 
//         color: 'red',
//         icon: FiActivity 
//       });
//     }

//     // Retention Score
//     if (metrics.retention_score >= 90) {
//       indicators.push({ 
//         label: 'Retention', 
//         value: 'Excellent', 
//         color: 'green',
//         icon: FiShield 
//       });
//     } else if (metrics.retention_score >= 70) {
//       indicators.push({ 
//         label: 'Retention', 
//         value: 'Good', 
//         color: 'blue',
//         icon: FiShield 
//       });
//     } else {
//       indicators.push({ 
//         label: 'Retention', 
//         value: 'At Risk', 
//         color: 'red',
//         icon: FiShield 
//       });
//     }

//     // Usage Score
//     if (metrics.usage_score >= 70) {
//       indicators.push({ 
//         label: 'Usage', 
//         value: 'Heavy', 
//         color: 'purple',
//         icon: FiBarChart2 
//       });
//     } else if (metrics.usage_score >= 40) {
//       indicators.push({ 
//         label: 'Usage', 
//         value: 'Moderate', 
//         color: 'blue',
//         icon: FiBarChart2 
//       });
//     } else {
//       indicators.push({ 
//         label: 'Usage', 
//         value: 'Light', 
//         color: 'gray',
//         icon: FiBarChart2 
//       });
//     }

//     return indicators;
//   }, [metrics]);

//   // Score progress bars
//   const ScoreBar = ({ label, score, color }) => {
//     const getColorClass = () => {
//       switch (color) {
//         case 'green': return 'bg-green-500';
//         case 'yellow': return 'bg-yellow-500';
//         case 'red': return 'bg-red-500';
//         case 'blue': return 'bg-blue-500';
//         case 'purple': return 'bg-purple-500';
//         default: return 'bg-gray-500';
//       }
//     };

//     return (
//       <div className="mb-3">
//         <div className="flex justify-between mb-1">
//           <span className={`text-sm ${themeClasses.subheading}`}>{label}</span>
//           <span className={`text-sm font-medium ${themeClasses.heading}`}>
//             {score.toFixed(0)}%
//           </span>
//         </div>
//         <div className={`h-2 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
//           <div 
//             className={`h-full rounded-full ${getColorClass()}`}
//             style={{ width: `${score}%` }}
//           />
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className={`rounded-lg border p-4 ${themeClasses.card}`}>
//       <div className="flex items-center justify-between mb-4">
//         <h3 className={`font-semibold flex items-center gap-2 ${themeClasses.heading}`}>
//           <FiTarget />
//           Performance Metrics
//         </h3>
//         <div className={`px-3 py-1 rounded-full text-sm font-medium ${
//           metrics.overall_score >= 70 
//             ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
//             : metrics.overall_score >= 50
//             ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
//             : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
//         }`}>
//           Score: {metrics.overall_score.toFixed(0)}%
//         </div>
//       </div>

//       {/* Performance Indicators Grid */}
//       <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
//         {performanceIndicators.map((indicator, index) => {
//           const Icon = indicator.icon;
//           return (
//             <div 
//               key={index}
//               className={`p-3 rounded-lg ${
//                 theme === 'dark' 
//                   ? 'bg-gray-700/50' 
//                   : 'bg-gray-100'
//               }`}
//             >
//               <div className="flex items-center gap-2 mb-2">
//                 <Icon className={`text-${indicator.color}-500`} size={16} />
//                 <span className={`text-xs ${themeClasses.muted}`}>
//                   {indicator.label}
//                 </span>
//               </div>
//               <p className={`text-sm font-medium text-${indicator.color}-500`}>
//                 {indicator.value}
//               </p>
//             </div>
//           );
//         })}
//       </div>

//       {/* Detailed Score Bars */}
//       <div className="space-y-1">
//         <ScoreBar label="Overall Score" score={metrics.overall_score} color={
//           metrics.overall_score >= 70 ? 'green' :
//           metrics.overall_score >= 50 ? 'yellow' : 'red'
//         } />
        
//         <ScoreBar label="Financial Health" score={metrics.financial_health} color={
//           metrics.financial_health >= 80 ? 'green' :
//           metrics.financial_health >= 60 ? 'blue' : 'yellow'
//         } />
        
//         <ScoreBar label="Engagement Score" score={metrics.engagement_score} color={
//           metrics.engagement_score >= 70 ? 'green' :
//           metrics.engagement_score >= 40 ? 'blue' : 'red'
//         } />
        
//         <ScoreBar label="Retention Score" score={metrics.retention_score} color={
//           metrics.retention_score >= 90 ? 'green' :
//           metrics.retention_score >= 70 ? 'blue' : 'red'
//         } />
        
//         <ScoreBar label="Usage Score" score={metrics.usage_score} color={
//           metrics.usage_score >= 70 ? 'purple' :
//           metrics.usage_score >= 40 ? 'blue' : 'gray'
//         } />
//       </div>

//       {/* Trend Indicators */}
//       <div className="mt-6 pt-4 border-t border-gray-700 dark:border-gray-600">
//         <div className="flex items-center justify-between">
//           <span className={`text-sm ${themeClasses.subheading}`}>Monthly Trend</span>
//           <div className="flex items-center gap-1">
//             {client.monthly_recurring_revenue > 0 ? (
//               <>
//                 <FiTrendingUp className="text-green-500" size={16} />
//                 <span className="text-green-500 text-sm">
//                   +{((client.monthly_recurring_revenue / (client.lifetime_value || 1)) * 100).toFixed(1)}%
//                 </span>
//               </>
//             ) : (
//               <>
//                 <FiTrendingDown className="text-red-500" size={16} />
//                 <span className="text-red-500 text-sm">No growth</span>
//               </>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ClientMetrics;







// components/ClientManagement/ClientMetrics.jsx
import React, { useMemo } from 'react';
import {
  FiTrendingUp,
  FiTrendingDown,
  FiActivity,
  FiBarChart2,
  FiPieChart,
  FiTarget,
  FiShield,
  FiDollarSign
} from 'react-icons/fi';
import { getThemeClasses } from '../ServiceManagement/Shared/components'

// Utility to calculate metrics (assuming from utils)
const calculateMetrics = (client) => {
  // Implement appropriate algorithms for metrics calculation
  // For example, using weighted averages or ML-based scoring if integrated
  const financial_health = (client.lifetime_value / (client.avg_monthly_spend || 1)) * 10; // Example formula
  const engagement_score = client.engagement_score || 0;
  const retention_score = 100 - (client.churn_risk_score * 10);
  const usage_score = (client.total_data_used_gb / (client.avg_monthly_data_gb || 1)) * 10;
  const overall_score = (financial_health + engagement_score + retention_score + usage_score) / 4;
  return { financial_health, engagement_score, retention_score, usage_score, overall_score };
};

const ClientMetrics = ({ client, theme }) => {
  const themeClasses = getThemeClasses(theme);

  // Calculate metrics with memoization
  const metrics = useMemo(() => calculateMetrics(client), [client]);

  // Performance indicators
  const performanceIndicators = useMemo(() => {
    const indicators = [];
    // Financial Health
    if (metrics.financial_health >= 80) {
      indicators.push({
        label: 'Financial Health',
        value: 'Excellent',
        color: 'green',
        icon: FiDollarSign
      });
    } else if (metrics.financial_health >= 60) {
      indicators.push({
        label: 'Financial Health',
        value: 'Good',
        color: 'blue',
        icon: FiDollarSign
      });
    } else {
      indicators.push({
        label: 'Financial Health',
        value: 'Needs Attention',
        color: 'yellow',
        icon: FiDollarSign
      });
    }
    // Engagement Level
    if (metrics.engagement_score >= 70) {
      indicators.push({
        label: 'Engagement',
        value: 'High',
        color: 'green',
        icon: FiActivity
      });
    } else if (metrics.engagement_score >= 40) {
      indicators.push({
        label: 'Engagement',
        value: 'Medium',
        color: 'blue',
        icon: FiActivity
      });
    } else {
      indicators.push({
        label: 'Engagement',
        value: 'Low',
        color: 'red',
        icon: FiActivity
      });
    }
    // Retention Score
    if (metrics.retention_score >= 90) {
      indicators.push({
        label: 'Retention',
        value: 'Excellent',
        color: 'green',
        icon: FiShield
      });
    } else if (metrics.retention_score >= 70) {
      indicators.push({
        label: 'Retention',
        value: 'Good',
        color: 'blue',
        icon: FiShield
      });
    } else {
      indicators.push({
        label: 'Retention',
        value: 'At Risk',
        color: 'red',
        icon: FiShield
      });
    }
    // Usage Score
    if (metrics.usage_score >= 70) {
      indicators.push({
        label: 'Usage',
        value: 'Heavy',
        color: 'purple',
        icon: FiBarChart2
      });
    } else if (metrics.usage_score >= 40) {
      indicators.push({
        label: 'Usage',
        value: 'Moderate',
        color: 'blue',
        icon: FiBarChart2
      });
    } else {
      indicators.push({
        label: 'Usage',
        value: 'Light',
        color: 'gray',
        icon: FiBarChart2
      });
    }
    return indicators;
  }, [metrics]);

  // Score progress bars component
  const ScoreBar = ({ label, score, color }) => {
    const getColorClass = () => {
      switch (color) {
        case 'green': return themeClasses.bg.success;
        case 'yellow': return themeClasses.bg.warning;
        case 'red': return themeClasses.bg.danger;
        case 'blue': return themeClasses.bg.info;
        case 'purple': return 'bg-purple-500';
        default: return 'bg-gray-500';
      }
    };
    return (
      <div className="mb-3">
        <div className="flex justify-between mb-1">
          <span className={`text-sm ${themeClasses.text.secondary}`}>{label}</span>
          <span className={`text-sm font-medium ${themeClasses.text.primary}`}>
            {score.toFixed(0)}%
          </span>
        </div>
        <div className={`h-2 rounded-full ${themeClasses.bg.secondary}`}>
          <div
            className={`h-full rounded-full ${getColorClass()}`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className={`rounded-lg border p-4 ${themeClasses.bg.card}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`font-semibold flex items-center gap-2 ${themeClasses.text.primary}`}>
          <FiTarget />
          Performance Metrics
        </h3>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          metrics.overall_score >= 70 ? themeClasses.bg.success :
          metrics.overall_score >= 50 ? themeClasses.bg.warning :
          themeClasses.bg.danger
        }`}>
          Score: {metrics.overall_score.toFixed(0)}%
        </div>
      </div>
      {/* Performance Indicators Grid - Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {performanceIndicators.map((indicator, index) => {
          const Icon = indicator.icon;
          return (
            <div
              key={index}
              className={`p-3 rounded-lg ${themeClasses.bg.secondary}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`text-${indicator.color}-500`} size={16} />
                <span className={`text-xs ${themeClasses.text.secondary}`}>
                  {indicator.label}
                </span>
              </div>
              <p className={`text-sm font-medium text-${indicator.color}-500`}>
                {indicator.value}
              </p>
            </div>
          );
        })}
      </div>
      {/* Detailed Score Bars */}
      <div className="space-y-1">
        <ScoreBar label="Overall Score" score={metrics.overall_score} color={
          metrics.overall_score >= 70 ? 'green' :
          metrics.overall_score >= 50 ? 'yellow' : 'red'
        } />
        <ScoreBar label="Financial Health" score={metrics.financial_health} color={
          metrics.financial_health >= 80 ? 'green' :
          metrics.financial_health >= 60 ? 'blue' : 'yellow'
        } />
        <ScoreBar label="Engagement Score" score={metrics.engagement_score} color={
          metrics.engagement_score >= 70 ? 'green' :
          metrics.engagement_score >= 40 ? 'blue' : 'red'
        } />
        <ScoreBar label="Retention Score" score={metrics.retention_score} color={
          metrics.retention_score >= 90 ? 'green' :
          metrics.retention_score >= 70 ? 'blue' : 'red'
        } />
        <ScoreBar label="Usage Score" score={metrics.usage_score} color={
          metrics.usage_score >= 70 ? 'purple' :
          metrics.usage_score >= 40 ? 'blue' : 'gray'
        } />
      </div>
      {/* Trend Indicators */}
      <div className="mt-6 pt-4 border-t border-gray-700 dark:border-gray-600">
        <div className="flex items-center justify-between">
          <span className={`text-sm ${themeClasses.text.secondary}`}>Monthly Trend</span>
          <div className="flex items-center gap-1">
            {client.monthly_recurring_revenue > 0 ? (
              <>
                <FiTrendingUp className="text-green-500" size={16} />
                <span className="text-green-500 text-sm">
                  +{((client.monthly_recurring_revenue / (client.lifetime_value || 1)) * 100).toFixed(1)}%
                </span>
              </>
            ) : (
              <>
                <FiTrendingDown className="text-red-500" size={16} />
                <span className="text-red-500 text-sm">No growth</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientMetrics;