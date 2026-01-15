import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../../../api';

// Cache configuration
const CACHE_CONFIG = {
  GATEWAYS: { key: 'sms_gateways', ttl: 5 * 60 * 1000 }, // 5 minutes
  TEMPLATES: { key: 'sms_templates', ttl: 10 * 60 * 1000 }, // 10 minutes
  MESSAGES: { key: 'sms_messages', ttl: 1 * 60 * 1000 }, // 1 minute
  RULES: { key: 'sms_rules', ttl: 5 * 60 * 1000 }, // 5 minutes
  QUEUE: { key: 'sms_queue', ttl: 30 * 1000 }, // 30 seconds
  ANALYTICS: { key: 'sms_analytics', ttl: 60 * 60 * 1000 } // 1 hour
};

// LRU Cache implementation
class LRUCache {
  constructor(maxSize = 100) {
    this.maxSize = maxSize;
    this.cache = new Map();
    this.order = [];
  }

  get(key) {
    if (!this.cache.has(key)) return null;
    
    // Move to end (most recently used)
    const index = this.order.indexOf(key);
    this.order.splice(index, 1);
    this.order.push(key);
    
    return this.cache.get(key);
  }

  set(key, value) {
    if (this.cache.has(key)) {
      // Update existing
      this.cache.set(key, value);
      const index = this.order.indexOf(key);
      this.order.splice(index, 1);
      this.order.push(key);
    } else {
      // Add new
      if (this.order.length >= this.maxSize) {
        const oldest = this.order.shift();
        this.cache.delete(oldest);
      }
      this.cache.set(key, value);
      this.order.push(key);
    }
  }

  delete(key) {
    this.cache.delete(key);
    const index = this.order.indexOf(key);
    if (index > -1) {
      this.order.splice(index, 1);
    }
  }

  clear() {
    this.cache.clear();
    this.order = [];
  }
}

// Initialize cache
const cache = new LRUCache(50);

export const useSMSData = () => {
  const [gateways, setGateways] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [messages, setMessages] = useState([]);
  const [rules, setRules] = useState([]);
  const [queue, setQueue] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const abortControllerRef = useRef(null);

  // Check cache validity
  const isCacheValid = useCallback((cacheKey) => {
    const cached = cache.get(cacheKey);
    if (!cached) return false;
    
    const config = CACHE_CONFIG[cacheKey];
    const now = Date.now();
    return (now - cached.timestamp) < config.ttl;
  }, []);

  // Fetch with caching
  const fetchWithCache = useCallback(async (endpoint, cacheKey) => {
    // Check cache first
    if (isCacheValid(cacheKey)) {
      const cached = cache.get(cacheKey);
      return cached.data;
    }

    // Fetch from API
    try {
      const response = await api.get(endpoint);
      const data = response.data;
      
      // Update cache
      cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
      
      return data;
    } catch (err) {
      throw err;
    }
  }, [isCacheValid]);

  // Fetch all data
  const fetchAllData = useCallback(async (forceRefresh = false) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    
    setLoading(true);
    setError(null);
    
    try {
      const promises = [
        forceRefresh ? api.get('/api/sms/gateways/') : fetchWithCache('/api/sms/gateways/', 'GATEWAYS'),
        forceRefresh ? api.get('/api/sms/templates/') : fetchWithCache('/api/sms/templates/', 'TEMPLATES'),
        api.get('/api/sms/messages/'), // Never cache messages
        forceRefresh ? api.get('/api/sms/rules/') : fetchWithCache('/api/sms/rules/', 'RULES'),
        api.get('/api/sms/queue/'), // Never cache queue
        forceRefresh ? api.get('/api/sms/analytics/') : fetchWithCache('/api/sms/analytics/', 'ANALYTICS')
      ];

      const [gatewaysData, templatesData, messagesData, rulesData, queueData, analyticsData] = 
        await Promise.all(promises);

      setGateways(Array.isArray(gatewaysData) ? gatewaysData : gatewaysData.results || []);
      setTemplates(Array.isArray(templatesData) ? templatesData : templatesData.results || []);
      setMessages(Array.isArray(messagesData) ? messagesData : messagesData.results || []);
      setRules(Array.isArray(rulesData) ? rulesData : rulesData.results || []);
      setQueue(Array.isArray(queueData) ? queueData : queueData.results || []);
      setAnalytics(analyticsData || {});
      
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('Fetch aborted');
        return;
      }
      
      setError(err.response?.data?.error || 'Failed to fetch SMS data');
      console.error('Error fetching SMS data:', err);
      
    } finally {
      setLoading(false);
    }
  }, [fetchWithCache]);

  // Refresh specific data
  const refreshData = useCallback(async (dataType = 'all') => {
    if (dataType === 'all') {
      await fetchAllData(true);
    } else {
      // Refresh specific data type
      const cacheKey = dataType.toUpperCase();
      cache.delete(cacheKey);
      
      try {
        const response = await api.get(`/api/sms/${dataType}/`);
        const data = response.data;
        
        // Update cache
        cache.set(cacheKey, {
          data,
          timestamp: Date.now()
        });
        
        // Update state
        const updateFunctions = {
          gateways: setGateways,
          templates: setTemplates,
          messages: setMessages,
          rules: setRules,
          queue: setQueue,
          analytics: setAnalytics
        };
        
        if (updateFunctions[dataType]) {
          updateFunctions[dataType](Array.isArray(data) ? data : data.results || []);
        }
        
      } catch (err) {
        setError(`Failed to refresh ${dataType}: ${err.message}`);
      }
    }
  }, [fetchAllData]);

  // Initial fetch
  useEffect(() => {
    fetchAllData();
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchAllData]);

  // Auto-refresh messages and queue every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshData('messages');
      refreshData('queue');
    }, 30000);
    
    return () => clearInterval(interval);
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
    fetchAllData
  };
};