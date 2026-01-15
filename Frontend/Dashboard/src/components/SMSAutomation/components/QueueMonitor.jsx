import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  Clock, Play, Pause, AlertCircle, CheckCircle, XCircle,
  Filter, Search, RefreshCw, Loader, Trash2, ChevronDown,
  ChevronUp, BarChart3, Zap, Users, Calendar, Activity,
  MessageSquare, Eye, EyeOff, Cpu, Database, Server, CheckSquare
} from 'lucide-react';
import api from '../../../api'
import { 
  EnhancedSelect,
  ConfirmationModal,
  LoadingOverlay,
  StatisticsCard
} from '../../ServiceManagement/Shared/components'

import { formatQueueAge, formatProcessingTime } from '../utils/formatters'

const QueueMonitor = ({ queue, loading, theme, refreshData, realTimeUpdates }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [gatewayFilter, setGatewayFilter] = useState('all');
  const [expandedItem, setExpandedItem] = useState(null);
  const [showClearModal, setShowClearModal] = useState(false);
  const [processingBatch, setProcessingBatch] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMessages, setSelectedMessages] = useState(new Set());
  const [batchSize, setBatchSize] = useState(100);
  const [processingSpeed, setProcessingSpeed] = useState('normal');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // Advanced filter states
  const [ageFilter, setAgeFilter] = useState('all');
  const [attemptsFilter, setAttemptsFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: null, end: null });

  const processingRef = useRef(false);

  // Get unique gateways from queue
  const gateways = useMemo(() => {
    const gatewaySet = new Set();
    queue.forEach(item => {
      if (item.message_gateway) {
        gatewaySet.add(item.message_gateway);
      }
    });
    return Array.from(gatewaySet);
  }, [queue]);

  // Queue statistics
  const queueStats = useMemo(() => {
    const stats = {
      total: queue.length,
      pending: queue.filter(q => q.status === 'pending').length,
      processing: queue.filter(q => q.status === 'processing').length,
      completed: queue.filter(q => q.status === 'completed').length,
      failed: queue.filter(q => q.status === 'failed').length,
      avgProcessingTime: 0,
      oldestPending: null,
      newestPending: null,
      peakHour: null,
      throughputPerMinute: 0,
      estimatedTimeToComplete: 0,
      successRate: 0
    };

    // Calculate average processing time
    const completedItems = queue.filter(q => q.status === 'completed');
    if (completedItems.length > 0) {
      const totalTime = completedItems.reduce((sum, item) => {
        if (item.processing_started && item.processing_ended) {
          const start = new Date(item.processing_started);
          const end = new Date(item.processing_ended);
          return sum + (end - start);
        }
        return sum;
      }, 0);
      stats.avgProcessingTime = totalTime / completedItems.length;
    }

    // Find oldest and newest pending items
    const pendingItems = queue.filter(q => q.status === 'pending');
    if (pendingItems.length > 0) {
      const sortedByAge = [...pendingItems].sort((a, b) => 
        new Date(a.queued_at) - new Date(b.queued_at)
      );
      stats.oldestPending = sortedByAge[0];
      stats.newestPending = sortedByAge[sortedByAge.length - 1];
    }

    // Calculate throughput (messages processed per minute)
    const lastHour = new Date(Date.now() - 60 * 60 * 1000);
    const recentProcessed = queue.filter(q => 
      q.status === 'completed' && 
      new Date(q.processing_ended) > lastHour
    ).length;
    stats.throughputPerMinute = recentProcessed / 60;

    // Estimate time to complete pending messages
    if (stats.pending > 0 && stats.throughputPerMinute > 0) {
      stats.estimatedTimeToComplete = Math.ceil(stats.pending / stats.throughputPerMinute);
    }

    // Calculate success rate
    const attemptedItems = queue.filter(q => 
      q.status === 'completed' || q.status === 'failed'
    );
    if (attemptedItems.length > 0) {
      stats.successRate = (completedItems.length / attemptedItems.length) * 100;
    }

    return stats;
  }, [queue]);

  // Filter queue items with advanced filtering
  const filteredQueue = useMemo(() => {
    let filtered = queue;
    
    // Apply basic filters
    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }
    
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(item => item.priority === priorityFilter);
    }
    
    if (gatewayFilter !== 'all') {
      filtered = filtered.filter(item => item.message_gateway === gatewayFilter);
    }
    
    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.message_phone?.toLowerCase().includes(searchLower) ||
        item.message_preview?.toLowerCase().includes(searchLower) ||
        item.error_message?.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply advanced filters if enabled
    if (showAdvancedFilters) {
      if (ageFilter !== 'all') {
        const now = new Date();
        filtered = filtered.filter(item => {
          const queuedAt = new Date(item.queued_at);
          const ageHours = (now - queuedAt) / (1000 * 60 * 60);
          
          switch (ageFilter) {
            case 'under_1h':
              return ageHours < 1;
            case '1h_6h':
              return ageHours >= 1 && ageHours < 6;
            case '6h_24h':
              return ageHours >= 6 && ageHours < 24;
            case 'over_24h':
              return ageHours >= 24;
            default:
              return true;
          }
        });
      }
      
      if (attemptsFilter !== 'all') {
        filtered = filtered.filter(item => {
          switch (attemptsFilter) {
            case 'none':
              return item.processing_attempts === 0;
            case '1_3':
              return item.processing_attempts >= 1 && item.processing_attempts <= 3;
            case 'over_3':
              return item.processing_attempts > 3;
            default:
              return true;
          }
        });
      }
      
      if (dateRange.start || dateRange.end) {
        filtered = filtered.filter(item => {
          const queuedAt = new Date(item.queued_at);
          if (dateRange.start && queuedAt < new Date(dateRange.start)) return false;
          if (dateRange.end && queuedAt > new Date(dateRange.end)) return false;
          return true;
        });
      }
    }
    
    return filtered;
  }, [queue, statusFilter, priorityFilter, gatewayFilter, searchTerm, showAdvancedFilters, ageFilter, attemptsFilter, dateRange]);

  // Sort queue by priority and age
  const sortedQueue = useMemo(() => {
    return [...filteredQueue].sort((a, b) => {
      // First by status: pending > processing > failed > completed
      const statusOrder = { pending: 0, processing: 1, failed: 2, completed: 3 };
      const statusDiff = statusOrder[a.status] - statusOrder[b.status];
      if (statusDiff !== 0) return statusDiff;

      // Then by priority (higher number = higher priority)
      const priorityDiff = b.priority - a.priority;
      if (priorityDiff !== 0) return priorityDiff;

      // Then by queue time (oldest first)
      return new Date(a.queued_at) - new Date(b.queued_at);
    });
  }, [filteredQueue]);

  // Handle queue actions
  const handleProcessBatch = useCallback(async () => {
    if (processingRef.current || queueStats.pending === 0) return;
    
    try {
      processingRef.current = true;
      setProcessingBatch(true);
      
      const speedConfig = {
        slow: { batchSize: 50, delay: 2000 },
        normal: { batchSize: 100, delay: 1000 },
        fast: { batchSize: 200, delay: 500 }
      };
      
      const config = speedConfig[processingSpeed] || speedConfig.normal;
      
      const response = await api.post('/api/sms/queue/process_batch/', {
        batch_size: config.batchSize,
        priority: priorityFilter === 'all' ? undefined : priorityFilter,
        gateway: gatewayFilter === 'all' ? undefined : gatewayFilter
      });
      
      if (response.data.success) {
        // Add delay to show processing animation
        setTimeout(() => {
          refreshData();
          setProcessingBatch(false);
          processingRef.current = false;
        }, config.delay);
      } else {
        setProcessingBatch(false);
        processingRef.current = false;
      }
    } catch (error) {
      console.error('Process batch failed:', error);
      setProcessingBatch(false);
      processingRef.current = false;
    }
  }, [queueStats.pending, processingSpeed, priorityFilter, gatewayFilter, refreshData]);

  const handleClearFailed = useCallback(async (ageHours = 24) => {
    try {
      const response = await api.post('/api/sms/queue/clear_failed/', {
        age_hours: ageHours
      });
      
      if (response.data.success) {
        refreshData();
        setShowClearModal(false);
      }
    } catch (error) {
      console.error('Clear failed failed:', error);
    }
  }, [refreshData]);

  const handleRetryFailed = useCallback(async () => {
    try {
      const failedItems = queue.filter(q => q.status === 'failed');
      
      await Promise.all(
        failedItems.map(item => 
          api.post(`/api/sms/messages/${item.message_id}/retry/`)
        )
      );
      
      refreshData();
    } catch (error) {
      console.error('Retry failed failed:', error);
    }
  }, [queue, refreshData]);

  // Handle batch selection
  const handleSelectAll = useCallback(() => {
    if (selectedMessages.size === sortedQueue.length) {
      setSelectedMessages(new Set());
    } else {
      setSelectedMessages(new Set(sortedQueue.map(item => item.id)));
    }
  }, [sortedQueue, selectedMessages.size]);

  const handleBulkRetry = useCallback(async () => {
    if (selectedMessages.size === 0) return;
    
    try {
      await Promise.all(
        Array.from(selectedMessages).map(id => {
          const item = queue.find(q => q.id === id);
          return api.post(`/api/sms/messages/${item.message_id}/retry/`);
        })
      );
      
      setSelectedMessages(new Set());
      refreshData();
    } catch (error) {
      console.error('Bulk retry failed:', error);
    }
  }, [selectedMessages, queue, refreshData]);

  const handleBulkDelete = useCallback(async () => {
    if (selectedMessages.size === 0) return;
    
    try {
      await Promise.all(
        Array.from(selectedMessages).map(id => 
          api.delete(`/api/sms/queue/${id}/`)
        )
      );
      
      setSelectedMessages(new Set());
      refreshData();
    } catch (error) {
      console.error('Bulk delete failed:', error);
    }
  }, [selectedMessages, refreshData]);

  // Auto-refresh queue
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      if (!processingRef.current) {
        refreshData();
      }
    }, 10000); // Refresh every 10 seconds
    
    return () => clearInterval(interval);
  }, [autoRefresh, refreshData]);

  // Handle real-time updates
  useEffect(() => {
    if (realTimeUpdates && realTimeUpdates.type === 'queue_update') {
      // Refresh queue data
      refreshData();
    }
  }, [realTimeUpdates, refreshData]);

  // Reset filters
  const resetFilters = useCallback(() => {
    setStatusFilter('all');
    setPriorityFilter('all');
    setGatewayFilter('all');
    setSearchTerm('');
    setAgeFilter('all');
    setAttemptsFilter('all');
    setDateRange({ start: null, end: null });
    setSelectedMessages(new Set());
  }, []);

  if (loading) {
    return <LoadingOverlay isVisible={true} message="Loading queue..." theme={theme} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Clock className="w-6 h-6 text-indigo-500" />
            Queue Monitor
            {autoRefresh && (
              <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Live
              </span>
            )}
          </h2>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Real-time monitoring and management of SMS processing queue
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
            }`} />
            <span>Auto-refresh</span>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`p-1 rounded ${
                theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
              }`}
            >
              {autoRefresh ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            </button>
          </div>
          
          <button
            onClick={handleProcessBatch}
            disabled={processingBatch || queueStats.pending === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              processingBatch || queueStats.pending === 0
                ? 'opacity-50 cursor-not-allowed'
                : ''
            } ${
              theme === 'dark' 
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                : 'bg-indigo-500 hover:bg-indigo-600 text-white'
            }`}
          >
            {processingBatch ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Zap className="w-4 h-4" />
            )}
            Process Batch ({queueStats.pending})
          </button>
        </div>
      </div>

      {/* Queue Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <StatisticsCard
          title="Pending"
          value={queueStats.pending}
          icon={Clock}
          theme={theme}
          trend="neutral"
          format="number"
          size="sm"
        />
        
        <StatisticsCard
          title="Processing"
          value={queueStats.processing}
          icon={Activity}
          theme={theme}
          trend="neutral"
          format="number"
          size="sm"
        />
        
        <StatisticsCard
          title="Failed"
          value={queueStats.failed}
          icon={AlertCircle}
          theme={theme}
          trend="down"
          format="number"
          size="sm"
        />
        
        <StatisticsCard
          title="Avg Time"
          value={Math.round(queueStats.avgProcessingTime / 1000)}
          icon={BarChart3}
          theme={theme}
          format="time"
          size="sm"
        />
        
        <StatisticsCard
          title="Success Rate"
          value={queueStats.successRate}
          icon={CheckCircle}
          theme={theme}
          trend="up"
          format="percentage"
          size="sm"
        />
        
        <StatisticsCard
          title="Throughput"
          value={queueStats.throughputPerMinute.toFixed(1)}
          icon={Cpu}
          theme={theme}
          format="number"
          size="sm"
          suffix="/min"
        />
      </div>

      {/* Queue Insights */}
      {queueStats.pending > 0 && (
        <div className={`p-4 rounded-lg border ${
          theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h4 className="font-medium mb-1">Queue Insights</h4>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <span className={`flex items-center gap-1 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  <Clock className="w-3 h-3" />
                  Oldest: {queueStats.oldestPending ? formatQueueAge(queueStats.oldestPending.queued_at) : 'N/A'}
                </span>
                
                <span className={`flex items-center gap-1 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  <Cpu className="w-3 h-3" />
                  Est. completion: {queueStats.estimatedTimeToComplete > 0 
                    ? `${queueStats.estimatedTimeToComplete} minutes` 
                    : 'N/A'}
                </span>
                
                <span className={`flex items-center gap-1 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  <Database className="w-3 h-3" />
                  Memory usage: {Math.round(queue.length * 0.5)} KB
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <EnhancedSelect
                value={processingSpeed}
                onChange={setProcessingSpeed}
                options={[
                  { value: 'slow', label: 'Slow (50/min)' },
                  { value: 'normal', label: 'Normal (100/min)' },
                  { value: 'fast', label: 'Fast (200/min)' }
                ]}
                theme={theme}
                size="sm"
              />
              
              <button
                onClick={() => setBatchSize(batchSize === 100 ? 50 : 100)}
                className={`px-3 py-1 text-sm rounded ${
                  theme === 'dark' 
                    ? 'bg-gray-700 hover:bg-gray-600' 
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                Batch: {batchSize}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Actions */}
      <div className={`p-4 rounded-lg border ${
        theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
      }`}>
        <div className="space-y-4">
          {/* Basic Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
              }`} size={16} />
              <input
                type="text"
                placeholder="Search queue..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-10 pr-4 py-2 border rounded-lg w-full ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-800'
                }`}
              />
            </div>
            
            <EnhancedSelect
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'pending', label: 'Pending', icon: <Clock className="w-4 h-4" /> },
                { value: 'processing', label: 'Processing', icon: <Activity className="w-4 h-4" /> },
                { value: 'failed', label: 'Failed', icon: <XCircle className="w-4 h-4" /> },
                { value: 'completed', label: 'Completed', icon: <CheckCircle className="w-4 h-4" /> }
              ]}
              theme={theme}
            />
            
            <EnhancedSelect
              value={priorityFilter}
              onChange={setPriorityFilter}
              options={[
                { value: 'all', label: 'All Priorities' },
                { value: 'urgent', label: 'Urgent', color: 'red' },
                { value: 'high', label: 'High', color: 'orange' },
                { value: 'normal', label: 'Normal', color: 'blue' },
                { value: 'low', label: 'Low', color: 'gray' }
              ]}
              theme={theme}
            />
            
            <EnhancedSelect
              value={gatewayFilter}
              onChange={setGatewayFilter}
              options={[
                { value: 'all', label: 'All Gateways' },
                ...gateways.map(gateway => ({ value: gateway, label: gateway }))
              ]}
              theme={theme}
            />
          </div>

          {/* Advanced Filters Toggle */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`flex items-center gap-1 text-sm ${
                theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {showAdvancedFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              Advanced Filters
            </button>
            
            <div className="flex items-center gap-2">
              <button
                onClick={resetFilters}
                className={`px-3 py-1 text-sm rounded ${
                  theme === 'dark' 
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                Reset Filters
              </button>
              
              <button
                onClick={refreshData}
                className={`px-3 py-1 text-sm rounded flex items-center gap-1 ${
                  theme === 'dark' 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                <RefreshCw className="w-3 h-3" />
                Refresh
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className={`p-4 rounded-lg border ${
              theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <EnhancedSelect
                  value={ageFilter}
                  onChange={setAgeFilter}
                  options={[
                    { value: 'all', label: 'All Ages' },
                    { value: 'under_1h', label: 'Under 1 hour' },
                    { value: '1h_6h', label: '1-6 hours' },
                    { value: '6h_24h', label: '6-24 hours' },
                    { value: 'over_24h', label: 'Over 24 hours' }
                  ]}
                  theme={theme}
                  size="sm"
                />
                
                <EnhancedSelect
                  value={attemptsFilter}
                  onChange={setAttemptsFilter}
                  options={[
                    { value: 'all', label: 'All Attempts' },
                    { value: 'none', label: 'No attempts' },
                    { value: '1_3', label: '1-3 attempts' },
                    { value: 'over_3', label: 'Over 3 attempts' }
                  ]}
                  theme={theme}
                  size="sm"
                />
                
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={dateRange.start || ''}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    className={`px-3 py-2 border rounded-lg w-full ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-800'
                    }`}
                    placeholder="Start date"
                  />
                  <span>to</span>
                  <input
                    type="date"
                    value={dateRange.end || ''}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    className={`px-3 py-2 border rounded-lg w-full ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-800'
                    }`}
                    placeholder="End date"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Bulk Actions */}
          {selectedMessages.size > 0 && (
            <div className={`p-4 rounded-lg border ${
              theme === 'dark' ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'
            }`}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-blue-500" />
                  <span>{selectedMessages.size} items selected</span>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleBulkRetry}
                    className={`px-3 py-1 text-sm rounded flex items-center gap-1 ${
                      theme === 'dark' 
                        ? 'bg-green-600 hover:bg-green-700 text-white' 
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                  >
                    <RefreshCw className="w-3 h-3" />
                    Retry Selected
                  </button>
                  
                  <button
                    onClick={handleBulkDelete}
                    className={`px-3 py-1 text-sm rounded flex items-center gap-1 ${
                      theme === 'dark' 
                        ? 'bg-red-600 hover:bg-red-700 text-white' 
                        : 'bg-red-500 hover:bg-red-600 text-white'
                    }`}
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete Selected
                  </button>
                  
                  <button
                    onClick={() => setSelectedMessages(new Set())}
                    className={`px-3 py-1 text-sm rounded ${
                      theme === 'dark' 
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    }`}
                  >
                    Clear Selection
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Queue Table */}
      <div className={`rounded-lg border overflow-hidden ${
        theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y">
            <thead className={`${
              theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'
            }`}>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase">
                  <input
                    type="checkbox"
                    checked={selectedMessages.size === sortedQueue.length && sortedQueue.length > 0}
                    onChange={handleSelectAll}
                    className={`rounded ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600' 
                        : 'bg-white border-gray-300'
                    }`}
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase">
                  Message Details
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase">
                  Priority
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase">
                  Age
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase">
                  Processing
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase">
                  Gateway
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            
            <tbody className={`divide-y ${
              theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'
            }`}>
              {sortedQueue.slice(0, 100).map((item) => (
                <tr 
                  key={item.id}
                  className={`hover:${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'} ${
                    selectedMessages.has(item.id) ? (theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-50') : ''
                  }`}
                >
                  {/* Selection Checkbox */}
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedMessages.has(item.id)}
                      onChange={(e) => {
                        const newSelected = new Set(selectedMessages);
                        if (e.target.checked) {
                          newSelected.add(item.id);
                        } else {
                          newSelected.delete(item.id);
                        }
                        setSelectedMessages(newSelected);
                      }}
                      className={`rounded ${
                        theme === 'dark' 
                          ? 'bg-gray-700 border-gray-600' 
                          : 'bg-white border-gray-300'
                      }`}
                    />
                  </td>
                  
                  {/* Status */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {item.status === 'pending' && (
                        <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                      )}
                      {item.status === 'processing' && (
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                      )}
                      {item.status === 'failed' && (
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                      )}
                      {item.status === 'completed' && (
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                      )}
                      <span className="capitalize">{item.status}</span>
                    </div>
                  </td>
                  
                  {/* Message Details */}
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium truncate max-w-xs">
                        {item.message_phone || 'Unknown'}
                      </div>
                      {item.message_preview && (
                        <div className={`text-xs truncate max-w-xs ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          <MessageSquare className="w-3 h-3 inline mr-1" />
                          {item.message_preview}
                        </div>
                      )}
                      {item.error_message && (
                        <div className="text-xs text-red-500 truncate max-w-xs mt-1">
                          <AlertCircle className="w-3 h-3 inline mr-1" />
                          {item.error_message}
                        </div>
                      )}
                    </div>
                  </td>
                  
                  {/* Priority */}
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      item.priority === 'urgent'
                        ? 'bg-red-100 text-red-800'
                        : item.priority === 'high'
                        ? 'bg-orange-100 text-orange-800'
                        : item.priority === 'normal'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {item.priority}
                    </span>
                  </td>
                  
                  {/* Queue Age */}
                  <td className="px-4 py-3">
                    <div className="text-sm">{formatQueueAge(item.queued_at)}</div>
                    <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {item.queued_at && new Date(item.queued_at).toLocaleTimeString()}
                    </div>
                  </td>
                  
                  {/* Processing Time */}
                  <td className="px-4 py-3">
                    {item.processing_started ? (
                      <div>
                        <div className="text-sm">
                          {formatProcessingTime(
                            item.processing_ended 
                              ? new Date(item.processing_ended) - new Date(item.processing_started)
                              : new Date() - new Date(item.processing_started)
                          )}
                        </div>
                        <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {item.processing_attempts || 0}/{item.max_processing_attempts || 3} attempts
                        </div>
                      </div>
                    ) : (
                      <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        Not started
                      </span>
                    )}
                  </td>
                  
                  {/* Gateway */}
                  <td className="px-4 py-3">
                    {item.message_gateway ? (
                      <div className="flex items-center gap-1">
                        <Server className="w-3 h-3" />
                        <span className="text-sm truncate max-w-[100px]">
                          {item.message_gateway}
                        </span>
                      </div>
                    ) : (
                      <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        Default
                      </span>
                    )}
                  </td>
                  
                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setExpandedItem(expandedItem === item.id ? null : item.id);
                        }}
                        className={`p-1 rounded ${
                          theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                        }`}
                        title="View details"
                      >
                        {expandedItem === item.id ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                      
                      {item.status === 'failed' && item.processing_attempts < (item.max_processing_attempts || 3) && (
                        <button
                          onClick={async () => {
                            try {
                              await api.post(`/api/sms/messages/${item.message_id}/retry/`);
                              refreshData();
                            } catch (error) {
                              console.error('Retry failed:', error);
                            }
                          }}
                          className={`p-1 rounded ${
                            theme === 'dark' ? 'hover:bg-green-900' : 'hover:bg-green-100'
                          } text-green-600`}
                          title="Retry"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      )}
                      
                      {item.status === 'pending' && (
                        <button
                          onClick={async () => {
                            try {
                              await api.post(`/api/sms/messages/${item.message_id}/cancel/`);
                              refreshData();
                            } catch (error) {
                              console.error('Cancel failed:', error);
                            }
                          }}
                          className={`p-1 rounded ${
                            theme === 'dark' ? 'hover:bg-red-900' : 'hover:bg-red-100'
                          } text-red-600`}
                          title="Cancel"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Expanded Item Details */}
        {expandedItem && (
          <div className={`p-4 border-t ${
            theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
          }`}>
            {(() => {
              const item = sortedQueue.find(q => q.id === expandedItem);
              if (!item) return null;
              
              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Message Details */}
                    <div>
                      <h4 className="font-medium mb-2">Message Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                            Message ID:
                          </span>
                          <span>{item.message_id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                            Phone Number:
                          </span>
                          <span>{item.message_phone}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                            Recipient:
                          </span>
                          <span>{item.message_recipient || 'Unknown'}</span>
                        </div>
                        {item.error_message && (
                          <div className="mt-2">
                            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                              Error:
                            </span>
                            <pre className={`mt-1 p-2 rounded text-xs ${
                              theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                            }`}>
                              {item.error_message}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Processing History */}
                    <div>
                      <h4 className="font-medium mb-2">Processing History</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                            Queued:
                          </span>
                          <span>{new Date(item.queued_at).toLocaleString()}</span>
                        </div>
                        
                        {item.processing_started && (
                          <div className="flex justify-between">
                            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                              Processing Started:
                            </span>
                            <span>{new Date(item.processing_started).toLocaleString()}</span>
                          </div>
                        )}
                        
                        {item.processing_ended && (
                          <div className="flex justify-between">
                            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                              Processing Ended:
                            </span>
                            <span>{new Date(item.processing_ended).toLocaleString()}</span>
                          </div>
                        )}
                        
                        {item.last_error_at && (
                          <div className="flex justify-between">
                            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                              Last Error:
                            </span>
                            <span>{new Date(item.last_error_at).toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-4 border-t border-gray-700 dark:border-gray-600">
                    {item.status === 'failed' && item.processing_attempts < (item.max_processing_attempts || 3) && (
                      <button
                        onClick={async () => {
                          try {
                            await api.post(`/api/sms/messages/${item.message_id}/retry/`);
                            refreshData();
                          } catch (error) {
                            console.error('Retry failed:', error);
                          }
                        }}
                        className={`px-3 py-1 text-sm rounded flex items-center gap-1 ${
                          theme === 'dark' 
                            ? 'bg-green-600 hover:bg-green-700 text-white' 
                            : 'bg-green-500 hover:bg-green-600 text-white'
                        }`}
                      >
                        <RefreshCw className="w-3 h-3" />
                        Retry Now
                      </button>
                    )}
                    
                    <button
                      onClick={() => {
                        // Navigate to message details
                        window.location.href = `/sms/messages/${item.message_id}`;
                      }}
                      className={`px-3 py-1 text-sm rounded flex items-center gap-1 ${
                        theme === 'dark' 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                          : 'bg-blue-500 hover:bg-blue-600 text-white'
                      }`}
                    >
                      <Eye className="w-3 h-3" />
                      View Message
                    </button>
                    
                    <button
                      onClick={() => {
                        setExpandedItem(null);
                      }}
                      className={`px-3 py-1 text-sm rounded ${
                        theme === 'dark' 
                          ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                      }`}
                    >
                      Close Details
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
        
        {/* Empty State */}
        {sortedQueue.length === 0 && (
          <div className="text-center py-12">
            <Database className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">Queue is empty</h3>
            <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                ? 'No items match your current filters'
                : 'All messages have been processed'
              }
            </p>
            {(searchTerm || statusFilter !== 'all' || priorityFilter !== 'all') && (
              <button
                onClick={resetFilters}
                className={`px-4 py-2 rounded-lg ${
                  theme === 'dark' 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Queue Management Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
          Showing {Math.min(sortedQueue.length, 100)} of {sortedQueue.length} queue items
          {queueStats.pending > 0 && ` • ${queueStats.pending} pending`}
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowClearModal(true)}
            disabled={queueStats.failed === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              queueStats.failed === 0
                ? 'opacity-50 cursor-not-allowed'
                : theme === 'dark'
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            Clear Failed ({queueStats.failed})
          </button>
          
          <button
            onClick={handleRetryFailed}
            disabled={queueStats.failed === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              queueStats.failed === 0
                ? 'opacity-50 cursor-not-allowed'
                : theme === 'dark'
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            Retry All Failed
          </button>
        </div>
      </div>

      {/* Clear Confirmation Modal */}
      <ConfirmationModal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        onConfirm={() => handleClearFailed(24)}
        title="Clear Failed Queue Items"
        message={`Are you sure you want to clear ${queueStats.failed} failed queue items older than 24 hours? This action cannot be undone.`}
        confirmText={`Clear ${queueStats.failed} Items`}
        cancelText="Cancel"
        type="danger"
        theme={theme}
        additionalActions={[
          {
            label: 'Clear all failed items',
            action: () => handleClearFailed(0),
            variant: 'danger'
          },
          {
            label: 'Clear items older than 1 week',
            action: () => handleClearFailed(168),
            variant: 'secondary'
          }
        ]}
      />
    </div>
  );
};

export default QueueMonitor;