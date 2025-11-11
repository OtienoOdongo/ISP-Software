// utils/clientDataFormatter.js
export const formatClientData = (client) => {
  // Handle connection info from backend
  const connectionInfo = client.connection_info || {};
  const sessionHistory = client.history?.sessionHistory || [];
  
  return {
    ...client,
    // Enhanced connection type handling
    connection_type: connectionInfo.connection_type || client.connection_type || 'none',
    connection_info: connectionInfo,
    
    // Device information with better fallbacks
    device: client.device || connectionInfo.mac_address || connectionInfo.username || 'Unknown',
    
    // Router information
    router: client.router || connectionInfo.router,
    
    // Enhanced active status
    active: connectionInfo.is_active !== undefined ? connectionInfo.is_active : client.active,
    
    // Session history data
    sessionHistory: sessionHistory,
    
    // Connection statistics
    totalSessions: client.history?.summary?.totalSessions || 0,
    activeSessions: client.history?.summary?.activeSessions || 0,
    totalDataUsedGB: client.history?.summary?.totalDataUsedGB || 0,
    frequentRouter: client.history?.summary?.frequentRouter,
    
    // Data usage with connection-specific data
    data_usage: client.data_usage || {
      used: connectionInfo.data_used || 0,
      total: 'unlimited',
      unit: 'GB'
    }
  };
};

export const formatDuration = (seconds) => {
  if (!seconds) return "0s";
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
};

export const formatBytesToGB = (bytes) => {
  return (bytes / (1024 ** 3)).toFixed(1);
};