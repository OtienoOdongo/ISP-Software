// import React from 'react';
// import { FiTrendingUp, FiTrendingDown, FiMinus } from 'react-icons/fi';

// const StatsCard = ({ 
//   title,
//   value,
//   icon: Icon,
//   trend = null,
//   color = 'blue',
//   theme = 'light',
//   compact = false,
//   onClick
// }) => {
//   // Color configurations
//   const colorConfigs = {
//     blue: {
//       bg: theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-50',
//       iconBg: theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-100',
//       iconColor: 'text-blue-500',
//       textColor: theme === 'dark' ? 'text-blue-300' : 'text-blue-600',
//       border: theme === 'dark' ? 'border-blue-800/30' : 'border-blue-200'
//     },
//     green: {
//       bg: theme === 'dark' ? 'bg-green-900/20' : 'bg-green-50',
//       iconBg: theme === 'dark' ? 'bg-green-900/30' : 'bg-green-100',
//       iconColor: 'text-green-500',
//       textColor: theme === 'dark' ? 'text-green-300' : 'text-green-600',
//       border: theme === 'dark' ? 'border-green-800/30' : 'border-green-200'
//     },
//     red: {
//       bg: theme === 'dark' ? 'bg-red-900/20' : 'bg-red-50',
//       iconBg: theme === 'dark' ? 'bg-red-900/30' : 'bg-red-100',
//       iconColor: 'text-red-500',
//       textColor: theme === 'dark' ? 'text-red-300' : 'text-red-600',
//       border: theme === 'dark' ? 'border-red-800/30' : 'border-red-200'
//     },
//     yellow: {
//       bg: theme === 'dark' ? 'bg-yellow-900/20' : 'bg-yellow-50',
//       iconBg: theme === 'dark' ? 'bg-yellow-900/30' : 'bg-yellow-100',
//       iconColor: 'text-yellow-500',
//       textColor: theme === 'dark' ? 'text-yellow-300' : 'text-yellow-600',
//       border: theme === 'dark' ? 'border-yellow-800/30' : 'border-yellow-200'
//     },
//     purple: {
//       bg: theme === 'dark' ? 'bg-purple-900/20' : 'bg-purple-50',
//       iconBg: theme === 'dark' ? 'bg-purple-900/30' : 'bg-purple-100',
//       iconColor: 'text-purple-500',
//       textColor: theme === 'dark' ? 'text-purple-300' : 'text-purple-600',
//       border: theme === 'dark' ? 'border-purple-800/30' : 'border-purple-200'
//     },
//     gray: {
//       bg: theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50',
//       iconBg: theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100',
//       iconColor: 'text-gray-500',
//       textColor: theme === 'dark' ? 'text-gray-300' : 'text-gray-600',
//       border: theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
//     }
//   };

//   const colors = colorConfigs[color] || colorConfigs.blue;

//   // Format value
//   const formatValue = (val) => {
//     if (typeof val === 'number') {
//       if (val >= 1000000) {
//         return `$${(val / 1000000).toFixed(1)}M`;
//       }
//       if (val >= 1000) {
//         return `$${(val / 1000).toFixed(1)}K`;
//       }
//       return `$${val.toLocaleString()}`;
//     }
//     return val;
//   };

//   // Get trend icon and color
//   const getTrendInfo = () => {
//     if (!trend) return null;
    
//     const { value: trendValue, direction } = trend;
    
//     if (direction === 'up') {
//       return {
//         icon: FiTrendingUp,
//         color: 'text-green-500',
//         bg: theme === 'dark' ? 'bg-green-900/30' : 'bg-green-100'
//       };
//     } else if (direction === 'down') {
//       return {
//         icon: FiTrendingDown,
//         color: 'text-red-500',
//         bg: theme === 'dark' ? 'bg-red-900/30' : 'bg-red-100'
//       };
//     } else {
//       return {
//         icon: FiMinus,
//         color: theme === 'dark' ? 'text-gray-400' : 'text-gray-500',
//         bg: theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
//       };
//     }
//   };

//   const trendInfo = getTrendInfo();
//   const TrendIcon = trendInfo?.icon;

//   return (
//     <div
//       onClick={onClick}
//       className={`rounded-xl border transition-all duration-200 ${
//         onClick ? 'cursor-pointer hover:scale-[1.02] hover:shadow-lg' : ''
//       } ${colors.bg} ${colors.border} ${
//         compact ? 'p-3' : 'p-4 md:p-5'
//       }`}
//       role={onClick ? 'button' : undefined}
//       tabIndex={onClick ? 0 : undefined}
//     >
//       <div className="flex items-start justify-between">
//         <div className="flex-1">
//           <p className={`text-sm font-medium mb-1 ${colors.textColor}`}>
//             {title}
//           </p>
//           <p className={`text-2xl md:text-3xl font-bold ${
//             theme === 'dark' ? 'text-white' : 'text-gray-900'
//           }`}>
//             {formatValue(value)}
//           </p>
          
//           {/* Trend Display */}
//           {trend && (
//             <div className="flex items-center gap-2 mt-2">
//               <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${
//                 trendInfo.bg
//               }`}>
//                 <TrendIcon size={12} className={trendInfo.color} />
//                 <span className={`font-medium ${trendInfo.color}`}>
//                   {trend.value}
//                 </span>
//               </div>
//               {trend.label && (
//                 <span className={`text-xs ${
//                   theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
//                 }`}>
//                   {trend.label}
//                 </span>
//               )}
//             </div>
//           )}
//         </div>
        
//         {/* Icon */}
//         {Icon && (
//           <div className={`p-2 rounded-lg ${colors.iconBg}`}>
//             <Icon size={compact ? 20 : 24} className={colors.iconColor} />
//           </div>
//         )}
//       </div>
      
//       {/* Additional Info */}
//       {trend?.description && (
//         <p className={`text-xs mt-3 pt-3 border-t ${
//           theme === 'dark' ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-500'
//         }`}>
//           {trend.description}
//         </p>
//       )}
//     </div>
//   );
// };

// // Stats Grid Component
// const StatsGrid = ({ 
//   children, 
//   cols = { sm: 1, md: 2, lg: 4 },
//   gap = 4,
//   className = ''
// }) => {
//   const gridCols = {
//     sm: `grid-cols-${cols.sm}`,
//     md: `md:grid-cols-${cols.md}`,
//     lg: `lg:grid-cols-${cols.lg}`
//   }.join(' ');

//   return (
//     <div className={`grid ${gridCols} gap-${gap} ${className}`}>
//       {children}
//     </div>
//   );
// };

// // Metric Comparison Card
// const MetricComparisonCard = ({
//   title,
//   currentValue,
//   previousValue,
//   unit = '',
//   icon: Icon,
//   theme = 'light'
// }) => {
//   const change = ((currentValue - previousValue) / previousValue) * 100;
//   const isPositive = change >= 0;
//   const absChange = Math.abs(change).toFixed(1);

//   const trendConfig = {
//     value: `${isPositive ? '+' : '-'}${absChange}%`,
//     direction: isPositive ? 'up' : 'down',
//     label: 'vs previous period'
//   };

//   return (
//     <StatsCard
//       title={title}
//       value={`${currentValue.toLocaleString()}${unit}`}
//       icon={Icon}
//       trend={trendConfig}
//       color={isPositive ? 'green' : 'red'}
//       theme={theme}
//     />
//   );
// };

// StatsCard.Grid = StatsGrid;
// StatsCard.Comparison = MetricComparisonCard;

// export default StatsCard;












import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const StatsCard = ({
  title,
  value,
  icon: Icon,
  trend = null,
  color = 'blue',
  theme = 'light',
  compact = false,
  onClick,
  loading = false,
  subtitle,
  footer,
  className = ''
}) => {
  // Color configurations
  const colorConfigs = {
    blue: {
      bg: theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-50',
      iconBg: theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-100',
      iconColor: 'text-blue-500',
      textColor: theme === 'dark' ? 'text-blue-300' : 'text-blue-600',
      border: theme === 'dark' ? 'border-blue-800/30' : 'border-blue-200',
      gradient: 'from-blue-500 to-blue-600'
    },
    green: {
      bg: theme === 'dark' ? 'bg-green-900/20' : 'bg-green-50',
      iconBg: theme === 'dark' ? 'bg-green-900/30' : 'bg-green-100',
      iconColor: 'text-green-500',
      textColor: theme === 'dark' ? 'text-green-300' : 'text-green-600',
      border: theme === 'dark' ? 'border-green-800/30' : 'border-green-200',
      gradient: 'from-green-500 to-green-600'
    },
    red: {
      bg: theme === 'dark' ? 'bg-red-900/20' : 'bg-red-50',
      iconBg: theme === 'dark' ? 'bg-red-900/30' : 'bg-red-100',
      iconColor: 'text-red-500',
      textColor: theme === 'dark' ? 'text-red-300' : 'text-red-600',
      border: theme === 'dark' ? 'border-red-800/30' : 'border-red-200',
      gradient: 'from-red-500 to-red-600'
    },
    yellow: {
      bg: theme === 'dark' ? 'bg-yellow-900/20' : 'bg-yellow-50',
      iconBg: theme === 'dark' ? 'bg-yellow-900/30' : 'bg-yellow-100',
      iconColor: 'text-yellow-500',
      textColor: theme === 'dark' ? 'text-yellow-300' : 'text-yellow-600',
      border: theme === 'dark' ? 'border-yellow-800/30' : 'border-yellow-200',
      gradient: 'from-yellow-500 to-yellow-600'
    },
    purple: {
      bg: theme === 'dark' ? 'bg-purple-900/20' : 'bg-purple-50',
      iconBg: theme === 'dark' ? 'bg-purple-900/30' : 'bg-purple-100',
      iconColor: 'text-purple-500',
      textColor: theme === 'dark' ? 'text-purple-300' : 'text-purple-600',
      border: theme === 'dark' ? 'border-purple-800/30' : 'border-purple-200',
      gradient: 'from-purple-500 to-purple-600'
    },
    indigo: {
      bg: theme === 'dark' ? 'bg-indigo-900/20' : 'bg-indigo-50',
      iconBg: theme === 'dark' ? 'bg-indigo-900/30' : 'bg-indigo-100',
      iconColor: 'text-indigo-500',
      textColor: theme === 'dark' ? 'text-indigo-300' : 'text-indigo-600',
      border: theme === 'dark' ? 'border-indigo-800/30' : 'border-indigo-200',
      gradient: 'from-indigo-500 to-indigo-600'
    },
    orange: {
      bg: theme === 'dark' ? 'bg-orange-900/20' : 'bg-orange-50',
      iconBg: theme === 'dark' ? 'bg-orange-900/30' : 'bg-orange-100',
      iconColor: 'text-orange-500',
      textColor: theme === 'dark' ? 'text-orange-300' : 'text-orange-600',
      border: theme === 'dark' ? 'border-orange-800/30' : 'border-orange-200',
      gradient: 'from-orange-500 to-orange-600'
    },
    gray: {
      bg: theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50',
      iconBg: theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100',
      iconColor: 'text-gray-500',
      textColor: theme === 'dark' ? 'text-gray-300' : 'text-gray-600',
      border: theme === 'dark' ? 'border-gray-700' : 'border-gray-200',
      gradient: 'from-gray-500 to-gray-600'
    }
  };

  const colors = colorConfigs[color] || colorConfigs.blue;

  // Format value based on type
  const formatValue = (val) => {
    if (val === null || val === undefined) return '0';
    if (typeof val === 'number') {
      if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
      if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
    }
    return val;
  };

  // Get trend icon
  const getTrendIcon = () => {
    if (!trend) return null;
    
    const { direction } = trend;
    
    if (direction === 'up') {
      return <TrendingUp className="w-3 h-3 text-green-500" />;
    } else if (direction === 'down') {
      return <TrendingDown className="w-3 h-3 text-red-500" />;
    } else {
      return <Minus className="w-3 h-3 text-gray-400" />;
    }
  };

  // Get trend color
  const getTrendColor = () => {
    if (!trend) return '';
    
    const { direction } = trend;
    
    if (direction === 'up') return 'text-green-600 dark:text-green-400';
    if (direction === 'down') return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  if (loading) {
    return (
      <div className={`rounded-xl border ${colors.bg} ${colors.border} ${compact ? 'p-3' : 'p-4'} animate-pulse`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-2"></div>
            <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
          </div>
          <div className={`p-2 rounded-lg ${colors.iconBg}`}>
            {Icon && <div className="w-6 h-6 bg-gray-400 dark:bg-gray-500 rounded" />}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      whileHover={onClick ? { scale: 1.02, y: -2 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      onClick={onClick}
      className={`rounded-xl border transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:shadow-xl' : ''
      } ${colors.bg} ${colors.border} ${compact ? 'p-3' : 'p-4'} ${className}`}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {/* Title */}
          <p className={`text-sm font-medium mb-1 truncate ${colors.textColor}`}>
            {title}
          </p>

          {/* Value */}
          <div className="flex items-baseline gap-2">
            <p className={`text-xl md:text-2xl font-bold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {formatValue(value)}
            </p>
            
            {/* Subtitle if provided */}
            {subtitle && (
              <span className={`text-xs ${themeClasses?.text?.secondary || 'text-gray-500'}`}>
                {subtitle}
              </span>
            )}
          </div>

          {/* Trend Display */}
          {trend && (
            <div className="flex items-center gap-2 mt-2">
              <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
                trend.direction === 'up' ? 'bg-green-100 dark:bg-green-900/30' :
                trend.direction === 'down' ? 'bg-red-100 dark:bg-red-900/30' :
                'bg-gray-100 dark:bg-gray-800'
              }`}>
                {getTrendIcon()}
                <span className={getTrendColor()}>
                  {trend.value}
                </span>
              </div>
              {trend.label && (
                <span className={`text-xs ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {trend.label}
                </span>
              )}
            </div>
          )}

          {/* Footer */}
          {footer && (
            <div className="mt-3 text-xs">
              {footer}
            </div>
          )}
        </div>

        {/* Icon */}
        {Icon && (
          <div className={`p-2 rounded-lg ${colors.iconBg} flex-shrink-0`}>
            <Icon size={compact ? 20 : 24} className={colors.iconColor} />
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Stats Grid Component
const StatsGrid = ({ 
  children, 
  cols = { xs: 1, sm: 2, md: 2, lg: 4 },
  gap = 4,
  className = ''
}) => {
  const gridCols = [
    `grid-cols-${cols.xs || 1}`,
    cols.sm && `sm:grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`
  ].filter(Boolean).join(' ');

  return (
    <div className={`grid ${gridCols} gap-${gap} ${className}`}>
      {children}
    </div>
  );
};

// Metric Comparison Card
const MetricComparisonCard = ({
  title,
  currentValue,
  previousValue,
  unit = '',
  icon: Icon,
  theme = 'light',
  format = 'number'
}) => {
  const change = previousValue ? ((currentValue - previousValue) / previousValue) * 100 : 0;
  const isPositive = change >= 0;
  const absChange = Math.abs(change).toFixed(1);

  const formatValue = (val) => {
    if (format === 'currency') return `KES ${val.toLocaleString()}`;
    if (format === 'percentage') return `${val}%`;
    return val.toLocaleString();
  };

  const trendConfig = {
    value: `${isPositive ? '+' : '-'}${absChange}%`,
    direction: isPositive ? 'up' : 'down',
    label: 'vs previous period'
  };

  return (
    <StatsCard
      title={title}
      value={`${formatValue(currentValue)}${unit}`}
      icon={Icon}
      trend={trendConfig}
      color={isPositive ? 'green' : 'red'}
      theme={theme}
    />
  );
};

// Progress Stats Card
const ProgressStatsCard = ({
  title,
  value,
  total,
  icon: Icon,
  color = 'blue',
  theme = 'light',
  showPercentage = true
}) => {
  const percentage = total > 0 ? (value / total) * 100 : 0;

  const colorConfigs = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500',
    indigo: 'bg-indigo-500'
  };

  return (
    <StatsCard
      title={title}
      value={value.toLocaleString()}
      icon={Icon}
      color={color}
      theme={theme}
      footer={
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span>Progress</span>
            {showPercentage && <span>{percentage.toFixed(1)}%</span>}
          </div>
          <div className={`h-1.5 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
            <div
              className={`h-full rounded-full ${colorConfigs[color] || 'bg-blue-500'}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      }
    />
  );
};

StatsCard.Grid = StatsGrid;
StatsCard.Comparison = MetricComparisonCard;
StatsCard.Progress = ProgressStatsCard;

export default StatsCard;