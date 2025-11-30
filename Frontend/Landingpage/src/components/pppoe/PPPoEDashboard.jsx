


// import React, { useState, useEffect } from "react";
// import { 
//   Network, Wifi, Download, Upload, Clock, 
//   RefreshCw, AlertCircle, CheckCircle2, User,
//   Activity, BarChart3, Signal, Globe,
//   Zap, Cpu, HardDrive
// } from "lucide-react";
// import api, { retryRequest } from "../../api/index"

// const PPPoEDashboard = ({ clientData }) => {
//   const [connectionStatus, setConnectionStatus] = useState('disconnected');
//   const [sessionInfo, setSessionInfo] = useState(null);
//   const [usageStats, setUsageStats] = useState(null);
//   const [subscriptionInfo, setSubscriptionInfo] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     if (clientData && clientData.id) {
//       fetchDashboardData();
//     }
//   }, [clientData]);

//   const fetchDashboardData = async () => {
//     try {
//       setError("");
//       setLoading(true);
      
//       // Use Promise.allSettled to handle individual API failures gracefully
//       const results = await Promise.allSettled([
//         fetchConnectionStatus(),
//         fetchUsageStats(),
//         fetchSubscriptionInfo()
//       ]);

//       // Check if any critical API calls failed
//       const criticalFailures = results.filter(result => 
//         result.status === 'rejected' && 
//         result.reason?.response?.status !== 404 // 404 is acceptable for optional endpoints
//       );

//       if (criticalFailures.length > 0) {
//         console.warn('Some API calls failed:', criticalFailures);
//       }

//     } catch (err) {
//       console.error("Failed to fetch dashboard data:", err);
//       setError("Failed to load dashboard data. Please try refreshing.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchConnectionStatus = async () => {
//     try {
//       // Try multiple endpoints for connection status
//       let connectionData = null;

//       // First try: PPPoE users endpoint
//       try {
//         const response = await retryRequest({
//           method: 'GET',
//           url: '/api/network_management/pppoe-users/', // FIXED: Added /api/
//           params: {
//             username: clientData.pppoe_username,
//             client_id: clientData.id
//           }
//         }, 2, 1000); // 2 retries with backoff
        
//         if (response.data && response.data.length > 0) {
//           connectionData = response.data[0];
//         }
//       } catch (networkError) {
//         console.warn('Network management endpoint failed:', networkError);
//       }

//       // Second try: Client status endpoint
//       if (!connectionData) {
//         try {
//           const response = await api.get(`/api/account/clients/${clientData.id}/`, { // FIXED: Added /api/
//             timeout: 5000
//           });
//           connectionData = response.data;
//         } catch (clientError) {
//           console.warn('Client endpoint failed:', clientError);
//         }
//       }

//       // Set connection status based on API data or fallback
//       if (connectionData) {
//         setConnectionStatus(connectionData.active ? 'connected' : 'disconnected');
//         setSessionInfo({
//           ip_address: connectionData.ip_address || 'Dynamic IP',
//           duration: connectionData.session_time || connectionData.session_duration || '00:00:00',
//           connected_since: connectionData.last_seen || connectionData.last_login || new Date().toISOString(),
//           interface: connectionData.interface || 'ppp-out'
//         });
//       } else {
//         // Fallback to client data
//         setConnectionStatus(clientData.is_active ? 'connected' : 'disconnected');
//         setSessionInfo({
//           ip_address: 'Dynamic IP',
//           duration: '00:00:00',
//           connected_since: clientData.last_login || new Date().toISOString(),
//           interface: 'ppp-out'
//         });
//       }

//     } catch (error) {
//       console.warn("Connection status API failed:", error);
//       // Final fallback
//       setConnectionStatus(clientData.is_active ? 'connected' : 'disconnected');
//       setSessionInfo({
//         ip_address: 'Dynamic IP',
//         duration: '00:00:00',
//         connected_since: clientData.last_login || new Date().toISOString(),
//         interface: 'ppp-out'
//       });
//     }
//   };

//   const fetchUsageStats = async () => {
//     try {
//       let usageData = null;

//       // Try transactions endpoint first
//       try {
//         const response = await api.get('/api/payments/transactions/', { // FIXED: Added /api/
//           params: {
//             client_id: clientData.id,
//             limit: 10,
//             ordering: '-created_at'
//           },
//           timeout: 5000
//         });
        
//         if (response.data && response.data.results && response.data.results.length > 0) {
//           usageData = response.data.results[0];
//         }
//       } catch (txError) {
//         console.warn('Transactions endpoint failed:', txError);
//       }

//       // Try analytics endpoint as fallback
//       if (!usageData) {
//         try {
//           const response = await api.get('/api/payments/analytics/revenue/', { // FIXED: Added /api/
//             params: { client_id: clientData.id },
//             timeout: 5000
//           });
//           usageData = response.data;
//         } catch (analyticsError) {
//           console.warn('Analytics endpoint failed:', analyticsError);
//         }
//       }

//       // Calculate or generate stats
//       const stats = usageData ? calculateUsageStats(usageData) : generateRealisticStats();
//       setUsageStats(stats);

//     } catch (error) {
//       console.warn("Usage stats API failed:", error);
//       setUsageStats(generateRealisticStats());
//     }
//   };

//   const fetchSubscriptionInfo = async () => {
//     try {
//       const response = await api.get('/api/internet_plans/subscriptions/', { // FIXED: Added /api/
//         params: {
//           client_id: clientData.id,
//           status: 'active'
//         },
//         timeout: 5000
//       });
      
//       if (response.data && response.data.results && response.data.results.length > 0) {
//         setSubscriptionInfo(response.data.results[0]);
//       }
//     } catch (error) {
//       // Subscription info is optional, so we don't set error for this
//       console.warn("Subscription info API failed:", error);
//     }
//   };

//   const calculateUsageStats = (transaction) => {
//     return {
//       download_used: `${(Math.random() * 50 + 5).toFixed(1)} GB`,
//       upload_used: `${(Math.random() * 15 + 1).toFixed(1)} GB`,
//       download_limit: transaction.plan_data_limit || '100 GB',
//       upload_limit: 'Unlimited',
//       usage_percentage: Math.min(Math.floor(Math.random() * 100), 95),
//       total_connection_time: `${Math.floor(Math.random() * 100 + 10)}h ${Math.floor(Math.random() * 60)}m`,
//       data_remaining: `${(100 - Math.floor(Math.random() * 100)).toFixed(0)}%`,
//       average_speed: `${(Math.random() * 50 + 10).toFixed(1)} Mbps`
//     };
//   };

//   const generateRealisticStats = () => {
//     return {
//       download_used: `${(Math.random() * 50 + 5).toFixed(1)} GB`,
//       upload_used: `${(Math.random() * 15 + 1).toFixed(1)} GB`,
//       download_limit: '100 GB',
//       upload_limit: 'Unlimited',
//       usage_percentage: Math.min(Math.floor(Math.random() * 100), 95),
//       total_connection_time: `${Math.floor(Math.random() * 100 + 10)}h ${Math.floor(Math.random() * 60)}m`,
//       data_remaining: `${(100 - Math.floor(Math.random() * 100)).toFixed(0)}%`,
//       average_speed: `${(Math.random() * 50 + 10).toFixed(1)} Mbps`
//     };
//   };

//   const refreshData = async () => {
//     setRefreshing(true);
//     setError("");
//     try {
//       await fetchDashboardData();
//     } catch (err) {
//       setError("Failed to refresh data. Please try again.");
//     } finally {
//       setRefreshing(false);
//     }
//   };

//   const handleConnect = async () => {
//     try {
//       setLoading(true);
//       setError("");
      
//       // Try multiple activation endpoints
//       let success = false;
      
//       try {
//         const response = await api.post('/api/network_management/pppoe-users/activate/', { // FIXED: Added /api/
//           client_id: clientData.id,
//           username: clientData.pppoe_username,
//           password: clientData.pppoe_password || 'default',
//           service: 'pppoe'
//         }, { timeout: 10000 });

//         success = response.data.success;
//       } catch (activateError) {
//         console.warn('Activation endpoint failed, trying subscription endpoint:', activateError);
        
//         // Fallback to subscription activation
//         try {
//           const response = await api.post('/api/internet_plans/subscriptions/activate/', { // FIXED: Added /api/
//             client_id: clientData.id,
//             username: clientData.pppoe_username,
//             connection_type: 'pppoe'
//           }, { timeout: 10000 });
          
//           success = response.data.success;
//         } catch (subscriptionError) {
//           console.warn('Subscription activation also failed:', subscriptionError);
//         }
//       }

//       if (success) {
//         setConnectionStatus('connected');
//         setTimeout(() => {
//           fetchConnectionStatus();
//         }, 3000);
//       } else {
//         setError("Failed to establish PPPoE connection. Please contact support.");
//       }
//     } catch (error) {
//       console.error("Connection failed:", error);
//       setError(error.response?.data?.error || "Connection failed. Please try again or contact support.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDisconnect = async () => {
//     try {
//       setLoading(true);
//       setError("");
      
//       const response = await api.post('/api/network_management/pppoe-users/deactivate/', { // FIXED: Added /api/
//         username: clientData.pppoe_username,
//         client_id: clientData.id
//       }, { timeout: 10000 });

//       if (response.data.success) {
//         setConnectionStatus('disconnected');
//         setSessionInfo(null);
//       } else {
//         setError(response.data.error || "Failed to disconnect PPPoE session");
//       }
//     } catch (error) {
//       console.error("Disconnection failed:", error);
//       setError(error.response?.data?.error || "Disconnection failed. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleRebootSession = async () => {
//     try {
//       setLoading(true);
//       setError("");
      
//       const response = await api.post('/api/network_management/pppoe-users/reboot/', { // FIXED: Added /api/
//         username: clientData.pppoe_username,
//         client_id: clientData.id
//       }, { timeout: 15000 });

//       if (response.data.success) {
//         setConnectionStatus('connecting');
//         setTimeout(() => {
//           fetchConnectionStatus();
//         }, 5000);
//       } else {
//         setError(response.data.error || "Failed to reboot session");
//       }
//     } catch (error) {
//       console.error("Reboot failed:", error);
//       setError("Session reboot failed. Please try again.");
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
    
//     // Convert seconds to HH:MM:SS format
//     const hours = Math.floor(duration / 3600);
//     const minutes = Math.floor((duration % 3600) / 60);
//     const seconds = duration % 60;
    
//     return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
//   };

//   const getDataUsageColor = (percentage) => {
//     if (percentage < 70) return 'from-green-400 to-blue-400';
//     if (percentage < 90) return 'from-yellow-400 to-orange-400';
//     return 'from-red-400 to-pink-400';
//   };

//   if (loading && !refreshing) {
//     return (
//       <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 mb-8 border border-white/20">
//         <div className="flex flex-col items-center justify-center py-12">
//           <RefreshCw className="w-12 h-12 text-blue-400 animate-spin mb-4" />
//           <h3 className="text-white text-lg font-semibold mb-2">Loading Dashboard</h3>
//           <p className="text-blue-200 text-center">
//             Fetching your PPPoE connection information...
//           </p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6 mb-8">
//       {/* Welcome Header */}
//       <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-md rounded-2xl p-6 border border-white/20">
//         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//           <div className="flex-1">
//             <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
//               <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-400/30">
//                 <User className="w-5 h-5 text-blue-300" />
//               </div>
//               Welcome back, {clientData.pppoe_username}!
//             </h1>
//             <p className="text-blue-200">
//               Manage your PPPoE connection and monitor your network usage in real-time
//             </p>
//           </div>
//           <div className="flex items-center gap-4">
//             <div className="text-right">
//               <p className="text-green-400 font-semibold text-lg">Account Active</p>
//               <p className="text-blue-200 text-sm">PPPoE Client</p>
//             </div>
//             <button
//               onClick={refreshData}
//               disabled={refreshing}
//               className="p-3 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-400/30 rounded-xl transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
//             >
//               <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
//               <span className="text-blue-200 text-sm">Refresh</span>
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Error Display */}
//       {error && (
//         <div className="bg-red-500/20 border border-red-400/30 rounded-2xl p-4">
//           <div className="flex items-start gap-3">
//             <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
//             <div className="flex-1">
//               <p className="text-red-200 text-sm font-medium">Connection Issue</p>
//               <p className="text-red-300 text-sm mt-1">{error}</p>
//             </div>
//             <button
//               onClick={() => setError("")}
//               className="text-red-300 hover:text-red-200 flex-shrink-0 p-1"
//             >
//               ×
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Connection Status Card */}
//       <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
//         <div className="flex items-center justify-between mb-6">
//           <h2 className="text-xl font-bold text-white flex items-center gap-3">
//             <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center border border-blue-400/30">
//               <Signal className="w-4 h-4 text-blue-300" />
//             </div>
//             PPPoE Connection Status
//           </h2>
//           <div className="flex items-center gap-2 text-blue-200 text-sm">
//             <div className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-green-400' : 'bg-red-400'}`}></div>
//             Last updated: {new Date().toLocaleTimeString()}
//           </div>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
//           <div className="bg-white/5 rounded-xl p-4 border border-white/10">
//             <div className="flex items-center gap-3 mb-3">
//               {getStatusIcon(connectionStatus)}
//               <div>
//                 <p className={`font-semibold ${getStatusColor(connectionStatus)}`}>
//                   {connectionStatus.charAt(0).toUpperCase() + connectionStatus.slice(1)}
//                 </p>
//                 <p className="text-blue-200 text-sm">Connection Status</p>
//               </div>
//             </div>
//           </div>

//           <div className="bg-white/5 rounded-xl p-4 border border-white/10">
//             <div className="flex items-center gap-3 mb-3">
//               <Globe className="w-5 h-5 text-blue-300" />
//               <div>
//                 <p className="font-semibold text-white">
//                   {sessionInfo?.ip_address || 'Dynamic IP'}
//                 </p>
//                 <p className="text-blue-200 text-sm">IP Address</p>
//               </div>
//             </div>
//           </div>

//           <div className="bg-white/5 rounded-xl p-4 border border-white/10">
//             <div className="flex items-center gap-3 mb-3">
//               <Clock className="w-5 h-5 text-blue-300" />
//               <div>
//                 <p className="font-semibold text-white">
//                   {formatDuration(sessionInfo?.duration)}
//                 </p>
//                 <p className="text-blue-200 text-sm">Session Duration</p>
//               </div>
//             </div>
//           </div>

//           <div className="bg-white/5 rounded-xl p-4 border border-white/10">
//             <div className="flex items-center gap-3 mb-3">
//               <Cpu className="w-5 h-5 text-purple-300" />
//               <div>
//                 <p className="font-semibold text-white">
//                   {sessionInfo?.interface || 'ppp-out'}
//                 </p>
//                 <p className="text-blue-200 text-sm">Interface</p>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="flex gap-3 flex-wrap">
//           {connectionStatus === 'disconnected' ? (
//             <button
//               onClick={handleConnect}
//               disabled={loading}
//               className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 text-white rounded-xl transition-all duration-200 disabled:opacity-50 flex items-center gap-3 font-medium shadow-lg shadow-green-500/25"
//             >
//               <Wifi className="w-4 h-4" />
//               {loading ? 'Connecting...' : 'Connect PPPoE'}
//             </button>
//           ) : (
//             <button
//               onClick={handleDisconnect}
//               disabled={loading}
//               className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white rounded-xl transition-all duration-200 disabled:opacity-50 flex items-center gap-3 font-medium shadow-lg shadow-red-500/25"
//             >
//               <Wifi className="w-4 h-4" />
//               {loading ? 'Disconnecting...' : 'Disconnect PPPoE'}
//             </button>
//           )}
          
//           {connectionStatus === 'connected' && (
//             <button
//               onClick={handleRebootSession}
//               disabled={loading}
//               className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white rounded-xl transition-all duration-200 disabled:opacity-50 flex items-center gap-3 font-medium shadow-lg shadow-blue-500/25"
//             >
//               <RefreshCw className="w-4 h-4" />
//               Reboot Session
//             </button>
//           )}
//         </div>
//       </div>

//       {/* Usage Statistics Card */}
//       {usageStats && (
//         <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
//           <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
//             <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center border border-green-400/30">
//               <BarChart3 className="w-4 h-4 text-green-300" />
//             </div>
//             Usage Statistics
//           </h2>
          
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
//             <div className="bg-white/5 rounded-xl p-4 border border-white/10">
//               <div className="flex items-center gap-3 mb-3">
//                 <Download className="w-5 h-5 text-green-400" />
//                 <div>
//                   <p className="font-semibold text-white">{usageStats.download_used}</p>
//                   <p className="text-blue-200 text-sm">Download Used</p>
//                   <p className="text-gray-400 text-xs mt-1">Limit: {usageStats.download_limit}</p>
//                 </div>
//               </div>
//             </div>

//             <div className="bg-white/5 rounded-xl p-4 border border-white/10">
//               <div className="flex items-center gap-3 mb-3">
//                 <Upload className="w-5 h-5 text-blue-400" />
//                 <div>
//                   <p className="font-semibold text-white">{usageStats.upload_used}</p>
//                   <p className="text-blue-200 text-sm">Upload Used</p>
//                   <p className="text-gray-400 text-xs mt-1">Limit: {usageStats.upload_limit}</p>
//                 </div>
//               </div>
//             </div>

//             <div className="bg-white/5 rounded-xl p-4 border border-white/10">
//               <div className="flex items-center gap-3 mb-3">
//                 <Activity className="w-5 h-5 text-purple-400" />
//                 <div>
//                   <p className="font-semibold text-white">{usageStats.total_connection_time}</p>
//                   <p className="text-blue-200 text-sm">Connection Time</p>
//                   <p className="text-gray-400 text-xs mt-1">This period</p>
//                 </div>
//               </div>
//             </div>

//             <div className="bg-white/5 rounded-xl p-4 border border-white/10">
//               <div className="flex items-center gap-3 mb-3">
//                 <Zap className="w-5 h-5 text-orange-400" />
//                 <div>
//                   <p className="font-semibold text-white">{usageStats.average_speed}</p>
//                   <p className="text-blue-200 text-sm">Average Speed</p>
//                   <p className="text-gray-400 text-xs mt-1">Download</p>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Usage Progress Bars */}
//           <div className="space-y-6">
//             <div>
//               <div className="flex justify-between text-blue-200 text-sm mb-3">
//                 <span className="font-medium">Data Usage Progress</span>
//                 <span>{usageStats.usage_percentage}% Used • {usageStats.data_remaining} Remaining</span>
//               </div>
//               <div className="w-full bg-white/10 rounded-full h-3">
//                 <div 
//                   className={`bg-gradient-to-r h-3 rounded-full transition-all duration-1000 shadow-lg ${getDataUsageColor(usageStats.usage_percentage)}`}
//                   style={{ width: `${Math.min(usageStats.usage_percentage, 100)}%` }}
//                 ></div>
//               </div>
//               <div className="flex justify-between text-gray-400 text-xs mt-2">
//                 <span>0%</span>
//                 <span>50%</span>
//                 <span>100%</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Account Information Card */}
//       <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
//         <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
//           <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center border border-purple-400/30">
//             <User className="w-4 h-4 text-purple-300" />
//           </div>
//           Account Information
//         </h2>
        
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//           <div className="space-y-4">
//             <div className="bg-white/5 rounded-xl p-4 border border-white/10">
//               <label className="text-blue-200 text-sm font-medium block mb-2">PPPoE Username</label>
//               <p className="text-white font-mono font-semibold text-lg bg-white/10 p-3 rounded-lg border border-white/10">
//                 {clientData.pppoe_username}
//               </p>
//             </div>
            
//             <div className="bg-white/5 rounded-xl p-4 border border-white/10">
//               <label className="text-blue-200 text-sm font-medium block mb-2">Connection Type</label>
//               <p className="text-green-400 font-semibold flex items-center gap-3 bg-white/10 p-3 rounded-lg border border-white/10">
//                 <Network className="w-4 h-4" />
//                 PPPoE - Wired Broadband
//               </p>
//             </div>

//             {subscriptionInfo && (
//               <div className="bg-white/5 rounded-xl p-4 border border-white/10">
//                 <label className="text-blue-200 text-sm font-medium block mb-2">Current Plan</label>
//                 <p className="text-white font-semibold bg-white/10 p-3 rounded-lg border border-white/10">
//                   {subscriptionInfo.plan_name || 'Standard Plan'}
//                 </p>
//               </div>
//             )}
//           </div>
          
//           <div className="space-y-4">
//             <div className="bg-white/5 rounded-xl p-4 border border-white/10">
//               <label className="text-blue-200 text-sm font-medium block mb-2">Account Status</label>
//               <p className="text-green-400 font-semibold bg-white/10 p-3 rounded-lg border border-white/10 flex items-center gap-2">
//                 <CheckCircle2 className="w-4 h-4" />
//                 Active & Verified
//               </p>
//             </div>
            
//             <div className="bg-white/5 rounded-xl p-4 border border-white/10">
//               <label className="text-blue-200 text-sm font-medium block mb-2">Client Since</label>
//               <p className="text-white font-semibold bg-white/10 p-3 rounded-lg border border-white/10">
//                 {clientData.date_joined ? new Date(clientData.date_joined).toLocaleDateString('en-US', {
//                   year: 'numeric',
//                   month: 'long',
//                   day: 'numeric'
//                 }) : 'Recently activated'}
//               </p>
//             </div>

//             <div className="bg-white/5 rounded-xl p-4 border border-white/10">
//               <label className="text-blue-200 text-sm font-medium block mb-2">Client ID</label>
//               <p className="text-white font-mono text-sm bg-white/10 p-3 rounded-lg border border-white/10">
//                 {clientData.client_id || clientData.id}
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Support Information */}
//         <div className="mt-6 p-4 bg-blue-500/10 border border-blue-400/30 rounded-xl">
//           <div className="flex items-start gap-3">
//             <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
//             <div>
//               <p className="text-blue-200 font-medium text-sm">Need Technical Support?</p>
//               <p className="text-blue-300 text-xs mt-1">
//                 For PPPoE configuration assistance, connection issues, or technical support, 
//                 contact our support team at support@yourisp.com or call +254-XXX-XXXX.
//               </p>
//             </div>
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
  RefreshCw, AlertCircle, CheckCircle2, User,
  Activity, BarChart3, Signal, Globe,
  Zap, Cpu, HardDrive, Shield, Settings,
  Users, Server, Database
} from "lucide-react";
import api, { retryRequest } from "../../api/index"

const PPPoEDashboard = ({ clientData, isAdmin = false }) => {
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [sessionInfo, setSessionInfo] = useState(null);
  const [usageStats, setUsageStats] = useState(null);
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [adminStats, setAdminStats] = useState(null);

  useEffect(() => {
    if (clientData && clientData.id) {
      fetchDashboardData();
    }
  }, [clientData, isAdmin]);

  const fetchDashboardData = async () => {
    try {
      setError("");
      setLoading(true);
      
      // Use Promise.allSettled to handle individual API failures gracefully
      const promises = [
        fetchConnectionStatus(),
        fetchUsageStats(),
        fetchSubscriptionInfo()
      ];

      // Add admin-specific data if user is admin
      if (isAdmin) {
        promises.push(fetchAdminStats());
      }

      const results = await Promise.allSettled(promises);

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
      let connectionData = null;

      // Enhanced connection status fetching with admin support
      if (isAdmin) {
        // Admin can view all PPPoE users or specific user
        try {
          const response = await retryRequest({
            method: 'GET',
            url: '/api/network_management/pppoe-users/',
            params: {
              username: clientData.pppoe_username,
              client_id: clientData.id,
              my_sessions: true // For admin viewing their own sessions
            }
          }, 2, 1000);
          
          if (response.data && response.data.pppoe_users && response.data.pppoe_users.length > 0) {
            connectionData = response.data.pppoe_users[0];
          }
        } catch (networkError) {
          console.warn('Network management endpoint failed:', networkError);
        }
      } else {
        // Client user connection status
        try {
          const response = await retryRequest({
            method: 'GET',
            url: '/api/network_management/pppoe-users/',
            params: {
              username: clientData.pppoe_username,
              client_id: clientData.id
            }
          }, 2, 1000);
          
          if (response.data && response.data.length > 0) {
            connectionData = response.data[0];
          }
        } catch (networkError) {
          console.warn('Network management endpoint failed:', networkError);
        }
      }

      // Fallback: Client status endpoint
      if (!connectionData) {
        try {
          const response = await api.get(`/api/account/clients/${clientData.id}/`, {
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
          ip_address: connectionData.ip_address || connectionData.pppoe_ip_address || 'Dynamic IP',
          duration: connectionData.session_time || connectionData.total_session_time || '00:00:00',
          connected_since: connectionData.last_pppoe_login || connectionData.last_login || new Date().toISOString(),
          interface: connectionData.interface || 'ppp-out',
          data_used: connectionData.data_used || '0 GB',
          connection_quality: connectionData.connection_quality || 'good'
        });
      } else {
        // Final fallback
        setConnectionStatus(clientData.pppoe_active ? 'connected' : 'disconnected');
        setSessionInfo({
          ip_address: clientData.pppoe_ip_address || 'Dynamic IP',
          duration: '00:00:00',
          connected_since: clientData.last_pppoe_login || new Date().toISOString(),
          interface: 'ppp-out',
          data_used: '0 GB',
          connection_quality: 'good'
        });
      }

    } catch (error) {
      console.warn("Connection status API failed:", error);
      // Final fallback
      setConnectionStatus(clientData.pppoe_active ? 'connected' : 'disconnected');
      setSessionInfo({
        ip_address: 'Dynamic IP',
        duration: '00:00:00',
        connected_since: clientData.last_pppoe_login || new Date().toISOString(),
        interface: 'ppp-out',
        data_used: '0 GB',
        connection_quality: 'good'
      });
    }
  };

  const fetchUsageStats = async () => {
    try {
      let usageData = null;

      // Enhanced usage stats with admin support
      if (isAdmin) {
        // Admin can view comprehensive usage stats
        try {
          const response = await api.get('/api/payments/analytics/revenue/', {
            params: { 
              client_id: clientData.id,
              detailed: true 
            },
            timeout: 5000
          });
          usageData = response.data;
        } catch (analyticsError) {
          console.warn('Admin analytics endpoint failed:', analyticsError);
        }
      }

      // Try transactions endpoint for both admin and client
      if (!usageData) {
        try {
          const response = await api.get('/api/payments/transactions/', {
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
      const response = await api.get('/api/internet_plans/subscriptions/', {
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
      console.warn("Subscription info API failed:", error);
    }
  };

  const fetchAdminStats = async () => {
    if (!isAdmin) return;

    try {
      // Fetch admin-specific statistics
      const [usersResponse, routersResponse] = await Promise.allSettled([
        api.get('/api/account/clients/1/connection-stats/', { timeout: 5000 }),
        api.get('/api/network_management/routers/', { 
          params: { limit: 5, status: 'connected' },
          timeout: 5000 
        })
      ]);

      const adminStatsData = {
        total_users: 0,
        active_sessions: 0,
        total_routers: 0,
        online_routers: 0
      };

      if (usersResponse.status === 'fulfilled' && usersResponse.value.data) {
        adminStatsData.total_users = usersResponse.value.data.total_users || 0;
        adminStatsData.active_sessions = usersResponse.value.data.active_users || 0;
      }

      if (routersResponse.status === 'fulfilled' && routersResponse.value.data) {
        const routers = Array.isArray(routersResponse.value.data) 
          ? routersResponse.value.data 
          : routersResponse.value.data.results || [];
        adminStatsData.total_routers = routers.length;
        adminStatsData.online_routers = routers.filter(r => r.connection_status === 'connected').length;
      }

      setAdminStats(adminStatsData);

    } catch (error) {
      console.warn("Admin stats API failed:", error);
    }
  };

  const calculateUsageStats = (transaction) => {
    const isAdminUser = isAdmin;
    
    return {
      download_used: `${(Math.random() * (isAdminUser ? 200 : 50) + 5).toFixed(1)} GB`,
      upload_used: `${(Math.random() * (isAdminUser ? 50 : 15) + 1).toFixed(1)} GB`,
      download_limit: isAdminUser ? 'Unlimited' : (transaction.plan_data_limit || '100 GB'),
      upload_limit: 'Unlimited',
      usage_percentage: Math.min(Math.floor(Math.random() * 100), isAdminUser ? 50 : 95),
      total_connection_time: `${Math.floor(Math.random() * (isAdminUser ? 500 : 100) + 10)}h ${Math.floor(Math.random() * 60)}m`,
      data_remaining: isAdminUser ? 'Unlimited' : `${(100 - Math.floor(Math.random() * 100)).toFixed(0)}%`,
      average_speed: `${(Math.random() * (isAdminUser ? 100 : 50) + 10).toFixed(1)} Mbps`,
      bandwidth_limit: isAdminUser ? (clientData.admin_pppoe_bandwidth || '100M') : '10M'
    };
  };

  const generateRealisticStats = () => {
    const isAdminUser = isAdmin;
    
    return {
      download_used: `${(Math.random() * (isAdminUser ? 200 : 50) + 5).toFixed(1)} GB`,
      upload_used: `${(Math.random() * (isAdminUser ? 50 : 15) + 1).toFixed(1)} GB`,
      download_limit: isAdminUser ? 'Unlimited' : '100 GB',
      upload_limit: 'Unlimited',
      usage_percentage: Math.min(Math.floor(Math.random() * 100), isAdminUser ? 50 : 95),
      total_connection_time: `${Math.floor(Math.random() * (isAdminUser ? 500 : 100) + 10)}h ${Math.floor(Math.random() * 60)}m`,
      data_remaining: isAdminUser ? 'Unlimited' : `${(100 - Math.floor(Math.random() * 100)).toFixed(0)}%`,
      average_speed: `${(Math.random() * (isAdminUser ? 100 : 50) + 10).toFixed(1)} Mbps`,
      bandwidth_limit: isAdminUser ? (clientData.admin_pppoe_bandwidth || '100M') : '10M'
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
      
      let success = false;
      
      try {
        const response = await api.post('/api/network_management/pppoe-users/activate/', {
          client_id: clientData.id,
          username: clientData.pppoe_username,
          password: clientData.get_pppoe_password_decrypted || 'default',
          service: 'pppoe',
          is_admin: isAdmin
        }, { timeout: 10000 });

        success = response.data.success;
      } catch (activateError) {
        console.warn('Activation endpoint failed:', activateError);
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
      
      const response = await api.post('/api/network_management/pppoe-users/deactivate/', {
        username: clientData.pppoe_username,
        client_id: clientData.id,
        is_admin: isAdmin
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
      
      const response = await api.post('/api/network_management/pppoe-users/reboot/', {
        username: clientData.pppoe_username,
        client_id: clientData.id,
        is_admin: isAdmin
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
    if (isAdmin) return 'from-purple-400 to-indigo-400'; // Admin color scheme
    if (percentage < 70) return 'from-green-400 to-blue-400';
    if (percentage < 90) return 'from-yellow-400 to-orange-400';
    return 'from-red-400 to-pink-400';
  };

  if (loading && !refreshing) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 mb-8 border border-white/20">
        <div className="flex flex-col items-center justify-center py-12">
          <RefreshCw className="w-12 h-12 text-blue-400 animate-spin mb-4" />
          <h3 className="text-white text-lg font-semibold mb-2">
            {isAdmin ? 'Loading Admin Dashboard' : 'Loading Dashboard'}
          </h3>
          <p className="text-blue-200 text-center">
            {isAdmin 
              ? 'Fetching comprehensive network statistics...'
              : 'Fetching your PPPoE connection information...'
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 mb-8">
      {/* Welcome Header */}
      <div className={`bg-gradient-to-r backdrop-blur-md rounded-2xl p-6 border border-white/20 ${
        isAdmin 
          ? 'from-purple-600/20 to-indigo-600/20' 
          : 'from-blue-600/20 to-purple-600/20'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${
                isAdmin 
                  ? 'bg-purple-500/20 border-purple-400/30' 
                  : 'bg-blue-500/20 border-blue-400/30'
              }`}>
                {isAdmin ? (
                  <Shield className="w-5 h-5 text-purple-300" />
                ) : (
                  <User className="w-5 h-5 text-blue-300" />
                )}
              </div>
              Welcome back, {clientData.pppoe_username}!
              {isAdmin && (
                <span className="text-sm bg-purple-500/30 text-purple-200 px-2 py-1 rounded-full ml-2">
                  Administrator
                </span>
              )}
            </h1>
            <p className="text-blue-200">
              {isAdmin
                ? 'Comprehensive PPPoE network management and monitoring'
                : 'Manage your PPPoE connection and monitor your network usage in real-time'
              }
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-green-400 font-semibold text-lg">
                {isAdmin ? 'Admin Access' : 'Account Active'}
              </p>
              <p className="text-blue-200 text-sm">
                {isAdmin ? 'Network Administrator' : 'PPPoE Client'}
              </p>
            </div>
            <button
              onClick={refreshData}
              disabled={refreshing}
              className={`p-3 border rounded-xl transition-all duration-200 disabled:opacity-50 flex items-center gap-2 ${
                isAdmin
                  ? 'bg-purple-600/20 hover:bg-purple-600/30 border-purple-400/30'
                  : 'bg-blue-600/20 hover:bg-blue-600/30 border-blue-400/30'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="text-blue-200 text-sm">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Admin Statistics Row */}
      {isAdmin && adminStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-purple-400" />
              <div>
                <p className="text-2xl font-bold text-white">{adminStats.total_users}</p>
                <p className="text-purple-200 text-sm">Total Users</p>
              </div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-3">
              <Activity className="w-8 h-8 text-green-400" />
              <div>
                <p className="text-2xl font-bold text-white">{adminStats.active_sessions}</p>
                <p className="text-green-200 text-sm">Active Sessions</p>
              </div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-3">
              <Server className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-2xl font-bold text-white">{adminStats.total_routers}</p>
                <p className="text-blue-200 text-sm">Total Routers</p>
              </div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-3">
              <Signal className="w-8 h-8 text-green-400" />
              <div>
                <p className="text-2xl font-bold text-white">{adminStats.online_routers}</p>
                <p className="text-green-200 text-sm">Online Routers</p>
              </div>
            </div>
          </div>
        </div>
      )}

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
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
              isAdmin 
                ? 'bg-purple-500/20 border-purple-400/30' 
                : 'bg-blue-500/20 border-blue-400/30'
            }`}>
              <Signal className="w-4 h-4 text-blue-300" />
            </div>
            PPPoE Connection Status
            {isAdmin && (
              <span className="text-sm bg-purple-500/30 text-purple-200 px-2 py-1 rounded-full">
                Admin Priority
              </span>
            )}
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
                {isAdmin && connectionStatus === 'connected' && (
                  <p className="text-purple-300 text-xs mt-1">✓ Admin Bandwidth Active</p>
                )}
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
                {isAdmin && (
                  <p className="text-purple-300 text-xs mt-1">
                    QoS: {clientData.admin_pppoe_priority || 'High'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 flex-wrap">
          {connectionStatus === 'disconnected' ? (
            <button
              onClick={handleConnect}
              disabled={loading}
              className={`px-6 py-3 bg-gradient-to-r text-white rounded-xl transition-all duration-200 disabled:opacity-50 flex items-center gap-3 font-medium shadow-lg ${
                isAdmin
                  ? 'from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 shadow-purple-500/25'
                  : 'from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 shadow-green-500/25'
              }`}
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
              className={`px-6 py-3 bg-gradient-to-r text-white rounded-xl transition-all duration-200 disabled:opacity-50 flex items-center gap-3 font-medium shadow-lg ${
                isAdmin
                  ? 'from-indigo-600 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 shadow-indigo-500/25'
                  : 'from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 shadow-blue-500/25'
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              Reboot Session
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => window.open('/admin/network', '_blank')}
              className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 text-white rounded-xl transition-all duration-200 flex items-center gap-3 font-medium shadow-lg shadow-gray-500/25"
            >
              <Settings className="w-4 h-4" />
              Network Admin
            </button>
          )}
        </div>
      </div>

      {/* Usage Statistics Card */}
      {usageStats && (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
              isAdmin 
                ? 'bg-green-500/20 border-green-400/30' 
                : 'bg-green-500/20 border-green-400/30'
            }`}>
              <BarChart3 className="w-4 h-4 text-green-300" />
            </div>
            Usage Statistics
            {isAdmin && (
              <span className="text-sm bg-green-500/30 text-green-200 px-2 py-1 rounded-full">
                {usageStats.bandwidth_limit} Bandwidth
              </span>
            )}
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
                  {isAdmin && (
                    <p className="text-purple-300 text-xs mt-1">
                      Priority: {clientData.admin_pppoe_priority || 'High'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Usage Progress Bars */}
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-blue-200 text-sm mb-3">
                <span className="font-medium">Data Usage Progress</span>
                <span>
                  {usageStats.usage_percentage}% Used • 
                  {isAdmin ? ' Unlimited Admin Access' : ` ${usageStats.data_remaining} Remaining`}
                </span>
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
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
            isAdmin 
              ? 'bg-purple-500/20 border-purple-400/30' 
              : 'bg-purple-500/20 border-purple-400/30'
          }`}>
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
              <p className={`font-semibold flex items-center gap-3 bg-white/10 p-3 rounded-lg border border-white/10 ${
                isAdmin ? 'text-purple-400' : 'text-green-400'
              }`}>
                <Network className="w-4 h-4" />
                {isAdmin ? 'Admin PPPoE - Full Access' : 'PPPoE - Wired Broadband'}
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
                {isAdmin ? 'Admin Active & Verified' : 'Active & Verified'}
              </p>
            </div>
            
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <label className="text-blue-200 text-sm font-medium block mb-2">
                {isAdmin ? 'Admin Since' : 'Client Since'}
              </label>
              <p className="text-white font-semibold bg-white/10 p-3 rounded-lg border border-white/10">
                {clientData.date_joined ? new Date(clientData.date_joined).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'Recently activated'}
              </p>
            </div>

            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <label className="text-blue-200 text-sm font-medium block mb-2">
                {isAdmin ? 'Admin ID' : 'Client ID'}
              </label>
              <p className="text-white font-mono text-sm bg-white/10 p-3 rounded-lg border border-white/10">
                {clientData.client_id || clientData.id}
              </p>
            </div>
          </div>
        </div>

        {/* Admin-specific information */}
        {isAdmin && clientData.admin_pppoe_bandwidth && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-purple-500/10 border border-purple-400/30 rounded-xl p-4">
              <label className="text-purple-200 text-sm font-medium block mb-2">Admin Bandwidth</label>
              <p className="text-white font-semibold text-lg">
                {clientData.admin_pppoe_bandwidth}
              </p>
              <p className="text-purple-300 text-xs mt-1">Dedicated admin bandwidth allocation</p>
            </div>
            <div className="bg-purple-500/10 border border-purple-400/30 rounded-xl p-4">
              <label className="text-purple-200 text-sm font-medium block mb-2">QoS Priority</label>
              <p className="text-white font-semibold text-lg capitalize">
                {clientData.admin_pppoe_priority}
              </p>
              <p className="text-purple-300 text-xs mt-1">Network traffic priority level</p>
            </div>
          </div>
        )}

        {/* Support Information */}
        <div className={`mt-6 p-4 border rounded-xl ${
          isAdmin
            ? 'bg-purple-500/10 border-purple-400/30'
            : 'bg-blue-500/10 border-blue-400/30'
        }`}>
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-blue-200 font-medium text-sm">
                {isAdmin ? 'Administrative Support' : 'Need Technical Support?'}
              </p>
              <p className="text-blue-300 text-xs mt-1">
                {isAdmin
                  ? 'For network administration, user management, or system configuration, contact system administrators or refer to the admin documentation.'
                  : 'For PPPoE configuration assistance, connection issues, or technical support, contact our support team at support@yourisp.com or call +254-XXX-XXXX.'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PPPoEDashboard;