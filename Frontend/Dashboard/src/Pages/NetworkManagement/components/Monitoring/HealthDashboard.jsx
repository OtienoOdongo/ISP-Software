




// src/Pages/NetworkManagement/components/Monitoring/HealthDashboard.jsx
import React from "react";
import { Activity, Wifi, Cable, Server, Clock, AlertCircle, CheckCircle, XCircle, Users } from "lucide-react";
import { getThemeClasses } from "../../../../components/ServiceManagement/Shared/components"

const HealthDashboard = ({ 
  healthStats, 
  systemMetrics, 
  activeRouter, 
  theme = "light" 
}) => {
  const themeClasses = getThemeClasses(theme);

  const formatTimeSince = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp);
    const seconds = Math.floor((new Date() - date) / 1000);
    
    const intervals = [
      { label: "year", seconds: 31536000 },
      { label: "month", seconds: 2592000 },
      { label: "day", seconds: 86400 },
      { label: "hour", seconds: 3600 },
      { label: "minute", seconds: 60 }
    ];
    
    for (const interval of intervals) {
      const count = Math.floor(seconds / interval.seconds);
      if (count >= 1) {
        return `${count} ${interval.label}${count === 1 ? "" : "s"} ago`;
      }
    }
    
    return `${Math.floor(seconds)} second${seconds === 1 ? "" : "s"} ago`;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "online":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "offline":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "online":
        return "text-green-500";
      case "offline":
        return "text-red-500";
      default:
        return "text-yellow-500";
    }
  };

  // Filter health stats for active router
  const routerHealthStats = activeRouter 
    ? healthStats.filter(stat => stat.router === activeRouter.id)
    : [];

  const latestHealth = routerHealthStats[0] || {};
  const metrics = systemMetrics[activeRouter?.id] || {};

  return (
    <div className={`p-6 rounded-xl shadow-lg backdrop-blur-md transition-all duration-300 border ${
      themeClasses.bg.card
    } ${themeClasses.border.light}`}>
      <h3 className={`text-lg font-semibold mb-4 flex items-center ${themeClasses.text.primary}`}>
        <Activity className="w-5 h-5 mr-2" />
        Health Dashboard
        {activeRouter && (
          <span className={`text-sm font-normal ml-2 ${themeClasses.text.tertiary}`}>
            - {activeRouter.name}
          </span>
        )}
      </h3>
      
      <div className="space-y-4">
        {/* Overall Health Status */}
        <div className={`p-4 rounded-lg border ${
          latestHealth.status === "online" 
            ? theme === "dark" ? "bg-green-900/20 border-green-800" : "bg-green-50 border-green-200"
            : latestHealth.status === "offline"
            ? theme === "dark" ? "bg-red-900/20 border-red-800" : "bg-red-50 border-red-200"
            : theme === "dark" ? "bg-yellow-900/20 border-yellow-800" : "bg-yellow-50 border-yellow-200"
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getStatusIcon(latestHealth.status)}
              <div>
                <p className="font-medium">Router Status</p>
                <p className={`text-sm ${getStatusColor(latestHealth.status)}`}>
                  {latestHealth.status ? latestHealth.status.charAt(0).toUpperCase() + latestHealth.status.slice(1) : "Unknown"}
                </p>
              </div>
            </div>
            {latestHealth.response_time && (
              <div className="text-right">
                <p className={`text-sm ${themeClasses.text.tertiary}`}>Response Time</p>
                <p className="font-medium">{latestHealth.response_time}s</p>
              </div>
            )}
          </div>
          {latestHealth.timestamp && (
            <p className={`text-xs ${themeClasses.text.tertiary} mt-2`}>
              Last checked: {formatTimeSince(latestHealth.timestamp)}
            </p>
          )}
        </div>

        {/* System Metrics */}
        {metrics && Object.keys(metrics).length > 0 && (
          <div className="space-y-3">
            <h4 className={`font-medium text-sm ${themeClasses.text.secondary}`}>System Metrics</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-3 rounded-lg ${
                theme === "dark" ? "bg-gray-700/50" : "bg-gray-100"
              }`}>
                <div className="flex items-center space-x-2 mb-1">
                  <Server className="w-4 h-4 text-blue-500" />
                  <span className={`text-sm ${themeClasses.text.tertiary}`}>CPU Load</span>
                </div>
                <p className="text-lg font-semibold">{metrics.cpu_load || 0}%</p>
              </div>

              <div className={`p-3 rounded-lg ${
                theme === "dark" ? "bg-gray-700/50" : "bg-gray-100"
              }`}>
                <div className="flex items-center space-x-2 mb-1">
                  <Activity className="w-4 h-4 text-purple-500" />
                  <span className={`text-sm ${themeClasses.text.tertiary}`}>Memory</span>
                </div>
                <p className="text-lg font-semibold">
                  {metrics.free_memory ? Math.round(metrics.free_memory / 1024 / 1024) : 0}MB
                </p>
              </div>
            </div>

            {/* Session Counts */}
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-3 rounded-lg border ${
                theme === "dark" ? "bg-blue-900/20 border-blue-800" : "bg-blue-50 border-blue-200"
              }`}>
                <div className="flex items-center space-x-2 mb-1">
                  <Wifi className="w-4 h-4 text-blue-500" />
                  <span className={`text-sm ${themeClasses.text.tertiary}`}>Hotspot Sessions</span>
                </div>
                <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                  {metrics.hotspot_sessions || 0}
                </p>
              </div>

              <div className={`p-3 rounded-lg border ${
                theme === "dark" ? "bg-green-900/20 border-green-800" : "bg-green-50 border-green-200"
              }`}>
                <div className="flex items-center space-x-2 mb-1">
                  <Cable className="w-4 h-4 text-green-500" />
                  <span className={`text-sm ${themeClasses.text.tertiary}`}>PPPoE Sessions</span>
                </div>
                <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                  {metrics.pppoe_sessions || 0}
                </p>
              </div>
            </div>

            {/* Total Sessions */}
            <div className={`p-3 rounded-lg border ${
              theme === "dark" ? "bg-purple-900/20 border-purple-800" : "bg-purple-50 border-purple-200"
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-purple-500" />
                  <span className={`text-sm ${themeClasses.text.tertiary}`}>Total Active Sessions</span>
                </div>
                <p className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                  {metrics.total_sessions || 0}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Uptime Information */}
        {metrics.uptime && metrics.uptime !== "0" && (
          <div className={`p-3 rounded-lg ${
            theme === "dark" ? "bg-gray-700/50" : "bg-gray-100"
          }`}>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-green-500" />
              <div>
                <p className={`text-sm font-medium ${themeClasses.text.secondary}`}>System Uptime</p>
                <p className={`text-sm ${themeClasses.text.tertiary}`}>{metrics.uptime}</p>
              </div>
            </div>
          </div>
        )}

        {!activeRouter && (
          <div className="text-center py-4">
            <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className={`text-sm ${themeClasses.text.tertiary}`}>Select a router to view health metrics</p>
          </div>
        )}

        {activeRouter && routerHealthStats.length === 0 && (
          <div className="text-center py-4">
            <Activity className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className={`text-sm ${themeClasses.text.tertiary}`}>No health data available</p>
            <p className={`text-xs ${themeClasses.text.tertiary} mt-1`}>
              Health checks run automatically every 30 seconds
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthDashboard;