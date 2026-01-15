

// // dataTransformers.js
// import {
//   CLIENT_TIERS,
//   CLIENT_STATUS,
//   CONNECTION_TYPES,
//   REVENUE_SEGMENTS,
//   USAGE_PATTERNS
// } from "../constants/clientConstants"

// export const formatClientData = (backendData) => {
//   // Handle null/undefined data
//   if (!backendData) return null;
  
//   // Ensure we have an object
//   const data = backendData || {};
  
//   return {
//     // Basic Information
//     id: data.id,
//     username: data.username || 'N/A',
//     phone_number: data.phone_number,
//     phone_display: data.phone_display || data.phone_number || '',
//     is_active: data.is_active !== undefined ? data.is_active : true,
//     connection_type: data.connection_type || '',
//     connection_type_display: data.connection_type_display || CONNECTION_TYPES[data.connection_type] || data.connection_type || '',
//     client_name: data.client_name || data.username || 'N/A',
    
//     // PPPoE Credentials (admin only)
//     pppoe_username: data.pppoe_username,
//     pppoe_password: data.pppoe_password,
    
//     // Profile Information
//     client_type: data.client_type || 'residential',
//     status: data.status || 'active',
//     status_display: data.status_display || CLIENT_STATUS[data.status] || data.status || 'Active',
//     tier: data.tier || 'new',
//     tier_display: data.tier_display || CLIENT_TIERS[data.tier] || data.tier || 'New',
    
//     // Referral Information
//     referral_code: data.referral_code || '',
//     referred_by: data.referred_by,
//     referred_by_name: data.referred_by_name,
//     is_marketer: data.is_marketer || false,
//     marketer_tier: data.marketer_tier || 'novice',
//     referral_link: data.referral_link || '',
//     referral_count: data.referral_count || 0,
    
//     // Financial Information
//     lifetime_value: parseFloat(data.lifetime_value || 0),
//     lifetime_value_formatted: data.lifetime_value_formatted || 'KES 0.00',
//     monthly_recurring_revenue: parseFloat(data.monthly_recurring_revenue || 0),
//     monthly_revenue_formatted: data.monthly_revenue_formatted || 'KES 0.00',
//     total_revenue: parseFloat(data.total_revenue || 0),
//     avg_monthly_spend: parseFloat(data.avg_monthly_spend || 0),
//     avg_monthly_spend_formatted: data.avg_monthly_spend_formatted || 'KES 0.00',
//     commission_rate: parseFloat(data.commission_rate || 0),
//     commission_balance: parseFloat(data.commission_balance || 0),
//     commission_balance_formatted: data.commission_balance_formatted || 'KES 0.00',
//     total_commission_earned: parseFloat(data.total_commission_earned || 0),
//     total_commission_formatted: data.total_commission_formatted || 'KES 0.00',
    
//     // Usage Information
//     total_data_used_gb: parseFloat(data.total_data_used_gb || 0),
//     total_data_used_formatted: data.total_data_used_formatted || '0 GB',
//     avg_monthly_data_gb: parseFloat(data.avg_monthly_data_gb || 0),
//     avg_monthly_data_formatted: data.avg_monthly_data_formatted || '0 GB',
//     peak_usage_hour: data.peak_usage_hour,
    
//     // Hotspot Specific
//     hotspot_sessions: data.hotspot_sessions || 0,
//     hotspot_conversion_rate: parseFloat(data.hotspot_conversion_rate || 0),
//     payment_abandonment_rate: parseFloat(data.payment_abandonment_rate || 0),
    
//     // Behavioral Metrics
//     churn_risk_score: parseFloat(data.churn_risk_score || 0),
//     engagement_score: parseFloat(data.engagement_score || 0),
//     satisfaction_score: parseFloat(data.satisfaction_score || 0),
//     renewal_rate: parseFloat(data.renewal_rate || 0),
//     days_since_last_payment: data.days_since_last_payment || 0,
    
//     // Classification
//     is_high_value: data.is_high_value || false,
//     is_frequent_user: data.is_frequent_user || false,
//     is_at_risk: data.is_at_risk || false,
//     is_hotspot_abandoner: data.is_hotspot_abandoner || false,
//     needs_attention: data.needs_attention || false,
//     risk_level: data.risk_level || 'Low',
    
//     behavior_tags: Array.isArray(data.behavior_tags) ? data.behavior_tags : [],
//     revenue_segment: data.revenue_segment || 'low',
//     revenue_segment_display: data.revenue_segment_display || REVENUE_SEGMENTS[data.revenue_segment] || data.revenue_segment || 'Low',
//     usage_pattern: data.usage_pattern || 'casual',
//     usage_pattern_display: data.usage_pattern_display || USAGE_PATTERNS[data.usage_pattern] || data.usage_pattern || 'Casual',
    
//     // Preferences
//     preferred_payment_method: data.preferred_payment_method || 'mpesa',
//     notification_preferences: data.notification_preferences || {},
//     communication_preferences: data.communication_preferences || {},
    
//     // Insights
//     insights: Array.isArray(data.insights) ? data.insights : [],
//     recommendations: Array.isArray(data.recommendations) ? data.recommendations : [],
//     next_best_offer: data.next_best_offer || {},
    
//     // Timestamps
//     customer_since: data.customer_since,
//     customer_since_formatted: data.customer_since_formatted,
//     last_payment_date: data.last_payment_date,
//     last_payment_formatted: data.last_payment_formatted,
//     last_usage_date: data.last_usage_date,
//     last_login_date: data.last_login_date,
//     last_login_formatted: data.last_login_formatted,
//     next_payment_due: data.next_payment_due,
//     tier_upgraded_at: data.tier_upgraded_at,
//     days_active: data.days_active || 0,
    
//     // Device Information
//     primary_device: data.primary_device || 'android',
//     devices_count: data.devices_count || 1,
//     location: data.location || {},
    
//     // Quick Stats
//     quick_stats: data.quick_stats || {},
//     recent_interactions: Array.isArray(data.recent_interactions) ? data.recent_interactions : [],
//     commission_history: Array.isArray(data.commission_history) ? data.commission_history : [],
    
//     // Actions
//     available_actions: Array.isArray(data.available_actions) ? data.available_actions : [],
    
//     // Metadata
//     metadata: data.metadata || {},
//     flags: Array.isArray(data.flags) ? data.flags : [],
    
//     created_at: data.created_at,
//     updated_at: data.updated_at,
    
//     // Service Operations Integration (Added from my version)
//     current_plan: data.current_plan || null,
//     plan_history: Array.isArray(data.plan_history) ? data.plan_history : [],
//     available_plans: Array.isArray(data.available_plans) ? data.available_plans : [],
//     subscription_status: data.subscription_status || {},
//     data_usage_details: data.data_usage_details || {}
//   };
// };

// // Keep your existing functions
// export const calculateMetrics = (client) => {
//   const metrics = {
//     // Financial Health Score (0-100)
//     financial_health: Math.min(100, (client.lifetime_value / 10000) * 100),
    
//     // Usage Score (0-100)
//     usage_score: Math.min(100, (client.avg_monthly_data_gb / 200) * 100),
    
//     // Retention Score (0-100)
//     retention_score: Math.min(100, client.renewal_rate),
    
//     // Engagement Score (0-100)
//     engagement_score: client.engagement_score * 10,
    
//     // Overall Score (weighted average)
//     overall_score: (
//       (client.engagement_score * 10 * 0.3) +
//       (Math.min(100, client.renewal_rate) * 0.3) +
//       (Math.min(100, (client.lifetime_value / 10000) * 100) * 0.2) +
//       (Math.min(100, (client.avg_monthly_data_gb / 200) * 100) * 0.2)
//     )
//   };
  
//   return metrics;
// };

// export const groupClientsBySegment = (clients) => {
//   return clients.reduce((acc, client) => {
//     const segment = client.revenue_segment || 'unknown';
//     if (!acc[segment]) {
//       acc[segment] = [];
//     }
//     acc[segment].push(client);
//     return acc;
//   }, {});
// };

// export const filterClients = (clients, filters) => {
//   return clients.filter(client => {
//     // Search filter
//     if (filters.search) {
//       const searchLower = filters.search.toLowerCase();
//       const searchFields = [
//         client.username,
//         client.phone_number,
//         client.client_name,
//         client.referral_code
//       ];
      
//       if (!searchFields.some(field => 
//         field && field.toString().toLowerCase().includes(searchLower)
//       )) {
//         return false;
//       }
//     }

//     // Connection type filter
//     if (filters.connection_type !== 'all' && 
//         client.connection_type !== filters.connection_type) {
//       return false;
//     }

//     // Status filter
//     if (filters.status !== 'all' && 
//         client.status !== filters.status) {
//       return false;
//     }

//     // Tier filter
//     if (filters.tier !== 'all' && 
//         client.tier !== filters.tier) {
//       return false;
//     }

//     // Revenue segment filter
//     if (filters.revenue_segment !== 'all' && 
//         client.revenue_segment !== filters.revenue_segment) {
//       return false;
//     }

//     // At-risk filter
//     if (filters.at_risk === 'true' && !client.is_at_risk) {
//       return false;
//     } else if (filters.at_risk === 'false' && client.is_at_risk) {
//       return false;
//     }

//     // Needs attention filter
//     if (filters.needs_attention === 'true' && !client.needs_attention) {
//       return false;
//     } else if (filters.needs_attention === 'false' && client.needs_attention) {
//       return false;
//     }

//     // Date range filter
//     if (filters.date_from && client.created_at) {
//       const clientDate = new Date(client.created_at);
//       const filterDate = new Date(filters.date_from);
//       if (clientDate < filterDate) return false;
//     }

//     if (filters.date_to && client.created_at) {
//       const clientDate = new Date(client.created_at);
//       const filterDate = new Date(filters.date_to);
//       if (clientDate > filterDate) return false;
//     }

//     // Revenue range filter
//     if (filters.min_revenue && client.lifetime_value < parseFloat(filters.min_revenue)) {
//       return false;
//     }

//     if (filters.max_revenue && client.lifetime_value > parseFloat(filters.max_revenue)) {
//       return false;
//     }

//     return true;
//   });
// };

// export const sortClients = (clients, sortBy, sortOrder = 'desc') => {
//   const sorted = [...clients];
  
//   sorted.sort((a, b) => {
//     let aValue, bValue;
    
//     switch (sortBy) {
//       case 'username':
//         aValue = a.username?.toLowerCase() || '';
//         bValue = b.username?.toLowerCase() || '';
//         break;
//       case 'lifetime_value':
//         aValue = a.lifetime_value || 0;
//         bValue = b.lifetime_value || 0;
//         break;
//       case 'churn_risk':
//         aValue = a.churn_risk_score || 0;
//         bValue = b.churn_risk_score || 0;
//         break;
//       case 'created_at':
//         aValue = new Date(a.created_at || 0);
//         bValue = new Date(b.created_at || 0);
//         break;
//       default:
//         aValue = a[sortBy] || '';
//         bValue = b[sortBy] || '';
//     }
    
//     if (sortOrder === 'desc') {
//       return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
//     } else {
//       return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
//     }
//   });
  
//   return sorted;
// };

// // Add the utility functions from my version that you might need
// export const formatPhoneNumber = (phone) => {
//   if (!phone) return '';
  
//   const cleaned = phone.replace(/\D/g, '');
  
//   if (cleaned.length === 10) {
//     return `+254${cleaned.substring(1)}`;
//   } else if (cleaned.length === 12 && cleaned.startsWith('254')) {
//     return `+${cleaned}`;
//   } else if (cleaned.length === 9 && cleaned.startsWith('7')) {
//     return `+254${cleaned}`;
//   }
  
//   return phone;
// };

// export const formatCurrency = (amount, currency = 'KES') => {
//   const numAmount = parseFloat(amount || 0);
  
//   if (isNaN(numAmount)) return `${currency} 0.00`;
  
//   return `${currency} ${numAmount.toLocaleString('en-KE', {
//     minimumFractionDigits: 2,
//     maximumFractionDigits: 2
//   })}`;
// };

// export const formatDate = (dateString, format = 'short') => {
//   if (!dateString) return 'N/A';
  
//   try {
//     const date = new Date(dateString);
    
//     if (isNaN(date.getTime())) return 'Invalid date';
    
//     if (format === 'short') {
//       return date.toLocaleDateString('en-KE', {
//         year: 'numeric',
//         month: 'short',
//         day: 'numeric'
//       });
//     } else if (format === 'long') {
//       return date.toLocaleDateString('en-KE', {
//         year: 'numeric',
//         month: 'long',
//         day: 'numeric',
//         hour: '2-digit',
//         minute: '2-digit'
//       });
//     }
    
//     return date.toISOString().split('T')[0];
//   } catch (error) {
//     console.error('Error formatting date:', error);
//     return 'Invalid date';
//   }
// };

// export const getRiskLevel = (score) => {
//   const numScore = parseFloat(score || 0);
  
//   if (numScore >= 7.0) return 'High';
//   if (numScore >= 4.0) return 'Medium';
//   return 'Low';
// };








// utils/dataTransformers.js
import {
  CLIENT_TIERS,
  CLIENT_STATUS,
  CONNECTION_TYPES,
  REVENUE_SEGMENTS,
  USAGE_PATTERNS
} from "../constants/clientConstants";
import { formatPhoneNumber, formatCurrency, formatDate } from './formatter'; // Import from formatter.js for consistency

export const formatClientData = (backendData) => {
  // Handle null/undefined data
  if (!backendData) return null;
  
  // Ensure we have an object
  const data = backendData || {};
  
  return {
    // Basic Information
    id: data.id,
    username: data.username || 'N/A',
    phone_number: data.phone_number,
    phone_display: data.phone_display || formatPhoneNumber(data.phone_number) || '',
    is_active: data.is_active !== undefined ? data.is_active : true,
    connection_type: data.connection_type || '',
    connection_type_display: data.connection_type_display || CONNECTION_TYPES[data.connection_type] || data.connection_type || '',
    client_name: data.client_name || data.username || 'N/A',
    
    // PPPoE Credentials (admin only)
    pppoe_username: data.pppoe_username,
    pppoe_password: data.pppoe_password,
    
    // Profile Information
    client_type: data.client_type || 'residential',
    status: data.status || 'active',
    status_display: data.status_display || CLIENT_STATUS[data.status] || data.status || 'Active',
    tier: data.tier || 'new',
    tier_display: data.tier_display || CLIENT_TIERS[data.tier] || data.tier || 'New',
    
    // Referral Information
    referral_code: data.referral_code || '',
    referred_by: data.referred_by,
    referred_by_name: data.referred_by_name,
    is_marketer: data.is_marketer || false,
    marketer_tier: data.marketer_tier || 'novice',
    referral_link: data.referral_link || '',
    referral_count: data.referral_count || 0,
    
    // Financial Information
    lifetime_value: parseFloat(data.lifetime_value || 0),
    lifetime_value_formatted: data.lifetime_value_formatted || formatCurrency(data.lifetime_value || 0, 'KES'),
    monthly_recurring_revenue: parseFloat(data.monthly_recurring_revenue || 0),
    monthly_revenue_formatted: data.monthly_revenue_formatted || formatCurrency(data.monthly_recurring_revenue || 0, 'KES'),
    total_revenue: parseFloat(data.total_revenue || 0),
    avg_monthly_spend: parseFloat(data.avg_monthly_spend || 0),
    avg_monthly_spend_formatted: data.avg_monthly_spend_formatted || formatCurrency(data.avg_monthly_spend || 0, 'KES'),
    commission_rate: parseFloat(data.commission_rate || 0),
    commission_balance: parseFloat(data.commission_balance || 0),
    commission_balance_formatted: data.commission_balance_formatted || formatCurrency(data.commission_balance || 0, 'KES'),
    total_commission_earned: parseFloat(data.total_commission_earned || 0),
    total_commission_formatted: data.total_commission_formatted || formatCurrency(data.total_commission_earned || 0, 'KES'),
    
    // Usage Information
    total_data_used_gb: parseFloat(data.total_data_used_gb || 0),
    total_data_used_formatted: data.total_data_used_formatted || '0 GB',
    avg_monthly_data_gb: parseFloat(data.avg_monthly_data_gb || 0),
    avg_monthly_data_formatted: data.avg_monthly_data_formatted || '0 GB',
    peak_usage_hour: data.peak_usage_hour,
    
    // Hotspot Specific
    hotspot_sessions: data.hotspot_sessions || 0,
    hotspot_conversion_rate: parseFloat(data.hotspot_conversion_rate || 0),
    payment_abandonment_rate: parseFloat(data.payment_abandonment_rate || 0),
    
    // Behavioral Metrics
    churn_risk_score: parseFloat(data.churn_risk_score || 0),
    engagement_score: parseFloat(data.engagement_score || 0),
    satisfaction_score: parseFloat(data.satisfaction_score || 0),
    renewal_rate: parseFloat(data.renewal_rate || 0),
    days_since_last_payment: data.days_since_last_payment || 0,
    
    // Classification
    is_high_value: data.is_high_value || false,
    is_frequent_user: data.is_frequent_user || false,
    is_at_risk: data.is_at_risk || false,
    is_hotspot_abandoner: data.is_hotspot_abandoner || false,
    needs_attention: data.needs_attention || false,
    risk_level: data.risk_level || 'Low',
    
    behavior_tags: Array.isArray(data.behavior_tags) ? data.behavior_tags : [],
    revenue_segment: data.revenue_segment || 'low',
    revenue_segment_display: data.revenue_segment_display || REVENUE_SEGMENTS[data.revenue_segment] || data.revenue_segment || 'Low',
    usage_pattern: data.usage_pattern || 'casual',
    usage_pattern_display: data.usage_pattern_display || USAGE_PATTERNS[data.usage_pattern] || data.usage_pattern || 'Casual',
    
    // Preferences
    preferred_payment_method: data.preferred_payment_method || 'mpesa',
    notification_preferences: data.notification_preferences || {},
    communication_preferences: data.communication_preferences || {},
    
    // Insights
    insights: Array.isArray(data.insights) ? data.insights : [],
    recommendations: Array.isArray(data.recommendations) ? data.recommendations : [],
    next_best_offer: data.next_best_offer || {},
    
    // Timestamps
    customer_since: data.customer_since,
    customer_since_formatted: formatDate(data.customer_since, 'short'),
    last_payment_date: data.last_payment_date,
    last_payment_formatted: formatDate(data.last_payment_date, 'short'),
    last_usage_date: data.last_usage_date,
    last_login_date: data.last_login_date,
    last_login_formatted: formatDate(data.last_login_date, 'short'),
    next_payment_due: data.next_payment_due,
    tier_upgraded_at: data.tier_upgraded_at,
    days_active: data.days_active || 0,
    
    // Device Information
    primary_device: data.primary_device || 'android',
    devices_count: data.devices_count || 1,
    location: data.location || {},
    
    // Quick Stats
    quick_stats: data.quick_stats || {},
    recent_interactions: Array.isArray(data.recent_interactions) ? data.recent_interactions : [],
    commission_history: Array.isArray(data.commission_history) ? data.commission_history : [],
    
    // Actions
    available_actions: Array.isArray(data.available_actions) ? data.available_actions : [],
    
    // Metadata
    metadata: data.metadata || {},
    flags: Array.isArray(data.flags) ? data.flags : [],
    
    created_at: data.created_at,
    updated_at: data.updated_at,
    
    // Service Operations Integration (Added from my version)
    current_plan: data.current_plan || null,
    plan_history: Array.isArray(data.plan_history) ? data.plan_history : [],
    available_plans: Array.isArray(data.available_plans) ? data.available_plans : [],
    subscription_status: data.subscription_status || {},
    data_usage_details: data.data_usage_details || {}
  };
};

// Updated calculateMetrics with better algorithm (weighted average with normalization)
export const calculateMetrics = (client) => {
  const metrics = {
    // Financial Health Score (0-100): Normalized lifetime value
    financial_health: Math.min(100, (client.lifetime_value / 10000) * 100), // Assume 10,000 as max for normalization
    
    // Usage Score (0-100): Normalized monthly data
    usage_score: Math.min(100, (client.avg_monthly_data_gb / 200) * 100), // Assume 200GB as high usage threshold
    
    // Retention Score (0-100): Inverted churn risk
    retention_score: Math.min(100, client.renewal_rate || (100 - (client.churn_risk_score * 10))),
    
    // Engagement Score (0-100): Direct scale
    engagement_score: client.engagement_score * 10,
    
    // Overall Score: Weighted average (30% financial, 25% usage, 25% retention, 20% engagement)
    overall_score: (
      (metrics.financial_health * 0.3) +
      (metrics.usage_score * 0.25) +
      (metrics.retention_score * 0.25) +
      (metrics.engagement_score * 0.2)
    )
  };
  
  return metrics;
};

export const groupClientsBy = (clients, property) => {
  return clients.reduce((acc, client) => {
    const key = client[property] || 'unknown';
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(client);
    return acc;
  }, {});
};

export const getRiskLevel = (score) => {
  const numScore = parseFloat(score || 0);
  
  if (numScore >= 7.0) return 'High';
  if (numScore >= 4.0) return 'Medium';
  return 'Low';
};