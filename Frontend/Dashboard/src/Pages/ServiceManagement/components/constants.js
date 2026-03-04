






// // constants.js
// export const API_ENDPOINTS = {
//   // Service Operations
//   SUBSCRIPTIONS: '/api/service_operations/subscriptions/',
//   SUBSCRIPTION_DETAIL: (id) => `/api/service_operations/subscriptions/${id}/`,
//   SUBSCRIPTION_ACTIVATE: (id) => `/api/service_operations/subscriptions/${id}/activate/`,
//   SUBSCRIPTION_DEACTIVATE: (id) => `/api/service_operations/subscriptions/${id}/deactivate/`,
//   SUBSCRIPTION_REFRESH: (id) => `/api/service_operations/subscriptions/${id}/refresh/`,
  
//   // Bulk Operations
//   BULK_ACTIVATE: '/api/service_operations/subscriptions/bulk-activate/',
//   BULK_DEACTIVATE: '/api/service_operations/subscriptions/bulk-deactivate/',
//   BULK_REFRESH: '/api/service_operations/subscriptions/bulk-refresh/',
//   BULK_DELETE: '/api/service_operations/subscriptions/bulk-delete/',
  
//   // Client Operations
//   CLIENT_OPERATIONS: '/api/service_operations/client/operations/',
  
//   // Operation Logs
//   OPERATION_LOGS: '/api/service_operations/operations/logs/',
  
//   // Statistics
//   ACTIVATION_STATS: '/api/service_operations/activations/stats/',
//   OPERATION_STATS: '/api/service_operations/operations/stats/',
  
//   // External Services
//   INTERNET_PLANS: '/api/internet_plans/plans/',
//   NETWORK_ROUTERS: '/api/network_management/routers/',
// };

// // Disable WebSockets until backend supports them
// export const WEBSOCKET_ENABLED = false;

// export const REFRESH_INTERVALS = {
//   SUBSCRIPTIONS: 30000,
//   QUEUE_STATS: 30000,
// };

// export const PAGINATION = {
//   DEFAULT_PAGE_SIZE: 20,
//   PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
// };








// src/Pages/ServiceManagement/components/constants.js
export const API_ENDPOINTS = {
  // Service Operations
  SUBSCRIPTIONS: '/api/service_operations/subscriptions/',
  SUBSCRIPTION_DETAIL: (id) => `/api/service_operations/subscriptions/${id}/`,
  SUBSCRIPTION_ACTIVATE: (id) => `/api/service_operations/subscriptions/${id}/activate/`,
  SUBSCRIPTION_DEACTIVATE: (id) => `/api/service_operations/subscriptions/${id}/deactivate/`,
  SUBSCRIPTION_REFRESH: (id) => `/api/service_operations/subscriptions/${id}/refresh/`,
  
  // Bulk Operations
  BULK_ACTIVATE: '/api/service_operations/subscriptions/bulk-activate/',
  BULK_DEACTIVATE: '/api/service_operations/subscriptions/bulk-deactivate/',
  BULK_REFRESH: '/api/service_operations/subscriptions/bulk-refresh/',
  BULK_DELETE: '/api/service_operations/subscriptions/bulk-delete/',
  
  // Client Operations
  CLIENT_OPERATIONS: '/api/service_operations/client/operations/',
  
  // Operation Logs
  OPERATION_LOGS: '/api/service_operations/operations/logs/',
  
  // Statistics
  ACTIVATION_STATS: '/api/service_operations/activations/stats/',
  OPERATION_STATS: '/api/service_operations/operations/stats/',
  
  // External Services
  INTERNET_PLANS: '/api/internet_plans/plans/',
  NETWORK_ROUTERS: '/api/network_management/routers/',
};

// Disable WebSockets until backend supports them
export const WEBSOCKET_ENABLED = false;

export const REFRESH_INTERVALS = {
  SUBSCRIPTIONS: 30000, // 30 seconds
  QUEUE_STATS: 30000,    // 30 seconds
  OPERATION_STATS: 60000 // 60 seconds
};

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
};