



// import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
// import ClientService from '../services/ClientService'
// import AnalyticsService from '../services/AnalyticsService';
// import { formatClientData } from '../utils/dataTransformers';

// const useClientData = (initialFilters = {}) => {
//   // State management
//   const [clients, setClients] = useState([]);
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
//     currentPage: 1,
//     pageSize: 20,
//     totalCount: 0,
//     totalPages: 0
//   });

//   // Refs for aborting requests
//   const abortControllerRef = useRef(null);

//   // Cleanup function for aborting requests
//   const abortPreviousRequest = useCallback(() => {
//     if (abortControllerRef.current) {
//       abortControllerRef.current.abort();
//     }
//     abortControllerRef.current = new AbortController();
//     return abortControllerRef.current.signal;
//   }, []);

//   // Fetch clients data
//   const fetchClients = useCallback(async () => {
//     const signal = abortPreviousRequest();
    
//     try {
//       const response = await ClientService.getClients(
//         filters, 
//         {
//           page: pagination.currentPage,
//           pageSize: pagination.pageSize
//         },
//         signal
//       );
      
//       const data = response.data;
//       const clientList = data.results || data;
      
//       const formattedClients = clientList.map(formatClientData);
//       setClients(formattedClients);
      
//       // Update pagination if backend provides pagination info
//       if (data.count !== undefined) {
//         const totalPages = Math.ceil(data.count / pagination.pageSize);
//         setPagination(prev => ({
//           ...prev,
//           totalCount: data.count,
//           totalPages
//         }));
//       }
      
//       return formattedClients;
//     } catch (err) {
//       if (err.name !== 'AbortError' && err.name !== 'CanceledError') {
//         console.error('Error fetching clients:', err);
//         throw err;
//       }
//     }
//   }, [filters, pagination.currentPage, pagination.pageSize, abortPreviousRequest]);

//   // Fetch dashboard data
//   const fetchDashboardData = useCallback(async () => {
//     const signal = abortControllerRef.current?.signal;
    
//     try {
//       const response = await AnalyticsService.getDashboardData(undefined, undefined, false, signal);
//       setDashboardData(response.data);
//     } catch (err) {
//       if (err.name !== 'AbortError' && err.name !== 'CanceledError') {
//         console.error('Error fetching dashboard:', err);
//       }
//     }
//   }, []);

//   // Fetch analytics data
//   const fetchAnalytics = useCallback(async () => {
//     const signal = abortControllerRef.current?.signal;
    
//     try {
//       const [financial, usage] = await Promise.allSettled([
//         AnalyticsService.getFinancialAnalytics(undefined, undefined, 'day', signal),
//         AnalyticsService.getUsageAnalytics(undefined, undefined, 'day', signal)
//       ]);
      
//       setAnalytics({
//         financial: financial.status === 'fulfilled' ? financial.value.data : null,
//         usage: usage.status === 'fulfilled' ? usage.value.data : null
//       });
//     } catch (err) {
//       if (err.name !== 'AbortError' && err.name !== 'CanceledError') {
//         console.error('Error fetching analytics:', err);
//       }
//     }
//   }, []);

//   // Fetch all data
//   const fetchAllData = useCallback(async () => {
//     try {
//       setIsLoading(true);
//       setError(null);
      
//       await Promise.all([
//         fetchClients(),
//         fetchDashboardData(),
//         fetchAnalytics()
//       ]);
      
//     } catch (err) {
//       if (err.name !== 'AbortError' && err.name !== 'CanceledError') {
//         console.error('Error fetching all data:', err);
//         setError(err.message || 'Failed to load data');
//       }
//     } finally {
//       setIsLoading(false);
//       setIsRefreshing(false);
//     }
//   }, [fetchClients, fetchDashboardData, fetchAnalytics]);

//   // Initial load
//   useEffect(() => {
//     fetchAllData();
    
//     return () => {
//       if (abortControllerRef.current) {
//         abortControllerRef.current.abort();
//       }
//     };
//   }, [fetchAllData]);

//   // Handle filter changes
//   const handleFilterChange = useCallback((filterName, value) => {
//     setFilters(prev => ({
//       ...prev,
//       [filterName]: value
//     }));
//     setPagination(prev => ({ ...prev, currentPage: 1 }));
//   }, []);

//   // Handle pagination
//   const handlePageChange = useCallback((page) => {
//     setPagination(prev => ({ ...prev, currentPage: page }));
//   }, []);

//   const handlePageSizeChange = useCallback((size) => {
//     const pageSize = parseInt(size, 10);
//     setPagination(prev => ({ ...prev, pageSize, currentPage: 1 }));
//   }, []);

//   // Handle client selection
//   const handleSelectClient = useCallback(async (client) => {
//     try {
//       setIsLoading(true);
//       const response = await ClientService.getClientById(client.id);
//       const detailedClient = formatClientData(response.data);
//       setSelectedClient(detailedClient);
//     } catch (err) {
//       console.error('Error loading client details:', err);
//       setError('Failed to load client details');
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
//     setPagination(prev => ({ ...prev, currentPage: 1 }));
//   }, []);

//   // Update client data locally
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
//       setError(null);
      
//       let response;
//       if (type === 'pppoe') {
//         response = await ClientService.createPPPoEClient(clientData);
//       } else {
//         response = await ClientService.createHotspotClient(clientData);
//       }
      
//       const newClient = formatClientData(response.data);
//       setClients(prev => [newClient, ...prev]);
//       setSelectedClient(newClient);
      
//       return { success: true, client: newClient };
//     } catch (err) {
//       const errorMsg = err.response?.data?.error || err.message || 'Failed to create client';
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
      
//       return { success: true };
//     } catch (err) {
//       const errorMsg = err.response?.data?.error || err.message || 'Failed to delete client';
//       setError(errorMsg);
//       return { success: false, error: errorMsg };
//     } finally {
//       setIsLoading(false);
//     }
//   }, [selectedClient]);

//   // Export clients
//   const exportClients = useCallback(async (format = 'csv') => {
//     try {
//       setIsLoading(true);
      
//       if (format === 'json') {
//         const response = await ClientService.exportClients(filters, 'json');
//         return response.data;
//       } else {
//         await ClientService.exportClients(filters, 'csv');
//         return { success: true };
//       }
//     } catch (err) {
//       const errorMsg = err.response?.data?.error || err.message || 'Failed to export clients';
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
    
//     let totalRevenue = 0;
//     let totalChurnRisk = 0;
//     let totalEngagement = 0;
//     const connectionTypes = {};
//     const tiers = {};
//     const segments = {};
//     let active = 0;
//     let atRisk = 0;

//     clientList.forEach(client => {
//       totalRevenue += client.lifetime_value || 0;
//       totalChurnRisk += client.churn_risk_score || 0;
//       totalEngagement += client.engagement_score || 0;

//       if (client.status === 'active') active++;
//       if (client.churn_risk_score >= 7) atRisk++;

//       const connType = client.connection_type || 'unknown';
//       connectionTypes[connType] = (connectionTypes[connType] || 0) + 1;

//       const tier = client.tier || 'unknown';
//       tiers[tier] = (tiers[tier] || 0) + 1;

//       const segment = client.revenue_segment || 'unknown';
//       segments[segment] = (segments[segment] || 0) + 1;
//     });

//     const total = clientList.length;
//     return {
//       total,
//       active,
//       atRisk,
//       totalRevenue,
//       avgRevenue: totalRevenue / total,
//       avgChurnRisk: totalChurnRisk / total,
//       avgEngagement: totalEngagement / total,
//       connectionTypes,
//       tiers,
//       segments
//     };
//   }, []);

//   // Update stats whenever clients change
//   useEffect(() => {
//     if (clients.length > 0) {
//       const calculatedStats = calculateStats(clients);
//       setStats(calculatedStats);
//     }
//   }, [clients, calculateStats]);

//   // Memoized filtered clients
//   const filteredClients = useMemo(() => {
//     if (!clients.length) return [];
    
//     let filtered = [...clients];
    
//     // Apply search filter
//     if (filters.search) {
//       const searchLower = filters.search.toLowerCase();
//       filtered = filtered.filter(client => 
//         client.username?.toLowerCase().includes(searchLower) ||
//         client.phone_number?.includes(filters.search)
//       );
//     }
    
//     // Apply connection type filter
//     if (filters.connection_type && filters.connection_type !== 'all') {
//       filtered = filtered.filter(client => client.connection_type === filters.connection_type);
//     }
    
//     // Apply status filter
//     if (filters.status && filters.status !== 'all') {
//       filtered = filtered.filter(client => client.status === filters.status);
//     }
    
//     // Apply tier filter
//     if (filters.tier && filters.tier !== 'all') {
//       filtered = filtered.filter(client => client.tier === filters.tier);
//     }
    
//     // Apply at risk filter
//     if (filters.at_risk && filters.at_risk !== 'all') {
//       const atRisk = filters.at_risk === 'true';
//       filtered = filtered.filter(client => (client.churn_risk_score >= 7) === atRisk);
//     }
    
//     // Apply sorting
//     const sortField = filters.sort_by.startsWith('-') ? filters.sort_by.slice(1) : filters.sort_by;
//     const sortDirection = filters.sort_by.startsWith('-') ? 'desc' : 'asc';
    
//     filtered.sort((a, b) => {
//       let aVal = a[sortField] || 0;
//       let bVal = b[sortField] || 0;
      
//       if (sortField.includes('date') || sortField.includes('_at')) {
//         aVal = aVal ? new Date(aVal).getTime() : 0;
//         bVal = bVal ? new Date(bVal).getTime() : 0;
//       }
      
//       if (typeof aVal === 'string' && typeof bVal === 'string') {
//         return sortDirection === 'asc' 
//           ? aVal.localeCompare(bVal)
//           : bVal.localeCompare(aVal);
//       }
      
//       return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
//     });
    
//     return filtered;
//   }, [clients, filters]);

//   // Check if any filters are active
//   const hasActiveFilters = useMemo(() => {
//     return Object.entries(filters).some(([key, value]) => {
//       if (key === 'sort_by' && value === '-created_at') return false;
//       if (value === 'all' || value === '' || value === null || value === undefined) return false;
//       return true;
//     });
//   }, [filters]);

//   return {
//     // Data
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
    
//     // Derived state
//     hasActiveFilters,
//     totalClients: clients.length,
//     filteredCount: filteredClients.length
//   };
// };

// export default useClientData;








import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import ClientService from '../services/ClientService';
import AnalyticsService from '../services/AnalyticsService';
import { formatClientData } from '../utils/formatters';

const useClientData = (initialFilters = {}) => {
  // State management
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

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
    currentPage: 1,
    pageSize: 20,
    totalCount: 0,
    totalPages: 0
  });

  // Refs for aborting requests
  const abortControllerRef = useRef(null);

  // Cleanup function
  const abortPreviousRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    return abortControllerRef.current.signal;
  }, []);

  // Fetch clients data
  const fetchClients = useCallback(async () => {
    const signal = abortPreviousRequest();
    
    try {
      const response = await ClientService.getClients(
        filters, 
        {
          page: pagination.currentPage,
          pageSize: pagination.pageSize
        },
        signal
      );
      
      const data = response.data || response;
      const clientList = data.results || data;
      
      const formattedClients = clientList.map(formatClientData);
      setClients(formattedClients);
      
      if (data.count !== undefined) {
        const totalPages = Math.ceil(data.count / pagination.pageSize);
        setPagination(prev => ({
          ...prev,
          totalCount: data.count,
          totalPages
        }));
      }
      
      return formattedClients;
    } catch (err) {
      if (err.name !== 'AbortError' && err.name !== 'CanceledError') {
        console.error('Error fetching clients:', err);
        throw err;
      }
    }
  }, [filters, pagination.currentPage, pagination.pageSize, abortPreviousRequest]);

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    const signal = abortControllerRef.current?.signal;
    
    try {
      const response = await AnalyticsService.getDashboardData('30d', 'all', false, signal);
      setDashboardData(response.data || response);
    } catch (err) {
      if (err.name !== 'AbortError' && err.name !== 'CanceledError') {
        console.error('Error fetching dashboard:', err);
      }
    }
  }, []);

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      await Promise.all([
        fetchClients(),
        fetchDashboardData()
      ]);
      
    } catch (err) {
      if (err.name !== 'AbortError' && err.name !== 'CanceledError') {
        console.error('Error fetching all data:', err);
        setError(err.message || 'Failed to load data');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [fetchClients, fetchDashboardData]);

  // Initial load
  useEffect(() => {
    fetchAllData();
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchAllData]);

  // Handle filter changes
  const handleFilterChange = useCallback((filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  // Handle pagination
  const handlePageChange = useCallback((page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  }, []);

  const handlePageSizeChange = useCallback((size) => {
    const pageSize = parseInt(size, 10);
    setPagination(prev => ({ ...prev, pageSize, currentPage: 1 }));
  }, []);

  // Handle client selection
  const handleSelectClient = useCallback(async (client) => {
    try {
      setIsLoading(true);
      const response = await ClientService.getClientById(client.id);
      const detailedClient = formatClientData(response.data || response);
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
    setPagination(prev => ({ ...prev, currentPage: 1 }));
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
      
      const newClient = formatClientData(response.data || response);
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
      await ClientService.exportClients(filters, format);
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Failed to export clients';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, [filters]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!clients || clients.length === 0) {
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

    clients.forEach(client => {
      totalRevenue += client.lifetime_value || 0;
      totalChurnRisk += client.churn_risk_score || 0;
      totalEngagement += client.engagement_score || 0;

      if (client.status === 'active') active++;
      if (client.churn_risk_score >= 7) atRisk++;
    });

    const total = clients.length;
    return {
      total,
      active,
      atRisk,
      totalRevenue,
      avgRevenue: totalRevenue / total,
      avgChurnRisk: totalChurnRisk / total,
      avgEngagement: totalEngagement / total
    };
  }, [clients]);

  // Memoized filtered clients
  const filteredClients = useMemo(() => {
    if (!clients.length) return [];
    
    let filtered = [...clients];
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(client => 
        client.username?.toLowerCase().includes(searchLower) ||
        client.phone_number?.includes(filters.search)
      );
    }
    
    if (filters.connection_type && filters.connection_type !== 'all') {
      filtered = filtered.filter(client => client.connection_type === filters.connection_type);
    }
    
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(client => client.status === filters.status);
    }
    
    if (filters.tier && filters.tier !== 'all') {
      filtered = filtered.filter(client => client.tier === filters.tier);
    }
    
    if (filters.at_risk && filters.at_risk !== 'all') {
      const atRisk = filters.at_risk === 'true';
      filtered = filtered.filter(client => (client.churn_risk_score >= 7) === atRisk);
    }
    
    const sortField = filters.sort_by.startsWith('-') ? filters.sort_by.slice(1) : filters.sort_by;
    const sortDirection = filters.sort_by.startsWith('-') ? 'desc' : 'asc';
    
    filtered.sort((a, b) => {
      let aVal = a[sortField] || 0;
      let bVal = b[sortField] || 0;
      
      if (sortField.includes('date') || sortField.includes('_at')) {
        aVal = aVal ? new Date(aVal).getTime() : 0;
        bVal = bVal ? new Date(bVal).getTime() : 0;
      }
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    });
    
    return filtered;
  }, [clients, filters]);

  const hasActiveFilters = useMemo(() => {
    return Object.entries(filters).some(([key, value]) => {
      if (key === 'sort_by' && value === '-created_at') return false;
      if (value === 'all' || value === '' || value === null || value === undefined) return false;
      return true;
    });
  }, [filters]);

  return {
    clients,
    filteredClients,
    selectedClient,
    dashboardData,
    isLoading,
    isRefreshing,
    error,
    stats,
    filters,
    pagination,
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
    hasActiveFilters,
    totalClients: clients.length,
    filteredCount: filteredClients.length
  };
};

export default useClientData;