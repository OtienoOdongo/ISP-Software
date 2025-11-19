

// // api.js
// import axios from "axios";
// import { ACCESS_TOKEN } from "./constants/index";

// const api = axios.create({
//   baseURL: import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.trim().replace(/\/+$/, "") : "http://localhost:8000",
//   headers: {
//     "Content-Type": "application/json",
//   },
//   withCredentials: false,
// });

// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem(ACCESS_TOKEN);
//     if (token && !config.headers.Authorization) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     console.log("Request URL:", config.baseURL + config.url);
//     console.log("Request Method:", config.method);
//     console.log("Request Headers:", JSON.stringify(config.headers, null, 2));
//     if (config.data) console.log("Request Data:", config.data);
//     return config;
//   },
//   (error) => {
//     console.error("Request Interceptor Error:", error);
//     return Promise.reject(error);
//   }
// );

// api.interceptors.response.use(
//   (response) => {
//     console.log("Response Status:", response.status);
//     console.log("Response Headers:", JSON.stringify(response.headers, null, 2));
//     console.log("Response Data:", response.data);
//     return response;
//   },
//   (error) => {
//     console.error("API Error:", {
//       status: error.response?.status,
//       data: error.response?.data,
//       headers: error.response?.headers,
//       message: error.message,
//     });
//     if (error.response) {
//       const contentType = error.response.headers["content-type"] || "";
//       if (!contentType.includes("application/json")) {
//         console.error("Non-JSON Response Detected:", error.response.data);
//         return Promise.reject(new Error("Server did not return JSON data"));
//       }
//     }
//     return Promise.reject(error);
//   }
// );

// export default api;








// api.js
import axios from "axios";
import { toast } from 'react-hot-toast';
import { ACCESS_TOKEN } from "./constants/index";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.trim().replace(/\/+$/, "") : "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 seconds
  withCredentials: false,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    
    if (token) {
      // Verify token format (basic validation)
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        console.error('Invalid token format');
        localStorage.removeItem(ACCESS_TOKEN);
        window.location.href = '/login';
        return Promise.reject(new Error('Invalid token format'));
      }
      
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request details in development
    if (import.meta.env.DEV) {
      console.group(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
      console.log('Full URL:', config.baseURL + config.url);
      console.log('Method:', config.method);
      console.log('Headers:', JSON.stringify(config.headers, null, 2));
      if (config.params) console.log('Params:', config.params);
      if (config.data) console.log('Data:', config.data);
      console.groupEnd();
    }

    return config;
  },
  (error) => {
    console.error('Request Interceptor Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Log response details in development
    if (import.meta.env.DEV) {
      console.group(`API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`);
      console.log('Status:', response.status);
      console.log('Data:', response.data);
      console.groupEnd();
    }
    
    return response;
  },
  (error) => {
    // Enhanced error logging
    const errorDetails = {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      code: error.code
    };

    console.error('API Error Details:', errorDetails);

    // Handle specific error cases
    if (error.response) {
      // Server responded with error status
      switch (error.response.status) {
        case 401:
          // Unauthorized - clear token and redirect
          console.warn('Authentication failed - clearing token');
          localStorage.removeItem(ACCESS_TOKEN);
          
          // Only show toast if we're not already on login page
          if (!window.location.pathname.includes('/login')) {
            toast.error('Your session has expired. Please log in again.');
            // Optional: Redirect to login after delay
            setTimeout(() => {
              window.location.href = '/login';
            }, 2000);
          }
          break;

        case 403:
          toast.error('You do not have permission to perform this action.');
          break;

        case 404:
          // Don't show toast for 404 errors as they might be expected
          console.warn('Resource not found:', error.config?.url);
          break;

        case 500:
          toast.error('Server error. Please try again later.');
          break;

        case 502:
        case 503:
          toast.error('Service temporarily unavailable. Please try again later.');
          break;

        default:
          // Show generic error for other status codes
          const errorMessage = error.response.data?.error || 
                             error.response.data?.detail || 
                             error.response.data?.message || 
                             `Request failed with status ${error.response.status}`;
          toast.error(errorMessage);
      }
    } else if (error.request) {
      // Request was made but no response received
      if (error.code === 'NETWORK_ERROR' || error.code === 'ERR_NETWORK') {
        toast.error('Network error. Please check your internet connection.');
      } else if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        toast.error('Request timeout. Please try again.');
      } else {
        toast.error('No response received from server. Please check your connection.');
      }
    } else {
      // Something else happened
      toast.error('An unexpected error occurred. Please try again.');
    }

    return Promise.reject(error);
  }
);

// Add retry functionality
api.retry = async (config, retries = 3, delay = 1000) => {
  try {
    return await api(config);
  } catch (error) {
    if (retries > 0 && error.response?.status >= 500) {
      // Only retry on server errors
      await new Promise(resolve => setTimeout(resolve, delay));
      return api.retry(config, retries - 1, delay * 2);
    }
    throw error;
  }
};

export default api;