// // api/index.js
// import axios from 'axios';

// // Use import.meta.env for Vite instead of process.env
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// const api = axios.create({
//   baseURL: API_BASE_URL,
//   timeout: 30000,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// // Request interceptor
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('accessToken');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// // Response interceptor
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       localStorage.removeItem('accessToken');
//       localStorage.removeItem('hotspotClientPhone');
//       localStorage.removeItem('hotspotClientId');
//       localStorage.removeItem('pppoeClientData');
//       window.location.reload();
//     }
//     return Promise.reject(error);
//   }
// );

// export default api;






import axios from 'axios';

// Vite uses import.meta.env, not process.env
const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 
                    'http://localhost:8000';

// Create axios instance with production-ready configuration
const api = axios.create({
  baseURL: `${API_BASE_URL}`,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  withCredentials: false,
});

// Request interceptor for authentication and headers
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('accessToken') || 
                  localStorage.getItem('authToken');
    
    // Add authorization header if token exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add client identification
    const clientData = localStorage.getItem('pppoeClientData');
    if (clientData) {
      try {
        const client = JSON.parse(clientData);
        config.headers['X-Client-ID'] = client.id;
        config.headers['X-Client-Username'] = client.pppoe_username;
      } catch (e) {
        console.warn('Failed to parse client data for headers');
      }
    }
    
    // Log request in development
    if (import.meta.env?.DEV) {
      console.log(`🔄 API Request: ${config.method?.toUpperCase()} ${config.url}`, config.params || '');
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (import.meta.env?.DEV) {
      console.log(`✅ API Response: ${response.status} ${response.config.url}`, response.data);
    }
    
    return response;
  },
  (error) => {
    // Enhanced error handling
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      console.error(`❌ API Error ${status}:`, data);
      
      switch (status) {
        case 401:
          // Unauthorized - clear auth data
          localStorage.removeItem('accessToken');
          localStorage.removeItem('authToken');
          localStorage.removeItem('pppoeClientData');
          localStorage.removeItem('hotspotClientData');
          
          // Only redirect PPPoE users to login, not hotspot users
          const isPPPoEUser = window.location.pathname.includes('/pppoe') || 
                             !window.location.pathname.includes('/hotspot');
          
          if (isPPPoEUser && !window.location.pathname.includes('/pppoe')) {
            window.location.href = '/pppoe';
          }
          break;
          
        case 403:
          // Forbidden - insufficient permissions
          console.warn('Access forbidden: Insufficient permissions');
          break;
          
        case 404:
          // Not found - resource doesn't exist
          console.warn('Resource not found:', error.config.url);
          break;
          
        case 429:
          // Rate limited
          console.warn('Rate limit exceeded, please slow down');
          break;
          
        case 500:
          // Server error
          console.error('Server error occurred');
          break;
          
        case 502:
        case 503:
        case 504:
          // Service unavailable
          console.error('Service temporarily unavailable');
          break;
          
        default:
          console.error(`Unhandled HTTP error: ${status}`);
      }
    } else if (error.request) {
      // Request made but no response received
      console.error('❌ Network error: No response received', error.request);
    } else {
      // Something else happened
      console.error('❌ Request setup error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Add retry functionality for failed requests
const retryRequest = async (config, retries = 3, backoff = 300) => {
  try {
    return await api(config);
  } catch (error) {
    if (retries > 0 && error.response?.status >= 500) {
      // Wait for backoff period and retry
      await new Promise(resolve => setTimeout(resolve, backoff));
      return retryRequest(config, retries - 1, backoff * 2);
    }
    throw error;
  }
};

// Export the api instance and retry utility
export { retryRequest };
export default api;