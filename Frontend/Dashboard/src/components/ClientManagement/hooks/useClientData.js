

// import { useState, useEffect, useCallback, useMemo } from 'react';
// import ClientService from '../services/ClientService'
// import AnalyticsService from '../services/AnalyticsService';
// import { formatClientData } from '../utils/dataTransformers'
// import { debounce } from '../utils/filters';

// const useClientData = (initialFilters = {}) => {
//   // State management
//   const [clients, setClients] = useState([]);
//   const [filteredClients, setFilteredClients] = useState([]);
//   const [selectedClient, setSelectedClient] = useState(null);
//   const [dashboardData, setDashboardData] = useState(null);
//   const [analytics, setAnalytics] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isRefreshing, setIsRefreshing] = useState(false);
//   const [error, setError] = useState(null);
//   const [stats, setStats] = useState(null);

//   // Filter and pagination state
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
//     sort_by: '-created_at',
//     ...initialFilters
//   });

//   const [pagination, setPagination] = useState({
//     current_page: 1,
//     page_size: 20,
//     total_count: 0,
//     total_pages: 0
//   });

//   // Fetch all data
//   const fetchAllData = useCallback(async () => {
//     try {
//       setIsLoading(true);
//       setError(null);

//       // Fetch data in parallel
//       const [clientsResponse, dashboardResponse, analyticsResponse] = await Promise.all([
//         ClientService.getClients(filters, pagination),
//         AnalyticsService.getDashboardData(),
//         AnalyticsService.getClientAnalytics()
//       ]);

//       // Transform and set data
//       const formattedClients = clientsResponse.data.results.map(formatClientData);
//       setClients(formattedClients);
//       setFilteredClients(formattedClients);
      
//       if (dashboardResponse?.data) {
//         setDashboardData(dashboardResponse.data);
//       }
      
//       if (analyticsResponse?.data) {
//         setAnalytics(analyticsResponse.data);
//       }
      
//       // Set pagination
//       setPagination(prev => ({
//         ...prev,
//         total_count: clientsResponse.data.count,
//         total_pages: Math.ceil(clientsResponse.data.count / prev.page_size)
//       }));

//       // Calculate stats
//       const stats = calculateStats(formattedClients);
//       setStats(stats);

//     } catch (err) {
//       console.error('Error fetching data:', err);
//       setError(err.response?.data?.error || 'Failed to load client data. Please try again.');
//     } finally {
//       setIsLoading(false);
//       setIsRefreshing(false);
//     }
//   }, [filters, pagination]);

//   // Debounced data fetching
//   const debouncedFetchAllData = useMemo(
//     () => debounce(fetchAllData, 500),
//     [fetchAllData]
//   );

//   // Initial load
//   useEffect(() => {
//     fetchAllData();
//   }, [fetchAllData]);

//   // Handle filter changes
//   const handleFilterChange = useCallback((filterName, value) => {
//     setFilters(prev => ({
//       ...prev,
//       [filterName]: value
//     }));
//     setPagination(prev => ({ ...prev, current_page: 1 }));
//   }, []);

//   // Handle pagination
//   const handlePageChange = useCallback((page) => {
//     setPagination(prev => ({ ...prev, current_page: page }));
//   }, []);

//   // Handle page size change
//   const handlePageSizeChange = useCallback((size) => {
//     setPagination(prev => ({ ...prev, page_size: size, current_page: 1 }));
//   }, []);

//   // Handle client selection
//   const handleSelectClient = useCallback(async (client) => {
//     try {
//       setIsLoading(true);
//       const response = await ClientService.getClientById(client.id);
//       const detailedClient = formatClientData(response.data);
//       setSelectedClient(detailedClient);
//       setError(null);
//     } catch (err) {
//       setError('Failed to load client details');
//       console.error('Error loading client details:', err);
//     } finally {
//       setIsLoading(false);
//     }
//   }, []);

//   // Refresh data
//   const handleRefresh = useCallback(() => {
//     setIsRefreshing(true);
//     fetchAllData();
//   }, [fetchAllData]);

//   // Clear all filters
//   const handleClearFilters = useCallback(() => {
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
//       sort_by: '-created_at'
//     });
//   }, []);

//   // Update client data
//   const updateClient = useCallback((clientId, updates) => {
//     setClients(prev => prev.map(client => 
//       client.id === clientId ? { ...client, ...updates } : client
//     ));
    
//     if (selectedClient?.id === clientId) {
//       setSelectedClient(prev => ({ ...prev, ...updates }));
//     }
//   }, [selectedClient]);

//   // Create new client
//   const createClient = useCallback(async (clientData, type = 'pppoe') => {
//     try {
//       setIsLoading(true);
      
//       let response;
//       if (type === 'pppoe') {
//         response = await ClientService.createPPPoEClient(clientData);
//       } else {
//         response = await ClientService.createHotspotClient(clientData);
//       }
      
//       const newClient = formatClientData(response.data.client);
//       setClients(prev => [newClient, ...prev]);
//       setSelectedClient(newClient);
      
//       return { success: true, client: newClient };
//     } catch (err) {
//       const errorMsg = err.response?.data?.error || 'Failed to create client';
//       setError(errorMsg);
//       return { success: false, error: errorMsg };
//     } finally {
//       setIsLoading(false);
//     }
//   }, []);

//   // Delete client
//   const deleteClient = useCallback(async (clientId) => {
//     try {
//       setIsLoading(true);
//       await ClientService.deleteClient(clientId);
      
//       setClients(prev => prev.filter(client => client.id !== clientId));
      
//       if (selectedClient?.id === clientId) {
//         setSelectedClient(null);
//       }
      
//       // Refresh data
//       await fetchAllData();
      
//       return { success: true };
//     } catch (err) {
//       const errorMsg = err.response?.data?.error || 'Failed to delete client';
//       setError(errorMsg);
//       return { success: false, error: errorMsg };
//     } finally {
//       setIsLoading(false);
//     }
//   }, [selectedClient, fetchAllData]);

//   // Export clients
//   const exportClients = useCallback(async (format = 'csv') => {
//     try {
//       setIsLoading(true);
//       await ClientService.exportClients(filters, format);
//       return { success: true };
//     } catch (err) {
//       const errorMsg = err.response?.data?.error || 'Failed to export clients';
//       setError(errorMsg);
//       return { success: false, error: errorMsg };
//     } finally {
//       setIsLoading(false);
//     }
//   }, [filters]);

//   // Calculate statistics
//   const calculateStats = useCallback((clientList) => {
//     if (!clientList || clientList.length === 0) {
//       return {
//         total: 0,
//         active: 0,
//         atRisk: 0,
//         totalRevenue: 0,
//         avgRevenue: 0,
//         avgChurnRisk: 0,
//         avgEngagement: 0,
//         connectionTypes: {},
//         tiers: {},
//         segments: {}
//       };
//     }

//     const stats = {
//       total: clientList.length,
//       active: clientList.filter(c => c.status === 'active').length,
//       atRisk: clientList.filter(c => c.is_at_risk).length,
//       totalRevenue: clientList.reduce((sum, c) => sum + (c.lifetime_value || 0), 0),
//       avgRevenue: 0,
//       avgChurnRisk: 0,
//       avgEngagement: 0,
//       connectionTypes: {},
//       tiers: {},
//       segments: {}
//     };

//     // Calculate averages
//     const totalChurnRisk = clientList.reduce((sum, c) => sum + (c.churn_risk_score || 0), 0);
//     const totalEngagement = clientList.reduce((sum, c) => sum + (c.engagement_score || 0), 0);
    
//     stats.avgRevenue = stats.totalRevenue / stats.total;
//     stats.avgChurnRisk = totalChurnRisk / stats.total;
//     stats.avgEngagement = totalEngagement / stats.total;

//     // Calculate distributions
//     clientList.forEach(client => {
//       const connType = client.connection_type || 'unknown';
//       stats.connectionTypes[connType] = (stats.connectionTypes[connType] || 0) + 1;

//       const tier = client.tier || 'unknown';
//       stats.tiers[tier] = (stats.tiers[tier] || 0) + 1;

//       const segment = client.revenue_segment || 'unknown';
//       stats.segments[segment] = (stats.segments[segment] || 0) + 1;
//     });

//     return stats;
//   }, []);

//   // Check if any filters are active
//   const hasActiveFilters = useMemo(() => {
//     const filterValues = Object.values(filters);
//     return filterValues.some(value => 
//       value !== 'all' && 
//       value !== '' && 
//       value !== '-created_at'
//     );
//   }, [filters]);

//   return {
//     // State
//     clients,
//     filteredClients,
//     selectedClient,
//     dashboardData,
//     analytics,
//     isLoading,
//     isRefreshing,
//     error,
//     stats,
//     filters,
//     pagination,
    
//     // Actions
//     handleFilterChange,
//     handlePageChange,
//     handlePageSizeChange,
//     handleSelectClient,
//     handleRefresh,
//     handleClearFilters,
//     updateClient,
//     createClient,
//     deleteClient,
//     exportClients,
//     fetchAllData: debouncedFetchAllData,
    
//     // Helpers
//     hasActiveFilters,
//     totalClients: filteredClients.length,
//     totalPages: pagination.total_pages
//   };
// };

// export default useClientData;










// hooks/useClientData.jsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import ClientService from '../services/ClientService';
import AnalyticsService from '../services/AnalyticsService';
import { formatClientData } from '../utils/dataTransformers';

const useClientData = (initialFilters = {}) => {
  // State management
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  // Filter and pagination state
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
    ...initialFilters
  });

  const [pagination, setPagination] = useState({
    current_page: 1,
    page_size: 20,
    total_count: 0,
    total_pages: 0
  });

  // Fetch clients data
  const fetchClients = useCallback(async () => {
    try {
      const response = await ClientService.getClients(filters, {
        current_page: pagination.current_page,
        page_size: pagination.page_size
      });
      
      const data = response.data;
      const clientList = data.results || data;
      
      const formattedClients = clientList.map(formatClientData);
      setClients(formattedClients);
      setFilteredClients(formattedClients);
      
      // Update pagination if backend provides pagination info
      if (data.count !== undefined) {
        setPagination(prev => ({
          ...prev,
          total_count: data.count,
          total_pages: Math.ceil(data.count / prev.page_size)
        }));
      }
      
      return formattedClients;
    } catch (err) {
      console.error('Error fetching clients:', err);
      setError(err.message || 'Failed to load clients');
      throw err;
    }
  }, [filters, pagination.current_page, pagination.page_size]);

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await AnalyticsService.getDashboardData();
      setDashboardData(response.data);
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      // Don't set error for dashboard - it's optional
    }
  }, []);

  // Fetch analytics data
  const fetchAnalytics = useCallback(async () => {
    try {
      const [financial, usage] = await Promise.all([
        AnalyticsService.getFinancialAnalytics(),
        AnalyticsService.getUsageAnalytics()
      ]);
      
      setAnalytics({
        financial: financial.data,
        usage: usage.data
      });
    } catch (err) {
      console.error('Error fetching analytics:', err);
      // Analytics are optional
    }
  }, []);

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      await Promise.all([
        fetchClients(),
        fetchDashboardData(),
        fetchAnalytics()
      ]);
      
    } catch (err) {
      console.error('Error fetching all data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [fetchClients, fetchDashboardData, fetchAnalytics]);

  // Initial load
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Handle filter changes
  const handleFilterChange = useCallback((filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
    setPagination(prev => ({ ...prev, current_page: 1 }));
  }, []);

  // Handle pagination
  const handlePageChange = useCallback((page) => {
    setPagination(prev => ({ ...prev, current_page: page }));
  }, []);

  // Handle page size change
  const handlePageSizeChange = useCallback((size) => {
    setPagination(prev => ({ ...prev, page_size: size, current_page: 1 }));
  }, []);

  // Handle client selection
  const handleSelectClient = useCallback(async (client) => {
    try {
      setIsLoading(true);
      const response = await ClientService.getClientById(client.id);
      const detailedClient = formatClientData(response.data);
      setSelectedClient(detailedClient);
    } catch (err) {
      console.error('Error loading client details:', err);
      setError('Failed to load client details');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Refresh data
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchAllData();
  }, [fetchAllData]);

  // Clear all filters
  const handleClearFilters = useCallback(() => {
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
      sort_by: '-created_at'
    });
    setPagination(prev => ({ ...prev, current_page: 1 }));
  }, []);

  // Update client data locally
  const updateClient = useCallback((clientId, updates) => {
    setClients(prev => prev.map(client =>
      client.id === clientId ? { ...client, ...updates } : client
    ));
    
    if (selectedClient?.id === clientId) {
      setSelectedClient(prev => ({ ...prev, ...updates }));
    }
  }, [selectedClient]);

  // Create new client
  const createClient = useCallback(async (clientData, type = 'pppoe') => {
    try {
      setIsLoading(true);
      setError(null);
      
      let response;
      if (type === 'pppoe') {
        response = await ClientService.createPPPoEClient(clientData);
      } else {
        response = await ClientService.createHotspotClient(clientData);
      }
      
      const newClient = formatClientData(response.data);
      setClients(prev => [newClient, ...prev]);
      setSelectedClient(newClient);
      
      return { success: true, client: newClient };
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Failed to create client';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Delete client
  const deleteClient = useCallback(async (clientId) => {
    try {
      setIsLoading(true);
      await ClientService.deleteClient(clientId);
      
      setClients(prev => prev.filter(client => client.id !== clientId));
      
      if (selectedClient?.id === clientId) {
        setSelectedClient(null);
      }
      
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Failed to delete client';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, [selectedClient]);

  // Export clients
  const exportClients = useCallback(async (format = 'csv') => {
    try {
      setIsLoading(true);
      await ClientService.exportClients(filters, format);
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Failed to export clients';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // Calculate statistics
  const calculateStats = useCallback((clientList) => {
    if (!clientList || clientList.length === 0) {
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
    
    let totalRevenue = 0;
    let totalChurnRisk = 0;
    let totalEngagement = 0;
    const connectionTypes = {};
    const tiers = {};
    const segments = {};
    let active = 0;
    let atRisk = 0;

    clientList.forEach(client => {
      totalRevenue += client.lifetime_value || 0;
      totalChurnRisk += client.churn_risk_score || 0;
      totalEngagement += client.engagement_score || 0;

      if (client.status === 'active') active++;
      if (client.churn_risk_score >= 7) atRisk++;

      const connType = client.connection_type || 'unknown';
      connectionTypes[connType] = (connectionTypes[connType] || 0) + 1;

      const tier = client.tier || 'unknown';
      tiers[tier] = (tiers[tier] || 0) + 1;

      const segment = client.revenue_segment || 'unknown';
      segments[segment] = (segments[segment] || 0) + 1;
    });

    const total = clientList.length;
    return {
      total,
      active,
      atRisk,
      totalRevenue,
      avgRevenue: totalRevenue / total,
      avgChurnRisk: totalChurnRisk / total,
      avgEngagement: totalEngagement / total,
      connectionTypes,
      tiers,
      segments
    };
  }, []);

  // Update stats whenever clients change
  useEffect(() => {
    if (clients.length > 0) {
      const calculatedStats = calculateStats(clients);
      setStats(calculatedStats);
    }
  }, [clients, calculateStats]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    const filterValues = Object.values(filters);
    return filterValues.some(value =>
      value !== 'all' &&
      value !== '' &&
      value !== '-created_at' &&
      value !== false &&
      value !== null &&
      value !== undefined
    );
  }, [filters]);

  return {
    // Data
    clients,
    filteredClients,
    selectedClient,
    dashboardData,
    analytics,
    isLoading,
    isRefreshing,
    error,
    stats,
    filters,
    pagination,
    
    // Actions
    handleFilterChange,
    handlePageChange,
    handlePageSizeChange,
    handleSelectClient,
    handleRefresh,
    handleClearFilters,
    updateClient,
    createClient,
    deleteClient,
    exportClients,
    
    // Derived state
    hasActiveFilters,
    totalClients: clients.length,
    filteredCount: filteredClients.length,
    totalPages: pagination.total_pages,
    currentPage: pagination.current_page
  };
};

export default useClientData;