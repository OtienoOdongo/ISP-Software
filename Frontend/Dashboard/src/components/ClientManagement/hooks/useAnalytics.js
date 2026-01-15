// import { useState, useEffect, useCallback, useMemo } from 'react';
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

//   // Fetch dashboard data
//   const fetchDashboardData = useCallback(async () => {
//     try {
//       setIsLoading(true);
//       setError(null);

//       const response = await AnalyticsService.getDashboardData(
//         filters.time_range,
//         filters.connection_type
//       );

//       setDashboardData(response.data);
//     } catch (err) {
//       console.error('Error fetching dashboard data:', err);
//       setError(err.response?.data?.error || 'Failed to load dashboard data');
//     } finally {
//       setIsLoading(false);
//     }
//   }, [filters.time_range, filters.connection_type]);

//   // Fetch analytics data
//   const fetchAnalyticsData = useCallback(async () => {
//     try {
//       const [financial, usage, behavioral, hotspot] = await Promise.all([
//         AnalyticsService.getFinancialAnalytics(filters.start_date, filters.end_date),
//         AnalyticsService.getUsageAnalytics(filters.start_date, filters.end_date),
//         AnalyticsService.getBehavioralAnalytics(),
//         AnalyticsService.getHotspotAnalytics(filters.start_date, filters.end_date)
//       ]);

//       setAnalyticsData({
//         financial: financial.data,
//         usage: usage.data,
//         behavioral: behavioral.data,
//         hotspot: hotspot.data
//       });
//     } catch (err) {
//       console.error('Error fetching analytics data:', err);
//       setError('Failed to load analytics data');
//     }
//   }, [filters.start_date, filters.end_date]);

//   // Fetch trend data
//   const fetchTrendData = useCallback(async () => {
//     try {
//       const response = await AnalyticsService.getTrendData(
//         filters.metric,
//         filters.time_range
//       );

//       setTrendData(response.data);
//     } catch (err) {
//       console.error('Error fetching trend data:', err);
//       setError('Failed to load trend data');
//     }
//   }, [filters.metric, filters.time_range]);

//   // Fetch all analytics data
//   const fetchAllData = useCallback(async () => {
//     try {
//       setIsLoading(true);
//       setError(null);

//       await Promise.all([
//         fetchDashboardData(),
//         fetchAnalyticsData(),
//         fetchTrendData()
//       ]);
//     } catch (err) {
//       console.error('Error fetching all analytics data:', err);
//       setError('Failed to load analytics data');
//     } finally {
//       setIsLoading(false);
//       setIsRefreshing(false);
//     }
//   }, [fetchDashboardData, fetchAnalyticsData, fetchTrendData]);

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
//   }, []);

//   // Handle time range change
//   const handleTimeRangeChange = useCallback((timeRange) => {
//     setFilters(prev => ({
//       ...prev,
//       time_range: timeRange
//     }));
//   }, []);

//   // Handle connection type change
//   const handleConnectionTypeChange = useCallback((connectionType) => {
//     setFilters(prev => ({
//       ...prev,
//       connection_type: connectionType
//     }));
//   }, []);

//   // Handle date range change
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
//     } catch (err) {
//       setError('Failed to export analytics data');
//     }
//   }, [filters]);

//   // Refresh analytics cache
//   const handleRefreshCache = useCallback(async () => {
//     try {
//       await AnalyticsService.refreshAnalyticsCache();
//       handleRefresh();
//     } catch (err) {
//       setError('Failed to refresh cache');
//     }
//   }, [handleRefresh]);

//   // Process dashboard data for charts
//   const processedDashboardData = useMemo(() => {
//     if (!dashboardData) return null;

//     const { summary, financial, usage, client_analytics, hotspot_analytics } = dashboardData;

//     // Prepare chart data
//     const revenueChartData = {
//       labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
//       datasets: [
//         {
//           label: 'Revenue (KES)',
//           data: [65000, 59000, 80000, 81000, 56000, 55000, 70000],
//           borderColor: '#3b82f6',
//           backgroundColor: 'rgba(59, 130, 246, 0.1)',
//           tension: 0.4
//         }
//       ]
//     };

//     const clientsChartData = {
//       labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
//       datasets: [
//         {
//           label: 'New Clients',
//           data: [12, 19, 15, 25, 22, 18, 30],
//           borderColor: '#10b981',
//           backgroundColor: 'rgba(16, 185, 129, 0.1)',
//           tension: 0.4
//         },
//         {
//           label: 'Active Clients',
//           data: [45, 52, 48, 55, 58, 52, 60],
//           borderColor: '#3b82f6',
//           backgroundColor: 'rgba(59, 130, 246, 0.1)',
//           tension: 0.4
//         }
//       ]
//     };

//     const connectionDistributionData = {
//       labels: client_analytics?.connection_distribution?.map(item => 
//         item.user__connection_type || 'Unknown'
//       ) || ['PPPoE', 'Hotspot'],
//       datasets: [
//         {
//           data: client_analytics?.connection_distribution?.map(item => item.count) || [65, 35],
//           backgroundColor: ['#3b82f6', '#10b981', '#8b5cf6']
//         }
//       ]
//     };

//     const tierDistributionData = {
//       labels: client_analytics?.tier_distribution?.map(item => 
//         item.tier || 'Unknown'
//       ) || ['New', 'Bronze', 'Silver', 'Gold'],
//       datasets: [
//         {
//           data: client_analytics?.tier_distribution?.map(item => item.count) || [25, 40, 20, 15],
//           backgroundColor: ['#94a3b8', '#92400e', '#64748b', '#f59e0b']
//         }
//       ]
//     };

//     return {
//       summary,
//       financial,
//       usage,
//       client_analytics,
//       hotspot_analytics,
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

//     // Calculate insights
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
//     if (usage?.metrics?.total_data_used) {
//       const dataUsed = usage.metrics.total_data_used;
//       if (dataUsed > 1000) { // More than 1TB
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

//     // Hotspot insights
//     if (hotspot?.conversion?.average) {
//       const conversionRate = hotspot.conversion.average;
//       if (conversionRate < 50) {
//         insights.push({
//           type: 'warning',
//           title: 'Low Hotspot Conversion',
//           message: `Conversion rate: ${conversionRate.toFixed(1)}%`,
//           icon: '📶'
//         });
//       }
//     }

//     return {
//       ...analyticsData,
//       insights,
//       metrics: {
//         // Key performance indicators
//         kpis: {
//           revenueGrowth: financial?.revenue_growth_rate || 0,
//           clientRetention: behavioral?.retention_rate || 0,
//           avgLifetimeValue: financial?.avg_client_value || 0,
//           dataUsagePerClient: usage?.metrics?.avg_monthly_data || 0,
//           hotspotConversion: hotspot?.conversion?.average || 0,
//           churnRisk: behavioral?.avg_churn_risk || 0
//         },
//         // Trends
//         trends: {
//           revenue: trendData?.revenue || [],
//           clients: trendData?.clients || [],
//           usage: trendData?.usage || []
//         }
//       }
//     };
//   }, [analyticsData, trendData]);

//   // Calculate performance metrics
//   const performanceMetrics = useMemo(() => {
//     if (!dashboardData?.summary) return null;

//     const { summary } = dashboardData;

//     return {
//       financialHealth: summary.revenue?.total > 100000 ? 'excellent' : 'good',
//       clientGrowth: summary.growth_rate > 10 ? 'positive' : 'stable',
//       retentionRate: summary.new_clients > summary.at_risk_clients * 2 ? 'good' : 'needs_attention',
//       overallScore: calculateOverallScore(summary)
//     };
//   }, [dashboardData]);

//   // Calculate overall performance score
//   const calculateOverallScore = (summary) => {
//     let score = 0;
    
//     // Revenue score (0-30)
//     const revenueScore = Math.min(30, (summary.revenue?.total || 0) / 10000);
//     score += revenueScore;
    
//     // Growth score (0-20)
//     const growthScore = Math.min(20, Math.max(0, summary.growth_rate || 0));
//     score += growthScore;
    
//     // Retention score (0-25)
//     const retentionScore = summary.new_clients > 0 
//       ? Math.min(25, (summary.new_clients / (summary.at_risk_clients || 1)) * 5)
//       : 0;
//     score += retentionScore;
    
//     // Active clients score (0-25)
//     const activeScore = summary.total_clients > 0
//       ? (summary.active_clients / summary.total_clients) * 25
//       : 0;
//     score += activeScore;
    
//     return Math.round(score);
//   };

//   // Get alerts from dashboard data
//   const alerts = useMemo(() => {
//     if (!dashboardData?.alerts) return [];

//     return dashboardData.alerts.map(alert => ({
//       ...alert,
//       severity: alert.severity || 'medium',
//       timestamp: alert.timestamp || new Date().toISOString()
//     }));
//   }, [dashboardData]);

//   return {
//     // State
//     dashboardData: processedDashboardData,
//     analyticsData: processedAnalyticsData,
//     trendData,
//     performanceMetrics,
//     alerts,
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
//     handleRefreshCache,
//     fetchAllData,

//     // Helpers
//     hasData: !!dashboardData || !!analyticsData,
//     overallScore: performanceMetrics?.overallScore || 0,
//     insightCount: processedAnalyticsData?.insights?.length || 0,
//     alertCount: alerts.length
//   };
// };

// export default useAnalytics;









// hooks/useAnalytics.jsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import AnalyticsService from '../services/AnalyticsService';

const useAnalytics = (initialTimeRange = '30d', initialConnectionType = 'all') => {
  // State management
  const [dashboardData, setDashboardData] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [trendData, setTrendData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Filter state
  const [filters, setFilters] = useState({
    time_range: initialTimeRange,
    connection_type: initialConnectionType,
    start_date: '',
    end_date: '',
    group_by: 'day',
    metric: 'revenue'
  });

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await AnalyticsService.getDashboardData(
        filters.time_range,
        filters.connection_type
      );
      setDashboardData(response.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      // Don't set error for optional data
    }
  }, [filters.time_range, filters.connection_type]);

  // Fetch analytics data
  const fetchAnalyticsData = useCallback(async () => {
    try {
      const [financial, usage, behavioral, hotspot] = await Promise.allSettled([
        AnalyticsService.getFinancialAnalytics(filters.start_date, filters.end_date, filters.group_by),
        AnalyticsService.getUsageAnalytics(filters.start_date, filters.end_date, filters.group_by),
        AnalyticsService.getBehavioralAnalytics(),
        AnalyticsService.getHotspotAnalytics(filters.start_date, filters.end_date)
      ]);

      const analytics = {
        financial: financial.status === 'fulfilled' ? financial.value.data : null,
        usage: usage.status === 'fulfilled' ? usage.value.data : null,
        behavioral: behavioral.status === 'fulfilled' ? behavioral.value.data : null,
        hotspot: hotspot.status === 'fulfilled' ? hotspot.value.data : null
      };

      setAnalyticsData(analytics);
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      // Analytics are optional
    }
  }, [filters.start_date, filters.end_date, filters.group_by]);

  // Fetch trend data
  const fetchTrendData = useCallback(async () => {
    try {
      const response = await AnalyticsService.getTrendData(
        filters.metric,
        filters.time_range
      );
      setTrendData(response.data);
    } catch (err) {
      console.error('Error fetching trend data:', err);
      // Trend data is optional
    }
  }, [filters.metric, filters.time_range]);

  // Fetch all analytics data
  const fetchAllData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      await Promise.all([
        fetchDashboardData(),
        fetchAnalyticsData(),
        fetchTrendData()
      ]);
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError(err.message || 'Failed to load analytics data');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [fetchDashboardData, fetchAnalyticsData, fetchTrendData]);

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
  }, []);

  // Handle time range change
  const handleTimeRangeChange = useCallback((timeRange) => {
    setFilters(prev => ({
      ...prev,
      time_range: timeRange
    }));
  }, []);

  // Handle connection type change
  const handleConnectionTypeChange = useCallback((connectionType) => {
    setFilters(prev => ({
      ...prev,
      connection_type: connectionType
    }));
  }, []);

  // Handle date range change
  const handleDateRangeChange = useCallback((startDate, endDate) => {
    setFilters(prev => ({
      ...prev,
      start_date: startDate,
      end_date: endDate
    }));
  }, []);

  // Refresh data
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchAllData();
  }, [fetchAllData]);

  // Export analytics data
  const handleExport = useCallback(async (format = 'csv') => {
    try {
      await AnalyticsService.exportAnalyticsData(format, filters);
      return { success: true };
    } catch (err) {
      const errorMsg = err.message || 'Failed to export analytics data';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, [filters]);

  // Refresh analytics cache
  const handleRefreshCache = useCallback(async () => {
    try {
      await AnalyticsService.refreshAnalyticsCache();
      handleRefresh();
    } catch (err) {
      console.error('Failed to refresh cache:', err);
      // Cache refresh is optional
    }
  }, [handleRefresh]);

  // Process dashboard data for charts
  const processedDashboardData = useMemo(() => {
    if (!dashboardData) return null;
    
    const { summary, financial, usage, client_analytics, hotspot_analytics } = dashboardData;
    
    // Prepare chart data from actual data if available
    const revenueChartData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'], // Default labels
      datasets: [
        {
          label: 'Revenue (KES)',
          data: financial?.revenue_trends?.daily?.map(d => d.revenue) || [65000, 59000, 80000, 81000, 56000, 55000, 70000],
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4
        }
      ]
    };
    
    const clientsChartData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
      datasets: [
        {
          label: 'New Clients',
          data: [12, 19, 15, 25, 22, 18, 30],
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4
        },
        {
          label: 'Active Clients',
          data: [45, 52, 48, 55, 58, 52, 60],
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4
        }
      ]
    };
    
    const connectionDistributionData = {
      labels: client_analytics?.connection_distribution?.map(item => 
        item.connection_type || 'Unknown'
      ) || ['PPPoE', 'Hotspot'],
      datasets: [
        {
          data: client_analytics?.connection_distribution?.map(item => item.count) || [65, 35],
          backgroundColor: ['#3b82f6', '#10b981', '#8b5cf6']
        }
      ]
    };
    
    const tierDistributionData = {
      labels: client_analytics?.tier_distribution?.map(item => 
        item.tier || 'Unknown'
      ) || ['New', 'Bronze', 'Silver', 'Gold'],
      datasets: [
        {
          data: client_analytics?.tier_distribution?.map(item => item.count) || [25, 40, 20, 15],
          backgroundColor: ['#94a3b8', '#92400e', '#64748b', '#f59e0b']
        }
      ]
    };
    
    return {
      summary,
      financial,
      usage,
      client_analytics,
      hotspot_analytics,
      charts: {
        revenue: revenueChartData,
        clients: clientsChartData,
        connectionDistribution: connectionDistributionData,
        tierDistribution: tierDistributionData
      }
    };
  }, [dashboardData]);

  // Process analytics data for insights
  const processedAnalyticsData = useMemo(() => {
    if (!analyticsData) return null;
    
    const { financial, usage, behavioral, hotspot } = analyticsData;
    const insights = [];
    
    // Financial insights
    if (financial?.revenue_growth_rate) {
      const growth = financial.revenue_growth_rate;
      if (growth > 20) {
        insights.push({
          type: 'success',
          title: 'Strong Revenue Growth',
          message: `Revenue growing at ${growth}% month-over-month`,
          icon: '📈'
        });
      } else if (growth < 0) {
        insights.push({
          type: 'warning',
          title: 'Revenue Decline',
          message: `Revenue decreased by ${Math.abs(growth)}%`,
          icon: '📉'
        });
      }
    }
    
    // Usage insights
    if (usage?.total_data_used_gb) {
      const dataUsed = usage.total_data_used_gb;
      if (dataUsed > 1000) {
        insights.push({
          type: 'info',
          title: 'High Data Usage',
          message: `Total data used: ${(dataUsed / 1000).toFixed(1)}TB`,
          icon: '💾'
        });
      }
    }
    
    // Behavioral insights
    if (behavioral?.avg_churn_risk) {
      const avgChurn = behavioral.avg_churn_risk;
      if (avgChurn > 7) {
        insights.push({
          type: 'danger',
          title: 'High Churn Risk',
          message: `Average churn risk: ${avgChurn.toFixed(1)}/10`,
          icon: '⚠️'
        });
      }
    }
    
    // Hotspot insights
    if (hotspot?.conversion_funnel?.overall_conversion_rate) {
      const conversionRate = hotspot.conversion_funnel.overall_conversion_rate;
      if (conversionRate < 50) {
        insights.push({
          type: 'warning',
          title: 'Low Hotspot Conversion',
          message: `Conversion rate: ${conversionRate.toFixed(1)}%`,
          icon: '📶'
        });
      }
    }
    
    return {
      ...analyticsData,
      insights,
      metrics: {
        kpis: {
          revenueGrowth: financial?.revenue_growth_rate || 0,
          clientRetention: behavioral?.retention_rate || 0,
          avgLifetimeValue: financial?.avg_client_value || 0,
          dataUsagePerClient: usage?.avg_monthly_data_per_client_gb || 0,
          hotspotConversion: hotspot?.conversion_funnel?.overall_conversion_rate || 0,
          churnRisk: behavioral?.avg_churn_risk || 0
        },
        trends: trendData || {}
      }
    };
  }, [analyticsData, trendData]);

  // Calculate performance metrics
  const performanceMetrics = useMemo(() => {
    if (!dashboardData?.summary) return null;
    
    const { summary } = dashboardData;
    
    // Calculate overall score
    let overallScore = 0;
    
    // Revenue score (0-30)
    const revenue = summary.revenue?.total || summary.total_revenue || 0;
    const revenueScore = Math.min(30, revenue / 10000);
    overallScore += revenueScore;
    
    // Growth score (0-20)
    const growthRate = summary.growth_rate || 0;
    const growthScore = Math.min(20, Math.max(0, growthRate));
    overallScore += growthScore;
    
    // Retention score (0-25)
    const newClients = summary.new_clients || 0;
    const atRisk = summary.at_risk_clients || 0;
    const retentionScore = newClients > 0
      ? Math.min(25, (newClients / (atRisk || 1)) * 5)
      : 0;
    overallScore += retentionScore;
    
    // Active clients score (0-25)
    const totalClients = summary.total_clients || 0;
    const activeClients = summary.active_clients || 0;
    const activeScore = totalClients > 0
      ? (activeClients / totalClients) * 25
      : 0;
    overallScore += activeScore;
    
    return {
      financialHealth: revenue > 100000 ? 'excellent' : 'good',
      clientGrowth: growthRate > 10 ? 'positive' : 'stable',
      retentionRate: newClients > atRisk * 2 ? 'good' : 'needs_attention',
      overallScore: Math.round(overallScore)
    };
  }, [dashboardData]);

  // Get alerts from dashboard data
  const alerts = useMemo(() => {
    if (!dashboardData?.alerts) return [];
    
    return dashboardData.alerts.map(alert => ({
      ...alert,
      severity: alert.severity || 'medium',
      timestamp: alert.timestamp || new Date().toISOString()
    }));
  }, [dashboardData]);

  return {
    // Data
    dashboardData: processedDashboardData,
    analyticsData: processedAnalyticsData,
    trendData,
    performanceMetrics,
    alerts,
    isLoading,
    isRefreshing,
    error,
    filters,
    
    // Actions
    handleFilterChange,
    handleTimeRangeChange,
    handleConnectionTypeChange,
    handleDateRangeChange,
    handleRefresh,
    handleExport,
    handleRefreshCache,
    fetchAllData,
    
    // Derived state
    hasData: !!dashboardData || !!analyticsData,
    overallScore: performanceMetrics?.overallScore || 0,
    insightCount: processedAnalyticsData?.insights?.length || 0,
    alertCount: alerts.length
  };
};

export default useAnalytics;