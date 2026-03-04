


// import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
// import AnalyticsService from '../services/AnalyticsService';

// const useAnalytics = (initialTimeRange = '30d', initialConnectionType = 'all') => {
//   // State management
//   const [dashboardData, setDashboardData] = useState(null);
//   const [analyticsData, setAnalyticsData] = useState(null);
//   const [trendData, setTrendData] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isRefreshing, setIsRefreshing] = useState(false);
//   const [error, setError] = useState(null);

//   // Filter state
//   const [filters, setFilters] = useState({
//     time_range: initialTimeRange,
//     connection_type: initialConnectionType,
//     start_date: '',
//     end_date: '',
//     group_by: 'day',
//     metric: 'revenue'
//   });

//   // Refs for aborting requests
//   const abortControllerRef = useRef(null);

//   // Cleanup function
//   const abortPreviousRequest = useCallback(() => {
//     if (abortControllerRef.current) {
//       abortControllerRef.current.abort();
//     }
//     abortControllerRef.current = new AbortController();
//     return abortControllerRef.current.signal;
//   }, []);

//   // Fetch dashboard data
//   const fetchDashboardData = useCallback(async () => {
//     const signal = abortControllerRef.current?.signal;
    
//     try {
//       const response = await AnalyticsService.getDashboardData(
//         filters.time_range,
//         filters.connection_type,
//         false,
//         signal
//       );
//       setDashboardData(response.data);
//       return response.data;
//     } catch (err) {
//       if (err.name !== 'AbortError' && err.name !== 'CanceledError') {
//         console.error('Error fetching dashboard data:', err);
//       }
//       return null;
//     }
//   }, [filters.time_range, filters.connection_type]);

//   // Fetch analytics data
//   const fetchAnalyticsData = useCallback(async () => {
//     const signal = abortControllerRef.current?.signal;
    
//     try {
//       const [financial, usage, behavioral, hotspot] = await Promise.allSettled([
//         AnalyticsService.getFinancialAnalytics(filters.start_date, filters.end_date, filters.group_by, signal),
//         AnalyticsService.getUsageAnalytics(filters.start_date, filters.end_date, filters.group_by, signal),
//         AnalyticsService.getBehavioralAnalytics('revenue_segment', signal),
//         AnalyticsService.getHotspotAnalytics(filters.start_date, filters.end_date, signal)
//       ]);

//       const analytics = {
//         financial: financial.status === 'fulfilled' ? financial.value.data : null,
//         usage: usage.status === 'fulfilled' ? usage.value.data : null,
//         behavioral: behavioral.status === 'fulfilled' ? behavioral.value.data : null,
//         hotspot: hotspot.status === 'fulfilled' ? hotspot.value.data : null
//       };

//       setAnalyticsData(analytics);
//       return analytics;
//     } catch (err) {
//       if (err.name !== 'AbortError' && err.name !== 'CanceledError') {
//         console.error('Error fetching analytics data:', err);
//       }
//       return null;
//     }
//   }, [filters.start_date, filters.end_date, filters.group_by]);

//   // Fetch trend data
//   const fetchTrendData = useCallback(async () => {
//     const signal = abortControllerRef.current?.signal;
    
//     try {
//       const response = await AnalyticsService.getTrendData(
//         filters.metric,
//         filters.time_range,
//         signal
//       );
//       setTrendData(response.data);
//       return response.data;
//     } catch (err) {
//       if (err.name !== 'AbortError' && err.name !== 'CanceledError') {
//         console.error('Error fetching trend data:', err);
//       }
//       return null;
//     }
//   }, [filters.metric, filters.time_range]);

//   // Fetch all analytics data
//   const fetchAllData = useCallback(async () => {
//     try {
//       setIsLoading(true);
//       setError(null);
      
//       const signal = abortPreviousRequest();
      
//       await Promise.all([
//         fetchDashboardData(),
//         fetchAnalyticsData(),
//         fetchTrendData()
//       ]);
//     } catch (err) {
//       if (err.name !== 'AbortError' && err.name !== 'CanceledError') {
//         console.error('Error fetching analytics data:', err);
//         setError(err.message || 'Failed to load analytics data');
//       }
//     } finally {
//       setIsLoading(false);
//       setIsRefreshing(false);
//     }
//   }, [fetchDashboardData, fetchAnalyticsData, fetchTrendData, abortPreviousRequest]);

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
//   }, []);

//   const handleTimeRangeChange = useCallback((timeRange) => {
//     setFilters(prev => ({
//       ...prev,
//       time_range: timeRange
//     }));
//   }, []);

//   const handleConnectionTypeChange = useCallback((connectionType) => {
//     setFilters(prev => ({
//       ...prev,
//       connection_type: connectionType
//     }));
//   }, []);

//   const handleDateRangeChange = useCallback((startDate, endDate) => {
//     setFilters(prev => ({
//       ...prev,
//       start_date: startDate,
//       end_date: endDate
//     }));
//   }, []);

//   // Refresh data
//   const handleRefresh = useCallback(() => {
//     setIsRefreshing(true);
//     fetchAllData();
//   }, [fetchAllData]);

//   // Export analytics data
//   const handleExport = useCallback(async (format = 'csv') => {
//     try {
//       await AnalyticsService.exportAnalyticsData(format, filters);
//       return { success: true };
//     } catch (err) {
//       const errorMsg = err.message || 'Failed to export analytics data';
//       setError(errorMsg);
//       return { success: false, error: errorMsg };
//     }
//   }, [filters]);

//   // Process dashboard data for charts
//   const processedDashboardData = useMemo(() => {
//     if (!dashboardData) return null;
    
//     const { summary, financial, usage, client_analytics, plan_analytics } = dashboardData;
    
//     // Prepare chart data
//     const revenueChartData = {
//       labels: financial?.revenue_trends?.daily?.map(d => d.date) || [],
//       datasets: [{
//         label: 'Revenue (KES)',
//         data: financial?.revenue_trends?.daily?.map(d => d.revenue) || [],
//         borderColor: '#3b82f6',
//         backgroundColor: 'rgba(59, 130, 246, 0.1)',
//         tension: 0.4,
//         fill: true
//       }]
//     };
    
//     const clientsChartData = {
//       labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
//       datasets: [
//         {
//           label: 'New Clients',
//           data: client_analytics?.new_clients_trend || [12, 19, 15, 25, 22, 18, 30],
//           borderColor: '#10b981',
//           backgroundColor: 'rgba(16, 185, 129, 0.1)',
//           tension: 0.4,
//           fill: true
//         }
//       ]
//     };
    
//     const connectionDistributionData = {
//       labels: client_analytics?.connection_distribution?.map(item => 
//         item.connection_type || 'Unknown'
//       ) || ['PPPoE', 'Hotspot'],
//       datasets: [{
//         data: client_analytics?.connection_distribution?.map(item => item.count) || [65, 35],
//         backgroundColor: ['#3b82f6', '#10b981', '#8b5cf6']
//       }]
//     };
    
//     const tierDistributionData = {
//       labels: client_analytics?.tier_distribution?.map(item => 
//         item.tier || 'Unknown'
//       ) || ['New', 'Bronze', 'Silver', 'Gold'],
//       datasets: [{
//         data: client_analytics?.tier_distribution?.map(item => item.count) || [25, 40, 20, 15],
//         backgroundColor: ['#94a3b8', '#92400e', '#64748b', '#f59e0b']
//       }]
//     };
    
//     return {
//       summary,
//       financial,
//       usage,
//       client_analytics,
//       plan_analytics,
//       charts: {
//         revenue: revenueChartData,
//         clients: clientsChartData,
//         connectionDistribution: connectionDistributionData,
//         tierDistribution: tierDistributionData
//       }
//     };
//   }, [dashboardData]);

//   // Process analytics data for insights
//   const processedAnalyticsData = useMemo(() => {
//     if (!analyticsData) return null;
    
//     const { financial, usage, behavioral, hotspot } = analyticsData;
//     const insights = [];
    
//     // Financial insights
//     if (financial?.revenue_growth_rate) {
//       const growth = financial.revenue_growth_rate;
//       if (growth > 20) {
//         insights.push({
//           type: 'success',
//           title: 'Strong Revenue Growth',
//           message: `Revenue growing at ${growth}% month-over-month`,
//           icon: '📈'
//         });
//       } else if (growth < 0) {
//         insights.push({
//           type: 'warning',
//           title: 'Revenue Decline',
//           message: `Revenue decreased by ${Math.abs(growth)}%`,
//           icon: '📉'
//         });
//       }
//     }
    
//     // Usage insights
//     if (usage?.total_data_used_gb) {
//       const dataUsed = usage.total_data_used_gb;
//       if (dataUsed > 1000) {
//         insights.push({
//           type: 'info',
//           title: 'High Data Usage',
//           message: `Total data used: ${(dataUsed / 1000).toFixed(1)}TB`,
//           icon: '💾'
//         });
//       }
//     }
    
//     // Behavioral insights
//     if (behavioral?.avg_churn_risk) {
//       const avgChurn = behavioral.avg_churn_risk;
//       if (avgChurn > 7) {
//         insights.push({
//           type: 'danger',
//           title: 'High Churn Risk',
//           message: `Average churn risk: ${avgChurn.toFixed(1)}/10`,
//           icon: '⚠️'
//         });
//       }
//     }
    
//     return {
//       ...analyticsData,
//       insights
//     };
//   }, [analyticsData]);

//   return {
//     // Data
//     dashboardData: processedDashboardData,
//     analyticsData: processedAnalyticsData,
//     trendData,
//     isLoading,
//     isRefreshing,
//     error,
//     filters,
    
//     // Actions
//     handleFilterChange,
//     handleTimeRangeChange,
//     handleConnectionTypeChange,
//     handleDateRangeChange,
//     handleRefresh,
//     handleExport,
//     fetchAllData,
    
//     // Derived state
//     hasData: !!dashboardData || !!analyticsData,
//     insightCount: processedAnalyticsData?.insights?.length || 0
//   };
// };

// export default useAnalytics;








import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import AnalyticsService from '../services/AnalyticsService';

const useAnalytics = (initialTimeRange = '30d', initialConnectionType = 'all') => {
  // State management
  const [dashboardData, setDashboardData] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Filter state
  const [filters, setFilters] = useState({
    time_range: initialTimeRange,
    connection_type: initialConnectionType
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

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    const signal = abortControllerRef.current?.signal;
    
    try {
      const response = await AnalyticsService.getDashboardData(
        filters.time_range,
        filters.connection_type,
        false,
        signal
      );
      setDashboardData(response.data || response);
      return response.data || response;
    } catch (err) {
      if (err.name !== 'AbortError' && err.name !== 'CanceledError') {
        console.error('Error fetching dashboard data:', err);
      }
      return null;
    }
  }, [filters.time_range, filters.connection_type]);

  // Fetch all analytics data
  const fetchAnalyticsData = useCallback(async () => {
    const signal = abortControllerRef.current?.signal;
    
    try {
      const [financial, usage, behavioral, hotspot] = await Promise.allSettled([
        AnalyticsService.getFinancialAnalytics(null, null, 'day', signal),
        AnalyticsService.getUsageAnalytics(null, null, 'day', signal),
        AnalyticsService.getBehavioralAnalytics('revenue_segment', signal),
        AnalyticsService.getHotspotAnalytics(null, null, signal)
      ]);

      const analytics = {
        financial: financial.status === 'fulfilled' ? (financial.value.data || financial.value) : null,
        usage: usage.status === 'fulfilled' ? (usage.value.data || usage.value) : null,
        behavioral: behavioral.status === 'fulfilled' ? (behavioral.value.data || behavioral.value) : null,
        hotspot: hotspot.status === 'fulfilled' ? (hotspot.value.data || hotspot.value) : null
      };

      setAnalyticsData(analytics);
      return analytics;
    } catch (err) {
      if (err.name !== 'AbortError' && err.name !== 'CanceledError') {
        console.error('Error fetching analytics data:', err);
      }
      return null;
    }
  }, []);

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const signal = abortPreviousRequest();
      
      await Promise.all([
        fetchDashboardData(),
        fetchAnalyticsData()
      ]);
    } catch (err) {
      if (err.name !== 'AbortError' && err.name !== 'CanceledError') {
        console.error('Error fetching analytics data:', err);
        setError(err.message || 'Failed to load analytics data');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [fetchDashboardData, fetchAnalyticsData, abortPreviousRequest]);

  // Initial load
  useEffect(() => {
    fetchAllData();
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchAllData]);

  const handleTimeRangeChange = useCallback((timeRange) => {
    setFilters(prev => ({
      ...prev,
      time_range: timeRange
    }));
  }, []);

  const handleConnectionTypeChange = useCallback((connectionType) => {
    setFilters(prev => ({
      ...prev,
      connection_type: connectionType
    }));
  }, []);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchAllData();
  }, [fetchAllData]);

  // Process dashboard data for charts
  const processedDashboardData = useMemo(() => {
    if (!dashboardData) return null;
    
    const { summary, financial, usage, client_analytics, plan_analytics } = dashboardData;
    
    const revenueChartData = {
      labels: financial?.revenue_trends?.daily?.map(d => d.date) || [],
      datasets: [{
        label: 'Revenue (KES)',
        data: financial?.revenue_trends?.daily?.map(d => d.revenue) || [],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true
      }]
    };
    
    const clientsChartData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
      datasets: [{
        label: 'New Clients',
        data: client_analytics?.new_clients_trend || [12, 19, 15, 25, 22, 18, 30],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true
      }]
    };
    
    const connectionDistributionData = {
      labels: client_analytics?.connection_distribution?.map(item => 
        item.connection_type || 'Unknown'
      ) || ['PPPoE', 'Hotspot'],
      datasets: [{
        data: client_analytics?.connection_distribution?.map(item => item.count) || [65, 35],
        backgroundColor: ['#3b82f6', '#10b981', '#8b5cf6']
      }]
    };
    
    const tierDistributionData = {
      labels: client_analytics?.tier_distribution?.map(item => 
        item.tier || 'Unknown'
      ) || ['New', 'Bronze', 'Silver', 'Gold'],
      datasets: [{
        data: client_analytics?.tier_distribution?.map(item => item.count) || [25, 40, 20, 15],
        backgroundColor: ['#94a3b8', '#92400e', '#64748b', '#f59e0b']
      }]
    };
    
    return {
      summary,
      financial,
      usage,
      client_analytics,
      plan_analytics,
      charts: {
        revenue: revenueChartData,
        clients: clientsChartData,
        connectionDistribution: connectionDistributionData,
        tierDistribution: tierDistributionData
      }
    };
  }, [dashboardData]);

  return {
    dashboardData: processedDashboardData,
    analyticsData,
    isLoading,
    isRefreshing,
    error,
    filters,
    handleTimeRangeChange,
    handleConnectionTypeChange,
    handleRefresh,
    fetchAllData,
    hasData: !!dashboardData || !!analyticsData
  };
};

export default useAnalytics;