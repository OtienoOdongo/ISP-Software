





// /**
//  * Analytics API Service
//  * Handles all analytics-related API calls to /api/user_management/
//  */
// import api from '../../../api';

// class AnalyticsService {
//   constructor() {
//     this.baseURL = '/api/user_management';
//   }

//   /**
//    * Get comprehensive dashboard data
//    */
//   async getDashboardData(timeRange = '30d', connectionType = 'all', refresh = false, signal) {
//     const params = { 
//       time_range: timeRange, 
//       connection_type: connectionType 
//     };
    
//     if (refresh) params.refresh = true;
    
//     const response = await api.get(`${this.baseURL}/dashboard/`, { 
//       params,
//       signal 
//     });
//     return response.data;
//   }

//   /**
//    * Get financial analytics
//    */
//   async getFinancialAnalytics(startDate, endDate, groupBy = 'day', signal) {
//     const params = {};
//     if (startDate) params.start_date = startDate;
//     if (endDate) params.end_date = endDate;
//     params.group_by = groupBy;
    
//     const response = await api.get(`${this.baseURL}/analytics/financial/`, { 
//       params,
//       signal 
//     });
//     return response.data;
//   }

//   /**
//    * Get usage analytics
//    */
//   async getUsageAnalytics(startDate, endDate, groupBy = 'day', signal) {
//     const params = {};
//     if (startDate) params.start_date = startDate;
//     if (endDate) params.end_date = endDate;
//     params.group_by = groupBy;
    
//     const response = await api.get(`${this.baseURL}/analytics/usage/`, { 
//       params,
//       signal 
//     });
//     return response.data;
//   }

//   /**
//    * Get behavioral analytics
//    */
//   async getBehavioralAnalytics(segmentBy = 'revenue_segment', signal) {
//     const response = await api.get(`${this.baseURL}/analytics/behavioral/`, {
//       params: { segment_by: segmentBy },
//       signal
//     });
//     return response.data;
//   }

//   /**
//    * Get hotspot-specific analytics
//    */
//   async getHotspotAnalytics(startDate, endDate, signal) {
//     const params = {};
//     if (startDate) params.start_date = startDate;
//     if (endDate) params.end_date = endDate;
    
//     const response = await api.get(`${this.baseURL}/analytics/hotspot/`, { 
//       params,
//       signal 
//     });
//     return response.data;
//   }

//   /**
//    * Get trend data for charts
//    */
//   async getTrendData(metric = 'revenue', period = '30d', signal) {
//     const response = await api.get(`${this.baseURL}/analytics/trends/`, {
//       params: { metric, period },
//       signal
//     });
//     return response.data;
//   }

//   /**
//    * Get commission dashboard
//    */
//   async getCommissionDashboard(marketerId = null, signal) {
//     const params = {};
//     if (marketerId) params.marketer_id = marketerId;
    
//     const response = await api.get(`${this.baseURL}/commission-dashboard/`, { 
//       params,
//       signal 
//     });
//     return response.data;
//   }

//   /**
//    * Export analytics data
//    */
//   async exportAnalyticsData(format = 'csv', filters = {}, signal) {
//     const params = { format, ...filters };
    
//     const response = await api.get(`${this.baseURL}/analytics/export/`, {
//       params,
//       responseType: 'blob',
//       signal
//     });
    
//     if (response.data instanceof Blob) {
//       const url = window.URL.createObjectURL(response.data);
//       const link = document.createElement('a');
//       link.href = url;
//       link.setAttribute('download', `analytics_export_${new Date().toISOString().split('T')[0]}.${format}`);
//       document.body.appendChild(link);
//       link.click();
//       link.remove();
//       window.URL.revokeObjectURL(url);
//     }
    
//     return { success: true };
//   }

//   /**
//    * Refresh analytics cache
//    */
//   async refreshAnalyticsCache(signal) {
//     const response = await api.post(`${this.baseURL}/analytics/refresh/`, {}, { signal });
//     return response.data;
//   }
// }

// export default new AnalyticsService();









/**
 * Analytics API Service
 * Handles all analytics-related API calls to /api/user_management/
 */
import api from '../../../api';

class AnalyticsService {
  constructor() {
    this.baseURL = '/api/user_management';
  }

  /**
   * Get comprehensive dashboard data
   * Endpoint: /api/user_management/dashboard/
   */
  async getDashboardData(timeRange = '30d', connectionType = 'all', refresh = false, signal) {
    const params = { 
      time_range: timeRange, 
      connection_type: connectionType,
      refresh: refresh || undefined
    };
    
    const response = await api.get(`${this.baseURL}/dashboard/`, { params, signal });
    return response.data;
  }

  /**
   * Get financial analytics
   * Endpoint: /api/user_management/analytics/financial/
   */
  async getFinancialAnalytics(startDate, endDate, groupBy = 'day', signal) {
    const params = {
      start_date: startDate || undefined,
      end_date: endDate || undefined,
      group_by: groupBy
    };
    
    const response = await api.get(`${this.baseURL}/analytics/financial/`, { params, signal });
    return response.data;
  }

  /**
   * Get usage analytics
   * Endpoint: /api/user_management/analytics/usage/
   */
  async getUsageAnalytics(startDate, endDate, groupBy = 'day', signal) {
    const params = {
      start_date: startDate || undefined,
      end_date: endDate || undefined,
      group_by: groupBy
    };
    
    const response = await api.get(`${this.baseURL}/analytics/usage/`, { params, signal });
    return response.data;
  }

  /**
   * Get behavioral analytics
   * Endpoint: /api/user_management/analytics/behavioral/
   */
  async getBehavioralAnalytics(segmentBy = 'revenue_segment', signal) {
    const response = await api.get(`${this.baseURL}/analytics/behavioral/`, {
      params: { segment_by: segmentBy },
      signal
    });
    return response.data;
  }

  /**
   * Get hotspot-specific analytics
   * Endpoint: /api/user_management/analytics/hotspot/
   */
  async getHotspotAnalytics(startDate, endDate, signal) {
    const params = {
      start_date: startDate || undefined,
      end_date: endDate || undefined
    };
    
    const response = await api.get(`${this.baseURL}/analytics/hotspot/`, { params, signal });
    return response.data;
  }

  /**
   * Get trend data for charts
   * Endpoint: /api/user_management/analytics/trends/
   */
  async getTrendData(metric = 'revenue', period = '30d', signal) {
    const response = await api.get(`${this.baseURL}/analytics/trends/`, {
      params: { metric, period },
      signal
    });
    return response.data;
  }

  /**
   * Get commission dashboard
   * Endpoint: /api/user_management/commission-dashboard/
   */
  async getCommissionDashboard(marketerId = null, signal) {
    const params = marketerId ? { marketer_id: marketerId } : {};
    const response = await api.get(`${this.baseURL}/commission-dashboard/`, { params, signal });
    return response.data;
  }
}

export default new AnalyticsService();