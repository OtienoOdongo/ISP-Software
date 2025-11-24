// // src/utils/iconUtils.jsx
// import React from 'react';
// import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
// import { getHealthIconConfig } from './networkUtils';

// export const getHealthIcon = (value, type = "usage") => {
//   const config = getHealthIconConfig(value, type);
  
//   switch (config.name) {
//     case 'CheckCircle':
//       return <CheckCircle className={config.className} />;
//     case 'AlertTriangle':
//       return <AlertTriangle className={config.className} />;
//     case 'XCircle':
//       return <XCircle className={config.className} />;
//     default:
//       return <CheckCircle className={config.className} />;
//   }
// };

// // Alternative: HealthIcon component
// export const HealthIcon = ({ value, type = "usage", className = "" }) => {
//   const config = getHealthIconConfig(value, type);
//   const combinedClassName = `${config.className} ${className}`.trim();
  
//   switch (config.name) {
//     case 'CheckCircle':
//       return <CheckCircle className={combinedClassName} />;
//     case 'AlertTriangle':
//       return <AlertTriangle className={combinedClassName} />;
//     case 'XCircle':
//       return <XCircle className={combinedClassName} />;
//     default:
//       return <CheckCircle className={combinedClassName} />;
//   }
// };




// src/utils/iconUtils.jsx
import React from 'react';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Wifi, 
  Server, 
  Users, 
  Activity,
  Shield,
  Router,
  Database,
  Zap,
  Cable,
  Network,
  Thermometer,
  HardDrive,
  Clock,
  Download,
  Upload
} from 'lucide-react';
import { getHealthIconConfig, getServiceIconConfig } from './networkUtils';

// Health status icons
export const getHealthIcon = (value, type = "usage") => {
  const config = getHealthIconConfig(value, type);
  
  switch (config.name) {
    case 'CheckCircle':
      return <CheckCircle className={config.className} />;
    case 'AlertTriangle':
      return <AlertTriangle className={config.className} />;
    case 'XCircle':
      return <XCircle className={config.className} />;
    default:
      return <CheckCircle className={config.className} />;
  }
};

// Service type icons
export const getServiceIcon = (serviceType, className = "w-4 h-4") => {
  const config = getServiceIconConfig(serviceType);
  const combinedClassName = `${config.className} ${className}`.trim();
  
  switch (config.name) {
    case 'Wifi':
      return <Wifi className={combinedClassName} />;
    case 'Shield':
      return <Shield className={combinedClassName} />;
    case 'Users':
      return <Users className={combinedClassName} />;
    case 'Router':
      return <Router className={combinedClassName} />;
    case 'Database':
      return <Database className={combinedClassName} />;
    case 'Zap':
      return <Zap className={combinedClassName} />;
    case 'Cable':
      return <Cable className={combinedClassName} />;
    case 'Network':
      return <Network className={combinedClassName} />;
    case 'Server':
      return <Server className={combinedClassName} />;
    default:
      return <Activity className={combinedClassName} />;
  }
};

// Configuration status icons
export const getConfigStatusIcon = (status, className = "w-4 h-4") => {
  switch (status) {
    case 'configured':
      return <CheckCircle className={`${className} text-green-500`} />;
    case 'partially_configured':
      return <AlertTriangle className={`${className} text-yellow-500`} />;
    case 'not_configured':
      return <XCircle className={`${className} text-red-500`} />;
    case 'configuration_failed':
      return <XCircle className={`${className} text-red-500`} />;
    default:
      return <Activity className={`${className} text-gray-500`} />;
  }
};

// Connection status icons
export const getConnectionStatusIcon = (status, className = "w-4 h-4") => {
  switch (status) {
    case 'connected':
      return <CheckCircle className={`${className} text-green-500`} />;
    case 'disconnected':
      return <XCircle className={`${className} text-red-500`} />;
    case 'connecting':
      return <Activity className={`${className} text-yellow-500 animate-pulse`} />;
    default:
      return <AlertTriangle className={`${className} text-gray-500`} />;
  }
};

// Metric type icons
export const getMetricIcon = (metricType, className = "w-4 h-4") => {
  switch (metricType) {
    case 'cpu':
      return <Activity className={className} />;
    case 'memory':
      return <HardDrive className={className} />;
    case 'temperature':
      return <Thermometer className={className} />;
    case 'throughput':
      return <Network className={className} />;
    case 'download':
      return <Download className={className} />;
    case 'upload':
      return <Upload className={className} />;
    case 'uptime':
      return <Clock className={className} />;
    case 'sessions':
      return <Users className={className} />;
    default:
      return <Activity className={className} />;
  }
};

// Alternative: HealthIcon component
export const HealthIcon = ({ value, type = "usage", className = "" }) => {
  const config = getHealthIconConfig(value, type);
  const combinedClassName = `${config.className} ${className}`.trim();
  
  switch (config.name) {
    case 'CheckCircle':
      return <CheckCircle className={combinedClassName} />;
    case 'AlertTriangle':
      return <AlertTriangle className={combinedClassName} />;
    case 'XCircle':
      return <XCircle className={combinedClassName} />;
    default:
      return <CheckCircle className={combinedClassName} />;
  }
};

// Service Icon component
export const ServiceIcon = ({ serviceType, className = "", size = "default" }) => {
  const sizeClasses = {
    small: "w-3 h-3",
    default: "w-4 h-4",
    large: "w-5 h-5",
    xlarge: "w-6 h-6"
  };
  
  const combinedClassName = `${sizeClasses[size]} ${className}`.trim();
  return getServiceIcon(serviceType, combinedClassName);
};

// Configuration Status Icon component
export const ConfigStatusIcon = ({ status, className = "", size = "default" }) => {
  const sizeClasses = {
    small: "w-3 h-3",
    default: "w-4 h-4",
    large: "w-5 h-5"
  };
  
  const combinedClassName = `${sizeClasses[size]} ${className}`.trim();
  return getConfigStatusIcon(status, combinedClassName);
};

// Connection Status Icon component
export const ConnectionStatusIcon = ({ status, className = "", size = "default" }) => {
  const sizeClasses = {
    small: "w-3 h-3",
    default: "w-4 h-4",
    large: "w-5 h-5"
  };
  
  const combinedClassName = `${sizeClasses[size]} ${className}`.trim();
  return getConnectionStatusIcon(status, combinedClassName);
};