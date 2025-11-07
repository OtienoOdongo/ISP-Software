

// src/Pages/NetworkManagement/components/Layout/RouterCard.jsx
import React from "react";
import { motion } from "framer-motion";
import { 
  Wifi, Server, Settings, Power, ChevronDown, ChevronUp, 
  Cpu, HardDrive, Users, Network, Download, Upload, 
  MapPin, Calendar, BarChart3, RefreshCw, Edit, Trash2, Play, Pause,
  Thermometer
} from "lucide-react";
import CustomButton from "../Common/CustomButton";
import { getThemeClasses } from  "../../../../components/ServiceManagement/Shared/components"

const RouterCard = ({ 
  router, 
  isExpanded, 
  routerStats = {}, 
  theme = "light", 
  onToggleExpand, 
  onViewStats, 
  onRestart, 
  onStatusChange, 
  onEdit, 
  onDelete 
}) => {
  const themeClasses = getThemeClasses(theme);

  const getRouterStatusColor = (status) => {
    const colors = theme === 'dark' ? {
      connected: "bg-green-900/80 text-green-300 border border-green-800",
      disconnected: "bg-red-900/80 text-red-300 border border-red-800",
      updating: "bg-yellow-900/80 text-yellow-300 border border-yellow-800",
      error: "bg-gray-700 text-gray-300 border border-gray-600",
    } : {
      connected: "bg-green-100 text-green-600 border border-green-200",
      disconnected: "bg-red-100 text-red-600 border border-red-200",
      updating: "bg-yellow-100 text-yellow-600 border border-yellow-200",
      error: "bg-gray-100 text-gray-600 border border-gray-200",
    };
    return colors[status] || (theme === 'dark' ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-500");
  };

  const getRouterStatusIcon = (status) => {
    switch (status) {
      case "connected":
        return <Wifi className="w-4 h-4 text-green-500" />;
      case "disconnected":
        return <Wifi className="w-4 h-4 text-red-500" />;
      case "updating":
        return <Settings className="w-4 h-4 text-yellow-500" />;
      case "error":
        return <Power className="w-4 h-4 text-gray-500" />;
      default:
        return <Wifi className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPerformanceColor = (value, type = "usage") => {
    if (!value) return themeClasses.text.tertiary;
    
    if (type === "usage") {
      if (value >= 80) return "text-red-500";
      if (value >= 60) return "text-yellow-500";
      return "text-green-500";
    } else if (type === "temperature") {
      if (value >= 70) return "text-red-500";
      if (value >= 50) return "text-yellow-500";
      return "text-green-500";
    }
    return "text-blue-500";
  };

  const formatBytes = (bytes) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatSpeed = (speed) => {
    if (!speed) return "N/A";
    return `${(speed / 1024 / 1024).toFixed(2)} Mbps`;
  };

  const formatUptime = (uptime) => {
    if (!uptime || uptime === "N/A") return "N/A";
    
    const days = uptime.match(/(\d+)d/);
    const hours = uptime.match(/(\d+)h/);
    const minutes = uptime.match(/(\d+)m/);
    
    const d = days ? parseInt(days[1]) : 0;
    const h = hours ? parseInt(hours[1]) : 0;
    const m = minutes ? parseInt(minutes[1]) : 0;
    
    if (d > 0) return `${d}d ${h}h`;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  const stats = routerStats?.[router.id]?.latest || {};

  return (
    <motion.div
      layout
      className={`rounded-xl shadow-lg backdrop-blur-md transition-all duration-300 border ${themeClasses.bg.card} ${themeClasses.border.light} hover:${theme === 'dark' ? 'bg-gray-800/80' : 'bg-gray-50'}`}
    >
      {/* Main Router Card */}
      <div className="p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center space-x-4 flex-1">
            <div className={`p-3 rounded-lg border ${
              theme === "dark" ? "bg-blue-900/50 border-blue-800" : "bg-blue-100 border-blue-200"
            }`}>
              {getRouterStatusIcon(router.status)}
            </div>
            
            <div className="flex-1">
              <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-4">
                <h3 className={`font-semibold text-lg ${themeClasses.text.primary}`}>{router.name}</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRouterStatusColor(router.status)}`}>
                  {router.status?.charAt(0).toUpperCase() + router.status?.slice(1) || "Unknown"}
                </span>
              </div>
              
              <div className={`grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-2 text-sm mt-3 ${themeClasses.text.secondary}`}>
                <div className="flex items-center">
                  <Network className="w-4 h-4 mr-2" />
                  <span>{router.ip}</span>
                </div>
                <div className="flex items-center">
                  <Cpu className="w-4 h-4 mr-2" />
                  <span className={getPerformanceColor(stats.cpu)}>
                    CPU: {stats.cpu ? `${stats.cpu}%` : "N/A"}
                  </span>
                </div>
                <div className="flex items-center">
                  <HardDrive className="w-4 h-4 mr-2" />
                  <span className={getPerformanceColor(stats.memory)}>
                    RAM: {stats.memory ? `${stats.memory}%` : "N/A"}
                  </span>
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  <span>Clients: {stats.clients || 0}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <CustomButton
              onClick={() => onViewStats(router.id)}
              icon={<BarChart3 className="w-4 h-4" />}
              label="Stats"
              variant="secondary"
              size="sm"
              theme={theme}
            />
            
            <CustomButton
              onClick={() => onRestart(router.id)}
              icon={<RefreshCw className="w-4 h-4" />}
              label="Restart"
              variant="secondary"
              size="sm"
              disabled={router.status === "disconnected"}
              theme={theme}
            />
            
            <CustomButton
              onClick={() => onStatusChange(
                router.id, 
                router.status === 'connected' ? 'disconnected' : 'connected'
              )}
              icon={router.status === 'connected' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              label={router.status === 'connected' ? "Deactivate" : "Activate"}
              variant={router.status === 'connected' ? "secondary" : "primary"}
              size="sm"
              theme={theme}
            />
            
            <CustomButton
              onClick={() => onEdit(router)}
              icon={<Edit className="w-4 h-4" />}
              label="Edit"
              variant="secondary"
              size="sm"
              theme={theme}
            />
            
            <CustomButton
              onClick={() => onDelete(router)}
              icon={<Trash2 className="w-4 h-4" />}
              label="Delete"
              variant="danger"
              size="sm"
              theme={theme}
            />
            
            <button
              onClick={() => onToggleExpand(router.id)}
              className={`p-2 rounded-lg transition-colors duration-300 ${
                theme === "dark" ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              {isExpanded ? 
                <ChevronUp className="w-4 h-4" /> : 
                <ChevronDown className="w-4 h-4" />
              }
            </button>
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`mt-6 pt-6 border-t ${themeClasses.border.light}`}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className={`font-medium mb-3 flex items-center ${themeClasses.text.primary}`}>
                  <Settings className="w-4 h-4 mr-2" />
                  Router Details
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "IP Address", value: router.ip },
                    { label: "Model", value: router.model || "N/A" },
                    { label: "Location", value: router.location || "N/A", icon: MapPin },
                    { label: "Type", value: router.type || "N/A" },
                    { label: "Port", value: router.port || "8728" },
                    { label: "Max Clients", value: router.max_clients || "50" },
                    { label: "Uptime", value: formatUptime(stats.uptime), icon: Calendar },
                    { label: "Last Seen", value: router.last_seen ? new Date(router.last_seen).toLocaleString() : "N/A" }
                  ].map((item, index) => (
                    <React.Fragment key={index}>
                      <div className={`font-medium ${themeClasses.text.secondary} flex items-center`}>
                        {item.icon && <item.icon className="w-3 h-3 mr-1" />}
                        {item.label}:
                      </div>
                      <div className={themeClasses.text.primary}>
                        {item.value}
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className={`font-medium mb-3 flex items-center ${themeClasses.text.primary}`}>
                  <Server className="w-4 h-4 mr-2" />
                  Performance Metrics
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { 
                      label: "CPU Usage", 
                      value: stats.cpu ? `${stats.cpu}%` : "N/A", 
                      icon: Cpu,
                      color: getPerformanceColor(stats.cpu)
                    },
                    { 
                      label: "Memory Usage", 
                      value: stats.memory ? `${stats.memory}%` : "N/A", 
                      icon: HardDrive,
                      color: getPerformanceColor(stats.memory)
                    },
                    { 
                      label: "Temperature", 
                      value: stats.temperature ? `${stats.temperature}°C` : "N/A", 
                      icon: Thermometer,
                      color: getPerformanceColor(stats.temperature, "temperature")
                    },
                    { 
                      label: "Connected Clients", 
                      value: `${stats.clients || 0} / ${router.max_clients || 50}`,
                      icon: Users
                    },
                    { 
                      label: "Download", 
                      value: formatSpeed(stats.throughput),
                      icon: Download
                    },
                    { 
                      label: "Upload", 
                      value: formatSpeed(stats.upload_speed),
                      icon: Upload
                    }
                  ].map((item, index) => (
                    <React.Fragment key={index}>
                      <div className={`font-medium ${themeClasses.text.secondary} flex items-center`}>
                        {item.icon && <item.icon className="w-3 h-3 mr-1" />}
                        {item.label}:
                      </div>
                      <div className={`${item.color || ""} ${!item.color ? themeClasses.text.primary : ""}`}>
                        {item.value}
                      </div>
                    </React.Fragment>
                  ))}
                </div>
                
                {router.description && (
                  <div className="mt-4">
                    <div className={`font-medium ${themeClasses.text.secondary}`}>Description:</div>
                    <div className={`mt-1 ${themeClasses.text.primary}`}>
                      {router.description}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default RouterCard;