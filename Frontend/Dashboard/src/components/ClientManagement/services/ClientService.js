
// import api from "../../../api"

// class ClientService {
//   // Get all clients with filters
//   async getClients(filters, pagination) {
//     const params = this.buildQueryParams(filters, pagination);
//     return await api.get('/api/user_management/clients/', { params });
//   }

//   // Get single client by ID
//   async getClientById(id) {
//     return await api.get(`/api/user_management/clients/${id}/`);
//   }

//   // Get client analytics
//   async getClientAnalytics(id) {
//     return await api.get(`/api/user_management/clients/${id}/analytics/`);
//   }

//   // Create PPPoE client
//   async createPPPoEClient(data) {
//     return await api.post('/api/user_management/clients/pppoe/create/', data);
//   }

//   // Create Hotspot client
//   async createHotspotClient(data) {
//     return await api.post('/api/user_management/clients/hotspot/create/', data);
//   }

//   // Update client tier
//   async updateClientTier(id, data) {
//     return await api.post(`/api/user_management/clients/${id}/update-tier/`, data);
//   }

//   // Update client metrics
//   async updateClientMetrics(id, metricsData) {
//     return await api.post(`/api/user_management/clients/${id}/update-metrics/`, metricsData);
//   }

//   // Update client status
//   async updateClientStatus(id, status, reason = '') {
//     return await api.post(`/api/user_management/clients/${id}/update-status/`, {
//       status,
//       reason
//     });
//   }

//   // Send message to client
//   async sendClientMessage(id, message) {
//     return await api.post(`/api/user_management/clients/${id}/send-message/`, {
//       message,
//       channel: 'sms'
//     });
//   }

//   // Delete client
//   async deleteClient(id) {
//     return await api.delete(`/api/user_management/clients/${id}/`);
//   }

//   // Search by phone
//   async searchByPhone(phone) {
//     return await api.get('/api/user_management/clients/search_by_phone/', {
//       params: { phone }
//     });
//   }

//   // Get commission dashboard
//   async getCommissionDashboard(marketerId = null) {
//     const params = marketerId ? { marketer_id: marketerId } : {};
//     return await api.get('/api/user_management/commissions/dashboard/', { params });
//   }

//   // Export clients data
//   async exportClients(filters, format = 'csv') {
//     const params = this.buildQueryParams(filters, { page_size: 10000 });
//     const response = await api.get('/api/user_management/clients/export/', { 
//       params: { ...params, format },
//       responseType: 'blob'
//     });
    
//     // Create download link
//     const url = window.URL.createObjectURL(new Blob([response.data]));
//     const link = document.createElement('a');
//     link.href = url;
//     link.setAttribute('download', `clients_export_${new Date().toISOString().split('T')[0]}.${format}`);
//     document.body.appendChild(link);
//     link.click();
//     link.remove();
    
//     return response;
//   }

//   // Get client statistics
//   async getClientStats(timeRange = '30d') {
//     return await api.get('/api/user_management/clients/stats/', {
//       params: { time_range: timeRange }
//     });
//   }

//   // Get client activity logs
//   async getClientActivity(id, limit = 50) {
//     return await api.get(`/api/user_management/clients/${id}/activity/`, {
//       params: { limit }
//     });
//   }

//   // Resend client credentials
//   async resendCredentials(id) {
//     return await api.post(`/api/user_management/clients/${id}/resend-credentials/`);
//   }

//   // Helper: Build query parameters
//   buildQueryParams(filters, pagination) {
//     const params = { ...filters, ...pagination };
    
//     // Remove 'all' values and empty strings
//     Object.keys(params).forEach(key => {
//       if (params[key] === 'all' || params[key] === '' || params[key] == null) {
//         delete params[key];
//       }
//     });

//     // Convert boolean strings to actual booleans
//     if (params.at_risk === 'true') params.at_risk = true;
//     if (params.at_risk === 'false') params.at_risk = false;
//     if (params.needs_attention === 'true') params.needs_attention = true;
//     if (params.needs_attention === 'false') params.needs_attention = false;
//     if (params.is_marketer === 'true') params.is_marketer = true;
//     if (params.is_marketer === 'false') params.is_marketer = false;

//     return params;
//   }
// }

// export default new ClientService();








// services/ClientService.js
 import api from "../../../api"

class ClientService {
  // Base URL for user management endpoints
  baseUrl = '/api/user_management';
  
  // Build query parameters from filters
  buildQueryParams(filters = {}, pagination = {}) {
    const params = { ...filters, ...pagination };
    
    // Clean up filter values
    Object.keys(params).forEach(key => {
      const value = params[key];
      
      // Remove 'all' values, empty strings, null, undefined
      if (value === 'all' || value === '' || value == null) {
        delete params[key];
        return;
      }
      
      // Convert boolean strings to actual booleans
      if (value === 'true') params[key] = true;
      if (value === 'false') params[key] = false;
      
      // Handle date formatting
      if (value instanceof Date) {
        params[key] = value.toISOString().split('T')[0];
      }
    });
    
    return params;
  }

  // Get all clients with filters and pagination
  async getClients(filters = {}, pagination = {}) {
    const params = this.buildQueryParams(filters, {
      page: pagination.current_page || 1,
      page_size: pagination.page_size || 20
    });
    
    return await api.get(`${this.baseUrl}/clients/`, { params });
  }

  // Get single client by ID
  async getClientById(id) {
    return await api.get(`${this.baseUrl}/clients/${id}/`);
  }

  // Get client analytics
  async getClientAnalytics(id, days = 30) {
    return await api.get(`${this.baseUrl}/clients/${id}/analytics/`, {
      params: { days }
    });
  }

  // Create PPPoE client
  async createPPPoEClient(data) {
    return await api.post(`${this.baseUrl}/clients/pppoe/create/`, data);
  }

  // Create Hotspot client
  async createHotspotClient(data) {
    return await api.post(`${this.baseUrl}/clients/hotspot/create/`, data);
  }

  // Update client tier
  async updateClientTier(id, tier, reason = '', sendNotification = true) {
    return await api.post(`${this.baseUrl}/clients/${id}/update-tier/`, {
      tier,
      reason,
      send_notification: sendNotification
    });
  }

  // Update client metrics (force recalculation)
  async updateClientMetrics(id) {
    return await api.post(`${this.baseUrl}/clients/${id}/update-metrics/`, {});
  }

  // Update client status
  async updateClientStatus(id, status, reason = '') {
    return await api.post(`${this.baseUrl}/clients/${id}/update-status/`, {
      status,
      reason
    });
  }

  // Send message to client
  async sendClientMessage(id, messageData) {
    return await api.post(`${this.baseUrl}/clients/${id}/send-message/`, messageData);
  }

  // Delete client
  async deleteClient(id) {
    return await api.delete(`${this.baseUrl}/clients/${id}/`);
  }

  // Search client by phone
  async searchByPhone(phone) {
    return await api.get(`${this.baseUrl}/clients/search/phone/`, {
      params: { phone_number: phone }
    });
  }

  // Get quick stats
  async getQuickStats(timeRange = '30d', connectionType = 'all') {
    return await api.get(`${this.baseUrl}/clients/quick-stats/`, {
      params: { time_range: timeRange, connection_type: connectionType }
    });
  }

  // Get client activity logs
  async getClientActivity(id, limit = 50) {
    return await api.get(`${this.baseUrl}/clients/${id}/activity/`, {
      params: { limit }
    });
  }

  // Resend client credentials
  async resendCredentials(id) {
    return await api.post(`${this.baseUrl}/clients/${id}/resend-credentials/`, {});
  }

  // Assign plan to client
  async assignPlan(clientId, planData) {
    return await api.post(`${this.baseUrl}/clients/${clientId}/assign_plan/`, planData);
  }

  // Change client plan
  async changePlan(clientId, planData) {
    return await api.post(`${this.baseUrl}/clients/${clientId}/change_plan/`, planData);
  }

  // Export clients data
  async exportClients(filters = {}, format = 'csv') {
    try {
      const params = this.buildQueryParams(filters);
      
      const response = await api.get(`${this.baseUrl}/clients/export/`, {
        params: { ...params, format },
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `clients_export_${new Date().toISOString().split('T')[0]}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  }

  // Get client stats (dashboard)
  async getClientStats(timeRange = '30d', connectionType = 'all') {
    return await api.get(`${this.baseUrl}/clients/stats/`, {
      params: { time_range: timeRange, connection_type: connectionType }
    });
  }

  // Update client profile
  async updateClient(id, updates) {
    return await api.patch(`${this.baseUrl}/clients/${id}/`, updates);
  }
}

export default new ClientService();