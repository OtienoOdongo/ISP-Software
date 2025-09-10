// // frontend/landingpage/src/api.js (and frontend/dashboard/src/api.js)
// import axios from 'axios';

// const isDevelopment = process.env.NODE_ENV === 'development';

// const api = axios.create({
//   baseURL: isDevelopment ? 'http://localhost:8000/api/' : '/api/',
//   headers: {
//     'Content-Type': 'application/json',
//     'X-Requested-With': 'XMLHttpRequest',
//     'X-CSRFToken': getCookie('csrftoken'),
//   },
//   withCredentials: true,
// });

// function getCookie(name) {
//   let cookieValue = null;
//   if (document.cookie && document.cookie !== '') {
//     const cookies = document.cookie.split(';');
//     for (let i = 0; i < cookies.length; i++) {
//       const cookie = cookies[i].trim();
//       if (cookie.substring(0, name.length + 1) === name + '=') {
//         cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
//         break;
//       }
//     }
//   }
//   return cookieValue;
// }

// api.interceptors.request.use(
//   (config) => {
//     const csrfToken = getCookie('csrftoken');
//     if (csrfToken) {
//       config.headers['X-CSRFToken'] = csrfToken;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response) {
//       if (error.response.status === 404) {
//         console.error('Resource not found:', error.config.url);
//       } else if (error.response.status === 403 && error.response.data.detail?.includes('CSRF')) {
//         console.error('CSRF token validation failed. Refreshing token...');
//         const csrfToken = getCookie('csrftoken');
//         if (csrfToken) {
//           error.config.headers['X-CSRFToken'] = csrfToken;
//           return api.request(error.config);
//         }
//       }
//     } else {
//       console.error('Network or server error:', error.message);
//     }
//     return Promise.reject(error);
//   }
// );

// export default api;






import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:5174",
  headers: { "Content-Type": "application/json" },
});

export default api;