

// /**
//  * Client API Service
//  * Handles all client-related API calls to /api/user_management/
//  */
// import api from "../../../api"

// class ClientService {
//   constructor() {
//     this.baseURL = '/api/user_management';
//   }

//   /**
//    * Build query parameters from filters
//    */
//   buildQueryParams(filters = {}, pagination = {}) {
//     const params = { ...filters, ...pagination };
    
//     // Clean up filter values
//     Object.keys(params).forEach(key => {
//       const value = params[key];
      
//       // Remove 'all' values, empty strings, null, undefined
//       if (value === 'all' || value === '' || value == null) {
//         delete params[key];
//         return;
//       }
      
//       // Convert boolean strings
//       if (value === 'true') params[key] = true;
//       if (value === 'false') params[key] = false;
      
//       // Handle date formatting
//       if (value instanceof Date) {
//         params[key] = value.toISOString().split('T')[0];
//       }
//     });
    
//     return params;
//   }

//   /**
//    * Get all clients with filters and pagination
//    */
//   async getClients(filters = {}, pagination = {}) {
//     const params = this.buildQueryParams(filters, {
//       page: pagination.page || 1,
//       page_size: pagination.pageSize || 20
//     });
    
//     const response = await api.get(`${this.baseURL}/clients/`, { params });
//     return response.data;
//   }

//   /**
//    * Get single client by ID
//    */
//   async getClientById(id) {
//     const response = await api.get(`${this.baseURL}/clients/${id}/`);
//     return response.data;
//   }

//   /**
//    * Get client analytics
//    */
//   async getClientAnalytics(id, days = 30) {
//     const response = await api.get(`${this.baseURL}/clients/${id}/analytics/`, {
//       params: { days }
//     });
//     return response.data;
//   }

//   /**
//    * Create PPPoE client
//    */
//   async createPPPoEClient(data) {
//     const response = await api.post(`${this.baseURL}/clients/pppoe/create/`, {
//       name: data.name,
//       phone_number: data.phone_number,
//       client_type: data.client_type || 'residential',
//       location: data.location,
//       send_sms: data.send_sms !== false,
//       assign_marketer: data.assign_marketer || false,
//       referral_code: data.referral_code
//     });
//     return response.data;
//   }

//   /**
//    * Create Hotspot client
//    */
//   async createHotspotClient(data) {
//     const response = await api.post(`${this.baseURL}/clients/hotspot/create/`, {
//       phone_number: data.phone_number,
//       client_type: data.client_type || 'residential',
//       send_welcome_sms: data.send_welcome_sms !== false
//     });
//     return response.data;
//   }

//   /**
//    * Update client tier
//    */
//   async updateClientTier(id, tier, reason = '', sendNotification = true) {
//     const response = await api.post(`${this.baseURL}/clients/${id}/update-tier/`, {
//       tier,
//       reason,
//       send_notification: sendNotification
//     });
//     return response.data;
//   }

//   /**
//    * Update client metrics (force recalculation)
//    */
//   async updateClientMetrics(id) {
//     const response = await api.post(`${this.baseURL}/clients/${id}/update-metrics/`);
//     return response.data;
//   }

//   /**
//    * Update client status
//    */
//   async updateClientStatus(id, status, reason = '') {
//     const response = await api.post(`${this.baseURL}/clients/${id}/update-status/`, {
//       status,
//       reason
//     });
//     return response.data;
//   }

//   /**
//    * Send message to client
//    */
//   async sendClientMessage(id, messageData) {
//     const response = await api.post(`${this.baseURL}/clients/${id}/send-message/`, {
//       message: messageData.message,
//       channel: messageData.channel || 'sms',
//       priority: messageData.priority || 'normal'
//     });
//     return response.data;
//   }

//   /**
//    * Delete client
//    */
//   async deleteClient(id) {
//     const response = await api.delete(`${this.baseURL}/clients/${id}/`);
//     return response.data;
//   }

//   /**
//    * Search client by phone
//    */
//   async searchByPhone(phone) {
//     const response = await api.get(`${this.baseURL}/clients/search/phone/`, {
//       params: { phone }
//     });
//     return response.data;
//   }

//   /**
//    * Get quick stats
//    */
//   async getQuickStats() {
//     const response = await api.get(`${this.baseURL}/clients/quick-stats/`);
//     return response.data;
//   }

//   /**
//    * Get client activity logs
//    */
//   async getClientActivity(id, limit = 50) {
//     const response = await api.get(`${this.baseURL}/clients/${id}/activity/`, {
//       params: { limit }
//     });
//     return response.data;
//   }

//   /**
//    * Resend client credentials
//    */
//   async resendCredentials(id) {
//     const response = await api.post(`${this.baseURL}/clients/${id}/resend-credentials/`);
//     return response.data;
//   }

//   /**
//    * Assign plan to client
//    */
//   async assignPlan(clientId, planData) {
//     const response = await api.post(`${this.baseURL}/clients/${clientId}/assign_plan/`, {
//       plan_id: planData.plan_id,
//       auto_renew: planData.auto_renew !== false,
//       duration_hours: planData.duration_hours || 720,
//       router_id: planData.router_id,
//       hotspot_mac_address: planData.hotspot_mac_address
//     });
//     return response.data;
//   }

//   /**
//    * Change client plan
//    */
//   async changePlan(clientId, planData) {
//     const response = await api.post(`${this.baseURL}/clients/${clientId}/change_plan/`, {
//       plan_id: planData.plan_id,
//       subscription_id: planData.subscription_id,
//       immediate: planData.immediate || false,
//       prorate: planData.prorate !== false,
//       notes: planData.notes
//     });
//     return response.data;
//   }

//   /**
//    * Renew client plan
//    */
//   async renewPlan(clientId, planData) {
//     const response = await api.post(`${this.baseURL}/clients/${clientId}/renew_plan/`, {
//       subscription_id: planData.subscription_id,
//       duration_hours: planData.duration_hours || 720,
//       auto_renew: planData.auto_renew !== false,
//       payment_method: planData.payment_method || 'mpesa',
//       notes: planData.notes
//     });
//     return response.data;
//   }

//   /**
//    * Export clients data
//    */
//   async exportClients(filters = {}, format = 'csv') {
//     const params = this.buildQueryParams(filters);
    
//     const response = await api.get(`${this.baseURL}/clients/export/`, {
//       params: { ...params, format },
//       responseType: 'blob'
//     });
    
//     return response.data;
//   }

//   /**
//    * Get client stats (dashboard)
//    */
//   async getClientStats() {
//     const response = await api.get(`${this.baseURL}/clients/stats/`);
//     return response.data;
//   }

//   /**
//    * Update client profile
//    */
//   async updateClient(id, updates) {
//     const response = await api.patch(`${this.baseURL}/clients/${id}/`, updates);
//     return response.data;
//   }

//   /**
//    * Get client plan management
//    */
//   async getClientPlanManagement(clientId) {
//     const response = await api.get(`${this.baseURL}/clients/${clientId}/plans/`);
//     return response.data;
//   }

//   /**
//    * Get client plan history
//    */
//   async getClientPlanHistory(clientId) {
//     const response = await api.get(`${this.baseURL}/clients/${clientId}/plans/history/`);
//     return response.data;
//   }

//   /**
//    * Get client plan recommendations
//    */
//   async getClientPlanRecommendations(clientId) {
//     const response = await api.get(`${this.baseURL}/clients/${clientId}/plans/recommendations/`);
//     return response.data;
//   }
// }

// export default new ClientService();









/**
 * Client API Service
 * Handles all client-related API calls to /api/user_management/
 */
import api from '../../../api';

class ClientService {
  constructor() {
    this.baseURL = '/api/user_management';
  }

  /**
   * Build query parameters from filters
   */
  buildQueryParams(filters = {}, pagination = {}) {
    const params = { ...filters, ...pagination };
    
    Object.keys(params).forEach(key => {
      const value = params[key];
      
      if (value === 'all' || value === '' || value == null) {
        delete params[key];
        return;
      }
      
      if (value === 'true') params[key] = true;
      if (value === 'false') params[key] = false;
      
      if (value instanceof Date) {
        params[key] = value.toISOString().split('T')[0];
      }
    });
    
    return params;
  }

  /**
   * Get all clients with filters and pagination
   * Endpoint: /api/user_management/clients/
   */
  async getClients(filters = {}, pagination = {}) {
    const params = this.buildQueryParams(filters, {
      page: pagination.page || 1,
      page_size: pagination.pageSize || 20
    });
    
    const response = await api.get(`${this.baseURL}/clients/`, { params });
    return response.data;
  }

  /**
   * Get single client by ID
   * Endpoint: /api/user_management/clients/{id}/
   */
  async getClientById(id) {
    const response = await api.get(`${this.baseURL}/clients/${id}/`);
    return response.data;
  }

  /**
   * Get client analytics
   * Endpoint: /api/user_management/clients/{id}/analytics/
   */
  async getClientAnalytics(id, days = 30) {
    const response = await api.get(`${this.baseURL}/clients/${id}/analytics/`, {
      params: { days }
    });
    return response.data;
  }

  /**
   * Get client activity logs
   * Endpoint: /api/user_management/clients/{id}/activity/
   */
  async getClientActivity(id, limit = 50) {
    const response = await api.get(`${this.baseURL}/clients/${id}/activity/`, {
      params: { limit }
    });
    return response.data;
  }

  /**
   * Create PPPoE client
   * Endpoint: /api/user_management/clients/pppoe/create/
   */
  async createPPPoEClient(data) {
    const response = await api.post(`${this.baseURL}/clients/pppoe/create/`, {
      name: data.name,
      phone_number: data.phone_number,
      client_type: data.client_type || 'residential',
      location: data.location,
      send_sms: data.send_sms !== false,
      assign_marketer: data.assign_marketer || false,
      referral_code: data.referral_code
    });
    return response.data;
  }

  /**
   * Create Hotspot client
   * Endpoint: /api/user_management/clients/hotspot/create/
   */
  async createHotspotClient(data) {
    const response = await api.post(`${this.baseURL}/clients/hotspot/create/`, {
      phone_number: data.phone_number,
      client_type: data.client_type || 'residential',
      send_welcome_sms: data.send_welcome_sms !== false
    });
    return response.data;
  }

  /**
   * Update client (PATCH)
   * Endpoint: /api/user_management/clients/{id}/
   */
  async updateClient(id, updates) {
    const response = await api.patch(`${this.baseURL}/clients/${id}/`, updates);
    return response.data;
  }

  /**
   * Delete client
   * Endpoint: /api/user_management/clients/{id}/
   */
  async deleteClient(id) {
    const response = await api.delete(`${this.baseURL}/clients/${id}/`);
    return response.data;
  }

  /**
   * Update client tier
   * Endpoint: /api/user_management/clients/{id}/update-tier/
   */
  async updateClientTier(id, tier, reason = '', sendNotification = true) {
    const response = await api.post(`${this.baseURL}/clients/${id}/update-tier/`, {
      tier,
      reason,
      send_notification: sendNotification
    });
    return response.data;
  }

  /**
   * Update client metrics (force recalculation)
   * Endpoint: /api/user_management/clients/{id}/update-metrics/
   */
  async updateClientMetrics(id) {
    const response = await api.post(`${this.baseURL}/clients/${id}/update-metrics/`);
    return response.data;
  }

  /**
   * Send message to client
   * Endpoint: /api/user_management/clients/{id}/send-message/
   */
  async sendClientMessage(id, messageData) {
    const response = await api.post(`${this.baseURL}/clients/${id}/send-message/`, {
      message: messageData.message,
      channel: messageData.channel || 'sms',
      priority: messageData.priority || 'normal'
    });
    return response.data;
  }

  /**
   * Resend client credentials
   * Endpoint: /api/user_management/clients/{id}/resend-credentials/
   */
  async resendCredentials(id) {
    const response = await api.post(`${this.baseURL}/clients/${id}/resend-credentials/`);
    return response.data;
  }

  /**
   * Search client by phone
   * Endpoint: /api/user_management/clients/search/phone/
   */
  async searchByPhone(phone) {
    const response = await api.get(`${this.baseURL}/clients/search/phone/`, {
      params: { phone }
    });
    return response.data;
  }

  /**
   * Get quick stats
   * Endpoint: /api/user_management/clients/quick-stats/
   */
  async getQuickStats() {
    const response = await api.get(`${this.baseURL}/clients/quick-stats/`);
    return response.data;
  }

  /**
   * Export clients
   * Endpoint: /api/user_management/clients/export/
   */
  async exportClients(filters = {}, format = 'csv') {
    const params = this.buildQueryParams({ ...filters, format });
    
    const response = await api.get(`${this.baseURL}/clients/export/`, {
      params,
      responseType: 'blob'
    });
    
    return response.data;
  }
}

export default new ClientService();















