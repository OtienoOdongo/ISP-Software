

// /**
//  * Formatting utilities for client data
//  */

// /**
//  * Format currency
//  */
// export const formatCurrency = (amount, currency = 'KES', decimals = 0) => {
//   if (amount === null || amount === undefined) return `${currency} 0`;
  
//   return new Intl.NumberFormat('en-KE', {
//     style: 'currency',
//     currency,
//     minimumFractionDigits: decimals,
//     maximumFractionDigits: decimals
//   }).format(amount);
// };

// /**
//  * Format date
//  */
// export const formatDate = (date, format = 'medium') => {
//   if (!date) return 'N/A';
  
//   const dateObj = new Date(date);
  
//   const formats = {
//     short: dateObj.toLocaleDateString('en-KE'),
//     medium: dateObj.toLocaleDateString('en-KE', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric'
//     }),
//     long: dateObj.toLocaleDateString('en-KE', {
//       weekday: 'long',
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric'
//     }),
//     datetime: dateObj.toLocaleString('en-KE', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     }),
//     dateOnly: dateObj.toISOString().split('T')[0]
//   };
  
//   return formats[format] || formats.medium;
// };

// /**
//  * Format phone number
//  */
// export const formatPhoneNumber = (phone) => {
//   if (!phone) return '';
  
//   // Remove non-numeric characters
//   const cleaned = phone.replace(/\D/g, '');
  
//   // Format Kenyan phone numbers
//   if (cleaned.length === 12 && cleaned.startsWith('254')) {
//     return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
//   }
  
//   if (cleaned.length === 10 && cleaned.startsWith('07')) {
//     return `+254 ${cleaned.slice(1, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
//   }
  
//   if (cleaned.length === 9) {
//     return `+254 ${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
//   }
  
//   return phone;
// };

// /**
//  * Format data size (GB/TB)
//  */
// export const formatDataSize = (gb, decimals = 1) => {
//   if (gb === null || gb === undefined) return '0 GB';
  
//   if (gb >= 1000) {
//     return `${(gb / 1000).toFixed(decimals)} TB`;
//   }
  
//   return `${gb.toFixed(decimals)} GB`;
// };

// /**
//  * Format percentage
//  */
// export const formatPercentage = (value, decimals = 1) => {
//   if (value === null || value === undefined) return '0%';
//   return `${value.toFixed(decimals)}%`;
// };

// /**
//  * Format client data from API
//  */
// export const formatClientData = (client) => {
//   if (!client) return null;
  
//   return {
//     ...client,
//     id: client.id,
//     username: client.username || 'N/A',
//     phone_display: formatPhoneNumber(client.phone_number),
//     lifetime_value_formatted: formatCurrency(client.lifetime_value),
//     monthly_revenue_formatted: formatCurrency(client.monthly_recurring_revenue),
//     total_data_used_formatted: formatDataSize(client.total_data_used_gb),
//     avg_monthly_data_formatted: formatDataSize(client.avg_monthly_data_gb),
//     customer_since_formatted: formatDate(client.customer_since, 'medium'),
//     last_login_formatted: formatDate(client.last_login_date, 'datetime'),
//     last_payment_formatted: formatDate(client.last_payment_date, 'medium'),
//     churn_risk_formatted: `${client.churn_risk_score?.toFixed(1)}/10`,
//     engagement_formatted: `${client.engagement_score?.toFixed(1)}/10`,
//     tier_display: client.tier?.charAt(0).toUpperCase() + client.tier?.slice(1),
//     status_display: client.status?.charAt(0).toUpperCase() + client.status?.slice(1),
//     connection_type_display: client.connection_type?.toUpperCase(),
//     revenue_segment_display: client.revenue_segment?.charAt(0).toUpperCase() + client.revenue_segment?.slice(1),
//     usage_pattern_display: client.usage_pattern?.charAt(0).toUpperCase() + client.usage_pattern?.slice(1),
//     is_at_risk: client.churn_risk_score >= 7,
//     is_high_value: ['high', 'premium'].includes(client.revenue_segment),
//     is_frequent_user: ['heavy', 'extreme'].includes(client.usage_pattern)
//   };
// };

// /**
//  * Format commission data
//  */
// export const formatCommissionData = (transaction) => {
//   if (!transaction) return null;
  
//   return {
//     ...transaction,
//     amount_formatted: formatCurrency(transaction.amount),
//     total_commission_formatted: formatCurrency(transaction.total_commission),
//     transaction_date_formatted: formatDate(transaction.transaction_date, 'datetime'),
//     due_date_formatted: formatDate(transaction.due_date, 'short'),
//     status_display: transaction.status?.charAt(0).toUpperCase() + transaction.status?.slice(1),
//     type_display: transaction.transaction_type?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
//   };
// };








/**
 * Formatting utilities for client data
 */

/**
 * Format currency
 */
export const formatCurrency = (amount, currency = 'KES', decimals = 0) => {
  if (amount === null || amount === undefined) return `${currency} 0`;
  
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(amount);
};

/**
 * Format date
 */
export const formatDate = (date, format = 'medium') => {
  if (!date) return 'N/A';
  
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return 'Invalid Date';
    
    const formats = {
      short: dateObj.toLocaleDateString('en-KE'),
      medium: dateObj.toLocaleDateString('en-KE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      long: dateObj.toLocaleDateString('en-KE', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      datetime: dateObj.toLocaleString('en-KE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      dateOnly: dateObj.toISOString().split('T')[0]
    };
    
    return formats[format] || formats.medium;
  } catch (e) {
    return 'Invalid Date';
  }
};

/**
 * Format phone number
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  
  // Remove non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format Kenyan phone numbers
  if (cleaned.length === 12 && cleaned.startsWith('254')) {
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
  }
  
  if (cleaned.length === 10 && cleaned.startsWith('07')) {
    return `+254 ${cleaned.slice(1, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }
  
  if (cleaned.length === 9) {
    return `+254 ${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }
  
  return phone;
};

/**
 * Format data size (GB/TB)
 */
export const formatDataSize = (gb, decimals = 1) => {
  if (gb === null || gb === undefined) return '0 GB';
  
  if (gb >= 1000) {
    return `${(gb / 1000).toFixed(decimals)} TB`;
  }
  
  return `${gb.toFixed(decimals)} GB`;
};

/**
 * Format percentage
 */
export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined) return '0%';
  return `${value.toFixed(decimals)}%`;
};

/**
 * Format client data from API
 */
export const formatClientData = (client) => {
  if (!client) return null;
  
  return {
    ...client,
    id: client.id,
    username: client.username || client.name || 'N/A',
    phone_display: formatPhoneNumber(client.phone_number),
    lifetime_value_formatted: formatCurrency(client.lifetime_value),
    monthly_revenue_formatted: formatCurrency(client.monthly_recurring_revenue),
    total_data_used_formatted: formatDataSize(client.total_data_used_gb),
    avg_monthly_data_formatted: formatDataSize(client.avg_monthly_data_gb),
    customer_since_formatted: formatDate(client.created_at || client.customer_since, 'medium'),
    last_login_formatted: formatDate(client.last_login_date, 'datetime'),
    last_payment_formatted: formatDate(client.last_payment_date, 'medium'),
    churn_risk_formatted: `${client.churn_risk_score?.toFixed(1)}/10`,
    engagement_formatted: `${client.engagement_score?.toFixed(1)}/10`,
    tier_display: client.tier?.charAt(0).toUpperCase() + client.tier?.slice(1)?.replace('_', ' ') || 'New',
    status_display: client.status?.charAt(0).toUpperCase() + client.status?.slice(1)?.replace('_', ' ') || 'Unknown',
    connection_type_display: client.connection_type?.toUpperCase() || 'N/A',
    revenue_segment_display: client.revenue_segment?.charAt(0).toUpperCase() + client.revenue_segment?.slice(1)?.replace('_', ' ') || 'Unknown',
    usage_pattern_display: client.usage_pattern?.charAt(0).toUpperCase() + client.usage_pattern?.slice(1)?.replace('_', ' ') || 'Unknown',
    is_at_risk: (client.churn_risk_score || 0) >= 7,
    is_high_value: ['high', 'premium'].includes(client.revenue_segment),
    is_frequent_user: ['heavy', 'extreme'].includes(client.usage_pattern)
  };
};

/**
 * Format commission data
 */
export const formatCommissionData = (transaction) => {
  if (!transaction) return null;
  
  return {
    ...transaction,
    amount_formatted: formatCurrency(transaction.amount),
    total_commission_formatted: formatCurrency(transaction.total_commission),
    transaction_date_formatted: formatDate(transaction.transaction_date || transaction.created_at, 'datetime'),
    due_date_formatted: formatDate(transaction.due_date, 'short'),
    status_display: transaction.status?.charAt(0).toUpperCase() + transaction.status?.slice(1)?.replace('_', ' ') || 'Pending',
    type_display: transaction.transaction_type?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  };
};