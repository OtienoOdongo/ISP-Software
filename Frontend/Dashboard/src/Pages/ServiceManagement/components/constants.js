


// // src/Pages/ServiceManagement/components/constants.js
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
//   SUBSCRIPTIONS: 30000, // 30 seconds
//   QUEUE_STATS: 30000,    // 30 seconds
//   OPERATION_STATS: 60000 // 60 seconds
// };

// export const PAGINATION = {
//   DEFAULT_PAGE_SIZE: 20,
//   PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
// };







// // src/Pages/ServiceManagement/components/constants.js
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
//   INTERNET_PLAN_DETAIL: (id) => `/api/internet_plans/plans/${id}/`,  // ADD THIS
//   NETWORK_ROUTERS: '/api/network_management/routers/',
  
//   // Authentication App Endpoints (NEW)
//   AUTH_BASE: '/api/auth',
//   AUTH_CLIENT_SEARCH: '/api/auth/clients/search/',  // For searching by phone
//   AUTH_CLIENT_DETAIL: (id) => `/api/auth/clients/${id}/`,  // For getting client by ID
//   AUTH_CHECK_PHONE: '/api/auth/check-phone/',  // For checking phone existence
//   AUTH_CLIENT_CREATE: '/api/auth/clients/create-hotspot/',  // For creating new clients
// };

// // Disable WebSockets until backend supports them
// export const WEBSOCKET_ENABLED = false;

// export const REFRESH_INTERVALS = {
//   SUBSCRIPTIONS: 30000, // 30 seconds
//   QUEUE_STATS: 30000,    // 30 seconds
//   OPERATION_STATS: 60000 // 60 seconds
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
  SUBSCRIPTION_DEACTIVATE: (id) => `/api/service_operations/subscriptions/${id}/suspend/`, // Using suspend as deactivate
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
  
  // Internet Plans (UPDATED to match actual endpoints)
  INTERNET_PLANS: '/api/internet_plans/plans/',
  INTERNET_PLAN_DETAIL: (id) => `/api/internet_plans/plans/${id}/`,  // This exists
  INTERNET_PLAN_PUBLIC: (id) => `/api/internet_plans/plans/public/`, // No ID needed, returns all public plans
  INTERNET_PLAN_AVAILABILITY: '/api/internet_plans/plans/availability/check/', // For compatibility checks
  
  // Network Management
  NETWORK_ROUTERS: '/api/network_management/routers/',
  
  // Authentication App Endpoints (UPDATED to match actual authentication app endpoints)
  AUTH_BASE: '/api/auth',
  AUTH_CLIENT_SEARCH: '/api/auth/clients/search/',  // GET with ?phone_number=...
  AUTH_CLIENT_DETAIL: (id) => `/api/auth/clients/${id}/`,  // GET by UUID - This exists in auth app!
  AUTH_CLIENT_CREATE_HOTSPOT: '/api/auth/clients/create-hotspot/',  // POST to create new hotspot client
  AUTH_CHECK_PHONE: '/api/auth/check-phone/',  // GET with ?phone=...
  AUTH_CLIENT_BULK: '/api/auth/clients/bulk-lookup/', // POST for bulk lookup
  
  // User Management App Endpoints (for fallback)
  USER_MANAGEMENT_BASE: '/api/user-management',
  USER_MANAGEMENT_CLIENT_SEARCH: '/api/user-management/clients/search/phone/',  // GET with ?phone=...
  USER_MANAGEMENT_CLIENT_DETAIL: (id) => `/api/user-management/clients/${id}/`,  // If this exists
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