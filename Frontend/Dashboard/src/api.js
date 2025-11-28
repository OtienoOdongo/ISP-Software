







// // api.js
// import axios from "axios";
// import { toast } from 'react-hot-toast';
// import { ACCESS_TOKEN } from "./constants/index";

// const api = axios.create({
//   baseURL: import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.trim().replace(/\/+$/, "") : "http://localhost:8000",
//   headers: {
//     "Content-Type": "application/json",
//   },
//   timeout: 30000, // 30 seconds
//   withCredentials: false,
// });

// // Request interceptor
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem(ACCESS_TOKEN);
    
//     if (token) {
//       // Verify token format (basic validation)
//       const tokenParts = token.split('.');
//       if (tokenParts.length !== 3) {
//         console.error('Invalid token format');
//         localStorage.removeItem(ACCESS_TOKEN);
//         window.location.href = '/login';
//         return Promise.reject(new Error('Invalid token format'));
//       }
      
//       config.headers.Authorization = `Bearer ${token}`;
//     }

//     // Log request details in development
//     if (import.meta.env.DEV) {
//       console.group(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
//       console.log('Full URL:', config.baseURL + config.url);
//       console.log('Method:', config.method);
//       console.log('Headers:', JSON.stringify(config.headers, null, 2));
//       if (config.params) console.log('Params:', config.params);
//       if (config.data) console.log('Data:', config.data);
//       console.groupEnd();
//     }

//     return config;
//   },
//   (error) => {
//     console.error('Request Interceptor Error:', error);
//     return Promise.reject(error);
//   }
// );

// // Response interceptor
// api.interceptors.response.use(
//   (response) => {
//     // Log response details in development
//     if (import.meta.env.DEV) {
//       console.group(`API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`);
//       console.log('Status:', response.status);
//       console.log('Data:', response.data);
//       console.groupEnd();
//     }
    
//     return response;
//   },
//   (error) => {
//     // Enhanced error logging
//     const errorDetails = {
//       url: error.config?.url,
//       method: error.config?.method,
//       status: error.response?.status,
//       statusText: error.response?.statusText,
//       data: error.response?.data,
//       message: error.message,
//       code: error.code
//     };

//     console.error('API Error Details:', errorDetails);

//     // Handle specific error cases
//     if (error.response) {
//       // Server responded with error status
//       switch (error.response.status) {
//         case 401:
//           // Unauthorized - clear token and redirect
//           console.warn('Authentication failed - clearing token');
//           localStorage.removeItem(ACCESS_TOKEN);
          
//           // Only show toast if we're not already on login page
//           if (!window.location.pathname.includes('/login')) {
//             toast.error('Your session has expired. Please log in again.');
//             // Optional: Redirect to login after delay
//             setTimeout(() => {
//               window.location.href = '/login';
//             }, 2000);
//           }
//           break;

//         case 403:
//           toast.error('You do not have permission to perform this action.');
//           break;

//         case 404:
//           // Don't show toast for 404 errors as they might be expected
//           console.warn('Resource not found:', error.config?.url);
//           break;

//         case 500:
//           toast.error('Server error. Please try again later.');
//           break;

//         case 502:
//         case 503:
//           toast.error('Service temporarily unavailable. Please try again later.');
//           break;

//         default:
//           // Show generic error for other status codes
//           const errorMessage = error.response.data?.error || 
//                              error.response.data?.detail || 
//                              error.response.data?.message || 
//                              `Request failed with status ${error.response.status}`;
//           toast.error(errorMessage);
//       }
//     } else if (error.request) {
//       // Request was made but no response received
//       if (error.code === 'NETWORK_ERROR' || error.code === 'ERR_NETWORK') {
//         toast.error('Network error. Please check your internet connection.');
//       } else if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
//         toast.error('Request timeout. Please try again.');
//       } else {
//         toast.error('No response received from server. Please check your connection.');
//       }
//     } else {
//       // Something else happened
//       toast.error('An unexpected error occurred. Please try again.');
//     }

//     return Promise.reject(error);
//   }
// );

// // Add retry functionality
// api.retry = async (config, retries = 3, delay = 1000) => {
//   try {
//     return await api(config);
//   } catch (error) {
//     if (retries > 0 && error.response?.status >= 500) {
//       // Only retry on server errors
//       await new Promise(resolve => setTimeout(resolve, delay));
//       return api.retry(config, retries - 1, delay * 2);
//     }
//     throw error;
//   }
// };

// export default api;













// // api.js - FIXED VERSION
// import axios from "axios";
// import { toast } from 'react-hot-toast';
// import { ACCESS_TOKEN } from "./constants/index";

// // FIXED: Use environment variable with fallback
// const API_BASE_URL = import.meta.env.VITE_API_URL 
//   ? import.meta.env.VITE_API_URL.trim().replace(/\/+$/, "") 
//   : "http://localhost:8000";

// console.log('🚀 API Base URL:', API_BASE_URL);

// const api = axios.create({
//   baseURL: API_BASE_URL,
//   headers: {
//     "Content-Type": "application/json",
//   },
//   timeout: 30000, // 30 seconds
//   withCredentials: false,
// });

// // Enhanced Request Interceptor
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem(ACCESS_TOKEN);
    
//     if (token) {
//       // Enhanced token validation
//       try {
//         const tokenParts = token.split('.');
//         if (tokenParts.length !== 3) {
//           throw new Error('Invalid token format');
//         }
        
//         // Check if token is expired (basic check)
//         const payload = JSON.parse(atob(tokenParts[1]));
//         const expiry = payload.exp * 1000; // Convert to milliseconds
//         if (Date.now() >= expiry) {
//           console.warn('Token expired, redirecting to login');
//           localStorage.removeItem(ACCESS_TOKEN);
//           window.location.href = '/login';
//           return Promise.reject(new Error('Token expired'));
//         }
        
//         config.headers.Authorization = `Bearer ${token}`;
//       } catch (error) {
//         console.error('Token validation failed:', error);
//         localStorage.removeItem(ACCESS_TOKEN);
//         window.location.href = '/login';
//         return Promise.reject(error);
//       }
//     }

//     // Enhanced request logging
//     if (import.meta.env.DEV) {
//       console.group(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
//       console.log('📋 Full URL:', config.baseURL + config.url);
//       console.log('⚡ Method:', config.method);
//       console.log('📝 Headers:', JSON.stringify(config.headers, null, 2));
//       if (config.params) console.log('🔍 Params:', config.params);
//       if (config.data) console.log('📦 Data:', config.data);
//       console.groupEnd();
//     }

//     return config;
//   },
//   (error) => {
//     console.error('❌ Request Interceptor Error:', error);
//     return Promise.reject(error);
//   }
// );

// // Enhanced Response Interceptor
// api.interceptors.response.use(
//   (response) => {
//     // Success response logging
//     if (import.meta.env.DEV) {
//       console.group(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`);
//       console.log('📊 Status:', response.status);
//       console.log('📄 Data:', response.data);
//       console.groupEnd();
//     }
    
//     return response;
//   },
//   (error) => {
//     // Comprehensive error handling
//     const errorDetails = {
//       url: error.config?.url,
//       method: error.config?.method,
//       status: error.response?.status,
//       statusText: error.response?.statusText,
//       data: error.response?.data,
//       message: error.message,
//       code: error.code
//     };

//     console.error('❌ API Error Details:', errorDetails);

//     // Handle specific error cases
//     if (error.response) {
//       // Server responded with error status
//       switch (error.response.status) {
//         case 401:
//           console.warn('🔐 Authentication failed - clearing token');
//           localStorage.removeItem(ACCESS_TOKEN);
          
//           if (!window.location.pathname.includes('/login')) {
//             toast.error('Your session has expired. Please log in again.');
//             setTimeout(() => {
//               window.location.href = '/login';
//             }, 2000);
//           }
//           break;

//         case 403:
//           toast.error('🚫 You do not have permission to perform this action.');
//           break;

//         case 404:
//           console.warn('🔍 Resource not found:', error.config?.url);
//           // Don't show toast for 404 to avoid noise
//           break;

//         case 408:
//         case 504:
//           toast.error('⏰ Request timeout. Please try again.');
//           break;

//         case 500:
//           toast.error('🔧 Server error. Please try again later.');
//           break;

//         case 502:
//         case 503:
//           toast.error('🛠️ Service temporarily unavailable. Please try again later.');
//           break;

//         default:
//           const errorMessage = error.response.data?.error || 
//                              error.response.data?.detail || 
//                              error.response.data?.message || 
//                              `Request failed with status ${error.response.status}`;
//           toast.error(errorMessage);
//       }
//     } else if (error.request) {
//       // Request was made but no response received
//       if (error.code === 'NETWORK_ERROR' || error.code === 'ERR_NETWORK') {
//         toast.error('🌐 Network error. Please check your internet connection.');
//       } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
//         toast.error('⏰ Request timeout. The server is taking too long to respond.');
//       } else {
//         toast.error('🔌 No response received from server. Please check your connection.');
//       }
//     } else {
//       // Something else happened
//       toast.error('❌ An unexpected error occurred. Please try again.');
//     }

//     return Promise.reject(error);
//   }
// );

// // Enhanced retry functionality with exponential backoff
// api.retry = async (config, retries = 3, baseDelay = 1000) => {
//   for (let attempt = 0; attempt < retries; attempt++) {
//     try {
//       return await api(config);
//     } catch (error) {
//       // Only retry on network errors or server errors (5xx)
//       const shouldRetry = !error.response || error.response.status >= 500;
      
//       if (attempt === retries - 1 || !shouldRetry) {
//         throw error;
//       }

//       const delay = baseDelay * Math.pow(2, attempt);
//       console.warn(`🔄 Retrying request in ${delay}ms (attempt ${attempt + 1}/${retries})`);
      
//       await new Promise(resolve => setTimeout(resolve, delay));
//     }
//   }
// };

// // Health check utility
// api.healthCheck = async () => {
//   try {
//     const response = await api.get('/api/health/', { timeout: 5000 });
//     return { healthy: true, data: response.data };
//   } catch (error) {
//     return { healthy: false, error: error.message };
//   }
// };

// export default api;







// // api.js - FIXED VERSION WITH SMARTFETCH
// import axios, { isCancel } from "axios";
// import { toast } from 'react-hot-toast';
// import { ACCESS_TOKEN } from "./constants/index";

// // Environment configuration with validation
// const getApiBaseUrl = () => {
//   const envUrl = import.meta.env.VITE_API_URL;
  
//   if (!envUrl) {
//     console.warn('VITE_API_URL not set, using default: http://localhost:8000');
//     return "http://localhost:8000";
//   }

//   const cleanedUrl = envUrl.trim().replace(/\/+$/, "");
  
//   try {
//     new URL(cleanedUrl);
//     return cleanedUrl;
//   } catch (error) {
//     console.error('Invalid VITE_API_URL:', envUrl, 'Using default instead');
//     return "http://localhost:8000";
//   }
// };

// const API_BASE_URL = getApiBaseUrl();

// console.log('🚀 API Configuration:', {
//   baseURL: API_BASE_URL,
//   environment: import.meta.env.MODE
// });

// // Create axios instance with optimal defaults
// const api = axios.create({
//   baseURL: API_BASE_URL,
//   headers: {
//     "Content-Type": "application/json",
//     "Accept": "application/json",
//   },
//   timeout: 30000,
//   timeoutErrorMessage: "Request timeout - please try again",
//   withCredentials: false,
//   validateStatus: (status) => status >= 200 && status < 500,
// });

// // Simple in-memory cache for smartFetch (TTL: 5min)
// const fetchCache = new Map();
// const CACHE_TTL = 300000; // 5 minutes

// // Utility to clean expired cache entries
// const cleanupCache = () => {
//   const now = Date.now();
//   for (const [key] of fetchCache.entries()) {
//     const { expiry } = fetchCache.get(key);
//     if (now > expiry) fetchCache.delete(key);
//   }
// };

// // Utility functions (unchanged)
// const getNetworkErrorMessage = (error) => {
//   if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
//     return 'Network connection failed - please check your internet';
//   }
//   if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
//     return 'Request timeout - server is not responding';
//   }
//   return 'Connection failed - please try again';
// };

// const extractErrorMessage = (data, fallback) => {
//   if (!data) return fallback;
  
//   if (typeof data === 'string') return data;
//   if (data.error) return data.error;
//   if (data.message) return data.message;
//   if (data.detail) return data.detail;
//   if (Array.isArray(data.errors)) return data.errors[0]?.message || fallback;
  
//   return fallback;
// };

// // Enhanced unauthorized handling - now takes a flag to suppress redirects during validation
// const handleUnauthorized = (suppressRedirect = false) => {
//   localStorage.removeItem(ACCESS_TOKEN);
  
//   if (!suppressRedirect && !window.location.pathname.includes('/login')) {
//     setTimeout(() => {
//       window.location.href = '/login';
//     }, 1000);
//   }
// };

// const showErrorToast = (error) => {
//   const silentErrors = ['NOT_FOUND', 'VALIDATION_ERROR'];
//   if (silentErrors.includes(error.code)) return;
  
//   if (error.code === 'UNAUTHORIZED' && window.location.pathname.includes('/login')) return;
  
//   toast.error(error.message, {
//     duration: error.code === 'SERVER_ERROR' ? 6000 : 4000,
//   });
// };

// // Enhanced error handling utility - now throws typed AuthError for 401s
// class AuthError extends Error {
//   constructor(message, code, status, details) {
//     super(message);
//     this.name = 'AuthError';
//     this.code = code;
//     this.status = status;
//     this.details = details;
//   }
// }

// const handleApiError = (error) => {
//   const cleanError = {
//     message: 'An unexpected error occurred',
//     code: 'UNKNOWN_ERROR',
//     status: null,
//     details: null,
//     originalError: error
//   };

//   if (axios.isAxiosError(error)) {
//     const response = error.response;
    
//     if (!response) {
//       cleanError.message = getNetworkErrorMessage(error);
//       cleanError.code = 'NETWORK_ERROR';
//     } else {
//       cleanError.status = response.status;
//       cleanError.details = response.data;
      
//       switch (response.status) {
//         case 400:
//           cleanError.message = extractErrorMessage(response.data, 'Bad request');
//           cleanError.code = 'VALIDATION_ERROR';
//           break;
//         case 401:
//           cleanError.message = 'Session expired - please log in again';
//           cleanError.code = 'UNAUTHORIZED';
//           handleUnauthorized(true); // Suppress during auth ops
//           throw new AuthError(cleanError.message, cleanError.code, cleanError.status, cleanError.details);
//         case 403:
//           cleanError.message = 'You do not have permission for this action';
//           cleanError.code = 'FORBIDDEN';
//           break;
//         case 404:
//           cleanError.message = 'Requested resource not found';
//           cleanError.code = 'NOT_FOUND';
//           break;
//         case 408:
//         case 504:
//           cleanError.message = 'Request timeout - please try again';
//           cleanError.code = 'TIMEOUT';
//           break;
//         case 429:
//           cleanError.message = 'Too many requests - please slow down';
//           cleanError.code = 'RATE_LIMITED';
//           break;
//         case 500:
//           cleanError.message = 'Server error - please try again later';
//           cleanError.code = 'SERVER_ERROR';
//           break;
//         case 502:
//         case 503:
//           cleanError.message = 'Service temporarily unavailable';
//           cleanError.code = 'SERVICE_UNAVAILABLE';
//           break;
//         default:
//           cleanError.message = extractErrorMessage(response.data, `Request failed with status ${response.status}`);
//           cleanError.code = `HTTP_${response.status}`;
//       }
//     }
//   } else {
//     cleanError.message = error.message || 'Unknown error occurred';
//     cleanError.code = 'CLIENT_ERROR';
//   }

//   console.error('🔴 API Error:', cleanError);
//   showErrorToast(cleanError);

//   throw cleanError;
// };

// // Request Interceptor (unchanged)
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem(ACCESS_TOKEN);
    
//     if (token) {
//       try {
//         if (typeof token === 'string' && token.split('.').length === 3) {
//           config.headers.Authorization = `Bearer ${token}`;
//         } else {
//           console.warn('Invalid token format detected');
//           localStorage.removeItem(ACCESS_TOKEN);
//         }
//       } catch (error) {
//         console.error('Token processing error:', error);
//         localStorage.removeItem(ACCESS_TOKEN);
//       }
//     }

//     if (import.meta.env.DEV) {
//       console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`, {
//         params: config.params,
//         data: config.data
//       });
//     }

//     return config;
//   },
//   (error) => {
//     console.error('❌ Request configuration error:', error);
//     return Promise.reject({
//       message: 'Request configuration failed',
//       code: 'REQUEST_SETUP_FAILED',
//       originalError: error
//     });
//   }
// );

// // Response Interceptor (unchanged)
// api.interceptors.response.use(
//   (response) => {
//     if (import.meta.env.DEV) {
//       console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url}`, {
//         status: response.status,
//         data: response.data
//       });
//     }

//     // Handle empty responses
//     if (!response.data) {
//       console.warn('Empty response received from server');
//       return {
//         ...response,
//         data: {}
//       };
//     }

//     return response;
//   },
//   (error) => {
//     if (isCancel(error)) {
//       return Promise.reject(error);
//     }
//     return Promise.reject(handleApiError(error));
//   }
// );

// // NEW: smartFetch - Intelligent wrapper for GET/POST with retry, cache, and auto-method detection
// api.smartFetch = async (url, options = {}) => {
//   cleanupCache(); // Prune expired cache

//   const {
//     method = 'GET',
//     params,
//     body: data,
//     cache = true, // Enable caching by default
//     retries = 3,
//     signal,
//     ...restConfig
//   } = options;

//   const cacheKey = cache ? `${method.toUpperCase()}:${url}:${JSON.stringify({ params, data })}` : null;
//   if (cacheKey && fetchCache.has(cacheKey)) {
//     const { data: cachedData, expiry } = fetchCache.get(cacheKey);
//     if (Date.now() < expiry) {
//       console.log(`🔄 Cache hit for ${url}`);
//       return { data: cachedData, error: null };
//     }
//   }

//   let lastError = null;
//   for (let attempt = 0; attempt < retries; attempt++) {
//     try {
//       let response;
//       if (method.toUpperCase() === 'GET' || !data) {
//         response = await api.get(url, { params, signal, ...restConfig });
//       } else {
//         response = await api.post(url, data, { signal, ...restConfig });
//       }

//       const result = response.data;

//       // Cache success
//       if (cacheKey) {
//         fetchCache.set(cacheKey, {
//           data: result,
//           expiry: Date.now() + CACHE_TTL
//         });
//       }

//       console.log(`✅ SmartFetch success: ${url} (attempt ${attempt + 1})`);
//       return { data: result, error: null };
//     } catch (error) {
//       lastError = error;
//       if (attempt === retries - 1 || error.name === 'AuthError') break; // No retry on auth or final attempt

//       const delay = 1000 * Math.pow(2, attempt); // Exponential backoff
//       console.warn(`⚠️ SmartFetch retry for ${url} in ${delay}ms (attempt ${attempt + 1}/${retries})`);
//       await new Promise(resolve => setTimeout(resolve, delay));
//     }
//   }

//   console.error(`❌ SmartFetch failed after ${retries} attempts: ${url}`, lastError);
//   return { data: null, error: lastError };
// };

// // Existing safe methods (unchanged)
// api.safeGet = async (url, config = {}) => {
//   try {
//     const response = await api.get(url, config);
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

// api.safePost = async (url, data = {}, config = {}) => {
//   try {
//     const response = await api.post(url, data, config);
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

// api.safePut = async (url, data = {}, config = {}) => {
//   try {
//     const response = await api.put(url, data, config);
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

// api.safeDelete = async (url, config = {}) => {
//   try {
//     const response = await api.delete(url, config);
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

// // Health check (unchanged)
// api.healthCheck = async (maxRetries = 2) => {
//   for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
//     try {
//       const response = await api.get('/api/health/', { timeout: 10000 });
//       console.log('✅ API Health check passed');
//       return { healthy: true, data: response.data };
//     } catch (error) {
//       console.warn(`❌ API Health check failed (attempt ${attempt}/${maxRetries + 1})`);
      
//       if (attempt > maxRetries) {
//         return { 
//           healthy: false, 
//           error: error.message,
//           code: error.code
//         };
//       }
      
//       await new Promise(resolve => 
//         setTimeout(resolve, 1000 * Math.pow(2, attempt - 1))
//       );
//     }
//   }
// };

// export default api;
// export { AuthError };









// api.js 
import axios, { isCancel } from "axios";
import { toast } from 'react-hot-toast';
import { ACCESS_TOKEN } from "./constants/index";

// Environment configuration with validation
const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  
  if (!envUrl) {
    console.warn('VITE_API_URL not set, using default: http://localhost:8000');
    return "http://localhost:8000";
  }

  const cleanedUrl = envUrl.trim().replace(/\/+$/, "");
  
  try {
    new URL(cleanedUrl);
    return cleanedUrl;
  } catch (error) {
    console.error('Invalid VITE_API_URL:', envUrl, 'Using default instead');
    return "http://localhost:8000";
  }
};

const API_BASE_URL = getApiBaseUrl();

console.log('🚀 API Configuration:', {
  baseURL: API_BASE_URL,
  environment: import.meta.env.MODE
});

// Create axios instance with optimal defaults - FIXED: Increased default timeout to 60s for slow endpoints
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
  timeout: 60000, // FIXED: Increased from 30s to 60s to handle slow audit log queries
  timeoutErrorMessage: "Request timeout - server is not responding",
  withCredentials: false,
  validateStatus: (status) => status >= 200 && status < 500,
});

// Simple in-memory cache for smartFetch (TTL: 5min)
const fetchCache = new Map();
const CACHE_TTL = 300000; // 5 minutes

// Utility to clean expired cache entries
const cleanupCache = () => {
  const now = Date.now();
  for (const [key] of fetchCache.entries()) {
    const { expiry } = fetchCache.get(key);
    if (now > expiry) fetchCache.delete(key);
  }
};

// Utility functions (unchanged)
const getNetworkErrorMessage = (error) => {
  if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
    return 'Network connection failed - please check your internet';
  }
  if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
    return 'Request timeout - server is not responding';
  }
  return 'Connection failed - please try again';
};

const extractErrorMessage = (data, fallback) => {
  if (!data) return fallback;
  
  if (typeof data === 'string') return data;
  if (data.error) return data.error;
  if (data.message) return data.message;
  if (data.detail) return data.detail;
  if (Array.isArray(data.errors)) return data.errors[0]?.message || fallback;
  
  return fallback;
};

// Enhanced unauthorized handling - now takes a flag to suppress redirects during validation
const handleUnauthorized = (suppressRedirect = false) => {
  localStorage.removeItem(ACCESS_TOKEN);
  
  if (!suppressRedirect && !window.location.pathname.includes('/login')) {
    setTimeout(() => {
      window.location.href = '/login';
    }, 1000);
  }
};

const showErrorToast = (error) => {
  const silentErrors = ['NOT_FOUND', 'VALIDATION_ERROR'];
  if (silentErrors.includes(error.code)) return;
  
  if (error.code === 'UNAUTHORIZED' && window.location.pathname.includes('/login')) return;
  
  toast.error(error.message, {
    duration: error.code === 'SERVER_ERROR' ? 6000 : 4000,
  });
};

// Enhanced error handling utility - now throws typed AuthError for 401s
class AuthError extends Error {
  constructor(message, code, status, details) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

const handleApiError = (error) => {
  const cleanError = {
    message: 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
    status: null,
    details: null,
    originalError: error
  };

  if (axios.isAxiosError(error)) {
    const response = error.response;
    
    if (!response) {
      cleanError.message = getNetworkErrorMessage(error);
      cleanError.code = 'NETWORK_ERROR';
    } else {
      cleanError.status = response.status;
      cleanError.details = response.data;
      
      switch (response.status) {
        case 400:
          cleanError.message = extractErrorMessage(response.data, 'Bad request');
          cleanError.code = 'VALIDATION_ERROR';
          break;
        case 401:
          cleanError.message = 'Session expired - please log in again';
          cleanError.code = 'UNAUTHORIZED';
          handleUnauthorized(true); // Suppress during auth ops
          throw new AuthError(cleanError.message, cleanError.code, cleanError.status, cleanError.details);
        case 403:
          cleanError.message = 'You do not have permission for this action';
          cleanError.code = 'FORBIDDEN';
          break;
        case 404:
          cleanError.message = 'Requested resource not found';
          cleanError.code = 'NOT_FOUND';
          break;
        case 408:
        case 504:
          cleanError.message = 'Request timeout - please try again';
          cleanError.code = 'TIMEOUT';
          break;
        case 429:
          cleanError.message = 'Too many requests - please slow down';
          cleanError.code = 'RATE_LIMITED';
          break;
        case 500:
          cleanError.message = 'Server error - please try again later';
          cleanError.code = 'SERVER_ERROR';
          break;
        case 502:
        case 503:
          cleanError.message = 'Service temporarily unavailable';
          cleanError.code = 'SERVICE_UNAVAILABLE';
          break;
        default:
          cleanError.message = extractErrorMessage(response.data, `Request failed with status ${response.status}`);
          cleanError.code = `HTTP_${response.status}`;
      }
    }
  } else {
    cleanError.message = error.message || 'Unknown error occurred';
    cleanError.code = 'CLIENT_ERROR';
  }

  console.error('🔴 API Error:', cleanError);
  showErrorToast(cleanError);

  throw cleanError;
};

// Request Interceptor (unchanged)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    
    if (token) {
      try {
        if (typeof token === 'string' && token.split('.').length === 3) {
          config.headers.Authorization = `Bearer ${token}`;
        } else {
          console.warn('Invalid token format detected');
          localStorage.removeItem(ACCESS_TOKEN);
        }
      } catch (error) {
        console.error('Token processing error:', error);
        localStorage.removeItem(ACCESS_TOKEN);
      }
    }

    if (import.meta.env.DEV) {
      console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`, {
        params: config.params,
        data: config.data
      });
    }

    return config;
  },
  (error) => {
    console.error('❌ Request configuration error:', error);
    return Promise.reject({
      message: 'Request configuration failed',
      code: 'REQUEST_SETUP_FAILED',
      originalError: error
    });
  }
);

// Response Interceptor (unchanged)
api.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data
      });
    }

    // Handle empty responses
    if (!response.data) {
      console.warn('Empty response received from server');
      return {
        ...response,
        data: {}
      };
    }

    return response;
  },
  (error) => {
    if (isCancel(error)) {
      return Promise.reject(error);
    }
    return Promise.reject(handleApiError(error));
  }
);

// NEW: smartFetch - Intelligent wrapper for GET/POST with retry, cache, and auto-method detection
api.smartFetch = async (url, options = {}) => {
  cleanupCache(); // Prune expired cache

  const {
    method = 'GET',
    params,
    body: data,
    cache = true, // Enable caching by default
    retries = 3,
    signal,
    ...restConfig
  } = options;

  const cacheKey = cache ? `${method.toUpperCase()}:${url}:${JSON.stringify({ params, data })}` : null;
  if (cacheKey && fetchCache.has(cacheKey)) {
    const { data: cachedData, expiry } = fetchCache.get(cacheKey);
    if (Date.now() < expiry) {
      console.log(`🔄 Cache hit for ${url}`);
      return { data: cachedData, error: null };
    }
  }

  let lastError = null;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      let response;
      if (method.toUpperCase() === 'GET' || !data) {
        response = await api.get(url, { params, signal, ...restConfig });
      } else {
        response = await api.post(url, data, { signal, ...restConfig });
      }

      const result = response.data;

      // Cache success
      if (cacheKey) {
        fetchCache.set(cacheKey, {
          data: result,
          expiry: Date.now() + CACHE_TTL
        });
      }

      console.log(`✅ SmartFetch success: ${url} (attempt ${attempt + 1})`);
      return { data: result, error: null };
    } catch (error) {
      lastError = error;
      if (attempt === retries - 1 || error.name === 'AuthError') break; // No retry on auth or final attempt

      const delay = 1000 * Math.pow(2, attempt); // Exponential backoff
      console.warn(`⚠️ SmartFetch retry for ${url} in ${delay}ms (attempt ${attempt + 1}/${retries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  console.error(`❌ SmartFetch failed after ${retries} attempts: ${url}`, lastError);
  return { data: null, error: lastError };
};

// Existing safe methods (unchanged)
api.safeGet = async (url, config = {}) => {
  try {
    const response = await api.get(url, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

api.safePost = async (url, data = {}, config = {}) => {
  try {
    const response = await api.post(url, data, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

api.safePut = async (url, data = {}, config = {}) => {
  try {
    const response = await api.put(url, data, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

api.safeDelete = async (url, config = {}) => {
  try {
    const response = await api.delete(url, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Health check (unchanged)
api.healthCheck = async (maxRetries = 2) => {
  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      const response = await api.get('/api/health/', { timeout: 10000 });
      console.log('✅ API Health check passed');
      return { healthy: true, data: response.data };
    } catch (error) {
      console.warn(`❌ API Health check failed (attempt ${attempt}/${maxRetries + 1})`);
      
      if (attempt > maxRetries) {
        return { 
          healthy: false, 
          error: error.message,
          code: error.code
        };
      }
      
      await new Promise(resolve => 
        setTimeout(resolve, 1000 * Math.pow(2, attempt - 1))
      );
    }
  }
};

export default api;
export { AuthError };