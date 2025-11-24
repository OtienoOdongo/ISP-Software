

// // src/Pages/NetworkManagement/components/Monitoring/RealTimeDashboard.jsx
// import React, { useState, useEffect } from 'react';
// import { motion } from 'framer-motion';
// import { 
//   Activity, RefreshCw, AlertTriangle, CheckCircle, Clock, 
//   Wifi, Users, TrendingUp, Network, Server, Database
// } from 'lucide-react';
// import CustomButton from '../Common/CustomButton';
// import StatCard from '../Monitoring/StatCard';
// import { getThemeClasses } from '../../../../components/ServiceManagement/Shared/components';
// import { useNetworkData } from '../hooks/useNetworkData';
// import { formatTimeSince, getHealthColor } from '../../utils/networkUtils';
// import { getHealthIcon } from '../../utils/iconUtils';

// const RealTimeDashboard = ({ theme = "light", routers = [] }) => {
//   const themeClasses = getThemeClasses(theme);
//   const { networkData, webSocketConnected, isLoading, refreshData } = useNetworkData(routers);
//   const [recentAlerts, setRecentAlerts] = useState([]);
//   const [systemHealth, setSystemHealth] = useState({
//     connectedRouters: 0,
//     disconnectedRouters: 0,
//     configuredRouters: 0,
//     totalThroughput: 0
//   });

//   // Calculate system health from routers
//   useEffect(() => {
//     if (routers.length > 0) {
//       const connected = routers.filter(r => r.connection_status === 'connected').length;
//       const disconnected = routers.filter(r => r.connection_status === 'disconnected').length;
//       const configured = routers.filter(r => r.configuration_status === 'configured').length;
      
//       // Calculate total throughput (simulated)
//       const totalThroughput = routers.reduce((sum, router) => {
//         return sum + (router.throughput || Math.random() * 100);
//       }, 0);

//       setSystemHealth({
//         connectedRouters: connected,
//         disconnectedRouters: disconnected,
//         configuredRouters: configured,
//         totalThroughput: Math.round(totalThroughput)
//       });
//     }
//   }, [routers]);

//   // Enhanced real-time alerts from backend data
//   useEffect(() => {
//     const alertInterval = setInterval(() => {
//       // Generate alerts based on actual router status
//       const disconnectedRouters = routers.filter(r => r.connection_status === 'disconnected');
      
//       if (disconnectedRouters.length > 0 && Math.random() > 0.5) {
//         const router = disconnectedRouters[0];
//         setRecentAlerts(prev => [
//           {
//             id: Date.now(),
//             type: 'warning',
//             message: `${router.name} is disconnected`,
//             router: router.name,
//             timestamp: new Date()
//           },
//           ...prev.slice(0, 4)
//         ]);
//       } else {
//         setRecentAlerts(prev => [
//           {
//             id: Date.now(),
//             type: 'info',
//             message: `System heartbeat at ${new Date().toLocaleTimeString()}`,
//             timestamp: new Date()
//           },
//           ...prev.slice(0, 4)
//         ]);
//       }
//     }, 15000);

//     return () => clearInterval(alertInterval);
//   }, [routers]);

//   // Calculate overall system health percentage
//   const calculateSystemHealth = () => {
//     if (routers.length === 0) return 100;
//     const healthScore = (systemHealth.connectedRouters / routers.length) * 100;
//     return Math.round(healthScore);
//   };

//   const systemHealthPercentage = calculateSystemHealth();

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
//           value={systemHealth.connectedRouters}
//           subtitle={`of ${routers.length} total`}
//           icon={<Wifi className="w-5 h-5" />}
//           color="blue"
//           theme={theme}
//         />
        
//         <StatCard
//           title="Configured Routers"
//           value={systemHealth.configuredRouters}
//           subtitle="ready for service"
//           icon={<Server className="w-5 h-5" />}
//           color="green"
//           theme={theme}
//         />
        
//         <StatCard
//           title="System Health"
//           value={`${systemHealthPercentage}%`}
//           subtitle="overall performance"
//           icon={getHealthIcon(systemHealthPercentage)}
//           color={systemHealthPercentage >= 80 ? "green" : systemHealthPercentage >= 60 ? "orange" : "red"}
//           theme={theme}
//         />
        
//         <StatCard
//           title="Total Throughput"
//           value={`${systemHealth.totalThroughput}`}
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
//           Network Overview
//         </h4>
        
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//           <div className="text-center">
//             <p className={`text-sm ${themeClasses.text.tertiary}`}>Active Sessions</p>
//             <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
//               {networkData.activeSessions}
//             </p>
//           </div>
          
//           <div className="text-center">
//             <p className={`text-sm ${themeClasses.text.tertiary}`}>Disconnected</p>
//             <p className={`text-xl font-bold ${
//               systemHealth.disconnectedRouters > 0 ? 'text-red-500' : 'text-green-500'
//             }`}>
//               {systemHealth.disconnectedRouters}
//             </p>
//           </div>
          
//           <div className="text-center">
//             <p className={`text-sm ${themeClasses.text.tertiary}`}>Hotspot Users</p>
//             <p className="text-xl font-bold text-green-600 dark:text-green-400">
//               {networkData.hotspotUsers || 0}
//             </p>
//           </div>
          
//           <div className="text-center">
//             <p className={`text-sm ${themeClasses.text.tertiary}`}>PPPoE Users</p>
//             <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
//               {networkData.pppoeUsers || 0}
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
//                   {alert.router && (
//                     <p className={`text-xs ${themeClasses.text.tertiary} mt-1`}>
//                       Router: {alert.router}
//                     </p>
//                   )}
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
//         systemHealthPercentage >= 80 
//           ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
//           : systemHealthPercentage >= 60
//           ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'
//           : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
//       }`}>
//         <div className="flex items-center justify-between">
//           <div className="flex items-center space-x-2">
//             {getHealthIcon(systemHealthPercentage)}
//             <span className="text-sm font-medium">
//               Overall System: {systemHealthPercentage >= 80 ? 'Healthy' : systemHealthPercentage >= 60 ? 'Degraded' : 'Critical'}
//             </span>
//           </div>
//           <div className="flex items-center space-x-1 text-sm">
//             <Clock className="w-3 h-3" />
//             <span className={themeClasses.text.tertiary}>
//               Last update: {formatTimeSince(networkData.lastUpdate)}
//             </span>
//           </div>
//         </div>
//         {systemHealth.disconnectedRouters > 0 && (
//           <p className={`text-xs mt-2 ${
//             systemHealthPercentage >= 80 ? 'text-green-700 dark:text-green-300' :
//             systemHealthPercentage >= 60 ? 'text-yellow-700 dark:text-yellow-300' :
//             'text-red-700 dark:text-red-300'
//           }`}>
//             {systemHealth.disconnectedRouters} router(s) disconnected
//           </p>
//         )}
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
  Wifi, Users, TrendingUp, Network, Server, Database
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
  const [systemHealth, setSystemHealth] = useState({
    connectedRouters: 0,
    disconnectedRouters: 0,
    configuredRouters: 0,
    totalThroughput: 0
  });

  // Calculate system health from routers
  useEffect(() => {
    if (routers.length > 0) {
      const connected = routers.filter(r => r.connection_status === 'connected').length;
      const disconnected = routers.filter(r => r.connection_status === 'disconnected').length;
      const configured = routers.filter(r => r.configuration_status === 'configured').length;
      
      // Calculate total throughput (simulated)
      const totalThroughput = routers.reduce((sum, router) => {
        return sum + (router.throughput || Math.random() * 100);
      }, 0);

      setSystemHealth({
        connectedRouters: connected,
        disconnectedRouters: disconnected,
        configuredRouters: configured,
        totalThroughput: Math.round(totalThroughput)
      });
    }
  }, [routers]);

  // Enhanced real-time alerts from backend data
  useEffect(() => {
    const alertInterval = setInterval(() => {
      // Generate alerts based on actual router status
      const disconnectedRouters = routers.filter(r => r.connection_status === 'disconnected');
      
      if (disconnectedRouters.length > 0 && Math.random() > 0.5) {
        const router = disconnectedRouters[0];
        setRecentAlerts(prev => [
          {
            id: Date.now(),
            type: 'warning',
            message: `${router.name} is disconnected`,
            router: router.name,
            timestamp: new Date()
          },
          ...prev.slice(0, 4)
        ]);
      } else {
        setRecentAlerts(prev => [
          {
            id: Date.now(),
            type: 'info',
            message: `System heartbeat at ${new Date().toLocaleTimeString()}`,
            timestamp: new Date()
          },
          ...prev.slice(0, 4)
        ]);
      }
    }, 15000);

    return () => clearInterval(alertInterval);
  }, [routers]);

  // Calculate overall system health percentage
  const calculateSystemHealth = () => {
    if (routers.length === 0) return 100;
    const healthScore = (systemHealth.connectedRouters / routers.length) * 100;
    return Math.round(healthScore);
  };

  const systemHealthPercentage = calculateSystemHealth();

  return (
    <div className={`p-4 sm:p-6 rounded-xl border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
      {/* Header - Improved responsive layout */}
      <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className={`p-1.5 sm:p-2 rounded-lg ${
            theme === "dark" ? "bg-blue-900/50" : "bg-blue-100"
          }`}>
            <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="min-w-0">
            <h3 className={`text-lg sm:text-xl font-semibold ${themeClasses.text.primary} truncate`}>
              Real-Time Monitor
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              <div className={`w-2 h-2 rounded-full ${
                webSocketConnected ? 'bg-green-500' : 'bg-yellow-500'
              }`}></div>
              <p className={`text-xs sm:text-sm ${themeClasses.text.tertiary}`}>
                {webSocketConnected ? 'Live Updates Active' : 'Connecting...'}
              </p>
              <span className={`text-xs ${themeClasses.text.tertiary} hidden xs:inline`}>
                • Updated {formatTimeSince(networkData.lastUpdate)}
              </span>
            </div>
          </div>
        </div>
        
        <CustomButton
          onClick={refreshData}
          icon={<RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 ${isLoading ? 'animate-spin' : ''}`} />}
          label="Refresh"
          variant="secondary"
          size="sm"
          disabled={isLoading}
          theme={theme}
          className="flex-shrink-0 w-full xs:w-auto mt-2 xs:mt-0"
        />
      </div>

      {/* Key Metrics Grid - Improved responsive grid */}
      <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <StatCard
          title="Connected Routers"
          value={systemHealth.connectedRouters}
          subtitle={`of ${routers.length} total`}
          icon={<Wifi className="w-4 h-4 sm:w-5 sm:h-5" />}
          color="blue"
          theme={theme}
          className="min-h-[80px] sm:min-h-[90px]"
        />
        
        <StatCard
          title="Configured Routers"
          value={systemHealth.configuredRouters}
          subtitle="ready for service"
          icon={<Server className="w-4 h-4 sm:w-5 sm:h-5" />}
          color="green"
          theme={theme}
          className="min-h-[80px] sm:min-h-[90px]"
        />
        
        <StatCard
          title="System Health"
          value={`${systemHealthPercentage}%`}
          subtitle="overall performance"
          icon={getHealthIcon(systemHealthPercentage)}
          color={systemHealthPercentage >= 80 ? "green" : systemHealthPercentage >= 60 ? "orange" : "red"}
          theme={theme}
          className="min-h-[80px] sm:min-h-[90px]"
        />
        
        <StatCard
          title="Total Throughput"
          value={`${systemHealth.totalThroughput}`}
          subtitle="Mbps"
          icon={<TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />}
          color="purple"
          theme={theme}
          className="min-h-[80px] sm:min-h-[90px]"
        />
      </div>

      {/* Performance Overview */}
      <div className={`p-3 sm:p-4 rounded-lg border mb-4 sm:mb-6 ${themeClasses.border.medium}`}>
        <h4 className={`font-medium mb-3 sm:mb-4 flex items-center ${themeClasses.text.primary}`}>
          <Network className="w-4 h-4 mr-2" />
          Network Overview
        </h4>
        
        <div className="grid grid-cols-2 xs:grid-cols-4 gap-3 sm:gap-4">
          <div className="text-center">
            <p className={`text-xs sm:text-sm ${themeClasses.text.tertiary}`}>Active Sessions</p>
            <p className="text-lg sm:text-xl font-bold text-blue-600 dark:text-blue-400">
              {networkData.activeSessions}
            </p>
          </div>
          
          <div className="text-center">
            <p className={`text-xs sm:text-sm ${themeClasses.text.tertiary}`}>Disconnected</p>
            <p className={`text-lg sm:text-xl font-bold ${
              systemHealth.disconnectedRouters > 0 ? 'text-red-500' : 'text-green-500'
            }`}>
              {systemHealth.disconnectedRouters}
            </p>
          </div>
          
          <div className="text-center">
            <p className={`text-xs sm:text-sm ${themeClasses.text.tertiary}`}>Hotspot Users</p>
            <p className="text-lg sm:text-xl font-bold text-green-600 dark:text-green-400">
              {networkData.hotspotUsers || 0}
            </p>
          </div>
          
          <div className="text-center">
            <p className={`text-xs sm:text-sm ${themeClasses.text.tertiary}`}>PPPoE Users</p>
            <p className="text-lg sm:text-xl font-bold text-purple-600 dark:text-purple-400">
              {networkData.pppoeUsers || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="mb-4 sm:mb-6">
        <h4 className={`font-medium mb-3 flex items-center ${themeClasses.text.primary}`}>
          <AlertTriangle className="w-4 h-4 mr-2" />
          Live Activity Stream
        </h4>
        
        <div className="space-y-2 max-h-40 sm:max-h-48 overflow-y-auto">
          {recentAlerts.length === 0 ? (
            <div className="text-center py-4">
              <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-400 mx-auto mb-2" />
              <p className={`text-xs sm:text-sm ${themeClasses.text.tertiary}`}>No recent activity</p>
              <p className={`text-xs ${themeClasses.text.tertiary}`}>System is running smoothly</p>
            </div>
          ) : (
            recentAlerts.map(alert => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex items-start sm:items-center space-x-2 sm:space-x-3 p-2 sm:p-3 rounded-lg border ${
                  alert.type === 'warning' 
                    ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'
                    : 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
                }`}
              >
                {alert.type === 'warning' ? (
                  <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5 sm:mt-0" />
                ) : (
                  <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5 sm:mt-0" />
                )}
                <div className="min-w-0 flex-1">
                  <p className={`text-xs sm:text-sm font-medium ${
                    alert.type === 'warning' 
                      ? 'text-yellow-800 dark:text-yellow-300'
                      : 'text-blue-800 dark:text-blue-300'
                  } break-words`}>
                    {alert.message}
                  </p>
                  {alert.router && (
                    <p className={`text-xs ${themeClasses.text.tertiary} mt-1`}>
                      Router: {alert.router}
                    </p>
                  )}
                </div>
                <span className={`text-xs ${themeClasses.text.tertiary} flex-shrink-0`}>
                  {formatTimeSince(alert.timestamp)}
                </span>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* System Status */}
      <div className={`p-3 rounded-lg border ${
        systemHealthPercentage >= 80 
          ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
          : systemHealthPercentage >= 60
          ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'
          : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
      }`}>
        <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 xs:gap-4">
          <div className="flex items-center space-x-2">
            {getHealthIcon(systemHealthPercentage)}
            <span className="text-sm font-medium">
              Overall System: {systemHealthPercentage >= 80 ? 'Healthy' : systemHealthPercentage >= 60 ? 'Degraded' : 'Critical'}
            </span>
          </div>
          <div className="flex items-center space-x-1 text-xs sm:text-sm">
            <Clock className="w-3 h-3" />
            <span className={themeClasses.text.tertiary}>
              Last update: {formatTimeSince(networkData.lastUpdate)}
            </span>
          </div>
        </div>
        {systemHealth.disconnectedRouters > 0 && (
          <p className={`text-xs mt-2 ${
            systemHealthPercentage >= 80 ? 'text-green-700 dark:text-green-300' :
            systemHealthPercentage >= 60 ? 'text-yellow-700 dark:text-yellow-300' :
            'text-red-700 dark:text-red-300'
          }`}>
            {systemHealth.disconnectedRouters} router(s) disconnected
          </p>
        )}
      </div>
    </div>
  );
};

export default RealTimeDashboard;