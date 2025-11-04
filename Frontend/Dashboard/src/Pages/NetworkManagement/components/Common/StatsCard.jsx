// src/Pages/NetworkManagement/components/Common/StatsCard.jsx
import React from "react";
import { motion } from "framer-motion";

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
    neutral: "text-gray-500"
  };
  
  return (
    <motion.div 
      whileHover={{ y: -2, scale: 1.02 }}
      className={`p-6 rounded-xl shadow-lg backdrop-blur-md transition-all duration-300 ${
        theme === "dark" 
          ? "bg-gray-800/80 hover:bg-gray-800 border border-gray-700" 
          : "bg-white hover:bg-gray-50 border border-gray-200"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className={`text-sm font-medium ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
            {title}
          </p>
          <div className="flex items-baseline space-x-2 mt-1">
            <p className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
              {value}
            </p>
            {unit && (
              <span className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                {unit}
              </span>
            )}
          </div>
          {subtitle && (
            <p className={`text-xs mt-1 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
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