// /**
//  * Plan Service
//  * Handles all plan-related API calls to /api/user_management/
//  */
// import api from '../../../api'

// class PlanService {
//   constructor() {
//     this.baseURL = '/api/user_management';
//   }

//   /**
//    * Get plan management for a client
//    */
//   async getClientPlanManagement(clientId) {
//     const response = await api.get(`${this.baseURL}/clients/${clientId}/plans/`);
//     return response.data;
//   }

//   /**
//    * Get plan history for a client
//    */
//   async getClientPlanHistory(clientId) {
//     const response = await api.get(`${this.baseURL}/clients/${clientId}/plans/history/`);
//     return response.data;
//   }

//   /**
//    * Get plan recommendations for a client
//    */
//   async getClientPlanRecommendations(clientId) {
//     const response = await api.get(`${this.baseURL}/clients/${clientId}/plans/recommendations/`);
//     return response.data;
//   }

//   /**
//    * Assign plan to client
//    */
//   async assignPlan(clientId, planData) {
//     const response = await api.post(`${this.baseURL}/clients/${clientId}/plans/assign/`, {
//       plan_id: planData.plan_id,
//       auto_renew: planData.auto_renew !== false,
//       duration_hours: planData.duration_hours || 720,
//       router_id: planData.router_id,
//       hotspot_mac_address: planData.hotspot_mac_address
//     });
//     return response.data;
//   }

//   /**
//    * Change client's current plan
//    */
//   async changePlan(clientId, planData) {
//     const response = await api.post(`${this.baseURL}/clients/${clientId}/plans/change/`, {
//       plan_id: planData.plan_id,
//       subscription_id: planData.subscription_id,
//       immediate: planData.immediate || false,
//       prorate: planData.prorate !== false,
//       notes: planData.notes
//     });
//     return response.data;
//   }

//   /**
//    * Renew client's current plan
//    */
//   async renewPlan(clientId, planData) {
//     const response = await api.post(`${this.baseURL}/clients/${clientId}/plans/renew/`, {
//       subscription_id: planData.subscription_id,
//       duration_hours: planData.duration_hours || 720,
//       auto_renew: planData.auto_renew !== false,
//       payment_method: planData.payment_method || 'mpesa',
//       notes: planData.notes
//     });
//     return response.data;
//   }

//   /**
//    * Suspend client's plan
//    */
//   async suspendPlan(clientId, subscriptionId, reason = '') {
//     const response = await api.post(`${this.baseURL}/clients/${clientId}/plans/suspend/`, {
//       subscription_id: subscriptionId,
//       reason
//     });
//     return response.data;
//   }

//   /**
//    * Toggle auto-renew for client's plan
//    */
//   async toggleAutoRenew(clientId, subscriptionId, enabled) {
//     const response = await api.post(`${this.baseURL}/clients/${clientId}/plans/auto-renew/`, {
//       subscription_id: subscriptionId,
//       enabled
//     });
//     return response.data;
//   }

//   /**
//    * Get plan dashboard for client
//    */
//   async getPlanDashboard(clientId) {
//     const response = await api.get(`${this.baseURL}/clients/${clientId}/dashboard/`);
//     return response.data;
//   }

//   /**
//    * Perform bulk plan actions
//    */
//   async bulkPlanAction(action, clientIds, planData = {}) {
//     const response = await api.post(`${this.baseURL}/plans/bulk-actions/`, {
//       action,
//       client_ids: clientIds,
//       ...planData
//     });
//     return response.data;
//   }

//   /**
//    * Get all available plans
//    */
//   async getAvailablePlans(filters = {}) {
//     const response = await api.get(`${this.baseURL}/plans/available/`, { params: filters });
//     return response.data;
//   }

//   /**
//    * Get plan details by ID
//    */
//   async getPlanDetails(planId) {
//     const response = await api.get(`${this.baseURL}/plans/${planId}/`);
//     return response.data;
//   }
// }

// export default new PlanService();








/**
 * Plan Service
 * Handles all plan-related API calls to /api/user_management/
 */
import api from '../../../api';

class PlanService {
  constructor() {
    this.baseURL = '/api/user_management';
  }

  /**
   * Get plan management for a client
   * Endpoint: /api/user_management/clients/{client_id}/plans/
   */
  async getClientPlanManagement(clientId) {
    const response = await api.get(`${this.baseURL}/clients/${clientId}/plans/`);
    return response.data;
  }

  /**
   * Get plan history for a client
   * Endpoint: /api/user_management/clients/{client_id}/plans/history/
   */
  async getClientPlanHistory(clientId) {
    const response = await api.get(`${this.baseURL}/clients/${clientId}/plans/history/`);
    return response.data;
  }

  /**
   * Get plan recommendations for a client
   * Endpoint: /api/user_management/clients/{client_id}/plans/recommendations/
   */
  async getClientPlanRecommendations(clientId) {
    const response = await api.get(`${this.baseURL}/clients/${clientId}/plans/recommendations/`);
    return response.data;
  }

  /**
   * Assign plan to client
   * Endpoint: /api/user_management/clients/{client_id}/plans/assign/
   */
  async assignPlan(clientId, planData) {
    const response = await api.post(`${this.baseURL}/clients/${clientId}/plans/assign/`, {
      plan_id: planData.plan_id,
      auto_renew: planData.auto_renew !== false,
      duration_hours: planData.duration_hours || 720,
      router_id: planData.router_id,
      hotspot_mac_address: planData.hotspot_mac_address
    });
    return response.data;
  }

  /**
   * Change client's current plan
   * Endpoint: /api/user_management/clients/{client_id}/plans/change/
   */
  async changePlan(clientId, planData) {
    const response = await api.post(`${this.baseURL}/clients/${clientId}/plans/change/`, {
      plan_id: planData.plan_id,
      subscription_id: planData.subscription_id,
      immediate: planData.immediate || false,
      prorate: planData.prorate !== false,
      notes: planData.notes
    });
    return response.data;
  }

  /**
   * Renew client's current plan
   * Endpoint: /api/user_management/clients/{client_id}/plans/renew/
   */
  async renewPlan(clientId, planData) {
    const response = await api.post(`${this.baseURL}/clients/${clientId}/plans/renew/`, {
      subscription_id: planData.subscription_id,
      duration_hours: planData.duration_hours || 720,
      auto_renew: planData.auto_renew !== false,
      payment_method: planData.payment_method || 'mpesa',
      notes: planData.notes
    });
    return response.data;
  }

  /**
   * Suspend client's plan
   * Endpoint: /api/user_management/clients/{client_id}/plans/suspend/
   */
  async suspendPlan(clientId, subscriptionId, reason = '') {
    const response = await api.post(`${this.baseURL}/clients/${clientId}/plans/suspend/`, {
      subscription_id: subscriptionId,
      reason
    });
    return response.data;
  }

  /**
   * Toggle auto-renew for client's plan
   * Endpoint: /api/user_management/clients/{client_id}/plans/auto-renew/
   */
  async toggleAutoRenew(clientId, subscriptionId, enabled) {
    const response = await api.post(`${this.baseURL}/clients/${clientId}/plans/auto-renew/`, {
      subscription_id: subscriptionId,
      enabled
    });
    return response.data;
  }

  /**
   * Get plan dashboard for client
   * Endpoint: /api/user_management/clients/{client_id}/dashboard/
   */
  async getPlanDashboard(clientId) {
    const response = await api.get(`${this.baseURL}/clients/${clientId}/dashboard/`);
    return response.data;
  }

  /**
   * Perform bulk plan actions
   * Endpoint: /api/user_management/plans/bulk-actions/
   */
  async bulkPlanAction(action, clientIds, planData = {}) {
    const response = await api.post(`${this.baseURL}/plans/bulk-actions/`, {
      action,
      client_ids: clientIds,
      ...planData
    });
    return response.data;
  }
}

export default new PlanService();