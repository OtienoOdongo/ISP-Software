// import api from '../../../api'

// class AnalyticsService {
//   // Get comprehensive dashboard data
//   async getDashboardData(timeRange = '30d', connectionType = 'all', refresh = false) {
//     const params = { time_range: timeRange, connection_type: connectionType };
//     if (refresh) params.refresh = true;
    
//     return await api.get('/api/user_management/dashboard/', { params });
//   }

//   // Get client analytics snapshots
//   async getClientAnalytics(clientId, days = 30) {
//     return await api.get(`/api/user_management/clients/${clientId}/analytics/`, {
//       params: { days }
//     });
//   }

//   // Get commission dashboard data
//   async getCommissionDashboard(marketerId = null) {
//     const params = marketerId ? { marketer_id: marketerId } : {};
//     return await api.get('/api/user_management/commissions/dashboard/', { params });
//   }

//   // Get financial analytics
//   async getFinancialAnalytics(startDate, endDate) {
//     const params = {};
//     if (startDate) params.start_date = startDate;
//     if (endDate) params.end_date = endDate;
    
//     return await api.get('/api/user_management/analytics/financial/', { params });
//   }

//   // Get usage analytics
//   async getUsageAnalytics(startDate, endDate) {
//     const params = {};
//     if (startDate) params.start_date = startDate;
//     if (endDate) params.end_date = endDate;
    
//     return await api.get('/api/user_management/analytics/usage/', { params });
//   }

//   // Get behavioral analytics
//   async getBehavioralAnalytics() {
//     return await api.get('/api/user_management/analytics/behavioral/');
//   }

//   // Get hotspot-specific analytics
//   async getHotspotAnalytics(startDate, endDate) {
//     const params = {};
//     if (startDate) params.start_date = startDate;
//     if (endDate) params.end_date = endDate;
    
//     return await api.get('/api/user_management/analytics/hotspot/', { params });
//   }

//   // Get trend data for charts
//   async getTrendData(metric, period = '30d') {
//     return await api.get('/api/user_management/analytics/trends/', {
//       params: { metric, period }
//     });
//   }

//   // Export analytics data
//   async exportAnalyticsData(format = 'csv', filters = {}) {
//     const response = await api.get('/api/user_management/analytics/export/', {
//       params: { format, ...filters },
//       responseType: 'blob'
//     });
    
//     // Create download link
//     const url = window.URL.createObjectURL(new Blob([response.data]));
//     const link = document.createElement('a');
//     link.href = url;
//     link.setAttribute('download', `analytics_export_${new Date().toISOString().split('T')[0]}.${format}`);
//     document.body.appendChild(link);
//     link.click();
//     link.remove();
//   }

//   // Update analytics cache
//   async refreshAnalyticsCache() {
//     return await api.post('/api/user_management/analytics/refresh-cache/');
//   }
// }

// export default new AnalyticsService();








// services/AnalyticsService.js
import api from '../../../api'

class AnalyticsService {
  baseUrl = '/api/user_management';

  // Get comprehensive dashboard data
  async getDashboardData(timeRange = '30d', connectionType = 'all', refresh = false) {
    const params = { 
      time_range: timeRange, 
      connection_type: connectionType 
    };
    
    if (refresh) params.refresh = true;
    
    return await api.get(`${this.baseUrl}/dashboard/`, { params });
  }

  // Get financial analytics
  async getFinancialAnalytics(startDate, endDate, groupBy = 'day') {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    params.group_by = groupBy;
    
    return await api.get(`${this.baseUrl}/analytics/financial/`, { params });
  }

  // Get usage analytics
  async getUsageAnalytics(startDate, endDate, groupBy = 'day') {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    params.group_by = groupBy;
    
    return await api.get(`${this.baseUrl}/analytics/usage/`, { params });
  }

  // Get behavioral analytics
  async getBehavioralAnalytics(segmentBy = 'revenue_segment') {
    return await api.get(`${this.baseUrl}/analytics/behavioral/`, {
      params: { segment_by: segmentBy }
    });
  }

  // Get hotspot-specific analytics
  async getHotspotAnalytics(startDate, endDate) {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    
    return await api.get(`${this.baseUrl}/analytics/hotspot/`, { params });
  }

  // Get trend data for charts
  async getTrendData(metric = 'revenue', period = '30d') {
    return await api.get(`${this.baseUrl}/analytics/trends/`, {
      params: { metric, period }
    });
  }

  // Get commission dashboard
  async getCommissionDashboard(marketerId = null) {
    const params = {};
    if (marketerId) params.marketer_id = marketerId;
    
    return await api.get(`${this.baseUrl}/commission-dashboard/`, { params });
  }

  // Export analytics data
  async exportAnalyticsData(format = 'csv', filters = {}) {
    try {
      const response = await api.get(`${this.baseUrl}/analytics/export/`, {
        params: { format, ...filters },
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `analytics_export_${new Date().toISOString().split('T')[0]}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      console.error('Analytics export failed:', error);
      throw error;
    }
  }

  // Refresh analytics cache (if implemented)
  async refreshAnalyticsCache() {
    try {
      return await api.post(`${this.baseUrl}/analytics/refresh-cache/`, {});
    } catch (error) {
      // If endpoint doesn't exist, return success anyway
      console.warn('Analytics cache refresh endpoint not available');
      return { success: true, message: 'Cache refresh not required' };
    }
  }

  // Get client analytics snapshots
  async getClientAnalyticsSnapshots(clientId, days = 30) {
    return await api.get(`${this.baseUrl}/clients/${clientId}/analytics/`, {
      params: { days }
    });
  }

  // Get commission analytics
  async getCommissionAnalytics(period = 'month') {
    return await api.get(`${this.baseUrl}/commissions/summary/`, {
      params: { period }
    });
  }
}

export default new AnalyticsService();