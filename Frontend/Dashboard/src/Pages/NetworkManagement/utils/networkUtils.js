// src/utils/networkUtils.js

export const formatTimeSince = (date) => {
  if (!date) return "N/A";
  const timestamp = new Date(date);
  const seconds = Math.floor((new Date() - timestamp) / 1000);
  
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};

export const getHealthColor = (value, type = "usage") => {
  if (!value && value !== 0) return "text-gray-500";
  
  if (type === "usage") {
    if (value >= 80) return "text-red-500";
    if (value >= 60) return "text-yellow-500";
    return "text-green-500";
  } else if (type === "temperature") {
    if (value >= 70) return "text-red-500";
    if (value >= 50) return "text-yellow-500";
    return "text-green-500";
  } else if (type === "response") {
    if (value > 5) return "text-red-500";
    if (value > 2) return "text-yellow-500";
    return "text-green-500";
  }
  return "text-blue-500";
};

// Health icon names only (no JSX)
export const getHealthIconName = (value, type = "usage") => {
  if (!value && value !== 0) return "XCircle";
  
  if (type === "usage") {
    if (value >= 80) return "XCircle";
    if (value >= 60) return "AlertTriangle";
    return "CheckCircle";
  } else if (type === "status") {
    if (value === "online") return "CheckCircle";
    if (value === "offline") return "XCircle";
    return "AlertTriangle";
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

export const formatBytes = (bytes) => {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export const formatSpeed = (speed) => {
  if (!speed) return "0 Mbps";
  return `${(speed).toFixed(2)} Mbps`;
};

export const formatUptime = (uptime) => {
  if (!uptime || uptime === "N/A") return "N/A";
  
  // Parse MikroTik uptime format (e.g., "5d3h2m15s")
  const days = uptime.match(/(\d+)d/);
  const hours = uptime.match(/(\d+)h/);
  const minutes = uptime.match(/(\d+)m/);
  const seconds = uptime.match(/(\d+)s/);
  
  const d = days ? parseInt(days[1]) : 0;
  const h = hours ? parseInt(hours[1]) : 0;
  const m = minutes ? parseInt(minutes[1]) : 0;
  const s = seconds ? parseInt(seconds[1]) : 0;
  
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
};

export const calculateSystemHealth = (routers) => {
  const connectedRouters = routers.filter(r => r.status === 'connected').length;
  const onlineRouters = routers.filter(r => r.status === 'connected');
  
  if (connectedRouters === 0) return 100;
  
  const overloadedRouters = onlineRouters.filter(r => (r.stats?.cpu || 0) > 80).length;
  return Math.max(0, 100 - (overloadedRouters / connectedRouters * 100));
};

export const calculatePerformanceMetrics = (routers) => {
  const connectedRouters = routers.filter(r => r.status === 'connected');
  const activeSessions = routers.reduce((total, router) => {
    return total + (router.connected_clients_count || 0);
  }, 0);
  
  const avgCpu = connectedRouters.length > 0 
    ? connectedRouters.reduce((sum, router) => sum + (router.stats?.cpu || 0), 0) / connectedRouters.length 
    : 0;
  
  const avgMemory = connectedRouters.length > 0 
    ? connectedRouters.reduce((sum, router) => sum + (router.stats?.memory || 0), 0) / connectedRouters.length 
    : 0;

  const totalThroughput = connectedRouters.reduce((sum, router) => 
    sum + (router.stats?.throughput || 0), 0
  );

  const systemHealth = calculateSystemHealth(routers);

  return {
    connectedRouters: connectedRouters.length,
    activeSessions,
    systemHealth: Math.round(systemHealth),
    performanceMetrics: {
      avgCpu: Math.round(avgCpu),
      avgMemory: Math.round(avgMemory),
      totalThroughput: Math.round(totalThroughput * 100) / 100,
      activeConnections: activeSessions
    }
  };
};