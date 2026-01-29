// /**
//  * API endpoints configuration for SMS automation
//  */

// export const SMS_API_ENDPOINTS = {
//   // Gateway endpoints
//   GATEWAYS: {
//     LIST: '/api/sms/gateways/',
//     DETAIL: (id) => `/api/sms/gateways/${id}/`,
//     TEST_CONNECTION: (id) => `/api/sms/gateways/${id}/test_connection/`,
//     SET_DEFAULT: (id) => `/api/sms/gateways/${id}/set_default/`,
//     TOGGLE_ACTIVE: (id) => `/api/sms/gateways/${id}/toggle_active/`,
//     STATUS: '/api/sms/gateways/status/'
//   },
  
//   // Template endpoints
//   TEMPLATES: {
//     LIST: '/api/sms/templates/',
//     DETAIL: (id) => `/api/sms/templates/${id}/`,
//     TEST_RENDER: (id) => `/api/sms/templates/${id}/test_render/`,
//     DUPLICATE: (id) => `/api/sms/templates/${id}/duplicate/`,
//     VARIABLES: '/api/sms/templates/variables/'
//   },
  
//   // Message endpoints
//   MESSAGES: {
//     LIST: '/api/sms/messages/',
//     DETAIL: (id) => `/api/sms/messages/${id}/`,
//     CREATE: '/api/sms/messages/',
//     BULK_SEND: '/api/sms/messages/bulk_send/',
//     SEND_TEST: '/api/sms/messages/send_test/',
//     RETRY: (id) => `/api/sms/messages/${id}/retry/`,
//     CANCEL: (id) => `/api/sms/messages/${id}/cancel/`,
//     DELIVERY_LOGS: (id) => `/api/sms/messages/${id}/delivery_logs/`,
//     STATISTICS: '/api/sms/messages/statistics/',
//     EXPORT: '/api/sms/messages/export/',
//     UPDATE_STATUS: (id) => `/api/sms/messages/${id}/status/`,
//     SEND_PPPOE_CREDENTIALS: '/api/sms/send-pppoe-credentials/'
//   },
  
//   // Automation rule endpoints
//   RULES: {
//     LIST: '/api/sms/rules/',
//     DETAIL: (id) => `/api/sms/rules/${id}/`,
//     TOGGLE_ACTIVE: (id) => `/api/sms/rules/${id}/toggle_active/`,
//     TEST_TRIGGER: (id) => `/api/sms/rules/${id}/test_trigger/`,
//     EXECUTE: (id) => `/api/sms/rules/${id}/execute/`,
//     STATISTICS: '/api/sms/rules/statistics/'
//   },
  
//   // Queue endpoints
//   QUEUE: {
//     LIST: '/api/sms/queue/',
//     PROCESS_BATCH: '/api/sms/queue/process_batch/',
//     CLEAR_FAILED: '/api/sms/queue/clear_failed/'
//   },
  
//   // Delivery log endpoints
//   DELIVERY_LOGS: {
//     LIST: '/api/sms/delivery-logs/'
//   },
  
//   // Analytics endpoints
//   ANALYTICS: {
//     DASHBOARD: '/api/sms/dashboard/',
//     DETAILED: '/api/sms/analytics/'
//   },
  
//   // Processing endpoints
//   PROCESSING: {
//     SCHEDULED: '/api/sms/process-scheduled/',
//     RETRY: '/api/sms/process-retry/'
//   },
  
//   // Webhook endpoints
//   WEBHOOK: {
//     BASE: '/api/sms/webhook/',
//     SPECIFIC: (gatewayType) => `/api/sms/webhook/${gatewayType}/`
//   },
  
//   // Health check
//   HEALTH: '/api/sms/health/'
// };

// export const API_CONFIG = {
//   // Request timeout (milliseconds)
//   TIMEOUT: 30000,
  
//   // Retry configuration
//   RETRY: {
//     MAX_RETRIES: 3,
//     RETRY_DELAY: 1000,
//     RETRY_ON: [408, 429, 500, 502, 503, 504]
//   },
  
//   // Cache configuration
//   CACHE: {
//     ENABLED: true,
//     DEFAULT_TTL: 300000, // 5 minutes
//     MAX_ITEMS: 100
//   },
  
//   // Rate limiting
//   RATE_LIMIT: {
//     ENABLED: true,
//     MAX_REQUESTS: 100,
//     WINDOW_MS: 60000 // 1 minute
//   }
// };

// // WebSocket configuration
// export const WEBSOCKET_CONFIG = {
//   URL: process.env.REACT_APP_WS_URL || 'ws://localhost:8000/ws/sms/',
//   RECONNECT_INTERVAL: 5000,
//   MAX_RECONNECT_ATTEMPTS: 10,
//   HEARTBEAT_INTERVAL: 30000
// };

// // Export formats
// export const EXPORT_FORMATS = {
//   CSV: 'csv',
//   JSON: 'json',
//   EXCEL: 'xlsx'
// };

// // Pagination defaults
// export const PAGINATION = {
//   DEFAULT_PAGE_SIZE: 50,
//   MAX_PAGE_SIZE: 1000,
//   PAGE_SIZES: [10, 25, 50, 100, 250, 500]
// };

// // SMS constants
// export const SMS_CONSTANTS = {
//   MAX_MESSAGE_LENGTH: 160,
//   MAX_PARTS: 10,
//   CHARACTER_ENCODINGS: {
//     GSM: 'GSM',
//     UNICODE: 'UNICODE'
//   },
//   PRIORITIES: {
//     URGENT: 'urgent',
//     HIGH: 'high',
//     NORMAL: 'normal',
//     LOW: 'low'
//   },
//   STATUSES: {
//     PENDING: 'pending',
//     SENT: 'sent',
//     DELIVERED: 'delivered',
//     FAILED: 'failed',
//     CANCELLED: 'cancelled'
//   },
//   GATEWAY_TYPES: {
//     AFRICASTALKING: 'africas_talking',
//     TWILIO: 'twilio',
//     SMPP: 'smpp',
//     CUSTOM: 'custom'
//   }
// };







/**
 * API endpoints configuration for SMS automation
 */

export const SMS_API_ENDPOINTS = {
  // Gateway endpoints
  GATEWAYS: {
    LIST: '/api/sms/gateways/',
    DETAIL: (id) => `/api/sms/gateways/${id}/`,
    TEST_CONNECTION: (id) => `/api/sms/gateways/${id}/test_connection/`,
    SET_DEFAULT: (id) => `/api/sms/gateways/${id}/set_default/`,
    TOGGLE_ACTIVE: (id) => `/api/sms/gateways/${id}/toggle_active/`,
    STATUS: '/api/sms/gateways/status/'
  },
  
  // Template endpoints
  TEMPLATES: {
    LIST: '/api/sms/templates/',
    DETAIL: (id) => `/api/sms/templates/${id}/`,
    TEST_RENDER: (id) => `/api/sms/templates/${id}/test_render/`,
    DUPLICATE: (id) => `/api/sms/templates/${id}/duplicate/`,
    VARIABLES: '/api/sms/templates/variables/'
  },
  
  // Message endpoints
  MESSAGES: {
    LIST: '/api/sms/messages/',
    DETAIL: (id) => `/api/sms/messages/${id}/`,
    CREATE: '/api/sms/messages/',
    BULK_SEND: '/api/sms/messages/bulk_send/',
    SEND_TEST: '/api/sms/messages/send_test/',
    RETRY: (id) => `/api/sms/messages/${id}/retry/`,
    CANCEL: (id) => `/api/sms/messages/${id}/cancel/`,
    DELIVERY_LOGS: (id) => `/api/sms/messages/${id}/delivery_logs/`,
    STATISTICS: '/api/sms/messages/statistics/',
    EXPORT: '/api/sms/messages/export/',
    UPDATE_STATUS: (id) => `/api/sms/messages/${id}/status/`,
    SEND_PPPOE_CREDENTIALS: '/api/sms/send-pppoe-credentials/'
  },
  
  // Automation rule endpoints
  RULES: {
    LIST: '/api/sms/rules/',
    DETAIL: (id) => `/api/sms/rules/${id}/`,
    TOGGLE_ACTIVE: (id) => `/api/sms/rules/${id}/toggle_active/`,
    TEST_TRIGGER: (id) => `/api/sms/rules/${id}/test_trigger/`,
    EXECUTE: (id) => `/api/sms/rules/${id}/execute/`,
    STATISTICS: '/api/sms/rules/statistics/'
  },
  
  // Queue endpoints
  QUEUE: {
    LIST: '/api/sms/queue/',
    PROCESS_BATCH: '/api/sms/queue/process_batch/',
    CLEAR_FAILED: '/api/sms/queue/clear_failed/'
  },
  
  // Delivery log endpoints
  DELIVERY_LOGS: {
    LIST: '/api/sms/delivery-logs/'
  },
  
  // Analytics endpoints
  ANALYTICS: {
    DASHBOARD: '/api/sms/dashboard/',
    DETAILED: '/api/sms/analytics/'
  },
  
  // Processing endpoints
  PROCESSING: {
    SCHEDULED: '/api/sms/process-scheduled/',
    RETRY: '/api/sms/process-retry/'
  },
  
  // Webhook endpoints
  WEBHOOK: {
    BASE: '/api/sms/webhook/',
    SPECIFIC: (gatewayType) => `/api/sms/webhook/${gatewayType}/`
  },
  
  // Health check
  HEALTH: '/api/sms/health/'
};

export const API_CONFIG = {
  // Request timeout (milliseconds)
  TIMEOUT: 30000,
  
  // Retry configuration
  RETRY: {
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000,
    RETRY_ON: [408, 429, 500, 502, 503, 504]
  },
  
  // Cache configuration
  CACHE: {
    ENABLED: true,
    DEFAULT_TTL: 300000, // 5 minutes
    MAX_ITEMS: 100
  },
  
  // Rate limiting
  RATE_LIMIT: {
    ENABLED: true,
    MAX_REQUESTS: 100,
    WINDOW_MS: 60000 // 1 minute
  }
};

// Helper function to safely get WebSocket URL
const getWebSocketUrl = () => {
  // First, check if we're in a browser environment
  if (typeof window === 'undefined') {
    return 'ws://localhost:8000/ws/sms/';
  }
  
  // Try to get from process.env (for build-time environment variables)
  try {
    if (typeof process !== 'undefined' && process.env && process.env.REACT_APP_WS_URL) {
      return process.env.REACT_APP_WS_URL;
    }
  } catch (error) {
    // process is not defined in browser, continue to other methods
  }
  
  // Try to get from window.AppConfig (for runtime configuration)
  if (window.AppConfig && window.AppConfig.WS_URL) {
    return window.AppConfig.WS_URL;
  }
  
  // Try to get from window.APP_CONFIG (alternative naming)
  if (window.APP_CONFIG && window.APP_CONFIG.WS_URL) {
    return window.APP_CONFIG.WS_URL;
  }
  
  // Default: Use relative URL based on current host
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}/ws/sms/`;
};

// WebSocket configuration
export const WEBSOCKET_CONFIG = {
  URL: getWebSocketUrl(),
  RECONNECT_INTERVAL: 5000,
  MAX_RECONNECT_ATTEMPTS: 10,
  HEARTBEAT_INTERVAL: 30000
};

// Export formats
export const EXPORT_FORMATS = {
  CSV: 'csv',
  JSON: 'json',
  EXCEL: 'xlsx'
};

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 50,
  MAX_PAGE_SIZE: 1000,
  PAGE_SIZES: [10, 25, 50, 100, 250, 500]
};

// SMS constants
export const SMS_CONSTANTS = {
  MAX_MESSAGE_LENGTH: 160,
  MAX_PARTS: 10,
  CHARACTER_ENCODINGS: {
    GSM: 'GSM',
    UNICODE: 'UNICODE'
  },
  PRIORITIES: {
    URGENT: 'urgent',
    HIGH: 'high',
    NORMAL: 'normal',
    LOW: 'low'
  },
  STATUSES: {
    PENDING: 'pending',
    SENT: 'sent',
    DELIVERED: 'delivered',
    FAILED: 'failed',
    CANCELLED: 'cancelled'
  },
  GATEWAY_TYPES: {
    AFRICASTALKING: 'africas_talking',
    TWILIO: 'twilio',
    SMPP: 'smpp',
    CUSTOM: 'custom'
  }
};