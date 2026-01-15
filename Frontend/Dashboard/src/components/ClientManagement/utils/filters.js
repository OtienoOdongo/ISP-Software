// // Client filtering utilities
// export const filterClients = (clients, filters) => {
//   return clients.filter(client => {
//     // Search filter
//     if (filters.search) {
//       const searchLower = filters.search.toLowerCase();
//       const searchFields = [
//         client.username,
//         client.phone_number,
//         client.client_name,
//         client.referral_code,
       
//       ];
      
//       const matchesSearch = searchFields.some(field => 
//         field && field.toString().toLowerCase().includes(searchLower)
//       );
      
//       if (!matchesSearch) return false;
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

//     // Usage pattern filter
//     if (filters.usage_pattern !== 'all' && 
//         client.usage_pattern !== filters.usage_pattern) {
//       return false;
//     }

//     // Marketer filter
//     if (filters.is_marketer !== 'all') {
//       const isMarketer = filters.is_marketer === 'true';
//       if (client.is_marketer !== isMarketer) return false;
//     }

//     // At-risk filter
//     if (filters.at_risk !== 'all') {
//       const atRisk = filters.at_risk === 'true';
//       if (client.is_at_risk !== atRisk) return false;
//     }

//     // Needs attention filter
//     if (filters.needs_attention !== 'all') {
//       const needsAttention = filters.needs_attention === 'true';
//       if (client.needs_attention !== needsAttention) return false;
//     }

//     // Date range filters
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

//     // Revenue range filters
//     if (filters.min_revenue && client.lifetime_value < parseFloat(filters.min_revenue)) {
//       return false;
//     }

//     if (filters.max_revenue && client.lifetime_value > parseFloat(filters.max_revenue)) {
//       return false;
//     }

//     // Device filter
//     if (filters.device && filters.device !== 'all' && 
//         client.primary_device !== filters.device) {
//       return false;
//     }

//     // Payment method filter
//     if (filters.payment_method && filters.payment_method !== 'all' && 
//         client.preferred_payment_method !== filters.payment_method) {
//       return false;
//     }

//     // Behavior tags filter
//     if (filters.tags && filters.tags.length > 0) {
//       const clientTags = client.behavior_tags || [];
//       const hasAllTags = filters.tags.every(tag => clientTags.includes(tag));
//       if (!hasAllTags) return false;
//     }

//     return true;
//   });
// };

// // Sort clients
// export const sortClients = (clients, sortBy = '-created_at', sortOrder) => {
//   const sorted = [...clients];
  
//   // If sortOrder is provided, override sortBy logic
//   if (sortOrder) {
//     sorted.sort((a, b) => {
//       let aValue, bValue;
      
//       // Remove '-' prefix if present for sorting logic
//       const sortField = sortBy.startsWith('-') ? sortBy.substring(1) : sortBy;
      
//       switch (sortField) {
//         case 'username':
//           aValue = a.username?.toLowerCase() || '';
//           bValue = b.username?.toLowerCase() || '';
//           break;
//         case 'lifetime_value':
//           aValue = a.lifetime_value || 0;
//           bValue = b.lifetime_value || 0;
//           break;
//         case 'churn_risk_score':
//           aValue = a.churn_risk_score || 0;
//           bValue = b.churn_risk_score || 0;
//           break;
//         case 'engagement_score':
//           aValue = a.engagement_score || 0;
//           bValue = b.engagement_score || 0;
//           break;
//         case 'created_at':
//           aValue = new Date(a.created_at || 0);
//           bValue = new Date(b.created_at || 0);
//           break;
//         case 'last_payment_date':
//           aValue = new Date(a.last_payment_date || 0);
//           bValue = new Date(b.last_payment_date || 0);
//           break;
//         case 'total_data_used_gb':
//           aValue = a.total_data_used_gb || 0;
//           bValue = b.total_data_used_gb || 0;
//           break;
//         case 'monthly_recurring_revenue':
//           aValue = a.monthly_recurring_revenue || 0;
//           bValue = b.monthly_recurring_revenue || 0;
//           break;
//         default:
//           aValue = a[sortField] || '';
//           bValue = b[sortField] || '';
//       }
      
//       if (sortOrder === 'desc') {
//         return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
//       } else {
//         return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
//       }
//     });
//   } else {
//     // Use sortBy string directly
//     sorted.sort((a, b) => {
//       const isDesc = sortBy.startsWith('-');
//       const field = isDesc ? sortBy.substring(1) : sortBy;
      
//       let aValue, bValue;
      
//       switch (field) {
//         case 'username':
//           aValue = a.username?.toLowerCase() || '';
//           bValue = b.username?.toLowerCase() || '';
//           break;
//         case 'lifetime_value':
//           aValue = a.lifetime_value || 0;
//           bValue = b.lifetime_value || 0;
//           break;
//         case 'churn_risk_score':
//           aValue = a.churn_risk_score || 0;
//           bValue = b.churn_risk_score || 0;
//           break;
//         case 'created_at':
//           aValue = new Date(a.created_at || 0);
//           bValue = new Date(b.created_at || 0);
//           break;
//         default:
//           aValue = a[field] || '';
//           bValue = b[field] || '';
//       }
      
//       if (isDesc) {
//         return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
//       } else {
//         return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
//       }
//     });
//   }
  
//   return sorted;
// };

// // Filter transactions
// export const filterTransactions = (transactions, filters) => {
//   return transactions.filter(transaction => {
//     // Status filter
//     if (filters.status && filters.status !== 'all' && 
//         transaction.status !== filters.status) {
//       return false;
//     }

//     // Type filter
//     if (filters.transaction_type && filters.transaction_type !== 'all' && 
//         transaction.transaction_type !== filters.transaction_type) {
//       return false;
//     }

//     // Date range filters
//     if (filters.date_from && transaction.transaction_date) {
//       const transactionDate = new Date(transaction.transaction_date);
//       const filterDate = new Date(filters.date_from);
//       if (transactionDate < filterDate) return false;
//     }

//     if (filters.date_to && transaction.transaction_date) {
//       const transactionDate = new Date(transaction.transaction_date);
//       const filterDate = new Date(filters.date_to);
//       if (transactionDate > filterDate) return false;
//     }

//     // Amount range filters
//     if (filters.min_amount && transaction.amount < parseFloat(filters.min_amount)) {
//       return false;
//     }

//     if (filters.max_amount && transaction.amount > parseFloat(filters.max_amount)) {
//       return false;
//     }

//     // Marketer filter
//     if (filters.marketer_id && transaction.marketer_id !== filters.marketer_id) {
//       return false;
//     }

//     // Search filter
//     if (filters.search) {
//       const searchLower = filters.search.toLowerCase();
//       const searchFields = [
//         transaction.reference_id,
//         transaction.description,
//         transaction.marketer_name,
//         transaction.payment_reference
//       ];
      
//       const matchesSearch = searchFields.some(field => 
//         field && field.toString().toLowerCase().includes(searchLower)
//       );
      
//       if (!matchesSearch) return false;
//     }

//     return true;
//   });
// };

// // Filter interactions
// export const filterInteractions = (interactions, filters) => {
//   return interactions.filter(interaction => {
//     // Type filter
//     if (filters.interaction_type && filters.interaction_type !== 'all' && 
//         interaction.interaction_type !== filters.interaction_type) {
//       return false;
//     }

//     // Outcome filter
//     if (filters.outcome && filters.outcome !== 'all' && 
//         interaction.outcome !== filters.outcome) {
//       return false;
//     }

//     // Date range filters
//     if (filters.date_from && interaction.started_at) {
//       const interactionDate = new Date(interaction.started_at);
//       const filterDate = new Date(filters.date_from);
//       if (interactionDate < filterDate) return false;
//     }

//     if (filters.date_to && interaction.started_at) {
//       const interactionDate = new Date(interaction.started_at);
//       const filterDate = new Date(filters.date_to);
//       if (interactionDate > filterDate) return false;
//     }

//     // Hotspot filter
//     if (filters.is_hotspot !== undefined) {
//       if (interaction.is_hotspot !== filters.is_hotspot) return false;
//     }

//     // Conversion filter
//     if (filters.converted_to_purchase !== undefined) {
//       if (interaction.converted_to_purchase !== filters.converted_to_purchase) return false;
//     }

//     // Search filter
//     if (filters.search) {
//       const searchLower = filters.search.toLowerCase();
//       const searchFields = [
//         interaction.action,
//         interaction.description,
//         interaction.client_name
//       ];
      
//       const matchesSearch = searchFields.some(field => 
//         field && field.toString().toLowerCase().includes(searchLower)
//       );
      
//       if (!matchesSearch) return false;
//     }

//     return true;
//   });
// };

// // Group clients by property
// export const groupClientsBy = (clients, property) => {
//   return clients.reduce((groups, client) => {
//     const key = client[property] || 'unknown';
//     if (!groups[key]) {
//       groups[key] = [];
//     }
//     groups[key].push(client);
//     return groups;
//   }, {});
// };

// // Calculate statistics from filtered data
// export const calculateStats = (clients) => {
//   if (!clients || clients.length === 0) {
//     return {
//       total: 0,
//       active: 0,
//       atRisk: 0,
//       totalRevenue: 0,
//       avgRevenue: 0,
//       avgChurnRisk: 0,
//       avgEngagement: 0,
//       connectionTypes: {},
//       tiers: {},
//       segments: {}
//     };
//   }

//   const stats = {
//     total: clients.length,
//     active: clients.filter(c => c.status === 'active').length,
//     atRisk: clients.filter(c => c.is_at_risk).length,
//     totalRevenue: clients.reduce((sum, c) => sum + (c.lifetime_value || 0), 0),
//     avgRevenue: 0,
//     avgChurnRisk: 0,
//     avgEngagement: 0,
//     connectionTypes: {},
//     tiers: {},
//     segments: {},
//     usagePatterns: {}
//   };

//   // Calculate averages
//   const totalChurnRisk = clients.reduce((sum, c) => sum + (c.churn_risk_score || 0), 0);
//   const totalEngagement = clients.reduce((sum, c) => sum + (c.engagement_score || 0), 0);
  
//   stats.avgRevenue = stats.totalRevenue / stats.total;
//   stats.avgChurnRisk = totalChurnRisk / stats.total;
//   stats.avgEngagement = totalEngagement / stats.total;

//   // Calculate distributions
//   clients.forEach(client => {
//     // Connection types
//     const connType = client.connection_type || 'unknown';
//     stats.connectionTypes[connType] = (stats.connectionTypes[connType] || 0) + 1;

//     // Tiers
//     const tier = client.tier || 'unknown';
//     stats.tiers[tier] = (stats.tiers[tier] || 0) + 1;

//     // Revenue segments
//     const segment = client.revenue_segment || 'unknown';
//     stats.segments[segment] = (stats.segments[segment] || 0) + 1;

//     // Usage patterns
//     const pattern = client.usage_pattern || 'unknown';
//     stats.usagePatterns[pattern] = (stats.usagePatterns[pattern] || 0) + 1;
//   });

//   return stats;
// };

// // Generate filter options from data
// export const generateFilterOptions = (clients) => {
//   const options = {
//     connection_types: new Set(),
//     tiers: new Set(),
//     revenue_segments: new Set(),
//     usage_patterns: new Set(),
//     devices: new Set(),
//     payment_methods: new Set()
//   };

//   clients.forEach(client => {
//     if (client.connection_type) options.connection_types.add(client.connection_type);
//     if (client.tier) options.tiers.add(client.tier);
//     if (client.revenue_segment) options.revenue_segments.add(client.revenue_segment);
//     if (client.usage_pattern) options.usage_patterns.add(client.usage_pattern);
//     if (client.primary_device) options.devices.add(client.primary_device);
//     if (client.preferred_payment_method) options.payment_methods.add(client.preferred_payment_method);
//   });

//   // Convert sets to arrays and sort
//   return {
//     connection_types: Array.from(options.connection_types).sort(),
//     tiers: Array.from(options.tiers).sort(),
//     revenue_segments: Array.from(options.revenue_segments).sort(),
//     usage_patterns: Array.from(options.usage_patterns).sort(),
//     devices: Array.from(options.devices).sort(),
//     payment_methods: Array.from(options.payment_methods).sort()
//   };
// };

// // Debounce function for search
// export const debounce = (func, wait) => {
//   let timeout;
//   return function executedFunction(...args) {
//     const later = () => {
//       clearTimeout(timeout);
//       func(...args);
//     };
//     clearTimeout(timeout);
//     timeout = setTimeout(later, wait);
//   };
// };

// // Throttle function for scroll/resize events
// export const throttle = (func, limit) => {
//   let inThrottle;
//   return function(...args) {
//     if (!inThrottle) {
//       func.apply(this, args);
//       inThrottle = true;
//       setTimeout(() => inThrottle = false, limit);
//     }
//   };
// };

// // Export all filters
// export default {
//   filterClients,
//   sortClients,
//   filterTransactions,
//   filterInteractions,
//   groupClientsBy,
//   calculateStats,
//   generateFilterOptions,
//   debounce,
//   throttle
// };









// utils/filter.js
export const filterClients = (clients, filters) => {
  return clients.filter(client => {
    // Search filter (multi-field)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const searchFields = [
        client.username,
        client.phone_number,
        client.client_name,
        client.referral_code
      ];
      if (!searchFields.some(field => field && field.toString().toLowerCase().includes(searchLower))) {
        return false;
      }
    }

    // Connection type
    if (filters.connection_type !== 'all' && client.connection_type !== filters.connection_type) return false;

    // Status
    if (filters.status !== 'all' && client.status !== filters.status) return false;

    // Tier
    if (filters.tier !== 'all' && client.tier !== filters.tier) return false;

    // Revenue segment
    if (filters.revenue_segment !== 'all' && client.revenue_segment !== filters.revenue_segment) return false;

    // Usage pattern
    if (filters.usage_pattern !== 'all' && client.usage_pattern !== filters.usage_pattern) return false;

    // Is marketer
    if (filters.is_marketer !== 'all') {
      const isMarketer = filters.is_marketer === 'true';
      if (client.is_marketer !== isMarketer) return false;
    }

    // At risk
    if (filters.at_risk !== 'all') {
      const atRisk = filters.at_risk === 'true';
      if (client.is_at_risk !== atRisk) return false;
    }

    // Needs attention
    if (filters.needs_attention !== 'all') {
      const needsAttention = filters.needs_attention === 'true';
      if (client.needs_attention !== needsAttention) return false;
    }

    // Date range (safe parsing)
    if (filters.date_from && client.created_at) {
      const clientDate = new Date(client.created_at);
      const filterDate = new Date(filters.date_from);
      if (isNaN(clientDate) || clientDate < filterDate) return false;
    }
    if (filters.date_to && client.created_at) {
      const clientDate = new Date(client.created_at);
      const filterDate = new Date(filters.date_to);
      if (isNaN(clientDate) || clientDate > filterDate) return false;
    }

    // Revenue range
    if (filters.min_revenue && client.lifetime_value < parseFloat(filters.min_revenue)) return false;
    if (filters.max_revenue && client.lifetime_value > parseFloat(filters.max_revenue)) return false;

    // Tags (all must match)
    if (filters.tags && filters.tags.length > 0) {
      const clientTags = client.behavior_tags || [];
      if (!filters.tags.every(tag => clientTags.includes(tag))) return false;
    }

    return true;
  });
};

export const sortClients = (clients, sortBy = '-created_at', sortOrder) => {
  const sorted = [...clients];
  
  // If sortOrder is provided, override sortBy logic
  if (sortOrder) {
    sorted.sort((a, b) => {
      let aValue, bValue;
      
      // Remove '-' prefix if present for sorting logic
      const sortField = sortBy.startsWith('-') ? sortBy.substring(1) : sortBy;
      
      switch (sortField) {
        case 'username':
          aValue = a.username?.toLowerCase() || '';
          bValue = b.username?.toLowerCase() || '';
          break;
        case 'lifetime_value':
          aValue = a.lifetime_value || 0;
          bValue = b.lifetime_value || 0;
          break;
        case 'churn_risk_score':
          aValue = a.churn_risk_score || 0;
          bValue = b.churn_risk_score || 0;
          break;
        case 'engagement_score':
          aValue = a.engagement_score || 0;
          bValue = b.engagement_score || 0;
          break;
        case 'created_at':
          aValue = new Date(a.created_at || 0);
          bValue = new Date(b.created_at || 0);
          break;
        case 'last_payment_date':
          aValue = new Date(a.last_payment_date || 0);
          bValue = new Date(b.last_payment_date || 0);
          break;
        case 'total_data_used_gb':
          aValue = a.total_data_used_gb || 0;
          bValue = b.total_data_used_gb || 0;
          break;
        case 'monthly_recurring_revenue':
          aValue = a.monthly_recurring_revenue || 0;
          bValue = b.monthly_recurring_revenue || 0;
          break;
        default:
          aValue = a[sortField] || '';
          bValue = b[sortField] || '';
      }
      
      if (sortOrder === 'desc') {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      } else {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      }
    });
  } else {
    // Use sortBy string directly
    sorted.sort((a, b) => {
      const isDesc = sortBy.startsWith('-');
      const field = isDesc ? sortBy.substring(1) : sortBy;
      
      let aValue, bValue;
      
      switch (field) {
        case 'username':
          aValue = a.username?.toLowerCase() || '';
          bValue = b.username?.toLowerCase() || '';
          break;
        case 'lifetime_value':
          aValue = a.lifetime_value || 0;
          bValue = b.lifetime_value || 0;
          break;
        case 'churn_risk_score':
          aValue = a.churn_risk_score || 0;
          bValue = b.churn_risk_score || 0;
          break;
        case 'created_at':
          aValue = new Date(a.created_at || 0);
          bValue = new Date(b.created_at || 0);
          break;
        default:
          aValue = a[field] || '';
          bValue = b[field] || '';
      }
      
      if (isDesc) {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      } else {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      }
    });
  }
  
  return sorted;
};

// Filter transactions
export const filterTransactions = (transactions, filters) => {
  return transactions.filter(transaction => {
    // Status filter
    if (filters.status && filters.status !== 'all' && 
        transaction.status !== filters.status) {
      return false;
    }

    // Type filter
    if (filters.transaction_type && filters.transaction_type !== 'all' && 
        transaction.transaction_type !== filters.transaction_type) {
      return false;
    }

    // Date range filters
    if (filters.date_from && transaction.transaction_date) {
      const transactionDate = new Date(transaction.transaction_date);
      const filterDate = new Date(filters.date_from);
      if (transactionDate < filterDate) return false;
    }

    if (filters.date_to && transaction.transaction_date) {
      const transactionDate = new Date(transaction.transaction_date);
      const filterDate = new Date(filters.date_to);
      if (transactionDate > filterDate) return false;
    }

    // Amount range filters
    if (filters.min_amount && transaction.amount < parseFloat(filters.min_amount)) {
      return false;
    }

    if (filters.max_amount && transaction.amount > parseFloat(filters.max_amount)) {
      return false;
    }

    // Marketer filter
    if (filters.marketer_id && transaction.marketer_id !== filters.marketer_id) {
      return false;
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const searchFields = [
        transaction.reference_id,
        transaction.description,
        transaction.marketer_name,
        transaction.payment_reference
      ];
      
      const matchesSearch = searchFields.some(field => 
        field && field.toString().toLowerCase().includes(searchLower)
      );
      
      if (!matchesSearch) return false;
    }

    return true;
  });
};

// Filter interactions
export const filterInteractions = (interactions, filters) => {
  return interactions.filter(interaction => {
    // Type filter
    if (filters.interaction_type && filters.interaction_type !== 'all' && 
        interaction.interaction_type !== filters.interaction_type) {
      return false;
    }

    // Outcome filter
    if (filters.outcome && filters.outcome !== 'all' && 
        interaction.outcome !== filters.outcome) {
      return false;
    }

    // Date range filters
    if (filters.date_from && interaction.started_at) {
      const interactionDate = new Date(interaction.started_at);
      const filterDate = new Date(filters.date_from);
      if (interactionDate < filterDate) return false;
    }

    if (filters.date_to && interaction.started_at) {
      const interactionDate = new Date(interaction.started_at);
      const filterDate = new Date(filters.date_to);
      if (interactionDate > filterDate) return false;
    }

    // Hotspot filter
    if (filters.is_hotspot !== undefined) {
      if (interaction.is_hotspot !== filters.is_hotspot) return false;
    }

    // Conversion filter
    if (filters.converted_to_purchase !== undefined) {
      if (interaction.converted_to_purchase !== filters.converted_to_purchase) return false;
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const searchFields = [
        interaction.action,
        interaction.description,
        interaction.client_name
      ];
      
      const matchesSearch = searchFields.some(field => 
        field && field.toString().toLowerCase().includes(searchLower)
      );
      
      if (!matchesSearch) return false;
    }

    return true;
  });
};

// Group clients by property
export const groupClientsBy = (clients, property) => {
  return clients.reduce((groups, client) => {
    const key = client[property] || 'unknown';
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(client);
    return groups;
  }, {});
};

// Calculate statistics from filtered data
export const calculateStats = (clients) => {
  if (!clients || clients.length === 0) {
    return {
      total: 0,
      active: 0,
      atRisk: 0,
      totalRevenue: 0,
      avgRevenue: 0,
      avgChurnRisk: 0,
      avgEngagement: 0,
      connectionTypes: {},
      tiers: {},
      segments: {}
    };
  }

  const stats = {
    total: clients.length,
    active: clients.filter(c => c.status === 'active').length,
    atRisk: clients.filter(c => c.is_at_risk).length,
    totalRevenue: clients.reduce((sum, c) => sum + (c.lifetime_value || 0), 0),
    avgRevenue: 0,
    avgChurnRisk: 0,
    avgEngagement: 0,
    connectionTypes: {},
    tiers: {},
    segments: {},
    usagePatterns: {}
  };

  // Calculate averages
  const totalChurnRisk = clients.reduce((sum, c) => sum + (c.churn_risk_score || 0), 0);
  const totalEngagement = clients.reduce((sum, c) => sum + (c.engagement_score || 0), 0);
  
  stats.avgRevenue = stats.totalRevenue / stats.total;
  stats.avgChurnRisk = totalChurnRisk / stats.total;
  stats.avgEngagement = totalEngagement / stats.total;

  // Calculate distributions
  clients.forEach(client => {
    // Connection types
    const connType = client.connection_type || 'unknown';
    stats.connectionTypes[connType] = (stats.connectionTypes[connType] || 0) + 1;

    // Tiers
    const tier = client.tier || 'unknown';
    stats.tiers[tier] = (stats.tiers[tier] || 0) + 1;

    // Revenue segments
    const segment = client.revenue_segment || 'unknown';
    stats.segments[segment] = (stats.segments[segment] || 0) + 1;

    // Usage patterns
    const pattern = client.usage_pattern || 'unknown';
    stats.usagePatterns[pattern] = (stats.usagePatterns[pattern] || 0) + 1;
  });

  return stats;
};

// Generate filter options from data
export const generateFilterOptions = (clients) => {
  const options = {
    connection_types: new Set(),
    tiers: new Set(),
    revenue_segments: new Set(),
    usage_patterns: new Set(),
    devices: new Set(),
    payment_methods: new Set()
  };

  clients.forEach(client => {
    if (client.connection_type) options.connection_types.add(client.connection_type);
    if (client.tier) options.tiers.add(client.tier);
    if (client.revenue_segment) options.revenue_segments.add(client.revenue_segment);
    if (client.usage_pattern) options.usage_patterns.add(client.usage_pattern);
    if (client.primary_device) options.devices.add(client.primary_device);
    if (client.preferred_payment_method) options.payment_methods.add(client.preferred_payment_method);
  });

  // Convert sets to arrays and sort
  return {
    connection_types: Array.from(options.connection_types).sort(),
    tiers: Array.from(options.tiers).sort(),
    revenue_segments: Array.from(options.revenue_segments).sort(),
    usage_patterns: Array.from(options.usage_patterns).sort(),
    devices: Array.from(options.devices).sort(),
    payment_methods: Array.from(options.payment_methods).sort()
  };
};

// Debounce function for search
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function for scroll/resize events
export const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};