// // src/Pages/NetworkManagement/components/Monitoring/RealTimeDashboard.jsx
// import React, { useState, useEffect } from 'react';
// import { motion } from 'framer-motion';
// import { 
//   Activity, RefreshCw, AlertTriangle, CheckCircle, Clock, 
//   Wifi, Users, TrendingUp, Network
// } from 'lucide-react';
// import CustomButton from '../Common/CustomButton';
// import StatCard from '../Monitoring/StatCard'
// import { getThemeClasses } from '../../../../components/ServiceManagement/Shared/components';
// import { useNetworkData } from '../hooks/useNetworkData'
// import { formatTimeSince, getHealthIcon, getHealthColor } from '../../utils/networkUtils'

// const RealTimeDashboard = ({ theme = "light", routers = [] }) => {
//   const themeClasses = getThemeClasses(theme);
//   const { networkData, webSocketConnected, isLoading, refreshData } = useNetworkData(routers);
//   const [recentAlerts, setRecentAlerts] = useState([]);

//   // Real-time specific functionality only
//   useEffect(() => {
//     const alertInterval = setInterval(() => {
//       setRecentAlerts(prev => [
//         ...prev.slice(0, 4),
//         {
//           id: Date.now(),
//           type: Math.random() > 0.7 ? 'warning' : 'info',
//           message: `System heartbeat at ${new Date().toLocaleTimeString()}`,
//           timestamp: new Date()
//         }
//       ]);
//     }, 10000);

//     return () => clearInterval(alertInterval);
//   }, []);

//   return (
//     <div className={`p-6 rounded-xl border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//       {/* Header */}
//       <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
//         <div className="flex items-center space-x-3">
//           <div className={`p-2 rounded-lg ${
//             theme === "dark" ? "bg-blue-900/50" : "bg-blue-100"
//           }`}>
//             <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
//           </div>
//           <div>
//             <h3 className={`text-lg font-semibold ${themeClasses.text.primary}`}>
//               Real-Time Monitor
//             </h3>
//             <div className="flex items-center space-x-2 mt-1">
//               <div className={`w-2 h-2 rounded-full ${
//                 webSocketConnected ? 'bg-green-500' : 'bg-yellow-500'
//               }`}></div>
//               <p className={`text-sm ${themeClasses.text.tertiary}`}>
//                 {webSocketConnected ? 'Live Updates Active' : 'Connecting...'}
//               </p>
//               <span className={`text-xs ${themeClasses.text.tertiary}`}>
//                 • Updated {formatTimeSince(networkData.lastUpdate)}
//               </span>
//             </div>
//           </div>
//         </div>
        
//         <CustomButton
//           onClick={refreshData}
//           icon={<RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />}
//           label="Refresh"
//           variant="secondary"
//           size="sm"
//           disabled={isLoading}
//           theme={theme}
//         />
//       </div>

//       {/* Key Metrics Grid */}
//       <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
//         <StatCard
//           title="Connected Routers"
//           value={networkData.connectedRouters}
//           subtitle={`of ${routers.length} total`}
//           icon={<Wifi className="w-5 h-5" />}
//           color="blue"
//           theme={theme}
//         />
        
//         <StatCard
//           title="Active Sessions"
//           value={networkData.activeSessions}
//           subtitle="across all routers"
//           icon={<Users className="w-5 h-5" />}
//           color="green"
//           theme={theme}
//         />
        
//         <StatCard
//           title="System Health"
//           value={`${networkData.systemHealth}%`}
//           subtitle="overall performance"
//           icon={getHealthIcon(networkData.systemHealth)}
//           color={networkData.systemHealth >= 80 ? "green" : networkData.systemHealth >= 60 ? "orange" : "red"}
//           theme={theme}
//         />
        
//         <StatCard
//           title="Total Throughput"
//           value={`${networkData.performanceMetrics.totalThroughput}`}
//           subtitle="Mbps"
//           icon={<TrendingUp className="w-5 h-5" />}
//           color="purple"
//           theme={theme}
//         />
//       </div>

//       {/* Performance Overview */}
//       <div className={`p-4 rounded-lg border mb-6 ${themeClasses.border.medium}`}>
//         <h4 className={`font-medium mb-4 flex items-center ${themeClasses.text.primary}`}>
//           <Network className="w-4 h-4 mr-2" />
//           Performance Overview
//         </h4>
        
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//           <div className="text-center">
//             <p className={`text-sm ${themeClasses.text.tertiary}`}>Avg CPU</p>
//             <p className={`text-xl font-bold ${getHealthColor(100 - networkData.performanceMetrics.avgCpu)}`}>
//               {networkData.performanceMetrics.avgCpu}%
//             </p>
//           </div>
          
//           <div className="text-center">
//             <p className={`text-sm ${themeClasses.text.tertiary}`}>Avg Memory</p>
//             <p className={`text-xl font-bold ${getHealthColor(100 - networkData.performanceMetrics.avgMemory)}`}>
//               {networkData.performanceMetrics.avgMemory}%
//             </p>
//           </div>
          
//           <div className="text-center">
//             <p className={`text-sm ${themeClasses.text.tertiary}`}>Active Connections</p>
//             <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
//               {networkData.performanceMetrics.activeConnections}
//             </p>
//           </div>
          
//           <div className="text-center">
//             <p className={`text-sm ${themeClasses.text.tertiary}`}>Response Time</p>
//             <p className="text-xl font-bold text-green-600 dark:text-green-400">
//               {webSocketConnected ? '<50ms' : 'N/A'}
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Recent Alerts */}
//       <div className="mb-6">
//         <h4 className={`font-medium mb-3 flex items-center ${themeClasses.text.primary}`}>
//           <AlertTriangle className="w-4 h-4 mr-2" />
//           Live Activity Stream
//         </h4>
        
//         <div className="space-y-2 max-h-48 overflow-y-auto">
//           {recentAlerts.length === 0 ? (
//             <div className="text-center py-4">
//               <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
//               <p className={`text-sm ${themeClasses.text.tertiary}`}>No recent activity</p>
//               <p className={`text-xs ${themeClasses.text.tertiary}`}>System is running smoothly</p>
//             </div>
//           ) : (
//             recentAlerts.map(alert => (
//               <motion.div
//                 key={alert.id}
//                 initial={{ opacity: 0, x: -20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 className={`flex items-center space-x-3 p-3 rounded-lg border ${
//                   alert.type === 'warning' 
//                     ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'
//                     : 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
//                 }`}
//               >
//                 {alert.type === 'warning' ? (
//                   <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
//                 ) : (
//                   <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
//                 )}
//                 <div className="flex-1">
//                   <p className={`text-sm font-medium ${
//                     alert.type === 'warning' 
//                       ? 'text-yellow-800 dark:text-yellow-300'
//                       : 'text-blue-800 dark:text-blue-300'
//                   }`}>
//                     {alert.message}
//                   </p>
//                 </div>
//                 <span className={`text-xs ${themeClasses.text.tertiary}`}>
//                   {formatTimeSince(alert.timestamp)}
//                 </span>
//               </motion.div>
//             ))
//           )}
//         </div>
//       </div>

//       {/* System Status */}
//       <div className={`p-3 rounded-lg border ${
//         networkData.systemHealth >= 80 
//           ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
//           : networkData.systemHealth >= 60
//           ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'
//           : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
//       }`}>
//         <div className="flex items-center justify-between">
//           <div className="flex items-center space-x-2">
//             {getHealthIcon(networkData.systemHealth)}
//             <span className="text-sm font-medium">
//               Overall System: {networkData.systemHealth >= 80 ? 'Healthy' : networkData.systemHealth >= 60 ? 'Degraded' : 'Critical'}
//             </span>
//           </div>
//           <div className="flex items-center space-x-1 text-sm">
//             <Clock className="w-3 h-3" />
//             <span className={themeClasses.text.tertiary}>
//               Last update: {formatTimeSince(networkData.lastUpdate)}
//             </span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default RealTimeDashboard;










// src/Pages/NetworkManagement/components/Monitoring/RealTimeDashboard.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, RefreshCw, AlertTriangle, CheckCircle, Clock, 
  Wifi, Users, TrendingUp, Network
} from 'lucide-react';
import CustomButton from '../Common/CustomButton';
import StatCard from '../Monitoring/StatCard';
import { getThemeClasses } from '../../../../components/ServiceManagement/Shared/components';
import { useNetworkData } from '../hooks/useNetworkData';
import { formatTimeSince, getHealthColor } from '../../utils/networkUtils';
import { getHealthIcon } from '../../utils/iconUtils';

const RealTimeDashboard = ({ theme = "light", routers = [] }) => {
  const themeClasses = getThemeClasses(theme);
  const { networkData, webSocketConnected, isLoading, refreshData } = useNetworkData(routers);
  const [recentAlerts, setRecentAlerts] = useState([]);

  // Real-time specific functionality only
  useEffect(() => {
    const alertInterval = setInterval(() => {
      setRecentAlerts(prev => [
        ...prev.slice(0, 4),
        {
          id: Date.now(),
          type: Math.random() > 0.7 ? 'warning' : 'info',
          message: `System heartbeat at ${new Date().toLocaleTimeString()}`,
          timestamp: new Date()
        }
      ]);
    }, 10000);

    return () => clearInterval(alertInterval);
  }, []);

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
              Real-Time Monitor
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              <div className={`w-2 h-2 rounded-full ${
                webSocketConnected ? 'bg-green-500' : 'bg-yellow-500'
              }`}></div>
              <p className={`text-sm ${themeClasses.text.tertiary}`}>
                {webSocketConnected ? 'Live Updates Active' : 'Connecting...'}
              </p>
              <span className={`text-xs ${themeClasses.text.tertiary}`}>
                • Updated {formatTimeSince(networkData.lastUpdate)}
              </span>
            </div>
          </div>
        </div>
        
        <CustomButton
          onClick={refreshData}
          icon={<RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />}
          label="Refresh"
          variant="secondary"
          size="sm"
          disabled={isLoading}
          theme={theme}
        />
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Connected Routers"
          value={networkData.connectedRouters}
          subtitle={`of ${routers.length} total`}
          icon={<Wifi className="w-5 h-5" />}
          color="blue"
          theme={theme}
        />
        
        <StatCard
          title="Active Sessions"
          value={networkData.activeSessions}
          subtitle="across all routers"
          icon={<Users className="w-5 h-5" />}
          color="green"
          theme={theme}
        />
        
        <StatCard
          title="System Health"
          value={`${networkData.systemHealth}%`}
          subtitle="overall performance"
          icon={getHealthIcon(networkData.systemHealth)}
          color={networkData.systemHealth >= 80 ? "green" : networkData.systemHealth >= 60 ? "orange" : "red"}
          theme={theme}
        />
        
        <StatCard
          title="Total Throughput"
          value={`${networkData.performanceMetrics.totalThroughput}`}
          subtitle="Mbps"
          icon={<TrendingUp className="w-5 h-5" />}
          color="purple"
          theme={theme}
        />
      </div>

      {/* Performance Overview */}
      <div className={`p-4 rounded-lg border mb-6 ${themeClasses.border.medium}`}>
        <h4 className={`font-medium mb-4 flex items-center ${themeClasses.text.primary}`}>
          <Network className="w-4 h-4 mr-2" />
          Performance Overview
        </h4>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className={`text-sm ${themeClasses.text.tertiary}`}>Avg CPU</p>
            <p className={`text-xl font-bold ${getHealthColor(100 - networkData.performanceMetrics.avgCpu)}`}>
              {networkData.performanceMetrics.avgCpu}%
            </p>
          </div>
          
          <div className="text-center">
            <p className={`text-sm ${themeClasses.text.tertiary}`}>Avg Memory</p>
            <p className={`text-xl font-bold ${getHealthColor(100 - networkData.performanceMetrics.avgMemory)}`}>
              {networkData.performanceMetrics.avgMemory}%
            </p>
          </div>
          
          <div className="text-center">
            <p className={`text-sm ${themeClasses.text.tertiary}`}>Active Connections</p>
            <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
              {networkData.performanceMetrics.activeConnections}
            </p>
          </div>
          
          <div className="text-center">
            <p className={`text-sm ${themeClasses.text.tertiary}`}>Response Time</p>
            <p className="text-xl font-bold text-green-600 dark:text-green-400">
              {webSocketConnected ? '<50ms' : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="mb-6">
        <h4 className={`font-medium mb-3 flex items-center ${themeClasses.text.primary}`}>
          <AlertTriangle className="w-4 h-4 mr-2" />
          Live Activity Stream
        </h4>
        
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {recentAlerts.length === 0 ? (
            <div className="text-center py-4">
              <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className={`text-sm ${themeClasses.text.tertiary}`}>No recent activity</p>
              <p className={`text-xs ${themeClasses.text.tertiary}`}>System is running smoothly</p>
            </div>
          ) : (
            recentAlerts.map(alert => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex items-center space-x-3 p-3 rounded-lg border ${
                  alert.type === 'warning' 
                    ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'
                    : 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
                }`}
              >
                {alert.type === 'warning' ? (
                  <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                ) : (
                  <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                )}
                <div className="flex-1">
                  <p className={`text-sm font-medium ${
                    alert.type === 'warning' 
                      ? 'text-yellow-800 dark:text-yellow-300'
                      : 'text-blue-800 dark:text-blue-300'
                  }`}>
                    {alert.message}
                </p>
                </div>
                <span className={`text-xs ${themeClasses.text.tertiary}`}>
                  {formatTimeSince(alert.timestamp)}
                </span>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* System Status */}
      <div className={`p-3 rounded-lg border ${
        networkData.systemHealth >= 80 
          ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
          : networkData.systemHealth >= 60
          ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'
          : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getHealthIcon(networkData.systemHealth)}
            <span className="text-sm font-medium">
              Overall System: {networkData.systemHealth >= 80 ? 'Healthy' : networkData.systemHealth >= 60 ? 'Degraded' : 'Critical'}
            </span>
          </div>
          <div className="flex items-center space-x-1 text-sm">
            <Clock className="w-3 h-3" />
            <span className={themeClasses.text.tertiary}>
              Last update: {formatTimeSince(networkData.lastUpdate)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeDashboard;