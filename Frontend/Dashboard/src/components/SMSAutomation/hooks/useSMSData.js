// import { useState, useEffect, useCallback, useRef } from 'react';
// import api from '../../../api';

// // Cache configuration
// const CACHE_CONFIG = {
//   GATEWAYS: { key: 'sms_gateways', ttl: 5 * 60 * 1000 }, // 5 minutes
//   TEMPLATES: { key: 'sms_templates', ttl: 10 * 60 * 1000 }, // 10 minutes
//   MESSAGES: { key: 'sms_messages', ttl: 1 * 60 * 1000 }, // 1 minute
//   RULES: { key: 'sms_rules', ttl: 5 * 60 * 1000 }, // 5 minutes
//   QUEUE: { key: 'sms_queue', ttl: 30 * 1000 }, // 30 seconds
//   ANALYTICS: { key: 'sms_analytics', ttl: 60 * 60 * 1000 } // 1 hour
// };

// // LRU Cache implementation
// class LRUCache {
//   constructor(maxSize = 100) {
//     this.maxSize = maxSize;
//     this.cache = new Map();
//     this.order = [];
//   }

//   get(key) {
//     if (!this.cache.has(key)) return null;
    
//     // Move to end (most recently used)
//     const index = this.order.indexOf(key);
//     this.order.splice(index, 1);
//     this.order.push(key);
    
//     return this.cache.get(key);
//   }

//   set(key, value) {
//     if (this.cache.has(key)) {
//       // Update existing
//       this.cache.set(key, value);
//       const index = this.order.indexOf(key);
//       this.order.splice(index, 1);
//       this.order.push(key);
//     } else {
//       // Add new
//       if (this.order.length >= this.maxSize) {
//         const oldest = this.order.shift();
//         this.cache.delete(oldest);
//       }
//       this.cache.set(key, value);
//       this.order.push(key);
//     }
//   }

//   delete(key) {
//     this.cache.delete(key);
//     const index = this.order.indexOf(key);
//     if (index > -1) {
//       this.order.splice(index, 1);
//     }
//   }

//   clear() {
//     this.cache.clear();
//     this.order = [];
//   }
// }

// // Initialize cache
// const cache = new LRUCache(50);

// export const useSMSData = () => {
//   const [gateways, setGateways] = useState([]);
//   const [templates, setTemplates] = useState([]);
//   const [messages, setMessages] = useState([]);
//   const [rules, setRules] = useState([]);
//   const [queue, setQueue] = useState([]);
//   const [analytics, setAnalytics] = useState({});
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
  
//   const abortControllerRef = useRef(null);

//   // Check cache validity
//   const isCacheValid = useCallback((cacheKey) => {
//     const cached = cache.get(cacheKey);
//     if (!cached) return false;
    
//     const config = CACHE_CONFIG[cacheKey];
//     const now = Date.now();
//     return (now - cached.timestamp) < config.ttl;
//   }, []);

//   // Fetch with caching
//   const fetchWithCache = useCallback(async (endpoint, cacheKey) => {
//     // Check cache first
//     if (isCacheValid(cacheKey)) {
//       const cached = cache.get(cacheKey);
//       return cached.data;
//     }

//     // Fetch from API
//     try {
//       const response = await api.get(endpoint);
//       const data = response.data;
      
//       // Update cache
//       cache.set(cacheKey, {
//         data,
//         timestamp: Date.now()
//       });
      
//       return data;
//     } catch (err) {
//       throw err;
//     }
//   }, [isCacheValid]);

//   // Fetch all data
//   const fetchAllData = useCallback(async (forceRefresh = false) => {
//     if (abortControllerRef.current) {
//       abortControllerRef.current.abort();
//     }
    
//     abortControllerRef.current = new AbortController();
    
//     setLoading(true);
//     setError(null);
    
//     try {
//       const promises = [
//         forceRefresh ? api.get('/api/sms/gateways/') : fetchWithCache('/api/sms/gateways/', 'GATEWAYS'),
//         forceRefresh ? api.get('/api/sms/templates/') : fetchWithCache('/api/sms/templates/', 'TEMPLATES'),
//         api.get('/api/sms/messages/'), // Never cache messages
//         forceRefresh ? api.get('/api/sms/rules/') : fetchWithCache('/api/sms/rules/', 'RULES'),
//         api.get('/api/sms/queue/'), // Never cache queue
//         forceRefresh ? api.get('/api/sms/analytics/') : fetchWithCache('/api/sms/analytics/', 'ANALYTICS')
//       ];

//       const [gatewaysData, templatesData, messagesData, rulesData, queueData, analyticsData] = 
//         await Promise.all(promises);

//       setGateways(Array.isArray(gatewaysData) ? gatewaysData : gatewaysData.results || []);
//       setTemplates(Array.isArray(templatesData) ? templatesData : templatesData.results || []);
//       setMessages(Array.isArray(messagesData) ? messagesData : messagesData.results || []);
//       setRules(Array.isArray(rulesData) ? rulesData : rulesData.results || []);
//       setQueue(Array.isArray(queueData) ? queueData : queueData.results || []);
//       setAnalytics(analyticsData || {});
      
//     } catch (err) {
//       if (err.name === 'AbortError') {
//         console.log('Fetch aborted');
//         return;
//       }
      
//       setError(err.response?.data?.error || 'Failed to fetch SMS data');
//       console.error('Error fetching SMS data:', err);
      
//     } finally {
//       setLoading(false);
//     }
//   }, [fetchWithCache]);

//   // Refresh specific data
//   const refreshData = useCallback(async (dataType = 'all') => {
//     if (dataType === 'all') {
//       await fetchAllData(true);
//     } else {
//       // Refresh specific data type
//       const cacheKey = dataType.toUpperCase();
//       cache.delete(cacheKey);
      
//       try {
//         const response = await api.get(`/api/sms/${dataType}/`);
//         const data = response.data;
        
//         // Update cache
//         cache.set(cacheKey, {
//           data,
//           timestamp: Date.now()
//         });
        
//         // Update state
//         const updateFunctions = {
//           gateways: setGateways,
//           templates: setTemplates,
//           messages: setMessages,
//           rules: setRules,
//           queue: setQueue,
//           analytics: setAnalytics
//         };
        
//         if (updateFunctions[dataType]) {
//           updateFunctions[dataType](Array.isArray(data) ? data : data.results || []);
//         }
        
//       } catch (err) {
//         setError(`Failed to refresh ${dataType}: ${err.message}`);
//       }
//     }
//   }, [fetchAllData]);

//   // Initial fetch
//   useEffect(() => {
//     fetchAllData();
    
//     return () => {
//       if (abortControllerRef.current) {
//         abortControllerRef.current.abort();
//       }
//     };
//   }, [fetchAllData]);

//   // Auto-refresh messages and queue every 30 seconds
//   useEffect(() => {
//     const interval = setInterval(() => {
//       refreshData('messages');
//       refreshData('queue');
//     }, 30000);
    
//     return () => clearInterval(interval);
//   }, [refreshData]);

//   return {
//     gateways,
//     templates,
//     messages,
//     rules,
//     queue,
//     analytics,
//     loading,
//     error,
//     refreshData,
//     fetchAllData
//   };
// };












import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../../../api';
import { SMS_API_ENDPOINTS } from '../constants/apiEndpoints'

// Cache implementation
class DataCache {
  constructor() {
    this.cache = new Map();
    this.listeners = new Map();
    this.maxSize = 100; // Maximum number of items in cache
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    return item.data;
  }

  set(key, data, ttl) {
    // Ensure we don't exceed cache size
    if (this.cache.size >= this.maxSize) {
      // Remove oldest item
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      data,
      expiry: Date.now() + ttl
    });
    
    // Notify listeners
    const listeners = this.listeners.get(key) || [];
    listeners.forEach(callback => {
      try {
        callback(data);
      } catch (err) {
        console.error('Error in cache listener:', err);
      }
    });
  }

  subscribe(key, callback) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, []);
    }
    const listeners = this.listeners.get(key);
    if (!listeners.includes(callback)) {
      listeners.push(callback);
    }
    
    // Return unsubscribe function
    return () => {
      const listenerList = this.listeners.get(key) || [];
      const index = listenerList.indexOf(callback);
      if (index > -1) {
        listenerList.splice(index, 1);
      }
      if (listenerList.length === 0) {
        this.listeners.delete(key);
      }
    };
  }

  invalidate(key) {
    this.cache.delete(key);
  }

  invalidatePattern(pattern) {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  clear() {
    this.cache.clear();
    this.listeners.clear();
  }

  getSize() {
    return this.cache.size;
  }
}

const cache = new DataCache();

// Cache TTL configuration
const CACHE_TTL = {
  gateways: 5 * 60 * 1000,      // 5 minutes
  templates: 10 * 60 * 1000,    // 10 minutes
  messages: 60 * 1000,           // 1 minute
  rules: 5 * 60 * 1000,         // 5 minutes
  queue: 30 * 1000,              // 30 seconds
  analytics: 60 * 60 * 1000      // 1 hour
};

export const useSMSData = () => {
  // State for each data type - initialize with empty arrays
  const [gateways, setGateways] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [messages, setMessages] = useState([]);
  const [rules, setRules] = useState([]);
  const [queue, setQueue] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    messages: { next: null, previous: null, count: 0, page: 1, pageSize: 50 },
    queue: { next: null, previous: null, count: 0, page: 1, pageSize: 50 },
    gateways: { next: null, previous: null, count: 0, page: 1, pageSize: 50 },
    templates: { next: null, previous: null, count: 0, page: 1, pageSize: 50 },
    rules: { next: null, previous: null, count: 0, page: 1, pageSize: 50 }
  });

  const abortControllerRef = useRef(null);
  const mountedRef = useRef(true);
  const retryCountRef = useRef({});
  const refreshIntervalRef = useRef(null);

  // Helper to ensure data is array
  const ensureArray = (data) => {
    if (Array.isArray(data)) return data;
    if (data && typeof data === 'object') {
      // Check if it's a paginated response
      if (data.results && Array.isArray(data.results)) {
        return data.results;
      }
      // If it's an object but not array, wrap in array if it has data
      if (data.data && Array.isArray(data.data)) {
        return data.data;
      }
    }
    return [];
  };

  // Fetch with caching and retry
  const fetchWithCache = useCallback(async (endpoint, cacheKey, ttl, options = {}) => {
    const { retry = 3, params = {}, forceRefresh = false } = options;

    // Check cache
    if (!forceRefresh) {
      const cached = cache.get(cacheKey);
      if (cached) {
        return { results: cached, fromCache: true };
      }
    }

    let lastError;
    for (let attempt = 1; attempt <= retry; attempt++) {
      try {
        const response = await api.get(endpoint, { 
          params,
          timeout: 30000 // 30 second timeout
        });
        
        const data = response.data;
        
        // Handle different response formats
        const results = data?.results || data?.data || data || [];
        const paginationData = data?.pagination || {
          next: data?.next,
          previous: data?.previous,
          count: data?.count || (Array.isArray(results) ? results.length : 0)
        };
        
        // Update cache
        cache.set(cacheKey, results, ttl);
        
        return { 
          results: ensureArray(results), 
          pagination: paginationData,
          fromCache: false 
        };
      } catch (err) {
        lastError = err;
        
        // Don't retry on 4xx errors (except 429)
        if (err.response?.status >= 400 && err.response?.status !== 429) {
          break;
        }
        
        if (attempt < retry) {
          const delay = Math.min(attempt * 1000, 5000);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError;
  }, []);

  // Fetch gateways
  const fetchGateways = useCallback(async (page = 1, forceRefresh = false) => {
    try {
      const result = await fetchWithCache(
        SMS_API_ENDPOINTS.GATEWAYS.LIST,
        'gateways',
        CACHE_TTL.gateways,
        { 
          forceRefresh,
          params: { page, page_size: pagination.gateways.pageSize }
        }
      );
      
      if (mountedRef.current) {
        setGateways(result.results);
        if (result.pagination) {
          setPagination(prev => ({
            ...prev,
            gateways: {
              ...prev.gateways,
              next: result.pagination.next,
              previous: result.pagination.previous,
              count: result.pagination.count || result.results.length,
              page
            }
          }));
        }
      }
    } catch (err) {
      console.error('Failed to fetch gateways:', err);
      if (mountedRef.current) {
        setGateways([]);
      }
    }
  }, [pagination.gateways.pageSize]);

  // Fetch templates
  const fetchTemplates = useCallback(async (page = 1, forceRefresh = false) => {
    try {
      const result = await fetchWithCache(
        SMS_API_ENDPOINTS.TEMPLATES.LIST,
        'templates',
        CACHE_TTL.templates,
        { 
          forceRefresh,
          params: { page, page_size: pagination.templates.pageSize }
        }
      );
      
      if (mountedRef.current) {
        setTemplates(result.results);
        if (result.pagination) {
          setPagination(prev => ({
            ...prev,
            templates: {
              ...prev.templates,
              next: result.pagination.next,
              previous: result.pagination.previous,
              count: result.pagination.count || result.results.length,
              page
            }
          }));
        }
      }
    } catch (err) {
      console.error('Failed to fetch templates:', err);
      if (mountedRef.current) {
        setTemplates([]);
      }
    }
  }, [pagination.templates.pageSize]);

  // Fetch messages
  const fetchMessages = useCallback(async (page = 1, filters = {}) => {
    try {
      const response = await api.get(SMS_API_ENDPOINTS.MESSAGES.LIST, {
        params: {
          page,
          page_size: pagination.messages.pageSize,
          ...filters
        }
      });
      
      if (mountedRef.current) {
        const data = response.data;
        const results = ensureArray(data?.results || data);
        setMessages(results);
        
        setPagination(prev => ({
          ...prev,
          messages: {
            ...prev.messages,
            next: data?.next || null,
            previous: data?.previous || null,
            count: data?.count || results.length,
            page
          }
        }));
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
      if (mountedRef.current) {
        setMessages([]);
      }
    }
  }, [pagination.messages.pageSize]);

  // Fetch rules
  const fetchRules = useCallback(async (page = 1, forceRefresh = false) => {
    try {
      const result = await fetchWithCache(
        SMS_API_ENDPOINTS.RULES.LIST,
        'rules',
        CACHE_TTL.rules,
        { 
          forceRefresh,
          params: { page, page_size: pagination.rules.pageSize }
        }
      );
      
      if (mountedRef.current) {
        setRules(result.results);
        if (result.pagination) {
          setPagination(prev => ({
            ...prev,
            rules: {
              ...prev.rules,
              next: result.pagination.next,
              previous: result.pagination.previous,
              count: result.pagination.count || result.results.length,
              page
            }
          }));
        }
      }
    } catch (err) {
      console.error('Failed to fetch rules:', err);
      if (mountedRef.current) {
        setRules([]);
      }
    }
  }, [pagination.rules.pageSize]);

  // Fetch queue
  const fetchQueue = useCallback(async (page = 1) => {
    try {
      const response = await api.get(SMS_API_ENDPOINTS.QUEUE.LIST, {
        params: {
          page,
          page_size: pagination.queue.pageSize
        }
      });
      
      if (mountedRef.current) {
        const data = response.data;
        const results = ensureArray(data?.results || data);
        setQueue(results);
        
        setPagination(prev => ({
          ...prev,
          queue: {
            ...prev.queue,
            next: data?.next || null,
            previous: data?.previous || null,
            count: data?.count || results.length,
            page
          }
        }));
      }
    } catch (err) {
      console.error('Failed to fetch queue:', err);
      if (mountedRef.current) {
        setQueue([]);
      }
    }
  }, [pagination.queue.pageSize]);

  // Fetch analytics
  const fetchAnalytics = useCallback(async (params = {}, forceRefresh = false) => {
    try {
      const result = await fetchWithCache(
        SMS_API_ENDPOINTS.ANALYTICS.DETAILED,
        'analytics',
        CACHE_TTL.analytics,
        { forceRefresh, params }
      );
      
      if (mountedRef.current) {
        setAnalytics(result.results || {});
      }
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      if (mountedRef.current) {
        setAnalytics({});
      }
    }
  }, []);

  // Fetch all data
  const fetchAllData = useCallback(async (forceRefresh = false) => {
    // Abort previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    
    if (!mountedRef.current) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await Promise.allSettled([
        fetchGateways(1, forceRefresh),
        fetchTemplates(1, forceRefresh),
        fetchMessages(1),
        fetchRules(1, forceRefresh),
        fetchQueue(1),
        fetchAnalytics({}, forceRefresh)
      ]);

    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('Fetch aborted');
        return;
      }
      
      if (mountedRef.current) {
        setError(err.response?.data?.error || err.message || 'Failed to fetch SMS data');
        console.error('Error fetching SMS data:', err);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [fetchGateways, fetchTemplates, fetchMessages, fetchRules, fetchQueue, fetchAnalytics]);

  // Refresh specific data type
  const refreshData = useCallback(async (type = 'all') => {
    if (type === 'all') {
      await fetchAllData(true);
    } else {
      // Clear cache for specific type
      cache.invalidate(type);
      
      const refreshFunctions = {
        gateways: () => fetchGateways(1, true),
        templates: () => fetchTemplates(1, true),
        messages: () => fetchMessages(1),
        rules: () => fetchRules(1, true),
        queue: () => fetchQueue(1),
        analytics: () => fetchAnalytics({}, true)
      };
      
      if (refreshFunctions[type]) {
        await refreshFunctions[type]();
      }
    }
  }, [fetchAllData, fetchGateways, fetchTemplates, fetchMessages, fetchRules, fetchQueue, fetchAnalytics]);

  // Load more messages (pagination)
  const loadMoreMessages = useCallback(async () => {
    if (!pagination.messages.next) return;
    
    try {
      const response = await api.get(pagination.messages.next);
      if (response.data?.results && mountedRef.current) {
        const newResults = ensureArray(response.data.results);
        setMessages(prev => [...prev, ...newResults]);
        setPagination(prev => ({
          ...prev,
          messages: {
            ...prev.messages,
            next: response.data.next,
            page: prev.messages.page + 1
          }
        }));
      }
    } catch (err) {
      console.error('Failed to load more messages:', err);
    }
  }, [pagination.messages.next]);

  // Load more queue items
  const loadMoreQueue = useCallback(async () => {
    if (!pagination.queue.next) return;
    
    try {
      const response = await api.get(pagination.queue.next);
      if (response.data?.results && mountedRef.current) {
        const newResults = ensureArray(response.data.results);
        setQueue(prev => [...prev, ...newResults]);
        setPagination(prev => ({
          ...prev,
          queue: {
            ...prev.queue,
            next: response.data.next,
            page: prev.queue.page + 1
          }
        }));
      }
    } catch (err) {
      console.error('Failed to load more queue items:', err);
    }
  }, [pagination.queue.next]);

  // Load more gateways
  const loadMoreGateways = useCallback(async () => {
    if (!pagination.gateways.next) return;
    
    try {
      const response = await api.get(pagination.gateways.next);
      if (response.data?.results && mountedRef.current) {
        const newResults = ensureArray(response.data.results);
        setGateways(prev => [...prev, ...newResults]);
        setPagination(prev => ({
          ...prev,
          gateways: {
            ...prev.gateways,
            next: response.data.next,
            page: prev.gateways.page + 1
          }
        }));
      }
    } catch (err) {
      console.error('Failed to load more gateways:', err);
    }
  }, [pagination.gateways.next]);

  // Load more templates
  const loadMoreTemplates = useCallback(async () => {
    if (!pagination.templates.next) return;
    
    try {
      const response = await api.get(pagination.templates.next);
      if (response.data?.results && mountedRef.current) {
        const newResults = ensureArray(response.data.results);
        setTemplates(prev => [...prev, ...newResults]);
        setPagination(prev => ({
          ...prev,
          templates: {
            ...prev.templates,
            next: response.data.next,
            page: prev.templates.page + 1
          }
        }));
      }
    } catch (err) {
      console.error('Failed to load more templates:', err);
    }
  }, [pagination.templates.next]);

  // Load more rules
  const loadMoreRules = useCallback(async () => {
    if (!pagination.rules.next) return;
    
    try {
      const response = await api.get(pagination.rules.next);
      if (response.data?.results && mountedRef.current) {
        const newResults = ensureArray(response.data.results);
        setRules(prev => [...prev, ...newResults]);
        setPagination(prev => ({
          ...prev,
          rules: {
            ...prev.rules,
            next: response.data.next,
            page: prev.rules.page + 1
          }
        }));
      }
    } catch (err) {
      console.error('Failed to load more rules:', err);
    }
  }, [pagination.rules.next]);

  // Subscribe to cache updates
  useEffect(() => {
    const unsubscribes = [
      cache.subscribe('gateways', setGateways),
      cache.subscribe('templates', setTemplates),
      cache.subscribe('rules', setRules)
    ];
    
    return () => {
      unsubscribes.forEach(unsub => {
        if (unsub) unsub();
      });
    };
  }, []);

  // Initial fetch
  useEffect(() => {
    mountedRef.current = true;
    fetchAllData();
    
    return () => {
      mountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [fetchAllData]);

  // Auto-refresh messages and queue
  useEffect(() => {
    refreshIntervalRef.current = setInterval(() => {
      if (mountedRef.current) {
        refreshData('messages');
        refreshData('queue');
      }
    }, 30000);
    
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [refreshData]);

  return {
    gateways,
    templates,
    messages,
    rules,
    queue,
    analytics,
    loading,
    error,
    refreshData,
    fetchAllData,
    fetchGateways,
    fetchTemplates,
    fetchMessages,
    fetchRules,
    fetchQueue,
    fetchAnalytics,
    loadMoreMessages,
    loadMoreQueue,
    loadMoreGateways,
    loadMoreTemplates,
    loadMoreRules,
    pagination
  };
};