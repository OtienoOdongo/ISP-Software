// // api.js
// import axios from "axios";
// import { ACCESS_TOKEN } from "../Dashboard/src/constants/index";

// // Create an Axios instance with the base URL from the .env file
// const api = axios.create({
//   baseURL: import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.trim().replace(/\/$/, "") : "http://localhost:8000/",
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// // Request interceptor to attach Authorization header and log requests
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem(ACCESS_TOKEN);

//     if (token && !config.headers.Authorization) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }

//     console.log("Request URL:", config.baseURL + config.url);
//     console.log("Request Headers:", config.headers);
//     return config;
//   },
//   (error) => {
//     console.error("Request Interceptor Error:", error);
//     return Promise.reject(error);
//   }
// );

// // Response interceptor for better error handling
// api.interceptors.response.use(
//   (response) => {
//     console.log("Response Status:", response.status);
//     console.log("Response Headers:", response.headers);
//     console.log("Response Data:", response.data);
//     return response;
//   },
//   (error) => {
//     console.error("API Error:", {
//       status: error.response?.status,
//       data: error.response?.data,
//       headers: error.response?.headers,
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
import { ACCESS_TOKEN } from "../Dashboard/src/constants/index";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.trim().replace(/\/$/, "") : "http://localhost:8000/",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log("Request URL:", config.baseURL + config.url);
    console.log("Request Method:", config.method);
    console.log("Request Headers:", config.headers);
    if (config.data) console.log("Request Data:", config.data);
    return config;
  },
  (error) => {
    console.error("Request Interceptor Error:", error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log("Response Status:", response.status);
    console.log("Response Headers:", response.headers);
    console.log("Response Data:", response.data);
    return response;
  },
  (error) => {
    console.error("API Error:", {
      status: error.response?.status,
      data: error.response?.data,
      headers: error.response?.headers,
      message: error.message,
    });
    if (error.response) {
      const contentType = error.response.headers["content-type"] || "";
      if (!contentType.includes("application/json")) {
        console.error("Non-JSON Response Detected:", error.response.data);
        return Promise.reject(new Error("Server did not return JSON data"));
      }
    }
    return Promise.reject(error);
  }
);

export default api;