

// // context/AuthContext.jsx
// import React, {
//   createContext,
//   useContext,
//   useState,
//   useEffect,
//   useCallback,
//   useMemo,
// } from 'react';
// import api from '../api';
// import { ACCESS_TOKEN, REFRESH_TOKEN } from '../constants/index';

// const AuthContext = createContext();

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };

// export const AuthProvider = ({ children }) => {
//   const [authState, setAuthState] = useState({
//     isAuthenticated: false,
//     userPermissions: [],
//     authToken: null,
//     userDetails: { 
//       name: '', 
//       email: '', 
//       profile_pic: '', 
//       user_type: '', 
//       is_2fa_enabled: false 
//     },
//     loading: true,
//   });

//   const updateAuthState = useCallback((updates) => {
//     setAuthState((prev) => ({ ...prev, ...updates }));
//   }, []);

//   const fetchUserDetails = useCallback(async (token) => {
//     try {
//       api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
//       const response = await api.get('/api/auth/users/me/');
      
//       // Ensure all required fields have default values
//       return {
//         name: response.data.name || '',
//         email: response.data.email || '',
//         profile_pic: response.data.profile_pic || '',
//         user_type: response.data.user_type || '',
//         is_2fa_enabled: response.data.is_2fa_enabled || false,
//       };
//     } catch (error) {
//       console.error('Failed to fetch user details:', error);
//       throw error;
//     }
//   }, []);

//   const logout = useCallback(() => {
//     console.log('Logging out');
//     localStorage.removeItem(ACCESS_TOKEN);
//     localStorage.removeItem(REFRESH_TOKEN);
//     localStorage.removeItem('rememberMe');
//     delete api.defaults.headers.common['Authorization'];

//     updateAuthState({
//       isAuthenticated: false,
//       authToken: null,
//       userPermissions: [],
//       userDetails: { 
//         name: '', 
//         email: '', 
//         profile_pic: '', 
//         user_type: '', 
//         is_2fa_enabled: false 
//       },
//       loading: false,
//     });
//   }, [updateAuthState]);

//   const refreshToken = useCallback(async () => {
//     const refresh = localStorage.getItem(REFRESH_TOKEN);
//     if (!refresh) {
//       console.log('No refresh token, logging out');
//       logout();
//       return false;
//     }

//     try {
//       const response = await api.post('/api/auth/jwt/refresh/', { refresh });
//       const newAccessToken = response.data.access;
//       localStorage.setItem(ACCESS_TOKEN, newAccessToken);

//       const userDetails = await fetchUserDetails(newAccessToken);
//       updateAuthState({
//         authToken: newAccessToken,
//         isAuthenticated: true,
//         userDetails,
//       });

//       return true;
//     } catch (error) {
//       console.error('Token refresh failed:', error);
//       logout();
//       return false;
//     }
//   }, [fetchUserDetails, logout, updateAuthState]);

//   const validateToken = useCallback(async () => {
//     const token = localStorage.getItem(ACCESS_TOKEN);
//     console.log('Validating token on mount:', token ? 'Token found' : 'No token');

//     if (!token) {
//       updateAuthState({ isAuthenticated: false, loading: false });
//       return false;
//     }

//     try {
//       // Test if token is valid by making a simple request
//       await api.get('/api/auth/users/me/');
      
//       const userDetails = await fetchUserDetails(token);
//       updateAuthState({
//         isAuthenticated: true,
//         authToken: token,
//         userDetails,
//         loading: false,
//       });

//       return true;
//     } catch (error) {
//       console.error('Token validation failed:', error);
      
//       // Try to refresh token if validation fails
//       try {
//         const refreshTokenValue = localStorage.getItem(REFRESH_TOKEN);
//         if (refreshTokenValue) {
//           const refreshResponse = await api.post('/api/auth/jwt/refresh/', {
//             refresh: refreshTokenValue
//           });
          
//           const newAccessToken = refreshResponse.data.access;
//           localStorage.setItem(ACCESS_TOKEN, newAccessToken);
          
//           const userDetails = await fetchUserDetails(newAccessToken);
//           updateAuthState({
//             isAuthenticated: true,
//             authToken: newAccessToken,
//             userDetails,
//             loading: false,
//           });
//           return true;
//         }
//       } catch (refreshError) {
//         console.error('Token refresh also failed:', refreshError);
//       }
      
//       // If all fails, logout
//       logout();
//       return false;
//     }
//   }, [updateAuthState, fetchUserDetails, logout]);

//   useEffect(() => {
//     validateToken();
//   }, [validateToken]);

//   const login = useCallback(
//     async (accessToken, refreshTokenValue, permissions = []) => {
//       localStorage.setItem(ACCESS_TOKEN, accessToken);
//       localStorage.setItem(REFRESH_TOKEN, refreshTokenValue);

//       try {
//         const userDetails = await fetchUserDetails(accessToken);
//         updateAuthState({
//           isAuthenticated: true,
//           authToken: accessToken,
//           userPermissions: permissions,
//           userDetails,
//           loading: false,
//         });
//       } catch (error) {
//         console.error('Login failed:', error);
//         logout();
//         throw error;
//       }
//     },
//     [fetchUserDetails, updateAuthState, logout]
//   );

//   const updateUserDetails = useCallback(
//     (newDetails) => {
//       updateAuthState((prev) => ({
//         userDetails: { ...prev.userDetails, ...newDetails },
//       }));
//     },
//     [updateAuthState]
//   );

//   useEffect(() => {
//     if (!authState.isAuthenticated) return;

//     const interval = setInterval(() => {
//       console.log('Refreshing token...');
//       refreshToken().catch(console.error);
//     }, 4 * 60 * 1000); // Every 4 minutes

//     return () => clearInterval(interval);
//   }, [authState.isAuthenticated, refreshToken]);

//   const contextValue = useMemo(
//     () => ({
//       isAuthenticated: authState.isAuthenticated,
//       authToken: authState.authToken,
//       userPermissions: authState.userPermissions,
//       userDetails: authState.userDetails,
//       loading: authState.loading,
//       login,
//       logout,
//       refreshToken,
//       updateUserDetails,
//     }),
//     [authState, login, logout, refreshToken, updateUserDetails]
//   );

//   return (
//     <AuthContext.Provider value={contextValue}>
//       {children}
//     </AuthContext.Provider>
//   );
// };





// import React, {
//   createContext,
//   useContext,
//   useState,
//   useEffect,
//   useCallback,
//   useMemo,
//   useRef,
// } from 'react';
// import api from '../api';
// import { ACCESS_TOKEN, REFRESH_TOKEN } from '../constants/index';

// const AuthContext = createContext();

// // Cache implementation with TTL (Time To Live)
// class Cache {
//   constructor(ttl = 300000) { // 5 minutes default TTL
//     this.cache = new Map();
//     this.ttl = ttl;
//   }

//   set(key, value, ttl = this.ttl) {
//     const expiry = Date.now() + ttl;
//     this.cache.set(key, { value, expiry });
//   }

//   get(key) {
//     const item = this.cache.get(key);
//     if (!item) return null;
    
//     if (Date.now() > item.expiry) {
//       this.cache.delete(key);
//       return null;
//     }
    
//     return item.value;
//   }

//   delete(key) {
//     this.cache.delete(key);
//   }

//   clear() {
//     this.cache.clear();
//   }
// }

// // Request deduplication tracker
// const requestTracker = new Map();

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };

// export const AuthProvider = ({ children }) => {
//   const [authState, setAuthState] = useState({
//     isAuthenticated: false,
//     userPermissions: [],
//     authToken: null,
//     userDetails: { 
//       name: '', 
//       email: '', 
//       profile_pic: '', 
//       user_type: '', 
//       is_2fa_enabled: false 
//     },
//     loading: true,
//   });

//   // Using refs for values that don't need re-renders
//   const userCache = useRef(new Cache(300000)); // 5 minute cache
//   const tokenRefreshTimeout = useRef(null);

//   const updateAuthState = useCallback((updates) => {
//     setAuthState((prev) => ({ ...prev, ...updates }));
//   }, []);

//   const debounce = useCallback((func, delay) => {
//     let timeoutId;
//     return (...args) => {
//       clearTimeout(timeoutId);
//       timeoutId = setTimeout(() => func.apply(null, args), delay);
//     };
//   }, []);

//   const fetchUserDetails = useCallback(async (token, forceRefresh = false) => {
//     const cacheKey = `user_details_${token}`;
    
//     // Return cached data if available and not forcing refresh
//     if (!forceRefresh) {
//       const cachedData = userCache.current.get(cacheKey);
//       if (cachedData) {
//         return cachedData;
//       }
//     }

//     // Request deduplication - check if same request is in progress
//     if (requestTracker.has(cacheKey)) {
//       return requestTracker.get(cacheKey);
//     }

//     try {
//       api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
//       // Create a promise for the request and track it
//       const requestPromise = api.get('/api/auth/users/me/')
//         .then(response => {
//           // Ensure all required fields have default values
//           const userData = {
//             name: response.data.name || '',
//             email: response.data.email || '',
//             profile_pic: response.data.profile_pic || '',
//             user_type: response.data.user_type || '',
//             is_2fa_enabled: response.data.is_2fa_enabled || false,
//           };
          
//           // Cache the response
//           userCache.current.set(cacheKey, userData);
//           return userData;
//         })
//         .finally(() => {
//           // Remove from tracker when done
//           requestTracker.delete(cacheKey);
//         });

//       // Track the request
//       requestTracker.set(cacheKey, requestPromise);
      
//       return await requestPromise;
//     } catch (error) {
//       console.error('Failed to fetch user details:', error);
//       requestTracker.delete(cacheKey);
//       throw error;
//     }
//   }, []);

//   const logout = useCallback(() => {
//     console.log('Logging out');
    
//     // Clear all timeouts and intervals
//     if (tokenRefreshTimeout.current) {
//       clearTimeout(tokenRefreshTimeout.current);
//     }
    
//     // Clear cache
//     userCache.current.clear();
    
//     localStorage.removeItem(ACCESS_TOKEN);
//     localStorage.removeItem(REFRESH_TOKEN);
//     localStorage.removeItem('rememberMe');
//     delete api.defaults.headers.common['Authorization'];

//     updateAuthState({
//       isAuthenticated: false,
//       authToken: null,
//       userPermissions: [],
//       userDetails: { 
//         name: '', 
//         email: '', 
//         profile_pic: '', 
//         user_type: '', 
//         is_2fa_enabled: false 
//       },
//       loading: false,
//     });
//   }, [updateAuthState]);

//   const refreshToken = useCallback(async () => {
//     const refresh = localStorage.getItem(REFRESH_TOKEN);
//     if (!refresh) {
//       console.log('No refresh token, logging out');
//       logout();
//       return false;
//     }

//     const cacheKey = `token_refresh_${refresh}`;
    
//     // Check if refresh request is already in progress
//     if (requestTracker.has(cacheKey)) {
//       return requestTracker.get(cacheKey);
//     }

//     try {
//       const requestPromise = api.post('/api/auth/jwt/refresh/', { refresh })
//         .then(async (response) => {
//           const newAccessToken = response.data.access;
//           localStorage.setItem(ACCESS_TOKEN, newAccessToken);

//           const userDetails = await fetchUserDetails(newAccessToken, true); // Force refresh
//           updateAuthState({
//             authToken: newAccessToken,
//             isAuthenticated: true,
//             userDetails,
//           });

//           return true;
//         })
//         .finally(() => {
//           requestTracker.delete(cacheKey);
//         });

//       requestTracker.set(cacheKey, requestPromise);
//       return await requestPromise;
//     } catch (error) {
//       console.error('Token refresh failed:', error);
//       requestTracker.delete(cacheKey);
//       logout();
//       return false;
//     }
//   }, [fetchUserDetails, logout, updateAuthState]);

//   const validateToken = useCallback(async () => {
//     const token = localStorage.getItem(ACCESS_TOKEN);
//     console.log('Validating token on mount:', token ? 'Token found' : 'No token');

//     if (!token) {
//       updateAuthState({ isAuthenticated: false, loading: false });
//       return false;
//     }

//     // Use cached user data if available to avoid immediate API call
//     const cacheKey = `user_details_${token}`;
//     const cachedUserData = userCache.current.get(cacheKey);
    
//     if (cachedUserData) {
//       updateAuthState({
//         isAuthenticated: true,
//         authToken: token,
//         userDetails: cachedUserData,
//         loading: false,
//       });
//       return true;
//     }

//     try {
//       // Use HEAD request for token validation (lighter than GET)
//       await api.head('/api/auth/users/me/');
      
//       const userDetails = await fetchUserDetails(token);
//       updateAuthState({
//         isAuthenticated: true,
//         authToken: token,
//         userDetails,
//         loading: false,
//       });

//       return true;
//     } catch (error) {
//       console.error('Token validation failed:', error);
      
//       // Try to refresh token if validation fails
//       try {
//         return await refreshToken();
//       } catch (refreshError) {
//         console.error('Token refresh also failed:', refreshError);
//       }
      
//       // If all fails, logout
//       logout();
//       return false;
//     }
//   }, [updateAuthState, fetchUserDetails, refreshToken, logout]);

//   // Debounced version of validateToken to prevent rapid calls
//   const debouncedValidateToken = useMemo(() => 
//     debounce(validateToken, 1000), [debounce, validateToken]
//   );

//   useEffect(() => {
//     debouncedValidateToken();
//   }, [debouncedValidateToken]);

//   const login = useCallback(
//     async (accessToken, refreshTokenValue, permissions = []) => {
//       localStorage.setItem(ACCESS_TOKEN, accessToken);
//       localStorage.setItem(REFRESH_TOKEN, refreshTokenValue);

//       try {
//         const userDetails = await fetchUserDetails(accessToken, true); // Force refresh on login
//         updateAuthState({
//           isAuthenticated: true,
//           authToken: accessToken,
//           userPermissions: permissions,
//           userDetails,
//           loading: false,
//         });
//       } catch (error) {
//         console.error('Login failed:', error);
//         logout();
//         throw error;
//       }
//     },
//     [fetchUserDetails, updateAuthState, logout]
//   );

//   const updateUserDetails = useCallback(
//     (newDetails) => {
//       updateAuthState((prev) => ({
//         userDetails: { ...prev.userDetails, ...newDetails },
//       }));
      
//       // Update cache as well
//       const token = localStorage.getItem(ACCESS_TOKEN);
//       if (token) {
//         const cacheKey = `user_details_${token}`;
//         const cachedData = userCache.current.get(cacheKey) || {};
//         userCache.current.set(cacheKey, { ...cachedData, ...newDetails });
//       }
//     },
//     [updateAuthState]
//   );

//   // Token refresh scheduler with exponential backoff
//   const scheduleTokenRefresh = useCallback(() => {
//     if (tokenRefreshTimeout.current) {
//       clearTimeout(tokenRefreshTimeout.current);
//     }

//     // Refresh token 1 minute before expiration (JWT typically expires in 5 minutes)
//     tokenRefreshTimeout.current = setTimeout(() => {
//       refreshToken()
//         .then(success => {
//           if (success) {
//             scheduleTokenRefresh(); // Reschedule for next refresh
//           }
//         })
//         .catch(console.error);
//     }, 4 * 60 * 1000); // 4 minutes
//   }, [refreshToken]);

//   useEffect(() => {
//     if (!authState.isAuthenticated) return;
    
//     scheduleTokenRefresh();
    
//     return () => {
//       if (tokenRefreshTimeout.current) {
//         clearTimeout(tokenRefreshTimeout.current);
//       }
//     };
//   }, [authState.isAuthenticated, scheduleTokenRefresh]);

//   const contextValue = useMemo(
//     () => ({
//       isAuthenticated: authState.isAuthenticated,
//       authToken: authState.authToken,
//       userPermissions: authState.userPermissions,
//       userDetails: authState.userDetails,
//       loading: authState.loading,
//       login,
//       logout,
//       refreshToken,
//       updateUserDetails,
//     }),
//     [authState, login, logout, refreshToken, updateUserDetails]
//   );

//   return (
//     <AuthContext.Provider value={contextValue}>
//       {children}
//     </AuthContext.Provider>
//   );
// };







// import React, {
//   createContext,
//   useContext,
//   useState,
//   useEffect,
//   useCallback,
//   useMemo,
//   useRef,
// } from 'react';
// import api from '../api';
// import { ACCESS_TOKEN, REFRESH_TOKEN } from '../constants/index';

// const AuthContext = createContext();

// // Simple cache implementation
// class SimpleCache {
//   constructor() {
//     this.cache = new Map();
//   }

//   set(key, value) {
//     this.cache.set(key, value);
//   }

//   get(key) {
//     return this.cache.get(key);
//   }

//   delete(key) {
//     this.cache.delete(key);
//   }

//   clear() {
//     this.cache.clear();
//   }
// }

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };

// export const AuthProvider = ({ children }) => {
//   const [authState, setAuthState] = useState({
//     isAuthenticated: false,
//     userPermissions: [],
//     authToken: null,
//     userDetails: {
//       name: '',
//       email: '',
//       profile_pic: '',
//       user_type: '',
//       is_2fa_enabled: false,
//     },
//     loading: true,
//   });

//   const userCache = useRef(new SimpleCache());
//   const tokenRefreshTimeout = useRef(null);

//   const updateAuthState = useCallback((updates) => {
//     setAuthState((prev) => ({ ...prev, ...updates }));
//   }, []);

//   // --- FIX: Safe destructuring with defaults ---
//   const fetchUserDetails = useCallback(async (token, forceRefresh = false) => {
//     const cacheKey = `user_details_${token}`;

//     if (!forceRefresh) {
//       const cachedData = userCache.current.get(cacheKey);
//       if (cachedData) return cachedData;
//     }

//     try {
//       const config = {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//       };

//       const response = await api.get('/api/auth/users/me/', config);

//       // ✅ Destructure safely with defaults
//       const {
//         name = '',
//         email = '',
//         profile_pic = '',
//         user_type = '',
//         is_2fa_enabled = false,
//       } = response?.data || {};

//       const userData = { name, email, profile_pic, user_type, is_2fa_enabled };

//       userCache.current.set(cacheKey, userData);
//       return userData;
//     } catch (error) {
//       console.error('Failed to fetch user details:', error);
//       throw error;
//     }
//   }, []);

//   const logout = useCallback(() => {
//     console.log('Logging out');
//     if (tokenRefreshTimeout.current) {
//       clearTimeout(tokenRefreshTimeout.current);
//     }
//     userCache.current.clear();
//     localStorage.removeItem(ACCESS_TOKEN);
//     localStorage.removeItem(REFRESH_TOKEN);
//     localStorage.removeItem('rememberMe');

//     updateAuthState({
//       isAuthenticated: false,
//       authToken: null,
//       userPermissions: [],
//       userDetails: {
//         name: '',
//         email: '',
//         profile_pic: '',
//         user_type: '',
//         is_2fa_enabled: false,
//       },
//       loading: false,
//     });
//   }, [updateAuthState]);

//   const refreshToken = useCallback(async () => {
//     const refresh = localStorage.getItem(REFRESH_TOKEN);
//     if (!refresh) {
//       console.log('No refresh token, logging out');
//       logout();
//       return false;
//     }

//     try {
//       const response = await api.post('/api/auth/jwt/refresh/', { refresh });
//       const newAccessToken = response.data.access;
//       localStorage.setItem(ACCESS_TOKEN, newAccessToken);

//       const userDetails = await fetchUserDetails(newAccessToken, true);
//       updateAuthState({
//         authToken: newAccessToken,
//         isAuthenticated: true,
//         userDetails,
//       });

//       return true;
//     } catch (error) {
//       console.error('Token refresh failed:', error);
//       logout();
//       return false;
//     }
//   }, [fetchUserDetails, logout, updateAuthState]);

//   const validateToken = useCallback(async () => {
//     const token = localStorage.getItem(ACCESS_TOKEN);
//     console.log('Validating token on mount:', token ? 'Token found' : 'No token');

//     if (!token) {
//       updateAuthState({ isAuthenticated: false, loading: false });
//       return false;
//     }

//     const cacheKey = `user_details_${token}`;
//     const cachedUserData = userCache.current.get(cacheKey);

//     if (cachedUserData) {
//       updateAuthState({
//         isAuthenticated: true,
//         authToken: token,
//         userDetails: cachedUserData,
//         loading: false,
//       });
//       return true;
//     }

//     try {
//       const config = {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//       };

//       await api.get('/api/auth/users/me/', config);

//       const userDetails = await fetchUserDetails(token);
//       updateAuthState({
//         isAuthenticated: true,
//         authToken: token,
//         userDetails,
//         loading: false,
//       });

//       return true;
//     } catch (error) {
//       console.error('Token validation failed:', error);
//       try {
//         return await refreshToken();
//       } catch (refreshError) {
//         console.error('Token refresh also failed:', refreshError);
//       }
//       logout();
//       return false;
//     }
//   }, [updateAuthState, fetchUserDetails, refreshToken, logout]);

//   useEffect(() => {
//     validateToken();
//   }, [validateToken]);

//   const login = useCallback(
//     async (accessToken, refreshTokenValue, permissions = []) => {
//       localStorage.setItem(ACCESS_TOKEN, accessToken);
//       localStorage.setItem(REFRESH_TOKEN, refreshTokenValue);

//       try {
//         const userDetails = await fetchUserDetails(accessToken, true);
//         updateAuthState({
//           isAuthenticated: true,
//           authToken: accessToken,
//           userPermissions: permissions,
//           userDetails,
//           loading: false,
//         });
//       } catch (error) {
//         console.error('Login failed:', error);
//         logout();
//         throw error;
//       }
//     },
//     [fetchUserDetails, updateAuthState, logout]
//   );

//   const updateUserDetails = useCallback(
//     (newDetails) => {
//       updateAuthState((prev) => ({
//         userDetails: { ...prev.userDetails, ...newDetails },
//       }));

//       const token = localStorage.getItem(ACCESS_TOKEN);
//       if (token) {
//         const cacheKey = `user_details_${token}`;
//         const cachedData = userCache.current.get(cacheKey) || {};
//         userCache.current.set(cacheKey, { ...cachedData, ...newDetails });
//       }
//     },
//     [updateAuthState]
//   );

//   const scheduleTokenRefresh = useCallback(() => {
//     if (tokenRefreshTimeout.current) clearTimeout(tokenRefreshTimeout.current);

//     tokenRefreshTimeout.current = setTimeout(() => {
//       refreshToken()
//         .then((success) => {
//           if (success) scheduleTokenRefresh();
//         })
//         .catch(console.error);
//     }, 4 * 60 * 1000);
//   }, [refreshToken]);

//   useEffect(() => {
//     if (!authState.isAuthenticated) return;
//     scheduleTokenRefresh();
//     return () => {
//       if (tokenRefreshTimeout.current) clearTimeout(tokenRefreshTimeout.current);
//     };
//   }, [authState.isAuthenticated, scheduleTokenRefresh]);

//   const contextValue = useMemo(
//     () => ({
//       isAuthenticated: authState.isAuthenticated,
//       authToken: authState.authToken,
//       userPermissions: authState.userPermissions,
//       userDetails: authState.userDetails,
//       loading: authState.loading,
//       login,
//       logout,
//       refreshToken,
//       updateUserDetails,
//     }),
//     [authState, login, logout, refreshToken, updateUserDetails]
//   );

//   return (
//     <AuthContext.Provider value={contextValue}>
//       {children}
//     </AuthContext.Provider>
//   );
// };








import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import api from '../api';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../constants/index';

const AuthContext = createContext();

// Advanced LRU Cache with TTL and statistics
class AdvancedCache {
  constructor(maxSize = 50, defaultTTL = 300000) {
    this.cache = new Map();
    this.accessOrder = [];
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      size: 0
    };
  }

  set(key, value, ttl = this.defaultTTL) {
    // LRU eviction algorithm
    if (this.cache.size >= this.maxSize) {
      const lruKey = this.accessOrder.shift();
      if (lruKey && this.cache.has(lruKey)) {
        this.cache.delete(lruKey);
        this.stats.evictions++;
      }
    }

    this.cache.set(key, {
      value,
      expiry: Date.now() + ttl,
      timestamp: Date.now()
    });
    
    // Update access order (move to end for MRU)
    this.accessOrder = this.accessOrder.filter(k => k !== key);
    this.accessOrder.push(key);
    
    this.stats.size = this.cache.size;
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) {
      this.stats.misses++;
      return null;
    }

    // Check expiration using TTL algorithm
    if (Date.now() > item.expiry) {
      this.delete(key);
      this.stats.misses++;
      return null;
    }

    // Update access pattern for LRU
    this.accessOrder = this.accessOrder.filter(k => k !== key);
    this.accessOrder.push(key);
    
    this.stats.hits++;
    return item.value;
  }

  delete(key) {
    if (this.cache.delete(key)) {
      this.accessOrder = this.accessOrder.filter(k => k !== key);
      this.stats.size = this.cache.size;
    }
  }

  clear() {
    this.cache.clear();
    this.accessOrder = [];
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      size: 0
    };
  }

  cleanup() {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.delete(key);
        cleaned++;
      }
    }
    
    return cleaned;
  }

  getStats() {
    return { ...this.stats };
  }
}

// Exponential backoff algorithm for retries
const withRetry = async (fn, maxRetries = 3, baseDelay = 1000) => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries - 1) throw error;
      
      // Don't retry on client errors (except 429)
      if (error.response?.status >= 400 && error.response?.status < 500 && error.response?.status !== 429) {
        throw error;
      }

      const delay = baseDelay * Math.pow(2, attempt);
      console.warn(`Auth operation failed, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
      
      await new Promise(resolve => setTimeout(resolve, delay + Math.random() * 500));
    }
  }
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    userPermissions: [],
    authToken: null,
    userDetails: {
      name: '',
      email: '',
      profile_pic: '',
      user_type: 'admin',
      is_2fa_enabled: false,
    },
    loading: true,
    lastUpdated: null,
  });

  const userCache = useRef(new AdvancedCache());
  const tokenRefreshTimeout = useRef(null);
  const cleanupInterval = useRef(null);

  // Memoized state updater with timestamp
  const updateAuthState = useCallback((updates) => {
    setAuthState((prev) => ({ 
      ...prev, 
      ...updates,
      lastUpdated: Date.now()
    }));
  }, []);

  // User type normalization with caching
  const normalizeUserType = useCallback((userType) => {
    if (!userType || typeof userType !== 'string') return 'admin';
    
    const normalized = userType.toLowerCase();
    const validTypes = ['admin', 'superadmin', 'superuser'];
    
    return validTypes.includes(normalized) ? normalized : 'admin';
  }, []);

  // Optimized user details fetching with caching and retry
  const fetchUserDetails = useCallback(async (token, forceRefresh = false) => {
    const cacheKey = `user_details_${token}`;

    if (!forceRefresh) {
      const cachedData = userCache.current.get(cacheKey);
      if (cachedData) {
        console.log('User details cache hit');
        return cachedData;
      }
    }

    return withRetry(async () => {
      try {
        const response = await api.get('/api/auth/users/me/', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const userData = response?.data || {};
        const {
          name = '',
          email = '',
          profile_pic = '',
          user_type = 'admin',
          is_2fa_enabled = false,
        } = userData;

        const normalizedUserType = normalizeUserType(user_type);

        const processedUserData = { 
          name, 
          email, 
          profile_pic, 
          user_type: normalizedUserType, 
          is_2fa_enabled,
          fetchedAt: Date.now()
        };

        userCache.current.set(cacheKey, processedUserData, 300000); // 5 minutes cache
        return processedUserData;
      } catch (error) {
        console.error('Failed to fetch user details:', error);
        throw error;
      }
    });
  }, [normalizeUserType]);

  // Optimized logout with cleanup
  const logout = useCallback(() => {
    console.log('Logging out with cleanup');
    
    // Clear all timeouts and intervals
    if (tokenRefreshTimeout.current) {
      clearTimeout(tokenRefreshTimeout.current);
      tokenRefreshTimeout.current = null;
    }
    
    if (cleanupInterval.current) {
      clearInterval(cleanupInterval.current);
      cleanupInterval.current = null;
    }

    // Clear storage and cache
    userCache.current.clear();
    localStorage.removeItem(ACCESS_TOKEN);
    localStorage.removeItem(REFRESH_TOKEN);
    localStorage.removeItem('rememberMe');

    updateAuthState({
      isAuthenticated: false,
      authToken: null,
      userPermissions: [],
      userDetails: {
        name: '',
        email: '',
        profile_pic: '',
        user_type: 'admin',
        is_2fa_enabled: false,
      },
      loading: false,
    });
  }, [updateAuthState]);

  // Token refresh with exponential backoff
  const refreshToken = useCallback(async () => {
    const refresh = localStorage.getItem(REFRESH_TOKEN);
    if (!refresh) {
      console.log('No refresh token available');
      logout();
      return false;
    }

    return withRetry(async () => {
      try {
        const response = await api.post('/api/auth/jwt/refresh/', { refresh });
        const newAccessToken = response.data.access;
        localStorage.setItem(ACCESS_TOKEN, newAccessToken);

        const userDetails = await fetchUserDetails(newAccessToken, true);
        updateAuthState({
          authToken: newAccessToken,
          isAuthenticated: true,
          userDetails,
        });

        return true;
      } catch (error) {
        console.error('Token refresh failed:', error);
        logout();
        return false;
      }
    });
  }, [fetchUserDetails, logout, updateAuthState]);

  // Token validation with caching
  const validateToken = useCallback(async () => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    console.log('Token validation initiated:', token ? 'Token found' : 'No token');

    if (!token) {
      updateAuthState({ isAuthenticated: false, loading: false });
      return false;
    }

    const cacheKey = `user_details_${token}`;
    const cachedUserData = userCache.current.get(cacheKey);

    if (cachedUserData) {
      console.log('Using cached user data for validation');
      updateAuthState({
        isAuthenticated: true,
        authToken: token,
        userDetails: cachedUserData,
        loading: false,
      });
      return true;
    }

    return withRetry(async () => {
      try {
        await api.get('/api/auth/users/me/', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const userDetails = await fetchUserDetails(token);
        updateAuthState({
          isAuthenticated: true,
          authToken: token,
          userDetails,
          loading: false,
        });

        return true;
      } catch (error) {
        console.error('Token validation failed:', error);
        try {
          return await refreshToken();
        } catch (refreshError) {
          console.error('Token refresh also failed:', refreshError);
        }
        logout();
        return false;
      }
    });
  }, [updateAuthState, fetchUserDetails, refreshToken, logout]);

  // Efficient login with batch operations
  const login = useCallback(
    async (accessToken, refreshTokenValue, permissions = []) => {
      localStorage.setItem(ACCESS_TOKEN, accessToken);
      localStorage.setItem(REFRESH_TOKEN, refreshTokenValue);

      try {
        const userDetails = await fetchUserDetails(accessToken, true);
        updateAuthState({
          isAuthenticated: true,
          authToken: accessToken,
          userPermissions: permissions,
          userDetails,
          loading: false,
        });
      } catch (error) {
        console.error('Login failed:', error);
        logout();
        throw error;
      }
    },
    [fetchUserDetails, updateAuthState, logout]
  );

  // Optimized user details update
  const updateUserDetails = useCallback(
    (newDetails) => {
      updateAuthState((prev) => ({
        userDetails: { ...prev.userDetails, ...newDetails },
      }));

      const token = localStorage.getItem(ACCESS_TOKEN);
      if (token) {
        const cacheKey = `user_details_${token}`;
        const cachedData = userCache.current.get(cacheKey) || {};
        userCache.current.set(cacheKey, { ...cachedData, ...newDetails });
      }
    },
    [updateAuthState]
  );

  // Smart token refresh scheduling
  const scheduleTokenRefresh = useCallback(() => {
    if (tokenRefreshTimeout.current) {
      clearTimeout(tokenRefreshTimeout.current);
    }

    // Refresh 1 minute before typical JWT expiration (14 minutes)
    tokenRefreshTimeout.current = setTimeout(() => {
      refreshToken()
        .then((success) => {
          if (success) scheduleTokenRefresh();
        })
        .catch(console.error);
    }, 13 * 60 * 1000); // 13 minutes
  }, [refreshToken]);

  // Effects with cleanup
  useEffect(() => {
    validateToken();
    
    return () => {
      if (tokenRefreshTimeout.current) {
        clearTimeout(tokenRefreshTimeout.current);
      }
    };
  }, [validateToken]);

  useEffect(() => {
    if (!authState.isAuthenticated) return;
    scheduleTokenRefresh();
    
    return () => {
      if (tokenRefreshTimeout.current) {
        clearTimeout(tokenRefreshTimeout.current);
      }
    };
  }, [authState.isAuthenticated, scheduleTokenRefresh]);

  useEffect(() => {
    // Periodic cache cleanup
    cleanupInterval.current = setInterval(() => {
      const cleaned = userCache.current.cleanup();
      if (cleaned > 0) {
        console.log(`Cleaned ${cleaned} expired cache items`);
      }
    }, 30000); // Every 30 seconds

    return () => {
      if (cleanupInterval.current) {
        clearInterval(cleanupInterval.current);
      }
    };
  }, []);

  // Memoized context value with derived state
  const contextValue = useMemo(() => {
    const { user_type } = authState.userDetails;
    const isAdmin = ['admin', 'superadmin', 'superuser'].includes(user_type);
    const isSuperAdmin = ['superadmin', 'superuser'].includes(user_type);
    
    return {
      ...authState,
      login,
      logout,
      refreshToken,
      updateUserDetails,
      isAdmin,
      isSuperAdmin,
      cacheStats: userCache.current.getStats(),
    };
  }, [authState, login, logout, refreshToken, updateUserDetails]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};