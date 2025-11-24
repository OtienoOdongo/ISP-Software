


// // src/Pages/NetworkManagement/components/Layout/ActiveRouterPanel.jsx
// import React from "react";
// import { Server, Wifi, Cable, Users, Settings, Lock, RotateCcw } from "lucide-react";
// import CustomButton from "../Common/CustomButton";
// import { getThemeClasses } from "../../../../components/ServiceManagement/Shared/components"

// const ActiveRouterPanel = ({
//   activeRouter,
//   hotspotUsers = [],
//   pppoeUsers = [],
//   theme = "light",
//   onConfigureHotspot,
//   onConfigurePPPoE,
//   onManageUsers,
//   onCallbackSettings,
//   onRestoreSessions
// }) => {
//   const themeClasses = getThemeClasses(theme);
  
//   const activeHotspotUsers = Array.isArray(hotspotUsers) ? hotspotUsers.filter(user => user.active).length : 0;
//   const activePPPoEUsers = Array.isArray(pppoeUsers) ? pppoeUsers.filter(user => user.active).length : 0;

//   return (
//     <div className={`p-6 rounded-xl shadow-lg backdrop-blur-md transition-all duration-300 border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//       <h3 className={`text-lg font-semibold mb-4 flex items-center ${themeClasses.text.primary}`}>
//         <Server className="w-5 h-5 mr-2" />
//         Active Router: {activeRouter?.name || "Unknown"}
//       </h3>
      
//       <div className="space-y-4">
//         {/* User Statistics */}
//         <div className="grid grid-cols-2 gap-4">
//           <div className={`p-3 rounded-lg text-center border ${
//             theme === "dark" ? "bg-blue-900/30 border-blue-800" : "bg-blue-100 border-blue-200"
//           }`}>
//             <div className="flex items-center justify-center space-x-2 mb-1">
//               <Wifi className="w-4 h-4 text-blue-500" />
//               <span className={`text-sm ${themeClasses.text.secondary}`}>Hotspot Users</span>
//             </div>
//             <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
//               {activeHotspotUsers}
//             </div>
//           </div>
          
//           <div className={`p-3 rounded-lg text-center border ${
//             theme === "dark" ? "bg-green-900/30 border-green-800" : "bg-green-100 border-green-200"
//           }`}>
//             <div className="flex items-center justify-center space-x-2 mb-1">
//               <Cable className="w-4 h-4 text-green-500" />
//               <span className={`text-sm ${themeClasses.text.secondary}`}>PPPoE Users</span>
//             </div>
//             <div className="text-xl font-bold text-green-600 dark:text-green-400">
//               {activePPPoEUsers}
//             </div>
//           </div>
//         </div>

//         {/* Router Information */}
//         <div className={`p-3 rounded-lg border ${theme === "dark" ? "bg-gray-700/50 border-gray-600" : "bg-gray-100 border-gray-200"}`}>
//           <div className="space-y-2 text-sm">
//             <div className="flex justify-between">
//               <span className={themeClasses.text.secondary}>IP Address</span>
//               <span className={`font-medium ${themeClasses.text.primary}`}>{activeRouter?.ip || "N/A"}</span>
//             </div>
//             <div className="flex justify-between">
//               <span className={themeClasses.text.secondary}>Status</span>
//               <span className={`font-medium ${
//                 activeRouter?.status === "connected" ? "text-green-500" :
//                 activeRouter?.status === "disconnected" ? "text-red-500" : "text-yellow-500"
//               }`}>
//                 {activeRouter?.status?.charAt(0).toUpperCase() + activeRouter?.status?.slice(1) || "Unknown"}
//               </span>
//             </div>
//             <div className="flex justify-between">
//               <span className={themeClasses.text.secondary}>Type</span>
//               <span className={`font-medium ${themeClasses.text.primary} capitalize`}>{activeRouter?.type || "N/A"}</span>
//             </div>
//             {activeRouter?.location && (
//               <div className="flex justify-between">
//                 <span className={themeClasses.text.secondary}>Location</span>
//                 <span className={`font-medium ${themeClasses.text.primary}`}>{activeRouter.location}</span>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Action Buttons */}
//         <div className="flex flex-col gap-2">
//           <CustomButton
//             onClick={onConfigureHotspot}
//             label="Configure Hotspot"
//             icon={<Wifi className="w-4 h-4" />}
//             variant="primary"
//             disabled={activeRouter?.status !== "connected"}
//             fullWidth
//             theme={theme}
//           />
          
//           <CustomButton
//             onClick={onConfigurePPPoE}
//             label="Configure PPPoE"
//             icon={<Cable className="w-4 h-4" />}
//             variant="primary"
//             disabled={activeRouter?.status !== "connected"}
//             fullWidth
//             theme={theme}
//           />
          
//           <CustomButton
//             onClick={onManageUsers}
//             label="Manage Users"
//             icon={<Users className="w-4 h-4" />}
//             variant="secondary"
//             disabled={activeRouter?.status !== "connected"}
//             fullWidth
//             theme={theme}
//           />
          
//           <CustomButton
//             onClick={onCallbackSettings}
//             label="Callback Settings"
//             icon={<Lock className="w-4 h-4" />}
//             variant="secondary"
//             disabled={activeRouter?.status !== "connected"}
//             fullWidth
//             theme={theme}
//           />
          
//           {activeRouter?.status === "connected" && (
//             <CustomButton
//               onClick={onRestoreSessions}
//               label="Restore Sessions"
//               icon={<RotateCcw className="w-4 h-4" />}
//               variant="warning"
//               fullWidth
//               theme={theme}
//             />
//           )}
//         </div>

//         {/* Quick Stats */}
//         <div className={`p-3 rounded-lg border ${theme === "dark" ? "bg-gray-700/50 border-gray-600" : "bg-gray-100 border-gray-200"}`}>
//           <h4 className={`font-medium text-sm mb-2 ${themeClasses.text.primary}`}>
//             Quick Statistics
//           </h4>
//           <div className="grid grid-cols-2 gap-2 text-xs">
//             <div className="flex justify-between">
//               <span className={themeClasses.text.secondary}>Total Users:</span>
//               <span className={`font-medium ${themeClasses.text.primary}`}>{activeHotspotUsers + activePPPoEUsers}</span>
//             </div>
//             <div className="flex justify-between">
//               <span className={themeClasses.text.secondary}>Hotspot:</span>
//               <span className="font-medium text-blue-600 dark:text-blue-400">{activeHotspotUsers}</span>
//             </div>
//             <div className="flex justify-between">
//               <span className={themeClasses.text.secondary}>PPPoE:</span>
//               <span className="font-medium text-green-600 dark:text-green-400">{activePPPoEUsers}</span>
//             </div>
//             <div className="flex justify-between">
//               <span className={themeClasses.text.secondary}>Capacity:</span>
//               <span className={`font-medium ${themeClasses.text.primary}`}>
//                 {Math.round(((activeHotspotUsers + activePPPoEUsers) / (activeRouter?.max_clients || 50)) * 100)}%
//               </span>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ActiveRouterPanel;





// src/Pages/NetworkManagement/components/Layout/ActiveRouterPanel.jsx
import React from "react";
import { 
  Server, Wifi, Cable, Users, Settings, Lock, RotateCcw, 
  Zap, Shield, Activity, BarChart3, Cpu, HardDrive, Network,
  CheckCircle, AlertTriangle, Clock
} from "lucide-react";
import CustomButton from "../Common/CustomButton";
import { getThemeClasses } from "../../../../components/ServiceManagement/Shared/components"
import { getConnectionStatusIcon, getConfigStatusIcon, getServiceIcon } from "../../utils/iconUtils";

const ActiveRouterPanel = ({
  activeRouter,
  hotspotUsers = [],
  pppoeUsers = [],
  routerStats = {},
  theme = "light",
  onConfigureHotspot,
  onConfigurePPPoE,
  onManageUsers,
  onCallbackSettings,
  onRestoreSessions,
  onRunDiagnostics,
  onConfigureScript,
  onConfigureVPN,
  onViewDetailedStats
}) => {
  const themeClasses = getThemeClasses(theme);
  
  const activeHotspotUsers = Array.isArray(hotspotUsers) ? hotspotUsers.filter(user => user.active).length : 0;
  const activePPPoEUsers = Array.isArray(pppoeUsers) ? pppoeUsers.filter(user => user.active).length : 0;
  
  const stats = routerStats?.[activeRouter?.id]?.latest || {};
  const systemInfo = stats.system_info || {};

  const getStatusColor = (status) => {
    switch (status) {
      case "connected":
        return "text-green-500";
      case "disconnected":
        return "text-red-500";
      case "partially_configured":
        return "text-yellow-500";
      default:
        return "text-gray-500";
    }
  };

  const getStatusBackground = (status) => {
    switch (status) {
      case "connected":
        return theme === "dark" ? "bg-green-900/30 border-green-800" : "bg-green-100 border-green-200";
      case "disconnected":
        return theme === "dark" ? "bg-red-900/30 border-red-800" : "bg-red-100 border-red-200";
      case "partially_configured":
        return theme === "dark" ? "bg-yellow-900/30 border-yellow-800" : "bg-yellow-100 border-yellow-200";
      default:
        return theme === "dark" ? "bg-gray-700/50 border-gray-600" : "bg-gray-100 border-gray-200";
    }
  };

  const getConfigurationStatusText = () => {
    if (!activeRouter) return "Unknown";
    
    const status = activeRouter.configuration_status;
    const type = activeRouter.configuration_type;
    
    if (status === 'configured' && type) {
      return `Configured (${type.toUpperCase()})`;
    }
    
    return status?.charAt(0).toUpperCase() + status?.slice(1) || 'Not Configured';
  };

  const formatUptime = (uptime) => {
    if (!uptime || uptime === "N/A" || uptime === "0") return "N/A";
    
    try {
      if (typeof uptime === 'string') {
        const days = uptime.match(/(\d+)d/);
        const hours = uptime.match(/(\d+)h/);
        const minutes = uptime.match(/(\d+)m/);
        
        const d = days ? parseInt(days[1]) : 0;
        const h = hours ? parseInt(hours[1]) : 0;
        const m = minutes ? parseInt(minutes[1]) : 0;
        
        if (d > 0) return `${d}d ${h}h`;
        if (h > 0) return `${h}h ${m}m`;
        return `${m}m`;
      }
    } catch (error) {
      console.error('Error formatting uptime:', error);
    }
    
    return "N/A";
  };

  if (!activeRouter) {
    return (
      <div className={`p-6 rounded-xl shadow-lg backdrop-blur-md transition-all duration-300 border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
        <div className="text-center py-8">
          <Server className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className={`text-lg font-semibold mb-2 ${themeClasses.text.primary}`}>
            No Router Selected
          </h3>
          <p className={`text-sm ${themeClasses.text.tertiary}`}>
            Select a router from the list to view details and manage configuration
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 rounded-xl shadow-lg backdrop-blur-md transition-all duration-300 border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
      <h3 className={`text-lg font-semibold mb-4 flex items-center ${themeClasses.text.primary}`}>
        <Server className="w-5 h-5 mr-2" />
        Active Router: {activeRouter.name}
        <span className={`ml-2 text-sm font-normal ${getStatusColor(activeRouter.connection_status)}`}>
          ({activeRouter.connection_status === 'connected' ? 'Online' : 'Offline'})
        </span>
      </h3>
      
      <div className="space-y-4">
        {/* Status Overview */}
        <div className={`p-4 rounded-lg border ${getStatusBackground(activeRouter.connection_status)}`}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-1">
                {getConnectionStatusIcon(activeRouter.connection_status, "w-4 h-4")}
                <span className={`text-sm ${themeClasses.text.secondary}`}>Connection</span>
              </div>
              <div className={`text-sm font-medium ${getStatusColor(activeRouter.connection_status)}`}>
                {activeRouter.connection_status === 'connected' ? 'Connected' : 'Disconnected'}
              </div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-1">
                {getConfigStatusIcon(activeRouter.configuration_status, "w-4 h-4")}
                <span className={`text-sm ${themeClasses.text.secondary}`}>Configuration</span>
              </div>
              <div className={`text-sm font-medium ${getStatusColor(activeRouter.configuration_status)}`}>
                {getConfigurationStatusText()}
              </div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-1">
                <Users className="w-4 h-4 text-blue-500" />
                <span className={`text-sm ${themeClasses.text.secondary}`}>Hotspot Users</span>
              </div>
              <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                {activeHotspotUsers}
              </div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-1">
                <Cable className="w-4 h-4 text-green-500" />
                <span className={`text-sm ${themeClasses.text.secondary}`}>PPPoE Users</span>
              </div>
              <div className="text-sm font-medium text-green-600 dark:text-green-400">
                {activePPPoEUsers}
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        {activeRouter.connection_status === "connected" && (
          <div className={`p-4 rounded-lg border ${
            theme === "dark" ? "bg-blue-900/20 border-blue-800" : "bg-blue-50 border-blue-200"
          }`}>
            <h4 className={`font-medium mb-3 flex items-center ${themeClasses.text.primary}`}>
              <Activity className="w-4 h-4 mr-2" />
              Performance Metrics
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <Cpu className="w-6 h-6 mx-auto mb-1 text-blue-500" />
                <p className={`text-xs ${themeClasses.text.secondary}`}>CPU Usage</p>
                <p className={`text-lg font-bold ${
                  (stats.cpu || 0) > 80 ? 'text-red-500' : 
                  (stats.cpu || 0) > 60 ? 'text-yellow-500' : 'text-green-500'
                }`}>
                  {stats.cpu || 0}%
                </p>
              </div>
              <div>
                <HardDrive className="w-6 h-6 mx-auto mb-1 text-purple-500" />
                <p className={`text-xs ${themeClasses.text.secondary}`}>Memory Usage</p>
                <p className={`text-lg font-bold ${
                  (stats.memory || 0) > 80 ? 'text-red-500' : 
                  (stats.memory || 0) > 60 ? 'text-yellow-500' : 'text-green-500'
                }`}>
                  {stats.memory || 0}%
                </p>
              </div>
              <div>
                <Network className="w-6 h-6 mx-auto mb-1 text-green-500" />
                <p className={`text-xs ${themeClasses.text.secondary}`}>Total Sessions</p>
                <p className="text-lg font-bold text-green-600 dark:text-green-400">
                  {activeHotspotUsers + activePPPoEUsers}
                </p>
              </div>
              <div>
                <Clock className="w-6 h-6 mx-auto mb-1 text-orange-500" />
                <p className={`text-xs ${themeClasses.text.secondary}`}>Uptime</p>
                <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                  {formatUptime(systemInfo.uptime || stats.uptime)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Router Information */}
        <div className={`p-4 rounded-lg border ${
          theme === "dark" ? "bg-gray-700/50 border-gray-600" : "bg-gray-100 border-gray-200"
        }`}>
          <h4 className={`font-medium mb-3 ${themeClasses.text.primary}`}>Router Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className={themeClasses.text.secondary}>IP Address</span>
                <span className={`font-medium ${themeClasses.text.primary}`}>{activeRouter.ip}</span>
              </div>
              <div className="flex justify-between">
                <span className={themeClasses.text.secondary}>Router Type</span>
                <span className={`font-medium ${themeClasses.text.primary} capitalize`}>{activeRouter.type}</span>
              </div>
              <div className="flex justify-between">
                <span className={themeClasses.text.secondary}>Model</span>
                <span className={`font-medium ${themeClasses.text.primary}`}>{activeRouter.model || "N/A"}</span>
              </div>
              {activeRouter.firmware_version && (
                <div className="flex justify-between">
                  <span className={themeClasses.text.secondary}>Firmware</span>
                  <span className={`font-medium ${themeClasses.text.primary}`}>{activeRouter.firmware_version}</span>
                </div>
              )}
            </div>
            <div className="space-y-2">
              {activeRouter.location && (
                <div className="flex justify-between">
                  <span className={themeClasses.text.secondary}>Location</span>
                  <span className={`font-medium ${themeClasses.text.primary}`}>{activeRouter.location}</span>
                </div>
              )}
              {activeRouter.ssid && (
                <div className="flex justify-between">
                  <span className={themeClasses.text.secondary}>SSID</span>
                  <span className={`font-medium ${themeClasses.text.primary}`}>{activeRouter.ssid}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className={themeClasses.text.secondary}>Max Clients</span>
                <span className={`font-medium ${themeClasses.text.primary}`}>{activeRouter.max_clients || 50}</span>
              </div>
              {activeRouter.last_connection_test && (
                <div className="flex justify-between">
                  <span className={themeClasses.text.secondary}>Last Test</span>
                  <span className={`font-medium ${themeClasses.text.primary}`}>
                    {new Date(activeRouter.last_connection_test).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          <CustomButton
            onClick={onConfigureHotspot}
            label="Hotspot"
            icon={<Wifi className="w-4 h-4" />}
            variant="primary"
            disabled={activeRouter.connection_status !== "connected"}
            fullWidth
            theme={theme}
          />
          
          <CustomButton
            onClick={onConfigurePPPoE}
            label="PPPoE"
            icon={<Cable className="w-4 h-4" />}
            variant="primary"
            disabled={activeRouter.connection_status !== "connected"}
            fullWidth
            theme={theme}
          />
          
          <CustomButton
            onClick={onConfigureVPN}
            label="VPN"
            icon={<Shield className="w-4 h-4" />}
            variant="secondary"
            disabled={activeRouter.connection_status !== "connected"}
            fullWidth
            theme={theme}
          />
          
          <CustomButton
            onClick={onConfigureScript}
            label="Auto Setup"
            icon={<Zap className="w-4 h-4" />}
            variant="secondary"
            disabled={activeRouter.connection_status !== "connected"}
            fullWidth
            theme={theme}
          />
          
          <CustomButton
            onClick={onManageUsers}
            label="Users"
            icon={<Users className="w-4 h-4" />}
            variant="secondary"
            disabled={activeRouter.connection_status !== "connected"}
            fullWidth
            theme={theme}
          />
          
          <CustomButton
            onClick={onRunDiagnostics}
            label="Diagnostics"
            icon={<Activity className="w-4 h-4" />}
            variant="secondary"
            disabled={activeRouter.connection_status !== "connected"}
            fullWidth
            theme={theme}
          />
          
          <CustomButton
            onClick={onViewDetailedStats}
            label="Stats"
            icon={<BarChart3 className="w-4 h-4" />}
            variant="secondary"
            fullWidth
            theme={theme}
          />
          
          <CustomButton
            onClick={onCallbackSettings}
            label="Callbacks"
            icon={<Lock className="w-4 h-4" />}
            variant="secondary"
            fullWidth
            theme={theme}
          />
        </div>

        {/* System Actions */}
        {activeRouter.connection_status === "connected" && (
          <div className={`p-3 rounded-lg border ${
            theme === "dark" ? "bg-yellow-900/20 border-yellow-800" : "bg-yellow-50 border-yellow-200"
          }`}>
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                <span className={`text-sm font-medium ${themeClasses.text.primary}`}>
                  System Maintenance
                </span>
              </div>
              <div className="flex space-x-2">
                <CustomButton
                  onClick={onRestoreSessions}
                  label="Restore Sessions"
                  icon={<RotateCcw className="w-4 h-4" />}
                  variant="warning"
                  size="sm"
                  theme={theme}
                />
              </div>
            </div>
          </div>
        )}

        {/* Capacity Warning */}
        {(activeHotspotUsers + activePPPoEUsers) > (activeRouter.max_clients || 50) * 0.8 && (
          <div className={`p-3 rounded-lg border ${
            theme === "dark" ? "bg-red-900/20 border-red-800" : "bg-red-50 border-red-200"
          }`}>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className={`text-sm font-medium ${themeClasses.text.primary}`}>
                High Capacity Usage: {Math.round(((activeHotspotUsers + activePPPoEUsers) / (activeRouter.max_clients || 50)) * 100)}%
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActiveRouterPanel;