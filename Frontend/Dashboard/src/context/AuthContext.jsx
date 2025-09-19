



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
//     userDetails: { name: '', email: '', profilePic: '' },
//     loading: true,
//   });

//   const updateAuthState = useCallback((updates) => {
//     setAuthState((prev) => ({ ...prev, ...updates }));
//   }, []);

//   const fetchUserDetails = useCallback(async (token) => {
//     try {
//       api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
//       const response = await api.get('/api/auth/users/me/');
//       return {
//         name: response.data.name || 'User',
//         email: response.data.email || '',
//         profilePic: response.data.profile_pic || '',
//       };
//     } catch (error) {
//       console.error('Failed to fetch user details:', error);
//       throw error;
//     }
//   }, []);

//   const validateToken = useCallback(async () => {
//     const token = localStorage.getItem(ACCESS_TOKEN);
//     console.log('Validating token on mount:', token ? 'Token found' : 'No token');

//     if (!token) {
//       updateAuthState({ isAuthenticated: false, loading: false });
//       return false;
//     }

//     try {
//       await Promise.race([
//         api.get('/api/auth/users/me/'),
//         new Promise((_, reject) =>
//           setTimeout(() => reject(new Error('Token validation timed out')), 10000)
//         ),
//       ]);

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
//       logout();
//       return false;
//     }
//   }, [updateAuthState, fetchUserDetails]);

//   useEffect(() => {
//     validateToken();
//   }, [validateToken]);

//   const login = useCallback(
//     async (accessToken, refreshToken, permissions = []) => {
//       localStorage.setItem(ACCESS_TOKEN, accessToken);
//       localStorage.setItem(REFRESH_TOKEN, refreshToken);

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
//     [fetchUserDetails, updateAuthState]
//   );

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
//       userDetails: { name: '', email: '', profilePic: '' },
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









// context/AuthContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import api from '../api';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../constants/index';

const AuthContext = createContext();

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
      user_type: '', 
      is_2fa_enabled: false 
    },
    loading: true,
  });

  const updateAuthState = useCallback((updates) => {
    setAuthState((prev) => ({ ...prev, ...updates }));
  }, []);

  const fetchUserDetails = useCallback(async (token) => {
    try {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const response = await api.get('/api/auth/users/me/');
      
      // Ensure all required fields have default values
      return {
        name: response.data.name || '',
        email: response.data.email || '',
        profile_pic: response.data.profile_pic || '',
        user_type: response.data.user_type || '',
        is_2fa_enabled: response.data.is_2fa_enabled || false,
      };
    } catch (error) {
      console.error('Failed to fetch user details:', error);
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    console.log('Logging out');
    localStorage.removeItem(ACCESS_TOKEN);
    localStorage.removeItem(REFRESH_TOKEN);
    localStorage.removeItem('rememberMe');
    delete api.defaults.headers.common['Authorization'];

    updateAuthState({
      isAuthenticated: false,
      authToken: null,
      userPermissions: [],
      userDetails: { 
        name: '', 
        email: '', 
        profile_pic: '', 
        user_type: '', 
        is_2fa_enabled: false 
      },
      loading: false,
    });
  }, [updateAuthState]);

  const refreshToken = useCallback(async () => {
    const refresh = localStorage.getItem(REFRESH_TOKEN);
    if (!refresh) {
      console.log('No refresh token, logging out');
      logout();
      return false;
    }

    try {
      const response = await api.post('/api/auth/jwt/refresh/', { refresh });
      const newAccessToken = response.data.access;
      localStorage.setItem(ACCESS_TOKEN, newAccessToken);

      const userDetails = await fetchUserDetails(newAccessToken);
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
  }, [fetchUserDetails, logout, updateAuthState]);

  const validateToken = useCallback(async () => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    console.log('Validating token on mount:', token ? 'Token found' : 'No token');

    if (!token) {
      updateAuthState({ isAuthenticated: false, loading: false });
      return false;
    }

    try {
      // Test if token is valid by making a simple request
      await api.get('/api/auth/users/me/');
      
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
      
      // Try to refresh token if validation fails
      try {
        const refreshTokenValue = localStorage.getItem(REFRESH_TOKEN);
        if (refreshTokenValue) {
          const refreshResponse = await api.post('/api/auth/jwt/refresh/', {
            refresh: refreshTokenValue
          });
          
          const newAccessToken = refreshResponse.data.access;
          localStorage.setItem(ACCESS_TOKEN, newAccessToken);
          
          const userDetails = await fetchUserDetails(newAccessToken);
          updateAuthState({
            isAuthenticated: true,
            authToken: newAccessToken,
            userDetails,
            loading: false,
          });
          return true;
        }
      } catch (refreshError) {
        console.error('Token refresh also failed:', refreshError);
      }
      
      // If all fails, logout
      logout();
      return false;
    }
  }, [updateAuthState, fetchUserDetails, logout]);

  useEffect(() => {
    validateToken();
  }, [validateToken]);

  const login = useCallback(
    async (accessToken, refreshTokenValue, permissions = []) => {
      localStorage.setItem(ACCESS_TOKEN, accessToken);
      localStorage.setItem(REFRESH_TOKEN, refreshTokenValue);

      try {
        const userDetails = await fetchUserDetails(accessToken);
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

  const updateUserDetails = useCallback(
    (newDetails) => {
      updateAuthState((prev) => ({
        userDetails: { ...prev.userDetails, ...newDetails },
      }));
    },
    [updateAuthState]
  );

  useEffect(() => {
    if (!authState.isAuthenticated) return;

    const interval = setInterval(() => {
      console.log('Refreshing token...');
      refreshToken().catch(console.error);
    }, 4 * 60 * 1000); // Every 4 minutes

    return () => clearInterval(interval);
  }, [authState.isAuthenticated, refreshToken]);

  const contextValue = useMemo(
    () => ({
      isAuthenticated: authState.isAuthenticated,
      authToken: authState.authToken,
      userPermissions: authState.userPermissions,
      userDetails: authState.userDetails,
      loading: authState.loading,
      login,
      logout,
      refreshToken,
      updateUserDetails,
    }),
    [authState, login, logout, refreshToken, updateUserDetails]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};