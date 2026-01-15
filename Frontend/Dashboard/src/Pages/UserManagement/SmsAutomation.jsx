import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  MessageSquare, Settings, BarChart3, Filter, Users, Clock,
  AlertCircle, CheckCircle, XCircle, RefreshCw, Search,
  ChevronRight, Bell, Play, Pause, Zap, Activity,
  Download, Upload, Shield, Server, Loader,
  Menu, X, Home, Database, Cpu, Globe
} from 'lucide-react';
import api from '../../api'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext';
import { useWebSocket } from '../../components/SMSAutomation/hooks/useWebSocket'
import { useSMSData } from '../../components/SMSAutomation/hooks/useSMSData'
import {
  EnhancedSelect,
  DateRangePicker,
  ConfirmationModal,
  LoadingOverlay,
  EmptyState,
  StatisticsCard,
  ResponsiveContainer,
  ChartTooltip
} from '../../components/ServiceManagement/Shared/components'

// Import child components
import GatewayManager from '../../components/SMSAutomation/components/GatewayManager'
import TemplateManager from '../../components/SMSAutomation/components/TemplateManager'
import MessageManager from '../../components/SMSAutomation/components/MessageManager'
import AutomationRules from '../../components/SMSAutomation/components/AutomationRules'
import AnalyticsDashboard from '../../components/SMSAutomation/components/AnalyticsDashboard'
import QueueMonitor from '../../components/SMSAutomation/components/QueueMonitor'
import ExportManager from '../../components/SMSAutomation/components/ExportManager'

// Import performance monitoring
import usePerformanceMonitor from './hooks/usePerformanceMonitor';

const SMSAutomation = () => {
  const { isAuthenticated, user } = useAuth();
  const { theme } = useTheme();
  
  // State management
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    today: { total: 0, sent: 0, delivered: 0, failed: 0, cost: 0 },
    month: { total: 0, sent: 0, delivered: 0, failed: 0, cost: 0 },
    gateways: { total: 0, online: 0, offline: 0, healthy: 0 },
    queue: { pending: 0, processing: 0, failed: 0 },
    performance: { avgDeliveryTime: 0, successRate: 0, throughput: 0 }
  });
  
  // Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Performance monitoring
  const { performanceMetrics } = usePerformanceMonitor({
    enabled: true,
    collectMetrics: ['fps', 'memory', 'apiResponse']
  });

  // WebSocket integration
  const { 
    isConnected, 
    realTimeUpdates,
    subscribeToGateway,
    unsubscribeFromGateway,
    connectionError
  } = useWebSocket({
    autoConnect: true,
    reconnectInterval: 5000
  });

  // Custom hook for SMS data management
  const {
    gateways,
    templates,
    messages,
    rules,
    queue,
    analytics,
    refreshData,
    loading,
    error: dataError
  } = useSMSData();

  // Ref for performance monitoring
  const renderCountRef = useRef(0);
  
  // Theme classes with responsive breakpoints
  const themeClasses = useMemo(() => ({
    container: theme === 'dark' 
      ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white'
      : 'bg-gradient-to-br from-gray-50 via-white to-gray-50 text-gray-800',
    
    card: theme === 'dark'
      ? 'bg-gray-800/80 backdrop-blur-md border border-gray-700 shadow-xl'
      : 'bg-white/95 backdrop-blur-md border border-gray-200 shadow-lg',
    
    input: theme === 'dark'
      ? 'bg-gray-700/70 border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
      : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
    
    button: {
      primary: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg transition-all duration-200',
      secondary: theme === 'dark'
        ? 'bg-gray-700/80 hover:bg-gray-600/90 text-gray-200 border border-gray-600 hover:border-gray-500'
        : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 hover:border-gray-400 shadow-sm',
      danger: 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white',
      success: 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white',
      warning: 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white'
    },
    
    // Mobile-specific classes
    mobileMenu: theme === 'dark'
      ? 'bg-gray-900 border-r border-gray-800'
      : 'bg-white border-r border-gray-200'
  }), [theme]);

  // Tab configuration with responsive icons
  const tabs = useMemo(() => [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, color: 'blue', mobileIcon: Home },
    { id: 'messages', label: 'Messages', icon: MessageSquare, color: 'green', mobileIcon: MessageSquare },
    { id: 'templates', label: 'Templates', icon: Users, color: 'purple', mobileIcon: Users },
    { id: 'gateways', label: 'Gateways', icon: Server, color: 'orange', mobileIcon: Server },
    { id: 'automation', label: 'Automation', icon: Zap, color: 'yellow', mobileIcon: Zap },
    { id: 'queue', label: 'Queue', icon: Clock, color: 'indigo', mobileIcon: Clock },
    { id: 'analytics', label: 'Analytics', icon: Filter, color: 'pink', mobileIcon: BarChart3 },
    { id: 'export', label: 'Export', icon: Download, color: 'teal', mobileIcon: Download }
  ], []);

  // Fetch initial data with error handling and retry logic
  useEffect(() => {
    if (isAuthenticated) {
      fetchInitialData();
    }
  }, [isAuthenticated]);

  const fetchInitialData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Parallel API calls with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      const [statsRes, performanceRes] = await Promise.all([
        api.get('/api/sms/dashboard/', { signal: controller.signal }),
        api.get('/api/sms/performance/', { signal: controller.signal }).catch(() => ({ data: {} }))
      ]);
      
      clearTimeout(timeoutId);
      
      setStats({
        ...statsRes.data,
        performance: performanceRes.data || stats.performance
      });
      
    } catch (err) {
      if (err.name === 'AbortError') {
        setError('Request timeout. Please check your connection.');
      } else {
        setError(err.response?.data?.error || 'Failed to load SMS automation data');
      }
      console.error('Error fetching SMS data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle real-time updates
  useEffect(() => {
    if (realTimeUpdates) {
      handleRealTimeUpdate(realTimeUpdates);
    }
  }, [realTimeUpdates]);

  const handleRealTimeUpdate = useCallback((update) => {
    switch (update.type) {
      case 'sms_sent':
        setStats(prev => ({
          ...prev,
          today: {
            ...prev.today,
            sent: prev.today.sent + 1,
            total: prev.today.total + 1
          }
        }));
        break;
        
      case 'sms_delivered':
        setStats(prev => ({
          ...prev,
          today: {
            ...prev.today,
            delivered: prev.today.delivered + 1
          }
        }));
        break;
        
      case 'gateway_update':
        // Update gateway stats
        break;
        
      case 'queue_update':
        setStats(prev => ({
          ...prev,
          queue: update.data
        }));
        break;
        
      case 'performance_update':
        setStats(prev => ({
          ...prev,
          performance: update.data
        }));
        break;
    }
  }, []);

  // Optimized search function with debouncing
  const debouncedSearch = useCallback((searchTerm, data, fields) => {
    if (!searchTerm.trim()) return data;
    
    const lowerSearch = searchTerm.toLowerCase();
    return data.filter(item => 
      fields.some(field => 
        String(item[field] || '').toLowerCase().includes(lowerSearch)
      )
    );
  }, []);

  // Mobile responsive handlers
  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
  }, []);

  // Performance optimization: Memoize expensive calculations
  const performanceData = useMemo(() => ({
    deliveryRate: stats.today.total > 0 
      ? Math.round((stats.today.delivered / stats.today.total) * 100)
      : 0,
    estimatedQueueTime: stats.queue.pending > 0
      ? Math.round(stats.queue.pending / (stats.performance.throughput || 1))
      : 0,
    gatewayHealth: stats.gateways.total > 0
      ? Math.round((stats.gateways.healthy / stats.gateways.total) * 100)
      : 0
  }), [stats]);

  // Render count for debugging
  useEffect(() => {
    renderCountRef.current += 1;
    if (renderCountRef.current > 10) {
      console.warn('High render count detected in SMSAutomation:', renderCountRef.current);
    }
  });

  if (!isAuthenticated) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${themeClasses.container}`}>
        <div className="text-center p-8">
          <Shield className="w-16 h-16 mx-auto mb-6 text-gray-400" />
          <h2 className="text-2xl font-bold mb-3">Authentication Required</h2>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Please log in to access the SMS automation system
          </p>
          <button
            onClick={() => window.location.href = '/login'}
            className={`px-6 py-3 rounded-lg font-medium ${themeClasses.button.primary}`}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <LoadingOverlay 
        isVisible={true} 
        message="Loading SMS Automation Dashboard..." 
        theme={theme}
        progress={true}
      />
    );
  }

  return (
    <div className={`min-h-screen transition-all duration-300 ${themeClasses.container}`}>
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:hidden
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        ${themeClasses.mobileMenu}
      `}>
        <div className="flex flex-col h-full">
          {/* Mobile Header */}
          <div className="p-4 border-b border-gray-700 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-blue-500" />
                SMS
              </h2>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.mobileIcon || tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      activeTab === tab.id
                        ? theme === 'dark'
                          ? `bg-${tab.color}-900/30 text-${tab.color}-400 border-l-4 border-${tab.color}-400`
                          : `bg-${tab.color}-50 text-${tab.color}-600 border-l-4 border-${tab.color}-500`
                        : theme === 'dark'
                        ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                    {tab.id === 'queue' && stats.queue.pending > 0 && (
                      <span className="ml-auto px-2 py-1 text-xs bg-red-500 text-white rounded-full">
                        {stats.queue.pending}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Mobile Footer */}
          <div className="p-4 border-t border-gray-700 dark:border-gray-600">
            <div className="flex items-center justify-between text-sm">
              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                {user?.username || 'User'}
              </span>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <span>{isConnected ? 'Online' : 'Offline'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 z-30">
          <div className={`flex flex-col flex-1 border-r ${theme === 'dark' ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'}`}>
            {/* Logo */}
            <div className="p-6">
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <MessageSquare className="w-8 h-8 text-blue-500" />
                SMS Automation
              </h1>
              <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Enterprise SMS Platform
              </p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      activeTab === tab.id
                        ? theme === 'dark'
                          ? `bg-${tab.color}-900/30 text-${tab.color}-400`
                          : `bg-${tab.color}-50 text-${tab.color}-600`
                        : theme === 'dark'
                        ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                    {tab.id === 'queue' && stats.queue.pending > 0 && (
                      <span className="ml-auto px-2 py-1 text-xs bg-red-500 text-white rounded-full">
                        {stats.queue.pending}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* User Info */}
            <div className={`p-4 border-t ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
                }`}>
                  <Users className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user?.username || 'User'}</p>
                  <p className={`text-xs truncate ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {user?.email || 'admin@example.com'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:pl-64">
          {/* Top Bar */}
          <div className={`sticky top-0 z-20 px-4 sm:px-6 py-4 border-b backdrop-blur-md ${
            theme === 'dark' 
              ? 'border-gray-800 bg-gray-900/95' 
              : 'border-gray-200 bg-white/95'
          }`}>
            <div className="flex items-center justify-between">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Menu className="w-6 h-6" />
              </button>

              {/* Page Title */}
              <div className="flex-1 lg:ml-4">
                <h2 className="text-lg sm:text-xl font-semibold">
                  {tabs.find(t => t.id === activeTab)?.label || 'Dashboard'}
                </h2>
                <p className={`text-sm hidden sm:block ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {activeTab === 'dashboard' && 'Real-time monitoring and analytics'}
                  {activeTab === 'messages' && 'Send and manage SMS messages'}
                  {activeTab === 'templates' && 'Create and manage message templates'}
                  {activeTab === 'gateways' && 'Configure SMS gateway connections'}
                  {activeTab === 'automation' && 'Set up automated SMS triggers'}
                  {activeTab === 'queue' && 'Monitor and manage processing queue'}
                  {activeTab === 'analytics' && 'Detailed analytics and reports'}
                  {activeTab === 'export' && 'Export data in various formats'}
                </p>
              </div>

              {/* Status Indicators */}
              <div className="flex items-center gap-3">
                {/* Connection Status */}
                <div className="hidden sm:flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                  }`} />
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {isConnected ? 'Live' : 'Offline'}
                  </span>
                </div>

                {/* Performance Indicator */}
                {performanceMetrics.fps > 0 && (
                  <div className="hidden md:flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-gray-400" />
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {Math.round(performanceMetrics.fps)} FPS
                    </span>
                  </div>
                )}

                {/* Refresh Button */}
                <button
                  onClick={refreshData}
                  disabled={loading}
                  className={`p-2 rounded-lg ${themeClasses.button.secondary}`}
                  title="Refresh data"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Error Alert */}
          {(error || dataError || connectionError) && (
            <div className="mx-4 mt-4">
              <div className={`p-4 rounded-lg flex items-start justify-between ${
                theme === 'dark' 
                  ? 'bg-red-900/30 text-red-400 border border-red-800/50' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Error</p>
                    <p className="text-sm mt-1">{error || dataError || connectionError}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setError(null);
                    if (connectionError) refreshData();
                  }}
                  className="p-1 hover:opacity-70"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Content Area */}
          <div className="p-4 sm:p-6">
            {/* Dashboard Overview (Only shown on dashboard tab) */}
            {activeTab === 'dashboard' && (
              <div className="mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatisticsCard
                    title="Today's Messages"
                    value={stats.today.total}
                    change={stats.today.total > 0 ? performanceData.deliveryRate : 0}
                    icon={MessageSquare}
                    theme={theme}
                    trend={stats.today.total > 0 ? 'up' : 'neutral'}
                    format="number"
                    size="lg"
                  />
                  
                  <StatisticsCard
                    title="Delivery Rate"
                    value={performanceData.deliveryRate}
                    change={5}
                    icon={CheckCircle}
                    theme={theme}
                    trend="up"
                    format="percentage"
                    size="lg"
                  />
                  
                  <StatisticsCard
                    title="Queue Pending"
                    value={stats.queue.pending}
                    change={performanceData.estimatedQueueTime}
                    icon={Clock}
                    theme={theme}
                    format="number"
                    size="lg"
                    suffix="messages"
                    subText={`~${performanceData.estimatedQueueTime}m to clear`}
                  />
                  
                  <StatisticsCard
                    title="Gateway Health"
                    value={performanceData.gatewayHealth}
                    change={stats.gateways.online - stats.gateways.offline}
                    icon={Server}
                    theme={theme}
                    trend={stats.gateways.healthy > stats.gateways.total / 2 ? 'up' : 'down'}
                    format="percentage"
                    size="lg"
                    subText={`${stats.gateways.online}/${stats.gateways.total} online`}
                  />
                </div>
              </div>
            )}

            {/* Main Content Container */}
            <div className={`rounded-xl overflow-hidden ${themeClasses.card}`}>
              {/* Tab Navigation (Desktop) */}
              <div className={`hidden lg:flex border-b ${
                theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
              }`}>
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-shrink-0 px-6 py-3 font-medium text-sm transition-all duration-300 flex items-center gap-2 ${
                      activeTab === tab.id
                        ? theme === 'dark'
                          ? `text-${tab.color}-400 border-b-2 border-${tab.color}-400`
                          : `text-${tab.color}-600 border-b-2 border-${tab.color}-600`
                        : theme === 'dark'
                        ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/50'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                    {tab.id === 'queue' && stats.queue.pending > 0 && (
                      <span className="ml-2 px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                        {stats.queue.pending}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="p-4 sm:p-6">
                {activeTab === 'dashboard' && (
                  <div className="space-y-6">
                    <AnalyticsDashboard
                      stats={stats}
                      analytics={analytics}
                      theme={theme}
                    />
                    
                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <button
                        onClick={() => setActiveTab('messages')}
                        className={`p-4 rounded-lg text-left transition-all hover:scale-[1.02] ${themeClasses.card}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                            <MessageSquare className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-medium">Send SMS</h3>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              Send a new message
                            </p>
                          </div>
                        </div>
                      </button>
                      
                      <button
                        onClick={() => setActiveTab('queue')}
                        className={`p-4 rounded-lg text-left transition-all hover:scale-[1.02] ${themeClasses.card}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
                            <Clock className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-medium">Queue Monitor</h3>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              {stats.queue.pending} pending messages
                            </p>
                          </div>
                        </div>
                      </button>
                      
                      <button
                        onClick={() => setActiveTab('gateways')}
                        className={`p-4 rounded-lg text-left transition-all hover:scale-[1.02] ${themeClasses.card}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-green-100 text-green-600">
                            <Server className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-medium">Gateway Status</h3>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              {stats.gateways.online}/{stats.gateways.total} online
                            </p>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'messages' && (
                  <MessageManager
                    messages={messages}
                    loading={loading}
                    theme={theme}
                    refreshData={refreshData}
                  />
                )}

                {activeTab === 'templates' && (
                  <TemplateManager
                    templates={templates}
                    loading={loading}
                    theme={theme}
                    refreshData={refreshData}
                  />
                )}

                {activeTab === 'gateways' && (
                  <GatewayManager
                    gateways={gateways}
                    loading={loading}
                    theme={theme}
                    refreshData={refreshData}
                  />
                )}

                {activeTab === 'automation' && (
                  <AutomationRules
                    rules={rules}
                    loading={loading}
                    theme={theme}
                    refreshData={refreshData}
                  />
                )}

                {activeTab === 'queue' && (
                  <QueueMonitor
                    queue={queue}
                    loading={loading}
                    theme={theme}
                    refreshData={refreshData}
                    realTimeUpdates={realTimeUpdates}
                  />
                )}

                {activeTab === 'analytics' && (
                  <AnalyticsDashboard
                    stats={stats}
                    analytics={analytics}
                    theme={theme}
                    detailed={true}
                  />
                )}

                {activeTab === 'export' && (
                  <ExportManager
                    messages={messages}
                    templates={templates}
                    gateways={gateways}
                    rules={rules}
                    theme={theme}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Performance Footer */}
          <div className={`px-4 sm:px-6 py-3 border-t ${
            theme === 'dark' ? 'border-gray-800 bg-gray-900/50' : 'border-gray-200 bg-gray-50/50'
          }`}>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm">
              <div className={`flex items-center gap-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <span className="flex items-center gap-1">
                  <Database className="w-3 h-3" />
                  {messages.length} messages
                </span>
                <span className="flex items-center gap-1">
                  <Cpu className="w-3 h-3" />
                  {Math.round(performanceMetrics.memory || 0)} MB
                </span>
                <span className="flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  {gateways.filter(g => g.is_online).length} gateways online
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                {!isConnected && (
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    theme === 'dark' ? 'bg-yellow-900/50 text-yellow-400' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    Reconnecting...
                  </span>
                )}
                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                  v2.0.0 • {new Date().getFullYear()}
                </span>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* WebSocket Connection Status (Mobile) */}
      {!isConnected && (
        <div className="fixed bottom-4 right-4 p-3 bg-yellow-500 text-white rounded-lg shadow-lg animate-pulse lg:hidden">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">Reconnecting...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SMSAutomation;