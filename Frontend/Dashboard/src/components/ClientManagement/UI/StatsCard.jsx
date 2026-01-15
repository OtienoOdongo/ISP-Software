import React from 'react';
import { FiTrendingUp, FiTrendingDown, FiMinus } from 'react-icons/fi';

const StatsCard = ({ 
  title,
  value,
  icon: Icon,
  trend = null,
  color = 'blue',
  theme = 'light',
  compact = false,
  onClick
}) => {
  // Color configurations
  const colorConfigs = {
    blue: {
      bg: theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-50',
      iconBg: theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-100',
      iconColor: 'text-blue-500',
      textColor: theme === 'dark' ? 'text-blue-300' : 'text-blue-600',
      border: theme === 'dark' ? 'border-blue-800/30' : 'border-blue-200'
    },
    green: {
      bg: theme === 'dark' ? 'bg-green-900/20' : 'bg-green-50',
      iconBg: theme === 'dark' ? 'bg-green-900/30' : 'bg-green-100',
      iconColor: 'text-green-500',
      textColor: theme === 'dark' ? 'text-green-300' : 'text-green-600',
      border: theme === 'dark' ? 'border-green-800/30' : 'border-green-200'
    },
    red: {
      bg: theme === 'dark' ? 'bg-red-900/20' : 'bg-red-50',
      iconBg: theme === 'dark' ? 'bg-red-900/30' : 'bg-red-100',
      iconColor: 'text-red-500',
      textColor: theme === 'dark' ? 'text-red-300' : 'text-red-600',
      border: theme === 'dark' ? 'border-red-800/30' : 'border-red-200'
    },
    yellow: {
      bg: theme === 'dark' ? 'bg-yellow-900/20' : 'bg-yellow-50',
      iconBg: theme === 'dark' ? 'bg-yellow-900/30' : 'bg-yellow-100',
      iconColor: 'text-yellow-500',
      textColor: theme === 'dark' ? 'text-yellow-300' : 'text-yellow-600',
      border: theme === 'dark' ? 'border-yellow-800/30' : 'border-yellow-200'
    },
    purple: {
      bg: theme === 'dark' ? 'bg-purple-900/20' : 'bg-purple-50',
      iconBg: theme === 'dark' ? 'bg-purple-900/30' : 'bg-purple-100',
      iconColor: 'text-purple-500',
      textColor: theme === 'dark' ? 'text-purple-300' : 'text-purple-600',
      border: theme === 'dark' ? 'border-purple-800/30' : 'border-purple-200'
    },
    gray: {
      bg: theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50',
      iconBg: theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100',
      iconColor: 'text-gray-500',
      textColor: theme === 'dark' ? 'text-gray-300' : 'text-gray-600',
      border: theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
    }
  };

  const colors = colorConfigs[color] || colorConfigs.blue;

  // Format value
  const formatValue = (val) => {
    if (typeof val === 'number') {
      if (val >= 1000000) {
        return `$${(val / 1000000).toFixed(1)}M`;
      }
      if (val >= 1000) {
        return `$${(val / 1000).toFixed(1)}K`;
      }
      return `$${val.toLocaleString()}`;
    }
    return val;
  };

  // Get trend icon and color
  const getTrendInfo = () => {
    if (!trend) return null;
    
    const { value: trendValue, direction } = trend;
    
    if (direction === 'up') {
      return {
        icon: FiTrendingUp,
        color: 'text-green-500',
        bg: theme === 'dark' ? 'bg-green-900/30' : 'bg-green-100'
      };
    } else if (direction === 'down') {
      return {
        icon: FiTrendingDown,
        color: 'text-red-500',
        bg: theme === 'dark' ? 'bg-red-900/30' : 'bg-red-100'
      };
    } else {
      return {
        icon: FiMinus,
        color: theme === 'dark' ? 'text-gray-400' : 'text-gray-500',
        bg: theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
      };
    }
  };

  const trendInfo = getTrendInfo();
  const TrendIcon = trendInfo?.icon;

  return (
    <div
      onClick={onClick}
      className={`rounded-xl border transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:scale-[1.02] hover:shadow-lg' : ''
      } ${colors.bg} ${colors.border} ${
        compact ? 'p-3' : 'p-4 md:p-5'
      }`}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className={`text-sm font-medium mb-1 ${colors.textColor}`}>
            {title}
          </p>
          <p className={`text-2xl md:text-3xl font-bold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            {formatValue(value)}
          </p>
          
          {/* Trend Display */}
          {trend && (
            <div className="flex items-center gap-2 mt-2">
              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${
                trendInfo.bg
              }`}>
                <TrendIcon size={12} className={trendInfo.color} />
                <span className={`font-medium ${trendInfo.color}`}>
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
        </div>
        
        {/* Icon */}
        {Icon && (
          <div className={`p-2 rounded-lg ${colors.iconBg}`}>
            <Icon size={compact ? 20 : 24} className={colors.iconColor} />
          </div>
        )}
      </div>
      
      {/* Additional Info */}
      {trend?.description && (
        <p className={`text-xs mt-3 pt-3 border-t ${
          theme === 'dark' ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-500'
        }`}>
          {trend.description}
        </p>
      )}
    </div>
  );
};

// Stats Grid Component
const StatsGrid = ({ 
  children, 
  cols = { sm: 1, md: 2, lg: 4 },
  gap = 4,
  className = ''
}) => {
  const gridCols = {
    sm: `grid-cols-${cols.sm}`,
    md: `md:grid-cols-${cols.md}`,
    lg: `lg:grid-cols-${cols.lg}`
  }.join(' ');

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
  theme = 'light'
}) => {
  const change = ((currentValue - previousValue) / previousValue) * 100;
  const isPositive = change >= 0;
  const absChange = Math.abs(change).toFixed(1);

  const trendConfig = {
    value: `${isPositive ? '+' : '-'}${absChange}%`,
    direction: isPositive ? 'up' : 'down',
    label: 'vs previous period'
  };

  return (
    <StatsCard
      title={title}
      value={`${currentValue.toLocaleString()}${unit}`}
      icon={Icon}
      trend={trendConfig}
      color={isPositive ? 'green' : 'red'}
      theme={theme}
    />
  );
};

StatsCard.Grid = StatsGrid;
StatsCard.Comparison = MetricComparisonCard;

export default StatsCard;