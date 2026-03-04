



// /**
//  * Formatters for SMS automation frontend
//  */

// // Format currency
// export const formatCurrency = (amount, currency = 'KES', locale = 'en-KE') => {
//   if (amount === null || amount === undefined) return 'N/A';
  
//   try {
//     return new Intl.NumberFormat(locale, {
//       style: 'currency',
//       currency: currency,
//       minimumFractionDigits: 2,
//       maximumFractionDigits: 4
//     }).format(amount);
//   } catch (error) {
//     return `${currency} ${parseFloat(amount).toFixed(4)}`;
//   }
// };

// // Format date
// export const formatDate = (dateString, options = {}) => {
//   if (!dateString) return 'N/A';
  
//   const date = new Date(dateString);
//   const defaultOptions = {
//     year: 'numeric',
//     month: 'short',
//     day: 'numeric',
//     hour: '2-digit',
//     minute: '2-digit'
//   };
  
//   try {
//     return new Intl.DateTimeFormat('en-US', { ...defaultOptions, ...options }).format(date);
//   } catch (error) {
//     return date.toLocaleString('en-US', defaultOptions);
//   }
// };

// // Format time ago
// export const formatTimeAgo = (dateString) => {
//   if (!dateString) return 'N/A';
  
//   const date = new Date(dateString);
//   const now = new Date();
//   const diffMs = now - date;
//   const diffSecs = Math.floor(diffMs / 1000);
//   const diffMins = Math.floor(diffSecs / 60);
//   const diffHours = Math.floor(diffMins / 60);
//   const diffDays = Math.floor(diffHours / 24);
//   const diffWeeks = Math.floor(diffDays / 7);
//   const diffMonths = Math.floor(diffDays / 30);
//   const diffYears = Math.floor(diffDays / 365);
  
//   if (diffSecs < 60) {
//     return diffSecs <= 5 ? 'Just now' : `${diffSecs}s ago`;
//   } else if (diffMins < 60) {
//     return `${diffMins}m ago`;
//   } else if (diffHours < 24) {
//     return `${diffHours}h ago`;
//   } else if (diffDays < 7) {
//     return `${diffDays}d ago`;
//   } else if (diffWeeks < 4) {
//     return `${diffWeeks}w ago`;
//   } else if (diffMonths < 12) {
//     return `${diffMonths}mo ago`;
//   } else {
//     return `${diffYears}y ago`;
//   }
// };

// // Format phone number
// export const formatPhoneNumber = (phone, format = 'international') => {
//   if (!phone) return '';
  
//   // Remove all non-digit characters
//   const cleaned = phone.replace(/\D/g, '');
  
//   if (format === 'international') {
//     if (cleaned.startsWith('254') && cleaned.length === 12) {
//       return `+${cleaned}`;
//     } else if (cleaned.startsWith('0') && cleaned.length === 10) {
//       return `+254${cleaned.substring(1)}`;
//     } else if (cleaned.length === 9) {
//       return `+254${cleaned}`;
//     }
//     return `+${cleaned}`;
//   } else if (format === 'local') {
//     if (cleaned.startsWith('254') && cleaned.length === 12) {
//       return `0${cleaned.substring(3)}`;
//     } else if (cleaned.length === 9) {
//       return `0${cleaned}`;
//     }
//     return cleaned;
//   } else if (format === 'masked') {
//     if (cleaned.length >= 8) {
//       const start = cleaned.substring(0, 4);
//       const end = cleaned.substring(cleaned.length - 2);
//       return `${start}****${end}`;
//     }
//     return cleaned;
//   }
  
//   return cleaned;
// };

// // Format message preview
// export const formatMessagePreview = (message, maxLength = 50) => {
//   if (!message) return '';
//   if (message.length <= maxLength) return message;
//   return `${message.substring(0, maxLength - 3)}...`;
// };

// // Get status badge configuration
// export const getStatusBadge = (status, theme = 'light') => {
//   const config = {
//     pending: {
//       label: 'Pending',
//       color: theme === 'dark' ? 'text-yellow-400' : 'text-yellow-700',
//       bg: theme === 'dark' ? 'bg-yellow-900/30' : 'bg-yellow-100',
//       icon: '⏳'
//     },
//     queued: {
//       label: 'Queued',
//       color: theme === 'dark' ? 'text-blue-400' : 'text-blue-700',
//       bg: theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-100',
//       icon: '📥'
//     },
//     sending: {
//       label: 'Sending',
//       color: theme === 'dark' ? 'text-purple-400' : 'text-purple-700',
//       bg: theme === 'dark' ? 'bg-purple-900/30' : 'bg-purple-100',
//       icon: '📤'
//     },
//     sent: {
//       label: 'Sent',
//       color: theme === 'dark' ? 'text-blue-400' : 'text-blue-700',
//       bg: theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-100',
//       icon: '✈️'
//     },
//     delivered: {
//       label: 'Delivered',
//       color: theme === 'dark' ? 'text-green-400' : 'text-green-700',
//       bg: theme === 'dark' ? 'bg-green-900/30' : 'bg-green-100',
//       icon: '✅'
//     },
//     failed: {
//       label: 'Failed',
//       color: theme === 'dark' ? 'text-red-400' : 'text-red-700',
//       bg: theme === 'dark' ? 'bg-red-900/30' : 'bg-red-100',
//       icon: '❌'
//     },
//     cancelled: {
//       label: 'Cancelled',
//       color: theme === 'dark' ? 'text-gray-400' : 'text-gray-700',
//       bg: theme === 'dark' ? 'bg-gray-900/30' : 'bg-gray-100',
//       icon: '⛔'
//     },
//     expired: {
//       label: 'Expired',
//       color: theme === 'dark' ? 'text-orange-400' : 'text-orange-700',
//       bg: theme === 'dark' ? 'bg-orange-900/30' : 'bg-orange-100',
//       icon: '⌛'
//     }
//   };
  
//   return config[status] || {
//     label: status,
//     color: theme === 'dark' ? 'text-gray-400' : 'text-gray-700',
//     bg: theme === 'dark' ? 'bg-gray-900/30' : 'bg-gray-100',
//     icon: '❓'
//   };
// };

// // Get priority badge configuration
// export const getPriorityBadge = (priority, theme = 'light') => {
//   const config = {
//     urgent: {
//       label: 'Urgent',
//       color: theme === 'dark' ? 'text-red-400' : 'text-red-700',
//       bg: theme === 'dark' ? 'bg-red-900/30' : 'bg-red-100',
//       icon: '🔥'
//     },
//     high: {
//       label: 'High',
//       color: theme === 'dark' ? 'text-orange-400' : 'text-orange-700',
//       bg: theme === 'dark' ? 'bg-orange-900/30' : 'bg-orange-100',
//       icon: '⚠️'
//     },
//     normal: {
//       label: 'Normal',
//       color: theme === 'dark' ? 'text-blue-400' : 'text-blue-700',
//       bg: theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-100',
//       icon: '📄'
//     },
//     low: {
//       label: 'Low',
//       color: theme === 'dark' ? 'text-gray-400' : 'text-gray-700',
//       bg: theme === 'dark' ? 'bg-gray-900/30' : 'bg-gray-100',
//       icon: '📥'
//     }
//   };
  
//   return config[priority] || {
//     label: priority,
//     color: theme === 'dark' ? 'text-gray-400' : 'text-gray-700',
//     bg: theme === 'dark' ? 'bg-gray-900/30' : 'bg-gray-100',
//     icon: '❓'
//   };
// };

// // Format file size
// export const formatFileSize = (bytes) => {
//   if (bytes === 0) return '0 Bytes';
//   if (!bytes) return 'N/A';
  
//   const k = 1024;
//   const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
//   const i = Math.floor(Math.log(bytes) / Math.log(k));
  
//   return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
// };

// // Format success rate
// export const formatSuccessRate = (rate) => {
//   const numRate = parseFloat(rate) || 0;
//   return {
//     value: `${numRate.toFixed(1)}%`,
//     color: numRate >= 90 ? 'text-green-600' : numRate >= 80 ? 'text-yellow-600' : 'text-red-600'
//   };
// };

// // Format delivery time
// export const formatDeliveryTime = (seconds) => {
//   if (!seconds) return 'N/A';
  
//   const numSeconds = parseFloat(seconds);
//   if (numSeconds < 60) {
//     return `${numSeconds.toFixed(1)}s`;
//   } else if (numSeconds < 3600) {
//     return `${(numSeconds / 60).toFixed(1)}m`;
//   } else {
//     return `${(numSeconds / 3600).toFixed(1)}h`;
//   }
// };

// // Format message parts
// export const formatMessageParts = (parts, characters) => {
//   const numParts = parseInt(parts) || 1;
//   const numChars = parseInt(characters) || 0;
  
//   if (numParts === 1) {
//     return `${numParts} part (${numChars}/160 chars)`;
//   } else {
//     const maxChars = 306 + (numParts - 2) * 153;
//     return `${numParts} parts (${numChars}/${maxChars} chars)`;
//   }
// };

// // Truncate text
// export const truncateText = (text, maxLength = 100, suffix = '...') => {
//   if (!text) return '';
//   if (text.length <= maxLength) return text;
//   return text.substring(0, maxLength - suffix.length) + suffix;
// };

// // Capitalize first letter
// export const capitalize = (str) => {
//   if (!str) return '';
//   return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
// };

// // Format number with commas
// export const formatNumber = (num) => {
//   if (num === null || num === undefined) return '0';
//   return new Intl.NumberFormat('en-US').format(num);
// };

// // Format percentage
// export const formatPercentage = (value, decimals = 1) => {
//   if (value === null || value === undefined) return '0%';
//   return `${parseFloat(value).toFixed(decimals)}%`;
// };

// // Calculate message parts
// export const calculateMessageParts = (message) => {
//   if (!message) return 1;
  
//   const charCount = message.length;
//   if (charCount <= 160) return 1;
//   if (charCount <= 306) return 2;
  
//   return 2 + Math.ceil((charCount - 306) / 153);
// };

// // Generate random ID
// export const generateId = () => {
//   return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
//     const r = Math.random() * 16 | 0;
//     const v = c === 'x' ? r : (r & 0x3 | 0x8);
//     return v.toString(16);
//   });
// };

// // Debounce function
// export const debounce = (func, wait) => {
//   let timeout;
//   return (...args) => {
//     clearTimeout(timeout);
//     timeout = setTimeout(() => func(...args), wait);
//   };
// };

// // Throttle function
// export const throttle = (func, limit) => {
//   let inThrottle;
//   return (...args) => {
//     if (!inThrottle) {
//       func(...args);
//       inThrottle = true;
//       setTimeout(() => inThrottle = false, limit);
//     }
//   };
// };









import {
  Clock, Inbox, Send, CheckCircle, XCircle, Ban,
  AlertCircle, HelpCircle, Flame, AlertTriangle, Info,
  Download, Mail, MailOpen, MailQuestion, Zap, ArrowUp,
  ArrowDown, Minus, FileText, Phone, Calendar, DollarSign,
  Activity, Archive, Flag, Grid, List, Copy, Edit, Trash2,
  RefreshCw, ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  User, Search, Filter, Eye, Loader
} from 'lucide-react';

/**
 * Formatters for SMS automation frontend
 */

// Format currency
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

// Format date
export const formatDate = (dateString, options = {}) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  try {
    return new Intl.DateTimeFormat('en-US', { ...defaultOptions, ...options }).format(date);
  } catch (error) {
    return date.toLocaleString('en-US', defaultOptions);
  }
};

// Format time ago
export const formatTimeAgo = (dateString) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);
  
  if (diffSecs < 60) {
    return diffSecs <= 5 ? 'Just now' : `${diffSecs}s ago`;
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

// Format phone number
export const formatPhoneNumber = (phone, format = 'international') => {
  if (!phone) return '';
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  if (format === 'international') {
    if (cleaned.startsWith('254') && cleaned.length === 12) {
      return `+${cleaned}`;
    } else if (cleaned.startsWith('0') && cleaned.length === 10) {
      return `+254${cleaned.substring(1)}`;
    } else if (cleaned.length === 9) {
      return `+254${cleaned}`;
    }
    return `+${cleaned}`;
  } else if (format === 'local') {
    if (cleaned.startsWith('254') && cleaned.length === 12) {
      return `0${cleaned.substring(3)}`;
    } else if (cleaned.length === 9) {
      return `0${cleaned}`;
    }
    return cleaned;
  } else if (format === 'masked') {
    if (cleaned.length >= 8) {
      const start = cleaned.substring(0, 4);
      const end = cleaned.substring(cleaned.length - 2);
      return `${start}****${end}`;
    }
    return cleaned;
  }
  
  return cleaned;
};

// Format message preview
export const formatMessagePreview = (message, maxLength = 50) => {
  if (!message) return '';
  if (message.length <= maxLength) return message;
  return `${message.substring(0, maxLength - 3)}...`;
};

// Get status badge configuration with Lucide icons
export const getStatusBadge = (status, theme = 'light') => {
  const config = {
    pending: {
      label: 'Pending',
      color: theme === 'dark' ? 'text-yellow-400' : 'text-yellow-700',
      bg: theme === 'dark' ? 'bg-yellow-900/30' : 'bg-yellow-100',
      icon: Clock
    },
    queued: {
      label: 'Queued',
      color: theme === 'dark' ? 'text-blue-400' : 'text-blue-700',
      bg: theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-100',
      icon: Inbox
    },
    sending: {
      label: 'Sending',
      color: theme === 'dark' ? 'text-purple-400' : 'text-purple-700',
      bg: theme === 'dark' ? 'bg-purple-900/30' : 'bg-purple-100',
      icon: Send
    },
    sent: {
      label: 'Sent',
      color: theme === 'dark' ? 'text-blue-400' : 'text-blue-700',
      bg: theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-100',
      icon: Mail
    },
    delivered: {
      label: 'Delivered',
      color: theme === 'dark' ? 'text-green-400' : 'text-green-700',
      bg: theme === 'dark' ? 'bg-green-900/30' : 'bg-green-100',
      icon: CheckCircle
    },
    failed: {
      label: 'Failed',
      color: theme === 'dark' ? 'text-red-400' : 'text-red-700',
      bg: theme === 'dark' ? 'bg-red-900/30' : 'bg-red-100',
      icon: XCircle
    },
    cancelled: {
      label: 'Cancelled',
      color: theme === 'dark' ? 'text-gray-400' : 'text-gray-700',
      bg: theme === 'dark' ? 'bg-gray-900/30' : 'bg-gray-100',
      icon: Ban
    },
    expired: {
      label: 'Expired',
      color: theme === 'dark' ? 'text-orange-400' : 'text-orange-700',
      bg: theme === 'dark' ? 'bg-orange-900/30' : 'bg-orange-100',
      icon: AlertCircle
    },
    scheduled: {
      label: 'Scheduled',
      color: theme === 'dark' ? 'text-indigo-400' : 'text-indigo-700',
      bg: theme === 'dark' ? 'bg-indigo-900/30' : 'bg-indigo-100',
      icon: Calendar
    }
  };
  
  return config[status] || {
    label: status || 'Unknown',
    color: theme === 'dark' ? 'text-gray-400' : 'text-gray-700',
    bg: theme === 'dark' ? 'bg-gray-900/30' : 'bg-gray-100',
    icon: HelpCircle
  };
};

// Get priority badge configuration with Lucide icons
export const getPriorityBadge = (priority, theme = 'light') => {
  const config = {
    urgent: {
      label: 'Urgent',
      color: theme === 'dark' ? 'text-red-400' : 'text-red-700',
      bg: theme === 'dark' ? 'bg-red-900/30' : 'bg-red-100',
      icon: Flame
    },
    high: {
      label: 'High',
      color: theme === 'dark' ? 'text-orange-400' : 'text-orange-700',
      bg: theme === 'dark' ? 'bg-orange-900/30' : 'bg-orange-100',
      icon: AlertTriangle
    },
    normal: {
      label: 'Normal',
      color: theme === 'dark' ? 'text-blue-400' : 'text-blue-700',
      bg: theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-100',
      icon: Info
    },
    low: {
      label: 'Low',
      color: theme === 'dark' ? 'text-gray-400' : 'text-gray-700',
      bg: theme === 'dark' ? 'bg-gray-900/30' : 'bg-gray-100',
      icon: ArrowDown
    },
    bulk: {
      label: 'Bulk',
      color: theme === 'dark' ? 'text-purple-400' : 'text-purple-700',
      bg: theme === 'dark' ? 'bg-purple-900/30' : 'bg-purple-100',
      icon: Mail
    }
  };
  
  return config[priority] || {
    label: priority || 'Normal',
    color: theme === 'dark' ? 'text-gray-400' : 'text-gray-700',
    bg: theme === 'dark' ? 'bg-gray-900/30' : 'bg-gray-100',
    icon: HelpCircle
  };
};

// Format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  if (!bytes) return 'N/A';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

// Format success rate
export const formatSuccessRate = (rate) => {
  const numRate = parseFloat(rate) || 0;
  return {
    value: `${numRate.toFixed(1)}%`,
    color: numRate >= 90 ? 'text-green-600' : numRate >= 80 ? 'text-yellow-600' : 'text-red-600'
  };
};

// Format delivery time
export const formatDeliveryTime = (seconds) => {
  if (!seconds) return 'N/A';
  
  const numSeconds = parseFloat(seconds);
  if (numSeconds < 60) {
    return `${numSeconds.toFixed(1)}s`;
  } else if (numSeconds < 3600) {
    return `${(numSeconds / 60).toFixed(1)}m`;
  } else {
    return `${(numSeconds / 3600).toFixed(1)}h`;
  }
};

// Format message parts
export const formatMessageParts = (parts, characters) => {
  const numParts = parseInt(parts) || 1;
  const numChars = parseInt(characters) || 0;
  
  if (numParts === 1) {
    return `${numParts} part (${numChars}/160 chars)`;
  } else {
    const maxChars = 306 + (numParts - 2) * 153;
    return `${numParts} parts (${numChars}/${maxChars} chars)`;
  }
};

// Truncate text
export const truncateText = (text, maxLength = 100, suffix = '...') => {
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

// Calculate message parts
export const calculateMessageParts = (message) => {
  if (!message) return 1;
  
  const charCount = message.length;
  if (charCount <= 160) return 1;
  if (charCount <= 306) return 2;
  
  return 2 + Math.ceil((charCount - 306) / 153);
};

// Generate random ID
export const generateId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle function
export const throttle = (func, limit) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Export all icons for convenience
export const Icons = {
  Clock, Inbox, Send, CheckCircle, XCircle, Ban,
  AlertCircle, HelpCircle, Flame, AlertTriangle, Info,
  Download, Mail, MailOpen, MailQuestion, Zap, ArrowUp,
  ArrowDown, Minus, FileText, Phone, Calendar, DollarSign,
  Activity, Archive, Flag, Grid, List, Copy, Edit, Trash2,
  RefreshCw, ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  User, Search, Filter, Eye, Loader
};