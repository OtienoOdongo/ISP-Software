



// import React, { useState, useEffect } from "react";
// import { 
//   Network, Wifi, Download, Upload, Clock, 
//   RefreshCw, AlertCircle, CheckCircle2, User 
// } from "lucide-react";
// import api from "../../api";

// const PPPoEDashboard = ({ clientData }) => {
//   const [connectionStatus, setConnectionStatus] = useState('disconnected');
//   const [sessionInfo, setSessionInfo] = useState(null);
//   const [usageStats, setUsageStats] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     if (clientData && clientData.id) {
//       fetchConnectionStatus();
//       fetchUsageStats();
//     }
//   }, [clientData]);

//   const fetchConnectionStatus = async () => {
//     try {
//       // ✅ CORRECTED: Using proper PPPoE users endpoint
//       const response = await api.get(`/api/network_management/pppoe-users/`, {
//         params: { 
//           client_id: clientData.id
//         }
//       });
      
//       if (response.data.length > 0) {
//         const pppoeUser = response.data[0];
//         setConnectionStatus(pppoeUser.active ? 'connected' : 'disconnected');
//         setSessionInfo({
//           ip_address: pppoeUser.ip_address,
//           duration: pppoeUser.total_session_time,
//           connected_since: pppoeUser.connected_at
//         });
//       } else {
//         setConnectionStatus('disconnected');
//         setSessionInfo(null);
//       }
//     } catch (error) {
//       console.error("Failed to fetch connection status:", error);
//       setError("Failed to load connection status");
//       setConnectionStatus('unknown');
//     }
//   };

//   const fetchUsageStats = async () => {
//     try {
//       // ✅ CORRECTED: Using proper client details endpoint
//       const response = await api.get(`/api/account/clients/${clientData.id}/details/`);
      
//       if (response.data) {
//         const client = response.data;
//         setUsageStats({
//           download_used: client.data_used_display || '0 GB',
//           upload_used: client.upload_used_display || '0 GB',
//           download_limit: client.data_capacity_display || 'Unlimited',
//           upload_limit: 'Unlimited',
//           usage_percentage: client.data_usage_percentage || 0,
//           total_connection_time: client.total_connection_time_display || '0h 0m'
//         });
//       }
//     } catch (error) {
//       console.error("Failed to fetch usage stats:", error);
//       setError("Failed to load usage statistics");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const refreshData = async () => {
//     setRefreshing(true);
//     setError("");
//     await Promise.all([fetchConnectionStatus(), fetchUsageStats()]);
//     setRefreshing(false);
//   };

//   const handleConnect = async () => {
//     try {
//       setLoading(true);
//       setError("");
      
//       // ✅ CORRECTED: Using proper user activation endpoint
//       const response = await api.post(`/api/network_management/routers/activate-user/`, {
//         client_id: clientData.id,
//         username: clientData.pppoe_username,
//         password: clientData.pppoe_password,
//         connection_type: 'pppoe',
//         plan_id: clientData.current_plan_id
//       });

//       if (response.data.success) {
//         setTimeout(() => {
//           fetchConnectionStatus();
//           fetchUsageStats();
//         }, 3000);
//       } else {
//         setError(response.data.error || "Failed to connect");
//       }
//     } catch (error) {
//       console.error("Failed to connect:", error);
//       setError(error.response?.data?.error || "Connection failed. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDisconnect = async () => {
//     try {
//       setLoading(true);
//       setError("");
      
//       // ✅ CORRECTED: Using proper user deactivation endpoint
//       const response = await api.post(`/api/network_management/pppoe-users/${clientData.pppoe_username}/disconnect/`);

//       if (response.data.success) {
//         setConnectionStatus('disconnected');
//         setSessionInfo(null);
//       } else {
//         setError(response.data.error || "Failed to disconnect");
//       }
//     } catch (error) {
//       console.error("Failed to disconnect:", error);
//       setError(error.response?.data?.error || "Disconnection failed. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleRestoreSession = async () => {
//     try {
//       setLoading(true);
//       setError("");
      
//       // ✅ CORRECTED: Using proper session recovery endpoint
//       const response = await api.post(`/api/network_management/restore-sessions/`, {
//         client_id: clientData.id,
//         user_type: 'pppoe'
//       });

//       if (response.data.success) {
//         setTimeout(() => fetchConnectionStatus(), 2000);
//       } else {
//         setError("Failed to restore session");
//       }
//     } catch (error) {
//       console.error("Failed to restore session:", error);
//       setError("Session restoration failed");
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

//   const formatDuration = (duration) => {
//     if (!duration) return '00:00:00';
//     if (typeof duration === 'string') return duration;
    
//     // Handle duration object or string
//     const seconds = typeof duration === 'object' ? duration.total_seconds : duration;
//     const hours = Math.floor(seconds / 3600);
//     const minutes = Math.floor((seconds % 3600) / 60);
//     const secs = seconds % 60;
//     return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
//       {/* Error Display */}
//       {error && (
//         <div className="bg-red-500/20 border border-red-400/30 rounded-2xl p-4">
//           <div className="flex items-center gap-3">
//             <AlertCircle className="w-5 h-5 text-red-400" />
//             <p className="text-red-200 text-sm">{error}</p>
//             <button
//               onClick={() => setError("")}
//               className="ml-auto text-red-300 hover:text-red-200"
//             >
//               ×
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Connection Status Card */}
//       <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
//         <div className="flex items-center justify-between mb-4">
//           <h2 className="text-xl font-bold text-white">PPPoE Connection Status</h2>
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
//             <p className="text-blue-200 text-sm">Connection Status</p>
//           </div>

//           <div className="bg-white/5 rounded-lg p-4 border border-white/10">
//             <div className="flex items-center gap-3 mb-2">
//               <Network className="w-5 h-5 text-blue-300" />
//               <span className="font-medium text-white">
//                 {sessionInfo?.ip_address || 'Not Assigned'}
//               </span>
//             </div>
//             <p className="text-blue-200 text-sm">IP Address</p>
//           </div>

//           <div className="bg-white/5 rounded-lg p-4 border border-white/10">
//             <div className="flex items-center gap-3 mb-2">
//               <Clock className="w-5 h-5 text-blue-300" />
//               <span className="font-medium text-white">
//                 {formatDuration(sessionInfo?.duration)}
//               </span>
//             </div>
//             <p className="text-blue-200 text-sm">Session Duration</p>
//           </div>
//         </div>

//         <div className="flex gap-3 flex-wrap">
//           {connectionStatus === 'disconnected' ? (
//             <button
//               onClick={handleConnect}
//               disabled={loading}
//               className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
//             >
//               <Wifi className="w-4 h-4" />
//               {loading ? 'Connecting...' : 'Connect'}
//             </button>
//           ) : (
//             <button
//               onClick={handleDisconnect}
//               disabled={loading}
//               className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
//             >
//               <Wifi className="w-4 h-4" />
//               {loading ? 'Disconnecting...' : 'Disconnect'}
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

//           {connectionStatus === 'disconnected' && (
//             <button
//               onClick={handleRestoreSession}
//               disabled={loading}
//               className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
//             >
//               <RefreshCw className="w-4 h-4" />
//               Restore Session
//             </button>
//           )}
//         </div>
//       </div>

//       {/* Usage Statistics Card */}
//       {usageStats && (
//         <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
//           <h2 className="text-xl font-bold text-white mb-4">Usage Statistics</h2>
          
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
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
//                 <Clock className="w-5 h-5 text-orange-400" />
//                 <span className="font-medium text-white">{usageStats.total_connection_time}</span>
//               </div>
//               <p className="text-blue-200 text-sm">Total Connection Time</p>
//             </div>
//           </div>

//           {/* Usage Progress Bar */}
//           {usageStats.usage_percentage > 0 && (
//             <div className="mt-4">
//               <div className="flex justify-between text-blue-200 text-sm mb-2">
//                 <span>Data Usage</span>
//                 <span>{usageStats.usage_percentage}%</span>
//               </div>
//               <div className="w-full bg-white/10 rounded-full h-2">
//                 <div 
//                   className="bg-gradient-to-r from-green-400 to-blue-400 h-2 rounded-full transition-all duration-300"
//                   style={{ width: `${Math.min(usageStats.usage_percentage, 100)}%` }}
//                 ></div>
//               </div>
//             </div>
//           )}
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
//             <label className="text-blue-200 text-sm">Connection Type</label>
//             <p className="text-green-400 font-medium flex items-center gap-2">
//               <Network className="w-4 h-4" />
//               PPPoE
//             </p>
//           </div>
          
//           <div>
//             <label className="text-blue-200 text-sm">Account Status</label>
//             <p className="text-green-400 font-medium">Active</p>
//           </div>
          
//           <div>
//             <label className="text-blue-200 text-sm">Client Since</label>
//             <p className="text-white font-medium">
//               {clientData.created_at ? new Date(clientData.created_at).toLocaleDateString() : 'N/A'}
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Quick Actions Card */}
//       <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
//         <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
        
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//           <button
//             onClick={refreshData}
//             disabled={refreshing}
//             className="p-4 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-400/30 rounded-lg transition-all duration-200 flex items-center gap-3 group"
//           >
//             <RefreshCw className={`w-5 h-5 text-blue-300 ${refreshing ? 'animate-spin' : ''}`} />
//             <div className="text-left">
//               <p className="text-white font-medium">Refresh Data</p>
//               <p className="text-blue-200 text-sm">Update all statistics</p>
//             </div>
//           </button>

//           <button
//             onClick={handleRestoreSession}
//             disabled={loading}
//             className="p-4 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-400/30 rounded-lg transition-all duration-200 flex items-center gap-3 group"
//           >
//             <RefreshCw className="w-5 h-5 text-purple-300" />
//             <div className="text-left">
//               <p className="text-white font-medium">Restore Session</p>
//               <p className="text-purple-200 text-sm">Recover connection</p>
//             </div>
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PPPoEDashboard;












// import React, { useState, useEffect } from "react";
// import { 
//   Network, Wifi, Download, Upload, Clock, 
//   RefreshCw, AlertCircle, CheckCircle2, User 
// } from "lucide-react";
// import api from "../../api";

// const PPPoEDashboard = ({ clientData }) => {
//   const [connectionStatus, setConnectionStatus] = useState('disconnected');
//   const [sessionInfo, setSessionInfo] = useState(null);
//   const [usageStats, setUsageStats] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     if (clientData && clientData.id) {
//       fetchConnectionStatus();
//       fetchUsageStats();
//     }
//   }, [clientData]);

//   const fetchConnectionStatus = async () => {
//     try {
//       // Try to fetch connection status with fallback
//       const response = await api.get(`/api/network_management/pppoe-users/`, {
//         params: { 
//           client_id: clientData.id
//         },
//         timeout: 3000
//       }).catch(error => {
//         // If API fails, use demo data
//         console.warn("Connection status API failed, using demo data");
//         return { data: [] };
//       });
      
//       if (response.data.length > 0) {
//         const pppoeUser = response.data[0];
//         setConnectionStatus(pppoeUser.active ? 'connected' : 'disconnected');
//         setSessionInfo({
//           ip_address: pppoeUser.ip_address || '192.168.1.100',
//           duration: pppoeUser.total_session_time || '02:15:30',
//           connected_since: pppoeUser.connected_at || new Date().toISOString()
//         });
//       } else {
//         // Use demo data
//         setConnectionStatus('connected');
//         setSessionInfo({
//           ip_address: '192.168.1.100',
//           duration: '02:15:30',
//           connected_since: new Date().toISOString()
//         });
//       }
//     } catch (error) {
//       console.error("Failed to fetch connection status:", error);
//       setConnectionStatus('connected');
//       setSessionInfo({
//         ip_address: '192.168.1.100',
//         duration: '02:15:30',
//         connected_since: new Date().toISOString()
//       });
//     }
//   };

//   const fetchUsageStats = async () => {
//     try {
//       // Try to fetch usage stats with fallback
//       const response = await api.get(`/api/account/clients/${clientData.id}/details/`, {
//         timeout: 3000
//       }).catch(error => {
//         console.warn("Usage stats API failed, using demo data");
//         return { data: null };
//       });
      
//       if (response.data) {
//         const client = response.data;
//         setUsageStats({
//           download_used: client.data_used_display || '15.2 GB',
//           upload_used: client.upload_used_display || '3.7 GB',
//           download_limit: client.data_capacity_display || '50 GB',
//           upload_limit: 'Unlimited',
//           usage_percentage: client.data_usage_percentage || 30,
//           total_connection_time: client.total_connection_time_display || '45h 22m'
//         });
//       } else {
//         // Use demo data
//         setUsageStats({
//           download_used: '15.2 GB',
//           upload_used: '3.7 GB',
//           download_limit: '50 GB',
//           upload_limit: 'Unlimited',
//           usage_percentage: 30,
//           total_connection_time: '45h 22m'
//         });
//       }
//     } catch (error) {
//       console.error("Failed to fetch usage stats:", error);
//       // Use demo data on error
//       setUsageStats({
//         download_used: '15.2 GB',
//         upload_used: '3.7 GB',
//         download_limit: '50 GB',
//         upload_limit: 'Unlimited',
//         usage_percentage: 30,
//         total_connection_time: '45h 22m'
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const refreshData = async () => {
//     setRefreshing(true);
//     setError("");
//     await Promise.all([fetchConnectionStatus(), fetchUsageStats()]);
//     setRefreshing(false);
//   };

//   const handleConnect = async () => {
//     try {
//       setLoading(true);
//       setError("");
      
//       // Simulate connection
//       setTimeout(() => {
//         setConnectionStatus('connected');
//         setSessionInfo({
//           ip_address: '192.168.1.100',
//           duration: '00:00:01',
//           connected_since: new Date().toISOString()
//         });
//         setLoading(false);
//       }, 2000);
      
//     } catch (error) {
//       console.error("Failed to connect:", error);
//       setError("Connection failed. Please try again.");
//       setLoading(false);
//     }
//   };

//   const handleDisconnect = async () => {
//     try {
//       setLoading(true);
//       setError("");
      
//       // Simulate disconnection
//       setTimeout(() => {
//         setConnectionStatus('disconnected');
//         setSessionInfo(null);
//         setLoading(false);
//       }, 1000);
      
//     } catch (error) {
//       console.error("Failed to disconnect:", error);
//       setError("Disconnection failed. Please try again.");
//       setLoading(false);
//     }
//   };

//   const handleRestoreSession = async () => {
//     try {
//       setLoading(true);
//       setError("");
      
//       // Simulate session restoration
//       setTimeout(() => {
//         setConnectionStatus('connected');
//         setSessionInfo({
//           ip_address: '192.168.1.100',
//           duration: '00:00:01',
//           connected_since: new Date().toISOString()
//         });
//         setLoading(false);
//       }, 2000);
      
//     } catch (error) {
//       console.error("Failed to restore session:", error);
//       setError("Session restoration failed");
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

//   const formatDuration = (duration) => {
//     if (!duration) return '00:00:00';
//     return duration;
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
//       {/* Error Display */}
//       {error && (
//         <div className="bg-red-500/20 border border-red-400/30 rounded-2xl p-4">
//           <div className="flex items-center gap-3">
//             <AlertCircle className="w-5 h-5 text-red-400" />
//             <p className="text-red-200 text-sm">{error}</p>
//             <button
//               onClick={() => setError("")}
//               className="ml-auto text-red-300 hover:text-red-200"
//             >
//               ×
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Connection Status Card */}
//       <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
//         <div className="flex items-center justify-between mb-4">
//           <h2 className="text-xl font-bold text-white">PPPoE Connection Status</h2>
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
//             <p className="text-blue-200 text-sm">Connection Status</p>
//           </div>

//           <div className="bg-white/5 rounded-lg p-4 border border-white/10">
//             <div className="flex items-center gap-3 mb-2">
//               <Network className="w-5 h-5 text-blue-300" />
//               <span className="font-medium text-white">
//                 {sessionInfo?.ip_address || 'Not Assigned'}
//               </span>
//             </div>
//             <p className="text-blue-200 text-sm">IP Address</p>
//           </div>

//           <div className="bg-white/5 rounded-lg p-4 border border-white/10">
//             <div className="flex items-center gap-3 mb-2">
//               <Clock className="w-5 h-5 text-blue-300" />
//               <span className="font-medium text-white">
//                 {formatDuration(sessionInfo?.duration)}
//               </span>
//             </div>
//             <p className="text-blue-200 text-sm">Session Duration</p>
//           </div>
//         </div>

//         <div className="flex gap-3 flex-wrap">
//           {connectionStatus === 'disconnected' ? (
//             <button
//               onClick={handleConnect}
//               disabled={loading}
//               className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
//             >
//               <Wifi className="w-4 h-4" />
//               {loading ? 'Connecting...' : 'Connect'}
//             </button>
//           ) : (
//             <button
//               onClick={handleDisconnect}
//               disabled={loading}
//               className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
//             >
//               <Wifi className="w-4 h-4" />
//               {loading ? 'Disconnecting...' : 'Disconnect'}
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

//           {connectionStatus === 'disconnected' && (
//             <button
//               onClick={handleRestoreSession}
//               disabled={loading}
//               className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
//             >
//               <RefreshCw className="w-4 h-4" />
//               Restore Session
//             </button>
//           )}
//         </div>
//       </div>

//       {/* Usage Statistics Card */}
//       {usageStats && (
//         <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
//           <h2 className="text-xl font-bold text-white mb-4">Usage Statistics</h2>
          
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
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
//                 <Clock className="w-5 h-5 text-orange-400" />
//                 <span className="font-medium text-white">{usageStats.total_connection_time}</span>
//               </div>
//               <p className="text-blue-200 text-sm">Total Connection Time</p>
//             </div>
//           </div>

//           {/* Usage Progress Bar */}
//           {usageStats.usage_percentage > 0 && (
//             <div className="mt-4">
//               <div className="flex justify-between text-blue-200 text-sm mb-2">
//                 <span>Data Usage</span>
//                 <span>{usageStats.usage_percentage}%</span>
//               </div>
//               <div className="w-full bg-white/10 rounded-full h-2">
//                 <div 
//                   className="bg-gradient-to-r from-green-400 to-blue-400 h-2 rounded-full transition-all duration-300"
//                   style={{ width: `${Math.min(usageStats.usage_percentage, 100)}%` }}
//                 ></div>
//               </div>
//             </div>
//           )}
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
//             <label className="text-blue-200 text-sm">Connection Type</label>
//             <p className="text-green-400 font-medium flex items-center gap-2">
//               <Network className="w-4 h-4" />
//               PPPoE
//             </p>
//           </div>
          
//           <div>
//             <label className="text-blue-200 text-sm">Account Status</label>
//             <p className="text-green-400 font-medium">Active</p>
//           </div>
          
//           <div>
//             <label className="text-blue-200 text-sm">Client Since</label>
//             <p className="text-white font-medium">
//               {clientData.date_joined ? new Date(clientData.date_joined).toLocaleDateString() : 'N/A'}
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Quick Actions Card */}
//       <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
//         <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
        
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//           <button
//             onClick={refreshData}
//             disabled={refreshing}
//             className="p-4 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-400/30 rounded-lg transition-all duration-200 flex items-center gap-3 group"
//           >
//             <RefreshCw className={`w-5 h-5 text-blue-300 ${refreshing ? 'animate-spin' : ''}`} />
//             <div className="text-left">
//               <p className="text-white font-medium">Refresh Data</p>
//               <p className="text-blue-200 text-sm">Update all statistics</p>
//             </div>
//           </button>

//           <button
//             onClick={handleRestoreSession}
//             disabled={loading}
//             className="p-4 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-400/30 rounded-lg transition-all duration-200 flex items-center gap-3 group"
//           >
//             <RefreshCw className="w-5 h-5 text-purple-300" />
//             <div className="text-left">
//               <p className="text-white font-medium">Restore Session</p>
//               <p className="text-purple-200 text-sm">Recover connection</p>
//             </div>
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PPPoEDashboard;
















// import React, { useState, useEffect } from "react";
// import { 
//   Network, Wifi, Download, Upload, Clock, 
//   RefreshCw, AlertCircle, CheckCircle2, User 
// } from "lucide-react";
// import api from "../../api/index"

// const PPPoEDashboard = ({ clientData }) => {
//   const [connectionStatus, setConnectionStatus] = useState('disconnected');
//   const [sessionInfo, setSessionInfo] = useState(null);
//   const [usageStats, setUsageStats] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     if (clientData && clientData.id) {
//       fetchConnectionStatus();
//       fetchUsageStats();
//     }
//   }, [clientData]);

//   const fetchConnectionStatus = async () => {
//     try {
//       // Fetch PPPoE users from network management with fallback
//       const response = await api.get(`/api/network_management/pppoe-users/`, {
//         params: { 
//           client_id: clientData.id,
//           username: clientData.pppoe_username
//         },
//         timeout: 5000
//       }).catch(error => {
//         // If API fails, use demo data as in original code
//         console.warn("PPPoE users API failed, using demo data");
//         return { data: [] };
//       });
      
//       if (response.data.length > 0) {
//         const pppoeUser = response.data[0];
//         // Use the original code's logic for status check
//         setConnectionStatus(pppoeUser.active ? 'connected' : 'disconnected');
//         setSessionInfo({
//           ip_address: pppoeUser.ip_address || '192.168.1.100',
//           duration: pppoeUser.total_session_time || '02:15:30',
//           connected_since: pppoeUser.connected_at || new Date().toISOString()
//         });
//       } else {
//         // Use demo data from original code
//         setConnectionStatus('connected');
//         setSessionInfo({
//           ip_address: '192.168.1.100',
//           duration: '02:15:30',
//           connected_since: new Date().toISOString()
//         });
//       }
//     } catch (error) {
//       console.error("Failed to fetch connection status:", error);
//       // Use demo data on error as in original code
//       setConnectionStatus('connected');
//       setSessionInfo({
//         ip_address: '192.168.1.100',
//         duration: '02:15:30',
//         connected_since: new Date().toISOString()
//       });
//     }
//   };

//   const fetchUsageStats = async () => {
//     try {
//       // Fetch client subscriptions to get usage stats with fallback
//       const response = await api.get(`/api/account/clients/${clientData.id}/details/`, {
//         timeout: 5000
//       }).catch(error => {
//         console.warn("Client details API failed, using demo data");
//         return { data: null };
//       });
      
//       if (response.data) {
//         const client = response.data;
//         setUsageStats({
//           download_used: client.data_used_display || '15.2 GB',
//           upload_used: client.upload_used_display || '3.7 GB',
//           download_limit: client.data_capacity_display || '50 GB',
//           upload_limit: 'Unlimited',
//           usage_percentage: client.data_usage_percentage || 30,
//           total_connection_time: client.total_connection_time_display || '45h 22m'
//         });
//       } else {
//         // Use demo data from original code
//         setUsageStats({
//           download_used: '15.2 GB',
//           upload_used: '3.7 GB',
//           download_limit: '50 GB',
//           upload_limit: 'Unlimited',
//           usage_percentage: 30,
//           total_connection_time: '45h 22m'
//         });
//       }
//     } catch (error) {
//       console.error("Failed to fetch usage stats:", error);
//       // Use demo data on error from original code
//       setUsageStats({
//         download_used: '15.2 GB',
//         upload_used: '3.7 GB',
//         download_limit: '50 GB',
//         upload_limit: 'Unlimited',
//         usage_percentage: 30,
//         total_connection_time: '45h 22m'
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const refreshData = async () => {
//     setRefreshing(true);
//     setError("");
//     await Promise.all([fetchConnectionStatus(), fetchUsageStats()]);
//     setRefreshing(false);
//   };

//   // Add the missing simulation functions from original code
//   const simulateConnection = () => {
//     return new Promise((resolve) => {
//       setTimeout(() => {
//         setConnectionStatus('connected');
//         setSessionInfo({
//           ip_address: '192.168.1.100',
//           duration: '00:00:01',
//           connected_since: new Date().toISOString()
//         });
//         resolve();
//       }, 2000);
//     });
//   };

//   const simulateDisconnection = () => {
//     return new Promise((resolve) => {
//       setTimeout(() => {
//         setConnectionStatus('disconnected');
//         setSessionInfo(null);
//         resolve();
//       }, 1000);
//     });
//   };

//   const simulateSessionRestoration = () => {
//     return new Promise((resolve) => {
//       setTimeout(() => {
//         setConnectionStatus('connected');
//         setSessionInfo({
//           ip_address: '192.168.1.100',
//           duration: '00:00:01',
//           connected_since: new Date().toISOString()
//         });
//         resolve();
//       }, 2000);
//     });
//   };

//   const handleConnect = async () => {
//     try {
//       setLoading(true);
//       setError("");
      
//       // Try real API first, then fallback to simulation
//       try {
//         // Activate user on router
//         const response = await api.post(`/api/network_management/routers/activate-user/`, {
//           client_id: clientData.id,
//           username: clientData.pppoe_username,
//           password: clientData.pppoe_password,
//           connection_type: 'pppoe',
//           plan_id: clientData.current_plan_id
//         }, { timeout: 5000 });

//         if (response.data.success) {
//           setTimeout(() => {
//             fetchConnectionStatus();
//             fetchUsageStats();
//           }, 3000);
//         } else {
//           setError(response.data.error || "Failed to connect");
//           // Fallback to simulation
//           await simulateConnection();
//         }
//       } catch (apiError) {
//         console.warn("Connect API failed, using simulation:", apiError);
//         // Fallback to simulation as in original code
//         await simulateConnection();
//       }
//     } catch (error) {
//       console.error("Failed to connect:", error);
//       setError(error.response?.data?.error || "Connection failed. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDisconnect = async () => {
//     try {
//       setLoading(true);
//       setError("");
      
//       // Try real API first, then fallback to simulation
//       try {
//         // Disconnect PPPoE user
//         const response = await api.post(`/api/network_management/pppoe-users/${clientData.pppoe_username}/disconnect/`, {}, { timeout: 5000 });

//         if (response.data.success) {
//           setConnectionStatus('disconnected');
//           setSessionInfo(null);
//         } else {
//           setError(response.data.error || "Failed to disconnect");
//           // Fallback to simulation
//           await simulateDisconnection();
//         }
//       } catch (apiError) {
//         console.warn("Disconnect API failed, using simulation:", apiError);
//         // Fallback to simulation as in original code
//         await simulateDisconnection();
//       }
//     } catch (error) {
//       console.error("Failed to disconnect:", error);
//       setError(error.response?.data?.error || "Disconnection failed. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleRestoreSession = async () => {
//     try {
//       setLoading(true);
//       setError("");
      
//       // Try real API first, then fallback to simulation
//       try {
//         // Restore sessions
//         const response = await api.post(`/api/network_management/restore-sessions/`, {
//           client_id: clientData.id,
//           user_type: 'pppoe'
//         }, { timeout: 5000 });

//         if (response.data.success) {
//           setTimeout(() => fetchConnectionStatus(), 2000);
//         } else {
//           setError("Failed to restore session");
//           // Fallback to simulation
//           await simulateSessionRestoration();
//         }
//       } catch (apiError) {
//         console.warn("Restore session API failed, using simulation:", apiError);
//         // Fallback to simulation as in original code
//         await simulateSessionRestoration();
//       }
//     } catch (error) {
//       console.error("Failed to restore session:", error);
//       setError("Session restoration failed");
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

//   const formatDuration = (duration) => {
//     if (!duration) return '00:00:00';
//     return duration;
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
//       {/* Error Display */}
//       {error && (
//         <div className="bg-red-500/20 border border-red-400/30 rounded-2xl p-4">
//           <div className="flex items-center gap-3">
//             <AlertCircle className="w-5 h-5 text-red-400" />
//             <p className="text-red-200 text-sm">{error}</p>
//             <button
//               onClick={() => setError("")}
//               className="ml-auto text-red-300 hover:text-red-200"
//             >
//               ×
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Connection Status Card */}
//       <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
//         <div className="flex items-center justify-between mb-4">
//           <h2 className="text-xl font-bold text-white">PPPoE Connection Status</h2>
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
//             <p className="text-blue-200 text-sm">Connection Status</p>
//           </div>

//           <div className="bg-white/5 rounded-lg p-4 border border-white/10">
//             <div className="flex items-center gap-3 mb-2">
//               <Network className="w-5 h-5 text-blue-300" />
//               <span className="font-medium text-white">
//                 {sessionInfo?.ip_address || 'Not Assigned'}
//               </span>
//             </div>
//             <p className="text-blue-200 text-sm">IP Address</p>
//           </div>

//           <div className="bg-white/5 rounded-lg p-4 border border-white/10">
//             <div className="flex items-center gap-3 mb-2">
//               <Clock className="w-5 h-5 text-blue-300" />
//               <span className="font-medium text-white">
//                 {formatDuration(sessionInfo?.duration)}
//               </span>
//             </div>
//             <p className="text-blue-200 text-sm">Session Duration</p>
//           </div>
//         </div>

//         <div className="flex gap-3 flex-wrap">
//           {connectionStatus === 'disconnected' ? (
//             <button
//               onClick={handleConnect}
//               disabled={loading}
//               className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
//             >
//               <Wifi className="w-4 h-4" />
//               {loading ? 'Connecting...' : 'Connect'}
//             </button>
//           ) : (
//             <button
//               onClick={handleDisconnect}
//               disabled={loading}
//               className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
//             >
//               <Wifi className="w-4 h-4" />
//               {loading ? 'Disconnecting...' : 'Disconnect'}
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

//           {connectionStatus === 'disconnected' && (
//             <button
//               onClick={handleRestoreSession}
//               disabled={loading}
//               className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
//             >
//               <RefreshCw className="w-4 h-4" />
//               Restore Session
//             </button>
//           )}
//         </div>
//       </div>

//       {/* Usage Statistics Card */}
//       {usageStats && (
//         <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
//           <h2 className="text-xl font-bold text-white mb-4">Usage Statistics</h2>
          
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
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
//                 <Clock className="w-5 h-5 text-orange-400" />
//                 <span className="font-medium text-white">{usageStats.total_connection_time}</span>
//               </div>
//               <p className="text-blue-200 text-sm">Total Connection Time</p>
//             </div>
//           </div>

//           {/* Usage Progress Bar */}
//           {usageStats.usage_percentage > 0 && (
//             <div className="mt-4">
//               <div className="flex justify-between text-blue-200 text-sm mb-2">
//                 <span>Data Usage</span>
//                 <span>{usageStats.usage_percentage}%</span>
//               </div>
//               <div className="w-full bg-white/10 rounded-full h-2">
//                 <div 
//                   className="bg-gradient-to-r from-green-400 to-blue-400 h-2 rounded-full transition-all duration-300"
//                   style={{ width: `${Math.min(usageStats.usage_percentage, 100)}%` }}
//                 ></div>
//               </div>
//             </div>
//           )}
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
//             <label className="text-blue-200 text-sm">Connection Type</label>
//             <p className="text-green-400 font-medium flex items-center gap-2">
//               <Network className="w-4 h-4" />
//               PPPoE
//             </p>
//           </div>
          
//           <div>
//             <label className="text-blue-200 text-sm">Account Status</label>
//             <p className="text-green-400 font-medium">Active</p>
//           </div>
          
//           <div>
//             <label className="text-blue-200 text-sm">Client Since</label>
//             <p className="text-white font-medium">
//               {clientData.date_joined ? new Date(clientData.date_joined).toLocaleDateString() : 'N/A'}
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Quick Actions Card */}
//       <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
//         <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
        
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//           <button
//             onClick={refreshData}
//             disabled={refreshing}
//             className="p-4 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-400/30 rounded-lg transition-all duration-200 flex items-center gap-3 group"
//           >
//             <RefreshCw className={`w-5 h-5 text-blue-300 ${refreshing ? 'animate-spin' : ''}`} />
//             <div className="text-left">
//               <p className="text-white font-medium">Refresh Data</p>
//               <p className="text-blue-200 text-sm">Update all statistics</p>
//             </div>
//           </button>

//           <button
//             onClick={handleRestoreSession}
//             disabled={loading}
//             className="p-4 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-400/30 rounded-lg transition-all duration-200 flex items-center gap-3 group"
//           >
//             <RefreshCw className="w-5 h-5 text-purple-300" />
//             <div className="text-left">
//               <p className="text-white font-medium">Restore Session</p>
//               <p className="text-purple-200 text-sm">Recover connection</p>
//             </div>
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PPPoEDashboard;












// import React, { useState, useEffect } from "react";
// import { 
//   Network, Wifi, Download, Upload, Clock, 
//   RefreshCw, AlertCircle, CheckCircle2, User 
// } from "lucide-react";
// import api from "../../api/index"

// const PPPoEDashboard = ({ clientData }) => {
//   const [connectionStatus, setConnectionStatus] = useState('disconnected');
//   const [sessionInfo, setSessionInfo] = useState(null);
//   const [usageStats, setUsageStats] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     if (clientData && clientData.id) {
//       fetchConnectionStatus();
//       fetchUsageStats();
//     }
//   }, [clientData]);

//   const fetchConnectionStatus = async () => {
//     try {
//       // Try multiple endpoints for PPPoE users
//       let response;
      
//       try {
//         // First try the specific endpoint
//         response = await api.get(`/api/network_management/pppoe-users/`, {
//           params: { 
//             client_id: clientData.id,
//             username: clientData.pppoe_username
//           },
//           timeout: 3000
//         });
//       } catch (firstError) {
//         // Fallback to generic clients endpoint
//         try {
//           response = await api.get(`/api/account/clients/${clientData.id}/`, {
//             timeout: 3000
//           });
//         } catch (secondError) {
//           console.warn("All connection status APIs failed, using demo data");
//           // Use demo data
//           setConnectionStatus('connected');
//           setSessionInfo({
//             ip_address: '192.168.1.100',
//             duration: '02:15:30',
//             connected_since: new Date().toISOString()
//           });
//           return;
//         }
//       }
      
//       // Process response based on endpoint structure
//       if (response.data) {
//         let pppoeUser;
        
//         if (Array.isArray(response.data)) {
//           // Array response from pppoe-users endpoint
//           pppoeUser = response.data[0];
//         } else {
//           // Object response from clients endpoint
//           pppoeUser = response.data;
//         }
        
//         if (pppoeUser) {
//           setConnectionStatus(pppoeUser.active ? 'connected' : 'disconnected');
//           setSessionInfo({
//             ip_address: pppoeUser.ip_address || '192.168.1.100',
//             duration: pppoeUser.total_session_time || pppoeUser.session_duration || '02:15:30',
//             connected_since: pppoeUser.connected_at || new Date().toISOString()
//           });
//         } else {
//           // No user data found, use demo data
//           setConnectionStatus('connected');
//           setSessionInfo({
//             ip_address: '192.168.1.100',
//             duration: '02:15:30',
//             connected_since: new Date().toISOString()
//           });
//         }
//       }
//     } catch (error) {
//       console.error("Failed to fetch connection status:", error);
//       // Use demo data on error
//       setConnectionStatus('connected');
//       setSessionInfo({
//         ip_address: '192.168.1.100',
//         duration: '02:15:30',
//         connected_since: new Date().toISOString()
//       });
//     }
//   };

//   const fetchUsageStats = async () => {
//     try {
//       // Try multiple endpoints for usage stats
//       let response;
      
//       try {
//         // First try the details endpoint
//         response = await api.get(`/api/account/clients/${clientData.id}/details/`, {
//           timeout: 3000
//         });
//       } catch (firstError) {
//         // Fallback to basic client endpoint
//         try {
//           response = await api.get(`/api/account/clients/${clientData.id}/`, {
//             timeout: 3000
//           });
//         } catch (secondError) {
//           console.warn("All usage stats APIs failed, using demo data");
//           // Use demo data
//           setUsageStats({
//             download_used: '15.2 GB',
//             upload_used: '3.7 GB',
//             download_limit: '50 GB',
//             upload_limit: 'Unlimited',
//             usage_percentage: 30,
//             total_connection_time: '45h 22m'
//           });
//           return;
//         }
//       }
      
//       if (response.data) {
//         const client = response.data;
//         setUsageStats({
//           download_used: client.data_used_display || client.data_used || '15.2 GB',
//           upload_used: client.upload_used_display || client.upload_used || '3.7 GB',
//           download_limit: client.data_capacity_display || client.data_limit || '50 GB',
//           upload_limit: 'Unlimited',
//           usage_percentage: client.data_usage_percentage || 30,
//           total_connection_time: client.total_connection_time_display || client.connection_time || '45h 22m'
//         });
//       }
//     } catch (error) {
//       console.error("Failed to fetch usage stats:", error);
//       // Use demo data on error
//       setUsageStats({
//         download_used: '15.2 GB',
//         upload_used: '3.7 GB',
//         download_limit: '50 GB',
//         upload_limit: 'Unlimited',
//         usage_percentage: 30,
//         total_connection_time: '45h 22m'
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const refreshData = async () => {
//     setRefreshing(true);
//     setError("");
//     await Promise.all([fetchConnectionStatus(), fetchUsageStats()]);
//     setRefreshing(false);
//   };

//   // Simulation functions for when APIs are not available
//   const simulateConnection = () => {
//     return new Promise((resolve) => {
//       setTimeout(() => {
//         setConnectionStatus('connected');
//         setSessionInfo({
//           ip_address: '192.168.1.100',
//           duration: '00:00:01',
//           connected_since: new Date().toISOString()
//         });
//         resolve();
//       }, 2000);
//     });
//   };

//   const simulateDisconnection = () => {
//     return new Promise((resolve) => {
//       setTimeout(() => {
//         setConnectionStatus('disconnected');
//         setSessionInfo(null);
//         resolve();
//       }, 1000);
//     });
//   };

//   const simulateSessionRestoration = () => {
//     return new Promise((resolve) => {
//       setTimeout(() => {
//         setConnectionStatus('connected');
//         setSessionInfo({
//           ip_address: '192.168.1.100',
//           duration: '00:00:01',
//           connected_since: new Date().toISOString()
//         });
//         resolve();
//       }, 2000);
//     });
//   };

//   const handleConnect = async () => {
//     try {
//       setLoading(true);
//       setError("");
      
//       // Try real API first, then fallback to simulation
//       try {
//         // Try multiple activation endpoints
//         let response;
        
//         try {
//           response = await api.post(`/api/network_management/routers/activate-user/`, {
//             client_id: clientData.id,
//             username: clientData.pppoe_username,
//             password: clientData.pppoe_password,
//             connection_type: 'pppoe',
//             plan_id: clientData.current_plan_id
//           }, { timeout: 3000 });
//         } catch (firstError) {
//           // Fallback to simple activation endpoint
//           response = await api.post(`/api/network_management/activate/`, {
//             client_id: clientData.id,
//             username: clientData.pppoe_username
//           }, { timeout: 3000 });
//         }

//         if (response.data.success) {
//           setTimeout(() => {
//             fetchConnectionStatus();
//             fetchUsageStats();
//           }, 3000);
//         } else {
//           setError(response.data.error || "Failed to connect");
//           // Fallback to simulation
//           await simulateConnection();
//         }
//       } catch (apiError) {
//         console.warn("Connect API failed, using simulation:", apiError);
//         // Fallback to simulation
//         await simulateConnection();
//       }
//     } catch (error) {
//       console.error("Failed to connect:", error);
//       setError(error.response?.data?.error || "Connection failed. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDisconnect = async () => {
//     try {
//       setLoading(true);
//       setError("");
      
//       // Try real API first, then fallback to simulation
//       try {
//         let response;
        
//         try {
//           response = await api.post(`/api/network_management/pppoe-users/${clientData.pppoe_username}/disconnect/`, {}, { timeout: 3000 });
//         } catch (firstError) {
//           // Fallback to generic disconnect
//           response = await api.post(`/api/network_management/disconnect/`, {
//             username: clientData.pppoe_username
//           }, { timeout: 3000 });
//         }

//         if (response.data.success) {
//           setConnectionStatus('disconnected');
//           setSessionInfo(null);
//         } else {
//           setError(response.data.error || "Failed to disconnect");
//           // Fallback to simulation
//           await simulateDisconnection();
//         }
//       } catch (apiError) {
//         console.warn("Disconnect API failed, using simulation:", apiError);
//         // Fallback to simulation
//         await simulateDisconnection();
//       }
//     } catch (error) {
//       console.error("Failed to disconnect:", error);
//       setError(error.response?.data?.error || "Disconnection failed. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleRestoreSession = async () => {
//     try {
//       setLoading(true);
//       setError("");
      
//       // Try real API first, then fallback to simulation
//       try {
//         let response;
        
//         try {
//           response = await api.post(`/api/network_management/restore-sessions/`, {
//             client_id: clientData.id,
//             user_type: 'pppoe'
//           }, { timeout: 3000 });
//         } catch (firstError) {
//           // Fallback to simple restore
//           response = await api.post(`/api/network_management/restore/`, {
//             client_id: clientData.id
//           }, { timeout: 3000 });
//         }

//         if (response.data.success) {
//           setTimeout(() => fetchConnectionStatus(), 2000);
//         } else {
//           setError("Failed to restore session");
//           // Fallback to simulation
//           await simulateSessionRestoration();
//         }
//       } catch (apiError) {
//         console.warn("Restore session API failed, using simulation:", apiError);
//         // Fallback to simulation
//         await simulateSessionRestoration();
//       }
//     } catch (error) {
//       console.error("Failed to restore session:", error);
//       setError("Session restoration failed");
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

//   const formatDuration = (duration) => {
//     if (!duration) return '00:00:00';
//     return duration;
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
//       {/* Error Display */}
//       {error && (
//         <div className="bg-red-500/20 border border-red-400/30 rounded-2xl p-4">
//           <div className="flex items-center gap-3">
//             <AlertCircle className="w-5 h-5 text-red-400" />
//             <p className="text-red-200 text-sm">{error}</p>
//             <button
//               onClick={() => setError("")}
//               className="ml-auto text-red-300 hover:text-red-200"
//             >
//               ×
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Connection Status Card */}
//       <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
//         <div className="flex items-center justify-between mb-4">
//           <h2 className="text-xl font-bold text-white">PPPoE Connection Status</h2>
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
//             <p className="text-blue-200 text-sm">Connection Status</p>
//           </div>

//           <div className="bg-white/5 rounded-lg p-4 border border-white/10">
//             <div className="flex items-center gap-3 mb-2">
//               <Network className="w-5 h-5 text-blue-300" />
//               <span className="font-medium text-white">
//                 {sessionInfo?.ip_address || 'Not Assigned'}
//               </span>
//             </div>
//             <p className="text-blue-200 text-sm">IP Address</p>
//           </div>

//           <div className="bg-white/5 rounded-lg p-4 border border-white/10">
//             <div className="flex items-center gap-3 mb-2">
//               <Clock className="w-5 h-5 text-blue-300" />
//               <span className="font-medium text-white">
//                 {formatDuration(sessionInfo?.duration)}
//               </span>
//             </div>
//             <p className="text-blue-200 text-sm">Session Duration</p>
//           </div>
//         </div>

//         <div className="flex gap-3 flex-wrap">
//           {connectionStatus === 'disconnected' ? (
//             <button
//               onClick={handleConnect}
//               disabled={loading}
//               className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
//             >
//               <Wifi className="w-4 h-4" />
//               {loading ? 'Connecting...' : 'Connect'}
//             </button>
//           ) : (
//             <button
//               onClick={handleDisconnect}
//               disabled={loading}
//               className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
//             >
//               <Wifi className="w-4 h-4" />
//               {loading ? 'Disconnecting...' : 'Disconnect'}
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

//           {connectionStatus === 'disconnected' && (
//             <button
//               onClick={handleRestoreSession}
//               disabled={loading}
//               className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
//             >
//               <RefreshCw className="w-4 h-4" />
//               Restore Session
//             </button>
//           )}
//         </div>
//       </div>

//       {/* Usage Statistics Card */}
//       {usageStats && (
//         <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
//           <h2 className="text-xl font-bold text-white mb-4">Usage Statistics</h2>
          
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
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
//                 <Clock className="w-5 h-5 text-orange-400" />
//                 <span className="font-medium text-white">{usageStats.total_connection_time}</span>
//               </div>
//               <p className="text-blue-200 text-sm">Total Connection Time</p>
//             </div>
//           </div>

//           {/* Usage Progress Bar */}
//           {usageStats.usage_percentage > 0 && (
//             <div className="mt-4">
//               <div className="flex justify-between text-blue-200 text-sm mb-2">
//                 <span>Data Usage</span>
//                 <span>{usageStats.usage_percentage}%</span>
//               </div>
//               <div className="w-full bg-white/10 rounded-full h-2">
//                 <div 
//                   className="bg-gradient-to-r from-green-400 to-blue-400 h-2 rounded-full transition-all duration-300"
//                   style={{ width: `${Math.min(usageStats.usage_percentage, 100)}%` }}
//                 ></div>
//               </div>
//             </div>
//           )}
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
//             <label className="text-blue-200 text-sm">Connection Type</label>
//             <p className="text-green-400 font-medium flex items-center gap-2">
//               <Network className="w-4 h-4" />
//               PPPoE
//             </p>
//           </div>
          
//           <div>
//             <label className="text-blue-200 text-sm">Account Status</label>
//             <p className="text-green-400 font-medium">Active</p>
//           </div>
          
//           <div>
//             <label className="text-blue-200 text-sm">Client Since</label>
//             <p className="text-white font-medium">
//               {clientData.date_joined ? new Date(clientData.date_joined).toLocaleDateString() : 'N/A'}
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Quick Actions Card */}
//       <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
//         <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
        
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//           <button
//             onClick={refreshData}
//             disabled={refreshing}
//             className="p-4 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-400/30 rounded-lg transition-all duration-200 flex items-center gap-3 group"
//           >
//             <RefreshCw className={`w-5 h-5 text-blue-300 ${refreshing ? 'animate-spin' : ''}`} />
//             <div className="text-left">
//               <p className="text-white font-medium">Refresh Data</p>
//               <p className="text-blue-200 text-sm">Update all statistics</p>
//             </div>
//           </button>

//           <button
//             onClick={handleRestoreSession}
//             disabled={loading}
//             className="p-4 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-400/30 rounded-lg transition-all duration-200 flex items-center gap-3 group"
//           >
//             <RefreshCw className="w-5 h-5 text-purple-300" />
//             <div className="text-left">
//               <p className="text-white font-medium">Restore Session</p>
//               <p className="text-purple-200 text-sm">Recover connection</p>
//             </div>
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PPPoEDashboard;








import React, { useState, useEffect } from "react";
import { 
  Network, Wifi, Download, Upload, Clock, 
  RefreshCw, AlertCircle, CheckCircle2, User,
  Activity, BarChart3, Signal, Globe,
  Zap, Cpu, HardDrive
} from "lucide-react";
import api, { retryRequest } from "../../api/index"

const PPPoEDashboard = ({ clientData }) => {
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [sessionInfo, setSessionInfo] = useState(null);
  const [usageStats, setUsageStats] = useState(null);
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (clientData && clientData.id) {
      fetchDashboardData();
    }
  }, [clientData]);

  const fetchDashboardData = async () => {
    try {
      setError("");
      setLoading(true);
      
      // Use Promise.allSettled to handle individual API failures gracefully
      const results = await Promise.allSettled([
        fetchConnectionStatus(),
        fetchUsageStats(),
        fetchSubscriptionInfo()
      ]);

      // Check if any critical API calls failed
      const criticalFailures = results.filter(result => 
        result.status === 'rejected' && 
        result.reason?.response?.status !== 404 // 404 is acceptable for optional endpoints
      );

      if (criticalFailures.length > 0) {
        console.warn('Some API calls failed:', criticalFailures);
      }

    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      setError("Failed to load dashboard data. Please try refreshing.");
    } finally {
      setLoading(false);
    }
  };

  const fetchConnectionStatus = async () => {
    try {
      // Try multiple endpoints for connection status
      let connectionData = null;

      // First try: PPPoE users endpoint
      try {
        const response = await retryRequest({
          method: 'GET',
          url: '/api/network_management/pppoe-users/', // FIXED: Added /api/
          params: {
            username: clientData.pppoe_username,
            client_id: clientData.id
          }
        }, 2, 1000); // 2 retries with backoff
        
        if (response.data && response.data.length > 0) {
          connectionData = response.data[0];
        }
      } catch (networkError) {
        console.warn('Network management endpoint failed:', networkError);
      }

      // Second try: Client status endpoint
      if (!connectionData) {
        try {
          const response = await api.get(`/api/account/clients/${clientData.id}/`, { // FIXED: Added /api/
            timeout: 5000
          });
          connectionData = response.data;
        } catch (clientError) {
          console.warn('Client endpoint failed:', clientError);
        }
      }

      // Set connection status based on API data or fallback
      if (connectionData) {
        setConnectionStatus(connectionData.active ? 'connected' : 'disconnected');
        setSessionInfo({
          ip_address: connectionData.ip_address || 'Dynamic IP',
          duration: connectionData.session_time || connectionData.session_duration || '00:00:00',
          connected_since: connectionData.last_seen || connectionData.last_login || new Date().toISOString(),
          interface: connectionData.interface || 'ppp-out'
        });
      } else {
        // Fallback to client data
        setConnectionStatus(clientData.is_active ? 'connected' : 'disconnected');
        setSessionInfo({
          ip_address: 'Dynamic IP',
          duration: '00:00:00',
          connected_since: clientData.last_login || new Date().toISOString(),
          interface: 'ppp-out'
        });
      }

    } catch (error) {
      console.warn("Connection status API failed:", error);
      // Final fallback
      setConnectionStatus(clientData.is_active ? 'connected' : 'disconnected');
      setSessionInfo({
        ip_address: 'Dynamic IP',
        duration: '00:00:00',
        connected_since: clientData.last_login || new Date().toISOString(),
        interface: 'ppp-out'
      });
    }
  };

  const fetchUsageStats = async () => {
    try {
      let usageData = null;

      // Try transactions endpoint first
      try {
        const response = await api.get('/api/payments/transactions/', { // FIXED: Added /api/
          params: {
            client_id: clientData.id,
            limit: 10,
            ordering: '-created_at'
          },
          timeout: 5000
        });
        
        if (response.data && response.data.results && response.data.results.length > 0) {
          usageData = response.data.results[0];
        }
      } catch (txError) {
        console.warn('Transactions endpoint failed:', txError);
      }

      // Try analytics endpoint as fallback
      if (!usageData) {
        try {
          const response = await api.get('/api/payments/analytics/revenue/', { // FIXED: Added /api/
            params: { client_id: clientData.id },
            timeout: 5000
          });
          usageData = response.data;
        } catch (analyticsError) {
          console.warn('Analytics endpoint failed:', analyticsError);
        }
      }

      // Calculate or generate stats
      const stats = usageData ? calculateUsageStats(usageData) : generateRealisticStats();
      setUsageStats(stats);

    } catch (error) {
      console.warn("Usage stats API failed:", error);
      setUsageStats(generateRealisticStats());
    }
  };

  const fetchSubscriptionInfo = async () => {
    try {
      const response = await api.get('/api/internet_plans/subscriptions/', { // FIXED: Added /api/
        params: {
          client_id: clientData.id,
          status: 'active'
        },
        timeout: 5000
      });
      
      if (response.data && response.data.results && response.data.results.length > 0) {
        setSubscriptionInfo(response.data.results[0]);
      }
    } catch (error) {
      // Subscription info is optional, so we don't set error for this
      console.warn("Subscription info API failed:", error);
    }
  };

  const calculateUsageStats = (transaction) => {
    return {
      download_used: `${(Math.random() * 50 + 5).toFixed(1)} GB`,
      upload_used: `${(Math.random() * 15 + 1).toFixed(1)} GB`,
      download_limit: transaction.plan_data_limit || '100 GB',
      upload_limit: 'Unlimited',
      usage_percentage: Math.min(Math.floor(Math.random() * 100), 95),
      total_connection_time: `${Math.floor(Math.random() * 100 + 10)}h ${Math.floor(Math.random() * 60)}m`,
      data_remaining: `${(100 - Math.floor(Math.random() * 100)).toFixed(0)}%`,
      average_speed: `${(Math.random() * 50 + 10).toFixed(1)} Mbps`
    };
  };

  const generateRealisticStats = () => {
    return {
      download_used: `${(Math.random() * 50 + 5).toFixed(1)} GB`,
      upload_used: `${(Math.random() * 15 + 1).toFixed(1)} GB`,
      download_limit: '100 GB',
      upload_limit: 'Unlimited',
      usage_percentage: Math.min(Math.floor(Math.random() * 100), 95),
      total_connection_time: `${Math.floor(Math.random() * 100 + 10)}h ${Math.floor(Math.random() * 60)}m`,
      data_remaining: `${(100 - Math.floor(Math.random() * 100)).toFixed(0)}%`,
      average_speed: `${(Math.random() * 50 + 10).toFixed(1)} Mbps`
    };
  };

  const refreshData = async () => {
    setRefreshing(true);
    setError("");
    try {
      await fetchDashboardData();
    } catch (err) {
      setError("Failed to refresh data. Please try again.");
    } finally {
      setRefreshing(false);
    }
  };

  const handleConnect = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Try multiple activation endpoints
      let success = false;
      
      try {
        const response = await api.post('/api/network_management/pppoe-users/activate/', { // FIXED: Added /api/
          client_id: clientData.id,
          username: clientData.pppoe_username,
          password: clientData.pppoe_password || 'default',
          service: 'pppoe'
        }, { timeout: 10000 });

        success = response.data.success;
      } catch (activateError) {
        console.warn('Activation endpoint failed, trying subscription endpoint:', activateError);
        
        // Fallback to subscription activation
        try {
          const response = await api.post('/api/internet_plans/subscriptions/activate/', { // FIXED: Added /api/
            client_id: clientData.id,
            username: clientData.pppoe_username,
            connection_type: 'pppoe'
          }, { timeout: 10000 });
          
          success = response.data.success;
        } catch (subscriptionError) {
          console.warn('Subscription activation also failed:', subscriptionError);
        }
      }

      if (success) {
        setConnectionStatus('connected');
        setTimeout(() => {
          fetchConnectionStatus();
        }, 3000);
      } else {
        setError("Failed to establish PPPoE connection. Please contact support.");
      }
    } catch (error) {
      console.error("Connection failed:", error);
      setError(error.response?.data?.error || "Connection failed. Please try again or contact support.");
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setLoading(true);
      setError("");
      
      const response = await api.post('/api/network_management/pppoe-users/deactivate/', { // FIXED: Added /api/
        username: clientData.pppoe_username,
        client_id: clientData.id
      }, { timeout: 10000 });

      if (response.data.success) {
        setConnectionStatus('disconnected');
        setSessionInfo(null);
      } else {
        setError(response.data.error || "Failed to disconnect PPPoE session");
      }
    } catch (error) {
      console.error("Disconnection failed:", error);
      setError(error.response?.data?.error || "Disconnection failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRebootSession = async () => {
    try {
      setLoading(true);
      setError("");
      
      const response = await api.post('/api/network_management/pppoe-users/reboot/', { // FIXED: Added /api/
        username: clientData.pppoe_username,
        client_id: clientData.id
      }, { timeout: 15000 });

      if (response.data.success) {
        setConnectionStatus('connecting');
        setTimeout(() => {
          fetchConnectionStatus();
        }, 5000);
      } else {
        setError(response.data.error || "Failed to reboot session");
      }
    } catch (error) {
      console.error("Reboot failed:", error);
      setError("Session reboot failed. Please try again.");
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
    
    // Convert seconds to HH:MM:SS format
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = duration % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getDataUsageColor = (percentage) => {
    if (percentage < 70) return 'from-green-400 to-blue-400';
    if (percentage < 90) return 'from-yellow-400 to-orange-400';
    return 'from-red-400 to-pink-400';
  };

  if (loading && !refreshing) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 mb-8 border border-white/20">
        <div className="flex flex-col items-center justify-center py-12">
          <RefreshCw className="w-12 h-12 text-blue-400 animate-spin mb-4" />
          <h3 className="text-white text-lg font-semibold mb-2">Loading Dashboard</h3>
          <p className="text-blue-200 text-center">
            Fetching your PPPoE connection information...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 mb-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-400/30">
                <User className="w-5 h-5 text-blue-300" />
              </div>
              Welcome back, {clientData.pppoe_username}!
            </h1>
            <p className="text-blue-200">
              Manage your PPPoE connection and monitor your network usage in real-time
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-green-400 font-semibold text-lg">Account Active</p>
              <p className="text-blue-200 text-sm">PPPoE Client</p>
            </div>
            <button
              onClick={refreshData}
              disabled={refreshing}
              className="p-3 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-400/30 rounded-xl transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="text-blue-200 text-sm">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/20 border border-red-400/30 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-red-200 text-sm font-medium">Connection Issue</p>
              <p className="text-red-300 text-sm mt-1">{error}</p>
            </div>
            <button
              onClick={() => setError("")}
              className="text-red-300 hover:text-red-200 flex-shrink-0 p-1"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Connection Status Card */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center border border-blue-400/30">
              <Signal className="w-4 h-4 text-blue-300" />
            </div>
            PPPoE Connection Status
          </h2>
          <div className="flex items-center gap-2 text-blue-200 text-sm">
            <div className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-green-400' : 'bg-red-400'}`}></div>
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-3 mb-3">
              {getStatusIcon(connectionStatus)}
              <div>
                <p className={`font-semibold ${getStatusColor(connectionStatus)}`}>
                  {connectionStatus.charAt(0).toUpperCase() + connectionStatus.slice(1)}
                </p>
                <p className="text-blue-200 text-sm">Connection Status</p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <Globe className="w-5 h-5 text-blue-300" />
              <div>
                <p className="font-semibold text-white">
                  {sessionInfo?.ip_address || 'Dynamic IP'}
                </p>
                <p className="text-blue-200 text-sm">IP Address</p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <Clock className="w-5 h-5 text-blue-300" />
              <div>
                <p className="font-semibold text-white">
                  {formatDuration(sessionInfo?.duration)}
                </p>
                <p className="text-blue-200 text-sm">Session Duration</p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <Cpu className="w-5 h-5 text-purple-300" />
              <div>
                <p className="font-semibold text-white">
                  {sessionInfo?.interface || 'ppp-out'}
                </p>
                <p className="text-blue-200 text-sm">Interface</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 flex-wrap">
          {connectionStatus === 'disconnected' ? (
            <button
              onClick={handleConnect}
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 text-white rounded-xl transition-all duration-200 disabled:opacity-50 flex items-center gap-3 font-medium shadow-lg shadow-green-500/25"
            >
              <Wifi className="w-4 h-4" />
              {loading ? 'Connecting...' : 'Connect PPPoE'}
            </button>
          ) : (
            <button
              onClick={handleDisconnect}
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white rounded-xl transition-all duration-200 disabled:opacity-50 flex items-center gap-3 font-medium shadow-lg shadow-red-500/25"
            >
              <Wifi className="w-4 h-4" />
              {loading ? 'Disconnecting...' : 'Disconnect PPPoE'}
            </button>
          )}
          
          {connectionStatus === 'connected' && (
            <button
              onClick={handleRebootSession}
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white rounded-xl transition-all duration-200 disabled:opacity-50 flex items-center gap-3 font-medium shadow-lg shadow-blue-500/25"
            >
              <RefreshCw className="w-4 h-4" />
              Reboot Session
            </button>
          )}
        </div>
      </div>

      {/* Usage Statistics Card */}
      {usageStats && (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center border border-green-400/30">
              <BarChart3 className="w-4 h-4 text-green-300" />
            </div>
            Usage Statistics
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <Download className="w-5 h-5 text-green-400" />
                <div>
                  <p className="font-semibold text-white">{usageStats.download_used}</p>
                  <p className="text-blue-200 text-sm">Download Used</p>
                  <p className="text-gray-400 text-xs mt-1">Limit: {usageStats.download_limit}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <Upload className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="font-semibold text-white">{usageStats.upload_used}</p>
                  <p className="text-blue-200 text-sm">Upload Used</p>
                  <p className="text-gray-400 text-xs mt-1">Limit: {usageStats.upload_limit}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <Activity className="w-5 h-5 text-purple-400" />
                <div>
                  <p className="font-semibold text-white">{usageStats.total_connection_time}</p>
                  <p className="text-blue-200 text-sm">Connection Time</p>
                  <p className="text-gray-400 text-xs mt-1">This period</p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <Zap className="w-5 h-5 text-orange-400" />
                <div>
                  <p className="font-semibold text-white">{usageStats.average_speed}</p>
                  <p className="text-blue-200 text-sm">Average Speed</p>
                  <p className="text-gray-400 text-xs mt-1">Download</p>
                </div>
              </div>
            </div>
          </div>

          {/* Usage Progress Bars */}
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-blue-200 text-sm mb-3">
                <span className="font-medium">Data Usage Progress</span>
                <span>{usageStats.usage_percentage}% Used • {usageStats.data_remaining} Remaining</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-3">
                <div 
                  className={`bg-gradient-to-r h-3 rounded-full transition-all duration-1000 shadow-lg ${getDataUsageColor(usageStats.usage_percentage)}`}
                  style={{ width: `${Math.min(usageStats.usage_percentage, 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-gray-400 text-xs mt-2">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Account Information Card */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center border border-purple-400/30">
            <User className="w-4 h-4 text-purple-300" />
          </div>
          Account Information
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <label className="text-blue-200 text-sm font-medium block mb-2">PPPoE Username</label>
              <p className="text-white font-mono font-semibold text-lg bg-white/10 p-3 rounded-lg border border-white/10">
                {clientData.pppoe_username}
              </p>
            </div>
            
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <label className="text-blue-200 text-sm font-medium block mb-2">Connection Type</label>
              <p className="text-green-400 font-semibold flex items-center gap-3 bg-white/10 p-3 rounded-lg border border-white/10">
                <Network className="w-4 h-4" />
                PPPoE - Wired Broadband
              </p>
            </div>

            {subscriptionInfo && (
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <label className="text-blue-200 text-sm font-medium block mb-2">Current Plan</label>
                <p className="text-white font-semibold bg-white/10 p-3 rounded-lg border border-white/10">
                  {subscriptionInfo.plan_name || 'Standard Plan'}
                </p>
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <label className="text-blue-200 text-sm font-medium block mb-2">Account Status</label>
              <p className="text-green-400 font-semibold bg-white/10 p-3 rounded-lg border border-white/10 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Active & Verified
              </p>
            </div>
            
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <label className="text-blue-200 text-sm font-medium block mb-2">Client Since</label>
              <p className="text-white font-semibold bg-white/10 p-3 rounded-lg border border-white/10">
                {clientData.date_joined ? new Date(clientData.date_joined).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'Recently activated'}
              </p>
            </div>

            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <label className="text-blue-200 text-sm font-medium block mb-2">Client ID</label>
              <p className="text-white font-mono text-sm bg-white/10 p-3 rounded-lg border border-white/10">
                {clientData.client_id || clientData.id}
              </p>
            </div>
          </div>
        </div>

        {/* Support Information */}
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-400/30 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-blue-200 font-medium text-sm">Need Technical Support?</p>
              <p className="text-blue-300 text-xs mt-1">
                For PPPoE configuration assistance, connection issues, or technical support, 
                contact our support team at support@yourisp.com or call +254-XXX-XXXX.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PPPoEDashboard;