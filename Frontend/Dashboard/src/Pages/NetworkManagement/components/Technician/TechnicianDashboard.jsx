import React, { useState, useEffect } from "react";
import { 
  BarChart3, Users, Server, CheckCircle, AlertCircle, 
  Clock, TrendingUp, Activity, Wrench, Shield, Zap
} from "lucide-react";
import { getThemeClasses } from "../../../../components/ServiceManagement/Shared/components";

const TechnicianDashboard = ({ theme = "light" }) => {
  const themeClasses = getThemeClasses(theme);
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/network_management/technician-dashboard/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className={`p-6 rounded-xl border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className={`p-6 rounded-xl border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className={themeClasses.text.tertiary}>Failed to load dashboard data</p>
        </div>
      </div>
    );
  }

  const { user_info, workflow_statistics, system_overview, quick_actions } = dashboardData;

  const StatCard = ({ title, value, subtitle, icon: Icon, color = "blue" }) => (
    <div className={`p-4 rounded-lg border ${
      themeClasses.bg.card
    } ${themeClasses.border.medium}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm ${themeClasses.text.secondary}`}>{title}</p>
          <p className={`text-2xl font-bold ${themeClasses.text.primary}`}>{value}</p>
          {subtitle && (
            <p className={`text-xs ${themeClasses.text.tertiary}`}>{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-full ${
          color === 'green' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
          color === 'red' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
          color === 'yellow' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' :
          'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
        }`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`p-6 rounded-xl border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-2xl font-bold ${themeClasses.text.primary}`}>
              Technician Dashboard
            </h1>
            <p className={`text-sm ${themeClasses.text.secondary}`}>
              Welcome back, {user_info.username}
            </p>
          </div>
          <div className="text-right">
            <p className={`text-sm ${themeClasses.text.secondary}`}>Success Rate</p>
            <p className={`text-2xl font-bold ${
              workflow_statistics.success_rate >= 80 ? 'text-green-500' :
              workflow_statistics.success_rate >= 60 ? 'text-yellow-500' : 'text-red-500'
            }`}>
              {workflow_statistics.success_rate}%
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Workflows"
          value={workflow_statistics.total_workflows_30_days}
          subtitle="Last 30 days"
          icon={BarChart3}
          color="blue"
        />
        <StatCard
          title="Successful"
          value={workflow_statistics.successful_workflows}
          subtitle={`${workflow_statistics.success_rate}% success rate`}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          title="Total Routers"
          value={system_overview.total_routers}
          subtitle={`${system_overview.connected_routers} connected`}
          icon={Server}
          color="blue"
        />
        <StatCard
          title="Connection Rate"
          value={`${system_overview.connection_rate}%`}
          subtitle="Router connectivity"
          icon={Activity}
          color={system_overview.connection_rate >= 90 ? 'green' : 'yellow'}
        />
      </div>

      {/* Quick Actions */}
      <div className={`p-6 rounded-xl border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
        <h2 className={`text-lg font-semibold mb-4 ${themeClasses.text.primary}`}>
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quick_actions.map((action, index) => {
            const IconComponent = 
              action.icon === 'router' ? Server :
              action.icon === 'vpn' ? Shield :
              action.icon === 'settings' ? Wrench : Zap;
            
            return (
              <button
                key={index}
                className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                  theme === 'dark' 
                    ? 'border-gray-600 hover:border-gray-500 bg-gray-800/50 hover:bg-gray-700/50' 
                    : 'border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50'
                }`}
              >
                <IconComponent className="w-6 h-6 mb-2 text-blue-500" />
                <span className="font-medium block text-gray-900 dark:text-white">
                  {action.name}
                </span>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {action.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className={`p-6 rounded-xl border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
        <h2 className={`text-lg font-semibold mb-4 ${themeClasses.text.primary}`}>
          Recent Activity
        </h2>
        <div className="space-y-3">
          {workflow_statistics.recent_activities.map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="flex items-center space-x-3">
                {activity.success ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                )}
                <div>
                  <p className={`font-medium ${themeClasses.text.primary}`}>
                    {activity.action.replace(/_/g, ' ').toUpperCase()}
                  </p>
                  <p className={`text-sm ${themeClasses.text.secondary}`}>
                    {activity.router_name}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm ${themeClasses.text.tertiary}`}>
                  {new Date(activity.timestamp).toLocaleDateString()}
                </p>
                <p className={`text-xs ${
                  activity.success ? 'text-green-500' : 'text-red-500'
                }`}>
                  {activity.success ? 'Success' : 'Failed'}
                </p>
              </div>
            </div>
          ))}
          {workflow_statistics.recent_activities.length === 0 && (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className={themeClasses.text.tertiary}>No recent activity</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TechnicianDashboard;