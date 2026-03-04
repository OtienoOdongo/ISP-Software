






// // src/Pages/ServiceManagement/components/SystemMonitoring.jsx
// import React, { useState, useEffect, useMemo, useCallback } from 'react';
// import { motion } from 'framer-motion';
// import {
//   Activity, Zap, AlertCircle, CheckCircle, Clock,
//   Server, TrendingUp, TrendingDown, RefreshCw,
//   AlertTriangle, Check, X, BarChart3, Gauge
// } from 'lucide-react';
// import { API_ENDPOINTS, WEBSOCKET_ENABLED } from './constants';
// import { useApi } from './hooks/useApi';
// import { useWebSocket } from './hooks/useWebSocket';
// import { getThemeClasses } from '../../../components/ServiceManagement/Shared/components';
// import { ErrorBoundary } from './common/ErrorBoundary';

// const SystemMonitoring = ({ theme, addNotification }) => {
//   const themeClasses = getThemeClasses(theme);
  
//   // State
//   const [timeRange, setTimeRange] = useState('1h');
//   const [autoRefresh, setAutoRefresh] = useState(true);
//   const [expandedService, setExpandedService] = useState(null);
  
//   // API data - removed health endpoint
//   const { data: queueStats, loading: queueLoading, fetchData: fetchQueue } = useApi(
//     API_ENDPOINTS.ACTIVATION_STATS,
//     { cacheKey: 'queueStats' }
//   );
  
//   const { data: operationStats, loading: opsLoading, fetchData: fetchOps } = useApi(
//     API_ENDPOINTS.OPERATION_STATS,
//     { cacheKey: 'operationStats' }
//   );
  
//   // WebSocket for real-time updates (if enabled)
//   const { lastMessage: wsMessage, isConnected: wsConnected } = useWebSocket(
//     WEBSOCKET_ENABLED ? 'ws://localhost:8000/ws/monitoring/' : null,
//     {
//       onMessage: (data) => {
//         if (data.type === 'queue_update') {
//           fetchQueue();
//         } else if (data.type === 'operation_update') {
//           fetchOps();
//         }
//       },
//       enabled: WEBSOCKET_ENABLED,
//     }
//   );
  
//   // Auto-refresh
//   useEffect(() => {
//     if (!autoRefresh) return;
    
//     const interval = setInterval(() => {
//       fetchQueue();
//       fetchOps();
//     }, 30000);
    
//     return () => clearInterval(interval);
//   }, [autoRefresh, fetchQueue, fetchOps]);
  
//   // Queue statistics
//   const queueMetrics = useMemo(() => {
//     const stats = queueStats?.statistics || queueStats?.queue || {};
    
//     return {
//       pending: stats.pending || 0,
//       processing: stats.processing || 0,
//       failed: stats.failed || 0,
//       completed: stats.completed || 0,
//       avgTime: stats.average_processing_time || 0,
//       successRate: stats.success_rate || 0,
//     };
//   }, [queueStats]);
  
//   // Operation statistics
//   const opMetrics = useMemo(() => {
//     const stats = operationStats?.statistics || {};
    
//     return {
//       total: stats.recent_activity?.total || 0,
//       errors: stats.errors_last_24h || 0,
//       warnings: stats.warnings_last_24h || 0,
//       avgDuration: stats.average_duration_ms || 0,
//       successRate: stats.success_rate || 0,
//     };
//   }, [operationStats]);
  
//   // Get status color
//   const getStatusColor = useCallback((value, thresholds) => {
//     if (value >= thresholds.high) return 'text-red-600 bg-red-100 border-red-200';
//     if (value >= thresholds.medium) return 'text-yellow-600 bg-yellow-100 border-yellow-200';
//     return 'text-green-600 bg-green-100 border-green-200';
//   }, []);
  
//   // Format duration
//   const formatDuration = useCallback((ms) => {
//     if (ms < 1000) return `${ms}ms`;
//     const sec = ms / 1000;
//     if (sec < 60) return `${sec.toFixed(1)}s`;
//     const min = sec / 60;
//     if (min < 60) return `${min.toFixed(1)}m`;
//     const hr = min / 60;
//     return `${hr.toFixed(1)}h`;
//   }, []);
  
//   const isLoading = queueLoading || opsLoading;
  
//   // Determine overall system status based on metrics
//   const systemStatus = useMemo(() => {
//     const errorRate = opMetrics.total > 0 ? (opMetrics.errors / opMetrics.total) * 100 : 0;
//     const queueBacklog = queueMetrics.pending > 50;
//     const highFailureRate = queueMetrics.failed > 20;
    
//     if (errorRate > 10 || queueBacklog || highFailureRate) {
//       return { status: 'degraded', color: 'yellow', icon: AlertCircle };
//     }
//     if (errorRate > 20) {
//       return { status: 'unhealthy', color: 'red', icon: AlertTriangle };
//     }
//     return { status: 'healthy', color: 'green', icon: CheckCircle };
//   }, [opMetrics, queueMetrics]);
  
//   return (
//     <ErrorBoundary>
//       <div className={`space-y-6`}>
//         {/* Header */}
//         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//           <div>
//             <h2 className={`text-2xl font-bold ${themeClasses.text.primary}`}>System Monitoring</h2>
//             <p className={`text-sm ${themeClasses.text.secondary} mt-1`}>
//               Real-time system performance metrics
//             </p>
//           </div>
          
//           <div className="flex items-center gap-3">
//             {/* WebSocket Status - only show if enabled */}
//             {WEBSOCKET_ENABLED && (
//               <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs ${
//                 wsConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
//               }`}>
//                 <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
//                 {wsConnected ? 'Live' : 'Offline'}
//               </div>
//             )}
            
//             {/* Time Range Selector */}
//             <select
//               value={timeRange}
//               onChange={(e) => setTimeRange(e.target.value)}
//               className={`px-3 py-2 rounded-lg border ${themeClasses.input} text-sm`}
//             >
//               <option value="1h">Last Hour</option>
//               <option value="6h">Last 6 Hours</option>
//               <option value="24h">Last 24 Hours</option>
//               <option value="7d">Last 7 Days</option>
//             </select>
            
//             {/* Auto Refresh Toggle */}
//             <button
//               onClick={() => setAutoRefresh(!autoRefresh)}
//               className={`px-3 py-2 rounded-lg border flex items-center gap-2 text-sm ${
//                 autoRefresh ? 'bg-indigo-600 text-white border-indigo-600' : themeClasses.input
//               }`}
//             >
//               <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
//               Auto
//             </button>
            
//             {/* Manual Refresh */}
//             <button
//               onClick={() => {
//                 fetchQueue();
//                 fetchOps();
//               }}
//               disabled={isLoading}
//               className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 text-sm font-medium"
//             >
//               Refresh
//             </button>
//           </div>
//         </div>
        
//         {/* System Status Overview */}
//         <div className={`p-6 rounded-xl ${themeClasses.bg.card} border ${themeClasses.border.light}`}>
//           <div className="flex items-center gap-4 mb-6">
//             <div className={`p-4 rounded-xl ${
//               systemStatus.color === 'green' ? 'bg-green-100 text-green-600' :
//               systemStatus.color === 'yellow' ? 'bg-yellow-100 text-yellow-600' :
//               'bg-red-100 text-red-600'
//             }`}>
//               <systemStatus.icon className="w-8 h-8" />
//             </div>
//             <div>
//               <h3 className={`text-xl font-bold capitalize ${themeClasses.text.primary}`}>{systemStatus.status}</h3>
//               <p className={`text-sm ${themeClasses.text.secondary}`}>
//                 Based on current queue and operation metrics
//               </p>
//             </div>
//           </div>
          
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//             <div className="text-center">
//               <div className="text-3xl font-bold text-green-600">{queueMetrics.completed}</div>
//               <div className={`text-sm ${themeClasses.text.secondary}`}>Completed</div>
//             </div>
//             <div className="text-center">
//               <div className="text-3xl font-bold text-yellow-600">{queueMetrics.pending}</div>
//               <div className={`text-sm ${themeClasses.text.secondary}`}>Pending</div>
//             </div>
//             <div className="text-center">
//               <div className="text-3xl font-bold text-red-600">{queueMetrics.failed}</div>
//               <div className={`text-sm ${themeClasses.text.secondary}`}>Failed</div>
//             </div>
//             <div className="text-center">
//               <div className="text-3xl font-bold text-blue-600">{opMetrics.total}</div>
//               <div className={`text-sm ${themeClasses.text.secondary}`}>Operations</div>
//             </div>
//           </div>
//         </div>
        
//         {/* Metrics Grid */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//           {/* Activation Queue */}
//           <div className={`p-6 rounded-xl ${themeClasses.bg.card} border ${themeClasses.border.light}`}>
//             <h3 className={`font-bold mb-4 flex items-center gap-2 ${themeClasses.text.primary}`}>
//               <Zap className="w-5 h-5" />
//               Activation Queue
//             </h3>
            
//             <div className="space-y-4">
//               {/* Queue Progress */}
//               <div>
//                 <div className="flex justify-between text-sm mb-2">
//                   <span className={themeClasses.text.secondary}>Queue Utilization</span>
//                   <span className={`font-bold ${themeClasses.text.primary}`}>
//                     {((queueMetrics.pending + queueMetrics.processing) / 100 * 100).toFixed(1)}%
//                   </span>
//                 </div>
//                 <div className="w-full bg-gray-200 rounded-full h-2">
//                   <div
//                     className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
//                     style={{ width: `${Math.min((queueMetrics.pending + queueMetrics.processing) / 100 * 100, 100)}%` }}
//                   />
//                 </div>
//               </div>
              
//               {/* Queue Stats */}
//               <div className="grid grid-cols-2 gap-3">
//                 <div className={`p-3 rounded-lg ${themeClasses.bg.secondary}`}>
//                   <div className="text-2xl font-bold text-yellow-600">{queueMetrics.pending}</div>
//                   <div className={`text-xs ${themeClasses.text.secondary}`}>Pending</div>
//                 </div>
//                 <div className={`p-3 rounded-lg ${themeClasses.bg.secondary}`}>
//                   <div className="text-2xl font-bold text-blue-600">{queueMetrics.processing}</div>
//                   <div className={`text-xs ${themeClasses.text.secondary}`}>Processing</div>
//                 </div>
//                 <div className={`p-3 rounded-lg ${themeClasses.bg.secondary}`}>
//                   <div className="text-2xl font-bold text-green-600">{queueMetrics.completed}</div>
//                   <div className={`text-xs ${themeClasses.text.secondary}`}>Completed</div>
//                 </div>
//                 <div className={`p-3 rounded-lg ${themeClasses.bg.secondary}`}>
//                   <div className="text-2xl font-bold text-red-600">{queueMetrics.failed}</div>
//                   <div className={`text-xs ${themeClasses.text.secondary}`}>Failed</div>
//                 </div>
//               </div>
              
//               {/* Performance Metrics */}
//               <div className="space-y-2 pt-2">
//                 <div className="flex justify-between text-sm">
//                   <span className={themeClasses.text.secondary}>Average Processing Time</span>
//                   <span className={`font-bold ${themeClasses.text.primary}`}>{formatDuration(queueMetrics.avgTime * 1000)}</span>
//                 </div>
//                 <div className="flex justify-between text-sm">
//                   <span className={themeClasses.text.secondary}>Success Rate</span>
//                   <span className={`font-bold ${
//                     queueMetrics.successRate > 95 ? 'text-green-600' :
//                     queueMetrics.successRate > 80 ? 'text-yellow-600' :
//                     'text-red-600'
//                   }`}>
//                     {queueMetrics.successRate.toFixed(1)}%
//                   </span>
//                 </div>
//               </div>
//             </div>
//           </div>
          
//           {/* Operation Statistics */}
//           <div className={`p-6 rounded-xl ${themeClasses.bg.card} border ${themeClasses.border.light}`}>
//             <h3 className={`font-bold mb-4 flex items-center gap-2 ${themeClasses.text.primary}`}>
//               <Activity className="w-5 h-5" />
//               Operation Statistics
//             </h3>
            
//             <div className="space-y-4">
//               {/* Operations Trend */}
//               <div className="flex items-center gap-4">
//                 <div className="flex-1">
//                   <div className={`text-3xl font-bold ${themeClasses.text.primary}`}>{opMetrics.total}</div>
//                   <div className={`text-sm ${themeClasses.text.secondary}`}>Operations (24h)</div>
//                 </div>
//                 <div className={`flex items-center gap-1 ${
//                   opMetrics.errors === 0 ? 'text-green-600' : 'text-red-600'
//                 }`}>
//                   {opMetrics.errors === 0 ? (
//                     <TrendingUp className="w-5 h-5" />
//                   ) : (
//                     <TrendingDown className="w-5 h-5" />
//                   )}
//                   <span className="font-bold">{opMetrics.errors} errors</span>
//                 </div>
//               </div>
              
//               {/* Operation Stats Grid */}
//               <div className="grid grid-cols-2 gap-3">
//                 <div className={`p-3 rounded-lg ${themeClasses.bg.secondary}`}>
//                   <div className={`text-sm ${themeClasses.text.secondary}`}>Avg Duration</div>
//                   <div className={`text-lg font-bold ${themeClasses.text.primary}`}>{formatDuration(opMetrics.avgDuration)}</div>
//                 </div>
//                 <div className={`p-3 rounded-lg ${themeClasses.bg.secondary}`}>
//                   <div className={`text-sm ${themeClasses.text.secondary}`}>Success Rate</div>
//                   <div className={`text-lg font-bold ${
//                     opMetrics.successRate > 95 ? 'text-green-600' :
//                     opMetrics.successRate > 80 ? 'text-yellow-600' :
//                     'text-red-600'
//                   }`}>
//                     {opMetrics.successRate.toFixed(1)}%
//                   </div>
//                 </div>
//               </div>
              
//               {/* Warning/Error Summary */}
//               {(opMetrics.errors > 0 || opMetrics.warnings > 0) && (
//                 <div className="mt-4 space-y-2">
//                   {opMetrics.errors > 0 && (
//                     <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-900/30 rounded-lg">
//                       <X className="w-4 h-4 text-red-600" />
//                       <span className="text-sm text-red-600 dark:text-red-400">
//                         {opMetrics.errors} errors detected in the last 24h
//                       </span>
//                     </div>
//                   )}
//                   {opMetrics.warnings > 0 && (
//                     <div className="flex items-center gap-2 p-2 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
//                       <AlertTriangle className="w-4 h-4 text-yellow-600" />
//                       <span className="text-sm text-yellow-600 dark:text-yellow-400">
//                         {opMetrics.warnings} warnings detected
//                       </span>
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
        
//         {/* System Recommendations */}
//         {(queueMetrics.failed > 20 || opMetrics.errors > 10) && (
//           <div className={`p-6 rounded-xl ${themeClasses.bg.card} border ${themeClasses.border.light}`}>
//             <h3 className={`font-bold mb-4 flex items-center gap-2 ${themeClasses.text.primary}`}>
//               <Gauge className="w-5 h-5" />
//               System Recommendations
//             </h3>
            
//             <div className="space-y-3">
//               {queueMetrics.failed > 20 && (
//                 <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
//                   <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
//                   <p className={`text-sm ${themeClasses.text.primary}`}>
//                     High failure rate detected in activation queue. Consider checking system logs.
//                   </p>
//                 </div>
//               )}
//               {opMetrics.errors > 10 && (
//                 <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/30 rounded-lg">
//                   <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
//                   <p className={`text-sm ${themeClasses.text.primary}`}>
//                     Unusual error rate detected. Investigate recent operations.
//                   </p>
//                 </div>
//               )}
//               {queueMetrics.pending > 100 && (
//                 <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
//                   <Clock className="w-5 h-5 text-blue-600 flex-shrink-0" />
//                   <p className={`text-sm ${themeClasses.text.primary}`}>
//                     Queue backlog detected. Consider scaling processing capacity.
//                   </p>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}
//       </div>
//     </ErrorBoundary>
//   );
// };

// export default SystemMonitoring;



// src/Pages/ServiceManagement/components/SystemMonitoring.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, Zap, AlertCircle, CheckCircle, Clock,
  TrendingUp, TrendingDown, RefreshCw,
  AlertTriangle, Check, X, BarChart3, Gauge,
  ChevronDown, ChevronUp
} from 'lucide-react';
import { API_ENDPOINTS, WEBSOCKET_ENABLED } from './constants';
import { useApi } from './hooks/useApi';
import { useWebSocket } from './hooks/useWebSocket';
import { getThemeClasses, EnhancedSelect } from '../../../components/ServiceManagement/Shared/components';
import { ErrorBoundary } from './common/ErrorBoundary';
import { LoadingSpinner } from './common/LoadingSpinner';

const SystemMonitoring = ({ theme, addNotification }) => {
  const themeClasses = getThemeClasses(theme);
  
  // State
  const [timeRange, setTimeRange] = useState('1h');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [expandedSection, setExpandedSection] = useState(null);
  
  // Options for EnhancedSelect
  const timeRangeOptions = [
    { value: '1h', label: 'Last Hour' },
    { value: '6h', label: 'Last 6 Hours' },
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' }
  ];
  
  // API data
  const { data: queueStats, loading: queueLoading, error: queueError, fetchData: fetchQueue } = useApi(
    API_ENDPOINTS.ACTIVATION_STATS,
    { cacheKey: 'queueStats' }
  );
  
  const { data: operationStats, loading: opsLoading, error: opsError, fetchData: fetchOps } = useApi(
    API_ENDPOINTS.OPERATION_STATS,
    { cacheKey: 'operationStats' }
  );
  
  // WebSocket for real-time updates (if enabled)
  const { lastMessage: wsMessage, isConnected: wsConnected } = useWebSocket(
    WEBSOCKET_ENABLED ? 'ws://localhost:8000/ws/monitoring/' : null,
    {
      onMessage: (data) => {
        if (data.type === 'queue_update') {
          fetchQueue();
        } else if (data.type === 'operation_update') {
          fetchOps();
        }
      },
      enabled: WEBSOCKET_ENABLED,
    }
  );
  
  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      fetchQueue();
      fetchOps();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [autoRefresh, fetchQueue, fetchOps]);
  
  // Queue statistics with memoization
  const queueMetrics = useMemo(() => {
    const stats = queueStats?.statistics || queueStats?.queue || {};
    
    return {
      pending: stats.pending || 0,
      processing: stats.processing || 0,
      failed: stats.failed || 0,
      completed: stats.completed || 0,
      avgTime: stats.average_processing_time || 0,
      successRate: stats.success_rate || 0,
      total: (stats.pending || 0) + (stats.processing || 0) + (stats.completed || 0) + (stats.failed || 0)
    };
  }, [queueStats]);
  
  // Operation statistics with memoization
  const opMetrics = useMemo(() => {
    const stats = operationStats?.statistics || {};
    
    return {
      total: stats.recent_activity?.total || 0,
      errors: stats.errors_last_24h || 0,
      warnings: stats.warnings_last_24h || 0,
      avgDuration: stats.average_duration_ms || 0,
      successRate: stats.success_rate || 0,
      byType: stats.by_operation_type || {}
    };
  }, [operationStats]);
  
  // Format duration helper
  const formatDuration = useCallback((ms) => {
    if (!ms || ms < 0) return '0ms';
    if (ms < 1000) return `${ms}ms`;
    const sec = ms / 1000;
    if (sec < 60) return `${sec.toFixed(1)}s`;
    const min = sec / 60;
    if (min < 60) return `${min.toFixed(1)}m`;
    const hr = min / 60;
    return `${hr.toFixed(1)}h`;
  }, []);
  
  // Format percentage helper
  const formatPercentage = useCallback((value) => {
    if (typeof value !== 'number') return '0%';
    return `${value.toFixed(1)}%`;
  }, []);
  
  // Determine overall system status based on metrics
  const systemStatus = useMemo(() => {
    const errorRate = opMetrics.total > 0 ? (opMetrics.errors / opMetrics.total) * 100 : 0;
    const queueBacklog = queueMetrics.pending > 50;
    const highFailureRate = queueMetrics.failed > 20;
    const processingStuck = queueMetrics.processing > 30;
    
    if (errorRate > 20 || highFailureRate) {
      return { 
        status: 'unhealthy', 
        color: 'red', 
        icon: AlertCircle,
        message: 'System experiencing critical issues'
      };
    }
    if (errorRate > 10 || queueBacklog || processingStuck) {
      return { 
        status: 'degraded', 
        color: 'yellow', 
        icon: AlertTriangle,
        message: 'System performance degraded'
      };
    }
    return { 
      status: 'healthy', 
      color: 'green', 
      icon: CheckCircle,
      message: 'All systems operational'
    };
  }, [opMetrics, queueMetrics]);
  
  const isLoading = queueLoading || opsLoading;
  const hasError = queueError || opsError;
  
  if (isLoading && !queueStats && !operationStats) {
    return <LoadingSpinner />;
  }
  
  if (hasError) {
    return (
      <div className={`p-8 text-center rounded-xl ${themeClasses.bg.card} border ${themeClasses.border.light}`}>
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className={`text-xl font-bold mb-2 ${themeClasses.text.primary}`}>Failed to Load Monitoring Data</h3>
        <p className={`text-sm ${themeClasses.text.secondary} mb-4`}>
          {queueError || opsError || 'An error occurred while fetching data'}
        </p>
        <button
          onClick={() => {
            fetchQueue();
            fetchOps();
          }}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Try Again
        </button>
      </div>
    );
  }
  
  return (
    <ErrorBoundary>
      <div className={`space-y-6`}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className={`text-2xl font-bold ${themeClasses.text.primary}`}>System Monitoring</h2>
            <p className={`text-sm ${themeClasses.text.secondary} mt-1`}>
              Real-time system performance metrics
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* WebSocket Status - only show if enabled */}
            {WEBSOCKET_ENABLED && (
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs ${
                wsConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                {wsConnected ? 'Live' : 'Offline'}
              </div>
            )}
            
            {/* Time Range Selector - Desktop */}
            <div className="hidden sm:block">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className={`px-3 py-2 rounded-lg border ${themeClasses.input} text-sm`}
              >
                {timeRangeOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            
            {/* Time Range Selector - Mobile with EnhancedSelect */}
            <div className="sm:hidden w-32">
              <EnhancedSelect
                value={timeRange}
                onChange={setTimeRange}
                options={timeRangeOptions}
                placeholder="Time Range"
                theme={theme}
              />
            </div>
            
            {/* Auto Refresh Toggle */}
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-3 py-2 rounded-lg border flex items-center gap-2 text-sm ${
                autoRefresh ? 'bg-indigo-600 text-white border-indigo-600' : themeClasses.input
              }`}
              title={autoRefresh ? 'Disable auto-refresh' : 'Enable auto-refresh'}
            >
              <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Auto</span>
            </button>
            
            {/* Manual Refresh */}
            <button
              onClick={() => {
                fetchQueue();
                fetchOps();
              }}
              disabled={isLoading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 text-sm font-medium"
            >
              <span className="hidden sm:inline">Refresh</span>
              <RefreshCw className="w-4 h-4 sm:hidden" />
            </button>
          </div>
        </div>
        
        {/* System Status Overview */}
        <div className={`p-6 rounded-xl ${themeClasses.bg.card} border ${themeClasses.border.light}`}>
          <div className="flex items-center gap-4 mb-6">
            <div className={`p-4 rounded-xl ${
              systemStatus.color === 'green' ? 'bg-green-100 text-green-600' :
              systemStatus.color === 'yellow' ? 'bg-yellow-100 text-yellow-600' :
              'bg-red-100 text-red-600'
            }`}>
              <systemStatus.icon className="w-8 h-8" />
            </div>
            <div>
              <h3 className={`text-xl font-bold capitalize ${themeClasses.text.primary}`}>
                {systemStatus.status}
              </h3>
              <p className={`text-sm ${themeClasses.text.secondary}`}>
                {systemStatus.message}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{queueMetrics.completed}</div>
              <div className={`text-sm ${themeClasses.text.secondary}`}>Completed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">{queueMetrics.pending}</div>
              <div className={`text-sm ${themeClasses.text.secondary}`}>Pending</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{queueMetrics.failed}</div>
              <div className={`text-sm ${themeClasses.text.secondary}`}>Failed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{opMetrics.total}</div>
              <div className={`text-sm ${themeClasses.text.secondary}`}>Operations</div>
            </div>
          </div>
        </div>
        
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Activation Queue Section */}
          <div className={`p-6 rounded-xl ${themeClasses.bg.card} border ${themeClasses.border.light}`}>
            <button
              onClick={() => setExpandedSection(expandedSection === 'queue' ? null : 'queue')}
              className="w-full flex items-center justify-between mb-4"
            >
              <h3 className={`font-bold flex items-center gap-2 ${themeClasses.text.primary}`}>
                <Zap className="w-5 h-5" />
                Activation Queue
              </h3>
              {expandedSection === 'queue' ? 
                <ChevronUp className="w-5 h-5" /> : 
                <ChevronDown className="w-5 h-5" />
              }
            </button>
            
            <AnimatePresence>
              <motion.div
                initial={false}
                animate={{ height: expandedSection === 'queue' ? 'auto' : 'auto' }}
                className="space-y-4"
              >
                {/* Queue Progress */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className={themeClasses.text.secondary}>Queue Utilization</span>
                    <span className={`font-bold ${themeClasses.text.primary}`}>
                      {queueMetrics.total > 0 
                        ? `${((queueMetrics.pending + queueMetrics.processing) / queueMetrics.total * 100).toFixed(1)}%`
                        : '0%'
                      }
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: queueMetrics.total > 0 
                          ? `${Math.min((queueMetrics.pending + queueMetrics.processing) / queueMetrics.total * 100, 100)}%`
                          : '0%'
                      }}
                    />
                  </div>
                </div>
                
                {/* Queue Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className={`p-3 rounded-lg ${themeClasses.bg.secondary}`}>
                    <div className="text-2xl font-bold text-yellow-600">{queueMetrics.pending}</div>
                    <div className={`text-xs ${themeClasses.text.secondary}`}>Pending</div>
                  </div>
                  <div className={`p-3 rounded-lg ${themeClasses.bg.secondary}`}>
                    <div className="text-2xl font-bold text-blue-600">{queueMetrics.processing}</div>
                    <div className={`text-xs ${themeClasses.text.secondary}`}>Processing</div>
                  </div>
                  <div className={`p-3 rounded-lg ${themeClasses.bg.secondary}`}>
                    <div className="text-2xl font-bold text-green-600">{queueMetrics.completed}</div>
                    <div className={`text-xs ${themeClasses.text.secondary}`}>Completed</div>
                  </div>
                  <div className={`p-3 rounded-lg ${themeClasses.bg.secondary}`}>
                    <div className="text-2xl font-bold text-red-600">{queueMetrics.failed}</div>
                    <div className={`text-xs ${themeClasses.text.secondary}`}>Failed</div>
                  </div>
                </div>
                
                {/* Performance Metrics */}
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-sm">
                    <span className={themeClasses.text.secondary}>Average Processing Time</span>
                    <span className={`font-bold ${themeClasses.text.primary}`}>
                      {formatDuration(queueMetrics.avgTime * 1000)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className={themeClasses.text.secondary}>Success Rate</span>
                    <span className={`font-bold ${
                      queueMetrics.successRate > 95 ? 'text-green-600' :
                      queueMetrics.successRate > 80 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {formatPercentage(queueMetrics.successRate)}
                    </span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
          
          {/* Operation Statistics Section */}
          <div className={`p-6 rounded-xl ${themeClasses.bg.card} border ${themeClasses.border.light}`}>
            <button
              onClick={() => setExpandedSection(expandedSection === 'ops' ? null : 'ops')}
              className="w-full flex items-center justify-between mb-4"
            >
              <h3 className={`font-bold flex items-center gap-2 ${themeClasses.text.primary}`}>
                <Activity className="w-5 h-5" />
                Operation Statistics
              </h3>
              {expandedSection === 'ops' ? 
                <ChevronUp className="w-5 h-5" /> : 
                <ChevronDown className="w-5 h-5" />
              }
            </button>
            
            <AnimatePresence>
              <motion.div
                initial={false}
                animate={{ height: expandedSection === 'ops' ? 'auto' : 'auto' }}
                className="space-y-4"
              >
                {/* Operations Trend */}
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className={`text-3xl font-bold ${themeClasses.text.primary}`}>{opMetrics.total}</div>
                    <div className={`text-sm ${themeClasses.text.secondary}`}>Operations (24h)</div>
                  </div>
                  <div className={`flex items-center gap-1 ${
                    opMetrics.errors === 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {opMetrics.errors === 0 ? (
                      <TrendingUp className="w-5 h-5" />
                    ) : (
                      <TrendingDown className="w-5 h-5" />
                    )}
                    <span className="font-bold">{opMetrics.errors} errors</span>
                  </div>
                </div>
                
                {/* Operation Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className={`p-3 rounded-lg ${themeClasses.bg.secondary}`}>
                    <div className={`text-sm ${themeClasses.text.secondary}`}>Avg Duration</div>
                    <div className={`text-lg font-bold ${themeClasses.text.primary}`}>
                      {formatDuration(opMetrics.avgDuration)}
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg ${themeClasses.bg.secondary}`}>
                    <div className={`text-sm ${themeClasses.text.secondary}`}>Success Rate</div>
                    <div className={`text-lg font-bold ${
                      opMetrics.successRate > 95 ? 'text-green-600' :
                      opMetrics.successRate > 80 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {formatPercentage(opMetrics.successRate)}
                    </div>
                  </div>
                </div>
                
                {/* Operation Types */}
                {Object.keys(opMetrics.byType).length > 0 && (
                  <div className="mt-2">
                    <h4 className={`text-sm font-medium mb-2 ${themeClasses.text.primary}`}>By Operation Type</h4>
                    <div className="space-y-2">
                      {Object.entries(opMetrics.byType).map(([type, count]) => (
                        <div key={type} className="flex justify-between text-sm">
                          <span className={themeClasses.text.secondary}>{type.replace(/_/g, ' ')}</span>
                          <span className={`font-bold ${themeClasses.text.primary}`}>{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Warning/Error Summary */}
                {(opMetrics.errors > 0 || opMetrics.warnings > 0) && (
                  <div className="mt-4 space-y-2">
                    {opMetrics.errors > 0 && (
                      <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-900/30 rounded-lg">
                        <X className="w-4 h-4 text-red-600" />
                        <span className="text-sm text-red-600 dark:text-red-400">
                          {opMetrics.errors} errors detected in the last 24h
                        </span>
                      </div>
                    )}
                    {opMetrics.warnings > 0 && (
                      <div className="flex items-center gap-2 p-2 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
                        <AlertTriangle className="w-4 h-4 text-yellow-600" />
                        <span className="text-sm text-yellow-600 dark:text-yellow-400">
                          {opMetrics.warnings} warnings detected
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        
        {/* System Recommendations */}
        {(queueMetrics.failed > 20 || opMetrics.errors > 10 || queueMetrics.pending > 100) && (
          <div className={`p-6 rounded-xl ${themeClasses.bg.card} border ${themeClasses.border.light}`}>
            <h3 className={`font-bold mb-4 flex items-center gap-2 ${themeClasses.text.primary}`}>
              <Gauge className="w-5 h-5" />
              System Recommendations
            </h3>
            
            <div className="space-y-3">
              {queueMetrics.failed > 20 && (
                <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                  <p className={`text-sm ${themeClasses.text.primary}`}>
                    High failure rate detected in activation queue ({queueMetrics.failed} failures). 
                    Consider checking system logs and reviewing failed activations.
                  </p>
                </div>
              )}
              {opMetrics.errors > 10 && (
                <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/30 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <p className={`text-sm ${themeClasses.text.primary}`}>
                    Unusual error rate detected ({opMetrics.errors} errors in 24h). 
                    Investigate recent operations for potential issues.
                  </p>
                </div>
              )}
              {queueMetrics.pending > 100 && (
                <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                  <Clock className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <p className={`text-sm ${themeClasses.text.primary}`}>
                    Queue backlog detected ({queueMetrics.pending} pending items). 
                    Consider scaling processing capacity.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-4">
            <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default SystemMonitoring;