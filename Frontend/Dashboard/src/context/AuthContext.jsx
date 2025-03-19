
// // context/AuthContext.jsx
// import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
// import api from '../../api';
// import { ACCESS_TOKEN } from '../constants/index';

// const AuthContext = createContext();

// export const useAuth = () => useContext(AuthContext);

// export const AuthProvider = ({ children }) => {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [userPermissions, setUserPermissions] = useState([]);
//   const [authToken, setAuthToken] = useState(null);
//   const [userDetails, setUserDetails] = useState({ name: "", email: "", profilePic: "" });
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const validateToken = async () => {
//       const token = localStorage.getItem(ACCESS_TOKEN);
//       console.log('Validating token on mount:', token ? 'Token found' : 'No token');
//       if (!token) {
//         setLoading(false);
//         return;
//       }

//       try {
//         api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
//         const response = await api.get("/api/auth/users/me/");
//         console.log('Djoser user response:', response.data);
//         setAuthToken(token);
//         setIsAuthenticated(true);
//         setUserDetails({
//           name: response.data.name || "User",
//           email: response.data.email || "",
//           profilePic: response.data.profile_pic || "",
//         });
//       } catch (error) {
//         console.error("Token validation failed:", error.message, error.response?.data);
//         logout();
//       } finally {
//         console.log('Setting loading to false after validation');
//         setLoading(false);
//       }
//     };
//     validateToken();
//   }, []);

//   const login = useCallback(async (accessToken, refreshToken, permissions = []) => {
//     localStorage.setItem(ACCESS_TOKEN, accessToken);
//     localStorage.setItem("refreshToken", refreshToken);
//     setAuthToken(accessToken);
//     setIsAuthenticated(true);
//     setUserPermissions(permissions);
//     setLoading(true);

//     try {
//       api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
//       const response = await api.get("/api/auth/users/me/");
//       console.log('Login Djoser user response:', response.data);
//       setUserDetails({
//         name: response.data.name || "User",
//         email: response.data.email || "",
//         profilePic: response.data.profile_pic || "",
//       });
//     } catch (error) {
//       console.error("Failed to fetch user details after login:", error.message, error.response?.data);
//       setUserDetails({ name: "User", email: "", profilePic: "" });
//     } finally {
//       console.log('Setting loading to false after login');
//       setLoading(false);
//     }
//   }, []);

//   const logout = useCallback(() => {
//     console.log('Logging out');
//     localStorage.removeItem(ACCESS_TOKEN);
//     localStorage.removeItem("refreshToken");
//     localStorage.removeItem("rememberMe");
//     delete api.defaults.headers.common['Authorization'];
//     setAuthToken(null);
//     setIsAuthenticated(false);
//     setUserPermissions([]);
//     setUserDetails({ name: "", email: "", profilePic: "" });
//     setLoading(false);
//   }, []);

//   const refreshToken = useCallback(async () => {
//     const refresh = localStorage.getItem("refreshToken");
//     if (!refresh) {
//       console.log('No refresh token, logging out');
//       logout();
//       return false;
//     }

//     try {
//       const response = await api.post("/api/auth/jwt/refresh/", { refresh });
//       const newAccessToken = response.data.access;
//       console.log('Token refreshed, new access token:', newAccessToken);
//       localStorage.setItem(ACCESS_TOKEN, newAccessToken);
//       setAuthToken(newAccessToken);
//       api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
//       setIsAuthenticated(true);

//       const userResponse = await api.get("/api/auth/users/me/");
//       console.log('Djoser user response after refresh:', userResponse.data);
//       setUserDetails({
//         name: userResponse.data.name || "User",
//         email: userResponse.data.email || "",
//         profilePic: userResponse.data.profile_pic || "",
//       });
//       return true;
//     } catch (error) {
//       console.error("Token refresh failed:", error.message, error.response?.data);
//       logout();
//       return false;
//     }
//   }, [logout]);

//   const updateUserDetails = useCallback((newDetails) => {
//     setUserDetails((prev) => {
//       const updatedDetails = { ...prev, ...newDetails };
//       console.log("Updated userDetails in AuthContext:", updatedDetails);
//       return updatedDetails;
//     });
//   }, []);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       if (isAuthenticated) {
//         console.log('Refreshing token...');
//         refreshToken();
//       }
//     }, 4 * 60 * 1000); // Every 4 minutes
//     return () => clearInterval(interval);
//   }, [isAuthenticated, refreshToken]);

//   return (
//     <AuthContext.Provider
//       value={{
//         isAuthenticated,
//         authToken,
//         userPermissions,
//         userDetails,
//         loading,
//         login,
//         logout,
//         refreshToken,
//         updateUserDetails,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };





// // context/AuthContext.jsx
// import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
// import api from '../../api';
// import { ACCESS_TOKEN } from '../constants/index';

// const AuthContext = createContext();

// export const useAuth = () => useContext(AuthContext);

// export const AuthProvider = ({ children }) => {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [userPermissions, setUserPermissions] = useState([]);
//   const [authToken, setAuthToken] = useState(null);
//   const [userDetails, setUserDetails] = useState({ name: "", email: "", profilePic: "" });
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const validateToken = async () => {
//       const token = localStorage.getItem(ACCESS_TOKEN);
//       console.log('Validating token on mount:', token ? 'Token found' : 'No token');
//       if (!token) {
//         setIsAuthenticated(false);
//         setLoading(false);
//         return;
//       }

//       try {
//         api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
//         const response = await Promise.race([
//           api.get("/api/auth/users/me/"),
//           new Promise((_, reject) => setTimeout(() => reject(new Error("Token validation timed out")), 10000))
//         ]);
//         console.log('Djoser user response:', response.data);
//         setAuthToken(token);
//         setIsAuthenticated(true);
//         setUserDetails({
//           name: response.data.name || "User",
//           email: response.data.email || "",
//           profilePic: response.data.profile_pic || "",
//         });
//       } catch (error) {
//         console.error("Token validation failed:", error.message, error.response?.data);
//         logout();
//       } finally {
//         console.log('Setting loading to false after validation');
//         setLoading(false);
//       }
//     };
//     validateToken();
//   }, []);

//   const login = useCallback(async (accessToken, refreshToken, permissions = []) => {
//     localStorage.setItem(ACCESS_TOKEN, accessToken);
//     localStorage.setItem("refreshToken", refreshToken);
//     setAuthToken(accessToken);
//     setIsAuthenticated(true);
//     setUserPermissions(permissions);
//     setLoading(true);

//     try {
//       api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
//       const response = await api.get("/api/auth/users/me/");
//       console.log('Login Djoser user response:', response.data);
//       setUserDetails({
//         name: response.data.name || "User",
//         email: response.data.email || "",
//         profilePic: response.data.profile_pic || "",
//       });
//     } catch (error) {
//       console.error("Failed to fetch user details after login:", error.message, error.response?.data);
//       setUserDetails({ name: "User", email: "", profilePic: "" });
//     } finally {
//       console.log('Setting loading to false after login');
//       setLoading(false);
//     }
//   }, []);

//   const logout = useCallback(() => {
//     console.log('Logging out');
//     localStorage.removeItem(ACCESS_TOKEN);
//     localStorage.removeItem("refreshToken");
//     localStorage.removeItem("rememberMe");
//     delete api.defaults.headers.common['Authorization'];
//     setAuthToken(null);
//     setIsAuthenticated(false);
//     setUserPermissions([]);
//     setUserDetails({ name: "", email: "", profilePic: "" });
//     setLoading(false);
//   }, []);

//   const refreshToken = useCallback(async () => {
//     const refresh = localStorage.getItem("refreshToken");
//     if (!refresh) {
//       console.log('No refresh token, logging out');
//       logout();
//       return false;
//     }

//     try {
//       const response = await api.post("/api/auth/jwt/refresh/", { refresh });
//       const newAccessToken = response.data.access;
//       console.log('Token refreshed, new access token:', newAccessToken);
//       localStorage.setItem(ACCESS_TOKEN, newAccessToken);
//       setAuthToken(newAccessToken);
//       api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
//       setIsAuthenticated(true);

//       const userResponse = await api.get("/api/auth/users/me/");
//       console.log('Djoser user response after refresh:', userResponse.data);
//       setUserDetails({
//         name: userResponse.data.name || "User",
//         email: userResponse.data.email || "",
//         profilePic: userResponse.data.profile_pic || "",
//       });
//       return true;
//     } catch (error) {
//       console.error("Token refresh failed:", error.message, error.response?.data);
//       logout();
//       return false;
//     }
//   }, [logout]);

//   const updateUserDetails = useCallback((newDetails) => {
//     setUserDetails((prev) => {
//       const updatedDetails = { ...prev, ...newDetails };
//       console.log("Updated userDetails in AuthContext:", updatedDetails);
//       return updatedDetails;
//     });
//   }, []);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       if (isAuthenticated) {
//         console.log('Refreshing token...');
//         refreshToken();
//       }
//     }, 4 * 60 * 1000); // Every 4 minutes
//     return () => clearInterval(interval);
//   }, [isAuthenticated, refreshToken]);

//   return (
//     <AuthContext.Provider
//       value={{
//         isAuthenticated,
//         authToken,
//         userPermissions,
//         userDetails,
//         loading,
//         login,
//         logout,
//         refreshToken,
//         updateUserDetails,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };





// context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../../api';
import { ACCESS_TOKEN } from '../constants/index';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userPermissions, setUserPermissions] = useState([]);
  const [authToken, setAuthToken] = useState(null);
  const [userDetails, setUserDetails] = useState({ name: "", email: "", profilePic: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem(ACCESS_TOKEN);
      console.log('Validating token on mount:', token ? 'Token found' : 'No token');
      if (!token) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      try {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const response = await Promise.race([
          api.get("/api/auth/users/me/"),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Token validation timed out")), 10000))
        ]);
        console.log('Djoser user response:', response.data);
        setAuthToken(token);
        setIsAuthenticated(true);
        setUserDetails({
          name: response.data.name || "User",
          email: response.data.email || "",
          profilePic: response.data.profile_pic || "",
        });
      } catch (error) {
        console.error("Token validation failed:", error.message, error.response?.data);
        logout();
      } finally {
        console.log('Setting loading to false after validation');
        setLoading(false);
      }
    };
    validateToken();
  }, []);

  const login = useCallback(async (accessToken, refreshToken, permissions = []) => {
    localStorage.setItem(ACCESS_TOKEN, accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    setAuthToken(accessToken);
    setIsAuthenticated(true);
    setUserPermissions(permissions);
    setLoading(true);

    try {
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      const response = await api.get("/api/auth/users/me/");
      console.log('Login Djoser user response:', response.data);
      setUserDetails({
        name: response.data.name || "User",
        email: response.data.email || "",
        profilePic: response.data.profile_pic || "",
      });
    } catch (error) {
      console.error("Failed to fetch user details after login:", error.message, error.response?.data);
      setUserDetails({ name: "User", email: "", profilePic: "" });
    } finally {
      console.log('Setting loading to false after login');
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    console.log('Logging out');
    localStorage.removeItem(ACCESS_TOKEN);
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("rememberMe");
    delete api.defaults.headers.common['Authorization'];
    setAuthToken(null);
    setIsAuthenticated(false);
    setUserPermissions([]);
    setUserDetails({ name: "", email: "", profilePic: "" });
    setLoading(false);
  }, []);

  const refreshToken = useCallback(async () => {
    const refresh = localStorage.getItem("refreshToken");
    if (!refresh) {
      console.log('No refresh token, logging out');
      logout();
      return false;
    }

    try {
      const response = await api.post("/api/auth/jwt/refresh/", { refresh });
      const newAccessToken = response.data.access;
      console.log('Token refreshed, new access token:', newAccessToken);
      localStorage.setItem(ACCESS_TOKEN, newAccessToken);
      setAuthToken(newAccessToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
      setIsAuthenticated(true);

      const userResponse = await api.get("/api/auth/users/me/");
      console.log('Djoser user response after refresh:', userResponse.data);
      setUserDetails({
        name: userResponse.data.name || "User",
        email: userResponse.data.email || "",
        profilePic: userResponse.data.profile_pic || "",
      });
      return true;
    } catch (error) {
      console.error("Token refresh failed:", error.message, error.response?.data);
      logout();
      return false;
    }
  }, [logout]);

  const updateUserDetails = useCallback((newDetails) => {
    setUserDetails((prev) => {
      const updatedDetails = { ...prev, ...newDetails };
      console.log("Updated userDetails in AuthContext:", updatedDetails);
      return updatedDetails;
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isAuthenticated) {
        console.log('Refreshing token...');
        refreshToken();
      }
    }, 4 * 60 * 1000); // Every 4 minutes
    return () => clearInterval(interval);
  }, [isAuthenticated, refreshToken]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        authToken,
        userPermissions,
        userDetails,
        loading,
        login,
        logout,
        refreshToken,
        updateUserDetails,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};






