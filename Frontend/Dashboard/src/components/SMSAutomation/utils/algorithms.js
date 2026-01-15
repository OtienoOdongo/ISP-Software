/**
 * Optimized algorithms for SMS automation
 */

// Binary search for sorted arrays
export const binarySearch = (arr, target, key = null) => {
  let left = 0;
  let right = arr.length - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const midValue = key ? arr[mid][key] : arr[mid];
    
    if (midValue === target) {
      return mid;
    } else if (midValue < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  
  return -1;
};

// Quick select for finding kth smallest element
export const quickSelect = (arr, k, compare = (a, b) => a - b) => {
  if (arr.length === 1) return arr[0];
  
  const pivot = arr[Math.floor(Math.random() * arr.length)];
  const lows = arr.filter(x => compare(x, pivot) < 0);
  const highs = arr.filter(x => compare(x, pivot) > 0);
  const pivots = arr.filter(x => compare(x, pivot) === 0);
  
  if (k < lows.length) {
    return quickSelect(lows, k, compare);
  } else if (k < lows.length + pivots.length) {
    return pivots[0];
  } else {
    return quickSelect(highs, k - lows.length - pivots.length, compare);
  }
};

// Merge sorted arrays (for pagination)
export const mergeSortedArrays = (arrays, compare = (a, b) => a - b) => {
  if (arrays.length === 0) return [];
  if (arrays.length === 1) return arrays[0];
  
  const mid = Math.floor(arrays.length / 2);
  const left = mergeSortedArrays(arrays.slice(0, mid), compare);
  const right = mergeSortedArrays(arrays.slice(mid), compare);
  
  const result = [];
  let i = 0, j = 0;
  
  while (i < left.length && j < right.length) {
    if (compare(left[i], right[j]) <= 0) {
      result.push(left[i]);
      i++;
    } else {
      result.push(right[j]);
      j++;
    }
  }
  
  return result.concat(left.slice(i)).concat(right.slice(j));
};

// Deduplicate array with custom key
export const deduplicate = (arr, key = null) => {
  const seen = new Set();
  return arr.filter(item => {
    const identifier = key ? item[key] : JSON.stringify(item);
    if (seen.has(identifier)) {
      return false;
    }
    seen.add(identifier);
    return true;
  });
};

// Group by property
export const groupBy = (arr, key) => {
  return arr.reduce((groups, item) => {
    const groupKey = item[key];
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {});
};

// Chunk array for pagination
export const chunkArray = (arr, chunkSize) => {
  const chunks = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    chunks.push(arr.slice(i, i + chunkSize));
  }
  return chunks;
};

// Calculate message cost based on parts and gateway rates
export const calculateMessageCost = (message, gateway) => {
  if (!gateway || !gateway.cost_per_message) return 0;
  
  const parts = calculateMessageParts(message);
  return parts * parseFloat(gateway.cost_per_message);
};

// Calculate SMS message parts
export const calculateMessageParts = (message) => {
  if (!message) return 1;
  
  const charCount = message.length;
  
  // GSM encoding: 160 chars per SMS, 153 chars per part after first
  if (charCount <= 160) return 1;
  if (charCount <= 306) return 2;
  
  // 153 characters per part after first part
  return 2 + Math.ceil((charCount - 306) / 153);
};

// Estimate delivery time based on gateway performance
export const estimateDeliveryTime = (gateway) => {
  if (!gateway || !gateway.avg_delivery_time) return 'Unknown';
  
  const avgSeconds = gateway.avg_delivery_time;
  const variance = 0.3; // 30% variance
  
  // Add some randomness based on historical variance
  const estimatedSeconds = avgSeconds * (1 + (Math.random() - 0.5) * 2 * variance);
  
  if (estimatedSeconds < 60) {
    return `${Math.round(estimatedSeconds)}s`;
  } else if (estimatedSeconds < 3600) {
    return `${Math.round(estimatedSeconds / 60)}m`;
  } else {
    return `${(estimatedSeconds / 3600).toFixed(1)}h`;
  }
};

// Optimized phone number validation and formatting
export const formatPhoneNumber = (phone, countryCode = '254') => {
  if (!phone) return '';
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Handle Kenyan phone numbers specifically
  if (cleaned.startsWith('0') && cleaned.length === 10) {
    return `${countryCode}${cleaned.substring(1)}`;
  }
  
  if (cleaned.length === 9) {
    return `${countryCode}${cleaned}`;
  }
  
  if (cleaned.startsWith(countryCode) && cleaned.length === 12) {
    return cleaned;
  }
  
  // Return cleaned if no pattern matches
  return cleaned;
};

// Validate phone number
export const isValidPhoneNumber = (phone, countryCode = '254') => {
  const formatted = formatPhoneNumber(phone, countryCode);
  return /^254[17]\d{8}$/.test(formatted);
};

// Generate message preview with context replacement
export const generateMessagePreview = (template, context = {}) => {
  if (!template || !template.message_template) return '';
  
  let preview = template.message_template;
  
  // Replace variables in the format {{variable_name}}
  for (const [key, value] of Object.entries(context)) {
    const pattern = new RegExp(`{{${key}}}`, 'g');
    preview = preview.replace(pattern, value);
  }
  
  // Remove any remaining variables
  preview = preview.replace(/{{\w+}}/g, '');
  
  return preview;
};

// Sort messages by priority and creation time
export const sortMessagesByPriority = (messages) => {
  const priorityWeights = {
    urgent: 4,
    high: 3,
    normal: 2,
    low: 1
  };
  
  return [...messages].sort((a, b) => {
    const priorityDiff = priorityWeights[b.priority] - priorityWeights[a.priority];
    if (priorityDiff !== 0) return priorityDiff;
    
    // If same priority, sort by creation time (oldest first)
    return new Date(a.created_at) - new Date(b.created_at);
  });
};

// Cache invalidation strategy
export const createCacheStrategy = (ttl = 300000) => {
  const cache = new Map();
  
  return {
    get: (key) => {
      const cached = cache.get(key);
      if (!cached) return null;
      
      const now = Date.now();
      if (now - cached.timestamp > ttl) {
        cache.delete(key);
        return null;
      }
      
      return cached.value;
    },
    
    set: (key, value) => {
      cache.set(key, {
        value,
        timestamp: Date.now()
      });
    },
    
    delete: (key) => {
      cache.delete(key);
    },
    
    clear: () => {
      cache.clear();
    },
    
    size: () => cache.size
  };
};

// Debounce function for search inputs
export const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle function for scroll/resize events
export const throttle = (func, limit) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Generate unique ID
export const generateId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};