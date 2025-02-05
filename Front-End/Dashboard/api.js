import axios from 'axios';
import { ACCESS_TOKEN } from "../Dashboard/src/constants/index";

// Create an Axios instance with a base URL from environment variables
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL
});

// Add a request interceptor to include the Authorization header if a token exists
api.interceptors.request.use(
    (config) => {
        // Retrieve the access token from local storage
        const token = localStorage.getItem(ACCESS_TOKEN); // Fixed 'localstorage' to 'localStorage'

        // If a token exists, attach it to the request headers
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config; // Return the updated request configuration
    },
    (err) => {
        // Handle request errors
        return Promise.reject(err);
    }
);

export default api;
