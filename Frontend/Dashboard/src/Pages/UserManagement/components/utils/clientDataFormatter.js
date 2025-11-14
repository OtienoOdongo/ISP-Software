// // utils/clientDataFormatter.js
// export const formatClientData = (client) => {
//   // Handle connection info from backend
//   const connectionInfo = client.connection_info || {};
//   const sessionHistory = client.history?.sessionHistory || [];
  
//   return {
//     ...client,
//     // Enhanced connection type handling
//     connection_type: connectionInfo.connection_type || client.connection_type || 'none',
//     connection_info: connectionInfo,
    
//     // Device information with better fallbacks
//     device: client.device || connectionInfo.mac_address || connectionInfo.username || 'Unknown',
    
//     // Router information
//     router: client.router || connectionInfo.router,
    
//     // Enhanced active status
//     active: connectionInfo.is_active !== undefined ? connectionInfo.is_active : client.active,
    
//     // Session history data
//     sessionHistory: sessionHistory,
    
//     // Connection statistics
//     totalSessions: client.history?.summary?.totalSessions || 0,
//     activeSessions: client.history?.summary?.activeSessions || 0,
//     totalDataUsedGB: client.history?.summary?.totalDataUsedGB || 0,
//     frequentRouter: client.history?.summary?.frequentRouter,
    
//     // Data usage with connection-specific data
//     data_usage: client.data_usage || {
//       used: connectionInfo.data_used || 0,
//       total: 'unlimited',
//       unit: 'GB'
//     }
//   };
// };

// export const formatDuration = (seconds) => {
//   if (!seconds) return "0s";
  
//   const hours = Math.floor(seconds / 3600);
//   const minutes = Math.floor((seconds % 3600) / 60);
//   const secs = seconds % 60;
  
//   if (hours > 0) {
//     return `${hours}h ${minutes}m ${secs}s`;
//   } else if (minutes > 0) {
//     return `${minutes}m ${secs}s`;
//   } else {
//     return `${secs}s`;
//   }
// };

// export const formatBytesToGB = (bytes) => {
//   return (bytes / (1024 ** 3)).toFixed(1);
// };








// // utils/clientDataFormatter.js
// export const formatClientData = (client) => {
//   if (!client) return null;

//   return {
//     id: client.id,
//     username: client.username || 'Unknown',
//     phonenumber: client.phonenumber || 'N/A',
//     active: client.active || false,
//     connection_type: client.connection_info?.connection_type || 'none',
//     device: client.device || 'Unknown',
//     location: client.location || 'Unknown',
//     subscription: client.subscription || null,
//     data_usage: client.data_usage || { used: 0, total: 0, unit: 'GB' },
//     paymentStatus: client.payment_status || 'Unknown',
//     is_unlimited: client.is_unlimited || false,
//     total_revenue: client.total_revenue || 0,
//     renewal_frequency: client.renewal_frequency || 'No renewals',
//     avg_monthly_spend: client.avg_monthly_spend || 0,
//     loyalty_duration: client.loyalty_duration || 0,
//     router: client.router || null,
//     history: client.history || {
//       purchaseHistory: [],
//       visitedSites: [],
//       sessionHistory: [],
//       dataUsage: []
//     },
//     communication_logs: client.communication_logs || [],
//     totalSessions: client.history?.summary?.totalSessions || 0,
//     activeSessions: client.history?.summary?.activeSessions || 0,
//     totalDataUsedGB: client.history?.summary?.totalDataUsedGB || 0
//   };
// };

// export const formatDuration = (seconds) => {
//   if (!seconds) return "0s";
  
//   const hours = Math.floor(seconds / 3600);
//   const minutes = Math.floor((seconds % 3600) / 60);
//   const secs = seconds % 60;
  
//   if (hours > 0) {
//     return `${hours}h ${minutes}m ${secs}s`;
//   } else if (minutes > 0) {
//     return `${minutes}m ${secs}s`;
//   } else {
//     return `${secs}s`;
//   }
// };

// export const formatBytesToGB = (bytes) => {
//   if (!bytes) return 0;
//   return parseFloat((bytes / (1024 ** 3)).toFixed(2));
// };

// export const formatCurrency = (amount, currency = 'KES') => {
//   return new Intl.NumberFormat('en-US', {
//     style: 'currency',
//     currency: currency,
//     minimumFractionDigits: 0,
//     maximumFractionDigits: 0,
//   }).format(amount);
// };









// utils/clientDataFormatter.js - Enhanced version
export const formatClientData = (client) => {
  if (!client) return null;

  return {
    id: client.id,
    username: client.username || 'Unknown',
    phonenumber: client.phonenumber || 'N/A',
    email: client.email || 'N/A',
    active: client.active || false,
    
    // Enhanced connection info from network_management
    connection_info: client.connection_info || { connection_type: 'none', is_active: false },
    connection_type: client.connection_info?.connection_type || 'none',
    
    // Client profile data
    preferred_contact_method: client.preferred_contact_method || 'sms',
    preferred_contact_method_display: client.preferred_contact_method_display || 'SMS',
    communication_preferences: client.communication_preferences || {},
    notes: client.notes || '',
    customer_since: client.customer_since,
    last_contact: client.last_contact,
    
    // Business data
    acquisition_source: client.acquisition_source || 'Unknown',
    referral_code: client.referral_code || '',
    loyalty_tier: client.loyalty_tier || 'new',
    loyalty_tier_display: client.loyalty_tier_display || 'New',
    
    // Network management data
    current_usage: client.current_usage || { used_gb: 0, remaining_time: 0, connection_type: 'none' },
    session_history: client.session_history || [],
    
    // Subscription and billing
    subscription: client.subscription || null,
    payment_status: client.payment_status || 'Unknown',
    total_revenue: client.total_revenue || 0,
    
    // Communication data
    communication_logs: client.communication_logs || [],
    client_notes: client.client_notes || [],
    
    // Analytics
    renewal_frequency: client.renewal_frequency || 'New Customer',
    avg_monthly_spend: client.avg_monthly_spend || 0,
    loyalty_duration: client.loyalty_duration || 0,
    
    // Timestamps
    created_at: client.created_at,
    updated_at: client.updated_at,
    last_login: client.last_login
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
  if (!bytes) return 0;
  return parseFloat((bytes / (1024 ** 3)).toFixed(2));
};

export const formatCurrency = (amount, currency = 'KES') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Enhanced loyalty tier formatting
export const getLoyaltyTierColor = (tier, theme = 'light') => {
  const colors = {
    vip: theme === 'dark' ? 'text-purple-400 bg-purple-900/20' : 'text-purple-700 bg-purple-100',
    premium: theme === 'dark' ? 'text-yellow-400 bg-yellow-900/20' : 'text-yellow-700 bg-yellow-100',
    regular: theme === 'dark' ? 'text-blue-400 bg-blue-900/20' : 'text-blue-700 bg-blue-100',
    new: theme === 'dark' ? 'text-green-400 bg-green-900/20' : 'text-green-700 bg-green-100'
  };
  return colors[tier] || colors.new;
};

// Enhanced connection status formatting
export const getConnectionStatusColor = (isActive, theme = 'light') => {
  if (isActive) {
    return theme === 'dark' ? 'text-green-400 bg-green-900/20' : 'text-green-700 bg-green-100';
  }
  return theme === 'dark' ? 'text-red-400 bg-red-900/20' : 'text-red-700 bg-red-100';
};