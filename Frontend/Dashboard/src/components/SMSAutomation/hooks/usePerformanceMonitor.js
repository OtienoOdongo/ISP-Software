/**
 * Performance Monitoring Hook
 * Tracks frontend performance metrics including FPS, memory usage, API response times, and render performance
 */

import { useState, useEffect, useRef, useCallback } from 'react';

// Performance measurement types
const METRIC_TYPES = {
  FPS: 'fps',               // Frames per second
  MEMORY: 'memory',         // Memory usage
  API_RESPONSE: 'apiResponse', // API response times
  RENDER: 'render',         // Component render times
  NETWORK: 'network',       // Network requests
  USER_INTERACTION: 'userInteraction' // User interaction timings
};

// Default configuration
const DEFAULT_CONFIG = {
  enabled: true,
  collectMetrics: ['fps', 'memory', 'apiResponse'],
  sampleInterval: 1000, // 1 second
  maxSamples: 60, // Keep 60 samples (1 minute at 1 sample/sec)
  reportThresholds: {
    fps: 30, // Warn if FPS drops below 30
    memory: 80, // Warn if memory usage > 80%
    apiResponse: 3000, // Warn if API response > 3s
    render: 100 // Warn if render > 100ms
  },
  autoReport: false,
  reportUrl: '/api/performance/metrics',
  onThresholdExceeded: null
};

class PerformanceCollector {
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.metrics = new Map();
    this.samples = new Map();
    this.frameCount = 0;
    this.lastFrameTime = performance.now();
    this.lastMemoryCheck = 0;
    this.memoryCheckInterval = 10000; // Check memory every 10 seconds
    this.interactionListeners = new Map();
    this.apiInterceptors = new Set();
    this.isCollecting = false;
    
    // Initialize metrics storage
    Object.values(METRIC_TYPES).forEach(type => {
      this.samples.set(type, []);
    });
  }

  start() {
    if (this.isCollecting || !this.config.enabled) return;
    
    this.isCollecting = true;
    this.setupFPSMonitor();
    this.setupMemoryMonitor();
    this.setupAPIMonitor();
    this.setupRenderMonitor();
    this.setupNetworkMonitor();
    this.setupInteractionMonitor();
    
    console.log('Performance monitoring started');
  }

  stop() {
    this.isCollecting = false;
    this.cleanupFPSMonitor();
    this.cleanupAPIMonitor();
    this.cleanupInteractionMonitor();
    console.log('Performance monitoring stopped');
  }

  setupFPSMonitor() {
    if (!this.config.collectMetrics.includes(METRIC_TYPES.FPS)) return;
    
    const measureFPS = () => {
      if (!this.isCollecting) return;
      
      this.frameCount++;
      const currentTime = performance.now();
      const elapsed = currentTime - this.lastFrameTime;
      
      if (elapsed >= 1000) { // Calculate FPS every second
        const fps = Math.round((this.frameCount * 1000) / elapsed);
        this.recordMetric(METRIC_TYPES.FPS, fps, currentTime);
        this.frameCount = 0;
        this.lastFrameTime = currentTime;
        
        // Check threshold
        if (fps < this.config.reportThresholds.fps) {
          this.handleThresholdExceeded(METRIC_TYPES.FPS, fps);
        }
      }
      
      requestAnimationFrame(measureFPS);
    };
    
    this.fpsAnimationId = requestAnimationFrame(measureFPS);
  }

  cleanupFPSMonitor() {
    if (this.fpsAnimationId) {
      cancelAnimationFrame(this.fpsAnimationId);
    }
  }

  setupMemoryMonitor() {
    if (!this.config.collectMetrics.includes(METRIC_TYPES.MEMORY)) return;
    
    // Memory monitoring only works in Chrome with flags
    if (!performance.memory) {
      console.warn('Memory API not available. Performance.memory only works in Chrome with appropriate flags.');
      return;
    }
    
    this.memoryInterval = setInterval(() => {
      if (!this.isCollecting) return;
      
      const now = performance.now();
      if (now - this.lastMemoryCheck >= this.memoryCheckInterval) {
        const memory = performance.memory;
        const usedMB = Math.round(memory.usedJSHeapSize / 1048576);
        const totalMB = Math.round(memory.totalJSHeapSize / 1048576);
        const usagePercentage = Math.round((usedMB / totalMB) * 100);
        
        this.recordMetric(METRIC_TYPES.MEMORY, usagePercentage, now);
        this.metrics.set('memory_details', { usedMB, totalMB, usagePercentage });
        
        // Check threshold
        if (usagePercentage > this.config.reportThresholds.memory) {
          this.handleThresholdExceeded(METRIC_TYPES.MEMORY, usagePercentage);
        }
        
        this.lastMemoryCheck = now;
      }
    }, 1000);
  }

  setupAPIMonitor() {
    if (!this.config.collectMetrics.includes(METRIC_TYPES.API_RESPONSE)) return;
    
    // Store original fetch
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const startTime = performance.now();
      const requestId = `api_${Date.now()}_${Math.random()}`;
      
      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        // Record API response time
        this.recordMetric(METRIC_TYPES.API_RESPONSE, duration, endTime, {
          url: args[0],
          method: 'GET',
          status: response.status,
          requestId
        });
        
        // Check threshold
        if (duration > this.config.reportThresholds.apiResponse) {
          this.handleThresholdExceeded(METRIC_TYPES.API_RESPONSE, duration, {
            url: args[0],
            duration
          });
        }
        
        return response;
      } catch (error) {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        this.recordMetric(METRIC_TYPES.API_RESPONSE, duration, endTime, {
          url: args[0],
          method: 'GET',
          status: 'error',
          error: error.message,
          requestId
        });
        
        throw error;
      }
    };
    
    // Store reference for cleanup
    this.originalFetch = originalFetch;
  }

  cleanupAPIMonitor() {
    if (this.originalFetch) {
      window.fetch = this.originalFetch;
    }
    if (this.memoryInterval) {
      clearInterval(this.memoryInterval);
    }
  }

  setupRenderMonitor() {
    if (!this.config.collectMetrics.includes(METRIC_TYPES.RENDER)) return;
    
    // We'll use a React-specific approach via the hook
    this.renderMetrics = new Map();
  }

  setupNetworkMonitor() {
    if (!this.config.collectMetrics.includes(METRIC_TYPES.NETWORK)) return;
    
    // Use Performance API for network timing
    const processResources = () => {
      if (!this.isCollecting) return;
      
      const resources = performance.getEntriesByType('resource');
      resources.forEach(resource => {
        if (resource.initiatorType === 'xmlhttprequest' || resource.initiatorType === 'fetch') {
          const duration = resource.duration;
          this.recordMetric(METRIC_TYPES.NETWORK, duration, performance.now(), {
            name: resource.name,
            initiatorType: resource.initiatorType,
            transferSize: resource.transferSize,
            decodedBodySize: resource.decodedBodySize
          });
        }
      });
      
      // Clear processed resources to avoid duplicates
      performance.clearResourceTimings();
    };
    
    this.networkObserver = new PerformanceObserver((list) => {
      processResources();
    });
    
    this.networkObserver.observe({ entryTypes: ['resource'] });
  }

  setupInteractionMonitor() {
    if (!this.config.collectMetrics.includes(METRIC_TYPES.USER_INTERACTION)) return;
    
    const interactionTypes = ['click', 'keydown', 'scroll', 'input'];
    
    interactionTypes.forEach(type => {
      const handler = (event) => {
        if (!this.isCollecting) return;
        
        const now = performance.now();
        this.recordMetric(METRIC_TYPES.USER_INTERACTION, 0, now, {
          type,
          target: event.target?.tagName || 'unknown',
          x: event.clientX,
          y: event.clientY
        });
      };
      
      window.addEventListener(type, handler, { passive: true });
      this.interactionListeners.set(type, handler);
    });
  }

  cleanupInteractionMonitor() {
    this.interactionListeners.forEach((handler, type) => {
      window.removeEventListener(type, handler);
    });
    this.interactionListeners.clear();
    
    if (this.networkObserver) {
      this.networkObserver.disconnect();
    }
  }

  recordMetric(type, value, timestamp, metadata = {}) {
    const metric = {
      type,
      value,
      timestamp,
      metadata
    };
    
    // Store in metrics
    this.metrics.set(`${type}_latest`, value);
    
    // Store in samples
    const samples = this.samples.get(type) || [];
    samples.push(metric);
    
    // Keep only maxSamples
    if (samples.length > this.config.maxSamples) {
      samples.shift();
    }
    
    this.samples.set(type, samples);
    
    // Auto-report if enabled
    if (this.config.autoReport && this.config.reportUrl) {
      this.reportMetric(metric);
    }
  }

  recordRenderTime(componentName, renderTime) {
    if (!this.config.collectMetrics.includes(METRIC_TYPES.RENDER)) return;
    
    this.recordMetric(METRIC_TYPES.RENDER, renderTime, performance.now(), {
      component: componentName
    });
    
    // Check threshold
    if (renderTime > this.config.reportThresholds.render) {
      this.handleThresholdExceeded(METRIC_TYPES.RENDER, renderTime, {
        component: componentName
      });
    }
  }

  handleThresholdExceeded(metricType, value, context = {}) {
    const threshold = this.config.reportThresholds[metricType];
    const warning = {
      type: 'threshold_exceeded',
      metric: metricType,
      value,
      threshold,
      timestamp: Date.now(),
      context
    };
    
    // Call custom handler if provided
    if (typeof this.config.onThresholdExceeded === 'function') {
      this.config.onThresholdExceeded(warning);
    }
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Performance threshold exceeded: ${metricType} = ${value} (threshold: ${threshold})`, context);
    }
    
    // Store warning
    const warnings = this.samples.get('warnings') || [];
    warnings.push(warning);
    if (warnings.length > 20) warnings.shift(); // Keep last 20 warnings
    this.samples.set('warnings', warnings);
  }

  async reportMetric(metric) {
    try {
      const response = await fetch(this.config.reportUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...metric,
          userAgent: navigator.userAgent,
          url: window.location.href,
          timestamp: new Date().toISOString()
        })
      });
      
      if (!response.ok) {
        console.error('Failed to report performance metric:', response.status);
      }
    } catch (error) {
      console.error('Error reporting performance metric:', error);
    }
  }

  getMetrics() {
    const result = {};
    
    // Get latest values
    for (const [key, value] of this.metrics.entries()) {
      result[key] = value;
    }
    
    // Get averages
    for (const [type, samples] of this.samples.entries()) {
      if (samples.length > 0) {
        const values = samples.map(s => s.value);
        const sum = values.reduce((a, b) => a + b, 0);
        result[`${type}_avg`] = sum / values.length;
        result[`${type}_min`] = Math.min(...values);
        result[`${type}_max`] = Math.max(...values);
        result[`${type}_samples`] = samples.length;
      }
    }
    
    return result;
  }

  getSamples(type, count = 10) {
    const samples = this.samples.get(type) || [];
    return samples.slice(-count);
  }

  getWarnings() {
    return this.samples.get('warnings') || [];
  }

  clear() {
    this.samples.clear();
    this.metrics.clear();
  }

  generateReport() {
    const metrics = this.getMetrics();
    const warnings = this.getWarnings();
    
    return {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      metrics,
      warnings,
      summary: {
        fps: metrics.fps_latest,
        memory: metrics.memory_latest,
        apiResponseAvg: metrics.apiResponse_avg,
        renderAvg: metrics.render_avg
      }
    };
  }
}

const usePerformanceMonitor = (config = {}) => {
  const collectorRef = useRef(null);
  const [metrics, setMetrics] = useState({});
  const [warnings, setWarnings] = useState([]);
  const [isActive, setIsActive] = useState(config.enabled !== false);
  const renderCountRef = useRef(0);
  const lastRenderTimeRef = useRef(0);

  // Initialize collector
  useEffect(() => {
    if (!collectorRef.current) {
      collectorRef.current = new PerformanceCollector(config);
    }
    
    const collector = collectorRef.current;
    
    if (isActive) {
      collector.start();
    } else {
      collector.stop();
    }
    
    return () => {
      if (collector) {
        collector.stop();
      }
    };
  }, [isActive, config]);

  // Update metrics periodically
  useEffect(() => {
    if (!isActive) return;
    
    const interval = setInterval(() => {
      if (collectorRef.current) {
        const newMetrics = collectorRef.current.getMetrics();
        const newWarnings = collectorRef.current.getWarnings();
        
        setMetrics(prev => ({
          ...prev,
          ...newMetrics,
          timestamp: Date.now()
        }));
        
        if (newWarnings.length !== warnings.length) {
          setWarnings(newWarnings);
        }
      }
    }, config.sampleInterval || 1000);
    
    return () => clearInterval(interval);
  }, [isActive, config.sampleInterval, warnings.length]);

  // Record render performance
  const recordRender = useCallback((componentName, renderTime) => {
    if (collectorRef.current && isActive) {
      collectorRef.current.recordRenderTime(componentName, renderTime);
    }
  }, [isActive]);

  // Auto-record render times for the component using this hook
  useEffect(() => {
    if (!isActive || !config.collectMetrics?.includes(METRIC_TYPES.RENDER)) return;
    
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      renderCountRef.current++;
      
      recordRender('usePerformanceMonitor', renderTime);
    };
  }, [isActive, recordRender, config.collectMetrics]);

  // Performance measurement utilities
  const measure = useCallback((name, fn) => {
    if (!isActive) return fn();
    
    const startTime = performance.now();
    const result = fn();
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    if (collectorRef.current) {
      collectorRef.current.recordMetric('custom_measurement', duration, endTime, {
        name,
        type: 'custom'
      });
    }
    
    return result;
  }, [isActive]);

  const measureAsync = useCallback(async (name, fn) => {
    if (!isActive) return await fn();
    
    const startTime = performance.now();
    const result = await fn();
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    if (collectorRef.current) {
      collectorRef.current.recordMetric('custom_measurement', duration, endTime, {
        name,
        type: 'async'
      });
    }
    
    return result;
  }, [isActive]);

  // Toggle monitoring
  const toggleMonitoring = useCallback(() => {
    setIsActive(prev => !prev);
  }, []);

  // Get performance report
  const getReport = useCallback(() => {
    if (collectorRef.current) {
      return collectorRef.current.generateReport();
    }
    return null;
  }, []);

  // Clear metrics
  const clearMetrics = useCallback(() => {
    if (collectorRef.current) {
      collectorRef.current.clear();
      setMetrics({});
      setWarnings([]);
    }
  }, []);

  // Export metrics
  const exportMetrics = useCallback((format = 'json') => {
    const report = getReport();
    if (!report) return null;
    
    switch (format) {
      case 'json':
        return JSON.stringify(report, null, 2);
      case 'csv':
        return convertToCSV(report);
      default:
        return report;
    }
  }, [getReport]);

  // Helper function to convert to CSV
  const convertToCSV = (data) => {
    const lines = [];
    
    // Add headers
    lines.push('Metric,Value,Timestamp');
    
    // Add metrics
    Object.entries(data.metrics).forEach(([key, value]) => {
      lines.push(`${key},${value},${data.timestamp}`);
    });
    
    return lines.join('\n');
  };

  // Get performance score (0-100)
  const getPerformanceScore = useCallback(() => {
    const { fps_latest, memory_latest, apiResponse_avg, render_avg } = metrics;
    let score = 100;
    
    // Deduct points based on performance
    if (fps_latest < 30) score -= 30;
    else if (fps_latest < 45) score -= 15;
    else if (fps_latest < 55) score -= 5;
    
    if (memory_latest > 80) score -= 30;
    else if (memory_latest > 60) score -= 15;
    else if (memory_latest > 40) score -= 5;
    
    if (apiResponse_avg > 3000) score -= 30;
    else if (apiResponse_avg > 1000) score -= 15;
    else if (apiResponse_avg > 500) score -= 5;
    
    if (render_avg > 100) score -= 30;
    else if (render_avg > 50) score -= 15;
    else if (render_avg > 25) score -= 5;
    
    return Math.max(0, Math.min(100, score));
  }, [metrics]);

  return {
    // State
    metrics,
    warnings,
    isActive,
    
    // Controls
    toggleMonitoring,
    startMonitoring: () => setIsActive(true),
    stopMonitoring: () => setIsActive(false),
    
    // Measurement utilities
    measure,
    measureAsync,
    recordRender,
    
    // Data access
    getReport,
    getPerformanceScore,
    clearMetrics,
    exportMetrics,
    
    // Real-time values (convenience accessors)
    fps: metrics.fps_latest || 0,
    memory: metrics.memory_latest || 0,
    apiResponseTime: metrics.apiResponse_avg || 0,
    renderTime: metrics.render_avg || 0,
    performanceScore: getPerformanceScore(),
    
    // Detailed metrics
    memoryDetails: metrics.memory_details || {},
    
    // Samples
    getSamples: (type, count) => {
      if (collectorRef.current) {
        return collectorRef.current.getSamples(type, count);
      }
      return [];
    },
    
    // Collector reference (advanced usage)
    collector: collectorRef.current
  };
};

// Hook for measuring component render performance
export const useRenderPerformance = (componentName, options = {}) => {
  const { enabled = true, threshold = 100 } = options;
  const renderCountRef = useRef(0);
  const mountTimeRef = useRef(0);
  const lastRenderTimeRef = useRef(0);
  
  const { recordRender } = usePerformanceMonitor({
    enabled,
    collectMetrics: ['render']
  });
  
  useEffect(() => {
    if (!enabled) return;
    
    const startTime = performance.now();
    renderCountRef.current++;
    
    // Record initial mount
    if (renderCountRef.current === 1) {
      mountTimeRef.current = startTime;
    }
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      lastRenderTimeRef.current = renderTime;
      
      if (recordRender) {
        recordRender(componentName, renderTime);
        
        // Log slow renders in development
        if (renderTime > threshold && process.env.NODE_ENV === 'development') {
          console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
        }
      }
    };
  }, [componentName, enabled, threshold, recordRender]);
  
  return {
    renderCount: renderCountRef.current,
    lastRenderTime: lastRenderTimeRef.current,
    mountTime: mountTimeRef.current
  };
};

export default usePerformanceMonitor;