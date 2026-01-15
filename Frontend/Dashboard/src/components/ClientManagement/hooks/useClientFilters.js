// import { useState, useCallback, useMemo } from 'react';
// import { filterClients, sortClients, generateFilterOptions } from '../utils/filters'

// const useClientFilters = (clients = []) => {
//   // Filter state
//   const [filters, setFilters] = useState({
//     connection_type: 'all',
//     client_type: 'all',
//     status: 'all',
//     tier: 'all',
//     revenue_segment: 'all',
//     usage_pattern: 'all',
//     is_marketer: 'all',
//     at_risk: 'all',
//     needs_attention: 'all',
//     search: '',
//     date_from: '',
//     date_to: '',
//     min_revenue: '',
//     max_revenue: '',
//     device: 'all',
//     payment_method: 'all',
//     sort_by: '-created_at',
//     tags: []
//   });

//   // Generate available filter options
//   const filterOptions = useMemo(() => {
//     return generateFilterOptions(clients);
//   }, [clients]);

//   // Filter clients based on current filters
//   const filteredClients = useMemo(() => {
//     return filterClients(clients, filters);
//   }, [clients, filters]);

//   // Sort filtered clients
//   const sortedClients = useMemo(() => {
//     return sortClients(filteredClients, filters.sort_by);
//   }, [filteredClients, filters.sort_by]);

//   // Handle filter changes
//   const handleFilterChange = useCallback((filterName, value) => {
//     setFilters(prev => ({
//       ...prev,
//       [filterName]: value
//     }));
//   }, []);

//   // Handle multiple filter changes at once
//   const handleMultipleFilterChanges = useCallback((filterUpdates) => {
//     setFilters(prev => ({
//       ...prev,
//       ...filterUpdates
//     }));
//   }, []);

//   // Handle search filter with debounce
//   const handleSearch = useCallback((searchTerm) => {
//     handleFilterChange('search', searchTerm);
//   }, [handleFilterChange]);

//   // Handle date range filter
//   const handleDateRange = useCallback((startDate, endDate) => {
//     handleMultipleFilterChanges({
//       date_from: startDate,
//       date_to: endDate
//     });
//   }, [handleMultipleFilterChanges]);

//   // Handle revenue range filter
//   const handleRevenueRange = useCallback((min, max) => {
//     handleMultipleFilterChanges({
//       min_revenue: min,
//       max_revenue: max
//     });
//   }, [handleMultipleFilterChanges]);

//   // Handle tag filter
//   const handleTagFilter = useCallback((tag, add = true) => {
//     setFilters(prev => {
//       const currentTags = [...(prev.tags || [])];
      
//       if (add && !currentTags.includes(tag)) {
//         return { ...prev, tags: [...currentTags, tag] };
//       } else if (!add) {
//         return { ...prev, tags: currentTags.filter(t => t !== tag) };
//       }
      
//       return prev;
//     });
//   }, []);

//   // Clear all filters
//   const clearAllFilters = useCallback(() => {
//     setFilters({
//       connection_type: 'all',
//       client_type: 'all',
//       status: 'all',
//       tier: 'all',
//       revenue_segment: 'all',
//       usage_pattern: 'all',
//       is_marketer: 'all',
//       at_risk: 'all',
//       needs_attention: 'all',
//       search: '',
//       date_from: '',
//       date_to: '',
//       min_revenue: '',
//       max_revenue: '',
//       device: 'all',
//       payment_method: 'all',
//       sort_by: '-created_at',
//       tags: []
//     });
//   }, []);

//   // Clear specific filter
//   const clearFilter = useCallback((filterName) => {
//     const defaultValue = {
//       connection_type: 'all',
//       client_type: 'all',
//       status: 'all',
//       tier: 'all',
//       revenue_segment: 'all',
//       usage_pattern: 'all',
//       is_marketer: 'all',
//       at_risk: 'all',
//       needs_attention: 'all',
//       search: '',
//       date_from: '',
//       date_to: '',
//       min_revenue: '',
//       max_revenue: '',
//       device: 'all',
//       payment_method: 'all',
//       sort_by: '-created_at',
//       tags: []
//     }[filterName] || '';

//     handleFilterChange(filterName, defaultValue);
//   }, [handleFilterChange]);

//   // Get active filter count
//   const activeFilterCount = useMemo(() => {
//     return Object.entries(filters).reduce((count, [key, value]) => {
//       if (key === 'sort_by') return count;
      
//       if (Array.isArray(value)) {
//         return count + (value.length > 0 ? 1 : 0);
//       }
      
//       if (value !== '' && value !== 'all' && value !== false) {
//         return count + 1;
//       }
      
//       return count;
//     }, 0);
//   }, [filters]);

//   // Check if specific filter is active
//   const isFilterActive = useCallback((filterName) => {
//     const value = filters[filterName];
    
//     if (Array.isArray(value)) {
//       return value.length > 0;
//     }
    
//     return value !== '' && value !== 'all' && value !== false;
//   }, [filters]);

//   // Get filter summary
//   const filterSummary = useMemo(() => {
//     const summary = [];
    
//     if (filters.search) {
//       summary.push(`Search: "${filters.search}"`);
//     }
    
//     if (filters.connection_type !== 'all') {
//       summary.push(`Connection: ${filters.connection_type}`);
//     }
    
//     if (filters.status !== 'all') {
//       summary.push(`Status: ${filters.status}`);
//     }
    
//     if (filters.tier !== 'all') {
//       summary.push(`Tier: ${filters.tier}`);
//     }
    
//     if (filters.revenue_segment !== 'all') {
//       summary.push(`Revenue: ${filters.revenue_segment}`);
//     }
    
//     if (filters.date_from || filters.date_to) {
//       const dateRange = [];
//       if (filters.date_from) dateRange.push(`From: ${filters.date_from}`);
//       if (filters.date_to) dateRange.push(`To: ${filters.date_to}`);
//       summary.push(`Date: ${dateRange.join(' - ')}`);
//     }
    
//     if (filters.tags && filters.tags.length > 0) {
//       summary.push(`Tags: ${filters.tags.length} selected`);
//     }
    
//     return summary;
//   }, [filters]);

//   // Calculate statistics for filtered clients
//   const filteredStats = useMemo(() => {
//     if (sortedClients.length === 0) {
//       return {
//         total: 0,
//         active: 0,
//         atRisk: 0,
//         totalRevenue: 0,
//         avgRevenue: 0,
//         avgChurnRisk: 0,
//         avgEngagement: 0
//       };
//     }

//     const stats = {
//       total: sortedClients.length,
//       active: sortedClients.filter(c => c.status === 'active').length,
//       atRisk: sortedClients.filter(c => c.is_at_risk).length,
//       totalRevenue: sortedClients.reduce((sum, c) => sum + (c.lifetime_value || 0), 0),
//       avgRevenue: 0,
//       avgChurnRisk: 0,
//       avgEngagement: 0
//     };

//     const totalChurnRisk = sortedClients.reduce((sum, c) => sum + (c.churn_risk_score || 0), 0);
//     const totalEngagement = sortedClients.reduce((sum, c) => sum + (c.engagement_score || 0), 0);
    
//     stats.avgRevenue = stats.totalRevenue / stats.total;
//     stats.avgChurnRisk = totalChurnRisk / stats.total;
//     stats.avgEngagement = totalEngagement / stats.total;

//     return stats;
//   }, [sortedClients]);

//   return {
//     // State
//     filters,
//     filteredClients: sortedClients,
//     filterOptions,
    
//     // Actions
//     handleFilterChange,
//     handleMultipleFilterChanges,
//     handleSearch,
//     handleDateRange,
//     handleRevenueRange,
//     handleTagFilter,
//     clearAllFilters,
//     clearFilter,
    
//     // Helpers
//     activeFilterCount,
//     isFilterActive,
//     filterSummary,
//     filteredStats,
    
//     // Derived values
//     hasActiveFilters: activeFilterCount > 0,
//     filteredCount: sortedClients.length,
//     originalCount: clients.length
//   };
// };

// export default useClientFilters;









// hooks/useClientFilters.jsx
import { useState, useCallback, useMemo } from 'react';
import { filterClients, sortClients, generateFilterOptions } from '../utils/filters';

const useClientFilters = (clients = []) => {
  // Filter state
  const [filters, setFilters] = useState({
    connection_type: 'all',
    client_type: 'all',
    status: 'all',
    tier: 'all',
    revenue_segment: 'all',
    usage_pattern: 'all',
    is_marketer: 'all',
    at_risk: 'all',
    needs_attention: 'all',
    search: '',
    date_from: '',
    date_to: '',
    min_revenue: '',
    max_revenue: '',
    sort_by: '-created_at',
    tags: []
  });

  // Generate available filter options from client data
  const filterOptions = useMemo(() => {
    return generateFilterOptions(clients);
  }, [clients]);

  // Filter clients based on current filters
  const filteredClients = useMemo(() => {
    if (!clients || clients.length === 0) return [];
    return filterClients(clients, filters);
  }, [clients, filters]);

  // Sort filtered clients
  const sortedClients = useMemo(() => {
    if (!filteredClients || filteredClients.length === 0) return [];
    return sortClients(filteredClients, filters.sort_by);
  }, [filteredClients, filters.sort_by]);

  // Handle filter changes
  const handleFilterChange = useCallback((filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  }, []);

  // Handle multiple filter changes at once
  const handleMultipleFilterChanges = useCallback((filterUpdates) => {
    setFilters(prev => ({
      ...prev,
      ...filterUpdates
    }));
  }, []);

  // Handle search filter (can be used with debounce in component)
  const handleSearch = useCallback((searchTerm) => {
    handleFilterChange('search', searchTerm);
  }, [handleFilterChange]);

  // Handle date range filter
  const handleDateRange = useCallback((startDate, endDate) => {
    handleMultipleFilterChanges({
      date_from: startDate,
      date_to: endDate
    });
  }, [handleMultipleFilterChanges]);

  // Handle revenue range filter
  const handleRevenueRange = useCallback((min, max) => {
    handleMultipleFilterChanges({
      min_revenue: min,
      max_revenue: max
    });
  }, [handleMultipleFilterChanges]);

  // Handle tag filter
  const handleTagFilter = useCallback((tag, add = true) => {
    setFilters(prev => {
      const currentTags = [...(prev.tags || [])];
      
      if (add && !currentTags.includes(tag)) {
        return { ...prev, tags: [...currentTags, tag] };
      } else if (!add) {
        return { ...prev, tags: currentTags.filter(t => t !== tag) };
      }
      
      return prev;
    });
  }, []);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setFilters({
      connection_type: 'all',
      client_type: 'all',
      status: 'all',
      tier: 'all',
      revenue_segment: 'all',
      usage_pattern: 'all',
      is_marketer: 'all',
      at_risk: 'all',
      needs_attention: 'all',
      search: '',
      date_from: '',
      date_to: '',
      min_revenue: '',
      max_revenue: '',
      sort_by: '-created_at',
      tags: []
    });
  }, []);

  // Clear specific filter
  const clearFilter = useCallback((filterName) => {
    const defaultValue = {
      connection_type: 'all',
      client_type: 'all',
      status: 'all',
      tier: 'all',
      revenue_segment: 'all',
      usage_pattern: 'all',
      is_marketer: 'all',
      at_risk: 'all',
      needs_attention: 'all',
      search: '',
      date_from: '',
      date_to: '',
      min_revenue: '',
      max_revenue: '',
      sort_by: '-created_at',
      tags: []
    }[filterName] || '';
    
    handleFilterChange(filterName, defaultValue);
  }, [handleFilterChange]);

  // Get active filter count
  const activeFilterCount = useMemo(() => {
    return Object.entries(filters).reduce((count, [key, value]) => {
      if (key === 'sort_by') return count;
      
      if (Array.isArray(value)) {
        return count + (value.length > 0 ? 1 : 0);
      }
      
      if (value !== '' && value !== 'all' && value !== false && value !== null && value !== undefined) {
        return count + 1;
      }
      
      return count;
    }, 0);
  }, [filters]);

  // Check if specific filter is active
  const isFilterActive = useCallback((filterName) => {
    const value = filters[filterName];
    
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    
    return value !== '' && value !== 'all' && value !== false && value !== null && value !== undefined;
  }, [filters]);

  // Get filter summary for display
  const filterSummary = useMemo(() => {
    const summary = [];
    
    if (filters.search) {
      summary.push(`Search: "${filters.search}"`);
    }
    
    if (filters.connection_type !== 'all') {
      summary.push(`Connection: ${filters.connection_type}`);
    }
    
    if (filters.status !== 'all') {
      summary.push(`Status: ${filters.status}`);
    }
    
    if (filters.tier !== 'all') {
      summary.push(`Tier: ${filters.tier}`);
    }
    
    if (filters.revenue_segment !== 'all') {
      summary.push(`Revenue: ${filters.revenue_segment}`);
    }
    
    if (filters.date_from || filters.date_to) {
      const dateRange = [];
      if (filters.date_from) dateRange.push(`From: ${filters.date_from}`);
      if (filters.date_to) dateRange.push(`To: ${filters.date_to}`);
      summary.push(`Date: ${dateRange.join(' - ')}`);
    }
    
    if (filters.tags && filters.tags.length > 0) {
      summary.push(`Tags: ${filters.tags.length} selected`);
    }
    
    if (filters.at_risk !== 'all') {
      summary.push(`At Risk: ${filters.at_risk ? 'Yes' : 'No'}`);
    }
    
    if (filters.needs_attention !== 'all') {
      summary.push(`Needs Attention: ${filters.needs_attention ? 'Yes' : 'No'}`);
    }
    
    if (filters.is_marketer !== 'all') {
      summary.push(`Marketer: ${filters.is_marketer ? 'Yes' : 'No'}`);
    }
    
    return summary;
  }, [filters]);

  // Calculate statistics for filtered clients
  const filteredStats = useMemo(() => {
    if (sortedClients.length === 0) {
      return {
        total: 0,
        active: 0,
        atRisk: 0,
        totalRevenue: 0,
        avgRevenue: 0,
        avgChurnRisk: 0,
        avgEngagement: 0
      };
    }
    
    let totalRevenue = 0;
    let totalChurnRisk = 0;
    let totalEngagement = 0;
    let active = 0;
    let atRisk = 0;

    sortedClients.forEach(client => {
      totalRevenue += client.lifetime_value || 0;
      totalChurnRisk += client.churn_risk_score || 0;
      totalEngagement += client.engagement_score || 0;

      if (client.status === 'active') active++;
      if (client.churn_risk_score >= 7) atRisk++;
    });

    const total = sortedClients.length;
    return {
      total,
      active,
      atRisk,
      totalRevenue,
      avgRevenue: totalRevenue / total,
      avgChurnRisk: totalChurnRisk / total,
      avgEngagement: totalEngagement / total
    };
  }, [sortedClients]);

  return {
    // State
    filters,
    filteredClients: sortedClients,
    filterOptions,
    
    // Actions
    handleFilterChange,
    handleMultipleFilterChanges,
    handleSearch,
    handleDateRange,
    handleRevenueRange,
    handleTagFilter,
    clearAllFilters,
    clearFilter,
    
    // Derived state
    activeFilterCount,
    isFilterActive,
    filterSummary,
    filteredStats,
    hasActiveFilters: activeFilterCount > 0,
    filteredCount: sortedClients.length,
    originalCount: clients.length
  };
};

export default useClientFilters;