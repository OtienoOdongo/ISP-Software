




/**
//  * API endpoints configuration for SMS automation
//  */

// export const SMS_API_ENDPOINTS = {
//   // Gateway endpoints
//   GATEWAYS: {
//     LIST: '/sms/gateways/',
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
//     DETAIL: (id) => `/api/sms/queue/${id}/`,
//     PROCESS_BATCH: '/api/sms/queue/process_batch/',
//     CLEAR_FAILED: '/api/sms/queue/clear_failed/'
//   },
  
//   // Delivery log endpoints
//   DELIVERY_LOGS: {
//     LIST: '/api/sms/delivery-logs/',
//     DETAIL: (id) => `/api/sms/delivery-logs/${id}/`
//   },
  
//   // Analytics endpoints
//   ANALYTICS: {
//     DASHBOARD: '/api/sms/dashboard/',
//     DETAILED: '/api/sms/analytics/',
//     EXPORT: '/api/sms/analytics/export/'
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

// // API Configuration
// export const API_CONFIG = {
//   TIMEOUT: 30000,
//   RETRY: {
//     MAX_RETRIES: 3,
//     RETRY_DELAY: 1000,
//     RETRY_ON: [408, 429, 500, 502, 503, 504]
//   },
//   CACHE: {
//     ENABLED: true,
//     DEFAULT_TTL: 300000,
//     MAX_ITEMS: 100
//   },
//   PAGINATION: {
//     DEFAULT_PAGE_SIZE: 50,
//     MAX_PAGE_SIZE: 1000,
//     PAGE_SIZES: [10, 25, 50, 100, 250, 500]
//   }
// };

// // WebSocket Configuration
// export const WEBSOCKET_CONFIG = {
//   get URL() {
//     // Get WebSocket URL based on current location
//     const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
//     const host = process.env.NODE_ENV === 'production' 
//       ? window.location.host
//       : 'localhost:8000';
//     return `${protocol}//${host}/ws/sms/`;
//   },
//   RECONNECT_INTERVAL: 5000,
//   MAX_RECONNECT_ATTEMPTS: 10,
//   HEARTBEAT_INTERVAL: 30000
// };

// // SMS Constants
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
//     QUEUED: 'queued',
//     SENDING: 'sending',
//     SENT: 'sent',
//     DELIVERED: 'delivered',
//     FAILED: 'failed',
//     CANCELLED: 'cancelled',
//     EXPIRED: 'expired',
//     REJECTED: 'rejected'
//   },
//   GATEWAY_TYPES: {
//     AFRICAS_TALKING: 'africas_talking',
//     TWILIO: 'twilio',
//     SMPP: 'smpp',
//     CUSTOM: 'custom'
//   },
//   TEMPLATE_TYPES: {
//     PPPOE_CREDENTIALS: 'pppoe_credentials',
//     WELCOME: 'welcome',
//     PAYMENT_REMINDER: 'payment_reminder',
//     PLAN_EXPIRY: 'plan_expiry',
//     PROMOTIONAL: 'promotional',
//     SYSTEM: 'system',
//     CUSTOM: 'custom',
//     HOTSPOT_WELCOME: 'hotspot_welcome',
//     CREDENTIALS_RESEND: 'credentials_resend',
//     TIER_UPGRADE: 'tier_upgrade',
//     COMMISSION_PAYOUT: 'commission_payout'
//   }
// };

// // Export formats
// export const EXPORT_FORMATS = [
//   { value: 'csv', label: 'CSV', extension: '.csv', mimeType: 'text/csv' },
//   { value: 'json', label: 'JSON', extension: '.json', mimeType: 'application/json' },
//   { value: 'xlsx', label: 'Excel', extension: '.xlsx', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
//   { value: 'pdf', label: 'PDF', extension: '.pdf', mimeType: 'application/pdf' }
// ];

// // Date formats
// export const DATE_FORMATS = {
//   DISPLAY: 'MMM DD, YYYY HH:mm',
//   FILENAME: 'YYYY-MM-DD_HHmmss',
//   API: 'YYYY-MM-DD',
//   SHORT: 'MMM DD, YYYY',
//   TIME: 'HH:mm:ss'
// };










/**
 * API endpoints configuration for SMS automation
 * 
 * IMPORTANT: These endpoints assume your Django DRF API is mounted at /api/
 * and the SMS app is mounted at /api/sms/ (as per your urls.py)
 */

export const SMS_API_ENDPOINTS = {
  // Gateway endpoints
  GATEWAYS: {
    LIST: '/api/sms/gateways/',  // Will become /api/sms/gateways/
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
    DETAIL: (id) => `/api/sms/queue/${id}/`,
    PROCESS_BATCH: '/api/sms/queue/process_batch/',
    CLEAR_FAILED: '/api/sms/queue/clear_failed/'
  },
  
  // Delivery log endpoints
  DELIVERY_LOGS: {
    LIST: '/api/sms/delivery-logs/',
    DETAIL: (id) => `/api/sms/delivery-logs/${id}/`
  },
  
  // Analytics endpoints
  ANALYTICS: {
    DASHBOARD: '/api/sms/dashboard/',
    DETAILED: '/api/sms/analytics/',
    EXPORT: '/api/sms/analytics/export/'
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

// API Configuration
export const API_CONFIG = {
  // Base URL will be added by your api interceptor
  // Typically set in your api.js file: baseURL: '/api'
  TIMEOUT: 30000,
  RETRY: {
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000,
    RETRY_ON: [408, 429, 500, 502, 503, 504]
  },
  CACHE: {
    ENABLED: true,
    DEFAULT_TTL: 300000, // 5 minutes
    MAX_ITEMS: 100
  },
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 50,
    MAX_PAGE_SIZE: 1000,
    PAGE_SIZES: [10, 25, 50, 100, 250, 500]
  }
};

// WebSocket Configuration
export const WEBSOCKET_CONFIG = {
  get URL() {
    // Get WebSocket URL based on current location
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = process.env.NODE_ENV === 'production' 
      ? window.location.host
      : 'localhost:8000';
    
    // WebSocket endpoints as defined in your routing.py
    return {
      STATUS: `${protocol}//${host}/ws/sms/status/`,
      BROADCAST: `${protocol}//${host}/ws/sms/broadcast/`,
      ROOT: `${protocol}//${host}/ws/sms/`
    };
  },
  RECONNECT_INTERVAL: 5000,
  MAX_RECONNECT_ATTEMPTS: 10,
  HEARTBEAT_INTERVAL: 30000
};

// SMS Constants (matching your backend enums)
export const SMS_CONSTANTS = {
  // Message length limits
  MAX_MESSAGE_LENGTH: 160,
  MAX_PARTS: 10,
  CHARACTER_ENCODINGS: {
    GSM: 'GSM',
    UNICODE: 'UNICODE'
  },
  
  // Message priorities (matches MessagePriority enum)
  PRIORITIES: {
    URGENT: 'urgent',
    HIGH: 'high',
    NORMAL: 'normal',
    LOW: 'low'
  },
  
  // Message statuses (matches MessageStatus enum)
  STATUSES: {
    PENDING: 'pending',
    QUEUED: 'queued',
    SENDING: 'sending',
    SENT: 'sent',
    DELIVERED: 'delivered',
    FAILED: 'failed',
    CANCELLED: 'cancelled',
    EXPIRED: 'expired',
    REJECTED: 'rejected'
  },
  
  // Gateway types (matches GatewayType enum)
  GATEWAY_TYPES: {
    AFRICAS_TALKING: 'africas_talking',
    TWILIO: 'twilio',
    SMPP: 'smpp',
    CUSTOM: 'custom'
  },
  
  // Template types (matches TemplateType enum)
  TEMPLATE_TYPES: {
    PPPOE_CREDENTIALS: 'pppoe_credentials',
    WELCOME: 'welcome',
    PAYMENT_REMINDER: 'payment_reminder',
    PLAN_EXPIRY: 'plan_expiry',
    PROMOTIONAL: 'promotional',
    SYSTEM: 'system',
    CUSTOM: 'custom',
    HOTSPOT_WELCOME: 'hotspot_welcome',
    CREDENTIALS_RESEND: 'credentials_resend',
    TIER_UPGRADE: 'tier_upgrade',
    COMMISSION_PAYOUT: 'commission_payout'
  },
  
  // Automation rule types (matches AutomationRuleType enum)
  RULE_TYPES: {
    PPPOE_CREATION: 'pppoe_creation',
    HOTSPOT_CREATION: 'hotspot_creation',
    PAYMENT_REMINDER: 'payment_reminder',
    PLAN_EXPIRY: 'plan_expiry',
    WELCOME: 'welcome',
    PROMOTION: 'promotion',
    SYSTEM_ALERT: 'system_alert',
    TIER_CHANGE: 'tier_change',
    COMMISSION_EARNED: 'commission_earned'
  }
};

// Export formats
export const EXPORT_FORMATS = [
  { value: 'csv', label: 'CSV', extension: '.csv', mimeType: 'text/csv' },
  { value: 'json', label: 'JSON', extension: '.json', mimeType: 'application/json' },
  { value: 'xlsx', label: 'Excel', extension: '.xlsx', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
  { value: 'pdf', label: 'PDF', extension: '.pdf', mimeType: 'application/pdf' }
];

// Date formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM DD, YYYY HH:mm',
  FILENAME: 'YYYY-MM-DD_HHmmss',
  API: 'YYYY-MM-DD',
  SHORT: 'MMM DD, YYYY',
  TIME: 'HH:mm:ss'
};

// Helper function to build full API URL (if needed)
export const buildApiUrl = (endpoint) => {
  // Remove leading slash if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
  return `/api/${cleanEndpoint}`;
};

// Helper function to get WebSocket URL
export const getWebSocketUrl = (type = 'status') => {
  const config = WEBSOCKET_CONFIG.URL;
  return config[type.toUpperCase()] || config.STATUS;
};