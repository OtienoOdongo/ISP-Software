// // src/utils/networkUtils.js

// export const formatTimeSince = (date) => {
//   if (!date) return "N/A";
//   const timestamp = new Date(date);
//   const seconds = Math.floor((new Date() - timestamp) / 1000);
  
//   if (seconds < 60) return `${seconds}s ago`;
//   if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
//   if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
//   return `${Math.floor(seconds / 86400)}d ago`;
// };

// export const getHealthColor = (value, type = "usage") => {
//   if (!value && value !== 0) return "text-gray-500";
  
//   if (type === "usage") {
//     if (value >= 80) return "text-red-500";
//     if (value >= 60) return "text-yellow-500";
//     return "text-green-500";
//   } else if (type === "temperature") {
//     if (value >= 70) return "text-red-500";
//     if (value >= 50) return "text-yellow-500";
//     return "text-green-500";
//   } else if (type === "response") {
//     if (value > 5) return "text-red-500";
//     if (value > 2) return "text-yellow-500";
//     return "text-green-500";
//   }
//   return "text-blue-500";
// };

// // Health icon names only (no JSX)
// export const getHealthIconName = (value, type = "usage") => {
//   if (!value && value !== 0) return "XCircle";
  
//   if (type === "usage") {
//     if (value >= 80) return "XCircle";
//     if (value >= 60) return "AlertTriangle";
//     return "CheckCircle";
//   } else if (type === "status") {
//     if (value === "online") return "CheckCircle";
//     if (value === "offline") return "XCircle";
//     return "AlertTriangle";
//   }
//   return "CheckCircle";
// };

// // Return icon configuration object (no JSX)
// export const getHealthIconConfig = (value, type = "usage") => {
//   const iconName = getHealthIconName(value, type);
//   const colorClass = getHealthColor(value, type);
  
//   return {
//     name: iconName,
//     colorClass: colorClass,
//     className: `w-4 h-4 ${colorClass}`
//   };
// };

// export const formatBytes = (bytes) => {
//   if (!bytes) return "0 B";
//   const k = 1024;
//   const sizes = ["B", "KB", "MB", "GB", "TB"];
//   const i = Math.floor(Math.log(bytes) / Math.log(k));
//   return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
// };

// export const formatSpeed = (speed) => {
//   if (!speed) return "0 Mbps";
//   return `${(speed).toFixed(2)} Mbps`;
// };

// export const formatUptime = (uptime) => {
//   if (!uptime || uptime === "N/A") return "N/A";
  
//   // Parse MikroTik uptime format (e.g., "5d3h2m15s")
//   const days = uptime.match(/(\d+)d/);
//   const hours = uptime.match(/(\d+)h/);
//   const minutes = uptime.match(/(\d+)m/);
//   const seconds = uptime.match(/(\d+)s/);
  
//   const d = days ? parseInt(days[1]) : 0;
//   const h = hours ? parseInt(hours[1]) : 0;
//   const m = minutes ? parseInt(minutes[1]) : 0;
//   const s = seconds ? parseInt(seconds[1]) : 0;
  
//   if (d > 0) return `${d}d ${h}h ${m}m`;
//   if (h > 0) return `${h}h ${m}m`;
//   if (m > 0) return `${m}m ${s}s`;
//   return `${s}s`;
// };

// export const calculateSystemHealth = (routers) => {
//   const connectedRouters = routers.filter(r => r.status === 'connected').length;
//   const onlineRouters = routers.filter(r => r.status === 'connected');
  
//   if (connectedRouters === 0) return 100;
  
//   const overloadedRouters = onlineRouters.filter(r => (r.stats?.cpu || 0) > 80).length;
//   return Math.max(0, 100 - (overloadedRouters / connectedRouters * 100));
// };

// export const calculatePerformanceMetrics = (routers) => {
//   const connectedRouters = routers.filter(r => r.status === 'connected');
//   const activeSessions = routers.reduce((total, router) => {
//     return total + (router.connected_clients_count || 0);
//   }, 0);
  
//   const avgCpu = connectedRouters.length > 0 
//     ? connectedRouters.reduce((sum, router) => sum + (router.stats?.cpu || 0), 0) / connectedRouters.length 
//     : 0;
  
//   const avgMemory = connectedRouters.length > 0 
//     ? connectedRouters.reduce((sum, router) => sum + (router.stats?.memory || 0), 0) / connectedRouters.length 
//     : 0;

//   const totalThroughput = connectedRouters.reduce((sum, router) => 
//     sum + (router.stats?.throughput || 0), 0
//   );

//   const systemHealth = calculateSystemHealth(routers);

//   return {
//     connectedRouters: connectedRouters.length,
//     activeSessions,
//     systemHealth: Math.round(systemHealth),
//     performanceMetrics: {
//       avgCpu: Math.round(avgCpu),
//       avgMemory: Math.round(avgMemory),
//       totalThroughput: Math.round(totalThroughput * 100) / 100,
//       activeConnections: activeSessions
//     }
//   };
// };







// src/utils/networkUtils.js

export const formatTimeSince = (date) => {
  if (!date) return "N/A";
  
  try {
    const timestamp = new Date(date);
    if (isNaN(timestamp.getTime())) return "N/A";
    
    const seconds = Math.floor((new Date() - timestamp) / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  } catch (error) {
    return "N/A";
  }
};

export const getHealthColor = (value, type = "usage") => {
  if (!value && value !== 0) return "text-gray-500";
  
  if (type === "usage") {
    if (value >= 90) return "text-red-500";
    if (value >= 80) return "text-orange-500";
    if (value >= 70) return "text-yellow-500";
    return "text-green-500";
  } else if (type === "temperature") {
    if (value >= 70) return "text-red-500";
    if (value >= 60) return "text-orange-500";
    if (value >= 50) return "text-yellow-500";
    return "text-green-500";
  } else if (type === "response") {
    if (value > 5) return "text-red-500";
    if (value > 3) return "text-orange-500";
    if (value > 1) return "text-yellow-500";
    return "text-green-500";
  } else if (type === "memory") {
    if (value >= 90) return "text-red-500";
    if (value >= 80) return "text-orange-500";
    if (value >= 70) return "text-yellow-500";
    return "text-green-500";
  } else if (type === "sessions") {
    if (value >= 100) return "text-red-500";
    if (value >= 50) return "text-orange-500";
    if (value >= 25) return "text-yellow-500";
    return "text-green-500";
  }
  return "text-blue-500";
};

export const getHealthBackgroundColor = (value, type = "usage") => {
  if (!value && value !== 0) return "bg-gray-100 dark:bg-gray-800";
  
  if (type === "usage") {
    if (value >= 90) return "bg-red-100 dark:bg-red-900/20";
    if (value >= 80) return "bg-orange-100 dark:bg-orange-900/20";
    if (value >= 70) return "bg-yellow-100 dark:bg-yellow-900/20";
    return "bg-green-100 dark:bg-green-900/20";
  } else if (type === "status") {
    if (value === "connected") return "bg-green-100 dark:bg-green-900/20";
    if (value === "disconnected") return "bg-red-100 dark:bg-red-900/20";
    return "bg-yellow-100 dark:bg-yellow-900/20";
  }
  return "bg-blue-100 dark:bg-blue-900/20";
};

// Health icon names only (no JSX)
export const getHealthIconName = (value, type = "usage") => {
  if (!value && value !== 0) return "XCircle";
  
  if (type === "usage") {
    if (value >= 90) return "XCircle";
    if (value >= 80) return "AlertTriangle";
    if (value >= 70) return "AlertTriangle";
    return "CheckCircle";
  } else if (type === "status") {
    if (value === "connected") return "CheckCircle";
    if (value === "disconnected") return "XCircle";
    return "AlertTriangle";
  } else if (type === "configuration") {
    if (value === "configured") return "CheckCircle";
    if (value === "partially_configured") return "AlertTriangle";
    if (value === "configuration_failed") return "XCircle";
    return "XCircle";
  }
  return "CheckCircle";
};

// Return icon configuration object (no JSX)
export const getHealthIconConfig = (value, type = "usage") => {
  const iconName = getHealthIconName(value, type);
  const colorClass = getHealthColor(value, type);
  
  return {
    name: iconName,
    colorClass: colorClass,
    className: `w-4 h-4 ${colorClass}`
  };
};

// Service icon configuration
export const getServiceIconConfig = (serviceType) => {
  const serviceIcons = {
    hotspot: { name: 'Wifi', className: 'text-blue-500' },
    pppoe: { name: 'Shield', className: 'text-green-500' },
    vpn: { name: 'Shield', className: 'text-purple-500' },
    openvpn: { name: 'Shield', className: 'text-purple-500' },
    wireguard: { name: 'Shield', className: 'text-blue-500' },
    sstp: { name: 'Shield', className: 'text-green-500' },
    users: { name: 'Users', className: 'text-green-500' },
    router: { name: 'Router', className: 'text-blue-500' },
    database: { name: 'Database', className: 'text-purple-500' },
    backup: { name: 'Database', className: 'text-orange-500' },
    script: { name: 'Zap', className: 'text-yellow-500' },
    cable: { name: 'Cable', className: 'text-gray-500' },
    network: { name: 'Network', className: 'text-blue-500' },
    server: { name: 'Server', className: 'text-green-500' }
  };
  
  return serviceIcons[serviceType] || { name: 'Activity', className: 'text-gray-500' };
};

export const formatBytes = (bytes) => {
  if (!bytes && bytes !== 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export const formatSpeed = (speed) => {
  if (!speed && speed !== 0) return "0 Mbps";
  
  if (speed < 1000) {
    return `${speed.toFixed(2)} Mbps`;
  } else {
    return `${(speed / 1000).toFixed(2)} Gbps`;
  }
};

export const formatUptime = (uptime) => {
  if (!uptime || uptime === "N/A" || uptime === "0") return "N/A";
  
  try {
    // Handle different uptime formats
    if (typeof uptime === 'string') {
      // Parse MikroTik uptime format (e.g., "5d3h2m15s", "1w2d3h4m5s")
      const weeks = uptime.match(/(\d+)w/);
      const days = uptime.match(/(\d+)d/);
      const hours = uptime.match(/(\d+)h/);
      const minutes = uptime.match(/(\d+)m/);
      const seconds = uptime.match(/(\d+)s/);
      
      const w = weeks ? parseInt(weeks[1]) : 0;
      const d = days ? parseInt(days[1]) : 0;
      const h = hours ? parseInt(hours[1]) : 0;
      const m = minutes ? parseInt(minutes[1]) : 0;
      const s = seconds ? parseInt(seconds[1]) : 0;
      
      if (w > 0) return `${w}w ${d}d ${h}h`;
      if (d > 0) return `${d}d ${h}h ${m}m`;
      if (h > 0) return `${h}h ${m}m`;
      if (m > 0) return `${m}m ${s}s`;
      return `${s}s`;
    } else if (typeof uptime === 'number') {
      // Handle uptime in seconds
      const days = Math.floor(uptime / 86400);
      const hours = Math.floor((uptime % 86400) / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);
      
      if (days > 0) return `${days}d ${hours}h ${minutes}m`;
      if (hours > 0) return `${hours}h ${minutes}m`;
      if (minutes > 0) return `${minutes}m ${seconds}s`;
      return `${seconds}s`;
    }
  } catch (error) {
    console.error('Error formatting uptime:', error);
  }
  
  return "N/A";
};

export const calculateSystemHealth = (routers) => {
  if (!routers || routers.length === 0) return 100;
  
  const connectedRouters = routers.filter(r => r.connection_status === 'connected').length;
  const configuredRouters = routers.filter(r => r.configuration_status === 'configured').length;
  
  if (connectedRouters === 0) return 0;
  
  // Calculate health based on multiple factors
  const connectionHealth = (connectedRouters / routers.length) * 40;
  const configurationHealth = (configuredRouters / routers.length) * 30;
  
  // Calculate performance health (average of router health scores)
  const onlineRouters = routers.filter(r => r.connection_status === 'connected');
  const performanceHealth = onlineRouters.length > 0 
    ? onlineRouters.reduce((sum, router) => {
        const healthScore = router.health_score || 100;
        const cpuScore = (router.stats?.cpu || 0) < 80 ? 100 : 50;
        const memoryScore = (router.stats?.memory || 0) < 80 ? 100 : 50;
        return sum + Math.min(healthScore, cpuScore, memoryScore);
      }, 0) / onlineRouters.length * 0.3
    : 0;
  
  return Math.round(connectionHealth + configurationHealth + performanceHealth);
};

export const calculatePerformanceMetrics = (routers) => {
  const connectedRouters = routers.filter(r => r.connection_status === 'connected');
  const activeSessions = routers.reduce((total, router) => {
    return total + (router.stats?.total_sessions || router.connected_clients_count || 0);
  }, 0);
  
  const hotspotUsers = routers.reduce((total, router) => {
    return total + (router.stats?.hotspot_sessions || 0);
  }, 0);
  
  const pppoeUsers = routers.reduce((total, router) => {
    return total + (router.stats?.pppoe_sessions || 0);
  }, 0);
  
  const avgCpu = connectedRouters.length > 0 
    ? connectedRouters.reduce((sum, router) => sum + (router.stats?.cpu || router.stats?.cpu_load || 0), 0) / connectedRouters.length 
    : 0;
  
  const avgMemory = connectedRouters.length > 0 
    ? connectedRouters.reduce((sum, router) => sum + (router.stats?.memory || router.stats?.memory_usage || 0), 0) / connectedRouters.length 
    : 0;

  const totalThroughput = connectedRouters.reduce((sum, router) => 
    sum + (router.stats?.throughput || 0), 0
  );

  const systemHealth = calculateSystemHealth(routers);

  return {
    connectedRouters: connectedRouters.length,
    activeSessions,
    hotspotUsers,
    pppoeUsers,
    systemHealth: Math.round(systemHealth),
    performanceMetrics: {
      avgCpu: Math.round(avgCpu),
      avgMemory: Math.round(avgMemory),
      totalThroughput: Math.round(totalThroughput * 100) / 100,
      activeConnections: activeSessions
    }
  };
};

// Router capability detection
export const getRouterCapabilities = (router) => {
  const capabilities = {
    hotspot: false,
    pppoe: false,
    vpn: false,
    wireless: false,
    advanced_qos: false
  };
  
  if (!router.capabilities) return capabilities;
  
  // Check from backend capabilities
  if (router.capabilities.hotspot_support) capabilities.hotspot = true;
  if (router.capabilities.pppoe_support) capabilities.pppoe = true;
  if (router.capabilities.wireless_support) capabilities.wireless = true;
  if (router.capabilities.advanced_qos) capabilities.advanced_qos = true;
  
  // Check from configuration type
  if (router.configuration_type) {
    if (router.configuration_type.includes('hotspot')) capabilities.hotspot = true;
    if (router.configuration_type.includes('pppoe')) capabilities.pppoe = true;
    if (router.configuration_type.includes('vpn')) capabilities.vpn = true;
  }
  
  return capabilities;
};

// Configuration status helper
export const getConfigurationStatus = (router) => {
  if (!router) return 'not_configured';
  
  const status = router.configuration_status;
  const type = router.configuration_type;
  
  if (status === 'configured' && type) {
    return `Configured (${type.toUpperCase()})`;
  }
  
  return status?.charAt(0).toUpperCase() + status?.slice(1) || 'Not Configured';
};

// Health score calculation for individual router
export const calculateRouterHealthScore = (router) => {
  if (!router) return 0;
  
  let score = 100;
  
  // Connection status (40%)
  if (router.connection_status !== 'connected') score -= 40;
  
  // CPU usage (20%)
  const cpu = router.stats?.cpu || router.stats?.cpu_load || 0;
  if (cpu > 90) score -= 20;
  else if (cpu > 80) score -= 15;
  else if (cpu > 70) score -= 10;
  else if (cpu > 60) score -= 5;
  
  // Memory usage (20%)
  const memory = router.stats?.memory || router.stats?.memory_usage || 0;
  if (memory > 90) score -= 20;
  else if (memory > 80) score -= 15;
  else if (memory > 70) score -= 10;
  else if (memory > 60) score -= 5;
  
  // Response time (10%)
  const responseTime = router.stats?.response_time || 0;
  if (responseTime > 5) score -= 10;
  else if (responseTime > 3) score -= 7;
  else if (responseTime > 1) score -= 3;
  
  // Configuration status (10%)
  if (router.configuration_status !== 'configured') score -= 10;
  
  return Math.max(0, score);
};

// Alert level determination
export const getAlertLevel = (router) => {
  const healthScore = calculateRouterHealthScore(router);
  
  if (healthScore >= 80) return 'normal';
  if (healthScore >= 60) return 'warning';
  if (healthScore >= 40) return 'error';
  return 'critical';
};

// Format configuration type for display
export const formatConfigurationType = (configType) => {
  if (!configType) return 'None';
  
  if (typeof configType === 'string') {
    return configType.split(',').map(type => 
      type.trim().charAt(0).toUpperCase() + type.trim().slice(1)
    ).join(', ');
  }
  
  return 'Unknown';
};