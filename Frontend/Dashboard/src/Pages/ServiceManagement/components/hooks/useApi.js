

// // src/hooks/useApi.js
// import { useState, useCallback, useRef } from 'react';
// import api from '../../../../api'

// const CACHE = new Map();
// const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// export const useApi = (endpoint, options = {}) => {
//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [totalCount, setTotalCount] = useState(0);
//   const abortControllerRef = useRef(null);

//   const { 
//     cacheKey = endpoint,
//     cache = true,
//     cacheTTL = CACHE_TTL,
//     onSuccess,
//     onError,
//   } = options;

//   const extractData = useCallback((response) => {
//     // Handle different response structures
//     if (response.data?.results) {
//       // Paginated response
//       return {
//         data: response.data.results,
//         total: response.data.count || response.data.results.length,
//       };
//     } else if (Array.isArray(response.data)) {
//       // Direct array
//       return {
//         data: response.data,
//         total: response.data.length,
//       };
//     } else if (response.data?.data) {
//       // Wrapped in data property
//       if (Array.isArray(response.data.data)) {
//         return {
//           data: response.data.data,
//           total: response.data.data.length,
//         };
//       }
//       return {
//         data: response.data.data,
//         total: 1,
//       };
//     } else if (response.data?.subscriptions) {
//       // Subscriptions wrapped
//       return {
//         data: response.data.subscriptions,
//         total: response.data.pagination?.total || response.data.subscriptions.length,
//       };
//     } else if (response.data?.operations) {
//       // Operations wrapped
//       return {
//         data: response.data.operations,
//         total: response.data.pagination?.total || response.data.operations.length,
//       };
//     } else if (response.data?.logs) {
//       // Logs wrapped
//       return {
//         data: response.data.logs,
//         total: response.data.pagination?.total || response.data.logs.length,
//       };
//     } else if (response.data && typeof response.data === 'object') {
//       // Single object
//       return {
//         data: [response.data],
//         total: 1,
//       };
//     }
    
//     // Fallback
//     return {
//       data: response.data || [],
//       total: Array.isArray(response.data) ? response.data.length : 0,
//     };
//   }, []);

//   const fetchData = useCallback(async (params = {}, method = 'GET', body = null) => {
//     // Cancel previous request
//     if (abortControllerRef.current) {
//       abortControllerRef.current.abort();
//     }

//     abortControllerRef.current = new AbortController();

//     // Check cache for GET requests
//     const cacheKeyString = `${cacheKey}:${JSON.stringify(params)}`;
//     if (method === 'GET' && cache && CACHE.has(cacheKeyString)) {
//       const cached = CACHE.get(cacheKeyString);
//       if (Date.now() - cached.timestamp < cacheTTL) {
//         setData(cached.data);
//         setTotalCount(cached.totalCount || 0);
//         return cached.data;
//       }
//       CACHE.delete(cacheKeyString);
//     }

//     setLoading(true);
//     setError(null);

//     try {
//       const response = await api({
//         method,
//         url: endpoint,
//         params,
//         data: body,
//         signal: abortControllerRef.current.signal,
//       });

//       const { data: extractedData, total } = extractData(response);

//       // Cache GET requests
//       if (method === 'GET' && cache) {
//         CACHE.set(cacheKeyString, {
//           data: extractedData,
//           totalCount: total,
//           timestamp: Date.now(),
//         });
//       }

//       setData(extractedData);
//       setTotalCount(total);
//       if (onSuccess) onSuccess(extractedData);
      
//       return extractedData;
//     } catch (err) {
//       if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
//         return;
//       }
      
//       const errorMessage = err.response?.data?.error || err.message || 'An error occurred';
//       setError(errorMessage);
//       if (onError) onError(errorMessage);
//       throw err;
//     } finally {
//       setLoading(false);
//     }
//   }, [endpoint, cache, cacheKey, cacheTTL, extractData, onSuccess, onError]);

//   const invalidateCache = useCallback(() => {
//     const keys = Array.from(CACHE.keys()).filter(k => k.startsWith(cacheKey));
//     keys.forEach(k => CACHE.delete(k));
//   }, [cacheKey]);

//   const clearCache = useCallback(() => {
//     CACHE.clear();
//   }, []);

//   return {
//     data,
//     loading,
//     error,
//     totalCount,
//     fetchData,
//     invalidateCache,
//     clearCache,
//   };
// };







// src/hooks/useApi.js
import { useState, useCallback, useRef } from 'react';
import api from '../../../../api'

const CACHE = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const useApi = (endpoint, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const abortControllerRef = useRef(null);

  const { 
    cacheKey = endpoint,
    cache = true,
    cacheTTL = CACHE_TTL,
    onSuccess,
    onError,
  } = options;

  const extractData = useCallback((response) => {
    // Handle different response structures
    if (response?.data?.results) {
      // Paginated response
      return {
        data: response.data.results,
        total: response.data.count || response.data.results.length,
      };
    } else if (Array.isArray(response?.data)) {
      // Direct array
      return {
        data: response.data,
        total: response.data.length,
      };
    } else if (response?.data?.data) {
      // Wrapped in data property
      if (Array.isArray(response.data.data)) {
        return {
          data: response.data.data,
          total: response.data.data.length,
        };
      }
      return {
        data: response.data.data,
        total: 1,
      };
    } else if (response?.data?.subscriptions) {
      // Subscriptions wrapped
      return {
        data: response.data.subscriptions,
        total: response.data.pagination?.total || response.data.subscriptions.length,
      };
    } else if (response?.data?.operations) {
      // Operations wrapped
      return {
        data: response.data.operations,
        total: response.data.pagination?.total || response.data.operations.length,
      };
    } else if (response?.data?.logs) {
      // Logs wrapped
      return {
        data: response.data.logs,
        total: response.data.pagination?.total || response.data.logs.length,
      };
    } else if (response?.data && typeof response.data === 'object') {
      // Single object
      return {
        data: [response.data],
        total: 1,
      };
    }
    
    // Fallback
    return {
      data: response?.data || [],
      total: Array.isArray(response?.data) ? response.data.length : 0,
    };
  }, []);

  const fetchData = useCallback(async (params = {}, method = 'GET', body = null) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    // Determine the actual URL - handle when params is actually a URL string
    let url = endpoint;
    let requestParams = params;
    
    // If params is a string (like when called directly with a URL), treat it as the URL
    if (typeof params === 'string') {
      url = params;
      requestParams = {};
    }

    // Check cache for GET requests
    const cacheKeyString = `${url}:${JSON.stringify(requestParams)}`;
    if (method === 'GET' && cache && CACHE.has(cacheKeyString)) {
      const cached = CACHE.get(cacheKeyString);
      if (Date.now() - cached.timestamp < cacheTTL) {
        setData(cached.data);
        setTotalCount(cached.totalCount || 0);
        return cached.data;
      }
      CACHE.delete(cacheKeyString);
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api({
        method,
        url,
        params: requestParams,
        data: body,
        signal: abortControllerRef.current.signal,
      });

      const { data: extractedData, total } = extractData(response);

      // Cache GET requests
      if (method === 'GET' && cache) {
        CACHE.set(cacheKeyString, {
          data: extractedData,
          totalCount: total,
          timestamp: Date.now(),
        });
      }

      setData(extractedData);
      setTotalCount(total);
      if (onSuccess) onSuccess(extractedData);
      
      return extractedData;
    } catch (err) {
      if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
        return;
      }
      
      const errorMessage = err.response?.data?.error || err.message || 'An error occurred';
      setError(errorMessage);
      if (onError) onError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [endpoint, cache, cacheKey, cacheTTL, extractData, onSuccess, onError]);

  const invalidateCache = useCallback(() => {
    const keys = Array.from(CACHE.keys()).filter(k => k.startsWith(cacheKey));
    keys.forEach(k => CACHE.delete(k));
  }, [cacheKey]);

  const clearCache = useCallback(() => {
    CACHE.clear();
  }, []);

  return {
    data,
    loading,
    error,
    totalCount,
    fetchData,
    invalidateCache,
    clearCache,
  };
};