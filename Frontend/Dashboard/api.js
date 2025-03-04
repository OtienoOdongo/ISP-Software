import axios from "axios";
import { ACCESS_TOKEN } from "../Dashboard/src/constants/index";

// Create an Axios instance with the base URL from the .env file
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL.trim().replace(/\/$/, ""), 
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach Authorization header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(ACCESS_TOKEN);

    // Only add Authorization if token exists and no custom Authorization is provided
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log("Request URL:", config.baseURL + config.url); // Debug log for URL
    console.log("Request Headers:", config.headers); // Debug log for headers
    return config;
  },
  (error) => {
    console.error("Request Interceptor Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

export default api;