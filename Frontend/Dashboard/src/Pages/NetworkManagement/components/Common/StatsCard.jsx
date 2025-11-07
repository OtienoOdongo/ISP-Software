

// src/Pages/NetworkManagement/components/Common/StatsCard.jsx
import React from "react";
import { motion } from "framer-motion";
import { getThemeClasses } from "../../../../components/ServiceManagement/Shared/components";

const StatsCard = ({ 
  title, 
  value, 
  icon, 
  unit = "", 
  theme, 
  color = "blue",
  trend = null,
  subtitle = "" 
}) => {
  const themeClasses = getThemeClasses(theme);
  
  const colorClasses = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    red: "bg-red-500",
    purple: "bg-purple-500",
    orange: "bg-orange-500",
    indigo: "bg-indigo-500"
  };
  
  const trendColors = {
    up: "text-green-500",
    down: "text-red-500",
    neutral: themeClasses.text.tertiary
  };
  
  return (
    <motion.div 
      whileHover={{ y: -2, scale: 1.02 }}
      className={`p-6 rounded-xl shadow-lg backdrop-blur-md transition-all duration-300 border ${themeClasses.bg.card} ${themeClasses.border.light}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className={`text-sm font-medium ${themeClasses.text.secondary}`}>
            {title}
          </p>
          <div className="flex items-baseline space-x-2 mt-1">
            <p className={`text-2xl font-bold ${themeClasses.text.primary}`}>
              {value}
            </p>
            {unit && (
              <span className={`text-sm ${themeClasses.text.secondary}`}>
                {unit}
              </span>
            )}
          </div>
          {subtitle && (
            <p className={`text-xs mt-1 ${themeClasses.text.tertiary}`}>
              {subtitle}
            </p>
          )}
          {trend && (
            <div className={`flex items-center text-xs mt-1 ${trendColors[trend.direction]}`}>
              <span>{trend.value}</span>
              <span className="ml-1">{trend.direction === 'up' ? '↗' : trend.direction === 'down' ? '↘' : '→'}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${colorClasses[color]} text-white shadow-lg`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
};

export default StatsCard;