// src/utils/iconUtils.jsx
import React from 'react';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { getHealthIconConfig } from './networkUtils';

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