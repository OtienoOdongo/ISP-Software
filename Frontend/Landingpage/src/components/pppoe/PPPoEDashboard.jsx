// import React, { useState, useEffect } from "react";
// import { 
//   Ethernet, Wifi, Download, Upload, Clock, 
//   RefreshCw, AlertCircle, CheckCircle2 
// } from "lucide-react";
// import api from "../../api/index"

// const PPPoEDashboard = ({ clientData }) => {
//   const [connectionStatus, setConnectionStatus] = useState('disconnected');
//   const [sessionInfo, setSessionInfo] = useState(null);
//   const [usageStats, setUsageStats] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);

//   useEffect(() => {
//     fetchConnectionStatus();
//     fetchUsageStats();
//   }, [clientData]);

//   const fetchConnectionStatus = async () => {
//     try {
//       const response = await api.get(`/api/network_management/pppoe/status/${clientData.id}/`);
//       setConnectionStatus(response.data.status);
//       setSessionInfo(response.data.session_info);
//     } catch (error) {
//       console.error("Failed to fetch connection status:", error);
//     }
//   };

//   const fetchUsageStats = async () => {
//     try {
//       const response = await api.get(`/api/account/clients/${clientData.id}/usage/`);
//       setUsageStats(response.data);
//     } catch (error) {
//       console.error("Failed to fetch usage stats:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const refreshData = async () => {
//     setRefreshing(true);
//     await Promise.all([fetchConnectionStatus(), fetchUsageStats()]);
//     setRefreshing(false);
//   };

//   const handleConnect = async () => {
//     try {
//       setLoading(true);
//       await api.post(`/api/network_management/pppoe/connect/${clientData.id}/`);
//       setTimeout(() => fetchConnectionStatus(), 2000); // Wait a bit then refresh
//     } catch (error) {
//       console.error("Failed to connect:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDisconnect = async () => {
//     try {
//       setLoading(true);
//       await api.post(`/api/network_management/pppoe/disconnect/${clientData.id}/`);
//       setTimeout(() => fetchConnectionStatus(), 2000);
//     } catch (error) {
//       console.error("Failed to disconnect:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'connected': return 'text-green-400';
//       case 'connecting': return 'text-yellow-400';
//       case 'disconnected': return 'text-red-400';
//       default: return 'text-gray-400';
//     }
//   };

//   const getStatusIcon = (status) => {
//     switch (status) {
//       case 'connected': return <CheckCircle2 className="w-5 h-5 text-green-400" />;
//       case 'connecting': return <RefreshCw className="w-5 h-5 text-yellow-400 animate-spin" />;
//       case 'disconnected': return <AlertCircle className="w-5 h-5 text-red-400" />;
//       default: return <AlertCircle className="w-5 h-5 text-gray-400" />;
//     }
//   };

//   if (loading && !refreshing) {
//     return (
//       <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-8">
//         <div className="flex items-center justify-center py-8">
//           <RefreshCw className="w-8 h-8 text-blue-300 animate-spin" />
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6 mb-8">
//       {/* Connection Status Card */}
//       <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
//         <div className="flex items-center justify-between mb-4">
//           <h2 className="text-xl font-bold text-white">Connection Status</h2>
//           <button
//             onClick={refreshData}
//             disabled={refreshing}
//             className="p-2 text-blue-300 hover:text-blue-200 transition-colors disabled:opacity-50"
//           >
//             <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
//           </button>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
//           <div className="bg-white/5 rounded-lg p-4 border border-white/10">
//             <div className="flex items-center gap-3 mb-2">
//               {getStatusIcon(connectionStatus)}
//               <span className={`font-medium ${getStatusColor(connectionStatus)}`}>
//                 {connectionStatus.charAt(0).toUpperCase() + connectionStatus.slice(1)}
//               </span>
//             </div>
//             <p className="text-blue-200 text-sm">PPPoE Connection</p>
//           </div>

//           <div className="bg-white/5 rounded-lg p-4 border border-white/10">
//             <div className="flex items-center gap-3 mb-2">
//               <Ethernet className="w-5 h-5 text-blue-300" />
//               <span className="font-medium text-white">
//                 {sessionInfo?.ip_address || 'Not Connected'}
//               </span>
//             </div>
//             <p className="text-blue-200 text-sm">IP Address</p>
//           </div>

//           <div className="bg-white/5 rounded-lg p-4 border border-white/10">
//             <div className="flex items-center gap-3 mb-2">
//               <Clock className="w-5 h-5 text-blue-300" />
//               <span className="font-medium text-white">
//                 {sessionInfo?.duration || '00:00:00'}
//               </span>
//             </div>
//             <p className="text-blue-200 text-sm">Session Duration</p>
//           </div>
//         </div>

//         <div className="flex gap-3">
//           {connectionStatus === 'disconnected' ? (
//             <button
//               onClick={handleConnect}
//               disabled={loading}
//               className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
//             >
//               <Wifi className="w-4 h-4" />
//               Connect
//             </button>
//           ) : (
//             <button
//               onClick={handleDisconnect}
//               disabled={loading}
//               className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
//             >
//               <Wifi className="w-4 h-4" />
//               Disconnect
//             </button>
//           )}
          
//           <button
//             onClick={refreshData}
//             disabled={refreshing}
//             className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
//           >
//             <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
//             Refresh
//           </button>
//         </div>
//       </div>

//       {/* Usage Statistics Card */}
//       {usageStats && (
//         <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
//           <h2 className="text-xl font-bold text-white mb-4">Usage Statistics</h2>
          
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//             <div className="bg-white/5 rounded-lg p-4 border border-white/10">
//               <div className="flex items-center gap-3 mb-2">
//                 <Download className="w-5 h-5 text-green-400" />
//                 <span className="font-medium text-white">{usageStats.download_used}</span>
//               </div>
//               <p className="text-blue-200 text-sm">Download Used</p>
//             </div>

//             <div className="bg-white/5 rounded-lg p-4 border border-white/10">
//               <div className="flex items-center gap-3 mb-2">
//                 <Upload className="w-5 h-5 text-blue-400" />
//                 <span className="font-medium text-white">{usageStats.upload_used}</span>
//               </div>
//               <p className="text-blue-200 text-sm">Upload Used</p>
//             </div>

//             <div className="bg-white/5 rounded-lg p-4 border border-white/10">
//               <div className="flex items-center gap-3 mb-2">
//                 <Download className="w-5 h-5 text-purple-400" />
//                 <span className="font-medium text-white">{usageStats.download_limit}</span>
//               </div>
//               <p className="text-blue-200 text-sm">Download Limit</p>
//             </div>

//             <div className="bg-white/5 rounded-lg p-4 border border-white/10">
//               <div className="flex items-center gap-3 mb-2">
//                 <Upload className="w-5 h-5 text-orange-400" />
//                 <span className="font-medium text-white">{usageStats.upload_limit}</span>
//               </div>
//               <p className="text-blue-200 text-sm">Upload Limit</p>
//             </div>
//           </div>

//           {/* Usage Progress Bar */}
//           <div className="mt-4">
//             <div className="flex justify-between text-blue-200 text-sm mb-2">
//               <span>Data Usage</span>
//               <span>{usageStats.usage_percentage}%</span>
//             </div>
//             <div className="w-full bg-white/10 rounded-full h-2">
//               <div 
//                 className="bg-gradient-to-r from-green-400 to-blue-400 h-2 rounded-full transition-all duration-300"
//                 style={{ width: `${usageStats.usage_percentage}%` }}
//               ></div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Account Information Card */}
//       <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
//         <h2 className="text-xl font-bold text-white mb-4">Account Information</h2>
        
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div>
//             <label className="text-blue-200 text-sm">PPPoE Username</label>
//             <p className="text-white font-medium">{clientData.pppoe_username}</p>
//           </div>
          
//           <div>
//             <label className="text-blue-200 text-sm">Account Status</label>
//             <p className="text-green-400 font-medium">Active</p>
//           </div>
          
//           <div>
//             <label className="text-blue-200 text-sm">Current Plan</label>
//             <p className="text-white font-medium">{clientData.current_plan || 'No active plan'}</p>
//           </div>
          
//           <div>
//             <label className="text-blue-200 text-sm">Plan Expiry</label>
//             <p className="text-white font-medium">{clientData.plan_expiry || 'N/A'}</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PPPoEDashboard;




import React, { useState, useEffect } from "react";
import { 
  Network, Wifi, Download, Upload, Clock, 
  RefreshCw, AlertCircle, CheckCircle2, User 
} from "lucide-react";
import api from "../../api";

const PPPoEDashboard = ({ clientData }) => {
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [sessionInfo, setSessionInfo] = useState(null);
  const [usageStats, setUsageStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (clientData && clientData.id) {
      fetchConnectionStatus();
      fetchUsageStats();
    }
  }, [clientData]);

  const fetchConnectionStatus = async () => {
    try {
      // ✅ CORRECTED: Using proper PPPoE users endpoint
      const response = await api.get(`/api/network_management/pppoe-users/`, {
        params: { 
          client_id: clientData.id
        }
      });
      
      if (response.data.length > 0) {
        const pppoeUser = response.data[0];
        setConnectionStatus(pppoeUser.active ? 'connected' : 'disconnected');
        setSessionInfo({
          ip_address: pppoeUser.ip_address,
          duration: pppoeUser.total_session_time,
          connected_since: pppoeUser.connected_at
        });
      } else {
        setConnectionStatus('disconnected');
        setSessionInfo(null);
      }
    } catch (error) {
      console.error("Failed to fetch connection status:", error);
      setError("Failed to load connection status");
      setConnectionStatus('unknown');
    }
  };

  const fetchUsageStats = async () => {
    try {
      // ✅ CORRECTED: Using proper client details endpoint
      const response = await api.get(`/api/account/clients/${clientData.id}/details/`);
      
      if (response.data) {
        const client = response.data;
        setUsageStats({
          download_used: client.data_used_display || '0 GB',
          upload_used: client.upload_used_display || '0 GB',
          download_limit: client.data_capacity_display || 'Unlimited',
          upload_limit: 'Unlimited',
          usage_percentage: client.data_usage_percentage || 0,
          total_connection_time: client.total_connection_time_display || '0h 0m'
        });
      }
    } catch (error) {
      console.error("Failed to fetch usage stats:", error);
      setError("Failed to load usage statistics");
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    setError("");
    await Promise.all([fetchConnectionStatus(), fetchUsageStats()]);
    setRefreshing(false);
  };

  const handleConnect = async () => {
    try {
      setLoading(true);
      setError("");
      
      // ✅ CORRECTED: Using proper user activation endpoint
      const response = await api.post(`/api/network_management/routers/activate-user/`, {
        client_id: clientData.id,
        username: clientData.pppoe_username,
        password: clientData.pppoe_password,
        connection_type: 'pppoe',
        plan_id: clientData.current_plan_id
      });

      if (response.data.success) {
        setTimeout(() => {
          fetchConnectionStatus();
          fetchUsageStats();
        }, 3000);
      } else {
        setError(response.data.error || "Failed to connect");
      }
    } catch (error) {
      console.error("Failed to connect:", error);
      setError(error.response?.data?.error || "Connection failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setLoading(true);
      setError("");
      
      // ✅ CORRECTED: Using proper user deactivation endpoint
      const response = await api.post(`/api/network_management/pppoe-users/${clientData.pppoe_username}/disconnect/`);

      if (response.data.success) {
        setConnectionStatus('disconnected');
        setSessionInfo(null);
      } else {
        setError(response.data.error || "Failed to disconnect");
      }
    } catch (error) {
      console.error("Failed to disconnect:", error);
      setError(error.response?.data?.error || "Disconnection failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreSession = async () => {
    try {
      setLoading(true);
      setError("");
      
      // ✅ CORRECTED: Using proper session recovery endpoint
      const response = await api.post(`/api/network_management/restore-sessions/`, {
        client_id: clientData.id,
        user_type: 'pppoe'
      });

      if (response.data.success) {
        setTimeout(() => fetchConnectionStatus(), 2000);
      } else {
        setError("Failed to restore session");
      }
    } catch (error) {
      console.error("Failed to restore session:", error);
      setError("Session restoration failed");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected': return 'text-green-400';
      case 'connecting': return 'text-yellow-400';
      case 'disconnected': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected': return <CheckCircle2 className="w-5 h-5 text-green-400" />;
      case 'connecting': return <RefreshCw className="w-5 h-5 text-yellow-400 animate-spin" />;
      case 'disconnected': return <AlertCircle className="w-5 h-5 text-red-400" />;
      default: return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const formatDuration = (duration) => {
    if (!duration) return '00:00:00';
    if (typeof duration === 'string') return duration;
    
    // Handle duration object or string
    const seconds = typeof duration === 'object' ? duration.total_seconds : duration;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading && !refreshing) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-8">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-8 h-8 text-blue-300 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 mb-8">
      {/* Error Display */}
      {error && (
        <div className="bg-red-500/20 border border-red-400/30 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-200 text-sm">{error}</p>
            <button
              onClick={() => setError("")}
              className="ml-auto text-red-300 hover:text-red-200"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Connection Status Card */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">PPPoE Connection Status</h2>
          <button
            onClick={refreshData}
            disabled={refreshing}
            className="p-2 text-blue-300 hover:text-blue-200 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="flex items-center gap-3 mb-2">
              {getStatusIcon(connectionStatus)}
              <span className={`font-medium ${getStatusColor(connectionStatus)}`}>
                {connectionStatus.charAt(0).toUpperCase() + connectionStatus.slice(1)}
              </span>
            </div>
            <p className="text-blue-200 text-sm">Connection Status</p>
          </div>

          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <Network className="w-5 h-5 text-blue-300" />
              <span className="font-medium text-white">
                {sessionInfo?.ip_address || 'Not Assigned'}
              </span>
            </div>
            <p className="text-blue-200 text-sm">IP Address</p>
          </div>

          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-blue-300" />
              <span className="font-medium text-white">
                {formatDuration(sessionInfo?.duration)}
              </span>
            </div>
            <p className="text-blue-200 text-sm">Session Duration</p>
          </div>
        </div>

        <div className="flex gap-3 flex-wrap">
          {connectionStatus === 'disconnected' ? (
            <button
              onClick={handleConnect}
              disabled={loading}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Wifi className="w-4 h-4" />
              {loading ? 'Connecting...' : 'Connect'}
            </button>
          ) : (
            <button
              onClick={handleDisconnect}
              disabled={loading}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Wifi className="w-4 h-4" />
              {loading ? 'Disconnecting...' : 'Disconnect'}
            </button>
          )}
          
          <button
            onClick={refreshData}
            disabled={refreshing}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          {connectionStatus === 'disconnected' && (
            <button
              onClick={handleRestoreSession}
              disabled={loading}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Restore Session
            </button>
          )}
        </div>
      </div>

      {/* Usage Statistics Card */}
      {usageStats && (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <h2 className="text-xl font-bold text-white mb-4">Usage Statistics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="flex items-center gap-3 mb-2">
                <Download className="w-5 h-5 text-green-400" />
                <span className="font-medium text-white">{usageStats.download_used}</span>
              </div>
              <p className="text-blue-200 text-sm">Download Used</p>
            </div>

            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="flex items-center gap-3 mb-2">
                <Upload className="w-5 h-5 text-blue-400" />
                <span className="font-medium text-white">{usageStats.upload_used}</span>
              </div>
              <p className="text-blue-200 text-sm">Upload Used</p>
            </div>

            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="flex items-center gap-3 mb-2">
                <Download className="w-5 h-5 text-purple-400" />
                <span className="font-medium text-white">{usageStats.download_limit}</span>
              </div>
              <p className="text-blue-200 text-sm">Download Limit</p>
            </div>

            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-5 h-5 text-orange-400" />
                <span className="font-medium text-white">{usageStats.total_connection_time}</span>
              </div>
              <p className="text-blue-200 text-sm">Total Connection Time</p>
            </div>
          </div>

          {/* Usage Progress Bar */}
          {usageStats.usage_percentage > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-blue-200 text-sm mb-2">
                <span>Data Usage</span>
                <span>{usageStats.usage_percentage}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-400 to-blue-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(usageStats.usage_percentage, 100)}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Account Information Card */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <h2 className="text-xl font-bold text-white mb-4">Account Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-blue-200 text-sm">PPPoE Username</label>
            <p className="text-white font-medium">{clientData.pppoe_username}</p>
          </div>
          
          <div>
            <label className="text-blue-200 text-sm">Connection Type</label>
            <p className="text-green-400 font-medium flex items-center gap-2">
              <Network className="w-4 h-4" />
              PPPoE
            </p>
          </div>
          
          <div>
            <label className="text-blue-200 text-sm">Account Status</label>
            <p className="text-green-400 font-medium">Active</p>
          </div>
          
          <div>
            <label className="text-blue-200 text-sm">Client Since</label>
            <p className="text-white font-medium">
              {clientData.created_at ? new Date(clientData.created_at).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions Card */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={refreshData}
            disabled={refreshing}
            className="p-4 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-400/30 rounded-lg transition-all duration-200 flex items-center gap-3 group"
          >
            <RefreshCw className={`w-5 h-5 text-blue-300 ${refreshing ? 'animate-spin' : ''}`} />
            <div className="text-left">
              <p className="text-white font-medium">Refresh Data</p>
              <p className="text-blue-200 text-sm">Update all statistics</p>
            </div>
          </button>

          <button
            onClick={handleRestoreSession}
            disabled={loading}
            className="p-4 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-400/30 rounded-lg transition-all duration-200 flex items-center gap-3 group"
          >
            <RefreshCw className="w-5 h-5 text-purple-300" />
            <div className="text-left">
              <p className="text-white font-medium">Restore Session</p>
              <p className="text-purple-200 text-sm">Recover connection</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PPPoEDashboard;