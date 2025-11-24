

// // src/Pages/NetworkManagement/components/Common/StatsCard.jsx
// import React from "react";
// import { motion } from "framer-motion";
// import { getThemeClasses } from "../../../../components/ServiceManagement/Shared/components";

// const StatsCard = ({ 
//   title, 
//   value, 
//   icon, 
//   unit = "", 
//   theme, 
//   color = "blue",
//   trend = null,
//   subtitle = "" 
// }) => {
//   const themeClasses = getThemeClasses(theme);
  
//   const colorClasses = {
//     blue: "bg-blue-500",
//     green: "bg-green-500",
//     red: "bg-red-500",
//     purple: "bg-purple-500",
//     orange: "bg-orange-500",
//     indigo: "bg-indigo-500"
//   };
  
//   const trendColors = {
//     up: "text-green-500",
//     down: "text-red-500",
//     neutral: themeClasses.text.tertiary
//   };
  
//   return (
//     <motion.div 
//       whileHover={{ y: -2, scale: 1.02 }}
//       className={`p-6 rounded-xl shadow-lg backdrop-blur-md transition-all duration-300 border ${themeClasses.bg.card} ${themeClasses.border.light}`}
//     >
//       <div className="flex items-center justify-between">
//         <div className="flex-1">
//           <p className={`text-sm font-medium ${themeClasses.text.secondary}`}>
//             {title}
//           </p>
//           <div className="flex items-baseline space-x-2 mt-1">
//             <p className={`text-2xl font-bold ${themeClasses.text.primary}`}>
//               {value}
//             </p>
//             {unit && (
//               <span className={`text-sm ${themeClasses.text.secondary}`}>
//                 {unit}
//               </span>
//             )}
//           </div>
//           {subtitle && (
//             <p className={`text-xs mt-1 ${themeClasses.text.tertiary}`}>
//               {subtitle}
//             </p>
//           )}
//           {trend && (
//             <div className={`flex items-center text-xs mt-1 ${trendColors[trend.direction]}`}>
//               <span>{trend.value}</span>
//               <span className="ml-1">{trend.direction === 'up' ? '↗' : trend.direction === 'down' ? '↘' : '→'}</span>
//             </div>
//           )}
//         </div>
//         <div className={`p-3 rounded-full ${colorClasses[color]} text-white shadow-lg`}>
//           {icon}
//         </div>
//       </div>
//     </motion.div>
//   );
// };

// export default StatsCard;








// src/Pages/NetworkManagement/components/Common/StatsCard.jsx
import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from "lucide-react";
import { getThemeClasses } from "../../../../components/ServiceManagement/Shared/components";

const StatsCard = ({ 
  title, 
  value, 
  icon, 
  unit = "", 
  theme, 
  color = "blue",
  trend = null,
  subtitle = "",
  onClick,
  loading = false,
  alert = false,
  size = "default",
  className = ""
}) => {
  const themeClasses = getThemeClasses(theme);
  
  const colorConfig = {
    blue: {
      bg: "bg-blue-500 dark:bg-blue-600",
      text: "text-blue-600 dark:text-blue-400",
      light: "bg-blue-50 dark:bg-blue-900/20",
      border: "border-blue-200 dark:border-blue-800"
    },
    green: {
      bg: "bg-green-500 dark:bg-green-600", 
      text: "text-green-600 dark:text-green-400",
      light: "bg-green-50 dark:bg-green-900/20",
      border: "border-green-200 dark:border-green-800"
    },
    red: {
      bg: "bg-red-500 dark:bg-red-600",
      text: "text-red-600 dark:text-red-400", 
      light: "bg-red-50 dark:bg-red-900/20",
      border: "border-red-200 dark:border-red-800"
    },
    purple: {
      bg: "bg-purple-500 dark:bg-purple-600",
      text: "text-purple-600 dark:text-purple-400",
      light: "bg-purple-50 dark:bg-purple-900/20", 
      border: "border-purple-200 dark:border-purple-800"
    },
    orange: {
      bg: "bg-orange-500 dark:bg-orange-600",
      text: "text-orange-600 dark:text-orange-400",
      light: "bg-orange-50 dark:bg-orange-900/20",
      border: "border-orange-200 dark:border-orange-800"
    },
    indigo: {
      bg: "bg-indigo-500 dark:bg-indigo-600",
      text: "text-indigo-600 dark:text-indigo-400",
      light: "bg-indigo-50 dark:bg-indigo-900/20",
      border: "border-indigo-200 dark:border-indigo-800"
    }
  };
  
  const sizeConfig = {
    small: {
      padding: "p-4",
      title: "text-xs",
      value: "text-lg",
      icon: "p-2"
    },
    default: {
      padding: "p-6", 
      title: "text-sm",
      value: "text-2xl",
      icon: "p-3"
    },
    large: {
      padding: "p-8",
      title: "text-base",
      value: "text-3xl",
      icon: "p-4"
    }
  };
  
  const currentColor = colorConfig[color] || colorConfig.blue;
  const currentSize = sizeConfig[size] || sizeConfig.default;
  
  const getTrendIcon = () => {
    if (!trend) return null;
    
    const iconClass = "w-3 h-3";
    
    switch (trend.direction) {
      case 'up':
        return <TrendingUp className={`${iconClass} text-green-500`} />;
      case 'down':
        return <TrendingDown className={`${iconClass} text-red-500`} />;
      case 'neutral':
      default:
        return <Minus className={`${iconClass} text-gray-500`} />;
    }
  };

  const getTrendColor = () => {
    if (!trend) return themeClasses.text.tertiary;
    
    switch (trend.direction) {
      case 'up': return "text-green-600 dark:text-green-400";
      case 'down': return "text-red-600 dark:text-red-400";
      case 'neutral': 
      default: return themeClasses.text.tertiary;
    }
  };

  return (
    <motion.div 
      whileHover={{ y: -4, scale: onClick ? 1.02 : 1 }}
      whileTap={onClick ? { scale: 0.98 } : {}}
      onClick={onClick}
      className={`rounded-xl shadow-lg backdrop-blur-md transition-all duration-300 border cursor-${onClick ? 'pointer' : 'default'} relative overflow-hidden ${currentSize.padding} ${themeClasses.bg.card} ${themeClasses.border.light} ${className} ${
        alert ? `ring-2 ring-yellow-400 ${currentColor.light}` : ''
      }`}
    >
      {/* Alert Badge */}
      {alert && (
        <div className="absolute top-2 right-2">
          <AlertTriangle className="w-4 h-4 text-yellow-500 animate-pulse" />
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className={`font-medium ${currentSize.title} ${themeClasses.text.secondary} mb-1`}>
            {title}
          </p>
          
          <div className="flex items-baseline space-x-2">
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className={`w-6 h-6 border-2 ${currentColor.text} border-t-transparent rounded-full animate-spin`} />
                <span className={`${currentSize.value} ${themeClasses.text.tertiary}`}>Loading...</span>
              </div>
            ) : (
              <>
                <p className={`font-bold ${currentSize.value} ${themeClasses.text.primary}`}>
                  {value}
                </p>
                {unit && (
                  <span className={`text-sm ${themeClasses.text.secondary}`}>
                    {unit}
                  </span>
                )}
              </>
            )}
          </div>
          
          {/* Subtitle and Trend */}
          {(subtitle || trend) && (
            <div className="flex items-center justify-between mt-2">
              {subtitle && (
                <p className={`text-xs ${themeClasses.text.tertiary}`}>
                  {subtitle}
                </p>
              )}
              
              {trend && (
                <div className={`flex items-center text-xs ${getTrendColor()}`}>
                  {getTrendIcon()}
                  <span className="ml-1 font-medium">
                    {trend.value}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Icon */}
        <div className={`rounded-full ${currentColor.bg} text-white shadow-lg ${currentSize.icon}`}>
          {React.cloneElement(icon, { className: "w-4 h-4" })}
        </div>
      </div>
    </motion.div>
  );
};

export default StatsCard;