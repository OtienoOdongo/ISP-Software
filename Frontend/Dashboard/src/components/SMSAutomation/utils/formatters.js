/**
 * Formatters for SMS automation frontend
 */

// Format currency with locale
export const formatCurrency = (amount, currency = 'KES', locale = 'en-KE') => {
  if (amount === null || amount === undefined) return 'N/A';
  
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    }).format(amount);
  } catch (error) {
    return `${currency} ${parseFloat(amount).toFixed(4)}`;
  }
};

// Format date with options
export const formatDate = (dateString, options = {}) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  const defaultOptions = {
    dateStyle: 'medium',
    timeStyle: 'short',
    ...options
  };
  
  try {
    return new Intl.DateTimeFormat('en-US', defaultOptions).format(date);
  } catch (error) {
    // Fallback format
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
};

// Format time ago
export const formatTimeAgo = (dateString) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);
  
  if (diffMins < 1) {
    return 'Just now';
  } else if (diffMins < 60) {
    return `${diffMins}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else if (diffWeeks < 4) {
    return `${diffWeeks}w ago`;
  } else if (diffMonths < 12) {
    return `${diffMonths}mo ago`;
  } else {
    return `${diffYears}y ago`;
  }
};

// Format phone number for display
export const formatPhoneNumber = (phone, format = 'international') => {
  if (!phone) return '';
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format based on preference
  switch (format) {
    case 'international':
      if (cleaned.startsWith('254') && cleaned.length === 12) {
        return `+${cleaned}`;
      } else if (cleaned.startsWith('0') && cleaned.length === 10) {
        return `+254${cleaned.substring(1)}`;
      } else if (cleaned.length === 9) {
        return `+254${cleaned}`;
      } else {
        return `+${cleaned}`;
      }
    
    case 'local':
      if (cleaned.startsWith('254') && cleaned.length === 12) {
        return `0${cleaned.substring(3)}`;
      } else if (cleaned.length === 9) {
        return `0${cleaned}`;
      } else {
        return cleaned;
      }
    
    case 'masked':
      if (cleaned.length >= 6) {
        const prefix = cleaned.substring(0, cleaned.length - 4);
        const suffix = cleaned.substring(cleaned.length - 2);
        return `${prefix}****${suffix}`;
      }
      return cleaned;
    
    default:
      return cleaned;
  }
};

// Format message preview
export const formatMessagePreview = (message, maxLength = 50) => {
  if (!message) return '';
  
  if (message.length <= maxLength) {
    return message;
  }
  
  return `${message.substring(0, maxLength)}...`;
};

// Format status with color
export const formatStatus = (status, theme = 'light') => {
  const statusConfig = {
    pending: {
      label: 'Pending',
      color: theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600',
      bg: theme === 'dark' ? 'bg-yellow-900/30' : 'bg-yellow-100',
      icon: '🟡'
    },
    sent: {
      label: 'Sent',
      color: theme === 'dark' ? 'text-blue-400' : 'text-blue-600',
      bg: theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-100',
      icon: '📤'
    },
    delivered: {
      label: 'Delivered',
      color: theme === 'dark' ? 'text-green-400' : 'text-green-600',
      bg: theme === 'dark' ? 'bg-green-900/30' : 'bg-green-100',
      icon: '✅'
    },
    failed: {
      label: 'Failed',
      color: theme === 'dark' ? 'text-red-400' : 'text-red-600',
      bg: theme === 'dark' ? 'bg-red-900/30' : 'bg-red-100',
      icon: '❌'
    },
    cancelled: {
      label: 'Cancelled',
      color: theme === 'dark' ? 'text-gray-400' : 'text-gray-600',
      bg: theme === 'dark' ? 'bg-gray-900/30' : 'bg-gray-100',
      icon: '⏹️'
    }
  };
  
  return statusConfig[status] || {
    label: status.charAt(0).toUpperCase() + status.slice(1),
    color: theme === 'dark' ? 'text-gray-400' : 'text-gray-600',
    bg: theme === 'dark' ? 'bg-gray-900/30' : 'bg-gray-100',
    icon: '❓'
  };
};

// Format priority with color
export const formatPriority = (priority, theme = 'light') => {
  const priorityConfig = {
    urgent: {
      label: 'Urgent',
      color: theme === 'dark' ? 'text-red-400' : 'text-red-600',
      bg: theme === 'dark' ? 'bg-red-900/30' : 'bg-red-100',
      icon: '🔥'
    },
    high: {
      label: 'High',
      color: theme === 'dark' ? 'text-orange-400' : 'text-orange-600',
      bg: theme === 'dark' ? 'bg-orange-900/30' : 'bg-orange-100',
      icon: '⚠️'
    },
    normal: {
      label: 'Normal',
      color: theme === 'dark' ? 'text-blue-400' : 'text-blue-600',
      bg: theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-100',
      icon: '📄'
    },
    low: {
      label: 'Low',
      color: theme === 'dark' ? 'text-gray-400' : 'text-gray-600',
      bg: theme === 'dark' ? 'bg-gray-900/30' : 'bg-gray-100',
      icon: '📥'
    }
  };
  
  return priorityConfig[priority] || {
    label: priority.charAt(0).toUpperCase() + priority.slice(1),
    color: theme === 'dark' ? 'text-gray-400' : 'text-gray-600',
    bg: theme === 'dark' ? 'bg-gray-900/30' : 'bg-gray-100',
    icon: '❓'
  };
};

// Format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Format success rate with color
export const formatSuccessRate = (rate) => {
  if (rate >= 90) return { value: `${rate.toFixed(1)}%`, color: 'text-green-600' };
  if (rate >= 80) return { value: `${rate.toFixed(1)}%`, color: 'text-yellow-600' };
  return { value: `${rate.toFixed(1)}%`, color: 'text-red-600' };
};

// Format delivery time
export const formatDeliveryTime = (seconds) => {
  if (!seconds) return 'N/A';
  
  if (seconds < 60) {
    return `${seconds.toFixed(1)}s`;
  } else if (seconds < 3600) {
    return `${(seconds / 60).toFixed(1)}m`;
  } else {
    return `${(seconds / 3600).toFixed(1)}h`;
  }
};

// Format message parts
export const formatMessageParts = (parts, characters) => {
  if (parts === 1) {
    return `1 part (${characters}/160 chars)`;
  } else {
    const maxChars = 306 + (parts - 2) * 153;
    return `${parts} parts (${characters}/${maxChars} chars)`;
  }
};

// Truncate text with ellipsis
export const truncateText = (text, maxLength, suffix = '...') => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength - suffix.length) + suffix;
};

// Capitalize first letter
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Format number with commas
export const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  return new Intl.NumberFormat('en-US').format(num);
};

// Format percentage
export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined) return '0%';
  return `${parseFloat(value).toFixed(decimals)}%`;
};