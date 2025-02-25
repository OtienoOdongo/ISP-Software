// import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
// import api from '../../api'; 
// import { ACCESS_TOKEN } from '../constants/index';

// const AuthContext = createContext();

// export const useAuth = () => useContext(AuthContext);

// export const AuthProvider = ({ children }) => {
//     const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem(ACCESS_TOKEN));
//     const [userPermissions, setUserPermissions] = useState([]);
//     const [authToken, setAuthToken] = useState(localStorage.getItem(ACCESS_TOKEN) || null);

//     useEffect(() => {
//         const token = localStorage.getItem(ACCESS_TOKEN);
//         setAuthToken(token);
//         setIsAuthenticated(!!token);
//     }, []);

//     const login = useCallback((accessToken, refreshToken, permissions = []) => {
//         setAuthToken(accessToken);
//         localStorage.setItem(ACCESS_TOKEN, accessToken);
//         localStorage.setItem("refreshToken", refreshToken);
//         setIsAuthenticated(true);
//         setUserPermissions(permissions);
//     }, []);

//     const logout = useCallback(() => {
//         localStorage.removeItem(ACCESS_TOKEN);
//         localStorage.removeItem("refreshToken");
//         localStorage.removeItem("rememberMe");
//         setAuthToken(null);
//         setIsAuthenticated(false);
//         setUserPermissions([]);
//     }, []);

//     const refreshToken = useCallback(async () => {
//         const refresh = localStorage.getItem("refreshToken");
//         if (!refresh) {
//             logout();
//             return false;
//         }
//         try {
//             const response = await api.post("/api/auth/jwt/refresh/", { refresh });
//             setAuthToken(response.data.access);
//             localStorage.setItem(ACCESS_TOKEN, response.data.access);
//             setIsAuthenticated(true);
//             return true;
//         } catch (error) {
//             console.error("Token refresh failed:", error.response?.data);
//             logout();
//             return false;
//         }
//     }, [logout]);

//     // Auto-refresh token before expiry
//     useEffect(() => {
//         const interval = setInterval(() => {
//             if (isAuthenticated) {
//                 refreshToken();
//             }
//         }, 4 * 60 * 1000); // Refresh every 4 minutes (assuming 5-min expiry)
//         return () => clearInterval(interval);
//     }, [isAuthenticated, refreshToken]);

//     return (
//         <AuthContext.Provider
//             value={{
//                 isAuthenticated,
//                 authToken,
//                 userPermissions,
//                 login,
//                 logout,
//                 refreshToken,
//             }}
//         >
//             {children}
//         </AuthContext.Provider>
//     );
// };




import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../../api';
import { ACCESS_TOKEN } from '../constants/index';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Default to false
  const [userPermissions, setUserPermissions] = useState([]);
  const [authToken, setAuthToken] = useState(null);

  // Validate token on app load
  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem(ACCESS_TOKEN);
      if (token) {
        try {
          await api.get("/api/auth/users/me/"); // Verify token
          setAuthToken(token);
          setIsAuthenticated(true);
        } catch (error) {
          console.error("Token validation failed:", error);
          logout(); // Clear invalid token
        }
      }
    };
    validateToken();
  }, []);

  const login = useCallback((accessToken, refreshToken, permissions = []) => {
    localStorage.setItem(ACCESS_TOKEN, accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    setAuthToken(accessToken);
    setIsAuthenticated(true);
    setUserPermissions(permissions);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(ACCESS_TOKEN);
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("rememberMe");
    setAuthToken(null);
    setIsAuthenticated(false);
    setUserPermissions([]);
  }, []);

  const refreshToken = useCallback(async () => {
    const refresh = localStorage.getItem("refreshToken");
    if (!refresh) {
      logout();
      return false;
    }
    try {
      const response = await api.post("/api/auth/jwt/refresh/", { refresh });
      setAuthToken(response.data.access);
      localStorage.setItem(ACCESS_TOKEN, response.data.access);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error("Token refresh failed:", error);
      logout();
      return false;
    }
  }, [logout]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isAuthenticated) {
        refreshToken();
      }
    }, 4 * 60 * 1000); // Every 4 minutes
    return () => clearInterval(interval);
  }, [isAuthenticated, refreshToken]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, authToken, userPermissions, login, logout, refreshToken }}>
      {children}
    </AuthContext.Provider>
  );
};