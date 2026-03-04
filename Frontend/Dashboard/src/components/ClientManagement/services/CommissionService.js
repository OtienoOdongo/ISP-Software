

// /**
//  * Commission API Service
//  * Handles all commission-related API calls to /api/user_management/
//  */
// import api from '../../../api';

// class CommissionService {
//   constructor() {
//     this.baseURL = '/api/user_management';
//   }

//   /**
//    * Get all commission transactions
//    */
//   async getTransactions(filters = {}, pagination = {}, signal) {
//     const params = { 
//       ...filters,
//       page: pagination.page || 1,
//       page_size: pagination.pageSize || 20
//     };
    
//     // Clean up params
//     Object.keys(params).forEach(key => {
//       if (params[key] === 'all' || params[key] === '' || params[key] == null) {
//         delete params[key];
//       }
//     });
    
//     const response = await api.get(`${this.baseURL}/commissions/`, { 
//       params,
//       signal 
//     });
//     return response.data;
//   }

//   /**
//    * Get transaction by ID
//    */
//   async getTransactionById(id, signal) {
//     const response = await api.get(`${this.baseURL}/commissions/${id}/`, { signal });
//     return response.data;
//   }

//   /**
//    * Create commission transaction
//    */
//   async createTransaction(data, signal) {
//     const response = await api.post(`${this.baseURL}/commissions/`, data, { signal });
//     return response.data;
//   }

//   /**
//    * Approve commission transaction
//    */
//   async approveTransaction(id, notes = '', signal) {
//     const response = await api.post(`${this.baseURL}/commissions/${id}/approve/`, 
//       { notes }, 
//       { signal }
//     );
//     return response.data;
//   }

//   /**
//    * Mark transaction as paid
//    */
//   async markAsPaid(id, paymentData, signal) {
//     const response = await api.post(`${this.baseURL}/commissions/${id}/mark-paid/`, {
//       payment_method: paymentData.payment_method,
//       payment_reference: paymentData.payment_reference,
//       notes: paymentData.notes
//     }, { signal });
//     return response.data;
//   }

//   /**
//    * Reject transaction
//    */
//   async rejectTransaction(id, reason, signal) {
//     const response = await api.post(`${this.baseURL}/commissions/${id}/reject/`, 
//       { reason }, 
//       { signal }
//     );
//     return response.data;
//   }

//   /**
//    * Cancel transaction
//    */
//   async cancelTransaction(id, reason, signal) {
//     const response = await api.post(`${this.baseURL}/commissions/${id}/cancel/`, 
//       { reason }, 
//       { signal }
//     );
//     return response.data;
//   }

//   /**
//    * Get marketer performance
//    */
//   async getMarketerPerformance(marketerId, startDate, endDate, signal) {
//     const params = {};
//     if (startDate) params.start_date = startDate;
//     if (endDate) params.end_date = endDate;
    
//     if (marketerId) {
//       const response = await api.get(`${this.baseURL}/marketers/performance/${marketerId}/`, { 
//         params,
//         signal 
//       });
//       return response.data;
//     } else {
//       const response = await api.get(`${this.baseURL}/marketers/performance/`, { 
//         params,
//         signal 
//       });
//       return response.data;
//     }
//   }

//   /**
//    * Get commission summary
//    */
//   async getCommissionSummary(period = 'month', signal) {
//     const response = await api.get(`${this.baseURL}/commissions/summary/`, {
//       params: { period },
//       signal
//     });
//     return response.data;
//   }

//   /**
//    * Process commission payout
//    */
//   async processPayout(payoutData, signal) {
//     const response = await api.post(`${this.baseURL}/commissions/payout/`, {
//       marketer_ids: payoutData.marketer_ids,
//       payment_method: payoutData.payment_method,
//       payment_reference: payoutData.payment_reference,
//       notes: payoutData.notes
//     }, { signal });
//     return response.data;
//   }

//   /**
//    * Get payout history
//    */
//   async getPayoutHistory(filters = {}, signal) {
//     const params = { ...filters };
//     Object.keys(params).forEach(key => {
//       if (params[key] === '' || params[key] == null) {
//         delete params[key];
//       }
//     });
    
//     const response = await api.get(`${this.baseURL}/commissions/payout/`, { 
//       params,
//       signal 
//     });
//     return response.data;
//   }

//   /**
//    * Bulk approve transactions
//    */
//   async bulkApprove(transactionIds, notes = '', signal) {
//     const response = await api.post(`${this.baseURL}/commissions/bulk_approve/`, {
//       transaction_ids: transactionIds,
//       notes
//     }, { signal });
//     return response.data;
//   }

//   /**
//    * Calculate commission for a transaction
//    */
//   async calculateCommission(amount, marketerTier, transactionType = 'referral', signal) {
//     const response = await api.post(`${this.baseURL}/commissions/calculate/`, {
//       amount: parseFloat(amount),
//       marketer_tier: marketerTier,
//       transaction_type: transactionType
//     }, { signal });
//     return response.data;
//   }
// }

// export default new CommissionService();






/**
 * Commission API Service
 * Handles all commission-related API calls to /api/user_management/
 */
import api from '../../../api';

class CommissionService {
  constructor() {
    this.baseURL = '/api/user_management';
  }

  /**
   * Get all commission transactions
   * Endpoint: /api/user_management/commissions/
   */
  async getTransactions(filters = {}, pagination = {}, signal) {
    const params = { 
      ...filters,
      page: pagination.page || 1,
      page_size: pagination.pageSize || 20
    };
    
    Object.keys(params).forEach(key => {
      if (params[key] === 'all' || params[key] === '' || params[key] == null) {
        delete params[key];
      }
    });
    
    const response = await api.get(`${this.baseURL}/commissions/`, { params, signal });
    return response.data;
  }

  /**
   * Get transaction by ID
   * Endpoint: /api/user_management/commissions/{id}/
   */
  async getTransactionById(id, signal) {
    const response = await api.get(`${this.baseURL}/commissions/${id}/`, { signal });
    return response.data;
  }

  /**
   * Create commission transaction
   * Endpoint: /api/user_management/commissions/
   */
  async createTransaction(data, signal) {
    const response = await api.post(`${this.baseURL}/commissions/`, data, { signal });
    return response.data;
  }

  /**
   * Approve commission transaction
   * Endpoint: /api/user_management/commissions/{id}/approve/
   */
  async approveTransaction(id, notes = '', signal) {
    const response = await api.post(`${this.baseURL}/commissions/${id}/approve/`, 
      { notes }, 
      { signal }
    );
    return response.data;
  }

  /**
   * Reject transaction
   * Endpoint: /api/user_management/commissions/{id}/reject/
   */
  async rejectTransaction(id, reason, signal) {
    const response = await api.post(`${this.baseURL}/commissions/${id}/reject/`, 
      { reason }, 
      { signal }
    );
    return response.data;
  }

  /**
   * Cancel transaction
   * Endpoint: /api/user_management/commissions/{id}/cancel/
   */
  async cancelTransaction(id, reason, signal) {
    const response = await api.post(`${this.baseURL}/commissions/${id}/cancel/`, 
      { reason }, 
      { signal }
    );
    return response.data;
  }

  /**
   * Get commission summary
   * Endpoint: /api/user_management/commission-dashboard/
   */
  async getCommissionSummary(period = 'month', signal) {
    const response = await api.get(`${this.baseURL}/commission-dashboard/`, {
      params: { period },
      signal
    });
    return response.data;
  }

  /**
   * Process commission payout
   * Endpoint: /api/user_management/commissions/payout/
   */
  async processPayout(payoutData, signal) {
    const response = await api.post(`${this.baseURL}/commissions/payout/`, {
      marketer_ids: payoutData.marketer_ids,
      payment_method: payoutData.payment_method,
      payment_reference: payoutData.payment_reference,
      notes: payoutData.notes
    }, { signal });
    return response.data;
  }

  /**
   * Get payout history
   * Endpoint: /api/user_management/commissions/payout/
   */
  async getPayoutHistory(filters = {}, signal) {
    const params = { ...filters };
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] == null) {
        delete params[key];
      }
    });
    
    const response = await api.get(`${this.baseURL}/commissions/payout/`, { 
      params,
      signal 
    });
    return response.data;
  }

  /**
   * Get marketer performance
   * Endpoint: /api/user_management/marketers/performance/
   * Endpoint: /api/user_management/marketers/performance/{marketer_id}/
   */
  async getMarketerPerformance(marketerId = null, startDate, endDate, signal) {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    
    const url = marketerId 
      ? `${this.baseURL}/marketers/performance/${marketerId}/`
      : `${this.baseURL}/marketers/performance/`;
    
    const response = await api.get(url, { params, signal });
    return response.data;
  }
}

export default new CommissionService();