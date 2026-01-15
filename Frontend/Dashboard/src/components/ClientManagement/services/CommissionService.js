// import api from '../../../api'

// class CommissionService {
//   // Get all commission transactions
//   async getTransactions(filters = {}, pagination = { page: 1, page_size: 20 }) {
//     const params = { ...filters, ...pagination };
//     return await api.get('/api/user_management/commissions/transactions/', { params });
//   }

//   // Get transaction by ID
//   async getTransactionById(id) {
//     return await api.get(`/api/user_management/commissions/transactions/${id}/`);
//   }

//   // Create commission transaction
//   async createTransaction(data) {
//     return await api.post('/api/user_management/commissions/transactions/', data);
//   }

//   // Approve commission transaction
//   async approveTransaction(id, notes = '') {
//     return await api.post(`/api/user_management/commissions/transactions/${id}/approve/`, { notes });
//   }

//   // Mark transaction as paid
//   async markAsPaid(id, paymentData) {
//     return await api.post(`/api/user_management/commissions/transactions/${id}/mark-paid/`, paymentData);
//   }

//   // Reject transaction
//   async rejectTransaction(id, reason) {
//     return await api.post(`/api/user_management/commissions/transactions/${id}/reject/`, { reason });
//   }

//   // Get marketer performance
//   async getMarketerPerformance(marketerId, startDate, endDate) {
//     const params = {};
//     if (startDate) params.start_date = startDate;
//     if (endDate) params.end_date = endDate;
    
//     return await api.get(`/api/user_management/commissions/marketers/${marketerId}/performance/`, { params });
//   }

//   // Get commission summary
//   async getCommissionSummary(period = 'month') {
//     return await api.get('/api/user_management/commissions/summary/', {
//       params: { period }
//     });
//   }

//   // Process commission payout
//   async processPayout(payoutData) {
//     return await api.post('/api/user_management/commissions/payouts/', payoutData);
//   }

//   // Get payout history
//   async getPayoutHistory(filters = {}) {
//     return await api.get('/api/user_management/commissions/payouts/', { params: filters });
//   }

//   // Export commission report
//   async exportCommissionReport(format = 'csv', filters = {}) {
//     const response = await api.get('/api/user_management/commissions/export/', {
//       params: { format, ...filters },
//       responseType: 'blob'
//     });
    
//     const url = window.URL.createObjectURL(new Blob([response.data]));
//     const link = document.createElement('a');
//     link.href = url;
//     link.setAttribute('download', `commission_report_${new Date().toISOString().split('T')[0]}.${format}`);
//     document.body.appendChild(link);
//     link.click();
//     link.remove();
//   }

//   // Calculate commission for a referral
//   async calculateCommission(amount, marketerTier, transactionType = 'referral') {
//     return await api.post('/api/user_management/commissions/calculate/', {
//       amount,
//       marketer_tier: marketerTier,
//       transaction_type: transactionType
//     });
//   }
// }

// export default new CommissionService();








// services/CommissionService.js
import api from '../../../api'


class CommissionService {
  baseUrl = '/api/user_management';

  // Get all commission transactions
  async getTransactions(filters = {}, pagination = {}) {
    const params = { 
      ...filters,
      page: pagination.page || 1,
      page_size: pagination.page_size || 20
    };
    
    // Clean up params
    Object.keys(params).forEach(key => {
      if (params[key] === 'all' || params[key] === '' || params[key] == null) {
        delete params[key];
      }
    });
    
    return await api.get(`${this.baseUrl}/commissions/`, { params });
  }

  // Get transaction by ID
  async getTransactionById(id) {
    return await api.get(`${this.baseUrl}/commissions/${id}/`);
  }

  // Create commission transaction
  async createTransaction(data) {
    return await api.post(`${this.baseUrl}/commissions/`, data);
  }

  // Approve commission transaction
  async approveTransaction(id, notes = '') {
    return await api.post(`${this.baseUrl}/commissions/${id}/approve/`, { notes });
  }

  // Mark transaction as paid
  async markAsPaid(id, paymentData) {
    return await api.post(`${this.baseUrl}/commissions/${id}/mark-paid/`, paymentData);
  }

  // Reject transaction
  async rejectTransaction(id, reason) {
    return await api.post(`${this.baseUrl}/commissions/${id}/reject/`, { reason });
  }

  // Cancel transaction
  async cancelTransaction(id, reason) {
    return await api.post(`${this.baseUrl}/commissions/${id}/cancel/`, { reason });
  }

  // Get marketer performance
  async getMarketerPerformance(marketerId, startDate, endDate) {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    
    if (marketerId) {
      return await api.get(`${this.baseUrl}/marketers/performance/${marketerId}/`, { params });
    } else {
      return await api.get(`${this.baseUrl}/marketers/performance/`, { params });
    }
  }

  // Get commission summary
  async getCommissionSummary(period = 'month') {
    return await api.get(`${this.baseUrl}/commissions/summary/`, {
      params: { period }
    });
  }

  // Process commission payout
  async processPayout(payoutData) {
    return await api.post(`${this.baseUrl}/commissions/payout/`, payoutData);
  }

  // Get payout history
  async getPayoutHistory(filters = {}) {
    const params = { ...filters };
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] == null) {
        delete params[key];
      }
    });
    
    return await api.get(`${this.baseUrl}/commissions/payout/`, { params });
  }

  // Bulk approve transactions
  async bulkApprove(transactionIds, notes = '') {
    return await api.post(`${this.baseUrl}/commissions/bulk_approve/`, {
      transaction_ids: transactionIds,
      notes
    });
  }

  // Calculate commission for a transaction
  async calculateCommission(amount, marketerTier, transactionType = 'referral') {
    return await api.post(`${this.baseUrl}/commissions/calculate/`, {
      amount: parseFloat(amount),
      marketer_tier: marketerTier,
      transaction_type: transactionType
    });
  }

  // Export commission report
  async exportCommissionReport(format = 'csv', filters = {}) {
    try {
      const response = await api.get(`${this.baseUrl}/commissions/export/`, {
        params: { format, ...filters },
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `commission_report_${new Date().toISOString().split('T')[0]}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      console.error('Commission export failed:', error);
      throw error;
    }
  }

  // Get transaction statistics
  async getTransactionStats(period = 'month') {
    return await api.get(`${this.baseUrl}/commissions/stats/`, {
      params: { period }
    });
  }
}

export default new CommissionService();