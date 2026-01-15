// src/pages/ServiceOperations/components/SystemMonitoring.jsx
import React from "react";
import { Activity, Heart, Zap, AlertCircle, CheckCircle } from "lucide-react";
import { getThemeClasses } from "../../Shared/components";

const SystemMonitoring = ({ healthStatus, queueStats, operationStats, theme }) => {
  const themeClasses = getThemeClasses(theme);

  const health = healthStatus?.status || "unknown";
  const healthColor = health === "healthy" ? "green" : health === "degraded" ? "yellow" : "red";

  return (
    <div className={`space-y-6 ${themeClasses.bg.primary}`}>
      <h2 className="text-2xl font-bold">System Monitoring</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* System Health */}
        <div className={`p-6 rounded-xl ${themeClasses.bg.card} border ${themeClasses.border.light}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Heart className="w-5 h-5" />
              System Health
            </h3>
            {health === "healthy" ? <CheckCircle className="w-6 h-6 text-green-600" /> :
             health === "degraded" ? <AlertCircle className="w-6 h-6 text-yellow-600" /> :
             <AlertCircle className="w-6 h-6 text-red-600" />}
          </div>
          <p className={`text-2xl font-bold capitalize ${
            healthColor === "green" ? "text-green-600" :
            healthColor === "yellow" ? "text-yellow-600" : "text-red-600"
          }`}>
            {health}
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Last checked: {healthStatus?.checked_at ? new Date(healthStatus.checked_at).toLocaleTimeString() : "N/A"}
          </p>
        </div>

        {/* Activation Queue */}
        <div className={`p-6 rounded-xl ${themeClasses.bg.card} border ${themeClasses.border.light}`}>
          <h3 className="font-semibold flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5" />
            Activation Queue
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Pending</span>
              <span className="font-bold">{queueStats?.statistics?.queue?.pending || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Processing</span>
              <span className="font-bold">{queueStats?.statistics?.queue?.processing || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Failed</span>
              <span className="font-bold text-red-600">{queueStats?.statistics?.queue?.failed || 0}</span>
            </div>
          </div>
        </div>

        {/* Operations Stats */}
        <div className={`p-6 rounded-xl ${themeClasses.bg.card} border ${themeClasses.border.light}`}>
          <h3 className="font-semibold flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5" />
            Recent Activity
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Per Hour</span>
              <span className="font-bold">{operationStats?.statistics?.recent_activity?.total || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Success Rate</span>
              <span className="font-bold text-green-600">
                {operationStats?.statistics?.success_rate ? `${operationStats.statistics.success_rate}%` : "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Errors (24h)</span>
              <span className="font-bold text-red-600">{operationStats?.statistics?.errors_last_24h || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemMonitoring;