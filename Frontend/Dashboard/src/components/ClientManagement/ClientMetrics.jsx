

// import React, { useMemo } from 'react';
// import {
//   TrendingUp, TrendingDown, Activity, BarChart3,
//   Target, Shield, DollarSign, Users
// } from 'lucide-react';
// import { getThemeClasses } from '../ServiceManagement/Shared/components';

// // Calculate metrics based on client data
// const calculateMetrics = (client) => {
//   // Financial health (0-100)
//   const financialHealth = Math.min(100, (client.lifetime_value / 10000) * 10);
  
//   // Engagement score (0-100) - convert from 0-10 scale
//   const engagementScore = (client.engagement_score || 0) * 10;
  
//   // Retention score (0-100)
//   const retentionScore = 100 - ((client.churn_risk_score || 0) * 10);
  
//   // Usage score (0-100)
//   const usageScore = Math.min(100, ((client.avg_monthly_data_gb || 0) / 100) * 100);
  
//   // Overall score - weighted average
//   const overallScore = (
//     financialHealth * 0.3 +
//     engagementScore * 0.25 +
//     retentionScore * 0.25 +
//     usageScore * 0.2
//   );

//   return {
//     financialHealth,
//     engagementScore,
//     retentionScore,
//     usageScore,
//     overallScore
//   };
// };

// const ClientMetrics = ({ client, theme }) => {
//   const themeClasses = getThemeClasses(theme);

//   // Calculate metrics with memoization
//   const metrics = useMemo(() => calculateMetrics(client), [client]);

//   // Performance indicators
//   const performanceIndicators = [
//     {
//       label: 'Financial Health',
//       value: metrics.financialHealth,
//       icon: DollarSign,
//       color: metrics.financialHealth >= 70 ? 'green' :
//              metrics.financialHealth >= 40 ? 'yellow' : 'red'
//     },
//     {
//       label: 'Engagement',
//       value: metrics.engagementScore,
//       icon: Activity,
//       color: metrics.engagementScore >= 70 ? 'green' :
//              metrics.engagementScore >= 40 ? 'yellow' : 'red'
//     },
//     {
//       label: 'Retention',
//       value: metrics.retentionScore,
//       icon: Shield,
//       color: metrics.retentionScore >= 70 ? 'green' :
//              metrics.retentionScore >= 40 ? 'yellow' : 'red'
//     },
//     {
//       label: 'Usage',
//       value: metrics.usageScore,
//       icon: BarChart3,
//       color: metrics.usageScore >= 70 ? 'green' :
//              metrics.usageScore >= 40 ? 'yellow' : 'red'
//     }
//   ];

//   // Score Bar Component
//   const ScoreBar = ({ label, score, color }) => {
//     const getColorClass = () => {
//       switch (color) {
//         case 'green': return 'bg-green-500';
//         case 'yellow': return 'bg-yellow-500';
//         case 'red': return 'bg-red-500';
//         default: return 'bg-gray-500';
//       }
//     };

//     return (
//       <div className="mb-3">
//         <div className="flex justify-between mb-1">
//           <span className={`text-sm ${themeClasses.text.secondary}`}>{label}</span>
//           <span className={`text-sm font-medium ${themeClasses.text.primary}`}>
//             {score.toFixed(0)}%
//           </span>
//         </div>
//         <div className={`h-2 rounded-full ${themeClasses.bg.secondary}`}>
//           <div
//             className={`h-full rounded-full ${getColorClass()}`}
//             style={{ width: `${score}%` }}
//           />
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className={`rounded-lg border p-4 ${themeClasses.bg.card}`}>
//       {/* Header */}
//       <div className="flex items-center justify-between mb-4">
//         <h3 className={`font-semibold flex items-center gap-2 ${themeClasses.text.primary}`}>
//           <Target size={18} />
//           Performance Metrics
//         </h3>
//         <div className={`px-3 py-1 rounded-full text-sm font-medium ${
//           metrics.overallScore >= 70 ? themeClasses.bg.success :
//           metrics.overallScore >= 50 ? themeClasses.bg.warning :
//           themeClasses.bg.danger
//         }`}>
//           Score: {metrics.overallScore.toFixed(0)}%
//         </div>
//       </div>

//       {/* Performance Indicators Grid */}
//       <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
//         {performanceIndicators.map((indicator, index) => {
//           const Icon = indicator.icon;
//           const colorClasses = {
//             green: 'text-green-500',
//             yellow: 'text-yellow-500',
//             red: 'text-red-500'
//           };
          
//           return (
//             <div key={index} className={`p-3 rounded-lg ${themeClasses.bg.secondary}`}>
//               <div className="flex items-center gap-2 mb-2">
//                 <Icon size={14} className={colorClasses[indicator.color]} />
//                 <span className={`text-xs ${themeClasses.text.secondary}`}>
//                   {indicator.label}
//                 </span>
//               </div>
//               <p className={`text-sm font-medium ${colorClasses[indicator.color]}`}>
//                 {indicator.value.toFixed(0)}%
//               </p>
//             </div>
//           );
//         })}
//       </div>

//       {/* Detailed Score Bars */}
//       <div className="space-y-1">
//         <ScoreBar
//           label="Overall Score"
//           score={metrics.overallScore}
//           color={
//             metrics.overallScore >= 70 ? 'green' :
//             metrics.overallScore >= 50 ? 'yellow' : 'red'
//           }
//         />
//         <ScoreBar
//           label="Financial Health"
//           score={metrics.financialHealth}
//           color={
//             metrics.financialHealth >= 70 ? 'green' :
//             metrics.financialHealth >= 40 ? 'yellow' : 'red'
//           }
//         />
//         <ScoreBar
//           label="Engagement"
//           score={metrics.engagementScore}
//           color={
//             metrics.engagementScore >= 70 ? 'green' :
//             metrics.engagementScore >= 40 ? 'yellow' : 'red'
//           }
//         />
//         <ScoreBar
//           label="Retention"
//           score={metrics.retentionScore}
//           color={
//             metrics.retentionScore >= 70 ? 'green' :
//             metrics.retentionScore >= 40 ? 'yellow' : 'red'
//           }
//         />
//         <ScoreBar
//           label="Usage"
//           score={metrics.usageScore}
//           color={
//             metrics.usageScore >= 70 ? 'green' :
//             metrics.usageScore >= 40 ? 'yellow' : 'red'
//           }
//         />
//       </div>

//       {/* Trend Indicators */}
//       <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
//         <div className="flex items-center justify-between">
//           <span className={`text-sm ${themeClasses.text.secondary}`}>Monthly Trend</span>
//           <div className="flex items-center gap-1">
//             {client.monthly_recurring_revenue > 0 ? (
//               <>
//                 <TrendingUp className="text-green-500" size={16} />
//                 <span className="text-green-500 text-sm">
//                   +{((client.monthly_recurring_revenue / (client.lifetime_value || 1)) * 100).toFixed(1)}%
//                 </span>
//               </>
//             ) : (
//               <>
//                 <TrendingDown className="text-red-500" size={16} />
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











import React, { useMemo } from 'react';
import {
  TrendingUp, TrendingDown, Activity, BarChart3,
  Target, Shield, DollarSign, Users
} from 'lucide-react';
import { getThemeClasses } from '../ServiceManagement/Shared/components';

const calculateMetrics = (client) => {
  const financialHealth = Math.min(100, (client.lifetime_value / 10000) * 10);
  const engagementScore = (client.engagement_score || 0) * 10;
  const retentionScore = 100 - ((client.churn_risk_score || 0) * 10);
  const usageScore = Math.min(100, ((client.avg_monthly_data_gb || 0) / 100) * 100);
  
  const overallScore = (
    financialHealth * 0.3 +
    engagementScore * 0.25 +
    retentionScore * 0.25 +
    usageScore * 0.2
  );

  return {
    financialHealth,
    engagementScore,
    retentionScore,
    usageScore,
    overallScore
  };
};

const ClientMetrics = ({ client, theme }) => {
  const themeClasses = getThemeClasses(theme);

  const metrics = useMemo(() => calculateMetrics(client), [client]);

  const performanceIndicators = [
    {
      label: 'Financial Health',
      value: metrics.financialHealth,
      icon: DollarSign,
      color: metrics.financialHealth >= 70 ? 'green' :
             metrics.financialHealth >= 40 ? 'yellow' : 'red'
    },
    {
      label: 'Engagement',
      value: metrics.engagementScore,
      icon: Activity,
      color: metrics.engagementScore >= 70 ? 'green' :
             metrics.engagementScore >= 40 ? 'yellow' : 'red'
    },
    {
      label: 'Retention',
      value: metrics.retentionScore,
      icon: Shield,
      color: metrics.retentionScore >= 70 ? 'green' :
             metrics.retentionScore >= 40 ? 'yellow' : 'red'
    },
    {
      label: 'Usage',
      value: metrics.usageScore,
      icon: BarChart3,
      color: metrics.usageScore >= 70 ? 'green' :
             metrics.usageScore >= 40 ? 'yellow' : 'red'
    }
  ];

  const ScoreBar = ({ label, score, color }) => {
    const getColorClass = () => {
      switch (color) {
        case 'green': return 'bg-green-500';
        case 'yellow': return 'bg-yellow-500';
        case 'red': return 'bg-red-500';
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
          <Target size={18} />
          Performance Metrics
        </h3>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          metrics.overallScore >= 70 ? themeClasses.bg.success :
          metrics.overallScore >= 50 ? themeClasses.bg.warning :
          themeClasses.bg.danger
        }`}>
          Score: {metrics.overallScore.toFixed(0)}%
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {performanceIndicators.map((indicator, index) => {
          const Icon = indicator.icon;
          const colorClasses = {
            green: 'text-green-500',
            yellow: 'text-yellow-500',
            red: 'text-red-500'
          };
          
          return (
            <div key={index} className={`p-3 rounded-lg ${themeClasses.bg.secondary}`}>
              <div className="flex items-center gap-2 mb-2">
                <Icon size={14} className={colorClasses[indicator.color]} />
                <span className={`text-xs ${themeClasses.text.secondary}`}>
                  {indicator.label}
                </span>
              </div>
              <p className={`text-sm font-medium ${colorClasses[indicator.color]}`}>
                {indicator.value.toFixed(0)}%
              </p>
            </div>
          );
        })}
      </div>

      <div className="space-y-1">
        <ScoreBar
          label="Overall Score"
          score={metrics.overallScore}
          color={
            metrics.overallScore >= 70 ? 'green' :
            metrics.overallScore >= 50 ? 'yellow' : 'red'
          }
        />
        <ScoreBar
          label="Financial Health"
          score={metrics.financialHealth}
          color={
            metrics.financialHealth >= 70 ? 'green' :
            metrics.financialHealth >= 40 ? 'yellow' : 'red'
          }
        />
        <ScoreBar
          label="Engagement"
          score={metrics.engagementScore}
          color={
            metrics.engagementScore >= 70 ? 'green' :
            metrics.engagementScore >= 40 ? 'yellow' : 'red'
          }
        />
        <ScoreBar
          label="Retention"
          score={metrics.retentionScore}
          color={
            metrics.retentionScore >= 70 ? 'green' :
            metrics.retentionScore >= 40 ? 'yellow' : 'red'
          }
        />
        <ScoreBar
          label="Usage"
          score={metrics.usageScore}
          color={
            metrics.usageScore >= 70 ? 'green' :
            metrics.usageScore >= 40 ? 'yellow' : 'red'
          }
        />
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <span className={`text-sm ${themeClasses.text.secondary}`}>Monthly Trend</span>
          <div className="flex items-center gap-1">
            {client.monthly_recurring_revenue > 0 ? (
              <>
                <TrendingUp className="text-green-500" size={16} />
                <span className="text-green-500 text-sm">
                  +{((client.monthly_recurring_revenue / (client.lifetime_value || 1)) * 100).toFixed(1)}%
                </span>
              </>
            ) : (
              <>
                <TrendingDown className="text-red-500" size={16} />
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