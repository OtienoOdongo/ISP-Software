// src/Pages/NetworkManagement/components/Monitoring/DiagnosticsPanel.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, Cpu, HardDrive, Network, Shield, AlertTriangle, 
  CheckCircle, XCircle, Clock, RefreshCw, Download, Upload 
} from 'lucide-react';
import CustomButton from '../Common/CustomButton';
import { getThemeClasses } from '../../../../components/ServiceManagement/Shared/components';

const DiagnosticsPanel = ({ 
  router, 
  theme = "light", 
  diagnosticsData = {}, 
  onRunDiagnostics,
  isLoading = false 
}) => {
  const themeClasses = getThemeClasses(theme);
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'performance', label: 'Performance', icon: Cpu },
    { id: 'network', label: 'Network', icon: Network },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'critical': return 'text-red-500';
      default: return themeClasses.text.tertiary;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'critical': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const diagnostics = diagnosticsData[router?.id] || {};

  return (
    <div className={`p-6 rounded-xl border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${
            theme === "dark" ? "bg-blue-900/50" : "bg-blue-100"
          }`}>
            <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className={`text-lg font-semibold ${themeClasses.text.primary}`}>
              Router Diagnostics
            </h3>
            <p className={`text-sm ${themeClasses.text.secondary}`}>
              {router?.name} • {router?.ip}
            </p>
          </div>
        </div>
        
        <CustomButton
          onClick={() => onRunDiagnostics(router.id)}
          icon={<RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />}
          label={isLoading ? "Running..." : "Run Diagnostics"}
          variant="primary"
          size="sm"
          disabled={isLoading}
          theme={theme}
        />
      </div>

      {/* Last Run Info */}
      {diagnostics.timestamp && (
        <div className={`p-3 rounded-lg border mb-6 ${
          theme === "dark" ? "bg-gray-700/50 border-gray-600" : "bg-gray-50 border-gray-200"
        }`}>
          <div className="flex items-center justify-between text-sm">
            <span className={themeClasses.text.secondary}>
              Last diagnostics: {new Date(diagnostics.timestamp).toLocaleString()}
            </span>
            <span className={`font-medium ${
              diagnostics.overall_health === 'healthy' ? 'text-green-600' :
              diagnostics.overall_health === 'warning' ? 'text-yellow-600' : 'text-red-600'
            }`}>
              Overall: {diagnostics.overall_health?.toUpperCase()}
            </span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      {!diagnostics.timestamp ? (
        <div className="text-center py-12">
          <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h4 className={`text-lg font-medium mb-2 ${themeClasses.text.primary}`}>
            No Diagnostics Data
          </h4>
          <p className={`mb-6 ${themeClasses.text.secondary}`}>
            Run diagnostics to get detailed information about your router's health and performance.
          </p>
          <CustomButton
            onClick={() => onRunDiagnostics(router.id)}
            icon={<Activity className="w-4 h-4" />}
            label="Run Diagnostics"
            variant="primary"
            theme={theme}
          />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { 
                  label: 'System Health', 
                  value: diagnostics.system_health?.status || 'unknown',
                  icon: Cpu,
                  description: 'Overall system status'
                },
                { 
                  label: 'CPU Usage', 
                  value: diagnostics.performance?.cpu_usage ? `${diagnostics.performance.cpu_usage}%` : 'N/A',
                  icon: Cpu,
                  description: 'Current CPU utilization'
                },
                { 
                  label: 'Memory Usage', 
                  value: diagnostics.performance?.memory_usage ? `${diagnostics.performance.memory_usage}%` : 'N/A',
                  icon: HardDrive,
                  description: 'RAM utilization'
                },
                { 
                  label: 'Network Connectivity', 
                  value: diagnostics.network?.connectivity_status || 'unknown',
                  icon: Network,
                  description: 'Internet connectivity'
                },
                { 
                  label: 'Active Connections', 
                  value: diagnostics.network?.active_connections || 0,
                  icon: Network,
                  description: 'Current connections'
                },
                { 
                  label: 'Uptime', 
                  value: diagnostics.system_health?.uptime || 'N/A',
                  icon: Clock,
                  description: 'System uptime'
                },
              ].map((metric, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-lg border ${themeClasses.border.light}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <metric.icon className="w-5 h-5 text-blue-500" />
                    {getStatusIcon(metric.value)}
                  </div>
                  <h4 className={`font-medium ${themeClasses.text.primary}`}>{metric.label}</h4>
                  <p className={`text-2xl font-bold mt-1 ${getStatusColor(metric.value)}`}>
                    {metric.value}
                  </p>
                  <p className={`text-xs mt-1 ${themeClasses.text.tertiary}`}>
                    {metric.description}
                  </p>
                </motion.div>
              ))}
            </div>
          )}

          {/* Performance Tab */}
          {activeTab === 'performance' && diagnostics.performance && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-4 rounded-lg border ${themeClasses.border.light}`}>
                  <h4 className={`font-medium mb-3 ${themeClasses.text.primary}`}>CPU & Memory</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className={themeClasses.text.secondary}>CPU Usage</span>
                        <span className={themeClasses.text.primary}>{diagnostics.performance.cpu_usage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-blue-500 transition-all duration-300"
                          style={{ width: `${diagnostics.performance.cpu_usage}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className={themeClasses.text.secondary}>Memory Usage</span>
                        <span className={themeClasses.text.primary}>{diagnostics.performance.memory_usage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-green-500 transition-all duration-300"
                          style={{ width: `${diagnostics.performance.memory_usage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`p-4 rounded-lg border ${themeClasses.border.light}`}>
                  <h4 className={`font-medium mb-3 ${themeClasses.text.primary}`}>Network Throughput</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Download className="w-4 h-4 text-green-500" />
                        <span className={themeClasses.text.secondary}>Download</span>
                      </div>
                      <span className={themeClasses.text.primary}>
                        {formatBytes(diagnostics.performance.download_speed)}/s
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Upload className="w-4 h-4 text-blue-500" />
                        <span className={themeClasses.text.secondary}>Upload</span>
                      </div>
                      <span className={themeClasses.text.primary}>
                        {formatBytes(diagnostics.performance.upload_speed)}/s
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Issues */}
              {diagnostics.performance?.issues?.length > 0 && (
                <div className={`p-4 rounded-lg border ${
                  theme === "dark" ? "bg-yellow-900/20 border-yellow-800" : "bg-yellow-50 border-yellow-200"
                }`}>
                  <h4 className={`font-medium mb-2 flex items-center text-yellow-800 dark:text-yellow-300`}>
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Performance Issues
                  </h4>
                  <ul className="text-sm text-yellow-700 dark:text-yellow-400 space-y-1">
                    {diagnostics.performance.issues.map((issue, index) => (
                      <li key={index}>• {issue}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Recommendations */}
          {diagnostics.recommendations?.length > 0 && (
            <div className={`p-4 rounded-lg border ${
              theme === "dark" ? "bg-blue-900/20 border-blue-800" : "bg-blue-50 border-blue-200"
            }`}>
              <h4 className={`font-medium mb-3 text-blue-800 dark:text-blue-300`}>
                Recommendations
              </h4>
              <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-2">
                {diagnostics.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DiagnosticsPanel;